import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  CpuChipIcon,
  ServerIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  CheckIcon,
  ArrowRightIcon,
  StarIcon,
  PlayIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import OptimizedImage from '@/components/ui/OptimizedImage';

export const metadata: Metadata = {
  title: 'API Development Services | Zoptal - REST, GraphQL & Microservices',
  description: 'Professional API development services including REST APIs, GraphQL, microservices architecture. Secure, scalable, and well-documented APIs for your applications.',
  keywords: ['API development', 'REST API', 'GraphQL', 'microservices', 'API integration', 'backend development'],
  openGraph: {
    title: 'API Development Services | Zoptal',
    description: 'Professional API development services with REST, GraphQL, and microservices architecture.',
    images: ['/images/og-image.png'],
  },
};

const features = [
  {
    icon: CpuChipIcon,
    title: 'High-Performance APIs',
    description: 'Optimized APIs with caching, load balancing, and efficient data processing.'
  },
  {
    icon: ServerIcon,
    title: 'Scalable Architecture',
    description: 'Microservices and containerized solutions that grow with your business.'
  },
  {
    icon: ShieldCheckIcon,
    title: 'Enterprise Security',
    description: 'Authentication, authorization, encryption, and comprehensive security measures.'
  },
  {
    icon: DocumentTextIcon,
    title: 'Complete Documentation',
    description: 'Interactive API documentation with examples and testing capabilities.'
  }
];

const services = [
  {
    title: 'REST API Development',
    description: 'Traditional REST APIs with complete CRUD operations and standard protocols',
    href: '/services/api-development/rest',
    features: ['RESTful Standards', 'JSON/XML Support', 'HTTP Status Codes']
  },
  {
    title: 'GraphQL APIs',
    description: 'Modern GraphQL APIs with flexible queries and real-time subscriptions',
    href: '/services/api-development/graphql',
    features: ['Query Flexibility', 'Type Safety', 'Real-time Updates']
  },
  {
    title: 'Microservices Architecture',
    description: 'Distributed microservices with independent scaling and deployment',
    href: '/services/api-development/microservices',
    features: ['Service Isolation', 'Independent Scaling', 'Fault Tolerance']
  }
];

const technologies = [
  'Node.js', 'Express.js', 'NestJS', 'GraphQL', 'Apollo', 'Prisma', 'PostgreSQL', 'MongoDB',
  'Redis', 'Docker', 'Kubernetes', 'AWS API Gateway', 'Swagger/OpenAPI', 'Jest', 'Postman', 'gRPC'
];

const process = [
  {
    step: 1,
    title: 'Requirements Analysis',
    description: 'Understanding your data models, business logic, and integration needs',
    duration: '1 week'
  },
  {
    step: 2,
    title: 'API Design & Architecture',
    description: 'Designing endpoints, data structures, and security specifications',
    duration: '1-2 weeks'
  },
  {
    step: 3,
    title: 'Development & Testing',
    description: 'Building APIs with comprehensive testing and performance optimization',
    duration: '4-8 weeks'
  },
  {
    step: 4,
    title: 'Documentation & Deployment',
    description: 'Creating documentation, deploying to production, and providing support',
    duration: '1 week'
  }
];

const packages = [
  {
    name: 'Starter API',
    price: '$8,000',
    description: 'Basic API with essential features for small applications',
    features: [
      'REST API development',
      'Basic authentication',
      '5-10 endpoints',
      'Database integration',
      'API documentation',
      '3 months support'
    ],
    highlight: false
  },
  {
    name: 'Professional API',
    price: '$20,000',
    description: 'Advanced API solution for growing businesses',
    features: [
      'REST & GraphQL APIs',
      'JWT authentication & authorization',
      'Rate limiting & caching',
      '20+ endpoints',
      'Microservices architecture',
      'Comprehensive testing',
      'Interactive documentation',
      '6 months support'
    ],
    highlight: true
  },
  {
    name: 'Enterprise API',
    price: 'Custom Quote',
    description: 'Full-scale API ecosystem with enterprise features',
    features: [
      'Multi-protocol APIs (REST, GraphQL, gRPC)',
      'Enterprise security & compliance',
      'Auto-scaling & load balancing',
      'API gateway & management',
      'Third-party integrations',
      'Monitoring & analytics',
      'Dedicated team',
      '12 months support'
    ],
    highlight: false
  }
];

export default function APIDevelopmentPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-900 via-red-800 to-pink-900 py-20">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-orange-600/20 backdrop-blur-sm text-orange-200 text-sm font-medium mb-6">
                <CpuChipIcon className="h-4 w-4 mr-2" />
                API Development Services
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                APIs That Power
                <span className="bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent block">
                  Digital Innovation
                </span>
              </h1>
              
              <p className="text-xl text-orange-100 mb-8 leading-relaxed">
                Build robust, scalable APIs that connect your applications and enable seamless 
                data flow. From REST to GraphQL, microservices to enterprise integrations, 
                we create APIs that drive your business forward.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-8 py-4 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Start Your API Project
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/case-studies"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-lg border border-white/20 hover:bg-white/20 transition-colors"
                >
                  <PlayIcon className="mr-2 h-5 w-5" />
                  View API Examples
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative w-full h-96 rounded-2xl overflow-hidden">
                <OptimizedImage
                  src="/images/services/api-development.webp"
                  alt="API Development Services"
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
              Why Choose Our API Development Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We build APIs that are secure, scalable, and perfectly tailored to your business needs
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-orange-600 transition-colors">
                  <feature.icon className="h-8 w-8 text-orange-600 group-hover:text-white transition-colors" />
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
              Our API Development Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive API solutions for every architectural pattern and use case
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
                      <CheckIcon className="h-5 w-5 text-orange-500 mr-3" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Link
                  href={service.href}
                  className="inline-flex items-center text-orange-600 font-semibold hover:text-orange-700 transition-colors"
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
              API Technologies & Tools
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Modern tools and frameworks for building robust, scalable APIs
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            {technologies.map((tech, index) => (
              <span
                key={index}
                className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-800 font-medium rounded-full hover:bg-orange-100 hover:text-orange-800 transition-colors"
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
              Our API Development Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A systematic approach ensuring robust, well-documented, and secure APIs
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {process.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="w-12 h-12 bg-orange-600 text-white rounded-xl flex items-center justify-center font-bold text-lg mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600 mb-4">{step.description}</p>
                  <div className="flex items-center text-sm text-orange-600 font-medium">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    {step.duration}
                  </div>
                </div>
                {index < process.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-orange-200" />
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
              API Development Packages
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the right API solution for your project requirements
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <div key={index} className={`relative bg-white rounded-2xl p-8 shadow-lg ${pkg.highlight ? 'ring-2 ring-orange-500 scale-105' : ''}`}>
                {pkg.highlight && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                  <div className="text-4xl font-bold text-orange-600 mb-4">{pkg.price}</div>
                  <p className="text-gray-600">{pkg.description}</p>
                </div>
                
                <div className="space-y-4 mb-8">
                  {pkg.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center">
                      <CheckIcon className="h-5 w-5 text-orange-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Link
                  href="/contact"
                  className={`block w-full text-center py-3 px-6 rounded-lg font-semibold transition-colors ${
                    pkg.highlight 
                      ? 'bg-orange-600 text-white hover:bg-orange-700' 
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
      <section className="py-20 bg-gradient-to-r from-orange-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <StarIcon className="h-8 w-8 text-yellow-400 mr-2" />
            <StarIcon className="h-8 w-8 text-yellow-400 mr-2" />
            <StarIcon className="h-8 w-8 text-yellow-400 mr-2" />
            <StarIcon className="h-8 w-8 text-yellow-400 mr-2" />
            <StarIcon className="h-8 w-8 text-yellow-400" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Build Powerful APIs?
          </h2>
          
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Join 800+ companies that rely on Zoptal for their API development needs. 
            Let's create APIs that scale with your business and drive innovation.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-orange-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Start Your API Project
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center justify-center px-8 py-4 bg-orange-700 text-white font-semibold rounded-lg hover:bg-orange-800 transition-colors"
            >
              View All Services
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}