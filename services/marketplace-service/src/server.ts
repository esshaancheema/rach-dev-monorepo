import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import fileUpload from 'express-fileupload';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

import { config } from './config/config';
import { logger } from './utils/logger';

// Services
import { DatabaseService } from './services/database.service';
import { CacheService } from './services/cache.service';
import { IntegrationService } from './services/integration.service';
import { PackageService } from './services/package.service';
import { WebhookService } from './services/webhook.service';
import { SecurityService } from './services/security.service';

// Routes
import integrationRoutes from './routes/integration.routes';
import developerRoutes from './routes/developer.routes';
import installationRoutes from './routes/installation.routes';
import reviewRoutes from './routes/review.routes';
import webhookRoutes from './routes/webhook.routes';
import adminRoutes from './routes/admin.routes';

// Middleware
import { errorHandler } from './middleware/error.middleware';
import { authMiddleware } from './middleware/auth.middleware';
import { requestLogger } from './middleware/request-logger.middleware';

const app = express();

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Zoptal Marketplace API',
      version: '1.0.0',
      description: 'Third-party integration marketplace and plugin management service',
      contact: {
        name: 'Zoptal Platform',
        email: 'marketplace@zoptal.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: 'Development server',
      },
      {
        url: 'https://marketplace.zoptal.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'X-Api-Key',
        },
      },
    },
    security: [
      { bearerAuth: [] },
      { apiKey: [] },
    ],
  },
  apis: ['./src/routes/*.ts', './src/server.ts'],
};

const swaggerSpecs = swaggerJsdoc(swaggerOptions);

// Initialize services
const databaseService = new DatabaseService();
const cacheService = new CacheService();
const packageService = new PackageService();
const webhookService = new WebhookService();
const securityService = new SecurityService();
const integrationService = new IntegrationService(
  databaseService,
  cacheService,
  packageService,
  webhookService,
  securityService
);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

// CORS configuration
app.use(cors({
  origin: config.cors.origins,
  credentials: config.cors.credentials,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Api-Key'],
}));

// Body parsing and compression
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// File upload configuration
app.use(fileUpload({
  limits: { 
    fileSize: config.upload.maxFileSize,
    files: 10,
  },
  abortOnLimit: true,
  responseOnLimit: 'File size exceeds maximum allowed size',
  uploadTimeout: 60000, // 1 minute
  useTempFiles: true,
  tempFileDir: config.upload.tempPath,
  parseNested: true,
  debug: config.nodeEnv === 'development',
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(config.rateLimit.windowMs / 1000),
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health' || req.path === '/metrics';
  },
});

app.use('/api/', limiter);

// Request logging
app.use(requestLogger);

// Health check endpoint
/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                 version:
 *                   type: string
 *                 services:
 *                   type: object
 */
app.get('/health', async (req, res) => {
  try {
    const [dbHealth, cacheHealth] = await Promise.all([
      databaseService.healthCheck(),
      cacheService.healthCheck(),
    ]);

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: dbHealth,
        cache: cacheHealth,
      },
    };

    const overallHealthy = dbHealth.status === 'healthy' && cacheHealth.status === 'healthy';
    
    res.status(overallHealthy ? 200 : 503).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

// Metrics endpoint
/**
 * @swagger
 * /metrics:
 *   get:
 *     summary: Service metrics endpoint
 *     tags: [Metrics]
 *     responses:
 *       200:
 *         description: Service metrics
 */
app.get('/metrics', async (req, res) => {
  try {
    const dbHealth = await databaseService.healthCheck();
    const cacheHealth = await cacheService.healthCheck();
    
    const metrics = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: dbHealth.details,
      cache: cacheHealth.details,
      requests: {
        // Would track request metrics in production
        total: 0,
        errors: 0,
        avgResponseTime: 0,
      },
    };

    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get metrics' });
  }
});

// API Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Zoptal Marketplace API',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
  },
}));

// Serve uploaded packages (with authentication)
app.use('/packages', authMiddleware, express.static(config.upload.uploadPath));

// Authentication middleware for API routes
app.use('/api', authMiddleware);

// API Routes
app.use('/api/integrations', integrationRoutes);
app.use('/api/developers', developerRoutes);
app.use('/api/installations', installationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/admin', adminRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Zoptal Marketplace Service',
    version: '1.0.0',
    status: 'running',
    documentation: '/api/docs',
    health: '/health',
    metrics: '/metrics',
    features: [
      'Integration marketplace',
      'Plugin management',
      'Developer portal',
      'Package validation',
      'Security scanning',
      'Webhook delivery',
      'OAuth integration',
      'Review system',
      'Analytics tracking',
    ],
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    documentation: '/api/docs',
  });
});

// Error handling
app.use(errorHandler);

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}, starting graceful shutdown`);

  try {
    // Close database connections
    await databaseService.disconnect();
    
    // Close cache connections
    await cacheService.disconnect();
    
    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const startServer = async () => {
  try {
    // Connect to services
    await Promise.all([
      databaseService.connect(),
      cacheService.connect(),
    ]);

    // Run database migrations
    await databaseService.runMigrations();
    await databaseService.createIndexes();

    // Start HTTP server
    app.listen(config.port, () => {
      logger.info(`🚀 Marketplace Service started successfully`);
      logger.info(`🏪 Server running on port ${config.port}`);
      logger.info(`📖 API Documentation: http://localhost:${config.port}/api/docs`);
      logger.info(`🏥 Health Check: http://localhost:${config.port}/health`);
      logger.info(`📈 Metrics: http://localhost:${config.port}/metrics`);
      logger.info(`🔐 Security scanning enabled`);
      logger.info(`📦 Package validation enabled`);
      logger.info(`🎯 Webhook delivery enabled`);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

export default app;

// Start the server if this file is run directly
if (require.main === module) {
  startServer();
}