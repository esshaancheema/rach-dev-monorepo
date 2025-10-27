'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PhoneIcon,
  ArrowRightIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';

const verifyPhoneSchema = z.object({
  code: z.string().length(6, 'Verification code must be exactly 6 digits').regex(/^\d+$/, 'Code must contain only numbers'),
});

type VerifyPhoneFormData = z.infer<typeof verifyPhoneSchema>;

export default function VerifyPhonePage() {
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error' | 'input'>('input');
  const [resendCooldown, setResendCooldown] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyPhone, resendPhoneVerification, isLoading, error, clearError } = useAuth();
  
  const email = searchParams.get('email') || '';
  const phone = searchParams.get('phone') || '';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<VerifyPhoneFormData>({
    resolver: zodResolver(verifyPhoneSchema)
  });

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const onSubmit = async (data: VerifyPhoneFormData) => {
    setVerificationStatus('loading');
    clearError();

    try {
      await verifyPhone(data.code);
      setVerificationStatus('success');
      
      // Redirect after success
      setTimeout(() => {
        router.push('/auth/login?message=phone-verified');
      }, 3000);
    } catch (error) {
      setVerificationStatus('error');
    }
  };

  const handleResendVerification = async () => {
    if (!email || resendCooldown > 0) return;

    try {
      await resendPhoneVerification(email);
      setResendCooldown(60); // 60 second cooldown
      setVerificationStatus('input');
    } catch (error) {
      console.error('Failed to resend verification:', error);
    }
  };

  const renderContent = () => {
    switch (verificationStatus) {
      case 'loading':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Verifying your phone...
            </h2>
            <p className="text-gray-600">
              Please wait while we verify your phone number.
            </p>
          </motion.div>
        );

      case 'success':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircleIcon className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Phone verified successfully!
            </h2>
            <p className="text-gray-600 mb-6">
              Your phone number has been verified. You can now access all features of your account.
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              <span>Continue to Login</span>
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </motion.div>
        );

      case 'error':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Verification failed
            </h2>
            <p className="text-gray-600 mb-6">
              {error || 'The verification code is incorrect or has expired. Please try again or request a new code.'}
            </p>
            <div className="space-y-4">
              <button
                onClick={() => setVerificationStatus('input')}
                className="inline-flex items-center justify-center bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                Try Again
              </button>
              {email && (
                <button
                  onClick={handleResendVerification}
                  disabled={isLoading || resendCooldown > 0}
                  className="block w-full text-primary-600 hover:text-primary-500 font-medium disabled:opacity-50"
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Send new code'}
                </button>
              )}
            </div>
          </motion.div>
        );

      default: // 'input'
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <PhoneIcon className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Verify your phone number
            </h2>
            <p className="text-gray-600 mb-6">
              We've sent a 6-digit verification code to your phone number. Please enter the code below.
            </p>
            
            {phone && (
              <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3 mb-6">
                Code sent to: <strong>{phone}</strong>
              </p>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <input
                  {...register('code')}
                  type="text"
                  id="code"
                  autoComplete="one-time-code"
                  maxLength={6}
                  className={`
                    block w-full px-4 py-3 text-center text-2xl tracking-widest border rounded-lg shadow-sm
                    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                    ${errors.code ? 'border-red-300 text-red-900' : 'border-gray-300'}
                  `}
                  placeholder="123456"
                />
                {errors.code && (
                  <p className="mt-2 text-sm text-red-600">{errors.code.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="
                  w-full flex items-center justify-center space-x-2 
                  bg-primary-600 text-white py-3 px-4 rounded-lg font-medium
                  hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-200
                "
              >
                {isSubmitting || isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Verify Phone</span>
                    <ArrowRightIcon className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {email && (
              <div className="mt-6">
                <button
                  onClick={handleResendVerification}
                  disabled={isLoading || resendCooldown > 0}
                  className="text-sm text-primary-600 hover:text-primary-500 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    'Sending...'
                  ) : resendCooldown > 0 ? (
                    `Resend code in ${resendCooldown}s`
                  ) : (
                    'Didn\'t receive the code? Send again'
                  )}
                </button>
              </div>
            )}

            <div className="mt-6">
              <Link
                href="/auth/login"
                className="text-sm text-gray-600 hover:text-gray-500"
              >
                Back to Login
              </Link>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          {renderContent()}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-8"
        >
          <p className="text-xs text-gray-500">
            Having trouble? {' '}
            <Link href="/contact" className="text-primary-600 hover:underline">
              Contact support
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}