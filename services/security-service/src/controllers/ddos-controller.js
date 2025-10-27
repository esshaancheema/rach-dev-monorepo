const DDoSProtection = require('../middleware/ddos-protection');
const CloudFlareIntegration = require('../middleware/cloudflare-integration');
const logger = require('../utils/logger');

/**
 * DDoS Protection Management Controller
 * 
 * Provides API endpoints for managing DDoS protection settings
 */

class DDoSController {
  constructor() {
    this.ddosProtection = new DDoSProtection();
    this.cloudflare = new CloudFlareIntegration();
  }

  /**
   * Get DDoS protection statistics
   */
  async getStatistics(req, res) {
    try {
      const [localStats, cloudflareStatus] = await Promise.all([
        this.ddosProtection.getStatistics(),
        this.cloudflare.getDDoSProtectionStatus()
      ]);

      const statistics = {
        local: localStats,
        cloudflare: cloudflareStatus,
        combined: {
          totalBlockedIPs: localStats?.blockedIPs || 0,
          activeProtection: cloudflareStatus?.securityLevel === 'under_attack',
          lastUpdated: new Date().toISOString()
        }
      };

      res.json({
        success: true,
        data: statistics
      });

    } catch (error) {
      logger.error('Error getting DDoS statistics', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve DDoS statistics'
      });
    }
  }

  /**
   * Get recent security events
   */
  async getSecurityEvents(req, res) {
    try {
      const { limit = 100, timeframe = '1h' } = req.query;

      const [cloudflareEvents, localViolations] = await Promise.all([
        this.cloudflare.getSecurityEvents(limit),
        this.getLocalSecurityEvents(timeframe)
      ]);

      const events = {
        cloudflare: cloudflareEvents || [],
        local: localViolations || [],
        summary: {
          totalEvents: (cloudflareEvents?.length || 0) + (localViolations?.length || 0),
          timeframe,
          generatedAt: new Date().toISOString()
        }
      };

      res.json({
        success: true,
        data: events
      });

    } catch (error) {
      logger.error('Error getting security events', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve security events'
      });
    }
  }

  /**
   * Manual IP blocking
   */
  async blockIP(req, res) {
    try {
      const { ip, reason = 'Manual block', duration = 3600, level = 'local' } = req.body;

      if (!ip) {
        return res.status(400).json({
          success: false,
          error: 'IP address is required'
        });
      }

      // Validate IP address format
      if (!this.isValidIP(ip)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid IP address format'
        });
      }

      const results = {};

      // Block locally
      if (level === 'local' || level === 'both') {
        await this.ddosProtection.manualBlock(ip, reason, duration);
        results.local = { blocked: true, duration };
      }

      // Block via CloudFlare
      if (level === 'cloudflare' || level === 'both') {
        try {
          await this.cloudflare.blockIP(ip, reason);
          results.cloudflare = { blocked: true };
        } catch (error) {
          results.cloudflare = { blocked: false, error: error.message };
        }
      }

      logger.info('IP manually blocked', { ip, reason, level, results });

      res.json({
        success: true,
        message: `IP ${ip} blocked successfully`,
        data: results
      });

    } catch (error) {
      logger.error('Error blocking IP', error);
      res.status(500).json({
        success: false,
        error: 'Failed to block IP address'
      });
    }
  }

  /**
   * Manual IP unblocking
   */
  async unblockIP(req, res) {
    try {
      const { ip, level = 'local' } = req.body;

      if (!ip) {
        return res.status(400).json({
          success: false,
          error: 'IP address is required'
        });
      }

      const results = {};

      // Unblock locally
      if (level === 'local' || level === 'both') {
        await this.ddosProtection.unblockIP(ip);
        results.local = { unblocked: true };
      }

      // Unblock via CloudFlare
      if (level === 'cloudflare' || level === 'both') {
        try {
          await this.cloudflare.unblockIP(ip);
          results.cloudflare = { unblocked: true };
        } catch (error) {
          results.cloudflare = { unblocked: false, error: error.message };
        }
      }

      logger.info('IP manually unblocked', { ip, level, results });

      res.json({
        success: true,
        message: `IP ${ip} unblocked successfully`,
        data: results
      });

    } catch (error) {
      logger.error('Error unblocking IP', error);
      res.status(500).json({
        success: false,
        error: 'Failed to unblock IP address'
      });
    }
  }

  /**
   * Add IP to whitelist
   */
  async addToWhitelist(req, res) {
    try {
      const { ip, reason = 'Manual whitelist' } = req.body;

      if (!ip || !this.isValidIP(ip)) {
        return res.status(400).json({
          success: false,
          error: 'Valid IP address is required'
        });
      }

      await this.ddosProtection.addToWhitelist(ip);

      logger.info('IP added to whitelist', { ip, reason });

      res.json({
        success: true,
        message: `IP ${ip} added to whitelist`
      });

    } catch (error) {
      logger.error('Error adding IP to whitelist', error);
      res.status(500).json({
        success: false,
        error: 'Failed to add IP to whitelist'
      });
    }
  }

  /**
   * Remove IP from whitelist
   */
  async removeFromWhitelist(req, res) {
    try {
      const { ip } = req.body;

      if (!ip) {
        return res.status(400).json({
          success: false,
          error: 'IP address is required'
        });
      }

      await this.ddosProtection.removeFromWhitelist(ip);

      logger.info('IP removed from whitelist', { ip });

      res.json({
        success: true,
        message: `IP ${ip} removed from whitelist`
      });

    } catch (error) {
      logger.error('Error removing IP from whitelist', error);
      res.status(500).json({
        success: false,
        error: 'Failed to remove IP from whitelist'
      });
    }
  }

  /**
   * Update DDoS protection settings
   */
  async updateSettings(req, res) {
    try {
      const { rateLimits, ddosThresholds, blockDuration, securityLevel } = req.body;

      // Update local settings
      if (rateLimits) {
        this.ddosProtection.config.rateLimits = { ...this.ddosProtection.config.rateLimits, ...rateLimits };
      }

      if (ddosThresholds) {
        this.ddosProtection.config.ddosThresholds = { ...this.ddosProtection.config.ddosThresholds, ...ddosThresholds };
      }

      if (blockDuration) {
        this.ddosProtection.config.blockDuration = { ...this.ddosProtection.config.blockDuration, ...blockDuration };
      }

      // Update CloudFlare security level
      if (securityLevel) {
        await this.cloudflare.setSecurityLevel(securityLevel);
      }

      logger.info('DDoS protection settings updated', { rateLimits, ddosThresholds, blockDuration, securityLevel });

      res.json({
        success: true,
        message: 'DDoS protection settings updated successfully'
      });

    } catch (error) {
      logger.error('Error updating DDoS settings', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update DDoS protection settings'
      });
    }
  }

  /**
   * Enable emergency DDoS protection
   */
  async enableEmergencyProtection(req, res) {
    try {
      const { reason = 'Emergency activation' } = req.body;

      // Enable maximum protection locally
      this.ddosProtection.config.rateLimits.global.maxRequests = 100;
      this.ddosProtection.config.rateLimits.perIP.maxRequests = 10;
      this.ddosProtection.config.ddosThresholds.requestsPerSecond = 10;

      // Enable CloudFlare Under Attack Mode
      await this.cloudflare.enableDDoSProtection();

      logger.warn('Emergency DDoS protection enabled', { reason });

      res.json({
        success: true,
        message: 'Emergency DDoS protection enabled',
        settings: {
          localProtection: 'maximum',
          cloudflareProtection: 'under_attack',
          activatedAt: new Date().toISOString(),
          reason
        }
      });

    } catch (error) {
      logger.error('Error enabling emergency protection', error);
      res.status(500).json({
        success: false,
        error: 'Failed to enable emergency DDoS protection'
      });
    }
  }

  /**
   * Disable emergency DDoS protection
   */
  async disableEmergencyProtection(req, res) {
    try {
      // Reset to normal settings
      this.ddosProtection.config.rateLimits.global.maxRequests = 1000;
      this.ddosProtection.config.rateLimits.perIP.maxRequests = 100;
      this.ddosProtection.config.ddosThresholds.requestsPerSecond = 50;

      // Return CloudFlare to normal
      await this.cloudflare.disableDDoSProtection();

      logger.info('Emergency DDoS protection disabled');

      res.json({
        success: true,
        message: 'Emergency DDoS protection disabled',
        settings: {
          localProtection: 'normal',
          cloudflareProtection: 'medium',
          deactivatedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error disabling emergency protection', error);
      res.status(500).json({
        success: false,
        error: 'Failed to disable emergency DDoS protection'
      });
    }
  }

  /**
   * Get protection health status
   */
  async getHealthStatus(req, res) {
    try {
      const [localHealth, cloudflareHealth] = await Promise.all([
        this.checkLocalHealth(),
        this.cloudflare.healthCheck()
      ]);

      const overallHealth = localHealth.healthy && cloudflareHealth.healthy;

      res.json({
        success: true,
        data: {
          overall: {
            healthy: overallHealth,
            status: overallHealth ? 'operational' : 'degraded'
          },
          local: localHealth,
          cloudflare: cloudflareHealth,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error getting health status', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve health status'
      });
    }
  }

  // Helper methods

  /**
   * Get local security events
   */
  async getLocalSecurityEvents(timeframe) {
    try {
      // This would query Redis for recent violations
      // For now, return empty array
      return [];
    } catch (error) {
      logger.error('Error getting local security events', error);
      return [];
    }
  }

  /**
   * Check local health
   */
  async checkLocalHealth() {
    try {
      const stats = await this.ddosProtection.getStatistics();
      return {
        healthy: stats !== null,
        redis: this.ddosProtection.redis.status === 'ready',
        activeBlocks: stats?.activeBlocks || 0
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message
      };
    }
  }

  /**
   * Validate IP address format
   */
  isValidIP(ip) {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  }
}

module.exports = new DDoSController();