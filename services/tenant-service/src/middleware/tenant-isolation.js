const mongoose = require('mongoose');
const Tenant = require('../models/Tenant');
const { createTenantConnection } = require('../utils/database-manager');
const logger = require('../utils/logger');

/**
 * Tenant Isolation Middleware
 * 
 * Provides comprehensive tenant isolation at multiple levels:
 * - Request-level tenant identification
 * - Database/schema isolation
 * - Security context enforcement
 * - Resource quota validation
 * - Rate limiting per tenant
 */

/**
 * Extract tenant information from request
 * Supports multiple tenant identification methods:
 * 1. Custom domain (tenant.example.com)
 * 2. Subdomain (tenant.zoptal.com)
 * 3. Header (X-Tenant-ID)
 * 4. URL path (/tenant/{slug}/...)
 * 5. JWT token tenant context
 */
const identifyTenant = async (req, res, next) => {
  try {
    let tenant = null;
    let tenantIdentifier = null;
    let identificationMethod = null;

    // Method 1: Custom domain lookup
    const host = req.get('host');
    if (host && !host.includes('zoptal.com')) {
      tenant = await Tenant.findByDomain(host);
      if (tenant) {
        tenantIdentifier = host;
        identificationMethod = 'custom_domain';
      }
    }

    // Method 2: Subdomain extraction
    if (!tenant && host && host.includes('zoptal.com')) {
      const subdomain = host.split('.')[0];
      if (subdomain && subdomain !== 'www' && subdomain !== 'api') {
        tenant = await Tenant.findBySlug(subdomain);
        if (tenant) {
          tenantIdentifier = subdomain;
          identificationMethod = 'subdomain';
        }
      }
    }

    // Method 3: X-Tenant-ID header
    if (!tenant) {
      const tenantHeader = req.get('X-Tenant-ID') || req.get('x-tenant-id');
      if (tenantHeader) {
        // Try by tenant ID first, then by slug
        tenant = await Tenant.findByTenantId(tenantHeader) || 
                 await Tenant.findBySlug(tenantHeader);
        if (tenant) {
          tenantIdentifier = tenantHeader;
          identificationMethod = 'header';
        }
      }
    }

    // Method 4: URL path extraction
    if (!tenant) {
      const pathMatch = req.path.match(/^\/tenant\/([^\/]+)/);
      if (pathMatch) {
        const pathTenant = pathMatch[1];
        tenant = await Tenant.findBySlug(pathTenant);
        if (tenant) {
          tenantIdentifier = pathTenant;
          identificationMethod = 'url_path';
        }
      }
    }

    // Method 5: JWT token tenant context
    if (!tenant && req.user && req.user.tenantId) {
      tenant = await Tenant.findByTenantId(req.user.tenantId);
      if (tenant) {
        tenantIdentifier = req.user.tenantId;
        identificationMethod = 'jwt_token';
      }
    }

    // If no tenant found, check if this is a system endpoint
    const systemEndpoints = ['/health', '/metrics', '/docs', '/admin'];
    const isSystemEndpoint = systemEndpoints.some(endpoint => 
      req.path.startsWith(endpoint)
    );

    if (!tenant && !isSystemEndpoint) {
      return res.status(400).json({
        error: 'TENANT_NOT_FOUND',
        message: 'Unable to identify tenant from request',
        details: {
          host,
          path: req.path,
          headers: {
            'x-tenant-id': req.get('X-Tenant-ID'),
            'user-agent': req.get('User-Agent')
          }
        }
      });
    }

    if (tenant) {
      // Check tenant status
      if (tenant.status !== 'active') {
        return res.status(403).json({
          error: 'TENANT_INACTIVE',
          message: `Tenant is ${tenant.status}`,
          tenantId: tenant.tenantId
        });
      }

      // Check subscription status
      if (tenant.subscription.status === 'suspended') {
        return res.status(403).json({
          error: 'TENANT_SUSPENDED',
          message: 'Tenant subscription is suspended',
          tenantId: tenant.tenantId
        });
      }

      // Check trial expiration
      if (tenant.subscription.plan === 'trial' && 
          tenant.subscription.trialEndsAt < new Date()) {
        return res.status(402).json({
          error: 'TRIAL_EXPIRED',
          message: 'Trial period has expired',
          tenantId: tenant.tenantId,
          trialEndedAt: tenant.subscription.trialEndsAt
        });
      }

      // Attach tenant context to request
      req.tenant = tenant;
      req.tenantContext = tenant.getTenantContext();
      req.tenantIdentifier = tenantIdentifier;
      req.identificationMethod = identificationMethod;

      // Log tenant identification for audit
      logger.debug('Tenant identified', {
        tenantId: tenant.tenantId,
        slug: tenant.slug,
        method: identificationMethod,
        identifier: tenantIdentifier,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
    }

    next();
  } catch (error) {
    logger.error('Error in tenant identification', error);
    return res.status(500).json({
      error: 'TENANT_IDENTIFICATION_ERROR',
      message: 'Failed to identify tenant'
    });
  }
};

/**
 * Enforce database isolation based on tenant strategy
 */
const enforceDataIsolation = async (req, res, next) => {
  if (!req.tenant) {
    return next(); // Skip for system endpoints
  }

  try {
    const tenant = req.tenant;
    
    switch (tenant.isolationStrategy) {
      case 'database':
        // Use separate database connection for tenant
        if (tenant.database.connectionString) {
          req.tenantDb = await createTenantConnection(
            tenant.database.connectionString,
            tenant.tenantId
          );
        } else {
          throw new Error('Database connection string not configured for tenant');
        }
        break;

      case 'schema':
        // Use tenant-specific schema/namespace
        req.tenantSchema = tenant.database.schemaName;
        
        // Create tenant-specific model instances
        req.getTenantModel = (modelName) => {
          const baseModel = mongoose.models[modelName];
          if (!baseModel) {
            throw new Error(`Model ${modelName} not found`);
          }
          
          // Create tenant-prefixed collection name
          const tenantCollection = `${tenant.database.schemaName}_${baseModel.collection.name}`;
          
          // Return model with tenant-specific collection
          return mongoose.model(
            `${tenant.tenantId}_${modelName}`,
            baseModel.schema,
            tenantCollection
          );
        };
        break;

      case 'row_level':
        // Add tenant filter to all queries
        req.tenantFilter = { tenantId: tenant.tenantId };
        
        // Monkey patch mongoose queries to include tenant filter
        const originalExec = mongoose.Query.prototype.exec;
        mongoose.Query.prototype.exec = function() {
          if (this.getQuery && !this.getQuery().tenantId) {
            this.where({ tenantId: tenant.tenantId });
          }
          return originalExec.apply(this, arguments);
        };
        break;

      default:
        throw new Error(`Unknown isolation strategy: ${tenant.isolationStrategy}`);
    }

    // Set tenant context for logging and monitoring
    req.tenantLogger = logger.child({
      tenantId: tenant.tenantId,
      tenantSlug: tenant.slug
    });

    next();
  } catch (error) {
    logger.error('Error enforcing data isolation', {
      tenantId: req.tenant.tenantId,
      error: error.message
    });
    
    return res.status(500).json({
      error: 'DATA_ISOLATION_ERROR',
      message: 'Failed to enforce data isolation'
    });
  }
};

/**
 * Validate resource quotas and limits
 */
const validateResourceQuotas = (resourceType) => {
  return async (req, res, next) => {
    if (!req.tenant) {
      return next(); // Skip for system endpoints
    }

    try {
      const tenant = req.tenant;
      const canCreate = tenant.canCreateResource(resourceType);

      if (!canCreate) {
        const quotas = tenant.configuration.quotas;
        const usage = tenant.subscription.usage;

        return res.status(429).json({
          error: 'QUOTA_EXCEEDED',
          message: `${resourceType} quota exceeded`,
          quota: quotas[`max${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)}s`],
          current: usage[`${resourceType}s`],
          plan: tenant.subscription.plan
        });
      }

      next();
    } catch (error) {
      logger.error('Error validating resource quotas', {
        tenantId: req.tenant.tenantId,
        resourceType,
        error: error.message
      });
      
      return res.status(500).json({
        error: 'QUOTA_VALIDATION_ERROR',
        message: 'Failed to validate resource quotas'
      });
    }
  };
};

/**
 * Rate limiting per tenant
 */
const rateLimitStore = new Map();

const tenantRateLimit = (limitType = 'apiCalls') => {
  return async (req, res, next) => {
    if (!req.tenant) {
      return next(); // Skip for system endpoints
    }

    try {
      const tenant = req.tenant;
      const limits = tenant.configuration.rateLimits[limitType];
      
      if (!limits) {
        return next();
      }

      const key = `${tenant.tenantId}:${limitType}`;
      const now = Date.now();
      const windowStart = now - limits.windowMs;

      // Get or create rate limit data for tenant
      let rateLimitData = rateLimitStore.get(key) || {
        requests: [],
        resetTime: now + limits.windowMs
      };

      // Clean old requests outside the window
      rateLimitData.requests = rateLimitData.requests.filter(
        timestamp => timestamp > windowStart
      );

      // Check if limit exceeded
      if (rateLimitData.requests.length >= limits.maxRequests) {
        const resetIn = Math.ceil((rateLimitData.resetTime - now) / 1000);
        
        res.set({
          'X-RateLimit-Limit': limits.maxRequests,
          'X-RateLimit-Remaining': 0,
          'X-RateLimit-Reset': Math.ceil(rateLimitData.resetTime / 1000),
          'Retry-After': resetIn
        });

        return res.status(429).json({
          error: 'RATE_LIMIT_EXCEEDED',
          message: `Rate limit exceeded for ${limitType}`,
          limit: limits.maxRequests,
          windowMs: limits.windowMs,
          resetIn
        });
      }

      // Add current request
      rateLimitData.requests.push(now);
      rateLimitStore.set(key, rateLimitData);

      // Set rate limit headers
      res.set({
        'X-RateLimit-Limit': limits.maxRequests,
        'X-RateLimit-Remaining': limits.maxRequests - rateLimitData.requests.length,
        'X-RateLimit-Reset': Math.ceil(rateLimitData.resetTime / 1000)
      });

      next();
    } catch (error) {
      logger.error('Error in tenant rate limiting', {
        tenantId: req.tenant.tenantId,
        limitType,
        error: error.message
      });
      
      // Don't fail request on rate limit error, just log it
      next();
    }
  };
};

/**
 * Validate feature access
 */
const requireFeature = (featureName) => {
  return (req, res, next) => {
    if (!req.tenant) {
      return next(); // Skip for system endpoints
    }

    if (!req.tenant.isFeatureEnabled(featureName)) {
      return res.status(403).json({
        error: 'FEATURE_NOT_AVAILABLE',
        message: `Feature '${featureName}' is not available for your plan`,
        feature: featureName,
        plan: req.tenant.subscription.plan,
        availableIn: getFeatureAvailability(featureName)
      });
    }

    next();
  };
};

/**
 * Security context enforcement
 */
const enforceSecurityContext = (req, res, next) => {
  if (!req.tenant) {
    return next(); // Skip for system endpoints
  }

  try {
    const tenant = req.tenant;
    const security = tenant.configuration.security;

    // IP whitelist check
    if (security.ipWhitelist && security.ipWhitelist.length > 0) {
      const clientIP = req.ip || req.connection.remoteAddress;
      if (!security.ipWhitelist.includes(clientIP)) {
        return res.status(403).json({
          error: 'IP_NOT_WHITELISTED',
          message: 'Your IP address is not whitelisted',
          clientIP
        });
      }
    }

    // Domain restriction check
    if (security.allowedDomains && security.allowedDomains.length > 0) {
      const userEmail = req.user?.email;
      if (userEmail) {
        const emailDomain = userEmail.split('@')[1];
        if (!security.allowedDomains.includes(emailDomain)) {
          return res.status(403).json({
            error: 'DOMAIN_NOT_ALLOWED',
            message: 'Your email domain is not allowed',
            domain: emailDomain,
            allowedDomains: security.allowedDomains
          });
        }
      }
    }

    // Set security context
    req.securityContext = {
      ipWhitelist: security.ipWhitelist,
      allowedDomains: security.allowedDomains,
      mfaRequired: security.mfaRequired,
      sessionTimeout: security.sessionTimeout
    };

    next();
  } catch (error) {
    logger.error('Error enforcing security context', {
      tenantId: req.tenant.tenantId,
      error: error.message
    });
    
    return res.status(500).json({
      error: 'SECURITY_CONTEXT_ERROR',
      message: 'Failed to enforce security context'
    });
  }
};

/**
 * Cleanup middleware - close tenant-specific connections
 */
const cleanupTenantContext = (req, res, next) => {
  res.on('finish', () => {
    if (req.tenantDb) {
      req.tenantDb.close().catch(err => {
        logger.error('Error closing tenant database connection', err);
      });
    }
  });
  
  next();
};

/**
 * Helper function to get feature availability by plan
 */
function getFeatureAvailability(featureName) {
  const featureMatrix = {
    aiCodeGeneration: ['starter', 'professional', 'enterprise'],
    realTimeCollaboration: ['professional', 'enterprise'],
    customBranding: ['enterprise'],
    ssoIntegration: ['enterprise'],
    advancedAnalytics: ['professional', 'enterprise'],
    apiAccess: ['starter', 'professional', 'enterprise'],
    webhooks: ['professional', 'enterprise']
  };

  return featureMatrix[featureName] || [];
}

// Clean up rate limit store periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (data.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean every minute

module.exports = {
  identifyTenant,
  enforceDataIsolation,
  validateResourceQuotas,
  tenantRateLimit,
  requireFeature,
  enforceSecurityContext,
  cleanupTenantContext
};