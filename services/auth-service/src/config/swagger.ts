import { SwaggerOptions } from '@fastify/swagger';
import { FastifySwaggerUiOptions } from '@fastify/swagger-ui';
import { config } from './index';

export const swaggerConfig: SwaggerOptions = {
  openapi: {
    openapi: '3.0.0',
    info: {
      title: 'Zoptal Authentication Service API',
      description: `
# Zoptal Authentication Service

A robust, production-ready authentication microservice built with Fastify, TypeScript, and modern security practices.

## Features

- **Complete Authentication Flow**: Registration, login, password reset, email verification
- **Advanced Security**: Two-factor authentication, rate limiting, device fingerprinting
- **OAuth Integration**: Google and GitHub OAuth support
- **Admin Management**: User administration, audit logs, security monitoring
- **High Performance**: Connection pooling, caching, real-time metrics
- **API Versioning**: Support for multiple API versions (v1, v2) with backward compatibility

## API Versioning

This API supports multiple versions to ensure backward compatibility:

- **v1**: Legacy version with basic functionality
- **v2**: Enhanced version with improved features and response formats

### Version Specification

You can specify the API version in three ways:

1. **URL Path** (recommended): \`/api/v1/auth/login\` or \`/api/v2/auth/login\`
2. **Header**: \`Accept-Version: v2\`
3. **Query Parameter**: \`?version=v2\`

If no version is specified, the API defaults to v1 for backward compatibility.

## Authentication

Most endpoints require a valid JWT token in the Authorization header:
\`\`\`
Authorization: Bearer <your-access-token>
\`\`\`

Admin endpoints require a user with 'admin' or 'super_admin' role.

## Rate Limiting

API requests are rate limited:
- Global: ${config.RATE_LIMIT_MAX_REQUESTS} requests per ${config.RATE_LIMIT_WINDOW}
- Login: ${config.RATE_LIMIT_LOGIN_MAX} attempts per ${config.RATE_LIMIT_LOGIN_WINDOW}
- Registration: ${config.RATE_LIMIT_REGISTER_MAX} attempts per ${config.RATE_LIMIT_REGISTER_WINDOW}

## Error Responses

All endpoints return structured error responses:
\`\`\`json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human readable error message",
  "details": "Additional error context"
}
\`\`\`

## Support

For API support, contact: support@zoptal.com
      `,
      version: '1.0.0',
      contact: {
        name: 'Zoptal Development Team',
        email: 'dev@zoptal.com',
        url: 'https://zoptal.com'
      },
      license: {
        name: 'Proprietary',
      },
    },
    servers: [
      {
        url: config.API_URL,
        description: 'Development server'
      },
      {
        url: 'https://api.zoptal.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from login endpoint'
        },
        adminAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token with admin privileges'
        }
      },
      schemas: {
        // Common response schemas
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operation completed successfully' },
            data: { type: 'object', description: 'Response data' }
          },
          required: ['success']
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'VALIDATION_ERROR' },
            message: { type: 'string', example: 'Invalid input data' },
            details: { type: 'string', example: 'Email format is invalid' }
          },
          required: ['success', 'error', 'message']
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            total: { type: 'number', example: 100 },
            totalPages: { type: 'number', example: 10 },
            hasNext: { type: 'boolean', example: true },
            hasPrev: { type: 'boolean', example: false }
          },
          required: ['page', 'limit', 'total', 'totalPages', 'hasNext', 'hasPrev']
        },
        
        // User schemas
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' },
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            phone: { type: 'string', format: 'phone', example: '+1234567890', nullable: true },
            isEmailVerified: { type: 'boolean', example: true },
            isPhoneVerified: { type: 'boolean', example: false },
            status: { 
              type: 'string', 
              enum: ['pending', 'active', 'suspended', 'deleted'],
              example: 'active'
            },
            role: { 
              type: 'string', 
              enum: ['user', 'admin', 'super_admin'],
              example: 'user'
            },
            lastLoginAt: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          },
          required: ['id', 'email', 'firstName', 'lastName', 'isEmailVerified', 'isPhoneVerified', 'status', 'role', 'createdAt', 'updatedAt']
        },
        
        // Authentication schemas
        LoginRequest: {
          type: 'object',
          properties: {
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            password: { type: 'string', minLength: 8, example: 'SecurePass123!' },
            deviceId: { type: 'string', description: 'Optional device identifier' },
            rememberMe: { type: 'boolean', default: false }
          },
          required: ['email', 'password']
        },
        RegisterRequest: {
          type: 'object',
          properties: {
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            password: { type: 'string', minLength: 8, example: 'SecurePass123!' },
            firstName: { type: 'string', minLength: 1, example: 'John' },
            lastName: { type: 'string', minLength: 1, example: 'Doe' },
            phone: { type: 'string', format: 'phone', example: '+1234567890' }
          },
          required: ['email', 'password', 'firstName', 'lastName', 'phone']
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                user: { $ref: '#/components/schemas/User' },
                accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                expiresAt: { type: 'number', example: 1672531200000 },
                requiresTwoFactor: { type: 'boolean', example: false }
              },
              required: ['user', 'accessToken', 'refreshToken', 'expiresAt']
            }
          },
          required: ['success', 'data']
        },
        
        // Two-Factor Authentication schemas
        TwoFactorSetupResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                secret: { type: 'string', example: 'JBSWY3DPEHPK3PXP' },
                qrCode: { type: 'string', example: 'data:image/png;base64,iVBORw0KGgo...' },
                backupCodes: { 
                  type: 'array', 
                  items: { type: 'string' },
                  example: ['12345678', '87654321']
                }
              },
              required: ['secret', 'qrCode', 'backupCodes']
            }
          },
          required: ['success', 'data']
        },
        
        // Device and Session schemas
        Device: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'device_123' },
            name: { type: 'string', example: 'Chrome on MacOS' },
            type: { type: 'string', enum: ['web', 'mobile', 'desktop'], example: 'web' },
            trusted: { type: 'boolean', example: false },
            lastUsedAt: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' }
          },
          required: ['id', 'trusted', 'lastUsedAt', 'createdAt']
        },
        
        // Health and System schemas
        HealthResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'healthy' },
            timestamp: { type: 'string', format: 'date-time' },
            uptime: { type: 'number', example: 1234567 },
            version: { type: 'string', example: '1.0.0' }
          },
          required: ['status', 'timestamp', 'uptime', 'version']
        },
        ReadinessResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'ready' },
            timestamp: { type: 'string', format: 'date-time' },
            services: {
              type: 'object',
              properties: {
                database: { type: 'string', example: 'healthy' },
                redis: { type: 'string', example: 'healthy' }
              },
              required: ['database', 'redis']
            },
            connectionPool: {
              type: 'object',
              properties: {
                poolSize: { type: 'number', example: 10 },
                activeConnections: { type: 'number', example: 3 },
                totalQueries: { type: 'number', example: 1250 },
                averageQueryTime: { type: 'number', example: 45.2 },
                slowQueries: { type: 'number', example: 2 },
                healthStatus: { type: 'string', example: 'healthy' }
              },
              required: ['poolSize', 'activeConnections', 'totalQueries', 'averageQueryTime', 'slowQueries', 'healthStatus']
            }
          },
          required: ['status', 'timestamp', 'services', 'connectionPool']
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and session management'
      },
      {
        name: 'Two-Factor Authentication',
        description: 'TOTP-based two-factor authentication setup and verification'
      },
      {
        name: 'OAuth',
        description: 'OAuth integration with Google and GitHub'
      },
      {
        name: 'User Management',
        description: 'User profile and account management'
      },
      {
        name: 'Admin - User Management',
        description: 'Administrative user management operations'
      },
      {
        name: 'Admin - Dashboard',
        description: 'Administrative dashboard and statistics'
      },
      {
        name: 'Admin - Audit',
        description: 'Audit logs and security monitoring'
      },
      {
        name: 'Admin - Security',
        description: 'Security events and device management'
      },
      {
        name: 'Admin - System Management',
        description: 'System administration and maintenance'
      },
      {
        name: 'Admin - Device Management',
        description: 'Device fingerprinting and management'
      },
      {
        name: 'Admin - Data Export',
        description: 'Data export and GDPR compliance'
      },
      {
        name: 'System',
        description: 'Health checks and system status'
      },
      {
        name: 'Metrics',
        description: 'Performance metrics and monitoring'
      }
    ]
  },
  hideUntagged: true,
  exposeRoute: true,
};

export const swaggerUiConfig: FastifySwaggerUiOptions = {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: true,
    defaultModelsExpandDepth: 2,
    defaultModelExpandDepth: 2,
    displayOperationId: false,
    displayRequestDuration: true,
    filter: true,
    showExtensions: false,
    showCommonExtensions: false,
    tryItOutEnabled: true,
    validatorUrl: null,
  },
  uiHooks: {
    onRequest: function (request, reply, next) {
      // Add any custom logic for docs access control
      next();
    },
    preHandler: function (request, reply, next) {
      // Add any pre-processing logic
      next();
    },
  },
  staticCSP: true,
  transformStaticCSP: (header) => header,
  transformSpecification: (swaggerObject, request, reply) => {
    // Add any dynamic modifications to the specification
    return swaggerObject;
  },
  transformSpecificationClone: true,
};