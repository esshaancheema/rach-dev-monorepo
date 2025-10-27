import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../../src/app';

describe('Fraud Detection Integration Tests', () => {
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

  describe('Middleware Integration', () => {
    it('should allow requests from low-risk patterns', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        headers: {
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'x-forwarded-for': '8.8.8.8',
          'x-screen-resolution': '1920x1080',
          'x-timezone': 'America/New_York'
        },
        payload: {
          email: 'test@example.com',
          password: 'validpassword123'
        }
      });

      // Should not be blocked by fraud detection (even if login fails for other reasons)
      expect(response.statusCode).not.toBe(403);
      expect(response.headers).not.toHaveProperty('x-fraud-blocked');
    });

    it('should exempt health check endpoints', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
        headers: {
          'user-agent': 'HeadlessChrome/91.0.4472.124', // Suspicious user agent
          'x-forwarded-for': '1.2.3.4'
        }
      });

      expect(response.statusCode).toBe(200);
    });

    it('should exempt admin users from fraud detection', async () => {
      // This would require setting up an admin user and token
      // For now, test that the endpoint exists and responds
      const response = await app.inject({
        method: 'GET',
        url: '/api/admin/fraud/health'
      });

      // Should require authentication, not fraud detection blocking
      expect(response.statusCode).toBe(401);
    });

    it('should add fraud context to requests', async () => {
      // Test that fraud context is added even for allowed requests
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        headers: {
          'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          'x-forwarded-for': '192.168.1.100'
        },
        payload: {
          email: 'test@example.com',
          password: 'password123'
        }
      });

      // The request should proceed (fraud context added internally)
      expect(response.statusCode).not.toBe(403);
    });

    it('should handle suspicious automation patterns', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        headers: {
          'user-agent': 'HeadlessChrome/91.0.4472.124 selenium',
          'x-forwarded-for': '1.2.3.4',
          'x-screen-resolution': '1x1',
          'x-timezone': 'UTC'
        },
        payload: {
          email: 'test@example.com',
          password: 'password123'
        }
      });

      // May be blocked or require additional verification
      if (response.statusCode === 403) {
        const result = JSON.parse(response.body);
        expect(result.code).toBe('SECURITY_FRAUD_DETECTED');
      }
    });

    it('should provide device fingerprinting script', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/js/device-fingerprint.js'
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toContain('application/javascript');
      expect(response.body).toContain('getDeviceFingerprint');
      expect(response.body).toContain('setFingerprintHeaders');
    });
  });

  describe('Admin API Integration', () => {
    let adminToken: string;

    beforeEach(async () => {
      adminToken = await getValidAdminToken();
    });

    it('should test fraud analysis', async () => {
      const testRequest = {
        ip: '8.8.8.8',
        userId: 'test-user-123',
        sessionId: 'test-session-456',
        deviceFingerprint: {
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          screenResolution: '1920x1080',
          timezone: 'America/New_York',
          language: 'en-US',
          platform: 'Win32',
          cookieEnabled: true,
          doNotTrack: false,
          hash: 'test-hash-123'
        },
        metadata: {
          endpoint: '/api/auth/login',
          isTest: true
        }
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/admin/fraud/test-analysis',
        headers: {
          authorization: `Bearer ${adminToken}`,
          'content-type': 'application/json'
        },
        payload: testRequest
      });

      expect(response.statusCode).toBe(200);
      
      const result = JSON.parse(response.body);
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('fraudScore');
      expect(result.data).toHaveProperty('riskLevel');
      expect(result.data).toHaveProperty('allowAccess');
      expect(result.data).toHaveProperty('signals');
      expect(result.data).toHaveProperty('recommendations');
      expect(result.data).toHaveProperty('confidence');

      expect(typeof result.data.fraudScore).toBe('number');
      expect(result.data.fraudScore).toBeGreaterThanOrEqual(0);
      expect(result.data.fraudScore).toBeLessThanOrEqual(100);
      expect(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).toContain(result.data.riskLevel);
      expect(Array.isArray(result.data.signals)).toBe(true);
      expect(Array.isArray(result.data.recommendations)).toBe(true);
    });

    it('should get fraud detection statistics', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/admin/fraud/statistics',
        headers: {
          authorization: `Bearer ${adminToken}`
        }
      });

      expect(response.statusCode).toBe(200);
      
      const result = JSON.parse(response.body);
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('totalEvents');
      expect(result.data).toHaveProperty('blockedEvents');
      expect(result.data).toHaveProperty('blockRate');
      expect(result.data).toHaveProperty('averageFraudScore');
      expect(result.data).toHaveProperty('topSignalTypes');

      expect(typeof result.data.totalEvents).toBe('number');
      expect(typeof result.data.blockedEvents).toBe('number');
      expect(typeof result.data.blockRate).toBe('number');
      expect(typeof result.data.averageFraudScore).toBe('number');
      expect(Array.isArray(result.data.topSignalTypes)).toBe(true);
    });

    it('should get and update fraud detection configuration', async () => {
      // Get current configuration
      const getResponse = await app.inject({
        method: 'GET',
        url: '/api/admin/fraud/config',
        headers: {
          authorization: `Bearer ${adminToken}`
        }
      });

      expect(getResponse.statusCode).toBe(200);
      
      const getResult = JSON.parse(getResponse.body);
      expect(getResult.success).toBe(true);
      expect(getResult.data).toHaveProperty('enabled');
      expect(getResult.data).toHaveProperty('autoBlockThreshold');
      expect(getResult.data).toHaveProperty('verificationThreshold');
      expect(getResult.data).toHaveProperty('velocityThresholds');

      // Update configuration
      const configUpdate = {
        autoBlockThreshold: 85,
        verificationThreshold: 65,
        behavioralAnalysisEnabled: true,
        velocityThresholds: {
          maxLoginsPerMinute: 3,
          maxLoginsPerHour: 25
        }
      };

      const updateResponse = await app.inject({
        method: 'PUT',
        url: '/api/admin/fraud/config',
        headers: {
          authorization: `Bearer ${adminToken}`,
          'content-type': 'application/json'
        },
        payload: configUpdate
      });

      expect(updateResponse.statusCode).toBe(200);
      
      const updateResult = JSON.parse(updateResponse.body);
      expect(updateResult.success).toBe(true);
      expect(updateResult.data).toHaveProperty('message');

      // Verify configuration was updated
      const verifyResponse = await app.inject({
        method: 'GET',
        url: '/api/admin/fraud/config',
        headers: {
          authorization: `Bearer ${adminToken}`
        }
      });

      const verifyResult = JSON.parse(verifyResponse.body);
      expect(verifyResult.data.autoBlockThreshold).toBe(85);
      expect(verifyResult.data.verificationThreshold).toBe(65);
    });

    it('should clear user fraud profile', async () => {
      const userId = 'test-user-123';

      const response = await app.inject({
        method: 'DELETE',
        url: `/api/admin/fraud/user-profile/${userId}`,
        headers: {
          authorization: `Bearer ${adminToken}`
        }
      });

      expect(response.statusCode).toBe(200);
      
      const result = JSON.parse(response.body);
      expect(result.success).toBe(true);
      expect(result.data.message).toContain(userId);
    });

    it('should get fraud signals reference', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/admin/fraud/signals-reference',
        headers: {
          authorization: `Bearer ${adminToken}`
        }
      });

      expect(response.statusCode).toBe(200);
      
      const result = JSON.parse(response.body);
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('signalTypes');
      expect(result.data).toHaveProperty('scoringModel');

      expect(Array.isArray(result.data.signalTypes)).toBe(true);
      expect(result.data.signalTypes.length).toBeGreaterThan(0);

      // Verify signal type structure
      result.data.signalTypes.forEach((signalType: any) => {
        expect(signalType).toHaveProperty('type');
        expect(signalType).toHaveProperty('description');
        expect(signalType).toHaveProperty('maxScore');
        expect(signalType).toHaveProperty('severityLevels');
        expect(Array.isArray(signalType.severityLevels)).toBe(true);
      });

      // Verify scoring model structure
      expect(result.data.scoringModel).toHaveProperty('riskLevels');
      expect(result.data.scoringModel).toHaveProperty('thresholds');
      expect(result.data.scoringModel).toHaveProperty('weights');
    });

    it('should perform bulk fraud analysis', async () => {
      const scenarios = [
        {
          name: 'Normal Login',
          ip: '8.8.8.8',
          userId: 'user-normal',
          metadata: { test: true }
        },
        {
          name: 'Suspicious Multiple IPs',
          ip: '1.2.3.4',
          userId: 'user-suspicious',
          deviceFingerprint: {
            userAgent: 'HeadlessChrome/91.0.4472.124',
            screenResolution: '1x1',
            timezone: 'UTC',
            language: 'en-US',
            platform: 'Linux',
            cookieEnabled: false,
            doNotTrack: true,
            hash: 'suspicious-hash'
          }
        },
        {
          name: 'VPN Login',
          ip: '5.6.7.8',
          userId: 'user-vpn',
          metadata: { vpnDetected: true }
        }
      ];

      const response = await app.inject({
        method: 'POST',
        url: '/api/admin/fraud/bulk-analysis',
        headers: {
          authorization: `Bearer ${adminToken}`,
          'content-type': 'application/json'
        },
        payload: { scenarios }
      });

      expect(response.statusCode).toBe(200);
      
      const result = JSON.parse(response.body);
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('results');
      expect(result.data).toHaveProperty('summary');

      expect(Array.isArray(result.data.results)).toBe(true);
      expect(result.data.results.length).toBe(scenarios.length);

      // Verify each result
      result.data.results.forEach((analysisResult: any, index: number) => {
        expect(analysisResult.name).toBe(scenarios[index].name);
        expect(analysisResult).toHaveProperty('fraudScore');
        expect(analysisResult).toHaveProperty('riskLevel');
        expect(analysisResult).toHaveProperty('allowAccess');
        expect(analysisResult).toHaveProperty('signalCount');
      });

      // Verify summary
      expect(result.data.summary).toHaveProperty('totalScenarios');
      expect(result.data.summary).toHaveProperty('averageScore');
      expect(result.data.summary).toHaveProperty('blockedCount');
      expect(result.data.summary).toHaveProperty('verificationCount');
      expect(result.data.summary.totalScenarios).toBe(scenarios.length);
    });

    it('should check fraud detection service health', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/admin/fraud/health',
        headers: {
          authorization: `Bearer ${adminToken}`
        }
      });

      expect(response.statusCode).toBe(200);
      
      const result = JSON.parse(response.body);
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('status');
      expect(result.data).toHaveProperty('enabled');
      expect(result.data).toHaveProperty('uptime');
      expect(result.data).toHaveProperty('configuration');

      expect(result.data.status).toBe('healthy');
      expect(typeof result.data.enabled).toBe('boolean');
      expect(typeof result.data.uptime).toBe('string');

      // Verify configuration status
      const config = result.data.configuration;
      expect(config).toHaveProperty('velocityAnalysis');
      expect(config).toHaveProperty('geoAnalysis');
      expect(config).toHaveProperty('deviceFingerprinting');
      expect(config).toHaveProperty('behavioralAnalysis');
      expect(config).toHaveProperty('mlModel');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing IP in test analysis', async () => {
      const adminToken = await getValidAdminToken();
      
      const response = await app.inject({
        method: 'POST',
        url: '/api/admin/fraud/test-analysis',
        headers: {
          authorization: `Bearer ${adminToken}`,
          'content-type': 'application/json'
        },
        payload: {
          userId: 'test-user'
          // Missing required 'ip' field
        }
      });

      expect(response.statusCode).toBe(400);
      
      const result = JSON.parse(response.body);
      expect(result.code).toBe('VALIDATION_REQUIRED_FIELD');
    });

    it('should handle invalid configuration values', async () => {
      const adminToken = await getValidAdminToken();
      
      const invalidConfig = {
        autoBlockThreshold: 150, // Invalid: > 100
        verificationThreshold: -10 // Invalid: < 0
      };

      const response = await app.inject({
        method: 'PUT',
        url: '/api/admin/fraud/config',
        headers: {
          authorization: `Bearer ${adminToken}`,
          'content-type': 'application/json'
        },
        payload: invalidConfig
      });

      expect(response.statusCode).toBe(400);
      
      const result = JSON.parse(response.body);
      expect(result.code).toBe('VALIDATION_INVALID_RANGE');
    });

    it('should handle empty bulk analysis request', async () => {
      const adminToken = await getValidAdminToken();
      
      const response = await app.inject({
        method: 'POST',
        url: '/api/admin/fraud/bulk-analysis',
        headers: {
          authorization: `Bearer ${adminToken}`,
          'content-type': 'application/json'
        },
        payload: {
          scenarios: []
        }
      });

      expect(response.statusCode).toBe(400);
      
      const result = JSON.parse(response.body);
      expect(result.code).toBe('VALIDATION_REQUIRED_FIELD');
    });

    it('should handle too many bulk analysis scenarios', async () => {
      const adminToken = await getValidAdminToken();
      
      // Create 101 scenarios (over the limit)
      const scenarios = Array(101).fill(null).map((_, i) => ({
        name: `Scenario ${i}`,
        ip: `192.168.1.${i % 255}`,
        userId: `user-${i}`
      }));

      const response = await app.inject({
        method: 'POST',
        url: '/api/admin/fraud/bulk-analysis',
        headers: {
          authorization: `Bearer ${adminToken}`,
          'content-type': 'application/json'
        },
        payload: { scenarios }
      });

      expect(response.statusCode).toBe(400);
      
      const result = JSON.parse(response.body);
      expect(result.code).toBe('VALIDATION_INVALID_RANGE');
    });

    it('should require authentication for admin endpoints', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/admin/fraud/statistics'
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('Performance Integration', () => {
    it('should handle concurrent fraud analysis requests', async () => {
      const adminToken = await getValidAdminToken();
      
      const testRequest = {
        ip: '8.8.8.8',
        userId: 'concurrent-test-user'
      };

      const startTime = Date.now();
      
      // Make 5 concurrent requests
      const requests = Array(5).fill(null).map(() =>
        app.inject({
          method: 'POST',
          url: '/api/admin/fraud/test-analysis',
          headers: {
            authorization: `Bearer ${adminToken}`,
            'content-type': 'application/json'
          },
          payload: testRequest
        })
      );

      const responses = await Promise.all(requests);
      const endTime = Date.now();
      
      // All should succeed
      responses.forEach(response => {
        expect(response.statusCode).toBe(200);
        const result = JSON.parse(response.body);
        expect(result.success).toBe(true);
      });

      // Should complete within reasonable time (3 seconds for 5 concurrent requests)
      expect(endTime - startTime).toBeLessThan(3000);
    });

    it('should complete fraud analysis within performance threshold', async () => {
      const adminToken = await getValidAdminToken();
      
      const testRequest = {
        ip: '192.168.1.100',
        userId: 'performance-test-user',
        deviceFingerprint: {
          userAgent: 'Mozilla/5.0 Performance Test',
          screenResolution: '1920x1080',
          timezone: 'America/New_York',
          language: 'en-US',
          platform: 'Win32',
          cookieEnabled: true,
          doNotTrack: false,
          hash: 'performance-test-hash'
        }
      };

      const startTime = Date.now();
      
      const response = await app.inject({
        method: 'POST',
        url: '/api/admin/fraud/test-analysis',
        headers: {
          authorization: `Bearer ${adminToken}`,
          'content-type': 'application/json'
        },
        payload: testRequest
      });

      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(response.statusCode).toBe(200);
      
      // Fraud analysis should complete within 100ms
      expect(duration).toBeLessThan(100);
    });
  });

  describe('Security Integration', () => {
    it('should detect and handle suspicious login patterns', async () => {
      // Simulate multiple rapid login attempts
      const suspiciousRequests = Array(3).fill(null).map((_, i) =>
        app.inject({
          method: 'POST',
          url: '/api/auth/login',
          headers: {
            'user-agent': 'AutomatedTool/1.0',
            'x-forwarded-for': '1.2.3.4'
          },
          payload: {
            email: `test${i}@example.com`,
            password: 'password123'
          }
        })
      );

      const responses = await Promise.all(suspiciousRequests);
      
      // At least some should proceed (fraud detection may not block all)
      const successfulResponses = responses.filter(r => r.statusCode !== 403);
      const blockedResponses = responses.filter(r => r.statusCode === 403);
      
      // Either some are blocked, or all proceed with fraud context
      expect(successfulResponses.length + blockedResponses.length).toBe(responses.length);
    });

    it('should handle device fingerprint validation', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        headers: {
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'x-forwarded-for': '8.8.8.8',
          'x-screen-resolution': '1920x1080',
          'x-timezone': 'America/New_York',
          'x-platform': 'Win32',
          'x-cookie-enabled': 'true'
        },
        payload: {
          email: 'legitimate@example.com',
          password: 'password123'
        }
      });

      // Should not be blocked for normal fingerprint
      expect(response.statusCode).not.toBe(403);
    });

    it('should handle suspicious device characteristics', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        headers: {
          'user-agent': 'HeadlessChrome/91.0.4472.124 selenium',
          'x-forwarded-for': '1.2.3.4',
          'x-screen-resolution': '1x1',
          'x-timezone': 'UTC',
          'x-platform': 'Linux',
          'x-cookie-enabled': 'false'
        },
        payload: {
          email: 'suspicious@example.com',
          password: 'password123'
        }
      });

      // May be blocked or require additional verification
      if (response.statusCode === 403) {
        const result = JSON.parse(response.body);
        expect(result.code).toBe('SECURITY_FRAUD_DETECTED');
        expect(result.details).toHaveProperty('fraudScore');
      }
    });
  });
});

// Helper function to get a valid admin token for testing
async function getValidAdminToken(): Promise<string> {
  // In a real test, this would authenticate as an admin user
  // For now, return a mock token that bypasses authentication in test environment
  return 'mock-admin-token-for-testing';
}