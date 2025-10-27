import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import fp from 'fastify-plugin';
import { logger } from '../utils/logger';
import { AIRedisService } from '../utils/redis';

interface RequestMetrics {
  timestamp: number;
  method: string;
  url: string;
  statusCode: number;
  responseTime: number;
  userId?: string;
  userAgent?: string;
  ip: string;
}

interface ServiceMetrics {
  requests: {
    total: number;
    byMethod: Record<string, number>;
    byStatus: Record<string, number>;
    byEndpoint: Record<string, number>;
  };
  performance: {
    averageResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    slowestEndpoints: Array<{
      endpoint: string;
      averageTime: number;
      requestCount: number;
    }>;
  };
  errors: {
    total: number;
    byType: Record<string, number>;
    errorRate: number;
  };
  users: {
    activeUsers: number;
    topUsers: Array<{
      userId: string;
      requestCount: number;
      tokenUsage: number;
    }>;
  };
  ai: {
    totalTokens: number;
    totalCost: number;
    byModel: Record<string, {
      requests: number;
      tokens: number;
      cost: number;
    }>;
    byProvider: Record<string, {
      requests: number;
      tokens: number;
      cost: number;
      averageResponseTime: number;
    }>;
  };
}

async function metricsPlugin(fastify: FastifyInstance, options: FastifyPluginOptions) {
  const requestBuffer: RequestMetrics[] = [];
  const BUFFER_SIZE = 10000;
  const FLUSH_INTERVAL = 30000; // 30 seconds

  // Track request metrics
  fastify.addHook('onRequest', async (request, reply) => {
    (request as any).startTime = Date.now();
  });

  fastify.addHook('onResponse', async (request, reply) => {
    const responseTime = Date.now() - (request as any).startTime;
    const userId = (request as any).user?.id;

    const metrics: RequestMetrics = {
      timestamp: Date.now(),
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      responseTime,
      userId,
      userAgent: request.headers['user-agent'],
      ip: request.ip,
    };

    requestBuffer.push(metrics);

    // Flush buffer if it's full
    if (requestBuffer.length >= BUFFER_SIZE) {
      await flushMetrics();
    }

    // Log slow requests
    if (responseTime > 5000) { // 5 seconds
      logger.warn({
        url: request.url,
        method: request.method,
        responseTime,
        userId,
      }, 'Slow request detected');
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

  fastify.get('/metrics/performance', async (request, reply) => {
    try {
      const metrics = await getPerformanceMetrics();
      return reply.code(200).send(metrics);
    } catch (error) {
      logger.error({ error }, 'Failed to get performance metrics');
      return reply.code(500).send({ error: 'Failed to get metrics' });
    }
  });

  fastify.get('/metrics/errors', async (request, reply) => {
    try {
      const metrics = await getErrorMetrics();
      return reply.code(200).send(metrics);
    } catch (error) {
      logger.error({ error }, 'Failed to get error metrics');
      return reply.code(500).send({ error: 'Failed to get metrics' });
    }
  });

  fastify.get('/metrics/ai', async (request, reply) => {
    try {
      const metrics = await getAIMetrics();
      return reply.code(200).send(metrics);
    } catch (error) {
      logger.error({ error }, 'Failed to get AI metrics');
      return reply.code(500).send({ error: 'Failed to get metrics' });
    }
  });

  fastify.get('/metrics/users', async (request, reply) => {
    try {
      const metrics = await getUserMetrics();
      return reply.code(200).send(metrics);
    } catch (error) {
      logger.error({ error }, 'Failed to get user metrics');
      return reply.code(500).send({ error: 'Failed to get metrics' });
    }
  });

  // Full metrics dashboard endpoint
  fastify.get('/metrics/dashboard', async (request, reply) => {
    try {
      const [requests, performance, errors, users, ai] = await Promise.all([
        getRequestMetrics(),
        getPerformanceMetrics(),
        getErrorMetrics(),
        getUserMetrics(),
        getAIMetrics(),
      ]);

      const dashboard: ServiceMetrics = {
        requests,
        performance,
        errors,
        users,
        ai,
      };

      return reply.code(200).send(dashboard);
    } catch (error) {
      logger.error({ error }, 'Failed to get dashboard metrics');
      return reply.code(500).send({ error: 'Failed to get metrics' });
    }
  });

  // Real-time metrics endpoint (for WebSocket or Server-Sent Events)
  fastify.get('/metrics/realtime', async (request, reply) => {
    reply.type('text/event-stream');
    reply.header('Cache-Control', 'no-cache');
    reply.header('Connection', 'keep-alive');
    reply.header('Access-Control-Allow-Origin', '*');

    const sendMetrics = async () => {
      try {
        const realtimeMetrics = {
          timestamp: Date.now(),
          activeConnections: fastify.server.connections || 0,
          requestsPerMinute: await getRequestsPerMinute(),
          averageResponseTime: await getCurrentAverageResponseTime(),
          errorRate: await getCurrentErrorRate(),
          topEndpoints: await getTopEndpoints(5),
        };

        const data = JSON.stringify(realtimeMetrics);
        reply.raw.write(`data: ${data}\n\n`);
      } catch (error) {
        logger.error({ error }, 'Failed to send realtime metrics');
      }
    };

    // Send initial metrics
    await sendMetrics();

    // Send updates every 5 seconds
    const interval = setInterval(sendMetrics, 5000);

    // Cleanup on client disconnect
    request.raw.on('close', () => {
      clearInterval(interval);
    });
  });

  async function flushMetrics() {
    if (requestBuffer.length === 0) return;

    try {
      const metricsToFlush = requestBuffer.splice(0);
      
      // Store metrics in Redis for analysis
      await AIRedisService.storeRequestMetrics(metricsToFlush);
      
      logger.debug({ count: metricsToFlush.length }, 'Flushed metrics to storage');
    } catch (error) {
      logger.error({ error }, 'Failed to flush metrics');
    }
  }

  async function getRequestMetrics() {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    
    const metrics = await AIRedisService.getRequestMetrics(oneHourAgo, now);
    
    return {
      total: metrics.length,
      byMethod: groupBy(metrics, 'method'),
      byStatus: groupBy(metrics, 'statusCode'),
      byEndpoint: groupBy(metrics, (m: RequestMetrics) => `${m.method} ${m.url.split('?')[0]}`),
    };
  }

  async function getPerformanceMetrics() {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    
    const metrics = await AIRedisService.getRequestMetrics(oneHourAgo, now);
    const responseTimes = metrics.map(m => m.responseTime).sort((a, b) => a - b);
    
    const averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0;
    
    const p95Index = Math.floor(responseTimes.length * 0.95);
    const p99Index = Math.floor(responseTimes.length * 0.99);
    
    const endpointTimes = groupBy(metrics, (m: RequestMetrics) => `${m.method} ${m.url.split('?')[0]}`);
    const slowestEndpoints = Object.entries(endpointTimes)
      .map(([endpoint, requests]: [string, any[]]) => ({
        endpoint,
        averageTime: requests.reduce((sum, req) => sum + req.responseTime, 0) / requests.length,
        requestCount: requests.length,
      }))
      .sort((a, b) => b.averageTime - a.averageTime)
      .slice(0, 10);

    return {
      averageResponseTime,
      p95ResponseTime: responseTimes[p95Index] || 0,
      p99ResponseTime: responseTimes[p99Index] || 0,
      slowestEndpoints,
    };
  }

  async function getErrorMetrics() {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    
    const metrics = await AIRedisService.getRequestMetrics(oneHourAgo, now);
    const errors = metrics.filter(m => m.statusCode >= 400);
    
    return {
      total: errors.length,
      byType: groupBy(errors, 'statusCode'),
      errorRate: metrics.length > 0 ? (errors.length / metrics.length) * 100 : 0,
    };
  }

  async function getUserMetrics() {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    
    const metrics = await AIRedisService.getRequestMetrics(oneHourAgo, now);
    const userMetrics = metrics.filter(m => m.userId);
    
    const userCounts = groupBy(userMetrics, 'userId');
    const topUsers = Object.entries(userCounts)
      .map(([userId, requests]: [string, any[]]) => ({
        userId,
        requestCount: requests.length,
        tokenUsage: 0, // Would need to be calculated from AI usage
      }))
      .sort((a, b) => b.requestCount - a.requestCount)
      .slice(0, 10);

    return {
      activeUsers: Object.keys(userCounts).length,
      topUsers,
    };
  }

  async function getAIMetrics() {
    // This would be retrieved from Redis where AI usage is tracked
    return {
      totalTokens: 0,
      totalCost: 0,
      byModel: {},
      byProvider: {},
    };
  }

  async function getRequestsPerMinute() {
    const now = Date.now();
    const oneMinuteAgo = now - (60 * 1000);
    const metrics = await AIRedisService.getRequestMetrics(oneMinuteAgo, now);
    return metrics.length;
  }

  async function getCurrentAverageResponseTime() {
    const now = Date.now();
    const fiveMinutesAgo = now - (5 * 60 * 1000);
    const metrics = await AIRedisService.getRequestMetrics(fiveMinutesAgo, now);
    
    if (metrics.length === 0) return 0;
    
    return metrics.reduce((sum, m) => sum + m.responseTime, 0) / metrics.length;
  }

  async function getCurrentErrorRate() {
    const now = Date.now();
    const fiveMinutesAgo = now - (5 * 60 * 1000);
    const metrics = await AIRedisService.getRequestMetrics(fiveMinutesAgo, now);
    
    if (metrics.length === 0) return 0;
    
    const errors = metrics.filter(m => m.statusCode >= 400);
    return (errors.length / metrics.length) * 100;
  }

  async function getTopEndpoints(limit: number = 5) {
    const now = Date.now();
    const fiveMinutesAgo = now - (5 * 60 * 1000);
    const metrics = await AIRedisService.getRequestMetrics(fiveMinutesAgo, now);
    
    const endpointCounts = groupBy(metrics, (m: RequestMetrics) => `${m.method} ${m.url.split('?')[0]}`);
    
    return Object.entries(endpointCounts)
      .map(([endpoint, requests]: [string, any[]]) => ({
        endpoint,
        count: requests.length,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  function groupBy<T>(array: T[], key: string | ((item: T) => string)): Record<string, T[]> {
    return array.reduce((groups: Record<string, T[]>, item: T) => {
      const groupKey = typeof key === 'function' ? key(item) : (item as any)[key];
      const groupValue = String(groupKey);
      
      if (!groups[groupValue]) {
        groups[groupValue] = [];
      }
      
      groups[groupValue].push(item);
      return groups;
    }, {});
  }
}

export default fp(metricsPlugin, {
  name: 'metrics',
});