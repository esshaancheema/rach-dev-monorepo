// Service Mesh Package - Main Export File

// gRPC Client Exports
export {
  GrpcClientManager,
  ServiceConfig,
  GrpcClientOptions,
  AuthServiceClient,
  ProjectServiceClient,
  BillingServiceClient,
  NotificationServiceClient,
  AnalyticsServiceClient,
  createGrpcClientManager,
} from './client/grpc-client';

// Service Discovery Exports
export {
  ServiceDiscovery,
  KubernetesServiceDiscovery,
  ServiceEndpoint,
  ServiceDiscoveryOptions,
  CircuitBreaker,
} from './middleware/service-discovery';

// Authentication & Middleware Exports
export {
  AuthInterceptor,
  AuthContext,
  AuthInterceptorOptions,
  RateLimitInterceptor,
  RateLimitOptions,
  LoggingInterceptor,
  LoggingOptions,
  MetricsInterceptor,
} from './middleware/auth-interceptor';

// Proto definitions will be generated at build time
// Export types and clients from generated files
export * from './generated/auth_pb';
export * from './generated/project_pb';
export * from './generated/billing_pb';
export * from './generated/notification_pb';
export * from './generated/analytics_pb';

// Utility functions for common service mesh operations
export class ServiceMesh {
  private grpcClientManager?: GrpcClientManager;
  private serviceDiscovery?: ServiceDiscovery;

  constructor() {
    // Initialize with default configuration
    this.initialize();
  }

  // Initialize service mesh with configuration
  private initialize(): void {
    // This would typically read from environment variables
    // or configuration files in a real implementation
    console.log('🔧 Service mesh initializing...');
  }

  // Setup gRPC client manager
  public setupGrpcClients(config: {
    authService?: { host: string; port: number };
    projectService?: { host: string; port: number };
    billingService?: { host: string; port: number };
    notificationService?: { host: string; port: number };
    analyticsService?: { host: string; port: number };
  }): GrpcClientManager {
    this.grpcClientManager = createGrpcClientManager(config);
    console.log('✅ gRPC clients configured');
    return this.grpcClientManager;
  }

  // Setup service discovery
  public setupServiceDiscovery(options?: Partial<ServiceDiscoveryOptions>): ServiceDiscovery {
    this.serviceDiscovery = new ServiceDiscovery(options);
    console.log('✅ Service discovery configured');
    return this.serviceDiscovery;
  }

  // Get configured gRPC client manager
  public getGrpcClients(): GrpcClientManager {
    if (!this.grpcClientManager) {
      throw new Error('gRPC clients not configured. Call setupGrpcClients() first.');
    }
    return this.grpcClientManager;
  }

  // Get configured service discovery
  public getServiceDiscovery(): ServiceDiscovery {
    if (!this.serviceDiscovery) {
      throw new Error('Service discovery not configured. Call setupServiceDiscovery() first.');
    }
    return this.serviceDiscovery;
  }

  // Health check all services
  public async healthCheck(): Promise<{ [key: string]: boolean }> {
    if (!this.grpcClientManager) {
      return {};
    }
    return await this.grpcClientManager.healthCheckAll();
  }

  // Cleanup resources
  public async destroy(): Promise<void> {
    const promises: Promise<void>[] = [];

    if (this.grpcClientManager) {
      promises.push(this.grpcClientManager.close());
    }

    if (this.serviceDiscovery) {
      this.serviceDiscovery.destroy();
    }

    await Promise.all(promises);
    console.log('🔄 Service mesh destroyed');
  }
}

// Default service mesh instance
export const serviceMesh = new ServiceMesh();

// Utility functions for common patterns
export namespace ServiceMeshUtils {
  // Create standardized gRPC metadata
  export function createMetadata(authToken?: string, userId?: string, requestId?: string): any {
    const metadata = new (require('@grpc/grpc-js').Metadata)();
    
    if (authToken) {
      metadata.set('authorization', `Bearer ${authToken}`);
    }
    
    if (userId) {
      metadata.set('user-id', userId);
    }
    
    if (requestId) {
      metadata.set('request-id', requestId);
    }
    
    metadata.set('client-version', '1.0.0');
    metadata.set('timestamp', Date.now().toString());
    
    return metadata;
  }

  // Create service account metadata
  export function createServiceMetadata(serviceToken: string, serviceName: string): any {
    const metadata = new (require('@grpc/grpc-js').Metadata)();
    
    metadata.set('x-service-token', serviceToken);
    metadata.set('x-service-name', serviceName);
    metadata.set('client-version', '1.0.0');
    metadata.set('timestamp', Date.now().toString());
    
    return metadata;
  }

  // Generate request ID
  export function generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  // Retry with exponential backoff
  export async function retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          break;
        }
        
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
      }
    }
    
    throw lastError!;
  }

  // Create timeout promise
  export function withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    errorMessage: string = 'Operation timed out'
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
    });
    
    return Promise.race([promise, timeoutPromise]);
  }

  // Validate gRPC response
  export function validateResponse<T>(
    response: T & { error_message?: string },
    operation: string
  ): T {
    if (response.error_message) {
      throw new Error(`${operation} failed: ${response.error_message}`);
    }
    return response;
  }
}

// Configuration types
export interface ServiceMeshConfig {
  services: {
    [serviceName: string]: {
      host: string;
      port: number;
      tls?: boolean;
      maxRetries?: number;
      timeout?: number;
    };
  };
  discovery?: {
    enabled: boolean;
    type: 'static' | 'kubernetes' | 'consul';
    options?: any;
  };
  security?: {
    tls: boolean;
    mtls: boolean;
    jwtSecret?: string;
    serviceTokenSecret?: string;
  };
  observability?: {
    metrics: boolean;
    tracing: boolean;
    logging: boolean;
  };
}

// Factory function to create service mesh with configuration
export function createServiceMesh(config: ServiceMeshConfig): ServiceMesh {
  const mesh = new ServiceMesh();
  
  // Setup gRPC clients based on configuration
  const grpcConfig: any = {};
  Object.entries(config.services).forEach(([name, serviceConfig]) => {
    const serviceName = name.replace('-', '') + 'Service';
    grpcConfig[serviceName] = {
      host: serviceConfig.host,
      port: serviceConfig.port,
    };
  });
  
  mesh.setupGrpcClients(grpcConfig);
  
  // Setup service discovery if enabled
  if (config.discovery?.enabled) {
    mesh.setupServiceDiscovery(config.discovery.options);
  }
  
  return mesh;
}

// Version information
export const VERSION = '1.0.0';
export const PROTOCOL_VERSION = '1';

console.log(`🚀 Zoptal Service Mesh v${VERSION} loaded`);

export default ServiceMesh;