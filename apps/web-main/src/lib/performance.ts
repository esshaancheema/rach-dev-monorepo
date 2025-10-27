// Performance monitoring utilities for auth flows

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

class AuthPerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private startTimes = new Map<string, number>();

  startMeasure(name: string, metadata?: Record<string, any>) {
    this.startTimes.set(name, performance.now());
    return {
      name,
      metadata,
      end: () => this.endMeasure(name, metadata)
    };
  }

  endMeasure(name: string, metadata?: Record<string, any>) {
    const startTime = this.startTimes.get(name);
    if (!startTime) {
      console.warn(`No start time found for metric: ${name}`);
      return;
    }

    const duration = performance.now() - startTime;
    const metric: PerformanceMetric = {
      name,
      duration,
      timestamp: Date.now(),
      metadata
    };

    this.metrics.push(metric);
    this.startTimes.delete(name);

    // Log slow operations
    if (duration > 1000) {
      console.warn(`Slow auth operation detected: ${name} took ${duration.toFixed(2)}ms`, metadata);
    }

    // Report to analytics if available
    this.reportToAnalytics(metric);

    return metric;
  }

  private reportToAnalytics(metric: PerformanceMetric) {
    // Report to Google Analytics if available
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'auth_performance', {
        event_category: 'performance',
        event_label: metric.name,
        value: Math.round(metric.duration),
        custom_map: {
          auth_operation: metric.name,
          duration_ms: metric.duration,
          ...metric.metadata
        }
      });
    }

    // Report to Web Vitals if available
    if (typeof window !== 'undefined' && 'webVitals' in window) {
      (window as any).webVitals.getCLS(console.log);
      (window as any).webVitals.getFID(console.log);
      (window as any).webVitals.getFCP(console.log);
      (window as any).webVitals.getLCP(console.log);
      (window as any).webVitals.getTTFB(console.log);
    }
  }

  getMetrics(filter?: string): PerformanceMetric[] {
    if (!filter) return [...this.metrics];
    return this.metrics.filter(metric => metric.name.includes(filter));
  }

  getAverageTime(operationName: string): number {
    const filteredMetrics = this.metrics.filter(m => m.name === operationName);
    if (filteredMetrics.length === 0) return 0;
    
    const total = filteredMetrics.reduce((sum, m) => sum + m.duration, 0);
    return total / filteredMetrics.length;
  }

  clearMetrics() {
    this.metrics = [];
    this.startTimes.clear();
  }

  // Get performance summary
  getSummary() {
    const operations = [...new Set(this.metrics.map(m => m.name))];
    
    return operations.map(operation => {
      const opMetrics = this.metrics.filter(m => m.name === operation);
      const durations = opMetrics.map(m => m.duration);
      
      return {
        operation,
        count: opMetrics.length,
        averageTime: durations.reduce((a, b) => a + b, 0) / durations.length,
        minTime: Math.min(...durations),
        maxTime: Math.max(...durations),
        totalTime: durations.reduce((a, b) => a + b, 0)
      };
    });
  }
}

// Singleton instance
export const authPerformance = new AuthPerformanceMonitor();

// React hook for measuring component performance
export function useAuthPerformanceMeasure(operationName: string, metadata?: Record<string, any>) {
  const measure = authPerformance.startMeasure(operationName, metadata);
  
  return {
    endMeasure: measure.end,
    measureAsync: async <T>(asyncOperation: () => Promise<T>): Promise<T> => {
      try {
        const result = await asyncOperation();
        measure.end();
        return result;
      } catch (error) {
        measure.end();
        throw error;
      }
    }
  };
}

// Decorator for measuring async functions
export function measureAuthPerformance(operationName: string) {
  return function <T extends (...args: any[]) => Promise<any>>(
    target: any,
    propertyName: string,
    descriptor: TypedPropertyDescriptor<T>
  ) {
    const method = descriptor.value!;
    
    descriptor.value = (async function (this: any, ...args: any[]) {
      const measure = authPerformance.startMeasure(operationName, { 
        method: propertyName,
        args: args.length 
      });
      
      try {
        const result = await method.apply(this, args);
        measure.end();
        return result;
      } catch (error) {
        measure.end();
        throw error;
      }
    }) as T;
  };
}

// Helper functions for common measurements
export const measureAuthOperation = {
  signIn: (metadata?: Record<string, any>) => 
    authPerformance.startMeasure('auth_sign_in', metadata),
  
  signUp: (metadata?: Record<string, any>) => 
    authPerformance.startMeasure('auth_sign_up', metadata),
  
  signOut: (metadata?: Record<string, any>) => 
    authPerformance.startMeasure('auth_sign_out', metadata),
  
  sessionValidation: (metadata?: Record<string, any>) => 
    authPerformance.startMeasure('auth_session_validation', metadata),
  
  tokenRefresh: (metadata?: Record<string, any>) => 
    authPerformance.startMeasure('auth_token_refresh', metadata),
  
  oauthFlow: (provider: string, metadata?: Record<string, any>) => 
    authPerformance.startMeasure(`auth_oauth_${provider}`, { provider, ...metadata }),
  
  magicLinkGeneration: (metadata?: Record<string, any>) => 
    authPerformance.startMeasure('auth_magic_link_generation', metadata),
  
  samlDiscovery: (domain: string, metadata?: Record<string, any>) => 
    authPerformance.startMeasure('auth_saml_discovery', { domain, ...metadata }),
  
  componentRender: (component: string, metadata?: Record<string, any>) => 
    authPerformance.startMeasure(`auth_component_${component}`, { component, ...metadata })
};

// Performance thresholds (in milliseconds)
export const PERFORMANCE_THRESHOLDS = {
  SIGN_IN: 2000,
  SIGN_UP: 3000,
  SESSION_VALIDATION: 500,
  TOKEN_REFRESH: 1000,
  OAUTH_REDIRECT: 1500,
  MAGIC_LINK_SEND: 2000,
  SAML_DISCOVERY: 1000,
  COMPONENT_RENDER: 100
};

// Check if operation is within acceptable performance threshold
export function isWithinThreshold(operationName: string, duration: number): boolean {
  const thresholdKey = operationName.toUpperCase().replace('AUTH_', '') as keyof typeof PERFORMANCE_THRESHOLDS;
  const threshold = PERFORMANCE_THRESHOLDS[thresholdKey];
  return threshold ? duration <= threshold : true;
}

// Performance health check
export function getAuthPerformanceHealth() {
  const summary = authPerformance.getSummary();
  const healthChecks = summary.map(op => ({
    operation: op.operation,
    isHealthy: isWithinThreshold(op.operation, op.averageTime),
    averageTime: op.averageTime,
    threshold: PERFORMANCE_THRESHOLDS[op.operation.toUpperCase().replace('AUTH_', '') as keyof typeof PERFORMANCE_THRESHOLDS] || 'N/A'
  }));
  
  const overallHealth = healthChecks.every(check => check.isHealthy);
  
  return {
    overall: overallHealth ? 'healthy' : 'needs_attention',
    checks: healthChecks,
    recommendations: getPerformanceRecommendations(healthChecks)
  };
}

function getPerformanceRecommendations(healthChecks: any[]) {
  const recommendations: string[] = [];
  
  healthChecks.forEach(check => {
    if (!check.isHealthy) {
      switch (check.operation) {
        case 'auth_sign_in':
          recommendations.push('Consider implementing request caching for sign-in operations');
          break;
        case 'auth_session_validation':
          recommendations.push('Session validation is slow - check token validation logic');
          break;
        case 'auth_oauth_google':
        case 'auth_oauth_github':
          recommendations.push('OAuth redirects are slow - check network connectivity to providers');
          break;
        default:
          recommendations.push(`${check.operation} is performing below threshold`);
      }
    }
  });
  
  return recommendations;
}