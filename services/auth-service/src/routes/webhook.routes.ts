import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { createRouteSchema, securitySchemes, standardResponses } from '../utils/swagger-schemas';
import { logger } from '../utils/logger';
import { createWebhookService, WebhookEvent } from '../services/webhook.service';
import { z } from 'zod';

// Request schemas
const createWebhookSchema = z.object({
  name: z.string().min(1).max(100),
  url: z.string().url(),
  events: z.array(z.enum([
    'user.created', 'user.updated', 'user.deleted', 'user.login', 'user.logout',
    'user.login_failed', 'user.password_changed', 'user.email_verified', 'user.phone_verified',
    'user.account_locked', 'user.account_unlocked', 'user.password_reset_requested',
    'user.password_reset_completed', 'user.two_factor_enabled', 'user.two_factor_disabled',
    'user.session_expired', 'user.suspicious_activity', 'user.consent_updated',
    'user.preferences_updated', 'user.avatar_updated', 'admin.user_impersonated',
    'security.breach_detected', 'security.rate_limit_exceeded', 'security.ip_blocked',
    'system.maintenance_mode', 'system.backup_completed', 'system.alert_triggered'
  ])).min(1),
  secret: z.string().optional(),
  headers: z.record(z.string()).optional(),
  timeout: z.number().min(1000).max(60000).default(30000),
  retryConfig: z.object({
    maxRetries: z.number().min(0).max(10).default(3),
    retryDelayMs: z.number().min(100).max(10000).default(1000),
    backoffMultiplier: z.number().min(1).max(5).default(2)
  }).optional(),
  metadata: z.record(z.any()).optional()
});

const updateWebhookSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  url: z.string().url().optional(),
  events: z.array(z.enum([
    'user.created', 'user.updated', 'user.deleted', 'user.login', 'user.logout',
    'user.login_failed', 'user.password_changed', 'user.email_verified', 'user.phone_verified',
    'user.account_locked', 'user.account_unlocked', 'user.password_reset_requested',
    'user.password_reset_completed', 'user.two_factor_enabled', 'user.two_factor_disabled',
    'user.session_expired', 'user.suspicious_activity', 'user.consent_updated',
    'user.preferences_updated', 'user.avatar_updated', 'admin.user_impersonated',
    'security.breach_detected', 'security.rate_limit_exceeded', 'security.ip_blocked',
    'system.maintenance_mode', 'system.backup_completed', 'system.alert_triggered'
  ])).optional(),
  isActive: z.boolean().optional(),
  headers: z.record(z.string()).optional(),
  timeout: z.number().min(1000).max(60000).optional(),
  retryConfig: z.object({
    maxRetries: z.number().min(0).max(10),
    retryDelayMs: z.number().min(100).max(10000),
    backoffMultiplier: z.number().min(1).max(5)
  }).optional()
});

const triggerTestWebhookSchema = z.object({
  event: z.enum([
    'user.created', 'user.updated', 'user.deleted', 'user.login', 'user.logout',
    'user.login_failed', 'user.password_changed', 'user.email_verified', 'user.phone_verified',
    'user.account_locked', 'user.account_unlocked', 'user.password_reset_requested',
    'user.password_reset_completed', 'user.two_factor_enabled', 'user.two_factor_disabled',
    'user.session_expired', 'user.suspicious_activity', 'user.consent_updated',
    'user.preferences_updated', 'user.avatar_updated', 'admin.user_impersonated',
    'security.breach_detected', 'security.rate_limit_exceeded', 'security.ip_blocked',
    'system.maintenance_mode', 'system.backup_completed', 'system.alert_triggered'
  ]),
  data: z.record(z.any()),
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    profile: z.object({
      firstName: z.string().optional(),
      lastName: z.string().optional()
    }).optional()
  }).optional(),
  metadata: z.record(z.any()).optional()
});

type CreateWebhookRequest = z.infer<typeof createWebhookSchema>;
type UpdateWebhookRequest = z.infer<typeof updateWebhookSchema>;
type TriggerTestWebhookRequest = z.infer<typeof triggerTestWebhookSchema>;

/**
 * Webhook management routes
 */
export async function webhookRoutes(fastify: FastifyInstance) {
  const webhookService = createWebhookService({
    prisma: fastify.prisma
  });

  /**
   * Create webhook endpoint
   */
  fastify.post('/webhooks', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'Create webhook endpoint',
      description: `
Create a new webhook endpoint to receive authentication event notifications.

**Admin Permission Required**

**Features:**
- Real-time event notifications
- Configurable event filtering
- Secure signature validation
- Automatic retry with backoff
- Custom headers support
- Timeout configuration

**Event Types:**
- User lifecycle events (created, updated, deleted)
- Authentication events (login, logout, failures)
- Security events (account locks, suspicious activity)
- System events (maintenance, backups, alerts)

**Webhook Payload:**
Each webhook delivery includes event data, timestamp, user information, and HMAC signature for verification.
      `,
      tags: ['Webhooks'],
      body: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            minLength: 1,
            maxLength: 100,
            description: 'Descriptive name for the webhook endpoint',
            example: 'User Management System'
          },
          url: {
            type: 'string',
            format: 'uri',
            description: 'Target URL for webhook deliveries',
            example: 'https://api.example.com/webhooks/auth'
          },
          events: {
            type: 'array',
            items: {
              type: 'string',
              enum: [
                'user.created', 'user.updated', 'user.deleted', 'user.login', 'user.logout',
                'user.login_failed', 'user.password_changed', 'user.email_verified', 'user.phone_verified',
                'user.account_locked', 'user.account_unlocked', 'user.password_reset_requested',
                'user.password_reset_completed', 'user.two_factor_enabled', 'user.two_factor_disabled',
                'user.session_expired', 'user.suspicious_activity', 'user.consent_updated',
                'user.preferences_updated', 'user.avatar_updated', 'admin.user_impersonated',
                'security.breach_detected', 'security.rate_limit_exceeded', 'security.ip_blocked',
                'system.maintenance_mode', 'system.backup_completed', 'system.alert_triggered'
              ]
            },
            minItems: 1,
            description: 'Array of events to subscribe to',
            example: ['user.login', 'user.logout', 'user.login_failed']
          },
          secret: {
            type: 'string',
            description: 'Secret key for HMAC signature (auto-generated if not provided)',
            example: 'your-secret-key'
          },
          headers: {
            type: 'object',
            additionalProperties: { type: 'string' },
            description: 'Custom headers to include in webhook requests',
            example: {
              'Authorization': 'Bearer token',
              'X-Custom-Header': 'value'
            }
          },
          timeout: {
            type: 'number',
            minimum: 1000,
            maximum: 60000,
            default: 30000,
            description: 'Request timeout in milliseconds'
          },
          retryConfig: {
            type: 'object',
            properties: {
              maxRetries: { type: 'number', minimum: 0, maximum: 10, default: 3 },
              retryDelayMs: { type: 'number', minimum: 100, maximum: 10000, default: 1000 },
              backoffMultiplier: { type: 'number', minimum: 1, maximum: 5, default: 2 }
            },
            description: 'Retry configuration for failed deliveries'
          },
          metadata: {
            type: 'object',
            description: 'Additional metadata for the webhook'
          }
        },
        required: ['name', 'url', 'events']
      },
      response: {
        201: {
          description: 'Webhook endpoint created successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Webhook endpoint created successfully' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'wh_1642345678901_a1b2c3d4' },
                name: { type: 'string', example: 'User Management System' },
                url: { type: 'string', example: 'https://api.example.com/webhooks/auth' },
                events: {
                  type: 'array',
                  items: { type: 'string' },
                  example: ['user.login', 'user.logout']
                },
                secret: { type: 'string', example: 'wh_secret_...' },
                isActive: { type: 'boolean', example: true },
                createdAt: { type: 'string', format: 'date-time' }
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
  }, async (request: FastifyRequest<{ Body: CreateWebhookRequest }>, reply: FastifyReply) => {
    try {
      // Check admin permissions
      const user = (request as any).user;
      if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
        return reply.status(403).send({
          success: false,
          error: 'Insufficient permissions',
          message: 'Admin access required to manage webhooks'
        });
      }

      const webhook = await webhookService.createWebhookEndpoint(request.body);

      // Log webhook creation
      await fastify.prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'WEBHOOK_CREATED',
          category: 'ADMIN',
          ip: request.ip,
          userAgent: request.headers['user-agent'] || 'Unknown',
          metadata: {
            webhookId: webhook.id,
            name: webhook.name,
            url: webhook.url,
            events: webhook.events
          }
        }
      });

      reply.status(201).send({
        success: true,
        message: 'Webhook endpoint created successfully',
        data: {
          id: webhook.id,
          name: webhook.name,
          url: webhook.url,
          events: webhook.events,
          secret: webhook.secret,
          isActive: webhook.isActive,
          createdAt: webhook.createdAt.toISOString()
        }
      });

    } catch (error) {
      logger.error({ error, userId: (request as any).user?.id }, 'Failed to create webhook endpoint');
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to create webhook endpoint'
      });
    }
  });

  /**
   * List webhook endpoints
   */
  fastify.get('/webhooks', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'List webhook endpoints',
      description: `
List all webhook endpoints with their configuration and statistics.

**Admin Permission Required**

**Response includes:**
- Webhook configuration details
- Event subscriptions
- Delivery statistics
- Active/inactive status
- Recent delivery information
      `,
      tags: ['Webhooks'],
      response: {
        200: {
          description: 'Webhook endpoints retrieved successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                webhooks: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', example: 'wh_1642345678901_a1b2c3d4' },
                      name: { type: 'string', example: 'User Management System' },
                      url: { type: 'string', example: 'https://api.example.com/webhooks/auth' },
                      events: {
                        type: 'array',
                        items: { type: 'string' },
                        example: ['user.login', 'user.logout']
                      },
                      isActive: { type: 'boolean', example: true },
                      successCount: { type: 'number', example: 145 },
                      failureCount: { type: 'number', example: 3 },
                      lastTriggered: { type: 'string', format: 'date-time', nullable: true },
                      createdAt: { type: 'string', format: 'date-time' },
                      updatedAt: { type: 'string', format: 'date-time' }
                    }
                  }
                },
                summary: {
                  type: 'object',
                  properties: {
                    totalWebhooks: { type: 'number', example: 3 },
                    activeWebhooks: { type: 'number', example: 2 },
                    totalDeliveries: { type: 'number', example: 1250 },
                    successRate: { type: 'number', example: 97.8 }
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
          message: 'Admin access required to view webhooks'
        });
      }

      const webhooks = await webhookService.listWebhookEndpoints();

      // Calculate summary statistics
      const totalWebhooks = webhooks.length;
      const activeWebhooks = webhooks.filter(w => w.isActive).length;
      const totalDeliveries = webhooks.reduce((sum, w) => sum + w.successCount + w.failureCount, 0);
      const totalSuccesses = webhooks.reduce((sum, w) => sum + w.successCount, 0);
      const successRate = totalDeliveries > 0 ? (totalSuccesses / totalDeliveries) * 100 : 0;

      reply.send({
        success: true,
        data: {
          webhooks: webhooks.map(webhook => ({
            id: webhook.id,
            name: webhook.name,
            url: webhook.url,
            events: webhook.events,
            isActive: webhook.isActive,
            successCount: webhook.successCount,
            failureCount: webhook.failureCount,
            lastTriggered: webhook.lastTriggered?.toISOString(),
            createdAt: webhook.createdAt.toISOString(),
            updatedAt: webhook.updatedAt.toISOString()
          })),
          summary: {
            totalWebhooks,
            activeWebhooks,
            totalDeliveries,
            successRate: Math.round(successRate * 100) / 100
          }
        }
      });

    } catch (error) {
      logger.error({ error, userId: (request as any).user?.id }, 'Failed to list webhook endpoints');
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to retrieve webhook endpoints'
      });
    }
  });

  /**
   * Get webhook endpoint details
   */
  fastify.get('/webhooks/:webhookId', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'Get webhook endpoint details',
      description: `
Get detailed information about a specific webhook endpoint.

**Admin Permission Required**

**Response includes:**
- Complete webhook configuration
- Delivery statistics
- Recent delivery history
- Error analysis
      `,
      tags: ['Webhooks'],
      params: {
        type: 'object',
        properties: {
          webhookId: {
            type: 'string',
            description: 'Webhook endpoint ID',
            example: 'wh_1642345678901_a1b2c3d4'
          }
        },
        required: ['webhookId']
      },
      response: {
        200: {
          description: 'Webhook endpoint details retrieved successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                webhook: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', example: 'wh_1642345678901_a1b2c3d4' },
                    name: { type: 'string', example: 'User Management System' },
                    url: { type: 'string', example: 'https://api.example.com/webhooks/auth' },
                    events: {
                      type: 'array',
                      items: { type: 'string' },
                      example: ['user.login', 'user.logout']
                    },
                    isActive: { type: 'boolean', example: true },
                    retryConfig: {
                      type: 'object',
                      properties: {
                        maxRetries: { type: 'number', example: 3 },
                        retryDelayMs: { type: 'number', example: 1000 },
                        backoffMultiplier: { type: 'number', example: 2 }
                      }
                    },
                    timeout: { type: 'number', example: 30000 },
                    successCount: { type: 'number', example: 145 },
                    failureCount: { type: 'number', example: 3 },
                    lastTriggered: { type: 'string', format: 'date-time', nullable: true },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                  }
                },
                statistics: {
                  type: 'object',
                  properties: {
                    totalDeliveries: { type: 'number', example: 148 },
                    successfulDeliveries: { type: 'number', example: 145 },
                    failedDeliveries: { type: 'number', example: 3 },
                    averageResponseTime: { type: 'number', example: 245 },
                    successRate: { type: 'number', example: 97.97 }
                  }
                }
              }
            }
          }
        },
        401: standardResponses[401],
        403: standardResponses[403],
        404: {
          description: 'Webhook endpoint not found',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Not Found' },
            message: { type: 'string', example: 'Webhook endpoint not found' }
          }
        },
        500: standardResponses[500]
      },
      security: securitySchemes.bearer
    })
  }, async (request: FastifyRequest<{ Params: { webhookId: string } }>, reply: FastifyReply) => {
    try {
      // Check admin permissions
      const user = (request as any).user;
      if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
        return reply.status(403).send({
          success: false,
          error: 'Insufficient permissions',
          message: 'Admin access required to view webhook details'
        });
      }

      const { webhookId } = request.params;
      const webhook = await webhookService.getWebhookEndpoint(webhookId);

      if (!webhook) {
        return reply.status(404).send({
          success: false,
          error: 'Not Found',
          message: 'Webhook endpoint not found'
        });
      }

      const statistics = await webhookService.getWebhookStatistics(webhookId);

      reply.send({
        success: true,
        data: {
          webhook: {
            id: webhook.id,
            name: webhook.name,
            url: webhook.url,
            events: webhook.events,
            isActive: webhook.isActive,
            retryConfig: webhook.retryConfig,
            timeout: webhook.timeout,
            successCount: webhook.successCount,
            failureCount: webhook.failureCount,
            lastTriggered: webhook.lastTriggered?.toISOString(),
            createdAt: webhook.createdAt.toISOString(),
            updatedAt: webhook.updatedAt.toISOString()
          },
          statistics
        }
      });

    } catch (error) {
      logger.error({ error, webhookId: request.params.webhookId }, 'Failed to get webhook endpoint details');
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to retrieve webhook endpoint details'
      });
    }
  });

  /**
   * Update webhook endpoint
   */
  fastify.put('/webhooks/:webhookId', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'Update webhook endpoint',
      description: `
Update webhook endpoint configuration.

**Admin Permission Required**

**Updatable fields:**
- Name and URL
- Event subscriptions
- Active/inactive status
- Custom headers
- Timeout and retry configuration
      `,
      tags: ['Webhooks'],
      params: {
        type: 'object',
        properties: {
          webhookId: {
            type: 'string',
            description: 'Webhook endpoint ID',
            example: 'wh_1642345678901_a1b2c3d4'
          }
        },
        required: ['webhookId']
      },
      body: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            minLength: 1,
            maxLength: 100,
            description: 'Descriptive name for the webhook endpoint'
          },
          url: {
            type: 'string',
            format: 'uri',
            description: 'Target URL for webhook deliveries'
          },
          events: {
            type: 'array',
            items: { type: 'string' },
            description: 'Array of events to subscribe to'
          },
          isActive: {
            type: 'boolean',
            description: 'Whether the webhook is active'
          },
          headers: {
            type: 'object',
            additionalProperties: { type: 'string' },
            description: 'Custom headers to include in webhook requests'
          },
          timeout: {
            type: 'number',
            minimum: 1000,
            maximum: 60000,
            description: 'Request timeout in milliseconds'
          },
          retryConfig: {
            type: 'object',
            properties: {
              maxRetries: { type: 'number', minimum: 0, maximum: 10 },
              retryDelayMs: { type: 'number', minimum: 100, maximum: 10000 },
              backoffMultiplier: { type: 'number', minimum: 1, maximum: 5 }
            },
            description: 'Retry configuration for failed deliveries'
          }
        }
      },
      response: {
        200: {
          description: 'Webhook endpoint updated successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Webhook endpoint updated successfully' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'wh_1642345678901_a1b2c3d4' },
                name: { type: 'string', example: 'Updated Webhook Name' },
                url: { type: 'string', example: 'https://api.example.com/webhooks/auth' },
                events: {
                  type: 'array',
                  items: { type: 'string' },
                  example: ['user.login', 'user.logout', 'user.login_failed']
                },
                isActive: { type: 'boolean', example: true },
                updatedAt: { type: 'string', format: 'date-time' }
              }
            }
          }
        },
        400: standardResponses[400],
        401: standardResponses[401],
        403: standardResponses[403],
        404: {
          description: 'Webhook endpoint not found',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Not Found' },
            message: { type: 'string', example: 'Webhook endpoint not found' }
          }
        },
        500: standardResponses[500]
      },
      security: securitySchemes.bearer
    })
  }, async (request: FastifyRequest<{ 
    Params: { webhookId: string };
    Body: UpdateWebhookRequest;
  }>, reply: FastifyReply) => {
    try {
      // Check admin permissions
      const user = (request as any).user;
      if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
        return reply.status(403).send({
          success: false,
          error: 'Insufficient permissions',
          message: 'Admin access required to update webhooks'
        });
      }

      const { webhookId } = request.params;
      const webhook = await webhookService.updateWebhookEndpoint(webhookId, request.body);

      // Log webhook update
      await fastify.prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'WEBHOOK_UPDATED',
          category: 'ADMIN',
          ip: request.ip,
          userAgent: request.headers['user-agent'] || 'Unknown',
          metadata: {
            webhookId: webhook.id,
            updates: request.body
          }
        }
      });

      reply.send({
        success: true,
        message: 'Webhook endpoint updated successfully',
        data: {
          id: webhook.id,
          name: webhook.name,
          url: webhook.url,
          events: webhook.events,
          isActive: webhook.isActive,
          updatedAt: webhook.updatedAt.toISOString()
        }
      });

    } catch (error) {
      logger.error({ error, webhookId: request.params.webhookId }, 'Failed to update webhook endpoint');
      
      if (error instanceof Error && error.message.includes('not found')) {
        return reply.status(404).send({
          success: false,
          error: 'Not Found',
          message: error.message
        });
      }

      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to update webhook endpoint'
      });
    }
  });

  /**
   * Delete webhook endpoint
   */
  fastify.delete('/webhooks/:webhookId', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'Delete webhook endpoint',
      description: `
Delete a webhook endpoint and stop all future deliveries.

**Admin Permission Required**

**Warning:** This action is irreversible. The webhook endpoint will be permanently deleted and cannot be recovered.
      `,
      tags: ['Webhooks'],
      params: {
        type: 'object',
        properties: {
          webhookId: {
            type: 'string',
            description: 'Webhook endpoint ID',
            example: 'wh_1642345678901_a1b2c3d4'
          }
        },
        required: ['webhookId']
      },
      response: {
        200: {
          description: 'Webhook endpoint deleted successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Webhook endpoint deleted successfully' },
            data: {
              type: 'object',
              properties: {
                webhookId: { type: 'string', example: 'wh_1642345678901_a1b2c3d4' },
                deletedAt: { type: 'string', format: 'date-time' }
              }
            }
          }
        },
        401: standardResponses[401],
        403: standardResponses[403],
        404: {
          description: 'Webhook endpoint not found',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Not Found' },
            message: { type: 'string', example: 'Webhook endpoint not found' }
          }
        },
        500: standardResponses[500]
      },
      security: securitySchemes.bearer
    })
  }, async (request: FastifyRequest<{ Params: { webhookId: string } }>, reply: FastifyReply) => {
    try {
      // Check admin permissions
      const user = (request as any).user;
      if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
        return reply.status(403).send({
          success: false,
          error: 'Insufficient permissions',
          message: 'Admin access required to delete webhooks'
        });
      }

      const { webhookId } = request.params;
      await webhookService.deleteWebhookEndpoint(webhookId);

      // Log webhook deletion
      await fastify.prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'WEBHOOK_DELETED',
          category: 'ADMIN',
          ip: request.ip,
          userAgent: request.headers['user-agent'] || 'Unknown',
          metadata: {
            webhookId,
            deletedAt: new Date().toISOString()
          }
        }
      });

      reply.send({
        success: true,
        message: 'Webhook endpoint deleted successfully',
        data: {
          webhookId,
          deletedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error({ error, webhookId: request.params.webhookId }, 'Failed to delete webhook endpoint');
      
      if (error instanceof Error && error.message.includes('not found')) {
        return reply.status(404).send({
          success: false,
          error: 'Not Found',
          message: error.message
        });
      }

      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to delete webhook endpoint'
      });
    }
  });

  /**
   * Test webhook endpoint
   */
  fastify.post('/webhooks/:webhookId/test', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'Test webhook endpoint',
      description: `
Send a test delivery to a webhook endpoint to verify configuration.

**Admin Permission Required**

**Test Process:**
1. Sends a test payload to the webhook URL
2. Validates endpoint response
3. Records delivery attempt and result
4. Returns detailed delivery information

**Use this to verify:**
- URL accessibility
- Authentication configuration
- Response handling
- Signature validation
      `,
      tags: ['Webhooks'],
      params: {
        type: 'object',
        properties: {
          webhookId: {
            type: 'string',
            description: 'Webhook endpoint ID',
            example: 'wh_1642345678901_a1b2c3d4'
          }
        },
        required: ['webhookId']
      },
      response: {
        200: {
          description: 'Webhook test completed',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Webhook test completed' },
            data: {
              type: 'object',
              properties: {
                deliveryId: { type: 'string', example: 'del_1642345678901_a1b2c3d4' },
                webhookId: { type: 'string', example: 'wh_1642345678901_a1b2c3d4' },
                success: { type: 'boolean', example: true },
                httpStatus: { type: 'number', example: 200 },
                responseTime: { type: 'number', example: 245 },
                attempts: { type: 'number', example: 1 },
                deliveredAt: { type: 'string', format: 'date-time' },
                error: { type: 'string', nullable: true, example: null }
              }
            }
          }
        },
        401: standardResponses[401],
        403: standardResponses[403],
        404: {
          description: 'Webhook endpoint not found',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Not Found' },
            message: { type: 'string', example: 'Webhook endpoint not found' }
          }
        },
        500: standardResponses[500]
      },
      security: securitySchemes.bearer
    })
  }, async (request: FastifyRequest<{ Params: { webhookId: string } }>, reply: FastifyReply) => {
    try {
      // Check admin permissions
      const user = (request as any).user;
      if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
        return reply.status(403).send({
          success: false,
          error: 'Insufficient permissions',
          message: 'Admin access required to test webhooks'
        });
      }

      const { webhookId } = request.params;
      const delivery = await webhookService.testWebhookEndpoint(webhookId);

      // Log webhook test
      await fastify.prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'WEBHOOK_TESTED',
          category: 'ADMIN',
          ip: request.ip,
          userAgent: request.headers['user-agent'] || 'Unknown',
          metadata: {
            webhookId,
            deliveryId: delivery.id,
            success: delivery.success,
            httpStatus: delivery.httpStatus
          }
        }
      });

      reply.send({
        success: true,
        message: 'Webhook test completed',
        data: {
          deliveryId: delivery.id,
          webhookId: delivery.webhookId,
          success: delivery.success,
          httpStatus: delivery.httpStatus,
          responseTime: delivery.duration,
          attempts: delivery.attempts,
          deliveredAt: delivery.deliveredAt?.toISOString(),
          error: delivery.error
        }
      });

    } catch (error) {
      logger.error({ error, webhookId: request.params.webhookId }, 'Failed to test webhook endpoint');
      
      if (error instanceof Error && error.message.includes('not found')) {
        return reply.status(404).send({
          success: false,
          error: 'Not Found',
          message: error.message
        });
      }

      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to test webhook endpoint'
      });
    }
  });

  /**
   * Get webhook deliveries
   */
  fastify.get('/webhooks/:webhookId/deliveries', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'Get webhook delivery history',
      description: `
Get the delivery history for a specific webhook endpoint.

**Admin Permission Required**

**Response includes:**
- Delivery attempts and results
- Response times and status codes
- Error details and retry information
- Delivery timestamps
      `,
      tags: ['Webhooks'],
      params: {
        type: 'object',
        properties: {
          webhookId: {
            type: 'string',
            description: 'Webhook endpoint ID',
            example: 'wh_1642345678901_a1b2c3d4'
          }
        },
        required: ['webhookId']
      },
      querystring: {
        type: 'object',
        properties: {
          limit: {
            type: 'number',
            minimum: 1,
            maximum: 100,
            default: 50,
            description: 'Maximum number of deliveries to return'
          }
        }
      },
      response: {
        200: {
          description: 'Webhook deliveries retrieved successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                deliveries: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', example: 'del_1642345678901_a1b2c3d4' },
                      event: { type: 'string', example: 'user.login' },
                      success: { type: 'boolean', example: true },
                      httpStatus: { type: 'number', example: 200 },
                      responseTime: { type: 'number', example: 245 },
                      attempts: { type: 'number', example: 1 },
                      deliveredAt: { type: 'string', format: 'date-time' },
                      error: { type: 'string', nullable: true }
                    }
                  }
                },
                summary: {
                  type: 'object',
                  properties: {
                    totalDeliveries: { type: 'number', example: 50 },
                    successfulDeliveries: { type: 'number', example: 48 },
                    failedDeliveries: { type: 'number', example: 2 },
                    averageResponseTime: { type: 'number', example: 234 }
                  }
                }
              }
            }
          }
        },
        401: standardResponses[401],
        403: standardResponses[403],
        404: {
          description: 'Webhook endpoint not found',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Not Found' },
            message: { type: 'string', example: 'Webhook endpoint not found' }
          }
        },
        500: standardResponses[500]
      },
      security: securitySchemes.bearer
    })
  }, async (request: FastifyRequest<{ 
    Params: { webhookId: string };
    Querystring: { limit?: number };
  }>, reply: FastifyReply) => {
    try {
      // Check admin permissions
      const user = (request as any).user;
      if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
        return reply.status(403).send({
          success: false,
          error: 'Insufficient permissions',
          message: 'Admin access required to view webhook deliveries'
        });
      }

      const { webhookId } = request.params;
      const { limit = 50 } = request.query;

      // Verify webhook exists
      const webhook = await webhookService.getWebhookEndpoint(webhookId);
      if (!webhook) {
        return reply.status(404).send({
          success: false,
          error: 'Not Found',
          message: 'Webhook endpoint not found'
        });
      }

      const deliveries = await webhookService.getWebhookDeliveries(webhookId, limit);

      // Calculate summary
      const totalDeliveries = deliveries.length;
      const successfulDeliveries = deliveries.filter(d => d.success).length;
      const failedDeliveries = totalDeliveries - successfulDeliveries;
      const averageResponseTime = totalDeliveries > 0
        ? Math.round(deliveries.reduce((sum, d) => sum + d.duration, 0) / totalDeliveries)
        : 0;

      reply.send({
        success: true,
        data: {
          deliveries: deliveries.map(delivery => ({
            id: delivery.id,
            event: delivery.event,
            success: delivery.success,
            httpStatus: delivery.httpStatus,
            responseTime: delivery.duration,
            attempts: delivery.attempts,
            deliveredAt: delivery.deliveredAt?.toISOString(),
            error: delivery.error
          })),
          summary: {
            totalDeliveries,
            successfulDeliveries,
            failedDeliveries,
            averageResponseTime
          }
        }
      });

    } catch (error) {
      logger.error({ error, webhookId: request.params.webhookId }, 'Failed to get webhook deliveries');
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to retrieve webhook deliveries'
      });
    }
  });

  /**
   * Trigger test event (Admin only)
   */
  fastify.post('/webhooks/trigger-test', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'Trigger test webhook event (Admin)',
      description: `
Manually trigger a webhook event for testing purposes.

**Admin Permission Required**

**Use Cases:**
- Testing webhook integrations
- Debugging webhook configurations
- Validating event handling
- Development and staging environments

**Note:** This will trigger all active webhooks subscribed to the specified event type.
      `,
      tags: ['Webhooks'],
      body: {
        type: 'object',
        properties: {
          event: {
            type: 'string',
            enum: [
              'user.created', 'user.updated', 'user.deleted', 'user.login', 'user.logout',
              'user.login_failed', 'user.password_changed', 'user.email_verified', 'user.phone_verified',
              'user.account_locked', 'user.account_unlocked', 'user.password_reset_requested',
              'user.password_reset_completed', 'user.two_factor_enabled', 'user.two_factor_disabled',
              'user.session_expired', 'user.suspicious_activity', 'user.consent_updated',
              'user.preferences_updated', 'user.avatar_updated', 'admin.user_impersonated',
              'security.breach_detected', 'security.rate_limit_exceeded', 'security.ip_blocked',
              'system.maintenance_mode', 'system.backup_completed', 'system.alert_triggered'
            ],
            description: 'Event type to trigger'
          },
          data: {
            type: 'object',
            description: 'Event data payload'
          },
          user: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              email: { type: 'string', format: 'email' },
              profile: {
                type: 'object',
                properties: {
                  firstName: { type: 'string' },
                  lastName: { type: 'string' }
                }
              }
            },
            description: 'User information (optional)'
          },
          metadata: {
            type: 'object',
            description: 'Additional metadata'
          }
        },
        required: ['event', 'data']
      },
      response: {
        200: {
          description: 'Test event triggered successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Test event triggered successfully' },
            data: {
              type: 'object',
              properties: {
                event: { type: 'string', example: 'user.login' },
                triggeredWebhooks: { type: 'number', example: 2 },
                triggeredAt: { type: 'string', format: 'date-time' }
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
  }, async (request: FastifyRequest<{ Body: TriggerTestWebhookRequest }>, reply: FastifyReply) => {
    try {
      // Check admin permissions
      const user = (request as any).user;
      if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
        return reply.status(403).send({
          success: false,
          error: 'Insufficient permissions',
          message: 'Admin access required to trigger test events'
        });
      }

      const { event, data, user: eventUser, metadata } = request.body;

      // Get active webhooks for this event
      const webhooks = await webhookService.listWebhookEndpoints();
      const relevantWebhooks = webhooks.filter(webhook => 
        webhook.isActive && webhook.events.includes(event as WebhookEvent)
      );

      // Trigger the test event
      await webhookService.triggerWebhook(
        event as WebhookEvent,
        { ...data, test: true },
        eventUser,
        { ...metadata, source: 'manual_test', triggeredBy: user.id }
      );

      // Log test event trigger
      await fastify.prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'WEBHOOK_TEST_EVENT_TRIGGERED',
          category: 'ADMIN',
          ip: request.ip,
          userAgent: request.headers['user-agent'] || 'Unknown',
          metadata: {
            event,
            data,
            triggeredWebhooks: relevantWebhooks.length,
            triggeredAt: new Date().toISOString()
          }
        }
      });

      reply.send({
        success: true,
        message: 'Test event triggered successfully',
        data: {
          event,
          triggeredWebhooks: relevantWebhooks.length,
          triggeredAt: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error({ error, userId: (request as any).user?.id }, 'Failed to trigger test webhook event');
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to trigger test event'
      });
    }
  });
}