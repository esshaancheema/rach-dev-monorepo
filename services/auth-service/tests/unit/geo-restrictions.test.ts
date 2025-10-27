import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GeoRestrictionsService } from '../../src/services/geo-restrictions.service';
import { GeolocationService } from '../../src/services/geolocation.service';
import { PrismaClient } from '@zoptal/database';

// Mock dependencies
vi.mock('@zoptal/database');
vi.mock('../../src/utils/logger');
vi.mock('../../src/utils/redis');

describe('GeoRestrictionsService', () => {
  let geoRestrictionsService: GeoRestrictionsService;
  let mockPrisma: PrismaClient;

  beforeEach(() => {
    mockPrisma = new PrismaClient() as any;
    geoRestrictionsService = new GeoRestrictionsService(mockPrisma, {
      enabled: true,
      defaultPolicy: 'ALLOW',
      enableVpnDetection: true,
      enableProxyDetection: true,
      highRiskCountries: ['CN', 'RU', 'KP']
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Constructor and Initialization', () => {
    it('should initialize with default configuration', () => {
      const service = new GeoRestrictionsService(mockPrisma);
      expect(service).toBeDefined();
    });

    it('should merge custom configuration with defaults', () => {
      const customConfig = {
        defaultPolicy: 'BLOCK' as const,
        cacheTtl: 600
      };
      
      const service = new GeoRestrictionsService(mockPrisma, customConfig);
      expect(service).toBeDefined();
    });

    it('should load default rules on initialization', () => {
      const rules = geoRestrictionsService.getRules();
      expect(rules).toBeInstanceOf(Array);
      expect(rules.length).toBeGreaterThan(0);
    });
  });

  describe('Access Control Logic', () => {
    it('should allow access when service is disabled', async () => {
      const disabledService = new GeoRestrictionsService(mockPrisma, { enabled: false });
      
      const result = await disabledService.checkAccess('8.8.8.8');
      
      expect(result.allowed).toBe(true);
      expect(result.reason).toContain('Service disabled');
    });

    it('should calculate risk score correctly', async () => {
      // Mock geolocation service to return high-risk data
      const mockGeoData = {
        ip: '1.2.3.4',
        country: 'China',
        countryCode: 'CN',
        region: 'Beijing',
        regionName: 'Beijing',
        city: 'Beijing',
        zip: '100000',
        lat: 39.9042,
        lon: 116.4074,
        timezone: 'Asia/Shanghai',
        isp: 'China Telecom',
        org: 'China Telecom',
        asn: 'AS4134',
        proxy: false,
        vpn: true,
        tor: false,
        hosting: false,
        accuracy: 0.8,
        lastUpdated: new Date()
      };

      // Mock the geolocation service
      vi.spyOn(require('../../src/services/geolocation.service'), 'geolocationService')
        .mockImplementation({
          getGeolocation: vi.fn().mockResolvedValue(mockGeoData)
        });

      const result = await geoRestrictionsService.checkAccess('1.2.3.4');
      
      expect(result.riskScore).toBeGreaterThan(0);
      expect(result.appliedRules).toContain('VPN_DETECTED');
      expect(result.appliedRules).toContain('HIGH_RISK_COUNTRY');
    });

    it('should block access based on rules', async () => {
      const mockGeoData = {
        ip: '1.2.3.4',
        country: 'China',
        countryCode: 'CN',
        region: 'Beijing',
        regionName: 'Beijing',
        city: 'Beijing',
        zip: '100000',
        lat: 39.9042,
        lon: 116.4074,
        timezone: 'Asia/Shanghai',
        isp: 'China Telecom',
        org: 'China Telecom',
        asn: 'AS4134',
        proxy: false,
        vpn: false,
        tor: false,
        hosting: false,
        accuracy: 0.8,
        lastUpdated: new Date()
      };

      vi.spyOn(require('../../src/services/geolocation.service'), 'geolocationService')
        .mockImplementation({
          getGeolocation: vi.fn().mockResolvedValue(mockGeoData)
        });

      const result = await geoRestrictionsService.checkAccess('1.2.3.4');
      
      expect(result.allowed).toBe(false);
      expect(result.countryCode).toBe('CN');
      expect(result.reason).toContain('High risk country');
    });

    it('should allow access from safe countries', async () => {
      const mockGeoData = {
        ip: '8.8.8.8',
        country: 'United States',
        countryCode: 'US',
        region: 'CA',
        regionName: 'California',
        city: 'Mountain View',
        zip: '94043',
        lat: 37.4056,
        lon: -122.0775,
        timezone: 'America/Los_Angeles',
        isp: 'Google LLC',
        org: 'Google LLC',
        asn: 'AS15169',
        proxy: false,
        vpn: false,
        tor: false,
        hosting: true,
        accuracy: 0.9,
        lastUpdated: new Date()
      };

      vi.spyOn(require('../../src/services/geolocation.service'), 'geolocationService')
        .mockImplementation({
          getGeolocation: vi.fn().mockResolvedValue(mockGeoData)
        });

      const result = await geoRestrictionsService.checkAccess('8.8.8.8');
      
      expect(result.allowed).toBe(true);
      expect(result.countryCode).toBe('US');
      expect(result.riskScore).toBeGreaterThanOrEqual(0);
    });

    it('should handle geolocation failures gracefully', async () => {
      vi.spyOn(require('../../src/services/geolocation.service'), 'geolocationService')
        .mockImplementation({
          getGeolocation: vi.fn().mockResolvedValue(null)
        });

      const result = await geoRestrictionsService.checkAccess('8.8.8.8');
      
      expect(result.allowed).toBe(true);
      expect(result.reason).toContain('Geolocation unavailable');
    });

    it('should respect default policy on rule evaluation failure', async () => {
      const blockByDefaultService = new GeoRestrictionsService(mockPrisma, {
        enabled: true,
        defaultPolicy: 'BLOCK'
      });

      vi.spyOn(require('../../src/services/geolocation.service'), 'geolocationService')
        .mockImplementation({
          getGeolocation: vi.fn().mockRejectedValue(new Error('Service error'))
        });

      const result = await blockByDefaultService.checkAccess('8.8.8.8');
      
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Check failed, default block');
    });
  });

  describe('Rule Management', () => {
    it('should add new rules correctly', async () => {
      const newRule = {
        name: 'Test Block Rule',
        type: 'BLOCK' as const,
        scope: 'GLOBAL' as const,
        countries: ['XX'],
        priority: 150,
        enabled: true,
        createdBy: 'test'
      };

      const ruleId = await geoRestrictionsService.addRule(newRule);
      
      expect(ruleId).toBeDefined();
      expect(ruleId).toMatch(/^rule_\d+_[a-z0-9]+$/);
      
      const rules = geoRestrictionsService.getRules();
      const addedRule = rules.find(r => r.id === ruleId);
      
      expect(addedRule).toBeDefined();
      expect(addedRule?.name).toBe(newRule.name);
      expect(addedRule?.type).toBe(newRule.type);
    });

    it('should remove rules correctly', async () => {
      const newRule = {
        name: 'Test Rule to Remove',
        type: 'ALLOW' as const,
        scope: 'GLOBAL' as const,
        countries: ['US'],
        priority: 100,
        enabled: true,
        createdBy: 'test'
      };

      const ruleId = await geoRestrictionsService.addRule(newRule);
      const removed = await geoRestrictionsService.removeRule(ruleId);
      
      expect(removed).toBe(true);
      
      const rules = geoRestrictionsService.getRules();
      const removedRule = rules.find(r => r.id === ruleId);
      
      expect(removedRule).toBeUndefined();
    });

    it('should return false when removing non-existent rule', async () => {
      const removed = await geoRestrictionsService.removeRule('non-existent-rule');
      expect(removed).toBe(false);
    });

    it('should sort rules by priority correctly', () => {
      const rules = geoRestrictionsService.getRules();
      
      // Check that rules are sorted by priority (higher first)
      for (let i = 0; i < rules.length - 1; i++) {
        expect(rules[i].priority).toBeGreaterThanOrEqual(rules[i + 1].priority);
      }
    });
  });

  describe('Risk Scoring', () => {
    it('should calculate higher risk for VPN connections', async () => {
      const vpnGeoData = {
        ip: '1.2.3.4',
        country: 'United States',
        countryCode: 'US',
        region: 'CA',
        regionName: 'California',
        city: 'San Francisco',
        zip: '94102',
        lat: 37.7749,
        lon: -122.4194,
        timezone: 'America/Los_Angeles',
        isp: 'VPN Provider',
        org: 'VPN Service',
        asn: 'AS12345',
        proxy: false,
        vpn: true,
        tor: false,
        hosting: false,
        accuracy: 0.7,
        lastUpdated: new Date()
      };

      vi.spyOn(require('../../src/services/geolocation.service'), 'geolocationService')
        .mockImplementation({
          getGeolocation: vi.fn().mockResolvedValue(vpnGeoData)
        });

      const result = await geoRestrictionsService.checkAccess('1.2.3.4');
      
      expect(result.riskScore).toBeGreaterThan(3); // VPN should add +3
      expect(result.appliedRules).toContain('VPN_DETECTED');
    });

    it('should calculate highest risk for Tor connections', async () => {
      const torGeoData = {
        ip: '1.2.3.4',
        country: 'Unknown',
        countryCode: 'XX',
        region: '',
        regionName: '',
        city: '',
        zip: '',
        lat: 0,
        lon: 0,
        timezone: '',
        isp: 'Tor Exit Node',
        org: 'Tor Network',
        asn: '',
        proxy: false,
        vpn: false,
        tor: true,
        hosting: false,
        accuracy: 0.1,
        lastUpdated: new Date()
      };

      vi.spyOn(require('../../src/services/geolocation.service'), 'geolocationService')
        .mockImplementation({
          getGeolocation: vi.fn().mockResolvedValue(torGeoData)
        });

      const result = await geoRestrictionsService.checkAccess('1.2.3.4');
      
      expect(result.riskScore).toBeGreaterThan(8); // Tor + unknown country + low accuracy
    });

    it('should consider user agent in risk scoring', async () => {
      const normalGeoData = {
        ip: '8.8.8.8',
        country: 'United States',
        countryCode: 'US',
        region: 'CA',
        regionName: 'California',
        city: 'Mountain View',
        zip: '94043',
        lat: 37.4056,
        lon: -122.0775,
        timezone: 'America/Los_Angeles',
        isp: 'Google LLC',
        org: 'Google LLC',
        asn: 'AS15169',
        proxy: false,
        vpn: false,
        tor: false,
        hosting: true,
        accuracy: 0.9,
        lastUpdated: new Date()
      };

      vi.spyOn(require('../../src/services/geolocation.service'), 'geolocationService')
        .mockImplementation({
          getGeolocation: vi.fn().mockResolvedValue(normalGeoData)
        });

      // Test with suspicious user agent
      const suspiciousResult = await geoRestrictionsService.checkAccess(
        '8.8.8.8', 
        undefined, 
        undefined, 
        'bot'
      );

      // Test with normal user agent
      const normalResult = await geoRestrictionsService.checkAccess(
        '8.8.8.8',
        undefined,
        undefined,
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      );
      
      expect(suspiciousResult.riskScore).toBeGreaterThan(normalResult.riskScore);
    });
  });

  describe('Statistics and Analytics', () => {
    it('should track access statistics correctly', async () => {
      const mockGeoData = {
        ip: '8.8.8.8',
        country: 'United States',
        countryCode: 'US',
        region: 'CA',
        regionName: 'California',
        city: 'Mountain View',
        zip: '94043',
        lat: 37.4056,
        lon: -122.0775,
        timezone: 'America/Los_Angeles',
        isp: 'Google LLC',
        org: 'Google LLC',
        asn: 'AS15169',
        proxy: false,
        vpn: false,
        tor: false,
        hosting: true,
        accuracy: 0.9,
        lastUpdated: new Date()
      };

      vi.spyOn(require('../../src/services/geolocation.service'), 'geolocationService')
        .mockImplementation({
          getGeolocation: vi.fn().mockResolvedValue(mockGeoData)
        });

      // Make several access checks
      await geoRestrictionsService.checkAccess('8.8.8.8');
      await geoRestrictionsService.checkAccess('8.8.8.8');
      await geoRestrictionsService.checkAccess('8.8.8.8');

      const stats = geoRestrictionsService.getStatistics();
      
      expect(stats.totalChecks).toBeGreaterThan(0);
      expect(stats.blockRate).toBeGreaterThanOrEqual(0);
      expect(stats.topAllowedCountries).toBeInstanceOf(Array);
      expect(stats.topBlockedCountries).toBeInstanceOf(Array);
      expect(stats.ruleEffectiveness).toBeInstanceOf(Array);
    });

    it('should clear statistics correctly', () => {
      geoRestrictionsService.clearStatistics();
      
      const stats = geoRestrictionsService.getStatistics();
      
      expect(stats.totalChecks).toBe(0);
      expect(stats.blockedRequests).toBe(0);
      expect(stats.blockRate).toBe(0);
    });

    it('should calculate block rate correctly', async () => {
      // Clear statistics first
      geoRestrictionsService.clearStatistics();

      // Mock different geo data for allow/block scenarios
      const allowGeoData = {
        ip: '8.8.8.8',
        country: 'United States',
        countryCode: 'US',
        region: 'CA',
        regionName: 'California',
        city: 'Mountain View',
        zip: '94043',
        lat: 37.4056,
        lon: -122.0775,
        timezone: 'America/Los_Angeles',
        isp: 'Google LLC',
        org: 'Google LLC',
        asn: 'AS15169',
        proxy: false,
        vpn: false,
        tor: false,
        hosting: true,
        accuracy: 0.9,
        lastUpdated: new Date()
      };

      const blockGeoData = {
        ...allowGeoData,
        country: 'China',
        countryCode: 'CN'
      };

      const geolocationMock = vi.spyOn(require('../../src/services/geolocation.service'), 'geolocationService')
        .mockImplementation({
          getGeolocation: vi.fn()
        });

      // Simulate 3 allowed and 2 blocked requests
      geolocationMock.mockImplementation({
        getGeolocation: vi.fn()
          .mockResolvedValueOnce(allowGeoData)
          .mockResolvedValueOnce(allowGeoData)
          .mockResolvedValueOnce(blockGeoData)
          .mockResolvedValueOnce(blockGeoData)
          .mockResolvedValueOnce(allowGeoData)
      });

      await geoRestrictionsService.checkAccess('8.8.8.8');
      await geoRestrictionsService.checkAccess('8.8.8.8');
      await geoRestrictionsService.checkAccess('1.2.3.4');
      await geoRestrictionsService.checkAccess('1.2.3.4');
      await geoRestrictionsService.checkAccess('8.8.8.8');

      const stats = geoRestrictionsService.getStatistics();
      
      expect(stats.totalChecks).toBe(5);
      expect(stats.blockedRequests).toBe(2);
      expect(stats.blockRate).toBe(40); // 2/5 * 100
    });
  });

  describe('Configuration Management', () => {
    it('should update configuration correctly', () => {
      const newConfig = {
        enabled: false,
        defaultPolicy: 'BLOCK' as const,
        enableVpnDetection: false
      };

      geoRestrictionsService.updateConfig(newConfig);
      
      // Since we can't directly access private config, test through behavior
      // A disabled service should always allow
      const result = geoRestrictionsService.checkAccess('1.2.3.4');
      
      expect(result).resolves.toMatchObject({
        allowed: true,
        reason: expect.stringContaining('Service disabled')
      });
    });
  });

  describe('Rule Filtering and Scoping', () => {
    it('should filter rules by scope correctly', async () => {
      // Add user-specific rule
      const userRule = {
        name: 'User Specific Rule',
        type: 'ALLOW' as const,
        scope: 'USER' as const,
        countries: ['CN'],
        userIds: ['user-123'],
        priority: 200,
        enabled: true,
        createdBy: 'test'
      };

      await geoRestrictionsService.addRule(userRule);

      const mockGeoData = {
        ip: '1.2.3.4',
        country: 'China',
        countryCode: 'CN',
        region: 'Beijing',
        regionName: 'Beijing',
        city: 'Beijing',
        zip: '100000',
        lat: 39.9042,
        lon: 116.4074,
        timezone: 'Asia/Shanghai',
        isp: 'China Telecom',
        org: 'China Telecom',
        asn: 'AS4134',
        proxy: false,
        vpn: false,
        tor: false,
        hosting: false,
        accuracy: 0.8,
        lastUpdated: new Date()
      };

      vi.spyOn(require('../../src/services/geolocation.service'), 'geolocationService')
        .mockImplementation({
          getGeolocation: vi.fn().mockResolvedValue(mockGeoData)
        });

      // Check access for the specific user (should be allowed due to user rule)
      const userResult = await geoRestrictionsService.checkAccess(
        '1.2.3.4', 
        undefined, 
        'user-123'
      );

      // Check access for different user (should be blocked by global rule)
      const otherUserResult = await geoRestrictionsService.checkAccess(
        '1.2.3.4', 
        undefined, 
        'user-456'
      );

      expect(userResult.allowed).toBe(true); // User-specific allow rule takes precedence
      expect(otherUserResult.allowed).toBe(false); // Global block rule applies
    });

    it('should filter rules by endpoint correctly', async () => {
      // Add endpoint-specific rule
      const endpointRule = {
        name: 'Admin Endpoint Block',
        type: 'BLOCK' as const,
        scope: 'ENDPOINT' as const,
        countries: ['US'], // Block US for admin endpoints
        endpoints: ['/api/admin'],
        priority: 180,
        enabled: true,
        createdBy: 'test'
      };

      await geoRestrictionsService.addRule(endpointRule);

      const mockGeoData = {
        ip: '8.8.8.8',
        country: 'United States',
        countryCode: 'US',
        region: 'CA',
        regionName: 'California',
        city: 'Mountain View',
        zip: '94043',
        lat: 37.4056,
        lon: -122.0775,
        timezone: 'America/Los_Angeles',
        isp: 'Google LLC',
        org: 'Google LLC',
        asn: 'AS15169',
        proxy: false,
        vpn: false,
        tor: false,
        hosting: true,
        accuracy: 0.9,
        lastUpdated: new Date()
      };

      vi.spyOn(require('../../src/services/geolocation.service'), 'geolocationService')
        .mockImplementation({
          getGeolocation: vi.fn().mockResolvedValue(mockGeoData)
        });

      // Check access to admin endpoint (should be blocked)
      const adminResult = await geoRestrictionsService.checkAccess(
        '8.8.8.8',
        '/api/admin/users'
      );

      // Check access to regular endpoint (should be allowed)
      const regularResult = await geoRestrictionsService.checkAccess(
        '8.8.8.8',
        '/api/users/profile'
      );

      expect(adminResult.allowed).toBe(false); // Endpoint-specific block rule applies
      expect(regularResult.allowed).toBe(true); // No endpoint rule applies
    });
  });
});