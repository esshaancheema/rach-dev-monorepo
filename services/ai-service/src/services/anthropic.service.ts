import Anthropic from '@anthropic-ai/sdk';
import { anthropicConfig } from '../config';
import { logger } from '../utils/logger';
import { AIRedisService } from '../utils/redis';

export interface AnthropicCompletionRequest {
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  system?: string;
  stream?: boolean;
  userId: string;
  conversationId?: string;
}

export interface AnthropicCompletionResponse {
  id: string;
  content: string;
  model: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  stopReason: string;
  createdAt: string;
}

export class AnthropicService {
  private client: Anthropic | null = null;

  constructor() {
    if (anthropicConfig.enabled) {
      this.client = new Anthropic({
        apiKey: anthropicConfig.apiKey,
      });
      logger.info('Anthropic service initialized');
    } else {
      logger.warn('Anthropic service disabled - missing API key');
    }
  }

  private ensureClient(): Anthropic {
    if (!this.client) {
      throw new Error('Anthropic service is not enabled or configured');
    }
    return this.client;
  }

  async createCompletion(request: AnthropicCompletionRequest): Promise<AnthropicCompletionResponse> {
    const client = this.ensureClient();
    const startTime = Date.now();

    try {
      // Check rate limits
      const rateLimit = await AIRedisService.checkProviderRateLimit(
        'anthropic',
        request.userId,
        50, // 50 requests per hour
        3600
      );

      if (!rateLimit.allowed) {
        throw new Error(`Anthropic rate limit exceeded. Reset at ${new Date(rateLimit.resetTime).toISOString()}`);
      }

      // Create request hash for caching
      const requestHash = this.createRequestHash(request);
      
      // Check cache for repeated requests
      const cachedResponse = await AIRedisService.getCachedResponse(requestHash);
      if (cachedResponse) {
        logger.debug({ userId: request.userId, cached: true }, 'Returning cached Anthropic response');
        return cachedResponse;
      }

      const completion = await client.messages.create({
        model: request.model || anthropicConfig.defaultModel,
        max_tokens: request.maxTokens || anthropicConfig.maxTokens,
        temperature: request.temperature ?? anthropicConfig.temperature,
        system: request.system,
        messages: request.messages,
      });

      if (!completion.content[0] || completion.content[0].type !== 'text') {
        throw new Error('Invalid response from Anthropic');
      }

      const textContent = completion.content[0].text;

      const response: AnthropicCompletionResponse = {
        id: completion.id,
        content: textContent,
        model: completion.model,
        usage: {
          inputTokens: completion.usage.input_tokens,
          outputTokens: completion.usage.output_tokens,
          totalTokens: completion.usage.input_tokens + completion.usage.output_tokens,
        },
        stopReason: completion.stop_reason || 'unknown',
        createdAt: new Date().toISOString(),
      };

      // Track usage
      await AIRedisService.trackModelUsage(
        'anthropic',
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
          textContent
        );
      }

      const responseTime = Date.now() - startTime;
      await AIRedisService.setProviderStatus('anthropic', 'healthy', responseTime);

      logger.info({
        userId: request.userId,
        model: response.model,
        tokens: response.usage.totalTokens,
        responseTime,
      }, 'Anthropic completion successful');

      return response;

    } catch (error) {
      const responseTime = Date.now() - startTime;
      await AIRedisService.setProviderStatus('anthropic', 'unhealthy', responseTime);
      
      logger.error({
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: request.userId,
        responseTime,
      }, 'Anthropic completion failed');

      throw error;
    }
  }

  async createStreamCompletion(request: AnthropicCompletionRequest): Promise<AsyncIterableIterator<string>> {
    const client = this.ensureClient();
    
    // Check rate limits
    const rateLimit = await AIRedisService.checkProviderRateLimit(
      'anthropic',
      request.userId,
      50,
      3600
    );

    if (!rateLimit.allowed) {
      throw new Error(`Anthropic rate limit exceeded. Reset at ${new Date(rateLimit.resetTime).toISOString()}`);
    }

    const stream = await client.messages.create({
      model: request.model || anthropicConfig.defaultModel,
      max_tokens: request.maxTokens || anthropicConfig.maxTokens,
      temperature: request.temperature ?? anthropicConfig.temperature,
      system: request.system,
      messages: request.messages,
      stream: true,
    });

    return this.processStream(stream, request.userId);
  }

  private async *processStream(
    stream: AsyncIterable<Anthropic.Messages.MessageStreamEvent>,
    userId: string
  ): AsyncGenerator<string, void, unknown> {
    let totalTokens = 0;
    
    try {
      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          const content = event.delta.text;
          if (content) {
            totalTokens += this.estimateTokens(content);
            yield content;
          }
        }
      }

      // Track estimated usage for streaming
      await AIRedisService.trackModelUsage(
        'anthropic',
        anthropicConfig.defaultModel,
        userId,
        totalTokens
      );

    } catch (error) {
      logger.error({
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
      }, 'Anthropic streaming failed');
      throw error;
    }
  }

  private createRequestHash(request: AnthropicCompletionRequest): string {
    const hashData = {
      messages: request.messages,
      model: request.model || anthropicConfig.defaultModel,
      maxTokens: request.maxTokens || anthropicConfig.maxTokens,
      temperature: request.temperature ?? anthropicConfig.temperature,
      system: request.system,
    };
    
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

  // Text analysis capabilities
  async analyzeText(
    text: string,
    analysisType: 'sentiment' | 'summary' | 'keywords' | 'classification',
    userId: string,
    options?: any
  ): Promise<any> {
    const systemPrompts = {
      sentiment: 'Analyze the sentiment of the following text. Return only a JSON object with "sentiment" (positive/negative/neutral), "confidence" (0-1), and "reasoning".',
      summary: 'Provide a concise summary of the following text. Return only the summary.',
      keywords: 'Extract the key topics and themes from the following text. Return only a JSON array of keywords.',
      classification: 'Classify the following text into categories. Return only a JSON object with "category" and "confidence".',
    };

    const request: AnthropicCompletionRequest = {
      messages: [
        { role: 'user', content: text }
      ],
      system: systemPrompts[analysisType],
      maxTokens: 1000,
      temperature: 0.3,
      userId,
    };

    const response = await this.createCompletion(request);
    
    try {
      // Try to parse as JSON for structured responses
      if (analysisType === 'sentiment' || analysisType === 'keywords' || analysisType === 'classification') {
        return JSON.parse(response.content);
      }
      return response.content;
    } catch {
      // Return raw content if JSON parsing fails
      return response.content;
    }
  }

  async getConversationHistory(userId: string, conversationId: string): Promise<any[] | null> {
    return await AIRedisService.getConversation(userId, conversationId);
  }

  async clearConversationHistory(userId: string, conversationId: string): Promise<void> {
    await AIRedisService.deleteConversation(userId, conversationId);
  }

  async getUsageStats(userId: string, days: number = 30): Promise<any> {
    const models = ['claude-3-sonnet-20240229', 'claude-3-haiku-20240307', 'claude-3-opus-20240229'];
    const stats: any = {};

    for (const model of models) {
      stats[model] = await AIRedisService.getModelUsage('anthropic', model, userId, days);
    }

    return stats;
  }

  isEnabled(): boolean {
    return anthropicConfig.enabled;
  }

  async getStatus(): Promise<any> {
    const status = await AIRedisService.getProviderStatus('anthropic');
    return {
      enabled: this.isEnabled(),
      ...status,
    };
  }
}