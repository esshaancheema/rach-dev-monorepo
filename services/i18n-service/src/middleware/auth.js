const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

/**
 * Authentication and Authorization Middleware
 */

/**
 * Authenticate API requests using JWT tokens
 */
const authenticateAPI = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Access token required'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (jwtError) {
      logger.warn('Invalid JWT token', {
        error: jwtError.message,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      return res.status(401).json({
        error: 'INVALID_TOKEN',
        message: 'Invalid or expired access token'
      });
    }

  } catch (error) {
    logger.error('Authentication error', error);
    res.status(500).json({
      error: 'AUTH_ERROR',
      message: 'Authentication failed'
    });
  }
};

/**
 * Identify tenant from request headers, subdomain, or custom domain
 */
const identifyTenant = async (req, res, next) => {
  try {
    let tenantId = null;

    // Method 1: X-Tenant-ID header (highest priority)
    tenantId = req.headers['x-tenant-id'];

    // Method 2: From JWT token
    if (!tenantId && req.user?.tenantId) {
      tenantId = req.user.tenantId;
    }

    // Method 3: From subdomain
    if (!tenantId) {
      const host = req.get('host');
      if (host) {
        const subdomain = host.split('.')[0];
        if (subdomain && subdomain !== 'www' && subdomain !== 'api') {
          tenantId = subdomain;
        }
      }
    }

    // Method 4: From query parameter (lowest priority)
    if (!tenantId && req.query.tenantId) {
      tenantId = req.query.tenantId;
    }

    if (!tenantId) {
      return res.status(400).json({
        error: 'TENANT_REQUIRED',
        message: 'Tenant identification required'
      });
    }

    // Add tenant context to request
    req.tenantId = tenantId;
    
    // Add helper method to get tenant-specific models
    req.getTenantModel = (modelName) => {
      // This would integrate with the tenant service to get the appropriate model
      // For now, we'll use the tenantId for namespace isolation
      return require(`../models/${modelName}`);
    };

    next();

  } catch (error) {
    logger.error('Tenant identification error', error);
    res.status(500).json({
      error: 'TENANT_ID_ERROR',
      message: 'Failed to identify tenant'
    });
  }
};

/**
 * Check if user has specific permissions
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Authentication required'
      });
    }

    const userPermissions = req.user.permissions || [];
    const userRole = req.user.role;

    // Admin role has all permissions
    if (userRole === 'admin') {
      return next();
    }

    // Check specific permission
    if (!userPermissions.includes(permission)) {
      return res.status(403).json({
        error: 'FORBIDDEN',
        message: `Permission '${permission}' required`
      });
    }

    next();
  };
};

/**
 * Check if user belongs to the tenant
 */
const validateTenantAccess = async (req, res, next) => {
  try {
    const userTenantId = req.user?.tenantId;
    const requestTenantId = req.tenantId;

    // Super admin can access all tenants
    if (req.user?.role === 'super_admin') {
      return next();
    }

    if (!userTenantId || userTenantId !== requestTenantId) {
      return res.status(403).json({
        error: 'TENANT_ACCESS_DENIED',
        message: 'Access denied for this tenant'
      });
    }

    next();

  } catch (error) {
    logger.error('Tenant validation error', error);
    res.status(500).json({
      error: 'TENANT_VALIDATION_ERROR',
      message: 'Failed to validate tenant access'
    });
  }
};

/**
 * Rate limiting by tenant
 */
const tenantRateLimit = (maxRequests = 1000, windowMs = 15 * 60 * 1000) => {
  const tenantCounts = new Map();

  return (req, res, next) => {
    const tenantId = req.tenantId;
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!tenantCounts.has(tenantId)) {
      tenantCounts.set(tenantId, []);
    }

    const tenantRequests = tenantCounts.get(tenantId);
    
    // Remove old requests outside the window
    const validRequests = tenantRequests.filter(timestamp => timestamp > windowStart);
    tenantCounts.set(tenantId, validRequests);

    // Check if rate limit exceeded
    if (validRequests.length >= maxRequests) {
      return res.status(429).json({
        error: 'TENANT_RATE_LIMIT_EXCEEDED',
        message: 'Rate limit exceeded for this tenant',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }

    // Add current request
    validRequests.push(now);
    tenantCounts.set(tenantId, validRequests);

    next();
  };
};

/**
 * API key authentication (alternative to JWT)
 */
const authenticateAPIKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
      return res.status(401).json({
        error: 'API_KEY_REQUIRED',
        message: 'API key required'
      });
    }

    // This would validate the API key against the tenant service
    // For now, we'll implement a simple validation
    if (!apiKey.startsWith('zpt_')) {
      return res.status(401).json({
        error: 'INVALID_API_KEY',
        message: 'Invalid API key format'
      });
    }

    // Extract tenant ID from API key (simplified)
    const parts = apiKey.split('_');
    if (parts.length < 3) {
      return res.status(401).json({
        error: 'INVALID_API_KEY',
        message: 'Invalid API key format'
      });
    }

    req.tenantId = parts[1];
    req.user = {
      id: 'api_user',
      role: 'api',
      tenantId: parts[1],
      permissions: ['translations:read', 'translations:write']
    };

    next();

  } catch (error) {
    logger.error('API key authentication error', error);
    res.status(500).json({
      error: 'API_KEY_AUTH_ERROR',
      message: 'API key authentication failed'
    });
  }
};

module.exports = {
  authenticateAPI,
  authenticateAPIKey,
  identifyTenant,
  requirePermission,
  validateTenantAccess,
  tenantRateLimit
};