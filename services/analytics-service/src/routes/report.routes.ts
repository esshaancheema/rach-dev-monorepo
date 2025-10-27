import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { ReportService } from '../services/report.service';
import { logger } from '../utils/logger';

const router = Router();

// Initialize service (in a real app, this would be injected)
const reportService = new ReportService(null as any); // Would be properly injected

/**
 * @swagger
 * /api/reports:
 *   get:
 *     summary: Get all reports for the authenticated user
 *     tags: [Reports]
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
 *         description: Search term for report names
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: List of reports
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
    const result = await reportService.getUserReports(userId, {
      page: Number(page),
      limit: Number(limit),
      search: search as string,
      isActive: isActive as boolean,
    });

    res.json({
      reports: result.reports,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: result.total,
        pages: Math.ceil(result.total / Number(limit)),
      },
    });

  } catch (error) {
    logger.error('Failed to get reports:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/reports/{id}:
 *   get:
 *     summary: Get a specific report
 *     tags: [Reports]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Report ID
 *     responses:
 *       200:
 *         description: Report details
 *       404:
 *         description: Report not found
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
    const report = await reportService.getReport(id);

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json(report);

  } catch (error) {
    logger.error('Failed to get report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/reports:
 *   post:
 *     summary: Create a new report
 *     tags: [Reports]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - query
 *               - schedule
 *               - format
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               query:
 *                 type: object
 *               schedule:
 *                 type: object
 *               format:
 *                 type: string
 *                 enum: [pdf, csv, json, xlsx]
 *               recipients:
 *                 type: array
 *                 items:
 *                   type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Report created successfully
 *       400:
 *         description: Invalid input
 */
router.post('/', [
  body('name').isString().trim().notEmpty().withMessage('Name is required'),
  body('description').optional().isString(),
  body('query').isObject().withMessage('Query is required'),
  body('schedule').isObject().withMessage('Schedule is required'),
  body('format').isIn(['pdf', 'csv', 'json', 'xlsx']).withMessage('Invalid format'),
  body('recipients').optional().isArray(),
  body('template').optional().isString(),
  body('filters').optional().isObject(),
  body('isActive').optional().isBoolean(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user?.id;
    const reportData = req.body;

    const report = await reportService.createReport(reportData, userId);

    res.status(201).json(report);

  } catch (error) {
    logger.error('Failed to create report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/reports/{id}:
 *   put:
 *     summary: Update a report
 *     tags: [Reports]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Report ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Report updated successfully
 *       404:
 *         description: Report not found
 */
router.put('/:id', [
  param('id').isString().notEmpty(),
  body('name').optional().isString().trim().notEmpty(),
  body('description').optional().isString(),
  body('query').optional().isObject(),
  body('schedule').optional().isObject(),
  body('format').optional().isIn(['pdf', 'csv', 'json', 'xlsx']),
  body('recipients').optional().isArray(),
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

    const report = await reportService.updateReport(id, updates, userId);

    res.json(report);

  } catch (error) {
    logger.error('Failed to update report:', error);
    if (error.message === 'Report not found') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === 'Insufficient permissions to update report') {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/reports/{id}:
 *   delete:
 *     summary: Delete a report
 *     tags: [Reports]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Report ID
 *     responses:
 *       204:
 *         description: Report deleted successfully
 *       404:
 *         description: Report not found
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

    await reportService.deleteReport(id, userId);

    res.status(204).send();

  } catch (error) {
    logger.error('Failed to delete report:', error);
    if (error.message === 'Report not found') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === 'Insufficient permissions to delete report') {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/reports/{id}/execute:
 *   post:
 *     summary: Execute a report immediately
 *     tags: [Reports]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Report ID
 *     responses:
 *       200:
 *         description: Report execution started
 *       404:
 *         description: Report not found
 */
router.post('/:id/execute', [
  param('id').isString().notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const execution = await reportService.executeReport(id);

    res.json(execution);

  } catch (error) {
    logger.error('Failed to execute report:', error);
    if (error.message === 'Report not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/reports/{id}/executions:
 *   get:
 *     summary: Get report execution history
 *     tags: [Reports]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Report ID
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
 *     responses:
 *       200:
 *         description: List of report executions
 */
router.get('/:id/executions', [
  param('id').isString().notEmpty(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const result = await reportService.getReportExecutions(id, {
      page: Number(page),
      limit: Number(limit),
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
    logger.error('Failed to get report executions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/reports/executions/{executionId}/download:
 *   get:
 *     summary: Download report file
 *     tags: [Reports]
 *     parameters:
 *       - in: path
 *         name: executionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Execution ID
 *     responses:
 *       200:
 *         description: Report file
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Execution not found or file not available
 */
router.get('/executions/:executionId/download', [
  param('executionId').isString().notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { executionId } = req.params;
    const fileBuffer = await reportService.downloadReportFile(executionId);

    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="report-${executionId}"`,
    });
    
    res.send(fileBuffer);

  } catch (error) {
    logger.error('Failed to download report file:', error);
    if (error.message === 'Execution not found' || error.message === 'Report file not available') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/reports/{id}/test:
 *   post:
 *     summary: Test a report (execute without scheduling)
 *     tags: [Reports]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Report ID
 *     responses:
 *       200:
 *         description: Test execution completed
 *       404:
 *         description: Report not found
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
    const execution = await reportService.executeReport(id);

    res.json({
      message: 'Report test completed',
      execution,
    });

  } catch (error) {
    logger.error('Failed to test report:', error);
    if (error.message === 'Report not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;