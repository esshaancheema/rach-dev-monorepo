import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

// Agent data structure based on Universal_Helpdesk_Agent_Page.md
const agentDatabase = {
  'live-chat-bot': {
    name: 'AI-Powered Live Chat Bot',
    subtitle: 'Instant Customer Engagement & Support',
    description: 'Engage website visitors instantly with intelligent conversations that convert prospects and resolve customer queries 24/7.',
    metrics: {
      responseTime: '<2 seconds',
      languages: '100+',
      accuracy: '96%',
      integrationTime: '<1 hour'
    },
    category: 'Customer Support',
    capabilities: [
      {
        icon: '💬',
        title: 'Instant Engagement',
        description: 'Engage website visitors within seconds with personalized greetings and relevant conversation starters.'
      },
      {
        icon: '🧠',
        title: 'Context Understanding',
        description: 'Understands conversation context and maintains coherent, helpful dialogue throughout the interaction.'
      },
      {
        icon: '🎯',
        title: 'Lead Qualification',
        description: 'Automatically qualifies leads through intelligent questioning and routes to appropriate sales teams.'
      },
      {
        icon: '📊',
        title: 'Real-time Analytics',
        description: 'Track conversation metrics, customer satisfaction, and conversion rates in real-time.'
      },
      {
        icon: '🔗',
        title: 'CRM Integration',
        description: 'Seamlessly integrates with popular CRM platforms to log conversations and update customer records.'
      },
      {
        icon: '🌐',
        title: 'Multilingual Support',
        description: 'Communicates fluently in over 100 languages with automatic language detection and translation.'
      }
    ],
    techStack: {
      processing: 'Claude 3.5 Sonnet for natural language understanding',
      intentRecognition: 'Custom-trained classifier with 98% accuracy',
      sentimentAnalysis: 'Real-time emotion and satisfaction detection',
      database: 'ChromaDB for semantic search and conversation history',
      sessionManagement: 'Redis for conversation continuity and context',
      integration: 'REST API, WebSocket, and SDK support'
    },
    useCases: [
      {
        industry: 'E-Commerce',
        applications: ['Product inquiries', 'Order assistance', 'Return processes', 'Shopping guidance']
      },
      {
        industry: 'SaaS',
        applications: ['Feature explanations', 'Trial conversions', 'Technical support', 'Onboarding assistance']
      },
      {
        industry: 'Healthcare',
        applications: ['Appointment scheduling', 'General inquiries', 'Insurance verification', 'Symptom triage']
      },
      {
        industry: 'Financial Services',
        applications: ['Account inquiries', 'Service information', 'Application assistance', 'General banking']
      }
    ],
    features: [
      'Multi-turn conversations with context retention',
      'Rich media support (images, videos, documents)',
      'Interactive elements (buttons, quick replies)',
      'Proactive engagement triggers',
      'Conversation handoff to human agents',
      'Custom branding and styling',
      'A/B testing capabilities',
      'Performance analytics dashboard'
    ],
    integrations: [
      'Salesforce', 'HubSpot', 'Zendesk', 'Intercom', 'Slack', 'WhatsApp', 'Shopify', 'WordPress'
    ],
    pricing: [
      {
        name: 'Starter',
        price: '$199/month',
        description: 'Perfect for small websites',
        features: [
          'Up to 1,000 conversations/month',
          'Basic customization',
          'Email support',
          '2 integrations included',
          'Standard analytics'
        ]
      },
      {
        name: 'Professional',
        price: '$599/month',
        description: 'For growing businesses',
        features: [
          'Up to 10,000 conversations/month',
          'Advanced customization',
          'Priority support',
          'Unlimited integrations',
          'Advanced analytics',
          'A/B testing'
        ]
      },
      {
        name: 'Enterprise',
        price: 'Custom',
        description: 'Unlimited scale',
        features: [
          'Unlimited conversations',
          'White-label options',
          'Dedicated support manager',
          'Custom features',
          'SLA guarantee',
          'Advanced security'
        ]
      }
    ],
    successMetrics: {
      responseAccuracy: '96%',
      firstContactResolution: '78%',
      customerSatisfaction: '4.8/5',
      averageHandleTime: '30 seconds',
      costReduction: '72%',
      roiTimeline: '2-3 months'
    }
  },
  'ticket-management': {
    name: 'Intelligent Ticket Management System',
    subtitle: 'Automated Ticket Routing & Resolution',
    description: 'Streamline support operations with AI-powered ticket classification, routing, and automated resolution capabilities.',
    metrics: {
      responseTime: '<1 minute',
      languages: '100+',
      accuracy: '94%',
      integrationTime: '<2 hours'
    },
    category: 'Customer Support',
    capabilities: [
      {
        icon: '🎯',
        title: 'Smart Classification',
        description: 'Automatically categorizes and prioritizes tickets based on content, urgency, and customer tier.'
      },
      {
        icon: '🔄',
        title: 'Intelligent Routing',
        description: 'Routes tickets to the most qualified agent based on expertise, workload, and availability.'
      },
      {
        icon: '⚡',
        title: 'Auto-Resolution',
        description: 'Resolves common issues automatically using knowledge base and previous successful resolutions.'
      },
      {
        icon: '📊',
        title: 'Performance Analytics',
        description: 'Track resolution times, agent performance, and customer satisfaction metrics in real-time.'
      },
      {
        icon: '🔔',
        title: 'Escalation Management',
        description: 'Automatically escalates tickets based on SLA breaches or complexity thresholds.'
      },
      {
        icon: '📚',
        title: 'Knowledge Integration',
        description: 'Integrates with knowledge bases to suggest solutions and auto-populate responses.'
      }
    ],
    // ... similar structure for other properties
    useCases: [
      {
        industry: 'Technology',
        applications: ['Bug reports', 'Feature requests', 'Technical issues', 'Account problems']
      },
      {
        industry: 'E-Commerce',
        applications: ['Order issues', 'Returns', 'Payment problems', 'Product questions']
      },
      {
        industry: 'Healthcare',
        applications: ['Appointment requests', 'Billing inquiries', 'Technical support', 'General questions']
      }
    ],
    // ... rest of the structure similar to live-chat-bot
  },
  'help-desk-automation': {
    name: 'Complete Help Desk Automation',
    subtitle: 'End-to-End Support Automation',
    description: 'Transform your entire help desk operation with comprehensive AI automation that handles 80% of customer inquiries without human intervention.',
    metrics: {
      responseTime: '<500ms',
      languages: '100+',
      accuracy: '94%',
      integrationTime: '<2 hours'
    },
    category: 'Customer Support',
    // ... similar structure
  }
};

interface Props {
  params: {
    agent: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const agent = agentDatabase[params.agent as keyof typeof agentDatabase];
  
  if (!agent) {
    return {
      title: 'Agent Not Found | Zoptal AI Agents',
      description: 'The requested AI agent could not be found.'
    };
  }

  return {
    title: `${agent.name} | ${agent.category} AI Agent | Zoptal`,
    description: agent.description,
    keywords: [
      agent.name.toLowerCase(),
      `${agent.category.toLowerCase()} AI agent`,
      'customer support automation',
      'AI customer service',
      'automated support system'
    ],
    openGraph: {
      title: `${agent.name} | Transform Your ${agent.category}`,
      description: agent.description,
      images: [`/images/ai-agents/${params.agent}-og.png`],
    },
  };
}

export async function generateStaticParams() {
  return Object.keys(agentDatabase).map((agent) => ({
    agent,
  }));
}

export default function AgentDetailPage({ params }: Props) {
  const agent = agentDatabase[params.agent as keyof typeof agentDatabase];

  if (!agent) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 bg-white/20 text-white">
              {agent.category} AI Agent
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              {agent.name}
            </h1>
            <p className="text-2xl text-blue-200 mb-8">
              {agent.subtitle}
            </p>
            <p className="text-xl text-gray-300 mb-10 max-w-4xl mx-auto">
              {agent.description}
            </p>
            
            {/* Key Metrics */}
            <div className="grid md:grid-cols-4 gap-6 mb-12">
              <Card className="p-4 bg-white/10 backdrop-blur border-white/20">
                <div className="text-2xl font-bold text-blue-400 mb-1">{agent.metrics.responseTime}</div>
                <div className="text-gray-300 text-sm">Response Time</div>
              </Card>
              <Card className="p-4 bg-white/10 backdrop-blur border-white/20">
                <div className="text-2xl font-bold text-indigo-400 mb-1">{agent.metrics.languages}</div>
                <div className="text-gray-300 text-sm">Languages</div>
              </Card>
              <Card className="p-4 bg-white/10 backdrop-blur border-white/20">
                <div className="text-2xl font-bold text-purple-400 mb-1">{agent.metrics.accuracy}</div>
                <div className="text-gray-300 text-sm">Accuracy</div>
              </Card>
              <Card className="p-4 bg-white/10 backdrop-blur border-white/20">
                <div className="text-2xl font-bold text-pink-400 mb-1">{agent.metrics.integrationTime}</div>
                <div className="text-gray-300 text-sm">Setup Time</div>
              </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="white" size="lg" className="text-lg px-8 py-4">
                Deploy Now
              </Button>
              <Button variant="outline-white" size="lg" className="text-lg px-8 py-4">
                Try Demo
              </Button>
              <Button variant="outline-white" size="lg" className="text-lg px-8 py-4">
                Download Specs
              </Button>
              <Button variant="outline-white" size="lg" className="text-lg px-8 py-4">
                Contact Team
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* What is this Agent */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">
                What is the {agent.name}?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {agent.description}
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {agent.capabilities.map((capability, index) => (
                <Card key={index} className="p-8 text-center hover:shadow-lg transition-shadow">
                  <div className="text-4xl mb-4">{capability.icon}</div>
                  <h3 className="text-xl font-bold mb-4">{capability.title}</h3>
                  <p className="text-gray-600">{capability.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">How It Works</h2>
              <p className="text-xl text-gray-600">
                Advanced AI architecture powered by Claude 3.5 Sonnet
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12">
              <Card className="p-8">
                <h3 className="text-2xl font-bold mb-6 text-blue-600">Technology Stack</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Natural Language Processing</h4>
                    <p className="text-gray-600 text-sm">{agent.techStack.processing}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Intent Recognition</h4>
                    <p className="text-gray-600 text-sm">{agent.techStack.intentRecognition}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Sentiment Analysis</h4>
                    <p className="text-gray-600 text-sm">{agent.techStack.sentimentAnalysis}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Data Storage</h4>
                    <p className="text-gray-600 text-sm">{agent.techStack.database}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-8">
                <h3 className="text-2xl font-bold mb-6 text-indigo-600">Key Features</h3>
                <div className="space-y-3">
                  {agent.features.slice(0, 6).map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">Use Cases & Applications</h2>
              <p className="text-xl text-gray-600">
                Versatile applications across industries
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {agent.useCases.map((useCase, index) => (
                <Card key={index} className="p-8">
                  <h3 className="text-xl font-bold mb-4 text-purple-600">{useCase.industry}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {useCase.applications.map((app, appIndex) => (
                      <div key={appIndex} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                        <span className="text-gray-700 text-sm">{app}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">Pricing & Plans</h2>
              <p className="text-xl text-gray-600">
                Choose the perfect plan for your needs
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {agent.pricing.map((plan, index) => (
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

      {/* Success Metrics */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">Success Metrics</h2>
              <p className="text-xl text-gray-600">Real-world performance data</p>
            </div>
            
            <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6">
              <Card className="p-6 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">{agent.successMetrics.responseAccuracy}</div>
                <div className="text-gray-600 text-sm">Response Accuracy</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">{agent.successMetrics.firstContactResolution}</div>
                <div className="text-gray-600 text-sm">First Contact Resolution</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-2">{agent.successMetrics.customerSatisfaction}</div>
                <div className="text-gray-600 text-sm">Customer Satisfaction</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-2xl font-bold text-indigo-600 mb-2">{agent.successMetrics.averageHandleTime}</div>
                <div className="text-gray-600 text-sm">Avg Handle Time</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-2xl font-bold text-cyan-600 mb-2">{agent.successMetrics.costReduction}</div>
                <div className="text-gray-600 text-sm">Cost Reduction</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-2xl font-bold text-pink-600 mb-2">{agent.successMetrics.roiTimeline}</div>
                <div className="text-gray-600 text-sm">ROI Timeline</div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Partners */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">Integration Partners</h2>
              <p className="text-xl text-gray-600">Seamlessly connects with your existing tools</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
              {agent.integrations.map((integration, index) => (
                <Card key={index} className="p-4 text-center hover:shadow-md transition-shadow">
                  <div className="text-sm font-medium text-gray-700">{integration}</div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">Frequently Asked Questions</h2>
            </div>
            
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-3">How quickly can the agent be deployed?</h3>
                <p className="text-gray-600">Basic deployment takes 1-2 hours. Custom configurations typically require 1-2 weeks depending on complexity.</p>
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-3">Can it handle multiple languages?</h3>
                <p className="text-gray-600">Yes, the agent supports 100+ languages with automatic detection and translation capabilities.</p>
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-3">What happens when the agent can't answer?</h3>
                <p className="text-gray-600">It seamlessly escalates to human agents with full conversation context and relevant information.</p>
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-3">Can we modify the agent after deployment?</h3>
                <p className="text-gray-600">Yes, the agent can be continuously updated and improved through our intuitive dashboard interface.</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Transform Your {agent.category}?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Deploy the {agent.name} and start delivering exceptional customer experiences today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button variant="white" size="lg" className="text-lg px-8 py-4">
                Start Free Trial
              </Button>
              <Button variant="outline-white" size="lg" className="text-lg px-8 py-4">
                Schedule Demo
              </Button>
              <Button variant="outline-white" size="lg" className="text-lg px-8 py-4">
                Download Full Specs
              </Button>
              <Button variant="outline-white" size="lg" className="text-lg px-8 py-4">
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/ai-agents">
                <Button variant="outline">← Back to AI Agents</Button>
              </Link>
              <Link href="/ai-agents/customer-support">
                <Button variant="outline">Browse Customer Support Agents</Button>
              </Link>
              <Link href="/ai-agents">
                <Button variant="outline">View All Categories</Button>
              </Link>
            </div>
            
            <div className="mt-8 text-gray-600">
              <p>Questions? Contact us at <strong>ai-agents@zoptal.com</strong> or call <strong>1-800-ZOPTAL-AI</strong></p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}