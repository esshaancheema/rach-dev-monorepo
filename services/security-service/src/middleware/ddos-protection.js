const Redis = require('ioredis');
const logger = require('../utils/logger');

/**
 * Advanced DDoS Protection Middleware
 * 
 * Implements multiple layers of DDoS protection:
 * - Rate limiting
 * - Request pattern analysis
 * - Geographic filtering
 * - Behavioral analysis
 * - Automatic blocking
 */

class DDoSProtection {
  constructor() {
    this.redis = new Redis(process.env.REDIS_URL);
    this.cache = new Map(); // In-memory cache for performance
    
    // Configuration
    this.config = {
      // Basic rate limits
      rateLimits: {
        global: { window: 60, maxRequests: 1000 },
        perIP: { window: 60, maxRequests: 100 },
        perUser: { window: 60, maxRequests: 200 },
        perEndpoint: { window: 60, maxRequests: 50 }
      },
      
      // DDoS detection thresholds
      ddosThresholds: {
        requestsPerSecond: 50,
        concurrentConnections: 100,
        suspiciousPatterns: 5,
        failedRequests: 20
      },
      
      // Blocking durations (in seconds)
      blockDuration: {
        warning: 300,      // 5 minutes
        temporary: 1800,   // 30 minutes
        extended: 3600,    // 1 hour
        permanent: 86400   // 24 hours
      },
      
      // Geographic restrictions
      allowedCountries: process.env.ALLOWED_COUNTRIES?.split(',') || [],
      blockedCountries: process.env.BLOCKED_COUNTRIES?.split(',') || ['CN', 'RU', 'KP'],
      
      // Whitelist/Blacklist
      whitelist: new Set(process.env.IP_WHITELIST?.split(',') || []),
      blacklist: new Set()
    };
    
    // Initialize patterns
    this.suspiciousPatterns = [
      /bot|crawler|spider|scraper/i,
      /wget|curl|python|php/i,
      /sqlmap|nmap|nikto|dirb/i,
      /\.\.\/|%2e%2e%2f/i,
      /<script|javascript:|vbscript:/i
    ];
    
    // Start cleanup processes
    this.startCleanupTasks();
  }

  /**
   * Main DDoS protection middleware
   */
  async protect(req, res, next) {
    try {
      const clientIP = this.getClientIP(req);
      const userAgent = req.get('User-Agent') || '';
      const endpoint = req.path;
      const userId = req.user?.id;
      
      // Check whitelist first
      if (this.config.whitelist.has(clientIP)) {
        return next();
      }
      
      // Check blacklist
      if (this.config.blacklist.has(clientIP)) {
        return this.blockRequest(res, 'IP_BLACKLISTED', 'Your IP address has been blacklisted');
      }
      
      // Check if IP is already blocked
      const blockStatus = await this.checkBlockStatus(clientIP);
      if (blockStatus.blocked) {
        return this.blockRequest(res, 'IP_BLOCKED', blockStatus.reason, blockStatus.expiresAt);
      }
      
      // Geographic filtering
      const geoCheck = await this.checkGeographicRestrictions(clientIP);
      if (!geoCheck.allowed) {
        await this.addToBlacklist(clientIP, 'GEO_RESTRICTED', this.config.blockDuration.extended);
        return this.blockRequest(res, 'GEO_RESTRICTED', 'Access from your location is not permitted');
      }
      
      // Rate limiting checks
      const rateLimitCheck = await this.checkRateLimits(clientIP, userId, endpoint);
      if (!rateLimitCheck.allowed) {
        await this.recordViolation(clientIP, 'RATE_LIMIT_EXCEEDED', rateLimitCheck);
        return this.blockRequest(res, 'RATE_LIMIT_EXCEEDED', 'Too many requests', rateLimitCheck.resetTime);
      }
      
      // Suspicious pattern detection
      const patternCheck = this.checkSuspiciousPatterns(req, userAgent);
      if (!patternCheck.safe) {
        await this.recordViolation(clientIP, 'SUSPICIOUS_PATTERN', patternCheck);
        await this.addToBlacklist(clientIP, 'SUSPICIOUS_ACTIVITY', this.config.blockDuration.temporary);
        return this.blockRequest(res, 'SUSPICIOUS_ACTIVITY', 'Suspicious request pattern detected');
      }
      
      // Request validation
      const validationCheck = this.validateRequest(req);
      if (!validationCheck.valid) {
        await this.recordViolation(clientIP, 'INVALID_REQUEST', validationCheck);
        return this.blockRequest(res, 'INVALID_REQUEST', 'Invalid request format');
      }
      
      // Record legitimate request
      await this.recordRequest(clientIP, userId, endpoint);
      
      // Add security headers
      this.addSecurityHeaders(res);
      
      // Continue to next middleware
      next();
      
    } catch (error) {
      logger.error('DDoS protection error', error);
      next(); // Fail open for availability
    }
  }

  /**
   * Check rate limits
   */
  async checkRateLimits(clientIP, userId, endpoint) {
    const now = Date.now();
    const checks = [];
    
    // Global rate limit
    checks.push(this.checkRateLimit('global', 'all', this.config.rateLimits.global));
    
    // Per-IP rate limit
    checks.push(this.checkRateLimit('ip', clientIP, this.config.rateLimits.perIP));
    
    // Per-user rate limit (if authenticated)
    if (userId) {
      checks.push(this.checkRateLimit('user', userId, this.config.rateLimits.perUser));
    }
    
    // Per-endpoint rate limit
    checks.push(this.checkRateLimit('endpoint', `${clientIP}:${endpoint}`, this.config.rateLimits.perEndpoint));
    
    const results = await Promise.all(checks);
    const violated = results.find(result => !result.allowed);
    
    if (violated) {
      return {
        allowed: false,
        reason: violated.reason,
        resetTime: violated.resetTime,
        current: violated.current,
        limit: violated.limit
      };
    }
    
    return { allowed: true };
  }

  /**
   * Individual rate limit check
   */
  async checkRateLimit(type, identifier, config) {
    const key = `rate_limit:${type}:${identifier}`;
    const window = config.window * 1000; // Convert to milliseconds
    const now = Date.now();
    const windowStart = now - window;
    
    try {
      // Get current count
      const current = await this.redis.zcount(key, windowStart, now);
      
      if (current >= config.maxRequests) {
        const resetTime = await this.redis.zrange(key, 0, 0, 'WITHSCORES');
        const oldestRequest = resetTime[1] ? parseInt(resetTime[1]) : now;
        
        return {
          allowed: false,
          reason: `${type.toUpperCase()}_RATE_LIMIT`,
          resetTime: new Date(oldestRequest + window),
          current,
          limit: config.maxRequests
        };
      }
      
      // Add current request
      await this.redis.zadd(key, now, `${now}-${Math.random()}`);
      
      // Clean old entries and set expiration
      await this.redis.zremrangebyscore(key, 0, windowStart);
      await this.redis.expire(key, Math.ceil(window / 1000));
      
      return {
        allowed: true,
        current: current + 1,
        limit: config.maxRequests,
        resetTime: new Date(now + window)
      };
      
    } catch (error) {
      logger.error(`Rate limit check error for ${key}`, error);
      return { allowed: true }; // Fail open
    }
  }

  /**
   * Check suspicious patterns
   */
  checkSuspiciousPatterns(req, userAgent) {
    const suspiciousIndicators = [];
    
    // User-Agent patterns
    for (const pattern of this.suspiciousPatterns) {
      if (pattern.test(userAgent)) {
        suspiciousIndicators.push(`Suspicious User-Agent: ${userAgent}`);
      }
    }
    
    // Request path patterns
    const path = req.path;
    if (/\.(php|asp|jsp|cgi)$/i.test(path)) {
      suspiciousIndicators.push(`Suspicious file extension in path: ${path}`);
    }
    
    // Query parameter patterns
    const queryString = req.url.split('?')[1] || '';
    if (queryString.length > 1000) {
      suspiciousIndicators.push('Unusually long query string');
    }
    
    // Header anomalies
    const headers = req.headers;
    if (!headers.accept || headers.accept === '*/*') {
      suspiciousIndicators.push('Missing or generic Accept header');
    }
    
    if (headers['x-forwarded-for'] && headers['x-forwarded-for'].split(',').length > 5) {
      suspiciousIndicators.push('Too many proxy hops');
    }
    
    // HTTP method validation
    if (!['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'].includes(req.method)) {
      suspiciousIndicators.push(`Unusual HTTP method: ${req.method}`);
    }
    
    return {
      safe: suspiciousIndicators.length === 0,
      indicators: suspiciousIndicators
    };
  }

  /**
   * Validate request format
   */
  validateRequest(req) {
    const violations = [];
    
    // Content-Length validation
    if (req.headers['content-length']) {
      const contentLength = parseInt(req.headers['content-length']);
      if (contentLength > 50 * 1024 * 1024) { // 50MB limit
        violations.push('Content-Length too large');
      }
    }
    
    // Host header validation
    if (!req.headers.host) {
      violations.push('Missing Host header');
    }
    
    // Request URI length
    if (req.url.length > 2048) {
      violations.push('Request URI too long');
    }
    
    // Header count validation
    if (Object.keys(req.headers).length > 50) {
      violations.push('Too many headers');
    }
    
    return {
      valid: violations.length === 0,
      violations
    };
  }

  /**
   * Geographic restrictions check
   */
  async checkGeographicRestrictions(clientIP) {
    try {
      // This would integrate with a GeoIP service
      // For now, we'll use a placeholder implementation
      const geoData = await this.getGeoLocation(clientIP);
      
      if (!geoData) {
        return { allowed: true }; // Allow if geo data unavailable
      }
      
      // Check blocked countries
      if (this.config.blockedCountries.includes(geoData.country)) {
        return {
          allowed: false,
          reason: `Access blocked from ${geoData.country}`,
          country: geoData.country
        };
      }
      
      // Check allowed countries (if list exists)
      if (this.config.allowedCountries.length > 0 && 
          !this.config.allowedCountries.includes(geoData.country)) {
        return {
          allowed: false,
          reason: `Access only allowed from specific countries`,
          country: geoData.country
        };
      }
      
      return { allowed: true, country: geoData.country };
      
    } catch (error) {
      logger.error('Geographic check error', error);
      return { allowed: true }; // Fail open
    }
  }

  /**
   * Check if IP is currently blocked
   */
  async checkBlockStatus(clientIP) {
    try {
      const blockKey = `blocked_ip:${clientIP}`;
      const blockData = await this.redis.get(blockKey);
      
      if (blockData) {
        const block = JSON.parse(blockData);
        if (Date.now() < block.expiresAt) {
          return {
            blocked: true,
            reason: block.reason,
            expiresAt: new Date(block.expiresAt),
            blockedAt: new Date(block.blockedAt)
          };
        } else {
          // Block expired, remove it
          await this.redis.del(blockKey);
        }
      }
      
      return { blocked: false };
      
    } catch (error) {
      logger.error('Block status check error', error);
      return { blocked: false };
    }
  }

  /**
   * Add IP to blacklist/blocklist
   */
  async addToBlacklist(clientIP, reason, duration) {
    try {
      const blockKey = `blocked_ip:${clientIP}`;
      const expiresAt = Date.now() + (duration * 1000);
      
      const blockData = {
        reason,
        blockedAt: Date.now(),
        expiresAt,
        violations: await this.getViolationCount(clientIP)
      };
      
      await this.redis.setex(blockKey, duration, JSON.stringify(blockData));
      
      // Add to blacklist set for faster lookups
      this.config.blacklist.add(clientIP);
      
      // Log the block
      logger.warn('IP blocked', {
        ip: clientIP,
        reason,
        duration,
        expiresAt: new Date(expiresAt)
      });
      
      // Clean up after expiry
      setTimeout(() => {
        this.config.blacklist.delete(clientIP);
      }, duration * 1000);
      
    } catch (error) {
      logger.error('Error adding to blacklist', error);
    }
  }

  /**
   * Record security violation
   */
  async recordViolation(clientIP, type, details) {
    try {
      const violationKey = `violations:${clientIP}`;
      const violation = {
        type,
        timestamp: Date.now(),
        details,
        userAgent: details.userAgent || 'unknown'
      };
      
      // Add to sorted set with timestamp as score
      await this.redis.zadd(violationKey, Date.now(), JSON.stringify(violation));
      
      // Keep only last 100 violations per IP
      await this.redis.zremrangebyrank(violationKey, 0, -101);
      
      // Set expiration
      await this.redis.expire(violationKey, 86400); // 24 hours
      
      // Check if IP should be blocked based on violation count
      const recentViolations = await this.redis.zcount(
        violationKey, 
        Date.now() - (5 * 60 * 1000), // Last 5 minutes
        Date.now()
      );
      
      if (recentViolations >= this.config.ddosThresholds.suspiciousPatterns) {
        await this.addToBlacklist(clientIP, 'MULTIPLE_VIOLATIONS', this.config.blockDuration.temporary);
      }
      
    } catch (error) {
      logger.error('Error recording violation', error);
    }
  }

  /**
   * Record legitimate request
   */
  async recordRequest(clientIP, userId, endpoint) {
    try {
      const requestKey = `requests:${clientIP}`;
      const requestData = {
        timestamp: Date.now(),
        userId,
        endpoint,
        legitimate: true
      };
      
      await this.redis.zadd(requestKey, Date.now(), JSON.stringify(requestData));
      
      // Keep only last 1000 requests per IP
      await this.redis.zremrangebyrank(requestKey, 0, -1001);
      
      // Set expiration
      await this.redis.expire(requestKey, 3600); // 1 hour
      
    } catch (error) {
      logger.error('Error recording request', error);
    }
  }

  /**
   * Get violation count for IP
   */
  async getViolationCount(clientIP) {
    try {
      const violationKey = `violations:${clientIP}`;
      return await this.redis.zcard(violationKey);
    } catch (error) {
      return 0;
    }
  }

  /**
   * Block request and send response
   */
  blockRequest(res, code, message, expiresAt = null) {
    const responseBody = {
      error: code,
      message,
      timestamp: new Date().toISOString()
    };
    
    if (expiresAt) {
      responseBody.retryAfter = Math.ceil((expiresAt.getTime() - Date.now()) / 1000);
      res.set('Retry-After', responseBody.retryAfter.toString());
    }
    
    // Add security headers
    res.set({
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block'
    });
    
    return res.status(429).json(responseBody);
  }

  /**
   * Add security headers
   */
  addSecurityHeaders(res) {
    res.set({
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    });
  }

  /**
   * Get client IP address
   */
  getClientIP(req) {
    return req.headers['cf-connecting-ip'] ||
           req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
           req.headers['x-real-ip'] ||
           req.connection?.remoteAddress ||
           req.socket?.remoteAddress ||
           req.ip ||
           '127.0.0.1';
  }

  /**
   * Get geo location (placeholder - would integrate with MaxMind or similar)
   */
  async getGeoLocation(ip) {
    // This would integrate with a real GeoIP service
    // For now, return null to allow all requests
    return null;
  }

  /**
   * Start cleanup tasks
   */
  startCleanupTasks() {
    // Clean up expired entries every 5 minutes
    setInterval(async () => {
      try {
        await this.cleanupExpiredEntries();
      } catch (error) {
        logger.error('Cleanup task error', error);
      }
    }, 5 * 60 * 1000);
    
    // Update blacklist from Redis every minute
    setInterval(async () => {
      try {
        await this.syncBlacklist();
      } catch (error) {
        logger.error('Blacklist sync error', error);
      }
    }, 60 * 1000);
  }

  /**
   * Clean up expired entries
   */
  async cleanupExpiredEntries() {
    const now = Date.now();
    const keys = await this.redis.keys('rate_limit:*');
    
    for (const key of keys) {
      // Remove entries older than window
      await this.redis.zremrangebyscore(key, 0, now - (60 * 1000));
    }
  }

  /**
   * Sync blacklist with Redis
   */
  async syncBlacklist() {
    const blockedIPs = await this.redis.keys('blocked_ip:*');
    
    for (const key of blockedIPs) {
      const ip = key.replace('blocked_ip:', '');
      const blockData = await this.redis.get(key);
      
      if (blockData) {
        const block = JSON.parse(blockData);
        if (Date.now() < block.expiresAt) {
          this.config.blacklist.add(ip);
        } else {
          this.config.blacklist.delete(ip);
          await this.redis.del(key);
        }
      }
    }
  }

  /**
   * Get DDoS protection statistics
   */
  async getStatistics() {
    try {
      const stats = {
        blockedIPs: this.config.blacklist.size,
        whitelistedIPs: this.config.whitelist.size,
        activeBlocks: 0,
        recentViolations: 0,
        rateLimitHits: 0
      };
      
      // Count active blocks
      const blockedKeys = await this.redis.keys('blocked_ip:*');
      stats.activeBlocks = blockedKeys.length;
      
      // Count recent violations (last hour)
      const violationKeys = await this.redis.keys('violations:*');
      for (const key of violationKeys) {
        const recentCount = await this.redis.zcount(
          key,
          Date.now() - (60 * 60 * 1000),
          Date.now()
        );
        stats.recentViolations += recentCount;
      }
      
      return stats;
      
    } catch (error) {
      logger.error('Error getting statistics', error);
      return null;
    }
  }

  /**
   * Manual IP management
   */
  async addToWhitelist(ip) {
    this.config.whitelist.add(ip);
    logger.info('IP added to whitelist', { ip });
  }

  async removeFromWhitelist(ip) {
    this.config.whitelist.delete(ip);
    logger.info('IP removed from whitelist', { ip });
  }

  async manualBlock(ip, reason, duration) {
    await this.addToBlacklist(ip, reason, duration);
    logger.info('IP manually blocked', { ip, reason, duration });
  }

  async unblockIP(ip) {
    const blockKey = `blocked_ip:${ip}`;
    await this.redis.del(blockKey);
    this.config.blacklist.delete(ip);
    logger.info('IP manually unblocked', { ip });
  }
}

module.exports = DDoSProtection;