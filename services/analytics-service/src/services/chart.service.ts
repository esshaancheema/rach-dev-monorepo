import { logger } from '../utils/logger';
import { AnalyticsEngine, AnalyticsQuery } from './analytics-engine.service';

export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'heatmap' | 'gauge' | 'funnel' | 'histogram' | 'treemap';
  title?: string;
  subtitle?: string;
  xAxis?: ChartAxis;
  yAxis?: ChartAxis;
  series: ChartSeries[];
  colors?: string[];
  theme?: 'light' | 'dark';
  responsive?: boolean;
  animation?: boolean;
  legend?: ChartLegend;
  tooltip?: ChartTooltip;
  plotOptions?: ChartPlotOptions;
}

export interface ChartAxis {
  title?: string;
  categories?: string[];
  type?: 'linear' | 'logarithmic' | 'datetime' | 'category';
  min?: number;
  max?: number;
  tickInterval?: number;
  gridLines?: boolean;
  labels?: {
    rotation?: number;
    format?: string;
  };
}

export interface ChartSeries {
  name: string;
  data: any[];
  type?: string;
  color?: string;
  visible?: boolean;
  showInLegend?: boolean;
  marker?: {
    enabled?: boolean;
    radius?: number;
    symbol?: string;
  };
  dataLabels?: {
    enabled?: boolean;
    format?: string;
  };
}

export interface ChartLegend {
  enabled?: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right';
  layout?: 'horizontal' | 'vertical';
}

export interface ChartTooltip {
  enabled?: boolean;
  shared?: boolean;
  format?: string;
  valueDecimals?: number;
  valueSuffix?: string;
  valuePrefix?: string;
}

export interface ChartPlotOptions {
  [key: string]: any;
}

export interface ChartData {
  config: ChartConfig;
  data: any[];
  metadata: {
    generatedAt: Date;
    dataPoints: number;
    executionTime: number;
  };
}

export class ChartService {
  constructor(private analyticsEngine: AnalyticsEngine) {}

  public async generateChart(
    query: AnalyticsQuery,
    chartType: string,
    options: Partial<ChartConfig> = {}
  ): Promise<ChartData> {
    const startTime = Date.now();

    try {
      // Execute analytics query
      const queryResult = await this.analyticsEngine.query(query);
      
      // Generate chart configuration based on data and chart type
      const config = this.createChartConfig(
        queryResult.data,
        chartType as ChartConfig['type'],
        query,
        options
      );

      const executionTime = Date.now() - startTime;

      return {
        config,
        data: queryResult.data,
        metadata: {
          generatedAt: new Date(),
          dataPoints: queryResult.data.length,
          executionTime,
        },
      };

    } catch (error) {
      logger.error('Chart generation failed', { 
        chartType, 
        query, 
        error: error.message 
      });
      throw error;
    }
  }

  public async generateMultiSeriesChart(
    queries: Array<{ query: AnalyticsQuery; name: string; color?: string }>,
    chartType: string,
    options: Partial<ChartConfig> = {}
  ): Promise<ChartData> {
    const startTime = Date.now();

    try {
      // Execute all queries in parallel
      const results = await Promise.all(
        queries.map(async ({ query, name, color }) => {
          const result = await this.analyticsEngine.query(query);
          return { data: result.data, name, color };
        })
      );

      // Combine results into multi-series chart
      const config = this.createMultiSeriesChartConfig(
        results,
        chartType as ChartConfig['type'],
        options
      );

      const totalDataPoints = results.reduce((sum, result) => sum + result.data.length, 0);
      const executionTime = Date.now() - startTime;

      return {
        config,
        data: results,
        metadata: {
          generatedAt: new Date(),
          dataPoints: totalDataPoints,
          executionTime,
        },
      };

    } catch (error) {
      logger.error('Multi-series chart generation failed', { 
        chartType, 
        seriesCount: queries.length,
        error: error.message 
      });
      throw error;
    }
  }

  public async generateRealTimeChart(
    query: AnalyticsQuery,
    chartType: string,
    updateInterval: number = 30000, // 30 seconds
    maxDataPoints: number = 100
  ): Promise<{
    initialChart: ChartData;
    updateFunction: () => Promise<any[]>;
  }> {
    // Generate initial chart
    const initialChart = await this.generateChart(query, chartType);

    // Create update function for real-time data
    const updateFunction = async () => {
      const result = await this.analyticsEngine.query(query);
      return this.formatRealTimeData(result.data, maxDataPoints);
    };

    return {
      initialChart,
      updateFunction,
    };
  }

  private createChartConfig(
    data: Array<Record<string, any>>,
    chartType: ChartConfig['type'],
    query: AnalyticsQuery,
    options: Partial<ChartConfig>
  ): ChartConfig {
    const baseConfig: ChartConfig = {
      type: chartType,
      title: options.title || this.generateTitle(query),
      series: [],
      responsive: true,
      animation: true,
      theme: options.theme || 'light',
      ...options,
    };

    switch (chartType) {
      case 'line':
      case 'area':
        return this.createTimeSeriesConfig(data, query, baseConfig);
      
      case 'bar':
        return this.createBarConfig(data, query, baseConfig);
      
      case 'pie':
        return this.createPieConfig(data, query, baseConfig);
      
      case 'scatter':
        return this.createScatterConfig(data, query, baseConfig);
      
      case 'heatmap':
        return this.createHeatmapConfig(data, query, baseConfig);
      
      case 'gauge':
        return this.createGaugeConfig(data, query, baseConfig);
      
      case 'funnel':
        return this.createFunnelConfig(data, query, baseConfig);
      
      case 'histogram':
        return this.createHistogramConfig(data, query, baseConfig);
      
      case 'treemap':
        return this.createTreemapConfig(data, query, baseConfig);
      
      default:
        throw new Error(`Unsupported chart type: ${chartType}`);
    }
  }

  private createTimeSeriesConfig(
    data: Array<Record<string, any>>,
    query: AnalyticsQuery,
    baseConfig: ChartConfig
  ): ChartConfig {
    const timeDimension = query.dimensions?.find(dim => 
      dim.includes('date') || dim.includes('time')
    ) || 'date';

    // Sort data by time dimension
    const sortedData = [...data].sort((a, b) => 
      new Date(a[timeDimension]).getTime() - new Date(b[timeDimension]).getTime()
    );

    const series: ChartSeries[] = query.metrics.map((metric, index) => ({
      name: this.formatMetricName(metric),
      data: sortedData.map(row => ({
        x: new Date(row[timeDimension]).getTime(),
        y: row[metric] || 0,
      })),
      color: baseConfig.colors?.[index],
      marker: { enabled: false },
      dataLabels: { enabled: false },
    }));

    return {
      ...baseConfig,
      series,
      xAxis: {
        type: 'datetime',
        title: { title: this.formatDimensionName(timeDimension) },
        gridLines: true,
      },
      yAxis: {
        title: { title: query.metrics.length === 1 ? this.formatMetricName(query.metrics[0]) : 'Value' },
        gridLines: true,
      },
      tooltip: {
        enabled: true,
        shared: true,
        format: '{series.name}: <b>{point.y}</b>',
        valueDecimals: 2,
      },
    };
  }

  private createBarConfig(
    data: Array<Record<string, any>>,
    query: AnalyticsQuery,
    baseConfig: ChartConfig
  ): ChartConfig {
    const categoryDimension = query.dimensions?.[0] || 'category';
    
    const categories = [...new Set(data.map(row => row[categoryDimension]))];
    const series: ChartSeries[] = query.metrics.map((metric, index) => ({
      name: this.formatMetricName(metric),
      data: categories.map(category => {
        const row = data.find(r => r[categoryDimension] === category);
        return row?.[metric] || 0;
      }),
      color: baseConfig.colors?.[index],
      dataLabels: { enabled: true },
    }));

    return {
      ...baseConfig,
      series,
      xAxis: {
        type: 'category',
        categories,
        title: { title: this.formatDimensionName(categoryDimension) },
      },
      yAxis: {
        title: { title: 'Value' },
        gridLines: true,
      },
      plotOptions: {
        bar: {
          dataLabels: { enabled: true },
        },
      },
    };
  }

  private createPieConfig(
    data: Array<Record<string, any>>,
    query: AnalyticsQuery,
    baseConfig: ChartConfig
  ): ChartConfig {
    const categoryDimension = query.dimensions?.[0] || 'category';
    const metric = query.metrics[0];

    const series: ChartSeries[] = [{
      name: this.formatMetricName(metric),
      data: data.map((row, index) => ({
        name: row[categoryDimension],
        y: row[metric] || 0,
        color: baseConfig.colors?.[index],
      })),
      dataLabels: {
        enabled: true,
        format: '{point.name}: {point.percentage:.1f}%',
      },
    }];

    return {
      ...baseConfig,
      series,
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: { enabled: true },
          showInLegend: true,
        },
      },
    };
  }

  private createScatterConfig(
    data: Array<Record<string, any>>,
    query: AnalyticsQuery,
    baseConfig: ChartConfig
  ): ChartConfig {
    const xMetric = query.metrics[0];
    const yMetric = query.metrics[1] || query.metrics[0];

    const series: ChartSeries[] = [{
      name: 'Data Points',
      data: data.map(row => ({
        x: row[xMetric] || 0,
        y: row[yMetric] || 0,
      })),
      marker: { enabled: true, radius: 4 },
    }];

    return {
      ...baseConfig,
      series,
      xAxis: {
        title: { title: this.formatMetricName(xMetric) },
        gridLines: true,
      },
      yAxis: {
        title: { title: this.formatMetricName(yMetric) },
        gridLines: true,
      },
    };
  }

  private createHeatmapConfig(
    data: Array<Record<string, any>>,
    query: AnalyticsQuery,
    baseConfig: ChartConfig
  ): ChartConfig {
    const xDimension = query.dimensions?.[0] || 'x';
    const yDimension = query.dimensions?.[1] || 'y';
    const metric = query.metrics[0];

    const series: ChartSeries[] = [{
      name: this.formatMetricName(metric),
      data: data.map(row => ({
        x: row[xDimension],
        y: row[yDimension],
        value: row[metric] || 0,
      })),
    }];

    return {
      ...baseConfig,
      series,
      plotOptions: {
        heatmap: {
          dataLabels: { enabled: true },
        },
      },
    };
  }

  private createGaugeConfig(
    data: Array<Record<string, any>>,
    query: AnalyticsQuery,
    baseConfig: ChartConfig
  ): ChartConfig {
    const metric = query.metrics[0];
    const value = data[0]?.[metric] || 0;

    const series: ChartSeries[] = [{
      name: this.formatMetricName(metric),
      data: [value],
      dataLabels: {
        enabled: true,
        format: '{y}',
      },
    }];

    return {
      ...baseConfig,
      series,
      yAxis: {
        min: 0,
        max: 100,
        title: { title: this.formatMetricName(metric) },
      },
      plotOptions: {
        gauge: {
          dataLabels: { enabled: true },
          dial: { radius: '80%' },
        },
      },
    };
  }

  private createFunnelConfig(
    data: Array<Record<string, any>>,
    query: AnalyticsQuery,
    baseConfig: ChartConfig
  ): ChartConfig {
    const categoryDimension = query.dimensions?.[0] || 'step';
    const metric = query.metrics[0];

    // Sort data by value for funnel effect
    const sortedData = [...data].sort((a, b) => (b[metric] || 0) - (a[metric] || 0));

    const series: ChartSeries[] = [{
      name: this.formatMetricName(metric),
      data: sortedData.map(row => ({
        name: row[categoryDimension],
        y: row[metric] || 0,
      })),
      dataLabels: {
        enabled: true,
        format: '{point.name}: {point.y}',
      },
    }];

    return {
      ...baseConfig,
      series,
      plotOptions: {
        funnel: {
          dataLabels: { enabled: true },
          showInLegend: true,
        },
      },
    };
  }

  private createHistogramConfig(
    data: Array<Record<string, any>>,
    query: AnalyticsQuery,
    baseConfig: ChartConfig
  ): ChartConfig {
    const metric = query.metrics[0];
    const values = data.map(row => row[metric] || 0);
    
    // Create histogram bins
    const bins = this.createHistogramBins(values, 10);

    const series: ChartSeries[] = [{
      name: 'Frequency',
      data: bins.map(bin => bin.count),
      dataLabels: { enabled: true },
    }];

    return {
      ...baseConfig,
      series,
      xAxis: {
        categories: bins.map(bin => `${bin.min}-${bin.max}`),
        title: { title: this.formatMetricName(metric) },
      },
      yAxis: {
        title: { title: 'Frequency' },
      },
    };
  }

  private createTreemapConfig(
    data: Array<Record<string, any>>,
    query: AnalyticsQuery,
    baseConfig: ChartConfig
  ): ChartConfig {
    const categoryDimension = query.dimensions?.[0] || 'category';
    const metric = query.metrics[0];

    const series: ChartSeries[] = [{
      name: this.formatMetricName(metric),
      data: data.map(row => ({
        name: row[categoryDimension],
        value: row[metric] || 0,
      })),
      dataLabels: {
        enabled: true,
        format: '{point.name}',
      },
    }];

    return {
      ...baseConfig,
      series,
      plotOptions: {
        treemap: {
          dataLabels: { enabled: true },
          levelIsConstant: false,
        },
      },
    };
  }

  private createMultiSeriesChartConfig(
    results: Array<{ data: any[]; name: string; color?: string }>,
    chartType: ChartConfig['type'],
    options: Partial<ChartConfig>
  ): ChartConfig {
    const baseConfig: ChartConfig = {
      type: chartType,
      series: [],
      responsive: true,
      animation: true,
      theme: options.theme || 'light',
      ...options,
    };

    // Create series for each result
    const series: ChartSeries[] = results.map((result, index) => ({
      name: result.name,
      data: result.data.map(row => ({
        x: new Date(row.date || row.timestamp).getTime(),
        y: Object.values(row).find(val => typeof val === 'number') as number || 0,
      })),
      color: result.color || baseConfig.colors?.[index],
      marker: { enabled: false },
    }));

    return {
      ...baseConfig,
      series,
      xAxis: {
        type: 'datetime',
        title: { title: 'Time' },
      },
      yAxis: {
        title: { title: 'Value' },
      },
      legend: {
        enabled: true,
        position: 'bottom',
      },
    };
  }

  private createHistogramBins(values: number[], binCount: number): Array<{
    min: number;
    max: number;
    count: number;
  }> {
    if (values.length === 0) return [];

    const min = Math.min(...values);
    const max = Math.max(...values);
    const binSize = (max - min) / binCount;

    const bins = Array.from({ length: binCount }, (_, i) => ({
      min: min + i * binSize,
      max: min + (i + 1) * binSize,
      count: 0,
    }));

    // Count values in each bin
    values.forEach(value => {
      const binIndex = Math.min(Math.floor((value - min) / binSize), binCount - 1);
      bins[binIndex].count++;
    });

    return bins;
  }

  private formatRealTimeData(data: any[], maxDataPoints: number): any[] {
    // Keep only the most recent data points
    if (data.length > maxDataPoints) {
      return data.slice(-maxDataPoints);
    }
    return data;
  }

  private generateTitle(query: AnalyticsQuery): string {
    if (query.metrics.length === 1) {
      return this.formatMetricName(query.metrics[0]);
    }
    return `${query.metrics.length} Metrics Over Time`;
  }

  private formatMetricName(metric: string): string {
    return metric
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private formatDimensionName(dimension: string): string {
    return dimension
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  public exportChart(
    chartData: ChartData,
    format: 'png' | 'jpg' | 'pdf' | 'svg'
  ): Promise<Buffer> {
    // In a real implementation, this would use a library like Puppeteer
    // to render the chart and export it in the requested format
    throw new Error(`Chart export to ${format} not implemented`);
  }

  public validateChartConfig(config: ChartConfig): boolean {
    // Validate chart configuration
    if (!config.type) {
      throw new Error('Chart type is required');
    }

    if (!config.series || config.series.length === 0) {
      throw new Error('Chart must have at least one series');
    }

    for (const series of config.series) {
      if (!series.name) {
        throw new Error('Series name is required');
      }
      
      if (!series.data || series.data.length === 0) {
        throw new Error('Series must have data');
      }
    }

    return true;
  }
}