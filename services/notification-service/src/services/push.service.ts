import webpush from 'web-push';
import Pusher from 'pusher';
import { pushConfig, pusherConfig, templateConfig } from '../config';
import { logger } from '../utils/logger';
import { NotificationRedisService } from '../utils/redis';
import { nanoid } from 'nanoid';
import handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface PushNotificationRequest {
  userId: string;
  title: string;
  body?: string;
  icon?: string;
  badge?: string;
  image?: string;
  url?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  vibrate?: number[];
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  data?: Record<string, any>;
  templateId?: string;
  templateData?: Record<string, any>;
  locale?: string;
  scheduledFor?: Date;
}

export interface InAppNotificationRequest {
  userId?: string;
  channel?: string;
  event: string;
  data: Record<string, any>;
}

export interface PushNotificationResponse {
  id: string;
  status: 'sent' | 'scheduled' | 'failed';
  successCount?: number;
  failCount?: number;
  error?: string;
  sentAt?: string;
}

export class PushNotificationService {
  private pusher: Pusher | null = null;
  private compiledTemplates: Map<string, handlebars.TemplateDelegate> = new Map();

  constructor() {
    // Initialize Web Push
    if (pushConfig.enabled) {
      webpush.setVapidDetails(
        pushConfig.subject,
        pushConfig.vapidKeys.publicKey!,
        pushConfig.vapidKeys.privateKey!
      );
      logger.info('Web Push service initialized');
    }

    // Initialize Pusher for real-time notifications
    if (pusherConfig.enabled) {
      this.pusher = new Pusher({
        appId: pusherConfig.appId!,
        key: pusherConfig.key!,
        secret: pusherConfig.secret!,
        cluster: pusherConfig.cluster,
        useTLS: pusherConfig.useTLS,
      });
      logger.info('Pusher real-time service initialized');
    }
  }

  async sendPushNotification(request: PushNotificationRequest): Promise<PushNotificationResponse> {
    const pushId = `push_${nanoid()}`;
    const startTime = Date.now();

    try {
      if (!pushConfig.enabled) {
        throw new Error('Push notifications are not enabled');
      }

      // Check user rate limits
      const rateLimit = await NotificationRedisService.checkUserRateLimit(
        request.userId,
        'push',
        pushConfig.rateLimitPerUser
      );

      if (!rateLimit.allowed) {
        throw new Error(`Push notification rate limit exceeded. Reset at ${new Date(rateLimit.resetTime).toISOString()}`);
      }

      // Handle scheduled notifications
      if (request.scheduledFor && request.scheduledFor > new Date()) {
        await this.schedulePushNotification(pushId, request);
        return {
          id: pushId,
          status: 'scheduled',
        };
      }

      // Get user's push subscriptions
      const subscriptions = await NotificationRedisService.getPushSubscriptions(request.userId);
      
      if (subscriptions.length === 0) {
        throw new Error('No push subscriptions found for user');
      }

      // Prepare notification payload
      const payload = await this.prepareNotificationPayload(request);

      // Send to all user's subscriptions
      const results = await Promise.allSettled(
        subscriptions.map(sub => this.sendToSubscription(sub, payload))
      );

      // Process results
      let successCount = 0;
      let failCount = 0;
      const failedEndpoints: string[] = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successCount++;
        } else {
          failCount++;
          failedEndpoints.push(subscriptions[index].endpoint);
          
          // Remove invalid subscriptions
          if (result.reason?.statusCode === 410) {
            NotificationRedisService.removePushSubscription(
              request.userId,
              subscriptions[index].endpoint
            );
          }
        }
      });

      // Track delivery
      await NotificationRedisService.trackDelivery(pushId, 'push', 'sent', {
        successCount,
        failCount,
        totalSubscriptions: subscriptions.length,
      });

      // Add to history
      if (successCount > 0) {
        await NotificationRedisService.addToHistory(request.userId, {
          id: pushId,
          type: 'push',
          title: request.title,
          body: request.body,
          sentAt: new Date().toISOString(),
          templateId: request.templateId,
        });
      }

      // Track metrics
      await NotificationRedisService.trackNotificationMetric('sent', 'push', successCount);
      if (failCount > 0) {
        await NotificationRedisService.trackNotificationMetric('failed', 'push', failCount);
      }

      const responseTime = Date.now() - startTime;
      logger.info({
        pushId,
        userId: request.userId,
        successCount,
        failCount,
        responseTime,
      }, 'Push notifications sent');

      if (successCount === 0) {
        return {
          id: pushId,
          status: 'failed',
          error: 'All push notifications failed',
          failCount,
        };
      }

      return {
        id: pushId,
        status: 'sent',
        successCount,
        failCount,
        sentAt: new Date().toISOString(),
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      // Track failed delivery
      await NotificationRedisService.trackDelivery(pushId, 'push', 'failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      // Track metrics
      await NotificationRedisService.trackNotificationMetric('failed', 'push');

      logger.error({
        pushId,
        userId: request.userId,
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime,
      }, 'Failed to send push notification');

      return {
        id: pushId,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async sendToSubscription(
    subscription: PushSubscription,
    payload: any
  ): Promise<webpush.SendResult> {
    const options: webpush.RequestOptions = {
      TTL: 60 * 60 * 24, // 24 hours
      urgency: payload.silent ? 'low' : 'normal',
    };

    return webpush.sendNotification(subscription, JSON.stringify(payload), options);
  }

  private async prepareNotificationPayload(request: PushNotificationRequest): Promise<any> {
    let title = request.title;
    let body = request.body || '';

    // Load template if specified
    if (request.templateId) {
      const locale = request.locale || templateConfig.defaultLocale;
      const template = await this.loadTemplate(request.templateId, locale);
      
      if (template) {
        const data = {
          ...request.templateData,
          companyName: 'Zoptal',
        };

        const rendered = template(data);
        
        // Parse template output (expecting JSON format for push templates)
        try {
          const parsed = JSON.parse(rendered);
          title = parsed.title || title;
          body = parsed.body || body;
        } catch {
          // If not JSON, use as body
          body = rendered;
        }
      }
    }

    const payload = {
      title,
      body,
      icon: request.icon || '/icon-192x192.png',
      badge: request.badge || '/badge-72x72.png',
      timestamp: Date.now(),
      tag: request.tag || 'default',
      requireInteraction: request.requireInteraction || false,
      silent: request.silent || false,
      data: {
        ...request.data,
        notificationId: nanoid(),
        url: request.url || '/',
      },
    };

    // Add optional fields
    if (request.image) payload['image'] = request.image;
    if (request.vibrate) payload['vibrate'] = request.vibrate;
    if (request.actions) payload['actions'] = request.actions;

    return payload;
  }

  async sendInAppNotification(request: InAppNotificationRequest): Promise<void> {
    if (!this.pusher) {
      logger.warn('In-app notifications disabled - Pusher not configured');
      return;
    }

    try {
      const channel = request.channel || `private-user-${request.userId}`;
      
      await this.pusher.trigger(channel, request.event, request.data);

      // Track metrics
      await NotificationRedisService.trackNotificationMetric('sent', 'in_app');

      logger.info({
        channel,
        event: request.event,
        userId: request.userId,
      }, 'In-app notification sent');

    } catch (error) {
      // Track metrics
      await NotificationRedisService.trackNotificationMetric('failed', 'in_app');

      logger.error({
        error: error instanceof Error ? error.message : 'Unknown error',
        channel: request.channel,
        event: request.event,
      }, 'Failed to send in-app notification');
      
      throw error;
    }
  }

  async subscribeToPush(
    userId: string,
    subscription: PushSubscription
  ): Promise<void> {
    try {
      // Validate subscription
      if (!subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
        throw new Error('Invalid push subscription');
      }

      // Save subscription
      await NotificationRedisService.savePushSubscription(userId, subscription);

      logger.info({
        userId,
        endpoint: subscription.endpoint,
      }, 'Push subscription saved');

    } catch (error) {
      logger.error({
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      }, 'Failed to save push subscription');
      
      throw error;
    }
  }

  async unsubscribeFromPush(
    userId: string,
    endpoint: string
  ): Promise<void> {
    try {
      await NotificationRedisService.removePushSubscription(userId, endpoint);

      logger.info({
        userId,
        endpoint,
      }, 'Push subscription removed');

    } catch (error) {
      logger.error({
        userId,
        endpoint,
        error: error instanceof Error ? error.message : 'Unknown error',
      }, 'Failed to remove push subscription');
      
      throw error;
    }
  }

  async getUserSubscriptions(userId: string): Promise<PushSubscription[]> {
    return NotificationRedisService.getPushSubscriptions(userId);
  }

  private async loadTemplate(
    templateId: string,
    locale: string
  ): Promise<handlebars.TemplateDelegate | null> {
    const cacheKey = `${templateId}:${locale}`;
    
    // Check compiled cache
    if (this.compiledTemplates.has(cacheKey)) {
      return this.compiledTemplates.get(cacheKey)!;
    }

    // Check Redis cache
    const cached = await NotificationRedisService.getCachedTemplate(templateId, locale);
    if (cached) {
      const compiled = handlebars.compile(cached);
      this.compiledTemplates.set(cacheKey, compiled);
      return compiled;
    }

    try {
      // Load from file system
      const templatePath = path.join(
        templateConfig.path,
        locale,
        'push',
        `${templateId}.hbs`
      );
      
      const templateContent = await fs.readFile(templatePath, 'utf-8');
      const compiled = handlebars.compile(templateContent);
      
      // Cache compiled template
      this.compiledTemplates.set(cacheKey, compiled);
      await NotificationRedisService.cacheTemplate(templateId, locale, templateContent);
      
      return compiled;
    } catch (error) {
      logger.error({ templateId, locale, error }, 'Failed to load push template');
      
      // Try default locale
      if (locale !== templateConfig.defaultLocale) {
        return this.loadTemplate(templateId, templateConfig.defaultLocale);
      }
      
      return null;
    }
  }

  private async schedulePushNotification(
    pushId: string,
    request: PushNotificationRequest
  ): Promise<void> {
    await NotificationRedisService.scheduleNotification(
      pushId,
      request.scheduledFor!,
      {
        type: 'push',
        request,
      }
    );

    logger.info({
      pushId,
      scheduledFor: request.scheduledFor,
      userId: request.userId,
    }, 'Push notification scheduled');
  }

  getVapidPublicKey(): string | undefined {
    return pushConfig.vapidKeys.publicKey;
  }

  isPushEnabled(): boolean {
    return pushConfig.enabled;
  }

  isInAppEnabled(): boolean {
    return pusherConfig.enabled;
  }

  getPusherConfig(): { key: string; cluster: string } | null {
    if (!pusherConfig.enabled) return null;
    
    return {
      key: pusherConfig.key!,
      cluster: pusherConfig.cluster,
    };
  }
}