// AMP (Accelerated Mobile Pages) Generator for Maximum Mobile Speed

export interface AMPConfig {
  siteName: string;
  siteUrl: string;
  logo: {
    url: string;
    width: number;
    height: number;
  };
  publisher: {
    name: string;
    logo: {
      url: string;
      width: number;
      height: number;
    };
  };
  analyticsId?: string;
  adsenseId?: string;
  socialProfiles: string[];
}

export interface AMPArticle {
  title: string;
  description: string;
  content: string;
  author: {
    name: string;
    image?: string;
  };
  publishDate: string;
  modifiedDate?: string;
  category: string;
  tags: string[];
  featuredImage: {
    url: string;
    alt: string;
    width: number;
    height: number;
  };
  url: string;
  canonicalUrl: string;
}

export interface AMPCaseStudy {
  title: string;
  description: string;
  content: string;
  client: {
    name: string;
    logo?: string;
    industry: string;
  };
  results: Array<{
    metric: string;
    value: string;
    description: string;
  }>;
  technologies: string[];
  images: Array<{
    url: string;
    alt: string;
    width: number;
    height: number;
    caption?: string;
  }>;
  publishDate: string;
  url: string;
  canonicalUrl: string;
}

export class AMPGenerator {
  private config: AMPConfig;

  constructor(config: AMPConfig) {
    this.config = config;
  }

  /**
   * Generate AMP HTML structure
   */
  generateAMPHTML(content: string, metadata: Record<string, any>): string {
    return `<!doctype html>
<html ⚡>
<head>
  <meta charset="utf-8">
  <script async src="https://cdn.ampproject.org/v0.js"></script>
  
  <!-- AMP Components -->
  <script async custom-element="amp-analytics" src="https://cdn.ampproject.org/v0/amp-analytics-0.1.js"></script>
  <script async custom-element="amp-social-share" src="https://cdn.ampproject.org/v0/amp-social-share-0.1.js"></script>
  <script async custom-element="amp-img" src="https://cdn.ampproject.org/v0/amp-img-0.1.js"></script>
  <script async custom-element="amp-carousel" src="https://cdn.ampproject.org/v0/amp-carousel-0.1.js"></script>
  ${metadata.hasVideo ? '<script async custom-element="amp-video" src="https://cdn.ampproject.org/v0/amp-video-0.1.js"></script>' : ''}
  ${metadata.hasForm ? '<script async custom-element="amp-form" src="https://cdn.ampproject.org/v0/amp-form-0.1.js"></script>' : ''}
  
  <title>${metadata.title}</title>
  <link rel="canonical" href="${metadata.canonicalUrl}">
  <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
  
  <!-- SEO Meta Tags -->
  <meta name="description" content="${metadata.description}">
  <meta name="keywords" content="${metadata.keywords?.join(', ') || ''}">
  
  <!-- Open Graph -->
  <meta property="og:title" content="${metadata.title}">
  <meta property="og:description" content="${metadata.description}">
  <meta property="og:image" content="${metadata.image}">
  <meta property="og:url" content="${metadata.url}">
  <meta property="og:type" content="${metadata.type || 'article'}">
  <meta property="og:site_name" content="${this.config.siteName}">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${metadata.title}">
  <meta name="twitter:description" content="${metadata.description}">
  <meta name="twitter:image" content="${metadata.image}">
  
  <!-- Structured Data -->
  ${this.generateAMPStructuredData(metadata)}
  
  <!-- AMP Boilerplate -->
  <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style><noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
  
  <!-- Custom AMP Styles -->
  <style amp-custom>
    ${this.generateAMPStyles()}
  </style>
</head>
<body>
  ${this.generateAMPHeader()}
  
  <main>
    ${content}
  </main>
  
  ${this.generateAMPFooter()}
  ${this.generateAMPAnalytics()}
</body>
</html>`;
  }

  /**
   * Generate AMP Blog Article
   */
  generateAMPBlogArticle(article: AMPArticle): string {
    const content = `
      <article class="amp-article">
        <!-- Article Header -->
        <header class="article-header">
          <div class="breadcrumbs">
            <a href="/">Home</a> › 
            <a href="/blog">Blog</a> › 
            <a href="/blog/category/${article.category.toLowerCase()}">${article.category}</a> › 
            <span>${article.title}</span>
          </div>
          
          <h1 class="article-title">${article.title}</h1>
          <p class="article-description">${article.description}</p>
          
          <div class="article-meta">
            <div class="author-info">
              ${article.author.image ? `<amp-img src="${article.author.image}" width="40" height="40" class="author-avatar" alt="${article.author.name}"></amp-img>` : ''}
              <span class="author-name">${article.author.name}</span>
            </div>
            <time class="publish-date" datetime="${article.publishDate}">
              ${new Date(article.publishDate).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </time>
            ${article.modifiedDate ? `<time class="modified-date" datetime="${article.modifiedDate}">Updated: ${new Date(article.modifiedDate).toLocaleDateString()}</time>` : ''}
          </div>
          
          <!-- Featured Image -->
          <figure class="featured-image">
            <amp-img
              src="${article.featuredImage.url}"
              width="${article.featuredImage.width}"
              height="${article.featuredImage.height}"
              layout="responsive"
              alt="${article.featuredImage.alt}"
            ></amp-img>
          </figure>
        </header>
        
        <!-- Article Content -->
        <div class="article-content">
          ${this.processContentForAMP(article.content)}
        </div>
        
        <!-- Article Tags -->
        <div class="article-tags">
          <span class="tags-label">Tags:</span>
          ${article.tags.map(tag => `<a href="/blog/tag/${tag.toLowerCase().replace(/\s+/g, '-')}" class="tag">${tag}</a>`).join('')}
        </div>
        
        <!-- Social Sharing -->
        <div class="social-sharing">
          <h3>Share this article</h3>
          <div class="social-buttons">
            <amp-social-share type="twitter" width="40" height="40"></amp-social-share>
            <amp-social-share type="facebook" width="40" height="40"></amp-social-share>
            <amp-social-share type="linkedin" width="40" height="40"></amp-social-share>
            <amp-social-share type="email" width="40" height="40"></amp-social-share>
          </div>
        </div>
        
        <!-- Newsletter Signup -->
        <div class="newsletter-signup">
          <h3>Stay Updated</h3>
          <p>Subscribe to our newsletter for the latest tech insights and tutorials.</p>
          <form method="post" action-xhr="/api/newsletter/subscribe" custom-validation-reporting="as-you-go">
            <fieldset>
              <input type="email" name="email" placeholder="Enter your email" required>
              <button type="submit">Subscribe</button>
            </fieldset>
            <div submit-success>
              <template type="amp-mustache">
                <p>Thanks for subscribing! Check your email for confirmation.</p>
              </template>
            </div>
            <div submit-error>
              <template type="amp-mustache">
                <p>Sorry, there was an error. Please try again.</p>
              </template>
            </div>
          </form>
        </div>
      </article>
    `;

    const metadata = {
      title: article.title,
      description: article.description,
      canonicalUrl: article.canonicalUrl,
      url: article.url,
      image: article.featuredImage.url,
      type: 'article',
      keywords: article.tags,
      publishDate: article.publishDate,
      modifiedDate: article.modifiedDate,
      author: article.author.name,
      category: article.category,
      hasForm: true
    };

    return this.generateAMPHTML(content, metadata);
  }

  /**
   * Generate AMP Case Study
   */
  generateAMPCaseStudy(caseStudy: AMPCaseStudy): string {
    const content = `
      <article class="amp-case-study">
        <!-- Case Study Header -->
        <header class="case-study-header">
          <div class="breadcrumbs">
            <a href="/">Home</a> › 
            <a href="/case-studies">Case Studies</a> › 
            <span>${caseStudy.title}</span>
          </div>
          
          <h1 class="case-study-title">${caseStudy.title}</h1>
          <p class="case-study-description">${caseStudy.description}</p>
          
          <div class="client-info">
            ${caseStudy.client.logo ? `<amp-img src="${caseStudy.client.logo}" width="120" height="60" class="client-logo" alt="${caseStudy.client.name} logo"></amp-img>` : ''}
            <div class="client-details">
              <h3 class="client-name">${caseStudy.client.name}</h3>
              <p class="client-industry">${caseStudy.client.industry}</p>
            </div>
          </div>
        </header>
        
        <!-- Results Overview -->
        <section class="results-overview">
          <h2>Results Achieved</h2>
          <div class="results-grid">
            ${caseStudy.results.map(result => `
              <div class="result-item">
                <div class="result-value">${result.value}</div>
                <div class="result-metric">${result.metric}</div>
                <div class="result-description">${result.description}</div>
              </div>
            `).join('')}
          </div>
        </section>
        
        <!-- Technologies Used -->
        <section class="technologies">
          <h2>Technologies Used</h2>
          <div class="tech-tags">
            ${caseStudy.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
          </div>
        </section>
        
        <!-- Case Study Content -->
        <div class="case-study-content">
          ${this.processContentForAMP(caseStudy.content)}
        </div>
        
        <!-- Image Gallery -->
        ${caseStudy.images.length > 0 ? `
          <section class="image-gallery">
            <h2>Project Gallery</h2>
            <amp-carousel width="400" height="300" layout="responsive" type="slides">
              ${caseStudy.images.map(image => `
                <figure>
                  <amp-img
                    src="${image.url}"
                    width="${image.width}"
                    height="${image.height}"
                    layout="responsive"
                    alt="${image.alt}"
                  ></amp-img>
                  ${image.caption ? `<figcaption>${image.caption}</figcaption>` : ''}
                </figure>
              `).join('')}
            </amp-carousel>
          </section>
        ` : ''}
        
        <!-- CTA Section -->
        <section class="cta-section">
          <h2>Ready to Start Your Project?</h2>
          <p>Let's discuss how we can help you achieve similar results.</p>
          <a href="/contact" class="cta-button">Get Started</a>
        </section>
      </article>
    `;

    const metadata = {
      title: caseStudy.title,
      description: caseStudy.description,
      canonicalUrl: caseStudy.canonicalUrl,
      url: caseStudy.url,
      image: caseStudy.images[0]?.url || this.config.logo.url,
      type: 'article',
      keywords: caseStudy.technologies,
      publishDate: caseStudy.publishDate
    };

    return this.generateAMPHTML(content, metadata);
  }

  /**
   * Process content for AMP compatibility
   */
  private processContentForAMP(content: string): string {
    // Replace img tags with amp-img
    content = content.replace(
      /<img([^>]*?)src="([^"]*)"([^>]*?)>/gi,
      (match, before, src, after) => {
        const width = this.extractAttribute(match, 'width') || '600';
        const height = this.extractAttribute(match, 'height') || '400';
        const alt = this.extractAttribute(match, 'alt') || '';
        
        return `<amp-img src="${src}" width="${width}" height="${height}" layout="responsive" alt="${alt}"></amp-img>`;
      }
    );

    // Replace video tags with amp-video
    content = content.replace(
      /<video([^>]*?)src="([^"]*)"([^>]*?)>/gi,
      (match, before, src, after) => {
        const width = this.extractAttribute(match, 'width') || '640';
        const height = this.extractAttribute(match, 'height') || '360';
        
        return `<amp-video src="${src}" width="${width}" height="${height}" layout="responsive" controls></amp-video>`;
      }
    );

    // Remove script tags (not allowed in AMP)
    content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

    // Remove style attributes (use amp-custom styles instead)
    content = content.replace(/\s*style\s*=\s*["'][^"']*["']/gi, '');

    // Replace form tags with AMP-compatible forms
    content = content.replace(
      /<form([^>]*?)>/gi,
      '<form$1 method="post" action-xhr="/api/form-handler" custom-validation-reporting="as-you-go">'
    );

    return content;
  }

  /**
   * Extract attribute from HTML tag
   */
  private extractAttribute(html: string, attr: string): string | null {
    const regex = new RegExp(`${attr}\\s*=\\s*["']([^"']*)["']`, 'i');
    const match = html.match(regex);
    return match ? match[1] : null;
  }

  /**
   * Generate AMP Structured Data
   */
  private generateAMPStructuredData(metadata: Record<string, any>): string {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': metadata.type === 'article' ? 'Article' : 'WebPage',
      headline: metadata.title,
      description: metadata.description,
      image: [metadata.image],
      datePublished: metadata.publishDate,
      dateModified: metadata.modifiedDate || metadata.publishDate,
      author: {
        '@type': 'Person',
        name: metadata.author || this.config.publisher.name
      },
      publisher: {
        '@type': 'Organization',
        name: this.config.publisher.name,
        logo: {
          '@type': 'ImageObject',
          url: this.config.publisher.logo.url,
          width: this.config.publisher.logo.width,
          height: this.config.publisher.logo.height
        }
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': metadata.canonicalUrl
      }
    };

    return `<script type="application/ld+json">${JSON.stringify(structuredData, null, 2)}</script>`;
  }

  /**
   * Generate AMP Styles
   */
  private generateAMPStyles(): string {
    return `
      /* AMP Custom Styles */
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 800px;
        margin: 0 auto;
        padding: 0 20px;
      }
      
      .amp-header {
        border-bottom: 1px solid #eee;
        padding: 20px 0;
        margin-bottom: 30px;
      }
      
      .amp-logo {
        font-size: 24px;
        font-weight: bold;
        color: #1f2937;
        text-decoration: none;
      }
      
      .breadcrumbs {
        font-size: 14px;
        color: #666;
        margin-bottom: 20px;
      }
      
      .breadcrumbs a {
        color: #2563eb;
        text-decoration: none;
      }
      
      .article-title, .case-study-title {
        font-size: 32px;
        font-weight: bold;
        line-height: 1.2;
        margin: 20px 0;
        color: #1f2937;
      }
      
      .article-description, .case-study-description {
        font-size: 18px;
        color: #666;
        margin-bottom: 30px;
      }
      
      .article-meta {
        display: flex;
        align-items: center;
        gap: 20px;
        margin-bottom: 30px;
        padding-bottom: 20px;
        border-bottom: 1px solid #eee;
      }
      
      .author-info {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      
      .author-avatar {
        border-radius: 50%;
      }
      
      .author-name {
        font-weight: 500;
      }
      
      .publish-date, .modified-date {
        font-size: 14px;
        color: #666;
      }
      
      .featured-image {
        margin: 30px 0;
      }
      
      .article-content, .case-study-content {
        font-size: 16px;
        line-height: 1.8;
      }
      
      .article-content h2, .case-study-content h2 {
        font-size: 24px;
        font-weight: bold;
        margin: 40px 0 20px 0;
        color: #1f2937;
      }
      
      .article-content h3, .case-study-content h3 {
        font-size: 20px;
        font-weight: 600;
        margin: 30px 0 15px 0;
        color: #374151;
      }
      
      .article-content p, .case-study-content p {
        margin-bottom: 20px;
      }
      
      .article-content blockquote, .case-study-content blockquote {
        border-left: 4px solid #2563eb;
        padding-left: 20px;
        margin: 30px 0;
        font-style: italic;
        color: #555;
      }
      
      .article-tags {
        margin: 40px 0;
        padding: 20px 0;
        border-top: 1px solid #eee;
      }
      
      .tags-label {
        font-weight: 500;
        margin-right: 10px;
      }
      
      .tag, .tech-tag {
        display: inline-block;
        background: #f3f4f6;
        color: #374151;
        padding: 4px 12px;
        border-radius: 16px;
        font-size: 14px;
        text-decoration: none;
        margin: 0 8px 8px 0;
      }
      
      .social-sharing {
        background: #f9fafb;
        padding: 30px;
        border-radius: 8px;
        margin: 40px 0;
        text-align: center;
      }
      
      .social-buttons {
        display: flex;
        justify-content: center;
        gap: 10px;
        margin-top: 20px;
      }
      
      .newsletter-signup {
        background: #1f2937;
        color: white;
        padding: 40px;
        border-radius: 8px;
        margin: 40px 0;
        text-align: center;
      }
      
      .newsletter-signup h3 {
        color: white;
        margin-bottom: 10px;
      }
      
      .newsletter-signup input[type="email"] {
        width: 100%;
        max-width: 300px;
        padding: 12px;
        border: none;
        border-radius: 4px;
        margin: 0 10px 10px 0;
      }
      
      .newsletter-signup button {
        background: #2563eb;
        color: white;
        padding: 12px 24px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
      }
      
      .client-info {
        display: flex;
        align-items: center;
        gap: 20px;
        margin: 30px 0;
        padding: 20px;
        background: #f9fafb;
        border-radius: 8px;
      }
      
      .client-name {
        font-size: 20px;
        font-weight: bold;
        margin: 0;
      }
      
      .client-industry {
        color: #666;
        margin: 5px 0 0 0;
      }
      
      .results-overview {
        margin: 40px 0;
      }
      
      .results-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        margin-top: 20px;
      }
      
      .result-item {
        text-align: center;
        padding: 30px;
        background: #f9fafb;
        border-radius: 8px;
      }
      
      .result-value {
        font-size: 32px;
        font-weight: bold;
        color: #2563eb;
      }
      
      .result-metric {
        font-size: 18px;
        font-weight: 500;
        margin: 10px 0;
      }
      
      .result-description {
        font-size: 14px;
        color: #666;
      }
      
      .technologies {
        margin: 40px 0;
      }
      
      .tech-tags {
        margin-top: 20px;
      }
      
      .cta-section {
        background: #2563eb;
        color: white;
        padding: 40px;
        border-radius: 8px;
        text-align: center;
        margin: 40px 0;
      }
      
      .cta-section h2 {
        color: white;
        margin-bottom: 10px;
      }
      
      .cta-button {
        display: inline-block;
        background: white;
        color: #2563eb;
        padding: 12px 24px;
        border-radius: 4px;
        text-decoration: none;
        font-weight: 500;
        margin-top: 20px;
      }
      
      .amp-footer {
        border-top: 1px solid #eee;
        padding: 30px 0;
        margin-top: 60px;
        text-align: center;
        color: #666;
        font-size: 14px;
      }
      
      /* Responsive Design */
      @media (max-width: 768px) {
        .article-title, .case-study-title {
          font-size: 24px;
        }
        
        .article-meta {
          flex-direction: column;
          align-items: flex-start;
          gap: 10px;
        }
        
        .results-grid {
          grid-template-columns: 1fr;
        }
        
        .client-info {
          flex-direction: column;
          text-align: center;
        }
        
        .newsletter-signup input[type="email"] {
          margin: 0 0 10px 0;
        }
      }
    `;
  }

  /**
   * Generate AMP Header
   */
  private generateAMPHeader(): string {
    return `
      <header class="amp-header">
        <a href="/" class="amp-logo">${this.config.siteName}</a>
      </header>
    `;
  }

  /**
   * Generate AMP Footer
   */
  private generateAMPFooter(): string {
    return `
      <footer class="amp-footer">
        <p>&copy; ${new Date().getFullYear()} ${this.config.siteName}. All rights reserved.</p>
        <p><a href="/legal/privacy">Privacy Policy</a> | <a href="/legal/terms">Terms of Service</a></p>
      </footer>
    `;
  }

  /**
   * Generate AMP Analytics
   */
  private generateAMPAnalytics(): string {
    if (!this.config.analyticsId) return '';

    return `
      <amp-analytics type="gtag" data-credentials="include">
        <script type="application/json">
        {
          "vars": {
            "gtag_id": "${this.config.analyticsId}",
            "config": {
              "${this.config.analyticsId}": {
                "groups": "default"
              }
            }
          }
        }
        </script>
      </amp-analytics>
    `;
  }

  /**
   * Validate AMP HTML
   */
  async validateAMP(html: string): Promise<{ isValid: boolean; errors: string[] }> {
    // In a real implementation, you would use the AMP Validator API
    // For now, we'll do basic validation
    const errors: string[] = [];
    
    // Check for required AMP attributes
    if (!html.includes('⚡') && !html.includes('amp')) {
      errors.push('Missing AMP attribute in html tag');
    }
    
    if (!html.includes('https://cdn.ampproject.org/v0.js')) {
      errors.push('Missing required AMP runtime script');
    }
    
    if (!html.includes('amp-boilerplate')) {
      errors.push('Missing required AMP boilerplate CSS');
    }
    
    // Check for disallowed elements
    if (html.includes('<script') && !html.includes('application/ld+json') && !html.includes('amp-')) {
      errors.push('Custom JavaScript is not allowed in AMP');
    }
    
    if (html.includes('style=')) {
      errors.push('Inline styles are not allowed in AMP');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}