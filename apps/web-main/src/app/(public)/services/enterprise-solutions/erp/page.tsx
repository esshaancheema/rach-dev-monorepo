import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'ERP Systems Development | Custom Enterprise Resource Planning | Zoptal',
  description: 'Custom ERP systems development services. Build comprehensive enterprise resource planning solutions with integrated modules for finance, HR, inventory, and operations management.',
  keywords: [
    'ERP systems development',
    'enterprise resource planning',
    'custom ERP solutions',
    'ERP software development',
    'business process automation',
    'integrated business systems'
  ]
};

export default function ERPSystemsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Custom ERP Systems That Transform Business Operations
            </h1>
            
            <p className="text-xl text-slate-100 mb-8 leading-relaxed">
              Build comprehensive Enterprise Resource Planning systems that integrate all 
              your business processes. From finance and HR to inventory and operations, 
              streamline your entire organization with custom ERP solutions.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-slate-900 bg-white hover:bg-gray-50 rounded-lg transition-colors shadow-xl"
              >
                Start Your ERP Project
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ERP Benefits */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Why Custom ERP Systems?
            </h2>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 mb-8">
                Off-the-shelf ERP solutions often require businesses to adapt their processes. 
                Custom ERP systems are built around your unique workflows and requirements.
              </p>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Process Integration</h3>
                  <p className="text-gray-600">
                    Seamlessly integrate all business processes into one unified system
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Real-time Visibility</h3>
                  <p className="text-gray-600">
                    Get real-time insights into all aspects of your business operations
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Cost Efficiency</h3>
                  <p className="text-gray-600">
                    Reduce operational costs through automation and optimized workflows
                  </p>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                ERP Modules We Develop
              </h3>
              
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="bg-blue-50 rounded-xl p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-3">Financial Management</h4>
                  <p className="text-gray-700 mb-4">
                    Complete financial operations including accounting, budgeting, and reporting
                  </p>
                  <ul className="text-gray-600 space-y-2">
                    <li>• General ledger and chart of accounts</li>
                    <li>• Accounts payable and receivable</li>
                    <li>• Financial reporting and analytics</li>
                    <li>• Budget planning and control</li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 rounded-xl p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-3">Human Resources</h4>
                  <p className="text-gray-700 mb-4">
                    Comprehensive HR management from recruitment to retirement
                  </p>
                  <ul className="text-gray-600 space-y-2">
                    <li>• Employee information management</li>
                    <li>• Payroll processing and benefits</li>
                    <li>• Performance management</li>
                    <li>• Recruitment and onboarding</li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 rounded-xl p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-3">Inventory Management</h4>
                  <p className="text-gray-700 mb-4">
                    Real-time inventory tracking and warehouse management
                  </p>
                  <ul className="text-gray-600 space-y-2">
                    <li>• Stock level monitoring</li>
                    <li>• Automated reorder points</li>
                    <li>• Warehouse management</li>
                    <li>• Supplier relationship management</li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 rounded-xl p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-3">Customer Relationship</h4>
                  <p className="text-gray-700 mb-4">
                    Integrated CRM for sales, marketing, and customer service
                  </p>
                  <ul className="text-gray-600 space-y-2">
                    <li>• Customer data management</li>
                    <li>• Sales pipeline tracking</li>
                    <li>• Marketing automation</li>
                    <li>• Customer service ticketing</li>
                  </ul>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Implementation Process
              </h3>
              
              <div className="space-y-6 mb-8">
                <div className="border-l-4 border-blue-500 pl-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">1. Business Analysis</h4>
                  <p className="text-gray-700 mb-2">
                    Comprehensive analysis of current processes and future requirements
                  </p>
                  <ul className="text-gray-600 space-y-1 text-sm">
                    <li>• Process mapping and documentation</li>
                    <li>• Requirements gathering</li>
                    <li>• Gap analysis</li>
                  </ul>
                </div>
                
                <div className="border-l-4 border-blue-500 pl-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">2. System Design</h4>
                  <p className="text-gray-700 mb-2">
                    Architecture design and module specification
                  </p>
                  <ul className="text-gray-600 space-y-1 text-sm">
                    <li>• System architecture design</li>
                    <li>• Database schema design</li>
                    <li>• Integration planning</li>
                  </ul>
                </div>
                
                <div className="border-l-4 border-blue-500 pl-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">3. Development & Testing</h4>
                  <p className="text-gray-700 mb-2">
                    Agile development with continuous testing and validation
                  </p>
                  <ul className="text-gray-600 space-y-1 text-sm">
                    <li>• Module development</li>
                    <li>• Integration testing</li>
                    <li>• User acceptance testing</li>
                  </ul>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Industry Solutions
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="border-l-4 border-blue-500 pl-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Manufacturing ERP</h4>
                  <p className="text-gray-700 mb-2">
                    Production planning, quality control, and supply chain management
                  </p>
                  <p className="text-sm text-blue-600">
                    MRP, shop floor control, quality management, and maintenance scheduling
                  </p>
                </div>
                
                <div className="border-l-4 border-blue-500 pl-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Retail ERP</h4>
                  <p className="text-gray-700 mb-2">
                    Multi-channel retail operations with POS and e-commerce integration
                  </p>
                  <p className="text-sm text-blue-600">
                    Inventory optimization, demand forecasting, and customer loyalty programs
                  </p>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Technology Stack
              </h3>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white border rounded-xl p-4 text-center">
                  <h4 className="font-bold text-gray-900 mb-2">.NET Core</h4>
                  <p className="text-sm text-gray-600">Enterprise application framework</p>
                </div>
                
                <div className="bg-white border rounded-xl p-4 text-center">
                  <h4 className="font-bold text-gray-900 mb-2">Java Spring</h4>
                  <p className="text-sm text-gray-600">Robust enterprise platform</p>
                </div>
                
                <div className="bg-white border rounded-xl p-4 text-center">
                  <h4 className="font-bold text-gray-900 mb-2">SQL Server</h4>
                  <p className="text-sm text-gray-600">Enterprise database system</p>
                </div>
                
                <div className="bg-white border rounded-xl p-4 text-center">
                  <h4 className="font-bold text-gray-900 mb-2">React</h4>
                  <p className="text-sm text-gray-600">Modern user interfaces</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-slate-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Business Operations?
          </h2>
          <p className="text-xl text-slate-100 mb-8 max-w-3xl mx-auto">
            Build a custom ERP system that grows with your business and adapts to your 
            unique processes. Streamline operations and improve efficiency across your organization.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-slate-600 bg-white hover:bg-gray-50 rounded-lg transition-colors shadow-lg"
            >
              Start Your ERP Project
            </Link>
            
            <Link
              href="/services/enterprise-solutions"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white hover:bg-white hover:text-slate-600 rounded-lg transition-colors"
            >
              View Enterprise Solutions
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}