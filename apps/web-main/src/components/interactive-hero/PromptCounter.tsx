'use client';

import { motion } from 'framer-motion';
import { 
  SparklesIcon, 
  LockClosedIcon,
  UserPlusIcon 
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface PromptCounterProps {
  promptsUsed: number;
  promptsRemaining: number;
  totalPrompts: number;
  isAuthenticated: boolean;
  onAuthClick?: () => void;
  className?: string;
}

export default function PromptCounter({ 
  promptsUsed, 
  promptsRemaining, 
  totalPrompts,
  isAuthenticated,
  onAuthClick,
  className 
}: PromptCounterProps) {
  const progressPercentage = (promptsUsed / totalPrompts) * 100;
  const isLowOnPrompts = promptsRemaining <= 1;
  const isOutOfPrompts = promptsRemaining === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-white rounded-xl shadow-lg border border-gray-200 p-4",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center",
            isOutOfPrompts 
              ? "bg-red-100" 
              : isLowOnPrompts 
                ? "bg-amber-100" 
                : "bg-blue-100"
          )}>
            {isOutOfPrompts ? (
              <LockClosedIcon className="h-3 w-3 text-red-600" />
            ) : (
              <SparklesIcon className="h-3 w-3 text-blue-600" />
            )}
          </div>
          <span className="text-sm font-medium text-gray-700">
            {isAuthenticated ? 'Premium Prompts' : 'Free Prompts'}
          </span>
        </div>
        
        <div className={cn(
          "text-sm font-bold",
          isOutOfPrompts 
            ? "text-red-600" 
            : isLowOnPrompts 
              ? "text-amber-600" 
              : "text-gray-700"
        )}>
          {promptsRemaining} left
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={cn(
              "h-full rounded-full transition-colors duration-300",
              isOutOfPrompts 
                ? "bg-red-500" 
                : isLowOnPrompts 
                  ? "bg-amber-500" 
                  : "bg-gradient-to-r from-blue-500 to-indigo-600"
            )}
          />
        </div>
        
        <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
          <span>Used: {promptsUsed}</span>
          <span>Total: {totalPrompts}</span>
        </div>
      </div>

      {/* Status Message & Actions */}
      {isOutOfPrompts ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3"
        >
          <div className="text-sm text-red-600 font-medium">
            🚫 You've used all your free prompts
          </div>
          
          {!isAuthenticated && (
            <button
              onClick={onAuthClick}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg"
            >
              <UserPlusIcon className="h-4 w-4" />
              <span>Sign Up for 3 More Prompts</span>
            </button>
          )}
        </motion.div>
      ) : isLowOnPrompts ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3"
        >
          <div className="text-sm text-amber-600 font-medium">
            ⚠️ Only {promptsRemaining} prompt{promptsRemaining === 1 ? '' : 's'} remaining
          </div>
          
          {!isAuthenticated && (
            <button
              onClick={onAuthClick}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <UserPlusIcon className="h-4 w-4" />
              <span>Sign Up for More Prompts</span>
            </button>
          )}
        </motion.div>
      ) : (
        <div className="space-y-2">
          <div className="text-sm text-gray-600">
            {isAuthenticated ? (
              "✨ Enjoying premium access"
            ) : (
              "🎯 Make each prompt count for best results"
            )}
          </div>
          
          {!isAuthenticated && promptsRemaining > 1 && (
            <button
              onClick={onAuthClick}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <UserPlusIcon className="h-4 w-4" />
              <span>Sign Up for 3 More Prompts</span>
            </button>
          )}
        </div>
      )}

      {/* Authentication Status */}
      {isAuthenticated && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="text-xs text-green-600 flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Premium Member - Extended Limits</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}