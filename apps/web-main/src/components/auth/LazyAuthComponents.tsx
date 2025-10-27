'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load authentication components for better performance
export const LazyAuthModal = dynamic(
  () => import('@/components/auth/AuthModal'),
  {
    loading: () => (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 space-y-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    ),
    ssr: false
  }
);

export const LazySocialLoginButtons = dynamic(
  () => import('@/components/auth/OptimizedSocialLoginButtons'),
  {
    loading: () => (
      <div className="space-y-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <div className="relative my-6">
          <Skeleton className="h-px w-full" />
          <div className="absolute inset-0 flex justify-center">
            <Skeleton className="h-4 w-24 bg-white" />
          </div>
        </div>
      </div>
    ),
    ssr: false
  }
);

export const LazyPasswordlessOptions = dynamic(
  () => import('@/components/auth/PasswordlessOptions'),
  {
    loading: () => (
      <div className="space-y-4">
        <div className="flex space-x-1 border-b">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    ),
    ssr: false
  }
);

export const LazySAMLLogin = dynamic(
  () => import('@/components/auth/SAMLLogin'),
  {
    loading: () => (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    ),
    ssr: false
  }
);

// Preload components on user interaction
export const preloadAuthComponents = () => {
  // Preload on first user interaction (hover, focus, etc.)
  const preloadPromises = [
    import('@/components/auth/AuthModal'),
    import('@/components/auth/OptimizedSocialLoginButtons'),
    import('@/components/auth/PasswordlessOptions'),
    import('@/components/auth/SAMLLogin'),
    import('framer-motion'), // Preload animation library
  ];
  
  return Promise.allSettled(preloadPromises);
};

// Intersection Observer for viewport-based preloading
export const useAuthComponentPreloader = (ref: React.RefObject<HTMLElement>) => {
  if (typeof window === 'undefined') return;
  
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          preloadAuthComponents();
          observer.disconnect();
        }
      });
    },
    { threshold: 0.1 }
  );
  
  if (ref.current) {
    observer.observe(ref.current);
  }
  
  return () => observer.disconnect();
};