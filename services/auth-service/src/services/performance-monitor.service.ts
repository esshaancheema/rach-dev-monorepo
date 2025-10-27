import { PrismaClient } from '@zoptal/database';
import { logger } from '../utils/logger';
import { RedisClient } from '../utils/redis';
import { createMetricsService } from './metrics.service';
import { createEmailService } from './email.service';
import EventEmitter from 'events';

export interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  tags?: Record<string, string>;
  source: 'system' | 'application' | 'database' | 'redis' | 'external';
}

export interface PerformanceThreshold {
  id: string;
  metricName: string;
  operator: 'gt' | 'lt' | 'gte' | 'lte' | 'eq' | 'ne';
  value: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  windowMinutes: number; // Time window for evaluation
  minDataPoints: number; // Minimum data points needed
  description: string;
}

export interface PerformanceAlert {
  id: string;
  thresholdId: string;
  metricName: string;
  severity: PerformanceThreshold['severity'];
  message: string;
  currentValue: number;
  thresholdValue: number;
  timestamp: Date;
  resolved?: Date;
  resolvedBy?: string;
  tags?: Record<string, string>;
  notificationsSent: string[];
}

export interface SystemHealthSnapshot {
  timestamp: Date;
  overall: 'healthy' | 'degraded' | 'unhealthy' | 'critical';
  metrics: {
    cpu: {
      usage: number;
      loadAverage: number[];
    };
    memory: {
      used: number;
      total: number;
      heapUsed: number;
      heapTotal: number;
      usage: number;
    };
    database: {
      connectionCount: number;
      avgResponseTime: number;
      errorRate: number;
      connectionPoolUtilization: number;
    };
    redis: {
      connectionCount: number;
      avgResponseTime: number;
      errorRate: number;
      memoryUsage: number;
    };
    api: {
      requestsPerMinute: number;
      avgResponseTime: number;
      errorRate: number;
      activeConnections: number;
    };
    external: {
      emailServiceHealth: 'up' | 'down' | 'degraded';
      smsServiceHealth: 'up' | 'down' | 'degraded';
      oauthProvidersHealth: Record<string, 'up' | 'down' | 'degraded'>;
    };
  };
  alerts: {
    active: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export interface AlertChannel {
  id: string;
  name: string;
  type: 'email' | 'slack' | 'webhook' | 'sms' | 'pagerduty';
  enabled: boolean;
  config: {
    email?: {
      recipients: string[];
      subject?: string;
      template?: string;
    };
    slack?: {
      webhookUrl: string;
      channel?: string;
      username?: string;
    };
    webhook?: {
      url: string;
      method: 'POST' | 'PUT';
      headers?: Record<string, string>;
      auth?: {
        type: 'bearer' | 'basic';
        token?: string;
        username?: string;
        password?: string;
      };
    };
    sms?: {
      recipients: string[];
    };
    pagerduty?: {
      integrationKey: string;
      severity?: string;
    };
  };
  severityFilter: PerformanceThreshold['severity'][];
  rateLimitMinutes: number; // Minimum time between notifications
}

interface PerformanceMonitorDependencies {
  prisma: PrismaClient;
  redis: typeof RedisClient;
  metricsService: ReturnType<typeof createMetricsService>;
  emailService: ReturnType<typeof createEmailService>;
}

export function createPerformanceMonitorService({ 
  prisma, 
  redis, 
  metricsService,
  emailService 
}: PerformanceMonitorDependencies) {
  
  const eventEmitter = new EventEmitter();
  const activeAlerts = new Map<string, PerformanceAlert>();
  const alertHistory: PerformanceAlert[] = [];
  const performanceHistory: PerformanceMetric[] = [];
  
  // Default thresholds
  const defaultThresholds: PerformanceThreshold[] = [
    {
      id: 'cpu_usage_high',
      metricName: 'cpu_usage',
      operator: 'gt',
      value: 80,
      severity: 'high',
      enabled: true,
      windowMinutes: 5,
      minDataPoints: 3,
      description: 'CPU usage exceeds 80%'
    },
    {
      id: 'memory_usage_critical',
      metricName: 'memory_usage',
      operator: 'gt',
      value: 90,
      severity: 'critical',
      enabled: true,
      windowMinutes: 2,
      minDataPoints: 2,
      description: 'Memory usage exceeds 90%'
    },
    {
      id: 'api_response_time_high',
      metricName: 'api_avg_response_time',
      operator: 'gt',
      value: 2000, // 2 seconds
      severity: 'medium',
      enabled: true,
      windowMinutes: 10,
      minDataPoints: 5,
      description: 'API average response time exceeds 2 seconds'
    },
    {
      id: 'api_error_rate_high',
      metricName: 'api_error_rate',
      operator: 'gt',
      value: 5, // 5%
      severity: 'high',
      enabled: true,
      windowMinutes: 5,
      minDataPoints: 3,
      description: 'API error rate exceeds 5%'
    },
    {
      id: 'db_response_time_high',
      metricName: 'db_avg_response_time',
      operator: 'gt',
      value: 1000, // 1 second
      severity: 'medium',
      enabled: true,
      windowMinutes: 10,
      minDataPoints: 5,
      description: 'Database average response time exceeds 1 second'
    },
    {
      id: 'db_connection_pool_high',
      metricName: 'db_connection_pool_utilization',
      operator: 'gt',
      value: 80, // 80%
      severity: 'medium',
      enabled: true,
      windowMinutes: 5,
      minDataPoints: 3,
      description: 'Database connection pool utilization exceeds 80%'
    },
    {
      id: 'redis_memory_usage_high',
      metricName: 'redis_memory_usage',
      operator: 'gt',
      value: 80, // 80%
      severity: 'medium',
      enabled: true,
      windowMinutes: 10,
      minDataPoints: 3,
      description: 'Redis memory usage exceeds 80%'
    },
    {
      id: 'requests_per_minute_spike',
      metricName: 'requests_per_minute',
      operator: 'gt',
      value: 1000,
      severity: 'medium',
      enabled: true,
      windowMinutes: 1,
      minDataPoints: 1,
      description: 'Request rate spike detected (>1000 RPM)'
    }
  ];

  // Default alert channels
  const defaultAlertChannels: AlertChannel[] = [
    {
      id: 'admin_email',
      name: 'Admin Email Alerts',
      type: 'email',
      enabled: process.env.ALERT_EMAIL_ENABLED === 'true',
      config: {
        email: {
          recipients: process.env.ALERT_EMAIL_RECIPIENTS?.split(',') || [],
          subject: 'Auth Service Performance Alert',
          template: 'performance_alert'
        }
      },
      severityFilter: ['high', 'critical'],
      rateLimitMinutes: 15
    },
    {
      id: 'slack_alerts',
      name: 'Slack Alerts',
      type: 'slack',
      enabled: !!process.env.ALERT_SLACK_WEBHOOK,
      config: {
        slack: {
          webhookUrl: process.env.ALERT_SLACK_WEBHOOK || '',
          channel: process.env.ALERT_SLACK_CHANNEL || '#alerts',
          username: 'Auth Service Monitor'
        }
      },
      severityFilter: ['medium', 'high', 'critical'],
      rateLimitMinutes: 5
    },
    {
      id: 'critical_sms',
      name: 'Critical SMS Alerts',
      type: 'sms',
      enabled: process.env.ALERT_SMS_ENABLED === 'true',
      config: {
        sms: {
          recipients: process.env.ALERT_SMS_RECIPIENTS?.split(',') || []
        }
      },
      severityFilter: ['critical'],
      rateLimitMinutes: 60
    }
  ];

  /**
   * Collect system performance metrics
   */
  async function collectSystemMetrics(): Promise<PerformanceMetric[]> {
    const timestamp = new Date();
    const metrics: PerformanceMetric[] = [];

    try {
      // CPU and Memory metrics
      const memoryUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();
      
      metrics.push(
        {
          id: `cpu_usage_${timestamp.getTime()}`,
          name: 'cpu_usage',
          value: Math.random() * 100, // In real implementation, calculate actual CPU usage
          unit: 'percent',
          timestamp,
          source: 'system'
        },
        {
          id: `memory_usage_${timestamp.getTime()}`,
          name: 'memory_usage',
          value: (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100,
          unit: 'percent',
          timestamp,
          source: 'system'
        },
        {
          id: `memory_heap_used_${timestamp.getTime()}`,
          name: 'memory_heap_used',
          value: memoryUsage.heapUsed,
          unit: 'bytes',
          timestamp,
          source: 'system'
        }
      );

      // Database metrics
      const dbMetrics = await collectDatabaseMetrics();
      metrics.push(...dbMetrics);

      // Redis metrics
      const redisMetrics = await collectRedisMetrics();
      metrics.push(...redisMetrics);

      // API metrics
      const apiMetrics = await collectApiMetrics();
      metrics.push(...apiMetrics);

      // Store metrics in history
      performanceHistory.push(...metrics);
      
      // Keep only last 1000 metrics to prevent memory leak
      if (performanceHistory.length > 1000) {
        performanceHistory.splice(0, performanceHistory.length - 1000);
      }

      logger.debug(`Collected ${metrics.length} performance metrics`);
      return metrics;

    } catch (error) {
      logger.error({ error }, 'Failed to collect system metrics');
      return [];
    }
  }

  /**
   * Collect database performance metrics
   */
  async function collectDatabaseMetrics(): Promise<PerformanceMetric[]> {
    const timestamp = new Date();
    const metrics: PerformanceMetric[] = [];

    try {
      // Measure database response time
      const dbStartTime = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      const dbResponseTime = Date.now() - dbStartTime;

      metrics.push({
        id: `db_response_time_${timestamp.getTime()}`,
        name: 'db_response_time',
        value: dbResponseTime,
        unit: 'milliseconds',
        timestamp,
        source: 'database'
      });

      // Get connection pool stats (if available)
      const connectionPoolUtilization = Math.random() * 100; // Mock value
      metrics.push({
        id: `db_connection_pool_${timestamp.getTime()}`,
        name: 'db_connection_pool_utilization',
        value: connectionPoolUtilization,
        unit: 'percent',
        timestamp,
        source: 'database'
      });

    } catch (error) {
      logger.error({ error }, 'Failed to collect database metrics');
      
      // Record database error
      metrics.push({
        id: `db_error_${timestamp.getTime()}`,
        name: 'db_error_count',
        value: 1,
        unit: 'count',
        timestamp,
        source: 'database',
        tags: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    }

    return metrics;
  }

  /**
   * Collect Redis performance metrics
   */
  async function collectRedisMetrics(): Promise<PerformanceMetric[]> {
    const timestamp = new Date();
    const metrics: PerformanceMetric[] = [];

    try {
      const redisClient = redis.getInstance();
      
      // Measure Redis response time
      const redisStartTime = Date.now();
      await redisClient.ping();
      const redisResponseTime = Date.now() - redisStartTime;

      metrics.push({
        id: `redis_response_time_${timestamp.getTime()}`,
        name: 'redis_response_time',
        value: redisResponseTime,
        unit: 'milliseconds',
        timestamp,
        source: 'redis'
      });

      // Get Redis info
      const info = await redisClient.info('memory');
      const memoryMatch = info.match(/used_memory:(\d+)/);
      const maxMemoryMatch = info.match(/maxmemory:(\d+)/);
      
      if (memoryMatch && maxMemoryMatch) {
        const usedMemory = parseInt(memoryMatch[1]);
        const maxMemory = parseInt(maxMemoryMatch[1]);
        const memoryUsage = maxMemory > 0 ? (usedMemory / maxMemory) * 100 : 0;

        metrics.push({
          id: `redis_memory_usage_${timestamp.getTime()}`,
          name: 'redis_memory_usage',
          value: memoryUsage,
          unit: 'percent',
          timestamp,
          source: 'redis'
        });
      }

    } catch (error) {
      logger.error({ error }, 'Failed to collect Redis metrics');
      
      metrics.push({
        id: `redis_error_${timestamp.getTime()}`,
        name: 'redis_error_count',
        value: 1,
        unit: 'count',
        timestamp,
        source: 'redis',
        tags: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    }

    return metrics;
  }

  /**
   * Collect API performance metrics
   */
  async function collectApiMetrics(): Promise<PerformanceMetric[]> {
    const timestamp = new Date();
    const metrics: PerformanceMetric[] = [];

    try {
      // Get metrics from the metrics service
      const realtimeMetrics = await metricsService.getRealtimeMetrics();
      
      // Convert to performance metrics format
      Object.entries(realtimeMetrics).forEach(([key, value]) => {
        if (typeof value === 'number') {
          metrics.push({
            id: `api_${key}_${timestamp.getTime()}`,
            name: `api_${key}`,
            value,
            unit: key.includes('time') ? 'milliseconds' : 
                  key.includes('rate') ? 'percent' : 'count',
            timestamp,
            source: 'application'
          });
        }
      });

    } catch (error) {
      logger.error({ error }, 'Failed to collect API metrics');
    }

    return metrics;
  }

  /**
   * Evaluate performance thresholds
   */
  async function evaluateThresholds(): Promise<PerformanceAlert[]> {
    const newAlerts: PerformanceAlert[] = [];

    for (const threshold of defaultThresholds) {
      if (!threshold.enabled) continue;

      try {
        const alert = await evaluateThreshold(threshold);
        if (alert) {
          newAlerts.push(alert);
        }
      } catch (error) {
        logger.error({ error, thresholdId: threshold.id }, 'Failed to evaluate threshold');
      }
    }

    return newAlerts;
  }

  /**
   * Evaluate single threshold
   */
  async function evaluateThreshold(threshold: PerformanceThreshold): Promise<PerformanceAlert | null> {
    const now = new Date();
    const windowStart = new Date(now.getTime() - threshold.windowMinutes * 60 * 1000);
    
    // Get metrics within the time window
    const windowMetrics = performanceHistory.filter(metric => 
      metric.name === threshold.metricName &&
      metric.timestamp >= windowStart &&
      metric.timestamp <= now
    );

    if (windowMetrics.length < threshold.minDataPoints) {
      return null; // Not enough data points
    }

    // Calculate the current value (average of window)
    const currentValue = windowMetrics.reduce((sum, metric) => sum + metric.value, 0) / windowMetrics.length;

    // Check if threshold is violated
    let thresholdViolated = false;
    switch (threshold.operator) {
      case 'gt':
        thresholdViolated = currentValue > threshold.value;
        break;
      case 'gte':
        thresholdViolated = currentValue >= threshold.value;
        break;
      case 'lt':
        thresholdViolated = currentValue < threshold.value;
        break;
      case 'lte':
        thresholdViolated = currentValue <= threshold.value;
        break;
      case 'eq':
        thresholdViolated = currentValue === threshold.value;
        break;
      case 'ne':
        thresholdViolated = currentValue !== threshold.value;
        break;
    }

    if (!thresholdViolated) {
      // Check if there's an active alert to resolve
      const existingAlert = activeAlerts.get(threshold.id);
      if (existingAlert) {
        existingAlert.resolved = now;
        existingAlert.resolvedBy = 'system';
        activeAlerts.delete(threshold.id);
        logger.info({ alertId: existingAlert.id, thresholdId: threshold.id }, 'Alert resolved');
        
        eventEmitter.emit('alertResolved', existingAlert);
      }
      return null;
    }

    // Check if alert already exists
    if (activeAlerts.has(threshold.id)) {
      return null; // Alert already active
    }

    // Create new alert
    const alert: PerformanceAlert = {
      id: `alert_${threshold.id}_${Date.now()}`,
      thresholdId: threshold.id,
      metricName: threshold.metricName,
      severity: threshold.severity,
      message: `${threshold.description}. Current value: ${currentValue.toFixed(2)} ${threshold.operator} ${threshold.value}`,
      currentValue,
      thresholdValue: threshold.value,
      timestamp: now,
      notificationsSent: []
    };

    activeAlerts.set(threshold.id, alert);
    alertHistory.push(alert);

    logger.warn({ 
      alertId: alert.id, 
      thresholdId: threshold.id,
      severity: alert.severity,
      currentValue: alert.currentValue,
      thresholdValue: alert.thresholdValue
    }, 'Performance alert triggered');

    eventEmitter.emit('alertTriggered', alert);
    
    return alert;
  }

  /**
   * Send alert notifications
   */
  async function sendAlertNotifications(alert: PerformanceAlert): Promise<void> {
    const eligibleChannels = defaultAlertChannels.filter(channel => 
      channel.enabled && 
      channel.severityFilter.includes(alert.severity)
    );

    for (const channel of eligibleChannels) {
      try {
        // Check rate limiting
        const lastNotificationKey = `alert_notification:${channel.id}`;
        const lastNotification = await redis.getInstance().get(lastNotificationKey);
        
        if (lastNotification) {
          const lastTime = new Date(lastNotification);
          const timeSinceLastNotification = Date.now() - lastTime.getTime();
          if (timeSinceLastNotification < channel.rateLimitMinutes * 60 * 1000) {
            continue; // Skip due to rate limiting
          }
        }

        await sendNotificationToChannel(alert, channel);
        
        // Record notification sent
        alert.notificationsSent.push(channel.id);
        await redis.getInstance().setex(
          lastNotificationKey, 
          channel.rateLimitMinutes * 60, 
          new Date().toISOString()
        );

        logger.info({ 
          alertId: alert.id, 
          channelId: channel.id, 
          channelType: channel.type 
        }, 'Alert notification sent');

      } catch (error) {
        logger.error({ 
          error, 
          alertId: alert.id, 
          channelId: channel.id 
        }, 'Failed to send alert notification');
      }
    }
  }

  /**
   * Send notification to specific channel
   */
  async function sendNotificationToChannel(alert: PerformanceAlert, channel: AlertChannel): Promise<void> {
    switch (channel.type) {
      case 'email':
        if (channel.config.email) {
          await emailService.sendEmail({
            to: channel.config.email.recipients,
            subject: channel.config.email.subject || 'Performance Alert',
            templateName: channel.config.email.template || 'performance_alert',
            templateData: {
              alertId: alert.id,
              severity: alert.severity,
              message: alert.message,
              currentValue: alert.currentValue,
              thresholdValue: alert.thresholdValue,
              timestamp: alert.timestamp.toISOString(),
              metricName: alert.metricName
            }
          });
        }
        break;

      case 'slack':
        if (channel.config.slack) {
          await sendSlackNotification(alert, channel.config.slack);
        }
        break;

      case 'webhook':
        if (channel.config.webhook) {
          await sendWebhookNotification(alert, channel.config.webhook);
        }
        break;

      case 'sms':
        // SMS implementation would go here
        logger.info({ alertId: alert.id }, 'SMS notification not implemented');
        break;

      case 'pagerduty':
        // PagerDuty implementation would go here
        logger.info({ alertId: alert.id }, 'PagerDuty notification not implemented');
        break;

      default:
        logger.warn({ channelType: channel.type }, 'Unknown notification channel type');
    }
  }

  /**
   * Send Slack notification
   */
  async function sendSlackNotification(alert: PerformanceAlert, config: AlertChannel['config']['slack']): Promise<void> {
    if (!config?.webhookUrl) return;

    const color = {
      low: '#36a64f',      // Green
      medium: '#ff9900',   // Orange
      high: '#ff0000',     // Red
      critical: '#8B0000'  // Dark Red
    }[alert.severity];

    const payload = {
      channel: config.channel,
      username: config.username,
      attachments: [{
        color,
        title: `🚨 Performance Alert - ${alert.severity.toUpperCase()}`,
        text: alert.message,
        fields: [
          {
            title: 'Metric',
            value: alert.metricName,
            short: true
          },
          {
            title: 'Current Value',
            value: alert.currentValue.toFixed(2),
            short: true
          },
          {
            title: 'Threshold',
            value: alert.thresholdValue.toString(),
            short: true
          },
          {
            title: 'Timestamp',
            value: alert.timestamp.toISOString(),
            short: true
          }
        ],
        footer: 'Auth Service Monitor',
        ts: Math.floor(alert.timestamp.getTime() / 1000)
      }]
    };

    const response = await fetch(config.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Slack notification failed: ${response.status} ${response.statusText}`);
    }
  }

  /**
   * Send webhook notification
   */
  async function sendWebhookNotification(alert: PerformanceAlert, config: AlertChannel['config']['webhook']): Promise<void> {
    if (!config?.url) return;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...config.headers
    };

    // Add authentication if configured
    if (config.auth) {
      switch (config.auth.type) {
        case 'bearer':
          if (config.auth.token) {
            headers['Authorization'] = `Bearer ${config.auth.token}`;
          }
          break;
        case 'basic':
          if (config.auth.username && config.auth.password) {
            const credentials = Buffer.from(`${config.auth.username}:${config.auth.password}`).toString('base64');
            headers['Authorization'] = `Basic ${credentials}`;
          }
          break;
      }
    }

    const payload = {
      alert: {
        id: alert.id,
        severity: alert.severity,
        message: alert.message,
        metricName: alert.metricName,
        currentValue: alert.currentValue,
        thresholdValue: alert.thresholdValue,
        timestamp: alert.timestamp.toISOString()
      },
      service: 'auth-service',
      environment: process.env.NODE_ENV || 'development'
    };

    const response = await fetch(config.url, {
      method: config.method || 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Webhook notification failed: ${response.status} ${response.statusText}`);
    }
  }

  /**
   * Get current system health snapshot
   */
  async function getSystemHealthSnapshot(): Promise<SystemHealthSnapshot> {
    try {
      const timestamp = new Date();
      
      // Collect current metrics
      const currentMetrics = await collectSystemMetrics();
      
      // Calculate health scores
      const memoryUsage = process.memoryUsage();
      const activeAlertsArray = Array.from(activeAlerts.values());
      
      const criticalAlerts = activeAlertsArray.filter(a => a.severity === 'critical').length;
      const highAlerts = activeAlertsArray.filter(a => a.severity === 'high').length;
      
      // Determine overall health
      let overall: SystemHealthSnapshot['overall'] = 'healthy';
      if (criticalAlerts > 0) {
        overall = 'critical';
      } else if (highAlerts > 0) {
        overall = 'unhealthy';
      } else if (activeAlertsArray.length > 0) {
        overall = 'degraded';
      }

      return {
        timestamp,
        overall,
        metrics: {
          cpu: {
            usage: Math.random() * 100, // Mock value
            loadAverage: [1.5, 1.2, 1.1] // Mock values
          },
          memory: {
            used: memoryUsage.heapUsed,
            total: memoryUsage.heapTotal,
            heapUsed: memoryUsage.heapUsed,
            heapTotal: memoryUsage.heapTotal,
            usage: (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100
          },
          database: {
            connectionCount: 10, // Mock value
            avgResponseTime: 50, // Mock value
            errorRate: 0.1, // Mock value
            connectionPoolUtilization: 25 // Mock value
          },
          redis: {
            connectionCount: 5, // Mock value
            avgResponseTime: 10, // Mock value
            errorRate: 0, // Mock value
            memoryUsage: 45 // Mock value
          },
          api: {
            requestsPerMinute: 150, // Mock value
            avgResponseTime: 250, // Mock value
            errorRate: 1.2, // Mock value
            activeConnections: 8 // Mock value
          },
          external: {
            emailServiceHealth: 'up',
            smsServiceHealth: 'up',
            oauthProvidersHealth: {
              google: 'up',
              github: 'up'
            }
          }
        },
        alerts: {
          active: activeAlertsArray.length,
          critical: criticalAlerts,
          high: highAlerts,
          medium: activeAlertsArray.filter(a => a.severity === 'medium').length,
          low: activeAlertsArray.filter(a => a.severity === 'low').length
        }
      };

    } catch (error) {
      logger.error({ error }, 'Failed to get system health snapshot');
      throw error;
    }
  }

  /**
   * Start performance monitoring
   */
  function startMonitoring(): void {
    logger.info('Starting performance monitoring');

    // Collect metrics every 30 seconds
    const metricsInterval = setInterval(async () => {
      try {
        await collectSystemMetrics();
      } catch (error) {
        logger.error({ error }, 'Error in metrics collection interval');
      }
    }, 30000);

    // Evaluate thresholds every minute
    const thresholdInterval = setInterval(async () => {
      try {
        const newAlerts = await evaluateThresholds();
        
        // Send notifications for new alerts
        for (const alert of newAlerts) {
          await sendAlertNotifications(alert);
        }
      } catch (error) {
        logger.error({ error }, 'Error in threshold evaluation interval');
      }
    }, 60000);

    // Set up event listeners
    eventEmitter.on('alertTriggered', async (alert: PerformanceAlert) => {
      await sendAlertNotifications(alert);
    });

    eventEmitter.on('alertResolved', (alert: PerformanceAlert) => {
      logger.info({ alertId: alert.id }, 'Performance alert resolved');
    });

    // Store interval references for cleanup
    (startMonitoring as any).intervals = [metricsInterval, thresholdInterval];
  }

  /**
   * Stop performance monitoring
   */
  function stopMonitoring(): void {
    logger.info('Stopping performance monitoring');
    
    const intervals = (startMonitoring as any).intervals || [];
    intervals.forEach(clearInterval);
    
    eventEmitter.removeAllListeners();
  }

  return {
    collectSystemMetrics,
    collectDatabaseMetrics,
    collectRedisMetrics,
    collectApiMetrics,
    evaluateThresholds,
    evaluateThreshold,
    sendAlertNotifications,
    getSystemHealthSnapshot,
    startMonitoring,
    stopMonitoring,
    
    // Getters for monitoring data
    getActiveAlerts: () => Array.from(activeAlerts.values()),
    getAlertHistory: () => [...alertHistory],
    getPerformanceHistory: () => [...performanceHistory],
    getThresholds: () => [...defaultThresholds],
    getAlertChannels: () => [...defaultAlertChannels],
    
    // Event emitter for external subscriptions
    on: eventEmitter.on.bind(eventEmitter),
    off: eventEmitter.off.bind(eventEmitter),
    emit: eventEmitter.emit.bind(eventEmitter)
  };
}

// Type exports
export type PerformanceMonitorService = ReturnType<typeof createPerformanceMonitorService>;