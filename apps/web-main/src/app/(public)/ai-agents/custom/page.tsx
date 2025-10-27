import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  CpuChipIcon,
  CodeBracketIcon,
  AcademicCapIcon,
  RocketLaunchIcon,
  CheckIcon,
  ArrowRightIcon,
  StarIcon,
  PlayIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import OptimizedImage from '@/components/ui/OptimizedImage';

export const metadata: Metadata = {
  title: 'Custom AI Agents Development | Zoptal - Bespoke AI Solutions',
  description: 'Expert custom AI agents development services with tailored solutions, specialized integrations, and bespoke AI architectures for unique business requirements.',
  keywords: ['custom AI agents', 'bespoke AI development', 'tailored AI solutions', 'specialized AI systems', 'custom AI architecture', 'enterprise AI development'],
  openGraph: {
    title: 'Custom AI Agents Development | Zoptal',
    description: 'Expert custom AI agents development with tailored solutions and bespoke architectures.',
    images: ['/images/og-image.png'],
  },
};

const features = [
  {
    icon: CpuChipIcon,
    title: 'Bespoke AI Architecture',
    description: 'Custom-designed AI architectures tailored to your specific business logic and requirements.'
  },
  {
    icon: CodeBracketIcon,
    title: 'Specialized Development',
    description: 'Expert development team creating highly specialized AI agents for unique use cases.'
  },
  {
    icon: AcademicCapIcon,
    title: 'Domain Expertise',
    description: 'Deep domain knowledge across industries ensuring intelligent, context-aware AI solutions.'
  },
  {
    icon: RocketLaunchIcon,
    title: 'Scalable Solutions',
    description: 'Future-proof custom AI agents designed to scale with your business growth and evolution.'
  }
];

const services = [
  {
    title: 'Bespoke AI Agent Development',
    description: 'Fully custom AI agents built from scratch for unique business requirements',
    href: '/ai-agents/custom/bespoke',
    features: ['Custom Architecture Design', 'Proprietary Algorithm Development', 'Specialized Model Training']
  },
  {
    title: 'Industry-Specific Solutions',
    description: 'AI agents designed for specific industries with regulatory and compliance needs',
    href: '/ai-agents/custom/industry',
    features: ['Healthcare AI Compliance', 'Financial Services Security', 'Manufacturing Optimization']
  },
  {
    title: 'Enterprise AI Integration',
    description: 'Complex enterprise AI systems with advanced integrations and workflows',
    href: '/ai-agents/custom/enterprise',
    features: ['Multi-System Integration', 'Advanced Security Protocols', 'Custom API Development']
  }
];

const technologies = [
  'Custom Neural Networks', 'Proprietary Algorithms', 'Advanced NLP Models', 'Computer Vision Systems', 'Reinforcement Learning', 'Multi-Agent Systems',
  'Custom APIs', 'Microservices Architecture', 'Enterprise Security', 'Blockchain Integration', 'IoT Connectivity', 'Edge Computing'
];

const process = [
  {
    step: 1,
    title: 'Discovery & Requirements',
    description: 'Deep dive into business requirements, technical constraints, and unique challenges',
    duration: '2-4 weeks'
  },
  {
    step: 2,
    title: 'Custom Architecture Design',
    description: 'Design bespoke AI architecture with specialized algorithms and data models',
    duration: '3-5 weeks'
  },
  {
    step: 3,
    title: 'Iterative Development',
    description: 'Agile development with continuous feedback and refinement cycles',
    duration: '8-16 weeks'
  },
  {
    step: 4,
    title: 'Deployment & Optimization',
    description: 'Secure deployment with performance optimization and continuous monitoring',
    duration: 'Ongoing'
  }
];

const packages = [
  {
    name: 'Discovery Package',
    price: '$25,000',
    description: 'Comprehensive analysis and feasibility study for custom AI development',
    features: [
      'Technical feasibility analysis',
      'Requirements specification',
      'Architecture design proposal',
      'Technology stack recommendation',
      'Development timeline & budget',
      'Risk assessment report',
      'Proof of concept development'
    ],
    highlight: false
  },
  {
    name: 'Custom AI Development',
    price: '$150,000+',
    description: 'Full-scale custom AI agent development with ongoing support',
    features: [
      'Complete custom development',
      'Specialized algorithm design',
      'Custom model training',
      'Advanced security implementation',
      'Multi-platform deployment',
      'Performance optimization',
      'Documentation & training',
      '6 months support & updates'
    ],
    highlight: true
  },
  {
    name: 'Enterprise AI Platform',
    price: 'Custom Quote',
    description: 'Large-scale enterprise AI platform with multiple custom agents',
    features: [
      'Multi-agent system architecture',
      'Enterprise-grade security',
      'Advanced analytics platform',
      'Custom integrations suite',
      'Dedicated development team',
      'Executive advisory support',
      'Comprehensive training program',
      '12 months premium support'
    ],
    highlight: false
  }
];

export default function CustomAIAgentsPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-900 via-pink-800 to-rose-900 py-20">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-600/20 backdrop-blur-sm text-purple-200 text-sm font-medium mb-6">
                <CpuChipIcon className="h-4 w-4 mr-2" />
                Custom AI Agent Development
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Bespoke AI Agents
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent block">
                  Built for Your Vision
                </span>
              </h1>
              
              <p className="text-xl text-purple-100 mb-8 leading-relaxed">
                Transform unique business challenges into intelligent solutions with custom AI agents. 
                Our expert development team creates tailored AI architectures that perfectly align 
                with your specific requirements and industry constraints.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-8 py-4 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Start Custom Development
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/case-studies"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-lg border border-white/20 hover:bg-white/20 transition-colors"
                >
                  <PlayIcon className="mr-2 h-5 w-5" />
                  View Custom Projects
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative w-full h-96 rounded-2xl overflow-hidden">
                <OptimizedImage
                  src="/images/ai-agents/custom.webp"
                  alt="Custom AI Agents Development"
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
              Why Choose Custom AI Development
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Specialized expertise and tailored solutions for businesses with unique AI requirements
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-600 transition-colors">
                  <feature.icon className="h-8 w-8 text-purple-600 group-hover:text-white transition-colors" />
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
              Our Custom AI Development Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive custom development from conception to deployment and beyond
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
                      <CheckIcon className="h-5 w-5 text-purple-500 mr-3" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Link
                  href={service.href}
                  className="inline-flex items-center text-purple-600 font-semibold hover:text-purple-700 transition-colors"
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
              Advanced Technologies & Frameworks
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Cutting-edge technologies and proprietary frameworks for custom AI development
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            {technologies.map((tech, index) => (
              <span
                key={index}
                className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-800 font-medium rounded-full hover:bg-purple-100 hover:text-purple-800 transition-colors"
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
              Our Custom Development Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Structured approach ensuring successful delivery of bespoke AI solutions
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {process.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="w-12 h-12 bg-purple-600 text-white rounded-xl flex items-center justify-center font-bold text-lg mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600 mb-4">{step.description}</p>
                  <div className="flex items-center text-sm text-purple-600 font-medium">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    {step.duration}
                  </div>
                </div>
                {index < process.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-purple-200" />
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
              Custom Development Packages
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Flexible engagement models for custom AI development projects of any scale
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <div key={index} className={`relative bg-white rounded-2xl p-8 shadow-lg ${pkg.highlight ? 'ring-2 ring-purple-500 scale-105' : ''}`}>
                {pkg.highlight && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-purple-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                  <div className="text-4xl font-bold text-purple-600 mb-4">{pkg.price}</div>
                  <p className="text-gray-600">{pkg.description}</p>
                </div>
                
                <div className="space-y-4 mb-8">
                  {pkg.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center">
                      <CheckIcon className="h-5 w-5 text-purple-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Link
                  href="/contact"
                  className={`block w-full text-center py-3 px-6 rounded-lg font-semibold transition-colors ${
                    pkg.highlight 
                      ? 'bg-purple-600 text-white hover:bg-purple-700' 
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
      <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <StarIcon className="h-8 w-8 text-yellow-400 mr-2" />
            <StarIcon className="h-8 w-8 text-yellow-400 mr-2" />
            <StarIcon className="h-8 w-8 text-yellow-400 mr-2" />
            <StarIcon className="h-8 w-8 text-yellow-400 mr-2" />
            <StarIcon className="h-8 w-8 text-yellow-400" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Build Your Custom AI Solution?
          </h2>
          
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Join 50+ enterprises that trusted Zoptal for custom AI development. 
            Let's create an AI solution that's as unique as your business vision.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Start Custom Project
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/ai-agents"
              className="inline-flex items-center justify-center px-8 py-4 bg-purple-700 text-white font-semibold rounded-lg hover:bg-purple-800 transition-colors"
            >
              Explore All AI Services
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}