'use client';

import { useAnalytics } from '@/hooks/useAnalytics';
import { useIndustryDetection } from '@/hooks/useIndustryDetection';
import { useGeolocation } from '@/hooks/useGeolocation';

interface TrackedCTAButtonsProps {
  className?: string;
}

export default function TrackedCTAButtons({ className }: TrackedCTAButtonsProps) {
  const { trackEvent } = useAnalytics();
  const { industry } = useIndustryDetection();
  const { country, city } = useGeolocation();

  const handlePrimaryCTAClick = () => {
    trackEvent('homepage_bottom_cta_primary', 'conversion', 'bottom_cta_section', 'Start Your Project Today', 1, {
      industry,
      country,
      city,
      cta_type: 'primary',
      position: 'bottom',
      section: 'final_cta'
    });
    window.location.href = '/contact';
  };

  const handleSecondaryCTAClick = () => {
    trackEvent('homepage_bottom_cta_secondary', 'engagement', 'bottom_cta_section', 'View Pricing Plans', 1, {
      industry,
      country,
      city,
      cta_type: 'secondary',
      position: 'bottom',
      section: 'final_cta'
    });
    window.location.href = '/pricing';
  };

  return (
    <div className={`flex flex-col sm:flex-row gap-4 justify-center ${className}`}>
      <button
        onClick={handlePrimaryCTAClick}
        className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
      >
        Start Your Project Today
        <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </button>
      
      <button
        onClick={handleSecondaryCTAClick}
        className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-blue-600 bg-white border-2 border-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
      >
        View Pricing Plans
      </button>
    </div>
  );
}