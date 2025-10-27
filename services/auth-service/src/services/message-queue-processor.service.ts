import { CronJob } from 'cron';
import { logger } from '../utils/logger';
import { enhancedEmailService } from './email-with-circuit-breaker.service';
import { enhancedSmsService } from './sms-with-circuit-breaker.service';
import { metricsService } from './metrics.service';
import { notificationService } from './notification.service';

export interface QueueStatistics {
  emailQueue: {
    length: number;
    processedCount: number;
    failedCount: number;
  };
  smsQueue: {
    length: number;
    processedCount: number;
    failedCount: number;
  };
  lastProcessedAt: Date | null;
}

export class MessageQueueProcessor {
  private emailQueueJob: CronJob | null = null;
  private smsQueueJob: CronJob | null = null;
  private healthCheckJob: CronJob | null = null;
  private statistics: QueueStatistics = {
    emailQueue: {
      length: 0,
      processedCount: 0,
      failedCount: 0
    },
    smsQueue: {
      length: 0,
      processedCount: 0,
      failedCount: 0
    },
    lastProcessedAt: null
  };
  private isProcessing = false;

  constructor() {
    logger.info('Message Queue Processor initialized');
  }

  /**
   * Start all background jobs
   */
  start(): void {
    this.startEmailQueueProcessor();
    this.startSmsQueueProcessor();
    this.startHealthCheckJob();
    
    logger.info('Message Queue Processor started');
  }

  /**
   * Stop all background jobs
   */
  stop(): void {
    if (this.emailQueueJob) {
      this.emailQueueJob.stop();
      this.emailQueueJob = null;
    }

    if (this.smsQueueJob) {
      this.smsQueueJob.stop();
      this.smsQueueJob = null;
    }

    if (this.healthCheckJob) {
      this.healthCheckJob.stop();
      this.healthCheckJob = null;
    }

    logger.info('Message Queue Processor stopped');
  }

  /**
   * Start email queue processor
   */
  private startEmailQueueProcessor(): void {
    // Process email queue every 5 minutes
    this.emailQueueJob = new CronJob(
      '*/5 * * * *',
      async () => {
        if (this.isProcessing) {
          logger.info('Email queue processing already in progress, skipping');
          return;
        }

        try {
          this.isProcessing = true;
          logger.info('Starting email queue processing');

          const startTime = Date.now();
          await enhancedEmailService.processQueuedEmails();
          const duration = Date.now() - startTime;

          this.statistics.emailQueue.processedCount++;
          this.statistics.lastProcessedAt = new Date();

          // Record metrics
          metricsService.recordCustomMetric('email_queue_processing_duration', duration);
          
          logger.info('Email queue processing completed', {
            duration,
            processedCount: this.statistics.emailQueue.processedCount
          });
        } catch (error) {
          this.statistics.emailQueue.failedCount++;
          logger.error('Email queue processing failed:', error);
          
          // Send alert if failures are high
          if (this.statistics.emailQueue.failedCount > 5) {
            await this.sendProcessingAlert('email', this.statistics.emailQueue.failedCount);
          }
        } finally {
          this.isProcessing = false;
        }
      },
      null,
      true,
      'UTC'
    );

    logger.info('Email queue processor started (runs every 5 minutes)');
  }

  /**
   * Start SMS queue processor
   */
  private startSmsQueueProcessor(): void {
    // Process SMS queue every 3 minutes (SMS are more time-sensitive)
    this.smsQueueJob = new CronJob(
      '*/3 * * * *',
      async () => {
        if (this.isProcessing) {
          logger.info('SMS queue processing already in progress, skipping');
          return;
        }

        try {
          this.isProcessing = true;
          logger.info('Starting SMS queue processing');

          const startTime = Date.now();
          await enhancedSmsService.processQueuedSms();
          const duration = Date.now() - startTime;

          this.statistics.smsQueue.processedCount++;
          this.statistics.lastProcessedAt = new Date();

          // Record metrics
          metricsService.recordCustomMetric('sms_queue_processing_duration', duration);
          
          logger.info('SMS queue processing completed', {
            duration,
            processedCount: this.statistics.smsQueue.processedCount
          });
        } catch (error) {
          this.statistics.smsQueue.failedCount++;
          logger.error('SMS queue processing failed:', error);
          
          // Send alert if failures are high
          if (this.statistics.smsQueue.failedCount > 5) {
            await this.sendProcessingAlert('sms', this.statistics.smsQueue.failedCount);
          }
        } finally {
          this.isProcessing = false;
        }
      },
      null,
      true,
      'UTC'
    );

    logger.info('SMS queue processor started (runs every 3 minutes)');
  }

  /**
   * Start health check job
   */
  private startHealthCheckJob(): void {
    // Check circuit breaker status every minute
    this.healthCheckJob = new CronJob(
      '* * * * *',
      async () => {
        try {
          const emailStatus = enhancedEmailService.getCircuitBreakerStatus();
          const smsStatus = enhancedSmsService.getCircuitBreakerStatus();
          const smsStats = await enhancedSmsService.getSmsStatistics();

          // Log circuit breaker status
          if (emailStatus.state !== 'CLOSED') {
            logger.warn('Email circuit breaker is not closed', emailStatus);
          }

          if (smsStatus.state !== 'CLOSED') {
            logger.warn('SMS circuit breaker is not closed', smsStatus);
          }

          // Update statistics
          this.statistics.smsQueue.length = smsStats.queueLength;

          // Record metrics
          metricsService.recordCustomMetric('email_circuit_breaker_state', 
            emailStatus.state === 'CLOSED' ? 1 : 0);
          metricsService.recordCustomMetric('sms_circuit_breaker_state', 
            smsStatus.state === 'CLOSED' ? 1 : 0);
          metricsService.recordCustomMetric('sms_queue_length', smsStats.queueLength);

          // Send recovery notification if services are back
          if (emailStatus.state === 'CLOSED' && this.wasServiceDown('email')) {
            await this.sendRecoveryNotification('email');
          }

          if (smsStatus.state === 'CLOSED' && this.wasServiceDown('sms')) {
            await this.sendRecoveryNotification('sms');
          }

        } catch (error) {
          logger.error('Health check job failed:', error);
        }
      },
      null,
      true,
      'UTC'
    );

    logger.info('Health check job started (runs every minute)');
  }

  /**
   * Send processing alert
   */
  private async sendProcessingAlert(service: 'email' | 'sms', failureCount: number): Promise<void> {
    try {
      await notificationService.sendAdminAlert({
        type: 'QUEUE_PROCESSING_FAILURE',
        severity: 'high',
        message: `${service.toUpperCase()} queue processing has failed ${failureCount} times`,
        metadata: {
          service,
          failureCount,
          statistics: this.statistics
        }
      });
    } catch (error) {
      logger.error('Failed to send processing alert:', error);
    }
  }

  /**
   * Send recovery notification
   */
  private async sendRecoveryNotification(service: 'email' | 'sms'): Promise<void> {
    try {
      await notificationService.sendAdminAlert({
        type: 'SERVICE_RECOVERED',
        severity: 'info',
        message: `${service.toUpperCase()} service has recovered and is now operational`,
        metadata: {
          service,
          statistics: this.statistics
        }
      });

      // Clear the service down flag
      this.clearServiceDownFlag(service);
    } catch (error) {
      logger.error('Failed to send recovery notification:', error);
    }
  }

  /**
   * Check if service was down
   */
  private wasServiceDown(service: 'email' | 'sms'): boolean {
    // This would typically check a persistent store or cache
    // For now, we'll use a simple in-memory check based on circuit breaker state history
    return false; // Placeholder implementation
  }

  /**
   * Clear service down flag
   */
  private clearServiceDownFlag(service: 'email' | 'sms'): void {
    // This would typically update a persistent store or cache
    // Placeholder implementation
  }

  /**
   * Get queue statistics
   */
  getStatistics(): QueueStatistics {
    return { ...this.statistics };
  }

  /**
   * Manually trigger email queue processing
   */
  async processEmailQueueManually(): Promise<void> {
    if (this.isProcessing) {
      throw new Error('Queue processing already in progress');
    }

    try {
      this.isProcessing = true;
      await enhancedEmailService.processQueuedEmails();
      this.statistics.emailQueue.processedCount++;
      this.statistics.lastProcessedAt = new Date();
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Manually trigger SMS queue processing
   */
  async processSmsQueueManually(): Promise<void> {
    if (this.isProcessing) {
      throw new Error('Queue processing already in progress');
    }

    try {
      this.isProcessing = true;
      await enhancedSmsService.processQueuedSms();
      this.statistics.smsQueue.processedCount++;
      this.statistics.lastProcessedAt = new Date();
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Get circuit breaker status for all services
   */
  getCircuitBreakerStatus(): {
    email: any;
    sms: any;
  } {
    return {
      email: enhancedEmailService.getCircuitBreakerStatus(),
      sms: enhancedSmsService.getCircuitBreakerStatus()
    };
  }

  /**
   * Check if services are healthy
   */
  areServicesHealthy(): boolean {
    const emailHealthy = enhancedEmailService.isServiceAvailable();
    const smsHealthy = enhancedSmsService.isServiceAvailable();
    
    return emailHealthy && smsHealthy;
  }
}

// Export singleton instance
export const messageQueueProcessor = new MessageQueueProcessor();