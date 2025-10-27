import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

// Agent data structure for Workflow Automation agents
const agentDatabase = {
  'invoice-processing': {
    name: 'Invoice Processing Bot',
    subtitle: 'Automated Invoice Management',
    description: 'Streamline invoice processing with intelligent capture, validation, and automated approval workflows that reduce processing time by 80%.',
    metrics: {
      responseTime: '<30 seconds',
      languages: '50+',
      accuracy: '98%',
      integrationTime: '<2 hours'
    },
    category: 'Workflow Automation',
    capabilities: [
      {
        icon: '📄',
        title: 'OCR Extraction',
        description: 'Extract invoice data from PDFs, images, and emails with 98% accuracy using advanced OCR technology.'
      },
      {
        icon: '✅',
        title: 'Data Validation',
        description: 'Automatically validate invoice data against purchase orders and contracts for accuracy.'
      },
      {
        icon: '🔄',
        title: 'Approval Routing',
        description: 'Intelligent routing based on amount thresholds, departments, and business rules.'
      },
      {
        icon: '🔗',
        title: 'ERP Integration',
        description: 'Seamlessly integrate with SAP, Oracle, QuickBooks, and other ERP systems.'
      },
      {
        icon: '📊',
        title: 'Compliance Tracking',
        description: 'Ensure compliance with internal policies and regulatory requirements.'
      },
      {
        icon: '⚡',
        title: 'Exception Handling',
        description: 'Automatically flag and route exceptions for manual review with context.'
      }
    ],
    techStack: {
      processing: 'Claude 3.5 Sonnet for document understanding and data extraction',
      intentRecognition: 'Invoice field recognition with 99% accuracy',
      sentimentAnalysis: 'Vendor relationship and payment priority analysis',
      database: 'Document management system with audit trail',
      sessionManagement: 'Workflow state management and approval tracking',
      integration: 'ERP and accounting system integration via APIs'
    },
    useCases: [
      {
        industry: 'Manufacturing',
        applications: ['Supplier invoices', 'Purchase orders', 'Expense reports', 'Contract validation']
      },
      {
        industry: 'Retail',
        applications: ['Vendor billing', 'Store expenses', 'Inventory invoices', 'Service contracts']
      },
      {
        industry: 'Healthcare',
        applications: ['Medical supplies', 'Service invoices', 'Equipment purchases', 'Facility expenses']
      },
      {
        industry: 'Professional Services',
        applications: ['Client billing', 'Subcontractor invoices', 'Project expenses', 'Travel reimbursements']
      }
    ],
    features: [
      'Multi-format invoice processing',
      'Three-way matching automation',
      'Duplicate detection',
      'Early payment discount optimization',
      'Multi-currency support',
      'Tax compliance validation',
      'Vendor portal integration',
      'Mobile approval capabilities'
    ],
    integrations: [
      'SAP', 'Oracle', 'QuickBooks', 'NetSuite', 'Microsoft Dynamics', 'Xero', 'Sage', 'Workday'
    ],
    pricing: [
      {
        name: 'Starter',
        price: '$399/month',
        description: 'For small businesses',
        features: [
          'Up to 500 invoices/month',
          'Basic OCR extraction',
          '2 approval workflows',
          'Email support',
          'Standard integrations'
        ]
      },
      {
        name: 'Professional',
        price: '$1,299/month',
        description: 'For growing organizations',
        features: [
          'Up to 5,000 invoices/month',
          'Advanced OCR with AI',
          'Unlimited workflows',
          'Priority support',
          'Custom integrations',
          'Compliance reporting'
        ]
      },
      {
        name: 'Enterprise',
        price: 'Custom',
        description: 'Unlimited processing',
        features: [
          'Unlimited invoices',
          'Custom AI models',
          'Dedicated support team',
          'On-premise option',
          'SLA guarantee',
          'Advanced security'
        ]
      }
    ],
    successMetrics: {
      responseAccuracy: '98%',
      firstContactResolution: '85%',
      customerSatisfaction: '4.8/5',
      averageHandleTime: '25 seconds',
      costReduction: '80%',
      roiTimeline: '3-4 months'
    }
  },
  'contract-management': {
    name: 'Contract Management Agent',
    subtitle: 'End-to-End Contract Lifecycle',
    description: 'Automate contract creation, review, approval, and compliance monitoring with AI-powered contract intelligence.',
    metrics: {
      responseTime: '<1 minute',
      languages: '40+',
      accuracy: '96%',
      integrationTime: '<3 hours'
    },
    category: 'Workflow Automation',
    capabilities: [
      {
        icon: '📝',
        title: 'Contract Analysis',
        description: 'AI-powered analysis of contract terms, risks, and obligations.'
      },
      {
        icon: '⚖️',
        title: 'Compliance Monitoring',
        description: 'Continuous monitoring for regulatory compliance and policy adherence.'
      },
      {
        icon: '🔔',
        title: 'Renewal Alerts',
        description: 'Automated alerts for contract renewals, expirations, and milestones.'
      },
      {
        icon: '🎯',
        title: 'Risk Assessment',
        description: 'Identify and flag potential risks and unfavorable terms automatically.'
      },
      {
        icon: '📊',
        title: 'Performance Tracking',
        description: 'Monitor contract performance and vendor compliance metrics.'
      },
      {
        icon: '🤝',
        title: 'Negotiation Support',
        description: 'AI-powered suggestions for better terms based on historical data.'
      }
    ],
    // Similar structure for other properties...
  },
  'document-classification': {
    name: 'Document Classification System',
    subtitle: 'Intelligent Document Management',
    description: 'Automatically classify, route, and process documents using AI to eliminate manual sorting and improve accuracy.',
    metrics: {
      responseTime: '<5 seconds',
      languages: '60+',
      accuracy: '99%',
      integrationTime: '<1 hour'
    },
    category: 'Workflow Automation',
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
      'workflow automation',
      'process automation AI',
      'business process automation'
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
      <section className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 bg-white/20 text-white">
              {agent.category} AI Agent
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              {agent.name}
            </h1>
            <p className="text-2xl text-indigo-200 mb-8">
              {agent.subtitle}
            </p>
            <p className="text-xl text-gray-300 mb-10 max-w-4xl mx-auto">
              {agent.description}
            </p>
            
            {/* Key Metrics */}
            <div className="grid md:grid-cols-4 gap-6 mb-12">
              <Card className="p-4 bg-white/10 backdrop-blur border-white/20">
                <div className="text-2xl font-bold text-indigo-400 mb-1">{agent.metrics.responseTime}</div>
                <div className="text-gray-300 text-sm">Processing Time</div>
              </Card>
              <Card className="p-4 bg-white/10 backdrop-blur border-white/20">
                <div className="text-2xl font-bold text-purple-400 mb-1">{agent.metrics.languages}</div>
                <div className="text-gray-300 text-sm">Languages</div>
              </Card>
              <Card className="p-4 bg-white/10 backdrop-blur border-white/20">
                <div className="text-2xl font-bold text-pink-400 mb-1">{agent.metrics.accuracy}</div>
                <div className="text-gray-300 text-sm">Accuracy</div>
              </Card>
              <Card className="p-4 bg-white/10 backdrop-blur border-white/20">
                <div className="text-2xl font-bold text-rose-400 mb-1">{agent.metrics.integrationTime}</div>
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
                Intelligent automation powered by Claude 3.5 Sonnet
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12">
              <Card className="p-8">
                <h3 className="text-2xl font-bold mb-6 text-indigo-600">Technology Stack</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Document Processing</h4>
                    <p className="text-gray-600 text-sm">{agent.techStack.processing}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Field Recognition</h4>
                    <p className="text-gray-600 text-sm">{agent.techStack.intentRecognition}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Priority Analysis</h4>
                    <p className="text-gray-600 text-sm">{agent.techStack.sentimentAnalysis}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Data Management</h4>
                    <p className="text-gray-600 text-sm">{agent.techStack.database}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-8">
                <h3 className="text-2xl font-bold mb-6 text-purple-600">Key Features</h3>
                <div className="space-y-3">
                  {agent.features.slice(0, 6).map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
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
                Streamline workflows across industries
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {agent.useCases.map((useCase, index) => (
                <Card key={index} className="p-8">
                  <h3 className="text-xl font-bold mb-4 text-indigo-600">{useCase.industry}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {useCase.applications.map((app, appIndex) => (
                      <div key={appIndex} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0"></div>
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
                Workflow automation for every scale
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {agent.pricing.map((plan, index) => (
                <Card key={index} className={`p-8 ${index === 1 ? 'ring-2 ring-indigo-500 transform scale-105' : ''}`}>
                  {index === 1 && (
                    <Badge variant="primary" className="mb-4">Most Popular</Badge>
                  )}
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="text-3xl font-bold text-indigo-600 mb-2">{plan.price}</div>
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
              <p className="text-xl text-gray-600">Proven automation performance</p>
            </div>
            
            <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6">
              <Card className="p-6 text-center">
                <div className="text-2xl font-bold text-indigo-600 mb-2">{agent.successMetrics.responseAccuracy}</div>
                <div className="text-gray-600 text-sm">Process Accuracy</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-2">{agent.successMetrics.firstContactResolution}</div>
                <div className="text-gray-600 text-sm">Auto-Resolution</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-2xl font-bold text-pink-600 mb-2">{agent.successMetrics.customerSatisfaction}</div>
                <div className="text-gray-600 text-sm">User Satisfaction</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-2xl font-bold text-rose-600 mb-2">{agent.successMetrics.averageHandleTime}</div>
                <div className="text-gray-600 text-sm">Process Time</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-2xl font-bold text-orange-600 mb-2">{agent.successMetrics.costReduction}</div>
                <div className="text-gray-600 text-sm">Cost Reduction</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-2xl font-bold text-amber-600 mb-2">{agent.successMetrics.roiTimeline}</div>
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
              <p className="text-xl text-gray-600">Connect with your business systems</p>
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
                <h3 className="text-lg font-bold mb-3">How accurate is the automation?</h3>
                <p className="text-gray-600">Our AI achieves 98% accuracy in process automation with continuous learning to improve performance over time.</p>
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-3">Can it handle complex workflows?</h3>
                <p className="text-gray-600">Yes, the agent supports multi-step workflows with conditional logic, parallel processing, and complex approval chains.</p>
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-3">How does it handle exceptions?</h3>
                <p className="text-gray-600">Exceptions are automatically flagged and routed to appropriate teams with full context for quick resolution.</p>
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-3">Is it compliant with regulations?</h3>
                <p className="text-gray-600">Yes, the system maintains full audit trails and supports compliance with SOX, GDPR, HIPAA, and other regulations.</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Automate Your Workflows?
            </h2>
            <p className="text-xl text-indigo-100 mb-8">
              Transform your operations with the {agent.name}.
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
              <Link href="/ai-agents/workflow-automation">
                <Button variant="outline">Browse Workflow Automation Agents</Button>
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