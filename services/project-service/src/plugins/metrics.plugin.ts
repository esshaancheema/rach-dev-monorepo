import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

const metricsPlugin = fp(async (fastify: FastifyInstance) => {
  // Simple in-memory metrics storage
  const metrics = {
    requests: {
      total: 0,
      by_method: new Map<string, number>(),
      by_status: new Map<number, number>(),
      by_route: new Map<string, number>(),
    },
    response_times: [] as number[],
    errors: {
      total: 0,
      by_type: new Map<string, number>(),
    },
    websocket: {
      connections: 0,
      messages: 0,
    },
  };

  // Track request metrics
  fastify.addHook('onRequest', async (request, reply) => {
    metrics.requests.total++;
    
    // Track by method
    const methodCount = metrics.requests.by_method.get(request.method) || 0;
    metrics.requests.by_method.set(request.method, methodCount + 1);
    
    // Track by route
    const routeCount = metrics.requests.by_route.get(request.url) || 0;
    metrics.requests.by_route.set(request.url, routeCount + 1);
  });

  // Track response metrics
  fastify.addHook('onResponse', async (request, reply) => {
    // Track by status code
    const statusCount = metrics.requests.by_status.get(reply.statusCode) || 0;
    metrics.requests.by_status.set(reply.statusCode, statusCount + 1);
    
    // Track response time
    const responseTime = reply.getResponseTime();
    metrics.response_times.push(responseTime);
    
    // Keep only last 1000 response times to prevent memory leak
    if (metrics.response_times.length > 1000) {
      metrics.response_times = metrics.response_times.slice(-1000);
    }
  });

  // Track error metrics
  fastify.addHook('onError', async (request, reply, error) => {
    metrics.errors.total++;
    
    const errorType = error.constructor.name;
    const errorCount = metrics.errors.by_type.get(errorType) || 0;
    metrics.errors.by_type.set(errorType, errorCount + 1);
  });

  // Expose metrics endpoint
  fastify.get('/internal/metrics', async (request, reply) => {
    const responseTimeStats = metrics.response_times.length > 0 ? {
      count: metrics.response_times.length,
      avg: metrics.response_times.reduce((a, b) => a + b, 0) / metrics.response_times.length,
      min: Math.min(...metrics.response_times),
      max: Math.max(...metrics.response_times),
      p95: metrics.response_times.sort((a, b) => a - b)[Math.floor(metrics.response_times.length * 0.95)],
    } : null;

    return {
      service: 'project-service',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      requests: {
        total: metrics.requests.total,
        by_method: Object.fromEntries(metrics.requests.by_method),
        by_status: Object.fromEntries(metrics.requests.by_status),
        by_route: Object.fromEntries(metrics.requests.by_route),
      },
      response_times: responseTimeStats,
      errors: {
        total: metrics.errors.total,
        by_type: Object.fromEntries(metrics.errors.by_type),
        error_rate: metrics.requests.total > 0 ? metrics.errors.total / metrics.requests.total : 0,
      },
      websocket: metrics.websocket,
    };
  });

  // Add helper functions to update WebSocket metrics
  fastify.decorate('incrementWebSocketConnections', () => {
    metrics.websocket.connections++;
  });

  fastify.decorate('decrementWebSocketConnections', () => {
    metrics.websocket.connections = Math.max(0, metrics.websocket.connections - 1);
  });

  fastify.decorate('incrementWebSocketMessages', () => {
    metrics.websocket.messages++;
  });

  fastify.log.info('Metrics collection enabled at /internal/metrics');
});

// Extend Fastify instance type
declare module 'fastify' {
  interface FastifyInstance {
    incrementWebSocketConnections(): void;
    decrementWebSocketConnections(): void;
    incrementWebSocketMessages(): void;
  }
}

export default metricsPlugin;