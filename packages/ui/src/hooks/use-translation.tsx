import { useContext, useEffect, useState, useCallback } from 'react';
import { I18nContext, I18nContextType } from '../providers/I18nProvider';

export interface UseTranslationOptions {
  namespace?: string;
  fallback?: string;
  interpolation?: Record<string, any>;
  count?: number;
  context?: string;
}

export interface UseTranslationReturn {
  t: (key: string, options?: UseTranslationOptions) => string;
  language: string;
  isLoading: boolean;
  isReady: boolean;
  changeLanguage: (language: string) => Promise<void>;
  getLanguageInfo: () => any;
  formatNumber: (number: number, options?: Intl.NumberFormatOptions) => string;
  formatDate: (date: Date | string, options?: Intl.DateTimeFormatOptions) => string;
  formatCurrency: (amount: number, currency?: string, options?: Intl.NumberFormatOptions) => string;
  formatRelativeTime: (value: number, unit: Intl.RelativeTimeFormatUnit) => string;
  dir: 'ltr' | 'rtl';
}

/**
 * React hook for internationalization and translation
 * 
 * @param namespace - Default namespace for translations
 * @returns Translation utilities and state
 */
export function useTranslation(namespace = 'common'): UseTranslationReturn {
  const context = useContext(I18nContext);
  
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }

  const {
    language,
    translations,
    isLoading,
    isReady,
    changeLanguage,
    getLanguageInfo,
    formatters
  } = context as I18nContextType;

  /**
   * Translate a key with interpolation and pluralization support
   */
  const t = useCallback((key: string, options: UseTranslationOptions = {}): string => {
    const {
      namespace: optionNamespace,
      fallback,
      interpolation = {},
      count,
      context: translationContext
    } = options;

    const finalNamespace = optionNamespace || namespace;
    const fullKey = `${finalNamespace}:${key}`;

    // Get translation from loaded translations
    let translation = getNestedTranslation(translations, finalNamespace, key);

    // Handle pluralization
    if (translation && typeof count === 'number' && translation.pluralForms) {
      const pluralForm = getPluralForm(count, language);
      translation = translation.pluralForms[pluralForm] || translation.value;
    } else if (translation && typeof translation === 'object') {
      translation = translation.value;
    }

    // Use fallback if translation not found
    if (!translation) {
      translation = fallback || key;
    }

    // Apply interpolation
    if (typeof translation === 'string' && Object.keys(interpolation).length > 0) {
      translation = interpolateString(translation, interpolation);
    }

    return translation;
  }, [namespace, translations, language]);

  /**
   * Format number according to current locale
   */
  const formatNumber = useCallback((number: number, options?: Intl.NumberFormatOptions): string => {
    return formatters.formatNumber(number, options);
  }, [formatters]);

  /**
   * Format date according to current locale
   */
  const formatDate = useCallback((date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
    return formatters.formatDate(date, options);
  }, [formatters]);

  /**
   * Format currency according to current locale
   */
  const formatCurrency = useCallback((amount: number, currency = 'USD', options?: Intl.NumberFormatOptions): string => {
    return formatters.formatCurrency(amount, currency, options);
  }, [formatters]);

  /**
   * Format relative time according to current locale
   */
  const formatRelativeTime = useCallback((value: number, unit: Intl.RelativeTimeFormatUnit): string => {
    return formatters.formatRelativeTime(value, unit);
  }, [formatters]);

  // Get text direction for current language
  const dir = getLanguageInfo()?.rtl ? 'rtl' : 'ltr';

  return {
    t,
    language,
    isLoading,
    isReady,
    changeLanguage,
    getLanguageInfo,
    formatNumber,
    formatDate,
    formatCurrency,
    formatRelativeTime,
    dir
  };
}

/**
 * Hook for loading specific namespaces
 */
export function useNamespace(namespaces: string | string[], options?: { suspense?: boolean }) {
  const { loadNamespaces, isNamespaceLoaded } = useContext(I18nContext) as I18nContextType;
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const namespacesArray = Array.isArray(namespaces) ? namespaces : [namespaces];

  useEffect(() => {
    const loadNamespacesAsync = async () => {
      setIsLoading(true);
      try {
        await loadNamespaces(namespacesArray);
        setIsLoaded(namespacesArray.every(ns => isNamespaceLoaded(ns)));
      } catch (error) {
        console.error('Failed to load namespaces:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const allLoaded = namespacesArray.every(ns => isNamespaceLoaded(ns));
    if (!allLoaded) {
      loadNamespacesAsync();
    } else {
      setIsLoaded(true);
    }
  }, [namespaces, loadNamespaces, isNamespaceLoaded]);

  if (options?.suspense && isLoading) {
    throw new Promise((resolve) => {
      const checkLoaded = () => {
        if (namespacesArray.every(ns => isNamespaceLoaded(ns))) {
          resolve(undefined);
        } else {
          setTimeout(checkLoaded, 50);
        }
      };
      checkLoaded();
    });
  }

  return { isLoading, isLoaded };
}

/**
 * Hook for language switching with persistence
 */
export function useLanguage() {
  const { language, changeLanguage, supportedLanguages } = useContext(I18nContext) as I18nContextType;

  const switchLanguage = useCallback(async (newLanguage: string) => {
    if (supportedLanguages.some(lang => lang.code === newLanguage)) {
      await changeLanguage(newLanguage);
      // Persist language preference
      localStorage.setItem('preferred-language', newLanguage);
    } else {
      console.warn(`Language ${newLanguage} is not supported`);
    }
  }, [changeLanguage, supportedLanguages]);

  return {
    language,
    supportedLanguages,
    switchLanguage
  };
}

// Helper functions

function getNestedTranslation(translations: any, namespace: string, key: string): any {
  if (!translations[namespace]) {
    return null;
  }

  const keys = key.split('.');
  let current = translations[namespace];

  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = current[k];
    } else {
      return null;
    }
  }

  return current;
}

function interpolateString(template: string, variables: Record<string, any>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = variables[key];
    return value !== undefined ? String(value) : match;
  });
}

function getPluralForm(count: number, language: string): string {
  const absCount = Math.abs(count);

  // English and most languages
  if (language.startsWith('en')) {
    return absCount === 1 ? 'one' : 'other';
  }

  // Russian, Ukrainian, etc.
  if (['ru', 'uk', 'sr'].includes(language.substring(0, 2))) {
    const lastDigit = absCount % 10;
    const lastTwoDigits = absCount % 100;

    if (lastDigit === 1 && lastTwoDigits !== 11) return 'one';
    if ([2, 3, 4].includes(lastDigit) && ![12, 13, 14].includes(lastTwoDigits)) return 'few';
    return 'many';
  }

  // Polish
  if (language.startsWith('pl')) {
    const lastDigit = absCount % 10;
    const lastTwoDigits = absCount % 100;

    if (absCount === 1) return 'one';
    if ([2, 3, 4].includes(lastDigit) && ![12, 13, 14].includes(lastTwoDigits)) return 'few';
    return 'many';
  }

  // Arabic
  if (language.startsWith('ar')) {
    if (absCount === 0) return 'zero';
    if (absCount === 1) return 'one';
    if (absCount === 2) return 'two';
    if (absCount >= 3 && absCount <= 10) return 'few';
    if (absCount >= 11 && absCount <= 99) return 'many';
    return 'other';
  }

  // Default rule
  return absCount === 1 ? 'one' : 'other';
}