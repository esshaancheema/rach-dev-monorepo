'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { trackEvent as gtmTrackEvent, trackBusinessEvent, calculateEngagementScore } from '@/lib/analytics/google-analytics';

interface AnalyticsContextType {
  trackEvent: (eventName: string, parameters?: Record<string, any>) => void;
  trackConversion: (conversionType: string, value?: number) => void;
  trackUserSegment: (segment: string) => void;
  engagementScore: number;
  userSegment: string | null;
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export default function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const [engagementScore, setEngagementScore] = useState(0);
  const [userSegment, setUserSegment] = useState<string | null>(null);
  const [trackedActions, setTrackedActions] = useState<string[]>([]);

  // Initialize user segment detection
  useEffect(() => {
    const detectUserSegment = () => {
      const pathname = window.location.pathname;
      const referrer = document.referrer;
      const userAgent = navigator.userAgent;

      let segment = 'general';

      // Enterprise segment detection
      if (pathname.includes('/enterprise') || 
          referrer.includes('linkedin') ||
          localStorage.getItem('enterprise_interest')) {
        segment = 'enterprise';
      }
      // SMB segment detection
      else if (pathname.includes('/pricing') ||
               pathname.includes('/services') && !pathname.includes('/enterprise')) {
        segment = 'smb';
      }
      // Startup segment detection
      else if (referrer.includes('producthunt') ||
               referrer.includes('hackernews') ||
               localStorage.getItem('startup_interest')) {
        segment = 'startup';
      }
      // Developer segment detection
      else if (referrer.includes('github') ||
               referrer.includes('stackoverflow') ||
               pathname.includes('/ai-agents') ||
               userAgent.includes('Developer')) {
        segment = 'developer';
      }

      setUserSegment(segment);
      trackUserSegment(segment);
    };

    detectUserSegment();
  }, []);

  // Update engagement score when actions are tracked
  useEffect(() => {
    const newScore = calculateEngagementScore(trackedActions);
    setEngagementScore(newScore);

    // Update user segment based on engagement patterns
    if (newScore >= 50 && trackedActions.includes('enterprise_inquiry')) {
      setUserSegment('enterprise_hot');
    } else if (newScore >= 30 && trackedActions.includes('service_interest')) {
      setUserSegment('qualified_lead');
    } else if (newScore >= 20) {
      setUserSegment('engaged_visitor');
    }
  }, [trackedActions]);

  const trackEvent = (eventName: string, parameters: Record<string, any> = {}) => {
    // Add user segment to all events
    const enrichedParameters = {
      ...parameters,
      user_segment: userSegment,
      engagement_score: engagementScore,
    };

    gtmTrackEvent(eventName, enrichedParameters);
    
    // Add to tracked actions for engagement scoring
    setTrackedActions(prev => [...prev, eventName]);
  };

  const trackConversion = (conversionType: string, value: number = 0) => {
    const conversionData = {
      conversion_type: conversionType,
      user_segment: userSegment,
      engagement_score: engagementScore,
      value: value,
    };

    switch (conversionType) {
      case 'lead':
        trackBusinessEvent.leadGenerated('website', 'general', value);
        break;
      case 'contact':
        trackBusinessEvent.contactFormSubmit('contact', window.location.pathname);
        break;
      case 'newsletter':
        trackBusinessEvent.newsletterSignup(window.location.pathname);
        break;
      case 'enterprise':
        trackBusinessEvent.enterpriseInquiry(userSegment || 'unknown', 'website');
        break;
      default:
        trackEvent('conversion', conversionData);
    }

    // Update engagement score for conversions
    setTrackedActions(prev => [...prev, 'conversion_' + conversionType]);
  };

  const trackUserSegment = (segment: string) => {
    setUserSegment(segment);
    trackEvent('user_segment_identified', { segment });
    
    // Store in localStorage for persistence
    localStorage.setItem('user_segment', segment);
  };

  const contextValue: AnalyticsContextType = {
    trackEvent,
    trackConversion,
    trackUserSegment,
    engagementScore,
    userSegment,
  };

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export const useAnalytics = (): AnalyticsContextType => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

// Hook for tracking specific business events
export const useBusinessTracking = () => {
  const { trackEvent, trackConversion, userSegment } = useAnalytics();

  return {
    // Service interest tracking
    trackServiceInterest: (serviceName: string, action: string = 'view') => {
      trackBusinessEvent.serviceInterest(serviceName, action);
      trackEvent('service_interest', { service: serviceName, action });
    },

    // Lead generation tracking
    trackLeadGeneration: (source: string, serviceInterest: string, value: number = 100) => {
      trackBusinessEvent.leadGenerated(source, serviceInterest, value);
      trackConversion('lead', value);
    },

    // Content engagement tracking
    trackContentEngagement: (contentType: string, contentTitle: string, action: string) => {
      if (contentType === 'blog') {
        trackBusinessEvent.blogEngagement(contentTitle, action);
      } else if (contentType === 'case_study') {
        trackBusinessEvent.caseStudyView(contentTitle, 'engagement');
      }
      trackEvent('content_engagement', { 
        content_type: contentType, 
        content_title: contentTitle, 
        action 
      });
    },

    // Technology interest tracking
    trackTechnologyInterest: (technology: string, context: string = 'general') => {
      trackBusinessEvent.technologyInterest(technology, context);
      trackEvent('technology_interest', { technology, context });
    },

    // Pricing interaction tracking
    trackPricingInteraction: (plan: string, action: string = 'view') => {
      trackBusinessEvent.pricingInteraction(plan, action);
      trackEvent('pricing_interaction', { plan, action });
    },

    // Enterprise-specific tracking
    trackEnterpriseInterest: (companySize: string, industry: string) => {
      trackBusinessEvent.enterpriseInquiry(companySize, industry);
      trackConversion('enterprise', 500);
    },

    // AI Agent interaction tracking
    trackAIAgentInteraction: (agentType: string, action: string = 'view') => {
      trackBusinessEvent.aiAgentInteraction(agentType, action);
      trackEvent('ai_agent_interaction', { agent_type: agentType, action });
    },

    // Resource download tracking
    trackResourceDownload: (resourceType: string, resourceName: string) => {
      trackBusinessEvent.resourceDownload(resourceType, resourceName);
      trackEvent('resource_download', { 
        resource_type: resourceType, 
        resource_name: resourceName 
      });
    },

    // Search tracking
    trackSiteSearch: (query: string, results: number) => {
      trackBusinessEvent.siteSearch(query, results);
      trackEvent('site_search', { query, results });
    },

    // Error tracking
    trackError: (errorType: string, errorMessage: string) => {
      trackBusinessEvent.errorOccurred(errorType, errorMessage, window.location.pathname);
      trackEvent('error', { error_type: errorType, error_message: errorMessage });
    },

    userSegment,
  };
};