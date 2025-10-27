'use client';

import { useCallback, useEffect } from 'react';

interface AnalyticsEvent {
  [key: string]: any;
}

interface AnalyticsUser {
  id: string;
  email?: string;
  name?: string;
  company?: string;
  plan?: string;
  location?: string;
  [key: string]: any;
}

interface UseAnalyticsReturn {
  track: (event: string, properties?: AnalyticsEvent) => void;
  identify: (userId: string, traits?: AnalyticsUser) => void;
  page: (name?: string, properties?: AnalyticsEvent) => void;
  reset: () => void;
  isLoaded: boolean;
}

// Analytics providers configuration
const ANALYTICS_CONFIG = {
  googleAnalytics: {
    enabled: typeof window !== 'undefined' && !!process.env.NEXT_PUBLIC_GA_ID,
    trackingId: process.env.NEXT_PUBLIC_GA_ID
  },
  posthog: {
    enabled: typeof window !== 'undefined' && !!process.env.NEXT_PUBLIC_POSTHOG_KEY,
    apiKey: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com'
  },
  vercel: {
    enabled: typeof window !== 'undefined' && process.env.NODE_ENV === 'production'
  }
};

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    posthog?: any;
    va?: any; // Vercel Analytics
  }
}

export function useAnalytics(): UseAnalyticsReturn {
  // Track events across all analytics providers
  const track = useCallback((event: string, properties: AnalyticsEvent = {}) => {
    const eventData = {
      ...properties,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      referrer: typeof window !== 'undefined' ? document.referrer : '',
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : ''
    };

    // Google Analytics 4
    if (ANALYTICS_CONFIG.googleAnalytics.enabled && window.gtag) {
      window.gtag('event', event, {
        custom_map: eventData,
        ...eventData
      });
    }

    // PostHog
    if (ANALYTICS_CONFIG.posthog.enabled && window.posthog) {
      window.posthog.capture(event, eventData);
    }

    // Vercel Analytics
    if (ANALYTICS_CONFIG.vercel.enabled && window.va) {
      window.va('track', event, eventData);
    }

    // Custom analytics endpoint
    if (typeof window !== 'undefined') {
      fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event,
          properties: eventData,
          session: {
            id: getSessionId(),
            page: window.location.pathname,
            timestamp: Date.now()
          }
        }),
      }).catch(error => {
        console.warn('Custom analytics tracking failed:', error);
      });
    }

    // Console logging in development
    if (process.env.NODE_ENV === 'development') {
      console.info('Analytics Event:', event, eventData);
    }
  }, []);

  // Identify users across all analytics providers
  const identify = useCallback((userId: string, traits: AnalyticsUser = {}) => {
    const userData = {
      ...traits,
      id: userId,
      identifiedAt: new Date().toISOString()
    };

    // Google Analytics 4
    if (ANALYTICS_CONFIG.googleAnalytics.enabled && window.gtag) {
      window.gtag('config', ANALYTICS_CONFIG.googleAnalytics.trackingId, {
        user_id: userId,
        custom_map: userData
      });
    }

    // PostHog
    if (ANALYTICS_CONFIG.posthog.enabled && window.posthog) {
      window.posthog.identify(userId, userData);
    }

    // Store user data in localStorage for session persistence
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('zoptal_user_id', userId);
        localStorage.setItem('zoptal_user_traits', JSON.stringify(userData));
      } catch (error) {
        console.warn('Failed to store user data:', error);
      }
    }

    // Custom analytics endpoint
    if (typeof window !== 'undefined') {
      fetch('/api/analytics/identify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          traits: userData,
          timestamp: Date.now()
        }),
      }).catch(error => {
        console.warn('Custom user identification failed:', error);
      });
    }

    if (process.env.NODE_ENV === 'development') {
      console.info('Analytics Identify:', userId, userData);
    }
  }, []);

  // Track page views across all analytics providers
  const page = useCallback((name?: string, properties: AnalyticsEvent = {}) => {
    if (typeof window === 'undefined') return;

    const pageData = {
      page: name || window.location.pathname,
      title: document.title,
      url: window.location.href,
      referrer: document.referrer,
      ...properties,
      timestamp: new Date().toISOString()
    };

    // Google Analytics 4
    if (ANALYTICS_CONFIG.googleAnalytics.enabled && window.gtag) {
      window.gtag('config', ANALYTICS_CONFIG.googleAnalytics.trackingId, {
        page_title: pageData.title,
        page_location: pageData.url,
        custom_map: pageData
      });
    }

    // PostHog
    if (ANALYTICS_CONFIG.posthog.enabled && window.posthog) {
      window.posthog.capture('$pageview', pageData);
    }

    // Vercel Analytics
    if (ANALYTICS_CONFIG.vercel.enabled && window.va) {
      window.va('track', 'pageview', pageData);
    }

    if (process.env.NODE_ENV === 'development') {
      console.info('Analytics Page:', pageData);
    }
  }, []);

  // Reset analytics data (useful for logout)
  const reset = useCallback(() => {
    // PostHog
    if (ANALYTICS_CONFIG.posthog.enabled && window.posthog) {
      window.posthog.reset();
    }

    // Clear localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('zoptal_user_id');
        localStorage.removeItem('zoptal_user_traits');
        localStorage.removeItem('zoptal_session_id');
      } catch (error) {
        console.warn('Failed to clear analytics data:', error);
      }
    }

    if (process.env.NODE_ENV === 'development') {
      console.info('Analytics Reset');
    }
  }, []);

  // Generate or retrieve session ID
  const getSessionId = useCallback((): string => {
    if (typeof window === 'undefined') return '';

    try {
      let sessionId = localStorage.getItem('zoptal_session_id');
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('zoptal_session_id', sessionId);
      }
      return sessionId;
    } catch (error) {
      return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  }, []);

  // Check if analytics scripts are loaded
  const isLoaded = Boolean(
    (ANALYTICS_CONFIG.googleAnalytics.enabled && window.gtag) ||
    (ANALYTICS_CONFIG.posthog.enabled && window.posthog) ||
    ANALYTICS_CONFIG.vercel.enabled
  );

  // Initialize analytics on mount
  useEffect(() => {
    // Prevent duplicate initialization
    if (typeof window === 'undefined') return;
    
    const hasInitialized = window.sessionStorage.getItem('analytics_initialized');
    if (hasInitialized) return;
    
    window.sessionStorage.setItem('analytics_initialized', 'true');
    
    // Track initial page view
    page();

    // Auto-identify returning users
    try {
      const userId = localStorage.getItem('zoptal_user_id');
      const userTraits = localStorage.getItem('zoptal_user_traits');
      
      if (userId && userTraits) {
        identify(userId, JSON.parse(userTraits));
      }
    } catch (error) {
      console.warn('Failed to auto-identify user:', error);
    }

    // Track session start only once
    track('session_started', {
      sessionId: getSessionId(),
      timestamp: Date.now()
    });

    // Track session end on page unload
    const handleBeforeUnload = () => {
      track('session_ended', {
        sessionId: getSessionId(),
        timestamp: Date.now(),
        duration: Date.now() - parseInt(getSessionId().split('_')[1])
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [track, identify, page, getSessionId]);

  return {
    track,
    trackEvent: track, // Alias for compatibility
    trackClick: (elementName: string, elementType: string = 'button') => {
      track('element_clicked', {
        element_name: elementName,
        element_type: elementType,
        timestamp: new Date().toISOString()
      });
    },
    identify,
    page,
    reset,
    isLoaded
  };
}