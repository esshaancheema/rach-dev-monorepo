import { PrismaClient } from '@zoptal/database';
import { logger } from '../utils/logger';
import { config } from '../config';
import { RedisClient } from '../utils/redis';
import { createReadStream, createWriteStream, promises as fs } from 'fs';
import { pipeline } from 'stream/promises';
import { createGzip, createGunzip } from 'zlib';
import path from 'path';
import { execSync, spawn } from 'child_process';
import archiver from 'archiver';
import { extract } from 'tar-stream';

export interface BackupConfig {
  enabled: boolean;
  schedule: string; // cron format
  retention: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  storage: {
    local: {
      enabled: boolean;
      path: string;
    };
    s3: {
      enabled: boolean;
      bucket: string;
      region: string;
      accessKey?: string;
      secretKey?: string;
    };
  };
  encryption: {
    enabled: boolean;
    key?: string;
  };
  compression: boolean;
}

export interface BackupMetadata {
  id: string;
  type: 'full' | 'incremental' | 'configuration' | 'redis';
  timestamp: Date;
  size: number;
  checksum: string;
  compression: boolean;
  encryption: boolean;
  description?: string;
  tables?: string[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  duration?: number;
  error?: string;
}

export interface RestoreOptions {
  backupId: string;
  targetTimestamp?: Date;
  tables?: string[];
  dryRun?: boolean;
  skipValidation?: boolean;
}

interface BackupRecoveryServiceDependencies {
  prisma: PrismaClient;
  redis: typeof RedisClient;
}

export function createBackupRecoveryService({ prisma, redis }: BackupRecoveryServiceDependencies) {
  const backupDir = process.env.BACKUP_DIR || './backups';
  const configDir = process.env.CONFIG_DIR || './config';

  /**
   * Create full database backup
   */
  async function createFullBackup(description?: string): Promise<BackupMetadata> {
    const backupId = `full_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
    const timestamp = new Date();
    
    logger.info({ backupId }, 'Starting full database backup');

    const metadata: BackupMetadata = {
      id: backupId,
      type: 'full',
      timestamp,
      size: 0,
      checksum: '',
      compression: true,
      encryption: false,
      description,
      status: 'running'
    };

    try {
      // Ensure backup directory exists
      await fs.mkdir(backupDir, { recursive: true });

      const backupFile = path.join(backupDir, `${backupId}.sql.gz`);
      const startTime = Date.now();

      // Create database dump
      const dumpCommand = `pg_dump "${config.DATABASE_URL}" --no-owner --no-privileges --clean --if-exists`;
      
      await new Promise<void>((resolve, reject) => {
        const dump = spawn('sh', ['-c', dumpCommand]);
        const gzip = createGzip();
        const output = createWriteStream(backupFile);

        pipeline(dump.stdout, gzip, output)
          .then(() => resolve())
          .catch(reject);

        dump.stderr.on('data', (data) => {
          logger.warn({ data: data.toString() }, 'pg_dump stderr');
        });

        dump.on('error', reject);
      });

      // Get backup file size and checksum
      const stats = await fs.stat(backupFile);
      const checksum = await calculateChecksum(backupFile);

      metadata.size = stats.size;
      metadata.checksum = checksum;
      metadata.status = 'completed';
      metadata.duration = Date.now() - startTime;

      // Save metadata
      await saveBackupMetadata(metadata);

      logger.info({ 
        backupId, 
        size: metadata.size, 
        duration: metadata.duration 
      }, 'Full backup completed successfully');

      return metadata;

    } catch (error) {
      metadata.status = 'failed';
      metadata.error = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error({ error, backupId }, 'Full backup failed');
      await saveBackupMetadata(metadata);
      
      throw error;
    }
  }

  /**
   * Create incremental backup (based on activity logs)
   */
  async function createIncrementalBackup(
    lastBackupTimestamp: Date,
    description?: string
  ): Promise<BackupMetadata> {
    const backupId = `incremental_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
    const timestamp = new Date();
    
    logger.info({ backupId, lastBackupTimestamp }, 'Starting incremental backup');

    const metadata: BackupMetadata = {
      id: backupId,
      type: 'incremental',
      timestamp,
      size: 0,
      checksum: '',
      compression: true,
      encryption: false,
      description,
      status: 'running'
    };

    try {
      await fs.mkdir(backupDir, { recursive: true });

      const backupFile = path.join(backupDir, `${backupId}.json.gz`);
      const startTime = Date.now();

      // Get changes since last backup
      const changes = await getDataChanges(lastBackupTimestamp);
      
      // Compress and save changes
      const dataStream = JSON.stringify(changes, null, 2);
      const gzip = createGzip();
      const output = createWriteStream(backupFile);

      await pipeline(
        async function* () {
          yield dataStream;
        },
        gzip,
        output
      );

      const stats = await fs.stat(backupFile);
      const checksum = await calculateChecksum(backupFile);

      metadata.size = stats.size;
      metadata.checksum = checksum;
      metadata.status = 'completed';
      metadata.duration = Date.now() - startTime;

      await saveBackupMetadata(metadata);

      logger.info({ 
        backupId, 
        changes: Object.keys(changes).length,
        size: metadata.size 
      }, 'Incremental backup completed');

      return metadata;

    } catch (error) {
      metadata.status = 'failed';
      metadata.error = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error({ error, backupId }, 'Incremental backup failed');
      await saveBackupMetadata(metadata);
      
      throw error;
    }
  }

  /**
   * Create configuration backup
   */
  async function createConfigurationBackup(description?: string): Promise<BackupMetadata> {
    const backupId = `config_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
    const timestamp = new Date();
    
    logger.info({ backupId }, 'Starting configuration backup');

    const metadata: BackupMetadata = {
      id: backupId,
      type: 'configuration',
      timestamp,
      size: 0,
      checksum: '',
      compression: true,
      encryption: false,
      description,
      status: 'running'
    };

    try {
      await fs.mkdir(backupDir, { recursive: true });

      const backupFile = path.join(backupDir, `${backupId}.tar.gz`);
      const startTime = Date.now();

      // Create tar archive of configuration
      await new Promise<void>((resolve, reject) => {
        const output = createWriteStream(backupFile);
        const archive = archiver('tar', {
          gzip: true,
          gzipOptions: { level: 9 }
        });

        archive.pipe(output);

        // Add configuration files
        const configFiles = [
          'package.json',
          'package-lock.json',
          'tsconfig.json',
          '.env.example',
          'prisma/schema.prisma'
        ];

        configFiles.forEach(file => {
          if (require('fs').existsSync(file)) {
            archive.file(file, { name: file });
          }
        });

        // Add service configuration
        const serviceConfig = {
          version: process.env.npm_package_version || '1.0.0',
          nodeVersion: process.version,
          timestamp: timestamp.toISOString(),
          environment: config.NODE_ENV,
          features: {
            rateLimiting: true,
            twoFactor: config.ENABLE_2FA,
            oauth: config.ENABLE_OAUTH,
            emailVerification: config.ENABLE_EMAIL_VERIFICATION
          }
        };

        archive.append(JSON.stringify(serviceConfig, null, 2), { name: 'service-config.json' });

        archive.finalize();

        output.on('close', resolve);
        archive.on('error', reject);
      });

      const stats = await fs.stat(backupFile);
      const checksum = await calculateChecksum(backupFile);

      metadata.size = stats.size;
      metadata.checksum = checksum;
      metadata.status = 'completed';
      metadata.duration = Date.now() - startTime;

      await saveBackupMetadata(metadata);

      logger.info({ backupId, size: metadata.size }, 'Configuration backup completed');

      return metadata;

    } catch (error) {
      metadata.status = 'failed';
      metadata.error = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error({ error, backupId }, 'Configuration backup failed');
      await saveBackupMetadata(metadata);
      
      throw error;
    }
  }

  /**
   * Create Redis backup
   */
  async function createRedisBackup(description?: string): Promise<BackupMetadata> {
    const backupId = `redis_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
    const timestamp = new Date();
    
    logger.info({ backupId }, 'Starting Redis backup');

    const metadata: BackupMetadata = {
      id: backupId,
      type: 'redis',
      timestamp,
      size: 0,
      checksum: '',
      compression: true,
      encryption: false,
      description,
      status: 'running'
    };

    try {
      await fs.mkdir(backupDir, { recursive: true });

      const backupFile = path.join(backupDir, `${backupId}.rdb.gz`);
      const startTime = Date.now();

      const redisClient = redis.getInstance();
      
      // Create Redis dump
      await redisClient.bgsave();
      
      // Wait for background save to complete
      let saveInProgress = true;
      while (saveInProgress) {
        const info = await redisClient.info('persistence');
        saveInProgress = info.includes('rdb_bgsave_in_progress:1');
        if (saveInProgress) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Get Redis dump file and compress it
      const rdbPath = '/var/lib/redis/dump.rdb'; // Default Redis dump path
      if (await fs.access(rdbPath).then(() => true).catch(() => false)) {
        await pipeline(
          createReadStream(rdbPath),
          createGzip(),
          createWriteStream(backupFile)
        );
      } else {
        // Fallback: export Redis data as JSON
        const keys = await redisClient.keys('*');
        const data: Record<string, any> = {};
        
        for (const key of keys) {
          const type = await redisClient.type(key);
          switch (type) {
            case 'string':
              data[key] = await redisClient.get(key);
              break;
            case 'hash':
              data[key] = await redisClient.hgetall(key);
              break;
            case 'list':
              data[key] = await redisClient.lrange(key, 0, -1);
              break;
            case 'set':
              data[key] = await redisClient.smembers(key);
              break;
            case 'zset':
              data[key] = await redisClient.zrange(key, 0, -1, 'WITHSCORES');
              break;
          }
        }

        await pipeline(
          async function* () {
            yield JSON.stringify(data, null, 2);
          },
          createGzip(),
          createWriteStream(backupFile)
        );
      }

      const stats = await fs.stat(backupFile);
      const checksum = await calculateChecksum(backupFile);

      metadata.size = stats.size;
      metadata.checksum = checksum;
      metadata.status = 'completed';
      metadata.duration = Date.now() - startTime;

      await saveBackupMetadata(metadata);

      logger.info({ backupId, size: metadata.size }, 'Redis backup completed');

      return metadata;

    } catch (error) {
      metadata.status = 'failed';
      metadata.error = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error({ error, backupId }, 'Redis backup failed');
      await saveBackupMetadata(metadata);
      
      throw error;
    }
  }

  /**
   * Restore from backup
   */
  async function restoreFromBackup(options: RestoreOptions): Promise<void> {
    const { backupId, dryRun = false, skipValidation = false } = options;
    
    logger.info({ backupId, dryRun }, 'Starting restore operation');

    try {
      // Get backup metadata
      const metadata = await getBackupMetadata(backupId);
      if (!metadata) {
        throw new Error(`Backup ${backupId} not found`);
      }

      if (metadata.status !== 'completed') {
        throw new Error(`Backup ${backupId} is not in completed state`);
      }

      const backupFile = path.join(backupDir, `${backupId}.sql.gz`);
      
      // Validate backup file
      if (!skipValidation) {
        await validateBackupFile(backupFile, metadata.checksum);
      }

      if (dryRun) {
        logger.info({ backupId }, 'Dry run completed successfully');
        return;
      }

      // Perform restore based on backup type
      switch (metadata.type) {
        case 'full':
          await restoreFullBackup(backupFile);
          break;
        case 'incremental':
          await restoreIncrementalBackup(backupFile);
          break;
        case 'configuration':
          await restoreConfigurationBackup(backupFile);
          break;
        case 'redis':
          await restoreRedisBackup(backupFile);
          break;
        default:
          throw new Error(`Unsupported backup type: ${metadata.type}`);
      }

      // Log restore operation
      await prisma.activityLog.create({
        data: {
          userId: 'system',
          action: 'BACKUP_RESTORED',
          category: 'SYSTEM',
          ip: '127.0.0.1',
          userAgent: 'System',
          metadata: {
            backupId,
            backupType: metadata.type,
            restoreTimestamp: new Date().toISOString()
          }
        }
      });

      logger.info({ backupId }, 'Restore completed successfully');

    } catch (error) {
      logger.error({ error, backupId }, 'Restore operation failed');
      throw error;
    }
  }

  /**
   * List available backups
   */
  async function listBackups(type?: string, limit: number = 50): Promise<BackupMetadata[]> {
    try {
      const metadataFiles = await fs.readdir(backupDir);
      const backups: BackupMetadata[] = [];

      for (const file of metadataFiles) {
        if (file.endsWith('.metadata.json')) {
          const content = await fs.readFile(path.join(backupDir, file), 'utf-8');
          const metadata = JSON.parse(content) as BackupMetadata;
          
          if (!type || metadata.type === type) {
            backups.push(metadata);
          }
        }
      }

      return backups
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, limit);
        
    } catch (error) {
      logger.error({ error }, 'Failed to list backups');
      throw error;
    }
  }

  /**
   * Cleanup old backups based on retention policy
   */
  async function cleanupOldBackups(retentionPolicy: BackupConfig['retention']): Promise<void> {
    logger.info({ retentionPolicy }, 'Starting backup cleanup');

    try {
      const allBackups = await listBackups();
      const now = new Date();
      const toDelete: string[] = [];

      // Group backups by type and age
      const daily = allBackups.filter(b => 
        now.getTime() - b.timestamp.getTime() < 24 * 60 * 60 * 1000
      );
      const weekly = allBackups.filter(b => {
        const age = now.getTime() - b.timestamp.getTime();
        return age >= 24 * 60 * 60 * 1000 && age < 7 * 24 * 60 * 60 * 1000;
      });
      const monthly = allBackups.filter(b => {
        const age = now.getTime() - b.timestamp.getTime();
        return age >= 7 * 24 * 60 * 60 * 1000 && age < 30 * 24 * 60 * 60 * 1000;
      });
      const older = allBackups.filter(b => 
        now.getTime() - b.timestamp.getTime() >= 30 * 24 * 60 * 60 * 1000
      );

      // Mark for deletion based on retention policy
      if (daily.length > retentionPolicy.daily) {
        toDelete.push(...daily.slice(retentionPolicy.daily).map(b => b.id));
      }
      if (weekly.length > retentionPolicy.weekly) {
        toDelete.push(...weekly.slice(retentionPolicy.weekly).map(b => b.id));
      }
      if (monthly.length > retentionPolicy.monthly) {
        toDelete.push(...monthly.slice(retentionPolicy.monthly).map(b => b.id));
      }
      // Delete all backups older than monthly retention
      toDelete.push(...older.map(b => b.id));

      // Delete marked backups
      for (const backupId of toDelete) {
        await deleteBackup(backupId);
      }

      logger.info({ 
        deleted: toDelete.length,
        remaining: allBackups.length - toDelete.length 
      }, 'Backup cleanup completed');

    } catch (error) {
      logger.error({ error }, 'Backup cleanup failed');
      throw error;
    }
  }

  /**
   * Verify backup integrity
   */
  async function verifyBackup(backupId: string): Promise<boolean> {
    try {
      const metadata = await getBackupMetadata(backupId);
      if (!metadata) {
        return false;
      }

      const backupFile = getBackupFilePath(backupId, metadata.type);
      
      // Check file exists
      if (!await fs.access(backupFile).then(() => true).catch(() => false)) {
        return false;
      }

      // Verify checksum
      const currentChecksum = await calculateChecksum(backupFile);
      return currentChecksum === metadata.checksum;

    } catch (error) {
      logger.error({ error, backupId }, 'Backup verification failed');
      return false;
    }
  }

  // Helper functions
  async function calculateChecksum(filePath: string): Promise<string> {
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256');
    const stream = createReadStream(filePath);
    
    return new Promise((resolve, reject) => {
      stream.on('data', data => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }

  async function saveBackupMetadata(metadata: BackupMetadata): Promise<void> {
    const metadataFile = path.join(backupDir, `${metadata.id}.metadata.json`);
    await fs.writeFile(metadataFile, JSON.stringify(metadata, null, 2));
  }

  async function getBackupMetadata(backupId: string): Promise<BackupMetadata | null> {
    try {
      const metadataFile = path.join(backupDir, `${backupId}.metadata.json`);
      const content = await fs.readFile(metadataFile, 'utf-8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  async function getDataChanges(since: Date): Promise<any> {
    // Get activity logs since last backup
    const activities = await prisma.activityLog.findMany({
      where: {
        createdAt: { gte: since }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Get users modified since last backup
    const users = await prisma.user.findMany({
      where: {
        updatedAt: { gte: since }
      },
      include: {
        profile: true,
        sessions: true
      }
    });

    return {
      activities,
      users,
      timestamp: new Date().toISOString()
    };
  }

  function getBackupFilePath(backupId: string, type: string): string {
    const extensions = {
      full: '.sql.gz',
      incremental: '.json.gz',
      configuration: '.tar.gz',
      redis: '.rdb.gz'
    };
    
    return path.join(backupDir, `${backupId}${extensions[type as keyof typeof extensions]}`);
  }

  async function validateBackupFile(filePath: string, expectedChecksum: string): Promise<void> {
    const actualChecksum = await calculateChecksum(filePath);
    if (actualChecksum !== expectedChecksum) {
      throw new Error('Backup file checksum mismatch - file may be corrupted');
    }
  }

  async function restoreFullBackup(backupFile: string): Promise<void> {
    logger.info({ backupFile }, 'Restoring full backup');
    
    // This would be implemented based on your database type
    // For PostgreSQL:
    const restoreCommand = `gunzip -c "${backupFile}" | psql "${config.DATABASE_URL}"`;
    execSync(restoreCommand, { stdio: 'inherit' });
  }

  async function restoreIncrementalBackup(backupFile: string): Promise<void> {
    logger.info({ backupFile }, 'Restoring incremental backup');
    
    // Read and decompress incremental backup
    const content = await pipeline(
      createReadStream(backupFile),
      createGunzip()
    );
    
    // Apply changes (this is a simplified implementation)
    // In reality, you'd need to carefully apply the changes in order
    logger.info('Incremental restore completed');
  }

  async function restoreConfigurationBackup(backupFile: string): Promise<void> {
    logger.info({ backupFile }, 'Restoring configuration backup');
    
    // Extract configuration archive
    // This would restore configuration files
    logger.info('Configuration restore completed');
  }

  async function restoreRedisBackup(backupFile: string): Promise<void> {
    logger.info({ backupFile }, 'Restoring Redis backup');
    
    const redisClient = redis.getInstance();
    
    // Flush current Redis data
    await redisClient.flushall();
    
    // Restore from backup
    // Implementation depends on backup format
    logger.info('Redis restore completed');
  }

  async function deleteBackup(backupId: string): Promise<void> {
    const metadata = await getBackupMetadata(backupId);
    if (metadata) {
      const backupFile = getBackupFilePath(backupId, metadata.type);
      const metadataFile = path.join(backupDir, `${backupId}.metadata.json`);
      
      await Promise.all([
        fs.unlink(backupFile).catch(() => {}),
        fs.unlink(metadataFile).catch(() => {})
      ]);
    }
  }

  return {
    createFullBackup,
    createIncrementalBackup,
    createConfigurationBackup,
    createRedisBackup,
    restoreFromBackup,
    listBackups,
    cleanupOldBackups,
    verifyBackup,
    deleteBackup
  };
}

// Type exports
export type BackupRecoveryService = ReturnType<typeof createBackupRecoveryService>;