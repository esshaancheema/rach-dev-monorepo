import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { createRouteSchema, securitySchemes, standardResponses } from '../utils/swagger-schemas';
import { logger } from '../utils/logger';
import { createUserExportService } from '../services/user-export.service';
import { z } from 'zod';

// Request schemas
const exportRequestSchema = z.object({
  format: z.enum(['json', 'csv', 'archive']).default('json'),
  anonymize: z.boolean().default(false)
});

type ExportRequest = z.infer<typeof exportRequestSchema>;

/**
 * User data export routes for GDPR compliance
 */
export async function userExportRoutes(fastify: FastifyInstance) {
  const userExportService = createUserExportService({ prisma: fastify.prisma });

  /**
   * Request user data export
   */
  fastify.post('/export', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'Request personal data export',
      description: `
Request an export of all personal data associated with the authenticated user's account.

**GDPR Compliance:**
This endpoint fulfills the requirements of GDPR Article 15 - Right of access by the data subject.

**Export Formats:**
- **JSON**: Complete structured data in JSON format
- **CSV**: Simplified tabular format for spreadsheet applications
- **Archive**: ZIP file containing all data with documentation

**Data Included:**
- Profile information
- Authentication data and history
- Active sessions
- Login history
- Activity logs
- Preferences and settings
- Consent records
- Data processing information

**Privacy Options:**
- Set anonymize=true to redact sensitive information
- Exports are automatically deleted after download for security

**Rate Limiting:**
Users can request exports up to 3 times per month to prevent abuse.
      `,
      tags: ['User Export'],
      body: {
        type: 'object',
        properties: {
          format: {
            type: 'string',
            enum: ['json', 'csv', 'archive'],
            default: 'json',
            description: 'Export format'
          },
          anonymize: {
            type: 'boolean',
            default: false,
            description: 'Anonymize sensitive data in export'
          }
        }
      },
      response: {
        200: {
          description: 'Export initiated successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Data export initiated' },
            data: {
              type: 'object',
              properties: {
                exportId: { 
                  type: 'string', 
                  example: 'export_1642345678901_a1b2c3d4',
                  description: 'Unique export identifier'
                },
                format: { 
                  type: 'string', 
                  enum: ['json', 'csv', 'archive'],
                  description: 'Requested export format'
                },
                status: {
                  type: 'string',
                  enum: ['ready', 'processing'],
                  example: 'ready',
                  description: 'Export status'
                },
                downloadUrl: {
                  type: 'string',
                  example: '/api/users/export/download/export_1642345678901_a1b2c3d4',
                  description: 'URL to download the export'
                },
                expiresAt: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Export expiration time (1 hour)'
                }
              }
            }
          }
        },
        401: standardResponses[401],
        429: {
          description: 'Rate limit exceeded',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Rate limit exceeded' },
            message: { type: 'string', example: 'You can only request 3 exports per month' },
            nextAvailable: { type: 'string', format: 'date-time' }
          }
        },
        500: standardResponses[500]
      },
      security: securitySchemes.bearer
    })
  }, async (request: FastifyRequest<{ Body: ExportRequest }>, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      const { format = 'json', anonymize = false } = request.body;

      // Check rate limit (3 exports per month)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentExports = await fastify.prisma.activityLog.count({
        where: {
          userId: user.id,
          action: 'USER_DATA_EXPORT',
          category: 'PRIVACY',
          createdAt: {
            gte: thirtyDaysAgo
          }
        }
      });

      if (recentExports >= 3) {
        return reply.status(429).send({
          success: false,
          error: 'Rate limit exceeded',
          message: 'You can only request 3 exports per month',
          nextAvailable: new Date(thirtyDaysAgo.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });
      }

      // Generate export based on format
      let exportBuffer: Buffer;
      let contentType: string;
      let fileName: string;

      switch (format) {
        case 'csv':
          exportBuffer = await userExportService.exportAsCsv({ userId: user.id, format, anonymize });
          contentType = 'text/csv';
          fileName = `user-data-export-${user.id}.csv`;
          break;
        case 'archive':
          exportBuffer = await userExportService.exportAsArchive({ userId: user.id, format, anonymize });
          contentType = 'application/zip';
          fileName = `user-data-export-${user.id}.zip`;
          break;
        default:
          exportBuffer = await userExportService.exportAsJson({ userId: user.id, format, anonymize });
          contentType = 'application/json';
          fileName = `user-data-export-${user.id}.json`;
      }

      // Store export temporarily (in real implementation, this would be in object storage)
      const exportData = await userExportService.exportUserData({ userId: user.id, format, anonymize });
      const exportId = exportData.exportId;

      // Cache the export for 1 hour
      await fastify.cache.set(
        `user_export:${exportId}`,
        {
          buffer: exportBuffer.toString('base64'),
          contentType,
          fileName,
          userId: user.id
        },
        3600 // 1 hour TTL
      );

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      reply.send({
        success: true,
        message: 'Data export initiated',
        data: {
          exportId,
          format,
          status: 'ready',
          downloadUrl: `/api/users/export/download/${exportId}`,
          expiresAt: expiresAt.toISOString()
        }
      });

    } catch (error) {
      logger.error({ error, userId: (request as any).user.id }, 'Failed to initiate user data export');
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to initiate data export'
      });
    }
  });

  /**
   * Download user data export
   */
  fastify.get('/export/download/:exportId', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'Download personal data export',
      description: `
Download a previously requested data export.

**Security:**
- Export must belong to the authenticated user
- Exports expire after 1 hour
- Export is deleted after successful download

**Response:**
Returns the export file with appropriate content type and headers.
      `,
      tags: ['User Export'],
      params: {
        type: 'object',
        properties: {
          exportId: {
            type: 'string',
            pattern: '^export_\\d+_[a-f0-9]{8}$',
            description: 'Export identifier'
          }
        },
        required: ['exportId']
      },
      response: {
        200: {
          description: 'Export file download',
          content: {
            'application/json': {
              schema: { type: 'string', format: 'binary' }
            },
            'text/csv': {
              schema: { type: 'string', format: 'binary' }
            },
            'application/zip': {
              schema: { type: 'string', format: 'binary' }
            }
          }
        },
        401: standardResponses[401],
        403: {
          description: 'Access denied',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Access denied' },
            message: { type: 'string', example: 'This export does not belong to you' }
          }
        },
        404: {
          description: 'Export not found or expired',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Export not found' },
            message: { type: 'string', example: 'Export not found or has expired' }
          }
        },
        500: standardResponses[500]
      },
      security: securitySchemes.bearer
    })
  }, async (request: FastifyRequest<{ Params: { exportId: string } }>, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      const { exportId } = request.params;

      // Retrieve export from cache
      const exportData = await fastify.cache.get(`user_export:${exportId}`);

      if (!exportData) {
        return reply.status(404).send({
          success: false,
          error: 'Export not found',
          message: 'Export not found or has expired'
        });
      }

      // Verify export belongs to user
      if (exportData.userId !== user.id) {
        return reply.status(403).send({
          success: false,
          error: 'Access denied',
          message: 'This export does not belong to you'
        });
      }

      // Convert base64 back to buffer
      const buffer = Buffer.from(exportData.buffer, 'base64');

      // Set headers for download
      reply.header('Content-Type', exportData.contentType);
      reply.header('Content-Disposition', `attachment; filename="${exportData.fileName}"`);
      reply.header('Content-Length', buffer.length);

      // Delete export after download
      await fastify.cache.del(`user_export:${exportId}`);
      await userExportService.cleanupExport(exportId, user.id);

      return reply.send(buffer);

    } catch (error) {
      logger.error({ error, exportId: request.params.exportId }, 'Failed to download user data export');
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to download export'
      });
    }
  });

  /**
   * Get user export history
   */
  fastify.get('/export/history', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'Get export history',
      description: `
Get the history of data export requests for the authenticated user.

**Information Provided:**
- Export ID and date
- Format requested
- Whether data was anonymized
- Total records exported

**Retention:**
Export history is retained for audit purposes but actual export files are deleted after download.
      `,
      tags: ['User Export'],
      response: {
        200: {
          description: 'Export history retrieved successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                exports: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      exportId: { type: 'string', example: 'export_1642345678901_a1b2c3d4' },
                      exportDate: { type: 'string', format: 'date-time' },
                      format: { type: 'string', enum: ['json', 'csv', 'archive'] },
                      anonymized: { type: 'boolean' },
                      totalRecords: { type: 'number', example: 250 }
                    }
                  }
                },
                remaining: {
                  type: 'number',
                  example: 2,
                  description: 'Remaining exports allowed this month'
                },
                nextReset: {
                  type: 'string',
                  format: 'date-time',
                  description: 'When the monthly limit resets'
                }
              }
            }
          }
        },
        401: standardResponses[401],
        500: standardResponses[500]
      },
      security: securitySchemes.bearer
    })
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;

      // Get export history
      const history = await userExportService.getExportHistory(user.id);

      // Calculate remaining exports
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentExports = history.filter(
        exp => new Date(exp.exportDate) > thirtyDaysAgo
      ).length;

      const remaining = Math.max(0, 3 - recentExports);
      const nextReset = new Date(thirtyDaysAgo.getTime() + 30 * 24 * 60 * 60 * 1000);

      reply.send({
        success: true,
        data: {
          exports: history,
          remaining,
          nextReset: nextReset.toISOString()
        }
      });

    } catch (error) {
      logger.error({ error, userId: (request as any).user.id }, 'Failed to get export history');
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to retrieve export history'
      });
    }
  });

  /**
   * Delete all user data (GDPR Right to Erasure)
   */
  fastify.post('/delete-request', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'Request account deletion',
      description: `
Request complete deletion of the user account and all associated data.

**GDPR Compliance:**
This endpoint fulfills the requirements of GDPR Article 17 - Right to erasure ('right to be forgotten').

**Important:**
- This action is irreversible
- A 30-day grace period is provided before permanent deletion
- You can cancel the deletion request during the grace period
- All data will be permanently deleted after the grace period

**Process:**
1. Account is immediately deactivated
2. 30-day grace period begins
3. Email confirmation is sent
4. After 30 days, all data is permanently deleted

**Data Retention:**
Some data may be retained for legal compliance:
- Transaction records (7 years)
- Security logs (90 days)
- Legal hold data (as required)
      `,
      tags: ['User Export'],
      body: {
        type: 'object',
        properties: {
          password: {
            type: 'string',
            minLength: 1,
            description: 'Current password for verification'
          },
          reason: {
            type: 'string',
            maxLength: 500,
            description: 'Optional reason for deletion'
          },
          confirmDeletion: {
            type: 'boolean',
            description: 'Must be true to confirm deletion request'
          }
        },
        required: ['password', 'confirmDeletion']
      },
      response: {
        200: {
          description: 'Deletion request submitted',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Account deletion scheduled' },
            data: {
              type: 'object',
              properties: {
                deletionDate: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Scheduled deletion date (30 days from now)'
                },
                gracePeriodDays: {
                  type: 'number',
                  example: 30,
                  description: 'Days until permanent deletion'
                },
                cancellationToken: {
                  type: 'string',
                  description: 'Token to cancel deletion if needed'
                }
              }
            }
          }
        },
        400: {
          description: 'Invalid request',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Invalid request' },
            message: { type: 'string', example: 'Deletion not confirmed or invalid password' }
          }
        },
        401: standardResponses[401],
        409: {
          description: 'Deletion already scheduled',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Conflict' },
            message: { type: 'string', example: 'Account deletion already scheduled' },
            deletionDate: { type: 'string', format: 'date-time' }
          }
        },
        500: standardResponses[500]
      },
      security: securitySchemes.bearer
    })
  }, async (request: FastifyRequest<{ Body: { password: string; reason?: string; confirmDeletion: boolean } }>, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      const { password, reason, confirmDeletion } = request.body;

      if (!confirmDeletion) {
        return reply.status(400).send({
          success: false,
          error: 'Invalid request',
          message: 'You must confirm the deletion request'
        });
      }

      // Verify password
      const dbUser = await fastify.prisma.user.findUnique({
        where: { id: user.id }
      });

      if (!dbUser || !await fastify.passwordUtils.comparePassword(password, dbUser.password)) {
        return reply.status(400).send({
          success: false,
          error: 'Invalid request',
          message: 'Invalid password'
        });
      }

      // Check if deletion already scheduled
      if (dbUser.deletedAt) {
        return reply.status(409).send({
          success: false,
          error: 'Conflict',
          message: 'Account deletion already scheduled',
          deletionDate: dbUser.deletedAt.toISOString()
        });
      }

      // Use the soft delete service for the actual deletion
      const result = await fastify.softDeleteService.scheduleAccountDeletion(user.id, reason);

      reply.send({
        success: true,
        message: 'Account deletion scheduled',
        data: {
          deletionDate: result.deletionDate,
          gracePeriodDays: 30,
          cancellationToken: result.cancellationToken
        }
      });

    } catch (error) {
      logger.error({ error, userId: (request as any).user.id }, 'Failed to schedule account deletion');
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to schedule account deletion'
      });
    }
  });
}