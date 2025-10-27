import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'CRM Solutions Development | Custom Customer Relationship Management | Zoptal',
  description: 'Custom CRM solutions development services. Build comprehensive customer relationship management systems with sales automation, marketing tools, and customer service integration.',
  keywords: [
    'CRM solutions development',
    'customer relationship management',
    'custom CRM systems',
    'CRM software development',
    'sales automation',
    'customer management systems'
  ]
};

export default function CRMSolutionsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-rose-900 via-pink-900 to-purple-900 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Custom CRM Solutions That Drive Customer Success
            </h1>
            
            <p className="text-xl text-rose-100 mb-8 leading-relaxed">
              Build comprehensive Customer Relationship Management systems that strengthen 
              customer relationships, streamline sales processes, and drive business growth. 
              From lead management to customer retention, we've got you covered.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-rose-900 bg-white hover:bg-gray-50 rounded-lg transition-colors shadow-xl"
              >
                Start Your CRM Project
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CRM Benefits */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Why Custom CRM Solutions?
            </h2>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 mb-8">
                Every business has unique customer interaction patterns and sales processes. 
                Custom CRM solutions adapt to your workflow, not the other way around.
              </p>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Improved Customer Retention</h3>
                  <p className="text-gray-600">
                    Better customer insights lead to stronger relationships and higher retention rates
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Sales Process Automation</h3>
                  <p className="text-gray-600">
                    Automate repetitive tasks and focus your team on building relationships
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Data-Driven Decisions</h3>
                  <p className="text-gray-600">
                    Make informed decisions with comprehensive analytics and reporting
                  </p>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                CRM Features We Develop
              </h3>
              
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="bg-rose-50 rounded-xl p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-3">Contact Management</h4>
                  <p className="text-gray-700 mb-4">
                    Centralized customer database with complete interaction history
                  </p>
                  <ul className="text-gray-600 space-y-2">
                    <li>• 360-degree customer profiles</li>
                    <li>• Interaction history tracking</li>
                    <li>• Contact segmentation</li>
                    <li>• Communication preferences</li>
                  </ul>
                </div>
                
                <div className="bg-rose-50 rounded-xl p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-3">Sales Pipeline</h4>
                  <p className="text-gray-700 mb-4">
                    Visual sales pipeline with opportunity tracking and forecasting
                  </p>
                  <ul className="text-gray-600 space-y-2">
                    <li>• Lead scoring and qualification</li>
                    <li>• Deal progression tracking</li>
                    <li>• Sales forecasting</li>
                    <li>• Performance analytics</li>
                  </ul>
                </div>
                
                <div className="bg-rose-50 rounded-xl p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-3">Marketing Automation</h4>
                  <p className="text-gray-700 mb-4">
                    Automated marketing campaigns and lead nurturing workflows
                  </p>
                  <ul className="text-gray-600 space-y-2">
                    <li>• Email marketing campaigns</li>
                    <li>• Lead nurturing sequences</li>
                    <li>• Campaign performance tracking</li>
                    <li>• A/B testing capabilities</li>
                  </ul>
                </div>
                
                <div className="bg-rose-50 rounded-xl p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-3">Customer Service</h4>
                  <p className="text-gray-700 mb-4">
                    Integrated support ticketing and case management system
                  </p>
                  <ul className="text-gray-600 space-y-2">
                    <li>• Support ticket management</li>
                    <li>• Knowledge base integration</li>
                    <li>• SLA tracking and reporting</li>
                    <li>• Customer satisfaction surveys</li>
                  </ul>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Implementation Approach
              </h3>
              
              <div className="space-y-6 mb-8">
                <div className="border-l-4 border-rose-500 pl-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">1. Process Discovery</h4>
                  <p className="text-gray-700 mb-2">
                    Understanding your current customer management processes and pain points
                  </p>
                  <ul className="text-gray-600 space-y-1 text-sm">
                    <li>• Sales process mapping</li>
                    <li>• Customer journey analysis</li>
                    <li>• Team workflow assessment</li>
                  </ul>
                </div>
                
                <div className="border-l-4 border-rose-500 pl-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">2. Custom Development</h4>
                  <p className="text-gray-700 mb-2">
                    Building CRM modules tailored to your specific requirements
                  </p>
                  <ul className="text-gray-600 space-y-1 text-sm">
                    <li>• Custom field configuration</li>
                    <li>• Workflow automation setup</li>
                    <li>• Integration development</li>
                  </ul>
                </div>
                
                <div className="border-l-4 border-rose-500 pl-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">3. Data Migration</h4>
                  <p className="text-gray-700 mb-2">
                    Seamless migration of existing customer data and historical records
                  </p>
                  <ul className="text-gray-600 space-y-1 text-sm">
                    <li>• Data cleansing and validation</li>
                    <li>• Migration testing</li>
                    <li>• Rollback procedures</li>
                  </ul>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Industry-Specific Solutions
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="border-l-4 border-rose-500 pl-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">B2B Sales CRM</h4>
                  <p className="text-gray-700 mb-2">
                    Complex sales cycles with multiple stakeholders and long buying processes
                  </p>
                  <p className="text-sm text-rose-600">
                    Account-based selling, proposal management, and stakeholder tracking
                  </p>
                </div>
                
                <div className="border-l-4 border-rose-500 pl-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Service-Based CRM</h4>
                  <p className="text-gray-700 mb-2">
                    Service delivery tracking with project management integration
                  </p>
                  <p className="text-sm text-rose-600">
                    Project timelines, resource allocation, and client communication portals
                  </p>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Integration Capabilities
              </h3>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white border rounded-xl p-4 text-center">
                  <h4 className="font-bold text-gray-900 mb-2">Email Systems</h4>
                  <p className="text-sm text-gray-600">Gmail, Outlook, Exchange</p>
                </div>
                
                <div className="bg-white border rounded-xl p-4 text-center">
                  <h4 className="font-bold text-gray-900 mb-2">Accounting</h4>
                  <p className="text-sm text-gray-600">QuickBooks, Xero, SAP</p>
                </div>
                
                <div className="bg-white border rounded-xl p-4 text-center">
                  <h4 className="font-bold text-gray-900 mb-2">Marketing Tools</h4>
                  <p className="text-sm text-gray-600">Mailchimp, HubSpot, Marketo</p>
                </div>
                
                <div className="bg-white border rounded-xl p-4 text-center">
                  <h4 className="font-bold text-gray-900 mb-2">Communication</h4>
                  <p className="text-sm text-gray-600">Slack, Teams, Zoom</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-rose-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Strengthen Your Customer Relationships?
          </h2>
          <p className="text-xl text-rose-100 mb-8 max-w-3xl mx-auto">
            Build a CRM system that grows with your business and adapts to your unique 
            customer management needs. Improve sales efficiency and customer satisfaction.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-rose-600 bg-white hover:bg-gray-50 rounded-lg transition-colors shadow-lg"
            >
              Start Your CRM Project
            </Link>
            
            <Link
              href="/services/enterprise-solutions"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white hover:bg-white hover:text-rose-600 rounded-lg transition-colors"
            >
              View Enterprise Solutions
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}