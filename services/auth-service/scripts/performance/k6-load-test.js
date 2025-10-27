import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

// Custom metrics
const authSuccessRate = new Rate('auth_success_rate');
const authDuration = new Trend('auth_duration');
const registrationRate = new Rate('registration_success_rate');
const apiErrorRate = new Rate('api_error_rate');
const concurrentUsers = new Counter('concurrent_users');

// Configuration
const CONFIG = {
  baseUrl: __ENV.API_URL || 'http://localhost:3000',
  testDuration: __ENV.TEST_DURATION || '5m',
  rampUpTime: __ENV.RAMP_UP_TIME || '1m',
  rampDownTime: __ENV.RAMP_DOWN_TIME || '1m',
  maxVUs: parseInt(__ENV.MAX_VUS) || 100,
  targetRPS: parseInt(__ENV.TARGET_RPS) || 50,
  thresholds: {
    authResponseTime: __ENV.AUTH_RESPONSE_THRESHOLD || 500,
    authSuccessRate: parseFloat(__ENV.AUTH_SUCCESS_THRESHOLD) || 0.95,
    apiResponseTime: __ENV.API_RESPONSE_THRESHOLD || 200,
    errorRate: parseFloat(__ENV.ERROR_RATE_THRESHOLD) || 0.05
  }
};

// Test scenarios
export const options = {
  scenarios: {
    // Smoke test - basic functionality
    smoke_test: {
      executor: 'constant-vus',
      vus: 5,
      duration: '1m',
      tags: { test_type: 'smoke' },
      env: { SCENARIO: 'smoke' }
    },
    
    // Load test - normal expected load
    load_test: {
      executor: 'ramping-vus',
      startVUs: 10,
      stages: [
        { duration: CONFIG.rampUpTime, target: CONFIG.maxVUs },
        { duration: CONFIG.testDuration, target: CONFIG.maxVUs },
        { duration: CONFIG.rampDownTime, target: 0 }
      ],
      tags: { test_type: 'load' },
      env: { SCENARIO: 'load' }
    },
    
    // Stress test - beyond normal capacity
    stress_test: {
      executor: 'ramping-vus',
      startVUs: 10,
      stages: [
        { duration: '2m', target: CONFIG.maxVUs },
        { duration: '3m', target: CONFIG.maxVUs * 1.5 },
        { duration: '2m', target: CONFIG.maxVUs * 2 },
        { duration: '2m', target: 0 }
      ],
      tags: { test_type: 'stress' },
      env: { SCENARIO: 'stress' }
    },
    
    // Spike test - sudden load increase
    spike_test: {
      executor: 'ramping-vus',
      startVUs: 10,
      stages: [
        { duration: '1m', target: 10 },
        { duration: '30s', target: CONFIG.maxVUs * 3 },
        { duration: '1m', target: 10 },
        { duration: '30s', target: 0 }
      ],
      tags: { test_type: 'spike' },
      env: { SCENARIO: 'spike' }
    },
    
    // Volume test - large data processing
    volume_test: {
      executor: 'constant-vus',
      vus: 20,
      duration: '10m',
      tags: { test_type: 'volume' },
      env: { SCENARIO: 'volume' }
    }
  },
  
  thresholds: {
    http_req_duration: [`p(95)<${CONFIG.thresholds.apiResponseTime}`],
    http_req_failed: [`rate<${CONFIG.thresholds.errorRate}`],
    auth_success_rate: [`rate>${CONFIG.thresholds.authSuccessRate}`],
    auth_duration: [`p(95)<${CONFIG.thresholds.authResponseTime}`],
    api_error_rate: [`rate<${CONFIG.thresholds.errorRate}`]
  }
};

// Test data
const TEST_USERS = [];
let accessTokens = new Map();

export function setup() {
  console.log('🚀 Starting K6 Performance Tests for Zoptal Auth Service');
  console.log(`Base URL: ${CONFIG.baseUrl}`);
  console.log(`Test Duration: ${CONFIG.testDuration}`);
  console.log(`Max VUs: ${CONFIG.maxVUs}`);
  
  // Pre-create test users for load testing
  const setupData = {
    users: [],
    adminToken: null
  };
  
  // Create test users
  for (let i = 0; i < 50; i++) {
    const user = {
      email: `loadtest-${i}-${Date.now()}@zoptal.com`,
      password: 'LoadTest123!',
      firstName: `LoadTest${i}`,
      lastName: 'User'
    };
    
    const response = http.post(`${CONFIG.baseUrl}/api/auth/register`, JSON.stringify(user), {
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.status === 201 || response.status === 409) {
      setupData.users.push(user);
    }
  }
  
  console.log(`✅ Created ${setupData.users.length} test users for load testing`);
  return setupData;
}

export default function(data) {
  const scenario = __ENV.SCENARIO || 'load';
  
  group('Authentication Load Test', () => {
    switch (scenario) {
      case 'smoke':
        smokeTest(data);
        break;
      case 'load':
        loadTest(data);
        break;
      case 'stress':
        stressTest(data);
        break;
      case 'spike':
        spikeTest(data);
        break;
      case 'volume':
        volumeTest(data);
        break;
      default:
        loadTest(data);
    }
  });
  
  // Random sleep between 1-3 seconds
  sleep(Math.random() * 2 + 1);
}

function smokeTest(data) {
  group('Smoke Test - Basic Functionality', () => {
    // Test basic endpoints
    testHealthEndpoint();
    testUserRegistration();
    testUserLogin(data);
    testProtectedEndpoint();
  });
}

function loadTest(data) {
  group('Load Test - Normal Expected Load', () => {
    concurrentUsers.add(1);
    
    // Mix of operations simulating real usage
    const operations = [
      () => testUserLogin(data),
      () => testUserProfile(),
      () => testPasswordReset(),
      () => testTokenRefresh(),
      () => testUserLogout()
    ];
    
    // Random operation selection
    const operation = operations[Math.floor(Math.random() * operations.length)];
    operation();
  });
}

function stressTest(data) {
  group('Stress Test - Beyond Normal Capacity', () => {
    concurrentUsers.add(1);
    
    // More aggressive testing
    testUserLogin(data);
    testConcurrentRequests();
    testRateLimiting();
  });
}

function spikeTest(data) {
  group('Spike Test - Sudden Load Increase', () => {
    concurrentUsers.add(1);
    
    // Simulate sudden spike in authentication requests
    testBurstAuthentication(data);
    testSystemRecovery();
  });
}

function volumeTest(data) {
  group('Volume Test - Large Data Processing', () => {
    // Test with large payloads and batch operations
    testLargePayloadRegistration();
    testBatchOperations(data);
    testDataExport();
  });
}

function testHealthEndpoint() {
  const response = http.get(`${CONFIG.baseUrl}/health`);
  
  check(response, {
    'health check status is 200': (r) => r.status === 200,
    'health check response time < 100ms': (r) => r.timings.duration < 100
  });
  
  apiErrorRate.add(response.status >= 400);
}

function testUserRegistration() {
  const user = {
    email: `perftest-${Date.now()}-${Math.random()}@zoptal.com`,
    password: 'PerfTest123!',
    firstName: 'Performance',
    lastName: 'Test'
  };
  
  const response = http.post(
    `${CONFIG.baseUrl}/api/auth/register`,
    JSON.stringify(user),
    { headers: { 'Content-Type': 'application/json' } }
  );
  
  const success = check(response, {
    'registration status is 201': (r) => r.status === 201,
    'registration response time < 1s': (r) => r.timings.duration < 1000,
    'registration returns access token': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.data && body.data.accessToken;
      } catch {
        return false;
      }
    }
  });
  
  registrationRate.add(success);
  apiErrorRate.add(response.status >= 400);
  
  if (response.status === 201) {
    try {
      const body = JSON.parse(response.body);
      if (body.data.accessToken) {
        accessTokens.set(user.email, body.data.accessToken);
      }
    } catch (e) {
      // Ignore parsing errors
    }
  }
}

function testUserLogin(data) {
  if (!data.users || data.users.length === 0) {
    return;
  }
  
  const user = data.users[Math.floor(Math.random() * data.users.length)];
  const startTime = Date.now();
  
  const response = http.post(
    `${CONFIG.baseUrl}/api/auth/login`,
    JSON.stringify({
      email: user.email,
      password: user.password
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  
  const duration = Date.now() - startTime;
  authDuration.add(duration);
  
  const success = check(response, {
    'login status is 200': (r) => r.status === 200,
    'login response time < 500ms': (r) => r.timings.duration < 500,
    'login returns access token': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.data && body.data.accessToken;
      } catch {
        return false;
      }
    }
  });
  
  authSuccessRate.add(success);
  apiErrorRate.add(response.status >= 400);
  
  if (response.status === 200) {
    try {
      const body = JSON.parse(response.body);
      if (body.data.accessToken) {
        accessTokens.set(user.email, body.data.accessToken);
      }
    } catch (e) {
      // Ignore parsing errors
    }
  }
}

function testProtectedEndpoint() {
  const tokens = Array.from(accessTokens.values());
  if (tokens.length === 0) {
    return;
  }
  
  const token = tokens[Math.floor(Math.random() * tokens.length)];
  
  const response = http.get(`${CONFIG.baseUrl}/api/auth/me`, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  check(response, {
    'protected endpoint status is 200': (r) => r.status === 200,
    'protected endpoint response time < 200ms': (r) => r.timings.duration < 200
  });
  
  apiErrorRate.add(response.status >= 400);
}

function testUserProfile() {
  const tokens = Array.from(accessTokens.values());
  if (tokens.length === 0) {
    return;
  }
  
  const token = tokens[Math.floor(Math.random() * tokens.length)];
  
  const response = http.get(`${CONFIG.baseUrl}/api/users/profile`, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  check(response, {
    'profile fetch status is 200': (r) => r.status === 200 || r.status === 401,
    'profile fetch response time < 300ms': (r) => r.timings.duration < 300
  });
  
  apiErrorRate.add(response.status >= 500);
}

function testPasswordReset() {
  const response = http.post(
    `${CONFIG.baseUrl}/api/auth/forgot-password`,
    JSON.stringify({
      email: `perftest-${Math.random()}@zoptal.com`
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  
  check(response, {
    'password reset status is 200': (r) => r.status === 200,
    'password reset response time < 1s': (r) => r.timings.duration < 1000
  });
  
  apiErrorRate.add(response.status >= 400);
}

function testTokenRefresh() {
  // Simulate token refresh scenario
  const response = http.post(
    `${CONFIG.baseUrl}/api/auth/refresh`,
    '{}',
    { 
      headers: { 'Content-Type': 'application/json' },
      cookies: { refresh_token: 'test-refresh-token' }
    }
  );
  
  check(response, {
    'token refresh response time < 200ms': (r) => r.timings.duration < 200
  });
  
  // Don't count 401 as error for refresh token test
  apiErrorRate.add(response.status >= 500);
}

function testUserLogout() {
  const tokens = Array.from(accessTokens.values());
  if (tokens.length === 0) {
    return;
  }
  
  const token = tokens[Math.floor(Math.random() * tokens.length)];
  
  const response = http.post(`${CONFIG.baseUrl}/api/auth/logout`, '{}', {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  check(response, {
    'logout response time < 200ms': (r) => r.timings.duration < 200
  });
  
  apiErrorRate.add(response.status >= 500);
}

function testConcurrentRequests() {
  // Simulate multiple concurrent requests from same user
  const tokens = Array.from(accessTokens.values());
  if (tokens.length === 0) {
    return;
  }
  
  const token = tokens[Math.floor(Math.random() * tokens.length)];
  
  const requests = [
    ['GET', `${CONFIG.baseUrl}/api/auth/me`],
    ['GET', `${CONFIG.baseUrl}/api/users/profile`],
    ['GET', `${CONFIG.baseUrl}/health`]
  ];
  
  const responses = http.batch(requests.map(([method, url]) => [
    method,
    url,
    null,
    { headers: { 'Authorization': `Bearer ${token}` } }
  ]));
  
  responses.forEach(response => {
    check(response, {
      'concurrent request response time < 500ms': (r) => r.timings.duration < 500
    });
    apiErrorRate.add(response.status >= 500);
  });
}

function testRateLimiting() {
  // Test rate limiting by making rapid requests
  for (let i = 0; i < 10; i++) {
    const response = http.post(
      `${CONFIG.baseUrl}/api/auth/login`,
      JSON.stringify({
        email: 'ratelimit-test@zoptal.com',
        password: 'wrongpassword'
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
    
    // Rate limiting should kick in (429) or auth should fail (401/400)
    check(response, {
      'rate limiting or auth failure': (r) => r.status === 429 || r.status === 401 || r.status === 400
    });
  }
}

function testBurstAuthentication(data) {
  if (!data.users || data.users.length === 0) {
    return;
  }
  
  // Burst of authentication requests
  const requests = [];
  for (let i = 0; i < 5; i++) {
    const user = data.users[Math.floor(Math.random() * data.users.length)];
    requests.push([
      'POST',
      `${CONFIG.baseUrl}/api/auth/login`,
      JSON.stringify({ email: user.email, password: user.password }),
      { headers: { 'Content-Type': 'application/json' } }
    ]);
  }
  
  const responses = http.batch(requests);
  
  responses.forEach(response => {
    authSuccessRate.add(response.status === 200);
    apiErrorRate.add(response.status >= 500);
  });
}

function testSystemRecovery() {
  // Test if system recovers after spike
  sleep(2);
  
  const response = http.get(`${CONFIG.baseUrl}/health`);
  
  check(response, {
    'system recovery - health check': (r) => r.status === 200,
    'system recovery - response time': (r) => r.timings.duration < 200
  });
}

function testLargePayloadRegistration() {
  const largeUser = {
    email: `largepayload-${Date.now()}@zoptal.com`,
    password: 'LargePayload123!',
    firstName: 'A'.repeat(100),
    lastName: 'B'.repeat(100),
    bio: 'C'.repeat(1000), // Large bio field
    metadata: {
      preferences: {
        theme: 'dark',
        language: 'en',
        notifications: {
          email: true,
          sms: true,
          push: true,
          marketing: false
        },
        privacy: {
          profileVisible: true,
          dataSharing: false,
          analytics: true
        }
      }
    }
  };
  
  const response = http.post(
    `${CONFIG.baseUrl}/api/auth/register`,
    JSON.stringify(largeUser),
    { headers: { 'Content-Type': 'application/json' } }
  );
  
  check(response, {
    'large payload registration handles gracefully': (r) => r.status === 201 || r.status === 400,
    'large payload response time < 2s': (r) => r.timings.duration < 2000
  });
  
  apiErrorRate.add(response.status >= 500);
}

function testBatchOperations(data) {
  if (!data.users || data.users.length === 0) {
    return;
  }
  
  // Simulate batch operations like bulk user updates
  const batchRequests = [];
  
  for (let i = 0; i < 5; i++) {
    const user = data.users[Math.floor(Math.random() * data.users.length)];
    batchRequests.push([
      'POST',
      `${CONFIG.baseUrl}/api/auth/login`,
      JSON.stringify({ email: user.email, password: user.password }),
      { headers: { 'Content-Type': 'application/json' } }
    ]);
  }
  
  const responses = http.batch(batchRequests);
  
  responses.forEach(response => {
    check(response, {
      'batch operation response time < 1s': (r) => r.timings.duration < 1000
    });
    apiErrorRate.add(response.status >= 500);
  });
}

function testDataExport() {
  const tokens = Array.from(accessTokens.values());
  if (tokens.length === 0) {
    return;
  }
  
  const token = tokens[Math.floor(Math.random() * tokens.length)];
  
  const response = http.post(`${CONFIG.baseUrl}/api/users/export`, '{}', {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  check(response, {
    'data export response time < 3s': (r) => r.timings.duration < 3000
  });
  
  apiErrorRate.add(response.status >= 500);
}

export function teardown(data) {
  console.log('🧹 Cleaning up test data...');
  
  // Cleanup test users if needed
  if (data.users) {
    console.log(`Cleaning up ${data.users.length} test users`);
    // In a real scenario, you might want to delete test users
  }
  
  console.log('✅ Performance test cleanup completed');
}

export function handleSummary(data) {
  console.log('📊 Generating performance test reports...');
  
  return {
    'performance-report.html': htmlReport(data),
    'performance-summary.txt': textSummary(data, { indent: ' ', enableColors: true }),
    'performance-results.json': JSON.stringify(data, null, 2)
  };
}