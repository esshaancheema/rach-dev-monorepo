import { nanoid } from 'nanoid';
import { EmailService } from './email.service';
import { SmsService } from './sms.service';
import { PushService } from './push.service';
import { InAppService } from './in-app.service';
import { UserService } from './user.service';
import { logger } from '../utils/logger';
import { NotificationRedisService } from '../utils/redis';
import Bull from 'bull';
import { config } from '../config';

interface NotificationRequest {
  userId: string;
  channels: Array<'email' | 'sms' | 'push' | 'in-app'>;
  priority: 'high' | 'normal' | 'low';
  scheduledFor?: Date;
  email?: any;
  sms?: any;
  push?: any;
  inApp?: any;
  metadata?: Record<string, any>;
}

interface BulkNotificationRequest {
  userIds: string[];
  channels: Array<'email' | 'sms' | 'push' | 'in-app'>;
  priority: 'high' | 'normal' | 'low';
  scheduledFor?: Date;
  email?: any;
  sms?: any;
  push?: any;
  inApp?: any;
}

interface BroadcastRequest {
  segment: {
    filter: 'all' | 'active' | 'inactive' | 'premium' | 'trial';
    customQuery?: {
      field: string;
      operator: 'eq' | 'ne' | 'gt' | 'lt' | 'in' | 'nin';
      value: any;
    };
  };
  channels: Array<'email' | 'sms' | 'push' | 'in-app'>;
  priority: 'high' | 'normal' | 'low';
  scheduledFor?: Date;
  email?: any;
  push?: any;
  inApp?: any;
}

export class NotificationService {
  private emailService: EmailService;
  private smsService: SmsService;
  private pushService: PushService;
  private inAppService: InAppService;
  private userService: UserService;
  private notificationQueue: Bull.Queue;

  constructor() {
    this.emailService = new EmailService();
    this.smsService = new SmsService();
    this.pushService = new PushService();
    this.inAppService = new InAppService();
    this.userService = new UserService();

    // Initialize notification queue
    this.notificationQueue = new Bull('notifications', {
      redis: {
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password,
      },
    });
  }

  async sendNotification(request: NotificationRequest) {
    const notificationId = `notif_${nanoid()}`;
    
    try {
      // Get user preferences and contact info
      const user = await this.userService.getUserWithPreferences(request.userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Check if notification should be scheduled
      if (request.scheduledFor && request.scheduledFor > new Date()) {
        return await this.scheduleNotification(notificationId, request);
      }

      // Process notification immediately
      const results: Record<string, any> = {};

      // Send through each requested channel
      for (const channel of request.channels) {
        // Check user preferences
        if (!this.shouldSendToChannel(user, channel, request)) {
          logger.info({ userId: user.id, channel }, 'Skipping channel due to user preferences');
          results[channel] = {
            status: 'skipped',
            reason: 'user_preference',
          };
          continue;
        }

        try {
          switch (channel) {
            case 'email':
              if (request.email && user.email) {
                const emailResult = await this.emailService.sendEmail({
                  to: user.email,
                  userId: user.id,
                  priority: request.priority,
                  ...request.email,
                });
                results.email = emailResult;
              }
              break;

            case 'sms':
              if (request.sms && user.phone) {
                const smsResult = await this.smsService.sendSms({
                  to: user.phone,
                  userId: user.id,
                  priority: request.priority,
                  ...request.sms,
                });
                results.sms = smsResult;
              }
              break;

            case 'push':
              if (request.push) {
                const pushResult = await this.pushService.sendPush({
                  userId: user.id,
                  priority: request.priority,
                  ...request.push,
                });
                results.push = pushResult;
              }
              break;

            case 'in-app':
              if (request.inApp) {
                const inAppResult = await this.inAppService.createNotification({
                  userId: user.id,
                  priority: request.priority,
                  ...request.inApp,
                });
                results.inApp = inAppResult;
              }
              break;
          }
        } catch (error) {
          logger.error({ error, channel, userId: user.id }, 'Failed to send through channel');
          results[channel] = {
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      }

      // Store notification record
      await NotificationRedisService.storeNotification(notificationId, {
        userId: request.userId,
        channels: request.channels,
        priority: request.priority,
        results,
        metadata: request.metadata,
        createdAt: new Date().toISOString(),
      });

      return {
        notificationId,
        channels: results,
      };
    } catch (error) {
      logger.error({ error, notificationId }, 'Failed to send notification');
      throw error;
    }
  }

  async sendBulkNotification(request: BulkNotificationRequest) {
    const batchId = `batch_${nanoid()}`;

    try {
      // Create batch job
      const job = await this.notificationQueue.add('bulk-notification', {
        batchId,
        ...request,
      }, {
        priority: request.priority === 'high' ? 1 : 
                 request.priority === 'normal' ? 2 : 3,
        delay: request.scheduledFor 
          ? request.scheduledFor.getTime() - Date.now() 
          : 0,
      });

      // Store batch info
      await NotificationRedisService.storeBatch(batchId, {
        userIds: request.userIds,
        channels: request.channels,
        totalUsers: request.userIds.length,
        status: request.scheduledFor ? 'scheduled' : 'processing',
        scheduledFor: request.scheduledFor?.toISOString(),
        createdAt: new Date().toISOString(),
      });

      return {
        batchId,
        jobId: job.id,
        totalUsers: request.userIds.length,
        status: request.scheduledFor ? 'scheduled' : 'processing',
        scheduledFor: request.scheduledFor?.toISOString(),
      };
    } catch (error) {
      logger.error({ error, batchId }, 'Failed to create bulk notification');
      throw error;
    }
  }

  async broadcastNotification(request: BroadcastRequest) {
    const broadcastId = `broadcast_${nanoid()}`;

    try {
      // Get estimated recipient count
      const estimatedRecipients = await this.userService.countUsersInSegment(request.segment);

      // Create broadcast job
      const job = await this.notificationQueue.add('broadcast-notification', {
        broadcastId,
        ...request,
      }, {
        priority: request.priority === 'high' ? 1 : 
                 request.priority === 'normal' ? 2 : 3,
        delay: request.scheduledFor 
          ? request.scheduledFor.getTime() - Date.now() 
          : 0,
      });

      // Store broadcast info
      await NotificationRedisService.storeBroadcast(broadcastId, {
        segment: request.segment,
        channels: request.channels,
        estimatedRecipients,
        status: request.scheduledFor ? 'scheduled' : 'processing',
        scheduledFor: request.scheduledFor?.toISOString(),
        createdAt: new Date().toISOString(),
      });

      return {
        broadcastId,
        jobId: job.id,
        estimatedRecipients,
        status: request.scheduledFor ? 'scheduled' : 'processing',
        scheduledFor: request.scheduledFor?.toISOString(),
      };
    } catch (error) {
      logger.error({ error, broadcastId }, 'Failed to create broadcast notification');
      throw error;
    }
  }

  async getNotificationStatus(notificationId: string) {
    try {
      const notification = await NotificationRedisService.getNotification(notificationId);
      if (!notification) {
        return null;
      }

      // Calculate overall status
      const channelStatuses = Object.values(notification.results || {});
      const hasFailures = channelStatuses.some((s: any) => s.status === 'failed');
      const allSent = channelStatuses.every((s: any) => s.status === 'sent');
      
      const status = allSent ? 'sent' : 
                    hasFailures ? 'partially_sent' : 
                    'processing';

      return {
        notificationId,
        status,
        channels: notification.results,
        createdAt: notification.createdAt,
        updatedAt: notification.updatedAt || notification.createdAt,
      };
    } catch (error) {
      logger.error({ error, notificationId }, 'Failed to get notification status');
      throw error;
    }
  }

  async cancelNotification(notificationId: string) {
    try {
      // Check if notification exists and is scheduled
      const notification = await NotificationRedisService.getNotification(notificationId);
      if (!notification || notification.status !== 'scheduled') {
        return false;
      }

      // Cancel the scheduled job
      const jobs = await this.notificationQueue.getJobs(['delayed']);
      const job = jobs.find(j => j.data.notificationId === notificationId);
      
      if (job) {
        await job.remove();
      }

      // Update notification status
      await NotificationRedisService.updateNotificationStatus(notificationId, 'cancelled');

      return true;
    } catch (error) {
      logger.error({ error, notificationId }, 'Failed to cancel notification');
      throw error;
    }
  }

  private async scheduleNotification(notificationId: string, request: NotificationRequest) {
    const job = await this.notificationQueue.add('scheduled-notification', {
      notificationId,
      ...request,
    }, {
      delay: request.scheduledFor!.getTime() - Date.now(),
      priority: request.priority === 'high' ? 1 : 
               request.priority === 'normal' ? 2 : 3,
    });

    // Store scheduled notification
    await NotificationRedisService.storeNotification(notificationId, {
      userId: request.userId,
      channels: request.channels,
      priority: request.priority,
      status: 'scheduled',
      scheduledFor: request.scheduledFor!.toISOString(),
      jobId: job.id,
      metadata: request.metadata,
      createdAt: new Date().toISOString(),
    });

    return {
      notificationId,
      status: 'scheduled',
      scheduledFor: request.scheduledFor!.toISOString(),
      jobId: job.id,
    };
  }

  private shouldSendToChannel(
    user: any, 
    channel: string, 
    request: NotificationRequest
  ): boolean {
    // Check if user has opted out of channel
    const preferences = user.notificationPreferences || {};
    const channelPrefs = preferences[channel] || {};

    // Check global channel opt-out
    if (channelPrefs.enabled === false) {
      return false;
    }

    // Check category-specific preferences
    if (request.metadata?.category && channelPrefs.categories) {
      const categoryEnabled = channelPrefs.categories[request.metadata.category];
      if (categoryEnabled === false) {
        return false;
      }
    }

    // Check quiet hours for non-urgent notifications
    if (request.priority !== 'high' && channelPrefs.quietHours) {
      const now = new Date();
      const currentHour = now.getHours();
      const { start, end } = channelPrefs.quietHours;
      
      if (start <= end) {
        if (currentHour >= start && currentHour < end) {
          return false;
        }
      } else {
        if (currentHour >= start || currentHour < end) {
          return false;
        }
      }
    }

    // Check frequency limits
    // This would check against recent notifications sent to user
    // Implementation depends on your specific requirements

    return true;
  }
}