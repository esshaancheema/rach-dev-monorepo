import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import { StatisticsService } from './statistics.service';
import { CacheService } from './cache.service';
import { DatabaseService } from './database.service';
import { config } from '../config/config';

export interface Experiment {
  id: string;
  name: string;
  description?: string;
  hypothesis: string;
  status: 'draft' | 'running' | 'paused' | 'completed' | 'archived';
  type: 'ab_test' | 'multivariate' | 'split_url' | 'feature_flag';
  
  // Experiment configuration
  variations: ExperimentVariation[];
  traffic: TrafficAllocation;
  targeting: TargetingRules;
  goals: ExperimentGoal[];
  
  // Statistical configuration
  statisticalConfig: StatisticalConfig;
  
  // Timing
  startDate?: Date;
  endDate?: Date;
  duration?: number; // in days
  
  // Metadata
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  
  // Results
  results?: ExperimentResults;
  
  // Advanced settings
  settings: ExperimentSettings;
}

export interface ExperimentVariation {
  id: string;
  name: string;
  description?: string;
  isControl: boolean;
  allocation: number; // percentage 0-100
  changes: VariationChange[];
  
  // Results
  metrics?: VariationMetrics;
}

export interface VariationChange {
  type: 'element' | 'redirect' | 'code' | 'feature_flag';
  selector?: string; // CSS selector for element changes
  attribute?: string; // HTML attribute to change
  value: any; // New value
  code?: string; // Custom JavaScript code
  redirectUrl?: string; // For redirect tests
}

export interface TrafficAllocation {
  percentage: number; // 0-100, percentage of users to include
  segments?: string[]; // User segments to target
  geoTargeting?: string[]; // Geographic targeting
  deviceTargeting?: string[]; // Device type targeting
}

export interface TargetingRules {
  urlMatch?: {
    type: 'exact' | 'contains' | 'regex' | 'starts_with' | 'ends_with';
    value: string;
  };
  audience?: {
    include?: string[]; // Audience segment IDs to include
    exclude?: string[]; // Audience segment IDs to exclude
  };
  customRules?: CustomTargetingRule[];
}

export interface CustomTargetingRule {
  attribute: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
}

export interface ExperimentGoal {
  id: string;
  name: string;
  type: 'pageview' | 'click' | 'conversion' | 'revenue' | 'engagement' | 'custom';
  isPrimary: boolean;
  
  // Goal configuration
  eventName?: string; // For custom events
  selector?: string; // CSS selector for click goals
  url?: string; // URL for pageview goals
  revenueValue?: number; // Fixed revenue value
  
  // Statistical settings
  conversionWindow: number; // Hours
  attribution: 'first_touch' | 'last_touch' | 'linear';
}

export interface StatisticalConfig {
  significanceLevel: number; // alpha (e.g., 0.05)
  power: number; // beta (e.g., 0.8)
  minimumDetectableEffect: number; // MDE
  sampleSizeCalculation: 'fixed' | 'sequential';
  multipleTestingCorrection: 'none' | 'bonferroni' | 'holm' | 'benjamini_hochberg';
  
  // Advanced settings
  bayesianAnalysis: boolean;
  confidenceIntervals: number[];
  earlyStoppingRules?: EarlyStoppingRule[];
}

export interface EarlyStoppingRule {
  type: 'futility' | 'superiority' | 'non_inferiority';
  threshold: number;
  minSampleSize: number;
  checkFrequency: 'daily' | 'weekly' | 'after_n_conversions';
}

export interface ExperimentSettings {
  enableCookieTargeting: boolean;
  enableCrossDomainTracking: boolean;
  enableGDPRCompliance: boolean;
  enableBotFiltering: boolean;
  enableQualityScoring: boolean;
  enableRealTimeUpdates: boolean;
  
  // Data collection
  dataRetentionDays: number;
  customDimensions?: Record<string, string>;
  
  // Notifications
  emailNotifications: boolean;
  slackNotifications: boolean;
  webhookNotifications: boolean;
}

export interface ExperimentResults {
  status: 'calculating' | 'completed' | 'inconclusive';
  winner?: string; // variation ID
  confidence: number;
  
  // Statistical results
  statisticalSignificance: boolean;
  pValue: number;
  confidenceInterval: [number, number];
  
  // Performance metrics
  totalVisitors: number;
  totalConversions: number;
  overallConversionRate: number;
  
  // Variation results
  variationResults: VariationResults[];
  
  // Additional analysis
  segmentAnalysis?: SegmentAnalysis[];
  timeSeriesAnalysis?: TimeSeriesPoint[];
  
  // Recommendations
  recommendation: 'implement_winner' | 'continue_test' | 'inconclusive' | 'stop_test';
  recommendationReason: string;
  
  // Metadata
  calculatedAt: Date;
  dataFreshness: Date;
}

export interface VariationResults {
  variationId: string;
  variationName: string;
  
  // Core metrics
  visitors: number;
  conversions: number;
  conversionRate: number;
  
  // Statistical analysis
  confidenceInterval: [number, number];
  pValue?: number;
  zScore?: number;
  
  // Revenue metrics (if applicable)
  revenue?: number;
  revenuePerVisitor?: number;
  averageOrderValue?: number;
  
  // Engagement metrics
  bounceRate?: number;
  timeOnPage?: number;
  pagesPerSession?: number;
  
  // Custom goal results
  goalResults: GoalResult[];
}

export interface GoalResult {
  goalId: string;
  goalName: string;
  conversions: number;
  conversionRate: number;
  confidenceInterval: [number, number];
  pValue?: number;
  improvement?: number; // percentage improvement over control
}

export interface VariationMetrics {
  visitors: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
  lastUpdated: Date;
}

export interface SegmentAnalysis {
  segmentName: string;
  segmentSize: number;
  results: VariationResults[];
}

export interface TimeSeriesPoint {
  date: Date;
  variationResults: Array<{
    variationId: string;
    visitors: number;
    conversions: number;
    conversionRate: number;
  }>;
}

export class ExperimentService {
  constructor(
    private databaseService: DatabaseService,
    private cacheService: CacheService,
    private statisticsService: StatisticsService
  ) {}

  public async createExperiment(
    experimentData: Omit<Experiment, 'id' | 'createdAt' | 'updatedAt' | 'results'>,
    userId: string
  ): Promise<Experiment> {
    const experiment: Experiment = {
      ...experimentData,
      id: uuidv4(),
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Validate experiment configuration
    await this.validateExperiment(experiment);

    // Calculate sample size if needed
    if (experiment.statisticalConfig.sampleSizeCalculation === 'fixed') {
      const sampleSize = this.statisticsService.calculateSampleSize(
        experiment.statisticalConfig.minimumDetectableEffect,
        experiment.statisticalConfig.power,
        experiment.statisticalConfig.significanceLevel
      );
      
      logger.info('Calculated sample size for experiment', {
        experimentId: experiment.id,
        sampleSize,
      });
    }

    // Store experiment
    await this.databaseService.createExperiment(experiment);

    // Cache experiment for quick access
    await this.cacheExperiment(experiment);

    logger.info('Experiment created successfully', {
      experimentId: experiment.id,
      name: experiment.name,
      type: experiment.type,
      variations: experiment.variations.length,
    });

    return experiment;
  }

  public async updateExperiment(
    experimentId: string,
    updates: Partial<Experiment>,
    userId: string
  ): Promise<Experiment> {
    const experiment = await this.getExperiment(experimentId);
    
    if (!experiment) {
      throw new Error('Experiment not found');
    }

    // Check permissions and status
    if (experiment.createdBy !== userId) {
      throw new Error('Insufficient permissions to update experiment');
    }

    if (experiment.status === 'running' && updates.variations) {
      throw new Error('Cannot modify variations while experiment is running');
    }

    const updatedExperiment: Experiment = {
      ...experiment,
      ...updates,
      updatedAt: new Date(),
    };

    // Validate updated experiment
    await this.validateExperiment(updatedExperiment);

    // Store updated experiment
    await this.databaseService.updateExperiment(experimentId, updatedExperiment);

    // Update cache
    await this.cacheExperiment(updatedExperiment);

    // Clear related caches
    await this.clearExperimentCaches(experimentId);

    logger.info('Experiment updated successfully', {
      experimentId,
      updatedFields: Object.keys(updates),
    });

    return updatedExperiment;
  }

  public async getExperiment(experimentId: string): Promise<Experiment | null> {
    // Try cache first
    const cacheKey = `experiment:${experimentId}`;
    const cached = await this.cacheService.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    // Fetch from database
    const experiment = await this.databaseService.getExperiment(experimentId);
    
    if (experiment) {
      await this.cacheExperiment(experiment);
    }

    return experiment;
  }

  public async getUserExperiments(
    userId: string,
    options: {
      status?: string;
      type?: string;
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      search?: string;
      tags?: string[];
    } = {}
  ): Promise<{ experiments: Experiment[]; total: number }> {
    const { page = 1, limit = 20 } = options;

    const result = await this.databaseService.getUserExperiments(userId, options);

    // Cache frequently accessed experiments
    for (const experiment of result.experiments) {
      await this.cacheExperiment(experiment);
    }

    return result;
  }

  public async startExperiment(experimentId: string, userId: string): Promise<Experiment> {
    const experiment = await this.getExperiment(experimentId);
    
    if (!experiment) {
      throw new Error('Experiment not found');
    }

    if (experiment.createdBy !== userId) {
      throw new Error('Insufficient permissions to start experiment');
    }

    if (experiment.status !== 'draft') {
      throw new Error(`Cannot start experiment with status: ${experiment.status}`);
    }

    // Pre-flight checks
    await this.performPreflightChecks(experiment);

    // Update experiment status
    const updatedExperiment = await this.updateExperiment(
      experimentId,
      {
        status: 'running',
        startDate: new Date(),
      },
      userId
    );

    // Initialize experiment tracking
    await this.initializeExperimentTracking(updatedExperiment);

    // Set up automated analysis
    await this.scheduleAutomatedAnalysis(updatedExperiment);

    logger.info('Experiment started successfully', {
      experimentId,
      startDate: updatedExperiment.startDate,
    });

    return updatedExperiment;
  }

  public async pauseExperiment(experimentId: string, userId: string): Promise<Experiment> {
    return this.updateExperimentStatus(experimentId, 'paused', userId);
  }

  public async resumeExperiment(experimentId: string, userId: string): Promise<Experiment> {
    return this.updateExperimentStatus(experimentId, 'running', userId);
  }

  public async stopExperiment(experimentId: string, userId: string, reason?: string): Promise<Experiment> {
    const experiment = await this.updateExperimentStatus(experimentId, 'completed', userId);

    // Run final analysis
    await this.runFinalAnalysis(experiment);

    // Generate experiment report
    await this.generateExperimentReport(experiment, reason);

    logger.info('Experiment stopped successfully', {
      experimentId,
      reason,
      endDate: new Date(),
    });

    return experiment;
  }

  public async getExperimentResults(experimentId: string): Promise<ExperimentResults | null> {
    const experiment = await this.getExperiment(experimentId);
    
    if (!experiment) {
      throw new Error('Experiment not found');
    }

    // Check cache first
    const cacheKey = `experiment_results:${experimentId}`;
    const cached = await this.cacheService.get(cacheKey);
    
    if (cached && this.isResultsFresh(cached)) {
      return cached;
    }

    // Calculate fresh results
    const results = await this.calculateExperimentResults(experiment);

    // Cache results
    await this.cacheService.set(cacheKey, results, 300); // 5 minutes cache

    return results;
  }

  public async assignUserToVariation(
    experimentId: string,
    userId: string,
    userAttributes: Record<string, any> = {}
  ): Promise<{ variationId: string; variationName: string } | null> {
    const experiment = await this.getExperiment(experimentId);
    
    if (!experiment || experiment.status !== 'running') {
      return null;
    }

    // Check if user meets targeting criteria
    if (!this.userMeetsTargeting(experiment.targeting, userAttributes)) {
      return null;
    }

    // Check traffic allocation
    if (!this.userInTrafficAllocation(experiment.traffic, userId, userAttributes)) {
      return null;
    }

    // Get or create user assignment
    const assignment = await this.getUserVariationAssignment(experimentId, userId);
    
    if (assignment) {
      return assignment;
    }

    // Assign user to variation using consistent hashing
    const variationId = this.assignToVariation(experiment, userId);
    const variation = experiment.variations.find(v => v.id === variationId);
    
    if (!variation) {
      logger.error('Failed to find assigned variation', { experimentId, variationId, userId });
      return null;
    }

    const newAssignment = {
      variationId,
      variationName: variation.name,
    };

    // Store assignment
    await this.storeUserAssignment(experimentId, userId, newAssignment);

    // Track assignment event
    await this.trackAssignmentEvent(experimentId, userId, newAssignment, userAttributes);

    return newAssignment;
  }

  public async trackConversion(
    experimentId: string,
    userId: string,
    goalId: string,
    conversionData: {
      value?: number;
      properties?: Record<string, any>;
      timestamp?: Date;
    } = {}
  ): Promise<void> {
    const experiment = await this.getExperiment(experimentId);
    
    if (!experiment || experiment.status !== 'running') {
      return;
    }

    const assignment = await this.getUserVariationAssignment(experimentId, userId);
    
    if (!assignment) {
      return; // User not in experiment
    }

    const goal = experiment.goals.find(g => g.id === goalId);
    
    if (!goal) {
      logger.warn('Goal not found for conversion tracking', { experimentId, goalId });
      return;
    }

    // Check conversion window
    const assignmentTime = await this.getUserAssignmentTime(experimentId, userId);
    const conversionTime = conversionData.timestamp || new Date();
    const windowHours = goal.conversionWindow;
    
    if (conversionTime.getTime() - assignmentTime.getTime() > windowHours * 60 * 60 * 1000) {
      logger.debug('Conversion outside window, ignoring', {
        experimentId,
        goalId,
        userId,
        windowHours,
      });
      return;
    }

    // Store conversion
    await this.storeConversion({
      experimentId,
      userId,
      variationId: assignment.variationId,
      goalId,
      value: conversionData.value || 0,
      properties: conversionData.properties || {},
      timestamp: conversionTime,
    });

    // Update cached metrics
    await this.updateCachedMetrics(experimentId, assignment.variationId, goalId);

    logger.debug('Conversion tracked successfully', {
      experimentId,
      goalId,
      userId,
      variationId: assignment.variationId,
      value: conversionData.value,
    });
  }

  private async validateExperiment(experiment: Experiment): Promise<void> {
    // Basic validation
    if (!experiment.name || experiment.name.trim() === '') {
      throw new Error('Experiment name is required');
    }

    if (!experiment.hypothesis || experiment.hypothesis.trim() === '') {
      throw new Error('Experiment hypothesis is required');
    }

    if (!experiment.variations || experiment.variations.length < 2) {
      throw new Error('Experiment must have at least 2 variations');
    }

    if (!experiment.goals || experiment.goals.length === 0) {
      throw new Error('Experiment must have at least 1 goal');
    }

    // Validate variations
    const totalAllocation = experiment.variations.reduce((sum, v) => sum + v.allocation, 0);
    if (Math.abs(totalAllocation - 100) > 0.01) {
      throw new Error('Variation allocations must sum to 100%');
    }

    const controlCount = experiment.variations.filter(v => v.isControl).length;
    if (controlCount !== 1) {
      throw new Error('Experiment must have exactly one control variation');
    }

    // Validate traffic allocation
    if (experiment.traffic.percentage < 0 || experiment.traffic.percentage > 100) {
      throw new Error('Traffic percentage must be between 0 and 100');
    }

    // Validate statistical configuration
    const stats = experiment.statisticalConfig;
    if (stats.significanceLevel <= 0 || stats.significanceLevel >= 1) {
      throw new Error('Significance level must be between 0 and 1');
    }

    if (stats.power <= 0 || stats.power >= 1) {
      throw new Error('Statistical power must be between 0 and 1');
    }

    // Validate goals
    const primaryGoals = experiment.goals.filter(g => g.isPrimary);
    if (primaryGoals.length === 0) {
      throw new Error('Experiment must have at least one primary goal');
    }

    // Check experiment limits
    const activeExperiments = await this.getActiveExperimentCount();
    if (activeExperiments >= config.abTesting.maxExperiments) {
      throw new Error(`Maximum number of experiments (${config.abTesting.maxExperiments}) reached`);
    }
  }

  private async performPreflightChecks(experiment: Experiment): Promise<void> {
    // Check for conflicts with other running experiments
    const conflicts = await this.checkExperimentConflicts(experiment);
    if (conflicts.length > 0) {
      throw new Error('Experiment conflicts with running experiments: ' + conflicts.join(', '));
    }

    // Validate targeting URLs are accessible
    if (experiment.targeting.urlMatch) {
      await this.validateTargetingUrls(experiment.targeting);
    }

    // Check sample size requirements
    const estimatedTraffic = await this.estimateTraffic(experiment);
    const requiredSampleSize = this.statisticsService.calculateSampleSize(
      experiment.statisticalConfig.minimumDetectableEffect,
      experiment.statisticalConfig.power,
      experiment.statisticalConfig.significanceLevel
    );

    if (estimatedTraffic < requiredSampleSize) {
      logger.warn('Estimated traffic may be insufficient for statistical significance', {
        experimentId: experiment.id,
        estimatedTraffic,
        requiredSampleSize,
      });
    }
  }

  private async calculateExperimentResults(experiment: Experiment): Promise<ExperimentResults> {
    logger.info('Calculating experiment results', { experimentId: experiment.id });

    try {
      // Get raw data for all variations
      const rawData = await this.getRawExperimentData(experiment);

      // Calculate basic metrics for each variation
      const variationResults = await Promise.all(
        experiment.variations.map(variation => 
          this.calculateVariationResults(experiment, variation, rawData)
        )
      );

      // Perform statistical analysis
      const statisticalAnalysis = await this.statisticsService.analyzeExperiment(
        experiment,
        variationResults
      );

      // Calculate overall metrics
      const totalVisitors = variationResults.reduce((sum, v) => sum + v.visitors, 0);
      const totalConversions = variationResults.reduce((sum, v) => sum + v.conversions, 0);
      const overallConversionRate = totalVisitors > 0 ? totalConversions / totalVisitors : 0;

      // Determine winner and recommendation
      const { winner, recommendation, recommendationReason } = this.determineWinner(
        experiment,
        variationResults,
        statisticalAnalysis
      );

      const results: ExperimentResults = {
        status: 'completed',
        winner,
        confidence: statisticalAnalysis.confidence,
        statisticalSignificance: statisticalAnalysis.isSignificant,
        pValue: statisticalAnalysis.pValue,
        confidenceInterval: statisticalAnalysis.confidenceInterval,
        totalVisitors,
        totalConversions,
        overallConversionRate,
        variationResults,
        recommendation,
        recommendationReason,
        calculatedAt: new Date(),
        dataFreshness: new Date(),
      };

      // Add segment analysis if segmentation is enabled
      if (config.abTesting.segmentationEnabled) {
        results.segmentAnalysis = await this.calculateSegmentAnalysis(experiment, rawData);
      }

      // Add time series analysis
      results.timeSeriesAnalysis = await this.calculateTimeSeriesAnalysis(experiment, rawData);

      return results;

    } catch (error) {
      logger.error('Failed to calculate experiment results', {
        experimentId: experiment.id,
        error: error.message,
      });

      return {
        status: 'calculating',
        confidence: 0,
        statisticalSignificance: false,
        pValue: 1,
        confidenceInterval: [0, 0],
        totalVisitors: 0,
        totalConversions: 0,
        overallConversionRate: 0,
        variationResults: [],
        recommendation: 'continue_test',
        recommendationReason: 'Error calculating results',
        calculatedAt: new Date(),
        dataFreshness: new Date(),
      };
    }
  }

  private async calculateVariationResults(
    experiment: Experiment,
    variation: ExperimentVariation,
    rawData: any
  ): Promise<VariationResults> {
    const variationData = rawData.variations[variation.id] || {};
    
    const visitors = variationData.visitors || 0;
    const conversions = variationData.conversions || 0;
    const conversionRate = visitors > 0 ? conversions / visitors : 0;

    // Calculate goal-specific results
    const goalResults = await Promise.all(
      experiment.goals.map(async goal => {
        const goalConversions = variationData.goals?.[goal.id]?.conversions || 0;
        const goalConversionRate = visitors > 0 ? goalConversions / visitors : 0;

        return {
          goalId: goal.id,
          goalName: goal.name,
          conversions: goalConversions,
          conversionRate: goalConversionRate,
          confidenceInterval: [0, 0] as [number, number], // Will be calculated by statistics service
        };
      })
    );

    return {
      variationId: variation.id,
      variationName: variation.name,
      visitors,
      conversions,
      conversionRate,
      confidenceInterval: [0, 0], // Will be calculated by statistics service
      revenue: variationData.revenue || 0,
      revenuePerVisitor: visitors > 0 ? (variationData.revenue || 0) / visitors : 0,
      goalResults,
    };
  }

  private determineWinner(
    experiment: Experiment,
    variationResults: VariationResults[],
    statisticalAnalysis: any
  ): {
    winner?: string;
    recommendation: ExperimentResults['recommendation'];
    recommendationReason: string;
  } {
    if (!statisticalAnalysis.isSignificant) {
      return {
        recommendation: 'continue_test',
        recommendationReason: 'No statistically significant difference found yet',
      };
    }

    // Find the best performing variation for primary goal
    const primaryGoal = experiment.goals.find(g => g.isPrimary);
    if (!primaryGoal) {
      return {
        recommendation: 'inconclusive',
        recommendationReason: 'No primary goal defined',
      };
    }

    let bestVariation = variationResults[0];
    let bestRate = 0;

    for (const variation of variationResults) {
      const goalResult = variation.goalResults.find(g => g.goalId === primaryGoal.id);
      if (goalResult && goalResult.conversionRate > bestRate) {
        bestRate = goalResult.conversionRate;
        bestVariation = variation;
      }
    }

    const controlVariation = variationResults.find(v => 
      experiment.variations.find(ev => ev.id === v.variationId)?.isControl
    );

    if (!controlVariation) {
      return {
        recommendation: 'inconclusive',
        recommendationReason: 'Control variation not found',
      };
    }

    const isWinnerControl = bestVariation.variationId === controlVariation.variationId;

    if (isWinnerControl) {
      return {
        winner: bestVariation.variationId,
        recommendation: 'stop_test',
        recommendationReason: 'Control variation is the winner, no changes needed',
      };
    }

    const improvement = ((bestRate - (controlVariation.goalResults.find(g => g.goalId === primaryGoal.id)?.conversionRate || 0)) / (controlVariation.goalResults.find(g => g.goalId === primaryGoal.id)?.conversionRate || 1)) * 100;

    return {
      winner: bestVariation.variationId,
      recommendation: 'implement_winner',
      recommendationReason: `Winning variation shows ${improvement.toFixed(2)}% improvement`,
    };
  }

  private userMeetsTargeting(targeting: TargetingRules, userAttributes: Record<string, any>): boolean {
    // URL matching
    if (targeting.urlMatch && userAttributes.url) {
      const matches = this.matchesUrl(targeting.urlMatch, userAttributes.url);
      if (!matches) return false;
    }

    // Audience targeting
    if (targeting.audience) {
      const userSegments = userAttributes.segments || [];
      
      if (targeting.audience.exclude?.some(segment => userSegments.includes(segment))) {
        return false;
      }
      
      if (targeting.audience.include && !targeting.audience.include.some(segment => userSegments.includes(segment))) {
        return false;
      }
    }

    // Custom rules
    if (targeting.customRules) {
      for (const rule of targeting.customRules) {
        if (!this.evaluateCustomRule(rule, userAttributes)) {
          return false;
        }
      }
    }

    return true;
  }

  private matchesUrl(urlMatch: TargetingRules['urlMatch'], url: string): boolean {
    if (!urlMatch) return true;

    switch (urlMatch.type) {
      case 'exact':
        return url === urlMatch.value;
      case 'contains':
        return url.includes(urlMatch.value);
      case 'starts_with':
        return url.startsWith(urlMatch.value);
      case 'ends_with':
        return url.endsWith(urlMatch.value);
      case 'regex':
        return new RegExp(urlMatch.value).test(url);
      default:
        return true;
    }
  }

  private evaluateCustomRule(rule: CustomTargetingRule, userAttributes: Record<string, any>): boolean {
    const attributeValue = userAttributes[rule.attribute];
    const ruleValue = rule.value;

    switch (rule.operator) {
      case 'equals':
        return attributeValue === ruleValue;
      case 'not_equals':
        return attributeValue !== ruleValue;
      case 'contains':
        return String(attributeValue).includes(String(ruleValue));
      case 'not_contains':
        return !String(attributeValue).includes(String(ruleValue));
      case 'greater_than':
        return Number(attributeValue) > Number(ruleValue);
      case 'less_than':
        return Number(attributeValue) < Number(ruleValue);
      case 'in':
        return Array.isArray(ruleValue) && ruleValue.includes(attributeValue);
      case 'not_in':
        return Array.isArray(ruleValue) && !ruleValue.includes(attributeValue);
      default:
        return false;
    }
  }

  private userInTrafficAllocation(traffic: TrafficAllocation, userId: string, userAttributes: Record<string, any>): boolean {
    // Simple hash-based traffic allocation
    const hash = this.hashUserId(userId);
    const userPercentile = (hash % 10000) / 100; // 0-99.99

    return userPercentile < traffic.percentage;
  }

  private assignToVariation(experiment: Experiment, userId: string): string {
    const hash = this.hashUserId(userId + experiment.id);
    const random = (hash % 10000) / 100; // 0-99.99

    let cumulative = 0;
    for (const variation of experiment.variations) {
      cumulative += variation.allocation;
      if (random < cumulative) {
        return variation.id;
      }
    }

    // Fallback to control
    return experiment.variations.find(v => v.isControl)?.id || experiment.variations[0].id;
  }

  private hashUserId(input: string): number {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private async cacheExperiment(experiment: Experiment): Promise<void> {
    const cacheKey = `experiment:${experiment.id}`;
    await this.cacheService.set(cacheKey, experiment, config.abTesting.cacheExperimentsTtl);
  }

  private async clearExperimentCaches(experimentId: string): Promise<void> {
    const patterns = [
      `experiment:${experimentId}`,
      `experiment_results:${experimentId}`,
      `user_assignment:${experimentId}:*`,
    ];

    for (const pattern of patterns) {
      await this.cacheService.deletePattern(pattern);
    }
  }

  private isResultsFresh(results: ExperimentResults): boolean {
    const maxAge = 5 * 60 * 1000; // 5 minutes
    return Date.now() - results.calculatedAt.getTime() < maxAge;
  }

  // Placeholder implementations for database operations
  private async getRawExperimentData(experiment: Experiment): Promise<any> {
    return await this.databaseService.getExperimentData(experiment.id);
  }

  private async getUserVariationAssignment(experimentId: string, userId: string): Promise<{ variationId: string; variationName: string } | null> {
    return await this.databaseService.getUserAssignment(experimentId, userId);
  }

  private async storeUserAssignment(experimentId: string, userId: string, assignment: { variationId: string; variationName: string }): Promise<void> {
    await this.databaseService.storeUserAssignment(experimentId, userId, assignment);
  }

  private async getUserAssignmentTime(experimentId: string, userId: string): Promise<Date> {
    return await this.databaseService.getUserAssignmentTime(experimentId, userId);
  }

  private async storeConversion(conversionData: any): Promise<void> {
    await this.databaseService.storeConversion(conversionData);
  }

  private async updateCachedMetrics(experimentId: string, variationId: string, goalId: string): Promise<void> {
    // Update cached metrics for real-time display
    const cacheKey = `metrics:${experimentId}:${variationId}:${goalId}`;
    const current = await this.cacheService.get(cacheKey) || { conversions: 0, visitors: 0 };
    current.conversions += 1;
    await this.cacheService.set(cacheKey, current, 3600);
  }

  private async trackAssignmentEvent(experimentId: string, userId: string, assignment: any, userAttributes: Record<string, any>): Promise<void> {
    // Track assignment event for analytics
    logger.debug('User assigned to variation', {
      experimentId,
      userId,
      variationId: assignment.variationId,
      userAttributes,
    });
  }

  private async updateExperimentStatus(experimentId: string, status: Experiment['status'], userId: string): Promise<Experiment> {
    return this.updateExperiment(experimentId, { status }, userId);
  }

  private async initializeExperimentTracking(experiment: Experiment): Promise<void> {
    // Initialize tracking systems
    logger.info('Initializing experiment tracking', { experimentId: experiment.id });
  }

  private async scheduleAutomatedAnalysis(experiment: Experiment): Promise<void> {
    // Schedule automated analysis jobs
    logger.info('Scheduling automated analysis', { experimentId: experiment.id });
  }

  private async runFinalAnalysis(experiment: Experiment): Promise<void> {
    // Run final statistical analysis
    logger.info('Running final analysis', { experimentId: experiment.id });
  }

  private async generateExperimentReport(experiment: Experiment, reason?: string): Promise<void> {
    // Generate and send experiment report
    logger.info('Generating experiment report', { experimentId: experiment.id, reason });
  }

  private async getActiveExperimentCount(): Promise<number> {
    return await this.databaseService.getActiveExperimentCount();
  }

  private async checkExperimentConflicts(experiment: Experiment): Promise<string[]> {
    return await this.databaseService.checkExperimentConflicts(experiment);
  }

  private async validateTargetingUrls(targeting: TargetingRules): Promise<void> {
    // Validate that targeting URLs are accessible
    logger.debug('Validating targeting URLs', { targeting });
  }

  private async estimateTraffic(experiment: Experiment): Promise<number> {
    // Estimate traffic based on historical data and targeting
    return 1000; // Placeholder
  }

  private async calculateSegmentAnalysis(experiment: Experiment, rawData: any): Promise<SegmentAnalysis[]> {
    // Calculate segment-specific analysis
    return []; // Placeholder
  }

  private async calculateTimeSeriesAnalysis(experiment: Experiment, rawData: any): Promise<TimeSeriesPoint[]> {
    // Calculate time series data for trend analysis
    return []; // Placeholder
  }
}