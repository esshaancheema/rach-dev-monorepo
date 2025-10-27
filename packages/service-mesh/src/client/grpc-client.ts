import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

// Type definitions for our services
export interface ServiceConfig {
  host: string;
  port: number;
  options?: grpc.ChannelOptions;
}

export interface GrpcClientOptions {
  services: {
    auth?: ServiceConfig;
    project?: ServiceConfig;
    billing?: ServiceConfig;
    notification?: ServiceConfig;
    analytics?: ServiceConfig;
  };
  defaultOptions?: grpc.ChannelOptions;
}

export class GrpcClientManager {
  private clients: Map<string, any> = new Map();
  private packageDefinitions: Map<string, any> = new Map();
  private options: GrpcClientOptions;

  constructor(options: GrpcClientOptions) {
    this.options = {
      defaultOptions: {
        'grpc.keepalive_time_ms': 30000,
        'grpc.keepalive_timeout_ms': 5000,
        'grpc.keepalive_permit_without_calls': true,
        'grpc.http2.max_pings_without_data': 0,
        'grpc.http2.min_time_between_pings_ms': 10000,
        'grpc.http2.min_ping_interval_without_data_ms': 300000,
        'grpc.max_receive_message_length': 4 * 1024 * 1024, // 4MB
        'grpc.max_send_message_length': 4 * 1024 * 1024, // 4MB
      },
      ...options,
    };

    this.initializeClients();
  }

  private initializeClients(): void {
    const protoPath = path.join(__dirname, '../grpc/protos');
    
    // Initialize each service client
    Object.entries(this.options.services).forEach(([serviceName, config]) => {
      if (config) {
        this.createClient(serviceName, config, protoPath);
      }
    });
  }

  private createClient(serviceName: string, config: ServiceConfig, protoPath: string): void {
    try {
      const protoFile = path.join(protoPath, `${serviceName}.proto`);
      
      // Load proto definition
      const packageDefinition = protoLoader.loadSync(protoFile, {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      });

      const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
      this.packageDefinitions.set(serviceName, protoDescriptor);

      // Get service constructor
      const ServiceConstructor = this.getServiceConstructor(protoDescriptor, serviceName);
      
      if (!ServiceConstructor) {
        throw new Error(`Service constructor not found for ${serviceName}`);
      }

      // Create client with merged options
      const clientOptions = {
        ...this.options.defaultOptions,
        ...config.options,
      };

      const client = new ServiceConstructor(
        `${config.host}:${config.port}`,
        grpc.credentials.createInsecure(), // Use TLS in production
        clientOptions
      );

      this.clients.set(serviceName, client);
      console.log(`✅ ${serviceName} gRPC client initialized`);
    } catch (error) {
      console.error(`❌ Failed to initialize ${serviceName} client:`, error);
      throw error;
    }
  }

  private getServiceConstructor(protoDescriptor: any, serviceName: string): any {
    // Navigate the proto descriptor to find the service constructor
    const packageMap: { [key: string]: string } = {
      auth: 'zoptal.auth.v1',
      project: 'zoptal.project.v1',
      billing: 'zoptal.billing.v1',
      notification: 'zoptal.notification.v1',
      analytics: 'zoptal.analytics.v1',
    };

    const packageName = packageMap[serviceName];
    if (!packageName) {
      throw new Error(`Unknown service: ${serviceName}`);
    }

    const packageParts = packageName.split('.');
    let current = protoDescriptor;
    
    for (const part of packageParts) {
      current = current[part];
      if (!current) {
        throw new Error(`Package path not found: ${packageName}`);
      }
    }

    // Service names in PascalCase
    const serviceNameMap: { [key: string]: string } = {
      auth: 'AuthService',
      project: 'ProjectService',
      billing: 'BillingService',
      notification: 'NotificationService',
      analytics: 'AnalyticsService',
    };

    const serviceName_pascal = serviceNameMap[serviceName];
    return current[serviceName_pascal];
  }

  // Get specific service client
  public getAuthClient(): any {
    return this.clients.get('auth');
  }

  public getProjectClient(): any {
    return this.clients.get('project');
  }

  public getBillingClient(): any {
    return this.clients.get('billing');
  }

  public getNotificationClient(): any {
    return this.clients.get('notification');
  }

  public getAnalyticsClient(): any {
    return this.clients.get('analytics');
  }

  // Generic client getter
  public getClient(serviceName: string): any {
    const client = this.clients.get(serviceName);
    if (!client) {
      throw new Error(`Client not found for service: ${serviceName}`);
    }
    return client;
  }

  // Health check all services
  public async healthCheckAll(): Promise<{ [key: string]: boolean }> {
    const results: { [key: string]: boolean } = {};
    
    const healthCheckPromises = Array.from(this.clients.entries()).map(
      async ([serviceName, client]) => {
        try {
          await this.promisifyGrpcCall(client, 'healthCheck', {});
          results[serviceName] = true;
        } catch (error) {
          console.error(`Health check failed for ${serviceName}:`, error);
          results[serviceName] = false;
        }
      }
    );

    await Promise.all(healthCheckPromises);
    return results;
  }

  // Utility method to promisify gRPC calls
  public promisifyGrpcCall<T, R>(
    client: any,
    method: string,
    request: T,
    metadata?: grpc.Metadata
  ): Promise<R> {
    return new Promise((resolve, reject) => {
      const callback = (error: grpc.ServiceError | null, response: R) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      };

      if (metadata) {
        client[method](request, metadata, callback);
      } else {
        client[method](request, callback);
      }
    });
  }

  // Close all connections
  public async close(): Promise<void> {
    const closePromises = Array.from(this.clients.values()).map(client => {
      return new Promise<void>((resolve) => {
        client.close();
        resolve();
      });
    });

    await Promise.all(closePromises);
    this.clients.clear();
    console.log('All gRPC clients closed');
  }
}

// Service-specific client wrappers with type safety
export class AuthServiceClient {
  private client: any;
  private grpcManager: GrpcClientManager;

  constructor(grpcManager: GrpcClientManager) {
    this.grpcManager = grpcManager;
    this.client = grpcManager.getAuthClient();
  }

  async validateToken(token: string): Promise<any> {
    return this.grpcManager.promisifyGrpcCall(
      this.client,
      'validateToken',
      { token }
    );
  }

  async getUser(userId: string): Promise<any> {
    return this.grpcManager.promisifyGrpcCall(
      this.client,
      'getUser',
      { user_id: userId }
    );
  }

  async getUserPermissions(userId: string, resource?: string): Promise<any> {
    return this.grpcManager.promisifyGrpcCall(
      this.client,
      'getUserPermissions',
      { user_id: userId, resource }
    );
  }
}

export class ProjectServiceClient {
  private client: any;
  private grpcManager: GrpcClientManager;

  constructor(grpcManager: GrpcClientManager) {
    this.grpcManager = grpcManager;
    this.client = grpcManager.getProjectClient();
  }

  async getProject(projectId: string, userId: string): Promise<any> {
    return this.grpcManager.promisifyGrpcCall(
      this.client,
      'getProject',
      { project_id: projectId, user_id: userId }
    );
  }

  async listUserProjects(
    userId: string,
    page: number = 1,
    limit: number = 10,
    status?: string,
    type?: string
  ): Promise<any> {
    return this.grpcManager.promisifyGrpcCall(
      this.client,
      'listUserProjects',
      { user_id: userId, page, limit, status, type }
    );
  }

  async checkProjectAccess(
    projectId: string,
    userId: string,
    permission: string
  ): Promise<any> {
    return this.grpcManager.promisifyGrpcCall(
      this.client,
      'checkProjectAccess',
      { project_id: projectId, user_id: userId, required_permission: permission }
    );
  }
}

export class BillingServiceClient {
  private client: any;
  private grpcManager: GrpcClientManager;

  constructor(grpcManager: GrpcClientManager) {
    this.grpcManager = grpcManager;
    this.client = grpcManager.getBillingClient();
  }

  async getUserSubscription(userId: string): Promise<any> {
    return this.grpcManager.promisifyGrpcCall(
      this.client,
      'getUserSubscription',
      { user_id: userId }
    );
  }

  async checkSubscriptionLimits(
    userId: string,
    resourceType: string,
    requestedAmount: number
  ): Promise<any> {
    return this.grpcManager.promisifyGrpcCall(
      this.client,
      'checkSubscriptionLimits',
      { user_id: userId, resource_type: resourceType, requested_amount: requestedAmount }
    );
  }

  async recordUsage(
    userId: string,
    resourceType: string,
    amount: number,
    description?: string
  ): Promise<any> {
    return this.grpcManager.promisifyGrpcCall(
      this.client,
      'recordUsage',
      {
        user_id: userId,
        resource_type: resourceType,
        amount,
        description,
        timestamp: { seconds: Math.floor(Date.now() / 1000) }
      }
    );
  }
}

export class NotificationServiceClient {
  private client: any;
  private grpcManager: GrpcClientManager;

  constructor(grpcManager: GrpcClientManager) {
    this.grpcManager = grpcManager;
    this.client = grpcManager.getNotificationClient();
  }

  async sendEmail(request: {
    to: string;
    subject: string;
    htmlContent?: string;
    textContent?: string;
    templateId?: string;
    templateVariables?: any;
  }): Promise<any> {
    return this.grpcManager.promisifyGrpcCall(
      this.client,
      'sendEmail',
      {
        to: request.to,
        subject: request.subject,
        html_content: request.htmlContent,
        text_content: request.textContent,
        template_id: request.templateId,
        template_variables: request.templateVariables,
        priority: 'NORMAL'
      }
    );
  }

  async sendSMS(to: string, message: string, templateId?: string): Promise<any> {
    return this.grpcManager.promisifyGrpcCall(
      this.client,
      'sendSMS',
      { to, message, template_id: templateId, priority: 'NORMAL' }
    );
  }

  async sendPushNotification(request: {
    userId: string;
    title: string;
    body: string;
    imageUrl?: string;
    actionUrl?: string;
    data?: any;
  }): Promise<any> {
    return this.grpcManager.promisifyGrpcCall(
      this.client,
      'sendPushNotification',
      {
        user_id: request.userId,
        title: request.title,
        body: request.body,
        image_url: request.imageUrl,
        action_url: request.actionUrl,
        data: request.data,
        priority: 'NORMAL'
      }
    );
  }
}

export class AnalyticsServiceClient {
  private client: any;
  private grpcManager: GrpcClientManager;

  constructor(grpcManager: GrpcClientManager) {
    this.grpcManager = grpcManager;
    this.client = grpcManager.getAnalyticsClient();
  }

  async trackEvent(request: {
    projectId: string;
    userId?: string;
    sessionId: string;
    eventType: string;
    eventName: string;
    properties?: any;
    metadata?: any;
  }): Promise<any> {
    return this.grpcManager.promisifyGrpcCall(
      this.client,
      'trackEvent',
      {
        project_id: request.projectId,
        user_id: request.userId,
        session_id: request.sessionId,
        event_type: request.eventType,
        event_name: request.eventName,
        properties: request.properties,
        metadata: request.metadata,
        timestamp: { seconds: Math.floor(Date.now() / 1000) }
      }
    );
  }

  async trackPageView(request: {
    projectId: string;
    userId?: string;
    sessionId: string;
    path: string;
    title?: string;
    referrer?: string;
    timeOnPage?: number;
    metadata?: any;
  }): Promise<any> {
    return this.grpcManager.promisifyGrpcCall(
      this.client,
      'trackPageView',
      {
        project_id: request.projectId,
        user_id: request.userId,
        session_id: request.sessionId,
        path: request.path,
        title: request.title,
        referrer: request.referrer,
        time_on_page: request.timeOnPage,
        metadata: request.metadata,
        timestamp: { seconds: Math.floor(Date.now() / 1000) }
      }
    );
  }

  async getAnalytics(request: {
    projectId: string;
    userId: string;
    startDate: Date;
    endDate: Date;
    metrics: string[];
    dimensions?: string[];
    filters?: any[];
    groupBy?: string;
  }): Promise<any> {
    return this.grpcManager.promisifyGrpcCall(
      this.client,
      'getAnalytics',
      {
        project_id: request.projectId,
        user_id: request.userId,
        start_date: { seconds: Math.floor(request.startDate.getTime() / 1000) },
        end_date: { seconds: Math.floor(request.endDate.getTime() / 1000) },
        metrics: request.metrics,
        dimensions: request.dimensions || [],
        filters: request.filters || [],
        group_by: request.groupBy
      }
    );
  }
}

// Factory function to create configured client manager
export function createGrpcClientManager(config: {
  authService?: { host: string; port: number };
  projectService?: { host: string; port: number };
  billingService?: { host: string; port: number };
  notificationService?: { host: string; port: number };
  analyticsService?: { host: string; port: number };
}): GrpcClientManager {
  const services: GrpcClientOptions['services'] = {};

  if (config.authService) {
    services.auth = {
      host: config.authService.host,
      port: config.authService.port,
    };
  }

  if (config.projectService) {
    services.project = {
      host: config.projectService.host,
      port: config.projectService.port,
    };
  }

  if (config.billingService) {
    services.billing = {
      host: config.billingService.host,
      port: config.billingService.port,
    };
  }

  if (config.notificationService) {
    services.notification = {
      host: config.notificationService.host,
      port: config.notificationService.port,
    };
  }

  if (config.analyticsService) {
    services.analytics = {
      host: config.analyticsService.host,
      port: config.analyticsService.port,
    };
  }

  return new GrpcClientManager({ services });
}