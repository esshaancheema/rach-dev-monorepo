'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon,
  SparklesIcon,
  UserPlusIcon,
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface AuthGateProps {
  isOpen: boolean;
  onClose: () => void;
  onSignUp: (email: string, password: string, name?: string) => Promise<void>;
  onSignIn: (email: string, password: string) => Promise<void>;
  promptsUsed: number;
  className?: string;
}

export default function AuthGate({ 
  isOpen, 
  onClose, 
  onSignUp, 
  onSignIn, 
  promptsUsed,
  className 
}: AuthGateProps) {
  const [isSignUp, setIsSignUp] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (isSignUp && !formData.name) {
      newErrors.name = 'Name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      if (isSignUp) {
        await onSignUp(formData.email, formData.password, formData.name);
      } else {
        await onSignIn(formData.email, formData.password);
      }
      onClose();
    } catch (error) {
      setErrors({ submit: 'Authentication failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setErrors({});
    setFormData({ name: '', email: '', password: '' });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={cn(
              "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50 overflow-hidden",
              className
            )}
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-200 flex items-center justify-center"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>

              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <SparklesIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Unlock More AI Power</h3>
                  <p className="text-blue-100 text-sm">Get 3 additional prompts</p>
                </div>
              </div>

              {/* Progress Achievement */}
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>Your Progress</span>
                  <span className="font-medium">{promptsUsed}/3 prompts used</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(promptsUsed / 3) * 100}%` }}
                    className="bg-white rounded-full h-2"
                  />
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="p-6">
              <div className="text-center mb-6">
                <h4 className="text-xl font-bold text-gray-900 mb-2">
                  {isSignUp ? 'Create Your Account' : 'Welcome Back'}
                </h4>
                <p className="text-gray-600 text-sm">
                  {isSignUp 
                    ? 'Join thousands of developers building with AI' 
                    : 'Continue building amazing apps with AI'
                  }
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Field (Sign Up Only) */}
                {isSignUp && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={cn(
                        "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors",
                        errors.name ? "border-red-500" : "border-gray-300"
                      )}
                      placeholder="John Doe"
                      disabled={isLoading}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                    )}
                  </div>
                )}

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={cn(
                        "w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors",
                        errors.email ? "border-red-500" : "border-gray-300"
                      )}
                      placeholder="john@example.com"
                      disabled={isLoading}
                    />
                    <EnvelopeIcon className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={cn(
                        "w-full pl-3 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors",
                        errors.password ? "border-red-500" : "border-gray-300"
                      )}
                      placeholder="••••••••"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                  )}
                </div>

                {/* Submit Error */}
                {errors.submit && (
                  <div className="text-red-500 text-sm text-center p-3 bg-red-50 rounded-lg">
                    {errors.submit}
                  </div>
                )}

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      {isSignUp ? (
                        <UserPlusIcon className="h-4 w-4" />
                      ) : (
                        <ArrowRightIcon className="h-4 w-4" />
                      )}
                      <span>
                        {isSignUp ? 'Create Account & Continue' : 'Sign In & Continue'}
                      </span>
                    </>
                  )}
                </motion.button>
              </form>

              {/* Toggle Mode */}
              <div className="mt-6 text-center">
                <button
                  onClick={toggleMode}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {isSignUp 
                    ? 'Already have an account? Sign in' 
                    : "Don't have an account? Sign up"
                  }
                </button>
              </div>

              {/* Benefits */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-2">
                  ✨ With your account, you get:
                </div>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• 3 additional AI prompts (6 total)</li>
                  <li>• Save and export your generated apps</li>
                  <li>• Priority customer support</li>
                  <li>• Early access to new features</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}