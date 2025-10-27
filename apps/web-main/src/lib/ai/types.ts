// AI and Chatbot Type Definitions

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  attachments?: ChatAttachment[];
  intent?: ChatIntent;
  confidence?: number;
  suggestedActions?: string[];
  metadata?: Record<string, any>;
}

export interface ChatAttachment {
  id: string;
  type: 'image' | 'file' | 'link' | 'code';
  name: string;
  url: string;
  size?: number;
  mimeType?: string;
}

export interface ChatContext {
  page: string;
  userAgent: string;
  referrer?: string;
  sessionStartTime: Date;
  userId?: string;
  userEmail?: string;
  companyName?: string;
  projectType?: string;
  budget?: string;
  timeline?: string;
  previousInteractions?: number;
  leadScore?: number;
}

export type ChatIntent = 
  | 'welcome'
  | 'services_inquiry'
  | 'pricing_inquiry'
  | 'project_inquiry'
  | 'timeline_inquiry'
  | 'technology_inquiry'
  | 'portfolio_inquiry'
  | 'contact_inquiry'
  | 'support_inquiry'
  | 'general_inquiry'
  | 'goodbye'
  | 'error';

export interface ChatResponse {
  message: string;
  intent?: ChatIntent;
  confidence?: number;
  suggestedActions?: string[];
  sessionId: string;
  messageId: string;
  requiresFollowUp?: boolean;
  escalateToHuman?: boolean;
}

export interface AICodeGenerator {
  generateCode(prompt: string, language: string, framework?: string): Promise<CodeGenerationResult>;
  explainCode(code: string, language: string): Promise<CodeExplanation>;
  reviewCode(code: string, language: string): Promise<CodeReview>;
  optimizeCode(code: string, language: string): Promise<CodeOptimization>;
  generateTests(code: string, language: string, testFramework?: string): Promise<TestGeneration>;
}

export interface CodeGenerationResult {
  code: string;
  language: string;
  framework?: string;
  description: string;
  dependencies?: string[];
  usage?: string;
  examples?: CodeExample[];
  confidence: number;
  warnings?: string[];
}

export interface CodeExample {
  title: string;
  description: string;
  code: string;
  output?: string;
}

export interface CodeExplanation {
  summary: string;
  breakdown: Array<{
    lineStart: number;
    lineEnd: number;
    explanation: string;
    category: 'function' | 'variable' | 'import' | 'logic' | 'comment' | 'other';
  }>;
  concepts: string[];
  complexity: 'beginner' | 'intermediate' | 'advanced';
  suggestions?: string[];
}

export interface CodeReview {
  overall: {
    score: number; // 0-100
    summary: string;
    recommendation: 'approve' | 'approve_with_changes' | 'request_changes' | 'reject';
  };
  issues: Array<{
    severity: 'error' | 'warning' | 'info' | 'suggestion';
    type: 'syntax' | 'logic' | 'performance' | 'security' | 'style' | 'maintainability';
    line?: number;
    message: string;
    suggestion?: string;
    autoFixable: boolean;
  }>;
  metrics: {
    complexity: number;
    maintainability: number;
    testCoverage?: number;
    performance: number;
    security: number;
  };
  positives: string[];
}

export interface CodeOptimization {
  optimizedCode: string;
  improvements: Array<{
    type: 'performance' | 'readability' | 'maintainability' | 'security' | 'memory';
    description: string;
    impact: 'high' | 'medium' | 'low';
    linesBefore?: number[];
    linesAfter?: number[];
  }>;
  benchmarks?: {
    before: PerformanceMetrics;
    after: PerformanceMetrics;
    improvement: number; // percentage
  };
  explanation: string;
}

export interface PerformanceMetrics {
  executionTime?: number; // milliseconds
  memoryUsage?: number; // bytes
  cpuUsage?: number; // percentage
  complexity?: number; // Big O notation score
}

export interface TestGeneration {
  tests: string;
  framework: string;
  coverage: Array<{
    function: string;
    testCases: number;
    edgeCases: number;
    coverage: number; // percentage
  }>;
  explanation: string;
  runInstructions: string;
  mockRequirements?: string[];
}

export interface ProjectEstimation {
  id: string;
  projectName: string;
  description: string;
  requirements: ProjectRequirement[];
  estimation: {
    duration: {
      min: number; // weeks
      max: number; // weeks
      most_likely: number; // weeks
    };
    effort: {
      min: number; // hours
      max: number; // hours
      most_likely: number; // hours
    };
    cost: {
      min: number; // USD
      max: number; // USD
      most_likely: number; // USD
    };
    confidence: number; // 0-100
  };
  breakdown: ProjectBreakdown;
  risks: ProjectRisk[];
  recommendations: string[];
  assumptions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectRequirement {
  id: string;
  category: 'functional' | 'non-functional' | 'technical' | 'business';
  priority: 'must-have' | 'should-have' | 'could-have' | 'won\'t-have';
  title: string;
  description: string;
  complexity: 'simple' | 'medium' | 'complex' | 'very-complex';
  estimatedHours: number;
  dependencies?: string[];
  skills?: string[];
}

export interface ProjectBreakdown {
  phases: Array<{
    name: string;
    description: string;
    duration: number; // weeks
    effort: number; // hours
    cost: number; // USD
    deliverables: string[];
    milestones: string[];
  }>;
  resources: Array<{
    role: string;
    level: 'junior' | 'mid' | 'senior' | 'lead';
    allocation: number; // percentage
    duration: number; // weeks
    hourlyRate: number; // USD
  }>;
  technologies: Array<{
    name: string;
    category: 'frontend' | 'backend' | 'database' | 'infrastructure' | 'tool';
    complexity: number; // 1-5
    learningCurve: 'low' | 'medium' | 'high';
  }>;
}

export interface ProjectRisk {
  id: string;
  category: 'technical' | 'business' | 'resource' | 'timeline' | 'budget';
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability: 'low' | 'medium' | 'high';
  description: string;
  impact: string;
  mitigation: string;
  contingency?: string;
}

export interface AIInsight {
  id: string;
  type: 'performance' | 'optimization' | 'security' | 'user_behavior' | 'business' | 'technical';
  title: string;
  description: string;
  data: any;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  actionable: boolean;
  recommendations?: string[];
  createdAt: Date;
  source: 'analytics' | 'monitoring' | 'user_feedback' | 'code_analysis' | 'business_metrics';
}

export interface ConversationAnalytics {
  sessionId: string;
  userId?: string;
  metrics: {
    duration: number; // seconds
    messageCount: number;
    userSatisfaction?: number; // 1-5
    intentAccuracy: number; // 0-1
    responseTime: number; // milliseconds
    escalatedToHuman: boolean;
    goalAchieved: boolean;
  };
  insights: {
    primaryIntent: ChatIntent;
    sentimentJourney: Array<{
      timestamp: Date;
      sentiment: 'positive' | 'negative' | 'neutral';
      confidence: number;
    }>;
    keyTopics: string[];
    painPoints?: string[];
    opportunities?: string[];
  };
  outcome: {
    type: 'information_provided' | 'lead_generated' | 'support_resolved' | 'escalated' | 'abandoned';
    value?: number; // business value score
    followUpRequired: boolean;
    nextActions?: string[];
  };
}

export interface AIModelConfig {
  provider: 'openai' | 'anthropic' | 'huggingface' | 'custom';
  model: string;
  apiKey?: string;
  endpoint?: string;
  maxTokens: number;
  temperature: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequences?: string[];
  systemPrompt?: string;
}

export interface AITrainingData {
  conversations: ChatMessage[][];
  intents: Array<{
    intent: ChatIntent;
    examples: string[];
    responses: string[];
  }>;
  entities: Array<{
    name: string;
    values: string[];
    synonyms?: Record<string, string[]>;
  }>;
  context: Array<{
    scenario: string;
    context: ChatContext;
    expectedBehavior: string;
  }>;
}

// API Response Types
export interface ChatbotAPIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    sessionId: string;
    messageId: string;
    processingTime: number;
    modelUsed: string;
    tokensUsed?: number;
  };
}

export type StartSessionResponse = ChatbotAPIResponse<{
  sessionId: string;
  welcomeMessage: ChatMessage;
}>;

export type SendMessageResponse = ChatbotAPIResponse<ChatResponse>;

export type CodeGenerationResponse = ChatbotAPIResponse<CodeGenerationResult>;

export type ProjectEstimationResponse = ChatbotAPIResponse<ProjectEstimation>;

export type AnalyticsResponse = ChatbotAPIResponse<ConversationAnalytics[]>;