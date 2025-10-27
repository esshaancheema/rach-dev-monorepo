import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import cookie from '@fastify/cookie';
import multipart from '@fastify/multipart';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { PrismaClient } from '@zoptal/database';
import { databaseManager, createOptimizedPrismaClient } from './utils/database';

import { authRoutes } from './routes/auth.routes';
import { twoFARoutes } from './routes/twofa.routes';
import { userRoutes } from './routes/user.routes';
import { oauthRoutes } from './routes/oauth.routes';
import { adminRoutes } from './routes/admin.routes';
import { metricsRoutes } from './routes/metrics.routes';
import { healthRoutes } from './routes/health.routes';
import { logsRoutes } from './routes/logs.routes';
import { emailTemplatesRoutes } from './routes/email-templates.routes';
import { userExportRoutes } from './routes/user-export.routes';
import { userPreferencesRoutes } from './routes/user-preferences.routes';
import { rateLimitAdminRoutes } from './routes/rate-limit-admin.routes';
import { dataRetentionRoutes } from './routes/data-retention.routes';
import { performanceMonitorRoutes } from './routes/performance-monitor.routes';
import { consentManagementRoutes } from './routes/consent-management.routes';
import { avatarRoutes } from './routes/avatar.routes';
import { sessionAnalyticsRoutes } from './routes/session-analytics.routes';
import { webhookRoutes } from './routes/webhook.routes';
import { adminDashboardRoutes } from './routes/admin-dashboard.routes';
import { degradationRoutes } from './routes/degradation.routes';
import { queueManagementRoutes } from './routes/queue-management.routes';
import { notificationPreferencesRoutes } from './routes/notification-preferences.routes';
import { errorManagementRoutes } from './routes/error-management.routes';
import { geoAdminRoutes } from './routes/geo-admin.routes';
import { fraudAdminRoutes } from './routes/fraud-admin.routes';
import { authProviderAdminRoutes } from './routes/auth-provider-admin.routes';
import deviceTrustRoutes from './routes/v1/device-trust';
import { adminRoutes as adminV1Routes } from './routes/v1/admin';
import { accountRecoveryRoutes } from './routes/v1/account-recovery';
import { samlRoutes } from './routes/v1/saml';
import { enhancedOAuthRoutes } from './routes/v1/enhanced-oauth';
import { magicLinkRoutes } from './routes/v1/magic-link';
import apiVersioningPlugin from './plugins/api-versioning.plugin';
// import { authRoutesV1 } from './routes/versions/v1/auth.routes';
// import { authRoutesV2 } from './routes/versions/v2/auth.routes';
import { errorHandler } from './middleware/error-handler';
import { requestLogger } from './middleware/request-logger';
import { registerMetricsMiddleware } from './middleware/metrics.middleware';
import { performanceMonitoringPlugin } from './middleware/performance-middleware';
import { consentPlugin } from './middleware/consent-middleware';
import { sessionTrackingPlugin } from './middleware/session-tracking.middleware';
import { webhookEventsPlugin } from './middleware/webhook-events.middleware';
import { circuitBreakerMiddleware } from './middleware/circuit-breaker.middleware';
import geoRestrictionsPlugin from './middleware/geo-restrictions.middleware';
import fraudDetectionPlugin from './middleware/fraud-detection.middleware';
import authProviderPlugin from './plugins/auth-provider.plugin';
import { createMetricsService } from './services/metrics.service';
import { createSoftDeleteService } from './services/soft-delete.service';
import { createForcePasswordResetService } from './services/force-password-reset.service';
import { createAuthService } from './services/auth.service';
import { createAdminService } from './services/admin.service';
import { enhancedEmailService } from './services/email-with-circuit-breaker.service';
import { enhancedSmsService } from './services/sms-with-circuit-breaker.service';
import { emailTemplateService } from './services/email-template.service';
import { createSessionService } from './services/session.service';
import { createActivityService } from './services/activity.service';
import { createPasswordHistoryService } from './services/password-history.service';
import { createDeviceFingerprintService } from './services/device-fingerprint.service';
import { tokenService } from './services/token.service';
import { createGracefulDegradationService } from './services/graceful-degradation.service';
import { messageQueueProcessor } from './services/message-queue-processor.service';
import { PasswordUtils } from './utils/password';
import { 
  rateLimiters, 
  dynamicRateLimitMiddleware, 
  ipBlockingMiddleware 
} from './middleware/rate-limit';
import { rateLimitPlugin } from './plugins';
import { 
  config, 
  serverConfig, 
  jwtConfig, 
  rateLimitConfig,
  databaseConfig 
} from './config';
import { swaggerConfig, swaggerUiConfig } from './config/swagger';
import { logger } from './utils/logger';
import { 
  RedisClient, 
  cacheManager, 
  rateLimitManager, 
  sessionManager 
} from './utils/redis';
import { getDatabaseHealth, getDatabaseStats } from './utils/database';
import { AUTH_CONSTANTS } from './config/constants';
import { requireRole } from './middleware/auth';

// Extend Fastify instance with custom decorations
declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
    redis: any;
    cache: typeof cacheManager;
    rateLimiter: typeof rateLimitManager;
    sessionManager: typeof sessionManager;
    authenticate: (request: any, reply: any) => Promise<void>;
    requireRole: (allowedRoles: string[]) => (request: any, reply: any) => Promise<void>;
    softDeleteService: ReturnType<typeof createSoftDeleteService>;
    forcePasswordResetService: ReturnType<typeof createForcePasswordResetService>;
    authService: ReturnType<typeof createAuthService>;
    adminService: ReturnType<typeof createAdminService>;
    emailService: typeof enhancedEmailService;
    smsService: typeof enhancedSmsService;
    activityService: ReturnType<typeof createActivityService>;
    passwordUtils: typeof PasswordUtils;
    emailTemplateService: typeof emailTemplateService;
    gracefulDegradationService: ReturnType<typeof createGracefulDegradationService>;
  }
}

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: config.LOG_LEVEL,
      serializers: {
        req: (req) => ({
          method: req.method,
          url: req.url,
          hostname: req.hostname,
          remoteAddress: req.ip,
          remotePort: req.socket?.remotePort,
        }),
        res: (res) => ({
          statusCode: res.statusCode,
        }),
      },
    },
    trustProxy: serverConfig.trustProxy,
    disableRequestLogging: !config.ENABLE_REQUEST_LOGGING,
    bodyLimit: 1048576, // 1MB limit
    keepAliveTimeout: 5000,
    connectionTimeout: 10000,
  });

  // Initialize database connection with connection pooling
  let prisma: PrismaClient;
  try {
    prisma = await createOptimizedPrismaClient();
    logger.info('✅ Database connection pool initialized successfully');
    
    // Log connection pool configuration
    const dbConfig = databaseManager.getConfigSummary();
    logger.info('📊 Database configuration:', dbConfig);
  } catch (error) {
    logger.error('❌ Failed to initialize database connection pool:', error);
    throw error;
  }

  // Initialize Redis connection
  try {
    await RedisClient.healthCheck();
    logger.info('✅ Redis connection verified');
  } catch (error) {
    logger.error('❌ Failed to connect to Redis:', error);
    throw error;
  }

  // Initialize metrics service
  const metricsService = createMetricsService({ prisma });

  // Initialize other services
  const emailService = enhancedEmailService;
  const smsService = enhancedSmsService;
  
  // Start message queue processor
  messageQueueProcessor.start();
  logger.info('✅ Message queue processor started');
  const sessionService = createSessionService({ prisma, redis: cacheManager });
  const activityService = createActivityService({ prisma });
  const passwordHistoryService = createPasswordHistoryService({ prisma });
  const deviceFingerprintService = createDeviceFingerprintService({ prisma });
  
  // Initialize graceful degradation service
  const gracefulDegradationService = createGracefulDegradationService({
    prisma,
    redis: RedisClient.getInstance()
  });
  
  const forcePasswordResetService = createForcePasswordResetService({
    prisma,
    emailService: enhancedEmailService as any,
    activityService,
    sessionService,
  });
  
  const authService = createAuthService({
    prisma,
    tokenService,
    emailService: enhancedEmailService as any,
    smsService: enhancedSmsService as any,
    passwordHistoryService,
    deviceFingerprintService,
    forcePasswordResetService,
  });
  
  const adminService = createAdminService({ 
    prisma,
    forcePasswordResetService,
  });
  
  const softDeleteService = createSoftDeleteService({
    prisma,
    sessionService,
    emailService: enhancedEmailService as any,
    activityService,
  });

  // Decorate Fastify instance with database and utilities
  app.decorate('prisma', prisma);
  app.decorate('redis', RedisClient.getInstance());
  app.decorate('cache', cacheManager);
  app.decorate('rateLimiter', rateLimitManager);
  app.decorate('sessionManager', sessionManager);
  app.decorate('softDeleteService', softDeleteService);
  app.decorate('forcePasswordResetService', forcePasswordResetService);
  app.decorate('authService', authService);
  app.decorate('adminService', adminService);
  app.decorate('emailService', emailService);
  app.decorate('smsService', smsService);
  app.decorate('activityService', activityService);
  app.decorate('passwordUtils', PasswordUtils);
  app.decorate('emailTemplateService', emailTemplateService);
  app.decorate('gracefulDegradationService', gracefulDegradationService);

  // Register Swagger (only in development) - TEMPORARILY DISABLED FOR TROUBLESHOOTING
  /*
  if (serverConfig.isDevelopment) {
    await app.register(swagger, swaggerConfig);
    await app.register(swaggerUi, swaggerUiConfig);
    logger.info('📚 Swagger documentation available at /docs');
  }
  */

  // Security middleware
  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        ...AUTH_CONSTANTS.SECURITY_HEADERS.CSP_DIRECTIVES,
      },
    },
    hsts: {
      maxAge: AUTH_CONSTANTS.SECURITY_HEADERS.HSTS_MAX_AGE,
      includeSubDomains: true,
      preload: true,
    },
    noSniff: true,
    frameguard: { action: 'deny' },
    xssFilter: true,
  });

  // CORS configuration
  const corsOrigins = config.CORS_ORIGIN.split(',').map(origin => origin.trim());
  await app.register(cors, {
    origin: serverConfig.isDevelopment 
      ? true 
      : corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-API-Key',
      'X-Client-Version',
    ],
  });

  // Cookie support for refresh tokens
  await app.register(cookie, {
    secret: config.SESSION_SECRET || config.JWT_SECRET,
    parseOptions: {
      secure: serverConfig.isProduction,
      httpOnly: true,
      sameSite: serverConfig.isProduction ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  });

  // Multipart form support
  await app.register(multipart, {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
      files: 1,
    },
  });

  // JWT configuration
  await app.register(jwt, {
    secret: jwtConfig.secret,
    sign: {
      algorithm: jwtConfig.algorithm,
      expiresIn: jwtConfig.accessTokenExpiry,
    },
    verify: {
      algorithms: [jwtConfig.algorithm],
    },
    cookie: {
      cookieName: 'refresh_token',
      signed: true,
    },
  });

  // Global rate limiting
  await app.register(rateLimit, {
    global: true,
    max: rateLimitConfig.maxRequests,
    timeWindow: rateLimitConfig.windowMs,
    allowList: ['127.0.0.1'],
    redis: RedisClient.getInstance(),
    nameSpace: 'auth_service_global_',
    continueExceeding: true,
    skipOnError: true, // Don't fail requests if Redis is down
    keyGenerator: (request) => {
      const forwarded = request.headers['x-forwarded-for'];
      const realIp = request.headers['x-real-ip'];
      const clientIp = Array.isArray(forwarded) ? forwarded[0] : forwarded ||
                       Array.isArray(realIp) ? realIp[0] : realIp ||
                       request.ip || 
                       'unknown';
      return String(clientIp);
    },
    errorResponseBuilder: (request, context) => ({
      code: 'RATE_LIMIT_EXCEEDED',
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Try again in ${Math.ceil(context.ttl / 1000)} seconds.`,
      retryAfter: Math.ceil(context.ttl / 1000),
    }),
  });

  // Enhanced request logging middleware (if enabled)
  if (config.ENABLE_REQUEST_LOGGING) {
    const { requestLoggerPlugin } = await import('./middleware/request-logger.middleware');
    await app.register(requestLoggerPlugin, {
      enableRequestLogging: true,
      enableResponseLogging: true,
      enableErrorLogging: true,
      enablePerformanceLogging: true,
      enableSecurityLogging: true,
      logLevel: config.LOG_LEVEL as any,
      excludePaths: ['/health', '/metrics', '/favicon.ico'],
      redactSensitiveData: config.NODE_ENV === 'production',
      slowRequestThreshold: 1000
    });
  }

  // Metrics collection middleware
  await registerMetricsMiddleware(app, {
    metricsService,
    enableDetailedMetrics: true,
    excludePaths: ['/health', '/ready', '/metrics'],
  });

  // Performance monitoring middleware
  await app.register(performanceMonitoringPlugin, {
    enableRequestMetrics: true,
    enableResponseTimeTracking: true,
    enableMemoryTracking: true,
    enableDatabaseTracking: true,
    slowRequestThreshold: 2000, // 2 seconds
    memoryWarningThreshold: 85, // 85%
    sampleRate: serverConfig.isProduction ? 0.1 : 1.0 // Sample 10% in production, 100% in development
  });

  // Rate limiting plugin (custom middleware)
  await app.register(rateLimitPlugin);

  // Authentication Provider plugin
  await app.register(authProviderPlugin, {
    autoRegisterProviders: true,
    enableEventLogging: true
  });

  // API Versioning plugin
  await app.register(apiVersioningPlugin, {
    defaultVersion: 'v1',
    versions: ['v1', 'v2'],
    deprecatedVersions: [], // v1 will be deprecated later
    enableStrictMode: false,
    versionHeader: 'accept-version'
  });

  // Circuit breaker middleware for graceful degradation
  await app.register(circuitBreakerMiddleware, {
    enableCircuitBreaker: true,
    enableHealthChecks: true,
    healthCheckInterval: 30000,
    circuitBreakerConfig: {
      database: {
        failureThreshold: 5,
        recoveryTimeout: 60000,
        monitoringPeriod: 30000,
        halfOpenMaxCalls: 3
      },
      redis: {
        failureThreshold: 3,
        recoveryTimeout: 30000,
        monitoringPeriod: 15000,
        halfOpenMaxCalls: 2
      },
      email: {
        failureThreshold: 10,
        recoveryTimeout: 120000,
        monitoringPeriod: 60000,
        halfOpenMaxCalls: 5
      },
      sms: {
        failureThreshold: 10,
        recoveryTimeout: 120000,
        monitoringPeriod: 60000,
        halfOpenMaxCalls: 5
      }
    }
  });

  // Session tracking middleware
  await app.register(sessionTrackingPlugin, {
    enableTracking: true,
    trackApiAccess: true,
    trackFeatureUsage: true,
    excludePaths: ['/health', '/ready', '/metrics', '/favicon.ico', '/docs', '/api/avatars/'],
    sampleRate: serverConfig.isProduction ? 0.1 : 1.0, // Sample 10% in production
    enableRealTimeMetrics: true,
    sessionTimeout: 30 // 30 minutes
  });

  // Webhook events middleware
  await app.register(webhookEventsPlugin, {
    enableEventTracking: true,
    enableAutoTrigger: true,
    enableSecurityEvents: true,
    enableUserEvents: true,
    enableSystemEvents: false, // System events triggered manually
    excludeEvents: [], // No events excluded by default
    rateLimitEvents: true,
    rateLimitWindow: 5, // 5 minutes
    rateLimitMax: 100 // max 100 events per 5 minutes per user
  });

  // Geographic restrictions middleware
  await app.register(geoRestrictionsPlugin, {
    enabled: true,
    exemptPaths: ['/health', '/ready', '/metrics', '/docs', '/api/docs'],
    trustProxyHeaders: true,
    logBlocked: true
  });

  // Fraud detection middleware
  await app.register(fraudDetectionPlugin, {
    enabled: true,
    exemptPaths: ['/health', '/ready', '/metrics', '/docs', '/api/docs'],
    blockThreshold: 80,
    verificationThreshold: 60,
    enableDeviceFingerprinting: true
  });

  // Consent management middleware
  await app.register(consentPlugin, {
    enableConsentChecking: serverConfig.isProduction,
    enableCookieConsent: true,
    enableAnalyticsGating: true,
    enableMarketingGating: true,
    redirectToConsent: false, // Return 403 instead of redirect for API
    consentRedirectUrl: '/consent',
    exemptPaths: [
      '/health',
      '/ready', 
      '/metrics',
      '/api',
      '/docs',
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/refresh',
      '/api/consent',
      '/privacy-policy',
      '/cookie-policy'
    ],
    requiredConsents: {
      '/api/users/export': ['data_processing'],
      '/api/admin/users/*/export': ['data_processing'],
      '/api/users/preferences/export': ['data_processing']
    }
  });

  // Authentication decorator
  app.decorate('authenticate', async function(request: any, reply: any) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ 
        error: 'Unauthorized',
        message: 'Invalid or missing authentication token' 
      });
    }
  });

  // Role-based authorization decorator
  app.decorate('requireRole', requireRole);

  // Register health check routes with enhanced diagnostics - DISABLED TEMPORARILY due to schema validation errors
  // await app.register(healthRoutes);

  // Basic metrics endpoint (for monitoring)
  app.get('/metrics', async () => {
    const memoryUsage = process.memoryUsage();
    const activeHandles = (process as any)._getActiveHandles?.()?.length || 0;
    const activeRequests = (process as any)._getActiveRequests?.()?.length || 0;

    // Get basic real-time metrics
    const realtimeMetrics = await metricsService.getRealtimeMetrics();

    // Get graceful degradation status
    const degradationStatus = gracefulDegradationService.getDegradationStatus();

    return {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        rss: memoryUsage.rss,
        heapUsed: memoryUsage.heapUsed,
        heapTotal: memoryUsage.heapTotal,
        external: memoryUsage.external,
      },
      process: {
        pid: process.pid,
        activeHandles,
        activeRequests,
      },
      nodeVersion: process.version,
      realtime: realtimeMetrics,
      degradation: degradationStatus,
    };
  });

  // API documentation endpoint
  app.get('/api', async () => {
    return {
      name: 'Zoptal Authentication Service',
      version: '1.0.0',
      description: 'High-performance authentication microservice',
      documentation: serverConfig.isDevelopment ? {
        interactive: `${config.API_URL}/docs`,
        openapi: `${config.API_URL}/docs/json`,
        schema: `${config.API_URL}/docs/yaml`
      } : undefined,
      endpoints: {
        authentication: {
          'POST /api/auth/register': 'User registration',
          'POST /api/auth/login': 'User login',
          'POST /api/auth/logout': 'User logout',
          'POST /api/auth/refresh': 'Refresh access token',
          'POST /api/auth/verify-email': 'Verify email address',
          'POST /api/auth/verify-phone': 'Verify phone number',
          'POST /api/auth/forgot-password': 'Request password reset',
          'POST /api/auth/reset-password': 'Reset password',
          'GET /api/auth/me': 'Get current user info',
        },
        oauth: {
          'GET /api/oauth/google': 'Google OAuth initiation',
          'GET /api/oauth/google/callback': 'Google OAuth callback',
          'GET /api/oauth/github': 'GitHub OAuth initiation',
          'GET /api/oauth/github/callback': 'GitHub OAuth callback',
        },
        users: {
          'GET /api/users/profile': 'Get user profile',
          'PUT /api/users/profile': 'Update user profile',
          'DELETE /api/users/account': 'Soft delete user account',
          'POST /api/users/restore': 'Restore deleted account',
          'GET /api/users/deletion-status/:email': 'Check deletion status',
          'POST /api/users/export': 'Request personal data export (GDPR)',
          'GET /api/users/export/download/:exportId': 'Download data export',
          'GET /api/users/export/history': 'Get export history',
          'POST /api/users/delete-request': 'Request permanent account deletion',
          'GET /api/users/preferences': 'Get all user preferences',
          'PUT /api/users/preferences': 'Update user preferences',
          'GET /api/users/preferences/:section': 'Get specific preference section',
          'PUT /api/users/preferences/:section': 'Update specific preference section',
          'POST /api/users/preferences/privacy/preset': 'Apply privacy preset',
          'POST /api/users/preferences/reset': 'Reset preferences to defaults',
          'GET /api/users/preferences/export': 'Export preferences',
          'POST /api/users/preferences/import': 'Import preferences',
        },
        admin: {
          'GET /api/admin/users': 'List users (admin only)',
          'PUT /api/admin/users/:id/status': 'Update user status',
          'POST /api/admin/users/:id/force-logout': 'Force user logout',
          'POST /api/admin/users/:id/force-password-reset': 'Force user to reset password',
          'DELETE /api/admin/users/:id/force-password-reset': 'Clear force password reset',
          'GET /api/admin/users/force-password-reset': 'Get users with forced resets',
          'POST /api/admin/users/bulk-force-password-reset': 'Bulk force password reset',
          'POST /api/admin/cleanup/expired-force-resets': 'Cleanup expired force resets',
        },
        emailTemplates: {
          'GET /api/admin/templates': 'List email templates',
          'GET /api/admin/templates/:id': 'Get specific email template',
          'POST /api/admin/templates': 'Create new email template',
          'PUT /api/admin/templates/:id': 'Update email template',
          'DELETE /api/admin/templates/:id': 'Delete email template',
          'POST /api/admin/templates/:id/preview': 'Preview email template',
          'POST /api/admin/rate-limits/status': 'Get rate limit status',
          'POST /api/admin/rate-limits/clear': 'Clear rate limit for key',
          'GET /api/admin/rate-limits/user-tiers': 'Get user tier information',
          'PUT /api/admin/rate-limits/user-tier': 'Update user tier',
          'POST /api/admin/rate-limits/block-ip': 'Block IP address',
          'DELETE /api/admin/rate-limits/block-ip/:ip': 'Unblock IP address',
        },
        dataRetention: {
          'GET /api/admin/data-retention/stats': 'Get retention statistics',
          'POST /api/admin/data-retention/cleanup': 'Execute manual data cleanup',
          'GET /api/admin/data-retention/health': 'Get retention system health',
          'POST /api/admin/data-retention/preview': 'Preview cleanup operation',
        },
        performanceMonitoring: {
          'GET /api/admin/performance/health': 'Get system health snapshot',
          'GET /api/admin/performance/alerts': 'Get active performance alerts',
          'GET /api/admin/performance/alerts/history': 'Get performance alert history',
          'POST /api/admin/performance/alerts/:alertId/resolve': 'Resolve performance alert',
          'GET /api/admin/performance/metrics': 'Get performance metrics',
          'GET /api/admin/performance/thresholds': 'Get performance thresholds',
        },
        consentManagement: {
          'POST /api/consent/record': 'Record user consent for data processing',
          'PUT /api/consent/preferences': 'Update user consent preferences',
          'GET /api/consent/preferences': 'Get user consent preferences',
          'POST /api/consent/withdraw': 'Withdraw user consent',
          'GET /api/consent/history': 'Get user consent history',
          'GET /api/consent/banner': 'Get consent banner configuration (public)',
          'POST /api/consent/compliance-report': 'Generate compliance report (admin)',
        },
        avatarManagement: {
          'POST /api/avatar/upload': 'Upload user avatar image',
          'GET /api/avatar': 'Get current user avatar',
          'GET /api/avatar/history': 'Get user avatar history',
          'PUT /api/avatar/active': 'Set active avatar',
          'DELETE /api/avatar/:avatarId': 'Delete user avatar',
          'POST /api/avatar/gravatar': 'Set Gravatar as avatar',
          'GET /api/avatars/:filename': 'Serve avatar files (public)',
          'POST /api/avatars/cleanup': 'Cleanup old avatars (admin)',
        },
        sessionAnalytics: {
          'GET /api/analytics/sessions': 'Get user session analytics',
          'GET /api/analytics/realtime': 'Get real-time session metrics',
          'GET /api/analytics/duration': 'Get session duration statistics',
          'POST /api/analytics/report': 'Generate session analytics report (admin)',
        },
        webhooks: {
          'POST /api/admin/webhooks': 'Create webhook endpoint (admin)',
          'GET /api/admin/webhooks': 'List webhook endpoints (admin)',
          'GET /api/admin/webhooks/:id': 'Get webhook endpoint details (admin)',
          'PUT /api/admin/webhooks/:id': 'Update webhook endpoint (admin)',
          'DELETE /api/admin/webhooks/:id': 'Delete webhook endpoint (admin)',
          'POST /api/admin/webhooks/:id/test': 'Test webhook endpoint (admin)',
          'GET /api/admin/webhooks/:id/deliveries': 'Get webhook delivery history (admin)',
          'POST /api/admin/webhooks/trigger-test': 'Trigger test webhook event (admin)',
        },
        adminDashboard: {
          'GET /api/admin/dashboard/stats': 'Get comprehensive dashboard statistics (admin)',
          'GET /api/admin/dashboard/users/activity': 'Get user activity summary with pagination (admin)',
          'GET /api/admin/dashboard/alerts': 'Get system alerts with filtering (admin)',
          'POST /api/admin/dashboard/alerts': 'Create new system alert (admin)',
          'POST /api/admin/dashboard/alerts/:alertId/acknowledge': 'Acknowledge system alert (admin)',
          'GET /api/admin/dashboard/admin-actions': 'Get admin actions audit log (admin)',
          'GET /api/admin/dashboard/health': 'Get system health summary (admin)',
        },
        circuitBreaker: {
          'GET /circuit-breaker/status': 'Get circuit breaker status for all services',
          'POST /circuit-breaker/:name/reset': 'Reset specific circuit breaker (admin)',
        },
        gracefulDegradation: {
          'GET /api/admin/degradation/status': 'Get system degradation status (admin)',
          'POST /api/admin/degradation/process-queue': 'Process queued operations manually (admin)',
          'POST /api/admin/degradation/clear-cache': 'Clear fallback cache (admin)',
          'GET /api/admin/degradation/resilience-report': 'Get system resilience report (admin)',
        },
      },
      rateLimit: {
        global: `${rateLimitConfig.maxRequests} requests per ${rateLimitConfig.windowMs}ms`,
        login: `${rateLimitConfig.login.max} attempts per ${rateLimitConfig.login.windowMs}ms`,
        register: `${rateLimitConfig.register.max} attempts per ${rateLimitConfig.register.windowMs}ms`,
      },
    };
  });

  // Register versioned API routes
  // TEMPORARILY DISABLED: Versioned routes causing conflicts
  // app.registerVersionedRoutes('v1', async (versionedApp) => {
  //   await versionedApp.register(authRoutesV1, { prefix: '/api/auth' });
  // });
  // 
  // app.registerVersionedRoutes('v2', async (versionedApp) => {
  //   await versionedApp.register(authRoutesV2, { prefix: '/api/auth' });
  // });

  // Register core auth routes for dashboard integration
  await app.register(authRoutes, { prefix: '/api/auth' });
  
  // Register device trust routes
  await app.register(deviceTrustRoutes, { prefix: '/api/v1/device-trust' });
  
  // Register admin v1 routes
  await app.register(adminV1Routes, { prefix: '/api/v1/admin' });
  
  // Register account recovery routes
  await app.register(accountRecoveryRoutes, { prefix: '/api/v1' });
  
  // Register SAML SSO routes (only if enabled)
  if (config.ENABLE_SAML) {
    await app.register(samlRoutes, { prefix: '/api/v1/saml' });
    logger.info('📋 SAML SSO routes registered');
  } else {
    logger.info('📋 SAML SSO routes disabled');
  }
  
  // Register Enhanced OAuth 2.0/OIDC routes (only if enabled)
  if (config.ENABLE_OAUTH) {
    await app.register(enhancedOAuthRoutes, { prefix: '/api/v1/oauth' });
    logger.info('📋 Enhanced OAuth 2.0/OIDC routes registered');
  } else {
    logger.info('📋 Enhanced OAuth 2.0/OIDC routes disabled');
  }
  
  // Register Magic Link authentication routes
  await app.register(magicLinkRoutes, { prefix: '/api/v1/magic-link' });
  logger.info('📋 Magic Link authentication routes registered');
  
  // Register OAuth routes  
  await app.register(oauthRoutes, { prefix: '/api/oauth' });
  logger.info('📋 OAuth social login routes registered');
  
  // await app.register(twoFARoutes, { prefix: '/api/2fa' }); // TEMPORARILY DISABLED due to async handler issue
  // await app.register(userRoutes, { prefix: '/api/users' }); // TEMPORARILY DISABLED for troubleshooting
  // await app.register(adminRoutes, { prefix: '/api/admin' }); // TEMPORARILY DISABLED for troubleshooting
  // await app.register(metricsRoutes, { prefix: '/api/metrics' }); // TEMPORARILY DISABLED for troubleshooting
  // await app.register(logsRoutes, { prefix: '/api/logs' }); // TEMPORARILY DISABLED for troubleshooting
  // await app.register(emailTemplatesRoutes, { prefix: '/api/admin' }); // TEMPORARILY DISABLED for troubleshooting
  // await app.register(userExportRoutes, { prefix: '/api/users' }); // TEMPORARILY DISABLED for troubleshooting
  // await app.register(userPreferencesRoutes, { prefix: '/api/users' }); // TEMPORARILY DISABLED due to route duplication
  // await app.register(rateLimitAdminRoutes, { prefix: '/api/admin' }); // TEMPORARILY DISABLED for troubleshooting
  // await app.register(dataRetentionRoutes, { prefix: '/api/admin' }); // TEMPORARILY DISABLED for troubleshooting
  // await app.register(performanceMonitorRoutes, { prefix: '/api/admin' }); // TEMPORARILY DISABLED for troubleshooting
  // await app.register(consentManagementRoutes, { prefix: '/api/consent' }); // TEMPORARILY DISABLED for troubleshooting
  // await app.register(avatarRoutes, { prefix: '/api' }); // TEMPORARILY DISABLED for troubleshooting
  // await app.register(sessionAnalyticsRoutes, { prefix: '/api' }); // TEMPORARILY DISABLED for troubleshooting
  // await app.register(webhookRoutes, { prefix: '/api/admin' }); // TEMPORARILY DISABLED for troubleshooting
  // TEMPORARILY DISABLED: await app.register(adminDashboardRoutes, { prefix: '/api/admin' });
  // TEMPORARILY DISABLED: await app.register(degradationRoutes, { prefix: '/api/admin' });
  // TEMPORARILY DISABLED: await app.register(queueManagementRoutes, { prefix: '/api/admin' });
  // TEMPORARILY DISABLED: await app.register(notificationPreferencesRoutes, { prefix: '/api/notifications' });
  // TEMPORARILY DISABLED: await app.register(errorManagementRoutes, { prefix: '/api/admin/errors' });
  // TEMPORARILY DISABLED: await app.register(geoAdminRoutes, { prefix: '/api/admin' });
  // TEMPORARILY DISABLED: await app.register(fraudAdminRoutes, { prefix: '/api/admin' });
  // TEMPORARILY DISABLED: await app.register(authProviderAdminRoutes, { prefix: '/api/admin' });

  // Register versioned routes with prefixes - TEMPORARILY DISABLED to fix route conflicts
  // await app.register(async (versionedApp) => {
  //   await versionedApp.register(authRoutesV1, { prefix: '/api/v1/auth' });
  //   await versionedApp.register(authRoutesV2, { prefix: '/api/v2/auth' });
  // });

  // Global error handler
  app.setErrorHandler(errorHandler);

  // Global not found handler
  app.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      error: 'Not Found',
      message: `Route ${request.method} ${request.url} not found`,
      statusCode: 404,
    });
  });

  // Graceful shutdown hooks
  app.addHook('onClose', async (instance) => {
    logger.info('🔄 Starting graceful shutdown...');
    
    try {
      // Stop message queue processor
      messageQueueProcessor.stop();
      logger.info('✅ Message queue processor stopped');
      
      // Process any remaining queued operations
      await gracefulDegradationService.processQueuedOperations();
      logger.info('✅ Processed remaining queued operations');
      
      // Process any remaining email/SMS queues
      await enhancedEmailService.processQueuedEmails();
      await enhancedSmsService.processQueuedSms();
      logger.info('✅ Processed remaining email/SMS queues');
      
      // Cleanup graceful degradation service
      gracefulDegradationService.cleanup();
      logger.info('✅ Graceful degradation service cleaned up');
      
      // Close database connection pool
      await databaseManager.shutdown();
      logger.info('✅ Database connection pool closed');
      
      // Close Redis connection
      await RedisClient.disconnect();
      logger.info('✅ Redis connection closed');
      
      logger.info('✅ Graceful shutdown completed');
    } catch (error) {
      logger.error('❌ Error during graceful shutdown:', error);
    }
  });

  // Request/Response lifecycle hooks
  app.addHook('onRequest', async (request, reply) => {
    // Add request ID for tracing
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    request.headers['x-request-id'] = requestId;
    reply.header('x-request-id', requestId);

    // Apply IP blocking middleware
    await ipBlockingMiddleware(request, reply);

    // Apply dynamic rate limiting middleware
    await dynamicRateLimitMiddleware(request, reply);
  });

  app.addHook('onResponse', async (request, reply) => {
    // Log slow requests
    const responseTime = reply.getResponseTime();
    if (responseTime > 1000) { // Log requests slower than 1 second
      logger.warn('Slow request detected:', {
        method: request.method,
        url: request.url,
        responseTime: `${responseTime}ms`,
        statusCode: reply.statusCode,
      });
    }

    // Record performance metrics
    try {
      await metricsService.recordGauge('response_time_latest', responseTime);
      await metricsService.recordGauge('requests_per_minute', 1);
    } catch (error) {
      // Silently fail to avoid impacting request processing
    }
  });

  // Security headers hook
  app.addHook('onSend', async (request, reply, payload) => {
    reply.header('X-Content-Type-Options', 'nosniff');
    reply.header('X-Frame-Options', 'DENY');
    reply.header('X-XSS-Protection', '1; mode=block');
    reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    if (serverConfig.isProduction) {
      reply.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }
    
    return payload;
  });

  logger.info(`🚀 Auth service configured successfully in ${serverConfig.nodeEnv} mode`);
  
  return app;
}