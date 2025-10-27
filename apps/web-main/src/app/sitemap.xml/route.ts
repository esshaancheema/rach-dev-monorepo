// Dynamic Sitemap Generation for Enhanced SEO
import { NextRequest, NextResponse } from 'next/server';
import { getBlogPosts } from '@/lib/cms/blog';
import { getCaseStudies } from '@/lib/cms/case-studies';

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zoptal.com';
  
  try {
    // Get dynamic content
    const [blogPosts, caseStudies] = await Promise.all([
      getBlogPosts(),
      getCaseStudies()
    ]);

    // Static pages with their priorities and change frequencies
    const staticPages = [
      { url: '', priority: 1.0, changefreq: 'daily' },
      { url: '/about', priority: 0.8, changefreq: 'monthly' },
      { url: '/services', priority: 0.9, changefreq: 'weekly' },
      { url: '/services/web-development', priority: 0.8, changefreq: 'monthly' },
      { url: '/services/mobile-development', priority: 0.8, changefreq: 'monthly' },
      { url: '/services/ai-development', priority: 0.8, changefreq: 'monthly' },
      { url: '/services/cloud-solutions', priority: 0.8, changefreq: 'monthly' },
      { url: '/portfolio', priority: 0.9, changefreq: 'weekly' },
      { url: '/blog', priority: 0.9, changefreq: 'daily' },
      { url: '/case-studies', priority: 0.9, changefreq: 'weekly' },
      { url: '/contact', priority: 0.7, changefreq: 'monthly' },
      { url: '/careers', priority: 0.6, changefreq: 'monthly' },
      { url: '/legal/privacy', priority: 0.3, changefreq: 'yearly' },
      { url: '/legal/terms', priority: 0.3, changefreq: 'yearly' }
    ];

    // Generate sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" 
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
  ${staticPages.map(page => `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('')}
  ${blogPosts.map(post => `
  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${new Date(post.updatedAt).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
    <xhtml:link rel="alternate" media="only screen and (max-width: 640px)" href="${baseUrl}/blog/${post.slug}/amp" />
    <image:image>
      <image:loc>${post.featuredImage.url}</image:loc>
      <image:title>${post.title}</image:title>
      <image:caption>${post.description}</image:caption>
    </image:image>
  </url>
  <url>
    <loc>${baseUrl}/blog/${post.slug}/amp</loc>
    <lastmod>${new Date(post.updatedAt).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`).join('')}
  ${caseStudies.map(caseStudy => `
  <url>
    <loc>${baseUrl}/case-studies/${caseStudy.slug}</loc>
    <lastmod>${new Date(caseStudy.updatedAt).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" media="only screen and (max-width: 640px)" href="${baseUrl}/case-studies/${caseStudy.slug}/amp" />
    <image:image>
      <image:loc>${caseStudy.featuredImage.url}</image:loc>
      <image:title>${caseStudy.title}</image:title>
      <image:caption>${caseStudy.description}</image:caption>
    </image:image>
  </url>
  <url>
    <loc>${baseUrl}/case-studies/${caseStudy.slug}/amp</loc>
    <lastmod>${new Date(caseStudy.updatedAt).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('')}
</urlset>`;

    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400'
      }
    });

  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    return new NextResponse('Internal Server Error', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain'
      }
    });
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';