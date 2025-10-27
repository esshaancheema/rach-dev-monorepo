// AMP analytics integration for tracking and conversion optimization

import React from 'react';

export interface AMPAnalyticsConfig {
  type: 'googleanalytics' | 'gtag' | 'googleanalytics4' | 'custom';
  trackingId?: string;
  measurementId?: string;
  customConfig?: Record<string, any>;
  triggers?: AMPAnalyticsTrigger[];
  requests?: Record<string, string>;
  vars?: Record<string, any>;
  extraUrlParams?: Record<string, string>;
  transport?: {
    beacon?: boolean;
    xhrpost?: boolean;
    image?: boolean;
  };
}

export interface AMPAnalyticsTrigger {
  on: 'visible' | 'click' | 'scroll' | 'timer' | 'video-play' | 'video-pause' | 'video-ended' | 'form-submit' | 'amp-story-page-visible' | 'custom';
  request: string;
  selector?: string;
  scrollSpec?: {
    verticalBoundaries: number[];
    horizontalBoundaries?: number[];
  };
  timerSpec?: {
    interval: number;
    maxTimerLength?: number;
  };
  videoSpec?: {
    percentages: number[];
  };
  vars?: Record<string, any>;
  extraUrlParams?: Record<string, string>;
  enabled?: boolean;
}

export interface AMPConversionTracking {
  conversionId: string;
  conversionLabel: string;
  conversionValue?: number;
  conversionCurrency?: string;
  remarketing?: boolean;
}

export interface AMPEcommerceTracking {
  purchase: {
    transactionId: string;
    affiliation?: string;
    value: number;
    currency: string;
    items: Array<{
      itemId: string;
      itemName: string;
      category?: string;
      quantity: number;
      price: number;
    }>;
  };
}

export class AMPAnalyticsManager {
  private configs: Map<string, AMPAnalyticsConfig> = new Map();
  private globalVars: Record<string, any> = {};

  // Add analytics configuration
  addConfig(id: string, config: AMPAnalyticsConfig): void {
    this.configs.set(id, config);
  }

  // Set global variables
  setGlobalVars(vars: Record<string, any>): void {
    this.globalVars = { ...this.globalVars, ...vars };
  }

  // Generate Google Analytics 4 configuration
  createGA4Config(measurementId: string, options: {
    enableEnhancedMeasurement?: boolean;
    customDimensions?: Record<string, string>;
    customMetrics?: Record<string, number>;
    conversionEvents?: string[];
  } = {}): AMPAnalyticsConfig {
    const config: AMPAnalyticsConfig = {
      type: 'gtag',
      measurementId,
      vars: {
        'gtag_id': measurementId,
        ...options.customDimensions,
        ...this.globalVars,
      },
      triggers: [
        {
          on: 'visible',
          request: 'pageview',
          vars: {
            event_name: 'page_view',
            page_title: '${title}',
            page_location: '${canonicalUrl}',
          },
        },
        {
          on: 'click',
          request: 'event',
          selector: 'a[href]',
          vars: {
            event_name: 'click',
            event_category: 'engagement',
            event_label: '${clickUrl}',
          },
        },
        {
          on: 'scroll',
          request: 'event',
          scrollSpec: {
            verticalBoundaries: [10, 25, 50, 75, 90],
          },
          vars: {
            event_name: 'scroll',
            event_category: 'engagement',
            percent_scrolled: '${verticalScrollBoundary}',
          },
        },
      ],
    };

    // Add enhanced measurement events
    if (options.enableEnhancedMeasurement) {
      config.triggers?.push(
        {
          on: 'click',
          request: 'event',
          selector: 'a[href^="mailto:"]',
          vars: {
            event_name: 'email_click',
            event_category: 'engagement',
            event_label: '${clickUrl}',
          },
        },
        {
          on: 'click',
          request: 'event',
          selector: 'a[href^="tel:"]',
          vars: {
            event_name: 'phone_click',
            event_category: 'engagement',
            event_label: '${clickUrl}',
          },
        },
        {
          on: 'click',
          request: 'event',
          selector: 'a[download]',
          vars: {
            event_name: 'file_download',
            event_category: 'engagement',
            event_label: '${clickUrl}',
          },
        }
      );
    }

    // Add conversion events
    if (options.conversionEvents) {
      options.conversionEvents.forEach(eventName => {
        config.triggers?.push({
          on: 'click',
          request: 'event',
          selector: `[data-conversion="${eventName}"]`,
          vars: {
            event_name: eventName,
            event_category: 'conversion',
          },
        });
      });
    }

    return config;
  }

  // Generate Universal Analytics configuration
  createUAConfig(trackingId: string, options: {
    customDimensions?: Record<string, string>;
    customMetrics?: Record<string, number>;
    enhancedLinkAttribution?: boolean;
    anonymizeIp?: boolean;
  } = {}): AMPAnalyticsConfig {
    return {
      type: 'googleanalytics',
      trackingId,
      vars: {
        account: trackingId,
        ...options.customDimensions,
        ...this.globalVars,
      },
      triggers: [
        {
          on: 'visible',
          request: 'pageview',
        },
        {
          on: 'click',
          request: 'event',
          selector: 'a[href]',
          vars: {
            eventCategory: 'Outbound Link',
            eventAction: 'click',
            eventLabel: '${clickUrl}',
          },
        },
        {
          on: 'scroll',
          request: 'event',
          scrollSpec: {
            verticalBoundaries: [25, 50, 75, 100],
          },
          vars: {
            eventCategory: 'Scroll Tracking',
            eventAction: 'scroll',
            eventLabel: '${verticalScrollBoundary}%',
          },
        },
      ],
      extraUrlParams: {
        aip: options.anonymizeIp ? '1' : '0',
        linkid: options.enhancedLinkAttribution ? '1' : '0',
      },
    };
  }

  // Create custom analytics configuration
  createCustomConfig(options: {
    requests: Record<string, string>;
    triggers: AMPAnalyticsTrigger[];
    vars?: Record<string, any>;
    transport?: AMPAnalyticsConfig['transport'];
  }): AMPAnalyticsConfig {
    return {
      type: 'custom',
      requests: options.requests,
      triggers: options.triggers,
      vars: { ...this.globalVars, ...options.vars },
      transport: options.transport || { beacon: true },
    };
  }

  // Track ecommerce events
  createEcommerceTracking(config: AMPEcommerceTracking): AMPAnalyticsTrigger[] {
    return [
      {
        on: 'click',
        request: 'event',
        selector: '[data-ecommerce="purchase"]',
        vars: {
          event_name: 'purchase',
          event_category: 'ecommerce',
          transaction_id: config.purchase.transactionId,
          value: config.purchase.value,
          currency: config.purchase.currency,
          items: JSON.stringify(config.purchase.items),
        },
      },
      {
        on: 'click',
        request: 'event',
        selector: '[data-ecommerce="add_to_cart"]',
        vars: {
          event_name: 'add_to_cart',
          event_category: 'ecommerce',
          currency: config.purchase.currency,
        },
      },
      {
        on: 'click',
        request: 'event',
        selector: '[data-ecommerce="begin_checkout"]',
        vars: {
          event_name: 'begin_checkout',
          event_category: 'ecommerce',
          currency: config.purchase.currency,
        },
      },
    ];
  }

  // Track form interactions
  createFormTracking(): AMPAnalyticsTrigger[] {
    return [
      {
        on: 'click',
        request: 'event',
        selector: 'input[type="text"], input[type="email"], textarea',
        vars: {
          event_name: 'form_start',
          event_category: 'form',
          form_name: '${formName}',
        },
      },
      {
        on: 'form-submit',
        request: 'event',
        selector: 'form',
        vars: {
          event_name: 'form_submit',
          event_category: 'form',
          form_name: '${formName}',
        },
      },
    ];
  }

  // Track video interactions
  createVideoTracking(): AMPAnalyticsTrigger[] {
    return [
      {
        on: 'video-play',
        request: 'event',
        videoSpec: {
          percentages: [0],
        },
        vars: {
          event_name: 'video_start',
          event_category: 'video',
          video_title: '${videoTitle}',
        },
      },
      {
        on: 'video-play',
        request: 'event',
        videoSpec: {
          percentages: [25, 50, 75],
        },
        vars: {
          event_name: 'video_progress',
          event_category: 'video',
          video_title: '${videoTitle}',
          percent_watched: '${videoPlayedPercentage}',
        },
      },
      {
        on: 'video-ended',
        request: 'event',
        vars: {
          event_name: 'video_complete',
          event_category: 'video',
          video_title: '${videoTitle}',
        },
      },
    ];
  }

  // Track social media interactions
  createSocialTracking(): AMPAnalyticsTrigger[] {
    return [
      {
        on: 'click',
        request: 'event',
        selector: 'amp-social-share[type="twitter"]',
        vars: {
          event_name: 'share',
          event_category: 'social',
          method: 'twitter',
          content_type: 'article',
        },
      },
      {
        on: 'click',
        request: 'event',
        selector: 'amp-social-share[type="facebook"]',
        vars: {
          event_name: 'share',
          event_category: 'social',
          method: 'facebook',
          content_type: 'article',
        },
      },
      {
        on: 'click',
        request: 'event',
        selector: 'amp-social-share[type="linkedin"]',
        vars: {
          event_name: 'share',
          event_category: 'social',
          method: 'linkedin',
          content_type: 'article',
        },
      },
    ];
  }

  // Generate analytics script for AMP page
  generateAnalyticsScript(configId: string): string {
    const config = this.configs.get(configId);
    if (!config) {
      throw new Error(`Analytics config with id "${configId}" not found`);
    }

    const analyticsConfig = {
      vars: config.vars || {},
      requests: config.requests || {},
      triggers: config.triggers || [],
      transport: config.transport || { beacon: true },
      extraUrlParams: config.extraUrlParams || {},
    };

    return JSON.stringify(analyticsConfig, null, 2);
  }

  // Get all configurations
  getAllConfigs(): Map<string, AMPAnalyticsConfig> {
    return new Map(this.configs);
  }

  // Clear all configurations
  clearConfigs(): void {
    this.configs.clear();
  }
}

// React component for AMP Analytics
export interface AMPAnalyticsComponentProps {
  config: AMPAnalyticsConfig;
  className?: string;
}

export function AMPAnalyticsComponent({
  config,
  className = '',
}: AMPAnalyticsComponentProps) {
  const analyticsConfig = {
    vars: config.vars || {},
    requests: config.requests || {},
    triggers: config.triggers || [],
    transport: config.transport || { beacon: true },
    extraUrlParams: config.extraUrlParams || {},
  };

  return React.createElement('amp-analytics', {
    type: config.type,
    'data-credentials': 'include',
    className,
  }, React.createElement('script', {
    type: 'application/json',
    dangerouslySetInnerHTML: {
      __html: JSON.stringify(analyticsConfig),
    },
  }));
}

// Conversion tracking component
export interface AMPConversionTrackingProps {
  conversionId: string;
  conversionLabel: string;
  conversionValue?: number;
  conversionCurrency?: string;
  className?: string;
}

export function AMPConversionTracking({
  conversionId,
  conversionLabel,
  conversionValue,
  conversionCurrency = 'USD',
  className = '',
}: AMPConversionTrackingProps) {
  const config = {
    vars: {
      gtag_id: conversionId,
      config: {
        [conversionId]: {
          conversion_label: conversionLabel,
          conversion_value: conversionValue,
          conversion_currency: conversionCurrency,
        },
      },
    },
    triggers: [{
      on: 'visible',
      request: 'conversion',
    }],
  };

  return React.createElement('amp-analytics', {
    type: 'gtag',
    className,
  }, React.createElement('script', {
    type: 'application/json',
    dangerouslySetInnerHTML: {
      __html: JSON.stringify(config),
    },
  }));
}

// Predefined analytics configurations for common use cases
export const AMPAnalyticsPresets = {
  // Blog analytics with content tracking
  blog: (measurementId: string) => {
    const manager = new AMPAnalyticsManager();
    return manager.createGA4Config(measurementId, {
      enableEnhancedMeasurement: true,
      customDimensions: {
        content_group1: 'Blog',
        content_group2: '${postCategory}',
        content_group3: '${postTags}',
      },
    });
  },

  // E-commerce analytics
  ecommerce: (measurementId: string) => {
    const manager = new AMPAnalyticsManager();
    const config = manager.createGA4Config(measurementId, {
      enableEnhancedMeasurement: true,
      conversionEvents: ['purchase', 'add_to_cart', 'begin_checkout'],
    });

    // Add ecommerce triggers
    config.triggers?.push(
      ...manager.createEcommerceTracking({
        purchase: {
          transactionId: '${transactionId}',
          value: 0,
          currency: 'USD',
          items: [],
        },
      })
    );

    return config;
  },

  // Lead generation analytics
  leadGen: (measurementId: string) => {
    const manager = new AMPAnalyticsManager();
    const config = manager.createGA4Config(measurementId, {
      enableEnhancedMeasurement: true,
      conversionEvents: ['generate_lead', 'contact', 'sign_up'],
    });

    // Add form tracking
    config.triggers?.push(...manager.createFormTracking());

    return config;
  },

  // Media/content analytics
  media: (measurementId: string) => {
    const manager = new AMPAnalyticsManager();
    const config = manager.createGA4Config(measurementId, {
      enableEnhancedMeasurement: true,
    });

    // Add video and social tracking
    config.triggers?.push(
      ...manager.createVideoTracking(),
      ...manager.createSocialTracking()
    );

    return config;
  },
};

// Analytics utilities for common tracking scenarios
export const AMPAnalyticsUtils = {
  // Create CTA tracking
  createCTATracking(ctaName: string): AMPAnalyticsTrigger {
    return {
      on: 'click',
      request: 'event',
      selector: `[data-cta="${ctaName}"]`,
      vars: {
        event_name: 'cta_click',
        event_category: 'engagement',
        cta_name: ctaName,
      },
    };
  },

  // Create newsletter signup tracking
  createNewsletterTracking(): AMPAnalyticsTrigger {
    return {
      on: 'form-submit',
      request: 'event',
      selector: '[data-form="newsletter"]',
      vars: {
        event_name: 'newsletter_signup',
        event_category: 'conversion',
      },
    };
  },

  // Create contact form tracking
  createContactFormTracking(): AMPAnalyticsTrigger {
    return {
      on: 'form-submit',
      request: 'event',
      selector: '[data-form="contact"]',
      vars: {
        event_name: 'contact_form_submit',
        event_category: 'conversion',
      },
    };
  },

  // Create download tracking
  createDownloadTracking(fileType: string): AMPAnalyticsTrigger {
    return {
      on: 'click',
      request: 'event',
      selector: `a[href$=".${fileType}"]`,
      vars: {
        event_name: 'file_download',
        event_category: 'engagement',
        file_type: fileType,
        file_name: '${clickUrl}',
      },
    };
  },

  // Create outbound link tracking
  createOutboundTracking(): AMPAnalyticsTrigger {
    return {
      on: 'click',
      request: 'event',
      selector: 'a[href^="http"]:not([href*="${canonicalHost}"])',
      vars: {
        event_name: 'outbound_click',
        event_category: 'engagement',
        outbound_url: '${clickUrl}',
      },
    };
  },

  // Create scroll depth tracking
  createScrollTracking(milestones: number[] = [25, 50, 75, 90]): AMPAnalyticsTrigger {
    return {
      on: 'scroll',
      request: 'event',
      scrollSpec: {
        verticalBoundaries: milestones,
      },
      vars: {
        event_name: 'scroll_depth',
        event_category: 'engagement',
        scroll_depth: '${verticalScrollBoundary}',
      },
    };
  },

  // Create time on page tracking
  createTimeTracking(intervals: number[] = [30, 60, 120, 300]): AMPAnalyticsTrigger[] {
    return intervals.map(interval => ({
      on: 'timer',
      request: 'event',
      timerSpec: {
        interval: interval * 1000, // Convert to milliseconds
        maxTimerLength: interval * 1000,
      },
      vars: {
        event_name: 'time_on_page',
        event_category: 'engagement',
        time_threshold: interval,
      },
    }));
  },
};

// Export analytics manager instance
export const ampAnalytics = new AMPAnalyticsManager();