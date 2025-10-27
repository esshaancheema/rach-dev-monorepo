import { BaseApiClient } from '../base-client';
import { 
  ApiClientConfig, 
  AIRequest, 
  AIResponse,
  PaginatedResponse,
  PaginationParams 
} from '../types';

export interface CodeGenerationRequest {
  prompt: string;
  language?: string;
  framework?: string;
  model?: 'gpt-4' | 'gpt-3.5-turbo' | 'claude-3' | 'gemini-pro';
  maxTokens?: number;
  temperature?: number;
  context?: string;
  projectId?: string;
}

export interface CodeOptimizationRequest {
  code: string;
  language: string;
  optimizationType: 'performance' | 'readability' | 'security' | 'general';
  model?: string;
  context?: string;
}

export interface CodeReviewRequest {
  code: string;
  language: string;
  model?: string;
  focusAreas?: string[];
}

export interface DocumentationRequest {
  code: string;
  language: string;
  documentationType: 'api' | 'readme' | 'comments' | 'guide';
  model?: string;
}

export interface ChatRequest {
  message: string;
  conversationId?: string;
  model?: string;
  context?: string;
  systemPrompt?: string;
}

export interface Conversation {
  id: string;
  title: string;
  userId: string;
  model: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface ModelUsage {
  model: string;
  requests: number;
  tokens: number;
  cost: number;
  period: string;
}

export class AIClient extends BaseApiClient {
  constructor(config: ApiClientConfig = {}) {
    super({
      baseURL: process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:4003',
      ...config,
    });
  }

  // Code generation
  async generateCode(request: CodeGenerationRequest) {
    return this.post<AIResponse>('/ai/code/generate', request);
  }

  async optimizeCode(request: CodeOptimizationRequest) {
    return this.post<AIResponse>('/ai/code/optimize', request);
  }

  async reviewCode(request: CodeReviewRequest) {
    return this.post<AIResponse>('/ai/code/review', request);
  }

  async explainCode(code: string, language: string, model?: string) {
    return this.post<AIResponse>('/ai/code/explain', {
      code,
      language,
      model,
    });
  }

  async convertCode(data: {
    code: string;
    fromLanguage: string;
    toLanguage: string;
    model?: string;
  }) {
    return this.post<AIResponse>('/ai/code/convert', data);
  }

  async debugCode(data: {
    code: string;
    language: string;
    error?: string;
    model?: string;
  }) {
    return this.post<AIResponse>('/ai/code/debug', data);
  }

  // Documentation generation
  async generateDocumentation(request: DocumentationRequest) {
    return this.post<AIResponse>('/ai/docs/generate', request);
  }

  async generateApiDocs(data: {
    apiSpec: string;
    format: 'openapi' | 'swagger' | 'postman';
    model?: string;
  }) {
    return this.post<AIResponse>('/ai/docs/api', data);
  }

  async generateReadme(data: {
    projectInfo: {
      name: string;
      description: string;
      tech: string[];
      features: string[];
    };
    model?: string;
  }) {
    return this.post<AIResponse>('/ai/docs/readme', data);
  }

  // Chat interface
  async chat(request: ChatRequest) {
    return this.post<{
      response: AIResponse;
      conversation: Conversation;
    }>('/ai/chat', request);
  }

  async streamChat(request: ChatRequest) {
    return this.request<ReadableStream>({
      method: 'POST',
      url: '/ai/chat/stream',
      data: request,
      responseType: 'stream',
    });
  }

  // Conversation management
  async getConversations(params: PaginationParams = {}) {
    return this.get<PaginatedResponse<Conversation>>('/ai/conversations', params);
  }

  async getConversation(conversationId: string) {
    return this.get<Conversation>(`/ai/conversations/${conversationId}`);
  }

  async getConversationMessages(conversationId: string, params: PaginationParams = {}) {
    return this.get<PaginatedResponse<ChatMessage>>(`/ai/conversations/${conversationId}/messages`, params);
  }

  async updateConversation(conversationId: string, data: { title: string }) {
    return this.put<Conversation>(`/ai/conversations/${conversationId}`, data);
  }

  async deleteConversation(conversationId: string) {
    return this.delete(`/ai/conversations/${conversationId}`);
  }

  async clearConversations() {
    return this.delete('/ai/conversations');
  }

  // AI model management
  async getAvailableModels() {
    return this.get<Array<{
      id: string;
      name: string;
      provider: 'openai' | 'anthropic' | 'google';
      type: 'chat' | 'completion' | 'code';
      maxTokens: number;
      costPer1kTokens: number;
      features: string[];
    }>>('/ai/models');
  }

  async getModelUsage(params: {
    startDate: string;
    endDate: string;
    model?: string;
  }) {
    return this.get<ModelUsage[]>('/ai/usage', params);
  }

  // Image generation (if enabled)
  async generateImage(data: {
    prompt: string;
    model?: 'dall-e-3' | 'dall-e-2' | 'midjourney';
    size?: '1024x1024' | '1792x1024' | '1024x1792';
    quality?: 'standard' | 'hd';
    style?: 'vivid' | 'natural';
  }) {
    return this.post<{
      imageUrl: string;
      revisedPrompt?: string;
    }>('/ai/image/generate', data);
  }

  // AI assistance for development
  async generateTests(data: {
    code: string;
    language: string;
    framework?: string;
    testType: 'unit' | 'integration' | 'e2e';
    model?: string;
  }) {
    return this.post<AIResponse>('/ai/code/tests', data);
  }

  async generateCommitMessage(data: {
    diff: string;
    style?: 'conventional' | 'angular' | 'emoji';
    model?: string;
  }) {
    return this.post<{
      message: string;
      description?: string;
    }>('/ai/git/commit-message', data);
  }

  async generatePullRequestDescription(data: {
    title: string;
    changes: string;
    model?: string;
  }) {
    return this.post<{
      description: string;
      checklist: string[];
    }>('/ai/git/pr-description', data);
  }

  // Custom prompts
  async executeCustomPrompt(data: {
    prompt: string;
    model?: string;
    maxTokens?: number;
    temperature?: number;
    systemPrompt?: string;
    context?: string;
  }) {
    return this.post<AIResponse>('/ai/custom', data);
  }

  // AI settings
  async getAISettings() {
    return this.get<{
      defaultModel: string;
      maxTokens: number;
      temperature: number;
      enabledFeatures: string[];
      customPrompts: Array<{
        id: string;
        name: string;
        prompt: string;
        category: string;
      }>;
    }>('/ai/settings');
  }

  async updateAISettings(settings: {
    defaultModel?: string;
    maxTokens?: number;
    temperature?: number;
    enabledFeatures?: string[];
  }) {
    return this.put('/ai/settings', settings);
  }

  async createCustomPrompt(data: {
    name: string;
    prompt: string;
    category: string;
    description?: string;
  }) {
    return this.post('/ai/prompts', data);
  }

  async updateCustomPrompt(promptId: string, data: {
    name?: string;
    prompt?: string;
    category?: string;
    description?: string;
  }) {
    return this.put(`/ai/prompts/${promptId}`, data);
  }

  async deleteCustomPrompt(promptId: string) {
    return this.delete(`/ai/prompts/${promptId}`);
  }
}