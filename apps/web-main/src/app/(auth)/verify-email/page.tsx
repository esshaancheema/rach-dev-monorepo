'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EnvelopeIcon,
  ArrowRightIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';

export default function VerifyEmailPage() {
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error' | 'input'>('input');
  const [resendCooldown, setResendCooldown] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyEmail, resendEmailVerification, isLoading, error, clearError } = useAuth();
  
  const email = searchParams.get('email') || '';
  const token = searchParams.get('token');

  // Auto-verify if token is provided in URL
  useEffect(() => {
    if (token) {
      handleVerification(token);
    }
  }, [token]);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleVerification = async (verificationToken: string) => {
    setVerificationStatus('loading');
    clearError();

    try {
      await verifyEmail(verificationToken);
      setVerificationStatus('success');
      
      // Redirect after success
      setTimeout(() => {
        router.push('/auth/login?message=email-verified');
      }, 3000);
    } catch (error) {
      setVerificationStatus('error');
    }
  };

  const handleResendVerification = async () => {
    if (!email || resendCooldown > 0) return;

    try {
      await resendEmailVerification(email);
      setResendCooldown(60); // 60 second cooldown
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
              Verifying your email...
            </h2>
            <p className="text-gray-600">
              Please wait while we verify your email address.
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
              Email verified successfully!
            </h2>
            <p className="text-gray-600 mb-6">
              Your email address has been verified. You can now access all features of your account.
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
              {error || 'The verification link is invalid or has expired. Please request a new verification email.'}
            </p>
            {email && (
              <div className="space-y-4">
                <button
                  onClick={handleResendVerification}
                  disabled={isLoading || resendCooldown > 0}
                  className="inline-flex items-center justify-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Sending...</span>
                    </>
                  ) : resendCooldown > 0 ? (
                    <>
                      <ClockIcon className="w-4 h-4" />
                      <span>Resend in {resendCooldown}s</span>
                    </>
                  ) : (
                    <>
                      <EnvelopeIcon className="w-4 h-4" />
                      <span>Resend verification email</span>
                    </>
                  )}
                </button>
                <p className="text-sm text-gray-500">
                  We'll send a new verification email to {email}
                </p>
              </div>
            )}
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
              <EnvelopeIcon className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Check your email
            </h2>
            <p className="text-gray-600 mb-6">
              We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
            </p>
            {email && (
              <div className="space-y-4">
                <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
                  Verification email sent to: <strong>{email}</strong>
                </p>
                <button
                  onClick={handleResendVerification}
                  disabled={isLoading || resendCooldown > 0}
                  className="inline-flex items-center justify-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Sending...</span>
                    </>
                  ) : resendCooldown > 0 ? (
                    <>
                      <ClockIcon className="w-4 h-4" />
                      <span>Resend in {resendCooldown}s</span>
                    </>
                  ) : (
                    <>
                      <EnvelopeIcon className="w-4 h-4" />
                      <span>Resend verification email</span>
                    </>
                  )}
                </button>
              </div>
            )}
            <div className="mt-6">
              <Link
                href="/auth/login"
                className="text-sm text-primary-600 hover:text-primary-500 font-medium"
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
            Didn't receive the email? Check your spam folder or{' '}
            <Link href="/contact" className="text-primary-600 hover:underline">
              contact support
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}