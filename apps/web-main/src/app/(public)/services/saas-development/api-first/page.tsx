import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'API-First SaaS Development | Headless SaaS Solutions | Zoptal',
  description: 'Build scalable API-first SaaS platforms with headless architecture. Expert development of multi-channel SaaS applications with robust API infrastructure for modern businesses.',
  keywords: [
    'API-first SaaS development',
    'headless SaaS architecture',
    'API-driven SaaS platform',
    'microservices SaaS'
  ]
};

export default function APIFirstSaaSPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Build API-First SaaS Platforms That Scale
            </h1>
            
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Create modern, headless SaaS applications with robust API infrastructure. 
              Power multiple frontends, enable seamless integrations, and scale 
              components independently for ultimate flexibility.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-blue-900 bg-white hover:bg-gray-50 rounded-lg transition-colors shadow-xl"
              >
                Start Your API-First SaaS
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Why Choose API-First Architecture?
            </h2>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 mb-8">
                Unlock the full potential of modern SaaS development with headless, API-driven architecture 
                that provides ultimate flexibility and scalability.
              </p>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Ultimate Flexibility</h3>
                  <p className="text-gray-600">
                    Decouple frontend and backend for maximum development flexibility and faster iterations
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Multi-Channel Experience</h3>
                  <p className="text-gray-600">
                    Power web apps, mobile apps, IoT devices, and third-party integrations from one API
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Faster Time-to-Market</h3>
                  <p className="text-gray-600">
                    Parallel development of frontend and backend components accelerates delivery
                  </p>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Architecture Components
              </h3>
              
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="bg-blue-50 rounded-xl p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-3">Core API Gateway</h4>
                  <p className="text-gray-700 mb-4">
                    Centralized API management with routing, authentication, and rate limiting
                  </p>
                  <ul className="text-gray-600 space-y-2">
                    <li>• Request routing and load balancing</li>
                    <li>• Authentication and authorization</li>
                    <li>• Rate limiting and quotas</li>
                    <li>• API versioning support</li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 rounded-xl p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-3">Microservices Backend</h4>
                  <p className="text-gray-700 mb-4">
                    Modular, scalable microservices handling specific business domains
                  </p>
                  <ul className="text-gray-600 space-y-2">
                    <li>• Domain-driven design</li>
                    <li>• Independent scaling</li>
                    <li>• Technology diversity</li>
                    <li>• Fault isolation</li>
                  </ul>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Real-World Use Cases
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="border-l-4 border-blue-500 pl-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">E-commerce Platform</h4>
                  <p className="text-gray-700 mb-2">
                    Multi-channel commerce with web, mobile, and partner integrations
                  </p>
                  <p className="text-sm text-blue-600">
                    Product catalog API serving web store, mobile app, and B2B partner portals
                  </p>
                </div>
                
                <div className="border-l-4 border-blue-500 pl-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">FinTech Application</h4>
                  <p className="text-gray-700 mb-2">
                    Financial services accessible via web, mobile, and third-party apps
                  </p>
                  <p className="text-sm text-blue-600">
                    Banking API powering mobile banking, web portal, and fintech integrations
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Build Your API-First SaaS?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Transform your SaaS vision into a scalable, flexible platform that can 
            grow with your business and adapt to future technologies.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-blue-600 bg-white hover:bg-gray-50 rounded-lg transition-colors shadow-lg"
            >
              Start Your Project
            </Link>
            
            <Link
              href="/services/saas-development"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white hover:bg-white hover:text-blue-600 rounded-lg transition-colors"
            >
              View All SaaS Services
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}