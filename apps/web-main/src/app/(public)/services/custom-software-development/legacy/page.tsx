import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Legacy System Modernization | Transform Outdated Software | Zoptal',
  description: 'Transform outdated legacy systems with modern technologies. Our expert team modernizes mainframe applications, databases, and enterprise systems while preserving critical business logic.',
  keywords: [
    'legacy system modernization',
    'legacy application modernization',
    'mainframe modernization',
    'system migration services'
  ]
};

export default function LegacyModernizationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Transform Your Legacy Systems Into Modern Solutions
            </h1>
            
            <p className="text-xl text-indigo-100 mb-8 leading-relaxed">
              Don't let outdated technology hold your business back. We modernize legacy 
              mainframe systems, databases, and applications with zero business disruption 
              and maximum ROI.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-indigo-900 bg-white hover:bg-gray-50 rounded-lg transition-colors shadow-xl"
              >
                Get Free Assessment
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Legacy System Modernization Services
            </h2>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 mb-6">
                Transform your outdated legacy systems into modern, scalable solutions that drive 
                business growth. Our expert team specializes in modernizing mainframe applications, 
                legacy databases, and enterprise systems while preserving critical business logic.
              </p>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Modernization Approaches
              </h3>
              
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-3">Lift and Shift</h4>
                  <p className="text-gray-700 mb-4">
                    Move existing systems to cloud infrastructure with minimal changes.
                  </p>
                  <ul className="text-gray-600 space-y-2">
                    <li>• Quick migration process</li>
                    <li>• Lower risk approach</li>
                    <li>• Immediate cloud benefits</li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-3">Re-architect</h4>
                  <p className="text-gray-700 mb-4">
                    Complete system redesign with modern architecture patterns.
                  </p>
                  <ul className="text-gray-600 space-y-2">
                    <li>• Maximum flexibility</li>
                    <li>• Future-proof design</li>
                    <li>• Enhanced capabilities</li>
                  </ul>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Technologies We Modernize
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Legacy Systems:</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">COBOL</span>
                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">RPG</span>
                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">VB6</span>
                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">PowerBuilder</span>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Modern Solutions:</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">Java</span>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">.NET</span>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">React</span>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">Cloud Native</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Modernize Your Legacy Systems?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-3xl mx-auto">
            Get a free assessment of your legacy systems and discover how modernization 
            can transform your business operations and reduce costs.
          </p>
          
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-indigo-600 bg-white hover:bg-gray-50 rounded-lg transition-colors shadow-lg"
          >
            Get Free Assessment
          </Link>
        </div>
      </section>
    </div>
  );
}