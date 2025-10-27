import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { FeatureFlagService } from '../services/feature-flag.service';
import { logger } from '../utils/logger';

const router = Router();

// Initialize service (in a real app, this would be injected)
const featureFlagService = new FeatureFlagService(null as any, null as any);

/**
 * @swagger
 * /api/flags:
 *   get:
 *     summary: Get all feature flags for the authenticated user
 *     tags: [Feature Flags]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, archived]
 *         description: Filter by flag status
 *       - in: query
 *         name: environment
 *         schema:
 *           type: string
 *         description: Filter by environment
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
 *         description: Search term for flag names or keys
 *     responses:
 *       200:
 *         description: List of feature flags
 */
router.get('/', [
  query('status').optional().isIn(['active', 'inactive', 'archived']),
  query('environment').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user?.id;
    const options = {
      status: req.query.status as string,
      environment: req.query.environment as string,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 50,
      search: req.query.search as string,
      tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
    };

    const result = await featureFlagService.getUserFlags(userId, options);

    res.json({
      flags: result.flags,
      pagination: {
        page: options.page,
        limit: options.limit,
        total: result.total,
        pages: Math.ceil(result.total / options.limit),
      },
    });

  } catch (error) {
    logger.error('Failed to get feature flags:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/flags/{id}:
 *   get:
 *     summary: Get a specific feature flag
 *     tags: [Feature Flags]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Feature flag ID
 *     responses:
 *       200:
 *         description: Feature flag details
 *       404:
 *         description: Feature flag not found
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
    const flag = await featureFlagService.getFlag(id);

    if (!flag) {
      return res.status(404).json({ error: 'Feature flag not found' });
    }

    res.json(flag);

  } catch (error) {
    logger.error('Failed to get feature flag:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/flags:
 *   post:
 *     summary: Create a new feature flag
 *     tags: [Feature Flags]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - key
 *               - type
 *               - defaultValue
 *               - variations
 *               - targeting
 *               - rollout
 *               - environments
 *               - settings
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               key:
 *                 type: string
 *                 pattern: '^[a-zA-Z0-9_-]+$'
 *               type:
 *                 type: string
 *                 enum: [boolean, string, number, json]
 *               defaultValue:
 *                 description: Default value for the flag
 *               variations:
 *                 type: array
 *                 minItems: 1
 *               targeting:
 *                 type: object
 *               rollout:
 *                 type: object
 *               environments:
 *                 type: object
 *               settings:
 *                 type: object
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               approvalRequired:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Feature flag created successfully
 *       400:
 *         description: Invalid input
 *       409:
 *         description: Feature flag key already exists
 */
router.post('/', [
  body('name').isString().trim().notEmpty().withMessage('Name is required'),
  body('description').optional().isString(),
  body('key').isString().trim().notEmpty().matches(/^[a-zA-Z0-9_-]+$/).withMessage('Key must contain only letters, numbers, underscores, and hyphens'),
  body('type').isIn(['boolean', 'string', 'number', 'json']).withMessage('Invalid flag type'),
  body('defaultValue').exists().withMessage('Default value is required'),
  body('variations').isArray({ min: 1 }).withMessage('At least 1 variation required'),
  body('targeting').isObject().withMessage('Targeting configuration is required'),
  body('rollout').isObject().withMessage('Rollout configuration is required'),
  body('environments').isObject().withMessage('Environment configuration is required'),
  body('settings').isObject().withMessage('Settings configuration is required'),
  body('tags').optional().isArray(),
  body('approvalRequired').optional().isBoolean(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user?.id;
    const flagData = {
      ...req.body,
      status: 'inactive' as const,
    };

    const flag = await featureFlagService.createFlag(flagData, userId);

    res.status(201).json(flag);

  } catch (error) {
    logger.error('Failed to create feature flag:', error);
    if (error.message.includes('already exists')) {
      return res.status(409).json({ error: error.message });
    }
    if (error.message.includes('Maximum number of feature flags')) {
      return res.status(429).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/flags/{id}:
 *   put:
 *     summary: Update a feature flag
 *     tags: [Feature Flags]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Feature flag ID
 *       - in: query
 *         name: environment
 *         schema:
 *           type: string
 *         description: Environment to update (optional)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Feature flag updated successfully
 *       404:
 *         description: Feature flag not found
 *       403:
 *         description: Insufficient permissions
 */
router.put('/:id', [
  param('id').isString().notEmpty(),
  query('environment').optional().isString(),
  body('name').optional().isString().trim().notEmpty(),
  body('description').optional().isString(),
  body('variations').optional().isArray({ min: 1 }),
  body('targeting').optional().isObject(),
  body('rollout').optional().isObject(),
  body('environments').optional().isObject(),
  body('settings').optional().isObject(),
  body('tags').optional().isArray(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const environment = req.query.environment as string;
    const userId = req.user?.id;
    const updates = req.body;

    const flag = await featureFlagService.updateFlag(id, updates, userId, environment);

    res.json(flag);

  } catch (error) {
    logger.error('Failed to update feature flag:', error);
    if (error.message === 'Feature flag not found') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === 'Insufficient permissions to update feature flag') {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/flags/{id}/toggle:
 *   post:
 *     summary: Toggle a feature flag on/off
 *     tags: [Feature Flags]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Feature flag ID
 *       - in: query
 *         name: environment
 *         schema:
 *           type: string
 *         description: Environment to toggle (optional)
 *     responses:
 *       200:
 *         description: Feature flag toggled successfully
 *       404:
 *         description: Feature flag not found
 */
router.post('/:id/toggle', [
  param('id').isString().notEmpty(),
  query('environment').optional().isString(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const environment = req.query.environment as string;
    const userId = req.user?.id;

    const flag = await featureFlagService.toggleFlag(id, userId, environment);

    res.json({
      message: 'Feature flag toggled successfully',
      flag,
    });

  } catch (error) {
    logger.error('Failed to toggle feature flag:', error);
    if (error.message === 'Feature flag not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/flags/{id}:
 *   delete:
 *     summary: Delete (archive) a feature flag
 *     tags: [Feature Flags]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Feature flag ID
 *     responses:
 *       204:
 *         description: Feature flag deleted successfully
 *       404:
 *         description: Feature flag not found
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

    await featureFlagService.deleteFlag(id, userId);

    res.status(204).send();

  } catch (error) {
    logger.error('Failed to delete feature flag:', error);
    if (error.message === 'Feature flag not found') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === 'Insufficient permissions to delete feature flag') {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/flags/evaluate/{key}:
 *   post:
 *     summary: Evaluate a feature flag for a user
 *     tags: [Feature Flags]
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: Feature flag key
 *       - in: query
 *         name: environment
 *         schema:
 *           type: string
 *           default: production
 *         description: Environment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user
 *             properties:
 *               user:
 *                 type: object
 *                 required:
 *                   - id
 *                 properties:
 *                   id:
 *                     type: string
 *                   key:
 *                     type: string
 *                   email:
 *                     type: string
 *                   name:
 *                     type: string
 *                   custom:
 *                     type: object
 *                   groups:
 *                     type: array
 *                     items:
 *                       type: string
 *                   anonymous:
 *                     type: boolean
 *     responses:
 *       200:
 *         description: Feature flag evaluation result
 */
router.post('/evaluate/:key', [
  param('key').isString().notEmpty(),
  query('environment').optional().isString(),
  body('user').isObject().withMessage('User context is required'),
  body('user.id').isString().notEmpty().withMessage('User ID is required'),
  body('user.key').optional().isString(),
  body('user.email').optional().isEmail(),
  body('user.name').optional().isString(),
  body('user.custom').optional().isObject(),
  body('user.groups').optional().isArray(),
  body('user.anonymous').optional().isBoolean(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { key } = req.params;
    const environment = (req.query.environment as string) || 'production';
    const { user } = req.body;

    const evaluation = await featureFlagService.evaluateFlag(key, user, environment);

    res.json(evaluation);

  } catch (error) {
    logger.error('Failed to evaluate feature flag:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/flags/evaluate:
 *   post:
 *     summary: Evaluate all feature flags for a user
 *     tags: [Feature Flags]
 *     parameters:
 *       - in: query
 *         name: environment
 *         schema:
 *           type: string
 *           default: production
 *         description: Environment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user
 *             properties:
 *               user:
 *                 type: object
 *                 required:
 *                   - id
 *     responses:
 *       200:
 *         description: All feature flag evaluations
 */
router.post('/evaluate', [
  query('environment').optional().isString(),
  body('user').isObject().withMessage('User context is required'),
  body('user.id').isString().notEmpty().withMessage('User ID is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const environment = (req.query.environment as string) || 'production';
    const { user } = req.body;

    const evaluations = await featureFlagService.evaluateAllFlags(user, environment);

    res.json({
      user,
      environment,
      flags: evaluations,
    });

  } catch (error) {
    logger.error('Failed to evaluate all feature flags:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/flags/bulk-evaluate:
 *   post:
 *     summary: Evaluate specific feature flags for a user
 *     tags: [Feature Flags]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user
 *               - flags
 *             properties:
 *               user:
 *                 type: object
 *                 required:
 *                   - id
 *               flags:
 *                 type: array
 *                 items:
 *                   type: string
 *               environment:
 *                 type: string
 *                 default: production
 *     responses:
 *       200:
 *         description: Bulk feature flag evaluations
 */
router.post('/bulk-evaluate', [
  body('user').isObject().withMessage('User context is required'),
  body('user.id').isString().notEmpty().withMessage('User ID is required'),
  body('flags').isArray({ min: 1 }).withMessage('At least one flag key is required'),
  body('environment').optional().isString(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const request = {
      user: req.body.user,
      flags: req.body.flags,
      environment: req.body.environment || 'production',
    };

    const response = await featureFlagService.bulkEvaluate(request);

    res.json(response);

  } catch (error) {
    logger.error('Failed to bulk evaluate feature flags:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/flags/{id}/analytics:
 *   get:
 *     summary: Get feature flag analytics
 *     tags: [Feature Flags]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Feature flag ID
 *       - in: query
 *         name: start
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for analytics
 *       - in: query
 *         name: end
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for analytics
 *       - in: query
 *         name: environment
 *         schema:
 *           type: string
 *         description: Environment filter
 *     responses:
 *       200:
 *         description: Feature flag analytics data
 */
router.get('/:id/analytics', [
  param('id').isString().notEmpty(),
  query('start').isISO8601().withMessage('Start date must be valid ISO 8601 date'),
  query('end').isISO8601().withMessage('End date must be valid ISO 8601 date'),
  query('environment').optional().isString(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const start = new Date(req.query.start as string);
    const end = new Date(req.query.end as string);
    const environment = req.query.environment as string;

    // Get flag to verify it exists and get the key
    const flag = await featureFlagService.getFlag(id);
    if (!flag) {
      return res.status(404).json({ error: 'Feature flag not found' });
    }

    const analytics = await featureFlagService.getFlagAnalytics(
      flag.key,
      { start, end },
      environment
    );

    res.json(analytics);

  } catch (error) {
    logger.error('Failed to get feature flag analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/flags/{id}/gradual-rollout:
 *   post:
 *     summary: Start gradual rollout for a feature flag
 *     tags: [Feature Flags]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Feature flag ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - targetPercentage
 *               - incrementPercentage
 *               - intervalMinutes
 *             properties:
 *               targetPercentage:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *               incrementPercentage:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 100
 *               intervalMinutes:
 *                 type: number
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Gradual rollout started successfully
 */
router.post('/:id/gradual-rollout', [
  param('id').isString().notEmpty(),
  body('targetPercentage').isFloat({ min: 0, max: 100 }).withMessage('Target percentage must be between 0 and 100'),
  body('incrementPercentage').isFloat({ min: 1, max: 100 }).withMessage('Increment percentage must be between 1 and 100'),
  body('intervalMinutes').isInt({ min: 1 }).withMessage('Interval must be at least 1 minute'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { targetPercentage, incrementPercentage, intervalMinutes } = req.body;
    const userId = req.user?.id;

    await featureFlagService.gradualRollout(
      id,
      targetPercentage,
      incrementPercentage,
      intervalMinutes,
      userId
    );

    res.json({
      message: 'Gradual rollout started successfully',
      targetPercentage,
      incrementPercentage,
      intervalMinutes,
    });

  } catch (error) {
    logger.error('Failed to start gradual rollout:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/flags/{id}/kill-switch:
 *   post:
 *     summary: Activate kill switch for a feature flag
 *     tags: [Feature Flags]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Feature flag ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for activating kill switch
 *     responses:
 *       200:
 *         description: Kill switch activated successfully
 */
router.post('/:id/kill-switch', [
  param('id').isString().notEmpty(),
  body('reason').isString().notEmpty().withMessage('Reason is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user?.id;

    await featureFlagService.killSwitchActivate(id, userId, reason);

    res.json({
      message: 'Kill switch activated successfully',
      reason,
      activatedAt: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('Failed to activate kill switch:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;