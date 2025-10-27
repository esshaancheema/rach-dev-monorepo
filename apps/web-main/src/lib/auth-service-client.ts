interface AuthServiceConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  cacheTTL: number;
}

interface CachedRequest {
  promise: Promise<Response>;
  timestamp: number;
}

class AuthServiceClient {
  private config: AuthServiceConfig;
  private requestCache = new Map<string, CachedRequest>();
  private pendingRequests = new Map<string, Promise<Response>>();

  constructor(config?: Partial<AuthServiceConfig>) {
    this.config = {
      baseUrl: process.env.AUTH_SERVICE_URL || 'http://localhost:4000',
      timeout: 10000, // 10 seconds
      retryAttempts: 3,
      cacheTTL: 60000, // 1 minute
      ...config
    };
  }

  private generateCacheKey(method: string, path: string, body?: any): string {
    return `${method}:${path}:${body ? JSON.stringify(body) : ''}`;
  }

  private isValidCacheEntry(entry: CachedRequest): boolean {
    return Date.now() - entry.timestamp < this.config.cacheTTL;
  }

  private async makeRequest(method: string, path: string, body?: any): Promise<Response> {
    const url = `${this.config.baseUrl}${path}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Request-ID': crypto.randomUUID(),
    };

    // Add authorization header if token exists
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('zoptal_session_token');
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    const options: RequestInit = {
      method,
      headers,
      signal: AbortSignal.timeout(this.config.timeout),
    };

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(body);
    }

    let lastError: Error;

    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        const response = await fetch(url, options);
        
        // Don't retry on client errors (4xx), only server errors (5xx) and network errors
        if (response.ok || (response.status >= 400 && response.status < 500)) {
          return response;
        }
        
        throw new Error(`Server error: ${response.status}`);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Don't retry on timeout or abort
        if (error instanceof DOMException && error.name === 'TimeoutError') {
          break;
        }
        
        // Wait before retry (exponential backoff)
        if (attempt < this.config.retryAttempts) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000));
        }
      }
    }

    console.error(`Auth service request failed after ${this.config.retryAttempts} attempts:`, lastError);
    throw lastError;
  }

  async request(method: string, path: string, body?: any): Promise<Response> {
    const cacheKey = this.generateCacheKey(method, path, body);
    
    // For GET requests, check cache first
    if (method === 'GET') {
      const cached = this.requestCache.get(cacheKey);
      if (cached && this.isValidCacheEntry(cached)) {
        return cached.promise;
      }
    }

    // Check for pending duplicate requests
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey)!;
    }

    // Create new request
    const requestPromise = this.makeRequest(method, path, body);
    this.pendingRequests.set(cacheKey, requestPromise);

    try {
      const response = await requestPromise;
      
      // Cache successful GET requests
      if (method === 'GET' && response.ok) {
        this.requestCache.set(cacheKey, {
          promise: Promise.resolve(response.clone()),
          timestamp: Date.now()
        });
      }
      
      return response;
    } finally {
      // Always cleanup pending request
      this.pendingRequests.delete(cacheKey);
      
      // Cleanup expired cache entries periodically
      if (Math.random() < 0.1) { // 10% chance
        this.cleanupExpiredCache();
      }
    }
  }

  private cleanupExpiredCache(): void {
    for (const [key, entry] of this.requestCache.entries()) {
      if (!this.isValidCacheEntry(entry)) {
        this.requestCache.delete(key);
      }
    }
  }

  // Helper methods for common operations
  async get(path: string): Promise<Response> {
    return this.request('GET', path);
  }

  async post(path: string, body?: any): Promise<Response> {
    return this.request('POST', path, body);
  }

  async put(path: string, body?: any): Promise<Response> {
    return this.request('PUT', path, body);
  }

  async delete(path: string): Promise<Response> {
    return this.request('DELETE', path);
  }

  // Clear all caches
  clearCache(): void {
    this.requestCache.clear();
    this.pendingRequests.clear();
  }
}

export const authService = new AuthServiceClient();

// Export singleton instance with performance monitoring
export default authService;