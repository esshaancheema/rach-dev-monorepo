#!/usr/bin/env tsx

/**
 * Generate Sitemap Script
 * 
 * This script generates a comprehensive sitemap for the Zoptal website
 * including all pages, services, locations, case studies, and blog posts.
 */

import fs from 'fs';
import path from 'path';
import { SERVICES } from '../src/lib/constants/services';
import { LOCATIONS } from '../src/lib/constants/locations';

interface SitemapUrl {
  url: string;
  lastModified: string;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://zoptal.com';
const OUTPUT_PATH = path.join(process.cwd(), 'public', 'sitemap.xml');

// Static pages configuration
const STATIC_PAGES = [
  { path: '', priority: 1.0, frequency: 'weekly' as const },
  { path: '/about', priority: 0.8, frequency: 'monthly' as const },
  { path: '/contact', priority: 0.8, frequency: 'monthly' as const },
  { path: '/pricing', priority: 0.9, frequency: 'weekly' as const },
  { path: '/enterprise', priority: 0.8, frequency: 'monthly' as const },
  { path: '/ai-agents', priority: 0.8, frequency: 'monthly' as const },
  { path: '/services', priority: 0.9, frequency: 'weekly' as const },
  { path: '/solutions', priority: 0.8, frequency: 'weekly' as const },
  { path: '/case-studies', priority: 0.8, frequency: 'weekly' as const },
  { path: '/resources', priority: 0.7, frequency: 'weekly' as const },
  { path: '/resources/blog', priority: 0.8, frequency: 'daily' as const },
  { path: '/resources/documentation', priority: 0.7, frequency: 'weekly' as const },
  { path: '/resources/api-reference', priority: 0.6, frequency: 'monthly' as const },
  { path: '/resources/whitepapers', priority: 0.6, frequency: 'monthly' as const },
  { path: '/resources/help-center', priority: 0.7, frequency: 'weekly' as const },
  { path: '/locations', priority: 0.8, frequency: 'monthly' as const },
  { path: '/legal/privacy', priority: 0.3, frequency: 'yearly' as const },
  { path: '/legal/terms', priority: 0.3, frequency: 'yearly' as const },
  { path: '/legal/cookies', priority: 0.3, frequency: 'yearly' as const },
  { path: '/legal/gdpr', priority: 0.3, frequency: 'yearly' as const }
];

// Service pages configuration
const SERVICE_PAGES = [
  { path: '/services/custom-software-development', priority: 0.9, frequency: 'weekly' as const },
  { path: '/services/custom-software-development/enterprise', priority: 0.9, frequency: 'weekly' as const },
  { path: '/services/custom-software-development/startup', priority: 0.9, frequency: 'weekly' as const },
  { path: '/services/custom-software-development/by-industry/healthcare', priority: 0.8, frequency: 'weekly' as const },
  { path: '/services/custom-software-development/by-industry/finance', priority: 0.8, frequency: 'weekly' as const },
  { path: '/services/custom-software-development/by-industry/retail', priority: 0.8, frequency: 'weekly' as const },
  { path: '/services/mobile-app-development', priority: 0.9, frequency: 'weekly' as const },
  { path: '/services/mobile-app-development/ios', priority: 0.8, frequency: 'weekly' as const },
  { path: '/services/mobile-app-development/android', priority: 0.8, frequency: 'weekly' as const },
  { path: '/services/mobile-app-development/cross-platform', priority: 0.8, frequency: 'weekly' as const },
  { path: '/services/ai-agents-development', priority: 0.9, frequency: 'weekly' as const },
  { path: '/services/saas-development/micro-saas', priority: 0.8, frequency: 'weekly' as const },
  { path: '/services/saas-development/enterprise-saas', priority: 0.8, frequency: 'weekly' as const },
  { path: '/services/enterprise-solutions', priority: 0.8, frequency: 'weekly' as const }
];

// Solution pages
const SOLUTION_PAGES = [
  { path: '/solutions/products', priority: 0.7, frequency: 'weekly' as const },
  { path: '/solutions/technology-stack', priority: 0.7, frequency: 'monthly' as const },
  { path: '/solutions/ai-agents', priority: 0.8, frequency: 'weekly' as const }
];

function getCurrentDate(): string {
  return new Date().toISOString().split('T')[0];
}

function generateLocationUrls(): SitemapUrl[] {
  const urls: SitemapUrl[] = [];
  const currentDate = getCurrentDate();

  // Add main location pages
  LOCATIONS.forEach(location => {
    // Country page
    urls.push({
      url: `${BASE_URL}/locations/${location.country.toLowerCase().replace(/\s+/g, '-')}`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6
    });

    // City page
    urls.push({
      url: `${BASE_URL}/locations/${location.country.toLowerCase().replace(/\s+/g, '-')}/${location.name.toLowerCase().replace(/\s+/g, '-')}`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7
    });

    // City + Service combinations
    SERVICE_PAGES.forEach(service => {
      const servicePath = service.path.replace('/services/', '');
      urls.push({
        url: `${BASE_URL}/locations/${location.country.toLowerCase().replace(/\s+/g, '-')}/${location.name.toLowerCase().replace(/\s+/g, '-')}/${servicePath}`,
        lastModified: currentDate,
        changeFrequency: 'monthly',
        priority: 0.6
      });
    });
  });

  return urls;
}

function generateCaseStudyUrls(): SitemapUrl[] {
  const urls: SitemapUrl[] = [];
  const currentDate = getCurrentDate();

  // Case study category pages
  const categories = ['by-industry', 'by-technology', 'by-solution'];
  categories.forEach(category => {
    urls.push({
      url: `${BASE_URL}/case-studies/${category}`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.6
    });
  });

  // Individual case studies (placeholder - would typically fetch from CMS)
  const sampleCaseStudies = [
    'fintech-mobile-banking-app',
    'healthcare-patient-portal',
    'ecommerce-marketplace-platform',
    'ai-powered-crm-system',
    'enterprise-erp-solution'
  ];

  sampleCaseStudies.forEach(slug => {
    urls.push({
      url: `${BASE_URL}/case-studies/${slug}`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.6
    });
  });

  return urls;
}

function generateBlogUrls(): SitemapUrl[] {
  const urls: SitemapUrl[] = [];
  const currentDate = getCurrentDate();

  // Sample blog posts (would typically fetch from CMS)
  const sampleBlogPosts = [
    'ai-in-software-development-2024',
    'startup-mvp-development-guide',
    'enterprise-digital-transformation',
    'mobile-app-development-trends',
    'choosing-tech-stack-2024'
  ];

  sampleBlogPosts.forEach(slug => {
    urls.push({
      url: `${BASE_URL}/resources/blog/${slug}`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5
    });
  });

  return urls;
}

function generateSitemapUrls(): SitemapUrl[] {
  const urls: SitemapUrl[] = [];
  const currentDate = getCurrentDate();

  // Add static pages
  STATIC_PAGES.forEach(page => {
    urls.push({
      url: `${BASE_URL}${page.path}`,
      lastModified: currentDate,
      changeFrequency: page.frequency,
      priority: page.priority
    });
  });

  // Add service pages
  SERVICE_PAGES.forEach(page => {
    urls.push({
      url: `${BASE_URL}${page.path}`,
      lastModified: currentDate,
      changeFrequency: page.frequency,
      priority: page.priority
    });
  });

  // Add solution pages
  SOLUTION_PAGES.forEach(page => {
    urls.push({
      url: `${BASE_URL}${page.path}`,
      lastModified: currentDate,
      changeFrequency: page.frequency,
      priority: page.priority
    });
  });

  // Add location pages
  urls.push(...generateLocationUrls());

  // Add case study pages
  urls.push(...generateCaseStudyUrls());

  // Add blog pages
  urls.push(...generateBlogUrls());

  return urls;
}

function generateSitemapXML(urls: SitemapUrl[]): string {
  const urlElements = urls.map(url => `
  <url>
    <loc>${url.url}</loc>
    <lastmod>${url.lastModified}</lastmod>
    <changefreq>${url.changeFrequency}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`;
}

function generateSitemapIndex(): string {
  const currentDate = getCurrentDate();
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${BASE_URL}/sitemap.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap-pages.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap-locations.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap-blog.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
</sitemapindex>`;
}

async function main() {
  try {
    console.log('🚀 Generating sitemap for Zoptal website...');
    
    // Ensure public directory exists
    const publicDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // Generate all URLs
    const allUrls = generateSitemapUrls();
    
    // Generate main sitemap
    const sitemapXML = generateSitemapXML(allUrls);
    fs.writeFileSync(OUTPUT_PATH, sitemapXML);
    
    // Generate sitemap index
    const sitemapIndexPath = path.join(process.cwd(), 'public', 'sitemap-index.xml');
    const sitemapIndex = generateSitemapIndex();
    fs.writeFileSync(sitemapIndexPath, sitemapIndex);
    
    console.log(`✅ Sitemap generated successfully!`);
    console.log(`📍 Main sitemap: ${OUTPUT_PATH}`);
    console.log(`📍 Sitemap index: ${sitemapIndexPath}`);
    console.log(`📊 Total URLs: ${allUrls.length}`);
    
    // Summary by category
    const categories = {
      static: STATIC_PAGES.length,
      services: SERVICE_PAGES.length,
      solutions: SOLUTION_PAGES.length,
      locations: generateLocationUrls().length,
      caseStudies: generateCaseStudyUrls().length,
      blog: generateBlogUrls().length
    };
    
    console.log('\n📈 URL Distribution:');
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} URLs`);
    });
    
    // Validation
    const totalExpected = Object.values(categories).reduce((sum, count) => sum + count, 0);
    if (totalExpected !== allUrls.length) {
      console.warn(`⚠️  Warning: URL count mismatch. Expected: ${totalExpected}, Generated: ${allUrls.length}`);
    }
    
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

export { generateSitemapUrls, generateSitemapXML };