'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';

interface Language {
  code: string;
  name: string;
  flag: string;
  native: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸', native: 'English' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸', native: 'Español' },
  { code: 'fr', name: 'French', flag: '🇫🇷', native: 'Français' },
  { code: 'de', name: 'German', flag: '🇩🇪', native: 'Deutsch' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦', native: 'العربية' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳', native: 'हिन्दी' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳', native: '中文' }
];

interface LanguageSelectorProps {
  className?: string;
  variant?: 'desktop' | 'mobile';
}

export function LanguageSelector({ className = '', variant = 'desktop' }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<Language>(languages[0]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  // Detect current language from URL or localStorage
  useEffect(() => {
    const detectLanguage = () => {
      // Check if URL has language prefix
      const pathSegments = pathname.split('/');
      const possibleLangCode = pathSegments[1];
      
      const langFromUrl = languages.find(lang => lang.code === possibleLangCode);
      if (langFromUrl) {
        setCurrentLanguage(langFromUrl);
        return;
      }

      // Check localStorage
      const savedLang = localStorage.getItem('preferred-language');
      if (savedLang) {
        const langFromStorage = languages.find(lang => lang.code === savedLang);
        if (langFromStorage) {
          setCurrentLanguage(langFromStorage);
          return;
        }
      }

      // Default to browser language if available
      const browserLang = navigator.language.split('-')[0];
      const langFromBrowser = languages.find(lang => lang.code === browserLang);
      if (langFromBrowser) {
        setCurrentLanguage(langFromBrowser);
        return;
      }

      // Fallback to English
      setCurrentLanguage(languages[0]);
    };

    detectLanguage();
  }, [pathname]);

  const handleLanguageChange = (language: Language) => {
    setCurrentLanguage(language);
    setIsOpen(false);
    
    // Save to localStorage
    localStorage.setItem('preferred-language', language.code);
    
    // Trigger language change event for analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'language_change', {
        language: language.code,
        previous_language: currentLanguage.code
      });
    }

    // Update URL if using i18n routing
    const pathSegments = pathname.split('/');
    const hasLangInUrl = languages.some(lang => lang.code === pathSegments[1]);
    
    let newPath = pathname;
    if (hasLangInUrl) {
      pathSegments[1] = language.code;
      newPath = pathSegments.join('/');
    } else {
      newPath = `/${language.code}${pathname}`;
    }
    
    // Don't navigate if it's the same language
    if (language.code !== currentLanguage.code) {
      router.push(newPath);
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  if (variant === 'mobile') {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={toggleDropdown}
          className="flex items-center space-x-3 w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <GlobeAltIcon className="w-5 h-5 text-gray-500" />
          <span className="flex-1 font-medium">{currentLanguage.native}</span>
          <ChevronDownIcon
            className={`w-4 h-4 text-gray-400 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="mt-2 py-2 bg-white rounded-lg shadow-lg border border-gray-200"
            >
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language)}
                  className={`flex items-center space-x-3 w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors ${
                    currentLanguage.code === language.code 
                      ? 'bg-primary-50 text-primary-700' 
                      : 'text-gray-700'
                  }`}
                >
                  <span className="text-lg">{language.flag}</span>
                  <div>
                    <div className="font-medium">{language.native}</div>
                    <div className="text-sm text-gray-500">{language.name}</div>
                  </div>
                  {currentLanguage.code === language.code && (
                    <div className="ml-auto">
                      <div className="w-2 h-2 bg-primary-500 rounded-full" />
                    </div>
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Select language"
      >
        <span className="text-base">{currentLanguage.flag}</span>
        <span className="hidden sm:inline">{currentLanguage.code.toUpperCase()}</span>
        <ChevronDownIcon
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
            role="menu"
            aria-orientation="vertical"
          >
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language)}
                className={`flex items-center space-x-3 w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                  currentLanguage.code === language.code 
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-gray-700'
                }`}
                role="menuitem"
              >
                <span className="text-lg">{language.flag}</span>
                <div className="flex-1">
                  <div className="font-medium">{language.native}</div>
                  <div className="text-xs text-gray-500">{language.name}</div>
                </div>
                {currentLanguage.code === language.code && (
                  <div className="w-2 h-2 bg-primary-500 rounded-full" />
                )}
              </button>
            ))}
            
            <div className="border-t border-gray-100 mt-1 pt-1">
              <div className="px-4 py-2 text-xs text-gray-500">
                More languages coming soon
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default LanguageSelector;