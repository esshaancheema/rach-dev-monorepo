import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Digital Transformation Consulting | Enterprise Digital Strategy | Zoptal',
  description: 'Digital transformation consulting services. Guide your organization through digital modernization with strategic planning, technology implementation, and change management expertise.',
  keywords: [
    'digital transformation consulting',
    'digital modernization',
    'enterprise digital strategy',
    'business process digitization',
    'technology transformation',
    'digital transformation services'
  ]
};

export default function DigitalTransformationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-amber-900 via-orange-900 to-red-900 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Digital Transformation That Drives Real Business Value
            </h1>
            
            <p className="text-xl text-amber-100 mb-8 leading-relaxed">
              Navigate the complex journey of digital transformation with expert guidance. 
              From strategy development to implementation, we help organizations modernize 
              operations, enhance customer experiences, and achieve sustainable growth.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-amber-900 bg-white hover:bg-gray-50 rounded-lg transition-colors shadow-xl"
              >
                Start Your Transformation
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Transformation Benefits */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Why Digital Transformation Matters
            </h2>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 mb-8">
                Digital transformation is not just about technology - it's about reimagining 
                how your business operates, delivers value to customers, and competes in the digital age.
              </p>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Operational Efficiency</h3>
                  <p className="text-gray-600">
                    Streamline processes and eliminate inefficiencies through automation and optimization
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Customer Experience</h3>
                  <p className="text-gray-600">
                    Deliver seamless, personalized experiences across all customer touchpoints
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Competitive Advantage</h3>
                  <p className="text-gray-600">
                    Stay ahead of competitors with innovative digital capabilities and agility
                  </p>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Our Transformation Framework
              </h3>
              
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="bg-amber-50 rounded-xl p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-3">Strategic Assessment</h4>
                  <p className="text-gray-700 mb-4">
                    Comprehensive evaluation of current state and digital maturity
                  </p>
                  <ul className="text-gray-600 space-y-2">
                    <li>• Digital maturity assessment</li>
                    <li>• Technology landscape analysis</li>
                    <li>• Process optimization opportunities</li>
                    <li>• Competitive positioning review</li>
                  </ul>
                </div>
                
                <div className="bg-amber-50 rounded-xl p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-3">Roadmap Development</h4>
                  <p className="text-gray-700 mb-4">
                    Create detailed transformation roadmap with clear milestones
                  </p>
                  <ul className="text-gray-600 space-y-2">
                    <li>• Vision and strategy alignment</li>
                    <li>• Priority initiative identification</li>
                    <li>• Resource and budget planning</li>
                    <li>• Risk assessment and mitigation</li>
                  </ul>
                </div>
                
                <div className="bg-amber-50 rounded-xl p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-3">Technology Implementation</h4>
                  <p className="text-gray-700 mb-4">
                    Execute technology solutions with minimal business disruption
                  </p>
                  <ul className="text-gray-600 space-y-2">
                    <li>• Cloud migration strategies</li>
                    <li>• System integration and APIs</li>
                    <li>• Data modernization</li>
                    <li>• Security and compliance</li>
                  </ul>
                </div>
                
                <div className="bg-amber-50 rounded-xl p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-3">Change Management</h4>
                  <p className="text-gray-700 mb-4">
                    Ensure successful adoption through comprehensive change management
                  </p>
                  <ul className="text-gray-600 space-y-2">
                    <li>• Stakeholder engagement</li>
                    <li>• Training and skill development</li>
                    <li>• Communication strategies</li>
                    <li>• Performance measurement</li>
                  </ul>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Transformation Pillars
              </h3>
              
              <div className="space-y-6 mb-8">
                <div className="border-l-4 border-amber-500 pl-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Customer-Centric Digital Experiences</h4>
                  <p className="text-gray-700 mb-2">
                    Reimagine customer interactions with digital-first experiences
                  </p>
                  <ul className="text-gray-600 space-y-1 text-sm">
                    <li>• Omnichannel customer journeys</li>
                    <li>• Personalization and AI-driven insights</li>
                    <li>• Self-service capabilities</li>
                  </ul>
                </div>
                
                <div className="border-l-4 border-amber-500 pl-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Data-Driven Decision Making</h4>
                  <p className="text-gray-700 mb-2">
                    Transform raw data into actionable business insights
                  </p>
                  <ul className="text-gray-600 space-y-1 text-sm">
                    <li>• Data warehouse modernization</li>
                    <li>• Analytics and BI platforms</li>
                    <li>• Real-time dashboard creation</li>
                  </ul>
                </div>
                
                <div className="border-l-4 border-amber-500 pl-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Process Automation</h4>
                  <p className="text-gray-700 mb-2">
                    Automate repetitive tasks and optimize business processes
                  </p>
                  <ul className="text-gray-600 space-y-1 text-sm">
                    <li>• Robotic Process Automation (RPA)</li>
                    <li>• Workflow optimization</li>
                    <li>• AI-powered automation</li>
                  </ul>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Industry-Specific Transformations
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="border-l-4 border-amber-500 pl-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Financial Services</h4>
                  <p className="text-gray-700 mb-2">
                    Digital banking, fintech integration, and regulatory compliance
                  </p>
                  <p className="text-sm text-amber-600">
                    Open banking APIs, mobile payments, and AI-powered fraud detection
                  </p>
                </div>
                
                <div className="border-l-4 border-amber-500 pl-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Healthcare</h4>
                  <p className="text-gray-700 mb-2">
                    Telemedicine, patient portals, and electronic health records
                  </p>
                  <p className="text-sm text-amber-600">
                    HIPAA-compliant cloud solutions and interoperability standards
                  </p>
                </div>
                
                <div className="border-l-4 border-amber-500 pl-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Manufacturing</h4>
                  <p className="text-gray-700 mb-2">
                    Industry 4.0, IoT integration, and predictive maintenance
                  </p>
                  <p className="text-sm text-amber-600">
                    Smart factory solutions and supply chain digitization
                  </p>
                </div>
                
                <div className="border-l-4 border-amber-500 pl-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Retail</h4>
                  <p className="text-gray-700 mb-2">
                    Omnichannel commerce, inventory optimization, and customer analytics
                  </p>
                  <p className="text-sm text-amber-600">
                    Unified commerce platforms and personalization engines
                  </p>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Success Metrics
              </h3>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white border rounded-xl p-4 text-center">
                  <h4 className="font-bold text-gray-900 mb-2">ROI Improvement</h4>
                  <p className="text-sm text-gray-600">Measure financial returns</p>
                </div>
                
                <div className="bg-white border rounded-xl p-4 text-center">
                  <h4 className="font-bold text-gray-900 mb-2">Process Efficiency</h4>
                  <p className="text-sm text-gray-600">Time and cost savings</p>
                </div>
                
                <div className="bg-white border rounded-xl p-4 text-center">
                  <h4 className="font-bold text-gray-900 mb-2">Customer Satisfaction</h4>
                  <p className="text-sm text-gray-600">NPS and CSAT scores</p>
                </div>
                
                <div className="bg-white border rounded-xl p-4 text-center">
                  <h4 className="font-bold text-gray-900 mb-2">Employee Engagement</h4>
                  <p className="text-sm text-gray-600">Adoption and productivity</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-amber-600 to-orange-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Organization?
          </h2>
          <p className="text-xl text-amber-100 mb-8 max-w-3xl mx-auto">
            Start your digital transformation journey with a comprehensive strategy that 
            aligns technology investments with business outcomes. Let's build the future together.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-amber-600 bg-white hover:bg-gray-50 rounded-lg transition-colors shadow-lg"
            >
              Start Your Transformation
            </Link>
            
            <Link
              href="/services/enterprise-solutions"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white hover:bg-white hover:text-amber-600 rounded-lg transition-colors"
            >
              View Enterprise Solutions
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}