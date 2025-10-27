import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import { isDevelopment } from '../config';

export class AppError extends Error {
  statusCode: number;
  code: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code || 'INTERNAL_ERROR';
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, field?: string) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends AppError {
  retryAfter?: number;

  constructor(message: string = 'Rate limit exceeded', retryAfter?: number) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message: string = 'Service temporarily unavailable') {
    super(message, 503, 'SERVICE_UNAVAILABLE');
    this.name = 'ServiceUnavailableError';
  }
}

const errorHandler = fp(async (fastify: FastifyInstance) => {
  fastify.setErrorHandler(async (error: any, request: FastifyRequest, reply: FastifyReply) => {
    const requestId = request.id;
    
    // Log error with context
    const errorContext = {
      requestId,
      error: error.message,
      stack: error.stack,
      url: request.url,
      method: request.method,
      userAgent: request.headers['user-agent'],
      ip: request.ip,
      userId: request.user?.id,
    };

    // Handle known operational errors
    if (error instanceof AppError && error.isOperational) {
      fastify.log.warn(errorContext, 'Operational error occurred');
      
      const response: any = {
        error: error.name,
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        requestId,
        timestamp: new Date().toISOString(),
      };

      // Add retry-after header for rate limit errors
      if (error instanceof RateLimitError && error.retryAfter) {
        reply.header('Retry-After', error.retryAfter.toString());
        response.retryAfter = error.retryAfter;
      }

      return reply.status(error.statusCode).send(response);
    }

    // Handle Fastify validation errors
    if (error.validation) {
      fastify.log.warn(errorContext, 'Validation error occurred');
      
      return reply.status(400).send({
        error: 'ValidationError',
        message: 'Request validation failed',
        code: 'VALIDATION_ERROR',
        statusCode: 400,
        requestId,
        timestamp: new Date().toISOString(),
        details: error.validation,
      });
    }

    // Handle JWT errors
    if (error.code === 'FST_JWT_AUTHORIZATION_TOKEN_EXPIRED') {
      fastify.log.warn(errorContext, 'JWT token expired');
      
      return reply.status(401).send({
        error: 'UnauthorizedError',
        message: 'Token expired',
        code: 'TOKEN_EXPIRED',
        statusCode: 401,
        requestId,
        timestamp: new Date().toISOString(),
      });
    }

    if (error.code === 'FST_JWT_AUTHORIZATION_TOKEN_INVALID') {
      fastify.log.warn(errorContext, 'JWT token invalid');
      
      return reply.status(401).send({
        error: 'UnauthorizedError',
        message: 'Invalid token',
        code: 'TOKEN_INVALID',
        statusCode: 401,
        requestId,
        timestamp: new Date().toISOString(),
      });
    }

    // Handle rate limit errors
    if (error.code === 'FST_ERR_RATE_LIMIT') {
      fastify.log.warn(errorContext, 'Rate limit exceeded');
      
      return reply.status(429).send({
        error: 'RateLimitError',
        message: 'Rate limit exceeded',
        code: 'RATE_LIMIT_EXCEEDED',
        statusCode: 429,
        requestId,
        timestamp: new Date().toISOString(),
      });
    }

    // Handle database connection errors
    if (error.code === 'ECONNREFUSED' || error.message?.includes('database')) {
      fastify.log.error(errorContext, 'Database connection error');
      
      return reply.status(503).send({
        error: 'ServiceUnavailableError',
        message: 'Database service temporarily unavailable',
        code: 'DATABASE_UNAVAILABLE',
        statusCode: 503,
        requestId,
        timestamp: new Date().toISOString(),
      });
    }

    // Handle Redis connection errors
    if (error.code === 'ECONNREFUSED' && error.message?.includes('Redis')) {
      fastify.log.error(errorContext, 'Redis connection error');
      
      return reply.status(503).send({
        error: 'ServiceUnavailableError',
        message: 'Cache service temporarily unavailable',
        code: 'CACHE_UNAVAILABLE',
        statusCode: 503,
        requestId,
        timestamp: new Date().toISOString(),
      });
    }

    // Log unexpected errors
    fastify.log.error(errorContext, 'Unexpected error occurred');

    // Don't leak error details in production
    const message = isDevelopment ? error.message : 'Internal server error';
    const stack = isDevelopment ? error.stack : undefined;
    const code = error.code || 'INTERNAL_ERROR';

    return reply.status(error.statusCode || 500).send({
      error: 'InternalServerError',
      message,
      code,
      statusCode: error.statusCode || 500,
      requestId,
      timestamp: new Date().toISOString(),
      ...(stack && { stack }),
    });
  });

  // Add helper methods for throwing common errors
  fastify.decorate('throwNotFound', (resource?: string) => {
    throw new NotFoundError(resource);
  });

  fastify.decorate('throwUnauthorized', (message?: string) => {
    throw new UnauthorizedError(message);
  });

  fastify.decorate('throwForbidden', (message?: string) => {
    throw new ForbiddenError(message);
  });

  fastify.decorate('throwValidation', (message: string, field?: string) => {
    throw new ValidationError(message, field);
  });

  fastify.decorate('throwConflict', (message: string) => {
    throw new ConflictError(message);
  });

  fastify.decorate('throwRateLimit', (message?: string, retryAfter?: number) => {
    throw new RateLimitError(message, retryAfter);
  });

  fastify.decorate('throwServiceUnavailable', (message?: string) => {
    throw new ServiceUnavailableError(message);
  });
});

// Extend Fastify instance type
declare module 'fastify' {
  interface FastifyInstance {
    throwNotFound: (resource?: string) => never;
    throwUnauthorized: (message?: string) => never;
    throwForbidden: (message?: string) => never;
    throwValidation: (message: string, field?: string) => never;
    throwConflict: (message: string) => never;
    throwRateLimit: (message?: string, retryAfter?: number) => never;
    throwServiceUnavailable: (message?: string) => never;
  }
}

export default errorHandler;