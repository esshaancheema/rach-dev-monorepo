'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowRightIcon, 
  PlayIcon,
  SparklesIcon,
  CodeBracketIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';

export default function HeroSection() {
  const [promptText, setPromptText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();

  const samplePrompts = [
    "Create a React component for a modern pricing table",
    "Build a REST API for user authentication with JWT",
    "Generate a responsive landing page for a SaaS product",
    "Create a Node.js microservice for payment processing",
    "Build a real-time chat application with Socket.io"
  ];

  const handleGenerateCode = async () => {
    if (!promptText.trim()) return;
    
    setIsGenerating(true);
    
    // Redirect to AI Builder Dashboard with the prompt
    router.push(`/ai-builder?prompt=${encodeURIComponent(promptText.trim())}`);
  };

  const handleSamplePrompt = (prompt: string) => {
    setPromptText(prompt);
  };

  return (
    <section className="relative bg-gradient-to-br from-primary-50 via-white to-secondary-50 pt-20 pb-32 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary-200 rounded-full opacity-20 animate-pulse-slow"></div>
      <div className="absolute top-40 right-20 w-32 h-32 bg-secondary-200 rounded-full opacity-20 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-primary-300 rounded-full opacity-20 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            {/* Main Headline */}
            <div className="mb-6">
              <span className="inline-flex items-center space-x-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                <SparklesIcon className="w-4 h-4" />
                <span>AI-Powered Development Platform</span>
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 leading-tight mb-8">
              Build Software
              <br />
              <span className="bg-gradient-to-r from-primary-600 via-primary-700 to-secondary-600 bg-clip-text text-transparent">
                10x Faster
              </span>
              <br />
              with AI
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-600 leading-relaxed max-w-3xl mx-auto mb-12">
              Transform your development workflow with intelligent code generation, 
              automated testing, and AI-powered optimization. From concept to deployment in minutes.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link 
                href="/contact"
                className="inline-flex items-center space-x-2 bg-primary-600 text-white px-8 py-4 rounded-lg hover:bg-primary-700 transition-all transform hover:scale-105 font-semibold text-lg shadow-lg hover:shadow-xl"
              >
                <span>Start Building Now</span>
                <ArrowRightIcon className="w-5 h-5" />
              </Link>
              
              <button type="button" className="inline-flex items-center space-x-2 bg-white text-gray-700 px-8 py-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all font-semibold text-lg shadow-md hover:shadow-lg">
                <PlayIcon className="w-5 h-5" />
                <span>Watch Demo</span>
              </button>
            </div>
          </div>

          {/* AI Prompt Builder */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Try Our AI Code Generator
                </h2>
                <p className="text-gray-600">
                  Describe what you want to build, and watch AI generate production-ready code
                </p>
              </div>

              <div className="space-y-4">
                {/* Prompt Input */}
                <div className="relative">
                  <textarea
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    placeholder="Describe the software component you want to build..."
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none h-24 text-gray-900 placeholder-gray-500"
                  />
                  <div className="absolute top-2 right-2">
                    <CodeBracketIcon className="w-5 h-5 text-gray-400" />
                  </div>
                </div>

                {/* Sample Prompts */}
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-gray-600 mr-2">Try these:</span>
                  {samplePrompts.slice(0, 3).map((prompt, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSamplePrompt(prompt)}
                      className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-primary-100 hover:text-primary-700 transition-colors"
                    >
                      {prompt.length > 40 ? `${prompt.slice(0, 40)}...` : prompt}
                    </button>
                  ))}
                </div>

                {/* Generate Button */}
                <button
                  type="button"
                  onClick={handleGenerateCode}
                  disabled={!promptText.trim() || isGenerating}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
                    promptText.trim() && !isGenerating
                      ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg hover:shadow-xl'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isGenerating ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Generating Code...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <RocketLaunchIcon className="w-5 h-5" />
                      <span>Generate Code with AI</span>
                    </div>
                  )}
                </button>

                {/* Demo Notice */}
                <p className="text-center text-sm text-gray-500">
                  This is a demo. For full functionality, {' '}
                  <Link href="/contact" className="text-primary-600 hover:text-primary-700 font-medium">
                    contact our team
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Trust Indicators Preview */}
          <div className="mt-20 text-center">
            <p className="text-gray-600 mb-8">Trusted by development teams worldwide</p>
            <div className="flex justify-center items-center space-x-8 opacity-60">
              <div className="text-2xl font-bold text-gray-400">500+</div>
              <div className="text-2xl font-bold text-gray-400">Projects</div>
              <div className="text-2xl font-bold text-gray-400">10x</div>
              <div className="text-2xl font-bold text-gray-400">Faster</div>
              <div className="text-2xl font-bold text-gray-400">99.9%</div>
              <div className="text-2xl font-bold text-gray-400">Uptime</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}