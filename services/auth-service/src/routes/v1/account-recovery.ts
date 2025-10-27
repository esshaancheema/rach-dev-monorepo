import { FastifyInstance } from 'fastify';
import { authenticateToken } from '../../middleware/auth';
import { PrismaClient, UserRole } from '@zoptal/database';
import { createAccountRecoveryService } from '../../services/account-recovery.service';
import { logger } from '../../utils/logger';

interface InitiateRecoveryRequest {
  identifier: string; // email or username
  recoveryType: 'email' | 'username';
  clientIP?: string;
  userAgent?: string;
}

interface SubmitChallengeRequest {
  sessionId: string;
  challengeId: string;
  response: Record<string, any>;
}

interface AdminOverrideRequest {
  targetUserId: string;
  reason: string;
}

export async function accountRecoveryRoutes(fastify: FastifyInstance) {
  // Initialize recovery service
  const recoveryService = createAccountRecoveryService({
    prisma: fastify.prisma
  });

  // Initiate account recovery
  fastify.post<{ Body: InitiateRecoveryRequest }>('/account-recovery/initiate', {
    schema: {
      tags: ['Account Recovery'],
      summary: 'Initiate account recovery process',
      body: {
        type: 'object',
        required: ['identifier', 'recoveryType'],
        properties: {
          identifier: { type: 'string', minLength: 1 },
          recoveryType: { type: 'string', enum: ['email', 'username'] },
          clientIP: { type: 'string' },
          userAgent: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { identifier, recoveryType, clientIP, userAgent } = request.body;

      // Rate limiting check
      const clientIdentifier = clientIP || request.ip;
      const rateLimitKey = `recovery_initiate:${clientIdentifier}`;
      
      const existing = await fastify.prisma.rateLimit.findUnique({
        where: { key_type: { key: rateLimitKey, type: 'recovery_initiate' } }
      });

      if (existing && existing.expiresAt > new Date() && existing.count >= 3) {
        return reply.status(429).send({
          success: false,
          message: 'Too many recovery attempts. Please try again later.',
          retryAfter: Math.ceil((existing.expiresAt.getTime() - Date.now()) / 1000)
        });
      }

      // Update rate limit
      await fastify.prisma.rateLimit.upsert({
        where: { key_type: { key: rateLimitKey, type: 'recovery_initiate' } },
        update: {
          count: { increment: 1 },
          updatedAt: new Date()
        },
        create: {
          key: rateLimitKey,
          type: 'recovery_initiate',
          count: 1,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
        }
      });

      const session = await recoveryService.initiateRecovery(identifier, recoveryType);

      // Log security event
      await fastify.prisma.securityEvent.create({
        data: {
          userId: session.userId !== 'dummy' ? session.userId : null,
          type: 'ACCOUNT_RECOVERY_INITIATED',
          description: `Account recovery initiated for ${recoveryType}: ${identifier}`,
          severity: 'MEDIUM',
          ipAddress: clientIP || request.ip,
          userAgent: userAgent || request.headers['user-agent'],
          metadata: {
            identifier,
            recoveryType,
            sessionId: session.id
          }
        }
      });

      // Return available recovery methods (without sensitive details)
      const sanitizedChallenges = session.challenges.map(challenge => ({
        id: challenge.id,
        type: challenge.type,
        target: challenge.target,
        questions: challenge.questions
      }));

      reply.send({
        success: true,
        data: {
          sessionId: session.id,
          challenges: sanitizedChallenges,
          expiresAt: session.expiresAt
        }
      });

    } catch (error) {
      logger.error('Account recovery initiation error:', error);
      reply.status(500).send({
        success: false,
        message: 'Failed to initiate account recovery'
      });
    }
  });

  // Submit challenge response
  fastify.post<{ Body: SubmitChallengeRequest }>('/account-recovery/challenge', {
    schema: {
      tags: ['Account Recovery'],
      summary: 'Submit response to recovery challenge',
      body: {
        type: 'object',
        required: ['sessionId', 'challengeId', 'response'],
        properties: {
          sessionId: { type: 'string' },
          challengeId: { type: 'string' },
          response: { type: 'object' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { sessionId, challengeId, response } = request.body;

      const result = await recoveryService.submitChallenge(sessionId, challengeId, response);

      if (!result.success) {
        return reply.status(400).send({
          success: false,
          message: 'Invalid challenge response'
        });
      }

      if (result.completed) {
        // Generate temporary access token
        const accessToken = await recoveryService.generateTemporaryAccessToken(sessionId);

        if (!accessToken) {
          return reply.status(500).send({
            success: false,
            message: 'Failed to generate access token'
          });
        }

        return reply.send({
          success: true,
          completed: true,
          data: {
            tempAccessToken: accessToken,
            message: 'Account recovery completed successfully'
          }
        });
      }

      reply.send({
        success: true,
        completed: false,
        data: {
          nextChallenge: result.nextChallenge ? {
            id: result.nextChallenge.id,
            type: result.nextChallenge.type,
            target: result.nextChallenge.target,
            questions: result.nextChallenge.questions
          } : null
        }
      });

    } catch (error) {
      logger.error('Challenge submission error:', error);
      reply.status(500).send({
        success: false,
        message: 'Failed to process challenge'
      });
    }
  });

  // Verify temporary access token and complete recovery
  fastify.post<{ Body: { tempAccessToken: string; newPassword?: string } }>('/account-recovery/complete', {
    schema: {
      tags: ['Account Recovery'],
      summary: 'Complete account recovery with temporary token',
      body: {
        type: 'object',
        required: ['tempAccessToken'],
        properties: {
          tempAccessToken: { type: 'string' },
          newPassword: { type: 'string', minLength: 8 }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { tempAccessToken, newPassword } = request.body;

      // Verify temporary token
      const verificationToken = await fastify.prisma.verificationToken.findUnique({
        where: { token: tempAccessToken },
        include: { user: true }
      });

      if (!verificationToken || 
          verificationToken.type !== 'ACCOUNT_RECOVERY' ||
          verificationToken.expiresAt < new Date() ||
          verificationToken.usedAt) {
        return reply.status(400).send({
          success: false,
          message: 'Invalid or expired recovery token'
        });
      }

      const user = verificationToken.user!;

      // Mark token as used
      await fastify.prisma.verificationToken.update({
        where: { id: verificationToken.id },
        data: { usedAt: new Date() }
      });

      // Generate new session tokens
      const tokenService = (fastify as any).tokenService;
      const tokens = tokenService.generateTokens(user);

      // Update user's last login
      await fastify.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      });

      // Create refresh token record
      await fastify.prisma.refreshToken.create({
        data: {
          token: tokens.refreshToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          userAgent: request.headers['user-agent'],
          ipAddress: request.ip
        }
      });

      // Log successful recovery
      await fastify.prisma.securityEvent.create({
        data: {
          userId: user.id,
          type: 'ACCOUNT_RECOVERY_SUCCESS',
          description: 'Account recovery completed successfully',
          severity: 'MEDIUM',
          ipAddress: request.ip,
          userAgent: request.headers['user-agent']
        }
      });

      reply.send({
        success: true,
        data: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
          }
        }
      });

    } catch (error) {
      logger.error('Recovery completion error:', error);
      reply.status(500).send({
        success: false,
        message: 'Failed to complete account recovery'
      });
    }
  });

  // Admin override endpoint
  fastify.post<{ Body: AdminOverrideRequest }>('/account-recovery/admin-override', {
    preHandler: authenticateToken,
    schema: {
      tags: ['Account Recovery'],
      summary: 'Admin override for account recovery',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['targetUserId', 'reason'],
        properties: {
          targetUserId: { type: 'string' },
          reason: { type: 'string', minLength: 10 }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const user = request.user;
      
      if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
        return reply.status(403).send({
          success: false,
          message: 'Admin privileges required'
        });
      }

      const { targetUserId, reason } = request.body;

      const overrideToken = await recoveryService.adminOverride(user.id, targetUserId, reason);

      if (!overrideToken) {
        return reply.status(500).send({
          success: false,
          message: 'Failed to create admin override'
        });
      }

      reply.send({
        success: true,
        data: {
          overrideToken,
          expiresIn: 3600, // 1 hour
          message: 'Admin override token generated successfully'
        }
      });

    } catch (error) {
      logger.error('Admin override error:', error);
      reply.status(500).send({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to process admin override'
      });
    }
  });

  // Get recovery session status
  fastify.get<{ Querystring: { sessionId: string } }>('/account-recovery/status', {
    schema: {
      tags: ['Account Recovery'],
      summary: 'Get recovery session status',
      querystring: {
        type: 'object',
        required: ['sessionId'],
        properties: {
          sessionId: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { sessionId } = request.query;

      const session = await recoveryService.getRecoverySession(sessionId);

      if (!session) {
        return reply.status(404).send({
          success: false,
          message: 'Recovery session not found or expired'
        });
      }

      // Return sanitized session info
      reply.send({
        success: true,
        data: {
          sessionId: session.id,
          status: session.status,
          challenges: session.challenges.map(c => ({
            id: c.id,
            type: c.type,
            target: c.target,
            completed: session.completedChallenges.includes(c.id)
          })),
          expiresAt: session.expiresAt
        }
      });

    } catch (error) {
      logger.error('Recovery status error:', error);
      reply.status(500).send({
        success: false,
        message: 'Failed to get recovery status'
      });
    }
  });

  // List admin overrides (for audit)
  fastify.get('/account-recovery/admin-overrides', {
    preHandler: authenticateToken,
    schema: {
      tags: ['Account Recovery'],
      summary: 'List admin recovery overrides for audit',
      security: [{ bearerAuth: [] }]
    }
  }, async (request, reply) => {
    try {
      const user = request.user;
      
      if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
        return reply.status(403).send({
          success: false,
          message: 'Admin privileges required'
        });
      }

      const overrides = await fastify.prisma.adminRecoveryOverride.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50
      });

      reply.send({
        success: true,
        data: overrides.map(override => ({
          id: override.id,
          targetUserId: override.targetUserId,
          adminUserId: override.adminUserId,
          reason: override.reason,
          status: override.status,
          createdAt: override.createdAt,
          usedAt: override.usedAt,
          expiresAt: override.expiresAt
        }))
      });

    } catch (error) {
      logger.error('Admin overrides list error:', error);
      reply.status(500).send({
        success: false,
        message: 'Failed to fetch admin overrides'
      });
    }
  });
}