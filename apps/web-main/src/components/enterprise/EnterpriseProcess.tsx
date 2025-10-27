import {
  DocumentTextIcon,
  UserGroupIcon,
  CogIcon,
  RocketLaunchIcon,
  ChartBarIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const processSteps = [
  {
    step: 1,
    title: 'Discovery & Strategy',
    description: 'Comprehensive analysis of your business requirements, technical landscape, and strategic objectives.',
    icon: DocumentTextIcon,
    duration: '2-4 weeks',
    deliverables: [
      'Technical assessment report',
      'Requirements documentation',
      'Architecture recommendations',
      'Project roadmap'
    ],
    color: 'blue'
  },
  {
    step: 2,
    title: 'Team Assembly & Planning',
    description: 'Dedicated team assignment with domain experts, project planning, and governance structure setup.',
    icon: UserGroupIcon,
    duration: '1-2 weeks',
    deliverables: [
      'Dedicated team assignment',
      'Project charter',
      'Communication protocols',
      'Risk management plan'
    ],
    color: 'green'
  },
  {
    step: 3,
    title: 'Architecture & Design',
    description: 'Detailed system architecture, security design, and scalability planning for enterprise requirements.',
    icon: CogIcon,
    duration: '3-6 weeks',
    deliverables: [
      'System architecture design',
      'Security architecture',
      'Integration specifications',
      'UI/UX prototypes'
    ],
    color: 'purple'
  },
  {
    step: 4,
    title: 'Development & Integration',
    description: 'Agile development with continuous integration, testing, and regular stakeholder reviews.',
    icon: RocketLaunchIcon,
    duration: '12-24 weeks',
    deliverables: [
      'Working software increments',
      'Integration testing',
      'Performance optimization',
      'Security testing'
    ],
    color: 'orange'
  },
  {
    step: 5,
    title: 'Testing & Quality Assurance',
    description: 'Comprehensive testing including security, performance, and user acceptance testing.',
    icon: ShieldCheckIcon,
    duration: '2-4 weeks',
    deliverables: [
      'Test execution reports',
      'Security audit results',
      'Performance benchmarks',
      'User acceptance sign-off'
    ],
    color: 'red'
  },
  {
    step: 6,
    title: 'Deployment & Monitoring',
    description: 'Production deployment, monitoring setup, and ongoing support with performance optimization.',
    icon: ChartBarIcon,
    duration: 'Ongoing',
    deliverables: [
      'Production deployment',
      'Monitoring dashboards',
      'Support documentation',
      'Optimization reports'
    ],
    color: 'teal'
  }
];

const methodologies = [
  {
    name: 'Agile/Scrum',
    description: 'Iterative development with regular sprints and stakeholder feedback',
    icon: '🔄'
  },
  {
    name: 'DevOps',
    description: 'Continuous integration and deployment for faster delivery',
    icon: '⚙️'
  },
  {
    name: 'Security-First',
    description: 'Security considerations integrated throughout development',
    icon: '🔒'
  },
  {
    name: 'Quality Gates',
    description: 'Rigorous quality checkpoints at every development phase',
    icon: '✅'
  }
];

export default function EnterpriseProcess() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Our Enterprise Development Process
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            A proven methodology designed for enterprise complexity, ensuring successful 
            delivery of large-scale projects with maximum ROI and minimal risk.
          </p>

          {/* Methodologies */}
          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {methodologies.map((methodology, index) => (
              <div key={index} className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
                <div className="text-2xl mb-2">{methodology.icon}</div>
                <div className="font-semibold text-gray-900 text-sm mb-1">{methodology.name}</div>
                <div className="text-xs text-gray-600">{methodology.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Process Steps */}
        <div className="space-y-8">
          {processSteps.map((step, index) => (
            <div
              key={index}
              className={`bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden ${
                index % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              <div className="lg:flex">
                {/* Step Content */}
                <div className="lg:flex-1 p-8 lg:p-12">
                  <div className="flex items-start space-x-4 mb-6">
                    <div className={`flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center ${
                      step.color === 'blue' ? 'bg-blue-100' :
                      step.color === 'green' ? 'bg-green-100' :
                      step.color === 'purple' ? 'bg-purple-100' :
                      step.color === 'orange' ? 'bg-orange-100' :
                      step.color === 'red' ? 'bg-red-100' : 'bg-teal-100'
                    }`}>
                      <step.icon className={`h-8 w-8 ${
                        step.color === 'blue' ? 'text-blue-600' :
                        step.color === 'green' ? 'text-green-600' :
                        step.color === 'purple' ? 'text-purple-600' :
                        step.color === 'orange' ? 'text-orange-600' :
                        step.color === 'red' ? 'text-red-600' : 'text-teal-600'
                      }`} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                          step.color === 'blue' ? 'bg-blue-600' :
                          step.color === 'green' ? 'bg-green-600' :
                          step.color === 'purple' ? 'bg-purple-600' :
                          step.color === 'orange' ? 'bg-orange-600' :
                          step.color === 'red' ? 'bg-red-600' : 'bg-teal-600'
                        }`}>
                          {step.step}
                        </div>
                        <div className="text-sm text-gray-500 font-medium">
                          {step.duration}
                        </div>
                      </div>

                      <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        {step.title}
                      </h3>

                      <p className="text-gray-600 text-lg leading-relaxed mb-6">
                        {step.description}
                      </p>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Key Deliverables:</h4>
                        <ul className="grid md:grid-cols-2 gap-2">
                          {step.deliverables.map((deliverable, deliverableIndex) => (
                            <li key={deliverableIndex} className="flex items-center text-gray-600">
                              <div className={`w-2 h-2 rounded-full mr-3 flex-shrink-0 ${
                                step.color === 'blue' ? 'bg-blue-500' :
                                step.color === 'green' ? 'bg-green-500' :
                                step.color === 'purple' ? 'bg-purple-500' :
                                step.color === 'orange' ? 'bg-orange-500' :
                                step.color === 'red' ? 'bg-red-500' : 'bg-teal-500'
                              }`} />
                              {deliverable}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Visual Element */}
                <div className={`lg:w-96 bg-gradient-to-br ${
                  step.color === 'blue' ? 'from-blue-50 to-blue-100' :
                  step.color === 'green' ? 'from-green-50 to-green-100' :
                  step.color === 'purple' ? 'from-purple-50 to-purple-100' :
                  step.color === 'orange' ? 'from-orange-50 to-orange-100' :
                  step.color === 'red' ? 'from-red-50 to-red-100' : 'from-teal-50 to-teal-100'
                } flex items-center justify-center p-8`}>
                  <div className="text-center">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 ${
                      step.color === 'blue' ? 'bg-blue-200' :
                      step.color === 'green' ? 'bg-green-200' :
                      step.color === 'purple' ? 'bg-purple-200' :
                      step.color === 'orange' ? 'bg-orange-200' :
                      step.color === 'red' ? 'bg-red-200' : 'bg-teal-200'
                    }`}>
                      <step.icon className={`h-12 w-12 ${
                        step.color === 'blue' ? 'text-blue-600' :
                        step.color === 'green' ? 'text-green-600' :
                        step.color === 'purple' ? 'text-purple-600' :
                        step.color === 'orange' ? 'text-orange-600' :
                        step.color === 'red' ? 'text-red-600' : 'text-teal-600'
                      }`} />
                    </div>
                    <div className={`text-3xl font-bold mb-2 ${
                      step.color === 'blue' ? 'text-blue-600' :
                      step.color === 'green' ? 'text-green-600' :
                      step.color === 'purple' ? 'text-purple-600' :
                      step.color === 'orange' ? 'text-orange-600' :
                      step.color === 'red' ? 'text-red-600' : 'text-teal-600'
                    }`}>
                      Phase {step.step}
                    </div>
                    <div className="text-gray-600 font-medium">{step.duration}</div>
                  </div>
                </div>
              </div>

              {/* Connector Line */}
              {index < processSteps.length - 1 && (
                <div className="flex justify-center">
                  <div className="w-px h-8 bg-gray-200" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Process Benefits */}
        <div className="mt-16 bg-white rounded-2xl p-12 shadow-lg border border-gray-100">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Why Our Process Works for Enterprise
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our battle-tested process ensures predictable outcomes, minimizes risks, 
              and delivers maximum value for enterprise investments.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Predictable Outcomes</h4>
              <p className="text-gray-600 text-sm">
                Clear milestones and deliverables ensure project success and ROI measurement
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Risk Mitigation</h4>
              <p className="text-gray-600 text-sm">
                Early risk identification and mitigation strategies protect your investment
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📈</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Continuous Value</h4>
              <p className="text-gray-600 text-sm">
                Regular deliveries ensure continuous value creation throughout the project
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}