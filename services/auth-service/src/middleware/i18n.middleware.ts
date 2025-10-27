import { FastifyRequest, FastifyReply } from 'fastify';
import { logger } from '../utils/logger';
import { i18nHelpers, Language, Timezone } from '../schemas/i18n.schema';

// Extend Fastify request interface for i18n context
declare module 'fastify' {
  interface FastifyRequest {
    i18n: {
      language: Language;
      timezone: Timezone;
      locale: string;
      country?: string;
      isDetected: boolean;
    };
  }
}

/**
 * Internationalization middleware that detects and sets user's locale preferences
 */
export async function i18nMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    // Initialize i18n context with defaults
    request.i18n = {
      language: 'en',
      timezone: 'UTC',
      locale: 'en-US',
      isDetected: false
    };

    // Try to get preferences from authenticated user first
    if ((request as any).user?.id) {
      try {
        const userPreferences = await request.server.i18nService?.getUserPreferences((request as any).user.id);
        if (userPreferences) {
          request.i18n.language = userPreferences.language;
          request.i18n.timezone = userPreferences.timezone;
          request.i18n.locale = userPreferences.numberFormat;
          request.i18n.isDetected = false; // User-configured, not detected
          
          logger.debug({ 
            userId: (request as any).user.id, 
            preferences: userPreferences 
          }, 'Loaded user i18n preferences');
          
          return;
        }
      } catch (error) {
        logger.warn({ error, userId: (request as any).user.id }, 'Failed to load user preferences, falling back to detection');
      }
    }

    // Detect language from Accept-Language header
    const acceptLanguage = request.headers['accept-language'];
    if (acceptLanguage) {
      const detectedLanguage = i18nHelpers.detectLanguageFromHeader(acceptLanguage);
      request.i18n.language = detectedLanguage;
      request.i18n.isDetected = true;
      
      logger.debug({ acceptLanguage, detectedLanguage }, 'Detected language from Accept-Language header');
    }

    // Detect timezone from custom header or query param
    const timezoneHeader = request.headers['x-timezone'] as string;
    const timezoneQuery = (request.query as any)?.timezone;
    const detectedTimezone = timezoneHeader || timezoneQuery;
    
    if (detectedTimezone && i18nHelpers.isValidTimezone(detectedTimezone)) {
      request.i18n.timezone = detectedTimezone as Timezone;
      request.i18n.isDetected = true;
      
      logger.debug({ detectedTimezone }, 'Detected timezone from headers/query');
    }

    // Detect country from various headers
    const countryHeaders = [
      request.headers['cf-ipcountry'], // Cloudflare
      request.headers['x-country-code'], // Custom header
      request.headers['x-vercel-ip-country'], // Vercel
      request.headers['x-forwarded-country'] // General forwarded header
    ];
    
    const detectedCountry = countryHeaders.find(country => 
      country && typeof country === 'string' && country.length === 2
    ) as string;
    
    if (detectedCountry) {
      request.i18n.country = detectedCountry.toUpperCase();
      logger.debug({ detectedCountry }, 'Detected country from headers');
    }

    // Set locale based on language and country
    if (request.i18n.country) {
      request.i18n.locale = `${request.i18n.language}-${request.i18n.country}`;
    } else {
      // Default locale mappings
      const defaultLocales: Record<Language, string> = {
        en: 'en-US',
        es: 'es-ES',
        fr: 'fr-FR',
        de: 'de-DE',
        it: 'it-IT',
        pt: 'pt-BR',
        ru: 'ru-RU',
        zh: 'zh-CN',
        ja: 'ja-JP',
        ko: 'ko-KR',
        ar: 'ar-SA',
        hi: 'hi-IN',
        nl: 'nl-NL',
        sv: 'sv-SE',
        no: 'no-NO',
        da: 'da-DK',
        fi: 'fi-FI',
        pl: 'pl-PL',
        tr: 'tr-TR',
        th: 'th-TH'
      };
      
      request.i18n.locale = defaultLocales[request.i18n.language] || 'en-US';
    }

    // Add response headers for client-side use
    reply.header('X-User-Language', request.i18n.language);
    reply.header('X-User-Timezone', request.i18n.timezone);
    reply.header('X-User-Locale', request.i18n.locale);
    if (request.i18n.country) {
      reply.header('X-User-Country', request.i18n.country);
    }

    logger.debug({
      language: request.i18n.language,
      timezone: request.i18n.timezone,
      locale: request.i18n.locale,
      country: request.i18n.country,
      isDetected: request.i18n.isDetected
    }, 'I18n context initialized');

  } catch (error) {
    logger.error({ error }, 'Failed to initialize i18n context, using defaults');
    
    // Ensure we always have a valid i18n context
    request.i18n = {
      language: 'en',
      timezone: 'UTC',
      locale: 'en-US',
      isDetected: false
    };
  }
}

/**
 * Helper function to get localized content using the request context
 */
export function getLocalizedContent(request: FastifyRequest, key: string): string {
  try {
    const i18nService = (request.server as any).i18nService;
    if (i18nService) {
      return i18nService.getLocalizedContent(key, request.i18n.language);
    }
    
    // Fallback to key if service not available
    return key;
  } catch (error) {
    logger.error({ error, key }, 'Failed to get localized content');
    return key;
  }
}

/**
 * Helper function to format dates using the request context
 */
export async function formatDateForRequest(request: FastifyRequest, date: Date): Promise<string> {
  try {
    // If user is authenticated, use their preferences
    if ((request as any).user?.id) {
      const i18nService = (request.server as any).i18nService;
      if (i18nService) {
        return await i18nService.formatDateForUser(date, (request as any).user.id);
      }
    }
    
    // Fall back to basic formatting based on detected locale
    return date.toLocaleDateString(request.i18n.locale, {
      timeZone: request.i18n.timezone
    });
  } catch (error) {
    logger.error({ error, date }, 'Failed to format date for request');
    return date.toLocaleDateString();
  }
}

/**
 * Helper function to format times using the request context
 */
export async function formatTimeForRequest(request: FastifyRequest, date: Date): Promise<string> {
  try {
    // If user is authenticated, use their preferences
    if ((request as any).user?.id) {
      const i18nService = (request.server as any).i18nService;
      if (i18nService) {
        return await i18nService.formatTimeForUser(date, (request as any).user.id);
      }
    }
    
    // Fall back to basic formatting based on detected locale
    return date.toLocaleTimeString(request.i18n.locale, {
      timeZone: request.i18n.timezone
    });
  } catch (error) {
    logger.error({ error, date }, 'Failed to format time for request');
    return date.toLocaleTimeString();
  }
}

/**
 * Helper function to format numbers using the request context
 */
export async function formatNumberForRequest(request: FastifyRequest, number: number): Promise<string> {
  try {
    // If user is authenticated, use their preferences
    if ((request as any).user?.id) {
      const i18nService = (request.server as any).i18nService;
      if (i18nService) {
        return await i18nService.formatNumberForUser(number, (request as any).user.id);
      }
    }
    
    // Fall back to basic formatting based on detected locale
    return new Intl.NumberFormat(request.i18n.locale).format(number);
  } catch (error) {
    logger.error({ error, number }, 'Failed to format number for request');
    return number.toString();
  }
}

/**
 * Helper function to format currency using the request context
 */
export async function formatCurrencyForRequest(
  request: FastifyRequest, 
  amount: number, 
  currency = 'USD'
): Promise<string> {
  try {
    // If user is authenticated, use their preferences
    if ((request as any).user?.id) {
      const i18nService = (request.server as any).i18nService;
      if (i18nService) {
        return await i18nService.formatCurrencyForUser(amount, (request as any).user.id);
      }
    }
    
    // Fall back to basic formatting based on detected locale
    return new Intl.NumberFormat(request.i18n.locale, {
      style: 'currency',
      currency
    }).format(amount);
  } catch (error) {
    logger.error({ error, amount, currency }, 'Failed to format currency for request');
    return `${currency} ${amount.toFixed(2)}`;
  }
}

/**
 * Hook to automatically apply i18n middleware to all routes
 */
export function registerI18nMiddleware(fastify: any) {
  fastify.addHook('preHandler', i18nMiddleware);
}