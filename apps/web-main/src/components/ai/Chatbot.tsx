// AI-Powered Chatbot Component
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Minimize2, Maximize2, Bot, User, Paperclip, Sparkles } from 'lucide-react';
import { ZoptalChatbot, ChatbotConfig } from '@/lib/ai/chatbot';
import { ChatMessage, ChatResponse } from '@/lib/ai/types';
import { cn } from '@/lib/utils';
import { analytics } from '@/lib/analytics/tracker';

interface ChatbotProps {
  config?: Partial<ChatbotConfig>;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  theme?: 'light' | 'dark' | 'auto';
  startMinimized?: boolean;
  customStyles?: React.CSSProperties;
}

export function Chatbot({ 
  config,
  position = 'bottom-right',
  theme = 'auto',
  startMinimized = true,
  customStyles
}: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(!startMinimized);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [suggestedActions, setSuggestedActions] = useState<string[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatbotRef = useRef<ZoptalChatbot | null>(null);

  // Initialize chatbot
  useEffect(() => {
    const defaultConfig: ChatbotConfig = {
      apiEndpoint: '/api/ai/chat',
      model: 'gpt-4',
      maxTokens: 2000,
      temperature: 0.7,
      systemPrompt: 'You are Zoptal\'s helpful AI assistant.',
      knowledgeBase: [],
      enableSentimentAnalysis: true,
      enableIntentRecognition: true,
      enableContextMemory: true,
      maxContextHistory: 10,
      ...config
    };

    chatbotRef.current = new ZoptalChatbot(defaultConfig);
    initializeSession();

    return () => {
      if (sessionId) {
        chatbotRef.current?.endSession(sessionId);
      }
    };
  }, [config]);

  // Initialize chat session
  const initializeSession = async () => {
    try {
      const context = {
        page: window.location.pathname,
        userAgent: navigator.userAgent,
        referrer: document.referrer
      };

      const newSessionId = await chatbotRef.current!.startSession(undefined, context);
      setSessionId(newSessionId);

      // Get welcome message
      const session = chatbotRef.current!.getSession(newSessionId);
      if (session && session.messages.length > 0) {
        setMessages([session.messages[0]]);
      }

      // Track chatbot opened
      analytics.track({
        name: 'chatbot_opened',
        category: 'user_interaction',
        properties: {
          page: window.location.pathname,
          sessionId: newSessionId
        }
      });
    } catch (error) {
      console.error('Failed to initialize chat session:', error);
    }
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Send message
  const sendMessage = async (message: string) => {
    if (!message.trim() || !sessionId || !chatbotRef.current) return;

    // Add user message immediately
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setSuggestedActions([]);

    try {
      // Process message
      const response = await chatbotRef.current.processMessage(sessionId, message);
      
      // Add assistant response
      const assistantMessage: ChatMessage = {
        id: response.messageId,
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
        suggestedActions: response.suggestedActions
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      if (response.suggestedActions) {
        setSuggestedActions(response.suggestedActions);
      }

      // Track message sent
      analytics.track({
        name: 'chatbot_message_sent',
        category: 'user_interaction',
        properties: {
          sessionId,
          intent: response.intent,
          confidence: response.confidence
        }
      });

    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: `msg_error_${Date.now()}`,
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again or contact our support team directly.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  // Handle suggested action click
  const handleSuggestedAction = (action: string) => {
    sendMessage(action);
  };

  // Handle file attachment (placeholder)
  const handleFileAttachment = () => {
    // TODO: Implement file attachment functionality
    console.info('File attachment clicked');
  };

  // Position classes
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4'
  };

  return (
    <>
      {/* Chat Widget Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className={cn(
              'fixed z-50 w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600',
              'shadow-lg hover:shadow-xl transition-shadow duration-200',
              'flex items-center justify-center text-white',
              positionClasses[position]
            )}
            style={customStyles}
          >
            <Bot className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'fixed z-50 w-96 bg-white dark:bg-gray-900 rounded-lg shadow-2xl',
              'flex flex-col overflow-hidden',
              isMinimized ? 'h-14' : 'h-[600px]',
              positionClasses[position]
            )}
            style={customStyles}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <div className="flex items-center space-x-2">
                <Bot className="w-5 h-5" />
                <span className="font-semibold">Zoptal AI Assistant</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Container */}
            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                  ))}
                  
                  {isTyping && (
                    <div className="flex items-center space-x-2 text-gray-500">
                      <Bot className="w-4 h-4" />
                      <div className="flex space-x-1">
                        <motion.div
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="w-2 h-2 bg-gray-400 rounded-full"
                        />
                        <motion.div
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                          className="w-2 h-2 bg-gray-400 rounded-full"
                        />
                        <motion.div
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                          className="w-2 h-2 bg-gray-400 rounded-full"
                        />
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Suggested Actions */}
                {suggestedActions.length > 0 && (
                  <div className="px-4 py-2 border-t dark:border-gray-800">
                    <div className="flex flex-wrap gap-2">
                      {suggestedActions.map((action, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestedAction(action)}
                          className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input Form */}
                <form onSubmit={handleSubmit} className="p-4 border-t dark:border-gray-800">
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={handleFileAttachment}
                      className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    >
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isTyping}
                    />
                    <button
                      type="submit"
                      disabled={!inputValue.trim() || isTyping}
                      className={cn(
                        'p-2 rounded-lg transition-colors',
                        inputValue.trim() && !isTyping
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      )}
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Message Bubble Component
function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex', isUser ? 'justify-end' : 'justify-start')}
    >
      <div className={cn('flex items-start space-x-2 max-w-[80%]', isUser && 'flex-row-reverse space-x-reverse')}>
        <div className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center',
          isUser ? 'bg-blue-600' : 'bg-gradient-to-r from-blue-600 to-purple-600'
        )}>
          {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
        </div>
        <div
          className={cn(
            'px-4 py-2 rounded-lg',
            isUser
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
          )}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          {message.confidence !== undefined && (
            <div className="flex items-center mt-1 text-xs opacity-70">
              <Sparkles className="w-3 h-3 mr-1" />
              {Math.round(message.confidence * 100)}% confident
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}