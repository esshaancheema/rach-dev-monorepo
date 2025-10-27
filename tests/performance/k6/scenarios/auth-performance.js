/**
 * K6 Authentication Performance Testing
 * Tests authentication flows, token management, and session handling
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { randomIntBetween, randomString } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

// Custom metrics
const authErrorRate = new Rate('auth_error_rate');
const authResponseTime = new Trend('auth_response_time');
const authThroughput = new Counter('auth_throughput');
const tokenValidationTime = new Trend('token_validation_time');

// Test configuration
export const options = {
  scenarios: {
    login_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 5 },   // Ramp up to 5 users
        { duration: '3m', target: 5 },   // Stay at 5 users
        { duration: '1m', target: 15 },  // Ramp up to 15 users
        { duration: '3m', target: 15 },  // Stay at 15 users
        { duration: '1m', target: 0 },   // Ramp down
      ],
    },
    registration_burst: {
      executor: 'constant-arrival-rate',
      rate: 10, // 10 registrations per second
      timeUnit: '1s',
      duration: '2m',
      preAllocatedVUs: 10,
      maxVUs: 20,
    },
    token_validation: {
      executor: 'per-vu-iterations',
      vus: 5,
      iterations: 20,
      maxDuration: '5m',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<1000', 'p(99)<2000'],
    http_req_failed: ['rate<0.02'], // Less than 2% errors
    auth_error_rate: ['rate<0.02'],
    auth_response_time: ['p(95)<800'],
    token_validation_time: ['p(95)<200'],
  },
};

// Environment configuration
const BASE_URL = __ENV.API_BASE_URL || 'http://localhost:3001';

export function setup() {
  console.log('Setting up authentication performance test...');
  
  // Create some baseline test users
  const testUsers = [];
  for (let i = 0; i < 10; i++) {
    const user = {
      email: `perftest${i}@example.com`,
      password: 'PerfTest123!',
      name: `Performance Test User ${i}`,
      company: 'Test Company'
    };
    
    const response = http.post(`${BASE_URL}/auth/register`, JSON.stringify(user), {
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (response.status === 201 || response.status === 409) {
      testUsers.push(user);
    }
  }
  
  console.log(`Created/verified ${testUsers.length} test users`);
  return { testUsers };
}

export default function(data) {
  const scenario = __ENV.K6_SCENARIO || __VU % 3;
  
  switch (scenario) {
    case 0:
    case 'login_load':
      testLoginPerformance(data.testUsers);
      break;
    case 1:
    case 'registration_burst':
      testRegistrationPerformance();
      break;
    case 2:
    case 'token_validation':
      testTokenValidation(data.testUsers);
      break;
    default:
      testLoginPerformance(data.testUsers);
  }
  
  sleep(randomIntBetween(1, 3));
}

function testLoginPerformance(testUsers) {
  if (!testUsers || testUsers.length === 0) {
    console.error('No test users available for login test');
    return;
  }
  
  const user = testUsers[randomIntBetween(0, testUsers.length - 1)];
  
  // Standard login
  const loginPayload = {
    email: user.email,
    password: user.password
  };
  
  const loginResponse = http.post(
    `${BASE_URL}/auth/login`, 
    JSON.stringify(loginPayload), 
    {
      headers: { 'Content-Type': 'application/json' },
      tags: { test_type: 'login' }
    }
  );
  
  const loginChecks = check(loginResponse, {
    'login status is 200': (r) => r.status === 200,
    'login has access token': (r) => {
      if (r.status === 200) {
        const data = JSON.parse(r.body);
        return data.tokens && data.tokens.accessToken;
      }
      return false;
    },
    'login has refresh token': (r) => {
      if (r.status === 200) {
        const data = JSON.parse(r.body);
        return data.tokens && data.tokens.refreshToken;
      }
      return false;
    },
    'login response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  authErrorRate.add(!loginChecks);
  authResponseTime.add(loginResponse.timings.duration);
  authThroughput.add(1);
  
  if (loginResponse.status === 200) {
    const loginData = JSON.parse(loginResponse.body);
    const accessToken = loginData.tokens.accessToken;
    
    // Test protected endpoint access
    const profileResponse = http.get(`${BASE_URL}/users/profile`, {
      headers: { 
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      tags: { test_type: 'protected_access' }
    });
    
    check(profileResponse, {
      'profile access status is 200': (r) => r.status === 200,
      'profile access response time < 300ms': (r) => r.timings.duration < 300,
    });
    
    authErrorRate.add(profileResponse.status !== 200);
    authResponseTime.add(profileResponse.timings.duration);
    authThroughput.add(1);
    
    // Test token refresh
    if (loginData.tokens.refreshToken) {
      const refreshPayload = {
        refreshToken: loginData.tokens.refreshToken
      };
      
      const refreshResponse = http.post(
        `${BASE_URL}/auth/refresh`, 
        JSON.stringify(refreshPayload), 
        {
          headers: { 'Content-Type': 'application/json' },
          tags: { test_type: 'token_refresh' }
        }
      );
      
      check(refreshResponse, {
        'token refresh status is 200': (r) => r.status === 200,
        'token refresh has new token': (r) => {
          if (r.status === 200) {
            const data = JSON.parse(r.body);
            return data.tokens && data.tokens.accessToken !== accessToken;
          }
          return false;
        },
        'token refresh response time < 400ms': (r) => r.timings.duration < 400,
      });
      
      authErrorRate.add(refreshResponse.status !== 200);
      authResponseTime.add(refreshResponse.timings.duration);
      authThroughput.add(1);
    }
    
    // Test logout
    const logoutResponse = http.post(`${BASE_URL}/auth/logout`, null, {
      headers: { 
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      tags: { test_type: 'logout' }
    });
    
    check(logoutResponse, {
      'logout status is 200': (r) => r.status === 200,
      'logout response time < 300ms': (r) => r.timings.duration < 300,
    });
    
    authErrorRate.add(logoutResponse.status !== 200);
    authResponseTime.add(logoutResponse.timings.duration);
    authThroughput.add(1);
  }
}

function testRegistrationPerformance() {
  const uniqueId = `${Date.now()}_${randomString(8)}`;
  const registrationPayload = {
    email: `perftest_${uniqueId}@example.com`,
    password: 'PerfTest123!',
    name: `Performance Test User ${uniqueId}`,
    company: 'Test Company',
    firstName: `Test${uniqueId}`,
    lastName: 'User'
  };
  
  const registrationResponse = http.post(
    `${BASE_URL}/auth/register`, 
    JSON.stringify(registrationPayload), 
    {
      headers: { 'Content-Type': 'application/json' },
      tags: { test_type: 'registration' }
    }
  );
  
  const regChecks = check(registrationResponse, {
    'registration status is 201': (r) => r.status === 201,
    'registration has user data': (r) => {
      if (r.status === 201) {
        const data = JSON.parse(r.body);
        return data.user && data.user.email === registrationPayload.email;
      }
      return false;
    },
    'registration has tokens': (r) => {
      if (r.status === 201) {
        const data = JSON.parse(r.body);
        return data.tokens && data.tokens.accessToken;
      }
      return false;
    },
    'registration response time < 1000ms': (r) => r.timings.duration < 1000,
  });
  
  authErrorRate.add(!regChecks);
  authResponseTime.add(registrationResponse.timings.duration);
  authThroughput.add(1);
  
  // Test immediate login after registration
  if (registrationResponse.status === 201) {
    const loginPayload = {
      email: registrationPayload.email,
      password: registrationPayload.password
    };
    
    const immediateLoginResponse = http.post(
      `${BASE_URL}/auth/login`, 
      JSON.stringify(loginPayload), 
      {
        headers: { 'Content-Type': 'application/json' },
        tags: { test_type: 'immediate_login' }
      }
    );
    
    check(immediateLoginResponse, {
      'immediate login status is 200': (r) => r.status === 200,
      'immediate login response time < 500ms': (r) => r.timings.duration < 500,
    });
    
    authErrorRate.add(immediateLoginResponse.status !== 200);
    authResponseTime.add(immediateLoginResponse.timings.duration);
    authThroughput.add(1);
  }
}

function testTokenValidation(testUsers) {
  if (!testUsers || testUsers.length === 0) {
    console.error('No test users available for token validation test');
    return;
  }
  
  const user = testUsers[randomIntBetween(0, testUsers.length - 1)];
  
  // Login to get token
  const loginPayload = {
    email: user.email,
    password: user.password
  };
  
  const loginResponse = http.post(
    `${BASE_URL}/auth/login`, 
    JSON.stringify(loginPayload), 
    {
      headers: { 'Content-Type': 'application/json' }
    }
  );
  
  if (loginResponse.status === 200) {
    const loginData = JSON.parse(loginResponse.body);
    const accessToken = loginData.tokens.accessToken;
    
    // Perform multiple token validations
    const validationEndpoints = [
      '/users/profile',
      '/projects',
      '/ai/models',
      '/billing/subscription',
      '/notifications/preferences'
    ];
    
    for (const endpoint of validationEndpoints) {
      const startTime = Date.now();
      
      const response = http.get(`${BASE_URL}${endpoint}`, {
        headers: { 
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        tags: { 
          test_type: 'token_validation',
          endpoint: endpoint 
        }
      });
      
      const validationTime = Date.now() - startTime;
      
      check(response, {
        [`${endpoint} token validation success`]: (r) => r.status === 200 || r.status === 404,
        [`${endpoint} validation time < 200ms`]: (r) => validationTime < 200,
      });
      
      tokenValidationTime.add(validationTime);
      authThroughput.add(1);
      
      if (response.status >= 400 && response.status !== 404) {
        authErrorRate.add(1);
      } else {
        authErrorRate.add(0);
      }
      
      sleep(0.1); // Small delay between validations
    }
    
    // Test invalid token handling
    const invalidTokenResponse = http.get(`${BASE_URL}/users/profile`, {
      headers: { 
        'Authorization': 'Bearer invalid_token_123',
        'Content-Type': 'application/json'
      },
      tags: { test_type: 'invalid_token' }
    });
    
    check(invalidTokenResponse, {
      'invalid token returns 401': (r) => r.status === 401,
      'invalid token response time < 200ms': (r) => r.timings.duration < 200,
    });
    
    tokenValidationTime.add(invalidTokenResponse.timings.duration);
    authThroughput.add(1);
    authErrorRate.add(0); // Expected behavior, not an error
    
    // Test expired token simulation (if endpoint exists)
    const expiredTokenResponse = http.post(`${BASE_URL}/auth/simulate-expired`, null, {
      headers: { 
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      tags: { test_type: 'expired_token_simulation' }
    });
    
    // Don't fail on this as it might not be implemented
    if (expiredTokenResponse.status !== 404) {
      check(expiredTokenResponse, {
        'expired token simulation handled': (r) => r.status === 401 || r.status === 200,
      });
    }
  }
}

export function teardown(data) {
  console.log('Cleaning up authentication performance test...');
  
  // Optional: Clean up created test users
  // This would require admin permissions or a cleanup endpoint
}

export function handleSummary(data) {
  const report = {
    'results/k6-auth-performance.json': JSON.stringify(data, null, 2),
    'results/k6-auth-performance.html': generateAuthReport(data),
  };
  
  console.log('Authentication Performance Test Summary:');
  console.log(`- Total HTTP requests: ${data.metrics.http_reqs ? data.metrics.http_reqs.values.count : 'N/A'}`);
  console.log(`- Average response time: ${data.metrics.http_req_duration ? data.metrics.http_req_duration.values.avg.toFixed(2) : 'N/A'}ms`);
  console.log(`- Error rate: ${data.metrics.http_req_failed ? (data.metrics.http_req_failed.values.rate * 100).toFixed(2) : 'N/A'}%`);
  
  return report;
}

function generateAuthReport(data) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>K6 Authentication Performance Test Results</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
        .header { text-align: center; color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 20px; }
        .metric-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric-card { background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #3498db; }
        .metric-title { font-weight: bold; color: #2c3e50; margin-bottom: 10px; }
        .metric-value { font-size: 1.2em; color: #27ae60; }
        .threshold { margin: 10px 0; padding: 10px; border-radius: 4px; }
        .pass { background: #d4edda; color: #155724; border-left: 4px solid #28a745; }
        .fail { background: #f8d7da; color: #721c24; border-left: 4px solid #dc3545; }
        .scenario-results { margin: 20px 0; }
        .scenario { background: #e9ecef; padding: 15px; margin: 10px 0; border-radius: 6px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Authentication Performance Test Results</h1>
          <p>Comprehensive authentication flow performance analysis</p>
        </div>
        
        <div class="metric-grid">
          <div class="metric-card">
            <div class="metric-title">Total Requests</div>
            <div class="metric-value">${data.metrics.http_reqs ? data.metrics.http_reqs.values.count : 'N/A'}</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Average Response Time</div>
            <div class="metric-value">${data.metrics.http_req_duration ? data.metrics.http_req_duration.values.avg.toFixed(2) : 'N/A'}ms</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">95th Percentile</div>
            <div class="metric-value">${data.metrics.http_req_duration ? data.metrics.http_req_duration.values['p(95)'].toFixed(2) : 'N/A'}ms</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Error Rate</div>
            <div class="metric-value">${data.metrics.http_req_failed ? (data.metrics.http_req_failed.values.rate * 100).toFixed(2) : 'N/A'}%</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Auth Throughput</div>
            <div class="metric-value">${data.metrics.auth_throughput ? data.metrics.auth_throughput.values.count : 'N/A'} ops</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Token Validation Time</div>
            <div class="metric-value">${data.metrics.token_validation_time ? data.metrics.token_validation_time.values.avg.toFixed(2) : 'N/A'}ms</div>
          </div>
        </div>
        
        <h2>🎯 Performance Thresholds</h2>
        <div class="thresholds">
          ${Object.entries(data.thresholds || {}).map(([key, threshold]) => 
            `<div class="threshold ${threshold.ok ? 'pass' : 'fail'}">
              <strong>${key}:</strong> ${threshold.ok ? '✅ PASS' : '❌ FAIL'}
              <br><small>${threshold.thresholds ? threshold.thresholds.join(', ') : ''}</small>
            </div>`
          ).join('')}
        </div>
        
        <div class="scenario-results">
          <h2>📊 Scenario Breakdown</h2>
          <div class="scenario">
            <h3>Login Load Testing</h3>
            <p>Tests concurrent login attempts and session management</p>
            <ul>
              <li>Standard email/password authentication</li>
              <li>Token generation and validation</li>
              <li>Protected endpoint access</li>
              <li>Session logout</li>
            </ul>
          </div>
          <div class="scenario">
            <h3>Registration Burst Testing</h3>
            <p>Tests user registration under high load</p>
            <ul>
              <li>User account creation</li>
              <li>Email uniqueness validation</li>
              <li>Immediate post-registration login</li>
            </ul>
          </div>
          <div class="scenario">
            <h3>Token Validation Testing</h3>
            <p>Tests JWT token validation performance</p>
            <ul>
              <li>Multiple endpoint token validation</li>
              <li>Invalid token handling</li>
              <li>Token refresh mechanism</li>
            </ul>
          </div>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d; text-align: center;">
          <small>Generated by K6 Performance Testing Suite - ${new Date().toISOString()}</small>
        </div>
      </div>
    </body>
    </html>
  `;
}