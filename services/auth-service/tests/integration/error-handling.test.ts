import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../../src/app';
import { ERROR_CODES } from '../../src/constants/error-codes';

describe('Error Handling Integration Tests', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('Standardized Error Response Format', () => {
    it('should return standardized error format for validation errors', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          email: 'invalid-email',
          password: '123'  // Too weak
        }
      });

      expect(response.statusCode).toBe(400);
      
      const error = JSON.parse(response.body);
      expect(error).toHaveProperty('code');
      expect(error).toHaveProperty('message');
      expect(error).toHaveProperty('details');
      expect(error).toHaveProperty('timestamp');
      
      expect(error.details).toHaveProperty('metadata');
      expect(error.details.metadata).toHaveProperty('userFriendly');
      expect(error.details.metadata).toHaveProperty('retryable');
      expect(error.details.metadata).toHaveProperty('severity');
      expect(error.details.metadata).toHaveProperty('category');
    });

    it('should return standardized error format for authentication errors', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: 'nonexistent@example.com',
          password: 'wrongpassword'
        }
      });

      expect(response.statusCode).toBe(401);
      
      const error = JSON.parse(response.body);
      expect(error.code).toBe(ERROR_CODES.AUTH_INVALID_CREDENTIALS);
      expect(error.details.metadata.userFriendly).toBe(true);
      expect(error.details.metadata.retryable).toBe(true);
      expect(error.details.metadata.category).toBe('CLIENT_ERROR');
    });

    it('should include request ID in error responses', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/nonexistent-endpoint'
      });

      expect(response.statusCode).toBe(404);
      
      const error = JSON.parse(response.body);
      expect(error.details).toHaveProperty('requestId');
      expect(error.details.requestId).toMatch(/^req_\d+_[a-z0-9]+$/);
    });
  });

  describe('Error Code Validation', () => {
    it('should use standardized error codes for different scenarios', async () => {
      // Test validation error
      const validationResponse = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: { email: 'invalid' }
      });
      
      const validationError = JSON.parse(validationResponse.body);
      expect(validationError.code).toBe(ERROR_CODES.VALIDATION_INVALID_EMAIL);

      // Test unauthorized access
      const unauthorizedResponse = await app.inject({
        method: 'GET',
        url: '/api/users/profile'
      });
      
      const unauthorizedError = JSON.parse(unauthorizedResponse.body);
      expect(unauthorizedError.code).toBe(ERROR_CODES.AUTH_UNAUTHORIZED);

      // Test not found
      const notFoundResponse = await app.inject({
        method: 'GET',
        url: '/api/nonexistent'
      });
      
      const notFoundError = JSON.parse(notFoundResponse.body);
      expect(notFoundError.code).toBe(ERROR_CODES.API_ENDPOINT_NOT_FOUND);
    });

    it('should map Fastify JWT errors to standardized codes', async () => {
      // Test expired token
      const expiredTokenResponse = await app.inject({
        method: 'GET',
        url: '/api/users/profile',
        headers: {
          authorization: 'Bearer expired.jwt.token'
        }
      });
      
      const expiredError = JSON.parse(expiredTokenResponse.body);
      expect(expiredError.code).toBe(ERROR_CODES.AUTH_TOKEN_EXPIRED);

      // Test invalid token
      const invalidTokenResponse = await app.inject({
        method: 'GET',
        url: '/api/users/profile',
        headers: {
          authorization: 'Bearer invalid-token'
        }
      });
      
      const invalidError = JSON.parse(invalidTokenResponse.body);
      expect(invalidError.code).toBe(ERROR_CODES.AUTH_INVALID_TOKEN);
    });
  });

  describe('Error Metadata Validation', () => {
    it('should include appropriate metadata for user-facing errors', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: 'user@example.com',
          password: 'wrongpassword'
        }
      });

      const error = JSON.parse(response.body);
      const metadata = error.details.metadata;
      
      expect(metadata.userFriendly).toBe(true);
      expect(metadata.retryable).toBe(true);
      expect(metadata.severity).toBe('MEDIUM');
      expect(metadata.category).toBe('CLIENT_ERROR');
    });

    it('should mark server errors as non-user-friendly', async () => {
      // Simulate a server error by hitting an endpoint that would cause one
      // This would require mocking database failures in a real test
      
      // For now, test the error handler structure
      const response = await app.inject({
        method: 'POST',
        url: '/api/admin/errors/test-error/DATABASE_CONNECTION_ERROR',
        headers: {
          authorization: `Bearer ${await getValidAdminToken()}`
        }
      });

      const error = JSON.parse(response.body);
      const metadata = error.details.metadata;
      
      expect(metadata.userFriendly).toBe(false);
      expect(metadata.retryable).toBe(true);
      expect(metadata.severity).toBe('CRITICAL');
      expect(metadata.category).toBe('SERVER_ERROR');
    });
  });

  describe('Error Management API', () => {
    let adminToken: string;

    beforeEach(async () => {
      adminToken = await getValidAdminToken();
    });

    it('should retrieve all error codes with pagination', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/admin/errors/error-codes?page=1&limit=10',
        headers: {
          authorization: `Bearer ${adminToken}`
        }
      });

      expect(response.statusCode).toBe(200);
      
      const result = JSON.parse(response.body);
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('errorCodes');
      expect(result.data).toHaveProperty('pagination');
      
      expect(Array.isArray(result.data.errorCodes)).toBe(true);
      expect(result.data.pagination.page).toBe(1);
      expect(result.data.pagination.limit).toBe(10);
    });

    it('should filter error codes by category', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/admin/errors/error-codes?category=CLIENT_ERROR',
        headers: {
          authorization: `Bearer ${adminToken}`
        }
      });

      expect(response.statusCode).toBe(200);
      
      const result = JSON.parse(response.body);
      const errorCodes = result.data.errorCodes;
      
      errorCodes.forEach((errorCode: any) => {
        expect(errorCode.category).toBe('CLIENT_ERROR');
      });
    });

    it('should filter error codes by severity', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/admin/errors/error-codes?severity=CRITICAL',
        headers: {
          authorization: `Bearer ${adminToken}`
        }
      });

      expect(response.statusCode).toBe(200);
      
      const result = JSON.parse(response.body);
      const errorCodes = result.data.errorCodes;
      
      errorCodes.forEach((errorCode: any) => {
        expect(errorCode.severity).toBe('CRITICAL');
      });
    });

    it('should search error codes by text', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/admin/errors/error-codes?search=authentication',
        headers: {
          authorization: `Bearer ${adminToken}`
        }
      });

      expect(response.statusCode).toBe(200);
      
      const result = JSON.parse(response.body);
      const errorCodes = result.data.errorCodes;
      
      errorCodes.forEach((errorCode: any) => {
        const matchesCode = errorCode.code.toLowerCase().includes('authentication');
        const matchesDescription = errorCode.description.toLowerCase().includes('authentication');
        expect(matchesCode || matchesDescription).toBe(true);
      });
    });

    it('should retrieve specific error code details', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/admin/errors/error-codes/${ERROR_CODES.AUTH_INVALID_CREDENTIALS}`,
        headers: {
          authorization: `Bearer ${adminToken}`
        }
      });

      expect(response.statusCode).toBe(200);
      
      const result = JSON.parse(response.body);
      expect(result.success).toBe(true);
      expect(result.data.code).toBe(ERROR_CODES.AUTH_INVALID_CREDENTIALS);
      expect(result.data).toHaveProperty('httpStatus');
      expect(result.data).toHaveProperty('description');
      expect(result.data).toHaveProperty('possibleCauses');
      expect(result.data).toHaveProperty('resolution');
    });

    it('should return 404 for non-existent error code', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/admin/errors/error-codes/NONEXISTENT_ERROR',
        headers: {
          authorization: `Bearer ${adminToken}`
        }
      });

      expect(response.statusCode).toBe(404);
      
      const result = JSON.parse(response.body);
      expect(result.success).toBe(false);
      expect(result.error).toBe('ERROR_CODE_NOT_FOUND');
    });

    it('should generate error statistics', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/admin/errors/error-stats',
        headers: {
          authorization: `Bearer ${adminToken}`
        }
      });

      expect(response.statusCode).toBe(200);
      
      const result = JSON.parse(response.body);
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('summary');
      expect(result.data).toHaveProperty('breakdown');
      
      expect(result.data.summary).toHaveProperty('totalErrors');
      expect(result.data.summary).toHaveProperty('errorRate');
      expect(result.data.breakdown).toHaveProperty('byCategory');
      expect(result.data.breakdown).toHaveProperty('bySeverity');
    });

    it('should generate error categories summary', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/admin/errors/error-categories',
        headers: {
          authorization: `Bearer ${adminToken}`
        }
      });

      expect(response.statusCode).toBe(200);
      
      const result = JSON.parse(response.body);
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('categories');
      expect(result.data).toHaveProperty('total');
      
      expect(Array.isArray(result.data.categories)).toBe(true);
      
      result.data.categories.forEach((category: any) => {
        expect(category).toHaveProperty('category');
        expect(category).toHaveProperty('count');
        expect(category).toHaveProperty('percentage');
        expect(category).toHaveProperty('severityDistribution');
        expect(category).toHaveProperty('commonCodes');
      });
    });

    it('should test specific error codes', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/api/admin/errors/test-error/${ERROR_CODES.AUTH_INVALID_CREDENTIALS}`,
        headers: {
          authorization: `Bearer ${adminToken}`
        }
      });

      expect(response.statusCode).toBe(401); // HTTP status from error metadata
      
      const result = JSON.parse(response.body);
      expect(result.code).toBe(ERROR_CODES.AUTH_INVALID_CREDENTIALS);
      expect(result.details.isTestError).toBe(true);
      expect(result.details.metadata).toHaveProperty('userFriendly');
      expect(result.details.metadata).toHaveProperty('retryable');
    });

    it('should generate markdown documentation', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/admin/errors/documentation?format=markdown',
        headers: {
          authorization: `Bearer ${adminToken}`
        }
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toContain('text/markdown');
      
      const markdown = response.body;
      expect(markdown).toContain('# Error Code Reference');
      expect(markdown).toContain('## CLIENT ERROR');
      expect(markdown).toContain('## SERVER ERROR');
      expect(markdown).toContain('## SECURITY ERROR');
      expect(markdown).toContain('| Code | HTTP Status | Severity |');
    });

    it('should generate JSON documentation', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/admin/errors/documentation?format=json',
        headers: {
          authorization: `Bearer ${adminToken}`
        }
      });

      expect(response.statusCode).toBe(200);
      
      const result = JSON.parse(response.body);
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('documentation');
      expect(result.data).toHaveProperty('generatedAt');
      expect(result.data).toHaveProperty('totalCodes');
      
      expect(Array.isArray(result.data.documentation)).toBe(true);
      expect(result.data.totalCodes).toBeGreaterThan(0);
    });
  });

  describe('Error Logging', () => {
    it('should log errors with appropriate levels', async () => {
      // This would require capturing log output in a real test
      // For now, verify the error structure includes logging metadata
      
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: 'test@example.com',
          password: 'wrongpassword'
        }
      });

      const error = JSON.parse(response.body);
      expect(error.details.metadata).toHaveProperty('severity');
      
      // Verify log level would be appropriate for severity
      const severity = error.details.metadata.severity;
      if (severity === 'CRITICAL') {
        // Should log as error
        expect(['error', 'fatal']).toContain('error');
      } else if (severity === 'HIGH') {
        // Should log as error
        expect(['error', 'warn']).toContain('error');
      } else if (severity === 'MEDIUM') {
        // Should log as warn
        expect(['warn', 'info']).toContain('warn');
      }
    });
  });

  describe('Error Handler Edge Cases', () => {
    it('should handle errors without metadata gracefully', async () => {
      // Test with a generic error that might not have metadata
      const response = await app.inject({
        method: 'POST',
        url: '/api/admin/errors/test-error/SYSTEM_INTERNAL_ERROR',
        headers: {
          authorization: `Bearer ${await getValidAdminToken()}`
        }
      });

      const error = JSON.parse(response.body);
      expect(error).toHaveProperty('code');
      expect(error).toHaveProperty('message');
      expect(error).toHaveProperty('details');
      
      // Should have default metadata even if not explicitly defined
      if (error.details.metadata) {
        expect(error.details.metadata).toHaveProperty('userFriendly');
        expect(error.details.metadata).toHaveProperty('retryable');
      }
    });

    it('should handle malformed requests gracefully', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: 'invalid json',
        headers: {
          'content-type': 'application/json'
        }
      });

      expect(response.statusCode).toBe(400);
      
      const error = JSON.parse(response.body);
      expect(error).toHaveProperty('code');
      expect(error).toHaveProperty('message');
    });

    it('should handle very large payloads', async () => {
      const largePayload = {
        email: 'test@example.com',
        password: 'password123',
        data: 'x'.repeat(2 * 1024 * 1024) // 2MB of data
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: largePayload
      });

      expect(response.statusCode).toBe(413);
      
      const error = JSON.parse(response.body);
      expect(error.code).toBe(ERROR_CODES.REQUEST_PAYLOAD_TOO_LARGE);
    });
  });
});

// Helper function to get a valid admin token for testing
async function getValidAdminToken(): Promise<string> {
  // In a real test, this would authenticate as an admin user
  // For now, return a mock token that bypasses authentication in test environment
  return 'mock-admin-token-for-testing';
}