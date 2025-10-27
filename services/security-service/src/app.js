const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const DDoSProtection = require('./middleware/ddos-protection');
const CloudFlareIntegration = require('./middleware/cloudflare-integration');
const DDoSMonitoring = require('./monitoring/ddos-monitoring');
const ddosRoutes = require('./routes/ddos-routes');
const logger = require('./utils/logger');

/**
 * Security Service Application
 * 
 * Provides DDoS protection and security monitoring services
 */

class SecurityService {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3007;
    this.ddosProtection = new DDoSProtection();
    this.cloudflare = new CloudFlareIntegration();
    this.monitoring = new DDoSMonitoring(this.ddosProtection, this.cloudflare);
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
    this.setupMonitoring();
  }

  /**
   * Setup middleware stack
   */
  setupMiddleware() {
    // Security headers
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"]
        }
      }
    }));

    // CORS configuration
    this.app.use(cors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }));

    // Compression
    this.app.use(compression());

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Apply DDoS protection to all routes
    this.app.use(this.ddosProtection.protect.bind(this.ddosProtection));

    // Request logging
    this.app.use((req, res, next) => {
      logger.info('Incoming request', {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      });
      next();
    });
  }

  /**
   * Setup API routes
   */
  setupRoutes() {
    // Health check endpoint (bypass DDoS protection)
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        service: 'security-service',
        version: process.env.npm_package_version || '1.0.0',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        ddosProtection: {
          active: true,
          monitoring: this.monitoring.isMonitoring
        }
      });
    });

    // API routes
    this.app.use('/api/security/ddos', ddosRoutes);

    // DDoS statistics endpoint
    this.app.get('/api/security/metrics', async (req, res) => {
      try {
        const [statistics, monitoring] = await Promise.all([
          this.ddosProtection.getStatistics(),
          this.monitoring.getMetricsSummary()
        ]);

        res.json({
          success: true,
          data: {
            statistics,
            monitoring,
            timestamp: new Date().toISOString()
          }
        });
      } catch (error) {
        logger.error('Error getting security metrics', error);
        res.status(500).json({
          success: false,
          error: 'Failed to retrieve security metrics'
        });
      }
    });

    // Export metrics endpoint
    this.app.get('/api/security/metrics/export', async (req, res) => {
      try {
        const format = req.query.format || 'json';
        const data = this.monitoring.exportMetrics(format);

        const contentType = format === 'csv' ? 'text/csv' : 'application/json';
        const filename = `ddos-metrics-${Date.now()}.${format}`;

        res.set({
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${filename}"`
        });

        res.send(data);
      } catch (error) {
        logger.error('Error exporting metrics', error);
        res.status(500).json({
          success: false,
          error: 'Failed to export metrics'
        });
      }
    });

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.originalUrl
      });
    });
  }

  /**
   * Setup error handling
   */
  setupErrorHandling() {
    // Global error handler
    this.app.use((error, req, res, next) => {
      logger.error('Unhandled error', {
        error: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        ip: req.ip
      });

      // Don't leak error details in production
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      res.status(error.status || 500).json({
        success: false,
        error: isDevelopment ? error.message : 'Internal server error',
        ...(isDevelopment && { stack: error.stack })
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception', error);
      this.gracefulShutdown('uncaughtException');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled promise rejection', { reason, promise });
      this.gracefulShutdown('unhandledRejection');
    });

    // Handle termination signals
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully');
      this.gracefulShutdown('SIGTERM');
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received, shutting down gracefully');
      this.gracefulShutdown('SIGINT');
    });
  }

  /**
   * Setup monitoring and alerting
   */
  setupMonitoring() {
    // Start DDoS monitoring
    this.monitoring.startMonitoring();
    
    // Set up alert handlers
    this.monitoring.on('alert', (alert) => {
      logger.warn('DDoS alert', alert);
      
      // You could send notifications here
      // e.g., Slack, email, PagerDuty, etc.
    });

    this.monitoring.on('critical_alert', (alert) => {
      logger.error('Critical DDoS alert', alert);
      
      // Handle critical alerts
      // e.g., automatic response, emergency notifications
    });

    // Log monitoring events
    this.monitoring.on('monitoring_started', () => {
      logger.info('DDoS monitoring started');
    });

    this.monitoring.on('monitoring_stopped', () => {
      logger.info('DDoS monitoring stopped');
    });

    // Initialize CloudFlare protection if configured
    if (process.env.CLOUDFLARE_API_TOKEN && process.env.CLOUDFLARE_ZONE_ID) {
      this.initializeCloudFlareProtection();
    } else {
      logger.warn('CloudFlare integration not configured');
    }
  }

  /**
   * Initialize CloudFlare protection
   */
  async initializeCloudFlareProtection() {
    try {
      const healthCheck = await this.cloudflare.healthCheck();
      if (healthCheck.healthy) {
        logger.info('CloudFlare integration healthy', {
          zone: healthCheck.zone,
          status: healthCheck.status
        });

        // Create initial firewall rules
        await this.cloudflare.createFirewallRules();
        
        // Configure rate limiting
        await this.cloudflare.configureRateLimitingRules();
        
        logger.info('CloudFlare protection initialized');
      } else {
        logger.error('CloudFlare integration unhealthy', healthCheck);
      }
    } catch (error) {
      logger.error('Failed to initialize CloudFlare protection', error);
    }
  }

  /**
   * Start the security service
   */
  async start() {
    try {
      this.server = this.app.listen(this.port, () => {
        logger.info(`Security service started on port ${this.port}`, {
          port: this.port,
          env: process.env.NODE_ENV || 'development',
          nodeVersion: process.version,
          pid: process.pid
        });
      });

      // Handle server errors
      this.server.on('error', (error) => {
        logger.error('Server error', error);
      });

      return this.server;
    } catch (error) {
      logger.error('Failed to start security service', error);
      throw error;
    }
  }

  /**
   * Graceful shutdown
   */
  async gracefulShutdown(signal) {
    logger.info(`Graceful shutdown initiated by ${signal}`);

    try {
      // Stop monitoring
      this.monitoring.stopMonitoring();

      // Close server
      if (this.server) {
        await new Promise((resolve) => {
          this.server.close(resolve);
        });
      }

      // Close Redis connections
      if (this.ddosProtection.redis) {
        await this.ddosProtection.redis.disconnect();
      }

      logger.info('Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during graceful shutdown', error);
      process.exit(1);
    }
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      service: 'security-service',
      status: 'running',
      port: this.port,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      ddosProtection: {
        active: true,
        monitoring: this.monitoring.isMonitoring
      },
      cloudflare: {
        configured: !!(process.env.CLOUDFLARE_API_TOKEN && process.env.CLOUDFLARE_ZONE_ID)
      }
    };
  }
}

// Export for testing
module.exports = SecurityService;

// Start service if run directly
if (require.main === module) {
  const service = new SecurityService();
  service.start().catch((error) => {
    logger.error('Failed to start security service', error);
    process.exit(1);
  });
}