'use client';

import React, { useState } from 'react';
import { z } from 'zod';
import { CheckIcon, ExclamationTriangleIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

// Newsletter form schema
const newsletterSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  interests: z.array(z.string()).optional(),
});

type NewsletterFormData = z.infer<typeof newsletterSchema>;

interface NewsletterFormProps {
  title?: string;
  subtitle?: string;
  source?: string;
  variant?: 'default' | 'inline' | 'footer' | 'popup';
  showInterests?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

const interestOptions = [
  { id: 'general', label: 'General Updates' },
  { id: 'development', label: 'Software Development' },
  { id: 'ai', label: 'AI & Machine Learning' },
  { id: 'mobile', label: 'Mobile Development' },
  { id: 'web', label: 'Web Development' },
  { id: 'design', label: 'UI/UX Design' },
  { id: 'cloud', label: 'Cloud Services' },
  { id: 'devops', label: 'DevOps & Automation' },
];

export default function NewsletterForm({
  title = 'Stay Updated',
  subtitle = 'Get the latest insights on software development, AI, and technology trends.',
  source = 'website',
  variant = 'default',
  showInterests = false,
  onSuccess,
  onError,
}: NewsletterFormProps) {
  const [formData, setFormData] = useState<NewsletterFormData>({
    email: '',
    name: '',
    interests: [],
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');
  const [formTimestamp] = useState(Date.now());

  // Anti-spam honeypot
  const [honeypot, setHoneypot] = useState('');

  const handleInputChange = (field: keyof NewsletterFormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleInterestToggle = (interestId: string) => {
    const currentInterests = formData.interests || [];
    const updatedInterests = currentInterests.includes(interestId)
      ? currentInterests.filter(id => id !== interestId)
      : [...currentInterests, interestId];
    
    handleInputChange('interests', updatedInterests);
  };

  const validateForm = (): boolean => {
    try {
      newsletterSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const submissionData = {
        ...formData,
        source,
        honeypot,
        timestamp: formTimestamp,
        interests: formData.interests?.length ? formData.interests : ['general'],
      };

      const response = await fetch('/api/leads/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setSubmitMessage(result.message || 'Thank you for subscribing! Please check your email to confirm.');
        
        // Reset form
        setFormData({
          email: '',
          name: '',
          interests: [],
        });

        // Track successful newsletter signup
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'newsletter_signup', {
            event_category: 'engagement',
            event_label: source,
            value: 1,
          });
        }

        onSuccess?.(result);
      } else {
        throw new Error(result.message || 'Failed to subscribe');
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setSubmitStatus('error');
      setSubmitMessage(error instanceof Error ? error.message : 'Failed to subscribe. Please try again.');
      onError?.(error instanceof Error ? error.message : 'Subscription failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isInline = variant === 'inline' || variant === 'footer';
  const isPopup = variant === 'popup';

  if (submitStatus === 'success') {
    return (
      <div className={`text-center ${isInline ? 'p-6' : 'p-8'} bg-green-50 rounded-xl border border-green-200`}>
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckIcon className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-green-900 mb-2">Thank You!</h3>
        <p className="text-green-700 text-sm">{submitMessage}</p>
        {!isInline && (
          <button
            onClick={() => setSubmitStatus('idle')}
            className="mt-4 text-green-600 hover:text-green-700 font-medium text-sm"
          >
            Subscribe Another Email
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`${isInline ? '' : 'bg-white'} ${isInline ? 'p-0' : isPopup ? 'p-6' : 'p-8'} ${isInline ? '' : 'rounded-xl shadow-lg'}`}>
      {!isInline && (
        <div className="mb-6 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <EnvelopeIcon className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className={`${isPopup ? 'text-xl' : 'text-2xl'} font-bold text-gray-900 mb-2`}>{title}</h3>
          <p className="text-gray-600 text-sm">{subtitle}</p>
        </div>
      )}

      {isInline && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
          <p className="text-gray-600 text-sm">{subtitle}</p>
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200 flex items-start">
          <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-700 text-sm">{submitMessage}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Honeypot field - hidden from users */}
        <input
          type="text"
          name="website"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          className="absolute -left-9999px opacity-0"
          tabIndex={-1}
          autoComplete="off"
        />

        {isInline ? (
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your email"
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                </div>
              ) : (
                'Subscribe'
              )}
            </button>
          </div>
        ) : (
          <>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="your.email@company.com"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name (Optional)
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your name"
              />
            </div>

            {showInterests && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What are you interested in? (Optional)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {interestOptions.map((interest) => (
                    <label key={interest.id} className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        checked={formData.interests?.includes(interest.id) || false}
                        onChange={() => handleInterestToggle(interest.id)}
                        className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      {interest.label}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Subscribing...
                </div>
              ) : (
                'Subscribe to Newsletter'
              )}
            </button>
          </>
        )}

        <p className="text-xs text-gray-500 text-center">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </form>
    </div>
  );
}