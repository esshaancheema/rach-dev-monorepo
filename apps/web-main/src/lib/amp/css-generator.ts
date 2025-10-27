// Dynamic AMP CSS generation based on page content and components

import { buildAMPCSS, AMPCSSOptimizer } from './css-optimizer';

export interface AMPPageConfig {
  pageType: 'blog' | 'case-study' | 'service' | 'landing';
  components: string[];
  theme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    muted: string;
  };
  customStyles?: string;
  optimize?: boolean;
}

export class AMPCSSGenerator {
  private optimizer: AMPCSSOptimizer;

  constructor() {
    this.optimizer = new AMPCSSOptimizer();
  }

  // Generate page-specific AMP CSS
  generatePageCSS(config: AMPPageConfig): {
    css: string;
    size: number;
    warnings: string[];
  } {
    let css = this.generateBaseCSS(config.theme);
    
    // Add component-specific styles
    css += this.generateComponentCSS(config.components, config.theme);
    
    // Add page-type specific styles
    css += this.generatePageTypeCSS(config.pageType, config.theme);
    
    // Add custom styles
    if (config.customStyles) {
      css += config.customStyles;
    }

    // Optimize if requested
    if (config.optimize !== false) {
      const result = this.optimizer.optimize(css, config.components);
      return {
        css: result.optimizedCSS,
        size: result.size,
        warnings: result.warnings,
      };
    }

    return {
      css,
      size: new Blob([css]).size,
      warnings: [],
    };
  }

  // Generate base CSS with theme variables
  private generateBaseCSS(theme: AMPPageConfig['theme']): string {
    return `
      :root {
        --color-primary: ${theme.primary};
        --color-secondary: ${theme.secondary};
        --color-accent: ${theme.accent};
        --color-background: ${theme.background};
        --color-text: ${theme.text};
        --color-muted: ${theme.muted};
        --font-primary: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        --font-mono: 'Monaco', 'Consolas', monospace;
        --border-radius: 0.5rem;
        --shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        --transition: all 0.2s ease;
      }

      *, *::before, *::after {
        box-sizing: border-box;
      }

      html {
        line-height: 1.6;
        -webkit-text-size-adjust: 100%;
        font-size: 16px;
      }

      body {
        margin: 0;
        padding: 0;
        font-family: var(--font-primary);
        color: var(--color-text);
        background: var(--color-background);
      }

      h1, h2, h3, h4, h5, h6 {
        margin: 0 0 1rem 0;
        font-weight: 600;
        line-height: 1.3;
        color: var(--color-text);
      }

      h1 { font-size: 2rem; }
      h2 { font-size: 1.5rem; }
      h3 { font-size: 1.25rem; }
      h4 { font-size: 1.125rem; }
      h5 { font-size: 1rem; }
      h6 { font-size: 0.875rem; }

      p {
        margin: 0 0 1rem 0;
        line-height: 1.7;
      }

      a {
        color: var(--color-primary);
        text-decoration: none;
        transition: var(--transition);
      }

      a:hover {
        text-decoration: underline;
      }

      img {
        max-width: 100%;
        height: auto;
      }

      code {
        font-family: var(--font-mono);
        background: #f1f5f9;
        padding: 0.125rem 0.25rem;
        border-radius: 0.25rem;
        font-size: 0.875rem;
      }

      pre {
        background: #1f2937;
        color: #f9fafb;
        padding: 1rem;
        border-radius: var(--border-radius);
        overflow-x: auto;
        margin: 1rem 0;
      }

      pre code {
        background: none;
        padding: 0;
        color: inherit;
      }

      blockquote {
        border-left: 4px solid var(--color-primary);
        margin: 1.5rem 0;
        padding: 1rem 1.5rem;
        background: #f8fafc;
        font-style: italic;
      }

      ul, ol {
        margin: 0 0 1rem 0;
        padding-left: 1.5rem;
      }

      li {
        margin-bottom: 0.5rem;
      }

      hr {
        border: none;
        border-top: 1px solid #e5e7eb;
        margin: 2rem 0;
      }

      @media (max-width: 767px) {
        html { font-size: 14px; }
        h1 { font-size: 1.75rem; }
        h2 { font-size: 1.375rem; }
      }
    `;
  }

  // Generate component-specific CSS
  private generateComponentCSS(components: string[], theme: AMPPageConfig['theme']): string {
    let css = '';

    components.forEach(component => {
      switch (component) {
        case 'header':
          css += this.generateHeaderCSS(theme);
          break;
        case 'navigation':
          css += this.generateNavigationCSS(theme);
          break;
        case 'hero':
          css += this.generateHeroCSS(theme);
          break;
        case 'article':
          css += this.generateArticleCSS(theme);
          break;
        case 'sidebar':
          css += this.generateSidebarCSS(theme);
          break;
        case 'footer':
          css += this.generateFooterCSS(theme);
          break;
        case 'card':
          css += this.generateCardCSS(theme);
          break;
        case 'button':
          css += this.generateButtonCSS(theme);
          break;
        case 'badge':
          css += this.generateBadgeCSS(theme);
          break;
        case 'social-share':
          css += this.generateSocialShareCSS(theme);
          break;
        case 'cta':
          css += this.generateCTACSS(theme);
          break;
      }
    });

    return css;
  }

  // Generate page-type specific CSS
  private generatePageTypeCSS(pageType: AMPPageConfig['pageType'], theme: AMPPageConfig['theme']): string {
    switch (pageType) {
      case 'blog':
        return this.generateBlogPageCSS(theme);
      case 'case-study':
        return this.generateCaseStudyPageCSS(theme);
      case 'service':
        return this.generateServicePageCSS(theme);
      case 'landing':
        return this.generateLandingPageCSS(theme);
      default:
        return '';
    }
  }

  // Individual component CSS generators
  private generateHeaderCSS(theme: AMPPageConfig['theme']): string {
    return `
      .amp-header {
        background: var(--color-background);
        border-bottom: 1px solid #e5e7eb;
        padding: 1rem 0;
        position: sticky;
        top: 0;
        z-index: 50;
      }

      .amp-logo {
        font-size: 1.5rem;
        font-weight: bold;
        color: var(--color-primary);
        text-decoration: none;
      }

      .amp-logo:hover {
        text-decoration: none;
      }
    `;
  }

  private generateNavigationCSS(theme: AMPPageConfig['theme']): string {
    return `
      .amp-nav {
        display: flex;
        gap: 2rem;
        align-items: center;
      }

      .amp-nav-link {
        color: var(--color-text);
        font-weight: 500;
        transition: var(--transition);
      }

      .amp-nav-link:hover {
        color: var(--color-primary);
        text-decoration: none;
      }

      @media (max-width: 767px) {
        .amp-nav {
          display: none;
        }
      }
    `;
  }

  private generateHeroCSS(theme: AMPPageConfig['theme']): string {
    return `
      .amp-hero {
        background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
        color: white;
        padding: 4rem 0;
        text-align: center;
      }

      .amp-hero-title {
        font-size: 3rem;
        font-weight: bold;
        margin-bottom: 1rem;
        line-height: 1.2;
      }

      .amp-hero-subtitle {
        font-size: 1.25rem;
        opacity: 0.9;
        margin-bottom: 2rem;
      }

      @media (max-width: 767px) {
        .amp-hero {
          padding: 2rem 0;
        }

        .amp-hero-title {
          font-size: 2rem;
        }

        .amp-hero-subtitle {
          font-size: 1rem;
        }
      }
    `;
  }

  private generateArticleCSS(theme: AMPPageConfig['theme']): string {
    return `
      .amp-article {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem 1rem;
      }

      .amp-article-header {
        margin-bottom: 2rem;
        text-align: center;
      }

      .amp-article-meta {
        display: flex;
        gap: 1rem;
        font-size: 0.875rem;
        color: var(--color-muted);
        margin-bottom: 1rem;
        justify-content: center;
        flex-wrap: wrap;
      }

      .amp-article-title {
        font-size: 2.5rem;
        font-weight: bold;
        line-height: 1.2;
        margin-bottom: 1rem;
        color: var(--color-text);
      }

      .amp-article-excerpt {
        font-size: 1.125rem;
        color: var(--color-muted);
        margin-bottom: 2rem;
        line-height: 1.6;
      }

      .amp-article-content {
        font-size: 1rem;
        line-height: 1.7;
      }

      @media (max-width: 767px) {
        .amp-article {
          padding: 1rem 0.5rem;
        }

        .amp-article-title {
          font-size: 2rem;
        }

        .amp-article-excerpt {
          font-size: 1rem;
        }

        .amp-article-meta {
          flex-direction: column;
          gap: 0.5rem;
        }
      }
    `;
  }

  private generateCardCSS(theme: AMPPageConfig['theme']): string {
    return `
      .amp-card {
        background: var(--color-background);
        border-radius: var(--border-radius);
        box-shadow: var(--shadow);
        padding: 1.5rem;
        border: 1px solid #e5e7eb;
      }

      .amp-card-title {
        font-size: 1.25rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
        color: var(--color-text);
      }

      .amp-card-content {
        color: var(--color-muted);
        line-height: 1.6;
      }
    `;
  }

  private generateButtonCSS(theme: AMPPageConfig['theme']): string {
    return `
      .amp-btn {
        display: inline-block;
        padding: 0.75rem 1.5rem;
        border-radius: var(--border-radius);
        font-weight: 600;
        text-align: center;
        cursor: pointer;
        border: none;
        text-decoration: none;
        transition: var(--transition);
        font-size: 1rem;
        line-height: 1;
      }

      .amp-btn-primary {
        background: var(--color-primary);
        color: white;
      }

      .amp-btn-primary:hover {
        background: var(--color-secondary);
        text-decoration: none;
      }

      .amp-btn-secondary {
        background: transparent;
        color: var(--color-primary);
        border: 2px solid var(--color-primary);
      }

      .amp-btn-secondary:hover {
        background: var(--color-primary);
        color: white;
        text-decoration: none;
      }

      .amp-btn-large {
        padding: 1rem 2rem;
        font-size: 1.125rem;
      }

      .amp-btn-small {
        padding: 0.5rem 1rem;
        font-size: 0.875rem;
      }
    `;
  }

  private generateBadgeCSS(theme: AMPPageConfig['theme']): string {
    return `
      .amp-badge {
        display: inline-block;
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 500;
        background: #e5e7eb;
        color: #374151;
      }

      .amp-badge-primary {
        background: var(--color-primary);
        color: white;
      }

      .amp-badge-secondary {
        background: var(--color-secondary);
        color: white;
      }

      .amp-badge-outline {
        background: transparent;
        border: 1px solid #e5e7eb;
        color: var(--color-muted);
      }
    `;
  }

  private generateSocialShareCSS(theme: AMPPageConfig['theme']): string {
    return `
      .amp-social-share {
        margin: 2rem 0;
        padding: 1.5rem 0;
        border-top: 1px solid #e5e7eb;
        border-bottom: 1px solid #e5e7eb;
      }

      .amp-social-title {
        font-size: 1rem;
        font-weight: 600;
        margin-bottom: 1rem;
        color: var(--color-text);
      }

      .amp-social-buttons {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
        justify-content: center;
      }

      amp-social-share {
        border-radius: var(--border-radius);
      }
    `;
  }

  private generateCTACSS(theme: AMPPageConfig['theme']): string {
    return `
      .amp-cta {
        background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
        color: white;
        padding: 2rem;
        border-radius: var(--border-radius);
        text-align: center;
        margin: 2rem 0;
      }

      .amp-cta-title {
        font-size: 1.5rem;
        font-weight: bold;
        margin-bottom: 0.75rem;
      }

      .amp-cta-description {
        margin-bottom: 1.25rem;
        opacity: 0.9;
        line-height: 1.6;
      }

      .amp-cta-button {
        background: white;
        color: var(--color-primary);
        padding: 0.75rem 1.5rem;
        border-radius: var(--border-radius);
        text-decoration: none;
        font-weight: 600;
        display: inline-block;
        transition: var(--transition);
      }

      .amp-cta-button:hover {
        transform: translateY(-2px);
        text-decoration: none;
      }

      @media (max-width: 767px) {
        .amp-cta {
          padding: 1.5rem 1rem;
        }

        .amp-cta-title {
          font-size: 1.25rem;
        }
      }
    `;
  }

  private generateFooterCSS(theme: AMPPageConfig['theme']): string {
    return `
      .amp-footer {
        margin-top: 3rem;
        padding: 1.5rem 0;
        border-top: 1px solid #e5e7eb;
        text-align: center;
        color: var(--color-muted);
        font-size: 0.875rem;
      }

      .amp-footer a {
        color: var(--color-muted);
        margin: 0 0.5rem;
      }

      .amp-footer a:hover {
        color: var(--color-primary);
      }
    `;
  }

  // Page-type specific CSS
  private generateBlogPageCSS(theme: AMPPageConfig['theme']): string {
    return `
      .amp-breadcrumbs {
        font-size: 0.875rem;
        color: var(--color-muted);
        margin-bottom: 1rem;
      }

      .amp-breadcrumbs a {
        color: var(--color-muted);
      }

      .amp-breadcrumbs a:hover {
        color: var(--color-primary);
      }

      .amp-article-tags {
        margin-top: 2rem;
        padding-top: 1.5rem;
        border-top: 1px solid #e5e7eb;
      }

      .amp-article-tags h3 {
        font-size: 1rem;
        margin-bottom: 1rem;
      }

      .amp-tags {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
      }
    `;
  }

  private generateCaseStudyPageCSS(theme: AMPPageConfig['theme']): string {
    return `
      .amp-case-study-meta {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        margin: 2rem 0;
        padding: 1.5rem;
        background: #f8fafc;
        border-radius: var(--border-radius);
      }

      .amp-case-study-meta-item {
        text-align: center;
      }

      .amp-case-study-meta-value {
        font-size: 1.5rem;
        font-weight: bold;
        color: var(--color-primary);
        margin-bottom: 0.25rem;
      }

      .amp-case-study-meta-label {
        font-size: 0.875rem;
        color: var(--color-muted);
      }
    `;
  }

  private generateServicePageCSS(theme: AMPPageConfig['theme']): string {
    return `
      .amp-service-features {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
        margin: 2rem 0;
      }

      .amp-service-feature {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
      }

      .amp-service-feature-icon {
        width: 1.5rem;
        height: 1.5rem;
        color: var(--color-primary);
        flex-shrink: 0;
        margin-top: 0.125rem;
      }

      .amp-process-steps {
        counter-reset: step;
      }

      .amp-process-step {
        counter-increment: step;
        position: relative;
        padding-left: 3rem;
        margin-bottom: 2rem;
      }

      .amp-process-step::before {
        content: counter(step);
        position: absolute;
        left: 0;
        top: 0;
        width: 2rem;
        height: 2rem;
        background: var(--color-primary);
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 0.875rem;
      }
    `;
  }

  private generateLandingPageCSS(theme: AMPPageConfig['theme']): string {
    return `
      .amp-landing-section {
        padding: 4rem 0;
      }

      .amp-landing-section:nth-child(even) {
        background: #f8fafc;
      }

      .amp-feature-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 2rem;
        margin: 2rem 0;
      }

      .amp-testimonial {
        background: white;
        padding: 2rem;
        border-radius: var(--border-radius);
        box-shadow: var(--shadow);
        text-align: center;
        position: relative;
      }

      .amp-testimonial::before {
        content: '"';
        font-size: 4rem;
        color: var(--color-primary);
        position: absolute;
        top: -1rem;
        left: 50%;
        transform: translateX(-50%);
        background: white;
        padding: 0 0.5rem;
      }

      @media (max-width: 767px) {
        .amp-landing-section {
          padding: 2rem 0;
        }

        .amp-feature-grid {
          grid-template-columns: 1fr;
          gap: 1rem;
        }
      }
    `;
  }
}

// Pre-configured CSS for common AMP page types
export const AMPPageCSS = {
  blog: (theme: AMPPageConfig['theme']) => {
    const generator = new AMPCSSGenerator();
    return generator.generatePageCSS({
      pageType: 'blog',
      components: ['header', 'article', 'social-share', 'cta', 'footer'],
      theme,
      optimize: true,
    });
  },

  caseStudy: (theme: AMPPageConfig['theme']) => {
    const generator = new AMPCSSGenerator();
    return generator.generatePageCSS({
      pageType: 'case-study',
      components: ['header', 'article', 'card', 'badge', 'social-share', 'cta', 'footer'],
      theme,
      optimize: true,
    });
  },

  service: (theme: AMPPageConfig['theme']) => {
    const generator = new AMPCSSGenerator();
    return generator.generatePageCSS({
      pageType: 'service',
      components: ['header', 'hero', 'card', 'button', 'badge', 'cta', 'footer'],
      theme,
      optimize: true,
    });
  },

  landing: (theme: AMPPageConfig['theme']) => {
    const generator = new AMPCSSGenerator();
    return generator.generatePageCSS({
      pageType: 'landing',
      components: ['header', 'hero', 'card', 'button', 'cta', 'footer'],
      theme,
      optimize: true,
    });
  },
};

// Export default theme
export const defaultAMPTheme: AMPPageConfig['theme'] = {
  primary: '#2563eb',
  secondary: '#7c3aed',
  accent: '#06b6d4',
  background: '#ffffff',
  text: '#111827',
  muted: '#6b7280',
};