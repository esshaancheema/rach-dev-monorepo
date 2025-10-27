// Advanced SEO Optimization Engine

export interface SEOConfig {
  siteName: string;
  siteUrl: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultKeywords: string[];
  twitterHandle: string;
  facebookAppId?: string;
  defaultImage: string;
  locale: string;
  alternateLocales?: string[];
}

export interface PageSEOData {
  title?: string;
  description?: string;
  keywords?: string[];
  canonicalUrl?: string;
  alternateUrls?: Array<{
    hreflang: string;
    href: string;
  }>;
  image?: {
    url: string;
    alt: string;
    width?: number;
    height?: number;
  };
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
    tags?: string[];
  };
  openGraph?: {
    type?: 'website' | 'article' | 'profile' | 'book' | 'video' | 'music';
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    siteName?: string;
    locale?: string;
  };
  twitter?: {
    card?: 'summary' | 'summary_large_image' | 'app' | 'player';
    site?: string;
    creator?: string;
    title?: string;
    description?: string;
    image?: string;
  };
  robots?: {
    index?: boolean;
    follow?: boolean;
    noarchive?: boolean;
    nocache?: boolean;
    nosnippet?: boolean;
    noimageindex?: boolean;
    maxSnippet?: number;
    maxImagePreview?: 'none' | 'standard' | 'large';
    maxVideoPreview?: number;
  };
}

export interface SEOAnalysis {
  score: number; // 0-100
  issues: Array<{
    type: 'error' | 'warning' | 'info';
    category: 'title' | 'description' | 'keywords' | 'images' | 'links' | 'structure' | 'performance';
    message: string;
    impact: 'high' | 'medium' | 'low';
    recommendation: string;
  }>;
  recommendations: string[];
  technicalSEO: {
    hasTitle: boolean;
    titleLength: number;
    hasDescription: boolean;
    descriptionLength: number;
    hasH1: boolean;
    h1Count: number;
    hasKeywords: boolean;
    keywordDensity: number;
    hasImages: boolean;
    imagesWithAlt: number;
    totalImages: number;
    hasInternalLinks: number;
    hasExternalLinks: number;
    hasStructuredData: boolean;
    isSecure: boolean;
    isMobileFriendly: boolean;
    loadTime: number;
  };
}

export class SEOOptimizer {
  private config: SEOConfig;

  constructor(config: SEOConfig) {
    this.config = config;
  }

  /**
   * Generate optimized meta tags
   */
  generateMetaTags(pageData: PageSEOData, currentUrl: string): Record<string, string> {
    const title = this.optimizeTitle(pageData.title);
    const description = this.optimizeDescription(pageData.description);
    const keywords = this.optimizeKeywords(pageData.keywords);
    const canonicalUrl = pageData.canonicalUrl || currentUrl;
    const imageUrl = pageData.image?.url || this.config.defaultImage;

    const metaTags: Record<string, string> = {
      // Basic Meta Tags
      'title': title,
      'description': description,
      'keywords': keywords.join(', '),
      'canonical': canonicalUrl,
      'viewport': 'width=device-width, initial-scale=1.0',
      'charset': 'utf-8',

      // Open Graph
      'og:type': pageData.openGraph?.type || 'website',
      'og:title': pageData.openGraph?.title || title,
      'og:description': pageData.openGraph?.description || description,
      'og:image': pageData.openGraph?.image || imageUrl,
      'og:url': pageData.openGraph?.url || canonicalUrl,
      'og:site_name': pageData.openGraph?.siteName || this.config.siteName,
      'og:locale': pageData.openGraph?.locale || this.config.locale,

      // Twitter Card
      'twitter:card': pageData.twitter?.card || 'summary_large_image',
      'twitter:site': pageData.twitter?.site || this.config.twitterHandle,
      'twitter:creator': pageData.twitter?.creator || this.config.twitterHandle,
      'twitter:title': pageData.twitter?.title || title,
      'twitter:description': pageData.twitter?.description || description,
      'twitter:image': pageData.twitter?.image || imageUrl,

      // Additional SEO
      'theme-color': '#1f2937',
      'msapplication-TileColor': '#1f2937',
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'default',
    };

    // Facebook App ID
    if (this.config.facebookAppId) {
      metaTags['fb:app_id'] = this.config.facebookAppId;
    }

    // Article specific tags
    if (pageData.article) {
      if (pageData.article.publishedTime) {
        metaTags['article:published_time'] = pageData.article.publishedTime;
      }
      if (pageData.article.modifiedTime) {
        metaTags['article:modified_time'] = pageData.article.modifiedTime;
      }
      if (pageData.article.author) {
        metaTags['article:author'] = pageData.article.author;
      }
      if (pageData.article.section) {
        metaTags['article:section'] = pageData.article.section;
      }
      if (pageData.article.tags) {
        pageData.article.tags.forEach(tag => {
          metaTags[`article:tag`] = tag; // Multiple tags will override, but that's ok for this example
        });
      }
    }

    // Robots tag
    if (pageData.robots) {
      const robotsDirectives = [];
      if (pageData.robots.index !== false) robotsDirectives.push('index');
      else robotsDirectives.push('noindex');
      
      if (pageData.robots.follow !== false) robotsDirectives.push('follow');
      else robotsDirectives.push('nofollow');
      
      if (pageData.robots.noarchive) robotsDirectives.push('noarchive');
      if (pageData.robots.nocache) robotsDirectives.push('nocache');
      if (pageData.robots.nosnippet) robotsDirectives.push('nosnippet');
      if (pageData.robots.noimageindex) robotsDirectives.push('noimageindex');
      
      if (pageData.robots.maxSnippet) robotsDirectives.push(`max-snippet:${pageData.robots.maxSnippet}`);
      if (pageData.robots.maxImagePreview) robotsDirectives.push(`max-image-preview:${pageData.robots.maxImagePreview}`);
      if (pageData.robots.maxVideoPreview) robotsDirectives.push(`max-video-preview:${pageData.robots.maxVideoPreview}`);
      
      metaTags['robots'] = robotsDirectives.join(', ');
    }

    // Hreflang tags
    if (pageData.alternateUrls) {
      pageData.alternateUrls.forEach((alt, index) => {
        metaTags[`hreflang_${index}`] = `${alt.hreflang}|${alt.href}`;
      });
    }

    return metaTags;
  }

  /**
   * Optimize title tag
   */
  optimizeTitle(title?: string): string {
    if (!title) {
      return this.config.defaultTitle;
    }

    // Ensure title includes brand name
    const brandName = this.config.siteName;
    if (!title.includes(brandName)) {
      // Add brand name if title is short enough
      if (title.length + brandName.length + 3 <= 60) {
        title = `${title} | ${brandName}`;
      }
    }

    // Truncate if too long
    if (title.length > 60) {
      title = title.substring(0, 57) + '...';
    }

    return title;
  }

  /**
   * Optimize meta description
   */
  optimizeDescription(description?: string): string {
    if (!description) {
      return this.config.defaultDescription;
    }

    // Truncate if too long
    if (description.length > 160) {
      description = description.substring(0, 157) + '...';
    }

    // Ensure minimum length
    if (description.length < 120) {
      // Add brand mention if space allows
      const brandMention = ` Learn more about ${this.config.siteName}'s solutions.`;
      if (description.length + brandMention.length <= 160) {
        description += brandMention;
      }
    }

    return description;
  }

  /**
   * Optimize keywords
   */
  optimizeKeywords(keywords?: string[]): string[] {
    if (!keywords || keywords.length === 0) {
      return this.config.defaultKeywords;
    }

    // Merge with default keywords and remove duplicates
    const allKeywords = [...new Set([...keywords, ...this.config.defaultKeywords])];
    
    // Limit to reasonable number
    return allKeywords.slice(0, 10);
  }

  /**
   * Generate structured data
   */
  generateStructuredData(type: string, data: any): Record<string, any> {
    const baseStructure = {
      '@context': 'https://schema.org',
      '@type': type,
      ...data
    };

    return baseStructure;
  }

  /**
   * Analyze page SEO
   */
  analyzePage(html: string, url: string): SEOAnalysis {
    const issues: SEOAnalysis['issues'] = [];
    let score = 100;
    
    // Parse HTML (simplified - in production use a proper parser)
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    const descMatch = html.match(/<meta\s+name="description"\s+content="(.*?)"/i);
    const h1Matches = html.match(/<h1[^>]*>(.*?)<\/h1>/gi) || [];
    const imgMatches = html.match(/<img[^>]*>/gi) || [];
    const linkMatches = html.match(/<a\s+[^>]*href="([^"]*)"[^>]*>/gi) || [];

    const technicalSEO = {
      hasTitle: !!titleMatch,
      titleLength: titleMatch ? titleMatch[1].length : 0,
      hasDescription: !!descMatch,
      descriptionLength: descMatch ? descMatch[1].length : 0,
      hasH1: h1Matches.length > 0,
      h1Count: h1Matches.length,
      hasKeywords: html.includes('meta name="keywords"'),
      keywordDensity: 0, // Would need more complex analysis
      hasImages: imgMatches.length > 0,
      imagesWithAlt: imgMatches.filter(img => img.includes('alt=')).length,
      totalImages: imgMatches.length,
      hasInternalLinks: linkMatches.filter(link => link.includes(this.config.siteUrl)).length,
      hasExternalLinks: linkMatches.filter(link => !link.includes(this.config.siteUrl)).length,
      hasStructuredData: html.includes('application/ld+json'),
      isSecure: url.startsWith('https://'),
      isMobileFriendly: html.includes('viewport'),
      loadTime: 0 // Would need performance API
    };

    // Title analysis
    if (!technicalSEO.hasTitle) {
      issues.push({
        type: 'error',
        category: 'title',
        message: 'Missing title tag',
        impact: 'high',
        recommendation: 'Add a descriptive title tag to improve search rankings'
      });
      score -= 15;
    } else if (technicalSEO.titleLength < 30) {
      issues.push({
        type: 'warning',
        category: 'title',
        message: 'Title tag is too short',
        impact: 'medium',
        recommendation: 'Title should be 30-60 characters for optimal display'
      });
      score -= 8;
    } else if (technicalSEO.titleLength > 60) {
      issues.push({
        type: 'warning',
        category: 'title',
        message: 'Title tag is too long',
        impact: 'medium',
        recommendation: 'Title should be under 60 characters to avoid truncation'
      });
      score -= 5;
    }

    // Description analysis
    if (!technicalSEO.hasDescription) {
      issues.push({
        type: 'error',
        category: 'description',
        message: 'Missing meta description',
        impact: 'high',
        recommendation: 'Add a compelling meta description to improve click-through rates'
      });
      score -= 12;
    } else if (technicalSEO.descriptionLength < 120) {
      issues.push({
        type: 'warning',
        category: 'description',
        message: 'Meta description is too short',
        impact: 'medium',
        recommendation: 'Description should be 120-160 characters for optimal display'
      });
      score -= 6;
    } else if (technicalSEO.descriptionLength > 160) {
      issues.push({
        type: 'warning',
        category: 'description',
        message: 'Meta description is too long',
        impact: 'medium',
        recommendation: 'Description should be under 160 characters to avoid truncation'
      });
      score -= 4;
    }

    // H1 analysis
    if (!technicalSEO.hasH1) {
      issues.push({
        type: 'error',
        category: 'structure',
        message: 'Missing H1 tag',
        impact: 'high',
        recommendation: 'Add an H1 tag to clearly define the main topic of the page'
      });
      score -= 10;
    } else if (technicalSEO.h1Count > 1) {
      issues.push({
        type: 'warning',
        category: 'structure',
        message: 'Multiple H1 tags found',
        impact: 'medium',
        recommendation: 'Use only one H1 tag per page for better structure'
      });
      score -= 5;
    }

    // Image analysis
    if (technicalSEO.hasImages && technicalSEO.imagesWithAlt < technicalSEO.totalImages) {
      const missingAlt = technicalSEO.totalImages - technicalSEO.imagesWithAlt;
      issues.push({
        type: 'warning',
        category: 'images',
        message: `${missingAlt} images missing alt text`,
        impact: 'medium',
        recommendation: 'Add descriptive alt text to all images for accessibility and SEO'
      });
      score -= Math.min(missingAlt * 2, 10);
    }

    // Technical SEO checks
    if (!technicalSEO.isSecure) {
      issues.push({
        type: 'error',
        category: 'structure',
        message: 'Page is not served over HTTPS',
        impact: 'high',
        recommendation: 'Enable HTTPS to improve security and search rankings'
      });
      score -= 15;
    }

    if (!technicalSEO.isMobileFriendly) {
      issues.push({
        type: 'error',
        category: 'structure',
        message: 'Missing viewport meta tag',
        impact: 'high',
        recommendation: 'Add viewport meta tag for mobile responsiveness'
      });
      score -= 12;
    }

    if (!technicalSEO.hasStructuredData) {
      issues.push({
        type: 'info',
        category: 'structure',
        message: 'No structured data found',
        impact: 'low',
        recommendation: 'Add structured data to enhance search result appearance'
      });
      score -= 3;
    }

    // Generate recommendations
    const recommendations = [];
    if (issues.length === 0) {
      recommendations.push('Great job! Your page has excellent SEO optimization.');
    } else {
      recommendations.push('Address the high-impact issues first for maximum SEO benefit');
      recommendations.push('Regularly monitor and update your SEO to maintain rankings');
      recommendations.push('Consider adding more internal links to improve site structure');
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      issues,
      recommendations,
      technicalSEO
    };
  }

  /**
   * Generate sitemap entry
   */
  generateSitemapEntry(url: string, lastmod?: string, priority?: number, changefreq?: string): Record<string, any> {
    return {
      url,
      lastmod: lastmod || new Date().toISOString().split('T')[0],
      priority: priority || 0.5,
      changefreq: changefreq || 'weekly'
    };
  }

  /**
   * Generate robots.txt content
   */
  generateRobotsTxt(customRules?: string[]): string {
    const rules = [
      'User-agent: *',
      'Allow: /',
      '',
      'User-agent: GPTBot',
      'Allow: /',
      '',
      'User-agent: Googlebot',
      'Allow: /',
      '',
      'User-agent: Bingbot',
      'Allow: /',
      '',
      'Disallow: /api/',
      'Disallow: /admin/',
      'Disallow: /dashboard/',
      'Disallow: /portal/',
      'Disallow: /_next/',
      'Disallow: /temp/',
      '',
      `Sitemap: ${this.config.siteUrl}/sitemap.xml`,
      `Sitemap: ${this.config.siteUrl}/blog-sitemap.xml`,
      `Sitemap: ${this.config.siteUrl}/case-studies-sitemap.xml`,
      ''
    ];

    if (customRules) {
      rules.push(...customRules);
    }

    return rules.join('\n');
  }
}