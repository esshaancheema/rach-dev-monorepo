import { FastifyRequest, FastifyReply } from 'fastify';
import { AIService } from '../services/ai.service';
import { logger } from '../utils/logger';

export class ChatController {
  private aiService: AIService;

  constructor() {
    this.aiService = new AIService();
  }

  async createCompletion(
    request: FastifyRequest<{
      Body: {
        messages: Array<{
          role: 'system' | 'user' | 'assistant';
          content: string;
        }>;
        model?: string;
        maxTokens?: number;
        temperature?: number;
        stream?: boolean;
        conversationId?: string;
        context?: {
          projectId?: string;
          fileContext?: Array<{
            filename: string;
            content: string;
            language?: string;
          }>;
          codebase?: {
            language: string;
            framework?: string;
            dependencies?: string[];
          };
        };
      };
    }>,
    reply: FastifyReply
  ) {
    try {
      const userId = request.user!.id;
      
      // Enhance messages with context if provided
      const enhancedMessages = this.enhanceMessagesWithContext(
        request.body.messages,
        request.body.context
      );

      const result = await this.aiService.createChatCompletion({
        userId,
        messages: enhancedMessages,
        model: request.body.model,
        maxTokens: request.body.maxTokens,
        temperature: request.body.temperature,
        conversationId: request.body.conversationId,
      });

      return reply.code(200).send({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error({ error, userId: request.user?.id }, 'Failed to create completion');
      
      if (error instanceof Error && error.message.includes('rate limit')) {
        return reply.code(429).send({
          success: false,
          error: error.message,
          retryAfter: 3600, // 1 hour
        });
      }

      if (error instanceof Error && error.message.includes('quota')) {
        return reply.code(402).send({
          success: false,
          error: 'Usage quota exceeded',
        });
      }

      return reply.code(500).send({
        success: false,
        error: 'Failed to create completion',
      });
    }
  }

  async createStreamCompletion(
    request: FastifyRequest<{
      Body: {
        messages: Array<{
          role: 'system' | 'user' | 'assistant';
          content: string;
        }>;
        model?: string;
        maxTokens?: number;
        temperature?: number;
        conversationId?: string;
      };
    }>,
    reply: FastifyReply
  ) {
    try {
      const userId = request.user!.id;

      // Set up Server-Sent Events
      reply.type('text/event-stream');
      reply.header('Cache-Control', 'no-cache');
      reply.header('Connection', 'keep-alive');
      reply.header('Access-Control-Allow-Origin', '*');

      const stream = await this.aiService.createStreamingCompletion({
        userId,
        messages: request.body.messages,
        model: request.body.model,
        maxTokens: request.body.maxTokens,
        temperature: request.body.temperature,
        conversationId: request.body.conversationId,
      });

      // Send initial event
      reply.raw.write('data: {"type":"start"}\n\n');

      try {
        for await (const chunk of stream) {
          const eventData = JSON.stringify({
            type: 'content',
            content: chunk,
          });
          reply.raw.write(`data: ${eventData}\n\n`);
        }

        // Send completion event
        reply.raw.write('data: {"type":"done"}\n\n');
      } catch (streamError) {
        const errorData = JSON.stringify({
          type: 'error',
          error: streamError instanceof Error ? streamError.message : 'Stream error',
        });
        reply.raw.write(`data: ${errorData}\n\n`);
      }

      reply.raw.end();
    } catch (error) {
      logger.error({ error, userId: request.user?.id }, 'Failed to create streaming completion');
      
      if (!reply.sent) {
        return reply.code(500).send({
          success: false,
          error: 'Failed to create streaming completion',
        });
      }
    }
  }

  async getModels(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const models = await this.aiService.getAvailableModels();

      return reply.code(200).send({
        success: true,
        data: models,
      });
    } catch (error) {
      logger.error({ error }, 'Failed to get models');
      
      return reply.code(500).send({
        success: false,
        error: 'Failed to get models',
      });
    }
  }

  async getUsage(
    request: FastifyRequest<{
      Querystring: {
        days: number;
        model?: string;
      };
    }>,
    reply: FastifyReply
  ) {
    try {
      const userId = request.user!.id;
      const { days, model } = request.query;

      const usage = await this.aiService.getUserUsage(userId, days, model);

      return reply.code(200).send({
        success: true,
        data: usage,
      });
    } catch (error) {
      logger.error({ error, userId: request.user?.id }, 'Failed to get usage');
      
      return reply.code(500).send({
        success: false,
        error: 'Failed to get usage statistics',
      });
    }
  }

  async getProviderStatus(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const status = await this.aiService.getProviderStatus();

      return reply.code(200).send({
        success: true,
        data: status,
      });
    } catch (error) {
      logger.error({ error }, 'Failed to get provider status');
      
      return reply.code(500).send({
        success: false,
        error: 'Failed to get provider status',
      });
    }
  }

  private enhanceMessagesWithContext(
    messages: Array<{ role: string; content: string }>,
    context?: {
      projectId?: string;
      fileContext?: Array<{
        filename: string;
        content: string;
        language?: string;
      }>;
      codebase?: {
        language: string;
        framework?: string;
        dependencies?: string[];
      };
    }
  ): Array<{ role: string; content: string }> {
    if (!context) {
      return messages;
    }

    let contextInfo = '';

    if (context.codebase) {
      contextInfo += `\nCodebase Context:\n`;
      contextInfo += `- Language: ${context.codebase.language}\n`;
      if (context.codebase.framework) {
        contextInfo += `- Framework: ${context.codebase.framework}\n`;
      }
      if (context.codebase.dependencies?.length) {
        contextInfo += `- Dependencies: ${context.codebase.dependencies.join(', ')}\n`;
      }
    }

    if (context.fileContext?.length) {
      contextInfo += `\nFile Context:\n`;
      context.fileContext.forEach(file => {
        contextInfo += `\n--- ${file.filename} ${file.language ? `(${file.language})` : ''} ---\n`;
        contextInfo += file.content;
        contextInfo += '\n--- End of file ---\n';
      });
    }

    if (contextInfo) {
      // Add context to the first user message or create a system message
      const enhancedMessages = [...messages];
      if (enhancedMessages.length > 0 && enhancedMessages[0].role === 'user') {
        enhancedMessages[0] = {
          ...enhancedMessages[0],
          content: contextInfo + '\n\n' + enhancedMessages[0].content,
        };
      } else {
        enhancedMessages.unshift({
          role: 'system',
          content: `You are an AI assistant helping with code development. Here is the current context:${contextInfo}`,
        });
      }
      return enhancedMessages;
    }

    return messages;
  }
}