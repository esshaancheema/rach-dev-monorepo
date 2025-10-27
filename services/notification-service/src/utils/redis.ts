import Redis from 'ioredis';
import { redisConfig } from '../config';
import { logger } from './logger';

export const redis = new Redis(redisConfig.url, {
  retryDelayOnClusterDown: redisConfig.retryDelayOnClusterDown,
  retryDelayOnFailover: redisConfig.retryDelayOnFailover,
  maxRetriesPerRequest: redisConfig.maxRetriesPerRequest,
  lazyConnect: redisConfig.lazyConnect,
  enableReadyCheck: true,
  maxLoadingTimeout: 5000,
});

redis.on('connect', () => {
  logger.info('Redis connection established');
});

redis.on('ready', () => {
  logger.info('Redis is ready to receive commands');
});

redis.on('error', (error) => {
  logger.error({ error }, 'Redis connection error');
});

redis.on('close', () => {
  logger.info('Redis connection closed');
});

redis.on('reconnecting', () => {
  logger.info('Redis reconnecting...');
});

// Redis utilities for notification service
export class NotificationRedisService {
  // Notification preferences
  static async setUserPreferences(
    userId: string, 
    preferences: any
  ): Promise<void> {
    const key = `notification_prefs:${userId}`;
    await redis.set(key, JSON.stringify(preferences));
  }

  static async getUserPreferences(userId: string): Promise<any | null> {
    const key = `notification_prefs:${userId}`;
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  // Unsubscribe tokens
  static async setUnsubscribeToken(
    token: string, 
    userId: string, 
    type: string,
    expiryDays: number = 365
  ): Promise<void> {
    const key = `unsubscribe:${token}`;
    const data = { userId, type, createdAt: new Date().toISOString() };
    await redis.setex(key, expiryDays * 24 * 60 * 60, JSON.stringify(data));
  }

  static async getUnsubscribeToken(token: string): Promise<any | null> {
    const key = `unsubscribe:${token}`;
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  // Delivery tracking
  static async trackDelivery(
    notificationId: string,
    channel: string,
    status: 'sent' | 'delivered' | 'failed' | 'bounced',
    metadata?: any
  ): Promise<void> {
    const key = `delivery:${notificationId}:${channel}`;
    const data = {
      status,
      timestamp: new Date().toISOString(),
      ...metadata,
    };
    await redis.setex(key, 30 * 24 * 60 * 60, JSON.stringify(data)); // 30 days
  }

  static async getDeliveryStatus(
    notificationId: string,
    channel: string
  ): Promise<any | null> {
    const key = `delivery:${notificationId}:${channel}`;
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  // Rate limiting per user per channel
  static async checkUserRateLimit(
    userId: string,
    channel: 'email' | 'sms' | 'push',
    limit: number,
    windowSeconds: number = 3600
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const now = Date.now();
    const window = Math.floor(now / (windowSeconds * 1000));
    const key = `rate_limit:${channel}:${userId}:${window}`;

    const current = await redis.incr(key);
    
    if (current === 1) {
      await redis.expire(key, windowSeconds);
    }

    const remaining = Math.max(0, limit - current);
    const resetTime = (window + 1) * windowSeconds * 1000;

    return {
      allowed: current <= limit,
      remaining,
      resetTime,
    };
  }

  // Notification history
  static async addToHistory(
    userId: string,
    notification: any,
    maxHistory: number = 100
  ): Promise<void> {
    const key = `notification_history:${userId}`;
    const data = {
      ...notification,
      timestamp: new Date().toISOString(),
    };

    await redis.lpush(key, JSON.stringify(data));
    await redis.ltrim(key, 0, maxHistory - 1);
    await redis.expire(key, 90 * 24 * 60 * 60); // 90 days
  }

  static async getHistory(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<any[]> {
    const key = `notification_history:${userId}`;
    const data = await redis.lrange(key, offset, offset + limit - 1);
    return data.map(item => JSON.parse(item));
  }

  // Template caching
  static async cacheTemplate(
    templateId: string,
    locale: string,
    compiled: string,
    expirySeconds: number = 3600
  ): Promise<void> {
    const key = `template_cache:${templateId}:${locale}`;
    await redis.setex(key, expirySeconds, compiled);
  }

  static async getCachedTemplate(
    templateId: string,
    locale: string
  ): Promise<string | null> {
    const key = `template_cache:${templateId}:${locale}`;
    return await redis.get(key);
  }

  // Scheduled notifications
  static async scheduleNotification(
    notificationId: string,
    scheduledTime: Date,
    data: any
  ): Promise<void> {
    const score = scheduledTime.getTime();
    await redis.zadd('scheduled_notifications', score, JSON.stringify({
      id: notificationId,
      ...data,
    }));
  }

  static async getScheduledNotifications(
    maxTime: Date
  ): Promise<any[]> {
    const notifications = await redis.zrangebyscore(
      'scheduled_notifications',
      0,
      maxTime.getTime()
    );

    // Remove retrieved notifications
    if (notifications.length > 0) {
      await redis.zremrangebyscore(
        'scheduled_notifications',
        0,
        maxTime.getTime()
      );
    }

    return notifications.map(n => JSON.parse(n));
  }

  // Push notification subscriptions
  static async savePushSubscription(
    userId: string,
    subscription: any
  ): Promise<void> {
    const key = `push_subscription:${userId}`;
    await redis.sadd(key, JSON.stringify(subscription));
  }

  static async getPushSubscriptions(userId: string): Promise<any[]> {
    const key = `push_subscription:${userId}`;
    const subscriptions = await redis.smembers(key);
    return subscriptions.map(s => JSON.parse(s));
  }

  static async removePushSubscription(
    userId: string,
    endpoint: string
  ): Promise<void> {
    const key = `push_subscription:${userId}`;
    const subscriptions = await this.getPushSubscriptions(userId);
    
    for (const sub of subscriptions) {
      if (sub.endpoint === endpoint) {
        await redis.srem(key, JSON.stringify(sub));
        break;
      }
    }
  }

  // Analytics
  static async trackNotificationMetric(
    metric: string,
    channel: string,
    value: number = 1
  ): Promise<void> {
    const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const hour = new Date().getHours();
    const keys = [
      `metrics:${metric}:${channel}:${date}`,
      `metrics:${metric}:${channel}:${date}:${hour}`,
      `metrics:${metric}:total:${date}`,
    ];

    const pipeline = redis.pipeline();
    keys.forEach(key => {
      pipeline.incrby(key, value);
      pipeline.expire(key, 86400 * 30); // 30 days
    });
    
    await pipeline.exec();
  }

  static async getMetrics(
    metric: string,
    channel: string,
    days: number = 7
  ): Promise<{ date: string; value: number }[]> {
    const metrics: { date: string; value: number }[] = [];
    const pipeline = redis.pipeline();

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().slice(0, 10);
      const key = `metrics:${metric}:${channel}:${dateStr}`;
      pipeline.get(key);
    }

    const results = await pipeline.exec();
    
    results?.forEach((result, index) => {
      const date = new Date();
      date.setDate(date.getDate() - index);
      const dateStr = date.toISOString().slice(0, 10);
      const value = parseInt(result[1] as string || '0', 10);
      metrics.push({ date: dateStr, value });
    });

    return metrics.reverse();
  }
}