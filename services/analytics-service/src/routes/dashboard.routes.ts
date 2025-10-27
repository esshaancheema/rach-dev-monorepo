import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { DashboardService } from '../services/dashboard.service';
import { ReportService } from '../services/report.service';
import { logger } from '../utils/logger';

const router = Router();

// Initialize services (in a real app, these would be injected)
const dashboardService = new DashboardService(null as any); // Would be properly injected
const reportService = new ReportService(null as any); // Would be properly injected

/**
 * @swagger
 * /api/dashboards:
 *   get:
 *     summary: Get all dashboards for the authenticated user
 *     tags: [Dashboards]
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
 *         description: Search term for dashboard names
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Comma-separated list of tags to filter by
 *     responses:
 *       200:
 *         description: List of dashboards
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dashboards:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Dashboard'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString(),
  query('tags').optional().isString(),
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
      tags,
    } = req.query;

    const userId = req.user?.id;
    const tagsArray = tags ? (tags as string).split(',') : undefined;

    // In a real implementation, this would fetch from database
    const dashboards = []; // await dashboardService.getUserDashboards(userId, { page, limit, search, tags: tagsArray });

    res.json({
      dashboards,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: 0, // dashboards.total
        pages: 0, // Math.ceil(dashboards.total / limit)
      },
    });

  } catch (error) {
    logger.error('Failed to get dashboards:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/dashboards/{id}:
 *   get:
 *     summary: Get a specific dashboard
 *     tags: [Dashboards]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Dashboard ID
 *     responses:
 *       200:
 *         description: Dashboard details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Dashboard'
 *       404:
 *         description: Dashboard not found
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
    const dashboard = await dashboardService.getDashboard(id);

    if (!dashboard) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }

    res.json(dashboard);

  } catch (error) {
    logger.error('Failed to get dashboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/dashboards:
 *   post:
 *     summary: Create a new dashboard
 *     tags: [Dashboards]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DashboardInput'
 *     responses:
 *       201:
 *         description: Dashboard created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Dashboard'
 *       400:
 *         description: Invalid input
 */
router.post('/', [
  body('name').isString().trim().notEmpty().withMessage('Name is required'),
  body('description').optional().isString(),
  body('layout').isObject(),
  body('widgets').isArray(),
  body('filters').optional().isArray(),
  body('settings').optional().isObject(),
  body('isPublic').optional().isBoolean(),
  body('tags').optional().isArray(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user?.id;
    const dashboardData = req.body;

    const dashboard = await dashboardService.createDashboard(dashboardData, userId);

    res.status(201).json(dashboard);

  } catch (error) {
    logger.error('Failed to create dashboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/dashboards/{id}:
 *   put:
 *     summary: Update a dashboard
 *     tags: [Dashboards]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Dashboard ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DashboardInput'
 *     responses:
 *       200:
 *         description: Dashboard updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Dashboard'
 *       404:
 *         description: Dashboard not found
 */
router.put('/:id', [
  param('id').isString().notEmpty(),
  body('name').optional().isString().trim().notEmpty(),
  body('description').optional().isString(),
  body('layout').optional().isObject(),
  body('widgets').optional().isArray(),
  body('filters').optional().isArray(),
  body('settings').optional().isObject(),
  body('isPublic').optional().isBoolean(),
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

    const dashboard = await dashboardService.updateDashboard(id, updates, userId);

    res.json(dashboard);

  } catch (error) {
    logger.error('Failed to update dashboard:', error);
    if (error.message === 'Dashboard not found') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === 'Insufficient permissions to update dashboard') {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/dashboards/{id}:
 *   delete:
 *     summary: Delete a dashboard
 *     tags: [Dashboards]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Dashboard ID
 *     responses:
 *       204:
 *         description: Dashboard deleted successfully
 *       404:
 *         description: Dashboard not found
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

    // In a real implementation
    // await dashboardService.deleteDashboard(id, userId);

    res.status(204).send();

  } catch (error) {
    logger.error('Failed to delete dashboard:', error);
    if (error.message === 'Dashboard not found') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === 'Insufficient permissions to delete dashboard') {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/dashboards/{id}/data:
 *   get:
 *     summary: Get dashboard data with all widget data
 *     tags: [Dashboards]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Dashboard ID
 *       - in: query
 *         name: filters
 *         schema:
 *           type: object
 *         description: Global filters to apply
 *     responses:
 *       200:
 *         description: Dashboard with widget data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dashboard:
 *                   $ref: '#/components/schemas/Dashboard'
 *                 widgetData:
 *                   type: object
 *                   additionalProperties: true
 */
router.get('/:id/data', [
  param('id').isString().notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const filters = req.query.filters ? JSON.parse(req.query.filters as string) : {};

    const result = await dashboardService.getDashboardData(id, filters);

    res.json({
      dashboard: result.dashboard,
      widgetData: Object.fromEntries(result.widgetData),
    });

  } catch (error) {
    logger.error('Failed to get dashboard data:', error);
    if (error.message === 'Dashboard not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/dashboards/{id}/widgets/{widgetId}/data:
 *   get:
 *     summary: Get data for a specific widget
 *     tags: [Dashboards]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Dashboard ID
 *       - in: path
 *         name: widgetId
 *         required: true
 *         schema:
 *           type: string
 *         description: Widget ID
 *       - in: query
 *         name: filters
 *         schema:
 *           type: object
 *         description: Filters to apply
 *     responses:
 *       200:
 *         description: Widget data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties: true
 */
router.get('/:id/widgets/:widgetId/data', [
  param('id').isString().notEmpty(),
  param('widgetId').isString().notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id, widgetId } = req.params;
    const filters = req.query.filters ? JSON.parse(req.query.filters as string) : {};

    const dashboard = await dashboardService.getDashboard(id);
    if (!dashboard) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }

    const widget = dashboard.widgets.find(w => w.id === widgetId);
    if (!widget) {
      return res.status(404).json({ error: 'Widget not found' });
    }

    const widgetData = await dashboardService.getWidgetData(widget, filters);

    res.json(widgetData);

  } catch (error) {
    logger.error('Failed to get widget data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/dashboards/templates:
 *   get:
 *     summary: Get available dashboard templates
 *     tags: [Dashboards]
 *     responses:
 *       200:
 *         description: List of dashboard templates
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 templates:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DashboardTemplate'
 */
router.get('/templates', async (req, res) => {
  try {
    const templates = await dashboardService.getDashboardTemplates();

    res.json({ templates });

  } catch (error) {
    logger.error('Failed to get dashboard templates:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/dashboards/templates/{templateId}/create:
 *   post:
 *     summary: Create dashboard from template
 *     tags: [Dashboards]
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: string
 *         description: Template ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name for the new dashboard
 *             required:
 *               - name
 *     responses:
 *       201:
 *         description: Dashboard created from template
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Dashboard'
 */
router.post('/templates/:templateId/create', [
  param('templateId').isString().notEmpty(),
  body('name').isString().trim().notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { templateId } = req.params;
    const { name } = req.body;
    const userId = req.user?.id;

    const dashboard = await dashboardService.createDashboardFromTemplate(templateId, name, userId);

    res.status(201).json(dashboard);

  } catch (error) {
    logger.error('Failed to create dashboard from template:', error);
    if (error.message === 'Template not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/dashboards/{id}/export:
 *   get:
 *     summary: Export dashboard
 *     tags: [Dashboards]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Dashboard ID
 *       - in: query
 *         name: format
 *         required: true
 *         schema:
 *           type: string
 *           enum: [json, pdf, png]
 *         description: Export format
 *     responses:
 *       200:
 *         description: Exported dashboard
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/:id/export', [
  param('id').isString().notEmpty(),
  query('format').isIn(['json', 'pdf', 'png']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { format } = req.query;

    const exportData = await dashboardService.exportDashboard(id, format as string);

    switch (format) {
      case 'json':
        res.json(exportData);
        break;
      case 'pdf':
        res.set({
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="dashboard-${id}.pdf"`,
        });
        res.send(exportData);
        break;
      case 'png':
        res.set({
          'Content-Type': 'image/png',
          'Content-Disposition': `attachment; filename="dashboard-${id}.png"`,
        });
        res.send(exportData);
        break;
    }

  } catch (error) {
    logger.error('Failed to export dashboard:', error);
    if (error.message === 'Dashboard not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/dashboards/{id}/duplicate:
 *   post:
 *     summary: Duplicate a dashboard
 *     tags: [Dashboards]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Dashboard ID to duplicate
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name for the duplicated dashboard
 *             required:
 *               - name
 *     responses:
 *       201:
 *         description: Dashboard duplicated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Dashboard'
 */
router.post('/:id/duplicate', [
  param('id').isString().notEmpty(),
  body('name').isString().trim().notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name } = req.body;
    const userId = req.user?.id;

    const originalDashboard = await dashboardService.getDashboard(id);
    if (!originalDashboard) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }

    const duplicatedDashboard = await dashboardService.createDashboard({
      ...originalDashboard,
      name,
    }, userId);

    res.status(201).json(duplicatedDashboard);

  } catch (error) {
    logger.error('Failed to duplicate dashboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;