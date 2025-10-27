import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';
import { RewriteFrames } from '@sentry/integrations';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

export interface SentryConfig {
  dsn: string;
  environment: string;
  release?: string;
  sampleRate: number;
  tracesSampleRate: number;
  profilesSampleRate: number;
  enableProfiling: boolean;
  enableTracing: boolean;
  debug: boolean;
  beforeSend?: (event: Sentry.Event) => Sentry.Event | null;
  beforeSendTransaction?: (event: Sentry.Transaction) => Sentry.Transaction | null;
  integrations?: Sentry.Integration[];
  tags?: Record<string, string>;
  extra?: Record<string, any>;
}

export class SentryErrorTracker {
  private static instance: SentryErrorTracker;
  private initialized = false;
  private config: SentryConfig;

  private constructor(config: SentryConfig) {
    this.config = config;
  }

  public static getInstance(config?: SentryConfig): SentryErrorTracker {
    if (!SentryErrorTracker.instance && config) {
      SentryErrorTracker.instance = new SentryErrorTracker(config);
    }
    return SentryErrorTracker.instance;
  }

  public initialize(): void {
    if (this.initialized) {
      console.warn('Sentry already initialized');
      return;
    }

    const integrations: Sentry.Integration[] = [
      // Rewrite frames to clean up stack traces
      new RewriteFrames({
        root: process.cwd(),
      }),
      
      // HTTP integration for tracking requests
      new Sentry.Integrations.Http({
        tracing: this.config.enableTracing,
      }),
      
      // Express integration
      new Sentry.Integrations.Express({
        app: undefined, // Will be set when Express app is available
      }),
      
      // GraphQL integration if using GraphQL
      new Sentry.Integrations.GraphQL(),
      
      // Prisma integration for database monitoring
      new Sentry.Integrations.Prisma(),
      
      // Redis integration
      new Sentry.Integrations.Redis(),
    ];

    // Add profiling integration if enabled
    if (this.config.enableProfiling) {
      integrations.push(nodeProfilingIntegration());
    }

    // Add custom integrations
    if (this.config.integrations) {
      integrations.push(...this.config.integrations);
    }

    Sentry.init({
      dsn: this.config.dsn,
      environment: this.config.environment,
      release: this.config.release || process.env.npm_package_version,
      sampleRate: this.config.sampleRate,
      tracesSampleRate: this.config.tracesSampleRate,
      profilesSampleRate: this.config.profilesSampleRate,
      debug: this.config.debug,
      integrations,
      
      // Configure beforeSend to filter/modify events
      beforeSend: (event: Sentry.Event) => {
        // Remove sensitive data
        event = this.sanitizeEvent(event);
        
        // Apply custom beforeSend if provided
        if (this.config.beforeSend) {
          return this.config.beforeSend(event);
        }
        
        return event;
      },

      // Configure beforeSendTransaction
      beforeSendTransaction: (event: Sentry.Transaction) => {
        if (this.config.beforeSendTransaction) {
          return this.config.beforeSendTransaction(event);
        }
        return event;
      },

      // Initial scope configuration
      initialScope: {
        tags: this.config.tags || {},
        extra: this.config.extra || {},
      },
    });

    this.initialized = true;
    console.log(`✅ Sentry initialized for environment: ${this.config.environment}`);
  }

  // Sanitize events to remove sensitive information
  private sanitizeEvent(event: Sentry.Event): Sentry.Event {
    const sensitiveKeys = [
      'password',
      'token',
      'secret',
      'key',
      'authorization',
      'cookie',
      'session',
      'csrf',
      'credit_card',
      'ssn',
      'social_security',
    ];

    // Sanitize request data
    if (event.request?.data) {
      event.request.data = this.sanitizeObject(event.request.data, sensitiveKeys);
    }

    // Sanitize extra data
    if (event.extra) {
      event.extra = this.sanitizeObject(event.extra, sensitiveKeys);
    }

    // Sanitize breadcrumbs
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.map(breadcrumb => {
        if (breadcrumb.data) {
          breadcrumb.data = this.sanitizeObject(breadcrumb.data, sensitiveKeys);
        }
        return breadcrumb;
      });
    }

    return event;
  }

  private sanitizeObject(obj: any, sensitiveKeys: string[]): any {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item, sensitiveKeys));
    }

    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const isSensitive = sensitiveKeys.some(sensitiveKey =>
        key.toLowerCase().includes(sensitiveKey.toLowerCase())
      );

      if (isSensitive) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object') {
        sanitized[key] = this.sanitizeObject(value, sensitiveKeys);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  // Capture exception with additional context
  public captureException(
    error: Error,
    context?: {
      tags?: Record<string, string>;
      extra?: Record<string, any>;
      user?: Sentry.User;
      level?: Sentry.SeverityLevel;
      fingerprint?: string[];
    }
  ): string {
    return Sentry.captureException(error, {
      tags: context?.tags,
      extra: context?.extra,
      user: context?.user,
      level: context?.level || 'error',
      fingerprint: context?.fingerprint,
    });
  }

  // Capture message with context
  public captureMessage(
    message: string,
    level: Sentry.SeverityLevel = 'info',
    context?: {
      tags?: Record<string, string>;
      extra?: Record<string, any>;
      user?: Sentry.User;
      fingerprint?: string[];
    }
  ): string {
    return Sentry.captureMessage(message, {
      level,
      tags: context?.tags,
      extra: context?.extra,
      user: context?.user,
      fingerprint: context?.fingerprint,
    });
  }

  // Add breadcrumb for context
  public addBreadcrumb(breadcrumb: Sentry.Breadcrumb): void {
    Sentry.addBreadcrumb(breadcrumb);
  }

  // Set user context
  public setUser(user: Sentry.User): void {
    Sentry.setUser(user);
  }

  // Set tags
  public setTag(key: string, value: string): void {
    Sentry.setTag(key, value);
  }

  // Set extra context
  public setExtra(key: string, extra: any): void {
    Sentry.setExtra(key, extra);
  }

  // Set context
  public setContext(name: string, context: Record<string, any>): void {
    Sentry.setContext(name, context);
  }

  // Create transaction for performance monitoring
  public startTransaction(
    name: string,
    op: string,
    description?: string
  ): Sentry.Transaction {
    return Sentry.startTransaction({
      name,
      op,
      description,
    });
  }

  // Flush events and close Sentry
  public async close(timeout?: number): Promise<boolean> {
    return await Sentry.close(timeout);
  }

  // Get current hub for advanced usage
  public getHub(): Sentry.Hub {
    return Sentry.getCurrentHub();
  }

  // Express error handler middleware
  public getExpressErrorHandler(): any {
    return Sentry.Handlers.errorHandler({
      shouldHandleError: (error: any) => {
        // Handle all errors
        return true;
      },
    });
  }

  // Express request handler middleware
  public getExpressRequestHandler(): any {
    return Sentry.Handlers.requestHandler({
      ip: true,
      request: ['cookies', 'data', 'headers', 'method', 'query_string', 'url'],
      serverName: false,
      transaction: 'path',
      user: ['id', 'username', 'email'],
    });
  }

  // Express tracing handler middleware
  public getExpressTracingHandler(): any {
    return Sentry.Handlers.tracingHandler();
  }
}

// Default configuration factory
export function createSentryConfig(overrides: Partial<SentryConfig> = {}): SentryConfig {
  return {
    dsn: process.env.SENTRY_DSN || '',
    environment: process.env.NODE_ENV || 'development',
    release: process.env.SENTRY_RELEASE || process.env.npm_package_version,
    sampleRate: 1.0,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    enableProfiling: process.env.NODE_ENV === 'production',
    enableTracing: true,
    debug: process.env.NODE_ENV === 'development',
    tags: {
      service: process.env.SERVICE_NAME || 'unknown',
      version: process.env.SERVICE_VERSION || 'unknown',
    },
    ...overrides,
  };
}

// Service-specific Sentry configurations
export const authServiceSentryConfig = createSentryConfig({
  tags: {
    service: 'auth-service',
    component: 'authentication',
  },
  extra: {
    service_type: 'microservice',
    port: 4000,
  },
});

export const projectServiceSentryConfig = createSentryConfig({
  tags: {
    service: 'project-service',
    component: 'project-management',
  },
  extra: {
    service_type: 'microservice',
    port: 4001,
  },
});

export const billingServiceSentryConfig = createSentryConfig({
  tags: {
    service: 'billing-service',
    component: 'billing',
  },
  extra: {
    service_type: 'microservice',
    port: 4003,
  },
});

export const notificationServiceSentryConfig = createSentryConfig({
  tags: {
    service: 'notification-service',
    component: 'notifications',
  },
  extra: {
    service_type: 'microservice',
    port: 4004,
  },
});

export const analyticsServiceSentryConfig = createSentryConfig({
  tags: {
    service: 'analytics-service',
    component: 'analytics',
  },
  extra: {
    service_type: 'microservice',
    port: 4005,
  },
});

// Frontend Sentry configurations
export const webMainSentryConfig = createSentryConfig({
  tags: {
    service: 'web-main',
    component: 'frontend',
  },
  extra: {
    service_type: 'web-app',
    port: 3000,
  },
});

export const dashboardSentryConfig = createSentryConfig({
  tags: {
    service: 'dashboard',
    component: 'frontend',
  },
  extra: {
    service_type: 'web-app',
    port: 3001,
  },
});

export const adminSentryConfig = createSentryConfig({
  tags: {
    service: 'admin',
    component: 'frontend',
  },
  extra: {
    service_type: 'web-app',
    port: 3002,
  },
});