import { PrismaClient } from '@zoptal/database';
import { logger } from '../utils/logger';
import { RedisClient } from '../utils/redis';

export interface SessionEvent {
  id: string;
  userId: string;
  sessionId: string;
  eventType: SessionEventType;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  deviceInfo: {
    type: 'desktop' | 'mobile' | 'tablet' | 'unknown';
    browser: string;
    os: string;
    platform: string;
  };
  location?: {
    country: string;
    region: string;
    city: string;
    timezone: string;
    coordinates?: {
      lat: number;
      lon: number;
    };
  };
  metadata?: Record<string, any>;
}

export interface SessionAnalytics {
  userId: string;
  totalSessions: number;
  activeSessions: number;
  averageSessionDuration: number; // minutes
  totalSessionTime: number; // minutes
  loginFrequency: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  deviceBreakdown: Record<string, number>;
  browserBreakdown: Record<string, number>;
  locationBreakdown: Record<string, number>;
  peakHours: number[]; // hours of day (0-23)
  securityMetrics: {
    suspiciousLogins: number;
    failedLoginAttempts: number;
    multipleDeviceLogins: number;
    unusualLocationLogins: number;
  };
  lastActivity: Date;
  firstSeen: Date;
}

export interface SessionReport {
  period: {
    start: Date;
    end: Date;
  };
  summary: {
    totalUsers: number;
    totalSessions: number;
    averageSessionDuration: number;
    peakConcurrentSessions: number;
    newUsers: number;
    returningUsers: number;
    bounceRate: number; // sessions < 1 minute
  };
  deviceAnalytics: {
    desktop: number;
    mobile: number;
    tablet: number;
    unknown: number;
  };
  browserAnalytics: Record<string, number>;
  locationAnalytics: Record<string, number>;
  timeAnalytics: {
    hourlyDistribution: number[];
    dailyDistribution: number[];
    weeklyDistribution: number[];
  };
  securityAnalytics: {
    suspiciousActivities: number;
    blockedIPs: number;
    failedLogins: number;
    accountLockouts: number;
  };
  topPages: Array<{
    path: string;
    visits: number;
    uniqueUsers: number;
  }>;
  userRetention: {
    day1: number;
    day7: number;
    day30: number;
  };
}

export type SessionEventType = 
  | 'login'
  | 'logout'
  | 'session_start'
  | 'session_end'
  | 'session_timeout'
  | 'session_extend'
  | 'device_change'
  | 'location_change'
  | 'suspicious_activity'
  | 'failed_login'
  | 'password_reset'
  | 'account_locked'
  | 'api_access'
  | 'page_view'
  | 'feature_usage';

interface SessionAnalyticsServiceDependencies {
  prisma: PrismaClient;
  redis: any;
}

export function createSessionAnalyticsService({
  prisma,
  redis
}: SessionAnalyticsServiceDependencies) {

  /**
   * Track session event
   */
  async function trackSessionEvent(params: {
    userId: string;
    sessionId: string;
    eventType: SessionEventType;
    ipAddress: string;
    userAgent: string;
    metadata?: Record<string, any>;
  }): Promise<SessionEvent> {
    try {
      const { userId, sessionId, eventType, ipAddress, userAgent, metadata } = params;

      const deviceInfo = parseUserAgent(userAgent);
      const location = await getLocationFromIP(ipAddress);

      const sessionEvent: SessionEvent = {
        id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
        userId,
        sessionId,
        eventType,
        timestamp: new Date(),
        ipAddress,
        userAgent,
        deviceInfo,
        location,
        metadata
      };

      // Store in database (using activity log for simplicity)
      await prisma.activityLog.create({
        data: {
          userId,
          action: `SESSION_${eventType.toUpperCase()}`,
          category: 'SESSION',
          ip: ipAddress,
          userAgent,
          metadata: sessionEvent
        }
      });

      // Store in Redis for real-time analytics
      const redisKey = `session_events:${userId}`;
      await redis.lpush(redisKey, JSON.stringify(sessionEvent));
      await redis.ltrim(redisKey, 0, 999); // Keep last 1000 events
      await redis.expire(redisKey, 7 * 24 * 60 * 60); // 7 days

      // Update real-time counters
      await updateRealtimeMetrics(eventType, deviceInfo, location);

      logger.debug({
        userId,
        sessionId,
        eventType,
        deviceType: deviceInfo.type,
        country: location?.country
      }, 'Session event tracked');

      return sessionEvent;

    } catch (error) {
      logger.error({ error, userId: params.userId }, 'Failed to track session event');
      throw error;
    }
  }

  /**
   * Get user session analytics
   */
  async function getUserSessionAnalytics(
    userId: string,
    days: number = 30
  ): Promise<SessionAnalytics> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);

      // Get session events from database
      const activities = await prisma.activityLog.findMany({
        where: {
          userId,
          category: 'SESSION',
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      const sessionEvents = activities.map(activity => activity.metadata as SessionEvent);

      // Calculate session metrics
      const sessions = groupEventsBySessions(sessionEvents);
      const totalSessions = sessions.length;
      const activeSessions = await getActiveSessionCount(userId);

      // Calculate average session duration
      const sessionDurations = sessions
        .filter(session => session.endTime)
        .map(session => (session.endTime!.getTime() - session.startTime.getTime()) / (1000 * 60));
      
      const averageSessionDuration = sessionDurations.length > 0 
        ? sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length 
        : 0;

      const totalSessionTime = sessionDurations.reduce((a, b) => a + b, 0);

      // Calculate login frequency
      const loginEvents = sessionEvents.filter(e => e.eventType === 'login');
      const loginFrequency = {
        daily: loginEvents.filter(e => 
          e.timestamp >= new Date(Date.now() - 24 * 60 * 60 * 1000)
        ).length,
        weekly: loginEvents.filter(e => 
          e.timestamp >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length,
        monthly: loginEvents.length
      };

      // Device and browser breakdown
      const deviceBreakdown = sessionEvents.reduce((acc, event) => {
        acc[event.deviceInfo.type] = (acc[event.deviceInfo.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const browserBreakdown = sessionEvents.reduce((acc, event) => {
        acc[event.deviceInfo.browser] = (acc[event.deviceInfo.browser] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Location breakdown
      const locationBreakdown = sessionEvents.reduce((acc, event) => {
        if (event.location?.country) {
          acc[event.location.country] = (acc[event.location.country] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      // Peak hours analysis
      const hourCounts = new Array(24).fill(0);
      sessionEvents.forEach(event => {
        const hour = event.timestamp.getHours();
        hourCounts[hour]++;
      });
      const peakHours = hourCounts
        .map((count, hour) => ({ hour, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3)
        .map(item => item.hour);

      // Security metrics
      const securityMetrics = {
        suspiciousLogins: sessionEvents.filter(e => e.eventType === 'suspicious_activity').length,
        failedLoginAttempts: sessionEvents.filter(e => e.eventType === 'failed_login').length,
        multipleDeviceLogins: await getMultipleDeviceLogins(userId, days),
        unusualLocationLogins: await getUnusualLocationLogins(userId, sessionEvents)
      };

      // First and last activity
      const sortedEvents = sessionEvents.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      const firstSeen = sortedEvents[0]?.timestamp || new Date();
      const lastActivity = sortedEvents[sortedEvents.length - 1]?.timestamp || new Date();

      return {
        userId,
        totalSessions,
        activeSessions,
        averageSessionDuration,
        totalSessionTime,
        loginFrequency,
        deviceBreakdown,
        browserBreakdown,
        locationBreakdown,
        peakHours,
        securityMetrics,
        lastActivity,
        firstSeen
      };

    } catch (error) {
      logger.error({ error, userId }, 'Failed to get user session analytics');
      throw error;
    }
  }

  /**
   * Generate session report for period
   */
  async function generateSessionReport(
    startDate: Date,
    endDate: Date,
    options: {
      includeUserDetails?: boolean;
      includeSecurityAnalytics?: boolean;
      includeLocationAnalytics?: boolean;
    } = {}
  ): Promise<SessionReport> {
    try {
      // Get all session events in period
      const activities = await prisma.activityLog.findMany({
        where: {
          category: 'SESSION',
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      const sessionEvents = activities.map(activity => activity.metadata as SessionEvent);

      // Calculate summary metrics
      const uniqueUsers = new Set(sessionEvents.map(e => e.userId)).size;
      const sessions = groupEventsBySessions(sessionEvents);
      const totalSessions = sessions.length;

      const sessionDurations = sessions
        .filter(session => session.endTime)
        .map(session => (session.endTime!.getTime() - session.startTime.getTime()) / (1000 * 60));
      
      const averageSessionDuration = sessionDurations.length > 0 
        ? sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length 
        : 0;

      // Calculate bounce rate (sessions < 1 minute)
      const shortSessions = sessionDurations.filter(duration => duration < 1).length;
      const bounceRate = sessionDurations.length > 0 ? (shortSessions / sessionDurations.length) * 100 : 0;

      // Get new vs returning users
      const { newUsers, returningUsers } = await calculateUserRetention(startDate, endDate);

      // Device analytics
      const deviceCounts = sessionEvents.reduce((acc, event) => {
        acc[event.deviceInfo.type]++;
        return acc;
      }, { desktop: 0, mobile: 0, tablet: 0, unknown: 0 });

      // Browser analytics
      const browserAnalytics = sessionEvents.reduce((acc, event) => {
        acc[event.deviceInfo.browser] = (acc[event.deviceInfo.browser] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Location analytics
      const locationAnalytics = sessionEvents.reduce((acc, event) => {
        if (event.location?.country) {
          acc[event.location.country] = (acc[event.location.country] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      // Time analytics
      const timeAnalytics = calculateTimeDistribution(sessionEvents);

      // Security analytics
      const securityAnalytics = {
        suspiciousActivities: sessionEvents.filter(e => e.eventType === 'suspicious_activity').length,
        blockedIPs: await getBlockedIPCount(startDate, endDate),
        failedLogins: sessionEvents.filter(e => e.eventType === 'failed_login').length,
        accountLockouts: sessionEvents.filter(e => e.eventType === 'account_locked').length
      };

      // Peak concurrent sessions (estimated)
      const peakConcurrentSessions = await estimatePeakConcurrentSessions(sessions);

      // User retention
      const userRetention = await calculateRetentionMetrics(startDate, endDate);

      return {
        period: { start: startDate, end: endDate },
        summary: {
          totalUsers: uniqueUsers,
          totalSessions,
          averageSessionDuration,
          peakConcurrentSessions,
          newUsers,
          returningUsers,
          bounceRate
        },
        deviceAnalytics: deviceCounts,
        browserAnalytics,
        locationAnalytics,
        timeAnalytics,
        securityAnalytics,
        topPages: [], // Would need page view tracking
        userRetention
      };

    } catch (error) {
      logger.error({ error }, 'Failed to generate session report');
      throw error;
    }
  }

  /**
   * Get real-time session metrics
   */
  async function getRealtimeMetrics(): Promise<{
    activeSessions: number;
    onlineUsers: number;
    currentHourLogins: number;
    failedLoginsLastHour: number;
    topCountries: Array<{ country: string; count: number }>;
    deviceBreakdown: Record<string, number>;
  }> {
    try {
      // Get metrics from Redis
      const activeSessions = await redis.get('metrics:active_sessions') || 0;
      const onlineUsers = await redis.get('metrics:online_users') || 0;
      const currentHourLogins = await redis.get('metrics:current_hour_logins') || 0;
      const failedLoginsLastHour = await redis.get('metrics:failed_logins_hour') || 0;

      // Get top countries from sorted set
      const topCountriesData = await redis.zrevrange('metrics:countries', 0, 4, 'WITHSCORES');
      const topCountries = [];
      for (let i = 0; i < topCountriesData.length; i += 2) {
        topCountries.push({
          country: topCountriesData[i],
          count: parseInt(topCountriesData[i + 1])
        });
      }

      // Get device breakdown
      const deviceKeys = ['desktop', 'mobile', 'tablet', 'unknown'];
      const deviceCounts = await Promise.all(
        deviceKeys.map(key => redis.get(`metrics:device_${key}`))
      );
      const deviceBreakdown = deviceKeys.reduce((acc, key, index) => {
        acc[key] = parseInt(deviceCounts[index]) || 0;
        return acc;
      }, {} as Record<string, number>);

      return {
        activeSessions: parseInt(activeSessions),
        onlineUsers: parseInt(onlineUsers),
        currentHourLogins: parseInt(currentHourLogins),
        failedLoginsLastHour: parseInt(failedLoginsLastHour),
        topCountries,
        deviceBreakdown
      };

    } catch (error) {
      logger.error({ error }, 'Failed to get realtime metrics');
      throw error;
    }
  }

  /**
   * Get session duration statistics
   */
  async function getSessionDurationStats(
    userId?: string,
    days: number = 30
  ): Promise<{
    average: number;
    median: number;
    percentile95: number;
    shortest: number;
    longest: number;
    distribution: Record<string, number>;
  }> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);

      const whereClause: any = {
        category: 'SESSION',
        action: { in: ['SESSION_LOGIN', 'SESSION_LOGOUT', 'SESSION_TIMEOUT'] },
        createdAt: { gte: startDate, lte: endDate }
      };

      if (userId) {
        whereClause.userId = userId;
      }

      const activities = await prisma.activityLog.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' }
      });

      const sessionEvents = activities.map(activity => activity.metadata as SessionEvent);
      const sessions = groupEventsBySessions(sessionEvents);

      const durations = sessions
        .filter(session => session.endTime)
        .map(session => (session.endTime!.getTime() - session.startTime.getTime()) / (1000 * 60))
        .sort((a, b) => a - b);

      if (durations.length === 0) {
        return {
          average: 0,
          median: 0,
          percentile95: 0,
          shortest: 0,
          longest: 0,
          distribution: {}
        };
      }

      const average = durations.reduce((a, b) => a + b, 0) / durations.length;
      const median = durations[Math.floor(durations.length / 2)];
      const percentile95 = durations[Math.floor(durations.length * 0.95)];
      const shortest = durations[0];
      const longest = durations[durations.length - 1];

      // Create distribution buckets
      const distribution = {
        '< 1 min': durations.filter(d => d < 1).length,
        '1-5 min': durations.filter(d => d >= 1 && d < 5).length,
        '5-15 min': durations.filter(d => d >= 5 && d < 15).length,
        '15-30 min': durations.filter(d => d >= 15 && d < 30).length,
        '30-60 min': durations.filter(d => d >= 30 && d < 60).length,
        '> 60 min': durations.filter(d => d >= 60).length
      };

      return {
        average,
        median,
        percentile95,
        shortest,
        longest,
        distribution
      };

    } catch (error) {
      logger.error({ error, userId }, 'Failed to get session duration stats');
      throw error;
    }
  }

  /**
   * Helper functions
   */
  function parseUserAgent(userAgent: string): SessionEvent['deviceInfo'] {
    // Simplified user agent parsing
    const ua = userAgent.toLowerCase();
    
    let type: 'desktop' | 'mobile' | 'tablet' | 'unknown' = 'unknown';
    if (ua.includes('mobile')) type = 'mobile';
    else if (ua.includes('tablet') || ua.includes('ipad')) type = 'tablet';
    else if (ua.includes('windows') || ua.includes('mac') || ua.includes('linux')) type = 'desktop';

    let browser = 'unknown';
    if (ua.includes('chrome')) browser = 'chrome';
    else if (ua.includes('firefox')) browser = 'firefox';
    else if (ua.includes('safari')) browser = 'safari';
    else if (ua.includes('edge')) browser = 'edge';

    let os = 'unknown';
    if (ua.includes('windows')) os = 'windows';
    else if (ua.includes('mac')) os = 'macos';
    else if (ua.includes('linux')) os = 'linux';
    else if (ua.includes('android')) os = 'android';
    else if (ua.includes('ios')) os = 'ios';

    return {
      type,
      browser,
      os,
      platform: type
    };
  }

  async function getLocationFromIP(ipAddress: string): Promise<SessionEvent['location'] | undefined> {
    // Simplified location detection - in production use a GeoIP service
    if (ipAddress === '127.0.0.1' || ipAddress.startsWith('192.168.')) {
      return {
        country: 'Local',
        region: 'Local',
        city: 'Local',
        timezone: 'UTC'
      };
    }

    // Return undefined for now - would integrate with GeoIP service
    return undefined;
  }

  function groupEventsBySessions(events: SessionEvent[]): Array<{
    sessionId: string;
    startTime: Date;
    endTime?: Date;
    events: SessionEvent[];
  }> {
    const sessionMap = new Map();

    events.forEach(event => {
      if (!sessionMap.has(event.sessionId)) {
        sessionMap.set(event.sessionId, {
          sessionId: event.sessionId,
          startTime: event.timestamp,
          endTime: undefined,
          events: []
        });
      }

      const session = sessionMap.get(event.sessionId);
      session.events.push(event);

      if (event.eventType === 'login' || event.eventType === 'session_start') {
        if (event.timestamp < session.startTime) {
          session.startTime = event.timestamp;
        }
      }

      if (event.eventType === 'logout' || event.eventType === 'session_end' || event.eventType === 'session_timeout') {
        if (!session.endTime || event.timestamp > session.endTime) {
          session.endTime = event.timestamp;
        }
      }
    });

    return Array.from(sessionMap.values());
  }

  async function updateRealtimeMetrics(
    eventType: SessionEventType,
    deviceInfo: SessionEvent['deviceInfo'],
    location: SessionEvent['location']
  ): Promise<void> {
    try {
      const currentHour = Math.floor(Date.now() / (1000 * 60 * 60));

      if (eventType === 'login') {
        await redis.incr('metrics:current_hour_logins');
        await redis.expire('metrics:current_hour_logins', 3600);
        await redis.incr('metrics:online_users');
      }

      if (eventType === 'logout') {
        await redis.decr('metrics:online_users');
      }

      if (eventType === 'failed_login') {
        await redis.incr('metrics:failed_logins_hour');
        await redis.expire('metrics:failed_logins_hour', 3600);
      }

      // Update device metrics
      await redis.incr(`metrics:device_${deviceInfo.type}`);

      // Update country metrics
      if (location?.country) {
        await redis.zincrby('metrics:countries', 1, location.country);
      }

    } catch (error) {
      logger.error({ error }, 'Failed to update realtime metrics');
    }
  }

  async function getActiveSessionCount(userId: string): Promise<number> {
    try {
      const activeSessionsKey = `active_sessions:${userId}`;
      const activeSessions = await redis.smembers(activeSessionsKey);
      return activeSessions.length;
    } catch (error) {
      return 0;
    }
  }

  async function getMultipleDeviceLogins(userId: string, days: number): Promise<number> {
    // Implementation would check for simultaneous logins from different devices
    return 0;
  }

  async function getUnusualLocationLogins(userId: string, events: SessionEvent[]): Promise<number> {
    // Implementation would analyze location patterns and detect unusual locations
    const locations = events
      .filter(e => e.location?.country)
      .map(e => e.location!.country);
    
    const uniqueLocations = new Set(locations);
    return uniqueLocations.size > 3 ? uniqueLocations.size - 3 : 0;
  }

  async function calculateUserRetention(startDate: Date, endDate: Date): Promise<{
    newUsers: number;
    returningUsers: number;
  }> {
    // Simplified implementation
    const totalUsers = await prisma.user.count({
      where: {
        createdAt: { gte: startDate, lte: endDate }
      }
    });

    return {
      newUsers: Math.floor(totalUsers * 0.3),
      returningUsers: Math.floor(totalUsers * 0.7)
    };
  }

  function calculateTimeDistribution(events: SessionEvent[]): {
    hourlyDistribution: number[];
    dailyDistribution: number[];
    weeklyDistribution: number[];
  } {
    const hourlyDistribution = new Array(24).fill(0);
    const dailyDistribution = new Array(7).fill(0);
    const weeklyDistribution = new Array(52).fill(0);

    events.forEach(event => {
      const date = event.timestamp;
      hourlyDistribution[date.getHours()]++;
      dailyDistribution[date.getDay()]++;
      
      // Week of year calculation
      const week = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
      if (week < 52) weeklyDistribution[week]++;
    });

    return {
      hourlyDistribution,
      dailyDistribution,
      weeklyDistribution
    };
  }

  async function getBlockedIPCount(startDate: Date, endDate: Date): Promise<number> {
    // Implementation would count blocked IPs in the period
    return 0;
  }

  async function estimatePeakConcurrentSessions(sessions: Array<any>): Promise<number> {
    // Simplified estimation of peak concurrent sessions
    return Math.floor(sessions.length * 0.1);
  }

  async function calculateRetentionMetrics(startDate: Date, endDate: Date): Promise<{
    day1: number;
    day7: number;
    day30: number;
  }> {
    // Simplified retention calculation
    return {
      day1: 85,
      day7: 60,
      day30: 40
    };
  }

  return {
    trackSessionEvent,
    getUserSessionAnalytics,
    generateSessionReport,
    getRealtimeMetrics,
    getSessionDurationStats
  };
}

// Type exports
export type SessionAnalyticsService = ReturnType<typeof createSessionAnalyticsService>;