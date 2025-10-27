import * as grpc from '@grpc/grpc-js';
import jwt from 'jsonwebtoken';

export interface AuthContext {
  userId?: string;
  email?: string;
  role?: string;
  permissions?: string[];
  serviceId?: string;
  serviceName?: string;
  isServiceAccount?: boolean;
}

export interface AuthInterceptorOptions {
  jwtSecret: string;
  serviceTokenSecret?: string;
  excludedMethods?: string[];
  requiredPermissions?: { [method: string]: string[] };
}

export class AuthInterceptor {
  private options: AuthInterceptorOptions;

  constructor(options: AuthInterceptorOptions) {
    this.options = options;
  }

  // Create gRPC interceptor for authentication
  public createInterceptor(): grpc.Interceptor {
    return (options, nextCall) => {
      return new grpc.InterceptingCall(nextCall(options), {
        start: (metadata, listener, next) => {
          try {
            // Extract method name from the call
            const methodName = options.method_definition?.path || '';
            
            // Skip authentication for excluded methods
            if (this.options.excludedMethods?.includes(methodName)) {
              return next(metadata, listener);
            }

            // Extract and validate authentication
            const authContext = this.extractAuthContext(metadata);
            
            // Check method-specific permissions
            if (this.options.requiredPermissions?.[methodName]) {
              this.checkPermissions(authContext, this.options.requiredPermissions[methodName]);
            }

            // Add auth context to metadata for downstream services
            metadata.set('user-id', authContext.userId || '');
            metadata.set('user-role', authContext.role || '');
            metadata.set('service-id', authContext.serviceId || '');
            metadata.set('is-service-account', authContext.isServiceAccount ? 'true' : 'false');

            next(metadata, listener);
          } catch (error) {
            const grpcError = new grpc.StatusBuilder()
              .withCode(grpc.status.UNAUTHENTICATED)
              .withDetails(error instanceof Error ? error.message : 'Authentication failed')
              .build();
            
            listener.onReceiveStatus(grpcError, {}, () => {});
            return;
          }
        }
      });
    };
  }

  // Extract authentication context from metadata
  private extractAuthContext(metadata: grpc.Metadata): AuthContext {
    const authorization = metadata.get('authorization')[0] as string;
    const serviceToken = metadata.get('x-service-token')[0] as string;

    if (serviceToken) {
      // Service-to-service authentication
      return this.validateServiceToken(serviceToken);
    } else if (authorization) {
      // User authentication
      const token = authorization.replace('Bearer ', '');
      return this.validateUserToken(token);
    } else {
      throw new Error('No authentication token provided');
    }
  }

  // Validate user JWT token
  private validateUserToken(token: string): AuthContext {
    try {
      const decoded = jwt.verify(token, this.options.jwtSecret) as any;
      
      if (!decoded.sub || !decoded.email) {
        throw new Error('Invalid token payload');
      }

      return {
        userId: decoded.sub,
        email: decoded.email,
        role: decoded.role || 'USER',
        permissions: decoded.permissions || [],
        isServiceAccount: false,
      };
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  // Validate service account token
  private validateServiceToken(token: string): AuthContext {
    if (!this.options.serviceTokenSecret) {
      throw new Error('Service token authentication not configured');
    }

    try {
      const decoded = jwt.verify(token, this.options.serviceTokenSecret) as any;
      
      if (!decoded.serviceId || !decoded.serviceName) {
        throw new Error('Invalid service token payload');
      }

      return {
        serviceId: decoded.serviceId,
        serviceName: decoded.serviceName,
        permissions: decoded.permissions || [],
        isServiceAccount: true,
      };
    } catch (error) {
      throw new Error('Invalid or expired service token');
    }
  }

  // Check if auth context has required permissions
  private checkPermissions(authContext: AuthContext, requiredPermissions: string[]): void {
    if (!authContext.permissions) {
      throw new Error('No permissions available');
    }

    const hasPermission = requiredPermissions.some(permission => 
      authContext.permissions!.includes(permission) ||
      authContext.permissions!.includes('*') || // Wildcard permission
      authContext.role === 'ADMIN' // Admin role has all permissions
    );

    if (!hasPermission) {
      throw new Error(`Insufficient permissions. Required: ${requiredPermissions.join(', ')}`);
    }
  }
}

// Rate limiting interceptor
export interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  keyGenerator?: (metadata: grpc.Metadata) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export class RateLimitInterceptor {
  private requestCounts: Map<string, { count: number; resetTime: number }> = new Map();
  private options: RateLimitOptions;

  constructor(options: RateLimitOptions) {
    this.options = {
      keyGenerator: (metadata) => {
        const userId = metadata.get('user-id')[0] as string;
        const serviceId = metadata.get('service-id')[0] as string;
        return userId || serviceId || 'anonymous';
      },
      ...options,
    };

    // Cleanup expired entries periodically
    setInterval(() => {
      this.cleanup();
    }, this.options.windowMs);
  }

  public createInterceptor(): grpc.Interceptor {
    return (options, nextCall) => {
      return new grpc.InterceptingCall(nextCall(options), {
        start: (metadata, listener, next) => {
          const key = this.options.keyGenerator!(metadata);
          
          if (!this.isAllowed(key)) {
            const grpcError = new grpc.StatusBuilder()
              .withCode(grpc.status.RESOURCE_EXHAUSTED)
              .withDetails('Rate limit exceeded')
              .build();
            
            listener.onReceiveStatus(grpcError, {}, () => {});
            return;
          }

          this.recordRequest(key);
          next(metadata, listener);
        }
      });
    };
  }

  private isAllowed(key: string): boolean {
    const now = Date.now();
    const record = this.requestCounts.get(key);

    if (!record || now > record.resetTime) {
      return true;
    }

    return record.count < this.options.maxRequests;
  }

  private recordRequest(key: string): void {
    const now = Date.now();
    const record = this.requestCounts.get(key);

    if (!record || now > record.resetTime) {
      this.requestCounts.set(key, {
        count: 1,
        resetTime: now + this.options.windowMs,
      });
    } else {
      record.count++;
    }
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.requestCounts.entries()) {
      if (now > record.resetTime) {
        this.requestCounts.delete(key);
      }
    }
  }
}

// Logging interceptor
export interface LoggingOptions {
  logLevel: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  logRequests: boolean;
  logResponses: boolean;
  logErrors: boolean;
  sensitiveFields?: string[];
}

export class LoggingInterceptor {
  private options: LoggingOptions;

  constructor(options: Partial<LoggingOptions> = {}) {
    this.options = {
      logLevel: 'INFO',
      logRequests: true,
      logResponses: false,
      logErrors: true,
      sensitiveFields: ['password', 'token', 'secret', 'authorization'],
      ...options,
    };
  }

  public createInterceptor(): grpc.Interceptor {
    return (options, nextCall) => {
      const startTime = Date.now();
      const requestId = this.generateRequestId();
      
      return new grpc.InterceptingCall(nextCall(options), {
        start: (metadata, listener, next) => {
          if (this.options.logRequests) {
            this.logRequest(requestId, options.method_definition?.path || '', metadata);
          }
          
          next(metadata, {
            ...listener,
            onReceiveStatus: (status, metadata, details) => {
              const duration = Date.now() - startTime;
              
              if (status.code === grpc.status.OK) {
                if (this.options.logResponses) {
                  this.logResponse(requestId, duration, status);
                }
              } else {
                if (this.options.logErrors) {
                  this.logError(requestId, duration, status);
                }
              }
              
              listener.onReceiveStatus?.(status, metadata, details);
            },
          });
        }
      });
    };
  }

  private logRequest(requestId: string, method: string, metadata: grpc.Metadata): void {
    const sanitizedMetadata = this.sanitizeMetadata(metadata);
    console.log(`[${requestId}] → ${method}`, {
      metadata: sanitizedMetadata,
      timestamp: new Date().toISOString(),
    });
  }

  private logResponse(requestId: string, duration: number, status: grpc.StatusObject): void {
    console.log(`[${requestId}] ← Success`, {
      duration: `${duration}ms`,
      status: status.code,
      timestamp: new Date().toISOString(),
    });
  }

  private logError(requestId: string, duration: number, status: grpc.StatusObject): void {
    console.error(`[${requestId}] ✗ Error`, {
      duration: `${duration}ms`,
      status: status.code,
      details: status.details,
      timestamp: new Date().toISOString(),
    });
  }

  private sanitizeMetadata(metadata: grpc.Metadata): any {
    const result: any = {};
    
    for (const [key, values] of metadata.getMap()) {
      if (this.options.sensitiveFields?.some(field => 
        key.toLowerCase().includes(field.toLowerCase()))) {
        result[key] = '[REDACTED]';
      } else {
        result[key] = values;
      }
    }
    
    return result;
  }

  private generateRequestId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}

// Metrics interceptor
export class MetricsInterceptor {
  private requestCounts: Map<string, number> = new Map();
  private requestDurations: Map<string, number[]> = new Map();
  private errorCounts: Map<string, number> = new Map();

  public createInterceptor(): grpc.Interceptor {
    return (options, nextCall) => {
      const startTime = Date.now();
      const methodName = options.method_definition?.path || 'unknown';
      
      return new grpc.InterceptingCall(nextCall(options), {
        start: (metadata, listener, next) => {
          this.incrementRequestCount(methodName);
          
          next(metadata, {
            ...listener,
            onReceiveStatus: (status, metadata, details) => {
              const duration = Date.now() - startTime;
              this.recordDuration(methodName, duration);
              
              if (status.code !== grpc.status.OK) {
                this.incrementErrorCount(methodName);
              }
              
              listener.onReceiveStatus?.(status, metadata, details);
            },
          });
        }
      });
    };
  }

  private incrementRequestCount(method: string): void {
    const current = this.requestCounts.get(method) || 0;
    this.requestCounts.set(method, current + 1);
  }

  private recordDuration(method: string, duration: number): void {
    if (!this.requestDurations.has(method)) {
      this.requestDurations.set(method, []);
    }
    
    const durations = this.requestDurations.get(method)!;
    durations.push(duration);
    
    // Keep only last 1000 measurements
    if (durations.length > 1000) {
      durations.shift();
    }
  }

  private incrementErrorCount(method: string): void {
    const current = this.errorCounts.get(method) || 0;
    this.errorCounts.set(method, current + 1);
  }

  // Get metrics for monitoring/observability
  public getMetrics(): any {
    const metrics: any = {};
    
    for (const [method, count] of this.requestCounts.entries()) {
      const durations = this.requestDurations.get(method) || [];
      const errors = this.errorCounts.get(method) || 0;
      
      metrics[method] = {
        requests: count,
        errors: errors,
        errorRate: count > 0 ? (errors / count) : 0,
        avgDuration: durations.length > 0 ? 
          durations.reduce((sum, d) => sum + d, 0) / durations.length : 0,
        p95Duration: this.calculatePercentile(durations, 0.95),
        p99Duration: this.calculatePercentile(durations, 0.99),
      };
    }
    
    return metrics;
  }

  private calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0;
    
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * percentile) - 1;
    return sorted[index] || 0;
  }

  // Reset metrics
  public reset(): void {
    this.requestCounts.clear();
    this.requestDurations.clear();
    this.errorCounts.clear();
  }
}