/**
 * SEO Tests for Zoptal Website
 * 
 * These tests validate SEO elements across critical pages to ensure
 * proper search engine optimization and meta tag implementation.
 */

import { test, expect, Page } from '@playwright/test';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

// Critical pages to test
const CRITICAL_PAGES = [
  '/',
  '/about',
  '/contact',
  '/pricing',
  '/services',
  '/services/custom-software-development/enterprise',
  '/services/mobile-app-development/ios',
  '/services/ai-agents-development',
  '/locations',
  '/case-studies',
  '/resources/blog',
  '/legal/privacy',
  '/legal/terms'
];

// SEO validation rules
const SEO_RULES = {
  title: {
    minLength: 30,
    maxLength: 60,
    required: true
  },
  description: {
    minLength: 120,
    maxLength: 160,
    required: true
  },
  h1: {
    required: true,
    maxCount: 1
  }
};

test.describe('SEO Validation', () => {
  
  CRITICAL_PAGES.forEach(pagePath => {
    test.describe(`Page: ${pagePath}`, () => {
      
      test('should have valid title tag', async ({ page }) => {
        await page.goto(`${BASE_URL}${pagePath}`);
        
        const title = await page.title();
        
        // Title should exist
        expect(title).toBeTruthy();
        expect(title.length).toBeGreaterThan(0);
        
        // Title should be within optimal length
        expect(title.length).toBeGreaterThanOrEqual(SEO_RULES.title.minLength);
        expect(title.length).toBeLessThanOrEqual(SEO_RULES.title.maxLength);
        
        // Title should not be default Next.js title
        expect(title).not.toBe('Create Next App');
        
        // Title should contain brand name (except for homepage)
        if (pagePath !== '/') {
          expect(title).toMatch(/Zoptal/i);
        }
      });

      test('should have valid meta description', async ({ page }) => {
        await page.goto(`${BASE_URL}${pagePath}`);
        
        const description = await page.getAttribute('meta[name="description"]', 'content');
        
        // Description should exist
        expect(description).toBeTruthy();
        
        if (description) {
          // Description should be within optimal length
          expect(description.length).toBeGreaterThanOrEqual(SEO_RULES.description.minLength);
          expect(description.length).toBeLessThanOrEqual(SEO_RULES.description.maxLength);
          
          // Description should be unique and descriptive
          expect(description).not.toBe('');
          expect(description.length).toBeGreaterThan(50);
        }
      });

      test('should have proper heading structure', async ({ page }) => {
        await page.goto(`${BASE_URL}${pagePath}`);
        
        // Should have exactly one H1
        const h1Elements = await page.locator('h1').all();
        expect(h1Elements.length).toBe(1);
        
        // H1 should have meaningful content
        const h1Text = await page.locator('h1').first().textContent();
        expect(h1Text).toBeTruthy();
        expect(h1Text!.length).toBeGreaterThan(10);
        
        // Check heading hierarchy (H1 -> H2 -> H3, etc.)
        const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
        
        if (headings.length > 1) {
          let previousLevel = 0;
          
          for (const heading of headings) {
            const tagName = await heading.evaluate(el => el.tagName.toLowerCase());
            const currentLevel = parseInt(tagName.substring(1));
            
            if (previousLevel === 0) {
              // First heading should be H1
              expect(currentLevel).toBe(1);
            } else {
              // Subsequent headings should not skip levels
              expect(currentLevel).toBeLessThanOrEqual(previousLevel + 1);
            }
            
            previousLevel = currentLevel;
          }
        }
      });

      test('should have Open Graph meta tags', async ({ page }) => {
        await page.goto(`${BASE_URL}${pagePath}`);
        
        // Essential OG tags
        const ogTitle = await page.getAttribute('meta[property="og:title"]', 'content');
        const ogDescription = await page.getAttribute('meta[property="og:description"]', 'content');
        const ogType = await page.getAttribute('meta[property="og:type"]', 'content');
        const ogUrl = await page.getAttribute('meta[property="og:url"]', 'content');
        
        expect(ogTitle).toBeTruthy();
        expect(ogDescription).toBeTruthy();
        expect(ogType).toBeTruthy();
        expect(ogUrl).toBeTruthy();
        
        // OG URL should match current page
        expect(ogUrl).toContain(pagePath);
      });

      test('should have Twitter Card meta tags', async ({ page }) => {
        await page.goto(`${BASE_URL}${pagePath}`);
        
        const twitterCard = await page.getAttribute('meta[name="twitter:card"]', 'content');
        const twitterTitle = await page.getAttribute('meta[name="twitter:title"]', 'content');
        const twitterDescription = await page.getAttribute('meta[name="twitter:description"]', 'content');
        
        expect(twitterCard).toBeTruthy();
        expect(twitterTitle).toBeTruthy();
        expect(twitterDescription).toBeTruthy();
        
        // Twitter card should be summary_large_image or summary
        expect(['summary', 'summary_large_image']).toContain(twitterCard);
      });

      test('should have proper canonical URL', async ({ page }) => {
        await page.goto(`${BASE_URL}${pagePath}`);
        
        const canonical = await page.getAttribute('link[rel="canonical"]', 'href');
        
        expect(canonical).toBeTruthy();
        expect(canonical).toContain(pagePath);
        
        // Canonical should be absolute URL
        expect(canonical).toMatch(/^https?:\/\//);
      });

      test('should have structured data', async ({ page }) => {
        await page.goto(`${BASE_URL}${pagePath}`);
        
        // Check for JSON-LD structured data
        const structuredDataElements = await page.locator('script[type="application/ld+json"]').all();
        
        expect(structuredDataElements.length).toBeGreaterThan(0);
        
        // Validate JSON-LD syntax
        for (const element of structuredDataElements) {
          const content = await element.textContent();
          expect(content).toBeTruthy();
          
          // Should be valid JSON
          expect(() => JSON.parse(content!)).not.toThrow();
          
          const data = JSON.parse(content!);
          
          // Should have @context and @type
          expect(data['@context']).toBeTruthy();
          expect(data['@type']).toBeTruthy();
        }
      });

      test('should have proper viewport meta tag', async ({ page }) => {
        await page.goto(`${BASE_URL}${pagePath}`);
        
        const viewport = await page.getAttribute('meta[name="viewport"]', 'content');
        
        expect(viewport).toBeTruthy();
        expect(viewport).toContain('width=device-width');
        expect(viewport).toContain('initial-scale=1');
      });

      test('should have language declaration', async ({ page }) => {
        await page.goto(`${BASE_URL}${pagePath}`);
        
        const htmlLang = await page.getAttribute('html', 'lang');
        
        expect(htmlLang).toBeTruthy();
        expect(htmlLang).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/); // e.g., 'en' or 'en-US'
      });

      test('images should have alt attributes', async ({ page }) => {
        await page.goto(`${BASE_URL}${pagePath}`);
        
        const images = await page.locator('img').all();
        
        for (const img of images) {
          const alt = await img.getAttribute('alt');
          const src = await img.getAttribute('src');
          
          // All images should have alt attribute (can be empty for decorative)
          expect(alt).not.toBeNull();
          
          // Content images should have meaningful alt text
          if (src && !src.includes('decoration') && !src.includes('background')) {
            expect(alt).toBeTruthy();
            expect(alt!.length).toBeGreaterThan(3);
          }
        }
      });

      test('links should be crawlable', async ({ page }) => {
        await page.goto(`${BASE_URL}${pagePath}`);
        
        const links = await page.locator('a[href]').all();
        
        for (const link of links) {
          const href = await link.getAttribute('href');
          
          expect(href).toBeTruthy();
          
          // Internal links should not use JavaScript or fragments for navigation
          if (href && !href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
            expect(href).not.toMatch(/^javascript:/);
            expect(href).not.toBe('#');
          }
        }
      });

    });
  });

  test.describe('Performance SEO Factors', () => {
    
    test('pages should load within acceptable time', async ({ page }) => {
      for (const pagePath of CRITICAL_PAGES.slice(0, 5)) { // Test first 5 pages
        const startTime = Date.now();
        
        await page.goto(`${BASE_URL}${pagePath}`, { 
          waitUntil: 'domcontentloaded',
          timeout: 10000 
        });
        
        const loadTime = Date.now() - startTime;
        
        // Page should load within 5 seconds
        expect(loadTime).toBeLessThan(5000);
      }
    });

    test('should not have render-blocking resources', async ({ page }) => {
      await page.goto(`${BASE_URL}/`);
      
      // Check for render-blocking CSS
      const stylesheets = await page.locator('link[rel="stylesheet"]:not([media="print"])').all();
      
      for (const stylesheet of stylesheets) {
        const href = await stylesheet.getAttribute('href');
        
        if (href && !href.includes('fonts.googleapis.com')) {
          // Critical CSS should be inlined or loaded asynchronously
          const media = await stylesheet.getAttribute('media');
          expect(media).not.toBeNull();
        }
      }
    });

  });

  test.describe('Mobile SEO', () => {
    
    test('should be mobile-friendly', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto(`${BASE_URL}/`);
      
      // Text should not be too small
      const bodyText = await page.locator('body').first();
      const fontSize = await bodyText.evaluate(el => {
        return window.getComputedStyle(el).fontSize;
      });
      
      const fontSizeNum = parseInt(fontSize);
      expect(fontSizeNum).toBeGreaterThanOrEqual(14); // Minimum 14px for mobile
      
      // Touch targets should be appropriately sized
      const buttons = await page.locator('button, a').all();
      
      for (const button of buttons.slice(0, 10)) { // Check first 10 buttons
        const box = await button.boundingBox();
        
        if (box && box.width > 0 && box.height > 0) {
          // Touch targets should be at least 44px in either dimension
          expect(Math.max(box.width, box.height)).toBeGreaterThanOrEqual(40);
        }
      }
    });

  });

});

test.describe('Sitemap and Robots', () => {
  
  test('should have valid robots.txt', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/robots.txt`);
    
    expect(response?.status()).toBe(200);
    
    const content = await page.textContent('body');
    expect(content).toBeTruthy();
    expect(content).toContain('User-agent:');
    expect(content).toContain('Sitemap:');
  });

  test('should have XML sitemap', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/sitemap.xml`);
    
    expect(response?.status()).toBe(200);
    
    const content = await page.textContent('body');
    expect(content).toBeTruthy();
    expect(content).toContain('<?xml');
    expect(content).toContain('<urlset');
    expect(content).toContain('<url>');
  });

});

test.describe('Security Headers for SEO', () => {
  
  test('should have security headers that don\'t hurt SEO', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/`);
    
    const headers = response?.headers();
    
    // These headers should NOT be present as they can hurt SEO
    expect(headers?.['x-robots-tag']).toBeUndefined();
    
    // These headers are good for security and don't hurt SEO
    expect(headers?.['x-content-type-options']).toBe('nosniff');
    expect(headers?.['x-frame-options']).toBeTruthy();
  });

});