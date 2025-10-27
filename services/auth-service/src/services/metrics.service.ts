import { PrismaClient } from '@zoptal/database';
import { logger } from '../utils/logger';
import { cacheManager } from '../utils/redis';

export interface MetricsServiceDependencies {
  prisma: PrismaClient;
}

export interface MetricData {
  name: string;
  value: number;
  tags?: Record<string, string>;
  timestamp?: Date;
}

export interface AuthMetrics {
  // User metrics
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  
  // Authentication metrics
  loginAttemptsTotal: number;
  loginAttemptsSuccess: number;
  loginAttemptsFailure: number;
  loginSuccessRate: number;
  
  // Security metrics
  securityEventsHigh: number;
  securityEventsCritical: number;
  suspiciousActivities: number;
  blockedDevices: number;
  
  // Performance metrics
  averageResponseTime: number;
  requestsPerMinute: number;
  errorRate: number;
  
  // Service health
  databaseHealth: 'healthy' | 'degraded' | 'unhealthy';
  redisHealth: 'healthy' | 'degraded' | 'unhealthy';
  emailServiceHealth: 'healthy' | 'degraded' | 'unhealthy';
}

export interface TimeSeriesMetric {
  timestamp: Date;
  value: number;
  tags?: Record<string, string>;
}

export interface MetricsAggregation {
  period: 'hour' | 'day' | 'week' | 'month';
  metrics: Record<string, TimeSeriesMetric[]>;
}

export class MetricsService {
  private readonly METRICS_CACHE_PREFIX = 'metrics:';
  private readonly METRICS_CACHE_TTL = 60; // 1 minute
  private readonly REALTIME_METRICS_KEY = 'realtime_metrics';
  
  // In-memory counters for high-frequency metrics
  private counters: Map<string, number> = new Map();
  private timers: Map<string, number[]> = new Map();
  
  constructor(private deps: MetricsServiceDependencies) {
    // Flush metrics to Redis every 30 seconds
    setInterval(() => this.flushMetricsToCache(), 30000);
  }

  /**
   * Record a metric value
   */
  async recordMetric(metric: MetricData): Promise<void> {
    try {
      const key = this.buildMetricKey(metric.name, metric.tags);
      
      // Update in-memory counter
      const currentValue = this.counters.get(key) || 0;
      this.counters.set(key, currentValue + metric.value);
      
      // For debugging in development
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Metric recorded:', {
          name: metric.name,
          value: metric.value,
          tags: metric.tags,
        });
      }
    } catch (error) {
      logger.error('Failed to record metric:', { metric, error });
    }
  }

  /**
   * Record timing metric (duration in milliseconds)
   */
  async recordTiming(name: string, duration: number, tags?: Record<string, string>): Promise<void> {
    try {
      const key = this.buildMetricKey(name, tags);
      
      // Store timing values for percentile calculations
      const timings = this.timers.get(key) || [];
      timings.push(duration);
      
      // Keep only last 100 timings to prevent memory growth
      if (timings.length > 100) {
        timings.splice(0, timings.length - 100);
      }
      
      this.timers.set(key, timings);
      
      // Also record as a regular metric
      await this.recordMetric({
        name: `${name}.duration`,
        value: duration,
        tags,
      });
    } catch (error) {
      logger.error('Failed to record timing:', { name, duration, tags, error });
    }
  }

  /**
   * Increment a counter metric
   */
  async incrementCounter(name: string, tags?: Record<string, string>): Promise<void> {
    await this.recordMetric({
      name,
      value: 1,
      tags,
    });
  }

  /**
   * Record gauge metric (current value)
   */
  async recordGauge(name: string, value: number, tags?: Record<string, string>): Promise<void> {
    try {
      const key = this.buildMetricKey(name, tags);
      
      // For gauge metrics, store the latest value
      this.counters.set(key, value);
      
      // Cache gauge values separately for quick access
      const cacheKey = `${this.METRICS_CACHE_PREFIX}gauge:${key}`;
      await cacheManager.setex(cacheKey, this.METRICS_CACHE_TTL, value.toString());
    } catch (error) {
      logger.error('Failed to record gauge:', { name, value, tags, error });
    }
  }

  /**
   * Get comprehensive authentication metrics
   */
  async getAuthMetrics(): Promise<AuthMetrics> {
    try {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfWeek = new Date(startOfDay.getTime() - 7 * 24 * 60 * 60 * 1000);
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Get all metrics in parallel for better performance
      const [
        totalUsers,
        activeUsers,
        newUsersToday,
        newUsersThisWeek,
        newUsersThisMonth,
        loginAttemptsToday,
        securityEventsHigh,
        securityEventsCritical,
        suspiciousActivities,
        blockedDevices,
      ] = await Promise.all([
        // User metrics
        this.deps.prisma.user.count({
          where: { status: { not: 'deleted' } },
        }),
        
        this.deps.prisma.user.count({
          where: {
            status: 'active',
            lastLoginAt: { gte: last24Hours },
          },
        }),
        
        this.deps.prisma.user.count({
          where: {
            createdAt: { gte: startOfDay },
          },
        }),
        
        this.deps.prisma.user.count({
          where: {
            createdAt: { gte: startOfWeek },
          },
        }),
        
        this.deps.prisma.user.count({
          where: {
            createdAt: { gte: startOfMonth },
          },
        }),
        
        // Login metrics
        this.deps.prisma.loginAttempt.findMany({
          where: {
            createdAt: { gte: startOfDay },
          },
          select: { success: true },
        }),
        
        // Security metrics
        this.deps.prisma.securityEvent.count({
          where: {
            severity: 'HIGH',
            createdAt: { gte: last24Hours },
          },
        }),
        
        this.deps.prisma.securityEvent.count({
          where: {
            severity: 'CRITICAL',
            createdAt: { gte: last24Hours },
          },
        }),
        
        this.deps.prisma.securityEvent.count({
          where: {
            type: 'SUSPICIOUS_LOGIN',
            createdAt: { gte: last24Hours },
          },
        }),
        
        this.deps.prisma.deviceFingerprint.count({
          where: { isBlocked: true },
        }),
      ]);

      // Calculate login success rate
      const loginAttemptsTotal = loginAttemptsToday.length;
      const loginAttemptsSuccess = loginAttemptsToday.filter(attempt => attempt.success).length;
      const loginAttemptsFailure = loginAttemptsTotal - loginAttemptsSuccess;
      const loginSuccessRate = loginAttemptsTotal > 0 
        ? Math.round((loginAttemptsSuccess / loginAttemptsTotal) * 100) 
        : 0;

      // Get performance metrics from cache
      const performanceMetrics = await this.getPerformanceMetrics();

      return {
        // User metrics
        totalUsers,
        activeUsers,
        newUsersToday,
        newUsersThisWeek,
        newUsersThisMonth,
        
        // Authentication metrics
        loginAttemptsTotal,
        loginAttemptsSuccess,
        loginAttemptsFailure,
        loginSuccessRate,
        
        // Security metrics
        securityEventsHigh,
        securityEventsCritical,
        suspiciousActivities,
        blockedDevices,
        
        // Performance metrics
        averageResponseTime: performanceMetrics.averageResponseTime,
        requestsPerMinute: performanceMetrics.requestsPerMinute,
        errorRate: performanceMetrics.errorRate,
        
        // Service health
        databaseHealth: await this.checkDatabaseHealth(),
        redisHealth: await this.checkRedisHealth(),
        emailServiceHealth: await this.checkEmailServiceHealth(),
      };
    } catch (error) {
      logger.error('Failed to get auth metrics:', error);
      throw new Error('METRICS_RETRIEVAL_FAILED');
    }
  }

  /**
   * Get time series metrics for charts
   */
  async getTimeSeriesMetrics(
    metricNames: string[],
    period: 'hour' | 'day' | 'week',
    startDate?: Date,
    endDate?: Date
  ): Promise<MetricsAggregation> {
    try {
      const end = endDate || new Date();
      let start: Date;
      let intervalMinutes: number;

      switch (period) {
        case 'hour':
          start = startDate || new Date(end.getTime() - 60 * 60 * 1000);
          intervalMinutes = 5; // 5-minute intervals
          break;
        case 'day':
          start = startDate || new Date(end.getTime() - 24 * 60 * 60 * 1000);
          intervalMinutes = 60; // 1-hour intervals
          break;
        case 'week':
          start = startDate || new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
          intervalMinutes = 60 * 24; // 1-day intervals
          break;
        default:
          throw new Error('Invalid period');
      }

      const metrics: Record<string, TimeSeriesMetric[]> = {};

      for (const metricName of metricNames) {
        metrics[metricName] = await this.getMetricTimeSeries(
          metricName,
          start,
          end,
          intervalMinutes
        );
      }

      return {
        period,
        metrics,
      };
    } catch (error) {
      logger.error('Failed to get time series metrics:', error);
      throw new Error('TIME_SERIES_METRICS_FAILED');
    }
  }

  /**
   * Get real-time metrics (updated every 30 seconds)
   */
  async getRealtimeMetrics(): Promise<Record<string, any>> {
    try {
      const cached = await cacheManager.get(`${this.METRICS_CACHE_PREFIX}${this.REALTIME_METRICS_KEY}`);
      if (cached) {
        return JSON.parse(cached);
      }

      // Return empty object if no cached metrics
      return {};
    } catch (error) {
      logger.error('Failed to get realtime metrics:', error);
      return {};
    }
  }

  /**
   * Flush in-memory metrics to cache
   */
  private async flushMetricsToCache(): Promise<void> {
    try {
      // Convert counters to metrics object
      const metrics: Record<string, any> = {};
      
      for (const [key, value] of this.counters.entries()) {
        metrics[key] = value;
      }

      // Add timing percentiles
      for (const [key, timings] of this.timers.entries()) {
        if (timings.length > 0) {
          const sorted = [...timings].sort((a, b) => a - b);
          metrics[`${key}.p50`] = this.getPercentile(sorted, 50);
          metrics[`${key}.p95`] = this.getPercentile(sorted, 95);
          metrics[`${key}.p99`] = this.getPercentile(sorted, 99);
          metrics[`${key}.avg`] = sorted.reduce((a, b) => a + b, 0) / sorted.length;
        }
      }

      // Store in cache
      await cacheManager.setex(
        `${this.METRICS_CACHE_PREFIX}${this.REALTIME_METRICS_KEY}`,
        this.METRICS_CACHE_TTL,
        JSON.stringify({
          ...metrics,
          lastUpdated: new Date().toISOString(),
        })
      );

      // Reset counters (keep a sliding window)
      for (const [key, value] of this.counters.entries()) {
        this.counters.set(key, Math.round(value * 0.1)); // Keep 10% for smoothing
      }
    } catch (error) {
      logger.error('Failed to flush metrics to cache:', error);
    }
  }

  /**
   * Build metric key from name and tags
   */
  private buildMetricKey(name: string, tags?: Record<string, string>): string {
    if (!tags || Object.keys(tags).length === 0) {
      return name;
    }

    const tagString = Object.entries(tags)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}:${value}`)
      .join(',');

    return `${name}{${tagString}}`;
  }

  /**
   * Get specific metric time series
   */
  private async getMetricTimeSeries(
    metricName: string,
    start: Date,
    end: Date,
    intervalMinutes: number
  ): Promise<TimeSeriesMetric[]> {
    // This is a simplified implementation
    // In production, you'd want to use a proper time series database
    const timeSeries: TimeSeriesMetric[] = [];
    
    const current = new Date(start);
    while (current <= end) {
      // Generate sample data - replace with actual metric queries
      const value = await this.calculateMetricValue(metricName, current);
      
      timeSeries.push({
        timestamp: new Date(current),
        value,
      });
      
      current.setMinutes(current.getMinutes() + intervalMinutes);
    }

    return timeSeries;
  }

  /**
   * Calculate metric value for a specific timestamp
   */
  private async calculateMetricValue(metricName: string, timestamp: Date): Promise<number> {
    try {
      const endTime = new Date(timestamp.getTime() + 5 * 60 * 1000); // 5-minute window
      
      switch (metricName) {
        case 'login_attempts':
          return await this.deps.prisma.loginAttempt.count({
            where: {
              createdAt: {
                gte: timestamp,
                lt: endTime,
              },
            },
          });
          
        case 'login_success':
          return await this.deps.prisma.loginAttempt.count({
            where: {
              success: true,
              createdAt: {
                gte: timestamp,
                lt: endTime,
              },
            },
          });
          
        case 'security_events':
          return await this.deps.prisma.securityEvent.count({
            where: {
              createdAt: {
                gte: timestamp,
                lt: endTime,
              },
            },
          });
          
        default:
          return 0;
      }
    } catch (error) {
      logger.error('Failed to calculate metric value:', { metricName, timestamp, error });
      return 0;
    }
  }

  /**
   * Get performance metrics from cached counters
   */
  private async getPerformanceMetrics(): Promise<{
    averageResponseTime: number;
    requestsPerMinute: number;
    errorRate: number;
  }> {
    try {
      const cached = await cacheManager.get(`${this.METRICS_CACHE_PREFIX}performance`);
      if (cached) {
        return JSON.parse(cached);
      }

      return {
        averageResponseTime: 0,
        requestsPerMinute: 0,
        errorRate: 0,
      };
    } catch (error) {
      return {
        averageResponseTime: 0,
        requestsPerMinute: 0,
        errorRate: 0,
      };
    }
  }

  /**
   * Check database health
   */
  private async checkDatabaseHealth(): Promise<'healthy' | 'degraded' | 'unhealthy'> {
    try {
      const start = Date.now();
      await this.deps.prisma.$queryRaw`SELECT 1`;
      const duration = Date.now() - start;
      
      if (duration < 100) return 'healthy';
      if (duration < 1000) return 'degraded';
      return 'unhealthy';
    } catch (error) {
      return 'unhealthy';
    }
  }

  /**
   * Check Redis health
   */
  private async checkRedisHealth(): Promise<'healthy' | 'degraded' | 'unhealthy'> {
    try {
      const start = Date.now();
      await cacheManager.set('health_check', 'ok', 10);
      const duration = Date.now() - start;
      
      if (duration < 50) return 'healthy';
      if (duration < 200) return 'degraded';
      return 'unhealthy';
    } catch (error) {
      return 'unhealthy';
    }
  }

  /**
   * Check email service health
   */
  private async checkEmailServiceHealth(): Promise<'healthy' | 'degraded' | 'unhealthy'> {
    try {
      // Check if there are many failed emails in queue
      const failedEmailsKey = 'failed_emails:*';
      const failedEmailsCount = (await cacheManager.keys(failedEmailsKey)).length;
      
      if (failedEmailsCount < 10) return 'healthy';
      if (failedEmailsCount < 50) return 'degraded';
      return 'unhealthy';
    } catch (error) {
      return 'unhealthy';
    }
  }

  /**
   * Calculate percentile from sorted array
   */
  private getPercentile(sortedArray: number[], percentile: number): number {
    const index = (percentile / 100) * (sortedArray.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    
    if (lower === upper) {
      return sortedArray[lower];
    }
    
    const weight = index - lower;
    return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight;
  }
}

export function createMetricsService(deps: MetricsServiceDependencies): MetricsService {
  return new MetricsService(deps);
}