import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import fp from 'fastify-plugin';
import { logger } from '../utils/logger';
import { BillingRedis } from '../utils/redis';

interface RequestMetrics {
  timestamp: number;
  method: string;
  url: string;
  statusCode: number;
  responseTime: number;
  userId?: string;
  organizationId?: string;
  userAgent?: string;
  ip: string;
}

async function metricsPlugin(fastify: FastifyInstance, options: FastifyPluginOptions) {
  const requestBuffer: RequestMetrics[] = [];
  const BUFFER_SIZE = 1000;
  const FLUSH_INTERVAL = 30000; // 30 seconds

  // Track request metrics
  fastify.addHook('onRequest', async (request, reply) => {
    (request as any).startTime = Date.now();
  });

  fastify.addHook('onResponse', async (request, reply) => {
    const responseTime = Date.now() - (request as any).startTime;
    const userId = request.user?.id;
    const organizationId = request.user?.organizationId;

    const metrics: RequestMetrics = {
      timestamp: Date.now(),
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      responseTime,
      userId,
      organizationId,
      userAgent: request.headers['user-agent'],
      ip: request.ip,
    };

    requestBuffer.push(metrics);

    // Flush buffer if it's full
    if (requestBuffer.length >= BUFFER_SIZE) {
      await flushMetrics();
    }

    // Log slow requests
    if (responseTime > 3000) { // 3 seconds
      logger.warn({
        url: request.url,
        method: request.method,
        responseTime,
        userId,
        organizationId,
      }, 'Slow request detected');
    }

    // Track billing-specific metrics
    if (request.url.includes('/subscriptions') && reply.statusCode < 400) {
      if (request.method === 'POST') {
        await BillingRedis.incrementMetric('api_subscription_creates');
      } else if (request.method === 'PUT') {
        await BillingRedis.incrementMetric('api_subscription_updates');
      }
    }

    if (request.url.includes('/payments') && reply.statusCode < 400) {
      await BillingRedis.incrementMetric('api_payment_requests');
    }

    if (request.url.includes('/usage/track') && reply.statusCode < 400) {
      await BillingRedis.incrementMetric('api_usage_tracking');
    }
  });

  // Periodic flush
  const flushInterval = setInterval(async () => {
    if (requestBuffer.length > 0) {
      await flushMetrics();
    }
  }, FLUSH_INTERVAL);

  // Cleanup on server close
  fastify.addHook('onClose', async () => {
    clearInterval(flushInterval);
    if (requestBuffer.length > 0) {
      await flushMetrics();
    }
  });

  // Metrics endpoints
  fastify.get('/metrics/requests', async (request, reply) => {
    try {
      const metrics = await getRequestMetrics();
      return reply.code(200).send(metrics);
    } catch (error) {
      logger.error({ error }, 'Failed to get request metrics');
      return reply.code(500).send({ error: 'Failed to get metrics' });
    }
  });

  fastify.get('/metrics/billing', async (request, reply) => {
    try {
      const metrics = await getBillingMetrics();
      return reply.code(200).send(metrics);
    } catch (error) {
      logger.error({ error }, 'Failed to get billing metrics');
      return reply.code(500).send({ error: 'Failed to get metrics' });
    }
  });

  fastify.get('/metrics/performance', async (request, reply) => {
    try {
      const metrics = await getPerformanceMetrics();
      return reply.code(200).send(metrics);
    } catch (error) {
      logger.error({ error }, 'Failed to get performance metrics');
      return reply.code(500).send({ error: 'Failed to get metrics' });
    }
  });

  // Full metrics dashboard endpoint
  fastify.get('/metrics/dashboard', async (request, reply) => {
    try {
      const [requests, billing, performance] = await Promise.all([
        getRequestMetrics(),
        getBillingMetrics(),
        getPerformanceMetrics(),
      ]);

      const dashboard = {
        requests,
        billing,
        performance,
        timestamp: new Date().toISOString(),
      };

      return reply.code(200).send(dashboard);
    } catch (error) {
      logger.error({ error }, 'Failed to get dashboard metrics');
      return reply.code(500).send({ error: 'Failed to get metrics' });
    }
  });

  async function flushMetrics() {
    if (requestBuffer.length === 0) return;

    try {
      const metricsToFlush = requestBuffer.splice(0);
      
      // Store metrics aggregations in Redis
      for (const metric of metricsToFlush) {
        // Track general request metrics
        await BillingRedis.incrementMetric('total_requests');
        
        if (metric.statusCode >= 400) {
          await BillingRedis.incrementMetric('error_requests');
        }

        // Track response time buckets
        if (metric.responseTime < 100) {
          await BillingRedis.incrementMetric('response_time_fast'); // < 100ms
        } else if (metric.responseTime < 500) {
          await BillingRedis.incrementMetric('response_time_medium'); // 100-500ms
        } else {
          await BillingRedis.incrementMetric('response_time_slow'); // > 500ms
        }
      }
      
      logger.debug({ count: metricsToFlush.length }, 'Flushed metrics to storage');
    } catch (error) {
      logger.error({ error }, 'Failed to flush metrics');
    }
  }

  async function getRequestMetrics() {
    const [totalRequests, errorRequests] = await Promise.all([
      BillingRedis.getMetrics('total_requests', 7),
      BillingRedis.getMetrics('error_requests', 7),
    ]);

    return {
      totalRequests: Object.values(totalRequests).reduce((sum, val) => sum + val, 0),
      errorRequests: Object.values(errorRequests).reduce((sum, val) => sum + val, 0),
      dailyBreakdown: {
        totalRequests,
        errorRequests,
      },
    };
  }

  async function getBillingMetrics() {
    const [
      subscriptionsCreated,
      revenue,
      successfulPayments,
      failedPayments,
      apiSubscriptionCreates,
      apiPaymentRequests,
      apiUsageTracking,
    ] = await Promise.all([
      BillingRedis.getMetrics('subscriptions_created', 7),
      BillingRedis.getMetrics('revenue', 7),
      BillingRedis.getMetrics('successful_payments', 7),
      BillingRedis.getMetrics('failed_payments', 7),
      BillingRedis.getMetrics('api_subscription_creates', 7),
      BillingRedis.getMetrics('api_payment_requests', 7),
      BillingRedis.getMetrics('api_usage_tracking', 7),
    ]);

    const totalRevenue = Object.values(revenue).reduce((sum, val) => sum + val, 0);
    const totalSuccessfulPayments = Object.values(successfulPayments).reduce((sum, val) => sum + val, 0);
    const totalFailedPayments = Object.values(failedPayments).reduce((sum, val) => sum + val, 0);

    return {
      subscriptions: {
        created: Object.values(subscriptionsCreated).reduce((sum, val) => sum + val, 0),
        dailyBreakdown: subscriptionsCreated,
      },
      revenue: {
        total: totalRevenue,
        dailyBreakdown: revenue,
      },
      payments: {
        successful: totalSuccessfulPayments,
        failed: totalFailedPayments,
        successRate: totalSuccessfulPayments + totalFailedPayments > 0
          ? (totalSuccessfulPayments / (totalSuccessfulPayments + totalFailedPayments)) * 100
          : 100,
        dailyBreakdown: {
          successful: successfulPayments,
          failed: failedPayments,
        },
      },
      apiUsage: {
        subscriptionOperations: Object.values(apiSubscriptionCreates).reduce((sum, val) => sum + val, 0),
        paymentRequests: Object.values(apiPaymentRequests).reduce((sum, val) => sum + val, 0),
        usageTracking: Object.values(apiUsageTracking).reduce((sum, val) => sum + val, 0),
      },
    };
  }

  async function getPerformanceMetrics() {
    const [fast, medium, slow] = await Promise.all([
      BillingRedis.getMetrics('response_time_fast', 7),
      BillingRedis.getMetrics('response_time_medium', 7),
      BillingRedis.getMetrics('response_time_slow', 7),
    ]);

    const totalFast = Object.values(fast).reduce((sum, val) => sum + val, 0);
    const totalMedium = Object.values(medium).reduce((sum, val) => sum + val, 0);
    const totalSlow = Object.values(slow).reduce((sum, val) => sum + val, 0);
    const totalRequests = totalFast + totalMedium + totalSlow;

    return {
      responseTime: {
        fast: {
          count: totalFast,
          percentage: totalRequests > 0 ? (totalFast / totalRequests) * 100 : 0,
        },
        medium: {
          count: totalMedium,
          percentage: totalRequests > 0 ? (totalMedium / totalRequests) * 100 : 0,
        },
        slow: {
          count: totalSlow,
          percentage: totalRequests > 0 ? (totalSlow / totalRequests) * 100 : 0,
        },
      },
      dailyBreakdown: {
        fast,
        medium,
        slow,
      },
    };
  }
}

export default fp(metricsPlugin, {
  name: 'metrics',
});