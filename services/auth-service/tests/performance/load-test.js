// k6 Load Testing Script for Zoptal Auth Service
// This script simulates normal user load patterns

import { AuthAPIClient, loadTestStages, performanceThresholds, setupTestData, cleanupTestData } from './k6-setup.js';
import { check, sleep } from 'k6';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

// Test configuration
export const options = {
  stages: loadTestStages,
  thresholds: performanceThresholds,
  
  // Test scenarios
  scenarios: {
    // Regular user authentication flow
    user_auth_flow: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: loadTestStages,
      gracefulRampDown: '30s',
      env: { SCENARIO: 'user_auth' },
    },
    
    // API usage by authenticated users
    authenticated_api_usage: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: loadTestStages.map(stage => ({ ...stage, target: Math.floor(stage.target * 0.7) })),
      gracefulRampDown: '30s',
      env: { SCENARIO: 'api_usage' },
    },
    
    // Health check monitoring (constant low load)
    health_monitoring: {
      executor: 'constant-vus',
      vus: 2,
      duration: '26m',
      env: { SCENARIO: 'health_check' },
    },
    
    // Admin dashboard usage (lower frequency)
    admin_usage: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: loadTestStages.map(stage => ({ ...stage, target: Math.floor(stage.target * 0.1) })),
      gracefulRampDown: '30s',
      env: { SCENARIO: 'admin_dashboard' },
    },
  },
};

// Setup function - runs once before all VUs
export function setup() {
  console.log('🚀 Starting Zoptal Auth Service Load Test');
  console.log(`📊 Target: ${loadTestStages[loadTestStages.length - 2].target} concurrent users`);
  console.log(`⏱️  Duration: ${loadTestStages.reduce((sum, stage) => sum + parseInt(stage.duration), 0)} minutes`);
  
  setupTestData();
  
  return {
    baseURL: __ENV.BASE_URL || 'http://localhost:3001',
    timestamp: new Date().toISOString(),
  };
}

// Main test function
export default function(data) {
  const scenario = __ENV.SCENARIO || 'user_auth';
  const client = new AuthAPIClient(data.baseURL);
  
  switch (scenario) {
    case 'user_auth':
      userAuthenticationFlow(client);
      break;
    case 'api_usage':
      authenticatedAPIUsage(client);
      break;
    case 'health_check':
      healthCheckMonitoring(client);
      break;
    case 'admin_dashboard':
      adminDashboardUsage(client);
      break;
    default:
      userAuthenticationFlow(client);
  }
}

// User authentication flow scenario
function userAuthenticationFlow(client) {
  const userIndex = Math.floor(Math.random() * 1000) + 1;
  
  // 30% new user registration, 70% existing user login
  if (Math.random() < 0.3) {
    // New user registration flow
    const newUser = {
      email: `loadtest${userIndex}_${Date.now()}@test.com`,
      password: 'LoadTest123!',
      profile: {
        firstName: `LoadTest${userIndex}`,
        lastName: 'User',
        dateOfBirth: '1990-01-01',
      }
    };
    
    const registerResponse = client.register(newUser);
    
    if (registerResponse.status === 201) {
      sleep(1); // Simulate user reading confirmation
      
      // Attempt to login with new account
      const loginResponse = client.login({
        email: newUser.email,
        password: newUser.password
      });
      
      if (loginResponse.status === 200) {
        // Simulate authenticated user activity
        authenticatedUserActivity(client);
        
        // Logout
        client.logout();
      }
    }
  } else {
    // Existing user login flow
    const credentials = {
      email: `existinguser${(userIndex % 100) + 1}@test.com`,
      password: 'LoadTest123!'
    };
    
    const loginResponse = client.login(credentials);
    
    if (loginResponse.status === 200) {
      // Simulate authenticated user activity
      authenticatedUserActivity(client);
      
      // 90% logout, 10% just close browser (no logout)
      if (Math.random() < 0.9) {
        client.logout();
      }
    }
  }
  
  sleep(Math.random() * 3 + 1); // Random think time 1-4 seconds
}

// Authenticated API usage scenario
function authenticatedAPIUsage(client) {
  const userIndex = (Math.floor(Math.random() * 100) + 1);
  
  // Login first
  const loginResponse = client.login({
    email: `apiuser${userIndex}@test.com`,
    password: 'APITest123!'
  });
  
  if (loginResponse.status === 200) {
    // Extended authenticated session
    for (let i = 0; i < Math.floor(Math.random() * 5) + 3; i++) {
      authenticatedUserActivity(client);
      sleep(Math.random() * 2 + 1);
    }
    
    client.logout();
  }
  
  sleep(Math.random() * 5 + 2);
}

// Health check monitoring scenario
function healthCheckMonitoring(client) {
  // Continuous health monitoring
  client.healthCheck();
  sleep(30); // Check every 30 seconds
  
  // Occasionally check metrics
  if (Math.random() < 0.1) {
    client.getMetrics();
  }
}

// Admin dashboard usage scenario
function adminDashboardUsage(client) {
  // Admin login
  const adminLoginResponse = client.adminLogin();
  
  if (adminLoginResponse.status === 200) {
    // Admin activities
    client.getDashboardStats();
    sleep(2);
    
    client.getUserList(1, 25);
    sleep(1);
    
    client.getUserList(2, 25);
    sleep(1);
    
    // Check system health
    client.healthCheck();
    sleep(1);
    
    client.logout();
  }
  
  sleep(Math.random() * 10 + 5); // Admins have longer think time
}

// Common authenticated user activities
function authenticatedUserActivity(client) {
  const activities = [
    () => client.getProfile(),
    () => client.updateProfile({
      firstName: `Updated${Date.now()}`,
      lastName: 'User'
    }),
    () => client.healthCheck(),
  ];
  
  // Perform 1-3 random activities
  const numActivities = Math.floor(Math.random() * 3) + 1;
  for (let i = 0; i < numActivities; i++) {
    const activity = activities[Math.floor(Math.random() * activities.length)];
    activity();
    sleep(Math.random() * 2 + 0.5); // Think time between activities
  }
}

// Teardown function - runs once after all VUs
export function teardown(data) {
  console.log('🧹 Cleaning up load test data');
  cleanupTestData();
  console.log('✅ Load test completed');
}

// Custom report generation
export function handleSummary(data) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  return {
    [`reports/load-test-${timestamp}.html`]: htmlReport(data),
    [`reports/load-test-${timestamp}.json`]: JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}