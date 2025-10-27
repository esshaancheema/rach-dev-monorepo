import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { AlertService } from '../services/alert.service';
import { logger } from '../utils/logger';

const router = Router();

// Initialize service (in a real app, this would be injected)
const alertService = new AlertService(null as any); // Would be properly injected

/**
 * @swagger
 * /api/alerts:
 *   get:
 *     summary: Get all alerts for the authenticated user
 *     tags: [Alerts]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for alert names
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: List of alerts
 */
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString(),
  query('isActive').optional().isBoolean(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      page = 1,
      limit = 20,
      search,
      isActive,
    } = req.query;

    const userId = req.user?.id;
    const result = await alertService.getUserAlerts(userId, {
      page: Number(page),
      limit: Number(limit),
      search: search as string,
      isActive: isActive as boolean,
    });

    res.json({
      alerts: result.alerts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: result.total,
        pages: Math.ceil(result.total / Number(limit)),
      },
    });

  } catch (error) {
    logger.error('Failed to get alerts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/alerts/{id}:
 *   get:
 *     summary: Get a specific alert
 *     tags: [Alerts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Alert ID
 *     responses:
 *       200:
 *         description: Alert details
 *       404:
 *         description: Alert not found
 */
router.get('/:id', [
  param('id').isString().notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const alert = await alertService.getAlert(id);

    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.json(alert);

  } catch (error) {
    logger.error('Failed to get alert:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/alerts:
 *   post:
 *     summary: Create a new alert
 *     tags: [Alerts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - query
 *               - conditions
 *               - actions
 *               - schedule
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               query:
 *                 type: object
 *               conditions:
 *                 type: array
 *                 items:
 *                   type: object
 *               actions:
 *                 type: array
 *                 items:
 *                   type: object
 *               schedule:
 *                 type: object
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Alert created successfully
 *       400:
 *         description: Invalid input
 */
router.post('/', [
  body('name').isString().trim().notEmpty().withMessage('Name is required'),
  body('description').optional().isString(),
  body('query').isObject().withMessage('Query is required'),
  body('conditions').isArray({ min: 1 }).withMessage('At least one condition is required'),
  body('actions').isArray({ min: 1 }).withMessage('At least one action is required'),
  body('schedule').isObject().withMessage('Schedule is required'),
  body('isActive').optional().isBoolean(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user?.id;
    const alertData = req.body;

    const alert = await alertService.createAlert(alertData, userId);

    res.status(201).json(alert);

  } catch (error) {
    logger.error('Failed to create alert:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/alerts/{id}:
 *   put:
 *     summary: Update an alert
 *     tags: [Alerts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Alert ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Alert updated successfully
 *       404:
 *         description: Alert not found
 */
router.put('/:id', [
  param('id').isString().notEmpty(),
  body('name').optional().isString().trim().notEmpty(),
  body('description').optional().isString(),
  body('query').optional().isObject(),
  body('conditions').optional().isArray({ min: 1 }),
  body('actions').optional().isArray({ min: 1 }),
  body('schedule').optional().isObject(),
  body('isActive').optional().isBoolean(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const userId = req.user?.id;
    const updates = req.body;

    const alert = await alertService.updateAlert(id, updates, userId);

    res.json(alert);

  } catch (error) {
    logger.error('Failed to update alert:', error);
    if (error.message === 'Alert not found') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === 'Insufficient permissions to update alert') {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/alerts/{id}:
 *   delete:
 *     summary: Delete an alert
 *     tags: [Alerts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Alert ID
 *     responses:
 *       204:
 *         description: Alert deleted successfully
 *       404:
 *         description: Alert not found
 */
router.delete('/:id', [
  param('id').isString().notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const userId = req.user?.id;

    await alertService.deleteAlert(id, userId);

    res.status(204).send();

  } catch (error) {
    logger.error('Failed to delete alert:', error);
    if (error.message === 'Alert not found') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === 'Insufficient permissions to delete alert') {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/alerts/{id}/test:
 *   post:
 *     summary: Test an alert (execute immediately)
 *     tags: [Alerts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Alert ID
 *     responses:
 *       200:
 *         description: Test execution completed
 *       404:
 *         description: Alert not found
 */
router.post('/:id/test', [
  param('id').isString().notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const execution = await alertService.testAlert(id);

    res.json({
      message: 'Alert test completed',
      execution,
    });

  } catch (error) {
    logger.error('Failed to test alert:', error);
    if (error.message === 'Alert not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/alerts/{id}/executions:
 *   get:
 *     summary: Get alert execution history
 *     tags: [Alerts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Alert ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [checking, triggered, resolved, failed]
 *         description: Filter by execution status
 *     responses:
 *       200:
 *         description: List of alert executions
 */
router.get('/:id/executions', [
  param('id').isString().notEmpty(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['checking', 'triggered', 'resolved', 'failed']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { page = 1, limit = 20, status } = req.query;

    const result = await alertService.getAlertExecutions(id, {
      page: Number(page),
      limit: Number(limit),
      status: status as string,
    });

    res.json({
      executions: result.executions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: result.total,
        pages: Math.ceil(result.total / Number(limit)),
      },
    });

  } catch (error) {
    logger.error('Failed to get alert executions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;