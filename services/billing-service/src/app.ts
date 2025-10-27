import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import jwt from '@fastify/jwt';

import { config, rateLimitConfig, jwtConfig } from './config';
import { logger } from './utils/logger';
import { registerErrorHandler } from './middleware/error-handler';
import { subscriptionRoutes } from './routes/subscription.routes';
import { paymentRoutes } from './routes/payment.routes';
import { invoiceRoutes } from './routes/invoice.routes';
import { webhookRoutes } from './routes/webhook.routes';
import { customerRoutes } from './routes/customer.routes';
import { planRoutes } from './routes/plan.routes';
import { usageRoutes } from './routes/usage.routes';
import { billingRoutes } from './routes/billing.routes';
import healthPlugin from './plugins/health';
import metricsPlugin from './plugins/metrics';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger,
    trustProxy: true,
    requestIdHeader: 'x-request-id',
    requestIdLogLabel: 'requestId',
    disableRequestLogging: false,
    bodyLimit: 10485760, // 10MB for webhook payloads
  });

  // Register core plugins
  await app.register(helmet, {
    contentSecurityPolicy: config.NODE_ENV === 'production' ? undefined : false,
  });

  await app.register(cors, {
    origin: ['http://localhost:3000', 'https://app.zoptal.com'],
    credentials: true,
  });

  await app.register(rateLimit, {
    global: true,
    max: rateLimitConfig.maxRequests,
    timeWindow: rateLimitConfig.windowMs,
    skipOnError: true,
    errorResponseBuilder: (request, context) => ({
      success: false,
      error: 'Rate limit exceeded',
      retryAfter: Math.round(context.ttl / 1000),
    }),
  });

  // Register JWT
  await app.register(jwt, {
    secret: jwtConfig.secret,
    sign: {
      algorithm: jwtConfig.algorithm,
      expiresIn: jwtConfig.expiresIn,
      issuer: jwtConfig.issuer,
    },
  });

  // Register Swagger documentation
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'Zoptal Billing Service API',
        description: 'Comprehensive billing and subscription management service with Stripe integration',
        version: '1.0.0',
      },
      servers: [
        {
          url: `http://localhost:${config.PORT}`,
          description: config.NODE_ENV === 'production' ? 'Production' : 'Development',
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
      tags: [
        { name: 'Customers', description: 'Customer management endpoints' },
        { name: 'Subscriptions', description: 'Subscription management endpoints' },
        { name: 'Payments', description: 'Payment processing endpoints' },
        { name: 'Invoices', description: 'Invoice management endpoints' },
        { name: 'Plans', description: 'Pricing plan management endpoints' },
        { name: 'Usage', description: 'Usage tracking and billing endpoints' },
        { name: 'Billing', description: 'Billing dashboard and analytics endpoints' },
        { name: 'Webhooks', description: 'Stripe webhook handling endpoints' },
        { name: 'Health', description: 'Service health and monitoring endpoints' },
      ],
    },
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
    staticCSP: true,
  });

  // Register health and metrics plugins
  await app.register(healthPlugin);
  await app.register(metricsPlugin);

  // Register error handling
  registerErrorHandler(app);

  // Register routes
  await app.register(customerRoutes, { prefix: '/api/v1/customers' });
  await app.register(subscriptionRoutes, { prefix: '/api/v1/subscriptions' });
  await app.register(paymentRoutes, { prefix: '/api/v1/payments' });
  await app.register(invoiceRoutes, { prefix: '/api/v1/invoices' });
  await app.register(planRoutes, { prefix: '/api/v1/plans' });
  await app.register(usageRoutes, { prefix: '/api/v1/usage' });
  await app.register(billingRoutes, { prefix: '/api/v1/billing' });
  await app.register(webhookRoutes, { prefix: '/api/v1/webhooks' });

  // Graceful shutdown hooks
  app.addHook('onClose', async () => {
    logger.info('Billing service shutting down gracefully');
  });

  return app;
}