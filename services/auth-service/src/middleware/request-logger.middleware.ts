import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { logger } from '../utils/logger';
import { config } from '../config';
import crypto from 'crypto';

export interface RequestLogData {
  requestId: string;
  method: string;
  url: string;
  userAgent?: string;
  ip: string;
  userId?: string;
  timestamp: string;
  headers: Record<string, any>;
  query: Record<string, any>;
  params: Record<string, any>;
  body?: any;
  responseTime?: number;
  statusCode?: number;
  contentLength?: number;
  errorMessage?: string;
  sessionId?: string;
  deviceId?: string;
  correlationId?: string;
}

export interface LoggingConfig {
  enableRequestLogging: boolean;
  enableResponseLogging: boolean;
  enableErrorLogging: boolean;
  enablePerformanceLogging: boolean;
  enableSecurityLogging: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  excludePaths: string[];
  excludeHeaders: string[];
  sanitizeFields: string[];
  maxBodySize: number;
  enableBodyLogging: boolean;
  enableQueryLogging: boolean;
  enableHeaderLogging: boolean;
  redactSensitiveData: boolean;
  enableUserTracking: boolean;
  enableIPTracking: boolean;
  enableSlowRequestLogging: boolean;
  slowRequestThreshold: number;
}

const DEFAULT_CONFIG: LoggingConfig = {
  enableRequestLogging: true,
  enableResponseLogging: true,
  enableErrorLogging: true,
  enablePerformanceLogging: true,
  enableSecurityLogging: true,
  logLevel: 'info',
  excludePaths: ['/health', '/metrics', '/favicon.ico'],
  excludeHeaders: [
    'authorization',
    'cookie',
    'x-api-key',
    'x-auth-token',
    'set-cookie'
  ],
  sanitizeFields: [
    'password',
    'token',
    'secret',
    'key',
    'authorization',
    'credit_card',
    'ssn',
    'social_security'
  ],
  maxBodySize: 10000, // 10KB
  enableBodyLogging: true,
  enableQueryLogging: true,
  enableHeaderLogging: true,
  redactSensitiveData: true,
  enableUserTracking: true,
  enableIPTracking: true,
  enableSlowRequestLogging: true,
  slowRequestThreshold: 1000 // 1 second
};

export class RequestLogger {
  private config: LoggingConfig;
  private requestStore: Map<string, RequestLogData> = new Map();

  constructor(customConfig: Partial<LoggingConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...customConfig };
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  }

  /**
   * Check if path should be excluded from logging
   */
  private shouldExcludePath(path: string): boolean {
    return this.config.excludePaths.some(excludePath => 
      path.startsWith(excludePath) || path === excludePath
    );
  }

  /**
   * Sanitize sensitive data from object
   */
  private sanitizeData(data: any): any {
    if (!this.config.redactSensitiveData || !data || typeof data !== 'object') {
      return data;
    }

    const sanitized = { ...data };
    
    for (const field of this.config.sanitizeFields) {
      for (const key in sanitized) {
        if (key.toLowerCase().includes(field.toLowerCase())) {
          sanitized[key] = '[REDACTED]';
        }
      }
    }

    return sanitized;
  }

  /**
   * Filter headers to exclude sensitive ones
   */
  private filterHeaders(headers: Record<string, any>): Record<string, any> {
    if (!this.config.enableHeaderLogging) {
      return {};
    }

    const filtered: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(headers)) {
      if (!this.config.excludeHeaders.includes(key.toLowerCase())) {
        filtered[key] = value;
      } else {
        filtered[key] = '[REDACTED]';
      }
    }

    return filtered;
  }

  /**
   * Prepare body for logging with size and content restrictions
   */
  private prepareBodyForLogging(body: any): any {
    if (!this.config.enableBodyLogging || !body) {
      return undefined;
    }

    try {
      const bodyString = typeof body === 'string' ? body : JSON.stringify(body);
      
      if (bodyString.length > this.config.maxBodySize) {
        return {
          _truncated: true,
          _originalSize: bodyString.length,
          _maxSize: this.config.maxBodySize,
          content: bodyString.substring(0, this.config.maxBodySize) + '...[TRUNCATED]'
        };
      }

      const sanitizedBody = this.sanitizeData(body);
      return sanitizedBody;
    } catch (error) {
      return { _error: 'Failed to serialize body for logging' };
    }
  }

  /**
   * Extract user information from request
   */
  private extractUserInfo(request: FastifyRequest): { userId?: string; sessionId?: string; deviceId?: string } {
    if (!this.config.enableUserTracking) {
      return {};
    }

    try {
      const user = (request as any).user;
      const sessionId = request.headers['x-session-id'] as string;
      const deviceId = request.headers['x-device-id'] as string;

      return {
        userId: user?.id || user?.userId,
        sessionId,
        deviceId
      };
    } catch {
      return {};
    }
  }

  /**
   * Extract IP address with proxy support
   */
  private extractIPAddress(request: FastifyRequest): string {
    if (!this.config.enableIPTracking) {
      return '[REDACTED]';
    }

    return (
      request.headers['x-forwarded-for'] as string ||
      request.headers['x-real-ip'] as string ||
      request.ip ||
      'unknown'
    );
  }

  /**
   * Log request start
   */
  async logRequest(request: FastifyRequest): Promise<void> {
    if (!this.config.enableRequestLogging || this.shouldExcludePath(request.url)) {
      return;
    }

    const requestId = this.generateRequestId();
    const userInfo = this.extractUserInfo(request);
    const correlationId = request.headers['x-correlation-id'] as string || requestId;

    // Add request ID to headers for tracing
    request.headers['x-request-id'] = requestId;

    const logData: RequestLogData = {
      requestId,
      method: request.method,
      url: request.url,
      userAgent: request.headers['user-agent'],
      ip: this.extractIPAddress(request),
      timestamp: new Date().toISOString(),
      headers: this.filterHeaders(request.headers),
      query: this.config.enableQueryLogging ? this.sanitizeData(request.query) : {},
      params: this.sanitizeData(request.params),
      body: this.prepareBodyForLogging(request.body),
      correlationId,
      ...userInfo
    };

    // Store request data for response logging
    this.requestStore.set(requestId, logData);

    // Log request start
    logger.info({
      type: 'request_start',
      ...logData,
      body: undefined // Don't log body in request start for brevity
    }, `🔵 ${request.method} ${request.url} started`);

    // Log body separately if enabled and present
    if (this.config.enableBodyLogging && logData.body && this.config.logLevel === 'debug') {
      logger.debug({
        type: 'request_body',
        requestId,
        body: logData.body
      }, `📝 Request body for ${requestId}`);
    }
  }

  /**
   * Log response completion
   */
  async logResponse(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    if (!this.config.enableResponseLogging || this.shouldExcludePath(request.url)) {
      return;
    }

    const requestId = request.headers['x-request-id'] as string;
    const requestData = this.requestStore.get(requestId);

    if (!requestData) {
      return;
    }

    const responseTime = reply.getResponseTime();
    const statusCode = reply.statusCode;
    const contentLength = reply.getHeader('content-length') as number;

    const responseLogData = {
      ...requestData,
      responseTime: Math.round(responseTime * 100) / 100, // Round to 2 decimal places
      statusCode,
      contentLength: contentLength || 0,
      timestamp: new Date().toISOString()
    };

    // Determine log level based on status code and response time
    const isError = statusCode >= 400;
    const isSlow = responseTime > this.config.slowRequestThreshold;
    const isSuccess = statusCode >= 200 && statusCode < 300;

    let logLevel: 'info' | 'warn' | 'error' = 'info';
    let emoji = '🟢';
    let message = `${request.method} ${request.url} completed`;

    if (isError) {
      logLevel = statusCode >= 500 ? 'error' : 'warn';
      emoji = statusCode >= 500 ? '🔴' : '🟡';
      message = `${request.method} ${request.url} failed`;
    } else if (isSlow) {
      logLevel = 'warn';
      emoji = '🐌';
      message = `${request.method} ${request.url} slow response`;
    } else if (isSuccess) {
      emoji = '🟢';
    }

    // Log response
    logger[logLevel]({
      type: 'request_complete',
      ...responseLogData,
      body: undefined // Don't include request body in response log
    }, `${emoji} ${message} - ${statusCode} in ${responseTime}ms`);

    // Log slow requests with additional detail
    if (isSlow && this.config.enableSlowRequestLogging) {
      logger.warn({
        type: 'slow_request',
        requestId,
        method: request.method,
        url: request.url,
        responseTime,
        threshold: this.config.slowRequestThreshold,
        userId: responseLogData.userId,
        userAgent: responseLogData.userAgent
      }, `🐌 Slow request detected: ${responseTime}ms > ${this.config.slowRequestThreshold}ms`);
    }

    // Performance logging
    if (this.config.enablePerformanceLogging) {
      logger.debug({
        type: 'performance_metric',
        requestId,
        method: request.method,
        url: request.url,
        responseTime,
        statusCode,
        contentLength,
        memoryUsage: process.memoryUsage().heapUsed
      }, `📊 Performance metrics for ${requestId}`);
    }

    // Clean up stored request data
    this.requestStore.delete(requestId);
  }

  /**
   * Log errors with detailed context
   */
  async logError(request: FastifyRequest, reply: FastifyReply, error: Error): Promise<void> {
    if (!this.config.enableErrorLogging) {
      return;
    }

    const requestId = request.headers['x-request-id'] as string;
    const requestData = this.requestStore.get(requestId);
    const userInfo = this.extractUserInfo(request);

    const errorLogData = {
      type: 'request_error',
      requestId,
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      errorMessage: error.message,
      errorStack: error.stack,
      errorName: error.name,
      timestamp: new Date().toISOString(),
      userAgent: request.headers['user-agent'],
      ip: this.extractIPAddress(request),
      ...userInfo,
      requestData: requestData ? {
        headers: requestData.headers,
        query: requestData.query,
        params: requestData.params
      } : undefined
    };

    logger.error(errorLogData, `🔴 Request error: ${error.message}`);

    // Security logging for suspicious errors
    if (this.config.enableSecurityLogging) {
      this.logSecurityEvent(request, error);
    }
  }

  /**
   * Log security-related events
   */
  private logSecurityEvent(request: FastifyRequest, error: Error): void {
    const suspiciousPatterns = [
      'sql injection',
      'xss',
      'unauthorized',
      'forbidden',
      'csrf',
      'invalid token',
      'malformed',
      'suspicious'
    ];

    const isSuspicious = suspiciousPatterns.some(pattern => 
      error.message.toLowerCase().includes(pattern) ||
      request.url.toLowerCase().includes(pattern)
    );

    if (isSuspicious) {
      const userInfo = this.extractUserInfo(request);
      
      logger.warn({
        type: 'security_event',
        requestId: request.headers['x-request-id'],
        method: request.method,
        url: request.url,
        ip: this.extractIPAddress(request),
        userAgent: request.headers['user-agent'],
        errorMessage: error.message,
        timestamp: new Date().toISOString(),
        ...userInfo,
        severity: 'medium',
        category: 'suspicious_request'
      }, `🚨 Suspicious request detected: ${error.message}`);
    }
  }

  /**
   * Log authentication events
   */
  async logAuthEvent(
    request: FastifyRequest, 
    event: 'login_attempt' | 'login_success' | 'login_failure' | 'logout' | 'token_refresh',
    details: Record<string, any> = {}
  ): Promise<void> {
    if (!this.config.enableSecurityLogging) {
      return;
    }

    const requestId = request.headers['x-request-id'] as string;
    const userInfo = this.extractUserInfo(request);

    const authLogData = {
      type: 'auth_event',
      requestId,
      event,
      method: request.method,
      url: request.url,
      ip: this.extractIPAddress(request),
      userAgent: request.headers['user-agent'],
      timestamp: new Date().toISOString(),
      ...userInfo,
      ...this.sanitizeData(details)
    };

    const emoji = event.includes('success') ? '🟢' : 
                  event.includes('failure') ? '🔴' : '🔵';

    logger.info(authLogData, `${emoji} Authentication event: ${event}`);
  }

  /**
   * Get request statistics
   */
  getStats(): {
    activeRequests: number;
    totalMemoryUsage: number;
    oldestRequest?: string;
  } {
    const activeRequests = this.requestStore.size;
    const memoryUsage = JSON.stringify([...this.requestStore.values()]).length;
    
    let oldestRequest: string | undefined;
    let oldestTime = Date.now();

    for (const [requestId, data] of this.requestStore.entries()) {
      const requestTime = new Date(data.timestamp).getTime();
      if (requestTime < oldestTime) {
        oldestTime = requestTime;
        oldestRequest = requestId;
      }
    }

    return {
      activeRequests,
      totalMemoryUsage: memoryUsage,
      oldestRequest
    };
  }

  /**
   * Clean up old request data to prevent memory leaks
   */
  cleanup(): void {
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutes

    for (const [requestId, data] of this.requestStore.entries()) {
      const requestTime = new Date(data.timestamp).getTime();
      if (now - requestTime > maxAge) {
        this.requestStore.delete(requestId);
      }
    }
  }
}

// Create default logger instance
const defaultLogger = new RequestLogger({
  enableRequestLogging: config.ENABLE_REQUEST_LOGGING,
  logLevel: config.LOG_LEVEL as any,
  slowRequestThreshold: config.SLOW_REQUEST_THRESHOLD || 1000,
  maxBodySize: config.MAX_LOG_BODY_SIZE || 10000,
  redactSensitiveData: config.NODE_ENV === 'production'
});

// Cleanup old requests periodically
setInterval(() => {
  defaultLogger.cleanup();
}, 60000); // Every minute

/**
 * Fastify plugin for request/response logging
 */
export async function requestLoggerPlugin(
  fastify: FastifyInstance,
  options: Partial<LoggingConfig> = {}
): Promise<void> {
  const requestLogger = new RequestLogger(options);

  // Request start hook
  fastify.addHook('onRequest', async (request, reply) => {
    await requestLogger.logRequest(request);
  });

  // Response completion hook
  fastify.addHook('onResponse', async (request, reply) => {
    await requestLogger.logResponse(request, reply);
  });

  // Error logging hook
  fastify.addHook('onError', async (request, reply, error) => {
    await requestLogger.logError(request, reply, error);
  });

  // Add request ID to all responses
  fastify.addHook('onSend', async (request, reply, payload) => {
    const requestId = request.headers['x-request-id'] as string;
    if (requestId) {
      reply.header('x-request-id', requestId);
    }
    return payload;
  });

  // Decorate fastify instance with logger
  fastify.decorate('requestLogger', requestLogger);
}

/**
 * Express-style middleware for backward compatibility
 */
export function requestLogger(request: FastifyRequest, reply: FastifyReply, next: Function): void {
  defaultLogger.logRequest(request);
  
  const originalSend = reply.send;
  reply.send = function(payload?: any) {
    defaultLogger.logResponse(request, reply);
    return originalSend.call(this, payload);
  };

  next();
}

// Export default instance
export { defaultLogger };

// Type augmentation for Fastify
declare module 'fastify' {
  interface FastifyInstance {
    requestLogger?: RequestLogger;
  }
}