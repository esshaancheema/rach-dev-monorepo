import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { ChartService } from '../services/chart.service';
import { logger } from '../utils/logger';

const router = Router();

// Initialize service (in a real app, this would be injected)
const chartService = new ChartService(null as any); // Would be properly injected

/**
 * @swagger
 * /api/charts/generate:
 *   post:
 *     summary: Generate a chart from analytics query
 *     tags: [Charts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *               - chartType
 *             properties:
 *               query:
 *                 type: object
 *                 description: Analytics query configuration
 *               chartType:
 *                 type: string
 *                 enum: [line, bar, pie, area, scatter, heatmap, gauge, funnel, histogram, treemap]
 *               options:
 *                 type: object
 *                 description: Chart customization options
 *     responses:
 *       200:
 *         description: Chart generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 config:
 *                   type: object
 *                 data:
 *                   type: array
 *                 metadata:
 *                   type: object
 *       400:
 *         description: Invalid input
 */
router.post('/generate', [
  body('query').isObject().withMessage('Query is required'),
  body('chartType').isIn(['line', 'bar', 'pie', 'area', 'scatter', 'heatmap', 'gauge', 'funnel', 'histogram', 'treemap']).withMessage('Invalid chart type'),
  body('options').optional().isObject(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { query, chartType, options = {} } = req.body;

    const chartData = await chartService.generateChart(query, chartType, options);

    res.json(chartData);

  } catch (error) {
    logger.error('Failed to generate chart:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/charts/multi-series:
 *   post:
 *     summary: Generate a multi-series chart from multiple queries
 *     tags: [Charts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - queries
 *               - chartType
 *             properties:
 *               queries:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     query:
 *                       type: object
 *                     name:
 *                       type: string
 *                     color:
 *                       type: string
 *               chartType:
 *                 type: string
 *                 enum: [line, bar, area, scatter]
 *               options:
 *                 type: object
 *     responses:
 *       200:
 *         description: Multi-series chart generated successfully
 *       400:
 *         description: Invalid input
 */
router.post('/multi-series', [
  body('queries').isArray({ min: 1 }).withMessage('At least one query is required'),
  body('chartType').isIn(['line', 'bar', 'area', 'scatter']).withMessage('Invalid chart type for multi-series'),
  body('options').optional().isObject(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { queries, chartType, options = {} } = req.body;

    // Validate each query in the array
    for (const queryItem of queries) {
      if (!queryItem.query || !queryItem.name) {
        return res.status(400).json({ 
          error: 'Each query item must have query and name properties' 
        });
      }
    }

    const chartData = await chartService.generateMultiSeriesChart(queries, chartType, options);

    res.json(chartData);

  } catch (error) {
    logger.error('Failed to generate multi-series chart:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/charts/real-time:
 *   post:
 *     summary: Set up a real-time chart with update configuration
 *     tags: [Charts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *               - chartType
 *             properties:
 *               query:
 *                 type: object
 *               chartType:
 *                 type: string
 *               updateInterval:
 *                 type: integer
 *                 minimum: 5000
 *                 description: Update interval in milliseconds
 *               maxDataPoints:
 *                 type: integer
 *                 minimum: 10
 *                 description: Maximum number of data points to keep
 *     responses:
 *       200:
 *         description: Real-time chart configuration created
 *       400:
 *         description: Invalid input
 */
router.post('/real-time', [
  body('query').isObject().withMessage('Query is required'),
  body('chartType').isIn(['line', 'bar', 'area']).withMessage('Invalid chart type for real-time'),
  body('updateInterval').optional().isInt({ min: 5000 }).withMessage('Update interval must be at least 5000ms'),
  body('maxDataPoints').optional().isInt({ min: 10 }).withMessage('Max data points must be at least 10'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      query, 
      chartType, 
      updateInterval = 30000, 
      maxDataPoints = 100 
    } = req.body;

    const realTimeChart = await chartService.generateRealTimeChart(
      query, 
      chartType, 
      updateInterval, 
      maxDataPoints
    );

    res.json({
      initialChart: realTimeChart.initialChart,
      config: {
        updateInterval,
        maxDataPoints,
        updateEndpoint: `/api/charts/real-time/update`,
      },
    });

  } catch (error) {
    logger.error('Failed to set up real-time chart:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/charts/real-time/update:
 *   post:
 *     summary: Get updated data for real-time chart
 *     tags: [Charts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *             properties:
 *               query:
 *                 type: object
 *               maxDataPoints:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Updated chart data
 *       400:
 *         description: Invalid input
 */
router.post('/real-time/update', [
  body('query').isObject().withMessage('Query is required'),
  body('maxDataPoints').optional().isInt({ min: 1 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { query, maxDataPoints = 100 } = req.body;

    // Create a temporary real-time chart to get the update function
    const realTimeChart = await chartService.generateRealTimeChart(
      query, 
      'line', // Default chart type for updates
      30000, 
      maxDataPoints
    );

    const updatedData = await realTimeChart.updateFunction();

    res.json({
      data: updatedData,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('Failed to update real-time chart:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/charts/export:
 *   post:
 *     summary: Export chart as image or PDF
 *     tags: [Charts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - chartData
 *               - format
 *             properties:
 *               chartData:
 *                 type: object
 *                 description: Chart data object from generation endpoint
 *               format:
 *                 type: string
 *                 enum: [png, jpg, pdf, svg]
 *     responses:
 *       200:
 *         description: Exported chart file
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Invalid input
 *       501:
 *         description: Export format not implemented
 */
router.post('/export', [
  body('chartData').isObject().withMessage('Chart data is required'),
  body('format').isIn(['png', 'jpg', 'pdf', 'svg']).withMessage('Invalid export format'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { chartData, format } = req.body;

    try {
      const exportBuffer = await chartService.exportChart(chartData, format);

      const contentType = {
        png: 'image/png',
        jpg: 'image/jpeg',
        pdf: 'application/pdf',
        svg: 'image/svg+xml',
      }[format];

      res.set({
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="chart.${format}"`,
      });

      res.send(exportBuffer);

    } catch (exportError) {
      if (exportError.message.includes('not implemented')) {
        return res.status(501).json({ error: 'Export format not implemented' });
      }
      throw exportError;
    }

  } catch (error) {
    logger.error('Failed to export chart:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/charts/validate:
 *   post:
 *     summary: Validate chart configuration
 *     tags: [Charts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - config
 *             properties:
 *               config:
 *                 type: object
 *                 description: Chart configuration to validate
 *     responses:
 *       200:
 *         description: Chart configuration is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid chart configuration
 */
router.post('/validate', [
  body('config').isObject().withMessage('Chart config is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { config } = req.body;

    try {
      const isValid = chartService.validateChartConfig(config);
      
      res.json({
        valid: isValid,
        message: 'Chart configuration is valid',
      });

    } catch (validationError) {
      res.status(400).json({
        valid: false,
        message: validationError.message,
      });
    }

  } catch (error) {
    logger.error('Failed to validate chart config:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/charts/types:
 *   get:
 *     summary: Get available chart types and their configurations
 *     tags: [Charts]
 *     responses:
 *       200:
 *         description: List of available chart types
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 chartTypes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       supportedMetrics:
 *                         type: array
 *                         items:
 *                           type: string
 *                       supportedDimensions:
 *                         type: array
 *                         items:
 *                           type: string
 */
router.get('/types', async (req, res) => {
  try {
    const chartTypes = [
      {
        type: 'line',
        name: 'Line Chart',
        description: 'Shows trends over time with connected data points',
        supportedMetrics: ['multiple'],
        supportedDimensions: ['time', 'category'],
        useCase: 'Time series data, trends analysis',
      },
      {
        type: 'bar',
        name: 'Bar Chart',
        description: 'Compares values across categories',
        supportedMetrics: ['multiple'],
        supportedDimensions: ['category'],
        useCase: 'Categorical comparisons, rankings',
      },
      {
        type: 'pie',
        name: 'Pie Chart',
        description: 'Shows parts of a whole as percentages',
        supportedMetrics: ['single'],
        supportedDimensions: ['category'],
        useCase: 'Composition analysis, market share',
      },
      {
        type: 'area',
        name: 'Area Chart',
        description: 'Shows trends with filled areas under the line',
        supportedMetrics: ['multiple'],
        supportedDimensions: ['time', 'category'],
        useCase: 'Cumulative data, stacked comparisons',
      },
      {
        type: 'scatter',
        name: 'Scatter Plot',
        description: 'Shows correlation between two metrics',
        supportedMetrics: ['two'],
        supportedDimensions: ['none'],
        useCase: 'Correlation analysis, outlier detection',
      },
      {
        type: 'heatmap',
        name: 'Heatmap',
        description: 'Shows intensity of data across two dimensions',
        supportedMetrics: ['single'],
        supportedDimensions: ['two'],
        useCase: 'Geographic data, time patterns',
      },
      {
        type: 'gauge',
        name: 'Gauge Chart',
        description: 'Shows single metric as a gauge or speedometer',
        supportedMetrics: ['single'],
        supportedDimensions: ['none'],
        useCase: 'KPI monitoring, progress tracking',
      },
      {
        type: 'funnel',
        name: 'Funnel Chart',
        description: 'Shows conversion rates through process steps',
        supportedMetrics: ['single'],
        supportedDimensions: ['category'],
        useCase: 'Conversion analysis, sales funnel',
      },
      {
        type: 'histogram',
        name: 'Histogram',
        description: 'Shows distribution of values in bins',
        supportedMetrics: ['single'],
        supportedDimensions: ['none'],
        useCase: 'Distribution analysis, data quality',
      },
      {
        type: 'treemap',
        name: 'Treemap',
        description: 'Shows hierarchical data as nested rectangles',
        supportedMetrics: ['single'],
        supportedDimensions: ['hierarchical'],
        useCase: 'Hierarchical data, file sizes, market cap',
      },
    ];

    res.json({ chartTypes });

  } catch (error) {
    logger.error('Failed to get chart types:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;