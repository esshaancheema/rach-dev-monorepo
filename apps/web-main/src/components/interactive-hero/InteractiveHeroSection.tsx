'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SparklesIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { HeroImage } from '@/components/ui/OptimizedImage';
// Removed useAppBuilderSession since we redirect to /ai-builder instead of inline building
import { useOnboarding } from '@/hooks/useOnboarding';
import OnboardingTutorial from '@/components/onboarding/OnboardingTutorial';
import AppIdeaInput from './AppIdeaInput';

interface InteractiveHeroSectionProps {
  className?: string;
  variant?: 'default' | 'minimal' | 'gradient';
}

const rotatingTexts = [
  'AI-Powered Software Development',
  'Interactive App Building',
  'Custom Enterprise Solutions', 
  'Intelligent Mobile Apps',
  'Cloud-Native Architectures',
  'AI Agents & Automation',
];

const trustIndicators = [
  { label: '500+ Projects Delivered', icon: CheckCircleIcon },
  { label: '50+ Enterprise Clients', icon: CheckCircleIcon },
  { label: '99.9% Uptime SLA', icon: CheckCircleIcon },
  { label: 'ISO 27001 Certified', icon: CheckCircleIcon },
];

const techStack = [
  { name: 'React/Next.js', logo: '/images/tech/nextjs.svg' },
  { name: 'Node.js', logo: '/images/tech/nodejs.svg' },
  { name: 'Python/AI', logo: '/images/tech/python.svg' },
  { name: 'AWS/Cloud', logo: '/images/tech/aws.svg' },
  { name: 'Docker', logo: '/images/tech/docker.svg' },
  { name: 'PostgreSQL', logo: '/images/tech/postgresql.svg' },
];


export default function InteractiveHeroSection({ 
  className, 
  variant = 'default' 
}: InteractiveHeroSectionProps) {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  // Removed showBuilder and currentPrompt states as we now redirect to /ai-builder
  
  // Removed useAppBuilderSession hook usage - no longer needed since we redirect to /ai-builder

  const {
    showTutorial,
    isNewUser,
    completeTutorial,
    skipTutorial,
    markFirstAppGenerated,
    setShowTutorial
  } = useOnboarding();

  // Rotating text animation
  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentTextIndex((prev) => (prev + 1) % rotatingTexts.length);
        setIsVisible(true);
      }, 300);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const backgroundClasses = {
    default: 'bg-gradient-to-br from-blue-50 via-white to-indigo-50',
    minimal: 'bg-white',
    gradient: 'bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white',
  };

  const textClasses = {
    default: 'text-gray-900',
    minimal: 'text-gray-900',
    gradient: 'text-white',
  };

  const subtextClasses = {
    default: 'text-gray-600',
    minimal: 'text-gray-600',
    gradient: 'text-blue-100',
  };

  const handleIdeaSubmit = async (idea: string) => {
    // Encode the idea for URL parameter
    const encodedIdea = encodeURIComponent(idea);
    
    // Mark first app generation for onboarding tracking
    if (isNewUser) {
      markFirstAppGenerated();
    }
    
    // Redirect to dashboard app guest experience with the idea as parameter
    window.location.href = `http://localhost:3001/guest?prompt=${encodedIdea}`;
  };

  // Removed handlePromptSubmit and handleAuthRequired since we redirect to /ai-builder

  const handleTryExample = (examplePrompt: string) => {
    const encodedIdea = encodeURIComponent(examplePrompt);
    completeTutorial();
    if (isNewUser) {
      markFirstAppGenerated();
    }
    // Redirect to dashboard app guest experience with the example prompt
    window.location.href = `http://localhost:3001/guest?prompt=${encodedIdea}`;
  };

  // Removed showBuilder conditional rendering - now we redirect to /ai-builder page

  return (
    <section className={cn(backgroundClasses[variant], 'relative overflow-hidden', className)}>
      {/* Background Elements */}
      <div className="absolute inset-0">
        {variant === 'gradient' && (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-indigo-800/20" />
        )}
        
        {/* Geometric Patterns */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-pulse-slow" />
          <div className="absolute top-40 right-20 w-40 h-40 bg-indigo-500/10 rounded-full blur-xl animate-pulse-slow" />
          <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-purple-500/10 rounded-full blur-xl animate-pulse-slow" />
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        {/* Centered Hero Content */}
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-6"
          >
            <SparklesIcon className="h-4 w-4 mr-2" />
            Interactive AI App Builder - Build Apps in Real-Time
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={cn(
              'text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight',
              textClasses[variant]
            )}
          >
            Transform Your Ideas into{' '}
            <span className="relative">
              <span 
                className={cn(
                  'bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent transition-opacity duration-300',
                  isVisible ? 'opacity-100' : 'opacity-0'
                )}
              >
                {rotatingTexts[currentTextIndex]}
              </span>
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={cn(
              'text-xl lg:text-2xl mb-8 leading-relaxed',
              subtextClasses[variant]
            )}
          >
            Describe your app idea and watch as our AI builds it live. 
            No coding required - just tell us what you want to create.
          </motion.p>

          {/* App Idea Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <AppIdeaInput 
              onSubmit={handleIdeaSubmit}
              className="mb-8"
            />
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 gap-4 mb-8 max-w-2xl mx-auto"
          >
            {trustIndicators.map((indicator, index) => (
              <div key={index} className="flex items-center space-x-2">
                <indicator.icon className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className={cn('text-sm font-medium', subtextClasses[variant])}>
                  {indicator.label}
                </span>
              </div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <button className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-blue-600 bg-white border-2 border-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">
              <PlayIcon className="mr-2 h-5 w-5" />
              Watch Demo
            </button>
            
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              Get Expert Help
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </a>
          </motion.div>

          {/* Tech Stack */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="pt-8 border-t border-gray-200"
          >
            <p className={cn('text-sm font-medium mb-4', subtextClasses[variant])}>
              Powered by industry-leading AI and technologies:
            </p>
            <div className="flex items-center justify-center space-x-6 overflow-x-auto">
              {techStack.map((tech, index) => (
                <div key={index} className="flex-shrink-0 flex items-center space-x-2">
                  <div className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center">
                    <HeroImage
                      src={tech.logo}
                      alt={tech.name}
                      width={24}
                      height={24}
                      className="w-6 h-6"
                    />
                  </div>
                  <span className={cn('text-sm font-medium', subtextClasses[variant])}>
                    {tech.name}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Divider */}
      <div className="absolute bottom-0 left-0 w-full">
        <svg
          viewBox="0 0 1440 58"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
        >
          <path
            d="M0 0L1440 0V58C1440 58 1200 20 720 20C240 20 0 58 0 58V0Z"
            fill="white"
          />
        </svg>
      </div>

      {/* Onboarding Tutorial */}
      <OnboardingTutorial
        isVisible={showTutorial}
        onComplete={completeTutorial}
        onSkip={skipTutorial}
        onTryExample={handleTryExample}
      />
    </section>
  );
}