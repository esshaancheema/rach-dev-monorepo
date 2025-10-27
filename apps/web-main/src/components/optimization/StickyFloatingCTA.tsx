'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon,
  ArrowRightIcon,
  PhoneIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { useIndustryDetection } from '@/hooks/useIndustryDetection';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useAnalytics } from '@/hooks/useAnalytics';

interface StickyFloatingCTAProps {
  className?: string;
  showAfterScroll?: number;
  hideAfterTime?: number;
}

export default function StickyFloatingCTA({ 
  className,
  showAfterScroll = 800,
  hideAfterTime = 60000 // Hide after 1 minute
}: StickyFloatingCTAProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [timeOnPage, setTimeOnPage] = useState(0);
  const [exitIntentTriggered, setExitIntentTriggered] = useState(false);
  const [engagementScore, setEngagementScore] = useState(0);
  const [lastActivity, setLastActivity] = useState(Date.now());
  
  const { industry, industryContent } = useIndustryDetection();
  const { country, city, locationContent } = useGeolocation();
  const { trackEvent } = useAnalytics();

  // Track scroll position, time on page, and user engagement
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      setLastActivity(Date.now());
      
      // Increase engagement score based on scroll activity
      setEngagementScore(prev => Math.min(prev + 1, 100));
    };
    
    const handleMouseMove = () => {
      setLastActivity(Date.now());
    };

    // Exit intent detection
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !exitIntentTriggered && !isDismissed && timeOnPage > 10000) {
        setExitIntentTriggered(true);
        setIsVisible(true);
        trackEvent('exit_intent_triggered', 'engagement', 'sticky_cta', 'exit_intent', undefined, {
          time_on_page: timeOnPage,
          engagement_score: engagementScore,
          industry,
          country
        });
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [exitIntentTriggered, isDismissed, timeOnPage, engagementScore, industry, country, trackEvent]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeOnPage(prev => prev + 1000);
      
      // Check for user inactivity
      const timeSinceActivity = Date.now() - lastActivity;
      if (timeSinceActivity > 30000) { // 30 seconds of inactivity
        setEngagementScore(prev => Math.max(prev - 1, 0));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [lastActivity]);

  // Smart show/hide logic based on engagement
  useEffect(() => {
    if (isDismissed) return;

    // Show based on multiple factors: scroll, time, engagement, or exit intent
    const shouldShow = exitIntentTriggered || 
      (scrollY > showAfterScroll && timeOnPage > 5000 && engagementScore > 10) ||
      (timeOnPage > 15000 && engagementScore > 30); // High engagement users

    setIsVisible(shouldShow);

    // Auto-hide after specified time (unless high engagement)
    if (hideAfterTime && timeOnPage > hideAfterTime && engagementScore < 50) {
      setIsVisible(false);
    }
  }, [scrollY, timeOnPage, engagementScore, exitIntentTriggered, showAfterScroll, hideAfterTime, isDismissed]);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
    trackEvent('sticky_cta_dismissed', 'engagement', 'cta_interaction', 'dismiss', undefined, {
      time_on_page: timeOnPage,
      scroll_position: scrollY,
      industry,
      country
    });
  };

  const handleCTAClick = (ctaType: string) => {
    trackEvent('sticky_cta_click', 'conversion', 'floating_cta', ctaType, 1, {
      time_on_page: timeOnPage,
      scroll_position: scrollY,
      engagement_score: engagementScore,
      exit_intent_triggered: exitIntentTriggered,
      industry,
      country,
      business_hours: locationContent.supportAvailable,
      cta_variant: ctaType
    });

    if (ctaType === 'special_offer') {
      window.location.href = '/contact?offer=exit15';
    } else if (ctaType === 'industry_quote') {
      window.location.href = `/contact?industry=${industry}`;
    } else if (ctaType === 'call') {
      window.open(`tel:${locationContent.phoneNumber}`, '_self');
    } else if (ctaType === 'contact') {
      window.location.href = '/contact';
    } else if (ctaType === 'chat') {
      // Open chat widget or redirect to contact
      window.location.href = '/contact#chat';
    }
  };

  if (!isVisible || isDismissed) return null;

  // Advanced dynamic CTA content based on multiple factors
  const getPrimaryCTA = () => {
    // Exit intent gets most urgent CTA
    if (exitIntentTriggered) {
      return {
        text: 'Wait! Get 15% Off Your Project',
        action: () => handleCTAClick('special_offer'),
        icon: CalendarIcon,
        urgent: true,
        special: true
      };
    }
    
    // High engagement users get personalized offer
    if (engagementScore > 50) {
      return {
        text: `Get ${industry} Solution Quote`,
        action: () => handleCTAClick('industry_quote'),
        icon: CalendarIcon,
        urgent: true,
        special: false
      };
    }

    // Business hours - immediate contact
    if (locationContent.supportAvailable) {
      return {
        text: 'Talk to Expert Now - Online',
        action: () => handleCTAClick('call'),
        icon: PhoneIcon,
        urgent: true,
        special: false
      };
    }
    
    // Default fallback
    return {
      text: 'Get Free Consultation',
      action: () => handleCTAClick('contact'),
      icon: CalendarIcon,
      urgent: false,
      special: false
    };
  };

  // Dynamic social proof based on engagement and time
  const getSocialProofText = () => {
    const baseTexts = [
      '200+ happy clients',
      '500+ projects delivered', 
      '98% satisfaction rate',
      '24h response time'
    ];
    
    if (exitIntentTriggered) {
      return 'Join 200+ companies that chose us';
    }
    
    if (engagementScore > 40) {
      return `${industry} experts available`;
    }
    
    // Rotate based on time on page
    const index = Math.floor(timeOnPage / 10000) % baseTexts.length;
    return baseTexts[index];
  };

  const primaryCTA = getPrimaryCTA();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={cn(
          'fixed bottom-6 right-6 z-50 max-w-sm',
          'bg-white rounded-2xl shadow-2xl border border-gray-200',
          'transform transition-all duration-300',
          className
        )}
      >
        {/* Dismiss Button */}
        <button
          onClick={handleDismiss}
          className="absolute -top-2 -right-2 w-6 h-6 bg-gray-500 hover:bg-gray-600 text-white rounded-full flex items-center justify-center transition-colors"
          aria-label="Close"
        >
          <XMarkIcon className="h-3 w-3" />
        </button>

        <div className="p-6">
          {/* Urgency Indicator */}
          {primaryCTA.urgent && (
            <div className="flex items-center mb-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2" />
              <span className="text-xs font-medium text-green-600">
                Available now in {city}
              </span>
            </div>
          )}

          {/* Header */}
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900">
              Ready to Transform Your {industry !== 'default' ? industryContent.title.split(' ')[0] : 'Business'}?
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {locationContent.supportAvailable 
                ? `Our ${industry} experts are online now`
                : `Get a free consultation within 24 hours`
              }
            </p>
          </div>

          {/* Value Proposition */}
          <div className="mb-4 space-y-2">
            <div className="flex items-center text-sm text-gray-700">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2" />
              Free consultation & project estimate
            </div>
            <div className="flex items-center text-sm text-gray-700">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2" />
              {industry !== 'default' ? `${industryContent.title} experts` : 'Industry experts'}
            </div>
            <div className="flex items-center text-sm text-gray-700">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2" />
              500+ successful projects delivered
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            {/* Primary CTA */}
            <motion.button
              onClick={primaryCTA.action}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'w-full flex items-center justify-center px-4 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg',
                primaryCTA.special
                  ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white animate-pulse'
                  : primaryCTA.urgent
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              )}
            >
              <primaryCTA.icon className="h-4 w-4 mr-2" />
              {primaryCTA.text}
              <ArrowRightIcon className="h-4 w-4 ml-2" />
            </motion.button>

            {/* Secondary CTA */}
            <button
              onClick={() => handleCTAClick('chat')}
              className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
            >
              <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
              Start Chat
            </button>
          </div>

          {/* Social Proof */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center">
                <div className="flex -space-x-1 mr-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-5 h-5 bg-blue-100 border-2 border-white rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-600">
                        {String.fromCharCode(64 + i)}
                      </span>
                    </div>
                  ))}
                </div>
                <span>{getSocialProofText()}</span>
              </div>
              <div className="flex items-center">
                <ClockIcon className="h-3 w-3 mr-1" />
                <span>24h response</span>
              </div>
            </div>
          </div>
        </div>

        {/* Animated border gradient */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 opacity-75 animate-pulse -z-10" 
             style={{ padding: '2px', background: 'linear-gradient(45deg, #3B82F6, #8B5CF6, #3B82F6) border-box' }} />
      </motion.div>
    </AnimatePresence>
  );
}