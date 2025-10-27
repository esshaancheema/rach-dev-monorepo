import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { 
  ERROR_CODES, 
  ERROR_METADATA, 
  ErrorCode, 
  getErrorMetadata,
  ErrorMetadata 
} from '../constants/error-codes';
import { logger } from '../utils/logger';

// Schema definitions
const errorQuerySchema = z.object({
  category: z.enum(['CLIENT_ERROR', 'SERVER_ERROR', 'SECURITY_ERROR']).optional(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  retryable: z.boolean().optional(),
  userFriendly: z.boolean().optional(),
  search: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20)
});

const errorStatsQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  groupBy: z.enum(['code', 'category', 'severity', 'hour', 'day']).default('code')
});

export async function errorManagementRoutes(fastify: FastifyInstance) {
  
  // Get all error codes with metadata
  fastify.get('/error-codes', {
    preHandler: [],
    schema: {
      summary: 'Get all error codes',
      description: 'Retrieve all available error codes with their metadata',
      tags: ['Error Management'],
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          category: { type: 'string', enum: ['CLIENT_ERROR', 'SERVER_ERROR', 'SECURITY_ERROR'] },
          severity: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
          retryable: { type: 'boolean' },
          userFriendly: { type: 'boolean' },
          search: { type: 'string' },
          page: { type: 'number', minimum: 1, default: 1 },
          limit: { type: 'number', minimum: 1, maximum: 100, default: 20 }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                errorCodes: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      code: { type: 'string' },
                      httpStatus: { type: 'number' },
                      category: { type: 'string' },
                      severity: { type: 'string' },
                      userFriendly: { type: 'boolean' },
                      retryable: { type: 'boolean' },
                      logLevel: { type: 'string' },
                      description: { type: 'string' },
                      possibleCauses: { type: 'array', items: { type: 'string' } },
                      resolution: { type: 'array', items: { type: 'string' } },
                      relatedDocs: { type: 'array', items: { type: 'string' } }
                    }
                  }
                },
                pagination: {
                  type: 'object',
                  properties: {
                    page: { type: 'number' },
                    limit: { type: 'number' },
                    total: { type: 'number' },
                    totalPages: { type: 'number' }
                  }
                }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = errorQuerySchema.parse(request.query);
      
      // Get all error codes
      const allErrorCodes = Object.values(ERROR_CODES);
      let filteredCodes = allErrorCodes;
      
      // Apply filters
      if (query.category || query.severity || query.retryable !== undefined || 
          query.userFriendly !== undefined || query.search) {
        filteredCodes = allErrorCodes.filter(code => {
          const metadata = getErrorMetadata(code);
          if (!metadata) return false;
          
          if (query.category && metadata.category !== query.category) return false;
          if (query.severity && metadata.severity !== query.severity) return false;
          if (query.retryable !== undefined && metadata.retryable !== query.retryable) return false;
          if (query.userFriendly !== undefined && metadata.userFriendly !== query.userFriendly) return false;
          if (query.search) {
            const searchLower = query.search.toLowerCase();
            return code.toLowerCase().includes(searchLower) ||
                   metadata.description.toLowerCase().includes(searchLower);
          }
          
          return true;
        });
      }
      
      // Pagination
      const total = filteredCodes.length;
      const totalPages = Math.ceil(total / query.limit);
      const startIndex = (query.page - 1) * query.limit;
      const endIndex = startIndex + query.limit;
      const paginatedCodes = filteredCodes.slice(startIndex, endIndex);
      
      // Format response
      const errorCodes = paginatedCodes.map(code => {
        const metadata = getErrorMetadata(code);
        return {
          code,
          ...metadata
        };
      }).filter(Boolean);
      
      return reply.send({
        success: true,
        data: {
          errorCodes,
          pagination: {
            page: query.page,
            limit: query.limit,
            total,
            totalPages
          }
        }
      });
    } catch (error) {
      logger.error('Failed to get error codes:', error);
      return reply.status(500).send({
        success: false,
        error: 'GET_ERROR_CODES_FAILED',
        message: 'Failed to retrieve error codes'
      });
    }
  });

  // Get specific error code details
  fastify.get('/error-codes/:code', {
    preHandler: [],
    schema: {
      summary: 'Get error code details',
      description: 'Get detailed information about a specific error code',
      tags: ['Error Management'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          code: { type: 'string' }
        },
        required: ['code']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                code: { type: 'string' },
                httpStatus: { type: 'number' },
                category: { type: 'string' },
                severity: { type: 'string' },
                userFriendly: { type: 'boolean' },
                retryable: { type: 'boolean' },
                logLevel: { type: 'string' },
                description: { type: 'string' },
                possibleCauses: { type: 'array', items: { type: 'string' } },
                resolution: { type: 'array', items: { type: 'string' } },
                relatedDocs: { type: 'array', items: { type: 'string' } }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { code } = request.params as { code: string };
      const metadata = getErrorMetadata(code as ErrorCode);
      
      if (!metadata) {
        return reply.status(404).send({
          success: false,
          error: 'ERROR_CODE_NOT_FOUND',
          message: `Error code '${code}' not found`
        });
      }
      
      return reply.send({
        success: true,
        data: {
          code,
          ...metadata
        }
      });
    } catch (error) {
      logger.error('Failed to get error code details:', error);
      return reply.status(500).send({
        success: false,
        error: 'GET_ERROR_CODE_FAILED',
        message: 'Failed to retrieve error code details'
      });
    }
  });

  // Get error statistics
  fastify.get('/error-stats', {
    preHandler: [],
    schema: {
      summary: 'Get error statistics',
      description: 'Get error occurrence statistics and trends',
      tags: ['Error Management'],
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          groupBy: { type: 'string', enum: ['code', 'category', 'severity', 'hour', 'day'], default: 'code' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                summary: {
                  type: 'object',
                  properties: {
                    totalErrors: { type: 'number' },
                    totalRequests: { type: 'number' },
                    errorRate: { type: 'number' },
                    timeRange: {
                      type: 'object',
                      properties: {
                        start: { type: 'string' },
                        end: { type: 'string' }
                      }
                    }
                  }
                },
                breakdown: {
                  type: 'object',
                  properties: {
                    byCategory: { type: 'object' },
                    bySeverity: { type: 'object' },
                    byCode: { type: 'object' },
                    trends: { type: 'array' }
                  }
                }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = errorStatsQuerySchema.parse(request.query);
      
      // In a real implementation, this would query actual error logs
      // For now, return mock statistics
      const mockStats = {
        summary: {
          totalErrors: 1250,
          totalRequests: 50000,
          errorRate: 2.5,
          timeRange: {
            start: query.startDate || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            end: query.endDate || new Date().toISOString()
          }
        },
        breakdown: {
          byCategory: {
            'CLIENT_ERROR': 800,  // 64%
            'SERVER_ERROR': 350,  // 28%
            'SECURITY_ERROR': 100 // 8%
          },
          bySeverity: {
            'LOW': 750,     // 60%
            'MEDIUM': 375,  // 30%
            'HIGH': 100,    // 8%
            'CRITICAL': 25  // 2%
          },
          byCode: {
            'AUTH_INVALID_CREDENTIALS': 250,
            'VALIDATION_REQUIRED_FIELD': 200,
            'RATE_LIMIT_EXCEEDED': 150,
            'DATABASE_CONNECTION_ERROR': 100,
            'AUTH_TOKEN_EXPIRED': 100,
            'EXTERNAL_EMAIL_SERVICE_ERROR': 75,
            'VALIDATION_INVALID_EMAIL': 75,
            'AUTH_2FA_REQUIRED': 50,
            'SECURITY_SUSPICIOUS_ACTIVITY': 25,
            'OTHER': 225
          },
          trends: [
            { timestamp: '2024-01-10T00:00:00Z', errors: 45, requests: 2000 },
            { timestamp: '2024-01-10T01:00:00Z', errors: 52, requests: 2100 },
            { timestamp: '2024-01-10T02:00:00Z', errors: 38, requests: 1900 },
            { timestamp: '2024-01-10T03:00:00Z', errors: 41, requests: 2050 },
            { timestamp: '2024-01-10T04:00:00Z', errors: 55, requests: 2200 }
          ]
        }
      };
      
      return reply.send({
        success: true,
        data: mockStats
      });
    } catch (error) {
      logger.error('Failed to get error statistics:', error);
      return reply.status(500).send({
        success: false,
        error: 'GET_ERROR_STATS_FAILED',
        message: 'Failed to retrieve error statistics'
      });
    }
  });

  // Get error categories summary
  fastify.get('/error-categories', {
    preHandler: [],
    schema: {
      summary: 'Get error categories',
      description: 'Get summary of all error categories with counts',
      tags: ['Error Management'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                categories: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      category: { type: 'string' },
                      count: { type: 'number' },
                      percentage: { type: 'number' },
                      severityDistribution: { type: 'object' },
                      commonCodes: { type: 'array', items: { type: 'string' } }
                    }
                  }
                },
                total: { type: 'number' }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const allErrorCodes = Object.values(ERROR_CODES);
      const categoryCounts: Record<string, any> = {};
      
      // Count errors by category
      allErrorCodes.forEach(code => {
        const metadata = getErrorMetadata(code);
        if (!metadata) return;
        
        if (!categoryCounts[metadata.category]) {
          categoryCounts[metadata.category] = {
            category: metadata.category,
            count: 0,
            severityDistribution: { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 },
            commonCodes: []
          };
        }
        
        categoryCounts[metadata.category].count++;
        categoryCounts[metadata.category].severityDistribution[metadata.severity]++;
        
        // Add to common codes (limit to 5)
        if (categoryCounts[metadata.category].commonCodes.length < 5) {
          categoryCounts[metadata.category].commonCodes.push(code);
        }
      });
      
      const total = allErrorCodes.length;
      const categories = Object.values(categoryCounts).map((cat: any) => ({
        ...cat,
        percentage: Number(((cat.count / total) * 100).toFixed(1))
      }));
      
      return reply.send({
        success: true,
        data: {
          categories,
          total
        }
      });
    } catch (error) {
      logger.error('Failed to get error categories:', error);
      return reply.status(500).send({
        success: false,
        error: 'GET_ERROR_CATEGORIES_FAILED',
        message: 'Failed to retrieve error categories'
      });
    }
  });

  // Test error code (for testing error handling)
  fastify.post('/test-error/:code', {
    preHandler: [],
    schema: {
      summary: 'Test error code',
      description: 'Trigger a specific error code for testing purposes',
      tags: ['Error Management'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          code: { type: 'string' }
        },
        required: ['code']
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { code } = request.params as { code: string };
      const metadata = getErrorMetadata(code as ErrorCode);
      
      if (!metadata) {
        return reply.status(404).send({
          success: false,
          error: 'ERROR_CODE_NOT_FOUND',
          message: `Error code '${code}' not found`
        });
      }
      
      // Log the test error
      logger.info('Testing error code', { 
        code, 
        testedBy: (request as any).user?.id,
        metadata 
      });
      
      // Throw the specified error for testing
      return reply.status(metadata.httpStatus).send({
        code: code as ErrorCode,
        message: `Test error: ${metadata.description}`,
        details: {
          metadata: {
            userFriendly: metadata.userFriendly,
            retryable: metadata.retryable,
            severity: metadata.severity,
            category: metadata.category
          },
          isTestError: true
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Failed to test error code:', error);
      return reply.status(500).send({
        success: false,
        error: 'TEST_ERROR_FAILED',
        message: 'Failed to test error code'
      });
    }
  });

  // Generate error documentation
  fastify.get('/documentation', {
    preHandler: [],
    schema: {
      summary: 'Get error documentation',
      description: 'Generate comprehensive error code documentation',
      tags: ['Error Management'],
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          format: { type: 'string', enum: ['json', 'markdown', 'html'], default: 'json' }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { format = 'json' } = request.query as { format?: string };
      const allErrorCodes = Object.values(ERROR_CODES);
      
      if (format === 'json') {
        const documentation = allErrorCodes.map(code => {
          const metadata = getErrorMetadata(code);
          return metadata ? { code, ...metadata } : null;
        }).filter(Boolean);
        
        return reply.send({
          success: true,
          data: {
            documentation,
            generatedAt: new Date().toISOString(),
            totalCodes: documentation.length
          }
        });
      } else if (format === 'markdown') {
        let markdown = '# Error Code Reference\n\n';
        markdown += `Generated at: ${new Date().toISOString()}\n\n`;
        
        // Group by category
        const categories = ['CLIENT_ERROR', 'SERVER_ERROR', 'SECURITY_ERROR'];
        
        categories.forEach(category => {
          markdown += `## ${category.replace('_', ' ')}\n\n`;
          
          const categoryErrors = allErrorCodes.filter(code => {
            const metadata = getErrorMetadata(code);
            return metadata?.category === category;
          });
          
          markdown += '| Code | HTTP Status | Severity | Retryable | Description |\n';
          markdown += '|------|-------------|----------|-----------|-------------|\n';
          
          categoryErrors.forEach(code => {
            const metadata = getErrorMetadata(code);
            if (metadata) {
              markdown += `| \`${code}\` | ${metadata.httpStatus} | ${metadata.severity} | ${metadata.retryable ? '✅' : '❌'} | ${metadata.description} |\n`;
            }
          });
          
          markdown += '\n';
        });
        
        return reply
          .type('text/markdown')
          .send(markdown);
      }
      
      return reply.status(400).send({
        success: false,
        error: 'INVALID_FORMAT',
        message: 'Unsupported documentation format'
      });
    } catch (error) {
      logger.error('Failed to generate error documentation:', error);
      return reply.status(500).send({
        success: false,
        error: 'GENERATE_DOCS_FAILED',
        message: 'Failed to generate error documentation'
      });
    }
  });

  logger.info('Error management routes registered');
}