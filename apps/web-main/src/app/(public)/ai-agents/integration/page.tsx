import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  LinkIcon,
  CommandLineIcon,
  CloudIcon,
  CpuChipIcon,
  CheckIcon,
  ArrowRightIcon,
  StarIcon,
  PlayIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import OptimizedImage from '@/components/ui/OptimizedImage';

export const metadata: Metadata = {
  title: 'AI Agents Integration Services | Zoptal - System & API Integration',
  description: 'Expert AI agents integration services including API connections, system integration, workflow automation, and seamless platform connectivity.',
  keywords: ['AI agents integration', 'API integration', 'system integration', 'workflow automation', 'platform connectivity', 'data integration'],
  openGraph: {
    title: 'AI Agents Integration Services | Zoptal',
    description: 'Expert AI agents integration with APIs, systems, and workflow automation.',
    images: ['/images/og-image.png'],
  },
};

const features = [
  {
    icon: LinkIcon,
    title: 'API Integration',
    description: 'Seamless connection with existing APIs, databases, and third-party services.'
  },
  {
    icon: CommandLineIcon,
    title: 'System Connectivity',
    description: 'Integration with CRM, ERP, and enterprise systems for unified workflows.'
  },
  {
    icon: CloudIcon,
    title: 'Cloud Platform Integration',
    description: 'Native integration with AWS, Azure, Google Cloud, and other platforms.'
  },
  {
    icon: CpuChipIcon,
    title: 'Real-time Data Sync',
    description: 'Real-time data synchronization and processing across all connected systems.'
  }
];

const services = [
  {
    title: 'API & Database Integration',
    description: 'Connect AI agents with existing APIs, databases, and data sources',
    href: '/ai-agents/integration/api',
    features: ['REST API Integration', 'Database Connectivity', 'Data Transformation']
  },
  {
    title: 'Enterprise System Integration',
    description: 'Integrate with CRM, ERP, and other enterprise business systems',
    href: '/ai-agents/integration/enterprise',
    features: ['CRM Integration', 'ERP Connectivity', 'Business Process Automation']
  },
  {
    title: 'Workflow Automation',
    description: 'Automated workflows connecting multiple systems and processes',
    href: '/ai-agents/integration/workflow',
    features: ['Process Automation', 'Multi-system Workflows', 'Event-driven Actions']
  }
];

const technologies = [
  'REST APIs', 'GraphQL', 'WebSockets', 'Webhooks', 'OAuth', 'JWT', 'Zapier', 'Microsoft Power Automate',
  'Salesforce', 'HubSpot', 'SAP', 'Oracle', 'AWS Lambda', 'Azure Functions', 'Google Cloud Functions', 'Docker'
];

const process = [
  {
    step: 1,
    title: 'System Analysis',
    description: 'Comprehensive analysis of existing systems, APIs, and integration requirements',
    duration: '1 week'
  },
  {
    step: 2,
    title: 'Integration Design',
    description: 'Designing secure, scalable integration architecture and data flows',
    duration: '1-2 weeks'
  },
  {
    step: 3,
    title: 'Development & Testing',
    description: 'Building integrations with thorough testing and error handling',
    duration: '3-6 weeks'
  },
  {
    step: 4,
    title: 'Deployment & Monitoring',
    description: 'Production deployment with ongoing monitoring and optimization',
    duration: 'Ongoing'
  }
];

const packages = [
  {
    name: 'Basic Integration',
    price: '$10,000',
    description: 'Essential integrations for small to medium businesses',
    features: [
      '3-5 API integrations',
      'Basic data synchronization',
      'Standard authentication',
      'Error handling & logging',
      'Documentation & training',
      '3 months support'
    ],
    highlight: false
  },
  {
    name: 'Advanced Integration',
    price: '$25,000',
    description: 'Comprehensive integration solution for growing businesses',
    features: [
      '10+ API integrations',
      'Real-time data synchronization',
      'Advanced security & encryption',
      'Custom workflow automation',
      'Enterprise system connectivity',
      'Performance monitoring',
      'Team training & workshops',
      '6 months support'
    ],
    highlight: true
  },
  {
    name: 'Enterprise Integration',
    price: 'Custom Quote',
    description: 'Full-scale integration platform for large organizations',
    features: [
      'Unlimited integrations',
      'Complex workflow automation',
      'Enterprise security compliance',
      'Multi-environment deployment',
      'Advanced monitoring & analytics',
      'Custom integration platform',
      'Dedicated integration team',
      '12 months support'
    ],
    highlight: false
  }
];

export default function AIAgentsIntegrationPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-900 via-teal-800 to-cyan-900 py-20">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-600/20 backdrop-blur-sm text-green-200 text-sm font-medium mb-6">
                <LinkIcon className="h-4 w-4 mr-2" />
                AI Agents Integration
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Connect AI Agents
                <span className="bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent block">
                  To Everything
                </span>
              </h1>
              
              <p className="text-xl text-green-100 mb-8 leading-relaxed">
                Seamlessly integrate AI agents with your existing systems, APIs, and workflows. 
                Create unified, automated processes that connect all your business tools 
                and data sources for maximum efficiency and impact.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-8 py-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                >
                  Start Integration Project
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/case-studies"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-lg border border-white/20 hover:bg-white/20 transition-colors"
                >
                  <PlayIcon className="mr-2 h-5 w-5" />
                  View Integration Examples
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative w-full h-96 rounded-2xl overflow-hidden">
                <OptimizedImage
                  src="/images/ai-agents/integration.webp"
                  alt="AI Agents Integration Services"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our AI Integration Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Seamless connectivity that unifies your systems and maximizes AI agent effectiveness
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-green-600 transition-colors">
                  <feature.icon className="h-8 w-8 text-green-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our AI Integration Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive integration solutions for all your systems and workflows
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{service.title}</h3>
                <p className="text-gray-600 mb-6">{service.description}</p>
                
                <div className="space-y-3 mb-8">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-3" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Link
                  href={service.href}
                  className="inline-flex items-center text-green-600 font-semibold hover:text-green-700 transition-colors"
                >
                  Learn More
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technologies Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Integration Technologies & Platforms
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Advanced tools and platforms for seamless system connectivity
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            {technologies.map((tech, index) => (
              <span
                key={index}
                className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-800 font-medium rounded-full hover:bg-green-100 hover:text-green-800 transition-colors"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Integration Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Systematic approach ensuring secure, scalable, and reliable integrations
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {process.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="w-12 h-12 bg-green-600 text-white rounded-xl flex items-center justify-center font-bold text-lg mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600 mb-4">{step.description}</p>
                  <div className="flex items-center text-sm text-green-600 font-medium">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    {step.duration}
                  </div>
                </div>
                {index < process.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-green-200" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              AI Integration Packages
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the right integration solution for your connectivity needs
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <div key={index} className={`relative bg-white rounded-2xl p-8 shadow-lg ${pkg.highlight ? 'ring-2 ring-green-500 scale-105' : ''}`}>
                {pkg.highlight && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                  <div className="text-4xl font-bold text-green-600 mb-4">{pkg.price}</div>
                  <p className="text-gray-600">{pkg.description}</p>
                </div>
                
                <div className="space-y-4 mb-8">
                  {pkg.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Link
                  href="/contact"
                  className={`block w-full text-center py-3 px-6 rounded-lg font-semibold transition-colors ${
                    pkg.highlight 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-cyan-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <StarIcon className="h-8 w-8 text-yellow-400 mr-2" />
            <StarIcon className="h-8 w-8 text-yellow-400 mr-2" />
            <StarIcon className="h-8 w-8 text-yellow-400 mr-2" />
            <StarIcon className="h-8 w-8 text-yellow-400 mr-2" />
            <StarIcon className="h-8 w-8 text-yellow-400" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Connect Your Systems?
          </h2>
          
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Join 500+ companies that streamlined their operations with Zoptal AI integrations. 
            Let's connect your AI agents to create unified, automated workflows.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-green-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Start Integration Project
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/ai-agents"
              className="inline-flex items-center justify-center px-8 py-4 bg-green-700 text-white font-semibold rounded-lg hover:bg-green-800 transition-colors"
            >
              Explore AI Agents
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}