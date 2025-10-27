import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  SparklesIcon,
  CpuChipIcon,
  ChartBarIcon,
  ChatBubbleBottomCenterTextIcon,
  EyeIcon,
  BoltIcon,
  CheckIcon,
  ArrowRightIcon,
  StarIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';
import OptimizedImage from '@/components/ui/OptimizedImage';

export const metadata: Metadata = {
  title: 'AI Development Services | Machine Learning & AI Solutions | Zoptal',
  description: 'Expert AI development services including machine learning, natural language processing, computer vision, and intelligent automation. Transform your business with cutting-edge AI technology.',
  keywords: ['AI development', 'machine learning', 'artificial intelligence', 'NLP', 'computer vision', 'chatbot development', 'AI automation'],
  openGraph: {
    title: 'AI Development Services | Zoptal',
    description: 'Transform your business with cutting-edge AI solutions. Expert machine learning and artificial intelligence development.',
    images: ['/images/og-image.png'],
  },
};

const features = [
  {
    icon: CpuChipIcon,
    title: 'Machine Learning Models',
    description: 'Custom ML models trained on your data for predictive analytics and intelligent decision-making.'
  },
  {
    icon: ChatBubbleBottomCenterTextIcon,
    title: 'Natural Language Processing',
    description: 'Advanced NLP solutions for text analysis, sentiment detection, and language understanding.'
  },
  {
    icon: EyeIcon,
    title: 'Computer Vision',
    description: 'Image recognition, object detection, and visual analytics powered by deep learning.'
  },
  {
    icon: BoltIcon,
    title: 'Intelligent Automation',
    description: 'Automate complex workflows with AI-powered decision engines and process optimization.'
  }
];

const services = [
  {
    title: 'Chatbot Development',
    description: 'Conversational AI solutions for customer service and engagement',
    href: '/services/ai-development/chatbots',
    features: ['24/7 Customer Support', 'Multi-language Support', 'Context Awareness', 'Seamless Integration']
  },
  {
    title: 'Predictive Analytics',
    description: 'Data-driven insights and forecasting for business intelligence',
    href: '/services/ai-development/analytics',
    features: ['Sales Forecasting', 'Risk Assessment', 'Demand Prediction', 'Trend Analysis']
  },
  {
    title: 'AI Process Automation',
    description: 'Intelligent workflow automation and optimization',
    href: '/services/ai-development/automation',
    features: ['Document Processing', 'Data Extraction', 'Quality Control', 'Decision Automation']
  }
];

const technologies = [
  'TensorFlow', 'PyTorch', 'OpenAI', 'Hugging Face', 'scikit-learn', 'Keras', 
  'LangChain', 'GPT-4', 'BERT', 'Stable Diffusion', 'AWS SageMaker', 'Azure ML'
];

const packages = [
  {
    name: 'AI Starter',
    price: '$5,000',
    duration: '/month',
    description: 'Perfect for businesses starting their AI journey',
    features: [
      'AI Chatbot Implementation',
      'Basic NLP Integration',
      'Pre-trained Model Deployment',
      'API Integration',
      'Monthly Support',
      'Performance Monitoring'
    ],
    cta: { text: 'Get Started', href: '/contact?package=ai-starter' }
  },
  {
    name: 'AI Professional',
    price: '$15,000',
    duration: '/month',
    description: 'Advanced AI solutions for growing businesses',
    features: [
      'Custom ML Model Development',
      'Advanced NLP Solutions',
      'Computer Vision Integration',
      'Real-time Analytics',
      'Weekly Support Calls',
      'Model Optimization',
      'A/B Testing',
      'Custom Dashboards'
    ],
    popular: true,
    cta: { text: 'Start Free Trial', href: '/contact?package=ai-professional' }
  },
  {
    name: 'AI Enterprise',
    price: 'Custom',
    duration: 'pricing',
    description: 'Enterprise-grade AI transformation',
    features: [
      'End-to-end AI Strategy',
      'Multiple Custom Models',
      'Full MLOps Pipeline',
      'On-premise Deployment',
      'Dedicated AI Team',
      '24/7 Support',
      'Compliance & Security',
      'Executive Reporting'
    ],
    cta: { text: 'Contact Sales', href: '/contact?package=ai-enterprise' }
  }
];

export default function AIDevelopmentPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-20">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-600/20 backdrop-blur-sm text-purple-200 text-sm font-medium mb-6">
                <SparklesIcon className="h-4 w-4 mr-2" />
                AI Development Services
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Unleash the Power of
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent block">
                  Artificial Intelligence
                </span>
              </h1>
              
              <p className="text-xl text-purple-100 mb-8 leading-relaxed">
                Transform your business with cutting-edge AI solutions. From machine learning 
                models to intelligent automation, we build AI systems that drive innovation 
                and deliver measurable results.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Start Your AI Journey
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="#demo"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-white/10 backdrop-blur-sm text-white font-semibold hover:bg-white/20 transition-all duration-200 border border-white/20"
                >
                  View AI Demo
                </Link>
              </div>
              
              <div className="grid grid-cols-3 gap-6 mt-12">
                <div>
                  <p className="text-3xl font-bold text-white">95%</p>
                  <p className="text-purple-200 text-sm">Accuracy Rate</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">10x</p>
                  <p className="text-purple-200 text-sm">Faster Processing</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">50%</p>
                  <p className="text-purple-200 text-sm">Cost Reduction</p>
                </div>
              </div>
            </div>
            
            <div className="relative lg:pl-8">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/20 to-pink-600/20" />
                <OptimizedImage
                  src="/images/services/ai-development-hero.jpg"
                  alt="AI Development Services"
                  width={600}
                  height={400}
                  className="w-full h-auto"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-lg shadow-xl p-4 dark:bg-gray-800">
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <CpuChipIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">AI Powered</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Latest Models</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              AI Development Capabilities
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Leverage state-of-the-art AI technologies to solve complex business challenges
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              AI Solutions We Deliver
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Comprehensive AI services tailored to your industry and use case
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {service.description}
                  </p>
                  
                  <ul className="space-y-3 mb-6">
                    {service.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-start">
                        <CheckIcon className="h-5 w-5 text-purple-600 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link
                    href={service.href}
                    className="inline-flex items-center text-purple-600 hover:text-purple-700 font-semibold"
                  >
                    Learn More
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technologies */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              AI Technologies We Master
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Working with the latest AI frameworks and platforms
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            {technologies.map((tech, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-md text-gray-700 dark:text-gray-300 hover:shadow-lg transition-shadow"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Process Timeline */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our AI Development Process
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              A systematic approach to building AI solutions that deliver results
            </p>
          </div>
          
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-purple-600 to-pink-600"></div>
            
            <div className="space-y-12">
              {[
                { step: 1, title: 'Discovery & Analysis', description: 'Understanding your business needs and data landscape', duration: '1-2 weeks' },
                { step: 2, title: 'Data Preparation', description: 'Collecting, cleaning, and preparing training data', duration: '2-3 weeks' },
                { step: 3, title: 'Model Development', description: 'Building and training AI models', duration: '4-6 weeks' },
                { step: 4, title: 'Testing & Optimization', description: 'Fine-tuning for accuracy and performance', duration: '2-3 weeks' },
                { step: 5, title: 'Deployment & Integration', description: 'Implementing AI solutions in your environment', duration: '1-2 weeks' },
                { step: 6, title: 'Monitoring & Support', description: 'Continuous improvement and maintenance', duration: 'Ongoing' }
              ].map((item, index) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className="flex-1">
                    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${index % 2 === 0 ? 'mr-8 text-right' : 'ml-8'}`}>
                      <div className="text-purple-600 font-semibold mb-1">Step {item.step}</div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-2">{item.description}</p>
                      <span className="text-sm text-purple-600 font-medium">{item.duration}</span>
                    </div>
                  </div>
                  <div className="relative z-10 flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full text-white font-bold">
                    {item.step}
                  </div>
                  <div className="flex-1"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Packages */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              AI Development Packages
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Flexible pricing options to match your AI ambitions
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <div
                key={index}
                className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg ${
                  pkg.popular ? 'ring-2 ring-purple-600 scale-105' : ''
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {pkg.name}
                  </h3>
                  <div className="flex items-baseline mb-4">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">{pkg.price}</span>
                    <span className="text-gray-600 dark:text-gray-400 ml-2">{pkg.duration}</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {pkg.description}
                  </p>
                  
                  <ul className="space-y-3 mb-8">
                    {pkg.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-start">
                        <CheckIcon className="h-5 w-5 text-purple-600 mt-0.5 mr-3 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link
                    href={pkg.cta.href}
                    className={`block text-center py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                      pkg.popular
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                        : 'bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:hover:bg-purple-900/30'
                    }`}
                  >
                    {pkg.cta.text}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-900 to-pink-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Business with AI?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Let's discuss how AI can revolutionize your operations and drive growth
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-3 rounded-lg bg-white text-purple-900 font-semibold hover:bg-gray-100 transition-all duration-200"
            >
              Get AI Consultation
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/case-studies"
              className="inline-flex items-center justify-center px-8 py-3 rounded-lg bg-purple-800 text-white font-semibold hover:bg-purple-700 transition-all duration-200"
            >
              View Success Stories
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}