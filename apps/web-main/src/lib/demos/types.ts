export interface DemoStep {
  id: string;
  title: string;
  description: string;
  code?: string;
  language?: string;
  input?: string;
  output?: string;
  explanation?: string;
  duration?: number; // milliseconds for auto-progression
}

export interface DemoScenario {
  id: string;
  title: string;
  description: string;
  category: 'ai' | 'web' | 'mobile' | 'automation' | 'api';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  tags: string[];
  steps: DemoStep[];
  benefits: string[];
  technologies: string[];
  icon: string;
  demoUrl?: string;
  githubUrl?: string;
}

export interface InteractiveDemoState {
  currentScenario: string | null;
  currentStep: number;
  isPlaying: boolean;
  isCompleted: boolean;
  userInputs: Record<string, string>;
  progress: number;
  startTime?: number;
  completionTime?: number;
}

export interface ChatbotMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  metadata?: {
    confidence?: number;
    intent?: string;
    entities?: Record<string, any>;
    suggestions?: string[];
  };
}

export interface CodeGenerationRequest {
  prompt: string;
  language: string;
  framework?: string;
  complexity: 'simple' | 'medium' | 'complex';
  includeTests?: boolean;
  includeComments?: boolean;
}

export interface CodeGenerationResponse {
  code: string;
  explanation: string;
  suggestions: string[];
  dependencies?: string[];
  testCode?: string;
  documentation?: string;
}