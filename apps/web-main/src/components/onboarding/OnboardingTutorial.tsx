'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  SparklesIcon,
  CodeBracketIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
  targetElement?: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

interface OnboardingTutorialProps {
  isVisible: boolean;
  onComplete: () => void;
  onSkip: () => void;
  onTryExample?: (prompt: string) => void;
}

const EXAMPLE_PROMPTS = [
  {
    title: "Todo App",
    prompt: "Create a simple todo list app with the ability to add, complete, and delete tasks",
    icon: "📝",
    framework: "react"
  },
  {
    title: "Weather Dashboard", 
    prompt: "Build a weather dashboard with current conditions and 5-day forecast",
    icon: "🌤️",
    framework: "vue"
  },
  {
    title: "Calculator",
    prompt: "Design a basic calculator with arithmetic operations",
    icon: "🧮", 
    framework: "vanilla"
  },
  {
    title: "Portfolio Site",
    prompt: "Create a personal portfolio website with projects showcase and contact form",
    icon: "💼",
    framework: "react"
  }
];

export default function OnboardingTutorial({
  isVisible,
  onComplete,
  onSkip,
  onTryExample
}: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showExamples, setShowExamples] = useState(false);

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to AI App Builder! 🎉',
      description: 'Create full-stack applications with just natural language descriptions',
      content: (
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <SparklesIcon className="h-8 w-8 text-white" />
          </div>
          <p className="text-gray-600 mb-6">
            Transform your ideas into working applications in seconds using the power of AI. 
            No coding experience required!
          </p>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <CodeBracketIcon className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-xs text-gray-600">Generate Code</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <EyeIcon className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-xs text-gray-600">Live Preview</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <ArrowDownTrayIcon className="h-6 w-6 text-purple-600" />
              </div>
              <p className="text-xs text-gray-600">Download</p>
            </div>
          </div>
        </div>
      ),
      position: 'center'
    },
    {
      id: 'input',
      title: 'Describe Your App Idea',
      description: 'Use natural language to describe what you want to build',
      content: (
        <div>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div className="bg-white rounded p-3">
              <p className="text-sm text-gray-500 mb-2">Try typing:</p>
              <p className="text-gray-800 italic">
                "Create a todo app with drag and drop functionality"
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Be specific about features, styling, and functionality. The more details you provide, 
            the better your generated app will be!
          </p>
        </div>
      ),
      targetElement: '.app-idea-input',
      position: 'bottom'
    },
    {
      id: 'examples',
      title: 'Need Inspiration? Try These Examples',
      description: 'Click any example to see AI code generation in action',
      content: (
        <div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {EXAMPLE_PROMPTS.slice(0, 4).map((example, index) => (
              <button
                key={index}
                onClick={() => onTryExample?.(example.prompt)}
                className="text-left p-3 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-blue-50 hover:to-blue-100 rounded-lg transition-colors duration-200 group"
              >
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-lg">{example.icon}</span>
                  <span className="font-medium text-sm text-gray-800 group-hover:text-blue-800">
                    {example.title}
                  </span>
                </div>
                <p className="text-xs text-gray-600 group-hover:text-blue-600 line-clamp-2">
                  {example.prompt}
                </p>
                <div className="mt-2">
                  <span className="text-xs bg-gray-200 group-hover:bg-blue-200 text-gray-700 group-hover:text-blue-700 px-2 py-1 rounded capitalize">
                    {example.framework}
                  </span>
                </div>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 text-center">
            Click any example to auto-fill the input and generate the app
          </p>
        </div>
      ),
      position: 'center'
    },
    {
      id: 'generation',
      title: 'AI Generation Process',
      description: 'Watch your app come to life in real-time',
      content: (
        <div>
          <div className="space-y-3 mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">1</span>
              </div>
              <div>
                <p className="font-medium text-sm">Framework Detection</p>
                <p className="text-xs text-gray-600">AI chooses the best framework for your app</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold text-sm">2</span>
              </div>
              <div>
                <p className="font-medium text-sm">Code Generation</p>
                <p className="text-xs text-gray-600">Full application code with modern best practices</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-bold text-sm">3</span>
              </div>
              <div>
                <p className="font-medium text-sm">Live Preview</p>
                <p className="text-xs text-gray-600">Instant preview with error detection</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3">
            <p className="text-sm font-medium text-gray-800 mb-1">💡 Pro Tip</p>
            <p className="text-xs text-gray-600">
              Use the preview controls to test your app on different devices and view the source code
            </p>
          </div>
        </div>
      ),
      position: 'center'
    },
    {
      id: 'features',
      title: 'Explore All Features',
      description: 'Make the most of your AI-generated applications',
      content: (
        <div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <EyeIcon className="h-6 w-6 text-blue-600" />
              </div>
              <p className="font-medium text-sm">Device Preview</p>
              <p className="text-xs text-gray-600">Desktop, tablet, mobile views</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <CodeBracketIcon className="h-6 w-6 text-green-600" />
              </div>
              <p className="font-medium text-sm">Code Editor</p>
              <p className="text-xs text-gray-600">View and copy source code</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <ArrowDownTrayIcon className="h-6 w-6 text-purple-600" />
              </div>
              <p className="font-medium text-sm">Download</p>
              <p className="text-xs text-gray-600">File or complete project</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <SparklesIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <p className="font-medium text-sm">Iterate</p>
              <p className="text-xs text-gray-600">Refine with new prompts</p>
            </div>
          </div>
          <div className="text-center">
            <button
              onClick={() => setShowExamples(true)}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-colors"
            >
              <PlayIcon className="h-4 w-4" />
              <span>Try an Example Now</span>
            </button>
          </div>
        </div>
      ),
      position: 'center'
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleTryExample = (prompt: string) => {
    onTryExample?.(prompt);
    onComplete();
  };

  if (!isVisible && !showExamples) return null;

  return (
    <AnimatePresence>
      {(isVisible || showExamples) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          {showExamples ? (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">Try These Examples</h2>
                <button
                  onClick={() => setShowExamples(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XMarkIcon className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              <div className="p-6 max-h-96 overflow-y-auto">
                <div className="grid gap-4">
                  {EXAMPLE_PROMPTS.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => handleTryExample(example.prompt)}
                      className="text-left p-4 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-blue-50 hover:to-blue-100 rounded-xl transition-colors duration-200 group border border-transparent hover:border-blue-200"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="text-2xl">{example.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-gray-800 group-hover:text-blue-800">
                              {example.title}
                            </h3>
                            <span className="text-xs bg-gray-200 group-hover:bg-blue-200 text-gray-700 group-hover:text-blue-700 px-2 py-1 rounded capitalize">
                              {example.framework}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 group-hover:text-blue-600">
                            {example.prompt}
                          </p>
                        </div>
                        <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <h2 className="text-lg font-bold text-gray-800">{steps[currentStep].title}</h2>
                  <div className="flex space-x-1">
                    {steps.map((_, index) => (
                      <div
                        key={index}
                        className={cn(
                          "w-2 h-2 rounded-full transition-colors",
                          index === currentStep ? "bg-blue-600" : 
                          index < currentStep ? "bg-green-500" : "bg-gray-300"
                        )}
                      />
                    ))}
                  </div>
                </div>
                <button
                  onClick={onSkip}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Skip
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-gray-600 mb-6">{steps[currentStep].description}</p>
                {steps[currentStep].content}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200 flex items-center justify-between">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors",
                    currentStep === 0 
                      ? "text-gray-400 cursor-not-allowed" 
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                  )}
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  <span>Previous</span>
                </button>

                <span className="text-sm text-gray-500">
                  {currentStep + 1} of {steps.length}
                </span>

                <button
                  onClick={nextStep}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <span>{currentStep === steps.length - 1 ? 'Get Started' : 'Next'}</span>
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}