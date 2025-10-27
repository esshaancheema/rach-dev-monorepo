import { nanoid } from 'nanoid';
import Pusher from 'pusher';
import { logger } from '../utils/logger';
import { NotificationRedisService } from '../utils/redis';
import { config } from '../config';
import { PrismaClient } from '@zoptal/database';

interface InAppNotificationRequest {
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  actions?: Array<{
    label: string;
    action: string;
    style?: 'primary' | 'secondary' | 'danger';
  }>;
  persistent?: boolean;
  metadata?: Record<string, any>;
  priority?: 'high' | 'normal' | 'low';
  expiresAt?: Date;
}

interface InAppNotificationResponse {
  id: string;
  status: 'sent' | 'failed';
  error?: string;
  sentAt?: string;
}

export class InAppService {
  private pusher: Pusher | null = null;
  private prisma: PrismaClient;

  constructor() {
    // Initialize Pusher for real-time notifications
    if (config.pusher.enabled) {
      this.pusher = new Pusher({
        appId: config.pusher.appId!,
        key: config.pusher.key!,
        secret: config.pusher.secret!,
        cluster: config.pusher.cluster!,
        useTLS: true,
      });
      logger.info('Pusher service initialized for in-app notifications');
    }

    this.prisma = new PrismaClient();
  }

  async createNotification(request: InAppNotificationRequest): Promise<InAppNotificationResponse> {
    const notificationId = `inapp_${nanoid()}`;
    const startTime = Date.now();

    try {
      // Check user rate limits
      const rateLimit = await NotificationRedisService.checkUserRateLimit(
        request.userId,
        'in-app',
        config.rateLimit.inApp.perUser
      );

      if (!rateLimit.allowed) {
        throw new Error(`In-app notification rate limit exceeded. Reset at ${new Date(rateLimit.resetTime).toISOString()}`);
      }

      // Store notification in database
      const notification = await this.storeNotification(notificationId, request);

      // Send real-time notification if Pusher is enabled
      if (this.pusher) {
        await this.sendRealtimeNotification(request.userId, notification);
      }

      // Track metrics
      await NotificationRedisService.trackNotificationMetric('sent', 'in-app');

      // Add to user's notification history
      await NotificationRedisService.addToHistory(request.userId, {
        id: notificationId,
        type: 'in-app',
        title: request.title,
        message: request.message,
        sentAt: new Date().toISOString(),
      });

      const responseTime = Date.now() - startTime;
      logger.info({
        notificationId,
        userId: request.userId,
        type: request.type,
        responseTime,
      }, 'In-app notification created successfully');

      return {
        id: notificationId,
        status: 'sent',
        sentAt: new Date().toISOString(),
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      await NotificationRedisService.trackNotificationMetric('failed', 'in-app');

      logger.error({
        notificationId,
        userId: request.userId,
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime,
      }, 'Failed to create in-app notification');

      return {
        id: notificationId,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getNotifications(userId: string, options: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
    type?: string;
  } = {}) {
    const { 
      page = 1, 
      limit = 20, 
      unreadOnly = false,
      type 
    } = options;

    try {
      const where: any = {
        userId,
        deletedAt: null,
      };

      if (unreadOnly) {
        where.readAt = null;
      }

      if (type) {
        where.type = type;
      }

      const [notifications, total] = await Promise.all([
        this.prisma.inAppNotification.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        this.prisma.inAppNotification.count({ where }),
      ]);

      return {
        notifications,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error({ error, userId }, 'Failed to get notifications');
      throw error;
    }
  }

  async markAsRead(userId: string, notificationIds: string[]) {
    try {
      const result = await this.prisma.inAppNotification.updateMany({
        where: {
          id: { in: notificationIds },
          userId,
          readAt: null,
        },
        data: {
          readAt: new Date(),
        },
      });

      // Update unread count in real-time
      if (this.pusher && result.count > 0) {
        const unreadCount = await this.getUnreadCount(userId);
        await this.pusher.trigger(
          `private-user-${userId}`,
          'notification-read',
          {
            notificationIds,
            unreadCount,
          }
        );
      }

      return result.count;
    } catch (error) {
      logger.error({ error, userId, notificationIds }, 'Failed to mark notifications as read');
      throw error;
    }
  }

  async markAllAsRead(userId: string) {
    try {
      const result = await this.prisma.inAppNotification.updateMany({
        where: {
          userId,
          readAt: null,
        },
        data: {
          readAt: new Date(),
        },
      });

      // Update unread count in real-time
      if (this.pusher && result.count > 0) {
        await this.pusher.trigger(
          `private-user-${userId}`,
          'all-notifications-read',
          {
            count: result.count,
            unreadCount: 0,
          }
        );
      }

      return result.count;
    } catch (error) {
      logger.error({ error, userId }, 'Failed to mark all notifications as read');
      throw error;
    }
  }

  async deleteNotification(userId: string, notificationId: string) {
    try {
      const result = await this.prisma.inAppNotification.updateMany({
        where: {
          id: notificationId,
          userId,
        },
        data: {
          deletedAt: new Date(),
        },
      });

      if (result.count === 0) {
        return false;
      }

      // Send real-time update
      if (this.pusher) {
        await this.pusher.trigger(
          `private-user-${userId}`,
          'notification-deleted',
          { notificationId }
        );
      }

      return true;
    } catch (error) {
      logger.error({ error, userId, notificationId }, 'Failed to delete notification');
      throw error;
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    try {
      return await this.prisma.inAppNotification.count({
        where: {
          userId,
          readAt: null,
          deletedAt: null,
        },
      });
    } catch (error) {
      logger.error({ error, userId }, 'Failed to get unread count');
      throw error;
    }
  }

  async performAction(userId: string, notificationId: string, action: string) {
    try {
      const notification = await this.prisma.inAppNotification.findFirst({
        where: {
          id: notificationId,
          userId,
        },
      });

      if (!notification) {
        throw new Error('Notification not found');
      }

      // Mark as read if not already
      if (!notification.readAt) {
        await this.markAsRead(userId, [notificationId]);
      }

      // Update interaction
      await this.prisma.inAppNotification.update({
        where: { id: notificationId },
        data: {
          interactedAt: new Date(),
          interactionType: action,
        },
      });

      // Track action
      await NotificationRedisService.trackNotificationAction(
        notificationId,
        'in-app',
        action
      );

      // Emit action event for real-time handling
      if (this.pusher) {
        await this.pusher.trigger(
          `private-user-${userId}`,
          'notification-action',
          {
            notificationId,
            action,
            metadata: notification.metadata,
          }
        );
      }

      return true;
    } catch (error) {
      logger.error({ error, userId, notificationId, action }, 'Failed to perform notification action');
      throw error;
    }
  }

  private async storeNotification(notificationId: string, request: InAppNotificationRequest) {
    const notification = await this.prisma.inAppNotification.create({
      data: {
        id: notificationId,
        userId: request.userId,
        type: request.type,
        title: request.title,
        message: request.message,
        actions: request.actions || [],
        persistent: request.persistent || false,
        priority: request.priority || 'normal',
        metadata: request.metadata || {},
        expiresAt: request.expiresAt,
      },
    });

    return notification;
  }

  private async sendRealtimeNotification(userId: string, notification: any) {
    try {
      // Get current unread count
      const unreadCount = await this.getUnreadCount(userId);

      // Send notification through Pusher
      await this.pusher!.trigger(
        `private-user-${userId}`,
        'new-notification',
        {
          notification: {
            id: notification.id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            actions: notification.actions,
            priority: notification.priority,
            createdAt: notification.createdAt.toISOString(),
          },
          unreadCount,
        }
      );

      // For high priority notifications, also send to presence channel
      if (notification.priority === 'high') {
        await this.pusher!.trigger(
          'presence-online-users',
          'urgent-notification',
          {
            userId,
            notification: {
              id: notification.id,
              title: notification.title,
              type: notification.type,
            },
          }
        );
      }
    } catch (error) {
      logger.error({ error, userId, notificationId: notification.id }, 'Failed to send real-time notification');
      // Don't throw - real-time delivery failure shouldn't fail the whole notification
    }
  }

  async cleanup() {
    // Clean up expired notifications
    const deleted = await this.prisma.inAppNotification.deleteMany({
      where: {
        OR: [
          {
            expiresAt: {
              lt: new Date(),
            },
          },
          {
            deletedAt: {
              lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
            },
          },
        ],
      },
    });

    logger.info({ deletedCount: deleted.count }, 'Cleaned up expired notifications');
    return deleted.count;
  }
}