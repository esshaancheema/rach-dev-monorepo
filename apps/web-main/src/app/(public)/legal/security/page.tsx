import { Metadata } from 'next';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export const metadata: Metadata = {
  title: 'Security - Data Protection & Infrastructure Security | Zoptal',
  description: 'Learn about Zoptal\'s comprehensive security measures, data protection policies, infrastructure security, and compliance with industry standards.',
  keywords: [
    'security',
    'data protection',
    'infrastructure security',
    'cybersecurity',
    'data encryption',
    'security compliance',
    'ISO 27001',
    'SOC 2',
    'security audits',
  ],
  alternates: {
    canonical: 'https://zoptal.com/legal/security',
  },
};

const securityFeatures = [
  {
    title: 'Data Encryption',
    icon: '🔐',
    description: 'End-to-end encryption for all data in transit and at rest',
    details: [
      'AES-256 encryption for data at rest',
      'TLS 1.3 for data in transit',
      'Zero-knowledge architecture',
      'Client-side encryption options',
    ],
  },
  {
    title: 'Access Controls',
    icon: '🔑',
    description: 'Multi-layered access control and authentication systems',
    details: [
      'Multi-factor authentication (MFA)',
      'Role-based access control (RBAC)',
      'Single sign-on (SSO) integration',
      'Regular access reviews',
    ],
  },
  {
    title: 'Infrastructure Security',
    icon: '🛡️',
    description: 'Enterprise-grade infrastructure with advanced security controls',
    details: [
      'Cloud-native security architecture',
      'DDoS protection and WAF',
      'Network segmentation',
      'Intrusion detection systems',
    ],
  },
  {
    title: 'Monitoring & Response',
    icon: '📊',
    description: '24/7 security monitoring and incident response',
    details: [
      'Real-time threat detection',
      'Security incident response team',
      'Automated threat mitigation',
      'Continuous security monitoring',
    ],
  },
];

const certifications = [
  {
    name: 'SOC 2 Type II',
    description: 'Audited for security, availability, and confidentiality',
    status: 'Active',
    date: '2024',
  },
  {
    name: 'ISO 27001',
    description: 'Information security management system certification',
    status: 'In Progress',
    date: '2024',
  },
  {
    name: 'GDPR Compliant',
    description: 'Full compliance with EU data protection regulations',
    status: 'Active',
    date: 'Ongoing',
  },
  {
    name: 'CCPA Compliant',
    description: 'California Consumer Privacy Act compliance',
    status: 'Active',
    date: 'Ongoing',
  },
];

export default function SecurityPage() {
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
              <span className="text-gray-900">Security</span>
            </nav>
            
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xl">🛡️</span>
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-4">Security</h1>
                <p className="text-lg text-gray-600">
                  Your trust is our foundation. Learn how we protect your data and maintain the highest security standards.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Security Overview */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-6">Enterprise-Grade Security</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                We implement comprehensive security measures across all layers of our infrastructure to protect your data, 
                code, and applications. Security isn't just a feature—it's built into everything we do.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {securityFeatures.map((feature) => (
                <Card key={feature.title} className="p-6">
                  <div className="flex items-start gap-4">
                    <span className="text-3xl">{feature.icon}</span>
                    <div>
                      <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                      <p className="text-gray-600 mb-4">{feature.description}</p>
                      <ul className="space-y-2">
                        {feature.details.map((detail, index) => (
                          <li key={index} className="flex items-center text-sm text-gray-700">
                            <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Certifications & Compliance */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-6">Certifications & Compliance</h2>
              <p className="text-lg text-gray-600">
                We maintain industry-leading certifications and comply with global data protection regulations.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {certifications.map((cert) => (
                <Card key={cert.name} className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">{cert.name}</h3>
                      <p className="text-gray-600 mb-3">{cert.description}</p>
                      <p className="text-sm text-gray-500">Last updated: {cert.date}</p>
                    </div>
                    <Badge 
                      variant={cert.status === 'Active' ? 'default' : 'outline'}
                      className={cert.status === 'Active' ? 'bg-green-100 text-green-700' : ''}
                    >
                      {cert.status}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Security Practices */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Security Practices</h2>
            
            <div className="prose prose-lg max-w-none">
              <h3 className="text-xl font-semibold mb-4">Vulnerability Management</h3>
              <p className="mb-6">
                We maintain a comprehensive vulnerability management program that includes:
              </p>
              <ul className="list-disc pl-6 mb-8 space-y-2">
                <li>Regular penetration testing by third-party security firms</li>
                <li>Automated vulnerability scanning and assessment</li>
                <li>Bug bounty program with responsible disclosure</li>
                <li>Continuous security code review and static analysis</li>
                <li>Regular security awareness training for all employees</li>
              </ul>
              
              <h3 className="text-xl font-semibold mb-4">Data Protection</h3>
              <p className="mb-6">
                Your data is protected through multiple security layers:
              </p>
              <ul className="list-disc pl-6 mb-8 space-y-2">
                <li>Data classification and handling procedures</li>
                <li>Automated data backup and recovery systems</li>
                <li>Data residency controls and geo-location restrictions</li>
                <li>Secure data deletion and retention policies</li>
                <li>Privacy by design principles in all systems</li>
              </ul>
              
              <h3 className="text-xl font-semibold mb-4">Incident Response</h3>
              <p className="mb-6">
                Our security incident response process ensures rapid detection and mitigation:
              </p>
              <ul className="list-disc pl-6 mb-8 space-y-2">
                <li>24/7 security operations center (SOC) monitoring</li>
                <li>Automated incident detection and alerting</li>
                <li>Defined incident response procedures and escalation paths</li>
                <li>Post-incident analysis and improvement processes</li>
                <li>Customer notification procedures for relevant incidents</li>
              </ul>
              
              <h3 className="text-xl font-semibold mb-4">Employee Security</h3>
              <p className="mb-6">
                Our team follows strict security protocols:
              </p>
              <ul className="list-disc pl-6 mb-8 space-y-2">
                <li>Background checks for all employees</li>
                <li>Mandatory security training and certification</li>
                <li>Least privilege access principles</li>
                <li>Regular access reviews and deprovisioning</li>
                <li>Secure development lifecycle training</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      
      {/* Security Contact */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Security Questions?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Our security team is here to address your questions and concerns.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 bg-white/10 backdrop-blur border-white/20">
                <h3 className="font-semibold mb-3">Security Inquiries</h3>
                <p className="text-blue-100 mb-4">General security questions and information</p>
                <a 
                  href="mailto:security@zoptal.com"
                  className="text-white hover:text-blue-200 font-medium"
                >
                  security@zoptal.com
                </a>
              </Card>
              
              <Card className="p-6 bg-white/10 backdrop-blur border-white/20">
                <h3 className="font-semibold mb-3">Vulnerability Reports</h3>
                <p className="text-blue-100 mb-4">Report security vulnerabilities responsibly</p>
                <a 
                  href="mailto:security-reports@zoptal.com"
                  className="text-white hover:text-blue-200 font-medium"
                >
                  security-reports@zoptal.com
                </a>
              </Card>
            </div>
            
            <div className="mt-8 p-4 bg-white/10 rounded-lg">
              <p className="text-sm text-blue-100">
                For urgent security matters, please include "URGENT" in your subject line. 
                We typically respond to security inquiries within 24 hours.
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
              <Link href="/legal/privacy" className="block p-4 border rounded-lg hover:shadow-md transition-shadow">
                <h3 className="font-semibold mb-2">Privacy Policy</h3>
                <p className="text-sm text-gray-600">How we collect and protect your data</p>
              </Link>
              <Link href="/legal/compliance" className="block p-4 border rounded-lg hover:shadow-md transition-shadow">
                <h3 className="font-semibold mb-2">Compliance</h3>
                <p className="text-sm text-gray-600">Industry standards and certifications</p>
              </Link>
              <Link href="/legal/terms" className="block p-4 border rounded-lg hover:shadow-md transition-shadow">
                <h3 className="font-semibold mb-2">Terms of Service</h3>
                <p className="text-sm text-gray-600">Platform usage terms and conditions</p>
              </Link>
              <Link href="/support" className="block p-4 border rounded-lg hover:shadow-md transition-shadow">
                <h3 className="font-semibold mb-2">Support</h3>
                <p className="text-sm text-gray-600">Get help and contact our team</p>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}