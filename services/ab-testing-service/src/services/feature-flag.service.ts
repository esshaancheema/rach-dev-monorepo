import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import { CacheService } from './cache.service';
import { DatabaseService } from './database.service';
import { config } from '../config/config';

export interface FeatureFlag {
  id: string;
  name: string;
  description?: string;
  key: string; // Unique identifier for the flag
  status: 'active' | 'inactive' | 'archived';
  type: 'boolean' | 'string' | 'number' | 'json';
  
  // Default values
  defaultValue: any;
  variations: FlagVariation[];
  
  // Targeting and rollout
  targeting: FlagTargeting;
  rollout: RolloutConfig;
  
  // Environment-specific settings
  environments: Record<string, EnvironmentConfig>;
  
  // Metadata
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  
  // Monitoring
  lastEvaluated?: Date;
  evaluationCount: number;
  
  // Approval workflow
  approvalRequired: boolean;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: Date;
}

export interface FlagVariation {
  id: string;
  name: string;
  value: any;
  description?: string;
  rolloutPercentage: number;
}

export interface FlagTargeting {
  enabled: boolean;
  rules: TargetingRule[];
  fallthrough: {
    variationId?: string;
    rollout?: RolloutDistribution;
  };
}

export interface TargetingRule {
  id: string;
  description?: string;
  conditions: TargetingCondition[];
  serve: {
    variationId?: string;
    rollout?: RolloutDistribution;
  };
}

export interface TargetingCondition {
  attribute: string;
  operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'contains' | 'not_contains' | 
           'starts_with' | 'ends_with' | 'greater_than' | 'less_than' | 'greater_equal' | 
           'less_equal' | 'matches_regex' | 'semver_greater' | 'semver_less';
  values: any[];
  negate?: boolean;
}

export interface RolloutDistribution {
  variations: Array<{
    variationId: string;
    weight: number; // 0-100
  }>;
}

export interface RolloutConfig {
  enabled: boolean;
  percentage: number; // 0-100
  strategy: 'uniform' | 'gradual' | 'segment_based';
  
  // Gradual rollout settings
  gradual?: {
    startPercentage: number;
    endPercentage: number;
    incrementPercentage: number;
    incrementInterval: number; // minutes
    autoIncrement: boolean;
  };
  
  // Kill switch
  killSwitch?: {
    enabled: boolean;
    conditions: KillSwitchCondition[];
  };
}

export interface KillSwitchCondition {
  metric: string;
  operator: 'greater_than' | 'less_than' | 'equals';
  threshold: number;
  timeWindow: number; // minutes
}

export interface EnvironmentConfig {
  enabled: boolean;
  defaultValue: any;
  targeting: FlagTargeting;
  rollout: RolloutConfig;
  lastModified: Date;
  modifiedBy: string;
}

export interface FlagEvaluation {
  flagKey: string;
  value: any;
  variationId?: string;
  reason: EvaluationReason;
  version: number;
  timestamp: Date;
}

export interface EvaluationReason {
  kind: 'OFF' | 'FALLTHROUGH' | 'TARGET_MATCH' | 'RULE_MATCH' | 'PREREQUISITE_FAILED' | 'ERROR';
  ruleIndex?: number;
  ruleId?: string;
  inExperiment?: boolean;
}

export interface FlagAnalytics {
  flagKey: string;
  evaluations: number;
  uniqueUsers: number;
  variations: Record<string, {
    count: number;
    percentage: number;
  }>;
  lastUpdated: Date;
}

export interface BulkEvaluationRequest {
  user: UserContext;
  flags: string[];
  environment?: string;
}

export interface BulkEvaluationResponse {
  flags: Record<string, FlagEvaluation>;
  user: UserContext;
  environment: string;
}

export interface UserContext {
  id: string;
  key?: string;
  email?: string;
  name?: string;
  custom: Record<string, any>;
  groups?: string[];
  anonymous?: boolean;
}

export class FeatureFlagService {
  constructor(
    private databaseService: DatabaseService,
    private cacheService: CacheService
  ) {}

  public async createFlag(
    flagData: Omit<FeatureFlag, 'id' | 'createdAt' | 'updatedAt' | 'evaluationCount'>,
    userId: string
  ): Promise<FeatureFlag> {
    // Check if flag with same key already exists
    const existingFlag = await this.getFlagByKey(flagData.key);
    if (existingFlag) {
      throw new Error(`Feature flag with key '${flagData.key}' already exists`);
    }

    // Check flag limits
    const activeFlagsCount = await this.getActiveFlagsCount();
    if (activeFlagsCount >= config.featureFlags.maxFlags) {
      throw new Error(`Maximum number of feature flags (${config.featureFlags.maxFlags}) reached`);
    }

    const flag: FeatureFlag = {
      ...flagData,
      id: uuidv4(),
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      evaluationCount: 0,
    };

    // Validate flag configuration
    await this.validateFlag(flag);

    // Store flag
    await this.databaseService.createFeatureFlag(flag);

    // Cache flag for quick access
    await this.cacheFlag(flag);

    logger.info('Feature flag created successfully', {
      flagId: flag.id,
      key: flag.key,
      type: flag.type,
    });

    return flag;
  }

  public async updateFlag(
    flagId: string,
    updates: Partial<FeatureFlag>,
    userId: string,
    environment?: string
  ): Promise<FeatureFlag> {
    const flag = await this.getFlag(flagId);
    
    if (!flag) {
      throw new Error('Feature flag not found');
    }

    // Check permissions
    if (flag.createdBy !== userId) {
      // Check if user has admin permissions
      const hasPermission = await this.checkFlagPermissions(userId, flag.id, 'update');
      if (!hasPermission) {
        throw new Error('Insufficient permissions to update feature flag');
      }
    }

    // Handle environment-specific updates
    if (environment && updates.environments?.[environment]) {
      const environmentConfig = updates.environments[environment];
      environmentConfig.lastModified = new Date();
      environmentConfig.modifiedBy = userId;
    }

    const updatedFlag: FeatureFlag = {
      ...flag,
      ...updates,
      updatedAt: new Date(),
    };

    // Validate updated flag
    await this.validateFlag(updatedFlag);

    // Check if approval is required
    if (flag.approvalRequired && this.requiresApproval(updates)) {
      updatedFlag.approvalStatus = 'pending';
      await this.requestApproval(updatedFlag, userId, updates);
    }

    // Store updated flag
    await this.databaseService.updateFeatureFlag(flagId, updatedFlag);

    // Update cache
    await this.cacheFlag(updatedFlag);

    // Clear related caches
    await this.clearFlagCaches(flag.key);

    // Track flag change
    await this.trackFlagChange(flag, updatedFlag, userId);

    logger.info('Feature flag updated successfully', {
      flagId,
      updatedFields: Object.keys(updates),
      environment,
    });

    return updatedFlag;
  }

  public async getFlag(flagId: string): Promise<FeatureFlag | null> {
    // Try cache first
    const cacheKey = `flag:${flagId}`;
    const cached = await this.cacheService.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    // Fetch from database
    const flag = await this.databaseService.getFeatureFlag(flagId);
    
    if (flag) {
      await this.cacheFlag(flag);
    }

    return flag;
  }

  public async getFlagByKey(key: string): Promise<FeatureFlag | null> {
    // Try cache first
    const cacheKey = `flag_key:${key}`;
    const cached = await this.cacheService.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    // Fetch from database
    const flag = await this.databaseService.getFeatureFlagByKey(key);
    
    if (flag) {
      await this.cacheFlag(flag);
    }

    return flag;
  }

  public async getUserFlags(
    userId: string,
    options: {
      status?: string;
      environment?: string;
      page?: number;
      limit?: number;
      search?: string;
      tags?: string[];
    } = {}
  ): Promise<{ flags: FeatureFlag[]; total: number }> {
    const { page = 1, limit = 50 } = options;

    const result = await this.databaseService.getUserFeatureFlags(userId, options);

    // Cache frequently accessed flags
    for (const flag of result.flags) {
      await this.cacheFlag(flag);
    }

    return result;
  }

  public async evaluateFlag(
    flagKey: string,
    user: UserContext,
    environment: string = 'production'
  ): Promise<FlagEvaluation> {
    try {
      const flag = await this.getFlagByKey(flagKey);
      
      if (!flag) {
        return {
          flagKey,
          value: null,
          reason: { kind: 'ERROR' },
          version: 0,
          timestamp: new Date(),
        };
      }

      // Check if flag is active
      if (flag.status !== 'active') {
        return {
          flagKey,
          value: flag.defaultValue,
          reason: { kind: 'OFF' },
          version: 1,
          timestamp: new Date(),
        };
      }

      // Get environment-specific configuration
      const envConfig = flag.environments[environment];
      if (!envConfig || !envConfig.enabled) {
        return {
          flagKey,
          value: flag.defaultValue,
          reason: { kind: 'OFF' },
          version: 1,
          timestamp: new Date(),
        };
      }

      // Evaluate targeting rules
      const evaluation = await this.evaluateTargeting(flag, user, environment);

      // Update evaluation metrics
      await this.updateEvaluationMetrics(flag.id, user.id, evaluation);

      // Increment evaluation count
      await this.incrementEvaluationCount(flag.id);

      return evaluation;

    } catch (error) {
      logger.error('Flag evaluation failed', {
        flagKey,
        userId: user.id,
        environment,
        error: error.message,
      });

      return {
        flagKey,
        value: null,
        reason: { kind: 'ERROR' },
        version: 0,
        timestamp: new Date(),
      };
    }
  }

  public async evaluateAllFlags(
    user: UserContext,
    environment: string = 'production'
  ): Promise<Record<string, FlagEvaluation>> {
    try {
      // Get all active flags
      const activeFlags = await this.getActiveFlags(environment);
      
      const evaluations: Record<string, FlagEvaluation> = {};

      // Evaluate each flag
      await Promise.all(
        activeFlags.map(async (flag) => {
          const evaluation = await this.evaluateFlag(flag.key, user, environment);
          evaluations[flag.key] = evaluation;
        })
      );

      return evaluations;

    } catch (error) {
      logger.error('Bulk flag evaluation failed', {
        userId: user.id,
        environment,
        error: error.message,
      });

      return {};
    }
  }

  public async bulkEvaluate(request: BulkEvaluationRequest): Promise<BulkEvaluationResponse> {
    const { user, flags, environment = 'production' } = request;
    
    const evaluations: Record<string, FlagEvaluation> = {};

    await Promise.all(
      flags.map(async (flagKey) => {
        const evaluation = await this.evaluateFlag(flagKey, user, environment);
        evaluations[flagKey] = evaluation;
      })
    );

    return {
      flags: evaluations,
      user,
      environment,
    };
  }

  public async toggleFlag(
    flagId: string,
    userId: string,
    environment?: string
  ): Promise<FeatureFlag> {
    const flag = await this.getFlag(flagId);
    
    if (!flag) {
      throw new Error('Feature flag not found');
    }

    if (environment) {
      // Toggle environment-specific flag
      const envConfig = flag.environments[environment];
      if (envConfig) {
        return this.updateFlag(
          flagId,
          {
            environments: {
              ...flag.environments,
              [environment]: {
                ...envConfig,
                enabled: !envConfig.enabled,
              },
            },
          },
          userId,
          environment
        );
      }
    }

    // Toggle global flag status
    const newStatus = flag.status === 'active' ? 'inactive' : 'active';
    return this.updateFlag(flagId, { status: newStatus }, userId);
  }

  public async deleteFlag(flagId: string, userId: string): Promise<void> {
    const flag = await this.getFlag(flagId);
    
    if (!flag) {
      throw new Error('Feature flag not found');
    }

    // Check permissions
    if (flag.createdBy !== userId) {
      const hasPermission = await this.checkFlagPermissions(userId, flag.id, 'delete');
      if (!hasPermission) {
        throw new Error('Insufficient permissions to delete feature flag');
      }
    }

    // Archive instead of delete for audit trail
    await this.updateFlag(flagId, { status: 'archived' }, userId);

    // Clear caches
    await this.clearFlagCaches(flag.key);

    logger.info('Feature flag deleted successfully', { flagId, userId });
  }

  public async getFlagAnalytics(
    flagKey: string,
    timeRange: { start: Date; end: Date },
    environment?: string
  ): Promise<FlagAnalytics> {
    return await this.databaseService.getFlagAnalytics(flagKey, timeRange, environment);
  }

  public async gradualRollout(
    flagId: string,
    targetPercentage: number,
    incrementPercentage: number,
    intervalMinutes: number,
    userId: string
  ): Promise<void> {
    const flag = await this.getFlag(flagId);
    
    if (!flag) {
      throw new Error('Feature flag not found');
    }

    const gradualConfig = {
      enabled: true,
      percentage: flag.rollout.percentage,
      strategy: 'gradual' as const,
      gradual: {
        startPercentage: flag.rollout.percentage,
        endPercentage: targetPercentage,
        incrementPercentage,
        incrementInterval: intervalMinutes,
        autoIncrement: true,
      },
    };

    await this.updateFlag(flagId, { rollout: gradualConfig }, userId);

    // Schedule rollout increments
    await this.scheduleGradualRollout(flag, gradualConfig.gradual);

    logger.info('Gradual rollout started', {
      flagId,
      startPercentage: flag.rollout.percentage,
      targetPercentage,
      incrementPercentage,
    });
  }

  public async killSwitchActivate(flagId: string, userId: string, reason: string): Promise<void> {
    const flag = await this.getFlag(flagId);
    
    if (!flag) {
      throw new Error('Feature flag not found');
    }

    // Immediately disable the flag in all environments
    const updatedEnvironments: Record<string, EnvironmentConfig> = {};
    
    for (const [env, config] of Object.entries(flag.environments)) {
      updatedEnvironments[env] = {
        ...config,
        enabled: false,
        lastModified: new Date(),
        modifiedBy: userId,
      };
    }

    await this.updateFlag(
      flagId,
      {
        status: 'inactive',
        environments: updatedEnvironments,
      },
      userId
    );

    // Log kill switch activation
    logger.warn('Kill switch activated', {
      flagId,
      flagKey: flag.key,
      reason,
      userId,
    });

    // Send notifications
    await this.sendKillSwitchNotification(flag, reason, userId);
  }

  private async evaluateTargeting(
    flag: FeatureFlag,
    user: UserContext,
    environment: string
  ): Promise<FlagEvaluation> {
    const envConfig = flag.environments[environment] || flag.environments['production'];
    const targeting = envConfig?.targeting || flag.targeting;

    if (!targeting.enabled) {
      return {
        flagKey: flag.key,
        value: flag.defaultValue,
        reason: { kind: 'OFF' },
        version: 1,
        timestamp: new Date(),
      };
    }

    // Check targeting rules in order
    for (let i = 0; i < targeting.rules.length; i++) {
      const rule = targeting.rules[i];
      
      if (await this.evaluateRule(rule, user)) {
        const value = await this.getServedValue(flag, rule.serve, user);
        
        return {
          flagKey: flag.key,
          value,
          variationId: rule.serve.variationId,
          reason: {
            kind: 'RULE_MATCH',
            ruleIndex: i,
            ruleId: rule.id,
          },
          version: 1,
          timestamp: new Date(),
        };
      }
    }

    // Fallthrough case
    if (targeting.fallthrough) {
      const value = await this.getServedValue(flag, targeting.fallthrough, user);
      
      return {
        flagKey: flag.key,
        value,
        variationId: targeting.fallthrough.variationId,
        reason: { kind: 'FALLTHROUGH' },
        version: 1,
        timestamp: new Date(),
      };
    }

    // Default value
    return {
      flagKey: flag.key,
      value: flag.defaultValue,
      reason: { kind: 'OFF' },
      version: 1,
      timestamp: new Date(),
    };
  }

  private async evaluateRule(rule: TargetingRule, user: UserContext): Promise<boolean> {
    // All conditions must be true for rule to match
    for (const condition of rule.conditions) {
      if (!this.evaluateCondition(condition, user)) {
        return false;
      }
    }
    
    return true;
  }

  private evaluateCondition(condition: TargetingCondition, user: UserContext): boolean {
    const userValue = this.getUserAttribute(condition.attribute, user);
    const conditionValues = condition.values;
    
    if (userValue === undefined || userValue === null) {
      return false;
    }

    let result: boolean;

    switch (condition.operator) {
      case 'equals':
        result = conditionValues.includes(userValue);
        break;
      case 'not_equals':
        result = !conditionValues.includes(userValue);
        break;
      case 'in':
        result = conditionValues.includes(userValue);
        break;
      case 'not_in':
        result = !conditionValues.includes(userValue);
        break;
      case 'contains':
        result = conditionValues.some(val => String(userValue).includes(String(val)));
        break;
      case 'not_contains':
        result = !conditionValues.some(val => String(userValue).includes(String(val)));
        break;
      case 'starts_with':
        result = conditionValues.some(val => String(userValue).startsWith(String(val)));
        break;
      case 'ends_with':
        result = conditionValues.some(val => String(userValue).endsWith(String(val)));
        break;
      case 'greater_than':
        result = conditionValues.some(val => Number(userValue) > Number(val));
        break;
      case 'less_than':
        result = conditionValues.some(val => Number(userValue) < Number(val));
        break;
      case 'greater_equal':
        result = conditionValues.some(val => Number(userValue) >= Number(val));
        break;
      case 'less_equal':
        result = conditionValues.some(val => Number(userValue) <= Number(val));
        break;
      case 'matches_regex':
        result = conditionValues.some(val => new RegExp(String(val)).test(String(userValue)));
        break;
      case 'semver_greater':
      case 'semver_less':
        result = this.evaluateSemverCondition(condition.operator, userValue, conditionValues[0]);
        break;
      default:
        result = false;
    }

    return condition.negate ? !result : result;
  }

  private getUserAttribute(attribute: string, user: UserContext): any {
    switch (attribute) {
      case 'id':
      case 'key':
        return user.id || user.key;
      case 'email':
        return user.email;
      case 'name':
        return user.name;
      case 'anonymous':
        return user.anonymous;
      case 'groups':
        return user.groups;
      default:
        // Check custom attributes
        return user.custom?.[attribute];
    }
  }

  private evaluateSemverCondition(operator: string, userVersion: any, targetVersion: any): boolean {
    // Simplified semver comparison
    const parseVersion = (version: string) => {
      const parts = version.split('.').map(Number);
      return { major: parts[0] || 0, minor: parts[1] || 0, patch: parts[2] || 0 };
    };

    try {
      const user = parseVersion(String(userVersion));
      const target = parseVersion(String(targetVersion));

      const compare = (a: any, b: any) => {
        if (a.major !== b.major) return a.major - b.major;
        if (a.minor !== b.minor) return a.minor - b.minor;
        return a.patch - b.patch;
      };

      const diff = compare(user, target);

      return operator === 'semver_greater' ? diff > 0 : diff < 0;
    } catch {
      return false;
    }
  }

  private async getServedValue(
    flag: FeatureFlag,
    serve: { variationId?: string; rollout?: RolloutDistribution },
    user: UserContext
  ): Promise<any> {
    if (serve.variationId) {
      const variation = flag.variations.find(v => v.id === serve.variationId);
      return variation?.value || flag.defaultValue;
    }

    if (serve.rollout) {
      // Determine variation based on rollout weights
      const hash = this.hashUser(user.id || user.key || '');
      const bucket = hash % 100;
      
      let cumulative = 0;
      for (const dist of serve.rollout.variations) {
        cumulative += dist.weight;
        if (bucket < cumulative) {
          const variation = flag.variations.find(v => v.id === dist.variationId);
          return variation?.value || flag.defaultValue;
        }
      }
    }

    return flag.defaultValue;
  }

  private hashUser(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private async validateFlag(flag: FeatureFlag): Promise<void> {
    // Basic validation
    if (!flag.name || flag.name.trim() === '') {
      throw new Error('Feature flag name is required');
    }

    if (!flag.key || flag.key.trim() === '') {
      throw new Error('Feature flag key is required');
    }

    // Key format validation
    if (!/^[a-zA-Z0-9_-]+$/.test(flag.key)) {
      throw new Error('Feature flag key can only contain letters, numbers, underscores, and hyphens');
    }

    // Validate variations
    if (!flag.variations || flag.variations.length === 0) {
      throw new Error('Feature flag must have at least one variation');
    }

    const totalWeight = flag.variations.reduce((sum, v) => sum + v.rolloutPercentage, 0);
    if (Math.abs(totalWeight - 100) > 0.01) {
      throw new Error('Variation rollout percentages must sum to 100');
    }

    // Validate targeting rules
    if (flag.targeting.enabled) {
      for (const rule of flag.targeting.rules) {
        if (!rule.conditions || rule.conditions.length === 0) {
          throw new Error('Targeting rule must have at least one condition');
        }
      }
    }

    // Validate environment configurations
    for (const [env, config] of Object.entries(flag.environments)) {
      if (!config.defaultValue && flag.type !== 'boolean') {
        throw new Error(`Environment '${env}' must have a default value`);
      }
    }
  }

  private async cacheFlag(flag: FeatureFlag): Promise<void> {
    const ttl = config.featureFlags.cacheFeatureFlagsTtl;
    await this.cacheService.set(`flag:${flag.id}`, flag, ttl);
    await this.cacheService.set(`flag_key:${flag.key}`, flag, ttl);
  }

  private async clearFlagCaches(flagKey: string): Promise<void> {
    const patterns = [
      `flag_key:${flagKey}`,
      `flag_eval:${flagKey}:*`,
      `flag_analytics:${flagKey}:*`,
    ];

    for (const pattern of patterns) {
      await this.cacheService.deletePattern(pattern);
    }
  }

  private requiresApproval(updates: Partial<FeatureFlag>): boolean {
    // Define fields that require approval
    const sensitiveFields = ['targeting', 'rollout', 'variations', 'defaultValue'];
    return sensitiveFields.some(field => updates.hasOwnProperty(field));
  }

  private async requestApproval(flag: FeatureFlag, userId: string, updates: Partial<FeatureFlag>): Promise<void> {
    // Request approval workflow
    logger.info('Approval requested for feature flag changes', {
      flagId: flag.id,
      userId,
      changes: Object.keys(updates),
    });
  }

  private async checkFlagPermissions(userId: string, flagId: string, action: string): Promise<boolean> {
    // Check user permissions
    return true; // Simplified - would check actual permissions
  }

  private async trackFlagChange(oldFlag: FeatureFlag, newFlag: FeatureFlag, userId: string): Promise<void> {
    // Track flag changes for audit
    logger.info('Feature flag changed', {
      flagId: newFlag.id,
      userId,
      changes: this.getChanges(oldFlag, newFlag),
    });
  }

  private getChanges(oldFlag: FeatureFlag, newFlag: FeatureFlag): Record<string, any> {
    const changes: Record<string, any> = {};
    
    for (const key of Object.keys(newFlag)) {
      if (JSON.stringify(oldFlag[key]) !== JSON.stringify(newFlag[key])) {
        changes[key] = {
          from: oldFlag[key],
          to: newFlag[key],
        };
      }
    }
    
    return changes;
  }

  private async updateEvaluationMetrics(flagId: string, userId: string, evaluation: FlagEvaluation): Promise<void> {
    // Update evaluation metrics
    const cacheKey = `flag_metrics:${flagId}`;
    const metrics = await this.cacheService.get(cacheKey) || { evaluations: 0, uniqueUsers: new Set() };
    
    metrics.evaluations += 1;
    metrics.uniqueUsers.add(userId);
    
    await this.cacheService.set(cacheKey, metrics, 3600);
  }

  private async incrementEvaluationCount(flagId: string): Promise<void> {
    await this.databaseService.incrementFlagEvaluationCount(flagId);
  }

  private async getActiveFlagsCount(): Promise<number> {
    return await this.databaseService.getActiveFlagsCount();
  }

  private async getActiveFlags(environment: string): Promise<FeatureFlag[]> {
    return await this.databaseService.getActiveFlags(environment);
  }

  private async scheduleGradualRollout(flag: FeatureFlag, gradualConfig: any): Promise<void> {
    // Schedule gradual rollout increments
    logger.info('Scheduling gradual rollout', {
      flagId: flag.id,
      gradualConfig,
    });
  }

  private async sendKillSwitchNotification(flag: FeatureFlag, reason: string, userId: string): Promise<void> {
    // Send kill switch notifications
    logger.warn('Kill switch notification sent', {
      flagId: flag.id,
      reason,
      userId,
    });
  }
}