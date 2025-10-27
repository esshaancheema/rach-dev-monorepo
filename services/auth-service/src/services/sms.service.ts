import { Twilio } from 'twilio';
import { logger } from '../utils/logger';
import { config } from '../config';

export interface PhoneVerificationData {
  to: string;
  code: string;
  name: string;
}

export interface SecurityAlertSmsData {
  to: string;
  event: string;
  name: string;
}

export interface PasswordResetSmsData {
  to: string;
  code: string;
  name: string;
  expiresInMinutes: number;
}

export interface OTPSmsData {
  to: string;
  code: string;
  name: string;
  type: 'login' | 'registration' | 'verification' | 'phone_change' | 'email_change';
  expiresInMinutes: number;
}

export interface SmsResult {
  success: boolean;
  messageSid?: string;
  error?: string;
}

export class SmsService {
  private client: Twilio;

  constructor() {
    this.client = new Twilio(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN);
  }

  /**
   * Send OTP code via SMS for passwordless authentication
   */
  async sendOTPCode(data: OTPSmsData): Promise<SmsResult> {
    const { to, code, name, type, expiresInMinutes } = data;

    const typeMessages = {
      login: `Hi ${name}! Your Zoptal login code is: ${code}. Expires in ${expiresInMinutes} min. Don't share this code.`,
      registration: `Hi ${name}! Your Zoptal registration code is: ${code}. Expires in ${expiresInMinutes} min. Complete your signup!`,
      verification: `Hi ${name}! Your Zoptal verification code is: ${code}. Expires in ${expiresInMinutes} min. Don't share this code.`,
      phone_change: `Hi ${name}! Your phone change verification code is: ${code}. Expires in ${expiresInMinutes} min. Don't share this code.`,
      email_change: `Hi ${name}! Your email change verification code is: ${code}. Expires in ${expiresInMinutes} min. Don't share this code.`,
    };

    const message = typeMessages[type];

    try {
      if (!this.validatePhoneNumber(to)) {
        return {
          success: false,
          error: 'INVALID_PHONE_NUMBER'
        };
      }

      const result = await this.client.messages.create({
        body: message,
        from: config.TWILIO_PHONE_NUMBER,
        to: this.formatPhoneNumber(to),
      });

      logger.info('OTP SMS sent successfully:', { 
        to: this.maskPhoneNumber(to), 
        type,
        messageSid: result.sid 
      });

      return {
        success: true,
        messageSid: result.sid
      };

    } catch (error: any) {
      logger.error('Failed to send OTP SMS:', {
        to: this.maskPhoneNumber(to),
        type,
        error: error.message,
        code: error.code,
        moreInfo: error.moreInfo
      });

      return {
        success: false,
        error: this.parseErrorCode(error)
      };
    }
  }

  /**
   * Send phone verification SMS
   */
  async sendPhoneVerification(data: PhoneVerificationData): Promise<void> {
    const { to, code, name } = data;

    const message = `Hi ${name}! Your Zoptal verification code is: ${code}. This code expires in 15 minutes. Don't share this code with anyone.`;

    try {
      await this.client.messages.create({
        body: message,
        from: config.TWILIO_PHONE_NUMBER,
        to: this.formatPhoneNumber(to),
      });

      logger.info('Phone verification SMS sent successfully:', { to: this.maskPhoneNumber(to) });
    } catch (error) {
      logger.error('Failed to send phone verification SMS:', error);
      throw new Error('SMS_SEND_FAILED');
    }
  }

  /**
   * Send password reset SMS
   */
  async sendPasswordResetSms(data: PasswordResetSmsData): Promise<void> {
    const { to, code, name, expiresInMinutes } = data;

    const message = `Hi ${name}! Your Zoptal password reset code is: ${code}. This code expires in ${expiresInMinutes} minutes. If you didn't request this, please ignore.`;

    try {
      await this.client.messages.create({
        body: message,
        from: config.TWILIO_PHONE_NUMBER,
        to: this.formatPhoneNumber(to),
      });

      logger.info('Password reset SMS sent successfully:', { to: this.maskPhoneNumber(to) });
    } catch (error) {
      logger.error('Failed to send password reset SMS:', error);
      throw new Error('SMS_SEND_FAILED');
    }
  }

  /**
   * Send security alert SMS
   */
  async sendSecurityAlert(data: SecurityAlertSmsData): Promise<void> {
    const { to, event, name } = data;

    const message = `Zoptal Security Alert: ${event} detected on your account. If this wasn't you, secure your account immediately. Contact support if needed.`;

    try {
      await this.client.messages.create({
        body: message,
        from: config.TWILIO_PHONE_NUMBER,
        to: this.formatPhoneNumber(to),
      });

      logger.info('Security alert SMS sent successfully:', { 
        to: this.maskPhoneNumber(to), 
        event 
      });
    } catch (error) {
      logger.error('Failed to send security alert SMS:', error);
      throw new Error('SMS_SEND_FAILED');
    }
  }

  /**
   * Send two-factor authentication code
   */
  async send2FACode(phoneNumber: string, code: string, name: string): Promise<void> {
    const message = `Hi ${name}! Your Zoptal 2FA code is: ${code}. This code expires in 5 minutes. Don't share this code with anyone.`;

    try {
      await this.client.messages.create({
        body: message,
        from: config.TWILIO_PHONE_NUMBER,
        to: this.formatPhoneNumber(phoneNumber),
      });

      logger.info('2FA SMS sent successfully:', { to: this.maskPhoneNumber(phoneNumber) });
    } catch (error) {
      logger.error('Failed to send 2FA SMS:', error);
      throw new Error('SMS_SEND_FAILED');
    }
  }

  /**
   * Send account lockout notification
   */
  async sendAccountLockoutNotification(phoneNumber: string, name: string, unlockTime: string): Promise<void> {
    const message = `Hi ${name}! Your Zoptal account has been temporarily locked due to multiple failed login attempts. It will be unlocked at ${unlockTime}. Contact support if you need help.`;

    try {
      await this.client.messages.create({
        body: message,
        from: config.TWILIO_PHONE_NUMBER,
        to: this.formatPhoneNumber(phoneNumber),
      });

      logger.info('Account lockout SMS sent successfully:', { to: this.maskPhoneNumber(phoneNumber) });
    } catch (error) {
      logger.error('Failed to send account lockout SMS:', error);
      throw new Error('SMS_SEND_FAILED');
    }
  }

  /**
   * Validate phone number format
   */
  validatePhoneNumber(phoneNumber: string): boolean {
    // Basic E.164 format validation
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber);
  }

  /**
   * Format phone number to E.164 format
   */
  private formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters except +
    let formatted = phoneNumber.replace(/[^\d+]/g, '');
    
    // If it doesn't start with +, add +1 (assuming US/Canada)
    if (!formatted.startsWith('+')) {
      if (formatted.length === 10) {
        formatted = `+1${formatted}`;
      } else if (formatted.length === 11 && formatted.startsWith('1')) {
        formatted = `+${formatted}`;
      } else {
        formatted = `+${formatted}`;
      }
    }
    
    return formatted;
  }

  /**
   * Mask phone number for logging (security)
   */
  private maskPhoneNumber(phoneNumber: string): string {
    if (phoneNumber.length <= 4) {
      return '*'.repeat(phoneNumber.length);
    }
    
    const visible = phoneNumber.slice(-4);
    const masked = '*'.repeat(phoneNumber.length - 4);
    return masked + visible;
  }

  /**
   * Get SMS delivery status
   */
  async getMessageStatus(messageSid: string): Promise<{
    status: string;
    errorCode?: string;
    errorMessage?: string;
  }> {
    try {
      const message = await this.client.messages(messageSid).fetch();
      
      return {
        status: message.status,
        errorCode: message.errorCode?.toString(),
        errorMessage: message.errorMessage || undefined,
      };
    } catch (error) {
      logger.error('Failed to fetch message status:', error);
      throw new Error('SMS_STATUS_FETCH_FAILED');
    }
  }

  /**
   * Check if phone number can receive SMS
   */
  async checkPhoneNumberCapability(phoneNumber: string): Promise<{
    canReceiveSms: boolean;
    carrier?: string;
    countryCode?: string;
  }> {
    try {
      const lookup = await this.client.lookups.v1
        .phoneNumbers(this.formatPhoneNumber(phoneNumber))
        .fetch({ type: ['carrier'] });

      return {
        canReceiveSms: lookup.carrier?.type !== 'landline',
        carrier: lookup.carrier?.name,
        countryCode: lookup.countryCode,
      };
    } catch (error) {
      logger.error('Failed to check phone number capability:', error);
      return {
        canReceiveSms: true, // Assume true if lookup fails
      };
    }
  }

  /**
   * Parse Twilio error codes to user-friendly messages
   */
  private parseErrorCode(error: any): string {
    const errorCode = error.code;
    
    switch (errorCode) {
      case 21211:
        return 'INVALID_PHONE_NUMBER';
      case 21612:
        return 'PHONE_NUMBER_NOT_VERIFIED';
      case 21614:
        return 'PHONE_NUMBER_INVALID_FORMAT';
      case 21408:
        return 'PHONE_NUMBER_NOT_REACHABLE';
      case 30007:
        return 'MESSAGE_FILTERED_BY_CARRIER';
      case 30008:
        return 'MESSAGE_DELIVERY_UNKNOWN';
      case 30005:
        return 'MESSAGE_BLOCKED_LANDLINE';
      case 21610:
        return 'MESSAGE_TO_UNSUBSCRIBED_NUMBER';
      case 30003:
        return 'MESSAGE_DELIVERY_UNREACHABLE';
      case 21617:
        return 'SMS_RATE_LIMIT_EXCEEDED';
      case 20003:
        return 'AUTHENTICATION_FAILED';
      case 20005:
        return 'ACCOUNT_NOT_ACTIVE';
      default:
        return error.message || 'SMS_UNKNOWN_ERROR';
    }
  }

  /**
   * Get account SMS usage statistics
   */
  async getUsageStats(): Promise<{
    messagesSent: number;
    messagesDelivered: number;
    messagesFailed: number;
    totalCost: number;
  }> {
    try {
      const today = new Date();
      const startDate = new Date(today.getFullYear(), today.getMonth(), 1);

      const usage = await this.client.usage.records.list({
        category: 'sms',
        startDate,
        endDate: today,
      });

      const stats = usage.reduce(
        (acc, record) => {
          acc.messagesSent += parseInt(record.usage || '0');
          acc.totalCost += parseFloat(record.price || '0');
          return acc;
        },
        {
          messagesSent: 0,
          messagesDelivered: 0,
          messagesFailed: 0,
          totalCost: 0,
        }
      );

      return stats;
    } catch (error) {
      logger.error('Failed to fetch SMS usage stats:', error);
      return {
        messagesSent: 0,
        messagesDelivered: 0,
        messagesFailed: 0,
        totalCost: 0,
      };
    }
  }
}

export const createSmsService = (): SmsService => {
  return new SmsService();
};