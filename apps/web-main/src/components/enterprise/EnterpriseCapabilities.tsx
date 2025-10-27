import {
  UsersIcon,
  ClockIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  CogIcon,
  ChartBarIcon,
  CloudIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';

const capabilities = [
  {
    icon: UsersIcon,
    title: 'Dedicated Development Teams',
    description: 'Full-time dedicated teams with domain expertise, working as an extension of your organization.',
    stats: '50+ Expert Developers'
  },
  {
    icon: ClockIcon,
    title: '24/7 Global Support',
    description: 'Round-the-clock support across multiple time zones with guaranteed response times.',
    stats: '<4 Hour Response Time'
  },
  {
    icon: ShieldCheckIcon,
    title: 'Enterprise Security',
    description: 'SOC 2, HIPAA, GDPR compliant solutions with enterprise-grade security measures.',
    stats: '99.9% Security Uptime'
  },
  {
    icon: GlobeAltIcon,
    title: 'Global Scalability',
    description: 'Multi-region deployments with auto-scaling capabilities to handle enterprise workloads.',
    stats: '15+ Countries Served'
  },
  {
    icon: CogIcon,
    title: 'Custom Integrations',
    description: 'Seamless integration with existing enterprise systems, APIs, and third-party platforms.',
    stats: '200+ System Integrations'
  },
  {
    icon: ChartBarIcon,
    title: 'Advanced Analytics',
    description: 'Real-time monitoring, reporting, and business intelligence with actionable insights.',
    stats: 'Real-time Dashboards'
  }
];

const technologies = [
  {
    category: 'Cloud Platforms',
    icon: CloudIcon,
    tech: ['AWS', 'Azure', 'Google Cloud', 'Kubernetes', 'Docker'],
    color: 'blue'
  },
  {
    category: 'Enterprise Frameworks',
    icon: CogIcon,
    tech: ['Microservices', '.NET', 'Spring Boot', 'Node.js', 'Python'],
    color: 'green'
  },
  {
    category: 'Databases',
    icon: ChartBarIcon,
    tech: ['PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch', 'Oracle'],
    color: 'purple'
  },
  {
    category: 'Mobile & Frontend',
    icon: DevicePhoneMobileIcon,
    tech: ['React Native', 'Flutter', 'React', 'Angular', 'Vue.js'],
    color: 'orange'
  }
];

export default function EnterpriseCapabilities() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Enterprise-Grade Capabilities
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Built for scale, designed for enterprise requirements. Our comprehensive 
            capabilities ensure your solutions meet the highest standards.
          </p>
        </div>

        {/* Capabilities Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {capabilities.map((capability, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <capability.icon className="h-6 w-6 text-blue-600" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {capability.title}
              </h3>
              
              <p className="text-gray-600 mb-4 leading-relaxed">
                {capability.description}
              </p>

              <div className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 text-sm font-semibold rounded-full">
                {capability.stats}
              </div>
            </div>
          ))}
        </div>

        {/* Technology Stack */}
        <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-100">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Enterprise Technology Stack
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We leverage proven, enterprise-grade technologies to build robust, 
              scalable solutions that integrate seamlessly with your existing infrastructure.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {technologies.map((tech, index) => (
              <div key={index} className="text-center">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center ${
                  tech.color === 'blue' ? 'bg-blue-100' :
                  tech.color === 'green' ? 'bg-green-100' :
                  tech.color === 'purple' ? 'bg-purple-100' : 'bg-orange-100'
                }`}>
                  <tech.icon className={`h-8 w-8 ${
                    tech.color === 'blue' ? 'text-blue-600' :
                    tech.color === 'green' ? 'text-green-600' :
                    tech.color === 'purple' ? 'text-purple-600' : 'text-orange-600'
                  }`} />
                </div>
                
                <h4 className="font-bold text-gray-900 mb-3">{tech.category}</h4>
                
                <div className="space-y-2">
                  {tech.tech.map((item, itemIndex) => (
                    <div
                      key={itemIndex}
                      className="text-sm text-gray-600 bg-gray-50 rounded-md px-3 py-1"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="text-3xl font-bold text-blue-600 mb-2">99.9%</div>
            <div className="text-sm text-gray-600">Uptime SLA</div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="text-3xl font-bold text-green-600 mb-2">&lt;2s</div>
            <div className="text-sm text-gray-600">Response Time</div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="text-3xl font-bold text-purple-600 mb-2">SOC 2</div>
            <div className="text-sm text-gray-600">Compliant</div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
            <div className="text-sm text-gray-600">Support</div>
          </div>
        </div>
      </div>
    </section>
  );
}