'use client';

import { useCallback } from 'react';
import { usePathname } from 'next/navigation';

interface CTATrackingEvent {
  event: string;
  category: string;
  label: string;
  value?: number;
  customParameters?: Record<string, any>;
}

interface CTATrackingOptions {
  enableGoogleAnalytics?: boolean;
  enableCustomTracking?: boolean;
  customTracker?: (event: CTATrackingEvent) => void;
}

export function useCTATracking(options: CTATrackingOptions = {}) {
  const {
    enableGoogleAnalytics = true,
    enableCustomTracking = false,
    customTracker,
  } = options;

  const pathname = usePathname();

  const trackCTAClick = useCallback((
    ctaType: string,
    ctaLabel: string,
    additionalData?: Record<string, any>
  ) => {
    const baseEvent: CTATrackingEvent = {
      event: 'cta_click',
      category: 'engagement',
      label: `${ctaType}_${ctaLabel}`,
      customParameters: {
        page_path: pathname,
        cta_type: ctaType,
        cta_label: ctaLabel,
        timestamp: new Date().toISOString(),
        ...additionalData,
      },
    };

    // Google Analytics tracking
    if (enableGoogleAnalytics && typeof window !== 'undefined' && (window as any).gtag) {
      try {
        (window as any).gtag('event', baseEvent.event, {
          event_category: baseEvent.category,
          event_label: baseEvent.label,
          custom_map: baseEvent.customParameters,
        });
      } catch (error) {
        console.warn('Failed to track CTA with Google Analytics:', error);
      }
    }

    // Custom tracking
    if (enableCustomTracking && customTracker) {
      try {
        customTracker(baseEvent);
      } catch (error) {
        console.warn('Failed to track CTA with custom tracker:', error);
      }
    }

    // Console logging in development
    if (process.env.NODE_ENV === 'development') {
      console.info('CTA Tracked:', baseEvent);
    }
  }, [pathname, enableGoogleAnalytics, enableCustomTracking, customTracker]);

  const trackCTAConversion = useCallback((
    ctaType: string,
    conversionValue?: number,
    additionalData?: Record<string, any>
  ) => {
    const conversionEvent: CTATrackingEvent = {
      event: 'cta_conversion',
      category: 'conversion',
      label: ctaType,
      value: conversionValue,
      customParameters: {
        page_path: pathname,
        cta_type: ctaType,
        conversion_value: conversionValue,
        timestamp: new Date().toISOString(),
        ...additionalData,
      },
    };

    // Google Analytics conversion tracking
    if (enableGoogleAnalytics && typeof window !== 'undefined' && (window as any).gtag) {
      try {
        (window as any).gtag('event', 'conversion', {
          event_category: 'cta_conversion',
          event_label: ctaType,
          value: conversionValue,
        });
      } catch (error) {
        console.warn('Failed to track CTA conversion with Google Analytics:', error);
      }
    }

    // Custom conversion tracking
    if (enableCustomTracking && customTracker) {
      try {
        customTracker(conversionEvent);
      } catch (error) {
        console.warn('Failed to track CTA conversion with custom tracker:', error);
      }
    }

    if (process.env.NODE_ENV === 'development') {
      console.info('CTA Conversion Tracked:', conversionEvent);
    }
  }, [pathname, enableGoogleAnalytics, enableCustomTracking, customTracker]);

  const trackCTAImpression = useCallback((
    ctaType: string,
    ctaLabel: string,
    additionalData?: Record<string, any>
  ) => {
    const impressionEvent: CTATrackingEvent = {
      event: 'cta_impression',
      category: 'engagement',
      label: `${ctaType}_impression`,
      customParameters: {
        page_path: pathname,
        cta_type: ctaType,
        cta_label: ctaLabel,
        timestamp: new Date().toISOString(),
        ...additionalData,
      },
    };

    // Track CTA impressions for optimization
    if (enableCustomTracking && customTracker) {
      try {
        customTracker(impressionEvent);
      } catch (error) {
        console.warn('Failed to track CTA impression:', error);
      }
    }

    if (process.env.NODE_ENV === 'development') {
      console.info('CTA Impression Tracked:', impressionEvent);
    }
  }, [pathname, enableCustomTracking, customTracker]);

  return {
    trackCTAClick,
    trackCTAConversion,
    trackCTAImpression,
  };
}