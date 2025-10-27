import { Metadata } from 'next';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';

export const metadata: Metadata = {
  title: 'Developer Docs | Guides & API Reference | Zoptal',
  description: 'Complete developer documentation & guides for Zoptal\'s platform. Best practices, API integration & development workflows.',
  keywords: [
    'developer documentation',
    'API documentation',
    'development guides',
    'integration tutorials',
    'technical documentation',
    'developer resources',
    'code examples',
  ],
};

const documentationSections = [
  {
    title: 'Getting Started',
    description: 'Quick start guides and initial setup instructions',
    icon: '🚀',
    links: [
      { title: 'Platform Overview', href: '/resources/documentation/overview' },
      { title: 'Quick Start Guide', href: '/resources/documentation/quickstart' },
      { title: 'Installation', href: '/resources/documentation/installation' },
      { title: 'First Project', href: '/resources/documentation/first-project' },
    ],
  },
  {
    title: 'Core Concepts',
    description: 'Fundamental concepts and architecture',
    icon: '📚',
    links: [
      { title: 'Architecture Overview', href: '/resources/documentation/architecture' },
      { title: 'Project Structure', href: '/resources/documentation/project-structure' },
      { title: 'Development Workflow', href: '/resources/documentation/workflow' },
      { title: 'Best Practices', href: '/resources/documentation/best-practices' },
    ],
  },
  {
    title: 'API Integration',
    description: 'Complete API reference and integration guides',
    icon: '🔌',
    links: [
      { title: 'API Reference', href: '/resources/api-reference' },
      { title: 'Authentication', href: '/resources/documentation/authentication' },
      { title: 'Rate Limits', href: '/resources/documentation/rate-limits' },
      { title: 'Webhooks', href: '/resources/documentation/webhooks' },
    ],
  },
  {
    title: 'Development Tools',
    description: 'CLI tools, SDKs, and development utilities',
    icon: '🛠️',
    links: [
      { title: 'CLI Reference', href: '/resources/documentation/cli' },
      { title: 'SDK Documentation', href: '/resources/documentation/sdks' },
      { title: 'Testing Tools', href: '/resources/documentation/testing' },
      { title: 'Debugging Guide', href: '/resources/documentation/debugging' },
    ],
  },
  {
    title: 'Deployment & DevOps',
    description: 'Deployment strategies and DevOps practices',
    icon: '🚢',
    links: [
      { title: 'Deployment Guide', href: '/resources/documentation/deployment' },
      { title: 'CI/CD Integration', href: '/resources/documentation/cicd' },
      { title: 'Environment Config', href: '/resources/documentation/environments' },
      { title: 'Monitoring & Logs', href: '/resources/documentation/monitoring' },
    ],
  },
  {
    title: 'Security',
    description: 'Security best practices and compliance',
    icon: '🔒',
    links: [
      { title: 'Security Overview', href: '/resources/documentation/security' },
      { title: 'Data Protection', href: '/resources/documentation/data-protection' },
      { title: 'Compliance', href: '/resources/documentation/compliance' },
      { title: 'Vulnerability Management', href: '/resources/documentation/vulnerabilities' },
    ],
  },
];

const popularGuides = [
  {
    title: 'Building Your First AI Agent',
    description: 'Learn how to create and deploy an AI agent in under 30 minutes',
    readTime: '15 min',
    category: 'Tutorial',
    href: '/resources/documentation/tutorials/first-ai-agent',
  },
  {
    title: 'Microservices Architecture Guide',
    description: 'Best practices for building scalable microservices with Zoptal',
    readTime: '20 min',
    category: 'Architecture',
    href: '/resources/documentation/guides/microservices',
  },
  {
    title: 'Real-time Features with WebSockets',
    description: 'Implement real-time communication in your applications',
    readTime: '12 min',
    category: 'Tutorial',
    href: '/resources/documentation/tutorials/websockets',
  },
  {
    title: 'Performance Optimization Techniques',
    description: 'Advanced techniques to optimize your application performance',
    readTime: '25 min',
    category: 'Performance',
    href: '/resources/documentation/guides/performance',
  },
];

const codeExamples = [
  {
    title: 'Authentication Flow',
    language: 'TypeScript',
    description: 'Implementing secure authentication',
  },
  {
    title: 'API Client Setup',
    language: 'JavaScript',
    description: 'Initialize and configure API client',
  },
  {
    title: 'Database Models',
    language: 'Python',
    description: 'Define and use database models',
  },
  {
    title: 'Webhook Handler',
    language: 'Node.js',
    description: 'Process incoming webhooks',
  },
];

export default function DocumentationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-600 to-blue-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Developer Documentation
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Everything you need to build, deploy, and scale applications with Zoptal. 
              From quick start guides to advanced API references.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <form className="relative">
                <Input
                  type="search"
                  placeholder="Search documentation..."
                  className="pl-12 pr-4 py-3 text-gray-900 bg-white"
                />
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
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
          </div>
        </div>
      </section>
      
      {/* Quick Links */}
      <section className="py-12 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                href="/resources/documentation/quickstart"
                className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-2xl">⚡</span>
                <div>
                  <div className="font-semibold">Quick Start</div>
                  <div className="text-sm text-gray-600">Get up and running</div>
                </div>
              </Link>
              <Link
                href="/resources/api-reference"
                className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-2xl">📡</span>
                <div>
                  <div className="font-semibold">API Reference</div>
                  <div className="text-sm text-gray-600">Complete API docs</div>
                </div>
              </Link>
              <Link
                href="/resources/documentation/tutorials"
                className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-2xl">🎓</span>
                <div>
                  <div className="font-semibold">Tutorials</div>
                  <div className="text-sm text-gray-600">Step-by-step guides</div>
                </div>
              </Link>
              <Link
                href="/resources/documentation/changelog"
                className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-2xl">📝</span>
                <div>
                  <div className="font-semibold">Changelog</div>
                  <div className="text-sm text-gray-600">Latest updates</div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Main Documentation Sections */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-12">Documentation</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {documentationSections.map((section) => (
                <Card key={section.title} className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <span className="text-3xl">{section.icon}</span>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">
                        {section.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {section.description}
                      </p>
                    </div>
                  </div>
                  
                  <ul className="space-y-2">
                    {section.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="text-blue-600 hover:text-blue-700 hover:underline text-sm"
                        >
                          {link.title} →
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Popular Guides */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-12">Popular Guides</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {popularGuides.map((guide) => (
                <Card key={guide.href} className="hover:shadow-lg transition-shadow">
                  <Link href={guide.href} className="block p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-semibold pr-4">
                        {guide.title}
                      </h3>
                      <Badge variant="outline" size="sm">
                        {guide.category}
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-3">
                      {guide.description}
                    </p>
                    <div className="flex items-center text-sm text-gray-500">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {guide.readTime} read
                    </div>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Code Examples */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-bold">Code Examples</h2>
              <Link
                href="/resources/documentation/examples"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                View All Examples →
              </Link>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {codeExamples.map((example) => (
                <Card key={example.title} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    <Badge variant="secondary" size="sm">
                      {example.language}
                    </Badge>
                  </div>
                  <h4 className="font-semibold mb-2">{example.title}</h4>
                  <p className="text-sm text-gray-600">
                    {example.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Help Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">
              Need Help?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Can't find what you're looking for? Our team is here to help.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 bg-white/10 backdrop-blur border-white/20 text-white">
                <svg className="w-12 h-12 mb-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h3 className="text-lg font-semibold mb-2">Community Forum</h3>
                <p className="text-blue-100 mb-4">
                  Join discussions with other developers
                </p>
                <Link
                  href="/community"
                  className="text-white hover:text-blue-100 font-medium"
                >
                  Visit Forum →
                </Link>
              </Card>
              
              <Card className="p-6 bg-white/10 backdrop-blur border-white/20 text-white">
                <svg className="w-12 h-12 mb-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <h3 className="text-lg font-semibold mb-2">Support Center</h3>
                <p className="text-blue-100 mb-4">
                  Get help from our support team
                </p>
                <Link
                  href="/resources/help-center"
                  className="text-white hover:text-blue-100 font-medium"
                >
                  Get Support →
                </Link>
              </Card>
              
              <Card className="p-6 bg-white/10 backdrop-blur border-white/20 text-white">
                <svg className="w-12 h-12 mb-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <h3 className="text-lg font-semibold mb-2">API Status</h3>
                <p className="text-blue-100 mb-4">
                  Check service status and uptime
                </p>
                <Link
                  href="https://status.zoptal.com"
                  className="text-white hover:text-blue-100 font-medium"
                >
                  View Status →
                </Link>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}