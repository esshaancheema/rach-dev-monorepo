// k6 Performance Testing Setup for Zoptal Auth Service
// This script sets up the testing environment and utilities

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
export const errorRate = new Rate('errors');
export const authLatency = new Trend('auth_request_duration');
export const successfulLogins = new Counter('successful_logins');
export const failedLogins = new Counter('failed_logins');
export const registrations = new Counter('registrations');

// Configuration
export const config = {
  baseURL: __ENV.BASE_URL || 'http://localhost:3001',
  adminEmail: __ENV.ADMIN_EMAIL || 'admin@test.com',
  adminPassword: __ENV.ADMIN_PASSWORD || 'AdminPass123!',
  testUserPrefix: __ENV.TEST_USER_PREFIX || 'testuser',
  testUserDomain: __ENV.TEST_USER_DOMAIN || '@test.com',
  defaultPassword: __ENV.DEFAULT_PASSWORD || 'TestPass123!',
};

// Test data generators
export function generateTestUser(index = null) {
  const id = index !== null ? index : Math.floor(Math.random() * 100000);
  return {
    email: `${config.testUserPrefix}${id}${config.testUserDomain}`,
    password: config.defaultPassword,
    profile: {
      firstName: `Test${id}`,
      lastName: 'User',
      dateOfBirth: '1990-01-01',
      phoneNumber: `+1555${String(id).padStart(7, '0')}`,
    }
  };
}

export function generateLoginCredentials(index = null) {
  const user = generateTestUser(index);
  return {
    email: user.email,
    password: user.password
  };
}

// API client functions
export class AuthAPIClient {
  constructor(baseURL = config.baseURL) {
    this.baseURL = baseURL;
    this.authToken = null;
    this.refreshToken = null;
  }

  // Authentication endpoints
  register(userData) {
    const response = http.post(`${this.baseURL}/api/auth/register`, JSON.stringify(userData), {
      headers: { 'Content-Type': 'application/json' },
    });
    
    const success = check(response, {
      'registration successful': (r) => r.status === 201,
      'registration response time < 2s': (r) => r.timings.duration < 2000,
    });
    
    if (success) {
      registrations.add(1);
    }
    
    errorRate.add(!success);
    authLatency.add(response.timings.duration);
    
    return response;
  }

  login(credentials) {
    const response = http.post(`${this.baseURL}/api/auth/login`, JSON.stringify(credentials), {
      headers: { 'Content-Type': 'application/json' },
    });
    
    const success = check(response, {
      'login successful': (r) => r.status === 200,
      'login response time < 1s': (r) => r.timings.duration < 1000,
      'has access token': (r) => r.json('accessToken') !== undefined,
    });
    
    if (success) {
      const body = response.json();
      this.authToken = body.accessToken;
      this.refreshToken = body.refreshToken;
      successfulLogins.add(1);
    } else {
      failedLogins.add(1);
    }
    
    errorRate.add(!success);
    authLatency.add(response.timings.duration);
    
    return response;
  }

  logout() {
    const response = http.post(`${this.baseURL}/api/auth/logout`, null, {
      headers: this.getAuthHeaders(),
    });
    
    check(response, {
      'logout successful': (r) => r.status === 200,
      'logout response time < 500ms': (r) => r.timings.duration < 500,
    });
    
    this.authToken = null;
    this.refreshToken = null;
    
    return response;
  }

  refreshAccessToken() {
    const response = http.post(`${this.baseURL}/api/auth/refresh`, JSON.stringify({
      refreshToken: this.refreshToken
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
    
    const success = check(response, {
      'token refresh successful': (r) => r.status === 200,
      'refresh response time < 500ms': (r) => r.timings.duration < 500,
    });
    
    if (success) {
      const body = response.json();
      this.authToken = body.accessToken;
    }
    
    return response;
  }

  // User management endpoints
  getProfile() {
    const response = http.get(`${this.baseURL}/api/users/profile`, {
      headers: this.getAuthHeaders(),
    });
    
    check(response, {
      'profile fetch successful': (r) => r.status === 200,
      'profile response time < 500ms': (r) => r.timings.duration < 500,
    });
    
    return response;
  }

  updateProfile(profileData) {
    const response = http.put(`${this.baseURL}/api/users/profile`, JSON.stringify(profileData), {
      headers: this.getAuthHeaders(),
    });
    
    check(response, {
      'profile update successful': (r) => r.status === 200,
      'update response time < 1s': (r) => r.timings.duration < 1000,
    });
    
    return response;
  }

  // Admin endpoints
  adminLogin() {
    return this.login({
      email: config.adminEmail,
      password: config.adminPassword
    });
  }

  getDashboardStats() {
    const response = http.get(`${this.baseURL}/api/admin/dashboard/stats`, {
      headers: this.getAuthHeaders(),
    });
    
    check(response, {
      'dashboard stats successful': (r) => r.status === 200,
      'dashboard response time < 2s': (r) => r.timings.duration < 2000,
    });
    
    return response;
  }

  getUserList(page = 1, limit = 50) {
    const response = http.get(`${this.baseURL}/api/admin/users?page=${page}&limit=${limit}`, {
      headers: this.getAuthHeaders(),
    });
    
    check(response, {
      'user list successful': (r) => r.status === 200,
      'user list response time < 1s': (r) => r.timings.duration < 1000,
    });
    
    return response;
  }

  // Health and monitoring endpoints
  healthCheck() {
    const response = http.get(`${this.baseURL}/health`);
    
    check(response, {
      'health check successful': (r) => r.status === 200,
      'health check response time < 100ms': (r) => r.timings.duration < 100,
    });
    
    return response;
  }

  getMetrics() {
    const response = http.get(`${this.baseURL}/metrics`);
    
    check(response, {
      'metrics fetch successful': (r) => r.status === 200,
      'metrics response time < 500ms': (r) => r.timings.duration < 500,
    });
    
    return response;
  }

  // Utility methods
  getAuthHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    return headers;
  }

  isAuthenticated() {
    return this.authToken !== null;
  }
}

// Test scenarios setup functions
export function setupTestData() {
  console.log('Setting up test data...');
  const client = new AuthAPIClient();
  
  // Register admin user if doesn't exist
  const adminUser = {
    email: config.adminEmail,
    password: config.adminPassword,
    profile: {
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN'
    }
  };
  
  client.register(adminUser);
  sleep(1);
}

export function cleanupTestData() {
  console.log('Cleaning up test data...');
  // Note: In a real scenario, you might want to clean up test users
  // This would require admin endpoints for user deletion
}

// Performance thresholds
export const performanceThresholds = {
  // Response time thresholds
  http_req_duration: ['p(95)<2000'], // 95% of requests under 2s
  http_req_duration_auth: ['p(95)<1000'], // Auth requests under 1s
  
  // Error rate thresholds
  http_req_failed: ['rate<0.05'], // Error rate under 5%
  errors: ['rate<0.05'],
  
  // Throughput thresholds
  http_reqs: ['rate>100'], // At least 100 requests per second
  
  // Custom metrics thresholds
  auth_request_duration: ['p(95)<1000'],
  successful_logins: ['count>0'],
};

// Load test stages
export const loadTestStages = [
  { duration: '2m', target: 10 },   // Ramp up to 10 users
  { duration: '5m', target: 10 },   // Stay at 10 users
  { duration: '2m', target: 50 },   // Ramp up to 50 users
  { duration: '5m', target: 50 },   // Stay at 50 users
  { duration: '2m', target: 100 },  // Ramp up to 100 users
  { duration: '5m', target: 100 },  // Stay at 100 users
  { duration: '5m', target: 0 },    // Ramp down to 0 users
];

// Stress test stages
export const stressTestStages = [
  { duration: '2m', target: 50 },   // Ramp up to 50 users
  { duration: '5m', target: 50 },   // Stay at 50 users
  { duration: '2m', target: 100 },  // Ramp up to 100 users
  { duration: '5m', target: 100 },  // Stay at 100 users
  { duration: '2m', target: 200 },  // Ramp up to 200 users
  { duration: '5m', target: 200 },  // Stay at 200 users
  { duration: '2m', target: 300 },  // Ramp up to 300 users
  { duration: '5m', target: 300 },  // Stay at 300 users
  { duration: '2m', target: 400 },  // Ramp up to 400 users
  { duration: '5m', target: 400 },  // Stay at 400 users
  { duration: '10m', target: 0 },   // Ramp down to 0 users
];

// Spike test stages
export const spikeTestStages = [
  { duration: '10s', target: 10 },  // Normal load
  { duration: '1m', target: 10 },   // Stay at normal load
  { duration: '10s', target: 500 }, // Spike to 500 users
  { duration: '3m', target: 500 },  // Stay at spike
  { duration: '10s', target: 10 },  // Drop back to normal
  { duration: '3m', target: 10 },   // Stay at normal
  { duration: '10s', target: 1000 },// Bigger spike
  { duration: '3m', target: 1000 }, // Stay at bigger spike
  { duration: '5m', target: 0 },    // Ramp down
];

export default {
  AuthAPIClient,
  config,
  generateTestUser,
  generateLoginCredentials,
  setupTestData,
  cleanupTestData,
  performanceThresholds,
  loadTestStages,
  stressTestStages,
  spikeTestStages,
};