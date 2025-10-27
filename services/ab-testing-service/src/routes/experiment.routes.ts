import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { ExperimentService } from '../services/experiment.service';
import { logger } from '../utils/logger';

const router = Router();

// Initialize service (in a real app, this would be injected)
const experimentService = new ExperimentService(null as any, null as any, null as any);

/**
 * @swagger
 * /api/experiments:
 *   get:
 *     summary: Get all experiments for the authenticated user
 *     tags: [Experiments]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, running, paused, completed, archived]
 *         description: Filter by experiment status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [ab_test, multivariate, split_url, feature_flag]
 *         description: Filter by experiment type
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
 *         description: Search term
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, createdAt, updatedAt, startDate]
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *     responses:
 *       200:
 *         description: List of experiments
 */
router.get('/', [
  query('status').optional().isIn(['draft', 'running', 'paused', 'completed', 'archived']),
  query('type').optional().isIn(['ab_test', 'multivariate', 'split_url', 'feature_flag']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString(),
  query('sortBy').optional().isIn(['name', 'createdAt', 'updatedAt', 'startDate']),
  query('sortOrder').optional().isIn(['asc', 'desc']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user?.id;
    const options = {
      status: req.query.status as string,
      type: req.query.type as string,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
      search: req.query.search as string,
      sortBy: req.query.sortBy as string,
      sortOrder: req.query.sortOrder as 'asc' | 'desc',
      tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
    };

    const result = await experimentService.getUserExperiments(userId, options);

    res.json({
      experiments: result.experiments,
      pagination: {
        page: options.page,
        limit: options.limit,
        total: result.total,
        pages: Math.ceil(result.total / options.limit),
      },
    });

  } catch (error) {
    logger.error('Failed to get experiments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/experiments/{id}:
 *   get:
 *     summary: Get a specific experiment
 *     tags: [Experiments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Experiment ID
 *     responses:
 *       200:
 *         description: Experiment details
 *       404:
 *         description: Experiment not found
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
    const experiment = await experimentService.getExperiment(id);

    if (!experiment) {
      return res.status(404).json({ error: 'Experiment not found' });
    }

    res.json(experiment);

  } catch (error) {
    logger.error('Failed to get experiment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/experiments:
 *   post:
 *     summary: Create a new experiment
 *     tags: [Experiments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - hypothesis
 *               - type
 *               - variations
 *               - goals
 *               - traffic
 *               - targeting
 *               - statisticalConfig
 *               - settings
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               hypothesis:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [ab_test, multivariate, split_url, feature_flag]
 *               variations:
 *                 type: array
 *                 minItems: 2
 *               goals:
 *                 type: array
 *                 minItems: 1
 *               traffic:
 *                 type: object
 *               targeting:
 *                 type: object
 *               statisticalConfig:
 *                 type: object
 *               settings:
 *                 type: object
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Experiment created successfully
 *       400:
 *         description: Invalid input
 */
router.post('/', [
  body('name').isString().trim().notEmpty().withMessage('Name is required'),
  body('description').optional().isString(),
  body('hypothesis').isString().trim().notEmpty().withMessage('Hypothesis is required'),
  body('type').isIn(['ab_test', 'multivariate', 'split_url', 'feature_flag']).withMessage('Invalid experiment type'),
  body('variations').isArray({ min: 2 }).withMessage('At least 2 variations required'),
  body('goals').isArray({ min: 1 }).withMessage('At least 1 goal required'),
  body('traffic').isObject().withMessage('Traffic configuration is required'),
  body('targeting').isObject().withMessage('Targeting configuration is required'),
  body('statisticalConfig').isObject().withMessage('Statistical configuration is required'),
  body('settings').isObject().withMessage('Settings configuration is required'),
  body('tags').optional().isArray(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user?.id;
    const experimentData = {
      ...req.body,
      status: 'draft' as const,
    };

    const experiment = await experimentService.createExperiment(experimentData, userId);

    res.status(201).json(experiment);

  } catch (error) {
    logger.error('Failed to create experiment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/experiments/{id}:
 *   put:
 *     summary: Update an experiment
 *     tags: [Experiments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Experiment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Experiment updated successfully
 *       404:
 *         description: Experiment not found
 */
router.put('/:id', [
  param('id').isString().notEmpty(),
  body('name').optional().isString().trim().notEmpty(),
  body('description').optional().isString(),
  body('hypothesis').optional().isString().trim().notEmpty(),
  body('variations').optional().isArray({ min: 2 }),
  body('goals').optional().isArray({ min: 1 }),
  body('traffic').optional().isObject(),
  body('targeting').optional().isObject(),
  body('statisticalConfig').optional().isObject(),
  body('settings').optional().isObject(),
  body('tags').optional().isArray(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const userId = req.user?.id;
    const updates = req.body;

    const experiment = await experimentService.updateExperiment(id, updates, userId);

    res.json(experiment);

  } catch (error) {
    logger.error('Failed to update experiment:', error);
    if (error.message === 'Experiment not found') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === 'Insufficient permissions to update experiment') {
      return res.status(403).json({ error: error.message });
    }
    if (error.message.includes('Cannot modify variations while experiment is running')) {
      return res.status(409).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/experiments/{id}/start:
 *   post:
 *     summary: Start an experiment
 *     tags: [Experiments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Experiment ID
 *     responses:
 *       200:
 *         description: Experiment started successfully
 *       404:
 *         description: Experiment not found
 *       409:
 *         description: Experiment cannot be started
 */
router.post('/:id/start', [
  param('id').isString().notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const userId = req.user?.id;

    const experiment = await experimentService.startExperiment(id, userId);

    res.json({
      message: 'Experiment started successfully',
      experiment,
    });

  } catch (error) {
    logger.error('Failed to start experiment:', error);
    if (error.message === 'Experiment not found') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes('Cannot start experiment')) {
      return res.status(409).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/experiments/{id}/pause:
 *   post:
 *     summary: Pause an experiment
 *     tags: [Experiments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Experiment ID
 *     responses:
 *       200:
 *         description: Experiment paused successfully
 */
router.post('/:id/pause', [
  param('id').isString().notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const userId = req.user?.id;

    const experiment = await experimentService.pauseExperiment(id, userId);

    res.json({
      message: 'Experiment paused successfully',
      experiment,
    });

  } catch (error) {
    logger.error('Failed to pause experiment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/experiments/{id}/resume:
 *   post:
 *     summary: Resume an experiment
 *     tags: [Experiments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Experiment ID
 *     responses:
 *       200:
 *         description: Experiment resumed successfully
 */
router.post('/:id/resume', [
  param('id').isString().notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const userId = req.user?.id;

    const experiment = await experimentService.resumeExperiment(id, userId);

    res.json({
      message: 'Experiment resumed successfully',
      experiment,
    });

  } catch (error) {
    logger.error('Failed to resume experiment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/experiments/{id}/stop:
 *   post:
 *     summary: Stop an experiment
 *     tags: [Experiments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Experiment ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for stopping the experiment
 *     responses:
 *       200:
 *         description: Experiment stopped successfully
 */
router.post('/:id/stop', [
  param('id').isString().notEmpty(),
  body('reason').optional().isString(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user?.id;

    const experiment = await experimentService.stopExperiment(id, userId, reason);

    res.json({
      message: 'Experiment stopped successfully',
      experiment,
    });

  } catch (error) {
    logger.error('Failed to stop experiment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/experiments/{id}/results:
 *   get:
 *     summary: Get experiment results
 *     tags: [Experiments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Experiment ID
 *     responses:
 *       200:
 *         description: Experiment results
 *       404:
 *         description: Experiment not found
 */
router.get('/:id/results', [
  param('id').isString().notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const results = await experimentService.getExperimentResults(id);

    if (!results) {
      return res.status(404).json({ error: 'Experiment results not found' });
    }

    res.json(results);

  } catch (error) {
    logger.error('Failed to get experiment results:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/experiments/{id}/assign:
 *   post:
 *     summary: Assign user to experiment variation
 *     tags: [Experiments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Experiment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *               userAttributes:
 *                 type: object
 *     responses:
 *       200:
 *         description: User assigned to variation
 *       404:
 *         description: Experiment not found or user not eligible
 */
router.post('/:id/assign', [
  param('id').isString().notEmpty(),
  body('userId').isString().notEmpty(),
  body('userAttributes').optional().isObject(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { userId, userAttributes = {} } = req.body;

    const assignment = await experimentService.assignUserToVariation(id, userId, userAttributes);

    if (!assignment) {
      return res.status(404).json({ 
        error: 'User not eligible for experiment or experiment not found' 
      });
    }

    res.json({
      experimentId: id,
      userId,
      assignment,
    });

  } catch (error) {
    logger.error('Failed to assign user to experiment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/experiments/{id}/track:
 *   post:
 *     summary: Track conversion for experiment
 *     tags: [Experiments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Experiment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - goalId
 *             properties:
 *               userId:
 *                 type: string
 *               goalId:
 *                 type: string
 *               value:
 *                 type: number
 *               properties:
 *                 type: object
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Conversion tracked successfully
 *       404:
 *         description: Experiment or goal not found
 */
router.post('/:id/track', [
  param('id').isString().notEmpty(),
  body('userId').isString().notEmpty(),
  body('goalId').isString().notEmpty(),
  body('value').optional().isNumeric(),
  body('properties').optional().isObject(),
  body('timestamp').optional().isISO8601(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { userId, goalId, value, properties, timestamp } = req.body;

    const conversionData = {
      value: value ? parseFloat(value) : undefined,
      properties,
      timestamp: timestamp ? new Date(timestamp) : undefined,
    };

    await experimentService.trackConversion(id, userId, goalId, conversionData);

    res.json({
      message: 'Conversion tracked successfully',
      experimentId: id,
      userId,
      goalId,
    });

  } catch (error) {
    logger.error('Failed to track conversion:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;