import { EventEmitter } from 'events';
import { startOfDay, endOfDay, subDays, subMonths, subYears } from 'date-fns';
import { logger } from '../utils/logger';
import { DatabaseService } from './database.service';
import { CacheService } from './cache.service';
import { MetricCalculator } from './metric-calculator.service';
import { TrendAnalyzer } from './trend-analyzer.service';
import { AnomalyDetector } from './anomaly-detector.service';
import { PredictiveAnalytics } from './predictive-analytics.service';

export interface AnalyticsQuery {
  metrics: string[];
  dimensions: string[];
  filters: Record<string, any>;
  timeRange: {
    start: Date;
    end: Date;
  };
  granularity: 'hour' | 'day' | 'week' | 'month' | 'year';
  limit?: number;
  offset?: number;
}

export interface AnalyticsResult {
  data: Array<Record<string, any>>;
  metadata: {
    totalRows: number;
    executionTime: number;
    cacheHit: boolean;
    dataSourceInfo: {
      primarySource: string;
      lastUpdated: Date;
    };
  };
  insights?: {
    trends: Array<{
      metric: string;
      trend: 'increasing' | 'decreasing' | 'stable';
      changePercent: number;
      significance: 'high' | 'medium' | 'low';
    }>;
    anomalies: Array<{
      metric: string;
      timestamp: Date;
      value: number;
      expectedValue: number;
      severity: 'critical' | 'warning' | 'info';
    }>;
    predictions: Array<{
      metric: string;
      timestamp: Date;
      predictedValue: number;
      confidence: number;
    }>;
  };
}

export interface RealTimeMetric {
  name: string;
  value: number;
  timestamp: Date;
  tags: Record<string, string>;
}

export class AnalyticsEngine extends EventEmitter {
  private isInitialized = false;
  private metricCalculator: MetricCalculator;
  private trendAnalyzer: TrendAnalyzer;
  private anomalyDetector: AnomalyDetector;
  private predictiveAnalytics: PredictiveAnalytics;
  private realTimeMetrics: Map<string, RealTimeMetric> = new Map();

  constructor(
    private databaseService: DatabaseService,
    private cacheService: CacheService
  ) {
    super();
    this.metricCalculator = new MetricCalculator(databaseService);
    this.trendAnalyzer = new TrendAnalyzer();
    this.anomalyDetector = new AnomalyDetector();
    this.predictiveAnalytics = new PredictiveAnalytics();
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    logger.info('Initializing Analytics Engine...');

    try {
      // Initialize sub-services
      await this.metricCalculator.initialize();
      await this.trendAnalyzer.initialize();
      await this.anomalyDetector.initialize();
      await this.predictiveAnalytics.initialize();

      // Start real-time metric collection
      this.startRealTimeCollection();

      this.isInitialized = true;
      logger.info('✅ Analytics Engine initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Analytics Engine:', error);
      throw error;
    }
  }

  public async query(query: AnalyticsQuery): Promise<AnalyticsResult> {
    const startTime = Date.now();
    logger.info('Executing analytics query:', { query });

    try {
      // Generate cache key
      const cacheKey = this.generateCacheKey(query);
      
      // Check cache first
      const cachedResult = await this.cacheService.get(cacheKey);
      if (cachedResult) {
        logger.info('Cache hit for analytics query');
        return {
          ...cachedResult,
          metadata: {
            ...cachedResult.metadata,
            executionTime: Date.now() - startTime,
            cacheHit: true,
          },
        };
      }

      // Execute query
      const data = await this.executeQuery(query);
      
      // Generate insights
      const insights = await this.generateInsights(data, query);

      const result: AnalyticsResult = {
        data,
        metadata: {
          totalRows: data.length,
          executionTime: Date.now() - startTime,
          cacheHit: false,
          dataSourceInfo: {
            primarySource: 'clickhouse',
            lastUpdated: new Date(),
          },
        },
        insights,
      };

      // Cache the result
      await this.cacheService.set(cacheKey, result, 300); // 5 minutes cache

      this.emit('queryExecuted', { query, result });
      return result;

    } catch (error) {
      logger.error('Failed to execute analytics query:', error);
      throw error;
    }
  }

  public async getRealTimeMetrics(metricNames?: string[]): Promise<RealTimeMetric[]> {
    const metrics = Array.from(this.realTimeMetrics.values());
    
    if (metricNames && metricNames.length > 0) {
      return metrics.filter(metric => metricNames.includes(metric.name));
    }
    
    return metrics;
  }

  public async trackEvent(event: {
    name: string;
    properties: Record<string, any>;
    timestamp?: Date;
    userId?: string;
    sessionId?: string;
  }): Promise<void> {
    try {
      const eventData = {
        ...event,
        timestamp: event.timestamp || new Date(),
        id: this.generateEventId(),
      };

      // Store in database
      await this.databaseService.insertEvent(eventData);

      // Update real-time metrics
      await this.updateRealTimeMetrics(eventData);

      // Emit event for real-time processing
      this.emit('eventTracked', eventData);

      logger.debug('Event tracked successfully:', { eventName: event.name });

    } catch (error) {
      logger.error('Failed to track event:', error);
      throw error;
    }
  }

  public async getMetricDefinitions(): Promise<Array<{
    name: string;
    displayName: string;
    description: string;
    type: 'count' | 'sum' | 'average' | 'ratio' | 'percentage';
    unit?: string;
    category: string;
  }>> {
    return [
      {
        name: 'page_views',
        displayName: 'Page Views',
        description: 'Total number of page views',
        type: 'count',
        category: 'Traffic',
      },
      {
        name: 'unique_visitors',
        displayName: 'Unique Visitors',
        description: 'Number of unique visitors',
        type: 'count',
        category: 'Traffic',
      },
      {
        name: 'session_duration',
        displayName: 'Average Session Duration',
        description: 'Average time spent in a session',
        type: 'average',
        unit: 'seconds',
        category: 'Engagement',
      },
      {
        name: 'bounce_rate',
        displayName: 'Bounce Rate',
        description: 'Percentage of single-page sessions',
        type: 'percentage',
        unit: '%',
        category: 'Engagement',
      },
      {
        name: 'conversion_rate',
        displayName: 'Conversion Rate',
        description: 'Percentage of visitors who complete a goal',
        type: 'percentage',
        unit: '%',
        category: 'Conversions',
      },
      {
        name: 'revenue',
        displayName: 'Revenue',
        description: 'Total revenue generated',
        type: 'sum',
        unit: 'USD',
        category: 'Revenue',
      },
      {
        name: 'api_requests',
        displayName: 'API Requests',
        description: 'Total number of API requests',
        type: 'count',
        category: 'API',
      },
      {
        name: 'api_response_time',
        displayName: 'API Response Time',
        description: 'Average API response time',
        type: 'average',
        unit: 'ms',
        category: 'API',
      },
      {
        name: 'error_rate',
        displayName: 'Error Rate',
        description: 'Percentage of requests that result in errors',
        type: 'percentage',
        unit: '%',
        category: 'Errors',
      },
      {
        name: 'user_registrations',
        displayName: 'User Registrations',
        description: 'Number of new user registrations',
        type: 'count',
        category: 'Users',
      },
      {
        name: 'active_users',
        displayName: 'Active Users',
        description: 'Number of active users',
        type: 'count',
        category: 'Users',
      },
      {
        name: 'project_creations',
        displayName: 'Project Creations',
        description: 'Number of new projects created',
        type: 'count',
        category: 'Projects',
      },
      {
        name: 'ai_requests',
        displayName: 'AI Requests',
        description: 'Number of AI assistance requests',
        type: 'count',
        category: 'AI',
      },
      {
        name: 'collaboration_sessions',
        displayName: 'Collaboration Sessions',
        description: 'Number of active collaboration sessions',
        type: 'count',
        category: 'Collaboration',
      },
    ];
  }

  public async getDimensionDefinitions(): Promise<Array<{
    name: string;
    displayName: string;
    description: string;
    type: 'string' | 'number' | 'date' | 'boolean';
    category: string;
  }>> {
    return [
      {
        name: 'date',
        displayName: 'Date',
        description: 'Date dimension',
        type: 'date',
        category: 'Time',
      },
      {
        name: 'hour',
        displayName: 'Hour',
        description: 'Hour of the day (0-23)',
        type: 'number',
        category: 'Time',
      },
      {
        name: 'day_of_week',
        displayName: 'Day of Week',
        description: 'Day of the week (Monday-Sunday)',
        type: 'string',
        category: 'Time',
      },
      {
        name: 'country',
        displayName: 'Country',
        description: 'User country',
        type: 'string',
        category: 'Geography',
      },
      {
        name: 'city',
        displayName: 'City',
        description: 'User city',
        type: 'string',
        category: 'Geography',
      },
      {
        name: 'device_type',
        displayName: 'Device Type',
        description: 'Type of device (desktop, mobile, tablet)',
        type: 'string',
        category: 'Technology',
      },
      {
        name: 'browser',
        displayName: 'Browser',
        description: 'Web browser name',
        type: 'string',
        category: 'Technology',
      },
      {
        name: 'operating_system',
        displayName: 'Operating System',
        description: 'Operating system name',
        type: 'string',
        category: 'Technology',
      },
      {
        name: 'traffic_source',
        displayName: 'Traffic Source',
        description: 'Source of traffic (organic, paid, direct, etc.)',
        type: 'string',
        category: 'Marketing',
      },
      {
        name: 'campaign',
        displayName: 'Campaign',
        description: 'Marketing campaign name',
        type: 'string',
        category: 'Marketing',
      },
      {
        name: 'user_segment',
        displayName: 'User Segment',
        description: 'User segment (new, returning, premium, etc.)',
        type: 'string',
        category: 'Users',
      },
      {
        name: 'subscription_plan',
        displayName: 'Subscription Plan',
        description: 'User subscription plan',
        type: 'string',
        category: 'Business',
      },
    ];
  }

  private async executeQuery(query: AnalyticsQuery): Promise<Array<Record<string, any>>> {
    // Build and execute the database query
    const sql = this.buildQuery(query);
    logger.debug('Executing SQL query:', { sql });

    const result = await this.databaseService.query(sql);
    return result;
  }

  private buildQuery(query: AnalyticsQuery): string {
    const { metrics, dimensions, filters, timeRange, granularity, limit, offset } = query;

    // Build SELECT clause
    const selectClause = [
      ...this.buildMetricSelects(metrics),
      ...this.buildDimensionSelects(dimensions, granularity),
    ].join(', ');

    // Build FROM clause
    const fromClause = 'FROM events e';

    // Build WHERE clause
    const whereConditions = [
      `e.timestamp >= '${timeRange.start.toISOString()}'`,
      `e.timestamp <= '${timeRange.end.toISOString()}'`,
      ...this.buildFilterConditions(filters),
    ];
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Build GROUP BY clause
    const groupByFields = this.buildGroupByFields(dimensions, granularity);
    const groupByClause = groupByFields.length > 0 ? `GROUP BY ${groupByFields.join(', ')}` : '';

    // Build ORDER BY clause
    const orderByClause = 'ORDER BY 1 DESC';

    // Build LIMIT clause
    const limitClause = limit ? `LIMIT ${limit}` : '';
    const offsetClause = offset ? `OFFSET ${offset}` : '';

    return [
      `SELECT ${selectClause}`,
      fromClause,
      whereClause,
      groupByClause,
      orderByClause,
      limitClause,
      offsetClause,
    ].filter(Boolean).join(' ');
  }

  private buildMetricSelects(metrics: string[]): string[] {
    const metricMap: Record<string, string> = {
      page_views: 'COUNT(*)',
      unique_visitors: 'COUNT(DISTINCT e.user_id)',
      session_duration: 'AVG(e.session_duration)',
      bounce_rate: 'AVG(CASE WHEN e.is_bounce THEN 1 ELSE 0 END) * 100',
      conversion_rate: 'AVG(CASE WHEN e.is_conversion THEN 1 ELSE 0 END) * 100',
      revenue: 'SUM(e.revenue)',
      api_requests: 'COUNT(*)',
      api_response_time: 'AVG(e.response_time)',
      error_rate: 'AVG(CASE WHEN e.is_error THEN 1 ELSE 0 END) * 100',
      user_registrations: 'COUNT(DISTINCT CASE WHEN e.event_name = \'user_registered\' THEN e.user_id END)',
      active_users: 'COUNT(DISTINCT e.user_id)',
      project_creations: 'COUNT(CASE WHEN e.event_name = \'project_created\' THEN 1 END)',
      ai_requests: 'COUNT(CASE WHEN e.event_name = \'ai_request\' THEN 1 END)',
      collaboration_sessions: 'COUNT(DISTINCT CASE WHEN e.event_name = \'collaboration_started\' THEN e.session_id END)',
    };

    return metrics.map(metric => `${metricMap[metric] || 'COUNT(*)'} AS ${metric}`);
  }

  private buildDimensionSelects(dimensions: string[], granularity: string): string[] {
    const dimensionMap: Record<string, string> = {
      date: this.getDateTruncFunction(granularity),
      hour: 'EXTRACT(hour FROM e.timestamp)',
      day_of_week: 'dayOfWeek(e.timestamp)',
      country: 'e.country',
      city: 'e.city',
      device_type: 'e.device_type',
      browser: 'e.browser',
      operating_system: 'e.operating_system',
      traffic_source: 'e.traffic_source',
      campaign: 'e.campaign',
      user_segment: 'e.user_segment',
      subscription_plan: 'e.subscription_plan',
    };

    return dimensions.map(dimension => `${dimensionMap[dimension] || dimension} AS ${dimension}`);
  }

  private getDateTruncFunction(granularity: string): string {
    const granularityMap: Record<string, string> = {
      hour: 'toStartOfHour(e.timestamp)',
      day: 'toStartOfDay(e.timestamp)',
      week: 'toStartOfWeek(e.timestamp)',
      month: 'toStartOfMonth(e.timestamp)',
      year: 'toStartOfYear(e.timestamp)',
    };

    return granularityMap[granularity] || granularityMap.day;
  }

  private buildFilterConditions(filters: Record<string, any>): string[] {
    const conditions: string[] = [];

    for (const [field, value] of Object.entries(filters)) {
      if (Array.isArray(value)) {
        conditions.push(`e.${field} IN (${value.map(v => `'${v}'`).join(', ')})`);
      } else if (typeof value === 'object' && value !== null) {
        // Handle range filters
        if (value.min !== undefined) {
          conditions.push(`e.${field} >= ${value.min}`);
        }
        if (value.max !== undefined) {
          conditions.push(`e.${field} <= ${value.max}`);
        }
      } else {
        conditions.push(`e.${field} = '${value}'`);
      }
    }

    return conditions;
  }

  private buildGroupByFields(dimensions: string[], granularity: string): string[] {
    const fields: string[] = [];

    if (dimensions.includes('date')) {
      fields.push('1'); // First field in SELECT (date dimension)
    }

    // Add other dimension fields
    dimensions.forEach((dimension, index) => {
      if (dimension !== 'date') {
        fields.push(`${index + 2}`); // Adjust index based on metrics count
      }
    });

    return fields;
  }

  private async generateInsights(data: Array<Record<string, any>>, query: AnalyticsQuery): Promise<AnalyticsResult['insights']> {
    try {
      const [trends, anomalies, predictions] = await Promise.all([
        this.trendAnalyzer.analyzeTrends(data, query.metrics),
        this.anomalyDetector.detectAnomalies(data, query.metrics),
        this.predictiveAnalytics.generatePredictions(data, query.metrics),
      ]);

      return { trends, anomalies, predictions };
    } catch (error) {
      logger.error('Failed to generate insights:', error);
      return undefined;
    }
  }

  private generateCacheKey(query: AnalyticsQuery): string {
    const key = JSON.stringify({
      metrics: query.metrics.sort(),
      dimensions: query.dimensions.sort(),
      filters: query.filters,
      timeRange: query.timeRange,
      granularity: query.granularity,
      limit: query.limit,
      offset: query.offset,
    });

    return `analytics:query:${Buffer.from(key).toString('base64')}`;
  }

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private startRealTimeCollection(): void {
    // Start collecting real-time metrics every 30 seconds
    setInterval(async () => {
      try {
        await this.collectRealTimeMetrics();
      } catch (error) {
        logger.error('Failed to collect real-time metrics:', error);
      }
    }, 30000);
  }

  private async collectRealTimeMetrics(): Promise<void> {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    // Collect current metrics
    const metrics = await this.query({
      metrics: ['page_views', 'unique_visitors', 'api_requests', 'error_rate'],
      dimensions: [],
      filters: {},
      timeRange: { start: fiveMinutesAgo, end: now },
      granularity: 'hour',
    });

    // Update real-time metrics
    if (metrics.data.length > 0) {
      const data = metrics.data[0];
      for (const [metricName, value] of Object.entries(data)) {
        this.realTimeMetrics.set(metricName, {
          name: metricName,
          value: typeof value === 'number' ? value : 0,
          timestamp: now,
          tags: {},
        });
      }
    }
  }

  private async updateRealTimeMetrics(event: any): Promise<void> {
    // Update relevant real-time metrics based on the event
    const metricUpdates: Array<{ name: string; increment: number }> = [];

    switch (event.name) {
      case 'page_view':
        metricUpdates.push({ name: 'page_views', increment: 1 });
        break;
      case 'api_request':
        metricUpdates.push({ name: 'api_requests', increment: 1 });
        if (event.properties.is_error) {
          metricUpdates.push({ name: 'error_count', increment: 1 });
        }
        break;
      case 'user_session_start':
        metricUpdates.push({ name: 'active_sessions', increment: 1 });
        break;
    }

    // Apply updates
    for (const update of metricUpdates) {
      const current = this.realTimeMetrics.get(update.name);
      this.realTimeMetrics.set(update.name, {
        name: update.name,
        value: (current?.value || 0) + update.increment,
        timestamp: new Date(),
        tags: {},
      });
    }
  }

  public async stop(): Promise<void> {
    logger.info('Stopping Analytics Engine...');
    
    // Stop real-time collection
    // Clean up resources
    
    this.isInitialized = false;
    logger.info('✅ Analytics Engine stopped');
  }
}