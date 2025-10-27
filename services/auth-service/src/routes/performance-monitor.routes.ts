import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { createRouteSchema, securitySchemes, standardResponses } from '../utils/swagger-schemas';
import { logger } from '../utils/logger';
import { createPerformanceMonitorService } from '../services/performance-monitor.service';
import { createMetricsService } from '../services/metrics.service';
import { createEmailService } from '../services/email.service';
import { RedisClient } from '../utils/redis';
import { z } from 'zod';

// Request schemas
const alertResolutionSchema = z.object({
  alertId: z.string().min(1),
  resolvedBy: z.string().min(1),
  notes: z.string().max(500).optional()
});

const thresholdUpdateSchema = z.object({
  thresholdId: z.string().min(1),
  enabled: z.boolean().optional(),
  value: z.number().optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  windowMinutes: z.number().min(1).max(1440).optional(),
  minDataPoints: z.number().min(1).max(100).optional()
});

const alertChannelUpdateSchema = z.object({
  channelId: z.string().min(1),
  enabled: z.boolean().optional(),
  severityFilter: z.array(z.enum(['low', 'medium', 'high', 'critical'])).optional(),
  rateLimitMinutes: z.number().min(1).max(1440).optional()
});

type AlertResolutionRequest = z.infer<typeof alertResolutionSchema>;
type ThresholdUpdateRequest = z.infer<typeof thresholdUpdateSchema>;
type AlertChannelUpdateRequest = z.infer<typeof alertChannelUpdateSchema>;

/**
 * Performance monitoring and alerting routes
 */
export async function performanceMonitorRoutes(fastify: FastifyInstance) {
  const metricsService = createMetricsService({ prisma: fastify.prisma });
  const emailService = createEmailService();
  const performanceMonitor = createPerformanceMonitorService({
    prisma: fastify.prisma,
    redis: RedisClient,
    metricsService,
    emailService
  });

  /**
   * Get system health snapshot
   */
  fastify.get('/performance/health', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'Get system health snapshot',
      description: `
Get a comprehensive snapshot of system health and performance metrics.

**Admin Permission Required**

**Health Metrics Include:**
- **CPU**: Usage percentage and load averages
- **Memory**: Heap usage, total memory, and utilization
- **Database**: Connection pool, response times, error rates
- **Redis**: Memory usage, response times, connection status
- **API**: Request rates, response times, error rates
- **External Services**: Email, SMS, OAuth provider health
- **Active Alerts**: Count by severity level

**Health Status Levels:**
- **Healthy**: No critical issues, system performing well
- **Degraded**: Minor issues detected, system still functional
- **Unhealthy**: Significant issues detected, performance impacted
- **Critical**: Critical issues detected, immediate attention required
      `,
      tags: ['Performance Monitoring'],
      response: {
        200: {
          description: 'System health snapshot retrieved successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                timestamp: { type: 'string', format: 'date-time' },
                overall: { 
                  type: 'string', 
                  enum: ['healthy', 'degraded', 'unhealthy', 'critical'],
                  example: 'healthy'
                },
                metrics: {
                  type: 'object',
                  properties: {
                    cpu: {
                      type: 'object',
                      properties: {
                        usage: { type: 'number', example: 25.5 },
                        loadAverage: { 
                          type: 'array', 
                          items: { type: 'number' },
                          example: [1.5, 1.2, 1.1]
                        }
                      }
                    },
                    memory: {
                      type: 'object',
                      properties: {
                        used: { type: 'number', example: 134217728 },
                        total: { type: 'number', example: 268435456 },
                        heapUsed: { type: 'number', example: 134217728 },
                        heapTotal: { type: 'number', example: 268435456 },
                        usage: { type: 'number', example: 50.0 }
                      }
                    },
                    database: {
                      type: 'object',
                      properties: {
                        connectionCount: { type: 'number', example: 10 },
                        avgResponseTime: { type: 'number', example: 45 },
                        errorRate: { type: 'number', example: 0.1 },
                        connectionPoolUtilization: { type: 'number', example: 25 }
                      }
                    },
                    redis: {
                      type: 'object',
                      properties: {
                        connectionCount: { type: 'number', example: 5 },
                        avgResponseTime: { type: 'number', example: 8 },
                        errorRate: { type: 'number', example: 0 },
                        memoryUsage: { type: 'number', example: 45 }
                      }
                    },
                    api: {
                      type: 'object',
                      properties: {
                        requestsPerMinute: { type: 'number', example: 150 },
                        avgResponseTime: { type: 'number', example: 250 },
                        errorRate: { type: 'number', example: 1.2 },
                        activeConnections: { type: 'number', example: 8 }
                      }
                    },
                    external: {
                      type: 'object',
                      properties: {
                        emailServiceHealth: { 
                          type: 'string', 
                          enum: ['up', 'down', 'degraded'],
                          example: 'up'
                        },
                        smsServiceHealth: { 
                          type: 'string', 
                          enum: ['up', 'down', 'degraded'],
                          example: 'up'
                        },
                        oauthProvidersHealth: {
                          type: 'object',
                          additionalProperties: {
                            type: 'string',
                            enum: ['up', 'down', 'degraded']
                          },
                          example: {
                            google: 'up',
                            github: 'up'
                          }
                        }
                      }
                    }
                  }
                },
                alerts: {
                  type: 'object',
                  properties: {
                    active: { type: 'number', example: 2 },
                    critical: { type: 'number', example: 0 },
                    high: { type: 'number', example: 1 },
                    medium: { type: 'number', example: 1 },
                    low: { type: 'number', example: 0 }
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
          message: 'Admin access required for performance monitoring'
        });
      }

      const healthSnapshot = await performanceMonitor.getSystemHealthSnapshot();

      reply.send({
        success: true,
        data: healthSnapshot
      });

    } catch (error) {
      logger.error({ error }, 'Failed to get system health snapshot');
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to retrieve system health'
      });
    }
  });

  /**
   * Get active alerts
   */
  fastify.get('/performance/alerts', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'Get active performance alerts',
      description: `
Get all currently active performance alerts.

**Admin Permission Required**

**Alert Information Includes:**
- Alert ID and threshold information
- Severity level and current status
- Metric values and threshold violations
- Timestamp and duration
- Notifications sent and channels used
      `,
      tags: ['Performance Monitoring'],
      querystring: {
        type: 'object',
        properties: {
          severity: {
            type: 'string',
            enum: ['low', 'medium', 'high', 'critical'],
            description: 'Filter alerts by severity level'
          },
          limit: {
            type: 'number',
            minimum: 1,
            maximum: 100,
            default: 50,
            description: 'Maximum number of alerts to return'
          }
        }
      },
      response: {
        200: {
          description: 'Active alerts retrieved successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                activeAlerts: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', example: 'alert_cpu_usage_high_1642345678901' },
                      thresholdId: { type: 'string', example: 'cpu_usage_high' },
                      metricName: { type: 'string', example: 'cpu_usage' },
                      severity: { 
                        type: 'string', 
                        enum: ['low', 'medium', 'high', 'critical'],
                        example: 'high'
                      },
                      message: { type: 'string', example: 'CPU usage exceeds 80%. Current value: 85.50 gt 80' },
                      currentValue: { type: 'number', example: 85.5 },
                      thresholdValue: { type: 'number', example: 80 },
                      timestamp: { type: 'string', format: 'date-time' },
                      resolved: { type: 'string', format: 'date-time', nullable: true },
                      resolvedBy: { type: 'string', nullable: true },
                      notificationsSent: {
                        type: 'array',
                        items: { type: 'string' },
                        example: ['admin_email', 'slack_alerts']
                      }
                    }
                  }
                },
                summary: {
                  type: 'object',
                  properties: {
                    total: { type: 'number', example: 3 },
                    bySeverity: {
                      type: 'object',
                      properties: {
                        critical: { type: 'number', example: 0 },
                        high: { type: 'number', example: 1 },
                        medium: { type: 'number', example: 2 },
                        low: { type: 'number', example: 0 }
                      }
                    },
                    oldestAlert: { type: 'string', format: 'date-time' },
                    newestAlert: { type: 'string', format: 'date-time' }
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
  }, async (request: FastifyRequest<{ Querystring: { severity?: string; limit?: number } }>, reply: FastifyReply) => {
    try {
      // Check admin permissions
      const user = (request as any).user;
      if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
        return reply.status(403).send({
          success: false,
          error: 'Insufficient permissions',
          message: 'Admin access required for alert management'
        });
      }

      const { severity, limit = 50 } = request.query;
      
      let activeAlerts = performanceMonitor.getActiveAlerts();
      
      // Filter by severity if specified
      if (severity) {
        activeAlerts = activeAlerts.filter(alert => alert.severity === severity);
      }
      
      // Apply limit
      activeAlerts = activeAlerts.slice(0, limit);

      // Calculate summary
      const bySeverity = {
        critical: activeAlerts.filter(a => a.severity === 'critical').length,
        high: activeAlerts.filter(a => a.severity === 'high').length,
        medium: activeAlerts.filter(a => a.severity === 'medium').length,
        low: activeAlerts.filter(a => a.severity === 'low').length
      };

      const timestamps = activeAlerts.map(a => a.timestamp.getTime());
      const oldestAlert = timestamps.length > 0 ? new Date(Math.min(...timestamps)) : null;
      const newestAlert = timestamps.length > 0 ? new Date(Math.max(...timestamps)) : null;

      reply.send({
        success: true,
        data: {
          activeAlerts,
          summary: {
            total: activeAlerts.length,
            bySeverity,
            oldestAlert: oldestAlert?.toISOString(),
            newestAlert: newestAlert?.toISOString()
          }
        }
      });

    } catch (error) {
      logger.error({ error }, 'Failed to get active alerts');
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to retrieve active alerts'
      });
    }
  });

  /**
   * Get alert history
   */
  fastify.get('/performance/alerts/history', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'Get performance alert history',
      description: `
Get historical performance alerts with filtering options.

**Admin Permission Required**

**Use Cases:**
- Analyze historical performance patterns
- Review past incidents and resolutions
- Generate performance reports
- Track system reliability trends
      `,
      tags: ['Performance Monitoring'],
      querystring: {
        type: 'object',
        properties: {
          severity: {
            type: 'string',
            enum: ['low', 'medium', 'high', 'critical'],
            description: 'Filter by severity level'
          },
          metricName: {
            type: 'string',
            description: 'Filter by metric name'
          },
          startDate: {
            type: 'string',
            format: 'date-time',
            description: 'Start date for historical range'
          },
          endDate: {
            type: 'string',
            format: 'date-time',
            description: 'End date for historical range'
          },
          limit: {
            type: 'number',
            minimum: 1,
            maximum: 500,
            default: 100,
            description: 'Maximum number of alerts to return'
          }
        }
      },
      response: {
        200: {
          description: 'Alert history retrieved successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                alerts: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      thresholdId: { type: 'string' },
                      metricName: { type: 'string' },
                      severity: { type: 'string' },
                      message: { type: 'string' },
                      currentValue: { type: 'number' },
                      thresholdValue: { type: 'number' },
                      timestamp: { type: 'string', format: 'date-time' },
                      resolved: { type: 'string', format: 'date-time', nullable: true },
                      resolvedBy: { type: 'string', nullable: true },
                      duration: { type: 'number', description: 'Alert duration in milliseconds' }
                    }
                  }
                },
                pagination: {
                  type: 'object',
                  properties: {
                    total: { type: 'number', example: 150 },
                    returned: { type: 'number', example: 50 },
                    hasMore: { type: 'boolean', example: true }
                  }
                },
                statistics: {
                  type: 'object',
                  properties: {
                    totalAlerts: { type: 'number', example: 150 },
                    resolvedAlerts: { type: 'number', example: 140 },
                    avgResolutionTime: { type: 'number', example: 1800000, description: 'Average resolution time in milliseconds' },
                    mostCommonMetric: { type: 'string', example: 'cpu_usage' },
                    alertsLastWeek: { type: 'number', example: 12 }
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
  }, async (request: FastifyRequest<{ 
    Querystring: { 
      severity?: string; 
      metricName?: string; 
      startDate?: string; 
      endDate?: string; 
      limit?: number 
    } 
  }>, reply: FastifyReply) => {
    try {
      // Check admin permissions
      const user = (request as any).user;
      if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
        return reply.status(403).send({
          success: false,
          error: 'Insufficient permissions',
          message: 'Admin access required for alert history'
        });
      }

      const { severity, metricName, startDate, endDate, limit = 100 } = request.query;
      
      let alertHistory = performanceMonitor.getAlertHistory();
      
      // Apply filters
      if (severity) {
        alertHistory = alertHistory.filter(alert => alert.severity === severity);
      }
      
      if (metricName) {
        alertHistory = alertHistory.filter(alert => alert.metricName === metricName);
      }
      
      if (startDate) {
        const start = new Date(startDate);
        alertHistory = alertHistory.filter(alert => alert.timestamp >= start);
      }
      
      if (endDate) {
        const end = new Date(endDate);
        alertHistory = alertHistory.filter(alert => alert.timestamp <= end);
      }
      
      // Sort by timestamp (newest first)
      alertHistory.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      const total = alertHistory.length;
      const paginatedAlerts = alertHistory.slice(0, limit);
      
      // Add duration for resolved alerts
      const alertsWithDuration = paginatedAlerts.map(alert => ({
        ...alert,
        duration: alert.resolved ? alert.resolved.getTime() - alert.timestamp.getTime() : null
      }));

      // Calculate statistics
      const resolvedAlerts = alertHistory.filter(a => a.resolved).length;
      const resolvedDurations = alertHistory
        .filter(a => a.resolved)
        .map(a => a.resolved!.getTime() - a.timestamp.getTime());
      const avgResolutionTime = resolvedDurations.length > 0 
        ? resolvedDurations.reduce((sum, duration) => sum + duration, 0) / resolvedDurations.length
        : 0;

      // Most common metric
      const metricCounts = alertHistory.reduce((counts, alert) => {
        counts[alert.metricName] = (counts[alert.metricName] || 0) + 1;
        return counts;
      }, {} as Record<string, number>);
      const mostCommonMetric = Object.entries(metricCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || '';

      // Alerts in last week
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const alertsLastWeek = alertHistory.filter(a => a.timestamp >= oneWeekAgo).length;

      reply.send({
        success: true,
        data: {
          alerts: alertsWithDuration,
          pagination: {
            total,
            returned: paginatedAlerts.length,
            hasMore: total > limit
          },
          statistics: {
            totalAlerts: total,
            resolvedAlerts,
            avgResolutionTime,
            mostCommonMetric,
            alertsLastWeek
          }
        }
      });

    } catch (error) {
      logger.error({ error }, 'Failed to get alert history');
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to retrieve alert history'
      });
    }
  });

  /**
   * Resolve alert
   */
  fastify.post('/performance/alerts/:alertId/resolve', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'Resolve performance alert',
      description: `
Manually resolve a performance alert.

**Admin Permission Required**

**Use Cases:**
- Mark false positive alerts as resolved
- Manually resolve alerts after fixing issues
- Add resolution notes for documentation
- Clear alert notifications
      `,
      tags: ['Performance Monitoring'],
      params: {
        type: 'object',
        properties: {
          alertId: {
            type: 'string',
            description: 'Alert ID to resolve'
          }
        },
        required: ['alertId']
      },
      body: {
        type: 'object',
        properties: {
          resolvedBy: {
            type: 'string',
            minLength: 1,
            description: 'Name or ID of person resolving the alert'
          },
          notes: {
            type: 'string',
            maxLength: 500,
            description: 'Optional resolution notes'
          }
        },
        required: ['resolvedBy']
      },
      response: {
        200: {
          description: 'Alert resolved successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Alert resolved successfully' },
            data: {
              type: 'object',
              properties: {
                alertId: { type: 'string', example: 'alert_cpu_usage_high_1642345678901' },
                resolvedAt: { type: 'string', format: 'date-time' },
                resolvedBy: { type: 'string', example: 'admin@example.com' },
                notes: { type: 'string', example: 'Issue resolved by restarting service' },
                duration: { type: 'number', example: 1800000, description: 'Alert duration in milliseconds' }
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
  }, async (request: FastifyRequest<{ 
    Params: { alertId: string };
    Body: AlertResolutionRequest 
  }>, reply: FastifyReply) => {
    try {
      // Check admin permissions
      const user = (request as any).user;
      if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
        return reply.status(403).send({
          success: false,
          error: 'Insufficient permissions',
          message: 'Admin access required for alert management'
        });
      }

      const { alertId } = request.params;
      const { resolvedBy, notes } = request.body;

      // Find the alert
      const activeAlerts = performanceMonitor.getActiveAlerts();
      const alert = activeAlerts.find(a => a.id === alertId);

      if (!alert) {
        return reply.status(404).send({
          success: false,
          error: 'Alert not found',
          message: `Alert with ID ${alertId} not found or already resolved`
        });
      }

      // Resolve the alert
      const resolvedAt = new Date();
      alert.resolved = resolvedAt;
      alert.resolvedBy = resolvedBy;
      
      const duration = resolvedAt.getTime() - alert.timestamp.getTime();

      // Log the resolution
      await fastify.prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'ALERT_RESOLVED',
          category: 'ADMIN',
          ip: request.ip,
          userAgent: request.headers['user-agent'] || 'Unknown',
          metadata: {
            alertId,
            thresholdId: alert.thresholdId,
            metricName: alert.metricName,
            severity: alert.severity,
            resolvedBy,
            notes,
            duration
          }
        }
      });

      // Emit resolution event
      performanceMonitor.emit('alertResolved', alert);

      reply.send({
        success: true,
        message: 'Alert resolved successfully',
        data: {
          alertId,
          resolvedAt: resolvedAt.toISOString(),
          resolvedBy,
          notes,
          duration
        }
      });

    } catch (error) {
      logger.error({ error, alertId: request.params.alertId }, 'Failed to resolve alert');
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to resolve alert'
      });
    }
  });

  /**
   * Get performance metrics
   */
  fastify.get('/performance/metrics', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'Get performance metrics',
      description: `
Get current and historical performance metrics data.

**Admin Permission Required**

**Available Metrics:**
- System metrics (CPU, memory, load)
- Database metrics (response time, connection pool)
- Redis metrics (memory usage, response time)
- API metrics (request rate, response time, error rate)
- Application metrics (business logic performance)
      `,
      tags: ['Performance Monitoring'],
      querystring: {
        type: 'object',
        properties: {
          metricName: {
            type: 'string',
            description: 'Filter by specific metric name'
          },
          source: {
            type: 'string',
            enum: ['system', 'application', 'database', 'redis', 'external'],
            description: 'Filter by metric source'
          },
          timeRange: {
            type: 'string',
            enum: ['1h', '6h', '24h', '7d', '30d'],
            default: '1h',
            description: 'Time range for historical data'
          },
          aggregation: {
            type: 'string',
            enum: ['avg', 'min', 'max', 'sum'],
            default: 'avg',
            description: 'Aggregation method for time-series data'
          }
        }
      },
      response: {
        200: {
          description: 'Performance metrics retrieved successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                current: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string', example: 'cpu_usage' },
                      value: { type: 'number', example: 45.2 },
                      unit: { type: 'string', example: 'percent' },
                      timestamp: { type: 'string', format: 'date-time' },
                      source: { type: 'string', example: 'system' }
                    }
                  }
                },
                historical: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      timestamp: { type: 'string', format: 'date-time' },
                      value: { type: 'number' },
                      aggregatedFrom: { type: 'number', description: 'Number of data points aggregated' }
                    }
                  }
                },
                summary: {
                  type: 'object',
                  properties: {
                    totalMetrics: { type: 'number', example: 15 },
                    timeRange: { type: 'string', example: '1h' },
                    aggregation: { type: 'string', example: 'avg' },
                    dataPoints: { type: 'number', example: 120 }
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
  }, async (request: FastifyRequest<{ 
    Querystring: { 
      metricName?: string; 
      source?: string; 
      timeRange?: string;
      aggregation?: string;
    } 
  }>, reply: FastifyReply) => {
    try {
      // Check admin permissions
      const user = (request as any).user;
      if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
        return reply.status(403).send({
          success: false,
          error: 'Insufficient permissions',
          message: 'Admin access required for performance metrics'
        });
      }

      const { metricName, source, timeRange = '1h', aggregation = 'avg' } = request.query;
      
      // Get current metrics
      const currentMetrics = await performanceMonitor.collectSystemMetrics();
      
      // Filter current metrics
      let filteredCurrentMetrics = currentMetrics;
      if (metricName) {
        filteredCurrentMetrics = filteredCurrentMetrics.filter(m => m.name === metricName);
      }
      if (source) {
        filteredCurrentMetrics = filteredCurrentMetrics.filter(m => m.source === source);
      }

      // Get historical metrics (mock implementation)
      const performanceHistory = performanceMonitor.getPerformanceHistory();
      let historicalMetrics = performanceHistory;
      
      // Apply time range filter
      const now = Date.now();
      const timeRangeMs = {
        '1h': 60 * 60 * 1000,
        '6h': 6 * 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000
      }[timeRange] || 60 * 60 * 1000;
      
      const cutoffTime = new Date(now - timeRangeMs);
      historicalMetrics = historicalMetrics.filter(m => m.timestamp >= cutoffTime);
      
      if (metricName) {
        historicalMetrics = historicalMetrics.filter(m => m.name === metricName);
      }
      if (source) {
        historicalMetrics = historicalMetrics.filter(m => m.source === source);
      }

      // Aggregate historical data (simplified implementation)
      const aggregatedHistorical = historicalMetrics.map(metric => ({
        timestamp: metric.timestamp.toISOString(),
        value: metric.value,
        aggregatedFrom: 1 // In real implementation, this would aggregate multiple points
      }));

      reply.send({
        success: true,
        data: {
          current: filteredCurrentMetrics,
          historical: aggregatedHistorical,
          summary: {
            totalMetrics: filteredCurrentMetrics.length,
            timeRange,
            aggregation,
            dataPoints: aggregatedHistorical.length
          }
        }
      });

    } catch (error) {
      logger.error({ error }, 'Failed to get performance metrics');
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to retrieve performance metrics'
      });
    }
  });

  /**
   * Get performance thresholds
   */
  fastify.get('/performance/thresholds', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'Get performance thresholds',
      description: `
Get all configured performance thresholds and their current status.

**Admin Permission Required**
      `,
      tags: ['Performance Monitoring'],
      response: {
        200: {
          description: 'Performance thresholds retrieved successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                thresholds: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', example: 'cpu_usage_high' },
                      metricName: { type: 'string', example: 'cpu_usage' },
                      operator: { type: 'string', enum: ['gt', 'lt', 'gte', 'lte', 'eq', 'ne'] },
                      value: { type: 'number', example: 80 },
                      severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
                      enabled: { type: 'boolean', example: true },
                      windowMinutes: { type: 'number', example: 5 },
                      minDataPoints: { type: 'number', example: 3 },
                      description: { type: 'string', example: 'CPU usage exceeds 80%' }
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
          message: 'Admin access required for threshold management'
        });
      }

      const thresholds = performanceMonitor.getThresholds();

      reply.send({
        success: true,
        data: { thresholds }
      });

    } catch (error) {
      logger.error({ error }, 'Failed to get performance thresholds');
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to retrieve performance thresholds'
      });
    }
  });
}