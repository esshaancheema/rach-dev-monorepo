import { describe, it, expect, beforeEach } from 'vitest';
import { e2eHelpers } from '../e2e-setup';

describe('Authentication E2E Tests', () => {
  let client: any;

  beforeEach(() => {
    client = e2eHelpers.createClient();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: e2eHelpers.generateTestEmail(),
        password: 'SecurePassword123!',
        firstName: 'E2E',
        lastName: 'TestUser',
      };

      const response = await client
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.firstName).toBe(userData.firstName);
      expect(response.body.data.user.lastName).toBe(userData.lastName);
      expect(response.body.data.emailVerificationSent).toBe(true);
      
      // Password should not be returned
      expect(response.body.data.user.password).toBeUndefined();
    });

    it('should reject registration with invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'SecurePassword123!',
        firstName: 'Test',
        lastName: 'User',
      };

      const response = await client
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('VALIDATION_ERROR');
    });

    it('should reject registration with weak password', async () => {
      const userData = {
        email: e2eHelpers.generateTestEmail(),
        password: '123', // Too weak
        firstName: 'Test',
        lastName: 'User',
      };

      const response = await client
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('VALIDATION_ERROR');
    });

    it('should reject duplicate email registration', async () => {
      const userData = {
        email: e2eHelpers.generateTestEmail(),
        password: 'SecurePassword123!',
        firstName: 'Test',
        lastName: 'User',
      };

      // First registration
      await client
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Second registration with same email
      const response = await client
        .post('/api/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('EMAIL_ALREADY_EXISTS');
    });
  });

  describe('POST /api/auth/login', () => {
    let testUser: any;
    let userCredentials: any;

    beforeEach(async () => {
      userCredentials = {
        email: e2eHelpers.generateTestEmail(),
        password: 'SecurePassword123!',
        firstName: 'Login',
        lastName: 'TestUser',
      };

      // Register user first
      await e2eHelpers.registerUser(userCredentials);
      
      // Create verified user directly in database for login tests
      testUser = await e2eHelpers.createTestUser({
        email: userCredentials.email,
        password: '$argon2id$v=19$m=65536,t=3,p=4$fake-hash-for-e2e-testing',
        status: 'active',
        isEmailVerified: true,
      });
    });

    it('should login with valid credentials', async () => {
      const response = await client
        .post('/api/auth/login')
        .send({
          email: userCredentials.email,
          password: userCredentials.password,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userCredentials.email);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.expiresAt).toBeDefined();
      
      // Should set refresh token cookie
      expect(response.headers['set-cookie']).toBeDefined();
      const refreshTokenCookie = response.headers['set-cookie'].find(
        (cookie: string) => cookie.startsWith('refresh_token=')
      );
      expect(refreshTokenCookie).toBeDefined();
    });

    it('should reject login with invalid password', async () => {
      const response = await client
        .post('/api/auth/login')
        .send({
          email: userCredentials.email,
          password: 'WrongPassword123!',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('INVALID_CREDENTIALS');
    });

    it('should reject login for non-existent user', async () => {
      const response = await client
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'AnyPassword123!',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('INVALID_CREDENTIALS');
    });

    it('should include device information in login', async () => {
      const response = await client
        .post('/api/auth/login')
        .send({
          email: userCredentials.email,
          password: userCredentials.password,
          deviceId: 'test-device-123',
          rememberMe: true,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userCredentials.email);
    });
  });

  describe('GET /api/auth/me', () => {
    let testUser: any;
    let accessToken: string;

    beforeEach(async () => {
      const userCredentials = {
        email: e2eHelpers.generateTestEmail(),
        password: 'SecurePassword123!',
        firstName: 'Profile',
        lastName: 'TestUser',
      };

      // Create verified user
      testUser = await e2eHelpers.createTestUser({
        email: userCredentials.email,
        status: 'active',
        isEmailVerified: true,
      });

      // Login to get access token
      const loginResponse = await e2eHelpers.loginUser({
        email: userCredentials.email,
        password: userCredentials.password,
      });

      accessToken = loginResponse.body.data.accessToken;
    });

    it('should return current user profile', async () => {
      const response = await client
        .get('/api/auth/me')
        .set(e2eHelpers.getAuthHeaders(accessToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.id).toBe(testUser.id);
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.user.password).toBeUndefined(); // Password should not be returned
    });

    it('should reject request without authentication', async () => {
      const response = await client
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.error).toBe('Unauthorized');
    });

    it('should reject request with invalid token', async () => {
      const response = await client
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.error).toBe('Unauthorized');
    });
  });

  describe('POST /api/auth/refresh', () => {
    let refreshTokenCookie: string;

    beforeEach(async () => {
      const userCredentials = {
        email: e2eHelpers.generateTestEmail(),
        password: 'SecurePassword123!',
        firstName: 'Refresh',
        lastName: 'TestUser',
      };

      // Create verified user
      await e2eHelpers.createTestUser({
        email: userCredentials.email,
        status: 'active',
        isEmailVerified: true,
      });

      // Login to get refresh token
      const loginResponse = await e2eHelpers.loginUser({
        email: userCredentials.email,
        password: userCredentials.password,
      });

      // Extract refresh token from cookie
      const cookies = loginResponse.headers['set-cookie'];
      refreshTokenCookie = cookies.find((cookie: string) => 
        cookie.startsWith('refresh_token=')
      );
    });

    it('should refresh access token with valid refresh token', async () => {
      const response = await client
        .post('/api/auth/refresh')
        .set('Cookie', refreshTokenCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.expiresIn).toBeDefined();
      expect(response.body.data.tokenType).toBe('Bearer');
      
      // Should set new refresh token cookie (token rotation)
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should reject refresh without refresh token', async () => {
      const response = await client
        .post('/api/auth/refresh')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('REFRESH_TOKEN_MISSING');
    });
  });

  describe('POST /api/auth/logout', () => {
    let accessToken: string;
    let refreshTokenCookie: string;

    beforeEach(async () => {
      const userCredentials = {
        email: e2eHelpers.generateTestEmail(),
        password: 'SecurePassword123!',
        firstName: 'Logout',
        lastName: 'TestUser',
      };

      // Create verified user
      await e2eHelpers.createTestUser({
        email: userCredentials.email,
        status: 'active',
        isEmailVerified: true,
      });

      // Login to get tokens
      const loginResponse = await e2eHelpers.loginUser({
        email: userCredentials.email,
        password: userCredentials.password,
      });

      accessToken = loginResponse.body.data.accessToken;
      const cookies = loginResponse.headers['set-cookie'];
      refreshTokenCookie = cookies.find((cookie: string) => 
        cookie.startsWith('refresh_token=')
      );
    });

    it('should logout successfully', async () => {
      const response = await client
        .post('/api/auth/logout')
        .set(e2eHelpers.getAuthHeaders(accessToken))
        .set('Cookie', refreshTokenCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Logged out successfully');
      
      // Should clear refresh token cookie
      const setCookieHeader = response.headers['set-cookie'];
      if (setCookieHeader) {
        const clearCookie = setCookieHeader.find((cookie: string) =>
          cookie.includes('refresh_token=') && cookie.includes('Max-Age=0')
        );
        expect(clearCookie).toBeDefined();
      }
    });

    it('should logout from all devices', async () => {
      const response = await client
        .post('/api/auth/logout')
        .set(e2eHelpers.getAuthHeaders(accessToken))
        .set('Cookie', refreshTokenCookie)
        .send({ allDevices: true })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('all devices');
    });

    it('should reject logout without authentication', async () => {
      const response = await client
        .post('/api/auth/logout')
        .expect(401);

      expect(response.body.error).toBe('Unauthorized');
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits on login attempts', async () => {
      const credentials = {
        email: 'rate-limit-test@example.com',
        password: 'WrongPassword123!',
      };

      // Make multiple failed login attempts
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          client
            .post('/api/auth/login')
            .send(credentials)
        );
      }

      const responses = await Promise.all(promises);
      
      // Some requests should be rate limited
      const rateLimitedResponses = responses.filter(
        (res) => res.status === 429
      );
      
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('Health Check Endpoints', () => {
    it('should return healthy status', async () => {
      const response = await client
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('ok');
      expect(response.body.uptime).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
    });

    it('should return readiness status', async () => {
      const response = await client
        .get('/ready')
        .expect(200);

      expect(response.body.status).toBe('ready');
      expect(response.body.services).toBeDefined();
      expect(response.body.services.database).toBeDefined();
      expect(response.body.services.redis).toBeDefined();
    });
  });
});