/**
 * Locale and Language Utilities
 * 
 * Provides utilities for:
 * - Language validation and normalization
 * - Locale formatting and parsing
 * - Pluralization rules
 * - Language fallbacks
 * - Regional variants
 */

// Comprehensive list of supported languages with metadata
const supportedLanguages = [
  // Major European Languages
  { code: 'en', name: 'English', nativeName: 'English', rtl: false, pluralRule: 'en' },
  { code: 'en-US', name: 'English (United States)', nativeName: 'English (US)', rtl: false, pluralRule: 'en' },
  { code: 'en-GB', name: 'English (United Kingdom)', nativeName: 'English (UK)', rtl: false, pluralRule: 'en' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', rtl: false, pluralRule: 'es' },
  { code: 'es-ES', name: 'Spanish (Spain)', nativeName: 'Español (España)', rtl: false, pluralRule: 'es' },
  { code: 'es-MX', name: 'Spanish (Mexico)', nativeName: 'Español (México)', rtl: false, pluralRule: 'es' },
  { code: 'fr', name: 'French', nativeName: 'Français', rtl: false, pluralRule: 'fr' },
  { code: 'fr-FR', name: 'French (France)', nativeName: 'Français (France)', rtl: false, pluralRule: 'fr' },
  { code: 'fr-CA', name: 'French (Canada)', nativeName: 'Français (Canada)', rtl: false, pluralRule: 'fr' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', rtl: false, pluralRule: 'de' },
  { code: 'de-DE', name: 'German (Germany)', nativeName: 'Deutsch (Deutschland)', rtl: false, pluralRule: 'de' },
  { code: 'de-AT', name: 'German (Austria)', nativeName: 'Deutsch (Österreich)', rtl: false, pluralRule: 'de' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', rtl: false, pluralRule: 'it' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', rtl: false, pluralRule: 'pt' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)', rtl: false, pluralRule: 'pt' },
  { code: 'pt-PT', name: 'Portuguese (Portugal)', nativeName: 'Português (Portugal)', rtl: false, pluralRule: 'pt' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', rtl: false, pluralRule: 'nl' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', rtl: false, pluralRule: 'sv' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', rtl: false, pluralRule: 'da' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', rtl: false, pluralRule: 'no' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', rtl: false, pluralRule: 'fi' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', rtl: false, pluralRule: 'pl' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', rtl: false, pluralRule: 'cs' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', rtl: false, pluralRule: 'hu' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română', rtl: false, pluralRule: 'ro' },
  { code: 'bg', name: 'Bulgarian', nativeName: 'Български', rtl: false, pluralRule: 'bg' },
  { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski', rtl: false, pluralRule: 'hr' },
  { code: 'sr', name: 'Serbian', nativeName: 'Српски', rtl: false, pluralRule: 'sr' },
  { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina', rtl: false, pluralRule: 'sk' },
  { code: 'sl', name: 'Slovenian', nativeName: 'Slovenščina', rtl: false, pluralRule: 'sl' },
  { code: 'et', name: 'Estonian', nativeName: 'Eesti', rtl: false, pluralRule: 'et' },
  { code: 'lv', name: 'Latvian', nativeName: 'Latviešu', rtl: false, pluralRule: 'lv' },
  { code: 'lt', name: 'Lithuanian', nativeName: 'Lietuvių', rtl: false, pluralRule: 'lt' },

  // Slavic Languages
  { code: 'ru', name: 'Russian', nativeName: 'Русский', rtl: false, pluralRule: 'ru' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', rtl: false, pluralRule: 'uk' },
  { code: 'be', name: 'Belarusian', nativeName: 'Беларуская', rtl: false, pluralRule: 'be' },

  // Asian Languages
  { code: 'zh', name: 'Chinese', nativeName: '中文', rtl: false, pluralRule: 'zh' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文', rtl: false, pluralRule: 'zh' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文', rtl: false, pluralRule: 'zh' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', rtl: false, pluralRule: 'ja' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', rtl: false, pluralRule: 'ko' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', rtl: false, pluralRule: 'th' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', rtl: false, pluralRule: 'vi' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', rtl: false, pluralRule: 'id' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', rtl: false, pluralRule: 'ms' },
  { code: 'tl', name: 'Filipino', nativeName: 'Filipino', rtl: false, pluralRule: 'tl' },

  // Middle Eastern and RTL Languages
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', rtl: true, pluralRule: 'ar' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', rtl: true, pluralRule: 'he' },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', rtl: true, pluralRule: 'fa' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', rtl: true, pluralRule: 'ur' },

  // South Asian Languages
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', rtl: false, pluralRule: 'hi' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', rtl: false, pluralRule: 'bn' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', rtl: false, pluralRule: 'ta' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', rtl: false, pluralRule: 'te' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', rtl: false, pluralRule: 'kn' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', rtl: false, pluralRule: 'ml' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', rtl: false, pluralRule: 'gu' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', rtl: false, pluralRule: 'pa' },

  // African Languages
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', rtl: false, pluralRule: 'sw' },
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans', rtl: false, pluralRule: 'af' },

  // Other Languages
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', rtl: false, pluralRule: 'tr' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', rtl: false, pluralRule: 'el' },
  { code: 'is', name: 'Icelandic', nativeName: 'Íslenska', rtl: false, pluralRule: 'is' },
  { code: 'mt', name: 'Maltese', nativeName: 'Malti', rtl: false, pluralRule: 'mt' }
];

// Language fallback chains
const languageFallbacks = {
  'en-US': ['en'],
  'en-GB': ['en'],
  'en-CA': ['en'],
  'en-AU': ['en'],
  'es-ES': ['es'],
  'es-MX': ['es'],
  'es-AR': ['es'],
  'fr-FR': ['fr'],
  'fr-CA': ['fr'],
  'fr-BE': ['fr'],
  'de-DE': ['de'],
  'de-AT': ['de'],
  'de-CH': ['de'],
  'pt-BR': ['pt'],
  'pt-PT': ['pt'],
  'zh-CN': ['zh'],
  'zh-TW': ['zh'],
  'zh-HK': ['zh'],
  'ar-SA': ['ar'],
  'ar-EG': ['ar'],
  'ar-AE': ['ar']
};

// Default fallback language
const defaultFallbackLanguage = 'en';

/**
 * Validate if a locale code is supported
 */
function validateLocale(locale) {
  if (!locale || typeof locale !== 'string') {
    return false;
  }

  const normalizedLocale = normalizeLocale(locale);
  return supportedLanguages.some(lang => lang.code === normalizedLocale);
}

/**
 * Normalize locale code to standard format
 */
function normalizeLocale(locale) {
  if (!locale) return null;
  
  // Convert to lowercase and handle common formats
  const cleaned = locale.toString().toLowerCase().trim();
  
  // Handle underscore format (en_US -> en-US)
  const normalized = cleaned.replace('_', '-');
  
  // Handle regional codes (ensure proper case)
  const parts = normalized.split('-');
  if (parts.length === 2) {
    return `${parts[0]}-${parts[1].toUpperCase()}`;
  }
  
  return parts[0];
}

/**
 * Get language metadata by code
 */
function getLanguageInfo(locale) {
  const normalizedLocale = normalizeLocale(locale);
  return supportedLanguages.find(lang => lang.code === normalizedLocale);
}

/**
 * Get fallback languages for a locale
 */
function getFallbackLanguages(locale) {
  const normalizedLocale = normalizeLocale(locale);
  const fallbacks = languageFallbacks[normalizedLocale] || [];
  
  // Add base language if regional variant
  if (normalizedLocale.includes('-')) {
    const baseLanguage = normalizedLocale.split('-')[0];
    if (!fallbacks.includes(baseLanguage)) {
      fallbacks.unshift(baseLanguage);
    }
  }
  
  // Always add default fallback
  if (!fallbacks.includes(defaultFallbackLanguage)) {
    fallbacks.push(defaultFallbackLanguage);
  }
  
  return fallbacks;
}

/**
 * Check if a language is right-to-left
 */
function isRTL(locale) {
  const langInfo = getLanguageInfo(locale);
  return langInfo ? langInfo.rtl : false;
}

/**
 * Get plural rule for a language
 */
function getPluralRule(locale) {
  const langInfo = getLanguageInfo(locale);
  return langInfo ? langInfo.pluralRule : 'en';
}

/**
 * Format number according to locale
 */
function formatNumber(number, locale, options = {}) {
  try {
    const normalizedLocale = normalizeLocale(locale);
    return new Intl.NumberFormat(normalizedLocale, options).format(number);
  } catch (error) {
    // Fallback to English formatting
    return new Intl.NumberFormat('en', options).format(number);
  }
}

/**
 * Format date according to locale
 */
function formatDate(date, locale, options = {}) {
  try {
    const normalizedLocale = normalizeLocale(locale);
    return new Intl.DateTimeFormat(normalizedLocale, options).format(new Date(date));
  } catch (error) {
    // Fallback to English formatting
    return new Intl.DateTimeFormat('en', options).format(new Date(date));
  }
}

/**
 * Format currency according to locale
 */
function formatCurrency(amount, locale, currency = 'USD', options = {}) {
  try {
    const normalizedLocale = normalizeLocale(locale);
    return new Intl.NumberFormat(normalizedLocale, {
      style: 'currency',
      currency,
      ...options
    }).format(amount);
  } catch (error) {
    // Fallback to English formatting
    return new Intl.NumberFormat('en', {
      style: 'currency',
      currency,
      ...options
    }).format(amount);
  }
}

/**
 * Get relative time formatting
 */
function formatRelativeTime(value, unit, locale) {
  try {
    const normalizedLocale = normalizeLocale(locale);
    return new Intl.RelativeTimeFormat(normalizedLocale).format(value, unit);
  } catch (error) {
    // Fallback to English formatting
    return new Intl.RelativeTimeFormat('en').format(value, unit);
  }
}

/**
 * Get list formatting
 */
function formatList(items, locale, options = {}) {
  try {
    const normalizedLocale = normalizeLocale(locale);
    return new Intl.ListFormat(normalizedLocale, options).format(items);
  } catch (error) {
    // Fallback to English formatting
    return new Intl.ListFormat('en', options).format(items);
  }
}

/**
 * Get browser's preferred languages
 */
function getBrowserLanguages() {
  if (typeof navigator === 'undefined') {
    return [defaultFallbackLanguage];
  }

  const languages = navigator.languages || [navigator.language];
  return languages.map(normalizeLocale).filter(Boolean);
}

/**
 * Find best matching language from supported languages
 */
function findBestMatchingLanguage(preferredLanguages = []) {
  const preferred = Array.isArray(preferredLanguages) 
    ? preferredLanguages 
    : [preferredLanguages];

  // Add browser languages if available
  const allPreferred = [...preferred, ...getBrowserLanguages()];

  for (const locale of allPreferred) {
    const normalized = normalizeLocale(locale);
    
    // Exact match
    if (validateLocale(normalized)) {
      return normalized;
    }
    
    // Base language match (e.g., en-US -> en)
    if (normalized.includes('-')) {
      const baseLanguage = normalized.split('-')[0];
      if (validateLocale(baseLanguage)) {
        return baseLanguage;
      }
    }
  }

  return defaultFallbackLanguage;
}

/**
 * Get languages grouped by region
 */
function getLanguagesByRegion() {
  const regions = {
    'Europe': [],
    'Asia': [],
    'Middle East': [],
    'Africa': [],
    'Americas': [],
    'Other': []
  };

  supportedLanguages.forEach(lang => {
    const code = lang.code.split('-')[0];
    
    if (['en', 'es', 'fr', 'pt'].includes(code) && lang.code.includes('-')) {
      // Regional variants for major languages
      if (lang.code.includes('US') || lang.code.includes('CA') || lang.code.includes('MX') || lang.code.includes('BR')) {
        regions['Americas'].push(lang);
      } else {
        regions['Europe'].push(lang);
      }
    } else if (['de', 'it', 'nl', 'sv', 'da', 'no', 'fi', 'pl', 'cs', 'hu', 'ro', 'bg', 'hr', 'sr', 'sk', 'sl', 'et', 'lv', 'lt', 'ru', 'uk', 'be', 'el', 'is', 'mt'].includes(code)) {
      regions['Europe'].push(lang);
    } else if (['zh', 'ja', 'ko', 'th', 'vi', 'id', 'ms', 'tl', 'hi', 'bn', 'ta', 'te', 'kn', 'ml', 'gu', 'pa'].includes(code)) {
      regions['Asia'].push(lang);
    } else if (['ar', 'he', 'fa', 'ur', 'tr'].includes(code)) {
      regions['Middle East'].push(lang);
    } else if (['sw', 'af'].includes(code)) {
      regions['Africa'].push(lang);
    } else {
      regions['Other'].push(lang);
    }
  });

  return regions;
}

/**
 * Detect text direction for mixed content
 */
function detectTextDirection(text, locale) {
  const langInfo = getLanguageInfo(locale);
  
  // If language is known to be RTL, return RTL
  if (langInfo && langInfo.rtl) {
    return 'rtl';
  }
  
  // Simple RTL character detection
  const rtlChars = /[\u0590-\u083F]|[\u08A0-\u08FF]|[\uFB1D-\uFDFF]|[\uFE70-\uFEFF]/mg;
  const rtlCount = (text.match(rtlChars) || []).length;
  const totalChars = text.replace(/\s/g, '').length;
  
  // If more than 30% of characters are RTL, consider it RTL text
  return rtlCount / totalChars > 0.3 ? 'rtl' : 'ltr';
}

module.exports = {
  supportedLanguages,
  validateLocale,
  normalizeLocale,
  getLanguageInfo,
  getFallbackLanguages,
  isRTL,
  getPluralRule,
  formatNumber,
  formatDate,
  formatCurrency,
  formatRelativeTime,
  formatList,
  getBrowserLanguages,
  findBestMatchingLanguage,
  getLanguagesByRegion,
  detectTextDirection,
  defaultFallbackLanguage
};