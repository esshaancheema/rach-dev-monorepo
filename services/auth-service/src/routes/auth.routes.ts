import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import {
  loginSchema,
  registerSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  LoginRequest,
  RegisterRequest,
  VerifyEmailRequest,
  ResendVerificationRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
} from '../schemas/auth.schema';
import { validate } from '../middleware/validate';
import { logger } from '../utils/logger';
import { 
  AuthController,
  createAuthController 
} from '../controllers/auth.controller';
import { 
  createAuthService,
  createEmailService,
  createSmsService,
  createPasswordHistoryService,
  createDeviceFingerprintService,
  tokenService 
} from '../services';

export async function authRoutes(fastify: FastifyInstance) {
  // Initialize services
  const emailService = createEmailService();
  const smsService = createSmsService();
  const passwordHistoryService = createPasswordHistoryService({
    prisma: fastify.prisma,
  });
  const deviceFingerprintService = createDeviceFingerprintService({
    prisma: fastify.prisma,
  });
  const authService = createAuthService({
    prisma: fastify.prisma,
    tokenService,
    emailService,
    smsService,
    passwordHistoryService,
    deviceFingerprintService,
  });

  // Initialize controller
  const authController = createAuthController({
    authService,
    emailService,
    smsService,
    tokenService,
    deviceFingerprintService,
  });
  // Register endpoint
  fastify.post<{ Body: RegisterRequest }>(
    '/register',
    {
      preHandler: validate({ body: registerSchema }),
      schema: {
        tags: ['Authentication'],
        summary: 'Register a new user account',
        response: {
          201: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: {
                type: 'object',
                properties: {
                  userId: { type: 'string' },
                  email: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    authController.register.bind(authController)
  );

  // Login endpoint
  fastify.post<{ Body: LoginRequest }>(
    '/login',
    {
      preHandler: validate({ body: loginSchema }),
      schema: {
        tags: ['Authentication'],
        summary: 'Login with email and password',
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                // AuthResponse schema would go here
              },
            },
          },
        },
      },
    },
    authController.login.bind(authController)
  );

  // Verify email endpoint
  fastify.post<{ Body: VerifyEmailRequest }>(
    '/verify-email',
    {
      preHandler: validate({ body: verifyEmailSchema }),
      schema: {
        tags: ['Authentication'],
        summary: 'Verify email address',
      },
    },
    authController.verifyEmail.bind(authController)
  );

  // Phone verification endpoint
  fastify.post<{ Body: { token: string } }>(
    '/verify-phone',
    {
      schema: {
        tags: ['Authentication'],
        summary: 'Verify phone number',
        body: {
          type: 'object',
          required: ['token'],
          properties: {
            token: { type: 'string', minLength: 6, maxLength: 6 },
          },
        },
      },
    },
    authController.verifyPhone.bind(authController)
  );

  // Resend email verification endpoint
  fastify.post<{ Body: ResendVerificationRequest }>(
    '/resend-email-verification',
    {
      preHandler: validate({ body: resendVerificationSchema }),
      schema: {
        tags: ['Authentication'],
        summary: 'Resend email verification',
      },
    },
    authController.resendEmailVerification.bind(authController)
  );

  // Resend phone verification endpoint
  fastify.post<{ Body: ResendVerificationRequest }>(
    '/resend-phone-verification',
    {
      preHandler: validate({ body: resendVerificationSchema }),
      schema: {
        tags: ['Authentication'],
        summary: 'Resend phone verification',
      },
    },
    authController.resendPhoneVerification.bind(authController)
  );

  // Forgot password endpoint
  fastify.post<{ Body: ForgotPasswordRequest }>(
    '/forgot-password',
    {
      preHandler: validate({ body: forgotPasswordSchema }),
      schema: {
        tags: ['Authentication'],
        summary: 'Request password reset',
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    authController.forgotPassword.bind(authController)
  );

  // Reset password endpoint
  fastify.post<{ Body: ResetPasswordRequest }>(
    '/reset-password',
    {
      preHandler: validate({ body: resetPasswordSchema }),
      schema: {
        tags: ['Authentication'],
        summary: 'Reset password with token',
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    authController.resetPassword.bind(authController)
  );

  // Change password endpoint (for authenticated users) - TEMPORARILY DISABLED
  /*
  fastify.post<{ Body: ChangePasswordRequest }>(
    '/change-password',
    {
      preHandler: [validate({ body: changePasswordSchema })],
      schema: {
        tags: ['Authentication'],
        summary: 'Change password for authenticated user',
        security: [{ bearerAuth: [] }],
        body: changePasswordSchema,
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    authController.changePassword.bind(authController)
  );
  */

  // Get current user profile
  fastify.get(
    '/me',
    {
      preHandler: [],
      schema: {
        tags: ['Authentication'],
        summary: 'Get current user profile',
        security: [{ bearerAuth: [] }],
      },
    },
    authController.getProfile.bind(authController)
  );

  // Refresh token endpoint
  fastify.post(
    '/refresh',
    {
      schema: {
        tags: ['Authentication'],
        summary: 'Refresh access token',
        description: 'Exchange a valid refresh token for a new access token',
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  accessToken: { type: 'string' },
                  expiresIn: { type: 'number' },
                  tokenType: { type: 'string' },
                },
              },
            },
          },
          401: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    authController.refreshToken.bind(authController)
  );

  // Logout endpoint
  fastify.post<{ Body: { allDevices?: boolean } }>(
    '/logout',
    {
      preHandler: [],
      schema: {
        tags: ['Authentication'],
        summary: 'Logout user',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          properties: {
            allDevices: { type: 'boolean' },
          },
        },
      },
    },
    authController.logout.bind(authController)
  );
}