'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChatbotMessage } from '@/lib/demos/types';
import { 
  PaperAirplaneIcon, 
  UserIcon, 
  SparklesIcon,
  ChartBarIcon,
  ClockIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';

interface AIChatbotDemoProps {
  onMessage?: (message: ChatbotMessage) => void;
}

export default function AIChatbotDemo({ onMessage }: AIChatbotDemoProps) {
  const [messages, setMessages] = useState<ChatbotMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm Zoptal's AI assistant demo. I'm here to showcase how our AI chatbots can help your business provide instant, intelligent customer support. Try asking me about our services, pricing, or anything else!",
      timestamp: Date.now(),
      metadata: {
        confidence: 1.0,
        intent: 'greeting',
        suggestions: ['Tell me about your services', 'What are your pricing options?', 'How do I get started?']
      }
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId] = useState(`demo_${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (messageText?: string) => {
    const text = messageText || inputMessage.trim();
    if (!text) return;

    const userMessage: ChatbotMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    onMessage?.(userMessage);

    try {
      const response = await fetch('/api/demos/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          conversationId,
          userId: 'demo_user'
        }),
      });

      const data = await response.json();

      const assistantMessage: ChatbotMessage = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: data.response,
        timestamp: data.timestamp,
        metadata: {
          confidence: data.confidence,
          intent: data.intent,
          suggestions: data.suggestions
        }
      };

      setMessages(prev => [...prev, assistantMessage]);
      onMessage?.(assistantMessage);

    } catch (error) {
      console.error('Chatbot error:', error);
      
      const errorMessage: ChatbotMessage = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: "I apologize, but I'm experiencing some technical difficulties. This is just a demo, but our production chatbots have robust error handling and always provide helpful responses!",
        timestamp: Date.now(),
        metadata: {
          confidence: 0,
          intent: 'error',
          suggestions: ['Try again', 'Tell me about your services', 'Contact support']
        }
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const lastAssistantMessage = messages.filter(m => m.role === 'assistant').slice(-1)[0];
  const suggestions = lastAssistantMessage?.metadata?.suggestions || [];

  return (
    <div className="bg-white rounded-xl shadow-2xl h-[600px] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <SparklesIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">Zoptal AI Assistant</h3>
              <p className="text-blue-100 text-sm">Powered by advanced AI</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-blue-100">
            <div className="flex items-center text-xs">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
              Online
            </div>
            <div className="flex items-center text-xs">
              <ClockIcon className="h-3 w-3 mr-1" />
              Response: ~1s
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-xs lg:max-w-md ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar */}
              <div className={`flex-shrink-0 ${message.role === 'user' ? 'ml-3' : 'mr-3'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                }`}>
                  {message.role === 'user' ? (
                    <UserIcon className="h-4 w-4" />
                  ) : (
                    <SparklesIcon className="h-4 w-4" />
                  )}
                </div>
              </div>

              {/* Message Bubble */}
              <div className={`rounded-2xl px-4 py-3 shadow-sm ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-800 border border-gray-200'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                
                {/* Metadata for assistant messages */}
                {message.role === 'assistant' && message.metadata && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center">
                        <ChartBarIcon className="h-3 w-3 mr-1" />
                        <span>Confidence: {(message.metadata.confidence * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex items-center">
                        <LightBulbIcon className="h-3 w-3 mr-1" />
                        <span>Intent: {message.metadata.intent}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex mr-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center justify-center">
                <SparklesIcon className="h-4 w-4" />
              </div>
            </div>
            <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-200">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && !isTyping && (
        <div className="px-4 py-2 bg-white border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2">Quick suggestions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.slice(0, 3).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-full transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex space-x-3">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message here..."
            disabled={isTyping}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!inputMessage.trim() || isTyping}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            <PaperAirplaneIcon className="h-4 w-4" />
          </button>
        </div>
        
        <p className="text-xs text-gray-500 mt-2 text-center">
          💡 This is a demo chatbot. Our production AI provides more sophisticated responses and integrates with your business systems.
        </p>
      </div>
    </div>
  );
}