/**
 * OpenAPI schema definitions for Swagger documentation
 * These schemas are used to generate comprehensive API documentation
 */

export const swaggerSchemas = {
  // Common response schemas
  successResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Operation completed successfully' },
      data: { type: 'object', description: 'Response data' }
    },
    required: ['success']
  },

  errorResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false },
      error: { type: 'string', example: 'VALIDATION_ERROR' },
      message: { type: 'string', example: 'Invalid input data' },
      details: { type: 'string', example: 'Email format is invalid' }
    },
    required: ['success', 'error', 'message']
  },

  // Authentication request schemas
  loginRequest: {
    type: 'object',
    properties: {
      email: { 
        type: 'string', 
        format: 'email', 
        example: 'user@example.com',
        description: 'User email address'
      },
      password: { 
        type: 'string', 
        minLength: 8, 
        example: 'SecurePass123!',
        description: 'User password (minimum 8 characters)'
      },
      deviceId: { 
        type: 'string', 
        example: 'device_abc123',
        description: 'Optional device identifier for session tracking'
      },
      rememberMe: { 
        type: 'boolean', 
        default: false,
        description: 'Whether to extend session duration'
      }
    },
    required: ['email', 'password']
  },

  registerRequest: {
    type: 'object',
    properties: {
      email: { 
        type: 'string', 
        format: 'email', 
        example: 'user@example.com',
        description: 'User email address'
      },
      password: { 
        type: 'string', 
        minLength: 8, 
        example: 'SecurePass123!',
        description: 'User password (minimum 8 characters with complexity requirements)'
      },
      firstName: { 
        type: 'string', 
        minLength: 1, 
        example: 'John',
        description: 'User first name'
      },
      lastName: { 
        type: 'string', 
        minLength: 1, 
        example: 'Doe',
        description: 'User last name'
      },
      phone: { 
        type: 'string', 
        format: 'phone', 
        example: '+1234567890',
        description: 'User phone number in E.164 format'
      }
    },
    required: ['email', 'password', 'firstName', 'lastName', 'phone']
  },

  // Authentication response schemas
  userObject: {
    type: 'object',
    properties: {
      id: { 
        type: 'string', 
        format: 'uuid', 
        example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        description: 'Unique user identifier'
      },
      email: { 
        type: 'string', 
        format: 'email', 
        example: 'user@example.com',
        description: 'User email address'
      },
      firstName: { 
        type: 'string', 
        example: 'John',
        description: 'User first name'
      },
      lastName: { 
        type: 'string', 
        example: 'Doe',
        description: 'User last name'
      },
      phone: { 
        type: 'string', 
        format: 'phone', 
        example: '+1234567890', 
        nullable: true,
        description: 'User phone number'
      },
      isEmailVerified: { 
        type: 'boolean', 
        example: true,
        description: 'Whether user email is verified'
      },
      isPhoneVerified: { 
        type: 'boolean', 
        example: false,
        description: 'Whether user phone is verified'
      },
      status: { 
        type: 'string', 
        enum: ['pending', 'active', 'suspended', 'deleted'],
        example: 'active',
        description: 'User account status'
      },
      role: { 
        type: 'string', 
        enum: ['user', 'admin', 'super_admin'],
        example: 'user',
        description: 'User role and permissions level'
      },
      lastLoginAt: { 
        type: 'string', 
        format: 'date-time', 
        nullable: true,
        example: '2024-01-01T12:00:00Z',
        description: 'Last login timestamp'
      },
      createdAt: { 
        type: 'string', 
        format: 'date-time',
        example: '2024-01-01T00:00:00Z',
        description: 'Account creation timestamp'
      },
      updatedAt: { 
        type: 'string', 
        format: 'date-time',
        example: '2024-01-01T12:00:00Z',
        description: 'Last account update timestamp'
      }
    },
    required: ['id', 'email', 'firstName', 'lastName', 'isEmailVerified', 'isPhoneVerified', 'status', 'role', 'createdAt', 'updatedAt']
  },

  authResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Authentication successful' },
      data: {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/User' },
          accessToken: { 
            type: 'string', 
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            description: 'JWT access token (expires in 15 minutes)'
          },
          refreshToken: { 
            type: 'string', 
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            description: 'JWT refresh token (expires in 7 days)'
          },
          expiresAt: { 
            type: 'number', 
            example: 1672531200000,
            description: 'Access token expiration timestamp (Unix milliseconds)'
          },
          requiresTwoFactor: { 
            type: 'boolean', 
            example: false,
            description: 'Whether two-factor authentication is required'
          }
        },
        required: ['user', 'accessToken', 'refreshToken', 'expiresAt']
      }
    },
    required: ['success', 'data']
  },

  // Rate limiting and security responses
  rateLimitError: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false },
      error: { type: 'string', example: 'RATE_LIMIT_EXCEEDED' },
      message: { type: 'string', example: 'Too many requests. Try again in 60 seconds.' },
      retryAfter: { type: 'number', example: 60, description: 'Seconds until next request allowed' }
    },
    required: ['success', 'error', 'message', 'retryAfter']
  },

  validationError: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false },
      error: { type: 'string', example: 'VALIDATION_ERROR' },
      message: { type: 'string', example: 'Invalid input data' },
      details: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            field: { type: 'string', example: 'email' },
            message: { type: 'string', example: 'Invalid email format' }
          }
        }
      }
    },
    required: ['success', 'error', 'message']
  }
};

/**
 * Helper function to create standardized OpenAPI route schemas
 */
export function createRouteSchema(options: {
  summary: string;
  description?: string;
  tags: string[];
  body?: any;
  querystring?: any;
  params?: any;
  response?: { [statusCode: string]: any };
  security?: Array<{ [securityName: string]: string[] }>;
}) {
  const schema: any = {
    summary: options.summary,
    description: options.description || options.summary,
    tags: options.tags,
  };

  if (options.body) {
    schema.body = options.body;
  }

  if (options.querystring) {
    schema.querystring = options.querystring;
  }

  if (options.params) {
    schema.params = options.params;
  }

  if (options.response) {
    schema.response = options.response;
  }

  if (options.security) {
    schema.security = options.security;
  }

  return schema;
}

/**
 * Standard security schemes for different endpoint types
 */
export const securitySchemes = {
  bearer: [{ bearerAuth: [] }],
  admin: [{ adminAuth: [] }],
  none: []
};

/**
 * Common response schemas for different HTTP status codes
 */
export const standardResponses = {
  200: {
    description: 'Success',
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      data: { type: 'object' }
    }
  },
  400: {
    description: 'Bad Request - Validation Error',
    content: {
      'application/json': {
        schema: swaggerSchemas.validationError
      }
    }
  },
  401: {
    description: 'Unauthorized - Invalid or missing authentication',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'UNAUTHORIZED' },
            message: { type: 'string', example: 'Invalid or missing authentication token' }
          }
        }
      }
    }
  },
  403: {
    description: 'Forbidden - Insufficient permissions',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'FORBIDDEN' },
            message: { type: 'string', example: 'Insufficient permissions for this operation' }
          }
        }
      }
    }
  },
  429: {
    description: 'Too Many Requests - Rate limit exceeded',
    content: {
      'application/json': {
        schema: swaggerSchemas.rateLimitError
      }
    }
  },
  500: {
    description: 'Internal Server Error',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'INTERNAL_ERROR' },
            message: { type: 'string', example: 'An unexpected error occurred' }
          }
        }
      }
    }
  }
};