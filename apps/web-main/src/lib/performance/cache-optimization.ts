'use client';

// Advanced caching strategies for optimal performance

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum cache size
  strategy?: 'lru' | 'fifo' | 'lfu'; // Cache eviction strategy
}

interface CacheItem<T> {
  data: T;
  timestamp: number;
  accessCount: number;
  ttl: number;
}

// In-memory cache with advanced eviction strategies
export class AdvancedCache<T> {
  private cache = new Map<string, CacheItem<T>>();
  private accessOrder: string[] = []; // For LRU
  private maxSize: number;
  private defaultTTL: number;
  private strategy: 'lru' | 'fifo' | 'lfu';

  constructor(options: CacheOptions = {}) {
    this.maxSize = options.maxSize || 100;
    this.defaultTTL = options.ttl || 5 * 60 * 1000; // 5 minutes default
    this.strategy = options.strategy || 'lru';
  }

  set(key: string, data: T, ttl?: number): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      accessCount: 0,
      ttl: ttl || this.defaultTTL
    };

    // Remove expired items first
    this.cleanup();

    // If cache is full, evict based on strategy
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evict();
    }

    this.cache.set(key, item);
    this.updateAccessOrder(key);
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      this.removeFromAccessOrder(key);
      return null;
    }

    // Update access statistics
    item.accessCount++;
    this.updateAccessOrder(key);

    return item.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    const result = this.cache.delete(key);
    this.removeFromAccessOrder(key);
    return result;
  }

  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
  }

  size(): number {
    this.cleanup();
    return this.cache.size;
  }

  private evict(): void {
    if (this.cache.size === 0) return;

    let keyToEvict: string;

    switch (this.strategy) {
      case 'lru':
        keyToEvict = this.accessOrder[0];
        break;
      case 'lfu':
        keyToEvict = Array.from(this.cache.entries())
          .sort(([, a], [, b]) => a.accessCount - b.accessCount)[0][0];
        break;
      case 'fifo':
      default:
        keyToEvict = Array.from(this.cache.keys())[0];
        break;
    }

    this.delete(keyToEvict);
  }

  private updateAccessOrder(key: string): void {
    this.removeFromAccessOrder(key);
    this.accessOrder.push(key);
  }

  private removeFromAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
  }

  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    this.cache.forEach((item, key) => {
      if (now - item.timestamp > item.ttl) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach(key => this.delete(key));
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      strategy: this.strategy,
      hitRate: this.calculateHitRate(),
      items: Array.from(this.cache.entries()).map(([key, item]) => ({
        key,
        age: Date.now() - item.timestamp,
        accessCount: item.accessCount,
        ttl: item.ttl
      }))
    };
  }

  private calculateHitRate(): number {
    const totalAccesses = Array.from(this.cache.values())
      .reduce((sum, item) => sum + item.accessCount, 0);
    return totalAccesses > 0 ? (totalAccesses / (totalAccesses + this.cache.size)) : 0;
  }
}

// Persistent storage cache using IndexedDB
export class PersistentCache {
  private dbName: string;
  private storeName: string;
  private version: number;
  private db: IDBDatabase | null = null;

  constructor(dbName = 'ZoptalCache', storeName = 'cache', version = 1) {
    this.dbName = dbName;
    this.storeName = storeName;
    this.version = version;
  }

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'key' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  async set(key: string, data: any, ttl: number = 24 * 60 * 60 * 1000): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      const item = {
        key,
        data,
        timestamp: Date.now(),
        ttl
      };

      const request = store.put(item);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        
        if (!result) {
          resolve(null);
          return;
        }

        // Check if expired
        if (Date.now() - result.timestamp > result.ttl) {
          this.delete(key); // Clean up expired item
          resolve(null);
          return;
        }

        resolve(result.data);
      };
    });
  }

  async delete(key: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async clear(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async cleanup(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('timestamp');
      const request = index.openCursor();

      const now = Date.now();
      const keysToDelete: string[] = [];

      request.onerror = () => reject(request.error);
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        
        if (cursor) {
          const item = cursor.value;
          if (now - item.timestamp > item.ttl) {
            keysToDelete.push(item.key);
          }
          cursor.continue();
        } else {
          // Delete expired items
          Promise.all(keysToDelete.map(key => this.delete(key)))
            .then(() => resolve())
            .catch(reject);
        }
      };
    });
  }
}

// Cache manager combining in-memory and persistent caching
export class CacheManager {
  private memoryCache: AdvancedCache<any>;
  private persistentCache: PersistentCache;
  private initialized = false;

  constructor(options: CacheOptions = {}) {
    this.memoryCache = new AdvancedCache(options);
    this.persistentCache = new PersistentCache();
  }

  async init(): Promise<void> {
    if (this.initialized) return;
    
    await this.persistentCache.init();
    this.initialized = true;

    // Cleanup expired items on initialization
    await this.persistentCache.cleanup();
  }

  async set(key: string, data: any, options: {
    memoryTTL?: number;
    persistentTTL?: number;
    persistent?: boolean;
  } = {}): Promise<void> {
    const { memoryTTL = 5 * 60 * 1000, persistentTTL = 24 * 60 * 60 * 1000, persistent = true } = options;

    // Always cache in memory
    this.memoryCache.set(key, data, memoryTTL);

    // Cache persistently if requested
    if (persistent) {
      if (!this.initialized) await this.init();
      await this.persistentCache.set(key, data, persistentTTL);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    // Try memory cache first (fastest)
    let data = this.memoryCache.get(key);
    if (data !== null) {
      return data;
    }

    // Try persistent cache
    if (!this.initialized) await this.init();
    data = await this.persistentCache.get<T>(key);
    
    if (data !== null) {
      // Restore to memory cache
      this.memoryCache.set(key, data);
      return data;
    }

    return null;
  }

  async has(key: string): Promise<boolean> {
    return (await this.get(key)) !== null;
  }

  async delete(key: string): Promise<void> {
    this.memoryCache.delete(key);
    if (this.initialized) {
      await this.persistentCache.delete(key);
    }
  }

  async clear(): Promise<void> {
    this.memoryCache.clear();
    if (this.initialized) {
      await this.persistentCache.clear();
    }
  }

  getStats() {
    return {
      memory: this.memoryCache.getStats(),
      initialized: this.initialized
    };
  }
}

// Global cache instances
export const pageCache = new CacheManager({ maxSize: 50, ttl: 10 * 60 * 1000 }); // 10 minutes
export const apiCache = new CacheManager({ maxSize: 100, ttl: 5 * 60 * 1000 }); // 5 minutes
export const imageCache = new CacheManager({ maxSize: 200, ttl: 60 * 60 * 1000 }); // 1 hour
export const staticCache = new CacheManager({ maxSize: 500, ttl: 24 * 60 * 60 * 1000 }); // 24 hours

// Cache utilities for React components
export const useCachedData = <T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    cache?: CacheManager;
    memoryTTL?: number;
    persistentTTL?: number;
  } = {}
) => {
  const { cache = apiCache, memoryTTL, persistentTTL } = options;

  return {
    get: async (): Promise<T> => {
      const cached = await cache.get<T>(key);
      if (cached !== null) {
        return cached;
      }

      const fresh = await fetcher();
      await cache.set(key, fresh, { memoryTTL, persistentTTL });
      return fresh;
    },
    invalidate: () => cache.delete(key),
    refresh: async (): Promise<T> => {
      await cache.delete(key);
      const fresh = await fetcher();
      await cache.set(key, fresh, { memoryTTL, persistentTTL });
      return fresh;
    }
  };
};

// Service Worker cache strategies
export const swCacheStrategies = {
  // Cache first, then network
  cacheFirst: (request: Request) => {
    return caches.match(request).then(response => {
      return response || fetch(request).then(response => {
        const responseClone = response.clone();
        caches.open('v1').then(cache => {
          cache.put(request, responseClone);
        });
        return response;
      });
    });
  },

  // Network first, then cache
  networkFirst: (request: Request) => {
    return fetch(request).then(response => {
      const responseClone = response.clone();
      caches.open('v1').then(cache => {
        cache.put(request, responseClone);
      });
      return response;
    }).catch(() => {
      return caches.match(request);
    });
  },

  // Stale while revalidate
  staleWhileRevalidate: (request: Request) => {
    return caches.match(request).then(response => {
      const fetchPromise = fetch(request).then(networkResponse => {
        const responseClone = networkResponse.clone();
        caches.open('v1').then(cache => {
          cache.put(request, responseClone);
        });
        return networkResponse;
      });

      return response || fetchPromise;
    });
  }
};