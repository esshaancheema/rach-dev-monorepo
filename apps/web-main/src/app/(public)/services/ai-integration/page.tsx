import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'AI Integration Services | Enterprise AI Implementation | Zoptal',
  description: 'Professional AI integration services. Seamlessly integrate AI capabilities into existing systems with custom APIs, third-party AI services, and intelligent automation solutions.',
  keywords: [
    'AI integration services',
    'artificial intelligence integration',
    'AI API integration',
    'enterprise AI implementation',
    'AI system integration',
    'intelligent automation',
    'AI workflow integration'
  ]
};

export default function AIIntegrationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-violet-900 via-purple-900 to-fuchsia-900 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Seamless AI Integration for Intelligent Business Operations
            </h1>
            
            <p className="text-xl text-violet-100 mb-8 leading-relaxed">
              Transform your existing systems with AI capabilities. We integrate machine learning, 
              natural language processing, and intelligent automation into your workflows without 
              disrupting your current operations.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-violet-900 bg-white hover:bg-gray-50 rounded-lg transition-colors shadow-xl"
              >
                Start AI Integration
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* AI Integration Benefits */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Why AI Integration?
            </h2>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 mb-8">
                AI integration allows you to enhance your existing systems with intelligent capabilities 
                without the need for complete system overhauls or lengthy development cycles.
              </p>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Enhanced Decision Making</h3>
                  <p className="text-gray-600">
                    AI-powered insights and predictions to support better business decisions
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Process Automation</h3>
                  <p className="text-gray-600">
                    Automate complex tasks and workflows with intelligent automation
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Improved Efficiency</h3>
                  <p className="text-gray-600">
                    Reduce manual effort and increase operational efficiency across your organization
                  </p>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                AI Integration Services
              </h3>
              
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="bg-violet-50 rounded-xl p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-3">Third-Party AI APIs</h4>
                  <p className="text-gray-700 mb-4">
                    Connect your systems with leading AI services and platforms
                  </p>
                  <ul className="text-gray-600 space-y-2">
                    <li>• OpenAI GPT integration</li>
                    <li>• Google Cloud AI services</li>
                    <li>• AWS AI/ML services</li>
                    <li>• Microsoft Azure Cognitive Services</li>
                  </ul>
                </div>
                
                <div className="bg-violet-50 rounded-xl p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-3">Custom AI Models</h4>
                  <p className="text-gray-700 mb-4">
                    Develop and integrate custom machine learning models
                  </p>
                  <ul className="text-gray-600 space-y-2">
                    <li>• Predictive analytics models</li>
                    <li>• Classification and clustering</li>
                    <li>• Computer vision solutions</li>
                    <li>• Natural language processing</li>
                  </ul>
                </div>
                
                <div className="bg-violet-50 rounded-xl p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-3">Intelligent Automation</h4>
                  <p className="text-gray-700 mb-4">
                    Automate business processes with AI-powered workflows
                  </p>
                  <ul className="text-gray-600 space-y-2">
                    <li>• Document processing automation</li>
                    <li>• Intelligent data extraction</li>
                    <li>• Workflow optimization</li>
                    <li>• Decision tree automation</li>
                  </ul>
                </div>
                
                <div className="bg-violet-50 rounded-xl p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-3">AI-Powered Analytics</h4>
                  <p className="text-gray-700 mb-4">
                    Transform your data into actionable insights with AI
                  </p>
                  <ul className="text-gray-600 space-y-2">
                    <li>• Predictive analytics dashboards</li>
                    <li>• Anomaly detection systems</li>
                    <li>• Real-time monitoring</li>
                    <li>• Performance optimization</li>
                  </ul>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Integration Approach
              </h3>
              
              <div className="space-y-6 mb-8">
                <div className="border-l-4 border-violet-500 pl-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">1. Assessment & Planning</h4>
                  <p className="text-gray-700 mb-2">
                    Evaluate existing systems and identify AI integration opportunities
                  </p>
                  <ul className="text-gray-600 space-y-1 text-sm">
                    <li>• System architecture analysis</li>
                    <li>• Use case identification</li>
                    <li>• ROI assessment</li>
                  </ul>
                </div>
                
                <div className="border-l-4 border-violet-500 pl-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">2. AI Solution Design</h4>
                  <p className="text-gray-700 mb-2">
                    Design AI solutions that fit seamlessly into your existing workflow
                  </p>
                  <ul className="text-gray-600 space-y-1 text-sm">
                    <li>• Integration architecture design</li>
                    <li>• API specification</li>
                    <li>• Data flow planning</li>
                  </ul>
                </div>
                
                <div className="border-l-4 border-violet-500 pl-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">3. Implementation & Testing</h4>
                  <p className="text-gray-700 mb-2">
                    Careful implementation with comprehensive testing and validation
                  </p>
                  <ul className="text-gray-600 space-y-1 text-sm">
                    <li>• Phased rollout approach</li>
                    <li>• Performance monitoring</li>
                    <li>• User training and support</li>
                  </ul>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Use Cases by Industry
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="border-l-4 border-violet-500 pl-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Healthcare</h4>
                  <p className="text-gray-700 mb-2">
                    AI-powered diagnosis assistance and patient data analysis
                  </p>
                  <p className="text-sm text-violet-600">
                    Medical image analysis, symptom checker integration, patient risk assessment
                  </p>
                </div>
                
                <div className="border-l-4 border-violet-500 pl-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">E-commerce</h4>
                  <p className="text-gray-700 mb-2">
                    Personalized recommendations and intelligent inventory management
                  </p>
                  <p className="text-sm text-violet-600">
                    Product recommendation engines, demand forecasting, dynamic pricing
                  </p>
                </div>
                
                <div className="border-l-4 border-violet-500 pl-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Financial Services</h4>
                  <p className="text-gray-700 mb-2">
                    Fraud detection and risk assessment automation
                  </p>
                  <p className="text-sm text-violet-600">
                    Transaction monitoring, credit scoring, algorithmic trading integration
                  </p>
                </div>
                
                <div className="border-l-4 border-violet-500 pl-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Manufacturing</h4>
                  <p className="text-gray-700 mb-2">
                    Predictive maintenance and quality control automation
                  </p>
                  <p className="text-sm text-violet-600">
                    Equipment monitoring, defect detection, supply chain optimization
                  </p>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                AI Platforms We Integrate
              </h3>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white border rounded-xl p-4 text-center">
                  <h4 className="font-bold text-gray-900 mb-2">OpenAI</h4>
                  <p className="text-sm text-gray-600">GPT, DALL-E, Whisper APIs</p>
                </div>
                
                <div className="bg-white border rounded-xl p-4 text-center">
                  <h4 className="font-bold text-gray-900 mb-2">Google AI</h4>
                  <p className="text-sm text-gray-600">Vertex AI, AutoML, Vision API</p>
                </div>
                
                <div className="bg-white border rounded-xl p-4 text-center">
                  <h4 className="font-bold text-gray-900 mb-2">AWS AI</h4>
                  <p className="text-sm text-gray-600">SageMaker, Rekognition, Comprehend</p>
                </div>
                
                <div className="bg-white border rounded-xl p-4 text-center">
                  <h4 className="font-bold text-gray-900 mb-2">Azure AI</h4>
                  <p className="text-sm text-gray-600">Cognitive Services, Bot Framework</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-violet-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Integrate AI Into Your Business?
          </h2>
          <p className="text-xl text-violet-100 mb-8 max-w-3xl mx-auto">
            Transform your operations with intelligent AI capabilities that enhance productivity, 
            improve decision-making, and drive business growth.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-violet-600 bg-white hover:bg-gray-50 rounded-lg transition-colors shadow-lg"
            >
              Start AI Integration
            </Link>
            
            <Link
              href="/services/ai-development"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white hover:bg-white hover:text-violet-600 rounded-lg transition-colors"
            >
              View AI Development Services
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}