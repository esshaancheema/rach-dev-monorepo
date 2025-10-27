// k6 Stress Testing Script for Zoptal Auth Service
// This script tests system behavior under high load and identifies breaking points

import { AuthAPIClient, stressTestStages, performanceThresholds, setupTestData, cleanupTestData } from './k6-setup.js';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

// Custom stress test metrics
export const stressErrorRate = new Rate('stress_errors');
export const circuitBreakerTrips = new Counter('circuit_breaker_trips');
export const degradedServiceCalls = new Counter('degraded_service_calls');
export const slowResponseTime = new Trend('slow_response_time');

// Stress test configuration with relaxed thresholds
export const options = {
  stages: stressTestStages,
  
  // More lenient thresholds for stress testing
  thresholds: {
    http_req_duration: ['p(95)<5000'], // 95% under 5s (relaxed)
    http_req_failed: ['rate<0.15'],    // Error rate under 15% (relaxed)
    stress_errors: ['rate<0.20'],      // Stress-specific error rate under 20%
    http_reqs: ['rate>50'],            // At least 50 req/s (reduced)
  },
  
  scenarios: {
    // High-intensity authentication stress
    auth_stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: stressTestStages,
      gracefulRampDown: '1m',
      env: { SCENARIO: 'auth_stress' },
    },
    
    // Database stress testing
    database_stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: stressTestStages.map(stage => ({ ...stage, target: Math.floor(stage.target * 0.8) })),
      gracefulRampDown: '1m',
      env: { SCENARIO: 'database_stress' },
    },
    
    // API endpoint stress
    api_stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: stressTestStages.map(stage => ({ ...stage, target: Math.floor(stage.target * 0.6) })),
      gracefulRampDown: '1m',
      env: { SCENARIO: 'api_stress' },
    },
    
    // Circuit breaker testing
    circuit_breaker_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: stressTestStages.map(stage => ({ ...stage, target: Math.floor(stage.target * 0.3) })),
      gracefulRampDown: '1m',
      env: { SCENARIO: 'circuit_breaker' },
    },
    
    // Background monitoring during stress
    stress_monitoring: {
      executor: 'constant-vus',
      vus: 5,
      duration: '42m',
      env: { SCENARIO: 'monitoring' },
    },
  },
};

export function setup() {
  console.log('🔥 Starting Zoptal Auth Service Stress Test');
  console.log(`💥 Peak Target: ${Math.max(...stressTestStages.map(s => s.target))} concurrent users`);
  console.log(`⏱️  Duration: ${stressTestStages.reduce((sum, stage) => sum + parseInt(stage.duration), 0)} minutes`);
  console.log('⚠️  WARNING: This test is designed to stress the system to its limits');
  
  setupTestData();
  
  return {
    baseURL: __ENV.BASE_URL || 'http://localhost:3001',
    timestamp: new Date().toISOString(),
  };
}

export default function(data) {
  const scenario = __ENV.SCENARIO || 'auth_stress';
  const client = new AuthAPIClient(data.baseURL);
  
  switch (scenario) {
    case 'auth_stress':
      authenticationStress(client);
      break;
    case 'database_stress':
      databaseStress(client);
      break;
    case 'api_stress':
      apiEndpointStress(client);
      break;
    case 'circuit_breaker':
      circuitBreakerTest(client);
      break;
    case 'monitoring':
      stressMonitoring(client);
      break;
    default:
      authenticationStress(client);
  }
}

// Authentication stress testing
function authenticationStress(client) {
  const userIndex = Math.floor(Math.random() * 10000) + 1;
  const testType = Math.random();
  
  if (testType < 0.4) {
    // Rapid registration attempts
    const newUser = {
      email: `stressuser${userIndex}_${Date.now()}@test.com`,
      password: 'StressTest123!',
      profile: {
        firstName: `Stress${userIndex}`,
        lastName: 'User',
      }
    };
    
    const response = client.register(newUser);
    trackStressResponse(response, 'registration');
    
  } else if (testType < 0.8) {
    // Rapid login attempts
    const credentials = {
      email: `stressuser${(userIndex % 1000) + 1}@test.com`,
      password: 'StressTest123!'
    };
    
    const response = client.login(credentials);
    trackStressResponse(response, 'login');
    
    if (response.status === 200) {
      // Quick authenticated actions
      rapidAuthenticatedActions(client);
      client.logout();
    }
    
  } else {
    // Failed login attempts (test rate limiting)
    const badCredentials = {
      email: `stressuser${userIndex}@test.com`,
      password: 'WrongPassword123!'
    };
    
    const response = client.login(badCredentials);
    trackStressResponse(response, 'failed_login');
  }
  
  // Minimal sleep to maximize stress
  sleep(Math.random() * 0.5);
}

// Database stress testing
function databaseStress(client) {
  const userIndex = Math.floor(Math.random() * 1000) + 1;
  
  // Login to get authenticated session
  const loginResponse = client.login({
    email: `dbstressuser${userIndex}@test.com`,
    password: 'DBStress123!'
  });
  
  if (loginResponse.status === 200) {
    // Rapid database operations
    for (let i = 0; i < Math.floor(Math.random() * 10) + 5; i++) {
      const operations = [
        () => client.getProfile(),
        () => client.updateProfile({
          firstName: `Updated${Date.now()}`,
          lastName: `Stress${i}`,
          updatedAt: new Date().toISOString()
        }),
        () => client.getProfile(), // Read after write
      ];
      
      const operation = operations[Math.floor(Math.random() * operations.length)];
      const response = operation();
      trackStressResponse(response, 'database_op');
      
      // No sleep between operations to stress database
    }
    
    client.logout();
  }
  
  sleep(Math.random() * 0.3);
}

// API endpoint stress testing
function apiEndpointStress(client) {
  // Test various endpoints rapidly
  const endpoints = [
    () => client.healthCheck(),
    () => client.getMetrics(),
    () => {
      // Try admin endpoints (should fail for non-admin)
      const response = client.getDashboardStats();
      return response;
    },
  ];
  
  // Rapid fire requests
  for (let i = 0; i < Math.floor(Math.random() * 5) + 3; i++) {
    const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
    const response = endpoint();
    trackStressResponse(response, 'api_stress');
  }
  
  sleep(Math.random() * 0.2);
}

// Circuit breaker testing
function circuitBreakerTest(client) {
  // Deliberately cause failures to test circuit breaker
  const userIndex = Math.floor(Math.random() * 100) + 1;
  
  // Attempt operations that might trigger circuit breakers
  const stressOperations = [
    // Invalid authentication
    () => client.login({
      email: `nonexistent${userIndex}@test.com`,
      password: 'InvalidPassword123!'
    }),
    
    // Rapid profile updates (database stress)
    () => {
      const response = client.updateProfile({
        firstName: 'CircuitBreakerTest',
        lastName: `Test${Date.now()}`,
        metadata: { stress: true, timestamp: Date.now() }
      });
      return response;
    },
    
    // Health checks during stress
    () => client.healthCheck(),
  ];
  
  // Execute operations rapidly
  for (let i = 0; i < 3; i++) {
    const operation = stressOperations[Math.floor(Math.random() * stressOperations.length)];
    const response = operation();
    
    // Check if circuit breaker might be triggered
    if (response.status >= 500 || response.timings.duration > 5000) {
      circuitBreakerTrips.add(1);
    }
    
    trackStressResponse(response, 'circuit_breaker_test');
  }
  
  sleep(Math.random() * 0.1);
}

// Stress monitoring
function stressMonitoring(client) {
  // Monitor system health during stress test
  const healthResponse = client.healthCheck();
  trackStressResponse(healthResponse, 'health_monitor');
  
  // Check metrics periodically
  if (Math.random() < 0.3) {
    const metricsResponse = client.getMetrics();
    trackStressResponse(metricsResponse, 'metrics_monitor');
    
    // Check for degraded service indicators
    if (metricsResponse.status === 200) {
      try {
        const metrics = metricsResponse.json();
        if (metrics.degradation && !metrics.degradation.isHealthy) {
          degradedServiceCalls.add(1);
        }
      } catch (e) {
        // Ignore JSON parse errors during stress
      }
    }
  }
  
  sleep(10); // Monitor every 10 seconds
}

// Rapid authenticated actions for stress testing
function rapidAuthenticatedActions(client) {
  const actions = Math.floor(Math.random() * 3) + 1;
  
  for (let i = 0; i < actions; i++) {
    const actionType = Math.random();
    
    if (actionType < 0.6) {
      const response = client.getProfile();
      trackStressResponse(response, 'rapid_profile_get');
    } else {
      const response = client.updateProfile({
        firstName: `Rapid${i}`,
        lastName: `Update${Date.now()}`,
        stressTest: true
      });
      trackStressResponse(response, 'rapid_profile_update');
    }
    
    // No sleep between rapid actions
  }
}

// Track stress test responses
function trackStressResponse(response, operation) {
  const isError = response.status >= 400;
  const isSlow = response.timings.duration > 2000;
  
  stressErrorRate.add(isError);
  
  if (isSlow) {
    slowResponseTime.add(response.timings.duration);
  }
  
  // Log severe issues
  if (response.status >= 500 || response.timings.duration > 10000) {
    console.log(`⚠️  Severe issue in ${operation}: Status ${response.status}, Duration ${response.timings.duration}ms`);
  }
  
  check(response, {
    [`${operation} - status not 500+`]: (r) => r.status < 500,
    [`${operation} - response time under 10s`]: (r) => r.timings.duration < 10000,
  });
}

export function teardown(data) {
  console.log('🧹 Stress test cleanup');
  cleanupTestData();
  console.log('✅ Stress test completed');
  
  // Log stress test summary
  console.log('📊 Stress Test Summary:');
  console.log(`   Peak concurrent users: ${Math.max(...stressTestStages.map(s => s.target))}`);
  console.log(`   Test duration: ${stressTestStages.reduce((sum, stage) => sum + parseInt(stage.duration), 0)} minutes`);
  console.log('   Check the detailed report for performance insights');
}

export function handleSummary(data) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  // Enhanced summary for stress testing
  const stressMetrics = {
    peakUsers: Math.max(...stressTestStages.map(s => s.target)),
    testDuration: stressTestStages.reduce((sum, stage) => sum + parseInt(stage.duration), 0),
    totalRequests: data.metrics.http_reqs ? data.metrics.http_reqs.count : 0,
    errorRate: data.metrics.http_req_failed ? data.metrics.http_req_failed.rate : 0,
    avgResponseTime: data.metrics.http_req_duration ? data.metrics.http_req_duration.avg : 0,
    p95ResponseTime: data.metrics.http_req_duration ? data.metrics.http_req_duration['p(95)'] : 0,
    circuitBreakerTrips: data.metrics.circuit_breaker_trips ? data.metrics.circuit_breaker_trips.count : 0,
    degradedServiceCalls: data.metrics.degraded_service_calls ? data.metrics.degraded_service_calls.count : 0,
  };
  
  return {
    [`reports/stress-test-${timestamp}.html`]: htmlReport(data),
    [`reports/stress-test-${timestamp}.json`]: JSON.stringify({
      ...data,
      stressMetrics
    }, null, 2),
    [`reports/stress-metrics-${timestamp}.json`]: JSON.stringify(stressMetrics, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}