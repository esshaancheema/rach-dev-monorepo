/**
 * Performance Monitoring Configuration
 * 
 * This file contains configuration for performance monitoring,
 * alerting thresholds, and notification channels.
 */

export interface PerformanceMonitoringConfig {
  enabled: boolean;
  collection: {
    metricsInterval: number; // seconds
    thresholdEvaluationInterval: number; // seconds
    historyRetentionHours: number;
    sampleRate: number; // 0-1
  };
  thresholds: {
    cpu: {
      warningThreshold: number; // percentage
      criticalThreshold: number; // percentage
      windowMinutes: number;
      minDataPoints: number;
    };
    memory: {
      warningThreshold: number; // percentage
      criticalThreshold: number; // percentage
      windowMinutes: number;
      minDataPoints: number;
    };
    api: {
      responseTime: {
        warningMs: number;
        criticalMs: number;
        windowMinutes: number;
        minDataPoints: number;
      };
      errorRate: {
        warningPercent: number;
        criticalPercent: number;
        windowMinutes: number;
        minDataPoints: number;
      };
      requestRate: {
        spikeThreshold: number; // requests per minute
        sustainedThreshold: number; // requests per minute over windowMinutes
        windowMinutes: number;
      };
    };
    database: {
      responseTime: {
        warningMs: number;
        criticalMs: number;
        windowMinutes: number;
        minDataPoints: number;
      };
      connectionPool: {
        warningPercent: number;
        criticalPercent: number;
        windowMinutes: number;
        minDataPoints: number;
      };
      errorRate: {
        warningPercent: number;
        criticalPercent: number;
        windowMinutes: number;
        minDataPoints: number;
      };
    };
    redis: {
      responseTime: {
        warningMs: number;
        criticalMs: number;
        windowMinutes: number;
        minDataPoints: number;
      };
      memoryUsage: {
        warningPercent: number;
        criticalPercent: number;
        windowMinutes: number;
        minDataPoints: number;
      };
      errorRate: {
        warningPercent: number;
        criticalPercent: number;
        windowMinutes: number;
        minDataPoints: number;
      };
    };
  };
  alerting: {
    enabled: boolean;
    channels: {
      email: {
        enabled: boolean;
        recipients: string[];
        severityFilter: string[];
        rateLimitMinutes: number;
        templates: {
          subject: string;
          template: string;
        };
      };
      slack: {
        enabled: boolean;
        webhookUrl: string;
        channel: string;
        username: string;
        severityFilter: string[];
        rateLimitMinutes: number;
      };
      webhook: {
        enabled: boolean;
        url: string;
        method: 'POST' | 'PUT';
        headers: Record<string, string>;
        auth?: {
          type: 'bearer' | 'basic';
          token?: string;
          username?: string;
          password?: string;
        };
        severityFilter: string[];
        rateLimitMinutes: number;
      };
      sms: {
        enabled: boolean;
        recipients: string[];
        severityFilter: string[];
        rateLimitMinutes: number;
      };
    };
    escalation: {
      enabled: boolean;
      rules: Array<{
        severity: string;
        escalateAfterMinutes: number;
        escalateTo: string[];
      }>;
    };
  };
  healthCheck: {
    enabled: boolean;
    interval: number; // seconds
    endpoints: Array<{
      name: string;
      url: string;
      timeout: number;
      expectedStatus: number[];
      critical: boolean;
    }>;
  };
  reporting: {
    enabled: boolean;
    dailyReport: {
      enabled: boolean;
      time: string; // HH:MM format
      recipients: string[];
    };
    weeklyReport: {
      enabled: boolean;
      day: string; // monday, tuesday, etc.
      time: string;
      recipients: string[];
    };
    monthlyReport: {
      enabled: boolean;
      day: number; // 1-28
      time: string;
      recipients: string[];
    };
  };
}

// Default configuration
export const defaultPerformanceMonitoringConfig: PerformanceMonitoringConfig = {
  enabled: process.env.PERFORMANCE_MONITORING_ENABLED !== 'false',
  
  collection: {
    metricsInterval: parseInt(process.env.PERF_METRICS_INTERVAL || '30'),
    thresholdEvaluationInterval: parseInt(process.env.PERF_THRESHOLD_INTERVAL || '60'),
    historyRetentionHours: parseInt(process.env.PERF_HISTORY_RETENTION_HOURS || '24'),
    sampleRate: parseFloat(process.env.PERF_SAMPLE_RATE || '1.0')
  },
  
  thresholds: {
    cpu: {
      warningThreshold: parseInt(process.env.PERF_CPU_WARNING || '70'),
      criticalThreshold: parseInt(process.env.PERF_CPU_CRITICAL || '90'),
      windowMinutes: parseInt(process.env.PERF_CPU_WINDOW || '5'),
      minDataPoints: parseInt(process.env.PERF_CPU_MIN_POINTS || '3')
    },
    memory: {
      warningThreshold: parseInt(process.env.PERF_MEMORY_WARNING || '80'),
      criticalThreshold: parseInt(process.env.PERF_MEMORY_CRITICAL || '95'),
      windowMinutes: parseInt(process.env.PERF_MEMORY_WINDOW || '2'),
      minDataPoints: parseInt(process.env.PERF_MEMORY_MIN_POINTS || '2')
    },
    api: {
      responseTime: {
        warningMs: parseInt(process.env.PERF_API_RESPONSE_WARNING || '1000'),
        criticalMs: parseInt(process.env.PERF_API_RESPONSE_CRITICAL || '3000'),
        windowMinutes: parseInt(process.env.PERF_API_RESPONSE_WINDOW || '10'),
        minDataPoints: parseInt(process.env.PERF_API_RESPONSE_MIN_POINTS || '5')
      },
      errorRate: {
        warningPercent: parseFloat(process.env.PERF_API_ERROR_WARNING || '2.0'),
        criticalPercent: parseFloat(process.env.PERF_API_ERROR_CRITICAL || '5.0'),
        windowMinutes: parseInt(process.env.PERF_API_ERROR_WINDOW || '5'),
        minDataPoints: parseInt(process.env.PERF_API_ERROR_MIN_POINTS || '10')
      },
      requestRate: {
        spikeThreshold: parseInt(process.env.PERF_API_SPIKE_THRESHOLD || '1000'),
        sustainedThreshold: parseInt(process.env.PERF_API_SUSTAINED_THRESHOLD || '500'),
        windowMinutes: parseInt(process.env.PERF_API_RATE_WINDOW || '5')
      }
    },
    database: {
      responseTime: {
        warningMs: parseInt(process.env.PERF_DB_RESPONSE_WARNING || '500'),
        criticalMs: parseInt(process.env.PERF_DB_RESPONSE_CRITICAL || '2000'),
        windowMinutes: parseInt(process.env.PERF_DB_RESPONSE_WINDOW || '10'),
        minDataPoints: parseInt(process.env.PERF_DB_RESPONSE_MIN_POINTS || '5')
      },
      connectionPool: {
        warningPercent: parseInt(process.env.PERF_DB_POOL_WARNING || '70'),
        criticalPercent: parseInt(process.env.PERF_DB_POOL_CRITICAL || '90'),
        windowMinutes: parseInt(process.env.PERF_DB_POOL_WINDOW || '5'),
        minDataPoints: parseInt(process.env.PERF_DB_POOL_MIN_POINTS || '3')
      },
      errorRate: {
        warningPercent: parseFloat(process.env.PERF_DB_ERROR_WARNING || '1.0'),
        criticalPercent: parseFloat(process.env.PERF_DB_ERROR_CRITICAL || '3.0'),
        windowMinutes: parseInt(process.env.PERF_DB_ERROR_WINDOW || '10'),
        minDataPoints: parseInt(process.env.PERF_DB_ERROR_MIN_POINTS || '5')
      }
    },
    redis: {
      responseTime: {
        warningMs: parseInt(process.env.PERF_REDIS_RESPONSE_WARNING || '100'),
        criticalMs: parseInt(process.env.PERF_REDIS_RESPONSE_CRITICAL || '500'),
        windowMinutes: parseInt(process.env.PERF_REDIS_RESPONSE_WINDOW || '10'),
        minDataPoints: parseInt(process.env.PERF_REDIS_RESPONSE_MIN_POINTS || '5')
      },
      memoryUsage: {
        warningPercent: parseInt(process.env.PERF_REDIS_MEMORY_WARNING || '80'),
        criticalPercent: parseInt(process.env.PERF_REDIS_MEMORY_CRITICAL || '95'),
        windowMinutes: parseInt(process.env.PERF_REDIS_MEMORY_WINDOW || '10'),
        minDataPoints: parseInt(process.env.PERF_REDIS_MEMORY_MIN_POINTS || '3')
      },
      errorRate: {
        warningPercent: parseFloat(process.env.PERF_REDIS_ERROR_WARNING || '0.5'),
        criticalPercent: parseFloat(process.env.PERF_REDIS_ERROR_CRITICAL || '2.0'),
        windowMinutes: parseInt(process.env.PERF_REDIS_ERROR_WINDOW || '10'),
        minDataPoints: parseInt(process.env.PERF_REDIS_ERROR_MIN_POINTS || '5')
      }
    }
  },
  
  alerting: {
    enabled: process.env.PERF_ALERTING_ENABLED !== 'false',
    channels: {
      email: {
        enabled: process.env.PERF_EMAIL_ALERTS_ENABLED === 'true',
        recipients: process.env.PERF_EMAIL_RECIPIENTS?.split(',') || [],
        severityFilter: process.env.PERF_EMAIL_SEVERITY?.split(',') || ['high', 'critical'],
        rateLimitMinutes: parseInt(process.env.PERF_EMAIL_RATE_LIMIT || '15'),
        templates: {
          subject: process.env.PERF_EMAIL_SUBJECT || 'Auth Service Performance Alert',
          template: process.env.PERF_EMAIL_TEMPLATE || 'performance_alert'
        }
      },
      slack: {
        enabled: !!process.env.PERF_SLACK_WEBHOOK,
        webhookUrl: process.env.PERF_SLACK_WEBHOOK || '',
        channel: process.env.PERF_SLACK_CHANNEL || '#alerts',
        username: process.env.PERF_SLACK_USERNAME || 'Performance Monitor',
        severityFilter: process.env.PERF_SLACK_SEVERITY?.split(',') || ['medium', 'high', 'critical'],
        rateLimitMinutes: parseInt(process.env.PERF_SLACK_RATE_LIMIT || '5')
      },
      webhook: {
        enabled: !!process.env.PERF_WEBHOOK_URL,
        url: process.env.PERF_WEBHOOK_URL || '',
        method: (process.env.PERF_WEBHOOK_METHOD as 'POST' | 'PUT') || 'POST',
        headers: JSON.parse(process.env.PERF_WEBHOOK_HEADERS || '{}'),
        auth: process.env.PERF_WEBHOOK_AUTH_TYPE ? {
          type: process.env.PERF_WEBHOOK_AUTH_TYPE as 'bearer' | 'basic',
          token: process.env.PERF_WEBHOOK_AUTH_TOKEN,
          username: process.env.PERF_WEBHOOK_AUTH_USERNAME,
          password: process.env.PERF_WEBHOOK_AUTH_PASSWORD
        } : undefined,
        severityFilter: process.env.PERF_WEBHOOK_SEVERITY?.split(',') || ['high', 'critical'],
        rateLimitMinutes: parseInt(process.env.PERF_WEBHOOK_RATE_LIMIT || '10')
      },
      sms: {
        enabled: process.env.PERF_SMS_ALERTS_ENABLED === 'true',
        recipients: process.env.PERF_SMS_RECIPIENTS?.split(',') || [],
        severityFilter: process.env.PERF_SMS_SEVERITY?.split(',') || ['critical'],
        rateLimitMinutes: parseInt(process.env.PERF_SMS_RATE_LIMIT || '60')
      }
    },
    escalation: {
      enabled: process.env.PERF_ESCALATION_ENABLED === 'true',
      rules: [
        {
          severity: 'critical',
          escalateAfterMinutes: parseInt(process.env.PERF_ESCALATE_CRITICAL_AFTER || '5'),
          escalateTo: process.env.PERF_ESCALATE_CRITICAL_TO?.split(',') || []
        },
        {
          severity: 'high',
          escalateAfterMinutes: parseInt(process.env.PERF_ESCALATE_HIGH_AFTER || '15'),
          escalateTo: process.env.PERF_ESCALATE_HIGH_TO?.split(',') || []
        }
      ]
    }
  },
  
  healthCheck: {
    enabled: process.env.PERF_HEALTH_CHECK_ENABLED !== 'false',
    interval: parseInt(process.env.PERF_HEALTH_CHECK_INTERVAL || '60'),
    endpoints: [
      {
        name: 'auth_service_health',
        url: process.env.API_URL + '/health' || 'http://localhost:3000/health',
        timeout: parseInt(process.env.PERF_HEALTH_TIMEOUT || '5000'),
        expectedStatus: [200],
        critical: true
      },
      {
        name: 'auth_service_ready',
        url: process.env.API_URL + '/ready' || 'http://localhost:3000/ready',
        timeout: parseInt(process.env.PERF_HEALTH_TIMEOUT || '5000'),
        expectedStatus: [200],
        critical: false
      }
    ]
  },
  
  reporting: {
    enabled: process.env.PERF_REPORTING_ENABLED === 'true',
    dailyReport: {
      enabled: process.env.PERF_DAILY_REPORT_ENABLED === 'true',
      time: process.env.PERF_DAILY_REPORT_TIME || '09:00',
      recipients: process.env.PERF_DAILY_REPORT_RECIPIENTS?.split(',') || []
    },
    weeklyReport: {
      enabled: process.env.PERF_WEEKLY_REPORT_ENABLED === 'true',
      day: process.env.PERF_WEEKLY_REPORT_DAY || 'monday',
      time: process.env.PERF_WEEKLY_REPORT_TIME || '09:00',
      recipients: process.env.PERF_WEEKLY_REPORT_RECIPIENTS?.split(',') || []
    },
    monthlyReport: {
      enabled: process.env.PERF_MONTHLY_REPORT_ENABLED === 'true',
      day: parseInt(process.env.PERF_MONTHLY_REPORT_DAY || '1'),
      time: process.env.PERF_MONTHLY_REPORT_TIME || '09:00',
      recipients: process.env.PERF_MONTHLY_REPORT_RECIPIENTS?.split(',') || []
    }
  }
};

// Environment variables documentation
export const performanceMonitoringEnvironmentVariables = {
  // Main toggle
  PERFORMANCE_MONITORING_ENABLED: 'Enable/disable performance monitoring (default: true)',
  
  // Collection settings
  PERF_METRICS_INTERVAL: 'Metrics collection interval in seconds (default: 30)',
  PERF_THRESHOLD_INTERVAL: 'Threshold evaluation interval in seconds (default: 60)',
  PERF_HISTORY_RETENTION_HOURS: 'How long to keep metrics history in hours (default: 24)',
  PERF_SAMPLE_RATE: 'Sample rate for request tracking 0.0-1.0 (default: 1.0)',
  
  // CPU thresholds
  PERF_CPU_WARNING: 'CPU usage warning threshold percentage (default: 70)',
  PERF_CPU_CRITICAL: 'CPU usage critical threshold percentage (default: 90)',
  PERF_CPU_WINDOW: 'CPU evaluation window in minutes (default: 5)',
  PERF_CPU_MIN_POINTS: 'Minimum data points for CPU alerts (default: 3)',
  
  // Memory thresholds
  PERF_MEMORY_WARNING: 'Memory usage warning threshold percentage (default: 80)',
  PERF_MEMORY_CRITICAL: 'Memory usage critical threshold percentage (default: 95)',
  PERF_MEMORY_WINDOW: 'Memory evaluation window in minutes (default: 2)',
  PERF_MEMORY_MIN_POINTS: 'Minimum data points for memory alerts (default: 2)',
  
  // API thresholds
  PERF_API_RESPONSE_WARNING: 'API response time warning threshold in ms (default: 1000)',
  PERF_API_RESPONSE_CRITICAL: 'API response time critical threshold in ms (default: 3000)',
  PERF_API_RESPONSE_WINDOW: 'API response time window in minutes (default: 10)',
  PERF_API_RESPONSE_MIN_POINTS: 'Minimum data points for API response alerts (default: 5)',
  
  PERF_API_ERROR_WARNING: 'API error rate warning threshold percentage (default: 2.0)',
  PERF_API_ERROR_CRITICAL: 'API error rate critical threshold percentage (default: 5.0)',
  PERF_API_ERROR_WINDOW: 'API error rate window in minutes (default: 5)',
  PERF_API_ERROR_MIN_POINTS: 'Minimum data points for API error alerts (default: 10)',
  
  PERF_API_SPIKE_THRESHOLD: 'API request spike threshold per minute (default: 1000)',
  PERF_API_SUSTAINED_THRESHOLD: 'API sustained request threshold per minute (default: 500)',
  PERF_API_RATE_WINDOW: 'API request rate window in minutes (default: 5)',
  
  // Database thresholds
  PERF_DB_RESPONSE_WARNING: 'Database response time warning threshold in ms (default: 500)',
  PERF_DB_RESPONSE_CRITICAL: 'Database response time critical threshold in ms (default: 2000)',
  PERF_DB_RESPONSE_WINDOW: 'Database response time window in minutes (default: 10)',
  PERF_DB_RESPONSE_MIN_POINTS: 'Minimum data points for DB response alerts (default: 5)',
  
  PERF_DB_POOL_WARNING: 'Database connection pool warning threshold percentage (default: 70)',
  PERF_DB_POOL_CRITICAL: 'Database connection pool critical threshold percentage (default: 90)',
  PERF_DB_POOL_WINDOW: 'Database pool window in minutes (default: 5)',
  PERF_DB_POOL_MIN_POINTS: 'Minimum data points for DB pool alerts (default: 3)',
  
  PERF_DB_ERROR_WARNING: 'Database error rate warning threshold percentage (default: 1.0)',
  PERF_DB_ERROR_CRITICAL: 'Database error rate critical threshold percentage (default: 3.0)',
  PERF_DB_ERROR_WINDOW: 'Database error rate window in minutes (default: 10)',
  PERF_DB_ERROR_MIN_POINTS: 'Minimum data points for DB error alerts (default: 5)',
  
  // Redis thresholds
  PERF_REDIS_RESPONSE_WARNING: 'Redis response time warning threshold in ms (default: 100)',
  PERF_REDIS_RESPONSE_CRITICAL: 'Redis response time critical threshold in ms (default: 500)',
  PERF_REDIS_RESPONSE_WINDOW: 'Redis response time window in minutes (default: 10)',
  PERF_REDIS_RESPONSE_MIN_POINTS: 'Minimum data points for Redis response alerts (default: 5)',
  
  PERF_REDIS_MEMORY_WARNING: 'Redis memory usage warning threshold percentage (default: 80)',
  PERF_REDIS_MEMORY_CRITICAL: 'Redis memory usage critical threshold percentage (default: 95)',
  PERF_REDIS_MEMORY_WINDOW: 'Redis memory window in minutes (default: 10)',
  PERF_REDIS_MEMORY_MIN_POINTS: 'Minimum data points for Redis memory alerts (default: 3)',
  
  PERF_REDIS_ERROR_WARNING: 'Redis error rate warning threshold percentage (default: 0.5)',
  PERF_REDIS_ERROR_CRITICAL: 'Redis error rate critical threshold percentage (default: 2.0)',
  PERF_REDIS_ERROR_WINDOW: 'Redis error rate window in minutes (default: 10)',
  PERF_REDIS_ERROR_MIN_POINTS: 'Minimum data points for Redis error alerts (default: 5)',
  
  // Alerting
  PERF_ALERTING_ENABLED: 'Enable/disable performance alerting (default: true)',
  
  // Email alerts
  PERF_EMAIL_ALERTS_ENABLED: 'Enable email alerts (default: false)',
  PERF_EMAIL_RECIPIENTS: 'Comma-separated list of email recipients',
  PERF_EMAIL_SEVERITY: 'Comma-separated list of severity levels for email (default: high,critical)',
  PERF_EMAIL_RATE_LIMIT: 'Email rate limit in minutes (default: 15)',
  PERF_EMAIL_SUBJECT: 'Email alert subject (default: Auth Service Performance Alert)',
  PERF_EMAIL_TEMPLATE: 'Email template name (default: performance_alert)',
  
  // Slack alerts
  PERF_SLACK_WEBHOOK: 'Slack webhook URL for alerts',
  PERF_SLACK_CHANNEL: 'Slack channel for alerts (default: #alerts)',
  PERF_SLACK_USERNAME: 'Slack username for alerts (default: Performance Monitor)',
  PERF_SLACK_SEVERITY: 'Comma-separated list of severity levels for Slack (default: medium,high,critical)',
  PERF_SLACK_RATE_LIMIT: 'Slack rate limit in minutes (default: 5)',
  
  // Webhook alerts
  PERF_WEBHOOK_URL: 'Webhook URL for alerts',
  PERF_WEBHOOK_METHOD: 'Webhook HTTP method (default: POST)',
  PERF_WEBHOOK_HEADERS: 'Webhook headers as JSON object (default: {})',
  PERF_WEBHOOK_AUTH_TYPE: 'Webhook auth type (bearer or basic)',
  PERF_WEBHOOK_AUTH_TOKEN: 'Webhook bearer token',
  PERF_WEBHOOK_AUTH_USERNAME: 'Webhook basic auth username',
  PERF_WEBHOOK_AUTH_PASSWORD: 'Webhook basic auth password',
  PERF_WEBHOOK_SEVERITY: 'Comma-separated list of severity levels for webhook (default: high,critical)',
  PERF_WEBHOOK_RATE_LIMIT: 'Webhook rate limit in minutes (default: 10)',
  
  // SMS alerts
  PERF_SMS_ALERTS_ENABLED: 'Enable SMS alerts (default: false)',
  PERF_SMS_RECIPIENTS: 'Comma-separated list of SMS recipients',
  PERF_SMS_SEVERITY: 'Comma-separated list of severity levels for SMS (default: critical)',
  PERF_SMS_RATE_LIMIT: 'SMS rate limit in minutes (default: 60)',
  
  // Escalation
  PERF_ESCALATION_ENABLED: 'Enable alert escalation (default: false)',
  PERF_ESCALATE_CRITICAL_AFTER: 'Minutes before escalating critical alerts (default: 5)',
  PERF_ESCALATE_CRITICAL_TO: 'Comma-separated list of escalation contacts for critical alerts',
  PERF_ESCALATE_HIGH_AFTER: 'Minutes before escalating high alerts (default: 15)',
  PERF_ESCALATE_HIGH_TO: 'Comma-separated list of escalation contacts for high alerts',
  
  // Health checks
  PERF_HEALTH_CHECK_ENABLED: 'Enable health check monitoring (default: true)',
  PERF_HEALTH_CHECK_INTERVAL: 'Health check interval in seconds (default: 60)',
  PERF_HEALTH_TIMEOUT: 'Health check timeout in milliseconds (default: 5000)',
  
  // Reporting
  PERF_REPORTING_ENABLED: 'Enable performance reporting (default: false)',
  PERF_DAILY_REPORT_ENABLED: 'Enable daily performance reports (default: false)',
  PERF_DAILY_REPORT_TIME: 'Daily report time in HH:MM format (default: 09:00)',
  PERF_DAILY_REPORT_RECIPIENTS: 'Comma-separated list of daily report recipients',
  
  PERF_WEEKLY_REPORT_ENABLED: 'Enable weekly performance reports (default: false)',
  PERF_WEEKLY_REPORT_DAY: 'Weekly report day (monday, tuesday, etc.) (default: monday)',
  PERF_WEEKLY_REPORT_TIME: 'Weekly report time in HH:MM format (default: 09:00)',
  PERF_WEEKLY_REPORT_RECIPIENTS: 'Comma-separated list of weekly report recipients',
  
  PERF_MONTHLY_REPORT_ENABLED: 'Enable monthly performance reports (default: false)',
  PERF_MONTHLY_REPORT_DAY: 'Monthly report day (1-28) (default: 1)',
  PERF_MONTHLY_REPORT_TIME: 'Monthly report time in HH:MM format (default: 09:00)',
  PERF_MONTHLY_REPORT_RECIPIENTS: 'Comma-separated list of monthly report recipients'
};

// Validation function
export function validatePerformanceConfig(config: PerformanceMonitoringConfig): string[] {
  const errors: string[] = [];
  
  // Validate collection settings
  if (config.collection.metricsInterval < 10 || config.collection.metricsInterval > 3600) {
    errors.push('collection.metricsInterval must be between 10 and 3600 seconds');
  }
  
  if (config.collection.sampleRate < 0 || config.collection.sampleRate > 1) {
    errors.push('collection.sampleRate must be between 0 and 1');
  }
  
  // Validate thresholds
  if (config.thresholds.cpu.warningThreshold >= config.thresholds.cpu.criticalThreshold) {
    errors.push('CPU warning threshold must be less than critical threshold');
  }
  
  if (config.thresholds.memory.warningThreshold >= config.thresholds.memory.criticalThreshold) {
    errors.push('Memory warning threshold must be less than critical threshold');
  }
  
  // Validate alerting configuration
  if (config.alerting.enabled) {
    const { email, slack, webhook, sms } = config.alerting.channels;
    
    if (email.enabled && email.recipients.length === 0) {
      errors.push('Email alerting enabled but no recipients configured');
    }
    
    if (slack.enabled && !slack.webhookUrl) {
      errors.push('Slack alerting enabled but no webhook URL configured');
    }
    
    if (webhook.enabled && !webhook.url) {
      errors.push('Webhook alerting enabled but no URL configured');
    }
    
    if (sms.enabled && sms.recipients.length === 0) {
      errors.push('SMS alerting enabled but no recipients configured');
    }
  }
  
  return errors;
}

// Helper function to get current config
export function getCurrentPerformanceConfig(): PerformanceMonitoringConfig {
  return defaultPerformanceMonitoringConfig;
}