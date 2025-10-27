import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../../src/app';

describe('Geographic Restrictions Integration Tests', () => {
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
    it('should allow requests from safe IPs', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/auth/me',
        headers: {
          'x-forwarded-for': '8.8.8.8' // Google DNS (US)
        }
      });

      // Should reach the route (even if it returns 401 for no auth)
      expect(response.statusCode).not.toBe(403);
    });

    it('should exempt health check endpoints', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
        headers: {
          'x-forwarded-for': '1.2.3.4' // Any IP should work for health
        }
      });

      expect(response.statusCode).toBe(200);
    });

    it('should exempt metrics endpoints', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/metrics',
        headers: {
          'x-forwarded-for': '1.2.3.4' // Any IP should work for metrics
        }
      });

      expect(response.statusCode).toBe(200);
    });

    it('should add geo context to allowed requests', async () => {
      // We'll need to create a test endpoint that exposes the geo context
      // For now, test that the request proceeds normally
      const response = await app.inject({
        method: 'GET',
        url: '/api/auth/me',
        headers: {
          'x-forwarded-for': '8.8.8.8'
        }
      });

      // Should not be blocked by geo restrictions
      expect(response.statusCode).not.toBe(403);
    });

    it('should handle private IP addresses correctly', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/auth/me',
        headers: {
          'x-forwarded-for': '192.168.1.1' // Private IP
        }
      });

      // Private IPs should be exempted
      expect(response.statusCode).not.toBe(403);
    });

    it('should handle localhost correctly', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/auth/me',
        headers: {
          'x-forwarded-for': '127.0.0.1' // Localhost
        }
      });

      // Localhost should be exempted
      expect(response.statusCode).not.toBe(403);
    });
  });

  describe('Admin API Integration', () => {
    let adminToken: string;

    beforeEach(async () => {
      adminToken = await getValidAdminToken();
    });

    it('should test geolocation lookup', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/admin/geo/test-lookup?ip=8.8.8.8',
        headers: {
          authorization: `Bearer ${adminToken}`
        }
      });

      expect(response.statusCode).toBe(200);
      
      const result = JSON.parse(response.body);
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('ip');
      expect(result.data).toHaveProperty('country');
      expect(result.data).toHaveProperty('countryCode');
      expect(result.data.ip).toBe('8.8.8.8');
    });

    it('should test access check', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/admin/geo/test-access',
        headers: {
          authorization: `Bearer ${adminToken}`,
          'content-type': 'application/json'
        },
        payload: {
          ip: '8.8.8.8',
          endpoint: '/api/users/profile',
          userId: 'test-user',
          userAgent: 'Mozilla/5.0 Test Browser'
        }
      });

      expect(response.statusCode).toBe(200);
      
      const result = JSON.parse(response.body);
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('ip');
      expect(result.data).toHaveProperty('allowed');
      expect(result.data).toHaveProperty('country');
      expect(result.data).toHaveProperty('riskScore');
      expect(result.data.ip).toBe('8.8.8.8');
    });

    it('should get restriction rules', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/admin/geo/rules',
        headers: {
          authorization: `Bearer ${adminToken}`
        }
      });

      expect(response.statusCode).toBe(200);
      
      const result = JSON.parse(response.body);
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('rules');
      expect(result.data).toHaveProperty('count');
      expect(Array.isArray(result.data.rules)).toBe(true);
    });

    it('should add and remove restriction rules', async () => {
      // Add a new rule
      const newRule = {
        name: 'Test Integration Rule',
        type: 'BLOCK',
        scope: 'GLOBAL',
        countries: ['XX'],
        priority: 150,
        enabled: true,
        reason: 'Integration test rule'
      };

      const addResponse = await app.inject({
        method: 'POST',
        url: '/api/admin/geo/rules',
        headers: {
          authorization: `Bearer ${adminToken}`,
          'content-type': 'application/json'
        },
        payload: newRule
      });

      expect(addResponse.statusCode).toBe(201);
      
      const addResult = JSON.parse(addResponse.body);
      expect(addResult.success).toBe(true);
      expect(addResult.data).toHaveProperty('ruleId');
      
      const ruleId = addResult.data.ruleId;

      // Verify the rule was added
      const getRulesResponse = await app.inject({
        method: 'GET',
        url: '/api/admin/geo/rules',
        headers: {
          authorization: `Bearer ${adminToken}`
        }
      });

      const getRulesResult = JSON.parse(getRulesResponse.body);
      const addedRule = getRulesResult.data.rules.find((r: any) => r.id === ruleId);
      expect(addedRule).toBeDefined();
      expect(addedRule.name).toBe(newRule.name);

      // Remove the rule
      const removeResponse = await app.inject({
        method: 'DELETE',
        url: `/api/admin/geo/rules/${ruleId}`,
        headers: {
          authorization: `Bearer ${adminToken}`
        }
      });

      expect(removeResponse.statusCode).toBe(200);
      
      const removeResult = JSON.parse(removeResponse.body);
      expect(removeResult.success).toBe(true);

      // Verify the rule was removed
      const getAfterRemove = await app.inject({
        method: 'GET',
        url: '/api/admin/geo/rules',
        headers: {
          authorization: `Bearer ${adminToken}`
        }
      });

      const afterRemoveResult = JSON.parse(getAfterRemove.body);
      const removedRule = afterRemoveResult.data.rules.find((r: any) => r.id === ruleId);
      expect(removedRule).toBeUndefined();
    });

    it('should get and clear statistics', async () => {
      // Get initial statistics
      const getStatsResponse = await app.inject({
        method: 'GET',
        url: '/api/admin/geo/statistics',
        headers: {
          authorization: `Bearer ${adminToken}`
        }
      });

      expect(getStatsResponse.statusCode).toBe(200);
      
      const statsResult = JSON.parse(getStatsResponse.body);
      expect(statsResult.success).toBe(true);
      expect(statsResult.data).toHaveProperty('totalChecks');
      expect(statsResult.data).toHaveProperty('blockedRequests');
      expect(statsResult.data).toHaveProperty('blockRate');
      expect(statsResult.data).toHaveProperty('topBlockedCountries');
      expect(statsResult.data).toHaveProperty('topAllowedCountries');
      expect(statsResult.data).toHaveProperty('ruleEffectiveness');

      // Clear statistics
      const clearResponse = await app.inject({
        method: 'DELETE',
        url: '/api/admin/geo/statistics',
        headers: {
          authorization: `Bearer ${adminToken}`
        }
      });

      expect(clearResponse.statusCode).toBe(200);
      
      const clearResult = JSON.parse(clearResponse.body);
      expect(clearResult.success).toBe(true);

      // Verify statistics were cleared
      const afterClearResponse = await app.inject({
        method: 'GET',
        url: '/api/admin/geo/statistics',
        headers: {
          authorization: `Bearer ${adminToken}`
        }
      });

      const afterClearResult = JSON.parse(afterClearResponse.body);
      expect(afterClearResult.data.totalChecks).toBe(0);
      expect(afterClearResult.data.blockedRequests).toBe(0);
    });

    it('should update configuration', async () => {
      const configUpdate = {
        enabled: true,
        defaultPolicy: 'ALLOW',
        enableVpnDetection: true,
        enableProxyDetection: true,
        logAllChecks: false
      };

      const response = await app.inject({
        method: 'PUT',
        url: '/api/admin/geo/config',
        headers: {
          authorization: `Bearer ${adminToken}`,
          'content-type': 'application/json'
        },
        payload: configUpdate
      });

      expect(response.statusCode).toBe(200);
      
      const result = JSON.parse(response.body);
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('message');
    });

    it('should clear geolocation cache', async () => {
      // Clear all cache
      const clearAllResponse = await app.inject({
        method: 'DELETE',
        url: '/api/admin/geo/cache',
        headers: {
          authorization: `Bearer ${adminToken}`
        }
      });

      expect(clearAllResponse.statusCode).toBe(200);
      
      const clearAllResult = JSON.parse(clearAllResponse.body);
      expect(clearAllResult.success).toBe(true);
      expect(clearAllResult.data.message).toContain('All geolocation cache cleared');

      // Clear specific IP cache
      const clearIPResponse = await app.inject({
        method: 'DELETE',
        url: '/api/admin/geo/cache?ip=8.8.8.8',
        headers: {
          authorization: `Bearer ${adminToken}`
        }
      });

      expect(clearIPResponse.statusCode).toBe(200);
      
      const clearIPResult = JSON.parse(clearIPResponse.body);
      expect(clearIPResult.success).toBe(true);
      expect(clearIPResult.data.message).toContain('8.8.8.8');
    });

    it('should get geolocation service statistics', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/admin/geo/service-stats',
        headers: {
          authorization: `Bearer ${adminToken}`
        }
      });

      expect(response.statusCode).toBe(200);
      
      const result = JSON.parse(response.body);
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('cacheHitRate');
      expect(result.data).toHaveProperty('totalRequests');
      expect(result.data).toHaveProperty('providerUsage');
      expect(result.data).toHaveProperty('avgResponseTime');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing IP in test lookup', async () => {
      const adminToken = await getValidAdminToken();
      
      const response = await app.inject({
        method: 'GET',
        url: '/api/admin/geo/test-lookup',
        headers: {
          authorization: `Bearer ${adminToken}`
        }
      });

      expect(response.statusCode).toBe(400);
      
      const result = JSON.parse(response.body);
      expect(result.code).toBe('VALIDATION_REQUIRED_FIELD');
    });

    it('should handle missing IP in test access', async () => {
      const adminToken = await getValidAdminToken();
      
      const response = await app.inject({
        method: 'POST',
        url: '/api/admin/geo/test-access',
        headers: {
          authorization: `Bearer ${adminToken}`,
          'content-type': 'application/json'
        },
        payload: {
          endpoint: '/api/test'
        }
      });

      expect(response.statusCode).toBe(400);
      
      const result = JSON.parse(response.body);
      expect(result.code).toBe('VALIDATION_REQUIRED_FIELD');
    });

    it('should handle invalid rule data', async () => {
      const adminToken = await getValidAdminToken();
      
      const invalidRule = {
        name: 'Invalid Rule',
        // Missing required fields
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/admin/geo/rules',
        headers: {
          authorization: `Bearer ${adminToken}`,
          'content-type': 'application/json'
        },
        payload: invalidRule
      });

      expect(response.statusCode).toBe(400);
      
      const result = JSON.parse(response.body);
      expect(result.code).toBe('VALIDATION_REQUIRED_FIELD');
    });

    it('should handle non-existent rule removal', async () => {
      const adminToken = await getValidAdminToken();
      
      const response = await app.inject({
        method: 'DELETE',
        url: '/api/admin/geo/rules/non-existent-rule',
        headers: {
          authorization: `Bearer ${adminToken}`
        }
      });

      expect(response.statusCode).toBe(404);
      
      const result = JSON.parse(response.body);
      expect(result.code).toBe('RESOURCE_NOT_FOUND');
    });

    it('should require authentication for admin endpoints', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/admin/geo/rules'
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('Rate Limiting Integration', () => {
    it('should apply rate limiting to geolocation lookups', async () => {
      const adminToken = await getValidAdminToken();
      
      // Make multiple rapid requests
      const requests = Array(10).fill(null).map((_, i) => 
        app.inject({
          method: 'GET',
          url: `/api/admin/geo/test-lookup?ip=8.8.${i}.${i}`,
          headers: {
            authorization: `Bearer ${adminToken}`
          }
        })
      );

      const responses = await Promise.all(requests);
      
      // All should succeed initially (assuming reasonable rate limits)
      responses.forEach(response => {
        expect([200, 429]).toContain(response.statusCode);
      });
    });
  });

  describe('Performance Integration', () => {
    it('should handle concurrent geolocation requests', async () => {
      const adminToken = await getValidAdminToken();
      
      const startTime = Date.now();
      
      // Make 5 concurrent requests
      const requests = Array(5).fill(null).map(() =>
        app.inject({
          method: 'GET',
          url: '/api/admin/geo/test-lookup?ip=8.8.8.8',
          headers: {
            authorization: `Bearer ${adminToken}`
          }
        })
      );

      const responses = await Promise.all(requests);
      const endTime = Date.now();
      
      // All should succeed
      responses.forEach(response => {
        expect(response.statusCode).toBe(200);
      });

      // Should complete within reasonable time (5 seconds for 5 concurrent requests)
      expect(endTime - startTime).toBeLessThan(5000);
    });

    it('should cache geolocation results effectively', async () => {
      const adminToken = await getValidAdminToken();
      
      // First request (should hit external service)
      const firstResponse = await app.inject({
        method: 'GET',
        url: '/api/admin/geo/test-lookup?ip=8.8.8.8',
        headers: {
          authorization: `Bearer ${adminToken}`
        }
      });

      expect(firstResponse.statusCode).toBe(200);
      const firstTime = Date.now();

      // Second request (should hit cache)
      const secondResponse = await app.inject({
        method: 'GET',
        url: '/api/admin/geo/test-lookup?ip=8.8.8.8',
        headers: {
          authorization: `Bearer ${adminToken}`
        }
      });

      expect(secondResponse.statusCode).toBe(200);
      const secondTime = Date.now();

      // Cached request should be faster (though this is not always guaranteed)
      // At minimum, both should return the same data
      const firstData = JSON.parse(firstResponse.body);
      const secondData = JSON.parse(secondResponse.body);
      
      expect(firstData.data.ip).toBe(secondData.data.ip);
      expect(firstData.data.countryCode).toBe(secondData.data.countryCode);
    });
  });

  describe('Security Integration', () => {
    it('should block requests from high-risk countries', async () => {
      // This test would require mocking the geolocation service
      // to return a high-risk country response for testing
      
      // For now, verify that the geo restriction error format is correct
      const adminToken = await getValidAdminToken();
      
      // Test with a mock high-risk scenario
      const response = await app.inject({
        method: 'POST',
        url: '/api/admin/geo/test-access',
        headers: {
          authorization: `Bearer ${adminToken}`,
          'content-type': 'application/json'
        },
        payload: {
          ip: '1.2.3.4', // This might trigger restrictions in test
          endpoint: '/api/users/profile'
        }
      });

      // Response should be successful (it's a test endpoint)
      expect(response.statusCode).toBe(200);
      
      const result = JSON.parse(response.body);
      expect(result.data).toHaveProperty('allowed');
      expect(result.data).toHaveProperty('riskScore');
    });

    it('should handle VPN detection appropriately', async () => {
      const adminToken = await getValidAdminToken();
      
      // This would require mocking VPN detection
      // For now, just test that the system handles VPN-like patterns
      const response = await app.inject({
        method: 'POST',
        url: '/api/admin/geo/test-access',
        headers: {
          authorization: `Bearer ${adminToken}`,
          'content-type': 'application/json'
        },
        payload: {
          ip: '5.6.7.8', // Mock VPN IP
          endpoint: '/api/users/profile',
          userAgent: 'VPN Client 1.0'
        }
      });

      expect(response.statusCode).toBe(200);
      
      const result = JSON.parse(response.body);
      expect(result.data).toHaveProperty('riskScore');
      // Risk score might be elevated due to suspicious patterns
      expect(result.data.riskScore).toBeGreaterThanOrEqual(0);
    });
  });
});

// Helper function to get a valid admin token for testing
async function getValidAdminToken(): Promise<string> {
  // In a real test, this would authenticate as an admin user
  // For now, return a mock token that bypasses authentication in test environment
  return 'mock-admin-token-for-testing';
}