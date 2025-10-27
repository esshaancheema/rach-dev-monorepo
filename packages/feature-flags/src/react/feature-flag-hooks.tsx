import React, { createContext, useContext, useEffect, useState, useMemo, ReactNode } from 'react';
import { FeatureFlagManager, EvaluationContext, EvaluationResult } from '../core/feature-flag-manager';
import { ABTestManager, ABTest } from '../ab-testing/ab-test-manager';
import { UserAttributes } from '../targeting/targeting-engine';
import { logger } from '../utils/logger';

// Context Types
interface FeatureFlagContextValue {
  flagManager: FeatureFlagManager | null;
  testManager: ABTestManager | null;
  evaluationContext: EvaluationContext | null;
  isInitialized: boolean;
  error: Error | null;
}

interface FeatureFlagProviderProps {
  children: ReactNode;
  flagManager: FeatureFlagManager;
  testManager?: ABTestManager;
  userId?: string;
  userAttributes?: UserAttributes;
  sessionId?: string;
  environment?: string;
  clientId?: string;
}

// Context
const FeatureFlagContext = createContext<FeatureFlagContextValue>({
  flagManager: null,
  testManager: null,
  evaluationContext: null,
  isInitialized: false,
  error: null,
});

// Provider Component
export const FeatureFlagProvider: React.FC<FeatureFlagProviderProps> = ({
  children,
  flagManager,
  testManager,
  userId,
  userAttributes = {},
  sessionId,
  environment = 'production',
  clientId,
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const evaluationContext = useMemo((): EvaluationContext => ({
    userId,
    sessionId,
    userAttributes,
    timestamp: new Date(),
    environment,
    clientId,
  }), [userId, userAttributes, sessionId, environment, clientId]);

  useEffect(() => {
    const initializeManagers = async () => {
      try {
        // Wait for flag manager to be initialized
        if (flagManager) {
          const healthCheck = await flagManager.healthCheck();
          if (healthCheck.status === 'healthy') {
            setIsInitialized(true);
            setError(null);
          } else {
            throw new Error('Feature flag manager is not healthy');
          }
        }

        // Initialize test manager if provided
        if (testManager) {
          const testHealthCheck = await testManager.healthCheck();
          if (testHealthCheck.status !== 'healthy') {
            logger.warn('A/B test manager is not healthy', { healthCheck: testHealthCheck });
          }
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to initialize feature flags');
        setError(error);
        logger.error('Feature flag provider initialization failed', { error });
      }
    };

    initializeManagers();
  }, [flagManager, testManager]);

  const contextValue: FeatureFlagContextValue = {
    flagManager,
    testManager: testManager || null,
    evaluationContext,
    isInitialized,
    error,
  };

  return (
    <FeatureFlagContext.Provider value={contextValue}>
      {children}
    </FeatureFlagContext.Provider>
  );
};

// Hook for accessing feature flags
export const useFeatureFlag = (flagKey: string) => {
  const { flagManager, evaluationContext, isInitialized, error } = useContext(FeatureFlagContext);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [flagError, setFlagError] = useState<Error | null>(null);

  useEffect(() => {
    if (!isInitialized || !flagManager || !evaluationContext || error) {
      setLoading(false);
      return;
    }

    const evaluateFlag = async () => {
      try {
        setLoading(true);
        setFlagError(null);
        
        const evaluation = await flagManager.evaluateFlag(flagKey, evaluationContext);
        setResult(evaluation);
      } catch (err) {
        const flagError = err instanceof Error ? err : new Error('Flag evaluation failed');
        setFlagError(flagError);
        logger.error('Feature flag evaluation failed', { flagKey, error: err });
      } finally {
        setLoading(false);
      }
    };

    evaluateFlag();
  }, [flagKey, flagManager, evaluationContext, isInitialized, error]);

  return {
    isEnabled: result?.value === true,
    value: result?.value,
    variant: result?.variant,
    reason: result?.reason,
    loading,
    error: error || flagError,
  };
};

// Hook for boolean flags
export const useBooleanFlag = (flagKey: string, defaultValue: boolean = false) => {
  const { flagManager, evaluationContext, isInitialized, error } = useContext(FeatureFlagContext);
  const [value, setValue] = useState<boolean>(defaultValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isInitialized || !flagManager || !evaluationContext || error) {
      setValue(defaultValue);
      setLoading(false);
      return;
    }

    const evaluateFlag = async () => {
      try {
        setLoading(true);
        const result = await flagManager.getBooleanFlag(flagKey, evaluationContext, defaultValue);
        setValue(result);
      } catch (err) {
        setValue(defaultValue);
        logger.error('Boolean flag evaluation failed', { flagKey, error: err });
      } finally {
        setLoading(false);
      }
    };

    evaluateFlag();
  }, [flagKey, flagManager, evaluationContext, defaultValue, isInitialized, error]);

  return { value, loading };
};

// Hook for string flags
export const useStringFlag = (flagKey: string, defaultValue: string = '') => {
  const { flagManager, evaluationContext, isInitialized, error } = useContext(FeatureFlagContext);
  const [value, setValue] = useState<string>(defaultValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isInitialized || !flagManager || !evaluationContext || error) {
      setValue(defaultValue);
      setLoading(false);
      return;
    }

    const evaluateFlag = async () => {
      try {
        setLoading(true);
        const result = await flagManager.getStringFlag(flagKey, evaluationContext, defaultValue);
        setValue(result);
      } catch (err) {
        setValue(defaultValue);
        logger.error('String flag evaluation failed', { flagKey, error: err });
      } finally {
        setLoading(false);
      }
    };

    evaluateFlag();
  }, [flagKey, flagManager, evaluationContext, defaultValue, isInitialized, error]);

  return { value, loading };
};

// Hook for number flags
export const useNumberFlag = (flagKey: string, defaultValue: number = 0) => {
  const { flagManager, evaluationContext, isInitialized, error } = useContext(FeatureFlagContext);
  const [value, setValue] = useState<number>(defaultValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isInitialized || !flagManager || !evaluationContext || error) {
      setValue(defaultValue);
      setLoading(false);
      return;
    }

    const evaluateFlag = async () => {
      try {
        setLoading(true);
        const result = await flagManager.getNumberFlag(flagKey, evaluationContext, defaultValue);
        setValue(result);
      } catch (err) {
        setValue(defaultValue);
        logger.error('Number flag evaluation failed', { flagKey, error: err });
      } finally {
        setLoading(false);
      }
    };

    evaluateFlag();
  }, [flagKey, flagManager, evaluationContext, defaultValue, isInitialized, error]);

  return { value, loading };
};

// Hook for JSON flags
export const useJSONFlag = <T = any>(flagKey: string, defaultValue: T) => {
  const { flagManager, evaluationContext, isInitialized, error } = useContext(FeatureFlagContext);
  const [value, setValue] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isInitialized || !flagManager || !evaluationContext || error) {
      setValue(defaultValue);
      setLoading(false);
      return;
    }

    const evaluateFlag = async () => {
      try {
        setLoading(true);
        const result = await flagManager.getJSONFlag<T>(flagKey, evaluationContext, defaultValue);
        setValue(result);
      } catch (err) {
        setValue(defaultValue);
        logger.error('JSON flag evaluation failed', { flagKey, error: err });
      } finally {
        setLoading(false);
      }
    };

    evaluateFlag();
  }, [flagKey, flagManager, evaluationContext, defaultValue, isInitialized, error]);

  return { value, loading };
};

// Hook for A/B testing
export const useABTest = (testKey: string) => {
  const { testManager, evaluationContext, isInitialized, error } = useContext(FeatureFlagContext);
  const [variant, setVariant] = useState<string | null>(null);
  const [config, setConfig] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [testError, setTestError] = useState<Error | null>(null);

  useEffect(() => {
    if (!isInitialized || !testManager || !evaluationContext || error) {
      setLoading(false);
      return;
    }

    const assignVariant = async () => {
      try {
        setLoading(true);
        setTestError(null);
        
        if (!evaluationContext.userId) {
          setVariant(null);
          setConfig(null);
          return;
        }

        const assignment = await testManager.assignVariant(
          testKey,
          evaluationContext.userId,
          evaluationContext.userAttributes,
          evaluationContext.sessionId
        );

        if (assignment) {
          setVariant(assignment.variant);
          setConfig(assignment.config);
        } else {
          setVariant(null);
          setConfig(null);
        }
      } catch (err) {
        const testError = err instanceof Error ? err : new Error('A/B test assignment failed');
        setTestError(testError);
        logger.error('A/B test assignment failed', { testKey, error: err });
      } finally {
        setLoading(false);
      }
    };

    assignVariant();
  }, [testKey, testManager, evaluationContext, isInitialized, error]);

  const trackConversion = async (eventName: string, value?: number, properties?: Record<string, any>) => {
    if (!testManager || !evaluationContext.userId || !variant) {
      return;
    }

    try {
      const test = testManager.getTest(testKey);
      if (!test) return;

      await testManager.trackConversion({
        testId: test.id,
        userId: evaluationContext.userId,
        sessionId: evaluationContext.sessionId,
        variant,
        eventName,
        value,
        properties,
        timestamp: new Date(),
      });
    } catch (err) {
      logger.error('Conversion tracking failed', { testKey, eventName, error: err });
    }
  };

  return {
    variant,
    config,
    loading,
    error: error || testError,
    trackConversion,
    isInTest: variant !== null,
  };
};

// Hook for multiple flags
export const useMultipleFlags = (flagKeys: string[]) => {
  const { flagManager, evaluationContext, isInitialized, error } = useContext(FeatureFlagContext);
  const [results, setResults] = useState<Map<string, EvaluationResult>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isInitialized || !flagManager || !evaluationContext || error) {
      setLoading(false);
      return;
    }

    const evaluateFlags = async () => {
      try {
        setLoading(true);
        const evaluations = await flagManager.evaluateFlags(flagKeys, evaluationContext);
        setResults(evaluations);
      } catch (err) {
        logger.error('Multiple flags evaluation failed', { flagKeys, error: err });
      } finally {
        setLoading(false);
      }
    };

    evaluateFlags();
  }, [flagKeys, flagManager, evaluationContext, isInitialized, error]);

  return {
    results: Object.fromEntries(results),
    loading,
    getValue: (flagKey: string) => results.get(flagKey)?.value,
    getVariant: (flagKey: string) => results.get(flagKey)?.variant,
  };
};

// Hook for feature flag analytics
export const useFeatureFlagAnalytics = () => {
  const { flagManager, testManager } = useContext(FeatureFlagContext);

  const trackFlagExposure = async (flagKey: string, variant: string, properties?: Record<string, any>) => {
    // Implementation would depend on analytics provider
    logger.info('Flag exposure tracked', { flagKey, variant, properties });
  };

  const trackTestExposure = async (testKey: string, variant: string, properties?: Record<string, any>) => {
    // Implementation would depend on analytics provider
    logger.info('Test exposure tracked', { testKey, variant, properties });
  };

  return {
    trackFlagExposure,
    trackTestExposure,
  };
};

// Component wrapper for feature flags
interface FeatureFlagWrapperProps {
  flagKey: string;
  children: ReactNode;
  fallback?: ReactNode;
  variant?: string;
}

export const FeatureFlagWrapper: React.FC<FeatureFlagWrapperProps> = ({
  flagKey,
  children,
  fallback = null,
  variant,
}) => {
  const { isEnabled, variant: actualVariant, loading } = useFeatureFlag(flagKey);

  if (loading) {
    return null; // or loading spinner
  }

  if (!isEnabled) {
    return <>{fallback}</>;
  }

  if (variant && actualVariant !== variant) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Component wrapper for A/B tests
interface ABTestWrapperProps {
  testKey: string;
  variant: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export const ABTestWrapper: React.FC<ABTestWrapperProps> = ({
  testKey,
  variant: targetVariant,
  children,
  fallback = null,
}) => {
  const { variant, loading } = useABTest(testKey);

  if (loading) {
    return null; // or loading spinner
  }

  if (variant !== targetVariant) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Higher-order component for feature flags
export const WithFeatureFlag = (flagKey: string, fallbackComponent?: React.ComponentType) => {
  return <P extends {}>(Component: React.ComponentType<P>) => {
    const WrappedComponent: React.FC<P> = (props) => {
      const { isEnabled, loading } = useFeatureFlag(flagKey);

      if (loading) {
        return null; // or loading spinner
      }

      if (!isEnabled) {
        return fallbackComponent ? React.createElement(fallbackComponent, props) : null;
      }

      return <Component {...props} />;
    };

    WrappedComponent.displayName = `WithFeatureFlag(${Component.displayName || Component.name})`;
    return WrappedComponent;
  };
};

// Higher-order component for A/B tests
export const WithABTest = (testKey: string, targetVariant: string, fallbackComponent?: React.ComponentType) => {
  return <P extends {}>(Component: React.ComponentType<P>) => {
    const WrappedComponent: React.FC<P> = (props) => {
      const { variant, config, loading } = useABTest(testKey);

      if (loading) {
        return null; // or loading spinner
      }

      if (variant !== targetVariant) {
        return fallbackComponent ? React.createElement(fallbackComponent, props) : null;
      }

      const enhancedProps = {
        ...props,
        abTestConfig: config,
        abVariant: variant,
      } as P & { abTestConfig?: Record<string, any>; abVariant?: string };

      return <Component {...enhancedProps} />;
    };

    WrappedComponent.displayName = `WithABTest(${Component.displayName || Component.name})`;
    return WrappedComponent;
  };
};

// Hook for feature flag debugging (development only)
export const useFeatureFlagDebug = () => {
  const { flagManager, testManager, evaluationContext, isInitialized } = useContext(FeatureFlagContext);

  const getAllFlags = () => {
    if (!flagManager) return [];
    return flagManager.getAllFlags();
  };

  const getAllTests = () => {
    if (!testManager) return [];
    return testManager.getAllTests();
  };

  const getEvaluationContext = () => {
    return evaluationContext;
  };

  const forceEvaluateFlag = async (flagKey: string, overrideContext?: Partial<EvaluationContext>) => {
    if (!flagManager || !evaluationContext) return null;
    
    const context = overrideContext 
      ? { ...evaluationContext, ...overrideContext }
      : evaluationContext;
    
    return await flagManager.evaluateFlag(flagKey, context);
  };

  return {
    getAllFlags,
    getAllTests,
    getEvaluationContext,
    forceEvaluateFlag,
    isInitialized,
    debugInfo: {
      flagCount: flagManager?.getAllFlags().length || 0,
      testCount: testManager?.getAllTests().length || 0,
      userId: evaluationContext?.userId,
      environment: evaluationContext?.environment,
    },
  };
};