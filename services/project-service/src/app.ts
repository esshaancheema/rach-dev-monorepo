import fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import { config, isDevelopment, jwtConfig, rateLimitConfig, wsConfig } from './config';
import { logger } from './utils/logger';
import { redis } from './utils/redis';
import { disconnectPrisma } from './db/prisma';

// Routes
import healthRoutes from './routes/health.routes';
import projectRoutes from './routes/project.routes';
import taskRoutes from './routes/task.routes';
import teamRoutes from './routes/team.routes';
import fileRoutes from './routes/file.routes';
import integrationRoutes from './routes/integration.routes';
import analyticsRoutes from './routes/analytics.routes';

// Middleware
import authMiddleware from './middleware/auth.middleware';
import errorHandler from './middleware/error.middleware';
import requestLogger from './middleware/request-logger.middleware';

// Plugins
import swaggerPlugin from './plugins/swagger.plugin';
import websocketPlugin from './plugins/websocket.plugin';
import metricsPlugin from './plugins/metrics.plugin';

export const buildApp = async (): Promise<FastifyInstance> => {
  const app = fastify({
    logger: logger,
    trustProxy: true,
    disableRequestLogging: !isDevelopment,
  });

  // Register core plugins
  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "ws:", "wss:"],
      },
    },
  });

  await app.register(cors, {
    origin: isDevelopment 
      ? true 
      : [
          'https://app.zoptal.com',
          'https://dashboard.zoptal.com',
          'https://admin.zoptal.com',
          'https://developer.zoptal.com'
        ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  });

  // JWT Authentication
  await app.register(jwt, {
    secret: jwtConfig.secret,
    sign: {
      algorithm: jwtConfig.algorithm,
      expiresIn: jwtConfig.expiresIn,
      issuer: jwtConfig.issuer,
    },
    verify: {
      algorithms: [jwtConfig.algorithm],
      issuer: jwtConfig.issuer,
    },
  });

  // Rate Limiting
  await app.register(rateLimit, {
    global: true,
    max: rateLimitConfig.maxRequests,
    timeWindow: rateLimitConfig.windowMs,
    redis: redis,
    skipOnError: true,
    keyGenerator: (request) => {
      return request.headers['x-forwarded-for'] || request.ip;
    },
    errorResponseBuilder: (request, context) => {
      return {
        code: 'RATE_LIMIT_EXCEEDED',
        error: 'Rate limit exceeded',
        message: `Too many requests. Try again in ${Math.round(context.ttl / 1000)} seconds.`,
        statusCode: 429,
        retryAfter: Math.round(context.ttl / 1000),
      };
    },
  });

  // Custom middleware
  await app.register(requestLogger);
  await app.register(authMiddleware);
  await app.register(errorHandler);

  // Feature plugins
  if (isDevelopment) {
    await app.register(swaggerPlugin);
  }
  
  if (config.ENABLE_REAL_TIME) {
    await app.register(websocketPlugin, wsConfig);
  }

  await app.register(metricsPlugin);

  // Health check (no auth required)
  await app.register(healthRoutes);

  // API routes (with auth)
  await app.register(async (fastify) => {
    // Apply authentication to all routes in this context
    await fastify.addHook('onRequest', fastify.authenticate);

    // Register authenticated routes
    await fastify.register(projectRoutes, { prefix: '/api/projects' });
    await fastify.register(taskRoutes, { prefix: '/api/tasks' });
    await fastify.register(teamRoutes, { prefix: '/api/teams' });
    await fastify.register(fileRoutes, { prefix: '/api/files' });
    await fastify.register(integrationRoutes, { prefix: '/api/integrations' });
    await fastify.register(analyticsRoutes, { prefix: '/api/analytics' });
  });

  // Global error handler
  app.setErrorHandler(async (error, request, reply) => {
    const errorId = request.id;
    
    // Log error with context
    app.log.error({
      errorId,
      error: error.message,
      stack: error.stack,
      url: request.url,
      method: request.method,
      headers: request.headers,
      body: request.body,
    }, 'Unhandled error occurred');

    // Don't leak error details in production
    const message = isDevelopment ? error.message : 'Internal server error';
    const stack = isDevelopment ? error.stack : undefined;

    return reply.status(error.statusCode || 500).send({
      error: 'Internal Server Error',
      message,
      statusCode: error.statusCode || 500,
      errorId,
      timestamp: new Date().toISOString(),
      ...(stack && { stack }),
    });
  });

  // 404 handler
  app.setNotFoundHandler(async (request, reply) => {
    return reply.status(404).send({
      error: 'Not Found',
      message: `Route ${request.method} ${request.url} not found`,
      statusCode: 404,
      timestamp: new Date().toISOString(),
    });
  });

  // Graceful shutdown handling
  app.addHook('onClose', async () => {
    app.log.info('Shutting down Project Service...');
    
    // Close Redis connection
    if (redis.status === 'ready') {
      await redis.quit();
      app.log.info('Redis connection closed');
    }

    // Close Prisma connection
    await disconnectPrisma();

    app.log.info('Project Service shutdown complete');
  });

  return app;
};

// Export types
export type App = FastifyInstance;