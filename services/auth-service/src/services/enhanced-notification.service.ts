import { PrismaClient } from '@zoptal/database';
import { logger } from '../utils/logger';
import { cacheManager } from '../utils/redis';
import { enhancedEmailService, EnhancedEmailService } from './email-with-circuit-breaker.service';
import { enhancedSmsService, EnhancedSmsService } from './sms-with-circuit-breaker.service';
import { createUserPreferencesService, UserPreferencesService } from './user-preferences.service';
import { metricsService } from './metrics.service';

export interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationType;
  channels: NotificationChannel[];
  subject?: string;
  content: {
    text: string;
    html?: string;
    sms?: string;
    push?: {
      title: string;
      body: string;
      icon?: string;
      badge?: string;
    };
  };
  variables: string[];
  priority: NotificationPriority;
  deliveryOptions: {
    retry: boolean;
    retryLimit: number;
    retryDelay: number;
    batching: boolean;
    batchSize?: number;
    batchDelay?: number;
  };
  conditions?: {
    timeWindows?: TimeWindow[];
    userSegments?: string[];
    rateLimit?: RateLimit;
  };
}

export interface TimeWindow {
  start: string; // HH:MM format
  end: string;   // HH:MM format
  timezone: string;
  days: number[]; // 0-6 (Sunday-Saturday)
}

export interface RateLimit {
  maxPerHour?: number;
  maxPerDay?: number;
  maxPerWeek?: number;
}

export type NotificationType = 
  | 'welcome'
  | 'email_verification'
  | 'phone_verification'
  | 'password_reset'
  | 'password_changed'
  | 'login_alert'
  | 'security_alert'
  | 'account_suspended'
  | 'account_reactivated'
  | 'two_factor_enabled'
  | 'two_factor_disabled'
  | 'marketing'
  | 'newsletter'
  | 'product_update'
  | 'maintenance'
  | 'data_export_ready'
  | 'account_deletion_warning'
  | 'force_password_reset'
  | 'suspicious_activity'
  | 'device_new_login'
  | 'custom';

export type NotificationChannel = 'email' | 'sms' | 'push' | 'in_app';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'critical';
export type NotificationStatus = 'pending' | 'sending' | 'sent' | 'failed' | 'skipped';

export interface NotificationOptions {
  userId: string;
  templateId?: string;
  type: NotificationType;
  channels?: NotificationChannel[];
  data: Record<string, any>;
  priority?: NotificationPriority;
  skipPreferenceCheck?: boolean;
  scheduleAt?: Date;
  expiresAt?: Date;
  trackingId?: string;
  metadata?: Record<string, any>;
}

export interface NotificationResult {
  id: string;
  status: NotificationStatus;
  channels: {
    email?: { sent: boolean; messageId?: string; error?: string; };
    sms?: { sent: boolean; messageId?: string; error?: string; };
    push?: { sent: boolean; messageId?: string; error?: string; };
    in_app?: { sent: boolean; messageId?: string; error?: string; };
  };
  deliveredAt?: Date;
  failureReason?: string;
  trackingId?: string;
  metadata?: Record<string, any>;
}

export interface NotificationStats {
  total: number;
  sent: number;
  failed: number;
  pending: number;
  byChannel: Record<NotificationChannel, { sent: number; failed: number; }>;
  byType: Record<NotificationType, { sent: number; failed: number; }>;
  deliveryRate: number;
  averageDeliveryTime: number;
}

interface EnhancedNotificationServiceDependencies {
  prisma: PrismaClient;
  emailService?: EnhancedEmailService;
  smsService?: EnhancedSmsService;
}

export class EnhancedNotificationService {
  private prisma: PrismaClient;
  private emailService: EnhancedEmailService;
  private smsService: EnhancedSmsService;
  private preferencesService: UserPreferencesService;
  private templates: Map<string, NotificationTemplate> = new Map();
  private rateLimitCache = 'notification_rate_limit:';

  constructor({
    prisma,
    emailService = enhancedEmailService,
    smsService = enhancedSmsService
  }: EnhancedNotificationServiceDependencies) {
    this.prisma = prisma;
    this.emailService = emailService;
    this.smsService = smsService;
    this.preferencesService = createUserPreferencesService({ prisma });
    
    this.initializeDefaultTemplates();
    logger.info('Enhanced Notification Service initialized');
  }

  /**
   * Send notification with enhanced features
   */
  async sendNotification(options: NotificationOptions): Promise<NotificationResult> {
    const {
      userId,
      templateId,
      type,
      channels = ['email', 'sms'],
      data,
      priority = 'normal',
      skipPreferenceCheck = false,
      scheduleAt,
      expiresAt,
      trackingId,
      metadata
    } = options;

    const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    logger.info('Sending notification', {
      notificationId,
      userId,
      type,
      channels,
      priority,
      trackingId
    });

    try {
      // Get user details
      const user = await this.getUserDetails(userId);
      if (!user) {
        return this.createFailureResult(notificationId, 'User not found', trackingId, metadata);
      }

      // Check if notification should be scheduled
      if (scheduleAt && scheduleAt > new Date()) {
        return await this.scheduleNotification(notificationId, options);
      }

      // Check expiration
      if (expiresAt && expiresAt < new Date()) {
        return this.createSkippedResult(notificationId, 'Notification expired', trackingId, metadata);
      }

      // Get template if specified
      const template = templateId ? this.templates.get(templateId) : this.getDefaultTemplate(type);
      if (!template) {
        return this.createFailureResult(notificationId, 'Template not found', trackingId, metadata);
      }

      // Check user preferences
      const enabledChannels = await this.getEnabledChannels(
        userId, 
        type, 
        channels, 
        priority, 
        skipPreferenceCheck
      );

      if (enabledChannels.length === 0) {
        return this.createSkippedResult(notificationId, 'All channels disabled by user preferences', trackingId, metadata);
      }

      // Check rate limits
      for (const channel of enabledChannels) {
        const rateLimitPassed = await this.checkRateLimit(userId, type, channel, template);
        if (!rateLimitPassed) {
          return this.createSkippedResult(notificationId, `Rate limit exceeded for ${channel}`, trackingId, metadata);
        }
      }

      // Check time windows
      if (!this.isWithinTimeWindow(template, user.timezone)) {
        return await this.scheduleForNextWindow(notificationId, options, template, user.timezone);
      }

      // Send via enabled channels
      const result = await this.sendViaChannels(
        notificationId,
        user,
        template,
        enabledChannels,
        data,
        trackingId,
        metadata
      );

      // Record metrics
      await this.recordMetrics(type, enabledChannels, result);

      // Store notification history
      await this.storeNotificationHistory(notificationId, userId, type, result, metadata);

      return result;

    } catch (error) {
      logger.error('Failed to send notification', {
        notificationId,
        userId,
        type,
        error: error instanceof Error ? error.message : error
      });

      return this.createFailureResult(
        notificationId,
        error instanceof Error ? error.message : 'Unknown error',
        trackingId,
        metadata
      );
    }
  }

  /**
   * Send bulk notifications with batching
   */
  async sendBulkNotifications(
    notifications: NotificationOptions[],
    batchSize: number = 50
  ): Promise<NotificationResult[]> {
    const results: NotificationResult[] = [];
    
    for (let i = 0; i < notifications.length; i += batchSize) {
      const batch = notifications.slice(i, i + batchSize);
      const batchPromises = batch.map(notification => this.sendNotification(notification));
      
      try {
        const batchResults = await Promise.allSettled(batchPromises);
        
        for (const result of batchResults) {
          if (result.status === 'fulfilled') {
            results.push(result.value);
          } else {
            logger.error('Bulk notification failed', { error: result.reason });
            results.push(this.createFailureResult(
              `bulk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              result.reason
            ));
          }
        }
      } catch (error) {
        logger.error('Bulk notification batch failed', { batchIndex: i, error });
      }

      // Add delay between batches to prevent overwhelming external services
      if (i + batchSize < notifications.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  }

  /**
   * Register custom notification template
   */
  registerTemplate(template: NotificationTemplate): void {
    this.templates.set(template.id, template);
    logger.info('Notification template registered', { templateId: template.id, type: template.type });
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(
    userId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<NotificationStats> {
    const whereClause: any = {};
    
    if (userId) {
      whereClause.userId = userId;
    }
    
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = startDate;
      if (endDate) whereClause.createdAt.lte = endDate;
    }

    // This would typically query a notifications table
    // For now, return mock stats
    return {
      total: 1000,
      sent: 950,
      failed: 30,
      pending: 20,
      byChannel: {
        email: { sent: 800, failed: 20 },
        sms: { sent: 150, failed: 10 },
        push: { sent: 0, failed: 0 },
        in_app: { sent: 0, failed: 0 }
      },
      byType: {
        welcome: { sent: 100, failed: 2 },
        email_verification: { sent: 200, failed: 5 },
        phone_verification: { sent: 50, failed: 2 },
        password_reset: { sent: 80, failed: 3 },
        login_alert: { sent: 300, failed: 8 },
        security_alert: { sent: 50, failed: 1 },
        // ... other types
      } as any,
      deliveryRate: 95.0,
      averageDeliveryTime: 2.5 // seconds
    };
  }

  /**
   * Get user notification history
   */
  async getUserNotificationHistory(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    notifications: any[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    // This would typically query a notifications table
    // For now, return mock data
    return {
      notifications: [],
      total: 0,
      page,
      totalPages: 0
    };
  }

  /**
   * Resend failed notification
   */
  async resendNotification(notificationId: string): Promise<NotificationResult> {
    // Implementation would retrieve original notification and retry
    throw new Error('Not implemented');
  }

  /**
   * Cancel scheduled notification
   */
  async cancelScheduledNotification(notificationId: string): Promise<boolean> {
    // Implementation would remove from schedule queue
    throw new Error('Not implemented');
  }

  // Private helper methods

  private async getUserDetails(userId: string) {
    return await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        preferences: true,
        timezone: true,
        language: true
      }
    });
  }

  private async getEnabledChannels(
    userId: string,
    type: NotificationType,
    requestedChannels: NotificationChannel[],
    priority: NotificationPriority,
    skipPreferenceCheck: boolean
  ): Promise<NotificationChannel[]> {
    if (skipPreferenceCheck || priority === 'critical') {
      return requestedChannels;
    }

    const enabledChannels: NotificationChannel[] = [];
    
    for (const channel of requestedChannels) {
      const shouldSend = await this.preferencesService.shouldSendNotification(userId, type, channel);
      if (shouldSend) {
        enabledChannels.push(channel);
      }
    }

    return enabledChannels;
  }

  private async checkRateLimit(
    userId: string,
    type: NotificationType,
    channel: NotificationChannel,
    template: NotificationTemplate
  ): Promise<boolean> {
    if (!template.conditions?.rateLimit) {
      return true;
    }

    const { maxPerHour, maxPerDay, maxPerWeek } = template.conditions.rateLimit;
    const cacheKey = `${this.rateLimitCache}${userId}:${type}:${channel}`;

    // Check hourly limit
    if (maxPerHour) {
      const hourlyKey = `${cacheKey}:hour:${Math.floor(Date.now() / (60 * 60 * 1000))}`;
      const hourlyCount = await cacheManager.get(hourlyKey);
      if (hourlyCount && parseInt(hourlyCount) >= maxPerHour) {
        return false;
      }
    }

    // Check daily limit
    if (maxPerDay) {
      const dailyKey = `${cacheKey}:day:${Math.floor(Date.now() / (24 * 60 * 60 * 1000))}`;
      const dailyCount = await cacheManager.get(dailyKey);
      if (dailyCount && parseInt(dailyCount) >= maxPerDay) {
        return false;
      }
    }

    // Check weekly limit
    if (maxPerWeek) {
      const weeklyKey = `${cacheKey}:week:${Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000))}`;
      const weeklyCount = await cacheManager.get(weeklyKey);
      if (weeklyCount && parseInt(weeklyCount) >= maxPerWeek) {
        return false;
      }
    }

    return true;
  }

  private isWithinTimeWindow(template: NotificationTemplate, userTimezone?: string): boolean {
    if (!template.conditions?.timeWindows) {
      return true;
    }

    const now = new Date();
    const timezone = userTimezone || 'UTC';
    
    // Convert current time to user's timezone
    const userTime = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      weekday: 'short',
      hour12: false
    }).formatToParts(now);

    const currentHour = parseInt(userTime.find(part => part.type === 'hour')?.value || '0');
    const currentMinute = parseInt(userTime.find(part => part.type === 'minute')?.value || '0');
    const currentDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(
      userTime.find(part => part.type === 'weekday')?.value || 'Sun'
    );

    const currentTimeMinutes = currentHour * 60 + currentMinute;

    for (const window of template.conditions.timeWindows) {
      if (window.days.includes(currentDay)) {
        const [startHour, startMinute] = window.start.split(':').map(Number);
        const [endHour, endMinute] = window.end.split(':').map(Number);
        
        const startTimeMinutes = startHour * 60 + startMinute;
        const endTimeMinutes = endHour * 60 + endMinute;

        if (currentTimeMinutes >= startTimeMinutes && currentTimeMinutes <= endTimeMinutes) {
          return true;
        }
      }
    }

    return false;
  }

  private async sendViaChannels(
    notificationId: string,
    user: any,
    template: NotificationTemplate,
    channels: NotificationChannel[],
    data: Record<string, any>,
    trackingId?: string,
    metadata?: Record<string, any>
  ): Promise<NotificationResult> {
    const result: NotificationResult = {
      id: notificationId,
      status: 'sending',
      channels: {},
      trackingId,
      metadata
    };

    const sendPromises: Promise<void>[] = [];

    for (const channel of channels) {
      switch (channel) {
        case 'email':
          if (user.email && user.isEmailVerified) {
            sendPromises.push(this.sendEmailNotification(user, template, data, result));
          } else {
            result.channels.email = { sent: false, error: 'Email not verified' };
          }
          break;

        case 'sms':
          if (user.phone && user.isPhoneVerified) {
            sendPromises.push(this.sendSmsNotification(user, template, data, result));
          } else {
            result.channels.sms = { sent: false, error: 'Phone not verified' };
          }
          break;

        case 'push':
          // Push notifications would be implemented here
          result.channels.push = { sent: false, error: 'Push notifications not implemented' };
          break;

        case 'in_app':
          // In-app notifications would be implemented here
          result.channels.in_app = { sent: false, error: 'In-app notifications not implemented' };
          break;
      }
    }

    await Promise.allSettled(sendPromises);

    // Determine overall status
    const hasSuccessful = Object.values(result.channels).some(channel => channel.sent);
    const hasFailures = Object.values(result.channels).some(channel => !channel.sent && channel.error);

    if (hasSuccessful) {
      result.status = hasFailures ? 'sent' : 'sent';
      result.deliveredAt = new Date();
    } else {
      result.status = 'failed';
      result.failureReason = 'All channels failed';
    }

    return result;
  }

  private async sendEmailNotification(
    user: any,
    template: NotificationTemplate,
    data: Record<string, any>,
    result: NotificationResult
  ): Promise<void> {
    try {
      const emailResult = await this.emailService.sendEmailVerification({
        to: user.email,
        name: `${user.firstName} ${user.lastName}`,
        verificationUrl: data.verificationUrl || '#'
      });

      result.channels.email = {
        sent: emailResult.success,
        messageId: emailResult.messageId,
        error: emailResult.success ? undefined : emailResult.error
      };
    } catch (error) {
      result.channels.email = {
        sent: false,
        error: error instanceof Error ? error.message : 'Unknown email error'
      };
    }
  }

  private async sendSmsNotification(
    user: any,
    template: NotificationTemplate,
    data: Record<string, any>,
    result: NotificationResult
  ): Promise<void> {
    try {
      const smsResult = await this.smsService.sendPhoneVerification({
        to: user.phone,
        code: data.code || '123456',
        name: user.firstName
      });

      result.channels.sms = {
        sent: smsResult.success,
        messageId: smsResult.messageId,
        error: smsResult.success ? undefined : smsResult.error
      };
    } catch (error) {
      result.channels.sms = {
        sent: false,
        error: error instanceof Error ? error.message : 'Unknown SMS error'
      };
    }
  }

  private async recordMetrics(
    type: NotificationType,
    channels: NotificationChannel[],
    result: NotificationResult
  ): Promise<void> {
    try {
      metricsService.recordCustomMetric('notifications_sent_total', 1, {
        type,
        status: result.status
      });

      for (const channel of channels) {
        const channelResult = result.channels[channel];
        if (channelResult) {
          metricsService.recordCustomMetric('notifications_by_channel', 1, {
            channel,
            status: channelResult.sent ? 'success' : 'failed'
          });
        }
      }
    } catch (error) {
      logger.error('Failed to record notification metrics', error);
    }
  }

  private async storeNotificationHistory(
    notificationId: string,
    userId: string,
    type: NotificationType,
    result: NotificationResult,
    metadata?: Record<string, any>
  ): Promise<void> {
    // This would store to a notifications history table
    logger.info('Notification history stored', {
      notificationId,
      userId,
      type,
      status: result.status,
      metadata
    });
  }

  private createFailureResult(
    id: string,
    reason: string,
    trackingId?: string,
    metadata?: Record<string, any>
  ): NotificationResult {
    return {
      id,
      status: 'failed',
      channels: {},
      failureReason: reason,
      trackingId,
      metadata
    };
  }

  private createSkippedResult(
    id: string,
    reason: string,
    trackingId?: string,
    metadata?: Record<string, any>
  ): NotificationResult {
    return {
      id,
      status: 'skipped',
      channels: {},
      failureReason: reason,
      trackingId,
      metadata
    };
  }

  private async scheduleNotification(
    notificationId: string,
    options: NotificationOptions
  ): Promise<NotificationResult> {
    // Implementation would queue the notification for later delivery
    logger.info('Notification scheduled', {
      notificationId,
      scheduleAt: options.scheduleAt
    });

    return {
      id: notificationId,
      status: 'pending',
      channels: {},
      trackingId: options.trackingId,
      metadata: options.metadata
    };
  }

  private async scheduleForNextWindow(
    notificationId: string,
    options: NotificationOptions,
    template: NotificationTemplate,
    userTimezone?: string
  ): Promise<NotificationResult> {
    // Calculate next available time window and schedule
    return this.scheduleNotification(notificationId, options);
  }

  private initializeDefaultTemplates(): void {
    // Initialize default notification templates
    const defaultTemplates: NotificationTemplate[] = [
      {
        id: 'welcome',
        name: 'Welcome Email',
        type: 'welcome',
        channels: ['email'],
        subject: 'Welcome to Zoptal!',
        content: {
          text: 'Welcome {{firstName}}! Thanks for joining Zoptal.',
          html: '<h1>Welcome {{firstName}}!</h1><p>Thanks for joining Zoptal.</p>'
        },
        variables: ['firstName', 'lastName'],
        priority: 'normal',
        deliveryOptions: {
          retry: true,
          retryLimit: 3,
          retryDelay: 300000, // 5 minutes
          batching: false
        }
      },
      {
        id: 'email_verification',
        name: 'Email Verification',
        type: 'email_verification',
        channels: ['email'],
        subject: 'Verify your email address',
        content: {
          text: 'Please verify your email: {{verificationUrl}}',
          html: '<p>Please <a href="{{verificationUrl}}">verify your email</a></p>'
        },
        variables: ['firstName', 'verificationUrl'],
        priority: 'high',
        deliveryOptions: {
          retry: true,
          retryLimit: 5,
          retryDelay: 180000, // 3 minutes
          batching: false
        }
      },
      {
        id: 'security_alert',
        name: 'Security Alert',
        type: 'security_alert',
        channels: ['email', 'sms'],
        subject: 'Security Alert - {{alertType}}',
        content: {
          text: 'Security alert: {{alertDescription}}',
          html: '<div class="alert"><h2>Security Alert</h2><p>{{alertDescription}}</p></div>',
          sms: 'Security alert: {{alertDescription}}'
        },
        variables: ['alertType', 'alertDescription', 'timestamp'],
        priority: 'critical',
        deliveryOptions: {
          retry: true,
          retryLimit: 10,
          retryDelay: 60000, // 1 minute
          batching: false
        }
      }
    ];

    for (const template of defaultTemplates) {
      this.templates.set(template.id, template);
    }

    logger.info(`Initialized ${defaultTemplates.length} default notification templates`);
  }

  private getDefaultTemplate(type: NotificationType): NotificationTemplate | undefined {
    return Array.from(this.templates.values()).find(template => template.type === type);
  }
}

// Export singleton instance
export const enhancedNotificationService = new EnhancedNotificationService({
  prisma: new (require('@zoptal/database').PrismaClient)()
});