import { Metadata } from 'next';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export const metadata: Metadata = {
  title: 'Compliance - Standards & Certifications | Zoptal',
  description: 'Learn about Zoptal\'s compliance with industry standards including SOC 2, ISO 27001, GDPR, HIPAA, and other regulatory frameworks.',
  keywords: [
    'compliance',
    'SOC 2',
    'ISO 27001',
    'GDPR',
    'HIPAA',
    'regulatory compliance',
    'data protection',
    'industry standards',
    'certifications',
    'audit reports',
  ],
  alternates: {
    canonical: 'https://zoptal.com/legal/compliance',
  },
};

const complianceFrameworks = [
  {
    name: 'SOC 2 Type II',
    status: 'Certified',
    description: 'Service Organization Control 2 certification for security, availability, processing integrity, confidentiality, and privacy',
    icon: '🛡️',
    details: [
      'Annual independent audits',
      'Continuous monitoring',
      'Security controls framework',
      'Customer data protection',
    ],
    reportAvailable: true,
    lastAudit: 'December 2023',
  },
  {
    name: 'ISO 27001',
    status: 'In Progress',
    description: 'International standard for information security management systems',
    icon: '🔒',
    details: [
      'Risk management framework',
      'Information security controls',
      'Continuous improvement process',
      'Management system approach',
    ],
    reportAvailable: false,
    expectedDate: 'Q2 2024',
  },
  {
    name: 'GDPR',
    status: 'Compliant',
    description: 'General Data Protection Regulation compliance for EU data protection',
    icon: '🇪🇺',
    details: [
      'Data subject rights implementation',
      'Privacy by design principles',
      'Data processing agreements',
      'Breach notification procedures',
    ],
    reportAvailable: false,
    ongoing: true,
  },
  {
    name: 'CCPA',
    status: 'Compliant',
    description: 'California Consumer Privacy Act compliance for data privacy rights',
    icon: '🇺🇸',
    details: [
      'Consumer rights implementation',
      'Data transparency measures',
      'Opt-out mechanisms',
      'Third-party data sharing controls',
    ],
    reportAvailable: false,
    ongoing: true,
  },
];

const industryStandards = [
  {
    name: 'OWASP Top 10',
    description: 'Web application security standards',
    status: 'Implemented',
  },
  {
    name: 'NIST Cybersecurity Framework',
    description: 'Cybersecurity risk management framework',
    status: 'Implemented',
  },
  {
    name: 'CIS Controls',
    description: 'Center for Internet Security critical controls',
    status: 'Implemented',
  },
  {
    name: 'Cloud Security Alliance',
    description: 'Cloud computing security best practices',
    status: 'Implemented',
  },
];

const auditProcess = [
  {
    step: '1',
    title: 'Planning & Scoping',
    description: 'Define audit scope, objectives, and timeline with independent auditors',
  },
  {
    step: '2',
    title: 'Control Assessment',
    description: 'Evaluate design and implementation of security and operational controls',
  },
  {
    step: '3',
    title: 'Testing & Validation',
    description: 'Test control effectiveness over a specified period (typically 12 months)',
  },
  {
    step: '4',
    title: 'Reporting & Certification',
    description: 'Issue audit report and maintain continuous monitoring for compliance',
  },
];

export default function CompliancePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white border-b py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <nav className="flex items-center gap-2 text-sm text-gray-600 mb-8">
              <Link href="/" className="hover:text-gray-900">
                Home
              </Link>
              <span>/</span>
              <Link href="/legal" className="hover:text-gray-900">
                Legal
              </Link>
              <span>/</span>
              <span className="text-gray-900">Compliance</span>
            </nav>
            
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xl">📋</span>
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-4">Compliance</h1>
                <p className="text-lg text-gray-600">
                  We maintain the highest standards of compliance with industry regulations and security frameworks 
                  to protect your data and ensure platform reliability.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Compliance Frameworks */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-6">Compliance Frameworks</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Our compliance program ensures adherence to the most stringent industry standards 
                and regulatory requirements across multiple jurisdictions.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {complianceFrameworks.map((framework) => (
                <Card key={framework.name} className="p-6">
                  <div className="flex items-start gap-4">
                    <span className="text-3xl">{framework.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xl font-semibold">{framework.name}</h3>
                        <Badge 
                          variant={framework.status === 'Certified' || framework.status === 'Compliant' ? 'default' : 'outline'}
                          className={
                            framework.status === 'Certified' || framework.status === 'Compliant' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          }
                        >
                          {framework.status}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 mb-4">{framework.description}</p>
                      
                      <ul className="space-y-2 mb-4">
                        {framework.details.map((detail, index) => (
                          <li key={index} className="flex items-center text-sm text-gray-700">
                            <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            {detail}
                          </li>
                        ))}
                      </ul>
                      
                      {framework.reportAvailable && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Last audit: {framework.lastAudit}</span>
                          <Link href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                            Request Report →
                          </Link>
                        </div>
                      )}
                      
                      {framework.expectedDate && (
                        <div className="text-sm text-gray-500">
                          Expected completion: {framework.expectedDate}
                        </div>
                      )}
                      
                      {framework.ongoing && (
                        <div className="text-sm text-green-600 font-medium">
                          Ongoing compliance monitoring
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Industry Standards */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-6">Industry Standards</h2>
              <p className="text-lg text-gray-600">
                We implement and maintain compliance with leading industry security standards and best practices.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {industryStandards.map((standard) => (
                <Card key={standard.name} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold mb-2">{standard.name}</h3>
                      <p className="text-gray-600 text-sm">{standard.description}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-700">
                      {standard.status}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Audit Process */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-6">Our Audit Process</h2>
              <p className="text-lg text-gray-600">
                We work with independent third-party auditors to ensure objective assessment of our compliance posture.
              </p>
            </div>
            
            <div className="space-y-8">
              {auditProcess.map((step, index) => (
                <div key={step.step} className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                      {step.step}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                  {index < auditProcess.length - 1 && (
                    <div className="absolute left-6 mt-12 w-0.5 h-8 bg-gray-200"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Data Governance */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Data Governance</h2>
            
            <div className="prose prose-lg max-w-none">
              <h3 className="text-xl font-semibold mb-4">Data Classification</h3>
              <p className="mb-6">
                We maintain a comprehensive data classification system that categorizes all data based on 
                sensitivity levels and applies appropriate protection measures:
              </p>
              <ul className="list-disc pl-6 mb-8 space-y-2">
                <li><strong>Public:</strong> Information that can be freely shared without restriction</li>
                <li><strong>Internal:</strong> Information intended for use within Zoptal</li>
                <li><strong>Confidential:</strong> Sensitive information requiring special handling</li>
                <li><strong>Restricted:</strong> Highly sensitive information with strict access controls</li>
              </ul>
              
              <h3 className="text-xl font-semibold mb-4">Data Processing Principles</h3>
              <ul className="list-disc pl-6 mb-8 space-y-2">
                <li>Lawfulness, fairness, and transparency in all data processing activities</li>
                <li>Purpose limitation - data collected only for specified, explicit purposes</li>
                <li>Data minimization - collecting only what is necessary</li>
                <li>Accuracy and completeness of personal data</li>
                <li>Storage limitation with defined retention periods</li>
                <li>Security and confidentiality through technical and organizational measures</li>
                <li>Accountability and demonstrable compliance</li>
              </ul>
              
              <h3 className="text-xl font-semibold mb-4">Third-Party Risk Management</h3>
              <p className="mb-6">
                All third-party vendors and partners undergo rigorous assessment:
              </p>
              <ul className="list-disc pl-6 mb-8 space-y-2">
                <li>Security questionnaires and compliance verification</li>
                <li>Contractual data protection requirements</li>
                <li>Regular compliance monitoring and reviews</li>
                <li>Incident notification and response requirements</li>
                <li>Data processing agreements where applicable</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      
      {/* Compliance Contact */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Compliance Inquiries</h2>
            <p className="text-xl text-blue-100 mb-8">
              Need compliance information for your procurement or audit process?
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 bg-white/10 backdrop-blur border-white/20">
                <h3 className="font-semibold mb-3">Compliance Team</h3>
                <p className="text-blue-100 mb-4">General compliance questions and documentation requests</p>
                <a 
                  href="mailto:compliance@zoptal.com"
                  className="text-white hover:text-blue-200 font-medium"
                >
                  compliance@zoptal.com
                </a>
              </Card>
              
              <Card className="p-6 bg-white/10 backdrop-blur border-white/20">
                <h3 className="font-semibold mb-3">Audit Reports</h3>
                <p className="text-blue-100 mb-4">Request SOC 2 reports and compliance certificates</p>
                <a 
                  href="mailto:audit-reports@zoptal.com"
                  className="text-white hover:text-blue-200 font-medium"
                >
                  audit-reports@zoptal.com
                </a>
              </Card>
            </div>
            
            <div className="mt-8 p-4 bg-white/10 rounded-lg">
              <p className="text-sm text-blue-100">
                We typically process compliance documentation requests within 2-3 business days. 
                SOC 2 reports require NDA execution prior to sharing.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Related Links */}
      <section className="py-16 bg-white border-t">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-8">Related Information</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/legal/security" className="block p-4 border rounded-lg hover:shadow-md transition-shadow">
                <h3 className="font-semibold mb-2">Security</h3>
                <p className="text-sm text-gray-600">Our security measures and practices</p>
              </Link>
              <Link href="/legal/privacy" className="block p-4 border rounded-lg hover:shadow-md transition-shadow">
                <h3 className="font-semibold mb-2">Privacy Policy</h3>
                <p className="text-sm text-gray-600">How we handle your personal data</p>
              </Link>
              <Link href="/legal/terms" className="block p-4 border rounded-lg hover:shadow-md transition-shadow">
                <h3 className="font-semibold mb-2">Terms of Service</h3>
                <p className="text-sm text-gray-600">Platform terms and conditions</p>
              </Link>
              <Link href="/legal/gdpr" className="block p-4 border rounded-lg hover:shadow-md transition-shadow">
                <h3 className="font-semibold mb-2">GDPR</h3>
                <p className="text-sm text-gray-600">European data protection compliance</p>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}