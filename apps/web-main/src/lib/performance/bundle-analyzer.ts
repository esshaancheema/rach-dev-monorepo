// Bundle analysis and optimization utilities
export interface BundleStats {
  totalSize: number;
  gzippedSize: number;
  chunks: Array<{
    name: string;
    size: number;
    modules: string[];
  }>;
  duplicates: Array<{
    module: string;
    occurrences: number;
    totalSize: number;
  }>;
  recommendations: string[];
}

// Dynamic import tracker for code splitting analysis
export class DynamicImportTracker {
  private imports: Map<string, { count: number; size: number; loadTime: number }> = new Map();

  trackImport(moduleName: string, size: number = 0) {
    const startTime = performance.now();
    
    return {
      onLoad: () => {
        const loadTime = performance.now() - startTime;
        const existing = this.imports.get(moduleName) || { count: 0, size: 0, loadTime: 0 };
        
        this.imports.set(moduleName, {
          count: existing.count + 1,
          size: size || existing.size,
          loadTime: (existing.loadTime + loadTime) / (existing.count + 1), // Average load time
        });
      }
    };
  }

  getStats() {
    return Object.fromEntries(this.imports);
  }

  getRecommendations(): string[] {
    const recommendations: string[] = [];
    const stats = this.getStats();

    // Find frequently loaded modules that should be in main bundle
    Object.entries(stats).forEach(([module, data]) => {
      if (data.count > 5 && data.size < 50000) { // Small modules loaded frequently
        recommendations.push(`Consider including "${module}" in main bundle (loaded ${data.count} times, ${data.size} bytes)`);
      }
      
      if (data.loadTime > 1000) { // Slow loading modules
        recommendations.push(`Module "${module}" has slow load times (${data.loadTime}ms average)`);
      }
    });

    return recommendations;
  }
}

// Tree shaking analyzer for unused code detection
export function analyzeTreeShaking(): {
  unusedExports: string[];
  recommendations: string[];
} {
  // This would need build-time analysis, but we can provide runtime detection
  const unusedExports: string[] = [];
  const recommendations: string[] = [];

  // Analyze global object for unused polyfills
  if (typeof window !== 'undefined') {
    const globalKeys = Object.keys(window);
    const commonPolyfills = ['IntersectionObserver', 'ResizeObserver', 'fetch'];
    
    commonPolyfills.forEach(polyfill => {
      if (globalKeys.includes(polyfill)) {
        // Check if it's a polyfill (has specific properties)
        const obj = (window as any)[polyfill];
        if (obj && obj.toString().includes('polyfill')) {
          recommendations.push(`Native ${polyfill} available, consider removing polyfill`);
        }
      }
    });
  }

  return { unusedExports, recommendations };
}

// Critical path CSS analyzer
export class CriticalPathAnalyzer {
  private criticalSelectors: Set<string> = new Set();
  private allSelectors: Set<string> = new Set();

  analyzeCriticalCSS(): {
    criticalRatio: number;
    unusedSelectors: string[];
    recommendations: string[];
  } {
    if (typeof document === 'undefined') {
      return { criticalRatio: 0, unusedSelectors: [], recommendations: [] };
    }

    // Get all stylesheets
    const styleSheets = Array.from(document.styleSheets);
    const unusedSelectors: string[] = [];
    const recommendations: string[] = [];

    styleSheets.forEach(sheet => {
      try {
        const rules = Array.from(sheet.cssRules || []);
        
        rules.forEach(rule => {
          if (rule instanceof CSSStyleRule) {
            this.allSelectors.add(rule.selectorText);
            
            // Check if selector matches any element in viewport
            try {
              const elements = document.querySelectorAll(rule.selectorText);
              if (elements.length > 0) {
                // Check if any element is in viewport
                const inViewport = Array.from(elements).some(el => {
                  const rect = el.getBoundingClientRect();
                  return rect.top < window.innerHeight && rect.bottom > 0;
                });
                
                if (inViewport) {
                  this.criticalSelectors.add(rule.selectorText);
                } else {
                  unusedSelectors.push(rule.selectorText);
                }
              } else {
                unusedSelectors.push(rule.selectorText);
              }
            } catch (e) {
              // Invalid selector
              unusedSelectors.push(rule.selectorText);
            }
          }
        });
      } catch (e) {
        // CORS or other security restrictions
        console.warn('Cannot analyze stylesheet:', e);
      }
    });

    const criticalRatio = this.criticalSelectors.size / this.allSelectors.size;

    // Generate recommendations
    if (criticalRatio < 0.3) {
      recommendations.push('Low critical CSS ratio. Consider extracting critical styles.');
    }
    
    if (unusedSelectors.length > 50) {
      recommendations.push(`Found ${unusedSelectors.length} unused selectors. Consider purging unused CSS.`);
    }

    return {
      criticalRatio,
      unusedSelectors: unusedSelectors.slice(0, 20), // Limit output
      recommendations,
    };
  }

  getCriticalCSS(): string {
    if (typeof document === 'undefined') return '';

    const criticalRules: string[] = [];

    Array.from(document.styleSheets).forEach(sheet => {
      try {
        const rules = Array.from(sheet.cssRules || []);
        
        rules.forEach(rule => {
          if (rule instanceof CSSStyleRule && this.criticalSelectors.has(rule.selectorText)) {
            criticalRules.push(rule.cssText);
          }
        });
      } catch (e) {
        // Security restrictions
      }
    });

    return criticalRules.join('\n');
  }
}

// Performance budget checker
export interface PerformanceBudget {
  maxBundleSize: number; // bytes
  maxChunkSize: number; // bytes
  maxLCP: number; // ms
  maxFID: number; // ms
  maxCLS: number; // score
  maxTTFB: number; // ms
}

export class BudgetChecker {
  constructor(private budget: PerformanceBudget) {}

  checkBudget(stats: {
    bundleSize?: number;
    largestChunk?: number;
    lcp?: number;
    fid?: number;
    cls?: number;
    ttfb?: number;
  }): {
    violations: Array<{
      metric: keyof PerformanceBudget;
      actual: number;
      budget: number;
      severity: 'warning' | 'error';
    }>;
    passed: boolean;
  } {
    const violations: any[] = [];

    // Check bundle size
    if (stats.bundleSize && stats.bundleSize > this.budget.maxBundleSize) {
      violations.push({
        metric: 'maxBundleSize',
        actual: stats.bundleSize,
        budget: this.budget.maxBundleSize,
        severity: stats.bundleSize > this.budget.maxBundleSize * 1.5 ? 'error' : 'warning',
      });
    }

    // Check chunk size
    if (stats.largestChunk && stats.largestChunk > this.budget.maxChunkSize) {
      violations.push({
        metric: 'maxChunkSize',
        actual: stats.largestChunk,
        budget: this.budget.maxChunkSize,
        severity: stats.largestChunk > this.budget.maxChunkSize * 1.5 ? 'error' : 'warning',
      });
    }

    // Check Core Web Vitals
    if (stats.lcp && stats.lcp > this.budget.maxLCP) {
      violations.push({
        metric: 'maxLCP',
        actual: stats.lcp,
        budget: this.budget.maxLCP,
        severity: stats.lcp > this.budget.maxLCP * 1.5 ? 'error' : 'warning',
      });
    }

    if (stats.fid && stats.fid > this.budget.maxFID) {
      violations.push({
        metric: 'maxFID',
        actual: stats.fid,
        budget: this.budget.maxFID,
        severity: stats.fid > this.budget.maxFID * 1.5 ? 'error' : 'warning',
      });
    }

    if (stats.cls && stats.cls > this.budget.maxCLS) {
      violations.push({
        metric: 'maxCLS',
        actual: stats.cls,
        budget: this.budget.maxCLS,
        severity: stats.cls > this.budget.maxCLS * 1.5 ? 'error' : 'warning',
      });
    }

    if (stats.ttfb && stats.ttfb > this.budget.maxTTFB) {
      violations.push({
        metric: 'maxTTFB',
        actual: stats.ttfb,
        budget: this.budget.maxTTFB,
        severity: stats.ttfb > this.budget.maxTTFB * 1.5 ? 'error' : 'warning',
      });
    }

    return {
      violations,
      passed: violations.length === 0,
    };
  }
}

// Default performance budget for Zoptal
export const ZOPTAL_PERFORMANCE_BUDGET: PerformanceBudget = {
  maxBundleSize: 500 * 1024, // 500KB
  maxChunkSize: 250 * 1024,  // 250KB
  maxLCP: 2500,              // 2.5s (Good)
  maxFID: 100,               // 100ms (Good)
  maxCLS: 0.1,               // 0.1 (Good)
  maxTTFB: 800,              // 800ms (Good)
};

// Bundle optimization recommendations
export function generateOptimizationRecommendations(stats: BundleStats): string[] {
  const recommendations: string[] = [];

  // Large bundle size
  if (stats.totalSize > 500 * 1024) {
    recommendations.push('Bundle size exceeds 500KB. Consider code splitting and lazy loading.');
  }

  // Large chunks
  const largeChunks = stats.chunks.filter(chunk => chunk.size > 250 * 1024);
  if (largeChunks.length > 0) {
    recommendations.push(`Found ${largeChunks.length} large chunks. Consider splitting: ${largeChunks.map(c => c.name).join(', ')}`);
  }

  // Duplicate modules
  const largeDuplicates = stats.duplicates.filter(dup => dup.totalSize > 50 * 1024);
  if (largeDuplicates.length > 0) {
    recommendations.push(`Found duplicate modules: ${largeDuplicates.map(d => d.module).join(', ')}`);
  }

  // Compression ratio
  const compressionRatio = stats.gzippedSize / stats.totalSize;
  if (compressionRatio > 0.7) {
    recommendations.push('Poor compression ratio. Enable better compression or optimize bundle content.');
  }

  return recommendations;
}