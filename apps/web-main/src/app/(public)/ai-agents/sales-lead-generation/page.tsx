import { Metadata } from 'next';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Sales & Lead Generation AI Agents | Accelerate Revenue Growth | Zoptal',
  description: 'Accelerate your sales pipeline with AI agents that qualify leads, nurture prospects, and drive conversions. Response time <1 minute, 47% conversion increase, 63% cost reduction.',
  keywords: [
    'sales AI agents',
    'lead generation automation',
    'AI sales assistants',
    'prospect nurturing',
    'sales funnel optimization',
    'CRM automation',
    'lead scoring AI',
    'sales pipeline management',
    'conversion optimization',
    'automated follow-ups'
  ],
  openGraph: {
    title: 'Sales & Lead Generation AI Agents | Accelerate Revenue Growth',
    description: 'Transform your sales process with AI agents that identify, qualify, nurture, and convert leads at scale.',
    images: ['/images/ai-agents/sales-lead-generation-og.png'],
  },
};

const keyBenefits = [
  {
    icon: '⚡',
    title: 'Instant Lead Response',
    description: 'Engage prospects within seconds of their interest, increasing conversion rates by up to 400%.'
  },
  {
    icon: '🎯',
    title: 'Intelligent Qualification',
    description: 'AI-powered lead scoring and qualification based on behavior, demographics, and intent signals.'
  },
  {
    icon: '📈',
    title: 'Scalable Outreach',
    description: 'Manage thousands of personalized conversations simultaneously across multiple channels.'
  },
  {
    icon: '🔄',
    title: 'Automated Nurturing',
    description: 'Keep leads warm with personalized follow-ups based on engagement and buying stage.'
  },
  {
    icon: '💡',
    title: 'Predictive Analytics',
    description: 'Identify high-value opportunities and optimal engagement times using AI predictions.'
  },
  {
    icon: '🤝',
    title: 'Seamless Handoff',
    description: 'Warm transfer qualified leads to sales reps with complete context and insights.'
  }
];

const salesAgents = [
  {
    category: 'Lead Capture & Qualification Agents',
    agents: [
      {
        name: 'Intelligent Lead Capture Bot',
        description: 'Multi-channel lead capture with real-time qualification and routing.',
        features: ['Website visitor engagement', 'Form optimization', 'Progressive profiling', 'Intent detection'],
        href: '/ai-agents/sales-lead-generation/lead-capture'
      },
      {
        name: 'Lead Scoring Specialist',
        description: 'Advanced scoring based on demographic, firmographic, and behavioral data.',
        features: ['Multi-factor scoring', 'Predictive modeling', 'Real-time updates', 'Custom criteria'],
        href: '/ai-agents/sales-lead-generation/lead-scoring'
      },
      {
        name: 'Prospect Research Agent',
        description: 'Automated prospect research and intelligence gathering.',
        features: ['Company intelligence', 'Contact enrichment', 'Social insights', 'Competitive analysis'],
        href: '/ai-agents/sales-lead-generation/prospect-research'
      }
    ]
  },
  {
    category: 'Outreach & Engagement Agents',
    agents: [
      {
        name: 'Email Outreach Automation',
        description: 'Personalized email sequences with intelligent follow-ups.',
        features: ['Sequence optimization', 'A/B testing', 'Response tracking', 'Deliverability optimization'],
        href: '/ai-agents/sales-lead-generation/email-outreach'
      },
      {
        name: 'Social Selling Assistant',
        description: 'LinkedIn and social media outreach automation.',
        features: ['Connection requests', 'Message sequences', 'Content sharing', 'Relationship building'],
        href: '/ai-agents/sales-lead-generation/social-selling'
      },
      {
        name: 'Cold Calling Coordinator',
        description: 'Intelligent call scheduling and preparation assistant.',
        features: ['Optimal timing', 'Call preparation', 'Script optimization', 'Follow-up coordination'],
        href: '/ai-agents/sales-lead-generation/cold-calling'
      }
    ]
  },
  {
    category: 'Conversion & Pipeline Agents',
    agents: [
      {
        name: 'Demo Scheduling Agent',
        description: 'Automated demo booking with intelligent qualification.',
        features: ['Calendar integration', 'Qualification questions', 'Confirmation automation', 'No-show prevention'],
        href: '/ai-agents/sales-lead-generation/demo-scheduling'
      },
      {
        name: 'Proposal Generation Bot',
        description: 'Automated proposal and quote creation based on requirements.',
        features: ['Dynamic pricing', 'Custom proposals', 'Approval workflows', 'E-signature integration'],
        href: '/ai-agents/sales-lead-generation/proposal-generation'
      },
      {
        name: 'Deal Pipeline Manager',
        description: 'Automated pipeline management and opportunity tracking.',
        features: ['Stage progression', 'Activity reminders', 'Forecast updates', 'Risk assessment'],
        href: '/ai-agents/sales-lead-generation/pipeline-manager'
      }
    ]
  }
];

const pricingPlans = [
  {
    name: 'Starter',
    price: '$299/month',
    description: 'For small sales teams',
    features: [
      'Up to 500 leads/month',
      '2 sales agents',
      'Basic CRM integration',
      'Email support',
      'Standard reporting'
    ]
  },
  {
    name: 'Professional',
    price: '$899/month',
    description: 'For growing sales organizations',
    features: [
      'Up to 5,000 leads/month',
      '10 sales agents',
      'Advanced integrations',
      'Priority support',
      'Custom sequences',
      'Analytics dashboard'
    ]
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large sales operations',
    features: [
      'Unlimited leads',
      'Unlimited agents',
      'Custom development',
      'Dedicated success manager',
      'Advanced analytics',
      'API access'
    ]
  }
];

export default function SalesLeadGenerationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-900 via-blue-900 to-indigo-900 text-white py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 bg-white/20 text-white">
              Sales & Lead Generation AI Agents
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-8">
              Accelerate Your Revenue Growth with
              <span className="block bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                Intelligent Sales Automation
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-10 max-w-4xl mx-auto">
              Transform your sales process with AI agents that identify, qualify, nurture, and convert leads at scale. 
              Our sales agents work 24/7 to fill your pipeline with qualified opportunities while your team focuses on closing deals.
            </p>
            
            {/* Key Metrics */}
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card className="p-6 bg-white/10 backdrop-blur border-white/20">
                <div className="text-3xl font-bold text-green-400 mb-2">&lt;1 minute</div>
                <div className="text-gray-300">Lead Response Time</div>
              </Card>
              <Card className="p-6 bg-white/10 backdrop-blur border-white/20">
                <div className="text-3xl font-bold text-blue-400 mb-2">+47%</div>
                <div className="text-gray-300">Conversion Rate Increase</div>
              </Card>
              <Card className="p-6 bg-white/10 backdrop-blur border-white/20">
                <div className="text-3xl font-bold text-cyan-400 mb-2">63%</div>
                <div className="text-gray-300">Cost Per Lead Reduction</div>
              </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="white" size="lg" className="text-lg px-8 py-4">
                Build Custom Sales Agent
              </Button>
              <Button variant="outline-white" size="lg" className="text-lg px-8 py-4">
                Browse Pre-Built Agents
              </Button>
              <Button variant="outline-white" size="lg" className="text-lg px-8 py-4">
                See ROI Calculator
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">
                Why Sales & Lead Generation AI Agents?
              </h2>
              <p className="text-xl text-gray-600">
                Accelerate your revenue with intelligent sales automation
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {keyBenefits.map((benefit, index) => (
                <Card key={index} className="p-8 text-center hover:shadow-lg transition-shadow">
                  <div className="text-4xl mb-4">{benefit.icon}</div>
                  <h3 className="text-xl font-bold mb-4">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Comprehensive Agent List */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">
                Comprehensive List of Sales & Lead Generation AI Agents
              </h2>
              <p className="text-xl text-gray-600">
                Specialized agents for every stage of the sales funnel
              </p>
            </div>

            {salesAgents.map((category, categoryIndex) => (
              <div key={categoryIndex} className="mb-16">
                <h3 className="text-2xl font-bold mb-8 text-gray-900">
                  {categoryIndex + 1}. {category.category}
                </h3>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.agents.map((agent, agentIndex) => (
                    <Card key={agentIndex} className="p-6 hover:shadow-lg transition-shadow">
                      <h4 className="text-lg font-bold mb-3 text-green-600">{agent.name}</h4>
                      <p className="text-gray-600 mb-4">{agent.description}</p>
                      
                      <div className="space-y-2 mb-4">
                        {agent.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-sm text-gray-700">{feature}</span>
                          </div>
                        ))}
                      </div>
                      
                      <Link href={agent.href}>
                        <Button variant="outline" className="w-full">
                          View Details →
                        </Button>
                      </Link>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">
                Choose Your Sales Power
              </h2>
              <p className="text-xl text-gray-600">
                Flexible plans for sales teams of all sizes
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {pricingPlans.map((plan, index) => (
                <Card key={index} className={`p-8 ${index === 1 ? 'ring-2 ring-green-500 transform scale-105' : ''}`}>
                  {index === 1 && (
                    <Badge variant="primary" className="mb-4">Most Popular</Badge>
                  )}
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="text-3xl font-bold text-green-600 mb-2">{plan.price}</div>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  
                  <div className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button variant={index === 1 ? 'primary' : 'outline'} className="w-full">
                    {plan.price === 'Custom' ? 'Contact Sales' : 'Start Free Trial'}
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Accelerate Your Sales Pipeline?
            </h2>
            <p className="text-xl text-green-100 mb-8">
              Transform your sales process with intelligent AI agents that work 24/7 to convert leads into customers.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button variant="white" size="lg" className="text-lg px-8 py-4">
                Start Building Free
              </Button>
              <Button variant="outline-white" size="lg" className="text-lg px-8 py-4">
                Schedule Demo
              </Button>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="text-3xl font-bold mb-2">1M+</div>
                <div className="text-green-200">Leads Processed</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">400%</div>
                <div className="text-green-200">Response Rate Improvement</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">24/7</div>
                <div className="text-green-200">Lead Engagement</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}