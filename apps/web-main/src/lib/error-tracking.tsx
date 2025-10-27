'use client';

import * as Sentry from '@sentry/nextjs';
import * as React from 'react';
import { ErrorTrackingUtils } from '@zoptal/error-tracking';

// Initialize Sentry for Next.js web app
export function initializeWebErrorTracking(): void {
  if (typeof window === 'undefined') {
    // Server-side initialization
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      debug: process.env.NODE_ENV === 'development',
      
      // Server-side integrations
      integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        new Sentry.Integrations.Express({ app: undefined }),
      ],
      
      beforeSend: (event) => {
        // Filter out non-critical errors in production
        if (process.env.NODE_ENV === 'production') {
          // Skip network errors that are likely user-related
          if (event.exception?.values?.[0]?.type === 'NetworkError') {
            return null;
          }
          
          // Skip cancelled requests
          if (event.exception?.values?.[0]?.value?.includes('AbortError')) {
            return null;
          }
        }
        
        return sanitizeEvent(event);
      },
      
      beforeSendTransaction: (transaction) => {
        // Filter out health check and static asset requests
        if (transaction.name?.includes('/_next/') || 
            transaction.name?.includes('/api/health') ||
            transaction.name?.includes('/favicon.ico')) {
          return null;
        }
        
        return transaction;
      },
      
      initialScope: {
        tags: {
          service: 'web-main',
          component: 'frontend',
        },
      },
    });
  } else {
    // Client-side initialization
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      debug: process.env.NODE_ENV === 'development',
      
      // Client-side integrations
      integrations: [
        new Sentry.BrowserTracing({
          tracePropagationTargets: [
            'localhost',
            /^https:\/\/api\.zoptal\.com/,
            /^https:\/\/.*\.zoptal\.com/,
          ],
        }),
      ],
      
      beforeSend: (event) => {
        // Filter client-side errors
        if (process.env.NODE_ENV === 'production') {
          // Skip script loading errors (likely ad blockers or browser extensions)
          if (event.exception?.values?.[0]?.value?.includes('Script error')) {
            return null;
          }
          
          // Skip permission denied errors (CORS, etc.)
          if (event.exception?.values?.[0]?.value?.includes('Permission denied')) {
            return null;
          }
          
          // Skip non-JS errors
          if (event.exception?.values?.[0]?.type === 'SyntaxError' &&
              event.exception?.values?.[0]?.value?.includes('Unexpected token')) {
            return null;
          }
        }
        
        return sanitizeEvent(event);
      },
      
      initialScope: {
        tags: {
          service: 'web-main',
          component: 'frontend',
          side: 'client',
        },
      },
    });
  }
}

// Sanitize Sentry events
function sanitizeEvent(event: Sentry.Event): Sentry.Event {
  // Remove sensitive data from URLs
  if (event.request?.url) {
    event.request.url = sanitizeUrl(event.request.url);
  }
  
  // Remove sensitive data from breadcrumbs
  if (event.breadcrumbs) {
    event.breadcrumbs = event.breadcrumbs.map(breadcrumb => {
      if (breadcrumb.data?.url) {
        breadcrumb.data.url = sanitizeUrl(breadcrumb.data.url);
      }
      return breadcrumb;
    });
  }
  
  // Remove sensitive data from extra
  if (event.extra) {
    event.extra = ErrorTrackingUtils.sanitizeForLogging(event.extra);
  }
  
  return event;
}

// Sanitize URLs
function sanitizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const sensitiveParams = ['token', 'api_key', 'password', 'secret', 'auth'];
    
    for (const param of sensitiveParams) {
      if (urlObj.searchParams.has(param)) {
        urlObj.searchParams.set(param, '[REDACTED]');
      }
    }
    
    return urlObj.toString();
  } catch {
    return url;
  }
}

// Web-specific error types
export class NavigationError extends Error {
  constructor(message: string, public route: string) {
    super(message);
    this.name = 'NavigationError';
  }
}

export class ComponentError extends Error {
  constructor(message: string, public component: string, public props?: any) {
    super(message);
    this.name = 'ComponentError';
  }
}

export class APIError extends Error {
  constructor(message: string, public endpoint: string, public status?: number) {
    super(message);
    this.name = 'APIError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string, public reason?: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

// Web-specific error capture
export function captureWebError(
  error: Error,
  context?: {
    component?: string;
    route?: string;
    user?: any;
    extra?: Record<string, any>;
    tags?: Record<string, string>;
  }
): string {
  // Set user context if available
  if (context?.user) {
    Sentry.setUser({
      id: context.user.id,
      email: context.user.email,
      username: context.user.name || context.user.username,
    });
  }
  
  // Set tags
  const tags = {
    component: context?.component || 'unknown',
    route: context?.route || (typeof window !== 'undefined' ? window.location.pathname : 'unknown'),
    ...context?.tags,
  };
  
  // Add error-specific context
  if (error instanceof NavigationError) {
    tags.error_type = 'navigation';
    tags.target_route = error.route;
  } else if (error instanceof ComponentError) {
    tags.error_type = 'component';
    tags.component_name = error.component;
  } else if (error instanceof APIError) {
    tags.error_type = 'api';
    tags.endpoint = error.endpoint;
    tags.status_code = error.status?.toString() || 'unknown';
  } else if (error instanceof AuthenticationError) {
    tags.error_type = 'authentication';
    tags.auth_reason = error.reason || 'unknown';
  }
  
  return Sentry.captureException(error, {
    tags,
    extra: {
      ...context?.extra,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    },
  });
}

// Performance monitoring
export function captureWebPerformance(
  name: string,
  duration: number,
  context?: {
    component?: string;
    route?: string;
    type?: 'navigation' | 'api' | 'render' | 'load';
  }
): void {
  Sentry.addBreadcrumb({
    message: `Performance: ${name}`,
    category: 'performance',
    level: 'info',
    data: {
      name,
      duration,
      component: context?.component,
      route: context?.route,
      type: context?.type || 'unknown',
    },
  });
  
  // Log slow operations
  if (duration > 3000) { // 3 seconds
    captureWebError(
      new Error(`Slow operation: ${name} took ${duration}ms`),
      {
        component: context?.component,
        route: context?.route,
        tags: {
          performance_issue: 'slow_operation',
          operation_type: context?.type || 'unknown',
        },
        extra: {
          duration,
          threshold: 3000,
        },
      }
    );
  }
}

// API call tracking
export function trackAPICall(
  endpoint: string,
  method: string,
  status: number,
  duration: number,
  error?: Error
): void {
  Sentry.addBreadcrumb({
    message: `API Call: ${method} ${endpoint}`,
    category: 'http',
    level: error ? 'error' : 'info',
    data: {
      method,
      endpoint: sanitizeUrl(endpoint),
      status,
      duration,
    },
  });
  
  if (error || status >= 400) {
    const apiError = error || new APIError(
      `API call failed: ${method} ${endpoint} returned ${status}`,
      endpoint,
      status
    );
    
    captureWebError(apiError, {
      tags: {
        api_method: method,
        api_status: status.toString(),
      },
      extra: {
        duration,
        endpoint: sanitizeUrl(endpoint),
      },
    });
  }
}

// Navigation tracking
export function trackNavigation(from: string, to: string, method: 'push' | 'replace' = 'push'): void {
  Sentry.addBreadcrumb({
    message: `Navigation: ${from} -> ${to}`,
    category: 'navigation',
    level: 'info',
    data: {
      from: sanitizeUrl(from),
      to: sanitizeUrl(to),
      method,
    },
  });
  
  // Set current route tag
  Sentry.setTag('current_route', to);
}

// Default fallback component for error boundary (client-side)
const DefaultErrorFallback = ({ error, resetError }: { error: Error; resetError: () => void }) => (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    <h2>Something went wrong</h2>
    <p>{error.message}</p>
    <button onClick={resetError}>Try again</button>
  </div>
);

// Component error boundary
export function withErrorBoundary<P extends Record<string, any>>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
): React.ComponentType<P> {
  return Sentry.withErrorBoundary(Component, {
    fallback: fallback || DefaultErrorFallback,
    beforeCapture: (scope, error, info) => {
      scope.setTag('error_boundary', true);
      scope.setContext('component_stack', {
        componentStack: info.componentStack,
      });
    },
  });
}

// Hook for error tracking in components
export function useErrorTracking() {
  const captureError = (error: Error, context?: any) => {
    return captureWebError(error, context);
  };
  
  const trackPerformance = (name: string, duration: number, context?: any) => {
    captureWebPerformance(name, duration, context);
  };
  
  const addBreadcrumb = (message: string, data?: any) => {
    Sentry.addBreadcrumb({
      message,
      category: 'user',
      level: 'info',
      data,
    });
  };
  
  return {
    captureError,
    trackPerformance,
    addBreadcrumb,
  };
}

// Higher-order component for automatic error tracking
export function withErrorTracking<P extends Record<string, any>>(
  Component: React.ComponentType<P>,
  componentName?: string
): React.ComponentType<P> {
  const WrappedComponent = (props: P) => {
    React.useEffect(() => {
      // Track component mount
      Sentry.addBreadcrumb({
        message: `Component mounted: ${componentName || Component.name}`,
        category: 'component',
        level: 'info',
      });
      
      return () => {
        // Track component unmount
        Sentry.addBreadcrumb({
          message: `Component unmounted: ${componentName || Component.name}`,
          category: 'component',
          level: 'info',
        });
      };
    }, []);
    
    try {
      return React.createElement(Component, props);
    } catch (error) {
      captureWebError(error as Error, {
        component: componentName || Component.name,
        tags: {
          error_type: 'render',
        },
        extra: {
          props: ErrorTrackingUtils.sanitizeForLogging(props),
        },
      });
      
      throw error;
    }
  };
  
  WrappedComponent.displayName = `withErrorTracking(${componentName || Component.name})`;
  
  return WrappedComponent;
}

// User session tracking
export function setUser(user: {
  id: string;
  email?: string;
  name?: string;
  role?: string;
}): void {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.name,
  });
  
  Sentry.setTag('user_role', user.role || 'user');
  
  Sentry.addBreadcrumb({
    message: 'User logged in',
    category: 'auth',
    level: 'info',
    data: {
      userId: user.id,
      email: user.email,
    },
  });
}

export function clearUser(): void {
  Sentry.setUser(null);
  
  Sentry.addBreadcrumb({
    message: 'User logged out',
    category: 'auth',
    level: 'info',
  });
}

// Feature flag tracking
export function trackFeatureFlag(flag: string, value: boolean | string): void {
  Sentry.setTag(`feature_${flag}`, value.toString());
  
  Sentry.addBreadcrumb({
    message: `Feature flag: ${flag} = ${value}`,
    category: 'feature_flag',
    level: 'info',
    data: {
      flag,
      value,
    },
  });
}

// Business event tracking
export function trackBusinessEvent(
  event: string,
  properties?: Record<string, any>
): void {
  Sentry.addBreadcrumb({
    message: `Business event: ${event}`,
    category: 'business',
    level: 'info',
    data: {
      event,
      ...ErrorTrackingUtils.sanitizeForLogging(properties || {}),
    },
  });
}

// Initialize error tracking when the module is loaded
initializeWebErrorTracking();