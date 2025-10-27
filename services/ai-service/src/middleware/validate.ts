import { FastifyRequest, FastifyReply } from 'fastify';
import { ZodSchema, ZodError } from 'zod';
import { logger } from '../utils/logger';

export function validateRequest(schema: ZodSchema) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Validate the request against the schema
      schema.parse({
        body: request.body,
        query: request.query,
        params: request.params,
        headers: request.headers,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        logger.warn({
          errors: validationErrors,
          userId: (request as any).user?.id,
          route: request.routerPath,
        }, 'Request validation failed');

        return reply.code(400).send({
          success: false,
          error: 'Validation failed',
          details: validationErrors,
        });
      }

      logger.error({ error }, 'Unexpected validation error');
      
      return reply.code(500).send({
        success: false,
        error: 'Internal validation error',
      });
    }
  };
}

export function validateBody<T>(schema: ZodSchema<T>) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const validatedBody = schema.parse(request.body);
      (request as any).validatedBody = validatedBody;
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        return reply.code(400).send({
          success: false,
          error: 'Body validation failed',
          details: validationErrors,
        });
      }

      return reply.code(500).send({
        success: false,
        error: 'Internal validation error',
      });
    }
  };
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const validatedQuery = schema.parse(request.query);
      (request as any).validatedQuery = validatedQuery;
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        return reply.code(400).send({
          success: false,
          error: 'Query validation failed',
          details: validationErrors,
        });
      }

      return reply.code(500).send({
        success: false,
        error: 'Internal validation error',
      });
    }
  };
}

export function validateParams<T>(schema: ZodSchema<T>) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const validatedParams = schema.parse(request.params);
      (request as any).validatedParams = validatedParams;
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        return reply.code(400).send({
          success: false,
          error: 'Parameter validation failed',
          details: validationErrors,
        });
      }

      return reply.code(500).send({
        success: false,
        error: 'Internal validation error',
      });
    }
  };
}

// Type extensions for TypeScript
declare module 'fastify' {
  interface FastifyRequest {
    validatedBody?: any;
    validatedQuery?: any;
    validatedParams?: any;
  }
}