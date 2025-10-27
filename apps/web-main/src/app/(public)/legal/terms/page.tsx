import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRightIcon, DocumentTextIcon, ShieldCheckIcon, ScaleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { MainLayout } from '@/components/layout';
import { SEOHead } from '@/components/seo';
import { generateBreadcrumbSchema, combineSchemas, ZOPTAL_ORGANIZATION_SCHEMA } from '@/lib/seo/schemas';

export const metadata: Metadata = {
  title: 'Terms of Service | Zoptal Legal',
  description: 'Read Zoptal\'s terms of service. Understand your rights and obligations when using our software development services and platform.',
  keywords: [
    'terms of service',
    'legal terms',
    'service agreement',
    'terms and conditions',
    'user agreement',
    'software development terms',
    'Zoptal legal'
  ]
};

export default function TermsOfServicePage() {
  const breadcrumbSchema = generateBreadcrumbSchema({
    items: [
      { name: 'Home', url: 'https://zoptal.com' },
      { name: 'Legal', url: 'https://zoptal.com/legal' },
      { name: 'Terms of Service', url: 'https://zoptal.com/legal/terms' }
    ]
  });

  const structuredData = combineSchemas(
    ZOPTAL_ORGANIZATION_SCHEMA,
    breadcrumbSchema,
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Terms of Service",
      "description": "Zoptal terms of service and legal agreements",
      "url": "https://zoptal.com/legal/terms",
      "inLanguage": "en",
      "datePublished": "2024-01-01",
      "dateModified": new Date().toISOString()
    }
  );

  return (
    <>
      <SEOHead
        title="Terms of Service | Zoptal Legal"
        description="Read Zoptal's terms of service. Understand your rights and obligations when using our software development services and platform."
        canonicalUrl="https://zoptal.com/legal/terms"
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
                <li className="text-gray-900">Terms of Service</li>
              </ol>
            </nav>

            <div className="max-w-4xl mx-auto">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center">
                  <DocumentTextIcon className="w-8 h-8 text-primary-600" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">Terms of Service</h1>
                  <p className="text-gray-600">Effective Date: January 1, 2024</p>
                </div>
              </div>
              <p className="text-xl text-gray-600">
                These terms govern your use of Zoptal's services and platform. By using our services, 
                you agree to these terms.
              </p>
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="py-8 bg-white border-b">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { title: 'Service Terms', href: '#service-terms', icon: DocumentTextIcon },
                  { title: 'User Obligations', href: '#user-obligations', icon: ShieldCheckIcon },
                  { title: 'Liability', href: '#liability', icon: ScaleIcon },
                  { title: 'Contact', href: '#contact', icon: InformationCircleIcon }
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

        {/* Terms Content */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto prose prose-lg">
              {/* Acceptance of Terms */}
              <div className="mb-12">
                <h2 id="acceptance" className="text-2xl font-bold text-gray-900 mb-4">
                  1. Acceptance of Terms
                </h2>
                <p className="text-gray-600 mb-4">
                  By accessing or using Zoptal's services, website, or platform ("Services"), you agree to be bound by these 
                  Terms of Service ("Terms"). If you do not agree to these Terms, you may not use our Services.
                </p>
                <p className="text-gray-600">
                  These Terms constitute a legally binding agreement between you and Zoptal Technologies Inc. ("Zoptal", "we", 
                  "us", or "our").
                </p>
              </div>

              {/* Services Description */}
              <div className="mb-12">
                <h2 id="services" className="text-2xl font-bold text-gray-900 mb-4">
                  2. Services Description
                </h2>
                <p className="text-gray-600 mb-4">
                  Zoptal provides software development services, including but not limited to:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                  <li>Custom software development</li>
                  <li>Mobile application development</li>
                  <li>AI and machine learning solutions</li>
                  <li>SaaS development</li>
                  <li>Enterprise software solutions</li>
                  <li>Technical consulting services</li>
                  <li>Software maintenance and support</li>
                </ul>
                <p className="text-gray-600">
                  Specific services, deliverables, timelines, and fees will be outlined in separate service agreements or 
                  statements of work.
                </p>
              </div>

              {/* User Account */}
              <div className="mb-12">
                <h2 id="user-account" className="text-2xl font-bold text-gray-900 mb-4">
                  3. User Account
                </h2>
                <p className="text-gray-600 mb-4">
                  To access certain features of our Services, you may be required to create an account. You agree to:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain and update your information to keep it accurate</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized access or use</li>
                </ul>
              </div>

              {/* Service Terms */}
              <div className="mb-12">
                <h2 id="service-terms" className="text-2xl font-bold text-gray-900 mb-4">
                  4. Service Terms
                </h2>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">4.1 Project Engagement</h3>
                <p className="text-gray-600 mb-4">
                  Software development projects will be governed by separate project agreements that specify:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                  <li>Project scope and deliverables</li>
                  <li>Timeline and milestones</li>
                  <li>Payment terms and schedule</li>
                  <li>Change management procedures</li>
                  <li>Acceptance criteria</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">4.2 Development Process</h3>
                <p className="text-gray-600 mb-4">
                  We follow industry-standard development practices including:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Agile methodology with regular sprint reviews</li>
                  <li>Code reviews and quality assurance</li>
                  <li>Version control and documentation</li>
                  <li>Security best practices</li>
                  <li>Regular communication and progress updates</li>
                </ul>
              </div>

              {/* Intellectual Property */}
              <div className="mb-12">
                <h2 id="intellectual-property" className="text-2xl font-bold text-gray-900 mb-4">
                  5. Intellectual Property Rights
                </h2>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">5.1 Client Ownership</h3>
                <p className="text-gray-600 mb-4">
                  Upon full payment, clients own all custom software, code, and deliverables specifically created for their 
                  project, except for:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                  <li>Pre-existing Zoptal intellectual property</li>
                  <li>Third-party components and libraries</li>
                  <li>General methodologies and know-how</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">5.2 License Grants</h3>
                <p className="text-gray-600">
                  Clients receive a perpetual, non-exclusive license to use any Zoptal pre-existing IP incorporated into 
                  their deliverables. Zoptal retains the right to use general concepts, techniques, and know-how developed 
                  during the engagement.
                </p>
              </div>

              {/* User Obligations */}
              <div className="mb-12">
                <h2 id="user-obligations" className="text-2xl font-bold text-gray-900 mb-4">
                  6. User Obligations
                </h2>
                <p className="text-gray-600 mb-4">You agree to:</p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Use our Services only for lawful purposes</li>
                  <li>Not violate any applicable laws or regulations</li>
                  <li>Not infringe upon the rights of others</li>
                  <li>Not attempt to gain unauthorized access to our systems</li>
                  <li>Not use our Services to distribute malware or harmful code</li>
                  <li>Cooperate with us in the development process</li>
                  <li>Provide timely feedback and approvals as required</li>
                </ul>
              </div>

              {/* Payment Terms */}
              <div className="mb-12">
                <h2 id="payment" className="text-2xl font-bold text-gray-900 mb-4">
                  7. Payment Terms
                </h2>
                <p className="text-gray-600 mb-4">
                  Payment terms will be specified in individual service agreements. Generally:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Payments are due within 30 days of invoice date</li>
                  <li>Late payments may incur interest charges</li>
                  <li>We may suspend services for overdue accounts</li>
                  <li>All fees are non-refundable unless otherwise specified</li>
                  <li>Clients are responsible for applicable taxes</li>
                </ul>
              </div>

              {/* Confidentiality */}
              <div className="mb-12">
                <h2 id="confidentiality" className="text-2xl font-bold text-gray-900 mb-4">
                  8. Confidentiality
                </h2>
                <p className="text-gray-600 mb-4">
                  Both parties agree to maintain the confidentiality of:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                  <li>Proprietary information and trade secrets</li>
                  <li>Business strategies and plans</li>
                  <li>Technical specifications and designs</li>
                  <li>Financial information</li>
                  <li>Customer data and information</li>
                </ul>
                <p className="text-gray-600">
                  This obligation survives the termination of these Terms and any service agreements.
                </p>
              </div>

              {/* Warranties and Disclaimers */}
              <div className="mb-12">
                <h2 id="warranties" className="text-2xl font-bold text-gray-900 mb-4">
                  9. Warranties and Disclaimers
                </h2>
                <p className="text-gray-600 mb-4">
                  We warrant that our services will be performed in a professional and workmanlike manner. However:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Services are provided "AS IS" without warranties of any kind</li>
                  <li>We do not guarantee uninterrupted or error-free operation</li>
                  <li>We are not responsible for third-party service failures</li>
                  <li>Results may vary based on client requirements and cooperation</li>
                </ul>
              </div>

              {/* Liability */}
              <div className="mb-12">
                <h2 id="liability" className="text-2xl font-bold text-gray-900 mb-4">
                  10. Limitation of Liability
                </h2>
                <p className="text-gray-600 mb-4">
                  To the maximum extent permitted by law:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Our liability is limited to the fees paid for the specific service</li>
                  <li>We are not liable for indirect, incidental, or consequential damages</li>
                  <li>We are not liable for lost profits or business opportunities</li>
                  <li>These limitations apply regardless of the legal theory</li>
                </ul>
              </div>

              {/* Indemnification */}
              <div className="mb-12">
                <h2 id="indemnification" className="text-2xl font-bold text-gray-900 mb-4">
                  11. Indemnification
                </h2>
                <p className="text-gray-600">
                  You agree to indemnify and hold Zoptal harmless from any claims, damages, losses, and expenses 
                  (including legal fees) arising from your use of our Services, violation of these Terms, or infringement 
                  of any third-party rights.
                </p>
              </div>

              {/* Termination */}
              <div className="mb-12">
                <h2 id="termination" className="text-2xl font-bold text-gray-900 mb-4">
                  12. Termination
                </h2>
                <p className="text-gray-600 mb-4">
                  Either party may terminate these Terms or any service agreement:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                  <li>For convenience with 30 days written notice</li>
                  <li>Immediately for material breach</li>
                  <li>Immediately for insolvency or bankruptcy</li>
                </ul>
                <p className="text-gray-600">
                  Upon termination, clients must pay for all work completed and we will deliver all completed work product.
                </p>
              </div>

              {/* Governing Law */}
              <div className="mb-12">
                <h2 id="governing-law" className="text-2xl font-bold text-gray-900 mb-4">
                  13. Governing Law
                </h2>
                <p className="text-gray-600">
                  These Terms are governed by the laws of Delaware, United States, without regard to conflict of law 
                  principles. Any disputes will be resolved through binding arbitration in accordance with the American 
                  Arbitration Association rules.
                </p>
              </div>

              {/* Changes to Terms */}
              <div className="mb-12">
                <h2 id="changes" className="text-2xl font-bold text-gray-900 mb-4">
                  14. Changes to Terms
                </h2>
                <p className="text-gray-600">
                  We may update these Terms from time to time. We will notify you of material changes via email or through 
                  our Services. Your continued use after changes constitutes acceptance of the updated Terms.
                </p>
              </div>

              {/* Contact Information */}
              <div className="mb-12" id="contact">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  15. Contact Information
                </h2>
                <p className="text-gray-600 mb-4">
                  For questions about these Terms, please contact us at:
                </p>
                <div className="bg-gray-50 rounded-lg p-6">
                  <p className="text-gray-700">
                    <strong>Zoptal Technologies Inc.</strong><br />
                    Legal Department<br />
                    Email: legal@zoptal.com<br />
                    Phone: +1 (555) 123-4567<br />
                    Address: 123 Tech Street, San Francisco, CA 94105
                  </p>
                </div>
              </div>

              {/* Entire Agreement */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  16. Entire Agreement
                </h2>
                <p className="text-gray-600">
                  These Terms, together with any service agreements and our Privacy Policy, constitute the entire agreement 
                  between you and Zoptal regarding the use of our Services.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Related Links */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Legal Documents</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Link
                  href="/legal/privacy"
                  className="bg-white rounded-lg p-6 border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all group"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600">
                    Privacy Policy
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Learn how we collect, use, and protect your personal information.
                  </p>
                  <span className="text-primary-600 font-medium flex items-center">
                    Read Privacy Policy
                    <ArrowRightIcon className="w-4 h-4 ml-2" />
                  </span>
                </Link>

                <Link
                  href="/legal/cookies"
                  className="bg-white rounded-lg p-6 border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all group"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600">
                    Cookie Policy
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Understand how we use cookies and similar tracking technologies.
                  </p>
                  <span className="text-primary-600 font-medium flex items-center">
                    Read Cookie Policy
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