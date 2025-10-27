import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { generateMetadata } from '@/lib/seo/metadata';
import MainLayout from '@/components/layout/MainLayout';

export const metadata: Metadata = generateMetadata({
  title: 'AI-Powered Solutions | Enterprise Software & Mobile Apps | Zoptal',
  description: 'Explore our comprehensive suite of AI-powered solutions including enterprise software, mobile apps, SaaS platforms, and intelligent automation tools.',
  path: '/solutions',
  keywords: [
    'AI solutions',
    'enterprise software',
    'mobile applications',
    'SaaS platforms',
    'automation tools',
    'custom software',
    'technology solutions'
  ]
});

const SOLUTION_CATEGORIES = [
  {
    title: 'Web Applications',
    description: 'Modern, scalable web applications built with cutting-edge technologies',
    href: '/solutions/products/web-apps',
    icon: '🌐',
    features: ['React/Next.js', 'Cloud-native', 'Real-time', 'Progressive Web Apps'],
    badge: 'Popular',
  },
  {
    title: 'Mobile Apps',
    description: 'Native and cross-platform mobile applications for iOS and Android',
    href: '/solutions/products/mobile-apps',
    icon: '📱',
    features: ['iOS/Android', 'React Native', 'Flutter', 'Native Performance'],
  },
  {
    title: 'AI Agents',
    description: 'Intelligent automation solutions powered by advanced AI',
    href: '/solutions/products/ai-agents',
    icon: '🤖',
    features: ['Machine Learning', 'Natural Language', 'Process Automation', 'Smart Analytics'],
    badge: 'New',
  },
  {
    title: 'SaaS Platforms',
    description: 'Scalable Software-as-a-Service solutions for modern businesses',
    href: '/solutions/products/saas',
    icon: '☁️',
    features: ['Multi-tenant', 'Scalable Architecture', 'API-first', 'Analytics Dashboard'],
  },
  {
    title: 'E-commerce',
    description: 'Complete e-commerce solutions with modern shopping experiences',
    href: '/solutions/products/ecommerce',
    icon: '🛍️',
    features: ['Headless Commerce', 'Payment Integration', 'Inventory Management', 'Mobile Optimized'],
  },
  {
    title: 'Enterprise Solutions',
    description: 'Large-scale enterprise applications with robust architecture',
    href: '/services/enterprise-solutions',
    icon: '🏢',
    features: ['Microservices', 'High Availability', 'Security First', 'Integration Ready'],
  },
];

const TECHNOLOGY_HIGHLIGHTS = [
  {
    category: 'Frontend',
    technologies: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
    icon: '⚡',
  },
  {
    category: 'Backend',
    technologies: ['Node.js', 'Python', 'PostgreSQL', 'Redis'],
    icon: '⚙️',
  },
  {
    category: 'AI/ML',
    technologies: ['TensorFlow', 'PyTorch', 'OpenAI', 'LangChain'],
    icon: '🧠',
  },
  {
    category: 'Cloud',
    technologies: ['AWS', 'Docker', 'Kubernetes', 'Serverless'],
    icon: '☁️',
  },
];

export default function SolutionsPage() {
  return (
    <MainLayout showHeader={true} showFooter={true}>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="primary" size="lg" className="mb-6">
              Trusted by 500+ Companies
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              AI-Powered Solutions for
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {' '}Modern Business
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              From web applications to AI agents, we deliver comprehensive solutions
              that transform your business and accelerate growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Your Project
                </Button>
              </Link>
              <Link href="/demos">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Explore Demos
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Solution Portfolio
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive solutions designed to meet diverse business needs,
              from startups to enterprise-scale organizations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SOLUTION_CATEGORIES.map((solution, index) => (
              <Card key={index} className="p-8 hover:shadow-lg transition-shadow duration-300">
                <Link href={solution.href} className="block">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-4xl">{solution.icon}</div>
                    {solution.badge && (
                      <Badge 
                        variant={solution.badge === 'New' ? 'success' : 'primary'}
                        size="sm"
                      >
                        {solution.badge}
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {solution.title}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {solution.description}
                  </p>
                  <div className="space-y-2">
                    {solution.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center text-sm text-gray-700">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </div>
                    ))}
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Built with Modern Technology
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We leverage the latest technologies and frameworks to deliver
              cutting-edge solutions that scale with your business.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {TECHNOLOGY_HIGHLIGHTS.map((tech, index) => (
              <Card key={index} className="p-6 text-center">
                <div className="text-3xl mb-4">{tech.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {tech.category}
                </h3>
                <div className="space-y-2">
                  {tech.technologies.map((technology, techIndex) => (
                    <div key={techIndex} className="text-sm text-gray-600">
                      {technology}
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ready to Build Your Solution?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Let's discuss your project requirements and create a custom solution
            that drives results for your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" className="w-full sm:w-auto">
                Get Started Today
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}