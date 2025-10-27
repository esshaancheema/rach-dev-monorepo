// Comprehensive Analytics and Reporting System for Zoptal
import { analytics } from './tracker';

export interface AnalyticsMetric {
  id: string;
  name: string;
  value: number;
  previousValue?: number;
  change?: number;
  changePercent?: number;
  trend: 'up' | 'down' | 'stable';
  format: 'number' | 'currency' | 'percentage' | 'duration';
  description?: string;
}

export interface AnalyticsReport {
  id: string;
  title: string;
  description: string;
  dateRange: {
    start: string;
    end: string;
  };
  metrics: AnalyticsMetric[];
  charts: AnalyticsChart[];
  insights: AnalyticsInsight[];
  generatedAt: string;
}

export interface AnalyticsChart {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'funnel' | 'heatmap';
  title: string;
  data: any[];
  config: {
    xAxis?: string;
    yAxis?: string;
    colors?: string[];
    labels?: string[];
  };
}

export interface AnalyticsInsight {
  id: string;
  type: 'improvement' | 'warning' | 'success' | 'info';
  title: string;
  description: string;
  recommendation?: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number; // 0-100
}

export interface ConversionFunnel {
  stage: string;
  visitors: number;
  conversions: number;
  conversionRate: number;
  dropOff: number;
  dropOffRate: number;
}

export interface UserSegment {
  id: string;
  name: string;
  description: string;
  criteria: {
    field: string;
    operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'between';
    value: any;
  }[];
  userCount: number;
  revenue: number;
  avgOrderValue: number;
  conversionRate: number;
}

export class AnalyticsReporting {
  private static instance: AnalyticsReporting;
  private readonly API_ENDPOINT = '/api/analytics';

  static getInstance(): AnalyticsReporting {
    if (!AnalyticsReporting.instance) {
      AnalyticsReporting.instance = new AnalyticsReporting();
    }
    return AnalyticsReporting.instance;
  }

  /**
   * Generate comprehensive business metrics report
   */
  async generateBusinessReport(
    dateRange: { start: string; end: string }
  ): Promise<AnalyticsReport> {
    try {
      const metrics = await this.getBusinessMetrics(dateRange);
      const charts = await this.getBusinessCharts(dateRange);
      const insights = await this.generateBusinessInsights(metrics);

      const report: AnalyticsReport = {
        id: `business-report-${Date.now()}`,
        title: 'Business Performance Report',
        description: 'Comprehensive overview of business metrics and performance',
        dateRange,
        metrics,
        charts,
        insights,
        generatedAt: new Date().toISOString()
      };

      analytics.track({
        name: 'business_report_generated',
        category: 'analytics',
        properties: {
          date_range: dateRange,
          metrics_count: metrics.length,
          insights_count: insights.length
        }
      });

      return report;
    } catch (error) {
      console.error('Failed to generate business report:', error);
      throw error;
    }
  }

  /**
   * Generate user behavior and engagement report
   */
  async generateUserReport(
    dateRange: { start: string; end: string }
  ): Promise<AnalyticsReport> {
    try {
      const metrics = await this.getUserMetrics(dateRange);
      const charts = await this.getUserCharts(dateRange);
      const insights = await this.generateUserInsights(metrics);

      const report: AnalyticsReport = {
        id: `user-report-${Date.now()}`,
        title: 'User Behavior & Engagement Report',
        description: 'Analysis of user behavior, engagement, and retention patterns',
        dateRange,
        metrics,
        charts,
        insights,
        generatedAt: new Date().toISOString()
      };

      return report;
    } catch (error) {
      console.error('Failed to generate user report:', error);
      throw error;
    }
  }

  /**
   * Generate conversion funnel analysis
   */
  async generateConversionFunnel(
    funnelSteps: string[],
    dateRange: { start: string; end: string }
  ): Promise<ConversionFunnel[]> {
    try {
      // In production, this would query actual analytics data
      const mockFunnelData: ConversionFunnel[] = [
        {
          stage: 'Website Visitors',
          visitors: 10000,
          conversions: 10000,
          conversionRate: 100,
          dropOff: 0,
          dropOffRate: 0
        },
        {
          stage: 'Service Page Views',
          visitors: 10000,
          conversions: 4500,
          conversionRate: 45,
          dropOff: 5500,
          dropOffRate: 55
        },
        {
          stage: 'Contact Form Started',
          visitors: 4500,
          conversions: 1800,
          conversionRate: 40,
          dropOff: 2700,
          dropOffRate: 60
        },
        {
          stage: 'Contact Form Completed',
          visitors: 1800,
          conversions: 1440,
          conversionRate: 80,
          dropOff: 360,
          dropOffRate: 20
        },
        {
          stage: 'Quote Requested',
          visitors: 1440,
          conversions: 720,
          conversionRate: 50,
          dropOff: 720,
          dropOffRate: 50
        },
        {
          stage: 'Quote Accepted',
          visitors: 720,
          conversions: 216,
          conversionRate: 30,
          dropOff: 504,
          dropOffRate: 70
        },
        {
          stage: 'Project Started',
          visitors: 216,
          conversions: 194,
          conversionRate: 90,
          dropOff: 22,
          dropOffRate: 10
        }
      ];

      analytics.track({
        name: 'conversion_funnel_analyzed',
        category: 'analytics',
        properties: {
          funnel_steps: funnelSteps.length,
          date_range: dateRange,
          overall_conversion_rate: mockFunnelData[mockFunnelData.length - 1].conversions / mockFunnelData[0].visitors * 100
        }
      });

      return mockFunnelData;
    } catch (error) {
      console.error('Failed to generate conversion funnel:', error);
      throw error;
    }
  }

  /**
   * Generate user segments for targeted analysis
   */
  async generateUserSegments(): Promise<UserSegment[]> {
    try {
      // In production, this would analyze actual user data
      const segments: UserSegment[] = [
        {
          id: 'high-value-clients',
          name: 'High-Value Clients',
          description: 'Clients with projects over $50k',
          criteria: [
            { field: 'total_spent', operator: 'greater_than', value: 50000 }
          ],
          userCount: 45,
          revenue: 3250000,
          avgOrderValue: 72222,
          conversionRate: 85.5
        },
        {
          id: 'enterprise-prospects',
          name: 'Enterprise Prospects',
          description: 'Users from companies with 500+ employees',
          criteria: [
            { field: 'company_size', operator: 'greater_than', value: 500 }
          ],
          userCount: 127,
          revenue: 0,
          avgOrderValue: 0,
          conversionRate: 12.3
        },
        {
          id: 'startup-clients',
          name: 'Startup Clients',
          description: 'Clients from startup companies',
          criteria: [
            { field: 'company_type', operator: 'equals', value: 'startup' }
          ],
          userCount: 89,
          revenue: 445000,
          avgOrderValue: 5000,
          conversionRate: 67.8
        },
        {
          id: 'repeat-customers',
          name: 'Repeat Customers',
          description: 'Clients with multiple projects',
          criteria: [
            { field: 'project_count', operator: 'greater_than', value: 1 }
          ],
          userCount: 34,
          revenue: 1850000,
          avgOrderValue: 54412,
          conversionRate: 94.2
        },
        {
          id: 'mobile-users',
          name: 'Mobile-First Users',
          description: 'Users primarily accessing via mobile',
          criteria: [
            { field: 'mobile_sessions_percent', operator: 'greater_than', value: 70 }
          ],
          userCount: 156,
          revenue: 125000,
          avgOrderValue: 3500,
          conversionRate: 23.1
        }
      ];

      return segments;
    } catch (error) {
      console.error('Failed to generate user segments:', error);
      throw error;
    }
  }

  /**
   * Get real-time analytics data
   */
  async getRealTimeMetrics(): Promise<{
    activeUsers: number;
    pageViews: number;
    conversions: number;
    revenue: number;
    topPages: Array<{ page: string; views: number; }>;
    topSources: Array<{ source: string; users: number; }>;
  }> {
    try {
      // In production, this would connect to real-time analytics
      const realTimeData = {
        activeUsers: Math.floor(Math.random() * 50) + 10,
        pageViews: Math.floor(Math.random() * 200) + 50,
        conversions: Math.floor(Math.random() * 5) + 1,
        revenue: Math.floor(Math.random() * 10000) + 1000,
        topPages: [
          { page: '/services', views: 45 },
          { page: '/about', views: 32 },
          { page: '/contact', views: 28 },
          { page: '/blog', views: 23 },
          { page: '/portfolio', views: 19 }
        ],
        topSources: [
          { source: 'Google', users: 67 },
          { source: 'Direct', users: 34 },
          { source: 'LinkedIn', users: 23 },
          { source: 'Twitter', users: 12 },
          { source: 'GitHub', users: 8 }
        ]
      };

      return realTimeData;
    } catch (error) {
      console.error('Failed to get real-time metrics:', error);
      throw error;
    }
  }

  /**
   * Export analytics data in various formats
   */
  async exportData(
    reportType: string,
    format: 'csv' | 'pdf' | 'xlsx',
    dateRange: { start: string; end: string }
  ): Promise<Blob> {
    try {
      const response = await fetch(`${this.API_ENDPOINT}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportType,
          format,
          dateRange
        })
      });

      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      analytics.track({
        name: 'analytics_data_exported',
        category: 'analytics',
        properties: {
          report_type: reportType,
          format,
          date_range: dateRange
        }
      });

      return await response.blob();
    } catch (error) {
      console.error('Failed to export data:', error);
      throw error;
    }
  }

  /**
   * Private helper methods for generating specific reports
   */
  private async getBusinessMetrics(
    dateRange: { start: string; end: string }
  ): Promise<AnalyticsMetric[]> {
    // In production, this would query actual business data
    const metrics: AnalyticsMetric[] = [
      {
        id: 'total-revenue',
        name: 'Total Revenue',
        value: 1250000,
        previousValue: 1050000,
        change: 200000,
        changePercent: 19.05,
        trend: 'up',
        format: 'currency',
        description: 'Total revenue from all projects and services'
      },
      {
        id: 'monthly-recurring-revenue',
        name: 'Monthly Recurring Revenue',
        value: 185000,
        previousValue: 162000,
        change: 23000,
        changePercent: 14.20,
        trend: 'up',
        format: 'currency',
        description: 'Predictable monthly revenue from ongoing projects'
      },
      {
        id: 'avg-project-value',
        name: 'Average Project Value',
        value: 45000,
        previousValue: 42000,
        change: 3000,
        changePercent: 7.14,
        trend: 'up',
        format: 'currency',
        description: 'Average value of completed projects'
      },
      {
        id: 'client-acquisition-cost',
        name: 'Client Acquisition Cost',
        value: 2500,
        previousValue: 2800,
        change: -300,
        changePercent: -10.71,
        trend: 'up',
        format: 'currency',
        description: 'Cost to acquire a new client'
      },
      {
        id: 'client-retention-rate',
        name: 'Client Retention Rate',
        value: 85.5,
        previousValue: 82.3,
        change: 3.2,
        changePercent: 3.89,
        trend: 'up',
        format: 'percentage',
        description: 'Percentage of clients who return for additional projects'
      },
      {
        id: 'project-completion-rate',
        name: 'Project Completion Rate',
        value: 94.2,
        previousValue: 91.8,
        change: 2.4,
        changePercent: 2.61,
        trend: 'up',
        format: 'percentage',
        description: 'Percentage of projects completed successfully'
      }
    ];

    return metrics;
  }

  private async getBusinessCharts(
    dateRange: { start: string; end: string }
  ): Promise<AnalyticsChart[]> {
    const charts: AnalyticsChart[] = [
      {
        id: 'revenue-trend',
        type: 'line',
        title: 'Revenue Trend',
        data: [
          { month: 'Jan', revenue: 180000 },
          { month: 'Feb', revenue: 195000 },
          { month: 'Mar', revenue: 210000 },
          { month: 'Apr', revenue: 185000 },
          { month: 'May', revenue: 225000 },
          { month: 'Jun', revenue: 240000 },
          { month: 'Jul', revenue: 255000 }
        ],
        config: {
          xAxis: 'month',
          yAxis: 'revenue',
          colors: ['#3b82f6']
        }
      },
      {
        id: 'service-distribution',
        type: 'pie',
        title: 'Revenue by Service Type',
        data: [
          { service: 'Web Development', revenue: 450000, percentage: 36 },
          { service: 'Mobile Apps', revenue: 350000, percentage: 28 },
          { service: 'AI Solutions', revenue: 250000, percentage: 20 },
          { service: 'Consulting', revenue: 200000, percentage: 16 }
        ],
        config: {
          colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
        }
      }
    ];

    return charts;
  }

  private async getUserMetrics(
    dateRange: { start: string; end: string }
  ): Promise<AnalyticsMetric[]> {
    const metrics: AnalyticsMetric[] = [
      {
        id: 'total-users',
        name: 'Total Users',
        value: 2847,
        previousValue: 2654,
        change: 193,
        changePercent: 7.27,
        trend: 'up',
        format: 'number',
        description: 'Total registered users on the platform'
      },
      {
        id: 'active-users',
        name: 'Monthly Active Users',
        value: 1456,
        previousValue: 1298,
        change: 158,
        changePercent: 12.17,
        trend: 'up',
        format: 'number',
        description: 'Users who logged in during the past 30 days'
      },
      {
        id: 'session-duration',
        name: 'Average Session Duration',
        value: 245,
        previousValue: 220,
        change: 25,
        changePercent: 11.36,
        trend: 'up',
        format: 'duration',
        description: 'Average time users spend on the platform per session'
      },
      {
        id: 'bounce-rate',
        name: 'Bounce Rate',
        value: 32.5,
        previousValue: 35.8,
        change: -3.3,
        changePercent: -9.22,
        trend: 'up',
        format: 'percentage',
        description: 'Percentage of single-page sessions'
      }
    ];

    return metrics;
  }

  private async getUserCharts(
    dateRange: { start: string; end: string }
  ): Promise<AnalyticsChart[]> {
    const charts: AnalyticsChart[] = [
      {
        id: 'user-growth',
        type: 'line',
        title: 'User Growth Over Time',
        data: [
          { month: 'Jan', users: 2100 },
          { month: 'Feb', users: 2250 },
          { month: 'Mar', users: 2400 },
          { month: 'Apr', users: 2550 },
          { month: 'May', users: 2650 },
          { month: 'Jun', users: 2750 },
          { month: 'Jul', users: 2847 }
        ],
        config: {
          xAxis: 'month',
          yAxis: 'users',
          colors: ['#10b981']
        }
      },
      {
        id: 'user-acquisition-channels',
        type: 'bar',
        title: 'User Acquisition Channels',
        data: [
          { channel: 'Organic Search', users: 1245 },
          { channel: 'Direct', users: 567 },
          { channel: 'Social Media', users: 345 },
          { channel: 'Referrals', users: 289 },
          { channel: 'Paid Ads', users: 234 },
          { channel: 'Email', users: 167 }
        ],
        config: {
          xAxis: 'channel',
          yAxis: 'users',
          colors: ['#8b5cf6']
        }
      }
    ];

    return charts;
  }

  private async generateBusinessInsights(
    metrics: AnalyticsMetric[]
  ): Promise<AnalyticsInsight[]> {
    const insights: AnalyticsInsight[] = [
      {
        id: 'revenue-growth',
        type: 'success',
        title: 'Strong Revenue Growth',
        description: 'Revenue has increased by 19% compared to the previous period, indicating healthy business growth.',
        recommendation: 'Continue current marketing and sales strategies while exploring opportunities to scale.',
        impact: 'high',
        confidence: 92
      },
      {
        id: 'client-retention',
        type: 'improvement',
        title: 'Client Retention Opportunity',
        description: 'While retention rate is good at 85.5%, there\'s room for improvement to reach industry benchmarks of 90%+.',
        recommendation: 'Implement a client success program and regular check-ins to improve retention.',
        impact: 'medium',
        confidence: 78
      },
      {
        id: 'acquisition-cost',
        type: 'success',
        title: 'Improved Acquisition Efficiency',
        description: 'Client acquisition cost has decreased by 10.7%, showing improved marketing efficiency.',
        recommendation: 'Analyze which channels are performing best and allocate more budget to them.',
        impact: 'medium',
        confidence: 85
      }
    ];

    return insights;
  }

  private async generateUserInsights(
    metrics: AnalyticsMetric[]
  ): Promise<AnalyticsInsight[]> {
    const insights: AnalyticsInsight[] = [
      {
        id: 'user-engagement',
        type: 'success',
        title: 'Increased User Engagement',
        description: 'Session duration has increased by 11%, indicating users are finding more value in the platform.',
        recommendation: 'Continue improving user experience and add more engaging content.',
        impact: 'high',
        confidence: 88
      },
      {
        id: 'bounce-rate-improvement',
        type: 'success',
        title: 'Bounce Rate Improvement',
        description: 'Bounce rate has decreased by 9.2%, showing better user retention on landing pages.',
        recommendation: 'Analyze which pages have the lowest bounce rates and apply those learnings to other pages.',
        impact: 'medium',
        confidence: 82
      },
      {
        id: 'mobile-optimization',
        type: 'warning',
        title: 'Mobile Experience Needs Attention',
        description: 'Mobile users have a 15% higher bounce rate compared to desktop users.',
        recommendation: 'Prioritize mobile optimization and ensure all features work seamlessly on mobile devices.',
        impact: 'high',
        confidence: 90
      }
    ];

    return insights;
  }
}

// Export singleton instance
export const analyticsReporting = AnalyticsReporting.getInstance();

// Utility functions for formatting metrics
export const formatMetricValue = (value: number, format: string): string => {
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    case 'percentage':
      return `${value.toFixed(1)}%`;
    case 'duration':
      const minutes = Math.floor(value / 60);
      const seconds = value % 60;
      return `${minutes}m ${seconds}s`;
    case 'number':
    default:
      return new Intl.NumberFormat('en-US').format(value);
  }
};

export const getMetricTrendIcon = (trend: string): string => {
  switch (trend) {
    case 'up': return '↗️';
    case 'down': return '↘️';
    case 'stable': return '→';
    default: return '→';
  }
};

export const getInsightTypeColor = (type: string): string => {
  switch (type) {
    case 'success': return 'text-green-600 bg-green-100';
    case 'warning': return 'text-yellow-600 bg-yellow-100';
    case 'improvement': return 'text-blue-600 bg-blue-100';
    case 'info': return 'text-gray-600 bg-gray-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};