'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SparklesIcon, 
  PaperAirplaneIcon,
  LightBulbIcon,
  CpuChipIcon,
  CodeBracketIcon,
  EyeIcon,
  PlayIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { useIndustryDetection } from '@/hooks/useIndustryDetection';
import { useAnalytics } from '@/hooks/useAnalytics';

interface EnhancedAppBuilderProps {
  onSubmit?: (idea: string) => void;
  className?: string;
  showPreview?: boolean;
}

interface BuildStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  duration: number;
  completed: boolean;
}

const industryPrompts = {
  'healthcare': [
    "A telemedicine platform with appointment scheduling and video consultations",
    "A patient portal for accessing medical records and lab results",
    "A medication reminder app with doctor notifications",
    "A HIPAA-compliant health data tracker with analytics"
  ],
  'fintech': [
    "A personal finance dashboard with expense categorization and budgeting",
    "A cryptocurrency portfolio tracker with real-time price alerts",
    "A peer-to-peer payment app with QR code support",
    "A loan application platform with credit score integration"
  ],
  'ecommerce': [
    "An online marketplace with vendor management and payment processing",
    "A product recommendation engine with AI-powered suggestions",
    "An inventory management system with automated reordering",
    "A customer reviews platform with sentiment analysis"
  ],
  'education': [
    "A learning management system with course creation and student tracking",
    "An interactive quiz platform with adaptive learning algorithms",
    "A virtual classroom with screen sharing and breakout rooms",
    "A student performance analytics dashboard for educators"
  ],
  'default': [
    "A task management app with drag-and-drop functionality and team collaboration",
    "A real-time chat application with file sharing and emoji reactions",
    "A recipe sharing platform with meal planning and grocery lists",
    "A fitness tracking app with workout plans and progress monitoring"
  ]
};

const buildSteps: BuildStep[] = [
  {
    id: 'analyze',
    title: 'Analyzing Requirements',
    description: 'Understanding your app requirements and technical needs',
    icon: CpuChipIcon,
    duration: 2000,
    completed: false
  },
  {
    id: 'architecture',
    title: 'Designing Architecture',
    description: 'Creating the technical architecture and database schema',
    icon: CodeBracketIcon,
    duration: 3000,
    completed: false
  },
  {
    id: 'generate',
    title: 'Generating Code',
    description: 'Writing the application code with best practices',
    icon: SparklesIcon,
    duration: 4000,
    completed: false
  },
  {
    id: 'preview',
    title: 'Creating Preview',
    description: 'Building a live preview of your application',
    icon: EyeIcon,
    duration: 2000,
    completed: false
  }
];

export default function EnhancedAppBuilder({ 
  onSubmit, 
  className,
  showPreview = true 
}: EnhancedAppBuilderProps) {
  const [idea, setIdea] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [showExamples, setShowExamples] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { industry, industryContent } = useIndustryDetection();
  const { trackEvent } = useAnalytics();

  const examplePrompts = industryPrompts[industry as keyof typeof industryPrompts] || industryPrompts.default;

  const handleSubmit = async () => {
    if (!idea.trim() || isBuilding) return;

    setIsBuilding(true);
    setCurrentStep(0);
    setCompletedSteps([]);

    // Track app builder start event
    trackEvent('app_builder_start', 'engagement', 'ai_app_builder', industry, undefined, {
      idea: idea.substring(0, 100), // First 100 chars for privacy
      industry
    });

    // Simulate the build process
    for (let i = 0; i < buildSteps.length; i++) {
      setCurrentStep(i);
      await new Promise(resolve => setTimeout(resolve, buildSteps[i].duration));
      setCompletedSteps(prev => [...prev, buildSteps[i].id]);
    }

    // Complete the process
    setTimeout(() => {
      setIsBuilding(false);
      setCurrentStep(-1);
      
      // Redirect to the actual app builder
      if (onSubmit) {
        onSubmit(idea);
      } else {
        const encodedIdea = encodeURIComponent(idea);
        window.location.href = `http://localhost:3001/guest?prompt=${encodedIdea}`;
      }

      trackEvent('app_builder_complete', 'conversion', 'ai_app_builder', industry, 1, {
        idea: idea.substring(0, 100),
        industry
      });
    }, 1000);
  };

  const handleExampleClick = (example: string) => {
    setIdea(example);
    setShowExamples(false);
    textareaRef.current?.focus();
    
    trackEvent('example_prompt_selected', 'engagement', 'ai_app_builder', example, undefined, {
      industry,
      example: example.substring(0, 50)
    });
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (!idea.trim()) {
      setShowExamples(true);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    setTimeout(() => setShowExamples(false), 200);
  };

  return (
    <div className={cn("relative w-full max-w-5xl mx-auto", className)}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Input */}
        <div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Build Your {industry !== 'default' ? industryContent.title.split(' ')[0] : 'Business'} App
              </h3>
              <p className="text-gray-600">
                Describe your app idea and watch as our AI builds it in real-time
              </p>
            </div>

            {/* Main Input Container */}
            <motion.div
              className={cn(
                "relative bg-white rounded-2xl shadow-xl border-2 transition-all duration-300",
                isFocused 
                  ? "border-blue-500 shadow-2xl shadow-blue-500/10" 
                  : "border-gray-200 hover:border-gray-300",
                isBuilding && "pointer-events-none"
              )}
            >
              {/* Input Header */}
              <div className="flex items-center justify-between p-4 pb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <SparklesIcon className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    AI App Builder - {industryContent.title}
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
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  placeholder={`Describe your ${industry !== 'default' ? industry : 'business'} app idea...`}
                  disabled={isBuilding}
                  className={cn(
                    "w-full min-h-[140px] max-h-[220px] px-4 py-3 text-lg text-gray-900 placeholder-gray-500 bg-transparent border-0 resize-none focus:outline-none",
                    "scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                  )}
                  rows={5}
                />

                {/* Submit Button */}
                <motion.button
                  onClick={handleSubmit}
                  disabled={!idea.trim() || isBuilding}
                  whileHover={{ scale: idea.trim() && !isBuilding ? 1.02 : 1 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "absolute bottom-6 right-6 w-14 h-14 rounded-full shadow-lg transition-all duration-200 flex items-center justify-center",
                    idea.trim() && !isBuilding
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/25"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  )}
                >
                  {isBuilding ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <PlayIcon className="h-6 w-6 ml-0.5" />
                  )}
                </motion.button>
              </div>
            </motion.div>

            {/* Example Prompts */}
            <AnimatePresence>
              {showExamples && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mt-4 bg-white rounded-xl shadow-lg border border-gray-200 p-4"
                >
                  <div className="text-sm font-medium text-gray-700 mb-3">
                    Popular {industryContent.title.toLowerCase()} apps:
                  </div>
                  <div className="space-y-2">
                    {examplePrompts.map((example, index) => (
                      <motion.button
                        key={index}
                        onClick={() => handleExampleClick(example)}
                        whileHover={{ scale: 1.01, x: 4 }}
                        className="w-full text-left px-3 py-3 text-sm text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-lg transition-all duration-200 border border-transparent hover:border-blue-200"
                      >
                        <div className="flex items-start">
                          <SparklesIcon className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="leading-relaxed">{example}</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Right Column - Preview & Build Process */}
        {showPreview && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="sticky top-8">
              <div className="bg-gray-900 rounded-2xl p-6 text-white min-h-[400px]">
                <div className="flex items-center mb-6">
                  <div className="flex space-x-2 mr-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <span className="text-sm text-gray-400">AI App Builder Terminal</span>
                </div>

                <AnimatePresence mode="wait">
                  {!isBuilding && currentStep === -1 ? (
                    <motion.div
                      key="waiting"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      <div className="text-green-400 font-mono">
                        $ Ready to build your {industry !== 'default' ? industry : 'business'} app
                      </div>
                      <div className="text-gray-400 text-sm">
                        <div className="mb-2">🚀 Features include:</div>
                        <ul className="space-y-1 ml-4">
                          {industryContent.features.slice(0, 4).map((feature, index) => (
                            <li key={index} className="flex items-center">
                              <CheckCircleIcon className="h-3 w-3 text-green-400 mr-2" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="text-blue-400 text-sm animate-pulse">
                        Enter your app idea to get started...
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="building"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-4"
                    >
                      {buildSteps.map((step, index) => (
                        <motion.div
                          key={step.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ 
                            opacity: index <= currentStep ? 1 : 0.3,
                            x: 0 
                          }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center space-x-3"
                        >
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                            completedSteps.includes(step.id)
                              ? "bg-green-500 text-white"
                              : index === currentStep
                                ? "bg-blue-500 text-white animate-pulse"
                                : "bg-gray-700 text-gray-400"
                          )}>
                            {completedSteps.includes(step.id) ? (
                              <CheckCircleIcon className="h-4 w-4" />
                            ) : (
                              <step.icon className="h-4 w-4" />
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <div className={cn(
                              "font-mono text-sm",
                              completedSteps.includes(step.id)
                                ? "text-green-400"
                                : index === currentStep
                                  ? "text-blue-400"
                                  : "text-gray-500"
                            )}>
                              {step.title}
                            </div>
                            <div className="text-xs text-gray-400">
                              {step.description}
                            </div>
                          </div>

                          {index === currentStep && (
                            <div className="text-blue-400">
                              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                            </div>
                          )}
                        </motion.div>
                      ))}

                      {completedSteps.length === buildSteps.length && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-6 p-4 bg-green-900/30 border border-green-500 rounded-lg"
                        >
                          <div className="text-green-400 font-mono text-sm mb-2">
                            ✨ App built successfully!
                          </div>
                          <div className="text-gray-300 text-xs">
                            Redirecting to your live app...
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}