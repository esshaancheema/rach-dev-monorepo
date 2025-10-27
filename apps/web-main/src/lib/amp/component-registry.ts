// AMP component registry and dependency management

export interface AMPComponentConfig {
  name: string;
  script: string;
  version: string;
  dependencies?: string[];
  customElement?: string;
  template?: boolean;
}

// Registry of all available AMP components
export const AMP_COMPONENTS: Record<string, AMPComponentConfig> = {
  // Core AMP runtime (always included)
  'amp-runtime': {
    name: 'AMP Runtime',
    script: 'https://cdn.ampproject.org/v0.js',
    version: '0.1',
  },

  // Extended components
  'amp-img': {
    name: 'AMP Image',
    script: 'https://cdn.ampproject.org/v0/amp-img-0.1.js',
    version: '0.1',
    customElement: 'amp-img',
  },

  'amp-video': {
    name: 'AMP Video',
    script: 'https://cdn.ampproject.org/v0/amp-video-0.1.js',
    version: '0.1',
    customElement: 'amp-video',
  },

  'amp-youtube': {
    name: 'AMP YouTube',
    script: 'https://cdn.ampproject.org/v0/amp-youtube-0.1.js',
    version: '0.1',
    customElement: 'amp-youtube',
  },

  'amp-vimeo': {
    name: 'AMP Vimeo',
    script: 'https://cdn.ampproject.org/v0/amp-vimeo-0.1.js',
    version: '0.1',
    customElement: 'amp-vimeo',
  },

  'amp-carousel': {
    name: 'AMP Carousel',
    script: 'https://cdn.ampproject.org/v0/amp-carousel-0.1.js',
    version: '0.1',
    customElement: 'amp-carousel',
  },

  'amp-sidebar': {
    name: 'AMP Sidebar',
    script: 'https://cdn.ampproject.org/v0/amp-sidebar-0.1.js',
    version: '0.1',
    customElement: 'amp-sidebar',
  },

  'amp-accordion': {
    name: 'AMP Accordion',
    script: 'https://cdn.ampproject.org/v0/amp-accordion-0.1.js',
    version: '0.1',
    customElement: 'amp-accordion',
  },

  'amp-form': {
    name: 'AMP Form',
    script: 'https://cdn.ampproject.org/v0/amp-form-0.1.js',
    version: '0.1',
    customElement: 'amp-form',
  },

  'amp-social-share': {
    name: 'AMP Social Share',
    script: 'https://cdn.ampproject.org/v0/amp-social-share-0.1.js',
    version: '0.1',
    customElement: 'amp-social-share',
  },

  'amp-analytics': {
    name: 'AMP Analytics',
    script: 'https://cdn.ampproject.org/v0/amp-analytics-0.1.js',
    version: '0.1',
    customElement: 'amp-analytics',
  },

  'amp-lightbox': {
    name: 'AMP Lightbox',
    script: 'https://cdn.ampproject.org/v0/amp-lightbox-0.1.js',
    version: '0.1',
    customElement: 'amp-lightbox',
  },

  'amp-animation': {
    name: 'AMP Animation',
    script: 'https://cdn.ampproject.org/v0/amp-animation-0.1.js',
    version: '0.1',
    customElement: 'amp-animation',
  },

  'amp-bind': {
    name: 'AMP Bind',
    script: 'https://cdn.ampproject.org/v0/amp-bind-0.1.js',
    version: '0.1',
    customElement: 'amp-bind',
  },

  'amp-list': {
    name: 'AMP List',
    script: 'https://cdn.ampproject.org/v0/amp-list-0.1.js',
    version: '0.1',
    customElement: 'amp-list',
    dependencies: ['amp-mustache'],
  },

  'amp-mustache': {
    name: 'AMP Mustache',
    script: 'https://cdn.ampproject.org/v0/amp-mustache-0.2.js',
    version: '0.2',
    template: true,
  },

  'amp-fit-text': {
    name: 'AMP Fit Text',
    script: 'https://cdn.ampproject.org/v0/amp-fit-text-0.1.js',
    version: '0.1',
    customElement: 'amp-fit-text',
  },

  'amp-timeago': {
    name: 'AMP Timeago',
    script: 'https://cdn.ampproject.org/v0/amp-timeago-0.1.js',
    version: '0.1',
    customElement: 'amp-timeago',
  },

  'amp-call-tracking': {
    name: 'AMP Call Tracking',
    script: 'https://cdn.ampproject.org/v0/amp-call-tracking-0.1.js',
    version: '0.1',
    customElement: 'amp-call-tracking',
  },

  'amp-iframe': {
    name: 'AMP Iframe',
    script: 'https://cdn.ampproject.org/v0/amp-iframe-0.1.js',
    version: '0.1',
    customElement: 'amp-iframe',
  },

  'amp-auto-ads': {
    name: 'AMP Auto Ads',
    script: 'https://cdn.ampproject.org/v0/amp-auto-ads-0.1.js',
    version: '0.1',
    customElement: 'amp-auto-ads',
  },

  'amp-sticky-ad': {
    name: 'AMP Sticky Ad',
    script: 'https://cdn.ampproject.org/v0/amp-sticky-ad-1.0.js',
    version: '1.0',
    customElement: 'amp-sticky-ad',
  },

  'amp-access': {
    name: 'AMP Access',
    script: 'https://cdn.ampproject.org/v0/amp-access-0.1.js',
    version: '0.1',
    customElement: 'amp-access',
  },

  'amp-subscriptions': {
    name: 'AMP Subscriptions',
    script: 'https://cdn.ampproject.org/v0/amp-subscriptions-0.1.js',
    version: '0.1',
    customElement: 'amp-subscriptions',
  },

  'amp-consent': {
    name: 'AMP Consent',
    script: 'https://cdn.ampproject.org/v0/amp-consent-0.1.js',
    version: '0.1',
    customElement: 'amp-consent',
  },

  'amp-geo': {
    name: 'AMP Geo',
    script: 'https://cdn.ampproject.org/v0/amp-geo-0.1.js',
    version: '0.1',
    customElement: 'amp-geo',
  },

  'amp-experiment': {
    name: 'AMP Experiment',
    script: 'https://cdn.ampproject.org/v0/amp-experiment-0.1.js',
    version: '0.1',
    customElement: 'amp-experiment',
  },
};

// Component usage tracking
export class AMPComponentRegistry {
  private usedComponents: Set<string> = new Set();
  private pageComponents: Map<string, Set<string>> = new Map();

  // Register component usage for a page
  registerComponent(componentName: string, pageId?: string): void {
    this.usedComponents.add(componentName);
    
    if (pageId) {
      if (!this.pageComponents.has(pageId)) {
        this.pageComponents.set(pageId, new Set());
      }
      this.pageComponents.get(pageId)!.add(componentName);
    }

    // Register dependencies
    const component = AMP_COMPONENTS[componentName];
    if (component?.dependencies) {
      component.dependencies.forEach(dep => {
        this.usedComponents.add(dep);
        if (pageId) {
          this.pageComponents.get(pageId)!.add(dep);
        }
      });
    }
  }

  // Get all required scripts for used components
  getRequiredScripts(): string[] {
    const scripts: string[] = [];
    
    // Always include the runtime
    scripts.push(AMP_COMPONENTS['amp-runtime'].script);
    
    // Add scripts for used components
    this.usedComponents.forEach(componentName => {
      const component = AMP_COMPONENTS[componentName];
      if (component && componentName !== 'amp-runtime') {
        scripts.push(component.script);
      }
    });

    return scripts;
  }

  // Get required scripts for a specific page
  getPageScripts(pageId: string): string[] {
    const scripts: string[] = [];
    const pageComponents = this.pageComponents.get(pageId);
    
    if (!pageComponents) return scripts;

    // Always include the runtime
    scripts.push(AMP_COMPONENTS['amp-runtime'].script);

    // Add scripts for page components
    pageComponents.forEach(componentName => {
      const component = AMP_COMPONENTS[componentName];
      if (component && componentName !== 'amp-runtime') {
        scripts.push(component.script);
      }
    });

    return scripts;
  }

  // Get custom elements for used components
  getCustomElements(): string[] {
    const elements: string[] = [];
    
    this.usedComponents.forEach(componentName => {
      const component = AMP_COMPONENTS[componentName];
      if (component?.customElement) {
        elements.push(component.customElement);
      }
    });

    return elements;
  }

  // Check if a component is available
  isComponentAvailable(componentName: string): boolean {
    return componentName in AMP_COMPONENTS;
  }

  // Get component configuration
  getComponentConfig(componentName: string): AMPComponentConfig | null {
    return AMP_COMPONENTS[componentName] || null;
  }

  // Clear registry (useful for testing or resetting)
  clear(): void {
    this.usedComponents.clear();
    this.pageComponents.clear();
  }

  // Get usage statistics
  getUsageStats(): {
    totalComponents: number;
    usedComponents: number;
    componentUsage: Record<string, number>;
    pageCount: number;
  } {
    const componentUsage: Record<string, number> = {};
    
    this.pageComponents.forEach(components => {
      components.forEach(component => {
        componentUsage[component] = (componentUsage[component] || 0) + 1;
      });
    });

    return {
      totalComponents: Object.keys(AMP_COMPONENTS).length,
      usedComponents: this.usedComponents.size,
      componentUsage,
      pageCount: this.pageComponents.size,
    };
  }

  // Validate component compatibility
  validateComponents(): { valid: boolean; issues: string[] } {
    const issues: string[] = [];
    
    this.usedComponents.forEach(componentName => {
      const component = AMP_COMPONENTS[componentName];
      
      if (!component) {
        issues.push(`Unknown component: ${componentName}`);
        return;
      }

      // Check dependencies
      if (component.dependencies) {
        component.dependencies.forEach(dep => {
          if (!this.usedComponents.has(dep)) {
            issues.push(`Missing dependency "${dep}" for component "${componentName}"`);
          }
        });
      }
    });

    return {
      valid: issues.length === 0,
      issues,
    };
  }
}

// Global registry instance
export const ampRegistry = new AMPComponentRegistry();

// Helper functions for component management
export const AMPComponentUtils = {
  // Auto-register components based on page content
  autoRegisterFromContent(content: string, pageId?: string): void {
    const componentRegex = /<(amp-[\w-]+)/g;
    let match;
    
    while ((match = componentRegex.exec(content)) !== null) {
      const componentName = match[1];
      if (ampRegistry.isComponentAvailable(componentName)) {
        ampRegistry.registerComponent(componentName, pageId);
      }
    }
  },

  // Generate script tags for head
  generateScriptTags(pageId?: string): React.ReactElement[] {
    const scripts = pageId 
      ? ampRegistry.getPageScripts(pageId)
      : ampRegistry.getRequiredScripts();
    
    return scripts.map((src, index) => {
      const isRuntime = src.includes('/v0.js');
      return React.createElement('script', {
        key: src,
        async: true,
        src,
        ...(isRuntime ? {} : { 'custom-element': true }),
      });
    });
  },

  // Check if page needs AMP runtime
  needsAMPRuntime(content: string): boolean {
    return /<amp-/.test(content) || content.includes('⚡');
  },

  // Get component dependencies
  getComponentDependencies(componentName: string): string[] {
    const component = AMP_COMPONENTS[componentName];
    return component?.dependencies || [];
  },

  // Validate AMP page
  validateAMPPage(html: string): {
    isValid: boolean;
    hasAMPAttribute: boolean;
    hasRequiredScripts: boolean;
    missingComponents: string[];
    issues: string[];
  } {
    const hasAMPAttribute = /(<html[^>]*⚡|<html[^>]*amp)/i.test(html);
    const hasRequiredScripts = html.includes('cdn.ampproject.org/v0.js');
    
    // Find all AMP components in HTML
    const foundComponents = new Set<string>();
    const componentRegex = /<(amp-[\w-]+)/g;
    let match;
    
    while ((match = componentRegex.exec(html)) !== null) {
      foundComponents.add(match[1]);
    }
    
    // Check for missing component scripts
    const missingComponents: string[] = [];
    foundComponents.forEach(component => {
      const scriptPattern = new RegExp(`${component}-[\\d.]+\\.js`);
      if (!scriptPattern.test(html) && component !== 'amp-img') {
        missingComponents.push(component);
      }
    });
    
    const issues: string[] = [];
    if (!hasAMPAttribute) issues.push('Missing AMP attribute on <html> tag');
    if (!hasRequiredScripts) issues.push('Missing AMP runtime script');
    if (missingComponents.length > 0) {
      issues.push(`Missing component scripts: ${missingComponents.join(', ')}`);
    }
    
    return {
      isValid: issues.length === 0,
      hasAMPAttribute,
      hasRequiredScripts,
      missingComponents,
      issues,
    };
  },
};

// Predefined component sets for common page types
export const AMP_PAGE_COMPONENTS = {
  blog: [
    'amp-img',
    'amp-social-share',
    'amp-analytics',
    'amp-sidebar',
    'amp-form',
  ],
  
  ecommerce: [
    'amp-img',
    'amp-carousel',
    'amp-form',
    'amp-list',
    'amp-mustache',
    'amp-bind',
    'amp-analytics',
  ],
  
  news: [
    'amp-img',
    'amp-video',
    'amp-social-share',
    'amp-analytics',
    'amp-sticky-ad',
    'amp-access',
  ],
  
  landing: [
    'amp-img',
    'amp-video',
    'amp-form',
    'amp-analytics',
    'amp-animation',
    'amp-fit-text',
  ],
  
  minimal: [
    'amp-img',
    'amp-analytics',
  ],
};

// Register components for page type
export function registerPageComponents(pageType: keyof typeof AMP_PAGE_COMPONENTS, pageId?: string): void {
  const components = AMP_PAGE_COMPONENTS[pageType];
  components.forEach(component => {
    ampRegistry.registerComponent(component, pageId);
  });
}