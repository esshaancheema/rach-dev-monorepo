'use client';

import { Suspense } from 'react';
import { QueryProvider } from '@/components/providers/QueryProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <QueryProvider>
        {children}
      </QueryProvider>
    </Suspense>
  );
}