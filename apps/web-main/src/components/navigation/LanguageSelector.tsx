'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronDownIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { 
  SUPPORTED_LOCALES, 
  DEFAULT_LOCALE, 
  getLocalizedUrl, 
  getPathWithoutLocale,
  extractLocaleFromPath,
  getLanguageName 
} from '@/lib/seo/hreflang';

interface LanguageSelectorProps {
  className?: string;
  variant?: 'dropdown' | 'inline';
  showFlags?: boolean;
}

const LOCALE_FLAGS: Record<string, string> = {
  en: '🇺🇸',
  es: '🇪🇸', 
  fr: '🇫🇷',
  de: '🇩🇪',
  ar: '🇸🇦',
  hi: '🇮🇳',
  zh: '🇨🇳',
};

export default function LanguageSelector({ 
  className = '',
  variant = 'dropdown',
  showFlags = true 
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLocale, setCurrentLocale] = useState(DEFAULT_LOCALE);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Extract current locale from pathname
  useEffect(() => {
    const locale = extractLocaleFromPath(pathname);
    setCurrentLocale(locale);
  }, [pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleLocaleChange = (newLocale: string) => {
    const pathWithoutLocale = getPathWithoutLocale(pathname);
    const newUrl = getLocalizedUrl(pathWithoutLocale, newLocale);
    
    // Extract just the pathname from the new URL
    const url = new URL(newUrl);
    router.push(url.pathname);
    setIsOpen(false);
  };

  const currentLocaleConfig = SUPPORTED_LOCALES.find(l => l.code === currentLocale);
  const currentFlag = LOCALE_FLAGS[currentLocale] || LOCALE_FLAGS[DEFAULT_LOCALE];

  if (variant === 'inline') {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {SUPPORTED_LOCALES.map((locale) => (
          <button
            key={locale.code}
            onClick={() => handleLocaleChange(locale.code)}
            className={`
              px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200
              ${currentLocale === locale.code
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
            title={`Switch to ${locale.name}`}
          >
            {showFlags && (
              <span className="mr-1">{LOCALE_FLAGS[locale.code]}</span>
            )}
            {locale.code.toUpperCase()}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium
          text-gray-700 hover:text-gray-900 hover:bg-gray-100
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          transition-colors duration-200
        "
        aria-label="Select language"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {showFlags ? (
          <span className="text-lg">{currentFlag}</span>
        ) : (
          <GlobeAltIcon className="w-4 h-4" />
        )}
        <span className="hidden sm:inline">
          {currentLocaleConfig?.name || getLanguageName(currentLocale)}
        </span>
        <span className="sm:hidden">
          {currentLocale.toUpperCase()}
        </span>
        <ChevronDownIcon 
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <div className="
          absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200
          z-50 py-1 max-h-60 overflow-y-auto
        ">
          {SUPPORTED_LOCALES.map((locale) => (
            <button
              key={locale.code}
              onClick={() => handleLocaleChange(locale.code)}
              className={`
                w-full flex items-center px-4 py-2 text-sm text-left
                transition-colors duration-200
                ${currentLocale === locale.code
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
              title={`Switch to ${locale.name}`}
            >
              {showFlags && (
                <span className="mr-3 text-lg">{LOCALE_FLAGS[locale.code]}</span>
              )}
              <div className="flex-1">
                <div className="font-medium">{locale.name}</div>
                {locale.region && (
                  <div className="text-xs text-gray-500">{locale.region}</div>
                )}
              </div>
              {currentLocale === locale.code && (
                <div className="ml-2 w-2 h-2 bg-blue-600 rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}