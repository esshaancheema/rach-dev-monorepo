/**
 * K6 Stress Testing
 * Tests system behavior beyond normal operating capacity
 * Identifies breaking points and system limits
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter, Gauge } from 'k6/metrics';
import { randomIntBetween, randomString } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

// Custom metrics for stress testing
const stressErrorRate = new Rate('stress_error_rate');
const stressResponseTime = new Trend('stress_response_time');
const stressThroughput = new Counter('stress_throughput');
const systemLoad = new Gauge('system_load');
const connectionErrors = new Counter('connection_errors');
const timeouts = new Counter('timeouts');
const serverErrors = new Counter('server_errors');

// Aggressive stress test configuration
export const options = {
  scenarios: {
    // Spike testing - sudden load increases
    spike_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 20 },   // Normal load
        { duration: '30s', target: 200 }, // Sudden spike to 200 users
        { duration: '1m', target: 200 },  // Sustain spike
        { duration: '30s', target: 400 }, // Even higher spike
        { duration: '1m', target: 400 },  // Sustain extreme load
        { duration: '2m', target: 0 },    // Quick ramp down
      ],
      gracefulRampDown: '30s',
    },
    
    // Soak testing - prolonged stress
    soak_test: {
      executor: 'constant-vus',
      vus: 100,
      duration: '30m', // Long duration stress test
    },
    
    // Volume testing - high request volume
    volume_test: {
      executor: 'constant-arrival-rate',
      rate: 100, // 100 requests per second
      timeUnit: '1s',
      duration: '15m',
      preAllocatedVUs: 50,
      maxVUs: 300,
    },
    
    // Breakpoint testing - find system limits
    breakpoint_test: {
      executor: 'ramping-arrival-rate',
      startRate: 50,
      timeUnit: '1s',
      stages: [
        { duration: '5m', target: 100 },  // 100 RPS
        { duration: '5m', target: 200 },  // 200 RPS
        { duration: '5m', target: 300 },  // 300 RPS
        { duration: '5m', target: 400 },  // 400 RPS
        { duration: '5m', target: 500 },  // 500 RPS - likely breaking point
        { duration: '5m', target: 600 },  // 600 RPS - extreme stress
      ],
      preAllocatedVUs: 100,
      maxVUs: 500,
    },
  },
  
  // Relaxed thresholds for stress testing
  thresholds: {
    http_req_duration: [
      'p(50)<2000',   // 50% under 2s (more lenient)
      'p(95)<5000',   // 95% under 5s
      'p(99)<10000',  // 99% under 10s
    ],
    http_req_failed: ['rate<0.1'], // Accept up to 10% errors under extreme stress
    stress_error_rate: ['rate<0.1'],
    stress_response_time: ['p(95)<5000'],
    connection_errors: ['count<1000'], // Monitor connection issues
    timeouts: ['count<500'],
    server_errors: ['count<200'],
  },
  
  // Extended timeouts for stress conditions
  httpDebug: 'full',
};

// Environment configuration
const config = {
  baseUrl: __ENV.API_BASE_URL || 'http://localhost:3001',
  webUrl: __ENV.BASE_URL || 'http://localhost:3000',
  stressLevel: __ENV.STRESS_LEVEL || 'high', // low, medium, high, extreme
  breakpointMode: __ENV.BREAKPOINT_MODE === 'true',
};

// Test data for stress testing
let stressTestUsers = [];
let authTokens = new Map();

export function setup() {
  console.log('Setting up stress test environment...');
  console.log(`Stress level: ${config.stressLevel}`);
  console.log(`Breakpoint mode: ${config.breakpointMode}`);
  
  // Create fewer users for stress testing (reuse them more heavily)
  const userCount = config.stressLevel === 'extreme' ? 20 : 10;
  
  for (let i = 0; i < userCount; i++) {
    const user = {
      id: `stresstest_${i}`,
      email: `stresstest${i}@example.com`,
      password: 'StressTest123!',
      name: `Stress Test User ${i}`,
      company: 'Stress Test Company',
    };
    
    try {
      // Register user
      const registerResponse = http.post(`${config.baseUrl}/auth/register`, JSON.stringify(user), {
        headers: { 'Content-Type': 'application/json' },
        timeout: '30s',
      });
      
      if (registerResponse.status === 201 || registerResponse.status === 409) {
        stressTestUsers.push(user);
        
        // Login immediately
        const loginResponse = http.post(`${config.baseUrl}/auth/login`, JSON.stringify({
          email: user.email,
          password: user.password,
        }), {
          headers: { 'Content-Type': 'application/json' },
          timeout: '30s',
        });
        
        if (loginResponse.status === 200) {
          const loginData = JSON.parse(loginResponse.body);
          authTokens.set(user.id, {
            accessToken: loginData.tokens.accessToken,
            refreshToken: loginData.tokens.refreshToken,
            userId: loginData.user.id,
          });
        }
      }
    } catch (error) {
      console.error(`Failed to setup user ${i}:`, error);
    }
    
    // Brief pause to avoid overwhelming during setup
    sleep(0.1);
  }
  
  console.log(`Stress test setup completed: ${stressTestUsers.length} users, ${authTokens.size} authenticated`);
  return { stressTestUsers, authTokens: Object.fromEntries(authTokens) };
}

export default function(data) {
  if (!data.stressTestUsers || data.stressTestUsers.length === 0) {
    console.error('No stress test users available');
    return;
  }
  
  const user = data.stressTestUsers[randomIntBetween(0, data.stressTestUsers.length - 1)];
  const tokens = data.authTokens[user.id];
  
  if (!tokens) {
    console.error(`No auth tokens for stress user ${user.id}`);
    return;
  }
  
  // Determine stress scenario based on current execution
  const scenario = selectStressScenario();
  
  try {
    switch (scenario) {
      case 'resource_intensive':
        performResourceIntensiveOperations(tokens);
        break;
      case 'rapid_fire':
        performRapidFireRequests(tokens);
        break;
      case 'data_heavy':
        performDataHeavyOperations(tokens);
        break;
      case 'concurrent_operations':
        performConcurrentOperations(tokens);
        break;
      case 'memory_pressure':
        performMemoryPressureTest(tokens);
        break;
      default:
        performResourceIntensiveOperations(tokens);
    }
  } catch (error) {
    console.error(`Stress test scenario failed:`, error);
    connectionErrors.add(1);
  }
  
  // Minimal think time for stress testing
  sleep(randomIntBetween(0.1, 0.5));
}

function selectStressScenario() {
  const scenarios = [
    'resource_intensive',
    'rapid_fire', 
    'data_heavy',
    'concurrent_operations',
    'memory_pressure'
  ];
  
  return scenarios[randomIntBetween(0, scenarios.length - 1)];
}

function performResourceIntensiveOperations(tokens) {
  const headers = {
    'Authorization': `Bearer ${tokens.accessToken}`,
    'Content-Type': 'application/json',
  };
  
  // Create multiple projects simultaneously
  const projectPromises = [];
  for (let i = 0; i < 3; i++) {
    const projectPayload = {
      name: `Stress Project ${Date.now()}_${i}`,
      description: 'High-load stress testing project with lots of content and complex structure',
      template: 'react-typescript',
      settings: {
        enableAI: true,
        enableCollaboration: true,
        autoSave: true,
        complexConfig: generateLargeConfig(),
      },
    };
    
    stressRequest('POST', '/projects', projectPayload, headers, 'stress_project_create');
  }
  
  // Heavy AI operations
  const aiPayloads = [
    {
      prompt: 'Generate a complete React application with authentication, routing, state management, API integration, testing suite, and deployment configuration. Include TypeScript, ESLint, Prettier, and comprehensive documentation.',
      context: { 
        language: 'typescript', 
        framework: 'react',
        complexity: 'enterprise'
      },
      model: 'gpt-4',
      maxTokens: 4000,
    },
    {
      prompt: 'Analyze this entire codebase for security vulnerabilities, performance issues, code quality problems, and generate a comprehensive refactoring plan with before/after examples.',
      context: {
        analysis: 'comprehensive',
        scope: 'full-application'
      },
      model: 'gpt-4',
      maxTokens: 4000,
    }
  ];
  
  for (const payload of aiPayloads) {
    stressRequest('POST', '/ai/generate', payload, headers, 'stress_ai_heavy', 60000);
  }
  
  // Database intensive operations
  stressRequest('GET', '/projects?limit=100&includeFiles=true&includeCollaborators=true', null, headers, 'stress_db_heavy');
  stressRequest('GET', '/users/activity?days=90&detailed=true', null, headers, 'stress_activity_heavy');
}

function performRapidFireRequests(tokens) {
  const headers = {
    'Authorization': `Bearer ${tokens.accessToken}`,
    'Content-Type': 'application/json',
  };
  
  // Rapid succession of requests without delays
  const endpoints = [
    '/users/profile',
    '/projects',
    '/dashboard/overview',
    '/notifications',
    '/billing/subscription',
    '/ai/models',
    '/collaborations/active',
    '/files/recent',
    '/admin/health',
    '/integrations/status',
  ];
  
  for (const endpoint of endpoints) {
    stressRequest('GET', endpoint, null, headers, 'rapid_fire');
    // No sleep - rapid fire
  }
  
  // Burst of POST requests
  for (let i = 0; i < 5; i++) {
    const chatPayload = {
      message: `Rapid fire message ${i} - ${Date.now()}`,
      context: 'stress-testing',
    };
    stressRequest('POST', '/ai/chat', chatPayload, headers, 'rapid_fire_post');
  }
}

function performDataHeavyOperations(tokens) {
  const headers = {
    'Authorization': `Bearer ${tokens.accessToken}`,
    'Content-Type': 'application/json',
  };
  
  // Large file upload simulation
  const largeFileContent = generateLargeFileContent();
  const filePayload = {
    name: `stress-test-large-${Date.now()}.json`,
    content: largeFileContent,
    path: '/stress-test',
    metadata: {
      size: largeFileContent.length,
      type: 'application/json',
      stress_test: true,
    },
  };
  
  stressRequest('POST', '/files', filePayload, headers, 'large_file_upload', 30000);
  
  // Bulk operations
  const bulkPayload = {
    operations: Array.from({ length: 50 }, (_, i) => ({
      type: 'create',
      data: {
        name: `bulk-item-${i}`,
        content: generateRandomContent(1000),
      },
    })),
  };
  
  stressRequest('POST', '/files/bulk', bulkPayload, headers, 'bulk_operations', 45000);
  
  // Large data retrieval
  stressRequest('GET', '/analytics/detailed?timeRange=year&includeRaw=true', null, headers, 'large_data_retrieval', 30000);
}

function performConcurrentOperations(tokens) {
  const headers = {
    'Authorization': `Bearer ${tokens.accessToken}`,
    'Content-Type': 'application/json',
  };
  
  // Simulate concurrent user actions
  const operations = [
    () => stressRequest('GET', '/projects', null, headers, 'concurrent_list'),
    () => stressRequest('POST', '/projects', {
      name: `Concurrent Project ${Date.now()}`,
      template: 'react-typescript',
    }, headers, 'concurrent_create'),
    () => stressRequest('GET', '/users/profile', null, headers, 'concurrent_profile'),
    () => stressRequest('POST', '/ai/chat', {
      message: 'Help with concurrent operations',
    }, headers, 'concurrent_ai'),
    () => stressRequest('GET', '/notifications?unread=true', null, headers, 'concurrent_notifications'),
  ];
  
  // Execute all operations "simultaneously" (no sleep between)
  for (const operation of operations) {
    operation();
  }
}

function performMemoryPressureTest(tokens) {
  const headers = {
    'Authorization': `Bearer ${tokens.accessToken}`,
    'Content-Type': 'application/json',
  };
  
  // Operations designed to consume memory
  const memoryIntensivePayload = {
    data: Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      content: generateRandomContent(500),
      metadata: {
        created: new Date().toISOString(),
        tags: Array.from({ length: 20 }, () => randomString(10)),
        nested: {
          level1: generateRandomContent(100),
          level2: {
            data: generateRandomContent(200),
            moreData: Array.from({ length: 50 }, () => randomString(20)),
          },
        },
      },
    })),
  };
  
  stressRequest('POST', '/data/process', memoryIntensivePayload, headers, 'memory_pressure', 60000);
  
  // Multiple large AI requests to stress memory
  for (let i = 0; i < 3; i++) {
    const aiPayload = {
      prompt: `Process this large dataset and generate comprehensive analysis: ${JSON.stringify(memoryIntensivePayload.data.slice(0, 100))}`,
      context: { analysis: 'comprehensive', dataset: 'large' },
      model: 'gpt-4',
      maxTokens: 3000,
    };
    
    stressRequest('POST', '/ai/analyze', aiPayload, headers, 'memory_ai_stress', 90000);
  }
}

function stressRequest(method, endpoint, payload, headers, tag, timeout = 15000) {
  const url = `${config.baseUrl}${endpoint}`;
  let response;
  
  const requestOptions = {
    headers,
    timeout: `${timeout}ms`,
    tags: { 
      test_type: 'stress_test',
      endpoint_type: tag,
      method: method.toLowerCase(),
      stress_level: config.stressLevel,
    },
  };
  
  const startTime = Date.now();
  
  try {
    switch (method.toUpperCase()) {
      case 'GET':
        response = http.get(url, requestOptions);
        break;
      case 'POST':
        response = http.post(url, payload ? JSON.stringify(payload) : null, requestOptions);
        break;
      case 'PUT':
        response = http.put(url, payload ? JSON.stringify(payload) : null, requestOptions);
        break;
      case 'DELETE':
        response = http.del(url, null, requestOptions);
        break;
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }
    
    const duration = Date.now() - startTime;
    
    // More lenient checks for stress testing
    const success = check(response, {
      [`${tag} completed`]: (r) => r.status !== 0, // Any response is better than no response
      [`${tag} not server error`]: (r) => r.status < 500 || r.status === 503, // 503 is acceptable under stress
    });
    
    // Categorize different types of failures
    if (response.status === 0) {
      connectionErrors.add(1);
    } else if (response.status === 408 || response.timings.duration >= timeout) {
      timeouts.add(1);
    } else if (response.status >= 500) {
      serverErrors.add(1);
    }
    
    // Record metrics
    stressErrorRate.add(!success);
    stressResponseTime.add(duration);
    stressThroughput.add(1);
    
    // Simulate system load based on response time
    const loadLevel = Math.min(duration / 1000, 10); // Scale 0-10 based on response time
    systemLoad.add(loadLevel);
    
    return response;
    
  } catch (error) {
    console.error(`Stress request failed: ${method} ${endpoint}`, error.message);
    connectionErrors.add(1);
    stressErrorRate.add(1);
    return null;
  }
}

// Utility functions for generating test data
function generateLargeConfig() {
  return {
    features: Array.from({ length: 100 }, (_, i) => `feature_${i}`),
    settings: Object.fromEntries(
      Array.from({ length: 50 }, (_, i) => [`setting_${i}`, randomString(20)])
    ),
    data: Array.from({ length: 200 }, () => ({
      id: randomString(10),
      value: randomIntBetween(1, 1000),
      metadata: randomString(50),
    })),
  };
}

function generateLargeFileContent() {
  const data = {
    timestamp: new Date().toISOString(),
    data: Array.from({ length: 5000 }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
      description: randomString(100),
      tags: Array.from({ length: 10 }, () => randomString(8)),
      metadata: {
        created: new Date(Date.now() - randomIntBetween(0, 86400000)).toISOString(),
        modified: new Date().toISOString(),
        version: randomIntBetween(1, 10),
        properties: Object.fromEntries(
          Array.from({ length: 20 }, (_, j) => [`prop_${j}`, randomString(15)])
        ),
      },
    })),
  };
  
  return JSON.stringify(data);
}

function generateRandomContent(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,!?';
  return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
}

export function teardown(data) {
  console.log('Stress test completed');
  
  // Log final metrics
  console.log('\n=== STRESS TEST SUMMARY ===');
  console.log(`Users: ${data.stressTestUsers ? data.stressTestUsers.length : 'N/A'}`);
  console.log(`Stress Level: ${config.stressLevel}`);
  console.log(`Breakpoint Mode: ${config.breakpointMode}`);
}

export function handleSummary(data) {
  return {
    'results/k6-stress-test.json': JSON.stringify(data, null, 2),
    'results/k6-stress-test.html': generateStressTestReport(data),
    stdout: generateStressConsoleReport(data),
  };
}

function generateStressConsoleReport(data) {
  const metrics = data.metrics || {};
  
  return `
╔══════════════════════════════════════════════════════════════════════════════╗
║                          ⚡ STRESS TEST RESULTS                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

🔥 STRESS METRICS:
  Total Requests:     ${metrics.http_reqs ? metrics.http_reqs.values.count.toLocaleString() : 'N/A'}
  Peak RPS:          ${metrics.http_reqs ? metrics.http_reqs.values.rate.toFixed(2) : 'N/A'}
  Error Rate:        ${metrics.http_req_failed ? (metrics.http_req_failed.values.rate * 100).toFixed(2) : 'N/A'}%
  
⚠️  FAILURE BREAKDOWN:
  Connection Errors:  ${metrics.connection_errors ? metrics.connection_errors.values.count : 'N/A'}
  Timeouts:          ${metrics.timeouts ? metrics.timeouts.values.count : 'N/A'}
  Server Errors:     ${metrics.server_errors ? metrics.server_errors.values.count : 'N/A'}

📊 RESPONSE TIMES UNDER STRESS:
  Average:           ${metrics.http_req_duration ? metrics.http_req_duration.values.avg.toFixed(2) : 'N/A'}ms
  95th Percentile:   ${metrics.http_req_duration ? metrics.http_req_duration.values['p(95)'].toFixed(2) : 'N/A'}ms
  99th Percentile:   ${metrics.http_req_duration ? metrics.http_req_duration.values['p(99)'].toFixed(2) : 'N/A'}ms
  Maximum:           ${metrics.http_req_duration ? metrics.http_req_duration.values.max.toFixed(2) : 'N/A'}ms

🎯 STRESS THRESHOLDS:
${Object.entries(data.thresholds || {}).map(([key, threshold]) => 
  `  ${key}: ${threshold.ok ? '✅ PASSED' : '❌ FAILED'}`
).join('\n')}

⚡ SYSTEM LOAD:
  Peak Load Level:   ${metrics.system_load ? metrics.system_load.values.max.toFixed(2) : 'N/A'}/10
  Average Load:      ${metrics.system_load ? metrics.system_load.values.avg.toFixed(2) : 'N/A'}/10

Duration: ${data.state ? (data.state.testRunDurationMs / 1000 / 60).toFixed(1) : 'N/A'} minutes
Stress Level: ${config.stressLevel.toUpperCase()}
Generated: ${new Date().toISOString()}
  `;
}

function generateStressTestReport(data) {
  const metrics = data.metrics || {};
  const failureRate = metrics.http_req_failed ? metrics.http_req_failed.values.rate : 0;
  const avgResponseTime = metrics.http_req_duration ? metrics.http_req_duration.values.avg : 0;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>K6 Stress Test Results - Breaking Point Analysis</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 50%, #c0392b 100%); 
          min-height: 100vh; 
          padding: 20px; 
          color: #fff;
        }
        .container { max-width: 1400px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { font-size: 3em; margin-bottom: 10px; text-shadow: 3px 3px 6px rgba(0,0,0,0.4); }
        .severity-badge { 
          display: inline-block; 
          padding: 10px 20px; 
          border-radius: 25px; 
          font-weight: bold; 
          margin: 10px;
          text-transform: uppercase;
        }
        .severity-high { background: #e74c3c; color: white; }
        .severity-extreme { background: #8e44ad; color: white; }
        .cards-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .card { background: rgba(255,255,255,0.95); border-radius: 15px; padding: 25px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); color: #2c3e50; }
        .card.critical { border-left: 5px solid #e74c3c; }
        .card.warning { border-left: 5px solid #f39c12; }
        .card.success { border-left: 5px solid #27ae60; }
        .card h3 { margin-bottom: 20px; font-size: 1.3em; }
        .metric { display: flex; justify-content: space-between; align-items: center; margin: 12px 0; padding: 10px 0; border-bottom: 1px solid #ecf0f1; }
        .metric:last-child { border-bottom: none; }
        .metric-value { font-weight: bold; font-size: 1.2em; }
        .metric-value.critical { color: #e74c3c; }
        .metric-value.warning { color: #f39c12; }
        .metric-value.good { color: #27ae60; }
        .breakdown { background: rgba(255,255,255,0.95); border-radius: 15px; padding: 25px; margin: 20px 0; color: #2c3e50; }
        .breakdown-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ecf0f1; }
        .scenarios { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px; margin: 20px 0; }
        .scenario { background: rgba(255,255,255,0.9); padding: 20px; border-radius: 10px; color: #2c3e50; }
        .threshold { display: flex; justify-content: space-between; align-items: center; padding: 12px; margin: 8px 0; border-radius: 8px; }
        .threshold.pass { background: rgba(39, 174, 96, 0.1); color: #27ae60; border: 1px solid #27ae60; }
        .threshold.fail { background: rgba(231, 76, 60, 0.1); color: #e74c3c; border: 1px solid #e74c3c; }
        .footer { text-align: center; margin-top: 40px; opacity: 0.9; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚡ STRESS TEST RESULTS</h1>
          <p>System Breaking Point Analysis</p>
          <div class="severity-badge severity-${config.stressLevel === 'extreme' ? 'extreme' : 'high'}">
            STRESS LEVEL: ${config.stressLevel.toUpperCase()}
          </div>
          <small>Generated on ${new Date().toISOString()}</small>
        </div>
        
        <div class="cards-grid">
          <div class="card ${failureRate > 0.05 ? 'critical' : failureRate > 0.02 ? 'warning' : 'success'}">
            <h3>🔥 Stress Impact</h3>
            <div class="metric">
              <span>Total Requests</span>
              <span class="metric-value">${metrics.http_reqs ? metrics.http_reqs.values.count.toLocaleString() : 'N/A'}</span>
            </div>
            <div class="metric">
              <span>Peak RPS</span>
              <span class="metric-value">${metrics.http_reqs ? metrics.http_reqs.values.rate.toFixed(2) : 'N/A'}</span>
            </div>
            <div class="metric">
              <span>Error Rate</span>
              <span class="metric-value ${failureRate > 0.05 ? 'critical' : failureRate > 0.02 ? 'warning' : 'good'}">${(failureRate * 100).toFixed(2)}%</span>
            </div>
          </div>
          
          <div class="card ${avgResponseTime > 3000 ? 'critical' : avgResponseTime > 1000 ? 'warning' : 'success'}">
            <h3>⏱️ Response Times Under Stress</h3>
            <div class="metric">
              <span>Average</span>
              <span class="metric-value">${metrics.http_req_duration ? metrics.http_req_duration.values.avg.toFixed(2) : 'N/A'}ms</span>
            </div>
            <div class="metric">
              <span>95th Percentile</span>
              <span class="metric-value ${metrics.http_req_duration && metrics.http_req_duration.values['p(95)'] > 5000 ? 'critical' : 'warning'}">${metrics.http_req_duration ? metrics.http_req_duration.values['p(95)'].toFixed(2) : 'N/A'}ms</span>
            </div>
            <div class="metric">
              <span>Maximum</span>
              <span class="metric-value critical">${metrics.http_req_duration ? metrics.http_req_duration.values.max.toFixed(2) : 'N/A'}ms</span>
            </div>
          </div>
          
          <div class="card">
            <h3>⚠️ Failure Breakdown</h3>
            <div class="metric">
              <span>Connection Errors</span>
              <span class="metric-value critical">${metrics.connection_errors ? metrics.connection_errors.values.count : 'N/A'}</span>
            </div>
            <div class="metric">
              <span>Timeouts</span>
              <span class="metric-value warning">${metrics.timeouts ? metrics.timeouts.values.count : 'N/A'}</span>
            </div>
            <div class="metric">
              <span>Server Errors</span>
              <span class="metric-value critical">${metrics.server_errors ? metrics.server_errors.values.count : 'N/A'}</span>
            </div>
          </div>
          
          <div class="card">
            <h3>💪 System Load</h3>
            <div class="metric">
              <span>Peak Load Level</span>
              <span class="metric-value">${metrics.system_load ? metrics.system_load.values.max.toFixed(2) : 'N/A'}/10</span>
            </div>
            <div class="metric">
              <span>Average Load</span>
              <span class="metric-value">${metrics.system_load ? metrics.system_load.values.avg.toFixed(2) : 'N/A'}/10</span>
            </div>
            <div class="metric">
              <span>Test Duration</span>
              <span class="metric-value">${data.state ? (data.state.testRunDurationMs / 1000 / 60).toFixed(1) : 'N/A'}min</span>
            </div>
          </div>
        </div>
        
        <div class="breakdown">
          <h3>🎯 Stress Test Thresholds</h3>
          ${Object.entries(data.thresholds || {}).map(([key, threshold]) => 
            `<div class="threshold ${threshold.ok ? 'pass' : 'fail'}">
              <span><strong>${key}</strong></span>
              <span>${threshold.ok ? '✅ SURVIVED' : '💥 EXCEEDED'}</span>
            </div>`
          ).join('')}
        </div>
        
        <div class="scenarios">
          <div class="scenario">
            <h4>🚀 Spike Testing</h4>
            <p>Sudden load spikes from 20 → 200 → 400 users</p>
            <small>Tests system recovery from traffic bursts</small>
          </div>
          <div class="scenario">
            <h4>🔄 Soak Testing</h4>
            <p>Sustained load of 100 users for 30 minutes</p>
            <small>Identifies memory leaks and degradation</small>
          </div>
          <div class="scenario">
            <h4>📊 Volume Testing</h4>
            <p>High-volume 100 RPS for 15 minutes</p>
            <small>Tests database and I/O performance</small>
          </div>
          <div class="scenario">
            <h4>💥 Breakpoint Testing</h4>
            <p>Gradual increase: 50 → 600 RPS</p>
            <small>Finds the actual system breaking point</small>
          </div>
        </div>
        
        <div class="footer">
          <h3>⚡ STRESS TEST COMPLETE ⚡</h3>
          <p>System limits have been identified and documented</p>
          <small>K6 Stress Testing Suite • Zoptal Platform</small>
        </div>
      </div>
    </body>
    </html>
  `;
}