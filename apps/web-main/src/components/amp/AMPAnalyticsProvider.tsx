// AMP Analytics Provider for easy integration across AMP pages

import React from 'react';
import {
  AMPAnalyticsComponent,
  AMPConversionTracking,
  AMPAnalyticsPresets,
  AMPAnalyticsUtils,
  ampAnalytics,
  type AMPAnalyticsConfig,
} from '../../lib/amp/analytics';

export interface AMPAnalyticsProviderProps {
  // Google Analytics 4 Configuration
  ga4?: {
    measurementId: string;
    enableEnhancedMeasurement?: boolean;
    customDimensions?: Record<string, string>;
    customMetrics?: Record<string, number>;
    conversionEvents?: string[];
  };

  // Universal Analytics Configuration (legacy)
  ua?: {
    trackingId: string;
    customDimensions?: Record<string, string>;
    customMetrics?: Record<string, number>;
    enhancedLinkAttribution?: boolean;
    anonymizeIp?: boolean;
  };

  // Custom analytics configurations
  custom?: Array<{
    id: string;
    config: AMPAnalyticsConfig;
  }>;

  // Page-specific configuration
  page?: {
    type: 'blog' | 'case-study' | 'service' | 'landing' | 'ecommerce';
    category?: string;
    title?: string;
    author?: string;
    tags?: string[];
    publishDate?: string;
  };

  // Conversion tracking
  conversions?: Array<{
    conversionId: string;
    conversionLabel: string;
    conversionValue?: number;
    conversionCurrency?: string;
  }>;

  // Feature flags
  features?: {
    formTracking?: boolean;
    videoTracking?: boolean;
    socialTracking?: boolean;
    ecommerceTracking?: boolean;
    scrollTracking?: boolean;
    ctaTracking?: boolean;
    downloadTracking?: boolean;
    outboundTracking?: boolean;
    timeTracking?: boolean;
  };

  // Additional triggers
  customTriggers?: Array<{
    name: string;
    selector: string;
    event: string;
    category?: string;
    label?: string;
    value?: number;
  }>;

  children?: React.ReactNode;
}

export function AMPAnalyticsProvider({
  ga4,
  ua,
  custom = [],
  page,
  conversions = [],
  features = {},
  customTriggers = [],
  children,
}: AMPAnalyticsProviderProps) {
  // Set global variables based on page context
  React.useEffect(() => {
    if (page) {
      ampAnalytics.setGlobalVars({
        pageType: page.type,
        pageCategory: page.category || '',
        pageTitle: page.title || '',
        pageAuthor: page.author || '',
        pageTags: page.tags?.join(',') || '',
        publishDate: page.publishDate || '',
      });
    }
  }, [page]);

  // Generate analytics configurations
  const analyticsConfigs: Array<{ id: string; config: AMPAnalyticsConfig }> = [];

  // Add GA4 configuration
  if (ga4) {
    let config: AMPAnalyticsConfig;
    
    if (page?.type) {
      // Use preset configuration based on page type
      switch (page.type) {
        case 'blog':
          config = AMPAnalyticsPresets.blog(ga4.measurementId);
          break;
        case 'ecommerce':
          config = AMPAnalyticsPresets.ecommerce(ga4.measurementId);
          break;
        case 'service':
        case 'landing':
          config = AMPAnalyticsPresets.leadGen(ga4.measurementId);
          break;
        case 'case-study':
          config = AMPAnalyticsPresets.media(ga4.measurementId);
          break;
        default:
          config = ampAnalytics.createGA4Config(ga4.measurementId, ga4);
      }
    } else {
      config = ampAnalytics.createGA4Config(ga4.measurementId, ga4);
    }

    // Add feature-based triggers
    if (features.formTracking) {
      config.triggers?.push(...ampAnalytics.createFormTracking());
    }

    if (features.videoTracking) {
      config.triggers?.push(...ampAnalytics.createVideoTracking());
    }

    if (features.socialTracking) {
      config.triggers?.push(...ampAnalytics.createSocialTracking());
    }

    if (features.scrollTracking) {
      config.triggers?.push(AMPAnalyticsUtils.createScrollTracking());
    }

    if (features.downloadTracking) {
      config.triggers?.push(
        AMPAnalyticsUtils.createDownloadTracking('pdf'),
        AMPAnalyticsUtils.createDownloadTracking('doc'),
        AMPAnalyticsUtils.createDownloadTracking('zip')
      );
    }

    if (features.outboundTracking) {
      config.triggers?.push(AMPAnalyticsUtils.createOutboundTracking());
    }

    if (features.timeTracking) {
      config.triggers?.push(...AMPAnalyticsUtils.createTimeTracking());
    }

    // Add custom triggers
    customTriggers.forEach(trigger => {
      config.triggers?.push({
        on: 'click',
        request: 'event',
        selector: trigger.selector,
        vars: {
          event_name: trigger.event,
          event_category: trigger.category || 'custom',
          event_label: trigger.label || trigger.name,
          event_value: trigger.value,
        },
      });
    });

    analyticsConfigs.push({ id: 'ga4', config });
  }

  // Add Universal Analytics configuration
  if (ua) {
    const config = ampAnalytics.createUAConfig(ua.trackingId, ua);
    analyticsConfigs.push({ id: 'ua', config });
  }

  // Add custom configurations
  custom.forEach(({ id, config }) => {
    analyticsConfigs.push({ id, config });
  });

  return (
    <>
      {children}
      
      {/* Render analytics components */}
      {analyticsConfigs.map(({ id, config }) => (
        <AMPAnalyticsComponent
          key={id}
          config={config}
          className="amp-analytics"
        />
      ))}

      {/* Render conversion tracking */}
      {conversions.map((conversion, index) => (
        <AMPConversionTracking
          key={index}
          conversionId={conversion.conversionId}
          conversionLabel={conversion.conversionLabel}
          conversionValue={conversion.conversionValue}
          conversionCurrency={conversion.conversionCurrency}
          className="amp-conversion-tracking"
        />
      ))}
    </>
  );
}

// Hook for tracking custom events in AMP pages
export function useAMPTracking() {
  const trackEvent = React.useCallback((
    eventName: string,
    category: string = 'custom',
    label?: string,
    value?: number
  ) => {
    // In AMP, we can't directly call JavaScript functions
    // Instead, we use data attributes and triggers
    // This is mainly for documentation and type safety
    console.warn(
      'AMP tracking events should be configured through triggers and data attributes. ' +
      `Event: ${eventName}, Category: ${category}, Label: ${label}, Value: ${value}`
    );
  }, []);

  const trackConversion = React.useCallback((
    conversionLabel: string,
    value?: number,
    currency: string = 'USD'
  ) => {
    console.warn(
      'AMP conversion tracking should be configured through AMPConversionTracking component. ' +
      `Label: ${conversionLabel}, Value: ${value}, Currency: ${currency}`
    );
  }, []);

  return {
    trackEvent,
    trackConversion,
  };
}

// Higher-order component for automatic analytics setup
export function withAMPAnalytics<P extends object>(
  Component: React.ComponentType<P>,
  analyticsProps: Omit<AMPAnalyticsProviderProps, 'children'>
) {
  return function WrappedComponent(props: P) {
    return (
      <AMPAnalyticsProvider {...analyticsProps}>
        <Component {...props} />
      </AMPAnalyticsProvider>
    );
  };
}

// Predefined configurations for common Zoptal use cases
export const ZoptalAnalyticsConfigs = {
  // Blog post analytics
  blogPost: (measurementId: string, postData: {
    category: string;
    author: string;
    tags: string[];
    publishDate: string;
  }): AMPAnalyticsProviderProps => ({
    ga4: {
      measurementId,
      enableEnhancedMeasurement: true,
      customDimensions: {
        content_group1: 'Blog',
        content_group2: postData.category,
        content_group3: postData.tags.join(','),
        author: postData.author,
      },
    },
    page: {
      type: 'blog',
      category: postData.category,
      author: postData.author,
      tags: postData.tags,
      publishDate: postData.publishDate,
    },
    features: {
      formTracking: true,
      socialTracking: true,
      scrollTracking: true,
      downloadTracking: true,
      outboundTracking: true,
      timeTracking: true,
    },
    customTriggers: [
      {
        name: 'newsletter_signup',
        selector: '[data-cta="newsletter"]',
        event: 'newsletter_signup',
        category: 'conversion',
      },
      {
        name: 'contact_cta',
        selector: '[data-cta="contact"]',
        event: 'contact_cta_click',
        category: 'engagement',
      },
    ],
  }),

  // Case study analytics
  caseStudy: (measurementId: string, caseStudyData: {
    industry: string;
    client: string;
    services: string[];
  }): AMPAnalyticsProviderProps => ({
    ga4: {
      measurementId,
      enableEnhancedMeasurement: true,
      customDimensions: {
        content_group1: 'Case Study',
        content_group2: caseStudyData.industry,
        content_group3: caseStudyData.services.join(','),
        client_type: caseStudyData.client,
      },
    },
    page: {
      type: 'case-study',
      category: caseStudyData.industry,
    },
    features: {
      formTracking: true,
      socialTracking: true,
      scrollTracking: true,
      ctaTracking: true,
      outboundTracking: true,
    },
    customTriggers: [
      {
        name: 'case_study_cta',
        selector: '[data-cta="similar-project"]',
        event: 'case_study_cta_click',
        category: 'conversion',
      },
      {
        name: 'service_inquiry',
        selector: '[data-cta="service-inquiry"]',
        event: 'service_inquiry_click',
        category: 'conversion',
      },
    ],
  }),

  // Service page analytics
  servicePage: (measurementId: string, serviceData: {
    serviceName: string;
    serviceCategory: string;
    pricing?: string;
  }): AMPAnalyticsProviderProps => ({
    ga4: {
      measurementId,
      enableEnhancedMeasurement: true,
      customDimensions: {
        content_group1: 'Service',
        content_group2: serviceData.serviceCategory,
        service_name: serviceData.serviceName,
        pricing_tier: serviceData.pricing || 'not_specified',
      },
    },
    page: {
      type: 'service',
      category: serviceData.serviceCategory,
    },
    features: {
      formTracking: true,
      scrollTracking: true,
      ctaTracking: true,
    },
    customTriggers: [
      {
        name: 'quote_request',
        selector: '[data-cta="quote"]',
        event: 'quote_request',
        category: 'conversion',
      },
      {
        name: 'consultation_book',
        selector: '[data-cta="consultation"]',
        event: 'consultation_booking',
        category: 'conversion',
      },
      {
        name: 'pricing_view',
        selector: '[data-action="view-pricing"]',
        event: 'pricing_view',
        category: 'engagement',
      },
    ],
  }),

  // Landing page analytics
  landingPage: (measurementId: string, campaignData: {
    campaignName: string;
    source: string;
    medium: string;
  }): AMPAnalyticsProviderProps => ({
    ga4: {
      measurementId,
      enableEnhancedMeasurement: true,
      customDimensions: {
        content_group1: 'Landing Page',
        campaign_name: campaignData.campaignName,
        traffic_source: campaignData.source,
        traffic_medium: campaignData.medium,
      },
      conversionEvents: ['lead_generation', 'form_submit', 'cta_click'],
    },
    page: {
      type: 'landing',
      category: campaignData.campaignName,
    },
    features: {
      formTracking: true,
      scrollTracking: true,
      ctaTracking: true,
      timeTracking: true,
    },
    customTriggers: [
      {
        name: 'hero_cta',
        selector: '[data-cta="hero"]',
        event: 'hero_cta_click',
        category: 'conversion',
      },
      {
        name: 'secondary_cta',
        selector: '[data-cta="secondary"]',
        event: 'secondary_cta_click',
        category: 'engagement',
      },
    ],
  }),
};

export default AMPAnalyticsProvider;