import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

// Routes
import healthRoutes from './routes/health.routes';
import flagRoutes from './routes/flag.routes';
import testRoutes from './routes/test.routes';
import analyticsRoutes from './routes/analytics.routes';
import adminRoutes from './routes/admin.routes';
import segmentRoutes from './routes/segment.routes';

// Middleware
import { errorHandler } from './middleware/error-handler';
import { authMiddleware } from './middleware/auth';
import { requestLogger } from './middleware/request-logger';

// Config
import { config } from './config';
import { initializeServices } from './services';
import { logger } from './utils/logger';

const app = express();

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
app.use(cors({
  origin: config.cors.origins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Client-ID', 'X-Session-ID'],
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Request logging
if (config.env !== 'test') {
  app.use(morgan('combined', {
    stream: {
      write: (message: string) => logger.info(message.trim()),
    },
  }));
}

app.use(requestLogger);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.rateLimit.requests, // requests per window
  message: {
    error: 'Too many requests',
    message: 'Rate limit exceeded. Please try again later.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
    });
    res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'Too many requests. Please try again later.',
    });
  },
});

app.use('/api', limiter);

// Swagger documentation
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Zoptal Feature Flag Service API',
      version: '1.0.0',
      description: 'API for managing feature flags and A/B tests',
      contact: {
        name: 'Zoptal Team',
        email: 'api@zoptal.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: config.apiUrl,
        description: 'Feature Flag Service API',
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
          name: 'X-API-Key',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
      {
        apiKey: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Serve Swagger documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Zoptal Feature Flag API',
}));

// API Routes
app.use('/health', healthRoutes);
app.use('/api/flags', authMiddleware, flagRoutes);
app.use('/api/tests', authMiddleware, testRoutes);
app.use('/api/analytics', authMiddleware, analyticsRoutes);
app.use('/api/segments', authMiddleware, segmentRoutes);
app.use('/api/admin', authMiddleware, adminRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Zoptal Feature Flag Service',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    documentation: `${config.apiUrl}/api/docs`,
    endpoints: {
      health: '/health',
      flags: '/api/flags',
      tests: '/api/tests',
      analytics: '/api/analytics',
      segments: '/api/segments',
      admin: '/api/admin',
    },
  });
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.redirect('/api/docs');
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `The requested resource ${req.originalUrl} was not found`,
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Initialize services and start server
async function startServer() {
  try {
    // Initialize feature flag and A/B testing services
    await initializeServices();
    
    const port = config.port;
    const server = app.listen(port, () => {
      logger.info(`🚀 Feature Flag Service started`, {
        port,
        env: config.env,
        nodeEnv: process.env.NODE_ENV,
        apiUrl: config.apiUrl,
        documentation: `${config.apiUrl}/api/docs`,
      });
    });

    // Graceful shutdown
    const gracefulShutdown = (signal: string) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);
      
      server.close(async () => {
        logger.info('HTTP server closed.');
        
        // Close database connections, Redis, etc.
        try {
          // Add cleanup logic here
          logger.info('All connections closed. Shutting down.');
          process.exit(0);
        } catch (error) {
          logger.error('Error during shutdown:', error);
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server if this file is run directly
if (require.main === module) {
  startServer();
}

export default app;