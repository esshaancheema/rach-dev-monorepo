import { PrismaClient, Prisma } from '@zoptal/database';
import { databaseConfig, serverConfig } from '../config';
import { logger } from './logger';

// Connection pool statistics interface
export interface ConnectionPoolStats {
  totalConnections: number;
  activeConnections: number;
  idleConnections: number;
  waitingConnections: number;
  poolSize: number;
  connectionLimit: number;
  averageQueryTime: number;
  slowQueries: number;
  totalQueries: number;
  lastHealthCheck: Date;
  isHealthy: boolean;
}

// Database health check result
export interface DatabaseHealthResult {
  isHealthy: boolean;
  responseTime: number;
  connectionPoolStats: ConnectionPoolStats;
  lastError?: string;
  lastErrorTime?: Date;
}

// Query performance metrics
interface QueryMetrics {
  totalQueries: number;
  slowQueries: number;
  totalQueryTime: number;
  averageQueryTime: number;
}

export class DatabaseManager {
  private static instance: DatabaseManager;
  private prismaClient: PrismaClient | null = null;
  private connectionPoolStats: ConnectionPoolStats;
  private queryMetrics: QueryMetrics;
  private lastHealthCheck: Date = new Date();
  private healthCheckInterval?: NodeJS.Timeout;
  private isShuttingDown = false;

  private constructor() {
    this.connectionPoolStats = {
      totalConnections: 0,
      activeConnections: 0,
      idleConnections: 0,
      waitingConnections: 0,
      poolSize: databaseConfig.poolSize,
      connectionLimit: databaseConfig.connectionLimit,
      averageQueryTime: 0,
      slowQueries: 0,
      totalQueries: 0,
      lastHealthCheck: new Date(),
      isHealthy: false,
    };

    this.queryMetrics = {
      totalQueries: 0,
      slowQueries: 0,
      totalQueryTime: 0,
      averageQueryTime: 0,
    };
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  /**
   * Initialize Prisma client with optimized connection pooling
   */
  public async initializeClient(): Promise<PrismaClient> {
    if (this.prismaClient) {
      return this.prismaClient;
    }

    try {
      // Build database URL with connection pool parameters
      const enhancedDatabaseUrl = this.buildEnhancedDatabaseUrl();

      // Create Prisma client with optimized configuration
      this.prismaClient = new PrismaClient({
        datasources: {
          db: {
            url: enhancedDatabaseUrl,
          },
        },
        log: this.buildLogConfiguration(),
        errorFormat: 'pretty',
        transactionOptions: {
          maxWait: databaseConfig.transactionTimeout,
          timeout: databaseConfig.transactionTimeout,
          isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
        },
      });

      // Set up query performance monitoring
      this.setupQueryMonitoring();

      // Set up connection pool monitoring
      this.setupConnectionMonitoring();

      // Connect to database with timeout
      await this.connectWithTimeout();

      // Start health check monitoring
      this.startHealthCheckMonitoring();

      logger.info('✅ Database connection pool initialized successfully', {
        poolSize: databaseConfig.poolSize,
        connectionLimit: databaseConfig.connectionLimit,
        queryTimeout: databaseConfig.queryTimeout,
        environment: serverConfig.nodeEnv,
      });

      return this.prismaClient;
    } catch (error) {
      logger.error('❌ Failed to initialize database connection pool:', error);
      throw error;
    }
  }

  /**
   * Build enhanced database URL with connection pool parameters
   */
  private buildEnhancedDatabaseUrl(): string {
    const url = new URL(databaseConfig.url);
    
    // Add connection pool parameters
    url.searchParams.set('connection_limit', databaseConfig.connectionLimit.toString());
    url.searchParams.set('pool_timeout', Math.floor(databaseConfig.poolTimeout / 1000).toString());
    url.searchParams.set('connect_timeout', Math.floor(databaseConfig.connectTimeout / 1000).toString());
    url.searchParams.set('statement_timeout', `${Math.floor(databaseConfig.statementTimeout / 1000)}s`);
    
    // Add PostgreSQL specific optimizations
    url.searchParams.set('pgbouncer', 'true');
    url.searchParams.set('prepared_statements', 'false'); // Better for connection pooling
    url.searchParams.set('sslmode', serverConfig.isProduction ? 'require' : 'prefer');
    
    // Performance optimizations
    url.searchParams.set('application_name', 'zoptal-auth-service');
    url.searchParams.set('search_path', 'public');
    
    return url.toString();
  }

  /**
   * Build log configuration based on environment
   */
  private buildLogConfiguration(): Prisma.LogLevel[] | Prisma.LogDefinition[] {
    if (!databaseConfig.enableLogging) {
      return [];
    }

    const logConfig: Prisma.LogDefinition[] = [
      {
        level: 'error',
        emit: 'event',
      },
      {
        level: 'warn',
        emit: 'event',
      },
    ];

    if (serverConfig.isDevelopment) {
      logConfig.push({
        level: 'info',
        emit: 'event',
      });
    }

    if (databaseConfig.logSlowQueries) {
      logConfig.push({
        level: 'query',
        emit: 'event',
      });
    }

    return logConfig;
  }

  /**
   * Set up query performance monitoring
   */
  private setupQueryMonitoring(): void {
    if (!this.prismaClient) return;

    // Monitor query performance
    this.prismaClient.$on('query', (event) => {
      const queryTime = event.duration;
      this.queryMetrics.totalQueries++;
      this.queryMetrics.totalQueryTime += queryTime;
      this.queryMetrics.averageQueryTime = this.queryMetrics.totalQueryTime / this.queryMetrics.totalQueries;

      // Track slow queries
      if (queryTime > databaseConfig.slowQueryThreshold) {
        this.queryMetrics.slowQueries++;
        
        if (databaseConfig.logSlowQueries) {
          logger.warn('🐌 Slow query detected', {
            query: event.query,
            duration: queryTime,
            params: event.params,
            target: event.target,
          });
        }
      }

      // Update connection pool stats
      this.updateConnectionPoolStats();
    });

    // Monitor errors
    this.prismaClient.$on('error', (event) => {
      logger.error('❌ Database error:', {
        message: event.message,
        target: event.target,
      });
    });

    // Monitor warnings
    this.prismaClient.$on('warn', (event) => {
      logger.warn('⚠️ Database warning:', {
        message: event.message,
        target: event.target,
      });
    });
  }

  /**
   * Set up connection pool monitoring
   */
  private setupConnectionMonitoring(): void {
    // Update stats every 30 seconds
    setInterval(() => {
      this.updateConnectionPoolStats();
    }, 30000);
  }

  /**
   * Connect to database with timeout
   */
  private async connectWithTimeout(): Promise<void> {
    if (!this.prismaClient) {
      throw new Error('Prisma client not initialized');
    }

    const connectPromise = this.prismaClient.$connect();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Database connection timeout after ${databaseConfig.connectTimeout}ms`));
      }, databaseConfig.connectTimeout);
    });

    await Promise.race([connectPromise, timeoutPromise]);
  }

  /**
   * Update connection pool statistics
   */
  private updateConnectionPoolStats(): void {
    // Note: Prisma doesn't expose direct connection pool metrics
    // These would typically come from the underlying database driver
    // For now, we'll estimate based on query patterns and health checks

    this.connectionPoolStats = {
      ...this.connectionPoolStats,
      totalQueries: this.queryMetrics.totalQueries,
      slowQueries: this.queryMetrics.slowQueries,
      averageQueryTime: this.queryMetrics.averageQueryTime,
      lastHealthCheck: this.lastHealthCheck,
    };
  }

  /**
   * Start health check monitoring
   */
  private startHealthCheckMonitoring(): void {
    // Initial health check
    this.performHealthCheck();

    // Schedule regular health checks every 60 seconds
    this.healthCheckInterval = setInterval(() => {
      if (!this.isShuttingDown) {
        this.performHealthCheck();
      }
    }, 60000);
  }

  /**
   * Perform database health check
   */
  public async performHealthCheck(): Promise<DatabaseHealthResult> {
    const startTime = Date.now();
    let isHealthy = false;
    let lastError: string | undefined;

    try {
      if (!this.prismaClient) {
        throw new Error('Database client not initialized');
      }

      // Simple health check query
      await this.prismaClient.$queryRaw`SELECT 1 as health_check`;
      
      isHealthy = true;
      this.connectionPoolStats.isHealthy = true;
    } catch (error) {
      isHealthy = false;
      lastError = error instanceof Error ? error.message : 'Unknown error';
      this.connectionPoolStats.isHealthy = false;
      
      logger.error('❌ Database health check failed:', error);
    }

    const responseTime = Date.now() - startTime;
    this.lastHealthCheck = new Date();

    const healthResult: DatabaseHealthResult = {
      isHealthy,
      responseTime,
      connectionPoolStats: { ...this.connectionPoolStats },
      lastError,
      lastErrorTime: lastError ? new Date() : undefined,
    };

    // Log health status if unhealthy
    if (!isHealthy) {
      logger.error('🔴 Database health check failed', healthResult);
    }

    return healthResult;
  }

  /**
   * Get current connection pool statistics
   */
  public getConnectionPoolStats(): ConnectionPoolStats {
    return { ...this.connectionPoolStats };
  }

  /**
   * Get query performance metrics
   */
  public getQueryMetrics(): QueryMetrics {
    return { ...this.queryMetrics };
  }

  /**
   * Get Prisma client instance
   */
  public getClient(): PrismaClient {
    if (!this.prismaClient) {
      throw new Error('Database client not initialized. Call initializeClient() first.');
    }
    return this.prismaClient;
  }

  /**
   * Reset query metrics (useful for monitoring)
   */
  public resetQueryMetrics(): void {
    this.queryMetrics = {
      totalQueries: 0,
      slowQueries: 0,
      totalQueryTime: 0,
      averageQueryTime: 0,
    };
    
    logger.info('📊 Query metrics reset');
  }

  /**
   * Execute query with timeout and retry logic
   */
  public async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    retryDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        logger.warn(`🔄 Database operation failed (attempt ${attempt}/${maxRetries}):`, {
          error: lastError.message,
          attempt,
        });

        if (attempt === maxRetries) {
          break;
        }

        // Wait before retry with exponential backoff
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
      }
    }

    throw lastError!;
  }

  /**
   * Graceful shutdown
   */
  public async shutdown(): Promise<void> {
    this.isShuttingDown = true;

    // Clear health check interval
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = undefined;
    }

    try {
      if (this.prismaClient) {
        logger.info('🔄 Closing database connections...');
        await this.prismaClient.$disconnect();
        this.prismaClient = null;
        logger.info('✅ Database connections closed successfully');
      }
    } catch (error) {
      logger.error('❌ Error during database shutdown:', error);
      throw error;
    }
  }

  /**
   * Force reconnect (useful for connection recovery)
   */
  public async reconnect(): Promise<void> {
    logger.info('🔄 Reconnecting to database...');
    
    try {
      if (this.prismaClient) {
        await this.prismaClient.$disconnect();
      }
      
      this.prismaClient = null;
      await this.initializeClient();
      
      logger.info('✅ Database reconnection successful');
    } catch (error) {
      logger.error('❌ Database reconnection failed:', error);
      throw error;
    }
  }

  /**
   * Get database configuration summary
   */
  public getConfigSummary(): Record<string, any> {
    return {
      poolSize: databaseConfig.poolSize,
      connectionLimit: databaseConfig.connectionLimit,
      queryTimeout: databaseConfig.queryTimeout,
      transactionTimeout: databaseConfig.transactionTimeout,
      connectTimeout: databaseConfig.connectTimeout,
      idleTimeout: databaseConfig.idleTimeout,
      enableLogging: databaseConfig.enableLogging,
      logSlowQueries: databaseConfig.logSlowQueries,
      slowQueryThreshold: databaseConfig.slowQueryThreshold,
      environment: serverConfig.nodeEnv,
    };
  }
}

// Export singleton instance
export const databaseManager = DatabaseManager.getInstance();

// Export helper functions
export const createOptimizedPrismaClient = async (): Promise<PrismaClient> => {
  return await databaseManager.initializeClient();
};

export const getDatabaseHealth = async (): Promise<DatabaseHealthResult> => {
  return await databaseManager.performHealthCheck();
};

export const getDatabaseStats = (): ConnectionPoolStats => {
  return databaseManager.getConnectionPoolStats();
};

export const getQueryMetrics = (): QueryMetrics => {
  return databaseManager.getQueryMetrics();
};