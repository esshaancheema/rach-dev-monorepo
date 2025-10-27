import { FastifyInstance, FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { logger } from '../utils/logger';

interface CustomError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler(async (error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
    const userId = (request as any).user?.id;
    
    // Log the error with context
    logger.error({
      error: {
        message: error.message,
        stack: error.stack,
        code: error.code,
        statusCode: error.statusCode,
      },
      userId,
      method: request.method,
      url: request.url,
      headers: request.headers,
      body: request.body,
    }, 'Request failed with error');

    // Handle specific error types
    if (error.validation) {
      return reply.code(400).send({
        success: false,
        error: 'Validation Error',
        details: error.validation,
        code: 'VALIDATION_ERROR',
      });
    }

    if (error.statusCode === 401) {
      return reply.code(401).send({
        success: false,
        error: 'Authentication required',
        code: 'UNAUTHORIZED',
      });
    }

    if (error.statusCode === 403) {
      return reply.code(403).send({
        success: false,
        error: 'Access forbidden',
        code: 'FORBIDDEN',
      });
    }

    if (error.statusCode === 404) {
      return reply.code(404).send({
        success: false,
        error: 'Resource not found',
        code: 'NOT_FOUND',
      });
    }

    if (error.statusCode === 429) {
      return reply.code(429).send({
        success: false,
        error: 'Too many requests',
        code: 'RATE_LIMITED',
        retryAfter: 3600, // 1 hour
      });
    }

    // Handle AI service specific errors
    if (error.message.includes('rate limit') || error.message.includes('Rate limit')) {
      return reply.code(429).send({
        success: false,
        error: 'AI service rate limit exceeded',
        code: 'AI_RATE_LIMIT',
        retryAfter: 3600,
      });
    }

    if (error.message.includes('quota') || error.message.includes('Quota')) {
      return reply.code(402).send({
        success: false,
        error: 'AI service quota exceeded',
        code: 'AI_QUOTA_EXCEEDED',
      });
    }

    if (error.message.includes('model') && error.message.includes('not found')) {
      return reply.code(400).send({
        success: false,
        error: 'Requested AI model is not available',
        code: 'MODEL_NOT_AVAILABLE',
      });
    }

    if (error.message.includes('timeout') || error.message.includes('Timeout')) {
      return reply.code(408).send({
        success: false,
        error: 'Request timeout',
        code: 'TIMEOUT',
      });
    }

    // Handle database/Redis errors
    if (error.message.includes('connection') || error.message.includes('Connection')) {
      return reply.code(503).send({
        success: false,
        error: 'Service temporarily unavailable',
        code: 'SERVICE_UNAVAILABLE',
      });
    }

    // Handle JWT errors
    if (error.message.includes('jwt') || error.message.includes('token')) {
      return reply.code(401).send({
        success: false,
        error: 'Invalid or expired authentication token',
        code: 'INVALID_TOKEN',
      });
    }

    // Handle file size errors
    if (error.code === 'FST_REQ_FILE_TOO_LARGE') {
      return reply.code(413).send({
        success: false,
        error: 'Request payload too large',
        code: 'PAYLOAD_TOO_LARGE',
      });
    }

    // Handle syntax errors in requests
    if (error.message.includes('JSON') || error.message.includes('syntax')) {
      return reply.code(400).send({
        success: false,
        error: 'Invalid JSON in request body',
        code: 'INVALID_JSON',
      });
    }

    // Default internal server error
    const statusCode = error.statusCode || 500;
    
    // Don't expose internal errors in production
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    return reply.code(statusCode).send({
      success: false,
      error: isDevelopment ? error.message : 'Internal server error',
      code: 'INTERNAL_ERROR',
      ...(isDevelopment && { 
        stack: error.stack,
        details: error 
      }),
    });
  });

  // Handle 404 errors for unmatched routes
  app.setNotFoundHandler(async (request: FastifyRequest, reply: FastifyReply) => {
    logger.warn({
      method: request.method,
      url: request.url,
      userAgent: request.headers['user-agent'],
      ip: request.ip,
    }, 'Route not found');

    return reply.code(404).send({
      success: false,
      error: `Route ${request.method} ${request.url} not found`,
      code: 'ROUTE_NOT_FOUND',
    });
  });
}

// Custom error classes
export class AIServiceError extends Error {
  public statusCode: number;
  public code: string;
  public details?: any;

  constructor(message: string, statusCode: number = 500, code: string = 'AI_SERVICE_ERROR', details?: any) {
    super(message);
    this.name = 'AIServiceError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export class ValidationError extends Error {
  public statusCode: number;
  public code: string;
  public details?: any;

  constructor(message: string, details?: any) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
    this.code = 'VALIDATION_ERROR';
    this.details = details;
  }
}

export class AuthenticationError extends Error {
  public statusCode: number;
  public code: string;

  constructor(message: string = 'Authentication required') {
    super(message);
    this.name = 'AuthenticationError';
    this.statusCode = 401;
    this.code = 'UNAUTHORIZED';
  }
}

export class AuthorizationError extends Error {
  public statusCode: number;
  public code: string;

  constructor(message: string = 'Access forbidden') {
    super(message);
    this.name = 'AuthorizationError';
    this.statusCode = 403;
    this.code = 'FORBIDDEN';
  }
}

export class RateLimitError extends Error {
  public statusCode: number;
  public code: string;
  public retryAfter: number;

  constructor(message: string = 'Rate limit exceeded', retryAfter: number = 3600) {
    super(message);
    this.name = 'RateLimitError';
    this.statusCode = 429;
    this.code = 'RATE_LIMITED';
    this.retryAfter = retryAfter;
  }
}