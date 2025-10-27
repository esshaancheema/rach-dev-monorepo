// AMP SEO optimization utilities and components

export interface AMPSEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  canonical: string;
  ampUrl?: string;
  locale?: string;
  alternateLocales?: Array<{
    locale: string;
    url: string;
  }>;
  author?: {
    name: string;
    url?: string;
  };
  publisher?: {
    name: string;
    logo: string;
    url?: string;
  };
  image?: {
    url: string;
    width: number;
    height: number;
    alt: string;
  };
  type?: 'website' | 'article' | 'product' | 'service';
  publishDate?: string;
  modifiedDate?: string;
  category?: string;
  tags?: string[];
  schema?: Record<string, any>;
  robots?: {
    index?: boolean;
    follow?: boolean;
    noarchive?: boolean;
    nosnippet?: boolean;
    maxSnippet?: number;
    maxImagePreview?: 'none' | 'standard' | 'large';
    maxVideoPreview?: number;
  };
  twitter?: {
    card: 'summary' | 'summary_large_image' | 'app' | 'player';
    site?: string;
    creator?: string;
    title?: string;
    description?: string;
    image?: string;
  };
  facebook?: {
    appId?: string;
    admins?: string[];
  };
}

export interface AMPBreadcrumb {
  name: string;
  url: string;
}

export interface AMPArticleSchema {
  headline: string;
  description: string;
  author: {
    name: string;
    url?: string;
  };
  publisher: {
    name: string;
    logo: string;
    url?: string;
  };
  datePublished: string;
  dateModified?: string;
  image: string;
  url: string;
  articleSection?: string;
  keywords?: string[];
  wordCount?: number;
  timeRequired?: string;
}

export interface AMPOrganizationSchema {
  name: string;
  url: string;
  logo: string;
  description?: string;
  address?: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  contactPoint?: Array<{
    contactType: string;
    telephone?: string;
    email?: string;
  }>;
  sameAs?: string[];
}

export interface AMPServiceSchema {
  name: string;
  description: string;
  provider: {
    name: string;
    url: string;
  };
  areaServed?: string[];
  serviceType?: string;
  offers?: Array<{
    name: string;
    description: string;
    price?: string;
    priceCurrency?: string;
  }>;
}

export class AMPSEOManager {
  private defaultConfig: Partial<AMPSEOConfig> = {};

  // Set default SEO configuration
  setDefaults(config: Partial<AMPSEOConfig>): void {
    this.defaultConfig = { ...this.defaultConfig, ...config };
  }

  // Generate complete SEO configuration
  generateSEOConfig(config: Partial<AMPSEOConfig>): AMPSEOConfig {
    const merged = { ...this.defaultConfig, ...config };
    
    if (!merged.title || !merged.description || !merged.canonical) {
      throw new Error('Title, description, and canonical URL are required');
    }

    return merged as AMPSEOConfig;
  }

  // Generate HTML meta tags
  generateMetaTags(config: AMPSEOConfig): string {
    let metaTags = '';

    // Basic meta tags
    metaTags += `<title>${this.escapeHtml(config.title)}</title>\n`;
    metaTags += `<meta name="description" content="${this.escapeHtml(config.description)}">\n`;
    
    if (config.keywords && config.keywords.length > 0) {
      metaTags += `<meta name="keywords" content="${config.keywords.join(', ')}">\n`;
    }

    if (config.author) {
      metaTags += `<meta name="author" content="${this.escapeHtml(config.author.name)}">\n`;
    }

    // Canonical and AMP URLs
    metaTags += `<link rel="canonical" href="${config.canonical}">\n`;
    if (config.ampUrl) {
      metaTags += `<link rel="amphtml" href="${config.ampUrl}">\n`;
    }

    // Language and locale
    if (config.locale) {
      metaTags += `<meta name="language" content="${config.locale}">\n`;
    }

    if (config.alternateLocales) {
      config.alternateLocales.forEach(alt => {
        metaTags += `<link rel="alternate" hreflang="${alt.locale}" href="${alt.url}">\n`;
      });
    }

    // Robots directives
    if (config.robots) {
      const robotsContent = this.generateRobotsContent(config.robots);
      if (robotsContent) {
        metaTags += `<meta name="robots" content="${robotsContent}">\n`;
      }
    }

    // Open Graph tags
    metaTags += this.generateOpenGraphTags(config);

    // Twitter Card tags
    if (config.twitter) {
      metaTags += this.generateTwitterCardTags(config.twitter);
    }

    // Facebook tags
    if (config.facebook) {
      if (config.facebook.appId) {
        metaTags += `<meta property="fb:app_id" content="${config.facebook.appId}">\n`;
      }
      if (config.facebook.admins) {
        metaTags += `<meta property="fb:admins" content="${config.facebook.admins.join(',')}">\n`;
      }
    }

    return metaTags;
  }

  // Generate Open Graph tags
  private generateOpenGraphTags(config: AMPSEOConfig): string {
    let ogTags = '';

    ogTags += `<meta property="og:title" content="${this.escapeHtml(config.title)}">\n`;
    ogTags += `<meta property="og:description" content="${this.escapeHtml(config.description)}">\n`;
    ogTags += `<meta property="og:url" content="${config.canonical}">\n`;
    ogTags += `<meta property="og:type" content="${config.type || 'website'}">\n`;

    if (config.locale) {
      ogTags += `<meta property="og:locale" content="${config.locale}">\n`;
    }

    if (config.image) {
      ogTags += `<meta property="og:image" content="${config.image.url}">\n`;
      ogTags += `<meta property="og:image:width" content="${config.image.width}">\n`;
      ogTags += `<meta property="og:image:height" content="${config.image.height}">\n`;
      ogTags += `<meta property="og:image:alt" content="${this.escapeHtml(config.image.alt)}">\n`;
    }

    if (config.publisher) {
      ogTags += `<meta property="og:site_name" content="${this.escapeHtml(config.publisher.name)}">\n`;
    }

    if (config.type === 'article') {
      if (config.author) {
        ogTags += `<meta property="article:author" content="${this.escapeHtml(config.author.name)}">\n`;
      }
      if (config.publishDate) {
        ogTags += `<meta property="article:published_time" content="${config.publishDate}">\n`;
      }
      if (config.modifiedDate) {
        ogTags += `<meta property="article:modified_time" content="${config.modifiedDate}">\n`;
      }
      if (config.category) {
        ogTags += `<meta property="article:section" content="${this.escapeHtml(config.category)}">\n`;
      }
      if (config.tags) {
        config.tags.forEach(tag => {
          ogTags += `<meta property="article:tag" content="${this.escapeHtml(tag)}">\n`;
        });
      }
    }

    return ogTags;
  }

  // Generate Twitter Card tags
  private generateTwitterCardTags(twitter: NonNullable<AMPSEOConfig['twitter']>): string {
    let twitterTags = '';

    twitterTags += `<meta name="twitter:card" content="${twitter.card}">\n`;
    
    if (twitter.site) {
      twitterTags += `<meta name="twitter:site" content="${twitter.site}">\n`;
    }
    
    if (twitter.creator) {
      twitterTags += `<meta name="twitter:creator" content="${twitter.creator}">\n`;
    }
    
    if (twitter.title) {
      twitterTags += `<meta name="twitter:title" content="${this.escapeHtml(twitter.title)}">\n`;
    }
    
    if (twitter.description) {
      twitterTags += `<meta name="twitter:description" content="${this.escapeHtml(twitter.description)}">\n`;
    }
    
    if (twitter.image) {
      twitterTags += `<meta name="twitter:image" content="${twitter.image}">\n`;
    }

    return twitterTags;
  }

  // Generate robots meta content
  private generateRobotsContent(robots: NonNullable<AMPSEOConfig['robots']>): string {
    const directives: string[] = [];

    if (robots.index === false) directives.push('noindex');
    if (robots.follow === false) directives.push('nofollow');
    if (robots.noarchive) directives.push('noarchive');
    if (robots.nosnippet) directives.push('nosnippet');
    if (robots.maxSnippet) directives.push(`max-snippet:${robots.maxSnippet}`);
    if (robots.maxImagePreview) directives.push(`max-image-preview:${robots.maxImagePreview}`);
    if (robots.maxVideoPreview) directives.push(`max-video-preview:${robots.maxVideoPreview}`);

    return directives.join(', ');
  }

  // Generate structured data (JSON-LD)
  generateStructuredData(config: AMPSEOConfig): string {
    const structuredData: any[] = [];

    // Add custom schema if provided
    if (config.schema) {
      structuredData.push(config.schema);
    }

    // Generate WebPage schema
    const webPageSchema = this.generateWebPageSchema(config);
    structuredData.push(webPageSchema);

    // Generate Article schema for article pages
    if (config.type === 'article') {
      const articleSchema = this.generateArticleSchema(config);
      structuredData.push(articleSchema);
    }

    // Generate BreadcrumbList schema
    const breadcrumbSchema = this.generateBreadcrumbSchema(config);
    if (breadcrumbSchema) {
      structuredData.push(breadcrumbSchema);
    }

    return JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': structuredData,
    }, null, 2);
  }

  // Generate WebPage schema
  private generateWebPageSchema(config: AMPSEOConfig): any {
    const schema: any = {
      '@type': 'WebPage',
      '@id': `${config.canonical}#webpage`,
      url: config.canonical,
      name: config.title,
      description: config.description,
      inLanguage: config.locale || 'en-US',
    };

    if (config.image) {
      schema.primaryImageOfPage = {
        '@type': 'ImageObject',
        url: config.image.url,
        width: config.image.width,
        height: config.image.height,
      };
    }

    if (config.publishDate) {
      schema.datePublished = config.publishDate;
    }

    if (config.modifiedDate) {
      schema.dateModified = config.modifiedDate;
    }

    return schema;
  }

  // Generate Article schema
  private generateArticleSchema(config: AMPSEOConfig): any {
    if (!config.author || !config.publisher || !config.publishDate) {
      throw new Error('Article schema requires author, publisher, and publish date');
    }

    const schema: any = {
      '@type': 'Article',
      '@id': `${config.canonical}#article`,
      headline: config.title,
      description: config.description,
      url: config.canonical,
      datePublished: config.publishDate,
      dateModified: config.modifiedDate || config.publishDate,
      author: {
        '@type': 'Person',
        name: config.author.name,
        url: config.author.url,
      },
      publisher: {
        '@type': 'Organization',
        name: config.publisher.name,
        logo: {
          '@type': 'ImageObject',
          url: config.publisher.logo,
        },
        url: config.publisher.url,
      },
    };

    if (config.image) {
      schema.image = {
        '@type': 'ImageObject',
        url: config.image.url,
        width: config.image.width,
        height: config.image.height,
      };
    }

    if (config.category) {
      schema.articleSection = config.category;
    }

    if (config.tags) {
      schema.keywords = config.tags.join(', ');
    }

    return schema;
  }

  // Generate BreadcrumbList schema
  private generateBreadcrumbSchema(config: AMPSEOConfig): any | null {
    // This would typically be generated based on the URL structure
    // For now, we'll return null and let the implementation handle it
    return null;
  }

  // Create sitemap entry
  generateSitemapEntry(config: AMPSEOConfig, priority: number = 0.5, changefreq: string = 'weekly'): string {
    let entry = `<url>\n`;
    entry += `  <loc>${config.canonical}</loc>\n`;
    
    if (config.modifiedDate) {
      entry += `  <lastmod>${config.modifiedDate}</lastmod>\n`;
    }
    
    entry += `  <changefreq>${changefreq}</changefreq>\n`;
    entry += `  <priority>${priority}</priority>\n`;
    
    // Add AMP URL if available
    if (config.ampUrl) {
      entry += `  <xhtml:link rel="amphtml" href="${config.ampUrl}" />\n`;
    }
    
    entry += `</url>\n`;
    
    return entry;
  }

  // Validate SEO configuration
  validateSEOConfig(config: AMPSEOConfig): {
    valid: boolean;
    warnings: string[];
    errors: string[];
  } {
    const warnings: string[] = [];
    const errors: string[] = [];

    // Title validation
    if (!config.title) {
      errors.push('Title is required');
    } else {
      if (config.title.length < 30) {
        warnings.push('Title is too short (recommended: 30-60 characters)');
      }
      if (config.title.length > 60) {
        warnings.push('Title is too long (recommended: 30-60 characters)');
      }
    }

    // Description validation
    if (!config.description) {
      errors.push('Description is required');
    } else {
      if (config.description.length < 120) {
        warnings.push('Description is too short (recommended: 120-160 characters)');
      }
      if (config.description.length > 160) {
        warnings.push('Description is too long (recommended: 120-160 characters)');
      }
    }

    // Canonical URL validation
    if (!config.canonical) {
      errors.push('Canonical URL is required');
    } else if (!this.isValidUrl(config.canonical)) {
      errors.push('Canonical URL is not valid');
    }

    // Image validation
    if (config.image) {
      if (!this.isValidUrl(config.image.url)) {
        errors.push('Image URL is not valid');
      }
      if (config.image.width < 1200) {
        warnings.push('Image width should be at least 1200px for optimal social sharing');
      }
      if (config.image.height < 630) {
        warnings.push('Image height should be at least 630px for optimal social sharing');
      }
    } else {
      warnings.push('No image specified for social sharing');
    }

    // Article-specific validation
    if (config.type === 'article') {
      if (!config.author) {
        warnings.push('Author information is recommended for articles');
      }
      if (!config.publishDate) {
        warnings.push('Publish date is recommended for articles');
      }
      if (!config.category) {
        warnings.push('Category is recommended for articles');
      }
    }

    return {
      valid: errors.length === 0,
      warnings,
      errors,
    };
  }

  // Utility functions
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

// Pre-configured SEO setups for different page types
export const AMPSEOPresets = {
  // Blog post SEO
  blogPost: (data: {
    title: string;
    description: string;
    slug: string;
    category: string;
    author: { name: string; url?: string };
    publishDate: string;
    modifiedDate?: string;
    tags?: string[];
    image?: { url: string; width: number; height: number; alt: string };
  }): AMPSEOConfig => ({
    title: data.title,
    description: data.description,
    canonical: `https://zoptal.com/blog/${data.slug}`,
    ampUrl: `https://zoptal.com/blog/${data.slug}/amp`,
    type: 'article',
    author: data.author,
    publisher: {
      name: 'Zoptal',
      logo: 'https://zoptal.com/logo.png',
      url: 'https://zoptal.com',
    },
    publishDate: data.publishDate,
    modifiedDate: data.modifiedDate,
    category: data.category,
    tags: data.tags,
    image: data.image,
    locale: 'en-US',
    twitter: {
      card: 'summary_large_image',
      site: '@zoptal',
      creator: '@zoptal',
    },
  }),

  // Case study SEO
  caseStudy: (data: {
    title: string;
    description: string;
    slug: string;
    client: string;
    industry: string;
    services: string[];
    publishDate: string;
    image?: { url: string; width: number; height: number; alt: string };
  }): AMPSEOConfig => ({
    title: data.title,
    description: data.description,
    canonical: `https://zoptal.com/case-studies/${data.slug}`,
    ampUrl: `https://zoptal.com/case-studies/${data.slug}/amp`,
    type: 'article',
    publisher: {
      name: 'Zoptal',
      logo: 'https://zoptal.com/logo.png',
      url: 'https://zoptal.com',
    },
    publishDate: data.publishDate,
    category: data.industry,
    tags: data.services,
    image: data.image,
    locale: 'en-US',
    twitter: {
      card: 'summary_large_image',
      site: '@zoptal',
    },
  }),

  // Service page SEO
  servicePage: (data: {
    title: string;
    description: string;
    slug: string;
    serviceCategory: string;
    features: string[];
    image?: { url: string; width: number; height: number; alt: string };
  }): AMPSEOConfig => ({
    title: data.title,
    description: data.description,
    canonical: `https://zoptal.com/services/${data.slug}`,
    type: 'service',
    publisher: {
      name: 'Zoptal',
      logo: 'https://zoptal.com/logo.png',
      url: 'https://zoptal.com',
    },
    category: data.serviceCategory,
    tags: data.features,
    image: data.image,
    locale: 'en-US',
    twitter: {
      card: 'summary_large_image',
      site: '@zoptal',
    },
  }),

  // Landing page SEO
  landingPage: (data: {
    title: string;
    description: string;
    slug: string;
    campaign: string;
    image?: { url: string; width: number; height: number; alt: string };
  }): AMPSEOConfig => ({
    title: data.title,
    description: data.description,
    canonical: `https://zoptal.com/${data.slug}`,
    type: 'website',
    publisher: {
      name: 'Zoptal',
      logo: 'https://zoptal.com/logo.png',
      url: 'https://zoptal.com',
    },
    category: data.campaign,
    image: data.image,
    locale: 'en-US',
    robots: {
      index: true,
      follow: true,
      maxImagePreview: 'large',
    },
    twitter: {
      card: 'summary_large_image',
      site: '@zoptal',
    },
  }),
};

// Export SEO manager instance
export const ampSEO = new AMPSEOManager();