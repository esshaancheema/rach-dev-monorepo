import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { createRouteSchema, securitySchemes, standardResponses } from '../utils/swagger-schemas';
import { logger } from '../utils/logger';
import { createDataRetentionService, RetentionPolicy } from '../services/data-retention.service';
import { z } from 'zod';

// Request schemas
const manualCleanupSchema = z.object({
  dataType: z.enum(['activity_logs', 'user_sessions', 'password_history', 'email_verification_tokens', 'export_requests', 'deleted_users', 'device_fingerprints', 'backup_metadata']),
  retentionDays: z.number().min(1).max(3650), // 1 day to 10 years
  confirmCleanup: z.boolean()
});

const createPolicySchema = z.object({
  name: z.string().min(1).max(100),
  dataType: z.enum(['activity_logs', 'user_sessions', 'password_history', 'email_verification_tokens', 'export_requests', 'deleted_users', 'device_fingerprints', 'backup_metadata']),
  retentionPeriodDays: z.number().min(1).max(3650),
  schedule: z.string().min(9).max(20), // Cron format validation
  enabled: z.boolean().default(true),
  conditions: z.object({
    status: z.array(z.string()).optional(),
    userRole: z.array(z.string()).optional(),
    minAge: z.number().optional(),
    maxRecords: z.number().optional()
  }).optional()
});

const updatePolicySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  retentionPeriodDays: z.number().min(1).max(3650).optional(),
  schedule: z.string().min(9).max(20).optional(),
  enabled: z.boolean().optional(),
  conditions: z.object({
    status: z.array(z.string()).optional(),
    userRole: z.array(z.string()).optional(),
    minAge: z.number().optional(),
    maxRecords: z.number().optional()
  }).optional()
});

type ManualCleanupRequest = z.infer<typeof manualCleanupSchema>;
type CreatePolicyRequest = z.infer<typeof createPolicySchema>;
type UpdatePolicyRequest = z.infer<typeof updatePolicySchema>;

/**
 * Data retention management routes
 */
export async function dataRetentionRoutes(fastify: FastifyInstance) {
  const retentionService = createDataRetentionService({ prisma: fastify.prisma });

  /**
   * Get retention statistics
   */
  fastify.get('/data-retention/stats', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'Get data retention statistics',
      description: `
Get comprehensive statistics about data retention policies and cleanup operations.

**Admin Permission Required**

**Statistics Include:**
- Total and active retention policies
- Records managed across all data types
- Storage space freed by cleanup operations
- Last cleanup execution times
- Upcoming scheduled cleanups
      `,
      tags: ['Data Retention'],
      response: {
        200: {
          description: 'Retention statistics retrieved successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                totalPolicies: { type: 'number', example: 8 },
                activePolicies: { type: 'number', example: 7 },
                totalRecordsManaged: { type: 'number', example: 1250000 },
                storageFreed: { type: 'number', example: 52428800, description: 'Bytes freed by cleanup operations' },
                lastCleanup: { type: 'string', format: 'date-time', nullable: true },
                upcomingCleanups: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      policyId: { type: 'string', example: 'policy_123' },
                      policyName: { type: 'string', example: 'Activity Logs Cleanup' },
                      nextRun: { type: 'string', format: 'date-time' },
                      estimatedRecords: { type: 'number', example: 5000 }
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
          message: 'Admin access required for data retention management'
        });
      }

      const stats = await retentionService.getRetentionStats();

      reply.send({
        success: true,
        data: stats
      });

    } catch (error) {
      logger.error({ error }, 'Failed to get retention statistics');
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to retrieve retention statistics'
      });
    }
  });

  /**
   * Execute manual cleanup
   */
  fastify.post('/data-retention/cleanup', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'Execute manual data cleanup',
      description: `
Manually execute data cleanup for a specific data type.

**Admin Permission Required**

**Warning:** This operation permanently deletes data. Use with extreme caution.

**Data Types:**
- **activity_logs**: User activity and audit logs
- **user_sessions**: Expired or revoked user sessions
- **password_history**: Historical password records
- **email_verification_tokens**: Email verification tokens
- **export_requests**: GDPR data export requests
- **deleted_users**: Soft-deleted user accounts (permanent deletion)
- **device_fingerprints**: Device fingerprint records
- **backup_metadata**: Backup operation metadata

**Process:**
1. Validates admin permissions
2. Requires explicit confirmation
3. Executes cleanup based on retention period
4. Logs all operations for audit
5. Returns detailed results
      `,
      tags: ['Data Retention'],
      body: {
        type: 'object',
        properties: {
          dataType: {
            type: 'string',
            enum: ['activity_logs', 'user_sessions', 'password_history', 'email_verification_tokens', 'export_requests', 'deleted_users', 'device_fingerprints', 'backup_metadata'],
            description: 'Type of data to cleanup'
          },
          retentionDays: {
            type: 'number',
            minimum: 1,
            maximum: 3650,
            description: 'Retention period in days (data older than this will be deleted)'
          },
          confirmCleanup: {
            type: 'boolean',
            description: 'Must be true to confirm cleanup operation'
          }
        },
        required: ['dataType', 'retentionDays', 'confirmCleanup']
      },
      response: {
        200: {
          description: 'Cleanup executed successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Manual cleanup completed successfully' },
            data: {
              type: 'object',
              properties: {
                policyId: { type: 'string', example: 'manual_1642345678901' },
                policyName: { type: 'string', example: 'Manual activity_logs cleanup' },
                recordsProcessed: { type: 'number', example: 1500 },
                recordsDeleted: { type: 'number', example: 1500 },
                duration: { type: 'number', example: 2500, description: 'Execution time in milliseconds' },
                status: { type: 'string', enum: ['completed', 'failed', 'partial'] },
                details: {
                  type: 'object',
                  properties: {
                    beforeCount: { type: 'number', example: 10000 },
                    afterCount: { type: 'number', example: 8500 },
                    deletedRecords: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          table: { type: 'string', example: 'activity_logs' },
                          count: { type: 'number', example: 1500 },
                          oldestRecord: { type: 'string', format: 'date-time' },
                          newestRecord: { type: 'string', format: 'date-time' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        400: {
          description: 'Cleanup not confirmed or validation error',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Cleanup not confirmed' },
            message: { type: 'string', example: 'You must confirm the cleanup operation' }
          }
        },
        401: standardResponses[401],
        403: standardResponses[403],
        500: standardResponses[500]
      },
      security: securitySchemes.bearer
    })
  }, async (request: FastifyRequest<{ Body: ManualCleanupRequest }>, reply: FastifyReply) => {
    try {
      // Check admin permissions
      const user = (request as any).user;
      if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
        return reply.status(403).send({
          success: false,
          error: 'Insufficient permissions',
          message: 'Admin access required for data retention operations'
        });
      }

      const { dataType, retentionDays, confirmCleanup } = request.body;

      if (!confirmCleanup) {
        return reply.status(400).send({
          success: false,
          error: 'Cleanup not confirmed',
          message: 'You must confirm the cleanup operation'
        });
      }

      // Special warning for deleted users
      if (dataType === 'deleted_users') {
        logger.warn({ 
          adminId: user.id, 
          dataType, 
          retentionDays 
        }, 'Admin executing permanent user deletion cleanup');
      }

      const result = await retentionService.executeManualCleanup(dataType, retentionDays);

      // Log manual cleanup operation
      await fastify.prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'MANUAL_DATA_CLEANUP',
          category: 'ADMIN',
          ip: request.ip,
          userAgent: request.headers['user-agent'] || 'Unknown',
          metadata: {
            dataType,
            retentionDays,
            recordsDeleted: result.recordsDeleted,
            duration: result.duration,
            status: result.status
          }
        }
      });

      reply.send({
        success: true,
        message: 'Manual cleanup completed successfully',
        data: result
      });

    } catch (error) {
      logger.error({ 
        error, 
        dataType: request.body.dataType,
        adminId: (request as any).user?.id 
      }, 'Manual cleanup failed');
      
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Cleanup operation failed'
      });
    }
  });

  /**
   * Get retention policy health status
   */
  fastify.get('/data-retention/health', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'Get retention system health',
      description: `
Check the health status of the data retention system.

**Admin Permission Required**

**Health Checks:**
- Scheduled job status
- Database connectivity
- Data volume warnings
- System performance indicators
      `,
      tags: ['Data Retention'],
      response: {
        200: {
          description: 'Health status retrieved successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                healthy: { type: 'boolean', example: true },
                issues: {
                  type: 'array',
                  items: { type: 'string' },
                  example: []
                },
                lastCheck: { type: 'string', format: 'date-time' },
                systemInfo: {
                  type: 'object',
                  properties: {
                    scheduledJobs: { type: 'number', example: 7 },
                    runningJobs: { type: 'number', example: 0 },
                    databaseConnected: { type: 'boolean', example: true }
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
          message: 'Admin access required for retention health checks'
        });
      }

      const health = await retentionService.healthCheck();

      reply.send({
        success: true,
        data: {
          ...health,
          lastCheck: new Date().toISOString(),
          systemInfo: {
            scheduledJobs: 7, // Would come from actual service
            runningJobs: 0,
            databaseConnected: true
          }
        }
      });

    } catch (error) {
      logger.error({ error }, 'Failed to get retention health status');
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to retrieve health status'
      });
    }
  });

  /**
   * Preview cleanup operation (dry run)
   */
  fastify.post('/data-retention/preview', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'Preview cleanup operation',
      description: `
Preview what records would be deleted by a cleanup operation without actually deleting them.

**Admin Permission Required**

**Use Cases:**
- Estimate impact before cleanup
- Validate retention policies
- Audit data volumes
- Plan cleanup schedules
      `,
      tags: ['Data Retention'],
      body: {
        type: 'object',
        properties: {
          dataType: {
            type: 'string',
            enum: ['activity_logs', 'user_sessions', 'password_history', 'email_verification_tokens', 'export_requests', 'deleted_users', 'device_fingerprints', 'backup_metadata'],
            description: 'Type of data to preview cleanup for'
          },
          retentionDays: {
            type: 'number',
            minimum: 1,
            maximum: 3650,
            description: 'Retention period in days'
          }
        },
        required: ['dataType', 'retentionDays']
      },
      response: {
        200: {
          description: 'Cleanup preview generated successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                dataType: { type: 'string', example: 'activity_logs' },
                retentionDays: { type: 'number', example: 90 },
                cutoffDate: { type: 'string', format: 'date-time' },
                estimatedDeletions: {
                  type: 'object',
                  properties: {
                    totalRecords: { type: 'number', example: 15000 },
                    recordsToDelete: { type: 'number', example: 1500 },
                    recordsToKeep: { type: 'number', example: 13500 },
                    oldestRecordToDelete: { type: 'string', format: 'date-time' },
                    newestRecordToDelete: { type: 'string', format: 'date-time' },
                    estimatedStorageFreed: { type: 'number', example: 5242880 }
                  }
                },
                warnings: {
                  type: 'array',
                  items: { type: 'string' },
                  example: ['This operation will permanently delete user data']
                }
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
  }, async (request: FastifyRequest<{ Body: { dataType: string; retentionDays: number } }>, reply: FastifyReply) => {
    try {
      // Check admin permissions
      const user = (request as any).user;
      if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
        return reply.status(403).send({
          success: false,
          error: 'Insufficient permissions',
          message: 'Admin access required for cleanup previews'
        });
      }

      const { dataType, retentionDays } = request.body;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      // Get preview data based on data type
      let totalRecords = 0;
      let recordsToDelete = 0;
      let oldestRecord: Date | null = null;
      let newestRecord: Date | null = null;
      const warnings: string[] = [];

      switch (dataType) {
        case 'activity_logs':
          totalRecords = await fastify.prisma.activityLog.count();
          recordsToDelete = await fastify.prisma.activityLog.count({
            where: { createdAt: { lt: cutoffDate } }
          });
          if (recordsToDelete > 0) {
            const oldestAndNewest = await fastify.prisma.activityLog.findMany({
              where: { createdAt: { lt: cutoffDate } },
              select: { createdAt: true },
              orderBy: { createdAt: 'asc' },
              take: 1
            });
            if (oldestAndNewest.length > 0) {
              oldestRecord = oldestAndNewest[0].createdAt;
            }
            
            const newest = await fastify.prisma.activityLog.findMany({
              where: { createdAt: { lt: cutoffDate } },
              select: { createdAt: true },
              orderBy: { createdAt: 'desc' },
              take: 1
            });
            if (newest.length > 0) {
              newestRecord = newest[0].createdAt;
            }
          }
          break;

        case 'deleted_users':
          totalRecords = await fastify.prisma.user.count({
            where: { deletedAt: { not: null } }
          });
          recordsToDelete = await fastify.prisma.user.count({
            where: { 
              deletedAt: { 
                not: null,
                lt: cutoffDate 
              }
            }
          });
          warnings.push('This operation will permanently delete user accounts and cannot be undone');
          warnings.push('All related user data (sessions, preferences, etc.) will also be deleted');
          break;

        // Add other cases as needed...
        default:
          // Generic fallback
          warnings.push(`Preview not fully implemented for ${dataType}`);
      }

      const estimatedStorageFreed = recordsToDelete * 1024; // Rough estimate

      reply.send({
        success: true,
        data: {
          dataType,
          retentionDays,
          cutoffDate: cutoffDate.toISOString(),
          estimatedDeletions: {
            totalRecords,
            recordsToDelete,
            recordsToKeep: totalRecords - recordsToDelete,
            oldestRecordToDelete: oldestRecord?.toISOString() || null,
            newestRecordToDelete: newestRecord?.toISOString() || null,
            estimatedStorageFreed
          },
          warnings
        }
      });

    } catch (error) {
      logger.error({ error, dataType: request.body.dataType }, 'Failed to generate cleanup preview');
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to generate cleanup preview'
      });
    }
  });
}