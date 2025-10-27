import { FastifyRequest, FastifyReply, HookHandlerDoneFunction } from 'fastify';
import { ZodSchema, ZodError } from 'zod';
import { logger } from '../utils/logger';
import { createValidationError } from './error-handler';

export interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
  headers?: ZodSchema;
}

export const validate = (schemas: ValidationSchemas) => {
  return async (
    request: FastifyRequest,
    reply: FastifyReply,
    done: HookHandlerDoneFunction
  ) => {
    try {
      // Validate request body
      if (schemas.body) {
        const result = schemas.body.safeParse(request.body);
        if (!result.success) {
          logger.warn(
            {
              validation: 'body',
              errors: result.error.errors,
              requestBody: request.body,
              url: request.url,
              method: request.method,
            },
            'Request body validation failed'
          );
          throw result.error;
        }
        // Replace request body with validated and transformed data
        request.body = result.data;
      }

      // Validate query parameters
      if (schemas.query) {
        const result = schemas.query.safeParse(request.query);
        if (!result.success) {
          logger.warn(
            {
              validation: 'query',
              errors: result.error.errors,
              requestQuery: request.query,
              url: request.url,
              method: request.method,
            },
            'Query parameters validation failed'
          );
          throw result.error;
        }
        // Replace request query with validated and transformed data
        request.query = result.data;
      }

      // Validate route parameters
      if (schemas.params) {
        const result = schemas.params.safeParse(request.params);
        if (!result.success) {
          logger.warn(
            {
              validation: 'params',
              errors: result.error.errors,
              requestParams: request.params,
              url: request.url,
              method: request.method,
            },
            'Route parameters validation failed'
          );
          throw result.error;
        }
        // Replace request params with validated and transformed data
        request.params = result.data;
      }

      // Validate headers
      if (schemas.headers) {
        const result = schemas.headers.safeParse(request.headers);
        if (!result.success) {
          logger.warn(
            {
              validation: 'headers',
              errors: result.error.errors,
              requestHeaders: request.headers,
              url: request.url,
              method: request.method,
            },
            'Headers validation failed'
          );
          throw result.error;
        }
        // Note: We don't replace headers as they might be needed by other middleware
      }

      done();
    } catch (error) {
      if (error instanceof ZodError) {
        // Let the error handler deal with ZodError formatting
        done(error);
      } else {
        // Handle unexpected validation errors
        logger.error(
          {
            error: error,
            url: request.url,
            method: request.method,
          },
          'Unexpected validation error'
        );
        done(createValidationError('Validation failed due to unexpected error'));
      }
    }
  };
};

// Convenience functions for common validation patterns
export const validateBody = (schema: ZodSchema) => validate({ body: schema });
export const validateQuery = (schema: ZodSchema) => validate({ query: schema });
export const validateParams = (schema: ZodSchema) => validate({ params: schema });
export const validateHeaders = (schema: ZodSchema) => validate({ headers: schema });

// Combined validation function
export const validateRequest = (
  bodySchema?: ZodSchema,
  querySchema?: ZodSchema,
  paramsSchema?: ZodSchema,
  headersSchema?: ZodSchema
) => {
  const schemas: ValidationSchemas = {};
  
  if (bodySchema) schemas.body = bodySchema;
  if (querySchema) schemas.query = querySchema;
  if (paramsSchema) schemas.params = paramsSchema;
  if (headersSchema) schemas.headers = headersSchema;
  
  return validate(schemas);
};

// Type-safe validation wrapper that preserves TypeScript types
export const createValidatedHandler = <
  TBody = unknown,
  TQuery = unknown,
  TParams = unknown,
  THeaders = unknown
>(
  schemas: ValidationSchemas,
  handler: (
    request: FastifyRequest<{
      Body: TBody;
      Querystring: TQuery;
      Params: TParams;
      Headers: THeaders;
    }>,
    reply: FastifyReply
  ) => Promise<any> | any
) => {
  return {
    preHandler: validate(schemas),
    handler,
  };
};

// Sanitization helpers
export const sanitizeInput = (input: any): any => {
  if (typeof input === 'string') {
    // Basic XSS prevention
    return input
      .replace(/[<>]/g, '') // Remove angle brackets
      .trim(); // Remove leading/trailing whitespace
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return input;
};

// Optional sanitization middleware
export const sanitize = () => {
  return async (
    request: FastifyRequest,
    reply: FastifyReply,
    done: HookHandlerDoneFunction
  ) => {
    try {
      if (request.body) {
        request.body = sanitizeInput(request.body);
      }
      
      if (request.query) {
        request.query = sanitizeInput(request.query);
      }
      
      done();
    } catch (error) {
      logger.error(
        {
          error,
          url: request.url,
          method: request.method,
        },
        'Input sanitization failed'
      );
      done(createValidationError('Input sanitization failed'));
    }
  };
};

// Validation with automatic sanitization
export const validateAndSanitize = (schemas: ValidationSchemas) => {
  return [sanitize(), validate(schemas)];
};