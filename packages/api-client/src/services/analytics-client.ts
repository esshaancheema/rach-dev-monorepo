import { BaseApiClient } from '../base-client';
import { 
  ApiClientConfig, 
  AnalyticsEvent,
  AnalyticsQuery,
  PaginatedResponse,
  PaginationParams 
} from '../types';

export interface EventDefinition {
  name: string;
  description: string;
  properties: Array<{
    name: string;
    type: 'string' | 'number' | 'boolean' | 'date';
    required: boolean;
    description?: string;
  }>;
  category: string;
}

export interface MetricDefinition {
  name: string;
  description: string;
  type: 'count' | 'sum' | 'avg' | 'min' | 'max' | 'unique';
  eventName?: string;
  propertyName?: string;
  filters?: Record<string, any>;
}

export interface Dashboard {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  widgets: Array<{
    id: string;
    type: 'chart' | 'metric' | 'table' | 'funnel';
    title: string;
    query: AnalyticsQuery;
    visualization: {
      chartType?: 'line' | 'bar' | 'pie' | 'area';
      groupBy?: string;
      timeGranularity?: 'hour' | 'day' | 'week' | 'month';
    };
    position: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface Funnel {
  id: string;
  name: string;
  description?: string;
  steps: Array<{
    name: string;
    eventName: string;
    filters?: Record<string, any>;
  }>;
  timeWindow: number; // hours
  createdAt: string;
}

export interface Cohort {
  id: string;
  name: string;
  description?: string;
  definition: {
    eventName: string;
    filters?: Record<string, any>;
    dateRange: {
      start: string;
      end: string;
    };
  };
  userCount: number;
  createdAt: string;
}

export interface AnalyticsResult {
  data: Array<{
    date?: string;
    value: number;
    dimensions?: Record<string, any>;
  }>;
  total: number;
  previousPeriod?: {
    total: number;
    change: number;
    changePercent: number;
  };
  metadata: {
    query: AnalyticsQuery;
    executionTime: number;
    dataPoints: number;
  };
}

export class AnalyticsClient extends BaseApiClient {
  constructor(config: ApiClientConfig = {}) {
    super({
      baseURL: process.env.NEXT_PUBLIC_ANALYTICS_SERVICE_URL || 'http://localhost:4006',
      ...config,
    });
  }

  // Event tracking
  async trackEvent(event: AnalyticsEvent) {
    return this.post('/analytics/events', event);
  }

  async trackEvents(events: AnalyticsEvent[]) {
    return this.post('/analytics/events/batch', { events });
  }

  async getEvents(params: PaginationParams & {
    startDate?: string;
    endDate?: string;
    eventName?: string;
    userId?: string;
    sessionId?: string;
  } = {}) {
    return this.get<PaginatedResponse<AnalyticsEvent>>('/analytics/events', params);
  }

  // Queries and metrics
  async query(query: AnalyticsQuery) {
    return this.post<AnalyticsResult>('/analytics/query', query);
  }

  async getMetric(metricName: string, params: {
    startDate: string;
    endDate: string;
    groupBy?: string;
    filters?: Record<string, any>;
    comparePreviousPeriod?: boolean;
  }) {
    return this.get<AnalyticsResult>(`/analytics/metrics/${metricName}`, params);
  }

  async getRealtimeMetrics() {
    return this.get<{
      activeUsers: number;
      eventsLastHour: number;
      eventsLastMinute: number;
      topEvents: Array<{
        name: string;
        count: number;
      }>;
      topPages: Array<{
        path: string;
        views: number;
      }>;
    }>('/analytics/realtime');
  }

  // User analytics
  async getUserAnalytics(userId: string, params: {
    startDate: string;
    endDate: string;
  }) {
    return this.get<{
      sessions: number;
      events: number;
      firstSeen: string;
      lastSeen: string;
      properties: Record<string, any>;
      eventTimeline: Array<{
        event: string;
        timestamp: string;
        properties: Record<string, any>;
      }>;
    }>(`/analytics/users/${userId}`, params);
  }

  async getUserSegment(userId: string) {
    return this.get<{
      segments: string[];
      cohorts: string[];
      score: number;
      lifecycle: 'new' | 'active' | 'returning' | 'dormant' | 'churned';
    }>(`/analytics/users/${userId}/segment`);
  }

  async searchUsers(params: {
    query?: string;
    filters?: Record<string, any>;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } & PaginationParams) {
    return this.get<PaginatedResponse<{
      userId: string;
      firstSeen: string;
      lastSeen: string;
      events: number;
      sessions: number;
      properties: Record<string, any>;
    }>>('/analytics/users/search', params);
  }

  // Session analytics
  async getSessionAnalytics(params: {
    startDate: string;
    endDate: string;
    groupBy?: 'day' | 'week' | 'month';
  }) {
    return this.get<{
      totalSessions: number;
      averageDuration: number;
      bounceRate: number;
      newUsers: number;
      returningUsers: number;
      timeline: Array<{
        date: string;
        sessions: number;
        users: number;
        newUsers: number;
        avgDuration: number;
      }>;
    }>('/analytics/sessions', params);
  }

  // Page/screen analytics
  async getPageAnalytics(params: {
    startDate: string;
    endDate: string;
    path?: string;
  }) {
    return this.get<{
      totalViews: number;
      uniqueViews: number;
      averageTime: number;
      bounceRate: number;
      topPages: Array<{
        path: string;
        views: number;
        uniqueViews: number;
        avgTime: number;
        bounceRate: number;
      }>;
      entryPages: Array<{
        path: string;
        entries: number;
        bounceRate: number;
      }>;
      exitPages: Array<{
        path: string;
        exits: number;
        exitRate: number;
      }>;
    }>('/analytics/pages', params);
  }

  // Custom event analytics
  async getEventAnalytics(eventName: string, params: {
    startDate: string;
    endDate: string;
    groupBy?: string;
    filters?: Record<string, any>;
  }) {
    return this.get<{
      totalEvents: number;
      uniqueUsers: number;
      averagePerUser: number;
      timeline: Array<{
        date: string;
        count: number;
        users: number;
      }>;
      topProperties: Array<{
        property: string;
        value: string;
        count: number;
      }>;
    }>(`/analytics/events/${eventName}`, params);
  }

  // Funnels
  async getFunnels() {
    return this.get<Funnel[]>('/analytics/funnels');
  }

  async getFunnel(funnelId: string) {
    return this.get<Funnel>(`/analytics/funnels/${funnelId}`);
  }

  async createFunnel(data: {
    name: string;
    description?: string;
    steps: Array<{
      name: string;
      eventName: string;
      filters?: Record<string, any>;
    }>;
    timeWindow: number;
  }) {
    return this.post<Funnel>('/analytics/funnels', data);
  }

  async updateFunnel(funnelId: string, data: Partial<{
    name: string;
    description: string;
    steps: Array<{
      name: string;
      eventName: string;
      filters?: Record<string, any>;
    }>;
    timeWindow: number;
  }>) {
    return this.put<Funnel>(`/analytics/funnels/${funnelId}`, data);
  }

  async deleteFunnel(funnelId: string) {
    return this.delete(`/analytics/funnels/${funnelId}`);
  }

  async analyzeFunnel(funnelId: string, params: {
    startDate: string;
    endDate: string;
    groupBy?: string;
  }) {
    return this.get<{
      totalUsers: number;
      completionRate: number;
      steps: Array<{
        name: string;
        users: number;
        conversionRate: number;
        dropoffRate: number;
      }>;
      timeline?: Array<{
        date: string;
        steps: Array<{
          users: number;
          conversionRate: number;
        }>;
      }>;
    }>(`/analytics/funnels/${funnelId}/analyze`, params);
  }

  // Cohorts
  async getCohorts() {
    return this.get<Cohort[]>('/analytics/cohorts');
  }

  async getCohort(cohortId: string) {
    return this.get<Cohort>(`/analytics/cohorts/${cohortId}`);
  }

  async createCohort(data: {
    name: string;
    description?: string;
    definition: {
      eventName: string;
      filters?: Record<string, any>;
      dateRange: {
        start: string;
        end: string;
      };
    };
  }) {
    return this.post<Cohort>('/analytics/cohorts', data);
  }

  async deleteCohort(cohortId: string) {
    return this.delete(`/analytics/cohorts/${cohortId}`);
  }

  async analyzeCohort(cohortId: string, params: {
    metric: string;
    periods: number;
    granularity: 'day' | 'week' | 'month';
  }) {
    return this.get<{
      cohortSize: number;
      periods: Array<{
        period: number;
        label: string;
        retentionRate: number;
        users: number;
      }>;
      heatmap: Array<Array<{
        period: number;
        cohort: string;
        value: number;
        users: number;
      }>>;
    }>(`/analytics/cohorts/${cohortId}/analyze`, params);
  }

  // Dashboards
  async getDashboards() {
    return this.get<Dashboard[]>('/analytics/dashboards');
  }

  async getDashboard(dashboardId: string) {
    return this.get<Dashboard>(`/analytics/dashboards/${dashboardId}`);
  }

  async createDashboard(data: {
    name: string;
    description?: string;
    isPublic?: boolean;
  }) {
    return this.post<Dashboard>('/analytics/dashboards', data);
  }

  async updateDashboard(dashboardId: string, data: Partial<Dashboard>) {
    return this.put<Dashboard>(`/analytics/dashboards/${dashboardId}`, data);
  }

  async deleteDashboard(dashboardId: string) {
    return this.delete(`/analytics/dashboards/${dashboardId}`);
  }

  async cloneDashboard(dashboardId: string, name: string) {
    return this.post<Dashboard>(`/analytics/dashboards/${dashboardId}/clone`, { name });
  }

  // Event definitions and schema
  async getEventDefinitions() {
    return this.get<EventDefinition[]>('/analytics/schema/events');
  }

  async createEventDefinition(definition: EventDefinition) {
    return this.post<EventDefinition>('/analytics/schema/events', definition);
  }

  async updateEventDefinition(eventName: string, definition: Partial<EventDefinition>) {
    return this.put<EventDefinition>(`/analytics/schema/events/${eventName}`, definition);
  }

  async deleteEventDefinition(eventName: string) {
    return this.delete(`/analytics/schema/events/${eventName}`);
  }

  // Data export
  async exportData(params: {
    format: 'csv' | 'json' | 'parquet';
    query: AnalyticsQuery;
    email?: string;
  }) {
    return this.post<{
      exportId: string;
      status: 'pending' | 'processing' | 'completed' | 'failed';
      downloadUrl?: string;
    }>('/analytics/export', params);
  }

  async getExportStatus(exportId: string) {
    return this.get<{
      id: string;
      status: 'pending' | 'processing' | 'completed' | 'failed';
      downloadUrl?: string;
      error?: string;
      progress?: number;
      createdAt: string;
      completedAt?: string;
    }>(`/analytics/export/${exportId}`);
  }

  // Settings and configuration
  async getSettings() {
    return this.get<{
      dataRetentionDays: number;
      samplingRate: number;
      anonymizeIp: boolean;
      respectDoNotTrack: boolean;
      gdprCompliant: boolean;
      sessionTimeout: number;
    }>('/analytics/settings');
  }

  async updateSettings(settings: {
    dataRetentionDays?: number;
    samplingRate?: number;
    anonymizeIp?: boolean;
    respectDoNotTrack?: boolean;
    sessionTimeout?: number;
  }) {
    return this.put('/analytics/settings', settings);
  }
}