'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CodeBracketIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  PlayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface LivePreviewProps {
  preview: any;
  isLoading: boolean;
}

interface PreviewStep {
  id: string;
  title: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
  description: string;
  estimatedTime?: string;
}

const buildingSteps: PreviewStep[] = [
  {
    id: 'analyze',
    title: 'Analyzing Requirements',
    status: 'pending',
    description: 'AI is understanding your app requirements and architecture',
    estimatedTime: '15s'
  },
  {
    id: 'design',
    title: 'Designing Architecture', 
    status: 'pending',
    description: 'Creating optimal system design and component structure',
    estimatedTime: '30s'
  },
  {
    id: 'generate',
    title: 'Generating Code',
    status: 'pending',
    description: 'Writing production-ready code with best practices',
    estimatedTime: '45s'
  },
  {
    id: 'optimize',
    title: 'Optimizing Performance',
    status: 'pending',
    description: 'Applying performance optimizations and security measures',
    estimatedTime: '20s'
  },
  {
    id: 'deploy',
    title: 'Preparing Deployment',
    status: 'pending',
    description: 'Setting up deployment configuration and environment',
    estimatedTime: '10s'
  }
];

export function LivePreview({ preview, isLoading }: LivePreviewProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<PreviewStep[]>(buildingSteps);
  const [showCode, setShowCode] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'structure'>('preview');

  // Simulate building progress
  useEffect(() => {
    if (!isLoading) {
      setSteps(buildingSteps.map(step => ({ ...step, status: 'pending' })));
      setCurrentStep(0);
      return;
    }

    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < buildingSteps.length) {
        setSteps(prev => prev.map((step, index) => ({
          ...step,
          status: index < stepIndex ? 'completed' : index === stepIndex ? 'in-progress' : 'pending'
        })));
        
        if (stepIndex === buildingSteps.length - 1) {
          setTimeout(() => {
            setSteps(prev => prev.map(step => ({ ...step, status: 'completed' })));
            clearInterval(interval);
          }, 2000);
        }
        
        setCurrentStep(stepIndex);
        stepIndex++;
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isLoading]);

  const getStatusIcon = (status: PreviewStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'in-progress':
        return <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case 'error':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden h-full min-h-[500px]">
      {/* Header */}
      <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <span className="text-gray-300 text-sm font-medium">
              {isLoading ? 'Building Application...' : preview ? 'Preview Ready' : 'Ready to Build'}
            </span>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex space-x-2">
            {['preview', 'code', 'structure'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as typeof activeTab)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  activeTab === tab 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 h-full">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Progress Steps */}
              <div className="space-y-4">
                {steps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-start space-x-3 p-3 rounded-lg transition-colors ${
                      step.status === 'in-progress' 
                        ? 'bg-blue-900 bg-opacity-50 border border-blue-600'
                        : step.status === 'completed'
                        ? 'bg-green-900 bg-opacity-30'
                        : 'bg-gray-800 bg-opacity-50'
                    }`}
                  >
                    <div className="mt-0.5">
                      {getStatusIcon(step.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-white font-medium">{step.title}</h4>
                        {step.estimatedTime && step.status === 'in-progress' && (
                          <span className="text-xs text-blue-400">~{step.estimatedTime}</span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm mt-1">{step.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Overall Progress */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300 text-sm">Overall Progress</span>
                  <span className="text-gray-300 text-sm">
                    {Math.round((steps.filter(s => s.status === 'completed').length / steps.length) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${(steps.filter(s => s.status === 'completed').length / steps.length) * 100}%` 
                    }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            </motion.div>
          ) : preview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Preview Content */}
              {activeTab === 'preview' && (
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {preview.title || 'Generated Application'}
                      </h3>
                      <div className="flex space-x-2">
                        <button className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors">
                          <PlayIcon className="w-4 h-4" />
                          <span>Run</span>
                        </button>
                        <button className="flex items-center space-x-1 px-3 py-1 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-700 transition-colors">
                          <ArrowDownTrayIcon className="w-4 h-4" />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                    
                    <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <EyeIcon className="w-12 h-12 mx-auto mb-2" />
                        <p>Live Preview</p>
                        <p className="text-sm">Interactive demo would appear here</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Code View */}
              {activeTab === 'code' && (
                <div className="bg-gray-950 rounded-lg p-4 text-green-400 font-mono text-sm overflow-auto max-h-96">
                  <pre>{`// Generated React Component
import React, { useState } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Your Generated App</h1>
        <p>Built with AI in minutes!</p>
        <button 
          onClick={() => setCount(count + 1)}
          className="counter-btn"
        >
          Count: {count}
        </button>
      </header>
    </div>
  );
}

export default App;`}</pre>
                </div>
              )}

              {/* Structure View */}
              {activeTab === 'structure' && (
                <div className="bg-gray-800 rounded-lg p-4 text-gray-300 font-mono text-sm">
                  <div className="space-y-1">
                    <div>📁 src/</div>
                    <div className="ml-4">📁 components/</div>
                    <div className="ml-8">📄 Header.jsx</div>
                    <div className="ml-8">📄 Main.jsx</div>
                    <div className="ml-8">📄 Footer.jsx</div>
                    <div className="ml-4">📁 pages/</div>
                    <div className="ml-8">📄 Home.jsx</div>
                    <div className="ml-8">📄 About.jsx</div>
                    <div className="ml-4">📁 styles/</div>
                    <div className="ml-8">📄 App.css</div>
                    <div className="ml-8">📄 index.css</div>
                    <div className="ml-4">📄 App.js</div>
                    <div className="ml-4">📄 index.js</div>
                    <div>📄 package.json</div>
                    <div>📄 README.md</div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all">
                  Deploy to Production
                </button>
                <button className="flex-1 bg-gray-700 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-600 transition-colors">
                  Save to Dashboard
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center h-full text-center"
            >
              <div className="text-gray-500">
                <CodeBracketIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Ready to Build</h3>
                <p className="text-sm">
                  Describe your app in the prompt builder and watch the magic happen
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}