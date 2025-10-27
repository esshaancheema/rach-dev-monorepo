import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  WrenchScrewdriverIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  CheckIcon,
  ArrowRightIcon,
  StarIcon,
  PlayIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import OptimizedImage from '@/components/ui/OptimizedImage';

export const metadata: Metadata = {
  title: 'AI Agents Maintenance Services | Zoptal - Support & Optimization',
  description: 'Professional AI agents maintenance services including performance monitoring, updates, optimization, and 24/7 support for continued success.',
  keywords: ['AI agents maintenance', 'AI support', 'performance monitoring', 'AI optimization', 'system updates', 'continuous improvement'],
  openGraph: {
    title: 'AI Agents Maintenance Services | Zoptal',
    description: 'Professional AI agents maintenance with monitoring, updates, and optimization.',
    images: ['/images/og-image.png'],
  },
};

const features = [
  {
    icon: WrenchScrewdriverIcon,
    title: 'Proactive Maintenance',
    description: 'Regular updates, performance tuning, and preventive maintenance to keep agents running smoothly.'
  },
  {
    icon: ChartBarIcon,
    title: 'Performance Monitoring',
    description: '24/7 monitoring with real-time alerts and comprehensive performance analytics.'
  },
  {
    icon: ShieldCheckIcon,
    title: 'Security & Compliance',
    description: 'Continuous security updates and compliance monitoring to protect your data.'
  },
  {
    icon: ArrowPathIcon,
    title: 'Continuous Optimization',
    description: 'Ongoing improvements based on usage patterns and performance data.'
  }
];

const services = [
  {
    title: 'Performance Monitoring',
    description: 'Real-time monitoring and analytics for optimal AI agent performance',
    href: '/ai-agents/maintenance/monitoring',
    features: ['24/7 Monitoring', 'Performance Analytics', 'Alert Management']
  },
  {
    title: 'Updates & Upgrades',
    description: 'Regular updates, feature enhancements, and system upgrades',
    href: '/ai-agents/maintenance/updates',
    features: ['System Updates', 'Feature Enhancements', 'Security Patches']
  },
  {
    title: 'Support & Optimization',
    description: 'Expert support and continuous optimization for peak performance',
    href: '/ai-agents/maintenance/support',
    features: ['Expert Support', 'Performance Optimization', 'Troubleshooting']
  }
];

const technologies = [
  'Monitoring Tools', 'Performance Analytics', 'Alert Systems', 'Log Management', 'Security Scanning', 'Backup Systems',
  'Version Control', 'CI/CD Pipelines', 'Load Testing', 'Error Tracking', 'Health Checks', 'Automated Reporting'
];

const process = [
  {
    step: 1,
    title: 'Health Assessment',
    description: 'Comprehensive evaluation of current AI agent performance and health status',
    duration: '1 week'
  },
  {
    step: 2,
    title: 'Monitoring Setup',
    description: 'Implementation of monitoring tools, alerts, and performance tracking systems',
    duration: '1-2 weeks'
  },
  {
    step: 3,
    title: 'Ongoing Maintenance',
    description: 'Regular maintenance activities, updates, and performance optimization',
    duration: 'Continuous'
  },
  {
    step: 4,
    title: 'Improvement Cycles',
    description: 'Regular review cycles with performance improvements and feature updates',
    duration: 'Monthly'
  }
];

const packages = [
  {
    name: 'Basic Maintenance',
    price: '$2,000/month',
    description: 'Essential maintenance and monitoring for small-scale deployments',
    features: [
      'Basic performance monitoring',
      'Monthly health reports',
      'Standard support (business hours)',
      'Security updates',
      'Backup management',
      'Email support'
    ],
    highlight: false
  },
  {
    name: 'Professional Maintenance',
    price: '$5,000/month',
    description: 'Comprehensive maintenance solution for production environments',
    features: [
      '24/7 performance monitoring',
      'Real-time alerts & notifications',
      'Weekly optimization reviews',
      'Priority support',
      'Proactive issue resolution',
      'Performance optimization',
      'Feature updates & enhancements',
      'Phone & chat support'
    ],
    highlight: true
  },
  {
    name: 'Enterprise Maintenance',
    price: 'Custom Quote',
    description: 'Full-scale maintenance platform for mission-critical systems',
    features: [
      'Advanced monitoring & analytics',
      'Custom SLA agreements',
      'Dedicated support team',
      'Proactive maintenance scheduling',
      'Custom feature development',
      'Compliance management',
      'Emergency response team',
      'On-site support available'
    ],
    highlight: false
  }
];

export default function AIAgentsMaintenancePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-900 via-red-800 to-pink-900 py-20">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-orange-600/20 backdrop-blur-sm text-orange-200 text-sm font-medium mb-6">
                <WrenchScrewdriverIcon className="h-4 w-4 mr-2" />
                AI Agents Maintenance
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Keep Your AI Agents
                <span className="bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent block">
                  Running Perfectly
                </span>
              </h1>
              
              <p className="text-xl text-orange-100 mb-8 leading-relaxed">
                Ensure peak performance with our comprehensive AI agents maintenance services. 
                From 24/7 monitoring to proactive optimization, we keep your AI agents running 
                smoothly so you can focus on growing your business.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-8 py-4 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Start Maintenance Plan
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/case-studies"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-lg border border-white/20 hover:bg-white/20 transition-colors"
                >
                  <PlayIcon className="mr-2 h-5 w-5" />
                  See Performance Reports
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative w-full h-96 rounded-2xl overflow-hidden">
                <OptimizedImage
                  src="/images/ai-agents/maintenance.webp"
                  alt="AI Agents Maintenance Services"
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
              Why Choose Our AI Maintenance Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Proactive maintenance and optimization to maximize AI agent performance and reliability
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
              Our AI Maintenance Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive maintenance solutions to keep your AI agents performing at their best
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
              Maintenance Tools & Technologies
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Advanced tools for monitoring, maintenance, and optimization of AI systems
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
              Our Maintenance Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Systematic approach ensuring reliable, optimized AI agent performance
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
              AI Maintenance Packages
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the right maintenance plan for your AI agent infrastructure
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
      <section className="py-20 bg-gradient-to-r from-orange-600 to-red-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <StarIcon className="h-8 w-8 text-yellow-400 mr-2" />
            <StarIcon className="h-8 w-8 text-yellow-400 mr-2" />
            <StarIcon className="h-8 w-8 text-yellow-400 mr-2" />
            <StarIcon className="h-8 w-8 text-yellow-400 mr-2" />
            <StarIcon className="h-8 w-8 text-yellow-400" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Optimize Your AI Performance?
          </h2>
          
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Join 200+ companies that rely on Zoptal for AI agent maintenance and optimization. 
            Ensure maximum performance with 99.9% uptime and continuous improvement.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-orange-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Start Maintenance Plan
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/ai-agents"
              className="inline-flex items-center justify-center px-8 py-4 bg-orange-700 text-white font-semibold rounded-lg hover:bg-orange-800 transition-colors"
            >
              Explore AI Agents
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}