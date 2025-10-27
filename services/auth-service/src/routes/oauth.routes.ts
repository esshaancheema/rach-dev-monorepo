import { FastifyInstance } from 'fastify';
import { logger } from '../utils/logger';
import { 
  OAuthController,
  createOAuthController 
} from '../controllers/oauth.controller';
import { 
  createOAuthService,
  createEmailService,
  tokenService 
} from '../services';

export async function oauthRoutes(fastify: FastifyInstance) {
  // Initialize services
  const oauthService = createOAuthService({
    prisma: fastify.prisma,
  });
  
  const emailService = createEmailService();

  // Initialize controller
  const oauthController = createOAuthController({
    oauthService,
    tokenService,
    emailService,
  });

  // Get available OAuth providers
  fastify.get(
    '/providers',
    {
      schema: {
        tags: ['OAuth'],
        summary: 'Get available OAuth providers',
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  providers: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    oauthController.getProviders.bind(oauthController)
  );

  // Initiate OAuth flow
  fastify.get<{ 
    Params: { provider: string };
    Querystring: { redirect_uri?: string; link_account?: string };
  }>(
    '/:provider',
    {
      schema: {
        tags: ['OAuth'],
        summary: 'Initiate OAuth flow',
        params: {
          type: 'object',
          properties: {
            provider: { type: 'string', enum: ['google', 'github'] },
          },
          required: ['provider'],
        },
        querystring: {
          type: 'object',
          properties: {
            redirect_uri: { type: 'string' },
            link_account: { type: 'string', enum: ['true', 'false'] },
          },
        },
      },
    },
    async (request, reply) => {
      // For OAuth initiation, we want to redirect to the OAuth provider
      await oauthController.initiateOAuth(request, reply);
      
      // If we get here, it means we have the auth URL, redirect to it
      const response = reply.getHeader('location') || 
                     (reply as any).payload?.data?.authUrl;
      
      if (typeof response === 'string') {
        return reply.redirect(response);
      }
      
      // Fallback - send JSON response
      return;
    }
  );

  // Handle OAuth callback
  fastify.get<{ 
    Params: { provider: string };
    Querystring: { code?: string; state?: string; error?: string; error_description?: string };
  }>(
    '/:provider/callback',
    {
      schema: {
        tags: ['OAuth'],
        summary: 'Handle OAuth callback',
        params: {
          type: 'object',
          properties: {
            provider: { type: 'string', enum: ['google', 'github'] },
          },
          required: ['provider'],
        },
        querystring: {
          type: 'object',
          properties: {
            code: { type: 'string' },
            state: { type: 'string' },
            error: { type: 'string' },
            error_description: { type: 'string' },
          },
        },
      },
    },
    oauthController.handleCallback.bind(oauthController)
  );

  // Get user's OAuth accounts
  fastify.get(
    '/accounts',
    {
      preHandler: [],
      schema: {
        tags: ['OAuth'],
        summary: 'Get linked OAuth accounts',
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  oauthAccounts: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        provider: { type: 'string' },
                        email: { type: 'string' },
                        name: { type: 'string' },
                        avatarUrl: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                        lastUsedAt: { type: 'string', format: 'date-time' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    oauthController.getUserOAuthAccounts.bind(oauthController)
  );

  // Unlink OAuth account
  fastify.delete<{ Params: { provider: string } }>(
    '/:provider',
    {
      preHandler: [],
      schema: {
        tags: ['OAuth'],
        summary: 'Unlink OAuth account',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            provider: { type: 'string', enum: ['google', 'github'] },
          },
          required: ['provider'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    oauthController.unlinkOAuthAccount.bind(oauthController)
  );

  // Link OAuth account to current user (initiate flow)
  fastify.get<{ 
    Params: { provider: string };
  }>(
    '/link/:provider',
    {
      preHandler: [],
      schema: {
        tags: ['OAuth'],
        summary: 'Link OAuth account to current user',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            provider: { type: 'string', enum: ['google', 'github'] },
          },
          required: ['provider'],
        },
      },
    },
    async (request, reply) => {
      // Set link_account flag and initiate OAuth
      const modifiedRequest = {
        ...request,
        query: {
          ...request.query,
          link_account: 'true',
        },
      };

      await oauthController.initiateOAuth(modifiedRequest as any, reply);
      
      // If we get here, it means we have the auth URL, redirect to it
      const response = reply.getHeader('location') || 
                     (reply as any).payload?.data?.authUrl;
      
      if (typeof response === 'string') {
        return reply.redirect(response);
      }
      
      // Fallback - send JSON response
      return;
    }
  );

  logger.info('OAuth routes registered successfully');
}