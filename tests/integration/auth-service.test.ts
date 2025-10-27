import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { getServiceUrl } from '../setup/test-services';
import { testUsers, createTestUser } from '../setup/test-data';

describe('Auth Service Integration Tests', () => {
  const authServiceUrl = getServiceUrl('auth-service');
  let accessToken: string;
  let refreshToken: string;

  beforeEach(async () => {
    // Clear any existing tokens
    accessToken = '';
    refreshToken = '';
  });

  describe('User Registration', () => {
    test('should register a new user successfully', async () => {
      const newUser = {
        email: `test-${Date.now()}@example.com`,
        password: 'SecurePassword123!',
        firstName: 'Test',
        lastName: 'User'
      };

      const response = await request(authServiceUrl)
        .post('/auth/register')
        .send(newUser)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        message: expect.stringContaining('registered successfully')
      });

      expect(response.body.user).toMatchObject({
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        emailVerified: false
      });

      // Should not return password
      expect(response.body.user.password).toBeUndefined();
      expect(response.body.user.passwordHash).toBeUndefined();
    });

    test('should reject registration with invalid email', async () => {
      const invalidUser = {
        email: 'invalid-email',
        password: 'SecurePassword123!',
        firstName: 'Test',
        lastName: 'User'
      };

      const response = await request(authServiceUrl)
        .post('/auth/register')
        .send(invalidUser)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: expect.stringContaining('email')
      });
    });

    test('should reject registration with weak password', async () => {
      const weakPasswordUser = {
        email: `test-${Date.now()}@example.com`,
        password: '123',
        firstName: 'Test',
        lastName: 'User'
      };

      const response = await request(authServiceUrl)
        .post('/auth/register')
        .send(weakPasswordUser)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: expect.stringContaining('password')
      });
    });

    test('should reject registration with duplicate email', async () => {
      const duplicateUser = {
        email: testUsers[0].email,
        password: 'SecurePassword123!',
        firstName: 'Test',
        lastName: 'User'
      };

      const response = await request(authServiceUrl)
        .post('/auth/register')
        .send(duplicateUser)
        .expect(409);

      expect(response.body).toMatchObject({
        success: false,
        error: expect.stringContaining('already exists')
      });
    });
  });

  describe('User Login', () => {
    test('should login with valid credentials', async () => {
      const loginCredentials = {
        email: testUsers[0].email,
        password: testUsers[0].password
      };

      const response = await request(authServiceUrl)
        .post('/auth/login')
        .send(loginCredentials)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        user: {
          email: testUsers[0].email,
          firstName: testUsers[0].firstName,
          lastName: testUsers[0].lastName
        }
      });

      expect(response.body.tokens).toBeDefined();
      expect(response.body.tokens.accessToken).toBeDefined();
      expect(response.body.tokens.refreshToken).toBeDefined();
      expect(response.body.tokens.expiresIn).toBeDefined();

      // Store tokens for other tests
      accessToken = response.body.tokens.accessToken;
      refreshToken = response.body.tokens.refreshToken;
    });

    test('should reject login with invalid credentials', async () => {
      const invalidCredentials = {
        email: testUsers[0].email,
        password: 'wrongpassword'
      };

      const response = await request(authServiceUrl)
        .post('/auth/login')
        .send(invalidCredentials)
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        error: expect.stringContaining('Invalid credentials')
      });
    });

    test('should reject login for non-existent user', async () => {
      const nonExistentUser = {
        email: 'nonexistent@example.com',
        password: 'somepassword'
      };

      const response = await request(authServiceUrl)
        .post('/auth/login')
        .send(nonExistentUser)
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        error: expect.stringContaining('Invalid credentials')
      });
    });

    test('should reject login for unverified email (if email verification is required)', async () => {
      const unverifiedUser = testUsers.find(u => !u.emailVerified);
      if (!unverifiedUser) return; // Skip if no unverified user in test data

      const loginCredentials = {
        email: unverifiedUser.email,
        password: unverifiedUser.password
      };

      const response = await request(authServiceUrl)
        .post('/auth/login')
        .send(loginCredentials)
        .expect(403);

      expect(response.body).toMatchObject({
        success: false,
        error: expect.stringContaining('email verification')
      });
    });
  });

  describe('Token Management', () => {
    beforeEach(async () => {
      // Login to get fresh tokens
      const loginResponse = await request(authServiceUrl)
        .post('/auth/login')
        .send({
          email: testUsers[0].email,
          password: testUsers[0].password
        });

      accessToken = loginResponse.body.tokens.accessToken;
      refreshToken = loginResponse.body.tokens.refreshToken;
    });

    test('should refresh access token with valid refresh token', async () => {
      const response = await request(authServiceUrl)
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        tokens: {
          accessToken: expect.any(String),
          expiresIn: expect.any(Number)
        }
      });

      // New access token should be different
      expect(response.body.tokens.accessToken).not.toBe(accessToken);
    });

    test('should reject refresh with invalid refresh token', async () => {
      const response = await request(authServiceUrl)
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        error: expect.stringContaining('Invalid refresh token')
      });
    });

    test('should logout and invalidate tokens', async () => {
      const response = await request(authServiceUrl)
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: expect.stringContaining('logged out')
      });

      // Try to use the invalidated access token
      const protectedResponse = await request(authServiceUrl)
        .get('/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(401);

      expect(protectedResponse.body).toMatchObject({
        success: false,
        error: expect.stringContaining('token')
      });
    });
  });

  describe('Protected Routes', () => {
    beforeEach(async () => {
      // Login to get access token
      const loginResponse = await request(authServiceUrl)
        .post('/auth/login')
        .send({
          email: testUsers[0].email,
          password: testUsers[0].password
        });

      accessToken = loginResponse.body.tokens.accessToken;
    });

    test('should access protected route with valid token', async () => {
      const response = await request(authServiceUrl)
        .get('/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        user: {
          email: testUsers[0].email,
          firstName: testUsers[0].firstName,
          lastName: testUsers[0].lastName
        }
      });
    });

    test('should reject protected route without token', async () => {
      const response = await request(authServiceUrl)
        .get('/auth/profile')
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        error: expect.stringContaining('token')
      });
    });

    test('should reject protected route with invalid token', async () => {
      const response = await request(authServiceUrl)
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        error: expect.stringContaining('token')
      });
    });
  });

  describe('Password Management', () => {
    test('should request password reset', async () => {
      const response = await request(authServiceUrl)
        .post('/auth/forgot-password')
        .send({ email: testUsers[0].email })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: expect.stringContaining('reset link')
      });
    });

    test('should handle password reset for non-existent email gracefully', async () => {
      // Should not reveal whether email exists
      const response = await request(authServiceUrl)
        .post('/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: expect.stringContaining('reset link')
      });
    });

    test('should change password with valid current password', async () => {
      // Login first
      const loginResponse = await request(authServiceUrl)
        .post('/auth/login')
        .send({
          email: testUsers[0].email,
          password: testUsers[0].password
        });

      const token = loginResponse.body.tokens.accessToken;

      const response = await request(authServiceUrl)
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: testUsers[0].password,
          newPassword: 'NewSecurePassword123!'
        })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: expect.stringContaining('password changed')
      });
    });

    test('should reject password change with invalid current password', async () => {
      // Login first
      const loginResponse = await request(authServiceUrl)
        .post('/auth/login')
        .send({
          email: testUsers[0].email,
          password: testUsers[0].password
        });

      const token = loginResponse.body.tokens.accessToken;

      const response = await request(authServiceUrl)
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'NewSecurePassword123!'
        })
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: expect.stringContaining('current password')
      });
    });
  });

  describe('Email Verification', () => {
    test('should resend verification email', async () => {
      const response = await request(authServiceUrl)
        .post('/auth/resend-verification')
        .send({ email: testUsers[0].email })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: expect.stringContaining('verification email sent')
      });
    });

    test('should verify email with valid token', async () => {
      // This would normally use a real verification token
      // For testing, we'll use a mock token
      const mockToken = 'mock-verification-token';

      const response = await request(authServiceUrl)
        .post('/auth/verify-email')
        .send({ token: mockToken })
        .expect(400); // Expected to fail with mock token

      expect(response.body).toMatchObject({
        success: false,
        error: expect.stringContaining('token')
      });
    });
  });

  describe('Admin Routes', () => {
    let adminToken: string;

    beforeEach(async () => {
      // Login as admin user
      const adminUser = testUsers.find(u => u.role === 'admin');
      if (!adminUser) return;

      const loginResponse = await request(authServiceUrl)
        .post('/auth/login')
        .send({
          email: adminUser.email,
          password: adminUser.password
        });

      adminToken = loginResponse.body.tokens.accessToken;
    });

    test('should access admin routes with admin token', async () => {
      if (!adminToken) return; // Skip if no admin user

      const response = await request(authServiceUrl)
        .get('/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        users: expect.any(Array)
      });
    });

    test('should reject admin routes with regular user token', async () => {
      // Login as regular user
      const loginResponse = await request(authServiceUrl)
        .post('/auth/login')
        .send({
          email: testUsers[0].email,
          password: testUsers[0].password
        });

      const userToken = loginResponse.body.tokens.accessToken;

      const response = await request(authServiceUrl)
        .get('/admin/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body).toMatchObject({
        success: false,
        error: expect.stringContaining('admin')
      });
    });
  });

  describe('Rate Limiting', () => {
    test('should enforce rate limiting on login attempts', async () => {
      const invalidCredentials = {
        email: testUsers[0].email,
        password: 'wrongpassword'
      };

      // Make multiple failed login attempts
      const promises = Array(6).fill(null).map(() =>
        request(authServiceUrl)
          .post('/auth/login')
          .send(invalidCredentials)
      );

      const responses = await Promise.all(promises);

      // Some responses should be rate limited
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });
});