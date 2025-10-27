import { PrismaClient, SecurityEventType, SecuritySeverity } from '@zoptal/database';
import { logger } from '../utils/logger';
import { cacheManager } from '../utils/redis';

export interface ActivityServiceDependencies {
  prisma: PrismaClient;
}

export interface SecurityEventData {
  userId?: string;
  type: SecurityEventType;
  description: string;
  severity: SecuritySeverity;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export interface UserActivity {
  userId: string;
  action: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

export interface ActivitySummary {
  totalActions: number;
  uniqueUsers: number;
  topActions: Array<{ action: string; count: number }>;
  timeRange: {
    start: Date;
    end: Date;
  };
}

export class ActivityService {
  private readonly ACTIVITY_CACHE_PREFIX = 'activity:';
  private readonly SECURITY_ALERT_PREFIX = 'security_alert:';
  private readonly ACTIVITY_BATCH_SIZE = 100;

  constructor(private deps: ActivityServiceDependencies) {}

  /**
   * Log a security event
   */
  async logSecurityEvent(eventData: SecurityEventData): Promise<void> {
    try {
      // Create security event in database
      const securityEvent = await this.deps.prisma.securityEvent.create({
        data: {
          type: eventData.type,
          description: eventData.description,
          severity: eventData.severity,
          userId: eventData.userId,
          metadata: eventData.metadata,
          ipAddress: eventData.ipAddress,
          userAgent: eventData.userAgent,
        },
      });

      // Cache recent security events for quick access
      const cacheKey = `${this.ACTIVITY_CACHE_PREFIX}security:${eventData.userId || 'system'}`;
      const cachedEvents = await this.getCachedSecurityEvents(eventData.userId || 'system');
      
      cachedEvents.unshift({
        id: securityEvent.id,
        type: eventData.type,
        description: eventData.description,
        severity: eventData.severity,
        timestamp: new Date(),
        metadata: eventData.metadata,
      });

      // Keep only last 50 events in cache
      if (cachedEvents.length > 50) {
        cachedEvents.splice(50);
      }

      await cacheManager.setex(cacheKey, 24 * 60 * 60, JSON.stringify(cachedEvents)); // 24 hours

      // Trigger alerts for high severity events
      if (['HIGH', 'CRITICAL'].includes(eventData.severity)) {
        await this.triggerSecurityAlert(securityEvent.id, eventData);
      }

      logger.info('Security event logged:', {
        eventId: securityEvent.id,
        type: eventData.type,
        severity: eventData.severity,
        userId: eventData.userId,
      });
    } catch (error) {
      logger.error('Failed to log security event:', error);
      // Don't throw error to prevent disrupting main flow
    }
  }

  /**
   * Log user activity
   */
  async logUserActivity(activity: UserActivity): Promise<void> {
    try {
      // For high-frequency actions, use caching to reduce database load
      const isHighFrequencyAction = ['TOKEN_REFRESH', 'API_CALL', 'PAGE_VIEW'].includes(activity.action);
      
      if (isHighFrequencyAction) {
        await this.cacheUserActivity(activity);
      } else {
        // Log important activities directly to database via security events
        await this.logSecurityEvent({
          userId: activity.userId,
          type: activity.action as SecurityEventType,
          description: `User action: ${activity.action}`,
          severity: 'LOW',
          metadata: activity.details,
          ipAddress: activity.ipAddress,
          userAgent: activity.userAgent,
        });
      }

      // Update user activity metrics
      await this.updateUserActivityMetrics(activity.userId, activity.action);

      logger.debug('User activity logged:', {
        userId: activity.userId,
        action: activity.action,
        timestamp: activity.timestamp,
      });
    } catch (error) {
      logger.error('Failed to log user activity:', error);
    }
  }

  /**
   * Get user's recent security events
   */
  async getUserSecurityEvents(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<any[]> {
    // Try cache first
    const cachedEvents = await this.getCachedSecurityEvents(userId);
    if (cachedEvents.length > 0 && offset === 0) {
      return cachedEvents.slice(0, limit);
    }

    // Fallback to database
    const events = await this.deps.prisma.securityEvent.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    });

    return events;
  }

  /**
   * Detect suspicious activity patterns
   */
  async detectSuspiciousActivity(userId: string): Promise<{
    isSuspicious: boolean;
    reasons: string[];
    riskScore: number;
  }> {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const reasons: string[] = [];
    let riskScore = 0;

    // Check for multiple failed login attempts
    const failedLogins = await this.deps.prisma.loginAttempt.count({
      where: {
        userId,
        success: false,
        createdAt: { gte: last24Hours },
      },
    });

    if (failedLogins > 5) {
      reasons.push(`${failedLogins} failed login attempts in 24 hours`);
      riskScore += failedLogins * 2;
    }

    // Check for logins from multiple IPs
    const uniqueIPs = await this.deps.prisma.loginAttempt.groupBy({
      by: ['ipAddress'],
      where: {
        userId,
        success: true,
        createdAt: { gte: last24Hours },
      },
    });

    if (uniqueIPs.length > 3) {
      reasons.push(`Logins from ${uniqueIPs.length} different IP addresses`);
      riskScore += uniqueIPs.length * 5;
    }

    // Check for unusual login times (if we had user patterns)
    // This would require historical analysis of user behavior

    // Check for rapid successive logins
    const recentLogins = await this.deps.prisma.loginAttempt.findMany({
      where: {
        userId,
        success: true,
        createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) }, // Last hour
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    if (recentLogins.length > 5) {
      reasons.push(`${recentLogins.length} logins in the past hour`);
      riskScore += 15;
    }

    // Check for security events
    const securityEvents = await this.deps.prisma.securityEvent.count({
      where: {
        userId,
        severity: { in: ['HIGH', 'CRITICAL'] },
        createdAt: { gte: last24Hours },
      },
    });

    if (securityEvents > 0) {
      reasons.push(`${securityEvents} high-severity security events`);
      riskScore += securityEvents * 10;
    }

    const isSuspicious = riskScore > 20;

    if (isSuspicious) {
      await this.logSecurityEvent({
        userId,
        type: 'SUSPICIOUS_LOGIN',
        description: 'Suspicious activity pattern detected',
        severity: riskScore > 50 ? 'HIGH' : 'MEDIUM',
        metadata: {
          riskScore,
          reasons,
          detectionTime: new Date(),
        },
      });
    }

    return {
      isSuspicious,
      reasons,
      riskScore,
    };
  }

  /**
   * Get activity summary for a time period
   */
  async getActivitySummary(
    startDate: Date,
    endDate: Date,
    userId?: string
  ): Promise<ActivitySummary> {
    const whereClause: any = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (userId) {
      whereClause.userId = userId;
    }

    // Get total events and unique users
    const [totalActions, uniqueUsers, topActions] = await Promise.all([
      this.deps.prisma.securityEvent.count({ where: whereClause }),
      
      this.deps.prisma.securityEvent.groupBy({
        by: ['userId'],
        where: whereClause,
        _count: { userId: true },
      }),

      this.deps.prisma.securityEvent.groupBy({
        by: ['type'],
        where: whereClause,
        _count: { type: true },
        orderBy: { _count: { type: 'desc' } },
        take: 10,
      }),
    ]);

    return {
      totalActions,
      uniqueUsers: uniqueUsers.length,
      topActions: topActions.map(action => ({
        action: action.type,
        count: action._count.type,
      })),
      timeRange: {
        start: startDate,
        end: endDate,
      },
    };
  }

  /**
   * Get security metrics for monitoring
   */
  async getSecurityMetrics(): Promise<{
    criticalEvents: number;
    highSeverityEvents: number;
    suspiciousActivities: number;
    blockedIPs: number;
    activeAlerts: number;
  }> {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [
      criticalEvents,
      highSeverityEvents,
      suspiciousActivities,
      activeAlerts,
    ] = await Promise.all([
      this.deps.prisma.securityEvent.count({
        where: {
          severity: 'CRITICAL',
          createdAt: { gte: last24Hours },
        },
      }),

      this.deps.prisma.securityEvent.count({
        where: {
          severity: 'HIGH',
          createdAt: { gte: last24Hours },
        },
      }),

      this.deps.prisma.securityEvent.count({
        where: {
          type: 'SUSPICIOUS_LOGIN',
          createdAt: { gte: last24Hours },
        },
      }),

      this.getActiveSecurityAlerts(),
    ]);

    // For blocked IPs, we'd typically check a rate limiting service
    // For now, return a placeholder
    const blockedIPs = 0;

    return {
      criticalEvents,
      highSeverityEvents,
      suspiciousActivities,
      blockedIPs,
      activeAlerts,
    };
  }

  /**
   * Cache high-frequency user activities
   */
  private async cacheUserActivity(activity: UserActivity): Promise<void> {
    const cacheKey = `${this.ACTIVITY_CACHE_PREFIX}user:${activity.userId}:${activity.action}`;
    
    // Increment counter for this action
    const currentCount = await cacheManager.get(cacheKey) || '0';
    const newCount = parseInt(currentCount) + 1;
    
    // Cache with 1 hour expiration
    await cacheManager.setex(cacheKey, 60 * 60, newCount.toString());

    // If count reaches batch size, flush to database
    if (newCount >= this.ACTIVITY_BATCH_SIZE) {
      await this.flushCachedActivity(activity.userId, activity.action, newCount);
      await cacheManager.del(cacheKey);
    }
  }

  /**
   * Flush cached activities to database
   */
  private async flushCachedActivity(userId: string, action: string, count: number): Promise<void> {
    await this.logSecurityEvent({
      userId,
      type: 'API_CALL', // Generic type for high-frequency actions
      description: `Batched activity: ${action} (${count} times)`,
      severity: 'LOW',
      metadata: {
        action,
        count,
        batched: true,
      },
    });
  }

  /**
   * Update user activity metrics
   */
  private async updateUserActivityMetrics(userId: string, action: string): Promise<void> {
    const metricsKey = `${this.ACTIVITY_CACHE_PREFIX}metrics:${userId}`;
    
    try {
      const metrics = await cacheManager.get(metricsKey);
      const currentMetrics = metrics ? JSON.parse(metrics) : {
        lastActivity: null,
        actionCounts: {},
        totalActions: 0,
      };

      currentMetrics.lastActivity = new Date().toISOString();
      currentMetrics.actionCounts[action] = (currentMetrics.actionCounts[action] || 0) + 1;
      currentMetrics.totalActions += 1;

      await cacheManager.setex(metricsKey, 24 * 60 * 60, JSON.stringify(currentMetrics));
    } catch (error) {
      logger.error('Failed to update user activity metrics:', error);
    }
  }

  /**
   * Get cached security events
   */
  private async getCachedSecurityEvents(userId: string): Promise<any[]> {
    try {
      const cacheKey = `${this.ACTIVITY_CACHE_PREFIX}security:${userId}`;
      const cached = await cacheManager.get(cacheKey);
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      logger.error('Failed to get cached security events:', error);
      return [];
    }
  }

  /**
   * Trigger security alert for high-severity events
   */
  private async triggerSecurityAlert(eventId: string, eventData: SecurityEventData): Promise<void> {
    const alertKey = `${this.SECURITY_ALERT_PREFIX}${eventId}`;
    
    const alert = {
      eventId,
      type: eventData.type,
      severity: eventData.severity,
      userId: eventData.userId,
      description: eventData.description,
      timestamp: new Date().toISOString(),
      resolved: false,
    };

    // Store alert for 7 days
    await cacheManager.setex(alertKey, 7 * 24 * 60 * 60, JSON.stringify(alert));

    // In a production system, this would trigger notifications
    // to security teams, send emails, create tickets, etc.
    logger.warn('Security alert triggered:', alert);
  }

  /**
   * Get active security alerts
   */
  private async getActiveSecurityAlerts(): Promise<number> {
    try {
      const alertKeys = await cacheManager.keys(`${this.SECURITY_ALERT_PREFIX}*`);
      let activeCount = 0;

      for (const key of alertKeys) {
        const alert = await cacheManager.get(key);
        if (alert) {
          const alertData = JSON.parse(alert);
          if (!alertData.resolved) {
            activeCount++;
          }
        }
      }

      return activeCount;
    } catch (error) {
      logger.error('Failed to get active security alerts:', error);
      return 0;
    }
  }
}

export function createActivityService(deps: ActivityServiceDependencies): ActivityService {
  return new ActivityService(deps);
}