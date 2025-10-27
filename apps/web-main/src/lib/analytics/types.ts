// Analytics and tracking types for comprehensive business intelligence

export interface AnalyticsEvent {
  name: string;
  category: 'user_interaction' | 'business_goal' | 'performance' | 'error' | 'custom';
  properties?: Record<string, any>;
  value?: number;
  userId?: string;
  sessionId?: string;
  timestamp?: string;
  page?: string;
  source?: string;
  medium?: string;
  campaign?: string;
}

export interface UserSession {
  id: string;
  userId?: string;
  anonymousId: string;
  startTime: string;
  endTime?: string;
  duration?: number; // in seconds
  pageViews: number;
  events: AnalyticsEvent[];
  
  // Device and Browser Info
  userAgent: string;
  device: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
  screenResolution?: string;
  
  // Location
  country?: string;
  region?: string;
  city?: string;
  timezone?: string;
  
  // Traffic Source
  referrer?: string;
  source?: string;
  medium?: string;
  campaign?: string;
  keyword?: string;
  
  // Engagement
  bounced: boolean;
  converted: boolean;
  conversionGoals: string[];
  totalValue?: number;
}

export interface PageView {
  id: string;
  sessionId: string;
  userId?: string;
  page: string;
  title: string;
  timestamp: string;
  timeOnPage?: number; // in seconds
  scrollDepth?: number; // percentage 0-100
  exitPage: boolean;
  previousPage?: string;
  nextPage?: string;
  
  // Performance metrics
  loadTime?: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  cumulativeLayoutShift?: number;
  firstInputDelay?: number;
}

export interface ConversionGoal {
  id: string;
  name: string;
  type: 'page_visit' | 'event' | 'form_submission' | 'download' | 'custom';
  description: string;
  value?: number; // monetary value
  conditions: Array<{
    type: 'page_url' | 'event_name' | 'property_value';
    operator: 'equals' | 'contains' | 'starts_with' | 'greater_than' | 'less_than';
    value: string | number;
  }>;
  isActive: boolean;
  createdAt: string;
}

export interface FunnelStep {
  id: string;
  name: string;
  description: string;
  conditions: ConversionGoal['conditions'];
  order: number;
}

export interface ConversionFunnel {
  id: string;
  name: string;
  description: string;
  steps: FunnelStep[];
  isActive: boolean;
  createdAt: string;
}

export interface AnalyticsDashboard {
  // Overview Metrics
  overview: {
    totalSessions: number;
    totalUsers: number;
    totalPageViews: number;
    averageSessionDuration: number;
    bounceRate: number;
    conversionRate: number;
    totalRevenue?: number;
    
    // Comparisons (vs previous period)
    sessionsChange: number;
    usersChange: number;
    pageViewsChange: number;
    conversionRateChange: number;
  };
  
  // Real-time data
  realTime: {
    activeUsers: number;
    currentPageViews: Array<{
      page: string;
      count: number;
    }>;
    recentEvents: AnalyticsEvent[];
    topCountries: Array<{
      country: string;
      count: number;
    }>;
  };
  
  // Traffic sources
  trafficSources: {
    organic: number;
    direct: number;
    referral: number;
    social: number;
    email: number;
    paid: number;
    sources: Array<{
      source: string;
      medium: string;
      sessions: number;
      users: number;
      conversionRate: number;
    }>;
  };
  
  // Popular content
  popularPages: Array<{
    page: string;
    title: string;
    pageViews: number;
    uniqueViews: number;
    averageTimeOnPage: number;
    bounceRate: number;
    exits: number;
  }>;
  
  // Device and technology
  technology: {
    devices: Array<{
      type: string;
      count: number;
      percentage: number;
    }>;
    browsers: Array<{
      name: string;
      count: number;
      percentage: number;
    }>;
    operatingSystems: Array<{
      name: string;
      count: number;
      percentage: number;
    }>;
  };
  
  // Geographic data
  geographic: {
    countries: Array<{
      country: string;
      code: string;
      sessions: number;
      users: number;
      percentage: number;
    }>;
    cities: Array<{
      city: string;
      country: string;
      sessions: number;
      users: number;
    }>;
  };
  
  // Goals and conversions
  conversions: {
    goals: Array<{
      goalId: string;
      name: string;
      completions: number;
      conversionRate: number;
      value: number;
    }>;
    funnels: Array<{
      funnelId: string;
      name: string;
      steps: Array<{
        stepName: string;
        users: number;
        dropoffRate: number;
      }>;
    }>;
  };
}

export interface HeatmapData {
  pageUrl: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  sessionCount: number;
  clickPoints: Array<{
    x: number;
    y: number;
    count: number;
    element?: string;
  }>;
  scrollMap: Array<{
    y: number;
    percentage: number; // percentage of users who scrolled to this point
  }>;
  attentionMap: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    duration: number; // time spent looking at this area
  }>;
}

export interface ABTest {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  type: 'url' | 'element' | 'feature_flag';
  
  // Test configuration
  trafficSplit: number; // percentage of traffic to include in test
  variants: Array<{
    id: string;
    name: string;
    description: string;
    weight: number; // percentage allocation
    config?: Record<string, any>;
  }>;
  
  // Targeting
  targeting: {
    urlConditions?: Array<{
      type: 'path' | 'query' | 'hostname';
      operator: 'equals' | 'contains' | 'regex';
      value: string;
    }>;
    userConditions?: Array<{
      type: 'new_user' | 'returning_user' | 'device_type' | 'location';
      value: string;
    }>;
  };
  
  // Goals
  primaryGoal: string; // goal ID
  secondaryGoals?: string[];
  
  // Results
  results?: {
    participants: number;
    confidence: number;
    winner?: string;
    variants: Array<{
      variantId: string;
      participants: number;
      conversionRate: number;
      improvement: number; // percentage improvement over control
      significance: number;
    }>;
  };
  
  // Metadata
  createdBy: string;
  createdAt: string;
  startedAt?: string;
  endedAt?: string;
  lastUpdated: string;
}

export interface AnalyticsReport {
  id: string;
  name: string;
  description: string;
  type: 'standard' | 'custom' | 'scheduled';
  
  // Configuration
  dateRange: {
    start: string;
    end: string;
    preset?: 'today' | 'yesterday' | 'last_7_days' | 'last_30_days' | 'last_90_days' | 'custom';
  };
  
  metrics: Array<{
    name: string;
    type: 'sessions' | 'users' | 'pageviews' | 'events' | 'conversions' | 'revenue';
    aggregation: 'sum' | 'average' | 'count' | 'unique';
  }>;
  
  dimensions: Array<{
    name: string;
    type: 'page' | 'source' | 'device' | 'location' | 'time';
  }>;
  
  filters?: Array<{
    dimension: string;
    operator: 'equals' | 'contains' | 'in' | 'not_equals';
    value: string | string[];
  }>;
  
  // Data
  data: Array<Record<string, any>>;
  
  // Metadata
  generatedAt: string;
  generatedBy: string;
  expiresAt?: string;
}

export interface AnalyticsAlert {
  id: string;
  name: string;
  description: string;
  type: 'threshold' | 'anomaly' | 'goal_completion' | 'error_rate';
  
  // Conditions
  metric: string;
  threshold?: number;
  comparison: 'greater_than' | 'less_than' | 'equals' | 'percent_change';
  timeWindow: '5m' | '15m' | '1h' | '24h';
  
  // Notification settings
  enabled: boolean;
  channels: Array<{
    type: 'email' | 'slack' | 'webhook';
    config: Record<string, any>;
  }>;
  
  // State
  lastTriggered?: string;
  currentValue?: number;
  isTriggered: boolean;
  
  // Metadata
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserCohort {
  id: string;
  name: string;
  description: string;
  
  // Definition
  conditions: Array<{
    type: 'event' | 'property' | 'segment';
    property: string;
    operator: string;
    value: any;
    timeframe?: {
      start: string;
      end: string;
    };
  }>;
  
  // Metrics
  size: number;
  retentionRates: Array<{
    period: number; // days/weeks/months
    rate: number; // percentage
  }>;
  
  averageLifetimeValue?: number;
  averageSessionDuration: number;
  conversionRate: number;
  
  // Metadata
  createdAt: string;
  lastCalculated: string;
}

export interface PerformanceMetrics {
  // Core Web Vitals
  coreWebVitals: {
    lcp: { // Largest Contentful Paint
      value: number;
      rating: 'good' | 'needs-improvement' | 'poor';
      percentile75: number;
      percentile90: number;
    };
    fid: { // First Input Delay
      value: number;
      rating: 'good' | 'needs-improvement' | 'poor';
      percentile75: number;
      percentile90: number;
    };
    cls: { // Cumulative Layout Shift
      value: number;
      rating: 'good' | 'needs-improvement' | 'poor';
      percentile75: number;
      percentile90: number;
    };
  };
  
  // Other Performance Metrics
  loadMetrics: {
    ttfb: number; // Time to First Byte
    fcp: number; // First Contentful Paint
    tti: number; // Time to Interactive
    tbt: number; // Total Blocking Time
    si: number; // Speed Index
  };
  
  // Resource metrics
  resources: {
    totalSize: number;
    imageSize: number;
    scriptSize: number;
    cssSize: number;
    fontSize: number;
    
    resourceCount: {
      images: number;
      scripts: number;
      stylesheets: number;
      fonts: number;
      other: number;
    };
  };
  
  // User experience
  userExperience: {
    bounceRate: number;
    averageTimeOnPage: number;
    pagesPerSession: number;
    errorRate: number;
  };
}

// API Response Types
export interface AnalyticsAPIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    total?: number;
    page?: number;
    totalPages?: number;
    limit?: number;
    dateRange?: {
      start: string;
      end: string;
    };
  };
}

export type DashboardResponse = AnalyticsAPIResponse<AnalyticsDashboard>;
export type EventsResponse = AnalyticsAPIResponse<AnalyticsEvent[]>;
export type SessionsResponse = AnalyticsAPIResponse<UserSession[]>;
export type ReportResponse = AnalyticsAPIResponse<AnalyticsReport>;
export type ABTestResponse = AnalyticsAPIResponse<ABTest>;
export type HeatmapResponse = AnalyticsAPIResponse<HeatmapData>;
export type PerformanceResponse = AnalyticsAPIResponse<PerformanceMetrics>;