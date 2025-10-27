import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationError } from 'express-validator';
import { logger } from '../utils/logger';

export interface ValidationOptions {
  abortEarly?: boolean;
  stripUnknown?: boolean;
  allowUnknown?: boolean;
}

export const validateRequest = (options: ValidationOptions = {}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().map((error: ValidationError) => ({
        field: error.param,
        message: error.msg,
        value: error.value,
        location: error.location,
      }));

      logger.warn('Request validation failed', {
        requestId: req.requestId,
        method: req.method,
        url: req.url,
        errors: formattedErrors,
        userId: req.user?.id,
      });

      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: formattedErrors,
        },
        timestamp: new Date().toISOString(),
        path: req.url,
        method: req.method,
      });
      
      return;
    }

    next();
  };
};

// Schema validation for complex objects
export const validateExperimentSchema = (experiment: any): string[] => {
  const errors: string[] = [];

  // Basic validation
  if (!experiment.name || typeof experiment.name !== 'string') {
    errors.push('Name is required and must be a string');
  }

  if (!experiment.hypothesis || typeof experiment.hypothesis !== 'string') {
    errors.push('Hypothesis is required and must be a string');
  }

  if (!experiment.type || !['ab_test', 'multivariate', 'split_url', 'feature_flag'].includes(experiment.type)) {
    errors.push('Type must be one of: ab_test, multivariate, split_url, feature_flag');
  }

  // Variations validation
  if (!Array.isArray(experiment.variations) || experiment.variations.length < 2) {
    errors.push('At least 2 variations are required');
  } else {
    experiment.variations.forEach((variation: any, index: number) => {
      if (!variation.name || typeof variation.name !== 'string') {
        errors.push(`Variation ${index + 1}: name is required`);
      }
      if (variation.trafficAllocation === undefined || typeof variation.trafficAllocation !== 'number') {
        errors.push(`Variation ${index + 1}: trafficAllocation is required and must be a number`);
      }
      if (variation.trafficAllocation < 0 || variation.trafficAllocation > 100) {
        errors.push(`Variation ${index + 1}: trafficAllocation must be between 0 and 100`);
      }
    });

    // Check that traffic allocations sum to 100
    const totalAllocation = experiment.variations.reduce(
      (sum: number, v: any) => sum + (v.trafficAllocation || 0), 
      0
    );
    if (Math.abs(totalAllocation - 100) > 0.01) {
      errors.push('Variation traffic allocations must sum to 100%');
    }
  }

  // Goals validation
  if (!Array.isArray(experiment.goals) || experiment.goals.length === 0) {
    errors.push('At least 1 goal is required');
  } else {
    experiment.goals.forEach((goal: any, index: number) => {
      if (!goal.name || typeof goal.name !== 'string') {
        errors.push(`Goal ${index + 1}: name is required`);
      }
      if (!goal.type || !['conversion', 'revenue', 'engagement', 'custom'].includes(goal.type)) {
        errors.push(`Goal ${index + 1}: type must be one of: conversion, revenue, engagement, custom`);
      }
      if (!goal.metric || typeof goal.metric !== 'string') {
        errors.push(`Goal ${index + 1}: metric is required`);
      }
    });
  }

  // Traffic validation
  if (!experiment.traffic || typeof experiment.traffic !== 'object') {
    errors.push('Traffic configuration is required');
  } else {
    if (typeof experiment.traffic.percentage !== 'number' || 
        experiment.traffic.percentage < 0 || 
        experiment.traffic.percentage > 100) {
      errors.push('Traffic percentage must be a number between 0 and 100');
    }
  }

  // Targeting validation
  if (!experiment.targeting || typeof experiment.targeting !== 'object') {
    errors.push('Targeting configuration is required');
  } else {
    if (experiment.targeting.rules && Array.isArray(experiment.targeting.rules)) {
      experiment.targeting.rules.forEach((rule: any, index: number) => {
        if (!rule.conditions || !Array.isArray(rule.conditions)) {
          errors.push(`Targeting rule ${index + 1}: conditions array is required`);
        } else {
          rule.conditions.forEach((condition: any, condIndex: number) => {
            if (!condition.attribute || typeof condition.attribute !== 'string') {
              errors.push(`Targeting rule ${index + 1}, condition ${condIndex + 1}: attribute is required`);
            }
            if (!condition.operator || typeof condition.operator !== 'string') {
              errors.push(`Targeting rule ${index + 1}, condition ${condIndex + 1}: operator is required`);
            }
            if (!Array.isArray(condition.values)) {
              errors.push(`Targeting rule ${index + 1}, condition ${condIndex + 1}: values array is required`);
            }
          });
        }
      });
    }
  }

  // Statistical configuration validation
  if (!experiment.statisticalConfig || typeof experiment.statisticalConfig !== 'object') {
    errors.push('Statistical configuration is required');
  } else {
    const config = experiment.statisticalConfig;
    if (typeof config.confidenceLevel !== 'number' || 
        config.confidenceLevel < 0.5 || 
        config.confidenceLevel >= 1) {
      errors.push('Confidence level must be a number between 0.5 and 1');
    }
    if (typeof config.minSampleSize !== 'number' || config.minSampleSize < 1) {
      errors.push('Minimum sample size must be a positive number');
    }
  }

  return errors;
};

export const validateFeatureFlagSchema = (flag: any): string[] => {
  const errors: string[] = [];

  // Basic validation
  if (!flag.name || typeof flag.name !== 'string') {
    errors.push('Name is required and must be a string');
  }

  if (!flag.key || typeof flag.key !== 'string') {
    errors.push('Key is required and must be a string');
  } else if (!/^[a-zA-Z0-9_-]+$/.test(flag.key)) {
    errors.push('Key can only contain letters, numbers, underscores, and hyphens');
  }

  if (!flag.type || !['boolean', 'string', 'number', 'json'].includes(flag.type)) {
    errors.push('Type must be one of: boolean, string, number, json');
  }

  if (flag.defaultValue === undefined) {
    errors.push('Default value is required');
  }

  // Variations validation
  if (!Array.isArray(flag.variations) || flag.variations.length === 0) {
    errors.push('At least 1 variation is required');
  } else {
    let totalPercentage = 0;
    flag.variations.forEach((variation: any, index: number) => {
      if (!variation.name || typeof variation.name !== 'string') {
        errors.push(`Variation ${index + 1}: name is required`);
      }
      if (variation.value === undefined) {
        errors.push(`Variation ${index + 1}: value is required`);
      }
      if (typeof variation.rolloutPercentage !== 'number' || 
          variation.rolloutPercentage < 0 || 
          variation.rolloutPercentage > 100) {
        errors.push(`Variation ${index + 1}: rolloutPercentage must be between 0 and 100`);
      }
      totalPercentage += variation.rolloutPercentage || 0;
    });

    if (Math.abs(totalPercentage - 100) > 0.01) {
      errors.push('Variation rollout percentages must sum to 100%');
    }
  }

  // Targeting validation
  if (!flag.targeting || typeof flag.targeting !== 'object') {
    errors.push('Targeting configuration is required');
  }

  // Rollout validation
  if (!flag.rollout || typeof flag.rollout !== 'object') {
    errors.push('Rollout configuration is required');
  } else {
    if (typeof flag.rollout.percentage !== 'number' || 
        flag.rollout.percentage < 0 || 
        flag.rollout.percentage > 100) {
      errors.push('Rollout percentage must be between 0 and 100');
    }
  }

  // Environment validation
  if (!flag.environments || typeof flag.environments !== 'object') {
    errors.push('Environment configuration is required');
  } else {
    const envs = Object.keys(flag.environments);
    if (envs.length === 0) {
      errors.push('At least one environment configuration is required');
    }
    
    envs.forEach(env => {
      const envConfig = flag.environments[env];
      if (typeof envConfig.enabled !== 'boolean') {
        errors.push(`Environment '${env}': enabled must be a boolean`);
      }
      if (envConfig.defaultValue === undefined) {
        errors.push(`Environment '${env}': defaultValue is required`);
      }
    });
  }

  // Settings validation
  if (!flag.settings || typeof flag.settings !== 'object') {
    errors.push('Settings configuration is required');
  }

  return errors;
};

// Sanitization helpers
export const sanitizeString = (str: string): string => {
  return str.trim().replace(/[<>]/g, '');
};

export const sanitizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

export const sanitizeObject = (obj: any, allowedFields: string[]): any => {
  const sanitized: any = {};
  
  allowedFields.forEach(field => {
    if (obj.hasOwnProperty(field)) {
      sanitized[field] = obj[field];
    }
  });
  
  return sanitized;
};