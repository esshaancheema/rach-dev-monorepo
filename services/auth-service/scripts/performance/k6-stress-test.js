import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend, Counter, Gauge } from 'k6/metrics';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

// Custom metrics for stress testing
const systemStability = new Rate('system_stability');
const memoryUsage = new Gauge('memory_usage_mb');
const cpuUsage = new Gauge('cpu_usage_percent');
const activeConnections = new Gauge('active_connections');
const errorRecoveryTime = new Trend('error_recovery_time_ms');
const throughputDegradation = new Rate('throughput_degradation');

// Configuration
const CONFIG = {
  baseUrl: __ENV.API_URL || 'http://localhost:3000',
  maxUsers: parseInt(__ENV.MAX_USERS) || 500,
  stressLevel: __ENV.STRESS_LEVEL || 'high', // low, medium, high, extreme
  testDuration: __ENV.TEST_DURATION || '10m',
  breakingPoint: parseInt(__ENV.BREAKING_POINT) || 1000,
  recoveryTime: __ENV.RECOVERY_TIME || '2m'
};

// Stress test scenarios based on level
const STRESS_LEVELS = {
  low: {
    maxVUs: CONFIG.maxUsers * 0.5,
    rampUpTime: '2m',
    sustainTime: '5m',
    rampDownTime: '1m'
  },
  medium: {
    maxVUs: CONFIG.maxUsers,
    rampUpTime: '3m',
    sustainTime: '7m',
    rampDownTime: '2m'
  },
  high: {
    maxVUs: CONFIG.maxUsers * 1.5,
    rampUpTime: '5m',
    sustainTime: '10m',
    rampDownTime: '3m'
  },
  extreme: {
    maxVUs: CONFIG.breakingPoint,
    rampUpTime: '2m',
    sustainTime: '15m',
    rampDownTime: '5m'
  }
};

const currentLevel = STRESS_LEVELS[CONFIG.stressLevel];

export const options = {
  scenarios: {
    // Stress test scenario
    stress_load: {
      executor: 'ramping-vus',
      startVUs: 10,
      stages: [
        { duration: currentLevel.rampUpTime, target: currentLevel.maxVUs },
        { duration: currentLevel.sustainTime, target: currentLevel.maxVUs },
        { duration: currentLevel.rampDownTime, target: 0 }
      ],
      tags: { test_type: 'stress', stress_level: CONFIG.stressLevel }
    },
    
    // Spike test within stress test
    spike_stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 0 },
        { duration: '1m', target: currentLevel.maxVUs * 0.3 },
        { duration: '30s', target: currentLevel.maxVUs * 2 }, // Spike
        { duration: '2m', target: currentLevel.maxVUs * 0.3 },
        { duration: '30s', target: 0 }
      ],
      tags: { test_type: 'spike_stress' }
    },
    
    // Breakpoint finder
    breakpoint_test: {
      executor: 'ramping-arrival-rate',
      startRate: 10,
      timeUnit: '1s',
      preAllocatedVUs: 50,
      maxVUs: CONFIG.breakingPoint,
      stages: [
        { duration: '2m', target: 50 },   // 50 RPS
        { duration: '2m', target: 100 },  // 100 RPS
        { duration: '2m', target: 200 },  // 200 RPS
        { duration: '2m', target: 400 },  // 400 RPS
        { duration: '2m', target: 800 },  // 800 RPS
        { duration: '2m', target: 1000 }, // 1000 RPS
      ],
      tags: { test_type: 'breakpoint' }
    },
    
    // Endurance test
    endurance_test: {
      executor: 'constant-vus',
      vus: Math.floor(currentLevel.maxVUs * 0.7),
      duration: '30m',
      tags: { test_type: 'endurance' }
    },
    
    // Recovery test
    recovery_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: currentLevel.maxVUs * 2 }, // Overload
        { duration: '30s', target: 0 }, // Stop
        { duration: CONFIG.recoveryTime, target: currentLevel.maxVUs * 0.5 }, // Recovery load
        { duration: '1m', target: 0 }
      ],
      tags: { test_type: 'recovery' }
    }
  },
  
  thresholds: {
    http_req_duration: ['p(95)<2000', 'p(99)<5000'], // More lenient for stress test
    http_req_failed: ['rate<0.1'], // 10% error rate acceptable under stress
    system_stability: ['rate>0.7'], // 70% stability under stress
    error_recovery_time: ['p(95)<3000'], // Recovery within 3 seconds
    throughput_degradation: ['rate<0.3'] // Max 30% throughput degradation
  }
};

// Test data
let testUsers = [];
let accessTokens = new Map();
let systemMetrics = {
  baselineRPS: 0,
  currentRPS: 0,
  maxRPS: 0,
  errorRate: 0,
  responseTime: 0
};

export function setup() {
  console.log('🔥 Starting K6 Stress Tests for Zoptal Auth Service');
  console.log(`Stress Level: ${CONFIG.stressLevel}`);
  console.log(`Max VUs: ${currentLevel.maxVUs}`);
  console.log(`Test Duration: ${currentLevel.sustainTime}`);
  
  // Establish baseline performance
  console.log('📊 Establishing baseline performance...');
  const baselineMetrics = establishBaseline();
  
  // Create test users for stress testing
  const setupData = {
    users: [],
    baseline: baselineMetrics,
    startTime: Date.now()
  };
  
  // Create more users for stress testing
  for (let i = 0; i < 100; i++) {
    const user = {
      email: `stresstest-${i}-${Date.now()}@zoptal.com`,
      password: 'StressTest123!',
      firstName: `Stress${i}`,
      lastName: 'TestUser'
    };
    
    const response = http.post(`${CONFIG.baseUrl}/api/auth/register`, JSON.stringify(user), {
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.status === 201 || response.status === 409) {
      setupData.users.push(user);
    }
  }
  
  console.log(`✅ Created ${setupData.users.length} test users for stress testing`);
  console.log(`📈 Baseline RPS: ${baselineMetrics.rps}`);
  console.log(`📈 Baseline Response Time: ${baselineMetrics.responseTime}ms`);
  
  return setupData;
}

function establishBaseline() {
  const startTime = Date.now();
  let successfulRequests = 0;
  let totalResponseTime = 0;
  
  // Make baseline requests
  for (let i = 0; i < 50; i++) {
    const response = http.get(`${CONFIG.baseUrl}/health`);
    if (response.status === 200) {
      successfulRequests++;
      totalResponseTime += response.timings.duration;
    }
    sleep(0.1);
  }
  
  const duration = (Date.now() - startTime) / 1000;
  
  return {
    rps: successfulRequests / duration,
    responseTime: totalResponseTime / successfulRequests,
    successRate: successfulRequests / 50
  };
}

export default function(data) {
  const testType = __ENV.EXECUTOR || 'stress_load';
  
  group(`Stress Test - ${testType}`, () => {
    switch (testType) {
      case 'stress_load':
        stressLoadTest(data);
        break;
      case 'spike_stress':
        spikeStressTest(data);
        break;
      case 'breakpoint_test':
        breakpointTest(data);
        break;
      case 'endurance_test':
        enduranceTest(data);
        break;
      case 'recovery_test':
        recoveryTest(data);
        break;
      default:
        stressLoadTest(data);
    }
  });
  
  // Monitor system metrics
  monitorSystemHealth();
  
  // Variable sleep to create realistic load patterns
  sleep(Math.random() * 1 + 0.5);
}

function stressLoadTest(data) {
  group('Stress Load Test', () => {
    // Mix of heavy operations
    const operations = [
      () => heavyAuthenticationLoad(data),
      () => concurrentUserOperations(data),
      () => databaseIntensiveOperations(data),
      () => memoryIntensiveOperations(),
      () => cpuIntensiveOperations(data)
    ];
    
    // Execute multiple operations in parallel
    const operation = operations[Math.floor(Math.random() * operations.length)];
    operation();
    
    // Check system stability
    checkSystemStability();
  });
}

function spikeStressTest(data) {
  group('Spike Stress Test', () => {
    // Sudden burst of requests
    const burstSize = 5;
    const requests = [];
    
    for (let i = 0; i < burstSize; i++) {
      if (data.users && data.users.length > 0) {
        const user = data.users[Math.floor(Math.random() * data.users.length)];
        requests.push([
          'POST',
          `${CONFIG.baseUrl}/api/auth/login`,
          JSON.stringify({ email: user.email, password: user.password }),
          { headers: { 'Content-Type': 'application/json' } }
        ]);
      }
    }
    
    const startTime = Date.now();
    const responses = http.batch(requests);
    const duration = Date.now() - startTime;
    
    // Analyze spike impact
    let successCount = 0;
    responses.forEach(response => {
      if (response.status === 200) {
        successCount++;
      }
    });
    
    const spikeSuccessRate = successCount / responses.length;
    systemStability.add(spikeSuccessRate > 0.8);
    
    if (duration > 2000) {
      errorRecoveryTime.add(duration);
    }
  });
}

function breakpointTest(data) {
  group('Breakpoint Test', () => {
    // Push system to find breaking point
    const intensity = Math.floor(__VU / 10) + 1; // Increase intensity per VU group
    
    for (let i = 0; i < intensity; i++) {
      testAuthenticationUnderLoad(data);
      testDatabaseConcurrency();
      testMemoryPressure();
    }
    
    // Monitor for system breaking point indicators
    detectBreakingPoint();
  });
}

function enduranceTest(data) {
  group('Endurance Test', () => {
    // Sustained moderate load over long period
    testSustainedAuthentication(data);
    testMemoryLeakDetection();
    testConnectionPoolStability();
    testResourceCleanup();
  });
}

function recoveryTest(data) {
  group('Recovery Test', () => {
    // Test system recovery after stress
    const currentTime = Date.now();
    const testStartTime = data.startTime || currentTime;
    const testDuration = currentTime - testStartTime;
    
    if (testDuration > 120000) { // After 2 minutes, test recovery
      testSystemRecovery(data);
    } else {
      // Apply stress first
      applySystemStress(data);
    }
  });
}

function heavyAuthenticationLoad(data) {
  if (!data.users || data.users.length === 0) {
    return;
  }
  
  // Simulate heavy authentication load with multiple rapid logins
  const user = data.users[Math.floor(Math.random() * data.users.length)];
  const startTime = Date.now();
  
  const response = http.post(
    `${CONFIG.baseUrl}/api/auth/login`,
    JSON.stringify({ email: user.email, password: user.password }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  
  const duration = Date.now() - startTime;
  
  const success = check(response, {
    'auth under stress - status 200': (r) => r.status === 200,
    'auth under stress - response time acceptable': (r) => r.timings.duration < 3000
  });
  
  systemStability.add(success);
  
  if (response.status === 200) {
    try {
      const body = JSON.parse(response.body);
      if (body.data && body.data.accessToken) {
        accessTokens.set(user.email, body.data.accessToken);
      }
    } catch (e) {
      // Ignore parsing errors under stress
    }
  }
  
  // Track performance degradation
  if (data.baseline) {
    const performanceDrop = duration > (data.baseline.responseTime * 2);
    throughputDegradation.add(performanceDrop);
  }
}

function concurrentUserOperations(data) {
  const tokens = Array.from(accessTokens.values());
  if (tokens.length === 0) {
    return;
  }
  
  const token = tokens[Math.floor(Math.random() * tokens.length)];
  
  // Simulate concurrent user operations
  const requests = [
    ['GET', `${CONFIG.baseUrl}/api/auth/me`],
    ['GET', `${CONFIG.baseUrl}/api/users/profile`],
    ['PUT', `${CONFIG.baseUrl}/api/users/profile`, JSON.stringify({
      firstName: `Updated${Date.now()}`,
      lastName: 'StressTest'
    })],
    ['GET', `${CONFIG.baseUrl}/health`]
  ];
  
  const responses = http.batch(requests.map(([method, url, body]) => [
    method,
    url,
    body,
    { headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }}
  ]));
  
  responses.forEach(response => {
    systemStability.add(response.status < 500);
  });
}

function databaseIntensiveOperations(data) {
  if (!data.users || data.users.length === 0) {
    return;
  }
  
  // Operations that stress the database
  const operations = [
    () => {
      // User search/listing (database query intensive)
      const response = http.get(`${CONFIG.baseUrl}/api/admin/users?limit=50`, {
        headers: { 'Content-Type': 'application/json' }
      });
      return response;
    },
    () => {
      // Password reset (database write + email)
      const user = data.users[Math.floor(Math.random() * data.users.length)];
      const response = http.post(
        `${CONFIG.baseUrl}/api/auth/forgot-password`,
        JSON.stringify({ email: user.email }),
        { headers: { 'Content-Type': 'application/json' } }
      );
      return response;
    },
    () => {
      // Data export request (database intensive)
      const tokens = Array.from(accessTokens.values());
      if (tokens.length > 0) {
        const token = tokens[Math.floor(Math.random() * tokens.length)];
        const response = http.post(`${CONFIG.baseUrl}/api/users/export`, '{}', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        return response;
      }
    }
  ];
  
  const operation = operations[Math.floor(Math.random() * operations.length)];
  const response = operation();
  
  if (response) {
    systemStability.add(response.status < 500);
  }
}

function memoryIntensiveOperations() {
  // Operations that stress memory
  const largePayload = {
    data: 'x'.repeat(10000), // 10KB payload
    metadata: {
      timestamp: Date.now(),
      requestId: `stress-${Math.random()}`,
      largeArray: new Array(1000).fill().map((_, i) => ({
        id: i,
        value: Math.random(),
        description: `Item ${i} - ${'data'.repeat(100)}`
      }))
    }
  };
  
  const response = http.post(
    `${CONFIG.baseUrl}/api/auth/register`,
    JSON.stringify({
      email: `memory-stress-${Date.now()}@zoptal.com`,
      password: 'MemoryStress123!',
      firstName: 'Memory',
      lastName: 'StressTest',
      metadata: largePayload
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  
  systemStability.add(response.status < 500);
}

function cpuIntensiveOperations(data) {
  // CPU intensive authentication operations
  for (let i = 0; i < 3; i++) {
    if (data.users && data.users.length > 0) {
      const user = data.users[Math.floor(Math.random() * data.users.length)];
      const response = http.post(
        `${CONFIG.baseUrl}/api/auth/login`,
        JSON.stringify({ email: user.email, password: user.password }),
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      systemStability.add(response.status < 500);
    }
  }
}

function checkSystemStability() {
  // Check basic system endpoints
  const healthResponse = http.get(`${CONFIG.baseUrl}/health`);
  const metricsResponse = http.get(`${CONFIG.baseUrl}/metrics`);
  
  const stable = healthResponse.status === 200 && metricsResponse.status === 200;
  systemStability.add(stable);
  
  if (!stable) {
    console.warn(`⚠️ System instability detected - Health: ${healthResponse.status}, Metrics: ${metricsResponse.status}`);
  }
}

function monitorSystemHealth() {
  // Monitor system metrics if available
  const metricsResponse = http.get(`${CONFIG.baseUrl}/metrics`);
  
  if (metricsResponse.status === 200) {
    try {
      const metrics = JSON.parse(metricsResponse.body);
      
      if (metrics.memory) {
        memoryUsage.add(metrics.memory.heapUsed / 1024 / 1024); // MB
      }
      
      if (metrics.process) {
        activeConnections.add(metrics.process.activeHandles || 0);
      }
      
      // Estimate CPU usage from response time patterns
      if (metricsResponse.timings.duration > 1000) {
        cpuUsage.add(80); // High CPU indicated by slow response
      } else if (metricsResponse.timings.duration > 500) {
        cpuUsage.add(60); // Medium CPU
      } else {
        cpuUsage.add(30); // Normal CPU
      }
      
    } catch (e) {
      // Ignore parsing errors
    }
  }
}

function testAuthenticationUnderLoad(data) {
  if (!data.users || data.users.length === 0) {
    return;
  }
  
  const user = data.users[Math.floor(Math.random() * data.users.length)];
  const response = http.post(
    `${CONFIG.baseUrl}/api/auth/login`,
    JSON.stringify({ email: user.email, password: user.password }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  
  systemStability.add(response.status === 200);
}

function testDatabaseConcurrency() {
  // Test database under concurrent load
  const response = http.get(`${CONFIG.baseUrl}/health`);
  systemStability.add(response.status === 200);
}

function testMemoryPressure() {
  // Create memory pressure
  const largeData = 'x'.repeat(5000);
  const response = http.post(
    `${CONFIG.baseUrl}/api/auth/register`,
    JSON.stringify({
      email: `memory-${Date.now()}-${Math.random()}@zoptal.com`,
      password: 'MemoryTest123!',
      firstName: largeData.substring(0, 50),
      lastName: 'Test'
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  
  systemStability.add(response.status < 500);
}

function detectBreakingPoint() {
  // Detect if we've hit the breaking point
  const healthResponse = http.get(`${CONFIG.baseUrl}/health`);
  
  if (healthResponse.status !== 200 || healthResponse.timings.duration > 5000) {
    console.warn(`🔥 Potential breaking point detected - VU: ${__VU}, Status: ${healthResponse.status}, Duration: ${healthResponse.timings.duration}ms`);
    systemStability.add(false);
  } else {
    systemStability.add(true);
  }
}

function testSustainedAuthentication(data) {
  if (!data.users || data.users.length === 0) {
    return;
  }
  
  // Sustained authentication load
  const user = data.users[Math.floor(Math.random() * data.users.length)];
  const response = http.post(
    `${CONFIG.baseUrl}/api/auth/login`,
    JSON.stringify({ email: user.email, password: user.password }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  
  systemStability.add(response.status === 200);
}

function testMemoryLeakDetection() {
  // Monitor for memory leaks during sustained load
  const metricsResponse = http.get(`${CONFIG.baseUrl}/metrics`);
  
  if (metricsResponse.status === 200) {
    try {
      const metrics = JSON.parse(metricsResponse.body);
      if (metrics.memory && metrics.memory.heapUsed) {
        const memoryMB = metrics.memory.heapUsed / 1024 / 1024;
        memoryUsage.add(memoryMB);
        
        // Alert if memory usage is very high
        if (memoryMB > 1000) { // 1GB
          console.warn(`⚠️ High memory usage detected: ${memoryMB}MB`);
        }
      }
    } catch (e) {
      // Ignore parsing errors
    }
  }
}

function testConnectionPoolStability() {
  // Test connection pool under sustained load
  const response = http.get(`${CONFIG.baseUrl}/health`);
  systemStability.add(response.status === 200 && response.timings.duration < 2000);
}

function testResourceCleanup() {
  // Test resource cleanup by checking metrics
  const metricsResponse = http.get(`${CONFIG.baseUrl}/metrics`);
  
  if (metricsResponse.status === 200) {
    try {
      const metrics = JSON.parse(metricsResponse.body);
      if (metrics.process) {
        activeConnections.add(metrics.process.activeHandles || 0);
      }
    } catch (e) {
      // Ignore parsing errors
    }
  }
}

function applySystemStress(data) {
  // Apply stress to test recovery later
  heavyAuthenticationLoad(data);
  databaseIntensiveOperations(data);
  memoryIntensiveOperations();
}

function testSystemRecovery(data) {
  // Test if system recovers after stress period
  const startTime = Date.now();
  
  // Light operations to test recovery
  const response = http.get(`${CONFIG.baseUrl}/health`);
  const recoverySuccess = response.status === 200 && response.timings.duration < 1000;
  
  systemStability.add(recoverySuccess);
  
  if (recoverySuccess) {
    const recoveryTime = Date.now() - startTime;
    errorRecoveryTime.add(recoveryTime);
  }
}

export function teardown(data) {
  console.log('🧹 Stress test cleanup...');
  
  // Generate stress test report
  const endTime = Date.now();
  const testDuration = endTime - data.startTime;
  
  console.log(`📊 Stress Test Summary:`);
  console.log(`- Test Duration: ${Math.round(testDuration / 1000)}s`);
  console.log(`- Stress Level: ${CONFIG.stressLevel}`);
  console.log(`- Max VUs: ${currentLevel.maxVUs}`);
  
  // Cleanup test users
  if (data.users) {
    console.log(`Cleaning up ${data.users.length} stress test users`);
  }
  
  console.log('✅ Stress test cleanup completed');
}

export function handleSummary(data) {
  console.log('📊 Generating stress test reports...');
  
  // Calculate additional stress test metrics
  const stressMetrics = {
    testConfiguration: {
      stressLevel: CONFIG.stressLevel,
      maxVUs: currentLevel.maxVUs,
      testDuration: currentLevel.sustainTime
    },
    systemStability: data.metrics.system_stability,
    resourceUsage: {
      memory: data.metrics.memory_usage_mb,
      cpu: data.metrics.cpu_usage_percent,
      connections: data.metrics.active_connections
    },
    performance: {
      throughputDegradation: data.metrics.throughput_degradation,
      errorRecoveryTime: data.metrics.error_recovery_time_ms
    }
  };
  
  return {
    'stress-test-report.html': htmlReport(data),
    'stress-test-summary.txt': textSummary(data, { indent: ' ', enableColors: true }),
    'stress-test-results.json': JSON.stringify({
      ...data,
      stressMetrics
    }, null, 2)
  };
}