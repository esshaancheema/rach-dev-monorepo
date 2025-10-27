import { Metadata } from 'next';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';

export const metadata: Metadata = {
  title: 'Pricing Plans - Choose Your Plan | Zoptal',
  description: 'Transparent pricing for AI-accelerated development. Start free, scale as you grow. Compare plans and features to find the perfect fit for your needs.',
  keywords: [
    'pricing plans',
    'subscription pricing',
    'development platform cost',
    'AI development pricing',
    'software development pricing',
    'enterprise pricing',
    'free tier',
  ],
  alternates: {
    canonical: 'https://zoptal.com/pricing',
  },
};

const pricingPlans = [
  {
    name: 'Free',
    description: 'Perfect for getting started',
    price: { monthly: 0, annual: 0 },
    badge: 'Start Free',
    badgeColor: 'secondary' as const,
    popular: false,
    features: [
      '3 projects',
      '10 deployments/month',
      '100 MB storage',
      '1 team member',
      'Community support',
      'Basic AI assistant',
      'Public repositories only',
      '24-hour build logs retention',
    ],
    limits: [
      '10,000 function invocations/month',
      '100 GB bandwidth/month',
      'Standard build performance',
    ],
    cta: 'Start Free',
    ctaVariant: 'outline' as const,
  },
  {
    name: 'Pro',
    description: 'For professional developers',
    price: { monthly: 29, annual: 290 },
    badge: 'Most Popular',
    badgeColor: 'primary' as const,
    popular: true,
    features: [
      'Unlimited projects',
      'Unlimited deployments',
      '10 GB storage',
      '5 team members',
      'Email support',
      'Advanced AI assistant',
      'Private repositories',
      '30-day build logs retention',
      'Custom domains',
      'SSL certificates',
      'Environment variables',
      'Preview deployments',
    ],
    limits: [
      '1,000,000 function invocations/month',
      '1 TB bandwidth/month',
      'Fast build performance',
      'Advanced analytics',
    ],
    cta: 'Start Pro Trial',
    ctaVariant: 'primary' as const,
  },
  {
    name: 'Team',
    description: 'For growing teams',
    price: { monthly: 99, annual: 990 },
    badge: 'Best Value',
    badgeColor: 'success' as const,
    popular: false,
    features: [
      'Everything in Pro',
      '100 GB storage',
      '20 team members',
      'Priority support',
      'AI agent training',
      'Team collaboration tools',
      'Advanced security',
      'Audit logs',
      'SAML SSO',
      'Role-based access control',
      'API rate limiting controls',
      'Custom integrations',
    ],
    limits: [
      '10,000,000 function invocations/month',
      '5 TB bandwidth/month',
      'High-performance builds',
      'Team analytics dashboard',
    ],
    cta: 'Start Team Trial',
    ctaVariant: 'primary' as const,
  },
  {
    name: 'Enterprise',
    description: 'For large organizations',
    price: { monthly: 'Custom', annual: 'Custom' },
    badge: 'Contact Sales',
    badgeColor: 'warning' as const,
    popular: false,
    features: [
      'Everything in Team',
      'Unlimited storage',
      'Unlimited team members',
      'Dedicated support manager',
      'Custom AI model training',
      'On-premise deployment',
      'Advanced compliance',
      'Custom SLA',
      'White-label options',
      'Advanced integrations',
      'Custom workflows',
      'Dedicated infrastructure',
    ],
    limits: [
      'Unlimited function invocations',
      'Unlimited bandwidth',
      'Dedicated build clusters',
      'Enterprise analytics',
      'Custom reporting',
    ],
    cta: 'Contact Sales',
    ctaVariant: 'outline' as const,
  },
];

const addOns = [
  {
    name: 'Additional Storage',
    description: 'Extra storage for your projects',
    price: '$5/GB/month',
    icon: '💾',
  },
  {
    name: 'Premium Support',
    description: '24/7 phone and chat support',
    price: '$199/month',
    icon: '🎧',
  },
  {
    name: 'Custom AI Training',
    description: 'Train AI models on your data',
    price: '$299/month',
    icon: '🧠',
  },
  {
    name: 'Dedicated Infrastructure',
    description: 'Isolated compute resources',
    price: 'Custom pricing',
    icon: '🏗️',
  },
];

const faqs = [
  {
    question: 'Can I switch plans anytime?',
    answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate any charges.',
  },
  {
    question: 'What happens if I exceed usage limits?',
    answer: 'We\'ll notify you when you approach limits. For overage, we offer automatic scaling at reasonable rates or you can upgrade your plan.',
  },
  {
    question: 'Do you offer refunds?',
    answer: 'We offer a 30-day money-back guarantee on all paid plans. Annual subscribers get a full refund within the first 30 days.',
  },
  {
    question: 'Can I get a custom enterprise plan?',
    answer: 'Absolutely! We work with enterprise customers to create custom plans that fit their specific needs and compliance requirements.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, PayPal, and can arrange invoicing for enterprise customers with purchase orders.',
  },
];

function PricingCard({ plan, isAnnual }: { plan: typeof pricingPlans[0]; isAnnual: boolean }) {
  const price = typeof plan.price.monthly === 'number' 
    ? (isAnnual ? plan.price.annual : plan.price.monthly)
    : plan.price.monthly;
  
  const savings = typeof plan.price.monthly === 'number' && isAnnual
    ? ((plan.price.monthly * 12 - plan.price.annual) / (plan.price.monthly * 12) * 100).toFixed(0)
    : null;

  return (
    <Card className={`relative p-8 ${plan.popular ? 'border-2 border-blue-500 shadow-xl' : 'border border-gray-200'}`}>
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <Badge variant={plan.badgeColor} className="px-4 py-1">
            {plan.badge}
          </Badge>
        </div>
      )}
      
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
        <p className="text-gray-600 mb-4">{plan.description}</p>
        
        <div className="mb-4">
          {typeof price === 'number' ? (
            <>
              <div className="text-4xl font-bold">
                ${price}
                {price > 0 && <span className="text-lg text-gray-500">/month</span>}
              </div>
              {isAnnual && savings && price > 0 && (
                <div className="text-sm text-green-600 font-medium">
                  Save {savings}% with annual billing
                </div>
              )}
            </>
          ) : (
            <div className="text-3xl font-bold">{price}</div>
          )}
        </div>
        
        <Button 
          variant={plan.ctaVariant} 
          size="lg" 
          className="w-full mb-6"
        >
          {plan.cta}
        </Button>
      </div>
      
      <div className="space-y-6">
        <div>
          <h4 className="font-semibold mb-3">Features</h4>
          <ul className="space-y-2">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3 text-sm">
                <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold mb-3">Usage Limits</h4>
          <ul className="space-y-2">
            {plan.limits.map((limit, index) => (
              <li key={index} className="flex items-start gap-3 text-sm text-gray-600">
                <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{limit}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-600 to-blue-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Start free and scale as you grow. No hidden fees, no surprises. 
              Cancel anytime.
            </p>
            
            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 bg-white/10 p-2 rounded-lg inline-flex">
              <span className="text-sm">Monthly</span>
              <Switch defaultChecked />
              <span className="text-sm">Annual (Save 20%)</span>
            </div>
          </div>
        </div>
      </section>
      
      {/* Pricing Cards */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-4 gap-8">
              {pricingPlans.map((plan) => (
                <PricingCard key={plan.name} plan={plan} isAnnual={true} />
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Feature Comparison */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Compare All Features
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-semibold">Features</th>
                    {pricingPlans.map((plan) => (
                      <th key={plan.name} className="text-center p-4 font-semibold">
                        {plan.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-4">Projects</td>
                    <td className="text-center p-4">3</td>
                    <td className="text-center p-4">Unlimited</td>
                    <td className="text-center p-4">Unlimited</td>
                    <td className="text-center p-4">Unlimited</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4">Team Members</td>
                    <td className="text-center p-4">1</td>
                    <td className="text-center p-4">5</td>
                    <td className="text-center p-4">20</td>
                    <td className="text-center p-4">Unlimited</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4">Storage</td>
                    <td className="text-center p-4">100 MB</td>
                    <td className="text-center p-4">10 GB</td>
                    <td className="text-center p-4">100 GB</td>
                    <td className="text-center p-4">Unlimited</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4">AI Assistant</td>
                    <td className="text-center p-4">
                      <svg className="w-5 h-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </td>
                    <td className="text-center p-4">
                      <svg className="w-5 h-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </td>
                    <td className="text-center p-4">
                      <svg className="w-5 h-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </td>
                    <td className="text-center p-4">
                      <svg className="w-5 h-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4">Priority Support</td>
                    <td className="text-center p-4">-</td>
                    <td className="text-center p-4">-</td>
                    <td className="text-center p-4">
                      <svg className="w-5 h-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </td>
                    <td className="text-center p-4">
                      <svg className="w-5 h-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
      
      {/* Add-ons */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Add-ons & Extensions
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {addOns.map((addon) => (
                <Card key={addon.name} className="p-6">
                  <div className="flex items-start gap-4">
                    <span className="text-3xl">{addon.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">{addon.name}</h3>
                      <p className="text-gray-600 mb-3">{addon.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-blue-600">
                          {addon.price}
                        </span>
                        <Button variant="outline" size="sm">
                          Add to Plan
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* FAQs */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <Card key={index} className="p-6">
                  <h3 className="font-semibold mb-3">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Enterprise CTA */}
      <section className="py-20 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Need Something More?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              We work with enterprise customers to create custom solutions that fit 
              their unique requirements and compliance needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button variant="white" size="lg">
                  Contact Sales
                </Button>
              </Link>
              <Link href="/enterprise">
                <Button variant="outline-white" size="lg">
                  Enterprise Solutions
                </Button>
              </Link>
            </div>
            
            <div className="mt-12 grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold mb-2">99.9%</div>
                <div className="text-gray-400">Uptime SLA</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">24/7</div>
                <div className="text-gray-400">Enterprise Support</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">SOC 2</div>
                <div className="text-gray-400">Type II Compliant</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}