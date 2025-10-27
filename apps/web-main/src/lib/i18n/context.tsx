'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { 
  SUPPORTED_LOCALES, 
  DEFAULT_LOCALE, 
  extractLocaleFromPath,
  getPathWithoutLocale,
  getLocalizedUrl,
  getLocaleConfig,
  type LocaleConfig 
} from '@/lib/seo/hreflang';
import { 
  getTranslation, 
  hasTranslation, 
  getTranslationCompleteness,
  type TranslationKey 
} from '@/lib/i18n/translations';

interface I18nContextType {
  locale: string;
  localeConfig: LocaleConfig;
  setLocale: (locale: string) => void;
  t: (key: TranslationKey, params?: Record<string, string>) => string;
  hasTranslation: (key: TranslationKey) => boolean;
  supportedLocales: LocaleConfig[];
  isRTL: boolean;
  completeness: number;
  switchLocale: (locale: string) => void;
  getLocalizedPath: (path: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: React.ReactNode;
  initialLocale?: string;
}

export function I18nProvider({ children, initialLocale }: I18nProviderProps) {
  const pathname = usePathname();
  const router = useRouter();
  
  // Extract locale from URL or use initial/default locale
  const [locale, setLocaleState] = useState(() => {
    if (typeof window !== 'undefined') {
      return extractLocaleFromPath(pathname) || initialLocale || DEFAULT_LOCALE;
    }
    return initialLocale || DEFAULT_LOCALE;
  });

  const localeConfig = getLocaleConfig(locale) || getLocaleConfig(DEFAULT_LOCALE)!;
  const isRTL = localeConfig.direction === 'rtl';
  const completeness = getTranslationCompleteness(locale);

  // Update locale when pathname changes
  useEffect(() => {
    const pathLocale = extractLocaleFromPath(pathname);
    if (pathLocale && pathLocale !== locale) {
      setLocaleState(pathLocale);
    }
  }, [pathname, locale]);

  // Update document attributes when locale changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.lang = locale;
      document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
      
      // Store user's locale preference
      localStorage.setItem('preferred-locale', locale);
    }
  }, [locale, isRTL]);

  // Translation function with parameter substitution
  const t = (key: TranslationKey, params?: Record<string, string>): string => {
    let translation = getTranslation(key, locale);
    
    // Substitute parameters if provided
    if (params) {
      for (const [paramKey, paramValue] of Object.entries(params)) {
        translation = translation.replace(
          new RegExp(`{{${paramKey}}}`, 'g'), 
          paramValue
        );
      }
    }
    
    return translation;
  };

  // Check if translation exists for current locale
  const hasTranslationForKey = (key: TranslationKey): boolean => {
    return hasTranslation(key, locale);
  };

  // Switch locale and navigate to localized URL
  const switchLocale = (newLocale: string) => {
    if (newLocale === locale) return;
    
    const currentPath = getPathWithoutLocale(pathname);
    const localizedPath = getLocalizedPath(currentPath, newLocale);
    
    // Update locale state
    setLocaleState(newLocale);
    
    // Navigate to localized URL
    router.push(localizedPath);
  };

  // Set locale without navigation (for programmatic changes)
  const setLocale = (newLocale: string) => {
    if (SUPPORTED_LOCALES.some(l => l.code === newLocale)) {
      setLocaleState(newLocale);
    }
  };

  // Get localized path for given path and locale
  const getLocalizedPath = (path: string, targetLocale?: string): string => {
    const targetLoc = targetLocale || locale;
    
    if (targetLoc === DEFAULT_LOCALE) {
      return path.startsWith('/') ? path : `/${path}`;
    }
    
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return cleanPath ? `/${targetLoc}/${cleanPath}` : `/${targetLoc}`;
  };

  const contextValue: I18nContextType = {
    locale,
    localeConfig,
    setLocale,
    t,
    hasTranslation: hasTranslationForKey,
    supportedLocales: SUPPORTED_LOCALES,
    isRTL,
    completeness,
    switchLocale,
    getLocalizedPath,
  };

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
}

// Hook to use i18n context
export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

// Hook for translations (shorthand)
export function useTranslation() {
  const { t, locale, switchLocale, hasTranslation } = useI18n();
  
  return {
    t,
    locale,
    switchLocale,
    hasTranslation,
  };
}

// Hook for locale information
export function useLocale() {
  const { 
    locale, 
    localeConfig, 
    supportedLocales, 
    isRTL, 
    completeness,
    switchLocale,
    getLocalizedPath
  } = useI18n();
  
  return {
    locale,
    localeConfig,
    supportedLocales,
    isRTL,
    completeness,
    switchLocale,
    getLocalizedPath,
  };
}

// Client-side locale detection hook
export function useLocaleDetection() {
  const [detectedLocale, setDetectedLocale] = useState<string | null>(null);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Check for stored preference
    const storedLocale = localStorage.getItem('preferred-locale');
    if (storedLocale && SUPPORTED_LOCALES.some(l => l.code === storedLocale)) {
      setDetectedLocale(storedLocale);
      return;
    }
    
    // Detect from browser language
    const browserLanguages = navigator.languages || [navigator.language];
    const supportedCodes = SUPPORTED_LOCALES.map(l => l.code);
    
    for (const browserLang of browserLanguages) {
      const langCode = browserLang.split('-')[0].toLowerCase();
      if (supportedCodes.includes(langCode)) {
        setDetectedLocale(langCode);
        return;
      }
    }
    
    // Detect from geographic location (if available)
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const response = await fetch(
              `/api/location?lat=${position.coords.latitude}&lng=${position.coords.longitude}`
            );
            const data = await response.json();
            
            // Map country to locale
            const countryLocaleMap: Record<string, string> = {
              'ES': 'es',
              'FR': 'fr', 
              'DE': 'de',
              'CN': 'zh',
              'SA': 'ar',
              'IN': 'hi',
            };
            
            const geoLocale = countryLocaleMap[data.country];
            if (geoLocale && supportedCodes.includes(geoLocale)) {
              setDetectedLocale(geoLocale);
            }
          } catch (error) {
            console.warn('Failed to detect locale from location:', error);
          }
        },
        () => {
          // Geolocation failed, use default
          setDetectedLocale(DEFAULT_LOCALE);
        }
      );
    } else {
      setDetectedLocale(DEFAULT_LOCALE);
    }
  }, []);
  
  return detectedLocale;
}

// Format numbers according to locale
export function useNumberFormat() {
  const { locale } = useI18n();
  
  const formatNumber = (
    value: number, 
    options?: Intl.NumberFormatOptions
  ): string => {
    return new Intl.NumberFormat(locale, options).format(value);
  };
  
  const formatCurrency = (
    value: number, 
    currency: string = 'USD'
  ): string => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(value);
  };
  
  const formatPercent = (value: number): string => {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(value / 100);
  };
  
  return {
    formatNumber,
    formatCurrency,
    formatPercent,
  };
}

// Format dates according to locale
export function useDateFormat() {
  const { locale } = useI18n();
  
  const formatDate = (
    date: Date | string, 
    options?: Intl.DateTimeFormatOptions
  ): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(locale, options).format(dateObj);
  };
  
  const formatRelativeTime = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if ('Intl' in window && 'RelativeTimeFormat' in Intl) {
      const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
      
      if (diffDays === 0) {
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        if (diffHours === 0) {
          const diffMinutes = Math.floor(diffMs / (1000 * 60));
          return rtf.format(-diffMinutes, 'minute');
        }
        return rtf.format(-diffHours, 'hour');
      }
      
      if (diffDays < 7) {
        return rtf.format(-diffDays, 'day');
      }
      
      if (diffDays < 30) {
        const diffWeeks = Math.floor(diffDays / 7);
        return rtf.format(-diffWeeks, 'week');
      }
      
      if (diffDays < 365) {
        const diffMonths = Math.floor(diffDays / 30);
        return rtf.format(-diffMonths, 'month');
      }
      
      const diffYears = Math.floor(diffDays / 365);
      return rtf.format(-diffYears, 'year');
    }
    
    // Fallback for browsers without RelativeTimeFormat
    return formatDate(dateObj, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  return {
    formatDate,
    formatRelativeTime,
  };
}