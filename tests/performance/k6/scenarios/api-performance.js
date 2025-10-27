/**
 * K6 API Performance Testing
 * Tests individual API endpoints for response time and throughput
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { parseHTML } from 'k6/html';

// Custom metrics
const errorRate = new Rate('error_rate');
const responseTime = new Trend('response_time');
const throughput = new Counter('throughput');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 10 },   // Ramp up
    { duration: '5m', target: 10 },   // Stay at 10 users
    { duration: '2m', target: 20 },   // Ramp up to 20 users
    { duration: '5m', target: 20 },   // Stay at 20 users
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95% < 500ms, 99% < 1000ms
    http_req_failed: ['rate<0.05'],                  // Error rate < 5%
    error_rate: ['rate<0.05'],
    response_time: ['p(95)<500'],
  },
};

// Environment configuration
const BASE_URL = __ENV.API_BASE_URL || 'http://localhost:3001';
const TEST_USER_EMAIL = __ENV.TEST_USER_EMAIL || 'perftest@example.com';
const TEST_USER_PASSWORD = __ENV.TEST_USER_PASSWORD || 'PerfTest123!';

// Test data
let authToken = '';
let userId = '';
let projectId = '';

export function setup() {
  console.log('Setting up API performance test...');
  
  // Register test user
  const registerPayload = {
    email: TEST_USER_EMAIL,
    password: TEST_USER_PASSWORD,
    name: 'Performance Test User',
    company: 'Test Company'
  };

  const registerResponse = http.post(`${BASE_URL}/auth/register`, JSON.stringify(registerPayload), {
    headers: { 'Content-Type': 'application/json' },
  });

  if (registerResponse.status === 201 || registerResponse.status === 409) {
    // Login to get auth token
    const loginPayload = {
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD
    };

    const loginResponse = http.post(`${BASE_URL}/auth/login`, JSON.stringify(loginPayload), {
      headers: { 'Content-Type': 'application/json' },
    });

    if (loginResponse.status === 200) {
      const loginData = JSON.parse(loginResponse.body);
      authToken = loginData.tokens.accessToken;
      userId = loginData.user.id;
      console.log('Test user authenticated successfully');
    }
  }

  return { authToken, userId };
}

export default function(data) {
  const { authToken, userId } = data;
  
  if (!authToken) {
    console.error('No auth token available, skipping test');
    return;
  }

  const headers = {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json',
  };

  // Test 1: Health Check Endpoint
  testHealthCheck();
  
  // Test 2: User Profile Operations
  testUserProfile(headers, userId);
  
  // Test 3: Project Operations
  testProjectOperations(headers);
  
  // Test 4: AI Service Integration
  testAIService(headers);
  
  // Test 5: File Operations
  testFileOperations(headers);
  
  // Random sleep between 1-3 seconds
  sleep(Math.random() * 2 + 1);
}

function testHealthCheck() {
  const response = http.get(`${BASE_URL}/health`);
  
  check(response, {
    'health check status is 200': (r) => r.status === 200,
    'health check response time < 100ms': (r) => r.timings.duration < 100,
  });
  
  errorRate.add(response.status !== 200);
  responseTime.add(response.timings.duration);
  throughput.add(1);
}

function testUserProfile(headers, userId) {
  // Get user profile
  const getProfileResponse = http.get(`${BASE_URL}/users/${userId}`, { headers });
  
  check(getProfileResponse, {
    'get profile status is 200': (r) => r.status === 200,
    'get profile has user data': (r) => {
      const data = JSON.parse(r.body);
      return data.user && data.user.id === userId;
    },
    'get profile response time < 300ms': (r) => r.timings.duration < 300,
  });
  
  errorRate.add(getProfileResponse.status !== 200);
  responseTime.add(getProfileResponse.timings.duration);
  throughput.add(1);
  
  // Update user profile
  const updatePayload = {
    name: `Updated User ${Date.now()}`,
    company: 'Updated Company'
  };
  
  const updateResponse = http.put(
    `${BASE_URL}/users/${userId}`, 
    JSON.stringify(updatePayload), 
    { headers }
  );
  
  check(updateResponse, {
    'update profile status is 200': (r) => r.status === 200,
    'update profile response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  errorRate.add(updateResponse.status !== 200);
  responseTime.add(updateResponse.timings.duration);
  throughput.add(1);
}

function testProjectOperations(headers) {
  // Create project
  const createProjectPayload = {
    name: `Performance Test Project ${Date.now()}`,
    description: 'Created during performance testing',
    template: 'react-typescript',
    visibility: 'private'
  };
  
  const createResponse = http.post(
    `${BASE_URL}/projects`, 
    JSON.stringify(createProjectPayload), 
    { headers }
  );
  
  check(createResponse, {
    'create project status is 201': (r) => r.status === 201,
    'create project response time < 1000ms': (r) => r.timings.duration < 1000,
  });
  
  errorRate.add(createResponse.status !== 201);
  responseTime.add(createResponse.timings.duration);
  throughput.add(1);
  
  if (createResponse.status === 201) {
    const projectData = JSON.parse(createResponse.body);
    const projectId = projectData.project.id;
    
    // Get project
    const getResponse = http.get(`${BASE_URL}/projects/${projectId}`, { headers });
    
    check(getResponse, {
      'get project status is 200': (r) => r.status === 200,
      'get project response time < 300ms': (r) => r.timings.duration < 300,
    });
    
    errorRate.add(getResponse.status !== 200);
    responseTime.add(getResponse.timings.duration);
    throughput.add(1);
    
    // List projects
    const listResponse = http.get(`${BASE_URL}/projects?limit=10&page=1`, { headers });
    
    check(listResponse, {
      'list projects status is 200': (r) => r.status === 200,
      'list projects has pagination': (r) => {
        const data = JSON.parse(r.body);
        return data.pagination && data.projects;
      },
      'list projects response time < 500ms': (r) => r.timings.duration < 500,
    });
    
    errorRate.add(listResponse.status !== 200);
    responseTime.add(listResponse.timings.duration);
    throughput.add(1);
    
    // Delete project (cleanup)
    const deleteResponse = http.del(`${BASE_URL}/projects/${projectId}`, null, { headers });
    
    check(deleteResponse, {
      'delete project status is 200': (r) => r.status === 200,
      'delete project response time < 500ms': (r) => r.timings.duration < 500,
    });
    
    errorRate.add(deleteResponse.status !== 200);
    responseTime.add(deleteResponse.timings.duration);
    throughput.add(1);
  }
}

function testAIService(headers) {
  // Test AI code generation
  const aiPayload = {
    prompt: 'Create a simple React button component',
    context: {
      language: 'typescript',
      framework: 'react'
    },
    model: 'gpt-3.5-turbo',
    maxTokens: 500
  };
  
  const aiResponse = http.post(
    `${BASE_URL}/ai/generate`, 
    JSON.stringify(aiPayload), 
    { 
      headers,
      timeout: '30s' // AI requests can take longer
    }
  );
  
  check(aiResponse, {
    'ai generation status is 200': (r) => r.status === 200,
    'ai generation has code': (r) => {
      if (r.status === 200) {
        const data = JSON.parse(r.body);
        return data.code && data.code.length > 0;
      }
      return false;
    },
    'ai generation response time < 10s': (r) => r.timings.duration < 10000,
  });
  
  errorRate.add(aiResponse.status !== 200);
  responseTime.add(aiResponse.timings.duration);
  throughput.add(1);
  
  // Test AI chat
  const chatPayload = {
    message: 'Explain how React hooks work',
    context: 'react-development'
  };
  
  const chatResponse = http.post(
    `${BASE_URL}/ai/chat`, 
    JSON.stringify(chatPayload), 
    { 
      headers,
      timeout: '30s'
    }
  );
  
  check(chatResponse, {
    'ai chat status is 200': (r) => r.status === 200,
    'ai chat has response': (r) => {
      if (r.status === 200) {
        const data = JSON.parse(r.body);
        return data.response && data.response.length > 0;
      }
      return false;
    },
    'ai chat response time < 15s': (r) => r.timings.duration < 15000,
  });
  
  errorRate.add(chatResponse.status !== 200);
  responseTime.add(chatResponse.timings.duration);
  throughput.add(1);
}

function testFileOperations(headers) {
  // Create a simple text file
  const fileContent = `// Performance test file created at ${new Date().toISOString()}
export const testFunction = () => {
  return 'Hello from performance test!';
};`;
  
  const createFilePayload = {
    name: `perf-test-${Date.now()}.ts`,
    content: fileContent,
    path: '/src/components'
  };
  
  const createFileResponse = http.post(
    `${BASE_URL}/files`, 
    JSON.stringify(createFilePayload), 
    { headers }
  );
  
  check(createFileResponse, {
    'create file status is 201': (r) => r.status === 201,
    'create file response time < 1000ms': (r) => r.timings.duration < 1000,
  });
  
  errorRate.add(createFileResponse.status !== 201);
  responseTime.add(createFileResponse.timings.duration);
  throughput.add(1);
  
  if (createFileResponse.status === 201) {
    const fileData = JSON.parse(createFileResponse.body);
    const fileId = fileData.file.id;
    
    // Read file
    const readResponse = http.get(`${BASE_URL}/files/${fileId}`, { headers });
    
    check(readResponse, {
      'read file status is 200': (r) => r.status === 200,
      'read file has content': (r) => {
        const data = JSON.parse(r.body);
        return data.file && data.file.content;
      },
      'read file response time < 300ms': (r) => r.timings.duration < 300,
    });
    
    errorRate.add(readResponse.status !== 200);
    responseTime.add(readResponse.timings.duration);
    throughput.add(1);
    
    // Update file
    const updateFilePayload = {
      content: fileContent + '\n// Updated during performance test'
    };
    
    const updateFileResponse = http.put(
      `${BASE_URL}/files/${fileId}`, 
      JSON.stringify(updateFilePayload), 
      { headers }
    );
    
    check(updateFileResponse, {
      'update file status is 200': (r) => r.status === 200,
      'update file response time < 500ms': (r) => r.timings.duration < 500,
    });
    
    errorRate.add(updateFileResponse.status !== 200);
    responseTime.add(updateFileResponse.timings.duration);
    throughput.add(1);
    
    // Delete file (cleanup)
    const deleteFileResponse = http.del(`${BASE_URL}/files/${fileId}`, null, { headers });
    
    check(deleteFileResponse, {
      'delete file status is 200': (r) => r.status === 200,
      'delete file response time < 300ms': (r) => r.timings.duration < 300,
    });
    
    errorRate.add(deleteFileResponse.status !== 200);
    responseTime.add(deleteFileResponse.timings.duration);
    throughput.add(1);
  }
}

export function teardown(data) {
  console.log('Cleaning up API performance test...');
  
  // Optional: Clean up test user
  // This would require admin permissions
}

export function handleSummary(data) {
  return {
    'results/k6-api-performance.json': JSON.stringify(data, null, 2),
    'results/k6-api-performance.html': htmlReport(data),
  };
}

function htmlReport(data) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>K6 API Performance Test Results</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .metric { margin: 10px 0; padding: 10px; background: #f5f5f5; }
        .pass { color: green; }
        .fail { color: red; }
        .summary { background: #e7f3ff; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <h1>K6 API Performance Test Results</h1>
      <div class="summary">
        <h2>Summary</h2>
        <p><strong>Test Duration:</strong> ${data.state ? data.state.testRunDurationMs/1000 : 'N/A'}s</p>
        <p><strong>Virtual Users:</strong> ${data.metrics.vus ? data.metrics.vus.values.value : 'N/A'}</p>
        <p><strong>Iterations:</strong> ${data.metrics.iterations ? data.metrics.iterations.values.count : 'N/A'}</p>
        <p><strong>HTTP Requests:</strong> ${data.metrics.http_reqs ? data.metrics.http_reqs.values.count : 'N/A'}</p>
      </div>
      
      <h2>Key Metrics</h2>
      <div class="metrics">
        ${Object.entries(data.metrics || {}).map(([key, metric]) => 
          `<div class="metric">
            <strong>${key}:</strong> 
            ${metric.values ? Object.entries(metric.values).map(([k, v]) => `${k}: ${v}`).join(', ') : 'N/A'}
          </div>`
        ).join('')}
      </div>
      
      <h2>Thresholds</h2>
      <div class="thresholds">
        ${Object.entries(data.thresholds || {}).map(([key, threshold]) => 
          `<div class="metric ${threshold.ok ? 'pass' : 'fail'}">
            <strong>${key}:</strong> ${threshold.ok ? 'PASS' : 'FAIL'}
          </div>`
        ).join('')}
      </div>
    </body>
    </html>
  `;
}