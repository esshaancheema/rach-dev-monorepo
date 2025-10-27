import Link from 'next/link';
import {
  BuildingOffice2Icon,
  CpuChipIcon,
  CloudIcon,
  ShieldCheckIcon,
  DevicePhoneMobileIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const solutions = [
  {
    icon: BuildingOffice2Icon,
    title: 'Custom Enterprise Platforms',
    description: 'Scalable, multi-tenant platforms designed for large organizations with complex workflows and compliance requirements.',
    features: [
      'Multi-tenant architecture',
      'Role-based access control',
      'Advanced workflow automation',
      'Enterprise integrations'
    ],
    price: 'Starting at $150K',
    link: '/contact?service=enterprise-platform'
  },
  {
    icon: CpuChipIcon,
    title: 'AI & Machine Learning Solutions',
    description: 'Intelligent systems that automate processes, predict outcomes, and provide actionable insights for enterprise decision-making.',
    features: [
      'Custom AI model development',
      'Predictive analytics',
      'Process automation',
      'Data intelligence platforms'
    ],
    price: 'Starting at $200K',
    link: '/contact?service=enterprise-ai'
  },
  {
    icon: CloudIcon,
    title: 'Cloud Migration & Modernization',
    description: 'Seamlessly migrate legacy systems to modern cloud infrastructure with zero downtime and enhanced performance.',
    features: [
      'Legacy system modernization',
      'Multi-cloud architecture',
      'Microservices migration',
      'DevOps automation'
    ],
    price: 'Starting at $100K',
    link: '/contact?service=cloud-migration'
  },
  {
    icon: ShieldCheckIcon,
    title: 'Security & Compliance',
    description: 'Enterprise-grade security solutions with compliance frameworks including SOC 2, HIPAA, and GDPR.',
    features: [
      'Security audit & assessment',
      'Compliance implementation',
      'Threat monitoring',
      'Identity management'
    ],
    price: 'Starting at $75K',
    link: '/contact?service=security-compliance'
  },
  {
    icon: DevicePhoneMobileIcon,
    title: 'Enterprise Mobile Solutions',
    description: 'Secure, scalable mobile applications for workforce productivity and customer engagement.',
    features: [
      'Enterprise mobile apps',
      'Mobile device management',
      'Offline-first architecture',
      'Cross-platform deployment'
    ],
    price: 'Starting at $120K',
    link: '/contact?service=enterprise-mobile'
  },
  {
    icon: ChartBarIcon,
    title: 'Data Analytics & BI',
    description: 'Transform raw data into actionable insights with custom analytics platforms and business intelligence tools.',
    features: [
      'Real-time dashboards',
      'Advanced reporting',
      'Data warehouse design',
      'Self-service analytics'
    ],
    price: 'Starting at $90K',
    link: '/contact?service=data-analytics'
  },
  {
    icon: Cog6ToothIcon,
    title: 'Process Automation',
    description: 'Streamline operations with intelligent automation solutions that reduce costs and improve efficiency.',
    features: [
      'Workflow automation',
      'RPA implementation',
      'API orchestration',
      'Integration platforms'
    ],
    price: 'Starting at $80K',
    link: '/contact?service=process-automation'
  },
  {
    icon: GlobeAltIcon,
    title: 'Digital Transformation',
    description: 'End-to-end digital transformation strategy and implementation for modern enterprise operations.',
    features: [
      'Digital strategy consulting',
      'Technology roadmap',
      'Change management',
      'Training & adoption'
    ],
    price: 'Custom Pricing',
    link: '/contact?service=digital-transformation'
  }
];

export default function EnterpriseSolutions() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Enterprise Solutions That Drive Growth
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Comprehensive technology solutions designed for large organizations seeking 
            scalability, security, and competitive advantage in the digital age.
          </p>
          
          {/* Key Differentiators */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-3 text-gray-700">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="font-medium">Dedicated Teams</span>
            </div>
            <div className="flex items-center justify-center space-x-3 text-gray-700">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span className="font-medium">Enterprise Security</span>
            </div>
            <div className="flex items-center justify-center space-x-3 text-gray-700">
              <div className="w-2 h-2 bg-purple-500 rounded-full" />
              <span className="font-medium">24/7 Support</span>
            </div>
          </div>
        </div>

        {/* Solutions Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {solutions.map((solution, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-xl hover:border-blue-300 transition-all duration-300"
            >
              {/* Icon & Title */}
              <div className="flex items-start space-x-4 mb-6">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                    <solution.icon className="h-7 w-7 text-blue-600" />
                  </div>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {solution.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {solution.description}
                  </p>
                </div>
              </div>

              {/* Features */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Key Features:</h4>
                <ul className="grid grid-cols-2 gap-2">
                  {solution.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pricing and CTA */}
              <div className="flex items-center justify-between">
                <div className="text-lg font-bold text-gray-900">
                  {solution.price}
                </div>
                <Link
                  href={solution.link}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Learn More
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-12 border border-blue-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Need a Custom Enterprise Solution?
          </h3>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Every enterprise has unique requirements. Let's discuss your specific needs 
            and create a custom solution that drives your business forward.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact?type=custom-enterprise"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-lg"
            >
              Schedule Strategy Session
            </Link>
            
            <Link
              href="/portfolio"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-blue-600 bg-white border-2 border-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              View Case Studies
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}