import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

// Agent data structure for Data Analysis agents
const agentDatabase = {
  'executive-dashboard': {
    name: 'Executive Dashboard Creator',
    subtitle: 'C-Level Business Intelligence',
    description: 'Create comprehensive executive dashboards with real-time KPIs, trend analysis, and strategic insights for data-driven decision making.',
    metrics: {
      responseTime: '<5 seconds',
      languages: '25+',
      accuracy: '99.2%',
      integrationTime: '<30 minutes'
    },
    category: 'Data Analysis',
    capabilities: [
      {
        icon: '📊',
        title: 'Real-Time KPI Tracking',
        description: 'Monitor key performance indicators with live data updates and customizable executive-level metrics.'
      },
      {
        icon: '📈',
        title: 'Trend Analysis',
        description: 'Identify patterns and trends in business performance with advanced statistical modeling.'
      },
      {
        icon: '⚡',
        title: 'Automated Insights',
        description: 'Generate executive summaries and actionable insights automatically from complex data sets.'
      },
      {
        icon: '🎯',
        title: 'Strategic Alerts',
        description: 'Receive intelligent alerts for significant changes, anomalies, or opportunities requiring attention.'
      },
      {
        icon: '🔄',
        title: 'Cross-Platform Integration',
        description: 'Pull data from multiple business systems to create unified executive reporting.'
      },
      {
        icon: '📱',
        title: 'Mobile Executive Access',
        description: 'Access critical business insights on-the-go with mobile-optimized dashboard views.'
      }
    ],
    techStack: {
      processing: 'Claude 3.5 Sonnet for insight generation and executive summaries',
      intentRecognition: 'Business metric interpretation with 99% accuracy',
      sentimentAnalysis: 'Market sentiment and business trend analysis',
      database: 'Real-time data warehouse with multi-source integration',
      sessionManagement: 'Executive session management with personalized views',
      integration: 'Enterprise data platform integration with major business systems'
    },
    useCases: [
      {
        industry: 'Enterprise',
        applications: ['Revenue tracking', 'Performance monitoring', 'Strategic planning', 'Board reporting']
      },
      {
        industry: 'Financial Services',
        applications: ['Risk monitoring', 'Portfolio performance', 'Regulatory reporting', 'Market analysis']
      },
      {
        industry: 'Healthcare',
        applications: ['Operational metrics', 'Patient outcomes', 'Financial performance', 'Quality indicators']
      },
      {
        industry: 'Manufacturing',
        applications: ['Production efficiency', 'Supply chain metrics', 'Quality control', 'Cost analysis']
      }
    ],
    features: [
      'Real-time data visualization',
      'Executive summary generation',
      'Customizable KPI frameworks',
      'Predictive analytics integration',
      'Automated report scheduling',
      'Mobile dashboard access',
      'Data drill-down capabilities',
      'Collaborative annotation tools'
    ],
    integrations: [
      'Salesforce', 'SAP', 'Oracle', 'Microsoft Dynamics', 'Tableau', 'Power BI', 'Snowflake', 'AWS RedShift'
    ],
    pricing: [
      {
        name: 'Executive',
        price: '$999/month',
        description: 'For C-level executives',
        features: [
          'Up to 5 executive dashboards',
          'Real-time data updates',
          'Mobile access',
          'Priority support',
          'Basic integrations'
        ]
      },
      {
        name: 'Enterprise',
        price: '$2,999/month',
        description: 'For large organizations',
        features: [
          'Unlimited dashboards',
          'Advanced analytics',
          'Custom integrations',
          'Dedicated support',
          'White-label options',
          'API access'
        ]
      },
      {
        name: 'Custom',
        price: 'Contact Sales',
        description: 'Tailored solutions',
        features: [
          'Custom development',
          'On-premise deployment',
          'Advanced security',
          'SLA guarantees',
          'Dedicated team',
          'Training included'
        ]
      }
    ],
    successMetrics: {
      responseAccuracy: '99.2%',
      firstContactResolution: '92%',
      customerSatisfaction: '4.9/5',
      averageHandleTime: '3 seconds',
      costReduction: '65%',
      roiTimeline: '4-6 weeks'
    }
  },
  'sales-analyzer': {
    name: 'Sales Performance Analyzer',
    subtitle: 'Advanced Sales Intelligence',
    description: 'Analyze sales data to identify opportunities, optimize performance, and accelerate revenue growth with AI-powered insights.',
    metrics: {
      responseTime: '<3 seconds',
      languages: '30+',
      accuracy: '97%',
      integrationTime: '<45 minutes'
    },
    category: 'Data Analysis',
    capabilities: [
      {
        icon: '📊',
        title: 'Pipeline Analysis',
        description: 'Deep analysis of sales pipeline health, velocity, and conversion patterns.'
      },
      {
        icon: '🎯',
        title: 'Win/Loss Tracking',
        description: 'Comprehensive win/loss analysis with actionable insights for improvement.'
      },
      {
        icon: '📈',
        title: 'Revenue Forecasting',
        description: 'AI-powered revenue predictions with confidence intervals and scenario planning.'
      },
      {
        icon: '👥',
        title: 'Rep Performance',
        description: 'Individual and team performance analysis with coaching recommendations.'
      },
      {
        icon: '🔍',
        title: 'Opportunity Scoring',
        description: 'Intelligent opportunity scoring to prioritize high-value prospects.'
      },
      {
        icon: '📱',
        title: 'Mobile Insights',
        description: 'Access sales insights on-the-go with mobile-optimized analytics.'
      }
    ],
    // Similar structure for other properties...
  },
  'customer-behavior': {
    name: 'Customer Behavior Analyst',
    subtitle: 'Deep Customer Intelligence',
    description: 'Understand customer behavior patterns, predict churn, and optimize customer lifetime value with advanced behavioral analytics.',
    metrics: {
      responseTime: '<2 seconds',
      languages: '40+',
      accuracy: '96%',
      integrationTime: '<20 minutes'
    },
    category: 'Data Analysis',
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
      'data analysis automation',
      'business intelligence AI',
      'analytics automation'
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
      <section className="bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 bg-white/20 text-white">
              {agent.category} AI Agent
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              {agent.name}
            </h1>
            <p className="text-2xl text-purple-200 mb-8">
              {agent.subtitle}
            </p>
            <p className="text-xl text-gray-300 mb-10 max-w-4xl mx-auto">
              {agent.description}
            </p>
            
            {/* Key Metrics */}
            <div className="grid md:grid-cols-4 gap-6 mb-12">
              <Card className="p-4 bg-white/10 backdrop-blur border-white/20">
                <div className="text-2xl font-bold text-purple-400 mb-1">{agent.metrics.responseTime}</div>
                <div className="text-gray-300 text-sm">Processing Time</div>
              </Card>
              <Card className="p-4 bg-white/10 backdrop-blur border-white/20">
                <div className="text-2xl font-bold text-indigo-400 mb-1">{agent.metrics.languages}</div>
                <div className="text-gray-300 text-sm">Data Formats</div>
              </Card>
              <Card className="p-4 bg-white/10 backdrop-blur border-white/20">
                <div className="text-2xl font-bold text-blue-400 mb-1">{agent.metrics.accuracy}</div>
                <div className="text-gray-300 text-sm">Accuracy</div>
              </Card>
              <Card className="p-4 bg-white/10 backdrop-blur border-white/20">
                <div className="text-2xl font-bold text-cyan-400 mb-1">{agent.metrics.integrationTime}</div>
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
                Advanced data analytics powered by Claude 3.5 Sonnet
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12">
              <Card className="p-8">
                <h3 className="text-2xl font-bold mb-6 text-purple-600">Technology Stack</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Data Processing</h4>
                    <p className="text-gray-600 text-sm">{agent.techStack.processing}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Metric Interpretation</h4>
                    <p className="text-gray-600 text-sm">{agent.techStack.intentRecognition}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Trend Analysis</h4>
                    <p className="text-gray-600 text-sm">{agent.techStack.sentimentAnalysis}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Data Warehouse</h4>
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
                Transform data across industries
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
                Enterprise-grade analytics solutions
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {agent.pricing.map((plan, index) => (
                <Card key={index} className={`p-8 ${index === 1 ? 'ring-2 ring-purple-500 transform scale-105' : ''}`}>
                  {index === 1 && (
                    <Badge variant="primary" className="mb-4">Most Popular</Badge>
                  )}
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="text-3xl font-bold text-purple-600 mb-2">{plan.price}</div>
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
                    {plan.price === 'Contact Sales' ? 'Contact Sales' : 'Start Free Trial'}
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
              <p className="text-xl text-gray-600">Proven analytics performance</p>
            </div>
            
            <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6">
              <Card className="p-6 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-2">{agent.successMetrics.responseAccuracy}</div>
                <div className="text-gray-600 text-sm">Data Accuracy</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-2xl font-bold text-indigo-600 mb-2">{agent.successMetrics.firstContactResolution}</div>
                <div className="text-gray-600 text-sm">Insight Quality</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">{agent.successMetrics.customerSatisfaction}</div>
                <div className="text-gray-600 text-sm">User Satisfaction</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-2xl font-bold text-cyan-600 mb-2">{agent.successMetrics.averageHandleTime}</div>
                <div className="text-gray-600 text-sm">Processing Time</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-2xl font-bold text-teal-600 mb-2">{agent.successMetrics.costReduction}</div>
                <div className="text-gray-600 text-sm">Cost Reduction</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">{agent.successMetrics.roiTimeline}</div>
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
              <p className="text-xl text-gray-600">Connect with enterprise data platforms</p>
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
                <h3 className="text-lg font-bold mb-3">How quickly can insights be generated?</h3>
                <p className="text-gray-600">Insights are generated in real-time as data flows in, with complex analysis completing within 5 seconds for most datasets.</p>
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-3">Can it handle large datasets?</h3>
                <p className="text-gray-600">Yes, our platform is designed to handle petabyte-scale data with distributed processing and cloud-native architecture.</p>
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-3">Is the analysis customizable?</h3>
                <p className="text-gray-600">All analysis frameworks, KPIs, and reporting can be fully customized to match your business requirements and metrics.</p>
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-3">How secure is our data?</h3>
                <p className="text-gray-600">Enterprise-grade security with encryption at rest and in transit, SOC 2 compliance, and optional on-premise deployment.</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Unlock Your Data's Potential?
            </h2>
            <p className="text-xl text-purple-100 mb-8">
              Transform raw data into actionable insights with the {agent.name}.
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
              <Link href="/ai-agents/data-analysis">
                <Button variant="outline">Browse Data Analysis Agents</Button>
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