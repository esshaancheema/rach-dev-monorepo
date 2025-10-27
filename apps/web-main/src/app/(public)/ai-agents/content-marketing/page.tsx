import { Metadata } from 'next';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Content & Marketing AI Agents | Scale Content Creation 50x Faster | Zoptal',
  description: 'Scale your content creation and marketing impact with AI agents. 50x faster content production, 127% engagement increase, 312% ROI. Create blogs, social media, email campaigns at scale.',
  keywords: [
    'content marketing AI agents',
    'AI content creation',
    'marketing automation',
    'AI copywriting',
    'content generation at scale',
    'SEO content optimization',
    'social media automation',
    'email marketing AI',
    'brand voice AI',
    'content performance analytics'
  ],
  openGraph: {
    title: 'Content & Marketing AI Agents | Scale Content Creation 50x Faster',
    description: 'Transform your marketing operations with AI agents that create, optimize, distribute, and analyze content at unprecedented scale.',
    images: ['/images/ai-agents/content-marketing-og.png'],
  },
};

const keyBenefits = [
  {
    icon: '✍️',
    title: 'Unlimited Content Creation',
    description: 'Generate high-quality content in seconds - from blog posts to social media, emails to video scripts.'
  },
  {
    icon: '🎯',
    title: 'Hyper-Personalization',
    description: 'Deliver personalized content to each customer based on behavior, preferences, and journey stage.'
  },
  {
    icon: '📊',
    title: 'Data-Driven Optimization',
    description: 'Continuously improve performance with AI-powered A/B testing and real-time analytics.'
  },
  {
    icon: '🚀',
    title: 'Omnichannel Presence',
    description: 'Maintain consistent brand voice across all channels with coordinated content distribution.'
  },
  {
    icon: '⚡',
    title: 'Real-Time Adaptation',
    description: 'Respond instantly to trends, news, and customer feedback with agile content creation.'
  },
  {
    icon: '💡',
    title: 'Creative Intelligence',
    description: 'Combine human creativity with AI capabilities for innovative campaigns that stand out.'
  }
];

const contentAgents = [
  {
    category: 'Content Creation Agents',
    agents: [
      {
        name: 'BlogPost Generator',
        description: 'Creates SEO-optimized blog content with research and citations.',
        features: ['Topic research & ideation', 'SEO optimization', 'Fact-checking & citations', 'Multi-format support'],
        href: '/ai-agents/content-marketing/blog-generator'
      },
      {
        name: 'Article Writing Assistant',
        description: 'Long-form content creation with style adaptation and editing.',
        features: ['2000+ word articles', 'Style matching', 'Tone adjustment', 'Plagiarism checking'],
        href: '/ai-agents/content-marketing/article-assistant'
      },
      {
        name: 'Product Description Writer',
        description: 'E-commerce product descriptions that convert browsers to buyers.',
        features: ['Feature highlighting', 'Benefit articulation', 'SEO integration', 'Variant descriptions'],
        href: '/ai-agents/content-marketing/product-descriptions'
      },
      {
        name: 'Creative Copywriter Bot',
        description: 'Generates creative copy for ads, headlines, and campaigns.',
        features: ['Headline variations', 'Ad copy testing', 'Tagline generation', 'Creative concepts'],
        href: '/ai-agents/content-marketing/creative-copywriter'
      }
    ]
  },
  {
    category: 'Social Media Management Agents',
    agents: [
      {
        name: 'Social Media Content Creator',
        description: 'Multi-platform content generation with platform optimization.',
        features: ['Platform-specific formatting', 'Hashtag research', 'Trend incorporation', 'Visual suggestions'],
        href: '/ai-agents/content-marketing/social-content'
      },
      {
        name: 'Social Media Scheduler',
        description: 'Intelligent posting schedule optimization across platforms.',
        features: ['Optimal timing analysis', 'Cross-platform scheduling', 'Queue management', 'Performance tracking'],
        href: '/ai-agents/content-marketing/social-scheduler'
      },
      {
        name: 'Community Management Bot',
        description: 'Monitors and responds to social media engagement.',
        features: ['Comment moderation', 'Response automation', 'Sentiment analysis', 'Escalation handling'],
        href: '/ai-agents/content-marketing/community-manager'
      },
      {
        name: 'Social Listening Analyst',
        description: 'Monitors brand mentions and industry conversations.',
        features: ['Brand monitoring', 'Competitor tracking', 'Trend identification', 'Sentiment tracking'],
        href: '/ai-agents/content-marketing/social-listening'
      }
    ]
  },
  {
    category: 'Email Marketing Agents',
    agents: [
      {
        name: 'Email Campaign Creator',
        description: 'Designs and writes email campaigns with personalization.',
        features: ['Template creation', 'Dynamic content', 'Subject line optimization', 'Preview text generation'],
        href: '/ai-agents/content-marketing/email-campaigns'
      },
      {
        name: 'Newsletter Automation Agent',
        description: 'Produces regular newsletters with curated content.',
        features: ['Content curation', 'Layout optimization', 'Segment personalization', 'Send time optimization'],
        href: '/ai-agents/content-marketing/newsletter-automation'
      },
      {
        name: 'Drip Campaign Manager',
        description: 'Creates and manages automated email sequences.',
        features: ['Sequence planning', 'Trigger management', 'Behavior tracking', 'Performance optimization'],
        href: '/ai-agents/content-marketing/drip-campaigns'
      }
    ]
  },
  {
    category: 'SEO & SEM Agents',
    agents: [
      {
        name: 'SEO Content Optimizer',
        description: 'Optimizes content for search engine visibility.',
        features: ['Keyword research', 'On-page optimization', 'Meta tag generation', 'Schema markup'],
        href: '/ai-agents/content-marketing/seo-optimizer'
      },
      {
        name: 'Keyword Research Assistant',
        description: 'Discovers high-value keywords and content opportunities.',
        features: ['Competitor analysis', 'Gap identification', 'Search volume analysis', 'Difficulty assessment'],
        href: '/ai-agents/content-marketing/keyword-research'
      },
      {
        name: 'PPC Ad Copy Generator',
        description: 'Creates and optimizes paid search ad copy.',
        features: ['Ad variation testing', 'Extension writing', 'Landing page alignment', 'Quality score optimization'],
        href: '/ai-agents/content-marketing/ppc-generator'
      }
    ]
  }
];

const performanceMetrics = [
  {
    metric: 'Content Volume',
    before: '10 pieces/month',
    after: '500 pieces/month',
    increase: '5,000%'
  },
  {
    metric: 'Time to Publish',
    before: '3 days average',
    after: '30 minutes',
    reduction: '99%'
  },
  {
    metric: 'Engagement Rate',
    before: '2.3% average',
    after: '5.2% average',
    improvement: '126%'
  },
  {
    metric: 'Lead Generation',
    before: '50 leads/month',
    after: '850 leads/month',
    increase: '1,600%'
  }
];

const pricingPlans = [
  {
    name: 'Starter',
    price: '$699/month',
    description: 'For small businesses and startups',
    features: [
      '50 content pieces/month',
      '3 marketing agents',
      'Basic integrations',
      'Email support'
    ]
  },
  {
    name: 'Professional',
    price: '$2,499/month',
    description: 'For growing marketing teams',
    features: [
      '500 content pieces/month',
      '10 marketing agents',
      'Advanced integrations',
      'Priority support',
      'Custom templates'
    ]
  },
  {
    name: 'Enterprise',
    price: 'Custom Pricing',
    description: 'For large organizations',
    features: [
      'Unlimited content',
      'Unlimited agents',
      'Custom development',
      'Dedicated success manager',
      'SLA guarantee'
    ]
  },
  {
    name: 'Agency',
    price: '$4,999/month+',
    description: 'For marketing agencies',
    features: [
      'White-label options',
      'Multi-client management',
      'Bulk pricing',
      'API access',
      'Training included'
    ]
  }
];

export default function ContentMarketingAgentsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-900 via-red-900 to-pink-900 text-white py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 bg-white/20 text-white">
              Content & Marketing AI Agents
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-8">
              Scale Your Content Creation and
              <span className="block bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
                Marketing Impact
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-10 max-w-4xl mx-auto">
              Transform your marketing operations with AI agents that create, optimize, distribute, and analyze 
              content at unprecedented scale. Our marketing agents combine creativity with data-driven insights 
              to deliver personalized experiences that drive engagement and conversions.
            </p>
            
            {/* Key Metrics */}
            <div className="grid md:grid-cols-4 gap-6 mb-12">
              <Card className="p-6 bg-white/10 backdrop-blur border-white/20">
                <div className="text-2xl font-bold text-orange-400 mb-2">50x faster</div>
                <div className="text-gray-300">Content Production</div>
              </Card>
              <Card className="p-6 bg-white/10 backdrop-blur border-white/20">
                <div className="text-2xl font-bold text-pink-400 mb-2">+127%</div>
                <div className="text-gray-300">Engagement Rate</div>
              </Card>
              <Card className="p-6 bg-white/10 backdrop-blur border-white/20">
                <div className="text-2xl font-bold text-yellow-400 mb-2">312%</div>
                <div className="text-gray-300">Marketing ROI</div>
              </Card>
              <Card className="p-6 bg-white/10 backdrop-blur border-white/20">
                <div className="text-2xl font-bold text-red-400 mb-2">71%</div>
                <div className="text-gray-300">Cost Reduction</div>
              </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="white" size="lg" className="text-lg px-8 py-4">
                Build Custom Marketing Agent
              </Button>
              <Button variant="outline-white" size="lg" className="text-lg px-8 py-4">
                Browse Pre-Built Agents
              </Button>
              <Button variant="outline-white" size="lg" className="text-lg px-8 py-4">
                View Portfolio
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
                Why Content & Marketing AI Agents?
              </h2>
              <p className="text-xl text-gray-600">
                Transform your content strategy with intelligent automation
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

      {/* Performance Metrics */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">
                Real Performance Data
              </h2>
              <p className="text-xl text-gray-600">
                See the dramatic improvements our clients achieve
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {performanceMetrics.map((metric, index) => (
                <Card key={index} className="p-6 text-center">
                  <h3 className="text-lg font-bold mb-4">{metric.metric}</h3>
                  <div className="space-y-2 mb-4">
                    <div>
                      <span className="text-sm text-gray-500">Before: </span>
                      <span className="text-red-600">{metric.before}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">After: </span>
                      <span className="text-green-600 font-semibold">{metric.after}</span>
                    </div>
                  </div>
                  <Badge variant="primary" className="bg-green-100 text-green-800">
                    {metric.increase || metric.reduction || metric.improvement}
                  </Badge>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Comprehensive Agent List */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">
                Comprehensive List of Content & Marketing AI Agents
              </h2>
              <p className="text-xl text-gray-600">
                Specialized agents for every aspect of content marketing
              </p>
            </div>

            {contentAgents.map((category, categoryIndex) => (
              <div key={categoryIndex} className="mb-16">
                <h3 className="text-2xl font-bold mb-8 text-gray-900">
                  {categoryIndex + 1}. {category.category}
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {category.agents.map((agent, agentIndex) => (
                    <Card key={agentIndex} className="p-6 hover:shadow-lg transition-shadow">
                      <h4 className="text-lg font-bold mb-3 text-orange-600">{agent.name}</h4>
                      <p className="text-gray-600 mb-4">{agent.description}</p>
                      
                      <div className="space-y-2 mb-4">
                        {agent.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
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
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">
                Choose Your Marketing Power
              </h2>
              <p className="text-xl text-gray-600">
                Flexible investment tiers with proven returns
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {pricingPlans.map((plan, index) => (
                <Card key={index} className={`p-6 ${index === 1 ? 'ring-2 ring-orange-500 transform scale-105' : ''}`}>
                  {index === 1 && (
                    <Badge variant="primary" className="mb-4">Most Popular</Badge>
                  )}
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="text-2xl font-bold text-orange-600 mb-2">{plan.price}</div>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  
                  <div className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-3">
                        <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button variant={index === 1 ? 'primary' : 'outline'} className="w-full">
                    {plan.price.includes('Custom') ? 'Contact Sales' : 'Start Free Trial'}
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-pink-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Scale Your Marketing?
            </h2>
            <p className="text-xl text-orange-100 mb-8">
              Transform your content strategy and accelerate growth with intelligent AI agents.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button variant="white" size="lg" className="text-lg px-8 py-4">
                Start Building Free
              </Button>
              <Button variant="outline-white" size="lg" className="text-lg px-8 py-4">
                Schedule Demo
              </Button>
            </div>
            
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="text-3xl font-bold mb-2">2M+</div>
                <div className="text-orange-200">Content Pieces Created</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">500+</div>
                <div className="text-orange-200">Marketing Campaigns</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">234%</div>
                <div className="text-orange-200">Average ROI Increase</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">100+</div>
                <div className="text-orange-200">Languages Supported</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}