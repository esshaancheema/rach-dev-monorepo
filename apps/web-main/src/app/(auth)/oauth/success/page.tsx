'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  CheckCircleIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';

export default function OAuthSuccessPage() {
  const [isProcessing, setIsProcessing] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshProfile } = useAuth();
  
  const provider = searchParams.get('provider');
  const isNewUser = searchParams.get('new_user') === 'true';

  useEffect(() => {
    const handleOAuthSuccess = async () => {
      try {
        // Check if we have the temporary access token cookie
        const tempToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('temp_access_token='))
          ?.split('=')[1];

        if (tempToken) {
          // Store the token in localStorage for the auth manager
          localStorage.setItem('access_token', tempToken);
          localStorage.setItem('token_expires_at', (Date.now() + 15 * 60 * 1000).toString());

          // Clear the temporary cookie
          document.cookie = 'temp_access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';

          // Refresh the user profile to update the auth state
          await refreshProfile();
        }

        setIsProcessing(false);

        // Redirect to dashboard after showing success message
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      } catch (error) {
        console.error('OAuth success handling error:', error);
        setIsProcessing(false);
        
        // Redirect to login with error
        setTimeout(() => {
          router.push('/login?error=oauth_processing_failed');
        }, 2000);
      }
    };

    handleOAuthSuccess();
  }, [provider, router, refreshProfile]);

  const getProviderName = (provider: string | null) => {
    switch (provider) {
      case 'google':
        return 'Google';
      case 'github':
        return 'GitHub';
      default:
        return 'OAuth Provider';
    }
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full text-center"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Processing Authentication...
            </h2>
            <p className="text-gray-600">
              Please wait while we complete your {getProviderName(provider)} authentication.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full text-center"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="w-8 h-8 text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {isNewUser ? 'Welcome to Zoptal!' : 'Welcome back!'}
          </h2>
          
          <p className="text-gray-600 mb-6">
            {isNewUser 
              ? `Your account has been created successfully using ${getProviderName(provider)}. You're now logged in and ready to explore Zoptal.`
              : `You've been successfully logged in with ${getProviderName(provider)}.`
            }
          </p>
          
          <p className="text-sm text-gray-500 mb-6">
            Redirecting to your dashboard in a few seconds...
          </p>
          
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center justify-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            <span>Continue to Dashboard</span>
            <ArrowRightIcon className="w-4 h-4" />
          </button>
        </div>
        
        {/* Additional info for new users */}
        {isNewUser && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4"
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">i</span>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-blue-900 mb-1">
                  Getting Started
                </h4>
                <p className="text-xs text-blue-700">
                  Your account is ready to use! You can complete your profile, 
                  set up two-factor authentication, and explore all the features Zoptal has to offer.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}