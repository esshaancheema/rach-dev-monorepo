'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  UserIcon,
  ComputerDesktopIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import CodePreview from './CodePreview';
import PromptCounter from './PromptCounter';
import AuthGate from './AuthGate';

interface Message {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  code?: string;
  framework?: 'react' | 'vue' | 'vanilla';
}

interface AIAppBuilderProps {
  initialPrompt: string;
  isAuthenticated: boolean;
  promptsUsed: number;
  promptsRemaining: number;
  totalPrompts: number;
  onAuthRequired: () => void;
  onPromptSubmit: (prompt: string) => Promise<{ code: string; framework: string; description: string }>;
  className?: string;
}

export default function AIAppBuilder({ 
  initialPrompt,
  isAuthenticated,
  promptsUsed,
  promptsRemaining,
  totalPrompts,
  onAuthRequired,
  onPromptSubmit,
  className 
}: AIAppBuilderProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newPrompt, setNewPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentApp, setCurrentApp] = useState<{
    code: string;
    framework: 'react' | 'vue' | 'vanilla';
    description: string;
  } | null>(null);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Initialize with the initial prompt
  useEffect(() => {
    if (initialPrompt) {
      handleInitialGeneration();
    }
  }, [initialPrompt]);

  const handleInitialGeneration = async () => {
    setIsGenerating(true);
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: initialPrompt,
      timestamp: new Date()
    };
    
    setMessages([userMessage]);

    try {
      const result = await onPromptSubmit(initialPrompt);
      
      // Add AI response message
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: result.description,
        timestamp: new Date(),
        code: result.code,
        framework: result.framework as 'react' | 'vue' | 'vanilla'
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setCurrentApp(result);
      setPreviewError(null);
      
    } catch (error) {
      console.error('Failed to generate app:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'system',
        content: 'Sorry, I encountered an error generating your app. Please try again with a different description.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setPreviewError('Failed to generate app');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePromptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPrompt.trim() || isGenerating) return;

    // Check if user has prompts remaining
    if (promptsRemaining <= 0) {
      setShowAuthGate(true);
      return;
    }

    setIsGenerating(true);
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: newPrompt,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setNewPrompt('');

    try {
      const result = await onPromptSubmit(newPrompt);
      
      // Add AI response message
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: result.description,
        timestamp: new Date(),
        code: result.code,
        framework: result.framework as 'react' | 'vue' | 'vanilla'
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setCurrentApp(result);
      setPreviewError(null);
      
    } catch (error) {
      console.error('Failed to refine app:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'system',
        content: 'Sorry, I encountered an error refining your app. Please try again.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthGate(false);
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={cn("w-full max-w-7xl mx-auto", className)}>
      {/* Session Info Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <SparklesIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">AI App Builder</h2>
            <p className="text-sm text-gray-600">Interactive development session</p>
          </div>
        </div>
        
        <PromptCounter
          promptsUsed={promptsUsed}
          promptsRemaining={promptsRemaining}
          totalPrompts={totalPrompts}
          isAuthenticated={isAuthenticated}
          onAuthClick={() => setShowAuthGate(true)}
          className="w-80"
        />
      </div>

      {/* Main Split View */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Chat Interface */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col h-[600px]"
        >
          {/* Chat Header */}
          <div className="border-b border-gray-200 p-4">
            <div className="flex items-center space-x-2">
              <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-gray-900">Development Chat</span>
              <div className="flex-1"></div>
              <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {messages.length} messages
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "flex",
                    message.type === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  <div className={cn(
                    "max-w-[80%] rounded-lg p-3",
                    message.type === 'user' 
                      ? "bg-blue-600 text-white" 
                      : message.type === 'ai'
                        ? "bg-gray-100 text-gray-900"
                        : "bg-amber-50 text-amber-800 border border-amber-200"
                  )}>
                    {/* Message Header */}
                    <div className="flex items-center space-x-2 mb-2">
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center",
                        message.type === 'user' 
                          ? "bg-blue-500" 
                          : message.type === 'ai'
                            ? "bg-gray-200"
                            : "bg-amber-200"
                      )}>
                        {message.type === 'user' ? (
                          <UserIcon className="h-3 w-3 text-white" />
                        ) : message.type === 'ai' ? (
                          <SparklesIcon className="h-3 w-3 text-gray-600" />
                        ) : (
                          <CheckCircleIcon className="h-3 w-3 text-amber-600" />
                        )}
                      </div>
                      <span className="text-xs opacity-75">
                        {formatTimestamp(message.timestamp)}
                      </span>
                    </div>

                    {/* Message Content */}
                    <div className="text-sm leading-relaxed">
                      {message.content}
                    </div>

                    {/* Code Indicator */}
                    {message.code && (
                      <div className="mt-2 pt-2 border-t border-gray-200 text-xs opacity-75 flex items-center space-x-1">
                        <ComputerDesktopIcon className="h-3 w-3" />
                        <span>Generated {message.framework} code</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Generating Indicator */}
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm">AI is working on your request...</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4">
            <form onSubmit={handlePromptSubmit} className="flex space-x-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={newPrompt}
                  onChange={(e) => setNewPrompt(e.target.value)}
                  placeholder={promptsRemaining > 0 ? "Refine your app..." : "Sign up to continue..."}
                  disabled={isGenerating || promptsRemaining <= 0}
                  className={cn(
                    "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors",
                    (isGenerating || promptsRemaining <= 0) && "opacity-50 cursor-not-allowed"
                  )}
                />
              </div>
              <button
                type="submit"
                disabled={!newPrompt.trim() || isGenerating || promptsRemaining <= 0}
                className={cn(
                  "px-6 py-2 text-white font-medium rounded-lg transition-colors duration-200",
                  newPrompt.trim() && !isGenerating && promptsRemaining > 0
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-300 cursor-not-allowed"
                )}
              >
                {isGenerating ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Send'
                )}
              </button>
            </form>
            
            {promptsRemaining <= 0 && (
              <div className="mt-2 text-xs text-amber-600">
                ⚠️ Out of prompts. Sign up to continue building your app.
              </div>
            )}
          </div>
        </motion.div>

        {/* Preview Area */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="h-[600px]"
        >
          <CodePreview
            code={currentApp?.code || '// Your generated app will appear here...'}
            framework={currentApp?.framework || 'react'}
            isLoading={isGenerating}
            error={previewError}
            onRefresh={() => {
              if (currentApp) {
                setPreviewError(null);
              }
            }}
            className="h-full"
          />
        </motion.div>
      </div>

      {/* Quick Actions */}
      {currentApp && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 bg-gray-50 rounded-xl p-4 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Quick Actions</h3>
              <p className="text-sm text-gray-600">Common refinements to improve your app</p>
            </div>
            
            <div className="flex space-x-2">
              {[
                "Add responsive design",
                "Include loading states",
                "Add error handling",
                "Improve accessibility"
              ].map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (promptsRemaining > 0) {
                      setNewPrompt(suggestion);
                    } else {
                      setShowAuthGate(true);
                    }
                  }}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors duration-200"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Auth Gate Modal */}
      <AuthGate
        isOpen={showAuthGate}
        onClose={() => setShowAuthGate(false)}
        onSignUp={async (email, password, name) => {
          // Handle sign up - this will be connected to the actual auth system
          console.log('Sign up:', { email, name });
          handleAuthSuccess();
        }}
        onSignIn={async (email, password) => {
          // Handle sign in - this will be connected to the actual auth system
          console.log('Sign in:', { email });
          handleAuthSuccess();
        }}
        promptsUsed={promptsUsed}
      />
    </div>
  );
}