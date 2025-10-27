import { PrismaClient } from '@zoptal/database';
import { nanoid } from 'nanoid';
import { logger } from '../utils/logger';
import { cacheManager } from '../utils/redis';
import { createServiceError } from '../middleware/error-handler';
import { createHash, randomBytes } from 'crypto';

export interface MagicLinkServiceDependencies {
  prisma: PrismaClient;
}

export interface GenerateMagicLinkOptions {
  email: string;
  userId?: string;
  purpose: 'LOGIN' | 'EMAIL_VERIFICATION' | 'PASSWORD_RESET' | 'EMAIL_CHANGE';
  expiryMinutes?: number;
  ipAddress?: string;
  userAgent?: string;
  callbackUrl?: string;
}

export interface VerifyMagicLinkOptions {
  token: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface MagicLinkResult {
  success: boolean;
  message: string;
  magicLink?: string;
  expiresAt?: Date;
  token?: string;
}

export interface VerifyMagicLinkResult {
  valid: boolean;
  message: string;
  userId?: string;
  email?: string;
  purpose?: string;
  canResend?: boolean;
}

export class MagicLinkService {
  private readonly DEFAULT_EXPIRY_MINUTES = 15; // 15 minutes for security
  private readonly MAX_ATTEMPTS = 3;
  private readonly RATE_LIMIT_MAX_REQUESTS = 5; // Max 5 magic links per hour per email
  private readonly RATE_LIMIT_WINDOW_HOURS = 1;

  constructor(private deps: MagicLinkServiceDependencies) {}

  /**
   * Generate a secure magic link token
   */
  private generateSecureToken(): string {
    // Generate a cryptographically secure token
    const bytes = randomBytes(32);
    return bytes.toString('hex');
  }

  /**
   * Hash token for secure storage
   */
  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  /**
   * Check rate limiting for magic link generation
   */
  private async checkRateLimit(email: string): Promise<boolean> {
    const now = new Date();
    const windowStart = new Date(now.getTime() - this.RATE_LIMIT_WINDOW_HOURS * 60 * 60 * 1000);
    
    // Count magic link requests in the last hour for this email
    const recentRequests = await this.deps.prisma.magicLink.count({
      where: {
        email: {
          equals: email,
          mode: 'insensitive'
        },
        createdAt: {
          gte: windowStart
        }
      }
    });

    return recentRequests < this.RATE_LIMIT_MAX_REQUESTS;
  }

  /**
   * Generate a magic link for authentication
   */
  async generateMagicLink(options: GenerateMagicLinkOptions): Promise<MagicLinkResult> {
    try {
      const {
        email,
        userId,
        purpose,
        expiryMinutes = this.DEFAULT_EXPIRY_MINUTES,
        ipAddress,
        userAgent,
        callbackUrl
      } = options;

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return {
          success: false,
          message: 'Invalid email format',
        };
      }

      // Check rate limiting
      const canGenerate = await this.checkRateLimit(email);
      if (!canGenerate) {
        return {
          success: false,
          message: `Too many requests. Please wait ${this.RATE_LIMIT_WINDOW_HOURS} hour(s) before requesting another magic link.`,
        };
      }

      // Generate secure token
      const token = this.generateSecureToken();
      const hashedToken = this.hashToken(token);
      const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

      // Invalidate any existing active magic links for this email/purpose
      await this.deps.prisma.magicLink.updateMany({
        where: {
          email: {
            equals: email,
            mode: 'insensitive'
          },
          purpose,
          usedAt: null,
          expiresAt: { gt: new Date() },
        },
        data: {
          expiresAt: new Date(), // Expire immediately
        },
      });

      // Create new magic link
      const magicLink = await this.deps.prisma.magicLink.create({
        data: {
          token: hashedToken,
          email: email.toLowerCase(),
          userId,
          purpose,
          expiresAt,
          ipAddress,
          userAgent,
          callbackUrl,
          attempts: 0,
        },
      });

      // Cache the magic link data for quick lookup
      await cacheManager.setex(
        `magic_link:${hashedToken}`,
        expiryMinutes * 60,
        JSON.stringify({
          id: magicLink.id,
          email: magicLink.email,
          userId,
          purpose,
          attempts: 0,
        })
      );

      // Construct the magic link URL
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      const magicLinkUrl = `${baseUrl}/auth/magic-link?token=${token}${callbackUrl ? `&callback=${encodeURIComponent(callbackUrl)}` : ''}`;

      logger.info({
        id: magicLink.id,
        email: email.replace(/(.{2}).*@/, '$1***@'), // Mask email
        userId,
        purpose,
        expiresAt,
      }, 'Magic link generated successfully');

      return {
        success: true,
        message: 'Magic link sent successfully.',
        magicLink: magicLinkUrl,
        token, // Return for email sending
        expiresAt,
      };

    } catch (error) {
      logger.error('Failed to generate magic link:', error);
      return {
        success: false,
        message: 'Failed to generate magic link. Please try again.',
      };
    }
  }

  /**
   * Verify a magic link token
   */
  async verifyMagicLink(options: VerifyMagicLinkOptions): Promise<VerifyMagicLinkResult> {
    try {
      const { token, ipAddress, userAgent } = options;

      // Hash the provided token
      const hashedToken = this.hashToken(token);

      // Check cache first
      const cacheKey = `magic_link:${hashedToken}`;
      const cachedData = await cacheManager.get(cacheKey);
      let attemptCount = 0;

      if (cachedData) {
        const data = JSON.parse(cachedData);
        attemptCount = data.attempts || 0;
        
        // Check if max attempts exceeded
        if (attemptCount >= this.MAX_ATTEMPTS) {
          await cacheManager.del(cacheKey);
          
          // Invalidate the magic link in database
          await this.deps.prisma.magicLink.updateMany({
            where: {
              token: hashedToken,
              usedAt: null,
              expiresAt: { gt: new Date() }
            },
            data: {
              expiresAt: new Date() // Expire immediately
            }
          });

          logger.warn({
            tokenPrefix: token.substring(0, 8) + '***',
            attempts: attemptCount,
            ipAddress,
          }, 'Magic link verification failed - max attempts exceeded');

          return {
            valid: false,
            message: 'Maximum verification attempts exceeded. Please request a new magic link.',
            canResend: true
          };
        }
      }

      // Find valid magic link in database
      const magicLink = await this.deps.prisma.magicLink.findFirst({
        where: {
          token: hashedToken,
          usedAt: null,
          expiresAt: { gt: new Date() },
        },
      });

      if (!magicLink) {
        // Increment attempt count in cache if link exists
        if (cachedData) {
          const data = JSON.parse(cachedData);
          data.attempts = attemptCount + 1;
          await cacheManager.set(cacheKey, JSON.stringify(data));
        }

        logger.warn({
          tokenPrefix: token.substring(0, 8) + '***',
          ipAddress,
        }, 'Invalid magic link verification attempt');

        return {
          valid: false,
          message: 'Invalid or expired magic link.',
          canResend: true
        };
      }

      // Mark magic link as used
      await this.deps.prisma.magicLink.update({
        where: { id: magicLink.id },
        data: {
          usedAt: new Date(),
          attempts: attemptCount + 1,
          verifiedIpAddress: ipAddress,
          verifiedUserAgent: userAgent,
        },
      });

      // Clear from cache
      await cacheManager.del(cacheKey);

      logger.info({
        id: magicLink.id,
        email: magicLink.email.replace(/(.{2}).*@/, '$1***@'),
        userId: magicLink.userId,
        purpose: magicLink.purpose,
      }, 'Magic link verified successfully');

      return {
        valid: true,
        message: 'Magic link verification successful.',
        userId: magicLink.userId || undefined,
        email: magicLink.email,
        purpose: magicLink.purpose,
      };

    } catch (error) {
      logger.error('Failed to verify magic link:', error);
      return {
        valid: false,
        message: 'Verification failed. Please try again.',
      };
    }
  }

  /**
   * Get magic link by token (for verification without consuming)
   */
  async getMagicLink(token: string): Promise<{
    valid: boolean;
    email?: string;
    purpose?: string;
    expiresAt?: Date;
    userId?: string;
  }> {
    try {
      const hashedToken = this.hashToken(token);
      
      const magicLink = await this.deps.prisma.magicLink.findFirst({
        where: {
          token: hashedToken,
          usedAt: null,
          expiresAt: { gt: new Date() },
        },
        select: {
          email: true,
          purpose: true,
          expiresAt: true,
          userId: true,
        }
      });

      if (!magicLink) {
        return { valid: false };
      }

      return {
        valid: true,
        email: magicLink.email,
        purpose: magicLink.purpose,
        expiresAt: magicLink.expiresAt,
        userId: magicLink.userId || undefined,
      };

    } catch (error) {
      logger.error('Failed to get magic link:', error);
      return { valid: false };
    }
  }

  /**
   * Clean up expired magic links
   */
  async cleanupExpiredLinks(): Promise<number> {
    const result = await this.deps.prisma.magicLink.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { usedAt: { not: null } },
        ],
      },
    });

    if (result.count > 0) {
      logger.info({ count: result.count }, 'Cleaned up expired magic links');
    }

    return result.count;
  }

  /**
   * Get magic link usage statistics
   */
  async getMagicLinkStats(): Promise<{
    totalGenerated: number;
    totalUsed: number;
    totalExpired: number;
    usageByPurpose: Array<{ purpose: string; count: number }>;
  }> {
    try {
      const totalGenerated = await this.deps.prisma.magicLink.count();
      const totalUsed = await this.deps.prisma.magicLink.count({
        where: { usedAt: { not: null } }
      });
      const totalExpired = await this.deps.prisma.magicLink.count({
        where: { 
          expiresAt: { lt: new Date() },
          usedAt: null
        }
      });

      // Get usage by purpose
      const usageByPurpose = await this.deps.prisma.magicLink.groupBy({
        by: ['purpose'],
        _count: { purpose: true }
      });

      return {
        totalGenerated,
        totalUsed,
        totalExpired,
        usageByPurpose: usageByPurpose.map(item => ({
          purpose: item.purpose,
          count: item._count.purpose
        }))
      };

    } catch (error) {
      logger.error('Failed to get magic link statistics:', error);
      return {
        totalGenerated: 0,
        totalUsed: 0,
        totalExpired: 0,
        usageByPurpose: []
      };
    }
  }
}

export function createMagicLinkService(deps: MagicLinkServiceDependencies): MagicLinkService {
  return new MagicLinkService(deps);
}