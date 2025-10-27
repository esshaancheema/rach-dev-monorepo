import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { authService } from '../../../services';
import { logger } from '../../../utils/logger';

// V2 Schema definitions (enhanced format)
const loginSchemaV2 = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  deviceInfo: z.object({
    deviceId: z.string().optional(),
    deviceName: z.string().optional(),
    deviceType: z.enum(['web', 'mobile', 'desktop']).default('web'),
    userAgent: z.string().optional(),
    ipAddress: z.string().optional()
  }).optional(),
  preferences: z.object({
    rememberMe: z.boolean().default(false),
    stayLoggedIn: z.boolean().default(false)
  }).optional()
});

const registerSchemaV2 = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  profile: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    phone: z.string().optional(),
    timezone: z.string().optional(),
    language: z.string().default('en')
  }),
  preferences: z.object({
    marketing: z.boolean().default(false),
    notifications: z.boolean().default(true),
    twoFactorAuth: z.boolean().default(false)
  }).optional(),
  metadata: z.record(z.any()).optional()
});

const passwordResetSchemaV2 = z.object({
  email: z.string().email(),
  metadata: z.object({
    source: z.string().optional(),
    userAgent: z.string().optional()
  }).optional()
});

const resetPasswordSchemaV2 = z.object({
  token: z.string(),
  newPassword: z.string().min(8),
  deviceInfo: z.object({
    deviceId: z.string().optional(),
    deviceName: z.string().optional(),
    userAgent: z.string().optional()
  }).optional()
});

const changePasswordSchemaV2 = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8),
  options: z.object({
    logoutOtherSessions: z.boolean().default(true),
    sendNotification: z.boolean().default(true)
  }).optional()
});

export async function authRoutesV2(fastify: FastifyInstance) {
  // V2 Login endpoint - enhanced format
  fastify.post('/login', {
    schema: {
      summary: 'User login (V2)',
      description: 'Authenticate user and return access token (V2 enhanced format)',
      tags: ['Authentication'],
      body: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
          deviceInfo: {
            type: 'object',
            properties: {
              deviceId: { type: 'string' },
              deviceName: { type: 'string' },
              deviceType: { type: 'string', enum: ['web', 'mobile', 'desktop'] },
              userAgent: { type: 'string' },
              ipAddress: { type: 'string' }
            }
          },
          preferences: {
            type: 'object',
            properties: {
              rememberMe: { type: 'boolean', default: false },
              stayLoggedIn: { type: 'boolean', default: false }
            }
          }
        },
        required: ['email', 'password']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                user: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    email: { type: 'string' },
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    phone: { type: 'string', nullable: true },
                    isEmailVerified: { type: 'boolean' },
                    isPhoneVerified: { type: 'boolean' },
                    status: { type: 'string' },
                    role: { type: 'string' },
                    lastLoginAt: { type: 'string', nullable: true },
                    preferences: { type: 'object' },
                    metadata: { type: 'object' }
                  }
                },
                tokens: {
                  type: 'object',
                  properties: {
                    accessToken: { type: 'string' },
                    refreshToken: { type: 'string' },
                    tokenType: { type: 'string', default: 'Bearer' },
                    expiresAt: { type: 'number' },
                    expiresIn: { type: 'number' }
                  }
                },
                security: {
                  type: 'object',
                  properties: {
                    requiresTwoFactor: { type: 'boolean' },
                    isNewDevice: { type: 'boolean' },
                    riskLevel: { type: 'string', enum: ['low', 'medium', 'high'] }
                  }
                }
              }
            },
            meta: {
              type: 'object',
              properties: {
                version: { type: 'string' },
                timestamp: { type: 'string' },
                requestId: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const loginData = loginSchemaV2.parse(request.body);
      const result = await authService.login({
        email: loginData.email,
        password: loginData.password,
        deviceId: loginData.deviceInfo?.deviceId,
        rememberMe: loginData.preferences?.rememberMe
      });

      // Enhanced V2 response format
      const v2Response = {
        success: true,
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            firstName: result.user.firstName,
            lastName: result.user.lastName,
            phone: result.user.phone || null,
            isEmailVerified: result.user.isEmailVerified,
            isPhoneVerified: result.user.isPhoneVerified || false,
            status: result.user.status,
            role: result.user.role || 'user',
            lastLoginAt: result.user.lastLoginAt || null,
            preferences: result.user.preferences || {},
            metadata: result.user.metadata || {}
          },
          tokens: {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            tokenType: 'Bearer',
            expiresAt: result.expiresAt,
            expiresIn: Math.floor((result.expiresAt - Date.now()) / 1000)
          },
          security: {
            requiresTwoFactor: result.requiresTwoFactor || false,
            isNewDevice: result.isNewDevice || false,
            riskLevel: result.riskLevel || 'low'
          }
        },
        meta: {
          version: 'v2',
          timestamp: new Date().toISOString(),
          requestId: (request as any).id
        }
      };

      logger.info('V2 login successful', {
        userId: result.user.id,
        email: result.user.email,
        version: 'v2',
        deviceType: loginData.deviceInfo?.deviceType
      });

      return reply.send(v2Response);
    } catch (error: any) {
      logger.error('V2 login failed:', error);
      return reply.status(400).send({
        success: false,
        error: {
          code: error.message || 'LOGIN_FAILED',
          message: 'Authentication failed',
          details: error.details || null
        },
        meta: {
          version: 'v2',
          timestamp: new Date().toISOString(),
          requestId: (request as any).id
        }
      });
    }
  });

  // V2 Register endpoint - enhanced format
  fastify.post('/register', {
    schema: {
      summary: 'User registration (V2)',
      description: 'Register new user account (V2 enhanced format)',
      tags: ['Authentication'],
      body: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
          profile: {
            type: 'object',
            properties: {
              firstName: { type: 'string', minLength: 1 },
              lastName: { type: 'string', minLength: 1 },
              phone: { type: 'string' },
              timezone: { type: 'string' },
              language: { type: 'string', default: 'en' }
            },
            required: ['firstName', 'lastName']
          },
          preferences: {
            type: 'object',
            properties: {
              marketing: { type: 'boolean', default: false },
              notifications: { type: 'boolean', default: true },
              twoFactorAuth: { type: 'boolean', default: false }
            }
          },
          metadata: { type: 'object' }
        },
        required: ['email', 'password', 'profile']
      },
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                user: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    email: { type: 'string' },
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    status: { type: 'string' },
                    createdAt: { type: 'string' }
                  }
                },
                verification: {
                  type: 'object',
                  properties: {
                    emailSent: { type: 'boolean' },
                    phoneSent: { type: 'boolean' },
                    expiresAt: { type: 'string' }
                  }
                }
              }
            },
            meta: {
              type: 'object',
              properties: {
                version: { type: 'string' },
                timestamp: { type: 'string' },
                requestId: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const registerData = registerSchemaV2.parse(request.body);
      const result = await authService.register({
        email: registerData.email,
        password: registerData.password,
        firstName: registerData.profile.firstName,
        lastName: registerData.profile.lastName,
        phone: registerData.profile.phone
      });

      const v2Response = {
        success: true,
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            firstName: result.user.firstName,
            lastName: result.user.lastName,
            status: result.user.status,
            createdAt: result.user.createdAt || new Date().toISOString()
          },
          verification: {
            emailSent: true,
            phoneSent: !!registerData.profile.phone,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          }
        },
        meta: {
          version: 'v2',
          timestamp: new Date().toISOString(),
          requestId: (request as any).id
        }
      };

      logger.info('V2 registration successful', {
        userId: result.user.id,
        email: result.user.email,
        version: 'v2'
      });

      return reply.status(201).send(v2Response);
    } catch (error: any) {
      logger.error('V2 registration failed:', error);
      return reply.status(400).send({
        success: false,
        error: {
          code: error.message || 'REGISTRATION_FAILED',
          message: 'Registration failed',
          details: error.details || null
        },
        meta: {
          version: 'v2',
          timestamp: new Date().toISOString(),
          requestId: (request as any).id
        }
      });
    }
  });

  // V2 Forgot password - enhanced format
  fastify.post('/forgot-password', {
    schema: {
      summary: 'Forgot password (V2)',
      description: 'Request password reset (V2 enhanced format)',
      tags: ['Authentication'],
      body: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          metadata: {
            type: 'object',
            properties: {
              source: { type: 'string' },
              userAgent: { type: 'string' }
            }
          }
        },
        required: ['email']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                requestId: { type: 'string' },
                expiresAt: { type: 'string' },
                deliveryMethods: {
                  type: 'array',
                  items: { type: 'string' }
                }
              }
            },
            meta: {
              type: 'object',
              properties: {
                version: { type: 'string' },
                timestamp: { type: 'string' },
                requestId: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { email, metadata } = passwordResetSchemaV2.parse(request.body);
      const result = await authService.forgotPassword({ email });

      return reply.send({
        success: true,
        data: {
          requestId: result.requestId || 'unknown',
          expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          deliveryMethods: ['email']
        },
        meta: {
          version: 'v2',
          timestamp: new Date().toISOString(),
          requestId: (request as any).id
        }
      });
    } catch (error: any) {
      logger.error('V2 forgot password failed:', error);
      return reply.status(400).send({
        success: false,
        error: {
          code: error.message || 'FORGOT_PASSWORD_FAILED',
          message: 'Failed to process password reset request',
          details: error.details || null
        },
        meta: {
          version: 'v2',
          timestamp: new Date().toISOString(),
          requestId: (request as any).id
        }
      });
    }
  });

  // V2 Reset password - enhanced format
  fastify.post('/reset-password', {
    schema: {
      summary: 'Reset password (V2)',
      description: 'Reset user password with token (V2 enhanced format)',
      tags: ['Authentication'],
      body: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          newPassword: { type: 'string', minLength: 8 },
          deviceInfo: {
            type: 'object',
            properties: {
              deviceId: { type: 'string' },
              deviceName: { type: 'string' },
              userAgent: { type: 'string' }
            }
          }
        },
        required: ['token', 'newPassword']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                userId: { type: 'string' },
                sessionInvalidated: { type: 'boolean' },
                notificationSent: { type: 'boolean' }
              }
            },
            meta: {
              type: 'object',
              properties: {
                version: { type: 'string' },
                timestamp: { type: 'string' },
                requestId: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const resetData = resetPasswordSchemaV2.parse(request.body);
      const result = await authService.resetPassword({
        token: resetData.token,
        newPassword: resetData.newPassword
      });

      return reply.send({
        success: true,
        data: {
          userId: result.userId || 'unknown',
          sessionInvalidated: true,
          notificationSent: true
        },
        meta: {
          version: 'v2',
          timestamp: new Date().toISOString(),
          requestId: (request as any).id
        }
      });
    } catch (error: any) {
      logger.error('V2 password reset failed:', error);
      return reply.status(400).send({
        success: false,
        error: {
          code: error.message || 'PASSWORD_RESET_FAILED',
          message: 'Failed to reset password',
          details: error.details || null
        },
        meta: {
          version: 'v2',
          timestamp: new Date().toISOString(),
          requestId: (request as any).id
        }
      });
    }
  });

  // V2 Get current user - enhanced format
  fastify.get('/me', {
    preHandler: [],
    schema: {
      summary: 'Get current user (V2)',
      description: 'Get current authenticated user info (V2 enhanced format)',
      tags: ['Authentication'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                user: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    email: { type: 'string' },
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    phone: { type: 'string', nullable: true },
                    isEmailVerified: { type: 'boolean' },
                    isPhoneVerified: { type: 'boolean' },
                    status: { type: 'string' },
                    role: { type: 'string' },
                    lastLoginAt: { type: 'string', nullable: true },
                    createdAt: { type: 'string' },
                    updatedAt: { type: 'string' },
                    preferences: { type: 'object' },
                    metadata: { type: 'object' }
                  }
                },
                session: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    deviceId: { type: 'string' },
                    deviceName: { type: 'string' },
                    lastActivity: { type: 'string' },
                    expiresAt: { type: 'string' }
                  }
                }
              }
            },
            meta: {
              type: 'object',
              properties: {
                version: { type: 'string' },
                timestamp: { type: 'string' },
                requestId: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      
      // Enhanced V2 format with session info
      const v2Response = {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone || null,
            isEmailVerified: user.isEmailVerified,
            isPhoneVerified: user.isPhoneVerified || false,
            status: user.status,
            role: user.role || 'user',
            lastLoginAt: user.lastLoginAt || null,
            createdAt: user.createdAt || null,
            updatedAt: user.updatedAt || null,
            preferences: user.preferences || {},
            metadata: user.metadata || {}
          },
          session: {
            id: user.sessionId || 'unknown',
            deviceId: user.deviceId || 'unknown',
            deviceName: user.deviceName || 'Unknown Device',
            lastActivity: new Date().toISOString(),
            expiresAt: user.tokenExpiresAt || null
          }
        },
        meta: {
          version: 'v2',
          timestamp: new Date().toISOString(),
          requestId: (request as any).id
        }
      };

      return reply.send(v2Response);
    } catch (error: any) {
      logger.error('V2 get user failed:', error);
      return reply.status(500).send({
        success: false,
        error: {
          code: 'GET_USER_FAILED',
          message: 'Failed to get user information',
          details: error.details || null
        },
        meta: {
          version: 'v2',
          timestamp: new Date().toISOString(),
          requestId: (request as any).id
        }
      });
    }
  });

  logger.info('V2 auth routes registered');
}