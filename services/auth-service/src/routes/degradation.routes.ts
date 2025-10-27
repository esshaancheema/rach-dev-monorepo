import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { logger } from '../utils/logger';
import { getAllCircuitBreakers } from '../middleware/circuit-breaker.middleware';

export async function degradationRoutes(fastify: FastifyInstance) {

  /**
   * Get system degradation status
   */
  fastify.get('/degradation/status', {
    schema: {
      tags: ['System Health'],
      summary: 'Get system degradation status',
      description: 'Returns the current degradation status including circuit breaker states, fallback usage, and queued operations',
      response: {
        200: {
          type: 'object',
          properties: {
            timestamp: { type: 'string', format: 'date-time' },
            isHealthy: { type: 'boolean' },
            degradedServices: {
              type: 'array',
              items: { type: 'string' }
            },
            fallbacksActive: {
              type: 'array',
              items: { type: 'string' }
            },
            queuedOperations: { type: 'number' },
            cacheSize: { type: 'number' },
            circuitBreakers: {
              type: 'object',
              additionalProperties: {
                type: 'object',
                properties: {
                  state: { type: 'string', enum: ['CLOSED', 'OPEN', 'HALF_OPEN'] },
                  failureCount: { type: 'number' },
                  successCount: { type: 'number' },
                  lastFailureTime: { type: 'number' },
                  nextAttemptTime: { type: 'number' },
                  isAvailable: { type: 'boolean' }
                }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const degradationStatus = fastify.gracefulDegradationService.getDegradationStatus();
      
      // Get circuit breaker details
      const circuitBreakers: Record<string, any> = {};
      for (const [name, breaker] of getAllCircuitBreakers()) {
        circuitBreakers[name] = {
          ...breaker.getState(),
          isAvailable: breaker.isAvailable()
        };
      }

      const response = {
        timestamp: new Date().toISOString(),
        ...degradationStatus,
        circuitBreakers
      };

      logger.debug({
        degradationStatus: response
      }, 'Degradation status requested');

      return reply.send(response);

    } catch (error) {
      logger.error({ error }, 'Failed to get degradation status');
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to get degradation status'
      });
    }
  });

  /**
   * Process queued operations manually (admin only)
   */
  fastify.post('/degradation/process-queue', {
    schema: {
      tags: ['System Health'],
      summary: 'Process queued operations',
      description: 'Manually trigger processing of queued operations that failed during service degradation',
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            processedOperations: { type: 'number' }
          }
        }
      }
    },
    preHandler: []
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      if (!user?.role || user.role !== 'ADMIN') {
        return reply.status(403).send({
          error: 'Forbidden',
          message: 'Admin access required'
        });
      }

      const statusBefore = fastify.gracefulDegradationService.getDegradationStatus();
      const queuedBefore = statusBefore.queuedOperations;

      await fastify.gracefulDegradationService.processQueuedOperations();

      const statusAfter = fastify.gracefulDegradationService.getDegradationStatus();
      const queuedAfter = statusAfter.queuedOperations;
      const processedOperations = queuedBefore - queuedAfter;

      logger.info({
        userId: user.id,
        processedOperations,
        remainingOperations: queuedAfter
      }, 'Admin manually processed queued operations');

      return reply.send({
        message: 'Queued operations processed successfully',
        processedOperations
      });

    } catch (error) {
      logger.error({ error }, 'Failed to process queued operations');
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to process queued operations'
      });
    }
  });

  /**
   * Clear fallback cache (admin only)
   */
  fastify.post('/degradation/clear-cache', {
    schema: {
      tags: ['System Health'],
      summary: 'Clear fallback cache',
      description: 'Clears the in-memory fallback cache used during service degradation',
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            clearedEntries: { type: 'number' }
          }
        }
      }
    },
    preHandler: []
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      if (!user?.role || user.role !== 'ADMIN') {
        return reply.status(403).send({
          error: 'Forbidden',
          message: 'Admin access required'
        });
      }

      const statusBefore = fastify.gracefulDegradationService.getDegradationStatus();
      const cacheEntriesBefore = statusBefore.cacheSize;

      fastify.gracefulDegradationService.clearCache();

      logger.info({
        userId: user.id,
        clearedEntries: cacheEntriesBefore
      }, 'Admin cleared fallback cache');

      return reply.send({
        message: 'Fallback cache cleared successfully',
        clearedEntries: cacheEntriesBefore
      });

    } catch (error) {
      logger.error({ error }, 'Failed to clear fallback cache');
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to clear fallback cache'
      });
    }
  });

  /**
   * Get system resilience report (admin only)
   */
  fastify.get('/degradation/resilience-report', {
    schema: {
      tags: ['System Health'],
      summary: 'Get system resilience report',
      description: 'Returns a comprehensive report on system resilience including circuit breaker history and degradation metrics',
      response: {
        200: {
          type: 'object',
          properties: {
            timestamp: { type: 'string', format: 'date-time' },
            systemHealth: {
              type: 'object',
              properties: {
                overallStatus: { type: 'string', enum: ['healthy', 'degraded', 'critical'] },
                uptime: { type: 'number' },
                totalDegradationEvents: { type: 'number' },
                averageRecoveryTime: { type: 'number' }
              }
            },
            circuitBreakerStats: {
              type: 'object',
              additionalProperties: {
                type: 'object',
                properties: {
                  state: { type: 'string' },
                  totalFailures: { type: 'number' },
                  totalSuccesses: { type: 'number' },
                  uptimePercentage: { type: 'number' },
                  averageFailureRecovery: { type: 'number' }
                }
              }
            },
            fallbackUsage: {
              type: 'object',
              properties: {
                totalFallbackCalls: { type: 'number' },
                fallbackSuccessRate: { type: 'number' },
                mostUsedFallbacks: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      service: { type: 'string' },
                      usageCount: { type: 'number' }
                    }
                  }
                }
              }
            },
            recommendations: {
              type: 'array',
              items: { type: 'string' }
            }
          }
        }
      }
    },
    preHandler: []
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      if (!user?.role || user.role !== 'ADMIN') {
        return reply.status(403).send({
          error: 'Forbidden',
          message: 'Admin access required'
        });
      }

      const degradationStatus = fastify.gracefulDegradationService.getDegradationStatus();
      const circuitBreakers = getAllCircuitBreakers();

      // Generate system health assessment
      const overallStatus = degradationStatus.isHealthy 
        ? 'healthy' 
        : degradationStatus.degradedServices.length > 2 
          ? 'critical' 
          : 'degraded';

      // Circuit breaker statistics
      const circuitBreakerStats: Record<string, any> = {};
      for (const [name, breaker] of circuitBreakers) {
        const state = breaker.getState();
        const totalCalls = state.failureCount + state.successCount;
        const uptimePercentage = totalCalls > 0 
          ? (state.successCount / totalCalls) * 100 
          : 100;

        circuitBreakerStats[name] = {
          state: state.state,
          totalFailures: state.failureCount,
          totalSuccesses: state.successCount,
          uptimePercentage: Math.round(uptimePercentage * 100) / 100,
          averageFailureRecovery: 0 // Would need historical data
        };
      }

      // Generate recommendations
      const recommendations: string[] = [];
      
      if (degradationStatus.degradedServices.length > 0) {
        recommendations.push(`${degradationStatus.degradedServices.length} service(s) are currently degraded: ${degradationStatus.degradedServices.join(', ')}`);
      }
      
      if (degradationStatus.queuedOperations > 100) {
        recommendations.push(`High number of queued operations (${degradationStatus.queuedOperations}). Consider processing manually.`);
      }
      
      if (degradationStatus.cacheSize > 1000) {
        recommendations.push(`Large fallback cache (${degradationStatus.cacheSize} entries). Monitor memory usage.`);
      }

      for (const [name, stats] of Object.entries(circuitBreakerStats)) {
        if (stats.uptimePercentage < 95) {
          recommendations.push(`Service ${name} has low uptime (${stats.uptimePercentage}%). Investigate underlying issues.`);
        }
      }

      if (recommendations.length === 0) {
        recommendations.push('System is operating normally with good resilience metrics.');
      }

      const report = {
        timestamp: new Date().toISOString(),
        systemHealth: {
          overallStatus,
          uptime: process.uptime(),
          totalDegradationEvents: degradationStatus.degradedServices.length,
          averageRecoveryTime: 0 // Would need historical data
        },
        circuitBreakerStats,
        fallbackUsage: {
          totalFallbackCalls: 0, // Would need metrics
          fallbackSuccessRate: 0, // Would need metrics
          mostUsedFallbacks: [] // Would need metrics
        },
        recommendations
      };

      logger.info({
        userId: user.id,
        overallStatus,
        degradedServices: degradationStatus.degradedServices.length
      }, 'Admin requested resilience report');

      return reply.send(report);

    } catch (error) {
      logger.error({ error }, 'Failed to generate resilience report');
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to generate resilience report'
      });
    }
  });
}