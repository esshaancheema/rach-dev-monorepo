// Error Tracking Package - Main Export File

// Import necessary classes for the ErrorTrackingSystem
import { SentryErrorTracker, SentryConfig, createSentryConfig } from './sentry/sentry-config';
import { AlertManager, AlertManagerConfig, MetricData, defaultAlertRules } from './alerting/alert-manager';
import { PerformanceMonitor, PerformanceMetrics, PerformanceAlert, PerformanceMonitorConfig, defaultPerformanceConfig } from './monitoring/performance-monitor';
import { EnhancedLogger, EnhancedLoggerOptions } from './integrations/winston-sentry';

// Sentry Configuration and Error Tracking
export {
  SentryErrorTracker,
  SentryConfig,
  createSentryConfig,
  authServiceSentryConfig,
  projectServiceSentryConfig,
  billingServiceSentryConfig,
  notificationServiceSentryConfig,
  analyticsServiceSentryConfig,
  webMainSentryConfig,
  dashboardSentryConfig,
  adminSentryConfig,
} from './sentry/sentry-config';

// Alert Management System
export {
  AlertManager,
  AlertRule,
  AlertCondition,
  AlertAction,
  AlertPriority,
  AlertEvent,
  MetricData,
  AlertManagerConfig,
  defaultAlertRules,
} from './alerting/alert-manager';

// Performance Monitoring
export {
  PerformanceMonitor,
  PerformanceMetrics,
  PerformanceAlert,
  PerformanceMonitorConfig,
  defaultPerformanceConfig,
} from './monitoring/performance-monitor';

// Winston-Sentry Integration
export {
  SentryTransport,
  SentryTransportOptions,
  EnhancedLogger,
  EnhancedLoggerOptions,
  LogMeta,
  createRequestLoggingMiddleware,
  createErrorLoggingMiddleware,
} from './integrations/winston-sentry';

// Main Error Tracking System
export class ErrorTrackingSystem {
  private sentryTracker?: SentryErrorTracker;
  private alertManager?: AlertManager;
  private performanceMonitor?: PerformanceMonitor;
  private logger?: EnhancedLogger;

  constructor() {
    console.log('🔧 Error tracking system initializing...');
  }

  // Initialize Sentry error tracking
  public initializeSentry(config: SentryConfig): SentryErrorTracker {
    this.sentryTracker = SentryErrorTracker.getInstance(config);
    this.sentryTracker.initialize();
    console.log('✅ Sentry error tracking initialized');
    return this.sentryTracker;
  }

  // Initialize alert management
  public initializeAlertManager(config: AlertManagerConfig): AlertManager {
    this.alertManager = new AlertManager(config);
    
    // Add default alert rules
    defaultAlertRules.forEach(rule => {
      this.alertManager!.addRule(rule);
    });

    console.log('✅ Alert manager initialized');
    return this.alertManager;
  }

  // Initialize performance monitoring
  public initializePerformanceMonitor(
    config: PerformanceMonitorConfig,
    serviceName: string,
    environment: string = 'development'
  ): PerformanceMonitor {
    this.performanceMonitor = new PerformanceMonitor(config, serviceName, environment);
    
    // Connect performance monitor to alert manager
    if (this.alertManager) {
      this.performanceMonitor.on('metricsCollected', (metrics: PerformanceMetrics) => {
        const metricData: MetricData = {
          service: metrics.service,
          environment: metrics.environment,
          timestamp: metrics.timestamp,
          errorCount: metrics.errorCount,
          totalRequests: metrics.requestCount,
          avgResponseTime: metrics.responseTime.avg,
          p95ResponseTime: metrics.responseTime.p95,
          customMetrics: metrics.custom,
        };
        
        this.alertManager!.processMetrics(metricData);
      });

      this.performanceMonitor.on('performanceAlert', (alert: PerformanceAlert) => {
        console.log(`🚨 Performance alert: ${alert.message}`);
      });
    }

    console.log('✅ Performance monitoring initialized');
    return this.performanceMonitor;
  }

  // Initialize enhanced logging
  public initializeLogger(options: EnhancedLoggerOptions): EnhancedLogger {
    this.logger = new EnhancedLogger({
      ...options,
      sentry: this.sentryTracker?.getHub().getClient(),
    });

    console.log('✅ Enhanced logging initialized');
    return this.logger;
  }

  // Get initialized components
  public getSentryTracker(): SentryErrorTracker {
    if (!this.sentryTracker) {
      throw new Error('Sentry tracker not initialized. Call initializeSentry() first.');
    }
    return this.sentryTracker;
  }

  public getAlertManager(): AlertManager {
    if (!this.alertManager) {
      throw new Error('Alert manager not initialized. Call initializeAlertManager() first.');
    }
    return this.alertManager;
  }

  public getPerformanceMonitor(): PerformanceMonitor {
    if (!this.performanceMonitor) {
      throw new Error('Performance monitor not initialized. Call initializePerformanceMonitor() first.');
    }
    return this.performanceMonitor;
  }

  public getLogger(): EnhancedLogger {
    if (!this.logger) {
      throw new Error('Logger not initialized. Call initializeLogger() first.');
    }
    return this.logger;
  }

  // Comprehensive error capture
  public captureError(
    error: Error,
    context?: {
      service?: string;
      user?: any;
      request?: any;
      extra?: Record<string, any>;
      tags?: Record<string, string>;
      level?: 'info' | 'warning' | 'error' | 'fatal';
    }
  ): string {
    let eventId = '';

    // Capture in Sentry
    if (this.sentryTracker) {
      eventId = this.sentryTracker.captureException(error, {
        tags: context?.tags,
        extra: context?.extra,
        user: context?.user,
        level: context?.level || 'error',
      });
    }

    // Log with enhanced logger
    if (this.logger) {
      this.logger.error(error.message, error, {
        user: context?.user,
        req: context?.request,
        tags: context?.tags,
        extra: context?.extra,
      });
    }

    return eventId;
  }

  // Record performance metric
  public recordPerformanceMetric(responseTime: number, isError: boolean = false): void {
    if (this.performanceMonitor) {
      this.performanceMonitor.recordRequest(responseTime, isError);
    }
  }

  // Health check all components
  public async healthCheck(): Promise<{
    sentry: boolean;
    alertManager: boolean;
    performanceMonitor: boolean;
    logger: boolean;
  }> {
    return {
      sentry: !!this.sentryTracker,
      alertManager: !!this.alertManager,
      performanceMonitor: !!this.performanceMonitor,
      logger: !!this.logger,
    };
  }

  // Cleanup resources
  public async destroy(): Promise<void> {
    const promises: Promise<any>[] = [];

    if (this.sentryTracker) {
      promises.push(this.sentryTracker.close());
    }

    if (this.performanceMonitor) {
      this.performanceMonitor.stop();
    }

    if (this.logger) {
      promises.push(this.logger.close());
    }

    await Promise.all(promises);
    console.log('🔄 Error tracking system destroyed');
  }
}

// Default error tracking instance
export const errorTracking = new ErrorTrackingSystem();

// Utility functions for common error tracking patterns
export namespace ErrorTrackingUtils {
  // Wrap async function with error tracking
  export function wrapAsync<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    context?: {
      operation: string;
      service?: string;
      tags?: Record<string, string>;
    }
  ): (...args: T) => Promise<R> {
    return async (...args: T): Promise<R> => {
      const startTime = Date.now();
      
      try {
        const result = await fn(...args);
        const duration = Date.now() - startTime;
        
        // Record successful performance
        errorTracking.recordPerformanceMetric(duration, false);
        
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        
        // Record failed performance
        errorTracking.recordPerformanceMetric(duration, true);
        
        // Capture error
        errorTracking.captureError(error as Error, {
          service: context?.service,
          tags: {
            operation: context?.operation || 'unknown',
            ...context?.tags,
          },
          extra: {
            duration,
            args: args.length > 0 ? args : undefined,
          },
        });
        
        throw error;
      }
    };
  }

  // Create Express error middleware
  export function createExpressErrorHandler(serviceName: string) {
    return (error: Error, req: any, res: any, next: any) => {
      const eventId = errorTracking.captureError(error, {
        service: serviceName,
        user: req.user,
        request: req,
        tags: {
          method: req.method,
          route: req.route?.path || req.path,
        },
        extra: {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
        },
      });

      // Send error response
      res.status(500).json({
        error: 'Internal Server Error',
        eventId,
        message: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    };
  }

  // Create request timing middleware
  export function createTimingMiddleware(serviceName: string) {
    return (req: any, res: any, next: any) => {
      const startTime = Date.now();
      
      res.on('finish', () => {
        const duration = Date.now() - startTime;
        const isError = res.statusCode >= 400;
        
        errorTracking.recordPerformanceMetric(duration, isError);
        
        // Log slow requests
        if (duration > 5000) {
          errorTracking.getLogger()?.warn('Slow request detected', {
            req,
            duration,
            tags: {
              service: serviceName,
              component: 'http-timing',
            },
          });
        }
      });
      
      next();
    };
  }

  // Database query wrapper
  export function wrapDatabaseQuery<T>(
    queryFn: () => Promise<T>,
    query: string,
    service?: string
  ): Promise<T> {
    return wrapAsync(queryFn, {
      operation: 'database_query',
      service,
      tags: {
        component: 'database',
      },
    })();
  }

  // External API call wrapper
  export function wrapApiCall<T>(
    apiFn: () => Promise<T>,
    apiName: string,
    service?: string
  ): Promise<T> {
    return wrapAsync(apiFn, {
      operation: 'external_api_call',
      service,
      tags: {
        component: 'external-api',
        api: apiName,
      },
    })();
  }

  // Generate correlation ID for request tracing
  export function generateCorrelationId(): string {
    return `corr_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  // Extract user context from request
  export function extractUserContext(req: any): any {
    if (!req.user) return undefined;
    
    return {
      id: req.user.id,
      email: req.user.email,
      username: req.user.username || req.user.name,
      role: req.user.role,
    };
  }

  // Sanitize sensitive data for logging
  export function sanitizeForLogging(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const sensitiveFields = [
      'password',
      'token',
      'secret',
      'key',
      'authorization',
      'cookie',
      'session',
      'csrf',
      'credit_card',
      'ssn',
      'social_security',
    ];

    const sanitize = (obj: any): any => {
      if (Array.isArray(obj)) {
        return obj.map(sanitize);
      }

      if (typeof obj === 'object' && obj !== null) {
        const sanitized: any = {};
        
        for (const [key, value] of Object.entries(obj)) {
          const isSensitive = sensitiveFields.some(field =>
            key.toLowerCase().includes(field.toLowerCase())
          );

          if (isSensitive) {
            sanitized[key] = '[REDACTED]';
          } else if (typeof value === 'object') {
            sanitized[key] = sanitize(value);
          } else {
            sanitized[key] = value;
          }
        }

        return sanitized;
      }

      return obj;
    };

    return sanitize(data);
  }
}

// Configuration factory for common setups
export namespace ErrorTrackingConfig {
  // Development configuration
  export function createDevelopmentConfig(serviceName: string): {
    sentry: SentryConfig;
    logger: EnhancedLoggerOptions;
    performance: PerformanceMonitorConfig;
  } {
    return {
      sentry: createSentryConfig({
        environment: 'development',
        debug: true,
        sampleRate: 1.0,
        tracesSampleRate: 1.0,
        enableProfiling: false,
        tags: { service: serviceName },
      }),
      logger: {
        service: serviceName,
        environment: 'development',
        level: 'debug',
        consoleLevel: 'debug',
        sentryLevel: 'error',
      },
      performance: {
        ...defaultPerformanceConfig,
        collectionIntervalMs: 60000, // 1 minute in development
      },
    };
  }

  // Production configuration
  export function createProductionConfig(serviceName: string): {
    sentry: SentryConfig;
    logger: EnhancedLoggerOptions;
    performance: PerformanceMonitorConfig;
    alertManager: AlertManagerConfig;
  } {
    return {
      sentry: createSentryConfig({
        environment: 'production',
        debug: false,
        sampleRate: 0.1, // Sample 10% of errors
        tracesSampleRate: 0.01, // Sample 1% of transactions
        enableProfiling: true,
        tags: { service: serviceName },
      }),
      logger: {
        service: serviceName,
        environment: 'production',
        level: 'info',
        consoleLevel: 'warn',
        sentryLevel: 'error',
        file: {
          filename: `/var/log/${serviceName}/error.log`,
          level: 'error',
        },
      },
      performance: {
        ...defaultPerformanceConfig,
        collectionIntervalMs: 30000, // 30 seconds in production
      },
      alertManager: {
        email: {
          host: process.env.SMTP_HOST || 'localhost',
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: false,
          user: process.env.SMTP_USER || '',
          password: process.env.SMTP_PASSWORD || '',
          from: process.env.SMTP_FROM || 'alerts@zoptal.com',
        },
        slack: {
          webhookUrl: process.env.SLACK_WEBHOOK_URL || '',
        },
        discord: {
          token: process.env.DISCORD_BOT_TOKEN || '',
        },
      },
    };
  }
}

// Version information
export const VERSION = '1.0.0';

console.log(`🚀 Zoptal Error Tracking v${VERSION} loaded`);

export default ErrorTrackingSystem;