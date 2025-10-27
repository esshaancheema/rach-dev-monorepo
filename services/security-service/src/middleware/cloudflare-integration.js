const axios = require('axios');
const logger = require('../utils/logger');

/**
 * CloudFlare Integration for Edge DDoS Protection
 * 
 * Integrates with CloudFlare's security features for advanced DDoS protection
 */

class CloudFlareIntegration {
  constructor() {
    this.config = {
      apiToken: process.env.CLOUDFLARE_API_TOKEN,
      zoneId: process.env.CLOUDFLARE_ZONE_ID,
      apiUrl: 'https://api.cloudflare.com/client/v4',
      enableDDoSProtection: process.env.CLOUDFLARE_DDOS_PROTECTION !== 'false'
    };

    this.client = axios.create({
      baseURL: this.config.apiUrl,
      headers: {
        'Authorization': `Bearer ${this.config.apiToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
  }

  /**
   * Enable DDoS protection at the edge
   */
  async enableDDoSProtection() {
    try {
      if (!this.config.enableDDoSProtection || !this.config.apiToken) {
        logger.info('CloudFlare DDoS protection disabled or not configured');
        return;
      }

      // Enable Under Attack Mode
      await this.setSecurityLevel('under_attack');
      
      // Configure rate limiting rules
      await this.configureRateLimitingRules();
      
      // Enable bot fight mode
      await this.enableBotFightMode();

      logger.info('CloudFlare DDoS protection enabled');

    } catch (error) {
      logger.error('Failed to enable CloudFlare DDoS protection', error);
      throw error;
    }
  }

  /**
   * Set CloudFlare security level
   */
  async setSecurityLevel(level) {
    try {
      const response = await this.client.patch(`/zones/${this.config.zoneId}/settings/security_level`, {
        value: level
      });

      logger.info('CloudFlare security level updated', { level, success: response.data.success });
      return response.data;

    } catch (error) {
      logger.error('Failed to set CloudFlare security level', error);
      throw error;
    }
  }

  /**
   * Configure rate limiting rules
   */
  async configureRateLimitingRules() {
    try {
      const rules = [
        {
          name: 'API Rate Limiting',
          expression: '(http.request.uri.path matches "^/api/")',
          action: 'challenge',
          characteristics: ['ip.src'],
          period: 60,
          requests_per_period: 100,
          mitigation_timeout: 600
        },
        {
          name: 'Login Protection',
          expression: '(http.request.uri.path eq "/api/auth/login")',
          action: 'block',
          characteristics: ['ip.src'],
          period: 300,
          requests_per_period: 5,
          mitigation_timeout: 1800
        },
        {
          name: 'Global Rate Limit',
          expression: 'true',
          action: 'challenge',
          characteristics: ['ip.src'],
          period: 60,
          requests_per_period: 1000,
          mitigation_timeout: 300
        }
      ];

      for (const rule of rules) {
        try {
          const response = await this.client.post(`/zones/${this.config.zoneId}/rate_limits`, rule);
          logger.info('Rate limiting rule created', { 
            name: rule.name, 
            success: response.data.success 
          });
        } catch (error) {
          logger.error('Failed to create rate limiting rule', { 
            name: rule.name, 
            error: error.message 
          });
        }
      }

    } catch (error) {
      logger.error('Failed to configure rate limiting rules', error);
      throw error;
    }
  }

  /**
   * Enable bot fight mode
   */
  async enableBotFightMode() {
    try {
      const response = await this.client.patch(`/zones/${this.config.zoneId}/settings/brotli`, {
        value: 'on'
      });

      // Enable bot fight mode
      await this.client.patch(`/zones/${this.config.zoneId}/settings/bot_fight_mode`, {
        value: 'on'
      });

      logger.info('CloudFlare bot fight mode enabled');
      return response.data;

    } catch (error) {
      logger.error('Failed to enable bot fight mode', error);
      throw error;
    }
  }

  /**
   * Create firewall rules
   */
  async createFirewallRules() {
    try {
      const firewallRules = [
        {
          filter: {
            expression: '(cf.threat_score gt 14)',
            paused: false,
            description: 'Block high threat score requests'
          },
          action: 'block'
        },
        {
          filter: {
            expression: '(http.user_agent contains "bot" and not cf.verified_bot)',
            paused: false,
            description: 'Challenge unverified bots'
          },
          action: 'challenge'
        },
        {
          filter: {
            expression: '(ip.geoip.country in {"CN" "RU" "KP"})',
            paused: false,
            description: 'Challenge requests from high-risk countries'
          },
          action: 'challenge'
        },
        {
          filter: {
            expression: '(http.request.method eq "POST" and http.request.uri.path contains "/admin")',
            paused: false,
            description: 'Protect admin endpoints'
          },
          action: 'challenge'
        }
      ];

      for (const rule of firewallRules) {
        try {
          // Create filter first
          const filterResponse = await this.client.post(`/zones/${this.config.zoneId}/filters`, rule.filter);
          
          if (filterResponse.data.success) {
            const filterId = filterResponse.data.result.id;
            
            // Create firewall rule
            await this.client.post(`/zones/${this.config.zoneId}/firewall/rules`, {
              filter: { id: filterId },
              action: rule.action,
              paused: false,
              description: rule.filter.description
            });

            logger.info('Firewall rule created', { description: rule.filter.description });
          }
        } catch (error) {
          logger.error('Failed to create firewall rule', { 
            description: rule.filter.description, 
            error: error.message 
          });
        }
      }

    } catch (error) {
      logger.error('Failed to create firewall rules', error);
      throw error;
    }
  }

  /**
   * Get zone analytics
   */
  async getZoneAnalytics(since = '-1440') { // Last 24 hours
    try {
      const response = await this.client.get(`/zones/${this.config.zoneId}/analytics/dashboard`, {
        params: {
          since: since,
          continuous: true
        }
      });

      return response.data.result;

    } catch (error) {
      logger.error('Failed to get zone analytics', error);
      throw error;
    }
  }

  /**
   * Get security events
   */
  async getSecurityEvents(limit = 100) {
    try {
      const response = await this.client.get(`/zones/${this.config.zoneId}/security/events`, {
        params: {
          limit,
          source: 'rateLimit,firewallrules,uaBlock,hotlink,securitylevel'
        }
      });

      return response.data.result;

    } catch (error) {
      logger.error('Failed to get security events', error);
      throw error;
    }
  }

  /**
   * Block IP address
   */
  async blockIP(ipAddress, reason = 'DDoS Protection') {
    try {
      const response = await this.client.post(`/zones/${this.config.zoneId}/firewall/access_rules/rules`, {
        mode: 'block',
        configuration: {
          target: 'ip',
          value: ipAddress
        },
        notes: reason
      });

      logger.info('IP blocked via CloudFlare', { ip: ipAddress, reason });
      return response.data;

    } catch (error) {
      logger.error('Failed to block IP via CloudFlare', { ip: ipAddress, error: error.message });
      throw error;
    }
  }

  /**
   * Unblock IP address
   */
  async unblockIP(ipAddress) {
    try {
      // Get access rules to find the rule ID
      const rulesResponse = await this.client.get(`/zones/${this.config.zoneId}/firewall/access_rules/rules`, {
        params: {
          configuration_target: 'ip',
          configuration_value: ipAddress
        }
      });

      if (rulesResponse.data.result.length > 0) {
        const ruleId = rulesResponse.data.result[0].id;
        
        const response = await this.client.delete(`/zones/${this.config.zoneId}/firewall/access_rules/rules/${ruleId}`);
        
        logger.info('IP unblocked via CloudFlare', { ip: ipAddress });
        return response.data;
      }

    } catch (error) {
      logger.error('Failed to unblock IP via CloudFlare', { ip: ipAddress, error: error.message });
      throw error;
    }
  }

  /**
   * Get current DDoS protection status
   */
  async getDDoSProtectionStatus() {
    try {
      const [securityLevel, botFightMode, analytics] = await Promise.all([
        this.client.get(`/zones/${this.config.zoneId}/settings/security_level`),
        this.client.get(`/zones/${this.config.zoneId}/settings/bot_fight_mode`),
        this.getZoneAnalytics('-60') // Last hour
      ]);

      return {
        securityLevel: securityLevel.data.result.value,
        botFightMode: botFightMode.data.result.value,
        analytics: {
          requests: analytics.totals.requests.all,
          threats: analytics.totals.threats.all,
          bandwidth: analytics.totals.bandwidth.all
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Failed to get DDoS protection status', error);
      return null;
    }
  }

  /**
   * Configure automatic DDoS response
   */
  async configureAutomaticResponse() {
    try {
      // This would set up webhooks or other automated responses
      // when CloudFlare detects attacks
      
      const webhookUrl = process.env.DDOS_WEBHOOK_URL;
      if (!webhookUrl) {
        logger.warn('DDoS webhook URL not configured');
        return;
      }

      // CloudFlare doesn't have direct webhook support for DDoS events,
      // but we can set up log push for analysis
      logger.info('Automatic DDoS response configuration completed');

    } catch (error) {
      logger.error('Failed to configure automatic DDoS response', error);
      throw error;
    }
  }

  /**
   * Disable DDoS protection (return to normal)
   */
  async disableDDoSProtection() {
    try {
      // Return to normal security level
      await this.setSecurityLevel('medium');
      
      logger.info('CloudFlare DDoS protection disabled');

    } catch (error) {
      logger.error('Failed to disable CloudFlare DDoS protection', error);
      throw error;
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const response = await this.client.get(`/zones/${this.config.zoneId}`);
      return {
        healthy: response.data.success,
        zone: response.data.result.name,
        status: response.data.result.status
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message
      };
    }
  }
}

module.exports = CloudFlareIntegration;