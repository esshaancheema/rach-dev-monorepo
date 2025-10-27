import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';
import { ApiError } from '../types/auth.types';
import { 
  ERROR_CODES, 
  ErrorCode, 
  getErrorMetadata, 
  getHttpStatusForError,
  getLogLevelForError,
  isUserFriendlyError 
} from '../constants/error-codes';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export class AuthError extends Error implements AppError {
  public statusCode: number;
  public code: string;
  public details?: any;

  constructor(message: string, statusCode?: number, code?: ErrorCode, details?: any) {
    super(message);
    this.name = 'AuthError';
    this.code = code || ERROR_CODES.AUTH_UNAUTHORIZED;
    this.statusCode = statusCode || getHttpStatusForError(this.code as ErrorCode);
    this.details = details;
  }
}

export class ValidationError extends Error implements AppError {
  public statusCode: number;
  public code: string;
  public details?: any;

  constructor(message: string, code?: ErrorCode, details?: any) {
    super(message);
    this.name = 'ValidationError';
    this.code = code || ERROR_CODES.VALIDATION_REQUIRED_FIELD;
    this.statusCode = getHttpStatusForError(this.code as ErrorCode);
    this.details = details;
  }
}

export class RateLimitError extends Error implements AppError {
  public statusCode: number;
  public code: string;
  public details?: any;

  constructor(message: string = 'Rate limit exceeded', code?: ErrorCode, details?: any) {
    super(message);
    this.name = 'RateLimitError';
    this.code = code || ERROR_CODES.RATE_LIMIT_EXCEEDED;
    this.statusCode = getHttpStatusForError(this.code as ErrorCode);
    this.details = details;
  }
}

export class DatabaseError extends Error implements AppError {
  public statusCode: number;
  public code: string;
  public details?: any;

  constructor(message: string, code?: ErrorCode, details?: any) {
    super(message);
    this.name = 'DatabaseError';
    this.code = code || ERROR_CODES.DATABASE_CONNECTION_ERROR;
    this.statusCode = getHttpStatusForError(this.code as ErrorCode);
    this.details = details;
  }
}

export class ExternalServiceError extends Error implements AppError {
  public statusCode: number;
  public code: string;
  public details?: any;

  constructor(message: string, code?: ErrorCode, details?: any) {
    super(message);
    this.name = 'ExternalServiceError';
    this.code = code || ERROR_CODES.EXTERNAL_SERVICE_UNAVAILABLE;
    this.statusCode = getHttpStatusForError(this.code as ErrorCode);
    this.details = details;
  }
}

const formatZodError = (error: ZodError): ApiError => {
  const firstError = error.errors[0];
  const field = firstError.path.join('.');
  const message = firstError.message;

  // Map Zod error codes to our standardized error codes
  let errorCode: ErrorCode = ERROR_CODES.VALIDATION_REQUIRED_FIELD;
  
  switch (firstError.code) {
    case 'invalid_type':
      if (firstError.expected === 'string' && firstError.path.includes('email')) {
        errorCode = ERROR_CODES.VALIDATION_INVALID_EMAIL;
      } else if (firstError.path.includes('phone')) {
        errorCode = ERROR_CODES.VALIDATION_INVALID_PHONE;
      } else {
        errorCode = ERROR_CODES.VALIDATION_INVALID_FORMAT;
      }
      break;
    case 'too_small':
      errorCode = ERROR_CODES.VALIDATION_INVALID_LENGTH;
      break;
    case 'too_big':
      errorCode = ERROR_CODES.VALIDATION_INVALID_LENGTH;
      break;
    case 'invalid_string':
      if (firstError.validation === 'email') {
        errorCode = ERROR_CODES.VALIDATION_INVALID_EMAIL;
      } else if (firstError.validation === 'uuid') {
        errorCode = ERROR_CODES.VALIDATION_INVALID_UUID;
      } else {
        errorCode = ERROR_CODES.VALIDATION_INVALID_FORMAT;
      }
      break;
    case 'invalid_enum_value':
      errorCode = ERROR_CODES.VALIDATION_INVALID_ENUM;
      break;
    case 'invalid_date':
      errorCode = ERROR_CODES.VALIDATION_INVALID_DATE;
      break;
    default:
      errorCode = ERROR_CODES.VALIDATION_REQUIRED_FIELD;
  }

  const metadata = getErrorMetadata(errorCode);

  return {
    code: errorCode,
    message: field ? `${field}: ${message}` : message,
    details: {
      field,
      issues: error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message,
        code: err.code,
      })),
      metadata: metadata ? {
        userFriendly: metadata.userFriendly,
        retryable: metadata.retryable,
        severity: metadata.severity
      } : undefined
    },
    timestamp: new Date().toISOString(),
  };
};

const formatAppError = (error: AppError): ApiError => {
  const errorCode = (error.code || ERROR_CODES.SYSTEM_INTERNAL_ERROR) as ErrorCode;
  const metadata = getErrorMetadata(errorCode);
  
  return {
    code: errorCode,
    message: error.message,
    details: {
      ...error.details,
      metadata: metadata ? {
        userFriendly: metadata.userFriendly,
        retryable: metadata.retryable,
        severity: metadata.severity,
        category: metadata.category
      } : undefined
    },
    timestamp: new Date().toISOString(),
  };
};

const formatFastifyError = (error: FastifyError): ApiError => {
  let errorCode: ErrorCode;
  
  // Handle Fastify JWT errors
  if (error.code === 'FST_JWT_NO_AUTHORIZATION_IN_HEADER') {
    errorCode = ERROR_CODES.AUTH_UNAUTHORIZED;
  } else if (error.code === 'FST_JWT_AUTHORIZATION_TOKEN_EXPIRED') {
    errorCode = ERROR_CODES.AUTH_TOKEN_EXPIRED;
  } else if (error.code === 'FST_JWT_AUTHORIZATION_TOKEN_INVALID') {
    errorCode = ERROR_CODES.AUTH_INVALID_TOKEN;
  } else if (error.validation) {
    errorCode = ERROR_CODES.VALIDATION_REQUIRED_FIELD;
  } else if (error.statusCode === 413) {
    errorCode = ERROR_CODES.REQUEST_PAYLOAD_TOO_LARGE;
  } else if (error.statusCode === 415) {
    errorCode = ERROR_CODES.REQUEST_INVALID_CONTENT_TYPE;
  } else if (error.statusCode === 405) {
    errorCode = ERROR_CODES.REQUEST_INVALID_METHOD;
  } else if (error.statusCode === 404) {
    errorCode = ERROR_CODES.API_ENDPOINT_NOT_FOUND;
  } else {
    errorCode = ERROR_CODES.SYSTEM_INTERNAL_ERROR;
  }

  const metadata = getErrorMetadata(errorCode);

  return {
    code: errorCode,
    message: error.message,
    details: {
      validation: error.validation,
      validationContext: error.validationContext,
      statusCode: error.statusCode,
      metadata: metadata ? {
        userFriendly: metadata.userFriendly,
        retryable: metadata.retryable,
        severity: metadata.severity,
        category: metadata.category
      } : undefined
    },
    timestamp: new Date().toISOString(),
  };
};

export const errorHandler = (
  error: Error,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  let statusCode = 500;
  let apiError: ApiError;

  // Log the error with context
  const logContext = {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    request: {
      method: request.method,
      url: request.url,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
      userId: (request as any).user?.userId,
    },
  };

  if (error instanceof ZodError) {
    apiError = formatZodError(error);
    statusCode = 400;
    const logLevel = getLogLevelForError(apiError.code as ErrorCode);
    (logger as any)[logLevel](logContext, 'Validation error');
  } else if (error instanceof AuthError || error instanceof ValidationError || error instanceof RateLimitError) {
    apiError = formatAppError(error as AppError);
    statusCode = (error as AppError).statusCode || getHttpStatusForError(apiError.code as ErrorCode);
    const logLevel = getLogLevelForError(apiError.code as ErrorCode);
    (logger as any)[logLevel](logContext, `Application error: ${error.name}`);
  } else if (error instanceof DatabaseError) {
    apiError = formatAppError(error);
    statusCode = getHttpStatusForError(apiError.code as ErrorCode);
    const logLevel = getLogLevelForError(apiError.code as ErrorCode);
    (logger as any)[logLevel](logContext, 'Database error');
  } else if (error instanceof ExternalServiceError) {
    apiError = formatAppError(error);
    statusCode = getHttpStatusForError(apiError.code as ErrorCode);
    const logLevel = getLogLevelForError(apiError.code as ErrorCode);
    (logger as any)[logLevel](logContext, 'External service error');
  } else if ((error as FastifyError).code) {
    // Handle Fastify-specific errors
    const fastifyError = error as FastifyError;
    apiError = formatFastifyError(fastifyError);
    statusCode = fastifyError.statusCode || getHttpStatusForError(apiError.code as ErrorCode);
    const logLevel = getLogLevelForError(apiError.code as ErrorCode);
    (logger as any)[logLevel](logContext, 'Fastify error');
  } else {
    // Generic error handling
    const errorCode = ERROR_CODES.SYSTEM_INTERNAL_ERROR;
    statusCode = 500;
    apiError = {
      code: errorCode,
      message: process.env.NODE_ENV === 'production' 
        ? 'An internal server error occurred' 
        : error.message,
      details: process.env.NODE_ENV === 'production' 
        ? { metadata: getErrorMetadata(errorCode) }
        : { stack: error.stack, metadata: getErrorMetadata(errorCode) },
      timestamp: new Date().toISOString(),
    };
    logger.error(logContext, 'Unhandled error');
  }

  // Add request ID to error response if available
  if (request.id) {
    apiError.details = {
      ...apiError.details,
      requestId: request.id,
    };
  }

  return reply.status(statusCode).send(apiError);
};

// Specific error creators with standardized error codes
export const createAuthError = (message: string, code?: ErrorCode, details?: any) => {
  return new AuthError(message, undefined, code || ERROR_CODES.AUTH_UNAUTHORIZED, details);
};

export const createInvalidCredentialsError = (details?: any) => {
  return new AuthError('Invalid email or password', undefined, ERROR_CODES.AUTH_INVALID_CREDENTIALS, details);
};

export const createAccountLockedError = (details?: any) => {
  return new AuthError('Account is temporarily locked', undefined, ERROR_CODES.AUTH_ACCOUNT_LOCKED, details);
};

export const createTokenExpiredError = (details?: any) => {
  return new AuthError('Token has expired', undefined, ERROR_CODES.AUTH_TOKEN_EXPIRED, details);
};

export const create2FARequiredError = (details?: any) => {
  return new AuthError('Two-factor authentication required', undefined, ERROR_CODES.AUTH_2FA_REQUIRED, details);
};

export const createForbiddenError = (message: string = 'Forbidden', details?: any) => {
  return new AuthError(message, undefined, ERROR_CODES.AUTH_FORBIDDEN, details);
};

export const createNotFoundError = (message: string = 'Resource not found', details?: any) => {
  return new AuthError(message, undefined, ERROR_CODES.RESOURCE_NOT_FOUND, details);
};

export const createConflictError = (message: string, details?: any) => {
  return new AuthError(message, undefined, ERROR_CODES.RESOURCE_CONFLICT, details);
};

export const createValidationError = (message: string, code?: ErrorCode, details?: any) => {
  return new ValidationError(message, code || ERROR_CODES.VALIDATION_REQUIRED_FIELD, details);
};

export const createEmailValidationError = (details?: any) => {
  return new ValidationError('Invalid email format', ERROR_CODES.VALIDATION_INVALID_EMAIL, details);
};

export const createPasswordValidationError = (details?: any) => {
  return new ValidationError('Password does not meet requirements', ERROR_CODES.VALIDATION_PASSWORD_TOO_WEAK, details);
};

export const createRateLimitError = (message?: string, code?: ErrorCode, details?: any) => {
  return new RateLimitError(message, code || ERROR_CODES.RATE_LIMIT_EXCEEDED, details);
};

export const createLoginRateLimitError = (details?: any) => {
  return new RateLimitError('Too many login attempts', ERROR_CODES.RATE_LIMIT_LOGIN_ATTEMPTS, details);
};

export const createDatabaseError = (message: string, code?: ErrorCode, details?: any) => {
  return new DatabaseError(message, code || ERROR_CODES.DATABASE_CONNECTION_ERROR, details);
};

export const createExternalServiceError = (message: string, code?: ErrorCode, details?: any) => {
  return new ExternalServiceError(message, code || ERROR_CODES.EXTERNAL_SERVICE_UNAVAILABLE, details);
};

export const createEmailServiceError = (details?: any) => {
  return new ExternalServiceError('Email service is currently unavailable', ERROR_CODES.EXTERNAL_EMAIL_SERVICE_ERROR, details);
};

export const createSmsServiceError = (details?: any) => {
  return new ExternalServiceError('SMS service is currently unavailable', ERROR_CODES.EXTERNAL_SMS_SERVICE_ERROR, details);
};