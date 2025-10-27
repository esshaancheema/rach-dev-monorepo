import { PrismaClient } from '@zoptal/database';
import { logger } from '../utils/logger';
import { config } from '../config';
import cron from 'node-cron';

export interface RetentionPolicy {
  id: string;
  name: string;
  enabled: boolean;
  dataType: 'activity_logs' | 'user_sessions' | 'password_history' | 'email_verification_tokens' | 'export_requests' | 'deleted_users' | 'device_fingerprints' | 'rate_limit_logs' | 'backup_metadata';
  retentionPeriodDays: number;
  conditions?: {
    status?: string[];
    userRole?: string[];
    minAge?: number;
    maxRecords?: number;
  };
  schedule: string; // cron format
  lastRun?: Date;
  nextRun?: Date;
  recordsDeleted?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RetentionJobResult {
  policyId: string;
  policyName: string;
  recordsProcessed: number;
  recordsDeleted: number;
  duration: number;
  status: 'completed' | 'failed' | 'partial';
  error?: string;
  details: {
    beforeCount: number;
    afterCount: number;
    deletedRecords: Array<{
      table: string;
      count: number;
      oldestRecord?: Date;
      newestRecord?: Date;
    }>;
  };
}

export interface DataRetentionStats {
  totalPolicies: number;
  activePolicies: number;
  totalRecordsManaged: number;
  storageFreed: number;
  lastCleanup: Date | null;
  upcomingCleanups: Array<{
    policyId: string;
    policyName: string;
    nextRun: Date;
    estimatedRecords: number;
  }>;
}

interface DataRetentionServiceDependencies {
  prisma: PrismaClient;
}

export function createDataRetentionService({ prisma }: DataRetentionServiceDependencies) {
  const scheduledJobs = new Map<string, cron.ScheduledTask>();

  // Default retention policies
  const defaultPolicies: Omit<RetentionPolicy, 'id' | 'createdAt' | 'updatedAt' | 'lastRun' | 'nextRun' | 'recordsDeleted'>[] = [
    {
      name: 'Activity Logs Cleanup',
      enabled: true,
      dataType: 'activity_logs',
      retentionPeriodDays: 90, // 3 months
      conditions: {
        status: ['completed']
      },
      schedule: '0 2 * * 0' // Weekly on Sunday at 2 AM
    },
    {
      name: 'Expired Sessions Cleanup',
      enabled: true,
      dataType: 'user_sessions',
      retentionPeriodDays: 30,
      conditions: {
        status: ['expired', 'revoked']
      },
      schedule: '0 3 * * *' // Daily at 3 AM
    },
    {
      name: 'Password History Cleanup',
      enabled: true,
      dataType: 'password_history',
      retentionPeriodDays: 365, // 1 year
      conditions: {
        maxRecords: 10 // Keep only last 10 passwords per user
      },
      schedule: '0 4 * * 1' // Weekly on Monday at 4 AM
    },
    {
      name: 'Verification Tokens Cleanup',
      enabled: true,
      dataType: 'email_verification_tokens',
      retentionPeriodDays: 7,
      schedule: '0 1 * * *' // Daily at 1 AM
    },
    {
      name: 'Export Requests Cleanup',
      enabled: true,
      dataType: 'export_requests',
      retentionPeriodDays: 30,
      conditions: {
        status: ['completed', 'expired']
      },
      schedule: '0 5 * * 0' // Weekly on Sunday at 5 AM
    },
    {
      name: 'Soft Deleted Users Cleanup',
      enabled: false, // Disabled by default for safety
      dataType: 'deleted_users',
      retentionPeriodDays: 30,
      conditions: {
        status: ['soft_deleted']
      },
      schedule: '0 6 * * 0' // Weekly on Sunday at 6 AM
    },
    {
      name: 'Device Fingerprints Cleanup',
      enabled: true,
      dataType: 'device_fingerprints',
      retentionPeriodDays: 180, // 6 months
      schedule: '0 7 * * 0' // Weekly on Sunday at 7 AM
    },
    {
      name: 'Backup Metadata Cleanup',
      enabled: true,
      dataType: 'backup_metadata',
      retentionPeriodDays: 180, // 6 months for metadata
      schedule: '0 8 * * 0' // Weekly on Sunday at 8 AM
    }
  ];

  /**
   * Initialize retention policies
   */
  async function initializeRetentionPolicies(): Promise<void> {
    logger.info('Initializing data retention policies');

    try {
      // Check if policies table exists (in real implementation, this would be in schema)
      // For now, we'll store policies in memory and log them
      
      for (const policy of defaultPolicies) {
        const policyWithMeta: RetentionPolicy = {
          ...policy,
          id: `policy_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        if (policy.enabled) {
          scheduleRetentionJob(policyWithMeta);
        }

        logger.info(`Retention policy initialized: ${policy.name} (${policy.enabled ? 'enabled' : 'disabled'})`);
      }

      logger.info('✅ Data retention policies initialized successfully');

    } catch (error) {
      logger.error({ error }, '❌ Failed to initialize retention policies');
      throw error;
    }
  }

  /**
   * Schedule retention job
   */
  function scheduleRetentionJob(policy: RetentionPolicy): void {
    if (scheduledJobs.has(policy.id)) {
      scheduledJobs.get(policy.id)?.stop();
    }

    const job = cron.schedule(policy.schedule, async () => {
      try {
        logger.info(`Starting scheduled retention job: ${policy.name}`);
        const result = await executeRetentionPolicy(policy);
        logger.info({ result }, `Retention job completed: ${policy.name}`);
      } catch (error) {
        logger.error({ error, policyId: policy.id }, `Retention job failed: ${policy.name}`);
      }
    }, {
      scheduled: true,
      timezone: 'UTC'
    });

    scheduledJobs.set(policy.id, job);
    logger.info(`Scheduled retention job: ${policy.name} (${policy.schedule})`);
  }

  /**
   * Execute retention policy
   */
  async function executeRetentionPolicy(policy: RetentionPolicy): Promise<RetentionJobResult> {
    const startTime = Date.now();
    
    logger.info({ 
      policyId: policy.id, 
      policyName: policy.name, 
      dataType: policy.dataType 
    }, 'Executing retention policy');

    const result: RetentionJobResult = {
      policyId: policy.id,
      policyName: policy.name,
      recordsProcessed: 0,
      recordsDeleted: 0,
      duration: 0,
      status: 'completed',
      details: {
        beforeCount: 0,
        afterCount: 0,
        deletedRecords: []
      }
    };

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - policy.retentionPeriodDays);

      switch (policy.dataType) {
        case 'activity_logs':
          result.details.deletedRecords.push(await cleanupActivityLogs(cutoffDate, policy.conditions));
          break;
        case 'user_sessions':
          result.details.deletedRecords.push(await cleanupUserSessions(cutoffDate, policy.conditions));
          break;
        case 'password_history':
          result.details.deletedRecords.push(await cleanupPasswordHistory(cutoffDate, policy.conditions));
          break;
        case 'email_verification_tokens':
          result.details.deletedRecords.push(await cleanupVerificationTokens(cutoffDate));
          break;
        case 'export_requests':
          result.details.deletedRecords.push(await cleanupExportRequests(cutoffDate, policy.conditions));
          break;
        case 'deleted_users':
          result.details.deletedRecords.push(await cleanupDeletedUsers(cutoffDate, policy.conditions));
          break;
        case 'device_fingerprints':
          result.details.deletedRecords.push(await cleanupDeviceFingerprints(cutoffDate));
          break;
        case 'backup_metadata':
          result.details.deletedRecords.push(await cleanupBackupMetadata(cutoffDate));
          break;
        default:
          throw new Error(`Unsupported data type: ${policy.dataType}`);
      }

      result.recordsDeleted = result.details.deletedRecords.reduce((sum, item) => sum + item.count, 0);
      result.recordsProcessed = result.recordsDeleted;
      result.duration = Date.now() - startTime;

      // Log retention activity
      await prisma.activityLog.create({
        data: {
          userId: 'system',
          action: 'DATA_RETENTION_EXECUTED',
          category: 'SYSTEM',
          ip: '127.0.0.1',
          userAgent: 'System',
          metadata: {
            policyId: policy.id,
            policyName: policy.name,
            dataType: policy.dataType,
            recordsDeleted: result.recordsDeleted,
            duration: result.duration,
            cutoffDate: cutoffDate.toISOString()
          }
        }
      });

      logger.info({ 
        policyId: policy.id,
        recordsDeleted: result.recordsDeleted,
        duration: result.duration
      }, 'Retention policy executed successfully');

      return result;

    } catch (error) {
      result.status = 'failed';
      result.error = error instanceof Error ? error.message : 'Unknown error';
      result.duration = Date.now() - startTime;

      logger.error({ error, policyId: policy.id }, 'Retention policy execution failed');
      
      // Log failed retention activity
      await prisma.activityLog.create({
        data: {
          userId: 'system',
          action: 'DATA_RETENTION_FAILED',
          category: 'SYSTEM',
          ip: '127.0.0.1',
          userAgent: 'System',
          metadata: {
            policyId: policy.id,
            policyName: policy.name,
            error: result.error
          }
        }
      });

      return result;
    }
  }

  /**
   * Cleanup activity logs
   */
  async function cleanupActivityLogs(cutoffDate: Date, conditions?: any): Promise<{ table: string; count: number; oldestRecord?: Date; newestRecord?: Date }> {
    const whereConditions: any = {
      createdAt: { lt: cutoffDate }
    };

    if (conditions?.status) {
      whereConditions.metadata = {
        path: ['status'],
        in: conditions.status
      };
    }

    // Get info about records to be deleted
    const recordsToDelete = await prisma.activityLog.findMany({
      where: whereConditions,
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' }
    });

    if (recordsToDelete.length === 0) {
      return { table: 'activity_logs', count: 0 };
    }

    const oldestRecord = recordsToDelete[0]?.createdAt;
    const newestRecord = recordsToDelete[recordsToDelete.length - 1]?.createdAt;

    // Delete the records
    const deleteResult = await prisma.activityLog.deleteMany({
      where: whereConditions
    });

    return {
      table: 'activity_logs',
      count: deleteResult.count,
      oldestRecord,
      newestRecord
    };
  }

  /**
   * Cleanup user sessions
   */
  async function cleanupUserSessions(cutoffDate: Date, conditions?: any): Promise<{ table: string; count: number; oldestRecord?: Date; newestRecord?: Date }> {
    const whereConditions: any = {
      createdAt: { lt: cutoffDate }
    };

    if (conditions?.status) {
      whereConditions.status = { in: conditions.status };
    }

    const recordsToDelete = await prisma.userSession.findMany({
      where: whereConditions,
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' }
    });

    if (recordsToDelete.length === 0) {
      return { table: 'user_sessions', count: 0 };
    }

    const oldestRecord = recordsToDelete[0]?.createdAt;
    const newestRecord = recordsToDelete[recordsToDelete.length - 1]?.createdAt;

    const deleteResult = await prisma.userSession.deleteMany({
      where: whereConditions
    });

    return {
      table: 'user_sessions',
      count: deleteResult.count,
      oldestRecord,
      newestRecord
    };
  }

  /**
   * Cleanup password history
   */
  async function cleanupPasswordHistory(cutoffDate: Date, conditions?: any): Promise<{ table: string; count: number; oldestRecord?: Date; newestRecord?: Date }> {
    let totalDeleted = 0;
    let oldestRecord: Date | undefined;
    let newestRecord: Date | undefined;

    if (conditions?.maxRecords) {
      // Keep only the latest N passwords per user
      const users = await prisma.user.findMany({
        select: { id: true }
      });

      for (const user of users) {
        const passwordHistory = await prisma.passwordHistory.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' },
          skip: conditions.maxRecords
        });

        if (passwordHistory.length > 0) {
          if (!oldestRecord || passwordHistory[passwordHistory.length - 1].createdAt < oldestRecord) {
            oldestRecord = passwordHistory[passwordHistory.length - 1].createdAt;
          }
          if (!newestRecord || passwordHistory[0].createdAt > newestRecord) {
            newestRecord = passwordHistory[0].createdAt;
          }

          const deleteResult = await prisma.passwordHistory.deleteMany({
            where: {
              userId: user.id,
              id: { in: passwordHistory.map(p => p.id) }
            }
          });

          totalDeleted += deleteResult.count;
        }
      }
    } else {
      // Delete by age
      const recordsToDelete = await prisma.passwordHistory.findMany({
        where: { createdAt: { lt: cutoffDate } },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' }
      });

      if (recordsToDelete.length > 0) {
        oldestRecord = recordsToDelete[0]?.createdAt;
        newestRecord = recordsToDelete[recordsToDelete.length - 1]?.createdAt;

        const deleteResult = await prisma.passwordHistory.deleteMany({
          where: { createdAt: { lt: cutoffDate } }
        });

        totalDeleted = deleteResult.count;
      }
    }

    return {
      table: 'password_history',
      count: totalDeleted,
      oldestRecord,
      newestRecord
    };
  }

  /**
   * Cleanup verification tokens
   */
  async function cleanupVerificationTokens(cutoffDate: Date): Promise<{ table: string; count: number; oldestRecord?: Date; newestRecord?: Date }> {
    const recordsToDelete = await prisma.emailVerificationToken.findMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } }, // Expired tokens
          { createdAt: { lt: cutoffDate } } // Old tokens
        ]
      },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' }
    });

    if (recordsToDelete.length === 0) {
      return { table: 'email_verification_tokens', count: 0 };
    }

    const oldestRecord = recordsToDelete[0]?.createdAt;
    const newestRecord = recordsToDelete[recordsToDelete.length - 1]?.createdAt;

    const deleteResult = await prisma.emailVerificationToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { createdAt: { lt: cutoffDate } }
        ]
      }
    });

    return {
      table: 'email_verification_tokens',
      count: deleteResult.count,
      oldestRecord,
      newestRecord
    };
  }

  /**
   * Cleanup export requests
   */
  async function cleanupExportRequests(cutoffDate: Date, conditions?: any): Promise<{ table: string; count: number; oldestRecord?: Date; newestRecord?: Date }> {
    const whereConditions: any = {
      createdAt: { lt: cutoffDate }
    };

    if (conditions?.status) {
      whereConditions.status = { in: conditions.status };
    }

    const recordsToDelete = await prisma.userDataExport.findMany({
      where: whereConditions,
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' }
    });

    if (recordsToDelete.length === 0) {
      return { table: 'export_requests', count: 0 };
    }

    const oldestRecord = recordsToDelete[0]?.createdAt;
    const newestRecord = recordsToDelete[recordsToDelete.length - 1]?.createdAt;

    const deleteResult = await prisma.userDataExport.deleteMany({
      where: whereConditions
    });

    return {
      table: 'export_requests',
      count: deleteResult.count,
      oldestRecord,
      newestRecord
    };
  }

  /**
   * Cleanup soft deleted users (permanent deletion)
   */
  async function cleanupDeletedUsers(cutoffDate: Date, conditions?: any): Promise<{ table: string; count: number; oldestRecord?: Date; newestRecord?: Date }> {
    const whereConditions: any = {
      deletedAt: { 
        not: null,
        lt: cutoffDate 
      }
    };

    // Get users to be permanently deleted
    const usersToDelete = await prisma.user.findMany({
      where: whereConditions,
      select: { id: true, deletedAt: true },
      orderBy: { deletedAt: 'asc' }
    });

    if (usersToDelete.length === 0) {
      return { table: 'deleted_users', count: 0 };
    }

    const oldestRecord = usersToDelete[0]?.deletedAt;
    const newestRecord = usersToDelete[usersToDelete.length - 1]?.deletedAt;

    // Permanently delete users and cascade delete related data
    let totalDeleted = 0;
    for (const user of usersToDelete) {
      await prisma.$transaction(async (tx) => {
        // Delete related data first
        await tx.passwordHistory.deleteMany({ where: { userId: user.id } });
        await tx.userSession.deleteMany({ where: { userId: user.id } });
        await tx.deviceFingerprint.deleteMany({ where: { userId: user.id } });
        await tx.activityLog.deleteMany({ where: { userId: user.id } });
        await tx.userDataExport.deleteMany({ where: { userId: user.id } });
        
        // Finally delete the user
        await tx.user.delete({ where: { id: user.id } });
        totalDeleted++;
      });
    }

    return {
      table: 'deleted_users',
      count: totalDeleted,
      oldestRecord: oldestRecord || undefined,
      newestRecord: newestRecord || undefined
    };
  }

  /**
   * Cleanup device fingerprints
   */
  async function cleanupDeviceFingerprints(cutoffDate: Date): Promise<{ table: string; count: number; oldestRecord?: Date; newestRecord?: Date }> {
    const recordsToDelete = await prisma.deviceFingerprint.findMany({
      where: { lastSeenAt: { lt: cutoffDate } },
      select: { lastSeenAt: true },
      orderBy: { lastSeenAt: 'asc' }
    });

    if (recordsToDelete.length === 0) {
      return { table: 'device_fingerprints', count: 0 };
    }

    const oldestRecord = recordsToDelete[0]?.lastSeenAt;
    const newestRecord = recordsToDelete[recordsToDelete.length - 1]?.lastSeenAt;

    const deleteResult = await prisma.deviceFingerprint.deleteMany({
      where: { lastSeenAt: { lt: cutoffDate } }
    });

    return {
      table: 'device_fingerprints',
      count: deleteResult.count,
      oldestRecord,
      newestRecord
    };
  }

  /**
   * Cleanup backup metadata
   */
  async function cleanupBackupMetadata(cutoffDate: Date): Promise<{ table: string; count: number; oldestRecord?: Date; newestRecord?: Date }> {
    // This would cleanup backup metadata entries older than retention period
    // For now, we'll simulate this since backup metadata is stored in files
    
    logger.info(`Would cleanup backup metadata older than ${cutoffDate.toISOString()}`);
    
    return {
      table: 'backup_metadata',
      count: 0, // Simulated
      oldestRecord: undefined,
      newestRecord: undefined
    };
  }

  /**
   * Get retention statistics
   */
  async function getRetentionStats(): Promise<DataRetentionStats> {
    try {
      // Calculate current data volumes
      const [
        activityLogsCount,
        userSessionsCount,
        passwordHistoryCount,
        verificationTokensCount,
        exportRequestsCount,
        deviceFingerprintsCount
      ] = await Promise.all([
        prisma.activityLog.count(),
        prisma.userSession.count(),
        prisma.passwordHistory.count(),
        prisma.emailVerificationToken.count(),
        prisma.userDataExport.count(),
        prisma.deviceFingerprint.count()
      ]);

      const totalRecordsManaged = activityLogsCount + userSessionsCount + passwordHistoryCount + 
                                 verificationTokensCount + exportRequestsCount + deviceFingerprintsCount;

      // Get last cleanup from activity logs
      const lastCleanupLog = await prisma.activityLog.findFirst({
        where: { action: 'DATA_RETENTION_EXECUTED' },
        orderBy: { createdAt: 'desc' }
      });

      return {
        totalPolicies: defaultPolicies.length,
        activePolicies: defaultPolicies.filter(p => p.enabled).length,
        totalRecordsManaged,
        storageFreed: 0, // Would calculate based on actual cleanup history
        lastCleanup: lastCleanupLog?.createdAt || null,
        upcomingCleanups: [] // Would calculate based on cron schedules
      };

    } catch (error) {
      logger.error({ error }, 'Failed to get retention statistics');
      throw error;
    }
  }

  /**
   * Manual cleanup execution
   */
  async function executeManualCleanup(dataType: RetentionPolicy['dataType'], retentionDays: number): Promise<RetentionJobResult> {
    const policy: RetentionPolicy = {
      id: `manual_${Date.now()}`,
      name: `Manual ${dataType} cleanup`,
      enabled: true,
      dataType,
      retentionPeriodDays: retentionDays,
      schedule: '0 0 * * *', // Not used for manual
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return executeRetentionPolicy(policy);
  }

  /**
   * Stop all scheduled jobs
   */
  function stopAllJobs(): void {
    logger.info('Stopping all retention jobs');
    
    for (const [policyId, job] of scheduledJobs) {
      job.stop();
      logger.info(`Stopped retention job: ${policyId}`);
    }
    
    scheduledJobs.clear();
  }

  /**
   * Health check
   */
  async function healthCheck(): Promise<{ healthy: boolean; issues: string[] }> {
    const issues: string[] = [];

    try {
      // Check if scheduled jobs are running
      const runningJobs = Array.from(scheduledJobs.values()).filter(job => job.running).length;
      const totalJobs = scheduledJobs.size;
      
      if (totalJobs === 0) {
        issues.push('No retention jobs scheduled');
      }

      // Check database connectivity
      await prisma.$queryRaw`SELECT 1`;

      // Check for very old data that might indicate cleanup issues
      const oldActivityLogs = await prisma.activityLog.count({
        where: {
          createdAt: {
            lt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) // 1 year old
          }
        }
      });

      if (oldActivityLogs > 10000) {
        issues.push(`Large number of old activity logs detected: ${oldActivityLogs}`);
      }

    } catch (error) {
      issues.push(`Database connectivity issue: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      healthy: issues.length === 0,
      issues
    };
  }

  return {
    initializeRetentionPolicies,
    executeRetentionPolicy,
    executeManualCleanup,
    getRetentionStats,
    stopAllJobs,
    healthCheck,
    // Expose individual cleanup functions for testing
    cleanupActivityLogs,
    cleanupUserSessions,
    cleanupPasswordHistory,
    cleanupVerificationTokens,
    cleanupExportRequests,
    cleanupDeletedUsers,
    cleanupDeviceFingerprints,
    cleanupBackupMetadata
  };
}

// Type exports
export type DataRetentionService = ReturnType<typeof createDataRetentionService>;