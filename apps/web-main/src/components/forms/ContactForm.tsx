'use client';

import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { CheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

// Form schema
const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  company: z.string().optional(),
  service: z.string().optional(),
  budget: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  urgency: z.enum(['immediate', 'within_month', 'within_quarter', 'exploring']).optional(),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

interface ContactFormProps {
  title?: string;
  subtitle?: string;
  defaultService?: string;
  defaultLocation?: string;
  defaultIndustry?: string;
  source?: string;
  variant?: 'default' | 'compact' | 'sidebar';
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export default function ContactForm({
  title = 'Get Started Today',
  subtitle = 'Tell us about your project and we\'ll get back to you within 24 hours.',
  defaultService,
  defaultLocation,
  defaultIndustry,
  source = 'website',
  variant = 'default',
  onSuccess,
  onError,
}: ContactFormProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: defaultService || '',
    budget: '',
    message: '',
    urgency: undefined,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');
  const [formTimestamp] = useState(Date.now());

  // Anti-spam honeypot
  const [honeypot, setHoneypot] = useState('');

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    try {
      contactFormSchema.parse(formData);
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
        location: defaultLocation,
        industry: defaultIndustry,
        honeypot,
        timestamp: formTimestamp,
      };

      const response = await fetch('/api/leads/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setSubmitMessage(result.message || 'Thank you for your inquiry! We\'ll get back to you within 24 hours.');
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          company: '',
          service: defaultService || '',
          budget: '',
          message: '',
          urgency: undefined,
        });

        // Track successful form submission
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'form_submit', {
            event_category: 'engagement',
            event_label: 'contact_form',
            value: 1,
          });
        }

        onSuccess?.(result);
      } else {
        throw new Error(result.message || 'Failed to submit form');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
      setSubmitMessage(error instanceof Error ? error.message : 'Failed to submit form. Please try again.');
      onError?.(error instanceof Error ? error.message : 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCompact = variant === 'compact' || variant === 'sidebar';

  if (submitStatus === 'success') {
    return (
      <div className="text-center p-8 bg-green-50 rounded-xl border border-green-200">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckIcon className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-green-900 mb-2">Thank You!</h3>
        <p className="text-green-700">{submitMessage}</p>
        <button
          onClick={() => setSubmitStatus('idle')}
          className="mt-4 text-green-600 hover:text-green-700 font-medium"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-white ${isCompact ? 'p-6' : 'p-8'} rounded-xl shadow-lg`}>
      {!isCompact && (
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600">{subtitle}</p>
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200 flex items-start">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-red-800 font-medium">Submission Failed</h4>
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

        <div className={isCompact ? 'space-y-4' : 'grid grid-cols-1 sm:grid-cols-2 gap-4'}>
          <div className={isCompact ? '' : 'sm:col-span-1'}>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Your full name"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div className={isCompact ? '' : 'sm:col-span-1'}>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email *
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
        </div>

        <div className={isCompact ? 'space-y-4' : 'grid grid-cols-1 sm:grid-cols-2 gap-4'}>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
              Company
            </label>
            <input
              type="text"
              id="company"
              value={formData.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Your company name"
            />
          </div>
        </div>

        <div className={isCompact ? 'space-y-4' : 'grid grid-cols-1 sm:grid-cols-2 gap-4'}>
          <div>
            <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-1">
              Service Interest
            </label>
            <select
              id="service"
              value={formData.service}
              onChange={(e) => handleInputChange('service', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a service</option>
              <option value="web-development">Web Development</option>
              <option value="mobile-development">Mobile App Development</option>
              <option value="software-development">Custom Software Development</option>
              <option value="ai-development">AI Development</option>
              <option value="ecommerce-development">E-commerce Development</option>
              <option value="cloud-services">Cloud Services</option>
              <option value="ui-ux-design">UI/UX Design</option>
              <option value="digital-marketing">Digital Marketing</option>
              <option value="consulting">Technology Consulting</option>
            </select>
          </div>

          <div>
            <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">
              Budget Range
            </label>
            <select
              id="budget"
              value={formData.budget}
              onChange={(e) => handleInputChange('budget', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select budget range</option>
              <option value="under_10k">Under $10,000</option>
              <option value="10k_25k">$10,000 - $25,000</option>
              <option value="25k_50k">$25,000 - $50,000</option>
              <option value="50k_100k">$50,000 - $100,000</option>
              <option value="100k_plus">$100,000+</option>
            </select>
          </div>
        </div>

        {!isCompact && (
          <div>
            <label htmlFor="urgency" className="block text-sm font-medium text-gray-700 mb-1">
              Timeline
            </label>
            <select
              id="urgency"
              value={formData.urgency || ''}
              onChange={(e) => handleInputChange('urgency', e.target.value as any)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select timeline</option>
              <option value="immediate">ASAP (Immediate)</option>
              <option value="within_month">Within 1 month</option>
              <option value="within_quarter">Within 3 months</option>
              <option value="exploring">Just exploring</option>
            </select>
          </div>
        )}

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Project Details *
          </label>
          <textarea
            id="message"
            rows={isCompact ? 3 : 5}
            value={formData.message}
            onChange={(e) => handleInputChange('message', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.message ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Tell us about your project requirements, goals, and any specific features you need..."
          />
          {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
              Sending...
            </div>
          ) : (
            'Send Message'
          )}
        </button>

        <p className="text-xs text-gray-500 text-center">
          By submitting this form, you agree to our privacy policy. We'll never share your information with third parties.
        </p>
      </form>
    </div>
  );
}