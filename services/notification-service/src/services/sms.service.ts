import twilio from 'twilio';
import { smsConfig, templateConfig } from '../config';
import { logger } from '../utils/logger';
import { NotificationRedisService } from '../utils/redis';
import { nanoid } from 'nanoid';
import handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';

export interface SMSRequest {
  to: string | string[];
  body?: string;
  templateId?: string;
  templateData?: Record<string, any>;
  locale?: string;
  userId?: string;
  metadata?: Record<string, any>;
  scheduledFor?: Date;
  mediaUrls?: string[];
  statusCallback?: string;
}

export interface SMSResponse {
  id: string;
  status: 'sent' | 'scheduled' | 'failed';
  messageId?: string;
  error?: string;
  sentAt?: string;
  to?: string[];
}

export class SMSService {
  private client: twilio.Twilio | null = null;
  private compiledTemplates: Map<string, handlebars.TemplateDelegate> = new Map();

  constructor() {
    if (smsConfig.enabled) {
      this.client = twilio(smsConfig.accountSid!, smsConfig.authToken!);
      logger.info('Twilio SMS service initialized');
    } else {
      logger.warn('SMS service disabled - missing Twilio credentials');
    }
  }

  private ensureClient(): twilio.Twilio {
    if (!this.client) {
      throw new Error('SMS service is not enabled or configured');
    }
    return this.client;
  }

  async sendSMS(request: SMSRequest): Promise<SMSResponse> {
    const smsId = `sms_${nanoid()}`;
    const startTime = Date.now();

    try {
      const client = this.ensureClient();

      // Check user rate limits if userId provided
      if (request.userId) {
        const rateLimit = await NotificationRedisService.checkUserRateLimit(
          request.userId,
          'sms',
          smsConfig.rateLimitPerUser
        );

        if (!rateLimit.allowed) {
          throw new Error(`SMS rate limit exceeded. Reset at ${new Date(rateLimit.resetTime).toISOString()}`);
        }
      }

      // Handle scheduled SMS
      if (request.scheduledFor && request.scheduledFor > new Date()) {
        await this.scheduleSMS(smsId, request);
        return {
          id: smsId,
          status: 'scheduled',
        };
      }

      // Prepare SMS content
      const body = await this.prepareSMSContent(request);

      // Normalize phone numbers
      const phoneNumbers = Array.isArray(request.to) ? request.to : [request.to];
      const normalizedNumbers = phoneNumbers.map(num => this.normalizePhoneNumber(num));

      // Send SMS to each recipient
      const results = await Promise.allSettled(
        normalizedNumbers.map(to => this.sendSingleSMS(client, to, body, request))
      );

      // Process results
      const successfulSends: string[] = [];
      const failedSends: Array<{ to: string; error: string }> = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successfulSends.push(normalizedNumbers[index]);
        } else {
          failedSends.push({
            to: normalizedNumbers[index],
            error: result.reason?.message || 'Unknown error',
          });
        }
      });

      // Track delivery
      if (successfulSends.length > 0) {
        await NotificationRedisService.trackDelivery(smsId, 'sms', 'sent', {
          successCount: successfulSends.length,
          failCount: failedSends.length,
        });
      }

      // Add to history if userId provided
      if (request.userId && successfulSends.length > 0) {
        await NotificationRedisService.addToHistory(request.userId, {
          id: smsId,
          type: 'sms',
          body: body.substring(0, 100) + (body.length > 100 ? '...' : ''),
          to: successfulSends,
          sentAt: new Date().toISOString(),
          templateId: request.templateId,
        });
      }

      // Track metrics
      await NotificationRedisService.trackNotificationMetric('sent', 'sms', successfulSends.length);
      if (failedSends.length > 0) {
        await NotificationRedisService.trackNotificationMetric('failed', 'sms', failedSends.length);
      }

      const responseTime = Date.now() - startTime;
      logger.info({
        smsId,
        successCount: successfulSends.length,
        failCount: failedSends.length,
        responseTime,
      }, 'SMS batch processed');

      // Return appropriate status
      if (successfulSends.length === 0) {
        return {
          id: smsId,
          status: 'failed',
          error: 'All SMS sends failed',
          to: [],
        };
      }

      return {
        id: smsId,
        status: 'sent',
        sentAt: new Date().toISOString(),
        to: successfulSends,
        ...(failedSends.length > 0 && { 
          error: `Failed to send to ${failedSends.length} recipients` 
        }),
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      // Track failed delivery
      await NotificationRedisService.trackDelivery(smsId, 'sms', 'failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      // Track metrics
      await NotificationRedisService.trackNotificationMetric('failed', 'sms');

      logger.error({
        smsId,
        to: request.to,
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime,
      }, 'Failed to send SMS');

      return {
        id: smsId,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async sendSingleSMS(
    client: twilio.Twilio,
    to: string,
    body: string,
    request: SMSRequest
  ): Promise<twilio.MessageInstance> {
    const messageOptions: twilio.MessageListInstanceCreateOptions = {
      to,
      body,
      ...(smsConfig.messagingServiceSid 
        ? { messagingServiceSid: smsConfig.messagingServiceSid }
        : { from: smsConfig.phoneNumber }
      ),
    };

    // Add media URLs if provided (MMS)
    if (request.mediaUrls && request.mediaUrls.length > 0) {
      messageOptions.mediaUrl = request.mediaUrls;
    }

    // Add status callback if provided
    if (request.statusCallback) {
      messageOptions.statusCallback = request.statusCallback;
    }

    const message = await client.messages.create(messageOptions);

    logger.debug({
      messageSid: message.sid,
      to,
      status: message.status,
    }, 'SMS sent via Twilio');

    return message;
  }

  private async prepareSMSContent(request: SMSRequest): Promise<string> {
    if (request.body) {
      return request.body;
    }

    if (request.templateId) {
      const locale = request.locale || templateConfig.defaultLocale;
      const template = await this.loadTemplate(request.templateId, locale);
      
      if (template) {
        const data = {
          ...request.templateData,
          companyName: 'Zoptal',
        };

        return template(data);
      }
    }

    throw new Error('SMS body or templateId is required');
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
        'sms',
        `${templateId}.hbs`
      );
      
      const templateContent = await fs.readFile(templatePath, 'utf-8');
      const compiled = handlebars.compile(templateContent);
      
      // Cache compiled template
      this.compiledTemplates.set(cacheKey, compiled);
      await NotificationRedisService.cacheTemplate(templateId, locale, templateContent);
      
      return compiled;
    } catch (error) {
      logger.error({ templateId, locale, error }, 'Failed to load SMS template');
      
      // Try default locale
      if (locale !== templateConfig.defaultLocale) {
        return this.loadTemplate(templateId, templateConfig.defaultLocale);
      }
      
      return null;
    }
  }

  private normalizePhoneNumber(phoneNumber: string): string {
    // Remove all non-numeric characters
    let normalized = phoneNumber.replace(/\D/g, '');

    // Add country code if missing (assuming US)
    if (normalized.length === 10) {
      normalized = '1' + normalized;
    }

    // Add + prefix
    if (!normalized.startsWith('+')) {
      normalized = '+' + normalized;
    }

    return normalized;
  }

  private async scheduleSMS(smsId: string, request: SMSRequest): Promise<void> {
    await NotificationRedisService.scheduleNotification(
      smsId,
      request.scheduledFor!,
      {
        type: 'sms',
        request,
      }
    );

    logger.info({
      smsId,
      scheduledFor: request.scheduledFor,
      to: request.to,
    }, 'SMS scheduled');
  }

  async getMessageStatus(messageSid: string): Promise<any> {
    try {
      const client = this.ensureClient();
      const message = await client.messages(messageSid).fetch();

      return {
        sid: message.sid,
        status: message.status,
        to: message.to,
        from: message.from,
        dateCreated: message.dateCreated,
        dateUpdated: message.dateUpdated,
        price: message.price,
        priceUnit: message.priceUnit,
        errorCode: message.errorCode,
        errorMessage: message.errorMessage,
      };
    } catch (error) {
      logger.error({ messageSid, error }, 'Failed to get message status');
      throw error;
    }
  }

  async handleStatusCallback(data: any): Promise<void> {
    try {
      const { MessageSid, To, MessageStatus, ErrorCode, ErrorMessage } = data;

      // Update delivery status
      await NotificationRedisService.trackDelivery(MessageSid, 'sms', MessageStatus, {
        to: To,
        errorCode: ErrorCode,
        errorMessage: ErrorMessage,
        updatedAt: new Date().toISOString(),
      });

      // Track metrics based on status
      if (MessageStatus === 'delivered') {
        await NotificationRedisService.trackNotificationMetric('delivered', 'sms');
      } else if (MessageStatus === 'failed' || MessageStatus === 'undelivered') {
        await NotificationRedisService.trackNotificationMetric('failed_delivery', 'sms');
      }

      logger.info({
        messageSid: MessageSid,
        status: MessageStatus,
        to: To,
      }, 'SMS status update received');
    } catch (error) {
      logger.error({ error, data }, 'Failed to handle SMS status callback');
    }
  }

  async validatePhoneNumber(phoneNumber: string): Promise<{
    valid: boolean;
    normalized?: string;
    carrier?: string;
    type?: string;
  }> {
    try {
      const client = this.ensureClient();
      const normalized = this.normalizePhoneNumber(phoneNumber);
      
      const lookup = await client.lookups.v2
        .phoneNumbers(normalized)
        .fetch({ fields: 'line_type_intelligence' });

      return {
        valid: lookup.valid || false,
        normalized: lookup.phoneNumber,
        carrier: lookup.lineTypeIntelligence?.carrier_name,
        type: lookup.lineTypeIntelligence?.type,
      };
    } catch (error) {
      logger.error({ phoneNumber, error }, 'Phone number validation failed');
      return { valid: false };
    }
  }

  isEnabled(): boolean {
    return smsConfig.enabled;
  }

  async getUsageStats(days: number = 30): Promise<any> {
    try {
      const client = this.ensureClient();
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const usage = await client.usage.records.list({
        category: 'sms',
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      });

      return usage.map(record => ({
        date: record.startDate,
        count: record.count,
        price: record.price,
        priceUnit: record.priceUnit,
      }));
    } catch (error) {
      logger.error({ error }, 'Failed to get SMS usage stats');
      return [];
    }
  }
}