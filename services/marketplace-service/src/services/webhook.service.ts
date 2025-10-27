import axios from 'axios';
import * as crypto from 'crypto';
import { logger, loggers } from '../utils/logger';
import { config } from '../config/config';

export interface WebhookPayload {
  event: string;
  timestamp: string;
  data: any;
  integrationId?: string;
  installationId?: string;
}

export interface WebhookDelivery {
  id: string;
  url: string;
  payload: WebhookPayload;
  signature: string;
  response?: {
    status: number;
    headers: Record<string, string>;
    body: string;
  };
  attempts: number;
  lastAttempt: Date;
  success: boolean;
  error?: string;
}

export class WebhookService {
  private readonly maxRetries = config.webhooks.retryAttempts;
  private readonly timeout = config.webhooks.timeout;
  private readonly retryDelay = config.webhooks.retryDelay;

  public async sendWebhook(
    url: string,
    payload: WebhookPayload,
    secret: string
  ): Promise<WebhookDelivery> {
    const delivery: WebhookDelivery = {
      id: crypto.randomUUID(),
      url,
      payload,
      signature: this.generateSignature(payload, secret),
      attempts: 0,
      lastAttempt: new Date(),
      success: false,
    };

    try {
      const response = await this.executeWebhook(delivery, secret);
      delivery.response = response;
      delivery.success = response.status >= 200 && response.status < 300;

      if (delivery.success) {
        loggers.webhook.sent(url, payload.event, response.status, Date.now() - delivery.lastAttempt.getTime());
      } else {
        delivery.error = `HTTP ${response.status}: ${response.body}`;
        loggers.webhook.failed(url, payload.event, delivery.error, delivery.attempts);
      }

    } catch (error) {
      delivery.error = error.message;
      delivery.success = false;
      loggers.webhook.failed(url, payload.event, error.message, delivery.attempts);
    }

    return delivery;
  }

  public async sendWebhookWithRetry(
    url: string,
    payload: WebhookPayload,
    secret: string
  ): Promise<WebhookDelivery> {
    let delivery = await this.sendWebhook(url, payload, secret);

    // Retry failed deliveries
    while (!delivery.success && delivery.attempts < this.maxRetries) {
      await this.delay(this.retryDelay * Math.pow(2, delivery.attempts)); // Exponential backoff
      
      delivery.attempts++;
      delivery.lastAttempt = new Date();
      
      loggers.webhook.retrying(url, payload.event, delivery.attempts, this.retryDelay);

      try {
        const response = await this.executeWebhook(delivery, secret);
        delivery.response = response;
        delivery.success = response.status >= 200 && response.status < 300;

        if (delivery.success) {
          loggers.webhook.sent(url, payload.event, response.status, Date.now() - delivery.lastAttempt.getTime());
          break;
        } else {
          delivery.error = `HTTP ${response.status}: ${response.body}`;
        }

      } catch (error) {
        delivery.error = error.message;
      }

      if (!delivery.success) {
        loggers.webhook.failed(url, payload.event, delivery.error!, delivery.attempts);
      }
    }

    return delivery;
  }

  public async broadcastEvent(
    event: string,
    data: any,
    integrationId?: string,
    installationId?: string
  ): Promise<WebhookDelivery[]> {
    const payload: WebhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      data,
      integrationId,
      installationId,
    };

    // In a real implementation, this would fetch webhook endpoints from database
    // For now, return empty array
    const endpoints: Array<{ url: string; secret: string }> = [];
    
    const deliveries = await Promise.all(
      endpoints.map(endpoint => 
        this.sendWebhookWithRetry(endpoint.url, payload, endpoint.secret)
      )
    );

    return deliveries;
  }

  public generateSignature(payload: WebhookPayload, secret: string): string {
    const payloadString = JSON.stringify(payload);
    const signature = crypto
      .createHmac('sha256', secret)
      .update(payloadString)
      .digest('hex');
    
    return `sha256=${signature}`;
  }

  public verifySignature(
    payload: string,
    signature: string,
    secret: string
  ): boolean {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');
      
      const receivedSignature = signature.replace('sha256=', '');
      
      return crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(receivedSignature, 'hex')
      );
    } catch (error) {
      logger.error('Failed to verify webhook signature', {
        error: error.message,
      });
      return false;
    }
  }

  private async executeWebhook(
    delivery: WebhookDelivery,
    secret: string
  ): Promise<{ status: number; headers: Record<string, string>; body: string }> {
    const payloadString = JSON.stringify(delivery.payload);
    
    const response = await axios.post(delivery.url, payloadString, {
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Zoptal-Webhooks/1.0',
        'X-Zoptal-Event': delivery.payload.event,
        'X-Zoptal-Signature': delivery.signature,
        'X-Zoptal-Delivery': delivery.id,
        'X-Zoptal-Timestamp': delivery.payload.timestamp,
      },
      validateStatus: () => true, // Don't throw on any status code
    });

    return {
      status: response.status,
      headers: response.headers as Record<string, string>,
      body: typeof response.data === 'string' ? response.data : JSON.stringify(response.data),
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}