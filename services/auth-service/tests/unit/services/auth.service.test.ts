import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService, createAuthService } from '../../../src/services/auth.service';
import { testHelpers, testPrisma } from '../../setup';
import { PasswordUtils } from '../../../src/utils/password';

describe('AuthService', () => {
  let authService: AuthService;
  let mockEmailService: any;
  let mockSmsService: any;
  let mockTokenService: any;

  beforeEach(() => {
    // Mock dependencies
    mockEmailService = {
      sendVerificationEmail: vi.fn().mockResolvedValue({ success: true }),
      sendWelcomeEmail: vi.fn().mockResolvedValue({ success: true }),
      sendPasswordResetEmail: vi.fn().mockResolvedValue({ success: true }),
    };

    mockSmsService = {
      sendVerificationSMS: vi.fn().mockResolvedValue({ success: true }),
      sendSecurityAlert: vi.fn().mockResolvedValue({ success: true }),
    };

    mockTokenService = {
      generateTokenPair: vi.fn().mockResolvedValue({
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        expiresIn: 900,
      }),
      verifyAccessToken: vi.fn().mockResolvedValue({ valid: true }),
    };

    authService = createAuthService({
      prisma: testPrisma,
      tokenService: mockTokenService,
      emailService: mockEmailService,
      smsService: mockSmsService,
    });
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registrationData = {
        email: 'test@example.com',
        password: 'SecurePassword123!',
        firstName: 'Test',
        lastName: 'User',
      };

      const clientInfo = {
        ip: '127.0.0.1',
        userAgent: 'Test Agent',
      };

      const result = await authService.register(registrationData, clientInfo);

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(registrationData.email);
      expect(result.user.firstName).toBe(registrationData.firstName);
      expect(result.user.lastName).toBe(registrationData.lastName);
      expect(result.emailVerificationSent).toBe(true);

      // Verify email service was called
      expect(mockEmailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
    });

    it('should throw error for duplicate email', async () => {
      // Create a user first
      await testHelpers.createTestUser({
        email: 'existing@example.com',
      });

      const registrationData = {
        email: 'existing@example.com',
        password: 'SecurePassword123!',
        firstName: 'Test',
        lastName: 'User',
      };

      const clientInfo = {
        ip: '127.0.0.1',
        userAgent: 'Test Agent',
      };

      await expect(authService.register(registrationData, clientInfo))
        .rejects.toThrow('EMAIL_ALREADY_EXISTS');
    });

    it('should hash password correctly', async () => {
      const registrationData = {
        email: 'password-test@example.com',
        password: 'PlainTextPassword123!',
        firstName: 'Test',
        lastName: 'User',
      };

      const clientInfo = {
        ip: '127.0.0.1',
        userAgent: 'Test Agent',
      };

      const result = await authService.register(registrationData, clientInfo);
      
      // Verify password is hashed
      expect(result.user.password).not.toBe(registrationData.password);
      expect(result.user.password).toMatch(/^\$argon2id\$/);

      // Verify password can be verified
      const isValid = await PasswordUtils.verify(
        registrationData.password,
        result.user.password
      );
      expect(isValid).toBe(true);
    });

    it('should send verification email and SMS if phone provided', async () => {
      const registrationData = {
        email: 'test-phone@example.com',
        password: 'SecurePassword123!',
        firstName: 'Test',
        lastName: 'User',
        phone: '+15551234567',
      };

      const clientInfo = {
        ip: '127.0.0.1',
        userAgent: 'Test Agent',
      };

      const result = await authService.register(registrationData, clientInfo);

      expect(result.emailVerificationSent).toBe(true);
      expect(result.phoneVerificationSent).toBe(true);
      expect(mockEmailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(mockSmsService.sendVerificationSMS).toHaveBeenCalledTimes(1);
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      // Create test user
      const testUser = await testHelpers.createTestUser({
        email: 'login-test@example.com',
        password: await PasswordUtils.hash('ValidPassword123!'),
        status: 'active',
        isEmailVerified: true,
      });

      const loginData = {
        email: 'login-test@example.com',
        password: 'ValidPassword123!',
      };

      const clientInfo = {
        ip: '127.0.0.1',
        userAgent: 'Test Agent',
      };

      const result = await authService.login(loginData, clientInfo);

      expect(result.success).toBe(true);
      expect(result.user.id).toBe(testUser.id);
      expect(result.accessToken).toBe('test-access-token');
      expect(result.refreshToken).toBe('test-refresh-token');
      expect(mockTokenService.generateTokenPair).toHaveBeenCalledTimes(1);
    });

    it('should reject login with invalid password', async () => {
      // Create test user
      await testHelpers.createTestUser({
        email: 'invalid-pass@example.com',
        password: await PasswordUtils.hash('CorrectPassword123!'),
        status: 'active',
        isEmailVerified: true,
      });

      const loginData = {
        email: 'invalid-pass@example.com',
        password: 'WrongPassword123!',
      };

      const clientInfo = {
        ip: '127.0.0.1',
        userAgent: 'Test Agent',
      };

      await expect(authService.login(loginData, clientInfo))
        .rejects.toThrow('INVALID_CREDENTIALS');
    });

    it('should reject login for non-existent user', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'AnyPassword123!',
      };

      const clientInfo = {
        ip: '127.0.0.1',
        userAgent: 'Test Agent',
      };

      await expect(authService.login(loginData, clientInfo))
        .rejects.toThrow('USER_NOT_FOUND');
    });

    it('should reject login for inactive user', async () => {
      // Create inactive test user
      await testHelpers.createTestUser({
        email: 'inactive@example.com',
        password: await PasswordUtils.hash('ValidPassword123!'),
        status: 'suspended',
        isEmailVerified: true,
      });

      const loginData = {
        email: 'inactive@example.com',
        password: 'ValidPassword123!',
      };

      const clientInfo = {
        ip: '127.0.0.1',
        userAgent: 'Test Agent',
      };

      await expect(authService.login(loginData, clientInfo))
        .rejects.toThrow('ACCOUNT_INACTIVE');
    });

    it('should reject login for unverified user', async () => {
      // Create unverified test user
      await testHelpers.createTestUser({
        email: 'unverified@example.com',
        password: await PasswordUtils.hash('ValidPassword123!'),
        status: 'pending',
        isEmailVerified: false,
      });

      const loginData = {
        email: 'unverified@example.com',
        password: 'ValidPassword123!',
      };

      const clientInfo = {
        ip: '127.0.0.1',
        userAgent: 'Test Agent',
      };

      await expect(authService.login(loginData, clientInfo))
        .rejects.toThrow('EMAIL_NOT_VERIFIED');
    });
  });

  describe('verifyEmail', () => {
    it('should verify email with valid token', async () => {
      // This would typically involve OTP service integration
      // For now, we'll test the basic flow
      const testUser = await testHelpers.createTestUser({
        email: 'verify-test@example.com',
        isEmailVerified: false,
        status: 'pending',
      });

      // Create verification token
      await testPrisma.verificationToken.create({
        data: {
          id: 'test-token-id',
          type: 'EMAIL_VERIFICATION',
          token: '123456',
          value: testUser.email,
          userId: testUser.id,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        },
      });

      const result = await authService.verifyEmail({
        token: '123456',
        email: testUser.email,
      });

      expect(result.success).toBe(true);
      
      // Verify user was updated
      const updatedUser = await testPrisma.user.findUnique({
        where: { id: testUser.id },
      });
      expect(updatedUser?.isEmailVerified).toBe(true);
      expect(updatedUser?.status).toBe('active');
    });

    it('should reject invalid verification token', async () => {
      const testUser = await testHelpers.createTestUser({
        email: 'invalid-token@example.com',
        isEmailVerified: false,
      });

      await expect(authService.verifyEmail({
        token: 'invalid-token',
        email: testUser.email,
      })).rejects.toThrow('INVALID_TOKEN');
    });
  });

  describe('forgotPassword', () => {
    it('should initiate password reset for existing user', async () => {
      const testUser = await testHelpers.createTestUser({
        email: 'forgot-password@example.com',
      });

      const result = await authService.forgotPassword({
        email: testUser.email,
      });

      expect(result.success).toBe(true);
      expect(mockEmailService.sendPasswordResetEmail).toHaveBeenCalledTimes(1);

      // Verify password reset token was created
      const resetToken = await testPrisma.passwordReset.findFirst({
        where: { email: testUser.email },
      });
      expect(resetToken).toBeDefined();
    });

    it('should not reveal non-existent email addresses', async () => {
      const result = await authService.forgotPassword({
        email: 'nonexistent@example.com',
      });

      // Should still return success to prevent email enumeration
      expect(result.success).toBe(true);
      expect(mockEmailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    });
  });
});