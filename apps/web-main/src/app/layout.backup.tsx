import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/hooks/useAuth';
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics';
import ConversionTracking from '@/components/analytics/ConversionTracking';
import HeatmapTracking from '@/components/analytics/HeatmapTracking';
import AnalyticsProvider from '@/components/analytics/AnalyticsProvider';
import PerformanceOptimizer from '@/components/performance/PerformanceOptimizer';
import { WebVitalsProvider } from '@/lib/performance/web-vitals';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Zoptal - AI-Accelerated Development Platform',
  description: 'Transform your development workflow with AI-powered tools and intelligent automation.',
  keywords: ['AI development', 'code generation', 'developer tools', 'automation'],
  authors: [{ name: 'Zoptal Team' }],
  openGraph: {
    title: 'Zoptal - AI-Accelerated Development Platform',
    description: 'Transform your development workflow with AI-powered tools and intelligent automation.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zoptal - AI-Accelerated Development Platform',
    description: 'Transform your development workflow with AI-powered tools and intelligent automation.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <GoogleAnalytics />
        <HeatmapTracking />
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
      </body>
    </html>
  );
}