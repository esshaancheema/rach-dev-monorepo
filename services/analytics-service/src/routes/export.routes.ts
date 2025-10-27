import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { logger } from '../utils/logger';

const router = Router();

/**
 * @swagger
 * /api/exports/dashboard/{id}:
 *   post:
 *     summary: Export dashboard data
 *     tags: [Exports]
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
 *             type: object
 *             required:
 *               - format
 *             properties:
 *               format:
 *                 type: string
 *                 enum: [csv, json, xlsx, pdf]
 *               filters:
 *                 type: object
 *               includeCharts:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Export file
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 */
router.post('/dashboard/:id', [
  param('id').isString().notEmpty(),
  body('format').isIn(['csv', 'json', 'xlsx', 'pdf']),
  body('filters').optional().isObject(),
  body('includeCharts').optional().isBoolean(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { format, filters = {}, includeCharts = false } = req.body;

    // In a real implementation, this would generate the export file
    logger.info('Dashboard export requested', { 
      dashboardId: id, 
      format, 
      includeCharts 
    });

    // Simulate export generation
    const exportBuffer = Buffer.from(`Dashboard ${id} export in ${format} format`);

    const contentType = {
      csv: 'text/csv',
      json: 'application/json',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      pdf: 'application/pdf',
    }[format];

    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="dashboard-${id}.${format}"`,
    });

    res.send(exportBuffer);

  } catch (error) {
    logger.error('Dashboard export failed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/exports/data:
 *   post:
 *     summary: Export analytics data
 *     tags: [Exports]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *               - format
 *             properties:
 *               query:
 *                 type: object
 *               format:
 *                 type: string
 *                 enum: [csv, json, xlsx]
 *               filename:
 *                 type: string
 *     responses:
 *       200:
 *         description: Export file
 */
router.post('/data', [
  body('query').isObject(),
  body('format').isIn(['csv', 'json', 'xlsx']),
  body('filename').optional().isString(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { query, format, filename } = req.body;

    logger.info('Data export requested', { format, filename });

    // Simulate data export
    const exportBuffer = Buffer.from(`Analytics data export in ${format} format`);
    const exportFilename = filename || `analytics-data-${Date.now()}.${format}`;

    const contentType = {
      csv: 'text/csv',
      json: 'application/json',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }[format];

    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${exportFilename}"`,
    });

    res.send(exportBuffer);

  } catch (error) {
    logger.error('Data export failed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;