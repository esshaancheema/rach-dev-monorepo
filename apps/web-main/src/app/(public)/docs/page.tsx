import { Metadata } from 'next';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

export const metadata: Metadata = {
  title: 'Documentation - Complete Developer Guide | Zoptal',
  description: 'Comprehensive documentation for Zoptal platform. Get started with guides, tutorials, API references, and best practices for building applications.',
  keywords: [
    'documentation',
    'developer guide',
    'API documentation',
    'getting started',
    'tutorials',
    'guides',
    'developer resources',
    'platform documentation',
    'integration guide',
  ],
  alternates: {
    canonical: 'https://zoptal.com/docs',
  },
};

const documentationSections = [
  {
    title: 'Getting Started',
    description: 'Quick start guides and platform overview',
    icon: '🚀',
    color: 'from-green-500 to-green-600',
    articles: 12,
    estimatedTime: '30 min',
    topics: [
      'Platform Overview',
      'Account Setup',
      'First Project',
      'Basic Concepts',
    ],
    href: '/docs/getting-started',
    featured: true,
  },
  {
    title: 'API Reference',
    description: 'Complete REST API and GraphQL documentation',
    icon: '🔌',
    color: 'from-blue-500 to-blue-600',
    articles: 45,
    estimatedTime: '2 hours',
    topics: [
      'Authentication',
      'REST Endpoints',
      'GraphQL Schema',
      'Rate Limiting',
    ],
    href: '/docs/api',
    featured: true,
  },
  {
    title: 'AI Agents',
    description: 'Build and deploy intelligent AI agents',
    icon: '🤖',
    color: 'from-purple-500 to-purple-600',
    articles: 23,
    estimatedTime: '1.5 hours',
    topics: [
      'Agent Creation',
      'Training Models',
      'Deployment',
      'Integration',
    ],
    href: '/docs/ai-agents',
    featured: true,
  },
  {
    title: 'Deployment',
    description: 'Deploy applications and manage infrastructure',
    icon: '🚢',
    color: 'from-orange-500 to-orange-600',
    articles: 18,
    estimatedTime: '45 min',
    topics: [
      'Build Process',
      'Environment Config',
      'Custom Domains',
      'Monitoring',
    ],
    href: '/docs/deployment',
    featured: false,
  },
  {
    title: 'Integrations',
    description: 'Connect with third-party services and tools',
    icon: '🔗',
    color: 'from-teal-500 to-teal-600',
    articles: 28,
    estimatedTime: '1 hour',
    topics: [
      'GitHub Integration',
      'CI/CD Pipelines',
      'Databases',
      'External APIs',
    ],
    href: '/docs/integrations',
    featured: false,
  },
  {
    title: 'Security',
    description: 'Security best practices and compliance',
    icon: '🔐',
    color: 'from-red-500 to-red-600',
    articles: 15,
    estimatedTime: '45 min',
    topics: [
      'Authentication',
      'Authorization',
      'Data Protection',
      'Compliance',
    ],
    href: '/docs/security',
    featured: false,
  },
];

const popularGuides = [
  {
    title: 'Build Your First AI Agent',
    description: 'Step-by-step guide to creating and deploying an AI agent',
    category: 'AI Agents',
    readTime: '15 min',
    difficulty: 'Beginner',
    href: '/docs/guides/first-ai-agent',
  },
  {
    title: 'API Authentication Guide',
    description: 'Complete guide to authenticating with Zoptal APIs',
    category: 'API Reference',
    readTime: '10 min',
    difficulty: 'Intermediate',
    href: '/docs/guides/api-auth',
  },
  {
    title: 'Setting Up CI/CD Pipeline',
    description: 'Automate deployments with continuous integration',
    category: 'Deployment',
    readTime: '20 min',
    difficulty: 'Advanced',
    href: '/docs/guides/cicd-setup',
  },
  {
    title: 'Custom Domain Configuration',
    description: 'Connect your own domain to Zoptal applications',
    category: 'Deployment',
    readTime: '8 min',
    difficulty: 'Beginner',
    href: '/docs/guides/custom-domains',
  },
];

const sdks = [
  {
    name: 'JavaScript/TypeScript',
    description: 'Official SDK for Node.js and browser applications',
    version: 'v2.1.0',
    href: '/docs/sdks/javascript',
    logo: '🟨',
  },
  {
    name: 'Python',
    description: 'Python SDK for backend applications and AI workflows',
    version: 'v1.8.2',
    href: '/docs/sdks/python',
    logo: '🐍',
  },
  {
    name: 'Go',
    description: 'Lightweight Go SDK for high-performance applications',
    version: 'v1.5.1',
    href: '/docs/sdks/go',
    logo: '🐹',
  },
  {
    name: 'Rust',
    description: 'Memory-safe Rust SDK for system-level integration',
    version: 'v0.9.0',
    href: '/docs/sdks/rust',
    logo: '🦀',
  },
];

export default function DocumentationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-900 to-gray-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Developer Documentation
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Everything you need to build amazing applications with Zoptal. 
              From quick starts to advanced integrations.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <form className="relative">
                <Input
                  type="search"
                  placeholder="Search documentation..."
                  className="pl-12 pr-4 py-4 text-gray-900 bg-white text-lg border-0"
                />
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </form>
            </div>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/docs/getting-started">
                <Button variant="white" size="lg">
                  Get Started
                </Button>
              </Link>
              <Link href="/docs/api">
                <Button variant="outline-white" size="lg">
                  API Reference
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Documentation Sections */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-6">Documentation Sections</h2>
              <p className="text-lg text-gray-600">
                Comprehensive guides organized by topic and experience level
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documentationSections.map((section) => (
                <Card 
                  key={section.title} 
                  className={`p-6 transition-all hover:shadow-xl ${
                    section.featured ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                  }`}
                >
                  <Link href={section.href}>
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${section.color} rounded-lg flex items-center justify-center text-2xl`}>
                        {section.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{section.title}</h3>
                        <p className="text-gray-600 text-sm mb-3">{section.description}</p>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                          <span>{section.articles} articles</span>
                          <span>•</span>
                          <span>{section.estimatedTime}</span>
                        </div>
                        
                        <div className="space-y-1">
                          {section.topics.map((topic) => (
                            <div key={topic} className="text-sm text-blue-600 hover:text-blue-700">
                              → {topic}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {section.featured && (
                      <Badge className="bg-blue-100 text-blue-700 text-xs">
                        Popular
                      </Badge>
                    )}
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Popular Guides */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-6">Popular Guides</h2>
              <p className="text-lg text-gray-600">
                Most helpful tutorials and guides from the community
              </p>
            </div>
            
            <div className="space-y-4">
              {popularGuides.map((guide, index) => (
                <Card key={index} className="p-6 hover:shadow-md transition-shadow">
                  <Link href={guide.href}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant="outline" size="sm">
                            {guide.category}
                          </Badge>
                          <span className="text-sm text-gray-500">{guide.readTime}</span>
                          <Badge 
                            variant="outline" 
                            size="sm"
                            className={
                              guide.difficulty === 'Beginner' ? 'bg-green-50 text-green-700' :
                              guide.difficulty === 'Intermediate' ? 'bg-yellow-50 text-yellow-700' :
                              'bg-red-50 text-red-700'
                            }
                          >
                            {guide.difficulty}
                          </Badge>
                        </div>
                        <h3 className="text-lg font-semibold mb-2 hover:text-blue-600 transition-colors">
                          {guide.title}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {guide.description}
                        </p>
                      </div>
                      <svg 
                        className="w-5 h-5 text-gray-400 ml-4 flex-shrink-0" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M9 5l7 7-7 7" 
                        />
                      </svg>
                    </div>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* SDKs and Libraries */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-6">SDKs & Libraries</h2>
              <p className="text-lg text-gray-600">
                Official SDKs and client libraries for popular programming languages
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {sdks.map((sdk) => (
                <Card key={sdk.name} className="p-6 hover:shadow-lg transition-shadow">
                  <Link href={sdk.href}>
                    <div className="flex items-start gap-4">
                      <span className="text-3xl">{sdk.logo}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold">{sdk.name}</h3>
                          <Badge variant="outline" size="sm">
                            {sdk.version}
                          </Badge>
                        </div>
                        <p className="text-gray-600 text-sm">
                          {sdk.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Community and Support */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">
              Need More Help?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join our community of developers or get direct support from our team.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 bg-white/10 backdrop-blur border-white/20 text-center">
                <span className="text-4xl mb-4 block">💬</span>
                <h3 className="font-semibold mb-3">Community</h3>
                <p className="text-blue-100 mb-4 text-sm">
                  Connect with other developers
                </p>
                <Link href="/community">
                  <Button variant="white" size="sm" className="w-full">
                    Join Discord
                  </Button>
                </Link>
              </Card>
              
              <Card className="p-6 bg-white/10 backdrop-blur border-white/20 text-center">
                <span className="text-4xl mb-4 block">🎥</span>
                <h3 className="font-semibold mb-3">Tutorials</h3>
                <p className="text-blue-100 mb-4 text-sm">
                  Video guides and walkthroughs
                </p>
                <Link href="/resources/tutorials">
                  <Button variant="white" size="sm" className="w-full">
                    Watch Videos
                  </Button>
                </Link>
              </Card>
              
              <Card className="p-6 bg-white/10 backdrop-blur border-white/20 text-center">
                <span className="text-4xl mb-4 block">🚀</span>
                <h3 className="font-semibold mb-3">Support</h3>
                <p className="text-blue-100 mb-4 text-sm">
                  Get help from our team
                </p>
                <Link href="/support">
                  <Button variant="white" size="sm" className="w-full">
                    Contact Support
                  </Button>
                </Link>
              </Card>
            </div>
            
            <div className="mt-8 p-4 bg-white/10 rounded-lg">
              <p className="text-sm text-blue-100">
                <strong>Contributing:</strong> Found an issue or want to improve our docs? 
                <Link href="https://github.com/zoptal/docs" className="text-white hover:underline ml-1">
                  Contribute on GitHub →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Quick Links */}
      <section className="py-16 bg-white border-t">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-8">Quick Access</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/docs/api" className="block p-4 border rounded-lg hover:shadow-md transition-shadow">
                <h3 className="font-semibold mb-2">API Reference</h3>
                <p className="text-sm text-gray-600">Complete API documentation</p>
              </Link>
              <Link href="/docs/getting-started" className="block p-4 border rounded-lg hover:shadow-md transition-shadow">
                <h3 className="font-semibold mb-2">Getting Started</h3>
                <p className="text-sm text-gray-600">Quick start guides</p>
              </Link>
              <Link href="/resources/help-center" className="block p-4 border rounded-lg hover:shadow-md transition-shadow">
                <h3 className="font-semibold mb-2">Help Center</h3>
                <p className="text-sm text-gray-600">FAQs and support articles</p>
              </Link>
              <Link href="/support" className="block p-4 border rounded-lg hover:shadow-md transition-shadow">
                <h3 className="font-semibold mb-2">Contact Support</h3>
                <p className="text-sm text-gray-600">Get help from our team</p>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}