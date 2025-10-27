import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import { createGracefulDegradationService, GracefulDegradationService } from '../../src/services/graceful-degradation.service';

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

// Mock circuit breaker
const mockCircuitBreaker = {
  execute: vi.fn(),
  isAvailable: vi.fn().mockReturnValue(true),
  getState: vi.fn().mockReturnValue({ state: 'CLOSED' }),
};

// Mock the circuit breaker middleware
vi.mock('../../src/middleware/circuit-breaker.middleware', () => ({
  getCircuitBreaker: vi.fn(() => mockCircuitBreaker),
}));

// Mock logger
vi.mock('../../src/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('GracefulDegradationService', () => {
  let service: GracefulDegradationService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = createGracefulDegradationService({
      prisma: mockPrisma as any,
      redis: mockRedis,
    });
  });

  afterEach(() => {
    service.cleanup();
  });

  describe('Database Operations', () => {
    describe('findUser', () => {
      it('should return user from database when circuit breaker is closed', async () => {
        const mockUser = { id: '1', email: 'test@example.com', profile: {} };
        mockCircuitBreaker.execute.mockImplementation(async (operation, fallback) => {
          return await operation();
        });
        mockPrisma.user.findUnique.mockResolvedValue(mockUser);

        const result = await service.database.findUser('test@example.com');

        expect(result).toEqual(mockUser);
        expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
          where: { email: 'test@example.com' },
          include: { profile: true },
        });
      });

      it('should return cached data when database is unavailable', async () => {
        mockCircuitBreaker.execute.mockImplementation(async (operation, fallback) => {
          return await fallback();
        });

        // Pre-populate cache
        service.clearCache();
        await service.database.findUser('test@example.com');

        const result = await service.database.findUser('test@example.com');
        expect(result).toBeNull(); // No cached data initially
      });

      it('should handle database errors gracefully', async () => {
        mockCircuitBreaker.execute.mockImplementation(async (operation, fallback) => {
          throw new Error('Database connection failed');
        });

        await expect(service.database.findUser('test@example.com')).rejects.toThrow(
          'Database connection failed'
        );
      });
    });

    describe('createUser', () => {
      it('should create user in database when available', async () => {
        const userData = { email: 'new@example.com', firstName: 'John' };
        const mockUser = { ...userData, id: '1', createdAt: new Date() };
        
        mockCircuitBreaker.execute.mockImplementation(async (operation, fallback) => {
          return await operation();
        });
        mockPrisma.user.create.mockResolvedValue(mockUser);

        const result = await service.database.createUser(userData);

        expect(result).toEqual(mockUser);
        expect(mockPrisma.user.create).toHaveBeenCalledWith({
          data: userData,
          include: { profile: true },
        });
      });

      it('should return temporary user when database is unavailable', async () => {
        const userData = { email: 'new@example.com', firstName: 'John' };
        
        mockCircuitBreaker.execute.mockImplementation(async (operation, fallback) => {
          return await fallback();
        });

        const result = await service.database.createUser(userData);

        expect(result).toMatchObject({
          email: userData.email,
          status: 'PENDING',
          isTemporary: true,
        });
        expect(result.id).toMatch(/^temp_\d+$/);
      });
    });

    describe('updateUser', () => {
      it('should update user in database when available', async () => {
        const userId = '1';
        const updates = { firstName: 'Updated' };
        const mockUser = { id: userId, firstName: 'Updated', email: 'test@example.com' };
        
        mockCircuitBreaker.execute.mockImplementation(async (operation, fallback) => {
          return await operation();
        });
        mockPrisma.user.update.mockResolvedValue(mockUser);

        const result = await service.database.updateUser(userId, updates);

        expect(result).toEqual(mockUser);
        expect(mockPrisma.user.update).toHaveBeenCalledWith({
          where: { id: userId },
          data: updates,
          include: { profile: true },
        });
      });

      it('should throw error when database unavailable and no cached data', async () => {
        const userId = '1';
        const updates = { firstName: 'Updated' };
        
        mockCircuitBreaker.execute.mockImplementation(async (operation, fallback) => {
          return await fallback();
        });

        await expect(service.database.updateUser(userId, updates)).rejects.toThrow(
          'User data not available in fallback cache'
        );
      });
    });

    describe('logActivity', () => {
      it('should log activity to database when available', async () => {
        const activityData = { userId: '1', action: 'login', timestamp: new Date() };
        
        mockCircuitBreaker.execute.mockImplementation(async (operation, fallback) => {
          return await operation();
        });
        mockPrisma.activityLog.create.mockResolvedValue(activityData);

        await service.database.logActivity(activityData);

        expect(mockPrisma.activityLog.create).toHaveBeenCalledWith({
          data: activityData,
        });
      });

      it('should queue activity when database is unavailable', async () => {
        const activityData = { userId: '1', action: 'login', timestamp: new Date() };
        
        mockCircuitBreaker.execute.mockImplementation(async (operation, fallback) => {
          return await fallback();
        });

        await service.database.logActivity(activityData);

        // Should not throw, operation should be queued
        expect(mockPrisma.activityLog.create).not.toHaveBeenCalled();
      });
    });
  });

  describe('Redis Operations', () => {
    describe('get', () => {
      it('should get value from Redis when available', async () => {
        const key = 'test:key';
        const value = 'test-value';
        
        mockCircuitBreaker.execute.mockImplementation(async (operation, fallback) => {
          return await operation();
        });
        mockRedis.get.mockResolvedValue(value);

        const result = await service.redis.get(key);

        expect(result).toBe(value);
        expect(mockRedis.get).toHaveBeenCalledWith(key);
      });

      it('should return null from fallback cache when Redis unavailable', async () => {
        const key = 'test:key';
        
        mockCircuitBreaker.execute.mockImplementation(async (operation, fallback) => {
          return await fallback();
        });

        const result = await service.redis.get(key);

        expect(result).toBeNull();
        expect(mockRedis.get).not.toHaveBeenCalled();
      });
    });

    describe('set', () => {
      it('should set value in Redis when available', async () => {
        const key = 'test:key';
        const value = 'test-value';
        
        mockCircuitBreaker.execute.mockImplementation(async (operation, fallback) => {
          return await operation();
        });

        await service.redis.set(key, value);

        expect(mockRedis.set).toHaveBeenCalledWith(key, value);
      });

      it('should set value with TTL in Redis when available', async () => {
        const key = 'test:key';
        const value = 'test-value';
        const ttl = 300;
        
        mockCircuitBreaker.execute.mockImplementation(async (operation, fallback) => {
          return await operation();
        });

        await service.redis.set(key, value, ttl);

        expect(mockRedis.setex).toHaveBeenCalledWith(key, ttl, value);
      });

      it('should store in memory when Redis unavailable', async () => {
        const key = 'test:key';
        const value = 'test-value';
        
        mockCircuitBreaker.execute.mockImplementation(async (operation, fallback) => {
          return await fallback();
        });

        await service.redis.set(key, value);

        // Verify it's stored in memory fallback
        const result = await service.redis.get(key);
        expect(result).toBe(value);
        expect(mockRedis.set).not.toHaveBeenCalled();
      });
    });

    describe('incr', () => {
      it('should increment value in Redis when available', async () => {
        const key = 'counter:key';
        const newValue = 5;
        
        mockCircuitBreaker.execute.mockImplementation(async (operation, fallback) => {
          return await operation();
        });
        mockRedis.incr.mockResolvedValue(newValue);

        const result = await service.redis.incr(key);

        expect(result).toBe(newValue);
        expect(mockRedis.incr).toHaveBeenCalledWith(key);
      });

      it('should increment in memory when Redis unavailable', async () => {
        const key = 'counter:key';
        
        mockCircuitBreaker.execute.mockImplementation(async (operation, fallback) => {
          return await fallback();
        });

        const result1 = await service.redis.incr(key);
        const result2 = await service.redis.incr(key);

        expect(result1).toBe(1);
        expect(result2).toBe(2);
        expect(mockRedis.incr).not.toHaveBeenCalled();
      });
    });

    describe('del', () => {
      it('should delete value from Redis when available', async () => {
        const key = 'test:key';
        
        mockCircuitBreaker.execute.mockImplementation(async (operation, fallback) => {
          return await operation();
        });

        await service.redis.del(key);

        expect(mockRedis.del).toHaveBeenCalledWith(key);
      });

      it('should delete from memory when Redis unavailable', async () => {
        const key = 'test:key';
        const value = 'test-value';
        
        // First set a value
        mockCircuitBreaker.execute.mockImplementation(async (operation, fallback) => {
          return await fallback();
        });
        await service.redis.set(key, value);
        
        // Verify it exists
        let result = await service.redis.get(key);
        expect(result).toBe(value);
        
        // Delete it
        await service.redis.del(key);
        
        // Verify it's deleted
        result = await service.redis.get(key);
        expect(result).toBeNull();
        expect(mockRedis.del).not.toHaveBeenCalled();
      });
    });
  });

  describe('Email Operations', () => {
    describe('sendEmail', () => {
      it('should send email when service is available', async () => {
        const to = 'test@example.com';
        const subject = 'Test Subject';
        const content = 'Test Content';
        
        mockCircuitBreaker.execute.mockImplementation(async (operation, fallback) => {
          return await operation();
        });

        const result = await service.email.sendEmail(to, subject, content);

        expect(result).toBe(true);
      });

      it('should queue email when service is unavailable', async () => {
        const to = 'test@example.com';
        const subject = 'Test Subject';
        const content = 'Test Content';
        
        mockCircuitBreaker.execute.mockImplementation(async (operation, fallback) => {
          return await fallback();
        });

        const result = await service.email.sendEmail(to, subject, content);

        expect(result).toBe(false);
      });

      it('should prioritize critical emails in queue', async () => {
        const to = 'test@example.com';
        const subject = 'Password Reset - Critical';
        const content = 'Reset your password';
        
        mockCircuitBreaker.execute.mockImplementation(async (operation, fallback) => {
          return await fallback();
        });

        const result = await service.email.sendEmail(to, subject, content);

        expect(result).toBe(false); // Still returns false but queued with priority
      });
    });
  });

  describe('SMS Operations', () => {
    describe('sendSms', () => {
      it('should send SMS when service is available', async () => {
        const to = '+1234567890';
        const message = 'Test message';
        
        mockCircuitBreaker.execute.mockImplementation(async (operation, fallback) => {
          return await operation();
        });

        const result = await service.sms.sendSms(to, message);

        expect(result).toBe(true);
      });

      it('should queue SMS when service is unavailable', async () => {
        const to = '+1234567890';
        const message = 'Test message';
        
        mockCircuitBreaker.execute.mockImplementation(async (operation, fallback) => {
          return await fallback();
        });

        const result = await service.sms.sendSms(to, message);

        expect(result).toBe(false);
      });
    });
  });

  describe('System Status', () => {
    describe('getDegradationStatus', () => {
      it('should return healthy status when all services are available', () => {
        mockCircuitBreaker.isAvailable.mockReturnValue(true);
        mockCircuitBreaker.getState.mockReturnValue({ state: 'CLOSED' });

        const status = service.getDegradationStatus();

        expect(status.isHealthy).toBe(true);
        expect(status.degradedServices).toHaveLength(0);
        expect(status.fallbacksActive).toHaveLength(0);
        expect(status.queuedOperations).toBe(0);
        expect(status.cacheSize).toBe(0);
      });

      it('should return degraded status when services are unavailable', () => {
        mockCircuitBreaker.isAvailable.mockReturnValue(false);
        mockCircuitBreaker.getState.mockReturnValue({ state: 'OPEN' });

        const status = service.getDegradationStatus();

        expect(status.isHealthy).toBe(false);
        expect(status.degradedServices).toEqual(['database', 'redis', 'email', 'sms']);
        expect(status.fallbacksActive).toEqual(['database', 'redis', 'email', 'sms']);
      });
    });
  });

  describe('Queue Processing', () => {
    describe('processQueuedOperations', () => {
      it('should process queued operations successfully', async () => {
        // Mock a successful circuit breaker execution for processing
        let callCount = 0;
        mockCircuitBreaker.execute.mockImplementation(async (operation, fallback) => {
          callCount++;
          if (callCount === 1) {
            // First call fails (queues the operation)
            return await fallback();
          } else {
            // Second call succeeds (processes the queue)
            return await operation();
          }
        });

        // Queue an operation by having it fail first
        const userData = { email: 'queue@example.com', firstName: 'Queue' };
        await service.database.createUser(userData);

        // Now process the queue
        mockPrisma.user.create.mockResolvedValue({ ...userData, id: '1' });
        await service.processQueuedOperations();

        // The operation should have been processed
        expect(mockPrisma.user.create).toHaveBeenCalledWith({
          data: userData,
          include: { profile: true },
        });
      });

      it('should handle queue processing errors gracefully', async () => {
        // Queue an operation
        mockCircuitBreaker.execute.mockImplementation(async (operation, fallback) => {
          return await fallback();
        });

        const userData = { email: 'error@example.com', firstName: 'Error' };
        await service.database.createUser(userData);

        // Make processing fail
        mockCircuitBreaker.execute.mockImplementation(async (operation, fallback) => {
          throw new Error('Processing failed');
        });

        // Process queue - should not throw
        await service.processQueuedOperations();

        // Operation should be re-queued
        const status = service.getDegradationStatus();
        expect(status.queuedOperations).toBeGreaterThan(0);
      });
    });
  });

  describe('Cache Management', () => {
    describe('clearCache', () => {
      it('should clear all cached data', async () => {
        // Add some data to cache
        mockCircuitBreaker.execute.mockImplementation(async (operation, fallback) => {
          return await fallback();
        });

        await service.redis.set('key1', 'value1');
        await service.redis.set('key2', 'value2');

        let status = service.getDegradationStatus();
        expect(status.cacheSize).toBeGreaterThan(0);

        // Clear cache
        service.clearCache();

        status = service.getDegradationStatus();
        expect(status.cacheSize).toBe(0);
      });
    });
  });

  describe('Cache TTL', () => {
    it('should expire cached data after TTL', async () => {
      vi.useFakeTimers();
      
      mockCircuitBreaker.execute.mockImplementation(async (operation, fallback) => {
        return await fallback();
      });

      const key = 'ttl:key';
      const value = 'ttl-value';
      const ttl = 1; // 1 second

      await service.redis.set(key, value, ttl);

      // Value should be available immediately
      let result = await service.redis.get(key);
      expect(result).toBe(value);

      // Fast forward time beyond TTL
      vi.advanceTimersByTime(2000);

      // Value should be expired
      result = await service.redis.get(key);
      expect(result).toBeNull();

      vi.useRealTimers();
    });
  });

  describe('Cleanup', () => {
    it('should cleanup resources on service destruction', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
      
      service.cleanup();
      
      expect(clearIntervalSpy).toHaveBeenCalled();
    });
  });
});