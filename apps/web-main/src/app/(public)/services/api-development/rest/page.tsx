import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'REST API Development Services | RESTful API Design & Development | Zoptal',
  description: 'Professional REST API development services. Build scalable, secure RESTful APIs with comprehensive documentation, authentication, and best practices for modern applications.',
  keywords: [
    'REST API development',
    'RESTful API design',
    'REST API services',
    'API development company'
  ]
};

export default function RESTAPIPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-900 via-blue-900 to-indigo-900 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Build Powerful RESTful APIs That Scale
            </h1>
            
            <p className="text-xl text-green-100 mb-8 leading-relaxed">
              Create robust, scalable REST APIs with comprehensive documentation, 
              security, and performance optimization. Power your applications with 
              professionally designed RESTful services.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-green-900 bg-white hover:bg-gray-50 rounded-lg transition-colors shadow-xl"
              >
                Start Your API Project
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* REST Principles */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              REST Architecture Principles
            </h2>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 mb-8">
                We follow REST architectural principles to ensure your APIs are scalable, 
                maintainable, and intuitive to use.
              </p>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Stateless Design</h3>
                  <p className="text-gray-700 mb-4">
                    Each request contains all information needed to process it
                  </p>
                  <ul className="text-gray-600 space-y-2">
                    <li>• Better scalability</li>
                    <li>• Improved reliability</li>
                    <li>• Easier debugging</li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Resource-Based</h3>
                  <p className="text-gray-700 mb-4">
                    URLs represent resources, not actions or operations
                  </p>
                  <ul className="text-gray-600 space-y-2">
                    <li>• Intuitive design</li>
                    <li>• Better organization</li>
                    <li>• Clear structure</li>
                  </ul>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Comprehensive API Features
              </h3>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                <div className="bg-green-50 rounded-xl p-6 text-center">
                  <h4 className="text-lg font-bold text-gray-900 mb-3">Documentation</h4>
                  <p className="text-gray-600 text-sm">
                    Interactive API documentation with examples and testing capabilities
                  </p>
                </div>
                
                <div className="bg-green-50 rounded-xl p-6 text-center">
                  <h4 className="text-lg font-bold text-gray-900 mb-3">Authentication</h4>
                  <p className="text-gray-600 text-sm">
                    Multiple authentication methods for different security requirements
                  </p>
                </div>
                
                <div className="bg-green-50 rounded-xl p-6 text-center">
                  <h4 className="text-lg font-bold text-gray-900 mb-3">Rate Limiting</h4>
                  <p className="text-gray-600 text-sm">
                    Protect your API from abuse and ensure fair usage
                  </p>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Common Use Cases
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="border-l-4 border-green-500 pl-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Mobile App Backend</h4>
                  <p className="text-gray-700 mb-2">
                    RESTful APIs powering iOS and Android applications
                  </p>
                  <p className="text-sm text-green-600">
                    Social media app with user profiles, posts, comments, and real-time messaging
                  </p>
                </div>
                
                <div className="border-l-4 border-green-500 pl-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">E-commerce Integration</h4>
                  <p className="text-gray-700 mb-2">
                    APIs for product catalogs, orders, and payment processing
                  </p>
                  <p className="text-sm text-green-600">
                    Online marketplace with multi-vendor support and complex pricing rules
                  </p>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Technology Stack
              </h3>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white border rounded-xl p-4 text-center">
                  <h4 className="font-bold text-gray-900 mb-2">Node.js + Express</h4>
                  <p className="text-sm text-gray-600">Fast and flexible JavaScript runtime</p>
                </div>
                
                <div className="bg-white border rounded-xl p-4 text-center">
                  <h4 className="font-bold text-gray-900 mb-2">Python + Django</h4>
                  <p className="text-sm text-gray-600">Powerful Python web frameworks</p>
                </div>
                
                <div className="bg-white border rounded-xl p-4 text-center">
                  <h4 className="font-bold text-gray-900 mb-2">.NET Core</h4>
                  <p className="text-sm text-gray-600">Cross-platform Microsoft framework</p>
                </div>
                
                <div className="bg-white border rounded-xl p-4 text-center">
                  <h4 className="font-bold text-gray-900 mb-2">Java + Spring</h4>
                  <p className="text-sm text-gray-600">Enterprise-grade Java framework</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Build Your REST API?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
            Let's create a powerful, scalable REST API that meets your business needs 
            and follows industry best practices.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-green-600 bg-white hover:bg-gray-50 rounded-lg transition-colors shadow-lg"
            >
              Start Your API Project
            </Link>
            
            <Link
              href="/services/api-development"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white hover:bg-white hover:text-green-600 rounded-lg transition-colors"
            >
              View All API Services
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}