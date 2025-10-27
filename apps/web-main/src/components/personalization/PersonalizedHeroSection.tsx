'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SparklesIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  PlayIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { HeroImage } from '@/components/ui/OptimizedImage';
import { useIndustryDetection } from '@/hooks/useIndustryDetection';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useABTesting } from '@/hooks/useABTesting';
import { useAnalytics } from '@/hooks/useAnalytics';
import LocationPersonalizer from './LocationPersonalizer';
import IndustrySelector from './IndustrySelector';
import AppIdeaInput from '@/components/interactive-hero/AppIdeaInput';

interface PersonalizedHeroSectionProps {
  className?: string;
}

export default function PersonalizedHeroSection({ className }: PersonalizedHeroSectionProps) {
  const { industry, industryContent, isLoading: industryLoading } = useIndustryDetection();
  const { country, city, locationContent, isLoading: locationLoading } = useGeolocation();
  const { variant: ctaVariant, trackConversion } = useABTesting('homepage_hero_cta');
  const { trackEvent, trackClick } = useAnalytics();
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);
  const [showLocationBanner, setShowLocationBanner] = useState(true);

  const isLoading = industryLoading || locationLoading;

  // Rotate through industry features
  useEffect(() => {
    if (industryContent.features.length > 1) {
      const interval = setInterval(() => {
        setCurrentFeatureIndex(prev => (prev + 1) % industryContent.features.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [industryContent.features]);

  const handleIdeaSubmit = async (idea: string) => {
    // Track AI app builder start conversion
    trackEvent('ai_app_builder_start', 'conversion', 'hero_cta', idea.substring(0, 50), 1, {
      industry,
      country,
      variant: ctaVariant?.id || 'default',
      idea_length: idea.length
    });
    
    // Track A/B test conversion
    trackConversion('app_builder_start', 1, {
      idea: idea.substring(0, 100),
      industry,
      country
    });

    const encodedIdea = encodeURIComponent(idea);
    // Redirect to dashboard guest page with prompt parameter
    window.location.href = `${process.env.NODE_ENV === 'production' ? 'https://dashboard.zoptal.com' : 'http://localhost:3001'}/guest?prompt=${encodedIdea}`;
  };

  const ctaConfig = ctaVariant?.config || {
    ctaText: 'Start Your Project Today',
    ctaStyle: 'primary',
    ctaSize: 'lg'
  };

  // Enhanced CTA text based on location and industry
  const getLocalizedCTAText = () => {
    if (locationContent.supportAvailable) {
      return ctaConfig.ctaText.replace('Today', 'Now - We\'re Online');
    }
    return ctaConfig.ctaText;
  };

  // CTA click handlers with comprehensive tracking
  const handlePrimaryCTAClick = () => {
    trackEvent('hero_primary_cta_click', 'conversion', 'cta_button', getLocalizedCTAText(), 1, {
      industry,
      country,
      variant: ctaVariant?.id || 'default',
      business_hours: locationContent.supportAvailable,
      cta_text: getLocalizedCTAText()
    });

    trackConversion('contact_intent', 1, {
      source: 'hero_primary_cta',
      industry,
      country
    });

    // Navigate to contact page
    window.location.href = '/contact';
  };

  const handleSecondaryTAClick = () => {
    trackEvent('hero_demo_cta_click', 'engagement', 'cta_button', 'Watch Demo', undefined, {
      industry,
      country,
      variant: ctaVariant?.id || 'default'
    });

    trackConversion('demo_request', 1, {
      source: 'hero_secondary_cta',
      industry,
      country
    });

    // For now, scroll to service showcase or open demo modal
    // In future, could open actual demo video
    const serviceSection = document.querySelector('[data-section="services"]');
    if (serviceSection) {
      serviceSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLocationBannerClose = () => {
    setShowLocationBanner(false);
    trackEvent('location_banner_closed', 'engagement', 'banner_interaction', `${city}, ${country}`, undefined, {
      industry,
      country
    });
  };

  if (isLoading) {
    return (
      <section className={cn('bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-20 lg:py-32', className)}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-6"></div>
            <div className="h-16 bg-gray-200 rounded w-full mb-8"></div>
            <div className="h-6 bg-gray-200 rounded w-2/3 mx-auto mb-8"></div>
            <div className="h-12 bg-gray-200 rounded w-48 mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={cn(
      'relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50',
      className
    )}>
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-pulse-slow" />
        <div className="absolute top-40 right-20 w-40 h-40 bg-indigo-500/10 rounded-full blur-xl animate-pulse-slow" />
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-purple-500/10 rounded-full blur-xl animate-pulse-slow" />
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      </div>

      {/* Location Banner */}
      <AnimatePresence>
        {showLocationBanner && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="relative z-10 bg-blue-600 text-white py-2"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm">
                  <SparklesIcon className="h-4 w-4 mr-2" />
                  Welcome from {city}! We've personalized your experience for {industryContent.title.toLowerCase()}.
                </div>
                <button
                  onClick={handleLocationBannerClose}
                  className="text-blue-200 hover:text-white transition-colors"
                  aria-label="Close banner"
                >
                  ×
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div>
            {/* Industry Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-6"
            >
              <SparklesIcon className="h-4 w-4 mr-2" />
              Specialized for {industryContent.title}
            </motion.div>

            {/* Dynamic Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-gray-900"
            >
              Transform Your{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {industry === 'default' ? 'Business' : industryContent.title.split(' ')[0]}
              </span>{' '}
              with AI-Powered Solutions
            </motion.h1>

            {/* Industry-Specific Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl lg:text-2xl mb-8 leading-relaxed text-gray-600"
            >
              {industryContent.description}
            </motion.p>

            {/* Rotating Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-8 h-8"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentFeatureIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                  className="flex items-center text-lg font-medium text-blue-600"
                >
                  <CheckCircleIcon className="h-5 w-5 mr-2 text-green-500" />
                  {industryContent.features[currentFeatureIndex]}
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* App Idea Input */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-8"
            >
              <AppIdeaInput 
                onSubmit={handleIdeaSubmit}
                placeholder={`Describe your ${industry === 'default' ? 'business' : industry} solution idea...`}
              />
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 mb-8"
            >
              <button 
                onClick={handlePrimaryCTAClick}
                className={cn(
                  'inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]',
                  ctaConfig.ctaSize === 'lg' ? 'px-8 py-4' : 'px-6 py-3',
                  ctaConfig.ctaStyle === 'primary'
                    ? 'text-white bg-blue-600 hover:bg-blue-700'
                    : 'text-blue-600 bg-white border-2 border-blue-600 hover:bg-blue-50'
                )}
              >
                {getLocalizedCTAText()}
                <ArrowRightIcon className="ml-2 h-5 w-5" />
                {locationContent.supportAvailable && (
                  <div className="ml-2 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                )}
              </button>
              
              <button 
                onClick={handleSecondaryTAClick}
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-blue-600 bg-white border-2 border-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
              >
                <PlayIcon className="mr-2 h-5 w-5" />
                Watch Demo
              </button>
            </motion.div>

            {/* Industry Testimonials */}
            {industryContent.testimonials.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white/60 rounded-lg p-4 border border-blue-100"
              >
                <div className="flex items-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                  <span className="ml-2 text-sm font-medium text-gray-700">5.0</span>
                </div>
                <blockquote className="text-sm text-gray-700 italic mb-2">
                  "{industryContent.testimonials[0].quote}"
                </blockquote>
                <cite className="text-xs text-gray-500 not-italic">
                  — {industryContent.testimonials[0].name}, {industryContent.testimonials[0].role} at {industryContent.testimonials[0].company}
                </cite>
              </motion.div>
            )}
          </div>

          {/* Right Column - Interactive Elements */}
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="space-y-6"
            >
              {/* Location Personalizer */}
              <LocationPersonalizer className="mb-6" />

              {/* Industry Selector */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Industry Focus
                </h3>
                <IndustrySelector 
                  showDetectedBadge={true}
                  onIndustryChange={(newIndustry) => {
                    console.log('Industry changed to:', newIndustry);
                  }}
                />
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Why choose us for {industryContent.title.toLowerCase()}:
                  </h4>
                  <div className="space-y-1">
                    {industryContent.features.slice(0, 3).map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        <CheckCircleIcon className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Case Studies Preview */}
              {industryContent.caseStudies.length > 0 && (
                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Success Stories
                  </h3>
                  <div className="space-y-3">
                    {industryContent.caseStudies.slice(0, 2).map((caseStudy, index) => (
                      <div key={index} className="flex items-center p-3 bg-blue-50 rounded-lg">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <CheckCircleIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900 capitalize">
                            {caseStudy.replace('-', ' ')} Success
                          </div>
                          <div className="text-xs text-gray-500">
                            View case study →
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom Divider */}
      <div className="absolute bottom-0 left-0 w-full">
        <svg
          viewBox="0 0 1440 58"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
        >
          <path
            d="M0 0L1440 0V58C1440 58 1200 20 720 20C240 20 0 58 0 58V0Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
}