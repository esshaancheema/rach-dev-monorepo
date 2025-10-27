import { Metadata } from 'next';
import PersonalizedHeroSection from '@/components/personalization/PersonalizedHeroSection';
import ErrorBoundary from '@/components/interactive-hero/ErrorBoundary';
import StickyFloatingCTA from '@/components/optimization/StickyFloatingCTA';
import ClientServicesOverview from '@/components/homepage/ClientServicesOverview';
import ClientSocialProofSection from '@/components/homepage/ClientSocialProofSection';
import PricingPreview from '@/components/homepage/PricingPreview';
import { HeroNewsletterSignup } from '@/components/newsletter/NewsletterSignup';
import TrackedCTAButtons from '@/components/cta/TrackedCTAButtons';
import { generateOrganizationSchema, generateWebsiteSchema } from '@/lib/seo/schemas';

// Generate metadata for the homepage
export const metadata: Metadata = {
  title: 'AI-Powered Software Development | Custom Solutions | Zoptal',
  description: 'Transform your business with AI-powered software development. Custom enterprise solutions, mobile apps, and AI agents. 500+ projects delivered. Get started today.',
  keywords: [
    'AI software development',
    'custom software development',
    'enterprise solutions',
    'mobile app development',
    'AI agents',
    'machine learning',
    'web development',
    'cloud solutions',
    'DevOps automation',
    'software consulting'
  ],
  openGraph: {
    title: 'Zoptal - AI-Powered Software Development Solutions',
    description: 'Leading software development company specializing in AI-powered solutions, custom enterprise applications, and digital transformation services.',
    images: [
      {
        url: '/images/og/homepage.jpg',
        width: 1200,
        height: 630,
        alt: 'Zoptal AI-Powered Software Development Platform'
      }
    ],
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zoptal - AI-Powered Software Development',
    description: 'Transform your business with cutting-edge AI technology and expert software development services.',
    images: ['/images/og/homepage.jpg']
  },
  alternates: {
    canonical: 'https://zoptal.com'
  }
};

export default function HomePage() {
  // Generate structured data
  const organizationSchema = generateOrganizationSchema({
    name: 'Zoptal',
    description: 'Leading software development company specializing in AI-powered solutions, custom enterprise applications, and digital transformation services.',
    url: 'https://zoptal.com',
    logo: 'https://zoptal.com/images/logo.png',
    contactInfo: {
      phone: '+1-555-012-3456',
      email: 'contact@zoptal.com',
      address: {
        streetAddress: '123 Tech Street',
        addressLocality: 'San Francisco',
        addressRegion: 'CA',
        postalCode: '94105',
        addressCountry: 'US'
      }
    },
    socialMedia: {
      twitter: 'https://twitter.com/zoptal',
      linkedin: 'https://linkedin.com/company/zoptal',
      github: 'https://github.com/zoptal'
    },
    services: [
      'Custom Software Development',
      'AI Development',
      'Mobile App Development',
      'Web Development',
      'Cloud Solutions',
      'DevOps Automation',
      'AI Agents',
      'Quality Assurance',
      'Software Consulting'
    ]
  });

  const websiteSchema = generateWebsiteSchema({
    name: 'Zoptal - AI-Powered Software Development',
    description: 'Leading software development company specializing in AI-powered solutions and digital transformation.',
    url: 'https://zoptal.com',
    searchAction: {
      target: 'https://zoptal.com/search?q={search_term_string}',
      queryInput: 'required name=search_term_string'
    }
  });

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([organizationSchema, websiteSchema])
        }}
      />

      {/* Personalized Hero Section */}
      <ErrorBoundary>
        <PersonalizedHeroSection />
      </ErrorBoundary>

      {/* Services Overview */}
      <div data-section="services">
        <ClientServicesOverview />
      </div>

      {/* Social Proof & Testimonials */}
      <ClientSocialProofSection />

      {/* Pricing Preview */}
      <PricingPreview />

      {/* Newsletter Signup CTA */}
      <section className="py-16 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-xl animate-pulse-slow" />
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-xl animate-pulse-slow" />
            <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white rounded-full blur-xl animate-pulse-slow" />
          </div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Stay Ahead of the Technology Curve
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join 10,000+ business leaders getting weekly insights on AI, software development, 
            and digital transformation strategies that drive results.
          </p>
          
          <div className="max-w-md mx-auto">
            <HeroNewsletterSignup 
              title=""
              description=""
              theme="dark"
              size="lg"
            />
          </div>

          <p className="text-sm text-blue-200 mt-4">
            Unsubscribe anytime. We respect your privacy.
          </p>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Ready to Accelerate Your Digital Transformation?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Let's discuss how our AI-powered development solutions can transform your business. 
              Get a free consultation and custom quote in 24 hours.
            </p>
            
            <TrackedCTAButtons />

            {/* Trust Indicators */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                <div>
                  <div className="text-3xl font-bold text-gray-900">500+</div>
                  <div className="text-sm text-gray-600">Projects Delivered</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">98%</div>
                  <div className="text-sm text-gray-600">Client Satisfaction</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">24/7</div>
                  <div className="text-sm text-gray-600">Support Available</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">99.9%</div>
                  <div className="text-sm text-gray-600">Uptime SLA</div>
                </div>
              </div>
              
              <p className="text-sm text-gray-500 mt-6">
                ⭐ Rated 4.9/5 by 200+ clients • ISO 27001 Certified • SOC 2 Compliant
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Floating CTA for Conversion Optimization */}
      <StickyFloatingCTA />
    </>
  );
}