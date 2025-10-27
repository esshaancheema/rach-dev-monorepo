import { 
  CodeBracketIcon,
  CpuChipIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  ClockIcon,
  GlobeAltIcon,
  SparklesIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const features = [
  {
    icon: CodeBracketIcon,
    title: 'AI Code Generation',
    description: 'Generate production-ready code from natural language descriptions using advanced AI models trained on millions of code repositories.',
    benefits: ['Natural language to code', 'Multiple frameworks supported', 'Best practices included']
  },
  {
    icon: CpuChipIcon,
    title: 'Smart Optimization',
    description: 'Automatically optimize your code for performance, security, and maintainability with AI-powered analysis and suggestions.',
    benefits: ['Performance optimization', 'Security vulnerability detection', 'Code quality improvements']
  },
  {
    icon: RocketLaunchIcon,
    title: 'Automated Deployment',
    description: 'Deploy your applications with confidence using AI-powered deployment pipelines that handle scaling and monitoring.',
    benefits: ['One-click deployment', 'Auto-scaling', 'Real-time monitoring']
  },
  {
    icon: ShieldCheckIcon,
    title: 'Enterprise Security',
    description: 'Built-in security features including code scanning, vulnerability assessment, and compliance checking for enterprise standards.',
    benefits: ['Security scanning', 'Compliance checks', 'Access controls']
  },
  {
    icon: ClockIcon,
    title: 'Real-time Collaboration',
    description: 'Work with your team in real-time with collaborative coding, shared workspaces, and integrated communication tools.',
    benefits: ['Live collaboration', 'Shared workspaces', 'Team communication']
  },
  {
    icon: GlobeAltIcon,
    title: 'Global Infrastructure',
    description: 'Leverage our global infrastructure for low-latency access, high availability, and seamless scaling across regions.',
    benefits: ['Global CDN', '99.9% uptime', 'Auto-scaling']
  }
];

const highlights = [
  {
    icon: SparklesIcon,
    title: 'AI-First Approach',
    description: 'Every feature is powered by cutting-edge AI to accelerate your development workflow.'
  },
  {
    icon: ChartBarIcon,
    title: '10x Development Speed',
    description: 'Our clients report average 10x improvement in development velocity and time-to-market.'
  },
  {
    icon: ShieldCheckIcon,
    title: 'Production Ready',
    description: 'All generated code follows industry best practices and is ready for production deployment.'
  }
];

export default function FeaturesSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <SparklesIcon className="w-4 h-4" />
            <span>Powerful Features</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Everything You Need to
            <br />
            <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Accelerate Development
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our comprehensive platform provides all the tools and services you need to build, 
            deploy, and scale modern applications with AI-powered efficiency.
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-300 group hover:border-primary-200"
            >
              <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary-200 transition-colors">
                <feature.icon className="w-7 h-7 text-primary-600" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-primary-700 transition-colors">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                {feature.description}
              </p>
              
              <ul className="space-y-2">
                {feature.benefits.map((benefit, benefitIndex) => (
                  <li key={benefitIndex} className="flex items-center text-sm text-gray-700">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mr-3"></div>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Feature Highlights */}
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-3xl p-8 lg:p-12 text-white">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">
              Why Choose Zoptal?
            </h3>
            <p className="text-primary-100 text-lg max-w-2xl mx-auto">
              We're not just another development platform. We're your AI-powered partner in building the future.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {highlights.map((highlight, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <highlight.icon className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold mb-3">{highlight.title}</h4>
                <p className="text-primary-100">{highlight.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Transform Your Development Process?
          </h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join hundreds of development teams who have already accelerated their workflow with our AI-powered platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-flex items-center justify-center space-x-2 bg-primary-600 text-white px-8 py-4 rounded-lg hover:bg-primary-700 transition-all font-semibold shadow-lg hover:shadow-xl"
            >
              <span>Start Your Free Trial</span>
              <RocketLaunchIcon className="w-5 h-5" />
            </a>
            <a
              href="/services"
              className="inline-flex items-center justify-center space-x-2 bg-white text-primary-600 px-8 py-4 rounded-lg border border-primary-200 hover:bg-primary-50 transition-all font-semibold"
            >
              <span>Explore Services</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}