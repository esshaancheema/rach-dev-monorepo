import { Metadata } from 'next';
import HeroSection from '@/components/homepage/HeroSection';
import ServicesOverview from '@/components/homepage/ServicesOverview';
import SocialProofSection from '@/components/homepage/SocialProofSection';
import PricingPreview from '@/components/homepage/PricingPreview';
import { HeroNewsletterSignup } from '@/components/newsletter/NewsletterSignup';
import { createMetadata } from '@/lib/seo/metadata';
import { generateOrganizationSchema, generateWebsiteSchema } from '@/lib/seo/schemas';
import MainLayout from '@/components/layout/MainLayout';

// Generate metadata for the homepage
export const metadata: Metadata = createMetadata({
  title: 'AI-Powered Software Development | Custom Solutions | Zoptal',
  description: 'Transform your business with AI-powered software development. Custom enterprise solutions, mobile apps, and AI agents. 500+ projects delivered. Get started today.',
  path: '/',
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
  ]
});

export default function HomePage() {
  // Generate structured data
  const organizationSchema = generateOrganizationSchema({
    name: 'Zoptal',
    description: 'Leading software development company specializing in AI-powered solutions, custom enterprise applications, and digital transformation services.',
    url: 'https://zoptal.com',
    logo: 'https://zoptal.com/images/logo.png',
    telephone: '+1-555-012-3456',
    email: 'contact@zoptal.com',
    address: {
      streetAddress: '123 Tech Street',
      addressLocality: 'San Francisco',
      addressRegion: 'CA',
      postalCode: '94105',
      addressCountry: 'US'
    },
    sameAs: [
      'https://twitter.com/zoptal',
      'https://linkedin.com/company/zoptal',
      'https://github.com/zoptal'
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
    <MainLayout showHeader={true} showFooter={true}>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([organizationSchema, websiteSchema])
        }}
      />

      {/* Hero Section */}
      <HeroSection 
        variant="default"
        className="relative"
      />

      {/* Services Overview */}
      <ServicesOverview 
        variant="grid"
        showPricing={true}
        maxServices={6}
        className="relative z-10"
      />

      {/* Social Proof & Testimonials */}
      <SocialProofSection 
        variant="carousel"
        showLogos={true}
        showStats={true}
        className="relative z-10"
      />

      {/* Pricing Preview */}
      <PricingPreview 
        variant="compact"
        className="relative z-10"
      />

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
          
          <HeroNewsletterSignup 
            variant="inline"
            className="max-w-md mx-auto"
          />
          
          <div className="mt-6 text-sm text-blue-200">
            ✓ No spam, ever  ✓ Unsubscribe anytime  ✓ Industry insights & trends
          </div>
        </div>
      </section>
    </MainLayout>
  );
}