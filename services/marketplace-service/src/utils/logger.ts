import winston from 'winston';
import { config } from '../config/config';

const { combine, timestamp, errors, json, printf, colorize, simple } = winston.format;

// Custom format for development
const developmentFormat = combine(
  colorize(),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    const stackStr = stack ? `\n${stack}` : '';
    return `${timestamp} [${level}]: ${message}${stackStr}${metaStr ? `\n${metaStr}` : ''}`;
  })
);

// Custom format for production
const productionFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

// Create logger instance
export const logger = winston.createLogger({
  level: config.logging.level,
  format: config.nodeEnv === 'production' ? productionFormat : developmentFormat,
  defaultMeta: {
    service: 'marketplace-service',
    environment: config.nodeEnv,
    version: process.env.npm_package_version || '1.0.0',
  },
  transports: [
    // Console transport
    new winston.transports.Console({
      silent: process.env.NODE_ENV === 'test',
    }),
  ],
});

// Add file transports for production
if (config.nodeEnv === 'production') {
  // Error log file
  logger.add(new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    maxsize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5,
    tailable: true,
  }));

  // Combined log file
  logger.add(new winston.transports.File({
    filename: 'logs/combined.log',
    maxsize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5,
    tailable: true,
  }));

  // Daily rotate file transport
  if (config.logging.datePattern) {
    const DailyRotateFile = require('winston-daily-rotate-file');
    
    logger.add(new DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: config.logging.datePattern,
      zippedArchive: true,
      maxSize: config.logging.maxSize,
      maxFiles: config.logging.maxFiles,
    }));
  }
}

// Request logger middleware helper
export const createRequestLogger = () => {
  return winston.createLogger({
    level: 'info',
    format: combine(
      timestamp(),
      json()
    ),
    defaultMeta: {
      service: 'marketplace-service',
      type: 'request',
    },
    transports: [
      new winston.transports.File({
        filename: 'logs/requests.log',
        maxsize: 10 * 1024 * 1024, // 10MB
        maxFiles: 3,
        tailable: true,
      }),
    ],
  });
};

// Security logger for audit trails
export const securityLogger = winston.createLogger({
  level: 'info',
  format: combine(
    timestamp(),
    json()
  ),
  defaultMeta: {
    service: 'marketplace-service',
    type: 'security',
  },
  transports: [
    new winston.transports.File({
      filename: 'logs/security.log',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 10,
      tailable: true,
    }),
  ],
});

// Performance logger
export const performanceLogger = winston.createLogger({
  level: 'info',
  format: combine(
    timestamp(),
    json()
  ),
  defaultMeta: {
    service: 'marketplace-service',
    type: 'performance',
  },
  transports: [
    new winston.transports.File({
      filename: 'logs/performance.log',
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 3,
      tailable: true,
    }),
  ],
});

// Error reporting helper
export const reportError = (error: Error, context?: any) => {
  logger.error('Unhandled error occurred', {
    error: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  });

  // In production, you might want to send to external error reporting service
  if (config.nodeEnv === 'production') {
    // Example: Sentry, Bugsnag, etc.
    // errorReportingService.captureException(error, context);
  }
};

// Structured logging helpers
export const loggers = {
  // Integration-related logs
  integration: {
    created: (integrationId: string, developerId: string, name: string) => {
      logger.info('Integration created', {
        integrationId,
        developerId,
        name,
        action: 'integration_created',
      });
    },
    
    installed: (integrationId: string, userId: string, organizationId?: string) => {
      logger.info('Integration installed', {
        integrationId,
        userId,
        organizationId,
        action: 'integration_installed',
      });
    },
    
    uninstalled: (integrationId: string, userId: string, reason?: string) => {
      logger.info('Integration uninstalled', {
        integrationId,
        userId,
        reason,
        action: 'integration_uninstalled',
      });
    },
    
    error: (integrationId: string, error: string, context?: any) => {
      logger.error('Integration error', {
        integrationId,
        error,
        context,
        action: 'integration_error',
      });
    },
  },

  // Plugin execution logs
  plugin: {
    executed: (pluginId: string, hook: string, duration: number, success: boolean) => {
      logger.info('Plugin executed', {
        pluginId,
        hook,
        duration,
        success,
        action: 'plugin_executed',
      });
    },
    
    timeout: (pluginId: string, hook: string, timeout: number) => {
      logger.warn('Plugin execution timeout', {
        pluginId,
        hook,
        timeout,
        action: 'plugin_timeout',
      });
    },
    
    error: (pluginId: string, hook: string, error: string) => {
      logger.error('Plugin execution error', {
        pluginId,
        hook,
        error,
        action: 'plugin_error',
      });
    },
  },

  // Webhook logs
  webhook: {
    sent: (url: string, event: string, statusCode: number, duration: number) => {
      logger.info('Webhook sent', {
        url,
        event,
        statusCode,
        duration,
        action: 'webhook_sent',
      });
    },
    
    failed: (url: string, event: string, error: string, attempt: number) => {
      logger.error('Webhook failed', {
        url,
        event,
        error,
        attempt,
        action: 'webhook_failed',
      });
    },
    
    retrying: (url: string, event: string, attempt: number, delay: number) => {
      logger.warn('Webhook retrying', {
        url,
        event,
        attempt,
        delay,
        action: 'webhook_retrying',
      });
    },
  },

  // Security logs
  security: {
    authSuccess: (userId: string, method: string, ip: string) => {
      securityLogger.info('Authentication successful', {
        userId,
        method,
        ip,
        action: 'auth_success',
      });
    },
    
    authFailure: (identifier: string, method: string, ip: string, reason: string) => {
      securityLogger.warn('Authentication failed', {
        identifier,
        method,
        ip,
        reason,
        action: 'auth_failure',
      });
    },
    
    rateLimitExceeded: (ip: string, endpoint: string, limit: number) => {
      securityLogger.warn('Rate limit exceeded', {
        ip,
        endpoint,
        limit,
        action: 'rate_limit_exceeded',
      });
    },
    
    suspiciousActivity: (userId: string, activity: string, details: any) => {
      securityLogger.warn('Suspicious activity detected', {
        userId,
        activity,
        details,
        action: 'suspicious_activity',
      });
    },
  },

  // Performance logs
  performance: {
    slowQuery: (query: string, duration: number, threshold: number) => {
      performanceLogger.warn('Slow database query', {
        query,
        duration,
        threshold,
        action: 'slow_query',
      });
    },
    
    memoryUsage: (usage: number, threshold: number) => {
      performanceLogger.warn('High memory usage', {
        usage,
        threshold,
        action: 'high_memory_usage',
      });
    },
    
    responseTime: (endpoint: string, method: string, duration: number) => {
      performanceLogger.info('Response time', {
        endpoint,
        method,
        duration,
        action: 'response_time',
      });
    },
  },
};

export default logger;