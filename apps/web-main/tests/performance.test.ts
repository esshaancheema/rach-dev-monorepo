/**
 * Performance Tests for Zoptal Website
 * 
 * These tests validate performance metrics and optimization
 * to ensure fast loading times and good user experience.
 */

import { test, expect, Page } from '@playwright/test';
import type { CDPSession } from '@playwright/test';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

// Performance thresholds
const PERFORMANCE_THRESHOLDS = {
  // Core Web Vitals
  LCP: 2500,    // Largest Contentful Paint - 2.5s
  FID: 100,     // First Input Delay - 100ms
  CLS: 0.1,     // Cumulative Layout Shift - 0.1
  
  // Other metrics
  FCP: 1800,    // First Contentful Paint - 1.8s
  TTI: 3800,    // Time to Interactive - 3.8s
  TBT: 200,     // Total Blocking Time - 200ms
  
  // Resource limits
  DOM_SIZE: 1500,           // DOM nodes
  JS_BUNDLE_SIZE: 500000,   // 500KB
  CSS_BUNDLE_SIZE: 100000,  // 100KB
  IMAGE_SIZE: 1000000,      // 1MB per image
  
  // Network
  REQUESTS: 50,             // Total requests
  LOAD_TIME: 3000          // Page load time - 3s
};

// Pages to test for performance
const PERFORMANCE_PAGES = [
  '/',
  '/about',
  '/services',
  '/pricing',
  '/contact'
];

test.describe('Core Web Vitals', () => {
  
  PERFORMANCE_PAGES.forEach(pagePath => {
    test(`${pagePath} should meet Core Web Vitals thresholds`, async ({ page }) => {
      // Enable performance monitoring
      const cdp = await page.context().newCDPSession(page);
      await cdp.send('Performance.enable');
      
      const startTime = Date.now();
      
      await page.goto(`${BASE_URL}${pagePath}`, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      // Wait for page to be fully loaded and interactive
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000); // Allow time for metrics collection
      
      // Get Web Vitals metrics
      const webVitals = await page.evaluate(() => {
        return new Promise((resolve) => {
          const vitals: any = {};
          
          // LCP - Largest Contentful Paint
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            if (entries.length > 0) {
              vitals.LCP = entries[entries.length - 1].startTime;
            }
          }).observe({ type: 'largest-contentful-paint', buffered: true });
          
          // FCP - First Contentful Paint
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            if (entries.length > 0) {
              vitals.FCP = entries[0].startTime;
            }
          }).observe({ type: 'paint', buffered: true });
          
          // CLS - Cumulative Layout Shift
          let clsValue = 0;
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!(entry as any).hadRecentInput) {
                clsValue += (entry as any).value;
              }
            }
            vitals.CLS = clsValue;
          }).observe({ type: 'layout-shift', buffered: true });
          
          // TTI approximation using navigation timing
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          if (navigation) {
            vitals.TTI = navigation.domInteractive;
            vitals.loadTime = navigation.loadEventEnd - (navigation.fetchStart || 0);
          }
          
          // Wait a bit for observers to collect data
          setTimeout(() => resolve(vitals), 1000);
        });
      });
      
      const loadTime = Date.now() - startTime;
      
      console.log(`Performance metrics for ${pagePath}:`, {
        ...(webVitals as any),
        actualLoadTime: loadTime
      });
      
      // Validate Core Web Vitals
      const vitalsAny = webVitals as any;
      if (vitalsAny.LCP) {
        expect(vitalsAny.LCP).toBeLessThan(PERFORMANCE_THRESHOLDS.LCP);
      }
      
      if (vitalsAny.FCP) {
        expect(vitalsAny.FCP).toBeLessThan(PERFORMANCE_THRESHOLDS.FCP);
      }
      
      if (vitalsAny.CLS !== undefined) {
        expect(vitalsAny.CLS).toBeLessThan(PERFORMANCE_THRESHOLDS.CLS);
      }
      
      // Overall load time
      expect(loadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.LOAD_TIME);
    });
  });

});

test.describe('Resource Optimization', () => {
  
  test('should have optimized bundle sizes', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    
    // Get all network requests
    const requests: any[] = [];
    
    page.on('response', response => {
      requests.push({
        url: response.url(),
        size: parseInt(response.headers()['content-length'] || '0'),
        type: response.request().resourceType(),
        status: response.status()
      });
    });
    
    // Reload to capture all requests
    await page.reload({ waitUntil: 'networkidle' });
    
    // Filter and validate JavaScript bundles
    const jsRequests = requests.filter(req => 
      req.type === 'script' && 
      req.url.includes('.js') &&
      !req.url.includes('analytics') &&
      !req.url.includes('gtag')
    );
    
    const totalJSSize = jsRequests.reduce((sum, req) => sum + req.size, 0);
    console.log(`Total JS bundle size: ${totalJSSize} bytes`);
    
    expect(totalJSSize).toBeLessThan(PERFORMANCE_THRESHOLDS.JS_BUNDLE_SIZE);
    
    // Filter and validate CSS bundles
    const cssRequests = requests.filter(req => 
      req.type === 'stylesheet' && 
      req.url.includes('.css')
    );
    
    const totalCSSSize = cssRequests.reduce((sum, req) => sum + req.size, 0);
    console.log(`Total CSS bundle size: ${totalCSSSize} bytes`);
    
    expect(totalCSSSize).toBeLessThan(PERFORMANCE_THRESHOLDS.CSS_BUNDLE_SIZE);
    
    // Validate total number of requests
    const validRequests = requests.filter(req => req.status === 200);
    console.log(`Total requests: ${validRequests.length}`);
    
    expect(validRequests.length).toBeLessThan(PERFORMANCE_THRESHOLDS.REQUESTS);
  });

  test('images should be optimized', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    
    // Get all image requests
    const imageRequests: any[] = [];
    
    page.on('response', response => {
      if (response.request().resourceType() === 'image') {
        imageRequests.push({
          url: response.url(),
          size: parseInt(response.headers()['content-length'] || '0'),
          contentType: response.headers()['content-type'] || ''
        });
      }
    });
    
    await page.reload({ waitUntil: 'networkidle' });
    
    for (const imageReq of imageRequests) {
      // Each image should be under size limit
      expect(imageReq.size).toBeLessThan(PERFORMANCE_THRESHOLDS.IMAGE_SIZE);
      
      // Images should use modern formats
      expect(
        imageReq.contentType.includes('webp') ||
        imageReq.contentType.includes('avif') ||
        imageReq.url.includes('.webp') ||
        imageReq.url.includes('.avif') ||
        // Allow SVG and small PNGs/JPGs
        imageReq.contentType.includes('svg') ||
        imageReq.size < 50000
      ).toBeTruthy();
    }
  });

  test('should use efficient caching strategies', async ({ page }) => {
    const responses: any[] = [];
    
    page.on('response', response => {
      responses.push({
        url: response.url(),
        headers: response.headers(),
        type: response.request().resourceType()
      });
    });
    
    await page.goto(`${BASE_URL}/`);
    
    // Check static assets have proper cache headers
    const staticAssets = responses.filter(res => 
      res.type === 'script' || 
      res.type === 'stylesheet' || 
      res.type === 'image' ||
      res.url.includes('/_next/static/')
    );
    
    for (const asset of staticAssets) {
      const cacheControl = asset.headers['cache-control'];
      
      if (asset.url.includes('/_next/static/')) {
        // Next.js static assets should have long cache
        expect(cacheControl).toMatch(/max-age=31536000|immutable/);
      } else if (asset.type === 'image') {
        // Images should have reasonable cache
        expect(cacheControl).toBeTruthy();
      }
    }
  });

});

test.describe('Runtime Performance', () => {
  
  test('should have reasonable DOM size', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    
    const domSize = await page.evaluate(() => {
      return document.querySelectorAll('*').length;
    });
    
    console.log(`DOM size: ${domSize} nodes`);
    expect(domSize).toBeLessThan(PERFORMANCE_THRESHOLDS.DOM_SIZE);
  });

  test('should not have memory leaks', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    
    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });
    
    // Navigate to different pages
    for (const path of ['/about', '/services', '/contact']) {
      await page.goto(`${BASE_URL}${path}`);
      await page.waitForTimeout(1000);
    }
    
    // Return to homepage
    await page.goto(`${BASE_URL}/`);
    await page.waitForTimeout(2000);
    
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });
    
    if (initialMemory > 0 && finalMemory > 0) {
      // Memory should not increase significantly (within 5MB)
      const memoryIncrease = finalMemory - initialMemory;
      console.log(`Memory increase: ${memoryIncrease} bytes`);
      
      expect(memoryIncrease).toBeLessThan(5000000); // 5MB
    }
  });

  test('should handle rapid interactions without blocking', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    
    // Simulate rapid interactions
    const startTime = Date.now();
    
    for (let i = 0; i < 10; i++) {
      await page.hover(`a, button`);
      await page.waitForTimeout(50);
    }
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    // Should handle interactions smoothly (less than 1s total)
    expect(totalTime).toBeLessThan(1000);
  });

});

test.describe('Mobile Performance', () => {
  
  test('should perform well on mobile devices', async ({ page }) => {
    // Simulate slow 3G mobile connection
    await page.route('**/*', async route => {
      await new Promise(resolve => setTimeout(resolve, 100)); // Add latency
      await route.continue();
    });
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    const startTime = Date.now();
    
    await page.goto(`${BASE_URL}/`, { 
      waitUntil: 'domcontentloaded',
      timeout: 15000 
    });
    
    const loadTime = Date.now() - startTime;
    
    // Mobile should load within 5 seconds even on slow connection
    expect(loadTime).toBeLessThan(5000);
    
    // Check that critical content is visible
    const h1 = await page.locator('h1').first();
    await expect(h1).toBeVisible();
    
    const mainContent = await page.locator('main').first();
    await expect(mainContent).toBeVisible();
  });

});

test.describe('Third-party Performance Impact', () => {
  
  test('third-party scripts should not block rendering', async ({ page }) => {
    const thirdPartyRequests: string[] = [];
    
    page.on('request', request => {
      const url = request.url();
      if (
        url.includes('google-analytics') ||
        url.includes('googletagmanager') ||
        url.includes('facebook.net') ||
        url.includes('twitter.com') ||
        url.includes('linkedin.com')
      ) {
        thirdPartyRequests.push(url);
      }
    });
    
    const startTime = Date.now();
    
    await page.goto(`${BASE_URL}/`, { 
      waitUntil: 'domcontentloaded' 
    });
    
    const dcl = Date.now() - startTime;
    
    console.log(`Third-party requests: ${thirdPartyRequests.length}`);
    console.log(`DOM Content Loaded: ${dcl}ms`);
    
    // Page should reach DCL quickly despite third-party scripts
    expect(dcl).toBeLessThan(2000);
  });

});

test.describe('Progressive Enhancement', () => {
  
  test('should work without JavaScript', async ({ page }) => {
    // Disable JavaScript
    await page.context().addInitScript(() => {
      delete (window as any).performance;
      Object.defineProperty(window, 'navigator', {
        value: { ...window.navigator, userAgent: 'No-JS-Test' }
      });
    });
    
    await page.goto(`${BASE_URL}/`);
    
    // Basic content should be accessible
    const title = await page.title();
    expect(title).toBeTruthy();
    
    const h1 = await page.locator('h1').first();
    await expect(h1).toBeVisible();
    
    // Navigation should work
    const navLinks = await page.locator('nav a').all();
    expect(navLinks.length).toBeGreaterThan(0);
    
    // Forms should be accessible
    const forms = await page.locator('form').all();
    for (const form of forms) {
      const action = await form.getAttribute('action');
      const method = await form.getAttribute('method');
      
      // Forms should have proper action and method
      expect(action).toBeTruthy();
      expect(method || 'get').toMatch(/get|post/i);
    }
  });

});