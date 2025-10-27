import { PrismaClient, OTPType } from '@zoptal/database';
import { nanoid } from 'nanoid';
import { config } from '../config';
import { logger } from '../utils/logger';
import { RedisClient, cacheManager } from '../utils/redis';
import { createServiceError } from '../middleware/error-handler';
import { randomBytes, createHash } from 'crypto';

export interface OTPServiceDependencies {
  prisma: PrismaClient;
}

export interface GenerateOTPOptions {
  type: OTPType;
  target: string; // email or phone number
  userId?: string;
  sessionId?: string;
  length?: number;
  expiryMinutes?: number;
  ipAddress?: string;
  userAgent?: string;
}

export interface VerifyOTPOptions {
  code: string;
  type: OTPType;
  target?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface OTPResult {
  success: boolean;
  message: string;
  code?: string;
  expiresAt?: Date;
}

export interface VerifyResult {
  success: boolean;
  message: string;
  userId?: string;
  canResend?: boolean;
  nextResendAt?: Date;
}

export class OTPService {
  private readonly DEFAULT_OTP_LENGTH = 6;
  private readonly DEFAULT_EXPIRY_MINUTES = 5; // Reduced to 5 minutes for better security
  private readonly MAX_ATTEMPTS = 3;
  private readonly RESEND_COOLDOWN_SECONDS = 60;
  private readonly RATE_LIMIT_MAX_REQUESTS = 3; // Max 3 OTP requests per 10 minutes

  constructor(private deps: OTPServiceDependencies) {}

  /**
   * Generate a secure OTP code using crypto.randomBytes
   */
  private generateSecureOTP(length: number): string {
    const digits = '0123456789';
    let code = '';
    
    // Use crypto.randomBytes for cryptographically secure random generation
    const bytes = randomBytes(length);
    
    for (let i = 0; i < length; i++) {
      code += digits[bytes[i] % digits.length];
    }
    
    return code;
  }

  /**
   * Hash OTP code for secure storage
   */
  private hashOTPCode(code: string): string {
    return createHash('sha256').update(code).digest('hex');
  }

  /**
   * Check rate limiting for OTP generation
   */
  private async checkRateLimit(target: string, type: OTPType, sessionId?: string): Promise<boolean> {
    const now = new Date();
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
    
    // Count OTP requests in last 10 minutes for this target/type
    const recentRequests = await this.deps.prisma.oTPToken.count({
      where: {
        target,
        type,
        createdAt: {
          gte: tenMinutesAgo
        }
      }
    });

    // Rate limit: max 3 OTP requests per 10 minutes per target
    return recentRequests < this.RATE_LIMIT_MAX_REQUESTS;
  }

  /**
   * Generate a new OTP token
   */
  async generateOTP(options: GenerateOTPOptions): Promise<OTPResult> {
    try {
      const {
        type,
        target,
        userId,
        sessionId,
        length = this.DEFAULT_OTP_LENGTH,
        expiryMinutes = this.DEFAULT_EXPIRY_MINUTES,
        ipAddress,
        userAgent,
      } = options;

      // Check rate limiting
      const canGenerate = await this.checkRateLimit(target, type, sessionId);
      if (!canGenerate) {
        return {
          success: false,
          message: 'Too many requests. Please wait 10 minutes before requesting another code.',
        };
      }

      // Check for resend cooldown
      const cooldownKey = `otp_cooldown:${type}:${target}`;
      const isOnCooldown = await cacheManager.get(cooldownKey);
      
      if (isOnCooldown) {
        const ttl = await RedisClient.getInstance().ttl(cooldownKey);
        return {
          success: false,
          message: `Please wait ${ttl} seconds before requesting a new code.`,
        };
      }

      // Generate secure OTP code
      const code = this.generateSecureOTP(length);
      const hashedCode = this.hashOTPCode(code);
      const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

      // Invalidate any existing active tokens for this target/type
      await this.deps.prisma.oTPToken.updateMany({
        where: {
          target,
          type,
          usedAt: null,
          expiresAt: { gt: new Date() },
        },
        data: {
          expiresAt: new Date(), // Expire immediately
        },
      });

      // Create new OTP token
      const otpToken = await this.deps.prisma.oTPToken.create({
        data: {
          code: hashedCode,
          userId,
          type,
          target,
          expiresAt,
          sessionId,
          ipAddress,
          userAgent,
          attempts: 0,
        },
      });

      // Set cooldown
      await cacheManager.setex(
        cooldownKey,
        this.RESEND_COOLDOWN_SECONDS,
        '1'
      );

      // Cache the token for quick lookup and attempt tracking
      await cacheManager.setex(
        `otp:${type}:${hashedCode}`,
        expiryMinutes * 60,
        JSON.stringify({
          id: otpToken.id,
          target,
          userId,
          attempts: 0,
        })
      );

      logger.info({
        id: otpToken.id,
        type,
        target: target.replace(/(.{2}).*@/, '$1***@'), // Mask email/phone partially
        userId,
        expiresAt,
      }, 'OTP generated successfully');

      return {
        success: true,
        message: 'Verification code sent successfully.',
        code, // Return plain code for sending via SMS/Email
        expiresAt,
      };

    } catch (error) {
      logger.error('Failed to generate OTP:', error);
      return {
        success: false,
        message: 'Failed to generate verification code. Please try again.',
      };
    }
  }

  /**
   * Verify an OTP token
   */
  async verifyOTP(options: VerifyOTPOptions): Promise<VerifyResult> {
    try {
      const { code, type, target, sessionId, ipAddress, userAgent } = options;

      // Hash the provided code for comparison
      const hashedCode = this.hashOTPCode(code);

      // Check cache for attempt tracking
      const cacheKey = `otp:${type}:${hashedCode}`;
      const cachedData = await cacheManager.get(cacheKey);
      let attemptCount = 0;

      if (cachedData) {
        const data = JSON.parse(cachedData);
        attemptCount = data.attempts || 0;
        
        // Check if max attempts exceeded
        if (attemptCount >= this.MAX_ATTEMPTS) {
          await cacheManager.del(cacheKey);
          
          // Invalidate the OTP token in database
          await this.deps.prisma.oTPToken.updateMany({
            where: {
              code: hashedCode,
              type,
              usedAt: null,
              expiresAt: { gt: new Date() }
            },
            data: {
              expiresAt: new Date() // Expire immediately
            }
          });

          logger.warn({
            type,
            codePrefix: code.substring(0, 2) + '***',
            attempts: attemptCount,
            ipAddress,
          }, 'OTP verification failed - max attempts exceeded');

          return {
            success: false,
            message: 'Maximum verification attempts exceeded. Please request a new code.',
            canResend: true
          };
        }
      }

      // Find valid OTP token in database
      const otpToken = await this.deps.prisma.oTPToken.findFirst({
        where: {
          code: hashedCode,
          type,
          usedAt: null,
          expiresAt: { gt: new Date() },
          ...(target && { target }),
          ...(sessionId && { sessionId })
        },
      });

      if (!otpToken) {
        // Increment attempt count in cache if token exists
        if (cachedData) {
          const data = JSON.parse(cachedData);
          data.attempts = attemptCount + 1;
          await cacheManager.set(cacheKey, JSON.stringify(data));
        }

        logger.warn({
          type,
          codePrefix: code.substring(0, 2) + '***',
          target: target?.replace(/(.{2}).*@/, '$1***@'),
          ipAddress,
        }, 'Invalid OTP verification attempt');

        return {
          success: false,
          message: 'Invalid or expired verification code.',
          canResend: true
        };
      }

      // Mark token as used
      await this.deps.prisma.oTPToken.update({
        where: { id: otpToken.id },
        data: {
          usedAt: new Date(),
          attempts: attemptCount + 1,
          ipAddress,
          userAgent,
        },
      });

      // Clear from cache
      await cacheManager.del(cacheKey);

      // Update user verification status if applicable
      if (otpToken.userId) {
        await this.updateUserVerificationStatus(
          otpToken.userId,
          type,
          otpToken.target
        );
      }

      logger.info({
        id: otpToken.id,
        type,
        target: otpToken.target.replace(/(.{2}).*@/, '$1***@'),
        userId: otpToken.userId,
      }, 'OTP verified successfully');

      return {
        success: true,
        message: 'Verification successful.',
        userId: otpToken.userId || undefined,
      };

    } catch (error) {
      logger.error('Failed to verify OTP:', error);
      return {
        success: false,
        message: 'Verification failed. Please try again.',
      };
    }
  }

  /**
   * Check if an OTP exists and is valid
   */
  async isOTPValid(code: string, type: OTPType, target?: string): Promise<boolean> {
    const hashedCode = this.hashOTPCode(code);
    
    const otpToken = await this.deps.prisma.oTPToken.findFirst({
      where: {
        code: hashedCode,
        type,
        usedAt: null,
        expiresAt: { gt: new Date() },
        ...(target && { target }),
      },
    });

    return !!otpToken;
  }

  /**
   * Get remaining cooldown time for OTP resend
   */
  async getRemainingCooldown(type: OTPType, target: string): Promise<number> {
    const cooldownKey = `otp_cooldown:${type}:${target}`;
    const ttl = await RedisClient.getInstance().ttl(cooldownKey);
    return ttl > 0 ? ttl : 0;
  }

  /**
   * Clean up expired OTP tokens
   */
  async cleanupExpiredTokens(): Promise<number> {
    const result = await this.deps.prisma.oTPToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { usedAt: { not: null } },
        ],
      },
    });

    if (result.count > 0) {
      logger.info({ count: result.count }, 'Cleaned up expired OTP tokens');
    }

    return result.count;
  }

  /**
   * Update user verification status based on OTP type
   */
  private async updateUserVerificationStatus(
    userId: string,
    type: OTPType,
    target: string
  ): Promise<void> {
    const updateData: any = {};

    switch (type) {
      case 'EMAIL_VERIFICATION':
      case 'EMAIL_LOGIN':
        updateData.isEmailVerified = true;
        updateData.emailVerifiedAt = new Date();
        break;
      case 'PHONE_VERIFICATION':
      case 'PHONE_LOGIN':
        updateData.isPhoneVerified = true;
        updateData.phoneVerifiedAt = new Date();
        break;
      case 'EMAIL_CHANGE':
        updateData.email = target;
        updateData.isEmailVerified = true;
        updateData.emailVerifiedAt = new Date();
        break;
      case 'PHONE_CHANGE':
        updateData.phone = target;
        updateData.isPhoneVerified = true;
        updateData.phoneVerifiedAt = new Date();
        break;
      case 'USERNAME_LOGIN':
        // For username login, we just verify the user exists
        // No specific field to update
        break;
      case 'REGISTRATION':
        // Handle registration verification
        if (target.includes('@')) {
          updateData.isEmailVerified = true;
          updateData.emailVerifiedAt = new Date();
        } else {
          updateData.isPhoneVerified = true;
          updateData.phoneVerifiedAt = new Date();
        }
        break;
    }

    // Get current user status
    const user = await this.deps.prisma.user.findUnique({
      where: { id: userId },
    });

    if (user) {
      // Update user status to active if both email and phone are verified (or phone is not required)
      const shouldActivate = 
        (updateData.isEmailVerified || user.isEmailVerified) &&
        (!user.phone || updateData.isPhoneVerified || user.isPhoneVerified);

      if (shouldActivate && user.status === 'PENDING') {
        updateData.status = 'ACTIVE';
      }
    }

    await this.deps.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    logger.info({
      userId,
      type,
      target: target.replace(/(.{2}).*@/, '$1***@'),
      updateData: Object.keys(updateData),
    }, 'User verification status updated');
  }
}

export function createOTPService(deps: OTPServiceDependencies): OTPService {
  return new OTPService(deps);
}