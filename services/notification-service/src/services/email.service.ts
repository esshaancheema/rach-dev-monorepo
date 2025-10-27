import sgMail from '@sendgrid/mail';
import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';
import { emailConfig, templateConfig, complianceConfig } from '../config';
import { logger } from '../utils/logger';
import { NotificationRedisService } from '../utils/redis';
import { nanoid } from 'nanoid';

export interface EmailRequest {
  to: string | string[];
  subject: string;
  templateId?: string;
  html?: string;
  text?: string;
  from?: {
    email: string;
    name?: string;
  };
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
  templateData?: Record<string, any>;
  locale?: string;
  userId?: string;
  metadata?: Record<string, any>;
  scheduledFor?: Date;
  priority?: 'high' | 'normal' | 'low';
}

export interface EmailResponse {
  id: string;
  status: 'sent' | 'scheduled' | 'failed';
  provider: 'sendgrid' | 'smtp';
  messageId?: string;
  error?: string;
  sentAt?: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private compiledTemplates: Map<string, handlebars.TemplateDelegate> = new Map();

  constructor() {
    // Initialize SendGrid
    if (emailConfig.sendgrid.enabled) {
      sgMail.setApiKey(emailConfig.sendgrid.apiKey!);
      logger.info('SendGrid email service initialized');
    }

    // Initialize SMTP
    if (emailConfig.smtp.enabled) {
      this.transporter = nodemailer.createTransport({
        host: emailConfig.smtp.host,
        port: emailConfig.smtp.port,
        secure: emailConfig.smtp.secure,
        auth: emailConfig.smtp.auth,
      });
      logger.info('SMTP email service initialized');
    }

    // Register Handlebars helpers
    this.registerHandlebarsHelpers();
  }

  async sendEmail(request: EmailRequest): Promise<EmailResponse> {
    const emailId = `email_${nanoid()}`;
    const startTime = Date.now();

    try {
      // Check user rate limits if userId provided
      if (request.userId) {
        const rateLimit = await NotificationRedisService.checkUserRateLimit(
          request.userId,
          'email',
          emailConfig.rateLimitPerUser
        );

        if (!rateLimit.allowed) {
          throw new Error(`Email rate limit exceeded. Reset at ${new Date(rateLimit.resetTime).toISOString()}`);
        }
      }

      // Handle scheduled emails
      if (request.scheduledFor && request.scheduledFor > new Date()) {
        await this.scheduleEmail(emailId, request);
        return {
          id: emailId,
          status: 'scheduled',
          provider: this.getActiveProvider(),
        };
      }

      // Prepare email content
      const emailContent = await this.prepareEmailContent(request);

      // Add compliance headers and footer
      const compliantContent = this.addComplianceContent(emailContent, request);

      // Send email using active provider
      const response = emailConfig.sendgrid.enabled
        ? await this.sendViaSendGrid(compliantContent, request)
        : await this.sendViaSMTP(compliantContent, request);

      // Track delivery
      await NotificationRedisService.trackDelivery(emailId, 'email', 'sent', {
        provider: response.provider,
        messageId: response.messageId,
      });

      // Add to history if userId provided
      if (request.userId) {
        await NotificationRedisService.addToHistory(request.userId, {
          id: emailId,
          type: 'email',
          subject: request.subject,
          to: Array.isArray(request.to) ? request.to : [request.to],
          sentAt: new Date().toISOString(),
          templateId: request.templateId,
        });
      }

      // Track metrics
      await NotificationRedisService.trackNotificationMetric('sent', 'email');

      const responseTime = Date.now() - startTime;
      logger.info({
        emailId,
        to: request.to,
        subject: request.subject,
        provider: response.provider,
        responseTime,
      }, 'Email sent successfully');

      return {
        id: emailId,
        status: 'sent',
        ...response,
        sentAt: new Date().toISOString(),
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      // Track failed delivery
      await NotificationRedisService.trackDelivery(emailId, 'email', 'failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      // Track metrics
      await NotificationRedisService.trackNotificationMetric('failed', 'email');

      logger.error({
        emailId,
        to: request.to,
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime,
      }, 'Failed to send email');

      return {
        id: emailId,
        status: 'failed',
        provider: this.getActiveProvider(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async sendViaSendGrid(
    content: { html: string; text: string },
    request: EmailRequest
  ): Promise<{ provider: 'sendgrid'; messageId?: string }> {
    const msg = {
      to: request.to,
      from: request.from || emailConfig.defaults.from,
      subject: request.subject,
      html: content.html,
      text: content.text,
      replyTo: request.replyTo || emailConfig.defaults.replyTo,
      cc: request.cc,
      bcc: request.bcc,
      attachments: request.attachments?.map(att => ({
        content: typeof att.content === 'string' ? att.content : att.content.toString('base64'),
        filename: att.filename,
        type: att.contentType,
        disposition: 'attachment',
      })),
      customArgs: request.metadata,
      priority: request.priority,
    };

    const [response] = await sgMail.send(msg);
    
    return {
      provider: 'sendgrid',
      messageId: response.headers['x-message-id'],
    };
  }

  private async sendViaSMTP(
    content: { html: string; text: string },
    request: EmailRequest
  ): Promise<{ provider: 'smtp'; messageId?: string }> {
    if (!this.transporter) {
      throw new Error('SMTP transporter not configured');
    }

    const from = request.from 
      ? `"${request.from.name || request.from.email}" <${request.from.email}>`
      : `"${emailConfig.defaults.from.name}" <${emailConfig.defaults.from.email}>`;

    const mailOptions = {
      from,
      to: Array.isArray(request.to) ? request.to.join(', ') : request.to,
      subject: request.subject,
      html: content.html,
      text: content.text,
      replyTo: request.replyTo || emailConfig.defaults.replyTo,
      cc: request.cc,
      bcc: request.bcc,
      attachments: request.attachments?.map(att => ({
        filename: att.filename,
        content: att.content,
        contentType: att.contentType,
      })),
      priority: request.priority,
      headers: request.metadata,
    };

    const info = await this.transporter.sendMail(mailOptions);
    
    return {
      provider: 'smtp',
      messageId: info.messageId,
    };
  }

  private async prepareEmailContent(
    request: EmailRequest
  ): Promise<{ html: string; text: string }> {
    let html = request.html || '';
    let text = request.text || '';

    // If template is specified, compile and render it
    if (request.templateId) {
      const locale = request.locale || templateConfig.defaultLocale;
      const template = await this.loadTemplate(request.templateId, locale);
      
      if (template) {
        const data = {
          ...request.templateData,
          currentYear: new Date().getFullYear(),
          companyName: emailConfig.defaults.from.name,
        };

        html = template(data);
        
        // Generate text version from HTML if not provided
        if (!text) {
          text = this.htmlToText(html);
        }
      }
    }

    return { html, text };
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
        'email',
        `${templateId}.hbs`
      );
      
      const templateContent = await fs.readFile(templatePath, 'utf-8');
      const compiled = handlebars.compile(templateContent);
      
      // Cache compiled template
      this.compiledTemplates.set(cacheKey, compiled);
      await NotificationRedisService.cacheTemplate(templateId, locale, templateContent);
      
      return compiled;
    } catch (error) {
      logger.error({ templateId, locale, error }, 'Failed to load email template');
      
      // Try default locale
      if (locale !== templateConfig.defaultLocale) {
        return this.loadTemplate(templateId, templateConfig.defaultLocale);
      }
      
      return null;
    }
  }

  private addComplianceContent(
    content: { html: string; text: string },
    request: EmailRequest
  ): { html: string; text: string } {
    const unsubscribeToken = request.userId ? nanoid() : null;
    const unsubscribeUrl = unsubscribeToken 
      ? `https://app.zoptal.com/unsubscribe?token=${unsubscribeToken}`
      : 'https://app.zoptal.com/preferences';

    // Store unsubscribe token if user-specific
    if (unsubscribeToken && request.userId) {
      NotificationRedisService.setUnsubscribeToken(
        unsubscribeToken,
        request.userId,
        'email'
      );
    }

    // Add CAN-SPAM compliant footer
    const complianceFooter = {
      html: `
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666;">
          <p>This email was sent to ${Array.isArray(request.to) ? request.to[0] : request.to}</p>
          <p>${emailConfig.defaults.from.name} | ${complianceConfig.gdpr ? 'GDPR Compliant | ' : ''}CAN-SPAM Compliant</p>
          <p><a href="${unsubscribeUrl}">Unsubscribe</a> | <a href="https://app.zoptal.com/preferences">Email Preferences</a></p>
        </div>
      `,
      text: `\n\n---\nThis email was sent to ${Array.isArray(request.to) ? request.to[0] : request.to}\n${emailConfig.defaults.from.name}\nUnsubscribe: ${unsubscribeUrl}\nEmail Preferences: https://app.zoptal.com/preferences`,
    };

    return {
      html: content.html + complianceFooter.html,
      text: content.text + complianceFooter.text,
    };
  }

  private async scheduleEmail(emailId: string, request: EmailRequest): Promise<void> {
    await NotificationRedisService.scheduleNotification(
      emailId,
      request.scheduledFor!,
      {
        type: 'email',
        request,
      }
    );

    logger.info({
      emailId,
      scheduledFor: request.scheduledFor,
      to: request.to,
    }, 'Email scheduled');
  }

  private htmlToText(html: string): string {
    // Simple HTML to text conversion
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<\/div>/gi, '\n')
      .replace(/<\/h[1-6]>/gi, '\n\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .trim();
  }

  private registerHandlebarsHelpers(): void {
    handlebars.registerHelper('eq', (a, b) => a === b);
    handlebars.registerHelper('ne', (a, b) => a !== b);
    handlebars.registerHelper('lt', (a, b) => a < b);
    handlebars.registerHelper('gt', (a, b) => a > b);
    handlebars.registerHelper('lte', (a, b) => a <= b);
    handlebars.registerHelper('gte', (a, b) => a >= b);
    handlebars.registerHelper('and', (a, b) => a && b);
    handlebars.registerHelper('or', (a, b) => a || b);
    handlebars.registerHelper('formatDate', (date, format) => {
      return new Date(date).toLocaleDateString();
    });
    handlebars.registerHelper('formatCurrency', (amount, currency = 'USD') => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
      }).format(amount);
    });
  }

  private getActiveProvider(): 'sendgrid' | 'smtp' {
    return emailConfig.sendgrid.enabled ? 'sendgrid' : 'smtp';
  }

  async verifyConnection(): Promise<boolean> {
    try {
      if (emailConfig.smtp.enabled && this.transporter) {
        await this.transporter.verify();
        return true;
      }
      return emailConfig.sendgrid.enabled;
    } catch (error) {
      logger.error({ error }, 'Email service connection verification failed');
      return false;
    }
  }
}