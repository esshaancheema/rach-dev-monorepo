'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  CheckIcon,
  XMarkIcon,
  SparklesIcon,
  BoltIcon,
  ShieldCheckIcon,
  StarIcon,
  ArrowRightIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: {
    amount: string;
    period: string;
    originalAmount?: string;
    note: string;
  };
  badge?: {
    text: string;
    color: 'blue' | 'green' | 'purple' | 'orange';
  };
  features: {
    category: string;
    items: Array<{
      name: string;
      included: boolean | string;
      tooltip?: string;
    }>;
  }[];
  highlights: string[];
  cta: {
    text: string;
    href: string;
    variant: 'primary' | 'secondary' | 'outline';
  };
  popular?: boolean;
  icon: React.ElementType;
  deliverables: string[];
  timeline: string;
  support: string;
  technologies: string[];
}

const pricingPlans: PricingPlan[] = [
  {
    id: 'startup',
    name: 'Startup Package',
    description: 'Perfect for early-stage companies and MVPs',
    price: {
      amount: '$25,000',
      period: 'Fixed Price',
      note: 'Complete MVP in 6-8 weeks'
    },
    badge: {
      text: 'Best for MVPs',
      color: 'green'
    },
    features: [
      {
        category: 'Development',
        items: [
          { name: 'Custom Web Application', included: true },
          { name: 'Responsive Mobile Design', included: true },
          { name: 'User Authentication', included: true },
          { name: 'Basic Admin Panel', included: true },
          { name: 'Database Design & Setup', included: true },
          { name: 'API Development', included: 'Basic REST API' },
          { name: 'Third-party Integrations', included: 'Up to 3' },
          { name: 'Payment Processing', included: 'Stripe/PayPal' },
        ]
      },
      {
        category: 'AI & Advanced Features',
        items: [
          { name: 'AI Integration', included: 'Basic ChatGPT/Claude' },
          { name: 'Machine Learning Models', included: false },
          { name: 'Advanced Analytics', included: false },
          { name: 'Real-time Features', included: 'Basic notifications' },
        ]
      },
      {
        category: 'Testing & Deployment',
        items: [
          { name: 'Automated Testing', included: 'Unit tests' },
          { name: 'Security Testing', included: 'Basic security scan' },
          { name: 'Performance Optimization', included: true },
          { name: 'Cloud Deployment', included: 'AWS/Vercel' },
          { name: 'SSL Certificate', included: true },
          { name: 'Domain Setup', included: true },
        ]
      },
      {
        category: 'Support & Maintenance',
        items: [
          { name: 'Post-launch Support', included: '3 months' },
          { name: 'Bug Fixes', included: '3 months free' },
          { name: 'Feature Updates', included: 'Minor updates' },
          { name: 'Monitoring & Alerts', included: 'Basic monitoring' },
        ]
      }
    ],
    highlights: [
      'Launch-ready MVP in 6-8 weeks',
      'Modern tech stack (React, Node.js, AWS)',
      'Mobile-responsive design',
      'Basic AI integration included',
      '3 months post-launch support'
    ],
    cta: {
      text: 'Start Your MVP',
      href: '/contact?package=startup',
      variant: 'outline'
    },
    icon: BoltIcon,
    deliverables: [
      'Complete source code',
      'Technical documentation',
      'Deployment guide',
      'User manual',
      'Basic training session'
    ],
    timeline: '6-8 weeks',
    support: '3 months included',
    technologies: ['React', 'Node.js', 'PostgreSQL', 'AWS', 'Stripe']
  },
  {
    id: 'professional',
    name: 'Professional Solution',
    description: 'Comprehensive solution for growing businesses',
    price: {
      amount: '$75,000',
      period: 'Fixed Price',
      originalAmount: '$95,000',
      note: 'Full-featured application in 12-16 weeks'
    },
    badge: {
      text: 'Most Popular',
      color: 'blue'
    },
    popular: true,
    features: [
      {
        category: 'Development',
        items: [
          { name: 'Custom Web Application', included: true },
          { name: 'Responsive Mobile Design', included: true },
          { name: 'User Authentication', included: 'Advanced (SSO, 2FA)' },
          { name: 'Advanced Admin Panel', included: true },
          { name: 'Database Design & Setup', included: 'Optimized schema' },
          { name: 'API Development', included: 'Full REST + GraphQL' },
          { name: 'Third-party Integrations', included: 'Unlimited' },
          { name: 'Payment Processing', included: 'Multi-gateway support' },
        ]
      },
      {
        category: 'AI & Advanced Features',
        items: [
          { name: 'AI Integration', included: 'Advanced AI features' },
          { name: 'Machine Learning Models', included: 'Custom models' },
          { name: 'Advanced Analytics', included: 'Full dashboard' },
          { name: 'Real-time Features', included: 'WebSocket, live updates' },
        ]
      },
      {
        category: 'Testing & Deployment',
        items: [
          { name: 'Automated Testing', included: 'Full test suite' },
          { name: 'Security Testing', included: 'Penetration testing' },
          { name: 'Performance Optimization', included: 'Advanced optimization' },
          { name: 'Cloud Deployment', included: 'Multi-region AWS' },
          { name: 'SSL Certificate', included: true },
          { name: 'Domain Setup', included: true },
        ]
      },
      {
        category: 'Support & Maintenance',
        items: [
          { name: 'Post-launch Support', included: '6 months' },
          { name: 'Bug Fixes', included: '6 months free' },
          { name: 'Feature Updates', included: 'Regular updates' },
          { name: 'Monitoring & Alerts', included: '24/7 monitoring' },
        ]
      }
    ],
    highlights: [
      'Production-ready application in 12-16 weeks',
      'Advanced AI and ML capabilities',
      'Scalable architecture for growth',
      'Comprehensive testing and security',
      '6 months premium support included'
    ],
    cta: {
      text: 'Get Professional Solution',
      href: '/contact?package=professional',
      variant: 'primary'
    },
    icon: StarIcon,
    deliverables: [
      'Complete source code with documentation',
      'Technical architecture documentation',
      'API documentation',
      'User training materials',
      'Ongoing maintenance plan',
      'Performance optimization report'
    ],
    timeline: '12-16 weeks',
    support: '6 months premium',
    technologies: ['React', 'Node.js', 'PostgreSQL', 'AWS', 'AI/ML Stack', 'Redis', 'Docker']
  },
  {
    id: 'enterprise',
    name: 'Enterprise Platform',
    description: 'Scalable solution for large organizations',
    price: {
      amount: 'Custom',
      period: 'Pricing',
      note: 'Tailored to your specific requirements'
    },
    badge: {
      text: 'Enterprise Grade',
      color: 'purple'
    },
    features: [
      {
        category: 'Development',
        items: [
          { name: 'Custom Enterprise Platform', included: true },
          { name: 'Multi-tenant Architecture', included: true },
          { name: 'Enterprise SSO Integration', included: true },
          { name: 'Advanced Admin Console', included: true },
          { name: 'Microservices Architecture', included: true },
          { name: 'Enterprise API Gateway', included: true },
          { name: 'Custom Integrations', included: 'Unlimited' },
          { name: 'White-label Solution', included: true },
        ]
      },
      {
        category: 'AI & Advanced Features',
        items: [
          { name: 'Custom AI Models', included: true },
          { name: 'Advanced ML Pipeline', included: true },
          { name: 'Predictive Analytics', included: true },
          { name: 'Real-time Processing', included: 'Enterprise scale' },
        ]
      },
      {
        category: 'Security & Compliance',
        items: [
          { name: 'SOC 2 Compliance', included: true },
          { name: 'GDPR Compliance', included: true },
          { name: 'Advanced Security', included: 'Pen testing included' },
          { name: 'Audit Logging', included: 'Comprehensive' },
        ]
      },
      {
        category: 'Support & Maintenance',
        items: [
          { name: 'Dedicated Account Manager', included: true },
          { name: '24/7 Priority Support', included: true },
          { name: 'SLA Guarantee', included: '99.9% uptime' },
          { name: 'Ongoing Development', included: 'Dedicated team' },
        ]
      }
    ],
    highlights: [
      'Custom enterprise-grade platform',
      'Dedicated development team',
      'Advanced security and compliance',
      '24/7 priority support with SLA',
      'Ongoing development partnership'
    ],
    cta: {
      text: 'Contact Sales',
      href: '/enterprise',
      variant: 'secondary'
    },
    icon: ShieldCheckIcon,
    deliverables: [
      'Enterprise platform with source code',
      'Comprehensive documentation suite',
      'Security audit report',
      'Compliance certification',
      'Dedicated team assignment',
      'Ongoing development roadmap'
    ],
    timeline: 'Custom timeline',
    support: '12+ months with SLA',
    technologies: ['Microservices', 'Kubernetes', 'Enterprise Stack', 'Custom AI/ML', 'Advanced Security']
  }
];

interface PricingPlansProps {
  className?: string;
  showComparison?: boolean;
}

export default function PricingPlans({ className, showComparison = true }: PricingPlansProps) {
  const [billingPeriod, setBillingPeriod] = useState<'fixed' | 'monthly'>('fixed');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  const badgeColors = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    purple: 'bg-purple-100 text-purple-800',
    orange: 'bg-orange-100 text-orange-800',
  };

  const renderFeatureValue = (item: { name: string; included: boolean | string; tooltip?: string }) => {
    if (typeof item.included === 'boolean') {
      return item.included ? (
        <CheckIcon className="h-5 w-5 text-green-500" />
      ) : (
        <XMarkIcon className="h-5 w-5 text-red-400" />
      );
    }
    
    return (
      <div className="flex items-center">
        <span className="text-sm text-gray-700">{item.included}</span>
        {item.tooltip && (
          <InformationCircleIcon className="h-4 w-4 text-gray-400 ml-1" title={item.tooltip} />
        )}
      </div>
    );
  };

  return (
    <section className={cn('py-16 bg-white', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-4">
            <SparklesIcon className="h-4 w-4 mr-2" />
            Transparent, Fixed Pricing
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Choose Your Perfect Package
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            No hidden fees, no hourly rates, no surprises. Just transparent, fixed pricing 
            that includes everything you need to launch successfully.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setBillingPeriod('fixed')}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                billingPeriod === 'fixed'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              Fixed Project Price
            </button>
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                billingPeriod === 'monthly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              Monthly Retainer
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {pricingPlans.map((plan, index) => (
            <div
              key={plan.id}
              className={cn(
                'relative bg-white border rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300',
                plan.popular 
                  ? 'border-blue-500 ring-2 ring-blue-500 scale-105' 
                  : 'border-gray-200 hover:border-blue-300'
              )}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                    <SparklesIcon className="inline h-4 w-4 mr-1" />
                    Most Popular
                  </div>
                </div>
              )}

              {/* Plan Badge */}
              {plan.badge && (
                <div className="absolute top-6 right-6">
                  <span className={cn(
                    'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
                    badgeColors[plan.badge.color]
                  )}>
                    {plan.badge.text}
                  </span>
                </div>
              )}

              <div className="p-8">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className={cn(
                    'inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4',
                    plan.popular ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                  )}>
                    <plan.icon className="h-8 w-8" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  
                  <div className="mb-6">
                    <div className="flex items-baseline justify-center">
                      {plan.price.originalAmount && (
                        <span className="text-lg text-gray-400 line-through mr-2">
                          {plan.price.originalAmount}
                        </span>
                      )}
                      <span className="text-4xl font-bold text-gray-900">
                        {plan.price.amount}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">{plan.price.period}</div>
                    <div className="text-xs text-blue-600 mt-1 font-medium">
                      {plan.price.note}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Link
                    href={plan.cta.href}
                    className={cn(
                      'w-full inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-all duration-200 mb-8',
                      plan.cta.variant === 'primary' && 
                        'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl',
                      plan.cta.variant === 'secondary' && 
                        'bg-gray-900 text-white hover:bg-gray-800 shadow-lg hover:shadow-xl',
                      plan.cta.variant === 'outline' && 
                        'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'
                    )}
                  >
                    {plan.cta.text}
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </Link>
                </div>

                {/* Highlights */}
                <div className="mb-8">
                  <h4 className="font-semibold text-gray-900 mb-4">Key Highlights:</h4>
                  <ul className="space-y-2">
                    {plan.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-start">
                        <CheckIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Quick Info */}
                <div className="grid grid-cols-2 gap-4 text-center bg-gray-50 rounded-lg p-4">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Timeline</div>
                    <div className="text-xs text-gray-600">{plan.timeline}</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Support</div>
                    <div className="text-xs text-gray-600">{plan.support}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Feature Comparison Table */}
        {showComparison && (
          <div className="bg-gray-50 rounded-2xl p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Detailed Feature Comparison
              </h3>
              <p className="text-gray-600">
                Compare all features across our packages to find the perfect fit for your needs.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 pr-8 font-semibold text-gray-900">Features</th>
                    {pricingPlans.map((plan) => (
                      <th key={plan.id} className="text-center py-4 px-4 font-semibold text-gray-900">
                        {plan.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pricingPlans[0].features.map((category, categoryIndex) => (
                    <React.Fragment key={category.category}>
                      <tr className="bg-gray-100">
                        <td colSpan={pricingPlans.length + 1} className="py-3 px-4 font-semibold text-gray-900 text-sm uppercase tracking-wide">
                          {category.category}
                        </td>
                      </tr>
                      {category.items.map((item, itemIndex) => (
                        <tr key={`${categoryIndex}-${itemIndex}`} className="border-b border-gray-100">
                          <td className="py-3 pr-8 text-sm text-gray-700">
                            <div className="flex items-center">
                              {item.name}
                              {item.tooltip && (
                                <InformationCircleIcon 
                                  className="h-4 w-4 text-gray-400 ml-1" 
                                  title={item.tooltip} 
                                />
                              )}
                            </div>
                          </td>
                          {pricingPlans.map((plan) => {
                            const planItem = plan.features[categoryIndex]?.items[itemIndex];
                            return (
                              <td key={plan.id} className="py-3 px-4 text-center">
                                {planItem ? renderFeatureValue(planItem) : (
                                  <XMarkIcon className="h-5 w-5 text-red-400 mx-auto" />
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Not Sure Which Package is Right for You?
          </h3>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Schedule a free consultation with our experts. We'll help you choose the perfect 
            package based on your specific requirements and budget.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-lg"
            >
              Get Free Consultation
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
            
            <Link
              href="/enterprise"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-blue-600 bg-white border-2 border-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              Enterprise Solutions
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}