import { logger } from '../utils/logger';
import { AnalyticsEngine, AnalyticsQuery } from './analytics-engine.service';
import { CacheService } from './cache.service';
import { ChartService } from './chart.service';

export interface Dashboard {
  id: string;
  name: string;
  description?: string;
  layout: DashboardLayout;
  widgets: DashboardWidget[];
  filters: DashboardFilter[];
  settings: DashboardSettings;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  tags: string[];
}

export interface DashboardLayout {
  type: 'grid' | 'flex';
  columns: number;
  gap: number;
  responsive: boolean;
}

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'text' | 'iframe';
  title: string;
  description?: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  config: WidgetConfig;
  refreshInterval?: number; // in seconds
  lastRefreshed?: Date;
}

export interface WidgetConfig {
  // Chart widget config
  chartType?: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'heatmap' | 'gauge' | 'funnel';
  metrics?: string[];
  dimensions?: string[];
  filters?: Record<string, any>;
  timeRange?: {
    start: Date;
    end: Date;
  } | {
    relative: string; // e.g., 'last_7_days', 'last_30_days'
  };
  
  // Metric widget config
  metric?: string;
  target?: number;
  format?: 'number' | 'percentage' | 'currency' | 'duration';
  showTrend?: boolean;
  showSparkline?: boolean;
  
  // Table widget config
  columns?: Array<{
    field: string;
    title: string;
    type: 'string' | 'number' | 'date' | 'boolean';
    format?: string;
    sortable?: boolean;
  }>;
  pagination?: boolean;
  pageSize?: number;
  
  // Text widget config
  content?: string;
  markdown?: boolean;
  
  // iframe widget config
  url?: string;
  height?: number;
  
  // Common styling
  styling?: {
    backgroundColor?: string;
    textColor?: string;
    borderColor?: string;
    borderRadius?: number;
    padding?: number;
    fontSize?: number;
  };
}

export interface DashboardFilter {
  id: string;
  field: string;
  type: 'select' | 'multiselect' | 'daterange' | 'text' | 'number';
  label: string;
  defaultValue?: any;
  options?: Array<{ label: string; value: any }>;
  required?: boolean;
}

export interface DashboardSettings {
  theme: 'light' | 'dark' | 'auto';
  refreshInterval: number; // in seconds
  autoRefresh: boolean;
  timezone: string;
  showFilters: boolean;
  showLegend: boolean;
  allowExport: boolean;
  allowShare: boolean;
}

export interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail?: string;
  dashboard: Omit<Dashboard, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>;
}

export class DashboardService {
  private templates: Map<string, DashboardTemplate> = new Map();

  constructor(
    private analyticsEngine: AnalyticsEngine,
    private cacheService?: CacheService,
    private chartService?: ChartService
  ) {
    this.initializeDefaultTemplates();
  }

  public async createDashboard(
    dashboardData: Omit<Dashboard, 'id' | 'createdAt' | 'updatedAt'>,
    userId: string
  ): Promise<Dashboard> {
    const dashboard: Dashboard = {
      ...dashboardData,
      id: this.generateDashboardId(),
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Validate dashboard configuration
    await this.validateDashboard(dashboard);

    // Store dashboard (in a real implementation, this would go to a database)
    await this.storeDashboard(dashboard);

    logger.info('Dashboard created successfully', { dashboardId: dashboard.id, userId });
    return dashboard;
  }

  public async updateDashboard(
    dashboardId: string,
    updates: Partial<Dashboard>,
    userId: string
  ): Promise<Dashboard> {
    const dashboard = await this.getDashboard(dashboardId);
    
    if (!dashboard) {
      throw new Error('Dashboard not found');
    }

    // Check permissions
    if (dashboard.createdBy !== userId && !dashboard.isPublic) {
      throw new Error('Insufficient permissions to update dashboard');
    }

    const updatedDashboard: Dashboard = {
      ...dashboard,
      ...updates,
      updatedAt: new Date(),
    };

    // Validate updated dashboard
    await this.validateDashboard(updatedDashboard);

    // Store updated dashboard
    await this.storeDashboard(updatedDashboard);

    logger.info('Dashboard updated successfully', { dashboardId, userId });
    return updatedDashboard;
  }

  public async getDashboard(dashboardId: string): Promise<Dashboard | null> {
    // In a real implementation, this would fetch from a database
    const cacheKey = `dashboard:${dashboardId}`;
    
    if (this.cacheService) {
      const cached = await this.cacheService.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Simulate database fetch
    // const dashboard = await this.database.findDashboard(dashboardId);
    const dashboard = null; // Placeholder

    if (dashboard && this.cacheService) {
      await this.cacheService.set(cacheKey, dashboard, 300); // 5 minutes cache
    }

    return dashboard;
  }

  public async getDashboardData(
    dashboardId: string,
    filters: Record<string, any> = {}
  ): Promise<{
    dashboard: Dashboard;
    widgetData: Map<string, any>;
  }> {
    const dashboard = await this.getDashboard(dashboardId);
    
    if (!dashboard) {
      throw new Error('Dashboard not found');
    }

    const widgetData = new Map<string, any>();

    // Fetch data for each widget
    await Promise.all(
      dashboard.widgets.map(async (widget) => {
        try {
          const data = await this.getWidgetData(widget, filters);
          widgetData.set(widget.id, data);
        } catch (error) {
          logger.error(`Failed to fetch data for widget ${widget.id}:`, error);
          widgetData.set(widget.id, { error: error.message });
        }
      })
    );

    return { dashboard, widgetData };
  }

  public async getWidgetData(
    widget: DashboardWidget,
    globalFilters: Record<string, any> = {}
  ): Promise<any> {
    const { config } = widget;

    switch (widget.type) {
      case 'chart':
        return this.getChartData(widget, globalFilters);
      
      case 'metric':
        return this.getMetricData(widget, globalFilters);
      
      case 'table':
        return this.getTableData(widget, globalFilters);
      
      case 'text':
        return this.getTextData(widget);
      
      case 'iframe':
        return this.getIframeData(widget);
      
      default:
        throw new Error(`Unsupported widget type: ${widget.type}`);
    }
  }

  private async getChartData(
    widget: DashboardWidget,
    globalFilters: Record<string, any>
  ): Promise<any> {
    const { config } = widget;
    
    if (!config.metrics || !config.chartType) {
      throw new Error('Chart widget requires metrics and chartType');
    }

    // Merge widget filters with global filters
    const filters = { ...config.filters, ...globalFilters };
    
    // Resolve time range
    const timeRange = this.resolveTimeRange(config.timeRange);

    const query: AnalyticsQuery = {
      metrics: config.metrics,
      dimensions: config.dimensions || [],
      filters,
      timeRange,
      granularity: this.inferGranularity(timeRange),
    };

    const result = await this.analyticsEngine.query(query);

    // Format data for chart
    const chartData = this.formatChartData(result.data, config.chartType, config.metrics, config.dimensions);

    return {
      chartType: config.chartType,
      data: chartData,
      metadata: result.metadata,
      insights: result.insights,
    };
  }

  private async getMetricData(
    widget: DashboardWidget,
    globalFilters: Record<string, any>
  ): Promise<any> {
    const { config } = widget;
    
    if (!config.metric) {
      throw new Error('Metric widget requires a metric');
    }

    const filters = { ...config.filters, ...globalFilters };
    const timeRange = this.resolveTimeRange(config.timeRange);

    const query: AnalyticsQuery = {
      metrics: [config.metric],
      dimensions: [],
      filters,
      timeRange,
      granularity: 'day',
    };

    const result = await this.analyticsEngine.query(query);
    const currentValue = result.data[0]?.[config.metric] || 0;

    // Get previous period for trend calculation
    const previousTimeRange = this.getPreviousTimeRange(timeRange);
    const previousQuery: AnalyticsQuery = {
      ...query,
      timeRange: previousTimeRange,
    };

    const previousResult = await this.analyticsEngine.query(previousQuery);
    const previousValue = previousResult.data[0]?.[config.metric] || 0;

    // Calculate trend
    const trend = this.calculateTrend(currentValue, previousValue);

    // Get sparkline data if requested
    let sparklineData;
    if (config.showSparkline) {
      const sparklineQuery: AnalyticsQuery = {
        ...query,
        dimensions: ['date'],
        granularity: this.inferSparklineGranularity(timeRange),
      };
      
      const sparklineResult = await this.analyticsEngine.query(sparklineQuery);
      sparklineData = sparklineResult.data.map(row => ({
        date: row.date,
        value: row[config.metric] || 0,
      }));
    }

    return {
      value: currentValue,
      previousValue,
      trend,
      target: config.target,
      format: config.format || 'number',
      sparklineData: config.showSparkline ? sparklineData : undefined,
      metadata: result.metadata,
    };
  }

  private async getTableData(
    widget: DashboardWidget,
    globalFilters: Record<string, any>
  ): Promise<any> {
    const { config } = widget;
    
    if (!config.columns) {
      throw new Error('Table widget requires columns configuration');
    }

    const metrics = config.columns
      .filter(col => col.type === 'number')
      .map(col => col.field);
    
    const dimensions = config.columns
      .filter(col => col.type !== 'number')
      .map(col => col.field);

    const filters = { ...config.filters, ...globalFilters };
    const timeRange = this.resolveTimeRange(config.timeRange);

    const query: AnalyticsQuery = {
      metrics,
      dimensions,
      filters,
      timeRange,
      granularity: 'day',
      limit: config.pageSize || 100,
    };

    const result = await this.analyticsEngine.query(query);

    return {
      columns: config.columns,
      data: result.data,
      totalRows: result.metadata.totalRows,
      pagination: config.pagination || false,
      pageSize: config.pageSize || 100,
      metadata: result.metadata,
    };
  }

  private getTextData(widget: DashboardWidget): any {
    return {
      content: widget.config.content || '',
      markdown: widget.config.markdown || false,
    };
  }

  private getIframeData(widget: DashboardWidget): any {
    return {
      url: widget.config.url,
      height: widget.config.height || 400,
    };
  }

  public async getDashboardTemplates(): Promise<DashboardTemplate[]> {
    return Array.from(this.templates.values());
  }

  public async createDashboardFromTemplate(
    templateId: string,
    name: string,
    userId: string
  ): Promise<Dashboard> {
    const template = this.templates.get(templateId);
    
    if (!template) {
      throw new Error('Template not found');
    }

    const dashboardData = {
      ...template.dashboard,
      name,
    };

    return this.createDashboard(dashboardData, userId);
  }

  public async exportDashboard(
    dashboardId: string,
    format: 'json' | 'pdf' | 'png'
  ): Promise<Buffer | object> {
    const { dashboard, widgetData } = await this.getDashboardData(dashboardId);

    switch (format) {
      case 'json':
        return {
          dashboard,
          data: Object.fromEntries(widgetData),
          exportedAt: new Date().toISOString(),
        };
      
      case 'pdf':
        return this.exportToPDF(dashboard, widgetData);
      
      case 'png':
        return this.exportToPNG(dashboard, widgetData);
      
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  private async validateDashboard(dashboard: Dashboard): Promise<void> {
    // Validate basic structure
    if (!dashboard.name || dashboard.name.trim() === '') {
      throw new Error('Dashboard name is required');
    }

    if (!dashboard.widgets || dashboard.widgets.length === 0) {
      throw new Error('Dashboard must have at least one widget');
    }

    // Validate widgets
    for (const widget of dashboard.widgets) {
      await this.validateWidget(widget);
    }

    // Validate filters
    for (const filter of dashboard.filters) {
      this.validateFilter(filter);
    }
  }

  private async validateWidget(widget: DashboardWidget): Promise<void> {
    if (!widget.title || widget.title.trim() === '') {
      throw new Error('Widget title is required');
    }

    if (!['chart', 'metric', 'table', 'text', 'iframe'].includes(widget.type)) {
      throw new Error(`Invalid widget type: ${widget.type}`);
    }

    // Type-specific validation
    switch (widget.type) {
      case 'chart':
        if (!widget.config.metrics || widget.config.metrics.length === 0) {
          throw new Error('Chart widget requires at least one metric');
        }
        if (!widget.config.chartType) {
          throw new Error('Chart widget requires chartType');
        }
        break;
      
      case 'metric':
        if (!widget.config.metric) {
          throw new Error('Metric widget requires a metric');
        }
        break;
      
      case 'table':
        if (!widget.config.columns || widget.config.columns.length === 0) {
          throw new Error('Table widget requires columns');
        }
        break;
      
      case 'iframe':
        if (!widget.config.url) {
          throw new Error('iframe widget requires a URL');
        }
        break;
    }
  }

  private validateFilter(filter: DashboardFilter): void {
    if (!filter.field || filter.field.trim() === '') {
      throw new Error('Filter field is required');
    }

    if (!filter.label || filter.label.trim() === '') {
      throw new Error('Filter label is required');
    }

    if (!['select', 'multiselect', 'daterange', 'text', 'number'].includes(filter.type)) {
      throw new Error(`Invalid filter type: ${filter.type}`);
    }
  }

  private resolveTimeRange(timeRange?: any): { start: Date; end: Date } {
    if (!timeRange) {
      // Default to last 30 days
      const end = new Date();
      const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
      return { start, end };
    }

    if ('start' in timeRange && 'end' in timeRange) {
      return timeRange;
    }

    if ('relative' in timeRange) {
      return this.resolveRelativeTimeRange(timeRange.relative);
    }

    throw new Error('Invalid time range configuration');
  }

  private resolveRelativeTimeRange(relative: string): { start: Date; end: Date } {
    const now = new Date();
    const end = now;

    switch (relative) {
      case 'last_hour':
        return { start: new Date(now.getTime() - 60 * 60 * 1000), end };
      case 'last_24_hours':
        return { start: new Date(now.getTime() - 24 * 60 * 60 * 1000), end };
      case 'last_7_days':
        return { start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), end };
      case 'last_30_days':
        return { start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), end };
      case 'last_90_days':
        return { start: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000), end };
      case 'last_year':
        return { start: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000), end };
      default:
        throw new Error(`Unsupported relative time range: ${relative}`);
    }
  }

  private inferGranularity(timeRange: { start: Date; end: Date }): 'hour' | 'day' | 'week' | 'month' | 'year' {
    const diffMs = timeRange.end.getTime() - timeRange.start.getTime();
    const diffDays = diffMs / (24 * 60 * 60 * 1000);

    if (diffDays <= 1) return 'hour';
    if (diffDays <= 30) return 'day';
    if (diffDays <= 90) return 'week';
    if (diffDays <= 365) return 'month';
    return 'year';
  }

  private inferSparklineGranularity(timeRange: { start: Date; end: Date }): 'hour' | 'day' | 'week' | 'month' | 'year' {
    const diffMs = timeRange.end.getTime() - timeRange.start.getTime();
    const diffDays = diffMs / (24 * 60 * 60 * 1000);

    if (diffDays <= 7) return 'day';
    if (diffDays <= 30) return 'day';
    if (diffDays <= 90) return 'week';
    return 'month';
  }

  private getPreviousTimeRange(timeRange: { start: Date; end: Date }): { start: Date; end: Date } {
    const diffMs = timeRange.end.getTime() - timeRange.start.getTime();
    return {
      start: new Date(timeRange.start.getTime() - diffMs),
      end: new Date(timeRange.end.getTime() - diffMs),
    };
  }

  private calculateTrend(current: number, previous: number): {
    direction: 'up' | 'down' | 'flat';
    percentage: number;
    absolute: number;
  } {
    const absolute = current - previous;
    const percentage = previous === 0 ? 0 : (absolute / previous) * 100;
    
    let direction: 'up' | 'down' | 'flat' = 'flat';
    if (absolute > 0) direction = 'up';
    else if (absolute < 0) direction = 'down';

    return { direction, percentage, absolute };
  }

  private formatChartData(
    data: Array<Record<string, any>>,
    chartType: string,
    metrics: string[],
    dimensions?: string[]
  ): any {
    // This would format data based on chart type
    // Implementation depends on the charting library being used
    return {
      labels: data.map(row => row[dimensions?.[0] || 'date']),
      datasets: metrics.map(metric => ({
        label: metric,
        data: data.map(row => row[metric] || 0),
      })),
    };
  }

  private async exportToPDF(dashboard: Dashboard, widgetData: Map<string, any>): Promise<Buffer> {
    // Implementation would use a PDF generation library
    throw new Error('PDF export not implemented');
  }

  private async exportToPNG(dashboard: Dashboard, widgetData: Map<string, any>): Promise<Buffer> {
    // Implementation would use an image generation library
    throw new Error('PNG export not implemented');
  }

  private async storeDashboard(dashboard: Dashboard): Promise<void> {
    // In a real implementation, this would store to a database
    logger.debug('Storing dashboard', { dashboardId: dashboard.id });
  }

  private generateDashboardId(): string {
    return `dash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeDefaultTemplates(): void {
    // Website Analytics Template
    this.templates.set('website-analytics', {
      id: 'website-analytics',
      name: 'Website Analytics',
      description: 'Comprehensive website traffic and user behavior analytics',
      category: 'Web',
      dashboard: {
        name: 'Website Analytics',
        description: 'Track website performance and user engagement',
        layout: { type: 'grid', columns: 12, gap: 16, responsive: true },
        widgets: [
          {
            id: 'total-visitors',
            type: 'metric',
            title: 'Total Visitors',
            position: { x: 0, y: 0, width: 3, height: 2 },
            config: {
              metric: 'unique_visitors',
              format: 'number',
              showTrend: true,
              timeRange: { relative: 'last_30_days' },
            },
          },
          {
            id: 'page-views',
            type: 'metric',
            title: 'Page Views',
            position: { x: 3, y: 0, width: 3, height: 2 },
            config: {
              metric: 'page_views',
              format: 'number',
              showTrend: true,
              timeRange: { relative: 'last_30_days' },
            },
          },
          {
            id: 'bounce-rate',
            type: 'metric',
            title: 'Bounce Rate',
            position: { x: 6, y: 0, width: 3, height: 2 },
            config: {
              metric: 'bounce_rate',
              format: 'percentage',
              showTrend: true,
              target: 40,
              timeRange: { relative: 'last_30_days' },
            },
          },
          {
            id: 'avg-session-duration',
            type: 'metric',
            title: 'Avg. Session Duration',
            position: { x: 9, y: 0, width: 3, height: 2 },
            config: {
              metric: 'session_duration',
              format: 'duration',
              showTrend: true,
              timeRange: { relative: 'last_30_days' },
            },
          },
          {
            id: 'traffic-chart',
            type: 'chart',
            title: 'Traffic Over Time',
            position: { x: 0, y: 2, width: 8, height: 4 },
            config: {
              chartType: 'line',
              metrics: ['unique_visitors', 'page_views'],
              dimensions: ['date'],
              timeRange: { relative: 'last_30_days' },
            },
          },
          {
            id: 'top-pages',
            type: 'table',
            title: 'Top Pages',
            position: { x: 8, y: 2, width: 4, height: 4 },
            config: {
              columns: [
                { field: 'page', title: 'Page', type: 'string' },
                { field: 'page_views', title: 'Views', type: 'number' },
                { field: 'unique_visitors', title: 'Visitors', type: 'number' },
              ],
              pagination: true,
              pageSize: 10,
              timeRange: { relative: 'last_30_days' },
            },
          },
        ],
        filters: [
          {
            id: 'date-range',
            field: 'date',
            type: 'daterange',
            label: 'Date Range',
            defaultValue: { relative: 'last_30_days' },
          },
          {
            id: 'country',
            field: 'country',
            type: 'multiselect',
            label: 'Country',
            options: [],
          },
        ],
        settings: {
          theme: 'light',
          refreshInterval: 300,
          autoRefresh: true,
          timezone: 'UTC',
          showFilters: true,
          showLegend: true,
          allowExport: true,
          allowShare: true,
        },
        isPublic: false,
        tags: ['website', 'traffic', 'analytics'],
      },
    });

    // Business Intelligence Template
    this.templates.set('business-intelligence', {
      id: 'business-intelligence',
      name: 'Business Intelligence',
      description: 'Key business metrics and performance indicators',
      category: 'Business',
      dashboard: {
        name: 'Business Intelligence',
        description: 'Monitor key business metrics and KPIs',
        layout: { type: 'grid', columns: 12, gap: 16, responsive: true },
        widgets: [
          {
            id: 'revenue',
            type: 'metric',
            title: 'Total Revenue',
            position: { x: 0, y: 0, width: 3, height: 2 },
            config: {
              metric: 'revenue',
              format: 'currency',
              showTrend: true,
              showSparkline: true,
              timeRange: { relative: 'last_30_days' },
            },
          },
          {
            id: 'conversion-rate',
            type: 'metric',
            title: 'Conversion Rate',
            position: { x: 3, y: 0, width: 3, height: 2 },
            config: {
              metric: 'conversion_rate',
              format: 'percentage',
              showTrend: true,
              target: 3.5,
              timeRange: { relative: 'last_30_days' },
            },
          },
          {
            id: 'active-users',
            type: 'metric',
            title: 'Active Users',
            position: { x: 6, y: 0, width: 3, height: 2 },
            config: {
              metric: 'active_users',
              format: 'number',
              showTrend: true,
              timeRange: { relative: 'last_30_days' },
            },
          },
          {
            id: 'user-registrations',
            type: 'metric',
            title: 'New Registrations',
            position: { x: 9, y: 0, width: 3, height: 2 },
            config: {
              metric: 'user_registrations',
              format: 'number',
              showTrend: true,
              timeRange: { relative: 'last_30_days' },
            },
          },
        ],
        filters: [],
        settings: {
          theme: 'light',
          refreshInterval: 600,
          autoRefresh: true,
          timezone: 'UTC',
          showFilters: false,
          showLegend: true,
          allowExport: true,
          allowShare: true,
        },
        isPublic: false,
        tags: ['business', 'kpi', 'revenue'],
      },
    });
  }
}