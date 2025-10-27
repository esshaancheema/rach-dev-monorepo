import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRightIcon, InformationCircleIcon, CogIcon, ShieldCheckIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { MainLayout } from '@/components/layout';
import { SEOHead } from '@/components/seo';
import { generateBreadcrumbSchema, combineSchemas, ZOPTAL_ORGANIZATION_SCHEMA } from '@/lib/seo/schemas';

export const metadata: Metadata = {
  title: 'Cookie Policy | Zoptal Legal',
  description: 'Learn about how Zoptal uses cookies and similar tracking technologies. Understand your choices regarding cookie preferences.',
  keywords: [
    'cookie policy',
    'cookies',
    'tracking technologies',
    'privacy',
    'data collection',
    'cookie preferences',
    'Zoptal cookies'
  ]
};

export default function CookiePolicyPage() {
  const breadcrumbSchema = generateBreadcrumbSchema({
    items: [
      { name: 'Home', url: 'https://zoptal.com' },
      { name: 'Legal', url: 'https://zoptal.com/legal' },
      { name: 'Cookie Policy', url: 'https://zoptal.com/legal/cookies' }
    ]
  });

  const structuredData = combineSchemas(
    ZOPTAL_ORGANIZATION_SCHEMA,
    breadcrumbSchema,
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Cookie Policy",
      "description": "Zoptal cookie policy and tracking technologies information",
      "url": "https://zoptal.com/legal/cookies",
      "inLanguage": "en",
      "datePublished": "2024-01-01",
      "dateModified": new Date().toISOString()
    }
  );

  return (
    <>
      <SEOHead
        title="Cookie Policy | Zoptal Legal"
        description="Learn about how Zoptal uses cookies and similar tracking technologies. Understand your choices regarding cookie preferences."
        canonicalUrl="https://zoptal.com/legal/cookies"
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
                <li className="text-gray-900">Cookie Policy</li>
              </ol>
            </nav>

            <div className="max-w-4xl mx-auto">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center">
                  <InformationCircleIcon className="w-8 h-8 text-primary-600" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">Cookie Policy</h1>
                  <p className="text-gray-600">Effective Date: January 1, 2024</p>
                </div>
              </div>
              <p className="text-xl text-gray-600">
                This Cookie Policy explains how Zoptal uses cookies and similar technologies to recognize you when you visit 
                our website and use our services.
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
                  { title: 'What Are Cookies', href: '#what-are-cookies', icon: InformationCircleIcon },
                  { title: 'Types of Cookies', href: '#cookie-types', icon: CogIcon },
                  { title: 'Managing Cookies', href: '#manage-cookies', icon: ShieldCheckIcon },
                  { title: 'Contact Us', href: '#contact', icon: ChartBarIcon }
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

        {/* Cookie Policy Content */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto prose prose-lg">
              {/* What Are Cookies */}
              <div className="mb-12">
                <h2 id="what-are-cookies" className="text-2xl font-bold text-gray-900 mb-4">
                  1. What Are Cookies?
                </h2>
                <p className="text-gray-600 mb-4">
                  Cookies are small text files that are placed on your device when you visit a website. They are widely used 
                  to make websites work more efficiently and provide information to website owners.
                </p>
                <p className="text-gray-600 mb-4">
                  We use cookies and similar tracking technologies (such as web beacons, pixels, and local storage) to:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Enable certain website features and functionality</li>
                  <li>Improve your browsing experience</li>
                  <li>Analyze website traffic and usage patterns</li>
                  <li>Personalize content and advertisements</li>
                  <li>Remember your preferences and settings</li>
                </ul>
              </div>

              {/* Types of Cookies */}
              <div className="mb-12">
                <h2 id="cookie-types" className="text-2xl font-bold text-gray-900 mb-4">
                  2. Types of Cookies We Use
                </h2>
                
                <h3 className="text-xl font-semibold text-gray-800 mb-3">2.1 Essential Cookies</h3>
                <p className="text-gray-600 mb-4">
                  These cookies are necessary for the website to function properly. They enable basic functions like page 
                  navigation and access to secure areas.
                </p>
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left pb-2">Cookie Name</th>
                        <th className="text-left pb-2">Purpose</th>
                        <th className="text-left pb-2">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm text-gray-600">
                      <tr className="border-b">
                        <td className="py-2">session_id</td>
                        <td className="py-2">Maintains user session</td>
                        <td className="py-2">Session</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">csrf_token</td>
                        <td className="py-2">Security token</td>
                        <td className="py-2">Session</td>
                      </tr>
                      <tr>
                        <td className="py-2">auth_token</td>
                        <td className="py-2">Authentication</td>
                        <td className="py-2">30 days</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">2.2 Performance Cookies</h3>
                <p className="text-gray-600 mb-4">
                  These cookies collect information about how visitors use our website, such as which pages are visited most 
                  often. We use this information to improve our website.
                </p>
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left pb-2">Cookie Name</th>
                        <th className="text-left pb-2">Purpose</th>
                        <th className="text-left pb-2">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm text-gray-600">
                      <tr className="border-b">
                        <td className="py-2">_ga</td>
                        <td className="py-2">Google Analytics</td>
                        <td className="py-2">2 years</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">_gid</td>
                        <td className="py-2">Google Analytics</td>
                        <td className="py-2">24 hours</td>
                      </tr>
                      <tr>
                        <td className="py-2">ph_*</td>
                        <td className="py-2">PostHog Analytics</td>
                        <td className="py-2">1 year</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">2.3 Functionality Cookies</h3>
                <p className="text-gray-600 mb-4">
                  These cookies allow our website to remember choices you make and provide enhanced features.
                </p>
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left pb-2">Cookie Name</th>
                        <th className="text-left pb-2">Purpose</th>
                        <th className="text-left pb-2">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm text-gray-600">
                      <tr className="border-b">
                        <td className="py-2">language_pref</td>
                        <td className="py-2">Language preference</td>
                        <td className="py-2">1 year</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">theme_pref</td>
                        <td className="py-2">Theme preference</td>
                        <td className="py-2">1 year</td>
                      </tr>
                      <tr>
                        <td className="py-2">timezone</td>
                        <td className="py-2">User timezone</td>
                        <td className="py-2">1 year</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">2.4 Marketing Cookies</h3>
                <p className="text-gray-600 mb-4">
                  These cookies track your online activity to help advertisers deliver more relevant advertising or to limit 
                  how many times you see an ad.
                </p>
                <div className="bg-gray-50 rounded-lg p-6">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left pb-2">Cookie Name</th>
                        <th className="text-left pb-2">Purpose</th>
                        <th className="text-left pb-2">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm text-gray-600">
                      <tr className="border-b">
                        <td className="py-2">_fbp</td>
                        <td className="py-2">Facebook Pixel</td>
                        <td className="py-2">90 days</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">_gcl_*</td>
                        <td className="py-2">Google Ads</td>
                        <td className="py-2">90 days</td>
                      </tr>
                      <tr>
                        <td className="py-2">li_*</td>
                        <td className="py-2">LinkedIn Insight</td>
                        <td className="py-2">6 months</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Third-Party Cookies */}
              <div className="mb-12">
                <h2 id="third-party" className="text-2xl font-bold text-gray-900 mb-4">
                  3. Third-Party Cookies
                </h2>
                <p className="text-gray-600 mb-4">
                  Some cookies on our website are set by third-party services that appear on our pages. These include:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li><strong>Google Analytics:</strong> For website traffic analysis</li>
                  <li><strong>PostHog:</strong> For product analytics and user behavior</li>
                  <li><strong>Intercom:</strong> For customer support chat</li>
                  <li><strong>YouTube:</strong> For embedded video content</li>
                  <li><strong>Social Media Platforms:</strong> For social sharing buttons</li>
                </ul>
              </div>

              {/* Managing Cookies */}
              <div className="mb-12">
                <h2 id="manage-cookies" className="text-2xl font-bold text-gray-900 mb-4">
                  4. Managing Your Cookie Preferences
                </h2>
                <p className="text-gray-600 mb-4">
                  You have several options for managing cookies:
                </p>
                
                <h3 className="text-xl font-semibold text-gray-800 mb-3">4.1 Browser Settings</h3>
                <p className="text-gray-600 mb-4">
                  Most web browsers allow you to control cookies through their settings. You can:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                  <li>View what cookies are stored on your device</li>
                  <li>Delete some or all cookies</li>
                  <li>Block cookies from certain or all websites</li>
                  <li>Receive a warning before a cookie is stored</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">4.2 Cookie Management Links</h3>
                <p className="text-gray-600 mb-4">
                  Here are links to cookie management instructions for popular browsers:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                  <li><a href="https://support.google.com/chrome/answer/95647" className="text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
                  <li><a href="https://support.mozilla.org/en-US/kb/cookies" className="text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
                  <li><a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" className="text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer">Safari</a></li>
                  <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" className="text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
                </ul>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <p className="text-yellow-800">
                    <strong>Important:</strong> Blocking all cookies may impact the functionality of our website and prevent 
                    you from using certain features.
                  </p>
                </div>
              </div>

              {/* Opt-Out Options */}
              <div className="mb-12">
                <h2 id="opt-out" className="text-2xl font-bold text-gray-900 mb-4">
                  5. Opt-Out Options
                </h2>
                <p className="text-gray-600 mb-4">
                  You can opt out of certain types of cookies:
                </p>
                
                <h3 className="text-xl font-semibold text-gray-800 mb-3">5.1 Analytics Cookies</h3>
                <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                  <li>Google Analytics: <a href="https://tools.google.com/dlpage/gaoptout" className="text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer">Google Analytics Opt-out Browser Add-on</a></li>
                  <li>PostHog: Visit your account settings to manage tracking preferences</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">5.2 Advertising Cookies</h3>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Digital Advertising Alliance: <a href="http://optout.aboutads.info/" className="text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer">DAA Opt-Out</a></li>
                  <li>Network Advertising Initiative: <a href="http://optout.networkadvertising.org/" className="text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer">NAI Opt-Out</a></li>
                  <li>European Interactive Digital Advertising Alliance: <a href="http://www.youronlinechoices.eu/" className="text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer">Your Online Choices</a></li>
                </ul>
              </div>

              {/* Do Not Track */}
              <div className="mb-12">
                <h2 id="dnt" className="text-2xl font-bold text-gray-900 mb-4">
                  6. Do Not Track Signals
                </h2>
                <p className="text-gray-600">
                  Some browsers offer a "Do Not Track" (DNT) signal. Currently, our website does not respond to DNT signals 
                  because there is no industry standard for DNT compliance. However, you can use the cookie management options 
                  described above to control data collection.
                </p>
              </div>

              {/* Updates to Policy */}
              <div className="mb-12">
                <h2 id="updates" className="text-2xl font-bold text-gray-900 mb-4">
                  7. Updates to This Policy
                </h2>
                <p className="text-gray-600">
                  We may update this Cookie Policy from time to time to reflect changes in our practices or for legal, 
                  operational, or regulatory reasons. We will post the updated policy on this page with a new effective date.
                </p>
              </div>

              {/* Contact Information */}
              <div className="mb-12" id="contact">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  8. Contact Us
                </h2>
                <p className="text-gray-600 mb-4">
                  If you have questions about our use of cookies or this Cookie Policy, please contact us:
                </p>
                <div className="bg-gray-50 rounded-lg p-6">
                  <p className="text-gray-700">
                    <strong>Zoptal Technologies Inc.</strong><br />
                    Privacy Team<br />
                    Email: privacy@zoptal.com<br />
                    Phone: +1 (555) 123-4567<br />
                    Address: 123 Tech Street, San Francisco, CA 94105
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cookie Consent Banner Example */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Cookie Consent Banner</h2>
              <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-gray-200">
                <p className="text-gray-600 mb-4">
                  This is an example of how our cookie consent banner appears to first-time visitors:
                </p>
                <div className="bg-gray-900 text-white rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-2">🍪 We use cookies</h3>
                  <p className="text-gray-300 mb-4">
                    We use cookies to improve your experience on our site. By continuing to use Zoptal, you accept our use 
                    of cookies.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button className="bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700">
                      Accept All
                    </button>
                    <button className="bg-gray-700 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-600">
                      Manage Preferences
                    </button>
                    <button className="text-gray-400 hover:text-white font-medium">
                      Reject All
                    </button>
                  </div>
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
              <div className="grid md:grid-cols-2 gap-6">
                <Link
                  href="/legal/privacy"
                  className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all group"
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
                  href="/legal/terms"
                  className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all group"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600">
                    Terms of Service
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Review our terms and conditions for using Zoptal services.
                  </p>
                  <span className="text-primary-600 font-medium flex items-center">
                    Read Terms of Service
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