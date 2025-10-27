// AMP validation and testing utilities

export interface AMPValidationResult {
  isValid: boolean;
  errors: AMPValidationError[];
  warnings: AMPValidationWarning[];
  performance: AMPPerformanceMetrics;
  seo: AMPSEOMetrics;
  accessibility: AMPAccessibilityMetrics;
}

export interface AMPValidationError {
  type: 'html' | 'css' | 'js' | 'component' | 'meta';
  severity: 'error' | 'warning';
  message: string;
  line?: number;
  column?: number;
  element?: string;
  code?: string;
}

export interface AMPValidationWarning {
  type: 'performance' | 'seo' | 'accessibility' | 'best-practice';
  message: string;
  suggestion: string;
  impact: 'low' | 'medium' | 'high';
}

export interface AMPPerformanceMetrics {
  cssSize: number;
  cssOptimization: number;
  imageOptimization: number;
  componentCount: number;
  cacheability: number;
  score: number;
}

export interface AMPSEOMetrics {
  hasStructuredData: boolean;
  hasMetaTags: boolean;
  hasOpenGraph: boolean;
  hasTwitterCard: boolean;
  hasCanonical: boolean;
  titleLength: number;
  descriptionLength: number;
  score: number;
}

export interface AMPAccessibilityMetrics {
  hasAltTexts: boolean;
  hasHeadingStructure: boolean;
  hasAriaLabels: boolean;
  hasSemanticMarkup: boolean;
  colorContrast: number;
  score: number;
}

export class AMPValidator {
  private ampRules: AMPValidationRule[] = [];

  constructor() {
    this.initializeRules();
  }

  // Main validation function
  async validate(html: string, css?: string): Promise<AMPValidationResult> {
    const errors: AMPValidationError[] = [];
    const warnings: AMPValidationWarning[] = [];

    // Parse HTML
    const document = this.parseHTML(html);
    
    // Validate AMP HTML structure
    const htmlValidation = this.validateHTML(document);
    errors.push(...htmlValidation.errors);
    warnings.push(...htmlValidation.warnings);

    // Validate CSS if provided
    if (css) {
      const cssValidation = this.validateCSS(css);
      errors.push(...cssValidation.errors);
      warnings.push(...cssValidation.warnings);
    }

    // Validate components
    const componentValidation = this.validateComponents(document);
    errors.push(...componentValidation.errors);
    warnings.push(...componentValidation.warnings);

    // Calculate metrics
    const performance = this.calculatePerformanceMetrics(document, css);
    const seo = this.calculateSEOMetrics(document);
    const accessibility = this.calculateAccessibilityMetrics(document);

    return {
      isValid: errors.filter(e => e.severity === 'error').length === 0,
      errors,
      warnings,
      performance,
      seo,
      accessibility,
    };
  }

  // Validate against official AMP validator (if available)
  async validateWithAMPValidator(html: string): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    try {
      // In a real implementation, this would use the official AMP validator
      // For now, we'll simulate the validation
      const hasAMPAttribute = /(<html[^>]*⚡|<html[^>]*amp)/i.test(html);
      const hasRuntimeScript = html.includes('cdn.ampproject.org/v0.js');
      const hasViewportMeta = html.includes('name="viewport"');
      const hasCharsetMeta = html.includes('charset');
      
      const errors: string[] = [];
      const warnings: string[] = [];

      if (!hasAMPAttribute) {
        errors.push('The mandatory attribute ⚡ or amp is missing in tag html.');
      }

      if (!hasRuntimeScript) {
        errors.push('The mandatory tag head > script[src="https://cdn.ampproject.org/v0.js"] is missing or incorrect.');
      }

      if (!hasViewportMeta) {
        errors.push('The mandatory tag head > meta[name="viewport"] is missing or incorrect.');
      }

      if (!hasCharsetMeta) {
        errors.push('The mandatory tag head > meta[charset] is missing or incorrect.');
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error) {
      return {
        isValid: false,
        errors: ['Failed to validate with AMP validator'],
        warnings: [],
      };
    }
  }

  // Test AMP page performance
  async testPerformance(url: string): Promise<{
    loadTime: number;
    renderTime: number;
    cacheHit: boolean;
    size: number;
    score: number;
    recommendations: string[];
  }> {
    try {
      // Simulate performance testing
      // In a real implementation, this would use tools like Lighthouse or WebPageTest
      
      const startTime = Date.now();
      const response = await fetch(url);
      const html = await response.text();
      const loadTime = Date.now() - startTime;

      const size = new Blob([html]).size;
      const cacheHit = response.headers.get('x-cache')?.includes('HIT') || false;
      
      // Calculate performance score
      let score = 100;
      if (loadTime > 1000) score -= 20;
      if (loadTime > 2000) score -= 30;
      if (size > 500000) score -= 10; // 500KB
      if (!cacheHit) score -= 10;

      const recommendations: string[] = [];
      if (loadTime > 1000) recommendations.push('Optimize images and reduce resource sizes');
      if (size > 500000) recommendations.push('Reduce HTML and CSS size');
      if (!cacheHit) recommendations.push('Enable AMP caching');

      return {
        loadTime,
        renderTime: loadTime * 0.8, // Estimate
        cacheHit,
        size,
        score: Math.max(0, score),
        recommendations,
      };
    } catch (error) {
      return {
        loadTime: 0,
        renderTime: 0,
        cacheHit: false,
        size: 0,
        score: 0,
        recommendations: ['Failed to test performance'],
      };
    }
  }

  // Initialize validation rules
  private initializeRules(): void {
    this.ampRules = [
      {
        name: 'mandatory_amp_attribute',
        type: 'html',
        check: (doc) => /(<html[^>]*⚡|<html[^>]*amp)/i.test(doc.documentElement.outerHTML),
        error: 'The mandatory attribute ⚡ or amp is missing in tag html.',
      },
      {
        name: 'mandatory_charset',
        type: 'meta',
        check: (doc) => !!doc.querySelector('meta[charset]'),
        error: 'The mandatory tag head > meta[charset] is missing.',
      },
      {
        name: 'mandatory_viewport',
        type: 'meta',
        check: (doc) => !!doc.querySelector('meta[name="viewport"]'),
        error: 'The mandatory tag head > meta[name="viewport"] is missing.',
      },
      {
        name: 'mandatory_amp_runtime',
        type: 'js',
        check: (doc) => !!doc.querySelector('script[src*="cdn.ampproject.org/v0.js"]'),
        error: 'The mandatory AMP runtime script is missing.',
      },
      {
        name: 'amp_boilerplate',
        type: 'css',
        check: (doc) => !!doc.querySelector('style[amp-boilerplate]'),
        error: 'The mandatory AMP boilerplate style is missing.',
      },
      {
        name: 'no_external_stylesheets',
        type: 'css',
        check: (doc) => !doc.querySelector('link[rel="stylesheet"]:not([href*="cdn.ampproject.org"])'),
        error: 'External stylesheets are not allowed in AMP.',
      },
      {
        name: 'css_size_limit',
        type: 'css',
        check: (doc) => {
          const customStyle = doc.querySelector('style[amp-custom]');
          if (!customStyle) return true;
          return new Blob([customStyle.textContent || '']).size <= 75000;
        },
        error: 'CSS size exceeds 75KB limit.',
      },
    ];
  }

  // Parse HTML string into DOM
  private parseHTML(html: string): Document {
    if (typeof DOMParser !== 'undefined') {
      return new DOMParser().parseFromString(html, 'text/html');
    }
    
    // Fallback for Node.js environment
    const { JSDOM } = require('jsdom');
    return new JSDOM(html).window.document;
  }

  // Validate HTML structure
  private validateHTML(document: Document): {
    errors: AMPValidationError[];
    warnings: AMPValidationWarning[];
  } {
    const errors: AMPValidationError[] = [];
    const warnings: AMPValidationWarning[] = [];

    // Run validation rules
    this.ampRules.forEach(rule => {
      try {
        if (!rule.check(document)) {
          errors.push({
            type: rule.type as any,
            severity: 'error',
            message: rule.error,
            code: rule.name,
          });
        }
      } catch (error) {
        warnings.push({
          type: 'best-practice',
          message: `Failed to check rule: ${rule.name}`,
          suggestion: 'Review HTML structure',
          impact: 'low',
        });
      }
    });

    // Check for common issues
    const forbiddenElements = document.querySelectorAll('img, video, audio, iframe');
    forbiddenElements.forEach(element => {
      if (!element.tagName.startsWith('AMP-')) {
        errors.push({
          type: 'html',
          severity: 'error',
          message: `Use amp-${element.tagName.toLowerCase()} instead of ${element.tagName.toLowerCase()}`,
          element: element.tagName.toLowerCase(),
        });
      }
    });

    // Check for inline styles
    const inlineStyles = document.querySelectorAll('[style]');
    if (inlineStyles.length > 0) {
      warnings.push({
        type: 'best-practice',
        message: 'Inline styles detected',
        suggestion: 'Move styles to amp-custom style block',
        impact: 'medium',
      });
    }

    return { errors, warnings };
  }

  // Validate CSS
  private validateCSS(css: string): {
    errors: AMPValidationError[];
    warnings: AMPValidationWarning[];
  } {
    const errors: AMPValidationError[] = [];
    const warnings: AMPValidationWarning[] = [];

    // Check CSS size
    const size = new Blob([css]).size;
    if (size > 75000) {
      errors.push({
        type: 'css',
        severity: 'error',
        message: `CSS size (${size} bytes) exceeds 75KB limit`,
      });
    }

    // Check for forbidden properties
    const forbiddenProps = ['behavior', '-moz-binding', 'zoom'];
    forbiddenProps.forEach(prop => {
      if (css.includes(prop)) {
        errors.push({
          type: 'css',
          severity: 'error',
          message: `Forbidden CSS property: ${prop}`,
        });
      }
    });

    // Check for external resources
    if (css.includes('url(') && css.includes('http')) {
      errors.push({
        type: 'css',
        severity: 'error',
        message: 'External resources in CSS are not allowed',
      });
    }

    // Performance warnings
    if (css.includes('!important')) {
      warnings.push({
        type: 'performance',
        message: '!important declarations detected',
        suggestion: 'Use more specific selectors instead',
        impact: 'low',
      });
    }

    return { errors, warnings };
  }

  // Validate AMP components
  private validateComponents(document: Document): {
    errors: AMPValidationError[];
    warnings: AMPValidationWarning[];
  } {
    const errors: AMPValidationError[] = [];
    const warnings: AMPValidationWarning[] = [];

    // Find all AMP components
    const ampElements = document.querySelectorAll('*');
    const usedComponents = new Set<string>();

    ampElements.forEach(element => {
      if (element.tagName.startsWith('AMP-')) {
        const componentName = element.tagName.toLowerCase();
        usedComponents.add(componentName);

        // Check for required attributes
        this.validateComponentAttributes(element, errors);
      }
    });

    // Check for required scripts
    usedComponents.forEach(component => {
      if (component === 'amp-img') return; // Built-in component
      
      const scriptSelector = `script[src*="${component}-"]`;
      if (!document.querySelector(scriptSelector)) {
        errors.push({
          type: 'component',
          severity: 'error',
          message: `Missing script for component: ${component}`,
          element: component,
        });
      }
    });

    return { errors, warnings };
  }

  // Validate component attributes
  private validateComponentAttributes(element: Element, errors: AMPValidationError[]): void {
    const tagName = element.tagName.toLowerCase();

    switch (tagName) {
      case 'amp-img':
        if (!element.hasAttribute('src')) {
          errors.push({
            type: 'component',
            severity: 'error',
            message: 'amp-img requires src attribute',
            element: tagName,
          });
        }
        if (!element.hasAttribute('alt')) {
          errors.push({
            type: 'component',
            severity: 'error',
            message: 'amp-img requires alt attribute',
            element: tagName,
          });
        }
        break;

      case 'amp-video':
        if (!element.hasAttribute('src') && !element.querySelector('source')) {
          errors.push({
            type: 'component',
            severity: 'error',
            message: 'amp-video requires src attribute or source elements',
            element: tagName,
          });
        }
        break;

      case 'amp-iframe':
        if (!element.hasAttribute('src')) {
          errors.push({
            type: 'component',
            severity: 'error',
            message: 'amp-iframe requires src attribute',
            element: tagName,
          });
        }
        break;
    }

    // Check layout attributes
    if (!element.hasAttribute('layout') && !element.hasAttribute('width') && !element.hasAttribute('height')) {
      errors.push({
        type: 'component',
        severity: 'error',
        message: `${tagName} requires layout, width, or height attributes`,
        element: tagName,
      });
    }
  }

  // Calculate performance metrics
  private calculatePerformanceMetrics(document: Document, css?: string): AMPPerformanceMetrics {
    let score = 100;
    
    // CSS size and optimization
    const cssSize = css ? new Blob([css]).size : 0;
    const cssOptimization = cssSize > 0 ? Math.max(0, 100 - (cssSize / 750)) : 100;
    
    // Image optimization
    const images = document.querySelectorAll('amp-img');
    let imageOptimization = 100;
    images.forEach(img => {
      if (!img.hasAttribute('layout') || img.getAttribute('layout') !== 'responsive') {
        imageOptimization -= 10;
      }
    });
    
    // Component count
    const ampComponents = document.querySelectorAll('[class*="amp-"]').length;
    const componentCount = ampComponents;
    
    // Cacheability
    const hasCanonical = !!document.querySelector('link[rel="canonical"]');
    const hasStructuredData = !!document.querySelector('script[type="application/ld+json"]');
    const cacheability = (hasCanonical ? 50 : 0) + (hasStructuredData ? 50 : 0);
    
    // Calculate overall score
    score = (cssOptimization * 0.3) + (imageOptimization * 0.3) + (cacheability * 0.4);
    
    return {
      cssSize,
      cssOptimization,
      imageOptimization,
      componentCount,
      cacheability,
      score: Math.round(score),
    };
  }

  // Calculate SEO metrics
  private calculateSEOMetrics(document: Document): AMPSEOMetrics {
    const hasStructuredData = !!document.querySelector('script[type="application/ld+json"]');
    const hasMetaTags = !!document.querySelector('meta[name="description"]');
    const hasOpenGraph = !!document.querySelector('meta[property^="og:"]');
    const hasTwitterCard = !!document.querySelector('meta[name^="twitter:"]');
    const hasCanonical = !!document.querySelector('link[rel="canonical"]');
    
    const title = document.querySelector('title')?.textContent || '';
    const description = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    
    const titleLength = title.length;
    const descriptionLength = description.length;
    
    let score = 0;
    if (hasStructuredData) score += 20;
    if (hasMetaTags) score += 20;
    if (hasOpenGraph) score += 20;
    if (hasTwitterCard) score += 10;
    if (hasCanonical) score += 20;
    if (titleLength > 0 && titleLength <= 60) score += 10;
    
    return {
      hasStructuredData,
      hasMetaTags,
      hasOpenGraph,
      hasTwitterCard,
      hasCanonical,
      titleLength,
      descriptionLength,
      score,
    };
  }

  // Calculate accessibility metrics
  private calculateAccessibilityMetrics(document: Document): AMPAccessibilityMetrics {
    const images = document.querySelectorAll('amp-img');
    const hasAltTexts = Array.from(images).every(img => img.hasAttribute('alt'));
    
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const hasHeadingStructure = headings.length > 0;
    
    const ariaElements = document.querySelectorAll('[aria-label], [aria-labelledby], [aria-describedby]');
    const hasAriaLabels = ariaElements.length > 0;
    
    const semanticElements = document.querySelectorAll('main, nav, header, footer, section, article');
    const hasSemanticMarkup = semanticElements.length > 0;
    
    // Color contrast would need more sophisticated checking
    const colorContrast = 90; // Placeholder
    
    let score = 0;
    if (hasAltTexts) score += 25;
    if (hasHeadingStructure) score += 25;
    if (hasAriaLabels) score += 25;
    if (hasSemanticMarkup) score += 25;
    
    return {
      hasAltTexts,
      hasHeadingStructure,
      hasAriaLabels,
      hasSemanticMarkup,
      colorContrast,
      score,
    };
  }
}

// Validation rule interface
interface AMPValidationRule {
  name: string;
  type: 'html' | 'css' | 'js' | 'meta' | 'component';
  check: (document: Document) => boolean;
  error: string;
}

// Testing utilities
export class AMPTester {
  private validator = new AMPValidator();

  // Test AMP page end-to-end
  async testAMPPage(url: string): Promise<{
    validation: AMPValidationResult;
    performance: any;
    seo: any;
    accessibility: any;
  }> {
    try {
      const response = await fetch(url);
      const html = await response.text();
      
      // Extract CSS from HTML
      const cssMatch = html.match(/<style amp-custom[^>]*>([\s\S]*?)<\/style>/);
      const css = cssMatch ? cssMatch[1] : '';
      
      const validation = await this.validator.validate(html, css);
      const performance = await this.validator.testPerformance(url);
      
      return {
        validation,
        performance,
        seo: validation.seo,
        accessibility: validation.accessibility,
      };
    } catch (error) {
      throw new Error(`Failed to test AMP page: ${error}`);
    }
  }

  // Generate test report
  generateTestReport(results: any): string {
    let report = '# AMP Validation Report\n\n';
    
    report += `## Overall Status: ${results.validation.isValid ? '✅ PASS' : '❌ FAIL'}\n\n`;
    
    if (results.validation.errors.length > 0) {
      report += '## Errors\n';
      results.validation.errors.forEach((error: any) => {
        report += `- **${error.type}**: ${error.message}\n`;
      });
      report += '\n';
    }
    
    if (results.validation.warnings.length > 0) {
      report += '## Warnings\n';
      results.validation.warnings.forEach((warning: any) => {
        report += `- **${warning.type}**: ${warning.message}\n`;
      });
      report += '\n';
    }
    
    report += '## Metrics\n';
    report += `- Performance Score: ${results.validation.performance.score}/100\n`;
    report += `- SEO Score: ${results.validation.seo.score}/100\n`;
    report += `- Accessibility Score: ${results.validation.accessibility.score}/100\n`;
    report += `- CSS Size: ${results.validation.performance.cssSize} bytes\n`;
    
    return report;
  }
}

// Export validation utilities
export const ampValidator = new AMPValidator();
export const ampTester = new AMPTester();