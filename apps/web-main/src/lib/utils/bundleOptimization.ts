// Bundle optimization utilities for reducing JavaScript bundle size

export interface BundleMetrics {
  totalSize: number;
  gzippedSize: number;
  firstLoadJS: number;
  chunks: Array<{
    name: string;
    size: number;
    isInitial: boolean;
  }>;
}

// Lazy loading utilities
export const dynamicImports = {
  // Lazy load heavy components
  Chart: () => import('react-chartjs-2').then(mod => ({ default: mod.Chart })),
  Editor: () => import('@monaco-editor/react').then(mod => ({ default: mod.default })),
  Calendar: () => import('react-big-calendar').then(mod => ({ default: mod.Calendar })),
  
  // Lazy load utilities
  moment: () => import('moment'),
  lodash: () => import('lodash'),
  
  // Lazy load UI libraries
  framerMotion: () => import('framer-motion'),
  reactSpring: () => import('@react-spring/web'),
};

// Code splitting for routes
export const routeBasedSplitting = {
  // Admin routes (only load when needed)
  AdminDashboard: () => import('../../../app/(auth)/admin/dashboard/page'),
  AdminUsers: () => import('../../../app/(auth)/admin/users/page'),
  AdminSettings: () => import('../../../app/(auth)/admin/settings/page'),
  
  // Heavy feature pages
  ProjectBuilder: () => import('../../../components/features/ProjectBuilder'),
  CodeEditor: () => import('../../../components/features/CodeEditor'),
  Analytics: () => import('../../../components/features/Analytics'),
};

// Bundle size monitoring
export class BundleMonitor {
  private static instance: BundleMonitor;
  private metrics: BundleMetrics | null = null;
  
  static getInstance(): BundleMonitor {
    if (!BundleMonitor.instance) {
      BundleMonitor.instance = new BundleMonitor();
    }
    return BundleMonitor.instance;
  }
  
  // Monitor bundle size in development
  async monitorBundleSize(): Promise<BundleMetrics | null> {
    if (process.env.NODE_ENV !== 'development') return null;
    
    try {
      // Fetch build manifest
      const response = await fetch('/_next/static/chunks/webpack-stats.json');
      if (!response.ok) return null;
      
      const stats = await response.json();
      
      // Calculate metrics
      const chunks = Object.entries(stats.chunks || {}).map(([name, chunk]: [string, any]) => ({
        name,
        size: chunk.size || 0,
        isInitial: chunk.initial || false,
      }));
      
      const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);
      const firstLoadJS = chunks
        .filter(chunk => chunk.isInitial && chunk.name.endsWith('.js'))
        .reduce((sum, chunk) => sum + chunk.size, 0);
      
      this.metrics = {
        totalSize,
        gzippedSize: Math.round(totalSize * 0.3), // Approximate gzip ratio
        firstLoadJS,
        chunks,
      };
      
      return this.metrics;
    } catch (error) {
      console.error('Failed to monitor bundle size:', error);
      return null;
    }
  }
  
  // Check if bundle size exceeds thresholds
  checkThresholds(): {
    firstLoadJS: { value: number; threshold: number; exceeded: boolean };
    totalSize: { value: number; threshold: number; exceeded: boolean };
  } | null {
    if (!this.metrics) return null;
    
    const FIRST_LOAD_THRESHOLD = 200 * 1024; // 200KB
    const TOTAL_SIZE_THRESHOLD = 1024 * 1024; // 1MB
    
    return {
      firstLoadJS: {
        value: this.metrics.firstLoadJS,
        threshold: FIRST_LOAD_THRESHOLD,
        exceeded: this.metrics.firstLoadJS > FIRST_LOAD_THRESHOLD,
      },
      totalSize: {
        value: this.metrics.totalSize,
        threshold: TOTAL_SIZE_THRESHOLD,
        exceeded: this.metrics.totalSize > TOTAL_SIZE_THRESHOLD,
      },
    };
  }
  
  // Get recommendations for bundle optimization
  getOptimizationRecommendations(): string[] {
    const recommendations: string[] = [];
    const thresholds = this.checkThresholds();
    
    if (!thresholds) return recommendations;
    
    if (thresholds.firstLoadJS.exceeded) {
      recommendations.push(
        'First Load JS exceeds 200KB. Consider lazy loading non-critical components.',
        'Move heavy libraries to dynamic imports.',
        'Use Next.js dynamic imports for large components.'
      );
    }
    
    if (thresholds.totalSize.exceeded) {
      recommendations.push(
        'Total bundle size exceeds 1MB. Consider code splitting.',
        'Remove unused dependencies.',
        'Use tree shaking to eliminate dead code.'
      );
    }
    
    if (this.metrics) {
      const largeChunks = this.metrics.chunks.filter(chunk => chunk.size > 50 * 1024);
      if (largeChunks.length > 0) {
        recommendations.push(
          `${largeChunks.length} chunks are larger than 50KB: ${largeChunks.map(c => c.name).join(', ')}`
        );
      }
    }
    
    return recommendations;
  }
}

// Tree shaking helpers
export const treeShakingOptimizations = {
  // Import only specific lodash functions
  importLodashSpecific: {
    // Instead of: import _ from 'lodash'
    // Use: import { debounce, throttle } from 'lodash'
    good: () => import('lodash/debounce'),
    bad: () => import('lodash'),
  },
  
  // Import only specific date-fns functions
  importDateFnsSpecific: {
    // Instead of: import * as dateFns from 'date-fns'
    // Use: import { format, parseISO } from 'date-fns'
    good: () => import('date-fns/format'),
    bad: () => import('date-fns'),
  },
  
  // Use specific icon imports
  importIconsSpecific: {
    // Instead of: import * as Icons from '@heroicons/react/24/outline'
    // Use: import { ChevronRightIcon } from '@heroicons/react/24/outline'
    good: () => import('@heroicons/react/24/outline/ChevronRightIcon'),
    bad: () => import('@heroicons/react/24/outline'),
  },
};

// Performance optimization hooks
export function useLazyComponent<T>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) {
  const [Component, setComponent] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  
  React.useEffect(() => {
    let mounted = true;
    
    const loadComponent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const loadedModule = await importFn();

        if (mounted) {
          setComponent(loadedModule.default);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to load component'));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    loadComponent();
    
    return () => {
      mounted = false;
    };
  }, [importFn]);
  
  return { Component, loading, error };
}

// Bundle analysis in development
export function useBundleAnalysis() {
  const [metrics, setMetrics] = React.useState<BundleMetrics | null>(null);
  const [recommendations, setRecommendations] = React.useState<string[]>([]);
  
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const monitor = BundleMonitor.getInstance();
      
      monitor.monitorBundleSize().then((metrics) => {
        if (metrics) {
          setMetrics(metrics);
          setRecommendations(monitor.getOptimizationRecommendations());
        }
      });
    }
  }, []);
  
  return { metrics, recommendations };
}

// Preload critical resources
export const preloadResources = {
  // Preload critical CSS
  preloadCSS(href: string) {
    if (typeof document === 'undefined') return;
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = 'style';
    link.onload = () => {
      link.rel = 'stylesheet';
    };
    document.head.appendChild(link);
  },
  
  // Preload critical JavaScript
  preloadJS(href: string) {
    if (typeof document === 'undefined') return;
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = 'script';
    document.head.appendChild(link);
  },
  
  // Preload critical fonts
  preloadFont(href: string, type: string = 'font/woff2') {
    if (typeof document === 'undefined') return;
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = 'font';
    link.type = type;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  },
  
  // Preload critical images
  preloadImage(src: string) {
    if (typeof document === 'undefined') return;
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = src;
    link.as = 'image';
    document.head.appendChild(link);
  },
};

// Webpack bundle analyzer helper
export const bundleAnalyzer = {
  // Generate bundle report
  async generateReport(): Promise<string | null> {
    if (process.env.NODE_ENV !== 'development') return null;
    
    try {
      const response = await fetch('/api/bundle-analysis');
      if (!response.ok) return null;
      
      const report = await response.text();
      return report;
    } catch (error) {
      console.error('Failed to generate bundle report:', error);
      return null;
    }
  },
  
  // Open bundle analyzer in browser
  openAnalyzer() {
    if (process.env.NODE_ENV === 'development') {
      window.open('/bundle-analyzer', '_blank');
    }
  },
};

// Runtime performance monitoring
export class RuntimeMonitor {
  private observers: PerformanceObserver[] = [];
  
  startMonitoring() {
    if (typeof window === 'undefined' || !window.PerformanceObserver) return;
    
    // Monitor long tasks
    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.duration > 50) {
            console.warn(`Long task detected: ${entry.duration}ms`, entry);
            
            // Send to analytics
            if (window.gtag) {
              window.gtag('event', 'long_task', {
                event_category: 'Performance',
                value: Math.round(entry.duration),
              });
            }
          }
        });
      });
      
      longTaskObserver.observe({ entryTypes: ['longtask'] });
      this.observers.push(longTaskObserver);
    } catch (error) {
      console.error('Failed to start long task monitoring:', error);
    }
    
    // Monitor layout shifts
    try {
      const layoutShiftObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          if (entry.value > 0.1) {
            console.warn(`Large layout shift detected: ${entry.value}`, entry);
          }
        });
      });
      
      layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(layoutShiftObserver);
    } catch (error) {
      console.error('Failed to start layout shift monitoring:', error);
    }
  }
  
  stopMonitoring() {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
  }
}

// Initialize bundle optimizations
export function initBundleOptimizations() {
  if (typeof window === 'undefined') return;
  
  // Preload critical resources
  preloadResources.preloadFont('/fonts/inter-var.woff2');
  preloadResources.preloadCSS('/styles/critical.css');
  
  // Start runtime monitoring in development
  if (process.env.NODE_ENV === 'development') {
    const monitor = new RuntimeMonitor();
    monitor.startMonitoring();
    
    // Log bundle metrics
    BundleMonitor.getInstance().monitorBundleSize().then((metrics) => {
      if (metrics) {
        console.info('Bundle Metrics:', metrics);
        
        const recommendations = BundleMonitor.getInstance().getOptimizationRecommendations();
        if (recommendations.length > 0) {
          console.warn('Bundle Optimization Recommendations:', recommendations);
        }
      }
    });
  }
}