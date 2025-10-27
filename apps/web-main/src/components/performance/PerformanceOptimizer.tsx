'use client';

import { useEffect, useRef, useState } from 'react';
import { trackWebVitals, PerformanceMonitor, analyzeResourceTiming } from '@/lib/performance/web-vitals';

interface PerformanceOptimizerProps {
  children: React.ReactNode;
  enableMonitoring?: boolean;
  enableOptimizations?: boolean;
  debug?: boolean;
}

export default function PerformanceOptimizer({
  children,
  enableMonitoring = true,
  enableOptimizations = true,
  debug = false
}: PerformanceOptimizerProps) {
  const monitorRef = useRef<PerformanceMonitor | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    if (!enableMonitoring) return;

    // Initialize Web Vitals tracking
    trackWebVitals({ debug });

    // Initialize performance monitor
    monitorRef.current = new PerformanceMonitor({ debug });

    // Performance optimizations
    if (enableOptimizations) {
      initializeOptimizations();
    }

    return () => {
      if (monitorRef.current) {
        monitorRef.current.destroy();
      }
    };
  }, [enableMonitoring, enableOptimizations, debug]);

  const initializeOptimizations = () => {
    // Optimize images loading
    optimizeImageLoading();
    
    // Implement resource hints
    implementResourceHints();
    
    // Optimize font loading
    optimizeFontLoading();
    
    // Implement lazy loading for below-the-fold content
    implementLazyLoading();
    
    // Optimize third-party scripts
    optimizeThirdPartyScripts();
  };

  const optimizeImageLoading = () => {
    if (typeof window === 'undefined') return;

    // Implement responsive image loading
    const images = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const src = img.getAttribute('data-src');
            if (src) {
              img.src = src;
              img.removeAttribute('data-src');
              imageObserver.unobserve(img);
            }
          }
        });
      }, {
        rootMargin: '50px 0px' // Start loading 50px before entering viewport
      });

      images.forEach((img) => imageObserver.observe(img));
    }
  };

  const implementResourceHints = () => {
    if (typeof document === 'undefined') return;

    // Preconnect to external domains
    const externalDomains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://www.google-analytics.com',
      'https://www.googletagmanager.com'
    ];

    externalDomains.forEach((domain) => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });

    // DNS prefetch for likely next pages
    const prefetchPages = [
      '/services',
      '/case-studies',
      '/pricing',
      '/contact',
      '/enterprise'
    ];

    prefetchPages.forEach((page) => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = page;
      document.head.appendChild(link);
    });
  };

  const optimizeFontLoading = () => {
    if (typeof document === 'undefined') return;

    // Preload critical fonts
    const criticalFonts = [
      '/fonts/inter-var.woff2',
      '/fonts/inter-italic.woff2'
    ];

    criticalFonts.forEach((font) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = font;
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });

    // Font display optimization
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-family: 'Inter';
        font-display: swap;
        src: url('/fonts/inter-var.woff2') format('woff2-variations');
        font-weight: 100 900;
      }
    `;
    document.head.appendChild(style);
  };

  const implementLazyLoading = () => {
    if (typeof window === 'undefined') return;

    // Lazy load sections below the fold
    const lazyElements = document.querySelectorAll('[data-lazy]');
    
    if ('IntersectionObserver' in window) {
      const lazyObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement;
            const lazyContent = element.getAttribute('data-lazy');
            
            if (lazyContent) {
              // Trigger lazy loading
              element.style.opacity = '1';
              element.removeAttribute('data-lazy');
              lazyObserver.unobserve(element);
            }
          }
        });
      }, {
        rootMargin: '100px 0px'
      });

      lazyElements.forEach((element) => lazyObserver.observe(element));
    }
  };

  const optimizeThirdPartyScripts = () => {
    if (typeof window === 'undefined') return;

    // Delay non-critical third-party scripts
    const delayedScripts = [
      'hotjar',
      'clarity',
      'intercom'
    ];

    const delayTime = 3000; // 3 seconds after page load

    window.addEventListener('load', () => {
      setTimeout(() => {
        delayedScripts.forEach((scriptName) => {
          const event = new CustomEvent(`load-${scriptName}`);
          document.dispatchEvent(event);
        });
      }, delayTime);
    });
  };

  // Performance monitoring hook
  useEffect(() => {
    if (!isClient || !debug) return;

    const logPerformanceMetrics = () => {
      const resourceData = analyzeResourceTiming();
      console.group('Performance Metrics');
      console.info('Resource Summary:', resourceData.summary);
      console.info('Slowest Resources:', 
        resourceData.resources
          .sort((a, b) => b.duration - a.duration)
          .slice(0, 5)
      );
      console.groupEnd();
    };

    // Log metrics after page load
    window.addEventListener('load', () => {
      setTimeout(logPerformanceMetrics, 2000);
    });
  }, [isClient, debug]);

  return <>{children}</>;
}

// Service Worker registration for caching
export const registerServiceWorker = () => {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.info('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.info('SW registration failed: ', registrationError);
        });
    });
  }
};

// Critical CSS inlining utility
export const inlineCriticalCSS = (css: string) => {
  if (typeof document === 'undefined') return;

  const style = document.createElement('style');
  style.innerHTML = css;
  style.setAttribute('data-critical', 'true');
  
  // Insert at the beginning of head for highest priority
  const firstChild = document.head.firstChild;
  if (firstChild) {
    document.head.insertBefore(style, firstChild);
  } else {
    document.head.appendChild(style);
  }
};

// Bundle splitting utility
export const loadChunkOnDemand = async (chunkName: string) => {
  try {
    // Dynamic import for code splitting - using relative paths that exist
    switch (chunkName) {
      case 'analytics':
        const analytics = await import('@/lib/analytics/tracker');
        return analytics.default || analytics;
      case 'utils':
        const utils = await import('@/lib/utils');
        return utils.default || utils;
      default:
        console.warn(`Unknown chunk: ${chunkName}`);
        return null;
    }
  } catch (error) {
    console.warn(`Chunk not found: ${chunkName}`, error);
    return null;
  }
};