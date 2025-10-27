interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  identifier: string; // IP address or user ID
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: any) => string;
}

interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

interface RequestInfo {
  identifier: string;
  pathname: string;
  userAgent: string;
  method?: string;
}

export class RateLimiter {
  private store: Map<string, { count: number; resetTime: number }> = new Map();
  private configs: Map<string, RateLimitConfig> = new Map();

  constructor() {
    this.initializeConfigs();
    this.startCleanupInterval();
  }

  private initializeConfigs(): void {
    // API endpoints - stricter limits
    this.configs.set('/api/contact', {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 5, // 5 submissions per 15 minutes
      identifier: 'ip'
    });

    this.configs.set('/api/newsletter', {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 3, // 3 signups per hour
      identifier: 'ip'
    });

    this.configs.set('/api/auth', {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 10, // 10 auth attempts per 15 minutes
      identifier: 'ip'
    });

    this.configs.set('/api/upload', {
      windowMs: 10 * 60 * 1000, // 10 minutes
      maxRequests: 20, // 20 uploads per 10 minutes
      identifier: 'ip'
    });

    // General API rate limit
    this.configs.set('/api/*', {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 100, // 100 requests per minute
      identifier: 'ip'
    });

    // Page requests - more lenient
    this.configs.set('/*', {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 200, // 200 page requests per minute
      identifier: 'ip'
    });

    // Search functionality
    this.configs.set('/search', {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 30, // 30 searches per minute
      identifier: 'ip'
    });

    // Bot protection - very strict for suspected bots
    this.configs.set('bot-protection', {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 50, // 50 requests per hour for bots
      identifier: 'ip'
    });
  }

  async checkLimit(requestInfo: RequestInfo): Promise<RateLimitResult> {
    const { identifier, pathname, userAgent } = requestInfo;
    
    // Determine which rate limit config to use
    const config = this.getConfigForPath(pathname);
    
    // Check if request should be treated as a bot
    const isBot = this.detectBot(userAgent);
    const finalConfig = isBot ? this.configs.get('bot-protection')! : config;
    
    // Generate cache key
    const key = this.generateKey(identifier, pathname, finalConfig);
    
    // Get current state
    const now = Date.now();
    const current = this.store.get(key) || { count: 0, resetTime: now + finalConfig.windowMs };
    
    // Reset if window has expired
    if (now >= current.resetTime) {
      current.count = 0;
      current.resetTime = now + finalConfig.windowMs;
    }
    
    // Check if limit exceeded
    if (current.count >= finalConfig.maxRequests) {
      return {
        allowed: false,
        limit: finalConfig.maxRequests,
        remaining: 0,
        resetTime: current.resetTime,
        retryAfter: Math.ceil((current.resetTime - now) / 1000)
      };
    }
    
    // Increment counter
    current.count++;
    this.store.set(key, current);
    
    return {
      allowed: true,
      limit: finalConfig.maxRequests,
      remaining: finalConfig.maxRequests - current.count,
      resetTime: current.resetTime
    };
  }

  private getConfigForPath(pathname: string): RateLimitConfig {
    // Check for exact matches first
    if (this.configs.has(pathname)) {
      return this.configs.get(pathname)!;
    }
    
    // Check for pattern matches
    for (const [pattern, config] of this.configs.entries()) {
      if (pattern.includes('*')) {
        const regex = new RegExp(pattern.replace('*', '.*'));
        if (regex.test(pathname)) {
          return config;
        }
      }
    }
    
    // Default fallback
    return this.configs.get('/*')!;
  }

  private detectBot(userAgent: string): boolean {
    const botPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i,
      /python-requests/i,
      /postman/i,
      /insomnia/i,
      /httpie/i,
      /axios/i,
      /go-http-client/i,
    ];
    
    return botPatterns.some(pattern => pattern.test(userAgent));
  }

  private generateKey(identifier: string, pathname: string, config: RateLimitConfig): string {
    if (config.keyGenerator) {
      return config.keyGenerator({ identifier, pathname });
    }
    
    return `${identifier}:${pathname}:${config.windowMs}:${config.maxRequests}`;
  }

  // Advanced rate limiting features
  
  // Sliding window rate limiter
  async slidingWindowCheck(requestInfo: RequestInfo): Promise<RateLimitResult> {
    const { identifier, pathname } = requestInfo;
    const config = this.getConfigForPath(pathname);
    const key = `sliding:${identifier}:${pathname}`;
    
    const now = Date.now();
    const windowStart = now - config.windowMs;
    
    // Get existing timestamps
    const timestamps = this.getTimestamps(key) || [];
    
    // Remove old timestamps
    const validTimestamps = timestamps.filter(ts => ts > windowStart);
    
    // Check if limit exceeded
    if (validTimestamps.length >= config.maxRequests) {
      const oldestTimestamp = Math.min(...validTimestamps);
      const retryAfter = Math.ceil((oldestTimestamp + config.windowMs - now) / 1000);
      
      return {
        allowed: false,
        limit: config.maxRequests,
        remaining: 0,
        resetTime: oldestTimestamp + config.windowMs,
        retryAfter
      };
    }
    
    // Add current timestamp
    validTimestamps.push(now);
    this.setTimestamps(key, validTimestamps);
    
    return {
      allowed: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - validTimestamps.length,
      resetTime: now + config.windowMs
    };
  }

  // Token bucket rate limiter
  async tokenBucketCheck(
    identifier: string, 
    tokensRequested: number = 1,
    bucketSize: number = 100,
    refillRate: number = 10 // tokens per second
  ): Promise<RateLimitResult> {
    const key = `bucket:${identifier}`;
    const now = Date.now();
    
    const bucket = this.getBucket(key) || {
      tokens: bucketSize,
      lastRefill: now
    };
    
    // Refill tokens
    const timePassed = (now - bucket.lastRefill) / 1000;
    const tokensToAdd = Math.floor(timePassed * refillRate);
    bucket.tokens = Math.min(bucketSize, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;
    
    // Check if enough tokens available
    if (bucket.tokens < tokensRequested) {
      const tokensNeeded = tokensRequested - bucket.tokens;
      const retryAfter = Math.ceil(tokensNeeded / refillRate);
      
      return {
        allowed: false,
        limit: bucketSize,
        remaining: bucket.tokens,
        resetTime: now + (retryAfter * 1000),
        retryAfter
      };
    }
    
    // Consume tokens
    bucket.tokens -= tokensRequested;
    this.setBucket(key, bucket);
    
    return {
      allowed: true,
      limit: bucketSize,
      remaining: bucket.tokens,
      resetTime: now + ((bucketSize - bucket.tokens) / refillRate * 1000)
    };
  }

  // IP-based progressive rate limiting
  async progressiveRateLimit(requestInfo: RequestInfo): Promise<RateLimitResult> {
    const { identifier, pathname } = requestInfo;
    const key = `progressive:${identifier}`;
    
    const violations = this.getViolations(key) || 0;
    
    // Calculate current limits based on violation history
    const baseLimit = 100;
    const currentLimit = Math.max(10, baseLimit - (violations * 10));
    const windowMs = Math.min(60 * 60 * 1000, 60 * 1000 * Math.pow(2, violations)); // Exponential backoff
    
    const result = await this.checkLimit({
      ...requestInfo,
      pathname: `progressive:${pathname}`
    });
    
    // Track violations for progressive limiting
    if (!result.allowed) {
      this.incrementViolations(key);
    } else if (violations > 0 && Math.random() < 0.1) {
      // Gradually reduce violations on successful requests (10% chance)
      this.decrementViolations(key);
    }
    
    return {
      ...result,
      limit: currentLimit
    };
  }

  // Geolocation-based rate limiting
  async geoRateLimit(
    requestInfo: RequestInfo & { country?: string; city?: string }
  ): Promise<RateLimitResult> {
    const { identifier, country, city } = requestInfo;
    
    // Different limits for different regions
    const geoLimits: Record<string, { maxRequests: number; windowMs: number }> = {
      'US': { maxRequests: 200, windowMs: 60 * 1000 },
      'CA': { maxRequests: 200, windowMs: 60 * 1000 },
      'GB': { maxRequests: 150, windowMs: 60 * 1000 },
      'DE': { maxRequests: 150, windowMs: 60 * 1000 },
      'FR': { maxRequests: 150, windowMs: 60 * 1000 },
      'JP': { maxRequests: 100, windowMs: 60 * 1000 },
      'AU': { maxRequests: 100, windowMs: 60 * 1000 },
      'default': { maxRequests: 50, windowMs: 60 * 1000 }
    };
    
    const limits = geoLimits[country || 'default'] || geoLimits.default;
    const key = `geo:${identifier}:${country}`;
    
    return this.checkSpecificLimit(key, limits.maxRequests, limits.windowMs);
  }

  private async checkSpecificLimit(
    key: string, 
    maxRequests: number, 
    windowMs: number
  ): Promise<RateLimitResult> {
    const now = Date.now();
    const current = this.store.get(key) || { count: 0, resetTime: now + windowMs };
    
    if (now >= current.resetTime) {
      current.count = 0;
      current.resetTime = now + windowMs;
    }
    
    if (current.count >= maxRequests) {
      return {
        allowed: false,
        limit: maxRequests,
        remaining: 0,
        resetTime: current.resetTime,
        retryAfter: Math.ceil((current.resetTime - now) / 1000)
      };
    }
    
    current.count++;
    this.store.set(key, current);
    
    return {
      allowed: true,
      limit: maxRequests,
      remaining: maxRequests - current.count,
      resetTime: current.resetTime
    };
  }

  // Helper methods for different storage types
  private getTimestamps(key: string): number[] {
    const data = this.store.get(`timestamps:${key}`);
    return data ? (data as any).timestamps : [];
  }

  private setTimestamps(key: string, timestamps: number[]): void {
    this.store.set(`timestamps:${key}`, { timestamps, resetTime: Date.now() + 60 * 60 * 1000 });
  }

  private getBucket(key: string): { tokens: number; lastRefill: number } | null {
    const data = this.store.get(key);
    return data ? data as any : null;
  }

  private setBucket(key: string, bucket: { tokens: number; lastRefill: number }): void {
    this.store.set(key, bucket);
  }

  private getViolations(key: string): number {
    const data = this.store.get(`violations:${key}`);
    return data ? (data as any).count : 0;
  }

  private incrementViolations(key: string): void {
    const current = this.getViolations(key);
    this.store.set(`violations:${key}`, { 
      count: current + 1, 
      resetTime: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    });
  }

  private decrementViolations(key: string): void {
    const current = this.getViolations(key);
    if (current > 0) {
      this.store.set(`violations:${key}`, { 
        count: current - 1, 
        resetTime: Date.now() + 24 * 60 * 60 * 1000
      });
    }
  }

  // Cleanup expired entries
  private startCleanupInterval(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [key, value] of this.store.entries()) {
        if (value.resetTime && value.resetTime < now) {
          this.store.delete(key);
        }
      }
    }, 5 * 60 * 1000); // Cleanup every 5 minutes
  }

  // Get statistics
  getStats(): {
    totalKeys: number;
    activeKeys: number;
    memoryUsage: number;
  } {
    const now = Date.now();
    let activeKeys = 0;
    
    for (const [, value] of this.store.entries()) {
      if (!value.resetTime || value.resetTime > now) {
        activeKeys++;
      }
    }
    
    return {
      totalKeys: this.store.size,
      activeKeys,
      memoryUsage: JSON.stringify([...this.store.entries()]).length
    };
  }

  // Clear all rate limit data
  clear(): void {
    this.store.clear();
  }

  // Reset rate limit for specific key
  reset(identifier: string, pathname?: string): void {
    if (pathname) {
      const config = this.getConfigForPath(pathname);
      const key = this.generateKey(identifier, pathname, config);
      this.store.delete(key);
    } else {
      // Remove all entries for this identifier
      for (const key of this.store.keys()) {
        if (key.includes(identifier)) {
          this.store.delete(key);
        }
      }
    }
  }
}