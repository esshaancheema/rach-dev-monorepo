import { Metadata } from 'next';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Customer Support AI Agents | 24/7 Intelligent Customer Service | Zoptal',
  description: 'Transform your customer service with AI agents that deliver instant responses, multilingual support, and 94% customer satisfaction. Handle thousands of conversations simultaneously.',
  keywords: [
    'customer support AI agents',
    'AI customer service',
    'intelligent help desk',
    '24/7 customer support',
    'multilingual support agents',
    'automated customer service',
    'AI chatbots for support',
    'customer experience automation',
    'AI-powered help desk',
    'customer support automation'
  ],
  openGraph: {
    title: 'Customer Support AI Agents | Intelligent 24/7 Customer Service',
    description: 'Deliver exceptional customer experiences with AI agents that understand, respond, and resolve inquiries instantly. Response time <1 second, 94% satisfaction.',
    images: ['/images/ai-agents/customer-support-og.png'],
  },
};

const keyBenefits = [
  {
    icon: '🚀',
    title: 'Instant Response Times',
    description: 'Eliminate wait times with agents that respond in milliseconds, handling thousands of conversations simultaneously.'
  },
  {
    icon: '💡',
    title: 'Intelligent Understanding', 
    description: 'Natural language processing ensures agents understand context, intent, and sentiment for human-like interactions.'
  },
  {
    icon: '🌍',
    title: 'Multilingual Support',
    description: 'Communicate fluently in 100+ languages with automatic translation and cultural awareness.'
  },
  {
    icon: '📈',
    title: 'Scalable Operations',
    description: 'Handle peak volumes without additional staffing, automatically scaling to meet demand.'
  },
  {
    icon: '🔄',
    title: 'Continuous Learning',
    description: 'Agents improve with every interaction, learning from resolutions and customer feedback.'
  },
  {
    icon: '💰',
    title: 'Cost Reduction',
    description: 'Reduce support costs by up to 70% while improving customer satisfaction scores.'
  }
];

const supportAgents = [
  {
    category: 'General Support Agents',
    agents: [
      {
        name: 'Universal Help Desk Agent',
        description: 'All-purpose support agent for general inquiries, FAQs, and basic troubleshooting.',
        features: ['Multi-channel support (chat, email, voice)', 'Knowledge base integration', 'Ticket creation and routing'],
        href: '/ai-agents/customer-support/universal-helpdesk'
      },
      {
        name: 'Tier 1 Support Specialist',
        description: 'First-line support for common issues with intelligent escalation capabilities.',
        features: ['Issue categorization', 'Basic troubleshooting', 'Smart escalation rules'],
        href: '/ai-agents/customer-support/tier1-specialist'
      },
      {
        name: '24/7 Virtual Assistant',
        description: 'Round-the-clock support agent for global customer bases.',
        features: ['Time zone awareness', 'After-hours handling', 'Emergency escalation'],
        href: '/ai-agents/customer-support/24-7-assistant'
      }
    ]
  },
  {
    category: 'E-commerce Support Agents',
    agents: [
      {
        name: 'Order Management Agent',
        description: 'Specialized in order tracking, modifications, and shipping inquiries.',
        features: ['Real-time order status', 'Shipping updates', 'Address modifications'],
        href: '/ai-agents/customer-support/order-management'
      },
      {
        name: 'Returns & Refunds Processor',
        description: 'Handles return requests, refund processing, and exchange management.',
        features: ['Return policy enforcement', 'RMA generation', 'Refund status tracking'],
        href: '/ai-agents/customer-support/returns-refunds'
      },
      {
        name: 'Product Information Specialist',
        description: 'Provides detailed product information, comparisons, and recommendations.',
        features: ['Inventory checking', 'Product specifications', 'Personalized recommendations'],
        href: '/ai-agents/customer-support/product-specialist'
      },
      {
        name: 'Shopping Cart Recovery Agent',
        description: 'Re-engages customers with abandoned carts and provides purchase assistance.',
        features: ['Cart abandonment detection', 'Personalized incentives', 'Checkout assistance'],
        href: '/ai-agents/customer-support/cart-recovery'
      }
    ]
  },
  {
    category: 'Technical Support Agents',
    agents: [
      {
        name: 'IT Help Desk Agent',
        description: 'Technical troubleshooting for software, hardware, and network issues.',
        features: ['Diagnostic workflows', 'Remote assistance initiation', 'Solution documentation'],
        href: '/ai-agents/customer-support/it-helpdesk'
      },
      {
        name: 'Software Support Specialist',
        description: 'Specialized support for software applications and platforms.',
        features: ['Bug report processing', 'Feature guidance', 'Version compatibility'],
        href: '/ai-agents/customer-support/software-specialist'
      },
      {
        name: 'Mobile App Support Agent',
        description: 'Dedicated support for mobile application issues and guidance.',
        features: ['App troubleshooting', 'Feature walkthroughs', 'Update notifications'],
        href: '/ai-agents/customer-support/mobile-support'
      }
    ]
  }
];

const pricingPlans = [
  {
    name: 'Starter',
    price: '$199/month',
    description: 'For small businesses and startups',
    features: [
      'Up to 1,000 conversations/month',
      '2 communication channels',
      'Basic integrations',
      'Email support',
      '1 AI support agent'
    ]
  },
  {
    name: 'Professional',
    price: '$599/month',
    description: 'For growing businesses',
    features: [
      'Up to 10,000 conversations/month',
      'Unlimited channels',
      'Advanced integrations',
      'Priority support',
      '5 AI support agents',
      'Custom training'
    ]
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large organizations',
    features: [
      'Unlimited conversations',
      'Custom agents',
      'Dedicated support',
      'SLA guarantee',
      'White-label options',
      'Advanced analytics'
    ]
  }
];

export default function CustomerSupportAgentsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 bg-white/20 text-white">
              Customer Support AI Agents
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-8">
              Transform Your Customer Service
              <span className="block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                with Intelligent AI Agents
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-10 max-w-4xl mx-auto">
              Deliver exceptional customer experiences 24/7 with AI agents that understand, respond, 
              and resolve customer inquiries instantly. Our customer support agents are trained on 
              millions of interactions and can handle complex queries across multiple channels.
            </p>
            
            {/* Key Metrics */}
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card className="p-6 bg-white/10 backdrop-blur border-white/20">
                <div className="text-3xl font-bold text-cyan-400 mb-2">&lt;1 second</div>
                <div className="text-gray-300">Average Response Time</div>
              </Card>
              <Card className="p-6 bg-white/10 backdrop-blur border-white/20">
                <div className="text-3xl font-bold text-green-400 mb-2">87%</div>
                <div className="text-gray-300">Resolution Rate</div>
              </Card>
              <Card className="p-6 bg-white/10 backdrop-blur border-white/20">
                <div className="text-3xl font-bold text-blue-400 mb-2">94%</div>
                <div className="text-gray-300">Customer Satisfaction</div>
              </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="white" size="lg" className="text-lg px-8 py-4">
                Build Custom Agent
              </Button>
              <Button variant="outline-white" size="lg" className="text-lg px-8 py-4">
                Browse Pre-Built Agents
              </Button>
              <Button variant="outline-white" size="lg" className="text-lg px-8 py-4">
                See Demo
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
                Why Customer Support AI Agents?
              </h2>
              <p className="text-xl text-gray-600">
                Transform your customer service with intelligent automation
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
                Comprehensive List of Customer Support AI Agents
              </h2>
              <p className="text-xl text-gray-600">
                Specialized agents for every aspect of customer service
              </p>
            </div>

            {supportAgents.map((category, categoryIndex) => (
              <div key={categoryIndex} className="mb-16">
                <h3 className="text-2xl font-bold mb-8 text-gray-900">
                  {categoryIndex + 1}. {category.category}
                </h3>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.agents.map((agent, agentIndex) => (
                    <Card key={agentIndex} className="p-6 hover:shadow-lg transition-shadow">
                      <h4 className="text-lg font-bold mb-3 text-blue-600">{agent.name}</h4>
                      <p className="text-gray-600 mb-4">{agent.description}</p>
                      
                      <div className="space-y-2 mb-4">
                        {agent.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
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
                Choose Your Support Power
              </h2>
              <p className="text-xl text-gray-600">
                Flexible plans for businesses of all sizes
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {pricingPlans.map((plan, index) => (
                <Card key={index} className={`p-8 ${index === 1 ? 'ring-2 ring-blue-500 transform scale-105' : ''}`}>
                  {index === 1 && (
                    <Badge variant="primary" className="mb-4">Most Popular</Badge>
                  )}
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="text-3xl font-bold text-blue-600 mb-2">{plan.price}</div>
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
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Transform Your Customer Support?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of businesses delivering exceptional customer experiences with AI agents.
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
                <div className="text-3xl font-bold mb-2">10K+</div>
                <div className="text-blue-200">Support Agents Deployed</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">99.9%</div>
                <div className="text-blue-200">Platform Uptime</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">24/7</div>
                <div className="text-blue-200">Customer Coverage</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}