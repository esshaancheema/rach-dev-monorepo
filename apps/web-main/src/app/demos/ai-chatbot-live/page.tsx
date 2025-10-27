import { Metadata } from 'next';
import AIChatbotDemo from '@/components/demos/AIChatbotDemo';
import Link from 'next/link';
import { 
  ChevronLeftIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Live AI Chatbot Demo | Experience Zoptal\'s AI Assistant',
  description: 'Try our live AI chatbot demo and see how intelligent conversational AI can transform your customer service. Interactive demonstration with real-time responses.',
  keywords: [
    'AI chatbot demo',
    'live chatbot demonstration',
    'conversational AI',
    'customer service AI',
    'intelligent chatbot',
    'AI assistant demo',
    'chatbot technology',
    'NLP demonstration'
  ],
  openGraph: {
    title: 'Live AI Chatbot Demo | Experience Zoptal\'s AI Assistant',
    description: 'Try our live AI chatbot demo and see how intelligent conversational AI can transform your customer service.',
    url: 'https://zoptal.com/demos/ai-chatbot-live',
    siteName: 'Zoptal',
    images: [
      {
        url: '/images/demos/ai-chatbot-demo.jpg',
        width: 1200,
        height: 630,
        alt: 'AI Chatbot Demo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Live AI Chatbot Demo | Experience Zoptal\'s AI Assistant',
    description: 'Try our live AI chatbot demo and see how intelligent conversational AI can transform your customer service.',
    images: ['/images/demos/ai-chatbot-demo.jpg'],
    creator: '@ZoptalTech',
  },
};

const features = [
  {
    icon: SparklesIcon,
    title: 'Natural Language Processing',
    description: 'Understands context, intent, and nuance in customer conversations'
  },
  {
    icon: ClockIcon,
    title: 'Instant Responses',
    description: 'Provides immediate answers 24/7, reducing customer wait times'
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: 'Contextual Conversations',
    description: 'Maintains conversation history for more natural interactions'
  },
  {
    icon: CheckCircleIcon,
    title: 'High Accuracy',
    description: '85%+ intent recognition accuracy with continuous learning'
  }
];

const benefits = [
  '24/7 customer support availability',
  '85% reduction in response time',
  'Handle 1000+ simultaneous conversations',
  'Multilingual support capabilities',
  'Seamless handoff to human agents',
  'Integration with existing systems'
];

const useCases = [
  {
    title: 'Customer Support',
    description: 'Handle common queries, troubleshooting, and account management',
    example: 'User: "I can\'t log into my account" → AI provides step-by-step recovery process'
  },
  {
    title: 'Sales Assistance',
    description: 'Product recommendations, pricing information, and lead qualification',
    example: 'User: "What\'s the best plan for my business?" → AI asks qualifying questions and suggests options'
  },
  {
    title: 'Appointment Booking',
    description: 'Schedule meetings, check availability, and send confirmations',
    example: 'User: "I need to schedule a consultation" → AI checks calendar and books appointment'
  },
  {
    title: 'FAQ & Information',
    description: 'Instant answers to frequently asked questions and company information',
    example: 'User: "What are your business hours?" → AI provides current hours and contact information'
  }
];

export default function AIChatbotLivePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link
              href="/demos"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronLeftIcon className="h-5 w-5 mr-2" />
              Back to Demos
            </Link>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <SparklesIcon className="h-12 w-12 text-yellow-400 mr-4" />
            <h1 className="text-4xl lg:text-5xl font-bold">
              Live AI Chatbot Demo
            </h1>
          </div>
          
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Experience the power of conversational AI firsthand. This interactive demo showcases 
            how our intelligent chatbots can transform your customer service and user engagement.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#demo"
              className="inline-flex items-center px-8 py-4 bg-yellow-400 text-gray-900 font-semibold rounded-xl hover:bg-yellow-300 transition-colors"
            >
              Try the Demo
              <ArrowRightIcon className="h-5 w-5 ml-2" />
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-blue-600 transition-colors"
            >
              Get Your Chatbot
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Demo */}
          <div id="demo" className="lg:order-2">
            <div className="sticky top-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                🤖 Try Our AI Assistant
              </h2>
              <AIChatbotDemo />
              
              <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">💡 Demo Tips:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Ask about our services and pricing</li>
                  <li>• Try questions like "How does your development process work?"</li>
                  <li>• Notice the intent recognition and confidence scores</li>
                  <li>• Use the quick suggestions for common queries</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Information */}
          <div className="lg:order-1 space-y-12">
            {/* Features */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Key Features
              </h2>
              <div className="space-y-6">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                      <feature.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Benefits */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Business Benefits
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Use Cases */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Common Use Cases
              </h2>
              <div className="space-y-6">
                {useCases.map((useCase, index) => (
                  <div key={index} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {useCase.title}
                    </h3>
                    <p className="text-gray-600 mb-3">{useCase.description}</p>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Example:</span> {useCase.example}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Technical Specs */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Technical Capabilities
              </h2>
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">AI & NLP:</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Advanced language models (GPT-4, Claude)</li>
                      <li>• Intent classification & entity extraction</li>
                      <li>• Sentiment analysis</li>
                      <li>• Context retention across conversations</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Integration:</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• CRM systems (HubSpot, Salesforce)</li>
                      <li>• Help desk platforms (Zendesk, Intercom)</li>
                      <li>• Custom APIs and databases</li>
                      <li>• Multi-channel deployment</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Deploy Your AI Assistant?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            This demo showcases just the beginning. Our production chatbots integrate with your 
            business systems, learn from your data, and provide sophisticated conversational experiences.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center px-8 py-4 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
            >
              Build Your Chatbot
              <ArrowRightIcon className="h-5 w-5 ml-2" />
            </Link>
            <Link
              href="/services/ai-development"
              className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-indigo-600 transition-colors"
            >
              Learn About AI Services
            </Link>
          </div>
        </div>
      </div>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareDemo',
            name: 'AI Chatbot Live Demo',
            description: 'Interactive demonstration of Zoptal\'s AI-powered chatbot technology',
            url: 'https://zoptal.com/demos/ai-chatbot-live',
            applicationCategory: 'AI',
            operatingSystem: 'Web Browser',
            provider: {
              '@type': 'Organization',
              name: 'Zoptal',
              url: 'https://zoptal.com',
            },
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
            featureList: [
              'Natural Language Processing',
              'Intent Recognition',
              'Real-time Responses',
              'Conversation Context',
              'Multi-language Support'
            ],
          }),
        }}
      />
    </div>
  );
}