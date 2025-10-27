'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { 
  SparklesIcon, 
  PaperAirplaneIcon,
  LightBulbIcon 
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface AppIdeaInputProps {
  onSubmit: (idea: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const examplePrompts = [
  "A task management app with drag-and-drop functionality",
  "A real-time chat application with emoji reactions",
  "A recipe sharing platform with meal planning",
  "A fitness tracking app with social features",
  "A personal finance dashboard with expense categorization"
];

export default function AppIdeaInput({ 
  onSubmit, 
  isLoading = false, 
  placeholder = "Describe the app you want to build...",
  className,
  disabled = false
}: AppIdeaInputProps) {
  const [idea, setIdea] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (idea.trim() && !isLoading && !disabled) {
      onSubmit(idea.trim());
      setIdea('');
      setShowExamples(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleExampleClick = (example: string) => {
    setIdea(example);
    setShowExamples(false);
    textareaRef.current?.focus();
  };

  const handleFocus = () => {
    setIsFocused(true);
    setShowExamples(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Delay hiding examples to allow clicking
    setTimeout(() => setShowExamples(false), 200);
  };

  return (
    <div className={cn("relative w-full max-w-4xl mx-auto", className)}>
      {/* Main Input Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={cn(
          "relative bg-white rounded-2xl shadow-xl border-2 transition-all duration-300",
          isFocused 
            ? "border-blue-500 shadow-2xl shadow-blue-500/10" 
            : "border-gray-200 hover:border-gray-300",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        {/* Input Header */}
        <div className="flex items-center justify-between p-4 pb-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <SparklesIcon className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700">
              AI App Builder
            </span>
          </div>
          
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <LightBulbIcon className="h-3 w-3" />
            <span>Be specific for better results</span>
          </div>
        </div>

        {/* Textarea */}
        <div className="relative px-4 pb-4">
          <textarea
            ref={textareaRef}
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled || isLoading}
            className={cn(
              "w-full min-h-[120px] max-h-[200px] px-4 py-3 text-lg text-gray-900 placeholder-gray-500 bg-transparent border-0 resize-none focus:outline-none",
              "scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
            )}
            rows={4}
          />

          {/* Submit Button */}
          <motion.button
            onClick={handleSubmit}
            disabled={!idea.trim() || isLoading || disabled}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "absolute bottom-6 right-6 w-12 h-12 rounded-full shadow-lg transition-all duration-200 flex items-center justify-center",
              idea.trim() && !isLoading && !disabled
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/25"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <PaperAirplaneIcon className="h-5 w-5" />
            )}
          </motion.button>
        </div>

        {/* Character Count */}
        {idea.length > 0 && (
          <div className="px-4 pb-2">
            <div className="text-xs text-gray-400 text-right">
              {idea.length}/500 characters
            </div>
          </div>
        )}
      </motion.div>

      {/* Example Prompts */}
      {showExamples && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full left-0 right-0 z-10 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 p-4"
        >
          <div className="text-sm font-medium text-gray-700 mb-3">
            Try these examples:
          </div>
          <div className="space-y-2">
            {examplePrompts.map((example, index) => (
              <motion.button
                key={index}
                onClick={() => handleExampleClick(example)}
                whileHover={{ scale: 1.01 }}
                className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-150"
              >
                {example}
              </motion.button>
            ))}
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="text-xs text-gray-500">
              💡 Tip: Include features like "with user authentication", "responsive design", 
              or "real-time updates" for more complete apps
            </div>
          </div>
        </motion.div>
      )}

      {/* Loading State Overlay */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-20"
        >
          <div className="flex flex-col items-center space-y-3">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <div className="text-sm font-medium text-gray-700">
              Creating your app...
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}