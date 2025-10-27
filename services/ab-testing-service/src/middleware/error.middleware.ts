import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface CustomError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export const errorHandler = (
  error: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log the error
  logger.error('Request error:', {
    error: error.message,
    stack: error.stack,
    statusCode: error.statusCode,
    code: error.code,
    method: req.method,
    url: req.url,
    body: req.body,
    user: req.user?.id,
  });

  // Default error response
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal Server Error';
  let code = error.code || 'INTERNAL_ERROR';
  let details = error.details;

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
    details = error.details || error.message;
  }

  if (error.name === 'CastError') {
    statusCode = 400;
    code = 'INVALID_ID';
    message = 'Invalid ID format';
  }

  if (error.name === 'MongoError' || error.name === 'MongoServerError') {
    if (error.code === 11000) {
      statusCode = 409;
      code = 'DUPLICATE_KEY';
      message = 'Resource already exists';
    } else {
      statusCode = 500;
      code = 'DATABASE_ERROR';
      message = 'Database operation failed';
    }
  }

  if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'INVALID_TOKEN';
    message = 'Invalid authentication token';
  }

  if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Authentication token has expired';
  }

  if (error.message === 'Experiment not found') {
    statusCode = 404;
    code = 'EXPERIMENT_NOT_FOUND';
  }

  if (error.message === 'Feature flag not found') {
    statusCode = 404;
    code = 'FLAG_NOT_FOUND';
  }

  if (error.message.includes('already exists')) {
    statusCode = 409;
    code = 'RESOURCE_EXISTS';
  }

  if (error.message.includes('Insufficient permissions')) {
    statusCode = 403;
    code = 'INSUFFICIENT_PERMISSIONS';
  }

  if (error.message.includes('Maximum number')) {
    statusCode = 429;
    code = 'LIMIT_EXCEEDED';
  }

  // Security: Don't expose internal errors in production
  if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    message = 'Internal Server Error';
    details = undefined;
  }

  // Send error response
  const errorResponse: any = {
    error: {
      code,
      message,
      statusCode,
    },
    timestamp: new Date().toISOString(),
    path: req.url,
    method: req.method,
  };

  if (details) {
    errorResponse.error.details = details;
  }

  // Add request ID if available
  if (req.headers['x-request-id']) {
    errorResponse.requestId = req.headers['x-request-id'];
  }

  res.status(statusCode).json(errorResponse);
};

// Async error wrapper to catch errors in async route handlers
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Create custom error
export const createError = (
  message: string,
  statusCode: number = 500,
  code?: string,
  details?: any
): CustomError => {
  const error = new Error(message) as CustomError;
  error.statusCode = statusCode;
  error.code = code;
  error.details = details;
  return error;
};

// Common error creators
export const notFoundError = (resource: string, id?: string): CustomError => {
  const message = id ? `${resource} with ID ${id} not found` : `${resource} not found`;
  return createError(message, 404, 'NOT_FOUND');
};

export const validationError = (message: string, details?: any): CustomError => {
  return createError(message, 400, 'VALIDATION_ERROR', details);
};

export const unauthorizedError = (message: string = 'Unauthorized'): CustomError => {
  return createError(message, 401, 'UNAUTHORIZED');
};

export const forbiddenError = (message: string = 'Forbidden'): CustomError => {
  return createError(message, 403, 'FORBIDDEN');
};

export const conflictError = (message: string, details?: any): CustomError => {
  return createError(message, 409, 'CONFLICT', details);
};

export const rateLimitError = (message: string = 'Rate limit exceeded'): CustomError => {
  return createError(message, 429, 'RATE_LIMIT_EXCEEDED');
};