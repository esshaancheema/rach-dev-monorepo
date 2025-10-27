import { Twilio } from 'twilio';
import { logger } from '../utils/logger';
import { config } from '../config';
import { cacheManager } from '../utils/redis';
import { getCircuitBreaker, CircuitBreaker } from '../middleware/circuit-breaker.middleware';
import { gracefulDegradationService } from './graceful-degradation.service';

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

export interface TwoFactorSmsData {
  to: string;
  code: string;
  name: string;
}

export interface SmsSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  retryAfter?: number;
  fallbackUsed?: boolean;
}

export class EnhancedSmsService {
  private client: Twilio | null = null;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY_MS = 1000;
  private readonly RATE_LIMIT_CACHE_KEY = 'sms_rate_limit:';
  private readonly FAILED_SMS_KEY = 'failed_sms:';
  private readonly QUEUE_KEY = 'sms_queue:';
  private circuitBreaker: CircuitBreaker;
  private isInitialized: boolean = false;

  constructor() {
    // Get or create circuit breaker for SMS service
    this.circuitBreaker = getCircuitBreaker('sms', {
      failureThreshold: 5,
      recoveryTimeout: 60000, // 1 minute
      monitoringPeriod: 30000, // 30 seconds
      halfOpenMaxCalls: 3
    });

    // Initialize Twilio with error handling
    try {
      if (!config.TWILIO_ACCOUNT_SID || !config.TWILIO_AUTH_TOKEN) {
        logger.warn('Twilio credentials not configured - SMS service will be in degraded mode');
        this.isInitialized = false;
        return;
      }
      
      this.client = new Twilio(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN);
      this.isInitialized = true;
      logger.info('Twilio SMS service initialized with circuit breaker');
    } catch (error) {
      logger.error('Failed to initialize Twilio:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Send phone verification SMS with circuit breaker protection
   */
  async sendPhoneVerification(data: PhoneVerificationData): Promise<SmsSendResult> {
    const { to, code, name } = data;

    const message = `Hi ${name}! Your Zoptal verification code is: ${code}. This code expires in 15 minutes. Don't share this code with anyone.`;

    return this.sendSmsWithCircuitBreaker({
      to,
      body: message,
      type: 'phone_verification',
      metadata: { name, code }
    });
  }

  /**
   * Send password reset SMS with circuit breaker protection
   */
  async sendPasswordResetSms(data: PasswordResetSmsData): Promise<SmsSendResult> {
    const { to, code, name, expiresInMinutes } = data;

    const message = `Hi ${name}! Your Zoptal password reset code is: ${code}. This code expires in ${expiresInMinutes} minutes. If you didn't request this, please ignore.`;

    return this.sendSmsWithCircuitBreaker({
      to,
      body: message,
      type: 'password_reset',
      metadata: { name, code }
    });
  }

  /**
   * Send security alert SMS with circuit breaker protection
   */
  async sendSecurityAlert(data: SecurityAlertSmsData): Promise<SmsSendResult> {
    const { to, event, name } = data;

    const message = `Zoptal Security Alert: ${event} detected on your account. If this wasn't you, secure your account immediately. Contact support if needed.`;

    return this.sendSmsWithCircuitBreaker({
      to,
      body: message,
      type: 'security_alert',
      metadata: { name, event }
    });
  }

  /**
   * Send two-factor authentication SMS with circuit breaker protection
   */
  async sendTwoFactorCode(data: TwoFactorSmsData): Promise<SmsSendResult> {
    const { to, code, name } = data;

    const message = `Your Zoptal 2FA code is: ${code}. Valid for 5 minutes. Never share this code.`;

    return this.sendSmsWithCircuitBreaker({
      to,
      body: message,
      type: 'two_factor',
      metadata: { name, code }
    });
  }

  /**
   * Send SMS with circuit breaker and comprehensive error handling
   */
  private async sendSmsWithCircuitBreaker(params: {
    to: string;
    body: string;
    type: string;
    metadata: Record<string, any>;
  }): Promise<SmsSendResult> {
    const { to, body, type, metadata } = params;

    // Check if service is in degraded mode
    if (gracefulDegradationService.isServiceDegraded('sms')) {
      logger.warn('SMS service is in degraded mode, queueing SMS');
      await this.queueSms(params);
      return {
        success: false,
        error: 'SERVICE_DEGRADED',
        fallbackUsed: true
      };
    }

    // Check rate limiting
    const rateLimitResult = await this.checkRateLimit(to);
    if (!rateLimitResult.allowed) {
      logger.warn('SMS rate limit exceeded:', {
        recipient: this.maskPhoneNumber(to),
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
          return await this.sendSmsWithRetry(to, body, type, metadata);
        },
        async () => {
          // Fallback: Queue the SMS for later processing
          await this.queueSms(params);
          logger.info('SMS queued due to circuit breaker open state', {
            type,
            recipient: this.maskPhoneNumber(to)
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
      logger.error('SMS send failed with circuit breaker:', {
        error: error.message,
        type,
        recipient: this.maskPhoneNumber(to)
      });

      // Queue for retry later
      await this.queueSms(params);

      return {
        success: false,
        error: error.message || 'SMS_SEND_FAILED',
        fallbackUsed: true
      };
    }
  }

  /**
   * Send SMS with retry logic
   */
  private async sendSmsWithRetry(
    to: string,
    body: string,
    type: string,
    metadata: Record<string, any>
  ): Promise<SmsSendResult> {
    // Check if service is available
    if (!this.isInitialized || !this.client) {
      throw new Error('SMS_SERVICE_UNAVAILABLE');
    }

    const formattedNumber = this.formatPhoneNumber(to);
    let lastError: any;

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        const message = await this.client.messages.create({
          body,
          from: config.TWILIO_PHONE_NUMBER,
          to: formattedNumber,
        });

        // Update rate limiting
        await this.updateRateLimit(to);

        logger.info('SMS sent successfully:', {
          recipient: this.maskPhoneNumber(to),
          type,
          messageId: message.sid,
          attempt,
        });

        return {
          success: true,
          messageId: message.sid,
        };

      } catch (error: any) {
        lastError = error;

        const errorInfo = this.parseSmsError(error);

        logger.warn('SMS send attempt failed:', {
          recipient: this.maskPhoneNumber(to),
          type,
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
    const errorInfo = this.parseSmsError(lastError);
    throw new Error(errorInfo.type);
  }

  /**
   * Queue SMS for later processing
   */
  private async queueSms(params: {
    to: string;
    body: string;
    type: string;
    metadata: Record<string, any>;
  }): Promise<void> {
    const queueItem = {
      ...params,
      timestamp: new Date().toISOString(),
      retryCount: 0
    };

    await cacheManager.rpush(
      this.QUEUE_KEY,
      JSON.stringify(queueItem)
    );

    logger.info('SMS queued for later processing', {
      type: params.type,
      recipient: this.maskPhoneNumber(params.to)
    });
  }

  /**
   * Process queued SMS messages (called by a background job)
   */
  async processQueuedSms(): Promise<void> {
    if (!this.circuitBreaker.isAvailable()) {
      logger.info('Circuit breaker is not available, skipping SMS queue processing');
      return;
    }

    const queueLength = await cacheManager.llen(this.QUEUE_KEY);
    if (queueLength === 0) {
      return;
    }

    logger.info(`Processing ${queueLength} queued SMS messages`);

    for (let i = 0; i < Math.min(queueLength, 10); i++) {
      const item = await cacheManager.lpop(this.QUEUE_KEY);
      if (!item) break;

      try {
        const queueItem = JSON.parse(item);
        const result = await this.sendSmsWithCircuitBreaker({
          to: queueItem.to,
          body: queueItem.body,
          type: queueItem.type,
          metadata: queueItem.metadata
        });

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
        logger.error('Failed to process queued SMS:', error);
      }
    }
  }

  /**
   * Parse SMS service errors
   */
  private parseSmsError(error: any): {
    type: string;
    statusCode?: number;
    message: string;
    isPermanent: boolean;
  } {
    const statusCode = error?.status || error?.code;
    const message = error?.message || 'Unknown error';

    // Twilio error codes
    if (error?.code) {
      switch (error.code) {
        case 21211: // Invalid phone number
        case 21614: // Number is not mobile
        case 21217: // Phone number does not exist
          return {
            type: 'INVALID_PHONE_NUMBER',
            statusCode: error.code,
            message,
            isPermanent: true,
          };
        case 21610: // Unsubscribed recipient
        case 21612: // Cannot send to this number
          return {
            type: 'SMS_DELIVERY_BLOCKED',
            statusCode: error.code,
            message,
            isPermanent: true,
          };
        case 20003: // Authentication error
        case 20005: // Out of credit
          return {
            type: 'SMS_AUTH_FAILED',
            statusCode: error.code,
            message,
            isPermanent: true,
          };
        case 21608: // Unverified phone number (trial account)
          return {
            type: 'SMS_UNVERIFIED_NUMBER',
            statusCode: error.code,
            message,
            isPermanent: true,
          };
        case 20429: // Rate limit exceeded
          return {
            type: 'SMS_RATE_LIMITED',
            statusCode: error.code,
            message,
            isPermanent: false,
          };
        case 30001: // Queue overflow
        case 30002: // Account suspended
        case 30003: // Unreachable destination
        case 30005: // Unknown destination
        case 30006: // Landline or unreachable carrier
        case 30007: // Carrier violation
        case 30008: // Unknown error
          return {
            type: 'SMS_DELIVERY_FAILED',
            statusCode: error.code,
            message,
            isPermanent: false,
          };
        default:
          return {
            type: 'SMS_SERVICE_ERROR',
            statusCode: error.code,
            message,
            isPermanent: false,
          };
      }
    }

    // HTTP status codes
    switch (statusCode) {
      case 400:
      case 404:
        return {
          type: 'INVALID_SMS_DATA',
          statusCode,
          message,
          isPermanent: true,
        };
      case 401:
      case 403:
        return {
          type: 'SMS_AUTH_FAILED',
          statusCode,
          message,
          isPermanent: true,
        };
      case 429:
        return {
          type: 'SMS_RATE_LIMITED',
          statusCode,
          message,
          isPermanent: false,
        };
      case 500:
      case 502:
      case 503:
      case 504:
        return {
          type: 'SMS_SERVICE_ERROR',
          statusCode,
          message,
          isPermanent: false,
        };
      default:
        return {
          type: 'SMS_UNKNOWN_ERROR',
          statusCode,
          message,
          isPermanent: false,
        };
    }
  }

  /**
   * Check rate limiting
   */
  private async checkRateLimit(phoneNumber: string): Promise<{ allowed: boolean; retryAfter?: number }> {
    const key = `${this.RATE_LIMIT_CACHE_KEY}${phoneNumber}`;
    const count = await cacheManager.get(key);

    // Allow 3 SMS per hour per phone number
    if (count && parseInt(count) >= 3) {
      const ttl = await cacheManager.ttl(key);
      return { allowed: false, retryAfter: ttl };
    }

    return { allowed: true };
  }

  /**
   * Update rate limiting
   */
  private async updateRateLimit(phoneNumber: string): Promise<void> {
    const key = `${this.RATE_LIMIT_CACHE_KEY}${phoneNumber}`;
    const count = await cacheManager.get(key);

    if (count) {
      await cacheManager.incr(key);
    } else {
      await cacheManager.setex(key, 3600, 1); // 1 hour expiry
    }
  }

  /**
   * Format phone number to E.164 format
   */
  private formatPhoneNumber(phone: string): string {
    // Remove all non-numeric characters
    let cleaned = phone.replace(/\D/g, '');

    // Add country code if missing (assuming US if no country code)
    if (!cleaned.startsWith('1') && cleaned.length === 10) {
      cleaned = '1' + cleaned;
    }

    // Add + prefix
    if (!cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }

    return cleaned;
  }

  /**
   * Mask phone number for logging
   */
  private maskPhoneNumber(phone: string): string {
    if (phone.length < 6) {
      return '***';
    }
    return phone.substring(0, 3) + '***' + phone.substring(phone.length - 2);
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get circuit breaker status
   */
  getCircuitBreakerStatus() {
    return this.circuitBreaker.getState();
  }

  /**
   * Check if SMS service is available
   */
  isServiceAvailable(): boolean {
    return this.isInitialized && this.circuitBreaker.isAvailable();
  }

  /**
   * Validate phone number format
   */
  isValidPhoneNumber(phone: string): boolean {
    // Basic E.164 format validation
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    const formatted = this.formatPhoneNumber(phone);
    return e164Regex.test(formatted);
  }

  /**
   * Get SMS statistics
   */
  async getSmsStatistics(): Promise<{
    queueLength: number;
    circuitBreakerStatus: any;
    isAvailable: boolean;
  }> {
    const queueLength = await cacheManager.llen(this.QUEUE_KEY);
    
    return {
      queueLength,
      circuitBreakerStatus: this.getCircuitBreakerStatus(),
      isAvailable: this.isServiceAvailable()
    };
  }
}

// Export singleton instance
export const enhancedSmsService = new EnhancedSmsService();