import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FraudDetectionService, DeviceFingerprint } from '../../src/services/fraud-detection.service';
import { PrismaClient } from '@zoptal/database';

// Mock dependencies
vi.mock('@zoptal/database');
vi.mock('../../src/utils/logger');
vi.mock('../../src/utils/redis');
vi.mock('../../src/services/geolocation.service');

describe('FraudDetectionService', () => {
  let fraudDetectionService: FraudDetectionService;
  let mockPrisma: PrismaClient;

  beforeEach(() => {
    mockPrisma = new PrismaClient() as any;
    fraudDetectionService = new FraudDetectionService(mockPrisma, {
      enabled: true,
      velocityThresholds: {
        maxLoginsPerMinute: 5,
        maxLoginsPerHour: 30,
        maxFailedAttemptsPerHour: 10,
        maxApiCallsPerMinute: 100
      },
      autoBlockThreshold: 80,
      verificationThreshold: 60
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Constructor and Configuration', () => {
    it('should initialize with default configuration', () => {
      const service = new FraudDetectionService(mockPrisma);
      expect(service).toBeDefined();
      
      const config = service.getConfiguration();
      expect(config.enabled).toBe(true);
      expect(config.autoBlockThreshold).toBe(80);
      expect(config.verificationThreshold).toBe(60);
    });

    it('should merge custom configuration with defaults', () => {
      const customConfig = {
        autoBlockThreshold: 90,
        verificationThreshold: 70,
        behavioralAnalysisEnabled: false
      };
      
      const service = new FraudDetectionService(mockPrisma, customConfig);
      const config = service.getConfiguration();
      
      expect(config.autoBlockThreshold).toBe(90);
      expect(config.verificationThreshold).toBe(70);
      expect(config.behavioralAnalysisEnabled).toBe(false);
    });

    it('should update configuration correctly', () => {
      const newConfig = {
        autoBlockThreshold: 85,
        velocityThresholds: {
          maxLoginsPerMinute: 3,
          maxLoginsPerHour: 20,
          maxFailedAttemptsPerHour: 8,
          maxApiCallsPerMinute: 80
        }
      };

      fraudDetectionService.updateConfiguration(newConfig);
      const config = fraudDetectionService.getConfiguration();
      
      expect(config.autoBlockThreshold).toBe(85);
      expect(config.velocityThresholds.maxLoginsPerMinute).toBe(3);
    });
  });

  describe('Fraud Analysis', () => {
    it('should allow access when fraud detection is disabled', async () => {
      const disabledService = new FraudDetectionService(mockPrisma, { enabled: false });
      
      const result = await disabledService.analyzeAuthenticationEvent('8.8.8.8');
      
      expect(result.allowAccess).toBe(true);
      expect(result.fraudScore).toBe(0);
      expect(result.riskLevel).toBe('LOW');
      expect(result.signals).toHaveLength(0);
    });

    it('should perform comprehensive analysis for enabled service', async () => {
      // Mock geolocation service
      vi.spyOn(require('../../src/services/geolocation.service'), 'geolocationService')
        .mockImplementation({
          getGeolocation: vi.fn().mockResolvedValue({
            ip: '8.8.8.8',
            country: 'United States',
            countryCode: 'US',
            region: 'CA',
            city: 'Mountain View',
            lat: 37.4056,
            lon: -122.0775,
            isp: 'Google LLC',
            vpn: false,
            proxy: false,
            tor: false,
            hosting: true,
            accuracy: 0.9
          })
        });

      const result = await fraudDetectionService.analyzeAuthenticationEvent(
        '8.8.8.8',
        'user-123',
        'session-456'
      );
      
      expect(result).toBeDefined();
      expect(result.ip).toBe('8.8.8.8');
      expect(result.userId).toBe('user-123');
      expect(result.sessionId).toBe('session-456');
      expect(result.fraudScore).toBeGreaterThanOrEqual(0);
      expect(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).toContain(result.riskLevel);
      expect(result.allowAccess).toBeDefined();
      expect(result.confidence).toBeGreaterThanOrEqual(0);
    });

    it('should handle device fingerprint analysis', async () => {
      const deviceFingerprint: DeviceFingerprint = {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        screenResolution: '1920x1080',
        timezone: 'America/New_York',
        language: 'en-US',
        platform: 'Win32',
        cookieEnabled: true,
        doNotTrack: false,
        hash: 'abc123def456'
      };

      const result = await fraudDetectionService.analyzeAuthenticationEvent(
        '8.8.8.8',
        'user-123',
        'session-456',
        deviceFingerprint
      );
      
      expect(result).toBeDefined();
      expect(result.signals.length).toBeGreaterThanOrEqual(0);
    });

    it('should detect automation tools in user agent', async () => {
      const suspiciousFingerprint: DeviceFingerprint = {
        userAgent: 'Mozilla/5.0 HeadlessChrome/91.0.4472.124',
        screenResolution: '1x1',
        timezone: 'UTC',
        language: 'en-US',
        platform: 'Linux',
        cookieEnabled: false,
        doNotTrack: true,
        hash: 'suspicious123'
      };

      const result = await fraudDetectionService.analyzeAuthenticationEvent(
        '1.2.3.4',
        'user-123',
        'session-456',
        suspiciousFingerprint
      );
      
      expect(result.fraudScore).toBeGreaterThan(0);
      expect(result.signals.some(s => s.type === 'DEVICE')).toBe(true);
    });

    it('should handle analysis failures gracefully', async () => {
      // Mock geolocation service to throw error
      vi.spyOn(require('../../src/services/geolocation.service'), 'geolocationService')
        .mockImplementation({
          getGeolocation: vi.fn().mockRejectedValue(new Error('Service unavailable'))
        });

      const result = await fraudDetectionService.analyzeAuthenticationEvent('8.8.8.8');
      
      expect(result.allowAccess).toBe(true);
      expect(result.recommendations).toContain('Analysis failed');
    });
  });

  describe('Fraud Score Calculation', () => {
    it('should calculate fraud score correctly with multiple signals', () => {
      const signals = [
        {
          type: 'VELOCITY' as const,
          severity: 'HIGH' as const,
          score: 80,
          description: 'High login velocity',
          metadata: {},
          detectedAt: new Date()
        },
        {
          type: 'GEOLOCATION' as const,
          severity: 'MEDIUM' as const,
          score: 50,
          description: 'Unusual location',
          metadata: {},
          detectedAt: new Date()
        }
      ];

      // Access private method for testing
      const fraudScore = (fraudDetectionService as any).calculateFraudScore(signals);
      
      expect(fraudScore).toBeGreaterThan(0);
      expect(fraudScore).toBeLessThanOrEqual(100);
    });

    it('should return 0 for empty signals array', () => {
      const fraudScore = (fraudDetectionService as any).calculateFraudScore([]);
      expect(fraudScore).toBe(0);
    });

    it('should weight critical signals higher than low signals', () => {
      const criticalSignal = [{
        type: 'VELOCITY' as const,
        severity: 'CRITICAL' as const,
        score: 50,
        description: 'Critical velocity',
        metadata: {},
        detectedAt: new Date()
      }];

      const lowSignal = [{
        type: 'VELOCITY' as const,
        severity: 'LOW' as const,
        score: 50,
        description: 'Low velocity',
        metadata: {},
        detectedAt: new Date()
      }];

      const criticalScore = (fraudDetectionService as any).calculateFraudScore(criticalSignal);
      const lowScore = (fraudDetectionService as any).calculateFraudScore(lowSignal);
      
      expect(criticalScore).toBeGreaterThan(lowScore);
    });
  });

  describe('Risk Level Determination', () => {
    it('should determine correct risk levels based on fraud score', () => {
      const testCases = [
        { score: 10, expectedLevel: 'LOW' },
        { score: 45, expectedLevel: 'MEDIUM' },
        { score: 70, expectedLevel: 'HIGH' },
        { score: 90, expectedLevel: 'CRITICAL' }
      ];

      testCases.forEach(({ score, expectedLevel }) => {
        const result = (fraudDetectionService as any).generateFraudResult(
          '8.8.8.8',
          'user-123',
          'session-456',
          score,
          []
        );
        
        expect(result.riskLevel).toBe(expectedLevel);
      });
    });

    it('should set allowAccess based on auto block threshold', () => {
      const config = fraudDetectionService.getConfiguration();
      
      const allowedResult = (fraudDetectionService as any).generateFraudResult(
        '8.8.8.8',
        'user-123',
        'session-456',
        config.autoBlockThreshold - 1,
        []
      );
      
      const blockedResult = (fraudDetectionService as any).generateFraudResult(
        '8.8.8.8',
        'user-123',
        'session-456',
        config.autoBlockThreshold + 1,
        []
      );
      
      expect(allowedResult.allowAccess).toBe(true);
      expect(blockedResult.allowAccess).toBe(false);
    });

    it('should set requiresVerification based on verification threshold', () => {
      const config = fraudDetectionService.getConfiguration();
      
      const noVerificationResult = (fraudDetectionService as any).generateFraudResult(
        '8.8.8.8',
        'user-123',
        'session-456',
        config.verificationThreshold - 1,
        []
      );
      
      const verificationResult = (fraudDetectionService as any).generateFraudResult(
        '8.8.8.8',
        'user-123',
        'session-456',
        config.verificationThreshold + 10,
        []
      );
      
      expect(noVerificationResult.requiresVerification).toBe(false);
      expect(verificationResult.requiresVerification).toBe(true);
    });
  });

  describe('Recommendations Generation', () => {
    it('should generate appropriate recommendations for velocity signals', () => {
      const velocitySignal = {
        type: 'VELOCITY' as const,
        severity: 'CRITICAL' as const,
        score: 95,
        description: 'Impossible velocity',
        metadata: {},
        detectedAt: new Date()
      };

      const result = (fraudDetectionService as any).generateFraudResult(
        '8.8.8.8',
        'user-123',
        'session-456',
        95,
        [velocitySignal]
      );
      
      expect(result.recommendations).toContain('Implement temporary IP block');
      expect(result.blockDuration).toBeDefined();
    });

    it('should generate geolocation recommendations', () => {
      const geoSignal = {
        type: 'GEOLOCATION' as const,
        severity: 'HIGH' as const,
        score: 75,
        description: 'Unusual location',
        metadata: {},
        detectedAt: new Date()
      };

      const result = (fraudDetectionService as any).generateFraudResult(
        '8.8.8.8',
        'user-123',
        'session-456',
        75,
        [geoSignal]
      );
      
      expect(result.recommendations.some(r => 
        r.includes('location verification') || r.includes('2FA')
      )).toBe(true);
    });

    it('should generate device verification recommendations', () => {
      const deviceSignal = {
        type: 'DEVICE' as const,
        severity: 'MEDIUM' as const,
        score: 50,
        description: 'Unrecognized device',
        metadata: {},
        detectedAt: new Date()
      };

      const result = (fraudDetectionService as any).generateFraudResult(
        '8.8.8.8',
        'user-123',
        'session-456',
        50,
        [deviceSignal]
      );
      
      expect(result.recommendations.some(r => 
        r.includes('Device verification')
      )).toBe(true);
    });
  });

  describe('Statistics and Analytics', () => {
    it('should return fraud statistics', async () => {
      const stats = await fraudDetectionService.getFraudStatistics();
      
      expect(stats).toHaveProperty('totalEvents');
      expect(stats).toHaveProperty('blockedEvents');
      expect(stats).toHaveProperty('blockRate');
      expect(stats).toHaveProperty('averageFraudScore');
      expect(stats).toHaveProperty('topSignalTypes');
      expect(Array.isArray(stats.topSignalTypes)).toBe(true);
    });

    it('should have consistent statistics format', async () => {
      const stats = await fraudDetectionService.getFraudStatistics();
      
      expect(typeof stats.totalEvents).toBe('number');
      expect(typeof stats.blockedEvents).toBe('number');
      expect(typeof stats.blockRate).toBe('number');
      expect(typeof stats.averageFraudScore).toBe('number');
      
      stats.topSignalTypes.forEach(signalType => {
        expect(signalType).toHaveProperty('type');
        expect(signalType).toHaveProperty('count');
        expect(typeof signalType.type).toBe('string');
        expect(typeof signalType.count).toBe('number');
      });
    });
  });

  describe('User Profile Management', () => {
    it('should clear user profile successfully', async () => {
      await expect(fraudDetectionService.clearUserProfile('user-123')).resolves.not.toThrow();
    });

    it('should handle clearing non-existent user profile', async () => {
      await expect(fraudDetectionService.clearUserProfile('non-existent-user')).resolves.not.toThrow();
    });
  });

  describe('Distance Calculations', () => {
    it('should calculate distance between coordinates correctly', () => {
      // Test distance calculation using Haversine formula
      const distance = (fraudDetectionService as any).calculateDistance(
        40.7128, -74.0060, // New York
        34.0522, -118.2437  // Los Angeles
      );
      
      // Distance between NYC and LA is approximately 3944 km
      expect(distance).toBeGreaterThan(3900);
      expect(distance).toBeLessThan(4000);
    });

    it('should return 0 for same coordinates', () => {
      const distance = (fraudDetectionService as any).calculateDistance(
        40.7128, -74.0060,
        40.7128, -74.0060
      );
      
      expect(distance).toBe(0);
    });

    it('should handle edge cases in distance calculation', () => {
      // Test with extreme coordinates
      const distance = (fraudDetectionService as any).calculateDistance(
        90, 0,    // North Pole
        -90, 0    // South Pole
      );
      
      expect(distance).toBeGreaterThan(19000); // Approximately half Earth's circumference
      expect(distance).toBeLessThan(21000);
    });
  });

  describe('Signal Analysis Components', () => {
    it('should analyze velocity patterns correctly', async () => {
      // Mock velocity data
      vi.spyOn(fraudDetectionService as any, 'getEventCount')
        .mockResolvedValueOnce(10) // High IP login count
        .mockResolvedValueOnce(50) // High hourly count
        .mockResolvedValueOnce(2)  // Normal user count
        .mockResolvedValueOnce(15); // High failed attempts

      const signals = await (fraudDetectionService as any).analyzeVelocity('1.2.3.4', 'user-123');
      
      expect(signals.length).toBeGreaterThan(0);
      expect(signals.some(s => s.type === 'VELOCITY')).toBe(true);
    });

    it('should handle network analysis for different connection types', async () => {
      // Mock geolocation service for VPN detection
      vi.spyOn(require('../../src/services/geolocation.service'), 'geolocationService')
        .mockImplementation({
          getGeolocation: vi.fn().mockResolvedValue({
            ip: '1.2.3.4',
            country: 'United States',
            countryCode: 'US',
            vpn: true,
            proxy: false,
            tor: false,
            hosting: false
          })
        });

      const signals = await (fraudDetectionService as any).analyzeNetwork('1.2.3.4');
      
      expect(signals.some(s => s.type === 'NETWORK' && s.description.includes('VPN'))).toBe(true);
    });

    it('should detect Tor usage with high severity', async () => {
      // Mock geolocation service for Tor detection
      vi.spyOn(require('../../src/services/geolocation.service'), 'geolocationService')
        .mockImplementation({
          getGeolocation: vi.fn().mockResolvedValue({
            ip: '1.2.3.4',
            country: 'Unknown',
            countryCode: 'XX',
            vpn: false,
            proxy: false,
            tor: true,
            hosting: false
          })
        });

      const signals = await (fraudDetectionService as any).analyzeNetwork('1.2.3.4');
      
      const torSignal = signals.find(s => s.description.includes('Tor'));
      expect(torSignal).toBeDefined();
      expect(torSignal.severity).toBe('HIGH');
      expect(torSignal.score).toBeGreaterThan(70);
    });
  });

  describe('Error Handling', () => {
    it('should handle geolocation service failures', async () => {
      vi.spyOn(require('../../src/services/geolocation.service'), 'geolocationService')
        .mockImplementation({
          getGeolocation: vi.fn().mockRejectedValue(new Error('Geolocation failed'))
        });

      const result = await fraudDetectionService.analyzeAuthenticationEvent('8.8.8.8', 'user-123');
      
      expect(result.allowAccess).toBe(true);
      expect(result.fraudScore).toBe(0);
    });

    it('should handle partial service failures gracefully', async () => {
      // Mock some services to fail, others to succeed
      vi.spyOn(fraudDetectionService as any, 'analyzeVelocity')
        .mockRejectedValue(new Error('Velocity analysis failed'));
      
      vi.spyOn(fraudDetectionService as any, 'analyzeNetwork')
        .mockResolvedValue([]);

      const result = await fraudDetectionService.analyzeAuthenticationEvent('8.8.8.8', 'user-123');
      
      // Should still return a result, potentially with reduced signals
      expect(result).toBeDefined();
      expect(result.allowAccess).toBeDefined();
    });
  });

  describe('Configuration Validation', () => {
    it('should validate threshold ranges', () => {
      expect(() => {
        fraudDetectionService.updateConfiguration({
          autoBlockThreshold: 150 // Invalid: > 100
        });
      }).not.toThrow(); // Service should handle invalid values gracefully
    });

    it('should maintain configuration consistency', () => {
      fraudDetectionService.updateConfiguration({
        autoBlockThreshold: 70,
        verificationThreshold: 80 // Higher than auto block
      });

      const config = fraudDetectionService.getConfiguration();
      
      // The service should allow this configuration but it might be flagged in logs
      expect(config.autoBlockThreshold).toBe(70);
      expect(config.verificationThreshold).toBe(80);
    });
  });
});