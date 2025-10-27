import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRightIcon, CpuChipIcon, ShieldCheckIcon, RocketLaunchIcon, CogIcon, StarIcon, ChartBarIcon, UserGroupIcon, CheckIcon, PhoneIcon, CommandLineIcon, BoltIcon } from '@heroicons/react/24/outline';
import { keywordsByCategory } from '@/lib/seo/keywords';
import { generateServiceSchema, generateBreadcrumbSchema } from '@/lib/seo/schemas';

export const metadata: Metadata = {
  title: 'AI Agents Development Services | Custom AI Solutions | Zoptal',
  description: 'Professional AI agents development services. Build intelligent chatbots, virtual assistants, and custom AI solutions using cutting-edge machine learning technologies.',
  keywords: [
    ...keywordsByCategory.services,
    'AI agents development',
    'artificial intelligence development',
    'chatbot development',
    'virtual assistant development',
    'machine learning solutions',
    'AI automation',
    'intelligent agents',
    'conversational AI',
    'natural language processing',
    'AI integration',
    'custom AI solutions',
    'LLM integration',
    'GPT development',
    'AI consulting services'
  ],
  openGraph: {
    title: 'AI Agents Development Services | Zoptal',
    description: 'Professional AI agents development services. Build intelligent chatbots, virtual assistants, and custom AI solutions.',
    type: 'website',
    url: 'https://zoptal.com/services/ai-agents-development',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Agents Development Services | Zoptal',
    description: 'Professional AI agents development services. Build intelligent chatbots, virtual assistants, and custom AI solutions.',
  },
  alternates: {
    canonical: 'https://zoptal.com/services/ai-agents-development',
  },
};

export default function AIAgentsDevelopmentPage() {
  const serviceSchema = generateServiceSchema({
    name: 'AI Agents Development Services',
    description: 'Professional AI agents development services including chatbots, virtual assistants, and custom AI solutions using advanced machine learning technologies.',
    provider: 'Zoptal',
    areaServed: 'Global',
    serviceType: 'AI Development',
    url: 'https://zoptal.com/services/ai-agents-development',
  });

  const breadcrumbSchema = generateBreadcrumbSchema({
    items: [
      { name: 'Home', url: 'https://zoptal.com' },
      { name: 'Services', url: 'https://zoptal.com/services' },
      { name: 'AI Agents Development', url: 'https://zoptal.com/services/ai-agents-development' },
    ]
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Breadcrumb */}
      <div className="bg-gray-50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <Link href="/" className="text-gray-500 hover:text-gray-700">
                  Home
                </Link>
              </li>
              <li>
                <ArrowRightIcon className="h-4 w-4 text-gray-400" />
              </li>
              <li>
                <Link href="/services" className="text-gray-500 hover:text-gray-700">
                  Services
                </Link>
              </li>
              <li>
                <ArrowRightIcon className="h-4 w-4 text-gray-400" />
              </li>
              <li className="text-gray-900 font-medium">
                AI Agents Development
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                AI Agents Development Services
              </h1>
              <p className="text-xl sm:text-2xl text-indigo-100 mb-8 leading-relaxed">
                Transform your business with intelligent AI agents. From conversational chatbots to sophisticated virtual assistants, we build AI solutions that understand, learn, and adapt to your needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/contact"
                  className="bg-white text-indigo-600 px-8 py-4 rounded-lg font-semibold hover:bg-indigo-50 transition-colors duration-300 text-center"
                >
                  Build Your AI Agent
                </Link>
                <Link
                  href="/portfolio"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition-colors duration-300 text-center"
                >
                  View AI Solutions
                </Link>
              </div>
            </div>
            <div className="text-center">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <div className="text-3xl font-bold text-indigo-200 mb-2">85%</div>
                  <div className="text-white font-semibold mb-1">Automation Rate</div>
                  <div className="text-indigo-200 text-sm">Customer interactions</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <div className="text-3xl font-bold text-indigo-200 mb-2">24/7</div>
                  <div className="text-white font-semibold mb-1">Availability</div>
                  <div className="text-indigo-200 text-sm">Round-the-clock service</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <div className="text-3xl font-bold text-indigo-200 mb-2">70%</div>
                  <div className="text-white font-semibold mb-1">Cost Reduction</div>
                  <div className="text-indigo-200 text-sm">Operational expenses</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <div className="text-3xl font-bold text-indigo-200 mb-2">150+</div>
                  <div className="text-white font-semibold mb-1">AI Agents Built</div>
                  <div className="text-indigo-200 text-sm">Across industries</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Agent Types */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Types of AI Agents We Build
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive AI agent solutions tailored to your business needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: CpuChipIcon,
                title: 'Conversational AI',
                description: 'Intelligent chatbots and virtual assistants that understand natural language and context.'
              },
              {
                icon: CogIcon,
                title: 'Process Automation',
                description: 'AI agents that automate complex business processes and workflows.'
              },
              {
                icon: ChartBarIcon,
                title: 'Data Analysis Agents',
                description: 'AI systems that analyze data, generate insights, and make recommendations.'
              },
              {
                icon: ShieldCheckIcon,
                title: 'Security Agents',
                description: 'AI-powered security systems for threat detection and response automation.'
              }
            ].map((type, index) => (
              <div key={index} className="text-center p-6 rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <type.icon className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{type.title}</h3>
                <p className="text-gray-600">{type.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Technologies */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              AI Technologies & Frameworks
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Cutting-edge AI technologies powering intelligent agent development
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                category: 'Large Language Models',
                technologies: ['GPT-4/GPT-3.5', 'Claude', 'LLaMA', 'PaLM', 'Gemini']
              },
              {
                category: 'AI Frameworks',
                technologies: ['TensorFlow', 'PyTorch', 'Hugging Face', 'OpenAI API', 'LangChain']
              },
              {
                category: 'Natural Language Processing',
                technologies: ['spaCy', 'NLTK', 'Transformers', 'BERT', 'T5']
              },
              {
                category: 'Vector Databases',
                technologies: ['Pinecone', 'Weaviate', 'Chroma', 'Qdrant', 'Milvus']
              },
              {
                category: 'Machine Learning',
                technologies: ['Scikit-learn', 'XGBoost', 'RandomForest', 'Neural Networks', 'Deep Learning']
              },
              {
                category: 'Cloud AI Services',
                technologies: ['Azure AI', 'AWS SageMaker', 'Google AI Platform', 'IBM Watson', 'Vertex AI']
              }
            ].map((tech, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{tech.category}</h3>
                <ul className="space-y-2">
                  {tech.technologies.map((technology, techIndex) => (
                    <li key={techIndex} className="flex items-center text-gray-700">
                      <CheckIcon className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                      {technology}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Agent Services */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              AI Agent Development Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              End-to-end AI agent development and implementation services
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: 'Custom Chatbot Development',
                description: 'Intelligent conversational agents with natural language understanding and multi-channel deployment.',
                features: [
                  'Natural language processing',
                  'Intent recognition',
                  'Context management',
                  'Multi-platform integration',
                  'Sentiment analysis'
                ],
                icon: CpuChipIcon
              },
              {
                title: 'Virtual Assistant Development',
                description: 'Sophisticated AI assistants that can handle complex tasks and provide personalized experiences.',
                features: [
                  'Task automation',
                  'Calendar management',
                  'Email processing',
                  'Document analysis',
                  'Voice integration'
                ],
                icon: UserGroupIcon
              },
              {
                title: 'AI Workflow Automation',
                description: 'Intelligent automation agents that streamline business processes and reduce manual work.',
                features: [
                  'Process optimization',
                  'Decision automation',
                  'Data processing',
                  'System integration',
                  'Exception handling'
                ],
                icon: CogIcon
              },
              {
                title: 'Customer Service AI',
                description: 'AI agents specialized in customer support with escalation and knowledge management.',
                features: [
                  'Ticket routing',
                  'FAQ automation',
                  'Escalation management',
                  'Knowledge base integration',
                  'Performance analytics'
                ],
                icon: ShieldCheckIcon
              },
              {
                title: 'Data Analysis Agents',
                description: 'AI systems that automatically analyze data, generate reports, and provide business insights.',
                features: [
                  'Automated reporting',
                  'Trend analysis',
                  'Anomaly detection',
                  'Predictive analytics',
                  'Data visualization'
                ],
                icon: ChartBarIcon
              },
              {
                title: 'AI Integration & Consulting',
                description: 'Expert consultation and integration services to implement AI agents into existing systems.',
                features: [
                  'AI strategy consulting',
                  'System integration',
                  'Performance optimization',
                  'Training & support',
                  'Maintenance services'
                ],
                icon: RocketLaunchIcon
              }
            ].map((service, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-8 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                    <service.icon className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{service.title}</h3>
                </div>
                <p className="text-gray-600 mb-6">{service.description}</p>
                <ul className="space-y-3">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-gray-700">
                      <CheckIcon className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Agent Industries */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Industry-Specific AI Solutions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tailored AI agents for different industry requirements
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                industry: 'Healthcare',
                applications: [
                  'Medical chatbots for patient queries',
                  'Appointment scheduling assistants',
                  'Medical record analysis',
                  'Drug interaction checkers',
                  'Symptom assessment tools'
                ]
              },
              {
                industry: 'E-commerce',
                applications: [
                  'Personal shopping assistants',
                  'Product recommendation engines',
                  'Customer support automation',
                  'Inventory management AI',
                  'Price optimization agents'
                ]
              },
              {
                industry: 'Finance',
                applications: [
                  'Financial advisory chatbots',
                  'Fraud detection systems',
                  'Loan processing automation',
                  'Investment analysis agents',
                  'Risk assessment tools'
                ]
              },
              {
                industry: 'Education',
                applications: [
                  'Personalized tutoring assistants',
                  'Student support chatbots',
                  'Grading automation systems',
                  'Learning path optimization',
                  'Content recommendation engines'
                ]
              },
              {
                industry: 'Real Estate',
                applications: [
                  'Property search assistants',
                  'Market analysis agents',
                  'Virtual property tours',
                  'Investment calculators',
                  'Lead qualification systems'
                ]
              },
              {
                industry: 'Manufacturing',
                applications: [
                  'Quality control automation',
                  'Predictive maintenance agents',
                  'Supply chain optimization',
                  'Production planning AI',
                  'Safety monitoring systems'
                ]
              }
            ].map((industry, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{industry.industry}</h3>
                <ul className="space-y-2">
                  {industry.applications.map((app, appIndex) => (
                    <li key={appIndex} className="flex items-start text-gray-700">
                      <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-sm">{app}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Development Process */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              AI Agent Development Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Structured approach to building intelligent AI agents
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {[
              {
                step: '01',
                title: 'Discovery & Analysis',
                description: 'Understanding your business requirements and defining AI agent capabilities.',
                icon: CpuChipIcon
              },
              {
                step: '02',
                title: 'AI Model Selection',
                description: 'Choosing the right AI models and frameworks for your specific use case.',
                icon: CpuChipIcon
              },
              {
                step: '03',
                title: 'Training & Development',
                description: 'Training AI models and developing the agent with your data and requirements.',
                icon: CommandLineIcon
              },
              {
                step: '04',
                title: 'Testing & Optimization',
                description: 'Comprehensive testing and optimization for accuracy and performance.',
                icon: BoltIcon
              },
              {
                step: '05',
                title: 'Deployment & Monitoring',
                description: 'Deploying the AI agent and continuous monitoring for improvements.',
                icon: RocketLaunchIcon
              }
            ].map((process, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4">
                  {process.step}
                </div>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <process.icon className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{process.title}</h3>
                <p className="text-gray-600 text-sm">{process.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              AI Agent Success Stories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real-world implementations and results from our AI agent projects
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'E-commerce Customer Service AI',
                industry: 'Retail',
                description: 'Intelligent customer service agent handling 85% of customer inquiries automatically.',
                results: [
                  '85% query automation',
                  '60% faster response time',
                  '40% cost reduction'
                ],
                technologies: ['GPT-4', 'LangChain', 'Pinecone', 'FastAPI']
              },
              {
                title: 'Healthcare Appointment Assistant',
                industry: 'Healthcare',
                description: 'AI agent managing patient appointments, reminders, and basic health queries.',
                results: [
                  '90% booking automation',
                  '50% no-show reduction',
                  '99% patient satisfaction'
                ],
                technologies: ['Claude', 'Azure AI', 'MongoDB', 'Twilio']
              },
              {
                title: 'Financial Advisory Chatbot',
                industry: 'Finance',
                description: 'Intelligent financial advisor providing personalized investment recommendations.',
                results: [
                  '70% lead qualification',
                  '45% engagement increase',
                  '25% conversion improvement'
                ],
                technologies: ['OpenAI API', 'Vector DB', 'React', 'Node.js']
              }
            ].map((study, index) => (
              <div key={index} className="bg-white rounded-lg p-8 shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="text-sm text-indigo-600 font-semibold mb-2">{study.industry}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{study.title}</h3>
                <p className="text-gray-600 mb-6">{study.description}</p>
                
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Key Results:</h4>
                  <ul className="space-y-2">
                    {study.results.map((result, resultIndex) => (
                      <li key={resultIndex} className="flex items-center text-gray-700">
                        <StarIcon className="w-4 h-4 text-yellow-500 mr-3 flex-shrink-0" />
                        {result}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Technologies:</h4>
                  <div className="flex flex-wrap gap-2">
                    {study.technologies.map((tech, techIndex) => (
                      <span key={techIndex} className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Build Your AI Agent?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-3xl mx-auto">
            Transform your business with intelligent AI agents that understand, learn, and adapt. Let's build the future of automation together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-white text-indigo-600 px-8 py-4 rounded-lg font-semibold hover:bg-indigo-50 transition-colors duration-300 flex items-center justify-center"
            >
              <PhoneIcon className="w-5 h-5 mr-2" />
              Start Your AI Project
            </Link>
            <Link
              href="/portfolio"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition-colors duration-300"
            >
              View AI Portfolio
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}