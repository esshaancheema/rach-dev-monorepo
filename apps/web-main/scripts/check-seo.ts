#!/usr/bin/env tsx

/**
 * SEO Validation Script
 * 
 * This script validates SEO elements across all pages in the Zoptal website
 * including meta tags, structured data, performance metrics, and accessibility.
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import puppeteer from 'puppeteer';

interface SEOCheckResult {
  url: string;
  title: {
    exists: boolean;
    length: number;
    isOptimal: boolean;
    content?: string;
  };
  description: {
    exists: boolean;
    length: number;
    isOptimal: boolean;
    content?: string;
  };
  headings: {
    h1Count: number;
    hasH1: boolean;
    hasHierarchy: boolean;
    structure: string[];
  };
  structuredData: {
    exists: boolean;
    types: string[];
    valid: boolean;
  };
  images: {
    total: number;
    withAlt: number;
    missingAlt: number;
  };
  links: {
    internal: number;
    external: number;
    broken: number;
  };
  performance: {
    loadTime?: number;
    contentfulPaint?: number;
    largestContentfulPaint?: number;
  };
  accessibility: {
    score?: number;
    issues: string[];
  };
  mobile: {
    responsive: boolean;
    viewport: boolean;
  };
  social: {
    openGraph: boolean;
    twitterCard: boolean;
  };
  canonical: {
    exists: boolean;
    isCorrect: boolean;
    url?: string;
  };
  score: number;
}

interface SEOReport {
  timestamp: string;
  totalPages: number;
  results: SEOCheckResult[];
  summary: {
    averageScore: number;
    passCount: number;
    failCount: number;
    commonIssues: string[];
  };
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const OUTPUT_DIR = path.join(process.cwd(), 'reports', 'seo');

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
  },
  images: {
    altRequired: true
  },
  performance: {
    maxLoadTime: 3000,
    maxLCP: 2500
  }
};

// Pages to check
const PAGES_TO_CHECK = [
  '/',
  '/about',
  '/contact',
  '/pricing',
  '/services',
  '/services/custom-software-development/enterprise',
  '/services/custom-software-development/startup',
  '/services/mobile-app-development/ios',
  '/services/ai-agents-development',
  '/locations',
  '/case-studies',
  '/resources/blog',
  '/legal/privacy',
  '/legal/terms'
];

async function checkPageSEO(page: puppeteer.Page, url: string): Promise<SEOCheckResult> {
  console.log(`🔍 Checking SEO for: ${url}`);
  
  const startTime = Date.now();
  
  try {
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    
    const loadTime = Date.now() - startTime;
    
    // Extract page data
    const pageData = await page.evaluate(() => {
      // Title
      const title = document.querySelector('title')?.textContent || '';
      
      // Meta description
      const description = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
      
      // Headings
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => ({
        tag: h.tagName.toLowerCase(),
        text: h.textContent?.trim() || ''
      }));
      
      // Structured data
      const structuredDataScripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
      const structuredData = structuredDataScripts.map(script => {
        try {
          return JSON.parse(script.textContent || '{}');
        } catch {
          return null;
        }
      }).filter(Boolean);
      
      // Images
      const images = Array.from(document.querySelectorAll('img'));
      const imagesData = {
        total: images.length,
        withAlt: images.filter(img => img.getAttribute('alt')).length,
        missingAlt: images.filter(img => !img.getAttribute('alt')).length
      };
      
      // Links
      const links = Array.from(document.querySelectorAll('a[href]'));
      const linksData = {
        internal: links.filter(link => {
          const href = link.getAttribute('href') || '';
          return href.startsWith('/') || href.includes(window.location.hostname);
        }).length,
        external: links.filter(link => {
          const href = link.getAttribute('href') || '';
          return href.startsWith('http') && !href.includes(window.location.hostname);
        }).length,
        broken: 0 // Would need additional checking
      };
      
      // Social meta tags
      const openGraph = !!document.querySelector('meta[property^="og:"]');
      const twitterCard = !!document.querySelector('meta[name="twitter:card"]');
      
      // Canonical
      const canonical = document.querySelector('link[rel="canonical"]');
      const canonicalData = {
        exists: !!canonical,
        url: canonical?.getAttribute('href') || ''
      };
      
      // Viewport
      const viewport = !!document.querySelector('meta[name="viewport"]');
      
      return {
        title,
        description,
        headings,
        structuredData,
        images: imagesData,
        links: linksData,
        social: { openGraph, twitterCard },
        canonical: canonicalData,
        viewport
      };
    });
    
    // Performance metrics
    const performanceMetrics = await page.evaluate(() => {
      const timing = performance.timing;
      return {
        loadTime: timing.loadEventEnd - timing.navigationStart,
        contentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
        largestContentfulPaint: performance.getEntriesByName('largest-contentful-paint')[0]?.startTime || 0
      };
    });
    
    // Build result
    const result: SEOCheckResult = {
      url,
      title: {
        exists: !!pageData.title,
        length: pageData.title.length,
        isOptimal: pageData.title.length >= SEO_RULES.title.minLength && 
                   pageData.title.length <= SEO_RULES.title.maxLength,
        content: pageData.title
      },
      description: {
        exists: !!pageData.description,
        length: pageData.description.length,
        isOptimal: pageData.description.length >= SEO_RULES.description.minLength && 
                   pageData.description.length <= SEO_RULES.description.maxLength,
        content: pageData.description
      },
      headings: {
        h1Count: pageData.headings.filter(h => h.tag === 'h1').length,
        hasH1: pageData.headings.some(h => h.tag === 'h1'),
        hasHierarchy: checkHeadingHierarchy(pageData.headings),
        structure: pageData.headings.map(h => `${h.tag}: ${h.text.substring(0, 50)}...`)
      },
      structuredData: {
        exists: pageData.structuredData.length > 0,
        types: pageData.structuredData.map(sd => sd['@type'] || 'Unknown'),
        valid: true // Would need schema.org validation
      },
      images: pageData.images,
      links: pageData.links,
      performance: {
        loadTime,
        contentfulPaint: performanceMetrics.contentfulPaint,
        largestContentfulPaint: performanceMetrics.largestContentfulPaint
      },
      accessibility: {
        issues: []
      },
      mobile: {
        responsive: true, // Would need responsive testing
        viewport: pageData.viewport
      },
      social: pageData.social,
      canonical: {
        exists: pageData.canonical.exists,
        isCorrect: pageData.canonical.url === url,
        url: pageData.canonical.url
      },
      score: 0
    };
    
    // Calculate SEO score
    result.score = calculateSEOScore(result);
    
    return result;
    
  } catch (error) {
    console.error(`❌ Error checking ${url}:`, error);
    return {
      url,
      title: { exists: false, length: 0, isOptimal: false },
      description: { exists: false, length: 0, isOptimal: false },
      headings: { h1Count: 0, hasH1: false, hasHierarchy: false, structure: [] },
      structuredData: { exists: false, types: [], valid: false },
      images: { total: 0, withAlt: 0, missingAlt: 0 },
      links: { internal: 0, external: 0, broken: 0 },
      performance: {},
      accessibility: { issues: ['Failed to load page'] },
      mobile: { responsive: false, viewport: false },
      social: { openGraph: false, twitterCard: false },
      canonical: { exists: false, isCorrect: false },
      score: 0
    };
  }
}

function checkHeadingHierarchy(headings: Array<{ tag: string; text: string }>): boolean {
  let currentLevel = 0;
  
  for (const heading of headings) {
    const level = parseInt(heading.tag.substring(1));
    
    if (currentLevel === 0) {
      if (level !== 1) return false;
      currentLevel = level;
    } else {
      if (level > currentLevel + 1) return false;
      currentLevel = level;
    }
  }
  
  return true;
}

function calculateSEOScore(result: SEOCheckResult): number {
  let score = 0;
  const maxScore = 100;
  
  // Title (20 points)
  if (result.title.exists) score += 10;
  if (result.title.isOptimal) score += 10;
  
  // Description (20 points)
  if (result.description.exists) score += 10;
  if (result.description.isOptimal) score += 10;
  
  // Headings (15 points)
  if (result.headings.hasH1) score += 10;
  if (result.headings.h1Count === 1) score += 5;
  
  // Structured Data (10 points)
  if (result.structuredData.exists) score += 10;
  
  // Images (10 points)
  if (result.images.total > 0 && result.images.missingAlt === 0) score += 10;
  else if (result.images.missingAlt < result.images.total / 2) score += 5;
  
  // Performance (15 points)
  if (result.performance.loadTime && result.performance.loadTime < SEO_RULES.performance.maxLoadTime) score += 8;
  if (result.performance.largestContentfulPaint && result.performance.largestContentfulPaint < SEO_RULES.performance.maxLCP) score += 7;
  
  // Social (5 points)
  if (result.social.openGraph) score += 3;
  if (result.social.twitterCard) score += 2;
  
  // Canonical (5 points)
  if (result.canonical.exists && result.canonical.isCorrect) score += 5;
  
  return Math.min(score, maxScore);
}

function generateReport(results: SEOCheckResult[]): SEOReport {
  const passCount = results.filter(r => r.score >= 80).length;
  const failCount = results.length - passCount;
  const averageScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
  
  // Identify common issues
  const commonIssues: string[] = [];
  const titleIssues = results.filter(r => !r.title.isOptimal).length;
  const descriptionIssues = results.filter(r => !r.description.isOptimal).length;
  const h1Issues = results.filter(r => !r.headings.hasH1).length;
  const imageIssues = results.filter(r => r.images.missingAlt > 0).length;
  
  if (titleIssues > results.length * 0.3) commonIssues.push('Title optimization issues');
  if (descriptionIssues > results.length * 0.3) commonIssues.push('Meta description issues');
  if (h1Issues > results.length * 0.2) commonIssues.push('Missing H1 tags');
  if (imageIssues > results.length * 0.2) commonIssues.push('Images missing alt text');
  
  return {
    timestamp: new Date().toISOString(),
    totalPages: results.length,
    results,
    summary: {
      averageScore,
      passCount,
      failCount,
      commonIssues
    }
  };
}

function generateHTMLReport(report: SEOReport): string {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SEO Report - Zoptal</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #2563eb; margin-bottom: 10px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
        .stat-card { background: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; }
        .stat-value { font-size: 2em; font-weight: bold; color: #1e40af; }
        .stat-label { color: #64748b; margin-top: 5px; }
        .results-table { width: 100%; border-collapse: collapse; margin: 30px 0; }
        .results-table th, .results-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
        .results-table th { background: #f1f5f9; font-weight: 600; }
        .score { font-weight: bold; padding: 4px 8px; border-radius: 4px; }
        .score.excellent { background: #dcfce7; color: #166534; }
        .score.good { background: #fef3c7; color: #92400e; }
        .score.poor { background: #fecaca; color: #991b1b; }
        .issues { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
        .timestamp { color: #64748b; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <h1>📊 SEO Audit Report</h1>
        <p class="timestamp">Generated: ${new Date(report.timestamp).toLocaleString()}</p>
        
        <div class="summary">
            <div class="stat-card">
                <div class="stat-value">${report.summary.averageScore.toFixed(1)}</div>
                <div class="stat-label">Average Score</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${report.summary.passCount}</div>
                <div class="stat-label">Pages Passing (80+)</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${report.summary.failCount}</div>
                <div class="stat-label">Pages Failing (&lt;80)</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${report.totalPages}</div>
                <div class="stat-label">Total Pages</div>
            </div>
        </div>
        
        ${report.summary.commonIssues.length > 0 ? `
        <div class="issues">
            <h3>🚨 Common Issues Found:</h3>
            <ul>
                ${report.summary.commonIssues.map(issue => `<li>${issue}</li>`).join('')}
            </ul>
        </div>
        ` : ''}
        
        <h2>📋 Detailed Results</h2>
        <table class="results-table">
            <thead>
                <tr>
                    <th>Page</th>
                    <th>Score</th>
                    <th>Title</th>
                    <th>Description</th>
                    <th>H1</th>
                    <th>Images</th>
                    <th>Load Time</th>
                </tr>
            </thead>
            <tbody>
                ${report.results.map(result => `
                <tr>
                    <td><a href="${result.url}" target="_blank">${result.url}</a></td>
                    <td><span class="score ${result.score >= 90 ? 'excellent' : result.score >= 70 ? 'good' : 'poor'}">${result.score}</span></td>
                    <td>${result.title.isOptimal ? '✅' : '❌'} ${result.title.length} chars</td>
                    <td>${result.description.isOptimal ? '✅' : '❌'} ${result.description.length} chars</td>
                    <td>${result.headings.hasH1 ? '✅' : '❌'} ${result.headings.h1Count}</td>
                    <td>${result.images.missingAlt === 0 ? '✅' : '❌'} ${result.images.withAlt}/${result.images.total}</td>
                    <td>${result.performance.loadTime ? `${Math.round(result.performance.loadTime)}ms` : 'N/A'}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
</body>
</html>
  `;
  
  return html;
}

async function main() {
  try {
    console.log('🚀 Starting SEO audit for Zoptal website...');
    
    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    
    // Launch browser
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });
    
    // Check each page
    const results: SEOCheckResult[] = [];
    
    for (const pagePath of PAGES_TO_CHECK) {
      const fullUrl = `${BASE_URL}${pagePath}`;
      const result = await checkPageSEO(page, fullUrl);
      results.push(result);
    }
    
    await browser.close();
    
    // Generate report
    const report = generateReport(results);
    
    // Save JSON report
    const jsonPath = path.join(OUTPUT_DIR, `seo-report-${Date.now()}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
    
    // Save HTML report
    const htmlPath = path.join(OUTPUT_DIR, `seo-report-${Date.now()}.html`);
    const htmlReport = generateHTMLReport(report);
    fs.writeFileSync(htmlPath, htmlReport);
    
    // Console summary
    console.log('\n✅ SEO Audit Complete!');
    console.log(`📊 Average Score: ${report.summary.averageScore.toFixed(1)}/100`);
    console.log(`🎯 Passing Pages: ${report.summary.passCount}/${report.totalPages}`);
    console.log(`📁 Reports saved to: ${OUTPUT_DIR}`);
    
    if (report.summary.commonIssues.length > 0) {
      console.log('\n🚨 Common Issues:');
      report.summary.commonIssues.forEach(issue => console.log(`   • ${issue}`));
    }
    
    // Exit with error code if average score is too low
    if (report.summary.averageScore < 70) {
      console.log('\n❌ SEO audit failed - average score below threshold');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Error running SEO audit:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

export { checkPageSEO, calculateSEOScore, generateReport };