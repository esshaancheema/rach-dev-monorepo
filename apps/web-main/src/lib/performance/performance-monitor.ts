// Comprehensive Performance Monitoring System for Zoptal Platform
import { analytics } from '@/lib/analytics/tracker';

export interface PerformanceMetrics {
  // Core Web Vitals
  lcp: number | null; // Largest Contentful Paint
  fid: number | null; // First Input Delay
  cls: number | null; // Cumulative Layout Shift
  fcp: number | null; // First Contentful Paint
  ttfb: number | null; // Time to First Byte
  
  // Custom Metrics
  domContentLoaded: number | null;
  loadComplete: number | null;
  interactionReady: number | null;
  
  // Resource Metrics
  totalResources: number;
  totalSize: number;
  jsSize: number;
  cssSize: number;
  imageSize: number;
  fontSize: number;
  
  // Runtime Metrics
  memoryUsage: number | null;
  jsHeapSize: number | null;
  domNodes: number;
  
  // Network Metrics
  connectionType: string | null;
  effectiveType: string | null;
  downlink: number | null;
  rtt: number | null;
}

export interface PerformanceEntry {
  id: string;
  url: string;
  userAgent: string;
  timestamp: number;
  metrics: PerformanceMetrics;
  deviceInfo: DeviceInfo;
  navigationTiming: NavigationTiming;
  resourceTiming: ResourceTiming[];
}

export interface DeviceInfo {
  type: 'desktop' | 'mobile' | 'tablet';
  os: string;
  browser: string;
  version: string;
  viewport: { width: number; height: number };
  pixelRatio: number;
  touchSupport: boolean;
}

export interface NavigationTiming {
  navigationStart: number;
  unloadEventStart: number;
  unloadEventEnd: number;
  redirectStart: number;
  redirectEnd: number;
  fetchStart: number;
  domainLookupStart: number;
  domainLookupEnd: number;
  connectStart: number;
  connectEnd: number;
  secureConnectionStart: number;
  requestStart: number;
  responseStart: number;
  responseEnd: number;
  domLoading: number;
  domInteractive: number;
  domContentLoadedEventStart: number;
  domContentLoadedEventEnd: number;
  domComplete: number;
  loadEventStart: number;
  loadEventEnd: number;
}

export interface ResourceTiming {
  name: string;
  entryType: string;
  startTime: number;
  duration: number;
  initiatorType: string;
  transferSize: number;
  encodedBodySize: number;
  decodedBodySize: number;
  responseStart: number;
  responseEnd: number;
}

export interface PerformanceBudget {
  lcp: number;
  fid: number;
  cls: number;
  fcp: number;
  ttfb: number;
  totalSize: number;
  jsSize: number;
  cssSize: number;
  imageSize: number;
  domNodes: number;
}

export interface PerformanceAlert {
  id: string;
  type: 'budget_exceeded' | 'performance_degradation' | 'error_spike' | 'slow_resource';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  metric: string;
  currentValue: number;
  threshold: number;
  timestamp: number;
  url: string;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics = this.initializeMetrics();
  private observers: Map<string, PerformanceObserver> = new Map();
  private budget: PerformanceBudget = this.getDefaultBudget();
  private alerts: PerformanceAlert[] = [];
  private isMonitoring: boolean = false;
  private metricsHistory: PerformanceEntry[] = [];

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private constructor() {
    if (typeof window !== 'undefined') {
      this.initializeMonitoring();
    }
  }

  /**
   * Start performance monitoring
   */
  startMonitoring(): void {
    if (this.isMonitoring || typeof window === 'undefined') {
      return;
    }

    this.isMonitoring = true;

    // Monitor Core Web Vitals
    this.observeCoreWebVitals();
    
    // Monitor Navigation Timing
    this.observeNavigationTiming();
    
    // Monitor Resource Timing
    this.observeResourceTiming();
    
    // Monitor Long Tasks
    this.observeLongTasks();
    
    // Monitor Layout Shifts
    this.observeLayoutShifts();
    
    // Monitor Memory Usage
    this.observeMemoryUsage();
    
    // Monitor Network Information
    this.observeNetworkInformation();

    // Collect metrics periodically
    setInterval(() => {
      this.collectMetrics();
    }, 30000); // Every 30 seconds

    analytics.track({
      name: 'performance_monitoring_started',
      category: 'performance'
    });
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) {
      return;
    }

    this.observers.forEach((observer) => {
      observer.disconnect();
    });
    
    this.observers.clear();
    this.isMonitoring = false;

    analytics.track({
      name: 'performance_monitoring_stopped',
      category: 'performance'
    });
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    this.collectMetrics();
    return { ...this.metrics };
  }

  /**
   * Set performance budget
   */
  setBudget(budget: Partial<PerformanceBudget>): void {
    this.budget = { ...this.budget, ...budget };
    
    analytics.track({
      name: 'performance_budget_updated',
      category: 'performance',
      properties: budget
    });
  }

  /**
   * Get performance budget
   */
  getBudget(): PerformanceBudget {
    return { ...this.budget };
  }

  /**
   * Check if metrics meet budget requirements
   */
  checkBudget(): { 
    passed: boolean; 
    violations: Array<{ metric: string; current: number; budget: number; }> 
  } {
    const violations = [];
    
    // Check each budget constraint
    Object.entries(this.budget).forEach(([metric, threshold]) => {
      const currentValue = this.metrics[metric as keyof PerformanceMetrics] as number;
      
      if (currentValue !== null && currentValue > threshold) {
        violations.push({
          metric,
          current: currentValue,
          budget: threshold
        });
      }
    });

    return {
      passed: violations.length === 0,
      violations
    };
  }

  /**
   * Get performance alerts
   */
  getAlerts(): PerformanceAlert[] {
    return [...this.alerts];
  }

  /**
   * Clear performance alerts
   */
  clearAlerts(): void {
    this.alerts = [];
  }

  /**
   * Generate performance report
   */
  generateReport(): {
    summary: {
      score: number;
      grade: 'A' | 'B' | 'C' | 'D' | 'F';
      coreWebVitals: { lcp: string; fid: string; cls: string; };
    };
    metrics: PerformanceMetrics;
    budget: { passed: boolean; violations: any[] };
    recommendations: Array<{ type: string; message: string; priority: string; }>;
    deviceInfo: DeviceInfo;
  } {
    const budgetCheck = this.checkBudget();
    const recommendations = this.generateRecommendations();
    const score = this.calculatePerformanceScore();
    const grade = this.getPerformanceGrade(score);

    const report = {
      summary: {
        score,
        grade,
        coreWebVitals: {
          lcp: this.getMetricStatus('lcp', this.metrics.lcp),
          fid: this.getMetricStatus('fid', this.metrics.fid),
          cls: this.getMetricStatus('cls', this.metrics.cls)
        }
      },
      metrics: this.getMetrics(),
      budget: budgetCheck,
      recommendations,
      deviceInfo: this.getDeviceInfo()
    };

    analytics.track({
      name: 'performance_report_generated',
      category: 'performance',
      properties: {
        score,
        grade,
        violations_count: budgetCheck.violations.length,
        recommendations_count: recommendations.length
      }
    });

    return report;
  }

  /**
   * Measure custom performance mark
   */
  mark(name: string): void {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(name);
      
      analytics.track({
        name: 'performance_mark_created',
        category: 'performance',
        properties: { mark_name: name }
      });
    }
  }

  /**
   * Measure time between two marks
   */
  measure(name: string, startMark: string, endMark?: string): number | null {
    if (typeof performance !== 'undefined' && performance.measure) {
      try {
        const measureName = `${name}_measure`;
        performance.measure(measureName, startMark, endMark);
        
        const entries = performance.getEntriesByName(measureName, 'measure');
        const duration = entries.length > 0 ? entries[0].duration : null;

        analytics.track({
          name: 'performance_measure_created',
          category: 'performance',
          properties: {
            measure_name: name,
            duration,
            start_mark: startMark,
            end_mark: endMark
          }
        });

        return duration;
      } catch (error) {
        console.error('Failed to create performance measure:', error);
        return null;
      }
    }
    
    return null;
  }

  /**
   * Track page load performance
   */
  trackPageLoad(): void {
    if (typeof window === 'undefined') return;

    const entry: PerformanceEntry = {
      id: `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
      metrics: this.getMetrics(),
      deviceInfo: this.getDeviceInfo(),
      navigationTiming: this.getNavigationTiming(),
      resourceTiming: this.getResourceTiming()
    };

    this.metricsHistory.push(entry);

    // Keep only last 100 entries
    if (this.metricsHistory.length > 100) {
      this.metricsHistory = this.metricsHistory.slice(-100);
    }

    analytics.track({
      name: 'page_load_tracked',
      category: 'performance',
      properties: {
        url: entry.url,
        lcp: entry.metrics.lcp,
        fid: entry.metrics.fid,
        cls: entry.metrics.cls,
        ttfb: entry.metrics.ttfb,
        load_time: entry.metrics.loadComplete
      }
    });
  }

  /**
   * Get performance history
   */
  getHistory(): PerformanceEntry[] {
    return [...this.metricsHistory];
  }

  /**
   * Private methods
   */
  private initializeMonitoring(): void {
    // Wait for page load before starting monitoring
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => this.startMonitoring(), 100);
      });
    } else {
      setTimeout(() => this.startMonitoring(), 100);
    }
  }

  private initializeMetrics(): PerformanceMetrics {
    return {
      lcp: null,
      fid: null,
      cls: null,
      fcp: null,
      ttfb: null,
      domContentLoaded: null,
      loadComplete: null,
      interactionReady: null,
      totalResources: 0,
      totalSize: 0,
      jsSize: 0,
      cssSize: 0,
      imageSize: 0,
      fontSize: 0,
      memoryUsage: null,
      jsHeapSize: null,
      domNodes: 0,
      connectionType: null,
      effectiveType: null,
      downlink: null,
      rtt: null
    };
  }

  private getDefaultBudget(): PerformanceBudget {
    return {
      lcp: 2500, // 2.5 seconds
      fid: 100,  // 100 milliseconds
      cls: 0.1,  // 0.1
      fcp: 1800, // 1.8 seconds
      ttfb: 600, // 600 milliseconds
      totalSize: 3 * 1024 * 1024, // 3MB
      jsSize: 1 * 1024 * 1024,    // 1MB
      cssSize: 100 * 1024,        // 100KB
      imageSize: 2 * 1024 * 1024, // 2MB
      domNodes: 1500 // 1500 nodes
    };
  }

  private observeCoreWebVitals(): void {
    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.metrics.lcp = lastEntry.startTime;
          
          this.checkBudgetViolation('lcp', this.metrics.lcp);
        });
        
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
        this.observers.set('lcp', lcpObserver);
      } catch (error) {
        console.warn('LCP observer not supported:', error);
      }

      // First Input Delay
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            this.metrics.fid = entry.processingStart - entry.startTime;
            
            this.checkBudgetViolation('fid', this.metrics.fid);
          });
        });
        
        fidObserver.observe({ type: 'first-input', buffered: true });
        this.observers.set('fid', fidObserver);
      } catch (error) {
        console.warn('FID observer not supported:', error);
      }
    }

    // First Contentful Paint
    if (typeof performance !== 'undefined' && performance.getEntriesByType) {
      const paintEntries = performance.getEntriesByType('paint');
      const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        this.metrics.fcp = fcpEntry.startTime;
      }
    }
  }

  private observeNavigationTiming(): void {
    if (typeof performance !== 'undefined' && performance.timing) {
      const timing = performance.timing;
      
      this.metrics.ttfb = timing.responseStart - timing.navigationStart;
      this.metrics.domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
      this.metrics.loadComplete = timing.loadEventEnd - timing.navigationStart;
      
      this.checkBudgetViolation('ttfb', this.metrics.ttfb);
    }
  }

  private observeResourceTiming(): void {
    if (typeof performance !== 'undefined' && performance.getEntriesByType) {
      const resources = performance.getEntriesByType('resource');
      
      let totalSize = 0;
      let jsSize = 0;
      let cssSize = 0;
      let imageSize = 0;
      let fontSize = 0;

      resources.forEach((resource: any) => {
        const size = resource.transferSize || resource.encodedBodySize || 0;
        totalSize += size;

        // Categorize by type
        if (resource.name.includes('.js') || resource.initiatorType === 'script') {
          jsSize += size;
        } else if (resource.name.includes('.css') || resource.initiatorType === 'css') {
          cssSize += size;
        } else if (resource.initiatorType === 'img') {
          imageSize += size;
        } else if (resource.name.includes('.woff') || resource.name.includes('.ttf')) {
          fontSize += size;
        }
      });

      this.metrics.totalResources = resources.length;
      this.metrics.totalSize = totalSize;
      this.metrics.jsSize = jsSize;
      this.metrics.cssSize = cssSize;
      this.metrics.imageSize = imageSize;
      this.metrics.fontSize = fontSize;

      this.checkBudgetViolation('totalSize', totalSize);
      this.checkBudgetViolation('jsSize', jsSize);
      this.checkBudgetViolation('cssSize', cssSize);
      this.checkBudgetViolation('imageSize', imageSize);
    }
  }

  private observeLongTasks(): void {
    if ('PerformanceObserver' in window) {
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.duration > 50) { // Tasks longer than 50ms
              this.createAlert({
                type: 'performance_degradation',
                severity: 'medium',
                message: `Long task detected: ${entry.duration.toFixed(2)}ms`,
                metric: 'task_duration',
                currentValue: entry.duration,
                threshold: 50,
                url: window.location.href
              });
            }
          });
        });
        
        longTaskObserver.observe({ type: 'longtask', buffered: true });
        this.observers.set('longtask', longTaskObserver);
      } catch (error) {
        console.warn('Long task observer not supported:', error);
      }
    }
  }

  private observeLayoutShifts(): void {
    if ('PerformanceObserver' in window) {
      try {
        let clsValue = 0;
        let sessionValue = 0;
        let sessionEntries: any[] = [];

        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              const firstSessionEntry = sessionEntries[0];
              const lastSessionEntry = sessionEntries[sessionEntries.length - 1];

              if (sessionValue && 
                  entry.startTime - lastSessionEntry.startTime < 1000 &&
                  entry.startTime - firstSessionEntry.startTime < 5000) {
                sessionValue += entry.value;
                sessionEntries.push(entry);
              } else {
                sessionValue = entry.value;
                sessionEntries = [entry];
              }

              if (sessionValue > clsValue) {
                clsValue = sessionValue;
                this.metrics.cls = clsValue;
                
                this.checkBudgetViolation('cls', clsValue);
              }
            }
          });
        });
        
        clsObserver.observe({ type: 'layout-shift', buffered: true });
        this.observers.set('cls', clsObserver);
      } catch (error) {
        console.warn('Layout shift observer not supported:', error);
      }
    }
  }

  private observeMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = memory.usedJSHeapSize;
      this.metrics.jsHeapSize = memory.totalJSHeapSize;
    }
  }

  private observeNetworkInformation(): void {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      this.metrics.connectionType = connection.type || null;
      this.metrics.effectiveType = connection.effectiveType || null;
      this.metrics.downlink = connection.downlink || null;
      this.metrics.rtt = connection.rtt || null;
    }
  }

  private collectMetrics(): void {
    // Update DOM nodes count
    this.metrics.domNodes = document.querySelectorAll('*').length;
    
    this.checkBudgetViolation('domNodes', this.metrics.domNodes);

    // Update memory usage
    this.observeMemoryUsage();

    // Update network information
    this.observeNetworkInformation();
  }

  private checkBudgetViolation(metric: string, value: number): void {
    const threshold = this.budget[metric as keyof PerformanceBudget];
    
    if (threshold && value > threshold) {
      this.createAlert({
        type: 'budget_exceeded',
        severity: this.getSeverityForViolation(metric, value, threshold),
        message: `Performance budget exceeded for ${metric}: ${value} > ${threshold}`,
        metric,
        currentValue: value,
        threshold,
        url: window.location.href
      });
    }
  }

  private createAlert(alertData: Omit<PerformanceAlert, 'id' | 'timestamp'>): void {
    const alert: PerformanceAlert = {
      ...alertData,
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    };

    this.alerts.push(alert);

    // Keep only last 50 alerts
    if (this.alerts.length > 50) {
      this.alerts = this.alerts.slice(-50);
    }

    analytics.track({
      name: 'performance_alert_created',
      category: 'performance',
      properties: {
        alert_type: alert.type,
        severity: alert.severity,
        metric: alert.metric,
        current_value: alert.currentValue,
        threshold: alert.threshold
      }
    });
  }

  private getSeverityForViolation(metric: string, current: number, threshold: number): 'low' | 'medium' | 'high' | 'critical' {
    const ratio = current / threshold;
    
    if (ratio > 3) return 'critical';
    if (ratio > 2) return 'high';
    if (ratio > 1.5) return 'medium';
    return 'low';
  }

  private calculatePerformanceScore(): number {
    let score = 100;
    
    // Core Web Vitals scoring
    if (this.metrics.lcp !== null) {
      if (this.metrics.lcp > 4000) score -= 30;
      else if (this.metrics.lcp > 2500) score -= 15;
    }
    
    if (this.metrics.fid !== null) {
      if (this.metrics.fid > 300) score -= 20;
      else if (this.metrics.fid > 100) score -= 10;
    }
    
    if (this.metrics.cls !== null) {
      if (this.metrics.cls > 0.25) score -= 20;
      else if (this.metrics.cls > 0.1) score -= 10;
    }
    
    if (this.metrics.fcp !== null) {
      if (this.metrics.fcp > 3000) score -= 15;
      else if (this.metrics.fcp > 1800) score -= 8;
    }
    
    if (this.metrics.ttfb !== null) {
      if (this.metrics.ttfb > 1200) score -= 15;
      else if (this.metrics.ttfb > 600) score -= 8;
    }

    return Math.max(0, Math.min(100, score));
  }

  private getPerformanceGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  private getMetricStatus(metric: string, value: number | null): string {
    if (value === null) return 'not-available';
    
    const thresholds = {
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 }
    };
    
    const threshold = thresholds[metric as keyof typeof thresholds];
    if (!threshold) return 'unknown';
    
    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  private generateRecommendations(): Array<{ type: string; message: string; priority: string; }> {
    const recommendations = [];
    
    if (this.metrics.lcp && this.metrics.lcp > 2500) {
      recommendations.push({
        type: 'lcp',
        message: 'Optimize Largest Contentful Paint by optimizing images, preloading critical resources, and improving server response times',
        priority: 'high'
      });
    }
    
    if (this.metrics.fid && this.metrics.fid > 100) {
      recommendations.push({
        type: 'fid',
        message: 'Improve First Input Delay by reducing JavaScript execution time and breaking up long tasks',
        priority: 'high'
      });
    }
    
    if (this.metrics.cls && this.metrics.cls > 0.1) {
      recommendations.push({
        type: 'cls',
        message: 'Reduce Cumulative Layout Shift by setting dimensions for images and ads, and avoiding inserting content above existing content',
        priority: 'medium'
      });
    }
    
    if (this.metrics.totalSize > this.budget.totalSize) {
      recommendations.push({
        type: 'size',
        message: 'Reduce total resource size by compressing images, minifying CSS/JS, and using modern formats',
        priority: 'medium'
      });
    }
    
    if (this.metrics.domNodes > this.budget.domNodes) {
      recommendations.push({
        type: 'dom',
        message: 'Reduce DOM complexity by simplifying HTML structure and removing unnecessary elements',
        priority: 'low'
      });
    }
    
    return recommendations;
  }

  private getDeviceInfo(): DeviceInfo {
    if (typeof window === 'undefined') {
      return {
        type: 'desktop',
        os: 'unknown',
        browser: 'unknown',
        version: 'unknown',
        viewport: { width: 0, height: 0 },
        pixelRatio: 1,
        touchSupport: false
      };
    }

    const userAgent = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isTablet = /iPad|Android(?!.*Mobile)/i.test(userAgent);

    return {
      type: isTablet ? 'tablet' : (isMobile ? 'mobile' : 'desktop'),
      os: this.getOSName(userAgent),
      browser: this.getBrowserName(userAgent),
      version: this.getBrowserVersion(userAgent),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      pixelRatio: window.devicePixelRatio || 1,
      touchSupport: 'ontouchstart' in window
    };
  }

  private getOSName(userAgent: string): string {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac OS')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  private getBrowserName(userAgent: string): string {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  private getBrowserVersion(userAgent: string): string {
    const match = userAgent.match(/(Chrome|Firefox|Safari|Edge)\/(\d+)/);
    return match ? match[2] : 'Unknown';
  }

  private getNavigationTiming(): NavigationTiming {
    if (typeof performance === 'undefined' || !performance.timing) {
      return {} as NavigationTiming;
    }

    const timing = performance.timing;
    return {
      navigationStart: timing.navigationStart,
      unloadEventStart: timing.unloadEventStart,
      unloadEventEnd: timing.unloadEventEnd,
      redirectStart: timing.redirectStart,
      redirectEnd: timing.redirectEnd,
      fetchStart: timing.fetchStart,
      domainLookupStart: timing.domainLookupStart,
      domainLookupEnd: timing.domainLookupEnd,
      connectStart: timing.connectStart,
      connectEnd: timing.connectEnd,
      secureConnectionStart: timing.secureConnectionStart,
      requestStart: timing.requestStart,
      responseStart: timing.responseStart,
      responseEnd: timing.responseEnd,
      domLoading: timing.domLoading,
      domInteractive: timing.domInteractive,
      domContentLoadedEventStart: timing.domContentLoadedEventStart,
      domContentLoadedEventEnd: timing.domContentLoadedEventEnd,
      domComplete: timing.domComplete,
      loadEventStart: timing.loadEventStart,
      loadEventEnd: timing.loadEventEnd
    };
  }

  private getResourceTiming(): ResourceTiming[] {
    if (typeof performance === 'undefined' || !performance.getEntriesByType) {
      return [];
    }

    const resources = performance.getEntriesByType('resource');
    return resources.map((resource: any) => ({
      name: resource.name,
      entryType: resource.entryType,
      startTime: resource.startTime,
      duration: resource.duration,
      initiatorType: resource.initiatorType,
      transferSize: resource.transferSize || 0,
      encodedBodySize: resource.encodedBodySize || 0,
      decodedBodySize: resource.decodedBodySize || 0,
      responseStart: resource.responseStart,
      responseEnd: resource.responseEnd
    }));
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// React hook for performance monitoring
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);

  useEffect(() => {
    const updateMetrics = () => {
      setMetrics(performanceMonitor.getMetrics());
      setAlerts(performanceMonitor.getAlerts());
    };

    // Update metrics periodically
    const interval = setInterval(updateMetrics, 5000);
    
    // Initial update
    updateMetrics();

    return () => clearInterval(interval);
  }, []);

  const generateReport = () => {
    return performanceMonitor.generateReport();
  };

  const mark = (name: string) => {
    performanceMonitor.mark(name);
  };

  const measure = (name: string, startMark: string, endMark?: string) => {
    return performanceMonitor.measure(name, startMark, endMark);
  };

  return {
    metrics,
    alerts,
    generateReport,
    mark,
    measure,
    trackPageLoad: performanceMonitor.trackPageLoad.bind(performanceMonitor)
  };
}