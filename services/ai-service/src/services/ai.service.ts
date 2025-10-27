import { OpenAIService } from './openai.service';
import { AnthropicService } from './anthropic.service';
import { GoogleAIService } from './google-ai.service';
import { logger } from '../utils/logger';
import { AIRedisService } from '../utils/redis';
import { nanoid } from 'nanoid';

interface ChatCompletionRequest {
  userId: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  conversationId?: string;
}

interface ChatCompletionResponse {
  id: string;
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason: string;
  conversationId?: string;
  createdAt: string;
}

interface ModelInfo {
  id: string;
  provider: string;
  name: string;
  description: string;
  maxTokens: number;
  inputCostPer1K: number;
  outputCostPer1K: number;
  capabilities: string[];
  status: 'available' | 'unavailable' | 'limited';
}

export class AIService {
  private openaiService: OpenAIService;
  private anthropicService: AnthropicService;
  private googleService: GoogleAIService;

  constructor() {
    this.openaiService = new OpenAIService();
    this.anthropicService = new AnthropicService();
    this.googleService = new GoogleAIService();
  }

  async createChatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const startTime = Date.now();
    
    try {
      // Determine which service to use based on model
      const service = this.getServiceForModel(request.model || 'gpt-3.5-turbo');
      const completionId = `completion_${nanoid()}`;

      // Add conversation ID if not provided
      const conversationId = request.conversationId || `conv_${nanoid()}`;

      let result: any;

      switch (service.provider) {
        case 'openai':
          result = await this.openaiService.createCompletion({
            ...request,
            conversationId,
          });
          break;
        
        case 'anthropic':
          result = await this.anthropicService.createCompletion({
            ...request,
            conversationId,
          });
          break;
        
        case 'google':
          result = await this.googleService.createCompletion({
            ...request,
            conversationId,
          });
          break;
        
        default:
          throw new Error(`Unsupported model: ${request.model}`);
      }

      // Track overall AI service metrics
      const responseTime = Date.now() - startTime;
      await AIRedisService.trackServiceMetrics({
        userId: request.userId,
        model: result.model,
        tokens: result.usage.totalTokens,
        responseTime,
        success: true,
      });

      // Store conversation reference
      await AIRedisService.storeConversationReference(
        request.userId,
        conversationId,
        {
          lastMessageAt: new Date().toISOString(),
          messageCount: request.messages.length + 1,
          model: result.model,
          totalTokens: result.usage.totalTokens,
        }
      );

      return {
        ...result,
        id: completionId,
        conversationId,
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      await AIRedisService.trackServiceMetrics({
        userId: request.userId,
        model: request.model || 'unknown',
        tokens: 0,
        responseTime,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      logger.error({
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: request.userId,
        model: request.model,
        responseTime,
      }, 'AI completion failed');

      throw error;
    }
  }

  async createStreamingCompletion(request: ChatCompletionRequest): Promise<AsyncIterableIterator<string>> {
    const service = this.getServiceForModel(request.model || 'gpt-3.5-turbo');
    const conversationId = request.conversationId || `conv_${nanoid()}`;

    switch (service.provider) {
      case 'openai':
        return this.openaiService.createStreamCompletion({
          ...request,
          conversationId,
        });
      
      case 'anthropic':
        return this.anthropicService.createStreamCompletion({
          ...request,
          conversationId,
        });
      
      case 'google':
        // Google AI doesn't support streaming yet, fallback to regular completion
        const result = await this.googleService.createCompletion({
          ...request,
          conversationId,
        });
        return this.createMockStream(result.content);
      
      default:
        throw new Error(`Streaming not supported for model: ${request.model}`);
    }
  }

  async getAvailableModels(): Promise<ModelInfo[]> {
    const models: ModelInfo[] = [];

    // OpenAI models
    if (this.openaiService.isEnabled()) {
      models.push(
        {
          id: 'gpt-4',
          provider: 'openai',
          name: 'GPT-4',
          description: 'Most capable OpenAI model for complex tasks',
          maxTokens: 8192,
          inputCostPer1K: 0.03,
          outputCostPer1K: 0.06,
          capabilities: ['text', 'code', 'reasoning', 'analysis'],
          status: 'available',
        },
        {
          id: 'gpt-3.5-turbo',
          provider: 'openai',
          name: 'GPT-3.5 Turbo',
          description: 'Fast and efficient model for most tasks',
          maxTokens: 4096,
          inputCostPer1K: 0.001,
          outputCostPer1K: 0.002,
          capabilities: ['text', 'code', 'chat'],
          status: 'available',
        }
      );
    }

    // Anthropic models
    if (this.anthropicService.isEnabled()) {
      models.push(
        {
          id: 'claude-3-sonnet',
          provider: 'anthropic',
          name: 'Claude 3 Sonnet',
          description: 'Balanced model for various tasks',
          maxTokens: 200000,
          inputCostPer1K: 0.003,
          outputCostPer1K: 0.015,
          capabilities: ['text', 'code', 'reasoning', 'analysis', 'long-context'],
          status: 'available',
        },
        {
          id: 'claude-3-haiku',
          provider: 'anthropic',
          name: 'Claude 3 Haiku',
          description: 'Fast and cost-effective model',
          maxTokens: 200000,
          inputCostPer1K: 0.00025,
          outputCostPer1K: 0.00125,
          capabilities: ['text', 'code', 'chat', 'long-context'],
          status: 'available',
        }
      );
    }

    // Google AI models
    if (this.googleService.isEnabled()) {
      models.push({
        id: 'gemini-pro',
        provider: 'google',
        name: 'Gemini Pro',
        description: 'Google\'s multimodal AI model',
        maxTokens: 30720,
        inputCostPer1K: 0.0005,
        outputCostPer1K: 0.0015,
        capabilities: ['text', 'code', 'multimodal'],
        status: 'available',
      });
    }

    // Update model status based on provider health
    for (const model of models) {
      const providerStatus = await AIRedisService.getProviderStatus(model.provider);
      if (providerStatus?.status === 'unhealthy') {
        model.status = 'unavailable';
      } else if (providerStatus?.status === 'degraded') {
        model.status = 'limited';
      }
    }

    return models;
  }

  async getUserUsage(userId: string, days: number = 30, model?: string) {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    const usage = await AIRedisService.getUserUsageStats(userId, startDate, endDate, model);
    
    return {
      totalTokens: usage.totalTokens,
      totalRequests: usage.totalRequests,
      totalCost: usage.totalCost,
      byModel: usage.byModel,
      dailyUsage: usage.dailyBreakdown,
    };
  }

  async getProviderStatus() {
    const providers = ['openai', 'anthropic', 'google'];
    const status: any = {
      providers: {},
      overall: 'healthy' as 'healthy' | 'unhealthy' | 'degraded',
    };

    let healthyCount = 0;
    let degradedCount = 0;

    for (const provider of providers) {
      const providerStatus = await AIRedisService.getProviderStatus(provider);
      
      status.providers[provider] = {
        status: providerStatus?.status || 'unknown',
        responseTime: providerStatus?.responseTime || 0,
        lastCheck: providerStatus?.lastCheck || new Date().toISOString(),
        errorRate: providerStatus?.errorRate || 0,
      };

      if (providerStatus?.status === 'healthy') {
        healthyCount++;
      } else if (providerStatus?.status === 'degraded') {
        degradedCount++;
      }
    }

    // Determine overall status
    if (healthyCount === 0) {
      status.overall = 'unhealthy';
    } else if (degradedCount > 0 || healthyCount < providers.length) {
      status.overall = 'degraded';
    }

    return status;
  }

  async generateCode(request: {
    userId: string;
    prompt: string;
    language?: string;
    framework?: string;
    style?: 'function' | 'class' | 'module';
    context?: string;
  }) {
    const systemPrompt = this.buildCodeGenerationSystemPrompt(
      request.language,
      request.framework,
      request.style
    );

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: request.prompt },
    ];

    if (request.context) {
      messages.splice(1, 0, {
        role: 'user' as const,
        content: `Context:\n${request.context}`,
      });
    }

    return this.createChatCompletion({
      userId: request.userId,
      messages,
      model: 'gpt-4', // Use GPT-4 for code generation
      temperature: 0.2, // Lower temperature for more consistent code
    });
  }

  async analyzeCode(request: {
    userId: string;
    code: string;
    language?: string;
    analysisType: 'review' | 'security' | 'performance' | 'bugs' | 'style';
  }) {
    const systemPrompt = this.buildCodeAnalysisSystemPrompt(request.analysisType, request.language);

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: `Please analyze this code:\n\n\`\`\`${request.language || ''}\n${request.code}\n\`\`\`` },
    ];

    return this.createChatCompletion({
      userId: request.userId,
      messages,
      model: 'gpt-4',
      temperature: 0.1,
    });
  }

  private getServiceForModel(model: string): { provider: string; service: any } {
    if (model.startsWith('gpt-') || model.includes('openai')) {
      return { provider: 'openai', service: this.openaiService };
    } else if (model.startsWith('claude-') || model.includes('anthropic')) {
      return { provider: 'anthropic', service: this.anthropicService };
    } else if (model.startsWith('gemini-') || model.includes('google')) {
      return { provider: 'google', service: this.googleService };
    } else {
      // Default to OpenAI for unknown models
      return { provider: 'openai', service: this.openaiService };
    }
  }

  private async *createMockStream(content: string): AsyncGenerator<string, void, unknown> {
    const words = content.split(' ');
    for (const word of words) {
      yield word + ' ';
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }

  private buildCodeGenerationSystemPrompt(
    language?: string,
    framework?: string,
    style?: string
  ): string {
    let prompt = 'You are an expert software developer. Generate clean, well-documented, and efficient code.';
    
    if (language) {
      prompt += ` Focus on ${language} best practices.`;
    }
    
    if (framework) {
      prompt += ` Use ${framework} conventions and patterns.`;
    }
    
    if (style) {
      prompt += ` Structure the code as a ${style}.`;
    }
    
    prompt += ' Include helpful comments and follow industry standards.';
    
    return prompt;
  }

  private buildCodeAnalysisSystemPrompt(analysisType: string, language?: string): string {
    let prompt = 'You are an expert code reviewer. ';
    
    switch (analysisType) {
      case 'review':
        prompt += 'Provide a comprehensive code review focusing on code quality, maintainability, and best practices.';
        break;
      case 'security':
        prompt += 'Analyze the code for security vulnerabilities and potential exploits.';
        break;
      case 'performance':
        prompt += 'Identify performance bottlenecks and suggest optimizations.';
        break;
      case 'bugs':
        prompt += 'Find potential bugs, logical errors, and edge cases.';
        break;
      case 'style':
        prompt += 'Review code style, formatting, and adherence to conventions.';
        break;
    }
    
    if (language) {
      prompt += ` Focus on ${language}-specific issues and best practices.`;
    }
    
    prompt += ' Provide specific suggestions with explanations.';
    
    return prompt;
  }
}