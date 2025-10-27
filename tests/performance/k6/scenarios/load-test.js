/**
 * K6 Load Testing
 * Tests system behavior under expected load conditions
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter, Gauge } from 'k6/metrics';
import { randomIntBetween, randomString } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

// Custom metrics
const loadErrorRate = new Rate('load_error_rate');
const loadResponseTime = new Trend('load_response_time');
const loadThroughput = new Counter('load_throughput');
const activeUsers = new Gauge('active_users');
const databaseConnections = new Gauge('database_connections');

// Load test configuration
export const options = {
  scenarios: {
    // Gradual ramp-up load test
    ramp_up_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '5m', target: 20 },   // Ramp up to 20 users over 5 minutes
        { duration: '10m', target: 50 },  // Ramp up to 50 users over 10 minutes
        { duration: '15m', target: 50 },  // Stay at 50 users for 15 minutes
        { duration: '10m', target: 100 }, // Ramp up to 100 users over 10 minutes
        { duration: '15m', target: 100 }, // Stay at 100 users for 15 minutes
        { duration: '5m', target: 0 },    // Ramp down to 0 users over 5 minutes
      ],
      gracefulRampDown: '2m',
    },
    
    // Constant arrival rate test
    constant_load: {
      executor: 'constant-arrival-rate',
      rate: 30, // 30 requests per second
      timeUnit: '1s',
      duration: '30m',
      preAllocatedVUs: 20,
      maxVUs: 100,
    },
    
    // Peak hours simulation
    peak_hours: {
      executor: 'ramping-arrival-rate',
      startRate: 10,
      timeUnit: '1s',
      stages: [
        { duration: '5m', target: 20 },   // Morning rush
        { duration: '10m', target: 20 },  // Steady morning
        { duration: '5m', target: 50 },   // Lunch peak
        { duration: '10m', target: 50 },  // Lunch sustained
        { duration: '5m', target: 30 },   // Afternoon
        { duration: '10m', target: 30 },  // Afternoon sustained
        { duration: '5m', target: 60 },   // Evening peak
        { duration: '10m', target: 60 },  // Evening sustained
        { duration: '5m', target: 10 },   // Night wind-down
      ],
      preAllocatedVUs: 30,
      maxVUs: 150,
    },
  },
  
  thresholds: {
    http_req_duration: [
      'p(50)<400',   // 50% of requests under 400ms
      'p(95)<800',   // 95% of requests under 800ms
      'p(99)<1500',  // 99% of requests under 1.5s
    ],
    http_req_failed: ['rate<0.03'], // Less than 3% errors
    load_error_rate: ['rate<0.03'],
    load_response_time: ['p(95)<800'],
    http_reqs: ['rate>25'], // At least 25 requests per second
  },
  
  // External metrics collection
  ext: {
    loadimpact: {
      distribution: {
        'amazon:us:ashburn': { loadZone: 'amazon:us:ashburn', percent: 60 },
        'amazon:ie:dublin': { loadZone: 'amazon:ie:dublin', percent: 20 },
        'amazon:sg:singapore': { loadZone: 'amazon:sg:singapore', percent: 20 },
      },
    },
  },
};

// Environment configuration
const config = {
  baseUrl: __ENV.API_BASE_URL || 'http://localhost:3001',
  webUrl: __ENV.BASE_URL || 'http://localhost:3000',
  testDuration: __ENV.TEST_DURATION || '30m',
  maxVUs: parseInt(__ENV.MAX_VIRTUAL_USERS) || 100,
  targetRPS: parseInt(__ENV.MAX_RPS) || 50,
};

// User behavior patterns
const userScenarios = [
  { name: 'new_user', weight: 20 },      // 20% new users
  { name: 'returning_user', weight: 60 }, // 60% returning users
  { name: 'power_user', weight: 15 },     // 15% power users
  { name: 'admin_user', weight: 5 },      // 5% admin users
];

// Test data pools
let testUsers = [];
let testProjects = [];
let authTokens = new Map();

export function setup() {
  console.log('Setting up load test environment...');
  console.log(`Target configuration: ${config.maxVUs} max VUs, ${config.targetRPS} RPS`);
  
  // Create test user pool
  for (let i = 0; i < 50; i++) {
    const user = {
      id: `loadtest_${i}`,
      email: `loadtest${i}@example.com`,
      password: 'LoadTest123!',
      name: `Load Test User ${i}`,
      company: 'Load Test Company',
      role: i < 5 ? 'admin' : (i < 15 ? 'premium' : 'standard'),
    };
    
    // Register users
    const registerResponse = http.post(`${config.baseUrl}/auth/register`, JSON.stringify(user), {
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (registerResponse.status === 201 || registerResponse.status === 409) {
      testUsers.push(user);
      
      // Login and store token
      const loginResponse = http.post(`${config.baseUrl}/auth/login`, JSON.stringify({
        email: user.email,
        password: user.password,
      }), {
        headers: { 'Content-Type': 'application/json' },
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
    
    if (i % 10 === 0) {
      console.log(`Created ${i} test users...`);
    }
  }
  
  console.log(`Setup completed: ${testUsers.length} users, ${authTokens.size} authenticated`);
  return { testUsers, authTokens: Object.fromEntries(authTokens) };
}

export default function(data) {
  // Determine user scenario based on weight
  const scenario = selectUserScenario();
  const user = selectRandomUser(data.testUsers);
  
  if (!user) {
    console.error('No test users available');
    return;
  }
  
  const tokens = data.authTokens[user.id];
  if (!tokens) {
    console.error(`No auth tokens for user ${user.id}`);
    return;
  }
  
  // Update active users metric  
  activeUsers.add(1);
  
  try {
    switch (scenario.name) {
      case 'new_user':
        simulateNewUserJourney(tokens);
        break;
      case 'returning_user':
        simulateReturningUserJourney(tokens);
        break;
      case 'power_user':
        simulatePowerUserJourney(tokens);
        break;
      case 'admin_user':
        simulateAdminUserJourney(tokens);
        break;
      default:
        simulateReturningUserJourney(tokens);
    }
  } catch (error) {
    console.error(`Error in user scenario ${scenario.name}:`, error);
    loadErrorRate.add(1);
  }
  
  // Random think time between user actions
  sleep(randomIntBetween(1, 5));
}

function selectUserScenario() {
  const random = Math.random() * 100;
  let cumulative = 0;
  
  for (const scenario of userScenarios) {
    cumulative += scenario.weight;
    if (random <= cumulative) {
      return scenario;
    }
  }
  
  return userScenarios[0]; // Fallback
}

function selectRandomUser(users) {
  if (!users || users.length === 0) return null;
  return users[randomIntBetween(0, users.length - 1)];
}

function simulateNewUserJourney(tokens) {
  const headers = {
    'Authorization': `Bearer ${tokens.accessToken}`,
    'Content-Type': 'application/json',
  };
  
  // 1. Check user profile (new users often check their profile first)
  makeRequest('GET', '/users/profile', null, headers, 'profile_check');
  sleep(randomIntBetween(2, 4));
  
  // 2. Explore available templates
  makeRequest('GET', '/projects/templates', null, headers, 'templates_browse');
  sleep(randomIntBetween(3, 6));
  
  // 3. Create first project
  const projectPayload = {
    name: `My First Project ${Date.now()}`,
    description: 'Getting started with Zoptal',
    template: 'react-typescript',
    visibility: 'private',
  };
  const projectResponse = makeRequest('POST', '/projects', projectPayload, headers, 'first_project_create');
  
  if (projectResponse && projectResponse.status === 201) {
    const project = JSON.parse(projectResponse.body).project;
    sleep(randomIntBetween(5, 8));
    
    // 4. Explore project features
    makeRequest('GET', `/projects/${project.id}`, null, headers, 'project_explore');
    sleep(randomIntBetween(3, 5));
    
    // 5. Try AI assistance (new users are curious about AI features)
    const aiPayload = {
      prompt: 'Help me understand this React project structure',
      context: { projectId: project.id, language: 'typescript' },
    };
    makeRequest('POST', '/ai/chat', aiPayload, headers, 'ai_first_try');
    sleep(randomIntBetween(4, 7));
    
    // 6. Check billing/subscription options
    makeRequest('GET', '/billing/plans', null, headers, 'billing_explore');
  }
}

function simulateReturningUserJourney(tokens) {
  const headers = {
    'Authorization': `Bearer ${tokens.accessToken}`,
    'Content-Type': 'application/json',
  };
  
  // 1. Dashboard overview
  makeRequest('GET', '/dashboard/overview', null, headers, 'dashboard_check');
  sleep(randomIntBetween(1, 3));
  
  // 2. List existing projects
  const projectsResponse = makeRequest('GET', '/projects?limit=10', null, headers, 'projects_list');
  
  if (projectsResponse && projectsResponse.status === 200) {
    const projects = JSON.parse(projectsResponse.body).projects;
    
    if (projects && projects.length > 0) {
      // 3. Work on existing project
      const project = projects[randomIntBetween(0, Math.min(projects.length - 1, 2))];
      sleep(randomIntBetween(2, 4));
      
      makeRequest('GET', `/projects/${project.id}`, null, headers, 'project_open');
      sleep(randomIntBetween(3, 6));
      
      // 4. File operations
      makeRequest('GET', `/projects/${project.id}/files`, null, headers, 'files_list');
      sleep(randomIntBetween(2, 4));
      
      // 5. AI interaction (common for returning users)
      const aiPrompts = [
        'Optimize this React component for performance',
        'Add TypeScript types to this function',
        'Create unit tests for this component',
        'Refactor this code for better readability',
      ];
      
      const aiPayload = {
        prompt: aiPrompts[randomIntBetween(0, aiPrompts.length - 1)],
        context: { projectId: project.id },
      };
      makeRequest('POST', '/ai/generate', aiPayload, headers, 'ai_generate', 15000);
      sleep(randomIntBetween(5, 10));
      
      // 6. Save work / update project
      const updatePayload = {
        lastModified: new Date().toISOString(),
        settings: { autoSave: true },
      };
      makeRequest('PUT', `/projects/${project.id}`, updatePayload, headers, 'project_save');
    }
  }
  
  // 7. Check notifications
  makeRequest('GET', '/notifications?unread=true', null, headers, 'notifications_check');
}

function simulatePowerUserJourney(tokens) {
  const headers = {
    'Authorization': `Bearer ${tokens.accessToken}`,
    'Content-Type': 'application/json',
  };
  
  // Power users typically work with multiple projects and advanced features
  
  // 1. Quick dashboard check
  makeRequest('GET', '/dashboard/analytics', null, headers, 'analytics_check');
  sleep(1);
  
  // 2. Advanced project operations
  const projectsResponse = makeRequest('GET', '/projects?limit=20&sort=lastModified', null, headers, 'projects_list_advanced');
  
  if (projectsResponse && projectsResponse.status === 200) {
    const projects = JSON.parse(projectsResponse.body).projects;
    
    // Work on multiple projects simultaneously
    const workingProjects = projects.slice(0, Math.min(3, projects.length));
    
    for (const project of workingProjects) {
      // Rapid-fire operations
      makeRequest('GET', `/projects/${project.id}/files`, null, headers, 'files_list_power');
      sleep(0.5);
      
      // Batch AI operations
      const batchPrompts = [
        'Review this entire codebase for security issues',
        'Generate comprehensive documentation',
        'Optimize all components for performance',
      ];
      
      for (const prompt of batchPrompts) {
        const aiPayload = {
          prompt,
          context: { projectId: project.id },
          model: 'gpt-4', // Power users likely use advanced models
        };
        makeRequest('POST', '/ai/generate', aiPayload, headers, 'ai_batch_generate', 20000);
        sleep(1);
      }
      
      // Advanced file operations
      makeRequest('POST', `/projects/${project.id}/files/batch-update`, {
        operations: [
          { type: 'format', pattern: '**/*.ts' },
          { type: 'lint', pattern: '**/*.tsx' },
        ],
      }, headers, 'files_batch_operation');
      
      sleep(randomIntBetween(2, 4));
    }
  }
  
  // 3. Collaboration features
  makeRequest('GET', '/collaborations/active', null, headers, 'collaborations_check');
  makeRequest('GET', '/comments/recent', null, headers, 'comments_recent');
  
  // 4. Integration usage
  makeRequest('GET', '/integrations/github/repos', null, headers, 'github_integration');
  makeRequest('GET', '/integrations/slack/channels', null, headers, 'slack_integration');
}

function simulateAdminUserJourney(tokens) {
  const headers = {
    'Authorization': `Bearer ${tokens.accessToken}`,
    'Content-Type': 'application/json',
  };
  
  // Admin users focus on monitoring and management
  
  // 1. System overview
  makeRequest('GET', '/admin/dashboard', null, headers, 'admin_dashboard');
  sleep(randomIntBetween(2, 4));
  
  // 2. User management
  makeRequest('GET', '/admin/users?page=1&limit=50', null, headers, 'admin_users_list');
  makeRequest('GET', '/admin/users/statistics', null, headers, 'admin_users_stats');
  sleep(randomIntBetween(1, 3));
  
  // 3. System monitoring
  makeRequest('GET', '/admin/system/health', null, headers, 'admin_system_health');
  makeRequest('GET', '/admin/system/metrics', null, headers, 'admin_system_metrics');
  makeRequest('GET', '/admin/system/logs?level=error&limit=100', null, headers, 'admin_error_logs');
  sleep(randomIntBetween(2, 4));
  
  // 4. Billing oversight
  makeRequest('GET', '/admin/billing/overview', null, headers, 'admin_billing_overview');
  makeRequest('GET', '/admin/billing/transactions?limit=50', null, headers, 'admin_transactions');
  sleep(randomIntBetween(1, 2));
  
  // 5. AI usage monitoring
  makeRequest('GET', '/admin/ai/usage-stats', null, headers, 'admin_ai_usage');
  makeRequest('GET', '/admin/ai/cost-analysis', null, headers, 'admin_ai_costs');
}

function makeRequest(method, endpoint, payload, headers, tag, timeout = 10000) {
  const url = `${config.baseUrl}${endpoint}`;
  let response;
  
  const requestOptions = {
    headers,
    timeout: `${timeout}ms`,
    tags: { 
      test_type: 'load_test',
      endpoint_type: tag,
      method: method.toLowerCase()
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
    
    // Check response
    const success = check(response, {
      [`${tag} status is success`]: (r) => r.status >= 200 && r.status < 400,
      [`${tag} response time acceptable`]: (r) => r.timings.duration < (timeout * 0.8),
    });
    
    // Record metrics
    loadErrorRate.add(!success);
    loadResponseTime.add(duration);
    loadThroughput.add(1);
    
    // Simulate database connection usage
    if (endpoint.includes('/projects') || endpoint.includes('/users')) {
      databaseConnections.add(randomIntBetween(1, 5));
    }
    
    return response;
    
  } catch (error) {
    console.error(`Request failed: ${method} ${endpoint}`, error);
    loadErrorRate.add(1);
    return null;
  }
}

export function teardown(data) {
  console.log('Load test completed. Cleaning up...');
  
  // Generate summary statistics
  console.log('\n=== Load Test Summary ===');
  console.log(`Test users: ${data.testUsers ? data.testUsers.length : 'N/A'}`);
  console.log(`Authenticated sessions: ${data.authTokens ? Object.keys(data.authTokens).length : 'N/A'}`);
}

export function handleSummary(data) {
  const summary = {
    'results/k6-load-test.json': JSON.stringify(data, null, 2),
    'results/k6-load-test.html': generateLoadTestReport(data),
    stdout: generateConsoleReport(data),
  };
  
  return summary;
}

function generateConsoleReport(data) {
  const metrics = data.metrics || {};
  
  return `
╔══════════════════════════════════════════════════════════════════════════════╗
║                           🚀 LOAD TEST RESULTS                               ║
╚══════════════════════════════════════════════════════════════════════════════╝

📊 REQUEST STATISTICS:
  Total Requests: ${metrics.http_reqs ? metrics.http_reqs.values.count : 'N/A'}
  Requests/sec:   ${metrics.http_reqs ? metrics.http_reqs.values.rate.toFixed(2) : 'N/A'}
  Failed:         ${metrics.http_req_failed ? (metrics.http_req_failed.values.rate * 100).toFixed(2) : 'N/A'}%

⏱️  RESPONSE TIMES:
  Average:        ${metrics.http_req_duration ? metrics.http_req_duration.values.avg.toFixed(2) : 'N/A'}ms
  Median (p50):   ${metrics.http_req_duration ? metrics.http_req_duration.values.med.toFixed(2) : 'N/A'}ms
  95th percentile: ${metrics.http_req_duration ? metrics.http_req_duration.values['p(95)'].toFixed(2) : 'N/A'}ms
  99th percentile: ${metrics.http_req_duration ? metrics.http_req_duration.values['p(99)'].toFixed(2) : 'N/A'}ms

🎯 THRESHOLDS:
${Object.entries(data.thresholds || {}).map(([key, threshold]) => 
  `  ${key}: ${threshold.ok ? '✅ PASS' : '❌ FAIL'}`
).join('\n')}

💪 LOAD METRICS:
  Peak VUs:       ${metrics.vus_max ? metrics.vus_max.values.value : 'N/A'}
  Load Throughput: ${metrics.load_throughput ? metrics.load_throughput.values.count : 'N/A'} operations
  Error Rate:     ${metrics.load_error_rate ? (metrics.load_error_rate.values.rate * 100).toFixed(2) : 'N/A'}%

Duration: ${data.state ? (data.state.testRunDurationMs / 1000).toFixed(2) : 'N/A'}s
Generated: ${new Date().toISOString()}
  `;
}

function generateLoadTestReport(data) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>K6 Load Test Results - Zoptal Platform</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding: 20px; }
        .container { max-width: 1400px; margin: 0 auto; }
        .header { text-align: center; color: white; margin-bottom: 30px; }
        .header h1 { font-size: 2.5em; margin-bottom: 10px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
        .cards-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .card { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); }
        .card h3 { color: #2c3e50; margin-bottom: 15px; font-size: 1.2em; }
        .metric { display: flex; justify-content: space-between; align-items: center; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #ecf0f1; }
        .metric:last-child { border-bottom: none; }
        .metric-label { color: #7f8c8d; }
        .metric-value { font-weight: bold; color: #2c3e50; font-size: 1.1em; }
        .metric-value.success { color: #27ae60; }
        .metric-value.warning { color: #f39c12; }
        .metric-value.error { color: #e74c3c; }
        .scenarios { background: white; border-radius: 12px; padding: 25px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); }
        .scenario { margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #3498db; }
        .threshold { display: flex; justify-content: between; align-items: center; padding: 10px; margin: 5px 0; border-radius: 6px; }
        .threshold.pass { background: #d4edda; color: #155724; }
        .threshold.fail { background: #f8d7da; color: #721c24; }
        .footer { text-align: center; margin-top: 30px; color: rgba(255,255,255,0.8); }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚀 Load Test Results</h1>
          <p>Comprehensive load testing analysis for Zoptal Platform</p>
          <small>Generated on ${new Date().toISOString()}</small>
        </div>
        
        <div class="cards-grid">
          <div class="card">
            <h3>📈 Request Statistics</h3>
            <div class="metric">
              <span class="metric-label">Total Requests</span>
              <span class="metric-value">${data.metrics.http_reqs ? data.metrics.http_reqs.values.count.toLocaleString() : 'N/A'}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Requests/Second</span>
              <span class="metric-value success">${data.metrics.http_reqs ? data.metrics.http_reqs.values.rate.toFixed(2) : 'N/A'}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Error Rate</span>
              <span class="metric-value ${data.metrics.http_req_failed && data.metrics.http_req_failed.values.rate > 0.03 ? 'error' : 'success'}">${data.metrics.http_req_failed ? (data.metrics.http_req_failed.values.rate * 100).toFixed(2) : 'N/A'}%</span>
            </div>
          </div>
          
          <div class="card">
            <h3>⏱️ Response Times</h3>
            <div class="metric">
              <span class="metric-label">Average</span>
              <span class="metric-value">${data.metrics.http_req_duration ? data.metrics.http_req_duration.values.avg.toFixed(2) : 'N/A'}ms</span>
            </div>
            <div class="metric">
              <span class="metric-label">95th Percentile</span>
              <span class="metric-value ${data.metrics.http_req_duration && data.metrics.http_req_duration.values['p(95)'] > 800 ? 'warning' : 'success'}">${data.metrics.http_req_duration ? data.metrics.http_req_duration.values['p(95)'].toFixed(2) : 'N/A'}ms</span>
            </div>
            <div class="metric">
              <span class="metric-label">99th Percentile</span>
              <span class="metric-value ${data.metrics.http_req_duration && data.metrics.http_req_duration.values['p(99)'] > 1500 ? 'error' : 'success'}">${data.metrics.http_req_duration ? data.metrics.http_req_duration.values['p(99)'].toFixed(2) : 'N/A'}ms</span>
            </div>
          </div>
          
          <div class="card">
            <h3>👥 Virtual Users</h3>
            <div class="metric">
              <span class="metric-label">Peak VUs</span>
              <span class="metric-value">${data.metrics.vus_max ? data.metrics.vus_max.values.value : 'N/A'}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Total Iterations</span>
              <span class="metric-value">${data.metrics.iterations ? data.metrics.iterations.values.count.toLocaleString() : 'N/A'}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Test Duration</span>
              <span class="metric-value">${data.state ? (data.state.testRunDurationMs / 1000 / 60).toFixed(1) : 'N/A'}min</span>
            </div>
          </div>
          
          <div class="card">
            <h3>🎯 Performance Thresholds</h3>
            ${Object.entries(data.thresholds || {}).map(([key, threshold]) => 
              `<div class="threshold ${threshold.ok ? 'pass' : 'fail'}">
                <span>${key}</span>
                <span>${threshold.ok ? '✅ PASS' : '❌ FAIL'}</span>
              </div>`
            ).join('')}
          </div>
        </div>
        
        <div class="scenarios">
          <h3>🎭 User Scenarios Tested</h3>
          <div class="scenario">
            <h4>🆕 New User Journey (20%)</h4>
            <p>Profile setup → Template exploration → First project creation → AI experimentation → Billing exploration</p>
          </div>
          <div class="scenario">
            <h4>🔄 Returning User Journey (60%)</h4>
            <p>Dashboard check → Project management → File operations → AI assistance → Work saving</p>
          </div>
          <div class="scenario">
            <h4>⚡ Power User Journey (15%)</h4>
            <p>Analytics review → Multi-project operations → Batch AI processing → Advanced features → Collaboration</p>
          </div>
          <div class="scenario">
            <h4>👑 Admin User Journey (5%)</h4>
            <p>System monitoring → User management → Billing oversight → AI usage analysis → Error log review</p>
          </div>
        </div>
        
        <div class="footer">
          <p>Load testing performed with K6 • Zoptal Platform Performance Suite</p>
        </div>
      </div>
    </body>
    </html>
  `;
}