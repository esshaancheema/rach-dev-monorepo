import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';

export const metadata: Metadata = {
  title: 'Build Intelligent AI Agents In Minutes | #1 AI Agent Development Platform | Zoptal',
  description: 'Transform your business with custom AI agents powered by Claude Code API. Create sophisticated AI solutions without coding. 500+ pre-built agents, instant deployment, enterprise-grade platform.',
  keywords: [
    'AI agent development platform',
    'custom AI agent builder',
    'Claude Code API',
    'intelligent business automation',
    'enterprise AI solutions',
    'no-code AI development',
    'AI workflow automation',
    'business AI agents',
    'AI assistant development',
    'automated customer support',
    'AI sales agents',
    'AI marketing automation',
    'AI data analysis',
    'virtual personal assistants'
  ],
  openGraph: {
    title: 'Build Intelligent AI Agents In Minutes | Zoptal AI Platform',
    description: 'Transform your business with 500+ pre-built AI agents or create custom solutions in minutes. Enterprise-grade platform powered by cutting-edge AI technology.',
    images: ['/images/ai-agents-og.png'],
  },
  alternates: {
    canonical: 'https://zoptal.com/ai-agents',
  },
};

const agentTypes = [
  {
    id: 'customer-support',
    name: 'Customer Support Agents',
    description: 'Revolutionize your customer service with AI agents that provide instant, accurate, and personalized support 24/7.',
    icon: '🎧',
    metrics: 'Response Time: <500ms | Resolution Rate: 94% | Languages: 100+',
    features: [
      'Multi-language support',
      'Sentiment analysis',
      'Ticket routing & escalation',
      'Knowledge base integration',
      'Natural language understanding',
      'Real-time analytics'
    ],
    useCases: [
      'FAQ answering and instant responses',
      'Order tracking and status updates',
      'Technical troubleshooting',
      'Product recommendations',
      'Complaint handling and resolution',
      'Appointment scheduling'
    ],
    href: '/ai-agents/customer-support'
  },
  {
    id: 'sales-lead-generation',
    name: 'Sales and Lead Generation',
    description: 'Accelerate your sales pipeline with intelligent agents that qualify leads, nurture prospects, and drive conversions.',
    icon: '💼',
    metrics: 'Lead Response: <1min | Conversion: +47% | Cost Reduction: 63%',
    features: [
      'Lead scoring & qualification',
      'Automated follow-ups',
      'CRM integration',
      'Predictive analytics',
      'Pipeline management',
      'Performance tracking'
    ],
    useCases: [
      'Lead capture and qualification',
      'Prospect nurturing sequences',
      'Sales appointment booking',
      'Quote and proposal generation',
      'Customer onboarding',
      'Upselling and cross-selling'
    ],
    href: '/ai-agents/sales-lead-generation'
  },
  {
    id: 'content-marketing',
    name: 'Content and Marketing Agents',
    description: 'Create compelling content at scale with AI agents specialized in copywriting, SEO optimization, and campaign management.',
    icon: '✍️',
    metrics: 'Content Production: 50x faster | Engagement: +127% | ROI: 312%',
    features: [
      'Content generation',
      'SEO optimization',
      'Social media management',
      'Campaign analytics',
      'Brand voice consistency',
      'Multi-channel distribution'
    ],
    useCases: [
      'Blog posts and articles',
      'Social media content',
      'Email campaigns',
      'Product descriptions',
      'Ad copy creation',
      'Video scripts and podcasts'
    ],
    href: '/ai-agents/content-marketing'
  },
  {
    id: 'data-analysis',
    name: 'Data Analysis Agents',
    description: 'Transform raw data into actionable insights with agents that analyze, visualize, and report on complex datasets.',
    icon: '📊',
    metrics: 'Processing Speed: 100x faster | Accuracy: 99.2% | Reports: Real-time',
    features: [
      'Real-time analytics',
      'Predictive modeling',
      'Custom dashboards',
      'Automated reporting',
      'Data visualization',
      'Trend identification'
    ],
    useCases: [
      'Business intelligence dashboards',
      'Sales performance analysis',
      'Customer behavior insights',
      'Financial reporting',
      'Market research analysis',
      'Predictive forecasting'
    ],
    href: '/ai-agents/data-analysis'
  },
  {
    id: 'workflow-automation',
    name: 'Workflow Automation',
    description: 'Streamline operations with intelligent agents that automate repetitive tasks and complex workflows.',
    icon: '⚙️',
    metrics: 'Time Savings: 80% | Error Reduction: 95% | ROI: 400%',
    features: [
      'Process automation',
      'Task orchestration',
      'System integration',
      'Compliance monitoring',
      'Exception handling',
      'Performance optimization'
    ],
    useCases: [
      'Document processing',
      'Data entry automation',
      'Invoice and payment processing',
      'HR and onboarding workflows',
      'Inventory management',
      'Quality assurance processes'
    ],
    href: '/ai-agents/workflow-automation'
  },
  {
    id: 'virtual-assistants',
    name: 'Virtual Personal Assistants',
    description: 'Enhance productivity with AI assistants that manage schedules, tasks, and communications intelligently.',
    icon: '🤖',
    metrics: 'Productivity: +65% | Task Completion: 98% | Response: Instant',
    features: [
      'Calendar management',
      'Email prioritization',
      'Task automation',
      'Meeting preparation',
      'Travel coordination',
      'Communication management'
    ],
    useCases: [
      'Schedule optimization',
      'Email sorting and responses',
      'Travel planning and booking',
      'Meeting coordination',
      'Task prioritization',
      'Expense management'
    ],
    href: '/ai-agents/virtual-assistants'
  },
];

const buildingSteps = [
  {
    step: 1,
    title: 'Define Your Agent',
    description: 'Specify the purpose, personality, and capabilities of your AI agent',
    features: ['Goal setting', 'Personality configuration', 'Knowledge base setup'],
  },
  {
    step: 2,
    title: 'Train with Data',
    description: 'Upload your data, documents, and conversation examples',
    features: ['Document upload', 'Conversation training', 'API integrations'],
  },
  {
    step: 3,
    title: 'Test & Refine',
    description: 'Test your agent in a sandbox environment and optimize performance',
    features: ['Sandbox testing', 'Performance analytics', 'Continuous learning'],
  },
  {
    step: 4,
    title: 'Deploy Everywhere',
    description: 'Launch your agent across multiple channels and platforms',
    features: ['Multi-channel deployment', 'API access', 'Real-time monitoring'],
  },
];

const integrations = [
  { name: 'Slack', logo: '/logos/slack.png' },
  { name: 'Discord', logo: '/logos/discord.png' },
  { name: 'WhatsApp', logo: '/logos/whatsapp.png' },
  { name: 'Telegram', logo: '/logos/telegram.png' },
  { name: 'Facebook Messenger', logo: '/logos/messenger.png' },
  { name: 'Microsoft Teams', logo: '/logos/teams.png' },
  { name: 'Shopify', logo: '/logos/shopify.png' },
  { name: 'Salesforce', logo: '/logos/salesforce.png' },
];

const features = [
  {
    category: 'Natural Language Processing',
    items: [
      'Advanced conversation understanding',
      'Multi-language support',
      'Sentiment analysis',
      'Intent recognition',
    ],
  },
  {
    category: 'Integration Capabilities',
    items: [
      'REST API connections',
      'Database integration',
      'CRM synchronization',
      'Webhook support',
    ],
  },
  {
    category: 'Analytics & Insights',
    items: [
      'Conversation analytics',
      'Performance metrics',
      'User engagement tracking',
      'A/B testing capabilities',
    ],
  },
  {
    category: 'Security & Compliance',
    items: [
      'End-to-end encryption',
      'GDPR compliance',
      'SOC 2 certification',
      'Role-based access control',
    ],
  },
];

const testimonials = [
  {
    quote: "Our customer support agent handles 80% of inquiries automatically, freeing up our team for complex issues.",
    author: "Sarah Johnson",
    role: "Customer Success Manager",
    company: "TechStart Inc",
  },
  {
    quote: "The sales agent increased our lead qualification rate by 300% and improved conversion by 45%.",
    author: "Mike Chen",
    role: "Sales Director",
    company: "GrowthCorp",
  },
  {
    quote: "Building our content generation agent took just 2 hours. It now creates all our social media posts.",
    author: "Lisa Rodriguez",
    role: "Marketing Manager",
    company: "Creative Agency",
  },
];

export default function AIAgentsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 bg-white/20 text-white">
              #1 AI Agent Development Platform
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-8">
              Build Intelligent
              <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                AI Agents
              </span>
              in Minutes
            </h1>
            <p className="text-xl text-gray-300 mb-6 max-w-4xl mx-auto">
              Transform your business operations with custom AI agents powered by cutting-edge technology. 
              From customer support to workflow automation, create sophisticated AI solutions without extensive coding knowledge.
            </p>
            <p className="text-lg text-blue-200 mb-10 max-w-3xl mx-auto font-medium">
              <strong>Leverage the power of Claude Code API and advanced AI models to build, deploy, and scale intelligent agents that work 24/7</strong>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button variant="white" size="lg" className="text-lg px-8 py-4">
                Start Building Free
              </Button>
              <Button variant="outline-white" size="lg" className="text-lg px-8 py-4">
                Watch Demo
              </Button>
            </div>
            
            {/* AI Agent Builder - Create Your Custom AI Agent Now */}
            <Card className="p-8 bg-white/10 backdrop-blur border-white/20 max-w-4xl mx-auto">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-3">Create Your Custom AI Agent Now</h3>
                <p className="text-purple-200">
                  Simply describe what you need, and our AI Agent Builder will generate a working prototype in minutes.
                </p>
              </div>
              
              <div className="bg-white/20 rounded-xl p-6 mb-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Describe your AI agent:</label>
                  <textarea
                    placeholder='Example: "Create an AI agent that handles customer inquiries about product pricing, inventory, and shipping times with natural language understanding."'
                    rows={4}
                    className="w-full p-4 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 resize-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                  />
                </div>
                
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Industry:</label>
                    <select className="w-full p-3 rounded-lg bg-white/20 text-white border border-white/30 focus:ring-2 focus:ring-purple-400">
                      <option value="">Select industry...</option>
                      <option>E-commerce</option>
                      <option>Healthcare</option>
                      <option>Finance</option>
                      <option>Education</option>
                      <option>Technology</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Complexity:</label>
                    <select className="w-full p-3 rounded-lg bg-white/20 text-white border border-white/30 focus:ring-2 focus:ring-purple-400">
                      <option value="">Select level...</option>
                      <option>Simple</option>
                      <option>Medium</option>
                      <option>Advanced</option>
                      <option>Enterprise</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Timeline:</label>
                    <select className="w-full p-3 rounded-lg bg-white/20 text-white border border-white/30 focus:ring-2 focus:ring-purple-400">
                      <option value="">Select timeline...</option>
                      <option>Immediate</option>
                      <option>This week</option>
                      <option>This month</option>
                      <option>Custom</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="white" size="lg" className="text-lg px-8 py-4">
                  Generate Agent
                </Button>
                <Button variant="outline-white" size="lg" className="text-lg px-8 py-4">
                  Use Template
                </Button>
                <Button variant="outline-white" size="lg" className="text-lg px-8 py-4">
                  Browse Gallery
                </Button>
              </div>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-purple-200">
                  🚀 <strong>500+ Pre-Built Agents</strong> | 📊 <strong>Industry-Specific Solutions</strong> | ⚡ <strong>Instant Deployment</strong>
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Agent Types */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">
                Complete AI Agents Portfolio
              </h2>
              <p className="text-xl text-gray-600 mb-4">
                Pre-Built, Production-Ready AI Agents
              </p>
              <p className="text-lg text-gray-500 max-w-4xl mx-auto">
                Choose from our extensive library of tested and optimized AI agents, ready to deploy or customize for your specific needs.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mt-6">
                <Badge variant="outline" className="px-4 py-2">
                  <strong>500+ Pre-Built Agents</strong>
                </Badge>
                <Badge variant="outline" className="px-4 py-2">
                  <strong>Industry-Specific Solutions</strong>
                </Badge>
                <Badge variant="outline" className="px-4 py-2">
                  <strong>Instant Deployment</strong>
                </Badge>
              </div>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8">
              {agentTypes.map((agent) => (
                <Card key={agent.id} className="p-8 hover:shadow-xl transition-shadow group">
                  <div className="flex items-start gap-4 mb-6">
                    <span className="text-4xl group-hover:scale-110 transition-transform">{agent.icon}</span>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-2 text-gray-900 group-hover:text-blue-600 transition-colors">{agent.name}</h3>
                      <p className="text-gray-600 mb-4">{agent.description}</p>
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <p className="text-sm font-medium text-gray-700">
                          📊 <span className="text-blue-600">{agent.metrics}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Tabs defaultValue="features" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                      <TabsTrigger value="features">Features</TabsTrigger>
                      <TabsTrigger value="usecases">Use Cases</TabsTrigger>
                    </TabsList>
                    <TabsContent value="features" className="space-y-2">
                      {agent.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </TabsContent>
                    <TabsContent value="usecases" className="space-y-2">
                      {agent.useCases.map((useCase, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm text-gray-700">{useCase}</span>
                        </div>
                      ))}
                    </TabsContent>
                  </Tabs>
                  
                  <div className="mt-6 flex gap-3">
                    <Link href={agent.href} className="flex-1">
                      <Button variant="primary" className="w-full group-hover:scale-105 transition-transform">
                        Explore {agent.name} →
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">
                How to Build Your AI Agent
              </h2>
              <p className="text-xl text-gray-600">
                Four simple steps to create intelligent agents that work for your business
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {buildingSteps.map((step) => (
                <div key={step.step} className="text-center">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto">
                      {step.step}
                    </div>
                    {step.step < buildingSteps.length && (
                      <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-purple-300 to-blue-300 -translate-x-8"></div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-gray-600 mb-4">{step.description}</p>
                  <div className="space-y-2">
                    {step.features.map((feature, index) => (
                      <div key={index} className="text-sm text-gray-500">
                        • {feature}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">
                Powerful Features for Every Need
              </h2>
              <p className="text-xl text-gray-600">
                Everything you need to build, deploy, and scale intelligent AI agents
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {features.map((category) => (
                <Card key={category.category} className="p-8">
                  <h3 className="text-2xl font-bold mb-6">{category.category}</h3>
                  <div className="space-y-4">
                    {category.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-purple-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Integrations */}
      <section className="py-20 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Deploy Anywhere
            </h2>
            <p className="text-xl text-gray-600 mb-12">
              Connect your AI agents to any platform or service your customers use
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
              {integrations.map((integration) => (
                <Card key={integration.name} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="text-center">
                    {integration.logo && (
                      <Image
                        src={integration.logo}
                        alt={integration.name}
                        width={40}
                        height={40}
                        className="mx-auto mb-3"
                      />
                    )}
                    <h4 className="font-medium">{integration.name}</h4>
                  </div>
                </Card>
              ))}
            </div>
            
            <div className="mt-12">
              <Link href="/resources/documentation/integrations">
                <Button variant="outline" size="lg">
                  View All Integrations
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">
                What Our Customers Say
              </h2>
              <p className="text-xl text-gray-600">
                See how businesses are transforming with AI agents
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="p-8">
                  <svg className="w-8 h-8 text-purple-500 mb-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                  <blockquote className="text-lg text-gray-700 mb-6">
                    "{testimonial.quote}"
                  </blockquote>
                  <div>
                    <div className="font-semibold">{testimonial.author}</div>
                    <div className="text-sm text-gray-600">
                      {testimonial.role}, {testimonial.company}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Build Your First AI Agent?
            </h2>
            <p className="text-xl text-purple-100 mb-8">
              Join thousands of businesses automating their workflows with intelligent AI agents. 
              Start building for free - no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button variant="white" size="lg" className="text-lg px-8 py-4">
                Start Building Free
              </Button>
              <Button variant="outline-white" size="lg" className="text-lg px-8 py-4">
                Schedule Demo
              </Button>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold mb-2">10K+</div>
                <div className="text-purple-200">AI Agents Built</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">95%</div>
                <div className="text-purple-200">Customer Satisfaction</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">24/7</div>
                <div className="text-purple-200">Agent Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}