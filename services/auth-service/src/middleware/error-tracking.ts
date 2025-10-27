import { Request, Response, NextFunction } from 'express';
import {
  ErrorTrackingSystem,
  ErrorTrackingConfig,
  ErrorTrackingUtils,
  SentryErrorTracker,
  EnhancedLogger,
  PerformanceMonitor,
} from '@zoptal/error-tracking';

// Initialize error tracking for auth service
const errorTracking = new ErrorTrackingSystem();

// Service configuration
const serviceName = 'auth-service';
const environment = process.env.NODE_ENV || 'development';

// Initialize based on environment
if (environment === 'production') {
  const config = ErrorTrackingConfig.createProductionConfig(serviceName);
  
  errorTracking.initializeSentry(config.sentry);
  errorTracking.initializeLogger(config.logger);
  errorTracking.initializePerformanceMonitor(config.performance, serviceName, environment);
  
  // Initialize alert manager if email/slack configured
  if (process.env.SMTP_HOST || process.env.SLACK_WEBHOOK_URL) {
    errorTracking.initializeAlertManager(config.alertManager);
  }
} else {
  const config = ErrorTrackingConfig.createDevelopmentConfig(serviceName);
  
  errorTracking.initializeSentry(config.sentry);
  errorTracking.initializeLogger(config.logger);
  errorTracking.initializePerformanceMonitor(config.performance, serviceName, environment);
}

// Get logger instance
export const logger = errorTracking.getLogger();

// Auth service specific error classes
export class AuthenticationError extends Error {
  constructor(message: string, public code: string = 'AUTH_FAILED') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string, public resource?: string, public action?: string) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public field?: string, public value?: any) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class RateLimitError extends Error {
  constructor(message: string, public limit: number, public resetTime: Date) {
    super(message);
    this.name = 'RateLimitError';
  }
}

// Auth-specific error capture
export function captureAuthError(
  error: Error,
  req: Request,
  additionalContext?: {
    userId?: string;
    operation?: string;
    ipAddress?: string;
    userAgent?: string;
  }
): string {
  const context = {
    service: serviceName,
    user: additionalContext?.userId ? { id: additionalContext.userId } : ErrorTrackingUtils.extractUserContext(req),
    request: req,
    tags: {
      component: 'authentication',
      operation: additionalContext?.operation || 'unknown',
      error_type: error.constructor.name,
    },
    extra: {
      ip: additionalContext?.ipAddress || req.ip,
      userAgent: additionalContext?.userAgent || req.get('User-Agent'),
      timestamp: new Date().toISOString(),
    },
  };

  // Add specific context based on error type
  if (error instanceof AuthenticationError) {
    context.tags.auth_code = error.code;
    context.extra.auth_failure = true;
  } else if (error instanceof AuthorizationError) {
    context.tags.resource = error.resource || 'unknown';
    context.tags.action = error.action || 'unknown';
    context.extra.authorization_failure = true;
  } else if (error instanceof ValidationError) {
    context.tags.validation_field = error.field || 'unknown';
    context.extra.validation_value = ErrorTrackingUtils.sanitizeForLogging(error.value);
  }

  return errorTracking.captureError(error, context);
}

// Security event logging
export function logSecurityEvent(
  event: 'login_attempt' | 'login_success' | 'login_failed' | 'logout' | 'token_refresh' | 
         'password_change' | 'password_reset' | 'account_locked' | 'suspicious_activity',
  req: Request,
  additionalData?: {
    userId?: string;
    email?: string;
    reason?: string;
    metadata?: Record<string, any>;
  }
): void {
  const isFailure = ['login_failed', 'account_locked', 'suspicious_activity'].includes(event);
  
  logger.logSecurityEvent(
    event === 'login_success' || event === 'logout' || event === 'token_refresh' || event === 'password_change' 
      ? 'auth_success' 
      : isFailure 
      ? 'auth_failed' 
      : 'suspicious_activity',
    additionalData?.userId,
    {
      event,
      email: additionalData?.email,
      reason: additionalData?.reason,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString(),
      ...additionalData?.metadata,
    }
  );

  // Also log business event for analytics
  logger.logBusinessEvent(
    `auth_${event}`,
    additionalData?.userId,
    ErrorTrackingUtils.sanitizeForLogging({
      email: additionalData?.email,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      ...additionalData?.metadata,
    })
  );
}

// Middleware for request tracking
export function authRequestTrackingMiddleware(req: Request, res: Response, next: NextFunction): void {
  const correlationId = ErrorTrackingUtils.generateCorrelationId();
  
  // Add correlation ID to request
  (req as any).correlationId = correlationId;
  
  // Set Sentry context
  const sentryTracker = errorTracking.getSentryTracker();
  sentryTracker.setTag('correlation_id', correlationId);
  sentryTracker.setTag('service', serviceName);
  sentryTracker.setExtra('request_id', correlationId);
  
  // Add breadcrumb
  sentryTracker.addBreadcrumb({
    message: `Auth service request: ${req.method} ${req.path}`,
    category: 'request',
    level: 'info',
    data: {
      method: req.method,
      path: req.path,
      correlation_id: correlationId,
      ip: req.ip,
    },
  });

  next();
}

// Middleware for user context
export function authUserContextMiddleware(req: Request, res: Response, next: NextFunction): void {
  // This middleware should run after authentication
  if ((req as any).user) {
    const user = (req as any).user;
    const sentryTracker = errorTracking.getSentryTracker();
    
    sentryTracker.setUser({
      id: user.id,
      email: user.email,
      username: user.name || user.username,
    });

    sentryTracker.setTag('user_role', user.role);
    sentryTracker.setExtra('user_verified', user.emailVerified);
  }

  next();
}

// Error handling middleware
export function authErrorHandlingMiddleware(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const eventId = captureAuthError(error, req);

  // Log the error
  logger.error('Auth service error', error, {
    req,
    tags: {
      correlation_id: (req as any).correlationId,
      error_type: error.constructor.name,
    },
  });

  // Determine response based on error type
  let statusCode = 500;
  let errorCode = 'INTERNAL_ERROR';
  let message = 'Internal server error';

  if (error instanceof AuthenticationError) {
    statusCode = 401;
    errorCode = error.code;
    message = error.message;
  } else if (error instanceof AuthorizationError) {
    statusCode = 403;
    errorCode = 'FORBIDDEN';
    message = error.message;
  } else if (error instanceof ValidationError) {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = error.message;
  } else if (error instanceof RateLimitError) {
    statusCode = 429;
    errorCode = 'RATE_LIMIT_EXCEEDED';
    message = error.message;
    
    // Add rate limit headers
    res.set({
      'X-RateLimit-Limit': error.limit.toString(),
      'X-RateLimit-Reset': error.resetTime.toISOString(),
    });
  }

  // Send error response
  res.status(statusCode).json({
    error: {
      code: errorCode,
      message,
      event_id: eventId,
      correlation_id: (req as any).correlationId,
      timestamp: new Date().toISOString(),
    },
  });
}

// Performance monitoring middleware
export const authPerformanceMiddleware = ErrorTrackingUtils.createTimingMiddleware(serviceName);

// Database query wrapper for auth service
export function wrapAuthDatabaseQuery<T>(
  queryFn: () => Promise<T>,
  operation: string,
  query?: string
): Promise<T> {
  return ErrorTrackingUtils.wrapAsync(queryFn, {
    operation: `auth_db_${operation}`,
    service: serviceName,
    tags: {
      component: 'database',
      operation,
    },
  })();
}

// External API wrapper for auth service
export function wrapAuthApiCall<T>(
  apiFn: () => Promise<T>,
  apiName: string,
  endpoint?: string
): Promise<T> {
  return ErrorTrackingUtils.wrapAsync(apiFn, {
    operation: `auth_api_${apiName}`,
    service: serviceName,
    tags: {
      component: 'external-api',
      api: apiName,
      endpoint,
    },
  })();
}

// JWT token operations wrapper
export function wrapTokenOperation<T>(
  tokenFn: () => Promise<T> | T,
  operation: 'generate' | 'verify' | 'refresh' | 'revoke'
): Promise<T> {
  const asyncFn = async () => {
    const result = await tokenFn();
    return result;
  };

  return ErrorTrackingUtils.wrapAsync(asyncFn, {
    operation: `auth_token_${operation}`,
    service: serviceName,
    tags: {
      component: 'jwt',
      operation,
    },
  })();
}

// Password operations wrapper
export function wrapPasswordOperation<T>(
  passwordFn: () => Promise<T> | T,
  operation: 'hash' | 'verify' | 'reset' | 'change'
): Promise<T> {
  const asyncFn = async () => {
    const result = await passwordFn();
    return result;
  };

  return ErrorTrackingUtils.wrapAsync(asyncFn, {
    operation: `auth_password_${operation}`,
    service: serviceName,
    tags: {
      component: 'password',
      operation,
    },
  })();
}

// Email operations wrapper
export function wrapEmailOperation<T>(
  emailFn: () => Promise<T>,
  operation: 'verification' | 'reset' | 'notification'
): Promise<T> {
  return ErrorTrackingUtils.wrapAsync(emailFn, {
    operation: `auth_email_${operation}`,
    service: serviceName,
    tags: {
      component: 'email',
      operation,
    },
  })();
}

// Session operations wrapper
export function wrapSessionOperation<T>(
  sessionFn: () => Promise<T>,
  operation: 'create' | 'validate' | 'refresh' | 'destroy'
): Promise<T> {
  return ErrorTrackingUtils.wrapAsync(sessionFn, {
    operation: `auth_session_${operation}`,
    service: serviceName,
    tags: {
      component: 'session',
      operation,
    },
  })();
}

// Health check for error tracking
export async function getErrorTrackingHealth(): Promise<{
  status: 'healthy' | 'unhealthy';
  components: Record<string, boolean>;
  timestamp: string;
}> {
  try {
    const health = await errorTracking.healthCheck();
    const allHealthy = Object.values(health).every(status => status);
    
    return {
      status: allHealthy ? 'healthy' : 'unhealthy',
      components: health,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      components: {
        sentry: false,
        alertManager: false,
        performanceMonitor: false,
        logger: false,
      },
      timestamp: new Date().toISOString(),
    };
  }
}

// Export error tracking instance for direct access if needed
export { errorTracking };

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('Shutting down auth service error tracking...');
  await errorTracking.destroy();
});

process.on('SIGINT', async () => {
  logger.info('Shutting down auth service error tracking...');
  await errorTracking.destroy();
});