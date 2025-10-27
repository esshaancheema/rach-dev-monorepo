import * as grpc from '@grpc/grpc-js';
import { EventEmitter } from 'events';

export interface ServiceEndpoint {
  id: string;
  name: string;
  host: string;
  port: number;
  weight: number;
  healthy: boolean;
  lastHealthCheck: Date;
  metadata: { [key: string]: string };
}

export interface ServiceDiscoveryOptions {
  healthCheckInterval: number; // milliseconds
  unhealthyThreshold: number; // number of failed checks before marking unhealthy
  healthyThreshold: number; // number of successful checks before marking healthy
  timeout: number; // health check timeout in milliseconds
}

export class ServiceDiscovery extends EventEmitter {
  private services: Map<string, ServiceEndpoint[]> = new Map();
  private healthCheckIntervals: Map<string, NodeJS.Timeout> = new Map();
  private failureCounts: Map<string, number> = new Map();
  private successCounts: Map<string, number> = new Map();
  private options: ServiceDiscoveryOptions;

  constructor(options: Partial<ServiceDiscoveryOptions> = {}) {
    super();
    this.options = {
      healthCheckInterval: 30000, // 30 seconds
      unhealthyThreshold: 3,
      healthyThreshold: 2,
      timeout: 5000, // 5 seconds
      ...options,
    };
  }

  // Register a service endpoint
  public registerService(endpoint: Omit<ServiceEndpoint, 'lastHealthCheck'>): void {
    const fullEndpoint: ServiceEndpoint = {
      ...endpoint,
      lastHealthCheck: new Date(),
    };

    if (!this.services.has(endpoint.name)) {
      this.services.set(endpoint.name, []);
    }

    const endpoints = this.services.get(endpoint.name)!;
    const existingIndex = endpoints.findIndex(e => e.id === endpoint.id);

    if (existingIndex >= 0) {
      endpoints[existingIndex] = fullEndpoint;
    } else {
      endpoints.push(fullEndpoint);
    }

    // Start health checking for this endpoint
    this.startHealthChecking(fullEndpoint);

    this.emit('serviceRegistered', fullEndpoint);
    console.log(`✅ Service registered: ${endpoint.name}:${endpoint.id}`);
  }

  // Unregister a service endpoint
  public unregisterService(serviceName: string, endpointId: string): void {
    const endpoints = this.services.get(serviceName);
    if (!endpoints) return;

    const index = endpoints.findIndex(e => e.id === endpointId);
    if (index >= 0) {
      const endpoint = endpoints[index];
      endpoints.splice(index, 1);

      // Stop health checking
      this.stopHealthChecking(endpoint);

      this.emit('serviceUnregistered', endpoint);
      console.log(`❌ Service unregistered: ${serviceName}:${endpointId}`);
    }

    // Remove service if no endpoints left
    if (endpoints.length === 0) {
      this.services.delete(serviceName);
    }
  }

  // Get healthy endpoints for a service
  public getHealthyEndpoints(serviceName: string): ServiceEndpoint[] {
    const endpoints = this.services.get(serviceName) || [];
    return endpoints.filter(endpoint => endpoint.healthy);
  }

  // Get all endpoints for a service (including unhealthy)
  public getAllEndpoints(serviceName: string): ServiceEndpoint[] {
    return this.services.get(serviceName) || [];
  }

  // Get endpoint using load balancing strategy
  public getEndpoint(
    serviceName: string,
    strategy: 'round-robin' | 'least-connections' | 'weighted' | 'random' = 'round-robin'
  ): ServiceEndpoint | null {
    const healthyEndpoints = this.getHealthyEndpoints(serviceName);
    if (healthyEndpoints.length === 0) {
      return null;
    }

    switch (strategy) {
      case 'round-robin':
        return this.roundRobinSelection(healthyEndpoints);
      case 'weighted':
        return this.weightedSelection(healthyEndpoints);
      case 'random':
        return healthyEndpoints[Math.floor(Math.random() * healthyEndpoints.length)];
      case 'least-connections':
        // For now, fallback to round-robin (would need connection tracking)
        return this.roundRobinSelection(healthyEndpoints);
      default:
        return healthyEndpoints[0];
    }
  }

  // Round-robin load balancing
  private roundRobinCounters: Map<string, number> = new Map();
  
  private roundRobinSelection(endpoints: ServiceEndpoint[]): ServiceEndpoint {
    const serviceName = endpoints[0]?.name;
    if (!serviceName) return endpoints[0];

    const counter = this.roundRobinCounters.get(serviceName) || 0;
    const selectedEndpoint = endpoints[counter % endpoints.length];
    this.roundRobinCounters.set(serviceName, counter + 1);
    
    return selectedEndpoint;
  }

  // Weighted selection based on endpoint weights
  private weightedSelection(endpoints: ServiceEndpoint[]): ServiceEndpoint {
    const totalWeight = endpoints.reduce((sum, endpoint) => sum + endpoint.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const endpoint of endpoints) {
      random -= endpoint.weight;
      if (random <= 0) {
        return endpoint;
      }
    }
    
    return endpoints[0]; // Fallback
  }

  // Start health checking for an endpoint
  private startHealthChecking(endpoint: ServiceEndpoint): void {
    const key = `${endpoint.name}:${endpoint.id}`;
    
    // Clear existing interval if any
    this.stopHealthChecking(endpoint);

    const interval = setInterval(async () => {
      await this.performHealthCheck(endpoint);
    }, this.options.healthCheckInterval);

    this.healthCheckIntervals.set(key, interval);
    
    // Perform initial health check
    this.performHealthCheck(endpoint);
  }

  // Stop health checking for an endpoint
  private stopHealthChecking(endpoint: ServiceEndpoint): void {
    const key = `${endpoint.name}:${endpoint.id}`;
    const interval = this.healthCheckIntervals.get(key);
    
    if (interval) {
      clearInterval(interval);
      this.healthCheckIntervals.delete(key);
    }
    
    this.failureCounts.delete(key);
    this.successCounts.delete(key);
  }

  // Perform health check on an endpoint
  private async performHealthCheck(endpoint: ServiceEndpoint): Promise<void> {
    const key = `${endpoint.name}:${endpoint.id}`;
    
    try {
      const isHealthy = await this.checkEndpointHealth(endpoint);
      
      if (isHealthy) {
        const successCount = (this.successCounts.get(key) || 0) + 1;
        this.successCounts.set(key, successCount);
        this.failureCounts.set(key, 0); // Reset failure count
        
        // Mark as healthy if it wasn't already and meets threshold
        if (!endpoint.healthy && successCount >= this.options.healthyThreshold) {
          endpoint.healthy = true;
          this.emit('serviceHealthy', endpoint);
          console.log(`✅ Service healthy: ${endpoint.name}:${endpoint.id}`);
        }
      } else {
        const failureCount = (this.failureCounts.get(key) || 0) + 1;
        this.failureCounts.set(key, failureCount);
        this.successCounts.set(key, 0); // Reset success count
        
        // Mark as unhealthy if it was healthy and meets threshold
        if (endpoint.healthy && failureCount >= this.options.unhealthyThreshold) {
          endpoint.healthy = false;
          this.emit('serviceUnhealthy', endpoint);
          console.log(`❌ Service unhealthy: ${endpoint.name}:${endpoint.id}`);
        }
      }
      
      endpoint.lastHealthCheck = new Date();
    } catch (error) {
      console.error(`Health check error for ${endpoint.name}:${endpoint.id}:`, error);
      
      const failureCount = (this.failureCounts.get(key) || 0) + 1;
      this.failureCounts.set(key, failureCount);
      
      if (endpoint.healthy && failureCount >= this.options.unhealthyThreshold) {
        endpoint.healthy = false;
        this.emit('serviceUnhealthy', endpoint);
      }
    }
  }

  // Check if a specific endpoint is healthy
  private async checkEndpointHealth(endpoint: ServiceEndpoint): Promise<boolean> {
    return new Promise((resolve) => {
      const client = new grpc.Client(
        `${endpoint.host}:${endpoint.port}`,
        grpc.credentials.createInsecure()
      );

      const deadline = new Date();
      deadline.setMilliseconds(deadline.getMilliseconds() + this.options.timeout);

      // Use gRPC health checking protocol
      client.makeUnaryRequest(
        '/grpc.health.v1.Health/Check',
        (arg: any) => Buffer.from(JSON.stringify(arg)),
        (arg: Buffer) => JSON.parse(arg.toString()),
        { service: endpoint.name },
        { deadline },
        (error: grpc.ServiceError | null, response: any) => {
          client.close();
          
          if (error) {
            resolve(false);
          } else {
            // Check if response indicates serving
            resolve(response?.status === 'SERVING' || response?.status === 1);
          }
        }
      );
    });
  }

  // Get service statistics
  public getServiceStats(serviceName: string): {
    total: number;
    healthy: number;
    unhealthy: number;
    endpoints: ServiceEndpoint[];
  } {
    const endpoints = this.getAllEndpoints(serviceName);
    const healthy = endpoints.filter(e => e.healthy);
    
    return {
      total: endpoints.length,
      healthy: healthy.length,
      unhealthy: endpoints.length - healthy.length,
      endpoints: endpoints,
    };
  }

  // Get all services
  public getAllServices(): string[] {
    return Array.from(this.services.keys());
  }

  // Cleanup resources
  public destroy(): void {
    // Clear all health check intervals
    for (const interval of this.healthCheckIntervals.values()) {
      clearInterval(interval);
    }
    
    this.healthCheckIntervals.clear();
    this.failureCounts.clear();
    this.successCounts.clear();
    this.roundRobinCounters.clear();
    this.services.clear();
    
    this.removeAllListeners();
    console.log('Service discovery destroyed');
  }
}

// Kubernetes service discovery integration
export class KubernetesServiceDiscovery extends ServiceDiscovery {
  private k8sWatchers: Map<string, any> = new Map();

  constructor(
    private kubeConfig: any,
    options: Partial<ServiceDiscoveryOptions> = {}
  ) {
    super(options);
  }

  // Watch Kubernetes services and endpoints
  public watchKubernetesService(
    serviceName: string,
    namespace: string = 'default',
    labelSelector?: string
  ): void {
    try {
      // This would integrate with @kubernetes/client-node
      // Implementation would watch for service/endpoint changes
      // and automatically register/unregister endpoints
      
      console.log(`👀 Watching Kubernetes service: ${serviceName} in namespace: ${namespace}`);
      
      // Mock implementation - in real scenario, this would use k8s client
      this.simulateKubernetesServiceDiscovery(serviceName, namespace);
    } catch (error) {
      console.error(`Failed to watch Kubernetes service ${serviceName}:`, error);
    }
  }

  // Mock Kubernetes service discovery (replace with real implementation)
  private simulateKubernetesServiceDiscovery(serviceName: string, namespace: string): void {
    // In real implementation, this would:
    // 1. Connect to Kubernetes API
    // 2. Watch for service and endpoint changes
    // 3. Automatically register/unregister endpoints
    // 4. Handle service updates and scaling events
    
    const mockEndpoints = [
      {
        id: `${serviceName}-pod-1`,
        name: serviceName,
        host: `${serviceName}-pod-1.${namespace}.svc.cluster.local`,
        port: serviceName.includes('auth') ? 4000 : 
              serviceName.includes('project') ? 4001 :
              serviceName.includes('billing') ? 4003 : 4000,
        weight: 1,
        healthy: true,
        metadata: {
          namespace,
          podName: `${serviceName}-pod-1`,
          version: 'v1.0.0'
        }
      },
      {
        id: `${serviceName}-pod-2`,
        name: serviceName,
        host: `${serviceName}-pod-2.${namespace}.svc.cluster.local`,
        port: serviceName.includes('auth') ? 4000 : 
              serviceName.includes('project') ? 4001 :
              serviceName.includes('billing') ? 4003 : 4000,
        weight: 1,
        healthy: true,
        metadata: {
          namespace,
          podName: `${serviceName}-pod-2`,
          version: 'v1.0.0'
        }
      }
    ];

    // Register mock endpoints
    mockEndpoints.forEach(endpoint => {
      setTimeout(() => {
        this.registerService(endpoint);
      }, Math.random() * 2000); // Stagger registration
    });
  }

  public stopWatchingKubernetesService(serviceName: string): void {
    const watcher = this.k8sWatchers.get(serviceName);
    if (watcher) {
      // Stop the Kubernetes watcher
      if (watcher.stop) {
        watcher.stop();
      }
      this.k8sWatchers.delete(serviceName);
      console.log(`Stopped watching Kubernetes service: ${serviceName}`);
    }
  }

  public destroy(): void {
    // Stop all Kubernetes watchers
    for (const [serviceName] of this.k8sWatchers) {
      this.stopWatchingKubernetesService(serviceName);
    }
    
    super.destroy();
  }
}

// Circuit breaker implementation
export class CircuitBreaker {
  private failures: number = 0;
  private lastFailureTime: number = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private failureThreshold: number = 5,
    private recoveryTimeout: number = 60000, // 1 minute
    private monitoringPeriod: number = 10000 // 10 seconds
  ) {}

  public async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
        this.state = 'HALF_OPEN';
        console.log('Circuit breaker: HALF_OPEN');
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await operation();
      
      if (this.state === 'HALF_OPEN') {
        this.reset();
      }
      
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  private recordFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
      console.log('Circuit breaker: OPEN');
    }
  }

  private reset(): void {
    this.failures = 0;
    this.state = 'CLOSED';
    this.lastFailureTime = 0;
    console.log('Circuit breaker: CLOSED');
  }

  public getState(): string {
    return this.state;
  }

  public getFailureCount(): number {
    return this.failures;
  }
}