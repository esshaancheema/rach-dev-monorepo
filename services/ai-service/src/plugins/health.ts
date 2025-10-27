import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import fp from 'fastify-plugin';
import { logger } from '../utils/logger';
import { AIRedisService } from '../utils/redis';

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database: {
      status: 'healthy' | 'unhealthy';
      responseTime?: number;
      error?: string;
    };
    redis: {
      status: 'healthy' | 'unhealthy';
      responseTime?: number;
      error?: string;
    };
    aiProviders: {
      openai: {
        status: 'healthy' | 'unhealthy' | 'degraded';
        responseTime?: number;
        error?: string;
      };
      anthropic: {
        status: 'healthy' | 'unhealthy' | 'degraded';
        responseTime?: number;
        error?: string;
      };
      google: {
        status: 'healthy' | 'unhealthy' | 'degraded';
        responseTime?: number;
        error?: string;
      };
    };
  };
  metrics: {
    totalRequests: number;
    totalErrors: number;
    averageResponseTime: number;
    uptime: number;
  };
}

async function healthPlugin(fastify: FastifyInstance, options: FastifyPluginOptions) {
  const startTime = Date.now();
  let totalRequests = 0;
  let totalErrors = 0;
  let totalResponseTime = 0;

  // Track request metrics
  fastify.addHook('onRequest', async (request, reply) => {
    totalRequests++;
    (request as any).startTime = Date.now();
  });

  fastify.addHook('onResponse', async (request, reply) => {
    const responseTime = Date.now() - (request as any).startTime;
    totalResponseTime += responseTime;
    
    if (reply.statusCode >= 400) {
      totalErrors++;
    }
  });

  // Health check endpoint
  fastify.get('/health', async (request, reply) => {
    const healthStatus: HealthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      uptime: Date.now() - startTime,
      checks: {
        database: await checkDatabase(),
        redis: await checkRedis(),
        aiProviders: {
          openai: await checkAIProvider('openai'),
          anthropic: await checkAIProvider('anthropic'),
          google: await checkAIProvider('google'),
        },
      },
      metrics: {
        totalRequests,
        totalErrors,
        averageResponseTime: totalRequests > 0 ? totalResponseTime / totalRequests : 0,
        uptime: Date.now() - startTime,
      },
    };

    // Determine overall health status
    const allChecks = [
      healthStatus.checks.database.status,
      healthStatus.checks.redis.status,
      healthStatus.checks.aiProviders.openai.status,
      healthStatus.checks.aiProviders.anthropic.status,
      healthStatus.checks.aiProviders.google.status,
    ];

    if (allChecks.includes('unhealthy')) {
      healthStatus.status = 'unhealthy';
    } else if (allChecks.includes('degraded')) {
      healthStatus.status = 'degraded';
    }

    const httpStatus = healthStatus.status === 'healthy' ? 200 : 
                     healthStatus.status === 'degraded' ? 200 : 503;

    return reply.code(httpStatus).send(healthStatus);
  });

  // Readiness check endpoint
  fastify.get('/ready', async (request, reply) => {
    try {
      // Check critical dependencies
      const redisCheck = await checkRedis();
      
      if (redisCheck.status === 'unhealthy') {
        return reply.code(503).send({
          status: 'not ready',
          error: 'Redis is not available',
          timestamp: new Date().toISOString(),
        });
      }

      return reply.code(200).send({
        status: 'ready',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error({ error }, 'Readiness check failed');
      
      return reply.code(503).send({
        status: 'not ready',
        error: 'Service not ready',
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Liveness check endpoint
  fastify.get('/alive', async (request, reply) => {
    return reply.code(200).send({
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: Date.now() - startTime,
    });
  });

  // Detailed metrics endpoint
  fastify.get('/metrics', async (request, reply) => {
    const uptime = Date.now() - startTime;
    
    const metrics = {
      service: {
        name: 'ai-service',
        version: process.env.npm_package_version || '1.0.0',
        uptime,
        startTime: new Date(startTime).toISOString(),
      },
      requests: {
        total: totalRequests,
        errors: totalErrors,
        errorRate: totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0,
        averageResponseTime: totalRequests > 0 ? totalResponseTime / totalRequests : 0,
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        memory: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
      },
      aiProviders: await getAIProviderMetrics(),
    };

    return reply.code(200).send(metrics);
  });
}

async function checkDatabase(): Promise<{ status: 'healthy' | 'unhealthy'; responseTime?: number; error?: string }> {
  try {
    const startTime = Date.now();
    
    // In a real implementation, you would check your database connection
    // For now, we'll assume it's healthy since we don't have a direct DB connection in AI service
    
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'healthy',
      responseTime,
    };
  } catch (error) {
    logger.error({ error }, 'Database health check failed');
    
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown database error',
    };
  }
}

async function checkRedis(): Promise<{ status: 'healthy' | 'unhealthy'; responseTime?: number; error?: string }> {
  try {
    const startTime = Date.now();
    
    // Test Redis connection
    await AIRedisService.ping();
    
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'healthy',
      responseTime,
    };
  } catch (error) {
    logger.error({ error }, 'Redis health check failed');
    
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown Redis error',
    };
  }
}

async function checkAIProvider(provider: string): Promise<{ 
  status: 'healthy' | 'unhealthy' | 'degraded'; 
  responseTime?: number; 
  error?: string; 
}> {
  try {
    const providerStatus = await AIRedisService.getProviderStatus(provider);
    
    if (!providerStatus) {
      return { status: 'unhealthy', error: 'No status available' };
    }
    
    return {
      status: providerStatus.status as 'healthy' | 'unhealthy' | 'degraded',
      responseTime: providerStatus.responseTime,
    };
  } catch (error) {
    logger.error({ error, provider }, 'AI provider health check failed');
    
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown provider error',
    };
  }
}

async function getAIProviderMetrics() {
  try {
    const providers = ['openai', 'anthropic', 'google'];
    const metrics: any = {};
    
    for (const provider of providers) {
      const providerMetrics = await AIRedisService.getProviderMetrics(provider);
      metrics[provider] = providerMetrics || {
        totalRequests: 0,
        totalTokens: 0,
        totalCost: 0,
        averageResponseTime: 0,
        errorRate: 0,
      };
    }
    
    return metrics;
  } catch (error) {
    logger.error({ error }, 'Failed to get AI provider metrics');
    return {};
  }
}

export default fp(healthPlugin, {
  name: 'health',
});