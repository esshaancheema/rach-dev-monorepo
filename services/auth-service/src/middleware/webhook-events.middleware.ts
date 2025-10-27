import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { logger } from '../utils/logger';
import { createWebhookService, WebhookEvent } from '../services/webhook.service';

export interface WebhookEventsOptions {
  enableEventTracking: boolean;
  enableAutoTrigger: boolean;
  enableSecurityEvents: boolean;
  enableUserEvents: boolean;
  enableSystemEvents: boolean;
  excludeEvents: WebhookEvent[];
  rateLimitEvents: boolean;
  rateLimitWindow: number; // minutes
  rateLimitMax: number; // events per window
}

const defaultOptions: WebhookEventsOptions = {
  enableEventTracking: true,
  enableAutoTrigger: true,
  enableSecurityEvents: true,
  enableUserEvents: true,
  enableSystemEvents: false, // System events are typically triggered manually
  excludeEvents: [],
  rateLimitEvents: true,
  rateLimitWindow: 5, // 5 minutes
  rateLimitMax: 100 // max 100 events per 5 minutes per user
};

/**
 * Webhook events middleware for automatic event triggering
 */
export async function webhookEventsMiddleware(
  fastify: FastifyInstance,
  options: Partial<WebhookEventsOptions> = {}
) {
  const config = { ...defaultOptions, ...options };
  
  if (!config.enableEventTracking) {
    logger.info('Webhook event tracking disabled');
    return;
  }

  const webhookService = createWebhookService({
    prisma: fastify.prisma
  });

  /**
   * Check if event should be triggered
   */
  function shouldTriggerEvent(event: WebhookEvent): boolean {
    // Check if event is excluded
    if (config.excludeEvents.includes(event)) {
      return false;
    }

    // Check event type filters
    if (event.startsWith('user.') && !config.enableUserEvents) {
      return false;
    }

    if (event.startsWith('security.') && !config.enableSecurityEvents) {
      return false;
    }

    if (event.startsWith('system.') && !config.enableSystemEvents) {
      return false;
    }

    return true;
  }

  /**
   * Rate limit webhook events per user
   */
  async function checkRateLimit(userId: string): Promise<boolean> {
    if (!config.rateLimitEvents) {
      return true;
    }

    try {
      const key = `webhook_events_rate_limit:${userId}`;
      const current = await fastify.redis.incr(key);
      
      if (current === 1) {
        await fastify.redis.expire(key, config.rateLimitWindow * 60);
      }

      return current <= config.rateLimitMax;
    } catch (error) {
      logger.error({ error, userId }, 'Failed to check webhook event rate limit');
      return true; // Allow event on error
    }
  }

  /**
   * Trigger webhook event with rate limiting and validation
   */
  async function triggerWebhookEvent(
    event: WebhookEvent,
    data: Record<string, any>,
    user?: any,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      if (!config.enableAutoTrigger || !shouldTriggerEvent(event)) {
        return;
      }

      // Rate limit user events
      if (user && !await checkRateLimit(user.id)) {
        logger.warn({ userId: user.id, event }, 'Webhook event rate limit exceeded');
        return;
      }

      // Prepare user data for webhook
      const webhookUser = user ? {
        id: user.id,
        email: user.email,
        profile: {
          firstName: user.profile?.firstName,
          lastName: user.profile?.lastName
        }
      } : undefined;

      // Trigger webhook
      await webhookService.triggerWebhook(event, data, webhookUser, metadata);

    } catch (error) {
      logger.error({ error, event, userId: user?.id }, 'Failed to trigger webhook event');
      // Don't throw - webhook failures shouldn't break main flow
    }
  }

  /**
   * Register webhook event decorator
   */
  fastify.decorate('triggerWebhookEvent', triggerWebhookEvent);

  /**
   * Auto-trigger events on specific routes
   */
  fastify.addHook('onResponse', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const path = request.routerPath || request.url;
      const method = request.method;
      const statusCode = reply.statusCode;
      const user = (request as any).user;

      // Don't trigger events for non-successful responses (except for specific cases)
      if (statusCode >= 400 && statusCode !== 401 && statusCode !== 403) {
        return;
      }

      // Determine event type based on route and response
      let event: WebhookEvent | null = null;
      let eventData: Record<string, any> = {};

      // Authentication events
      if (path.includes('/auth/login') && method === 'POST') {
        if (statusCode === 200) {
          event = 'user.login';
          eventData = {
            loginMethod: 'password',
            deviceInfo: {
              userAgent: request.headers['user-agent'],
              ip: request.ip
            }
          };
        } else if (statusCode === 401) {
          event = 'user.login_failed';
          eventData = {
            reason: 'invalid_credentials',
            ip: request.ip,
            userAgent: request.headers['user-agent']
          };
        }
      }

      if (path.includes('/auth/logout') && method === 'POST' && statusCode === 200) {
        event = 'user.logout';
        eventData = {
          logoutMethod: 'manual'
        };
      }

      if (path.includes('/auth/register') && method === 'POST' && statusCode === 201) {
        event = 'user.created';
        eventData = {
          registrationMethod: 'email',
          source: 'web'
        };
      }

      if (path.includes('/auth/verify-email') && method === 'POST' && statusCode === 200) {
        event = 'user.email_verified';
        eventData = {
          verificationMethod: 'email_link'
        };
      }

      if (path.includes('/auth/verify-phone') && method === 'POST' && statusCode === 200) {
        event = 'user.phone_verified';
        eventData = {
          verificationMethod: 'sms_code'
        };
      }

      if (path.includes('/auth/forgot-password') && method === 'POST' && statusCode === 200) {
        event = 'user.password_reset_requested';
        eventData = {
          requestMethod: 'email'
        };
      }

      if (path.includes('/auth/reset-password') && method === 'POST' && statusCode === 200) {
        event = 'user.password_reset_completed';
        eventData = {
          resetMethod: 'email_link'
        };
      }

      // User profile events
      if (path.includes('/users/profile') && method === 'PUT' && statusCode === 200) {
        event = 'user.updated';
        eventData = {
          updateType: 'profile',
          fields: Object.keys(request.body || {})
        };
      }

      if (path.includes('/users/preferences') && method === 'PUT' && statusCode === 200) {
        event = 'user.preferences_updated';
        eventData = {
          updateType: 'preferences',
          categories: Object.keys(request.body || {})
        };
      }

      if (path.includes('/avatar/upload') && method === 'POST' && statusCode === 201) {
        event = 'user.avatar_updated';
        eventData = {
          updateType: 'upload',
          source: 'file_upload'
        };
      }

      if (path.includes('/avatar/gravatar') && method === 'POST' && statusCode === 201) {
        event = 'user.avatar_updated';
        eventData = {
          updateType: 'gravatar',
          source: 'gravatar'
        };
      }

      // Consent events
      if (path.includes('/consent/preferences') && method === 'PUT' && statusCode === 200) {
        event = 'user.consent_updated';
        eventData = {
          updateType: 'preferences',
          categories: Object.keys((request.body as any)?.preferences || {})
        };
      }

      // Two-factor authentication events
      if (path.includes('/2fa/enable') && method === 'POST' && statusCode === 200) {
        event = 'user.two_factor_enabled';
        eventData = {
          method: 'totp'
        };
      }

      if (path.includes('/2fa/disable') && method === 'POST' && statusCode === 200) {
        event = 'user.two_factor_disabled';
        eventData = {
          method: 'totp'
        };
      }

      // Security events (rate limiting, account locks, etc.)
      if (statusCode === 429) {
        event = 'security.rate_limit_exceeded';
        eventData = {
          endpoint: path,
          ip: request.ip,
          userAgent: request.headers['user-agent']
        };
      }

      if (statusCode === 403 && path.includes('/admin/')) {
        // This could be an admin access attempt - check if it's suspicious
        eventData = {
          attemptedEndpoint: path,
          ip: request.ip,
          userAgent: request.headers['user-agent']
        };
      }

      // Trigger the event if determined
      if (event) {
        await triggerWebhookEvent(event, eventData, user, {
          timestamp: new Date().toISOString(),
          source: 'auto_trigger',
          requestId: request.headers['x-request-id'],
          path,
          method,
          statusCode
        });
      }

    } catch (error) {
      logger.error({ 
        error, 
        path: request.url,
        userId: (request as any).user?.id 
      }, 'Webhook events middleware error');
      // Don't fail the request if webhook triggering fails
    }
  });

  logger.info('Webhook events middleware initialized', {
    enableEventTracking: config.enableEventTracking,
    enableAutoTrigger: config.enableAutoTrigger,
    enableSecurityEvents: config.enableSecurityEvents,
    enableUserEvents: config.enableUserEvents,
    enableSystemEvents: config.enableSystemEvents,
    excludedEventsCount: config.excludeEvents.length,
    rateLimitEvents: config.rateLimitEvents
  });
}

/**
 * Webhook events plugin for Fastify
 */
export const webhookEventsPlugin = async (
  fastify: FastifyInstance,
  options: Partial<WebhookEventsOptions> = {}
) => {
  await webhookEventsMiddleware(fastify, options);
};

/**
 * Manual webhook event triggers for specific scenarios
 */
export const webhookEventTriggers = {
  /**
   * Trigger user account locked event
   */
  triggerAccountLocked: async (fastify: FastifyInstance, userId: string, reason: string) => {
    await (fastify as any).triggerWebhookEvent('user.account_locked', {
      reason,
      timestamp: new Date().toISOString(),
      lockDuration: '24h' // Default lock duration
    }, await getUserById(fastify, userId));
  },

  /**
   * Trigger user account unlocked event
   */
  triggerAccountUnlocked: async (fastify: FastifyInstance, userId: string, unlockedBy: string) => {
    await (fastify as any).triggerWebhookEvent('user.account_unlocked', {
      unlockedBy,
      timestamp: new Date().toISOString()
    }, await getUserById(fastify, userId));
  },

  /**
   * Trigger suspicious activity event
   */
  triggerSuspiciousActivity: async (
    fastify: FastifyInstance, 
    userId: string, 
    activityType: string,
    details: Record<string, any>
  ) => {
    await (fastify as any).triggerWebhookEvent('user.suspicious_activity', {
      activityType,
      details,
      timestamp: new Date().toISOString(),
      severity: details.severity || 'medium'
    }, await getUserById(fastify, userId));
  },

  /**
   * Trigger session expired event
   */
  triggerSessionExpired: async (fastify: FastifyInstance, userId: string, sessionId: string) => {
    await (fastify as any).triggerWebhookEvent('user.session_expired', {
      sessionId,
      reason: 'timeout',
      timestamp: new Date().toISOString()
    }, await getUserById(fastify, userId));
  },

  /**
   * Trigger security breach detected event
   */
  triggerSecurityBreach: async (
    fastify: FastifyInstance, 
    breachType: string, 
    affectedUsers: number,
    details: Record<string, any>
  ) => {
    await (fastify as any).triggerWebhookEvent('security.breach_detected', {
      breachType,
      affectedUsers,
      details,
      timestamp: new Date().toISOString(),
      severity: 'critical'
    }, undefined, {
      source: 'security_monitor',
      requiresImmedateAction: true
    });
  },

  /**
   * Trigger IP blocked event
   */
  triggerIPBlocked: async (
    fastify: FastifyInstance, 
    ipAddress: string, 
    reason: string,
    blockDuration: number
  ) => {
    await (fastify as any).triggerWebhookEvent('security.ip_blocked', {
      ipAddress,
      reason,
      blockDuration,
      timestamp: new Date().toISOString()
    }, undefined, {
      source: 'security_filter',
      autoBlocked: true
    });
  },

  /**
   * Trigger system maintenance event
   */
  triggerMaintenanceMode: async (
    fastify: FastifyInstance, 
    maintenanceType: string,
    scheduledStart: Date,
    estimatedDuration: number
  ) => {
    await (fastify as any).triggerWebhookEvent('system.maintenance_mode', {
      maintenanceType,
      scheduledStart: scheduledStart.toISOString(),
      estimatedDuration,
      timestamp: new Date().toISOString()
    }, undefined, {
      source: 'system_admin',
      notifyUsers: true
    });
  },

  /**
   * Trigger backup completed event
   */
  triggerBackupCompleted: async (
    fastify: FastifyInstance, 
    backupType: string,
    backupSize: number,
    success: boolean
  ) => {
    await (fastify as any).triggerWebhookEvent('system.backup_completed', {
      backupType,
      backupSize,
      success,
      timestamp: new Date().toISOString()
    }, undefined, {
      source: 'backup_service',
      automated: true
    });
  }
};

/**
 * Helper function to get user by ID
 */
async function getUserById(fastify: FastifyInstance, userId: string) {
  try {
    const user = await fastify.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    });
    return user;
  } catch (error) {
    logger.error({ error, userId }, 'Failed to get user for webhook event');
    return null;
  }
}