import { PrismaClient, User, VerificationType } from '@zoptal/database';
import { PasswordUtils } from '../utils/password';
import { TokenService } from './token.service';
import { EmailService } from './email.service';
import { SmsService } from './sms.service';
import { PasswordHistoryService } from './password-history.service';
import { DeviceFingerprintService } from './device-fingerprint.service';
import { rateLimitManager, sessionManager } from '../utils/redis';
import { logger } from '../utils/logger';
import { AUTH_CONSTANTS } from '../config/constants';
import { nanoid } from 'nanoid';
import { 
  RegisterRequest, 
  LoginRequest, 
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
  ResendVerificationRequest,
  AuthResponse,
  UserResponse,
  ChangePasswordRequest
} from '../schemas/auth.schema';
import { 
  trackFailedLogin,
  clearFailedLoginAttempts 
} from '../middleware/rate-limit';
import { createDeviceFingerprint } from '../utils/device-parser';
import { excludeDeleted, createUserFilter } from '../utils/soft-delete-filters';

export interface AuthServiceDependencies {
  prisma: PrismaClient;
  tokenService: TokenService;
  emailService: EmailService;
  smsService: SmsService;
  passwordHistoryService: PasswordHistoryService;
  deviceFingerprintService: DeviceFingerprintService;
  forcePasswordResetService?: any; // Optional dependency
}

export class AuthService {
  constructor(private deps: AuthServiceDependencies) {}

  /**
   * Register a new user account
   */
  async register(data: RegisterRequest, clientInfo: { ip: string; userAgent: string }): Promise<{
    user: UserResponse;
    message: string;
    emailVerificationSent?: boolean;
    phoneVerificationSent?: boolean;
  }> {
    const { email, password, firstName, lastName, phone } = data;

    // Check if user already exists (excluding soft-deleted users)
    const existingUser = await this.deps.prisma.user.findFirst({
      where: createUserFilter({
        OR: [
          { email },
          ...(phone ? [{ phone }] : []),
        ],
      }),
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new Error('EMAIL_ALREADY_EXISTS');
      }
      if (phone && existingUser.phone === phone) {
        throw new Error('PHONE_ALREADY_EXISTS');
      }
    }

    // Hash password
    const hashedPassword = await PasswordUtils.hash(password);

    // Create user in database
    const user = await this.deps.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        status: 'pending_verification',
        isEmailVerified: false,
        isPhoneVerified: phone ? false : true, // If no phone provided, consider verified
        role: 'user',
      },
    });

    // Add initial password to history
    try {
      await this.deps.passwordHistoryService.addPasswordToHistory(
        user.id,
        hashedPassword,
        clientInfo.ip,
        clientInfo.userAgent
      );
    } catch (error) {
      logger.warn('Failed to add initial password to history:', { userId: user.id, error });
      // Don't fail registration if password history fails
    }

    // Generate verification tokens
    const emailVerificationToken = nanoid(64);
    const phoneVerificationToken = phone ? nanoid(6).toUpperCase() : null;

    // Store verification tokens in database
    await this.deps.prisma.verification.create({
      data: {
        userId: user.id,
        type: VerificationType.EMAIL_VERIFICATION,
        token: emailVerificationToken,
        expiresAt: new Date(Date.now() + AUTH_CONSTANTS.VERIFICATION.EMAIL_EXPIRY),
        metadata: {
          email: user.email,
          registrationIp: clientInfo.ip,
          userAgent: clientInfo.userAgent,
        },
      },
    });

    if (phone && phoneVerificationToken) {
      await this.deps.prisma.verification.create({
        data: {
          userId: user.id,
          type: VerificationType.PHONE_VERIFICATION,
          token: phoneVerificationToken,
          expiresAt: new Date(Date.now() + AUTH_CONSTANTS.VERIFICATION.PHONE_EXPIRY),
          metadata: {
            phone: user.phone,
            registrationIp: clientInfo.ip,
            userAgent: clientInfo.userAgent,
          },
        },
      });
    }

    // Send verification emails/SMS
    let emailVerificationSent = false;
    let phoneVerificationSent = false;

    try {
      // Send email verification
      await this.deps.emailService.sendEmailVerification({
        to: user.email,
        name: `${user.firstName} ${user.lastName}`,
        verificationUrl: `${process.env.FRONTEND_URL}/verify-email?token=${emailVerificationToken}`,
      });
      emailVerificationSent = true;
    } catch (error) {
      logger.error('Failed to send email verification:', error);
    }

    if (phone && phoneVerificationToken) {
      try {
        // Send phone verification
        await this.deps.smsService.sendPhoneVerification({
          to: phone,
          code: phoneVerificationToken,
          name: user.firstName,
        });
        phoneVerificationSent = true;
      } catch (error) {
        logger.error('Failed to send phone verification:', error);
      }
    }

    // Log registration event
    logger.info('User registered successfully:', {
      userId: user.id,
      email: user.email,
      ip: clientInfo.ip,
      emailVerificationSent,
      phoneVerificationSent,
    });

    // Return user data (without sensitive information)
    const userResponse: UserResponse = {
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
    };

    return {
      user: userResponse,
      message: 'Registration successful. Please check your email and phone for verification instructions.',
      emailVerificationSent,
      phoneVerificationSent,
    };
  }

  /**
   * Verify email address
   */
  async verifyEmail(data: VerifyEmailRequest): Promise<{
    success: boolean;
    message: string;
    user?: UserResponse;
  }> {
    const { token } = data;

    // Find verification record
    const verification = await this.deps.prisma.verification.findFirst({
      where: {
        token,
        type: VerificationType.EMAIL_VERIFICATION,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });

    if (!verification) {
      return {
        success: false,
        message: 'Invalid or expired verification token',
      };
    }

    // Update user email verification status
    const updatedUser = await this.deps.prisma.user.update({
      where: { id: verification.userId },
      data: {
        isEmailVerified: true,
        status: verification.user.isPhoneVerified || !verification.user.phone ? 'active' : 'pending_verification',
      },
    });

    // Mark verification as used
    await this.deps.prisma.verification.update({
      where: { id: verification.id },
      data: {
        used: true,
        usedAt: new Date(),
      },
    });

    logger.info('Email verified successfully:', {
      userId: verification.userId,
      email: verification.user.email,
    });

    const userResponse: UserResponse = {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      phone: updatedUser.phone,
      isEmailVerified: updatedUser.isEmailVerified,
      isPhoneVerified: updatedUser.isPhoneVerified,
      status: updatedUser.status,
      role: updatedUser.role,
      lastLoginAt: updatedUser.lastLoginAt,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };

    return {
      success: true,
      message: 'Email verified successfully',
      user: userResponse,
    };
  }

  /**
   * Verify phone number
   */
  async verifyPhone(token: string): Promise<{
    success: boolean;
    message: string;
    user?: UserResponse;
  }> {
    // Find verification record
    const verification = await this.deps.prisma.verification.findFirst({
      where: {
        token: token.toUpperCase(),
        type: VerificationType.PHONE_VERIFICATION,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });

    if (!verification) {
      return {
        success: false,
        message: 'Invalid or expired verification code',
      };
    }

    // Update user phone verification status
    const updatedUser = await this.deps.prisma.user.update({
      where: { id: verification.userId },
      data: {
        isPhoneVerified: true,
        status: verification.user.isEmailVerified ? 'active' : 'pending_verification',
      },
    });

    // Mark verification as used
    await this.deps.prisma.verification.update({
      where: { id: verification.id },
      data: {
        used: true,
        usedAt: new Date(),
      },
    });

    logger.info('Phone verified successfully:', {
      userId: verification.userId,
      phone: verification.user.phone,
    });

    const userResponse: UserResponse = {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      phone: updatedUser.phone,
      isEmailVerified: updatedUser.isEmailVerified,
      isPhoneVerified: updatedUser.isPhoneVerified,
      status: updatedUser.status,
      role: updatedUser.role,
      lastLoginAt: updatedUser.lastLoginAt,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };

    return {
      success: true,
      message: 'Phone verified successfully',
      user: userResponse,
    };
  }

  /**
   * Resend verification email/phone
   */
  async resendVerification(
    data: ResendVerificationRequest,
    type: 'email' | 'phone'
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    const { email } = data;

    // Find user (excluding soft-deleted users)
    const user = await this.deps.prisma.user.findFirst({
      where: createUserFilter({ email }),
    });

    if (!user) {
      // Don't reveal if email exists or not
      return {
        success: true,
        message: 'If the email exists in our system, you will receive verification instructions.',
      };
    }

    // Check if already verified
    if (type === 'email' && user.isEmailVerified) {
      return {
        success: false,
        message: 'Email is already verified',
      };
    }

    if (type === 'phone' && user.isPhoneVerified) {
      return {
        success: false,
        message: 'Phone is already verified',
      };
    }

    if (type === 'phone' && !user.phone) {
      return {
        success: false,
        message: 'No phone number associated with this account',
      };
    }

    // Invalidate existing verification tokens
    await this.deps.prisma.verification.updateMany({
      where: {
        userId: user.id,
        type: type === 'email' ? VerificationType.EMAIL_VERIFICATION : VerificationType.PHONE_VERIFICATION,
        used: false,
      },
      data: {
        used: true,
        usedAt: new Date(),
      },
    });

    // Generate new verification token
    const verificationToken = type === 'email' ? nanoid(64) : nanoid(6).toUpperCase();

    // Store new verification token
    await this.deps.prisma.verification.create({
      data: {
        userId: user.id,
        type: type === 'email' ? VerificationType.EMAIL_VERIFICATION : VerificationType.PHONE_VERIFICATION,
        token: verificationToken,
        expiresAt: new Date(Date.now() + (type === 'email' ? AUTH_CONSTANTS.VERIFICATION.EMAIL_EXPIRY : AUTH_CONSTANTS.VERIFICATION.PHONE_EXPIRY)),
        metadata: {
          resend: true,
          [type === 'email' ? 'email' : 'phone']: type === 'email' ? user.email : user.phone,
        },
      },
    });

    try {
      if (type === 'email') {
        // Send email verification
        await this.deps.emailService.sendEmailVerification({
          to: user.email,
          name: `${user.firstName} ${user.lastName}`,
          verificationUrl: `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`,
        });
      } else {
        // Send phone verification
        await this.deps.smsService.sendPhoneVerification({
          to: user.phone!,
          code: verificationToken,
          name: user.firstName,
        });
      }

      logger.info(`${type} verification resent:`, {
        userId: user.id,
        email: user.email,
        type,
      });

      return {
        success: true,
        message: `${type === 'email' ? 'Email' : 'Phone'} verification sent successfully`,
      };
    } catch (error) {
      logger.error(`Failed to resend ${type} verification:`, error);
      return {
        success: false,
        message: 'Failed to send verification. Please try again later.',
      };
    }
  }

  /**
   * Get user profile information
   */
  async getProfile(userId: string): Promise<UserResponse> {
    const user = await this.deps.prisma.user.findFirst({
      where: createUserFilter({ id: userId }),
    });

    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    return {
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
    };
  }

  /**
   * Initiate password reset process
   */
  async forgotPassword(
    email: string,
    clientInfo: { ip: string; userAgent: string }
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    // Find user by email (excluding soft-deleted users)
    const user = await this.deps.prisma.user.findFirst({
      where: createUserFilter({ email }),
    });

    // Always return success to prevent email enumeration
    const successMessage = 'If an account with that email exists, a password reset link has been sent.';

    if (!user) {
      return {
        success: true,
        message: successMessage,
      };
    }

    // Check if user account is active
    if (user.status !== 'active' && user.status !== 'pending_verification') {
      return {
        success: true,
        message: successMessage,
      };
    }

    // Invalidate existing password reset tokens
    await this.deps.prisma.passwordReset.updateMany({
      where: {
        userId: user.id,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      data: {
        used: true,
        usedAt: new Date(),
      },
    });

    // Generate new reset token
    const resetToken = nanoid(64);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token in database
    await this.deps.prisma.passwordReset.create({
      data: {
        userId: user.id,
        token: resetToken,
        expiresAt,
        metadata: {
          requestedBy: clientInfo.ip,
          userAgent: clientInfo.userAgent,
        },
      },
    });

    try {
      // Send password reset email
      await this.deps.emailService.sendPasswordReset({
        to: user.email,
        name: `${user.firstName} ${user.lastName}`,
        resetUrl: `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`,
        expiresInMinutes: 60,
      });

      logger.info('Password reset email sent:', {
        userId: user.id,
        email: user.email,
        ip: clientInfo.ip,
      });
    } catch (error) {
      logger.error('Failed to send password reset email:', error);
      // Don't expose email sending errors to user
    }

    return {
      success: true,
      message: successMessage,
    };
  }

  /**
   * Reset password with token
   */
  async resetPassword(
    token: string,
    newPassword: string,
    clientInfo: { ip: string; userAgent: string }
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    // Find valid reset token
    const passwordReset = await this.deps.prisma.passwordReset.findFirst({
      where: {
        token,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });

    if (!passwordReset) {
      return {
        success: false,
        message: 'Invalid or expired reset token',
      };
    }

    // Check if new password is different from current
    const isSamePassword = await PasswordUtils.verify(newPassword, passwordReset.user.password);
    if (isSamePassword) {
      return {
        success: false,
        message: 'New password must be different from your current password',
      };
    }

    // Validate against password history
    try {
      const historyValidation = await this.deps.passwordHistoryService.validatePasswordAgainstHistory(
        passwordReset.userId,
        newPassword
      );
      
      if (!historyValidation.isValid) {
        const daysSince = historyValidation.conflictDate 
          ? Math.floor((Date.now() - historyValidation.conflictDate.getTime()) / (1000 * 60 * 60 * 24))
          : 0;
        
        return {
          success: false,
          message: `You cannot reuse a password from your recent history. This password was used ${daysSince} days ago.`,
        };
      }
    } catch (error) {
      logger.warn('Password history validation failed during reset, allowing change:', { userId: passwordReset.userId, error });
      // Continue with password reset if history validation fails
    }

    // Hash new password
    const hashedPassword = await PasswordUtils.hash(newPassword);

    // Update user password and mark token as used
    await this.deps.prisma.$transaction([
      // Update password
      this.deps.prisma.user.update({
        where: { id: passwordReset.userId },
        data: {
          password: hashedPassword,
          // Clear any account lockout if exists
          status: passwordReset.user.status === 'suspended' ? 'active' : passwordReset.user.status,
          // Clear force password reset flags
          forcePasswordReset: false,
          passwordResetBy: null,
          passwordResetAt: null,
          passwordResetReason: null,
        },
      }),
      // Mark reset token as used
      this.deps.prisma.passwordReset.update({
        where: { id: passwordReset.id },
        data: {
          used: true,
          usedAt: new Date(),
          metadata: {
            ...passwordReset.metadata,
            resetBy: clientInfo.ip,
            resetUserAgent: clientInfo.userAgent,
          },
        },
      }),
    ]);

    // Add new password to history
    try {
      await this.deps.passwordHistoryService.addPasswordToHistory(
        passwordReset.userId,
        hashedPassword,
        clientInfo.ip,
        clientInfo.userAgent
      );
    } catch (error) {
      logger.warn('Failed to add password to history after reset:', { userId: passwordReset.userId, error });
      // Don't fail password reset if history update fails
    }

    // Invalidate all existing refresh tokens for security
    await this.deps.tokenService.revokeAllUserTokens(passwordReset.userId);

    // Clear any failed login attempts
    await rateLimitManager.clearFailedLoginAttempts(passwordReset.user.email);

    try {
      // Send password change confirmation email
      await this.deps.emailService.sendSecurityAlert({
        to: passwordReset.user.email,
        name: `${passwordReset.user.firstName} ${passwordReset.user.lastName}`,
        event: 'Password Reset',
        timestamp: new Date().toLocaleString(),
        ipAddress: clientInfo.ip,
        userAgent: clientInfo.userAgent,
      });
    } catch (error) {
      logger.error('Failed to send password change confirmation:', error);
    }

    logger.info('Password reset successful:', {
      userId: passwordReset.userId,
      email: passwordReset.user.email,
      ip: clientInfo.ip,
    });

    return {
      success: true,
      message: 'Password reset successfully. Please login with your new password.',
    };
  }

  /**
   * Change password (authenticated user)
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
    clientInfo: { ip: string; userAgent: string }
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    // Get user (excluding soft-deleted users)
    const user = await this.deps.prisma.user.findFirst({
      where: createUserFilter({ id: userId }),
    });

    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    // Verify current password
    const isCurrentPasswordValid = await PasswordUtils.verify(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return {
        success: false,
        message: 'Current password is incorrect',
      };
    }

    // Check if new password is different
    const isSamePassword = await PasswordUtils.verify(newPassword, user.password);
    if (isSamePassword) {
      return {
        success: false,
        message: 'New password must be different from your current password',
      };
    }

    // Validate against password history
    try {
      const historyValidation = await this.deps.passwordHistoryService.validatePasswordAgainstHistory(
        userId,
        newPassword
      );
      
      if (!historyValidation.isValid) {
        const daysSince = historyValidation.conflictDate 
          ? Math.floor((Date.now() - historyValidation.conflictDate.getTime()) / (1000 * 60 * 60 * 24))
          : 0;
        
        return {
          success: false,
          message: `You cannot reuse a password from your recent history. This password was used ${daysSince} days ago.`,
        };
      }
    } catch (error) {
      logger.warn('Password history validation failed, allowing change:', { userId, error });
      // Continue with password change if history validation fails
    }

    // Hash new password
    const hashedPassword = await PasswordUtils.hash(newPassword);

    // Update password and clear force password reset if applicable
    await this.deps.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        // Clear force password reset flags
        forcePasswordReset: false,
        passwordResetBy: null,
        passwordResetAt: null,
        passwordResetReason: null,
      },
    });

    // Add new password to history
    try {
      await this.deps.passwordHistoryService.addPasswordToHistory(
        userId,
        hashedPassword,
        clientInfo.ip,
        clientInfo.userAgent
      );
    } catch (error) {
      logger.warn('Failed to add password to history:', { userId, error });
      // Don't fail password change if history update fails
    }

    // Invalidate all existing refresh tokens except current session
    await this.deps.tokenService.revokeAllUserTokens(userId);

    try {
      // Send password change notification
      await this.deps.emailService.sendSecurityAlert({
        to: user.email,
        name: `${user.firstName} ${user.lastName}`,
        event: 'Password Changed',
        timestamp: new Date().toLocaleString(),
        ipAddress: clientInfo.ip,
        userAgent: clientInfo.userAgent,
      });
    } catch (error) {
      logger.error('Failed to send password change notification:', error);
    }

    logger.info('Password changed successfully:', {
      userId,
      email: user.email,
      ip: clientInfo.ip,
    });

    return {
      success: true,
      message: 'Password changed successfully',
    };
  }
}

export const createAuthService = (deps: AuthServiceDependencies): AuthService => {
  return new AuthService(deps);
};