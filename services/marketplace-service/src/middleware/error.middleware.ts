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
    ip: req.ip,
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

  // Marketplace-specific errors
  if (error.message === 'Integration not found') {
    statusCode = 404;
    code = 'INTEGRATION_NOT_FOUND';
  }

  if (error.message === 'Developer not found') {
    statusCode = 404;
    code = 'DEVELOPER_NOT_FOUND';
  }

  if (error.message === 'Installation not found') {
    statusCode = 404;
    code = 'INSTALLATION_NOT_FOUND';
  }

  if (error.message.includes('already exists')) {
    statusCode = 409;
    code = 'RESOURCE_EXISTS';
  }

  if (error.message.includes('already installed')) {
    statusCode = 409;
    code = 'ALREADY_INSTALLED';
  }

  if (error.message.includes('not installed')) {
    statusCode = 404;
    code = 'NOT_INSTALLED';
  }

  if (error.message.includes('Unauthorized')) {
    statusCode = 403;
    code = 'INSUFFICIENT_PERMISSIONS';
  }

  if (error.message.includes('Maximum number')) {
    statusCode = 429;
    code = 'LIMIT_EXCEEDED';
  }

  if (error.message.includes('Package validation failed')) {
    statusCode = 400;
    code = 'PACKAGE_VALIDATION_FAILED';
  }

  if (error.message.includes('Security scan failed')) {
    statusCode = 400;
    code = 'SECURITY_SCAN_FAILED';
  }

  if (error.message.includes('not approved')) {
    statusCode = 400;
    code = 'APPROVAL_REQUIRED';
  }

  if (error.message.includes('not published')) {
    statusCode = 400;
    code = 'NOT_PUBLISHED';
  }

  // File upload errors
  if (error.message.includes('File size exceeds')) {
    statusCode = 413;
    code = 'FILE_TOO_LARGE';
  }

  if (error.message.includes('Invalid file type')) {
    statusCode = 400;
    code = 'INVALID_FILE_TYPE';
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