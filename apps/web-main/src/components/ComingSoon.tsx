import Link from 'next/link';
import { ArrowLeftIcon, ClockIcon } from '@heroicons/react/24/outline';
import { MainLayout } from './layout';
import { SEOHead, AIMetaTags } from './seo';

interface ComingSoonProps {
  title: string;
  description: string;
  estimatedDate?: string;
  showBackButton?: boolean;
  backUrl?: string;
  backText?: string;
  canonicalUrl?: string;
  keywords?: string[];
  contentType?: 'service' | 'location' | 'article' | 'product' | 'company';
  location?: {
    city: string;
    country: string;
    region?: string;
  };
  service?: string;
}

export default function ComingSoon({ 
  title, 
  description,
  estimatedDate = "Soon",
  showBackButton = true,
  backUrl = "/",
  backText = "Return Home",
  canonicalUrl,
  keywords = [],
  contentType = "service",
  location,
  service
}: ComingSoonProps) {
  return (
    <>
      <SEOHead
        title={`${title} - Coming Soon`}
        description={`${description} This feature is under development and will be available soon.`}
        canonicalUrl={canonicalUrl}
        keywords={[...keywords, 'coming soon', 'under development', 'launching soon']}
        type={contentType}
        location={location}
        service={service}
        noindex={true} // Don't index coming soon pages
      />
      
      <AIMetaTags
        title={`${title} - Coming Soon`}
        description={`${description} Feature under development.`}
        keywords={[...keywords, 'coming soon', 'under development']}
        contentType={contentType}
        location={location}
        services={service ? [service] : []}
        aiContext={`This is a coming soon page for ${title}. ${description} The feature is currently under development and will be available ${estimatedDate}.`}
      />
      
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Coming Soon Icon */}
            <div className="mb-8">
              <div className="mx-auto w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center">
                <ClockIcon className="w-12 h-12 text-primary-600" />
              </div>
            </div>

            {/* Main Content */}
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                {title}
              </h1>
              
              <p className="text-xl sm:text-2xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
                {description}
              </p>
              
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 max-w-md mx-auto">
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Coming {estimatedDate}
                </p>
                <p className="text-gray-600 text-sm">
                  We're working hard to bring you this feature. Stay tuned for updates!
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center">
              {showBackButton && (
                <Link 
                  href={backUrl}
                  className="inline-flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                  <span>{backText}</span>
                </Link>
              )}
              
              <Link 
                href="/contact"
                className="inline-flex items-center space-x-2 bg-white text-primary-600 px-6 py-3 rounded-lg border border-primary-200 hover:bg-primary-50 transition-colors font-medium"
              >
                <span>Get Notified</span>
              </Link>
            </div>

            {/* Newsletter Signup */}
            <div className="mt-16 bg-white rounded-lg p-8 shadow-sm border border-gray-200 max-w-lg mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Be the first to know
              </h3>
              <p className="text-gray-600 mb-4 text-sm">
                Subscribe to get notified when this feature launches
              </p>
              <form className="flex space-x-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm placeholder-gray-500 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400"
                />
                <button
                  type="submit"
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                >
                  Notify Me
                </button>
              </form>
            </div>

            {/* Additional Info */}
            <div className="mt-12 text-center">
              <p className="text-gray-500 text-sm">
                Questions? {' '}
                <Link 
                  href="/contact" 
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Contact our team
                </Link>
                {' '} for more information.
              </p>
            </div>
          </div>
        </div>
      </MainLayout>
    </>
  );
}