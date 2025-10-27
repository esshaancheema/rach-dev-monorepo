import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { logger } from '../utils/logger';
import { createConsentManagementService } from '../services/consent-management.service';
import { createEmailService } from '../services/email.service';

export interface ConsentMiddlewareOptions {
  enableConsentChecking: boolean;
  enableCookieConsent: boolean;
  enableAnalyticsGating: boolean;
  enableMarketingGating: boolean;
  redirectToConsent: boolean;
  consentRedirectUrl: string;
  exemptPaths: string[];
  requiredConsents: Record<string, string[]>; // path pattern -> required consent types
}

const defaultOptions: ConsentMiddlewareOptions = {
  enableConsentChecking: true,
  enableCookieConsent: true,
  enableAnalyticsGating: true,
  enableMarketingGating: true,
  redirectToConsent: false,
  consentRedirectUrl: '/consent',
  exemptPaths: [
    '/health',
    '/ready',
    '/api/auth/login',
    '/api/auth/register',
    '/api/consent',
    '/privacy-policy',
    '/cookie-policy'
  ],
  requiredConsents: {
    '/api/analytics/*': ['cookies_analytics'],
    '/api/marketing/*': ['cookies_marketing', 'email_marketing'],
    '/api/users/recommendations': ['cookies_personalization'],
    '/api/admin/users/*/export': ['data_processing']
  }
};

/**
 * Consent middleware for privacy compliance
 * Checks user consent before allowing access to data processing features
 */
export async function consentMiddleware(
  fastify: FastifyInstance,
  options: Partial<ConsentMiddlewareOptions> = {}
) {
  const config = { ...defaultOptions, ...options };
  
  const emailService = createEmailService();
  const consentService = createConsentManagementService({
    prisma: fastify.prisma,
    emailService
  });

  /**
   * Check if path is exempt from consent checking
   */
  function isExemptPath(path: string): boolean {
    return config.exemptPaths.some(exemptPath => {
      if (exemptPath.endsWith('*')) {
        return path.startsWith(exemptPath.slice(0, -1));
      }
      return path === exemptPath;
    });
  }

  /**
   * Check if path matches a pattern
   */
  function matchesPattern(path: string, pattern: string): boolean {
    if (pattern.endsWith('*')) {
      return path.startsWith(pattern.slice(0, -1));
    }
    return path === pattern;
  }

  /**
   * Get required consents for a specific path
   */
  function getRequiredConsents(path: string): string[] {
    for (const [pattern, consents] of Object.entries(config.requiredConsents)) {
      if (matchesPattern(path, pattern)) {
        return consents;
      }
    }
    return [];
  }

  /**
   * Pre-request consent checking hook
   */
  fastify.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    // Skip consent checking if disabled
    if (!config.enableConsentChecking) {
      return;
    }

    // Skip exempt paths
    if (isExemptPath(request.routerPath || request.url)) {
      return;
    }

    // Skip for health checks and static resources
    if (request.method === 'OPTIONS' || request.url.startsWith('/static/')) {
      return;
    }

    try {
      const user = (request as any).user;
      const path = request.routerPath || request.url;
      
      // Get required consents for this path
      const requiredConsents = getRequiredConsents(path);
      
      if (requiredConsents.length === 0) {
        return; // No consent required for this path
      }

      // For anonymous users, check cookie consent headers
      if (!user) {
        await handleAnonymousUserConsent(request, reply, requiredConsents, config);
        return;
      }

      // For authenticated users, check stored consent preferences
      await handleAuthenticatedUserConsent(request, reply, user, requiredConsents, consentService, config);

    } catch (error) {
      logger.error({ error, path: request.url }, 'Consent middleware error');
      // Continue request on error to avoid blocking functionality
    }
  });

  /**
   * Response hook to add consent-related headers
   */
  fastify.addHook('onSend', async (request: FastifyRequest, reply: FastifyReply, payload: any) => {
    // Add consent-related headers
    const user = (request as any).user;
    
    if (config.enableCookieConsent) {
      // Add cookie consent headers
      reply.header('X-Consent-Required', 'true');
      
      if (user) {
        try {
          const preferences = await consentService.getUserConsentPreferences(user.id);
          if (preferences) {
            reply.header('X-User-Consent-Status', 'configured');
            
            // Add specific consent status headers
            const analyticsConsent = preferences.categories['cookies_analytics']?.granted;
            const marketingConsent = preferences.categories['cookies_marketing']?.granted;
            
            if (analyticsConsent !== undefined) {
              reply.header('X-Analytics-Consent', analyticsConsent.toString());
            }
            if (marketingConsent !== undefined) {
              reply.header('X-Marketing-Consent', marketingConsent.toString());
            }
          } else {
            reply.header('X-User-Consent-Status', 'pending');
          }
        } catch (error) {
          logger.error({ error, userId: user.id }, 'Failed to get consent status for headers');
        }
      } else {
        reply.header('X-User-Consent-Status', 'anonymous');
      }
    }

    return payload;
  });

  logger.info('Consent middleware initialized', {
    enableConsentChecking: config.enableConsentChecking,
    enableCookieConsent: config.enableCookieConsent,
    enableAnalyticsGating: config.enableAnalyticsGating,
    enableMarketingGating: config.enableMarketingGating,
    exemptPathsCount: config.exemptPaths.length,
    requiredConsentsCount: Object.keys(config.requiredConsents).length
  });
}

/**
 * Handle consent checking for anonymous users
 */
async function handleAnonymousUserConsent(
  request: FastifyRequest,
  reply: FastifyReply,
  requiredConsents: string[],
  config: ConsentMiddlewareOptions
): Promise<void> {
  // Check for consent cookies or headers
  const consentCookie = request.cookies['user_consent'];
  const consentHeader = request.headers['x-user-consent'] as string;
  
  let userConsents: Record<string, boolean> = {};
  
  try {
    if (consentCookie) {
      userConsents = JSON.parse(consentCookie);
    } else if (consentHeader) {
      userConsents = JSON.parse(consentHeader);
    }
  } catch (error) {
    logger.warn({ error }, 'Failed to parse user consent data');
  }

  // Check if required consents are granted
  const missingConsents = requiredConsents.filter(consentType => !userConsents[consentType]);
  
  if (missingConsents.length > 0) {
    logger.info({ 
      path: request.url, 
      requiredConsents, 
      missingConsents 
    }, 'Anonymous user missing required consents');

    if (config.redirectToConsent) {
      return reply.redirect(302, `${config.consentRedirectUrl}?return=${encodeURIComponent(request.url)}`);
    }

    return reply.status(403).send({
      success: false,
      error: 'Consent Required',
      message: 'User consent is required to access this resource',
      code: 'CONSENT_REQUIRED',
      details: {
        requiredConsents,
        missingConsents,
        consentUrl: config.consentRedirectUrl
      }
    });
  }
}

/**
 * Handle consent checking for authenticated users
 */
async function handleAuthenticatedUserConsent(
  request: FastifyRequest,
  reply: FastifyReply,
  user: any,
  requiredConsents: string[],
  consentService: any,
  config: ConsentMiddlewareOptions
): Promise<void> {
  try {
    // Check each required consent
    const consentChecks = await Promise.all(
      requiredConsents.map(async (consentType) => ({
        type: consentType,
        granted: await consentService.hasUserConsent(user.id, consentType)
      }))
    );

    const missingConsents = consentChecks
      .filter(check => !check.granted)
      .map(check => check.type);

    if (missingConsents.length > 0) {
      logger.info({ 
        userId: user.id,
        path: request.url, 
        requiredConsents, 
        missingConsents 
      }, 'User missing required consents');

      // Check if user needs consent update (e.g., new privacy policy)
      const updateRequired = await consentService.requiresConsentUpdate(user.id);
      
      if (config.redirectToConsent) {
        const redirectUrl = updateRequired.required 
          ? `${config.consentRedirectUrl}?update=true&return=${encodeURIComponent(request.url)}`
          : `${config.consentRedirectUrl}?return=${encodeURIComponent(request.url)}`;
        
        return reply.redirect(302, redirectUrl);
      }

      return reply.status(403).send({
        success: false,
        error: 'Consent Required',
        message: updateRequired.required 
          ? 'Please update your consent preferences due to policy changes'
          : 'User consent is required to access this resource',
        code: updateRequired.required ? 'CONSENT_UPDATE_REQUIRED' : 'CONSENT_REQUIRED',
        details: {
          requiredConsents,
          missingConsents,
          consentUrl: config.consentRedirectUrl,
          updateRequired: updateRequired.required,
          updateReason: updateRequired.reason,
          newVersion: updateRequired.newVersion
        }
      });
    }

    // Log consent-gated access
    logger.debug({ 
      userId: user.id,
      path: request.url,
      requiredConsents,
      grantedConsents: consentChecks.filter(c => c.granted).map(c => c.type)
    }, 'Consent-gated access granted');

  } catch (error) {
    logger.error({ error, userId: user.id }, 'Failed to check user consent');
    // Allow access on error to avoid blocking functionality
  }
}

/**
 * Consent checking utility functions
 */
export const consentUtils = {
  /**
   * Require specific consent types for a route
   */
  requireConsent: (consentTypes: string[]) => {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      const user = (request as any).user;
      
      if (!user) {
        return reply.status(401).send({
          success: false,
          error: 'Authentication Required',
          message: 'User must be authenticated to check consent'
        });
      }

      const emailService = createEmailService();
      const consentService = createConsentManagementService({
        prisma: (request.server as any).prisma,
        emailService
      });

      const consentChecks = await Promise.all(
        consentTypes.map(async (consentType) => ({
          type: consentType,
          granted: await consentService.hasUserConsent(user.id, consentType)
        }))
      );

      const missingConsents = consentChecks
        .filter(check => !check.granted)
        .map(check => check.type);

      if (missingConsents.length > 0) {
        return reply.status(403).send({
          success: false,
          error: 'Consent Required',
          message: 'Additional consent is required to access this resource',
          code: 'CONSENT_REQUIRED',
          details: {
            requiredConsents: consentTypes,
            missingConsents
          }
        });
      }
    };
  },

  /**
   * Check if analytics consent is granted
   */
  checkAnalyticsConsent: async (request: FastifyRequest): Promise<boolean> => {
    const user = (request as any).user;
    
    if (!user) {
      // Check anonymous consent via cookie/header
      const consentCookie = request.cookies['user_consent'];
      if (consentCookie) {
        try {
          const consents = JSON.parse(consentCookie);
          return !!consents['cookies_analytics'];
        } catch {
          return false;
        }
      }
      return false;
    }

    const emailService = createEmailService();
    const consentService = createConsentManagementService({
      prisma: (request.server as any).prisma,
      emailService
    });

    return consentService.hasUserConsent(user.id, 'cookies_analytics');
  },

  /**
   * Check if marketing consent is granted
   */
  checkMarketingConsent: async (request: FastifyRequest): Promise<boolean> => {
    const user = (request as any).user;
    
    if (!user) {
      const consentCookie = request.cookies['user_consent'];
      if (consentCookie) {
        try {
          const consents = JSON.parse(consentCookie);
          return !!consents['cookies_marketing'];
        } catch {
          return false;
        }
      }
      return false;
    }

    const emailService = createEmailService();
    const consentService = createConsentManagementService({
      prisma: (request.server as any).prisma,
      emailService
    });

    return consentService.hasUserConsent(user.id, 'cookies_marketing');
  }
};

/**
 * Consent middleware plugin
 */
export const consentPlugin = async (
  fastify: FastifyInstance,
  options: Partial<ConsentMiddlewareOptions> = {}
) => {
  await consentMiddleware(fastify, options);
  
  // Register utility functions
  fastify.decorate('consentUtils', consentUtils);
};