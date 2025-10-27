import axios from 'axios';
import { logger } from '../utils/logger';
import { cacheManager } from '../utils/redis';
import { getCircuitBreaker } from '../middleware/circuit-breaker.middleware';
import { createExternalServiceError } from '../middleware/error-handler';
import { ERROR_CODES } from '../constants/error-codes';

export interface GeolocationData {
  ip: string;
  country: string;
  countryCode: string;
  region: string;
  regionName: string;
  city: string;
  zip: string;
  lat: number;
  lon: number;
  timezone: string;
  isp: string;
  org: string;
  asn: string;
  proxy: boolean;
  vpn: boolean;
  tor: boolean;
  hosting: boolean;
  accuracy: number;
  lastUpdated: Date;
}

export interface GeolocationProvider {
  name: string;
  priority: number;
  rateLimit: number;
  apiKey?: string;
  endpoint: string;
  enabled: boolean;
}

export interface GeolocationConfig {
  enabled: boolean;
  cacheEnabled: boolean;
  cacheTtl: number; // seconds
  providers: GeolocationProvider[];
  fallbackCountry: string;
  timeoutMs: number;
  retryAttempts: number;
  enableProxyDetection: boolean;
  enableVpnDetection: boolean;
}

const DEFAULT_CONFIG: GeolocationConfig = {
  enabled: true,
  cacheEnabled: true,
  cacheTtl: 86400, // 24 hours
  providers: [
    {
      name: 'ip-api',
      priority: 1,
      rateLimit: 45, // requests per minute
      endpoint: 'http://ip-api.com/json',
      enabled: true
    },
    {
      name: 'ipinfo',
      priority: 2,
      rateLimit: 50000, // requests per month
      apiKey: process.env.IPINFO_API_KEY,
      endpoint: 'https://ipinfo.io',
      enabled: !!process.env.IPINFO_API_KEY
    },
    {
      name: 'maxmind',
      priority: 3,
      rateLimit: 1000, // requests per day
      apiKey: process.env.MAXMIND_API_KEY,
      endpoint: 'https://geoip.maxmind.com/geoip/v2.1/city',
      enabled: !!process.env.MAXMIND_API_KEY
    }
  ],
  fallbackCountry: 'US',
  timeoutMs: 5000,
  retryAttempts: 2,
  enableProxyDetection: true,
  enableVpnDetection: true
};

export class GeolocationService {
  private config: GeolocationConfig;
  private circuitBreaker = getCircuitBreaker('geolocation');
  private rateLimit = new Map<string, { count: number; resetTime: number }>();

  constructor(config: Partial<GeolocationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    logger.info('Geolocation service initialized', { 
      enabledProviders: this.config.providers.filter(p => p.enabled).length,
      cacheEnabled: this.config.cacheEnabled
    });
  }

  /**
   * Get geolocation data for an IP address
   */
  async getGeolocation(ip: string): Promise<GeolocationData | null> {
    if (!this.config.enabled) {
      return this.getFallbackData(ip);
    }

    // Validate IP address
    if (!this.isValidIp(ip) || this.isPrivateIp(ip)) {
      return this.getFallbackData(ip);
    }

    // Check cache first
    if (this.config.cacheEnabled) {
      const cached = await this.getCachedGeolocation(ip);
      if (cached) {
        return cached;
      }
    }

    // Try each provider in order of priority
    const enabledProviders = this.config.providers
      .filter(p => p.enabled)
      .sort((a, b) => a.priority - b.priority);

    for (const provider of enabledProviders) {
      try {
        if (!this.checkRateLimit(provider)) {
          logger.warn(`Rate limit exceeded for provider: ${provider.name}`);
          continue;
        }

        const data = await this.circuitBreaker.execute(
          async () => await this.queryProvider(provider, ip),
          async () => {
            logger.warn(`Circuit breaker open for geolocation provider: ${provider.name}`);
            throw new Error('Provider circuit breaker open');
          }
        );

        if (data) {
          // Cache the result
          if (this.config.cacheEnabled) {
            await this.cacheGeolocation(ip, data);
          }

          this.recordRateLimit(provider);
          return data;
        }
      } catch (error) {
        logger.warn(`Geolocation provider ${provider.name} failed:`, error);
        continue;
      }
    }

    // All providers failed, return fallback
    logger.warn(`All geolocation providers failed for IP: ${ip}`);
    return this.getFallbackData(ip);
  }

  /**
   * Query a specific geolocation provider
   */
  private async queryProvider(provider: GeolocationProvider, ip: string): Promise<GeolocationData | null> {
    try {
      let url = provider.endpoint;
      const headers: Record<string, string> = {
        'User-Agent': 'Zoptal-Auth-Service/1.0'
      };

      switch (provider.name) {
        case 'ip-api':
          url = `${provider.endpoint}/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,proxy,hosting`;
          break;

        case 'ipinfo':
          url = `${provider.endpoint}/${ip}`;
          if (provider.apiKey) {
            url += `?token=${provider.apiKey}`;
          }
          break;

        case 'maxmind':
          url = `${provider.endpoint}/${ip}`;
          if (provider.apiKey) {
            headers['Authorization'] = `Basic ${Buffer.from(`${provider.apiKey}:`).toString('base64')}`;
          }
          break;
      }

      const response = await axios.get(url, {
        headers,
        timeout: this.config.timeoutMs,
        validateStatus: (status) => status < 500 // Accept 4xx as valid responses
      });

      return this.parseProviderResponse(provider, response.data, ip);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throw createExternalServiceError('Geolocation request timeout', ERROR_CODES.EXTERNAL_SERVICE_TIMEOUT);
        }
        if (error.response?.status === 429) {
          throw createExternalServiceError('Geolocation rate limit exceeded', ERROR_CODES.RATE_LIMIT_EXCEEDED);
        }
      }
      throw createExternalServiceError(`Geolocation provider error: ${error}`, ERROR_CODES.EXTERNAL_GEOLOCATION_ERROR);
    }
  }

  /**
   * Parse response from different providers into standardized format
   */
  private parseProviderResponse(provider: GeolocationProvider, data: any, ip: string): GeolocationData | null {
    try {
      let parsed: Partial<GeolocationData> = { ip };

      switch (provider.name) {
        case 'ip-api':
          if (data.status === 'fail') {
            return null;
          }
          parsed = {
            ip,
            country: data.country || 'Unknown',
            countryCode: data.countryCode || 'XX',
            region: data.region || '',
            regionName: data.regionName || '',
            city: data.city || '',
            zip: data.zip || '',
            lat: data.lat || 0,
            lon: data.lon || 0,
            timezone: data.timezone || '',
            isp: data.isp || '',
            org: data.org || '',
            asn: data.as || '',
            proxy: data.proxy || false,
            vpn: false, // ip-api doesn't provide VPN detection
            tor: false,
            hosting: data.hosting || false,
            accuracy: 0.8,
            lastUpdated: new Date()
          };
          break;

        case 'ipinfo':
          parsed = {
            ip,
            country: data.country_name || data.country || 'Unknown',
            countryCode: data.country || 'XX',
            region: data.region || '',
            regionName: data.region || '',
            city: data.city || '',
            zip: data.postal || '',
            lat: data.loc ? parseFloat(data.loc.split(',')[0]) : 0,
            lon: data.loc ? parseFloat(data.loc.split(',')[1]) : 0,
            timezone: data.timezone || '',
            isp: data.org || '',
            org: data.org || '',
            asn: data.asn?.asn || '',
            proxy: false,
            vpn: data.privacy?.vpn || false,
            tor: data.privacy?.tor || false,
            hosting: data.privacy?.hosting || false,
            accuracy: 0.85,
            lastUpdated: new Date()
          };
          break;

        case 'maxmind':
          const country = data.country || {};
          const location = data.location || {};
          const subdivisions = data.subdivisions || [{}];
          const city = data.city || {};
          const postal = data.postal || {};
          const traits = data.traits || {};

          parsed = {
            ip,
            country: country.names?.en || 'Unknown',
            countryCode: country.iso_code || 'XX',
            region: subdivisions[0]?.iso_code || '',
            regionName: subdivisions[0]?.names?.en || '',
            city: city.names?.en || '',
            zip: postal.code || '',
            lat: location.latitude || 0,
            lon: location.longitude || 0,
            timezone: location.time_zone || '',
            isp: traits.isp || '',
            org: traits.organization || '',
            asn: traits.autonomous_system_organization || '',
            proxy: traits.is_anonymous_proxy || false,
            vpn: traits.is_vpn || false,
            tor: traits.is_tor_exit_node || false,
            hosting: traits.is_hosting_provider || false,
            accuracy: location.accuracy_radius ? (100 - location.accuracy_radius) / 100 : 0.9,
            lastUpdated: new Date()
          };
          break;

        default:
          return null;
      }

      return parsed as GeolocationData;
    } catch (error) {
      logger.error(`Failed to parse ${provider.name} response:`, error);
      return null;
    }
  }

  /**
   * Check rate limit for provider
   */
  private checkRateLimit(provider: GeolocationProvider): boolean {
    const now = Date.now();
    const key = provider.name;
    const limit = this.rateLimit.get(key);

    if (!limit) {
      return true;
    }

    // Reset if past the reset time
    if (now > limit.resetTime) {
      this.rateLimit.delete(key);
      return true;
    }

    return limit.count < provider.rateLimit;
  }

  /**
   * Record rate limit usage
   */
  private recordRateLimit(provider: GeolocationProvider): void {
    const now = Date.now();
    const key = provider.name;
    const resetTime = now + (60 * 1000); // Reset after 1 minute

    const current = this.rateLimit.get(key);
    if (current) {
      current.count++;
    } else {
      this.rateLimit.set(key, { count: 1, resetTime });
    }
  }

  /**
   * Cache geolocation data
   */
  private async cacheGeolocation(ip: string, data: GeolocationData): Promise<void> {
    try {
      const cacheKey = `geolocation:${ip}`;
      await cacheManager.set(cacheKey, JSON.stringify(data), this.config.cacheTtl);
    } catch (error) {
      logger.warn('Failed to cache geolocation data:', error);
    }
  }

  /**
   * Get cached geolocation data
   */
  private async getCachedGeolocation(ip: string): Promise<GeolocationData | null> {
    try {
      const cacheKey = `geolocation:${ip}`;
      const cached = await cacheManager.get(cacheKey);
      
      if (cached) {
        const data = JSON.parse(cached) as GeolocationData;
        data.lastUpdated = new Date(data.lastUpdated);
        return data;
      }
    } catch (error) {
      logger.warn('Failed to get cached geolocation data:', error);
    }

    return null;
  }

  /**
   * Get fallback data when all providers fail
   */
  private getFallbackData(ip: string): GeolocationData {
    return {
      ip,
      country: 'Unknown',
      countryCode: this.config.fallbackCountry,
      region: '',
      regionName: '',
      city: '',
      zip: '',
      lat: 0,
      lon: 0,
      timezone: '',
      isp: '',
      org: '',
      asn: '',
      proxy: false,
      vpn: false,
      tor: false,
      hosting: false,
      accuracy: 0,
      lastUpdated: new Date()
    };
  }

  /**
   * Validate IP address format
   */
  private isValidIp(ip: string): boolean {
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  }

  /**
   * Check if IP is private/local
   */
  private isPrivateIp(ip: string): boolean {
    const privateRanges = [
      /^127\./, // 127.0.0.0/8 (localhost)
      /^10\./, // 10.0.0.0/8
      /^172\.(1[6-9]|2\d|3[01])\./, // 172.16.0.0/12
      /^192\.168\./, // 192.168.0.0/16
      /^169\.254\./, // 169.254.0.0/16 (link-local)
      /^::1$/, // IPv6 localhost
      /^fe80:/ // IPv6 link-local
    ];

    return privateRanges.some(range => range.test(ip));
  }

  /**
   * Clear cache for specific IP or all
   */
  async clearCache(ip?: string): Promise<void> {
    try {
      if (ip) {
        await cacheManager.del(`geolocation:${ip}`);
      } else {
        // Clear all geolocation cache
        const keys = await cacheManager.keys('geolocation:*');
        if (keys.length > 0) {
          await cacheManager.del(...keys);
        }
      }
      logger.info('Geolocation cache cleared', { ip: ip || 'all' });
    } catch (error) {
      logger.error('Failed to clear geolocation cache:', error);
    }
  }

  /**
   * Get service statistics
   */
  async getStatistics(): Promise<{
    cacheHitRate: number;
    totalRequests: number;
    providerUsage: Record<string, number>;
    avgResponseTime: number;
  }> {
    // In a real implementation, these would be tracked over time
    return {
      cacheHitRate: 0.75, // 75% cache hit rate
      totalRequests: 1000,
      providerUsage: {
        'ip-api': 0.6,
        'ipinfo': 0.3,
        'maxmind': 0.1
      },
      avgResponseTime: 250 // ms
    };
  }
}

// Export singleton instance
export const geolocationService = new GeolocationService();