import sgMail from '@sendgrid/mail';
import { logger } from '../utils/logger';
import { config } from '../config';
import { cacheManager } from '../utils/redis';
import { getCircuitBreaker, CircuitBreaker } from '../middleware/circuit-breaker.middleware';
import { gracefulDegradationService } from './graceful-degradation.service';
import { createServiceError } from '../middleware/error-handler';

export interface EmailVerificationData {
  to: string;
  name: string;
  verificationUrl: string;
}

export interface PasswordResetData {
  to: string;
  name: string;
  resetUrl: string;
  expiresInMinutes: number;
}

export interface WelcomeEmailData {
  to: string;
  name: string;
  loginUrl: string;
}

export interface SecurityAlertData {
  to: string;
  name: string;
  event: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  retryAfter?: number;
  fallbackUsed?: boolean;
}

export class EnhancedEmailService {
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY_MS = 1000;
  private readonly RATE_LIMIT_CACHE_KEY = 'email_rate_limit:';
  private readonly FAILED_EMAILS_KEY = 'failed_emails:';
  private readonly QUEUE_KEY = 'email_queue:';
  private circuitBreaker: CircuitBreaker;
  private isInitialized: boolean = false;

  constructor() {
    // Get or create circuit breaker for email service
    this.circuitBreaker = getCircuitBreaker('email', {
      failureThreshold: 5,
      recoveryTimeout: 60000, // 1 minute
      monitoringPeriod: 30000, // 30 seconds
      halfOpenMaxCalls: 3
    });

    // Initialize SendGrid with error handling
    try {
      if (!config.SENDGRID_API_KEY) {
        logger.warn('SendGrid API key not configured - email service will be in degraded mode');
        this.isInitialized = false;
        return;
      }
      sgMail.setApiKey(config.SENDGRID_API_KEY);
      this.isInitialized = true;
      logger.info('SendGrid email service initialized with circuit breaker');
    } catch (error) {
      logger.error('Failed to initialize SendGrid:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Send email verification with circuit breaker protection
   */
  async sendEmailVerification(data: EmailVerificationData): Promise<EmailSendResult> {
    const { to, name, verificationUrl } = data;

    const msg = {
      to,
      from: {
        email: config.EMAIL_FROM,
        name: 'Zoptal Security',
      },
      subject: 'Verify Your Email Address',
      html: this.generateEmailVerificationTemplate(name, verificationUrl),
      text: `Hi ${name},\n\nWelcome to Zoptal! Please verify your email address by clicking the link below:\n\n${verificationUrl}\n\nThis link will expire in 24 hours for security reasons.\n\nIf you didn't create this account, please ignore this email.\n\nBest regards,\nThe Zoptal Team`,
    };

    return this.sendEmailWithCircuitBreaker(msg, 'email_verification', { to, name });
  }

  /**
   * Send password reset email with circuit breaker protection
   */
  async sendPasswordReset(data: PasswordResetData): Promise<EmailSendResult> {
    const { to, name, resetUrl, expiresInMinutes } = data;

    const msg = {
      to,
      from: {
        email: config.EMAIL_FROM,
        name: 'Zoptal Security',
      },
      subject: 'Password Reset Request',
      html: this.generatePasswordResetTemplate(name, resetUrl, expiresInMinutes),
      text: `Hi ${name},\n\nWe received a request to reset your password. Click the link below to create a new password:\n\n${resetUrl}\n\nThis link will expire in ${expiresInMinutes} minutes for security reasons.\n\nIf you didn't request this reset, please ignore this email and your password will remain unchanged.\n\nBest regards,\nThe Zoptal Team`,
    };

    return this.sendEmailWithCircuitBreaker(msg, 'password_reset', { to, name });
  }

  /**
   * Send welcome email with circuit breaker protection
   */
  async sendWelcomeEmail(data: WelcomeEmailData): Promise<EmailSendResult> {
    const { to, name, loginUrl } = data;

    const msg = {
      to,
      from: {
        email: config.EMAIL_FROM,
        name: 'Zoptal Team',
      },
      subject: 'Welcome to Zoptal!',
      html: this.generateWelcomeTemplate(name, loginUrl),
      text: `Hi ${name},\n\nWelcome to Zoptal! We're excited to have you on board.\n\nYou can log in to your account here: ${loginUrl}\n\nIf you have any questions, feel free to reach out to our support team.\n\nBest regards,\nThe Zoptal Team`,
    };

    return this.sendEmailWithCircuitBreaker(msg, 'welcome_email', { to, name });
  }

  /**
   * Send security alert with circuit breaker protection
   */
  async sendSecurityAlert(data: SecurityAlertData): Promise<EmailSendResult> {
    const { to, name, event, timestamp, ipAddress, userAgent } = data;

    const msg = {
      to,
      from: {
        email: config.EMAIL_FROM,
        name: 'Zoptal Security',
      },
      subject: `Security Alert: ${event}`,
      html: this.generateSecurityAlertTemplate(name, event, timestamp, ipAddress, userAgent),
      text: `Hi ${name},\n\nWe detected the following security event on your account:\n\nEvent: ${event}\nTime: ${timestamp}\nIP Address: ${ipAddress}\nDevice: ${userAgent}\n\nIf this was you, no action is needed. If you don't recognize this activity, please secure your account immediately.\n\nBest regards,\nThe Zoptal Security Team`,
    };

    return this.sendEmailWithCircuitBreaker(msg, 'security_alert', { to, name, event });
  }

  /**
   * Send email with circuit breaker and comprehensive error handling
   */
  private async sendEmailWithCircuitBreaker(
    message: any,
    emailType: string,
    metadata: Record<string, any>
  ): Promise<EmailSendResult> {
    const recipient = message.to;

    // Check if service is in degraded mode
    if (gracefulDegradationService.isServiceDegraded('email')) {
      logger.warn('Email service is in degraded mode, queueing email');
      await this.queueEmail(message, emailType, metadata);
      return {
        success: false,
        error: 'SERVICE_DEGRADED',
        fallbackUsed: true
      };
    }

    // Check rate limiting
    const rateLimitResult = await this.checkRateLimit(recipient);
    if (!rateLimitResult.allowed) {
      logger.warn('Email rate limit exceeded:', {
        recipient,
        retryAfter: rateLimitResult.retryAfter
      });
      return {
        success: false,
        error: 'RATE_LIMIT_EXCEEDED',
        retryAfter: rateLimitResult.retryAfter
      };
    }

    // Execute with circuit breaker
    try {
      const result = await this.circuitBreaker.execute(
        async () => {
          return await this.sendEmailWithRetry(message, emailType, metadata);
        },
        async () => {
          // Fallback: Queue the email for later processing
          await this.queueEmail(message, emailType, metadata);
          logger.info('Email queued due to circuit breaker open state', {
            emailType,
            recipient: this.maskEmail(recipient)
          });
          return {
            success: false,
            error: 'CIRCUIT_BREAKER_OPEN',
            fallbackUsed: true
          };
        }
      );

      return result;
    } catch (error: any) {
      logger.error('Email send failed with circuit breaker:', {
        error: error.message,
        emailType,
        recipient: this.maskEmail(recipient)
      });

      // Queue for retry later
      await this.queueEmail(message, emailType, metadata);

      return {
        success: false,
        error: error.message || 'EMAIL_SEND_FAILED',
        fallbackUsed: true
      };
    }
  }

  /**
   * Send email with retry logic
   */
  private async sendEmailWithRetry(
    message: any,
    emailType: string,
    metadata: Record<string, any>
  ): Promise<EmailSendResult> {
    const recipient = message.to;

    // Check if service is available
    if (!this.isInitialized || !config.SENDGRID_API_KEY) {
      throw new Error('EMAIL_SERVICE_UNAVAILABLE');
    }

    let lastError: any;

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        const result = await sgMail.send(message);

        // Extract message ID from SendGrid response
        const messageId = result[0]?.headers?.['x-message-id'] || 'unknown';

        // Update rate limiting
        await this.updateRateLimit(recipient);

        logger.info('Email sent successfully:', {
          recipient: this.maskEmail(recipient),
          emailType,
          messageId,
          attempt,
        });

        return {
          success: true,
          messageId,
        };

      } catch (error: any) {
        lastError = error;

        const errorInfo = this.parseEmailError(error);

        logger.warn('Email send attempt failed:', {
          recipient: this.maskEmail(recipient),
          emailType,
          attempt,
          error: errorInfo.type,
          statusCode: errorInfo.statusCode,
          message: errorInfo.message,
        });

        // Don't retry for permanent failures
        if (errorInfo.isPermanent) {
          throw new Error(errorInfo.type);
        }

        // Wait before retry (exponential backoff)
        if (attempt < this.MAX_RETRIES) {
          const delay = this.RETRY_DELAY_MS * Math.pow(2, attempt - 1);
          await this.sleep(delay);
        }
      }
    }

    // All retries exhausted
    const errorInfo = this.parseEmailError(lastError);
    throw new Error(errorInfo.type);
  }

  /**
   * Queue email for later processing
   */
  private async queueEmail(
    message: any,
    emailType: string,
    metadata: Record<string, any>
  ): Promise<void> {
    const queueItem = {
      message,
      emailType,
      metadata,
      timestamp: new Date().toISOString(),
      retryCount: 0
    };

    await cacheManager.rpush(
      this.QUEUE_KEY,
      JSON.stringify(queueItem)
    );

    logger.info('Email queued for later processing', {
      emailType,
      recipient: this.maskEmail(message.to)
    });
  }

  /**
   * Process queued emails (called by a background job)
   */
  async processQueuedEmails(): Promise<void> {
    if (!this.circuitBreaker.isAvailable()) {
      logger.info('Circuit breaker is not available, skipping queue processing');
      return;
    }

    const queueLength = await cacheManager.llen(this.QUEUE_KEY);
    if (queueLength === 0) {
      return;
    }

    logger.info(`Processing ${queueLength} queued emails`);

    for (let i = 0; i < Math.min(queueLength, 10); i++) {
      const item = await cacheManager.lpop(this.QUEUE_KEY);
      if (!item) break;

      try {
        const queueItem = JSON.parse(item);
        const result = await this.sendEmailWithCircuitBreaker(
          queueItem.message,
          queueItem.emailType,
          queueItem.metadata
        );

        if (!result.success && result.error !== 'CIRCUIT_BREAKER_OPEN') {
          // Re-queue if it failed for other reasons
          queueItem.retryCount++;
          if (queueItem.retryCount < 5) {
            await cacheManager.rpush(
              this.QUEUE_KEY,
              JSON.stringify(queueItem)
            );
          }
        }
      } catch (error) {
        logger.error('Failed to process queued email:', error);
      }
    }
  }

  /**
   * Parse email service errors
   */
  private parseEmailError(error: any): {
    type: string;
    statusCode?: number;
    message: string;
    isPermanent: boolean;
  } {
    const statusCode = error?.code || error?.response?.status;
    const message = error?.message || error?.response?.body?.errors?.[0]?.message || 'Unknown error';

    // Categorize errors
    switch (statusCode) {
      case 400:
        return {
          type: 'INVALID_EMAIL_DATA',
          statusCode,
          message,
          isPermanent: true,
        };
      case 401:
        return {
          type: 'EMAIL_AUTH_FAILED',
          statusCode,
          message,
          isPermanent: true,
        };
      case 403:
        return {
          type: 'EMAIL_PERMISSION_DENIED',
          statusCode,
          message,
          isPermanent: true,
        };
      case 413:
        return {
          type: 'EMAIL_TOO_LARGE',
          statusCode,
          message,
          isPermanent: true,
        };
      case 429:
        return {
          type: 'EMAIL_RATE_LIMITED',
          statusCode,
          message,
          isPermanent: false,
        };
      case 500:
      case 502:
      case 503:
      case 504:
        return {
          type: 'EMAIL_SERVICE_ERROR',
          statusCode,
          message,
          isPermanent: false,
        };
      default:
        return {
          type: 'EMAIL_UNKNOWN_ERROR',
          statusCode,
          message,
          isPermanent: false,
        };
    }
  }

  /**
   * Check rate limiting
   */
  private async checkRateLimit(recipient: string): Promise<{ allowed: boolean; retryAfter?: number }> {
    const key = `${this.RATE_LIMIT_CACHE_KEY}${recipient}`;
    const count = await cacheManager.get(key);

    if (count && parseInt(count) >= 5) {
      const ttl = await cacheManager.ttl(key);
      return { allowed: false, retryAfter: ttl };
    }

    return { allowed: true };
  }

  /**
   * Update rate limiting
   */
  private async updateRateLimit(recipient: string): Promise<void> {
    const key = `${this.RATE_LIMIT_CACHE_KEY}${recipient}`;
    const count = await cacheManager.get(key);

    if (count) {
      await cacheManager.incr(key);
    } else {
      await cacheManager.setex(key, 3600, 1); // 1 hour expiry
    }
  }

  /**
   * Mask email for logging
   */
  private maskEmail(email: string): string {
    const [localPart, domain] = email.split('@');
    const maskedLocal = localPart.substring(0, 2) + '***';
    return `${maskedLocal}@${domain}`;
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate email templates
   */
  private generateEmailVerificationTemplate(name: string, verificationUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Verify Your Email</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563eb;">Welcome to Zoptal!</h2>
            <p>Hi ${name},</p>
            <p>Thank you for signing up! Please verify your email address to activate your account.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
            </div>
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; color: #2563eb;">${verificationUrl}</p>
            <p>This link will expire in 24 hours for security reasons.</p>
            <p>If you didn't create this account, please ignore this email.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #666;">
              Best regards,<br>
              The Zoptal Team
            </p>
          </div>
        </body>
      </html>
    `;
  }

  private generatePasswordResetTemplate(name: string, resetUrl: string, expiresInMinutes: number): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Password Reset Request</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563eb;">Password Reset Request</h2>
            <p>Hi ${name},</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
            </div>
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; color: #2563eb;">${resetUrl}</p>
            <p>This link will expire in ${expiresInMinutes} minutes for security reasons.</p>
            <p>If you didn't request this reset, please ignore this email and your password will remain unchanged.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #666;">
              Best regards,<br>
              The Zoptal Security Team
            </p>
          </div>
        </body>
      </html>
    `;
  }

  private generateWelcomeTemplate(name: string, loginUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Welcome to Zoptal!</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563eb;">Welcome to Zoptal!</h2>
            <p>Hi ${name},</p>
            <p>We're excited to have you on board! Your account has been successfully created and verified.</p>
            <p>You can now access all of Zoptal's features and services.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${loginUrl}" style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Go to Dashboard</a>
            </div>
            <h3 style="color: #2563eb;">Getting Started</h3>
            <ul>
              <li>Complete your profile to get personalized recommendations</li>
              <li>Explore our documentation and tutorials</li>
              <li>Join our community forum to connect with other users</li>
            </ul>
            <p>If you have any questions, our support team is here to help!</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #666;">
              Best regards,<br>
              The Zoptal Team
            </p>
          </div>
        </body>
      </html>
    `;
  }

  private generateSecurityAlertTemplate(
    name: string,
    event: string,
    timestamp: string,
    ipAddress: string,
    userAgent: string
  ): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Security Alert</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #dc2626;">Security Alert</h2>
            <p>Hi ${name},</p>
            <p>We detected the following security event on your account:</p>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Event:</strong> ${event}</p>
              <p><strong>Time:</strong> ${timestamp}</p>
              <p><strong>IP Address:</strong> ${ipAddress}</p>
              <p><strong>Device:</strong> ${userAgent}</p>
            </div>
            <p>If this was you, no action is needed. If you don't recognize this activity, please take the following steps immediately:</p>
            <ol>
              <li>Change your password</li>
              <li>Review your recent account activity</li>
              <li>Enable two-factor authentication if you haven't already</li>
              <li>Contact our support team if you need assistance</li>
            </ol>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${config.FRONTEND_URL}/security" style="background-color: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Review Account Security</a>
            </div>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #666;">
              Best regards,<br>
              The Zoptal Security Team
            </p>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Get circuit breaker status
   */
  getCircuitBreakerStatus() {
    return this.circuitBreaker.getState();
  }

  /**
   * Check if email service is available
   */
  isServiceAvailable(): boolean {
    return this.isInitialized && this.circuitBreaker.isAvailable();
  }
}

// Export singleton instance
export const enhancedEmailService = new EnhancedEmailService();