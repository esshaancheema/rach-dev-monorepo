'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPinIcon, 
  ClockIcon, 
  PhoneIcon, 
  CurrencyDollarIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';
import { useGeolocation, formatLocationDisplay } from '@/hooks/useGeolocation';
import { useAnalytics } from '@/hooks/useAnalytics';
import { cn } from '@/lib/utils';

interface LocationPersonalizerProps {
  className?: string;
  showHeader?: boolean;
  compact?: boolean;
}

interface LocalizedContent {
  greeting: string;
  availabilityMessage: string;
  ctaText: string;
  contactInfo: {
    phone: string;
    email: string;
    workingHours: string;
  };
  localFeatures: string[];
  trustSignals: string[];
}

const getLocalizedContent = (
  country: string, 
  city: string, 
  isBusinessHours: boolean, 
  timezone: string
): LocalizedContent => {
  const baseContent = {
    greeting: `Hello from ${city}!`,
    availabilityMessage: isBusinessHours 
      ? `Our team is available now in ${city} (${timezone})`
      : `We'll respond within business hours in ${city} (${timezone})`,
    ctaText: isBusinessHours ? 'Talk to Us Now' : 'Schedule a Call',
    contactInfo: {
      phone: '+1 (555) 012-3456',
      email: 'contact@zoptal.com',
      workingHours: '9:00 AM - 6:00 PM'
    },
    localFeatures: [],
    trustSignals: []
  };

  // Customize content based on location
  switch (country) {
    case 'US':
      return {
        ...baseContent,
        localFeatures: [
          'SOC 2 Type II Certified',
          'GDPR & CCPA Compliant',
          'US-based development team',
          '24/7 support during business hours'
        ],
        trustSignals: [
          'Trusted by 100+ US companies',
          'Average 4.9/5 client rating',
          'ISO 27001 security certified'
        ]
      };
    
    case 'CA':
      return {
        ...baseContent,
        greeting: `Bonjour from ${city}!`,
        contactInfo: {
          ...baseContent.contactInfo,
          phone: '+1 (555) 012-3457'
        },
        localFeatures: [
          'PIPEDA compliant solutions',
          'Canadian data residency options',
          'Bilingual support (EN/FR)',
          'Local development partnerships'
        ],
        trustSignals: [
          'Serving Canadian businesses since 2020',
          'Toronto & Vancouver offices',
          'Government sector experience'
        ]
      };
    
    case 'GB':
      return {
        ...baseContent,
        greeting: `Hello from ${city}!`,
        contactInfo: {
          ...baseContent.contactInfo,
          phone: '+44 20 1234 5678',
          workingHours: '9:00 AM - 5:00 PM GMT'
        },
        localFeatures: [
          'GDPR fully compliant',
          'UK data residency',
          'ISO 27001 & Cyber Essentials',
          'Local UK development team'
        ],
        trustSignals: [
          'Working with UK enterprises since 2019',
          'London office & support',
          'Financial services expertise'
        ]
      };
    
    case 'IN':
      return {
        ...baseContent,
        greeting: `Namaste from ${city}!`,
        contactInfo: {
          ...baseContent.contactInfo,
          phone: '+91 98765 43210',
          workingHours: '9:00 AM - 6:00 PM IST'
        },
        localFeatures: [
          'Cost-effective development',
          'Round-the-clock support',
          'Indian IT compliance',
          '500+ certified developers'
        ],
        trustSignals: [
          'Top-rated Indian development company',
          'Mumbai, Bangalore & Delhi presence',
          'Startup to enterprise solutions'
        ]
      };
    
    case 'AU':
      return {
        ...baseContent,
        greeting: `G'day from ${city}!`,
        contactInfo: {
          ...baseContent.contactInfo,
          phone: '+61 2 1234 5678',
          workingHours: '9:00 AM - 5:00 PM AEST'
        },
        localFeatures: [
          'Privacy Act 1988 compliant',
          'Australian data hosting',
          'Local timezone support',
          'Government sector clearance'
        ],
        trustSignals: [
          'Trusted by Australian enterprises',
          'Sydney & Melbourne teams',
          'Mining & finance expertise'
        ]
      };
    
    default:
      return baseContent;
  }
};

export default function LocationPersonalizer({ 
  className, 
  showHeader = true, 
  compact = false 
}: LocationPersonalizerProps) {
  const { country, city, region, isLoading, locationContent } = useGeolocation();
  const { trackEvent } = useAnalytics();
  const [isVisible, setIsVisible] = useState(false);

  const localizedContent = getLocalizedContent(
    country, 
    city, 
    locationContent.businessHours.isBusinessHours,
    locationContent.businessHours.timezone
  );

  const handleLocationCTAClick = () => {
    trackEvent('location_cta_click', 'conversion', 'location_personalizer', localizedContent.ctaText, 1, {
      country,
      city,
      timezone: locationContent.businessHours.timezone,
      business_hours: locationContent.supportAvailable,
      cta_text: localizedContent.ctaText
    });

    if (locationContent.supportAvailable) {
      window.open(`tel:${locationContent.phoneNumber}`, '_self');
    } else {
      window.location.href = '/contact';
    }
  };

  useEffect(() => {
    if (!isLoading) {
      // Delay to create a nice entrance animation
      const timer = setTimeout(() => setIsVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className={cn('animate-pulse', className)}>
        <div className="bg-gray-200 h-32 rounded-lg"></div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className={cn(
            'bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm',
            compact ? 'p-4' : 'p-6',
            className
          )}
        >
          {showHeader && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex items-center mb-4"
            >
              <MapPinIcon className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {localizedContent.greeting}
                </h3>
                <p className="text-sm text-gray-600">
                  {formatLocationDisplay({ country, city, region, timezone: locationContent.businessHours.timezone, isLoading: false, error: null })}
                </p>
              </div>
            </motion.div>
          )}

          <div className={cn(
            'grid gap-4',
            compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'
          )}>
            {/* Availability Status */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="flex items-center p-3 bg-white/60 rounded-lg"
            >
              <div className={cn(
                'flex items-center justify-center w-8 h-8 rounded-full mr-3',
                locationContent.supportAvailable
                  ? 'bg-green-100 text-green-600'
                  : 'bg-orange-100 text-orange-600'
              )}>
                <ClockIcon className="h-4 w-4" />
              </div>
              <div>
                <p className={cn(
                  'text-sm font-medium',
                  locationContent.supportAvailable ? 'text-green-800' : 'text-orange-800'
                )}>
                  {locationContent.supportAvailable ? 'Available Now' : 'Available Soon'}
                </p>
                <p className="text-xs text-gray-600">
                  {localizedContent.availabilityMessage}
                </p>
              </div>
            </motion.div>

            {/* Local Contact Info */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="flex items-center p-3 bg-white/60 rounded-lg"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 mr-3">
                <PhoneIcon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {locationContent.phoneNumber}
                </p>
                <p className="text-xs text-gray-600">
                  {localizedContent.contactInfo.workingHours}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Local Features */}
          {!compact && localizedContent.localFeatures.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mt-4"
            >
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                Local Advantages:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {localizedContent.localFeatures.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + (index * 0.1), duration: 0.3 }}
                    className="flex items-center text-sm text-gray-700"
                  >
                    <CheckCircleIcon className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                    {feature}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Trust Signals */}
          {!compact && localizedContent.trustSignals.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="mt-4 pt-4 border-t border-blue-200"
            >
              <div className="flex flex-wrap gap-2">
                {localizedContent.trustSignals.map((signal, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + (index * 0.1), duration: 0.3 }}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {signal}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="mt-4 pt-4 border-t border-blue-200"
          >
            <button 
              onClick={handleLocationCTAClick}
              className={cn(
              'w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200',
              compact ? 'py-2' : 'py-3'
            )}>
              {localizedContent.ctaText}
              {locationContent.supportAvailable && (
                <div className="ml-2 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              )}
            </button>
          </motion.div>

          {/* Currency & Pricing Note */}
          {locationContent.currency !== 'USD' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0, duration: 0.5 }}
              className="mt-2 flex items-center justify-center text-xs text-gray-500"
            >
              <CurrencyDollarIcon className="h-3 w-3 mr-1" />
              Pricing available in {locationContent.currency}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}