import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const loginSuccessRate = new Rate('login_success_rate');
const registrationSuccessRate = new Rate('registration_success_rate');
const authLatency = new Trend('auth_latency');
const errorCount = new Counter('errors');

// Test configuration
export const options = {
  stages: [
    // Ramp up
    { duration: '30s', target: 10 },   // Ramp up to 10 users over 30s
    { duration: '1m', target: 50 },    // Ramp up to 50 users over 1m
    { duration: '2m', target: 100 },   // Ramp up to 100 users over 2m
    
    // Steady state
    { duration: '5m', target: 100 },   // Stay at 100 users for 5m
    
    // Peak load
    { duration: '1m', target: 200 },   // Spike to 200 users
    { duration: '2m', target: 200 },   // Stay at 200 users for 2m
    
    // Ramp down
    { duration: '1m', target: 50 },    // Ramp down to 50 users
    { duration: '30s', target: 0 },    // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.1'],    // Error rate should be less than 10%
    login_success_rate: ['rate>0.95'], // Login success rate should be > 95%
    registration_success_rate: ['rate>0.90'], // Registration success rate should be > 90%
    auth_latency: ['p(95)<200'],      // 95% of auth operations should be < 200ms
  },
};

// Test data
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const TEST_EMAIL_PREFIX = 'perf.test';
const TEST_PASSWORD = 'TestPass123!@#';

let userCounter = 0;

// Helper functions
function generateTestEmail() {
  userCounter++;
  return `${TEST_EMAIL_PREFIX}.${userCounter}.${Date.now()}@example.com`;
}

function generateTestUser() {
  return {
    email: generateTestEmail(),
    password: TEST_PASSWORD,
    name: `Test User ${userCounter}`,
    phone: `+1555${String(userCounter).padStart(7, '0')}`,
  };
}

function makeRequest(method, url, payload = null, headers = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  
  const finalHeaders = { ...defaultHeaders, ...headers };
  
  const params = {
    headers: finalHeaders,
    timeout: '30s',
  };
  
  let response;
  const startTime = Date.now();
  
  if (payload) {
    response = http[method.toLowerCase()](url, JSON.stringify(payload), params);
  } else {
    response = http[method.toLowerCase()](url, params);
  }
  
  const duration = Date.now() - startTime;
  authLatency.add(duration);
  
  return response;
}

// Test scenarios
export default function () {
  const scenario = Math.random();
  
  if (scenario < 0.4) {
    // 40% - Registration flow
    testRegistrationFlow();
  } else if (scenario < 0.8) {
    // 40% - Login flow
    testLoginFlow();
  } else {
    // 20% - Mixed operations
    testMixedOperations();
  }
  
  sleep(1); // Think time between requests
}

function testRegistrationFlow() {
  const user = generateTestUser();
  
  // 1. Register user
  const registerResponse = makeRequest('POST', `${BASE_URL}/api/auth/register`, {
    email: user.email,
    password: user.password,
    name: user.name,
    phone: user.phone,
  });
  
  const registerSuccess = check(registerResponse, {
    'registration returns 201': (r) => r.status === 201,
    'registration response has user data': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.success && body.data && body.data.user;
      } catch {
        return false;
      }
    },
  });
  
  registrationSuccessRate.add(registerSuccess);
  
  if (!registerSuccess) {
    errorCount.add(1);
    return;
  }
  
  // 2. Verify email (simulate)
  sleep(0.5);
  
  // 3. Login with new account
  const loginResponse = makeRequest('POST', `${BASE_URL}/api/auth/login`, {
    email: user.email,
    password: user.password,
  });
  
  const loginSuccess = check(loginResponse, {
    'post-registration login returns 200': (r) => r.status === 200,
    'login response has tokens': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.success && body.data && body.data.accessToken && body.data.refreshToken;
      } catch {
        return false;
      }
    },
  });
  
  loginSuccessRate.add(loginSuccess);
  
  if (!loginSuccess) {
    errorCount.add(1);
    return;
  }
  
  // 4. Get user profile
  const tokens = JSON.parse(loginResponse.body).data;
  const profileResponse = makeRequest('GET', `${BASE_URL}/api/auth/profile`, null, {
    'Authorization': `Bearer ${tokens.accessToken}`,
  });
  
  check(profileResponse, {
    'profile fetch returns 200': (r) => r.status === 200,
    'profile has user data': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.success && body.data && body.data.email === user.email;
      } catch {
        return false;
      }
    },
  });
}

function testLoginFlow() {
  // Use a pre-existing test account for login tests
  const testUser = {
    email: 'test.user@example.com',
    password: TEST_PASSWORD,
  };
  
  // 1. Login
  const loginResponse = makeRequest('POST', `${BASE_URL}/api/auth/login`, testUser);
  
  const loginSuccess = check(loginResponse, {
    'login returns 200': (r) => r.status === 200,
    'login response has tokens': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.success && body.data && body.data.accessToken && body.data.refreshToken;
      } catch {
        return false;
      }
    },
  });
  
  loginSuccessRate.add(loginSuccess);
  
  if (!loginSuccess) {
    errorCount.add(1);
    return;
  }
  
  const tokens = JSON.parse(loginResponse.body).data;
  
  // 2. Access protected resources
  const protectedEndpoints = [
    '/api/auth/profile',
    '/api/auth/sessions',
    '/api/i18n/preferences',
  ];
  
  protectedEndpoints.forEach(endpoint => {
    const response = makeRequest('GET', `${BASE_URL}${endpoint}`, null, {
      'Authorization': `Bearer ${tokens.accessToken}`,
    });
    
    check(response, {
      [`${endpoint} returns 200`]: (r) => r.status === 200,
    });
    
    sleep(0.1);
  });
  
  // 3. Refresh token
  const refreshResponse = makeRequest('POST', `${BASE_URL}/api/auth/refresh`, {
    refreshToken: tokens.refreshToken,
  });
  
  check(refreshResponse, {
    'token refresh returns 200': (r) => r.status === 200,
    'refresh response has new tokens': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.success && body.data && body.data.accessToken;
      } catch {
        return false;
      }
    },
  });
  
  // 4. Logout
  const logoutResponse = makeRequest('POST', `${BASE_URL}/api/auth/logout`, {
    refreshToken: tokens.refreshToken,
  });
  
  check(logoutResponse, {
    'logout returns 200': (r) => r.status === 200,
  });
}

function testMixedOperations() {
  // Test various API endpoints without authentication
  const publicEndpoints = [
    { method: 'GET', path: '/health' },
    { method: 'GET', path: '/api/auth/health' },
    { method: 'GET', path: '/api/i18n/languages' },
    { method: 'GET', path: '/api/i18n/timezones' },
    { method: 'POST', path: '/api/i18n/detect', payload: {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      acceptLanguage: 'en-US,en;q=0.9',
    }},
  ];
  
  publicEndpoints.forEach(endpoint => {
    const response = makeRequest(
      endpoint.method, 
      `${BASE_URL}${endpoint.path}`, 
      endpoint.payload
    );
    
    check(response, {
      [`${endpoint.method} ${endpoint.path} returns success`]: (r) => r.status >= 200 && r.status < 400,
    });
    
    sleep(0.1);
  });
  
  // Test password reset flow
  const resetResponse = makeRequest('POST', `${BASE_URL}/api/auth/forgot-password`, {
    email: 'test.reset@example.com',
  });
  
  check(resetResponse, {
    'password reset request returns 200': (r) => r.status === 200,
  });
  
  // Test invalid login attempts (security testing)
  const invalidLoginResponse = makeRequest('POST', `${BASE_URL}/api/auth/login`, {
    email: 'invalid@example.com',
    password: 'wrongpassword',
  });
  
  check(invalidLoginResponse, {
    'invalid login returns 401': (r) => r.status === 401,
  });
}

// Setup function to create test data
export function setup() {
  console.log('Setting up performance test environment...');
  
  // Create a test user for login scenarios
  const testUser = {
    email: 'test.user@example.com',
    password: TEST_PASSWORD,
    name: 'Performance Test User',
  };
  
  const response = makeRequest('POST', `${BASE_URL}/api/auth/register`, testUser);
  
  if (response.status === 201 || response.status === 409) { // 409 if user already exists
    console.log('Test user ready for performance testing');
  } else {
    console.warn('Failed to create test user, some tests may fail');
  }
  
  return { testUser };
}

// Teardown function to clean up test data
export function teardown(data) {
  console.log('Performance test completed. Check the results above.');
  
  // In a real scenario, you might want to clean up test data here
  // For now, we'll just log a summary
  console.log('Summary:');
  console.log(`- Total requests: ${http.requests.count}`);
  console.log(`- Failed requests: ${errorCount.count}`);
  console.log(`- Average response time: ${authLatency.avg}ms`);
}

// Additional test configuration
export const handleSummary = (data) => {
  return {
    'performance-results.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
};

function textSummary(data, options = {}) {
  const indent = options.indent || '';
  const colors = options.enableColors !== false;
  
  let summary = '\n' + indent + '📊 Performance Test Summary\n';
  summary += indent + '================================\n\n';
  
  // Requests
  summary += indent + `🔵 Total Requests: ${data.metrics.http_reqs.count}\n`;
  summary += indent + `❌ Failed Requests: ${data.metrics.http_req_failed.count}\n`;
  summary += indent + `📈 Requests/sec: ${data.metrics.http_reqs.rate.toFixed(2)}\n\n`;
  
  // Response Times
  summary += indent + '⏱️  Response Times:\n';
  summary += indent + `   Average: ${data.metrics.http_req_duration.avg.toFixed(2)}ms\n`;
  summary += indent + `   Median:  ${data.metrics.http_req_duration.p50.toFixed(2)}ms\n`;
  summary += indent + `   95th:    ${data.metrics.http_req_duration.p95.toFixed(2)}ms\n`;
  summary += indent + `   99th:    ${data.metrics.http_req_duration.p99.toFixed(2)}ms\n\n`;
  
  // Auth Metrics
  if (data.metrics.login_success_rate) {
    summary += indent + '🔐 Authentication Metrics:\n';
    summary += indent + `   Login Success Rate:        ${(data.metrics.login_success_rate.rate * 100).toFixed(2)}%\n`;
    summary += indent + `   Registration Success Rate: ${(data.metrics.registration_success_rate.rate * 100).toFixed(2)}%\n`;
    summary += indent + `   Auth Latency (95th):       ${data.metrics.auth_latency.p95.toFixed(2)}ms\n\n`;
  }
  
  // Thresholds
  summary += indent + '🎯 Threshold Results:\n';
  Object.entries(data.thresholds).forEach(([name, threshold]) => {
    const status = threshold.ok ? '✅' : '❌';
    summary += indent + `   ${status} ${name}\n`;
  });
  
  return summary;
}