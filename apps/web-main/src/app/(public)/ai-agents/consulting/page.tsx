import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  LightBulbIcon,
  PresentationChartLineIcon,
  DocumentTextIcon,
  CogIcon,
  CheckIcon,
  ArrowRightIcon,
  StarIcon,
  PlayIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import OptimizedImage from '@/components/ui/OptimizedImage';

export const metadata: Metadata = {
  title: 'AI Agents Consulting Services | Zoptal - Strategy & Implementation',
  description: 'Expert AI agents consulting services including strategy development, ROI analysis, implementation planning, and digital transformation guidance.',
  keywords: ['AI agents consulting', 'AI strategy', 'digital transformation', 'AI implementation', 'business automation', 'AI ROI'],
  openGraph: {
    title: 'AI Agents Consulting Services | Zoptal',
    description: 'Expert AI agents consulting with strategy development and implementation planning.',
    images: ['/images/og-image.png'],
  },
};

const features = [
  {
    icon: LightBulbIcon,
    title: 'AI Strategy Development',
    description: 'Comprehensive AI strategy aligned with your business objectives and market opportunities.'
  },
  {
    icon: PresentationChartLineIcon,
    title: 'ROI Analysis & Planning',
    description: 'Data-driven analysis to maximize return on investment from AI agent implementations.'
  },
  {
    icon: DocumentTextIcon,
    title: 'Implementation Roadmap',
    description: 'Detailed roadmaps and timelines for successful AI agent deployment and adoption.'
  },
  {
    icon: CogIcon,
    title: 'Change Management',
    description: 'Organizational change management to ensure smooth AI adoption and team alignment.'
  }
];

const services = [
  {
    title: 'AI Strategy Consulting',
    description: 'Develop comprehensive AI strategies that align with business goals',
    href: '/ai-agents/consulting/strategy',
    features: ['Business Analysis', 'AI Opportunity Assessment', 'Strategic Planning']
  },
  {
    title: 'Implementation Planning',
    description: 'Detailed planning and roadmaps for AI agent deployment',
    href: '/ai-agents/consulting/planning',
    features: ['Technical Architecture', 'Resource Planning', 'Timeline Development']
  },
  {
    title: 'Digital Transformation',
    description: 'End-to-end digital transformation with AI at the core',
    href: '/ai-agents/consulting/transformation',
    features: ['Process Optimization', 'Technology Integration', 'Organizational Change']
  }
];

const technologies = [
  'Strategic Planning', 'Business Analysis', 'Process Mapping', 'ROI Modeling', 'Change Management', 'Agile Methodology',
  'Design Thinking', 'Lean Startup', 'Digital Transformation', 'AI Ethics', 'Governance Framework', 'Risk Assessment'
];

const process = [
  {
    step: 1,
    title: 'Current State Analysis',
    description: 'Comprehensive assessment of existing processes, systems, and AI readiness',
    duration: '1-2 weeks'
  },
  {
    step: 2,
    title: 'Strategy Development',
    description: 'Creating AI strategy aligned with business objectives and market opportunities',
    duration: '2-3 weeks'
  },
  {
    step: 3,
    title: 'Implementation Planning',
    description: 'Detailed roadmap, resource allocation, and timeline development',
    duration: '1-2 weeks'
  },
  {
    step: 4,
    title: 'Execution Support',
    description: 'Ongoing guidance, monitoring, and optimization throughout implementation',
    duration: 'Ongoing'
  }
];

const packages = [
  {
    name: 'Strategy Assessment',
    price: '$15,000',
    description: 'Essential AI strategy assessment for focused business areas',
    features: [
      'AI readiness assessment',
      'Opportunity identification',
      'High-level strategy development',
      'ROI estimation',
      'Implementation recommendations',
      '3 months follow-up support'
    ],
    highlight: false
  },
  {
    name: 'Comprehensive Consulting',
    price: '$35,000',
    description: 'Full-scale AI consulting for organizational transformation',
    features: [
      'Complete business analysis',
      'AI strategy & roadmap development',
      'Detailed implementation planning',
      'Change management strategy',
      'Risk assessment & mitigation',
      'Team training & workshops',
      'Ongoing advisory support',
      '6 months support'
    ],
    highlight: true
  },
  {
    name: 'Enterprise Transformation',
    price: 'Custom Quote',
    description: 'Large-scale digital transformation with AI leadership',
    features: [
      'Multi-department transformation',
      'Complex system integration planning',
      'Governance & compliance framework',
      'Executive leadership coaching',
      'Cross-functional team coordination',
      'Performance measurement systems',
      'Dedicated consulting team',
      '12 months support'
    ],
    highlight: false
  }
];

export default function AIAgentsConsultingPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 py-20">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-600/20 backdrop-blur-sm text-blue-200 text-sm font-medium mb-6">
                <LightBulbIcon className="h-4 w-4 mr-2" />
                AI Agents Consulting
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Strategic AI
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent block">
                  Implementation Guidance
                </span>
              </h1>
              
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Transform your business with expert AI agents consulting. We provide strategic 
                guidance, implementation planning, and change management to ensure successful 
                AI adoption and maximize your return on investment.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Start AI Consultation
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/case-studies"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-lg border border-white/20 hover:bg-white/20 transition-colors"
                >
                  <PlayIcon className="mr-2 h-5 w-5" />
                  View Success Stories
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative w-full h-96 rounded-2xl overflow-hidden">
                <OptimizedImage
                  src="/images/ai-agents/consulting.webp"
                  alt="AI Agents Consulting Services"
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
              Why Choose Our AI Agents Consulting
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Strategic guidance and implementation expertise to maximize your AI investment success
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-600 transition-colors">
                  <feature.icon className="h-8 w-8 text-blue-600 group-hover:text-white transition-colors" />
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
              Our AI Consulting Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive consulting services from strategy to successful implementation
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
                      <CheckIcon className="h-5 w-5 text-blue-500 mr-3" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Link
                  href={service.href}
                  className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700 transition-colors"
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
              Our Consulting Methodology
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Proven frameworks and methodologies for successful AI transformation
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            {technologies.map((tech, index) => (
              <span
                key={index}
                className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-800 font-medium rounded-full hover:bg-blue-100 hover:text-blue-800 transition-colors"
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
              Our Consulting Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Structured approach ensuring strategic alignment and successful AI implementation
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {process.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-lg mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600 mb-4">{step.description}</p>
                  <div className="flex items-center text-sm text-blue-600 font-medium">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    {step.duration}
                  </div>
                </div>
                {index < process.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-blue-200" />
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
              AI Consulting Packages
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the right level of consulting support for your AI transformation
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <div key={index} className={`relative bg-white rounded-2xl p-8 shadow-lg ${pkg.highlight ? 'ring-2 ring-blue-500 scale-105' : ''}`}>
                {pkg.highlight && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                  <div className="text-4xl font-bold text-blue-600 mb-4">{pkg.price}</div>
                  <p className="text-gray-600">{pkg.description}</p>
                </div>
                
                <div className="space-y-4 mb-8">
                  {pkg.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center">
                      <CheckIcon className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Link
                  href="/contact"
                  className={`block w-full text-center py-3 px-6 rounded-lg font-semibold transition-colors ${
                    pkg.highlight 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
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
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <StarIcon className="h-8 w-8 text-yellow-400 mr-2" />
            <StarIcon className="h-8 w-8 text-yellow-400 mr-2" />
            <StarIcon className="h-8 w-8 text-yellow-400 mr-2" />
            <StarIcon className="h-8 w-8 text-yellow-400 mr-2" />
            <StarIcon className="h-8 w-8 text-yellow-400" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Business with AI?
          </h2>
          
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join 300+ companies that partnered with Zoptal for strategic AI transformation. 
            Let's develop a winning AI strategy that drives measurable business results.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Schedule AI Strategy Session
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/ai-agents"
              className="inline-flex items-center justify-center px-8 py-4 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors"
            >
              Explore AI Agents
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}