import { ClickHouseClient, createClient } from '@clickhouse/client';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays } from 'date-fns';
import { clickhouseConfig } from '../config';
import { logger } from '../utils/logger';
import { AnalyticsRedisService } from '../utils/redis';

export interface TimeRange {
  startDate: Date;
  endDate: Date;
  granularity?: 'hour' | 'day' | 'week' | 'month';
}

export interface MetricResult {
  value: number;
  change?: number;
  changePercent?: number;
  trend?: Array<{ date: string; value: number }>;
}

export interface DimensionBreakdown {
  dimension: string;
  metrics: Record<string, number>;
  percentage?: number;
}

export class AnalyticsQueryService {
  private clickhouse: ClickHouseClient;

  constructor() {
    this.clickhouse = createClient({
      host: clickhouseConfig.host,
      database: clickhouseConfig.database,
      username: clickhouseConfig.username,
      password: clickhouseConfig.password,
    });

    logger.info('Analytics query service initialized');
  }

  // Core Metrics
  async getActiveUsers(timeRange: TimeRange): Promise<MetricResult> {
    try {
      const cacheKey = `active_users:${timeRange.startDate.getTime()}:${timeRange.endDate.getTime()}`;
      const cached = await AnalyticsRedisService.getCachedResult(cacheKey);
      if (cached) return cached;

      const result = await this.clickhouse.query({
        query: `
          SELECT 
            count(DISTINCT user_id) as value,
            toDate(timestamp) as date
          FROM ${clickhouseConfig.database}.events
          WHERE timestamp >= {startDate:DateTime}
            AND timestamp <= {endDate:DateTime}
            AND user_id IS NOT NULL
          GROUP BY date
          ORDER BY date
        `,
        query_params: {
          startDate: timeRange.startDate,
          endDate: timeRange.endDate,
        },
      });

      const data = await result.json();
      const trend = data.data.map((row: any) => ({
        date: row.date,
        value: parseInt(row.value),
      }));

      const currentValue = trend.reduce((sum, item) => sum + item.value, 0);
      
      // Calculate change from previous period
      const previousPeriod = await this.getPreviousPeriodValue(
        'user_id',
        timeRange,
        'count_distinct'
      );

      const metricResult: MetricResult = {
        value: currentValue,
        change: currentValue - previousPeriod,
        changePercent: previousPeriod > 0 
          ? ((currentValue - previousPeriod) / previousPeriod) * 100 
          : 0,
        trend,
      };

      await AnalyticsRedisService.cacheResult(cacheKey, metricResult, 300); // 5 min cache
      return metricResult;

    } catch (error) {
      logger.error({ error }, 'Failed to get active users');
      throw error;
    }
  }

  async getTotalEvents(timeRange: TimeRange): Promise<MetricResult> {
    try {
      const result = await this.clickhouse.query({
        query: `
          SELECT 
            count(*) as value,
            toDate(timestamp) as date
          FROM ${clickhouseConfig.database}.events
          WHERE timestamp >= {startDate:DateTime}
            AND timestamp <= {endDate:DateTime}
          GROUP BY date
          ORDER BY date
        `,
        query_params: {
          startDate: timeRange.startDate,
          endDate: timeRange.endDate,
        },
      });

      const data = await result.json();
      const trend = data.data.map((row: any) => ({
        date: row.date,
        value: parseInt(row.value),
      }));

      const currentValue = trend.reduce((sum, item) => sum + item.value, 0);
      
      // Calculate change from previous period
      const previousPeriod = await this.getPreviousPeriodValue(
        '*',
        timeRange,
        'count'
      );

      return {
        value: currentValue,
        change: currentValue - previousPeriod,
        changePercent: previousPeriod > 0 
          ? ((currentValue - previousPeriod) / previousPeriod) * 100 
          : 0,
        trend,
      };

    } catch (error) {
      logger.error({ error }, 'Failed to get total events');
      throw error;
    }
  }

  async getPageViews(timeRange: TimeRange): Promise<MetricResult> {
    try {
      const result = await this.clickhouse.query({
        query: `
          SELECT 
            sum(views) as value,
            toDate(timestamp) as date
          FROM ${clickhouseConfig.database}.page_views
          WHERE timestamp >= {startDate:DateTime}
            AND timestamp <= {endDate:DateTime}
          GROUP BY date
          ORDER BY date
        `,
        query_params: {
          startDate: timeRange.startDate,
          endDate: timeRange.endDate,
        },
      });

      const data = await result.json();
      const trend = data.data.map((row: any) => ({
        date: row.date,
        value: parseInt(row.value),
      }));

      const currentValue = trend.reduce((sum, item) => sum + item.value, 0);
      
      return {
        value: currentValue,
        trend,
      };

    } catch (error) {
      logger.error({ error }, 'Failed to get page views');
      throw error;
    }
  }

  async getAverageSessionDuration(timeRange: TimeRange): Promise<MetricResult> {
    try {
      const result = await this.clickhouse.query({
        query: `
          WITH sessions AS (
            SELECT 
              session_id,
              min(timestamp) as session_start,
              max(timestamp) as session_end,
              toDate(min(timestamp)) as date
            FROM ${clickhouseConfig.database}.events
            WHERE timestamp >= {startDate:DateTime}
              AND timestamp <= {endDate:DateTime}
              AND session_id IS NOT NULL
            GROUP BY session_id
          )
          SELECT 
            avg(dateDiff('second', session_start, session_end)) as avg_duration,
            date
          FROM sessions
          GROUP BY date
          ORDER BY date
        `,
        query_params: {
          startDate: timeRange.startDate,
          endDate: timeRange.endDate,
        },
      });

      const data = await result.json();
      const trend = data.data.map((row: any) => ({
        date: row.date,
        value: Math.round(row.avg_duration),
      }));

      const avgValue = trend.length > 0
        ? Math.round(trend.reduce((sum, item) => sum + item.value, 0) / trend.length)
        : 0;

      return {
        value: avgValue,
        trend,
      };

    } catch (error) {
      logger.error({ error }, 'Failed to get average session duration');
      throw error;
    }
  }

  // Dimension Breakdowns
  async getTopPages(timeRange: TimeRange, limit: number = 10): Promise<DimensionBreakdown[]> {
    try {
      const result = await this.clickhouse.query({
        query: `
          SELECT 
            url as dimension,
            sum(views) as page_views,
            count(DISTINCT user_id) as unique_visitors,
            count(DISTINCT session_id) as sessions
          FROM ${clickhouseConfig.database}.page_views
          WHERE timestamp >= {startDate:DateTime}
            AND timestamp <= {endDate:DateTime}
          GROUP BY url
          ORDER BY page_views DESC
          LIMIT {limit:UInt32}
        `,
        query_params: {
          startDate: timeRange.startDate,
          endDate: timeRange.endDate,
          limit,
        },
      });

      const data = await result.json();
      const total = data.data.reduce((sum: number, row: any) => sum + parseInt(row.page_views), 0);

      return data.data.map((row: any) => ({
        dimension: row.dimension,
        metrics: {
          pageViews: parseInt(row.page_views),
          uniqueVisitors: parseInt(row.unique_visitors),
          sessions: parseInt(row.sessions),
        },
        percentage: total > 0 ? (parseInt(row.page_views) / total) * 100 : 0,
      }));

    } catch (error) {
      logger.error({ error }, 'Failed to get top pages');
      throw error;
    }
  }

  async getTopEvents(timeRange: TimeRange, limit: number = 10): Promise<DimensionBreakdown[]> {
    try {
      const result = await this.clickhouse.query({
        query: `
          SELECT 
            event_name as dimension,
            count(*) as event_count,
            count(DISTINCT user_id) as unique_users
          FROM ${clickhouseConfig.database}.events
          WHERE timestamp >= {startDate:DateTime}
            AND timestamp <= {endDate:DateTime}
            AND event_type = 'track'
          GROUP BY event_name
          ORDER BY event_count DESC
          LIMIT {limit:UInt32}
        `,
        query_params: {
          startDate: timeRange.startDate,
          endDate: timeRange.endDate,
          limit,
        },
      });

      const data = await result.json();
      const total = data.data.reduce((sum: number, row: any) => sum + parseInt(row.event_count), 0);

      return data.data.map((row: any) => ({
        dimension: row.dimension,
        metrics: {
          count: parseInt(row.event_count),
          uniqueUsers: parseInt(row.unique_users),
        },
        percentage: total > 0 ? (parseInt(row.event_count) / total) * 100 : 0,
      }));

    } catch (error) {
      logger.error({ error }, 'Failed to get top events');
      throw error;
    }
  }

  async getDeviceBreakdown(timeRange: TimeRange): Promise<DimensionBreakdown[]> {
    try {
      const result = await this.clickhouse.query({
        query: `
          SELECT 
            device_type as dimension,
            count(DISTINCT user_id) as users,
            count(*) as events,
            count(DISTINCT session_id) as sessions
          FROM ${clickhouseConfig.database}.events
          WHERE timestamp >= {startDate:DateTime}
            AND timestamp <= {endDate:DateTime}
            AND device_type IS NOT NULL
          GROUP BY device_type
          ORDER BY users DESC
        `,
        query_params: {
          startDate: timeRange.startDate,
          endDate: timeRange.endDate,
        },
      });

      const data = await result.json();
      const totalUsers = data.data.reduce((sum: number, row: any) => sum + parseInt(row.users), 0);

      return data.data.map((row: any) => ({
        dimension: row.dimension,
        metrics: {
          users: parseInt(row.users),
          events: parseInt(row.events),
          sessions: parseInt(row.sessions),
        },
        percentage: totalUsers > 0 ? (parseInt(row.users) / totalUsers) * 100 : 0,
      }));

    } catch (error) {
      logger.error({ error }, 'Failed to get device breakdown');
      throw error;
    }
  }

  async getGeographyBreakdown(timeRange: TimeRange): Promise<DimensionBreakdown[]> {
    try {
      const result = await this.clickhouse.query({
        query: `
          SELECT 
            country as dimension,
            count(DISTINCT user_id) as users,
            count(*) as events,
            count(DISTINCT session_id) as sessions
          FROM ${clickhouseConfig.database}.events
          WHERE timestamp >= {startDate:DateTime}
            AND timestamp <= {endDate:DateTime}
            AND country IS NOT NULL
          GROUP BY country
          ORDER BY users DESC
          LIMIT 20
        `,
        query_params: {
          startDate: timeRange.startDate,
          endDate: timeRange.endDate,
        },
      });

      const data = await result.json();
      const totalUsers = data.data.reduce((sum: number, row: any) => sum + parseInt(row.users), 0);

      return data.data.map((row: any) => ({
        dimension: row.dimension,
        metrics: {
          users: parseInt(row.users),
          events: parseInt(row.events),
          sessions: parseInt(row.sessions),
        },
        percentage: totalUsers > 0 ? (parseInt(row.users) / totalUsers) * 100 : 0,
      }));

    } catch (error) {
      logger.error({ error }, 'Failed to get geography breakdown');
      throw error;
    }
  }

  // Funnel Analysis
  async getFunnelConversion(
    steps: Array<{ name: string; event: string }>,
    timeRange: TimeRange
  ): Promise<{
    steps: Array<{
      name: string;
      users: number;
      conversionRate: number;
      dropoffRate: number;
    }>;
    overallConversion: number;
  }> {
    try {
      // Build funnel query
      const stepConditions = steps.map((step, index) => `
        sum(if(event_name = '${step.event}', 1, 0)) > 0 as step_${index}
      `).join(',\n');

      const result = await this.clickhouse.query({
        query: `
          WITH user_steps AS (
            SELECT 
              user_id,
              ${stepConditions}
            FROM ${clickhouseConfig.database}.events
            WHERE timestamp >= {startDate:DateTime}
              AND timestamp <= {endDate:DateTime}
              AND user_id IS NOT NULL
            GROUP BY user_id
          )
          SELECT 
            ${steps.map((_, index) => `sum(step_${index}) as step_${index}_users`).join(',\n')}
          FROM user_steps
        `,
        query_params: {
          startDate: timeRange.startDate,
          endDate: timeRange.endDate,
        },
      });

      const data = await result.json();
      const stepResults = data.data[0];

      let previousUsers = 0;
      const funnelSteps = steps.map((step, index) => {
        const users = parseInt(stepResults[`step_${index}_users`]);
        const conversionRate = index === 0 ? 100 : (users / previousUsers) * 100;
        const dropoffRate = index === 0 ? 0 : 100 - conversionRate;
        
        previousUsers = users;

        return {
          name: step.name,
          users,
          conversionRate,
          dropoffRate,
        };
      });

      const overallConversion = funnelSteps.length > 1
        ? (funnelSteps[funnelSteps.length - 1].users / funnelSteps[0].users) * 100
        : 100;

      return {
        steps: funnelSteps,
        overallConversion,
      };

    } catch (error) {
      logger.error({ error }, 'Failed to calculate funnel conversion');
      throw error;
    }
  }

  // Retention Analysis
  async getRetention(
    timeRange: TimeRange,
    retentionDays: number[] = [1, 7, 14, 30]
  ): Promise<{
    cohorts: Array<{
      date: string;
      initialUsers: number;
      retention: Record<number, number>;
    }>;
  }> {
    try {
      const result = await this.clickhouse.query({
        query: `
          WITH cohorts AS (
            SELECT 
              user_id,
              toDate(min(timestamp)) as cohort_date
            FROM ${clickhouseConfig.database}.events
            WHERE timestamp >= {startDate:DateTime}
              AND timestamp <= {endDate:DateTime}
              AND user_id IS NOT NULL
            GROUP BY user_id
          ),
          retention_data AS (
            SELECT 
              c.cohort_date,
              dateDiff('day', c.cohort_date, toDate(e.timestamp)) as days_since_cohort,
              count(DISTINCT e.user_id) as retained_users
            FROM cohorts c
            JOIN ${clickhouseConfig.database}.events e ON c.user_id = e.user_id
            WHERE e.timestamp >= c.cohort_date
            GROUP BY c.cohort_date, days_since_cohort
          )
          SELECT 
            cohort_date,
            sum(if(days_since_cohort = 0, retained_users, 0)) as initial_users,
            ${retentionDays.map(day => 
              `sum(if(days_since_cohort = ${day}, retained_users, 0)) as day_${day}_users`
            ).join(',\n')}
          FROM retention_data
          GROUP BY cohort_date
          ORDER BY cohort_date
        `,
        query_params: {
          startDate: timeRange.startDate,
          endDate: timeRange.endDate,
        },
      });

      const data = await result.json();
      
      return {
        cohorts: data.data.map((row: any) => {
          const retention: Record<number, number> = {};
          const initialUsers = parseInt(row.initial_users);
          
          retentionDays.forEach(day => {
            const retainedUsers = parseInt(row[`day_${day}_users`]);
            retention[day] = initialUsers > 0 
              ? (retainedUsers / initialUsers) * 100 
              : 0;
          });

          return {
            date: row.cohort_date,
            initialUsers,
            retention,
          };
        }),
      };

    } catch (error) {
      logger.error({ error }, 'Failed to calculate retention');
      throw error;
    }
  }

  // Helper Methods
  private async getPreviousPeriodValue(
    field: string,
    timeRange: TimeRange,
    aggregation: 'count' | 'count_distinct'
  ): Promise<number> {
    const duration = timeRange.endDate.getTime() - timeRange.startDate.getTime();
    const previousStart = new Date(timeRange.startDate.getTime() - duration);
    const previousEnd = new Date(timeRange.startDate.getTime());

    const query = aggregation === 'count_distinct'
      ? `count(DISTINCT ${field})`
      : 'count(*)';

    const result = await this.clickhouse.query({
      query: `
        SELECT ${query} as value
        FROM ${clickhouseConfig.database}.events
        WHERE timestamp >= {startDate:DateTime}
          AND timestamp < {endDate:DateTime}
          ${field !== '*' ? `AND ${field} IS NOT NULL` : ''}
      `,
      query_params: {
        startDate: previousStart,
        endDate: previousEnd,
      },
    });

    const data = await result.json();
    return data.data[0]?.value || 0;
  }

  async exportData(
    query: string,
    format: 'csv' | 'json' | 'parquet',
    params?: Record<string, any>
  ): Promise<Buffer> {
    try {
      const result = await this.clickhouse.query({
        query,
        query_params: params,
        format: format === 'csv' ? 'CSV' : format === 'json' ? 'JSON' : 'Parquet',
      });

      return Buffer.from(await result.text());

    } catch (error) {
      logger.error({ error }, 'Failed to export data');
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    await this.clickhouse.close();
    logger.info('Analytics query service shut down');
  }
}