import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import fp from 'fastify-plugin';
import { logger } from '../utils/logger';
import { BillingRedis } from '../utils/redis';
import { StripeService } from '../services/stripe.service';

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    redis: {
      status: 'healthy' | 'unhealthy';
      responseTime?: number;
      error?: string;
    };
    stripe: {
      status: 'healthy' | 'unhealthy';
      responseTime?: number;
      error?: string;
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

  const stripeService = new StripeService();

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
        redis: await checkRedis(),
        stripe: await checkStripe(),
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
      healthStatus.checks.redis.status,
      healthStatus.checks.stripe.status,
    ];

    if (allChecks.includes('unhealthy')) {
      healthStatus.status = 'unhealthy';
    }

    const httpStatus = healthStatus.status === 'healthy' ? 200 : 503;

    return reply.code(httpStatus).send(healthStatus);
  });

  // Readiness check endpoint
  fastify.get('/ready', async (request, reply) => {
    try {
      // Check critical dependencies
      const redisCheck = await checkRedis();
      const stripeCheck = await checkStripe();
      
      if (redisCheck.status === 'unhealthy') {
        return reply.code(503).send({
          status: 'not ready',
          error: 'Redis is not available',
          timestamp: new Date().toISOString(),
        });
      }

      if (stripeCheck.status === 'unhealthy') {
        return reply.code(503).send({
          status: 'not ready',
          error: 'Stripe is not available',
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
        name: 'billing-service',
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
      billing: await getBillingMetrics(),
    };

    return reply.code(200).send(metrics);
  });

  async function checkRedis(): Promise<{ 
    status: 'healthy' | 'unhealthy'; 
    responseTime?: number; 
    error?: string; 
  }> {
    try {
      const startTime = Date.now();
      await BillingRedis.ping();
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

  async function checkStripe(): Promise<{ 
    status: 'healthy' | 'unhealthy'; 
    responseTime?: number; 
    error?: string; 
  }> {
    try {
      const startTime = Date.now();
      await stripeService.healthCheck();
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'healthy',
        responseTime,
      };
    } catch (error) {
      logger.error({ error }, 'Stripe health check failed');
      
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown Stripe error',
      };
    }
  }

  async function getBillingMetrics() {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const [
        subscriptionsCreated,
        revenue,
        successfulPayments,
        failedPayments,
      ] = await Promise.all([
        BillingRedis.getMetrics('subscriptions_created', 1),
        BillingRedis.getMetrics('revenue', 1),
        BillingRedis.getMetrics('successful_payments', 1),
        BillingRedis.getMetrics('failed_payments', 1),
      ]);

      return {
        subscriptionsCreated: subscriptionsCreated[today] || 0,
        revenue: revenue[today] || 0,
        successfulPayments: successfulPayments[today] || 0,
        failedPayments: failedPayments[today] || 0,
        paymentSuccessRate: 
          (successfulPayments[today] || 0) + (failedPayments[today] || 0) > 0
            ? ((successfulPayments[today] || 0) / 
               ((successfulPayments[today] || 0) + (failedPayments[today] || 0))) * 100
            : 100,
      };
    } catch (error) {
      logger.error({ error }, 'Failed to get billing metrics');
      return {};
    }
  }
}

export default fp(healthPlugin, {
  name: 'health',
});