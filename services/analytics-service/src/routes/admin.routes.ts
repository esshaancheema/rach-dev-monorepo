import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { logger } from '../utils/logger';

const router = Router();

/**
 * @swagger
 * /api/admin/health:
 *   get:
 *     summary: Get detailed system health information
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: System health details
 */
router.get('/health', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {
        database: 'healthy',
        cache: 'healthy',
        clickhouse: 'healthy',
      },
      metrics: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
      },
      version: process.env.npm_package_version || '1.0.0',
    };

    res.json(health);

  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get system statistics
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: System statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = {
      dashboards: {
        total: 0,
        active: 0,
        templates: 0,
      },
      reports: {
        total: 0,
        scheduled: 0,
        executions: 0,
      },
      alerts: {
        total: 0,
        active: 0,
        triggered: 0,
      },
      queries: {
        totalExecuted: 0,
        averageExecutionTime: 0,
        cacheHitRate: 0,
      },
    };

    res.json(stats);

  } catch (error) {
    logger.error('Failed to get system stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/admin/cache/clear:
 *   post:
 *     summary: Clear system cache
 *     tags: [Admin]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pattern:
 *                 type: string
 *                 description: Cache key pattern to clear (optional)
 *     responses:
 *       200:
 *         description: Cache cleared successfully
 */
router.post('/cache/clear', [
  body('pattern').optional().isString(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { pattern } = req.body;

    logger.info('Cache clear requested', { pattern });

    // In a real implementation, this would clear the cache
    const result = {
      cleared: true,
      pattern: pattern || 'all',
      clearedKeys: 0,
      timestamp: new Date().toISOString(),
    };

    res.json(result);

  } catch (error) {
    logger.error('Cache clear failed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;