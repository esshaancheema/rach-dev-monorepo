const EventEmitter = require('events');
const logger = require('../utils/logger');

/**
 * DDoS Monitoring and Alerting System
 * 
 * Monitors DDoS protection metrics and triggers alerts
 */

class DDoSMonitoring extends EventEmitter {
  constructor(ddosProtection, cloudflareIntegration) {
    super();
    this.ddosProtection = ddosProtection;
    this.cloudflare = cloudflareIntegration;
    this.metrics = new Map();
    this.alertThresholds = {
      blockedIPsPerMinute: 10,
      rateLimitHitsPerMinute: 100,
      violationsPerMinute: 5,
      threatScoreThreshold: 80,
      bandwidthSpike: 1000000000, // 1GB spike
      requestSpike: 10000 // 10k requests per minute
    };
    
    this.isMonitoring = false;
    this.monitoringInterval = null;
    this.alertCooldowns = new Map();
    this.alertCooldownDuration = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Start monitoring
   */
  startMonitoring() {
    if (this.isMonitoring) {
      logger.warn('DDoS monitoring is already running');
      return;
    }

    this.isMonitoring = true;
    
    // Monitor every 30 seconds
    this.monitoringInterval = setInterval(async () => {
      await this.collectMetrics();
      await this.analyzeMetrics();
    }, 30000);

    // Collect baseline metrics immediately
    this.collectMetrics();
    
    logger.info('DDoS monitoring started');
    this.emit('monitoring_started');
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    if (!this.isMonitoring) {
      return;
    }

    this.isMonitoring = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    logger.info('DDoS monitoring stopped');
    this.emit('monitoring_stopped');
  }

  /**
   * Collect metrics from all sources
   */
  async collectMetrics() {
    try {
      const timestamp = Date.now();

      // Collect local metrics
      const localStats = await this.ddosProtection.getStatistics();
      
      // Collect CloudFlare metrics
      const cloudflareStatus = await this.cloudflare.getDDoSProtectionStatus();
      const cloudflareAnalytics = await this.cloudflare.getZoneAnalytics('-5'); // Last 5 minutes

      const metrics = {
        timestamp,
        local: {
          blockedIPs: localStats?.blockedIPs || 0,
          activeBlocks: localStats?.activeBlocks || 0,
          recentViolations: localStats?.recentViolations || 0,
          rateLimitHits: localStats?.rateLimitHits || 0,
          whitelistedIPs: localStats?.whitelistedIPs || 0
        },
        cloudflare: {
          securityLevel: cloudflareStatus?.securityLevel || 'medium',
          botFightMode: cloudflareStatus?.botFightMode || 'off',
          requests: cloudflareAnalytics?.totals?.requests?.all || 0,
          threats: cloudflareAnalytics?.totals?.threats?.all || 0,
          bandwidth: cloudflareAnalytics?.totals?.bandwidth?.all || 0,
          countries: cloudflareAnalytics?.totals?.countries || {},
          responseStatus: cloudflareAnalytics?.totals?.responseStatus || {}
        },
        system: {
          memoryUsage: process.memoryUsage(),
          cpuUsage: process.cpuUsage(),
          uptime: process.uptime()
        }
      };

      // Store metrics (keep last 100 entries)
      this.metrics.set(timestamp, metrics);
      const keys = Array.from(this.metrics.keys()).sort((a, b) => b - a);
      if (keys.length > 100) {
        keys.slice(100).forEach(key => this.metrics.delete(key));
      }

      this.emit('metrics_collected', metrics);
      return metrics;

    } catch (error) {
      logger.error('Error collecting DDoS metrics', error);
      return null;
    }
  }

  /**
   * Analyze metrics for anomalies and threats
   */
  async analyzeMetrics() {
    try {
      const recentMetrics = this.getRecentMetrics(5); // Last 5 data points
      if (recentMetrics.length < 2) {
        return; // Need at least 2 data points for comparison
      }

      const latest = recentMetrics[0];
      const previous = recentMetrics[1];

      // Check for blocked IP spikes
      await this.checkBlockedIPSpike(latest, previous);

      // Check for rate limit spikes
      await this.checkRateLimitSpike(latest, previous);

      // Check for violation spikes
      await this.checkViolationSpike(latest, previous);

      // Check for bandwidth spikes
      await this.checkBandwidthSpike(latest, previous);

      // Check for request spikes
      await this.checkRequestSpike(latest, previous);

      // Check for geographic anomalies
      await this.checkGeographicAnomalies(latest);

      // Check for bot activity
      await this.checkBotActivity(latest, previous);

      // Check system health
      await this.checkSystemHealth(latest);

    } catch (error) {
      logger.error('Error analyzing DDoS metrics', error);
    }
  }

  /**
   * Check for blocked IP spikes
   */
  async checkBlockedIPSpike(latest, previous) {
    const currentBlocked = latest.local.activeBlocks;
    const previousBlocked = previous.local.activeBlocks;
    const increase = currentBlocked - previousBlocked;

    if (increase >= this.alertThresholds.blockedIPsPerMinute) {
      await this.triggerAlert('blocked_ip_spike', {
        current: currentBlocked,
        previous: previousBlocked,
        increase,
        threshold: this.alertThresholds.blockedIPsPerMinute,
        severity: increase >= 50 ? 'critical' : 'warning'
      });
    }
  }

  /**
   * Check for rate limit spikes
   */
  async checkRateLimitSpike(latest, previous) {
    const currentHits = latest.local.rateLimitHits;
    const previousHits = previous.local.rateLimitHits;
    const increase = currentHits - previousHits;

    if (increase >= this.alertThresholds.rateLimitHitsPerMinute) {
      await this.triggerAlert('rate_limit_spike', {
        current: currentHits,
        previous: previousHits,
        increase,
        threshold: this.alertThresholds.rateLimitHitsPerMinute,
        severity: increase >= 500 ? 'critical' : 'warning'
      });
    }
  }

  /**
   * Check for violation spikes
   */
  async checkViolationSpike(latest, previous) {
    const currentViolations = latest.local.recentViolations;
    const previousViolations = previous.local.recentViolations;
    const increase = currentViolations - previousViolations;

    if (increase >= this.alertThresholds.violationsPerMinute) {
      await this.triggerAlert('violation_spike', {
        current: currentViolations,
        previous: previousViolations,
        increase,
        threshold: this.alertThresholds.violationsPerMinute,
        severity: increase >= 20 ? 'critical' : 'warning'
      });
    }
  }

  /**
   * Check for bandwidth spikes
   */
  async checkBandwidthSpike(latest, previous) {
    const currentBandwidth = latest.cloudflare.bandwidth;
    const previousBandwidth = previous.cloudflare.bandwidth;
    const increase = currentBandwidth - previousBandwidth;

    if (increase >= this.alertThresholds.bandwidthSpike) {
      await this.triggerAlert('bandwidth_spike', {
        current: currentBandwidth,
        previous: previousBandwidth,
        increase,
        increaseMB: Math.round(increase / 1024 / 1024),
        threshold: this.alertThresholds.bandwidthSpike,
        severity: increase >= 5000000000 ? 'critical' : 'warning' // 5GB
      });
    }
  }

  /**
   * Check for request spikes
   */
  async checkRequestSpike(latest, previous) {
    const currentRequests = latest.cloudflare.requests;
    const previousRequests = previous.cloudflare.requests;
    const increase = currentRequests - previousRequests;

    if (increase >= this.alertThresholds.requestSpike) {
      await this.triggerAlert('request_spike', {
        current: currentRequests,
        previous: previousRequests,
        increase,
        threshold: this.alertThresholds.requestSpike,
        severity: increase >= 50000 ? 'critical' : 'warning'
      });
    }
  }

  /**
   * Check for geographic anomalies
   */
  async checkGeographicAnomalies(latest) {
    const countries = latest.cloudflare.countries;
    const suspiciousCountries = ['CN', 'RU', 'KP', 'IR'];
    
    let suspiciousTraffic = 0;
    Object.entries(countries).forEach(([country, requests]) => {
      if (suspiciousCountries.includes(country)) {
        suspiciousTraffic += requests;
      }
    });

    const totalRequests = latest.cloudflare.requests;
    const suspiciousPercentage = totalRequests > 0 ? (suspiciousTraffic / totalRequests) * 100 : 0;

    if (suspiciousPercentage > 30) { // More than 30% from suspicious countries
      await this.triggerAlert('geographic_anomaly', {
        suspiciousTraffic,
        totalRequests,
        suspiciousPercentage: suspiciousPercentage.toFixed(2),
        countries: Object.entries(countries)
          .filter(([country]) => suspiciousCountries.includes(country))
          .reduce((obj, [country, requests]) => ({ ...obj, [country]: requests }), {}),
        severity: suspiciousPercentage > 60 ? 'critical' : 'warning'
      });
    }
  }

  /**
   * Check for bot activity
   */
  async checkBotActivity(latest, previous) {
    const threats = latest.cloudflare.threats;
    const previousThreats = previous.cloudflare.threats;
    const increase = threats - previousThreats;

    if (increase > 100) { // More than 100 new threats
      await this.triggerAlert('bot_activity_spike', {
        current: threats,
        previous: previousThreats,
        increase,
        botFightMode: latest.cloudflare.botFightMode,
        severity: increase > 1000 ? 'critical' : 'warning'
      });
    }
  }

  /**
   * Check system health
   */
  async checkSystemHealth(latest) {
    const memory = latest.system.memoryUsage;
    const memoryUsagePercent = (memory.heapUsed / memory.heapTotal) * 100;

    if (memoryUsagePercent > 90) {
      await this.triggerAlert('high_memory_usage', {
        memoryUsagePercent: memoryUsagePercent.toFixed(2),
        heapUsed: Math.round(memory.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memory.heapTotal / 1024 / 1024),
        severity: memoryUsagePercent > 95 ? 'critical' : 'warning'
      });
    }
  }

  /**
   * Trigger alert with cooldown
   */
  async triggerAlert(alertType, data) {
    const now = Date.now();
    const lastAlert = this.alertCooldowns.get(alertType);

    // Check cooldown
    if (lastAlert && (now - lastAlert) < this.alertCooldownDuration) {
      return; // Still in cooldown period
    }

    // Set cooldown
    this.alertCooldowns.set(alertType, now);

    const alert = {
      type: alertType,
      timestamp: now,
      data,
      severity: data.severity || 'warning'
    };

    logger.warn('DDoS alert triggered', alert);
    this.emit('alert', alert);

    // Send notifications based on severity
    if (data.severity === 'critical') {
      this.emit('critical_alert', alert);
    }

    return alert;
  }

  /**
   * Get recent metrics
   */
  getRecentMetrics(count = 10) {
    const keys = Array.from(this.metrics.keys()).sort((a, b) => b - a);
    return keys.slice(0, count).map(key => this.metrics.get(key));
  }

  /**
   * Get metrics summary
   */
  getMetricsSummary() {
    const recentMetrics = this.getRecentMetrics(10);
    if (recentMetrics.length === 0) {
      return null;
    }

    const latest = recentMetrics[0];
    const oldest = recentMetrics[recentMetrics.length - 1];

    return {
      timespan: {
        from: new Date(oldest.timestamp).toISOString(),
        to: new Date(latest.timestamp).toISOString(),
        duration: latest.timestamp - oldest.timestamp
      },
      current: latest,
      trends: {
        blockedIPs: latest.local.activeBlocks - oldest.local.activeBlocks,
        violations: latest.local.recentViolations - oldest.local.recentViolations,
        requests: latest.cloudflare.requests - oldest.cloudflare.requests,
        threats: latest.cloudflare.threats - oldest.cloudflare.threats
      },
      averages: {
        blockedIPs: Math.round(recentMetrics.reduce((sum, m) => sum + m.local.activeBlocks, 0) / recentMetrics.length),
        violations: Math.round(recentMetrics.reduce((sum, m) => sum + m.local.recentViolations, 0) / recentMetrics.length),
        requests: Math.round(recentMetrics.reduce((sum, m) => sum + m.cloudflare.requests, 0) / recentMetrics.length)
      }
    };
  }

  /**
   * Export metrics for external analysis
   */
  exportMetrics(format = 'json') {
    const metrics = Array.from(this.metrics.values());
    
    switch (format) {
      case 'csv':
        return this.exportToCSV(metrics);
      case 'json':
      default:
        return JSON.stringify(metrics, null, 2);
    }
  }

  /**
   * Export metrics to CSV format
   */
  exportToCSV(metrics) {
    if (metrics.length === 0) return '';

    const headers = [
      'timestamp',
      'blocked_ips',
      'active_blocks',
      'violations',
      'rate_limit_hits',
      'cf_requests',
      'cf_threats',
      'cf_bandwidth',
      'memory_used_mb'
    ];

    const rows = metrics.map(m => [
      new Date(m.timestamp).toISOString(),
      m.local.blockedIPs,
      m.local.activeBlocks,
      m.local.recentViolations,
      m.local.rateLimitHits,
      m.cloudflare.requests,
      m.cloudflare.threats,
      m.cloudflare.bandwidth,
      Math.round(m.system.memoryUsage.heapUsed / 1024 / 1024)
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }

  /**
   * Update alert thresholds
   */
  updateAlertThresholds(newThresholds) {
    this.alertThresholds = { ...this.alertThresholds, ...newThresholds };
    logger.info('DDoS alert thresholds updated', this.alertThresholds);
  }

  /**
   * Get monitoring status
   */
  getStatus() {
    return {
      isMonitoring: this.isMonitoring,
      metricsCount: this.metrics.size,
      alertThresholds: this.alertThresholds,
      activeCooldowns: Array.from(this.alertCooldowns.keys()),
      uptime: this.isMonitoring ? Date.now() - (this.monitoringStartTime || Date.now()) : 0
    };
  }
}

module.exports = DDoSMonitoring;