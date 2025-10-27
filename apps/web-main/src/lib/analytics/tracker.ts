// Comprehensive analytics tracking service
import { AnalyticsEvent, UserSession, PageView, ConversionGoal } from './types';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
    posthog?: any;
    analytics?: any;
  }
}

class AnalyticsTracker {
  private static instance: AnalyticsTracker;
  private sessionId: string;
  private userId?: string;
  private anonymousId: string;
  private sessionStartTime: number;
  private currentPage?: string;
  private pageStartTime?: number;
  private isInitialized = false;
  
  // Configuration
  private config = {
    googleAnalyticsId: process.env.NEXT_PUBLIC_GA_ID,
    posthogKey: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    segmentKey: process.env.NEXT_PUBLIC_SEGMENT_KEY,
    enableDebug: process.env.NODE_ENV === 'development',
    apiEndpoint: '/api/analytics',
    flushInterval: 30000, // 30 seconds
    maxBatchSize: 50
  };
  
  private eventQueue: AnalyticsEvent[] = [];
  private flushTimer?: NodeJS.Timeout;

  static getInstance(): AnalyticsTracker {
    if (!AnalyticsTracker.instance) {
      AnalyticsTracker.instance = new AnalyticsTracker();
    }
    return AnalyticsTracker.instance;
  }

  private constructor() {
    this.sessionId = this.generateId('session');
    this.anonymousId = this.getOrCreateAnonymousId();
    this.sessionStartTime = Date.now();
    
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  /**
   * Initialize analytics tracking
   */
  async init(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Initialize Google Analytics
      if (this.config.googleAnalyticsId) {
        await this.initGoogleAnalytics();
      }

      // Initialize PostHog
      if (this.config.posthogKey) {
        await this.initPostHog();
      }

      // Initialize Segment
      if (this.config.segmentKey) {
        await this.initSegment();
      }

      // Setup page visibility tracking
      this.setupPageVisibilityTracking();
      
      // Setup scroll tracking
      this.setupScrollTracking();
      
      // Setup click tracking
      this.setupClickTracking();
      
      // Setup performance tracking
      this.setupPerformanceTracking();

      // Start flush timer
      this.startFlushTimer();

      this.isInitialized = true;
      
      // Track initial page view
      this.trackPageView();

      if (this.config.enableDebug) {
        console.info('Analytics tracker initialized');
      }
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
    }
  }

  /**
   * Track custom event
   */
  track(event: Omit<AnalyticsEvent, 'timestamp' | 'sessionId'>): void {
    const fullEvent: AnalyticsEvent = {
      ...event,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      userId: this.userId,
      page: this.currentPage || window.location.pathname
    };

    // Add to queue
    this.eventQueue.push(fullEvent);

    // Track in external services
    this.trackInExternalServices(fullEvent);

    // Flush if queue is full
    if (this.eventQueue.length >= this.config.maxBatchSize) {
      this.flush();
    }

    if (this.config.enableDebug) {
      console.info('Event tracked:', fullEvent);
    }
  }

  /**
   * Track page view
   */
  trackPageView(page?: string, title?: string): void {
    const currentPage = page || window.location.pathname;
    const pageTitle = title || document.title;
    
    // End previous page view
    if (this.currentPage && this.pageStartTime) {
      const timeOnPage = Date.now() - this.pageStartTime;
      this.track({
        name: 'page_exit',
        category: 'user_interaction',
        properties: {
          page: this.currentPage,
          timeOnPage: Math.round(timeOnPage / 1000),
          exitMethod: 'navigation'
        }
      });
    }

    // Start new page view
    this.currentPage = currentPage;
    this.pageStartTime = Date.now();

    const pageView: AnalyticsEvent = {
      name: 'page_view',
      category: 'user_interaction',
      properties: {
        page: currentPage,
        title: pageTitle,
        referrer: document.referrer,
        url: window.location.href,
        userAgent: navigator.userAgent,
        screenResolution: `${screen.width}x${screen.height}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    };

    this.track(pageView);

    // Track in Google Analytics
    if (window.gtag) {
      window.gtag('config', this.config.googleAnalyticsId, {
        page_path: currentPage,
        page_title: pageTitle
      });
    }

    // Track in PostHog
    if (window.posthog) {
      window.posthog.capture('$pageview', {
        $current_url: window.location.href,
        $pathname: currentPage,
        $title: pageTitle
      });
    }
  }

  /**
   * Track conversion event
   */
  trackConversion(goal: string, value?: number, properties?: Record<string, any>): void {
    this.track({
      name: 'conversion',
      category: 'business_goal',
      value,
      properties: {
        goal,
        ...properties
      }
    });

    // Track in Google Analytics as conversion
    if (window.gtag) {
      window.gtag('event', 'conversion', {
        send_to: this.config.googleAnalyticsId,
        value,
        currency: 'USD',
        event_category: 'business_goal',
        event_label: goal
      });
    }
  }

  /**
   * Track user interaction
   */
  trackInteraction(element: string, action: string, properties?: Record<string, any>): void {
    this.track({
      name: 'user_interaction',
      category: 'user_interaction',
      properties: {
        element,
        action,
        ...properties
      }
    });
  }

  /**
   * Track error
   */
  trackError(error: Error, context?: Record<string, any>): void {
    this.track({
      name: 'javascript_error',
      category: 'error',
      properties: {
        message: error.message,
        stack: error.stack,
        name: error.name,
        page: this.currentPage,
        userAgent: navigator.userAgent,
        ...context
      }
    });
  }

  /**
   * Track performance metrics
   */
  trackPerformance(metrics: Record<string, number>): void {
    this.track({
      name: 'performance_metrics',
      category: 'performance',
      properties: {
        ...metrics,
        page: this.currentPage
      }
    });
  }

  /**
   * Identify user
   */
  identify(userId: string, traits?: Record<string, any>): void {
    this.userId = userId;
    
    // Store in localStorage
    localStorage.setItem('analytics_user_id', userId);

    this.track({
      name: 'user_identified',
      category: 'user_interaction',
      properties: traits
    });

    // Identify in external services
    if (window.gtag) {
      window.gtag('config', this.config.googleAnalyticsId, {
        user_id: userId
      });
    }

    if (window.posthog) {
      window.posthog.identify(userId, traits);
    }

    if (window.analytics) {
      window.analytics.identify(userId, traits);
    }
  }

  /**
   * Set user properties
   */
  setUserProperties(properties: Record<string, any>): void {
    if (window.gtag) {
      window.gtag('set', properties);
    }

    if (window.posthog) {
      window.posthog.people.set(properties);
    }

    if (window.analytics) {
      window.analytics.identify(this.userId, properties);
    }
  }

  /**
   * Flush events to server
   */
  async flush(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      await fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          events,
          sessionId: this.sessionId,
          userId: this.userId,
          anonymousId: this.anonymousId
        })
      });

      if (this.config.enableDebug) {
        console.info(`Flushed ${events.length} events`);
      }
    } catch (error) {
      // Re-add events to queue on failure
      this.eventQueue.unshift(...events);
      console.error('Failed to flush analytics events:', error);
    }
  }

  /**
   * Private helper methods
   */
  private async initGoogleAnalytics(): Promise<void> {
    // Load Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.googleAnalyticsId}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() {
      window.dataLayer!.push(arguments);
    };
    
    window.gtag('js', new Date());
    window.gtag('config', this.config.googleAnalyticsId, {
      send_page_view: false, // We'll handle page views manually
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });
  }

  private async initPostHog(): Promise<void> {
    // Dynamically import PostHog
    const { default: posthog } = await import('posthog-js');
    
    posthog.init(this.config.posthogKey!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      loaded: (ph) => {
        window.posthog = ph;
        if (this.config.enableDebug) {
          ph.debug(true);
        }
      },
      capture_pageview: false, // We'll handle page views manually
      persistence: 'localStorage',
      autocapture: false // We'll handle interactions manually
    });
  }

  private async initSegment(): Promise<void> {
    // Load Segment script
    const script = document.createElement('script');
    script.innerHTML = `
      !function(){var analytics=window.analytics=window.analytics||[];if(!analytics.initialize)if(analytics.invoked)window.console&&console.error&&console.error("Segment snippet included twice.");else{analytics.invoked=!0;analytics.methods=["trackSubmit","trackClick","trackLink","trackForm","pageview","identify","reset","group","track","ready","alias","debug","page","once","off","on","addSourceMiddleware","addIntegrationMiddleware","setAnonymousId","addDestinationMiddleware"];analytics.factory=function(e){return function(){var t=Array.prototype.slice.call(arguments);t.unshift(e);analytics.push(t);return analytics}};for(var e=0;e<analytics.methods.length;e++){var key=analytics.methods[e];analytics[key]=analytics.factory(key)}analytics.load=function(key,e){var t=document.createElement("script");t.type="text/javascript";t.async=!0;t.src="https://cdn.segment.com/analytics.js/v1/" + key + "/analytics.min.js";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(t,n);analytics._loadOptions=e};analytics.SNIPPET_VERSION="4.13.1";
      analytics.load("${this.config.segmentKey}");
      }}();
    `;
    document.head.appendChild(script);
  }

  private setupPageVisibilityTracking(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.track({
          name: 'page_hidden',
          category: 'user_interaction',
          properties: {
            page: this.currentPage,
            timeOnPage: this.pageStartTime ? Math.round((Date.now() - this.pageStartTime) / 1000) : 0
          }
        });
        this.flush(); // Flush immediately when page becomes hidden
      } else {
        this.track({
          name: 'page_visible',
          category: 'user_interaction',
          properties: {
            page: this.currentPage
          }
        });
      }
    });

    // Track page unload
    window.addEventListener('beforeunload', () => {
      if (this.currentPage && this.pageStartTime) {
        const timeOnPage = Date.now() - this.pageStartTime;
        this.track({
          name: 'page_exit',
          category: 'user_interaction',
          properties: {
            page: this.currentPage,
            timeOnPage: Math.round(timeOnPage / 1000),
            exitMethod: 'unload'
          }
        });
        
        // Use sendBeacon for reliable delivery
        if (navigator.sendBeacon && this.eventQueue.length > 0) {
          navigator.sendBeacon(
            this.config.apiEndpoint,
            JSON.stringify({
              events: this.eventQueue,
              sessionId: this.sessionId,
              userId: this.userId,
              anonymousId: this.anonymousId
            })
          );
        }
      }
    });
  }

  private setupScrollTracking(): void {
    let maxScroll = 0;
    const scrollThresholds = [25, 50, 75, 90, 100];
    const trackedThresholds = new Set<number>();

    const trackScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / docHeight) * 100);

      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
      }

      // Track scroll milestones
      scrollThresholds.forEach(threshold => {
        if (scrollPercent >= threshold && !trackedThresholds.has(threshold)) {
          trackedThresholds.add(threshold);
          this.track({
            name: 'scroll_depth',
            category: 'user_interaction',
            properties: {
              page: this.currentPage,
              scrollDepth: threshold,
              maxScrollDepth: maxScroll
            }
          });
        }
      });
    };

    let scrollTimer: NodeJS.Timeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(trackScroll, 250);
    });
  }

  private setupClickTracking(): void {
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      const className = target.className;
      const id = target.id;
      const text = target.textContent?.slice(0, 100) || '';

      let elementType = tagName;
      let elementValue = text;

      // Special handling for different elements
      if (tagName === 'a') {
        elementType = 'link';
        elementValue = (target as HTMLAnchorElement).href;
      } else if (tagName === 'button') {
        elementType = 'button';
      } else if (tagName === 'input') {
        elementType = `input_${(target as HTMLInputElement).type}`;
      }

      this.track({
        name: 'element_click',
        category: 'user_interaction',
        properties: {
          elementType,
          elementValue,
          elementId: id,
          elementClass: className,
          elementText: text,
          page: this.currentPage
        }
      });
    });
  }

  private setupPerformanceTracking(): void {
    // Track Core Web Vitals
    if ('web-vital' in window) {
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS((metric) => this.trackPerformance({ cls: metric.value }));
        getFID((metric) => this.trackPerformance({ fid: metric.value }));
        getFCP((metric) => this.trackPerformance({ fcp: metric.value }));
        getLCP((metric) => this.trackPerformance({ lcp: metric.value }));
        getTTFB((metric) => this.trackPerformance({ ttfb: metric.value }));
      });
    }

    // Track page load time
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (perfData) {
          this.trackPerformance({
            loadTime: perfData.loadEventEnd - perfData.loadEventStart,
            domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
            connectTime: perfData.connectEnd - perfData.connectStart,
            dnsTime: perfData.domainLookupEnd - perfData.domainLookupStart
          });
        }
      }, 0);
    });
  }

  private trackInExternalServices(event: AnalyticsEvent): void {
    // Track in Google Analytics
    if (window.gtag) {
      window.gtag('event', event.name, {
        event_category: event.category,
        event_label: event.properties?.page,
        value: event.value,
        custom_map: event.properties
      });
    }

    // Track in PostHog
    if (window.posthog) {
      window.posthog.capture(event.name, event.properties);
    }

    // Track in Segment
    if (window.analytics) {
      window.analytics.track(event.name, event.properties);
    }
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getOrCreateAnonymousId(): string {
    let anonymousId = localStorage.getItem('analytics_anonymous_id');
    if (!anonymousId) {
      anonymousId = this.generateId('anon');
      localStorage.setItem('analytics_anonymous_id', anonymousId);
    }
    return anonymousId;
  }
}

// Export singleton instance
export const analytics = AnalyticsTracker.getInstance();