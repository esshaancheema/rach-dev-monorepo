import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { getServiceUrl } from '../setup/test-services';
import { testUsers, testApiKeys, createTestUser, createTestProject } from '../setup/test-data';

describe('End-to-End API Flow Integration Tests', () => {
  const authServiceUrl = getServiceUrl('auth-service');
  const projectServiceUrl = getServiceUrl('project-service');
  const aiServiceUrl = getServiceUrl('ai-service');
  const billingServiceUrl = getServiceUrl('billing-service');
  const analyticsServiceUrl = getServiceUrl('analytics-service');

  let userToken: string;
  let testUser: any;
  let testProject: any;
  let apiKey: string;

  beforeAll(async () => {
    // Create a fresh test user for this flow
    testUser = await createTestUser({
      email: `flow-test-${Date.now()}@example.com`,
      emailVerified: true
    });

    // Login to get access token
    const loginResponse = await request(authServiceUrl)
      .post('/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      })
      .expect(200);

    userToken = loginResponse.body.tokens.accessToken;
  });

  describe('Complete User Journey', () => {
    test('1. User creates a new project', async () => {
      const projectData = {
        name: `Test Project ${Date.now()}`,
        description: 'End-to-end test project',
        settings: {
          allowedOrigins: ['http://localhost:3000'],
          rateLimit: { requests: 1000, window: 3600 }
        }
      };

      const response = await request(projectServiceUrl)
        .post('/projects')
        .set('Authorization', `Bearer ${userToken}`)
        .send(projectData)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        project: {
          name: projectData.name,
          description: projectData.description,
          ownerId: testUser.id
        }
      });

      testProject = response.body.project;
    });

    test('2. User generates API key for the project', async () => {
      const apiKeyData = {
        name: `Test API Key ${Date.now()}`,
        projectId: testProject.id,
        permissions: ['read', 'write'],
        expiresAt: null // No expiration
      };

      const response = await request(authServiceUrl)
        .post('/api-keys')
        .set('Authorization', `Bearer ${userToken}`)
        .send(apiKeyData)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        apiKey: {
          name: apiKeyData.name,
          projectId: testProject.id,
          permissions: apiKeyData.permissions
        }
      });

      expect(response.body.key).toBeDefined();
      expect(response.body.key).toMatch(/^zpt_/);

      apiKey = response.body.key;
    });

    test('3. User makes AI chat request using API key', async () => {
      const chatRequest = {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: 'Hello, how are you?'
          }
        ],
        maxTokens: 100
      };

      const response = await request(aiServiceUrl)
        .post('/ai/chat')
        .set('Authorization', `Bearer ${apiKey}`)
        .send(chatRequest)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        response: {
          message: expect.any(String),
          model: chatRequest.model,
          usage: {
            promptTokens: expect.any(Number),
            completionTokens: expect.any(Number),
            totalTokens: expect.any(Number)
          }
        }
      });
    });

    test('4. User checks project analytics', async () => {
      // Wait a moment for analytics to be processed
      await new Promise(resolve => setTimeout(resolve, 1000));

      const response = await request(analyticsServiceUrl)
        .get(`/analytics/projects/${testProject.id}/usage`)
        .set('Authorization', `Bearer ${userToken}`)
        .query({
          startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString()
        })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        analytics: {
          totalRequests: expect.any(Number),
          totalTokens: expect.any(Number),
          requestsByDay: expect.any(Array),
          topEndpoints: expect.any(Array)
        }
      });

      // Should have at least one request from the AI call
      expect(response.body.analytics.totalRequests).toBeGreaterThan(0);
    });

    test('5. User checks billing information', async () => {
      const response = await request(billingServiceUrl)
        .get('/billing/usage')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        usage: {
          currentPeriod: {
            requests: expect.any(Number),
            tokens: expect.any(Number),
            cost: expect.any(Number)
          },
          subscription: {
            plan: expect.any(String),
            status: expect.any(String)
          }
        }
      });
    });

    test('6. User updates project settings', async () => {
      const updatedSettings = {
        allowedOrigins: ['http://localhost:3000', 'https://example.com'],
        rateLimit: { requests: 2000, window: 3600 },
        enableLogging: true
      };

      const response = await request(projectServiceUrl)
        .put(`/projects/${testProject.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          settings: updatedSettings
        })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        project: {
          id: testProject.id,
          settings: updatedSettings
        }
      });
    });

    test('7. User makes another AI request with updated settings', async () => {
      const chatRequest = {
        model: 'gpt-4',
        messages: [
          {
            role: 'user',
            content: 'What is the weather like today?'
          }
        ],
        maxTokens: 150
      };

      const response = await request(aiServiceUrl)
        .post('/ai/chat')
        .set('Authorization', `Bearer ${apiKey}`)
        .send(chatRequest)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        response: {
          message: expect.any(String),
          model: chatRequest.model
        }
      });
    });

    test('8. User views detailed analytics', async () => {
      // Wait for analytics to be updated
      await new Promise(resolve => setTimeout(resolve, 1000));

      const response = await request(analyticsServiceUrl)
        .get(`/analytics/projects/${testProject.id}/detailed`)
        .set('Authorization', `Bearer ${userToken}`)
        .query({
          startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString()
        })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        analytics: {
          requestsByModel: expect.any(Object),
          averageResponseTime: expect.any(Number),
          errorRate: expect.any(Number),
          tokenUsageByModel: expect.any(Object)
        }
      });

      // Should have requests for both models used
      expect(response.body.analytics.requestsByModel['gpt-3.5-turbo']).toBeGreaterThan(0);
      expect(response.body.analytics.requestsByModel['gpt-4']).toBeGreaterThan(0);
    });

    test('9. User revokes API key', async () => {
      // First get the API key ID
      const apiKeysResponse = await request(authServiceUrl)
        .get('/api-keys')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      const apiKeyRecord = apiKeysResponse.body.apiKeys.find(
        (key: any) => key.projectId === testProject.id
      );

      expect(apiKeyRecord).toBeDefined();

      // Revoke the API key
      const response = await request(authServiceUrl)
        .delete(`/api-keys/${apiKeyRecord.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: expect.stringContaining('revoked')
      });

      // Try to use the revoked API key
      const failedRequest = await request(aiServiceUrl)
        .post('/ai/chat')
        .set('Authorization', `Bearer ${apiKey}`)
        .send({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'Test' }]
        })
        .expect(401);

      expect(failedRequest.body).toMatchObject({
        success: false,
        error: expect.stringContaining('Invalid')
      });
    });

    test('10. User deletes project', async () => {
      const response = await request(projectServiceUrl)
        .delete(`/projects/${testProject.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: expect.stringContaining('deleted')
      });

      // Verify project is deleted
      const getResponse = await request(projectServiceUrl)
        .get(`/projects/${testProject.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);

      expect(getResponse.body).toMatchObject({
        success: false,
        error: expect.stringContaining('not found')
      });
    });
  });

  describe('Cross-Service Data Consistency', () => {
    test('should maintain consistency across services when user is deleted', async () => {
      // Create a new user for this test
      const tempUser = await createTestUser({
        email: `consistency-test-${Date.now()}@example.com`,
        emailVerified: true
      });

      // Login
      const loginResponse = await request(authServiceUrl)
        .post('/auth/login')
        .send({
          email: tempUser.email,
          password: tempUser.password
        });

      const token = loginResponse.body.tokens.accessToken;

      // Create project
      const projectResponse = await request(projectServiceUrl)
        .post('/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Consistency Test Project',
          description: 'Test project for consistency'
        });

      const project = projectResponse.body.project;

      // Generate API key
      const apiKeyResponse = await request(authServiceUrl)
        .post('/api-keys')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Consistency Test Key',
          projectId: project.id,
          permissions: ['read', 'write']
        });

      // Make some AI requests to generate analytics
      await request(aiServiceUrl)
        .post('/ai/chat')
        .set('Authorization', `Bearer ${apiKeyResponse.body.key}`)
        .send({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'Test message' }]
        });

      // Wait for analytics to be processed
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Delete user (this should cascade delete related data)
      const deleteResponse = await request(authServiceUrl)
        .delete('/auth/account')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(deleteResponse.body).toMatchObject({
        success: true,
        message: expect.stringContaining('deleted')
      });

      // Verify user's projects are deleted
      const projectsResponse = await request(projectServiceUrl)
        .get('/projects')
        .set('Authorization', `Bearer ${token}`)
        .expect(401); // Should be unauthorized since user is deleted

      // Verify API keys are revoked
      const aiResponse = await request(aiServiceUrl)
        .post('/ai/chat')
        .set('Authorization', `Bearer ${apiKeyResponse.body.key}`)
        .send({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'Test' }]
        })
        .expect(401);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle service unavailability gracefully', async () => {
      // Test with invalid service endpoint
      const response = await request('http://localhost:9999')
        .get('/health')
        .timeout(5000);

      // Should handle connection error
      expect(response.status).toBeUndefined();
    });

    test('should handle malformed requests properly', async () => {
      const response = await request(aiServiceUrl)
        .post('/ai/chat')
        .set('Authorization', `Bearer ${apiKey}`)
        .send({
          // Missing required fields
          model: 'gpt-3.5-turbo'
          // Missing messages
        })
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: expect.stringContaining('messages')
      });
    });

    test('should handle rate limiting correctly', async () => {
      // Make rapid requests to trigger rate limiting
      const requests = Array(20).fill(null).map(() =>
        request(aiServiceUrl)
          .post('/ai/chat')
          .set('Authorization', `Bearer ${apiKey}`)
          .send({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: 'Rate limit test' }]
          })
      );

      const responses = await Promise.allSettled(requests);
      const rateLimitedResponses = responses.filter(
        (result) => result.status === 'fulfilled' && 
        (result.value as any).status === 429
      );

      // Some requests should be rate limited
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('Performance and Load Testing', () => {
    test('should handle concurrent requests efficiently', async () => {
      const startTime = Date.now();
      
      // Make 10 concurrent AI requests
      const promises = Array(10).fill(null).map(() =>
        request(aiServiceUrl)
          .post('/ai/chat')
          .set('Authorization', `Bearer ${apiKey}`)
          .send({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: 'Concurrent test' }]
          })
      );

      const responses = await Promise.all(promises);
      const endTime = Date.now();

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // Should complete within reasonable time (adjust based on your performance requirements)
      const totalTime = endTime - startTime;
      expect(totalTime).toBeLessThan(30000); // 30 seconds max
    });

    test('should maintain performance under sustained load', async () => {
      const batchSize = 5;
      const batches = 3;
      const results: number[] = [];

      for (let batch = 0; batch < batches; batch++) {
        const startTime = Date.now();
        
        const promises = Array(batchSize).fill(null).map(() =>
          request(aiServiceUrl)
            .post('/ai/chat')
            .set('Authorization', `Bearer ${apiKey}`)
            .send({
              model: 'gpt-3.5-turbo',
              messages: [{ role: 'user', content: `Load test batch ${batch}` }]
            })
        );

        await Promise.all(promises);
        const batchTime = Date.now() - startTime;
        results.push(batchTime);

        // Brief pause between batches
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Performance should not degrade significantly across batches
      const avgTime = results.reduce((a, b) => a + b, 0) / results.length;
      const maxTime = Math.max(...results);
      
      // Max time should not be more than 2x average time
      expect(maxTime).toBeLessThan(avgTime * 2);
    });
  });
});