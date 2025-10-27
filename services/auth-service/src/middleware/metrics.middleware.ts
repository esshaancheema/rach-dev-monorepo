import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { MetricsService } from '../services/metrics.service';
import { logger } from '../utils/logger';

export interface MetricsMiddlewareOptions {
  metricsService: MetricsService;
  enableDetailedMetrics?: boolean;
  excludePaths?: string[];
}

/**
 * Middleware to collect request metrics automatically
 */
export function createMetricsMiddleware(options: MetricsMiddlewareOptions) {
  const { metricsService, enableDetailedMetrics = true, excludePaths = [] } = options;

  return async function metricsMiddleware(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const startTime = Date.now();
    const path = request.routeOptions?.url || request.url;
    const method = request.method;

    // Skip metrics collection for excluded paths
    if (excludePaths.some(excludePath => path.startsWith(excludePath))) {
      return;
    }

    try {
      // Record request start
      await metricsService.incrementCounter('http_requests_total', {
        method,
        path,
      });

      // Track concurrent requests
      await metricsService.incrementCounter('http_requests_concurrent');

      // Use reply's raw response events for Fastify v4 compatibility
      reply.raw.on('finish', async () => {
        try {
          const duration = Date.now() - startTime;
          const statusCode = reply.statusCode.toString();
          const statusClass = `${Math.floor(reply.statusCode / 100)}xx`;

          // Record response time
          await metricsService.recordTiming('http_request_duration', duration, {
            method,
            path,
            status_code: statusCode,
            status_class: statusClass,
          });

          // Record response status
          await metricsService.incrementCounter('http_responses_total', {
            method,
            path,
            status_code: statusCode,
            status_class: statusClass,
          });

          // Record error rates
          if (reply.statusCode >= 400) {
            await metricsService.incrementCounter('http_errors_total', {
              method,
              path,
              status_code: statusCode,
              error_type: reply.statusCode >= 500 ? 'server_error' : 'client_error',
            });
          }

          // Record detailed metrics if enabled
          if (enableDetailedMetrics) {
            await recordDetailedMetrics(metricsService, request, reply, duration);
          }

          // Decrement concurrent requests
          await metricsService.incrementCounter('http_requests_concurrent', { decrement: 'true' });

        } catch (error) {
          logger.error('Failed to record response metrics:', error);
        }
      });

      // Handle request errors using raw error event
      reply.raw.on('error', async (error) => {
        try {
          const duration = Date.now() - startTime;

          await metricsService.incrementCounter('http_request_errors_total', {
            method,
            path,
            error_type: error.name || 'unknown',
          });

          await metricsService.recordTiming('http_request_error_duration', duration, {
            method,
            path,
            error_type: error.name || 'unknown',
          });

          // Decrement concurrent requests
          await metricsService.incrementCounter('http_requests_concurrent', { decrement: 'true' });

        } catch (metricsError) {
          logger.error('Failed to record error metrics:', metricsError);
        }
      });

    } catch (error) {
      logger.error('Failed to setup metrics middleware:', error);
    }
  };
}

/**
 * Record detailed metrics for specific endpoints
 */
async function recordDetailedMetrics(
  metricsService: MetricsService,
  request: FastifyRequest,
  reply: FastifyReply,
  duration: number
): Promise<void> {
  const path = request.routerPath || request.url;

  try {
    // Authentication-specific metrics
    if (path.includes('/auth/')) {
      await recordAuthMetrics(metricsService, request, reply, path);
    }

    // Admin-specific metrics
    if (path.includes('/admin/')) {
      await recordAdminMetrics(metricsService, request, reply, path);
    }

    // OAuth-specific metrics
    if (path.includes('/oauth/')) {
      await recordOAuthMetrics(metricsService, request, reply, path);
    }

    // 2FA-specific metrics
    if (path.includes('/2fa/')) {
      await record2FAMetrics(metricsService, request, reply, path);
    }
  } catch (error) {
    logger.error('Failed to record detailed metrics:', error);
  }
}

/**
 * Record authentication-specific metrics
 */
async function recordAuthMetrics(
  metricsService: MetricsService,
  request: FastifyRequest,
  reply: FastifyReply,
  path: string
): Promise<void> {
  const method = request.method;
  const statusCode = reply.statusCode;

  // Login metrics
  if (path.includes('/login') && method === 'POST') {
    if (statusCode === 200) {
      await metricsService.incrementCounter('auth_login_success_total');
      
      // Track device metrics if available in response
      const responseData = (reply as any).payload || {};
      if (responseData.device?.isNewDevice) {
        await metricsService.incrementCounter('auth_new_device_login_total');
      }
      if (responseData.device?.riskScore >= 70) {
        await metricsService.incrementCounter('auth_high_risk_login_total');
      }
    } else {
      await metricsService.incrementCounter('auth_login_failure_total', {
        status_code: statusCode.toString(),
      });
    }
  }

  // Registration metrics
  if (path.includes('/register') && method === 'POST') {
    if (statusCode === 201) {
      await metricsService.incrementCounter('auth_registration_success_total');
    } else {
      await metricsService.incrementCounter('auth_registration_failure_total', {
        status_code: statusCode.toString(),
      });
    }
  }

  // Password reset metrics
  if (path.includes('/forgot-password') && method === 'POST') {
    await metricsService.incrementCounter('auth_password_reset_requested_total');
  }

  if (path.includes('/reset-password') && method === 'POST') {
    if (statusCode === 200) {
      await metricsService.incrementCounter('auth_password_reset_success_total');
    } else {
      await metricsService.incrementCounter('auth_password_reset_failure_total');
    }
  }

  // Email verification metrics
  if (path.includes('/verify-email') && method === 'POST') {
    if (statusCode === 200) {
      await metricsService.incrementCounter('auth_email_verification_success_total');
    } else {
      await metricsService.incrementCounter('auth_email_verification_failure_total');
    }
  }
}

/**
 * Record admin-specific metrics
 */
async function recordAdminMetrics(
  metricsService: MetricsService,
  request: FastifyRequest,
  reply: FastifyReply,
  path: string
): Promise<void> {
  const method = request.method;
  const statusCode = reply.statusCode;

  // General admin action tracking
  await metricsService.incrementCounter('admin_actions_total', {
    method,
    endpoint: path.split('/').slice(-1)[0] || 'unknown',
    status_code: statusCode.toString(),
  });

  // User management actions
  if (path.includes('/users/')) {
    if (method === 'GET') {
      await metricsService.incrementCounter('admin_user_queries_total');
    } else if (method === 'PUT' || method === 'PATCH') {
      await metricsService.incrementCounter('admin_user_updates_total');
    } else if (method === 'DELETE') {
      await metricsService.incrementCounter('admin_user_deletions_total');
    }
  }

  // Device management actions
  if (path.includes('/devices/')) {
    if (path.includes('/block')) {
      await metricsService.incrementCounter('admin_device_blocks_total');
    } else if (path.includes('/trust')) {
      await metricsService.incrementCounter('admin_device_trusts_total');
    }
  }
}

/**
 * Record OAuth-specific metrics
 */
async function recordOAuthMetrics(
  metricsService: MetricsService,
  request: FastifyRequest,
  reply: FastifyReply,
  path: string
): Promise<void> {
  const statusCode = reply.statusCode;

  // OAuth provider metrics
  const provider = extractOAuthProvider(path);
  if (provider) {
    if (statusCode === 200 || statusCode === 302) {
      await metricsService.incrementCounter('oauth_success_total', { provider });
    } else {
      await metricsService.incrementCounter('oauth_failure_total', { 
        provider,
        status_code: statusCode.toString(),
      });
    }
  }
}

/**
 * Record 2FA-specific metrics
 */
async function record2FAMetrics(
  metricsService: MetricsService,
  request: FastifyRequest,
  reply: FastifyReply,
  path: string
): Promise<void> {
  const method = request.method;
  const statusCode = reply.statusCode;

  if (path.includes('/setup') && method === 'POST') {
    if (statusCode === 200) {
      await metricsService.incrementCounter('2fa_setup_success_total');
    } else {
      await metricsService.incrementCounter('2fa_setup_failure_total');
    }
  }

  if (path.includes('/verify') && method === 'POST') {
    if (statusCode === 200) {
      await metricsService.incrementCounter('2fa_verification_success_total');
    } else {
      await metricsService.incrementCounter('2fa_verification_failure_total');
    }
  }

  if (path.includes('/disable') && method === 'POST') {
    await metricsService.incrementCounter('2fa_disabled_total');
  }
}

/**
 * Extract OAuth provider from path
 */
function extractOAuthProvider(path: string): string | null {
  const providers = ['google', 'github', 'microsoft', 'apple'];
  for (const provider of providers) {
    if (path.includes(provider)) {
      return provider;
    }
  }
  return null;
}

/**
 * Plugin to register metrics middleware with Fastify
 */
export async function registerMetricsMiddleware(
  fastify: FastifyInstance,
  options: MetricsMiddlewareOptions
): Promise<void> {
  // Register the middleware as a preHandler hook
  fastify.addHook('preHandler', options.enableDetailedMetrics
    ? createMetricsMiddleware(options)
    : createBasicMetricsMiddleware(options)
  );

  // Register shutdown hook to flush metrics
  fastify.addHook('onClose', async () => {
    try {
      // Flush any remaining metrics
      await options.metricsService.getRealtimeMetrics();
      logger.info('Metrics flushed on service shutdown');
    } catch (error) {
      logger.error('Failed to flush metrics on shutdown:', error);
    }
  });
}

/**
 * Basic metrics middleware with minimal overhead
 */
function createBasicMetricsMiddleware(options: MetricsMiddlewareOptions) {
  const { metricsService, excludePaths = [] } = options;

  return async function basicMetricsMiddleware(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const path = request.routerPath || request.url;

    // Skip metrics collection for excluded paths
    if (excludePaths.some(excludePath => path.startsWith(excludePath))) {
      return;
    }

    const startTime = Date.now();

    // Record basic request metrics
    await metricsService.incrementCounter('requests_total', {
      method: request.method,
    });

    reply.raw.on('finish', async () => {
      try {
        const duration = Date.now() - startTime;
        
        await metricsService.recordTiming('request_duration', duration);
        await metricsService.incrementCounter('responses_total', {
          status_class: `${Math.floor(reply.statusCode / 100)}xx`,
        });

        if (reply.statusCode >= 400) {
          await metricsService.incrementCounter('errors_total');
        }
      } catch (error) {
        // Silently fail to avoid impacting request processing
      }
    });
  };
}