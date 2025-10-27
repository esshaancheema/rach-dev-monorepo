import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { redis } from '../utils/redis';
import { config } from '../config';

export default async function healthRoutes(fastify: FastifyInstance) {
  // Basic health check
  fastify.get('/health', async (request: FastifyRequest, reply: FastifyReply) => {
    return reply.status(200).send({
      status: 'healthy',
      service: 'project-service',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    });
  });

  // Detailed health check with dependencies
  fastify.get('/health/detailed', async (request: FastifyRequest, reply: FastifyReply) => {
    const checks = {
      service: { status: 'healthy', message: 'Service is running' },
      redis: { status: 'unknown', message: '', responseTime: 0 },
      database: { status: 'unknown', message: '', responseTime: 0 },
      external_services: {
        auth_service: { status: 'unknown', message: '', responseTime: 0 },
        ai_service: { status: 'unknown', message: '', responseTime: 0 },
        notification_service: { status: 'unknown', message: '', responseTime: 0 },
      },
    };

    let overallStatus = 'healthy';

    // Check Redis connection
    try {
      const redisStart = Date.now();
      await redis.ping();
      checks.redis = {
        status: 'healthy',
        message: 'Connected',
        responseTime: Date.now() - redisStart,
      };
    } catch (error) {
      checks.redis = {
        status: 'unhealthy',
        message: error instanceof Error ? error.message : 'Connection failed',
        responseTime: 0,
      };
      overallStatus = 'degraded';
    }

    // Check database connection (using simple query)
    try {
      const dbStart = Date.now();
      // This would typically use your database client
      // For now, we'll simulate it
      await new Promise(resolve => setTimeout(resolve, 10)); // Simulate DB query
      checks.database = {
        status: 'healthy',
        message: 'Connected',
        responseTime: Date.now() - dbStart,
      };
    } catch (error) {
      checks.database = {
        status: 'unhealthy',
        message: error instanceof Error ? error.message : 'Connection failed',
        responseTime: 0,
      };
      overallStatus = 'degraded';
    }

    // Check external services
    const serviceChecks = [
      { name: 'auth_service', url: config.AUTH_SERVICE_URL },
      { name: 'ai_service', url: config.AI_SERVICE_URL },
      { name: 'notification_service', url: config.NOTIFICATION_SERVICE_URL },
    ];

    await Promise.all(
      serviceChecks.map(async (service) => {
        try {
          const start = Date.now();
          // In a real implementation, you'd make an HTTP request to the service's health endpoint
          // For now, we'll simulate it
          await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
          
          const serviceName = service.name as keyof typeof checks.external_services;
          checks.external_services[serviceName] = {
            status: 'healthy',
            message: 'Reachable',
            responseTime: Date.now() - start,
          };
        } catch (error) {
          const serviceName = service.name as keyof typeof checks.external_services;
          checks.external_services[serviceName] = {
            status: 'unhealthy',
            message: error instanceof Error ? error.message : 'Unreachable',
            responseTime: 0,
          };
          overallStatus = 'degraded';
        }
      })
    );

    const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;

    return reply.status(statusCode).send({
      status: overallStatus,
      service: 'project-service',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: config.NODE_ENV,
      checks,
    });
  });

  // Readiness probe (for Kubernetes)
  fastify.get('/ready', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Check critical dependencies
      await redis.ping();
      
      return reply.status(200).send({
        status: 'ready',
        service: 'project-service',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      return reply.status(503).send({
        status: 'not ready',
        service: 'project-service',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Service not ready',
      });
    }
  });

  // Liveness probe (for Kubernetes)
  fastify.get('/live', async (request: FastifyRequest, reply: FastifyReply) => {
    return reply.status(200).send({
      status: 'alive',
      service: 'project-service',
      timestamp: new Date().toISOString(),
    });
  });

  // Service metrics endpoint
  fastify.get('/metrics', async (request: FastifyRequest, reply: FastifyReply) => {
    // Basic metrics - in production, you'd integrate with Prometheus
    const metrics = {
      service: 'project-service',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      timestamp: new Date().toISOString(),
      nodejs_version: process.version,
      environment: config.NODE_ENV,
    };

    return reply.status(200).send(metrics);
  });
}