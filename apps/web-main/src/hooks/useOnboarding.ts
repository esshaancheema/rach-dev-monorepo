'use client';

import { useState, useEffect } from 'react';

interface OnboardingState {
  hasSeenTutorial: boolean;
  hasGeneratedFirstApp: boolean;
  preferredFramework?: 'react' | 'vue' | 'vanilla';
  completedSteps: string[];
}

const ONBOARDING_STORAGE_KEY = 'zoptal_onboarding_state';

export function useOnboarding() {
  const [onboardingState, setOnboardingState] = useState<OnboardingState>({
    hasSeenTutorial: false,
    hasGeneratedFirstApp: false,
    completedSteps: []
  });
  
  const [showTutorial, setShowTutorial] = useState(false);

  // Load onboarding state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (saved) {
        const parsedState = JSON.parse(saved);
        setOnboardingState(parsedState);
        
        // Show tutorial for new users
        if (!parsedState.hasSeenTutorial) {
          setShowTutorial(true);
        }
      } else {
        // New user - show tutorial
        setShowTutorial(true);
      }
    } catch (error) {
      console.error('Failed to load onboarding state:', error);
      setShowTutorial(true); // Default to showing tutorial
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(onboardingState));
    } catch (error) {
      console.error('Failed to save onboarding state:', error);
    }
  }, [onboardingState]);

  const completeTutorial = () => {
    setOnboardingState(prev => ({
      ...prev,
      hasSeenTutorial: true,
      completedSteps: [...new Set([...prev.completedSteps, 'tutorial'])]
    }));
    setShowTutorial(false);
  };

  const skipTutorial = () => {
    setOnboardingState(prev => ({
      ...prev,
      hasSeenTutorial: true
    }));
    setShowTutorial(false);
  };

  const markFirstAppGenerated = (framework?: 'react' | 'vue' | 'vanilla') => {
    setOnboardingState(prev => ({
      ...prev,
      hasGeneratedFirstApp: true,
      preferredFramework: framework || prev.preferredFramework,
      completedSteps: [...new Set([...prev.completedSteps, 'first-app'])]
    }));
  };

  const completeStep = (stepId: string) => {
    setOnboardingState(prev => ({
      ...prev,
      completedSteps: [...new Set([...prev.completedSteps, stepId])]
    }));
  };

  const resetOnboarding = () => {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    setOnboardingState({
      hasSeenTutorial: false,
      hasGeneratedFirstApp: false,
      completedSteps: []
    });
    setShowTutorial(true);
  };

  const isNewUser = !onboardingState.hasSeenTutorial && !onboardingState.hasGeneratedFirstApp;
  const isCompletedStep = (stepId: string) => onboardingState.completedSteps.includes(stepId);

  return {
    // State
    onboardingState,
    showTutorial,
    isNewUser,
    
    // Actions
    completeTutorial,
    skipTutorial,
    markFirstAppGenerated,
    completeStep,
    resetOnboarding,
    isCompletedStep,
    
    // Manual control
    setShowTutorial
  };
}