import { PrismaClient } from '@zoptal/database';
import { logger } from '../utils/logger';
import { EmailService } from './email.service';
import { SmsService } from './sms.service';
import { createUserPreferencesService, UserPreferencesService } from './user-preferences.service';

export interface NotificationOptions {
  userId: string;
  type: string;
  channels?: ('email' | 'sms' | 'push')[];
  data: any;
  priority?: 'low' | 'normal' | 'high' | 'critical';
  skipPreferenceCheck?: boolean;
}

export interface NotificationResult {
  sent: string[];
  skipped: string[];
  failed: string[];
  reason?: string;
}

interface NotificationServiceDependencies {
  prisma: PrismaClient;
  emailService: EmailService;
  smsService: SmsService;
}

export function createNotificationService({
  prisma,
  emailService,
  smsService
}: NotificationServiceDependencies) {
  const preferencesService = createUserPreferencesService({ prisma });

  /**
   * Send notification respecting user preferences
   */
  async function sendNotification(options: NotificationOptions): Promise<NotificationResult> {
    const {
      userId,
      type,
      channels = ['email', 'sms', 'push'],
      data,
      priority = 'normal',
      skipPreferenceCheck = false
    } = options;

    const result: NotificationResult = {
      sent: [],
      skipped: [],
      failed: []
    };

    try {
      // Get user details
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          email: true,
          phoneNumber: true,
          emailVerified: true,
          phoneVerified: true
        }
      });

      if (!user) {
        result.reason = 'User not found';
        return result;
      }

      // Check user preferences unless skipped (for critical notifications)
      let enabledChannels = channels;
      if (!skipPreferenceCheck && priority !== 'critical') {
        enabledChannels = [];
        
        for (const channel of channels) {
          const shouldSend = await preferencesService.shouldSendNotification(userId, type, channel);
          if (shouldSend) {
            enabledChannels.push(channel);
          } else {
            result.skipped.push(channel);
          }
        }
      }

      // Send via enabled channels
      for (const channel of enabledChannels) {
        try {
          switch (channel) {
            case 'email':
              if (user.email && user.emailVerified) {
                await sendEmailNotification(user.email, type, data);
                result.sent.push('email');
              } else {
                result.skipped.push('email');
              }
              break;

            case 'sms':
              if (user.phoneNumber && user.phoneVerified) {
                await sendSmsNotification(user.phoneNumber, type, data);
                result.sent.push('sms');
              } else {
                result.skipped.push('sms');
              }
              break;

            case 'push':
              // Push notifications would be implemented here
              result.skipped.push('push'); // Not implemented yet
              break;
          }
        } catch (error) {
          logger.error({ error, userId, type, channel }, 'Failed to send notification');
          result.failed.push(channel);
        }
      }

      // Log notification event
      await prisma.activityLog.create({
        data: {
          userId,
          action: 'NOTIFICATION_SENT',
          category: 'NOTIFICATION',
          ip: '127.0.0.1',
          userAgent: 'System',
          metadata: {
            type,
            priority,
            channels: result.sent,
            skipped: result.skipped,
            failed: result.failed
          }
        }
      });

      return result;

    } catch (error) {
      logger.error({ error, userId, type }, 'Failed to send notification');
      throw error;
    }
  }

  /**
   * Send email notification based on type
   */
  async function sendEmailNotification(email: string, type: string, data: any): Promise<void> {
    switch (type) {
      case 'welcome':
        await emailService.sendWelcomeEmail({
          to: email,
          name: data.name,
          loginUrl: data.loginUrl
        });
        break;

      case 'emailVerification':
        await emailService.sendVerificationEmail({
          to: email,
          name: data.name,
          verificationUrl: data.verificationUrl
        });
        break;

      case 'passwordReset':
        await emailService.sendPasswordResetEmail({
          to: email,
          name: data.name,
          resetUrl: data.resetUrl,
          expiresInMinutes: data.expiresInMinutes
        });
        break;

      case 'security':
        await emailService.sendSecurityAlert({
          to: email,
          name: data.name,
          event: data.event,
          timestamp: data.timestamp,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent
        });
        break;

      case 'twoFactor':
        await emailService.sendTwoFactorCode({
          to: email,
          name: data.name,
          code: data.code,
          expiresInMinutes: data.expiresInMinutes
        });
        break;

      default:
        logger.warn({ type, email }, 'Unknown email notification type');
    }
  }

  /**
   * Send SMS notification based on type
   */
  async function sendSmsNotification(phoneNumber: string, type: string, data: any): Promise<void> {
    let message: string;

    switch (type) {
      case 'phoneVerification':
        message = `Your verification code is: ${data.code}. Valid for ${data.expiresInMinutes} minutes.`;
        break;

      case 'twoFactor':
        message = `Your 2FA code is: ${data.code}. Do not share this code.`;
        break;

      case 'security':
        message = `Security Alert: ${data.event} from ${data.location || 'Unknown location'}. If this wasn't you, secure your account immediately.`;
        break;

      case 'passwordReset':
        message = `Password reset requested. Use code: ${data.code} or visit: ${data.shortUrl}`;
        break;

      default:
        logger.warn({ type, phoneNumber }, 'Unknown SMS notification type');
        return;
    }

    await smsService.sendSms(phoneNumber, message);
  }

  /**
   * Send security alert to all channels (bypasses preferences)
   */
  async function sendSecurityAlert(userId: string, event: string, details: any): Promise<NotificationResult> {
    return sendNotification({
      userId,
      type: 'security',
      channels: ['email', 'sms'],
      data: {
        event,
        timestamp: new Date().toISOString(),
        ...details
      },
      priority: 'critical',
      skipPreferenceCheck: true // Security alerts always sent
    });
  }

  /**
   * Send welcome notification
   */
  async function sendWelcomeNotification(userId: string, name: string): Promise<NotificationResult> {
    return sendNotification({
      userId,
      type: 'welcome',
      channels: ['email'],
      data: {
        name,
        loginUrl: `${config.FRONTEND_URL}/login`
      },
      priority: 'normal'
    });
  }

  /**
   * Check notification preferences for a user
   */
  async function checkNotificationPreferences(
    userId: string,
    notificationType: string
  ): Promise<{
    email: boolean;
    sms: boolean;
    push: boolean;
  }> {
    const preferences = await preferencesService.getUserPreferences(userId);
    
    return {
      email: await preferencesService.shouldSendNotification(userId, notificationType, 'email'),
      sms: await preferencesService.shouldSendNotification(userId, notificationType, 'sms'),
      push: await preferencesService.shouldSendNotification(userId, notificationType, 'push')
    };
  }

  /**
   * Get notification history for a user
   */
  async function getNotificationHistory(
    userId: string,
    limit: number = 50
  ): Promise<any[]> {
    const logs = await prisma.activityLog.findMany({
      where: {
        userId,
        action: 'NOTIFICATION_SENT',
        category: 'NOTIFICATION'
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return logs.map(log => ({
      id: log.id,
      type: log.metadata?.type,
      channels: log.metadata?.channels || [],
      priority: log.metadata?.priority,
      sentAt: log.createdAt,
      metadata: log.metadata
    }));
  }

  /**
   * Batch send notifications
   */
  async function batchSendNotifications(
    notifications: NotificationOptions[]
  ): Promise<Map<string, NotificationResult>> {
    const results = new Map<string, NotificationResult>();

    // Process in batches to avoid overwhelming services
    const batchSize = 10;
    for (let i = 0; i < notifications.length; i += batchSize) {
      const batch = notifications.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(async (notification) => {
          try {
            const result = await sendNotification(notification);
            results.set(notification.userId, result);
          } catch (error) {
            logger.error({ error, userId: notification.userId }, 'Failed to send batch notification');
            results.set(notification.userId, {
              sent: [],
              skipped: [],
              failed: ['all'],
              reason: 'Processing error'
            });
          }
        })
      );

      // Small delay between batches
      if (i + batchSize < notifications.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return results;
  }

  return {
    sendNotification,
    sendSecurityAlert,
    sendWelcomeNotification,
    checkNotificationPreferences,
    getNotificationHistory,
    batchSendNotifications
  };
}

// Type exports
export type NotificationService = ReturnType<typeof createNotificationService>;