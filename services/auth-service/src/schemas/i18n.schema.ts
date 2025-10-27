import { z } from 'zod';

/**
 * Supported languages with their locale codes
 * Following ISO 639-1 language codes
 */
export const SUPPORTED_LANGUAGES = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
  pt: 'Português',
  ru: 'Русский',
  zh: '中文',
  ja: '日本語',
  ko: '한국어',
  ar: 'العربية',
  hi: 'हिन्दी',
  nl: 'Nederlands',
  sv: 'Svenska',
  no: 'Norsk',
  da: 'Dansk',
  fi: 'Suomi',
  pl: 'Polski',
  tr: 'Türkçe',
  th: 'ไทย'
} as const;

/**
 * Common timezones organized by region
 */
export const TIMEZONE_REGIONS = {
  'North America': [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Phoenix',
    'America/Anchorage',
    'America/Hawaii',
    'America/Toronto',
    'America/Vancouver',
    'America/Mexico_City'
  ],
  'Europe': [
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Europe/Rome',
    'Europe/Madrid',
    'Europe/Amsterdam',
    'Europe/Brussels',
    'Europe/Vienna',
    'Europe/Zurich',
    'Europe/Stockholm',
    'Europe/Oslo',
    'Europe/Copenhagen',
    'Europe/Helsinki',
    'Europe/Warsaw',
    'Europe/Prague',
    'Europe/Budapest',
    'Europe/Bucharest',
    'Europe/Athens',
    'Europe/Moscow',
    'Europe/Istanbul'
  ],
  'Asia Pacific': [
    'Asia/Tokyo',
    'Asia/Seoul',
    'Asia/Shanghai',
    'Asia/Hong_Kong',
    'Asia/Singapore',
    'Asia/Bangkok',
    'Asia/Jakarta',
    'Asia/Manila',
    'Asia/Kuala_Lumpur',
    'Asia/Taipei',
    'Asia/Kolkata',
    'Asia/Dubai',
    'Asia/Karachi',
    'Asia/Dhaka',
    'Australia/Sydney',
    'Australia/Melbourne',
    'Australia/Perth',
    'Pacific/Auckland'
  ],
  'South America': [
    'America/Sao_Paulo',
    'America/Buenos_Aires',
    'America/Santiago',
    'America/Lima',
    'America/Bogota',
    'America/Caracas'
  ],
  'Africa': [
    'Africa/Cairo',
    'Africa/Johannesburg',
    'Africa/Lagos',
    'Africa/Nairobi',
    'Africa/Casablanca',
    'Africa/Tunis'
  ],
  'UTC Offsets': [
    'UTC',
    'Etc/GMT+12',
    'Etc/GMT+11',
    'Etc/GMT+10',
    'Etc/GMT+9',
    'Etc/GMT+8',
    'Etc/GMT+7',
    'Etc/GMT+6',
    'Etc/GMT+5',
    'Etc/GMT+4',
    'Etc/GMT+3',
    'Etc/GMT+2',
    'Etc/GMT+1',
    'Etc/GMT-1',
    'Etc/GMT-2',
    'Etc/GMT-3',
    'Etc/GMT-4',
    'Etc/GMT-5',
    'Etc/GMT-6',
    'Etc/GMT-7',
    'Etc/GMT-8',
    'Etc/GMT-9',
    'Etc/GMT-10',
    'Etc/GMT-11',
    'Etc/GMT-12'
  ]
} as const;

/**
 * All supported timezones (flattened from regions)
 */
export const SUPPORTED_TIMEZONES = Object.values(TIMEZONE_REGIONS).flat();

/**
 * Language preference schema
 */
export const languageSchema = z.enum(Object.keys(SUPPORTED_LANGUAGES) as [string, ...string[]], {
  errorMap: () => ({ message: 'Unsupported language code' })
});

/**
 * Timezone schema
 */
export const timezoneSchema = z.enum(SUPPORTED_TIMEZONES as [string, ...string[]], {
  errorMap: () => ({ message: 'Unsupported timezone' })
});

/**
 * Date format preferences
 */
export const DATE_FORMATS = {
  'MM/DD/YYYY': 'MM/DD/YYYY',
  'DD/MM/YYYY': 'DD/MM/YYYY',
  'YYYY-MM-DD': 'YYYY-MM-DD',
  'DD.MM.YYYY': 'DD.MM.YYYY',
  'DD MMM YYYY': 'DD MMM YYYY',
  'MMM DD, YYYY': 'MMM DD, YYYY'
} as const;

export const dateFormatSchema = z.enum(Object.keys(DATE_FORMATS) as [string, ...string[]]);

/**
 * Time format preferences
 */
export const TIME_FORMATS = {
  '12h': '12-hour (AM/PM)',
  '24h': '24-hour'
} as const;

export const timeFormatSchema = z.enum(Object.keys(TIME_FORMATS) as [string, ...string[]]);

/**
 * Number format preferences
 */
export const NUMBER_FORMATS = {
  'en-US': 'US (1,234.56)',
  'en-GB': 'UK (1,234.56)',
  'de-DE': 'German (1.234,56)',
  'fr-FR': 'French (1 234,56)',
  'es-ES': 'Spanish (1.234,56)',
  'it-IT': 'Italian (1.234,56)',
  'pt-BR': 'Brazilian (1.234,56)',
  'ru-RU': 'Russian (1 234,56)',
  'zh-CN': 'Chinese (1,234.56)',
  'ja-JP': 'Japanese (1,234.56)',
  'ko-KR': 'Korean (1,234.56)',
  'ar-SA': 'Arabic (١٬٢٣٤٫٥٦)',
  'hi-IN': 'Hindi (1,234.56)'
} as const;

export const numberFormatSchema = z.enum(Object.keys(NUMBER_FORMATS) as [string, ...string[]]);

/**
 * Currency preferences
 */
export const CURRENCIES = {
  USD: { symbol: '$', name: 'US Dollar' },
  EUR: { symbol: '€', name: 'Euro' },
  GBP: { symbol: '£', name: 'British Pound' },
  JPY: { symbol: '¥', name: 'Japanese Yen' },
  CNY: { symbol: '¥', name: 'Chinese Yuan' },
  KRW: { symbol: '₩', name: 'Korean Won' },
  INR: { symbol: '₹', name: 'Indian Rupee' },
  BRL: { symbol: 'R$', name: 'Brazilian Real' },
  CAD: { symbol: 'C$', name: 'Canadian Dollar' },
  AUD: { symbol: 'A$', name: 'Australian Dollar' },
  CHF: { symbol: 'Fr', name: 'Swiss Franc' },
  SEK: { symbol: 'kr', name: 'Swedish Krona' },
  NOK: { symbol: 'kr', name: 'Norwegian Krone' },
  DKK: { symbol: 'kr', name: 'Danish Krone' },
  PLN: { symbol: 'zł', name: 'Polish Złoty' },
  RUB: { symbol: '₽', name: 'Russian Ruble' },
  TRY: { symbol: '₺', name: 'Turkish Lira' },
  SAR: { symbol: 'ر.س', name: 'Saudi Riyal' },
  AED: { symbol: 'د.إ', name: 'UAE Dirham' }
} as const;

export const currencySchema = z.enum(Object.keys(CURRENCIES) as [string, ...string[]]);

/**
 * Complete internationalization preferences schema
 */
export const i18nPreferencesSchema = z.object({
  language: languageSchema.default('en'),
  timezone: timezoneSchema.default('UTC'),
  dateFormat: dateFormatSchema.default('MM/DD/YYYY'),
  timeFormat: timeFormatSchema.default('12h'),
  numberFormat: numberFormatSchema.default('en-US'),
  currency: currencySchema.default('USD'),
  firstDayOfWeek: z.enum(['sunday', 'monday']).default('sunday'),
  measurementSystem: z.enum(['metric', 'imperial']).default('metric')
});

/**
 * Update internationalization preferences schema
 */
export const updateI18nPreferencesSchema = z.object({
  language: languageSchema.optional(),
  timezone: timezoneSchema.optional(),
  dateFormat: dateFormatSchema.optional(),
  timeFormat: timeFormatSchema.optional(),
  numberFormat: numberFormatSchema.optional(),
  currency: currencySchema.optional(),
  firstDayOfWeek: z.enum(['sunday', 'monday']).optional(),
  measurementSystem: z.enum(['metric', 'imperial']).optional()
});

/**
 * Browser locale detection schema
 */
export const browserLocaleSchema = z.object({
  language: z.string(),
  languages: z.array(z.string()),
  timezone: z.string(),
  timeZoneOffset: z.number(),
  currency: z.string().optional(),
  country: z.string().optional()
});

/**
 * Auto-detection preferences request
 */
export const autoDetectPreferencesSchema = z.object({
  userAgent: z.string(),
  acceptLanguage: z.string(),
  timezone: z.string().optional(),
  country: z.string().optional()
});

// Type exports
export type Language = z.infer<typeof languageSchema>;
export type Timezone = z.infer<typeof timezoneSchema>;
export type DateFormat = z.infer<typeof dateFormatSchema>;
export type TimeFormat = z.infer<typeof timeFormatSchema>;
export type NumberFormat = z.infer<typeof numberFormatSchema>;
export type Currency = z.infer<typeof currencySchema>;
export type I18nPreferences = z.infer<typeof i18nPreferencesSchema>;
export type UpdateI18nPreferences = z.infer<typeof updateI18nPreferencesSchema>;
export type BrowserLocale = z.infer<typeof browserLocaleSchema>;
export type AutoDetectPreferences = z.infer<typeof autoDetectPreferencesSchema>;

/**
 * Helper functions for working with i18n data
 */
export const i18nHelpers = {
  getLanguageName: (code: Language): string => SUPPORTED_LANGUAGES[code],
  
  getTimezonesByRegion: (region: keyof typeof TIMEZONE_REGIONS): readonly string[] => {
    return TIMEZONE_REGIONS[region];
  },
  
  getAllTimezoneRegions: (): string[] => Object.keys(TIMEZONE_REGIONS),
  
  getCurrencyInfo: (code: Currency) => CURRENCIES[code],
  
  getDateFormatExample: (format: DateFormat): string => {
    const date = new Date('2024-03-15');
    switch (format) {
      case 'MM/DD/YYYY': return '03/15/2024';
      case 'DD/MM/YYYY': return '15/03/2024';
      case 'YYYY-MM-DD': return '2024-03-15';
      case 'DD.MM.YYYY': return '15.03.2024';
      case 'DD MMM YYYY': return '15 Mar 2024';
      case 'MMM DD, YYYY': return 'Mar 15, 2024';
      default: return '03/15/2024';
    }
  },
  
  getTimeFormatExample: (format: TimeFormat): string => {
    return format === '12h' ? '2:30 PM' : '14:30';
  },
  
  getNumberFormatExample: (format: NumberFormat): string => {
    return NUMBER_FORMATS[format];
  },
  
  /**
   * Detect best language match from Accept-Language header
   */
  detectLanguageFromHeader: (acceptLanguage: string): Language => {
    const languages = acceptLanguage
      .split(',')
      .map(lang => lang.split(';')[0].trim().toLowerCase())
      .map(lang => lang.split('-')[0]); // Get base language (en from en-US)
    
    for (const lang of languages) {
      if (lang in SUPPORTED_LANGUAGES) {
        return lang as Language;
      }
    }
    
    return 'en'; // Default fallback
  },
  
  /**
   * Validate timezone identifier
   */
  isValidTimezone: (timezone: string): boolean => {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: timezone });
      return SUPPORTED_TIMEZONES.includes(timezone);
    } catch {
      return false;
    }
  },
  
  /**
   * Get timezone info
   */
  getTimezoneInfo: (timezone: string) => {
    try {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en', {
        timeZone: timezone,
        timeZoneName: 'long'
      });
      
      const offset = new Intl.DateTimeFormat('en', {
        timeZone: timezone,
        timeZoneName: 'short'
      }).formatToParts(now).find(part => part.type === 'timeZoneName')?.value || '';
      
      return {
        timezone,
        offset,
        displayName: formatter.formatToParts(now).find(part => part.type === 'timeZoneName')?.value || timezone
      };
    } catch {
      return {
        timezone,
        offset: 'UTC',
        displayName: timezone
      };
    }
  }
};