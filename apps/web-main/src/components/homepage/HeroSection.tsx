'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  PlayIcon, 
  CheckCircleIcon,
  SparklesIcon,
  ArrowRightIcon,
  CodeBracketIcon,
  CpuChipIcon,
  CloudIcon
} from '@heroicons/react/24/outline';
import { HeroImage } from '@/components/ui/OptimizedImage';
import { cn } from '@/lib/utils';

interface HeroSectionProps {
  className?: string;
  variant?: 'default' | 'minimal' | 'gradient';
}

const rotatingTexts = [
  'AI-Powered Software Development',
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

export default function HeroSection({ className, variant = 'default' }: HeroSectionProps) {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

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
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Content */}
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-6 animate-fade-in-up">
              <SparklesIcon className="h-4 w-4 mr-2" />
              Trusted by 500+ Companies Worldwide
            </div>

            {/* Main Headline */}
            <h1 className={cn(
              'text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight',
              textClasses[variant]
            )}>
              Transform Your Business with{' '}
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
            </h1>

            {/* Subtitle */}
            <p className={cn(
              'text-xl lg:text-2xl mb-8 leading-relaxed',
              subtextClasses[variant]
            )}>
              From concept to deployment, we accelerate your development journey with cutting-edge AI tools, 
              expert engineering, and proven methodologies that deliver results.
            </p>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {trustIndicators.map((indicator, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <indicator.icon className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className={cn('text-sm font-medium', subtextClasses[variant])}>
                    {indicator.label}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                Start Your Project
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
              
              <button className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-blue-600 bg-white border-2 border-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">
                <PlayIcon className="mr-2 h-5 w-5" />
                Watch Demo
              </button>
            </div>

            {/* Tech Stack */}
            <div className="pt-8 border-t border-gray-200">
              <p className={cn('text-sm font-medium mb-4', subtextClasses[variant])}>
                Powered by industry-leading technologies:
              </p>
              <div className="flex items-center space-x-6 overflow-x-auto">
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
            </div>
          </div>

          {/* Right Column - Visual */}
          <div className="relative lg:ml-8">
            {/* Main Hero Image */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl rotate-3 scale-105 opacity-20" />
              <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
                <HeroImage
                  src="/images/hero/dashboard-preview.jpg"
                  alt="Zoptal AI Development Platform Dashboard"
                  width={600}
                  height={400}
                  className="w-full h-auto"
                  priority
                />
                
                {/* Overlay Stats */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="grid grid-cols-3 gap-4 text-white">
                      <div className="text-center">
                        <div className="text-2xl font-bold">10x</div>
                        <div className="text-xs opacity-90">Faster Development</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">99.9%</div>
                        <div className="text-xs opacity-90">Uptime SLA</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">24/7</div>
                        <div className="text-xs opacity-90">AI Support</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Cards */}
            <div className="absolute -top-4 -left-4 w-48 bg-white rounded-xl shadow-lg p-4 animate-float">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CodeBracketIcon className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">AI Code Review</div>
                  <div className="text-xs text-gray-500">99% Accuracy Rate</div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-4 -right-4 w-48 bg-white rounded-xl shadow-lg p-4 animate-float" style={{ animationDelay: '1s' }}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CpuChipIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">Smart Deployment</div>
                  <div className="text-xs text-gray-500">Auto-scaling</div>
                </div>
              </div>
            </div>

            <div className="absolute top-1/2 -left-8 w-40 bg-white rounded-xl shadow-lg p-4 animate-float" style={{ animationDelay: '2s' }}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <CloudIcon className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">Cloud Native</div>
                  <div className="text-xs text-gray-500">Multi-region</div>
                </div>
              </div>
            </div>
          </div>
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
    </section>
  );
}

// Pre-configured hero variants
export function DefaultHero(props: Omit<HeroSectionProps, 'variant'>) {
  return <HeroSection {...props} variant="default" />;
}

export function MinimalHero(props: Omit<HeroSectionProps, 'variant'>) {
  return <HeroSection {...props} variant="minimal" />;
}

export function GradientHero(props: Omit<HeroSectionProps, 'variant'>) {
  return <HeroSection {...props} variant="gradient" />;
}