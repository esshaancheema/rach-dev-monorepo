import Bull from 'bull';
import { config } from '../config';
import { NotificationService } from '../services/notification.service';
import { UserService } from '../services/user.service';
import { logger } from '../utils/logger';
import { NotificationRedisService } from '../utils/redis';
import cron from 'node-cron';
import { InAppService } from '../services/in-app.service';

let notificationQueue: Bull.Queue;
let notificationService: NotificationService;
let userService: UserService;
let inAppService: InAppService;

export async function startNotificationProcessors() {
  // Initialize services
  notificationService = new NotificationService();
  userService = new UserService();
  inAppService = new InAppService();

  // Initialize queue
  notificationQueue = new Bull('notifications', {
    redis: {
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
    },
  });

  // Process scheduled notifications
  notificationQueue.process('scheduled-notification', async (job) => {
    const { notificationId, ...request } = job.data;
    
    try {
      logger.info({ notificationId }, 'Processing scheduled notification');
      
      const result = await notificationService.sendNotification(request);
      
      // Update notification status
      await NotificationRedisService.updateNotificationStatus(notificationId, 'sent', result);
      
      return result;
    } catch (error) {
      logger.error({ error, notificationId }, 'Failed to process scheduled notification');
      await NotificationRedisService.updateNotificationStatus(notificationId, 'failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  });

  // Process bulk notifications
  notificationQueue.process('bulk-notification', 5, async (job) => {
    const { batchId, userIds, ...notificationData } = job.data;
    
    try {
      logger.info({ batchId, userCount: userIds.length }, 'Processing bulk notification');
      
      let processed = 0;
      let failed = 0;
      
      // Process in chunks to avoid overwhelming the system
      const chunkSize = 100;
      for (let i = 0; i < userIds.length; i += chunkSize) {
        const chunk = userIds.slice(i, i + chunkSize);
        
        await Promise.all(
          chunk.map(async (userId) => {
            try {
              await notificationService.sendNotification({
                userId,
                ...notificationData,
              });
              processed++;
            } catch (error) {
              logger.error({ error, userId, batchId }, 'Failed to send bulk notification to user');
              failed++;
            }
          })
        );
        
        // Update batch progress
        await NotificationRedisService.updateBatchProgress(batchId, {
          processed,
          failed,
          total: userIds.length,
          percentComplete: Math.round((processed + failed) / userIds.length * 100),
        });
      }
      
      // Update final batch status
      await NotificationRedisService.updateBatchStatus(batchId, 'completed', {
        processed,
        failed,
        completedAt: new Date().toISOString(),
      });
      
      return { batchId, processed, failed };
    } catch (error) {
      logger.error({ error, batchId }, 'Failed to process bulk notification');
      await NotificationRedisService.updateBatchStatus(batchId, 'failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  });

  // Process broadcast notifications
  notificationQueue.process('broadcast-notification', 2, async (job) => {
    const { broadcastId, segment, ...notificationData } = job.data;
    
    try {
      logger.info({ broadcastId, segment }, 'Processing broadcast notification');
      
      // Get users in segment
      const userIds = await userService.getUserIdsInSegment(segment);
      
      logger.info({ broadcastId, userCount: userIds.length }, 'Found users for broadcast');
      
      // Create bulk job for the actual sending
      await notificationQueue.add('bulk-notification', {
        batchId: broadcastId,
        userIds,
        ...notificationData,
      });
      
      // Update broadcast status
      await NotificationRedisService.updateBroadcastStatus(broadcastId, 'processing', {
        actualRecipients: userIds.length,
      });
      
      return { broadcastId, recipients: userIds.length };
    } catch (error) {
      logger.error({ error, broadcastId }, 'Failed to process broadcast notification');
      await NotificationRedisService.updateBroadcastStatus(broadcastId, 'failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  });

  // Error handling
  notificationQueue.on('error', (error) => {
    logger.error({ error }, 'Queue error');
  });

  notificationQueue.on('failed', (job, error) => {
    logger.error({ 
      error, 
      jobId: job.id, 
      jobType: job.name,
      attempts: job.attemptsMade,
    }, 'Job failed');
  });

  notificationQueue.on('stalled', (job) => {
    logger.warn({ 
      jobId: job.id, 
      jobType: job.name,
    }, 'Job stalled');
  });

  // Start cron jobs
  startCronJobs();

  logger.info('Notification processors started');
}

function startCronJobs() {
  // Clean up expired notifications every hour
  cron.schedule('0 * * * *', async () => {
    try {
      logger.info('Running notification cleanup');
      const deletedCount = await inAppService.cleanup();
      logger.info({ deletedCount }, 'Notification cleanup completed');
    } catch (error) {
      logger.error({ error }, 'Failed to run notification cleanup');
    }
  });

  // Process digest notifications daily at 9 AM
  cron.schedule('0 9 * * *', async () => {
    try {
      logger.info('Processing daily digest notifications');
      await processDigestNotifications('daily');
    } catch (error) {
      logger.error({ error }, 'Failed to process daily digest');
    }
  });

  // Process weekly digest on Mondays at 9 AM
  cron.schedule('0 9 * * 1', async () => {
    try {
      logger.info('Processing weekly digest notifications');
      await processDigestNotifications('weekly');
    } catch (error) {
      logger.error({ error }, 'Failed to process weekly digest');
    }
  });

  // Clean up old queue jobs every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    try {
      logger.info('Cleaning up old queue jobs');
      
      const completedJobs = await notificationQueue.clean(
        24 * 60 * 60 * 1000, // 24 hours
        'completed'
      );
      
      const failedJobs = await notificationQueue.clean(
        7 * 24 * 60 * 60 * 1000, // 7 days
        'failed'
      );
      
      logger.info({ 
        completedRemoved: completedJobs.length,
        failedRemoved: failedJobs.length,
      }, 'Queue cleanup completed');
    } catch (error) {
      logger.error({ error }, 'Failed to clean up queue jobs');
    }
  });

  logger.info('Cron jobs scheduled');
}

async function processDigestNotifications(frequency: 'daily' | 'weekly') {
  try {
    // Get users who have opted in for digest notifications
    const users = await userService.getUsersWithDigestPreference(frequency);
    
    logger.info({ userCount: users.length, frequency }, 'Processing digest notifications');
    
    for (const user of users) {
      try {
        // Get user's activity summary
        const summary = await getActivitySummary(user.id, frequency);
        
        if (summary.hasActivity) {
          await notificationService.sendNotification({
            userId: user.id,
            channels: ['email'],
            priority: 'normal',
            email: {
              subject: `Your ${frequency} Zoptal activity summary`,
              templateId: `${frequency}-digest`,
              templateData: {
                userName: user.firstName,
                ...summary,
              },
            },
            metadata: {
              type: 'digest',
              frequency,
            },
          });
        }
      } catch (error) {
        logger.error({ error, userId: user.id, frequency }, 'Failed to send digest notification');
      }
    }
  } catch (error) {
    logger.error({ error, frequency }, 'Failed to process digest notifications');
  }
}

async function getActivitySummary(userId: string, frequency: 'daily' | 'weekly') {
  // This would fetch user's activity from various services
  // For now, return mock data
  const since = frequency === 'daily' 
    ? new Date(Date.now() - 24 * 60 * 60 * 1000)
    : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  return {
    hasActivity: true,
    projectsCreated: 2,
    tasksCompleted: 15,
    messagesReceived: 8,
    collaboratorsAdded: 3,
    since: since.toISOString(),
  };
}

export async function stopNotificationProcessors() {
  if (notificationQueue) {
    await notificationQueue.close();
    logger.info('Notification processors stopped');
  }
}