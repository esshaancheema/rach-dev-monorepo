import { PrismaClient } from '@zoptal/database';
import { logger } from '../utils/logger';
import { SessionService } from './session.service';
import { EmailService } from './email.service';
import { ActivityService } from './activity.service';

export interface SoftDeleteServiceDependencies {
  prisma: PrismaClient;
  sessionService: SessionService;
  emailService: EmailService;
  activityService: ActivityService;
}

export interface SoftDeleteOptions {
  reason?: string;
  deletedBy?: string;
  notifyUser?: boolean;
  gracePeriod?: number; // Days before permanent deletion
}

export interface SoftDeleteResult {
  success: boolean;
  userId: string;
  deletedAt: Date;
  reason?: string;
  gracePeriodEnds?: Date;
}

export interface UserRestorationResult {
  success: boolean;
  userId: string;
  restoredAt: Date;
  restoredBy?: string;
}

export class SoftDeleteService {
  private readonly DEFAULT_GRACE_PERIOD = 30; // 30 days
  
  constructor(private deps: SoftDeleteServiceDependencies) {}

  /**
   * Soft delete a user account
   */
  async softDeleteUser(
    userId: string,
    options: SoftDeleteOptions = {}
  ): Promise<SoftDeleteResult> {
    try {
      const {
        reason = 'User requested account deletion',
        deletedBy,
        notifyUser = true,
        gracePeriod = this.DEFAULT_GRACE_PERIOD,
      } = options;

      // Check if user exists and is not already deleted
      const user = await this.deps.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('USER_NOT_FOUND');
      }

      if (user.deletedAt) {
        throw new Error('USER_ALREADY_DELETED');
      }

      const deletedAt = new Date();
      const gracePeriodEnds = new Date(deletedAt.getTime() + gracePeriod * 24 * 60 * 60 * 1000);

      // Perform soft delete in a transaction
      const result = await this.deps.prisma.$transaction(async (tx) => {
        // Update user with soft delete information
        const deletedUser = await tx.user.update({
          where: { id: userId },
          data: {
            deletedAt,
            deletedBy,
            deleteReason: reason,
            status: 'DELETED',
            // Anonymize email by appending timestamp to prevent conflicts
            email: `${user.email}.deleted.${Date.now()}`,
          },
        });

        // Revoke all refresh tokens
        await tx.refreshToken.updateMany({
          where: { userId },
          data: { revokedAt: deletedAt },
        });

        // Disable 2FA
        await tx.twoFactorAuth.updateMany({
          where: { userId },
          data: { enabled: false },
        });

        // Anonymize device fingerprints
        await tx.deviceFingerprint.updateMany({
          where: { userId },
          data: { isBlocked: true },
        });

        return deletedUser;
      });

      // Invalidate all user sessions
      await this.deps.sessionService.deleteAllUserSessions(userId);

      // Log the deletion activity
      await this.deps.activityService.logSecurityEvent({
        userId,
        type: 'ACCOUNT_DELETED',
        description: `User account soft deleted: ${reason}`,
        severity: 'MEDIUM',
        metadata: {
          deletedBy,
          reason,
          gracePeriodEnds: gracePeriodEnds.toISOString(),
        },
      });

      // Send notification email if requested
      if (notifyUser && user.email && user.firstName) {
        try {
          await this.sendDeletionNotification(user.email, user.firstName, gracePeriodEnds);
        } catch (error) {
          logger.warn('Failed to send deletion notification email:', { userId, error });
        }
      }

      logger.info('User account soft deleted:', {
        userId,
        email: user.email,
        reason,
        deletedBy,
        gracePeriodEnds,
      });

      return {
        success: true,
        userId,
        deletedAt,
        reason,
        gracePeriodEnds,
      };
    } catch (error) {
      logger.error('Failed to soft delete user:', { userId, error });
      throw error;
    }
  }

  /**
   * Restore a soft-deleted user account
   */
  async restoreUser(
    userId: string,
    restoredBy?: string
  ): Promise<UserRestorationResult> {
    try {
      // Check if user exists and is soft deleted
      const user = await this.deps.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('USER_NOT_FOUND');
      }

      if (!user.deletedAt) {
        throw new Error('USER_NOT_DELETED');
      }

      const restoredAt = new Date();

      // Restore user in a transaction
      const result = await this.deps.prisma.$transaction(async (tx) => {
        // Extract original email from anonymized email
        const originalEmail = user.email.replace(/\.deleted\.\d+$/, '');

        // Check if original email is still available
        const emailExists = await tx.user.findFirst({
          where: {
            email: originalEmail,
            deletedAt: null,
          },
        });

        if (emailExists) {
          throw new Error('EMAIL_NO_LONGER_AVAILABLE');
        }

        // Restore user
        const restoredUser = await tx.user.update({
          where: { id: userId },
          data: {
            deletedAt: null,
            deletedBy: null,
            deleteReason: null,
            status: 'ACTIVE',
            email: originalEmail,
          },
        });

        // Restore refresh tokens that are still valid
        await tx.refreshToken.updateMany({
          where: {
            userId,
            expiresAt: { gt: restoredAt },
          },
          data: { revokedAt: null },
        });

        return restoredUser;
      });

      // Log the restoration activity
      await this.deps.activityService.logSecurityEvent({
        userId,
        type: 'ACCOUNT_RESTORED',
        description: 'User account restored from soft deletion',
        severity: 'MEDIUM',
        metadata: {
          restoredBy,
          originalDeletionDate: user.deletedAt.toISOString(),
          deleteReason: user.deleteReason,
        },
      });

      // Send restoration notification email
      if (result.email && result.firstName) {
        try {
          await this.sendRestorationNotification(result.email, result.firstName);
        } catch (error) {
          logger.warn('Failed to send restoration notification email:', { userId, error });
        }
      }

      logger.info('User account restored:', {
        userId,
        email: result.email,
        restoredBy,
        originalDeletionDate: user.deletedAt,
      });

      return {
        success: true,
        userId,
        restoredAt,
        restoredBy,
      };
    } catch (error) {
      logger.error('Failed to restore user:', { userId, error });
      throw error;
    }
  }

  /**
   * Permanently delete a user account (hard delete)
   */
  async permanentlyDeleteUser(
    userId: string,
    adminId?: string
  ): Promise<{ success: boolean; deletedData: string[] }> {
    try {
      // Check if user exists and is soft deleted
      const user = await this.deps.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('USER_NOT_FOUND');
      }

      if (!user.deletedAt) {
        throw new Error('USER_NOT_SOFT_DELETED');
      }

      const deletedData: string[] = [];

      // Permanently delete user and all related data
      await this.deps.prisma.$transaction(async (tx) => {
        // Delete related authentication data
        await tx.refreshToken.deleteMany({ where: { userId } });
        deletedData.push('refresh_tokens');

        await tx.loginAttempt.deleteMany({ where: { userId } });
        deletedData.push('login_attempts');

        await tx.twoFactorAuth.deleteMany({ where: { userId } });
        deletedData.push('two_factor_auth');

        await tx.verificationToken.deleteMany({ where: { userId } });
        deletedData.push('verification_tokens');

        await tx.passwordHistory.deleteMany({ where: { userId } });
        deletedData.push('password_history');

        await tx.deviceFingerprint.deleteMany({ where: { userId } });
        deletedData.push('device_fingerprints');

        await tx.oAuthAccount.deleteMany({ where: { userId } });
        deletedData.push('oauth_accounts');

        // Delete security events (or anonymize them)
        await tx.securityEvent.updateMany({
          where: { userId },
          data: { userId: null },
        });
        deletedData.push('security_events_anonymized');

        // Delete other related data
        await tx.account.deleteMany({ where: { userId } });
        deletedData.push('accounts');

        await tx.session.deleteMany({ where: { userId } });
        deletedData.push('sessions');

        await tx.notification.deleteMany({ where: { userId } });
        deletedData.push('notifications');

        await tx.activity.deleteMany({ where: { userId } });
        deletedData.push('activities');

        // Finally, delete the user
        await tx.user.delete({ where: { id: userId } });
        deletedData.push('user');
      });

      // Log the permanent deletion
      await this.deps.activityService.logSecurityEvent({
        type: 'ACCOUNT_PERMANENTLY_DELETED',
        description: 'User account permanently deleted',
        severity: 'HIGH',
        metadata: {
          userId,
          adminId,
          deletedData,
          originalDeletionDate: user.deletedAt.toISOString(),
          deleteReason: user.deleteReason,
        },
      });

      logger.warn('User account permanently deleted:', {
        userId,
        email: user.email,
        adminId,
        deletedData,
      });

      return {
        success: true,
        deletedData,
      };
    } catch (error) {
      logger.error('Failed to permanently delete user:', { userId, error });
      throw error;
    }
  }

  /**
   * Get soft-deleted users (for admin recovery)
   */
  async getSoftDeletedUsers(
    page: number = 1,
    limit: number = 50
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

      const [users, total] = await Promise.all([
        this.deps.prisma.user.findMany({
          where: {
            deletedAt: { not: null },
          },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            deletedAt: true,
            deletedBy: true,
            deleteReason: true,
            createdAt: true,
          },
          orderBy: { deletedAt: 'desc' },
          skip: offset,
          take: limit,
        }),

        this.deps.prisma.user.count({
          where: {
            deletedAt: { not: null },
          },
        }),
      ]);

      return {
        users: users.map(user => ({
          ...user,
          // Extract original email from anonymized email
          originalEmail: user.email.replace(/\.deleted\.\d+$/, ''),
          daysUntilPermanentDeletion: this.calculateDaysUntilPermanentDeletion(user.deletedAt!),
        })),
        total,
        pagination: {
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Failed to get soft deleted users:', error);
      throw error;
    }
  }

  /**
   * Clean up users past their grace period
   */
  async cleanupExpiredDeletions(): Promise<{
    processed: number;
    permanentlyDeleted: number;
    errors: number;
  }> {
    try {
      const cutoffDate = new Date(Date.now() - this.DEFAULT_GRACE_PERIOD * 24 * 60 * 60 * 1000);
      
      const expiredUsers = await this.deps.prisma.user.findMany({
        where: {
          deletedAt: {
            lt: cutoffDate,
          },
        },
        select: { id: true, email: true },
      });

      let permanentlyDeleted = 0;
      let errors = 0;

      for (const user of expiredUsers) {
        try {
          await this.permanentlyDeleteUser(user.id, 'system');
          permanentlyDeleted++;
        } catch (error) {
          logger.error('Failed to permanently delete expired user:', {
            userId: user.id,
            email: user.email,
            error,
          });
          errors++;
        }
      }

      logger.info('Cleanup expired deletions completed:', {
        processed: expiredUsers.length,
        permanentlyDeleted,
        errors,
      });

      return {
        processed: expiredUsers.length,
        permanentlyDeleted,
        errors,
      };
    } catch (error) {
      logger.error('Failed to cleanup expired deletions:', error);
      throw error;
    }
  }

  /**
   * Calculate days until permanent deletion
   */
  private calculateDaysUntilPermanentDeletion(deletedAt: Date): number {
    const gracePeriodEnds = new Date(deletedAt.getTime() + this.DEFAULT_GRACE_PERIOD * 24 * 60 * 60 * 1000);
    const now = new Date();
    const daysRemaining = Math.ceil((gracePeriodEnds.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
    return Math.max(0, daysRemaining);
  }

  /**
   * Send deletion notification email
   */
  private async sendDeletionNotification(
    email: string,
    name: string,
    gracePeriodEnds: Date
  ): Promise<void> {
    await this.deps.emailService.sendSecurityAlert({
      to: email,
      name,
      event: 'Account Deletion',
      timestamp: new Date().toLocaleString(),
      ipAddress: 'System',
      userAgent: 'Automated System',
    });
  }

  /**
   * Send restoration notification email
   */
  private async sendRestorationNotification(
    email: string,
    name: string
  ): Promise<void> {
    await this.deps.emailService.sendSecurityAlert({
      to: email,
      name,
      event: 'Account Restored',
      timestamp: new Date().toLocaleString(),
      ipAddress: 'System',
      userAgent: 'Automated System',
    });
  }
}

export function createSoftDeleteService(deps: SoftDeleteServiceDependencies): SoftDeleteService {
  return new SoftDeleteService(deps);
}