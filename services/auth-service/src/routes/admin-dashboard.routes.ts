import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { createAdminDashboardService } from '../services/admin-dashboard.service';
import { logger } from '../utils/logger';
import { z } from 'zod';

// Request schemas
const GetUserActivitySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
  status: z.enum(['active', 'inactive', 'locked', 'deleted']).optional(),
  riskLevel: z.enum(['low', 'medium', 'high']).optional(),
  sortBy: z.enum(['lastLogin', 'createdAt', 'loginCount', 'riskScore']).default('lastLogin'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

const GetSystemAlertsSchema = z.object({
  acknowledged: z.coerce.boolean().optional(),
  category: z.enum(['system', 'security', 'performance', 'user', 'backup']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  limit: z.coerce.number().min(1).max(500).default(100)
});

const CreateAlertSchema = z.object({
  type: z.enum(['error', 'warning', 'info', 'critical']),
  category: z.enum(['system', 'security', 'performance', 'user', 'backup']),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
  metadata: z.record(z.any()).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium')
});

const AcknowledgeAlertSchema = z.object({
  acknowledgedBy: z.string().min(1).max(100)
});

const GetAdminActionsSchema = z.object({
  adminId: z.string().optional(),
  category: z.string().optional(),
  limit: z.coerce.number().min(1).max(500).default(100)
});

export async function adminDashboardRoutes(fastify: FastifyInstance) {
  const adminDashboardService = createAdminDashboardService({
    prisma: fastify.prisma,
    redis: fastify.redis
  });

  /**
   * Get comprehensive dashboard statistics
   */
  fastify.get('/dashboard/stats', {
    schema: {
      tags: ['Admin Dashboard'],
      summary: 'Get comprehensive dashboard statistics',
      description: 'Returns comprehensive system statistics including users, sessions, security, system health, webhooks, and backup status',
      response: {
        200: {
          type: 'object',
          properties: {
            users: {
              type: 'object',
              properties: {
                total: { type: 'number' },
                active: { type: 'number' },
                inactive: { type: 'number' },
                newToday: { type: 'number' },
                newThisWeek: { type: 'number' },
                newThisMonth: { type: 'number' },
                deletedUsers: { type: 'number' },
                verifiedEmails: { type: 'number' },
                verifiedPhones: { type: 'number' },
                twoFactorEnabled: { type: 'number' }
              }
            },
            sessions: {
              type: 'object',
              properties: {
                activeSessions: { type: 'number' },
                totalSessionsToday: { type: 'number' },
                averageSessionDuration: { type: 'number' },
                peakConcurrentSessions: { type: 'number' },
                uniqueVisitorsToday: { type: 'number' }
              }
            },
            security: {
              type: 'object',
              properties: {
                failedLoginsToday: { type: 'number' },
                blockedIPsToday: { type: 'number' },
                suspiciousActivities: { type: 'number' },
                accountLocksToday: { type: 'number' },
                passwordResetsToday: { type: 'number' }
              }
            },
            system: {
              type: 'object',
              properties: {
                uptime: { type: 'number' },
                memoryUsage: { type: 'number' },
                cpuUsage: { type: 'number' },
                diskUsage: { type: 'number' },
                databaseConnections: { type: 'number' },
                redisConnections: { type: 'number' },
                apiResponseTime: { type: 'number' },
                errorRate: { type: 'number' }
              }
            },
            webhooks: {
              type: 'object',
              properties: {
                totalWebhooks: { type: 'number' },
                activeWebhooks: { type: 'number' },
                deliveriesToday: { type: 'number' },
                successRate: { type: 'number' },
                failedDeliveries: { type: 'number' }
              }
            },
            backup: {
              type: 'object',
              properties: {
                lastBackupTime: { type: 'string', format: 'date-time', nullable: true },
                lastBackupSize: { type: 'number' },
                backupStatus: { type: 'string', enum: ['success', 'failed', 'in_progress', 'none'] },
                nextScheduledBackup: { type: 'string', format: 'date-time', nullable: true }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await fastify.authenticate(request, reply);
      
      // Check if user is admin
      const user = (request as any).user;
      if (!user?.role || user.role !== 'ADMIN') {
        return reply.status(403).send({
          error: 'Forbidden',
          message: 'Admin access required'
        });
      }

      const stats = await adminDashboardService.getDashboardStats();
      
      logger.info({
        userId: user.id,
        action: 'ADMIN_DASHBOARD_STATS_VIEWED'
      }, 'Admin viewed dashboard stats');

      return reply.send(stats);

    } catch (error) {
      logger.error({ error }, 'Failed to get dashboard stats');
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to get dashboard statistics'
      });
    }
  });

  /**
   * Get user activity summary with pagination
   */
  fastify.get('/dashboard/users/activity', {
    schema: {
      tags: ['Admin Dashboard'],
      summary: 'Get user activity summary',
      description: 'Returns paginated user activity data with risk scoring and filtering options',
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', minimum: 1, default: 1 },
          limit: { type: 'number', minimum: 1, maximum: 100, default: 50 },
          status: { type: 'string', enum: ['active', 'inactive', 'locked', 'deleted'] },
          riskLevel: { type: 'string', enum: ['low', 'medium', 'high'] },
          sortBy: { type: 'string', enum: ['lastLogin', 'createdAt', 'loginCount', 'riskScore'], default: 'lastLogin' },
          sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'desc' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            users: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  userId: { type: 'string' },
                  email: { type: 'string' },
                  profile: {
                    type: 'object',
                    properties: {
                      firstName: { type: 'string' },
                      lastName: { type: 'string' }
                    }
                  },
                  lastLoginAt: { type: 'string', format: 'date-time', nullable: true },
                  loginCount: { type: 'number' },
                  failedLoginCount: { type: 'number' },
                  sessionCount: { type: 'number' },
                  accountStatus: { type: 'string', enum: ['active', 'inactive', 'locked', 'deleted'] },
                  riskScore: { type: 'number' },
                  createdAt: { type: 'string', format: 'date-time' },
                  lastActivityAt: { type: 'string', format: 'date-time', nullable: true },
                  deviceCount: { type: 'number' },
                  locationCount: { type: 'number' }
                }
              }
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'number' },
                limit: { type: 'number' },
                total: { type: 'number' },
                pages: { type: 'number' }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await fastify.authenticate(request, reply);
      
      // Check if user is admin
      const user = (request as any).user;
      if (!user?.role || user.role !== 'ADMIN') {
        return reply.status(403).send({
          error: 'Forbidden',
          message: 'Admin access required'
        });
      }

      const query = GetUserActivitySchema.parse(request.query);
      
      const result = await adminDashboardService.getUserActivitySummary(
        query.page,
        query.limit,
        {
          status: query.status,
          riskLevel: query.riskLevel,
          sortBy: query.sortBy,
          sortOrder: query.sortOrder
        }
      );

      logger.info({
        userId: user.id,
        action: 'ADMIN_USER_ACTIVITY_VIEWED',
        filters: query
      }, 'Admin viewed user activity summary');

      return reply.send(result);

    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          error: 'Bad Request',
          message: 'Invalid query parameters',
          details: error.errors
        });
      }

      logger.error({ error }, 'Failed to get user activity summary');
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to get user activity summary'
      });
    }
  });

  /**
   * Get system alerts
   */
  fastify.get('/dashboard/alerts', {
    schema: {
      tags: ['Admin Dashboard'],
      summary: 'Get system alerts',
      description: 'Returns system alerts with optional filtering by acknowledgment status, category, and priority',
      querystring: {
        type: 'object',
        properties: {
          acknowledged: { type: 'boolean' },
          category: { type: 'string', enum: ['system', 'security', 'performance', 'user', 'backup'] },
          priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
          limit: { type: 'number', minimum: 1, maximum: 500, default: 100 }
        }
      },
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              type: { type: 'string', enum: ['error', 'warning', 'info', 'critical'] },
              category: { type: 'string', enum: ['system', 'security', 'performance', 'user', 'backup'] },
              title: { type: 'string' },
              message: { type: 'string' },
              metadata: { type: 'object' },
              acknowledged: { type: 'boolean' },
              acknowledgedBy: { type: 'string' },
              acknowledgedAt: { type: 'string', format: 'date-time' },
              createdAt: { type: 'string', format: 'date-time' },
              resolvedAt: { type: 'string', format: 'date-time' },
              priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await fastify.authenticate(request, reply);
      
      // Check if user is admin
      const user = (request as any).user;
      if (!user?.role || user.role !== 'ADMIN') {
        return reply.status(403).send({
          error: 'Forbidden',
          message: 'Admin access required'
        });
      }

      const query = GetSystemAlertsSchema.parse(request.query);
      
      const alerts = await adminDashboardService.getSystemAlerts(
        query.acknowledged,
        query.category,
        query.priority,
        query.limit
      );

      logger.info({
        userId: user.id,
        action: 'ADMIN_ALERTS_VIEWED',
        filters: query
      }, 'Admin viewed system alerts');

      return reply.send(alerts);

    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          error: 'Bad Request',
          message: 'Invalid query parameters',
          details: error.errors
        });
      }

      logger.error({ error }, 'Failed to get system alerts');
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to get system alerts'
      });
    }
  });

  /**
   * Create system alert
   */
  fastify.post('/dashboard/alerts', {
    schema: {
      tags: ['Admin Dashboard'],
      summary: 'Create system alert',
      description: 'Creates a new system alert with specified type, category, and priority',
      body: {
        type: 'object',
        required: ['type', 'category', 'title', 'message'],
        properties: {
          type: { type: 'string', enum: ['error', 'warning', 'info', 'critical'] },
          category: { type: 'string', enum: ['system', 'security', 'performance', 'user', 'backup'] },
          title: { type: 'string', minLength: 1, maxLength: 200 },
          message: { type: 'string', minLength: 1, maxLength: 1000 },
          metadata: { type: 'object' },
          priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'], default: 'medium' }
        }
      },
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            type: { type: 'string' },
            category: { type: 'string' },
            title: { type: 'string' },
            message: { type: 'string' },
            metadata: { type: 'object' },
            acknowledged: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            priority: { type: 'string' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await fastify.authenticate(request, reply);
      
      // Check if user is admin
      const user = (request as any).user;
      if (!user?.role || user.role !== 'ADMIN') {
        return reply.status(403).send({
          error: 'Forbidden',
          message: 'Admin access required'
        });
      }

      const body = CreateAlertSchema.parse(request.body);
      
      const alert = await adminDashboardService.createSystemAlert(body);

      logger.info({
        userId: user.id,
        action: 'ADMIN_ALERT_CREATED',
        alertId: alert.id,
        alertType: alert.type,
        category: alert.category
      }, 'Admin created system alert');

      return reply.status(201).send(alert);

    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          error: 'Bad Request',
          message: 'Invalid request body',
          details: error.errors
        });
      }

      logger.error({ error }, 'Failed to create system alert');
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to create system alert'
      });
    }
  });

  /**
   * Acknowledge system alert
   */
  fastify.post('/dashboard/alerts/:alertId/acknowledge', {
    schema: {
      tags: ['Admin Dashboard'],
      summary: 'Acknowledge system alert',
      description: 'Acknowledges a system alert by marking it as reviewed by an admin',
      params: {
        type: 'object',
        properties: {
          alertId: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        required: ['acknowledgedBy'],
        properties: {
          acknowledgedBy: { type: 'string', minLength: 1, maxLength: 100 }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await fastify.authenticate(request, reply);
      
      // Check if user is admin
      const user = (request as any).user;
      if (!user?.role || user.role !== 'ADMIN') {
        return reply.status(403).send({
          error: 'Forbidden',
          message: 'Admin access required'
        });
      }

      const { alertId } = request.params as { alertId: string };
      const body = AcknowledgeAlertSchema.parse(request.body);
      
      await adminDashboardService.acknowledgeAlert(alertId, body.acknowledgedBy);

      logger.info({
        userId: user.id,
        action: 'ADMIN_ALERT_ACKNOWLEDGED',
        alertId,
        acknowledgedBy: body.acknowledgedBy
      }, 'Admin acknowledged system alert');

      return reply.send({
        message: 'Alert acknowledged successfully'
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          error: 'Bad Request',
          message: 'Invalid request body',
          details: error.errors
        });
      }

      if (error instanceof Error && error.message === 'Alert not found') {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Alert not found'
        });
      }

      logger.error({ error }, 'Failed to acknowledge system alert');
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to acknowledge system alert'
      });
    }
  });

  /**
   * Get admin actions log
   */
  fastify.get('/dashboard/admin-actions', {
    schema: {
      tags: ['Admin Dashboard'],
      summary: 'Get admin actions log',
      description: 'Returns audit log of admin actions with optional filtering by admin ID and category',
      querystring: {
        type: 'object',
        properties: {
          adminId: { type: 'string' },
          category: { type: 'string' },
          limit: { type: 'number', minimum: 1, maximum: 500, default: 100 }
        }
      },
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              adminId: { type: 'string' },
              adminEmail: { type: 'string' },
              action: { type: 'string' },
              category: { type: 'string' },
              targetUserId: { type: 'string' },
              targetUserEmail: { type: 'string' },
              description: { type: 'string' },
              ipAddress: { type: 'string' },
              userAgent: { type: 'string' },
              success: { type: 'boolean' },
              error: { type: 'string' },
              metadata: { type: 'object' },
              timestamp: { type: 'string', format: 'date-time' }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await fastify.authenticate(request, reply);
      
      // Check if user is admin
      const user = (request as any).user;
      if (!user?.role || user.role !== 'ADMIN') {
        return reply.status(403).send({
          error: 'Forbidden',
          message: 'Admin access required'
        });
      }

      const query = GetAdminActionsSchema.parse(request.query);
      
      const actions = await adminDashboardService.getAdminActions(
        query.adminId,
        query.category,
        query.limit
      );

      logger.info({
        userId: user.id,
        action: 'ADMIN_ACTIONS_VIEWED',
        filters: query
      }, 'Admin viewed admin actions log');

      return reply.send(actions);

    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          error: 'Bad Request',
          message: 'Invalid query parameters',
          details: error.errors
        });
      }

      logger.error({ error }, 'Failed to get admin actions');
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to get admin actions'
      });
    }
  });

  /**
   * Get system health summary
   */
  fastify.get('/dashboard/health', {
    schema: {
      tags: ['Admin Dashboard'],
      summary: 'Get system health summary',
      description: 'Returns comprehensive system health status including component health, uptime, and version information',
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['healthy', 'warning', 'critical'] },
            components: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  status: { type: 'string', enum: ['healthy', 'warning', 'critical'] },
                  responseTime: { type: 'number' },
                  errorRate: { type: 'number' },
                  details: { type: 'string' }
                }
              }
            },
            uptime: { type: 'number' },
            version: { type: 'string' },
            environment: { type: 'string' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await fastify.authenticate(request, reply);
      
      // Check if user is admin
      const user = (request as any).user;
      if (!user?.role || user.role !== 'ADMIN') {
        return reply.status(403).send({
          error: 'Forbidden',
          message: 'Admin access required'
        });
      }

      const health = await adminDashboardService.getSystemHealth();

      logger.info({
        userId: user.id,
        action: 'ADMIN_SYSTEM_HEALTH_VIEWED',
        systemStatus: health.status
      }, 'Admin viewed system health');

      return reply.send(health);

    } catch (error) {
      logger.error({ error }, 'Failed to get system health');
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to get system health'
      });
    }
  });
}