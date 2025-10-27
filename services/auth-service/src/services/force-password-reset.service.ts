import { PrismaClient } from '@zoptal/database';
import { logger } from '../utils/logger';
import { EmailService } from './email.service';
import { ActivityService } from './activity.service';
import { SessionService } from './session.service';

export interface ForcePasswordResetServiceDependencies {
  prisma: PrismaClient;
  emailService: EmailService;
  activityService: ActivityService;
  sessionService: SessionService;
}

export interface ForcePasswordResetOptions {
  reason?: string;
  notifyUser?: boolean;
  revokeAllSessions?: boolean;
  gracePeriodDays?: number; // Days before account is locked if password not reset
}

export interface ForcePasswordResetResult {
  success: boolean;
  userId: string;
  resetAt: Date;
  reason?: string;
  gracePeriodEnds?: Date;
}

export interface PasswordResetStatus {
  isForced: boolean;
  resetAt?: Date;
  resetBy?: string;
  reason?: string;
  gracePeriodEnds?: Date;
  daysRemaining?: number;
  isExpired: boolean;
}

export class ForcePasswordResetService {
  private readonly DEFAULT_GRACE_PERIOD = 7; // 7 days to reset password
  
  constructor(private deps: ForcePasswordResetServiceDependencies) {}

  /**
   * Force a user to reset their password
   */
  async forcePasswordReset(
    userId: string,
    adminId: string,
    options: ForcePasswordResetOptions = {}
  ): Promise<ForcePasswordResetResult> {
    try {
      const {
        reason = 'Administrative requirement',
        notifyUser = true,
        revokeAllSessions = true,
        gracePeriodDays = this.DEFAULT_GRACE_PERIOD,
      } = options;

      // Check if user exists
      const user = await this.deps.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('USER_NOT_FOUND');
      }

      if (user.deletedAt) {
        throw new Error('USER_DELETED');
      }

      const resetAt = new Date();
      const gracePeriodEnds = new Date(resetAt.getTime() + gracePeriodDays * 24 * 60 * 60 * 1000);

      // Update user with force password reset flag
      const updatedUser = await this.deps.prisma.user.update({
        where: { id: userId },
        data: {
          forcePasswordReset: true,
          passwordResetBy: adminId,
          passwordResetAt: resetAt,
          passwordResetReason: reason,
        },
      });

      // Revoke all user sessions if requested
      if (revokeAllSessions) {
        await this.deps.sessionService.deleteAllUserSessions(userId);
        
        // Also revoke all refresh tokens
        await this.deps.prisma.refreshToken.updateMany({
          where: { userId },
          data: { revokedAt: resetAt },
        });
      }

      // Log the security event
      await this.deps.activityService.logSecurityEvent({
        userId,
        type: 'FORCE_PASSWORD_RESET',
        description: `Password reset forced by admin: ${reason}`,
        severity: 'HIGH',
        metadata: {
          adminId,
          reason,
          gracePeriodDays,
          gracePeriodEnds: gracePeriodEnds.toISOString(),
          revokedSessions: revokeAllSessions,
        },
      });

      // Send notification email if requested
      if (notifyUser && user.email && user.firstName) {
        try {
          await this.sendForceResetNotification(
            user.email,
            user.firstName,
            reason,
            gracePeriodEnds
          );
        } catch (error) {
          logger.warn('Failed to send force reset notification email:', { userId, error });
        }
      }

      logger.info('Password reset forced for user:', {
        userId,
        adminId,
        reason,
        gracePeriodEnds,
        revokedSessions: revokeAllSessions,
      });

      return {
        success: true,
        userId,
        resetAt,
        reason,
        gracePeriodEnds,
      };
    } catch (error) {
      logger.error('Failed to force password reset:', { userId, adminId, error });
      throw error;
    }
  }

  /**
   * Clear force password reset requirement
   */
  async clearForcePasswordReset(
    userId: string,
    adminId?: string
  ): Promise<{ success: boolean }> {
    try {
      // Update user to clear force password reset
      await this.deps.prisma.user.update({
        where: { id: userId },
        data: {
          forcePasswordReset: false,
          passwordResetBy: null,
          passwordResetAt: null,
          passwordResetReason: null,
        },
      });

      // Log the security event
      await this.deps.activityService.logSecurityEvent({
        userId,
        type: 'FORCE_PASSWORD_RESET_CLEARED',
        description: 'Force password reset requirement cleared',
        severity: 'MEDIUM',
        metadata: {
          adminId,
          clearedAt: new Date().toISOString(),
        },
      });

      logger.info('Force password reset cleared:', { userId, adminId });

      return { success: true };
    } catch (error) {
      logger.error('Failed to clear force password reset:', { userId, adminId, error });
      throw error;
    }
  }

  /**
   * Check if user has force password reset requirement
   */
  async getPasswordResetStatus(userId: string): Promise<PasswordResetStatus> {
    try {
      const user = await this.deps.prisma.user.findUnique({
        where: { id: userId },
        select: {
          forcePasswordReset: true,
          passwordResetAt: true,
          passwordResetBy: true,
          passwordResetReason: true,
        },
      });

      if (!user || !user.forcePasswordReset) {
        return {
          isForced: false,
          isExpired: false,
        };
      }

      const gracePeriodEnds = user.passwordResetAt 
        ? new Date(user.passwordResetAt.getTime() + this.DEFAULT_GRACE_PERIOD * 24 * 60 * 60 * 1000)
        : new Date();

      const now = new Date();
      const daysRemaining = Math.ceil((gracePeriodEnds.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
      const isExpired = daysRemaining <= 0;

      return {
        isForced: true,
        resetAt: user.passwordResetAt,
        resetBy: user.passwordResetBy,
        reason: user.passwordResetReason,
        gracePeriodEnds,
        daysRemaining: Math.max(0, daysRemaining),
        isExpired,
      };
    } catch (error) {
      logger.error('Failed to get password reset status:', { userId, error });
      throw error;
    }
  }

  /**
   * Get all users with forced password reset requirement
   */
  async getForcedResetUsers(
    page: number = 1,
    limit: number = 50,
    includeExpired: boolean = false
  ): Promise<{
    users: any[];
    total: number;
    pagination: {
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    try {
      const offset = (page - 1) * limit;
      
      const whereClause: any = {
        forcePasswordReset: true,
        deletedAt: null,
      };

      // Filter expired resets if not including them
      if (!includeExpired) {
        const cutoffDate = new Date(Date.now() - this.DEFAULT_GRACE_PERIOD * 24 * 60 * 60 * 1000);
        whereClause.passwordResetAt = {
          gt: cutoffDate,
        };
      }

      const [users, total] = await Promise.all([
        this.deps.prisma.user.findMany({
          where: whereClause,
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            forcePasswordReset: true,
            passwordResetAt: true,
            passwordResetBy: true,
            passwordResetReason: true,
            lastLoginAt: true,
            createdAt: true,
          },
          orderBy: { passwordResetAt: 'desc' },
          skip: offset,
          take: limit,
        }),

        this.deps.prisma.user.count({
          where: whereClause,
        }),
      ]);

      return {
        users: users.map(user => ({
          ...user,
          gracePeriodEnds: user.passwordResetAt 
            ? new Date(user.passwordResetAt.getTime() + this.DEFAULT_GRACE_PERIOD * 24 * 60 * 60 * 1000)
            : null,
          daysRemaining: user.passwordResetAt 
            ? Math.max(0, Math.ceil((new Date(user.passwordResetAt.getTime() + this.DEFAULT_GRACE_PERIOD * 24 * 60 * 60 * 1000).getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
            : 0,
        })),
        total,
        pagination: {
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Failed to get forced reset users:', error);
      throw error;
    }
  }

  /**
   * Bulk force password reset for multiple users
   */
  async bulkForcePasswordReset(
    userIds: string[],
    adminId: string,
    options: ForcePasswordResetOptions = {}
  ): Promise<{
    success: boolean;
    processed: number;
    failed: string[];
    errors: any[];
  }> {
    const failed: string[] = [];
    const errors: any[] = [];
    let processed = 0;

    for (const userId of userIds) {
      try {
        await this.forcePasswordReset(userId, adminId, options);
        processed++;
      } catch (error) {
        failed.push(userId);
        errors.push({ userId, error: error.message });
        logger.error('Failed to force password reset in bulk operation:', { userId, error });
      }
    }

    logger.info('Bulk force password reset completed:', {
      adminId,
      totalUsers: userIds.length,
      processed,
      failed: failed.length,
    });

    return {
      success: true,
      processed,
      failed,
      errors,
    };
  }

  /**
   * Cleanup expired force password reset requirements
   */
  async cleanupExpiredForceResets(): Promise<{
    processed: number;
    suspended: number;
    errors: number;
  }> {
    try {
      const cutoffDate = new Date(Date.now() - this.DEFAULT_GRACE_PERIOD * 24 * 60 * 60 * 1000);
      
      const expiredUsers = await this.deps.prisma.user.findMany({
        where: {
          forcePasswordReset: true,
          passwordResetAt: {
            lt: cutoffDate,
          },
          status: { not: 'SUSPENDED' }, // Don't process already suspended users
        },
        select: { id: true, email: true, firstName: true, lastName: true },
      });

      let suspended = 0;
      let errors = 0;

      for (const user of expiredUsers) {
        try {
          // Suspend the user account
          await this.deps.prisma.user.update({
            where: { id: user.id },
            data: {
              status: 'SUSPENDED',
              // Keep force reset flag for when they're reactivated
            },
          });

          // Revoke all sessions
          await this.deps.sessionService.deleteAllUserSessions(user.id);

          // Log security event
          await this.deps.activityService.logSecurityEvent({
            userId: user.id,
            type: 'ACCOUNT_SUSPENDED',
            description: 'Account suspended due to expired force password reset',
            severity: 'HIGH',
            metadata: {
              reason: 'expired_force_password_reset',
              suspendedAt: new Date().toISOString(),
            },
          });

          // Notify user
          try {
            await this.sendAccountSuspendedNotification(
              user.email,
              user.firstName || user.email
            );
          } catch (emailError) {
            logger.warn('Failed to send suspension notification:', { userId: user.id, emailError });
          }

          suspended++;
        } catch (error) {
          logger.error('Failed to suspend user with expired force reset:', {
            userId: user.id,
            error,
          });
          errors++;
        }
      }

      logger.info('Cleanup expired force password resets completed:', {
        processed: expiredUsers.length,
        suspended,
        errors,
      });

      return {
        processed: expiredUsers.length,
        suspended,
        errors,
      };
    } catch (error) {
      logger.error('Failed to cleanup expired force resets:', error);
      throw error;
    }
  }

  /**
   * Send force password reset notification email
   */
  private async sendForceResetNotification(
    email: string,
    name: string,
    reason: string,
    gracePeriodEnds: Date
  ): Promise<void> {
    await this.deps.emailService.sendSecurityAlert({
      to: email,
      name,
      event: 'Password Reset Required',
      timestamp: new Date().toLocaleString(),
      ipAddress: 'System',
      userAgent: 'Administrative Action',
      additionalInfo: `You are required to reset your password. Reason: ${reason}. Please reset your password before ${gracePeriodEnds.toLocaleDateString()} to avoid account suspension.`,
    });
  }

  /**
   * Send account suspended notification email
   */
  private async sendAccountSuspendedNotification(
    email: string,
    name: string
  ): Promise<void> {
    await this.deps.emailService.sendSecurityAlert({
      to: email,
      name,
      event: 'Account Suspended',
      timestamp: new Date().toLocaleString(),
      ipAddress: 'System',
      userAgent: 'Automated System',
      additionalInfo: 'Your account has been suspended due to failure to reset your password within the required timeframe. Please contact support to reactivate your account.',
    });
  }
}

export function createForcePasswordResetService(
  deps: ForcePasswordResetServiceDependencies
): ForcePasswordResetService {
  return new ForcePasswordResetService(deps);
}