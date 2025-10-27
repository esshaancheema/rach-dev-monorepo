import { PrismaClient } from '@zoptal/database';
import { logger } from '../utils/logger';
import { hashPassword, comparePassword } from '../utils/password';

export interface PasswordHistoryServiceDependencies {
  prisma: PrismaClient;
}

export interface PasswordHistoryEntry {
  id: string;
  userId: string;
  passwordHash: string;
  createdAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface PasswordValidationResult {
  isValid: boolean;
  reason?: string;
  conflictDate?: Date;
}

export class PasswordHistoryService {
  private readonly DEFAULT_HISTORY_LIMIT = 12; // Prevent reuse of last 12 passwords
  private readonly HISTORY_RETENTION_DAYS = 365; // Keep history for 1 year

  constructor(private deps: PasswordHistoryServiceDependencies) {}

  /**
   * Add password to user's history
   */
  async addPasswordToHistory(
    userId: string,
    passwordHash: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      // Add new password to history
      await this.deps.prisma.passwordHistory.create({
        data: {
          userId,
          passwordHash,
          ipAddress,
          userAgent,
        },
      });

      // Clean up old entries to maintain history limit
      await this.cleanupOldPasswords(userId);

      logger.info('Password added to history:', {
        userId,
        ipAddress,
      });
    } catch (error) {
      logger.error('Failed to add password to history:', error);
      throw new Error('HISTORY_UPDATE_FAILED');
    }
  }

  /**
   * Validate new password against history
   */
  async validatePasswordAgainstHistory(
    userId: string,
    newPassword: string,
    historyLimit?: number
  ): Promise<PasswordValidationResult> {
    try {
      const limit = historyLimit || this.DEFAULT_HISTORY_LIMIT;

      // Get recent password history
      const passwordHistory = await this.deps.prisma.passwordHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      // Check against each historical password
      for (const entry of passwordHistory) {
        const isMatch = await comparePassword(newPassword, entry.passwordHash);
        if (isMatch) {
          logger.warn('Password reuse attempt detected:', {
            userId,
            conflictDate: entry.createdAt,
          });

          return {
            isValid: false,
            reason: 'PASSWORD_RECENTLY_USED',
            conflictDate: entry.createdAt,
          };
        }
      }

      return {
        isValid: true,
      };
    } catch (error) {
      logger.error('Failed to validate password against history:', error);
      
      // In case of error, allow password change but log the issue
      // This prevents system failures from blocking legitimate password changes
      return {
        isValid: true,
        reason: 'VALIDATION_ERROR_ALLOWED',
      };
    }
  }

  /**
   * Get user's password history summary
   */
  async getPasswordHistorySummary(userId: string): Promise<{
    totalPasswords: number;
    oldestPassword: Date | null;
    newestPassword: Date | null;
    averageDaysBetweenChanges: number | null;
  }> {
    try {
      const history = await this.deps.prisma.passwordHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: {
          createdAt: true,
        },
      });

      if (history.length === 0) {
        return {
          totalPasswords: 0,
          oldestPassword: null,
          newestPassword: null,
          averageDaysBetweenChanges: null,
        };
      }

      const dates = history.map(h => h.createdAt);
      const oldestPassword = dates[dates.length - 1];
      const newestPassword = dates[0];

      // Calculate average days between password changes
      let averageDaysBetweenChanges: number | null = null;
      if (history.length > 1) {
        const totalDays = (newestPassword.getTime() - oldestPassword.getTime()) / (1000 * 60 * 60 * 24);
        averageDaysBetweenChanges = Math.round(totalDays / (history.length - 1));
      }

      return {
        totalPasswords: history.length,
        oldestPassword,
        newestPassword,
        averageDaysBetweenChanges,
      };
    } catch (error) {
      logger.error('Failed to get password history summary:', error);
      throw new Error('HISTORY_SUMMARY_FAILED');
    }
  }

  /**
   * Check if user needs to change password (based on age)
   */
  async checkPasswordAge(userId: string, maxDays: number = 90): Promise<{
    needsChange: boolean;
    daysSinceLastChange: number | null;
    lastPasswordDate: Date | null;
  }> {
    try {
      const latestPassword = await this.deps.prisma.passwordHistory.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      });

      if (!latestPassword) {
        return {
          needsChange: true,
          daysSinceLastChange: null,
          lastPasswordDate: null,
        };
      }

      const daysSinceLastChange = Math.floor(
        (Date.now() - latestPassword.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        needsChange: daysSinceLastChange > maxDays,
        daysSinceLastChange,
        lastPasswordDate: latestPassword.createdAt,
      };
    } catch (error) {
      logger.error('Failed to check password age:', error);
      throw new Error('PASSWORD_AGE_CHECK_FAILED');
    }
  }

  /**
   * Get password security score based on history patterns
   */
  async getPasswordSecurityScore(userId: string): Promise<{
    score: number; // 0-100
    factors: {
      historyLength: number;
      changeFrequency: number;
      recentChanges: number;
      diversityScore: number;
    };
    recommendations: string[];
  }> {
    try {
      const history = await this.deps.prisma.passwordHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20, // Analyze last 20 passwords
      });

      const recommendations: string[] = [];
      let score = 0;

      // Factor 1: History length (0-25 points)
      const historyLength = Math.min(history.length, 12);
      const historyScore = (historyLength / 12) * 25;
      score += historyScore;

      if (historyLength < 3) {
        recommendations.push('Consider changing your password regularly for better security');
      }

      // Factor 2: Change frequency (0-25 points)
      let changeFrequencyScore = 0;
      if (history.length > 1) {
        const daysSinceFirst = (Date.now() - history[history.length - 1].createdAt.getTime()) / (1000 * 60 * 60 * 24);
        const averageDaysBetween = daysSinceFirst / (history.length - 1);
        
        // Optimal: 30-90 days between changes
        if (averageDaysBetween >= 30 && averageDaysBetween <= 90) {
          changeFrequencyScore = 25;
        } else if (averageDaysBetween >= 15 && averageDaysBetween <= 180) {
          changeFrequencyScore = 15;
        } else {
          changeFrequencyScore = 5;
          if (averageDaysBetween > 180) {
            recommendations.push('Consider changing your password more frequently');
          }
        }
      }
      score += changeFrequencyScore;

      // Factor 3: Recent changes (0-25 points)
      const recentChanges = history.filter(h => 
        (Date.now() - h.createdAt.getTime()) <= (90 * 24 * 60 * 60 * 1000) // Last 90 days
      ).length;
      const recentChangesScore = Math.min(recentChanges, 3) * 8.33; // Max 25 points
      score += recentChangesScore;

      if (recentChanges === 0) {
        recommendations.push('Your password is quite old - consider updating it');
      }

      // Factor 4: Password diversity (0-25 points)
      // This is a simplified diversity check based on creation patterns
      let diversityScore = 15; // Default moderate score
      if (history.length >= 3) {
        const intervals = [];
        for (let i = 0; i < history.length - 1; i++) {
          const interval = history[i].createdAt.getTime() - history[i + 1].createdAt.getTime();
          intervals.push(interval);
        }
        
        // Check if intervals are too regular (might indicate predictable pattern)
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const variance = intervals.reduce((acc, interval) => acc + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
        const stdDev = Math.sqrt(variance);
        
        // Higher variance in timing = better diversity
        if (stdDev > avgInterval * 0.5) {
          diversityScore = 25;
        } else if (stdDev < avgInterval * 0.1) {
          diversityScore = 5;
          recommendations.push('Avoid changing passwords at regular intervals');
        }
      }
      score += diversityScore;

      // Ensure score is within bounds
      score = Math.round(Math.max(0, Math.min(100, score)));

      if (score < 50) {
        recommendations.push('Consider implementing a more robust password management strategy');
      }

      return {
        score,
        factors: {
          historyLength: historyScore,
          changeFrequency: changeFrequencyScore,
          recentChanges: recentChangesScore,
          diversityScore,
        },
        recommendations,
      };
    } catch (error) {
      logger.error('Failed to calculate password security score:', error);
      throw new Error('SECURITY_SCORE_FAILED');
    }
  }

  /**
   * Clean up old password history entries
   */
  private async cleanupOldPasswords(userId: string): Promise<void> {
    try {
      // Get all password history entries for user
      const allPasswords = await this.deps.prisma.passwordHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      // Remove entries beyond the limit
      if (allPasswords.length > this.DEFAULT_HISTORY_LIMIT) {
        const toDelete = allPasswords.slice(this.DEFAULT_HISTORY_LIMIT);
        const deleteIds = toDelete.map(p => p.id);

        await this.deps.prisma.passwordHistory.deleteMany({
          where: {
            id: { in: deleteIds },
          },
        });

        logger.debug('Cleaned up old password history entries:', {
          userId,
          deletedCount: deleteIds.length,
        });
      }

      // Also remove entries older than retention period
      const cutoffDate = new Date(Date.now() - this.HISTORY_RETENTION_DAYS * 24 * 60 * 60 * 1000);
      const deletedOld = await this.deps.prisma.passwordHistory.deleteMany({
        where: {
          userId,
          createdAt: { lt: cutoffDate },
        },
      });

      if (deletedOld.count > 0) {
        logger.debug('Cleaned up expired password history entries:', {
          userId,
          deletedCount: deletedOld.count,
        });
      }
    } catch (error) {
      logger.error('Failed to cleanup old passwords:', error);
      // Don't throw error - this is a cleanup operation
    }
  }

  /**
   * Get detailed password history for admin/security purposes
   */
  async getPasswordHistory(
    userId: string,
    limit: number = 50,
    includeHashes: boolean = false
  ): Promise<PasswordHistoryEntry[]> {
    try {
      const history = await this.deps.prisma.passwordHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          userId: true,
          passwordHash: includeHashes,
          createdAt: true,
          ipAddress: true,
          userAgent: true,
        },
      });

      return history.map(entry => ({
        ...entry,
        passwordHash: includeHashes ? entry.passwordHash : '[REDACTED]',
      })) as PasswordHistoryEntry[];
    } catch (error) {
      logger.error('Failed to get password history:', error);
      throw new Error('HISTORY_RETRIEVAL_FAILED');
    }
  }

  /**
   * Clear all password history for a user (for account deletion)
   */
  async clearPasswordHistory(userId: string): Promise<number> {
    try {
      const result = await this.deps.prisma.passwordHistory.deleteMany({
        where: { userId },
      });

      logger.info('Password history cleared:', {
        userId,
        deletedCount: result.count,
      });

      return result.count;
    } catch (error) {
      logger.error('Failed to clear password history:', error);
      throw new Error('HISTORY_CLEAR_FAILED');
    }
  }
}

export function createPasswordHistoryService(deps: PasswordHistoryServiceDependencies): PasswordHistoryService {
  return new PasswordHistoryService(deps);
}