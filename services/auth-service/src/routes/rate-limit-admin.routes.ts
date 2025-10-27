import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { createRouteSchema, securitySchemes, standardResponses } from '../utils/swagger-schemas';
import { logger } from '../utils/logger';
import { createAdvancedRateLimiter } from '../services/advanced-rate-limiter.service';
import { RedisClient } from '../utils/redis';
import { z } from 'zod';

// Request schemas
const rateLimitStatusSchema = z.object({
  key: z.string().min(1),
  strategy: z.enum(['fixed-window', 'sliding-window', 'token-bucket', 'adaptive'])
});

const clearRateLimitSchema = z.object({
  key: z.string().min(1),
  confirmClear: z.boolean()
});

const updateUserTierSchema = z.object({
  userId: z.string().min(1),
  tier: z.enum(['free', 'premium', 'enterprise', 'admin']),
  customLimits: z.object({
    requests: z.number().min(1).max(100000),
    windowMs: z.number().min(1000).max(86400000), // 1 second to 24 hours
    burst: z.number().min(1).max(1000).optional()
  }).optional()
});

const blockIpSchema = z.object({
  ip: z.string().ip(),
  duration: z.number().min(60).max(86400), // 1 minute to 24 hours
  reason: z.string().min(1).max(200)
});

type RateLimitStatusRequest = z.infer<typeof rateLimitStatusSchema>;
type ClearRateLimitRequest = z.infer<typeof clearRateLimitSchema>;
type UpdateUserTierRequest = z.infer<typeof updateUserTierSchema>;
type BlockIpRequest = z.infer<typeof blockIpSchema>;

/**
 * Rate limit administration routes
 */
export async function rateLimitAdminRoutes(fastify: FastifyInstance) {
  const rateLimiter = createAdvancedRateLimiter({ 
    prisma: fastify.prisma, 
    redis: RedisClient 
  });

  /**
   * Get rate limit status for a specific key
   */
  fastify.post('/rate-limits/status', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'Get rate limit status',
      description: `
Get the current rate limit status for a specific key.

**Admin Permission Required**

**Use Cases:**
- Monitor rate limit usage
- Debug rate limiting issues
- Check user quota status
- Analyze rate limit effectiveness

**Key Formats:**
- IP-based: \`ip:192.168.1.1:/api/auth/login\`
- User-based: \`user:user123:/api/users/profile\`
- Custom: Any custom key format
      `,
      tags: ['Rate Limit Admin'],
      body: {
        type: 'object',
        properties: {
          key: {
            type: 'string',
            minLength: 1,
            description: 'Rate limit key to check',
            example: 'ip:192.168.1.1:/api/auth/login'
          },
          strategy: {
            type: 'string',
            enum: ['fixed-window', 'sliding-window', 'token-bucket', 'adaptive'],
            description: 'Rate limiting strategy'
          }
        },
        required: ['key', 'strategy']
      },
      response: {
        200: {
          description: 'Rate limit status retrieved successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                key: { type: 'string', example: 'ip:192.168.1.1:/api/auth/login' },
                status: {
                  type: 'object',
                  properties: {
                    totalHits: { type: 'number', example: 5 },
                    totalTime: { type: 'number', example: 900000 },
                    timeToExpire: { type: 'number', example: 300000 },
                    limit: { type: 'number', example: 10 },
                    remaining: { type: 'number', example: 5 },
                    strategy: { type: 'string', example: 'sliding-window' }
                  }
                },
                nextReset: { type: 'string', format: 'date-time' },
                isBlocked: { type: 'boolean', example: false }
              }
            }
          }
        },
        401: standardResponses[401],
        403: standardResponses[403],
        500: standardResponses[500]
      },
      security: securitySchemes.bearer
    })
  }, async (request: FastifyRequest<{ Body: RateLimitStatusRequest }>, reply: FastifyReply) => {
    try {
      // Check admin permissions
      const user = (request as any).user;
      if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
        return reply.status(403).send({
          success: false,
          error: 'Insufficient permissions',
          message: 'Admin access required for rate limit management'
        });
      }

      const { key, strategy } = request.body;

      const status = await rateLimiter.getRateLimitStatus(key, strategy);
      const nextReset = new Date(Date.now() + status.timeToExpire);

      reply.send({
        success: true,
        data: {
          key,
          status,
          nextReset: nextReset.toISOString(),
          isBlocked: status.remaining <= 0
        }
      });

    } catch (error) {
      logger.error({ error, key: request.body.key }, 'Failed to get rate limit status');
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to retrieve rate limit status'
      });
    }
  });

  /**
   * Clear rate limit for a specific key
   */
  fastify.post('/rate-limits/clear', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'Clear rate limit for key',
      description: `
Clear rate limiting data for a specific key, effectively resetting the limit.

**Admin Permission Required**

**Warning:** This action immediately resets the rate limit for the specified key.

**Use Cases:**
- Unblock legitimate users
- Clear false positives
- Reset limits for testing
- Emergency access restoration
      `,
      tags: ['Rate Limit Admin'],
      body: {
        type: 'object',
        properties: {
          key: {
            type: 'string',
            minLength: 1,
            description: 'Rate limit key to clear',
            example: 'ip:192.168.1.1:/api/auth/login'
          },
          confirmClear: {
            type: 'boolean',
            description: 'Must be true to confirm clearing'
          }
        },
        required: ['key', 'confirmClear']
      },
      response: {
        200: {
          description: 'Rate limit cleared successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Rate limit cleared successfully' },
            data: {
              type: 'object',
              properties: {
                key: { type: 'string', example: 'ip:192.168.1.1:/api/auth/login' },
                clearedAt: { type: 'string', format: 'date-time' }
              }
            }
          }
        },
        400: {
          description: 'Clear not confirmed',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Clear not confirmed' },
            message: { type: 'string', example: 'You must confirm the clear action' }
          }
        },
        401: standardResponses[401],
        403: standardResponses[403],
        500: standardResponses[500]
      },
      security: securitySchemes.bearer
    })
  }, async (request: FastifyRequest<{ Body: ClearRateLimitRequest }>, reply: FastifyReply) => {
    try {
      // Check admin permissions
      const user = (request as any).user;
      if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
        return reply.status(403).send({
          success: false,
          error: 'Insufficient permissions',
          message: 'Admin access required for rate limit management'
        });
      }

      const { key, confirmClear } = request.body;

      if (!confirmClear) {
        return reply.status(400).send({
          success: false,
          error: 'Clear not confirmed',
          message: 'You must confirm the clear action'
        });
      }

      await rateLimiter.clearRateLimit(key);

      // Log the action
      await fastify.prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'RATE_LIMIT_CLEARED',
          category: 'ADMIN',
          ip: request.ip,
          userAgent: request.headers['user-agent'] || 'Unknown',
          metadata: { key }
        }
      });

      reply.send({
        success: true,
        message: 'Rate limit cleared successfully',
        data: {
          key,
          clearedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error({ error, key: request.body.key }, 'Failed to clear rate limit');
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to clear rate limit'
      });
    }
  });

  /**
   * Get user tier information
   */
  fastify.get('/rate-limits/user-tiers', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'Get user tier information',
      description: `
Get information about available user tiers and their rate limit configurations.

**Admin Permission Required**

**Tier Information:**
- Free: Basic limits for free users
- Premium: Enhanced limits for premium subscribers
- Enterprise: High limits for enterprise customers
- Admin: Administrative access with highest limits
      `,
      tags: ['Rate Limit Admin'],
      response: {
        200: {
          description: 'User tiers retrieved successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                tiers: {
                  type: 'object',
                  additionalProperties: {
                    type: 'object',
                    properties: {
                      name: { type: 'string', example: 'Premium' },
                      limits: {
                        type: 'object',
                        properties: {
                          requests: { type: 'number', example: 1000 },
                          windowMs: { type: 'number', example: 60000 },
                          burst: { type: 'number', example: 50 }
                        }
                      },
                      features: {
                        type: 'array',
                        items: { type: 'string' },
                        example: ['basic', 'advanced']
                      }
                    }
                  }
                }
              }
            }
          }
        },
        401: standardResponses[401],
        403: standardResponses[403],
        500: standardResponses[500]
      },
      security: securitySchemes.bearer
    })
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Check admin permissions
      const user = (request as any).user;
      if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
        return reply.status(403).send({
          success: false,
          error: 'Insufficient permissions',
          message: 'Admin access required for rate limit management'
        });
      }

      const tiers = rateLimiter.userTiers;

      reply.send({
        success: true,
        data: { tiers }
      });

    } catch (error) {
      logger.error({ error }, 'Failed to get user tiers');
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to retrieve user tiers'
      });
    }
  });

  /**
   * Update user tier
   */
  fastify.put('/rate-limits/user-tier', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'Update user tier',
      description: `
Update a user's rate limiting tier or apply custom limits.

**Admin Permission Required**

**Custom Limits:**
When provided, custom limits override the default tier limits for the specific user.
      `,
      tags: ['Rate Limit Admin'],
      body: {
        type: 'object',
        properties: {
          userId: {
            type: 'string',
            minLength: 1,
            description: 'User ID to update'
          },
          tier: {
            type: 'string',
            enum: ['free', 'premium', 'enterprise', 'admin'],
            description: 'New tier for the user'
          },
          customLimits: {
            type: 'object',
            properties: {
              requests: {
                type: 'number',
                minimum: 1,
                maximum: 100000,
                description: 'Requests per window'
              },
              windowMs: {
                type: 'number',
                minimum: 1000,
                maximum: 86400000,
                description: 'Window duration in milliseconds'
              },
              burst: {
                type: 'number',
                minimum: 1,
                maximum: 1000,
                description: 'Burst limit'
              }
            },
            description: 'Custom rate limits (optional)'
          }
        },
        required: ['userId', 'tier']
      },
      response: {
        200: {
          description: 'User tier updated successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'User tier updated successfully' },
            data: {
              type: 'object',
              properties: {
                userId: { type: 'string', example: 'user_123' },
                oldTier: { type: 'string', example: 'free' },
                newTier: { type: 'string', example: 'premium' },
                customLimits: {
                  type: 'object',
                  nullable: true
                },
                updatedAt: { type: 'string', format: 'date-time' }
              }
            }
          }
        },
        400: standardResponses[400],
        401: standardResponses[401],
        403: standardResponses[403],
        404: standardResponses[404],
        500: standardResponses[500]
      },
      security: securitySchemes.bearer
    })
  }, async (request: FastifyRequest<{ Body: UpdateUserTierRequest }>, reply: FastifyReply) => {
    try {
      // Check admin permissions
      const admin = (request as any).user;
      if (admin.role !== 'ADMIN' && admin.role !== 'SUPER_ADMIN') {
        return reply.status(403).send({
          success: false,
          error: 'Insufficient permissions',
          message: 'Admin access required for rate limit management'
        });
      }

      const { userId, tier, customLimits } = request.body;

      // Check if user exists
      const user = await fastify.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });

      if (!user) {
        return reply.status(404).send({
          success: false,
          error: 'User not found',
          message: `User with ID ${userId} not found`
        });
      }

      const oldTier = user.role;

      // Update user role based on tier
      const roleMapping = {
        free: 'USER',
        premium: 'PREMIUM',
        enterprise: 'ENTERPRISE',
        admin: 'ADMIN'
      };

      await fastify.prisma.user.update({
        where: { id: userId },
        data: { role: roleMapping[tier] as any }
      });

      // Store custom limits if provided (in a real implementation, you'd have a separate table for this)
      if (customLimits) {
        // This would typically go in a user_rate_limits table
        logger.info({ userId, customLimits }, 'Custom rate limits applied to user');
      }

      // Log the tier change
      await fastify.prisma.activityLog.create({
        data: {
          userId: admin.id,
          action: 'USER_TIER_UPDATED',
          category: 'ADMIN',
          ip: request.ip,
          userAgent: request.headers['user-agent'] || 'Unknown',
          metadata: {
            targetUserId: userId,
            oldTier,
            newTier: tier,
            customLimits
          }
        }
      });

      reply.send({
        success: true,
        message: 'User tier updated successfully',
        data: {
          userId,
          oldTier,
          newTier: tier,
          customLimits,
          updatedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error({ error, userId: request.body.userId }, 'Failed to update user tier');
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to update user tier'
      });
    }
  });

  /**
   * Block IP address
   */
  fastify.post('/rate-limits/block-ip', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'Block IP address',
      description: `
Block an IP address for a specified duration.

**Admin Permission Required**

**Use Cases:**
- Block malicious IPs
- Prevent abuse
- Temporary restrictions
- Security incident response
      `,
      tags: ['Rate Limit Admin'],
      body: {
        type: 'object',
        properties: {
          ip: {
            type: 'string',
            format: 'ipv4',
            description: 'IP address to block'
          },
          duration: {
            type: 'number',
            minimum: 60,
            maximum: 86400,
            description: 'Block duration in seconds (1 minute to 24 hours)'
          },
          reason: {
            type: 'string',
            minLength: 1,
            maxLength: 200,
            description: 'Reason for blocking'
          }
        },
        required: ['ip', 'duration', 'reason']
      },
      response: {
        200: {
          description: 'IP address blocked successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'IP address blocked successfully' },
            data: {
              type: 'object',
              properties: {
                ip: { type: 'string', example: '192.168.1.100' },
                blockedAt: { type: 'string', format: 'date-time' },
                expiresAt: { type: 'string', format: 'date-time' },
                reason: { type: 'string', example: 'Suspicious activity detected' },
                blockId: { type: 'string', example: 'block_123456' }
              }
            }
          }
        },
        400: standardResponses[400],
        401: standardResponses[401],
        403: standardResponses[403],
        500: standardResponses[500]
      },
      security: securitySchemes.bearer
    })
  }, async (request: FastifyRequest<{ Body: BlockIpRequest }>, reply: FastifyReply) => {
    try {
      // Check admin permissions
      const admin = (request as any).user;
      if (admin.role !== 'ADMIN' && admin.role !== 'SUPER_ADMIN') {
        return reply.status(403).send({
          success: false,
          error: 'Insufficient permissions',
          message: 'Admin access required for IP blocking'
        });
      }

      const { ip, duration, reason } = request.body;
      const now = new Date();
      const expiresAt = new Date(now.getTime() + duration * 1000);
      const blockId = `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Store IP block in Redis
      const redisClient = RedisClient.getInstance();
      const blockKey = `blocked_ip:${ip}`;
      
      await redisClient.setex(blockKey, duration, JSON.stringify({
        blockId,
        ip,
        reason,
        blockedBy: admin.id,
        blockedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString()
      }));

      // Log the IP block
      await fastify.prisma.activityLog.create({
        data: {
          userId: admin.id,
          action: 'IP_BLOCKED',
          category: 'SECURITY',
          ip: request.ip,
          userAgent: request.headers['user-agent'] || 'Unknown',
          metadata: {
            blockedIp: ip,
            blockId,
            duration,
            reason,
            expiresAt: expiresAt.toISOString()
          }
        }
      });

      reply.send({
        success: true,
        message: 'IP address blocked successfully',
        data: {
          ip,
          blockedAt: now.toISOString(),
          expiresAt: expiresAt.toISOString(),
          reason,
          blockId
        }
      });

    } catch (error) {
      logger.error({ error, ip: request.body.ip }, 'Failed to block IP address');
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to block IP address'
      });
    }
  });

  /**
   * Unblock IP address
   */
  fastify.delete('/rate-limits/block-ip/:ip', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'Unblock IP address',
      description: `
Remove an IP address from the block list.

**Admin Permission Required**
      `,
      tags: ['Rate Limit Admin'],
      params: {
        type: 'object',
        properties: {
          ip: {
            type: 'string',
            format: 'ipv4',
            description: 'IP address to unblock'
          }
        },
        required: ['ip']
      },
      response: {
        200: {
          description: 'IP address unblocked successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'IP address unblocked successfully' },
            data: {
              type: 'object',
              properties: {
                ip: { type: 'string', example: '192.168.1.100' },
                unblockedAt: { type: 'string', format: 'date-time' }
              }
            }
          }
        },
        401: standardResponses[401],
        403: standardResponses[403],
        404: standardResponses[404],
        500: standardResponses[500]
      },
      security: securitySchemes.bearer
    })
  }, async (request: FastifyRequest<{ Params: { ip: string } }>, reply: FastifyReply) => {
    try {
      // Check admin permissions
      const admin = (request as any).user;
      if (admin.role !== 'ADMIN' && admin.role !== 'SUPER_ADMIN') {
        return reply.status(403).send({
          success: false,
          error: 'Insufficient permissions',
          message: 'Admin access required for IP management'
        });
      }

      const { ip } = request.params;
      const redisClient = RedisClient.getInstance();
      const blockKey = `blocked_ip:${ip}`;

      // Check if IP is actually blocked
      const blockData = await redisClient.get(blockKey);
      if (!blockData) {
        return reply.status(404).send({
          success: false,
          error: 'IP not blocked',
          message: `IP address ${ip} is not currently blocked`
        });
      }

      // Remove the block
      await redisClient.del(blockKey);

      // Log the unblock action
      await fastify.prisma.activityLog.create({
        data: {
          userId: admin.id,
          action: 'IP_UNBLOCKED',
          category: 'SECURITY',
          ip: request.ip,
          userAgent: request.headers['user-agent'] || 'Unknown',
          metadata: {
            unblockedIp: ip,
            previousBlock: JSON.parse(blockData)
          }
        }
      });

      reply.send({
        success: true,
        message: 'IP address unblocked successfully',
        data: {
          ip,
          unblockedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error({ error, ip: request.params.ip }, 'Failed to unblock IP address');
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to unblock IP address'
      });
    }
  });
}