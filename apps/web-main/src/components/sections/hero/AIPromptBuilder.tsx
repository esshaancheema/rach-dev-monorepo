'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  SparklesIcon, 
  ArrowRightIcon,
  ClockIcon,
  CheckIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';

interface AIPromptBuilderProps {
  onSubmit: (prompt: string) => void;
  isBuilding: boolean;
  freeTrialLimit: number;
}

const samplePrompts = [
  {
    category: "E-Commerce",
    prompt: "Build a modern e-commerce platform with user authentication, product catalog, shopping cart, and Stripe payment integration",
    complexity: "Advanced",
    estimatedTime: "2-3 hours"
  },
  {
    category: "SaaS",
    prompt: "Create a project management SaaS with team collaboration, task tracking, time logging, and real-time notifications",
    complexity: "Expert",
    estimatedTime: "3-4 hours"
  },
  {
    category: "Mobile App",
    prompt: "Develop a fitness tracking mobile app with workout plans, progress tracking, social features, and wearable integration",
    complexity: "Advanced",
    estimatedTime: "4-5 hours"
  },
  {
    category: "AI Tool",
    prompt: "Build an AI-powered content generator with multiple templates, customization options, and export functionality",
    complexity: "Expert",
    estimatedTime: "2-3 hours"
  },
  {
    category: "Dashboard",
    prompt: "Create an analytics dashboard with real-time data visualization, interactive charts, and customizable widgets",
    complexity: "Intermediate",
    estimatedTime: "1-2 hours"
  }
];

const complexityColors = {
  "Beginner": "bg-green-100 text-green-700",
  "Intermediate": "bg-yellow-100 text-yellow-700", 
  "Advanced": "bg-orange-100 text-orange-700",
  "Expert": "bg-red-100 text-red-700"
};

export function AIPromptBuilder({ onSubmit, isBuilding, freeTrialLimit }: AIPromptBuilderProps) {
  const [prompt, setPrompt] = useState('');
  const [selectedSample, setSelectedSample] = useState<number | null>(null);
  const [trialUsed, setTrialUsed] = useState(0);
  const [showSamples, setShowSamples] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [prompt]);

  const handleSubmit = () => {
    if (!prompt.trim() || trialUsed >= freeTrialLimit) return;
    
    setTrialUsed(prev => prev + 1);
    onSubmit(prompt);
  };

  const handleSampleSelect = (index: number) => {
    setSelectedSample(index);
    setPrompt(samplePrompts[index].prompt);
    setShowSamples(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isTrialExceeded = trialUsed >= freeTrialLimit;
  const canSubmit = prompt.trim() && !isBuilding && !isTrialExceeded;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BeakerIcon className="w-6 h-6" />
            <h3 className="text-xl font-bold">AI App Builder</h3>
          </div>
          <div className="text-sm bg-white bg-opacity-20 px-3 py-1 rounded-full">
            Free Trial: {freeTrialLimit - trialUsed} left
          </div>
        </div>
        <p className="text-primary-100 mt-2">
          Describe your app idea and watch our AI build it in real-time
        </p>
      </div>

      {/* Prompt Input */}
      <div className="p-6">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe the application you want to build... (e.g., 'Build a social media app with user profiles, posts, comments, and real-time messaging')"
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none min-h-[120px] text-gray-900 placeholder-gray-500"
            disabled={isTrialExceeded}
          />
          
          {/* Character counter */}
          <div className="absolute bottom-2 right-2 text-xs text-gray-400">
            {prompt.length}/500
          </div>
        </div>

        {/* Sample Prompts */}
        {showSamples && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4"
          >
            <p className="text-sm text-gray-600 mb-3">Try these sample prompts:</p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {samplePrompts.map((sample, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleSampleSelect(index)}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all group"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-primary-600">
                          {sample.category}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${complexityColors[sample.complexity as keyof typeof complexityColors]}`}>
                          {sample.complexity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2 group-hover:text-gray-900">
                        {sample.prompt}
                      </p>
                      <div className="flex items-center space-x-1 mt-2 text-xs text-gray-500">
                        <ClockIcon className="w-3 h-3" />
                        <span>{sample.estimatedTime}</span>
                      </div>
                    </div>
                    <ArrowRightIcon className="w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Build Button */}
        <div className="mt-6">
          <motion.button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all ${
              canSubmit
                ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white hover:from-primary-700 hover:to-secondary-700 shadow-lg hover:shadow-xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            whileHover={canSubmit ? { scale: 1.02 } : {}}
            whileTap={canSubmit ? { scale: 0.98 } : {}}
          >
            {isBuilding ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Building Your App...</span>
              </div>
            ) : isTrialExceeded ? (
              <div className="flex items-center justify-center space-x-2">
                <CheckIcon className="w-5 h-5" />
                <span>Free Trial Complete - Upgrade to Continue</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <SparklesIcon className="w-5 h-5" />
                <span>Build with AI</span>
                <span className="text-sm opacity-75">(⌘ + Enter)</span>
              </div>
            )}
          </motion.button>
        </div>

        {/* Trial Information */}
        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-3">
            <SparklesIcon className="w-5 h-5 text-blue-500 mt-0.5" />
            <div className="text-sm">
              <p className="text-gray-700 font-medium mb-1">
                Free Trial includes:
              </p>
              <ul className="text-gray-600 space-y-1">
                <li>• {freeTrialLimit} AI-generated applications</li>
                <li>• Full source code access</li>
                <li>• Basic deployment assistance</li>
                <li>• 24-hour support response</li>
              </ul>
              {isTrialExceeded && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-primary-600 font-medium mt-2"
                >
                  Want to build more? <a href="/pricing" className="underline">Upgrade to Pro</a>
                </motion.p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}