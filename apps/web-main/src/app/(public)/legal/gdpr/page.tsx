import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRightIcon, ShieldCheckIcon, LockClosedIcon, UserGroupIcon, DocumentCheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { MainLayout } from '@/components/layout';
import { SEOHead } from '@/components/seo';
import { generateBreadcrumbSchema, combineSchemas, ZOPTAL_ORGANIZATION_SCHEMA } from '@/lib/seo/schemas';

export const metadata: Metadata = {
  title: 'GDPR Compliance | Zoptal Legal',
  description: 'Learn about Zoptal\'s GDPR compliance measures, data protection practices, and your rights under the General Data Protection Regulation.',
  keywords: [
    'GDPR compliance',
    'data protection',
    'EU privacy',
    'data rights',
    'GDPR policy',
    'data processing',
    'privacy rights',
    'Zoptal GDPR'
  ]
};

export default function GDPRCompliancePage() {
  const breadcrumbSchema = generateBreadcrumbSchema({
    items: [
      { name: 'Home', url: 'https://zoptal.com' },
      { name: 'Legal', url: 'https://zoptal.com/legal' },
      { name: 'GDPR Compliance', url: 'https://zoptal.com/legal/gdpr' }
    ]
  });

  const structuredData = combineSchemas(
    ZOPTAL_ORGANIZATION_SCHEMA,
    breadcrumbSchema,
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "GDPR Compliance",
      "description": "Zoptal GDPR compliance information and data protection measures",
      "url": "https://zoptal.com/legal/gdpr",
      "inLanguage": "en",
      "datePublished": "2024-01-01",
      "dateModified": new Date().toISOString()
    }
  );

  return (
    <>
      <SEOHead
        title="GDPR Compliance | Zoptal Legal"
        description="Learn about Zoptal's GDPR compliance measures, data protection practices, and your rights under the General Data Protection Regulation."
        canonicalUrl="https://zoptal.com/legal/gdpr"
        keywords={metadata.keywords as string[]}
        type="website"
        structuredData={structuredData}
      />

      <MainLayout>
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <nav className="mb-8 text-sm">
              <ol className="flex items-center space-x-2 text-gray-500">
                <li><Link href="/" className="hover:text-primary-600">Home</Link></li>
                <li>/</li>
                <li><Link href="/legal" className="hover:text-primary-600">Legal</Link></li>
                <li>/</li>
                <li className="text-gray-900">GDPR Compliance</li>
              </ol>
            </nav>

            <div className="max-w-4xl mx-auto">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center">
                  <ShieldCheckIcon className="w-8 h-8 text-primary-600" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">GDPR Compliance</h1>
                  <p className="text-gray-600">Last Updated: January 1, 2024</p>
                </div>
              </div>
              <p className="text-xl text-gray-600">
                Zoptal is committed to protecting your privacy and complying with the General Data Protection Regulation 
                (GDPR). This page outlines our data protection practices and your rights.
              </p>
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="py-8 bg-white border-b">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Navigation</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { title: 'Your Rights', href: '#your-rights', icon: UserGroupIcon },
                  { title: 'Data Processing', href: '#data-processing', icon: DocumentCheckIcon },
                  { title: 'Security Measures', href: '#security', icon: LockClosedIcon },
                  { title: 'Contact DPO', href: '#contact', icon: ShieldCheckIcon }
                ].map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all"
                  >
                    <link.icon className="w-5 h-5 text-primary-600" />
                    <span className="text-gray-700 font-medium">{link.title}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* GDPR Compliance Content */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto prose prose-lg">
              {/* Introduction */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Our Commitment to GDPR Compliance
                </h2>
                <p className="text-gray-600 mb-4">
                  The General Data Protection Regulation (GDPR) is a comprehensive data protection law that governs how 
                  organizations collect, use, and protect personal data of individuals in the European Union (EU) and 
                  European Economic Area (EEA).
                </p>
                <p className="text-gray-600 mb-4">
                  At Zoptal, we take data protection seriously and have implemented comprehensive measures to ensure 
                  compliance with GDPR requirements. This includes:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Transparent data collection and processing practices</li>
                  <li>Strong security measures to protect personal data</li>
                  <li>Clear procedures for exercising data subject rights</li>
                  <li>Regular privacy assessments and audits</li>
                  <li>Employee training on data protection</li>
                </ul>
              </div>

              {/* Your Rights Under GDPR */}
              <div className="mb-12" id="your-rights">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Your Rights Under GDPR
                </h2>
                <p className="text-gray-600 mb-4">
                  As a data subject under GDPR, you have the following rights regarding your personal data:
                </p>

                <div className="space-y-6">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      1. Right to Access (Article 15)
                    </h3>
                    <p className="text-gray-600">
                      You have the right to request a copy of the personal data we hold about you and information about 
                      how we process it.
                    </p>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      2. Right to Rectification (Article 16)
                    </h3>
                    <p className="text-gray-600">
                      You can request that we correct any inaccurate or incomplete personal data we hold about you.
                    </p>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      3. Right to Erasure (Article 17)
                    </h3>
                    <p className="text-gray-600">
                      Also known as the "right to be forgotten," you can request that we delete your personal data in 
                      certain circumstances.
                    </p>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      4. Right to Restrict Processing (Article 18)
                    </h3>
                    <p className="text-gray-600">
                      You can request that we limit how we use your personal data in certain circumstances.
                    </p>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      5. Right to Data Portability (Article 20)
                    </h3>
                    <p className="text-gray-600">
                      You have the right to receive your personal data in a structured, commonly used, and machine-readable 
                      format and transmit it to another controller.
                    </p>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      6. Right to Object (Article 21)
                    </h3>
                    <p className="text-gray-600">
                      You can object to the processing of your personal data for direct marketing purposes or based on 
                      legitimate interests.
                    </p>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      7. Rights Related to Automated Decision-Making (Article 22)
                    </h3>
                    <p className="text-gray-600">
                      You have the right not to be subject to decisions based solely on automated processing, including 
                      profiling, which produces legal or significant effects.
                    </p>
                  </div>
                </div>
              </div>

              {/* How to Exercise Your Rights */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  How to Exercise Your Rights
                </h2>
                <p className="text-gray-600 mb-4">
                  To exercise any of your rights under GDPR, please contact our Data Protection Officer using the contact 
                  information provided below. We will:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Respond to your request within one month</li>
                  <li>Verify your identity to protect your data</li>
                  <li>Provide the requested information free of charge (for reasonable requests)</li>
                  <li>Explain any reasons if we cannot fulfill your request</li>
                </ul>
              </div>

              {/* Data Processing */}
              <div className="mb-12" id="data-processing">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  How We Process Your Data
                </h2>
                
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Legal Bases for Processing</h3>
                <p className="text-gray-600 mb-4">
                  We process personal data under the following legal bases:
                </p>
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left pb-3">Legal Basis</th>
                        <th className="text-left pb-3">Purpose</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-600">
                      <tr className="border-b">
                        <td className="py-3 font-semibold">Contract Performance</td>
                        <td className="py-3">To provide our services and fulfill our contractual obligations</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 font-semibold">Legitimate Interests</td>
                        <td className="py-3">To improve our services, ensure security, and prevent fraud</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 font-semibold">Consent</td>
                        <td className="py-3">For marketing communications and optional services</td>
                      </tr>
                      <tr>
                        <td className="py-3 font-semibold">Legal Obligations</td>
                        <td className="py-3">To comply with laws and regulations</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">Data Categories We Process</h3>
                <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
                  <li><strong>Identity Data:</strong> Name, username, title</li>
                  <li><strong>Contact Data:</strong> Email address, phone number, address</li>
                  <li><strong>Technical Data:</strong> IP address, browser type, device information</li>
                  <li><strong>Usage Data:</strong> How you use our website and services</li>
                  <li><strong>Marketing Data:</strong> Preferences for receiving marketing</li>
                  <li><strong>Project Data:</strong> Information related to software development projects</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">Data Retention</h3>
                <p className="text-gray-600 mb-4">
                  We retain personal data only for as long as necessary to fulfill the purposes for which it was collected:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Active customer data: Duration of the business relationship plus 7 years</li>
                  <li>Marketing data: Until consent is withdrawn or 3 years of inactivity</li>
                  <li>Technical logs: 90 days</li>
                  <li>Cookie data: As specified in our Cookie Policy</li>
                </ul>
              </div>

              {/* International Transfers */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  International Data Transfers
                </h2>
                <p className="text-gray-600 mb-4">
                  As a global company, we may transfer your personal data outside the EEA. When we do, we ensure 
                  appropriate safeguards are in place:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
                  <li>Adequacy decisions for countries with equivalent data protection laws</li>
                  <li>Binding Corporate Rules for intra-group transfers</li>
                  <li>Your explicit consent where required</li>
                </ul>
              </div>

              {/* Security Measures */}
              <div className="mb-12" id="security">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Security Measures
                </h2>
                <p className="text-gray-600 mb-4">
                  We implement appropriate technical and organizational measures to protect your personal data:
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Technical Measures</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-start">
                        <LockClosedIcon className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                        <span>End-to-end encryption for data in transit</span>
                      </li>
                      <li className="flex items-start">
                        <LockClosedIcon className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                        <span>Encryption at rest for stored data</span>
                      </li>
                      <li className="flex items-start">
                        <LockClosedIcon className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                        <span>Regular security audits and testing</span>
                      </li>
                      <li className="flex items-start">
                        <LockClosedIcon className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                        <span>Intrusion detection systems</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Organizational Measures</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-start">
                        <ShieldCheckIcon className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                        <span>Employee training on data protection</span>
                      </li>
                      <li className="flex items-start">
                        <ShieldCheckIcon className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                        <span>Access controls and authentication</span>
                      </li>
                      <li className="flex items-start">
                        <ShieldCheckIcon className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                        <span>Regular privacy impact assessments</span>
                      </li>
                      <li className="flex items-start">
                        <ShieldCheckIcon className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                        <span>Incident response procedures</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Data Breach Procedures */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Data Breach Response
                </h2>
                <p className="text-gray-600 mb-4">
                  In the unlikely event of a data breach, we have procedures in place to:
                </p>
                <ol className="list-decimal pl-6 text-gray-600 space-y-2">
                  <li>Immediately contain and investigate the breach</li>
                  <li>Assess the risk to individuals' rights and freedoms</li>
                  <li>Notify the relevant supervisory authority within 72 hours (if required)</li>
                  <li>Inform affected individuals without undue delay (if high risk)</li>
                  <li>Document all breaches and remedial actions taken</li>
                </ol>
              </div>

              {/* Third-Party Processors */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Third-Party Data Processors
                </h2>
                <p className="text-gray-600 mb-4">
                  We work with carefully selected third-party processors who help us provide our services. All processors 
                  are required to:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                  <li>Sign data processing agreements</li>
                  <li>Implement appropriate security measures</li>
                  <li>Process data only on our instructions</li>
                  <li>Assist with GDPR compliance obligations</li>
                </ul>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <p className="text-yellow-800">
                    <strong>Categories of processors include:</strong> Cloud infrastructure providers, email service 
                    providers, analytics services, payment processors, and customer support tools.
                  </p>
                </div>
              </div>

              {/* Children's Privacy */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Children's Privacy
                </h2>
                <p className="text-gray-600">
                  Our services are not directed to individuals under 16 years of age. We do not knowingly collect personal 
                  data from children. If we become aware that we have collected personal data from a child under 16, we will 
                  take steps to delete such information.
                </p>
              </div>

              {/* Updates to GDPR Compliance */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Updates to This Page
                </h2>
                <p className="text-gray-600">
                  We may update this GDPR compliance page to reflect changes in our practices or legal requirements. We will 
                  notify you of any material changes through our website or by email.
                </p>
              </div>

              {/* Contact DPO */}
              <div className="mb-12" id="contact">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Contact Our Data Protection Officer
                </h2>
                <p className="text-gray-600 mb-4">
                  For any questions about GDPR compliance or to exercise your rights, please contact our Data Protection 
                  Officer:
                </p>
                <div className="bg-gray-50 rounded-lg p-6">
                  <p className="text-gray-700">
                    <strong>Data Protection Officer</strong><br />
                    Zoptal Technologies Inc.<br />
                    Email: dpo@zoptal.com<br />
                    Phone: +1 (555) 123-4568<br />
                    Address: 123 Tech Street, San Francisco, CA 94105<br /><br />
                    <strong>EU Representative:</strong><br />
                    Zoptal EU Representative<br />
                    Address: [EU Representative Address]<br />
                    Email: eu-rep@zoptal.com
                  </p>
                </div>
              </div>

              {/* Supervisory Authority */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Right to Lodge a Complaint
                </h2>
                <p className="text-gray-600">
                  If you are not satisfied with how we handle your personal data, you have the right to lodge a complaint 
                  with your local supervisory authority. However, we encourage you to contact us first so we can try to 
                  resolve your concerns.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* GDPR Compliance Status */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                Our GDPR Compliance Status
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg p-6 text-center shadow-sm">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <DocumentCheckIcon className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Fully Compliant</h3>
                  <p className="text-gray-600">
                    All GDPR requirements implemented and regularly audited
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-6 text-center shadow-sm">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldCheckIcon className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Privacy by Design</h3>
                  <p className="text-gray-600">
                    Data protection built into all our processes and systems
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-6 text-center shadow-sm">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserGroupIcon className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">DPO Appointed</h3>
                  <p className="text-gray-600">
                    Dedicated Data Protection Officer to oversee compliance
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related Links */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Legal Documents</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <Link
                  href="/legal/privacy"
                  className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all group"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600">
                    Privacy Policy
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Comprehensive privacy information and data handling practices.
                  </p>
                  <span className="text-primary-600 font-medium flex items-center">
                    Read Policy
                    <ArrowRightIcon className="w-4 h-4 ml-2" />
                  </span>
                </Link>

                <Link
                  href="/legal/cookies"
                  className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all group"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600">
                    Cookie Policy
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Information about cookies and tracking technologies we use.
                  </p>
                  <span className="text-primary-600 font-medium flex items-center">
                    Read Policy
                    <ArrowRightIcon className="w-4 h-4 ml-2" />
                  </span>
                </Link>

                <Link
                  href="/legal/terms"
                  className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all group"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600">
                    Terms of Service
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Terms and conditions for using our services and platform.
                  </p>
                  <span className="text-primary-600 font-medium flex items-center">
                    Read Terms
                    <ArrowRightIcon className="w-4 h-4 ml-2" />
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </MainLayout>
    </>
  );
}