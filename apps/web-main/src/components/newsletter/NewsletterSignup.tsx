'use client';

import { useState } from 'react';
import { EnvelopeIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useIndustryDetection } from '@/hooks/useIndustryDetection';
import { useGeolocation } from '@/hooks/useGeolocation';
import { cn } from '@/lib/utils';

interface NewsletterSignupProps {
  variant?: 'default' | 'minimal' | 'card' | 'inline';
  className?: string;
  title?: string;
  description?: string;
  placeholder?: string;
  buttonText?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  theme?: 'light' | 'dark';
  apiEndpoint?: string;
}

interface FormState {
  email: string;
  status: 'idle' | 'loading' | 'success' | 'error';
  message: string;
}

export default function NewsletterSignup({
  variant = 'default',
  className,
  title = 'Stay Updated',
  description = 'Get the latest insights on software development, AI, and technology trends delivered to your inbox.',
  placeholder = 'Enter your email address',
  buttonText = 'Subscribe',
  showIcon = true,
  size = 'md',
  theme = 'light',
  apiEndpoint = '/api/newsletter/subscribe',
}: NewsletterSignupProps) {
  const [form, setForm] = useState<FormState>({
    email: '',
    status: 'idle',
    message: '',
  });

  const { trackEvent } = useAnalytics();
  const { industry } = useIndustryDetection();
  const { country, city } = useGeolocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.email) {
      setForm(prev => ({ ...prev, status: 'error', message: 'Please enter your email address' }));
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setForm(prev => ({ ...prev, status: 'error', message: 'Please enter a valid email address' }));
      return;
    }

    setForm(prev => ({ ...prev, status: 'loading', message: '' }));

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: form.email,
          source: 'website',
          tags: ['newsletter', 'website-signup'],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to subscribe');
      }

      setForm({
        email: '',
        status: 'success',
        message: data.message || 'Successfully subscribed! Check your email for confirmation.',
      });

      // Enhanced tracking with comprehensive analytics
      trackEvent('newsletter_signup_success', 'conversion', 'newsletter', form.email.split('@')[1], 1, {
        variant,
        size,
        theme,
        industry,
        country,
        city,
        email_domain: form.email.split('@')[1],
        source: 'website',
        location: `${city}, ${country}`
      });

      // Track subscription event (legacy gtag)
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'newsletter_signup', {
          event_category: 'engagement',
          event_label: 'newsletter',
        });
      }
    } catch (error) {
      setForm(prev => ({
        ...prev,
        status: 'error',
        message: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
      }));
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({
      ...prev,
      email: e.target.value,
      status: prev.status === 'error' ? 'idle' : prev.status,
      message: prev.status === 'error' ? '' : prev.message,
    }));
  };

  // Size variants
  const sizeClasses = {
    sm: {
      input: 'px-3 py-2 text-sm',
      button: 'px-4 py-2 text-sm',
      title: 'text-lg',
      description: 'text-sm',
    },
    md: {
      input: 'px-4 py-3 text-base',
      button: 'px-6 py-3 text-base',
      title: 'text-xl',
      description: 'text-base',
    },
    lg: {
      input: 'px-5 py-4 text-lg',
      button: 'px-8 py-4 text-lg',
      title: 'text-2xl',
      description: 'text-lg',
    },
  };

  // Theme variants
  const themeClasses = {
    light: {
      container: 'bg-white text-gray-900',
      input: 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500',
      button: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      title: 'text-gray-900',
      description: 'text-gray-600',
    },
    dark: {
      container: 'bg-gray-900 text-white',
      input: 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400',
      button: 'bg-blue-600 text-white hover:bg-blue-500 focus:ring-blue-400',
      title: 'text-white',
      description: 'text-gray-300',
    },
  };

  // Success state
  if (form.status === 'success') {
    return (
      <div className={cn(
        'flex items-center justify-center p-6 rounded-lg',
        themeClasses[theme].container,
        variant === 'card' && 'border border-green-200 bg-green-50',
        className
      )}>
        <div className="text-center">
          <CheckCircleIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h3 className={cn('font-medium mb-2', sizeClasses[size].title)}>
            Thanks for subscribing!
          </h3>
          <p className={cn('text-green-700', sizeClasses[size].description)}>
            {form.message}
          </p>
        </div>
      </div>
    );
  }

  // Render variants
  const renderMinimal = () => (
    <form onSubmit={handleSubmit} className={cn('flex gap-2', className)}>
      <div className="flex-1">
        <label htmlFor="email" className="sr-only">Email address</label>
        <input
          id="email"
          type="email"
          value={form.email}
          onChange={handleEmailChange}
          placeholder={placeholder}
          className={cn(
            'w-full rounded-md border focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200',
            sizeClasses[size].input,
            themeClasses[theme].input,
            form.status === 'error' && 'border-red-500 focus:border-red-500 focus:ring-red-500'
          )}
          disabled={form.status === 'loading'}
        />
      </div>
      <button
        type="submit"
        disabled={form.status === 'loading'}
        className={cn(
          'inline-flex items-center rounded-md border border-transparent font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
          sizeClasses[size].button,
          themeClasses[theme].button
        )}
      >
        {form.status === 'loading' ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
        ) : (
          <>
            {showIcon && <EnvelopeIcon className="h-4 w-4 mr-2" />}
            {buttonText}
          </>
        )}
      </button>
    </form>
  );

  const renderInline = () => (
    <div className={cn('flex flex-col sm:flex-row gap-3', className)}>
      <div className="flex-1">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            value={form.email}
            onChange={handleEmailChange}
            placeholder={placeholder}
            className={cn(
              'flex-1 rounded-md border focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200',
              sizeClasses[size].input,
              themeClasses[theme].input,
              form.status === 'error' && 'border-red-500 focus:border-red-500 focus:ring-red-500'
            )}
            disabled={form.status === 'loading'}
          />
          <button
            type="submit"
            disabled={form.status === 'loading'}
            className={cn(
              'inline-flex items-center rounded-md border border-transparent font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
              sizeClasses[size].button,
              themeClasses[theme].button
            )}
          >
            {form.status === 'loading' ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : (
              buttonText
            )}
          </button>
        </form>
      </div>
    </div>
  );

  const renderDefault = () => (
    <div className={cn(
      'p-6',
      variant === 'card' && 'rounded-lg border border-gray-200 shadow-sm',
      themeClasses[theme].container,
      className
    )}>
      <div className="text-center mb-6">
        {showIcon && (
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
            <EnvelopeIcon className="h-6 w-6 text-blue-600" />
          </div>
        )}
        <h3 className={cn('font-bold mb-2', sizeClasses[size].title, themeClasses[theme].title)}>
          {title}
        </h3>
        <p className={cn('mb-6', sizeClasses[size].description, themeClasses[theme].description)}>
          {description}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="sr-only">Email address</label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={handleEmailChange}
            placeholder={placeholder}
            className={cn(
              'w-full rounded-md border focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200',
              sizeClasses[size].input,
              themeClasses[theme].input,
              form.status === 'error' && 'border-red-500 focus:border-red-500 focus:ring-red-500'
            )}
            disabled={form.status === 'loading'}
          />
        </div>

        <button
          type="submit"
          disabled={form.status === 'loading'}
          className={cn(
            'w-full inline-flex items-center justify-center rounded-md border border-transparent font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
            sizeClasses[size].button,
            themeClasses[theme].button
          )}
        >
          {form.status === 'loading' ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
          ) : (
            <>
              {showIcon && <EnvelopeIcon className="h-5 w-5 mr-2" />}
              {buttonText}
            </>
          )}
        </button>
      </form>

      <p className="mt-3 text-xs text-gray-500 text-center">
        We respect your privacy. Unsubscribe at any time.
      </p>
    </div>
  );

  return (
    <div>
      {variant === 'minimal' && renderMinimal()}
      {variant === 'inline' && renderInline()}
      {(variant === 'default' || variant === 'card') && renderDefault()}
      
      {/* Error message */}
      {form.status === 'error' && form.message && (
        <div className="mt-3 flex items-center text-sm text-red-600">
          <ExclamationCircleIcon className="h-4 w-4 mr-1 flex-shrink-0" />
          {form.message}
        </div>
      )}
    </div>
  );
}

// Pre-configured variants for common use cases
export function HeroNewsletterSignup(props: Omit<NewsletterSignupProps, 'variant' | 'size' | 'theme'>) {
  return (
    <NewsletterSignup
      {...props}
      variant="card"
      size="lg"
      theme="light"
      title="Stay Ahead with Zoptal"
      description="Join 10,000+ developers and business leaders getting weekly insights on AI, software development, and digital transformation."
    />
  );
}

export function FooterNewsletterSignup(props: Omit<NewsletterSignupProps, 'variant' | 'size' | 'theme'>) {
  return (
    <NewsletterSignup
      {...props}
      variant="minimal"
      size="md"
      theme="dark"
      placeholder="Your email address"
      buttonText="Subscribe"
    />
  );
}

export function SidebarNewsletterSignup(props: Omit<NewsletterSignupProps, 'variant' | 'size'>) {
  return (
    <NewsletterSignup
      {...props}
      variant="card"
      size="sm"
      title="Weekly Newsletter"
      description="Get curated content delivered to your inbox every week."
    />
  );
}

export function InlineNewsletterSignup(props: Omit<NewsletterSignupProps, 'variant'>) {
  return (
    <NewsletterSignup
      {...props}
      variant="inline"
      showIcon={false}
    />
  );
}