import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { createMetricsService } from '../services/metrics.service';
import { logger } from '../utils/logger';
import { createForbiddenError } from '../middleware/error-handler';

export async function metricsRoutes(fastify: FastifyInstance) {
  // Initialize metrics service
  const metricsService = createMetricsService({
    prisma: fastify.prisma,
  });

  // Admin authentication middleware for metrics endpoints
  fastify.addHook('preHandler', async (request, reply) => {
    // Verify JWT token first
    await fastify.authenticate(request, reply);
    
    // Check if user has admin or super_admin role
    const user = (request.user as any);
    if (!user || !['admin', 'super_admin'].includes(user.role)) {
      throw createForbiddenError('Admin access required for metrics');
    }
  });

  // Get comprehensive authentication metrics
  fastify.get(
    '/auth-metrics',
    {
      schema: {
        tags: ['Metrics'],
        summary: 'Get comprehensive authentication metrics',
        description: 'Returns detailed metrics about authentication, users, and security',
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  totalUsers: { type: 'number' },
                  activeUsers: { type: 'number' },
                  newUsersToday: { type: 'number' },
                  newUsersThisWeek: { type: 'number' },
                  newUsersThisMonth: { type: 'number' },
                  loginAttemptsTotal: { type: 'number' },
                  loginAttemptsSuccess: { type: 'number' },
                  loginAttemptsFailure: { type: 'number' },
                  loginSuccessRate: { type: 'number' },
                  securityEventsHigh: { type: 'number' },
                  securityEventsCritical: { type: 'number' },
                  suspiciousActivities: { type: 'number' },
                  blockedDevices: { type: 'number' },
                  averageResponseTime: { type: 'number' },
                  requestsPerMinute: { type: 'number' },
                  errorRate: { type: 'number' },
                  databaseHealth: { type: 'string', enum: ['healthy', 'degraded', 'unhealthy'] },
                  redisHealth: { type: 'string', enum: ['healthy', 'degraded', 'unhealthy'] },
                  emailServiceHealth: { type: 'string', enum: ['healthy', 'degraded', 'unhealthy'] },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        logger.info('Admin auth metrics request');
        
        const metrics = await metricsService.getAuthMetrics();
        
        return reply.send({
          success: true,
          data: metrics,
        });
      } catch (error) {
        logger.error({ error }, 'Failed to get auth metrics');
        throw error;
      }
    }
  );

  // Get time series metrics for charts
  fastify.get<{
    Querystring: {
      metrics: string;
      period: 'hour' | 'day' | 'week';
      start_date?: string;
      end_date?: string;
    };
  }>(
    '/time-series',
    {
      schema: {
        tags: ['Metrics'],
        summary: 'Get time series metrics for charts',
        description: 'Returns time series data for specified metrics over a time period',
        querystring: {
          type: 'object',
          properties: {
            metrics: { 
              type: 'string',
              description: 'Comma-separated list of metric names',
              example: 'login_attempts,login_success,security_events',
            },
            period: { 
              type: 'string',
              enum: ['hour', 'day', 'week'],
              description: 'Time period granularity',
            },
            start_date: { 
              type: 'string',
              format: 'date-time',
              description: 'Start date (ISO 8601)',
            },
            end_date: { 
              type: 'string',
              format: 'date-time',
              description: 'End date (ISO 8601)',
            },
          },
          required: ['metrics', 'period'],
        },
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  period: { type: 'string' },
                  metrics: {
                    type: 'object',
                    additionalProperties: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          timestamp: { type: 'string', format: 'date-time' },
                          value: { type: 'number' },
                          tags: { type: 'object' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{
      Querystring: {
        metrics: string;
        period: 'hour' | 'day' | 'week';
        start_date?: string;
        end_date?: string;
      };
    }>, reply: FastifyReply) => {
      try {
        const { metrics, period, start_date, end_date } = request.query;
        
        const metricNames = metrics.split(',').map(m => m.trim());
        const startDate = start_date ? new Date(start_date) : undefined;
        const endDate = end_date ? new Date(end_date) : undefined;

        logger.info('Admin time series metrics request:', {
          metricNames,
          period,
          startDate,
          endDate,
        });
        
        const timeSeriesData = await metricsService.getTimeSeriesMetrics(
          metricNames,
          period,
          startDate,
          endDate
        );
        
        return reply.send({
          success: true,
          data: timeSeriesData,
        });
      } catch (error) {
        logger.error({ error }, 'Failed to get time series metrics');
        throw error;
      }
    }
  );

  // Get real-time metrics (updated every 30 seconds)
  fastify.get(
    '/realtime',
    {
      schema: {
        tags: ['Metrics'],
        summary: 'Get real-time metrics',
        description: 'Returns real-time metrics updated every 30 seconds',
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                additionalProperties: true,
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        logger.info('Admin realtime metrics request');
        
        const realtimeMetrics = await metricsService.getRealtimeMetrics();
        
        return reply.send({
          success: true,
          data: realtimeMetrics,
        });
      } catch (error) {
        logger.error({ error }, 'Failed to get realtime metrics');
        throw error;
      }
    }
  );

  // Health check endpoint with detailed service status
  fastify.get(
    '/health',
    {
      schema: {
        tags: ['Metrics'],
        summary: 'Service health check',
        description: 'Returns detailed health status of all service components',
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  status: { type: 'string', enum: ['healthy', 'degraded', 'unhealthy'] },
                  services: {
                    type: 'object',
                    properties: {
                      database: {
                        type: 'object',
                        properties: {
                          status: { type: 'string' },
                          responseTime: { type: 'number' },
                        },
                      },
                      redis: {
                        type: 'object',
                        properties: {
                          status: { type: 'string' },
                          responseTime: { type: 'number' },
                        },
                      },
                      email: {
                        type: 'object',
                        properties: {
                          status: { type: 'string' },
                          failedEmailsCount: { type: 'number' },
                        },
                      },
                    },
                  },
                  timestamp: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        logger.info('Admin health check request');
        
        // Get basic auth metrics which includes health checks
        const authMetrics = await metricsService.getAuthMetrics();
        
        // Perform detailed health checks
        const healthData = {
          status: 'healthy' as const,
          services: {
            database: {
              status: authMetrics.databaseHealth,
              responseTime: await measureDatabaseResponseTime(fastify),
            },
            redis: {
              status: authMetrics.redisHealth,
              responseTime: await measureRedisResponseTime(),
            },
            email: {
              status: authMetrics.emailServiceHealth,
              failedEmailsCount: await getFailedEmailsCount(),
            },
          },
          timestamp: new Date().toISOString(),
        };

        // Determine overall status
        const serviceStatuses = Object.values(healthData.services).map(s => s.status);
        if (serviceStatuses.includes('unhealthy')) {
          healthData.status = 'unhealthy';
        } else if (serviceStatuses.includes('degraded')) {
          healthData.status = 'degraded';
        }
        
        return reply.send({
          success: true,
          data: healthData,
        });
      } catch (error) {
        logger.error({ error }, 'Failed to get health status');
        
        return reply.status(503).send({
          success: false,
          data: {
            status: 'unhealthy',
            error: 'Health check failed',
            timestamp: new Date().toISOString(),
          },
        });
      }
    }
  );

  // Prometheus-style metrics endpoint
  fastify.get(
    '/prometheus',
    {
      schema: {
        tags: ['Metrics'],
        summary: 'Prometheus metrics',
        description: 'Returns metrics in Prometheus format for scraping',
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'string',
            description: 'Prometheus metrics format',
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        logger.info('Prometheus metrics request');
        
        const authMetrics = await metricsService.getAuthMetrics();
        const realtimeMetrics = await metricsService.getRealtimeMetrics();
        
        // Convert to Prometheus format
        const prometheusMetrics = convertToPrometheusFormat(authMetrics, realtimeMetrics);
        
        reply.header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
        return reply.send(prometheusMetrics);
      } catch (error) {
        logger.error({ error }, 'Failed to get Prometheus metrics');
        throw error;
      }
    }
  );
}

/**
 * Measure database response time
 */
async function measureDatabaseResponseTime(fastify: FastifyInstance): Promise<number> {
  try {
    const start = Date.now();
    await fastify.prisma.$queryRaw`SELECT 1`;
    return Date.now() - start;
  } catch (error) {
    return -1;
  }
}

/**
 * Measure Redis response time
 */
async function measureRedisResponseTime(): Promise<number> {
  try {
    const { cacheManager } = await import('../utils/redis');
    const start = Date.now();
    await cacheManager.set('health_check', 'ok', 10);
    return Date.now() - start;
  } catch (error) {
    return -1;
  }
}

/**
 * Get failed emails count
 */
async function getFailedEmailsCount(): Promise<number> {
  try {
    const { cacheManager } = await import('../utils/redis');
    const keys = await cacheManager.keys('failed_emails:*');
    return keys.length;
  } catch (error) {
    return -1;
  }
}

/**
 * Convert metrics to Prometheus format
 */
function convertToPrometheusFormat(authMetrics: any, realtimeMetrics: any): string {
  const lines: string[] = [];
  
  // Add help and type comments
  lines.push('# HELP auth_total_users Total number of users');
  lines.push('# TYPE auth_total_users gauge');
  lines.push(`auth_total_users ${authMetrics.totalUsers}`);
  
  lines.push('# HELP auth_active_users Number of active users');
  lines.push('# TYPE auth_active_users gauge');
  lines.push(`auth_active_users ${authMetrics.activeUsers}`);
  
  lines.push('# HELP auth_login_success_rate Login success rate percentage');
  lines.push('# TYPE auth_login_success_rate gauge');
  lines.push(`auth_login_success_rate ${authMetrics.loginSuccessRate}`);
  
  lines.push('# HELP auth_security_events_high High severity security events');
  lines.push('# TYPE auth_security_events_high gauge');
  lines.push(`auth_security_events_high ${authMetrics.securityEventsHigh}`);
  
  lines.push('# HELP auth_security_events_critical Critical security events');
  lines.push('# TYPE auth_security_events_critical gauge');
  lines.push(`auth_security_events_critical ${authMetrics.securityEventsCritical}`);
  
  lines.push('# HELP auth_response_time_avg Average response time in milliseconds');
  lines.push('# TYPE auth_response_time_avg gauge');
  lines.push(`auth_response_time_avg ${authMetrics.averageResponseTime}`);
  
  // Add service health metrics
  lines.push('# HELP auth_service_health Service health status (1=healthy, 0.5=degraded, 0=unhealthy)');
  lines.push('# TYPE auth_service_health gauge');
  lines.push(`auth_service_health{service="database"} ${getHealthValue(authMetrics.databaseHealth)}`);
  lines.push(`auth_service_health{service="redis"} ${getHealthValue(authMetrics.redisHealth)}`);
  lines.push(`auth_service_health{service="email"} ${getHealthValue(authMetrics.emailServiceHealth)}`);
  
  // Add realtime metrics
  Object.entries(realtimeMetrics).forEach(([key, value]) => {
    if (typeof value === 'number') {
      lines.push(`# HELP auth_${key} Realtime metric: ${key}`);
      lines.push(`# TYPE auth_${key} gauge`);
      lines.push(`auth_${key} ${value}`);
    }
  });
  
  return lines.join('\n') + '\n';
}

/**
 * Convert health status to numeric value for Prometheus
 */
function getHealthValue(status: string): number {
  switch (status) {
    case 'healthy': return 1;
    case 'degraded': return 0.5;
    case 'unhealthy': return 0;
    default: return 0;
  }
}