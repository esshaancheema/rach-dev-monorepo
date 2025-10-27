import { PrismaClient } from '@zoptal/database';
import { logger } from '../utils/logger';
import { geolocationService, GeolocationData } from './geolocation.service';
import { cacheManager } from '../utils/redis';
import { createAuthError } from '../middleware/error-handler';
import { ERROR_CODES } from '../constants/error-codes';

export interface GeoRestrictionRule {
  id: string;
  name: string;
  type: 'ALLOW' | 'BLOCK';
  scope: 'GLOBAL' | 'USER' | 'ENDPOINT';
  countries: string[]; // ISO country codes
  regions?: string[];
  cities?: string[];
  endpoints?: string[];
  userIds?: string[];
  priority: number;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  reason?: string;
  expiresAt?: Date;
}

export interface GeoRestrictionCheck {
  ip: string;
  allowed: boolean;
  country: string;
  countryCode: string;
  appliedRules: string[];
  reason?: string;
  bypassAvailable: boolean;
  riskScore: number;
}

export interface GeoRestrictionConfig {
  enabled: boolean;
  defaultPolicy: 'ALLOW' | 'BLOCK';
  enableUserBypass: boolean;
  enableVpnDetection: boolean;
  enableProxyDetection: boolean;
  trustedProxies: string[];
  highRiskCountries: string[];
  cacheTtl: number;
  logAllChecks: boolean;
}

export interface GeoRestrictionStats {
  totalChecks: number;
  blockedRequests: number;
  blockRate: number;
  topBlockedCountries: Array<{ country: string; count: number; }>;
  topAllowedCountries: Array<{ country: string; count: number; }>;
  ruleEffectiveness: Array<{ ruleId: string; name: string; triggered: number; }>;
}

const DEFAULT_CONFIG: GeoRestrictionConfig = {
  enabled: true,
  defaultPolicy: 'ALLOW',
  enableUserBypass: false,
  enableVpnDetection: true,
  enableProxyDetection: true,
  trustedProxies: [],
  highRiskCountries: [
    'CN', 'RU', 'KP', 'IR', 'SY', 'AF', 'IQ', 'LY', 'SO', 'SD'
  ],
  cacheTtl: 300, // 5 minutes
  logAllChecks: false
};

export class GeoRestrictionsService {
  private config: GeoRestrictionConfig;
  private rules: Map<string, GeoRestrictionRule> = new Map();
  private stats: Map<string, number> = new Map();

  constructor(
    private prisma: PrismaClient,
    config: Partial<GeoRestrictionConfig> = {}
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.loadRules();
    
    logger.info('Geo restrictions service initialized', {
      enabled: this.config.enabled,
      defaultPolicy: this.config.defaultPolicy,
      vpnDetection: this.config.enableVpnDetection
    });
  }

  /**
   * Check if access is allowed from the given IP address
   */
  async checkAccess(
    ip: string,
    endpoint?: string,
    userId?: string,
    userAgent?: string
  ): Promise<GeoRestrictionCheck> {
    // If service is disabled, allow all
    if (!this.config.enabled) {
      return this.createAllowResult(ip, 'Service disabled');
    }

    // Check cache first
    const cacheKey = `geo_check:${ip}:${endpoint || 'global'}:${userId || 'anonymous'}`;
    const cached = await this.getCachedResult(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Get geolocation data
      const geoData = await geolocationService.getGeolocation(ip);
      if (!geoData) {
        logger.warn('Failed to get geolocation data', { ip });
        return this.createAllowResult(ip, 'Geolocation unavailable');
      }

      // Perform the actual check
      const result = await this.performAccessCheck(ip, geoData, endpoint, userId, userAgent);

      // Cache the result
      await this.cacheResult(cacheKey, result);

      // Log the check
      await this.logAccessCheck(result, geoData, endpoint, userId, userAgent);

      // Update statistics
      this.updateStats(result);

      return result;
    } catch (error) {
      logger.error('Geo restriction check failed', { ip, error });
      
      // On error, use default policy
      return this.config.defaultPolicy === 'ALLOW' 
        ? this.createAllowResult(ip, 'Check failed, default allow')
        : this.createBlockResult(ip, 'Unknown', 'XX', [], 'Check failed, default block', 10);
    }
  }

  /**
   * Perform the actual access check logic
   */
  private async performAccessCheck(
    ip: string,
    geoData: GeolocationData,
    endpoint?: string,
    userId?: string,
    userAgent?: string
  ): Promise<GeoRestrictionCheck> {
    const appliedRules: string[] = [];
    let riskScore = this.calculateRiskScore(geoData, userAgent);

    // Check for VPN/Proxy if enabled
    if (this.config.enableVpnDetection && geoData.vpn) {
      riskScore += 3;
      appliedRules.push('VPN_DETECTED');
    }

    if (this.config.enableProxyDetection && geoData.proxy) {
      riskScore += 2;
      appliedRules.push('PROXY_DETECTED');
    }

    // Check high-risk countries
    if (this.config.highRiskCountries.includes(geoData.countryCode)) {
      riskScore += 4;
      appliedRules.push('HIGH_RISK_COUNTRY');
    }

    // Get applicable rules sorted by priority
    const applicableRules = this.getApplicableRules(geoData, endpoint, userId);

    // Process rules in priority order
    for (const rule of applicableRules) {
      appliedRules.push(rule.id);
      
      if (rule.type === 'BLOCK') {
        return this.createBlockResult(
          ip, 
          geoData.country, 
          geoData.countryCode, 
          appliedRules, 
          rule.reason || 'Blocked by geo restriction rule',
          riskScore
        );
      } else if (rule.type === 'ALLOW') {
        return this.createAllowResult(
          ip, 
          geoData.country, 
          geoData.countryCode, 
          appliedRules,
          riskScore
        );
      }
    }

    // No explicit rules matched, use default policy
    if (this.config.defaultPolicy === 'BLOCK') {
      return this.createBlockResult(
        ip, 
        geoData.country, 
        geoData.countryCode, 
        appliedRules, 
        'Default policy: block',
        riskScore
      );
    }

    return this.createAllowResult(
      ip, 
      geoData.country, 
      geoData.countryCode, 
      appliedRules,
      riskScore
    );
  }

  /**
   * Calculate risk score based on various factors
   */
  private calculateRiskScore(geoData: GeolocationData, userAgent?: string): number {
    let score = 0;

    // Base score from geolocation accuracy
    score += (1 - geoData.accuracy) * 2;

    // Hosting provider increases risk
    if (geoData.hosting) score += 2;

    // Tor exit node is very high risk
    if (geoData.tor) score += 8;

    // Unknown country code
    if (geoData.countryCode === 'XX') score += 3;

    // Suspicious user agent patterns
    if (userAgent) {
      if (userAgent.includes('bot') || userAgent.includes('crawler')) {
        score += 1;
      }
      if (userAgent.length < 20 || userAgent.length > 500) {
        score += 1;
      }
    }

    return Math.min(score, 10); // Cap at 10
  }

  /**
   * Get rules that apply to the current request
   */
  private getApplicableRules(
    geoData: GeolocationData,
    endpoint?: string,
    userId?: string
  ): GeoRestrictionRule[] {
    const now = new Date();
    
    return Array.from(this.rules.values())
      .filter(rule => {
        // Check if rule is enabled and not expired
        if (!rule.enabled || (rule.expiresAt && rule.expiresAt < now)) {
          return false;
        }

        // Check scope
        if (rule.scope === 'USER' && (!userId || !rule.userIds?.includes(userId))) {
          return false;
        }

        if (rule.scope === 'ENDPOINT' && (!endpoint || !rule.endpoints?.some(ep => endpoint.includes(ep)))) {
          return false;
        }

        // Check geographic criteria
        if (rule.countries.length > 0 && !rule.countries.includes(geoData.countryCode)) {
          return false;
        }

        if (rule.regions && rule.regions.length > 0 && !rule.regions.includes(geoData.region)) {
          return false;
        }

        if (rule.cities && rule.cities.length > 0 && !rule.cities.includes(geoData.city)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => b.priority - a.priority); // Higher priority first
  }

  /**
   * Create allow result
   */
  private createAllowResult(
    ip: string, 
    country: string = 'Unknown', 
    countryCode: string = 'XX',
    appliedRules: string[] = [],
    riskScore: number = 0
  ): GeoRestrictionCheck {
    return {
      ip,
      allowed: true,
      country,
      countryCode,
      appliedRules,
      bypassAvailable: false,
      riskScore
    };
  }

  /**
   * Create block result
   */
  private createBlockResult(
    ip: string,
    country: string,
    countryCode: string,
    appliedRules: string[],
    reason: string,
    riskScore: number
  ): GeoRestrictionCheck {
    return {
      ip,
      allowed: false,
      country,
      countryCode,
      appliedRules,
      reason,
      bypassAvailable: this.config.enableUserBypass,
      riskScore
    };
  }

  /**
   * Cache access check result
   */
  private async cacheResult(key: string, result: GeoRestrictionCheck): Promise<void> {
    try {
      await cacheManager.set(key, JSON.stringify(result), this.config.cacheTtl);
    } catch (error) {
      logger.warn('Failed to cache geo restriction result:', error);
    }
  }

  /**
   * Get cached access check result
   */
  private async getCachedResult(key: string): Promise<GeoRestrictionCheck | null> {
    try {
      const cached = await cacheManager.get(key);
      if (cached) {
        return JSON.parse(cached) as GeoRestrictionCheck;
      }
    } catch (error) {
      logger.warn('Failed to get cached geo restriction result:', error);
    }
    return null;
  }

  /**
   * Log access check for audit and analysis
   */
  private async logAccessCheck(
    result: GeoRestrictionCheck,
    geoData: GeolocationData,
    endpoint?: string,
    userId?: string,
    userAgent?: string
  ): Promise<void> {
    if (!this.config.logAllChecks && result.allowed) {
      return; // Only log blocks unless configured otherwise
    }

    try {
      const logData = {
        ip: result.ip,
        country: result.country,
        countryCode: result.countryCode,
        allowed: result.allowed,
        reason: result.reason,
        appliedRules: result.appliedRules,
        riskScore: result.riskScore,
        endpoint,
        userId,
        userAgent,
        geoData: {
          vpn: geoData.vpn,
          proxy: geoData.proxy,
          tor: geoData.tor,
          hosting: geoData.hosting,
          isp: geoData.isp
        },
        timestamp: new Date()
      };

      // In a real implementation, this would be stored in a dedicated audit table
      logger.info('Geo restriction check', logData);
    } catch (error) {
      logger.error('Failed to log geo restriction check:', error);
    }
  }

  /**
   * Update internal statistics
   */
  private updateStats(result: GeoRestrictionCheck): void {
    const totalKey = 'total_checks';
    const blockedKey = 'blocked_requests';
    const countryKey = `country_${result.countryCode}`;
    const statusKey = result.allowed ? 'allowed' : 'blocked';

    this.stats.set(totalKey, (this.stats.get(totalKey) || 0) + 1);
    
    if (!result.allowed) {
      this.stats.set(blockedKey, (this.stats.get(blockedKey) || 0) + 1);
    }

    this.stats.set(`${countryKey}_${statusKey}`, (this.stats.get(`${countryKey}_${statusKey}`) || 0) + 1);

    // Update rule effectiveness
    result.appliedRules.forEach(ruleId => {
      this.stats.set(`rule_${ruleId}`, (this.stats.get(`rule_${ruleId}`) || 0) + 1);
    });
  }

  /**
   * Load restriction rules from database
   */
  private async loadRules(): Promise<void> {
    try {
      // In a real implementation, this would load from database
      // For now, create some default rules
      const defaultRules: GeoRestrictionRule[] = [
        {
          id: 'block-high-risk-countries',
          name: 'Block High Risk Countries',
          type: 'BLOCK',
          scope: 'GLOBAL',
          countries: this.config.highRiskCountries,
          priority: 100,
          enabled: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'system',
          reason: 'High risk country detected'
        },
        {
          id: 'block-tor-exits',
          name: 'Block Tor Exit Nodes',
          type: 'BLOCK',
          scope: 'GLOBAL',
          countries: [], // Will be checked via geoData.tor
          priority: 200,
          enabled: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'system',
          reason: 'Tor exit node detected'
        }
      ];

      this.rules.clear();
      defaultRules.forEach(rule => {
        this.rules.set(rule.id, rule);
      });

      logger.info('Geo restriction rules loaded', { count: this.rules.size });
    } catch (error) {
      logger.error('Failed to load geo restriction rules:', error);
    }
  }

  /**
   * Add or update a restriction rule
   */
  async addRule(rule: Omit<GeoRestrictionRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newRule: GeoRestrictionRule = {
      ...rule,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.rules.set(id, newRule);
    
    // In a real implementation, this would save to database
    logger.info('Geo restriction rule added', { id, name: rule.name, type: rule.type });
    
    return id;
  }

  /**
   * Remove a restriction rule
   */
  async removeRule(ruleId: string): Promise<boolean> {
    const removed = this.rules.delete(ruleId);
    
    if (removed) {
      // In a real implementation, this would delete from database
      logger.info('Geo restriction rule removed', { ruleId });
    }
    
    return removed;
  }

  /**
   * Get all restriction rules
   */
  getRules(): GeoRestrictionRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Get restriction statistics
   */
  getStatistics(): GeoRestrictionStats {
    const totalChecks = this.stats.get('total_checks') || 0;
    const blockedRequests = this.stats.get('blocked_requests') || 0;
    
    return {
      totalChecks,
      blockedRequests,
      blockRate: totalChecks > 0 ? (blockedRequests / totalChecks) * 100 : 0,
      topBlockedCountries: this.getTopCountries('blocked'),
      topAllowedCountries: this.getTopCountries('allowed'),
      ruleEffectiveness: this.getRuleEffectiveness()
    };
  }

  /**
   * Get top countries by status
   */
  private getTopCountries(status: 'blocked' | 'allowed'): Array<{ country: string; count: number; }> {
    const countryStats: Array<{ country: string; count: number; }> = [];
    
    for (const [key, count] of this.stats.entries()) {
      if (key.startsWith('country_') && key.endsWith(`_${status}`)) {
        const countryCode = key.replace('country_', '').replace(`_${status}`, '');
        countryStats.push({ country: countryCode, count });
      }
    }
    
    return countryStats
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  /**
   * Get rule effectiveness statistics
   */
  private getRuleEffectiveness(): Array<{ ruleId: string; name: string; triggered: number; }> {
    const ruleStats: Array<{ ruleId: string; name: string; triggered: number; }> = [];
    
    for (const [key, count] of this.stats.entries()) {
      if (key.startsWith('rule_')) {
        const ruleId = key.replace('rule_', '');
        const rule = this.rules.get(ruleId);
        ruleStats.push({
          ruleId,
          name: rule?.name || 'Unknown Rule',
          triggered: count
        });
      }
    }
    
    return ruleStats.sort((a, b) => b.triggered - a.triggered);
  }

  /**
   * Clear statistics
   */
  clearStatistics(): void {
    this.stats.clear();
    logger.info('Geo restriction statistics cleared');
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<GeoRestrictionConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('Geo restriction configuration updated', newConfig);
  }
}

// Export singleton instance
export const geoRestrictionsService = new GeoRestrictionsService(
  new (require('@zoptal/database').PrismaClient)()
);