import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

// Agent data structure for Virtual Personal Assistant agents
const agentDatabase = {
  'executive-calendar': {
    name: 'Executive Calendar Manager',
    subtitle: 'Intelligent Schedule Optimization',
    description: 'Master complex executive schedules with AI that manages meetings, travel, and priorities while protecting focus time and work-life balance.',
    metrics: {
      responseTime: '<1 second',
      languages: '100+',
      accuracy: '99%',
      integrationTime: '<30 minutes'
    },
    category: 'Virtual Personal Assistants',
    capabilities: [
      {
        icon: '📅',
        title: 'Smart Scheduling',
        description: 'Intelligently schedule meetings considering priorities, travel time, and energy levels throughout the day.'
      },
      {
        icon: '🔄',
        title: 'Conflict Resolution',
        description: 'Automatically detect and resolve scheduling conflicts with intelligent rescheduling suggestions.'
      },
      {
        icon: '🌍',
        title: 'Time Zone Management',
        description: 'Seamlessly coordinate meetings across multiple time zones with automatic conversion and notifications.'
      },
      {
        icon: '⚡',
        title: 'Meeting Optimization',
        description: 'Optimize meeting duration, frequency, and attendees based on historical data and objectives.'
      },
      {
        icon: '🛡️',
        title: 'Focus Time Protection',
        description: 'Protect dedicated focus time blocks and ensure work-life balance boundaries are maintained.'
      },
      {
        icon: '📊',
        title: 'Time Analytics',
        description: 'Provide insights on time allocation, meeting effectiveness, and schedule optimization opportunities.'
      }
    ],
    techStack: {
      processing: 'Claude 3.5 Sonnet for intelligent scheduling and context understanding',
      intentRecognition: 'Meeting intent and priority analysis with 99% accuracy',
      sentimentAnalysis: 'Meeting importance and urgency detection',
      database: 'Calendar synchronization across all platforms',
      sessionManagement: 'Multi-calendar coordination and conflict management',
      integration: 'Native integration with Google, Outlook, and enterprise calendars'
    },
    useCases: [
      {
        industry: 'Executive Management',
        applications: ['Board meetings', 'Strategic planning', 'Investor relations', 'Team coordination']
      },
      {
        industry: 'Professional Services',
        applications: ['Client meetings', 'Project planning', 'Team collaboration', 'Business development']
      },
      {
        industry: 'Healthcare',
        applications: ['Patient appointments', 'Medical conferences', 'Department coordination', 'Research meetings']
      },
      {
        industry: 'Education',
        applications: ['Class scheduling', 'Office hours', 'Academic meetings', 'Research coordination']
      }
    ],
    features: [
      'Multi-calendar synchronization',
      'Intelligent double-booking prevention',
      'Travel time calculation',
      'Meeting preparation reminders',
      'Automatic agenda creation',
      'Video conferencing integration',
      'Mobile calendar access',
      'Voice-activated scheduling'
    ],
    integrations: [
      'Google Calendar', 'Microsoft Outlook', 'Apple Calendar', 'Zoom', 'Teams', 'Slack', 'Salesforce', 'Calendly'
    ],
    pricing: [
      {
        name: 'Personal',
        price: '$49/month',
        description: 'For individual professionals',
        features: [
          '1 calendar integration',
          'Basic scheduling',
          'Time zone support',
          'Email support',
          'Mobile access'
        ]
      },
      {
        name: 'Executive',
        price: '$199/month',
        description: 'For executives and leaders',
        features: [
          'Unlimited calendars',
          'Advanced AI scheduling',
          'Team coordination',
          'Priority support',
          'Analytics dashboard',
          'Assistant delegation'
        ]
      },
      {
        name: 'Enterprise',
        price: 'Custom',
        description: 'Organization-wide deployment',
        features: [
          'Unlimited users',
          'Custom workflows',
          'Dedicated support',
          'On-premise option',
          'API access',
          'White-label options'
        ]
      }
    ],
    successMetrics: {
      responseAccuracy: '99%',
      firstContactResolution: '92%',
      customerSatisfaction: '4.9/5',
      averageHandleTime: '<1 second',
      costReduction: '70%',
      roiTimeline: '2-3 weeks'
    }
  },
  'email-management': {
    name: 'Email Management Specialist',
    subtitle: 'Intelligent Inbox Optimization',
    description: 'Transform email chaos into organized productivity with AI that prioritizes, sorts, and drafts responses automatically.',
    metrics: {
      responseTime: '<2 seconds',
      languages: '80+',
      accuracy: '96%',
      integrationTime: '<15 minutes'
    },
    category: 'Virtual Personal Assistants',
    capabilities: [
      {
        icon: '📧',
        title: 'Priority Sorting',
        description: 'Automatically sort emails by importance, urgency, and sender relevance using AI analysis.'
      },
      {
        icon: '✍️',
        title: 'Smart Responses',
        description: 'Generate contextually appropriate email responses maintaining your personal tone and style.'
      },
      {
        icon: '🔔',
        title: 'Follow-up Reminders',
        description: 'Never miss important follow-ups with intelligent reminder system and tracking.'
      },
      {
        icon: '📁',
        title: 'Auto-Organization',
        description: 'Automatically file emails into appropriate folders based on content and context.'
      },
      {
        icon: '🛡️',
        title: 'Spam Protection',
        description: 'Advanced spam and phishing detection to keep your inbox clean and secure.'
      },
      {
        icon: '📊',
        title: 'Email Analytics',
        description: 'Insights on email patterns, response times, and communication effectiveness.'
      }
    ],
    // Similar structure for other properties...
  },
  'meeting-coordinator': {
    name: 'Meeting Coordinator',
    subtitle: 'End-to-End Meeting Management',
    description: 'Automate meeting scheduling, preparation, note-taking, and follow-ups to make every meeting productive and actionable.',
    metrics: {
      responseTime: '<3 seconds',
      languages: '60+',
      accuracy: '97%',
      integrationTime: '<45 minutes'
    },
    category: 'Virtual Personal Assistants',
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
      'virtual assistant AI',
      'personal productivity automation',
      'executive assistant AI'
    ],
    openGraph: {
      title: `${agent.name} | Transform Your Productivity`,
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
      <section className="bg-gradient-to-br from-cyan-900 via-blue-900 to-indigo-900 text-white py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 bg-white/20 text-white">
              {agent.category} AI Agent
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              {agent.name}
            </h1>
            <p className="text-2xl text-cyan-200 mb-8">
              {agent.subtitle}
            </p>
            <p className="text-xl text-gray-300 mb-10 max-w-4xl mx-auto">
              {agent.description}
            </p>
            
            {/* Key Metrics */}
            <div className="grid md:grid-cols-4 gap-6 mb-12">
              <Card className="p-4 bg-white/10 backdrop-blur border-white/20">
                <div className="text-2xl font-bold text-cyan-400 mb-1">{agent.metrics.responseTime}</div>
                <div className="text-gray-300 text-sm">Response Time</div>
              </Card>
              <Card className="p-4 bg-white/10 backdrop-blur border-white/20">
                <div className="text-2xl font-bold text-blue-400 mb-1">{agent.metrics.languages}</div>
                <div className="text-gray-300 text-sm">Languages</div>
              </Card>
              <Card className="p-4 bg-white/10 backdrop-blur border-white/20">
                <div className="text-2xl font-bold text-indigo-400 mb-1">{agent.metrics.accuracy}</div>
                <div className="text-gray-300 text-sm">Accuracy</div>
              </Card>
              <Card className="p-4 bg-white/10 backdrop-blur border-white/20">
                <div className="text-2xl font-bold text-purple-400 mb-1">{agent.metrics.integrationTime}</div>
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
                Personal productivity powered by Claude 3.5 Sonnet
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12">
              <Card className="p-8">
                <h3 className="text-2xl font-bold mb-6 text-cyan-600">Technology Stack</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">AI Processing</h4>
                    <p className="text-gray-600 text-sm">{agent.techStack.processing}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Intent Analysis</h4>
                    <p className="text-gray-600 text-sm">{agent.techStack.intentRecognition}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Priority Detection</h4>
                    <p className="text-gray-600 text-sm">{agent.techStack.sentimentAnalysis}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Data Sync</h4>
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
                Enhance productivity across roles
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {agent.useCases.map((useCase, index) => (
                <Card key={index} className="p-8">
                  <h3 className="text-xl font-bold mb-4 text-cyan-600">{useCase.industry}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {useCase.applications.map((app, appIndex) => (
                      <div key={appIndex} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-cyan-500 rounded-full flex-shrink-0"></div>
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
                Personal productivity solutions for every need
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {agent.pricing.map((plan, index) => (
                <Card key={index} className={`p-8 ${index === 1 ? 'ring-2 ring-cyan-500 transform scale-105' : ''}`}>
                  {index === 1 && (
                    <Badge variant="primary" className="mb-4">Most Popular</Badge>
                  )}
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="text-3xl font-bold text-cyan-600 mb-2">{plan.price}</div>
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
              <p className="text-xl text-gray-600">Proven productivity improvements</p>
            </div>
            
            <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6">
              <Card className="p-6 text-center">
                <div className="text-2xl font-bold text-cyan-600 mb-2">{agent.successMetrics.responseAccuracy}</div>
                <div className="text-gray-600 text-sm">Task Accuracy</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">{agent.successMetrics.firstContactResolution}</div>
                <div className="text-gray-600 text-sm">Task Completion</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-2xl font-bold text-indigo-600 mb-2">{agent.successMetrics.customerSatisfaction}</div>
                <div className="text-gray-600 text-sm">User Satisfaction</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-2">{agent.successMetrics.averageHandleTime}</div>
                <div className="text-gray-600 text-sm">Response Time</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-2xl font-bold text-pink-600 mb-2">{agent.successMetrics.costReduction}</div>
                <div className="text-gray-600 text-sm">Time Savings</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-2xl font-bold text-rose-600 mb-2">{agent.successMetrics.roiTimeline}</div>
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
              <p className="text-xl text-gray-600">Works with your favorite productivity tools</p>
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
                <h3 className="text-lg font-bold mb-3">How does it protect my privacy?</h3>
                <p className="text-gray-600">All data is encrypted end-to-end with enterprise-grade security. We never share your personal information and you maintain full control.</p>
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-3">Can it work with my existing tools?</h3>
                <p className="text-gray-600">Yes, the assistant integrates with all major productivity platforms and can be customized for proprietary systems.</p>
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-3">How much time can it save me?</h3>
                <p className="text-gray-600">Users typically save 5-8 hours per week on administrative tasks, allowing more time for strategic and creative work.</p>
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-3">Is it suitable for teams?</h3>
                <p className="text-gray-600">Yes, team features include shared calendars, delegation capabilities, and coordinated scheduling across team members.</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-cyan-600 to-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Supercharge Your Productivity?
            </h2>
            <p className="text-xl text-cyan-100 mb-8">
              Get your personal AI assistant with the {agent.name}.
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
              <Link href="/ai-agents/virtual-assistants">
                <Button variant="outline">Browse Virtual Assistants</Button>
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