'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ArrowPathIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function MagicLinkVerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    const verifyMagicLink = async () => {
      try {
        const token = searchParams.get('token');
        const email = searchParams.get('email');
        
        if (!token) {
          setError('Invalid magic link - missing token');
          setStatus('error');
          return;
        }

        // Call API to verify magic link
        const response = await fetch('/api/auth/magic-link/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            token,
            email 
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Magic link verification failed');
        }

        // Successful verification
        setUserInfo(data.data.user);
        setStatus('success');

        // Track successful magic link login
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'login', {
            method: 'magic_link'
          });
        }

        // Auto-redirect to dashboard after a brief delay
        setTimeout(() => {
          const redirectTo = searchParams.get('redirect') || '/dashboard';
          router.push(redirectTo);
        }, 2000);

      } catch (err) {
        console.error('Magic link verification error:', err);
        setError(err instanceof Error ? err.message : 'Magic link verification failed');
        setStatus('error');
      }
    };

    verifyMagicLink();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          {/* Header */}
          <div className="mb-8">
            <div className="w-16 h-16 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <SparklesIcon className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Magic Link Verification
            </h2>
          </div>

          {/* Status Content */}
          <div className="space-y-6">
            {status === 'verifying' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div className="mx-auto w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <ArrowPathIcon className="w-6 h-6 text-primary-600 animate-spin" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Verifying Magic Link
                </h3>
                <p className="text-gray-600">
                  Please wait while we verify your magic link and sign you in...
                </p>
              </motion.div>
            )}

            {status === 'success' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Welcome back!
                </h3>
                <div className="space-y-2">
                  <p className="text-gray-600">
                    Magic link verified successfully. You're now signed in.
                  </p>
                  {userInfo && (
                    <p className="text-sm text-gray-500">
                      Signed in as {userInfo.email}
                    </p>
                  )}
                </div>
                <div className="pt-4">
                  <div className="animate-pulse text-sm text-primary-600">
                    Redirecting to your dashboard...
                  </div>
                </div>
              </motion.div>
            )}

            {status === 'error' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Verification Failed
                </h3>
                <p className="text-gray-600">
                  {error || 'Unable to verify magic link. Please try again.'}
                </p>
                <div className="flex flex-col space-y-3">
                  <Link
                    href="/login"
                    className="
                      w-full inline-flex items-center justify-center px-4 py-2
                      bg-primary-600 text-white font-medium rounded-lg
                      hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                      transition-colors duration-200
                    "
                  >
                    Back to Login
                  </Link>
                  <button
                    onClick={() => {
                      setStatus('verifying');
                      setError(null);
                      window.location.reload();
                    }}
                    className="
                      text-primary-600 hover:text-primary-500 font-medium text-sm
                      transition-colors duration-200
                    "
                  >
                    Try Again
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          {status !== 'error' && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Having trouble?{' '}
                <Link href="/support" className="text-primary-600 hover:underline">
                  Contact support
                </Link>
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}