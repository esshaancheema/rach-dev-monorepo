'use client';

import { useState, useCallback, useRef } from 'react';

interface AIDemo {
  id: string;
  prompt: string;
  status: 'idle' | 'generating' | 'completed' | 'error';
  result?: {
    title: string;
    description: string;
    code: string;
    framework: string;
    preview: string;
    structure: Array<{
      name: string;
      type: 'file' | 'folder';
      children?: Array<any>;
    }>;
    estimatedTime: string;
    complexity: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  };
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface UseAIDemoReturn {
  demos: AIDemo[];
  currentDemo: AIDemo | null;
  isGenerating: boolean;
  error: string | null;
  generateDemo: (prompt: string, options?: GenerateOptions) => Promise<AIDemo | null>;
  cancelGeneration: () => void;
  clearError: () => void;
  deleteDemo: (id: string) => void;
  saveDemo: (demo: AIDemo) => Promise<void>;
  loadSavedDemos: () => AIDemo[];
}

interface GenerateOptions {
  framework?: string;
  complexity?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  includeDatabase?: boolean;
  includeAuth?: boolean;
  deploymentTarget?: 'vercel' | 'netlify' | 'aws' | 'docker';
}

const DEFAULT_OPTIONS: GenerateOptions = {
  framework: 'react',
  complexity: 'intermediate',
  includeDatabase: false,
  includeAuth: false,
  deploymentTarget: 'vercel'
};

export function useAIDemo(): UseAIDemoReturn {
  const [demos, setDemos] = useState<AIDemo[]>([]);
  const [currentDemo, setCurrentDemo] = useState<AIDemo | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Generate a unique ID for demos
  const generateId = (): string => {
    return `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Create initial demo object
  const createDemo = (prompt: string): AIDemo => ({
    id: generateId(),
    prompt,
    status: 'idle',
    createdAt: new Date(),
    updatedAt: new Date()
  });

  // Save demo to localStorage
  const saveToStorage = (demo: AIDemo) => {
    if (typeof window === 'undefined') return;
    
    try {
      const savedDemos = JSON.parse(localStorage.getItem('zoptal_ai_demos') || '[]');
      const updatedDemos = savedDemos.filter((d: AIDemo) => d.id !== demo.id);
      updatedDemos.push(demo);
      
      // Keep only last 10 demos
      const recentDemos = updatedDemos.slice(-10);
      localStorage.setItem('zoptal_ai_demos', JSON.stringify(recentDemos));
    } catch (error) {
      console.warn('Failed to save demo to storage:', error);
    }
  };

  // Load saved demos from localStorage
  const loadSavedDemos = useCallback((): AIDemo[] => {
    if (typeof window === 'undefined') return [];
    
    try {
      const saved = localStorage.getItem('zoptal_ai_demos');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((demo: any) => ({
          ...demo,
          createdAt: new Date(demo.createdAt),
          updatedAt: new Date(demo.updatedAt)
        }));
      }
    } catch (error) {
      console.warn('Failed to load saved demos:', error);
    }
    
    return [];
  }, []);

  // Generate AI demo
  const generateDemo = useCallback(async (
    prompt: string, 
    options: GenerateOptions = {}
  ): Promise<AIDemo | null> => {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
    const demo = createDemo(prompt);
    
    setIsGenerating(true);
    setError(null);
    setCurrentDemo(demo);
    
    // Add to demos list
    setDemos(prev => [...prev, demo]);
    
    // Create abort controller for cancellation
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    try {
      // Update demo status
      const updatingDemo = { ...demo, status: 'generating' as const, updatedAt: new Date() };
      setCurrentDemo(updatingDemo);
      setDemos(prev => prev.map(d => d.id === demo.id ? updatingDemo : d));
      
      // Call AI API
      const response = await fetch('/api/ai-demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          options: mergedOptions,
          demoId: demo.id
        }),
        signal: abortController.signal
      });
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Update demo with results
      const completedDemo: AIDemo = {
        ...updatingDemo,
        status: 'completed',
        result: {
          title: result.title || 'Generated Application',
          description: result.description || 'AI-generated application',
          code: result.code || '// Generated code will appear here',
          framework: result.framework || mergedOptions.framework || 'react',
          preview: result.preview || '',
          structure: result.structure || [],
          estimatedTime: result.estimatedTime || '1-2 hours',
          complexity: result.complexity || mergedOptions.complexity || 'intermediate'
        },
        updatedAt: new Date()
      };
      
      setCurrentDemo(completedDemo);
      setDemos(prev => prev.map(d => d.id === demo.id ? completedDemo : d));
      
      // Save to localStorage
      saveToStorage(completedDemo);
      
      return completedDemo;
      
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Generation was cancelled
        const cancelledDemo = { ...demo, status: 'error' as const, error: 'Generation cancelled', updatedAt: new Date() };
        setCurrentDemo(cancelledDemo);
        setDemos(prev => prev.map(d => d.id === demo.id ? cancelledDemo : d));
        return null;
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Generation failed';
      const errorDemo = { ...demo, status: 'error' as const, error: errorMessage, updatedAt: new Date() };
      
      setError(errorMessage);
      setCurrentDemo(errorDemo);
      setDemos(prev => prev.map(d => d.id === demo.id ? errorDemo : d));
      
      return null;
      
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  }, []);

  // Cancel ongoing generation
  const cancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
  }, []);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Delete a demo
  const deleteDemo = useCallback((id: string) => {
    setDemos(prev => prev.filter(d => d.id !== id));
    
    if (currentDemo?.id === id) {
      setCurrentDemo(null);
    }
    
    // Remove from localStorage
    if (typeof window !== 'undefined') {
      try {
        const savedDemos = JSON.parse(localStorage.getItem('zoptal_ai_demos') || '[]');
        const updatedDemos = savedDemos.filter((d: AIDemo) => d.id !== id);
        localStorage.setItem('zoptal_ai_demos', JSON.stringify(updatedDemos));
      } catch (error) {
        console.warn('Failed to delete demo from storage:', error);
      }
    }
  }, [currentDemo]);

  // Save a demo (for manual saving)
  const saveDemo = useCallback(async (demo: AIDemo): Promise<void> => {
    saveToStorage(demo);
    
    // Optionally sync to server
    try {
      await fetch('/api/demos/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(demo)
      });
    } catch (error) {
      console.warn('Failed to sync demo to server:', error);
    }
  }, []);

  return {
    demos,
    currentDemo,
    isGenerating,
    error,
    generateDemo,
    cancelGeneration,
    clearError,
    deleteDemo,
    saveDemo,
    loadSavedDemos
  };
}