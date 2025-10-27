import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import {
  i18nPreferencesSchema,
  updateI18nPreferencesSchema,
  autoDetectPreferencesSchema,
  browserLocaleSchema,
  UpdateI18nPreferences,
  AutoDetectPreferences,
  BrowserLocale,
  SUPPORTED_LANGUAGES,
  TIMEZONE_REGIONS
} from '../schemas/i18n.schema';
import { validate } from '../middleware/validate';
import { logger } from '../utils/logger';
import { createRouteSchema, securitySchemes, standardResponses } from '../utils/swagger-schemas';

/**
 * Internationalization routes for language and timezone preferences
 */
export async function i18nRoutes(fastify: FastifyInstance) {

  /**
   * Get supported languages
   */
  fastify.get('/languages', {
    schema: createRouteSchema({
      summary: 'Get all supported languages',
      description: `
Get the complete list of supported languages with their language codes and display names.

**Supported Languages:**
- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Italian (it)
- Portuguese (pt)
- Russian (ru)
- Chinese (zh)
- Japanese (ja)
- Korean (ko)
- Arabic (ar)
- Hindi (hi)
- And more...

**Use Cases:**
- Populate language selection dropdowns
- Display available languages to users
- Validate language codes from client requests
      `,
      tags: ['Internationalization'],
      response: {
        200: {
          description: 'Supported languages retrieved successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                languages: {
                  type: 'object',
                  additionalProperties: { type: 'string' },
                  example: {
                    en: 'English',
                    es: 'Español',
                    fr: 'Français',
                    de: 'Deutsch'
                  }
                },
                total: { type: 'number', example: 20 }
              }
            }
          }
        }
      },
      security: securitySchemes.none
    })
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const i18nService = (fastify as any).i18nService;
      const languages = i18nService.getSupportedLanguages();
      
      reply.send({
        success: true,
        data: {
          languages,
          total: Object.keys(languages).length
        }
      });
    } catch (error) {
      logger.error({ error }, 'Failed to get supported languages');
      throw error;
    }
  });

  /**
   * Get supported timezones
   */
  fastify.get('/timezones', {
    schema: createRouteSchema({
      summary: 'Get all supported timezones',
      description: `
Get the complete list of supported timezones organized by geographical regions.

**Timezone Regions:**
- North America (America/New_York, America/Los_Angeles, etc.)
- Europe (Europe/London, Europe/Paris, etc.)
- Asia Pacific (Asia/Tokyo, Asia/Singapore, etc.)
- South America (America/Sao_Paulo, America/Buenos_Aires, etc.)
- Africa (Africa/Cairo, Africa/Johannesburg, etc.)
- UTC Offsets (UTC, Etc/GMT+1, etc.)

**Response Format:**
- Organized by geographical regions for better UX
- Includes timezone identifiers and display names
- Supports IANA timezone database format
      `,
      tags: ['Internationalization'],
      response: {
        200: {
          description: 'Supported timezones retrieved successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                regions: {
                  type: 'object',
                  properties: {
                    'North America': {
                      type: 'array',
                      items: { type: 'string' },
                      example: ['America/New_York', 'America/Los_Angeles']
                    },
                    'Europe': {
                      type: 'array',
                      items: { type: 'string' },
                      example: ['Europe/London', 'Europe/Paris']
                    }
                  }
                },
                total: { type: 'number', example: 150 }
              }
            }
          }
        }
      },
      security: securitySchemes.none
    })
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const i18nService = (fastify as any).i18nService;
      const regions = i18nService.getTimezonesByRegion();
      const total = Object.values(regions).flat().length;
      
      reply.send({
        success: true,
        data: {
          regions,
          total
        }
      });
    } catch (error) {
      logger.error({ error }, 'Failed to get supported timezones');
      throw error;
    }
  });

  /**
   * Auto-detect user preferences
   */
  fastify.post('/detect', {
    preHandler: validate({ body: autoDetectPreferencesSchema }),
    schema: createRouteSchema({
      summary: 'Auto-detect user locale preferences',
      description: `
Automatically detect user's preferred language, timezone, and other locale settings based on browser information and request headers.

**Detection Sources:**
- Accept-Language header for language preference
- User-Agent string for platform-specific defaults
- Timezone information from client
- Country code for regional preferences

**What Gets Detected:**
- Primary language preference
- Timezone (if provided)
- Date/time format preferences
- Number format conventions
- Currency preferences (based on country)
- Measurement system (metric vs imperial)

**Use Cases:**
- Set initial preferences for new users
- Provide smart defaults during registration
- Improve user experience with localized settings
      `,
      tags: ['Internationalization'],
      body: {
        type: 'object',
        properties: {
          userAgent: { 
            type: 'string', 
            example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            description: 'Browser user agent string'
          },
          acceptLanguage: { 
            type: 'string', 
            example: 'en-US,en;q=0.9,es;q=0.8',
            description: 'Accept-Language header value'
          },
          timezone: { 
            type: 'string', 
            example: 'America/New_York',
            description: 'Client timezone (optional)'
          },
          country: { 
            type: 'string', 
            example: 'US',
            description: 'Country code (optional)'
          }
        },
        required: ['userAgent', 'acceptLanguage']
      },
      response: {
        200: {
          description: 'Preferences detected successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                language: { type: 'string', example: 'en' },
                timezone: { type: 'string', example: 'America/New_York' },
                dateFormat: { type: 'string', example: 'MM/DD/YYYY' },
                timeFormat: { type: 'string', example: '12h' },
                numberFormat: { type: 'string', example: 'en-US' },
                currency: { type: 'string', example: 'USD' },
                firstDayOfWeek: { type: 'string', example: 'sunday' },
                measurementSystem: { type: 'string', example: 'imperial' }
              }
            },
            metadata: {
              type: 'object',
              properties: {
                detectionSources: {
                  type: 'array',
                  items: { type: 'string' },
                  example: ['accept-language', 'country', 'user-agent']
                },
                confidence: { type: 'number', example: 0.85, description: 'Detection confidence score (0-1)' }
              }
            }
          }
        },
        400: standardResponses[400]
      },
      security: securitySchemes.none
    })
  }, async (request: FastifyRequest<{ Body: AutoDetectPreferences }>, reply: FastifyReply) => {
    try {
      const { userAgent, acceptLanguage, timezone, country } = request.body;
      
      logger.info({ userAgent, acceptLanguage, timezone, country }, 'Auto-detecting user preferences');
      
      const i18nService = (fastify as any).i18nService;
      const detectedPreferences = await i18nService.autoDetectPreferences({
        userAgent,
        acceptLanguage,
        timezone,
        country
      });

      // Calculate confidence score based on available data
      const sources = [];
      if (acceptLanguage) sources.push('accept-language');
      if (timezone) sources.push('timezone');
      if (country) sources.push('country');
      if (userAgent) sources.push('user-agent');
      
      const confidence = sources.length / 4; // Max 4 sources

      reply.send({
        success: true,
        data: detectedPreferences,
        metadata: {
          detectionSources: sources,
          confidence
        }
      });
    } catch (error) {
      logger.error({ error }, 'Failed to auto-detect preferences');
      throw error;
    }
  });

  /**
   * Detect from browser information
   */
  fastify.post('/detect-browser', {
    preHandler: validate({ body: browserLocaleSchema }),
    schema: createRouteSchema({
      summary: 'Detect preferences from browser locale information',
      description: `
Detect user preferences from detailed browser locale information, typically obtained from JavaScript's Intl API.

**Browser Detection Features:**
- Primary language from navigator.language
- All available languages from navigator.languages
- Timezone from Intl.DateTimeFormat
- Currency from browser/system locale
- Country information (if available)

**JavaScript Example:**
\`\`\`javascript
const browserInfo = {
  language: navigator.language,
  languages: navigator.languages,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  timeZoneOffset: new Date().getTimezoneOffset(),
  country: 'US' // From IP geolocation or other source
};
\`\`\`

**Use Cases:**
- Client-side preference detection
- More accurate timezone detection
- Fallback when server headers are unavailable
      `,
      tags: ['Internationalization'],
      body: {
        type: 'object',
        properties: {
          language: { 
            type: 'string', 
            example: 'en-US',
            description: 'Primary browser language'
          },
          languages: { 
            type: 'array',
            items: { type: 'string' },
            example: ['en-US', 'en', 'es'],
            description: 'All browser languages in preference order'
          },
          timezone: { 
            type: 'string', 
            example: 'America/New_York',
            description: 'Browser-detected timezone'
          },
          timeZoneOffset: { 
            type: 'number', 
            example: -300,
            description: 'Timezone offset in minutes'
          },
          currency: { 
            type: 'string', 
            example: 'USD',
            description: 'Browser/system currency (optional)'
          },
          country: { 
            type: 'string', 
            example: 'US',
            description: 'Country code (optional)'
          }
        },
        required: ['language', 'languages', 'timezone', 'timeZoneOffset']
      },
      response: {
        200: {
          description: 'Preferences detected from browser successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                language: { type: 'string', example: 'en' },
                timezone: { type: 'string', example: 'America/New_York' },
                dateFormat: { type: 'string', example: 'MM/DD/YYYY' },
                timeFormat: { type: 'string', example: '12h' },
                numberFormat: { type: 'string', example: 'en-US' },
                currency: { type: 'string', example: 'USD' }
              }
            }
          }
        },
        400: standardResponses[400]
      },
      security: securitySchemes.none
    })
  }, async (request: FastifyRequest<{ Body: BrowserLocale }>, reply: FastifyReply) => {
    try {
      const browserInfo = request.body;
      
      logger.info({ browserInfo }, 'Detecting preferences from browser info');
      
      const i18nService = (fastify as any).i18nService;
      const detectedPreferences = await i18nService.detectFromBrowser(browserInfo);

      reply.send({
        success: true,
        data: detectedPreferences
      });
    } catch (error) {
      logger.error({ error }, 'Failed to detect from browser');
      throw error;
    }
  });

  /**
   * Get current user's preferences (requires authentication)
   */
  fastify.get('/preferences', {
    preHandler: [],
    schema: createRouteSchema({
      summary: 'Get current user\'s internationalization preferences',
      description: `
Retrieve the authenticated user's complete internationalization preferences.

**Returned Preferences:**
- Language preference (language code)
- Timezone (IANA timezone identifier)
- Date format preference
- Time format (12h/24h)
- Number format locale
- Currency preference
- First day of week (Sunday/Monday)
- Measurement system (metric/imperial)

**Default Values:**
If user hasn't set preferences, returns sensible defaults based on their registration location or browser detection.
      `,
      tags: ['Internationalization'],
      response: {
        200: {
          description: 'User preferences retrieved successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                language: { type: 'string', example: 'en' },
                timezone: { type: 'string', example: 'America/New_York' },
                dateFormat: { type: 'string', example: 'MM/DD/YYYY' },
                timeFormat: { type: 'string', example: '12h' },
                numberFormat: { type: 'string', example: 'en-US' },
                currency: { type: 'string', example: 'USD' },
                firstDayOfWeek: { type: 'string', example: 'sunday' },
                measurementSystem: { type: 'string', example: 'metric' }
              }
            }
          }
        },
        401: standardResponses[401],
        500: standardResponses[500]
      },
      security: securitySchemes.bearer
    })
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.id;
      
      logger.info({ userId }, 'Getting user i18n preferences');
      
      const i18nService = (fastify as any).i18nService;
      const preferences = await i18nService.getUserPreferences(userId);

      reply.send({
        success: true,
        data: preferences
      });
    } catch (error) {
      logger.error({ error }, 'Failed to get user preferences');
      throw error;
    }
  });

  /**
   * Update user's preferences (requires authentication)
   */
  fastify.put('/preferences', {
    preHandler: [validate({ body: updateI18nPreferencesSchema })],
    schema: createRouteSchema({
      summary: 'Update user\'s internationalization preferences',
      description: `
Update the authenticated user's internationalization preferences.

**Updatable Preferences:**
- Language: Any supported language code
- Timezone: Any valid IANA timezone identifier
- Date format: Various date display formats
- Time format: 12-hour or 24-hour display
- Number format: Locale-specific number formatting
- Currency: Preferred currency for displays
- First day of week: Sunday or Monday
- Measurement system: Metric or Imperial

**Validation:**
- Language codes are validated against supported languages
- Timezones are validated against IANA timezone database
- All format preferences are validated against allowed values

**Effect:**
- Changes take effect immediately for subsequent requests
- Email notifications and other communications will use new preferences
- API responses will format dates/numbers according to new preferences
      `,
      tags: ['Internationalization'],
      body: {
        type: 'object',
        properties: {
          language: { 
            type: 'string', 
            example: 'es',
            description: 'Language code (optional)'
          },
          timezone: { 
            type: 'string', 
            example: 'Europe/Madrid',
            description: 'IANA timezone identifier (optional)'
          },
          dateFormat: { 
            type: 'string', 
            example: 'DD/MM/YYYY',
            description: 'Date display format (optional)'
          },
          timeFormat: { 
            type: 'string', 
            example: '24h',
            description: 'Time display format (optional)'
          },
          numberFormat: { 
            type: 'string', 
            example: 'es-ES',
            description: 'Number format locale (optional)'
          },
          currency: { 
            type: 'string', 
            example: 'EUR',
            description: 'Preferred currency (optional)'
          },
          firstDayOfWeek: { 
            type: 'string', 
            example: 'monday',
            description: 'First day of week (optional)'
          },
          measurementSystem: { 
            type: 'string', 
            example: 'metric',
            description: 'Measurement system (optional)'
          }
        }
      },
      response: {
        200: {
          description: 'Preferences updated successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Preferences updated successfully' },
            data: {
              type: 'object',
              properties: {
                language: { type: 'string', example: 'es' },
                timezone: { type: 'string', example: 'Europe/Madrid' },
                dateFormat: { type: 'string', example: 'DD/MM/YYYY' },
                timeFormat: { type: 'string', example: '24h' },
                numberFormat: { type: 'string', example: 'es-ES' },
                currency: { type: 'string', example: 'EUR' },
                firstDayOfWeek: { type: 'string', example: 'monday' },
                measurementSystem: { type: 'string', example: 'metric' }
              }
            }
          }
        },
        400: standardResponses[400],
        401: standardResponses[401],
        500: standardResponses[500]
      },
      security: securitySchemes.bearer
    })
  }, async (request: FastifyRequest<{ Body: UpdateI18nPreferences }>, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.id;
      const preferences = request.body;
      
      logger.info({ userId, preferences }, 'Updating user i18n preferences');
      
      const i18nService = (fastify as any).i18nService;
      const updatedPreferences = await i18nService.updateUserPreferences(userId, preferences);

      reply.send({
        success: true,
        message: 'Preferences updated successfully',
        data: updatedPreferences
      });
    } catch (error) {
      logger.error({ error }, 'Failed to update user preferences');
      throw error;
    }
  });

  /**
   * Get current request context (useful for debugging)
   */
  fastify.get('/context', {
    schema: createRouteSchema({
      summary: 'Get current request\'s internationalization context',
      description: `
Get the internationalization context for the current request, including detected or configured preferences.

**Context Information:**
- Detected/configured language
- Detected/configured timezone
- Resolved locale
- Country information (if available)
- Detection status (detected vs user-configured)

**Use Cases:**
- Debugging locale detection
- Verifying current settings
- Understanding what preferences are being applied
      `,
      tags: ['Internationalization'],
      response: {
        200: {
          description: 'I18n context retrieved successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                language: { type: 'string', example: 'en' },
                timezone: { type: 'string', example: 'America/New_York' },
                locale: { type: 'string', example: 'en-US' },
                country: { type: 'string', example: 'US' },
                isDetected: { type: 'boolean', example: true },
                isAuthenticated: { type: 'boolean', example: false }
              }
            }
          }
        }
      },
      security: securitySchemes.none
    })
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const context = {
        ...request.i18n,
        isAuthenticated: !!(request as any).user
      };

      reply.send({
        success: true,
        data: context
      });
    } catch (error) {
      logger.error({ error }, 'Failed to get i18n context');
      throw error;
    }
  });
}