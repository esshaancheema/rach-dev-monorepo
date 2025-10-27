import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { messageQueueProcessor } from '../services/message-queue-processor.service';
import { logger } from '../utils/logger';

// Schema definitions
const queueProcessSchema = z.object({
  queue: z.enum(['email', 'sms', 'all'])
});

export async function queueManagementRoutes(fastify: FastifyInstance) {
  // Get queue statistics
  fastify.get('/queue/stats', {
    preHandler: [fastify.requireAdmin],
    schema: {
      summary: 'Get queue statistics',
      description: 'Get current statistics for email and SMS message queues',
      tags: ['Admin - System Management'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                statistics: {
                  type: 'object',
                  properties: {
                    emailQueue: {
                      type: 'object',
                      properties: {
                        length: { type: 'number' },
                        processedCount: { type: 'number' },
                        failedCount: { type: 'number' }
                      }
                    },
                    smsQueue: {
                      type: 'object',
                      properties: {
                        length: { type: 'number' },
                        processedCount: { type: 'number' },
                        failedCount: { type: 'number' }
                      }
                    },
                    lastProcessedAt: { type: 'string', nullable: true }
                  }
                },
                circuitBreakers: {
                  type: 'object',
                  properties: {
                    email: { type: 'object' },
                    sms: { type: 'object' }
                  }
                },
                servicesHealthy: { type: 'boolean' }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const statistics = messageQueueProcessor.getStatistics();
      const circuitBreakers = messageQueueProcessor.getCircuitBreakerStatus();
      const servicesHealthy = messageQueueProcessor.areServicesHealthy();

      return reply.send({
        success: true,
        data: {
          statistics,
          circuitBreakers,
          servicesHealthy
        }
      });
    } catch (error) {
      logger.error('Failed to get queue statistics:', error);
      return reply.status(500).send({
        success: false,
        error: 'QUEUE_STATS_ERROR',
        message: 'Failed to retrieve queue statistics'
      });
    }
  });

  // Manually process queue
  fastify.post('/queue/process', {
    preHandler: [fastify.requireAdmin],
    schema: {
      summary: 'Manually process message queue',
      description: 'Manually trigger processing of email or SMS queues',
      tags: ['Admin - System Management'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        properties: {
          queue: { type: 'string', enum: ['email', 'sms', 'all'] }
        },
        required: ['queue']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                queuesProcessed: {
                  type: 'array',
                  items: { type: 'string' }
                }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { queue } = queueProcessSchema.parse(request.body);
      const user = (request as any).user;
      const queuesProcessed: string[] = [];

      logger.info('Manual queue processing triggered', {
        queue,
        adminId: user.id,
        adminEmail: user.email
      });

      if (queue === 'email' || queue === 'all') {
        await messageQueueProcessor.processEmailQueueManually();
        queuesProcessed.push('email');
      }

      if (queue === 'sms' || queue === 'all') {
        await messageQueueProcessor.processSmsQueueManually();
        queuesProcessed.push('sms');
      }

      return reply.send({
        success: true,
        message: `Successfully triggered processing for ${queuesProcessed.join(' and ')} queue(s)`,
        data: {
          queuesProcessed
        }
      });
    } catch (error: any) {
      logger.error('Failed to process queue manually:', error);
      
      if (error.message === 'Queue processing already in progress') {
        return reply.status(409).send({
          success: false,
          error: 'QUEUE_PROCESSING_IN_PROGRESS',
          message: 'Queue processing is already in progress. Please try again later.'
        });
      }

      return reply.status(500).send({
        success: false,
        error: 'QUEUE_PROCESS_ERROR',
        message: 'Failed to process message queue'
      });
    }
  });

  // Start queue processor
  fastify.post('/queue/start', {
    preHandler: [fastify.requireAdmin],
    schema: {
      summary: 'Start queue processor',
      description: 'Start the background message queue processor',
      tags: ['Admin - System Management'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      
      messageQueueProcessor.start();
      
      logger.info('Message queue processor started', {
        adminId: user.id,
        adminEmail: user.email
      });

      return reply.send({
        success: true,
        message: 'Message queue processor started successfully'
      });
    } catch (error) {
      logger.error('Failed to start queue processor:', error);
      return reply.status(500).send({
        success: false,
        error: 'QUEUE_START_ERROR',
        message: 'Failed to start message queue processor'
      });
    }
  });

  // Stop queue processor
  fastify.post('/queue/stop', {
    preHandler: [fastify.requireAdmin],
    schema: {
      summary: 'Stop queue processor',
      description: 'Stop the background message queue processor',
      tags: ['Admin - System Management'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      
      messageQueueProcessor.stop();
      
      logger.info('Message queue processor stopped', {
        adminId: user.id,
        adminEmail: user.email
      });

      return reply.send({
        success: true,
        message: 'Message queue processor stopped successfully'
      });
    } catch (error) {
      logger.error('Failed to stop queue processor:', error);
      return reply.status(500).send({
        success: false,
        error: 'QUEUE_STOP_ERROR',
        message: 'Failed to stop message queue processor'
      });
    }
  });

  // Get circuit breaker details for a specific service
  fastify.get('/queue/circuit-breaker/:service', {
    preHandler: [fastify.requireAdmin],
    schema: {
      summary: 'Get circuit breaker details',
      description: 'Get detailed circuit breaker status for email or SMS service',
      tags: ['Admin - System Management'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          service: { type: 'string', enum: ['email', 'sms'] }
        },
        required: ['service']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                service: { type: 'string' },
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
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { service } = request.params as { service: 'email' | 'sms' };
      const circuitBreakers = messageQueueProcessor.getCircuitBreakerStatus();
      
      const circuitBreakerState = service === 'email' 
        ? circuitBreakers.email 
        : circuitBreakers.sms;

      return reply.send({
        success: true,
        data: {
          service,
          ...circuitBreakerState,
          isAvailable: circuitBreakerState.state === 'CLOSED' || 
                      (circuitBreakerState.state === 'HALF_OPEN' && 
                       circuitBreakerState.successCount < 3)
        }
      });
    } catch (error) {
      logger.error('Failed to get circuit breaker details:', error);
      return reply.status(500).send({
        success: false,
        error: 'CIRCUIT_BREAKER_ERROR',
        message: 'Failed to retrieve circuit breaker details'
      });
    }
  });

  logger.info('Queue management routes registered');
}