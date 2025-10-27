import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Case Studies | Success Stories | Zoptal',
  description: 'Explore our client success stories and case studies. See how we have helped businesses transform with custom software solutions, AI integration, and digital transformation.',
  keywords: [
    'case studies',
    'success stories',
    'client projects',
    'software development case studies',
    'AI integration examples',
    'digital transformation stories'
  ]
};

export default function CaseStudiesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Client Success Stories & Case Studies
            </h1>
            
            <p className="text-xl text-indigo-100 mb-8 leading-relaxed">
              Discover how we've helped businesses across industries transform with 
              innovative software solutions. From startup MVPs to enterprise digital 
              transformation, see the real impact of our work.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-indigo-900 bg-white hover:bg-gray-50 rounded-lg transition-colors shadow-xl"
              >
                Start Your Success Story
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-12 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-4 justify-center">
            <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
              All Cases
            </button>
            <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
              AI Integration
            </button>
            <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
              Web Development
            </button>
            <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
              Enterprise Solutions
            </button>
            <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
              Mobile Apps
            </button>
          </div>
        </div>
      </section>

      {/* Featured Case Studies */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Featured Success Stories
          </h2>
          
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* Featured Case Study 1 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl mr-4">
                  F
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">FinTech Startup</h3>
                  <p className="text-gray-600">Digital Banking Platform</p>
                </div>
              </div>
              
              <h4 className="text-2xl font-bold text-gray-900 mb-4">
                300% Increase in User Engagement with AI-Powered Personal Finance
              </h4>
              
              <p className="text-gray-700 mb-6">
                Built a comprehensive digital banking platform with AI-driven financial insights, 
                automated budgeting, and personalized investment recommendations. Integrated with 
                multiple payment processors and banking APIs for seamless user experience.
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">300%</div>
                  <div className="text-sm text-gray-600">User Engagement</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">50K+</div>
                  <div className="text-sm text-gray-600">Active Users</div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">React</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Node.js</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">AI/ML</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">PostgreSQL</span>
              </div>
              
              <Link 
                href="#" 
                className="text-blue-600 hover:text-blue-800 font-semibold"
              >
                Read Full Case Study →
              </Link>
            </div>

            {/* Featured Case Study 2 */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-xl mr-4">
                  E
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">E-commerce Giant</h3>
                  <p className="text-gray-600">Marketplace Platform</p>
                </div>
              </div>
              
              <h4 className="text-2xl font-bold text-gray-900 mb-4">
                Scalable Microservices Architecture Handles 1M+ Daily Orders
              </h4>
              
              <p className="text-gray-700 mb-6">
                Transformed monolithic e-commerce platform into scalable microservices 
                architecture. Implemented automated deployment pipelines, real-time inventory 
                management, and AI-powered product recommendations.
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">1M+</div>
                  <div className="text-sm text-gray-600">Daily Orders</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">99.9%</div>
                  <div className="text-sm text-gray-600">Uptime</div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Microservices</span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Docker</span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Kubernetes</span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Redis</span>
              </div>
              
              <Link 
                href="#" 
                className="text-green-600 hover:text-green-800 font-semibold"
              >
                Read Full Case Study →
              </Link>
            </div>
          </div>

          {/* Regular Case Studies Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Case Study Card 1 */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold mr-3">
                  H
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Healthcare Platform</h3>
                  <p className="text-sm text-gray-600">Telemedicine Solution</p>
                </div>
              </div>
              
              <h4 className="text-lg font-bold text-gray-900 mb-3">
                HIPAA-Compliant Telemedicine Platform
              </h4>
              
              <p className="text-gray-600 mb-4 text-sm">
                Built secure video consultation platform with electronic health records 
                integration and automated appointment scheduling.
              </p>
              
              <div className="flex justify-between items-center mb-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-purple-600">85%</div>
                  <div className="text-xs text-gray-600">Patient Satisfaction</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-purple-600">10K+</div>
                  <div className="text-xs text-gray-600">Consultations</div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1 mb-4">
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">Next.js</span>
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">WebRTC</span>
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">HIPAA</span>
              </div>
              
              <Link 
                href="#" 
                className="text-purple-600 hover:text-purple-800 font-medium text-sm"
              >
                View Details →
              </Link>
            </div>

            {/* Case Study Card 2 */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center text-white font-bold mr-3">
                  M
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Manufacturing</h3>
                  <p className="text-sm text-gray-600">IoT Dashboard</p>
                </div>
              </div>
              
              <h4 className="text-lg font-bold text-gray-900 mb-3">
                Real-time Manufacturing Analytics
              </h4>
              
              <p className="text-gray-600 mb-4 text-sm">
                IoT-enabled dashboard for monitoring production lines with predictive 
                maintenance alerts and efficiency optimization.
              </p>
              
              <div className="flex justify-between items-center mb-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-orange-600">30%</div>
                  <div className="text-xs text-gray-600">Efficiency Gain</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-orange-600">500+</div>
                  <div className="text-xs text-gray-600">Sensors</div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1 mb-4">
                <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">IoT</span>
                <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">Python</span>
                <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">InfluxDB</span>
              </div>
              
              <Link 
                href="#" 
                className="text-orange-600 hover:text-orange-800 font-medium text-sm"
              >
                View Details →
              </Link>
            </div>

            {/* Case Study Card 3 */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-cyan-600 rounded-lg flex items-center justify-center text-white font-bold mr-3">
                  S
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">SaaS Startup</h3>
                  <p className="text-sm text-gray-600">Project Management</p>
                </div>
              </div>
              
              <h4 className="text-lg font-bold text-gray-900 mb-3">
                AI-Powered Project Management Tool
              </h4>
              
              <p className="text-gray-600 mb-4 text-sm">
                Intelligent project planning with automated task allocation, 
                timeline optimization, and team collaboration features.
              </p>
              
              <div className="flex justify-between items-center mb-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-cyan-600">200%</div>
                  <div className="text-xs text-gray-600">Productivity</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-cyan-600">25K</div>
                  <div className="text-xs text-gray-600">Projects</div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1 mb-4">
                <span className="px-2 py-1 bg-cyan-100 text-cyan-800 rounded text-xs">React</span>
                <span className="px-2 py-1 bg-cyan-100 text-cyan-800 rounded text-xs">AI</span>
                <span className="px-2 py-1 bg-cyan-100 text-cyan-800 rounded text-xs">GraphQL</span>
              </div>
              
              <Link 
                href="#" 
                className="text-cyan-600 hover:text-cyan-800 font-medium text-sm"
              >
                View Details →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-indigo-600 mb-2">150+</div>
              <div className="text-gray-600">Projects Delivered</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-indigo-600 mb-2">95%</div>
              <div className="text-gray-600">Client Satisfaction</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-indigo-600 mb-2">20+</div>
              <div className="text-gray-600">Industries Served</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-indigo-600 mb-2">24/7</div>
              <div className="text-gray-600">Support Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Create Your Success Story?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-3xl mx-auto">
            Join our growing list of satisfied clients. Let's discuss how we can 
            help transform your business with innovative software solutions.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-indigo-600 bg-white hover:bg-gray-50 rounded-lg transition-colors shadow-lg"
            >
              Start Your Project
            </Link>
            
            <Link
              href="/case-studies"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white hover:bg-white hover:text-indigo-600 rounded-lg transition-colors"
            >
              View All Case Studies
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}