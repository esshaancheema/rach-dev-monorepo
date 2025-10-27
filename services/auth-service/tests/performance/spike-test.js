// k6 Spike Testing Script for Zoptal Auth Service
// This script tests system behavior under sudden load spikes

import { AuthAPIClient, spikeTestStages, performanceThresholds, setupTestData, cleanupTestData } from './k6-setup.js';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

// Spike test specific metrics
export const spikeRecoveryTime = new Trend('spike_recovery_time');
export const spikeErrorRate = new Rate('spike_errors');
export const resourceExhaustion = new Counter('resource_exhaustion');
export const queuedRequests = new Counter('queued_requests');

// Spike test configuration
export const options = {
  stages: spikeTestStages,
  
  // Spike-specific thresholds
  thresholds: {
    http_req_duration: ['p(95)<10000'], // 95% under 10s during spikes
    http_req_failed: ['rate<0.25'],     // Error rate under 25% during spikes
    spike_errors: ['rate<0.30'],        // Spike-specific error rate
    http_reqs: ['rate>20'],             // Minimum throughput during recovery
  },
  
  scenarios: {
    // Main spike testing scenario
    authentication_spike: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: spikeTestStages,
      gracefulRampDown: '2m',
      env: { SCENARIO: 'auth_spike' },
    },
    
    // Database spike testing
    database_spike: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: spikeTestStages.map(stage => ({ ...stage, target: Math.floor(stage.target * 0.7) })),
      gracefulRampDown: '2m',
      env: { SCENARIO: 'db_spike' },
    },
    
    // Mixed workload spike
    mixed_spike: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: spikeTestStages.map(stage => ({ ...stage, target: Math.floor(stage.target * 0.5) })),
      gracefulRampDown: '2m',
      env: { SCENARIO: 'mixed_spike' },
    },
    
    // Recovery monitoring
    recovery_monitor: {
      executor: 'constant-vus',
      vus: 3,
      duration: '23m',
      env: { SCENARIO: 'recovery_monitor' },
    },
  },
};

export function setup() {
  console.log('⚡ Starting Zoptal Auth Service Spike Test');
  console.log(`📈 Spike Targets: ${spikeTestStages.filter(s => s.target > 100).map(s => s.target).join(', ')} users`);
  console.log(`⏱️  Total Duration: 23 minutes`);
  console.log('🎯 Testing system resilience under sudden load increases');
  
  setupTestData();
  
  return {
    baseURL: __ENV.BASE_URL || 'http://localhost:3001',
    testStartTime: Date.now(),
  };
}

export default function(data) {
  const scenario = __ENV.SCENARIO || 'auth_spike';
  const client = new AuthAPIClient(data.baseURL);
  
  // Track current stage for spike detection
  const currentTime = Date.now();
  const elapsedMinutes = (currentTime - data.testStartTime) / (1000 * 60);
  const isSpike = detectSpikePhase(elapsedMinutes);
  
  switch (scenario) {
    case 'auth_spike':
      authenticationSpike(client, isSpike);
      break;
    case 'db_spike':
      databaseSpike(client, isSpike);
      break;
    case 'mixed_spike':
      mixedWorkloadSpike(client, isSpike);
      break;
    case 'recovery_monitor':
      recoveryMonitoring(client, elapsedMinutes);
      break;
    default:
      authenticationSpike(client, isSpike);
  }
}

// Authentication spike testing
function authenticationSpike(client, isSpike) {
  const userIndex = Math.floor(Math.random() * 5000) + 1;
  
  if (isSpike) {
    // During spike: rapid, aggressive authentication attempts
    performSpikeAuthenticationBehavior(client, userIndex);
  } else {
    // Normal behavior
    performNormalAuthenticationBehavior(client, userIndex);
  }
}

// Database spike testing
function databaseSpike(client, isSpike) {
  const userIndex = Math.floor(Math.random() * 1000) + 1;
  
  // Login first
  const loginResponse = client.login({
    email: `spikeuser${userIndex}@test.com`,
    password: 'SpikeTest123!'
  });
  
  if (loginResponse.status === 200) {
    if (isSpike) {
      // Aggressive database operations during spike
      performSpikeDatabaseBehavior(client);
    } else {
      // Normal database operations
      performNormalDatabaseBehavior(client);
    }
    
    client.logout();
  }
  
  trackSpikeResponse(loginResponse, 'db_spike_login', isSpike);
}

// Mixed workload spike testing
function mixedWorkloadSpike(client, isSpike) {
  const workloadType = Math.random();
  
  if (workloadType < 0.5) {
    authenticationSpike(client, isSpike);
  } else {
    databaseSpike(client, isSpike);
  }
  
  // Add health checks during spikes
  if (isSpike && Math.random() < 0.3) {
    const healthResponse = client.healthCheck();
    trackSpikeResponse(healthResponse, 'mixed_health_check', isSpike);
  }
}

// Recovery monitoring
function recoveryMonitoring(client, elapsedMinutes) {
  const isSpike = detectSpikePhase(elapsedMinutes);
  const isRecovery = detectRecoveryPhase(elapsedMinutes);
  
  // Continuous health monitoring
  const healthResponse = client.healthCheck();
  trackSpikeResponse(healthResponse, 'recovery_health', isSpike);
  
  // Monitor metrics during critical phases
  if (isSpike || isRecovery) {
    const metricsResponse = client.getMetrics();
    trackSpikeResponse(metricsResponse, 'recovery_metrics', isSpike);
    
    if (metricsResponse.status === 200) {
      analyzeMetricsDuringSpike(metricsResponse);
    }
  }
  
  // Check circuit breaker status
  if (Math.random() < 0.2) {
    const cbResponse = client.getCircuitBreakerStatus();
    if (cbResponse && cbResponse.status === 200) {
      analyzeCircuitBreakerState(cbResponse);
    }
  }
  
  sleep(isSpike ? 5 : 10); // Monitor more frequently during spikes
}

// Spike behavior implementations
function performSpikeAuthenticationBehavior(client, userIndex) {
  // Rapid authentication attempts during spike
  const attempts = Math.floor(Math.random() * 3) + 2; // 2-4 attempts
  
  for (let i = 0; i < attempts; i++) {
    const authType = Math.random();
    
    if (authType < 0.4) {
      // Registration attempts
      const newUser = {
        email: `spikeuser${userIndex}_${Date.now()}_${i}@test.com`,
        password: 'SpikeTest123!',
        profile: {
          firstName: `Spike${userIndex}`,
          lastName: `User${i}`,
        }
      };
      
      const response = client.register(newUser);
      trackSpikeResponse(response, 'spike_registration', true);
      
    } else if (authType < 0.8) {
      // Login attempts
      const credentials = {
        email: `spikeuser${(userIndex % 500) + 1}@test.com`,
        password: 'SpikeTest123!'
      };
      
      const response = client.login(credentials);
      trackSpikeResponse(response, 'spike_login', true);
      
      if (response.status === 200) {
        // Quick authenticated action
        const profileResponse = client.getProfile();
        trackSpikeResponse(profileResponse, 'spike_profile', true);
        client.logout();
      }
      
    } else {
      // Failed login attempts (test rate limiting under spike)
      const badCredentials = {
        email: `spikeuser${userIndex}@test.com`,
        password: 'WrongPassword123!'
      };
      
      const response = client.login(badCredentials);
      trackSpikeResponse(response, 'spike_failed_login', true);
    }
    
    // Minimal sleep during spike
    sleep(Math.random() * 0.1);
  }
}

function performNormalAuthenticationBehavior(client, userIndex) {
  // Normal authentication behavior
  const credentials = {
    email: `normaluser${userIndex}@test.com`,
    password: 'NormalTest123!'
  };
  
  const response = client.login(credentials);
  trackSpikeResponse(response, 'normal_login', false);
  
  if (response.status === 200) {
    // Normal user activity
    client.getProfile();
    sleep(1);
    client.logout();
  }
  
  sleep(Math.random() * 2 + 1);
}

function performSpikeDatabaseBehavior(client) {
  // Aggressive database operations
  const operations = Math.floor(Math.random() * 8) + 5; // 5-12 operations
  
  for (let i = 0; i < operations; i++) {
    const operationType = Math.random();
    
    if (operationType < 0.7) {
      // Profile updates (write operations)
      const response = client.updateProfile({
        firstName: `SpikeUpdate${i}`,
        lastName: `Test${Date.now()}`,
        spikeTest: true,
        updateNumber: i
      });
      trackSpikeResponse(response, 'spike_db_update', true);
    } else {
      // Profile reads
      const response = client.getProfile();
      trackSpikeResponse(response, 'spike_db_read', true);
    }
    
    // No sleep between operations to stress database
  }
}

function performNormalDatabaseBehavior(client) {
  // Normal database behavior
  const response = client.getProfile();
  trackSpikeResponse(response, 'normal_db_read', false);
  
  if (Math.random() < 0.3) {
    const updateResponse = client.updateProfile({
      firstName: 'NormalUpdate',
      lastName: 'User'
    });
    trackSpikeResponse(updateResponse, 'normal_db_update', false);
  }
  
  sleep(1);
}

// Utility functions
function detectSpikePhase(elapsedMinutes) {
  // Spike phases: 1.17-4.17 min and 7.17-10.17 min
  return (elapsedMinutes >= 1.17 && elapsedMinutes <= 4.17) ||
         (elapsedMinutes >= 7.17 && elapsedMinutes <= 10.17);
}

function detectRecoveryPhase(elapsedMinutes) {
  // Recovery phases: immediately after spikes
  return (elapsedMinutes >= 4.17 && elapsedMinutes <= 6) ||
         (elapsedMinutes >= 10.17 && elapsedMinutes <= 12);
}

function trackSpikeResponse(response, operation, isSpike) {
  const isError = response.status >= 400;
  const isSlow = response.timings.duration > 5000;
  
  spikeErrorRate.add(isError);
  
  // Track resource exhaustion indicators
  if (response.status === 503 || response.status === 429) {
    resourceExhaustion.add(1);
  }
  
  // Track queued requests (slow responses during spike)
  if (isSpike && response.timings.duration > 3000) {
    queuedRequests.add(1);
  }
  
  // Log critical issues during spikes
  if (isSpike && (response.status >= 500 || response.timings.duration > 15000)) {
    console.log(`🚨 Critical spike issue in ${operation}: Status ${response.status}, Duration ${response.timings.duration}ms`);
  }
  
  check(response, {
    [`${operation} - not completely failed`]: (r) => r.status !== 0,
    [`${operation} - response time under 30s`]: (r) => r.timings.duration < 30000,
  });
}

function analyzeMetricsDuringSpike(metricsResponse) {
  try {
    const metrics = metricsResponse.json();
    
    // Check for degradation indicators
    if (metrics.degradation && !metrics.degradation.isHealthy) {
      console.log(`📊 System degradation detected: ${metrics.degradation.degradedServices.length} services affected`);
    }
    
    // Check memory usage
    if (metrics.memory && metrics.memory.heapUsed / metrics.memory.heapTotal > 0.9) {
      console.log(`🧠 High memory usage: ${Math.round((metrics.memory.heapUsed / metrics.memory.heapTotal) * 100)}%`);
    }
    
  } catch (e) {
    // Ignore parsing errors during stress
  }
}

function analyzeCircuitBreakerState(cbResponse) {
  try {
    const cbStatus = cbResponse.json();
    
    Object.entries(cbStatus.circuitBreakers || {}).forEach(([service, state]) => {
      if (state.state === 'OPEN') {
        console.log(`⚡ Circuit breaker OPEN for ${service}`);
      } else if (state.state === 'HALF_OPEN') {
        console.log(`🔄 Circuit breaker HALF_OPEN for ${service}`);
      }
    });
    
  } catch (e) {
    // Ignore parsing errors
  }
}

export function teardown(data) {
  console.log('🧹 Spike test cleanup');
  cleanupTestData();
  console.log('✅ Spike test completed');
  
  console.log('📊 Spike Test Summary:');
  console.log(`   Maximum spike: 1000 concurrent users`);
  console.log(`   Spike duration: 3 minutes each`);
  console.log(`   Recovery monitoring: Continuous`);
}

export function handleSummary(data) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  // Enhanced summary for spike testing
  const spikeMetrics = {
    maxSpike: 1000,
    spikeDuration: 3,
    totalRequests: data.metrics.http_reqs ? data.metrics.http_reqs.count : 0,
    errorRate: data.metrics.http_req_failed ? data.metrics.http_req_failed.rate : 0,
    spikeErrorRate: data.metrics.spike_errors ? data.metrics.spike_errors.rate : 0,
    resourceExhaustion: data.metrics.resource_exhaustion ? data.metrics.resource_exhaustion.count : 0,
    queuedRequests: data.metrics.queued_requests ? data.metrics.queued_requests.count : 0,
    avgResponseTime: data.metrics.http_req_duration ? data.metrics.http_req_duration.avg : 0,
    p95ResponseTime: data.metrics.http_req_duration ? data.metrics.http_req_duration['p(95)'] : 0,
    p99ResponseTime: data.metrics.http_req_duration ? data.metrics.http_req_duration['p(99)'] : 0,
  };
  
  return {
    [`reports/spike-test-${timestamp}.html`]: htmlReport(data),
    [`reports/spike-test-${timestamp}.json`]: JSON.stringify({
      ...data,
      spikeMetrics
    }, null, 2),
    [`reports/spike-metrics-${timestamp}.json`]: JSON.stringify(spikeMetrics, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}