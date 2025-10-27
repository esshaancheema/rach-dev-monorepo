'use client';

import { createContext, useContext, ReactNode } from 'react';

interface CTAAnalyticsConfig {
  enableGoogleAnalytics: boolean;
  enableCustomTracking: boolean;
  customTrackingEndpoint?: string;
  debugMode: boolean;
}

interface CTAAnalyticsContextType {
  config: CTAAnalyticsConfig;
  updateConfig: (newConfig: Partial<CTAAnalyticsConfig>) => void;
}

const CTAAnalyticsContext = createContext<CTAAnalyticsContextType | null>(null);

interface CTAAnalyticsProviderProps {
  children: ReactNode;
  config?: Partial<CTAAnalyticsConfig>;
}

const defaultConfig: CTAAnalyticsConfig = {
  enableGoogleAnalytics: true,
  enableCustomTracking: false,
  debugMode: process.env.NODE_ENV === 'development',
};

export function CTAAnalyticsProvider({ children, config: initialConfig }: CTAAnalyticsProviderProps) {
  const config = { ...defaultConfig, ...initialConfig };

  const updateConfig = (newConfig: Partial<CTAAnalyticsConfig>) => {
    Object.assign(config, newConfig);
  };

  return (
    <CTAAnalyticsContext.Provider value={{ config, updateConfig }}>
      {children}
    </CTAAnalyticsContext.Provider>
  );
}

export function useCTAAnalyticsConfig() {
  const context = useContext(CTAAnalyticsContext);
  if (!context) {
    return { config: defaultConfig, updateConfig: () => {} };
  }
  return context;
}