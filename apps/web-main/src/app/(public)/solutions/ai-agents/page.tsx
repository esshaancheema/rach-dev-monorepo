'use client';

import { motion } from 'framer-motion';
import { 
  CpuChipIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  ClockIcon,
  BoltIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  UserGroupIcon,
  RocketLaunchIcon,
  Cog6ToothIcon,
  EyeIcon,
  DocumentTextIcon,
  CloudIcon,
  SparklesIcon,
  BeakerIcon,
  CubeTransparentIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import Head from 'next/head';

const agentTypes = [
  {
    id: 'customer-support',
    title: 'Customer Support Agents',
    description: '24/7 intelligent customer service with natural language understanding',
    icon: ChatBubbleLeftRightIcon,
    color: 'from-blue-500 to-cyan-500',
    features: [
      'Multi-language Support',
      'Sentiment Analysis',
      'Ticket Routing',
      'Knowledge Base Integration',
      'Escalation Handling',
      'Performance Analytics'
    ],
    useCases: [
      'Help Desk Automation',
      'FAQ Responses',
      'Order Status Inquiries',
      'Technical Support',
      'Complaint Resolution',
      'Product Information'
    ],
    metrics: {
      efficiency: '85% faster response time',
      satisfaction: '92% customer satisfaction',
      availability: '24/7 availability',
      cost: '60% cost reduction'
    }
  },
  {
    id: 'sales-assistants',
    title: 'Sales & Lead Generation',
    description: 'AI-powered sales agents that qualify leads and drive conversions',
    icon: ChartBarIcon,
    color: 'from-green-500 to-emerald-500',
    features: [
      'Lead Qualification',
      'Product Recommendations',
      'Price Negotiation',
      'CRM Integration',
      'Follow-up Automation',
      'Sales Analytics'
    ],
    useCases: [
      'Lead Scoring',
      'Product Discovery',
      'Quote Generation',
      'Appointment Scheduling',
      'Cross-selling',
      'Customer Onboarding'
    ],
    metrics: {
      efficiency: '3x more qualified leads',
      satisfaction: '40% higher conversion',
      availability: 'Real-time engagement',
      cost: '50% lower acquisition cost'
    }
  },
  {
    id: 'content-creators',
    title: 'Content & Marketing Agents',
    description: 'Intelligent content generation and marketing automation',
    icon: DocumentTextIcon,
    color: 'from-purple-500 to-pink-500',
    features: [
      'Content Generation',
      'SEO Optimization',
      'Social Media Management',
      'Email Campaigns',
      'Brand Voice Consistency',
      'Performance Tracking'
    ],
    useCases: [
      'Blog Writing',
      'Social Posts',
      'Ad Copy Creation',
      'Email Marketing',
      'Product Descriptions',
      'Content Planning'
    ],
    metrics: {
      efficiency: '10x faster content creation',
      satisfaction: '95% brand consistency',
      availability: 'Continuous publishing',
      cost: '70% content cost reduction'
    }
  },
  {
    id: 'data-analysts',
    title: 'Data Analysis Agents',
    description: 'Automated insights and intelligent business intelligence',
    icon: BeakerIcon,
    color: 'from-orange-500 to-red-500',
    features: [
      'Data Processing',
      'Trend Analysis',
      'Predictive Modeling',
      'Report Generation',
      'Anomaly Detection',
      'Visualization Creation'
    ],
    useCases: [
      'Business Intelligence',
      'Market Research',
      'Performance Monitoring',
      'Risk Assessment',
      'Forecasting',
      'Compliance Reporting'
    ],
    metrics: {
      efficiency: '95% faster analysis',
      satisfaction: '99.5% accuracy rate',
      availability: 'Real-time insights',
      cost: '80% analysis cost savings'
    }
  },
  {
    id: 'workflow-automation',
    title: 'Workflow Automation',
    description: 'End-to-end process automation with intelligent decision making',
    icon: Cog6ToothIcon,
    color: 'from-indigo-500 to-purple-500',
    features: [
      'Process Orchestration',
      'Decision Trees',
      'API Integrations',
      'Error Handling',
      'Compliance Checks',
      'Performance Monitoring'
    ],
    useCases: [
      'Document Processing',
      'Approval Workflows',
      'Data Migration',
      'Quality Assurance',
      'Inventory Management',
      'Financial Processing'
    ],
    metrics: {
      efficiency: '90% process automation',
      satisfaction: '99% accuracy rate',
      availability: 'Continuous operation',
      cost: '65% operational savings'
    }
  },
  {
    id: 'personal-assistants',
    title: 'Virtual Personal Assistants',
    description: 'AI companions for productivity and personal task management',
    icon: UserGroupIcon,
    color: 'from-teal-500 to-blue-500',
    features: [
      'Calendar Management',
      'Task Prioritization',
      'Email Management',
      'Meeting Coordination',
      'Travel Planning',
      'Reminder Systems'
    ],
    useCases: [
      'Executive Assistance',
      'Project Management',
      'Event Planning',
      'Research Tasks',
      'Communication Management',
      'Productivity Coaching'
    ],
    metrics: {
      efficiency: '75% time savings',
      satisfaction: '88% user satisfaction',
      availability: 'Always available',
      cost: '45% assistant cost reduction'
    }
  }
];

const developmentProcess = [
  {
    step: 1,
    title: 'Discovery & Planning',
    description: 'Understanding your business needs and defining agent capabilities',
    icon: EyeIcon,
    duration: '1-2 weeks',
    deliverables: ['Requirements Analysis', 'Agent Architecture', 'Technical Specifications']
  },
  {
    step: 2,
    title: 'AI Model Training',
    description: 'Custom training with your data and industry-specific knowledge',
    icon: CpuChipIcon,
    duration: '2-4 weeks',
    deliverables: ['Trained Models', 'Knowledge Base', 'Testing Framework']
  },
  {
    step: 3,
    title: 'Integration & Development',
    description: 'Building and integrating the agent with your existing systems',
    icon: CubeTransparentIcon,
    duration: '3-6 weeks',
    deliverables: ['Agent Application', 'API Integrations', 'User Interface']
  },
  {
    step: 4,
    title: 'Testing & Optimization',
    description: 'Comprehensive testing and performance optimization',
    icon: BeakerIcon,
    duration: '1-2 weeks',
    deliverables: ['Quality Assurance', 'Performance Metrics', 'Optimization Report']
  },
  {
    step: 5,
    title: 'Deployment & Monitoring',
    description: 'Live deployment with continuous monitoring and improvements',
    icon: CloudIcon,
    duration: '1 week',
    deliverables: ['Production Deployment', 'Monitoring Dashboard', 'Maintenance Plan']
  }
];

const technologies = [
  { name: 'OpenAI GPT-4', logo: '🤖', category: 'Language Models' },
  { name: 'Claude', logo: '🧠', category: 'Conversational AI' },
  { name: 'LangChain', logo: '⛓️', category: 'AI Framework' },
  { name: 'Pinecone', logo: '🌲', category: 'Vector Database' },
  { name: 'Hugging Face', logo: '🤗', category: 'Model Hub' },
  { name: 'DialogFlow', logo: '💬', category: 'Conversation Platform' },
  { name: 'Rasa', logo: '🤖', category: 'Open Source NLU' },
  { name: 'FastAPI', logo: '⚡', category: 'API Framework' }
];

export default function AIAgentsPage() {
  return (
    <>
      <Head>
        <title>AI Agents Development | Intelligent Automation Solutions | Zoptal</title>
        <meta name="description" content="Build powerful AI agents that automate tasks, enhance customer experiences, and drive business growth. Custom chatbots, virtual assistants, and intelligent automation." />
        <meta name="keywords" content="AI agents, chatbot development, virtual assistants, intelligent automation, conversational AI, AI-powered bots, custom AI agents, business automation" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Service",
              "name": "AI Agents Development",
              "description": "Custom AI agent development for business automation and customer engagement",
              "provider": {
                "@type": "Organization",
                "name": "Zoptal"
              },
              "serviceType": "AI Development",
              "areaServed": "Worldwide"
            })
          }}
        />
      </Head>

      <div>
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center space-x-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6"
              >
                <CpuChipIcon className="w-4 h-4" />
                <span>AI Agents Development</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6"
              >
                Intelligent AI Agents
                <br />
                <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  That Work for You
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
              >
                Transform your business with custom AI agents that automate tasks, 
                enhance customer experiences, and drive growth 24/7.
              </motion.p>

              {/* Key Metrics */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12"
              >
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-2">85%</div>
                  <div className="text-gray-600 text-sm">Faster Response</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-2">24/7</div>
                  <div className="text-gray-600 text-sm">Availability</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-2">60%</div>
                  <div className="text-gray-600 text-sm">Cost Reduction</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-2">92%</div>
                  <div className="text-gray-600 text-sm">User Satisfaction</div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center space-x-2 bg-primary-600 text-white px-8 py-4 rounded-lg hover:bg-primary-700 transition-all font-semibold shadow-lg hover:shadow-xl"
                >
                  <span>Start Building Your Agent</span>
                  <RocketLaunchIcon className="w-5 h-5" />
                </Link>
                <Link
                  href="#agent-types"
                  className="inline-flex items-center justify-center space-x-2 bg-white text-primary-600 px-8 py-4 rounded-lg border border-primary-200 hover:bg-primary-50 transition-all font-semibold"
                >
                  <span>Explore AI Agents</span>
                  <EyeIcon className="w-5 h-5" />
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* AI Agent Types */}
        <section id="agent-types" className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-3xl font-bold text-gray-900 mb-4"
              >
                Types of AI Agents We Build
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-xl text-gray-600 max-w-3xl mx-auto"
              >
                From customer support to data analysis, our AI agents are tailored 
                to your specific business needs and industry requirements.
              </motion.p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {agentTypes.map((agent, index) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-lg transition-all duration-300 group"
                >
                  {/* Agent Header */}
                  <div className="flex items-start space-x-4 mb-6">
                    <div className={`w-16 h-16 bg-gradient-to-r ${agent.color} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                      <agent.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-700 transition-colors">
                        {agent.title}
                      </h3>
                      <p className="text-gray-600">
                        {agent.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Features */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Key Features:</h4>
                      <ul className="space-y-2">
                        {agent.features.slice(0, 4).map((feature, idx) => (
                          <li key={idx} className="flex items-center text-sm text-gray-600">
                            <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Use Cases */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Use Cases:</h4>
                      <ul className="space-y-2">
                        {agent.useCases.slice(0, 4).map((useCase, idx) => (
                          <li key={idx} className="flex items-center text-sm text-gray-600">
                            <div className="w-1.5 h-1.5 bg-secondary-500 rounded-full mr-2 flex-shrink-0" />
                            {useCase}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-primary-600">
                          {agent.metrics.efficiency}
                        </div>
                        <div className="text-xs text-gray-600">Efficiency Gain</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-primary-600">
                          {agent.metrics.satisfaction}
                        </div>
                        <div className="text-xs text-gray-600">Success Rate</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Development Process */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-3xl font-bold text-gray-900 mb-4"
              >
                Our AI Agent Development Process
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-xl text-gray-600 max-w-3xl mx-auto"
              >
                From concept to deployment, we follow a proven methodology to ensure 
                your AI agent delivers exceptional results.
              </motion.p>
            </div>

            <div className="relative">
              {/* Process Steps */}
              <div className="space-y-8">
                {developmentProcess.map((step, index) => (
                  <motion.div
                    key={step.step}
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="relative bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-start space-x-6">
                      {/* Step Number */}
                      <div className="w-16 h-16 bg-primary-600 text-white rounded-xl flex items-center justify-center font-bold text-xl flex-shrink-0">
                        {step.step}
                      </div>

                      {/* Step Content */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-bold text-gray-900">
                            {step.title}
                          </h3>
                          <div className="flex items-center space-x-4">
                            <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
                              {step.duration}
                            </span>
                            <step.icon className="w-6 h-6 text-primary-600" />
                          </div>
                        </div>

                        <p className="text-gray-600 mb-4">
                          {step.description}
                        </p>

                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Deliverables:</h4>
                          <div className="flex flex-wrap gap-2">
                            {step.deliverables.map((deliverable, idx) => (
                              <span
                                key={idx}
                                className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                              >
                                {deliverable}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Technologies */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-3xl font-bold text-gray-900 mb-4"
              >
                Cutting-Edge AI Technologies
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-xl text-gray-600 max-w-3xl mx-auto"
              >
                We leverage the latest AI models and frameworks to build intelligent, 
                scalable, and efficient AI agents.
              </motion.p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {technologies.map((tech, index) => (
                <motion.div
                  key={tech.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="bg-white rounded-xl border border-gray-200 p-6 text-center hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="text-4xl mb-3">{tech.logo}</div>
                  <h3 className="font-semibold text-gray-900 mb-1">{tech.name}</h3>
                  <p className="text-sm text-gray-600">{tech.category}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto"
            >
              <h2 className="text-3xl font-bold text-white mb-6">
                Ready to Build Your AI Agent?
              </h2>
              <p className="text-xl text-primary-100 mb-8">
                Transform your business operations with intelligent AI agents that work 
                around the clock to serve your customers and optimize your processes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center space-x-2 bg-white text-primary-600 px-8 py-4 rounded-lg hover:bg-gray-50 transition-all font-semibold shadow-lg hover:shadow-xl"
                >
                  <span>Start Your AI Agent Project</span>
                  <SparklesIcon className="w-5 h-5" />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center space-x-2 bg-primary-700 text-white px-8 py-4 rounded-lg hover:bg-primary-800 transition-all font-semibold border border-primary-500"
                >
                  <span>View Pricing</span>
                  <ChartBarIcon className="w-5 h-5" />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
}