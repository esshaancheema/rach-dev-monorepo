#!/usr/bin/env tsx

/**
 * Data Retention Scheduler Script
 * 
 * This script manages automated data retention policies:
 * - Initializes retention policies on startup
 * - Schedules automated cleanup jobs
 * - Provides CLI interface for manual operations
 * - Monitors retention job health
 * 
 * Usage:
 *   npm run retention:start     # Start retention scheduler daemon
 *   npm run retention:cleanup   # Manual cleanup by data type
 *   npm run retention:stats     # Show retention statistics
 *   npm run retention:health    # Check system health
 *   npm run retention:preview   # Preview cleanup operations
 */

import { PrismaClient } from '@zoptal/database';
import { createDataRetentionService } from '../src/services/data-retention.service';
import { logger } from '../src/utils/logger';
import { readFileSync } from 'fs';
import path from 'path';

// Configuration for retention scheduler
interface SchedulerConfig {
  enabled: boolean;
  logLevel: string;
  healthCheckInterval: number; // minutes
  alertsEnabled: boolean;
  emailNotifications: {
    enabled: boolean;
    recipients: string[];
    onError: boolean;
    onSuccess: boolean;
    summaryFrequency: 'daily' | 'weekly' | 'monthly';
  };
  monitoring: {
    enabled: boolean;
    metricsEndpoint?: string;
    healthEndpoint?: string;
  };
}

const defaultConfig: SchedulerConfig = {
  enabled: process.env.DATA_RETENTION_ENABLED === 'true',
  logLevel: process.env.LOG_LEVEL || 'info',
  healthCheckInterval: parseInt(process.env.RETENTION_HEALTH_CHECK_INTERVAL || '60'),
  alertsEnabled: process.env.RETENTION_ALERTS_ENABLED === 'true',
  emailNotifications: {
    enabled: false,
    recipients: [],
    onError: true,
    onSuccess: false,
    summaryFrequency: 'weekly'
  },
  monitoring: {
    enabled: process.env.RETENTION_MONITORING_ENABLED === 'true'
  }
};

class DataRetentionScheduler {
  private prisma: PrismaClient;
  private retentionService: ReturnType<typeof createDataRetentionService>;
  private config: SchedulerConfig;
  private healthCheckInterval?: NodeJS.Timeout;
  private isShuttingDown = false;

  constructor(config: SchedulerConfig = defaultConfig) {
    this.config = config;
    this.prisma = new PrismaClient();
    this.retentionService = createDataRetentionService({ prisma: this.prisma });
  }

  /**
   * Initialize the retention scheduler
   */
  async initialize(): Promise<void> {
    try {
      logger.info('🚀 Initializing Data Retention Scheduler');

      if (!this.config.enabled) {
        logger.warn('⚠️  Data retention scheduler is disabled');
        return;
      }

      // Test database connection
      await this.prisma.$connect();
      logger.info('✅ Database connection established');

      // Initialize retention policies
      await this.retentionService.initializeRetentionPolicies();
      logger.info('✅ Retention policies initialized');

      // Start health monitoring
      if (this.config.alertsEnabled) {
        this.startHealthMonitoring();
        logger.info('✅ Health monitoring started');
      }

      // Log startup summary
      const stats = await this.retentionService.getRetentionStats();
      logger.info('📊 Retention system status:', {
        totalPolicies: stats.totalPolicies,
        activePolicies: stats.activePolicies,
        totalRecordsManaged: stats.totalRecordsManaged,
        lastCleanup: stats.lastCleanup
      });

      logger.info('✅ Data Retention Scheduler initialized successfully');

    } catch (error) {
      logger.error('❌ Failed to initialize Data Retention Scheduler:', error);
      throw error;
    }
  }

  /**
   * Start health monitoring
   */
  private startHealthMonitoring(): void {
    this.healthCheckInterval = setInterval(async () => {
      if (this.isShuttingDown) return;

      try {
        const health = await this.retentionService.healthCheck();
        
        if (!health.healthy) {
          logger.warn('⚠️  Retention system health issues detected:', health.issues);
          
          if (this.config.emailNotifications.enabled && this.config.emailNotifications.onError) {
            await this.sendHealthAlert(health.issues);
          }
        } else {
          logger.debug('✅ Retention system health check passed');
        }

      } catch (error) {
        logger.error('❌ Health check failed:', error);
      }
    }, this.config.healthCheckInterval * 60 * 1000);

    logger.info(`Health monitoring started (${this.config.healthCheckInterval} minute intervals)`);
  }

  /**
   * Send health alert
   */
  private async sendHealthAlert(issues: string[]): Promise<void> {
    try {
      // In a real implementation, this would send emails via the email service
      logger.error('🚨 RETENTION SYSTEM ALERT', {
        timestamp: new Date().toISOString(),
        issues,
        action: 'immediate_attention_required'
      });

      // Could integrate with external alerting systems here
      // - Send to Slack webhook
      // - Send to PagerDuty
      // - Send email notifications
      // - Post to monitoring dashboard

    } catch (error) {
      logger.error('Failed to send health alert:', error);
    }
  }

  /**
   * Execute manual cleanup
   */
  async executeManualCleanup(dataType: string, retentionDays: number): Promise<void> {
    try {
      logger.info(`Starting manual cleanup: ${dataType} (${retentionDays} days retention)`);

      const result = await this.retentionService.executeManualCleanup(
        dataType as any,
        retentionDays
      );

      logger.info('Manual cleanup completed:', {
        dataType,
        recordsDeleted: result.recordsDeleted,
        duration: `${result.duration}ms`,
        status: result.status
      });

      if (result.error) {
        logger.error('Cleanup completed with errors:', result.error);
      }

    } catch (error) {
      logger.error(`Manual cleanup failed for ${dataType}:`, error);
      throw error;
    }
  }

  /**
   * Show retention statistics
   */
  async showStats(): Promise<void> {
    try {
      const stats = await this.retentionService.getRetentionStats();
      
      console.log('\n📊 Data Retention Statistics');
      console.log('═'.repeat(50));
      console.log(`Total Policies: ${stats.totalPolicies}`);
      console.log(`Active Policies: ${stats.activePolicies}`);
      console.log(`Records Managed: ${stats.totalRecordsManaged.toLocaleString()}`);
      console.log(`Storage Freed: ${this.formatBytes(stats.storageFreed)}`);
      console.log(`Last Cleanup: ${stats.lastCleanup || 'Never'}`);
      
      if (stats.upcomingCleanups.length > 0) {
        console.log('\n⏰ Upcoming Cleanups:');
        stats.upcomingCleanups.forEach(cleanup => {
          console.log(`  • ${cleanup.policyName}: ${cleanup.nextRun} (~${cleanup.estimatedRecords} records)`);
        });
      }

    } catch (error) {
      logger.error('Failed to get retention statistics:', error);
      throw error;
    }
  }

  /**
   * Check system health
   */
  async checkHealth(): Promise<void> {
    try {
      const health = await this.retentionService.healthCheck();
      
      console.log('\n🏥 Retention System Health');
      console.log('═'.repeat(50));
      console.log(`Status: ${health.healthy ? '✅ Healthy' : '❌ Issues Detected'}`);
      
      if (health.issues.length > 0) {
        console.log('\n⚠️  Issues:');
        health.issues.forEach(issue => {
          console.log(`  • ${issue}`);
        });
      }

      console.log(`\nChecked at: ${new Date().toISOString()}`);

    } catch (error) {
      logger.error('Health check failed:', error);
      throw error;
    }
  }

  /**
   * Preview cleanup operation
   */
  async previewCleanup(dataType: string, retentionDays: number): Promise<void> {
    try {
      console.log(`\n🔍 Cleanup Preview: ${dataType}`);
      console.log('═'.repeat(50));
      console.log(`Retention Period: ${retentionDays} days`);
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
      console.log(`Cutoff Date: ${cutoffDate.toISOString()}`);

      // This would use the actual service method
      console.log('\n⚠️  Warning: This is a preview of what would be deleted');
      console.log('Use the actual API endpoint for detailed preview information');

    } catch (error) {
      logger.error('Preview failed:', error);
      throw error;
    }
  }

  /**
   * Generate retention report
   */
  async generateReport(): Promise<void> {
    try {
      const stats = await this.retentionService.getRetentionStats();
      const health = await this.retentionService.healthCheck();

      const report = {
        timestamp: new Date().toISOString(),
        systemHealth: health,
        statistics: stats,
        configuration: {
          enabled: this.config.enabled,
          alertsEnabled: this.config.alertsEnabled,
          healthCheckInterval: this.config.healthCheckInterval
        }
      };

      console.log('\n📋 Data Retention Report');
      console.log('═'.repeat(50));
      console.log(JSON.stringify(report, null, 2));

    } catch (error) {
      logger.error('Failed to generate report:', error);
      throw error;
    }
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    logger.info('🔄 Starting graceful shutdown of retention scheduler');
    
    this.isShuttingDown = true;

    try {
      // Stop health monitoring
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
        logger.info('✅ Health monitoring stopped');
      }

      // Stop all retention jobs
      this.retentionService.stopAllJobs();
      logger.info('✅ All retention jobs stopped');

      // Close database connection
      await this.prisma.$disconnect();
      logger.info('✅ Database connection closed');

      logger.info('✅ Retention scheduler shutdown completed');

    } catch (error) {
      logger.error('❌ Error during shutdown:', error);
    }
  }

  /**
   * Format bytes to human readable string
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// CLI interface
async function main() {
  const command = process.argv[2];
  const scheduler = new DataRetentionScheduler();

  try {
    switch (command) {
      case 'start':
      case 'daemon':
        await scheduler.initialize();
        
        // Keep the process running
        process.on('SIGINT', async () => {
          logger.info('Received SIGINT, shutting down gracefully');
          await scheduler.shutdown();
          process.exit(0);
        });

        process.on('SIGTERM', async () => {
          logger.info('Received SIGTERM, shutting down gracefully');
          await scheduler.shutdown();
          process.exit(0);
        });

        logger.info('Retention scheduler is running. Press Ctrl+C to stop.');
        break;

      case 'cleanup':
        const dataType = process.argv[3];
        const retentionDays = parseInt(process.argv[4]);
        
        if (!dataType || !retentionDays) {
          console.error('Usage: npm run retention:cleanup <dataType> <retentionDays>');
          process.exit(1);
        }

        await scheduler.initialize();
        await scheduler.executeManualCleanup(dataType, retentionDays);
        await scheduler.shutdown();
        break;

      case 'stats':
        await scheduler.initialize();
        await scheduler.showStats();
        await scheduler.shutdown();
        break;

      case 'health':
        await scheduler.initialize();
        await scheduler.checkHealth();
        await scheduler.shutdown();
        break;

      case 'preview':
        const previewDataType = process.argv[3];
        const previewRetentionDays = parseInt(process.argv[4]);
        
        if (!previewDataType || !previewRetentionDays) {
          console.error('Usage: npm run retention:preview <dataType> <retentionDays>');
          process.exit(1);
        }

        await scheduler.initialize();
        await scheduler.previewCleanup(previewDataType, previewRetentionDays);
        await scheduler.shutdown();
        break;

      case 'report':
        await scheduler.initialize();
        await scheduler.generateReport();
        await scheduler.shutdown();
        break;

      default:
        console.log(`
Data Retention Scheduler

Usage: npm run retention <command>

Commands:
  start               Start retention scheduler daemon
  cleanup <type> <days>  Execute manual cleanup
  stats               Show retention statistics
  health              Check system health
  preview <type> <days>  Preview cleanup operation
  report              Generate comprehensive report

Examples:
  npm run retention:start
  npm run retention:cleanup activity_logs 90
  npm run retention:stats
  npm run retention:health
  npm run retention:preview user_sessions 30
  npm run retention:report

Data Types:
  - activity_logs
  - user_sessions
  - password_history
  - email_verification_tokens
  - export_requests
  - deleted_users
  - device_fingerprints
  - backup_metadata
        `);
        process.exit(1);
    }

  } catch (error) {
    logger.error('Retention scheduler command failed:', error);
    process.exit(1);
  }
}

// Export for use as module
export { DataRetentionScheduler, defaultConfig };

// Run as CLI if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}