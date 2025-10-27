import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics';
import HeatmapTracking from '@/components/analytics/HeatmapTracking';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Providers from '@/components/providers/Providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Zoptal - AI-Accelerated Development Platform',
  description: 'Transform your development workflow with AI-powered tools and intelligent automation.',
  keywords: ['AI development', 'code generation', 'developer tools', 'automation'],
  authors: [{ name: 'Zoptal Team' }],
  icons: {
    icon: '/favicon.ico',
    apple: '/images/icons/icon-192x192.png',
  },
  openGraph: {
    title: 'Zoptal - AI-Accelerated Development Platform',
    description: 'Transform your development workflow with AI-powered tools and intelligent automation.',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Zoptal - AI-Accelerated Development Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zoptal - AI-Accelerated Development Platform',
    description: 'Transform your development workflow with AI-powered tools and intelligent automation.',
    images: ['/images/og-image.png'],
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
        <Providers>
          <Header />
          <main>
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}