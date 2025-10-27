import OpenAI from 'openai';
import { openaiConfig } from '../config';
import { logger } from '../utils/logger';
import { AIRedisService } from '../utils/redis';

export interface OpenAICompletionRequest {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
  userId: string;
  conversationId?: string;
}

export interface OpenAICompletionResponse {
  id: string;
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason: string;
  createdAt: string;
}

export interface OpenAIImageRequest {
  prompt: string;
  size?: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792';
  quality?: 'standard' | 'hd';
  style?: 'vivid' | 'natural';
  n?: number;
  userId: string;
}

export interface OpenAIImageResponse {
  id: string;
  images: Array<{
    url: string;
    revisedPrompt?: string;
  }>;
  createdAt: string;
}

export class OpenAIService {
  private client: OpenAI | null = null;

  constructor() {
    if (openaiConfig.enabled) {
      this.client = new OpenAI({
        apiKey: openaiConfig.apiKey,
        organization: openaiConfig.organization,
      });
      logger.info('OpenAI service initialized');
    } else {
      logger.warn('OpenAI service disabled - missing API key');
    }
  }

  private ensureClient(): OpenAI {
    if (!this.client) {
      throw new Error('OpenAI service is not enabled or configured');
    }
    return this.client;
  }

  async createCompletion(request: OpenAICompletionRequest): Promise<OpenAICompletionResponse> {
    const client = this.ensureClient();
    const startTime = Date.now();

    try {
      // Check rate limits
      const rateLimit = await AIRedisService.checkProviderRateLimit(
        'openai',
        request.userId,
        60, // 60 requests per hour
        3600
      );

      if (!rateLimit.allowed) {
        throw new Error(`OpenAI rate limit exceeded. Reset at ${new Date(rateLimit.resetTime).toISOString()}`);
      }

      // Create request hash for caching
      const requestHash = this.createRequestHash(request);
      
      // Check cache for repeated requests
      const cachedResponse = await AIRedisService.getCachedResponse(requestHash);
      if (cachedResponse) {
        logger.debug({ userId: request.userId, cached: true }, 'Returning cached OpenAI response');
        return cachedResponse;
      }

      const completion = await client.chat.completions.create({
        model: request.model || openaiConfig.defaultModel,
        messages: request.messages,
        max_tokens: request.maxTokens || openaiConfig.maxTokens,
        temperature: request.temperature ?? openaiConfig.temperature,
        stream: false,
      });

      const choice = completion.choices[0];
      if (!choice || !choice.message?.content) {
        throw new Error('Invalid response from OpenAI');
      }

      const response: OpenAICompletionResponse = {
        id: completion.id,
        content: choice.message.content,
        model: completion.model,
        usage: {
          promptTokens: completion.usage?.prompt_tokens || 0,
          completionTokens: completion.usage?.completion_tokens || 0,
          totalTokens: completion.usage?.total_tokens || 0,
        },
        finishReason: choice.finish_reason || 'unknown',
        createdAt: new Date().toISOString(),
      };

      // Track usage
      await AIRedisService.trackModelUsage(
        'openai',
        response.model,
        request.userId,
        response.usage.totalTokens
      );

      // Cache response for 30 minutes
      await AIRedisService.cacheResponse(requestHash, response, 1800);

      // Update conversation memory if provided
      if (request.conversationId) {
        await this.updateConversationMemory(
          request.userId,
          request.conversationId,
          request.messages,
          choice.message.content
        );
      }

      const responseTime = Date.now() - startTime;
      await AIRedisService.setProviderStatus('openai', 'healthy', responseTime);

      logger.info({
        userId: request.userId,
        model: response.model,
        tokens: response.usage.totalTokens,
        responseTime,
      }, 'OpenAI completion successful');

      return response;

    } catch (error) {
      const responseTime = Date.now() - startTime;
      await AIRedisService.setProviderStatus('openai', 'unhealthy', responseTime);
      
      logger.error({
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: request.userId,
        responseTime,
      }, 'OpenAI completion failed');

      throw error;
    }
  }

  async createImage(request: OpenAIImageRequest): Promise<OpenAIImageResponse> {
    const client = this.ensureClient();
    const startTime = Date.now();

    try {
      // Check rate limits (stricter for image generation)
      const rateLimit = await AIRedisService.checkProviderRateLimit(
        'openai_images',
        request.userId,
        10, // 10 images per hour
        3600
      );

      if (!rateLimit.allowed) {
        throw new Error(`OpenAI image rate limit exceeded. Reset at ${new Date(rateLimit.resetTime).toISOString()}`);
      }

      const imageResponse = await client.images.generate({
        prompt: request.prompt,
        size: request.size || '1024x1024',
        quality: request.quality || 'standard',
        style: request.style || 'vivid',
        n: request.n || 1,
        response_format: 'url',
      });

      const response: OpenAIImageResponse = {
        id: `img_${Date.now()}`,
        images: imageResponse.data.map(img => ({
          url: img.url || '',
          revisedPrompt: img.revised_prompt,
        })),
        createdAt: new Date().toISOString(),
      };

      // Track usage (estimate tokens for image generation)
      await AIRedisService.trackModelUsage(
        'openai',
        'dall-e-3',
        request.userId,
        1000 // Estimate tokens for image generation
      );

      const responseTime = Date.now() - startTime;
      await AIRedisService.setProviderStatus('openai', 'healthy', responseTime);

      logger.info({
        userId: request.userId,
        imagesGenerated: response.images.length,
        responseTime,
      }, 'OpenAI image generation successful');

      return response;

    } catch (error) {
      const responseTime = Date.now() - startTime;
      await AIRedisService.setProviderStatus('openai', 'unhealthy', responseTime);
      
      logger.error({
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: request.userId,
        responseTime,
      }, 'OpenAI image generation failed');

      throw error;
    }
  }

  async createStreamCompletion(request: OpenAICompletionRequest): Promise<AsyncIterableIterator<string>> {
    const client = this.ensureClient();
    
    // Check rate limits
    const rateLimit = await AIRedisService.checkProviderRateLimit(
      'openai',
      request.userId,
      60,
      3600
    );

    if (!rateLimit.allowed) {
      throw new Error(`OpenAI rate limit exceeded. Reset at ${new Date(rateLimit.resetTime).toISOString()}`);
    }

    const stream = await client.chat.completions.create({
      model: request.model || openaiConfig.defaultModel,
      messages: request.messages,
      max_tokens: request.maxTokens || openaiConfig.maxTokens,
      temperature: request.temperature ?? openaiConfig.temperature,
      stream: true,
    });

    return this.processStream(stream, request.userId);
  }

  private async *processStream(
    stream: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>,
    userId: string
  ): AsyncGenerator<string, void, unknown> {
    let totalTokens = 0;
    
    try {
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          totalTokens += this.estimateTokens(content);
          yield content;
        }
      }

      // Track estimated usage for streaming
      await AIRedisService.trackModelUsage(
        'openai',
        openaiConfig.defaultModel,
        userId,
        totalTokens
      );

    } catch (error) {
      logger.error({
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
      }, 'OpenAI streaming failed');
      throw error;
    }
  }

  private createRequestHash(request: OpenAICompletionRequest): string {
    const hashData = {
      messages: request.messages,
      model: request.model || openaiConfig.defaultModel,
      maxTokens: request.maxTokens || openaiConfig.maxTokens,
      temperature: request.temperature ?? openaiConfig.temperature,
    };
    
    // Simple hash implementation
    return Buffer.from(JSON.stringify(hashData)).toString('base64');
  }

  private async updateConversationMemory(
    userId: string,
    conversationId: string,
    messages: any[],
    assistantResponse: string
  ): Promise<void> {
    try {
      const conversation = await AIRedisService.getConversation(userId, conversationId) || [];
      
      // Add user messages and assistant response
      const updatedConversation = [
        ...conversation,
        ...messages.slice(-1), // Only add the latest user message
        { role: 'assistant', content: assistantResponse, timestamp: new Date().toISOString() },
      ];

      // Keep only last 20 messages to manage memory
      const limitedConversation = updatedConversation.slice(-20);
      
      await AIRedisService.setConversation(userId, conversationId, limitedConversation, 86400); // 24 hours
    } catch (error) {
      logger.warn({ error, userId, conversationId }, 'Failed to update conversation memory');
    }
  }

  private estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  async getConversationHistory(userId: string, conversationId: string): Promise<any[] | null> {
    return await AIRedisService.getConversation(userId, conversationId);
  }

  async clearConversationHistory(userId: string, conversationId: string): Promise<void> {
    await AIRedisService.deleteConversation(userId, conversationId);
  }

  async getUsageStats(userId: string, days: number = 30): Promise<any> {
    const models = ['gpt-4', 'gpt-3.5-turbo', 'dall-e-3'];
    const stats: any = {};

    for (const model of models) {
      stats[model] = await AIRedisService.getModelUsage('openai', model, userId, days);
    }

    return stats;
  }

  isEnabled(): boolean {
    return openaiConfig.enabled;
  }

  async getStatus(): Promise<any> {
    const status = await AIRedisService.getProviderStatus('openai');
    return {
      enabled: this.isEnabled(),
      ...status,
    };
  }
}