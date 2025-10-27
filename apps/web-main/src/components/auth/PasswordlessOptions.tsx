'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  EnvelopeIcon, 
  DevicePhoneMobileIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Validation schemas
const magicLinkSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type MagicLinkData = z.infer<typeof magicLinkSchema>;

interface PasswordlessOptionsProps {
  onSuccess?: () => void;
  className?: string;
}

export default function PasswordlessOptions({ onSuccess, className = '' }: PasswordlessOptionsProps) {
  const [activeTab, setActiveTab] = useState<'magic-link' | 'device'>('magic-link');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deviceCode, setDeviceCode] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<MagicLinkData>({
    resolver: zodResolver(magicLinkSchema)
  });

  const handleMagicLinkSubmit = async (data: MagicLinkData) => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          redirectTo: window.location.origin + '/dashboard'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send magic link');
      }

      setIsSuccess(true);
      reset();

      // Track successful magic link request
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'magic_link_requested', {
          method: 'email'
        });
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send magic link');
      console.error('Magic link error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeviceAuth = async () => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await fetch('/api/auth/device', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to initialize device authorization');
      }

      const data = await response.json();
      setDeviceCode(data.user_code);

      // Track device authorization request
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'device_auth_requested', {
          method: 'device'
        });
      }

      // Redirect to device verification page
      window.location.href = `/device?code=${data.user_code}&device_code=${data.device_code}`;

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize device authorization');
      console.error('Device auth error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    {
      id: 'magic-link',
      label: 'Magic Link',
      icon: EnvelopeIcon,
      description: 'Sign in with email link'
    },
    {
      id: 'device',
      label: 'Device Code',
      icon: DevicePhoneMobileIcon,
      description: 'Sign in from another device'
    }
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <SparklesIcon className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">Passwordless Login</h3>
        </div>
        <p className="text-sm text-gray-600">
          Choose your preferred passwordless authentication method
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'magic-link' | 'device')}
            className={`
              flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md
              text-sm font-medium transition-all duration-200
              ${activeTab === tab.id
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'magic-link' && (
          <motion.div
            key="magic-link"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {!isSuccess ? (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Enter your email address and we'll send you a secure login link
                  </p>
                </div>

                <form onSubmit={handleSubmit(handleMagicLinkSubmit)} className="space-y-4">
                  {/* Email Field */}
                  <div>
                    <label htmlFor="magic-email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        {...register('email')}
                        type="email"
                        id="magic-email"
                        autoComplete="email"
                        className={`
                          block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm
                          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                          ${errors.email ? 'border-red-300 text-red-900' : 'border-gray-300'}
                        `}
                        placeholder="Enter your email"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || isLoading}
                    className="
                      w-full flex items-center justify-center space-x-2 
                      bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-4 rounded-lg font-medium
                      hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transition-all duration-200
                    "
                  >
                    {isSubmitting || isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Sending Magic Link...</span>
                      </>
                    ) : (
                      <>
                        <EnvelopeIcon className="w-4 h-4" />
                        <span>Send Magic Link</span>
                        <ArrowRightIcon className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Magic Link Sent!
                </h4>
                <p className="text-gray-600 mb-4">
                  Check your email for a secure login link. The link will expire in 10 minutes.
                </p>
                <button
                  onClick={() => {
                    setIsSuccess(false);
                    reset();
                  }}
                  className="text-primary-600 hover:text-primary-500 text-sm font-medium"
                >
                  Send another link
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {activeTab === 'device' && (
          <motion.div
            key="device"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Sign in using a code on your mobile device or another browser
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 text-center">
              <DevicePhoneMobileIcon className="w-12 h-12 text-primary-600 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Device Authorization
              </h4>
              <p className="text-sm text-gray-600 mb-6">
                This will generate a unique code that you can use to sign in from any device
              </p>

              <button
                onClick={handleDeviceAuth}
                disabled={isLoading}
                className="
                  w-full flex items-center justify-center space-x-2 
                  bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium
                  hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-200
                "
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Generating Code...</span>
                  </>
                ) : (
                  <>
                    <DevicePhoneMobileIcon className="w-4 h-4" />
                    <span>Generate Device Code</span>
                    <ArrowRightIcon className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3"
        >
          <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700 text-sm">{error}</p>
        </motion.div>
      )}
    </div>
  );
}