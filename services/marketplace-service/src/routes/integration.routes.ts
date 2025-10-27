import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { IntegrationService } from '../services/integration.service';
import { PackageService } from '../services/package.service';
import { SecurityService } from '../services/security.service';
import { logger } from '../utils/logger';
import { IntegrationStatus, IntegrationCategory } from '../models/integration.model';

const router = Router();

// Initialize services (in production, these would be injected via DI)
const integrationService = new IntegrationService(null as any, null as any, null as any, null as any, null as any);
const packageService = new PackageService();
const securityService = new SecurityService();

/**
 * @swagger
 * /api/integrations:
 *   get:
 *     summary: Get all integrations in the marketplace
 *     tags: [Integrations]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [productivity, communication, analytics, security, finance, marketing, sales, support, development, design, automation, data, other]
 *         description: Filter by category
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for integration names, descriptions, or tags
 *       - in: query
 *         name: featured
 *         schema:
 *           type: boolean
 *         description: Show only featured integrations
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, createdAt, updatedAt, totalInstalls, averageRating]
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
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
 *         description: List of integrations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 integrations:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Integration'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 */
router.get('/', [
  query('category').optional().isIn(Object.values(IntegrationCategory)),
  query('search').optional().isString().trim(),
  query('featured').optional().isBoolean(),
  query('sortBy').optional().isIn(['name', 'createdAt', 'updatedAt', 'totalInstalls', 'averageRating']),
  query('sortOrder').optional().isIn(['asc', 'desc']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const filters = {
      category: req.query.category as string,
      search: req.query.search as string,
      featured: req.query.featured === 'true',
      sortBy: req.query.sortBy as string,
      sortOrder: req.query.sortOrder as 'asc' | 'desc',
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
      status: IntegrationStatus.PUBLISHED, // Only show published integrations
    };

    const result = await integrationService.getIntegrations(filters);

    res.json({
      integrations: result.integrations,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        pages: Math.ceil(result.total / result.limit),
      },
    });

  } catch (error) {
    logger.error('Failed to get integrations', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/integrations/{id}:
 *   get:
 *     summary: Get a specific integration
 *     tags: [Integrations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Integration ID
 *     responses:
 *       200:
 *         description: Integration details
 *       404:
 *         description: Integration not found
 */
router.get('/:id', [
  param('id').isUUID().withMessage('Invalid integration ID format'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const integration = await integrationService.getIntegration(id);

    if (!integration) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    // Only show published integrations to non-developers
    if (integration.status !== IntegrationStatus.PUBLISHED && 
        integration.developerId !== req.user?.id) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    res.json(integration);

  } catch (error) {
    logger.error('Failed to get integration', { integrationId: req.params.id, error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/integrations:
 *   post:
 *     summary: Create a new integration
 *     tags: [Integrations]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - category
 *               - package
 *               - pricing
 *               - dataProcessing
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 1000
 *               shortDescription:
 *                 type: string
 *                 maxLength: 200
 *               category:
 *                 type: string
 *                 enum: [productivity, communication, analytics, security, finance, marketing, sales, support, development, design, automation, data, other]
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               homepage:
 *                 type: string
 *                 format: uri
 *               supportUrl:
 *                 type: string
 *                 format: uri
 *               documentationUrl:
 *                 type: string
 *                 format: uri
 *               package:
 *                 type: string
 *                 format: binary
 *                 description: Integration package (ZIP or TAR.GZ)
 *               logo:
 *                 type: string
 *                 format: binary
 *               screenshots:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               videoUrl:
 *                 type: string
 *                 format: uri
 *               pricing:
 *                 type: object
 *               dataProcessing:
 *                 type: object
 *     responses:
 *       201:
 *         description: Integration created successfully
 *       400:
 *         description: Invalid input or package validation failed
 *       413:
 *         description: Package too large
 */
router.post('/', [
  body('name').trim().isLength({ min: 3, max: 100 }).withMessage('Name must be 3-100 characters'),
  body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be 10-1000 characters'),
  body('shortDescription').optional().trim().isLength({ max: 200 }).withMessage('Short description must be max 200 characters'),
  body('category').isIn(Object.values(IntegrationCategory)).withMessage('Invalid category'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('homepage').optional().isURL().withMessage('Homepage must be a valid URL'),
  body('supportUrl').optional().isURL().withMessage('Support URL must be a valid URL'),
  body('documentationUrl').optional().isURL().withMessage('Documentation URL must be a valid URL'),
  body('videoUrl').optional().isURL().withMessage('Video URL must be a valid URL'),
  body('pricing').isObject().withMessage('Pricing configuration is required'),
  body('dataProcessing').isObject().withMessage('Data processing information is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if package file is uploaded
    if (!req.files || !req.files.package) {
      return res.status(400).json({ error: 'Package file is required' });
    }

    const packageFile = Array.isArray(req.files.package) ? req.files.package[0] : req.files.package;
    
    // Validate package
    const validationResult = await packageService.validatePackage(packageFile.data);
    
    if (!validationResult.valid) {
      return res.status(400).json({
        error: 'Package validation failed',
        details: {
          errors: validationResult.errors,
          warnings: validationResult.warnings,
        },
      });
    }

    // Security scan
    const securityResult = await securityService.scanPackage(packageFile.data, validationResult.files);
    
    if (!securityResult.safe) {
      return res.status(400).json({
        error: 'Security scan failed',
        details: {
          threats: securityResult.threats,
          warnings: securityResult.warnings,
          score: securityResult.score,
        },
      });
    }

    // Parse JSON fields
    const integrationData = {
      ...req.body,
      tags: req.body.tags ? JSON.parse(req.body.tags) : [],
      pricing: JSON.parse(req.body.pricing),
      dataProcessing: JSON.parse(req.body.dataProcessing),
    };

    // Create integration
    const integration = await integrationService.createIntegration(
      integrationData,
      req.user!.id,
      packageFile.data
    );

    res.status(201).json(integration);

  } catch (error) {
    logger.error('Failed to create integration', { 
      userId: req.user?.id,
      error: error.message,
      stack: error.stack,
    });
    
    if (error.message.includes('Maximum number')) {
      return res.status(429).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/integrations/{id}:
 *   put:
 *     summary: Update an integration
 *     tags: [Integrations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Integration ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               package:
 *                 type: string
 *                 format: binary
 *                 description: Updated package (optional)
 *     responses:
 *       200:
 *         description: Integration updated successfully
 *       404:
 *         description: Integration not found
 *       403:
 *         description: Unauthorized to update this integration
 */
router.put('/:id', [
  param('id').isUUID().withMessage('Invalid integration ID format'),
  body('name').optional().trim().isLength({ min: 3, max: 100 }),
  body('description').optional().trim().isLength({ min: 10, max: 1000 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    let packageBuffer: Buffer | undefined;

    // Handle package update if provided
    if (req.files && req.files.package) {
      const packageFile = Array.isArray(req.files.package) ? req.files.package[0] : req.files.package;
      
      // Validate package
      const validationResult = await packageService.validatePackage(packageFile.data);
      
      if (!validationResult.valid) {
        return res.status(400).json({
          error: 'Package validation failed',
          details: {
            errors: validationResult.errors,
            warnings: validationResult.warnings,
          },
        });
      }

      // Security scan
      const securityResult = await securityService.scanPackage(packageFile.data, validationResult.files);
      
      if (!securityResult.safe) {
        return res.status(400).json({
          error: 'Security scan failed',
          details: {
            threats: securityResult.threats,
            warnings: securityResult.warnings,
            score: securityResult.score,
          },
        });
      }

      packageBuffer = packageFile.data;
    }

    // Parse JSON fields if present
    const updates = {
      ...req.body,
      tags: req.body.tags ? JSON.parse(req.body.tags) : undefined,
      pricing: req.body.pricing ? JSON.parse(req.body.pricing) : undefined,
      dataProcessing: req.body.dataProcessing ? JSON.parse(req.body.dataProcessing) : undefined,
    };

    const integration = await integrationService.updateIntegration(
      id,
      updates,
      req.user!.id,
      packageBuffer
    );

    res.json(integration);

  } catch (error) {
    logger.error('Failed to update integration', {
      integrationId: req.params.id,
      userId: req.user?.id,
      error: error.message,
    });

    if (error.message === 'Integration not found') {
      return res.status(404).json({ error: error.message });
    }
    
    if (error.message === 'Unauthorized to update this integration') {
      return res.status(403).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/integrations/{id}/publish:
 *   post:
 *     summary: Publish an integration to the marketplace
 *     tags: [Integrations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Integration ID
 *     responses:
 *       200:
 *         description: Integration published successfully
 *       400:
 *         description: Integration cannot be published
 *       404:
 *         description: Integration not found
 *       403:
 *         description: Unauthorized to publish this integration
 */
router.post('/:id/publish', [
  param('id').isUUID().withMessage('Invalid integration ID format'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const integration = await integrationService.publishIntegration(id, req.user!.id);

    res.json({
      message: 'Integration published successfully',
      integration,
    });

  } catch (error) {
    logger.error('Failed to publish integration', {
      integrationId: req.params.id,
      userId: req.user?.id,
      error: error.message,
    });

    if (error.message === 'Integration not found') {
      return res.status(404).json({ error: error.message });
    }
    
    if (error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
    
    if (error.message.includes('must be approved')) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/integrations/{id}/unpublish:
 *   post:
 *     summary: Unpublish an integration from the marketplace
 *     tags: [Integrations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Integration ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for unpublishing
 *     responses:
 *       200:
 *         description: Integration unpublished successfully
 *       404:
 *         description: Integration not found
 *       403:
 *         description: Unauthorized to unpublish this integration
 */
router.post('/:id/unpublish', [
  param('id').isUUID().withMessage('Invalid integration ID format'),
  body('reason').optional().isString().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { reason } = req.body;
    
    const integration = await integrationService.unpublishIntegration(id, req.user!.id, reason);

    res.json({
      message: 'Integration unpublished successfully',
      integration,
    });

  } catch (error) {
    logger.error('Failed to unpublish integration', {
      integrationId: req.params.id,
      userId: req.user?.id,
      error: error.message,
    });

    if (error.message === 'Integration not found') {
      return res.status(404).json({ error: error.message });
    }
    
    if (error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/integrations/{id}/analytics:
 *   get:
 *     summary: Get integration analytics (developer only)
 *     tags: [Integrations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Integration ID
 *       - in: query
 *         name: start
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for analytics
 *       - in: query
 *         name: end
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for analytics
 *     responses:
 *       200:
 *         description: Integration analytics data
 *       404:
 *         description: Integration not found
 *       403:
 *         description: Unauthorized to view analytics
 */
router.get('/:id/analytics', [
  param('id').isUUID().withMessage('Invalid integration ID format'),
  query('start').isISO8601().withMessage('Start date must be valid ISO 8601 date'),
  query('end').isISO8601().withMessage('End date must be valid ISO 8601 date'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const start = new Date(req.query.start as string);
    const end = new Date(req.query.end as string);

    const analytics = await integrationService.getIntegrationAnalytics(
      id,
      req.user!.id,
      { start, end }
    );

    res.json(analytics);

  } catch (error) {
    logger.error('Failed to get integration analytics', {
      integrationId: req.params.id,
      userId: req.user?.id,
      error: error.message,
    });

    if (error.message === 'Integration not found') {
      return res.status(404).json({ error: error.message });
    }
    
    if (error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;