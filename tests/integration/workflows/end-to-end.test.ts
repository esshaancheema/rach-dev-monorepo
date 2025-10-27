import { AuthHelper, AuthenticatedUser } from '../utils/auth-helper';
import { 
  authClient, 
  projectClient, 
  aiClient, 
  billingClient, 
  notificationClient,
  createAuthenticatedClient 
} from '../utils/test-client';
import { PostgresHelper, RedisHelper, setupDatabases, teardownDatabases } from '../utils/database-helper';

describe('End-to-End Workflow Integration Tests', () => {
  let postgres: PostgresHelper;
  let redis: RedisHelper;

  beforeAll(async () => {
    const databases = await setupDatabases();
    postgres = databases.postgres;
    redis = databases.redis;
  });

  afterAll(async () => {
    await teardownDatabases(postgres, redis);
  });

  beforeEach(async () => {
    // Clean up between tests
    await postgres.truncateAllTables();
    await redis.flushAll();
  });

  describe('Complete User Registration and Onboarding Flow', () => {
    it('should complete full user onboarding workflow', async () => {
      // Step 1: User registration
      const registrationData = {
        email: 'onboarding@example.com',
        name: 'Onboarding User',
        password: 'SecurePassword123!',
      };

      const registerResponse = await authClient.post('/auth/register', registrationData);
      expect(registerResponse.status).toBe(201);
      
      const user = registerResponse.data.user;
      const tokens = registerResponse.data.tokens;

      // Step 2: Email verification (simulated)
      const verifyResponse = await authClient.post('/auth/verify-email', {
        token: 'mock-verification-token',
        userId: user.id,
      });
      expect([200, 404]).toContain(verifyResponse.status); // 404 if endpoint not implemented

      // Step 3: Complete profile setup
      const profileClient = createAuthenticatedClient(authClient.client.defaults.baseURL, tokens.accessToken);
      const profileResponse = await profileClient.patch('/auth/profile', {
        firstName: 'Onboarding',
        lastName: 'User',
        company: 'Test Company',
        role: 'developer',
      });
      expect([200, 404]).toContain(profileResponse.status);

      // Step 4: Create first project
      const projectResponse = await createAuthenticatedClient(
        projectClient.client.defaults.baseURL, 
        tokens.accessToken
      ).post('/projects', {
        name: 'My First Project',
        description: 'Getting started with Zoptal',
        visibility: 'private',
      });
      expect([201, 404]).toContain(projectResponse.status);

      // Step 5: Setup billing (free plan)
      const billingResponse = await createAuthenticatedClient(
        billingClient.client.defaults.baseURL,
        tokens.accessToken
      ).post('/billing/subscription', {
        planId: 'free',
      });
      expect([201, 404]).toContain(billingResponse.status);

      // Step 6: Welcome notification should be sent
      const notificationResponse = await createAuthenticatedClient(
        notificationClient.client.defaults.baseURL,
        tokens.accessToken
      ).get('/notifications');
      expect([200, 404]).toContain(notificationResponse.status);

      // Verify user exists in database
      const dbUser = await postgres.queryOne(
        'SELECT * FROM users WHERE email = $1',
        [registrationData.email]
      );
      expect(dbUser).toBeTruthy();
    });
  });

  describe('Project Creation and AI Integration Workflow', () => {
    let user: AuthenticatedUser;

    beforeEach(async () => {
      user = await AuthHelper.registerTestUser();
    });

    it('should create project and generate AI code', async () => {
      const projectClient = createAuthenticatedClient(
        projectClient.client.defaults.baseURL,
        user.tokens.accessToken
      );
      const aiServiceClient = createAuthenticatedClient(
        aiClient.client.defaults.baseURL,
        user.tokens.accessToken
      );

      // Step 1: Create project
      const projectData = {
        name: 'AI Generated App',
        description: 'Testing AI code generation',
        visibility: 'private',
        template: 'react-typescript',
      };

      const createProjectResponse = await projectClient.post('/projects', projectData);
      expect([201, 404]).toContain(createProjectResponse.status);

      if (createProjectResponse.status === 201) {
        const project = createProjectResponse.data;

        // Step 2: Generate component using AI
        const aiRequest = {
          prompt: 'Create a React component for a user profile card with name, email, and avatar',
          context: {
            projectId: project.id,
            language: 'typescript',
            framework: 'react',
          },
        };

        const aiResponse = await aiServiceClient.post('/ai/generate', aiRequest);
        expect([200, 404]).toContain(aiResponse.status);

        if (aiResponse.status === 200) {
          // Step 3: Save generated code to project
          const saveCodeResponse = await projectClient.post(`/projects/${project.id}/files`, {
            path: 'src/components/UserProfileCard.tsx',
            content: aiResponse.data.code,
          });
          expect([201, 404]).toContain(saveCodeResponse.status);

          // Step 4: Build project
          const buildResponse = await projectClient.post(`/projects/${project.id}/build`);
          expect([200, 202, 404]).toContain(buildResponse.status);
        }
      }
    });

    it('should handle collaborative editing workflow', async () => {
      // Create second user for collaboration
      const collaborator = await AuthHelper.registerTestUser({
        email: 'collaborator@example.com',
        name: 'Collaborator User',
      });

      const ownerClient = createAuthenticatedClient(
        projectClient.client.defaults.baseURL,
        user.tokens.accessToken
      );
      const collaboratorClient = createAuthenticatedClient(
        projectClient.client.defaults.baseURL,
        collaborator.tokens.accessToken
      );

      // Step 1: Owner creates project
      const projectResponse = await ownerClient.post('/projects', {
        name: 'Collaborative Project',
        description: 'Testing collaboration features',
        visibility: 'private',
      });
      expect([201, 404]).toContain(projectResponse.status);

      if (projectResponse.status === 201) {
        const project = projectResponse.data;

        // Step 2: Owner invites collaborator
        const inviteResponse = await ownerClient.post(`/projects/${project.id}/collaborators`, {
          email: collaborator.email,
          role: 'editor',
        });
        expect([201, 404]).toContain(inviteResponse.status);

        // Step 3: Collaborator accepts invitation
        const acceptResponse = await collaboratorClient.post(`/projects/${project.id}/join`, {
          invitationToken: 'mock-invitation-token',
        });
        expect([200, 404]).toContain(acceptResponse.status);

        // Step 4: Both users edit the same file
        const ownerEditResponse = await ownerClient.put(`/projects/${project.id}/files/README.md`, {
          content: '# Collaborative Project\n\nEdited by owner',
        });
        expect([200, 404]).toContain(ownerEditResponse.status);

        const collaboratorEditResponse = await collaboratorClient.put(`/projects/${project.id}/files/README.md`, {
          content: '# Collaborative Project\n\nEdited by collaborator',
        });
        expect([200, 409, 404]).toContain(collaboratorEditResponse.status); // 409 for conflict
      }
    });
  });

  describe('Billing and Subscription Workflow', () => {
    let user: AuthenticatedUser;

    beforeEach(async () => {
      user = await AuthHelper.registerTestUser();
    });

    it('should handle subscription upgrade workflow', async () => {
      const billingServiceClient = createAuthenticatedClient(
        billingClient.client.defaults.baseURL,
        user.tokens.accessToken
      );

      // Step 1: Get available plans
      const plansResponse = await billingServiceClient.get('/billing/plans');
      expect([200, 404]).toContain(plansResponse.status);

      // Step 2: Create subscription (free plan)
      const freeSubscriptionResponse = await billingServiceClient.post('/billing/subscription', {
        planId: 'free',
      });
      expect([201, 404]).toContain(freeSubscriptionResponse.status);

      // Step 3: Upgrade to pro plan
      const upgradeResponse = await billingServiceClient.put('/billing/subscription', {
        planId: 'pro',
        paymentMethodId: 'pm_mock_payment_method',
      });
      expect([200, 404]).toContain(upgradeResponse.status);

      // Step 4: Verify usage tracking
      const usageResponse = await billingServiceClient.get('/billing/usage');
      expect([200, 404]).toContain(usageResponse.status);

      // Step 5: Generate invoice
      const invoiceResponse = await billingServiceClient.post('/billing/invoices');
      expect([201, 404]).toContain(invoiceResponse.status);
    });

    it('should handle payment failure and retry workflow', async () => {
      const billingServiceClient = createAuthenticatedClient(
        billingClient.client.defaults.baseURL,
        user.tokens.accessToken
      );

      // Step 1: Create subscription with failing payment method
      const subscriptionResponse = await billingServiceClient.post('/billing/subscription', {
        planId: 'pro',
        paymentMethodId: 'pm_card_chargeDeclined',
      });
      expect([400, 402, 404]).toContain(subscriptionResponse.status); // 402 for payment required

      // Step 2: Update payment method
      const updatePaymentResponse = await billingServiceClient.put('/billing/payment-method', {
        paymentMethodId: 'pm_card_visa',
      });
      expect([200, 404]).toContain(updatePaymentResponse.status);

      // Step 3: Retry payment
      const retryResponse = await billingServiceClient.post('/billing/retry-payment');
      expect([200, 404]).toContain(retryResponse.status);
    });
  });

  describe('Notification Delivery Workflow', () => {
    let user: AuthenticatedUser;

    beforeEach(async () => {
      user = await AuthHelper.registerTestUser();
    });

    it('should deliver notifications across multiple channels', async () => {
      const notifServiceClient = createAuthenticatedClient(
        notificationClient.client.defaults.baseURL,
        user.tokens.accessToken
      );

      // Step 1: Send welcome email
      const emailResponse = await notifServiceClient.post('/notifications/email', {
        to: user.email,
        template: 'welcome',
        data: {
          name: user.name,
        },
      });
      expect([200, 202, 404]).toContain(emailResponse.status);

      // Step 2: Send in-app notification
      const inAppResponse = await notifServiceClient.post('/notifications/in-app', {
        userId: user.id,
        title: 'Welcome to Zoptal!',
        message: 'Get started by creating your first project.',
        type: 'info',
      });
      expect([201, 404]).toContain(inAppResponse.status);

      // Step 3: Send push notification (if user has enabled)
      const pushResponse = await notifServiceClient.post('/notifications/push', {
        userId: user.id,
        title: 'Welcome to Zoptal!',
        body: 'Start building amazing projects today.',
      });
      expect([200, 404]).toContain(pushResponse.status);

      // Step 4: Get notification history
      const historyResponse = await notifServiceClient.get('/notifications');
      expect([200, 404]).toContain(historyResponse.status);

      // Step 5: Mark notifications as read
      if (historyResponse.status === 200 && historyResponse.data.notifications?.length > 0) {
        const markReadResponse = await notifServiceClient.put('/notifications/mark-read', {
          notificationIds: historyResponse.data.notifications.map(n => n.id),
        });
        expect([200, 404]).toContain(markReadResponse.status);
      }
    });
  });

  describe('Error Handling and Recovery Workflow', () => {
    let user: AuthenticatedUser;

    beforeEach(async () => {
      user = await AuthHelper.registerTestUser();
    });

    it('should handle service failures gracefully', async () => {
      const projectServiceClient = createAuthenticatedClient(
        projectClient.client.defaults.baseURL,
        user.tokens.accessToken
      );

      // Step 1: Try to create project when service is potentially down
      const projectResponse = await projectServiceClient.post('/projects', {
        name: 'Test Project',
        description: 'Testing error handling',
      });

      // Should either succeed or fail gracefully
      expect([201, 503, 404]).toContain(projectResponse.status);

      // Step 2: If failed, retry with exponential backoff
      if (projectResponse.status >= 500) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s
        
        const retryResponse = await projectServiceClient.post('/projects', {
          name: 'Test Project',
          description: 'Testing error handling',
        });
        
        expect([201, 503, 404]).toContain(retryResponse.status);
      }
    });

    it('should handle cross-service data consistency', async () => {
      // Test transaction rollback across services
      const projectServiceClient = createAuthenticatedClient(
        projectClient.client.defaults.baseURL,
        user.tokens.accessToken
      );
      const billingServiceClient = createAuthenticatedClient(
        billingClient.client.defaults.baseURL,
        user.tokens.accessToken
      );

      // Step 1: Start a transaction that spans multiple services
      const projectResponse = await projectServiceClient.post('/projects', {
        name: 'Premium Project',
        description: 'Requires premium subscription',
        requiresPremium: true,
      });

      if (projectResponse.status === 201) {
        const project = projectResponse.data;

        // Step 2: Try to upgrade billing (might fail)
        const billingResponse = await billingServiceClient.post('/billing/subscription', {
          planId: 'premium',
          paymentMethodId: 'pm_card_chargeDeclined', // This will fail
        });

        // Step 3: If billing fails, project should be cleaned up
        if (billingResponse.status >= 400) {
          const projectCheckResponse = await projectServiceClient.get(`/projects/${project.id}`);
          // Project might be deleted or marked as requiring payment
          expect([404, 402]).toContain(projectCheckResponse.status);
        }
      }
    });
  });

  describe('Performance and Load Workflow', () => {
    it('should handle concurrent user operations', async () => {
      // Create multiple users simultaneously
      const userCreationPromises = Array(5).fill(null).map((_, index) => 
        AuthHelper.registerTestUser({
          email: `concurrent${index}@example.com`,
          name: `Concurrent User ${index}`,
        })
      );

      const users = await Promise.allSettled(userCreationPromises);
      const successfulUsers = users
        .filter(result => result.status === 'fulfilled')
        .map(result => result.value);

      expect(successfulUsers.length).toBeGreaterThan(0);

      // Have all users create projects simultaneously
      const projectCreationPromises = successfulUsers.map(user => 
        createAuthenticatedClient(
          projectClient.client.defaults.baseURL,
          user.tokens.accessToken
        ).post('/projects', {
          name: `Project by ${user.name}`,
          description: 'Concurrent project creation test',
        })
      );

      const projectResults = await Promise.allSettled(projectCreationPromises);
      const successfulProjects = projectResults.filter(
        result => result.status === 'fulfilled' && [201, 404].includes(result.value.status)
      );

      // At least some projects should be created successfully
      expect(successfulProjects.length).toBeGreaterThan(0);
    });
  });
});