'use client';

// Performance monitoring and optimization utilities

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  type: 'navigation' | 'resource' | 'paint' | 'layout' | 'custom';
}

interface PerformanceReport {
  metrics: PerformanceMetric[];
  vitals: {
    fcp?: number;
    lcp?: number;
    fid?: number;
    cls?: number;
    ttfb?: number;
  };
  resources: {
    scripts: number;
    stylesheets: number;
    images: number;
    totalSize: number;
  };
  recommendations: string[];
}

// Web Vitals tracking
export class PerformanceTracker {
  private metrics: PerformanceMetric[] = [];
  private observer: PerformanceObserver | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObserver();
      this.trackNavigationTiming();
    }
  }

  private initializeObserver() {
    if ('PerformanceObserver' in window) {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric({
            name: entry.name,
            value: entry.startTime,
            timestamp: Date.now(),
            type: this.getEntryType(entry.entryType),
          });
        }
      });

      this.observer.observe({ 
        entryTypes: ['navigation', 'resource', 'paint', 'layout-shift', 'first-input'] 
      });
    }
  }

  private getEntryType(entryType: string): PerformanceMetric['type'] {
    switch (entryType) {
      case 'navigation': return 'navigation';
      case 'resource': return 'resource';
      case 'paint': return 'paint';
      case 'layout-shift': return 'layout';
      default: return 'custom';
    }
  }

  private trackNavigationTiming() {
    if ('performance' in window && window.performance.timing) {
      const timing = window.performance.timing;
      const navigationStart = timing.navigationStart;

      // Key timing metrics
      const metrics = {
        'DNS Lookup': timing.domainLookupEnd - timing.domainLookupStart,
        'TCP Connection': timing.connectEnd - timing.connectStart,
        'Request': timing.responseStart - timing.requestStart,
        'Response': timing.responseEnd - timing.responseStart,
        'DOM Processing': timing.domComplete - timing.domLoading,
        'Load Complete': timing.loadEventEnd - timing.loadEventStart,
      };

      Object.entries(metrics).forEach(([name, value]) => {
        this.recordMetric({
          name,
          value,
          timestamp: Date.now(),
          type: 'navigation',
        });
      });
    }
  }

  recordMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);
    
    // Keep only last 100 metrics to prevent memory issues
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  generateReport(): PerformanceReport {
    const vitals = this.getWebVitals();
    const resources = this.getResourceMetrics();
    const recommendations = this.generateRecommendations(vitals, resources);

    return {
      metrics: this.getMetrics(),
      vitals,
      resources,
      recommendations,
    };
  }

  private getWebVitals() {
    const vitals: PerformanceReport['vitals'] = {};

    if ('performance' in window) {
      // First Contentful Paint
      const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
      if (fcpEntry) vitals.fcp = fcpEntry.startTime;

      // Largest Contentful Paint
      const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
      if (lcpEntries.length) {
        vitals.lcp = lcpEntries[lcpEntries.length - 1].startTime;
      }

      // Time to First Byte
      const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navEntry) {
        vitals.ttfb = navEntry.responseStart - navEntry.requestStart;
      }

      // Cumulative Layout Shift
      const clsEntries = performance.getEntriesByType('layout-shift');
      vitals.cls = clsEntries.reduce((total, entry: any) => {
        if (!entry.hadRecentInput) {
          return total + entry.value;
        }
        return total;
      }, 0);
    }

    return vitals;
  }

  private getResourceMetrics() {
    if (!('performance' in window)) {
      return { scripts: 0, stylesheets: 0, images: 0, totalSize: 0 };
    }

    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    let scripts = 0;
    let stylesheets = 0;
    let images = 0;
    let totalSize = 0;

    resources.forEach((resource) => {
      const size = resource.transferSize || 0;
      totalSize += size;

      if (resource.name.includes('.js')) scripts++;
      else if (resource.name.includes('.css')) stylesheets++;
      else if (resource.name.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) images++;
    });

    return { scripts, stylesheets, images, totalSize };
  }

  private generateRecommendations(vitals: PerformanceReport['vitals'], resources: PerformanceReport['resources']): string[] {
    const recommendations: string[] = [];

    // FCP recommendations
    if (vitals.fcp && vitals.fcp > 2500) {
      recommendations.push('First Contentful Paint is slow. Consider optimizing critical rendering path.');
    }

    // LCP recommendations
    if (vitals.lcp && vitals.lcp > 4000) {
      recommendations.push('Largest Contentful Paint is slow. Optimize your largest element or hero image.');
    }

    // CLS recommendations
    if (vitals.cls && vitals.cls > 0.25) {
      recommendations.push('Cumulative Layout Shift is high. Add size attributes to images and avoid inserting content above existing content.');
    }

    // Resource recommendations
    if (resources.scripts > 20) {
      recommendations.push(`High number of scripts (${resources.scripts}). Consider bundling and code splitting.`);
    }

    if (resources.totalSize > 5000000) { // 5MB
      recommendations.push(`Large total resource size (${Math.round(resources.totalSize / 1024 / 1024)}MB). Optimize images and enable compression.`);
    }

    return recommendations;
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// Image optimization utilities
export const imageOptimization = {
  // Create optimized image srcSet
  createSrcSet: (baseUrl: string, sizes: number[] = [400, 800, 1200, 1600]) => {
    return sizes.map(size => `${baseUrl}?w=${size} ${size}w`).join(', ');
  },

  // Generate sizes attribute
  generateSizes: (breakpoints: { [key: string]: string } = {
    '(max-width: 768px)': '100vw',
    '(max-width: 1200px)': '50vw',
    default: '33vw'
  }) => {
    const sizeEntries = Object.entries(breakpoints);
    const mediaQueries = sizeEntries.slice(0, -1).map(([bp, size]) => `${bp} ${size}`);
    const defaultSize = sizeEntries[sizeEntries.length - 1][1];
    return [...mediaQueries, defaultSize].join(', ');
  },

  // Lazy loading with Intersection Observer
  setupLazyLoading: (selector: string = 'img[data-src]') => {
    if (!('IntersectionObserver' in window)) return;

    const images = document.querySelectorAll(selector);
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;
          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        }
      });
    });

    images.forEach((img) => imageObserver.observe(img));
  },
};

// Code splitting and lazy loading utilities
export const codeOptimization = {
  // Dynamic import with loading state
  lazyImport: async <T>(importFn: () => Promise<T>, fallback?: T): Promise<T> => {
    try {
      return await importFn();
    } catch (error) {
      console.error('Lazy import failed:', error);
      if (fallback) return fallback;
      throw error;
    }
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
};

// Bundle analysis utilities
export const bundleAnalysis = {
  // Measure JavaScript bundle size
  measureBundleSize: () => {
    if (!('performance' in window)) return null;

    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const jsResources = resources.filter(r => r.name.includes('.js'));
    
    return {
      count: jsResources.length,
      totalSize: jsResources.reduce((total, r) => total + (r.transferSize || 0), 0),
      largestBundle: jsResources.reduce((largest, r) => 
        (r.transferSize || 0) > (largest.transferSize || 0) ? r : largest
      ),
    };
  },

  // Check for unused CSS
  checkUnusedCSS: async () => {
    if (!('CSS' in window) || !CSS.supports('selector(*)')) return null;

    const stylesheets = Array.from(document.styleSheets);
    const usedSelectors = new Set<string>();
    const allSelectors = new Set<string>();

    // Collect all CSS selectors
    stylesheets.forEach(sheet => {
      try {
        Array.from(sheet.cssRules || []).forEach(rule => {
          if (rule.type === CSSRule.STYLE_RULE) {
            const styleRule = rule as CSSStyleRule;
            allSelectors.add(styleRule.selectorText);
            
            // Check if selector matches any element
            try {
              if (document.querySelector(styleRule.selectorText)) {
                usedSelectors.add(styleRule.selectorText);
              }
            } catch (e) {
              // Invalid selector
            }
          }
        });
      } catch (e) {
        // Cross-origin stylesheet
      }
    });

    const unusedCount = allSelectors.size - usedSelectors.size;
    const unusedPercentage = (unusedCount / allSelectors.size) * 100;

    return {
      total: allSelectors.size,
      used: usedSelectors.size,
      unused: unusedCount,
      unusedPercentage: Math.round(unusedPercentage),
    };
  },
};

// Memory and cleanup utilities
export const memoryOptimization = {
  // Monitor memory usage
  getMemoryUsage: () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024),
      };
    }
    return null;
  },

  // Cleanup event listeners
  createCleanupManager: () => {
    const listeners: Array<{ element: EventTarget; event: string; handler: Function }> = [];

    return {
      addEventListener: (element: EventTarget, event: string, handler: EventListener) => {
        element.addEventListener(event, handler);
        listeners.push({ element, event, handler });
      },
      cleanup: () => {
        listeners.forEach(({ element, event, handler }) => {
          element.removeEventListener(event, handler as EventListener);
        });
        listeners.length = 0;
      },
    };
  },

  // Debounce expensive operations
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(null, args), wait);
    };
  },

  // Throttle frequent events
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func.apply(null, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },
};

// Performance monitoring hook for React components
export const usePerformanceMonitor = (componentName?: string) => {
  if (typeof window === 'undefined') return null;

  const tracker = new PerformanceTracker();

  // Record component render time
  const markRenderStart = () => {
    if (componentName) {
      performance.mark(`${componentName}-render-start`);
    }
  };

  const markRenderEnd = () => {
    if (componentName) {
      performance.mark(`${componentName}-render-end`);
      performance.measure(
        `${componentName}-render`,
        `${componentName}-render-start`,
        `${componentName}-render-end`
      );
    }
  };

  return {
    tracker,
    markRenderStart,
    markRenderEnd,
    getReport: () => tracker.generateReport(),
  };
};

// Export default tracker instance
export const performanceTracker = typeof window !== 'undefined' ? new PerformanceTracker() : null;

// Utility function to log performance data
export const logPerformanceMetrics = (tracker: PerformanceTracker = performanceTracker!) => {
  if (!tracker) return;

  const report = tracker.generateReport();
  
  console.group('🚀 Performance Report');
  console.info('Web Vitals:', report.vitals);
  console.info('Resources:', report.resources);
  console.info('Recommendations:', report.recommendations);
  console.groupEnd();

  return report;
};