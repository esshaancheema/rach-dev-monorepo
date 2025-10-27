'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

/**
 * Animation Error Boundary Props
 */
interface AnimationErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, retry: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  animationName?: string;
  enableRetry?: boolean;
  maxRetries?: number;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

/**
 * Animation Error Boundary State
 */
interface AnimationErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
  errorId: string;
}

/**
 * Sentry Context Data for Animation Errors
 */
interface SentryAnimationContext {
  animation_name: string;
  browser_info: {
    user_agent: string;
    viewport: {
      width: number;
      height: number;
    };
    supports_gpu: boolean;
    reduced_motion: boolean;
    connection_type?: string;
  };
  performance_info: {
    memory_usage?: number;
    timing: number;
    frame_rate_estimate: number;
  };
  component_stack: string;
  retry_count: number;
  error_boundary_version: string;
}

/**
 * AnimationErrorBoundary Component
 * 
 * Enterprise-grade error boundary specifically designed for animation components.
 * Provides graceful fallbacks, Sentry integration, retry mechanisms, and detailed
 * error context for debugging animation-related issues.
 * 
 * Features:
 * - Automatic error recovery with configurable retry limits
 * - Detailed Sentry error reporting with animation context
 * - Progressive fallback rendering (static content)
 * - Performance impact tracking
 * - Accessibility-aware error handling
 * 
 * @example
 * ```tsx
 * <AnimationErrorBoundary 
 *   animationName="product_grid"
 *   fallback={<StaticProductGrid />}
 *   enableRetry={true}
 *   maxRetries={2}
 * >
 *   <AnimatedProductGrid />
 * </AnimationErrorBoundary>
 * ```
 */
export class AnimationErrorBoundary extends Component<
  AnimationErrorBoundaryProps,
  AnimationErrorBoundaryState
> {
  private retryTimeoutId: NodeJS.Timeout | null = null;
  private errorId: string;

  constructor(props: AnimationErrorBoundaryProps) {
    super(props);
    
    this.errorId = this.generateErrorId();
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      errorId: this.errorId,
    };
  }

  /**
   * Generate unique error ID for tracking
   */
  private generateErrorId(): string {
    return `anim_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * React Error Boundary - Catch errors during rendering
   */
  static getDerivedStateFromError(error: Error): Partial<AnimationErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `anim_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  /**
   * React Error Boundary - Handle errors and side effects
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      errorInfo,
    });

    // Send to Sentry with detailed animation context
    this.sendToSentry(error, errorInfo);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Track error in Google Analytics
    this.trackErrorInGA4(error);

    // Log detailed error in development
    if (process.env.NODE_ENV === 'development') {
      this.logDevelopmentError(error, errorInfo);
    }
  }

  /**
   * Check if component should retry based on props changes
   */
  componentDidUpdate(prevProps: AnimationErrorBoundaryProps) {
    if (
      this.props.resetOnPropsChange &&
      this.props.resetKeys &&
      this.state.hasError
    ) {
      const hasResetKeyChanged = this.props.resetKeys.some(
        (resetKey, index) => prevProps.resetKeys?.[index] !== resetKey
      );

      if (hasResetKeyChanged) {
        this.resetErrorBoundary();
      }
    }
  }

  /**
   * Cleanup timeouts on unmount
   */
  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  /**
   * Send comprehensive error data to Sentry
   */
  private sendToSentry(error: Error, errorInfo: ErrorInfo) {
    // Check if Sentry is available
    if (typeof window === 'undefined') return;

    try {
      // Create detailed animation context
      const animationContext: SentryAnimationContext = {
        animation_name: this.props.animationName || 'unknown_animation',
        browser_info: {
          user_agent: navigator.userAgent,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight,
          },
          supports_gpu: this.checkGPUSupport(),
          reduced_motion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
          connection_type: this.getConnectionType(),
        },
        performance_info: {
          memory_usage: this.getMemoryUsage(),
          timing: performance.now(),
          frame_rate_estimate: this.estimateFrameRate(),
        },
        component_stack: errorInfo.componentStack,
        retry_count: this.state.retryCount,
        error_boundary_version: '1.0.0',
      };

      // Send to Sentry if available
      if (window.Sentry) {
        window.Sentry.withScope((scope) => {
          scope.setTag('error_boundary', 'animation');
          scope.setTag('animation_name', animationContext.animation_name);
          scope.setLevel('error');
          
          scope.setContext('animation_details', animationContext);
          scope.setContext('error_boundary', {
            error_id: this.state.errorId,
            retry_count: this.state.retryCount,
            max_retries: this.props.maxRetries || 1,
          });

          scope.setFingerprint([
            'animation-error',
            animationContext.animation_name,
            error.name,
            error.message.slice(0, 100), // First 100 chars of error message
          ]);

          window.Sentry.captureException(error);
        });
      }
    } catch (sentryError) {
      console.error('Failed to send animation error to Sentry:', sentryError);
    }
  }

  /**
   * Track animation error in Google Analytics 4
   */
  private trackErrorInGA4(error: Error) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'animation_error', {
        animation_name: this.props.animationName || 'unknown',
        error_message: error.message,
        error_stack: error.stack?.slice(0, 500), // Truncate stack trace
        retry_count: this.state.retryCount,
        error_id: this.state.errorId,
        page_path: window.location.pathname,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Log detailed error information in development
   */
  private logDevelopmentError(error: Error, errorInfo: ErrorInfo) {
    console.group('🚨 Animation Error Boundary');
    console.error('Animation Name:', this.props.animationName || 'Unknown');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Error ID:', this.state.errorId);
    console.error('Retry Count:', this.state.retryCount);
    console.groupEnd();
  }

  /**
   * Reset error boundary state
   */
  private resetErrorBoundary = () => {
    this.errorId = this.generateErrorId();
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      errorId: this.errorId,
    });
  };

  /**
   * Retry rendering with exponential backoff
   */
  private retryRender = () => {
    const maxRetries = this.props.maxRetries || 1;
    
    if (this.state.retryCount >= maxRetries) {
      console.warn(`Animation "${this.props.animationName}" exceeded max retry attempts`);
      return;
    }

    // Exponential backoff: 100ms, 200ms, 400ms, etc.
    const delay = Math.min(1000, 100 * Math.pow(2, this.state.retryCount));

    this.retryTimeoutId = setTimeout(() => {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1,
        errorId: this.generateErrorId(),
      }));
    }, delay);
  };

  /**
   * Utility functions for error context
   */
  private checkGPUSupport(): boolean {
    try {
      const canvas = document.createElement('canvas');
      return !!(
        window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
    } catch {
      return false;
    }
  }

  private getConnectionType(): string | undefined {
    return (navigator as any)?.connection?.effectiveType;
  }

  private getMemoryUsage(): number | undefined {
    return (performance as any)?.memory?.usedJSHeapSize;
  }

  private estimateFrameRate(): number {
    // Simple frame rate estimation based on requestAnimationFrame timing
    let frameCount = 0;
    const startTime = performance.now();

    const countFrame = () => {
      frameCount++;
      if (frameCount < 10) {
        requestAnimationFrame(countFrame);
      }
    };

    requestAnimationFrame(countFrame);

    // Return estimated FPS (this is a rough estimate)
    return Math.round((frameCount / (performance.now() - startTime)) * 1000);
  }

  /**
   * Render method
   */
  render() {
    if (this.state.hasError) {
      // Custom fallback component
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback(this.state.error!, this.retryRender);
      }

      // Static fallback component
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div
          className="animation-error-fallback p-4 bg-gray-50 border border-gray-200 rounded-lg"
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">!</span>
            </div>
            <h3 className="text-sm font-medium text-gray-900">
              Animation Temporarily Unavailable
            </h3>
          </div>
          
          <p className="text-sm text-gray-600 mb-3">
            We're experiencing a technical issue with the animation on this page. 
            The content is still fully accessible.
          </p>
          
          {this.props.enableRetry && this.state.retryCount < (this.props.maxRetries || 1) && (
            <button
              onClick={this.retryRender}
              className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition-colors"
            >
              Try Again ({this.state.retryCount + 1}/{this.props.maxRetries || 1})
            </button>
          )}
          
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-3">
              <summary className="text-xs text-gray-500 cursor-pointer">
                Debug Information
              </summary>
              <pre className="text-xs text-gray-600 mt-1 p-2 bg-gray-100 rounded overflow-x-auto">
                Error: {this.state.error?.message}
                {'\n'}ID: {this.state.errorId}
                {'\n'}Animation: {this.props.animationName || 'Unknown'}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * withAnimationErrorBoundary HOC
 * 
 * Higher-order component that wraps any component with animation error boundary.
 * Provides a convenient way to add error handling to animation components.
 * 
 * @param Component - Component to wrap
 * @param errorBoundaryProps - Error boundary configuration
 * @returns Wrapped component with error boundary
 * 
 * @example
 * ```tsx
 * const SafeAnimatedCard = withAnimationErrorBoundary(AnimatedCard, {
 *   animationName: 'card_animation',
 *   fallback: <StaticCard />,
 * });
 * ```
 */
export function withAnimationErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<AnimationErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <AnimationErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </AnimationErrorBoundary>
  );

  WrappedComponent.displayName = `withAnimationErrorBoundary(${
    Component.displayName || Component.name
  })`;

  return WrappedComponent;
}

/**
 * Type declarations for global Sentry (if not already declared)
 */
declare global {
  interface Window {
    Sentry?: {
      captureException: (error: Error) => void;
      withScope: (callback: (scope: any) => void) => void;
    };
    gtag?: (...args: any[]) => void;
  }
}