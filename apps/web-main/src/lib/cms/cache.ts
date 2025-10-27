// Advanced caching strategy for Contentful CMS content

export interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  staleWhileRevalidate: number; // SWR time in milliseconds
  tags: string[]; // Cache tags for invalidation
}

export interface CachedEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  tags: string[];
  staleAt: number;
}

// Default cache configurations for different content types
export const CACHE_CONFIGS: Record<string, CacheConfig> = {
  blogPost: {
    ttl: 10 * 60 * 1000, // 10 minutes
    staleWhileRevalidate: 30 * 60 * 1000, // 30 minutes
    tags: ['blog-posts', 'content'],
  },
  caseStudy: {
    ttl: 15 * 60 * 1000, // 15 minutes
    staleWhileRevalidate: 60 * 60 * 1000, // 1 hour
    tags: ['case-studies', 'content'],
  },
  service: {
    ttl: 30 * 60 * 1000, // 30 minutes
    staleWhileRevalidate: 2 * 60 * 60 * 1000, // 2 hours
    tags: ['services', 'content'],
  },
  teamMember: {
    ttl: 60 * 60 * 1000, // 1 hour
    staleWhileRevalidate: 4 * 60 * 60 * 1000, // 4 hours
    tags: ['team-members', 'content'],
  },
  testimonial: {
    ttl: 30 * 60 * 1000, // 30 minutes
    staleWhileRevalidate: 2 * 60 * 60 * 1000, // 2 hours
    tags: ['testimonials', 'content'],
  },
  category: {
    ttl: 2 * 60 * 60 * 1000, // 2 hours
    staleWhileRevalidate: 24 * 60 * 60 * 1000, // 24 hours
    tags: ['categories', 'taxonomy'],
  },
  tag: {
    ttl: 2 * 60 * 60 * 1000, // 2 hours
    staleWhileRevalidate: 24 * 60 * 60 * 1000, // 24 hours
    tags: ['tags', 'taxonomy'],
  },
  serviceCategory: {
    ttl: 2 * 60 * 60 * 1000, // 2 hours
    staleWhileRevalidate: 24 * 60 * 60 * 1000, // 24 hours
    tags: ['service-categories', 'taxonomy'],
  },
  homepage: {
    ttl: 5 * 60 * 1000, // 5 minutes
    staleWhileRevalidate: 15 * 60 * 1000, // 15 minutes
    tags: ['homepage', 'featured-content'],
  },
};

// Multi-layer cache implementation
export class ContentCache {
  private memoryCache: Map<string, CachedEntry> = new Map();
  private maxMemoryEntries = 1000;
  private backgroundRefreshPromises: Map<string, Promise<any>> = new Map();

  constructor(private readonly storagePrefix = 'cms_cache_') {}

  // Generate cache key
  private generateKey(type: string, identifier: string, options?: any): string {
    const optionsStr = options ? JSON.stringify(options) : '';
    return `${this.storagePrefix}${type}_${identifier}_${this.hashString(optionsStr)}`;
  }

  // Simple hash function for options
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  // Get from memory cache
  private getFromMemory(key: string): CachedEntry | null {
    return this.memoryCache.get(key) || null;
  }

  // Set to memory cache with LRU eviction
  private setToMemory(key: string, entry: CachedEntry): void {
    // Implement LRU eviction
    if (this.memoryCache.size >= this.maxMemoryEntries) {
      const firstKey = this.memoryCache.keys().next().value;
      this.memoryCache.delete(firstKey);
    }
    this.memoryCache.set(key, entry);
  }

  // Get from localStorage (browser only)
  private getFromStorage(key: string): CachedEntry | null {
    if (typeof window === 'undefined') return null;

    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
      return null;
    }
  }

  // Set to localStorage (browser only)
  private setToStorage(key: string, entry: CachedEntry): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(key, JSON.stringify(entry));
    } catch (error) {
      console.warn('Failed to write to localStorage:', error);
      // Handle quota exceeded by clearing old entries
      this.clearExpiredFromStorage();
    }
  }

  // Clear expired entries from localStorage
  private clearExpiredFromStorage(): void {
    if (typeof window === 'undefined') return;

    const now = Date.now();
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.storagePrefix)) {
        try {
          const entry = JSON.parse(localStorage.getItem(key) || '');
          if (now > entry.timestamp + entry.ttl + entry.staleWhileRevalidate) {
            keysToRemove.push(key);
          }
        } catch {
          keysToRemove.push(key);
        }
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  // Check if entry is fresh, stale, or expired
  private getCacheStatus(entry: CachedEntry): 'fresh' | 'stale' | 'expired' {
    const now = Date.now();
    if (now <= entry.staleAt) return 'fresh';
    if (now <= entry.timestamp + entry.ttl + entry.staleWhileRevalidate) return 'stale';
    return 'expired';
  }

  // Get cached content with stale-while-revalidate support
  async get<T>(
    type: string,
    identifier: string,
    options: any = {},
    fetchFn: () => Promise<T>
  ): Promise<T> {
    const key = this.generateKey(type, identifier, options);
    const config = CACHE_CONFIGS[type] || CACHE_CONFIGS.blogPost;

    // Try memory cache first
    let cached = this.getFromMemory(key);
    
    // Fallback to storage cache
    if (!cached) {
      cached = this.getFromStorage(key);
      if (cached) {
        this.setToMemory(key, cached);
      }
    }

    if (cached) {
      const status = this.getCacheStatus(cached);
      
      switch (status) {
        case 'fresh':
          return cached.data;
          
        case 'stale':
          // Return stale data immediately, refresh in background
          this.refreshInBackground(key, type, fetchFn, config);
          return cached.data;
          
        case 'expired':
          // Data is too old, fetch fresh data
          break;
      }
    }

    // Fetch fresh data
    const data = await fetchFn();
    this.set(key, data, config);
    return data;
  }

  // Background refresh for stale-while-revalidate
  private refreshInBackground<T>(
    key: string,
    type: string,
    fetchFn: () => Promise<T>,
    config: CacheConfig
  ): void {
    // Prevent duplicate background refreshes
    if (this.backgroundRefreshPromises.has(key)) return;

    const refreshPromise = fetchFn()
      .then(data => {
        this.set(key, data, config);
        return data;
      })
      .catch(error => {
        console.warn('Background refresh failed:', error);
      })
      .finally(() => {
        this.backgroundRefreshPromises.delete(key);
      });

    this.backgroundRefreshPromises.set(key, refreshPromise);
  }

  // Set cached content
  set<T>(key: string, data: T, config: CacheConfig): void {
    const now = Date.now();
    const entry: CachedEntry<T> = {
      data,
      timestamp: now,
      ttl: config.ttl,
      tags: config.tags,
      staleAt: now + config.ttl,
    };

    this.setToMemory(key, entry);
    this.setToStorage(key, entry);
  }

  // Invalidate cache by tags
  invalidateByTags(tags: string[]): void {
    const tagsSet = new Set(tags);

    // Clear from memory cache
    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.tags.some(tag => tagsSet.has(tag))) {
        this.memoryCache.delete(key);
      }
    }

    // Clear from storage cache
    if (typeof window !== 'undefined') {
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.storagePrefix)) {
          try {
            const entry = JSON.parse(localStorage.getItem(key) || '');
            if (entry.tags?.some((tag: string) => tagsSet.has(tag))) {
              keysToRemove.push(key);
            }
          } catch {
            keysToRemove.push(key);
          }
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));
    }
  }

  // Clear all cache
  clear(): void {
    this.memoryCache.clear();
    
    if (typeof window !== 'undefined') {
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.storagePrefix)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));
    }
  }

  // Get cache statistics
  getStats(): {
    memoryEntries: number;
    storageEntries: number;
    memorySize: number;
    backgroundRefreshes: number;
  } {
    let storageEntries = 0;
    
    if (typeof window !== 'undefined') {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.storagePrefix)) {
          storageEntries++;
        }
      }
    }

    return {
      memoryEntries: this.memoryCache.size,
      storageEntries,
      memorySize: JSON.stringify([...this.memoryCache.entries()]).length,
      backgroundRefreshes: this.backgroundRefreshPromises.size,
    };
  }

  // Preload content
  async preload<T>(
    type: string,
    identifier: string,
    options: any = {},
    fetchFn: () => Promise<T>
  ): Promise<void> {
    const key = this.generateKey(type, identifier, options);
    const cached = this.getFromMemory(key) || this.getFromStorage(key);
    
    if (!cached || this.getCacheStatus(cached) === 'expired') {
      try {
        const data = await fetchFn();
        const config = CACHE_CONFIGS[type] || CACHE_CONFIGS.blogPost;
        this.set(key, data, config);
      } catch (error) {
        console.warn('Preload failed:', error);
      }
    }
  }
}

// Global cache instance
export const contentCache = new ContentCache();

// Cache warming utilities
export class CacheWarmer {
  constructor(private cache: ContentCache) {}

  // Warm cache with popular content
  async warmPopularContent(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      // This would be populated with actual popular content IDs
      const popularContent = [
        { type: 'blogPost', slug: 'getting-started-with-ai' },
        { type: 'caseStudy', slug: 'fintech-transformation' },
        { type: 'service', slug: 'custom-software-development' },
      ];

      await Promise.allSettled(
        popularContent.map(({ type, slug }) =>
          this.cache.preload(type, slug, {}, async () => {
            // This would use the actual CMS fetch function
            const response = await fetch(`/api/content/${type}/${slug}`);
            return response.json();
          })
        )
      );
    } catch (error) {
      console.warn('Cache warming failed:', error);
    }
  }

  // Warm cache based on user behavior
  async warmUserBasedContent(userPreferences: {
    interests: string[];
    location: string;
    industry: string;
  }): Promise<void> {
    // Implementation would be based on user preferences
    // This is a placeholder for the concept
  }
}

// React hooks for cache management
export function useCacheStats() {
  const [stats, setStats] = React.useState(contentCache.getStats());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setStats(contentCache.getStats());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return stats;
}

export function useCacheInvalidation() {
  return {
    invalidateByTags: (tags: string[]) => contentCache.invalidateByTags(tags),
    clearAll: () => contentCache.clear(),
  };
}

// Initialize cache system
export function initCacheSystem() {
  if (typeof window === 'undefined') return;

  // Clear expired entries on initialization
  contentCache['clearExpiredFromStorage']();

  // Warm cache with popular content
  const warmer = new CacheWarmer(contentCache);
  warmer.warmPopularContent();

  // Set up periodic cleanup
  setInterval(() => {
    contentCache['clearExpiredFromStorage']();
  }, 30 * 60 * 1000); // Every 30 minutes
}