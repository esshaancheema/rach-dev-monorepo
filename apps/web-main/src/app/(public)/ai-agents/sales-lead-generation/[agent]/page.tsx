import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

// Agent data structure for Sales & Lead Generation agents
const agentDatabase = {
  'lead-capture': {
    name: 'Intelligent Lead Capture Bot',
    subtitle: 'Multi-Channel Lead Capture Excellence',
    description: 'Capture and qualify leads automatically across all channels with intelligent conversations that convert visitors into qualified prospects.',
    metrics: {
      responseTime: '<1 second',
      languages: '100+',
      accuracy: '97%',
      integrationTime: '<30 minutes'
    },
    category: 'Sales & Lead Generation',
    capabilities: [
      {
        icon: '🎯',
        title: 'Smart Lead Capture',
        description: 'Capture leads from website visitors, social media, and multiple touchpoints with intelligent forms and conversations.'
      },
      {
        icon: '🧠',
        title: 'Real-Time Qualification',
        description: 'Instantly qualify leads using behavioral analysis, demographic data, and engagement patterns.'
      },
      {
        icon: '⚡',
        title: 'Instant Response',
        description: 'Respond to inquiries within seconds, increasing conversion rates by up to 400%.'
      },
      {
        icon: '📊',
        title: 'Lead Scoring',
        description: 'Automatically score leads based on custom criteria and route them to appropriate sales teams.'
      },
      {
        icon: '🔄',
        title: 'CRM Integration',
        description: 'Seamlessly integrate with all major CRM platforms for unified lead management.'
      },
      {
        icon: '📈',
        title: 'Conversion Analytics',
        description: 'Track conversion rates, lead quality, and campaign performance in real-time.'
      }
    ],
    techStack: {
      processing: 'Claude 3.5 Sonnet for lead qualification and conversation management',
      intentRecognition: 'Lead intent analysis with 99% accuracy',
      sentimentAnalysis: 'Purchase intent and urgency detection',
      database: 'Lead database with behavioral tracking and scoring',
      sessionManagement: 'Multi-session lead journey tracking',
      integration: 'CRM and marketing automation platform integration'
    },
    useCases: [
      {
        industry: 'Technology',
        applications: ['Software demos', 'Trial signups', 'Enterprise inquiries', 'Feature requests']
      },
      {
        industry: 'Real Estate',
        applications: ['Property inquiries', 'Viewing requests', 'Market analysis', 'Investment opportunities']
      },
      {
        industry: 'Financial Services',
        applications: ['Loan applications', 'Investment consultations', 'Insurance quotes', 'Account openings']
      },
      {
        industry: 'Healthcare',
        applications: ['Appointment booking', 'Service inquiries', 'Insurance verification', 'Treatment consultations']
      }
    ],
    features: [
      'Multi-channel lead capture',
      'Progressive lead qualification',
      'Intelligent form optimization',
      'Lead scoring automation',
      'CRM synchronization',
      'Conversion tracking',
      'A/B testing capabilities',
      'Lead nurturing sequences'
    ],
    integrations: [
      'Salesforce', 'HubSpot', 'Pipedrive', 'Zoho CRM', 'Mailchimp', 'ActiveCampaign', 'Pardot', 'Marketo'
    ],
    pricing: [
      {
        name: 'Starter',
        price: '$199/month',
        description: 'Perfect for small sales teams',
        features: [
          'Up to 500 leads/month',
          'Basic qualification',
          'CRM integration',
          'Email support',
          'Standard analytics'
        ]
      },
      {
        name: 'Professional',
        price: '$599/month',
        description: 'For growing sales organizations',
        features: [
          'Up to 5,000 leads/month',
          'Advanced qualification',
          'Multi-channel capture',
          'Priority support',
          'Advanced analytics',
          'Custom scoring models'
        ]
      },
      {
        name: 'Enterprise',
        price: 'Custom',
        description: 'Unlimited lead processing',
        features: [
          'Unlimited leads',
          'Custom integrations',
          'Dedicated success manager',
          'White-label options',
          'Advanced security',
          'Custom workflows'
        ]
      }
    ],
    successMetrics: {
      responseAccuracy: '97%',
      firstContactResolution: '84%',
      customerSatisfaction: '4.8/5',
      averageHandleTime: '<1 minute',
      costReduction: '71%',
      roiTimeline: '6-8 weeks'
    }
  },
  'lead-scoring': {
    name: 'Lead Scoring Specialist',
    subtitle: 'Advanced Scoring & Prioritization',
    description: 'Automatically score and prioritize leads using advanced AI models that analyze behavior, demographics, and engagement patterns.',
    metrics: {
      responseTime: 'Real-time',
      languages: '100+',
      accuracy: '95%',
      integrationTime: '<1 hour'
    },
    category: 'Sales & Lead Generation',
    capabilities: [
      {
        icon: '🎯',
        title: 'Multi-Factor Scoring',
        description: 'Score leads using demographic, firmographic, and behavioral data for accurate prioritization.'
      },
      {
        icon: '🔮',
        title: 'Predictive Modeling',
        description: 'Use machine learning to predict conversion probability and lifetime value.'
      },
      {
        icon: '⚡',
        title: 'Real-Time Updates',
        description: 'Continuously update lead scores as new information becomes available.'
      },
      {
        icon: '📊',
        title: 'Custom Criteria',
        description: 'Define custom scoring criteria based on your specific business requirements.'
      },
      {
        icon: '🔄',
        title: 'Dynamic Routing',
        description: 'Automatically route high-scoring leads to appropriate sales representatives.'
      },
      {
        icon: '📈',
        title: 'Performance Optimization',
        description: 'Continuously optimize scoring models based on conversion outcomes.'
      }
    ],
    // Similar structure for other properties...
  },
  'prospect-research': {
    name: 'Prospect Research Agent',
    subtitle: 'Automated Intelligence Gathering',
    description: 'Automatically research prospects and companies to provide sales teams with actionable insights and conversation starters.',
    metrics: {
      responseTime: '<2 minutes',
      languages: '50+',
      accuracy: '94%',
      integrationTime: '<45 minutes'
    },
    category: 'Sales & Lead Generation',
    // Similar structure...
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
      'sales automation',
      'lead generation AI',
      'sales acceleration'
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
      <section className="bg-gradient-to-br from-green-900 via-blue-900 to-indigo-900 text-white py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 bg-white/20 text-white">
              {agent.category} AI Agent
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              {agent.name}
            </h1>
            <p className="text-2xl text-green-200 mb-8">
              {agent.subtitle}
            </p>
            <p className="text-xl text-gray-300 mb-10 max-w-4xl mx-auto">
              {agent.description}
            </p>
            
            {/* Key Metrics */}
            <div className="grid md:grid-cols-4 gap-6 mb-12">
              <Card className="p-4 bg-white/10 backdrop-blur border-white/20">
                <div className="text-2xl font-bold text-green-400 mb-1">{agent.metrics.responseTime}</div>
                <div className="text-gray-300 text-sm">Response Time</div>
              </Card>
              <Card className="p-4 bg-white/10 backdrop-blur border-white/20">
                <div className="text-2xl font-bold text-blue-400 mb-1">{agent.metrics.languages}</div>
                <div className="text-gray-300 text-sm">Languages</div>
              </Card>
              <Card className="p-4 bg-white/10 backdrop-blur border-white/20">
                <div className="text-2xl font-bold text-cyan-400 mb-1">{agent.metrics.accuracy}</div>
                <div className="text-gray-300 text-sm">Accuracy</div>
              </Card>
              <Card className="p-4 bg-white/10 backdrop-blur border-white/20">
                <div className="text-2xl font-bold text-indigo-400 mb-1">{agent.metrics.integrationTime}</div>
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
                Advanced sales AI powered by Claude 3.5 Sonnet
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12">
              <Card className="p-8">
                <h3 className="text-2xl font-bold mb-6 text-green-600">Technology Stack</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Lead Processing</h4>
                    <p className="text-gray-600 text-sm">{agent.techStack.processing}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Intent Analysis</h4>
                    <p className="text-gray-600 text-sm">{agent.techStack.intentRecognition}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Sentiment Detection</h4>
                    <p className="text-gray-600 text-sm">{agent.techStack.sentimentAnalysis}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Lead Database</h4>
                    <p className="text-gray-600 text-sm">{agent.techStack.database}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-8">
                <h3 className="text-2xl font-bold mb-6 text-blue-600">Key Features</h3>
                <div className="space-y-3">
                  {agent.features.slice(0, 6).map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
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
                Accelerate sales across industries
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {agent.useCases.map((useCase, index) => (
                <Card key={index} className="p-8">
                  <h3 className="text-xl font-bold mb-4 text-green-600">{useCase.industry}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {useCase.applications.map((app, appIndex) => (
                      <div key={appIndex} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
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
                Scale your sales operations
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {agent.pricing.map((plan, index) => (
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

      {/* Success Metrics */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">Success Metrics</h2>
              <p className="text-xl text-gray-600">Proven sales acceleration results</p>
            </div>
            
            <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6">
              <Card className="p-6 text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">{agent.successMetrics.responseAccuracy}</div>
                <div className="text-gray-600 text-sm">Lead Quality</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">{agent.successMetrics.firstContactResolution}</div>
                <div className="text-gray-600 text-sm">Conversion Rate</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-2xl font-bold text-cyan-600 mb-2">{agent.successMetrics.customerSatisfaction}</div>
                <div className="text-gray-600 text-sm">Customer Satisfaction</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-2xl font-bold text-indigo-600 mb-2">{agent.successMetrics.averageHandleTime}</div>
                <div className="text-gray-600 text-sm">Response Time</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-2">{agent.successMetrics.costReduction}</div>
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
              <p className="text-xl text-gray-600">Connect with your sales stack</p>
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
                <h3 className="text-lg font-bold mb-3">How quickly does the agent respond to leads?</h3>
                <p className="text-gray-600">Lead responses are automated within 1 second of inquiry, significantly improving conversion rates compared to manual processes.</p>
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-3">Can it integrate with our existing CRM?</h3>
                <p className="text-gray-600">Yes, we support all major CRM platforms including Salesforce, HubSpot, Pipedrive, and custom solutions via API.</p>
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-3">How accurate is the lead qualification?</h3>
                <p className="text-gray-600">Our AI achieves 97% accuracy in lead qualification using advanced behavioral analysis and customizable scoring criteria.</p>
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-3">Can we customize the qualification criteria?</h3>
                <p className="text-gray-600">Yes, all qualification criteria, scoring models, and routing rules can be fully customized to match your sales process.</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Accelerate Your Sales Pipeline?
            </h2>
            <p className="text-xl text-green-100 mb-8">
              Start converting more leads with the {agent.name} today.
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
              <Link href="/ai-agents/sales-lead-generation">
                <Button variant="outline">Browse Sales & Lead Generation Agents</Button>
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