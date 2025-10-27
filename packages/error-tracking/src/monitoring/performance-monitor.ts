import { EventEmitter } from 'events';
import Redis from 'ioredis';
import { Client as PostgresClient } from 'pg';

export interface PerformanceMetrics {
  service: string;
  environment: string;
  timestamp: Date;
  
  // Request metrics
  requestCount: number;
  errorCount: number;
  responseTime: {
    min: number;
    max: number;
    avg: number;
    p50: number;
    p95: number;
    p99: number;
  };
  
  // System metrics
  cpu: {
    usage: number; // percentage
    loadAverage: number[];
  };
  memory: {
    used: number; // bytes
    total: number; // bytes
    usage: number; // percentage
    heapUsed?: number; // Node.js specific
    heapTotal?: number; // Node.js specific
  };
  
  // Database metrics
  database?: {
    activeConnections: number;
    totalConnections: number;
    queryTime: {
      avg: number;
      p95: number;
    };
    slowQueries: number;
  };
  
  // Cache metrics
  cache?: {
    hitRate: number; // percentage
    missRate: number; // percentage
    evictions: number;
    connections: number;
  };
  
  // Custom business metrics
  custom: Record<string, number>;
}

export interface PerformanceAlert {
  type: 'cpu_high' | 'memory_high' | 'response_slow' | 'error_spike' | 'database_slow' | 'cache_miss_high';
  severity: 'warning' | 'critical';
  message: string;
  metrics: PerformanceMetrics;
  threshold: number;
  currentValue: number;
}

export class PerformanceMonitor extends EventEmitter {
  private metrics: PerformanceMetrics[] = [];
  private collectors: Map<string, () => Promise<Partial<PerformanceMetrics>>> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private redis?: Redis;
  private postgres?: PostgresClient;
  
  constructor(
    private config: PerformanceMonitorConfig,
    private serviceName: string,
    private environment: string = 'development'
  ) {
    super();
    this.initializeConnections();
    this.setupDefaultCollectors();
    this.startCollection();
  }

  private async initializeConnections(): Promise<void> {
    // Initialize Redis connection for cache metrics
    if (this.config.redis) {
      this.redis = new Redis(this.config.redis);
    }

    // Initialize PostgreSQL connection for database metrics
    if (this.config.postgres) {
      this.postgres = new PostgresClient(this.config.postgres);
      await this.postgres.connect();
    }
  }

  private setupDefaultCollectors(): void {
    // System metrics collector
    this.addCollector('system', async () => {
      const os = await import('os');
      const process = await import('process');
      
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;
      
      return {
        cpu: {
          usage: await this.getCpuUsage(),
          loadAverage: os.loadavg(),
        },
        memory: {
          used: usedMem,
          total: totalMem,
          usage: (usedMem / totalMem) * 100,
          heapUsed: process.memoryUsage().heapUsed,
          heapTotal: process.memoryUsage().heapTotal,
        },
      };
    });

    // Database metrics collector
    if (this.postgres) {
      this.addCollector('database', async () => {
        try {
          const stats = await this.collectDatabaseMetrics();
          return { database: stats };
        } catch (error) {
          console.error('Failed to collect database metrics:', error);
          return {};
        }
      });
    }

    // Cache metrics collector
    if (this.redis) {
      this.addCollector('cache', async () => {
        try {
          const stats = await this.collectCacheMetrics();
          return { cache: stats };
        } catch (error) {
          console.error('Failed to collect cache metrics:', error);
          return {};
        }
      });
    }
  }

  // Add custom metrics collector
  public addCollector(
    name: string,
    collector: () => Promise<Partial<PerformanceMetrics>>
  ): void {
    this.collectors.set(name, collector);
    console.log(`📊 Performance collector added: ${name}`);
  }

  // Remove metrics collector
  public removeCollector(name: string): void {
    this.collectors.delete(name);
    console.log(`🗑️ Performance collector removed: ${name}`);
  }

  // Start performance monitoring
  private startCollection(): void {
    const interval = setInterval(async () => {
      await this.collectMetrics();
    }, this.config.collectionIntervalMs || 30000); // Default 30 seconds

    this.intervals.set('main', interval);

    // Start alert checking
    const alertInterval = setInterval(() => {
      this.checkPerformanceAlerts();
    }, this.config.alertCheckIntervalMs || 60000); // Default 1 minute

    this.intervals.set('alerts', alertInterval);

    console.log(`📈 Performance monitoring started for ${this.serviceName}`);
  }

  // Collect all metrics
  private async collectMetrics(): Promise<void> {
    try {
      const baseMetrics: PerformanceMetrics = {
        service: this.serviceName,
        environment: this.environment,
        timestamp: new Date(),
        requestCount: 0,
        errorCount: 0,
        responseTime: {
          min: 0,
          max: 0,
          avg: 0,
          p50: 0,
          p95: 0,
          p99: 0,
        },
        cpu: { usage: 0, loadAverage: [] },
        memory: { used: 0, total: 0, usage: 0 },
        custom: {},
      };

      // Collect metrics from all collectors
      for (const [name, collector] of this.collectors) {
        try {
          const collectedMetrics = await collector();
          Object.assign(baseMetrics, collectedMetrics);
        } catch (error) {
          console.error(`Failed to collect metrics from ${name}:`, error);
        }
      }

      // Store metrics
      this.metrics.push(baseMetrics);
      
      // Keep only recent metrics (last 24 hours)
      const cutoff = Date.now() - (24 * 60 * 60 * 1000);
      this.metrics = this.metrics.filter(m => m.timestamp.getTime() > cutoff);

      // Emit metrics event
      this.emit('metricsCollected', baseMetrics);

      // Send to external systems if configured
      if (this.config.prometheus?.pushGateway) {
        await this.pushToPrometheus(baseMetrics);
      }

      if (this.config.influxdb) {
        await this.pushToInfluxDB(baseMetrics);
      }

    } catch (error) {
      console.error('Failed to collect performance metrics:', error);
    }
  }

  // Get CPU usage percentage
  private async getCpuUsage(): Promise<number> {
    const os = await import('os');
    
    return new Promise((resolve) => {
      const startUsage = process.cpuUsage();
      const startTime = Date.now();
      
      setTimeout(() => {
        const endUsage = process.cpuUsage(startUsage);
        const endTime = Date.now();
        
        const totalTime = (endTime - startTime) * 1000; // Convert to microseconds
        const totalUsage = endUsage.user + endUsage.system;
        
        const cpuPercent = (totalUsage / totalTime) * 100;
        resolve(Math.min(100, Math.max(0, cpuPercent)));
      }, 100);
    });
  }

  // Collect database metrics
  private async collectDatabaseMetrics(): Promise<any> {
    if (!this.postgres) return {};

    try {
      // Get connection stats
      const connectionStats = await this.postgres.query(`
        SELECT 
          count(*) as total_connections,
          count(*) FILTER (WHERE state = 'active') as active_connections
        FROM pg_stat_activity 
        WHERE datname = current_database()
      `);

      // Get query performance stats
      const queryStats = await this.postgres.query(`
        SELECT 
          avg(mean_exec_time) as avg_query_time,
          percentile_cont(0.95) WITHIN GROUP (ORDER BY mean_exec_time) as p95_query_time,
          sum(calls) as total_calls
        FROM pg_stat_statements 
        WHERE dbid = (SELECT oid FROM pg_database WHERE datname = current_database())
      `);

      // Get slow queries (queries taking more than 1 second)
      const slowQueries = await this.postgres.query(`
        SELECT count(*) as slow_queries
        FROM pg_stat_statements 
        WHERE mean_exec_time > 1000
        AND dbid = (SELECT oid FROM pg_database WHERE datname = current_database())
      `);

      const connStats = connectionStats.rows[0] || {};
      const queryStatsRow = queryStats.rows[0] || {};
      const slowQueriesRow = slowQueries.rows[0] || {};

      return {
        activeConnections: parseInt(connStats.active_connections) || 0,
        totalConnections: parseInt(connStats.total_connections) || 0,
        queryTime: {
          avg: parseFloat(queryStatsRow.avg_query_time) || 0,
          p95: parseFloat(queryStatsRow.p95_query_time) || 0,
        },
        slowQueries: parseInt(slowQueriesRow.slow_queries) || 0,
      };
    } catch (error) {
      console.error('Database metrics collection failed:', error);
      return {};
    }
  }

  // Collect cache metrics
  private async collectCacheMetrics(): Promise<any> {
    if (!this.redis) return {};

    try {
      const info = await this.redis.info('stats');
      const lines = info.split('\r\n');
      const stats: Record<string, string> = {};

      for (const line of lines) {
        const [key, value] = line.split(':');
        if (key && value) {
          stats[key] = value;
        }
      }

      const keyspaceHits = parseInt(stats.keyspace_hits) || 0;
      const keyspaceMisses = parseInt(stats.keyspace_misses) || 0;
      const totalRequests = keyspaceHits + keyspaceMisses;

      const hitRate = totalRequests > 0 ? (keyspaceHits / totalRequests) * 100 : 0;
      const missRate = totalRequests > 0 ? (keyspaceMisses / totalRequests) * 100 : 0;

      return {
        hitRate,
        missRate,
        evictions: parseInt(stats.evicted_keys) || 0,
        connections: parseInt(stats.connected_clients) || 0,
      };
    } catch (error) {
      console.error('Cache metrics collection failed:', error);
      return {};
    }
  }

  // Check for performance alerts
  private checkPerformanceAlerts(): void {
    if (this.metrics.length === 0) return;

    const latestMetrics = this.metrics[this.metrics.length - 1];
    const alerts: PerformanceAlert[] = [];

    // CPU usage alert
    if (latestMetrics.cpu.usage > (this.config.alerts?.cpuThreshold || 80)) {
      alerts.push({
        type: 'cpu_high',
        severity: latestMetrics.cpu.usage > 95 ? 'critical' : 'warning',
        message: `High CPU usage: ${latestMetrics.cpu.usage.toFixed(2)}%`,
        metrics: latestMetrics,
        threshold: this.config.alerts?.cpuThreshold || 80,
        currentValue: latestMetrics.cpu.usage,
      });
    }

    // Memory usage alert
    if (latestMetrics.memory.usage > (this.config.alerts?.memoryThreshold || 85)) {
      alerts.push({
        type: 'memory_high',
        severity: latestMetrics.memory.usage > 95 ? 'critical' : 'warning',
        message: `High memory usage: ${latestMetrics.memory.usage.toFixed(2)}%`,
        metrics: latestMetrics,
        threshold: this.config.alerts?.memoryThreshold || 85,
        currentValue: latestMetrics.memory.usage,
      });
    }

    // Response time alert
    if (latestMetrics.responseTime.avg > (this.config.alerts?.responseTimeThreshold || 2000)) {
      alerts.push({
        type: 'response_slow',
        severity: latestMetrics.responseTime.avg > 5000 ? 'critical' : 'warning',
        message: `Slow response time: ${latestMetrics.responseTime.avg.toFixed(2)}ms`,
        metrics: latestMetrics,
        threshold: this.config.alerts?.responseTimeThreshold || 2000,
        currentValue: latestMetrics.responseTime.avg,
      });
    }

    // Error rate alert
    const errorRate = latestMetrics.requestCount > 0 ? 
      (latestMetrics.errorCount / latestMetrics.requestCount) * 100 : 0;
    
    if (errorRate > (this.config.alerts?.errorRateThreshold || 5)) {
      alerts.push({
        type: 'error_spike',
        severity: errorRate > 15 ? 'critical' : 'warning',
        message: `High error rate: ${errorRate.toFixed(2)}%`,
        metrics: latestMetrics,
        threshold: this.config.alerts?.errorRateThreshold || 5,
        currentValue: errorRate,
      });
    }

    // Database alerts
    if (latestMetrics.database?.queryTime.avg && 
        latestMetrics.database.queryTime.avg > (this.config.alerts?.databaseQueryThreshold || 1000)) {
      alerts.push({
        type: 'database_slow',
        severity: latestMetrics.database.queryTime.avg > 5000 ? 'critical' : 'warning',
        message: `Slow database queries: ${latestMetrics.database.queryTime.avg.toFixed(2)}ms`,
        metrics: latestMetrics,
        threshold: this.config.alerts?.databaseQueryThreshold || 1000,
        currentValue: latestMetrics.database.queryTime.avg,
      });
    }

    // Cache miss rate alert
    if (latestMetrics.cache?.missRate && 
        latestMetrics.cache.missRate > (this.config.alerts?.cacheMissRateThreshold || 20)) {
      alerts.push({
        type: 'cache_miss_high',
        severity: latestMetrics.cache.missRate > 50 ? 'critical' : 'warning',
        message: `High cache miss rate: ${latestMetrics.cache.missRate.toFixed(2)}%`,
        metrics: latestMetrics,
        threshold: this.config.alerts?.cacheMissRateThreshold || 20,
        currentValue: latestMetrics.cache.missRate,
      });
    }

    // Emit alerts
    for (const alert of alerts) {
      this.emit('performanceAlert', alert);
    }
  }

  // Record request metrics
  public recordRequest(responseTime: number, isError: boolean = false): void {
    // Add to current metrics or buffer for next collection
    const now = new Date();
    const currentHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());
    
    let currentMetrics = this.metrics.find(m => 
      m.timestamp.getTime() === currentHour.getTime()
    );

    if (!currentMetrics) {
      currentMetrics = {
        service: this.serviceName,
        environment: this.environment,
        timestamp: currentHour,
        requestCount: 0,
        errorCount: 0,
        responseTime: {
          min: responseTime,
          max: responseTime,
          avg: responseTime,
          p50: responseTime,
          p95: responseTime,
          p99: responseTime,
        },
        cpu: { usage: 0, loadAverage: [] },
        memory: { used: 0, total: 0, usage: 0 },
        custom: {},
      };
      this.metrics.push(currentMetrics);
    }

    // Update request metrics
    currentMetrics.requestCount++;
    if (isError) {
      currentMetrics.errorCount++;
    }

    // Update response time metrics
    currentMetrics.responseTime.min = Math.min(currentMetrics.responseTime.min, responseTime);
    currentMetrics.responseTime.max = Math.max(currentMetrics.responseTime.max, responseTime);
    
    // Update average (simple moving average)
    currentMetrics.responseTime.avg = 
      (currentMetrics.responseTime.avg * (currentMetrics.requestCount - 1) + responseTime) / 
      currentMetrics.requestCount;
  }

  // Add custom metric
  public addCustomMetric(name: string, value: number): void {
    const latestMetrics = this.metrics[this.metrics.length - 1];
    if (latestMetrics) {
      latestMetrics.custom[name] = value;
    }
  }

  // Get recent metrics
  public getRecentMetrics(hoursBack: number = 1): PerformanceMetrics[] {
    const cutoff = Date.now() - (hoursBack * 60 * 60 * 1000);
    return this.metrics.filter(m => m.timestamp.getTime() > cutoff);
  }

  // Get metrics summary
  public getMetricsSummary(hoursBack: number = 24): any {
    const recentMetrics = this.getRecentMetrics(hoursBack);
    
    if (recentMetrics.length === 0) {
      return null;
    }

    const summary = {
      service: this.serviceName,
      environment: this.environment,
      timeRange: `${hoursBack} hours`,
      totalRequests: recentMetrics.reduce((sum, m) => sum + m.requestCount, 0),
      totalErrors: recentMetrics.reduce((sum, m) => sum + m.errorCount, 0),
      avgCpuUsage: recentMetrics.reduce((sum, m) => sum + m.cpu.usage, 0) / recentMetrics.length,
      avgMemoryUsage: recentMetrics.reduce((sum, m) => sum + m.memory.usage, 0) / recentMetrics.length,
      avgResponseTime: recentMetrics.reduce((sum, m) => sum + m.responseTime.avg, 0) / recentMetrics.length,
      dataPoints: recentMetrics.length,
    };

    // Calculate error rate
    (summary as any).errorRate = summary.totalRequests > 0 ? 
      (summary.totalErrors / summary.totalRequests) * 100 : 0;

    return summary;
  }

  // Push metrics to Prometheus
  private async pushToPrometheus(metrics: PerformanceMetrics): Promise<void> {
    if (!this.config.prometheus?.pushGateway) return;

    try {
      const { register, Pushgateway } = await import('prom-client');
      const gateway = new Pushgateway(this.config.prometheus.pushGateway, [], register);
      
      await gateway.pushAdd({
        jobName: this.serviceName,
        groupings: { environment: this.environment },
      });
    } catch (error) {
      console.error('Failed to push metrics to Prometheus:', error);
    }
  }

  // Push metrics to InfluxDB
  private async pushToInfluxDB(metrics: PerformanceMetrics): Promise<void> {
    if (!this.config.influxdb) return;

    try {
      // This would integrate with InfluxDB client
      console.log('Pushing metrics to InfluxDB:', metrics.service);
    } catch (error) {
      console.error('Failed to push metrics to InfluxDB:', error);
    }
  }

  // Stop monitoring
  public stop(): void {
    for (const [name, interval] of this.intervals) {
      clearInterval(interval);
    }
    this.intervals.clear();

    if (this.redis) {
      this.redis.disconnect();
    }

    if (this.postgres) {
      this.postgres.end();
    }

    console.log(`🛑 Performance monitoring stopped for ${this.serviceName}`);
  }
}

export interface PerformanceMonitorConfig {
  collectionIntervalMs: number;
  alertCheckIntervalMs: number;
  
  // External connections
  redis?: {
    host: string;
    port: number;
    password?: string;
  };
  postgres?: {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
  };
  
  // External services
  prometheus?: {
    pushGateway: string;
  };
  influxdb?: {
    url: string;
    token: string;
    org: string;
    bucket: string;
  };
  
  // Alert thresholds
  alerts?: {
    cpuThreshold: number;
    memoryThreshold: number;
    responseTimeThreshold: number;
    errorRateThreshold: number;
    databaseQueryThreshold: number;
    cacheMissRateThreshold: number;
  };
}

// Default configuration
export const defaultPerformanceConfig: PerformanceMonitorConfig = {
  collectionIntervalMs: 30000, // 30 seconds
  alertCheckIntervalMs: 60000, // 1 minute
  alerts: {
    cpuThreshold: 80,
    memoryThreshold: 85,
    responseTimeThreshold: 2000, // 2 seconds
    errorRateThreshold: 5, // 5%
    databaseQueryThreshold: 1000, // 1 second
    cacheMissRateThreshold: 20, // 20%
  },
};