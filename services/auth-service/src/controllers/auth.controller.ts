import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService, EmailService, SmsService, TokenService, DeviceFingerprintService } from '../services';
import { 
  RegisterRequest,
  LoginRequest,
  VerifyEmailRequest,
  ResendVerificationRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
} from '../schemas/auth.schema';
import { 
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from '../schemas/auth.schema';
import { 
  createValidationMiddleware,
  validateSchema,
} from '../schemas';
import { PasswordUtils } from '../utils/password';
import { logger } from '../utils/logger';
import { 
  trackFailedLogin,
  clearFailedLoginAttempts,
} from '../middleware/rate-limit';
import { createDeviceFingerprint } from '../utils/device-parser';

export interface AuthControllerDependencies {
  authService: AuthService;
  emailService: EmailService;
  smsService: SmsService;
  tokenService: TokenService;
  deviceFingerprintService: DeviceFingerprintService;
}

export class AuthController {
  constructor(private deps: AuthControllerDependencies) {}

  /**
   * User registration endpoint
   */
  async register(
    request: FastifyRequest<{ Body: RegisterRequest }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      // Validate request body
      const validatedData = validateSchema(registerSchema, request.body);

      // Get client information
      const clientInfo = {
        ip: this.getClientIp(request),
        userAgent: request.headers['user-agent'] || 'Unknown',
      };

      // Register user
      const result = await this.deps.authService.register(validatedData, clientInfo);

      reply.status(201).send({
        success: true,
        message: result.message,
        data: {
          user: result.user,
          emailVerificationSent: result.emailVerificationSent,
          phoneVerificationSent: result.phoneVerificationSent,
        },
      });
    } catch (error) {
      this.handleError(error, reply, 'Registration failed');
    }
  }

  /**
   * User login endpoint
   */
  async login(
    request: FastifyRequest<{ Body: LoginRequest }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      // Validate request body
      const validatedData = validateSchema(loginSchema, request.body);
      const { email, password, deviceId, rememberMe } = validatedData;

      // Get client information
      const clientInfo = {
        ip: this.getClientIp(request),
        userAgent: request.headers['user-agent'] || 'Unknown',
      };

      // Find user
      const user = await request.server.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        await trackFailedLogin(email, clientInfo.ip);
        return reply.status(401).send({
          success: false,
          error: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        });
      }

      // Check if account is locked
      const isLocked = await request.server.rateLimiter.isAccountLocked(user.id);
      if (isLocked) {
        return reply.status(423).send({
          success: false,
          error: 'ACCOUNT_LOCKED',
          message: 'Account temporarily locked due to too many failed attempts',
        });
      }

      // Verify password
      const isPasswordValid = await PasswordUtils.verify(password, user.password);
      if (!isPasswordValid) {
        await trackFailedLogin(email, clientInfo.ip);
        
        // Log login attempt
        await request.server.prisma.loginAttempt.create({
          data: {
            userId: user.id,
            email: user.email,
            ipAddress: clientInfo.ip,
            userAgent: clientInfo.userAgent,
            success: false,
            failureReason: 'Invalid password',
          },
        });

        return reply.status(401).send({
          success: false,
          error: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        });
      }

      // Check if user account is active
      if (user.status !== 'active') {
        return reply.status(403).send({
          success: false,
          error: 'ACCOUNT_INACTIVE',
          message: 'Account is not active. Please verify your email and phone number.',
          requiresVerification: {
            email: !user.isEmailVerified,
            phone: user.phone && !user.isPhoneVerified,
          },
        });
      }

      // Clear failed login attempts
      await clearFailedLoginAttempts(email);

      // Process device fingerprinting
      const deviceInfo = createDeviceFingerprint(request, {
        screenResolution: request.body.screenResolution,
        colorDepth: request.body.colorDepth,
        timezone: request.body.timezone,
      });

      const deviceFingerprint = await this.deps.deviceFingerprintService.processDeviceFingerprint(
        user.id,
        deviceInfo
      );

      // Check if device is blocked
      if (deviceFingerprint.isBlocked) {
        await request.server.prisma.loginAttempt.create({
          data: {
            userId: user.id,
            email: user.email,
            ipAddress: clientInfo.ip,
            userAgent: clientInfo.userAgent,
            success: false,
            failureReason: 'Blocked device',
          },
        });

        return reply.status(403).send({
          success: false,
          error: 'DEVICE_BLOCKED',
          message: 'This device has been blocked for security reasons',
        });
      }

      // Handle high-risk devices
      if (deviceFingerprint.riskScore >= 70) {
        logger.warn('High-risk device login detected:', {
          userId: user.id,
          deviceId: deviceFingerprint.deviceId,
          riskScore: deviceFingerprint.riskScore,
          riskFactors: deviceFingerprint.riskFactors,
          ipAddress: clientInfo.ip,
        });

        // For very high risk, require additional verification
        if (deviceFingerprint.riskScore >= 90) {
          return reply.status(202).send({
            success: false,
            error: 'HIGH_RISK_LOGIN',
            message: 'Additional verification required for this login attempt',
            data: {
              requiresVerification: true,
              verificationMethod: 'email_code',
              deviceId: deviceFingerprint.deviceId,
            },
          });
        }
      }

      // Generate tokens
      const sessionInfo = {
        deviceId: deviceFingerprint.deviceId,
        userAgent: clientInfo.userAgent,
        ipAddress: clientInfo.ip,
        rememberMe: rememberMe || false,
      };

      const tokenResult = await this.deps.tokenService.generateTokenPair(
        {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        sessionInfo
      );

      // Update user last login
      await request.server.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      // Log successful login attempt
      await request.server.prisma.loginAttempt.create({
        data: {
          userId: user.id,
          email: user.email,
          ipAddress: clientInfo.ip,
          userAgent: clientInfo.userAgent,
          success: true,
        },
      });

      // Set refresh token as HTTP-only cookie
      reply.setCookie('refresh_token', tokenResult.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000, // 30 days or 7 days
        path: '/',
      });

      reply.send({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            isEmailVerified: user.isEmailVerified,
            isPhoneVerified: user.isPhoneVerified,
            status: user.status,
            role: user.role,
            lastLoginAt: user.lastLoginAt,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
          accessToken: tokenResult.accessToken,
          expiresAt: tokenResult.expiresAt,
          device: {
            deviceId: deviceFingerprint.deviceId,
            isNewDevice: deviceFingerprint.isNewDevice,
            isTrusted: deviceFingerprint.isTrusted,
            riskScore: deviceFingerprint.riskScore,
            loginCount: deviceFingerprint.loginCount,
          },
        },
      });

      logger.info('User login successful:', {
        userId: user.id,
        email: user.email,
        ip: clientInfo.ip,
      });
    } catch (error) {
      this.handleError(error, reply, 'Login failed');
    }
  }

  /**
   * Email verification endpoint
   */
  async verifyEmail(
    request: FastifyRequest<{ Body: VerifyEmailRequest }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedData = validateSchema(verifyEmailSchema, request.body);
      const result = await this.deps.authService.verifyEmail(validatedData);

      if (result.success) {
        reply.send({
          success: true,
          message: result.message,
          data: {
            user: result.user,
          },
        });

        // Send welcome email if user is now fully verified
        if (result.user && result.user.status === 'active') {
          try {
            await this.deps.emailService.sendWelcomeEmail({
              to: result.user.email,
              name: `${result.user.firstName} ${result.user.lastName}`,
              loginUrl: `${process.env.FRONTEND_URL}/login`,
            });
          } catch (error) {
            logger.error('Failed to send welcome email:', error);
          }
        }
      } else {
        reply.status(400).send({
          success: false,
          error: 'VERIFICATION_FAILED',
          message: result.message,
        });
      }
    } catch (error) {
      this.handleError(error, reply, 'Email verification failed');
    }
  }

  /**
   * Phone verification endpoint
   */
  async verifyPhone(
    request: FastifyRequest<{ Body: { token: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { token } = request.body;
      
      if (!token) {
        return reply.status(400).send({
          success: false,
          error: 'MISSING_TOKEN',
          message: 'Verification token is required',
        });
      }

      const result = await this.deps.authService.verifyPhone(token);

      if (result.success) {
        reply.send({
          success: true,
          message: result.message,
          data: {
            user: result.user,
          },
        });

        // Send welcome email if user is now fully verified
        if (result.user && result.user.status === 'active') {
          try {
            await this.deps.emailService.sendWelcomeEmail({
              to: result.user.email,
              name: `${result.user.firstName} ${result.user.lastName}`,
              loginUrl: `${process.env.FRONTEND_URL}/login`,
            });
          } catch (error) {
            logger.error('Failed to send welcome email:', error);
          }
        }
      } else {
        reply.status(400).send({
          success: false,
          error: 'VERIFICATION_FAILED',
          message: result.message,
        });
      }
    } catch (error) {
      this.handleError(error, reply, 'Phone verification failed');
    }
  }

  /**
   * Resend email verification endpoint
   */
  async resendEmailVerification(
    request: FastifyRequest<{ Body: ResendVerificationRequest }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedData = validateSchema(resendVerificationSchema, request.body);
      const result = await this.deps.authService.resendVerification(validatedData, 'email');

      reply.send({
        success: result.success,
        message: result.message,
      });
    } catch (error) {
      this.handleError(error, reply, 'Failed to resend email verification');
    }
  }

  /**
   * Resend phone verification endpoint
   */
  async resendPhoneVerification(
    request: FastifyRequest<{ Body: ResendVerificationRequest }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedData = validateSchema(resendVerificationSchema, request.body);
      const result = await this.deps.authService.resendVerification(validatedData, 'phone');

      reply.send({
        success: result.success,
        message: result.message,
      });
    } catch (error) {
      this.handleError(error, reply, 'Failed to resend phone verification');
    }
  }

  /**
   * Forgot password endpoint
   */
  async forgotPassword(
    request: FastifyRequest<{ Body: ForgotPasswordRequest }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedData = validateSchema(forgotPasswordSchema, request.body);
      const { email } = validatedData;

      // Get client information
      const clientInfo = {
        ip: this.getClientIp(request),
        userAgent: request.headers['user-agent'] || 'Unknown',
      };

      const result = await this.deps.authService.forgotPassword(email, clientInfo);

      reply.send({
        success: result.success,
        message: result.message,
      });
    } catch (error) {
      this.handleError(error, reply, 'Password reset request failed');
    }
  }

  /**
   * Reset password endpoint
   */
  async resetPassword(
    request: FastifyRequest<{ Body: ResetPasswordRequest }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const validatedData = validateSchema(resetPasswordSchema, request.body);
      const { token, newPassword } = validatedData;

      // Get client information
      const clientInfo = {
        ip: this.getClientIp(request),
        userAgent: request.headers['user-agent'] || 'Unknown',
      };

      const result = await this.deps.authService.resetPassword(token, newPassword, clientInfo);

      if (result.success) {
        reply.send({
          success: true,
          message: result.message,
        });
      } else {
        reply.status(400).send({
          success: false,
          error: 'RESET_FAILED',
          message: result.message,
        });
      }
    } catch (error) {
      this.handleError(error, reply, 'Password reset failed');
    }
  }

  /**
   * Change password endpoint (for authenticated users)
   */
  async changePassword(
    request: FastifyRequest<{ Body: ChangePasswordRequest }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const userId = (request.user as any)?.id;
      
      if (!userId) {
        return reply.status(401).send({
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Authentication required',
        });
      }

      const validatedData = validateSchema(changePasswordSchema, request.body);
      const { currentPassword, newPassword } = validatedData;

      // Get client information
      const clientInfo = {
        ip: this.getClientIp(request),
        userAgent: request.headers['user-agent'] || 'Unknown',
      };

      const result = await this.deps.authService.changePassword(
        userId,
        currentPassword,
        newPassword,
        clientInfo
      );

      if (result.success) {
        reply.send({
          success: true,
          message: result.message,
        });
      } else {
        reply.status(400).send({
          success: false,
          error: 'CHANGE_PASSWORD_FAILED',
          message: result.message,
        });
      }
    } catch (error) {
      this.handleError(error, reply, 'Password change failed');
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const userId = (request.user as any)?.id;
      
      if (!userId) {
        return reply.status(401).send({
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Authentication required',
        });
      }

      const user = await this.deps.authService.getProfile(userId);

      reply.send({
        success: true,
        data: {
          user,
        },
      });
    } catch (error) {
      this.handleError(error, reply, 'Failed to get user profile');
    }
  }

  /**
   * Logout endpoint
   */
  async logout(
    request: FastifyRequest<{ Body: { allDevices?: boolean } }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const userId = (request.user as any)?.id;
      const { allDevices = false } = request.body || {};

      if (!userId) {
        return reply.status(401).send({
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Authentication required',
        });
      }

      // Get refresh token from cookie
      const refreshToken = request.cookies.refresh_token;

      if (refreshToken) {
        if (allDevices) {
          // Revoke all user sessions
          await this.deps.tokenService.revokeAllUserTokens(userId);
          await request.server.sessionManager.deleteAllUserSessions(userId);
        } else {
          // Revoke only this refresh token
          await this.deps.tokenService.revokeRefreshToken(refreshToken);
        }
      }

      // Clear refresh token cookie
      reply.clearCookie('refresh_token', {
        path: '/',
      });

      reply.send({
        success: true,
        message: allDevices ? 'Logged out from all devices' : 'Logged out successfully',
      });

      logger.info('User logout:', {
        userId,
        allDevices,
        ip: this.getClientIp(request),
      });
    } catch (error) {
      this.handleError(error, reply, 'Logout failed');
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    try {
      // Get refresh token from cookie
      const refreshToken = request.cookies.refresh_token;

      if (!refreshToken) {
        return reply.status(401).send({
          success: false,
          error: 'REFRESH_TOKEN_MISSING',
          message: 'Refresh token is required',
        });
      }

      // Get client information
      const clientInfo = {
        ip: this.getClientIp(request),
        userAgent: request.headers['user-agent'] || 'Unknown',
      };

      // Verify and refresh the token
      const tokenResult = await this.deps.tokenService.refreshAccessToken(
        refreshToken,
        clientInfo
      );

      // Update refresh token cookie with the new one (token rotation)
      reply.setCookie('refresh_token', tokenResult.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
      });

      reply.send({
        success: true,
        data: {
          accessToken: tokenResult.accessToken,
          expiresIn: tokenResult.expiresIn,
          tokenType: 'Bearer',
        },
      });

      logger.info('Token refreshed:', {
        userId: tokenResult.userId,
        ip: clientInfo.ip,
      });
    } catch (error) {
      // Clear invalid refresh token cookie
      reply.clearCookie('refresh_token', {
        path: '/',
      });

      if (error.message === 'REFRESH_TOKEN_INVALID' || 
          error.message === 'REFRESH_TOKEN_EXPIRED' ||
          error.message === 'REFRESH_TOKEN_REVOKED') {
        return reply.status(401).send({
          success: false,
          error: error.message,
          message: 'Invalid or expired refresh token',
        });
      }

      this.handleError(error, reply, 'Token refresh failed');
    }
  }

  /**
   * Get client IP address
   */
  private getClientIp(request: FastifyRequest): string {
    return (
      (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      (request.headers['x-real-ip'] as string) ||
      request.socket.remoteAddress ||
      'unknown'
    );
  }

  /**
   * Handle controller errors
   */
  private handleError(error: any, reply: FastifyReply, defaultMessage: string): void {
    logger.error('Auth controller error:', error);

    if (error.message === 'EMAIL_ALREADY_EXISTS') {
      return reply.status(409).send({
        success: false,
        error: 'EMAIL_ALREADY_EXISTS',
        message: 'An account with this email already exists',
      });
    }

    if (error.message === 'PHONE_ALREADY_EXISTS') {
      return reply.status(409).send({
        success: false,
        error: 'PHONE_ALREADY_EXISTS',
        message: 'An account with this phone number already exists',
      });
    }

    if (error.message === 'USER_NOT_FOUND') {
      return reply.status(404).send({
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'User not found',
      });
    }

    if (error.name === 'SchemaValidationError') {
      return reply.status(400).send({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: error.errors,
      });
    }

    reply.status(500).send({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: defaultMessage,
    });
  }
}

export const createAuthController = (deps: AuthControllerDependencies): AuthController => {
  return new AuthController(deps);
};