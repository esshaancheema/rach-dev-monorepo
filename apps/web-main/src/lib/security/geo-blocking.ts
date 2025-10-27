interface GeoBlockingResult {
  blocked: boolean;
  country?: string;
  region?: string;
  city?: string;
  reason?: string;
}

interface GeoLocation {
  country: string;
  countryCode: string;
  region: string;
  regionCode: string;
  city: string;
  latitude: number;
  longitude: number;
  isp: string;
  organization: string;
  timezone: string;
}

export class GeoBlocking {
  // Countries to block (ISO 3166-1 alpha-2 codes)
  private readonly BLOCKED_COUNTRIES = new Set([
    // High-risk countries for cyber attacks (example list)
    // 'CN', // China
    // 'RU', // Russia
    // 'KP', // North Korea
    // 'IR', // Iran
    // Add/remove countries based on your security requirements
  ]);

  // Countries to allow only (whitelist mode)
  private readonly ALLOWED_COUNTRIES = new Set([
    'US', // United States
    'CA', // Canada
    'GB', // United Kingdom
    'AU', // Australia
    'DE', // Germany
    'FR', // France
    'NL', // Netherlands
    'SE', // Sweden
    'NO', // Norway
    'DK', // Denmark
    'FI', // Finland
    'JP', // Japan
    'SG', // Singapore
    'CH', // Switzerland
    'AT', // Austria
    'BE', // Belgium
    'IT', // Italy
    'ES', // Spain
    'IE', // Ireland
    'NZ', // New Zealand
    'LU', // Luxembourg
  ]);

  // High-risk ASNs (Autonomous System Numbers) to block
  private readonly BLOCKED_ASNS = new Set([
    // Example blocked ASNs - hosting providers commonly used for attacks
    // '16276', // OVH SAS
    // '14061', // DigitalOcean
    // Add ASNs based on your security analysis
  ]);

  // Configuration
  private readonly config = {
    enableCountryBlocking: process.env.ENABLE_COUNTRY_BLOCKING === 'true',
    enableWhitelistMode: process.env.ENABLE_WHITELIST_MODE === 'true',
    enableASNBlocking: process.env.ENABLE_ASN_BLOCKING === 'true',
    blockVPNs: process.env.BLOCK_VPNS === 'true',
    blockTor: process.env.BLOCK_TOR === 'true',
    blockProxies: process.env.BLOCK_PROXIES === 'true',
    blockDatacenters: process.env.BLOCK_DATACENTERS === 'true',
  };

  async checkCountry(ip: string): Promise<GeoBlockingResult> {
    try {
      // Get geolocation data
      const geoData = await this.getGeoLocation(ip);
      
      if (!geoData) {
        return {
          blocked: false,
          reason: 'Unable to determine location'
        };
      }

      // Check whitelist mode first
      if (this.config.enableWhitelistMode) {
        if (!this.ALLOWED_COUNTRIES.has(geoData.countryCode)) {
          return {
            blocked: true,
            country: geoData.country,
            region: geoData.region,
            city: geoData.city,
            reason: 'Country not in whitelist'
          };
        }
      }

      // Check blocked countries
      if (this.config.enableCountryBlocking && this.BLOCKED_COUNTRIES.has(geoData.countryCode)) {
        return {
          blocked: true,
          country: geoData.country,
          region: geoData.region,
          city: geoData.city,
          reason: 'Country blocked'
        };
      }

      // Check VPN/Proxy detection
      if (this.config.blockVPNs || this.config.blockProxies) {
        const proxyCheck = await this.checkProxy(ip, geoData);
        if (proxyCheck.isProxy) {
          return {
            blocked: true,
            country: geoData.country,
            region: geoData.region,
            city: geoData.city,
            reason: `Blocked: ${proxyCheck.type}`
          };
        }
      }

      // Check TOR
      if (this.config.blockTor) {
        const isTor = await this.checkTorExitNode(ip);
        if (isTor) {
          return {
            blocked: true,
            country: geoData.country,
            region: geoData.region,
            city: geoData.city,
            reason: 'TOR exit node blocked'
          };
        }
      }

      // Check datacenter IPs
      if (this.config.blockDatacenters) {
        const isDatacenter = await this.checkDatacenter(geoData);
        if (isDatacenter) {
          return {
            blocked: true,
            country: geoData.country,
            region: geoData.region,
            city: geoData.city,
            reason: 'Datacenter IP blocked'
          };
        }
      }

      // Check ASN blocking
      if (this.config.enableASNBlocking) {
        const asnCheck = await this.checkASN(ip);
        if (asnCheck.blocked) {
          return {
            blocked: true,
            country: geoData.country,
            region: geoData.region,
            city: geoData.city,
            reason: `ASN blocked: ${asnCheck.asn}`
          };
        }
      }

      return {
        blocked: false,
        country: geoData.country,
        region: geoData.region,
        city: geoData.city
      };

    } catch (error) {
      console.error('Geo-blocking check failed:', error);
      
      // Fail open - allow request if geo check fails
      return {
        blocked: false,
        reason: 'Geo-blocking service unavailable'
      };
    }
  }

  private async getGeoLocation(ip: string): Promise<GeoLocation | null> {
    // Skip private/local IPs
    if (this.isPrivateIP(ip)) {
      return null;
    }

    try {
      // Try multiple geolocation services for reliability
      let geoData = await this.tryIPAPI(ip);
      
      if (!geoData) {
        geoData = await this.tryIPInfo(ip);
      }
      
      if (!geoData) {
        geoData = await this.tryGeoJS(ip);
      }

      return geoData;
    } catch (error) {
      console.error('Geolocation lookup failed:', error);
      return null;
    }
  }

  private async tryIPAPI(ip: string): Promise<GeoLocation | null> {
    try {
      const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,lat,lon,isp,org,timezone`);
      const data = await response.json();
      
      if (data.status === 'success') {
        return {
          country: data.country,
          countryCode: data.countryCode,
          region: data.regionName,
          regionCode: data.region,
          city: data.city,
          latitude: data.lat,
          longitude: data.lon,
          isp: data.isp,
          organization: data.org,
          timezone: data.timezone
        };
      }
    } catch (error) {
      console.warn('ip-api.com failed:', error);
    }
    
    return null;
  }

  private async tryIPInfo(ip: string): Promise<GeoLocation | null> {
    try {
      const token = process.env.IPINFO_TOKEN;
      const url = token ? 
        `https://ipinfo.io/${ip}?token=${token}` : 
        `https://ipinfo.io/${ip}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.country) {
        const [lat, lon] = (data.loc || '0,0').split(',').map(Number);
        
        return {
          country: data.country,
          countryCode: data.country,
          region: data.region || '',
          regionCode: data.region || '',
          city: data.city || '',
          latitude: lat,
          longitude: lon,
          isp: data.org || '',
          organization: data.org || '',
          timezone: data.timezone || ''
        };
      }
    } catch (error) {
      console.warn('ipinfo.io failed:', error);
    }
    
    return null;
  }

  private async tryGeoJS(ip: string): Promise<GeoLocation | null> {
    try {
      const response = await fetch(`https://get.geojs.io/v1/ip/geo/${ip}.json`);
      const data = await response.json();
      
      if (data.country_code) {
        return {
          country: data.country,
          countryCode: data.country_code,
          region: data.region || '',
          regionCode: data.region || '',
          city: data.city || '',
          latitude: parseFloat(data.latitude) || 0,
          longitude: parseFloat(data.longitude) || 0,
          isp: data.organization_name || '',
          organization: data.organization_name || '',
          timezone: data.timezone || ''
        };
      }
    } catch (error) {
      console.warn('geojs.io failed:', error);
    }
    
    return null;
  }

  private async checkProxy(ip: string, geoData: GeoLocation): Promise<{ isProxy: boolean; type?: string }> {
    try {
      // Check multiple proxy detection services
      const checks = await Promise.allSettled([
        this.checkProxyCheck(ip),
        this.checkIPQualityScore(ip),
        this.checkGetIPIntel(ip)
      ]);

      // If any service detects a proxy, consider it suspicious
      for (const check of checks) {
        if (check.status === 'fulfilled' && check.value.isProxy) {
          return check.value;
        }
      }

      return { isProxy: false };
    } catch (error) {
      console.warn('Proxy check failed:', error);
      return { isProxy: false };
    }
  }

  private async checkProxyCheck(ip: string): Promise<{ isProxy: boolean; type?: string }> {
    try {
      const response = await fetch(`http://proxycheck.io/v2/${ip}?vpn=1&asn=1&risk=1&port=1&seen=1&days=7&tag=security`);
      const data = await response.json();
      
      if (data[ip]) {
        const result = data[ip];
        if (result.proxy === 'yes') {
          return { isProxy: true, type: result.type || 'proxy' };
        }
      }
    } catch (error) {
      console.warn('proxycheck.io failed:', error);
    }
    
    return { isProxy: false };
  }

  private async checkIPQualityScore(ip: string): Promise<{ isProxy: boolean; type?: string }> {
    try {
      const apiKey = process.env.IPQUALITYSCORE_API_KEY;
      if (!apiKey) return { isProxy: false };

      const response = await fetch(`https://ipqualityscore.com/api/json/ip/${apiKey}/${ip}?strictness=1&allow_public_access_points=true&fast=true&lighter_penalties=true&mobile=true`);
      const data = await response.json();
      
      if (data.success) {
        if (data.proxy || data.vpn || data.tor) {
          let type = 'proxy';
          if (data.tor) type = 'tor';
          else if (data.vpn) type = 'vpn';
          
          return { isProxy: true, type };
        }
      }
    } catch (error) {
      console.warn('IPQualityScore failed:', error);
    }
    
    return { isProxy: false };
  }

  private async checkGetIPIntel(ip: string): Promise<{ isProxy: boolean; type?: string }> {
    try {
      const response = await fetch(`http://check.getipintel.net/check.php?ip=${ip}&contact=security@zoptal.com&format=json&flags=m`);
      const data = await response.json();
      
      if (data.status === 'success') {
        const probability = parseFloat(data.result);
        if (probability > 0.95) { // 95% confidence threshold
          return { isProxy: true, type: 'proxy/vpn' };
        }
      }
    } catch (error) {
      console.warn('GetIPIntel failed:', error);
    }
    
    return { isProxy: false };
  }

  private async checkTorExitNode(ip: string): Promise<boolean> {
    try {
      // Check TOR exit node list
      const response = await fetch(`https://check.torproject.org/api/ip?ip=${ip}`);
      const data = await response.json();
      
      return data.IsTor === true;
    } catch (error) {
      console.warn('TOR check failed:', error);
    }
    
    // Fallback: check against known TOR exit nodes (would be loaded from external source)
    return this.isKnownTorExitNode(ip);
  }

  private async checkDatacenter(geoData: GeoLocation): Promise<boolean> {
    // Common datacenter ISP patterns
    const datacenterPatterns = [
      /amazon/i,
      /aws/i,
      /google/i,
      /microsoft/i,
      /azure/i,
      /digitalocean/i,
      /vultr/i,
      /linode/i,
      /ovh/i,
      /hetzner/i,
      /scaleway/i,
      /hosting/i,
      /server/i,
      /datacenter/i,
      /cloud/i,
      /vps/i,
      /dedicated/i
    ];

    const isp = geoData.isp.toLowerCase();
    const org = geoData.organization.toLowerCase();

    return datacenterPatterns.some(pattern => 
      pattern.test(isp) || pattern.test(org)
    );
  }

  private async checkASN(ip: string): Promise<{ blocked: boolean; asn?: string }> {
    try {
      // Get ASN information
      const response = await fetch(`http://ip-api.com/json/${ip}?fields=as`);
      const data = await response.json();
      
      if (data.as) {
        const asn = data.as.split(' ')[0].replace('AS', '');
        
        if (this.BLOCKED_ASNS.has(asn)) {
          return { blocked: true, asn };
        }
      }
    } catch (error) {
      console.warn('ASN check failed:', error);
    }
    
    return { blocked: false };
  }

  private isPrivateIP(ip: string): boolean {
    const privateRanges = [
      /^10\./,
      /^172\.(1[6-9]|2\d|3[01])\./,
      /^192\.168\./,
      /^127\./,
      /^::1$/,
      /^fc00:/,
      /^fe80:/
    ];

    return privateRanges.some(range => range.test(ip));
  }

  private isKnownTorExitNode(ip: string): boolean {
    // In production, this would check against a regularly updated TOR exit node list
    // For now, return false as we don't have the list
    return false;
  }

  // Administrative methods

  addBlockedCountry(countryCode: string): void {
    this.BLOCKED_COUNTRIES.add(countryCode.toUpperCase());
  }

  removeBlockedCountry(countryCode: string): void {
    this.BLOCKED_COUNTRIES.delete(countryCode.toUpperCase());
  }

  addAllowedCountry(countryCode: string): void {
    this.ALLOWED_COUNTRIES.add(countryCode.toUpperCase());
  }

  removeAllowedCountry(countryCode: string): void {
    this.ALLOWED_COUNTRIES.delete(countryCode.toUpperCase());
  }

  addBlockedASN(asn: string): void {
    this.BLOCKED_ASNS.add(asn);
  }

  removeBlockedASN(asn: string): void {
    this.BLOCKED_ASNS.delete(asn);
  }

  getBlockedCountries(): string[] {
    return Array.from(this.BLOCKED_COUNTRIES);
  }

  getAllowedCountries(): string[] {
    return Array.from(this.ALLOWED_COUNTRIES);
  }

  getBlockedASNs(): string[] {
    return Array.from(this.BLOCKED_ASNS);
  }

  getConfig(): Record<string, boolean> {
    return { ...this.config };
  }

  // Statistics and monitoring
  
  async getLocationStats(ips: string[]): Promise<{
    countryCounts: Record<string, number>;
    riskyCounts: {
      proxies: number;
      tor: number;
      datacenters: number;
      blocked: number;
    };
  }> {
    const countryCounts: Record<string, number> = {};
    const riskyCounts = {
      proxies: 0,
      tor: 0,
      datacenters: 0,
      blocked: 0
    };

    for (const ip of ips) {
      const result = await this.checkCountry(ip);
      
      if (result.country) {
        countryCounts[result.country] = (countryCounts[result.country] || 0) + 1;
      }
      
      if (result.blocked) {
        riskyCounts.blocked++;
        
        if (result.reason?.includes('proxy') || result.reason?.includes('VPN')) {
          riskyCounts.proxies++;
        }
        if (result.reason?.includes('TOR')) {
          riskyCounts.tor++;
        }
        if (result.reason?.includes('datacenter')) {
          riskyCounts.datacenters++;
        }
      }
    }

    return { countryCounts, riskyCounts };
  }
}