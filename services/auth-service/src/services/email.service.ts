import sgMail from '@sendgrid/mail';
import { logger } from '../utils/logger';
import { config } from '../config';
import { cacheManager } from '../utils/redis';
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

export interface OTPEmailData {
  to: string;
  name: string;
  code: string;
  type: 'login' | 'registration' | 'verification' | 'phone_change' | 'email_change';
  expiresInMinutes: number;
  ipAddress?: string;
  device?: string;
}

export interface LoginLinkEmailData {
  to: string;
  name: string;
  loginUrl: string;
  expiresInMinutes: number;
  ipAddress?: string;
  device?: string;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  retryAfter?: number;
}

export class EmailService {
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY_MS = 1000;
  private readonly RATE_LIMIT_CACHE_KEY = 'email_rate_limit:';
  private readonly FAILED_EMAILS_KEY = 'failed_emails:';

  constructor() {
    // Initialize SendGrid with error handling
    try {
      if (!config.SENDGRID_API_KEY) {
        logger.warn('SendGrid API key not configured - email service will be disabled');
        return;
      }
      sgMail.setApiKey(config.SENDGRID_API_KEY);
      logger.info('SendGrid email service initialized');
    } catch (error) {
      logger.error('Failed to initialize SendGrid:', error);
      throw new Error('EMAIL_SERVICE_INIT_FAILED');
    }
  }

  /**
   * Send email verification
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
      text: `Hi ${name},

Welcome to Zoptal! Please verify your email address by clicking the link below:

${verificationUrl}

This link will expire in 24 hours for security reasons.

If you didn't create this account, please ignore this email.

Best regards,
The Zoptal Team`,
    };

    return this.sendEmailWithRetry(msg, 'email_verification', { to, name });
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(data: PasswordResetData): Promise<void> {
    const { to, name, resetUrl, expiresInMinutes } = data;

    const msg = {
      to,
      from: {
        email: config.EMAIL_FROM,
        name: 'Zoptal Security',
      },
      subject: 'Reset Your Password',
      html: this.generatePasswordResetTemplate(name, resetUrl, expiresInMinutes),
      text: `Hi ${name},

You requested to reset your password for your Zoptal account.

Click the link below to reset your password:
${resetUrl}

This link will expire in ${expiresInMinutes} minutes for security reasons.

If you didn't request this password reset, please ignore this email and your password will remain unchanged.

Best regards,
The Zoptal Team`,
    };

    try {
      await sgMail.send(msg);
      logger.info('Password reset email sent successfully:', { to });
    } catch (error) {
      logger.error('Failed to send password reset email:', error);
      throw new Error('EMAIL_SEND_FAILED');
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(data: WelcomeEmailData): Promise<void> {
    const { to, name, loginUrl } = data;

    const msg = {
      to,
      from: {
        email: config.EMAIL_FROM,
        name: 'Zoptal Team',
      },
      subject: 'Welcome to Zoptal!',
      html: this.generateWelcomeTemplate(name, loginUrl),
      text: `Hi ${name},

Welcome to Zoptal! Your account has been successfully verified and is ready to use.

You can now log in to your account:
${loginUrl}

We're excited to have you on board and look forward to helping you achieve your goals.

If you have any questions, feel free to reach out to our support team.

Best regards,
The Zoptal Team`,
    };

    try {
      await sgMail.send(msg);
      logger.info('Welcome email sent successfully:', { to });
    } catch (error) {
      logger.error('Failed to send welcome email:', error);
      throw new Error('EMAIL_SEND_FAILED');
    }
  }

  /**
   * Send OTP code via email for passwordless authentication
   */
  async sendOTPCode(data: OTPEmailData): Promise<EmailSendResult> {
    const { to, name, code, type, expiresInMinutes, ipAddress, device } = data;

    const typeLabels = {
      login: 'Login',
      registration: 'Account Registration',
      verification: 'Account Verification',
      phone_change: 'Phone Number Change',
      email_change: 'Email Address Change',
    };

    const subject = `Your Zoptal ${typeLabels[type]} Code`;
    
    const msg = {
      to,
      from: {
        email: config.EMAIL_FROM,
        name: 'Zoptal Security',
      },
      subject,
      html: this.generateOTPEmailTemplate(name, code, type, expiresInMinutes, ipAddress, device),
      text: `Hi ${name},

Your Zoptal ${typeLabels[type].toLowerCase()} verification code is: ${code}

This code will expire in ${expiresInMinutes} minutes for security reasons.

${ipAddress ? `Requested from: ${ipAddress}` : ''}
${device ? `Device: ${device}` : ''}

If you didn't request this code, please ignore this email and contact our support team if you have concerns.

Best regards,
The Zoptal Security Team`,
    };

    return this.sendEmailWithRetry(msg, `otp_${type}`, { to, name, type });
  }

  /**
   * Send magic login link via email
   */
  async sendLoginLink(data: LoginLinkEmailData): Promise<EmailSendResult> {
    const { to, name, loginUrl, expiresInMinutes, ipAddress, device } = data;

    const msg = {
      to,
      from: {
        email: config.EMAIL_FROM,
        name: 'Zoptal Security',
      },
      subject: 'Your Secure Login Link',
      html: this.generateLoginLinkTemplate(name, loginUrl, expiresInMinutes, ipAddress, device),
      text: `Hi ${name},

Click the link below to securely log in to your Zoptal account:

${loginUrl}

This link will expire in ${expiresInMinutes} minutes for security reasons.

${ipAddress ? `Requested from: ${ipAddress}` : ''}
${device ? `Device: ${device}` : ''}

If you didn't request this login link, please ignore this email and contact our support team.

Best regards,
The Zoptal Security Team`,
    };

    return this.sendEmailWithRetry(msg, 'login_link', { to, name });
  }

  /**
   * Send security alert email
   */
  async sendSecurityAlert(data: SecurityAlertData): Promise<void> {
    const { to, name, event, timestamp, ipAddress, userAgent } = data;

    const msg = {
      to,
      from: {
        email: config.EMAIL_FROM,
        name: 'Zoptal Security',
      },
      subject: 'Security Alert - Account Activity',
      html: this.generateSecurityAlertTemplate(name, event, timestamp, ipAddress, userAgent),
      text: `Hi ${name},

We detected important activity on your Zoptal account:

Event: ${event}
Time: ${timestamp}
IP Address: ${ipAddress}
Device: ${userAgent}

If this was you, no action is needed. If you don't recognize this activity, please secure your account immediately by changing your password and enabling two-factor authentication.

Contact our support team if you need assistance.

Best regards,
The Zoptal Security Team`,
    };

    return this.sendEmailWithRetry(msg, 'security_alert', { to, name, event });
  }

  /**
   * Send email with retry logic and comprehensive error handling
   */
  private async sendEmailWithRetry(
    message: any,
    emailType: string,
    metadata: Record<string, any>
  ): Promise<EmailSendResult> {
    const recipient = message.to;
    
    // Check if service is available
    if (!config.SENDGRID_API_KEY) {
      logger.warn('Email service unavailable - SendGrid not configured');
      await this.queueFailedEmail(message, emailType, 'SERVICE_UNAVAILABLE', metadata);
      return { 
        success: false, 
        error: 'EMAIL_SERVICE_UNAVAILABLE' 
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

    let lastError: any;
    
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        const result = await sgMail.send(message);
        
        // Extract message ID from SendGrid response
        const messageId = result[0]?.headers?.['x-message-id'] || 'unknown';
        
        // Update rate limiting
        await this.updateRateLimit(recipient);
        
        logger.info('Email sent successfully:', {
          recipient,
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
          recipient,
          emailType,
          attempt,
          error: errorInfo.type,
          statusCode: errorInfo.statusCode,
          message: errorInfo.message,
        });

        // Don't retry for permanent failures
        if (errorInfo.isPermanent) {
          await this.queueFailedEmail(message, emailType, errorInfo.type, metadata);
          return {
            success: false,
            error: errorInfo.type,
          };
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
    await this.queueFailedEmail(message, emailType, errorInfo.type, metadata);
    
    logger.error('Email send failed after all retries:', {
      recipient,
      emailType,
      attempts: this.MAX_RETRIES,
      lastError: errorInfo,
    });

    return {
      success: false,
      error: errorInfo.type,
    };
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
          type: 'EMAIL_SERVER_ERROR',
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
   * Check rate limiting for email sending
   */
  private async checkRateLimit(recipient: string): Promise<{
    allowed: boolean;
    retryAfter?: number;
  }> {
    const key = `${this.RATE_LIMIT_CACHE_KEY}${recipient}`;
    const current = await cacheManager.get(key);
    
    if (!current) {
      return { allowed: true };
    }

    const data = JSON.parse(current);
    const now = Date.now();
    
    // Allow 5 emails per hour per recipient
    if (data.count >= 5 && (now - data.firstSent) < 60 * 60 * 1000) {
      const retryAfter = Math.ceil((data.firstSent + 60 * 60 * 1000 - now) / 1000);
      return { allowed: false, retryAfter };
    }

    return { allowed: true };
  }

  /**
   * Update rate limiting counters
   */
  private async updateRateLimit(recipient: string): Promise<void> {
    const key = `${this.RATE_LIMIT_CACHE_KEY}${recipient}`;
    const current = await cacheManager.get(key);
    const now = Date.now();

    if (!current) {
      const data = { count: 1, firstSent: now };
      await cacheManager.setex(key, 60 * 60, JSON.stringify(data)); // 1 hour
    } else {
      const data = JSON.parse(current);
      
      // Reset if hour has passed
      if ((now - data.firstSent) >= 60 * 60 * 1000) {
        const newData = { count: 1, firstSent: now };
        await cacheManager.setex(key, 60 * 60, JSON.stringify(newData));
      } else {
        data.count++;
        const ttl = Math.ceil((data.firstSent + 60 * 60 * 1000 - now) / 1000);
        await cacheManager.setex(key, ttl, JSON.stringify(data));
      }
    }
  }

  /**
   * Queue failed email for later retry or manual investigation
   */
  private async queueFailedEmail(
    message: any,
    emailType: string,
    errorType: string,
    metadata: Record<string, any>
  ): Promise<void> {
    const failedEmail = {
      id: `failed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      recipient: message.to,
      subject: message.subject,
      emailType,
      errorType,
      timestamp: new Date().toISOString(),
      metadata,
      retryCount: 0,
      maxRetries: 3,
    };

    const key = `${this.FAILED_EMAILS_KEY}${failedEmail.id}`;
    await cacheManager.setex(key, 7 * 24 * 60 * 60, JSON.stringify(failedEmail)); // 7 days

    logger.info('Failed email queued:', {
      id: failedEmail.id,
      recipient: failedEmail.recipient,
      emailType,
      errorType,
    });
  }

  /**
   * Get health status of email service
   */
  async getHealthStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: Record<string, any>;
  }> {
    try {
      if (!config.SENDGRID_API_KEY) {
        return {
          status: 'unhealthy',
          details: {
            error: 'SendGrid API key not configured',
            configured: false,
          },
        };
      }

      const failedEmailsCount = await this.getFailedEmailsCount();
      
      if (failedEmailsCount > 100) {
        return {
          status: 'degraded',
          details: {
            configured: true,
            failedEmailsCount,
            warning: 'High number of failed emails detected',
          },
        };
      }

      return {
        status: 'healthy',
        details: {
          configured: true,
          failedEmailsCount,
        },
      };

    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: error.message,
          configured: !!config.SENDGRID_API_KEY,
        },
      };
    }
  }

  /**
   * Get count of failed emails in queue
   */
  private async getFailedEmailsCount(): Promise<number> {
    try {
      const keys = await cacheManager.keys(`${this.FAILED_EMAILS_KEY}*`);
      return keys.length;
    } catch (error) {
      logger.error('Failed to get failed emails count:', error);
      return 0;
    }
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate email verification HTML template
   */
  private generateEmailVerificationTemplate(name: string, verificationUrl: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #007bff; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px 20px; }
        .button { display: inline-block; background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
        .logo { font-size: 24px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">Zoptal</div>
        </div>
        <div class="content">
            <h2>Verify Your Email Address</h2>
            <p>Hi ${name},</p>
            <p>Welcome to Zoptal! Please verify your email address to complete your account setup and start using our platform.</p>
            <p>Click the button below to verify your email:</p>
            <p style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #007bff;">${verificationUrl}</p>
            <p><strong>This link will expire in 24 hours for security reasons.</strong></p>
            <p>If you didn't create this account, please ignore this email.</p>
            <p>Best regards,<br>The Zoptal Team</p>
        </div>
        <div class="footer">
            <p>© 2024 Zoptal. All rights reserved.</p>
            <p>This email was sent to ${name} regarding account verification.</p>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Generate password reset HTML template
   */
  private generatePasswordResetTemplate(name: string, resetUrl: string, expiresInMinutes: number): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc3545; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px 20px; }
        .button { display: inline-block; background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
        .logo { font-size: 24px; font-weight: bold; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">Zoptal</div>
        </div>
        <div class="content">
            <h2>Reset Your Password</h2>
            <p>Hi ${name},</p>
            <p>You requested to reset your password for your Zoptal account. Click the button below to set a new password:</p>
            <p style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #dc3545;">${resetUrl}</p>
            <div class="warning">
                <p><strong>Security Notice:</strong></p>
                <ul>
                    <li>This link will expire in ${expiresInMinutes} minutes</li>
                    <li>If you didn't request this reset, please ignore this email</li>
                    <li>Your password will remain unchanged if you don't click the link</li>
                </ul>
            </div>
            <p>Best regards,<br>The Zoptal Team</p>
        </div>
        <div class="footer">
            <p>© 2024 Zoptal. All rights reserved.</p>
            <p>This email was sent to ${name} regarding password reset.</p>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Generate welcome email HTML template
   */
  private generateWelcomeTemplate(name: string, loginUrl: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Zoptal!</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #28a745; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px 20px; }
        .button { display: inline-block; background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
        .logo { font-size: 24px; font-weight: bold; }
        .features { background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">Zoptal</div>
            <h1>Welcome!</h1>
        </div>
        <div class="content">
            <h2>Welcome to Zoptal, ${name}!</h2>
            <p>Your account has been successfully verified and is ready to use. We're excited to have you join our community!</p>
            <p style="text-align: center;">
                <a href="${loginUrl}" class="button">Login to Your Account</a>
            </p>
            <div class="features">
                <h3>What's Next?</h3>
                <ul>
                    <li>Complete your profile setup</li>
                    <li>Explore our features and tools</li>
                    <li>Connect with other users</li>
                    <li>Enable two-factor authentication for extra security</li>
                </ul>
            </div>
            <p>If you have any questions or need help getting started, don't hesitate to contact our support team.</p>
            <p>Best regards,<br>The Zoptal Team</p>
        </div>
        <div class="footer">
            <p>© 2024 Zoptal. All rights reserved.</p>
            <p>This email was sent to ${name} as a welcome message.</p>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Generate OTP email HTML template
   */
  private generateOTPEmailTemplate(
    name: string,
    code: string,
    type: 'login' | 'registration' | 'verification' | 'phone_change' | 'email_change',
    expiresInMinutes: number,
    ipAddress?: string,
    device?: string
  ): string {
    const typeLabels = {
      login: 'Login',
      registration: 'Account Registration',
      verification: 'Account Verification',
      phone_change: 'Phone Number Change',
      email_change: 'Email Address Change',
    };

    const typeColors = {
      login: '#007bff',
      registration: '#28a745',
      verification: '#17a2b8',
      phone_change: '#ffc107',
      email_change: '#fd7e14',
    };

    const typeColor = typeColors[type];
    const typeLabel = typeLabels[type];

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Zoptal ${typeLabel} Code</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: ${typeColor}; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px 20px; }
        .code-container { background: #f8f9fa; border: 2px solid ${typeColor}; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
        .verification-code { font-size: 32px; font-weight: bold; letter-spacing: 6px; color: ${typeColor}; font-family: 'Courier New', monospace; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
        .logo { font-size: 24px; font-weight: bold; }
        .security-info { background: #e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0; font-size: 14px; }
        .warning { color: #856404; background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🔐 Zoptal</div>
            <h1>${typeLabel} Code</h1>
        </div>
        <div class="content">
            <h2>Hi ${name}!</h2>
            <p>Your verification code for ${typeLabel.toLowerCase()} is:</p>
            
            <div class="code-container">
                <div class="verification-code">${code}</div>
                <p style="margin: 10px 0 0 0; color: #666;">Enter this code to continue</p>
            </div>

            <div class="warning">
                <p><strong>⚠️ Security Notice:</strong></p>
                <ul style="margin: 10px 0;">
                    <li>This code expires in <strong>${expiresInMinutes} minutes</strong></li>
                    <li>Never share this code with anyone</li>
                    <li>Zoptal will never ask for this code over phone or email</li>
                </ul>
            </div>

            ${ipAddress || device ? `
            <div class="security-info">
                <p><strong>Request Details:</strong></p>
                ${ipAddress ? `<p>📍 IP Address: ${ipAddress}</p>` : ''}
                ${device ? `<p>📱 Device: ${device}</p>` : ''}
            </div>
            ` : ''}

            <p>If you didn't request this code, please ignore this email and contact our support team if you have security concerns.</p>
            
            <p>Best regards,<br>The Zoptal Security Team</p>
        </div>
        <div class="footer">
            <p>© 2024 Zoptal. All rights reserved.</p>
            <p>This verification code was sent for ${typeLabel.toLowerCase()}.</p>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Generate login link email HTML template
   */
  private generateLoginLinkTemplate(
    name: string,
    loginUrl: string,
    expiresInMinutes: number,
    ipAddress?: string,
    device?: string
  ): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Secure Login Link</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #007bff; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px 20px; }
        .button { display: inline-block; background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
        .logo { font-size: 24px; font-weight: bold; }
        .security-info { background: #e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0; font-size: 14px; }
        .warning { color: #856404; background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🔐 Zoptal</div>
            <h1>Secure Login Link</h1>
        </div>
        <div class="content">
            <h2>Hi ${name}!</h2>
            <p>Click the button below to securely log in to your Zoptal account:</p>
            
            <p style="text-align: center;">
                <a href="${loginUrl}" class="button">🔓 Login to Zoptal</a>
            </p>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #007bff; background: #f8f9fa; padding: 10px; border-radius: 5px;">${loginUrl}</p>

            <div class="warning">
                <p><strong>⚠️ Security Notice:</strong></p>
                <ul style="margin: 10px 0;">
                    <li>This link expires in <strong>${expiresInMinutes} minutes</strong></li>
                    <li>Only use this link if you requested it</li>
                    <li>This link can only be used once</li>
                </ul>
            </div>

            ${ipAddress || device ? `
            <div class="security-info">
                <p><strong>Request Details:</strong></p>
                ${ipAddress ? `<p>📍 IP Address: ${ipAddress}</p>` : ''}
                ${device ? `<p>📱 Device: ${device}</p>` : ''}
            </div>
            ` : ''}

            <p>If you didn't request this login link, please ignore this email and contact our support team if you have security concerns.</p>
            
            <p>Best regards,<br>The Zoptal Security Team</p>
        </div>
        <div class="footer">
            <p>© 2024 Zoptal. All rights reserved.</p>
            <p>This secure login link was requested for your account.</p>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Generate security alert HTML template
   */
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
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Security Alert</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #ffc107; color: #212529; padding: 20px; text-align: center; }
        .content { padding: 30px 20px; }
        .alert { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .details { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
        .logo { font-size: 24px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🔒 Zoptal Security</div>
        </div>
        <div class="content">
            <h2>Security Alert</h2>
            <p>Hi ${name},</p>
            <div class="alert">
                <p><strong>We detected important activity on your account:</strong></p>
            </div>
            <div class="details">
                <h3>Activity Details:</h3>
                <p><strong>Event:</strong> ${event}</p>
                <p><strong>Time:</strong> ${timestamp}</p>
                <p><strong>IP Address:</strong> ${ipAddress}</p>
                <p><strong>Device:</strong> ${userAgent}</p>
            </div>
            <p><strong>If this was you:</strong> No action is needed.</p>
            <p><strong>If you don't recognize this activity:</strong></p>
            <ul>
                <li>Change your password immediately</li>
                <li>Enable two-factor authentication</li>
                <li>Review your account settings</li>
                <li>Contact our support team if you need assistance</li>
            </ul>
            <p>Best regards,<br>The Zoptal Security Team</p>
        </div>
        <div class="footer">
            <p>© 2024 Zoptal. All rights reserved.</p>
            <p>This security alert was sent to ${name}.</p>
        </div>
    </div>
</body>
</html>`;
  }
}

export const createEmailService = (): EmailService => {
  return new EmailService();
};