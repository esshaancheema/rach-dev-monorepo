'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

interface NewsletterProps {
  variant?: 'default' | 'compact' | 'inline';
  className?: string;
  title?: string;
  description?: string;
  placeholder?: string;
  showBenefits?: boolean;
}

interface NewsletterFormData {
  email: string;
  firstName?: string;
  interests?: string[];
}

const NEWSLETTER_BENEFITS = [
  'Weekly AI and development insights',
  'Early access to new features',
  'Exclusive tutorials and guides',
  'Industry trends and analysis',
];

const INTEREST_CATEGORIES = [
  { id: 'ai', label: 'AI & Machine Learning', icon: '🤖' },
  { id: 'development', label: 'Software Development', icon: '💻' },
  { id: 'mobile', label: 'Mobile Development', icon: '📱' },
  { id: 'enterprise', label: 'Enterprise Solutions', icon: '🏢' },
  { id: 'startups', label: 'Startup Resources', icon: '🚀' },
];

export function Newsletter({
  variant = 'default',
  className,
  title = 'Stay Updated',
  description = 'Get the latest insights on AI-accelerated development delivered to your inbox.',
  placeholder = 'Enter your email',
  showBenefits = true,
}: NewsletterProps) {
  const [formData, setFormData] = useState<NewsletterFormData>({
    email: '',
    firstName: '',
    interests: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Here you would typically call your newsletter API
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to subscribe');
      }
      
      setIsSubmitted(true);
      
      // Track subscription event
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'newsletter_subscribe', {
          method: 'email',
          interests: formData.interests,
        });
      }
    } catch (err) {
      setError('Failed to subscribe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInterestToggle = (interestId: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests?.includes(interestId)
        ? prev.interests.filter(id => id !== interestId)
        : [...(prev.interests || []), interestId],
    }));
  };

  if (isSubmitted) {
    return (
      <div className={cn('text-center', className)}>
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Welcome to the Zoptal community! 🎉
        </h3>
        <p className="text-gray-600 mb-4">
          Thanks for subscribing! Check your email for a confirmation link.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setIsSubmitted(false);
            setFormData({ email: '', firstName: '', interests: [] });
          }}
        >
          Subscribe Another Email
        </Button>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn('max-w-md', className)}>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-4">{description}</p>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="email"
            placeholder={placeholder}
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            required
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={isSubmitting}
            size="sm"
          >
            {isSubmitting ? 'Subscribing...' : 'Subscribe'}
          </Button>
        </form>
        {error && (
          <p className="text-sm text-red-600 mt-2">{error}</p>
        )}
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <form onSubmit={handleSubmit} className={cn('flex gap-2 max-w-md', className)}>
        <Input
          type="email"
          placeholder={placeholder}
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          required
          className="flex-1"
        />
        <Button
          type="submit"
          disabled={isSubmitting}
          size="sm"
        >
          {isSubmitting ? 'Subscribing...' : 'Subscribe'}
        </Button>
      </form>
    );
  }

  return (
    <div className={cn('max-w-md', className)}>
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>

      {showBenefits && (
        <div className="mb-6">
          <h4 className="font-medium text-sm text-gray-700 mb-3">
            What you'll get:
          </h4>
          <ul className="space-y-2">
            {NEWSLETTER_BENEFITS.map((benefit, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4">
          <Input
            type="email"
            placeholder="Your email address"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            required
          />
          
          {showAdvanced && (
            <Input
              type="text"
              placeholder="First name (optional)"
              value={formData.firstName}
              onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
            />
          )}
        </div>

        {showAdvanced && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              What interests you most? (Optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {INTEREST_CATEGORIES.map((interest) => (
                <button
                  key={interest.id}
                  type="button"
                  onClick={() => handleInterestToggle(interest.id)}
                  className={cn(
                    'inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
                    formData.interests?.includes(interest.id)
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  <span>{interest.icon}</span>
                  <span>{interest.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            {showAdvanced ? 'Less options' : 'More options'}
          </button>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Subscribing...
            </div>
          ) : (
            'Subscribe to Newsletter'
          )}
        </Button>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <p className="text-xs text-gray-500 text-center">
          We respect your privacy. Unsubscribe at any time.{' '}
          <a href="/legal/privacy" className="text-blue-600 hover:underline">
            Privacy Policy
          </a>
        </p>
      </form>
    </div>
  );
}

// Newsletter section for marketing pages
export function NewsletterSection({ 
  className,
  backgroundVariant = 'gradient' 
}: { 
  className?: string;
  backgroundVariant?: 'gradient' | 'solid' | 'pattern';
}) {
  const backgroundClasses = {
    gradient: 'bg-gradient-to-r from-blue-600 to-purple-600',
    solid: 'bg-gray-900',
    pattern: 'bg-gray-900 relative overflow-hidden',
  };

  return (
    <section className={cn(backgroundClasses[backgroundVariant], 'text-white py-16', className)}>
      {backgroundVariant === 'pattern' && (
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      )}
      
      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary" className="bg-white/20 text-white">
                  Newsletter
                </Badge>
                <span className="text-sm text-blue-100">10,000+ subscribers</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Stay Ahead of the Curve
              </h2>
              <p className="text-xl text-blue-100 mb-6">
                Get weekly insights on AI, development trends, and exclusive tutorials 
                delivered straight to your inbox.
              </p>
              <div className="flex items-center gap-4 text-sm text-blue-100">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Weekly insights</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>No spam</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Unsubscribe anytime</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-8">
              <Newsletter
                variant="default"
                title="Join the Community"
                description="Get exclusive access to tutorials, insights, and early feature previews."
                showBenefits={false}
                className="text-white"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}