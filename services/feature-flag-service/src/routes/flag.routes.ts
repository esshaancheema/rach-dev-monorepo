import { Router } from 'express';
import { flagController } from '../controllers/flag.controller';
import { validateRequest } from '../middleware/validation';
import { flagSchemas } from '../schemas/flag.schemas';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Feature Flags
 *   description: Feature flag management endpoints
 */

/**
 * @swagger
 * /api/flags:
 *   get:
 *     summary: Get all feature flags
 *     tags: [Feature Flags]
 *     parameters:
 *       - in: query
 *         name: environment
 *         schema:
 *           type: string
 *         description: Environment filter
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, active, inactive, archived]
 *         description: Status filter
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: Tag filter
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Number of flags to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Number of flags to skip
 *     responses:
 *       200:
 *         description: List of feature flags
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 flags:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/FeatureFlag'
 *                 total:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 offset:
 *                   type: integer
 */
router.get('/', flagController.getAllFlags);

/**
 * @swagger
 * /api/flags/{flagKey}:
 *   get:
 *     summary: Get a specific feature flag
 *     tags: [Feature Flags]
 *     parameters:
 *       - in: path
 *         name: flagKey
 *         required: true
 *         schema:
 *           type: string
 *         description: The feature flag key
 *     responses:
 *       200:
 *         description: Feature flag details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FeatureFlag'
 *       404:
 *         description: Feature flag not found
 */
router.get('/:flagKey', flagController.getFlag);

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
 *             $ref: '#/components/schemas/CreateFlagRequest'
 *     responses:
 *       201:
 *         description: Feature flag created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FeatureFlag'
 *       400:
 *         description: Invalid request data
 *       409:
 *         description: Feature flag with this key already exists
 */
router.post('/', validateRequest(flagSchemas.createFlag), flagController.createFlag);

/**
 * @swagger
 * /api/flags/{flagKey}:
 *   put:
 *     summary: Update a feature flag
 *     tags: [Feature Flags]
 *     parameters:
 *       - in: path
 *         name: flagKey
 *         required: true
 *         schema:
 *           type: string
 *         description: The feature flag key
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateFlagRequest'
 *     responses:
 *       200:
 *         description: Feature flag updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FeatureFlag'
 *       404:
 *         description: Feature flag not found
 *       400:
 *         description: Invalid request data
 */
router.put('/:flagKey', validateRequest(flagSchemas.updateFlag), flagController.updateFlag);

/**
 * @swagger
 * /api/flags/{flagKey}:
 *   delete:
 *     summary: Delete a feature flag
 *     tags: [Feature Flags]
 *     parameters:
 *       - in: path
 *         name: flagKey
 *         required: true
 *         schema:
 *           type: string
 *         description: The feature flag key
 *     responses:
 *       204:
 *         description: Feature flag deleted successfully
 *       404:
 *         description: Feature flag not found
 */
router.delete('/:flagKey', flagController.deleteFlag);

/**
 * @swagger
 * /api/flags/{flagKey}/evaluate:
 *   post:
 *     summary: Evaluate a feature flag for a user
 *     tags: [Feature Flags]
 *     parameters:
 *       - in: path
 *         name: flagKey
 *         required: true
 *         schema:
 *           type: string
 *         description: The feature flag key
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EvaluationRequest'
 *     responses:
 *       200:
 *         description: Flag evaluation result
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EvaluationResult'
 *       404:
 *         description: Feature flag not found
 */
router.post('/:flagKey/evaluate', validateRequest(flagSchemas.evaluateFlag), flagController.evaluateFlag);

/**
 * @swagger
 * /api/flags/evaluate/bulk:
 *   post:
 *     summary: Evaluate multiple feature flags for a user
 *     tags: [Feature Flags]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BulkEvaluationRequest'
 *     responses:
 *       200:
 *         description: Bulk evaluation results
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BulkEvaluationResult'
 */
router.post('/evaluate/bulk', validateRequest(flagSchemas.bulkEvaluate), flagController.bulkEvaluateFlags);

/**
 * @swagger
 * /api/flags/{flagKey}/toggle:
 *   post:
 *     summary: Toggle a feature flag status
 *     tags: [Feature Flags]
 *     parameters:
 *       - in: path
 *         name: flagKey
 *         required: true
 *         schema:
 *           type: string
 *         description: The feature flag key
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - enabled
 *             properties:
 *               enabled:
 *                 type: boolean
 *                 description: Whether to enable or disable the flag
 *     responses:
 *       200:
 *         description: Feature flag toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FeatureFlag'
 *       404:
 *         description: Feature flag not found
 */
router.post('/:flagKey/toggle', validateRequest(flagSchemas.toggleFlag), flagController.toggleFlag);

/**
 * @swagger
 * /api/flags/{flagKey}/variants:
 *   post:
 *     summary: Add a variant to a feature flag
 *     tags: [Feature Flags]
 *     parameters:
 *       - in: path
 *         name: flagKey
 *         required: true
 *         schema:
 *           type: string
 *         description: The feature flag key
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FlagVariant'
 *     responses:
 *       200:
 *         description: Variant added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FeatureFlag'
 *       404:
 *         description: Feature flag not found
 */
router.post('/:flagKey/variants', validateRequest(flagSchemas.addVariant), flagController.addVariant);

/**
 * @swagger
 * /api/flags/{flagKey}/variants/{variantId}:
 *   put:
 *     summary: Update a flag variant
 *     tags: [Feature Flags]
 *     parameters:
 *       - in: path
 *         name: flagKey
 *         required: true
 *         schema:
 *           type: string
 *         description: The feature flag key
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema:
 *           type: string
 *         description: The variant ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateVariantRequest'
 *     responses:
 *       200:
 *         description: Variant updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FeatureFlag'
 *       404:
 *         description: Feature flag or variant not found
 */
router.put('/:flagKey/variants/:variantId', validateRequest(flagSchemas.updateVariant), flagController.updateVariant);

/**
 * @swagger
 * /api/flags/{flagKey}/variants/{variantId}:
 *   delete:
 *     summary: Remove a variant from a feature flag
 *     tags: [Feature Flags]
 *     parameters:
 *       - in: path
 *         name: flagKey
 *         required: true
 *         schema:
 *           type: string
 *         description: The feature flag key
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema:
 *           type: string
 *         description: The variant ID
 *     responses:
 *       200:
 *         description: Variant removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FeatureFlag'
 *       404:
 *         description: Feature flag or variant not found
 */
router.delete('/:flagKey/variants/:variantId', flagController.removeVariant);

/**
 * @swagger
 * /api/flags/{flagKey}/rules:
 *   post:
 *     summary: Add a rule to a feature flag
 *     tags: [Feature Flags]
 *     parameters:
 *       - in: path
 *         name: flagKey
 *         required: true
 *         schema:
 *           type: string
 *         description: The feature flag key
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FlagRule'
 *     responses:
 *       200:
 *         description: Rule added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FeatureFlag'
 *       404:
 *         description: Feature flag not found
 */
router.post('/:flagKey/rules', validateRequest(flagSchemas.addRule), flagController.addRule);

/**
 * @swagger
 * /api/flags/{flagKey}/rules/{ruleId}:
 *   put:
 *     summary: Update a flag rule
 *     tags: [Feature Flags]
 *     parameters:
 *       - in: path
 *         name: flagKey
 *         required: true
 *         schema:
 *           type: string
 *         description: The feature flag key
 *       - in: path
 *         name: ruleId
 *         required: true
 *         schema:
 *           type: string
 *         description: The rule ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateRuleRequest'
 *     responses:
 *       200:
 *         description: Rule updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FeatureFlag'
 *       404:
 *         description: Feature flag or rule not found
 */
router.put('/:flagKey/rules/:ruleId', validateRequest(flagSchemas.updateRule), flagController.updateRule);

/**
 * @swagger
 * /api/flags/{flagKey}/rules/{ruleId}:
 *   delete:
 *     summary: Remove a rule from a feature flag
 *     tags: [Feature Flags]
 *     parameters:
 *       - in: path
 *         name: flagKey
 *         required: true
 *         schema:
 *           type: string
 *         description: The feature flag key
 *       - in: path
 *         name: ruleId
 *         required: true
 *         schema:
 *           type: string
 *         description: The rule ID
 *     responses:
 *       200:
 *         description: Rule removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FeatureFlag'
 *       404:
 *         description: Feature flag or rule not found
 */
router.delete('/:flagKey/rules/:ruleId', flagController.removeRule);

/**
 * @swagger
 * components:
 *   schemas:
 *     FeatureFlag:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         key:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         type:
 *           type: string
 *           enum: [boolean, string, number, json, multivariate]
 *         status:
 *           type: string
 *           enum: [draft, active, inactive, archived]
 *         variants:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/FlagVariant'
 *         defaultVariant:
 *           type: string
 *         rules:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/FlagRule'
 *         rolloutPercentage:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         createdBy:
 *           type: string
 *         environment:
 *           type: string
 *
 *     FlagVariant:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         key:
 *           type: string
 *         name:
 *           type: string
 *         value:
 *           oneOf:
 *             - type: boolean
 *             - type: string
 *             - type: number
 *             - type: object
 *         weight:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *         description:
 *           type: string
 *
 *     FlagRule:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         condition:
 *           $ref: '#/components/schemas/RuleCondition'
 *         variant:
 *           type: string
 *         enabled:
 *           type: boolean
 *         priority:
 *           type: number
 *
 *     RuleCondition:
 *       type: object
 *       properties:
 *         operator:
 *           type: string
 *           enum: [AND, OR]
 *         conditions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ConditionClause'
 *
 *     ConditionClause:
 *       type: object
 *       properties:
 *         attribute:
 *           type: string
 *         operator:
 *           type: string
 *           enum: [equals, not_equals, in, not_in, greater_than, less_than, contains, regex]
 *         value:
 *           oneOf:
 *             - type: string
 *             - type: number
 *             - type: boolean
 *             - type: array
 *         values:
 *           type: array
 *
 *     EvaluationRequest:
 *       type: object
 *       required:
 *         - userAttributes
 *       properties:
 *         userId:
 *           type: string
 *         sessionId:
 *           type: string
 *         userAttributes:
 *           type: object
 *           additionalProperties: true
 *         environment:
 *           type: string
 *           default: production
 *
 *     EvaluationResult:
 *       type: object
 *       properties:
 *         flagKey:
 *           type: string
 *         variant:
 *           type: string
 *         value:
 *           oneOf:
 *             - type: boolean
 *             - type: string
 *             - type: number
 *             - type: object
 *         reason:
 *           type: string
 *           enum: [rule_match, rollout, default, flag_disabled, flag_not_found, error]
 *         ruleId:
 *           type: string
 *         evaluationId:
 *           type: string
 *         timestamp:
 *           type: string
 *           format: date-time
 *
 *     CreateFlagRequest:
 *       type: object
 *       required:
 *         - key
 *         - name
 *         - type
 *         - variants
 *         - defaultVariant
 *       properties:
 *         key:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         type:
 *           type: string
 *           enum: [boolean, string, number, json, multivariate]
 *         variants:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/FlagVariant'
 *         defaultVariant:
 *           type: string
 *         rolloutPercentage:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *           default: 0
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         environment:
 *           type: string
 *           default: production
 *
 *     UpdateFlagRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         status:
 *           type: string
 *           enum: [draft, active, inactive, archived]
 *         rolloutPercentage:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *
 *     BulkEvaluationRequest:
 *       type: object
 *       required:
 *         - flagKeys
 *         - userAttributes
 *       properties:
 *         flagKeys:
 *           type: array
 *           items:
 *             type: string
 *         userId:
 *           type: string
 *         sessionId:
 *           type: string
 *         userAttributes:
 *           type: object
 *           additionalProperties: true
 *         environment:
 *           type: string
 *           default: production
 *
 *     BulkEvaluationResult:
 *       type: object
 *       properties:
 *         results:
 *           type: object
 *           additionalProperties:
 *             $ref: '#/components/schemas/EvaluationResult'
 *         evaluationId:
 *           type: string
 *         timestamp:
 *           type: string
 *           format: date-time
 */

export default router;