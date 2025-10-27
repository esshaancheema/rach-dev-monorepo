#!/usr/bin/env tsx

/**
 * Backup Automation Script
 * 
 * This script handles automated backup operations:
 * - Scheduled backups (cron-based)
 * - Health checks and monitoring
 * - Cleanup operations
 * - Emergency backup procedures
 * 
 * Usage:
 *   npm run backup:full
 *   npm run backup:incremental
 *   npm run backup:cleanup
 *   npm run backup:verify
 */

import { PrismaClient } from '@zoptal/database';
import { createBackupRecoveryService, BackupConfig } from '../src/services/backup-recovery.service';
import { RedisClient } from '../src/utils/redis';
import { logger } from '../src/utils/logger';
import cron from 'node-cron';
import { readFileSync } from 'fs';
import path from 'path';

// Default backup configuration
const defaultBackupConfig: BackupConfig = {
  enabled: true,
  schedule: '0 2 * * *', // Daily at 2 AM
  retention: {
    daily: 7,
    weekly: 4,
    monthly: 6
  },
  storage: {
    local: {
      enabled: true,
      path: process.env.BACKUP_DIR || './backups'
    },
    s3: {
      enabled: false,
      bucket: process.env.BACKUP_S3_BUCKET || '',
      region: process.env.BACKUP_S3_REGION || 'us-east-1',
      accessKey: process.env.BACKUP_S3_ACCESS_KEY,
      secretKey: process.env.BACKUP_S3_SECRET_KEY
    }
  },
  encryption: {
    enabled: false,
    key: process.env.BACKUP_ENCRYPTION_KEY
  },
  compression: true
};

class BackupAutomation {
  private prisma: PrismaClient;
  private backupService: ReturnType<typeof createBackupRecoveryService>;
  private config: BackupConfig;
  private scheduledJobs: Map<string, cron.ScheduledTask> = new Map();

  constructor(config: BackupConfig = defaultBackupConfig) {
    this.config = config;
    this.prisma = new PrismaClient();
    this.backupService = createBackupRecoveryService({
      prisma: this.prisma,
      redis: RedisClient
    });
  }

  /**
   * Initialize backup automation
   */
  async initialize(): Promise<void> {
    try {
      logger.info('Initializing backup automation system');

      // Test database connection
      await this.prisma.$connect();
      logger.info('✅ Database connection established');

      // Test Redis connection
      await RedisClient.healthCheck();
      logger.info('✅ Redis connection established');

      // Schedule automatic backups if enabled
      if (this.config.enabled) {
        this.scheduleBackups();
      }

      // Schedule cleanup operations
      this.scheduleCleanup();

      logger.info('✅ Backup automation initialized successfully');

    } catch (error) {
      logger.error({ error }, '❌ Failed to initialize backup automation');
      throw error;
    }
  }

  /**
   * Schedule automatic backups
   */
  private scheduleBackups(): void {
    logger.info({ schedule: this.config.schedule }, 'Scheduling automatic backups');

    // Full backup - daily at 2 AM
    const fullBackupJob = cron.schedule(this.config.schedule, async () => {
      try {
        logger.info('Starting scheduled full backup');
        await this.createFullBackup('Scheduled full backup');
        logger.info('✅ Scheduled full backup completed');
      } catch (error) {
        logger.error({ error }, '❌ Scheduled full backup failed');
        await this.sendBackupAlert('Full backup failed', error);
      }
    }, {
      scheduled: true,
      timezone: 'UTC'
    });

    this.scheduledJobs.set('full_backup', fullBackupJob);

    // Incremental backup - every 4 hours
    const incrementalBackupJob = cron.schedule('0 */4 * * *', async () => {
      try {
        logger.info('Starting scheduled incremental backup');
        const lastBackup = await this.getLastBackupTimestamp();
        if (lastBackup) {
          await this.createIncrementalBackup(lastBackup, 'Scheduled incremental backup');
          logger.info('✅ Scheduled incremental backup completed');
        }
      } catch (error) {
        logger.error({ error }, '❌ Scheduled incremental backup failed');
        await this.sendBackupAlert('Incremental backup failed', error);
      }
    }, {
      scheduled: true,
      timezone: 'UTC'
    });

    this.scheduledJobs.set('incremental_backup', incrementalBackupJob);

    // Configuration backup - weekly on Sunday at 3 AM
    const configBackupJob = cron.schedule('0 3 * * 0', async () => {
      try {
        logger.info('Starting scheduled configuration backup');
        await this.createConfigurationBackup('Scheduled configuration backup');
        logger.info('✅ Scheduled configuration backup completed');
      } catch (error) {
        logger.error({ error }, '❌ Scheduled configuration backup failed');
        await this.sendBackupAlert('Configuration backup failed', error);
      }
    }, {
      scheduled: true,
      timezone: 'UTC'
    });

    this.scheduledJobs.set('config_backup', configBackupJob);

    logger.info('✅ Backup schedules configured');
  }

  /**
   * Schedule cleanup operations
   */
  private scheduleCleanup(): void {
    // Cleanup old backups - weekly on Monday at 1 AM
    const cleanupJob = cron.schedule('0 1 * * 1', async () => {
      try {
        logger.info('Starting scheduled backup cleanup');
        await this.cleanupOldBackups();
        logger.info('✅ Scheduled backup cleanup completed');
      } catch (error) {
        logger.error({ error }, '❌ Scheduled backup cleanup failed');
      }
    }, {
      scheduled: true,
      timezone: 'UTC'
    });

    this.scheduledJobs.set('cleanup', cleanupJob);

    // Verify backups - daily at 6 AM
    const verifyJob = cron.schedule('0 6 * * *', async () => {
      try {
        logger.info('Starting scheduled backup verification');
        await this.verifyAllBackups();
        logger.info('✅ Scheduled backup verification completed');
      } catch (error) {
        logger.error({ error }, '❌ Scheduled backup verification failed');
      }
    }, {
      scheduled: true,
      timezone: 'UTC'
    });

    this.scheduledJobs.set('verify', verifyJob);
  }

  /**
   * Create full backup
   */
  async createFullBackup(description?: string): Promise<void> {
    try {
      const metadata = await this.backupService.createFullBackup(description);
      logger.info({ 
        backupId: metadata.id, 
        size: metadata.size, 
        duration: metadata.duration 
      }, 'Full backup completed');

      // Send success notification
      await this.sendBackupNotification('Full backup successful', {
        backupId: metadata.id,
        size: this.formatBytes(metadata.size),
        duration: `${Math.round(metadata.duration! / 1000)}s`
      });

    } catch (error) {
      logger.error({ error }, 'Full backup failed');
      throw error;
    }
  }

  /**
   * Create incremental backup
   */
  async createIncrementalBackup(lastBackupTimestamp: Date, description?: string): Promise<void> {
    try {
      const metadata = await this.backupService.createIncrementalBackup(lastBackupTimestamp, description);
      logger.info({ 
        backupId: metadata.id, 
        size: metadata.size, 
        duration: metadata.duration 
      }, 'Incremental backup completed');

      // Send success notification
      await this.sendBackupNotification('Incremental backup successful', {
        backupId: metadata.id,
        size: this.formatBytes(metadata.size),
        duration: `${Math.round(metadata.duration! / 1000)}s`,
        since: lastBackupTimestamp.toISOString()
      });

    } catch (error) {
      logger.error({ error }, 'Incremental backup failed');
      throw error;
    }
  }

  /**
   * Create configuration backup
   */
  async createConfigurationBackup(description?: string): Promise<void> {
    try {
      const metadata = await this.backupService.createConfigurationBackup(description);
      logger.info({ 
        backupId: metadata.id, 
        size: metadata.size 
      }, 'Configuration backup completed');

    } catch (error) {
      logger.error({ error }, 'Configuration backup failed');
      throw error;
    }
  }

  /**
   * Cleanup old backups
   */
  async cleanupOldBackups(): Promise<void> {
    try {
      const backupsBefore = await this.backupService.listBackups();
      await this.backupService.cleanupOldBackups(this.config.retention);
      const backupsAfter = await this.backupService.listBackups();

      const deletedCount = backupsBefore.length - backupsAfter.length;
      const sizeBefore = backupsBefore.reduce((sum, b) => sum + b.size, 0);
      const sizeAfter = backupsAfter.reduce((sum, b) => sum + b.size, 0);
      const freedSpace = sizeBefore - sizeAfter;

      logger.info({ 
        deleted: deletedCount, 
        remaining: backupsAfter.length,
        freedSpace: this.formatBytes(freedSpace)
      }, 'Backup cleanup completed');

    } catch (error) {
      logger.error({ error }, 'Backup cleanup failed');
      throw error;
    }
  }

  /**
   * Verify all backups
   */
  async verifyAllBackups(): Promise<void> {
    try {
      const backups = await this.backupService.listBackups();
      let verified = 0;
      let failed = 0;

      for (const backup of backups) {
        try {
          const isValid = await this.backupService.verifyBackup(backup.id);
          if (isValid) {
            verified++;
          } else {
            failed++;
            logger.warn({ backupId: backup.id }, 'Backup verification failed');
          }
        } catch (error) {
          failed++;
          logger.error({ error, backupId: backup.id }, 'Backup verification error');
        }
      }

      logger.info({ 
        total: backups.length, 
        verified, 
        failed 
      }, 'Backup verification completed');

      if (failed > 0) {
        await this.sendBackupAlert(`${failed} backup(s) failed verification`, null);
      }

    } catch (error) {
      logger.error({ error }, 'Backup verification process failed');
      throw error;
    }
  }

  /**
   * Emergency backup
   */
  async emergencyBackup(reason: string): Promise<void> {
    try {
      logger.warn({ reason }, 'Creating emergency backup');

      // Create full backup immediately
      const metadata = await this.backupService.createFullBackup(`Emergency backup: ${reason}`);

      // Also create configuration backup
      await this.backupService.createConfigurationBackup(`Emergency config backup: ${reason}`);

      logger.info({ 
        backupId: metadata.id, 
        reason 
      }, 'Emergency backup completed');

      // Send emergency notification
      await this.sendBackupAlert('Emergency backup created', null, {
        reason,
        backupId: metadata.id
      });

    } catch (error) {
      logger.error({ error, reason }, 'Emergency backup failed');
      throw error;
    }
  }

  /**
   * Get last backup timestamp
   */
  private async getLastBackupTimestamp(): Promise<Date | null> {
    try {
      const backups = await this.backupService.listBackups();
      const completedBackups = backups.filter(b => b.status === 'completed');
      
      if (completedBackups.length === 0) {
        return null;
      }

      return completedBackups.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0].timestamp;

    } catch (error) {
      logger.error({ error }, 'Failed to get last backup timestamp');
      return null;
    }
  }

  /**
   * Send backup notification
   */
  private async sendBackupNotification(message: string, details: any): Promise<void> {
    try {
      // In a real implementation, this would send notifications via email, Slack, etc.
      logger.info({ message, details }, 'Backup notification');
    } catch (error) {
      logger.error({ error }, 'Failed to send backup notification');
    }
  }

  /**
   * Send backup alert
   */
  private async sendBackupAlert(message: string, error: any, details?: any): Promise<void> {
    try {
      // In a real implementation, this would send alerts via email, Slack, PagerDuty, etc.
      logger.error({ message, error, details }, 'Backup alert');
    } catch (alertError) {
      logger.error({ error: alertError }, 'Failed to send backup alert');
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

  /**
   * Health check
   */
  async healthCheck(): Promise<{ healthy: boolean; issues: string[] }> {
    const issues: string[] = [];

    try {
      // Check database connection
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      issues.push('Database connection failed');
    }

    try {
      // Check Redis connection
      await RedisClient.healthCheck();
    } catch (error) {
      issues.push('Redis connection failed');
    }

    try {
      // Check backup directory accessibility
      const backups = await this.backupService.listBackups(undefined, 1);
    } catch (error) {
      issues.push('Backup directory inaccessible');
    }

    return {
      healthy: issues.length === 0,
      issues
    };
  }

  /**
   * Stop all scheduled jobs
   */
  stop(): void {
    logger.info('Stopping backup automation');
    
    for (const [name, job] of this.scheduledJobs) {
      job.stop();
      logger.info({ jobName: name }, 'Backup job stopped');
    }

    this.scheduledJobs.clear();
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    this.stop();
    await this.prisma.$disconnect();
    await RedisClient.disconnect();
    logger.info('Backup automation cleanup completed');
  }
}

// CLI interface
async function main() {
  const command = process.argv[2];
  const automation = new BackupAutomation();

  try {
    await automation.initialize();

    switch (command) {
      case 'full':
        await automation.createFullBackup('Manual full backup');
        break;

      case 'incremental':
        const lastBackup = await automation['getLastBackupTimestamp']();
        if (lastBackup) {
          await automation.createIncrementalBackup(lastBackup, 'Manual incremental backup');
        } else {
          logger.warn('No previous backup found, creating full backup instead');
          await automation.createFullBackup('Initial full backup');
        }
        break;

      case 'config':
        await automation.createConfigurationBackup('Manual configuration backup');
        break;

      case 'cleanup':
        await automation.cleanupOldBackups();
        break;

      case 'verify':
        await automation.verifyAllBackups();
        break;

      case 'emergency':
        const reason = process.argv[3] || 'Manual emergency backup';
        await automation.emergencyBackup(reason);
        break;

      case 'health':
        const health = await automation.healthCheck();
        console.log(JSON.stringify(health, null, 2));
        process.exit(health.healthy ? 0 : 1);
        break;

      case 'daemon':
        logger.info('Starting backup automation daemon');
        // Keep the process running for scheduled jobs
        process.on('SIGINT', async () => {
          logger.info('Received SIGINT, shutting down gracefully');
          await automation.cleanup();
          process.exit(0);
        });
        break;

      default:
        console.log(`
Usage: npm run backup <command>

Commands:
  full        Create full backup
  incremental Create incremental backup
  config      Create configuration backup
  cleanup     Cleanup old backups
  verify      Verify all backups
  emergency   Create emergency backup
  health      Check backup system health
  daemon      Run as daemon with scheduled backups
        `);
        process.exit(1);
    }

    if (command !== 'daemon') {
      await automation.cleanup();
    }

  } catch (error) {
    logger.error({ error }, 'Backup automation failed');
    process.exit(1);
  }
}

// Export for use as module
export { BackupAutomation, defaultBackupConfig };

// Run as CLI if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}