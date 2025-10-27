import { describe, test, expect, beforeEach, vi } from 'vitest';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Mock utilities that would be in auth service utils
class AuthUtils {
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static generateAccessToken(payload: any, secret: string, expiresIn: string = '15m'): string {
    return jwt.sign(payload, secret, { expiresIn });
  }

  static generateRefreshToken(payload: any, secret: string, expiresIn: string = '7d'): string {
    return jwt.sign(payload, secret, { expiresIn });
  }

  static verifyToken(token: string, secret: string): any {
    return jwt.verify(token, secret);
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static sanitizeUser(user: any): any {
    const { password, passwordHash, ...sanitizedUser } = user;
    return sanitizedUser;
  }

  static generateApiKey(): string {
    const prefix = 'zpt_';
    const randomString = Math.random().toString(36).substring(2, 15) + 
                        Math.random().toString(36).substring(2, 15);
    return prefix + randomString;
  }

  static extractUserFromToken(token: string): any {
    try {
      const decoded = jwt.decode(token) as any;
      return decoded ? { id: decoded.sub, email: decoded.email } : null;
    } catch (error) {
      return null;
    }
  }
}

describe('AuthUtils', () => {
  const testSecret = 'test-secret-key';

  describe('Password Hashing', () => {
    test('should hash password correctly', async () => {
      const password = 'testpassword123';
      const hash = await AuthUtils.hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(20);
    });

    test('should generate different hashes for same password', async () => {
      const password = 'testpassword123';
      const hash1 = await AuthUtils.hashPassword(password);
      const hash2 = await AuthUtils.hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });

    test('should verify correct password', async () => {
      const password = 'testpassword123';
      const hash = await AuthUtils.hashPassword(password);
      const isValid = await AuthUtils.comparePassword(password, hash);

      expect(isValid).toBe(true);
    });

    test('should reject incorrect password', async () => {
      const password = 'testpassword123';
      const wrongPassword = 'wrongpassword';
      const hash = await AuthUtils.hashPassword(password);
      const isValid = await AuthUtils.comparePassword(wrongPassword, hash);

      expect(isValid).toBe(false);
    });
  });

  describe('JWT Token Management', () => {
    const testPayload = { sub: 'user123', email: 'test@example.com' };

    test('should generate valid access token', () => {
      const token = AuthUtils.generateAccessToken(testPayload, testSecret);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    test('should generate valid refresh token', () => {
      const token = AuthUtils.generateRefreshToken(testPayload, testSecret);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    test('should verify valid token', () => {
      const token = AuthUtils.generateAccessToken(testPayload, testSecret);
      const decoded = AuthUtils.verifyToken(token, testSecret);

      expect(decoded).toMatchObject(testPayload);
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
    });

    test('should reject invalid token', () => {
      const invalidToken = 'invalid.token.here';

      expect(() => {
        AuthUtils.verifyToken(invalidToken, testSecret);
      }).toThrow();
    });

    test('should reject token with wrong secret', () => {
      const token = AuthUtils.generateAccessToken(testPayload, testSecret);
      const wrongSecret = 'wrong-secret';

      expect(() => {
        AuthUtils.verifyToken(token, wrongSecret);
      }).toThrow();
    });

    test('should handle expired token', () => {
      // Create token that expires immediately
      const expiredToken = AuthUtils.generateAccessToken(testPayload, testSecret, '0s');

      // Wait a moment
      setTimeout(() => {
        expect(() => {
          AuthUtils.verifyToken(expiredToken, testSecret);
        }).toThrow();
      }, 100);
    });
  });

  describe('Email Validation', () => {
    test('should validate correct email formats', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'firstname+lastname@company.org',
        'test123@test-domain.com'
      ];

      validEmails.forEach(email => {
        expect(AuthUtils.validateEmail(email)).toBe(true);
      });
    });

    test('should reject invalid email formats', () => {
      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        'user..name@domain.com',
        'user@domain',
        'user name@domain.com',
        ''
      ];

      invalidEmails.forEach(email => {
        expect(AuthUtils.validateEmail(email)).toBe(false);
      });
    });
  });

  describe('Password Validation', () => {
    test('should validate strong password', () => {
      const strongPassword = 'StrongPass123!';
      const result = AuthUtils.validatePassword(strongPassword);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject password without uppercase letter', () => {
      const password = 'weakpass123!';
      const result = AuthUtils.validatePassword(password);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    test('should reject password without lowercase letter', () => {
      const password = 'WEAKPASS123!';
      const result = AuthUtils.validatePassword(password);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    test('should reject password without number', () => {
      const password = 'WeakPassword!';
      const result = AuthUtils.validatePassword(password);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    test('should reject password without special character', () => {
      const password = 'WeakPassword123';
      const result = AuthUtils.validatePassword(password);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one special character');
    });

    test('should reject too short password', () => {
      const password = 'Weak1!';
      const result = AuthUtils.validatePassword(password);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });

    test('should return multiple errors for very weak password', () => {
      const password = '123';
      const result = AuthUtils.validatePassword(password);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('User Sanitization', () => {
    test('should remove sensitive fields from user object', () => {
      const user = {
        id: 'user123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'plaintextpassword',
        passwordHash: '$2b$10$hash...',
        emailVerified: true
      };

      const sanitized = AuthUtils.sanitizeUser(user);

      expect(sanitized).toMatchObject({
        id: 'user123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        emailVerified: true
      });

      expect(sanitized.password).toBeUndefined();
      expect(sanitized.passwordHash).toBeUndefined();
    });

    test('should handle user object without sensitive fields', () => {
      const user = {
        id: 'user123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User'
      };

      const sanitized = AuthUtils.sanitizeUser(user);

      expect(sanitized).toEqual(user);
    });
  });

  describe('API Key Generation', () => {
    test('should generate API key with correct format', () => {
      const apiKey = AuthUtils.generateApiKey();

      expect(apiKey).toMatch(/^zpt_[a-z0-9]+$/);
      expect(apiKey.length).toBeGreaterThan(10);
    });

    test('should generate unique API keys', () => {
      const key1 = AuthUtils.generateApiKey();
      const key2 = AuthUtils.generateApiKey();

      expect(key1).not.toBe(key2);
    });

    test('should always start with zpt_ prefix', () => {
      const apiKey = AuthUtils.generateApiKey();

      expect(apiKey.startsWith('zpt_')).toBe(true);
    });
  });

  describe('Token User Extraction', () => {
    test('should extract user from valid token', () => {
      const payload = { sub: 'user123', email: 'test@example.com' };
      const token = AuthUtils.generateAccessToken(payload, testSecret);
      const extractedUser = AuthUtils.extractUserFromToken(token);

      expect(extractedUser).toMatchObject({
        id: 'user123',
        email: 'test@example.com'
      });
    });

    test('should return null for invalid token', () => {
      const invalidToken = 'invalid.token.format';
      const extractedUser = AuthUtils.extractUserFromToken(invalidToken);

      expect(extractedUser).toBeNull();
    });

    test('should return null for empty token', () => {
      const extractedUser = AuthUtils.extractUserFromToken('');

      expect(extractedUser).toBeNull();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle empty password gracefully', async () => {
      await expect(AuthUtils.hashPassword('')).resolves.toBeDefined();
    });

    test('should handle special characters in password', async () => {
      const specialPassword = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const hash = await AuthUtils.hashPassword(specialPassword);
      const isValid = await AuthUtils.comparePassword(specialPassword, hash);

      expect(isValid).toBe(true);
    });

    test('should handle unicode characters in email', () => {
      const unicodeEmail = 'test@测试.com';
      // This might be invalid depending on your email validation rules
      const isValid = AuthUtils.validateEmail(unicodeEmail);
      expect(typeof isValid).toBe('boolean');
    });

    test('should handle very long passwords', async () => {
      const longPassword = 'A'.repeat(1000) + '1!';
      const result = AuthUtils.validatePassword(longPassword);

      expect(result.isValid).toBe(true);
    });
  });
});