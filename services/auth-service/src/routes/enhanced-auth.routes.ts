import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { loginSchema, registerSchema } from '../schemas/auth.schema';
import { validate } from '../middleware/validate';
import { logger } from '../utils/logger';
import { 
  createRouteSchema, 
  swaggerSchemas, 
  securitySchemes, 
  standardResponses 
} from '../utils/swagger-schemas';

/**
 * Enhanced authentication routes with comprehensive OpenAPI documentation
 */
export async function enhancedAuthRoutes(fastify: FastifyInstance) {
  
  /**
   * User Registration
   */
  fastify.post('/register', {
    preHandler: validate({ body: registerSchema }),
    schema: createRouteSchema({
      summary: 'Register a new user account',
      description: `
Register a new user account with email verification.

**Security Features:**
- Password complexity validation
- Email format validation
- Phone number format validation
- Rate limiting: 3 attempts per hour
- Automatic email verification sent

**Response Details:**
- Returns user object and authentication tokens
- Email verification required for full access
- Session created with device tracking
      `,
      tags: ['Authentication'],
      body: swaggerSchemas.registerRequest,
      response: {
        201: {
          description: 'User registered successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Registration successful. Please verify your email.' },
            data: {
              type: 'object',
              properties: {
                user: swaggerSchemas.userObject,
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
                  description: 'Access token expiration timestamp'
                }
              },
              required: ['user', 'accessToken', 'refreshToken', 'expiresAt']
            }
          },
          required: ['success', 'message', 'data']
        },
        400: standardResponses[400],
        409: {
          description: 'Conflict - Email already exists',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'EMAIL_EXISTS' },
            message: { type: 'string', example: 'An account with this email already exists' }
          }
        },
        429: standardResponses[429],
        500: standardResponses[500]
      },
      security: securitySchemes.none
    })
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { email, password, firstName, lastName, phone } = request.body as any;
      
      logger.info({ email, firstName, lastName }, 'User registration attempt');
      
      // TODO: Implement registration logic using authService
      // This is a placeholder implementation
      const result = {
        user: {
          id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
          email,
          firstName,
          lastName,
          phone,
          isEmailVerified: false,
          isPhoneVerified: false,
          status: 'pending',
          role: 'user',
          lastLoginAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        expiresAt: Date.now() + 15 * 60 * 1000 // 15 minutes
      };
      
      reply.status(201).send({
        success: true,
        message: 'Registration successful. Please verify your email.',
        data: result
      });
    } catch (error) {
      logger.error({ error }, 'Registration failed');
      throw error;
    }
  });

  /**
   * User Login
   */
  fastify.post('/login', {
    preHandler: validate({ body: loginSchema }),
    schema: createRouteSchema({
      summary: 'Authenticate user login',
      description: `
Authenticate user credentials and create a new session.

**Security Features:**
- Rate limiting: 5 attempts per 15 minutes
- Account lockout after failed attempts
- Device fingerprinting for security
- Session management with device tracking
- Two-factor authentication support

**Login Flow:**
1. Validate email and password
2. Check for two-factor authentication requirement
3. Create session with device tracking
4. Return authentication tokens

**Response Variations:**
- Standard login: Returns tokens immediately
- 2FA required: Returns requiresTwoFactor=true, complete with /api/2fa/verify
      `,
      tags: ['Authentication'],
      body: swaggerSchemas.loginRequest,
      response: {
        200: {
          description: 'Login successful',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Login successful' },
            data: {
              type: 'object',
              properties: {
                user: swaggerSchemas.userObject,
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
                  description: 'Access token expiration timestamp'
                },
                requiresTwoFactor: { 
                  type: 'boolean', 
                  example: false,
                  description: 'Whether two-factor authentication is required to complete login'
                }
              },
              required: ['user', 'accessToken', 'refreshToken', 'expiresAt', 'requiresTwoFactor']
            }
          },
          required: ['success', 'message', 'data']
        },
        400: standardResponses[400],
        401: {
          description: 'Authentication failed',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'INVALID_CREDENTIALS' },
            message: { type: 'string', example: 'Invalid email or password' },
            attemptsRemaining: { type: 'number', example: 4, description: 'Login attempts remaining before lockout' }
          }
        },
        423: {
          description: 'Account locked due to too many failed attempts',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'ACCOUNT_LOCKED' },
            message: { type: 'string', example: 'Account locked due to too many failed login attempts' },
            unlockAt: { type: 'string', format: 'date-time', description: 'When the account will be unlocked' }
          }
        },
        429: standardResponses[429],
        500: standardResponses[500]
      },
      security: securitySchemes.none
    })
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { email, password, deviceId, rememberMe } = request.body as any;
      
      logger.info({ email, deviceId, rememberMe }, 'User login attempt');
      
      // TODO: Implement login logic using authService
      // This is a placeholder implementation
      const result = {
        user: {
          id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
          email,
          firstName: 'John',
          lastName: 'Doe',
          phone: '+1234567890',
          isEmailVerified: true,
          isPhoneVerified: false,
          status: 'active',
          role: 'user',
          lastLoginAt: new Date().toISOString(),
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: new Date().toISOString()
        },
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
        requiresTwoFactor: false
      };
      
      reply.send({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      logger.error({ error }, 'Login failed');
      throw error;
    }
  });

  /**
   * Get Current User Info
   */
  fastify.get('/me', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'Get current authenticated user information',
      description: `
Retrieve detailed information about the currently authenticated user.

**Required Authentication:**
- Valid JWT token in Authorization header
- Token must not be expired or revoked

**Returns:**
- Complete user profile information
- Account status and verification state
- Role and permissions level
- Last activity timestamps
      `,
      tags: ['Authentication'],
      response: {
        200: {
          description: 'User information retrieved successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                user: swaggerSchemas.userObject
              },
              required: ['user']
            }
          },
          required: ['success', 'data']
        },
        401: standardResponses[401],
        500: standardResponses[500]
      },
      security: securitySchemes.bearer
    })
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.id;
      
      logger.info({ userId }, 'Get current user info request');
      
      // TODO: Implement get user logic using authService
      // This is a placeholder implementation
      const user = {
        id: userId,
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
        isEmailVerified: true,
        isPhoneVerified: false,
        status: 'active',
        role: 'user',
        lastLoginAt: new Date().toISOString(),
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: new Date().toISOString()
      };
      
      reply.send({
        success: true,
        data: { user }
      });
    } catch (error) {
      logger.error({ error }, 'Get current user failed');
      throw error;
    }
  });
}