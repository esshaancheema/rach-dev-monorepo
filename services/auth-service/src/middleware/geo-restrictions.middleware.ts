import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { geoRestrictionsService } from '../services/geo-restrictions.service';
import { logger } from '../utils/logger';
import { createAuthError } from './error-handler';
import { ERROR_CODES } from '../constants/error-codes';

export interface GeoRestrictionsOptions {
  enabled?: boolean;
  exemptPaths?: string[];
  exemptIPs?: string[];
  exemptUserRoles?: string[];
  trustProxyHeaders?: boolean;
  proxyHeaders?: string[];
  logBlocked?: boolean;
  logAllowed?: boolean;
  enableBypass?: boolean;
  bypassHeader?: string;
  bypassSecret?: string;
}

const DEFAULT_OPTIONS: Required<GeoRestrictionsOptions> = {
  enabled: true,
  exemptPaths: [
    '/health',
    '/ready',
    '/metrics',
    '/docs',
    '/api/docs',
    '/favicon.ico'
  ],
  exemptIPs: [
    '127.0.0.1',
    '::1',
    '10.0.0.0/8',
    '172.16.0.0/12',
    '192.168.0.0/16'
  ],
  exemptUserRoles: ['admin', 'super_admin'],
  trustProxyHeaders: true,
  proxyHeaders: [
    'x-forwarded-for',
    'x-real-ip',
    'cf-connecting-ip', // Cloudflare
    'x-client-ip',
    'x-cluster-client-ip',
    'forwarded-for'
  ],
  logBlocked: true,
  logAllowed: false,
  enableBypass: false,
  bypassHeader: 'x-geo-bypass',
  bypassSecret: process.env.GEO_BYPASS_SECRET || ''
};

/**
 * Extract the real client IP from request headers
 */
function extractClientIP(request: FastifyRequest, options: Required<GeoRestrictionsOptions>): string {
  // If not trusting proxy headers, use direct connection IP
  if (!options.trustProxyHeaders) {
    return request.ip;
  }

  // Check proxy headers in order of preference
  for (const header of options.proxyHeaders) {
    const value = request.headers[header];
    if (value && typeof value === 'string') {
      // Handle comma-separated IPs (take the first one)
      const ip = value.split(',')[0].trim();
      if (ip && ip !== 'unknown') {
        return ip;
      }
    }
  }

  // Fallback to connection IP
  return request.ip;
}

/**
 * Check if path is exempt from geo restrictions
 */
function isPathExempt(path: string, exemptPaths: string[]): boolean {
  return exemptPaths.some(exemptPath => {
    if (exemptPath.endsWith('*')) {
      return path.startsWith(exemptPath.slice(0, -1));
    }
    return path === exemptPath || path.startsWith(exemptPath + '/');
  });
}

/**
 * Check if IP is in exempt ranges
 */
function isIPExempt(ip: string, exemptIPs: string[]): boolean {
  return exemptIPs.some(exempt => {
    if (exempt.includes('/')) {
      // CIDR notation - would need proper IP range checking library
      // For now, simple check
      const [network] = exempt.split('/');
      return ip.startsWith(network.split('.').slice(0, -1).join('.'));
    }
    return ip === exempt;
  });
}

/**
 * Check if user role is exempt
 */
function isUserRoleExempt(user: any, exemptRoles: string[]): boolean {
  if (!user || !user.role) {
    return false;
  }
  
  const userRoles = Array.isArray(user.role) ? user.role : [user.role];
  return userRoles.some((role: string) => exemptRoles.includes(role));
}

/**
 * Check bypass authorization
 */
function checkBypass(request: FastifyRequest, options: Required<GeoRestrictionsOptions>): boolean {
  if (!options.enableBypass || !options.bypassSecret) {
    return false;
  }

  const bypassHeader = request.headers[options.bypassHeader];
  return bypassHeader === options.bypassSecret;
}

/**
 * Geo restrictions middleware
 */
async function geoRestrictionsMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
  options: Required<GeoRestrictionsOptions>
): Promise<void> {
  // Skip if middleware is disabled
  if (!options.enabled) {
    return;
  }

  const startTime = Date.now();
  const path = request.url;
  const method = request.method;

  try {
    // Check if path is exempt
    if (isPathExempt(path, options.exemptPaths)) {
      return;
    }

    // Extract real client IP
    const clientIP = extractClientIP(request, options);

    // Check if IP is exempt
    if (isIPExempt(clientIP, options.exemptIPs)) {
      return;
    }

    // Check bypass header
    if (checkBypass(request, options)) {
      logger.info('Geo restriction bypassed', { ip: clientIP, path });
      return;
    }

    // Check if user role is exempt (if user is authenticated)
    const user = (request as any).user;
    if (user && isUserRoleExempt(user, options.exemptUserRoles)) {
      return;
    }

    // Perform geo restriction check
    const geoCheck = await geoRestrictionsService.checkAccess(
      clientIP,
      path,
      user?.id,
      request.headers['user-agent']
    );

    // Log the check result
    const duration = Date.now() - startTime;
    const logData = {
      ip: clientIP,
      path,
      method,
      allowed: geoCheck.allowed,
      country: geoCheck.country,
      countryCode: geoCheck.countryCode,
      appliedRules: geoCheck.appliedRules,
      riskScore: geoCheck.riskScore,
      duration,
      userId: user?.id,
      userAgent: request.headers['user-agent']
    };

    if (!geoCheck.allowed) {
      if (options.logBlocked) {
        logger.warn('Geo restriction blocked request', {
          ...logData,
          reason: geoCheck.reason
        });
      }

      // Add geo context to request for error handler
      (request as any).geoContext = {
        ip: clientIP,
        country: geoCheck.country,
        countryCode: geoCheck.countryCode,
        reason: geoCheck.reason,
        bypassAvailable: geoCheck.bypassAvailable
      };

      // Throw geo restriction error
      throw createAuthError(
        geoCheck.reason || 'Access denied due to geographic restrictions',
        undefined,
        ERROR_CODES.SECURITY_GEO_RESTRICTION,
        {
          country: geoCheck.country,
          countryCode: geoCheck.countryCode,
          appliedRules: geoCheck.appliedRules,
          riskScore: geoCheck.riskScore,
          bypassAvailable: geoCheck.bypassAvailable
        }
      );
    } else {
      // Request allowed
      if (options.logAllowed && geoCheck.riskScore > 5) {
        logger.info('Geo restriction allowed high-risk request', logData);
      }

      // Add geo context to request for other middleware/routes
      (request as any).geoContext = {
        ip: clientIP,
        country: geoCheck.country,
        countryCode: geoCheck.countryCode,
        riskScore: geoCheck.riskScore,
        appliedRules: geoCheck.appliedRules
      };
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    
    // If it's already our geo restriction error, re-throw it
    if (error.code === ERROR_CODES.SECURITY_GEO_RESTRICTION) {
      throw error;
    }

    // Log unexpected errors
    logger.error('Geo restriction middleware error', {
      ip: extractClientIP(request, options),
      path,
      method,
      duration,
      error: error.message,
      stack: error.stack
    });

    // On unexpected error, allow the request (fail open)
    // This prevents geo restrictions from breaking the service
    logger.warn('Geo restriction check failed, allowing request', {
      ip: extractClientIP(request, options),
      path
    });
  }
}

/**
 * Fastify plugin for geo restrictions
 */
async function geoRestrictionsPlugin(
  fastify: FastifyInstance,
  options: GeoRestrictionsOptions = {}
): Promise<void> {
  const pluginOptions = { ...DEFAULT_OPTIONS, ...options };

  // Add pre-handler hook for geo restrictions
  fastify.addHook('preHandler', async (request, reply) => {
    await geoRestrictionsMiddleware(request, reply, pluginOptions);
  });

  // Add decorator for accessing geo context
  fastify.decorateRequest('geoContext', null);

  logger.info('Geo restrictions middleware registered', {
    enabled: pluginOptions.enabled,
    exemptPaths: pluginOptions.exemptPaths.length,
    exemptIPs: pluginOptions.exemptIPs.length,
    trustProxyHeaders: pluginOptions.trustProxyHeaders
  });
}

// Export as Fastify plugin
export default fp(geoRestrictionsPlugin, {
  name: 'geo-restrictions',
  fastify: '4.x'
});

// Export types and utilities
export {
  GeoRestrictionsOptions,
  extractClientIP,
  isPathExempt,
  isIPExempt,
  isUserRoleExempt,
  checkBypass
};