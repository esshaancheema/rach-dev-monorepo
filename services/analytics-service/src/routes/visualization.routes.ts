import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { logger } from '../utils/logger';

const router = Router();

/**
 * @swagger
 * /api/visualizations/templates:
 *   get:
 *     summary: Get available visualization templates
 *     tags: [Visualizations]
 *     responses:
 *       200:
 *         description: List of visualization templates
 */
router.get('/templates', async (req, res) => {
  try {
    const templates = [
      {
        id: 'time-series',
        name: 'Time Series',
        description: 'Line chart showing data over time',
        type: 'line',
        config: {
          xAxis: { type: 'datetime' },
          yAxis: { type: 'linear' },
        },
      },
      {
        id: 'comparison-bar',
        name: 'Comparison Bar',
        description: 'Bar chart for comparing categories',
        type: 'bar',
        config: {
          xAxis: { type: 'category' },
          yAxis: { type: 'linear' },
        },
      },
      {
        id: 'distribution-pie',
        name: 'Distribution Pie',
        description: 'Pie chart showing data distribution',
        type: 'pie',
        config: {
          showLegend: true,
          dataLabels: { enabled: true },
        },
      },
    ];

    res.json({ templates });

  } catch (error) {
    logger.error('Failed to get visualization templates:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/visualizations/generate:
 *   post:
 *     summary: Generate a visualization
 *     tags: [Visualizations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - templateId
 *               - query
 *             properties:
 *               templateId:
 *                 type: string
 *               query:
 *                 type: object
 *               customization:
 *                 type: object
 *     responses:
 *       200:
 *         description: Generated visualization
 */
router.post('/generate', [
  body('templateId').isString().notEmpty(),
  body('query').isObject(),
  body('customization').optional().isObject(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { templateId, query, customization = {} } = req.body;

    logger.info('Visualization generation requested', { templateId });

    // Simulate visualization generation
    const visualization = {
      id: `viz_${Date.now()}`,
      templateId,
      config: {
        type: 'line', // Would be determined by template
        title: customization.title || 'Generated Visualization',
        ...customization,
      },
      data: [], // Would contain actual data
      metadata: {
        generatedAt: new Date().toISOString(),
        dataPoints: 0,
      },
    };

    res.json(visualization);

  } catch (error) {
    logger.error('Visualization generation failed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;