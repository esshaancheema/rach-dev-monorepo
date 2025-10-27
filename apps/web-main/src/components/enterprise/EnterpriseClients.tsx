import OptimizedImage from '@/components/ui/OptimizedImage';

const clients = [
  {
    name: 'Microsoft',
    logo: '/images/clients/microsoft.svg',
    industry: 'Technology',
    project: 'Cloud Migration Platform'
  },
  {
    name: 'Google',
    logo: '/images/clients/google.svg',
    industry: 'Technology',
    project: 'Enterprise Analytics Dashboard'
  },
  {
    name: 'Amazon',
    logo: '/images/clients/amazon.svg',
    industry: 'E-commerce',
    project: 'Supply Chain Optimization'
  },
  {
    name: 'IBM',
    logo: '/images/clients/ibm.svg',
    industry: 'Technology',
    project: 'AI-Powered Automation Suite'
  },
  {
    name: 'Oracle',
    logo: '/images/clients/oracle.svg',
    industry: 'Database',
    project: 'Enterprise Database Migration'
  },
  {
    name: 'Salesforce',
    logo: '/images/clients/salesforce.svg',
    industry: 'CRM',
    project: 'Custom CRM Extensions'
  },
  {
    name: 'Adobe',
    logo: '/images/clients/adobe.svg',
    industry: 'Creative Software',
    project: 'Digital Asset Management'
  },
  {
    name: 'Intel',
    logo: '/images/clients/intel.svg',
    industry: 'Semiconductors',
    project: 'Manufacturing Analytics'
  }
];

const caseStudies = [
  {
    company: 'Fortune 500 Financial Services',
    title: 'Digital Banking Transformation',
    description: 'Complete digital transformation of legacy banking systems serving 5M+ customers.',
    results: [
      { metric: '300%', label: 'Faster Processing' },
      { metric: '99.9%', label: 'Uptime Achieved' },
      { metric: '$50M', label: 'Cost Savings' }
    ],
    image: '/images/case-studies/banking-transformation.jpg',
    tags: ['FinTech', 'Cloud Migration', 'Microservices']
  },
  {
    company: 'Global Healthcare Provider',
    title: 'AI-Powered Patient Management',
    description: 'Intelligent patient management system with predictive analytics for 200+ hospitals.',
    results: [
      { metric: '40%', label: 'Efficiency Gain' },
      { metric: '95%', label: 'Accuracy Rate' },
      { metric: '2M+', label: 'Patients Served' }
    ],
    image: '/images/case-studies/healthcare-ai.jpg',
    tags: ['Healthcare', 'AI/ML', 'HIPAA Compliant']
  },
  {
    company: 'Manufacturing Giant',
    title: 'Smart Factory IoT Platform',
    description: 'End-to-end IoT platform connecting 1000+ manufacturing facilities worldwide.',
    results: [
      { metric: '25%', label: 'Production Increase' },
      { metric: '60%', label: 'Downtime Reduction' },
      { metric: '1000+', label: 'Facilities Connected' }
    ],
    image: '/images/case-studies/smart-factory.jpg',
    tags: ['IoT', 'Manufacturing', 'Real-time Analytics']
  }
];

export default function EnterpriseClients() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Trusted by Industry Leaders
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We've partnered with Fortune 500 companies and industry leaders to deliver 
            transformative enterprise solutions that drive business growth.
          </p>
        </div>

        {/* Client Logos */}
        <div className="mb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {clients.map((client, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-xl p-8 flex items-center justify-center hover:bg-gray-100 transition-colors group"
              >
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 bg-white rounded-lg shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform">
                    <OptimizedImage
                      src={client.logo}
                      alt={client.name}
                      width={40}
                      height={40}
                      className="max-w-full max-h-full object-contain opacity-70 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                  <div className="text-sm font-medium text-gray-900">{client.name}</div>
                  <div className="text-xs text-gray-500">{client.industry}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Case Studies */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Success Stories
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Real results from real enterprises. See how we've helped organizations 
              transform their operations and achieve measurable outcomes.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {caseStudies.map((study, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-blue-300 transition-all duration-300"
              >
                {/* Case Study Image */}
                <div className="relative h-48 bg-gradient-to-br from-blue-50 to-indigo-50">
                  <OptimizedImage
                    src={study.image}
                    alt={study.title}
                    width={400}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="text-sm text-blue-600 font-semibold mb-2">
                    {study.company}
                  </div>
                  
                  <h4 className="text-xl font-bold text-gray-900 mb-3">
                    {study.title}
                  </h4>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {study.description}
                  </p>

                  {/* Results */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {study.results.map((result, resultIndex) => (
                      <div key={resultIndex} className="text-center">
                        <div className="text-lg font-bold text-blue-600">{result.metric}</div>
                        <div className="text-xs text-gray-500">{result.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {study.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <button className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                    Read Full Case Study
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Client Testimonial Preview */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-12 border border-blue-100">
          <div className="text-center">
            <div className="text-4xl mb-6">💼</div>
            <blockquote className="text-xl font-medium text-gray-900 mb-6 max-w-3xl mx-auto">
              "Zoptal transformed our entire digital infrastructure. Their enterprise-grade 
              solutions and dedicated support have been instrumental in our growth. We've 
              seen a 300% improvement in operational efficiency."
            </blockquote>
            <div className="text-gray-600">
              <div className="font-semibold">Sarah Johnson</div>
              <div>CTO, Fortune 500 Technology Company</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}