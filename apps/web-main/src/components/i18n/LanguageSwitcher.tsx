'use client';

import { useState, useRef, useEffect } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { ChevronDownIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'inline' | 'compact';
  showFlag?: boolean;
  showProgress?: boolean;
  className?: string;
}

export default function LanguageSwitcher({
  variant = 'dropdown',
  showFlag = true,
  showProgress = false,
  className = ''
}: LanguageSwitcherProps) {
  const { 
    locale, 
    localeConfig, 
    supportedLocales, 
    switchLocale, 
    completeness,
    t 
  } = useI18n();
  
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get flag emoji for locale
  const getFlagEmoji = (localeCode: string): string => {
    const flagMap: Record<string, string> = {
      'en': '🇺🇸',
      'es': '🇪🇸',
      'fr': '🇫🇷',
      'de': '🇩🇪',
      'zh': '🇨🇳',
      'ar': '🇸🇦',
      'hi': '🇮🇳',
    };
    return flagMap[localeCode] || '🌐';
  };

  // Get completion status color
  const getCompletionColor = (completion: number): string => {
    if (completion >= 95) return 'text-green-500';
    if (completion >= 80) return 'text-yellow-500';
    if (completion >= 60) return 'text-orange-500';
    return 'text-red-500';
  };

  const handleLocaleChange = (newLocale: string) => {
    switchLocale(newLocale);
    setIsOpen(false);
  };

  if (variant === 'inline') {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {supportedLocales.map((loc) => (
          <button
            key={loc.code}
            onClick={() => handleLocaleChange(loc.code)}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              locale === loc.code
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {showFlag && <span className="mr-1">{getFlagEmoji(loc.code)}</span>}
            {loc.name}
          </button>
        ))}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-1 px-2 py-1 rounded-md text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          aria-label={t('nav.language')}
        >
          {showFlag ? (
            <span className="text-lg">{getFlagEmoji(locale)}</span>
          ) : (
            <GlobeAltIcon className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">{localeConfig.code.toUpperCase()}</span>
          <ChevronDownIcon className="h-3 w-3" />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-1 py-1 bg-white rounded-md shadow-lg border z-50 min-w-[120px]">
            {supportedLocales.map((loc) => {
              const localeCompleteness = getCompletionPercentage(loc.code);
              return (
                <button
                  key={loc.code}
                  onClick={() => handleLocaleChange(loc.code)}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors flex items-center justify-between ${
                    locale === loc.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {showFlag && <span>{getFlagEmoji(loc.code)}</span>}
                    <span>{loc.code.toUpperCase()}</span>
                  </div>
                  {showProgress && localeCompleteness < 100 && (
                    <span className={`text-xs ${getCompletionColor(localeCompleteness)}`}>
                      {localeCompleteness}%
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Default dropdown variant
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={t('nav.language')}
      >
        {showFlag && (
          <span className="text-lg">{getFlagEmoji(locale)}</span>
        )}
        <span className="font-medium">{localeConfig.name}</span>
        <ChevronDownIcon className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 top-full mt-1 py-1 bg-white rounded-md shadow-lg border z-50 min-w-[200px]"
          role="listbox"
        >
          {supportedLocales.map((loc) => {
            const localeCompleteness = getCompletionPercentage(loc.code);
            const isSelected = locale === loc.code;
            
            return (
              <button
                key={loc.code}
                onClick={() => handleLocaleChange(loc.code)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors ${
                  isSelected ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                }`}
                role="option"
                aria-selected={isSelected}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {showFlag && (
                      <span className="text-lg">{getFlagEmoji(loc.code)}</span>
                    )}
                    <div>
                      <div className="font-medium">{loc.name}</div>
                      {loc.region && (
                        <div className="text-xs text-gray-500">{loc.region}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {showProgress && (
                      <div className="text-right">
                        <div className={`text-xs ${getCompletionColor(localeCompleteness)}`}>
                          {localeCompleteness}%
                        </div>
                        {localeCompleteness < 100 && (
                          <div className="w-12 bg-gray-200 rounded-full h-1 mt-1">
                            <div 
                              className={`h-1 rounded-full ${
                                localeCompleteness >= 95 ? 'bg-green-500' :
                                localeCompleteness >= 80 ? 'bg-yellow-500' :
                                localeCompleteness >= 60 ? 'bg-orange-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${localeCompleteness}%` }}
                            />
                          </div>
                        )}
                      </div>
                    )}
                    
                    {isSelected && (
                      <div className="text-blue-600">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
          
          {/* Translation help link */}
          <div className="border-t border-gray-200 mt-1 pt-1 px-4 py-2">
            <a
              href="https://github.com/zoptal/translations"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              Help us translate →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to get completion percentage for a locale
function getCompletionPercentage(localeCode: string): number {
  // This would typically be imported from the translations module
  // For now, we'll simulate completion percentages
  const completionMap: Record<string, number> = {
    'en': 100,
    'es': 95,
    'fr': 90,
    'de': 88,
    'zh': 75,
    'ar': 60,
    'hi': 55,
  };
  
  return completionMap[localeCode] || 0;
}

// Automatic locale detection banner
export function LocaleDetectionBanner() {
  const { locale, switchLocale, t } = useI18n();
  const [suggestedLocale, setSuggestedLocale] = useState<string | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Only show for users who haven't explicitly chosen a locale
    const hasChosenLocale = localStorage.getItem('locale-chosen');
    if (hasChosenLocale) return;

    // Detect browser language
    const browserLang = navigator.language.split('-')[0];
    const supportedCodes = ['es', 'fr', 'de', 'zh', 'ar', 'hi'];
    
    if (supportedCodes.includes(browserLang) && browserLang !== locale) {
      setSuggestedLocale(browserLang);
      setShowBanner(true);
    }
  }, [locale]);

  const handleAccept = () => {
    if (suggestedLocale) {
      switchLocale(suggestedLocale);
      localStorage.setItem('locale-chosen', 'true');
    }
    setShowBanner(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('locale-chosen', 'true');
    setShowBanner(false);
  };

  if (!showBanner || !suggestedLocale) return null;

  const suggestedConfig = supportedLocales.find(l => l.code === suggestedLocale);
  if (!suggestedConfig) return null;

  return (
    <div className="bg-blue-600 text-white py-2 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <GlobeAltIcon className="h-5 w-5" />
          <span className="text-sm">
            We noticed you might prefer {suggestedConfig.name}. Would you like to switch?
          </span>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleAccept}
            className="text-sm font-medium bg-white text-blue-600 px-3 py-1 rounded hover:bg-gray-100 transition-colors"
          >
            Switch to {suggestedConfig.name}
          </button>
          <button
            onClick={handleDismiss}
            className="text-sm text-blue-200 hover:text-white transition-colors"
          >
            Keep English
          </button>
        </div>
      </div>
    </div>
  );
}