'use client';

import { onCLS, onINP, onFCP, onLCP, onTTFB, Metric } from 'web-vitals';

// Web Vitals thresholds (Google's recommendations)
export const THRESHOLDS = {
  CLS: { good: 0.1, needsImprovement: 0.25 },
  INP: { good: 200, needsImprovement: 500 },
  FCP: { good: 1800, needsImprovement: 3000 },
  LCP: { good: 2500, needsImprovement: 4000 },
  TTFB: { good: 800, needsImprovement: 1800 },
} as const;

export type VitalName = keyof typeof THRESHOLDS;

export interface VitalScore {
  name: VitalName;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: string;
}

// Score classification function
export function getVitalRating(name: VitalName, value: number): VitalScore['rating'] {
  const threshold = THRESHOLDS[name];
  if (value <= threshold.good) return 'good';
  if (value <= threshold.needsImprovement) return 'needs-improvement';
  return 'poor';
}

// Analytics function to send metrics
export function sendToAnalytics(metric: Metric, options: {
  debug?: boolean;
  analyticsId?: string;
  apiEndpoint?: string;
} = {}) {
  const { debug = false, analyticsId, apiEndpoint = '/api/analytics/web-vitals' } = options;
  
  const vitalScore: VitalScore = {
    name: metric.name as VitalName,
    value: metric.value,
    rating: getVitalRating(metric.name as VitalName, metric.value),
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType || 'navigate',
  };

  if (debug) {
    console.info(`${metric.name}: ${metric.value}ms (${vitalScore.rating})`, vitalScore);
  }

  // Send to analytics endpoint
  if (typeof window !== 'undefined' && 'navigator' in window && 'sendBeacon' in navigator) {
    const body = JSON.stringify({
      ...vitalScore,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
      analyticsId,
    });

    // Use sendBeacon for reliable transmission
    navigator.sendBeacon(apiEndpoint, body);
  } else {
    // Fallback to fetch
    fetch(apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vitalScore),
      keepalive: true,
    }).catch(console.error);
  }
}

// Main function to initialize Web Vitals tracking
export function trackWebVitals(options: {
  debug?: boolean;
  analyticsId?: string;
  apiEndpoint?: string;
} = {}) {
  try {
    onCLS((metric) => sendToAnalytics(metric, options));
    onINP((metric) => sendToAnalytics(metric, options));
    onFCP((metric) => sendToAnalytics(metric, options));
    onLCP((metric) => sendToAnalytics(metric, options));
    onTTFB((metric) => sendToAnalytics(metric, options));
  } catch (error) {
    console.error('Error tracking web vitals:', error);
  }
}

// Performance observer for additional metrics
export class PerformanceMonitor {
  private observer: PerformanceObserver | null = null;
  private metrics: Map<string, number> = new Map();

  constructor(private options: { debug?: boolean } = {}) {
    this.setupObserver();
  }

  private setupObserver() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    try {
      this.observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            this.trackNavigationMetrics(navEntry);
          } else if (entry.entryType === 'paint') {
            this.metrics.set(entry.name, entry.startTime);
            if (this.options.debug) {
              console.info(`${entry.name}: ${entry.startTime}ms`);
            }
          } else if (entry.entryType === 'largest-contentful-paint') {
            this.metrics.set('LCP', entry.startTime);
          }
        });
      });

      this.observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] });
    } catch (error) {
      console.error('Error setting up performance observer:', error);
    }
  }

  private trackNavigationMetrics(entry: PerformanceNavigationTiming) {
    const metrics = {
      'DNS Lookup': entry.domainLookupEnd - entry.domainLookupStart,
      'TCP Connection': entry.connectEnd - entry.connectStart,
      'TLS Negotiation': entry.requestStart - entry.secureConnectionStart,
      'Request': entry.responseStart - entry.requestStart,
      'Response': entry.responseEnd - entry.responseStart,
      'DOM Processing': entry.domComplete - entry.domLoading,
      'Resource Loading': entry.loadEventStart - entry.domContentLoadedEventEnd,
    };

    Object.entries(metrics).forEach(([name, value]) => {
      if (value > 0) {
        this.metrics.set(name, value);
        if (this.options.debug) {
          console.info(`${name}: ${value}ms`);
        }
      }
    });
  }

  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }

  getMetric(name: string): number | undefined {
    return this.metrics.get(name);
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.metrics.clear();
  }
}

// Resource timing analysis
export function analyzeResourceTiming(): {
  resources: Array<{
    name: string;
    type: string;
    size: number;
    duration: number;
    startTime: number;
  }>;
  summary: {
    totalResources: number;
    totalSize: number;
    totalDuration: number;
    slowestResource: string;
    largestResource: string;
  };
} {
  if (typeof window === 'undefined') {
    return { resources: [], summary: { totalResources: 0, totalSize: 0, totalDuration: 0, slowestResource: '', largestResource: '' } };
  }

  const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  
  const resources = entries.map((entry) => ({
    name: entry.name,
    type: entry.initiatorType,
    size: entry.transferSize || 0,
    duration: entry.responseEnd - entry.startTime,
    startTime: entry.startTime,
  }));

  const totalSize = resources.reduce((sum, r) => sum + r.size, 0);
  const totalDuration = resources.reduce((sum, r) => sum + r.duration, 0);
  const slowestResource = resources.reduce((slowest, current) => 
    current.duration > slowest.duration ? current : slowest, resources[0])?.name || '';
  const largestResource = resources.reduce((largest, current) => 
    current.size > largest.size ? current : largest, resources[0])?.name || '';

  return {
    resources,
    summary: {
      totalResources: resources.length,
      totalSize,
      totalDuration,
      slowestResource,
      largestResource,
    },
  };
}

// Bundle size optimizer utilities
export const bundleOptimization = {
  // Lazy load components
  lazyComponent: <T extends React.ComponentType<any>>(
    importFn: () => Promise<{ default: T }>,
    fallback?: React.ComponentType
  ) => {
    const LazyComponent = React.lazy(importFn);

    const LazyWrapper = React.forwardRef<any, React.ComponentProps<T>>((props, ref) => (
      <React.Suspense fallback={fallback ? React.createElement(fallback) : <div>Loading...</div>}>
        <LazyComponent {...props} ref={ref} />
      </React.Suspense>
    ));
    LazyWrapper.displayName = 'LazyWrapper';
    return LazyWrapper;
  },

  // Preload critical resources
  preloadResource: (href: string, as: string, type?: string) => {
    if (typeof document === 'undefined') return;
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    if (type) link.type = type;
    
    document.head.appendChild(link);
  },

  // Prefetch next page resources
  prefetchPage: (href: string) => {
    if (typeof document === 'undefined') return;
    
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    
    document.head.appendChild(link);
  },

  // Critical CSS injection
  injectCriticalCSS: (css: string) => {
    if (typeof document === 'undefined') return;
    
    const style = document.createElement('style');
    style.textContent = css;
    style.setAttribute('data-critical', 'true');
    
    document.head.appendChild(style);
  },
};

// React component for web vitals tracking
import React from 'react';

interface WebVitalsProviderProps {
  children: React.ReactNode;
  debug?: boolean;
  analyticsId?: string;
  apiEndpoint?: string;
}

export function WebVitalsProvider({ 
  children, 
  debug = false, 
  analyticsId,
  apiEndpoint 
}: WebVitalsProviderProps) {
  React.useEffect(() => {
    trackWebVitals({ debug, analyticsId, apiEndpoint });
  }, [debug, analyticsId, apiEndpoint]);

  return <>{children}</>;
}