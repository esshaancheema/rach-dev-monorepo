'use client';

import { useState, useEffect } from 'react';
import { 
  SparklesIcon, 
  BoltIcon,
  CpuChipIcon,
  ArrowRightIcon,
  PlayIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { HeroImage } from '@/components/ui/OptimizedImage';
import { cn } from '@/lib/utils';

const automationTypes = [
  'Customer Support Automation',
  'Sales Process Optimization',
  'Content Generation & Management',
  'Data Analysis & Reporting',
  'Workflow Orchestration',
  'Document Processing',
];

const benefits = [
  { metric: '80%', label: 'Productivity Increase' },
  { metric: '60%', label: 'Cost Reduction' },
  { metric: '24/7', label: 'Availability' },
  { metric: '3 months', label: 'ROI Timeline' },
];

const useCaseExamples = [
  {
    title: 'Smart Customer Service Agent',
    description: 'Handles 80% of customer inquiries automatically with human-like responses',
    tags: ['Support', 'NLP', 'Integration']
  },
  {
    title: 'Sales Intelligence Assistant',
    description: 'Qualifies leads, schedules meetings, and updates CRM systems automatically',
    tags: ['Sales', 'CRM', 'Automation']
  },
  {
    title: 'Content Creation Bot',
    description: 'Generates marketing content, social posts, and documentation at scale',
    tags: ['Marketing', 'Content', 'AI Writing']
  }
];

export default function AIAgentsHero() {
  const [currentType, setCurrentType] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentType((prev) => (prev + 1) % automationTypes.length);
        setIsVisible(true);
      }, 300);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        {/* Animated Background Shapes */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-blue-200/30 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-40 right-20 w-80 h-80 bg-indigo-200/30 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '1s'}} />
        <div className="absolute bottom-20 left-1/3 w-48 h-48 bg-purple-200/30 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '2s'}} />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-grid-white/10" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Content */}
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 text-sm font-medium mb-6 animate-fade-in-up">
              <SparklesIcon className="h-4 w-4 mr-2" />
              AI-Powered Business Automation
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Transform Your Business with{' '}
              <span className="relative">
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Intelligent AI Agents
                </span>
              </span>
            </h1>

            {/* Dynamic Subtitle */}
            <div className="text-xl lg:text-2xl text-gray-600 mb-2">
              Automate complex workflows with:
            </div>
            <div className="h-16 mb-6">
              <span 
                className={cn(
                  'text-xl lg:text-2xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent transition-opacity duration-300 block',
                  isVisible ? 'opacity-100' : 'opacity-0'
                )}
              >
                {automationTypes[currentType]}
              </span>
            </div>

            {/* Value Proposition */}
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Build custom AI agents that work 24/7 to streamline your operations, 
              reduce costs by 60%, and boost productivity by 80%. No coding required 
              - just describe your process and watch it come to life.
            </p>

            {/* Key Benefits */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3 bg-white/60 backdrop-blur-sm rounded-lg p-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircleIcon className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">{benefit.metric}</div>
                    <div className="text-sm text-gray-600">{benefit.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <a
                href="/contact?service=ai-agents"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <CpuChipIcon className="mr-2 h-5 w-5" />
                Build Your AI Agent
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </a>
              
              <button 
                onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-indigo-600 bg-white border-2 border-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
              >
                <PlayIcon className="mr-2 h-5 w-5" />
                Watch Demo
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <span className="font-medium">Trusted by 200+ companies</span>
              </div>
              <div className="flex items-center">
                <BoltIcon className="h-4 w-4 mr-1" />
                <span>Deploy in 2-4 weeks</span>
              </div>
              <div className="flex items-center">
                <CheckCircleIcon className="h-4 w-4 mr-1 text-green-500" />
                <span>30-day guarantee</span>
              </div>
            </div>
          </div>

          {/* Right Column - Visual Demo */}
          <div className="relative lg:ml-8">
            {/* Main Demo Container */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-purple-600/20 rounded-3xl rotate-3 scale-105" />
              
              <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
                {/* Demo Header */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 bg-red-400 rounded-full" />
                        <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                        <div className="w-3 h-3 bg-green-400 rounded-full" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">AI Agent Dashboard</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-xs text-gray-500">Live</span>
                    </div>
                  </div>
                </div>

                {/* Demo Content */}
                <div className="p-6">
                  <div className="space-y-4">
                    {useCaseExamples.map((useCase, index) => (
                      <div 
                        key={index} 
                        className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900 text-sm">{useCase.title}</h3>
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <span className="text-xs text-green-600">Active</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mb-3">{useCase.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {useCase.tags.map((tag, tagIndex) => (
                            <span 
                              key={tagIndex}
                              className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-700 text-xs font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-green-600">98%</div>
                        <div className="text-xs text-gray-500">Success Rate</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">2.4s</div>
                        <div className="text-xs text-gray-500">Avg Response</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">24/7</div>
                        <div className="text-xs text-gray-500">Uptime</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-6 -left-6 bg-white rounded-xl shadow-lg p-4 border border-gray-200 animate-float">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">Tasks Automated</div>
                  <div className="text-2xl font-bold text-green-600">1,247</div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-lg p-4 border border-gray-200 animate-float" style={{animationDelay: '1s'}}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BoltIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">Cost Savings</div>
                  <div className="text-2xl font-bold text-blue-600">$45K</div>
                </div>
              </div>
            </div>

            <div className="absolute top-1/2 -left-8 bg-white rounded-xl shadow-lg p-3 border border-gray-200 animate-float" style={{animationDelay: '2s'}}>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">99.9%</div>
                <div className="text-xs text-gray-500">Accuracy</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 w-full">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
        >
          <path
            d="M0 0L1440 0V120C1440 120 1200 60 720 60C240 60 0 120 0 120V0Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
}