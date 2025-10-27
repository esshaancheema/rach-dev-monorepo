// Export all schemas
export * from './auth.schema';
export * from './user.schema';
export * from './admin.schema';
export * from './common.schema';

// Validation middleware factory
import { z } from 'zod';
import { FastifyRequest, FastifyReply } from 'fastify';

export interface ValidationSchemas {
  body?: z.ZodSchema;
  params?: z.ZodSchema;
  query?: z.ZodSchema;
  headers?: z.ZodSchema;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export class SchemaValidationError extends Error {
  constructor(
    message: string,
    public errors: ValidationError[],
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'SchemaValidationError';
  }
}

/**
 * Create validation middleware for Fastify routes
 */
export function createValidationMiddleware(schemas: ValidationSchemas) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const errors: ValidationError[] = [];

    // Validate body
    if (schemas.body) {
      const bodyResult = schemas.body.safeParse(request.body);
      if (!bodyResult.success) {
        bodyResult.error.errors.forEach(error => {
          errors.push({
            field: `body.${error.path.join('.')}`,
            message: error.message,
            code: error.code,
          });
        });
      }
    }

    // Validate params
    if (schemas.params) {
      const paramsResult = schemas.params.safeParse(request.params);
      if (!paramsResult.success) {
        paramsResult.error.errors.forEach(error => {
          errors.push({
            field: `params.${error.path.join('.')}`,
            message: error.message,
            code: error.code,
          });
        });
      }
    }

    // Validate query
    if (schemas.query) {
      const queryResult = schemas.query.safeParse(request.query);
      if (!queryResult.success) {
        queryResult.error.errors.forEach(error => {
          errors.push({
            field: `query.${error.path.join('.')}`,
            message: error.message,
            code: error.code,
          });
        });
      }
    }

    // Validate headers
    if (schemas.headers) {
      const headersResult = schemas.headers.safeParse(request.headers);
      if (!headersResult.success) {
        headersResult.error.errors.forEach(error => {
          errors.push({
            field: `headers.${error.path.join('.')}`,
            message: error.message,
            code: error.code,
          });
        });
      }
    }

    if (errors.length > 0) {
      throw new SchemaValidationError('Validation failed', errors);
    }
  };
}

/**
 * Validate data against schema and return parsed result
 */
export function validateSchema<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    const errors: ValidationError[] = result.error.errors.map(error => ({
      field: error.path.join('.'),
      message: error.message,
      code: error.code,
    }));
    
    throw new SchemaValidationError('Validation failed', errors);
  }
  
  return result.data;
}

/**
 * Sanitize output data according to schema
 */
export function sanitizeOutput<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    // Log the error but return empty object instead of throwing
    console.error('Output sanitization failed:', error);
    return {} as T;
  }
}

/**
 * Common validation patterns
 */
export const commonValidations = {
  /**
   * Validate that a string is a valid UUID
   */
  isValidUUID: (value: string): boolean => {
    return z.string().uuid().safeParse(value).success;
  },

  /**
   * Validate that a string is a valid email
   */
  isValidEmail: (value: string): boolean => {
    return z.string().email().safeParse(value).success;
  },

  /**
   * Validate that a string is a valid phone number
   */
  isValidPhone: (value: string): boolean => {
    return z.string().regex(/^\+?[1-9]\d{1,14}$/).safeParse(value).success;
  },

  /**
   * Validate that a string meets password requirements
   */
  isValidPassword: (value: string): boolean => {
    return z.string()
      .min(8)
      .regex(/[A-Z]/)
      .regex(/[a-z]/)
      .regex(/\d/)
      .regex(/[!@#$%^&*(),.?":{}|<>]/)
      .safeParse(value).success;
  },

  /**
   * Validate that a string is a valid IP address
   */
  isValidIP: (value: string): boolean => {
    return z.string().ip().safeParse(value).success;
  },

  /**
   * Validate that a value is within allowed enum values
   */
  isValidEnum: <T extends string>(enumValues: readonly T[], value: string): value is T => {
    return enumValues.includes(value as T);
  },
};

/**
 * Schema transformation utilities
 */
export const schemaTransforms = {
  /**
   * Transform string to lowercase
   */
  toLowerCase: z.string().transform(val => val.toLowerCase()),

  /**
   * Transform string to uppercase
   */
  toUpperCase: z.string().transform(val => val.toUpperCase()),

  /**
   * Trim whitespace from string
   */
  trim: z.string().transform(val => val.trim()),

  /**
   * Parse string to number
   */
  toNumber: z.string().transform(val => {
    const num = parseFloat(val);
    if (isNaN(num)) throw new Error('Invalid number');
    return num;
  }),

  /**
   * Parse string to boolean
   */
  toBoolean: z.string().transform(val => {
    const lower = val.toLowerCase();
    if (lower === 'true' || lower === '1') return true;
    if (lower === 'false' || lower === '0') return false;
    throw new Error('Invalid boolean');
  }),

  /**
   * Parse string to date
   */
  toDate: z.string().transform(val => {
    const date = new Date(val);
    if (isNaN(date.getTime())) throw new Error('Invalid date');
    return date;
  }),
};