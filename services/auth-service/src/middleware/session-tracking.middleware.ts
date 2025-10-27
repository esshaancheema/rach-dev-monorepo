import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { logger } from '../utils/logger';
import { createSessionAnalyticsService, SessionEventType } from '../services/session-analytics.service';

export interface SessionTrackingOptions {
  enableTracking: boolean;
  trackPageViews: boolean;
  trackApiAccess: boolean;
  trackFeatureUsage: boolean;
  excludePaths: string[];
  sampleRate: number; // 0-1, for performance
  enableRealTimeMetrics: boolean;
  sessionTimeout: number; // minutes
}

const defaultOptions: SessionTrackingOptions = {
  enableTracking: true,
  trackPageViews: false, // Typically handled by frontend
  trackApiAccess: true,
  trackFeatureUsage: true,
  excludePaths: [
    '/health',
    '/ready',
    '/metrics',
    '/favicon.ico',
    '/api/avatars/', // Static file serving
    '/docs'
  ],
  sampleRate: 1.0,
  enableRealTimeMetrics: true,
  sessionTimeout: 30 // 30 minutes
};

/**
 * Session tracking middleware for analytics
 */
export async function sessionTrackingMiddleware(
  fastify: FastifyInstance,
  options: Partial<SessionTrackingOptions> = {}
) {
  const config = { ...defaultOptions, ...options };
  
  if (!config.enableTracking) {
    logger.info('Session tracking disabled');
    return;
  }

  const sessionAnalyticsService = createSessionAnalyticsService({
    prisma: fastify.prisma,
    redis: fastify.redis
  });

  /**
   * Check if path should be tracked
   */
  function shouldTrackPath(path: string): boolean {
    // Skip excluded paths
    for (const excludePath of config.excludePaths) {
      if (path.startsWith(excludePath)) {
        return false;
      }
    }
    
    // Apply sampling
    if (config.sampleRate < 1.0 && Math.random() > config.sampleRate) {
      return false;
    }
    
    return true;
  }

  /**
   * Get or create session ID
   */
  function getSessionId(request: FastifyRequest): string {
    // Try to get session ID from cookie
    let sessionId = request.cookies['session_id'];
    
    if (!sessionId) {
      // Generate new session ID
      sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`;
    }
    
    return sessionId;
  }

  /**
   * Determine event type based on request
   */
  function getEventType(request: FastifyRequest): SessionEventType {
    const path = request.routerPath || request.url;
    const method = request.method;

    // Authentication endpoints
    if (path.includes('/auth/login')) return 'login';
    if (path.includes('/auth/logout')) return 'logout';
    if (path.includes('/auth/refresh')) return 'session_extend';

    // API access
    if (path.startsWith('/api/')) return 'api_access';

    // Feature usage (specific endpoints)
    if (path.includes('/export') || path.includes('/preferences') || path.includes('/avatar')) {
      return 'feature_usage';
    }

    // Default to page view for GET requests, API access for others
    return method === 'GET' ? 'page_view' : 'api_access';
  }

  /**
   * Pre-request hook for session tracking
   */
  fastify.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const path = request.routerPath || request.url;
      
      if (!shouldTrackPath(path)) {
        return;
      }

      const sessionId = getSessionId(request);
      
      // Set session ID cookie if not present
      if (!request.cookies['session_id']) {
        reply.setCookie('session_id', sessionId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: config.sessionTimeout * 60 // Convert minutes to seconds
        });
      }

      // Store session info in request context
      (request as any).sessionTracking = {
        sessionId,
        startTime: Date.now(),
        path,
        tracked: true
      };

    } catch (error) {
      logger.error({ error, path: request.url }, 'Session tracking onRequest error');
      // Don't fail the request if tracking fails
    }
  });

  /**
   * Post-request hook for session analytics
   */
  fastify.addHook('onResponse', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const sessionTracking = (request as any).sessionTracking;
      if (!sessionTracking?.tracked) {
        return;
      }

      const user = (request as any).user;
      if (!user) {
        return; // Only track authenticated users for detailed analytics
      }

      const eventType = getEventType(request);
      const responseTime = reply.getResponseTime();
      const statusCode = reply.statusCode;

      // Determine if this is suspicious activity
      let finalEventType = eventType;
      if (statusCode === 401 || statusCode === 403) {
        finalEventType = 'failed_login';
      } else if (statusCode >= 400 && statusCode < 500) {
        // Don't track client errors as events
        return;
      }

      // Track the session event
      await sessionAnalyticsService.trackSessionEvent({
        userId: user.id,
        sessionId: sessionTracking.sessionId,
        eventType: finalEventType,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'] || 'Unknown',
        metadata: {
          path: sessionTracking.path,
          method: request.method,
          statusCode,
          responseTime,
          timestamp: new Date().toISOString(),
          userAgent: request.headers['user-agent'],
          referer: request.headers['referer'],
          requestId: request.headers['x-request-id']
        }
      });

      // Update session activity timestamp in Redis
      if (config.enableRealTimeMetrics) {
        const activeSessionKey = `active_session:${sessionTracking.sessionId}`;
        await fastify.redis.setex(activeSessionKey, config.sessionTimeout * 60, JSON.stringify({
          userId: user.id,
          lastActivity: new Date().toISOString(),
          ipAddress: request.ip,
          userAgent: request.headers['user-agent']
        }));

        // Update user's active sessions set
        const userSessionsKey = `active_sessions:${user.id}`;
        await fastify.redis.sadd(userSessionsKey, sessionTracking.sessionId);
        await fastify.redis.expire(userSessionsKey, config.sessionTimeout * 60);
      }

    } catch (error) {
      logger.error({ 
        error, 
        path: request.url,
        userId: (request as any).user?.id 
      }, 'Session tracking onResponse error');
      // Don't fail the request if tracking fails
    }
  });

  /**
   * Handle session events from other parts of the application
   */
  fastify.decorate('trackSessionEvent', async (params: {
    userId: string;
    eventType: SessionEventType;
    request: FastifyRequest;
    metadata?: Record<string, any>;
  }) => {
    try {
      const { userId, eventType, request, metadata = {} } = params;
      const sessionTracking = (request as any).sessionTracking;
      
      if (!sessionTracking) {
        logger.warn({ userId, eventType }, 'Attempted to track event without session context');
        return;
      }

      await sessionAnalyticsService.trackSessionEvent({
        userId,
        sessionId: sessionTracking.sessionId,
        eventType,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'] || 'Unknown',
        metadata: {
          ...metadata,
          path: request.routerPath || request.url,
          method: request.method,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error({ error, params }, 'Failed to track session event');
    }
  });

  /**
   * Session cleanup job
   */
  const cleanupInterval = setInterval(async () => {
    try {
      // Clean up expired sessions from Redis
      const pattern = 'active_session:*';
      const keys = await fastify.redis.keys(pattern);
      
      for (const key of keys) {
        const ttl = await fastify.redis.ttl(key);
        if (ttl === -1) {
          // Key exists but has no expiration, clean it up
          await fastify.redis.del(key);
        }
      }

      // Clean up user session sets
      const userSessionPattern = 'active_sessions:*';
      const userSessionKeys = await fastify.redis.keys(userSessionPattern);
      
      for (const key of userSessionKeys) {
        const sessionIds = await fastify.redis.smembers(key);
        for (const sessionId of sessionIds) {
          const sessionKey = `active_session:${sessionId}`;
          const exists = await fastify.redis.exists(sessionKey);
          if (!exists) {
            await fastify.redis.srem(key, sessionId);
          }
        }
      }

    } catch (error) {
      logger.error({ error }, 'Session cleanup error');
    }
  }, 5 * 60 * 1000); // Run every 5 minutes

  // Clean up on app shutdown
  fastify.addHook('onClose', async () => {
    clearInterval(cleanupInterval);
  });

  logger.info('Session tracking middleware initialized', {
    enableTracking: config.enableTracking,
    trackApiAccess: config.trackApiAccess,
    trackFeatureUsage: config.trackFeatureUsage,
    sampleRate: config.sampleRate,
    sessionTimeout: config.sessionTimeout,
    excludePathsCount: config.excludePaths.length
  });
}

/**
 * Session tracking plugin for Fastify
 */
export const sessionTrackingPlugin = async (
  fastify: FastifyInstance,
  options: Partial<SessionTrackingOptions> = {}
) => {
  await sessionTrackingMiddleware(fastify, options);
};

/**
 * Utility functions for manual session event tracking
 */
export const sessionTrackingUtils = {
  /**
   * Track login event
   */
  trackLogin: async (fastify: FastifyInstance, userId: string, request: FastifyRequest) => {
    await (fastify as any).trackSessionEvent({
      userId,
      eventType: 'login' as SessionEventType,
      request,
      metadata: {
        loginMethod: 'password',
        successful: true
      }
    });
  },

  /**
   * Track logout event
   */
  trackLogout: async (fastify: FastifyInstance, userId: string, request: FastifyRequest) => {
    await (fastify as any).trackSessionEvent({
      userId,
      eventType: 'logout' as SessionEventType,
      request,
      metadata: {
        logoutMethod: 'manual'
      }
    });
  },

  /**
   * Track suspicious activity
   */
  trackSuspiciousActivity: async (
    fastify: FastifyInstance, 
    userId: string, 
    request: FastifyRequest, 
    reason: string
  ) => {
    await (fastify as any).trackSessionEvent({
      userId,
      eventType: 'suspicious_activity' as SessionEventType,
      request,
      metadata: {
        reason,
        timestamp: new Date().toISOString(),
        severity: 'medium'
      }
    });
  },

  /**
   * Track session timeout
   */
  trackSessionTimeout: async (fastify: FastifyInstance, userId: string, sessionId: string) => {
    try {
      const sessionAnalyticsService = createSessionAnalyticsService({
        prisma: fastify.prisma,
        redis: fastify.redis
      });

      await sessionAnalyticsService.trackSessionEvent({
        userId,
        sessionId,
        eventType: 'session_timeout',
        ipAddress: '127.0.0.1',
        userAgent: 'System',
        metadata: {
          reason: 'timeout',
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error({ error, userId, sessionId }, 'Failed to track session timeout');
    }
  }
};