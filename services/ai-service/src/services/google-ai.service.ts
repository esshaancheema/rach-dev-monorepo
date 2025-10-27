import { GenerativeLanguageServiceClient } from '@google-ai/generativelanguage';
import { GoogleAuth } from 'google-auth-library';
import { googleAiConfig } from '../config';
import { logger } from '../utils/logger';
import { AIRedisService } from '../utils/redis';

export interface GoogleAICompletionRequest {
  messages: Array<{
    role: 'user' | 'model';
    content: string;
  }>;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
  userId: string;
  conversationId?: string;
}

export interface GoogleAICompletionResponse {
  id: string;
  content: string;
  model: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  finishReason: string;
  createdAt: string;
}

export class GoogleAIService {
  private client: GenerativeLanguageServiceClient | null = null;

  constructor() {
    if (googleAiConfig.enabled) {
      try {
        const auth = new GoogleAuth({
          credentials: googleAiConfig.apiKey ? { client_email: '', private_key: googleAiConfig.apiKey } : undefined,
          projectId: googleAiConfig.projectId,
        });

        this.client = new GenerativeLanguageServiceClient({ auth });
        logger.info('Google AI service initialized');
      } catch (error) {
        logger.error({ error }, 'Failed to initialize Google AI service');
      }
    } else {
      logger.warn('Google AI service disabled - missing API key or project ID');
    }
  }

  private ensureClient(): GenerativeLanguageServiceClient {
    if (!this.client) {
      throw new Error('Google AI service is not enabled or configured');
    }
    return this.client;
  }

  async createCompletion(request: GoogleAICompletionRequest): Promise<GoogleAICompletionResponse> {
    const client = this.ensureClient();
    const startTime = Date.now();

    try {
      // Check rate limits
      const rateLimit = await AIRedisService.checkProviderRateLimit(
        'google_ai',
        request.userId,
        60, // 60 requests per hour
        3600
      );

      if (!rateLimit.allowed) {
        throw new Error(`Google AI rate limit exceeded. Reset at ${new Date(rateLimit.resetTime).toISOString()}`);
      }

      // Create request hash for caching
      const requestHash = this.createRequestHash(request);
      
      // Check cache for repeated requests
      const cachedResponse = await AIRedisService.getCachedResponse(requestHash);
      if (cachedResponse) {
        logger.debug({ userId: request.userId, cached: true }, 'Returning cached Google AI response');
        return cachedResponse;
      }

      // Convert messages to Google AI format
      const contents = this.convertMessagesToGoogleFormat(request.messages);

      const modelName = `models/${request.model || googleAiConfig.defaultModel}`;
      
      const [response] = await client.generateContent({
        model: modelName,
        contents,
        generationConfig: {
          maxOutputTokens: request.maxTokens || googleAiConfig.maxTokens,
          temperature: request.temperature ?? googleAiConfig.temperature,
        },
      });

      if (!response.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid response from Google AI');
      }

      const content = response.candidates[0].content.parts[0].text;
      const inputTokens = this.estimateTokens(request.messages.map(m => m.content).join(' '));
      const outputTokens = this.estimateTokens(content);

      const completionResponse: GoogleAICompletionResponse = {
        id: `google_ai_${Date.now()}`,
        content,
        model: request.model || googleAiConfig.defaultModel,
        usage: {
          inputTokens,
          outputTokens,
          totalTokens: inputTokens + outputTokens,
        },
        finishReason: response.candidates[0].finishReason || 'unknown',
        createdAt: new Date().toISOString(),
      };

      // Track usage
      await AIRedisService.trackModelUsage(
        'google_ai',
        completionResponse.model,
        request.userId,
        completionResponse.usage.totalTokens
      );

      // Cache response for 30 minutes
      await AIRedisService.cacheResponse(requestHash, completionResponse, 1800);

      // Update conversation memory if provided
      if (request.conversationId) {
        await this.updateConversationMemory(
          request.userId,
          request.conversationId,
          request.messages,
          content
        );
      }

      const responseTime = Date.now() - startTime;
      await AIRedisService.setProviderStatus('google_ai', 'healthy', responseTime);

      logger.info({
        userId: request.userId,
        model: completionResponse.model,
        tokens: completionResponse.usage.totalTokens,
        responseTime,
      }, 'Google AI completion successful');

      return completionResponse;

    } catch (error) {
      const responseTime = Date.now() - startTime;
      await AIRedisService.setProviderStatus('google_ai', 'unhealthy', responseTime);
      
      logger.error({
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: request.userId,
        responseTime,
      }, 'Google AI completion failed');

      throw error;
    }
  }

  private convertMessagesToGoogleFormat(messages: GoogleAICompletionRequest['messages']) {
    return messages.map(message => ({
      role: message.role === 'user' ? 'user' : 'model',
      parts: [{ text: message.content }],
    }));
  }

  private createRequestHash(request: GoogleAICompletionRequest): string {
    const hashData = {
      messages: request.messages,
      model: request.model || googleAiConfig.defaultModel,
      maxTokens: request.maxTokens || googleAiConfig.maxTokens,
      temperature: request.temperature ?? googleAiConfig.temperature,
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
        { role: 'model', content: assistantResponse, timestamp: new Date().toISOString() },
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

  // Code analysis and generation capabilities
  async analyzeCode(
    code: string,
    language: string,
    analysisType: 'review' | 'security' | 'performance' | 'documentation',
    userId: string
  ): Promise<string> {
    const prompts = {
      review: `Review the following ${language} code and provide feedback on code quality, best practices, and potential improvements:`,
      security: `Analyze the following ${language} code for security vulnerabilities and provide recommendations:`,
      performance: `Analyze the following ${language} code for performance issues and suggest optimizations:`,
      documentation: `Generate comprehensive documentation for the following ${language} code:`,
    };

    const request: GoogleAICompletionRequest = {
      messages: [
        { role: 'user', content: `${prompts[analysisType]}\n\n\`\`\`${language}\n${code}\n\`\`\`` }
      ],
      maxTokens: 2000,
      temperature: 0.3,
      userId,
    };

    const response = await this.createCompletion(request);
    return response.content;
  }

  async generateCode(
    description: string,
    language: string,
    requirements: string[],
    userId: string
  ): Promise<string> {
    const requirementsText = requirements.length > 0 
      ? `\n\nRequirements:\n${requirements.map(r => `- ${r}`).join('\n')}`
      : '';

    const request: GoogleAICompletionRequest = {
      messages: [
        { 
          role: 'user', 
          content: `Generate ${language} code for: ${description}${requirementsText}\n\nProvide only the code with comments explaining key parts.`
        }
      ],
      maxTokens: 3000,
      temperature: 0.5,
      userId,
    };

    const response = await this.createCompletion(request);
    return response.content;
  }

  async explainCode(code: string, language: string, userId: string): Promise<string> {
    const request: GoogleAICompletionRequest = {
      messages: [
        { 
          role: 'user', 
          content: `Explain what this ${language} code does in simple terms:\n\n\`\`\`${language}\n${code}\n\`\`\``
        }
      ],
      maxTokens: 1500,
      temperature: 0.3,
      userId,
    };

    const response = await this.createCompletion(request);
    return response.content;
  }

  async getConversationHistory(userId: string, conversationId: string): Promise<any[] | null> {
    return await AIRedisService.getConversation(userId, conversationId);
  }

  async clearConversationHistory(userId: string, conversationId: string): Promise<void> {
    await AIRedisService.deleteConversation(userId, conversationId);
  }

  async getUsageStats(userId: string, days: number = 30): Promise<any> {
    const models = ['gemini-pro', 'gemini-pro-vision'];
    const stats: any = {};

    for (const model of models) {
      stats[model] = await AIRedisService.getModelUsage('google_ai', model, userId, days);
    }

    return stats;
  }

  isEnabled(): boolean {
    return googleAiConfig.enabled;
  }

  async getStatus(): Promise<any> {
    const status = await AIRedisService.getProviderStatus('google_ai');
    return {
      enabled: this.isEnabled(),
      ...status,
    };
  }
}