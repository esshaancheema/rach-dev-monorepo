import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { createMetadata } from '@/lib/seo/metadata';
import MainLayout from '@/components/layout/MainLayout';

export const metadata: Metadata = createMetadata({
  title: 'Resources | Documentation, API, Blog | Zoptal',
  description: 'Access comprehensive resources including developer documentation, API reference, blog insights, whitepapers, and help center for Zoptal platform.',
  path: '/resources',
  keywords: [
    'developer resources',
    'documentation',
    'API reference',
    'technical blog',
    'whitepapers',
    'help center',
    'developer guides'
  ]
});

const RESOURCE_CATEGORIES = [
  {
    title: 'Documentation',
    description: 'Complete developer guides and technical documentation',
    href: '/resources/documentation',
    icon: '📚',
    featured: true,
    color: 'from-blue-500 to-indigo-600',
    items: [
      'Getting Started Guide',
      'API Integration',
      'SDK Documentation',
      'Best Practices'
    ],
    badge: 'Updated',
  },
  {
    title: 'API Reference',
    description: 'Comprehensive API documentation and examples',
    href: '/resources/api-reference',
    icon: '⚡',
    featured: true,
    color: 'from-green-500 to-teal-600',
    items: [
      'REST API Reference',
      'GraphQL Schema',
      'Webhook Documentation',
      'Authentication Guide'
    ],
    badge: 'New',
  },
  {
    title: 'Blog',
    description: 'Latest insights, tutorials, and industry trends',
    href: '/resources/blog',
    icon: '✍️',
    color: 'from-purple-500 to-pink-600',
    items: [
      'Technical Tutorials',
      'Industry Insights',
      'Best Practices',
      'Case Study Deep Dives'
    ],
  },
  {
    title: 'Whitepapers',
    description: 'In-depth research reports and technical papers',
    href: '/resources/whitepapers',
    icon: '📊',
    color: 'from-orange-500 to-red-600',
    items: [
      'AI Development Trends',
      'Enterprise Architecture',
      'Security Best Practices',
      'Performance Optimization'
    ],
  },
  {
    title: 'Help Center',
    description: 'Support articles and troubleshooting guides',
    href: '/resources/help-center',
    icon: '❓',
    color: 'from-cyan-500 to-blue-600',
    items: [
      'FAQ',
      'Troubleshooting',
      'Video Tutorials',
      'Community Support'
    ],
  },
  {
    title: 'Templates',
    description: 'Ready-to-use templates and starter projects',
    href: '/resources/templates',
    icon: '🎨',
    color: 'from-indigo-500 to-purple-600',
    items: [
      'Project Templates',
      'Code Snippets',
      'UI Components',
      'Deployment Scripts'
    ],
    badge: 'Popular',
  },
];

const QUICK_LINKS = [
  {
    category: 'Getting Started',
    links: [
      { title: 'Quick Start Guide', href: '/resources/documentation/quick-start' },
      { title: 'Installation', href: '/resources/documentation/installation' },
      { title: 'First Project', href: '/resources/documentation/first-project' },
      { title: 'Authentication Setup', href: '/resources/documentation/auth' },
    ],
  },
  {
    category: 'Popular Articles',
    links: [
      { title: 'Building AI Agents', href: '/resources/blog/building-ai-agents' },
      { title: 'Microservices Architecture', href: '/resources/blog/microservices' },
      { title: 'React Best Practices', href: '/resources/blog/react-best-practices' },
      { title: 'API Design Principles', href: '/resources/blog/api-design' },
    ],
  },
  {
    category: 'Developer Tools',
    links: [
      { title: 'CLI Tools', href: '/resources/documentation/cli' },
      { title: 'VS Code Extension', href: '/resources/tools/vscode' },
      { title: 'Postman Collection', href: '/resources/tools/postman' },
      { title: 'Docker Images', href: '/resources/tools/docker' },
    ],
  },
  {
    category: 'Community',
    links: [
      { title: 'Discord Server', href: 'https://discord.gg/zoptal', external: true },
      { title: 'GitHub Discussions', href: 'https://github.com/zoptal/discussions', external: true },
      { title: 'Stack Overflow', href: 'https://stackoverflow.com/questions/tagged/zoptal', external: true },
      { title: 'Developer Forum', href: '/community' },
    ],
  },
];

export default function ResourcesPage() {
  return (
    <MainLayout showHeader={true} showFooter={true}>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="primary" size="lg" className="mb-6">
              Everything You Need to Build
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Developer
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {' '}Resources
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Comprehensive documentation, tutorials, and tools to help you build
              amazing applications with the Zoptal platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/resources/documentation">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started
                </Button>
              </Link>
              <Link href="/resources/api-reference">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  API Reference
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Resources */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Resources
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Essential resources to get you started and help you build better applications
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {RESOURCE_CATEGORIES.filter(resource => resource.featured).map((resource, index) => (
              <Card key={index} className="p-8 hover:shadow-xl transition-shadow duration-300 border-2 hover:border-blue-200">
                <Link href={resource.href} className="block">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`text-4xl p-3 rounded-lg bg-gradient-to-r ${resource.color} text-white inline-block`}>
                      {resource.icon}
                    </div>
                    {resource.badge && (
                      <Badge 
                        variant={resource.badge === 'New' ? 'success' : 'primary'}
                        size="sm"
                      >
                        {resource.badge}
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {resource.title}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {resource.description}
                  </p>
                  <div className="space-y-2">
                    {resource.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-center text-sm text-gray-700">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {item}
                      </div>
                    ))}
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* All Resources Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              All Resources
            </h2>
            <p className="text-xl text-gray-600">
              Browse our complete collection of developer resources
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {RESOURCE_CATEGORIES.map((resource, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow duration-300">
                <Link href={resource.href} className="block">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-3xl">{resource.icon}</div>
                    {resource.badge && (
                      <Badge 
                        variant={resource.badge === 'New' ? 'success' : resource.badge === 'Popular' ? 'secondary' : 'primary'}
                        size="sm"
                      >
                        {resource.badge}
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {resource.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {resource.description}
                  </p>
                  <div className="space-y-1">
                    {resource.items.slice(0, 3).map((item, itemIndex) => (
                      <div key={itemIndex} className="text-sm text-gray-700">
                        • {item}
                      </div>
                    ))}
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Quick Links
            </h2>
            <p className="text-xl text-gray-600">
              Jump to the most frequently accessed resources
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {QUICK_LINKS.map((section, index) => (
              <div key={index}>
                <h3 className="font-semibold text-gray-900 mb-4">{section.category}</h3>
                <div className="space-y-2">
                  {section.links.map((link, linkIndex) => (
                    <Link
                      key={linkIndex}
                      href={link.href}
                      className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
                      {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    >
                      {link.title}
                      {link.external && (
                        <svg className="w-3 h-3 inline ml-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                          <path d="M5 5a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2v-2a1 1 0 10-2 0v2H5V7h2a1 1 0 000-2H5z" />
                        </svg>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Stay Updated
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Get notified about new resources, tutorials, and platform updates
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-blue-300"
            />
            <Button variant="secondary" size="lg" className="px-8">
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}