import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import EnhancedOAuthService from '../../services/enhanced-oauth.service';
import { oauthConfigService } from '../../services/oauth-config.service';
import { logger } from '../../utils/logger';
import { prisma } from '@zoptal/database';
import { CryptoUtils } from '../../utils/crypto';

// Schema definitions
const ClientRegistrationSchema = z.object({
  redirect_uris: z.array(z.string().url()),
  response_types: z.array(z.string()).optional(),
  grant_types: z.array(z.string()).optional(),
  application_type: z.enum(['web', 'native']).optional(),
  client_name: z.string().optional(),
  client_uri: z.string().url().optional(),
  logo_uri: z.string().url().optional(),
  scope: z.string().optional(),
  contacts: z.array(z.string().email()).optional(),
  tos_uri: z.string().url().optional(),
  policy_uri: z.string().url().optional(),
  jwks_uri: z.string().url().optional(),
  jwks: z.object({
    keys: z.array(z.record(z.unknown()))
  }).optional(),
  software_id: z.string().optional(),
  software_version: z.string().optional(),
});

const DeviceAuthorizationSchema = z.object({
  client_id: z.string(),
  scope: z.string().optional(),
});

const DeviceTokenSchema = z.object({
  grant_type: z.literal('urn:ietf:params:oauth:grant-type:device_code'),
  device_code: z.string(),
  client_id: z.string(),
});

const TokenExchangeSchema = z.object({
  grant_type: z.literal('urn:ietf:params:oauth:grant-type:token-exchange'),
  subject_token: z.string(),
  subject_token_type: z.string(),
  requested_token_type: z.string().optional(),
  audience: z.string().optional(),
  scope: z.string().optional(),
});

const PARSchema = z.object({
  client_id: z.string(),
  response_type: z.string(),
  redirect_uri: z.string().url(),
  scope: z.string().optional(),
  state: z.string().optional(),
  nonce: z.string().optional(),
  code_challenge: z.string().optional(),
  code_challenge_method: z.string().optional(),
  request: z.string().optional(),
  request_uri: z.string().optional(),
});

const DeviceUserCodeSchema = z.object({
  user_code: z.string(),
  action: z.enum(['authorize', 'deny']),
});

const IntrospectionSchema = z.object({
  token: z.string(),
  token_type_hint: z.string().optional(),
});

const RevocationSchema = z.object({
  token: z.string(),
  token_type_hint: z.string().optional(),
});

// Get OAuth configuration from service
const getOAuthConfig = () => oauthConfigService.getOIDCConfig();

export async function enhancedOAuthRoutes(fastify: FastifyInstance) {
  // Check if OAuth is enabled via environment
  const isOAuthEnabled = process.env.ENABLE_OAUTH !== 'false';
  if (!isOAuthEnabled) {
    logger.info('Enhanced OAuth is disabled, skipping OAuth service initialization');
    return; // Exit early if OAuth is disabled
  }

  // Initialize Enhanced OAuth Service
  let oauthService: EnhancedOAuthService;
  
  try {
    const oauthConfig = getOAuthConfig();
    oauthService = new EnhancedOAuthService(fastify, oauthConfig);
    logger.info('Enhanced OAuth service initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize Enhanced OAuth service', { error });
    throw new Error('OAuth service initialization failed');
  }

  // Mount the OIDC provider
  fastify.register((app, opts, done) => {
    const provider = oauthService.getProvider();
    
    // Mount all OIDC endpoints
    app.all('/.well-known/openid_configuration', (req, reply) => {
      return provider.app(req.raw, reply.raw);
    });

    app.all('/jwks', (req, reply) => {
      return provider.app(req.raw, reply.raw);
    });

    app.all('/auth', (req, reply) => {
      return provider.app(req.raw, reply.raw);
    });

    app.all('/token', (req, reply) => {
      return provider.app(req.raw, reply.raw);
    });

    app.all('/userinfo', (req, reply) => {
      return provider.app(req.raw, reply.raw);
    });

    app.all('/me', (req, reply) => {
      return provider.app(req.raw, reply.raw);
    });

    app.all('/session/end', (req, reply) => {
      return provider.app(req.raw, reply.raw);
    });

    app.all('/introspect', (req, reply) => {
      return provider.app(req.raw, reply.raw);
    });

    app.all('/revoke', (req, reply) => {
      return provider.app(req.raw, reply.raw);
    });

    done();
  });

  // Enhanced OAuth 2.0 endpoints

  // Dynamic Client Registration (RFC 7591)
  fastify.post('/register', {
    schema: {
      description: 'Dynamic Client Registration',
      tags: ['OAuth'],
      body: {
        type: 'object',
        additionalProperties: true,
      },
      response: {
        201: {
          type: 'object',
          properties: {
            client_id: { type: 'string' },
            client_secret: { type: 'string' },
            client_id_issued_at: { type: 'number' },
            client_secret_expires_at: { type: 'number' },
            registration_access_token: { type: 'string' },
            registration_client_uri: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest<{ Body: any }>, reply: FastifyReply) => {
    try {
      const clientMetadata = ClientRegistrationSchema.parse(request.body);
      
      const registration = await oauthService.registerClient(clientMetadata);
      
      // Generate registration access token
      const registrationAccessToken = CryptoUtils.generateSecureToken(32);
      const registrationClientUri = `${getOAuthConfig().issuer}/register/${registration.client_id}`;

      // Store registration token
      await prisma.oAuthClient.update({
        where: { clientId: registration.client_id },
        data: {
          metadata: JSON.stringify({
            ...clientMetadata,
            registration_access_token: registrationAccessToken,
          }),
        },
      });

      reply.code(201).send({
        ...registration,
        registration_access_token: registrationAccessToken,
        registration_client_uri: registrationClientUri,
      });
    } catch (error) {
      logger.error('Client registration failed', { error });
      reply.code(400).send({ error: 'invalid_client_metadata' });
    }
  });

  // Device Authorization Grant (RFC 8628)
  fastify.post('/device_authorization', {
    schema: {
      description: 'Device Authorization Request',
      tags: ['OAuth'],
      body: {
        type: 'object',
        properties: {
          client_id: { type: 'string' },
          scope: { type: 'string' },
        },
        required: ['client_id'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            device_code: { type: 'string' },
            user_code: { type: 'string' },
            verification_uri: { type: 'string' },
            verification_uri_complete: { type: 'string' },
            expires_in: { type: 'number' },
            interval: { type: 'number' },
          },
        },
      },
    },
  }, async (request: FastifyRequest<{ Body: any }>, reply: FastifyReply) => {
    try {
      const params = DeviceAuthorizationSchema.parse(request.body);
      const result = await oauthService.handleDeviceFlow(params);
      
      reply.send(result);
    } catch (error) {
      logger.error('Device authorization failed', { error });
      reply.code(400).send({ error: 'invalid_request' });
    }
  });

  // Device Code Info Endpoint
  fastify.get('/device/info/:user_code', {
    schema: {
      description: 'Get device code information',
      tags: ['OAuth'],
      params: {
        type: 'object',
        properties: {
          user_code: { type: 'string' },
        },
        required: ['user_code'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            deviceType: { type: 'string' },
            deviceName: { type: 'string' },
            clientName: { type: 'string' },
            scopes: { type: 'array', items: { type: 'string' } },
            expiresAt: { type: 'string' },
            status: { type: 'string' },
          },
        },
        404: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest<{ Params: { user_code: string } }>, reply: FastifyReply) => {
    try {
      const { user_code } = request.params;

      // Find the device code
      const deviceCode = await prisma.oAuthDeviceCode.findUnique({
        where: { userCode: user_code },
        include: {
          client: true,
        },
      });

      if (!deviceCode) {
        return reply.code(404).send({ error: 'Device code not found' });
      }

      if (deviceCode.expiresAt < new Date()) {
        return reply.code(404).send({ error: 'Device code expired' });
      }

      // Return device information
      return reply.send({
        deviceType: deviceCode.deviceType || 'desktop',
        deviceName: deviceCode.deviceName || 'Unknown Device',
        clientName: deviceCode.client?.name || deviceCode.clientId,
        scopes: deviceCode.scopes ? JSON.parse(deviceCode.scopes) : ['openid', 'profile'],
        expiresAt: deviceCode.expiresAt.toISOString(),
        status: deviceCode.status || 'PENDING',
      });

    } catch (error) {
      logger.error('Device info lookup failed', { error });
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Device Code Verification Endpoint
  fastify.post('/device/verify', {
    schema: {
      description: 'Device Code User Authorization',
      tags: ['OAuth'],
      body: {
        type: 'object',
        properties: {
          user_code: { type: 'string' },
          action: { type: 'string', enum: ['authorize', 'deny'] },
        },
        required: ['user_code', 'action'],
      },
    },
  }, async (request: FastifyRequest<{ Body: any }>, reply: FastifyReply) => {
    try {
      const { user_code, action } = DeviceUserCodeSchema.parse(request.body);
      
      // Find the device code
      const deviceCode = await prisma.oAuthDeviceCode.findUnique({
        where: { userCode: user_code },
      });

      if (!deviceCode || deviceCode.expiresAt < new Date()) {
        return reply.code(400).send({ error: 'invalid_grant' });
      }

      if (deviceCode.status !== 'PENDING') {
        return reply.code(400).send({ error: 'authorization_pending' });
      }

      // Update device code status
      await prisma.oAuthDeviceCode.update({
        where: { id: deviceCode.id },
        data: {
          status: action === 'authorize' ? 'AUTHORIZED' : 'DENIED',
          userId: action === 'authorize' ? 'user-id-from-session' : null, // TODO: Get from session
          authorizedAt: action === 'authorize' ? new Date() : null,
        },
      });

      logger.info('Device code verification completed', {
        userCode: user_code,
        action,
        clientId: deviceCode.clientId,
      });

      reply.send({ success: true });
    } catch (error) {
      logger.error('Device verification failed', { error });
      reply.code(400).send({ error: 'invalid_request' });
    }
  });

  // Token Exchange (RFC 8693)
  fastify.post('/token/exchange', {
    schema: {
      description: 'OAuth Token Exchange',
      tags: ['OAuth'],
      body: {
        type: 'object',
        properties: {
          grant_type: { type: 'string' },
          subject_token: { type: 'string' },
          subject_token_type: { type: 'string' },
          requested_token_type: { type: 'string' },
          audience: { type: 'string' },
          scope: { type: 'string' },
        },
        required: ['grant_type', 'subject_token', 'subject_token_type'],
      },
    },
  }, async (request: FastifyRequest<{ Body: any }>, reply: FastifyReply) => {
    try {
      const params = TokenExchangeSchema.parse(request.body);
      const result = await oauthService.handleTokenExchange(params);
      
      reply.send(result);
    } catch (error) {
      logger.error('Token exchange failed', { error });
      reply.code(400).send({ error: 'invalid_grant' });
    }
  });

  // Pushed Authorization Requests (RFC 9126)
  fastify.post('/par', {
    schema: {
      description: 'Pushed Authorization Request',
      tags: ['OAuth'],
      body: {
        type: 'object',
        additionalProperties: true,
      },
      response: {
        201: {
          type: 'object',
          properties: {
            request_uri: { type: 'string' },
            expires_in: { type: 'number' },
          },
        },
      },
    },
  }, async (request: FastifyRequest<{ Body: any }>, reply: FastifyReply) => {
    try {
      const params = PARSchema.parse(request.body);
      const result = await oauthService.handlePushedAuthorizationRequest(params);
      
      reply.code(201).send(result);
    } catch (error) {
      logger.error('PAR request failed', { error });
      reply.code(400).send({ error: 'invalid_request' });
    }
  });

  // Enhanced Token Introspection with audit
  fastify.post('/introspect/audit', {
    schema: {
      description: 'Token Introspection with Audit',
      tags: ['OAuth'],
      body: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          token_type_hint: { type: 'string' },
        },
        required: ['token'],
      },
    },
  }, async (request: FastifyRequest<{ Body: any }>, reply: FastifyReply) => {
    try {
      const { token, token_type_hint } = IntrospectionSchema.parse(request.body);
      
      // Perform introspection (simplified)
      const introspectionResult = {
        active: true,
        client_id: 'example-client',
        scope: 'read write',
        token_type: 'Bearer',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
        nbf: Math.floor(Date.now() / 1000),
        sub: 'user-123',
        aud: getOAuthConfig().issuer,
        iss: getOAuthConfig().issuer,
      };

      // Audit the introspection
      await prisma.oAuthTokenIntrospection.create({
        data: {
          tokenId: token.substring(0, 16),
          clientId: introspectionResult.client_id,
          active: introspectionResult.active,
          tokenType: introspectionResult.token_type,
          scope: introspectionResult.scope,
        },
      });

      reply.send(introspectionResult);
    } catch (error) {
      logger.error('Token introspection failed', { error });
      reply.code(400).send({ error: 'invalid_request' });
    }
  });

  // Backchannel Logout Initiation
  fastify.post('/backchannel_logout', {
    schema: {
      description: 'Initiate Backchannel Logout',
      tags: ['OAuth'],
      body: {
        type: 'object',
        properties: {
          session_id: { type: 'string' },
          client_ids: { type: 'array', items: { type: 'string' } },
        },
        required: ['session_id'],
      },
    },
  }, async (request: FastifyRequest<{ Body: any }>, reply: FastifyReply) => {
    try {
      const { session_id, client_ids } = request.body;

      // Find active session
      const session = await prisma.oAuthSession.findUnique({
        where: { sessionId: session_id },
      });

      if (!session || !session.isActive) {
        return reply.code(404).send({ error: 'session_not_found' });
      }

      const targetClients = client_ids || JSON.parse(session.clientIds);

      // Create backchannel logout requests for each client
      for (const clientId of targetClients) {
        const logoutToken = CryptoUtils.generateSecureToken(32);
        
        await prisma.oAuthBackchannelLogout.create({
          data: {
            sessionId: session_id,
            clientId,
            logoutToken,
            endpoint: `https://${clientId}.example.com/logout`, // Should be from client metadata
            status: 'PENDING',
            nextRetryAt: new Date(),
          },
        });
      }

      // Mark session as ended
      await prisma.oAuthSession.update({
        where: { sessionId: session_id },
        data: {
          isActive: false,
          endedAt: new Date(),
          endedBy: 'backchannel',
        },
      });

      logger.info('Backchannel logout initiated', {
        sessionId: session_id,
        clientCount: targetClients.length,
      });

      reply.send({ success: true });
    } catch (error) {
      logger.error('Backchannel logout failed', { error });
      reply.code(500).send({ error: 'server_error' });
    }
  });

  // OAuth Client Management
  fastify.get('/clients', {
    schema: {
      description: 'List OAuth Clients',
      tags: ['OAuth'],
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          offset: { type: 'integer', minimum: 0, default: 0 },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            clients: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  client_id: { type: 'string' },
                  client_name: { type: 'string' },
                  application_type: { type: 'string' },
                  created_at: { type: 'string' },
                  is_active: { type: 'boolean' },
                },
              },
            },
            total: { type: 'integer' },
            limit: { type: 'integer' },
            offset: { type: 'integer' },
          },
        },
      },
    },
  }, async (request: FastifyRequest<{ Querystring: any }>, reply: FastifyReply) => {
    try {
      const { limit = 20, offset = 0 } = request.query;

      const [clients, total] = await Promise.all([
        prisma.oAuthClient.findMany({
          take: limit,
          skip: offset,
          select: {
            clientId: true,
            metadata: true,
            isActive: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.oAuthClient.count(),
      ]);

      const formattedClients = clients.map(client => {
        const metadata = JSON.parse(client.metadata);
        return {
          client_id: client.clientId,
          client_name: metadata.client_name || 'Unknown',
          application_type: metadata.application_type || 'web',
          created_at: client.createdAt.toISOString(),
          is_active: client.isActive,
        };
      });

      reply.send({
        clients: formattedClients,
        total,
        limit,
        offset,
      });
    } catch (error) {
      logger.error('Failed to list OAuth clients', { error });
      reply.code(500).send({ error: 'server_error' });
    }
  });

  // OAuth Analytics Dashboard
  fastify.get('/analytics', {
    schema: {
      description: 'OAuth Analytics Data',
      tags: ['OAuth'],
      querystring: {
        type: 'object',
        properties: {
          period: { type: 'string', enum: ['hour', 'day', 'week', 'month'], default: 'day' },
          client_id: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            grants: {
              type: 'object',
              properties: {
                total: { type: 'integer' },
                active: { type: 'integer' },
                revoked: { type: 'integer' },
                expired: { type: 'integer' },
              },
            },
            tokens: {
              type: 'object',
              properties: {
                issued: { type: 'integer' },
                introspections: { type: 'integer' },
                revocations: { type: 'integer' },
              },
            },
            clients: {
              type: 'object',
              properties: {
                total: { type: 'integer' },
                active: { type: 'integer' },
              },
            },
            sessions: {
              type: 'object',
              properties: {
                active: { type: 'integer' },
                ended: { type: 'integer' },
              },
            },
          },
        },
      },
    },
  }, async (request: FastifyRequest<{ Querystring: any }>, reply: FastifyReply) => {
    try {
      const { period = 'day', client_id } = request.query;

      // Calculate date range
      const now = new Date();
      const startDate = new Date();
      switch (period) {
        case 'hour':
          startDate.setHours(now.getHours() - 1);
          break;
        case 'day':
          startDate.setDate(now.getDate() - 1);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
      }

      const whereClause = {
        createdAt: { gte: startDate },
        ...(client_id && { clientId: client_id }),
      };

      // Gather analytics data
      const [
        totalGrants,
        activeGrants,
        revokedGrants,
        expiredGrants,
        totalIntrospections,
        totalClients,
        activeClients,
        activeSessions,
        endedSessions,
      ] = await Promise.all([
        prisma.oAuthGrant.count({ where: whereClause }),
        prisma.oAuthGrant.count({ where: { ...whereClause, status: 'ACTIVE' } }),
        prisma.oAuthGrant.count({ where: { ...whereClause, status: 'REVOKED' } }),
        prisma.oAuthGrant.count({ where: { ...whereClause, status: 'EXPIRED' } }),
        prisma.oAuthTokenIntrospection.count({ where: { introspectedAt: { gte: startDate } } }),
        prisma.oAuthClient.count({ where: { createdAt: { gte: startDate } } }),
        prisma.oAuthClient.count({ where: { createdAt: { gte: startDate }, isActive: true } }),
        prisma.oAuthSession.count({ where: { startedAt: { gte: startDate }, isActive: true } }),
        prisma.oAuthSession.count({ where: { startedAt: { gte: startDate }, isActive: false } }),
      ]);

      reply.send({
        grants: {
          total: totalGrants,
          active: activeGrants,
          revoked: revokedGrants,
          expired: expiredGrants,
        },
        tokens: {
          issued: totalGrants, // Simplified
          introspections: totalIntrospections,
          revocations: revokedGrants,
        },
        clients: {
          total: totalClients,
          active: activeClients,
        },
        sessions: {
          active: activeSessions,
          ended: endedSessions,
        },
      });
    } catch (error) {
      logger.error('Failed to get OAuth analytics', { error });
      reply.code(500).send({ error: 'server_error' });
    }
  });

  // Configuration endpoint
  fastify.get('/config', {
    schema: {
      description: 'OAuth Provider Configuration',
      tags: ['OAuth'],
      response: {
        200: {
          type: 'object',
          properties: {
            issuer: { type: 'string' },
            features: {
              type: 'object',
              additionalProperties: { type: 'boolean' },
            },
            scopes_supported: { type: 'array', items: { type: 'string' } },
            grant_types_supported: { type: 'array', items: { type: 'string' } },
            response_types_supported: { type: 'array', items: { type: 'string' } },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const config = getOAuthConfig();
    reply.send({
      issuer: config.issuer,
      features: config.features,
      scopes_supported: config.scopes,
      grant_types_supported: Array.from(config.grantTypes),
      response_types_supported: config.responseTypes,
    });
  });
}