import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import { isDevelopment } from '../config';

interface RequestLogData {
  requestId: string;
  method: string;
  url: string;
  userAgent?: string;
  ip: string;
  userId?: string;
  organizationId?: string;
  responseTime?: number;
  statusCode?: number;
  contentLength?: number;
}

const requestLogger = fp(async (fastify: FastifyInstance) => {
  // Request logging hook
  fastify.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    const startTime = Date.now();
    
    // Store start time for response time calculation
    (request as any).startTime = startTime;

    // Log incoming request in development
    if (isDevelopment) {
      const logData: Partial<RequestLogData> = {
        requestId: request.id,
        method: request.method,
        url: request.url,
        userAgent: request.headers['user-agent'],
        ip: request.ip,
      };

      fastify.log.debug(logData, 'Incoming request');
    }
  });

  // Response logging hook
  fastify.addHook('onResponse', async (request: FastifyRequest, reply: FastifyReply) => {
    const startTime = (request as any).startTime;
    const responseTime = startTime ? Date.now() - startTime : undefined;

    const logData: RequestLogData = {
      requestId: request.id,
      method: request.method,
      url: request.url,
      userAgent: request.headers['user-agent'],
      ip: request.ip,
      userId: request.user?.id,
      organizationId: request.user?.organizationId,
      responseTime,
      statusCode: reply.statusCode,
      contentLength: reply.getHeader('content-length') as number,
    };

    // Determine log level based on status code
    let logLevel: 'info' | 'warn' | 'error' = 'info';
    
    if (reply.statusCode >= 400 && reply.statusCode < 500) {
      logLevel = 'warn';
    } else if (reply.statusCode >= 500) {
      logLevel = 'error';
    }

    // Log based on environment and status
    if (isDevelopment || logLevel !== 'info') {
      fastify.log[logLevel](logData, 'Request completed');
    }

    // Log slow requests (> 1 second)
    if (responseTime && responseTime > 1000) {
      fastify.log.warn({
        ...logData,
        slow: true,
      }, 'Slow request detected');
    }
  });

  // Add request context helpers
  fastify.decorateRequest('getLogContext', function() {
    return {
      requestId: this.id,
      method: this.method,
      url: this.url,
      userId: this.user?.id,
      organizationId: this.user?.organizationId,
      ip: this.ip,
    };
  });

  // Add structured logging helper
  fastify.decorateRequest('logInfo', function(message: string, data?: any) {
    fastify.log.info({
      ...this.getLogContext(),
      ...data,
    }, message);
  });

  fastify.decorateRequest('logWarn', function(message: string, data?: any) {
    fastify.log.warn({
      ...this.getLogContext(),
      ...data,
    }, message);
  });

  fastify.decorateRequest('logError', function(message: string, error?: Error, data?: any) {
    fastify.log.error({
      ...this.getLogContext(),
      error: error?.message,
      stack: error?.stack,
      ...data,
    }, message);
  });

  fastify.decorateRequest('logDebug', function(message: string, data?: any) {
    fastify.log.debug({
      ...this.getLogContext(),
      ...data,
    }, message);
  });
});

// Extend FastifyRequest type
declare module 'fastify' {
  interface FastifyRequest {
    getLogContext(): {
      requestId: string;
      method: string;
      url: string;
      userId?: string;
      organizationId?: string;
      ip: string;
    };
    logInfo(message: string, data?: any): void;
    logWarn(message: string, data?: any): void;
    logError(message: string, error?: Error, data?: any): void;
    logDebug(message: string, data?: any): void;
  }
}

export default requestLogger;