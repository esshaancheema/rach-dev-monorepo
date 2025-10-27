// AMP CSS optimization utilities
// AMP has strict CSS limitations: max 75KB, no external stylesheets, specific rules

export interface AMPCSSConfig {
  maxSize: number; // Maximum CSS size in bytes (AMP limit is 75KB)
  minifyOptions: {
    removeComments: boolean;
    removeWhitespace: boolean;
    removeUnusedRules: boolean;
    optimizeSelectors: boolean;
  };
  criticalCSS: {
    extractAboveFold: boolean;
    prioritizeComponents: string[];
  };
}

export const DEFAULT_AMP_CSS_CONFIG: AMPCSSConfig = {
  maxSize: 75000, // 75KB AMP limit
  minifyOptions: {
    removeComments: true,
    removeWhitespace: true,
    removeUnusedRules: true,
    optimizeSelectors: true,
  },
  criticalCSS: {
    extractAboveFold: true,
    prioritizeComponents: ['header', 'navigation', 'hero', 'content'],
  },
};

// CSS minification and optimization
export class AMPCSSOptimizer {
  private config: AMPCSSConfig;
  private usedSelectors: Set<string> = new Set();
  private criticalRules: string[] = [];
  private nonCriticalRules: string[] = [];

  constructor(config: AMPCSSConfig = DEFAULT_AMP_CSS_CONFIG) {
    this.config = config;
  }

  // Main optimization function
  optimize(css: string, usedComponents: string[] = []): {
    optimizedCSS: string;
    size: number;
    savings: number;
    warnings: string[];
  } {
    const originalSize = new Blob([css]).size;
    let optimizedCSS = css;
    const warnings: string[] = [];

    // Step 1: Remove comments
    if (this.config.minifyOptions.removeComments) {
      optimizedCSS = this.removeComments(optimizedCSS);
    }

    // Step 2: Minify whitespace
    if (this.config.minifyOptions.removeWhitespace) {
      optimizedCSS = this.minifyWhitespace(optimizedCSS);
    }

    // Step 3: Remove unused rules (if component list provided)
    if (this.config.minifyOptions.removeUnusedRules && usedComponents.length > 0) {
      optimizedCSS = this.removeUnusedRules(optimizedCSS, usedComponents);
    }

    // Step 4: Optimize selectors
    if (this.config.minifyOptions.optimizeSelectors) {
      optimizedCSS = this.optimizeSelectors(optimizedCSS);
    }

    // Step 5: Extract critical CSS
    if (this.config.criticalCSS.extractAboveFold) {
      optimizedCSS = this.extractCriticalCSS(optimizedCSS);
    }

    // Step 6: Validate AMP CSS rules
    const ampValidation = this.validateAMPRules(optimizedCSS);
    warnings.push(...ampValidation.warnings);

    // Step 7: Check size limits
    const finalSize = new Blob([optimizedCSS]).size;
    if (finalSize > this.config.maxSize) {
      warnings.push(
        `CSS size (${finalSize} bytes) exceeds AMP limit (${this.config.maxSize} bytes)`
      );
      
      // Try more aggressive optimization
      optimizedCSS = this.aggressiveOptimization(optimizedCSS);
    }

    const savings = originalSize - new Blob([optimizedCSS]).size;

    return {
      optimizedCSS,
      size: new Blob([optimizedCSS]).size,
      savings,
      warnings,
    };
  }

  // Remove CSS comments
  private removeComments(css: string): string {
    return css.replace(/\/\*[\s\S]*?\*\//g, '');
  }

  // Minify whitespace
  private minifyWhitespace(css: string): string {
    return css
      .replace(/\s+/g, ' ') // Multiple spaces to single space
      .replace(/\s*{\s*/g, '{') // Spaces around opening braces
      .replace(/;\s*/g, ';') // Spaces after semicolons
      .replace(/\s*}\s*/g, '}') // Spaces around closing braces
      .replace(/\s*,\s*/g, ',') // Spaces around commas
      .replace(/\s*:\s*/g, ':') // Spaces around colons
      .trim();
  }

  // Remove unused CSS rules based on used components
  private removeUnusedRules(css: string, usedComponents: string[]): string {
    const componentSelectors = new Set<string>();
    
    // Build component selector patterns
    usedComponents.forEach(component => {
      componentSelectors.add(`.${component}`);
      componentSelectors.add(`[class*="${component}"]`);
      componentSelectors.add(`#${component}`);
    });

    // Parse CSS rules and keep only used ones
    const rules = this.parseCSS(css);
    const usedRules = rules.filter(rule => {
      if (rule.type === 'rule') {
        return rule.selectors.some(selector => 
          this.isSelectorUsed(selector, componentSelectors)
        );
      }
      return true; // Keep non-rule declarations (imports, media queries, etc.)
    });

    return this.stringifyRules(usedRules);
  }

  // Check if a selector is used
  private isSelectorUsed(selector: string, usedSelectors: Set<string>): boolean {
    // Always keep base element selectors
    if (/^(html|body|a|p|h[1-6]|ul|ol|li|div|span|img|button|input|form)(\s|$|:|\.|\[|#)/.test(selector)) {
      return true;
    }

    // Check if selector matches any used component
    for (const usedSelector of usedSelectors) {
      if (selector.includes(usedSelector.slice(1))) { // Remove the '.' prefix
        return true;
      }
    }

    return false;
  }

  // Optimize CSS selectors
  private optimizeSelectors(css: string): string {
    return css
      .replace(/\s*>\s*/g, '>') // Remove spaces around child combinators
      .replace(/\s*\+\s*/g, '+') // Remove spaces around adjacent sibling combinators
      .replace(/\s*~\s*/g, '~') // Remove spaces around general sibling combinators
      .replace(/\s*\|\s*/g, '|'); // Remove spaces around namespace separators
  }

  // Extract critical CSS (above-the-fold styles)
  private extractCriticalCSS(css: string): string {
    const rules = this.parseCSS(css);
    const criticalRules: string[] = [];
    const nonCriticalRules: string[] = [];

    rules.forEach(rule => {
      if (rule.type === 'rule') {
        const isCritical = rule.selectors.some(selector =>
          this.config.criticalCSS.prioritizeComponents.some(component =>
            selector.includes(component)
          )
        );

        if (isCritical) {
          criticalRules.push(this.stringifyRule(rule));
        } else {
          nonCriticalRules.push(this.stringifyRule(rule));
        }
      } else {
        criticalRules.push(this.stringifyRule(rule));
      }
    });

    // For AMP, we need to inline all CSS, so we combine critical and non-critical
    // In a real implementation, you might want to prioritize critical CSS ordering
    return [...criticalRules, ...nonCriticalRules].join('');
  }

  // Validate AMP-specific CSS rules
  private validateAMPRules(css: string): { isValid: boolean; warnings: string[] } {
    const warnings: string[] = [];

    // Check for forbidden properties
    const forbiddenProperties = [
      'behavior',
      '-moz-binding',
      'filter\\s*:.*\\burl\\(',
      'zoom',
    ];

    forbiddenProperties.forEach(property => {
      const regex = new RegExp(property, 'gi');
      if (regex.test(css)) {
        warnings.push(`Forbidden AMP CSS property detected: ${property}`);
      }
    });

    // Check for forbidden selectors
    const forbiddenSelectors = [
      '\\*', // Universal selector (performance)
      'amp-', // AMP component selectors (should use attribute selectors)
    ];

    forbiddenSelectors.forEach(selector => {
      const regex = new RegExp(selector, 'g');
      if (regex.test(css)) {
        warnings.push(`Potentially problematic AMP CSS selector: ${selector}`);
      }
    });

    // Check for !important usage (discouraged in AMP)
    if (css.includes('!important')) {
      warnings.push('!important declarations should be minimized in AMP');
    }

    // Check for external resources
    if (css.includes('url(') && css.includes('http')) {
      warnings.push('External resources in CSS are not allowed in AMP');
    }

    return {
      isValid: warnings.length === 0,
      warnings,
    };
  }

  // Aggressive optimization for size reduction
  private aggressiveOptimization(css: string): string {
    return css
      .replace(/0px/g, '0') // Remove px from 0 values
      .replace(/0em/g, '0') // Remove em from 0 values
      .replace(/0rem/g, '0') // Remove rem from 0 values
      .replace(/0%/g, '0') // Remove % from 0 values
      .replace(/0 0 0 0/g, '0') // Shorthand margins/padding
      .replace(/(\w)\s+(\w)/g, '$1 $2') // Minimize spaces in values
      .replace(/;\s*}/g, '}') // Remove last semicolon before closing brace
      .replace(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/g, (match, r, g, b) => {
        // Convert RGB to hex when shorter
        const hex = '#' + 
          parseInt(r).toString(16).padStart(2, '0') +
          parseInt(g).toString(16).padStart(2, '0') +
          parseInt(b).toString(16).padStart(2, '0');
        return hex.length <= match.length ? hex : match;
      });
  }

  // Simple CSS parser (for basic rule extraction)
  private parseCSS(css: string): Array<{
    type: string;
    selectors: string[];
    declarations: string;
    media?: string;
  }> {
    const rules: Array<any> = [];
    const ruleRegex = /([^{]+)\{([^}]*)\}/g;
    let match;

    while ((match = ruleRegex.exec(css)) !== null) {
      const selectors = match[1].split(',').map(s => s.trim());
      const declarations = match[2].trim();
      
      rules.push({
        type: 'rule',
        selectors,
        declarations,
      });
    }

    return rules;
  }

  // Convert rules back to CSS string
  private stringifyRules(rules: Array<any>): string {
    return rules.map(rule => this.stringifyRule(rule)).join('');
  }

  private stringifyRule(rule: any): string {
    if (rule.type === 'rule') {
      return `${rule.selectors.join(',')}{${rule.declarations}}`;
    }
    return rule.css || '';
  }
}

// AMP-specific CSS utilities
export const AMPCSSUtils = {
  // Generate AMP-compliant CSS custom properties
  generateCustomProperties(theme: Record<string, string>): string {
    const properties = Object.entries(theme)
      .map(([key, value]) => `--${key}: ${value};`)
      .join('');
    
    return `:root{${properties}}`;
  },

  // Generate responsive CSS using AMP layout system
  generateResponsiveCSS(breakpoints: Record<string, number>): string {
    return Object.entries(breakpoints)
      .map(([name, width]) => 
        `@media (min-width: ${width}px) { .${name}\\:block { display: block; } }`
      )
      .join('');
  },

  // Generate AMP animation CSS
  generateAnimationCSS(): string {
    return `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes slideInUp {
        from { transform: translateY(30px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      
      .amp-animate-fade { animation: fadeIn 0.5s ease-out; }
      .amp-animate-slide { animation: slideInUp 0.6s ease-out; }
    `;
  },

  // Validate CSS size for AMP
  validateSize(css: string): { isValid: boolean; size: number; maxSize: number } {
    const size = new Blob([css]).size;
    const maxSize = 75000; // 75KB AMP limit
    
    return {
      isValid: size <= maxSize,
      size,
      maxSize,
    };
  },

  // Extract critical CSS for AMP
  extractCritical(css: string, criticalSelectors: string[]): string {
    const rules = css.match(/[^{}]+\{[^}]*\}/g) || [];
    
    const criticalRules = rules.filter(rule => {
      const selector = rule.split('{')[0].trim();
      return criticalSelectors.some(critical => 
        selector.includes(critical)
      );
    });
    
    return criticalRules.join('');
  },
};

// Pre-built AMP CSS components
export const AMPCSSComponents = {
  // Base reset and typography
  base: `
    *,*::before,*::after{box-sizing:border-box;}
    html{line-height:1.15;-webkit-text-size-adjust:100%;}
    body{margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;}
    h1,h2,h3,h4,h5,h6{margin:0;font-weight:600;}
    p{margin:0 0 1rem 0;}
    a{color:#2563eb;text-decoration:none;}
    a:hover{text-decoration:underline;}
    img{max-width:100%;height:auto;}
  `,

  // Layout utilities
  layout: `
    .container{max-width:1200px;margin:0 auto;padding:0 1rem;}
    .flex{display:flex;}
    .flex-col{flex-direction:column;}
    .items-center{align-items:center;}
    .justify-center{justify-content:center;}
    .justify-between{justify-content:space-between;}
    .text-center{text-align:center;}
    .w-full{width:100%;}
    .h-full{height:100%;}
  `,

  // Component styles
  components: `
    .btn{display:inline-block;padding:0.75rem 1.5rem;border-radius:0.5rem;font-weight:600;text-align:center;cursor:pointer;border:none;}
    .btn-primary{background:#2563eb;color:white;}
    .btn-primary:hover{background:#1d4ed8;}
    .card{background:white;border-radius:0.75rem;box-shadow:0 1px 3px rgba(0,0,0,0.1);padding:1.5rem;}
    .badge{display:inline-block;padding:0.25rem 0.75rem;border-radius:9999px;font-size:0.875rem;font-weight:500;}
  `,

  // Responsive utilities
  responsive: `
    @media (max-width: 767px) {
      .md\\:hidden{display:none;}
      .container{padding:0 0.5rem;}
    }
    @media (min-width: 768px) {
      .md\\:block{display:block;}
      .md\\:flex{display:flex;}
      .md\\:grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr));}
    }
    @media (min-width: 1024px) {
      .lg\\:grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr));}
      .lg\\:text-xl{font-size:1.25rem;}
    }
  `,
};

// Build final AMP CSS
export function buildAMPCSS(options: {
  includeBase?: boolean;
  includeLayout?: boolean;
  includeComponents?: boolean;
  includeResponsive?: boolean;
  customCSS?: string;
  optimize?: boolean;
} = {}): string {
  const {
    includeBase = true,
    includeLayout = true,
    includeComponents = true,
    includeResponsive = true,
    customCSS = '',
    optimize = true,
  } = options;

  let css = '';

  if (includeBase) css += AMPCSSComponents.base;
  if (includeLayout) css += AMPCSSComponents.layout;
  if (includeComponents) css += AMPCSSComponents.components;
  if (includeResponsive) css += AMPCSSComponents.responsive;
  
  css += customCSS;

  if (optimize) {
    const optimizer = new AMPCSSOptimizer();
    const result = optimizer.optimize(css);
    
    if (result.warnings.length > 0) {
      console.warn('AMP CSS warnings:', result.warnings);
    }
    
    return result.optimizedCSS;
  }

  return css;
}