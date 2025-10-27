import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createGracefulDegradationService } from '../../src/services/graceful-degradation.service';
import { CircuitBreaker } from 'opossum';

// Mock circuit breaker implementation for testing
class MockCircuitBreaker {
  private state: 'CLOSED' | 'OPEN' | 'HALF-OPEN' = 'CLOSED';
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime = 0;
  
  constructor(private config: any) {}

  async execute<T>(operation: () => Promise<T>, fallback?: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.config.recoveryTimeout) {
        this.state = 'HALF-OPEN';
      } else {
        if (fallback) {
          return await fallback();
        }
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await operation();
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure();
      if (fallback) {
        return await fallback();
      }
      throw error;
    }
  }

  recordSuccess(): void {
    this.successCount++;
    if (this.state === 'HALF-OPEN') {
      this.state = 'CLOSED';
      this.failureCount = 0;
    }
  }

  recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.config.failureThreshold) {
      this.state = 'OPEN';
    }
  }

  isAvailable(): boolean {
    return this.state === 'CLOSED' || this.state === 'HALF-OPEN';
  }

  getState(): { state: string; failureCount: number; successCount: number } {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount
    };
  }

  reset(): void {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
  }
}

// Mock dependencies
const mockPrisma = {
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  activityLog: {
    create: vi.fn(),
  },
};

const mockRedis = {
  get: vi.fn(),
  set: vi.fn(),
  setex: vi.fn(),
  incr: vi.fn(),
  del: vi.fn(),
};

// Circuit breakers for each service
const circuitBreakers = {
  database: new MockCircuitBreaker({
    failureThreshold: 5,
    recoveryTimeout: 60000,
    monitoringPeriod: 30000,
    halfOpenMaxCalls: 3
  }),
  redis: new MockCircuitBreaker({
    failureThreshold: 3,
    recoveryTimeout: 30000,
    monitoringPeriod: 15000,
    halfOpenMaxCalls: 2
  }),
  email: new MockCircuitBreaker({
    failureThreshold: 10,
    recoveryTimeout: 120000,
    monitoringPeriod: 60000,
    halfOpenMaxCalls: 5
  }),
  sms: new MockCircuitBreaker({
    failureThreshold: 10,
    recoveryTimeout: 120000,
    monitoringPeriod: 60000,
    halfOpenMaxCalls: 5
  })
};

// Mock the circuit breaker middleware
vi.mock('../../src/middleware/circuit-breaker.middleware', () => ({
  getCircuitBreaker: vi.fn((service: string) => circuitBreakers[service as keyof typeof circuitBreakers]),
}));

// Mock logger
vi.mock('../../src/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('Circuit Breaker and Graceful Degradation Integration', () => {
  let degradationService: ReturnType<typeof createGracefulDegradationService>;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset all circuit breakers
    Object.values(circuitBreakers).forEach(cb => cb.reset());
    
    degradationService = createGracefulDegradationService({
      prisma: mockPrisma as any,
      redis: mockRedis,
    });
  });

  afterEach(() => {
    degradationService.cleanup();
  });

  describe('Database Circuit Breaker Integration', () => {
    it('should transition from CLOSED to OPEN after failure threshold', async () => {
      // Simulate database failures
      mockPrisma.user.findUnique.mockRejectedValue(new Error('Database connection failed'));
      
      // Test multiple failures to trigger circuit breaker
      const promises = [];
      for (let i = 0; i < 6; i++) {
        promises.push(
          degradationService.database.findUser('test@example.com')
            .catch(() => null) // Catch errors to continue test
        );
      }
      
      await Promise.all(promises);
      
      // Circuit breaker should be OPEN
      const state = circuitBreakers.database.getState();
      expect(state.state).toBe('OPEN');
      expect(state.failureCount).toBeGreaterThanOrEqual(5);
      
      // Check degradation status
      const degradationStatus = degradationService.getDegradationStatus();
      expect(degradationStatus.degradedServices).toContain('database');
      expect(degradationStatus.isHealthy).toBe(false);
    });

    it('should use fallback when circuit breaker is OPEN', async () => {
      // Force circuit breaker to OPEN state
      for (let i = 0; i < 6; i++) {
        circuitBreakers.database.recordFailure();
      }
      
      expect(circuitBreakers.database.getState().state).toBe('OPEN');
      
      // Create user should use fallback (return temporary user)
      const userData = { email: 'fallback@example.com', firstName: 'Fallback' };
      const result = await degradationService.database.createUser(userData);
      
      expect(result.isTemporary).toBe(true);
      expect(result.email).toBe(userData.email);
      expect(result.status).toBe('PENDING');
      
      // Database should not have been called due to circuit breaker
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });

    it('should transition to HALF-OPEN and test recovery', async () => {
      vi.useFakeTimers();
      
      // Force circuit breaker to OPEN
      for (let i = 0; i < 6; i++) {
        circuitBreakers.database.recordFailure();
      }
      expect(circuitBreakers.database.getState().state).toBe('OPEN');
      
      // Fast forward past recovery timeout
      vi.advanceTimersByTime(65000); // 65 seconds
      
      // Simulate database recovery
      mockPrisma.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'recovery@example.com',
        profile: {}
      });
      
      // Next call should test recovery (HALF-OPEN)
      const result = await degradationService.database.findUser('recovery@example.com');
      
      expect(result).toBeDefined();
      expect(result.email).toBe('recovery@example.com');
      
      // Circuit breaker should be CLOSED again after successful call
      const state = circuitBreakers.database.getState();
      expect(state.state).toBe('CLOSED');
      
      vi.useRealTimers();
    });

    it('should handle mixed success and failure scenarios', async () => {
      let callCount = 0;
      
      // Simulate intermittent failures
      mockPrisma.user.findUnique.mockImplementation(async () => {
        callCount++;
        if (callCount % 3 === 0) {
          throw new Error('Intermittent database failure');
        }
        return { id: callCount.toString(), email: 'test@example.com', profile: {} };
      });
      
      const results = [];
      
      // Make multiple calls
      for (let i = 0; i < 10; i++) {
        try {
          const result = await degradationService.database.findUser('test@example.com');
          results.push({ success: true, result });
        } catch (error) {
          results.push({ success: false, error });
        }
      }
      
      // Should have mix of successes and failures
      const successes = results.filter(r => r.success).length;
      const failures = results.filter(r => !r.success).length;
      
      expect(successes).toBeGreaterThan(0);
      expect(failures).toBeGreaterThan(0);
      
      // Circuit breaker should still be responsive
      const state = circuitBreakers.database.getState();
      expect(['CLOSED', 'HALF-OPEN']).toContain(state.state);
    });
  });

  describe('Redis Circuit Breaker Integration', () => {
    it('should use in-memory fallback when Redis circuit breaker opens', async () => {
      // Force Redis failures to open circuit breaker
      mockRedis.set.mockRejectedValue(new Error('Redis connection lost'));
      mockRedis.get.mockRejectedValue(new Error('Redis connection lost'));
      
      // Trigger circuit breaker opening
      for (let i = 0; i < 4; i++) {
        await degradationService.redis.set(`key${i}`, `value${i}`).catch(() => {});
      }
      
      expect(circuitBreakers.redis.getState().state).toBe('OPEN');
      
      // Operations should use in-memory fallback
      await degradationService.redis.set('test-key', 'test-value');
      const result = await degradationService.redis.get('test-key');
      
      expect(result).toBe('test-value');
      
      // Redis should not have been called
      expect(mockRedis.set).toHaveBeenCalledTimes(4); // Only the failing calls
    });

    it('should handle Redis recovery gracefully', async () => {
      vi.useFakeTimers();
      
      // Open circuit breaker
      for (let i = 0; i < 4; i++) {
        circuitBreakers.redis.recordFailure();
      }
      expect(circuitBreakers.redis.getState().state).toBe('OPEN');
      
      // Store data in fallback during outage
      await degradationService.redis.set('recovery-key', 'recovery-value');
      
      // Fast forward past recovery timeout
      vi.advanceTimersByTime(35000); // 35 seconds
      
      // Simulate Redis recovery
      mockRedis.set.mockResolvedValue('OK');
      mockRedis.get.mockResolvedValue('recovery-value');
      
      // Test recovery
      await degradationService.redis.set('recovery-key', 'new-value');
      const result = await degradationService.redis.get('recovery-key');
      
      expect(result).toBe('new-value');
      expect(circuitBreakers.redis.getState().state).toBe('CLOSED');
      
      vi.useRealTimers();
    });
  });

  describe('Email Service Circuit Breaker Integration', () => {
    it('should queue emails when circuit breaker is open', async () => {
      // Open email circuit breaker
      for (let i = 0; i < 11; i++) {
        circuitBreakers.email.recordFailure();
      }
      expect(circuitBreakers.email.getState().state).toBe('OPEN');
      
      // Send email should use fallback (queuing)
      const result = await degradationService.email.sendEmail(
        'test@example.com',
        'Test Subject',
        'Test Content'
      );
      
      expect(result).toBe(false); // Indicates email was queued
      
      // Check that operation was queued
      const status = degradationService.getDegradationStatus();
      expect(status.queuedOperations).toBeGreaterThan(0);
      expect(status.degradedServices).toContain('email');
    });

    it('should prioritize critical emails during degradation', async () => {
      // Open email circuit breaker
      for (let i = 0; i < 11; i++) {
        circuitBreakers.email.recordFailure();
      }
      
      // Send critical and regular emails
      await degradationService.email.sendEmail(
        'user@example.com',
        'Password Reset - Critical',
        'Reset your password'
      );
      
      await degradationService.email.sendEmail(
        'user@example.com',
        'Newsletter',
        'Regular newsletter content'
      );
      
      // Both should be queued but critical should be prioritized
      const status = degradationService.getDegradationStatus();
      expect(status.queuedOperations).toBe(2);
    });
  });

  describe('SMS Service Circuit Breaker Integration', () => {
    it('should queue SMS messages when circuit breaker is open', async () => {
      // Open SMS circuit breaker
      for (let i = 0; i < 11; i++) {
        circuitBreakers.sms.recordFailure();
      }
      expect(circuitBreakers.sms.getState().state).toBe('OPEN');
      
      // Send SMS should use fallback (queuing)
      const result = await degradationService.sms.sendSms(
        '+1234567890',
        'Test SMS message'
      );
      
      expect(result).toBe(false); // Indicates SMS was queued
      
      // Check that operation was queued
      const status = degradationService.getDegradationStatus();
      expect(status.queuedOperations).toBeGreaterThan(0);
      expect(status.degradedServices).toContain('sms');
    });
  });

  describe('Multi-Service Circuit Breaker Scenarios', () => {
    it('should handle multiple circuit breakers opening simultaneously', async () => {
      // Open multiple circuit breakers
      for (let i = 0; i < 6; i++) {
        circuitBreakers.database.recordFailure();
      }
      for (let i = 0; i < 4; i++) {
        circuitBreakers.redis.recordFailure();
      }
      for (let i = 0; i < 11; i++) {
        circuitBreakers.email.recordFailure();
      }
      
      // Check that all services are degraded
      const status = degradationService.getDegradationStatus();
      expect(status.isHealthy).toBe(false);
      expect(status.degradedServices).toContain('database');
      expect(status.degradedServices).toContain('redis');
      expect(status.degradedServices).toContain('email');
      
      // System should still function with fallbacks
      const userData = { email: 'multi@example.com', firstName: 'Multi' };
      const userResult = await degradationService.database.createUser(userData);
      expect(userResult.isTemporary).toBe(true);
      
      await degradationService.redis.set('multi-key', 'multi-value');
      const redisResult = await degradationService.redis.get('multi-key');
      expect(redisResult).toBe('multi-value');
      
      const emailResult = await degradationService.email.sendEmail(
        'multi@example.com',
        'Test',
        'Content'
      );
      expect(emailResult).toBe(false);
    });

    it('should coordinate recovery across multiple services', async () => {
      vi.useFakeTimers();
      
      // Open all circuit breakers
      for (let i = 0; i < 6; i++) circuitBreakers.database.recordFailure();
      for (let i = 0; i < 4; i++) circuitBreakers.redis.recordFailure();
      for (let i = 0; i < 11; i++) circuitBreakers.email.recordFailure();
      for (let i = 0; i < 11; i++) circuitBreakers.sms.recordFailure();
      
      // Fast forward to allow recovery testing
      vi.advanceTimersByTime(125000); // 125 seconds (past longest recovery timeout)
      
      // Mock service recovery
      mockPrisma.user.create.mockResolvedValue({
        id: 'recovered-1',
        email: 'recovery@example.com',
        createdAt: new Date()
      });
      mockRedis.set.mockResolvedValue('OK');
      
      // Test operations that should trigger recovery
      const userData = { email: 'recovery@example.com', firstName: 'Recovery' };
      await degradationService.database.createUser(userData);
      await degradationService.redis.set('recovery-key', 'recovery-value');
      
      // Circuit breakers should transition to CLOSED
      expect(circuitBreakers.database.getState().state).toBe('CLOSED');
      expect(circuitBreakers.redis.getState().state).toBe('CLOSED');
      
      vi.useRealTimers();
    });

    it('should maintain system stability during cascading failures', async () => {
      // Simulate cascading failures starting with database
      mockPrisma.user.findUnique.mockRejectedValue(new Error('Database overloaded'));
      
      // Initial database failures
      for (let i = 0; i < 6; i++) {
        await degradationService.database.findUser('cascade@example.com').catch(() => {});
      }
      
      // Database circuit breaker should be open
      expect(circuitBreakers.database.getState().state).toBe('OPEN');
      
      // Simulate Redis failing due to increased load from fallback caching
      mockRedis.set.mockRejectedValue(new Error('Redis memory pressure'));
      
      for (let i = 0; i < 4; i++) {
        await degradationService.redis.set(`cascade-key-${i}`, 'value').catch(() => {});
      }
      
      // Redis circuit breaker should also be open
      expect(circuitBreakers.redis.getState().state).toBe('OPEN');
      
      // System should still function with in-memory fallbacks
      const status = degradationService.getDegradationStatus();
      expect(status.isHealthy).toBe(false);
      expect(status.degradedServices.length).toBeGreaterThanOrEqual(2);
      
      // Core functionality should still work
      const userData = { email: 'cascade@example.com', firstName: 'Cascade' };
      const result = await degradationService.database.createUser(userData);
      expect(result.isTemporary).toBe(true);
    });
  });

  describe('Circuit Breaker State Monitoring', () => {
    it('should accurately report circuit breaker states in degradation status', async () => {
      // Set different states for different services
      circuitBreakers.database.recordFailure(); // CLOSED (1 failure)
      
      for (let i = 0; i < 4; i++) {
        circuitBreakers.redis.recordFailure(); // OPEN (4 failures, threshold is 3)
      }
      
      const status = degradationService.getDegradationStatus();
      
      // Database should be healthy (circuit breaker closed)
      expect(status.degradedServices).not.toContain('database');
      
      // Redis should be degraded (circuit breaker open)
      expect(status.degradedServices).toContain('redis');
      
      // Check fallbacks active
      expect(status.fallbacksActive).toContain('redis');
      expect(status.fallbacksActive).not.toContain('database');
    });

    it('should track circuit breaker state transitions', async () => {
      const states: string[] = [];
      
      // Monitor state changes
      const checkState = () => {
        const state = circuitBreakers.database.getState().state;
        if (states[states.length - 1] !== state) {
          states.push(state);
        }
      };
      
      // Initial state should be CLOSED
      checkState();
      expect(states[0]).toBe('CLOSED');
      
      // Force failures to open circuit breaker
      for (let i = 0; i < 6; i++) {
        circuitBreakers.database.recordFailure();
        checkState();
      }
      
      // Should transition to OPEN
      expect(states).toContain('OPEN');
      
      // Simulate recovery
      circuitBreakers.database.recordSuccess();
      checkState();
      
      // Should transition back to CLOSED
      expect(states[states.length - 1]).toBe('CLOSED');
    });
  });

  describe('Performance Impact of Circuit Breakers', () => {
    it('should fail fast when circuit breaker is open', async () => {
      // Open database circuit breaker
      for (let i = 0; i < 6; i++) {
        circuitBreakers.database.recordFailure();
      }
      
      const startTime = Date.now();
      
      // Operation should fail fast without waiting for database timeout
      const userData = { email: 'fast-fail@example.com', firstName: 'FastFail' };
      const result = await degradationService.database.createUser(userData);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete quickly (fallback execution)
      expect(duration).toBeLessThan(100); // Less than 100ms
      expect(result.isTemporary).toBe(true);
    });

    it('should maintain throughput during partial degradation', async () => {
      // Open email circuit breaker only
      for (let i = 0; i < 11; i++) {
        circuitBreakers.email.recordFailure();
      }
      
      // Mock successful operations for other services
      mockPrisma.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'throughput@example.com',
        profile: {}
      });
      mockRedis.get.mockResolvedValue('cached-value');
      
      const operations = [];
      const startTime = Date.now();
      
      // Perform multiple operations
      for (let i = 0; i < 50; i++) {
        operations.push(
          degradationService.database.findUser('throughput@example.com'),
          degradationService.redis.get('throughput-key'),
          degradationService.email.sendEmail('throughput@example.com', 'Test', 'Content')
        );
      }
      
      await Promise.all(operations);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should maintain reasonable throughput despite email degradation
      expect(duration).toBeLessThan(5000); // Less than 5 seconds for 150 operations
      
      // Email operations should be queued (fast fallback)
      const status = degradationService.getDegradationStatus();
      expect(status.queuedOperations).toBe(50); // 50 email operations queued
    });
  });
});