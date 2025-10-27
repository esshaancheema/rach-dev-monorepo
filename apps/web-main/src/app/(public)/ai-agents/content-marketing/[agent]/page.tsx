import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

// Agent data structure for Content Marketing agents
const agentDatabase = {
  'blog-content-generator': {
    name: 'AI Blog Content Generator',
    subtitle: 'High-Quality Blog Content at Scale',
    description: 'Generate engaging, SEO-optimized blog content that drives traffic and converts readers into customers. Create consistent content that matches your brand voice.',
    metrics: {
      responseTime: '<30 seconds',
      languages: '50+',
      accuracy: '96%',
      integrationTime: '<30 minutes'
    },
    category: 'Content Marketing',
    capabilities: [
      {
        icon: '✍️',
        title: 'Content Generation',
        description: 'Generate high-quality blog posts, articles, and web content tailored to your audience and goals.'
      },
      {
        icon: '🎯',
        title: 'SEO Optimization',
        description: 'Automatically optimize content for search engines with keyword integration and meta descriptions.'
      },
      {
        icon: '📊',
        title: 'Performance Tracking',
        description: 'Track content performance with engagement metrics, traffic data, and conversion analytics.'
      },
      {
        icon: '🎨',
        title: 'Brand Voice Consistency',
        description: 'Maintain consistent brand voice and tone across all generated content pieces.'
      },
      {
        icon: '🔄',
        title: 'Content Repurposing',
        description: 'Transform existing content into multiple formats for different channels and platforms.'
      },
      {
        icon: '📅',
        title: 'Content Calendar',
        description: 'Plan and schedule content publication with intelligent content calendar management.'
      }
    ],
    techStack: {
      processing: 'Claude 3.5 Sonnet for content generation and optimization',
      intentRecognition: 'Topic and audience analysis with 98% accuracy',
      sentimentAnalysis: 'Brand voice and tone consistency monitoring',
      database: 'Content library and knowledge base integration',
      sessionManagement: 'Project and campaign management system',
      integration: 'CMS integration with WordPress, Webflow, and custom platforms'
    },
    useCases: [
      {
        industry: 'E-Commerce',
        applications: ['Product descriptions', 'Category pages', 'Buying guides', 'Brand storytelling']
      },
      {
        industry: 'SaaS',
        applications: ['Feature announcements', 'Use case articles', 'Customer success stories', 'Technical documentation']
      },
      {
        industry: 'Healthcare',
        applications: ['Patient education', 'Treatment explanations', 'Wellness content', 'Medical blog posts']
      },
      {
        industry: 'Finance',
        applications: ['Investment guides', 'Market analysis', 'Educational content', 'Product explanations']
      }
    ],
    features: [
      'SEO-optimized content generation',
      'Multi-format content creation',
      'Brand voice customization',
      'Content performance analytics',
      'Plagiarism detection',
      'Content scheduling',
      'A/B testing capabilities',
      'Multi-language support'
    ],
    integrations: [
      'WordPress', 'Webflow', 'Shopify', 'HubSpot', 'Google Analytics', 'SEMrush', 'Ahrefs', 'Buffer'
    ],
    pricing: [
      {
        name: 'Creator',
        price: '$149/month',
        description: 'Perfect for individual creators',
        features: [
          'Up to 50 articles/month',
          'Basic SEO optimization',
          'Content calendar',
          'Email support',
          '3 brand voice profiles'
        ]
      },
      {
        name: 'Business',
        price: '$399/month',
        description: 'For growing content teams',
        features: [
          'Up to 200 articles/month',
          'Advanced SEO tools',
          'Performance analytics',
          'Priority support',
          'Unlimited brand profiles',
          'Team collaboration'
        ]
      },
      {
        name: 'Enterprise',
        price: 'Custom',
        description: 'Unlimited content production',
        features: [
          'Unlimited articles',
          'Custom integrations',
          'Dedicated account manager',
          'White-label options',
          'Advanced analytics',
          'Custom workflows'
        ]
      }
    ],
    successMetrics: {
      responseAccuracy: '96%',
      firstContactResolution: '89%',
      customerSatisfaction: '4.9/5',
      averageHandleTime: '15 seconds',
      costReduction: '78%',
      roiTimeline: '1-2 months'
    }
  },
  'social-media-manager': {
    name: 'AI Social Media Manager',
    subtitle: 'Automated Social Media Excellence',
    description: 'Automate your entire social media strategy with AI that creates, schedules, and optimizes content across all platforms for maximum engagement.',
    metrics: {
      responseTime: '<10 seconds',
      languages: '40+',
      accuracy: '94%',
      integrationTime: '<15 minutes'
    },
    category: 'Content Marketing',
    capabilities: [
      {
        icon: '📱',
        title: 'Multi-Platform Management',
        description: 'Manage all social media platforms from a single dashboard with platform-specific optimizations.'
      },
      {
        icon: '📊',
        title: 'Content Optimization',
        description: 'Optimize posts for each platform using AI-driven insights and engagement data.'
      },
      {
        icon: '🤖',
        title: 'Automated Posting',
        description: 'Schedule and publish content automatically at optimal times for maximum reach.'
      },
      {
        icon: '💬',
        title: 'Community Management',
        description: 'Respond to comments and messages automatically while maintaining authentic engagement.'
      },
      {
        icon: '📈',
        title: 'Performance Analytics',
        description: 'Track engagement, reach, and conversion metrics across all social platforms.'
      },
      {
        icon: '🎨',
        title: 'Visual Content Creation',
        description: 'Generate graphics, videos, and visual content optimized for each social platform.'
      }
    ],
    useCases: [
      {
        industry: 'Retail',
        applications: ['Product showcases', 'Sale announcements', 'Customer stories', 'Behind-the-scenes content']
      },
      {
        industry: 'Restaurants',
        applications: ['Menu highlights', 'Daily specials', 'Customer reviews', 'Event promotions']
      },
      {
        industry: 'Professional Services',
        applications: ['Industry insights', 'Client testimonials', 'Educational content', 'Company updates']
      },
      {
        industry: 'Entertainment',
        applications: ['Event promotion', 'Artist spotlights', 'Fan engagement', 'Content teasers']
      }
    ],
    features: [
      'Cross-platform content syndication',
      'Automated hashtag research',
      'Engagement automation',
      'Content calendar management',
      'Influencer identification',
      'Crisis management alerts',
      'Competitor analysis',
      'ROI tracking'
    ],
    integrations: [
      'Facebook', 'Instagram', 'Twitter', 'LinkedIn', 'TikTok', 'Pinterest', 'YouTube', 'Snapchat'
    ],
    pricing: [
      {
        name: 'Starter',
        price: '$99/month',
        description: 'For small businesses',
        features: [
          '3 social platforms',
          'Up to 100 posts/month',
          'Basic analytics',
          'Email support',
          'Content templates'
        ]
      },
      {
        name: 'Professional',
        price: '$299/month',
        description: 'For marketing teams',
        features: [
          'Unlimited platforms',
          'Up to 500 posts/month',
          'Advanced analytics',
          'Priority support',
          'Custom content creation',
          'Team collaboration'
        ]
      },
      {
        name: 'Enterprise',
        price: 'Custom',
        description: 'For large organizations',
        features: [
          'Unlimited everything',
          'Custom integrations',
          'Dedicated manager',
          'White-label options',
          'API access',
          'Advanced reporting'
        ]
      }
    ],
    successMetrics: {
      responseAccuracy: '94%',
      firstContactResolution: '87%',
      customerSatisfaction: '4.8/5',
      averageHandleTime: '8 seconds',
      costReduction: '82%',
      roiTimeline: '2-3 weeks'
    }
  },
  'email-marketing-automation': {
    name: 'Email Marketing Automation',
    subtitle: 'Intelligent Email Campaign Management',
    description: 'Create, optimize, and automate email campaigns that convert. AI-powered personalization and segmentation for maximum ROI.',
    metrics: {
      responseTime: '<5 seconds',
      languages: '35+',
      accuracy: '97%',
      integrationTime: '<20 minutes'
    },
    category: 'Content Marketing',
    capabilities: [
      {
        icon: '📧',
        title: 'Campaign Creation',
        description: 'Generate compelling email campaigns with personalized content and optimal send times.'
      },
      {
        icon: '🎯',
        title: 'Audience Segmentation',
        description: 'Intelligently segment audiences based on behavior, preferences, and engagement history.'
      },
      {
        icon: '📊',
        title: 'Performance Optimization',
        description: 'Continuously optimize campaigns using A/B testing and machine learning insights.'
      },
      {
        icon: '🤖',
        title: 'Automation Workflows',
        description: 'Create sophisticated automation sequences for nurturing and conversion.'
      },
      {
        icon: '📈',
        title: 'Analytics & Reporting',
        description: 'Track opens, clicks, conversions, and revenue attribution across all campaigns.'
      },
      {
        icon: '🔧',
        title: 'CRM Integration',
        description: 'Seamlessly sync with CRM systems for unified customer journey management.'
      }
    ],
    // Similar structure for other properties...
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
      'content marketing automation',
      'AI content generation',
      'marketing automation'
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
      <section className="bg-gradient-to-br from-orange-900 via-red-900 to-pink-900 text-white py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 bg-white/20 text-white">
              {agent.category} AI Agent
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              {agent.name}
            </h1>
            <p className="text-2xl text-orange-200 mb-8">
              {agent.subtitle}
            </p>
            <p className="text-xl text-gray-300 mb-10 max-w-4xl mx-auto">
              {agent.description}
            </p>
            
            {/* Key Metrics */}
            <div className="grid md:grid-cols-4 gap-6 mb-12">
              <Card className="p-4 bg-white/10 backdrop-blur border-white/20">
                <div className="text-2xl font-bold text-orange-400 mb-1">{agent.metrics.responseTime}</div>
                <div className="text-gray-300 text-sm">Response Time</div>
              </Card>
              <Card className="p-4 bg-white/10 backdrop-blur border-white/20">
                <div className="text-2xl font-bold text-red-400 mb-1">{agent.metrics.languages}</div>
                <div className="text-gray-300 text-sm">Languages</div>
              </Card>
              <Card className="p-4 bg-white/10 backdrop-blur border-white/20">
                <div className="text-2xl font-bold text-pink-400 mb-1">{agent.metrics.accuracy}</div>
                <div className="text-gray-300 text-sm">Accuracy</div>
              </Card>
              <Card className="p-4 bg-white/10 backdrop-blur border-white/20">
                <div className="text-2xl font-bold text-yellow-400 mb-1">{agent.metrics.integrationTime}</div>
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
                <h3 className="text-2xl font-bold mb-6 text-orange-600">Technology Stack</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Content Generation</h4>
                    <p className="text-gray-600 text-sm">{agent.techStack.processing}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Topic Analysis</h4>
                    <p className="text-gray-600 text-sm">{agent.techStack.intentRecognition}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Brand Voice Matching</h4>
                    <p className="text-gray-600 text-sm">{agent.techStack.sentimentAnalysis}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Content Library</h4>
                    <p className="text-gray-600 text-sm">{agent.techStack.database}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-8">
                <h3 className="text-2xl font-bold mb-6 text-red-600">Key Features</h3>
                <div className="space-y-3">
                  {agent.features.slice(0, 6).map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
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
                  <h3 className="text-xl font-bold mb-4 text-orange-600">{useCase.industry}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {useCase.applications.map((app, appIndex) => (
                      <div key={appIndex} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></div>
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
                Choose the perfect plan for your content needs
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {agent.pricing.map((plan, index) => (
                <Card key={index} className={`p-8 ${index === 1 ? 'ring-2 ring-orange-500 transform scale-105' : ''}`}>
                  {index === 1 && (
                    <Badge variant="primary" className="mb-4">Most Popular</Badge>
                  )}
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="text-3xl font-bold text-orange-600 mb-2">{plan.price}</div>
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
                <div className="text-2xl font-bold text-orange-600 mb-2">{agent.successMetrics.responseAccuracy}</div>
                <div className="text-gray-600 text-sm">Content Quality</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-2xl font-bold text-red-600 mb-2">{agent.successMetrics.firstContactResolution}</div>
                <div className="text-gray-600 text-sm">Engagement Rate</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-2xl font-bold text-pink-600 mb-2">{agent.successMetrics.customerSatisfaction}</div>
                <div className="text-gray-600 text-sm">Customer Satisfaction</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-2xl font-bold text-yellow-600 mb-2">{agent.successMetrics.averageHandleTime}</div>
                <div className="text-gray-600 text-sm">Generation Time</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">{agent.successMetrics.costReduction}</div>
                <div className="text-gray-600 text-sm">Cost Reduction</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">{agent.successMetrics.roiTimeline}</div>
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
              <p className="text-xl text-gray-600">Seamlessly connects with your content tools</p>
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
                <h3 className="text-lg font-bold mb-3">How quickly can content be generated?</h3>
                <p className="text-gray-600">Content generation takes 30 seconds to 2 minutes depending on length and complexity. Bulk generation is available for larger projects.</p>
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-3">Can it match our brand voice?</h3>
                <p className="text-gray-600">Yes, the AI learns your brand voice from existing content and maintains consistency across all generated pieces.</p>
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-3">Is the content SEO-optimized?</h3>
                <p className="text-gray-600">All content is automatically optimized for search engines with proper keyword integration and meta descriptions.</p>
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-3">Can we edit and customize the content?</h3>
                <p className="text-gray-600">Yes, all generated content can be edited, refined, and customized before publication through our editor interface.</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Transform Your Content Strategy?
            </h2>
            <p className="text-xl text-orange-100 mb-8">
              Start creating high-quality, engaging content with the {agent.name} today.
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
              <Link href="/ai-agents/content-marketing">
                <Button variant="outline">Browse Content Marketing Agents</Button>
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