import winston from 'winston';
import Transport from 'winston-transport';
import * as Sentry from '@sentry/node';

export interface SentryTransportOptions extends Transport.TransportStreamOptions {
  sentry?: any; // Sentry instance
  level?: string;
  levelsMap?: Record<string, Sentry.SeverityLevel>;
  tags?: Record<string, string>;
  extra?: Record<string, any>;
  fingerprint?: string[];
  captureUnhandledRejections?: boolean;
  captureUncaughtExceptions?: boolean;
}

export class SentryTransport extends Transport {
  private sentry: typeof Sentry;
  private levelsMap: Record<string, Sentry.SeverityLevel>;

  constructor(options: SentryTransportOptions = {}) {
    super(options);

    this.sentry = options.sentry || Sentry;
    this.levelsMap = options.levelsMap || {
      silly: 'debug',
      verbose: 'debug',
      info: 'info',
      debug: 'debug',
      warn: 'warning',
      warning: 'warning',
      error: 'error',
      fatal: 'fatal',
    };

    // Handle unhandled rejections and exceptions if configured
    if (options.captureUnhandledRejections) {
      process.on('unhandledRejection', (reason, promise) => {
        this.sentry.captureException(reason, {
          tags: { source: 'unhandledRejection' },
          extra: { promise },
        });
      });
    }

    if (options.captureUncaughtExceptions) {
      process.on('uncaughtException', (error) => {
        this.sentry.captureException(error, {
          tags: { source: 'uncaughtException' },
        });
      });
    }
  }

  log(info: any, callback: () => void): void {
    setImmediate(() => {
      this.emit('logged', info);
    });

    const { level, message, meta = {}, error, stack, ...extra } = info;
    
    // Convert Winston level to Sentry level
    const sentryLevel = this.levelsMap[level] || 'info';

    // Prepare Sentry context
    const sentryContext: any = {
      level: sentryLevel,
      tags: {
        logger: 'winston',
        level: level,
        ...meta.tags,
      },
      extra: {
        ...extra,
        ...meta.extra,
      },
    };

    // Add user context if available
    if (meta.user) {
      sentryContext.user = meta.user;
    }

    // Add request context if available
    if (meta.req) {
      sentryContext.request = this.extractRequestInfo(meta.req);
    }

    // Add fingerprint for grouping
    if (meta.fingerprint) {
      sentryContext.fingerprint = Array.isArray(meta.fingerprint) 
        ? meta.fingerprint 
        : [meta.fingerprint];
    }

    try {
      if (error instanceof Error || stack) {
        // Log as exception
        const errorToCapture = error instanceof Error ? error : new Error(message);
        if (stack && !errorToCapture.stack) {
          errorToCapture.stack = stack;
        }
        
        this.sentry.captureException(errorToCapture, sentryContext);
      } else if (sentryLevel === 'error' || sentryLevel === 'fatal') {
        // Log error messages as exceptions for better visibility
        const errorFromMessage = new Error(message);
        this.sentry.captureException(errorFromMessage, sentryContext);
      } else {
        // Log as message
        this.sentry.captureMessage(message, sentryContext);
      }
    } catch (sentryError) {
      console.error('Failed to send log to Sentry:', sentryError);
    }

    callback();
  }

  private extractRequestInfo(req: any): any {
    const request: any = {
      method: req.method,
      url: req.url || req.originalUrl,
      headers: this.sanitizeHeaders(req.headers || {}),
      query_string: req.query,
    };

    // Add user info if available
    if (req.user) {
      request.user = {
        id: req.user.id,
        email: req.user.email,
        username: req.user.username || req.user.name,
      };
    }

    // Add IP address
    if (req.ip) {
      request.ip_address = req.ip;
    } else if (req.connection?.remoteAddress) {
      request.ip_address = req.connection.remoteAddress;
    }

    // Add request body (be careful with sensitive data)
    if (req.body && typeof req.body === 'object') {
      request.data = this.sanitizeRequestBody(req.body);
    }

    return request;
  }

  private sanitizeHeaders(headers: Record<string, any>): Record<string, any> {
    const sanitized = { ...headers };
    const sensitiveHeaders = [
      'authorization',
      'cookie',
      'x-api-key',
      'x-auth-token',
      'x-access-token',
    ];

    for (const header of sensitiveHeaders) {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  private sanitizeRequestBody(body: any): any {
    if (typeof body !== 'object' || body === null) {
      return body;
    }

    const sanitized = Array.isArray(body) ? [...body] : { ...body };
    const sensitiveFields = [
      'password',
      'token',
      'secret',
      'key',
      'credit_card',
      'ssn',
      'social_security',
    ];

    const sanitizeObject = (obj: any): any => {
      if (typeof obj !== 'object' || obj === null) {
        return obj;
      }

      if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
      }

      const result: any = {};
      for (const [key, value] of Object.entries(obj)) {
        const isSensitive = sensitiveFields.some(field =>
          key.toLowerCase().includes(field.toLowerCase())
        );

        if (isSensitive) {
          result[key] = '[REDACTED]';
        } else if (typeof value === 'object') {
          result[key] = sanitizeObject(value);
        } else {
          result[key] = value;
        }
      }

      return result;
    };

    return sanitizeObject(sanitized);
  }
}

// Enhanced Winston logger with Sentry integration
export class EnhancedLogger {
  private logger: winston.Logger;
  private sentry: typeof Sentry;

  constructor(options: EnhancedLoggerOptions) {
    this.sentry = options.sentry || Sentry;
    
    const transports: winston.transport[] = [
      // Console transport
      new winston.transports.Console({
        level: options.consoleLevel || 'info',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.errors({ stack: true }),
          winston.format.colorize({ all: true }),
          winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
            let log = `${timestamp} [${level}]: ${message}`;
            
            if (stack) {
              log += `\n${stack}`;
            }
            
            if (Object.keys(meta).length > 0) {
              log += `\n${JSON.stringify(meta, null, 2)}`;
            }
            
            return log;
          })
        ),
      }),
    ];

    // Add file transport if configured
    if (options.file) {
      transports.push(
        new winston.transports.File({
          filename: options.file.filename,
          level: options.file.level || 'error',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.errors({ stack: true }),
            winston.format.json()
          ),
          maxsize: options.file.maxsize || 5242880, // 5MB
          maxFiles: options.file.maxFiles || 5,
        })
      );
    }

    // Add Sentry transport
    if (options.sentry) {
      transports.push(
        new SentryTransport({
          level: options.sentryLevel || 'error',
          sentry: options.sentry,
          levelsMap: options.sentryLevelsMap,
        })
      );
    }

    this.logger = winston.createLogger({
      level: options.level || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: {
        service: options.service,
        environment: options.environment,
        version: options.version,
      },
      transports,
      exitOnError: false,
    });

    // Handle Winston errors
    this.logger.on('error', (error) => {
      console.error('Winston logger error:', error);
    });
  }

  // Log methods with enhanced context
  public debug(message: string, meta?: LogMeta): void {
    this.logger.debug(message, this.formatMeta(meta));
  }

  public info(message: string, meta?: LogMeta): void {
    this.logger.info(message, this.formatMeta(meta));
  }

  public warn(message: string, meta?: LogMeta): void {
    this.logger.warn(message, this.formatMeta(meta));
  }

  public error(message: string, error?: Error, meta?: LogMeta): void {
    const errorMeta = error ? {
      error,
      stack: error.stack,
      ...this.formatMeta(meta),
    } : this.formatMeta(meta);

    this.logger.error(message, errorMeta);
  }

  public fatal(message: string, error?: Error, meta?: LogMeta): void {
    const errorMeta = error ? {
      error,
      stack: error.stack,
      level: 'fatal',
      ...this.formatMeta(meta),
    } : { level: 'fatal', ...this.formatMeta(meta) };

    this.logger.error(message, errorMeta);
  }

  // HTTP request logging
  public logRequest(req: any, res: any, responseTime: number): void {
    const meta = {
      req,
      res: {
        statusCode: res.statusCode,
        statusMessage: res.statusMessage,
        headers: res.getHeaders?.() || {},
      },
      responseTime,
      tags: {
        component: 'http',
        method: req.method,
        route: req.route?.path || req.path,
      },
    };

    const level = res.statusCode >= 400 ? 'error' : 'info';
    const message = `${req.method} ${req.originalUrl || req.url} ${res.statusCode} - ${responseTime}ms`;

    this.logger.log(level, message, meta);
  }

  // Database query logging
  public logQuery(query: string, duration: number, error?: Error): void {
    const meta = {
      query: this.sanitizeQuery(query),
      duration,
      tags: {
        component: 'database',
      },
    };

    if (error) {
      this.error('Database query failed', error, meta);
    } else if (duration > 1000) { // Log slow queries
      this.warn('Slow database query', meta);
    } else {
      this.debug('Database query executed', meta);
    }
  }

  // External API call logging
  public logApiCall(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    error?: Error
  ): void {
    const meta = {
      method,
      url: this.sanitizeUrl(url),
      statusCode,
      duration,
      tags: {
        component: 'external-api',
      },
    };

    if (error) {
      this.error('External API call failed', error, meta);
    } else if (statusCode >= 400) {
      this.warn('External API call returned error status', meta);
    } else {
      this.info('External API call completed', meta);
    }
  }

  // Business logic logging
  public logBusinessEvent(
    event: string,
    userId?: string,
    data?: Record<string, any>
  ): void {
    const meta = {
      event,
      userId,
      data,
      tags: {
        component: 'business-logic',
        event,
      },
    };

    this.info(`Business event: ${event}`, meta);
  }

  // Security event logging
  public logSecurityEvent(
    event: 'auth_failed' | 'auth_success' | 'permission_denied' | 'suspicious_activity',
    userId?: string,
    details?: Record<string, any>
  ): void {
    const meta = {
      event,
      userId,
      details,
      tags: {
        component: 'security',
        event,
      },
    };

    const level = event === 'auth_success' ? 'info' : 'warn';
    this.logger.log(level, `Security event: ${event}`, meta);
  }

  // Performance logging
  public logPerformance(
    operation: string,
    duration: number,
    success: boolean,
    metadata?: Record<string, any>
  ): void {
    const meta = {
      operation,
      duration,
      success,
      ...metadata,
      tags: {
        component: 'performance',
        operation,
      },
    };

    if (!success) {
      this.warn(`Performance issue: ${operation} took ${duration}ms`, meta);
    } else if (duration > 5000) { // Log slow operations
      this.warn(`Slow operation: ${operation} took ${duration}ms`, meta);
    } else {
      this.debug(`Operation completed: ${operation} (${duration}ms)`, meta);
    }
  }

  // Format meta object
  private formatMeta(meta?: LogMeta): any {
    if (!meta) return {};

    return {
      ...meta,
      timestamp: new Date().toISOString(),
    };
  }

  // Sanitize SQL query
  private sanitizeQuery(query: string): string {
    // Remove potential sensitive data from queries
    return query.replace(/VALUES\s*\([^)]*\)/gi, 'VALUES (...)');
  }

  // Sanitize URL (remove potential API keys/tokens)
  private sanitizeUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      
      // Remove sensitive query parameters
      const sensitiveParams = ['api_key', 'token', 'secret', 'password'];
      for (const param of sensitiveParams) {
        if (urlObj.searchParams.has(param)) {
          urlObj.searchParams.set(param, '[REDACTED]');
        }
      }
      
      return urlObj.toString();
    } catch {
      return url; // Return original if URL parsing fails
    }
  }

  // Create child logger with additional context
  public child(defaultMeta: Record<string, any>): EnhancedLogger {
    const childLogger = Object.create(this);
    childLogger.logger = this.logger.child(defaultMeta);
    return childLogger;
  }

  // Close logger
  public close(): Promise<void> {
    return new Promise((resolve) => {
      this.logger.close(() => {
        resolve();
      });
    });
  }
}

// Interfaces
export interface LogMeta {
  user?: {
    id: string;
    email?: string;
    username?: string;
  };
  req?: any;
  tags?: Record<string, string>;
  extra?: Record<string, any>;
  fingerprint?: string | string[];
  [key: string]: any;
}

export interface EnhancedLoggerOptions {
  service: string;
  environment: string;
  version?: string;
  level?: string;
  consoleLevel?: string;
  sentryLevel?: string;
  sentry?: typeof Sentry;
  sentryLevelsMap?: Record<string, Sentry.SeverityLevel>;
  file?: {
    filename: string;
    level?: string;
    maxsize?: number;
    maxFiles?: number;
  };
}

// Express middleware for request logging
export function createRequestLoggingMiddleware(logger: EnhancedLogger) {
  return (req: any, res: any, next: any) => {
    const startTime = Date.now();

    // Log request start
    logger.debug(`Incoming request: ${req.method} ${req.originalUrl}`, {
      req,
      tags: {
        component: 'http-middleware',
        phase: 'start',
      },
    });

    // Override res.end to capture response
    const originalEnd = res.end;
    res.end = function(chunk: any, encoding: any) {
      const responseTime = Date.now() - startTime;
      
      // Log request completion
      logger.logRequest(req, res, responseTime);
      
      // Call original end method
      originalEnd.call(res, chunk, encoding);
    };

    next();
  };
}

// Error handling middleware
export function createErrorLoggingMiddleware(logger: EnhancedLogger) {
  return (error: Error, req: any, res: any, next: any) => {
    logger.error('Unhandled request error', error, {
      req,
      tags: {
        component: 'error-middleware',
      },
    });

    next(error);
  };
}