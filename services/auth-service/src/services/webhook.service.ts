import { PrismaClient } from '@zoptal/database';
import { logger } from '../utils/logger';
import crypto from 'crypto';
import axios from 'axios';

export interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  events: WebhookEvent[];
  secret: string;
  isActive: boolean;
  retryConfig: {
    maxRetries: number;
    retryDelayMs: number;
    backoffMultiplier: number;
  };
  headers?: Record<string, string>;
  timeout: number;
  createdAt: Date;
  updatedAt: Date;
  lastTriggered?: Date;
  successCount: number;
  failureCount: number;
  metadata?: Record<string, any>;
}

export interface WebhookPayload {
  id: string;
  event: WebhookEvent;
  timestamp: string;
  data: Record<string, any>;
  user?: {
    id: string;
    email: string;
    profile?: {
      firstName?: string;
      lastName?: string;
    };
  };
  metadata?: Record<string, any>;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: WebhookEvent;
  payload: WebhookPayload;
  url: string;
  httpStatus?: number;
  responseBody?: string;
  responseHeaders?: Record<string, string>;
  deliveredAt?: Date;
  attempts: number;
  success: boolean;
  error?: string;
  duration: number; // milliseconds
  createdAt: Date;
}

export type WebhookEvent = 
  | 'user.created'
  | 'user.updated'
  | 'user.deleted'
  | 'user.login'
  | 'user.logout'
  | 'user.login_failed'
  | 'user.password_changed'
  | 'user.email_verified'
  | 'user.phone_verified'
  | 'user.account_locked'
  | 'user.account_unlocked'
  | 'user.password_reset_requested'
  | 'user.password_reset_completed'
  | 'user.two_factor_enabled'
  | 'user.two_factor_disabled'
  | 'user.session_expired'
  | 'user.suspicious_activity'
  | 'user.consent_updated'
  | 'user.preferences_updated'
  | 'user.avatar_updated'
  | 'admin.user_impersonated'
  | 'security.breach_detected'
  | 'security.rate_limit_exceeded'
  | 'security.ip_blocked'
  | 'system.maintenance_mode'
  | 'system.backup_completed'
  | 'system.alert_triggered';

interface WebhookServiceDependencies {
  prisma: PrismaClient;
}

export function createWebhookService({ prisma }: WebhookServiceDependencies) {

  /**
   * Create webhook endpoint
   */
  async function createWebhookEndpoint(params: {
    name: string;
    url: string;
    events: WebhookEvent[];
    secret?: string;
    headers?: Record<string, string>;
    timeout?: number;
    retryConfig?: Partial<WebhookEndpoint['retryConfig']>;
    metadata?: Record<string, any>;
  }): Promise<WebhookEndpoint> {
    try {
      const {
        name,
        url,
        events,
        secret = generateWebhookSecret(),
        headers = {},
        timeout = 30000,
        retryConfig = {},
        metadata = {}
      } = params;

      const webhook: WebhookEndpoint = {
        id: `wh_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
        name,
        url,
        events,
        secret,
        isActive: true,
        retryConfig: {
          maxRetries: 3,
          retryDelayMs: 1000,
          backoffMultiplier: 2,
          ...retryConfig
        },
        headers,
        timeout,
        createdAt: new Date(),
        updatedAt: new Date(),
        successCount: 0,
        failureCount: 0,
        metadata
      };

      // Store in database using JSON metadata
      await prisma.activityLog.create({
        data: {
          userId: 'system',
          action: 'WEBHOOK_ENDPOINT_CREATED',
          category: 'WEBHOOK',
          ip: '127.0.0.1',
          userAgent: 'System',
          metadata: webhook
        }
      });

      logger.info({
        webhookId: webhook.id,
        name: webhook.name,
        url: webhook.url,
        events: webhook.events
      }, 'Webhook endpoint created');

      return webhook;

    } catch (error) {
      logger.error({ error, name: params.name }, 'Failed to create webhook endpoint');
      throw error;
    }
  }

  /**
   * Update webhook endpoint
   */
  async function updateWebhookEndpoint(
    webhookId: string,
    updates: Partial<Pick<WebhookEndpoint, 'name' | 'url' | 'events' | 'isActive' | 'headers' | 'timeout' | 'retryConfig'>>
  ): Promise<WebhookEndpoint> {
    try {
      const webhook = await getWebhookEndpoint(webhookId);
      if (!webhook) {
        throw new Error('Webhook endpoint not found');
      }

      const updatedWebhook: WebhookEndpoint = {
        ...webhook,
        ...updates,
        updatedAt: new Date()
      };

      // Update in database
      await prisma.activityLog.create({
        data: {
          userId: 'system',
          action: 'WEBHOOK_ENDPOINT_UPDATED',
          category: 'WEBHOOK',
          ip: '127.0.0.1',
          userAgent: 'System',
          metadata: updatedWebhook
        }
      });

      logger.info({ webhookId, updates }, 'Webhook endpoint updated');

      return updatedWebhook;

    } catch (error) {
      logger.error({ error, webhookId }, 'Failed to update webhook endpoint');
      throw error;
    }
  }

  /**
   * Delete webhook endpoint
   */
  async function deleteWebhookEndpoint(webhookId: string): Promise<void> {
    try {
      const webhook = await getWebhookEndpoint(webhookId);
      if (!webhook) {
        throw new Error('Webhook endpoint not found');
      }

      // Mark as deleted
      await prisma.activityLog.create({
        data: {
          userId: 'system',
          action: 'WEBHOOK_ENDPOINT_DELETED',
          category: 'WEBHOOK',
          ip: '127.0.0.1',
          userAgent: 'System',
          metadata: { webhookId, deletedAt: new Date().toISOString() }
        }
      });

      logger.info({ webhookId }, 'Webhook endpoint deleted');

    } catch (error) {
      logger.error({ error, webhookId }, 'Failed to delete webhook endpoint');
      throw error;
    }
  }

  /**
   * Get webhook endpoint
   */
  async function getWebhookEndpoint(webhookId: string): Promise<WebhookEndpoint | null> {
    try {
      const activity = await prisma.activityLog.findFirst({
        where: {
          action: { in: ['WEBHOOK_ENDPOINT_CREATED', 'WEBHOOK_ENDPOINT_UPDATED'] },
          metadata: {
            path: ['id'],
            equals: webhookId
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      if (!activity) {
        return null;
      }

      return activity.metadata as WebhookEndpoint;

    } catch (error) {
      logger.error({ error, webhookId }, 'Failed to get webhook endpoint');
      throw error;
    }
  }

  /**
   * List webhook endpoints
   */
  async function listWebhookEndpoints(): Promise<WebhookEndpoint[]> {
    try {
      const activities = await prisma.activityLog.findMany({
        where: {
          action: { in: ['WEBHOOK_ENDPOINT_CREATED', 'WEBHOOK_ENDPOINT_UPDATED'] },
          category: 'WEBHOOK'
        },
        orderBy: { createdAt: 'desc' }
      });

      // Group by webhook ID and get latest version
      const webhooksMap = new Map<string, WebhookEndpoint>();
      
      for (const activity of activities) {
        const webhook = activity.metadata as WebhookEndpoint;
        if (!webhooksMap.has(webhook.id)) {
          webhooksMap.set(webhook.id, webhook);
        }
      }

      // Filter out deleted webhooks
      const deletedWebhooks = await prisma.activityLog.findMany({
        where: {
          action: 'WEBHOOK_ENDPOINT_DELETED',
          category: 'WEBHOOK'
        }
      });

      const deletedIds = new Set(deletedWebhooks.map(a => (a.metadata as any).webhookId));

      return Array.from(webhooksMap.values())
        .filter(webhook => !deletedIds.has(webhook.id))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    } catch (error) {
      logger.error({ error }, 'Failed to list webhook endpoints');
      throw error;
    }
  }

  /**
   * Trigger webhook event
   */
  async function triggerWebhook(
    event: WebhookEvent,
    data: Record<string, any>,
    user?: WebhookPayload['user'],
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const webhooks = await listWebhookEndpoints();
      const relevantWebhooks = webhooks.filter(webhook => 
        webhook.isActive && webhook.events.includes(event)
      );

      if (relevantWebhooks.length === 0) {
        logger.debug({ event }, 'No active webhooks configured for event');
        return;
      }

      const payload: WebhookPayload = {
        id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
        event,
        timestamp: new Date().toISOString(),
        data,
        user,
        metadata
      };

      // Trigger webhooks in parallel
      const deliveryPromises = relevantWebhooks.map(webhook => 
        deliverWebhook(webhook, payload)
      );

      await Promise.allSettled(deliveryPromises);

      logger.info({
        event,
        webhookCount: relevantWebhooks.length,
        payloadId: payload.id
      }, 'Webhook event triggered');

    } catch (error) {
      logger.error({ error, event }, 'Failed to trigger webhook event');
      // Don't throw - webhook failures shouldn't break main flow
    }
  }

  /**
   * Deliver webhook to specific endpoint
   */
  async function deliverWebhook(
    webhook: WebhookEndpoint,
    payload: WebhookPayload
  ): Promise<WebhookDelivery> {
    const delivery: WebhookDelivery = {
      id: `del_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
      webhookId: webhook.id,
      event: payload.event,
      payload,
      url: webhook.url,
      attempts: 0,
      success: false,
      duration: 0,
      createdAt: new Date()
    };

    let lastError: string | undefined;

    for (let attempt = 1; attempt <= webhook.retryConfig.maxRetries + 1; attempt++) {
      delivery.attempts = attempt;
      
      const startTime = Date.now();
      
      try {
        // Generate signature
        const signature = generateSignature(payload, webhook.secret);
        
        // Prepare headers
        const headers = {
          'Content-Type': 'application/json',
          'User-Agent': 'Zoptal-Webhooks/1.0',
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': payload.event,
          'X-Webhook-ID': payload.id,
          'X-Webhook-Timestamp': payload.timestamp,
          ...webhook.headers
        };

        // Make HTTP request
        const response = await axios.post(webhook.url, payload, {
          headers,
          timeout: webhook.timeout,
          validateStatus: () => true // Accept all status codes
        });

        delivery.duration = Date.now() - startTime;
        delivery.httpStatus = response.status;
        delivery.responseBody = typeof response.data === 'string' 
          ? response.data.substring(0, 1000) // Limit response body size
          : JSON.stringify(response.data).substring(0, 1000);
        delivery.responseHeaders = response.headers as Record<string, string>;
        delivery.deliveredAt = new Date();

        if (response.status >= 200 && response.status < 300) {
          delivery.success = true;
          break;
        } else {
          lastError = `HTTP ${response.status}: ${response.statusText}`;
        }

      } catch (error) {
        delivery.duration = Date.now() - startTime;
        
        if (axios.isAxiosError(error)) {
          lastError = error.code === 'ECONNABORTED' 
            ? 'Request timeout'
            : error.message;
          delivery.httpStatus = error.response?.status;
        } else {
          lastError = error instanceof Error ? error.message : 'Unknown error';
        }
      }

      // If not successful and not the last attempt, wait before retry
      if (!delivery.success && attempt <= webhook.retryConfig.maxRetries) {
        const delay = webhook.retryConfig.retryDelayMs * 
          Math.pow(webhook.retryConfig.backoffMultiplier, attempt - 1);
        
        logger.debug({
          webhookId: webhook.id,
          attempt,
          delay,
          error: lastError
        }, 'Webhook delivery failed, retrying');
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    delivery.error = lastError;

    // Update webhook statistics
    if (delivery.success) {
      webhook.successCount++;
      webhook.lastTriggered = new Date();
    } else {
      webhook.failureCount++;
    }

    // Store delivery record
    await prisma.activityLog.create({
      data: {
        userId: 'system',
        action: 'WEBHOOK_DELIVERY',
        category: 'WEBHOOK',
        ip: '127.0.0.1',
        userAgent: 'System',
        metadata: delivery
      }
    });

    // Update webhook statistics
    await prisma.activityLog.create({
      data: {
        userId: 'system',
        action: 'WEBHOOK_ENDPOINT_UPDATED',
        category: 'WEBHOOK',
        ip: '127.0.0.1',
        userAgent: 'System',
        metadata: webhook
      }
    });

    logger.info({
      webhookId: webhook.id,
      deliveryId: delivery.id,
      success: delivery.success,
      attempts: delivery.attempts,
      duration: delivery.duration,
      httpStatus: delivery.httpStatus
    }, 'Webhook delivery completed');

    return delivery;
  }

  /**
   * Get webhook deliveries
   */
  async function getWebhookDeliveries(
    webhookId?: string,
    limit: number = 50
  ): Promise<WebhookDelivery[]> {
    try {
      const whereClause: any = {
        action: 'WEBHOOK_DELIVERY',
        category: 'WEBHOOK'
      };

      if (webhookId) {
        whereClause.metadata = {
          path: ['webhookId'],
          equals: webhookId
        };
      }

      const activities = await prisma.activityLog.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: limit
      });

      return activities.map(activity => activity.metadata as WebhookDelivery);

    } catch (error) {
      logger.error({ error, webhookId }, 'Failed to get webhook deliveries');
      throw error;
    }
  }

  /**
   * Test webhook endpoint
   */
  async function testWebhookEndpoint(webhookId: string): Promise<WebhookDelivery> {
    try {
      const webhook = await getWebhookEndpoint(webhookId);
      if (!webhook) {
        throw new Error('Webhook endpoint not found');
      }

      const testPayload: WebhookPayload = {
        id: `test_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
        event: 'user.login',
        timestamp: new Date().toISOString(),
        data: {
          test: true,
          message: 'This is a test webhook delivery'
        },
        user: {
          id: 'test_user',
          email: 'test@example.com',
          profile: {
            firstName: 'Test',
            lastName: 'User'
          }
        },
        metadata: {
          source: 'webhook_test'
        }
      };

      return await deliverWebhook(webhook, testPayload);

    } catch (error) {
      logger.error({ error, webhookId }, 'Failed to test webhook endpoint');
      throw error;
    }
  }

  /**
   * Get webhook statistics
   */
  async function getWebhookStatistics(webhookId?: string): Promise<{
    totalDeliveries: number;
    successfulDeliveries: number;
    failedDeliveries: number;
    averageResponseTime: number;
    successRate: number;
    recentEvents: Array<{
      event: WebhookEvent;
      count: number;
    }>;
    errorSummary: Array<{
      error: string;
      count: number;
    }>;
  }> {
    try {
      const whereClause: any = {
        action: 'WEBHOOK_DELIVERY',
        category: 'WEBHOOK',
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      };

      if (webhookId) {
        whereClause.metadata = {
          path: ['webhookId'],
          equals: webhookId
        };
      }

      const deliveries = await prisma.activityLog.findMany({
        where: whereClause
      });

      const deliveryData = deliveries.map(d => d.metadata as WebhookDelivery);

      const totalDeliveries = deliveryData.length;
      const successfulDeliveries = deliveryData.filter(d => d.success).length;
      const failedDeliveries = totalDeliveries - successfulDeliveries;
      
      const averageResponseTime = totalDeliveries > 0
        ? deliveryData.reduce((sum, d) => sum + d.duration, 0) / totalDeliveries
        : 0;
      
      const successRate = totalDeliveries > 0 ? (successfulDeliveries / totalDeliveries) * 100 : 0;

      // Recent events summary
      const eventCounts = deliveryData.reduce((acc, delivery) => {
        acc[delivery.event] = (acc[delivery.event] || 0) + 1;
        return acc;
      }, {} as Record<WebhookEvent, number>);

      const recentEvents = Object.entries(eventCounts)
        .map(([event, count]) => ({ event: event as WebhookEvent, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Error summary
      const errorCounts = deliveryData
        .filter(d => !d.success && d.error)
        .reduce((acc, delivery) => {
          const error = delivery.error!;
          acc[error] = (acc[error] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

      const errorSummary = Object.entries(errorCounts)
        .map(([error, count]) => ({ error, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        totalDeliveries,
        successfulDeliveries,
        failedDeliveries,
        averageResponseTime: Math.round(averageResponseTime),
        successRate: Math.round(successRate * 100) / 100,
        recentEvents,
        errorSummary
      };

    } catch (error) {
      logger.error({ error, webhookId }, 'Failed to get webhook statistics');
      throw error;
    }
  }

  /**
   * Helper functions
   */
  function generateWebhookSecret(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  function generateSignature(payload: WebhookPayload, secret: string): string {
    const body = JSON.stringify(payload);
    return `sha256=${crypto.createHmac('sha256', secret).update(body).digest('hex')}`;
  }

  return {
    createWebhookEndpoint,
    updateWebhookEndpoint,
    deleteWebhookEndpoint,
    getWebhookEndpoint,
    listWebhookEndpoints,
    triggerWebhook,
    getWebhookDeliveries,
    testWebhookEndpoint,
    getWebhookStatistics,
    
    // Utility functions
    generateWebhookSecret,
    generateSignature
  };
}

// Type exports
export type WebhookService = ReturnType<typeof createWebhookService>;