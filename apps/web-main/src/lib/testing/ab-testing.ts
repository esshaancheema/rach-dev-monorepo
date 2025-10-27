// A/B Testing Framework for Zoptal Platform
import { analytics } from '@/lib/analytics/tracker';

export interface ABTest {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'paused' | 'completed' | 'archived';
  startDate: string;
  endDate?: string;
  variants: ABVariant[];
  targetAudience: ABTargetAudience;
  conversionGoals: ABConversionGoal[];
  trafficAllocation: number; // Percentage of traffic to include in test
  results?: ABTestResults;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ABVariant {
  id: string;
  name: string;
  description: string;
  isControl: boolean;
  trafficWeight: number; // Percentage of test traffic
  config: {
    [key: string]: any; // Variant-specific configuration
  };
  screenshots?: string[];
}

export interface ABTargetAudience {
  includeRules: ABRule[];
  excludeRules: ABRule[];
  sampleSize?: number;
}

export interface ABRule {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
}

export interface ABConversionGoal {
  id: string;
  name: string;
  type: 'page_view' | 'click' | 'form_submit' | 'purchase' | 'custom_event';
  target: string; // CSS selector, URL pattern, or event name
  value?: number; // For revenue goals
  isPrimary: boolean;
}

export interface ABTestResults {
  participantCount: number;
  conversionData: {
    [variantId: string]: ABVariantResults;
  };
  statisticalSignificance: {
    [goalId: string]: {
      isSignificant: boolean;
      confidence: number;
      pValue: number;
      winner?: string;
    };
  };
  startedAt: string;
  lastUpdated: string;
}

export interface ABVariantResults {
  participants: number;
  conversions: {
    [goalId: string]: {
      count: number;
      rate: number;
      value?: number;
    };
  };
}

export interface ABTestSession {
  sessionId: string;
  userId?: string;
  testId: string;
  variantId: string;
  assignedAt: string;
  conversions: Array<{
    goalId: string;
    timestamp: string;
    value?: number;
  }>;
}

export class ABTestingFramework {
  private static instance: ABTestingFramework;
  private tests: Map<string, ABTest> = new Map();
  private userAssignments: Map<string, Map<string, string>> = new Map(); // userId -> testId -> variantId
  private sessionAssignments: Map<string, Map<string, string>> = new Map(); // sessionId -> testId -> variantId
  private readonly STORAGE_KEY = 'ab_test_assignments';

  static getInstance(): ABTestingFramework {
    if (!ABTestingFramework.instance) {
      ABTestingFramework.instance = new ABTestingFramework();
    }
    return ABTestingFramework.instance;
  }

  private constructor() {
    if (typeof window !== 'undefined') {
      this.loadAssignments();
    }
  }

  /**
   * Create a new A/B test
   */
  async createTest(test: Omit<ABTest, 'id' | 'createdAt' | 'updatedAt'>): Promise<ABTest> {
    const newTest: ABTest = {
      ...test,
      id: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Validate test configuration
    this.validateTest(newTest);

    this.tests.set(newTest.id, newTest);

    analytics.track({
      name: 'ab_test_created',
      category: 'ab_testing',
      properties: {
        test_id: newTest.id,
        test_name: newTest.name,
        variant_count: newTest.variants.length,
        traffic_allocation: newTest.trafficAllocation
      }
    });

    return newTest;
  }

  /**
   * Start an A/B test
   */
  async startTest(testId: string): Promise<void> {
    const test = this.tests.get(testId);
    if (!test) {
      throw new Error(`Test ${testId} not found`);
    }

    if (test.status !== 'draft') {
      throw new Error(`Test ${testId} cannot be started from ${test.status} status`);
    }

    test.status = 'running';
    test.startDate = new Date().toISOString();
    test.updatedAt = new Date().toISOString();
    test.results = {
      participantCount: 0,
      conversionData: {},
      statisticalSignificance: {},
      startedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    // Initialize results for each variant
    test.variants.forEach(variant => {
      test.results!.conversionData[variant.id] = {
        participants: 0,
        conversions: {}
      };

      // Initialize conversions for each goal
      test.conversionGoals.forEach(goal => {
        test.results!.conversionData[variant.id].conversions[goal.id] = {
          count: 0,
          rate: 0,
          value: 0
        };
      });
    });

    this.tests.set(testId, test);

    analytics.track({
      name: 'ab_test_started',
      category: 'ab_testing',
      properties: {
        test_id: testId,
        test_name: test.name
      }
    });
  }

  /**
   * Stop an A/B test
   */
  async stopTest(testId: string): Promise<void> {
    const test = this.tests.get(testId);
    if (!test) {
      throw new Error(`Test ${testId} not found`);
    }

    test.status = 'completed';
    test.endDate = new Date().toISOString();
    test.updatedAt = new Date().toISOString();

    if (test.results) {
      test.results.lastUpdated = new Date().toISOString();
    }

    this.tests.set(testId, test);

    analytics.track({
      name: 'ab_test_stopped',
      category: 'ab_testing',
      properties: {
        test_id: testId,
        test_name: test.name,
        duration_days: test.endDate && test.startDate ? 
          Math.round((new Date(test.endDate).getTime() - new Date(test.startDate).getTime()) / (1000 * 60 * 60 * 24)) : 0
      }
    });
  }

  /**
   * Get variant assignment for a user/session
   */
  getVariantAssignment(
    testId: string,
    userId?: string,
    sessionId?: string
  ): string | null {
    const test = this.tests.get(testId);
    if (!test || test.status !== 'running') {
      return null;
    }

    // Check if user/session should be included in test
    if (!this.shouldIncludeInTest(test, userId, sessionId)) {
      return null;
    }

    const identifier = userId || sessionId;
    if (!identifier) {
      return null;
    }

    // Check existing assignment
    const assignments = userId ? 
      this.userAssignments.get(userId) : 
      this.sessionAssignments.get(sessionId!);

    if (assignments?.has(testId)) {
      return assignments.get(testId)!;
    }

    // Assign to variant based on traffic allocation and weights
    const assignment = this.assignToVariant(test, identifier);
    
    if (assignment) {
      // Store assignment
      if (userId) {
        if (!this.userAssignments.has(userId)) {
          this.userAssignments.set(userId, new Map());
        }
        this.userAssignments.get(userId)!.set(testId, assignment);
      } else if (sessionId) {
        if (!this.sessionAssignments.has(sessionId)) {
          this.sessionAssignments.set(sessionId, new Map());
        }
        this.sessionAssignments.get(sessionId)!.set(testId, assignment);
      }

      // Update participant count
      if (test.results) {
        test.results.participantCount++;
        test.results.conversionData[assignment].participants++;
        test.results.lastUpdated = new Date().toISOString();
      }

      this.saveAssignments();

      analytics.track({
        name: 'ab_test_participant_assigned',
        category: 'ab_testing',
        properties: {
          test_id: testId,
          variant_id: assignment,
          user_id: userId,
          session_id: sessionId
        }
      });
    }

    return assignment;
  }

  /**
   * Track conversion for a test participant
   */
  trackConversion(
    testId: string,
    goalId: string,
    value?: number,
    userId?: string,
    sessionId?: string
  ): void {
    const test = this.tests.get(testId);
    if (!test || test.status !== 'running' || !test.results) {
      return;
    }

    const identifier = userId || sessionId;
    if (!identifier) {
      return;
    }

    // Get variant assignment
    const assignments = userId ? 
      this.userAssignments.get(userId) : 
      this.sessionAssignments.get(sessionId!);

    const variantId = assignments?.get(testId);
    if (!variantId) {
      return;
    }

    // Record conversion
    const variantResults = test.results.conversionData[variantId];
    if (variantResults && variantResults.conversions[goalId]) {
      variantResults.conversions[goalId].count++;
      variantResults.conversions[goalId].rate = 
        variantResults.conversions[goalId].count / variantResults.participants;
      
      if (value !== undefined) {
        variantResults.conversions[goalId].value = 
          (variantResults.conversions[goalId].value || 0) + value;
      }
    }

    test.results.lastUpdated = new Date().toISOString();

    // Calculate statistical significance if enough data
    this.calculateStatisticalSignificance(test);

    analytics.track({
      name: 'ab_test_conversion',
      category: 'ab_testing',
      properties: {
        test_id: testId,
        variant_id: variantId,
        goal_id: goalId,
        value,
        user_id: userId,
        session_id: sessionId
      }
    });
  }

  /**
   * Get all active tests
   */
  getActiveTests(): ABTest[] {
    return Array.from(this.tests.values()).filter(test => test.status === 'running');
  }

  /**
   * Get test by ID
   */
  getTest(testId: string): ABTest | undefined {
    return this.tests.get(testId);
  }

  /**
   * Get all tests
   */
  getAllTests(): ABTest[] {
    return Array.from(this.tests.values());
  }

  /**
   * Get variant configuration for display
   */
  getVariantConfig(testId: string, userId?: string, sessionId?: string): any {
    const variantId = this.getVariantAssignment(testId, userId, sessionId);
    if (!variantId) {
      return null;
    }

    const test = this.tests.get(testId);
    const variant = test?.variants.find(v => v.id === variantId);
    
    return variant?.config || null;
  }

  /**
   * Export test results
   */
  exportTestResults(testId: string): any {
    const test = this.tests.get(testId);
    if (!test) {
      throw new Error(`Test ${testId} not found`);
    }

    return {
      test: {
        id: test.id,
        name: test.name,
        description: test.description,
        status: test.status,
        startDate: test.startDate,
        endDate: test.endDate,
        variants: test.variants.map(v => ({
          id: v.id,
          name: v.name,
          isControl: v.isControl,
          trafficWeight: v.trafficWeight
        })),
        conversionGoals: test.conversionGoals
      },
      results: test.results
    };
  }

  /**
   * Private helper methods
   */
  private validateTest(test: ABTest): void {
    if (test.variants.length < 2) {
      throw new Error('Test must have at least 2 variants');
    }

    const totalWeight = test.variants.reduce((sum, v) => sum + v.trafficWeight, 0);
    if (Math.abs(totalWeight - 100) > 0.01) {
      throw new Error('Variant traffic weights must sum to 100%');
    }

    const controlVariants = test.variants.filter(v => v.isControl);
    if (controlVariants.length !== 1) {
      throw new Error('Test must have exactly one control variant');
    }

    if (test.conversionGoals.length === 0) {
      throw new Error('Test must have at least one conversion goal');
    }

    const primaryGoals = test.conversionGoals.filter(g => g.isPrimary);
    if (primaryGoals.length !== 1) {
      throw new Error('Test must have exactly one primary conversion goal');
    }
  }

  private shouldIncludeInTest(test: ABTest, userId?: string, sessionId?: string): boolean {
    // Check traffic allocation
    const identifier = userId || sessionId || '';
    const hash = this.hashString(identifier + test.id);
    const trafficBucket = hash % 100;
    
    if (trafficBucket >= test.trafficAllocation) {
      return false;
    }

    // TODO: Implement audience targeting rules
    // For now, include all users
    return true;
  }

  private assignToVariant(test: ABTest, identifier: string): string {
    const hash = this.hashString(identifier + test.id + 'variant');
    const bucket = hash % 100;
    
    let cumulativeWeight = 0;
    for (const variant of test.variants) {
      cumulativeWeight += variant.trafficWeight;
      if (bucket < cumulativeWeight) {
        return variant.id;
      }
    }
    
    // Fallback to control
    return test.variants.find(v => v.isControl)?.id || test.variants[0].id;
  }

  private calculateStatisticalSignificance(test: ABTest): void {
    if (!test.results) return;

    const controlVariant = test.variants.find(v => v.isControl);
    if (!controlVariant) return;

    const controlResults = test.results.conversionData[controlVariant.id];
    if (!controlResults || controlResults.participants < 100) return;

    // Calculate significance for each goal
    test.conversionGoals.forEach(goal => {
      const controlConversions = controlResults.conversions[goal.id];
      if (!controlConversions) return;

      let bestVariant = controlVariant.id;
      let bestRate = controlConversions.rate;
      let isSignificant = false;

      // Compare each variant to control
      test.variants.forEach(variant => {
        if (variant.id === controlVariant.id) return;

        const variantResults = test.results!.conversionData[variant.id];
        if (!variantResults || variantResults.participants < 100) return;

        const variantConversions = variantResults.conversions[goal.id];
        if (!variantConversions) return;

        // Simple z-test for proportions
        const p1 = controlConversions.rate;
        const p2 = variantConversions.rate;
        const n1 = controlResults.participants;
        const n2 = variantResults.participants;

        if (n1 > 0 && n2 > 0 && p1 > 0 && p2 > 0) {
          const pooledP = (controlConversions.count + variantConversions.count) / (n1 + n2);
          const se = Math.sqrt(pooledP * (1 - pooledP) * (1/n1 + 1/n2));
          const zScore = Math.abs(p2 - p1) / se;
          const confidence = this.zScoreToConfidence(zScore);

          if (confidence > 95 && variantConversions.rate > bestRate) {
            bestVariant = variant.id;
            bestRate = variantConversions.rate;
            isSignificant = true;
          }
        }
      });

      test.results!.statisticalSignificance[goal.id] = {
        isSignificant,
        confidence: isSignificant ? 95 : 0,
        pValue: isSignificant ? 0.05 : 1,
        winner: isSignificant ? bestVariant : undefined
      };
    });
  }

  private zScoreToConfidence(zScore: number): number {
    // Simplified conversion from z-score to confidence percentage
    if (zScore >= 2.58) return 99;
    if (zScore >= 1.96) return 95;
    if (zScore >= 1.645) return 90;
    if (zScore >= 1.28) return 80;
    return 0;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private loadAssignments(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.userAssignments = new Map(data.userAssignments || []);
        this.sessionAssignments = new Map(data.sessionAssignments || []);
      }
    } catch (error) {
      console.error('Failed to load A/B test assignments:', error);
    }
  }

  private saveAssignments(): void {
    try {
      const data = {
        userAssignments: Array.from(this.userAssignments.entries()).map(([userId, tests]) => [
          userId,
          Array.from(tests.entries())
        ]),
        sessionAssignments: Array.from(this.sessionAssignments.entries()).map(([sessionId, tests]) => [
          sessionId,
          Array.from(tests.entries())
        ])
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save A/B test assignments:', error);
    }
  }
}

// Export singleton instance
export const abTesting = ABTestingFramework.getInstance();

// React hook for A/B testing
export function useABTest(testId: string, userId?: string) {
  const [variant, setVariant] = useState<string | null>(null);
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    const sessionId = typeof window !== 'undefined' ? 
      sessionStorage.getItem('session_id') || Math.random().toString(36) : undefined;
    
    if (sessionId && typeof window !== 'undefined') {
      sessionStorage.setItem('session_id', sessionId);
    }

    const assignedVariant = abTesting.getVariantAssignment(testId, userId, sessionId);
    const variantConfig = abTesting.getVariantConfig(testId, userId, sessionId);

    setVariant(assignedVariant);
    setConfig(variantConfig);
  }, [testId, userId]);

  const trackConversion = (goalId: string, value?: number) => {
    const sessionId = typeof window !== 'undefined' ? 
      sessionStorage.getItem('session_id') : undefined;
    
    abTesting.trackConversion(testId, goalId, value, userId, sessionId);
  };

  return {
    variant,
    config,
    trackConversion,
    isInTest: variant !== null
  };
}

// Helper function to create common test templates
export const createCommonTests = {
  heroSection: (variants: Array<{ name: string; config: any }>): Omit<ABTest, 'id' | 'createdAt' | 'updatedAt'> => ({
    name: 'Hero Section Optimization',
    description: 'Test different hero section variations for better conversion',
    status: 'draft',
    startDate: new Date().toISOString(),
    variants: variants.map((variant, index) => ({
      id: `hero_variant_${index}`,
      name: variant.name,
      description: `Hero section variant: ${variant.name}`,
      isControl: index === 0,
      trafficWeight: 100 / variants.length,
      config: variant.config
    })),
    targetAudience: {
      includeRules: [],
      excludeRules: []
    },
    conversionGoals: [
      {
        id: 'contact_form_submit',
        name: 'Contact Form Submission',
        type: 'form_submit',
        target: '#contact-form',
        isPrimary: true
      }
    ],
    trafficAllocation: 100,
    createdBy: 'system'
  }),

  pricingPage: (variants: Array<{ name: string; config: any }>): Omit<ABTest, 'id' | 'createdAt' | 'updatedAt'> => ({
    name: 'Pricing Page Optimization',
    description: 'Test different pricing presentations and CTAs',
    status: 'draft',
    startDate: new Date().toISOString(),
    variants: variants.map((variant, index) => ({
      id: `pricing_variant_${index}`,
      name: variant.name,
      description: `Pricing page variant: ${variant.name}`,
      isControl: index === 0,
      trafficWeight: 100 / variants.length,
      config: variant.config
    })),
    targetAudience: {
      includeRules: [],
      excludeRules: []
    },
    conversionGoals: [
      {
        id: 'quote_request',
        name: 'Quote Request',
        type: 'form_submit',
        target: '#quote-form',
        isPrimary: true
      },
      {
        id: 'contact_click',
        name: 'Contact Button Click',
        type: 'click',
        target: '.contact-button',
        isPrimary: false
      }
    ],
    trafficAllocation: 50,
    createdBy: 'system'
  })
};