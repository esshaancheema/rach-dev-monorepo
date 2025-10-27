'use client';

import { AuthProvider } from '@/hooks/useAuth';
import AnalyticsProvider from '@/components/analytics/AnalyticsProvider';
import PerformanceOptimizer from '@/components/performance/PerformanceOptimizer';
import { WebVitalsProvider } from '@/lib/performance/web-vitals';
import ConversionTracking from '@/components/analytics/ConversionTracking';

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <WebVitalsProvider debug={process.env.NODE_ENV === 'development'}>
        <AnalyticsProvider>
          <PerformanceOptimizer enableMonitoring enableOptimizations>
            <ConversionTracking>
              {children}
            </ConversionTracking>
          </PerformanceOptimizer>
        </AnalyticsProvider>
      </WebVitalsProvider>
    </AuthProvider>
  );
}