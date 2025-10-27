import { PrismaClient, User, UserStatus, UserRole } from '@zoptal/database';
import { logger } from '../utils/logger';
import { cacheManager } from '../utils/redis';
import { PasswordUtils } from '../utils/password';
import { createServiceError } from '../middleware/error-handler';
import { excludeDeleted, createAdminUserFilter, getUserCount } from '../utils/soft-delete-filters';

export interface AdminServiceDependencies {
  prisma: PrismaClient;
  forcePasswordResetService?: any; // Optional dependency
}

export interface UserSearchFilters {
  q?: string; // Search query
  status?: UserStatus;
  role?: UserRole;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  startDate?: Date;
  endDate?: Date;
  includeDeleted?: boolean; // Include soft-deleted users in search
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  verifiedUsers: number;
  usersRegisteredToday: number;
  usersRegisteredThisWeek: number;
  usersRegisteredThisMonth: number;
}

export interface SecurityEventSummary {
  totalEvents: number;
  criticalEvents: number;
  highSeverityEvents: number;
  mediumSeverityEvents: number;
  lowSeverityEvents: number;
}

export interface AuditLogEntry {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  targetUserId?: string;
  targetEmail?: string;
  details: Record<string, any>;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

export class AdminService {
  constructor(private deps: AdminServiceDependencies) {}

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<UserStats & {
    loginAttemptsToday: number;
    failedLoginsToday: number;
    activeSessions: number;
    top5Countries: Array<{ country: string; count: number }>;
    registrationTrend: Array<{ date: string; count: number }>;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);
    
    const thisMonth = new Date();
    thisMonth.setDate(thisMonth.getDate() - 30);

    // Use parallel queries for better performance
    const [
      totalUsers,
      activeUsers,
      suspendedUsers,
      verifiedUsers,
      usersToday,
      usersThisWeek,
      usersThisMonth,
      loginAttemptsToday,
      failedLoginsToday,
      activeSessions,
      topCountries,
      registrationTrend,
    ] = await Promise.all([
      this.deps.prisma.user.count({ where: getUserCount(false) }),
      this.deps.prisma.user.count({ where: createAdminUserFilter(false, { status: 'active' }) }),
      this.deps.prisma.user.count({ where: createAdminUserFilter(false, { status: 'suspended' }) }),
      this.deps.prisma.user.count({ 
        where: createAdminUserFilter(false, { 
          AND: [
            { isEmailVerified: true },
            { OR: [{ phone: null }, { isPhoneVerified: true }] }
          ]
        }) 
      }),
      this.deps.prisma.user.count({ where: createAdminUserFilter(false, { createdAt: { gte: today } }) }),
      this.deps.prisma.user.count({ where: createAdminUserFilter(false, { createdAt: { gte: thisWeek } }) }),
      this.deps.prisma.user.count({ where: createAdminUserFilter(false, { createdAt: { gte: thisMonth } }) }),
      this.deps.prisma.loginAttempt.count({ where: { createdAt: { gte: today } } }),
      this.deps.prisma.loginAttempt.count({ 
        where: { 
          createdAt: { gte: today },
          success: false 
        } 
      }),
      this.deps.prisma.refreshToken.count({ 
        where: { 
          expiresAt: { gt: new Date() },
          revokedAt: null 
        } 
      }),
      this.getTopCountries(),
      this.getRegistrationTrend(),
    ]);

    return {
      totalUsers,
      activeUsers,
      suspendedUsers,
      verifiedUsers,
      usersRegisteredToday: usersToday,
      usersRegisteredThisWeek: usersThisWeek,
      usersRegisteredThisMonth: usersThisMonth,
      loginAttemptsToday,
      failedLoginsToday,
      activeSessions,
      top5Countries: topCountries,
      registrationTrend,
    };
  }

  /**
   * Search users with advanced filters
   */
  async searchUsers(
    filters: UserSearchFilters,
    pagination: PaginationOptions
  ): Promise<{
    users: Array<User & { loginAttemptsCount: number; lastLoginAttempt?: Date }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    // Build dynamic where clause with soft delete handling
    const baseFilters: any = {};
    const includeDeleted = filters.includeDeleted || false;

    if (filters.q) {
      baseFilters.OR = [
        { email: { contains: filters.q, mode: 'insensitive' } },
        { firstName: { contains: filters.q, mode: 'insensitive' } },
        { lastName: { contains: filters.q, mode: 'insensitive' } },
        { phone: { contains: filters.q } },
      ];
    }

    if (filters.status) {
      baseFilters.status = filters.status;
    }

    if (filters.role) {
      baseFilters.role = filters.role;
    }

    if (filters.isEmailVerified !== undefined) {
      baseFilters.isEmailVerified = filters.isEmailVerified;
    }

    if (filters.isPhoneVerified !== undefined) {
      baseFilters.isPhoneVerified = filters.isPhoneVerified;
    }

    if (filters.startDate && filters.endDate) {
      baseFilters.createdAt = {
        gte: filters.startDate,
        lte: filters.endDate,
      };
    }

    const whereClause = createAdminUserFilter(includeDeleted, baseFilters);

    // Get users with related data
    const [users, total] = await Promise.all([
      this.deps.prisma.user.findMany({
        where: whereClause,
        include: {
          _count: {
            select: {
              loginAttempts: true,
            },
          },
          loginAttempts: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { createdAt: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      this.deps.prisma.user.count({ where: whereClause }),
    ]);

    // Transform the data
    const transformedUsers = users.map(user => ({
      ...user,
      loginAttemptsCount: user._count.loginAttempts,
      lastLoginAttempt: user.loginAttempts[0]?.createdAt,
      _count: undefined,
      loginAttempts: undefined,
    }));

    const totalPages = Math.ceil(total / limit);

    return {
      users: transformedUsers as any,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Update user status (suspend/activate)
   */
  async updateUserStatus(
    userId: string,
    status: UserStatus,
    adminId: string,
    reason?: string
  ): Promise<{ success: boolean; user: User }> {
    const user = await this.deps.prisma.user.findFirst({
      where: createAdminUserFilter(true, { id: userId }), // Include deleted for admin operations
    });

    if (!user) {
      throw createServiceError('USER_NOT_FOUND', 'User not found', 404);
    }

    // Prevent admins from suspending themselves
    if (userId === adminId && status === 'suspended') {
      throw createServiceError(
        'CANNOT_SUSPEND_SELF',
        'Cannot suspend your own account',
        400
      );
    }

    const updatedUser = await this.deps.prisma.user.update({
      where: { id: userId },
      data: { 
        status,
        suspendedAt: status === 'suspended' ? new Date() : null,
        suspendedReason: status === 'suspended' ? reason : null,
      },
    });

    // Log admin action
    await this.logAdminAction({
      adminId,
      action: status === 'suspended' ? 'USER_SUSPENDED' : 'USER_ACTIVATED',
      targetUserId: userId,
      details: { 
        previousStatus: user.status,
        newStatus: status,
        reason 
      },
    });

    // If suspending, revoke all user sessions
    if (status === 'suspended') {
      await this.deps.prisma.refreshToken.updateMany({
        where: { userId },
        data: { revokedAt: new Date() },
      });

      // Clear user sessions from cache
      const sessionKeys = await cacheManager.keys(`session:${userId}:*`);
      if (sessionKeys.length > 0) {
        await cacheManager.del(...sessionKeys);
      }
    }

    logger.info('User status updated:', {
      userId,
      adminId,
      previousStatus: user.status,
      newStatus: status,
      reason,
    });

    return { success: true, user: updatedUser };
  }

  /**
   * Force logout user from all devices
   */
  async forceLogoutUser(
    userId: string,
    adminId: string
  ): Promise<{ success: boolean; sessionsRevoked: number }> {
    const user = await this.deps.prisma.user.findFirst({
      where: createAdminUserFilter(true, { id: userId }), // Include deleted for admin operations
    });

    if (!user) {
      throw createServiceError('USER_NOT_FOUND', 'User not found', 404);
    }

    // Revoke all refresh tokens
    const result = await this.deps.prisma.refreshToken.updateMany({
      where: { 
        userId,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });

    // Clear all user sessions from cache
    const sessionKeys = await cacheManager.keys(`session:${userId}:*`);
    if (sessionKeys.length > 0) {
      await cacheManager.del(...sessionKeys);
    }

    // Log admin action
    await this.logAdminAction({
      adminId,
      action: 'FORCE_LOGOUT',
      targetUserId: userId,
      details: { 
        sessionsRevoked: result.count,
        targetEmail: user.email,
      },
    });

    logger.info('User force logged out:', {
      userId,
      adminId,
      sessionsRevoked: result.count,
    });

    return { 
      success: true, 
      sessionsRevoked: result.count 
    };
  }

  /**
   * Reset user password
   */
  async resetUserPassword(
    userId: string,
    newPassword: string,
    adminId: string,
    forceChangeOnLogin: boolean = true
  ): Promise<{ success: boolean }> {
    const user = await this.deps.prisma.user.findFirst({
      where: createAdminUserFilter(true, { id: userId }), // Include deleted for admin operations
    });

    if (!user) {
      throw createServiceError('USER_NOT_FOUND', 'User not found', 404);
    }

    // Hash the new password
    const hashedPassword = await PasswordUtils.hash(newPassword);

    // Update user password
    await this.deps.prisma.user.update({
      where: { id: userId },
      data: { 
        password: hashedPassword,
        passwordChangedAt: new Date(),
        forcePasswordChange: forceChangeOnLogin,
      },
    });

    // Revoke all sessions to force re-login
    await this.deps.prisma.refreshToken.updateMany({
      where: { userId },
      data: { revokedAt: new Date() },
    });

    // Log admin action
    await this.logAdminAction({
      adminId,
      action: 'PASSWORD_RESET',
      targetUserId: userId,
      details: { 
        targetEmail: user.email,
        forceChangeOnLogin,
      },
    });

    logger.info('User password reset by admin:', {
      userId,
      adminId,
      forceChangeOnLogin,
    });

    return { success: true };
  }

  /**
   * Force user to reset password on next login
   */
  async forcePasswordReset(
    userId: string,
    adminId: string,
    reason?: string
  ): Promise<{ success: boolean }> {
    if (!this.deps.forcePasswordResetService) {
      throw createServiceError(
        'SERVICE_UNAVAILABLE',
        'Force password reset service not available',
        503
      );
    }

    const user = await this.deps.prisma.user.findFirst({
      where: createAdminUserFilter(true, { id: userId }), // Include deleted for admin operations
    });

    if (!user) {
      throw createServiceError('USER_NOT_FOUND', 'User not found', 404);
    }

    try {
      await this.deps.forcePasswordResetService.forcePasswordReset(userId, adminId, {
        reason: reason || 'Administrative requirement',
        notifyUser: true,
        revokeAllSessions: true,
      });

      // Log admin action
      await this.logAdminAction({
        adminId,
        action: 'FORCE_PASSWORD_RESET',
        targetUserId: userId,
        details: { 
          targetEmail: user.email,
          reason,
        },
      });

      logger.info('User password reset forced by admin:', {
        userId,
        adminId,
        reason,
      });

      return { success: true };
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
    adminId: string
  ): Promise<{ success: boolean }> {
    if (!this.deps.forcePasswordResetService) {
      throw createServiceError(
        'SERVICE_UNAVAILABLE',
        'Force password reset service not available',
        503
      );
    }

    const user = await this.deps.prisma.user.findFirst({
      where: createAdminUserFilter(true, { id: userId }),
    });

    if (!user) {
      throw createServiceError('USER_NOT_FOUND', 'User not found', 404);
    }

    try {
      await this.deps.forcePasswordResetService.clearForcePasswordReset(userId, adminId);

      // Log admin action
      await this.logAdminAction({
        adminId,
        action: 'FORCE_PASSWORD_RESET_CLEARED',
        targetUserId: userId,
        details: { 
          targetEmail: user.email,
        },
      });

      logger.info('Force password reset cleared by admin:', {
        userId,
        adminId,
      });

      return { success: true };
    } catch (error) {
      logger.error('Failed to clear force password reset:', { userId, adminId, error });
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
  ): Promise<any> {
    if (!this.deps.forcePasswordResetService) {
      throw createServiceError(
        'SERVICE_UNAVAILABLE',
        'Force password reset service not available',
        503
      );
    }

    try {
      return await this.deps.forcePasswordResetService.getForcedResetUsers(
        page,
        limit,
        includeExpired
      );
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
    reason?: string
  ): Promise<any> {
    if (!this.deps.forcePasswordResetService) {
      throw createServiceError(
        'SERVICE_UNAVAILABLE',
        'Force password reset service not available',
        503
      );
    }

    try {
      const result = await this.deps.forcePasswordResetService.bulkForcePasswordReset(
        userIds,
        adminId,
        {
          reason: reason || 'Bulk administrative requirement',
          notifyUser: true,
          revokeAllSessions: true,
        }
      );

      // Log admin action
      await this.logAdminAction({
        adminId,
        action: 'BULK_FORCE_PASSWORD_RESET',
        details: { 
          userIds,
          reason,
          processed: result.processed,
          failed: result.failed.length,
        },
      });

      logger.info('Bulk force password reset completed by admin:', {
        adminId,
        totalUsers: userIds.length,
        processed: result.processed,
        failed: result.failed.length,
      });

      return result;
    } catch (error) {
      logger.error('Failed to bulk force password reset:', { adminId, error });
      throw error;
    }
  }

  /**
   * Get user activity logs
   */
  async getUserActivity(
    userId: string,
    pagination: PaginationOptions
  ): Promise<{
    loginAttempts: any[];
    securityEvents: any[];
    pagination: any;
  }> {
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    const [loginAttempts, securityEvents, totalLoginAttempts] = await Promise.all([
      this.deps.prisma.loginAttempt.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      this.deps.prisma.securityEvent.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20, // Recent security events
      }),
      this.deps.prisma.loginAttempt.count({ where: { userId } }),
    ]);

    const totalPages = Math.ceil(totalLoginAttempts / limit);

    return {
      loginAttempts,
      securityEvents,
      pagination: {
        page,
        limit,
        total: totalLoginAttempts,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Get security events with filtering
   */
  async getSecurityEvents(
    filters: {
      severity?: string;
      type?: string;
      startDate?: Date;
      endDate?: Date;
    },
    pagination: PaginationOptions
  ): Promise<{
    events: any[];
    summary: SecurityEventSummary;
    pagination: any;
  }> {
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    const whereClause: any = {};

    if (filters.severity) {
      whereClause.severity = filters.severity;
    }

    if (filters.type) {
      whereClause.type = filters.type;
    }

    if (filters.startDate && filters.endDate) {
      whereClause.createdAt = {
        gte: filters.startDate,
        lte: filters.endDate,
      };
    }

    const [events, total, summary] = await Promise.all([
      this.deps.prisma.securityEvent.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      this.deps.prisma.securityEvent.count({ where: whereClause }),
      this.getSecurityEventSummary(whereClause),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      events,
      summary,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Bulk update users
   */
  async bulkUpdateUsers(
    userIds: string[],
    updates: {
      status?: UserStatus;
      role?: UserRole;
    },
    adminId: string,
    reason?: string
  ): Promise<{
    success: boolean;
    updatedCount: number;
    failedCount: number;
    errors: any[];
  }> {
    const errors: any[] = [];
    let updatedCount = 0;

    for (const userId of userIds) {
      try {
        // Prevent admin from changing their own role to non-admin
        if (userId === adminId && updates.role && !['admin', 'super_admin'].includes(updates.role)) {
          errors.push({
            userId,
            error: 'Cannot remove admin privileges from your own account',
          });
          continue;
        }

        await this.deps.prisma.user.update({
          where: { id: userId },
          data: updates,
        });

        // Log admin action
        await this.logAdminAction({
          adminId,
          action: 'BULK_UPDATE',
          targetUserId: userId,
          details: { updates, reason },
        });

        updatedCount++;
      } catch (error) {
        errors.push({
          userId,
          error: error.message,
        });
      }
    }

    logger.info('Bulk user update completed:', {
      adminId,
      totalUsers: userIds.length,
      updatedCount,
      failedCount: errors.length,
      updates,
    });

    return {
      success: true,
      updatedCount,
      failedCount: errors.length,
      errors,
    };
  }

  /**
   * Get audit logs
   */
  async getAuditLogs(
    filters: {
      action?: string;
      userId?: string;
      adminId?: string;
      startDate?: Date;
      endDate?: Date;
    },
    pagination: PaginationOptions
  ): Promise<{
    logs: AuditLogEntry[];
    pagination: any;
  }> {
    // For now, return security events as audit logs
    // In a full implementation, you'd have a separate audit_logs table
    const whereClause: any = {};

    if (filters.action) {
      whereClause.type = filters.action;
    }

    if (filters.userId) {
      whereClause.userId = filters.userId;
    }

    if (filters.startDate && filters.endDate) {
      whereClause.createdAt = {
        gte: filters.startDate,
        lte: filters.endDate,
      };
    }

    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    const [events, total] = await Promise.all([
      this.deps.prisma.securityEvent.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      this.deps.prisma.securityEvent.count({ where: whereClause }),
    ]);

    const logs = events.map(event => ({
      id: event.id,
      adminId: 'system', // Would come from metadata in real implementation
      adminEmail: 'system@zoptal.com',
      action: event.type,
      targetUserId: event.userId,
      targetEmail: event.user?.email,
      details: event.metadata || {},
      timestamp: event.createdAt,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
    }));

    const totalPages = Math.ceil(total / limit);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Log admin action
   */
  private async logAdminAction({
    adminId,
    action,
    targetUserId,
    details,
    ipAddress,
    userAgent,
  }: {
    adminId: string;
    action: string;
    targetUserId?: string;
    details: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    await this.deps.prisma.securityEvent.create({
      data: {
        type: action as any,
        description: `Admin action: ${action}`,
        severity: 'MEDIUM',
        userId: targetUserId,
        metadata: {
          adminId,
          action,
          ...details,
        },
        ipAddress,
        userAgent,
      },
    });
  }

  /**
   * Get top countries by user count
   */
  private async getTopCountries(): Promise<Array<{ country: string; count: number }>> {
    // This would typically come from login attempts or user profiles
    // For now, return mock data
    return [
      { country: 'US', count: 3456 },
      { country: 'UK', count: 1234 },
      { country: 'CA', count: 987 },
      { country: 'AU', count: 654 },
      { country: 'DE', count: 432 },
    ];
  }

  /**
   * Get registration trend data
   */
  private async getRegistrationTrend(): Promise<Array<{ date: string; count: number }>> {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date;
    }).reverse();

    const trendData = await Promise.all(
      last30Days.map(async (date) => {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        
        const count = await this.deps.prisma.user.count({
          where: createAdminUserFilter(false, {
            createdAt: {
              gte: date,
              lt: nextDay,
            },
          }),
        });

        return {
          date: date.toISOString().split('T')[0],
          count,
        };
      })
    );

    return trendData;
  }

  /**
   * Get security event summary
   */
  private async getSecurityEventSummary(whereClause: any): Promise<SecurityEventSummary> {
    const [total, critical, high, medium, low] = await Promise.all([
      this.deps.prisma.securityEvent.count({ where: whereClause }),
      this.deps.prisma.securityEvent.count({ 
        where: { ...whereClause, severity: 'CRITICAL' } 
      }),
      this.deps.prisma.securityEvent.count({ 
        where: { ...whereClause, severity: 'HIGH' } 
      }),
      this.deps.prisma.securityEvent.count({ 
        where: { ...whereClause, severity: 'MEDIUM' } 
      }),
      this.deps.prisma.securityEvent.count({ 
        where: { ...whereClause, severity: 'LOW' } 
      }),
    ]);

    return {
      totalEvents: total,
      criticalEvents: critical,
      highSeverityEvents: high,
      mediumSeverityEvents: medium,
      lowSeverityEvents: low,
    };
  }
}

export function createAdminService(deps: AdminServiceDependencies): AdminService {
  return new AdminService(deps);
}