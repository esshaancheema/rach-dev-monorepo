import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Developer Guides | Technical Resources | Zoptal',
  description: 'Comprehensive developer guides and technical resources. Learn best practices, implementation guides, and development tutorials for modern software development.',
  keywords: [
    'developer guides',
    'technical resources',
    'development tutorials',
    'best practices',
    'implementation guides',
    'software development guides'
  ]
};

export default function GuidesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-900 via-green-900 to-teal-900 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Developer Guides & Technical Resources
            </h1>
            
            <p className="text-xl text-emerald-100 mb-8 leading-relaxed">
              Comprehensive guides to help you master modern software development. 
              From beginner tutorials to advanced implementation guides, find the 
              resources you need to build better software.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-emerald-900 bg-white hover:bg-gray-50 rounded-lg transition-colors shadow-xl"
              >
                Request Custom Guide
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Guide Categories */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
              Browse Guides by Category
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              <div className="bg-emerald-50 rounded-xl p-8 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl font-bold">API</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">API Development</h3>
                <p className="text-gray-600 mb-4">
                  Learn to build robust REST APIs, GraphQL services, and microservices
                </p>
                <div className="text-sm text-emerald-600">
                  12 guides available
                </div>
              </div>
              
              <div className="bg-emerald-50 rounded-xl p-8 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl font-bold">AI</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">AI Integration</h3>
                <p className="text-gray-600 mb-4">
                  Step-by-step guides for integrating AI into your applications
                </p>
                <div className="text-sm text-emerald-600">
                  8 guides available
                </div>
              </div>
              
              <div className="bg-emerald-50 rounded-xl p-8 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl font-bold">WEB</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Web Development</h3>
                <p className="text-gray-600 mb-4">
                  Modern web development with React, Next.js, and serverless
                </p>
                <div className="text-sm text-emerald-600">
                  15 guides available
                </div>
              </div>
            </div>

            {/* Featured Guides */}
            <h3 className="text-2xl font-bold text-gray-900 mb-8">
              Featured Guides
            </h3>
            
            <div className="space-y-6 mb-12">
              <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">
                      Building Scalable REST APIs with Node.js
                    </h4>
                    <p className="text-gray-600 mb-4">
                      Complete guide to building production-ready REST APIs with authentication, 
                      rate limiting, and comprehensive error handling.
                    </p>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium">
                    Intermediate
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>45 min read</span>
                    <span>•</span>
                    <span>Updated Dec 2024</span>
                  </div>
                  <Link 
                    href="#" 
                    className="text-emerald-600 hover:text-emerald-800 font-medium"
                  >
                    Read Guide →
                  </Link>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">
                      AI Chatbot Integration with OpenAI
                    </h4>
                    <p className="text-gray-600 mb-4">
                      Step-by-step tutorial on integrating OpenAI's GPT models into your web application 
                      with real-time streaming and conversation memory.
                    </p>
                  </div>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    Beginner
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>30 min read</span>
                    <span>•</span>
                    <span>Updated Nov 2024</span>
                  </div>
                  <Link 
                    href="#" 
                    className="text-emerald-600 hover:text-emerald-800 font-medium"
                  >
                    Read Guide →
                  </Link>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">
                      Microservices Architecture with Docker
                    </h4>
                    <p className="text-gray-600 mb-4">
                      Learn to break down monolithic applications into scalable microservices 
                      using Docker containers and Kubernetes orchestration.
                    </p>
                  </div>
                  <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                    Advanced
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>1 hour read</span>
                    <span>•</span>
                    <span>Updated Dec 2024</span>
                  </div>
                  <Link 
                    href="#" 
                    className="text-emerald-600 hover:text-emerald-800 font-medium"
                  >
                    Read Guide →
                  </Link>
                </div>
              </div>
            </div>

            {/* Quick Start Guides */}
            <h3 className="text-2xl font-bold text-gray-900 mb-8">
              Quick Start Guides
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
                <h4 className="text-lg font-bold text-gray-900 mb-3">
                  Setting up Next.js with TypeScript
                </h4>
                <p className="text-gray-600 mb-4 text-sm">
                  Get started with modern React development using Next.js 14 and TypeScript
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-purple-600">10 min setup</span>
                  <Link href="#" className="text-purple-600 text-sm font-medium">
                    Start →
                  </Link>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6">
                <h4 className="text-lg font-bold text-gray-900 mb-3">
                  Database Design Best Practices
                </h4>
                <p className="text-gray-600 mb-4 text-sm">
                  Essential principles for designing efficient and scalable database schemas
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-blue-600">15 min read</span>
                  <Link href="#" className="text-blue-600 text-sm font-medium">
                    Learn →
                  </Link>
                </div>
              </div>
            </div>

            {/* Resource Types */}
            <h3 className="text-2xl font-bold text-gray-900 mb-8">
              Resource Types
            </h3>
            
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-emerald-600 font-bold">📘</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Tutorials</h4>
                <p className="text-sm text-gray-600">Step-by-step walkthroughs</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-emerald-600 font-bold">🔧</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">How-to Guides</h4>
                <p className="text-sm text-gray-600">Practical implementation guides</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-emerald-600 font-bold">📋</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Best Practices</h4>
                <p className="text-sm text-gray-600">Industry standards and patterns</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-emerald-600 font-bold">🚀</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Quick Starts</h4>
                <p className="text-sm text-gray-600">Fast setup and configuration</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-green-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Need a Custom Guide?
          </h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-3xl mx-auto">
            Can't find what you're looking for? We create custom technical guides 
            and documentation tailored to your specific needs and technology stack.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-emerald-600 bg-white hover:bg-gray-50 rounded-lg transition-colors shadow-lg"
            >
              Request Custom Guide
            </Link>
            
            <Link
              href="/resources"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white hover:bg-white hover:text-emerald-600 rounded-lg transition-colors"
            >
              View All Resources
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}