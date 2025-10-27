'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useABTesting } from '@/hooks/useABTesting';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useIndustryDetection } from '@/hooks/useIndustryDetection';
import { 
  CheckIcon,
  SparklesIcon,
  ArrowRightIcon,
  PhoneIcon,
  CalendarIcon,
  StarIcon,
  BoltIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface PricingTier {
  id: string;
  name: string;
  description: string;
  price: {
    amount: string;
    period: string;
    note?: string;
  };
  features: string[];
  included: string[];
  popular?: boolean;
  cta: {
    text: string;
    href: string;
    variant: 'primary' | 'secondary' | 'outline';
  };
  badge?: string;
  icon: React.ElementType;
}

interface PricingPreviewProps {
  className?: string;
  variant?: 'compact' | 'detailed' | 'comparison';
  showAnnual?: boolean;
}

const pricingTiers: PricingTier[] = [
  {
    id: 'startup',
    name: 'Startup Package',
    description: 'Perfect for early-stage companies and MVPs',
    price: {
      amount: '$25,000',
      period: 'starting from',
      note: 'Complete MVP development'
    },
    features: [
      'MVP Development (6-8 weeks)',
      'Modern Tech Stack',
      'Basic AI Integration',
      'Mobile Responsive Design',
      'Basic Analytics',
      '3 Months Support'
    ],
    included: [
      'Source Code',
      'Documentation',
      'Deployment Setup',
      'Basic Training'
    ],
    cta: {
      text: 'Start Your MVP',
      href: '/contact?package=startup',
      variant: 'outline'
    },
    icon: BoltIcon
  },
  {
    id: 'professional',
    name: 'Professional Solution',
    description: 'Comprehensive solution for growing businesses',
    price: {
      amount: '$75,000',
      period: 'starting from',
      note: 'Full-featured application'
    },
    features: [
      'Custom Application (12-16 weeks)',
      'Advanced AI Features',
      'Database Design & Setup',
      'API Development',
      'Advanced Security',
      '6 Months Support',
      'Performance Optimization',
      'Testing & QA'
    ],
    included: [
      'Everything in Startup',
      'Advanced Analytics',
      'Multi-user Support',
      'Advanced Training',
      'Priority Support'
    ],
    popular: true,
    badge: 'Most Popular',
    cta: {
      text: 'Get Professional Solution',
      href: '/contact?package=professional',
      variant: 'primary'
    },
    icon: StarIcon
  },
  {
    id: 'enterprise',
    name: 'Enterprise Platform',
    description: 'Scalable solution for large organizations',
    price: {
      amount: 'Custom',
      period: 'pricing',
      note: 'Tailored to your needs'
    },
    features: [
      'Custom Enterprise Platform',
      'AI-Powered Automation',
      'Microservices Architecture',
      'Advanced Security & Compliance',
      'Multi-tenant Support',
      '12 Months Support',
      'Dedicated Team',
      'SLA Guarantee'
    ],
    included: [
      'Everything in Professional',
      'White-label Solution',
      'Custom Integrations',
      'Dedicated Account Manager',
      '24/7 Priority Support',
      'On-site Training'
    ],
    cta: {
      text: 'Contact Sales',
      href: '/enterprise',
      variant: 'secondary'
    },
    icon: ShieldCheckIcon
  }
];

const guarantees = [
  {
    icon: CheckIcon,
    title: '100% Satisfaction Guarantee',
    description: '30-day money-back guarantee if not completely satisfied'
  },
  {
    icon: ShieldCheckIcon,
    title: 'Enterprise Security',
    description: 'SOC 2 compliant with bank-level security standards'
  },
  {
    icon: BoltIcon,
    title: 'Rapid Deployment',
    description: 'Go live in weeks, not months with our proven methodology'
  }
];

export default function PricingPreview({ 
  className, 
  variant = 'compact',
  showAnnual = false 
}: PricingPreviewProps) {
  const { variant: pricingVariant, trackConversion } = useABTesting('pricing_display');
  const { trackEvent } = useAnalytics();
  const { industry } = useIndustryDetection();
  
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  // Get A/B test configuration
  const pricingConfig = pricingVariant?.config || {
    pricingPeriod: 'monthly',
    showDiscount: false,
    highlightPopular: true
  };

  // State to track hydration to prevent SSR/client mismatch
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Adapt pricing based on A/B test variant (only after hydration)
  const adaptedPricingTiers = useMemo(() => {
    return pricingTiers.map(tier => {
      // Only apply A/B test changes after hydration to prevent SSR mismatch
      if (!isHydrated) {
        return tier;
      }

      let updatedPrice = tier.price;
      let isPopular = tier.popular;
      let badge = tier.badge;

      if (pricingConfig.pricingPeriod === 'annual') {
        // Show annual pricing with discount
        updatedPrice = {
          ...tier.price,
          amount: tier.price.amount.replace('$25,000', '$22,500').replace('$75,000', '$67,500').replace('$150,000', '$135,000'),
          period: 'annual (save 10%)',
          note: tier.price.note + ' - Annual discount applied'
        };
      } else if (pricingConfig.pricingPeriod === 'value') {
        // Show value-based pricing with ROI focus
        updatedPrice = {
          ...tier.price,
          period: 'investment',
          note: `ROI typically 300%+ within first year`
        };
      }

      // Highlight popular based on A/B test
      if (tier.id === 'professional' && pricingConfig.highlightPopular) {
        isPopular = true;
        badge = 'Most Popular';
      }

      return {
        ...tier,
        price: updatedPrice,
        popular: isPopular,
        badge: badge
      };
    });
  }, [pricingConfig, isHydrated]);

  const handlePricingClick = (tierId: string, ctaText: string) => {
    trackEvent('pricing_cta_click', 'conversion', 'pricing_card', tierId, 1, {
      industry,
      variant: pricingVariant?.id || 'default',
      pricing_period: pricingConfig.pricingPeriod,
      tier: tierId
    });

    trackConversion('pricing_inquiry', 1, {
      tier: tierId,
      industry,
      pricing_variant: pricingVariant?.id || 'default'
    });
  };

  const renderPricingCard = (tier: PricingTier, index: number) => (
    <div
      key={tier.id}
      className={cn(
        'relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden',
        'border border-gray-200 hover:border-blue-300',
        tier.popular && 'ring-2 ring-blue-500 scale-[1.02] shadow-2xl',
        'group'
      )}
    >
      {/* Popular Badge */}
      {tier.popular && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
            <SparklesIcon className="inline h-4 w-4 mr-1" />
            {tier.badge}
          </div>
        </div>
      )}

      {/* Header */}
      <div className={cn(
        'p-8 text-center',
        tier.popular ? 'bg-gradient-to-br from-blue-50 to-indigo-50' : 'bg-gray-50'
      )}>
        <div className="mb-4">
          <div className={cn(
            'inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4',
            tier.popular ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 shadow-sm'
          )}>
            <tier.icon className="h-8 w-8" />
          </div>
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
        <p className="text-gray-600 mb-6">{tier.description}</p>
        
        <div className="mb-6">
          <div className="text-4xl font-bold text-gray-900 mb-1">
            {tier.price.amount}
          </div>
          <div className="text-sm text-gray-500">
            {tier.price.period}
          </div>
          {tier.price.note && (
            <div className="text-xs text-blue-600 mt-1 font-medium">
              {tier.price.note}
            </div>
          )}
        </div>

        {/* CTA Button */}
        <Link
          href={tier.cta.href}
          onClick={() => handlePricingClick(tier.id, tier.cta.text)}
          className={cn(
            'inline-flex items-center justify-center w-full px-6 py-3 rounded-lg font-semibold transition-all duration-200 group-hover:scale-105 transform hover:scale-[1.02]',
            tier.cta.variant === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg',
            tier.cta.variant === 'secondary' && 'bg-gray-900 text-white hover:bg-gray-800 shadow-lg',
            tier.cta.variant === 'outline' && 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'
          )}
        >
          {tier.cta.text}
          <ArrowRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          {pricingConfig.showDiscount && tier.id === 'professional' && (
            <span className="ml-2 px-2 py-1 bg-green-500 text-white text-xs rounded-full inline-block">
              SAVE 10%
            </span>
          )}
        </Link>
      </div>

      {/* Features */}
      <div className="p-8">
        <h4 className="font-semibold text-gray-900 mb-4">What's Included:</h4>
        <ul className="space-y-3 mb-6">
          {tier.features.map((feature, idx) => (
            <li key={idx} className="flex items-start">
              <CheckIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700 text-sm">{feature}</span>
            </li>
          ))}
        </ul>

        {variant === 'detailed' && (
          <div className="pt-6 border-t border-gray-200">
            <h5 className="font-medium text-gray-900 mb-3">Additional Benefits:</h5>
            <ul className="space-y-2">
              {tier.included.map((item, idx) => (
                <li key={idx} className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );

  if (variant === 'comparison') {
    return (
      <section className={cn('py-16 bg-gray-50', className)}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Compare Our Solutions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the perfect package for your business needs and scale as you grow
            </p>
          </div>

          {/* Pricing Grid */}
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {adaptedPricingTiers.map((tier, index) => renderPricingCard(tier, index))}
          </div>

          {/* Guarantees */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
              Our Guarantees to You
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              {guarantees.map((guarantee, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mb-4">
                    <guarantee.icon className="h-6 w-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">{guarantee.title}</h4>
                  <p className="text-sm text-gray-600">{guarantee.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Default compact variant
  return (
    <section className={cn('py-16 bg-white', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-4">
            <SparklesIcon className="h-4 w-4 mr-2" />
            Simple, Transparent Pricing
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Investment That Pays for Itself
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Fixed-price packages with no hidden fees. Choose the solution that fits your budget and timeline.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {adaptedPricingTiers.map((tier, index) => renderPricingCard(tier, index))}
        </div>

        {/* Bottom CTA */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-2xl overflow-hidden">
          <div className="px-8 py-12 sm:px-12 sm:py-16 lg:flex lg:items-center lg:justify-between">
            <div className="lg:flex-1">
              <h3 className="text-3xl font-bold text-white mb-4">
                Ready to Transform Your Business?
              </h3>
              <p className="text-xl text-blue-100 mb-6 lg:mb-0">
                Get a custom quote for your project in 24 hours. No commitment required.
              </p>
            </div>
            
            <div className="lg:flex-shrink-0 lg:ml-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-lg"
                >
                  <CalendarIcon className="mr-2 h-5 w-5" />
                  Get Free Consultation
                </Link>
                
                <Link
                  href="tel:+1-555-0123"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
                >
                  <PhoneIcon className="mr-2 h-5 w-5" />
                  Call Now
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-8">Trusted by 500+ companies worldwide</p>
          <div className="flex justify-center items-center space-x-8 opacity-60">
            {['Fortune 500', 'Y Combinator', 'TechStars', 'AWS Partner', 'Google Cloud'].map((badge, index) => (
              <div key={index} className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700">
                {badge}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Pre-configured variants
export function CompactPricing(props: Omit<PricingPreviewProps, 'variant'>) {
  return <PricingPreview {...props} variant="compact" />;
}

export function DetailedPricing(props: Omit<PricingPreviewProps, 'variant'>) {
  return <PricingPreview {...props} variant="detailed" />;
}

export function PricingComparison(props: Omit<PricingPreviewProps, 'variant'>) {
  return <PricingPreview {...props} variant="comparison" />;
}