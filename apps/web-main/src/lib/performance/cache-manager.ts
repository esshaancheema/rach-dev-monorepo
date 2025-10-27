// Advanced Cache Management System for Zoptal Platform
import { analytics } from '@/lib/analytics/tracker';

export interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize?: number; // Maximum cache size in bytes
  compression?: boolean;
  persistToDisk?: boolean;
  tags?: string[];
}

export interface CacheEntry<T = any> {
  key: string;
  value: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
  size: number;
  tags: string[];
  compressed: boolean;
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  totalKeys: number;
  totalSize: number;
  maxSize: number;
  evictions: number;
  averageAccessTime: number;
}

export interface CacheStrategy {
  name: string;
  shouldCache: (key: string, value: any) => boolean;
  shouldEvict: (entry: CacheEntry) => boolean;
  priority: (entry: CacheEntry) => number;
}

export class CacheManager {
  private static instance: CacheManager;
  private caches: Map<string, InMemoryCache> = new Map();
  private globalStats: CacheStats = {
    hits: 0,
    misses: 0,
    hitRate: 0,
    totalKeys: 0,
    totalSize: 0,
    maxSize: 0,
    evictions: 0,
    averageAccessTime: 0
  };

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  private constructor() {
    this.initializeDefaultCaches();
    this.startMaintenanceWorker();
  }

  /**
   * Create or get a cache instance
   */
  createCache(name: string, config: CacheConfig): InMemoryCache {
    if (this.caches.has(name)) {
      return this.caches.get(name)!;
    }

    const cache = new InMemoryCache(name, config);
    this.caches.set(name, cache);

    analytics.track({
      name: 'cache_created',
      category: 'performance',
      properties: {
        cache_name: name,
        ttl: config.ttl,
        max_size: config.maxSize
      }
    });

    return cache;
  }

  /**
   * Get cache by name
   */
  getCache(name: string): InMemoryCache | undefined {
    return this.caches.get(name);
  }

  /**
   * Delete cache
   */
  deleteCache(name: string): boolean {
    const cache = this.caches.get(name);
    if (cache) {
      cache.clear();
      this.caches.delete(name);
      return true;
    }
    return false;
  }

  /**
   * Clear all caches
   */
  clearAll(): void {
    this.caches.forEach(cache => cache.clear());
    this.resetGlobalStats();

    analytics.track({
      name: 'all_caches_cleared',
      category: 'performance'
    });
  }

  /**
   * Get global cache statistics
   */
  getGlobalStats(): CacheStats {
    let totalHits = 0;
    let totalMisses = 0;
    let totalKeys = 0;
    let totalSize = 0;
    let totalEvictions = 0;
    let totalAccessTime = 0;

    this.caches.forEach(cache => {
      const stats = cache.getStats();
      totalHits += stats.hits;
      totalMisses += stats.misses;
      totalKeys += stats.totalKeys;
      totalSize += stats.totalSize;
      totalEvictions += stats.evictions;
      totalAccessTime += stats.averageAccessTime;
    });

    this.globalStats = {
      hits: totalHits,
      misses: totalMisses,
      hitRate: totalHits + totalMisses > 0 ? (totalHits / (totalHits + totalMisses)) * 100 : 0,
      totalKeys,
      totalSize,
      maxSize: Array.from(this.caches.values()).reduce((sum, cache) => sum + (cache.getConfig().maxSize || 0), 0),
      evictions: totalEvictions,
      averageAccessTime: this.caches.size > 0 ? totalAccessTime / this.caches.size : 0
    };

    return this.globalStats;
  }

  /**
   * Get all cache names
   */
  getCacheNames(): string[] {
    return Array.from(this.caches.keys());
  }

  /**
   * Invalidate entries by tag
   */
  invalidateByTag(tag: string): number {
    let totalInvalidated = 0;

    this.caches.forEach(cache => {
      totalInvalidated += cache.invalidateByTag(tag);
    });

    analytics.track({
      name: 'cache_invalidated_by_tag',
      category: 'performance',
      properties: {
        tag,
        entries_invalidated: totalInvalidated
      }
    });

    return totalInvalidated;
  }

  /**
   * Warm up caches with commonly accessed data
   */
  async warmUp(cacheWarmupTasks: Array<{ cacheName: string; key: string; loader: () => Promise<any> }>): Promise<void> {
    const warmupPromises = cacheWarmupTasks.map(async ({ cacheName, key, loader }) => {
      const cache = this.getCache(cacheName);
      if (cache && !cache.has(key)) {
        try {
          const value = await loader();
          cache.set(key, value);
        } catch (error) {
          console.error(`Cache warmup failed for ${cacheName}:${key}:`, error);
        }
      }
    });

    await Promise.allSettled(warmupPromises);

    analytics.track({
      name: 'cache_warmup_completed',
      category: 'performance',
      properties: {
        tasks_count: cacheWarmupTasks.length
      }
    });
  }

  /**
   * Export cache data for backup
   */
  exportCacheData(): { [cacheName: string]: Array<{ key: string; value: any; metadata: any }> } {
    const exportData: { [cacheName: string]: Array<{ key: string; value: any; metadata: any }> } = {};

    this.caches.forEach((cache, name) => {
      exportData[name] = cache.exportData();
    });

    return exportData;
  }

  /**
   * Import cache data from backup
   */
  importCacheData(data: { [cacheName: string]: Array<{ key: string; value: any; metadata: any }> }): void {
    Object.entries(data).forEach(([cacheName, entries]) => {
      const cache = this.getCache(cacheName);
      if (cache) {
        cache.importData(entries);
      }
    });
  }

  private initializeDefaultCaches(): void {
    // API Response Cache
    this.createCache('api', {
      ttl: 5 * 60 * 1000, // 5 minutes
      maxSize: 50 * 1024 * 1024, // 50MB
      compression: true,
      tags: ['api']
    });

    // Static Content Cache
    this.createCache('static', {
      ttl: 60 * 60 * 1000, // 1 hour
      maxSize: 100 * 1024 * 1024, // 100MB
      compression: true,
      tags: ['static']
    });

    // User Session Cache
    this.createCache('session', {
      ttl: 24 * 60 * 60 * 1000, // 24 hours
      maxSize: 10 * 1024 * 1024, // 10MB
      compression: false,
      tags: ['session']
    });

    // Image Cache
    this.createCache('images', {
      ttl: 7 * 24 * 60 * 60 * 1000, // 1 week
      maxSize: 200 * 1024 * 1024, // 200MB
      compression: true,
      tags: ['images', 'static']
    });

    // Analytics Cache
    this.createCache('analytics', {
      ttl: 10 * 60 * 1000, // 10 minutes
      maxSize: 20 * 1024 * 1024, // 20MB
      compression: true,
      tags: ['analytics']
    });
  }

  private startMaintenanceWorker(): void {
    // Run maintenance every 5 minutes
    setInterval(() => {
      this.runMaintenance();
    }, 5 * 60 * 1000);
  }

  private runMaintenance(): void {
    this.caches.forEach(cache => {
      cache.cleanup();
    });

    // Update global stats
    this.getGlobalStats();

    // Log maintenance stats
    analytics.track({
      name: 'cache_maintenance_completed',
      category: 'performance',
      properties: {
        cache_count: this.caches.size,
        total_keys: this.globalStats.totalKeys,
        total_size: this.globalStats.totalSize,
        hit_rate: this.globalStats.hitRate
      }
    });
  }

  private resetGlobalStats(): void {
    this.globalStats = {
      hits: 0,
      misses: 0,
      hitRate: 0,
      totalKeys: 0,
      totalSize: 0,
      maxSize: 0,
      evictions: 0,
      averageAccessTime: 0
    };
  }
}

export class InMemoryCache {
  private entries: Map<string, CacheEntry> = new Map();
  private accessTimes: number[] = [];
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    hitRate: 0,
    totalKeys: 0,
    totalSize: 0,
    maxSize: 0,
    evictions: 0,
    averageAccessTime: 0
  };

  constructor(
    private name: string,
    private config: CacheConfig
  ) {
    this.stats.maxSize = config.maxSize || 0;
  }

  /**
   * Set cache entry
   */
  set(key: string, value: any, customTtl?: number): void {
    const startTime = performance.now();

    // Check if we need to evict entries
    if (this.config.maxSize && this.stats.totalSize >= this.config.maxSize) {
      this.evictLeastRecentlyUsed();
    }

    const serializedValue = this.config.compression ? this.compress(value) : value;
    const size = this.calculateSize(serializedValue);

    const entry: CacheEntry = {
      key,
      value: serializedValue,
      timestamp: Date.now(),
      ttl: customTtl || this.config.ttl,
      accessCount: 0,
      lastAccessed: Date.now(),
      size,
      tags: this.config.tags || [],
      compressed: this.config.compression || false
    };

    // Remove old entry if exists
    if (this.entries.has(key)) {
      const oldEntry = this.entries.get(key)!;
      this.stats.totalSize -= oldEntry.size;
    }

    this.entries.set(key, entry);
    this.stats.totalKeys = this.entries.size;
    this.stats.totalSize += size;

    const endTime = performance.now();
    this.recordAccessTime(endTime - startTime);

    analytics.track({
      name: 'cache_set',
      category: 'performance',
      properties: {
        cache_name: this.name,
        key,
        size,
        ttl: entry.ttl
      }
    });
  }

  /**
   * Get cache entry
   */
  get<T = any>(key: string): T | null {
    const startTime = performance.now();

    const entry = this.entries.get(key);
    
    if (!entry) {
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // Check if entry is expired
    if (this.isExpired(entry)) {
      this.entries.delete(key);
      this.stats.totalKeys = this.entries.size;
      this.stats.totalSize -= entry.size;
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = Date.now();

    this.stats.hits++;
    this.updateHitRate();

    const endTime = performance.now();
    this.recordAccessTime(endTime - startTime);

    const value = entry.compressed ? this.decompress(entry.value) : entry.value;

    analytics.track({
      name: 'cache_hit',
      category: 'performance',
      properties: {
        cache_name: this.name,
        key,
        access_count: entry.accessCount
      }
    });

    return value;
  }

  /**
   * Check if key exists
   */
  has(key: string): boolean {
    const entry = this.entries.get(key);
    if (!entry) return false;
    
    if (this.isExpired(entry)) {
      this.entries.delete(key);
      this.stats.totalKeys = this.entries.size;
      this.stats.totalSize -= entry.size;
      return false;
    }
    
    return true;
  }

  /**
   * Delete cache entry
   */
  delete(key: string): boolean {
    const entry = this.entries.get(key);
    if (entry) {
      this.entries.delete(key);
      this.stats.totalKeys = this.entries.size;
      this.stats.totalSize -= entry.size;

      analytics.track({
        name: 'cache_delete',
        category: 'performance',
        properties: {
          cache_name: this.name,
          key
        }
      });

      return true;
    }
    return false;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.entries.clear();
    this.stats.totalKeys = 0;
    this.stats.totalSize = 0;
    this.accessTimes = [];

    analytics.track({
      name: 'cache_cleared',
      category: 'performance',
      properties: {
        cache_name: this.name
      }
    });
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Get cache configuration
   */
  getConfig(): CacheConfig {
    return { ...this.config };
  }

  /**
   * Get all cache keys
   */
  keys(): string[] {
    return Array.from(this.entries.keys());
  }

  /**
   * Get cache size in bytes
   */
  size(): number {
    return this.stats.totalSize;
  }

  /**
   * Invalidate entries by tag
   */
  invalidateByTag(tag: string): number {
    let invalidated = 0;

    this.entries.forEach((entry, key) => {
      if (entry.tags.includes(tag)) {
        this.entries.delete(key);
        this.stats.totalSize -= entry.size;
        invalidated++;
      }
    });

    this.stats.totalKeys = this.entries.size;
    return invalidated;
  }

  /**
   * Cleanup expired entries
   */
  cleanup(): void {
    const expiredKeys: string[] = [];

    this.entries.forEach((entry, key) => {
      if (this.isExpired(entry)) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach(key => {
      const entry = this.entries.get(key)!;
      this.entries.delete(key);
      this.stats.totalSize -= entry.size;
    });

    this.stats.totalKeys = this.entries.size;

    if (expiredKeys.length > 0) {
      analytics.track({
        name: 'cache_cleanup',
        category: 'performance',
        properties: {
          cache_name: this.name,
          expired_keys: expiredKeys.length
        }
      });
    }
  }

  /**
   * Export cache data
   */
  exportData(): Array<{ key: string; value: any; metadata: any }> {
    return Array.from(this.entries.entries()).map(([key, entry]) => ({
      key,
      value: entry.compressed ? this.decompress(entry.value) : entry.value,
      metadata: {
        timestamp: entry.timestamp,
        ttl: entry.ttl,
        accessCount: entry.accessCount,
        lastAccessed: entry.lastAccessed,
        tags: entry.tags
      }
    }));
  }

  /**
   * Import cache data
   */
  importData(data: Array<{ key: string; value: any; metadata: any }>): void {
    data.forEach(({ key, value, metadata }) => {
      this.set(key, value, metadata.ttl);
    });
  }

  /**
   * Get cache entry with metadata
   */
  getWithMetadata(key: string): { value: any; metadata: CacheEntry } | null {
    const entry = this.entries.get(key);
    
    if (!entry || this.isExpired(entry)) {
      return null;
    }

    entry.accessCount++;
    entry.lastAccessed = Date.now();

    const value = entry.compressed ? this.decompress(entry.value) : entry.value;
    
    return {
      value,
      metadata: { ...entry }
    };
  }

  /**
   * Update TTL for existing entry
   */
  touch(key: string, newTtl?: number): boolean {
    const entry = this.entries.get(key);
    
    if (!entry || this.isExpired(entry)) {
      return false;
    }

    if (newTtl !== undefined) {
      entry.ttl = newTtl;
    }
    
    entry.timestamp = Date.now();
    entry.lastAccessed = Date.now();
    
    return true;
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private evictLeastRecentlyUsed(): void {
    if (this.entries.size === 0) return;

    let lruKey = '';
    let lruTime = Date.now();

    this.entries.forEach((entry, key) => {
      if (entry.lastAccessed < lruTime) {
        lruTime = entry.lastAccessed;
        lruKey = key;
      }
    });

    if (lruKey) {
      const entry = this.entries.get(lruKey)!;
      this.entries.delete(lruKey);
      this.stats.totalSize -= entry.size;
      this.stats.evictions++;
    }

    this.stats.totalKeys = this.entries.size;
  }

  private compress(value: any): string {
    // Simple JSON compression - in production, use a proper compression library
    return JSON.stringify(value);
  }

  private decompress(compressedValue: string): any {
    try {
      return JSON.parse(compressedValue);
    } catch (error) {
      console.error('Failed to decompress cache value:', error);
      return compressedValue;
    }
  }

  private calculateSize(value: any): number {
    if (typeof value === 'string') {
      return new Blob([value]).size;
    }
    return new Blob([JSON.stringify(value)]).size;
  }

  private recordAccessTime(time: number): void {
    this.accessTimes.push(time);
    
    // Keep only last 1000 access times
    if (this.accessTimes.length > 1000) {
      this.accessTimes = this.accessTimes.slice(-1000);
    }

    this.stats.averageAccessTime = this.accessTimes.reduce((sum, t) => sum + t, 0) / this.accessTimes.length;
  }

  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
  }
}

// Export singleton instance
export const cacheManager = CacheManager.getInstance();

// Utility functions for common caching patterns
export const cacheUtils = {
  /**
   * Cache function result with automatic key generation
   */
  memoize: <T extends (...args: any[]) => any>(
    fn: T,
    options: {
      cacheName: string;
      ttl?: number;
      keyGenerator?: (...args: Parameters<T>) => string;
    }
  ): T => {
    const cache = cacheManager.getCache(options.cacheName) || 
                  cacheManager.createCache(options.cacheName, { ttl: options.ttl || 5 * 60 * 1000 });

    return ((...args: Parameters<T>): ReturnType<T> => {
      const key = options.keyGenerator ? 
                   options.keyGenerator(...args) : 
                   `${fn.name}_${JSON.stringify(args)}`;

      const cached = cache.get(key);
      if (cached !== null) {
        return cached;
      }

      const result = fn(...args);
      cache.set(key, result, options.ttl);
      return result;
    }) as T;
  },

  /**
   * Cache with promise handling
   */
  cachePromise: async <T>(
    key: string,
    cacheName: string,
    promiseFactory: () => Promise<T>,
    ttl?: number
  ): Promise<T> => {
    const cache = cacheManager.getCache(cacheName) || 
                  cacheManager.createCache(cacheName, { ttl: ttl || 5 * 60 * 1000 });

    const cached = cache.get(key);
    if (cached !== null) {
      return cached;
    }

    try {
      const result = await promiseFactory();
      cache.set(key, result, ttl);
      return result;
    } catch (error) {
      // Don't cache errors
      throw error;
    }
  },

  /**
   * Generate cache key from object
   */
  generateKey: (prefix: string, params: Record<string, any>): string => {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    
    return `${prefix}:${sortedParams}`;
  },

  /**
   * Cache middleware for API responses
   */
  createCacheMiddleware: (cacheName: string, defaultTtl: number = 5 * 60 * 1000) => {
    const cache = cacheManager.getCache(cacheName) || 
                  cacheManager.createCache(cacheName, { ttl: defaultTtl });

    return (req: any, res: any, next: any) => {
      const key = `${req.method}:${req.url}`;
      const cached = cache.get(key);

      if (cached !== null) {
        return res.json(cached);
      }

      // Store original json method
      const originalJson = res.json;
      
      // Override json method to cache response
      res.json = function(data: any) {
        cache.set(key, data);
        return originalJson.call(this, data);
      };

      next();
    };
  }
};