'use client';

// Google Analytics 4 implementation
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || '';

declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date | Record<string, any>,
      config?: Record<string, any>
    ) => void;
    dataLayer: Record<string, any>[];
  }
}

// Initialize Google Analytics
export const initGA = () => {
  if (!GA_TRACKING_ID || typeof window === 'undefined') return;

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];

  function gtag(...args: any[]) {
    window.dataLayer.push(args);
  }

  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', GA_TRACKING_ID, {
    page_title: document.title,
    page_location: window.location.href,
    custom_map: {
      custom_parameter_1: 'service_interest',
      custom_parameter_2: 'lead_source',
      custom_parameter_3: 'user_segment'
    }
  });
};

// Track page views
export const trackPageView = (url: string, title?: string) => {
  if (!GA_TRACKING_ID || typeof window === 'undefined') return;

  window.gtag('config', GA_TRACKING_ID, {
    page_title: title,
    page_location: url,
  });
};

// Track custom events
export const trackEvent = (action: string, parameters: Record<string, any> = {}) => {
  if (!GA_TRACKING_ID || typeof window === 'undefined') return;

  window.gtag('event', action, {
    event_category: parameters.category || 'engagement',
    event_label: parameters.label,
    value: parameters.value,
    ...parameters,
  });
};

// Business-specific tracking functions
export const trackBusinessEvent = {
  // Lead generation tracking
  leadGenerated: (source: string, serviceInterest: string, value?: number) => {
    trackEvent('lead_generated', {
      category: 'lead_generation',
      label: `${source}_${serviceInterest}`,
      service_interest: serviceInterest,
      lead_source: source,
      value: value || 100, // Default lead value
    });
  },

  // Contact form submissions
  contactFormSubmit: (formType: string, page: string) => {
    trackEvent('contact_form_submit', {
      category: 'conversion',
      label: `${formType}_${page}`,
      form_type: formType,
      page_location: page,
      value: 50,
    });
  },

  // Service page interactions
  serviceInterest: (serviceName: string, action: string) => {
    trackEvent('service_interest', {
      category: 'services',
      label: `${serviceName}_${action}`,
      service_name: serviceName,
      interaction_type: action,
    });
  },

  // Pricing interactions
  pricingInteraction: (plan: string, action: string) => {
    trackEvent('pricing_interaction', {
      category: 'pricing',
      label: `${plan}_${action}`,
      pricing_plan: plan,
      interaction_type: action,
      value: action === 'get_quote' ? 200 : 25,
    });
  },

  // Case study engagement
  caseStudyView: (studyTitle: string, category: string) => {
    trackEvent('case_study_view', {
      category: 'content',
      label: `${category}_${studyTitle}`,
      case_study_title: studyTitle,
      case_study_category: category,
    });
  },

  // Blog engagement
  blogEngagement: (postTitle: string, action: string, value?: number) => {
    trackEvent('blog_engagement', {
      category: 'content',
      label: `${postTitle}_${action}`,
      blog_post_title: postTitle,
      engagement_type: action,
      value: value,
    });
  },

  // Download tracking
  resourceDownload: (resourceType: string, resourceName: string) => {
    trackEvent('resource_download', {
      category: 'resources',
      label: `${resourceType}_${resourceName}`,
      resource_type: resourceType,
      resource_name: resourceName,
      value: 75,
    });
  },

  // Newsletter signups
  newsletterSignup: (source: string) => {
    trackEvent('newsletter_signup', {
      category: 'conversion',
      label: source,
      signup_source: source,
      value: 25,
    });
  },

  // Technology interest tracking
  technologyInterest: (technology: string, context: string) => {
    trackEvent('technology_interest', {
      category: 'technology',
      label: `${technology}_${context}`,
      technology_name: technology,
      context: context,
    });
  },

  // Location-based tracking
  locationPageView: (country: string, city: string, service?: string) => {
    trackEvent('location_page_view', {
      category: 'location',
      label: `${country}_${city}${service ? '_' + service : ''}`,
      country: country,
      city: city,
      service: service,
    });
  },

  // Enterprise inquiries
  enterpriseInquiry: (companySize: string, industry: string) => {
    trackEvent('enterprise_inquiry', {
      category: 'enterprise',
      label: `${companySize}_${industry}`,
      company_size: companySize,
      industry: industry,
      value: 500,
    });
  },

  // AI agent interactions
  aiAgentInteraction: (agentType: string, action: string) => {
    trackEvent('ai_agent_interaction', {
      category: 'ai_agents',
      label: `${agentType}_${action}`,
      agent_type: agentType,
      interaction_type: action,
      value: 150,
    });
  },

  // Search functionality
  siteSearch: (query: string, results: number) => {
    trackEvent('site_search', {
      category: 'search',
      label: query,
      search_term: query,
      search_results: results,
    });
  },

  // Scroll depth tracking
  scrollDepth: (percentage: number, page: string) => {
    if ([25, 50, 75, 90, 100].includes(percentage)) {
      trackEvent('scroll_depth', {
        category: 'engagement',
        label: `${page}_${percentage}%`,
        scroll_percentage: percentage,
        page_location: page,
      });
    }
  },

  // Time on page milestones (in seconds)
  timeOnPage: (seconds: number, page: string) => {
    const milestones = [30, 60, 120, 300, 600]; // 30s, 1m, 2m, 5m, 10m
    if (milestones.includes(seconds)) {
      trackEvent('time_on_page', {
        category: 'engagement',
        label: `${page}_${seconds}s`,
        time_seconds: seconds,
        page_location: page,
      });
    }
  },

  // Conversion funnel tracking
  funnelStep: (step: string, funnel: string, value?: number) => {
    trackEvent('funnel_step', {
      category: 'conversion_funnel',
      label: `${funnel}_${step}`,
      funnel_name: funnel,
      funnel_step: step,
      value: value,
    });
  },

  // Error tracking
  errorOccurred: (errorType: string, errorMessage: string, page: string) => {
    trackEvent('error_occurred', {
      category: 'error',
      label: `${errorType}_${page}`,
      error_type: errorType,
      error_message: errorMessage,
      page_location: page,
    });
  },

  // Performance tracking
  performanceMetric: (metric: string, value: number, page: string) => {
    trackEvent('performance_metric', {
      category: 'performance',
      label: `${metric}_${page}`,
      metric_name: metric,
      metric_value: value,
      page_location: page,
    });
  },
};

// Enhanced E-commerce tracking for service inquiries
export const trackEcommerce = {
  beginCheckout: (items: Array<{ name: string; category: string; price: number; quantity: number }>) => {
    trackEvent('begin_checkout', {
      category: 'ecommerce',
      currency: 'USD',
      value: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      items: items,
    });
  },

  purchase: (transactionId: string, items: Array<{ name: string; category: string; price: number; quantity: number }>) => {
    trackEvent('purchase', {
      category: 'ecommerce',
      transaction_id: transactionId,
      currency: 'USD',
      value: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      items: items,
    });
  },

  addToCart: (item: { name: string; category: string; price: number; quantity: number }) => {
    trackEvent('add_to_cart', {
      category: 'ecommerce',
      currency: 'USD',
      value: item.price * item.quantity,
      items: [item],
    });
  },
};

// User engagement scoring
export const calculateEngagementScore = (actions: string[]): number => {
  const scores: Record<string, number> = {
    page_view: 1,
    scroll_depth: 2,
    time_on_page: 3,
    case_study_view: 5,
    blog_engagement: 4,
    service_interest: 8,
    contact_form_submit: 15,
    newsletter_signup: 10,
    resource_download: 12,
    enterprise_inquiry: 25,
    lead_generated: 30,
  };

  return actions.reduce((total, action) => total + (scores[action] || 0), 0);
};