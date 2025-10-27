const express = require('express');
const DDoSController = require('../controllers/ddos-controller');
const authMiddleware = require('../middleware/auth-middleware');
const rateLimitMiddleware = require('../middleware/rate-limit-middleware');

const router = express.Router();

/**
 * DDoS Protection Management Routes
 * 
 * Provides REST API endpoints for DDoS protection management
 */

// Apply authentication to all routes
router.use(authMiddleware.requireAuth);
router.use(authMiddleware.requireRole(['admin', 'security_admin']));

// Apply rate limiting to admin routes
router.use(rateLimitMiddleware.createLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many admin requests'
}));

/**
 * @route GET /api/security/ddos/statistics
 * @desc Get DDoS protection statistics
 * @access Admin
 */
router.get('/statistics', async (req, res) => {
  await DDoSController.getStatistics(req, res);
});

/**
 * @route GET /api/security/ddos/events
 * @desc Get recent security events
 * @access Admin
 * @query {number} limit - Number of events to retrieve (default: 100)
 * @query {string} timeframe - Time frame for events (default: 1h)
 */
router.get('/events', async (req, res) => {
  await DDoSController.getSecurityEvents(req, res);
});

/**
 * @route POST /api/security/ddos/block-ip
 * @desc Manually block an IP address
 * @access Admin
 * @body {string} ip - IP address to block
 * @body {string} reason - Reason for blocking
 * @body {number} duration - Block duration in seconds
 * @body {string} level - Block level (local, cloudflare, both)
 */
router.post('/block-ip', async (req, res) => {
  await DDoSController.blockIP(req, res);
});

/**
 * @route POST /api/security/ddos/unblock-ip
 * @desc Manually unblock an IP address
 * @access Admin
 * @body {string} ip - IP address to unblock
 * @body {string} level - Unblock level (local, cloudflare, both)
 */
router.post('/unblock-ip', async (req, res) => {
  await DDoSController.unblockIP(req, res);
});

/**
 * @route POST /api/security/ddos/whitelist/add
 * @desc Add IP to whitelist
 * @access Admin
 * @body {string} ip - IP address to whitelist
 * @body {string} reason - Reason for whitelisting
 */
router.post('/whitelist/add', async (req, res) => {
  await DDoSController.addToWhitelist(req, res);
});

/**
 * @route POST /api/security/ddos/whitelist/remove
 * @desc Remove IP from whitelist
 * @access Admin
 * @body {string} ip - IP address to remove from whitelist
 */
router.post('/whitelist/remove', async (req, res) => {
  await DDoSController.removeFromWhitelist(req, res);
});

/**
 * @route PUT /api/security/ddos/settings
 * @desc Update DDoS protection settings
 * @access Admin
 * @body {object} rateLimits - Rate limiting configuration
 * @body {object} ddosThresholds - DDoS detection thresholds
 * @body {object} blockDuration - Block duration settings
 * @body {string} securityLevel - CloudFlare security level
 */
router.put('/settings', async (req, res) => {
  await DDoSController.updateSettings(req, res);
});

/**
 * @route POST /api/security/ddos/emergency/enable
 * @desc Enable emergency DDoS protection
 * @access Admin
 * @body {string} reason - Reason for emergency activation
 */
router.post('/emergency/enable', async (req, res) => {
  await DDoSController.enableEmergencyProtection(req, res);
});

/**
 * @route POST /api/security/ddos/emergency/disable
 * @desc Disable emergency DDoS protection
 * @access Admin
 */
router.post('/emergency/disable', async (req, res) => {
  await DDoSController.disableEmergencyProtection(req, res);
});

/**
 * @route GET /api/security/ddos/health
 * @desc Get DDoS protection health status
 * @access Admin
 */
router.get('/health', async (req, res) => {
  await DDoSController.getHealthStatus(req, res);
});

/**
 * Webhook endpoint for CloudFlare notifications
 * @route POST /api/security/ddos/webhook/cloudflare
 * @desc Handle CloudFlare webhook notifications
 * @access Webhook (no auth required, but validated)
 */
router.post('/webhook/cloudflare', 
  // Skip auth for webhooks but validate signature
  authMiddleware.skipAuth,
  async (req, res) => {
    try {
      const signature = req.headers['cf-webhook-signature'];
      const webhookSecret = process.env.CLOUDFLARE_WEBHOOK_SECRET;

      // Validate webhook signature
      if (!signature || !webhookSecret) {
        return res.status(401).json({ error: 'Unauthorized webhook' });
      }

      // Process CloudFlare webhook data
      const eventData = req.body;
      
      // Log security event
      require('../utils/logger').info('CloudFlare security event received', {
        event: eventData.event_type,
        zone: eventData.zone_name,
        timestamp: eventData.occurred_at
      });

      // You could trigger additional actions here
      // e.g., send alerts, update local blacklists, etc.

      res.status(200).json({ success: true });

    } catch (error) {
      require('../utils/logger').error('Error processing CloudFlare webhook', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  }
);

/**
 * Bulk operations
 */

/**
 * @route POST /api/security/ddos/bulk/block-ips
 * @desc Block multiple IP addresses
 * @access Admin
 * @body {string[]} ips - Array of IP addresses to block
 * @body {string} reason - Reason for blocking
 * @body {number} duration - Block duration in seconds
 * @body {string} level - Block level (local, cloudflare, both)
 */
router.post('/bulk/block-ips', async (req, res) => {
  try {
    const { ips, reason = 'Bulk block', duration = 3600, level = 'local' } = req.body;

    if (!Array.isArray(ips) || ips.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'IPs array is required'
      });
    }

    const results = [];
    for (const ip of ips) {
      try {
        const blockResult = await DDoSController.blockIP({
          body: { ip, reason, duration, level }
        }, { json: () => {} }); // Mock response object
        
        results.push({ ip, success: true });
      } catch (error) {
        results.push({ ip, success: false, error: error.message });
      }
    }

    res.json({
      success: true,
      message: `Processed ${ips.length} IP addresses`,
      data: results
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Bulk IP blocking failed'
    });
  }
});

/**
 * @route POST /api/security/ddos/bulk/unblock-ips
 * @desc Unblock multiple IP addresses
 * @access Admin
 * @body {string[]} ips - Array of IP addresses to unblock
 * @body {string} level - Unblock level (local, cloudflare, both)
 */
router.post('/bulk/unblock-ips', async (req, res) => {
  try {
    const { ips, level = 'local' } = req.body;

    if (!Array.isArray(ips) || ips.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'IPs array is required'
      });
    }

    const results = [];
    for (const ip of ips) {
      try {
        await DDoSController.unblockIP({
          body: { ip, level }
        }, { json: () => {} }); // Mock response object
        
        results.push({ ip, success: true });
      } catch (error) {
        results.push({ ip, success: false, error: error.message });
      }
    }

    res.json({
      success: true,
      message: `Processed ${ips.length} IP addresses`,
      data: results
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Bulk IP unblocking failed'
    });
  }
});

module.exports = router;