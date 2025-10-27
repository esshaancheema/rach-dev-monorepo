'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  LightBulbIcon,
  SparklesIcon,
  ClockIcon,
  ArrowRightIcon,
  BeakerIcon,
  RocketLaunchIcon,
  CodeBracketIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface GuidedAppGenerationFlowProps {
  isVisible: boolean;
  currentStep: 'input' | 'analyzing' | 'generating' | 'preview' | 'completed';
  progress: number;
  prompt?: string;
  framework?: string;
  features?: string[];
  tips?: string[];
  onClose?: () => void;
  className?: string;
}

interface Tip {
  id: string;
  type: 'info' | 'warning' | 'success' | 'idea';
  title: string;
  message: string;
  icon: React.ComponentType<any>;
  timing: 'input' | 'analyzing' | 'generating' | 'preview' | 'completed';
}

const GUIDED_TIPS: Tip[] = [
  // Input Stage Tips
  {
    id: 'be-specific',
    type: 'idea',
    title: 'Be Specific for Better Results',
    message: 'Include details about functionality, styling preferences, and user interactions. The more specific you are, the better your generated app will match your vision.',
    icon: LightBulbIcon,
    timing: 'input'
  },
  {
    id: 'mention-features',
    type: 'info',
    title: 'Mention Key Features',
    message: 'List important features like "drag and drop", "dark mode", "responsive design", or "local storage" to ensure they\'re included.',
    icon: InformationCircleIcon,
    timing: 'input'
  },
  {
    id: 'framework-hint',
    type: 'success',
    title: 'Framework Selection',
    message: 'Our AI will automatically choose the best framework for your app, but you can specify "React", "Vue", or "vanilla JavaScript" if you have a preference.',
    icon: CheckCircleIcon,
    timing: 'input'
  },

  // Analyzing Stage Tips
  {
    id: 'ai-analysis',
    type: 'info',
    title: 'AI is Analyzing Your Request',
    message: 'We\'re breaking down your description to identify the best framework, required features, and optimal architecture for your app.',
    icon: BeakerIcon,
    timing: 'analyzing'
  },
  {
    id: 'complexity-detection',
    type: 'idea',
    title: 'Complexity Assessment',
    message: 'The AI is evaluating your app\'s complexity to determine the best approach and ensure all features are properly implemented.',
    icon: ChatBubbleLeftRightIcon,
    timing: 'analyzing'
  },

  // Generating Stage Tips
  {
    id: 'code-generation',
    type: 'success',
    title: 'Generating Your App',
    message: 'Creating optimized, production-ready code with modern best practices, accessibility features, and responsive design.',
    icon: CodeBracketIcon,
    timing: 'generating'
  },
  {
    id: 'best-practices',
    type: 'info',
    title: 'Following Best Practices',
    message: 'Your app includes modern coding standards, error handling, performance optimizations, and clean, maintainable code structure.',
    icon: RocketLaunchIcon,
    timing: 'generating'
  },
  {
    id: 'testing-validation',
    type: 'warning',
    title: 'Quality Assurance',
    message: 'Running automated checks to ensure your app is error-free and follows security best practices.',
    icon: ExclamationCircleIcon,
    timing: 'generating'
  },

  // Preview Stage Tips
  {
    id: 'preview-features',
    type: 'success',
    title: 'Explore Your App',
    message: 'Test different device sizes, view the source code, and see how your app performs. All features are fully functional in the preview.',
    icon: EyeIcon,
    timing: 'preview'
  },
  {
    id: 'customization',
    type: 'idea',
    title: 'Need Changes?',
    message: 'You can refine your app by providing additional instructions or create a new version with different requirements.',
    icon: LightBulbIcon,
    timing: 'preview'
  },

  // Completed Stage Tips
  {
    id: 'download-options',
    type: 'success',
    title: 'Ready to Use',
    message: 'Download your app as a single file or complete project structure. Both options include everything needed to run your app.',
    icon: CheckCircleIcon,
    timing: 'completed'
  },
  {
    id: 'next-steps',
    type: 'info',
    title: 'What\'s Next?',
    message: 'You can customize further, deploy to hosting platforms, or use this as a starting point for a larger application.',
    icon: RocketLaunchIcon,
    timing: 'completed'
  }
];

const stepInfo = {
  input: {
    title: 'Describe Your App',
    description: 'Tell us what you want to build',
    color: 'blue',
    icon: ChatBubbleLeftRightIcon
  },
  analyzing: {
    title: 'Analyzing Request',
    description: 'Understanding your requirements',
    color: 'yellow',
    icon: BeakerIcon
  },
  generating: {
    title: 'Generating Code',
    description: 'Building your application',
    color: 'purple',
    icon: CodeBracketIcon
  },
  preview: {
    title: 'Testing & Preview',
    description: 'Your app is ready to explore',
    color: 'green',
    icon: EyeIcon
  },
  completed: {
    title: 'App Complete',
    description: 'Ready to download and use',
    color: 'emerald',
    icon: CheckCircleIcon
  }
};

export default function GuidedAppGenerationFlow({
  isVisible,
  currentStep,
  progress,
  prompt,
  framework,
  features = [],
  tips = [],
  onClose,
  className
}: GuidedAppGenerationFlowProps) {
  const [visibleTip, setVisibleTip] = useState<Tip | null>(null);
  const [tipIndex, setTipIndex] = useState(0);

  const currentStepInfo = stepInfo[currentStep];
  const relevantTips = GUIDED_TIPS.filter(tip => tip.timing === currentStep);

  // Show tips based on current step
  useEffect(() => {
    if (relevantTips.length === 0) {
      setVisibleTip(null);
      return;
    }

    // Show first tip immediately
    setVisibleTip(relevantTips[0]);
    setTipIndex(0);

    // Cycle through tips for the current step
    if (relevantTips.length > 1) {
      const interval = setInterval(() => {
        setTipIndex(prev => {
          const nextIndex = (prev + 1) % relevantTips.length;
          setVisibleTip(relevantTips[nextIndex]);
          return nextIndex;
        });
      }, 4000); // Change tip every 4 seconds

      return () => clearInterval(interval);
    }
  }, [currentStep, relevantTips]);

  const getTipIcon = (tip: Tip) => {
    const iconClass = cn(
      "h-5 w-5",
      {
        'text-blue-500': tip.type === 'info',
        'text-yellow-500': tip.type === 'warning',
        'text-green-500': tip.type === 'success',
        'text-purple-500': tip.type === 'idea'
      }
    );
    return <tip.icon className={iconClass} />;
  };

  const getTipBorderColor = (type: string) => {
    switch (type) {
      case 'info': return 'border-blue-200 bg-blue-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'success': return 'border-green-200 bg-green-50';
      case 'idea': return 'border-purple-200 bg-purple-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  if (!isVisible) return null;

  return (
    <div className={cn("fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4", className)}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <currentStepInfo.icon className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{currentStepInfo.title}</h2>
                <p className="text-blue-100 text-sm">{currentStepInfo.description}</p>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-xs text-blue-100 mb-2">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="bg-white rounded-full h-2"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Current Step Details */}
          {prompt && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Your Request:</h3>
              <p className="text-gray-700 text-sm italic">"{prompt}"</p>
            </div>
          )}

          {/* Framework & Features Info */}
          {(framework || features.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {framework && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <h4 className="font-medium text-blue-900 text-sm mb-1">Framework</h4>
                  <p className="text-blue-700 capitalize">{framework}</p>
                </div>
              )}
              {features.length > 0 && (
                <div className="bg-green-50 rounded-lg p-3">
                  <h4 className="font-medium text-green-900 text-sm mb-1">Key Features</h4>
                  <p className="text-green-700 text-sm">{features.slice(0, 2).join(', ')}</p>
                </div>
              )}
            </div>
          )}

          {/* Dynamic Tip */}
          <AnimatePresence mode="wait">
            {visibleTip && (
              <motion.div
                key={visibleTip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={cn("border rounded-lg p-4", getTipBorderColor(visibleTip.type))}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getTipIcon(visibleTip)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm mb-1">
                      {visibleTip.title}
                    </h4>
                    <p className="text-gray-700 text-sm">{visibleTip.message}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step Indicators */}
          <div className="flex items-center justify-between">
            {Object.entries(stepInfo).map(([step, info], index) => (
              <div key={step} className="flex items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                    step === currentStep
                      ? "bg-blue-600 text-white"
                      : Object.keys(stepInfo).indexOf(currentStep) > index
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-600"
                  )}
                >
                  {Object.keys(stepInfo).indexOf(currentStep) > index ? (
                    <CheckCircleIcon className="h-5 w-5" />
                  ) : (
                    <info.icon className="h-4 w-4" />
                  )}
                </div>
                {index < Object.keys(stepInfo).length - 1 && (
                  <div
                    className={cn(
                      "w-8 h-0.5 mx-1 transition-colors",
                      Object.keys(stepInfo).indexOf(currentStep) > index ? "bg-green-500" : "bg-gray-200"
                    )}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Status Animation */}
          {(currentStep === 'analyzing' || currentStep === 'generating') && (
            <div className="flex items-center justify-center py-4">
              <div className="flex space-x-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0.8, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      repeatType: "reverse",
                      delay: i * 0.2
                    }}
                    className={cn(
                      "w-3 h-3 rounded-full",
                      currentStep === 'analyzing' ? "bg-yellow-500" : "bg-purple-500"
                    )}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Custom Tips */}
          {tips.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 text-sm">Additional Tips:</h4>
              {tips.map((tip, index) => (
                <div key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                  <SparklesIcon className="h-4 w-4 text-purple-500 flex-shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          )}

          {/* Time Estimate */}
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <ClockIcon className="h-4 w-4" />
            <span>
              {currentStep === 'input' && 'Ready when you are'}
              {currentStep === 'analyzing' && 'Analyzing... ~10 seconds'}
              {currentStep === 'generating' && 'Generating... ~30-60 seconds'}
              {currentStep === 'preview' && 'Your app is ready!'}
              {currentStep === 'completed' && 'All done!'}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}