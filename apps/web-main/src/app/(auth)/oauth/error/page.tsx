'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

export default function OAuthErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const error = searchParams.get('error');
  const message = searchParams.get('message');
  const provider = searchParams.get('provider');

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

  const getErrorTitle = (error: string | null) => {
    switch (error) {
      case 'access_denied':
        return 'Access Denied';
      case 'invalid_request':
        return 'Invalid Request';
      case 'server_error':
        return 'Server Error';
      case 'temporarily_unavailable':
        return 'Service Temporarily Unavailable';
      case 'oauth_failed':
        return 'Authentication Failed';
      case 'internal_error':
        return 'Internal Error';
      default:
        return 'Authentication Error';
    }
  };

  const getErrorDescription = (error: string | null, provider: string | null) => {
    const providerName = getProviderName(provider);
    
    switch (error) {
      case 'access_denied':
        return `You denied permission for Zoptal to access your ${providerName} account. To continue, please try again and grant the necessary permissions.`;
      case 'invalid_request':
        return `There was an issue with the authentication request. This might be due to a configuration problem. Please try again or contact support.`;
      case 'server_error':
        return `${providerName} encountered an error while processing your authentication request. Please try again in a few moments.`;
      case 'temporarily_unavailable':
        return `${providerName} authentication is temporarily unavailable. Please try again later or use an alternative sign-in method.`;
      case 'oauth_failed':
        return `Authentication with ${providerName} failed. This could be due to a network issue or server problem. Please try again.`;
      case 'internal_error':
        return `An unexpected error occurred during authentication. Our team has been notified. Please try again or contact support if the problem persists.`;
      default:
        return message || `An error occurred during ${providerName} authentication. Please try again or use an alternative sign-in method.`;
    }
  };

  const getSuggestions = (error: string | null) => {
    switch (error) {
      case 'access_denied':
        return [
          'Try the authentication process again',
          'Make sure to grant all necessary permissions',
          'Use your email and password to sign in instead',
        ];
      case 'server_error':
      case 'temporarily_unavailable':
        return [
          'Wait a few minutes and try again',
          'Check your internet connection',
          'Use your email and password to sign in instead',
        ];
      default:
        return [
          'Try the authentication process again',
          'Clear your browser cache and cookies',
          'Use your email and password to sign in instead',
          'Contact support if the problem persists',
        ];
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          {/* Error Icon */}
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
          </div>

          {/* Error Title */}
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">
            {getErrorTitle(error)}
          </h2>

          {/* Error Description */}
          <p className="text-gray-600 text-center mb-6">
            {getErrorDescription(error, provider)}
          </p>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={() => router.push('/login')}
              className="w-full flex items-center justify-center space-x-2 bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200"
            >
              <span>Try Different Method</span>
              <ArrowRightIcon className="w-4 h-4" />
            </button>

            {provider && (
              <button
                onClick={() => window.location.href = `/api/oauth/${provider}`}
                className="w-full bg-white text-primary-600 py-3 px-4 rounded-lg font-medium border-2 border-primary-600 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200"
              >
                Try {getProviderName(provider)} Again
              </button>
            )}

            <Link
              href="/"
              className="w-full inline-flex items-center justify-center space-x-2 text-gray-600 hover:text-gray-500 font-medium py-2"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
          </div>
        </motion.div>

        {/* Suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4"
        >
          <h4 className="text-sm font-medium text-blue-900 mb-3">
            What you can try:
          </h4>
          <ul className="text-xs text-blue-700 space-y-1">
            {getSuggestions(error).map((suggestion, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Support Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <p className="text-xs text-gray-500">
            Still having trouble?{' '}
            <Link href="/contact" className="text-primary-600 hover:underline">
              Contact our support team
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}