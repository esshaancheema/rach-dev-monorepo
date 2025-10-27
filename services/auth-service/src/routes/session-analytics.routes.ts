import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { createRouteSchema, securitySchemes, standardResponses } from '../utils/swagger-schemas';
import { logger } from '../utils/logger';
import { createSessionAnalyticsService } from '../services/session-analytics.service';
import { z } from 'zod';

// Request schemas
const analyticsParamsSchema = z.object({
  days: z.number().min(1).max(365).default(30),
  includeLocation: z.boolean().default(false),
  includeSecurity: z.boolean().default(false)
});

const reportParamsSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  includeUserDetails: z.boolean().default(false),
  includeSecurityAnalytics: z.boolean().default(true),
  includeLocationAnalytics: z.boolean().default(true)
});

const durationStatsSchema = z.object({
  days: z.number().min(1).max(365).default(30),
  userId: z.string().optional()
});

type AnalyticsParamsRequest = z.infer<typeof analyticsParamsSchema>;
type ReportParamsRequest = z.infer<typeof reportParamsSchema>;
type DurationStatsRequest = z.infer<typeof durationStatsSchema>;

/**
 * Session analytics and reporting routes
 */
export async function sessionAnalyticsRoutes(fastify: FastifyInstance) {
  const sessionAnalyticsService = createSessionAnalyticsService({
    prisma: fastify.prisma,
    redis: fastify.redis
  });

  /**
   * Get user session analytics
   */
  fastify.get('/analytics/sessions', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'Get user session analytics',
      description: `
Get comprehensive session analytics for the authenticated user.

**Analytics include:**
- Session count and duration statistics
- Login frequency patterns
- Device and browser breakdown
- Location-based analytics
- Peak usage hours analysis
- Security metrics and alerts

**Configurable period:** 1-365 days
**Real-time data:** Updated continuously
      `,
      tags: ['Session Analytics'],
      querystring: {
        type: 'object',
        properties: {
          days: {
            type: 'number',
            minimum: 1,
            maximum: 365,
            default: 30,
            description: 'Number of days to analyze',
            example: 30
          },
          includeLocation: {
            type: 'boolean',
            default: false,
            description: 'Include location-based analytics'
          },
          includeSecurity: {
            type: 'boolean',
            default: false,
            description: 'Include security-related metrics'
          }
        }
      },
      response: {
        200: {
          description: 'Session analytics retrieved successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                userId: { type: 'string', example: 'user_123' },
                period: {
                  type: 'object',
                  properties: {
                    days: { type: 'number', example: 30 },
                    startDate: { type: 'string', format: 'date-time' },
                    endDate: { type: 'string', format: 'date-time' }
                  }
                },
                summary: {
                  type: 'object',
                  properties: {
                    totalSessions: { type: 'number', example: 45 },
                    activeSessions: { type: 'number', example: 2 },
                    averageSessionDuration: { type: 'number', example: 23.5 },
                    totalSessionTime: { type: 'number', example: 1057.5 },
                    lastActivity: { type: 'string', format: 'date-time' },
                    firstSeen: { type: 'string', format: 'date-time' }
                  }
                },
                loginFrequency: {
                  type: 'object',
                  properties: {
                    daily: { type: 'number', example: 3 },
                    weekly: { type: 'number', example: 18 },
                    monthly: { type: 'number', example: 45 }
                  }
                },
                deviceBreakdown: {
                  type: 'object',
                  properties: {
                    desktop: { type: 'number', example: 25 },
                    mobile: { type: 'number', example: 18 },
                    tablet: { type: 'number', example: 2 }
                  }
                },
                browserBreakdown: {
                  type: 'object',
                  additionalProperties: { type: 'number' },
                  example: {
                    chrome: 30,
                    firefox: 10,
                    safari: 5
                  }
                },
                peakHours: {
                  type: 'array',
                  items: { type: 'number' },
                  example: [9, 14, 20]
                },
                securityMetrics: {
                  type: 'object',
                  properties: {
                    suspiciousLogins: { type: 'number', example: 0 },
                    failedLoginAttempts: { type: 'number', example: 2 },
                    multipleDeviceLogins: { type: 'number', example: 5 },
                    unusualLocationLogins: { type: 'number', example: 1 }
                  }
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
  }, async (request: FastifyRequest<{ 
    Querystring: AnalyticsParamsRequest 
  }>, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      const { days = 30, includeLocation = false, includeSecurity = false } = request.query;

      const analytics = await sessionAnalyticsService.getUserSessionAnalytics(user.id, days);

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);

      // Filter sensitive data based on flags
      const response: any = {
        userId: analytics.userId,
        period: {
          days,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        },
        summary: {
          totalSessions: analytics.totalSessions,
          activeSessions: analytics.activeSessions,
          averageSessionDuration: Math.round(analytics.averageSessionDuration * 100) / 100,
          totalSessionTime: Math.round(analytics.totalSessionTime * 100) / 100,
          lastActivity: analytics.lastActivity.toISOString(),
          firstSeen: analytics.firstSeen.toISOString()
        },
        loginFrequency: analytics.loginFrequency,
        deviceBreakdown: analytics.deviceBreakdown,
        browserBreakdown: analytics.browserBreakdown,
        peakHours: analytics.peakHours
      };

      if (includeLocation) {
        response.locationBreakdown = analytics.locationBreakdown;
      }

      if (includeSecurity) {
        response.securityMetrics = analytics.securityMetrics;
      }

      reply.send({
        success: true,
        data: response
      });

    } catch (error) {
      logger.error({ error, userId: (request as any).user?.id }, 'Failed to get session analytics');
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to retrieve session analytics'
      });
    }
  });

  /**
   * Get real-time session metrics
   */
  fastify.get('/analytics/realtime', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'Get real-time session metrics',
      description: `
Get current real-time session metrics and activity.

**Real-time metrics:**
- Currently active sessions
- Online users count
- Current hour login activity
- Failed login attempts
- Geographic distribution
- Device type breakdown

**Update frequency:** Real-time
**Data retention:** Last 24 hours
      `,
      tags: ['Session Analytics'],
      response: {
        200: {
          description: 'Real-time metrics retrieved successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                timestamp: { type: 'string', format: 'date-time' },
                activeSessions: { type: 'number', example: 234 },
                onlineUsers: { type: 'number', example: 189 },
                currentHourLogins: { type: 'number', example: 45 },
                failedLoginsLastHour: { type: 'number', example: 3 },
                topCountries: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      country: { type: 'string', example: 'United States' },
                      count: { type: 'number', example: 78 }
                    }
                  }
                },
                deviceBreakdown: {
                  type: 'object',
                  properties: {
                    desktop: { type: 'number', example: 145 },
                    mobile: { type: 'number', example: 78 },
                    tablet: { type: 'number', example: 11 },
                    unknown: { type: 'number', example: 0 }
                  }
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
      const metrics = await sessionAnalyticsService.getRealtimeMetrics();

      reply.send({
        success: true,
        data: {
          timestamp: new Date().toISOString(),
          ...metrics
        }
      });

    } catch (error) {
      logger.error({ error, userId: (request as any).user?.id }, 'Failed to get realtime metrics');
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to retrieve real-time metrics'
      });
    }
  });

  /**
   * Get session duration statistics
   */
  fastify.get('/analytics/duration', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'Get session duration statistics',
      description: `
Get detailed session duration statistics and distribution.

**Statistics include:**
- Average, median, and percentile values
- Duration distribution buckets
- Shortest and longest sessions
- Comparative analysis

**Admin users** can query duration stats for any user.
**Regular users** can only query their own statistics.
      `,
      tags: ['Session Analytics'],
      querystring: {
        type: 'object',
        properties: {
          days: {
            type: 'number',
            minimum: 1,
            maximum: 365,
            default: 30,
            description: 'Number of days to analyze'
          },
          userId: {
            type: 'string',
            description: 'User ID to analyze (admin only)',
            example: 'user_123'
          }
        }
      },
      response: {
        200: {
          description: 'Session duration statistics retrieved successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                period: {
                  type: 'object',
                  properties: {
                    days: { type: 'number', example: 30 },
                    userId: { type: 'string', example: 'user_123' }
                  }
                },
                statistics: {
                  type: 'object',
                  properties: {
                    average: { type: 'number', example: 23.5 },
                    median: { type: 'number', example: 18.2 },
                    percentile95: { type: 'number', example: 65.8 },
                    shortest: { type: 'number', example: 0.5 },
                    longest: { type: 'number', example: 180.3 }
                  }
                },
                distribution: {
                  type: 'object',
                  properties: {
                    '< 1 min': { type: 'number', example: 5 },
                    '1-5 min': { type: 'number', example: 12 },
                    '5-15 min': { type: 'number', example: 18 },
                    '15-30 min': { type: 'number', example: 8 },
                    '30-60 min': { type: 'number', example: 4 },
                    '> 60 min': { type: 'number', example: 2 }
                  }
                },
                insights: {
                  type: 'array',
                  items: { type: 'string' },
                  example: [
                    'Average session duration is above platform average',
                    'Most sessions are between 5-15 minutes',
                    'Low bounce rate indicates good engagement'
                  ]
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
    Querystring: DurationStatsRequest 
  }>, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      const { days = 30, userId } = request.query;

      // Check permissions for querying other users
      let targetUserId = user.id;
      if (userId && userId !== user.id) {
        if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
          return reply.status(403).send({
            success: false,
            error: 'Insufficient permissions',
            message: 'Admin access required to query other users'
          });
        }
        targetUserId = userId;
      }

      const stats = await sessionAnalyticsService.getSessionDurationStats(targetUserId, days);

      // Generate insights based on statistics
      const insights: string[] = [];
      
      if (stats.average > 20) {
        insights.push('Average session duration is above platform average');
      } else if (stats.average < 5) {
        insights.push('Sessions are relatively short - consider improving engagement');
      }

      const bounceRate = (stats.distribution['< 1 min'] / Object.values(stats.distribution).reduce((a, b) => a + b, 0)) * 100;
      if (bounceRate < 10) {
        insights.push('Low bounce rate indicates good engagement');
      } else if (bounceRate > 30) {
        insights.push('High bounce rate detected - users may not find what they need quickly');
      }

      const longSessions = stats.distribution['> 60 min'];
      if (longSessions > 0) {
        insights.push(`${longSessions} sessions exceeded 1 hour - indicating deep engagement`);
      }

      reply.send({
        success: true,
        data: {
          period: {
            days,
            userId: targetUserId
          },
          statistics: {
            average: Math.round(stats.average * 100) / 100,
            median: Math.round(stats.median * 100) / 100,
            percentile95: Math.round(stats.percentile95 * 100) / 100,
            shortest: Math.round(stats.shortest * 100) / 100,
            longest: Math.round(stats.longest * 100) / 100
          },
          distribution: stats.distribution,
          insights
        }
      });

    } catch (error) {
      logger.error({ error, userId: (request as any).user?.id }, 'Failed to get session duration stats');
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to retrieve session duration statistics'
      });
    }
  });

  /**
   * Generate session report (Admin only)
   */
  fastify.post('/analytics/report', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'Generate session analytics report (Admin)',
      description: `
Generate comprehensive session analytics report for specified period.

**Admin Permission Required**

**Report includes:**
- Period summary with key metrics
- User activity and retention analysis
- Device and browser breakdown
- Geographic distribution analysis
- Security and threat detection metrics
- Time-based usage patterns
- Performance benchmarks

**Export formats:** JSON (additional formats can be added)
**Maximum period:** 365 days
      `,
      tags: ['Session Analytics'],
      body: {
        type: 'object',
        properties: {
          startDate: {
            type: 'string',
            format: 'date-time',
            description: 'Report start date',
            example: '2024-01-01T00:00:00Z'
          },
          endDate: {
            type: 'string',
            format: 'date-time',
            description: 'Report end date',
            example: '2024-01-31T23:59:59Z'
          },
          includeUserDetails: {
            type: 'boolean',
            default: false,
            description: 'Include detailed user-level analytics'
          },
          includeSecurityAnalytics: {
            type: 'boolean',
            default: true,
            description: 'Include security and threat metrics'
          },
          includeLocationAnalytics: {
            type: 'boolean',
            default: true,
            description: 'Include geographic distribution'
          }
        },
        required: ['startDate', 'endDate']
      },
      response: {
        200: {
          description: 'Session report generated successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                generatedAt: { type: 'string', format: 'date-time' },
                period: {
                  type: 'object',
                  properties: {
                    start: { type: 'string', format: 'date-time' },
                    end: { type: 'string', format: 'date-time' },
                    durationDays: { type: 'number', example: 30 }
                  }
                },
                summary: {
                  type: 'object',
                  properties: {
                    totalUsers: { type: 'number', example: 1250 },
                    totalSessions: { type: 'number', example: 4580 },
                    averageSessionDuration: { type: 'number', example: 18.7 },
                    peakConcurrentSessions: { type: 'number', example: 145 },
                    newUsers: { type: 'number', example: 375 },
                    returningUsers: { type: 'number', example: 875 },
                    bounceRate: { type: 'number', example: 12.3 }
                  }
                },
                deviceAnalytics: {
                  type: 'object',
                  properties: {
                    desktop: { type: 'number', example: 2748 },
                    mobile: { type: 'number', example: 1564 },
                    tablet: { type: 'number', example: 268 },
                    unknown: { type: 'number', example: 0 }
                  }
                },
                browserAnalytics: {
                  type: 'object',
                  additionalProperties: { type: 'number' },
                  example: {
                    chrome: 2985,
                    firefox: 896,
                    safari: 523,
                    edge: 176
                  }
                },
                timeAnalytics: {
                  type: 'object',
                  properties: {
                    peakHour: { type: 'number', example: 14 },
                    peakDay: { type: 'number', example: 2 },
                    hourlyDistribution: {
                      type: 'array',
                      items: { type: 'number' }
                    }
                  }
                },
                securityAnalytics: {
                  type: 'object',
                  properties: {
                    suspiciousActivities: { type: 'number', example: 23 },
                    blockedIPs: { type: 'number', example: 12 },
                    failedLogins: { type: 'number', example: 189 },
                    accountLockouts: { type: 'number', example: 5 }
                  }
                },
                userRetention: {
                  type: 'object',
                  properties: {
                    day1: { type: 'number', example: 85 },
                    day7: { type: 'number', example: 60 },
                    day30: { type: 'number', example: 40 }
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
  }, async (request: FastifyRequest<{ Body: ReportParamsRequest }>, reply: FastifyReply) => {
    try {
      // Check admin permissions
      const user = (request as any).user;
      if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
        return reply.status(403).send({
          success: false,
          error: 'Insufficient permissions',
          message: 'Admin access required for session reports'
        });
      }

      const { 
        startDate, 
        endDate, 
        includeUserDetails = false,
        includeSecurityAnalytics = true,
        includeLocationAnalytics = true
      } = request.body;

      const start = new Date(startDate);
      const end = new Date(endDate);

      // Validate date range
      const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff > 365) {
        return reply.status(400).send({
          success: false,
          error: 'Invalid date range',
          message: 'Report period cannot exceed 365 days'
        });
      }

      if (start >= end) {
        return reply.status(400).send({
          success: false,
          error: 'Invalid date range',
          message: 'Start date must be before end date'
        });
      }

      const report = await sessionAnalyticsService.generateSessionReport(start, end, {
        includeUserDetails,
        includeSecurityAnalytics,
        includeLocationAnalytics
      });

      // Log report generation
      await fastify.prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'SESSION_REPORT_GENERATED',
          category: 'ADMIN',
          ip: request.ip,
          userAgent: request.headers['user-agent'] || 'Unknown',
          metadata: {
            reportPeriod: { startDate, endDate },
            options: { includeUserDetails, includeSecurityAnalytics, includeLocationAnalytics },
            metrics: report.summary
          }
        }
      });

      reply.send({
        success: true,
        data: {
          generatedAt: new Date().toISOString(),
          period: {
            start: report.period.start.toISOString(),
            end: report.period.end.toISOString(),
            durationDays: daysDiff
          },
          summary: report.summary,
          deviceAnalytics: report.deviceAnalytics,
          browserAnalytics: report.browserAnalytics,
          timeAnalytics: {
            peakHour: report.timeAnalytics.hourlyDistribution.indexOf(Math.max(...report.timeAnalytics.hourlyDistribution)),
            peakDay: report.timeAnalytics.dailyDistribution.indexOf(Math.max(...report.timeAnalytics.dailyDistribution)),
            hourlyDistribution: report.timeAnalytics.hourlyDistribution
          },
          securityAnalytics: includeSecurityAnalytics ? report.securityAnalytics : undefined,
          locationAnalytics: includeLocationAnalytics ? report.locationAnalytics : undefined,
          userRetention: report.userRetention
        }
      });

    } catch (error) {
      logger.error({ error, userId: (request as any).user?.id }, 'Failed to generate session report');
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to generate session report'
      });
    }
  });
}