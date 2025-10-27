'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DemoScenario, DemoStep, InteractiveDemoState } from '@/lib/demos/types';
import { 
  PlayIcon, 
  PauseIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  CodeBracketIcon,
  ClockIcon,
  StarIcon,
  CheckCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface InteractiveDemoProps {
  scenario: DemoScenario;
  onComplete?: (scenario: DemoScenario, timeSpent: number) => void;
  onStepChange?: (step: number) => void;
}

export default function InteractiveDemo({ scenario, onComplete, onStepChange }: InteractiveDemoProps) {
  const [state, setState] = useState<InteractiveDemoState>({
    currentScenario: scenario.id,
    currentStep: 0,
    isPlaying: false,
    isCompleted: false,
    userInputs: {},
    progress: 0,
  });

  const [showCode, setShowCode] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentStepData = scenario.steps[state.currentStep];
  const isLastStep = state.currentStep === scenario.steps.length - 1;
  const isFirstStep = state.currentStep === 0;

  useEffect(() => {
    if (state.isPlaying && currentStepData?.duration) {
      intervalRef.current = setTimeout(() => {
        if (!isLastStep) {
          nextStep();
        } else {
          completeDemo();
        }
      }, currentStepData.duration);
    }

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [state.isPlaying, state.currentStep]);

  useEffect(() => {
    onStepChange?.(state.currentStep);
  }, [state.currentStep]);

  useEffect(() => {
    const progress = ((state.currentStep + 1) / scenario.steps.length) * 100;
    setState(prev => ({ ...prev, progress }));
  }, [state.currentStep, scenario.steps.length]);

  const play = () => {
    if (!state.startTime) {
      setState(prev => ({ ...prev, startTime: Date.now() }));
    }
    setState(prev => ({ ...prev, isPlaying: true }));
  };

  const pause = () => {
    setState(prev => ({ ...prev, isPlaying: false }));
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
    }
  };

  const nextStep = () => {
    if (!isLastStep) {
      setState(prev => ({ ...prev, currentStep: prev.currentStep + 1 }));
    }
  };

  const prevStep = () => {
    if (!isFirstStep) {
      setState(prev => ({ ...prev, currentStep: prev.currentStep - 1 }));
    }
  };

  const goToStep = (stepIndex: number) => {
    setState(prev => ({ 
      ...prev, 
      currentStep: stepIndex,
      isPlaying: false 
    }));
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
    }
  };

  const completeDemo = () => {
    const completionTime = Date.now() - (state.startTime || 0);
    setState(prev => ({ 
      ...prev, 
      isCompleted: true, 
      isPlaying: false,
      completionTime 
    }));
    onComplete?.(scenario, completionTime);
  };

  const restart = () => {
    setState({
      currentScenario: scenario.id,
      currentStep: 0,
      isPlaying: false,
      isCompleted: false,
      userInputs: {},
      progress: 0,
    });
    setUserRating(0);
  };

  const handleRating = (rating: number) => {
    setUserRating(rating);
    // Track rating analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'demo_rating', {
        event_category: 'engagement',
        event_label: scenario.id,
        value: rating,
      });
    }
  };

  if (state.isCompleted) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircleIcon className="h-8 w-8 text-green-600" />
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Demo Completed! 🎉</h3>
        
        <p className="text-gray-600 mb-6">
          You've successfully explored our {scenario.title} demo. 
          {state.completionTime && (
            <span className="block mt-2">
              Time spent: {Math.round(state.completionTime / 1000)}s
            </span>
          )}
        </p>

        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">How would you rate this demo?</p>
          <div className="flex justify-center space-x-1">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                onClick={() => handleRating(rating)}
                className="p-1 hover:scale-110 transition-transform"
              >
                {rating <= userRating ? (
                  <StarIconSolid className="h-6 w-6 text-yellow-400" />
                ) : (
                  <StarIcon className="h-6 w-6 text-gray-300" />
                )}
              </button>
            ))}
          </div>
          {userRating > 0 && (
            <p className="text-sm text-green-600 mt-2">
              Thank you for your feedback!
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={restart}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowPathIcon className="h-5 w-5 mr-2" />
            Try Again
          </button>
          
          <a
            href="/contact"
            className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Get Started
          </a>
          
          {scenario.githubUrl && (
            <a
              href={scenario.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <CodeBracketIcon className="h-5 w-5 mr-2" />
              View Code
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">{scenario.icon}</span>
            <div>
              <h2 className="text-xl font-bold">{scenario.title}</h2>
              <p className="text-blue-100">{scenario.description}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-blue-100">
            <ClockIcon className="h-4 w-4" />
            <span className="text-sm">{scenario.estimatedTime}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Progress</span>
            <span>{Math.round(state.progress)}%</span>
          </div>
          <div className="w-full bg-blue-500 rounded-full h-2">
            <div 
              className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${state.progress}%` }}
            />
          </div>
        </div>

        {/* Step Navigator */}
        <div className="flex space-x-2 overflow-x-auto">
          {scenario.steps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => goToStep(index)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                index === state.currentStep
                  ? 'bg-yellow-400 text-gray-900'
                  : index < state.currentStep
                  ? 'bg-green-400 text-gray-900'
                  : 'bg-blue-500 text-blue-100 hover:bg-blue-400'
              }`}
            >
              {index + 1}. {step.title}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Step {state.currentStep + 1}: {currentStepData.title}
          </h3>
          <p className="text-gray-600">{currentStepData.description}</p>
        </div>

        {/* Input/Output Section */}
        {currentStepData.input && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Input:</h4>
            <div className="bg-gray-50 p-4 rounded-lg border">
              <p className="text-gray-800">{currentStepData.input}</p>
            </div>
          </div>
        )}

        {currentStepData.output && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Output:</h4>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap overflow-x-auto">
                {currentStepData.output}
              </pre>
            </div>
          </div>
        )}

        {/* Code Section */}
        {currentStepData.code && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-700">
                Code ({currentStepData.language || 'javascript'}):
              </h4>
              <button
                onClick={() => setShowCode(!showCode)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {showCode ? 'Hide' : 'Show'} Code
              </button>
            </div>
            
            {showCode && (
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                <pre className="text-sm">
                  <code>{currentStepData.code}</code>
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Explanation */}
        {currentStepData.explanation && (
          <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Explanation:</h4>
            <p className="text-blue-700">{currentStepData.explanation}</p>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <button
              onClick={prevStep}
              disabled={isFirstStep}
              className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            
            <button
              onClick={state.isPlaying ? pause : play}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {state.isPlaying ? (
                <>
                  <PauseIcon className="h-4 w-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <PlayIcon className="h-4 w-4 mr-2" />
                  {state.currentStep === 0 && !state.startTime ? 'Start Demo' : 'Resume'}
                </>
              )}
            </button>
            
            <button
              onClick={nextStep}
              disabled={isLastStep}
              className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              {state.currentStep + 1} of {scenario.steps.length}
            </span>
            
            {isLastStep && (
              <button
                onClick={completeDemo}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Complete Demo
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Benefits Sidebar */}
      <div className="bg-gray-50 p-6 border-t border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-3">Key Benefits:</h4>
        <ul className="space-y-2">
          {scenario.benefits.map((benefit, index) => (
            <li key={index} className="flex items-center text-sm text-gray-700">
              <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
              {benefit}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}