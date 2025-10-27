import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import multipart from '@fastify/multipart';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { logger } from './utils/logger';
import { config } from './config';
import { registerRoutes } from './routes';
import { errorHandler } from './middleware/error-handler';
import { healthPlugin } from './plugins/health.plugin';
import { metricsPlugin } from './plugins/metrics.plugin';
import { authPlugin } from './plugins/auth.plugin';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger,
    trustProxy: config.trustProxy,
    requestIdHeader: 'x-request-id',
    requestIdLogLabel: 'requestId',
    disableRequestLogging: false,
    bodyLimit: 10485760, // 10MB
  });

  // Register core plugins
  await app.register(helmet, {
    contentSecurityPolicy: config.isProduction ? undefined : false,
  });

  await app.register(cors, {
    origin: config.corsOrigins,
    credentials: true,
  });

  await app.register(rateLimit, {
    global: true,
    max: config.rateLimit.global.max,
    timeWindow: config.rateLimit.global.window,
    skipOnError: true,
  });

  await app.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
      files: 5,
    },
  });

  // Register Swagger documentation
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'Zoptal Notification Service API',
        description: 'Comprehensive notification service for email, SMS, push notifications, and in-app alerts',
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
  await app.register(authPlugin);

  // Register routes
  await registerRoutes(app);

  // Global error handler
  app.setErrorHandler(errorHandler);

  // Graceful shutdown hooks
  app.addHook('onClose', async () => {
    logger.info('Notification service shutting down gracefully');
  });

  return app;
}