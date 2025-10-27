import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { fraudDetectionService, DeviceFingerprint } from '../services/fraud-detection.service';
import { logger } from '../utils/logger';
import { createAuthError } from './error-handler';
import { ERROR_CODES } from '../constants/error-codes';

export interface FraudDetectionOptions {
  enabled?: boolean;
  exemptPaths?: string[];
  exemptUserRoles?: string[];
  blockThreshold?: number;
  verificationThreshold?: number;
  logAllEvents?: boolean;
  enableDeviceFingerprinting?: boolean;
}

const DEFAULT_OPTIONS: Required<FraudDetectionOptions> = {
  enabled: true,
  exemptPaths: [
    '/health',
    '/ready',
    '/metrics',
    '/docs',
    '/api/docs',
    '/api/auth/register', // Don't analyze registration
    '/api/auth/verify-email' // Don't analyze email verification
  ],
  exemptUserRoles: ['admin', 'super_admin'],
  blockThreshold: 80,
  verificationThreshold: 60,
  logAllEvents: false,
  enableDeviceFingerprinting: true
};

/**
 * Extract device fingerprint from request headers
 */
function extractDeviceFingerprint(request: FastifyRequest): DeviceFingerprint | undefined {
  try {
    const userAgent = request.headers['user-agent'] || '';
    const acceptLanguage = request.headers['accept-language'] || '';
    
    // Extract from custom headers if available (would be set by client-side JS)
    const screenResolution = request.headers['x-screen-resolution'] as string || '1920x1080';
    const timezone = request.headers['x-timezone'] as string || 'UTC';
    const platform = request.headers['x-platform'] as string || 'unknown';
    const cookieEnabled = request.headers['x-cookie-enabled'] === 'true';
    const doNotTrack = request.headers['dnt'] === '1';

    // Create a hash of the fingerprint data
    const fingerprintData = `${userAgent}|${screenResolution}|${timezone}|${acceptLanguage}|${platform}|${cookieEnabled}|${doNotTrack}`;
    const hash = Buffer.from(fingerprintData).toString('base64').slice(0, 32);

    return {
      userAgent,
      screenResolution,
      timezone,
      language: acceptLanguage,
      platform,
      cookieEnabled,
      doNotTrack,
      hash
    };
  } catch (error) {
    logger.warn('Failed to extract device fingerprint:', error);
    return undefined;
  }
}

/**
 * Check if path is exempt from fraud detection
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
 * Fraud detection middleware
 */
async function fraudDetectionMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
  options: Required<FraudDetectionOptions>
): Promise<void> {
  // Skip if middleware is disabled
  if (!options.enabled) {
    return;
  }

  const startTime = Date.now();
  const path = request.url;
  const method = request.method;
  const ip = request.ip;

  try {
    // Check if path is exempt
    if (isPathExempt(path, options.exemptPaths)) {
      return;
    }

    // Only analyze authentication-related endpoints
    const isAuthEndpoint = path.includes('/auth/') || path.includes('/oauth/') || 
                          path.includes('/login') || path.includes('/signin');
    
    if (!isAuthEndpoint) {
      return;
    }

    // Get user information if available
    const user = (request as any).user;
    const userId = user?.id;
    const sessionId = (request as any).sessionId;

    // Check if user role is exempt
    if (user && isUserRoleExempt(user, options.exemptUserRoles)) {
      return;
    }

    // Extract device fingerprint if enabled
    let deviceFingerprint: DeviceFingerprint | undefined;
    if (options.enableDeviceFingerprinting) {
      deviceFingerprint = extractDeviceFingerprint(request);
    }

    // Gather metadata for analysis
    const metadata = {
      endpoint: path,
      method,
      userAgent: request.headers['user-agent'],
      referer: request.headers.referer,
      origin: request.headers.origin,
      hasAccountChanges: false, // Would be determined by endpoint logic
      requestSize: request.headers['content-length'] ? parseInt(request.headers['content-length']) : 0
    };

    // Perform fraud analysis
    const fraudAnalysis = await fraudDetectionService.analyzeAuthenticationEvent(
      ip,
      userId,
      sessionId,
      deviceFingerprint,
      metadata
    );

    const duration = Date.now() - startTime;

    // Log the analysis result
    const logData = {
      ip,
      path,
      method,
      userId,
      sessionId,
      fraudScore: fraudAnalysis.fraudScore,
      riskLevel: fraudAnalysis.riskLevel,
      allowAccess: fraudAnalysis.allowAccess,
      requiresVerification: fraudAnalysis.requiresVerification,
      signalCount: fraudAnalysis.signals.length,
      duration,
      confidence: fraudAnalysis.confidence
    };

    if (!fraudAnalysis.allowAccess) {
      logger.warn('Fraud detection blocked request', {
        ...logData,
        signals: fraudAnalysis.signals.map(s => ({
          type: s.type,
          severity: s.severity,
          score: s.score,
          description: s.description
        })),
        recommendations: fraudAnalysis.recommendations
      });

      // Add fraud context to request for error handler
      (request as any).fraudContext = {
        fraudScore: fraudAnalysis.fraudScore,
        riskLevel: fraudAnalysis.riskLevel,
        signals: fraudAnalysis.signals,
        recommendations: fraudAnalysis.recommendations,
        blockDuration: fraudAnalysis.blockDuration
      };

      // Throw fraud detection error
      throw createAuthError(
        'Access denied due to suspicious activity',
        undefined,
        ERROR_CODES.SECURITY_FRAUD_DETECTED,
        {
          fraudScore: fraudAnalysis.fraudScore,
          riskLevel: fraudAnalysis.riskLevel,
          recommendations: fraudAnalysis.recommendations,
          blockDuration: fraudAnalysis.blockDuration,
          signalCount: fraudAnalysis.signals.length
        }
      );
    } else {
      // Request allowed
      if (options.logAllEvents || fraudAnalysis.fraudScore > 20) {
        logger.info('Fraud detection analysis completed', logData);
      }

      // Add fraud context to request for other middleware/routes
      (request as any).fraudContext = {
        fraudScore: fraudAnalysis.fraudScore,
        riskLevel: fraudAnalysis.riskLevel,
        requiresVerification: fraudAnalysis.requiresVerification,
        confidence: fraudAnalysis.confidence,
        deviceFingerprint: deviceFingerprint?.hash
      };

      // If additional verification is required, set verification flag
      if (fraudAnalysis.requiresVerification) {
        (request as any).requiresAdditionalVerification = true;
        (request as any).verificationReason = 'fraud_risk';
        
        logger.info('Additional verification required for request', {
          ...logData,
          reason: 'High fraud risk score'
        });
      }
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    
    // If it's already our fraud detection error, re-throw it
    if (error.code === ERROR_CODES.SECURITY_FRAUD_DETECTED) {
      throw error;
    }

    // Log unexpected errors
    logger.error('Fraud detection middleware error', {
      ip,
      path,
      method,
      duration,
      error: error.message,
      stack: error.stack
    });

    // On unexpected error, allow the request (fail open)
    // This prevents fraud detection from breaking the service
    logger.warn('Fraud detection check failed, allowing request', {
      ip,
      path
    });
  }
}

/**
 * Fastify plugin for fraud detection
 */
async function fraudDetectionPlugin(
  fastify: FastifyInstance,
  options: FraudDetectionOptions = {}
): Promise<void> {
  const pluginOptions = { ...DEFAULT_OPTIONS, ...options };

  // Add pre-handler hook for fraud detection
  fastify.addHook('preHandler', async (request, reply) => {
    await fraudDetectionMiddleware(request, reply, pluginOptions);
  });

  // Add decorator for accessing fraud context
  fastify.decorateRequest('fraudContext', null);
  fastify.decorateRequest('requiresAdditionalVerification', false);
  fastify.decorateRequest('verificationReason', null);

  // Add route for device fingerprinting script
  fastify.get('/js/device-fingerprint.js', async (request, reply) => {
    const script = `
(function() {
  function getDeviceFingerprint() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Device fingerprint test', 2, 2);
    
    return {
      screenResolution: screen.width + 'x' + screen.height,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack === '1',
      canvasFingerprint: canvas.toDataURL()
    };
  }

  function setFingerprintHeaders() {
    const fp = getDeviceFingerprint();
    
    // Store in session storage for subsequent requests
    sessionStorage.setItem('deviceFingerprint', JSON.stringify(fp));
    
    // Add to default headers for fetch requests
    if (window.fetch) {
      const originalFetch = window.fetch;
      window.fetch = function(...args) {
        if (args[1]) {
          args[1].headers = args[1].headers || {};
          args[1].headers['X-Screen-Resolution'] = fp.screenResolution;
          args[1].headers['X-Timezone'] = fp.timezone;
          args[1].headers['X-Platform'] = fp.platform;
          args[1].headers['X-Cookie-Enabled'] = fp.cookieEnabled.toString();
        }
        return originalFetch.apply(this, args);
      };
    }

    // Add to XMLHttpRequest
    if (window.XMLHttpRequest) {
      const originalOpen = XMLHttpRequest.prototype.open;
      XMLHttpRequest.prototype.open = function(...args) {
        const result = originalOpen.apply(this, args);
        this.setRequestHeader('X-Screen-Resolution', fp.screenResolution);
        this.setRequestHeader('X-Timezone', fp.timezone);
        this.setRequestHeader('X-Platform', fp.platform);
        this.setRequestHeader('X-Cookie-Enabled', fp.cookieEnabled.toString());
        return result;
      };
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setFingerprintHeaders);
  } else {
    setFingerprintHeaders();
  }
})();
`;

    reply
      .type('application/javascript')
      .send(script);
  });

  logger.info('Fraud detection middleware registered', {
    enabled: pluginOptions.enabled,
    exemptPaths: pluginOptions.exemptPaths.length,
    blockThreshold: pluginOptions.blockThreshold,
    verificationThreshold: pluginOptions.verificationThreshold,
    deviceFingerprinting: pluginOptions.enableDeviceFingerprinting
  });
}

// Export as Fastify plugin
export default fp(fraudDetectionPlugin, {
  name: 'fraud-detection',
  fastify: '4.x'
});

// Export types and utilities
export {
  FraudDetectionOptions,
  extractDeviceFingerprint,
  isPathExempt,
  isUserRoleExempt
};