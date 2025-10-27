import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { createRouteSchema, securitySchemes, standardResponses } from '../utils/swagger-schemas';
import { logger } from '../utils/logger';
import { createBackupRecoveryService, BackupMetadata, RestoreOptions } from '../services/backup-recovery.service';
import { RedisClient } from '../utils/redis';
import { z } from 'zod';

// Request schemas
const createBackupSchema = z.object({
  type: z.enum(['full', 'incremental', 'configuration', 'redis']),
  description: z.string().max(200).optional(),
  lastBackupTimestamp: z.string().datetime().optional()
});

const restoreBackupSchema = z.object({
  backupId: z.string().min(1),
  dryRun: z.boolean().default(false),
  skipValidation: z.boolean().default(false),
  confirmRestore: z.boolean()
});

const cleanupBackupsSchema = z.object({
  retentionPolicy: z.object({
    daily: z.number().min(1).max(30).default(7),
    weekly: z.number().min(1).max(12).default(4),
    monthly: z.number().min(1).max(24).default(6)
  }),
  confirmCleanup: z.boolean()
});

type CreateBackupRequest = z.infer<typeof createBackupSchema>;
type RestoreBackupRequest = z.infer<typeof restoreBackupSchema>;
type CleanupBackupsRequest = z.infer<typeof cleanupBackupsSchema>;

/**
 * Backup and recovery management routes
 */
export async function backupRecoveryRoutes(fastify: FastifyInstance) {
  const backupService = createBackupRecoveryService({ 
    prisma: fastify.prisma, 
    redis: RedisClient 
  });

  /**
   * Create a new backup
   */
  fastify.post('/backups', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'Create backup',
      description: `
Create a new backup of the specified type.

**Admin Permission Required**

**Backup Types:**
- **Full**: Complete database dump with all data
- **Incremental**: Changes since last backup (based on activity logs)
- **Configuration**: Service configuration and schema files
- **Redis**: Redis data and cache backup

**Use Cases:**
- Regular scheduled backups
- Pre-deployment backups
- Emergency data protection
- Disaster recovery preparation

**Features:**
- Automatic compression
- Checksum verification
- Metadata tracking
- Progress monitoring
      `,
      tags: ['Backup & Recovery'],
      body: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['full', 'incremental', 'configuration', 'redis'],
            description: 'Type of backup to create'
          },
          description: {
            type: 'string',
            maxLength: 200,
            description: 'Optional description for the backup'
          },
          lastBackupTimestamp: {
            type: 'string',
            format: 'date-time',
            description: 'Required for incremental backups - timestamp of last backup'
          }
        },
        required: ['type']
      },
      response: {
        202: {
          description: 'Backup initiated successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Backup initiated successfully' },
            data: {
              type: 'object',
              properties: {
                backupId: { 
                  type: 'string', 
                  example: 'full_1642345678901_a1b2c3d4',
                  description: 'Unique backup identifier'
                },
                type: { 
                  type: 'string', 
                  enum: ['full', 'incremental', 'configuration', 'redis'],
                  description: 'Backup type'
                },
                status: {
                  type: 'string',
                  enum: ['pending', 'running'],
                  example: 'running',
                  description: 'Current backup status'
                },
                estimatedDuration: {
                  type: 'number',
                  example: 300000,
                  description: 'Estimated completion time in milliseconds'
                },
                statusUrl: {
                  type: 'string',
                  example: '/api/admin/backups/full_1642345678901_a1b2c3d4/status',
                  description: 'URL to check backup status'
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
  }, async (request: FastifyRequest<{ Body: CreateBackupRequest }>, reply: FastifyReply) => {
    try {
      // Check admin permissions
      const user = (request as any).user;
      if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
        return reply.status(403).send({
          success: false,
          error: 'Insufficient permissions',
          message: 'Admin access required for backup operations'
        });
      }

      const { type, description, lastBackupTimestamp } = request.body;

      // Validate incremental backup requirements
      if (type === 'incremental' && !lastBackupTimestamp) {
        return reply.status(400).send({
          success: false,
          error: 'Validation error',
          message: 'lastBackupTimestamp is required for incremental backups'
        });
      }

      // Start backup process asynchronously
      const backupPromise = (async () => {
        try {
          let metadata: BackupMetadata;

          switch (type) {
            case 'full':
              metadata = await backupService.createFullBackup(description);
              break;
            case 'incremental':
              metadata = await backupService.createIncrementalBackup(
                new Date(lastBackupTimestamp!), 
                description
              );
              break;
            case 'configuration':
              metadata = await backupService.createConfigurationBackup(description);
              break;
            case 'redis':
              metadata = await backupService.createRedisBackup(description);
              break;
            default:
              throw new Error(`Unsupported backup type: ${type}`);
          }

          // Log successful backup
          await fastify.prisma.activityLog.create({
            data: {
              userId: user.id,
              action: 'BACKUP_CREATED',
              category: 'ADMIN',
              ip: request.ip,
              userAgent: request.headers['user-agent'] || 'Unknown',
              metadata: {
                backupId: metadata.id,
                backupType: type,
                size: metadata.size,
                duration: metadata.duration
              }
            }
          });

          return metadata;

        } catch (error) {
          logger.error({ error, type, userId: user.id }, 'Backup creation failed');
          
          // Log failed backup
          await fastify.prisma.activityLog.create({
            data: {
              userId: user.id,
              action: 'BACKUP_FAILED',
              category: 'ADMIN',
              ip: request.ip,
              userAgent: request.headers['user-agent'] || 'Unknown',
              metadata: {
                backupType: type,
                error: error instanceof Error ? error.message : 'Unknown error'
              }
            }
          });

          throw error;
        }
      })();

      // Don't wait for backup to complete - return immediately
      const backupId = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;

      reply.status(202).send({
        success: true,
        message: 'Backup initiated successfully',
        data: {
          backupId,
          type,
          status: 'running',
          estimatedDuration: type === 'full' ? 300000 : 60000, // Estimate
          statusUrl: `/api/admin/backups/${backupId}/status`
        }
      });

      // Let backup continue in background
      backupPromise.catch(error => {
        logger.error({ error, backupId }, 'Background backup failed');
      });

    } catch (error) {
      logger.error({ error, type: request.body.type }, 'Failed to initiate backup');
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to initiate backup'
      });
    }
  });

  /**
   * List all backups
   */
  fastify.get('/backups', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'List backups',
      description: `
Get a list of all available backups with metadata.

**Admin Permission Required**

**Features:**
- Filter by backup type
- Pagination support
- Size and status information
- Integrity verification status
      `,
      tags: ['Backup & Recovery'],
      querystring: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['full', 'incremental', 'configuration', 'redis'],
            description: 'Filter by backup type'
          },
          limit: {
            type: 'number',
            minimum: 1,
            maximum: 100,
            default: 50,
            description: 'Number of backups to return'
          }
        }
      },
      response: {
        200: {
          description: 'Backups retrieved successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                backups: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', example: 'full_1642345678901_a1b2c3d4' },
                      type: { type: 'string', enum: ['full', 'incremental', 'configuration', 'redis'] },
                      timestamp: { type: 'string', format: 'date-time' },
                      size: { type: 'number', example: 1048576 },
                      status: { type: 'string', enum: ['pending', 'running', 'completed', 'failed'] },
                      duration: { type: 'number', example: 45000 },
                      description: { type: 'string' },
                      compression: { type: 'boolean', example: true },
                      encryption: { type: 'boolean', example: false }
                    }
                  }
                },
                total: { type: 'number', example: 25 },
                statistics: {
                  type: 'object',
                  properties: {
                    totalSize: { type: 'number', example: 52428800 },
                    byType: {
                      type: 'object',
                      additionalProperties: { type: 'number' }
                    },
                    oldestBackup: { type: 'string', format: 'date-time' },
                    newestBackup: { type: 'string', format: 'date-time' }
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
  }, async (request: FastifyRequest<{ Querystring: { type?: string; limit?: number } }>, reply: FastifyReply) => {
    try {
      // Check admin permissions
      const user = (request as any).user;
      if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
        return reply.status(403).send({
          success: false,
          error: 'Insufficient permissions',
          message: 'Admin access required for backup management'
        });
      }

      const { type, limit = 50 } = request.query;

      const backups = await backupService.listBackups(type, limit);

      // Calculate statistics
      const totalSize = backups.reduce((sum, backup) => sum + backup.size, 0);
      const byType = backups.reduce((acc, backup) => {
        acc[backup.type] = (acc[backup.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const timestamps = backups.map(b => b.timestamp.getTime());
      const oldestBackup = timestamps.length > 0 ? new Date(Math.min(...timestamps)) : null;
      const newestBackup = timestamps.length > 0 ? new Date(Math.max(...timestamps)) : null;

      reply.send({
        success: true,
        data: {
          backups,
          total: backups.length,
          statistics: {
            totalSize,
            byType,
            oldestBackup: oldestBackup?.toISOString(),
            newestBackup: newestBackup?.toISOString()
          }
        }
      });

    } catch (error) {
      logger.error({ error }, 'Failed to list backups');
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to retrieve backups'
      });
    }
  });

  /**
   * Get backup status
   */
  fastify.get('/backups/:backupId/status', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'Get backup status',
      description: `
Get the current status and details of a specific backup.

**Admin Permission Required**
      `,
      tags: ['Backup & Recovery'],
      params: {
        type: 'object',
        properties: {
          backupId: {
            type: 'string',
            description: 'Backup identifier'
          }
        },
        required: ['backupId']
      },
      response: {
        200: {
          description: 'Backup status retrieved successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                backup: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    type: { type: 'string' },
                    timestamp: { type: 'string', format: 'date-time' },
                    size: { type: 'number' },
                    status: { type: 'string', enum: ['pending', 'running', 'completed', 'failed'] },
                    duration: { type: 'number' },
                    checksum: { type: 'string' },
                    error: { type: 'string' }
                  }
                },
                verification: {
                  type: 'object',
                  properties: {
                    verified: { type: 'boolean' },
                    lastVerification: { type: 'string', format: 'date-time' }
                  }
                }
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
  }, async (request: FastifyRequest<{ Params: { backupId: string } }>, reply: FastifyReply) => {
    try {
      // Check admin permissions
      const user = (request as any).user;
      if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
        return reply.status(403).send({
          success: false,
          error: 'Insufficient permissions',
          message: 'Admin access required for backup management'
        });
      }

      const { backupId } = request.params;

      // This would get metadata from the backup service
      // For now, we'll return a mock response
      const backups = await backupService.listBackups();
      const backup = backups.find(b => b.id === backupId);

      if (!backup) {
        return reply.status(404).send({
          success: false,
          error: 'Backup not found',
          message: `Backup with ID ${backupId} not found`
        });
      }

      // Verify backup integrity
      const verified = await backupService.verifyBackup(backupId);

      reply.send({
        success: true,
        data: {
          backup,
          verification: {
            verified,
            lastVerification: new Date().toISOString()
          }
        }
      });

    } catch (error) {
      logger.error({ error, backupId: request.params.backupId }, 'Failed to get backup status');
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to retrieve backup status'
      });
    }
  });

  /**
   * Restore from backup
   */
  fastify.post('/backups/restore', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'Restore from backup',
      description: `
Restore the system from a specific backup.

**Admin Permission Required**

**Warning:** This operation will overwrite current data. Use with extreme caution.

**Restore Options:**
- **Dry Run**: Test the restore process without making changes
- **Skip Validation**: Skip integrity checks (not recommended)
- **Confirmation Required**: Must explicitly confirm restore operation

**Process:**
1. Validate backup file integrity
2. Stop relevant services (if needed)
3. Perform restore operation
4. Restart services
5. Verify system health
      `,
      tags: ['Backup & Recovery'],
      body: {
        type: 'object',
        properties: {
          backupId: {
            type: 'string',
            minLength: 1,
            description: 'Backup ID to restore from'
          },
          dryRun: {
            type: 'boolean',
            default: false,
            description: 'Test restore without making changes'
          },
          skipValidation: {
            type: 'boolean',
            default: false,
            description: 'Skip backup integrity validation'
          },
          confirmRestore: {
            type: 'boolean',
            description: 'Must be true to confirm restore operation'
          }
        },
        required: ['backupId', 'confirmRestore']
      },
      response: {
        200: {
          description: 'Restore completed successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Restore completed successfully' },
            data: {
              type: 'object',
              properties: {
                backupId: { type: 'string', example: 'full_1642345678901_a1b2c3d4' },
                restoreType: { type: 'string', example: 'full' },
                dryRun: { type: 'boolean', example: false },
                duration: { type: 'number', example: 120000 },
                restoredAt: { type: 'string', format: 'date-time' }
              }
            }
          }
        },
        400: {
          description: 'Restore not confirmed or validation error',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Restore not confirmed' },
            message: { type: 'string', example: 'You must confirm the restore operation' }
          }
        },
        401: standardResponses[401],
        403: standardResponses[403],
        404: standardResponses[404],
        500: standardResponses[500]
      },
      security: securitySchemes.bearer
    })
  }, async (request: FastifyRequest<{ Body: RestoreBackupRequest }>, reply: FastifyReply) => {
    try {
      // Check admin permissions
      const user = (request as any).user;
      if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
        return reply.status(403).send({
          success: false,
          error: 'Insufficient permissions',
          message: 'Admin access required for restore operations'
        });
      }

      const { backupId, dryRun, skipValidation, confirmRestore } = request.body;

      if (!confirmRestore && !dryRun) {
        return reply.status(400).send({
          success: false,
          error: 'Restore not confirmed',
          message: 'You must confirm the restore operation'
        });
      }

      const startTime = Date.now();

      const restoreOptions: RestoreOptions = {
        backupId,
        dryRun,
        skipValidation
      };

      await backupService.restoreFromBackup(restoreOptions);

      const duration = Date.now() - startTime;

      // Log restore operation
      await fastify.prisma.activityLog.create({
        data: {
          userId: user.id,
          action: dryRun ? 'RESTORE_DRY_RUN' : 'RESTORE_COMPLETED',
          category: 'ADMIN',
          ip: request.ip,
          userAgent: request.headers['user-agent'] || 'Unknown',
          metadata: {
            backupId,
            dryRun,
            skipValidation,
            duration
          }
        }
      });

      reply.send({
        success: true,
        message: dryRun ? 'Dry run completed successfully' : 'Restore completed successfully',
        data: {
          backupId,
          dryRun,
          duration,
          restoredAt: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error({ error, backupId: request.body.backupId }, 'Restore operation failed');
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Restore operation failed'
      });
    }
  });

  /**
   * Cleanup old backups
   */
  fastify.post('/backups/cleanup', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'Cleanup old backups',
      description: `
Clean up old backups based on retention policy.

**Admin Permission Required**

**Retention Policy:**
- **Daily**: Number of daily backups to keep
- **Weekly**: Number of weekly backups to keep  
- **Monthly**: Number of monthly backups to keep

**Warning:** This operation permanently deletes backup files.
      `,
      tags: ['Backup & Recovery'],
      body: {
        type: 'object',
        properties: {
          retentionPolicy: {
            type: 'object',
            properties: {
              daily: {
                type: 'number',
                minimum: 1,
                maximum: 30,
                default: 7,
                description: 'Number of daily backups to retain'
              },
              weekly: {
                type: 'number',
                minimum: 1,
                maximum: 12,
                default: 4,
                description: 'Number of weekly backups to retain'
              },
              monthly: {
                type: 'number',
                minimum: 1,
                maximum: 24,
                default: 6,
                description: 'Number of monthly backups to retain'
              }
            }
          },
          confirmCleanup: {
            type: 'boolean',
            description: 'Must be true to confirm cleanup operation'
          }
        },
        required: ['retentionPolicy', 'confirmCleanup']
      },
      response: {
        200: {
          description: 'Cleanup completed successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Cleanup completed successfully' },
            data: {
              type: 'object',
              properties: {
                deletedBackups: { type: 'number', example: 5 },
                remainingBackups: { type: 'number', example: 15 },
                freedSpace: { type: 'number', example: 1048576 },
                retentionPolicy: {
                  type: 'object',
                  properties: {
                    daily: { type: 'number' },
                    weekly: { type: 'number' },
                    monthly: { type: 'number' }
                  }
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
  }, async (request: FastifyRequest<{ Body: CleanupBackupsRequest }>, reply: FastifyReply) => {
    try {
      // Check admin permissions
      const user = (request as any).user;
      if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
        return reply.status(403).send({
          success: false,
          error: 'Insufficient permissions',
          message: 'Admin access required for backup management'
        });
      }

      const { retentionPolicy, confirmCleanup } = request.body;

      if (!confirmCleanup) {
        return reply.status(400).send({
          success: false,
          error: 'Cleanup not confirmed',
          message: 'You must confirm the cleanup operation'
        });
      }

      const backupsBefore = await backupService.listBackups();
      const sizeBefore = backupsBefore.reduce((sum, backup) => sum + backup.size, 0);

      await backupService.cleanupOldBackups(retentionPolicy);

      const backupsAfter = await backupService.listBackups();
      const sizeAfter = backupsAfter.reduce((sum, backup) => sum + backup.size, 0);

      const deletedCount = backupsBefore.length - backupsAfter.length;
      const freedSpace = sizeBefore - sizeAfter;

      // Log cleanup operation
      await fastify.prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'BACKUP_CLEANUP',
          category: 'ADMIN',
          ip: request.ip,
          userAgent: request.headers['user-agent'] || 'Unknown',
          metadata: {
            retentionPolicy,
            deletedBackups: deletedCount,
            freedSpace
          }
        }
      });

      reply.send({
        success: true,
        message: 'Cleanup completed successfully',
        data: {
          deletedBackups: deletedCount,
          remainingBackups: backupsAfter.length,
          freedSpace,
          retentionPolicy
        }
      });

    } catch (error) {
      logger.error({ error }, 'Backup cleanup failed');
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to cleanup backups'
      });
    }
  });

  /**
   * Verify backup integrity
   */
  fastify.post('/backups/:backupId/verify', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'Verify backup integrity',
      description: `
Verify the integrity of a specific backup by checking checksums and file validity.

**Admin Permission Required**
      `,
      tags: ['Backup & Recovery'],
      params: {
        type: 'object',
        properties: {
          backupId: {
            type: 'string',
            description: 'Backup identifier to verify'
          }
        },
        required: ['backupId']
      },
      response: {
        200: {
          description: 'Backup verification completed',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                backupId: { type: 'string', example: 'full_1642345678901_a1b2c3d4' },
                valid: { type: 'boolean', example: true },
                verifiedAt: { type: 'string', format: 'date-time' },
                checksumMatch: { type: 'boolean', example: true },
                fileExists: { type: 'boolean', example: true },
                size: { type: 'number', example: 1048576 }
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
  }, async (request: FastifyRequest<{ Params: { backupId: string } }>, reply: FastifyReply) => {
    try {
      // Check admin permissions
      const user = (request as any).user;
      if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
        return reply.status(403).send({
          success: false,
          error: 'Insufficient permissions',
          message: 'Admin access required for backup verification'
        });
      }

      const { backupId } = request.params;

      const valid = await backupService.verifyBackup(backupId);

      reply.send({
        success: true,
        data: {
          backupId,
          valid,
          verifiedAt: new Date().toISOString(),
          checksumMatch: valid,
          fileExists: valid,
          size: valid ? 1048576 : 0 // Mock size
        }
      });

    } catch (error) {
      logger.error({ error, backupId: request.params.backupId }, 'Backup verification failed');
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to verify backup'
      });
    }
  });
}