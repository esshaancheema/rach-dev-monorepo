'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDownIcon,
  BuildingOfficeIcon,
  HeartIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  TruckIcon,
  AcademicCapIcon,
  HomeModernIcon,
  WrenchScrewdriverIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { useIndustryDetection, setUserIndustry, getAllIndustries } from '@/hooks/useIndustryDetection';
import { useABTesting } from '@/hooks/useABTesting';
import { useAnalytics } from '@/hooks/useAnalytics';
import { cn } from '@/lib/utils';

interface IndustrySelectorProps {
  className?: string;
  onIndustryChange?: (industry: string) => void;
  showDetectedBadge?: boolean;
  compact?: boolean;
}

const industryIcons: Record<string, any> = {
  'healthcare': HeartIcon,
  'fintech': CurrencyDollarIcon,
  'ecommerce': ShoppingBagIcon,
  'logistics': TruckIcon,
  'education': AcademicCapIcon,
  'real-estate': HomeModernIcon,
  'manufacturing': WrenchScrewdriverIcon,
  'default': BuildingOfficeIcon
};

export default function IndustrySelector({ 
  className, 
  onIndustryChange,
  showDetectedBadge = true,
  compact = false 
}: IndustrySelectorProps) {
  const { industry, confidence, detectionMethod, industryContent } = useIndustryDetection();
  const { variant: selectorVariant, trackConversion } = useABTesting('industry_selector_ui');
  const { trackEvent } = useAnalytics();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState(industry);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const availableIndustries = getAllIndustries();
  const IconComponent = industryIcons[selectedIndustry] || industryIcons.default;

  // A/B test configuration for industry selector UI variants
  const selectorConfig = selectorVariant?.config || {
    showDescriptions: true,
    showIcons: true,
    highlightDetected: true,
    confirmationStyle: 'toast'
  };

  useEffect(() => {
    setSelectedIndustry(industry);
  }, [industry]);

  const handleIndustrySelect = (industryKey: string) => {
    // Track industry selection event
    trackEvent('industry_selector_change', 'engagement', 'industry_selection', industryKey, 1, {
      previous_industry: selectedIndustry,
      new_industry: industryKey,
      detection_method: detectionMethod,
      confidence: confidence,
      ui_variant: selectorVariant?.id || 'default',
      selector_config: selectorConfig
    });

    // Track conversion for industry personalization
    trackConversion('industry_personalization', 1, {
      industry: industryKey,
      variant: selectorVariant?.id || 'default',
      was_detected: detectionMethod !== 'default',
      confidence
    });

    setSelectedIndustry(industryKey);
    setUserIndustry(industryKey);
    setIsOpen(false);
    setShowConfirmation(true);
    
    // Hide confirmation after 3 seconds
    setTimeout(() => setShowConfirmation(false), 3000);
    
    if (onIndustryChange) {
      onIndustryChange(industryKey);
    }
  };

  const getDetectionLabel = () => {
    switch (detectionMethod) {
      case 'url': return 'Detected from URL';
      case 'referrer': return 'Detected from referrer';
      case 'storage': return 'Previously selected';
      default: return 'Default selection';
    }
  };

  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.8) return 'text-green-600 bg-green-100';
    if (conf >= 0.5) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  return (
    <div className={cn('relative', className)}>
      {/* Industry Selector Dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'w-full flex items-center justify-between px-4 py-3 text-left bg-white border border-gray-300 rounded-lg shadow-sm hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
            compact ? 'py-2 text-sm' : 'py-3'
          )}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <div className="flex items-center">
            {selectorConfig.showIcons && (
              <IconComponent className={cn(
                'text-gray-500 mr-3',
                compact ? 'h-4 w-4' : 'h-5 w-5'
              )} />
            )}
            <div>
              <div className={cn(
                'font-medium text-gray-900',
                compact ? 'text-sm' : 'text-base'
              )}>
                {industryContent.title}
              </div>
              {!compact && selectorConfig.showDescriptions && (
                <div className="text-sm text-gray-500 mt-0.5">
                  {industryContent.description.length > 60 
                    ? `${industryContent.description.substring(0, 60)}...`
                    : industryContent.description
                  }
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center">
            {showDetectedBadge && selectorConfig.highlightDetected && confidence > 0.5 && detectionMethod !== 'default' && (
              <span className={cn(
                'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mr-2',
                getConfidenceColor(confidence)
              )}>
                {getDetectionLabel()}
              </span>
            )}
            <ChevronDownIcon 
              className={cn(
                'text-gray-400 transition-transform',
                compact ? 'h-4 w-4' : 'h-5 w-5',
                isOpen ? 'rotate-180' : ''
              )} 
            />
          </div>
        </button>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-auto"
              role="listbox"
            >
              {/* Default Option */}
              <button
                onClick={() => handleIndustrySelect('default')}
                className={cn(
                  'w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between group',
                  selectedIndustry === 'default' ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                )}
                role="option"
                aria-selected={selectedIndustry === 'default'}
              >
                <div className="flex items-center">
                  <BuildingOfficeIcon className="h-5 w-5 text-gray-500 mr-3 group-hover:text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900">General Business</div>
                    <div className="text-sm text-gray-500">Custom solutions for any industry</div>
                  </div>
                </div>
                {selectedIndustry === 'default' && (
                  <CheckIcon className="h-4 w-4 text-blue-600" />
                )}
              </button>

              <div className="border-t border-gray-200"></div>

              {/* Industry Options */}
              {availableIndustries.map((industryOption) => {
                const OptionIcon = industryIcons[industryOption.key] || industryIcons.default;
                const isSelected = selectedIndustry === industryOption.key;
                
                return (
                  <button
                    key={industryOption.key}
                    onClick={() => handleIndustrySelect(industryOption.key)}
                    className={cn(
                      'w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between group',
                      isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    )}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <div className="flex items-center">
                      {selectorConfig.showIcons && (
                        <OptionIcon className="h-5 w-5 text-gray-500 mr-3 group-hover:text-blue-600" />
                      )}
                      <div>
                        <div className="font-medium text-gray-900">{industryOption.title}</div>
                        {selectorConfig.showDescriptions && (
                          <div className="text-sm text-gray-500">
                            {industryOption.description.length > 50
                              ? `${industryOption.description.substring(0, 50)}...`
                              : industryOption.description
                            }
                          </div>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <CheckIcon className="h-4 w-4 text-blue-600" />
                    )}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Confirmation Toast */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center"
          >
            <CheckIcon className="h-5 w-5 mr-2" />
            <div>
              <div className="font-medium">Industry Updated!</div>
              <div className="text-sm text-green-100">
                Content personalized for {industryContent.title}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside handler */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}