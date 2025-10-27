// k6 Endurance Testing Script for Zoptal Auth Service
// This script tests system stability over extended periods

import { AuthAPIClient, config, generateTestUser, performanceThresholds } from './k6-setup.js';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter, Gauge } from 'k6/metrics';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

// Endurance-specific metrics
export const memoryLeakIndicator = new Trend('memory_leak_indicator');
export const resourceDrift = new Trend('resource_drift');
export const longtermErrorRate = new Rate('longterm_errors');
export const degradationOverTime = new Counter('degradation_over_time');
export const currentMemoryUsage = new Gauge('current_memory_usage_mb');

// Extended endurance test configuration (2 hours)
export const options = {
  stages: [
    { duration: '5m', target: 20 },   // Ramp up
    { duration: '110m', target: 20 }, // Steady state for ~2 hours
    { duration: '5m', target: 0 },    // Ramp down
  ],
  
  // Endurance-specific thresholds
  thresholds: {
    http_req_duration: ['p(95)<3000'],     // Stable response times
    http_req_failed: ['rate<0.02'],        // Very low error rate
    longterm_errors: ['rate<0.01'],        // Even lower long-term error rate
    memory_leak_indicator: ['avg<1000'],   // Memory usage shouldn't grow significantly
    resource_drift: ['avg<500'],           // Resource usage should be stable
  },
  
  scenarios: {
    // Main endurance scenario
    steady_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '5m', target: 20 },
        { duration: '110m', target: 20 },
        { duration: '5m', target: 0 },
      ],
      gracefulRampDown: '2m',
      env: { SCENARIO: 'steady_load' },
    },
    
    // Background monitoring
    system_monitoring: {
      executor: 'constant-vus',
      vus: 2,
      duration: '120m',
      env: { SCENARIO: 'monitoring' },
    },
    
    // Periodic admin checks
    admin_checks: {
      executor: 'constant-vus',
      vus: 1,
      duration: '120m',
      env: { SCENARIO: 'admin_monitoring' },
    },
    
    // Memory leak detection
    memory_monitoring: {
      executor: 'constant-vus',
      vus: 1,
      duration: '120m',
      env: { SCENARIO: 'memory_monitoring' },
    },
  },
};

export function setup() {
  console.log('⏰ Starting Zoptal Auth Service Endurance Test');
  console.log('🎯 Target: 20 concurrent users for 2 hours');
  console.log('📊 Monitoring: Memory leaks, resource drift, stability');
  console.log('⚠️  This is a long-running test - expect 2+ hours completion time');
  
  return {
    baseURL: __ENV.BASE_URL || 'http://localhost:3001',
    testStartTime: Date.now(),
    initialMemoryBaseline: null,
  };
}

export default function(data) {
  const scenario = __ENV.SCENARIO || 'steady_load';
  const client = new AuthAPIClient(data.baseURL);
  const currentTime = Date.now();
  const elapsedHours = (currentTime - data.testStartTime) / (1000 * 60 * 60);
  
  switch (scenario) {
    case 'steady_load':
      steadyLoadTest(client, elapsedHours);
      break;
    case 'monitoring':
      systemMonitoring(client, elapsedHours);
      break;
    case 'admin_monitoring':
      adminMonitoring(client, elapsedHours);
      break;
    case 'memory_monitoring':
      memoryMonitoring(client, elapsedHours);
      break;
    default:
      steadyLoadTest(client, elapsedHours);
  }
}

// Steady load test scenario
function steadyLoadTest(client, elapsedHours) {
  const userIndex = Math.floor(Math.random() * 1000) + 1;
  const sessionType = Math.random();
  
  if (sessionType < 0.7) {
    // Existing user session (70% of traffic)
    performExistingUserSession(client, userIndex, elapsedHours);
  } else {
    // New user registration (30% of traffic)
    performNewUserSession(client, userIndex, elapsedHours);
  }
  
  // Vary think time slightly to simulate real usage patterns
  const baseThinkTime = 2;
  const variation = Math.sin(elapsedHours * Math.PI) * 0.5; // Slight variation over time
  sleep(baseThinkTime + variation + Math.random());
}

// System monitoring scenario
function systemMonitoring(client, elapsedHours) {
  // Monitor system health every 30 seconds
  const healthResponse = client.healthCheck();
  trackEnduranceResponse(healthResponse, 'health_check', elapsedHours);
  
  // Get metrics every 2 minutes
  if (Math.random() < 0.067) { // ~1/15 chance = every 30s * 15 = ~7.5 minutes
    const metricsResponse = client.getMetrics();
    if (metricsResponse.status === 200) {
      analyzeSystemMetrics(metricsResponse, elapsedHours);
    }
    trackEnduranceResponse(metricsResponse, 'metrics_check', elapsedHours);
  }
  
  sleep(30); // Check every 30 seconds
}

// Admin monitoring scenario
function adminMonitoring(client, elapsedHours) {
  // Periodic admin dashboard checks
  const adminLoginResponse = client.adminLogin();
  
  if (adminLoginResponse.status === 200) {
    // Check dashboard stats
    const dashboardResponse = client.getDashboardStats();
    trackEnduranceResponse(dashboardResponse, 'admin_dashboard', elapsedHours);
    
    // Check user list occasionally
    if (Math.random() < 0.3) {
      const userListResponse = client.getUserList(1, 10);
      trackEnduranceResponse(userListResponse, 'admin_user_list', elapsedHours);
    }
    
    client.logout();
  }
  
  sleep(300); // Admin checks every 5 minutes
}

// Memory monitoring scenario
function memoryMonitoring(client, elapsedHours) {
  // Get metrics to monitor memory usage
  const metricsResponse = client.getMetrics();
  
  if (metricsResponse.status === 200) {
    try {
      const metrics = metricsResponse.json();
      
      if (metrics.memory) {
        const currentMemory = metrics.memory.heapUsed / 1024 / 1024; // Convert to MB
        currentMemoryUsage.add(currentMemory);
        
        // Calculate memory drift over time
        const expectedMemory = 100; // Expected baseline memory in MB
        const memoryDrift = currentMemory - expectedMemory;
        memoryLeakIndicator.add(memoryDrift);
        
        // Log significant memory increases
        if (memoryDrift > 50) {
          console.log(`⚠️  Memory usage increased: ${currentMemory.toFixed(2)}MB (drift: +${memoryDrift.toFixed(2)}MB) at ${elapsedHours.toFixed(2)}h`);
        }
        
        // Check for potential memory leaks (continuous growth)
        if (elapsedHours > 0.5 && memoryDrift > elapsedHours * 20) { // More than 20MB per hour growth
          console.log(`🚨 Potential memory leak detected: ${memoryDrift.toFixed(2)}MB drift after ${elapsedHours.toFixed(2)}h`);
        }
      }
      
      // Monitor other resources
      if (metrics.process) {
        const resourceUsage = metrics.process.activeHandles + metrics.process.activeRequests;
        resourceDrift.add(resourceUsage);
      }
      
    } catch (e) {
      // Ignore JSON parsing errors
    }
  }
  
  sleep(60); // Memory monitoring every minute
}

// Existing user session simulation
function performExistingUserSession(client, userIndex, elapsedHours) {
  const credentials = {
    email: `enduranceuser${(userIndex % 100) + 1}@test.com`,
    password: 'EnduranceTest123!'
  };
  
  const loginResponse = client.login(credentials);
  trackEnduranceResponse(loginResponse, 'existing_user_login', elapsedHours);
  
  if (loginResponse.status === 200) {
    // Simulate realistic user activity
    performRealisticUserActivity(client, elapsedHours);
    
    // 95% logout properly, 5% session timeout
    if (Math.random() < 0.95) {
      const logoutResponse = client.logout();
      trackEnduranceResponse(logoutResponse, 'user_logout', elapsedHours);
    }
  }
}

// New user session simulation
function performNewUserSession(client, userIndex, elapsedHours) {
  const newUser = {
    email: `endurancenew${userIndex}_${Date.now()}@test.com`,
    password: 'EnduranceNew123!',
    profile: {
      firstName: `Endurance${userIndex}`,
      lastName: 'NewUser',
      dateOfBirth: '1990-01-01',
    }
  };
  
  const registerResponse = client.register(newUser);
  trackEnduranceResponse(registerResponse, 'new_user_registration', elapsedHours);
  
  if (registerResponse.status === 201) {
    sleep(2); // User reads confirmation
    
    // Login with new account
    const loginResponse = client.login({
      email: newUser.email,
      password: newUser.password
    });
    trackEnduranceResponse(loginResponse, 'new_user_login', elapsedHours);
    
    if (loginResponse.status === 200) {
      // New users typically do more profile setup
      performNewUserActivity(client, elapsedHours);
      
      const logoutResponse = client.logout();
      trackEnduranceResponse(logoutResponse, 'new_user_logout', elapsedHours);
    }
  }
}

// Realistic user activity simulation
function performRealisticUserActivity(client, elapsedHours) {
  const activitiesCount = Math.floor(Math.random() * 4) + 2; // 2-5 activities
  
  for (let i = 0; i < activitiesCount; i++) {
    const activity = Math.random();
    
    if (activity < 0.6) {
      // Profile views (most common)
      const response = client.getProfile();
      trackEnduranceResponse(response, 'profile_view', elapsedHours);
    } else if (activity < 0.8) {
      // Profile updates (less common)
      const response = client.updateProfile({
        firstName: `Updated${Date.now()}`,
        lastName: 'EnduranceUser',
        lastActivity: new Date().toISOString()
      });
      trackEnduranceResponse(response, 'profile_update', elapsedHours);
    } else {
      // Health check (rare, but users might check system status)
      const response = client.healthCheck();
      trackEnduranceResponse(response, 'user_health_check', elapsedHours);
    }
    
    // Think time between activities
    sleep(Math.random() * 3 + 1);
  }
}

// New user activity simulation (more intensive)
function performNewUserActivity(client, elapsedHours) {
  // New users typically update their profile
  const profileResponse = client.updateProfile({
    firstName: 'NewEndurance',
    lastName: 'User',
    bio: 'New user for endurance testing',
    preferences: {
      newsletter: true,
      notifications: true
    }
  });
  trackEnduranceResponse(profileResponse, 'new_user_profile_setup', elapsedHours);
  
  sleep(2);
  
  // View profile to confirm changes
  const viewResponse = client.getProfile();
  trackEnduranceResponse(viewResponse, 'new_user_profile_view', elapsedHours);
}

// Analyze system metrics for endurance patterns
function analyzeSystemMetrics(metricsResponse, elapsedHours) {
  try {
    const metrics = metricsResponse.json();
    
    // Check for degradation over time
    if (metrics.degradation && !metrics.degradation.isHealthy) {
      degradationOverTime.add(1);
      console.log(`📉 System degradation detected at ${elapsedHours.toFixed(2)}h: ${metrics.degradation.degradedServices.join(', ')}`);
    }
    
    // Monitor uptime
    if (metrics.uptime) {
      const expectedUptime = elapsedHours * 3600;
      const uptimeDrift = Math.abs(metrics.uptime - expectedUptime);
      
      if (uptimeDrift > 300) { // More than 5 minutes drift
        console.log(`⏰ Uptime drift detected: Expected ${expectedUptime}s, Actual ${metrics.uptime}s`);
      }
    }
    
    // Check for error rate increases over time
    if (metrics.realtime && metrics.realtime.errorRate > 0.02) {
      console.log(`📈 Elevated error rate at ${elapsedHours.toFixed(2)}h: ${(metrics.realtime.errorRate * 100).toFixed(2)}%`);
    }
    
  } catch (e) {
    // Ignore parsing errors
  }
}

// Track endurance-specific response patterns
function trackEnduranceResponse(response, operation, elapsedHours) {
  const isError = response.status >= 400;
  const isSlow = response.timings.duration > 3000;
  
  longtermErrorRate.add(isError);
  
  // Track response time degradation over time
  const expectedResponseTime = 500; // Expected baseline
  const responseTimeDrift = response.timings.duration - expectedResponseTime;
  
  if (responseTimeDrift > 1000) {
    resourceDrift.add(responseTimeDrift);
  }
  
  // Log concerning patterns
  if (elapsedHours > 1.0 && (isError || isSlow)) {
    console.log(`⚠️  ${operation} issue at ${elapsedHours.toFixed(2)}h: Status ${response.status}, Duration ${response.timings.duration}ms`);
  }
  
  // Enhanced checks for endurance
  check(response, {
    [`${operation} - status OK`]: (r) => r.status < 400,
    [`${operation} - response stable`]: (r) => r.timings.duration < 5000,
    [`${operation} - no timeouts`]: (r) => r.status !== 0,
  });
}

export function teardown(data) {
  const totalHours = (Date.now() - data.testStartTime) / (1000 * 60 * 60);
  
  console.log('🧹 Endurance test cleanup');
  console.log(`✅ Endurance test completed after ${totalHours.toFixed(2)} hours`);
  console.log('📊 Check the detailed report for stability analysis');
}

export function handleSummary(data) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const testDuration = (Date.now() - (data.setup_data?.testStartTime || Date.now())) / (1000 * 60 * 60);
  
  // Enhanced summary for endurance testing
  const enduranceMetrics = {
    testDurationHours: testDuration,
    steadyStateUsers: 20,
    totalRequests: data.metrics.http_reqs ? data.metrics.http_reqs.count : 0,
    requestsPerHour: data.metrics.http_reqs ? (data.metrics.http_reqs.count / testDuration) : 0,
    longTermErrorRate: data.metrics.longterm_errors ? data.metrics.longterm_errors.rate : 0,
    averageResponseTime: data.metrics.http_req_duration ? data.metrics.http_req_duration.avg : 0,
    responseTimeStability: data.metrics.http_req_duration ? data.metrics.http_req_duration.max - data.metrics.http_req_duration.min : 0,
    memoryLeakIndicator: data.metrics.memory_leak_indicator ? data.metrics.memory_leak_indicator.avg : 0,
    resourceDrift: data.metrics.resource_drift ? data.metrics.resource_drift.avg : 0,
    degradationEvents: data.metrics.degradation_over_time ? data.metrics.degradation_over_time.count : 0,
    maxMemoryUsage: data.metrics.current_memory_usage_mb ? data.metrics.current_memory_usage_mb.max : 0,
  };
  
  return {
    [`reports/endurance-test-${timestamp}.html`]: htmlReport(data),
    [`reports/endurance-test-${timestamp}.json`]: JSON.stringify({
      ...data,
      enduranceMetrics
    }, null, 2),
    [`reports/endurance-metrics-${timestamp}.json`]: JSON.stringify(enduranceMetrics, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}