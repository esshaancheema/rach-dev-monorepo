import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';
import { useState, useEffect } from 'react';

export interface WebVitalsMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

// Thresholds based on Google's recommendations
const THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },
  FID: { good: 100, poor: 300 },
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 },
};

function getRating(name: keyof typeof THRESHOLDS, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name];
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

function sendToAnalytics(metric: WebVitalsMetric) {
  // Send to Google Analytics 4
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      custom_parameter_1: metric.rating,
    });
  }

  // Send to Sentry for performance monitoring
  if (typeof window !== 'undefined' && window.Sentry) {
    window.Sentry.addBreadcrumb({
      category: 'web-vitals',
      message: `${metric.name}: ${metric.value} (${metric.rating})`,
      level: 'info',
      data: metric,
    });
  }

  // Send to custom analytics endpoint
  if (process.env.NODE_ENV === 'production') {
    fetch('/api/analytics/web-vitals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metric),
    }).catch(console.error);
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.info('Web Vitals:', metric);
  }
}

export function initWebVitals() {
  try {
    onCLS((metric: any) => {
      const webVitalsMetric: WebVitalsMetric = {
        name: 'CLS',
        value: metric.value,
        rating: getRating('CLS', metric.value),
        delta: metric.delta,
        id: metric.id,
      };
      sendToAnalytics(webVitalsMetric);
    });

    onFID((metric: any) => {
      const webVitalsMetric: WebVitalsMetric = {
        name: 'FID',
        value: metric.value,
        rating: getRating('FID', metric.value),
        delta: metric.delta,
        id: metric.id,
      };
      sendToAnalytics(webVitalsMetric);
    });

    onFCP((metric: any) => {
      const webVitalsMetric: WebVitalsMetric = {
        name: 'FCP',
        value: metric.value,
        rating: getRating('FCP', metric.value),
        delta: metric.delta,
        id: metric.id,
      };
      sendToAnalytics(webVitalsMetric);
    });

    onLCP((metric: any) => {
      const webVitalsMetric: WebVitalsMetric = {
        name: 'LCP',
        value: metric.value,
        rating: getRating('LCP', metric.value),
        delta: metric.delta,
        id: metric.id,
      };
      sendToAnalytics(webVitalsMetric);
    });

    onTTFB((metric: any) => {
      const webVitalsMetric: WebVitalsMetric = {
        name: 'TTFB',
        value: metric.value,
        rating: getRating('TTFB', metric.value),
        delta: metric.delta,
        id: metric.id,
      };
      sendToAnalytics(webVitalsMetric);
    });
  } catch (error) {
    console.error('Error initializing Web Vitals:', error);
  }
}

// Performance optimization utilities
export const performanceOptimizations = {
  // Preload critical resources
  preloadCriticalResources() {
    if (typeof document === 'undefined') return;

    const criticalResources = [
      { href: '/fonts/inter-var.woff2', as: 'font', type: 'font/woff2' },
      { href: '/images/hero-bg.webp', as: 'image' },
    ];

    criticalResources.forEach(({ href, as, type }) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = href;
      link.as = as;
      if (type) link.type = type;
      if (as === 'font') link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  },

  // Optimize images for LCP
  optimizeLCP() {
    if (typeof document === 'undefined') return;

    // Find and prioritize LCP candidate images
    const heroImages = document.querySelectorAll('img[data-priority="true"]');
    heroImages.forEach((img) => {
      if (img instanceof HTMLImageElement) {
        img.loading = 'eager';
        img.fetchPriority = 'high';
      }
    });

    // Preload LCP images
    const lcpImages = document.querySelectorAll('[data-lcp="true"]');
    lcpImages.forEach((element) => {
      if (element instanceof HTMLImageElement) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = element.src;
        link.as = 'image';
        document.head.appendChild(link);
      }
    });
  },

  // Reduce CLS by setting dimensions
  preventLayoutShift() {
    if (typeof document === 'undefined') return;

    // Add aspect ratio to images without dimensions
    const images = document.querySelectorAll('img:not([width]):not([height])');
    images.forEach((img) => {
      if (img instanceof HTMLImageElement) {
        img.style.aspectRatio = '16/9'; // Default aspect ratio
        img.style.objectFit = 'cover';
      }
    });

    // Reserve space for dynamic content
    const dynamicContainers = document.querySelectorAll('[data-dynamic="true"]');
    dynamicContainers.forEach((container) => {
      if (container instanceof HTMLElement) {
        container.style.minHeight = '200px'; // Reserve minimum space
      }
    });
  },

  // Optimize third-party scripts
  optimizeThirdPartyScripts() {
    if (typeof document === 'undefined') return;

    // Defer non-critical scripts
    const nonCriticalScripts = document.querySelectorAll('script[data-defer="true"]');
    nonCriticalScripts.forEach((script) => {
      if (script instanceof HTMLScriptElement) {
        script.defer = true;
      }
    });

    // Load analytics scripts after page load
    window.addEventListener('load', () => {
      // Google Analytics
      if (process.env.NEXT_PUBLIC_GA_TRACKING_ID) {
        const gaScript = document.createElement('script');
        gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_TRACKING_ID}`;
        gaScript.async = true;
        document.head.appendChild(gaScript);
      }
    });
  },

  // Monitor and improve FID
  optimizeFID() {
    if (typeof document === 'undefined') return;

    // Use scheduler API if available
    if ('scheduler' in window && 'postTask' in window.scheduler) {
      // Defer heavy tasks to improve input responsiveness
      const heavyTasks = document.querySelectorAll('[data-heavy-task="true"]');
      heavyTasks.forEach((element) => {
        element.addEventListener('click', (event) => {
          event.preventDefault();
          
          window.scheduler.postTask(() => {
            // Execute heavy task
            if (element instanceof HTMLElement && element.onclick) {
              element.onclick(event as any);
            }
          }, { priority: 'background' });
        });
      });
    }

    // Break up long tasks
    const longTasks = new Map();
    
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((entries) => {
        entries.getEntries().forEach((entry) => {
          if (entry.duration > 50) { // Tasks longer than 50ms
            longTasks.set(entry.name, entry.duration);
          }
        });
      });
      
      observer.observe({ entryTypes: ['longtask'] });
    }
  },
};

// Initialize performance optimizations
export function initPerformanceOptimizations() {
  if (typeof window === 'undefined') return;

  // Run immediately
  performanceOptimizations.preloadCriticalResources();
  performanceOptimizations.preventLayoutShift();

  // Run on DOM content loaded
  document.addEventListener('DOMContentLoaded', () => {
    performanceOptimizations.optimizeLCP();
    performanceOptimizations.optimizeFID();
  });

  // Run after page load
  window.addEventListener('load', () => {
    performanceOptimizations.optimizeThirdPartyScripts();
    
    // Initialize Web Vitals tracking after a short delay
    setTimeout(() => {
      initWebVitals();
    }, 1000);
  });
}

// React hook for Web Vitals monitoring
export function useWebVitals() {
  const [metrics, setMetrics] = useState<WebVitalsMetric[]>([]);

  useEffect(() => {
    const handleMetric = (metric: WebVitalsMetric) => {
      setMetrics((prev: any) => [...prev.filter((m: any) => m.name !== metric.name), metric]);
    };

    // Initialize tracking
    initWebVitals();

    // Custom event listener for metrics
    const handleCustomMetric = (event: CustomEvent<WebVitalsMetric>) => {
      handleMetric(event.detail);
    };

    window.addEventListener('web-vitals-metric', handleCustomMetric as EventListener);

    return () => {
      window.removeEventListener('web-vitals-metric', handleCustomMetric as EventListener);
    };
  }, []);

  const getMetricByName = (name: string) => metrics.find((m: any) => m.name === name);
  
  const getOverallScore = () => {
    if (metrics.length === 0) return null;
    
    const scores = metrics.map((metric) => {
      switch (metric.rating) {
        case 'good': return 100;
        case 'needs-improvement': return 50;
        case 'poor': return 0;
        default: return 0;
      }
    });
    
    return Math.round(scores.reduce((sum: any, score: any) => sum + score, 0) / scores.length);
  };

  return {
    metrics,
    getMetricByName,
    getOverallScore,
  };
}