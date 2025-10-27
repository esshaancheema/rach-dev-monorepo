import { EventEmitter } from 'events';
import { Redis } from 'redis';
import { v4 as uuidv4 } from 'uuid';
import { isAfter, isBefore, parseISO } from 'date-fns';
import { logger } from '../utils/logger';
import { StorageProvider } from '../storage/storage-providers';
import { TargetingEngine, UserAttributes } from '../targeting/targeting-engine';

// Types and Interfaces
export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description?: string;
  type: FlagType;
  status: FlagStatus;
  variants: FlagVariant[];
  defaultVariant: string;
  rules: FlagRule[];
  rolloutPercentage: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  environment: string;
  metadata?: Record<string, any>;
}

export interface FlagVariant {
  id: string;
  key: string;
  name: string;
  value: any;
  weight: number;
  description?: string;
}

export interface FlagRule {
  id: string;
  name: string;
  condition: RuleCondition;
  variant: string;
  enabled: boolean;
  priority: number;
}

export interface RuleCondition {
  operator: 'AND' | 'OR';
  conditions: ConditionClause[];
}

export interface ConditionClause {
  attribute: string;
  operator: ConditionOperator;
  value: any;
  values?: any[];
}

export enum FlagType {
  BOOLEAN = 'boolean',
  STRING = 'string',
  NUMBER = 'number',
  JSON = 'json',
  MULTIVARIATE = 'multivariate',
}

export enum FlagStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
}

export enum ConditionOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  IN = 'in',
  NOT_IN = 'not_in',
  GREATER_THAN = 'greater_than',
  GREATER_THAN_OR_EQUAL = 'greater_than_or_equal',
  LESS_THAN = 'less_than',
  LESS_THAN_OR_EQUAL = 'less_than_or_equal',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  STARTS_WITH = 'starts_with',
  ENDS_WITH = 'ends_with',
  REGEX = 'regex',
  IS_TRUE = 'is_true',
  IS_FALSE = 'is_false',
  IS_NULL = 'is_null',
  IS_NOT_NULL = 'is_not_null',
}

export interface EvaluationContext {
  userId?: string;
  sessionId?: string;
  userAttributes: UserAttributes;
  timestamp: Date;
  environment: string;
  clientId?: string;
  requestId?: string;
}

export interface EvaluationResult {
  flagKey: string;
  variant: string;
  value: any;
  reason: EvaluationReason;
  ruleId?: string;
  metadata?: Record<string, any>;
  evaluationId: string;
  timestamp: Date;
}

export enum EvaluationReason {
  RULE_MATCH = 'rule_match',
  ROLLOUT = 'rollout',
  DEFAULT = 'default',
  FLAG_DISABLED = 'flag_disabled',
  FLAG_NOT_FOUND = 'flag_not_found',
  ERROR = 'error',
}

export interface FeatureFlagConfig {
  storage: StorageProvider;
  targeting?: TargetingEngine;
  environment: string;
  clientId?: string;
  cacheEnabled?: boolean;
  cacheTTL?: number;
  evaluationLogging?: boolean;
  analytics?: {
    enabled: boolean;
    provider?: string;
    config?: Record<string, any>;
  };
}

export class FeatureFlagManager extends EventEmitter {
  private flags: Map<string, FeatureFlag> = new Map();
  private storage: StorageProvider;
  private targeting: TargetingEngine;
  private environment: string;
  private clientId: string;
  private cacheEnabled: boolean;
  private cacheTTL: number;
  private evaluationLogging: boolean;
  private lastSyncTime: Date = new Date(0);

  constructor(config: FeatureFlagConfig) {
    super();
    
    this.storage = config.storage;
    this.targeting = config.targeting || new TargetingEngine();
    this.environment = config.environment;
    this.clientId = config.clientId || 'default';
    this.cacheEnabled = config.cacheEnabled ?? true;
    this.cacheTTL = config.cacheTTL ?? 300000; // 5 minutes
    this.evaluationLogging = config.evaluationLogging ?? true;

    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      await this.loadFlags();
      this.setupPeriodicSync();
      
      logger.info('FeatureFlagManager initialized', {
        environment: this.environment,
        clientId: this.clientId,
        flagCount: this.flags.size,
      });

      this.emit('initialized', {
        flagCount: this.flags.size,
        environment: this.environment,
      });
    } catch (error) {
      logger.error('Failed to initialize FeatureFlagManager', { error });
      this.emit('error', error);
    }
  }

  private async loadFlags(): Promise<void> {
    try {
      const flags = await this.storage.getAllFlags(this.environment);
      
      this.flags.clear();
      flags.forEach(flag => {
        this.flags.set(flag.key, flag);
      });

      this.lastSyncTime = new Date();
      
      logger.info('Feature flags loaded', {
        count: flags.length,
        environment: this.environment,
      });
    } catch (error) {
      logger.error('Failed to load feature flags', { error });
      throw error;
    }
  }

  private setupPeriodicSync(): void {
    // Sync flags every 30 seconds
    setInterval(async () => {
      try {
        await this.syncFlags();
      } catch (error) {
        logger.error('Failed to sync feature flags', { error });
        this.emit('syncError', error);
      }
    }, 30000);
  }

  private async syncFlags(): Promise<void> {
    const lastModified = await this.storage.getLastModifiedTime(this.environment);
    
    if (lastModified > this.lastSyncTime) {
      await this.loadFlags();
      this.emit('flagsUpdated', {
        flagCount: this.flags.size,
        lastModified,
      });
    }
  }

  // Evaluate a feature flag
  public async evaluateFlag(
    flagKey: string,
    context: EvaluationContext
  ): Promise<EvaluationResult> {
    const evaluationId = uuidv4();
    const timestamp = new Date();

    try {
      const flag = this.flags.get(flagKey);
      
      if (!flag) {
        const result = this.createEvaluationResult(
          flagKey,
          'default',
          false,
          EvaluationReason.FLAG_NOT_FOUND,
          evaluationId,
          timestamp
        );
        
        await this.logEvaluation(context, result);
        return result;
      }

      if (flag.status !== FlagStatus.ACTIVE) {
        const result = this.createEvaluationResult(
          flagKey,
          flag.defaultVariant,
          this.getVariantValue(flag, flag.defaultVariant),
          EvaluationReason.FLAG_DISABLED,
          evaluationId,
          timestamp
        );
        
        await this.logEvaluation(context, result);
        return result;
      }

      // Evaluate rules in priority order
      const sortedRules = flag.rules
        .filter(rule => rule.enabled)
        .sort((a, b) => a.priority - b.priority);

      for (const rule of sortedRules) {
        if (await this.evaluateRule(rule, context)) {
          const result = this.createEvaluationResult(
            flagKey,
            rule.variant,
            this.getVariantValue(flag, rule.variant),
            EvaluationReason.RULE_MATCH,
            evaluationId,
            timestamp,
            rule.id
          );
          
          await this.logEvaluation(context, result);
          return result;
        }
      }

      // Check rollout percentage
      if (this.shouldIncludeInRollout(context, flag.rolloutPercentage)) {
        const variant = this.selectVariantByWeight(flag);
        const result = this.createEvaluationResult(
          flagKey,
          variant.key,
          variant.value,
          EvaluationReason.ROLLOUT,
          evaluationId,
          timestamp
        );
        
        await this.logEvaluation(context, result);
        return result;
      }

      // Return default variant
      const result = this.createEvaluationResult(
        flagKey,
        flag.defaultVariant,
        this.getVariantValue(flag, flag.defaultVariant),
        EvaluationReason.DEFAULT,
        evaluationId,
        timestamp
      );
      
      await this.logEvaluation(context, result);
      return result;

    } catch (error) {
      logger.error('Flag evaluation error', { flagKey, error });
      
      const result = this.createEvaluationResult(
        flagKey,
        'default',
        false,
        EvaluationReason.ERROR,
        evaluationId,
        timestamp
      );
      
      await this.logEvaluation(context, result);
      return result;
    }
  }

  private async evaluateRule(
    rule: FlagRule,
    context: EvaluationContext
  ): Promise<boolean> {
    return this.targeting.evaluateCondition(rule.condition, context.userAttributes);
  }

  private shouldIncludeInRollout(
    context: EvaluationContext,
    rolloutPercentage: number
  ): boolean {
    if (rolloutPercentage === 0) return false;
    if (rolloutPercentage === 100) return true;

    // Use consistent hashing based on user ID or session ID
    const hashKey = context.userId || context.sessionId || 'anonymous';
    const hash = this.hashString(hashKey);
    const bucket = (hash % 100) + 1;
    
    return bucket <= rolloutPercentage;
  }

  private selectVariantByWeight(flag: FeatureFlag): FlagVariant {
    const totalWeight = flag.variants.reduce((sum, variant) => sum + variant.weight, 0);
    
    if (totalWeight === 0) {
      return flag.variants.find(v => v.key === flag.defaultVariant) || flag.variants[0];
    }

    const random = Math.random() * totalWeight;
    let currentWeight = 0;

    for (const variant of flag.variants) {
      currentWeight += variant.weight;
      if (random <= currentWeight) {
        return variant;
      }
    }

    return flag.variants[flag.variants.length - 1];
  }

  private getVariantValue(flag: FeatureFlag, variantKey: string): any {
    const variant = flag.variants.find(v => v.key === variantKey);
    return variant ? variant.value : false;
  }

  private createEvaluationResult(
    flagKey: string,
    variant: string,
    value: any,
    reason: EvaluationReason,
    evaluationId: string,
    timestamp: Date,
    ruleId?: string
  ): EvaluationResult {
    return {
      flagKey,
      variant,
      value,
      reason,
      ruleId,
      evaluationId,
      timestamp,
    };
  }

  private async logEvaluation(
    context: EvaluationContext,
    result: EvaluationResult
  ): Promise<void> {
    if (!this.evaluationLogging) return;

    try {
      await this.storage.logEvaluation({
        ...result,
        userId: context.userId,
        sessionId: context.sessionId,
        environment: context.environment,
        clientId: context.clientId,
        userAttributes: context.userAttributes,
      });

      this.emit('evaluation', {
        context,
        result,
      });
    } catch (error) {
      logger.error('Failed to log evaluation', { error });
    }
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

  // Flag management methods
  public async createFlag(flag: Omit<FeatureFlag, 'id' | 'createdAt' | 'updatedAt'>): Promise<FeatureFlag> {
    const newFlag: FeatureFlag = {
      ...flag,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.storage.saveFlag(newFlag);
    this.flags.set(newFlag.key, newFlag);

    logger.info('Feature flag created', { flagKey: newFlag.key });
    this.emit('flagCreated', newFlag);

    return newFlag;
  }

  public async updateFlag(
    flagKey: string,
    updates: Partial<FeatureFlag>
  ): Promise<FeatureFlag | null> {
    const flag = this.flags.get(flagKey);
    if (!flag) return null;

    const updatedFlag: FeatureFlag = {
      ...flag,
      ...updates,
      updatedAt: new Date(),
    };

    await this.storage.saveFlag(updatedFlag);
    this.flags.set(flagKey, updatedFlag);

    logger.info('Feature flag updated', { flagKey });
    this.emit('flagUpdated', updatedFlag);

    return updatedFlag;
  }

  public async deleteFlag(flagKey: string): Promise<boolean> {
    const flag = this.flags.get(flagKey);
    if (!flag) return false;

    await this.storage.deleteFlag(flagKey, this.environment);
    this.flags.delete(flagKey);

    logger.info('Feature flag deleted', { flagKey });
    this.emit('flagDeleted', { flagKey });

    return true;
  }

  public getFlag(flagKey: string): FeatureFlag | null {
    return this.flags.get(flagKey) || null;
  }

  public getAllFlags(): FeatureFlag[] {
    return Array.from(this.flags.values());
  }

  public getFlagsByTag(tag: string): FeatureFlag[] {
    return Array.from(this.flags.values()).filter(flag => 
      flag.tags.includes(tag)
    );
  }

  // Convenience methods for common flag types
  public async getBooleanFlag(
    flagKey: string,
    context: EvaluationContext,
    defaultValue: boolean = false
  ): Promise<boolean> {
    try {
      const result = await this.evaluateFlag(flagKey, context);
      return typeof result.value === 'boolean' ? result.value : defaultValue;
    } catch (error) {
      logger.error('Error evaluating boolean flag', { flagKey, error });
      return defaultValue;
    }
  }

  public async getStringFlag(
    flagKey: string,
    context: EvaluationContext,
    defaultValue: string = ''
  ): Promise<string> {
    try {
      const result = await this.evaluateFlag(flagKey, context);
      return typeof result.value === 'string' ? result.value : defaultValue;
    } catch (error) {
      logger.error('Error evaluating string flag', { flagKey, error });
      return defaultValue;
    }
  }

  public async getNumberFlag(
    flagKey: string,
    context: EvaluationContext,
    defaultValue: number = 0
  ): Promise<number> {
    try {
      const result = await this.evaluateFlag(flagKey, context);
      return typeof result.value === 'number' ? result.value : defaultValue;
    } catch (error) {
      logger.error('Error evaluating number flag', { flagKey, error });
      return defaultValue;
    }
  }

  public async getJSONFlag<T = any>(
    flagKey: string,
    context: EvaluationContext,
    defaultValue: T
  ): Promise<T> {
    try {
      const result = await this.evaluateFlag(flagKey, context);
      return result.value !== undefined ? result.value : defaultValue;
    } catch (error) {
      logger.error('Error evaluating JSON flag', { flagKey, error });
      return defaultValue;
    }
  }

  // Bulk evaluation for performance
  public async evaluateFlags(
    flagKeys: string[],
    context: EvaluationContext
  ): Promise<Map<string, EvaluationResult>> {
    const results = new Map<string, EvaluationResult>();
    
    await Promise.all(
      flagKeys.map(async (flagKey) => {
        try {
          const result = await this.evaluateFlag(flagKey, context);
          results.set(flagKey, result);
        } catch (error) {
          logger.error('Error in bulk flag evaluation', { flagKey, error });
        }
      })
    );

    return results;
  }

  // Health check
  public async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    flagCount: number;
    lastSyncTime: Date;
    storageConnected: boolean;
  }> {
    try {
      const storageConnected = await this.storage.healthCheck();
      
      return {
        status: storageConnected ? 'healthy' : 'unhealthy',
        flagCount: this.flags.size,
        lastSyncTime: this.lastSyncTime,
        storageConnected,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        flagCount: this.flags.size,
        lastSyncTime: this.lastSyncTime,
        storageConnected: false,
      };
    }
  }

  // Cleanup
  public async destroy(): Promise<void> {
    try {
      await this.storage.disconnect();
      this.flags.clear();
      this.removeAllListeners();
      
      logger.info('FeatureFlagManager destroyed');
    } catch (error) {
      logger.error('Error destroying FeatureFlagManager', { error });
    }
  }
}