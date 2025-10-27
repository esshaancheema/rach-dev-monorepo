import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { CodeController } from '../controllers/code.controller';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';

const generateCodeSchema = z.object({
  body: z.object({
    prompt: z.string().min(10).max(2000),
    language: z.string().optional(),
    framework: z.string().optional(),
    style: z.enum(['function', 'class', 'module']).optional(),
    context: z.string().optional(),
    includeTests: z.boolean().default(false),
    includeComments: z.boolean().default(true),
    followConventions: z.boolean().default(true),
  }),
});

const analyzeCodeSchema = z.object({
  body: z.object({
    code: z.string().min(1).max(50000),
    language: z.string().optional(),
    analysisType: z.enum(['review', 'security', 'performance', 'bugs', 'style']),
    severity: z.enum(['low', 'medium', 'high', 'all']).default('all'),
    includeFixSuggestions: z.boolean().default(true),
  }),
});

const optimizeCodeSchema = z.object({
  body: z.object({
    code: z.string().min(1).max(50000),
    language: z.string().optional(),
    optimizationType: z.enum(['performance', 'readability', 'memory', 'maintainability']),
    preserveFunctionality: z.boolean().default(true),
  }),
});

const refactorCodeSchema = z.object({
  body: z.object({
    code: z.string().min(1).max(50000),
    language: z.string().optional(),
    refactorType: z.enum(['extract-function', 'rename-variable', 'simplify', 'modernize']),
    targetPattern: z.string().optional(),
    newName: z.string().optional(),
  }),
});

const explainCodeSchema = z.object({
  body: z.object({
    code: z.string().min(1).max(50000),
    language: z.string().optional(),
    level: z.enum(['beginner', 'intermediate', 'advanced']).default('intermediate'),
    includeExamples: z.boolean().default(false),
  }),
});

const generateTestsSchema = z.object({
  body: z.object({
    code: z.string().min(1).max(50000),
    language: z.string().optional(),
    testFramework: z.string().optional(),
    coverageLevel: z.enum(['basic', 'comprehensive', 'edge-cases']).default('comprehensive'),
    includeSetup: z.boolean().default(true),
    includeMocks: z.boolean().default(false),
  }),
});

const convertCodeSchema = z.object({
  body: z.object({
    code: z.string().min(1).max(50000),
    fromLanguage: z.string(),
    toLanguage: z.string(),
    preserveComments: z.boolean().default(true),
    includeExplanation: z.boolean().default(false),
  }),
});

export async function codeRoutes(app: FastifyInstance) {
  const controller = new CodeController();

  // Generate code from prompt
  app.post(
    '/generate',
    {
      preHandler: [authenticate, validateRequest(generateCodeSchema)],
    },
    controller.generateCode.bind(controller)
  );

  // Analyze code for issues
  app.post(
    '/analyze',
    {
      preHandler: [authenticate, validateRequest(analyzeCodeSchema)],
    },
    controller.analyzeCode.bind(controller)
  );

  // Optimize code
  app.post(
    '/optimize',
    {
      preHandler: [authenticate, validateRequest(optimizeCodeSchema)],
    },
    controller.optimizeCode.bind(controller)
  );

  // Refactor code
  app.post(
    '/refactor',
    {
      preHandler: [authenticate, validateRequest(refactorCodeSchema)],
    },
    controller.refactorCode.bind(controller)
  );

  // Explain code
  app.post(
    '/explain',
    {
      preHandler: [authenticate, validateRequest(explainCodeSchema)],
    },
    controller.explainCode.bind(controller)
  );

  // Generate unit tests
  app.post(
    '/tests/generate',
    {
      preHandler: [authenticate, validateRequest(generateTestsSchema)],
    },
    controller.generateTests.bind(controller)
  );

  // Convert code between languages
  app.post(
    '/convert',
    {
      preHandler: [authenticate, validateRequest(convertCodeSchema)],
    },
    controller.convertCode.bind(controller)
  );

  // Get supported languages and frameworks
  app.get(
    '/languages',
    {
      preHandler: [authenticate],
    },
    controller.getSupportedLanguages.bind(controller)
  );
}