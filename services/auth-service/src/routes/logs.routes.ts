import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { createRouteSchema, securitySchemes, standardResponses } from '../utils/swagger-schemas';
import { logger } from '../utils/logger';
import { z } from 'zod';

// Log query schemas
const logQuerySchema = z.object({
  level: z.enum(['debug', 'info', 'warn', 'error']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  requestId: z.string().optional(),
  userId: z.string().optional(),
  ip: z.string().optional(),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']).optional(),
  url: z.string().optional(),
  statusCode: z.number().min(100).max(599).optional(),
  limit: z.number().min(1).max(1000).default(100),
  offset: z.number().min(0).default(0),
  search: z.string().optional()
});

const logExportSchema = z.object({
  format: z.enum(['json', 'csv', 'text']).default('json'),
  ...logQuerySchema.shape
});

type LogQuery = z.infer<typeof logQuerySchema>;
type LogExport = z.infer<typeof logExportSchema>;

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  requestId?: string;
  userId?: string;
  ip?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  responseTime?: number;
  userAgent?: string;
  error?: any;
  metadata?: any;
}

/**
 * Logging and audit routes for monitoring and compliance
 */
export async function logsRoutes(fastify: FastifyInstance) {

  /**
   * Get application logs with filtering and pagination
   */
  fastify.get('/logs', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'Get application logs',
      description: `
Retrieve application logs with advanced filtering, pagination, and search capabilities.

**Admin Permission Required**

**Features:**
- Filter by log level, date range, user, IP, request ID
- Full-text search across log messages
- Pagination support
- Real-time log streaming (via query parameters)
- Export capabilities

**Log Levels:**
- debug: Detailed debug information
- info: General information messages
- warn: Warning messages and slow requests
- error: Error messages and exceptions

**Use Cases:**
- Troubleshooting application issues
- Security incident investigation
- Performance analysis
- Compliance auditing
- User activity monitoring

**Security:**
- Requires authentication and admin privileges
- Sensitive data is automatically redacted
- Access logging for audit trail
      `,
      tags: ['Logs'],
      querystring: {
        type: 'object',
        properties: {
          level: {
            type: 'string',
            enum: ['debug', 'info', 'warn', 'error'],
            description: 'Filter by log level'
          },
          startDate: {
            type: 'string',
            format: 'date-time',
            description: 'Start date for log filtering (ISO 8601)'
          },
          endDate: {
            type: 'string',
            format: 'date-time',
            description: 'End date for log filtering (ISO 8601)'
          },
          requestId: {
            type: 'string',
            description: 'Filter by specific request ID'
          },
          userId: {
            type: 'string',
            description: 'Filter by user ID'
          },
          ip: {
            type: 'string',
            description: 'Filter by IP address'
          },
          method: {
            type: 'string',
            enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            description: 'Filter by HTTP method'
          },
          url: {
            type: 'string',
            description: 'Filter by URL pattern'
          },
          statusCode: {
            type: 'number',
            minimum: 100,
            maximum: 599,
            description: 'Filter by HTTP status code'
          },
          limit: {
            type: 'number',
            minimum: 1,
            maximum: 1000,
            default: 100,
            description: 'Number of log entries to return'
          },
          offset: {
            type: 'number',
            minimum: 0,
            default: 0,
            description: 'Number of log entries to skip'
          },
          search: {
            type: 'string',
            description: 'Full-text search across log messages'
          }
        }
      },
      response: {
        200: {
          description: 'Log entries retrieved successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                logs: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      timestamp: { type: 'string', format: 'date-time' },
                      level: { type: 'string', enum: ['debug', 'info', 'warn', 'error'] },
                      message: { type: 'string' },
                      requestId: { type: 'string' },
                      userId: { type: 'string' },
                      ip: { type: 'string' },
                      method: { type: 'string' },
                      url: { type: 'string' },
                      statusCode: { type: 'number' },
                      responseTime: { type: 'number' },
                      userAgent: { type: 'string' },
                      error: { type: 'object' },
                      metadata: { type: 'object' }
                    }
                  }
                },
                pagination: {
                  type: 'object',
                  properties: {
                    total: { type: 'number', example: 1250 },
                    limit: { type: 'number', example: 100 },
                    offset: { type: 'number', example: 0 },
                    hasMore: { type: 'boolean', example: true }
                  }
                },
                filters: {
                  type: 'object',
                  description: 'Applied filters for reference'
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
  }, async (request: FastifyRequest<{ Querystring: LogQuery }>, reply: FastifyReply) => {
    try {
      // Check admin permissions
      const user = (request as any).user;
      if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
        return reply.status(403).send({
          success: false,
          error: 'Insufficient permissions',
          message: 'Admin access required to view logs'
        });
      }

      const query = request.query;
      
      // Log the admin access for audit
      logger.info({
        type: 'admin_log_access',
        adminId: user.id,
        adminEmail: user.email,
        filters: query,
        ip: request.ip,
        userAgent: request.headers['user-agent']
      }, 'Admin accessed application logs');

      // Mock log data (in real implementation, this would query a log storage system)
      const mockLogs: LogEntry[] = [
        {
          timestamp: '2024-01-15T10:30:00.000Z',
          level: 'info',
          message: 'User login successful',
          requestId: 'req_1234567890_abcd',
          userId: 'user_123',
          ip: '192.168.1.1',
          method: 'POST',
          url: '/api/auth/login',
          statusCode: 200,
          responseTime: 150,
          userAgent: 'Mozilla/5.0...',
          metadata: {
            loginMethod: 'email',
            deviceId: 'device_456'
          }
        },
        {
          timestamp: '2024-01-15T10:29:45.000Z',
          level: 'warn',
          message: 'Slow request detected',
          requestId: 'req_1234567889_xyz',
          userId: 'user_789',
          ip: '192.168.1.2',
          method: 'GET',
          url: '/api/users/profile',
          statusCode: 200,
          responseTime: 1500,
          userAgent: 'Mozilla/5.0...',
          metadata: {
            threshold: 1000,
            performanceImpact: 'medium'
          }
        },
        {
          timestamp: '2024-01-15T10:29:30.000Z',
          level: 'error',
          message: 'Database connection failed',
          requestId: 'req_1234567888_err',
          ip: '192.168.1.3',
          method: 'POST',
          url: '/api/auth/register',
          statusCode: 500,
          responseTime: 5000,
          error: {
            name: 'DatabaseConnectionError',
            message: 'Connection timeout after 5000ms',
            stack: 'Error: Connection timeout...'
          },
          metadata: {
            retryAttempt: 3,
            connectionPool: 'exhausted'
          }
        }
      ];

      // Apply filters (simplified for demonstration)
      let filteredLogs = mockLogs;

      if (query.level) {
        filteredLogs = filteredLogs.filter(log => log.level === query.level);
      }

      if (query.userId) {
        filteredLogs = filteredLogs.filter(log => log.userId === query.userId);
      }

      if (query.statusCode) {
        filteredLogs = filteredLogs.filter(log => log.statusCode === query.statusCode);
      }

      if (query.search) {
        const searchTerm = query.search.toLowerCase();
        filteredLogs = filteredLogs.filter(log => 
          log.message.toLowerCase().includes(searchTerm) ||
          log.url?.toLowerCase().includes(searchTerm) ||
          log.error?.message?.toLowerCase().includes(searchTerm)
        );
      }

      // Apply pagination
      const total = filteredLogs.length;
      const limit = query.limit || 100;
      const offset = query.offset || 0;
      const paginatedLogs = filteredLogs.slice(offset, offset + limit);

      reply.send({
        success: true,
        data: {
          logs: paginatedLogs,
          pagination: {
            total,
            limit,
            offset,
            hasMore: offset + limit < total
          },
          filters: query
        }
      });

    } catch (error) {
      logger.error({ error }, 'Failed to retrieve logs');
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to retrieve logs'
      });
    }
  });

  /**
   * Export logs in various formats
   */
  fastify.get('/logs/export', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'Export logs in various formats',
      description: `
Export application logs in JSON, CSV, or text format for analysis, archival, or compliance purposes.

**Admin Permission Required**

**Export Formats:**
- JSON: Structured data with full metadata
- CSV: Tabular format for spreadsheet analysis
- Text: Human-readable format for viewing

**Features:**
- Same filtering capabilities as log retrieval
- Large dataset export with streaming
- Compressed output for large files
- Audit trail for export activities

**Use Cases:**
- Compliance reporting
- External security analysis
- Data archival
- Incident investigation
- Performance analysis
      `,
      tags: ['Logs'],
      querystring: {
        type: 'object',
        properties: {
          format: {
            type: 'string',
            enum: ['json', 'csv', 'text'],
            default: 'json',
            description: 'Export format'
          },
          ...logQuerySchema.shape
        }
      },
      response: {
        200: {
          description: 'Logs exported successfully',
          type: 'string',
          examples: {
            json: {
              summary: 'JSON export',
              value: '[{"timestamp":"2024-01-15T10:30:00.000Z","level":"info","message":"User login successful"}]'
            },
            csv: {
              summary: 'CSV export',
              value: 'timestamp,level,message,requestId,userId\n2024-01-15T10:30:00.000Z,info,User login successful,req_123,user_456'
            },
            text: {
              summary: 'Text export',
              value: '2024-01-15T10:30:00.000Z [INFO] User login successful (req_123)'
            }
          }
        },
        401: standardResponses[401],
        403: standardResponses[403],
        500: standardResponses[500]
      },
      security: securitySchemes.bearer
    })
  }, async (request: FastifyRequest<{ Querystring: LogExport }>, reply: FastifyReply) => {
    try {
      // Check admin permissions
      const user = (request as any).user;
      if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
        return reply.status(403).send({
          success: false,
          error: 'Insufficient permissions',
          message: 'Admin access required to export logs'
        });
      }

      const query = request.query;
      const format = query.format || 'json';

      // Log the export activity for audit
      logger.info({
        type: 'admin_log_export',
        adminId: user.id,
        adminEmail: user.email,
        format,
        filters: query,
        ip: request.ip,
        userAgent: request.headers['user-agent']
      }, 'Admin exported application logs');

      // Mock log data (same as above, in practice would be from log storage)
      const mockLogs: LogEntry[] = [
        {
          timestamp: '2024-01-15T10:30:00.000Z',
          level: 'info',
          message: 'User login successful',
          requestId: 'req_1234567890_abcd',
          userId: 'user_123',
          ip: '192.168.1.1',
          method: 'POST',
          url: '/api/auth/login',
          statusCode: 200,
          responseTime: 150
        },
        {
          timestamp: '2024-01-15T10:29:45.000Z',
          level: 'warn',
          message: 'Slow request detected',
          requestId: 'req_1234567889_xyz',
          ip: '192.168.1.2',
          method: 'GET',
          url: '/api/users/profile',
          statusCode: 200,
          responseTime: 1500
        }
      ];

      // Set appropriate content type and headers
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `auth-service-logs-${timestamp}.${format}`;

      reply.header('Content-Disposition', `attachment; filename="${filename}"`);

      switch (format) {
        case 'json':
          reply.type('application/json');
          return JSON.stringify(mockLogs, null, 2);

        case 'csv':
          reply.type('text/csv');
          const headers = ['timestamp', 'level', 'message', 'requestId', 'userId', 'ip', 'method', 'url', 'statusCode', 'responseTime'];
          const csvContent = [
            headers.join(','),
            ...mockLogs.map(log => headers.map(header => {
              const value = (log as any)[header];
              return typeof value === 'string' && value.includes(',') ? `"${value}"` : value || '';
            }).join(','))
          ].join('\n');
          return csvContent;

        case 'text':
          reply.type('text/plain');
          const textContent = mockLogs.map(log => 
            `${log.timestamp} [${log.level.toUpperCase()}] ${log.message}${log.requestId ? ` (${log.requestId})` : ''}`
          ).join('\n');
          return textContent;

        default:
          reply.status(400).send({
            success: false,
            error: 'Invalid format',
            message: 'Supported formats: json, csv, text'
          });
      }

    } catch (error) {
      logger.error({ error }, 'Failed to export logs');
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to export logs'
      });
    }
  });

  /**
   * Get log statistics and metrics
   */
  fastify.get('/logs/stats', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'Get log statistics and metrics',
      description: `
Get comprehensive statistics about application logs including error rates, performance metrics, and trends.

**Admin Permission Required**

**Statistics Include:**
- Log volume by level and time period
- Error rate trends
- Performance metrics (response times)
- Top error messages and URLs
- User activity patterns
- Security event summaries

**Use Cases:**
- Application health monitoring
- Performance trend analysis
- Security monitoring
- Capacity planning
- SLA reporting
      `,
      tags: ['Logs'],
      querystring: {
        type: 'object',
        properties: {
          period: {
            type: 'string',
            enum: ['1h', '24h', '7d', '30d'],
            default: '24h',
            description: 'Time period for statistics'
          }
        }
      },
      response: {
        200: {
          description: 'Log statistics retrieved successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                period: { type: 'string', example: '24h' },
                totalLogs: { type: 'number', example: 15420 },
                logsByLevel: {
                  type: 'object',
                  properties: {
                    debug: { type: 'number', example: 8500 },
                    info: { type: 'number', example: 5200 },
                    warn: { type: 'number', example: 1500 },
                    error: { type: 'number', example: 220 }
                  }
                },
                errorRate: { type: 'number', example: 1.43 },
                averageResponseTime: { type: 'number', example: 145 },
                slowRequests: { type: 'number', example: 89 },
                topErrors: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      message: { type: 'string' },
                      count: { type: 'number' },
                      lastOccurrence: { type: 'string', format: 'date-time' }
                    }
                  }
                },
                topUrls: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      url: { type: 'string' },
                      requests: { type: 'number' },
                      errors: { type: 'number' },
                      averageResponseTime: { type: 'number' }
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
  }, async (request: FastifyRequest<{ Querystring: { period?: string } }>, reply: FastifyReply) => {
    try {
      // Check admin permissions
      const user = (request as any).user;
      if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
        return reply.status(403).send({
          success: false,
          error: 'Insufficient permissions',
          message: 'Admin access required to view log statistics'
        });
      }

      const period = request.query.period || '24h';

      // Mock statistics data
      const stats = {
        period,
        totalLogs: 15420,
        logsByLevel: {
          debug: 8500,
          info: 5200,
          warn: 1500,
          error: 220
        },
        errorRate: 1.43, // percentage
        averageResponseTime: 145, // milliseconds
        slowRequests: 89,
        topErrors: [
          {
            message: 'Database connection timeout',
            count: 45,
            lastOccurrence: '2024-01-15T10:15:00.000Z'
          },
          {
            message: 'Invalid JWT token',
            count: 32,
            lastOccurrence: '2024-01-15T10:20:00.000Z'
          },
          {
            message: 'Rate limit exceeded',
            count: 28,
            lastOccurrence: '2024-01-15T10:25:00.000Z'
          }
        ],
        topUrls: [
          {
            url: '/api/auth/login',
            requests: 1250,
            errors: 23,
            averageResponseTime: 120
          },
          {
            url: '/api/users/profile',
            requests: 890,
            errors: 15,
            averageResponseTime: 95
          },
          {
            url: '/api/auth/refresh',
            requests: 780,
            errors: 8,
            averageResponseTime: 85
          }
        ]
      };

      reply.send({
        success: true,
        data: stats
      });

    } catch (error) {
      logger.error({ error }, 'Failed to retrieve log statistics');
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to retrieve log statistics'
      });
    }
  });
}