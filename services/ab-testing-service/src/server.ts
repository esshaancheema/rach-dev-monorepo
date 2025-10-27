import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from './config/config';
import { logger } from './utils/logger';
import { DatabaseService } from './services/database.service';
import { CacheService } from './services/cache.service';
import { ExperimentService } from './services/experiment.service';
import { FeatureFlagService } from './services/feature-flag.service';
import { StatisticsService } from './services/statistics.service';
import experimentRoutes from './routes/experiment.routes';
import featureFlagRoutes from './routes/feature-flag.routes';
import { errorHandler } from './middleware/error.middleware';
import { authMiddleware } from './middleware/auth.middleware';
import { requestLogger } from './middleware/request-logger.middleware';
import { validateRequest } from './middleware/validation.middleware';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

const app = express();

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'A/B Testing Service API',
      version: '1.0.0',
      description: 'Comprehensive A/B testing and feature flag management service',
      contact: {
        name: 'Zoptal Platform',
        email: 'api@zoptal.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: 'Development server',
      },
      {
        url: 'https://api.zoptal.com/ab-testing',
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
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/server.ts'],
};

const swaggerSpecs = swaggerJsdoc(swaggerOptions);

// Initialize services
const databaseService = new DatabaseService();
const cacheService = new CacheService();
const statisticsService = new StatisticsService();
const experimentService = new ExperimentService(databaseService, cacheService, statisticsService);
const featureFlagService = new FeatureFlagService(databaseService, cacheService);

// Global middleware
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
}));

app.use(cors({
  origin: config.cors.origins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.rateLimit.max,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
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
    const cacheStats = await cacheService.getStats();
    const dbHealth = await databaseService.healthCheck();
    
    const metrics = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cache: cacheStats,
      database: dbHealth.details,
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
  customSiteTitle: 'Zoptal A/B Testing API',
}));

// Authentication middleware for API routes
app.use('/api', authMiddleware);

// API Routes
app.use('/api/experiments', experimentRoutes);
app.use('/api/flags', featureFlagRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Zoptal A/B Testing Service',
    version: '1.0.0',
    status: 'running',
    documentation: '/api/docs',
    health: '/health',
    metrics: '/metrics',
  });
});

// Error handling
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

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
      logger.info(`🚀 A/B Testing Service started successfully`);
      logger.info(`📊 Server running on port ${config.port}`);
      logger.info(`📖 API Documentation: http://localhost:${config.port}/api/docs`);
      logger.info(`🏥 Health Check: http://localhost:${config.port}/health`);
      logger.info(`📈 Metrics: http://localhost:${config.port}/metrics`);
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