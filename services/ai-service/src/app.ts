import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import multipart from '@fastify/multipart';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { logger } from './utils/logger';
import { config, rateLimitConfig, isProduction } from './config';
import { chatRoutes } from './routes/chat.routes';
import { codeRoutes } from './routes/code.routes';
import { demoRoutes } from './routes/demo.routes';
import { registerErrorHandler } from './middleware/error-handler';
import healthPlugin from './plugins/health';
import metricsPlugin from './plugins/metrics';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger,
    trustProxy: true,
    requestIdHeader: 'x-request-id',
    requestIdLogLabel: 'requestId',
    disableRequestLogging: false,
    bodyLimit: 52428800, // 50MB for large code files
  });

  // Register core plugins
  await app.register(helmet, {
    contentSecurityPolicy: isProduction ? undefined : false,
  });

  await app.register(cors, {
    origin: true,
    credentials: true,
  });

  await app.register(rateLimit, {
    global: true,
    max: rateLimitConfig.maxRequests,
    timeWindow: rateLimitConfig.windowMs,
    skipOnError: true,
  });

  await app.register(multipart, {
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB
      files: 10,
    },
  });

  // Register Swagger documentation
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'Zoptal AI Service API',
        description: 'Comprehensive AI service for code generation, chat, and AI-powered features',
        version: '1.0.0',
      },
      servers: [
        {
          url: config.apiUrl,
          description: config.isProduction ? 'Production' : 'Development',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [{ bearerAuth: [] }],
    },
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    transformSpecification: (swaggerObject) => swaggerObject,
    transformSpecificationClone: true,
  });

  // Register custom plugins
  await app.register(healthPlugin);
  await app.register(metricsPlugin);

  // Register error handling
  registerErrorHandler(app);

  // Register routes
  await app.register(chatRoutes, { prefix: '/api/v1/chat' });
  await app.register(codeRoutes, { prefix: '/api/v1/code' });
  await app.register(demoRoutes, { prefix: '/api/v1' }); // Demo routes at /api/v1/demo/*

  // Graceful shutdown hooks
  app.addHook('onClose', async () => {
    logger.info('AI service shutting down gracefully');
  });

  return app;
}