'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import UnifiedAIBuilderDashboard from '@/components/ai-builder/UnifiedAIBuilderDashboard';

// Loading component
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600">Loading AI Builder...</p>
      </div>
    </div>
  );
}

// Main component wrapped in Suspense boundary
function AIBuilderContent() {
  const searchParams = useSearchParams();
  const [initialPrompt, setInitialPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const prompt = searchParams.get('prompt');
    if (prompt) {
      setInitialPrompt(decodeURIComponent(prompt));
    }
    setIsLoading(false);
  }, [searchParams]);

  if (isLoading) {
    return <LoadingFallback />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen"
    >
      <UnifiedAIBuilderDashboard 
        initialPrompt={initialPrompt}
        userId="demo-user" // This would come from auth context
      />
    </motion.div>
  );
}

// Main page export with Suspense wrapper
export default function AIBuilderPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AIBuilderContent />
    </Suspense>
  );
}