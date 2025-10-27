import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ChatController } from '../controllers/chat.controller';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';

const completionSchema = z.object({
  body: z.object({
    messages: z.array(z.object({
      role: z.enum(['system', 'user', 'assistant']),
      content: z.string().min(1),
    })).min(1),
    model: z.enum(['gpt-4', 'gpt-3.5-turbo', 'claude-3-sonnet', 'claude-3-haiku', 'gemini-pro']).optional(),
    maxTokens: z.number().min(1).max(8000).optional(),
    temperature: z.number().min(0).max(2).optional(),
    stream: z.boolean().optional(),
    conversationId: z.string().optional(),
    context: z.object({
      projectId: z.string().optional(),
      fileContext: z.array(z.object({
        filename: z.string(),
        content: z.string(),
        language: z.string().optional(),
      })).optional(),
      codebase: z.object({
        language: z.string(),
        framework: z.string().optional(),
        dependencies: z.array(z.string()).optional(),
      }).optional(),
    }).optional(),
  }),
});

const streamCompletionSchema = z.object({
  body: z.object({
    messages: z.array(z.object({
      role: z.enum(['system', 'user', 'assistant']),
      content: z.string().min(1),
    })).min(1),
    model: z.enum(['gpt-4', 'gpt-3.5-turbo', 'claude-3-sonnet', 'claude-3-haiku', 'gemini-pro']).optional(),
    maxTokens: z.number().min(1).max(8000).optional(),
    temperature: z.number().min(0).max(2).optional(),
    conversationId: z.string().optional(),
  }),
});

export async function chatRoutes(app: FastifyInstance) {
  const controller = new ChatController();

  // Create chat completion
  app.post(
    '/completions',
    {
      preHandler: [authenticate, validateRequest(completionSchema)],
    },
    controller.createCompletion.bind(controller)
  );

  // Create streaming chat completion
  app.post(
    '/completions/stream',
    {
      preHandler: [authenticate, validateRequest(streamCompletionSchema)],
    },
    controller.createStreamCompletion.bind(controller)
  );

  // Get model capabilities
  app.get(
    '/models',
    {
      preHandler: [authenticate],
    },
    controller.getModels.bind(controller)
  );

  // Get usage statistics
  app.get(
    '/usage',
    {
      preHandler: [authenticate],
    },
    controller.getUsage.bind(controller)
  );

  // Get provider status
  app.get(
    '/status',
    {
      preHandler: [authenticate],
    },
    controller.getProviderStatus.bind(controller)
  );
}