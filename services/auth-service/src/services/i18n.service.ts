import { PrismaClient } from '@zoptal/database';
import { logger } from '../utils/logger';
import {
  I18nPreferences,
  UpdateI18nPreferences,
  BrowserLocale,
  AutoDetectPreferences,
  Language,
  Timezone,
  i18nHelpers,
  SUPPORTED_LANGUAGES,
  SUPPORTED_TIMEZONES
} from '../schemas/i18n.schema';

interface I18nServiceDependencies {
  prisma: PrismaClient;
}

export interface I18nServiceInterface {
  getUserPreferences(userId: string): Promise<I18nPreferences>;
  updateUserPreferences(userId: string, preferences: UpdateI18nPreferences): Promise<I18nPreferences>;
  autoDetectPreferences(request: AutoDetectPreferences): Promise<Partial<I18nPreferences>>;
  detectFromBrowser(browserInfo: BrowserLocale): Promise<Partial<I18nPreferences>>;
  getDefaultPreferences(): I18nPreferences;
  validateTimezone(timezone: string): boolean;
  getSupportedLanguages(): Record<string, string>;
  getSupportedTimezones(): string[];
  getTimezonesByRegion(): Record<string, string[]>;
  formatDateForUser(date: Date, userId: string): Promise<string>;
  formatTimeForUser(date: Date, userId: string): Promise<string>;
  formatNumberForUser(number: number, userId: string): Promise<string>;
  formatCurrencyForUser(amount: number, userId: string): Promise<string>;
  getLocalizedContent(key: string, language: Language): string;
}

/**
 * Internationalization Service
 * Handles user language, timezone, and locale preferences
 */
export class I18nService implements I18nServiceInterface {
  constructor(private dependencies: I18nServiceDependencies) {}

  /**
   * Get user's internationalization preferences
   */
  async getUserPreferences(userId: string): Promise<I18nPreferences> {
    try {
      const user = await this.dependencies.prisma.user.findUnique({
        where: { id: userId },
        select: {
          language: true,
          timezone: true,
          // Additional i18n fields would be added to the User model
        }
      });

      if (!user) {
        logger.warn({ userId }, 'User not found, returning default preferences');
        return this.getDefaultPreferences();
      }

      // For now, we'll extend with defaults since the full i18n fields aren't in the schema yet
      return {
        language: (user.language as Language) || 'en',
        timezone: (user.timezone as Timezone) || 'UTC',
        dateFormat: 'MM/DD/YYYY', // Would come from user preferences table
        timeFormat: '12h',
        numberFormat: 'en-US',
        currency: 'USD',
        firstDayOfWeek: 'sunday',
        measurementSystem: 'metric'
      };
    } catch (error) {
      logger.error({ error, userId }, 'Failed to get user preferences');
      return this.getDefaultPreferences();
    }
  }

  /**
   * Update user's internationalization preferences
   */
  async updateUserPreferences(
    userId: string, 
    preferences: UpdateI18nPreferences
  ): Promise<I18nPreferences> {
    try {
      // Validate timezone if provided
      if (preferences.timezone && !this.validateTimezone(preferences.timezone)) {
        throw new Error(`Invalid timezone: ${preferences.timezone}`);
      }

      // Update user preferences in database
      await this.dependencies.prisma.user.update({
        where: { id: userId },
        data: {
          ...(preferences.language && { language: preferences.language }),
          ...(preferences.timezone && { timezone: preferences.timezone })
        }
      });

      // TODO: Update extended preferences in a separate user_preferences table
      // For now, we'll merge with current preferences
      const currentPreferences = await this.getUserPreferences(userId);
      const updatedPreferences = { ...currentPreferences, ...preferences };

      logger.info({ userId, preferences }, 'User i18n preferences updated');

      return updatedPreferences;
    } catch (error) {
      logger.error({ error, userId, preferences }, 'Failed to update user preferences');
      throw error;
    }
  }

  /**
   * Auto-detect preferences from request headers and user agent
   */
  async autoDetectPreferences(request: AutoDetectPreferences): Promise<Partial<I18nPreferences>> {
    try {
      const detected: Partial<I18nPreferences> = {};

      // Detect language from Accept-Language header
      if (request.acceptLanguage) {
        detected.language = i18nHelpers.detectLanguageFromHeader(request.acceptLanguage);
      }

      // Use provided timezone if valid
      if (request.timezone && this.validateTimezone(request.timezone)) {
        detected.timezone = request.timezone as Timezone;
      }

      // Detect locale-specific preferences based on country
      if (request.country) {
        const countryPreferences = this.getCountryPreferences(request.country);
        Object.assign(detected, countryPreferences);
      }

      logger.info({ request, detected }, 'Auto-detected user preferences');

      return detected;
    } catch (error) {
      logger.error({ error, request }, 'Failed to auto-detect preferences');
      return {};
    }
  }

  /**
   * Detect preferences from browser information
   */
  async detectFromBrowser(browserInfo: BrowserLocale): Promise<Partial<I18nPreferences>> {
    try {
      const detected: Partial<I18nPreferences> = {};

      // Primary language detection
      const primaryLang = browserInfo.language.split('-')[0].toLowerCase();
      if (primaryLang in SUPPORTED_LANGUAGES) {
        detected.language = primaryLang as Language;
      }

      // Timezone detection
      if (browserInfo.timezone && this.validateTimezone(browserInfo.timezone)) {
        detected.timezone = browserInfo.timezone as Timezone;
      }

      // Currency detection
      if (browserInfo.currency && browserInfo.currency in ['USD', 'EUR', 'GBP', 'JPY', 'CNY']) {
        detected.currency = browserInfo.currency as any;
      }

      // Country-specific preferences
      if (browserInfo.country) {
        const countryPreferences = this.getCountryPreferences(browserInfo.country);
        Object.assign(detected, countryPreferences);
      }

      logger.info({ browserInfo, detected }, 'Detected preferences from browser');

      return detected;
    } catch (error) {
      logger.error({ error, browserInfo }, 'Failed to detect from browser');
      return {};
    }
  }

  /**
   * Get default internationalization preferences
   */
  getDefaultPreferences(): I18nPreferences {
    return {
      language: 'en',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      numberFormat: 'en-US',
      currency: 'USD',
      firstDayOfWeek: 'sunday',
      measurementSystem: 'metric'
    };
  }

  /**
   * Validate if a timezone is supported
   */
  validateTimezone(timezone: string): boolean {
    return i18nHelpers.isValidTimezone(timezone);
  }

  /**
   * Get all supported languages
   */
  getSupportedLanguages(): Record<string, string> {
    return SUPPORTED_LANGUAGES;
  }

  /**
   * Get all supported timezones
   */
  getSupportedTimezones(): string[] {
    return SUPPORTED_TIMEZONES;
  }

  /**
   * Get timezones organized by region
   */
  getTimezonesByRegion(): Record<string, string[]> {
    return {
      'North America': i18nHelpers.getTimezonesByRegion('North America') as string[],
      'Europe': i18nHelpers.getTimezonesByRegion('Europe') as string[],
      'Asia Pacific': i18nHelpers.getTimezonesByRegion('Asia Pacific') as string[],
      'South America': i18nHelpers.getTimezonesByRegion('South America') as string[],
      'Africa': i18nHelpers.getTimezonesByRegion('Africa') as string[],
      'UTC Offsets': i18nHelpers.getTimezonesByRegion('UTC Offsets') as string[]
    };
  }

  /**
   * Format date according to user's preferences
   */
  async formatDateForUser(date: Date, userId: string): Promise<string> {
    try {
      const preferences = await this.getUserPreferences(userId);
      return this.formatDate(date, preferences);
    } catch (error) {
      logger.error({ error, userId, date }, 'Failed to format date for user');
      return date.toLocaleDateString();
    }
  }

  /**
   * Format time according to user's preferences
   */
  async formatTimeForUser(date: Date, userId: string): Promise<string> {
    try {
      const preferences = await this.getUserPreferences(userId);
      return this.formatTime(date, preferences);
    } catch (error) {
      logger.error({ error, userId, date }, 'Failed to format time for user');
      return date.toLocaleTimeString();
    }
  }

  /**
   * Format number according to user's preferences
   */
  async formatNumberForUser(number: number, userId: string): Promise<string> {
    try {
      const preferences = await this.getUserPreferences(userId);
      return this.formatNumber(number, preferences);
    } catch (error) {
      logger.error({ error, userId, number }, 'Failed to format number for user');
      return number.toString();
    }
  }

  /**
   * Format currency according to user's preferences
   */
  async formatCurrencyForUser(amount: number, userId: string): Promise<string> {
    try {
      const preferences = await this.getUserPreferences(userId);
      return this.formatCurrency(amount, preferences);
    } catch (error) {
      logger.error({ error, userId, amount }, 'Failed to format currency for user');
      return `$${amount.toFixed(2)}`;
    }
  }

  /**
   * Get localized content for a given key and language
   */
  getLocalizedContent(key: string, language: Language): string {
    // This would typically load from translation files or database
    // For now, returning a placeholder implementation
    const translations: Record<Language, Record<string, string>> = {
      en: {
        'auth.login.title': 'Sign In',
        'auth.register.title': 'Create Account',
        'auth.forgot.title': 'Reset Password',
        'auth.verify.title': 'Verify Email',
        'error.invalid_credentials': 'Invalid email or password',
        'error.account_locked': 'Account temporarily locked',
        'success.registration': 'Account created successfully',
        'success.login': 'Welcome back!'
      },
      es: {
        'auth.login.title': 'Iniciar Sesión',
        'auth.register.title': 'Crear Cuenta',
        'auth.forgot.title': 'Restablecer Contraseña',
        'auth.verify.title': 'Verificar Email',
        'error.invalid_credentials': 'Email o contraseña inválidos',
        'error.account_locked': 'Cuenta temporalmente bloqueada',
        'success.registration': 'Cuenta creada exitosamente',
        'success.login': '¡Bienvenido de nuevo!'
      },
      fr: {
        'auth.login.title': 'Se Connecter',
        'auth.register.title': 'Créer un Compte',
        'auth.forgot.title': 'Réinitialiser le Mot de Passe',
        'auth.verify.title': 'Vérifier Email',
        'error.invalid_credentials': 'Email ou mot de passe invalide',
        'error.account_locked': 'Compte temporairement verrouillé',
        'success.registration': 'Compte créé avec succès',
        'success.login': 'Bon retour!'
      }
    };

    return translations[language]?.[key] || translations.en[key] || key;
  }

  /**
   * Private helper methods
   */

  private formatDate(date: Date, preferences: I18nPreferences): string {
    try {
      // Convert to user's timezone first
      const userDate = new Date(date.toLocaleString("en-US", { timeZone: preferences.timezone }));
      
      switch (preferences.dateFormat) {
        case 'MM/DD/YYYY':
          return userDate.toLocaleDateString('en-US');
        case 'DD/MM/YYYY':
          return userDate.toLocaleDateString('en-GB');
        case 'YYYY-MM-DD':
          return userDate.toISOString().split('T')[0];
        case 'DD.MM.YYYY':
          return userDate.toLocaleDateString('de-DE');
        case 'DD MMM YYYY':
          return userDate.toLocaleDateString('en-GB', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric' 
          });
        case 'MMM DD, YYYY':
          return userDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: '2-digit', 
            year: 'numeric' 
          });
        default:
          return userDate.toLocaleDateString();
      }
    } catch (error) {
      logger.error({ error, date, preferences }, 'Failed to format date');
      return date.toLocaleDateString();
    }
  }

  private formatTime(date: Date, preferences: I18nPreferences): string {
    try {
      const options: Intl.DateTimeFormatOptions = {
        timeZone: preferences.timezone,
        hour12: preferences.timeFormat === '12h'
      };

      return date.toLocaleTimeString(preferences.numberFormat, options);
    } catch (error) {
      logger.error({ error, date, preferences }, 'Failed to format time');
      return date.toLocaleTimeString();
    }
  }

  private formatNumber(number: number, preferences: I18nPreferences): string {
    try {
      return new Intl.NumberFormat(preferences.numberFormat).format(number);
    } catch (error) {
      logger.error({ error, number, preferences }, 'Failed to format number');
      return number.toString();
    }
  }

  private formatCurrency(amount: number, preferences: I18nPreferences): string {
    try {
      return new Intl.NumberFormat(preferences.numberFormat, {
        style: 'currency',
        currency: preferences.currency
      }).format(amount);
    } catch (error) {
      logger.error({ error, amount, preferences }, 'Failed to format currency');
      return `${preferences.currency} ${amount.toFixed(2)}`;
    }
  }

  private getCountryPreferences(country: string): Partial<I18nPreferences> {
    // Country-specific default preferences
    const countryDefaults: Record<string, Partial<I18nPreferences>> = {
      US: {
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        numberFormat: 'en-US',
        currency: 'USD',
        firstDayOfWeek: 'sunday',
        measurementSystem: 'imperial'
      },
      GB: {
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
        numberFormat: 'en-GB',
        currency: 'GBP',
        firstDayOfWeek: 'monday',
        measurementSystem: 'metric'
      },
      DE: {
        dateFormat: 'DD.MM.YYYY',
        timeFormat: '24h',
        numberFormat: 'de-DE',
        currency: 'EUR',
        firstDayOfWeek: 'monday',
        measurementSystem: 'metric'
      },
      FR: {
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
        numberFormat: 'fr-FR',
        currency: 'EUR',
        firstDayOfWeek: 'monday',
        measurementSystem: 'metric'
      },
      JP: {
        dateFormat: 'YYYY-MM-DD',
        timeFormat: '24h',
        numberFormat: 'ja-JP',
        currency: 'JPY',
        firstDayOfWeek: 'sunday',
        measurementSystem: 'metric'
      }
    };

    return countryDefaults[country.toUpperCase()] || {};
  }
}

/**
 * Factory function to create I18n service
 */
export function createI18nService(dependencies: I18nServiceDependencies): I18nService {
  return new I18nService(dependencies);
}