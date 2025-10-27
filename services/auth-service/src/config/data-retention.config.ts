/**
 * Data Retention Configuration
 * 
 * This file contains configuration for data retention policies,
 * cleanup schedules, and system behavior.
 */

export interface DataRetentionConfig {
  enabled: boolean;
  policies: {
    activityLogs: {
      enabled: boolean;
      retentionDays: number;
      schedule: string;
      conditions?: {
        status?: string[];
        categories?: string[];
      };
    };
    userSessions: {
      enabled: boolean;
      retentionDays: number;
      schedule: string;
      conditions?: {
        status?: string[];
      };
    };
    passwordHistory: {
      enabled: boolean;
      retentionDays: number;
      maxRecordsPerUser: number;
      schedule: string;
    };
    verificationTokens: {
      enabled: boolean;
      retentionDays: number;
      schedule: string;
    };
    exportRequests: {
      enabled: boolean;
      retentionDays: number;
      schedule: string;
      conditions?: {
        status?: string[];
      };
    };
    deletedUsers: {
      enabled: boolean;
      retentionDays: number;
      schedule: string;
      requiresConfirmation: boolean;
    };
    deviceFingerprints: {
      enabled: boolean;
      retentionDays: number;
      schedule: string;
    };
    backupMetadata: {
      enabled: boolean;
      retentionDays: number;
      schedule: string;
    };
  };
  monitoring: {
    healthCheckInterval: number; // minutes
    alertsEnabled: boolean;
    notificationEmail?: string;
    slackWebhook?: string;
  };
  safety: {
    dryRunByDefault: boolean;
    requireConfirmation: boolean;
    maxRecordsPerOperation: number;
    backupBeforeCleanup: boolean;
  };
}

// Default configuration
export const defaultDataRetentionConfig: DataRetentionConfig = {
  enabled: process.env.DATA_RETENTION_ENABLED === 'true',
  
  policies: {
    activityLogs: {
      enabled: true,
      retentionDays: parseInt(process.env.RETENTION_ACTIVITY_LOGS_DAYS || '90'),
      schedule: process.env.RETENTION_ACTIVITY_LOGS_SCHEDULE || '0 2 * * 0', // Weekly on Sunday at 2 AM
      conditions: {
        status: ['completed']
      }
    },
    
    userSessions: {
      enabled: true,
      retentionDays: parseInt(process.env.RETENTION_USER_SESSIONS_DAYS || '30'),
      schedule: process.env.RETENTION_USER_SESSIONS_SCHEDULE || '0 3 * * *', // Daily at 3 AM
      conditions: {
        status: ['expired', 'revoked']
      }
    },
    
    passwordHistory: {
      enabled: true,
      retentionDays: parseInt(process.env.RETENTION_PASSWORD_HISTORY_DAYS || '365'),
      maxRecordsPerUser: parseInt(process.env.RETENTION_PASSWORD_HISTORY_MAX || '10'),
      schedule: process.env.RETENTION_PASSWORD_HISTORY_SCHEDULE || '0 4 * * 1' // Weekly on Monday at 4 AM
    },
    
    verificationTokens: {
      enabled: true,
      retentionDays: parseInt(process.env.RETENTION_VERIFICATION_TOKENS_DAYS || '7'),
      schedule: process.env.RETENTION_VERIFICATION_TOKENS_SCHEDULE || '0 1 * * *' // Daily at 1 AM
    },
    
    exportRequests: {
      enabled: true,
      retentionDays: parseInt(process.env.RETENTION_EXPORT_REQUESTS_DAYS || '30'),
      schedule: process.env.RETENTION_EXPORT_REQUESTS_SCHEDULE || '0 5 * * 0', // Weekly on Sunday at 5 AM
      conditions: {
        status: ['completed', 'expired']
      }
    },
    
    deletedUsers: {
      enabled: process.env.RETENTION_DELETED_USERS_ENABLED === 'true', // Disabled by default for safety
      retentionDays: parseInt(process.env.RETENTION_DELETED_USERS_DAYS || '30'),
      schedule: process.env.RETENTION_DELETED_USERS_SCHEDULE || '0 6 * * 0', // Weekly on Sunday at 6 AM
      requiresConfirmation: true
    },
    
    deviceFingerprints: {
      enabled: true,
      retentionDays: parseInt(process.env.RETENTION_DEVICE_FINGERPRINTS_DAYS || '180'),
      schedule: process.env.RETENTION_DEVICE_FINGERPRINTS_SCHEDULE || '0 7 * * 0' // Weekly on Sunday at 7 AM
    },
    
    backupMetadata: {
      enabled: true,
      retentionDays: parseInt(process.env.RETENTION_BACKUP_METADATA_DAYS || '180'),
      schedule: process.env.RETENTION_BACKUP_METADATA_SCHEDULE || '0 8 * * 0' // Weekly on Sunday at 8 AM
    }
  },
  
  monitoring: {
    healthCheckInterval: parseInt(process.env.RETENTION_HEALTH_CHECK_INTERVAL || '60'), // minutes
    alertsEnabled: process.env.RETENTION_ALERTS_ENABLED === 'true',
    notificationEmail: process.env.RETENTION_NOTIFICATION_EMAIL,
    slackWebhook: process.env.RETENTION_SLACK_WEBHOOK
  },
  
  safety: {
    dryRunByDefault: process.env.RETENTION_DRY_RUN_DEFAULT === 'true',
    requireConfirmation: process.env.RETENTION_REQUIRE_CONFIRMATION !== 'false', // Default true
    maxRecordsPerOperation: parseInt(process.env.RETENTION_MAX_RECORDS_PER_OP || '10000'),
    backupBeforeCleanup: process.env.RETENTION_BACKUP_BEFORE_CLEANUP === 'true'
  }
};

// Environment variables documentation
export const retentionEnvironmentVariables = {
  // Main toggle
  DATA_RETENTION_ENABLED: 'Enable/disable data retention system (true/false)',
  
  // Individual policy configuration
  RETENTION_ACTIVITY_LOGS_DAYS: 'Activity logs retention period in days (default: 90)',
  RETENTION_ACTIVITY_LOGS_SCHEDULE: 'Activity logs cleanup cron schedule (default: "0 2 * * 0")',
  
  RETENTION_USER_SESSIONS_DAYS: 'User sessions retention period in days (default: 30)',
  RETENTION_USER_SESSIONS_SCHEDULE: 'User sessions cleanup cron schedule (default: "0 3 * * *")',
  
  RETENTION_PASSWORD_HISTORY_DAYS: 'Password history retention period in days (default: 365)',
  RETENTION_PASSWORD_HISTORY_MAX: 'Max password records per user (default: 10)',
  RETENTION_PASSWORD_HISTORY_SCHEDULE: 'Password history cleanup cron schedule (default: "0 4 * * 1")',
  
  RETENTION_VERIFICATION_TOKENS_DAYS: 'Verification tokens retention period in days (default: 7)',
  RETENTION_VERIFICATION_TOKENS_SCHEDULE: 'Verification tokens cleanup cron schedule (default: "0 1 * * *")',
  
  RETENTION_EXPORT_REQUESTS_DAYS: 'Export requests retention period in days (default: 30)',
  RETENTION_EXPORT_REQUESTS_SCHEDULE: 'Export requests cleanup cron schedule (default: "0 5 * * 0")',
  
  RETENTION_DELETED_USERS_ENABLED: 'Enable permanent deletion of soft-deleted users (true/false)',
  RETENTION_DELETED_USERS_DAYS: 'Deleted users retention period in days (default: 30)',
  RETENTION_DELETED_USERS_SCHEDULE: 'Deleted users cleanup cron schedule (default: "0 6 * * 0")',
  
  RETENTION_DEVICE_FINGERPRINTS_DAYS: 'Device fingerprints retention period in days (default: 180)',
  RETENTION_DEVICE_FINGERPRINTS_SCHEDULE: 'Device fingerprints cleanup cron schedule (default: "0 7 * * 0")',
  
  RETENTION_BACKUP_METADATA_DAYS: 'Backup metadata retention period in days (default: 180)',
  RETENTION_BACKUP_METADATA_SCHEDULE: 'Backup metadata cleanup cron schedule (default: "0 8 * * 0")',
  
  // Monitoring and alerts
  RETENTION_HEALTH_CHECK_INTERVAL: 'Health check interval in minutes (default: 60)',
  RETENTION_ALERTS_ENABLED: 'Enable retention system alerts (true/false)',
  RETENTION_NOTIFICATION_EMAIL: 'Email address for retention notifications',
  RETENTION_SLACK_WEBHOOK: 'Slack webhook URL for retention alerts',
  
  // Safety settings
  RETENTION_DRY_RUN_DEFAULT: 'Default to dry run mode for manual operations (true/false)',
  RETENTION_REQUIRE_CONFIRMATION: 'Require confirmation for cleanup operations (default: true)',
  RETENTION_MAX_RECORDS_PER_OP: 'Maximum records to process in single operation (default: 10000)',
  RETENTION_BACKUP_BEFORE_CLEANUP: 'Create backup before cleanup operations (true/false)'
};

// Validation function
export function validateRetentionConfig(config: DataRetentionConfig): string[] {
  const errors: string[] = [];
  
  // Validate retention periods
  Object.entries(config.policies).forEach(([policyName, policy]) => {
    if (policy.enabled) {
      if (policy.retentionDays < 1 || policy.retentionDays > 3650) {
        errors.push(`${policyName}: retentionDays must be between 1 and 3650 days`);
      }
      
      // Validate cron schedule format (basic check)
      const cronParts = policy.schedule.split(' ');
      if (cronParts.length !== 5) {
        errors.push(`${policyName}: invalid cron schedule format`);
      }
    }
  });
  
  // Validate monitoring settings
  if (config.monitoring.healthCheckInterval < 1 || config.monitoring.healthCheckInterval > 1440) {
    errors.push('monitoring.healthCheckInterval must be between 1 and 1440 minutes');
  }
  
  // Validate safety settings
  if (config.safety.maxRecordsPerOperation < 100 || config.safety.maxRecordsPerOperation > 100000) {
    errors.push('safety.maxRecordsPerOperation must be between 100 and 100,000');
  }
  
  return errors;
}

// Helper function to get current config
export function getCurrentRetentionConfig(): DataRetentionConfig {
  return defaultDataRetentionConfig;
}