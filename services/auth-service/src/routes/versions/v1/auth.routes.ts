import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { authService } from '../../../services';
import { logger } from '../../../utils/logger';

// V1 Schema definitions (legacy format)
const loginSchemaV1 = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  deviceId: z.string().optional(),
  rememberMe: z.boolean().default(false)
});

const registerSchemaV1 = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional()
});

const passwordResetSchemaV1 = z.object({
  email: z.string().email()
});

const resetPasswordSchemaV1 = z.object({
  token: z.string(),
  newPassword: z.string().min(8)
});

const changePasswordSchemaV1 = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8)
});

export async function authRoutesV1(fastify: FastifyInstance) {
  // V1 Login endpoint - returns legacy format
  fastify.post('/login', {
    schema: {
      summary: 'User login (V1)',
      description: 'Authenticate user and return access token (V1 format)',
      tags: ['Authentication'],
      body: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
          deviceId: { type: 'string' },
          rememberMe: { type: 'boolean', default: false }
        },
        required: ['email', 'password']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                isEmailVerified: { type: 'boolean' },
                status: { type: 'string' }
              }
            },
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
            expiresAt: { type: 'number' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const loginData = loginSchemaV1.parse(request.body);
      const result = await authService.login(loginData);

      // Transform V2 response to V1 format
      const v1Response = {
        success: true,
        user: {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          isEmailVerified: result.user.isEmailVerified,
          status: result.user.status
          // Note: V1 doesn't include role, lastLoginAt, etc.
        },
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresAt: result.expiresAt
      };

      logger.info('V1 login successful', {
        userId: result.user.id,
        email: result.user.email,
        version: 'v1'
      });

      return reply.send(v1Response);
    } catch (error: any) {
      logger.error('V1 login failed:', error);
      return reply.status(400).send({
        success: false,
        error: error.message || 'LOGIN_FAILED',
        message: 'Invalid credentials'
      });
    }
  });

  // V1 Register endpoint - simplified format
  fastify.post('/register', {
    schema: {
      summary: 'User registration (V1)',
      description: 'Register new user account (V1 format)',
      tags: ['Authentication'],
      body: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
          firstName: { type: 'string', minLength: 1 },
          lastName: { type: 'string', minLength: 1 },
          phone: { type: 'string' }
        },
        required: ['email', 'password', 'firstName', 'lastName']
      },
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                firstName: { type: 'string' },
                lastName: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const registerData = registerSchemaV1.parse(request.body);
      const result = await authService.register(registerData);

      const v1Response = {
        success: true,
        message: 'Registration successful. Please check your email for verification.',
        user: {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.firstName,
          lastName: result.user.lastName
        }
      };

      logger.info('V1 registration successful', {
        userId: result.user.id,
        email: result.user.email,
        version: 'v1'
      });

      return reply.status(201).send(v1Response);
    } catch (error: any) {
      logger.error('V1 registration failed:', error);
      return reply.status(400).send({
        success: false,
        error: error.message || 'REGISTRATION_FAILED',
        message: 'Registration failed'
      });
    }
  });

  // V1 Forgot password - simple format
  fastify.post('/forgot-password', {
    schema: {
      summary: 'Forgot password (V1)',
      description: 'Request password reset (V1 format)',
      tags: ['Authentication'],
      body: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' }
        },
        required: ['email']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { email } = passwordResetSchemaV1.parse(request.body);
      await authService.forgotPassword({ email });

      return reply.send({
        success: true,
        message: 'Password reset email sent if account exists'
      });
    } catch (error: any) {
      logger.error('V1 forgot password failed:', error);
      return reply.status(400).send({
        success: false,
        error: error.message || 'FORGOT_PASSWORD_FAILED',
        message: 'Failed to process password reset request'
      });
    }
  });

  // V1 Reset password
  fastify.post('/reset-password', {
    schema: {
      summary: 'Reset password (V1)',
      description: 'Reset user password with token (V1 format)',
      tags: ['Authentication'],
      body: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          newPassword: { type: 'string', minLength: 8 }
        },
        required: ['token', 'newPassword']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const resetData = resetPasswordSchemaV1.parse(request.body);
      await authService.resetPassword(resetData);

      return reply.send({
        success: true,
        message: 'Password reset successfully'
      });
    } catch (error: any) {
      logger.error('V1 password reset failed:', error);
      return reply.status(400).send({
        success: false,
        error: error.message || 'PASSWORD_RESET_FAILED',
        message: 'Failed to reset password'
      });
    }
  });

  // V1 Change password
  fastify.post('/change-password', {
    preHandler: [],
    schema: {
      summary: 'Change password (V1)',
      description: 'Change user password (V1 format)',
      tags: ['Authentication'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        properties: {
          currentPassword: { type: 'string' },
          newPassword: { type: 'string', minLength: 8 }
        },
        required: ['currentPassword', 'newPassword']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      const changeData = changePasswordSchemaV1.parse(request.body);
      
      await authService.changePassword({
        userId: user.id,
        ...changeData
      });

      return reply.send({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error: any) {
      logger.error('V1 password change failed:', error);
      return reply.status(400).send({
        success: false,
        error: error.message || 'PASSWORD_CHANGE_FAILED',
        message: 'Failed to change password'
      });
    }
  });

  // V1 Get current user
  fastify.get('/me', {
    preHandler: [],
    schema: {
      summary: 'Get current user (V1)',
      description: 'Get current authenticated user info (V1 format)',
      tags: ['Authentication'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                isEmailVerified: { type: 'boolean' },
                status: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      
      // V1 format excludes newer fields
      const v1User = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isEmailVerified: user.isEmailVerified,
        status: user.status
      };

      return reply.send({
        success: true,
        user: v1User
      });
    } catch (error: any) {
      logger.error('V1 get user failed:', error);
      return reply.status(500).send({
        success: false,
        error: 'GET_USER_FAILED',
        message: 'Failed to get user information'
      });
    }
  });

  // V1 Logout
  fastify.post('/logout', {
    preHandler: [],
    schema: {
      summary: 'User logout (V1)',
      description: 'Logout user and invalidate tokens (V1 format)',
      tags: ['Authentication'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      await authService.logout({ userId: user.id });

      return reply.send({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error: any) {
      logger.error('V1 logout failed:', error);
      return reply.status(500).send({
        success: false,
        error: 'LOGOUT_FAILED',
        message: 'Failed to logout'
      });
    }
  });

  logger.info('V1 auth routes registered');
}