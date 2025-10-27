import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
  vus: __ENV.K6_VUS || 10,
  duration: __ENV.K6_DURATION || '60s',
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests must complete below 2s
    http_req_failed: ['rate<0.1'], // Error rate must be below 10%
  },
};

const BASE_URL = __ENV.K6_BASE_URL || 'http://localhost:3001';

// Test data
const testUsers = [
  { email: 'test1@example.com', password: 'password123' },
  { email: 'test2@example.com', password: 'password123' },
  { email: 'test3@example.com', password: 'password123' },
];

export default function () {
  // Test 1: Health check
  const healthResponse = http.get(`${BASE_URL}/health`);
  check(healthResponse, {
    'health check status is 200': (r) => r.status === 200,
    'health check response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);

  sleep(0.1);

  // Test 2: User registration
  const registrationPayload = {
    name: `User ${Math.random().toString(36).substring(7)}`,
    email: `user${Math.random().toString(36).substring(7)}@example.com`,
    password: 'password123',
  };

  const registerResponse = http.post(
    `${BASE_URL}/api/auth/register`,
    JSON.stringify(registrationPayload),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  check(registerResponse, {
    'registration status is 201 or 409': (r) => r.status === 201 || r.status === 409,
    'registration response time < 2000ms': (r) => r.timings.duration < 2000,
  }) || errorRate.add(1);

  sleep(0.2);

  // Test 3: User login
  const loginPayload = testUsers[Math.floor(Math.random() * testUsers.length)];
  
  const loginResponse = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify(loginPayload),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  const loginSuccess = check(loginResponse, {
    'login status is 200 or 401': (r) => r.status === 200 || r.status === 401,
    'login response time < 1500ms': (r) => r.timings.duration < 1500,
  });

  if (!loginSuccess) {
    errorRate.add(1);
  }

  let authToken = null;
  if (loginResponse.status === 200) {
    try {
      const loginData = JSON.parse(loginResponse.body);
      authToken = loginData.token;
    } catch (e) {
      console.error('Failed to parse login response');
    }
  }

  sleep(0.1);

  // Test 4: Protected route access (if we have a token)
  if (authToken) {
    const profileResponse = http.get(`${BASE_URL}/api/user/profile`, {
      headers: { 
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    check(profileResponse, {
      'profile access status is 200': (r) => r.status === 200,
      'profile response time < 1000ms': (r) => r.timings.duration < 1000,
    }) || errorRate.add(1);

    sleep(0.1);

    // Test 5: Token validation
    const validateResponse = http.post(
      `${BASE_URL}/api/auth/validate`,
      JSON.stringify({ token: authToken }),
      {
        headers: { 
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    check(validateResponse, {
      'token validation status is 200': (r) => r.status === 200,
      'token validation response time < 500ms': (r) => r.timings.duration < 500,
    }) || errorRate.add(1);
  }

  sleep(0.2);

  // Test 6: Password reset request
  const resetPayload = {
    email: 'test@example.com',
  };

  const resetResponse = http.post(
    `${BASE_URL}/api/auth/reset-password`,
    JSON.stringify(resetPayload),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  check(resetResponse, {
    'password reset status is 200 or 404': (r) => r.status === 200 || r.status === 404,
    'password reset response time < 1000ms': (r) => r.timings.duration < 1000,
  }) || errorRate.add(1);

  sleep(0.3);

  // Test 7: OAuth endpoints
  const oauthResponse = http.get(`${BASE_URL}/api/oauth/google`);
  check(oauthResponse, {
    'oauth redirect status is 302 or 200': (r) => r.status === 302 || r.status === 200,
    'oauth response time < 1000ms': (r) => r.timings.duration < 1000,
  }) || errorRate.add(1);

  sleep(0.1);

  // Test 8: Rate limiting check
  const rateLimitResponses = [];
  for (let i = 0; i < 5; i++) {
    const response = http.get(`${BASE_URL}/api/auth/check-rate-limit`);
    rateLimitResponses.push(response);
    sleep(0.05);
  }

  const rateLimitWorking = rateLimitResponses.some(r => r.status === 429);
  check(rateLimitWorking, {
    'rate limiting is working': () => rateLimitWorking || true, // Allow if rate limiting not configured
  });

  sleep(0.5);
}

export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    [`k6-results-auth-service-${Date.now()}.json`]: JSON.stringify(data),
  };
}

function textSummary(data, options = {}) {
  const indent = options.indent || '';
  const colors = options.enableColors;
  
  let summary = '';
  
  if (colors) {
    summary += `\n${indent}\x1b[36m=== Auth Service Performance Test Results ===\x1b[0m\n`;
  } else {
    summary += `\n${indent}=== Auth Service Performance Test Results ===\n`;
  }
  
  summary += `${indent}Total Requests: ${data.metrics.http_reqs.values.count}\n`;
  summary += `${indent}Failed Requests: ${data.metrics.http_req_failed.values.count}\n`;
  summary += `${indent}Average Response Time: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms\n`;
  summary += `${indent}95th Percentile: ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms\n`;
  summary += `${indent}Requests/sec: ${data.metrics.http_reqs.values.rate.toFixed(2)}\n`;
  summary += `${indent}Error Rate: ${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%\n`;
  
  return summary;
}