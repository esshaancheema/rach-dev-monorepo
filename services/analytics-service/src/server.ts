import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

import { config } from './config';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/error-handler';
import { authMiddleware } from './middleware/auth';
import { validateRequest } from './middleware/validate';
import { metricsMiddleware } from './middleware/metrics';
import { requestLogger } from './middleware/request-logger';

// Routes
import dashboardRoutes from './routes/dashboard.routes';
import reportRoutes from './routes/report.routes';
import metricsRoutes from './routes/metrics.routes';
import chartRoutes from './routes/chart.routes';
import alertRoutes from './routes/alert.routes';
import exportRoutes from './routes/export.routes';
import visualizationRoutes from './routes/visualization.routes';
import adminRoutes from './routes/admin.routes';

// Services
import { DatabaseService } from './services/database.service';
import { CacheService } from './services/cache.service';
import { AnalyticsEngine } from './services/analytics-engine.service';
import { DashboardService } from './services/dashboard.service';
import { ReportService } from './services/report.service';
import { AlertService } from './services/alert.service';

class AnalyticsServer {
  private app: express.Application;
  private databaseService: DatabaseService;
  private cacheService: CacheService;
  private analyticsEngine: AnalyticsEngine;
  private dashboardService: DashboardService;
  private reportService: ReportService;
  private alertService: AlertService;

  constructor() {
    this.app = express();
    this.initializeServices();
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private async initializeServices(): Promise<void> {
    logger.info('Initializing Analytics services...');

    // Initialize core services
    this.databaseService = new DatabaseService();
    this.cacheService = new CacheService();
    this.analyticsEngine = new AnalyticsEngine(this.databaseService, this.cacheService);
    this.dashboardService = new DashboardService(this.analyticsEngine);
    this.reportService = new ReportService(this.analyticsEngine);
    this.alertService = new AlertService(this.analyticsEngine);

    // Connect to databases
    await this.databaseService.connect();
    await this.cacheService.connect();

    // Initialize analytics engine
    await this.analyticsEngine.initialize();

    logger.info('✅ All Analytics services initialized successfully');
  }

  private initializeMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"],
        },
      },
    }));

    // CORS configuration
    this.app.use(cors({
      origin: config.cors.origins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }));

    // Rate limiting
    this.app.use(rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // Limit each IP to 1000 requests per windowMs
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    }));

    // Body parsing and compression
    this.app.use(compression());
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));

    // Logging and metrics
    this.app.use(requestLogger);
    this.app.use(metricsMiddleware);

    // Swagger documentation
    this.setupSwagger();
  }

  private setupSwagger(): void {
    const swaggerOptions = {
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'Zoptal Analytics API',
          version: '1.0.0',
          description: 'Advanced analytics and dashboard API for Zoptal platform',
          contact: {
            name: 'Zoptal Team',
            email: 'support@zoptal.com',
          },
        },
        servers: [
          {
            url: config.server.baseUrl,
            description: 'Analytics API Server',
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
      apis: ['./src/routes/*.ts'],
    };

    const swaggerSpec = swaggerJsdoc(swaggerOptions);
    this.app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  }

  private initializeRoutes(): void {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'analytics-service',
        version: process.env.npm_package_version || '1.0.0',
      });
    });

    // API routes with authentication
    this.app.use('/api/dashboards', authMiddleware, dashboardRoutes);
    this.app.use('/api/reports', authMiddleware, reportRoutes);
    this.app.use('/api/metrics', authMiddleware, metricsRoutes);
    this.app.use('/api/charts', authMiddleware, chartRoutes);
    this.app.use('/api/alerts', authMiddleware, alertRoutes);
    this.app.use('/api/exports', authMiddleware, exportRoutes);
    this.app.use('/api/visualizations', authMiddleware, visualizationRoutes);
    this.app.use('/api/admin', authMiddleware, adminRoutes);

    // Metrics endpoint for Prometheus
    this.app.get('/metrics', (req, res) => {
      // Prometheus metrics will be implemented here
      res.set('Content-Type', 'text/plain');
      res.send('# Analytics service metrics\n');
    });
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found`,
        timestamp: new Date().toISOString(),
      });
    });

    // Global error handler
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    const port = config.server.port;
    
    this.app.listen(port, () => {
      logger.info(`🚀 Analytics Service running on port ${port}`);
      logger.info(`📊 API Documentation available at http://localhost:${port}/api/docs`);
      logger.info(`📈 Health check available at http://localhost:${port}/health`);
    });

    // Graceful shutdown
    process.on('SIGTERM', this.shutdown.bind(this));
    process.on('SIGINT', this.shutdown.bind(this));
  }

  private async shutdown(): Promise<void> {
    logger.info('🔄 Starting graceful shutdown...');

    try {
      // Stop accepting new connections
      // Close database connections
      await this.databaseService.disconnect();
      await this.cacheService.disconnect();

      // Stop analytics engine
      await this.analyticsEngine.stop();

      logger.info('✅ Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      logger.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  }
}

// Start the server
const server = new AnalyticsServer();
server.start().catch((error) => {
  logger.error('Failed to start Analytics service:', error);
  process.exit(1);
});

export default AnalyticsServer;