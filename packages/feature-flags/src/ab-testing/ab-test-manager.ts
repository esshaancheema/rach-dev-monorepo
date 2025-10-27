import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { addDays, isAfter, isBefore, differenceInDays } from 'date-fns';
import { logger } from '../utils/logger';
import { StorageProvider } from '../storage/storage-providers';
import { UserAttributes } from '../targeting/targeting-engine';

// Types and Interfaces
export interface ABTest {
  id: string;
  key: string;
  name: string;
  description?: string;
  status: TestStatus;
  type: TestType;
  variants: ABTestVariant[];
  allocation: AllocationConfig;
  targeting?: TargetingConfig;
  metrics: TestMetrics;
  schedule: TestSchedule;
  settings: TestSettings;
  results?: ABTestResult;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  environment: string;
  metadata?: Record<string, any>;
}

export interface ABTestVariant {
  id: string;
  key: string;
  name: string;
  description?: string;
  weight: number;
  config: Record<string, any>;
  isControl?: boolean;
}

export interface AllocationConfig {
  method: AllocationMethod;
  trafficAllocation: number; // Percentage of users to include in test
  stickyBucketing: boolean;
  seed?: string;
}

export interface TargetingConfig {
  includeRules?: TargetingRule[];
  excludeRules?: TargetingRule[];
  segments?: string[];
}

export interface TargetingRule {
  attribute: string;
  operator: string;
  value: any;
}

export interface TestMetrics {
  primary: PrimaryMetric;
  secondary: SecondaryMetric[];
  guardrail: GuardrailMetric[];
}

export interface PrimaryMetric {
  name: string;
  type: MetricType;
  goal: 'increase' | 'decrease';
  significanceLevel: number;
  minimumDetectableEffect: number;
}

export interface SecondaryMetric {
  name: string;
  type: MetricType;
  goal?: 'increase' | 'decrease';
}

export interface GuardrailMetric {
  name: string;
  type: MetricType;
  threshold: number;
  direction: 'above' | 'below';
}

export interface TestSchedule {
  startDate: Date;
  endDate?: Date;
  duration?: number; // Days
  timeZone: string;
}

export interface TestSettings {
  sampleSize?: number;
  confidenceLevel: number;
  statisticalPower: number;
  multipleTestingCorrection: boolean;
  sequentialTesting: boolean;
}

export interface ABTestResult {
  status: ResultStatus;
  winningVariant?: string;
  confidence: number;
  significance: number;
  sampleSizes: Record<string, number>;
  conversions: Record<string, number>;
  conversionRates: Record<string, number>;
  statistics: StatisticalResults;
  recommendations: string[];
  updatedAt: Date;
}

export interface StatisticalResults {
  pValue: number;
  confidenceInterval: [number, number];
  effectSize: number;
  standardError: number;
  zScore: number;
}

export enum TestStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  STOPPED = 'stopped',
  ARCHIVED = 'archived',
}

export enum TestType {
  AB = 'ab',
  MULTIVARIATE = 'multivariate',
  SPLIT_URL = 'split_url',
  FEATURE_FLAG = 'feature_flag',
}

export enum AllocationMethod {
  RANDOM = 'random',
  HASH = 'hash',
  STICKY = 'sticky',
}

export enum MetricType {
  CONVERSION = 'conversion',
  REVENUE = 'revenue',
  ENGAGEMENT = 'engagement',
  RETENTION = 'retention',
  CUSTOM = 'custom',
}

export enum ResultStatus {
  RUNNING = 'running',
  SIGNIFICANT = 'significant',
  NOT_SIGNIFICANT = 'not_significant',
  INCONCLUSIVE = 'inconclusive',
}

export interface ConversionEvent {
  testId: string;
  userId: string;
  sessionId?: string;
  variant: string;
  eventName: string;
  value?: number;
  properties?: Record<string, any>;
  timestamp: Date;
}

export interface TestParticipation {
  testId: string;
  userId: string;
  sessionId?: string;
  variant: string;
  enrolledAt: Date;
  userAttributes: UserAttributes;
  clientId?: string;
}

export interface StatisticalSignificance {
  significant: boolean;
  pValue: number;
  confidence: number;
  confidenceInterval: [number, number];
  effectSize: number;
  sampleSize: number;
}

export class ABTestManager extends EventEmitter {
  private tests: Map<string, ABTest> = new Map();
  private storage: StorageProvider;
  private environment: string;
  private clientId: string;
  private participations: Map<string, Map<string, string>> = new Map(); // testKey -> userId -> variant

  constructor(
    storage: StorageProvider,
    environment: string,
    clientId: string = 'default'
  ) {
    super();
    
    this.storage = storage;
    this.environment = environment;
    this.clientId = clientId;

    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      await this.loadTests();
      this.setupPeriodicUpdates();
      
      logger.info('ABTestManager initialized', {
        environment: this.environment,
        clientId: this.clientId,
        testsCount: this.tests.size,
      });

      this.emit('initialized', {
        testsCount: this.tests.size,
        environment: this.environment,
      });
    } catch (error) {
      logger.error('Failed to initialize ABTestManager', { error });
      this.emit('error', error);
    }
  }

  private async loadTests(): Promise<void> {
    try {
      const tests = await this.storage.getAllTests(this.environment);
      
      this.tests.clear();
      tests.forEach(test => {
        this.tests.set(test.key, test);
      });

      logger.info('A/B tests loaded', {
        count: tests.length,
        environment: this.environment,
      });
    } catch (error) {
      logger.error('Failed to load A/B tests', { error });
      throw error;
    }
  }

  private setupPeriodicUpdates(): void {
    // Update test results every 5 minutes
    setInterval(async () => {
      try {
        await this.updateRunningTests();
      } catch (error) {
        logger.error('Failed to update running tests', { error });
      }
    }, 300000); // 5 minutes
  }

  private async updateRunningTests(): Promise<void> {
    const runningTests = Array.from(this.tests.values())
      .filter(test => test.status === TestStatus.RUNNING);

    for (const test of runningTests) {
      try {
        const results = await this.calculateTestResults(test);
        await this.updateTestResults(test.key, results);
      } catch (error) {
        logger.error('Failed to update test results', { testKey: test.key, error });
      }
    }
  }

  // Core A/B testing methods
  public async assignVariant(
    testKey: string,
    userId: string,
    userAttributes: UserAttributes,
    sessionId?: string
  ): Promise<{ variant: string; config: Record<string, any> } | null> {
    try {
      const test = this.tests.get(testKey);
      
      if (!test || test.status !== TestStatus.RUNNING) {
        return null;
      }

      // Check if test is in valid time window
      if (!this.isTestActive(test)) {
        return null;
      }

      // Check existing participation
      const existingVariant = this.getExistingParticipation(testKey, userId);
      if (existingVariant) {
        const variant = test.variants.find(v => v.key === existingVariant);
        return variant ? { variant: variant.key, config: variant.config } : null;
      }

      // Check targeting rules
      if (!this.matchesTargeting(test, userAttributes)) {
        return null;
      }

      // Check traffic allocation
      if (!this.shouldIncludeInTest(test, userId)) {
        return null;
      }

      // Assign variant
      const assignedVariant = this.selectVariant(test, userId);
      
      // Record participation
      await this.recordParticipation({
        testId: test.id,
        userId,
        sessionId,
        variant: assignedVariant.key,
        enrolledAt: new Date(),
        userAttributes,
        clientId: this.clientId,
      });

      // Cache participation
      this.cacheParticipation(testKey, userId, assignedVariant.key);

      this.emit('variantAssigned', {
        testKey: test.key,
        userId,
        variant: assignedVariant.key,
        config: assignedVariant.config,
      });

      return {
        variant: assignedVariant.key,
        config: assignedVariant.config,
      };

    } catch (error) {
      logger.error('Error assigning variant', { testKey, userId, error });
      return null;
    }
  }

  private isTestActive(test: ABTest): boolean {
    const now = new Date();
    const isAfterStart = isAfter(now, test.schedule.startDate);
    const isBeforeEnd = !test.schedule.endDate || isBefore(now, test.schedule.endDate);
    
    return isAfterStart && isBeforeEnd;
  }

  private getExistingParticipation(testKey: string, userId: string): string | null {
    const testParticipations = this.participations.get(testKey);
    return testParticipations?.get(userId) || null;
  }

  private matchesTargeting(test: ABTest, userAttributes: UserAttributes): boolean {
    if (!test.targeting) return true;

    // Check include rules
    if (test.targeting.includeRules) {
      const matchesInclude = test.targeting.includeRules.some(rule =>
        this.evaluateTargetingRule(rule, userAttributes)
      );
      if (!matchesInclude) return false;
    }

    // Check exclude rules
    if (test.targeting.excludeRules) {
      const matchesExclude = test.targeting.excludeRules.some(rule =>
        this.evaluateTargetingRule(rule, userAttributes)
      );
      if (matchesExclude) return false;
    }

    return true;
  }

  private evaluateTargetingRule(rule: TargetingRule, userAttributes: UserAttributes): boolean {
    const userValue = userAttributes[rule.attribute];
    
    switch (rule.operator) {
      case 'equals':
        return userValue === rule.value;
      case 'not_equals':
        return userValue !== rule.value;
      case 'in':
        return Array.isArray(rule.value) && rule.value.includes(userValue);
      case 'not_in':
        return Array.isArray(rule.value) && !rule.value.includes(userValue);
      case 'greater_than':
        return typeof userValue === 'number' && userValue > rule.value;
      case 'less_than':
        return typeof userValue === 'number' && userValue < rule.value;
      case 'contains':
        return typeof userValue === 'string' && userValue.includes(rule.value);
      default:
        return false;
    }
  }

  private shouldIncludeInTest(test: ABTest, userId: string): boolean {
    if (test.allocation.trafficAllocation === 100) return true;
    if (test.allocation.trafficAllocation === 0) return false;

    const hash = this.hashUserId(userId, test.allocation.seed || test.key);
    const bucket = (hash % 100) + 1;
    
    return bucket <= test.allocation.trafficAllocation;
  }

  private selectVariant(test: ABTest, userId: string): ABTestVariant {
    const totalWeight = test.variants.reduce((sum, variant) => sum + variant.weight, 0);
    
    if (totalWeight === 0) {
      return test.variants.find(v => v.isControl) || test.variants[0];
    }

    const hash = this.hashUserId(userId, test.key + '_variant');
    const randomValue = (hash % totalWeight);
    let currentWeight = 0;

    for (const variant of test.variants) {
      currentWeight += variant.weight;
      if (randomValue < currentWeight) {
        return variant;
      }
    }

    return test.variants[test.variants.length - 1];
  }

  private hashUserId(userId: string, seed: string): number {
    const str = userId + seed;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private async recordParticipation(participation: TestParticipation): Promise<void> {
    try {
      await this.storage.recordTestParticipation(participation);
      
      logger.info('Test participation recorded', {
        testId: participation.testId,
        userId: participation.userId,
        variant: participation.variant,
      });
    } catch (error) {
      logger.error('Failed to record test participation', { error });
    }
  }

  private cacheParticipation(testKey: string, userId: string, variant: string): void {
    if (!this.participations.has(testKey)) {
      this.participations.set(testKey, new Map());
    }
    
    this.participations.get(testKey)!.set(userId, variant);
  }

  // Conversion tracking
  public async trackConversion(event: ConversionEvent): Promise<void> {
    try {
      const test = Array.from(this.tests.values())
        .find(t => t.id === event.testId);

      if (!test || test.status !== TestStatus.RUNNING) {
        logger.warn('Conversion tracked for inactive test', { testId: event.testId });
        return;
      }

      await this.storage.recordConversionEvent(event);

      this.emit('conversionTracked', {
        testKey: test.key,
        userId: event.userId,
        variant: event.variant,
        eventName: event.eventName,
        value: event.value,
      });

      logger.info('Conversion tracked', {
        testKey: test.key,
        userId: event.userId,
        variant: event.variant,
        eventName: event.eventName,
      });
    } catch (error) {
      logger.error('Failed to track conversion', { error });
    }
  }

  // Test management
  public async createTest(test: Omit<ABTest, 'id' | 'createdAt' | 'updatedAt'>): Promise<ABTest> {
    const newTest: ABTest = {
      ...test,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.storage.saveTest(newTest);
    this.tests.set(newTest.key, newTest);

    logger.info('A/B test created', { testKey: newTest.key });
    this.emit('testCreated', newTest);

    return newTest;
  }

  public async updateTest(
    testKey: string,
    updates: Partial<ABTest>
  ): Promise<ABTest | null> {
    const test = this.tests.get(testKey);
    if (!test) return null;

    const updatedTest: ABTest = {
      ...test,
      ...updates,
      updatedAt: new Date(),
    };

    await this.storage.saveTest(updatedTest);
    this.tests.set(testKey, updatedTest);

    logger.info('A/B test updated', { testKey });
    this.emit('testUpdated', updatedTest);

    return updatedTest;
  }

  public async startTest(testKey: string): Promise<boolean> {
    const test = this.tests.get(testKey);
    if (!test || test.status !== TestStatus.SCHEDULED) {
      return false;
    }

    const updatedTest = await this.updateTest(testKey, {
      status: TestStatus.RUNNING,
      schedule: {
        ...test.schedule,
        startDate: new Date(),
      },
    });

    if (updatedTest) {
      this.emit('testStarted', updatedTest);
      return true;
    }

    return false;
  }

  public async stopTest(testKey: string, reason?: string): Promise<boolean> {
    const test = this.tests.get(testKey);
    if (!test || test.status !== TestStatus.RUNNING) {
      return false;
    }

    const results = await this.calculateTestResults(test);
    const updatedTest = await this.updateTest(testKey, {
      status: TestStatus.STOPPED,
      results,
      metadata: {
        ...test.metadata,
        stopReason: reason,
      },
    });

    if (updatedTest) {
      this.emit('testStopped', { test: updatedTest, reason });
      return true;
    }

    return false;
  }

  // Results calculation
  private async calculateTestResults(test: ABTest): Promise<ABTestResult> {
    try {
      const participationData = await this.storage.getTestParticipations(test.id);
      const conversionData = await this.storage.getConversionEvents(test.id);

      const sampleSizes: Record<string, number> = {};
      const conversions: Record<string, number> = {};
      const conversionRates: Record<string, number> = {};

      // Calculate sample sizes and conversions for each variant
      test.variants.forEach(variant => {
        const participants = participationData.filter(p => p.variant === variant.key);
        const variantConversions = conversionData.filter(c => c.variant === variant.key);

        sampleSizes[variant.key] = participants.length;
        conversions[variant.key] = variantConversions.length;
        conversionRates[variant.key] = participants.length > 0 
          ? variantConversions.length / participants.length 
          : 0;
      });

      // Calculate statistical significance
      const controlVariant = test.variants.find(v => v.isControl);
      const treatmentVariants = test.variants.filter(v => !v.isControl);

      let significance = 0;
      let confidence = 0;
      let winningVariant: string | undefined;
      let statistics: StatisticalResults = {
        pValue: 1,
        confidenceInterval: [0, 0],
        effectSize: 0,
        standardError: 0,
        zScore: 0,
      };

      if (controlVariant && treatmentVariants.length > 0) {
        const controlRate = conversionRates[controlVariant.key];
        
        for (const treatment of treatmentVariants) {
          const treatmentRate = conversionRates[treatment.key];
          const testStats = this.calculateStatisticalSignificance(
            sampleSizes[controlVariant.key],
            conversions[controlVariant.key],
            sampleSizes[treatment.key],
            conversions[treatment.key]
          );

          if (testStats.significant && testStats.confidence > confidence) {
            confidence = testStats.confidence;
            significance = 1 - testStats.pValue;
            winningVariant = treatmentRate > controlRate ? treatment.key : controlVariant.key;
            statistics = {
              pValue: testStats.pValue,
              confidenceInterval: testStats.confidenceInterval,
              effectSize: testStats.effectSize,
              standardError: 0, // Simplified
              zScore: 0, // Simplified
            };
          }
        }
      }

      const status = significance >= test.settings.confidenceLevel / 100
        ? ResultStatus.SIGNIFICANT
        : sampleSizes[Object.keys(sampleSizes)[0]] >= (test.settings.sampleSize || 1000)
        ? ResultStatus.NOT_SIGNIFICANT
        : ResultStatus.RUNNING;

      return {
        status,
        winningVariant,
        confidence,
        significance,
        sampleSizes,
        conversions,
        conversionRates,
        statistics,
        recommendations: this.generateRecommendations(test, {
          status,
          winningVariant,
          confidence,
          significance,
          sampleSizes,
          conversions,
          conversionRates,
        }),
        updatedAt: new Date(),
      };

    } catch (error) {
      logger.error('Failed to calculate test results', { testKey: test.key, error });
      throw error;
    }
  }

  private calculateStatisticalSignificance(
    n1: number,
    x1: number,
    n2: number,
    x2: number
  ): StatisticalSignificance {
    if (n1 === 0 || n2 === 0) {
      return {
        significant: false,
        pValue: 1,
        confidence: 0,
        confidenceInterval: [0, 0],
        effectSize: 0,
        sampleSize: n1 + n2,
      };
    }

    const p1 = x1 / n1;
    const p2 = x2 / n2;
    const pPooled = (x1 + x2) / (n1 + n2);
    
    const standardError = Math.sqrt(pPooled * (1 - pPooled) * (1/n1 + 1/n2));
    const zScore = Math.abs(p1 - p2) / standardError;
    
    // Simplified p-value calculation (for demonstration)
    const pValue = 2 * (1 - this.normalCDF(Math.abs(zScore)));
    
    const significant = pValue < 0.05;
    const confidence = (1 - pValue) * 100;
    
    const margin = 1.96 * standardError; // 95% confidence interval
    const effectSize = p2 - p1;
    
    return {
      significant,
      pValue,
      confidence,
      confidenceInterval: [effectSize - margin, effectSize + margin],
      effectSize,
      sampleSize: n1 + n2,
    };
  }

  private normalCDF(x: number): number {
    // Simplified normal CDF approximation
    return 0.5 * (1 + this.erf(x / Math.sqrt(2)));
  }

  private erf(x: number): number {
    // Simplified error function approximation
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;
    
    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);
    
    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    
    return sign * y;
  }

  private generateRecommendations(
    test: ABTest,
    results: Partial<ABTestResult>
  ): string[] {
    const recommendations: string[] = [];

    if (results.status === ResultStatus.SIGNIFICANT && results.winningVariant) {
      recommendations.push(`Deploy ${results.winningVariant} variant as the winner`);
      recommendations.push(`Expected improvement: ${(results.significance! * 100).toFixed(1)}%`);
    } else if (results.status === ResultStatus.NOT_SIGNIFICANT) {
      recommendations.push('No significant difference found between variants');
      recommendations.push('Consider running the test longer or increasing sample size');
    } else if (results.status === ResultStatus.RUNNING) {
      const totalSample = Object.values(results.sampleSizes!).reduce((a, b) => a + b, 0);
      const targetSample = test.settings.sampleSize || 1000;
      const progress = (totalSample / targetSample * 100).toFixed(1);
      recommendations.push(`Test in progress: ${progress}% of target sample size reached`);
    }

    return recommendations;
  }

  private async updateTestResults(testKey: string, results: ABTestResult): Promise<void> {
    const test = this.tests.get(testKey);
    if (!test) return;

    const updatedTest = await this.updateTest(testKey, { results });
    
    if (updatedTest) {
      this.emit('resultsUpdated', {
        testKey,
        results,
      });
    }
  }

  // Utility methods
  public getTest(testKey: string): ABTest | null {
    return this.tests.get(testKey) || null;
  }

  public getAllTests(): ABTest[] {
    return Array.from(this.tests.values());
  }

  public getRunningTests(): ABTest[] {
    return Array.from(this.tests.values())
      .filter(test => test.status === TestStatus.RUNNING);
  }

  public async getTestResults(testKey: string): Promise<ABTestResult | null> {
    const test = this.tests.get(testKey);
    if (!test) return null;

    if (test.results) {
      return test.results;
    }

    // Calculate fresh results
    return await this.calculateTestResults(test);
  }

  // Health check
  public async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    testsCount: number;
    runningTests: number;
    storageConnected: boolean;
  }> {
    try {
      const storageConnected = await this.storage.healthCheck();
      const runningTests = this.getRunningTests().length;
      
      return {
        status: storageConnected ? 'healthy' : 'unhealthy',
        testsCount: this.tests.size,
        runningTests,
        storageConnected,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        testsCount: this.tests.size,
        runningTests: 0,
        storageConnected: false,
      };
    }
  }

  // Cleanup
  public async destroy(): Promise<void> {
    try {
      this.tests.clear();
      this.participations.clear();
      this.removeAllListeners();
      
      logger.info('ABTestManager destroyed');
    } catch (error) {
      logger.error('Error destroying ABTestManager', { error });
    }
  }
}