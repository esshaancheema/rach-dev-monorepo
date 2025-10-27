import { PrismaClient } from '@zoptal/database';
import { logger } from '../utils/logger';
import { RedisClient } from '../utils/redis';

export interface DashboardStats {
  users: {
    total: number;
    active: number;
    inactive: number;
    newToday: number;
    newThisWeek: number;
    newThisMonth: number;
    deletedUsers: number;
    verifiedEmails: number;
    verifiedPhones: number;
    twoFactorEnabled: number;
  };
  sessions: {
    activeSessions: number;
    totalSessionsToday: number;
    averageSessionDuration: number;
    peakConcurrentSessions: number;
    uniqueVisitorsToday: number;
  };
  security: {
    failedLoginsToday: number;
    blockedIPsToday: number;
    suspiciousActivities: number;
    accountLocksToday: number;
    passwordResetsToday: number;
  };
  system: {
    uptime: number;
    memoryUsage: number;
    cpuUsage: number;
    diskUsage: number;
    databaseConnections: number;
    redisConnections: number;
    apiResponseTime: number;
    errorRate: number;
  };
  webhooks: {
    totalWebhooks: number;
    activeWebhooks: number;
    deliveriesToday: number;
    successRate: number;
    failedDeliveries: number;
  };
  backup: {
    lastBackupTime: Date | null;
    lastBackupSize: number;
    backupStatus: 'success' | 'failed' | 'in_progress' | 'none';
    nextScheduledBackup: Date | null;
  };
}

export interface UserActivitySummary {
  userId: string;
  email: string;
  profile?: {
    firstName?: string;
    lastName?: string;
  };
  lastLoginAt: Date | null;
  loginCount: number;
  failedLoginCount: number;
  sessionCount: number;
  accountStatus: 'active' | 'inactive' | 'locked' | 'deleted';
  riskScore: number;
  createdAt: Date;
  lastActivityAt: Date | null;
  deviceCount: number;
  locationCount: number;
}

export interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info' | 'critical';
  category: 'system' | 'security' | 'performance' | 'user' | 'backup';
  title: string;
  message: string;
  metadata?: Record<string, any>;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  createdAt: Date;
  resolvedAt?: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface AdminAction {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  category: string;
  targetUserId?: string;
  targetUserEmail?: string;
  description: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

interface AdminDashboardServiceDependencies {
  prisma: PrismaClient;
  redis: any;
}

export function createAdminDashboardService({
  prisma,
  redis
}: AdminDashboardServiceDependencies) {

  /**
   * Get comprehensive dashboard statistics
   */
  async function getDashboardStats(): Promise<DashboardStats> {
    try {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      // User statistics
      const [
        totalUsers,
        activeUsers,
        newUsersToday,
        newUsersWeek,
        newUsersMonth,
        deletedUsers,
        verifiedEmails,
        verifiedPhones,
        twoFactorUsers
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { status: 'ACTIVE' } }),
        prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
        prisma.user.count({ where: { createdAt: { gte: weekStart } } }),
        prisma.user.count({ where: { createdAt: { gte: monthStart } } }),
        prisma.user.count({ where: { deletedAt: { not: null } } }),
        prisma.user.count({ where: { emailVerifiedAt: { not: null } } }),
        prisma.user.count({ where: { phoneVerifiedAt: { not: null } } }),
        prisma.user.count({ 
          where: { 
            twoFactorEnabled: true,
            twoFactorSecret: { not: null }
          } 
        })
      ]);

      // Session statistics
      const sessionStats = await getSessionStatistics();

      // Security statistics
      const securityStats = await getSecurityStatistics(todayStart);

      // System statistics
      const systemStats = await getSystemStatistics();

      // Webhook statistics
      const webhookStats = await getWebhookStatistics();

      // Backup statistics
      const backupStats = await getBackupStatistics();

      return {
        users: {
          total: totalUsers,
          active: activeUsers,
          inactive: totalUsers - activeUsers,
          newToday: newUsersToday,
          newThisWeek: newUsersWeek,
          newThisMonth: newUsersMonth,
          deletedUsers,
          verifiedEmails,
          verifiedPhones,
          twoFactorEnabled: twoFactorUsers
        },
        sessions: sessionStats,
        security: securityStats,
        system: systemStats,
        webhooks: webhookStats,
        backup: backupStats
      };

    } catch (error) {
      logger.error({ error }, 'Failed to get dashboard stats');
      throw error;
    }
  }

  /**
   * Get user activity summary with pagination
   */
  async function getUserActivitySummary(
    page: number = 1,
    limit: number = 50,
    filters: {
      status?: 'active' | 'inactive' | 'locked' | 'deleted';
      riskLevel?: 'low' | 'medium' | 'high';
      sortBy?: 'lastLogin' | 'createdAt' | 'loginCount' | 'riskScore';
      sortOrder?: 'asc' | 'desc';
    } = {}
  ): Promise<{
    users: UserActivitySummary[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    try {
      const offset = (page - 1) * limit;
      const { status, riskLevel, sortBy = 'lastLogin', sortOrder = 'desc' } = filters;

      // Build where clause
      const whereClause: any = {};
      if (status) {
        if (status === 'deleted') {
          whereClause.deletedAt = { not: null };
        } else if (status === 'locked') {
          whereClause.status = 'LOCKED';
        } else if (status === 'inactive') {
          whereClause.status = 'INACTIVE';
        } else {
          whereClause.status = 'ACTIVE';
          whereClause.deletedAt = null;
        }
      }

      // Get users with activity data
      const users = await prisma.user.findMany({
        where: whereClause,
        include: {
          profile: true,
          _count: {
            select: {
              activityLogs: {
                where: {
                  action: { in: ['LOGIN_SUCCESS', 'LOGIN_FAILED'] }
                }
              }
            }
          }
        },
        skip: offset,
        take: limit,
        orderBy: getOrderByClause(sortBy, sortOrder)
      });

      const total = await prisma.user.count({ where: whereClause });

      // Enhance with activity data
      const userSummaries = await Promise.all(
        users.map(async (user) => {
          const activityData = await getUserActivityData(user.id);
          
          return {
            userId: user.id,
            email: user.email,
            profile: user.profile ? {
              firstName: user.profile.firstName,
              lastName: user.profile.lastName
            } : undefined,
            lastLoginAt: activityData.lastLoginAt,
            loginCount: activityData.loginCount,
            failedLoginCount: activityData.failedLoginCount,
            sessionCount: activityData.sessionCount,
            accountStatus: getAccountStatus(user),
            riskScore: await calculateRiskScore(user.id),
            createdAt: user.createdAt,
            lastActivityAt: activityData.lastActivityAt,
            deviceCount: activityData.deviceCount,
            locationCount: activityData.locationCount
          };
        })
      );

      // Filter by risk level if specified
      let filteredUsers = userSummaries;
      if (riskLevel) {
        filteredUsers = userSummaries.filter(user => {
          if (riskLevel === 'low') return user.riskScore <= 30;
          if (riskLevel === 'medium') return user.riskScore > 30 && user.riskScore <= 70;
          if (riskLevel === 'high') return user.riskScore > 70;
          return true;
        });
      }

      return {
        users: filteredUsers,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };

    } catch (error) {
      logger.error({ error }, 'Failed to get user activity summary');
      throw error;
    }
  }

  /**
   * Get system alerts
   */
  async function getSystemAlerts(
    acknowledged?: boolean,
    category?: SystemAlert['category'],
    priority?: SystemAlert['priority'],
    limit: number = 100
  ): Promise<SystemAlert[]> {
    try {
      const whereClause: any = {
        category: 'SYSTEM'
      };

      if (acknowledged !== undefined) {
        whereClause.metadata = {
          path: ['acknowledged'],
          equals: acknowledged
        };
      }

      if (category) {
        whereClause.metadata = {
          ...whereClause.metadata,
          path: ['category'],
          equals: category
        };
      }

      if (priority) {
        whereClause.metadata = {
          ...whereClause.metadata,
          path: ['priority'],
          equals: priority
        };
      }

      const activities = await prisma.activityLog.findMany({
        where: {
          action: { in: ['SYSTEM_ALERT', 'SECURITY_ALERT', 'PERFORMANCE_ALERT'] },
          ...whereClause
        },
        orderBy: { createdAt: 'desc' },
        take: limit
      });

      return activities.map(activity => ({
        id: activity.id,
        type: (activity.metadata as any)?.type || 'info',
        category: (activity.metadata as any)?.category || 'system',
        title: (activity.metadata as any)?.title || 'System Alert',
        message: (activity.metadata as any)?.message || '',
        metadata: (activity.metadata as any)?.metadata,
        acknowledged: (activity.metadata as any)?.acknowledged || false,
        acknowledgedBy: (activity.metadata as any)?.acknowledgedBy,
        acknowledgedAt: (activity.metadata as any)?.acknowledgedAt ? 
          new Date((activity.metadata as any).acknowledgedAt) : undefined,
        createdAt: activity.createdAt,
        resolvedAt: (activity.metadata as any)?.resolvedAt ? 
          new Date((activity.metadata as any).resolvedAt) : undefined,
        priority: (activity.metadata as any)?.priority || 'medium'
      }));

    } catch (error) {
      logger.error({ error }, 'Failed to get system alerts');
      throw error;
    }
  }

  /**
   * Create system alert
   */
  async function createSystemAlert(alert: Omit<SystemAlert, 'id' | 'createdAt' | 'acknowledged'>): Promise<SystemAlert> {
    try {
      const alertWithDefaults: SystemAlert = {
        id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
        ...alert,
        acknowledged: false,
        createdAt: new Date()
      };

      await prisma.activityLog.create({
        data: {
          userId: 'system',
          action: `${alert.category.toUpperCase()}_ALERT`,
          category: 'SYSTEM',
          ip: '127.0.0.1',
          userAgent: 'System',
          metadata: alertWithDefaults
        }
      });

      logger.info({
        alertId: alertWithDefaults.id,
        type: alert.type,
        category: alert.category,
        priority: alert.priority
      }, 'System alert created');

      return alertWithDefaults;

    } catch (error) {
      logger.error({ error, alert }, 'Failed to create system alert');
      throw error;
    }
  }

  /**
   * Acknowledge system alert
   */
  async function acknowledgeAlert(
    alertId: string,
    acknowledgedBy: string
  ): Promise<void> {
    try {
      // Find the alert
      const activity = await prisma.activityLog.findFirst({
        where: {
          metadata: {
            path: ['id'],
            equals: alertId
          }
        }
      });

      if (!activity) {
        throw new Error('Alert not found');
      }

      // Update alert
      const updatedMetadata = {
        ...activity.metadata,
        acknowledged: true,
        acknowledgedBy,
        acknowledgedAt: new Date().toISOString()
      };

      await prisma.activityLog.update({
        where: { id: activity.id },
        data: { metadata: updatedMetadata }
      });

      logger.info({ alertId, acknowledgedBy }, 'System alert acknowledged');

    } catch (error) {
      logger.error({ error, alertId }, 'Failed to acknowledge alert');
      throw error;
    }
  }

  /**
   * Get admin actions log
   */
  async function getAdminActions(
    adminId?: string,
    category?: string,
    limit: number = 100
  ): Promise<AdminAction[]> {
    try {
      const whereClause: any = {
        category: 'ADMIN'
      };

      if (adminId) {
        whereClause.userId = adminId;
      }

      if (category) {
        whereClause.action = { contains: category.toUpperCase() };
      }

      const activities = await prisma.activityLog.findMany({
        where: whereClause,
        include: {
          user: {
            select: { email: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit
      });

      return activities.map(activity => ({
        id: activity.id,
        adminId: activity.userId,
        adminEmail: activity.user?.email || 'Unknown',
        action: activity.action,
        category: activity.category,
        targetUserId: (activity.metadata as any)?.targetUserId,
        targetUserEmail: (activity.metadata as any)?.targetUserEmail,
        description: (activity.metadata as any)?.description || activity.action,
        ipAddress: activity.ip,
        userAgent: activity.userAgent,
        success: (activity.metadata as any)?.success !== false,
        error: (activity.metadata as any)?.error,
        metadata: activity.metadata as Record<string, any>,
        timestamp: activity.createdAt
      }));

    } catch (error) {
      logger.error({ error }, 'Failed to get admin actions');
      throw error;
    }
  }

  /**
   * Get system health summary
   */
  async function getSystemHealth(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    components: Array<{
      name: string;
      status: 'healthy' | 'warning' | 'critical';
      responseTime?: number;
      errorRate?: number;
      details?: string;
    }>;
    uptime: number;
    version: string;
    environment: string;
  }> {
    try {
      const components = [];
      let overallStatus: 'healthy' | 'warning' | 'critical' = 'healthy';

      // Database health
      try {
        const dbStart = Date.now();
        await prisma.user.count();
        const dbResponseTime = Date.now() - dbStart;
        
        components.push({
          name: 'Database',
          status: dbResponseTime > 1000 ? 'warning' : 'healthy',
          responseTime: dbResponseTime,
          details: `Response time: ${dbResponseTime}ms`
        });

        if (dbResponseTime > 1000) overallStatus = 'warning';
      } catch (error) {
        components.push({
          name: 'Database',
          status: 'critical',
          details: 'Database connection failed'
        });
        overallStatus = 'critical';
      }

      // Redis health
      try {
        const redisStart = Date.now();
        await redis.ping();
        const redisResponseTime = Date.now() - redisStart;
        
        components.push({
          name: 'Redis',
          status: redisResponseTime > 500 ? 'warning' : 'healthy',
          responseTime: redisResponseTime,
          details: `Response time: ${redisResponseTime}ms`
        });

        if (redisResponseTime > 500 && overallStatus === 'healthy') {
          overallStatus = 'warning';
        }
      } catch (error) {
        components.push({
          name: 'Redis',
          status: 'critical',
          details: 'Redis connection failed'
        });
        overallStatus = 'critical';
      }

      // Memory usage
      const memoryUsage = process.memoryUsage();
      const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
      
      components.push({
        name: 'Memory',
        status: memoryUsagePercent > 90 ? 'critical' : memoryUsagePercent > 70 ? 'warning' : 'healthy',
        details: `${Math.round(memoryUsagePercent)}% used`
      });

      if (memoryUsagePercent > 90) {
        overallStatus = 'critical';
      } else if (memoryUsagePercent > 70 && overallStatus === 'healthy') {
        overallStatus = 'warning';
      }

      return {
        status: overallStatus,
        components,
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      };

    } catch (error) {
      logger.error({ error }, 'Failed to get system health');
      throw error;
    }
  }

  /**
   * Helper functions
   */
  async function getSessionStatistics() {
    try {
      const activeSessions = await redis.get('metrics:active_sessions') || 0;
      const todayLogins = await redis.get('metrics:current_hour_logins') || 0;
      
      return {
        activeSessions: parseInt(activeSessions),
        totalSessionsToday: parseInt(todayLogins),
        averageSessionDuration: 0, // Would need session analytics service
        peakConcurrentSessions: 0, // Would need session analytics service
        uniqueVisitorsToday: 0 // Would need session analytics service
      };
    } catch (error) {
      return {
        activeSessions: 0,
        totalSessionsToday: 0,
        averageSessionDuration: 0,
        peakConcurrentSessions: 0,
        uniqueVisitorsToday: 0
      };
    }
  }

  async function getSecurityStatistics(todayStart: Date) {
    try {
      const [
        failedLogins,
        accountLocks,
        passwordResets,
        suspiciousActivities
      ] = await Promise.all([
        prisma.activityLog.count({
          where: {
            action: 'LOGIN_FAILED',
            createdAt: { gte: todayStart }
          }
        }),
        prisma.activityLog.count({
          where: {
            action: 'ACCOUNT_LOCKED',
            createdAt: { gte: todayStart }
          }
        }),
        prisma.activityLog.count({
          where: {
            action: 'PASSWORD_RESET_REQUESTED',
            createdAt: { gte: todayStart }
          }
        }),
        prisma.activityLog.count({
          where: {
            action: 'SUSPICIOUS_ACTIVITY',
            createdAt: { gte: todayStart }
          }
        })
      ]);

      return {
        failedLoginsToday: failedLogins,
        blockedIPsToday: 0, // Would need IP blocking service
        suspiciousActivities,
        accountLocksToday: accountLocks,
        passwordResetsToday: passwordResets
      };
    } catch (error) {
      return {
        failedLoginsToday: 0,
        blockedIPsToday: 0,
        suspiciousActivities: 0,
        accountLocksToday: 0,
        passwordResetsToday: 0
      };
    }
  }

  async function getSystemStatistics() {
    const memoryUsage = process.memoryUsage();
    
    return {
      uptime: process.uptime(),
      memoryUsage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100),
      cpuUsage: 0, // Would need CPU monitoring
      diskUsage: 0, // Would need disk monitoring
      databaseConnections: 0, // Would need database pool monitoring
      redisConnections: 0, // Would need Redis monitoring
      apiResponseTime: 0, // Would need API monitoring
      errorRate: 0 // Would need error tracking
    };
  }

  async function getWebhookStatistics() {
    try {
      const webhookActivities = await prisma.activityLog.findMany({
        where: {
          action: { in: ['WEBHOOK_ENDPOINT_CREATED', 'WEBHOOK_DELIVERY'] },
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }
      });

      const webhooks = webhookActivities.filter(a => a.action === 'WEBHOOK_ENDPOINT_CREATED');
      const deliveries = webhookActivities.filter(a => a.action === 'WEBHOOK_DELIVERY');
      const successfulDeliveries = deliveries.filter(d => (d.metadata as any)?.success);

      return {
        totalWebhooks: webhooks.length,
        activeWebhooks: webhooks.filter(w => (w.metadata as any)?.isActive).length,
        deliveriesToday: deliveries.length,
        successRate: deliveries.length > 0 ? (successfulDeliveries.length / deliveries.length) * 100 : 100,
        failedDeliveries: deliveries.length - successfulDeliveries.length
      };
    } catch (error) {
      return {
        totalWebhooks: 0,
        activeWebhooks: 0,
        deliveriesToday: 0,
        successRate: 100,
        failedDeliveries: 0
      };
    }
  }

  async function getBackupStatistics() {
    try {
      const lastBackup = await prisma.activityLog.findFirst({
        where: {
          action: 'BACKUP_COMPLETED'
        },
        orderBy: { createdAt: 'desc' }
      });

      return {
        lastBackupTime: lastBackup?.createdAt || null,
        lastBackupSize: (lastBackup?.metadata as any)?.size || 0,
        backupStatus: (lastBackup?.metadata as any)?.success ? 'success' : 'failed' as const,
        nextScheduledBackup: null // Would need backup scheduler
      };
    } catch (error) {
      return {
        lastBackupTime: null,
        lastBackupSize: 0,
        backupStatus: 'none' as const,
        nextScheduledBackup: null
      };
    }
  }

  async function getUserActivityData(userId: string) {
    const activities = await prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 1000
    });

    const logins = activities.filter(a => a.action === 'LOGIN_SUCCESS');
    const failedLogins = activities.filter(a => a.action === 'LOGIN_FAILED');
    const sessions = activities.filter(a => a.action.includes('SESSION'));

    return {
      lastLoginAt: logins[0]?.createdAt || null,
      loginCount: logins.length,
      failedLoginCount: failedLogins.length,
      sessionCount: sessions.length,
      lastActivityAt: activities[0]?.createdAt || null,
      deviceCount: new Set(activities.map(a => a.userAgent)).size,
      locationCount: new Set(activities.map(a => a.ip)).size
    };
  }

  function getAccountStatus(user: any): 'active' | 'inactive' | 'locked' | 'deleted' {
    if (user.deletedAt) return 'deleted';
    if (user.status === 'LOCKED') return 'locked';
    if (user.status === 'INACTIVE') return 'inactive';
    return 'active';
  }

  async function calculateRiskScore(userId: string): Promise<number> {
    // Simplified risk calculation
    const activities = await prisma.activityLog.findMany({
      where: { userId },
      take: 100
    });

    let score = 0;
    
    // Failed logins increase risk
    const failedLogins = activities.filter(a => a.action === 'LOGIN_FAILED').length;
    score += failedLogins * 5;

    // Multiple IP addresses increase risk
    const uniqueIPs = new Set(activities.map(a => a.ip)).size;
    if (uniqueIPs > 5) score += 20;

    // Suspicious activities
    const suspiciousActivities = activities.filter(a => a.action === 'SUSPICIOUS_ACTIVITY').length;
    score += suspiciousActivities * 15;

    return Math.min(score, 100);
  }

  function getOrderByClause(sortBy: string, sortOrder: 'asc' | 'desc') {
    switch (sortBy) {
      case 'createdAt':
        return { createdAt: sortOrder };
      case 'loginCount':
        return { createdAt: sortOrder }; // Approximation
      case 'riskScore':
        return { createdAt: sortOrder }; // Approximation
      case 'lastLogin':
      default:
        return { lastLoginAt: sortOrder };
    }
  }

  return {
    getDashboardStats,
    getUserActivitySummary,
    getSystemAlerts,
    createSystemAlert,
    acknowledgeAlert,
    getAdminActions,
    getSystemHealth
  };
}

// Type exports
export type AdminDashboardService = ReturnType<typeof createAdminDashboardService>;