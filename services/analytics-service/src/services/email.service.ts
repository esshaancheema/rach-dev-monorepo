import { logger } from '../utils/logger';

export interface EmailConfig {
  to: string | string[];
  from?: string;
  subject: string;
  body: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: Buffer;
    contentType?: string;
  }>;
}

export class EmailService {
  private apiKey: string;
  private fromEmail: string;

  constructor(apiKey?: string, fromEmail?: string) {
    this.apiKey = apiKey || process.env.EMAIL_SERVICE_API_KEY || '';
    this.fromEmail = fromEmail || process.env.FROM_EMAIL || 'noreply@zoptal.com';
  }

  public async sendEmail(config: EmailConfig): Promise<void> {
    try {
      // In a real implementation, this would integrate with an email service like:
      // - SendGrid
      // - AWS SES
      // - Mailgun
      // - Postmark
      
      logger.info('Sending email', {
        to: config.to,
        subject: config.subject,
        hasAttachments: config.attachments && config.attachments.length > 0,
      });

      // Simulate email sending
      await this.simulateEmailSending(config);

      logger.info('Email sent successfully', {
        to: config.to,
        subject: config.subject,
      });

    } catch (error) {
      logger.error('Failed to send email', {
        to: config.to,
        subject: config.subject,
        error: error.message,
      });
      throw error;
    }
  }

  public async sendBulkEmail(emails: EmailConfig[]): Promise<void> {
    const results = await Promise.allSettled(
      emails.map(email => this.sendEmail(email))
    );

    const failed = results.filter(result => result.status === 'rejected');
    if (failed.length > 0) {
      logger.warn(`${failed.length} out of ${emails.length} emails failed to send`);
    }

    logger.info(`Bulk email completed: ${emails.length - failed.length} sent, ${failed.length} failed`);
  }

  private async simulateEmailSending(config: EmailConfig): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Simulate occasional failures for testing
    if (Math.random() < 0.05) { // 5% failure rate
      throw new Error('Simulated email service failure');
    }

    logger.debug('Email simulation completed', {
      to: Array.isArray(config.to) ? config.to.join(', ') : config.to,
      subject: config.subject,
    });
  }
}