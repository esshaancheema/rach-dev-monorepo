import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { logger } from '../utils/logger';

export interface CircuitBreakerState {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failureCount: number;
  successCount: number;
  lastFailureTime: number;
  nextAttemptTime: number;
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  recoveryTimeout: number;
  monitoringPeriod: number;
  halfOpenMaxCalls: number;
  healthCheckEndpoint?: string;
}

export class CircuitBreaker {
  private state: CircuitBreakerState;
  private config: CircuitBreakerConfig;
  private name: string;

  constructor(name: string, config: Partial<CircuitBreakerConfig> = {}) {
    this.name = name;
    this.config = {
      failureThreshold: 5,
      recoveryTimeout: 60000, // 1 minute
      monitoringPeriod: 30000, // 30 seconds
      halfOpenMaxCalls: 3,
      ...config
    };

    this.state = {
      state: 'CLOSED',
      failureCount: 0,
      successCount: 0,
      lastFailureTime: 0,
      nextAttemptTime: 0
    };

    logger.info({
      name: this.name,
      config: this.config
    }, 'Circuit breaker initialized');
  }

  async execute<T>(operation: () => Promise<T>, fallback?: () => Promise<T>): Promise<T> {
    if (this.state.state === 'OPEN') {
      if (Date.now() < this.state.nextAttemptTime) {
        logger.warn({
          name: this.name,
          state: this.state.state
        }, 'Circuit breaker is OPEN, executing fallback');
        
        if (fallback) {
          return await fallback();
        }
        throw new Error(`Circuit breaker ${this.name} is OPEN`);
      } else {
        this.state.state = 'HALF_OPEN';
        this.state.successCount = 0;
        logger.info({
          name: this.name
        }, 'Circuit breaker moved to HALF_OPEN state');
      }
    }

    if (this.state.state === 'HALF_OPEN' && this.state.successCount >= this.config.halfOpenMaxCalls) {
      logger.warn({
        name: this.name,
        successCount: this.state.successCount
      }, 'Circuit breaker HALF_OPEN max calls reached, executing fallback');
      
      if (fallback) {
        return await fallback();
      }
      throw new Error(`Circuit breaker ${this.name} is temporarily unavailable`);
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      logger.error({
        name: this.name,
        error,
        state: this.state
      }, 'Circuit breaker operation failed');
      
      if (fallback) {
        return await fallback();
      }
      throw error;
    }
  }

  private onSuccess(): void {
    this.state.successCount++;
    
    if (this.state.state === 'HALF_OPEN') {
      if (this.state.successCount >= this.config.halfOpenMaxCalls) {
        this.state.state = 'CLOSED';
        this.state.failureCount = 0;
        this.state.successCount = 0;
        logger.info({
          name: this.name
        }, 'Circuit breaker moved to CLOSED state after successful recovery');
      }
    } else if (this.state.state === 'CLOSED') {
      this.state.failureCount = 0;
    }
  }

  private onFailure(): void {
    this.state.failureCount++;
    this.state.lastFailureTime = Date.now();

    if (this.state.state === 'HALF_OPEN') {
      this.state.state = 'OPEN';
      this.state.nextAttemptTime = Date.now() + this.config.recoveryTimeout;
      logger.warn({
        name: this.name
      }, 'Circuit breaker moved to OPEN state from HALF_OPEN');
    } else if (this.state.state === 'CLOSED' && this.state.failureCount >= this.config.failureThreshold) {
      this.state.state = 'OPEN';
      this.state.nextAttemptTime = Date.now() + this.config.recoveryTimeout;
      logger.warn({
        name: this.name,
        failureCount: this.state.failureCount
      }, 'Circuit breaker moved to OPEN state due to failure threshold');
    }
  }

  getState(): CircuitBreakerState {
    return { ...this.state };
  }

  isAvailable(): boolean {
    return this.state.state === 'CLOSED' || 
           (this.state.state === 'HALF_OPEN' && this.state.successCount < this.config.halfOpenMaxCalls);
  }

  reset(): void {
    this.state = {
      state: 'CLOSED',
      failureCount: 0,
      successCount: 0,
      lastFailureTime: 0,
      nextAttemptTime: 0
    };
    logger.info({
      name: this.name
    }, 'Circuit breaker reset to CLOSED state');
  }
}

// Global circuit breaker registry
const circuitBreakers = new Map<string, CircuitBreaker>();

export function getCircuitBreaker(name: string, config?: Partial<CircuitBreakerConfig>): CircuitBreaker {
  if (!circuitBreakers.has(name)) {
    circuitBreakers.set(name, new CircuitBreaker(name, config));
  }
  return circuitBreakers.get(name)!;
}

export function getAllCircuitBreakers(): Map<string, CircuitBreaker> {
  return new Map(circuitBreakers);
}

/**
 * Circuit breaker middleware for Fastify routes
 */
export interface CircuitBreakerMiddlewareOptions {
  enableCircuitBreaker: boolean;
  circuitBreakerConfig: Record<string, CircuitBreakerConfig>;
  enableHealthChecks: boolean;
  healthCheckInterval: number;
}

export async function circuitBreakerMiddleware(
  fastify: FastifyInstance,
  options: Partial<CircuitBreakerMiddlewareOptions> = {}
) {
  const config = {
    enableCircuitBreaker: true,
    circuitBreakerConfig: {},
    enableHealthChecks: true,
    healthCheckInterval: 30000, // 30 seconds
    ...options
  };

  if (!config.enableCircuitBreaker) {
    logger.info('Circuit breaker middleware disabled');
    return;
  }

  // Initialize default circuit breakers for critical services
  const defaultServices = [
    'database',
    'redis',
    'email',
    'sms',
    'external_api'
  ];

  defaultServices.forEach(service => {
    getCircuitBreaker(service, config.circuitBreakerConfig[service]);
  });

  // Add circuit breaker status endpoint
  fastify.get('/circuit-breaker/status', async () => {
    const status: Record<string, any> = {};
    
    for (const [name, breaker] of getAllCircuitBreakers()) {
      status[name] = {
        ...breaker.getState(),
        isAvailable: breaker.isAvailable()
      };
    }

    return {
      timestamp: new Date().toISOString(),
      circuitBreakers: status
    };
  });

  // Add circuit breaker reset endpoint (admin only)
  fastify.post('/circuit-breaker/:name/reset', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    if (!user?.role || user.role !== 'ADMIN') {
      return reply.status(403).send({
        error: 'Forbidden',
        message: 'Admin access required'
      });
    }

    const { name } = request.params as { name: string };
    const breaker = circuitBreakers.get(name);
    
    if (!breaker) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'Circuit breaker not found'
      });
    }

    breaker.reset();
    
    logger.info({
      adminId: user.id,
      circuitBreakerName: name
    }, 'Circuit breaker reset by admin');

    return reply.send({
      message: `Circuit breaker ${name} reset successfully`,
      state: breaker.getState()
    });
  });

  // Health check for circuit breakers
  if (config.enableHealthChecks) {
    const healthCheckInterval = setInterval(async () => {
      for (const [name, breaker] of getAllCircuitBreakers()) {
        if (breaker.getState().state === 'OPEN') {
          logger.warn({
            name,
            state: breaker.getState()
          }, 'Circuit breaker health check - service unavailable');
        }
      }
    }, config.healthCheckInterval);

    // Clean up interval on server close
    fastify.addHook('onClose', async () => {
      clearInterval(healthCheckInterval);
    });
  }

  logger.info({
    enabledServices: defaultServices,
    enableHealthChecks: config.enableHealthChecks
  }, 'Circuit breaker middleware initialized');
}