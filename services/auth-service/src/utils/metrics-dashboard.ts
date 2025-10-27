import { MetricsService } from '../services/metrics.service';
import { logger } from './logger';

/**
 * Utility functions for metrics dashboard and monitoring
 */

export interface MetricsDashboard {
  overview: {
    totalUsers: number;
    activeUsers: number;
    loginSuccessRate: number;
    averageResponseTime: number;
    systemHealth: string;
  };
  security: {
    securityEventsHigh: number;
    securityEventsCritical: number;
    suspiciousActivities: number;
    blockedDevices: number;
  };
  performance: {
    requestsPerMinute: number;
    errorRate: number;
    databaseHealth: string;
    redisHealth: string;
  };
  trends: {
    newUsersToday: number;
    newUsersThisWeek: number;
    newUsersThisMonth: number;
  };
}

/**
 * Generate a comprehensive metrics dashboard
 */
export async function generateMetricsDashboard(metricsService: MetricsService): Promise<MetricsDashboard> {
  try {
    const authMetrics = await metricsService.getAuthMetrics();
    const realtimeMetrics = await metricsService.getRealtimeMetrics();

    // Determine overall system health
    const systemHealth = getOverallSystemHealth([
      authMetrics.databaseHealth,
      authMetrics.redisHealth,
      authMetrics.emailServiceHealth,
    ]);

    return {
      overview: {
        totalUsers: authMetrics.totalUsers,
        activeUsers: authMetrics.activeUsers,
        loginSuccessRate: authMetrics.loginSuccessRate,
        averageResponseTime: authMetrics.averageResponseTime,
        systemHealth,
      },
      security: {
        securityEventsHigh: authMetrics.securityEventsHigh,
        securityEventsCritical: authMetrics.securityEventsCritical,
        suspiciousActivities: authMetrics.suspiciousActivities,
        blockedDevices: authMetrics.blockedDevices,
      },
      performance: {
        requestsPerMinute: authMetrics.requestsPerMinute,
        errorRate: authMetrics.errorRate,
        databaseHealth: authMetrics.databaseHealth,
        redisHealth: authMetrics.redisHealth,
      },
      trends: {
        newUsersToday: authMetrics.newUsersToday,
        newUsersThisWeek: authMetrics.newUsersThisWeek,
        newUsersThisMonth: authMetrics.newUsersThisMonth,
      },
    };
  } catch (error) {
    logger.error('Failed to generate metrics dashboard:', error);
    throw error;
  }
}

/**
 * Generate alerts based on metrics thresholds
 */
export function generateMetricsAlerts(dashboard: MetricsDashboard): Array<{
  level: 'info' | 'warning' | 'critical';
  message: string;
  metric: string;
  value: number | string;
}> {
  const alerts = [];

  // System health alerts
  if (dashboard.overview.systemHealth === 'unhealthy') {
    alerts.push({
      level: 'critical' as const,
      message: 'System health is unhealthy',
      metric: 'system_health',
      value: dashboard.overview.systemHealth,
    });
  } else if (dashboard.overview.systemHealth === 'degraded') {
    alerts.push({
      level: 'warning' as const,
      message: 'System health is degraded',
      metric: 'system_health',
      value: dashboard.overview.systemHealth,
    });
  }

  // Performance alerts
  if (dashboard.overview.averageResponseTime > 1000) {
    alerts.push({
      level: 'warning' as const,
      message: 'High average response time detected',
      metric: 'average_response_time',
      value: dashboard.overview.averageResponseTime,
    });
  }

  if (dashboard.performance.errorRate > 5) {
    alerts.push({
      level: 'warning' as const,
      message: 'High error rate detected',
      metric: 'error_rate',
      value: dashboard.performance.errorRate,
    });
  }

  // Security alerts
  if (dashboard.security.securityEventsCritical > 0) {
    alerts.push({
      level: 'critical' as const,
      message: 'Critical security events detected',
      metric: 'security_events_critical',
      value: dashboard.security.securityEventsCritical,
    });
  }

  if (dashboard.security.securityEventsHigh > 10) {
    alerts.push({
      level: 'warning' as const,
      message: 'High number of security events',
      metric: 'security_events_high',
      value: dashboard.security.securityEventsHigh,
    });
  }

  if (dashboard.security.suspiciousActivities > 5) {
    alerts.push({
      level: 'warning' as const,
      message: 'Multiple suspicious activities detected',
      metric: 'suspicious_activities',
      value: dashboard.security.suspiciousActivities,
    });
  }

  // Authentication alerts
  if (dashboard.overview.loginSuccessRate < 80) {
    alerts.push({
      level: 'warning' as const,
      message: 'Low login success rate',
      metric: 'login_success_rate',
      value: dashboard.overview.loginSuccessRate,
    });
  }

  return alerts;
}

/**
 * Get overall system health from individual service health statuses
 */
function getOverallSystemHealth(healthStatuses: string[]): string {
  if (healthStatuses.includes('unhealthy')) {
    return 'unhealthy';
  }
  if (healthStatuses.includes('degraded')) {
    return 'degraded';
  }
  return 'healthy';
}

/**
 * Format metrics for console display (useful for development)
 */
export function formatMetricsForConsole(dashboard: MetricsDashboard): string {
  const lines = [
    '='.repeat(60),
    '                    METRICS DASHBOARD',
    '='.repeat(60),
    '',
    '📊 OVERVIEW',
    `   Total Users: ${dashboard.overview.totalUsers.toLocaleString()}`,
    `   Active Users: ${dashboard.overview.activeUsers.toLocaleString()}`,
    `   Login Success Rate: ${dashboard.overview.loginSuccessRate}%`,
    `   Avg Response Time: ${dashboard.overview.averageResponseTime}ms`,
    `   System Health: ${getHealthEmoji(dashboard.overview.systemHealth)} ${dashboard.overview.systemHealth}`,
    '',
    '🔒 SECURITY',
    `   High Security Events: ${dashboard.security.securityEventsHigh}`,
    `   Critical Security Events: ${dashboard.security.securityEventsCritical}`,
    `   Suspicious Activities: ${dashboard.security.suspiciousActivities}`,
    `   Blocked Devices: ${dashboard.security.blockedDevices}`,
    '',
    '⚡ PERFORMANCE',
    `   Requests/Min: ${dashboard.performance.requestsPerMinute}`,
    `   Error Rate: ${dashboard.performance.errorRate}%`,
    `   Database: ${getHealthEmoji(dashboard.performance.databaseHealth)} ${dashboard.performance.databaseHealth}`,
    `   Redis: ${getHealthEmoji(dashboard.performance.redisHealth)} ${dashboard.performance.redisHealth}`,
    '',
    '📈 TRENDS',
    `   New Users Today: ${dashboard.trends.newUsersToday}`,
    `   New Users This Week: ${dashboard.trends.newUsersThisWeek}`,
    `   New Users This Month: ${dashboard.trends.newUsersThisMonth}`,
    '',
    '='.repeat(60),
  ];

  return lines.join('\n');
}

/**
 * Get emoji for health status
 */
function getHealthEmoji(health: string): string {
  switch (health) {
    case 'healthy': return '✅';
    case 'degraded': return '⚠️';
    case 'unhealthy': return '❌';
    default: return '❓';
  }
}

/**
 * Validate metrics against expected thresholds
 */
export function validateMetricsThresholds(dashboard: MetricsDashboard): {
  isValid: boolean;
  violations: Array<{
    metric: string;
    current: number | string;
    threshold: number | string;
    severity: 'warning' | 'critical';
  }>;
} {
  const violations = [];

  // Performance thresholds
  if (dashboard.overview.averageResponseTime > 500) {
    violations.push({
      metric: 'average_response_time',
      current: dashboard.overview.averageResponseTime,
      threshold: 500,
      severity: dashboard.overview.averageResponseTime > 1000 ? 'critical' as const : 'warning' as const,
    });
  }

  // Security thresholds
  if (dashboard.security.securityEventsCritical > 0) {
    violations.push({
      metric: 'security_events_critical',
      current: dashboard.security.securityEventsCritical,
      threshold: 0,
      severity: 'critical' as const,
    });
  }

  // Health thresholds
  if (dashboard.overview.systemHealth !== 'healthy') {
    violations.push({
      metric: 'system_health',
      current: dashboard.overview.systemHealth,
      threshold: 'healthy',
      severity: dashboard.overview.systemHealth === 'unhealthy' ? 'critical' as const : 'warning' as const,
    });
  }

  return {
    isValid: violations.length === 0,
    violations,
  };
}

/**
 * Calculate SLA metrics
 */
export function calculateSLAMetrics(dashboard: MetricsDashboard): {
  availability: number;
  performance: number;
  reliability: number;
  overall: number;
} {
  // Availability (based on system health)
  const availability = dashboard.overview.systemHealth === 'healthy' ? 100 : 
                      dashboard.overview.systemHealth === 'degraded' ? 95 : 50;

  // Performance (based on response time and error rate)
  const responseTimeScore = Math.max(0, 100 - (dashboard.overview.averageResponseTime / 10));
  const errorRateScore = Math.max(0, 100 - (dashboard.performance.errorRate * 10));
  const performance = (responseTimeScore + errorRateScore) / 2;

  // Reliability (based on login success rate and security events)
  const loginScore = dashboard.overview.loginSuccessRate;
  const securityScore = Math.max(0, 100 - (dashboard.security.securityEventsCritical * 50 + dashboard.security.securityEventsHigh * 5));
  const reliability = (loginScore + securityScore) / 2;

  // Overall SLA
  const overall = (availability + performance + reliability) / 3;

  return {
    availability: Math.round(availability * 100) / 100,
    performance: Math.round(performance * 100) / 100,
    reliability: Math.round(reliability * 100) / 100,
    overall: Math.round(overall * 100) / 100,
  };
}