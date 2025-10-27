import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  ComputerDesktopIcon,
  CloudIcon,
  ServerIcon,
  CubeIcon,
  CheckIcon,
  ArrowRightIcon,
  StarIcon,
  PlayIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import OptimizedImage from '@/components/ui/OptimizedImage';

export const metadata: Metadata = {
  title: 'Software Development Services | Zoptal - Complete Development Solutions',
  description: 'Comprehensive software development services including web applications, desktop software, SaaS platforms, and enterprise systems with modern technologies.',
  keywords: ['software development', 'web applications', 'desktop software', 'SaaS development', 'enterprise software', 'system architecture'],
  openGraph: {
    title: 'Software Development Services | Zoptal',
    description: 'Comprehensive software development services with modern technologies and architectures.',
    images: ['/images/og-image.png'],
  },
};

const features = [
  {
    icon: ComputerDesktopIcon,
    title: 'Full-Stack Development',
    description: 'Complete web and desktop application development with modern frameworks and technologies.'
  },
  {
    icon: CloudIcon,
    title: 'SaaS & Cloud Solutions',
    description: 'Scalable Software-as-a-Service platforms and cloud-native applications.'
  },
  {
    icon: ServerIcon,
    title: 'Enterprise Systems',
    description: 'Large-scale enterprise software solutions with robust architecture and security.'
  },
  {
    icon: CubeIcon,
    title: 'Modern Architecture',
    description: 'Microservices, serverless, and distributed system architectures for scalability.'
  }
];

const services = [
  {
    title: 'Web Application Development',
    description: 'Modern web applications with responsive design and advanced functionality',
    href: '/services/software-development/web-apps',
    features: ['React/Vue.js/Angular', 'Progressive Web Apps', 'Real-time Features']
  },
  {
    title: 'SaaS Platform Development',
    description: 'Scalable Software-as-a-Service platforms with subscription management',
    href: '/services/software-development/saas',
    features: ['Multi-tenant Architecture', 'Billing Integration', 'User Management']
  },
  {
    title: 'Desktop & Cross-Platform',
    description: 'Native desktop applications and cross-platform solutions',
    href: '/services/software-development/desktop',
    features: ['Native Applications', 'Cross-platform Tools', 'System Integration']
  }
];

const technologies = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', '.NET', 'React', 'Vue.js', 'Angular', 'Node.js',
  'Express.js', 'Django', 'Spring Boot', 'PostgreSQL', 'MongoDB', 'Redis', 'AWS', 'Azure', 'Docker', 'Kubernetes'
];

const process = [
  {
    step: 1,
    title: 'Requirements Gathering',
    description: 'Understanding business needs, technical requirements, and project scope',
    duration: '1-2 weeks'
  },
  {
    step: 2,
    title: 'Architecture & Design',
    description: 'System architecture design, technology selection, and project planning',
    duration: '1-2 weeks'
  },
  {
    step: 3,
    title: 'Development & Testing',
    description: 'Agile development with continuous testing and quality assurance',
    duration: '8-16 weeks'
  },
  {
    step: 4,
    title: 'Deployment & Support',
    description: 'Production deployment, monitoring setup, and ongoing maintenance',
    duration: 'Ongoing'
  }
];

const packages = [
  {
    name: 'Startup Solution',
    price: '$25,000',
    description: 'Perfect for startups and small businesses building their first product',
    features: [
      'Web application development',
      'Modern UI/UX design',
      'Database design & setup',
      'Basic integrations',
      'Testing & quality assurance',
      'Deployment & hosting setup',
      '3 months support'
    ],
    highlight: false
  },
  {
    name: 'Business Platform',
    price: '$60,000',
    description: 'Comprehensive solution for growing businesses and SaaS platforms',
    features: [
      'Full-stack web application',
      'Advanced features & integrations',
      'Scalable architecture design',
      'User management system',
      'Payment processing integration',
      'Analytics & reporting',
      'Performance optimization',
      'Security implementation',
      '6 months support'
    ],
    highlight: true
  },
  {
    name: 'Enterprise System',
    price: 'Custom Quote',
    description: 'Large-scale enterprise software with complex requirements',
    features: [
      'Multi-application ecosystem',
      'Microservices architecture',
      'Enterprise security & compliance',
      'Advanced integrations',
      'Custom workflow engines',
      'Scalable infrastructure',
      'Team training & documentation',
      'Dedicated development team',
      '12 months support'
    ],
    highlight: false
  }
];

export default function SoftwareDevelopmentPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-cyan-900 via-blue-800 to-indigo-900 py-20">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-cyan-600/20 backdrop-blur-sm text-cyan-200 text-sm font-medium mb-6">
                <ComputerDesktopIcon className="h-4 w-4 mr-2" />
                Software Development Services
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Build Powerful
                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent block">
                  Software Solutions
                </span>
              </h1>
              
              <p className="text-xl text-cyan-100 mb-8 leading-relaxed">
                Transform your ideas into robust software solutions. From web applications 
                to enterprise systems, we deliver scalable, secure, and high-performance 
                software that drives business growth and innovation.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-8 py-4 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-colors"
                >
                  Start Your Project
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/case-studies"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-lg border border-white/20 hover:bg-white/20 transition-colors"
                >
                  <PlayIcon className="mr-2 h-5 w-5" />
                  View Our Portfolio
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative w-full h-96 rounded-2xl overflow-hidden">
                <OptimizedImage
                  src="/images/services/software-development.webp"
                  alt="Software Development Services"
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
              Why Choose Our Software Development Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive development expertise delivering scalable, secure, and innovative software solutions
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-cyan-600 transition-colors">
                  <feature.icon className="h-8 w-8 text-cyan-600 group-hover:text-white transition-colors" />
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
              Our Software Development Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Complete software solutions for every business need and scale
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
                      <CheckIcon className="h-5 w-5 text-cyan-500 mr-3" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Link
                  href={service.href}
                  className="inline-flex items-center text-cyan-600 font-semibold hover:text-cyan-700 transition-colors"
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
              Technologies We Master
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Modern programming languages, frameworks, and tools for building world-class software
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            {technologies.map((tech, index) => (
              <span
                key={index}
                className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-800 font-medium rounded-full hover:bg-cyan-100 hover:text-cyan-800 transition-colors"
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
              Our Development Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Proven methodology ensuring successful software delivery from concept to production
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {process.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="w-12 h-12 bg-cyan-600 text-white rounded-xl flex items-center justify-center font-bold text-lg mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600 mb-4">{step.description}</p>
                  <div className="flex items-center text-sm text-cyan-600 font-medium">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    {step.duration}
                  </div>
                </div>
                {index < process.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-cyan-200" />
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
              Software Development Packages
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the perfect development solution for your software project
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <div key={index} className={`relative bg-white rounded-2xl p-8 shadow-lg ${pkg.highlight ? 'ring-2 ring-cyan-500 scale-105' : ''}`}>
                {pkg.highlight && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-cyan-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                  <div className="text-4xl font-bold text-cyan-600 mb-4">{pkg.price}</div>
                  <p className="text-gray-600">{pkg.description}</p>
                </div>
                
                <div className="space-y-4 mb-8">
                  {pkg.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center">
                      <CheckIcon className="h-5 w-5 text-cyan-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Link
                  href="/contact"
                  className={`block w-full text-center py-3 px-6 rounded-lg font-semibold transition-colors ${
                    pkg.highlight 
                      ? 'bg-cyan-600 text-white hover:bg-cyan-700' 
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
      <section className="py-20 bg-gradient-to-r from-cyan-600 to-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <StarIcon className="h-8 w-8 text-yellow-400 mr-2" />
            <StarIcon className="h-8 w-8 text-yellow-400 mr-2" />
            <StarIcon className="h-8 w-8 text-yellow-400 mr-2" />
            <StarIcon className="h-8 w-8 text-yellow-400 mr-2" />
            <StarIcon className="h-8 w-8 text-yellow-400" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Build Your Software Solution?
          </h2>
          
          <p className="text-xl text-cyan-100 mb-8 max-w-2xl mx-auto">
            Join 600+ companies that chose Zoptal for their software development needs. 
            Let's build innovative solutions that drive your business forward.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-cyan-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Start Your Project
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center justify-center px-8 py-4 bg-cyan-700 text-white font-semibold rounded-lg hover:bg-cyan-800 transition-colors"
            >
              View All Services
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}