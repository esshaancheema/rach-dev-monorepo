'use client';

import { useState, useEffect, useCallback } from 'react';

export interface ABTestVariant {
  id: string;
  name: string;
  weight: number;
  config: Record<string, any>;
}

export interface ABTest {
  id: string;
  name: string;
  description: string;
  variants: ABTestVariant[];
  startDate: string;
  endDate?: string;
  active: boolean;
  targetPath?: string;
  targetAudience?: {
    countries?: string[];
    industries?: string[];
    newUsers?: boolean;
    returningUsers?: boolean;
  };
}

export interface ABTestAssignment {
  testId: string;
  variantId: string;
  assignedAt: string;
  userId?: string;
  sessionId: string;
}

export interface ConversionEvent {
  eventName: string;
  testId: string;
  variantId: string;
  value?: number;
  metadata?: Record<string, any>;
  timestamp: string;
  userId?: string;
  sessionId: string;
}

// Utility function to generate session IDs
function generateSessionId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return 'session_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2);
}

// Predefined A/B tests configuration
const AB_TESTS: ABTest[] = [
  {
    id: 'homepage_hero_cta',
    name: 'Homepage Hero CTA Text',
    description: 'Test different CTA button texts on the homepage hero section',
    variants: [
      {
        id: 'control',
        name: 'Control - Start Your Project Today',
        weight: 0.5,
        config: {
          ctaText: 'Start Your Project Today',
          ctaStyle: 'primary',
          ctaSize: 'lg'
        }
      },
      {
        id: 'variant_a',
        name: 'Get Free Consultation',
        weight: 0.5,
        config: {
          ctaText: 'Get Free Consultation',
          ctaStyle: 'primary',
          ctaSize: 'lg'
        }
      }
    ],
    startDate: '2024-12-01',
    active: true,
    targetPath: '/'
  },
  {
    id: 'pricing_display',
    name: 'Pricing Display Format',
    description: 'Test different pricing display formats on the homepage',
    variants: [
      {
        id: 'control',
        name: 'Control - Monthly Pricing',
        weight: 0.33,
        config: {
          pricingPeriod: 'monthly',
          showDiscount: false,
          highlightPopular: true
        }
      },
      {
        id: 'variant_a',
        name: 'Annual with Discount',
        weight: 0.33,
        config: {
          pricingPeriod: 'annual',
          showDiscount: true,
          highlightPopular: true
        }
      },
      {
        id: 'variant_b',
        name: 'Value-Based Pricing',
        weight: 0.34,
        config: {
          pricingPeriod: 'value',
          showROI: true,
          highlightPopular: false
        }
      }
    ],
    startDate: '2024-12-01',
    active: true,
    targetPath: '/'
  },
  {
    id: 'contact_form_length',
    name: 'Contact Form Length',
    description: 'Test shorter vs longer contact forms',
    variants: [
      {
        id: 'control',
        name: 'Control - Full Form',
        weight: 0.5,
        config: {
          fields: ['name', 'email', 'company', 'phone', 'project_type', 'budget', 'timeline', 'message'],
          required: ['name', 'email', 'message']
        }
      },
      {
        id: 'variant_a',
        name: 'Short Form',
        weight: 0.5,
        config: {
          fields: ['name', 'email', 'message'],
          required: ['name', 'email', 'message']
        }
      }
    ],
    startDate: '2024-12-01',
    active: true,
    targetPath: '/contact'
  }
];

export function useABTesting(testId?: string) {
  const [assignments, setAssignments] = useState<Record<string, ABTestAssignment>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string>('');

  // Initialize session ID
  useEffect(() => {
    let storedSessionId = sessionStorage.getItem('ab_session_id');
    if (!storedSessionId) {
      storedSessionId = generateSessionId();
      sessionStorage.setItem('ab_session_id', storedSessionId);
    }
    setSessionId(storedSessionId);
  }, []);

  // Load existing assignments from localStorage
  useEffect(() => {
    if (!sessionId) return;
    if (typeof window === 'undefined') return;

    try {
      const storedAssignments = localStorage.getItem('ab_test_assignments');
      if (storedAssignments) {
        const parsed = JSON.parse(storedAssignments);
        setAssignments(parsed);
      }
    } catch (error) {
      console.error('Failed to load AB test assignments:', error);
    }
    setIsLoading(false);
  }, [sessionId]);

  // Get variant for a specific test
  const getVariant = useCallback((testIdParam: string): ABTestVariant | null => {
    const test = AB_TESTS.find(t => t.id === testIdParam);
    if (!test || !test.active) return null;

    // Check if user is in target audience (simplified)
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
    if (test.targetPath && !currentPath.startsWith(test.targetPath)) {
      return null;
    }

    // Check if already assigned
    let assignment = assignments[testIdParam];
    
    if (!assignment) {
      // Assign to variant based on weights
      const random = Math.random();
      let cumulativeWeight = 0;
      
      for (const variant of test.variants) {
        cumulativeWeight += variant.weight;
        if (random <= cumulativeWeight) {
          assignment = {
            testId: testIdParam,
            variantId: variant.id,
            assignedAt: new Date().toISOString(),
            sessionId
          };
          
          // Save assignment
          const newAssignments = { ...assignments, [testIdParam]: assignment };
          setAssignments(newAssignments);
          if (typeof window !== 'undefined') {
            localStorage.setItem('ab_test_assignments', JSON.stringify(newAssignments));
          }
          
          // Track assignment event
          trackEvent('test_assignment', testIdParam, variant.id);
          break;
        }
      }
    }

    if (!assignment) return null;

    return test.variants.find(v => v.id === assignment.variantId) || null;
  }, [assignments, sessionId]);

  // Track conversion events
  const trackEvent = useCallback(async (
    eventName: string,
    testIdParam: string,
    variantId?: string,
    value?: number,
    metadata?: Record<string, any>
  ) => {
    try {
      // Ensure we have a sessionId (avoid during SSR)
      if (typeof window === 'undefined') {
        console.warn('AB test event tracking skipped during SSR');
        return;
      }
      
      const currentSessionId = sessionId || generateSessionId();
      
      const assignment = assignments[testIdParam];
      if (!assignment && !variantId) return;

      const event: ConversionEvent = {
        eventName,
        testId: testIdParam,
        variantId: variantId || assignment?.variantId || '',
        value,
        metadata,
        timestamp: new Date().toISOString(),
        sessionId: currentSessionId
      };

      // Send to analytics API
      await fetch('/api/ab-testing/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });

      // Also log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log('AB Test Event:', event);
      }
    } catch (error) {
      console.error('Failed to track AB test event:', error);
    }
  }, [assignments, sessionId]);

  // Track page view
  const trackPageView = useCallback((path?: string) => {
    const activeTests = AB_TESTS.filter(test => {
      if (!test.active) return false;
      const currentPath = path || (typeof window !== 'undefined' ? window.location.pathname : '/');
      return !test.targetPath || currentPath.startsWith(test.targetPath);
    });

    activeTests.forEach(test => {
      const variant = getVariant(test.id);
      if (variant) {
        trackEvent('page_view', test.id, variant.id);
      }
    });
  }, [getVariant, trackEvent]);

  // Track conversion (form submission, purchase, etc.)
  const trackConversion = useCallback((
    eventName: string,
    testIdParam: string,
    value?: number,
    metadata?: Record<string, any>
  ) => {
    const assignment = assignments[testIdParam];
    if (assignment) {
      trackEvent(eventName, testIdParam, assignment.variantId, value, metadata);
    }
  }, [assignments, trackEvent]);

  // Get all active tests for current page
  const getActiveTests = useCallback((path?: string): ABTest[] => {
    const currentPath = path || (typeof window !== 'undefined' ? window.location.pathname : '/');
    return AB_TESTS.filter(test => {
      if (!test.active) return false;
      return !test.targetPath || currentPath.startsWith(test.targetPath);
    });
  }, []);

  // If specific test ID provided, return just that test's variant
  if (testId) {
    return {
      variant: getVariant(testId),
      trackConversion: (eventName: string, value?: number, metadata?: Record<string, any>) =>
        trackConversion(eventName, testId, value, metadata),
      trackEvent: (eventName: string, value?: number, metadata?: Record<string, any>) =>
        trackEvent(eventName, testId, undefined, value, metadata),
      isLoading
    };
  }

  // Return full AB testing interface
  return {
    getVariant,
    trackEvent,
    trackConversion,
    trackPageView,
    getActiveTests,
    assignments,
    isLoading,
    sessionId
  };
}

// Utility function to check if user is in AB test
export function isInTest(testId: string): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const assignments = localStorage.getItem('ab_test_assignments');
    if (!assignments) return false;
    
    const parsed = JSON.parse(assignments);
    return !!parsed[testId];
  } catch {
    return false;
  }
}

// Utility function to get variant config for a test
export function getTestVariantConfig(testId: string, fallback: Record<string, any> = {}): Record<string, any> {
  if (typeof window === 'undefined') return fallback;
  
  try {
    const assignments = localStorage.getItem('ab_test_assignments');
    if (!assignments) return fallback;
    
    const parsed = JSON.parse(assignments);
    const assignment = parsed[testId];
    
    if (!assignment) return fallback;
    
    const test = AB_TESTS.find(t => t.id === testId);
    const variant = test?.variants.find(v => v.id === assignment.variantId);
    
    return variant?.config || fallback;
  } catch {
    return fallback;
  }
}

// Export test configurations for external access
export const getABTestConfigs = () => AB_TESTS;