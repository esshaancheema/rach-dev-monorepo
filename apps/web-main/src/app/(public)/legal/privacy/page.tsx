import { Metadata } from 'next';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';

export const metadata: Metadata = {
  title: 'Privacy Policy - How We Protect Your Data | Zoptal',
  description: 'Learn how Zoptal collects, uses, and protects your personal information. Our comprehensive privacy policy explains your rights and our data practices.',
  keywords: [
    'privacy policy',
    'data protection',
    'GDPR compliance',
    'data privacy',
    'personal information',
    'data security',
    'privacy rights',
  ],
};

export default function PrivacyPage() {
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
              <span className="text-gray-900">Privacy Policy</span>
            </nav>
            
            <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
            <p className="text-lg text-gray-600 mb-4">
              Last updated: January 15, 2024
            </p>
            <p className="text-gray-600">
              At Zoptal, we take your privacy seriously. This Privacy Policy explains how we collect, 
              use, disclose, and safeguard your information when you use our services.
            </p>
          </div>
        </div>
      </section>
      
      {/* Table of Contents */}
      <section className="py-8 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Table of Contents</h2>
              <div className="grid md:grid-cols-2 gap-2 text-sm">
                <a href="#information-we-collect" className="text-blue-600 hover:underline">
                  1. Information We Collect
                </a>
                <a href="#how-we-use-information" className="text-blue-600 hover:underline">
                  2. How We Use Your Information
                </a>
                <a href="#information-sharing" className="text-blue-600 hover:underline">
                  3. Information Sharing and Disclosure
                </a>
                <a href="#data-security" className="text-blue-600 hover:underline">
                  4. Data Security
                </a>
                <a href="#data-retention" className="text-blue-600 hover:underline">
                  5. Data Retention
                </a>
                <a href="#your-rights" className="text-blue-600 hover:underline">
                  6. Your Rights and Choices
                </a>
                <a href="#international-transfers" className="text-blue-600 hover:underline">
                  7. International Data Transfers
                </a>
                <a href="#changes-to-policy" className="text-blue-600 hover:underline">
                  8. Changes to This Policy
                </a>
                <a href="#contact-us" className="text-blue-600 hover:underline">
                  9. Contact Us
                </a>
              </div>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto prose prose-lg">
            
            <section id="information-we-collect" className="mb-12">
              <h2 className="text-2xl font-bold mb-6">1. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold mb-4">Information You Provide to Us</h3>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li><strong>Account Information:</strong> Name, email address, password, and profile information when you create an account</li>
                <li><strong>Project Data:</strong> Code, configurations, and other content you create or upload to our platform</li>
                <li><strong>Payment Information:</strong> Billing details processed by our payment providers (we don't store credit card numbers)</li>
                <li><strong>Communication Data:</strong> Messages you send to our support team or through our platform</li>
                <li><strong>Survey and Feedback:</strong> Responses to surveys, feedback forms, or other research activities</li>
              </ul>
              
              <h3 className="text-xl font-semibold mb-4">Information We Collect Automatically</h3>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li><strong>Usage Data:</strong> How you interact with our services, features used, time spent, and user preferences</li>
                <li><strong>Device Information:</strong> IP address, browser type, operating system, device identifiers</li>
                <li><strong>Log Data:</strong> Server logs including access times, pages viewed, and system activity</li>
                <li><strong>Cookies and Tracking:</strong> We use cookies and similar tracking technologies as described in our Cookie Policy</li>
              </ul>
              
              <h3 className="text-xl font-semibold mb-4">Information from Third Parties</h3>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li><strong>Integration Partners:</strong> Data from connected services like GitHub, GitLab, or other development tools</li>
                <li><strong>Social Login:</strong> Profile information when you authenticate using third-party services</li>
                <li><strong>Marketing Partners:</strong> Contact information from legitimate lead generation activities</li>
              </ul>
            </section>
            
            <section id="how-we-use-information" className="mb-12">
              <h2 className="text-2xl font-bold mb-6">2. How We Use Your Information</h2>
              
              <p className="mb-4">We use the information we collect for the following purposes:</p>
              
              <h3 className="text-xl font-semibold mb-4">Service Provision</h3>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>Provide, maintain, and improve our development platform</li>
                <li>Process and complete transactions</li>
                <li>Provide customer support and respond to inquiries</li>
                <li>Enable collaboration features and team functionality</li>
              </ul>
              
              <h3 className="text-xl font-semibold mb-4">Communication</h3>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>Send service-related notifications and updates</li>
                <li>Provide technical support and customer service</li>
                <li>Send marketing communications (with your consent)</li>
                <li>Respond to your requests and inquiries</li>
              </ul>
              
              <h3 className="text-xl font-semibold mb-4">Analytics and Improvement</h3>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>Analyze usage patterns to improve our services</li>
                <li>Conduct research and development</li>
                <li>Perform data analytics and generate insights</li>
                <li>Test new features and functionality</li>
              </ul>
              
              <h3 className="text-xl font-semibold mb-4">Security and Compliance</h3>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>Detect, prevent, and address fraud and security issues</li>
                <li>Comply with legal obligations and enforce our terms</li>
                <li>Protect the rights and safety of our users</li>
                <li>Maintain audit trails and compliance records</li>
              </ul>
            </section>
            
            <section id="information-sharing" className="mb-12">
              <h2 className="text-2xl font-bold mb-6">3. Information Sharing and Disclosure</h2>
              
              <p className="mb-4">We do not sell your personal information. We may share your information in the following circumstances:</p>
              
              <h3 className="text-xl font-semibold mb-4">With Your Consent</h3>
              <p className="mb-4">We share information when you explicitly consent to such sharing.</p>
              
              <h3 className="text-xl font-semibold mb-4">Service Providers</h3>
              <p className="mb-4">We work with third-party service providers who perform services on our behalf:</p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>Cloud hosting and infrastructure providers (AWS, Google Cloud)</li>
                <li>Payment processors (Stripe, PayPal)</li>
                <li>Analytics services (Google Analytics, Mixpanel)</li>
                <li>Customer support tools (Zendesk, Intercom)</li>
                <li>Marketing and communication platforms</li>
              </ul>
              
              <h3 className="text-xl font-semibold mb-4">Business Transfers</h3>
              <p className="mb-4">
                In the event of a merger, acquisition, or sale of assets, your information may be transferred 
                as part of that transaction.
              </p>
              
              <h3 className="text-xl font-semibold mb-4">Legal Requirements</h3>
              <p className="mb-4">We may disclose information when required by law or to:</p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>Comply with legal process or government requests</li>
                <li>Enforce our Terms of Service or other agreements</li>
                <li>Protect the rights, property, or safety of Zoptal, our users, or others</li>
                <li>Detect, prevent, or address fraud, security, or technical issues</li>
              </ul>
            </section>
            
            <section id="data-security" className="mb-12">
              <h2 className="text-2xl font-bold mb-6">4. Data Security</h2>
              
              <p className="mb-4">
                We implement appropriate technical and organizational measures to protect your personal information:
              </p>
              
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li><strong>Encryption:</strong> Data is encrypted in transit and at rest using industry-standard protocols</li>
                <li><strong>Access Controls:</strong> Strict access controls and authentication requirements for our systems</li>
                <li><strong>Regular Audits:</strong> Regular security audits and penetration testing</li>
                <li><strong>Employee Training:</strong> All employees receive security and privacy training</li>
                <li><strong>Incident Response:</strong> Comprehensive incident response and breach notification procedures</li>
                <li><strong>Compliance:</strong> SOC 2 Type II certification and other security frameworks</li>
              </ul>
              
              <p className="mb-4">
                However, no method of transmission over the internet or electronic storage is 100% secure. 
                While we strive to protect your personal information, we cannot guarantee absolute security.
              </p>
            </section>
            
            <section id="data-retention" className="mb-12">
              <h2 className="text-2xl font-bold mb-6">5. Data Retention</h2>
              
              <p className="mb-4">We retain your information for as long as necessary to:</p>
              
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>Provide our services to you</li>
                <li>Comply with legal obligations</li>
                <li>Resolve disputes and enforce agreements</li>
                <li>Maintain security and prevent fraud</li>
              </ul>
              
              <p className="mb-4">Specific retention periods:</p>
              
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li><strong>Account Data:</strong> Retained while your account is active and for 3 years after closure</li>
                <li><strong>Project Data:</strong> Retained according to your plan and backup policies</li>
                <li><strong>Usage Logs:</strong> Retained for 2 years for security and analytics purposes</li>
                <li><strong>Marketing Data:</strong> Retained until you unsubscribe or object to processing</li>
              </ul>
            </section>
            
            <section id="your-rights" className="mb-12">
              <h2 className="text-2xl font-bold mb-6">6. Your Rights and Choices</h2>
              
              <p className="mb-4">Depending on your location, you may have the following rights:</p>
              
              <h3 className="text-xl font-semibold mb-4">Access and Portability</h3>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>Request access to your personal information</li>
                <li>Receive a copy of your data in a portable format</li>
                <li>View and download your project data through our platform</li>
              </ul>
              
              <h3 className="text-xl font-semibold mb-4">Correction and Updates</h3>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>Correct inaccurate or incomplete information</li>
                <li>Update your account settings and preferences</li>
                <li>Modify your communication preferences</li>
              </ul>
              
              <h3 className="text-xl font-semibold mb-4">Deletion and Erasure</h3>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>Request deletion of your personal information</li>
                <li>Close your account and remove associated data</li>
                <li>Withdraw consent for data processing</li>
              </ul>
              
              <h3 className="text-xl font-semibold mb-4">Objection and Restriction</h3>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>Object to certain types of data processing</li>
                <li>Restrict processing of your information</li>
                <li>Opt out of marketing communications</li>
              </ul>
              
              <p className="mb-4">
                To exercise these rights, please contact us at{' '}
                <a href="mailto:privacy@zoptal.com" className="text-blue-600 hover:underline">
                  privacy@zoptal.com
                </a>
                . We will respond to your request within 30 days.
              </p>
            </section>
            
            <section id="international-transfers" className="mb-12">
              <h2 className="text-2xl font-bold mb-6">7. International Data Transfers</h2>
              
              <p className="mb-4">
                Zoptal operates globally. Your information may be transferred to and processed in countries 
                other than your country of residence, including the United States.
              </p>
              
              <p className="mb-4">
                When we transfer personal information from the European Economic Area (EEA) or the UK to 
                other countries, we use appropriate safeguards such as:
              </p>
              
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>Standard Contractual Clauses approved by the European Commission</li>
                <li>Adequacy decisions by the European Commission</li>
                <li>Binding Corporate Rules for intra-group transfers</li>
                <li>Certification schemes and codes of conduct</li>
              </ul>
            </section>
            
            <section id="changes-to-policy" className="mb-12">
              <h2 className="text-2xl font-bold mb-6">8. Changes to This Privacy Policy</h2>
              
              <p className="mb-4">
                We may update this Privacy Policy from time to time. When we make changes, we will:
              </p>
              
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>Update the "Last Updated" date at the top of this policy</li>
                <li>Notify you via email for material changes</li>
                <li>Post a notice on our website</li>
                <li>Provide in-app notifications where appropriate</li>
              </ul>
              
              <p className="mb-4">
                Your continued use of our services after any changes constitutes acceptance of the updated policy.
              </p>
            </section>
            
            <section id="contact-us" className="mb-12">
              <h2 className="text-2xl font-bold mb-6">9. Contact Us</h2>
              
              <p className="mb-4">
                If you have questions about this Privacy Policy or our data practices, please contact us:
              </p>
              
              <div className="bg-gray-100 p-6 rounded-lg">
                <p className="mb-2"><strong>Email:</strong> privacy@zoptal.com</p>
                <p className="mb-2"><strong>Address:</strong> Zoptal Inc., 123 Market Street, Suite 400, San Francisco, CA 94105</p>
                <p className="mb-2"><strong>Data Protection Officer:</strong> dpo@zoptal.com</p>
                <p><strong>EU Representative:</strong> Zoptal EU Ltd., 456 Oxford Street, London, W1C 1AP, UK</p>
              </div>
              
              <p className="mt-6">
                For users in the European Union, you also have the right to lodge a complaint with your 
                local data protection authority.
              </p>
            </section>
            
          </div>
        </div>
      </section>
      
      {/* Related Links */}
      <section className="py-16 bg-white border-t">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-8">Related Legal Documents</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/legal/terms" className="block p-4 border rounded-lg hover:shadow-md transition-shadow">
                <h3 className="font-semibold mb-2">Terms of Service</h3>
                <p className="text-sm text-gray-600">Our terms and conditions for using Zoptal</p>
              </Link>
              <Link href="/legal/cookies" className="block p-4 border rounded-lg hover:shadow-md transition-shadow">
                <h3 className="font-semibold mb-2">Cookie Policy</h3>
                <p className="text-sm text-gray-600">How we use cookies and tracking technologies</p>
              </Link>
              <Link href="/legal/gdpr" className="block p-4 border rounded-lg hover:shadow-md transition-shadow">
                <h3 className="font-semibold mb-2">GDPR Compliance</h3>
                <p className="text-sm text-gray-600">Our commitment to GDPR compliance</p>
              </Link>
              <Link href="/resources/help-center" className="block p-4 border rounded-lg hover:shadow-md transition-shadow">
                <h3 className="font-semibold mb-2">Help Center</h3>
                <p className="text-sm text-gray-600">Get support and find answers</p>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}