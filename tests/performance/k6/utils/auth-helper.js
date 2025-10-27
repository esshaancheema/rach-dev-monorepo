/**
 * K6 Authentication Helper Utilities
 * Common authentication functions for K6 performance tests
 */

import http from 'k6/http';
import { check } from 'k6';

const BASE_URL = __ENV.API_BASE_URL || 'http://localhost:3001';

/**
 * Authenticate user and return tokens
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Object} Authentication tokens and user info
 */
export function authenticate(email, password) {
  const loginPayload = {
    email: email,
    password: password
  };

  const response = http.post(`${BASE_URL}/auth/login`, JSON.stringify(loginPayload), {
    headers: { 'Content-Type': 'application/json' },
    tags: { endpoint: 'auth_login' }
  });

  const loginSuccess = check(response, {
    'login successful': (r) => r.status === 200,
    'has access token': (r) => {
      if (r.status === 200) {
        const data = JSON.parse(r.body);
        return data.tokens && data.tokens.accessToken;
      }
      return false;
    }
  });

  if (loginSuccess && response.status === 200) {
    const data = JSON.parse(response.body);
    return {
      accessToken: data.tokens.accessToken,
      refreshToken: data.tokens.refreshToken,
      userId: data.user.id,
      user: data.user
    };
  }

  throw new Error(`Authentication failed: ${response.status} ${response.body}`);
}

/**
 * Register a new user for testing
 * @param {Object} userData - User registration data
 * @returns {Object} Registration response with tokens
 */
export function registerUser(userData) {
  const response = http.post(`${BASE_URL}/auth/register`, JSON.stringify(userData), {
    headers: { 'Content-Type': 'application/json' },
    tags: { endpoint: 'auth_register' }
  });

  const registerSuccess = check(response, {
    'registration successful': (r) => r.status === 201,
    'has tokens': (r) => {
      if (r.status === 201) {
        const data = JSON.parse(r.body);
        return data.tokens && data.tokens.accessToken;
      }
      return false;
    }
  });

  if (registerSuccess && response.status === 201) {
    const data = JSON.parse(response.body);
    return {
      accessToken: data.tokens.accessToken,
      refreshToken: data.tokens.refreshToken,
      userId: data.user.id,
      user: data.user
    };
  }

  throw new Error(`Registration failed: ${response.status} ${response.body}`);
}

/**
 * Refresh authentication tokens
 * @param {string} refreshToken - Refresh token
 * @returns {Object} New tokens
 */
export function refreshTokens(refreshToken) {
  const response = http.post(`${BASE_URL}/auth/refresh`, JSON.stringify({
    refreshToken: refreshToken
  }), {
    headers: { 'Content-Type': 'application/json' },
    tags: { endpoint: 'auth_refresh' }
  });

  if (response.status === 200) {
    const data = JSON.parse(response.body);
    return {
      accessToken: data.tokens.accessToken,
      refreshToken: data.tokens.refreshToken
    };
  }

  throw new Error(`Token refresh failed: ${response.status} ${response.body}`);
}

/**
 * Generate authentication headers
 * @param {string} accessToken - Access token
 * @returns {Object} Headers object
 */
export function getAuthHeaders(accessToken) {
  return {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  };
}

/**
 * Create multiple test users for load testing
 * @param {number} count - Number of users to create
 * @param {string} baseEmail - Base email pattern (e.g., 'test@example.com')
 * @returns {Array} Array of user credentials
 */
export function createTestUsers(count, baseEmail = 'perftest@example.com') {
  const users = [];
  const emailParts = baseEmail.split('@');
  
  for (let i = 0; i < count; i++) {
    const email = `${emailParts[0]}_${i}@${emailParts[1]}`;
    const userData = {
      email: email,
      password: 'PerfTest123!',
      name: `Performance Test User ${i}`,
      firstName: `Test${i}`,
      lastName: 'User',
      company: 'Performance Testing Co.'
    };

    try {
      const authData = registerUser(userData);
      users.push({
        email: email,
        password: userData.password,
        userId: authData.userId,
        accessToken: authData.accessToken,
        refreshToken: authData.refreshToken
      });
    } catch (error) {
      console.warn(`Failed to create test user ${i}: ${error.message}`);
    }
  }

  return users;
}

/**
 * Validate token by making authenticated request
 * @param {string} accessToken - Access token to validate
 * @returns {boolean} Token validity
 */
export function validateToken(accessToken) {
  const response = http.get(`${BASE_URL}/auth/validate`, {
    headers: getAuthHeaders(accessToken),
    tags: { endpoint: 'auth_validate' }
  });

  return check(response, {
    'token is valid': (r) => r.status === 200
  });
}

/**
 * Logout user
 * @param {string} accessToken - Access token
 * @returns {boolean} Logout success
 */
export function logout(accessToken) {
  const response = http.post(`${BASE_URL}/auth/logout`, null, {
    headers: getAuthHeaders(accessToken),
    tags: { endpoint: 'auth_logout' }
  });

  return check(response, {
    'logout successful': (r) => r.status === 200
  });
}