'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// A/B Test Configuration
export interface ABTest {
  id: string;
  name: string;
  description: string;
  variants: ABVariant[];
  status: 'draft' | 'running' | 'paused' | 'completed';
  startDate: string;
  endDate?: string;
  targetAudience?: {
    percentage: number;
    conditions?: ABCondition[];
  };
  metrics: ABMetric[];
  results?: ABTestResults;
}

export interface ABVariant {
  id: string;
  name: string;
  description: string;
  weight: number; // Percentage of traffic (0-100)
  config: Record<string, any>;
  isControl: boolean;
}

export interface ABCondition {
  type: 'location' | 'device' | 'source' | 'custom';
  operator: 'equals' | 'contains' | 'not_equals' | 'in' | 'not_in';
  value: string | string[];
}

export interface ABMetric {
  id: string;
  name: string;
  type: 'conversion' | 'click' | 'time' | 'custom';
  goal: 'increase' | 'decrease';
  target?: number;
}

export interface ABTestResults {
  totalParticipants: number;
  variantResults: Array<{
    variantId: string;
    participants: number;
    conversions: number;
    conversionRate: number;
    significance: number;
    confidence: number;
    metrics: Record<string, number>;
  }>;
  winner?: string;
  status: 'running' | 'inconclusive' | 'significant';
  lastUpdated: string;
}

// User assignment for A/B tests
export interface UserAssignment {
  userId: string;
  testId: string;
  variantId: string;
  assignedAt: string;
  hasConverted: boolean;
  events: ABEvent[];
}

export interface ABEvent {
  type: string;
  timestamp: string;
  data?: Record<string, any>;
}

// A/B Testing Store
interface ABTestingState {
  tests: ABTest[];
  userAssignments: UserAssignment[];
  isEnabled: boolean;
}

interface ABTestingActions {
  createTest: (test: Omit<ABTest, 'id'>) => void;
  updateTest: (id: string, updates: Partial<ABTest>) => void;
  startTest: (id: string) => void;
  stopTest: (id: string) => void;
  deleteTest: (id: string) => void;
  assignUserToTest: (testId: string, userId: string) => string | null;
  trackEvent: (testId: string, userId: string, eventType: string, data?: Record<string, any>) => void;
  getVariantForUser: (testId: string, userId: string) => string | null;
  setEnabled: (enabled: boolean) => void;
}

export const useABTestingStore = create<ABTestingState & ABTestingActions>()(
  persist(
    (set, get) => ({
      // State
      tests: [],
      userAssignments: [],
      isEnabled: process.env.NODE_ENV === 'production',

      // Actions
      createTest: (test) =>
        set((state) => ({
          tests: [
            ...state.tests,
            {
              ...test,
              id: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            },
          ],
        })),

      updateTest: (id, updates) =>
        set((state) => ({
          tests: state.tests.map((test) =>
            test.id === id ? { ...test, ...updates } : test
          ),
        })),

      startTest: (id) =>
        set((state) => ({
          tests: state.tests.map((test) =>
            test.id === id
              ? {
                  ...test,
                  status: 'running' as const,
                  startDate: new Date().toISOString(),
                }
              : test
          ),
        })),

      stopTest: (id) =>
        set((state) => ({
          tests: state.tests.map((test) =>
            test.id === id
              ? {
                  ...test,
                  status: 'completed' as const,
                  endDate: new Date().toISOString(),
                }
              : test
          ),
        })),

      deleteTest: (id) =>
        set((state) => ({
          tests: state.tests.filter((test) => test.id !== id),
          userAssignments: state.userAssignments.filter(
            (assignment) => assignment.testId !== id
          ),
        })),

      assignUserToTest: (testId, userId) => {
        const state = get();
        const test = state.tests.find((t) => t.id === testId);
        
        if (!test || test.status !== 'running') return null;

        // Check if user is already assigned
        const existingAssignment = state.userAssignments.find(
          (a) => a.testId === testId && a.userId === userId
        );
        
        if (existingAssignment) {
          return existingAssignment.variantId;
        }

        // Check target audience conditions
        if (test.targetAudience && !shouldUserParticipate(test.targetAudience, userId)) {
          return null;
        }

        // Assign user to variant based on weights
        const variantId = selectVariant(test.variants, userId);
        
        if (!variantId) return null;

        const assignment: UserAssignment = {
          userId,
          testId,
          variantId,
          assignedAt: new Date().toISOString(),
          hasConverted: false,
          events: [],
        };

        set((state) => ({
          userAssignments: [...state.userAssignments, assignment],
        }));

        // Track assignment event
        trackABTestEvent('user_assigned', {
          testId,
          userId,
          variantId,
        });

        return variantId;
      },

      trackEvent: (testId, userId, eventType, data) => {
        const event: ABEvent = {
          type: eventType,
          timestamp: new Date().toISOString(),
          data,
        };

        set((state) => ({
          userAssignments: state.userAssignments.map((assignment) =>
            assignment.testId === testId && assignment.userId === userId
              ? {
                  ...assignment,
                  events: [...assignment.events, event],
                  hasConverted:
                    assignment.hasConverted || eventType === 'conversion',
                }
              : assignment
          ),
        }));

        // Send to analytics
        trackABTestEvent(eventType, {
          testId,
          userId,
          ...data,
        });
      },

      getVariantForUser: (testId, userId) => {
        const state = get();
        const assignment = state.userAssignments.find(
          (a) => a.testId === testId && a.userId === userId
        );
        return assignment?.variantId || null;
      },

      setEnabled: (enabled) => set({ isEnabled: enabled }),
    }),
    {
      name: 'ab-testing-storage',
      partialize: (state) => ({
        tests: state.tests,
        userAssignments: state.userAssignments.slice(-1000), // Limit stored assignments
        isEnabled: state.isEnabled,
      }),
    }
  )
);

// Helper Functions
function shouldUserParticipate(
  targetAudience: NonNullable<ABTest['targetAudience']>,
  userId: string
): boolean {
  // Check percentage
  const userHash = hashString(userId);
  if (userHash % 100 >= targetAudience.percentage) {
    return false;
  }

  // Check conditions (if any)
  if (targetAudience.conditions) {
    return targetAudience.conditions.every((condition) =>
      evaluateCondition(condition, userId)
    );
  }

  return true;
}

function selectVariant(variants: ABVariant[], userId: string): string | null {
  if (variants.length === 0) return null;

  const userHash = hashString(userId);
  const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);
  
  if (totalWeight === 0) return null;

  const normalizedHash = userHash % totalWeight;
  let cumulativeWeight = 0;

  for (const variant of variants) {
    cumulativeWeight += variant.weight;
    if (normalizedHash < cumulativeWeight) {
      return variant.id;
    }
  }

  return variants[0].id; // Fallback
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

function evaluateCondition(condition: ABCondition, userId: string): boolean {
  // This would be expanded based on available user data
  // For now, return true (no filtering)
  return true;
}

function trackABTestEvent(eventType: string, data: Record<string, any>) {
  // Send to analytics service
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventType, {
      event_category: 'AB_Test',
      custom_parameter_1: data.testId,
      custom_parameter_2: data.variantId,
    });
  }

  // Send to custom analytics endpoint
  if (process.env.NODE_ENV === 'production') {
    fetch('/api/analytics/ab-test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: eventType,
        ...data,
        timestamp: new Date().toISOString(),
      }),
    }).catch(console.error);
  }
}

// React Hooks for A/B Testing
export function useABTest(testId: string, userId?: string) {
  const { tests, assignUserToTest, getVariantForUser, trackEvent, isEnabled } =
    useABTestingStore();

  const test = tests.find((t) => t.id === testId);
  const effectiveUserId = userId || generateUserId();
  
  const variantId = React.useMemo(() => {
    if (!isEnabled || !test || test.status !== 'running') return null;
    return assignUserToTest(testId, effectiveUserId);
  }, [testId, effectiveUserId, isEnabled, test?.status]);

  const variant = test?.variants.find((v) => v.id === variantId);

  const track = React.useCallback(
    (eventType: string, data?: Record<string, any>) => {
      if (variantId) {
        trackEvent(testId, effectiveUserId, eventType, data);
      }
    },
    [testId, effectiveUserId, variantId, trackEvent]
  );

  return {
    variant: variant || null,
    isParticipating: !!variantId,
    track,
    test,
  };
}

// Component wrapper for A/B testing
interface ABTestComponentProps {
  testId: string;
  userId?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ABTestComponent({
  testId,
  userId,
  children,
  fallback = null,
}: ABTestComponentProps) {
  const { variant, isParticipating } = useABTest(testId, userId);

  if (!isParticipating) {
    return <>{fallback}</>;
  }

  // Clone children and inject variant config
  return React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        ...child.props,
        abVariant: variant,
        abConfig: variant?.config,
      });
    }
    return child;
  });
}

// Higher-order component for A/B testing
export function withABTest<P extends object>(
  Component: React.ComponentType<P>,
  testId: string
) {
  const WrappedComponent = React.forwardRef<any, P & { userId?: string }>((props, ref) => {
    const { userId, ...componentProps } = props;
    const { variant, track } = useABTest(testId, userId);

    return (
      <Component
        {...(componentProps as P)}
        ref={ref}
        abVariant={variant}
        abConfig={variant?.config}
        abTrack={track}
      />
    );
  });
  WrappedComponent.displayName = `withABTest(${Component.displayName || Component.name || 'Component'})`;
  return WrappedComponent;
}

// Utility functions
function generateUserId(): string {
  if (typeof window !== 'undefined') {
    // Try to get existing user ID from localStorage
    let userId = localStorage.getItem('ab_test_user_id');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('ab_test_user_id', userId);
    }
    return userId;
  }
  
  // Server-side fallback
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Predefined test configurations
export const predefinedTests = {
  heroButtonColor: {
    name: 'Hero CTA Button Color',
    description: 'Test different colors for the main hero CTA button',
    variants: [
      {
        id: 'control',
        name: 'Blue (Control)',
        description: 'Original blue button',
        weight: 50,
        config: { buttonColor: 'blue', buttonClass: 'bg-blue-600 hover:bg-blue-700' },
        isControl: true,
      },
      {
        id: 'green',
        name: 'Green',
        description: 'Green button variant',
        weight: 50,
        config: { buttonColor: 'green', buttonClass: 'bg-green-600 hover:bg-green-700' },
        isControl: false,
      },
    ],
    metrics: [
      {
        id: 'cta_click',
        name: 'CTA Click Rate',
        type: 'click' as const,
        goal: 'increase' as const,
      },
    ],
  },

  pricingPageLayout: {
    name: 'Pricing Page Layout',
    description: 'Test different layouts for the pricing page',
    variants: [
      {
        id: 'three_columns',
        name: 'Three Columns (Control)',
        description: 'Standard three-column layout',
        weight: 50,
        config: { layout: 'three_columns', showComparison: false },
        isControl: true,
      },
      {
        id: 'four_columns',
        name: 'Four Columns with Comparison',
        description: 'Four columns with feature comparison',
        weight: 50,
        config: { layout: 'four_columns', showComparison: true },
        isControl: false,
      },
    ],
    metrics: [
      {
        id: 'pricing_conversion',
        name: 'Pricing Page Conversion',
        type: 'conversion' as const,
        goal: 'increase' as const,
      },
    ],
  },

  onboardingFlow: {
    name: 'User Onboarding Flow',
    description: 'Test different onboarding experiences',
    variants: [
      {
        id: 'single_step',
        name: 'Single Step (Control)',
        description: 'One-page onboarding form',
        weight: 50,
        config: { steps: 1, showProgress: false },
        isControl: true,
      },
      {
        id: 'multi_step',
        name: 'Multi-Step with Progress',
        description: 'Multi-step onboarding with progress indicator',
        weight: 50,
        config: { steps: 3, showProgress: true },
        isControl: false,
      },
    ],
    metrics: [
      {
        id: 'onboarding_completion',
        name: 'Onboarding Completion Rate',
        type: 'conversion' as const,
        goal: 'increase' as const,
      },
    ],
  },
} as const;

// Analytics and reporting
export class ABTestAnalytics {
  static calculateStatisticalSignificance(
    controlConversions: number,
    controlTotal: number,
    variantConversions: number,
    variantTotal: number
  ): { significance: number; confidence: number } {
    const controlRate = controlConversions / controlTotal;
    const variantRate = variantConversions / variantTotal;
    
    const pooledRate = (controlConversions + variantConversions) / (controlTotal + variantTotal);
    const standardError = Math.sqrt(
      pooledRate * (1 - pooledRate) * (1 / controlTotal + 1 / variantTotal)
    );
    
    const zScore = Math.abs(variantRate - controlRate) / standardError;
    const pValue = 2 * (1 - normalCDF(Math.abs(zScore)));
    
    return {
      significance: zScore,
      confidence: (1 - pValue) * 100,
    };
  }

  static generateReport(test: ABTest): string {
    if (!test.results) return 'No results available';

    const { variantResults, totalParticipants, winner, status } = test.results;
    
    let report = `A/B Test Report: ${test.name}\n`;
    report += `Status: ${status}\n`;
    report += `Total Participants: ${totalParticipants}\n\n`;

    variantResults.forEach((result) => {
      const variant = test.variants.find((v) => v.id === result.variantId);
      report += `${variant?.name || result.variantId}:\n`;
      report += `  Participants: ${result.participants}\n`;
      report += `  Conversions: ${result.conversions}\n`;
      report += `  Conversion Rate: ${(result.conversionRate * 100).toFixed(2)}%\n`;
      report += `  Confidence: ${result.confidence.toFixed(1)}%\n\n`;
    });

    if (winner) {
      const winnerVariant = test.variants.find((v) => v.id === winner);
      report += `Winner: ${winnerVariant?.name || winner}\n`;
    }

    return report;
  }
}

// Normal cumulative distribution function (for statistical calculations)
function normalCDF(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp(-x * x / 2);
  let prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  
  if (x > 0) prob = 1 - prob;
  return prob;
}