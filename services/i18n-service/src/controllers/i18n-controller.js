const Translation = require('../models/Translation');
const { translateText, detectLanguage } = require('../utils/machine-translation');
const { validateLocale, supportedLanguages } = require('../utils/locale-utils');
const logger = require('../utils/logger');
const Redis = require('ioredis');

/**
 * Internationalization Controller
 * 
 * Handles:
 * - Translation management (CRUD operations)
 * - Language resource compilation
 * - Machine translation integration
 * - Translation approval workflow
 * - Caching and performance optimization
 * - Import/export functionality
 */

class I18nController {
  constructor() {
    this.redis = new Redis(process.env.REDIS_URL);
    this.cachePrefix = 'i18n:';
    this.cacheTTL = 3600; // 1 hour
  }

  /**
   * Get translations for a specific language and namespace
   */
  async getTranslations(req, res) {
    try {
      const { language, namespace } = req.params;
      const { tenantId } = req.query;
      const namespaces = namespace ? [namespace] : undefined;

      // Validate language
      if (!validateLocale(language)) {
        return res.status(400).json({
          error: 'INVALID_LANGUAGE',
          message: 'Invalid language code',
          supportedLanguages: supportedLanguages.map(lang => lang.code)
        });
      }

      // Check cache first
      const cacheKey = `${this.cachePrefix}${language}:${namespace || 'all'}:${tenantId || 'global'}`;
      const cached = await this.redis.get(cacheKey);
      
      if (cached) {
        return res.json({
          success: true,
          data: JSON.parse(cached),
          cached: true
        });
      }

      // Get translations from database
      const translations = await Translation.getTranslations(language, tenantId, namespaces);
      
      // Build nested translation object
      const translationMap = {};
      
      translations.forEach(translation => {
        const key = translation.key;
        const ns = translation.namespace;
        
        if (!translationMap[ns]) {
          translationMap[ns] = {};
        }
        
        // Get tenant-specific value if available
        const value = translation.getValueForTenant(tenantId);
        
        // Handle nested keys (dot notation)
        this.setNestedValue(translationMap[ns], key, {
          value,
          pluralForms: translation.pluralForms,
          context: translation.context?.description
        });
      });

      // If namespace specified, return only that namespace
      const result = namespace ? translationMap[namespace] || {} : translationMap;

      // Cache the result
      await this.redis.setex(cacheKey, this.cacheTTL, JSON.stringify(result));

      res.json({
        success: true,
        data: result,
        language,
        namespace: namespace || 'all',
        count: translations.length
      });

    } catch (error) {
      logger.error('Error getting translations', error);
      res.status(500).json({
        error: 'TRANSLATION_FETCH_ERROR',
        message: 'Failed to fetch translations'
      });
    }
  }

  /**
   * Get a specific translation
   */
  async getTranslation(req, res) {
    try {
      const { language, namespace, key } = req.params;
      const { tenantId, interpolate } = req.query;

      const translation = await Translation.findByKey(key, namespace, language, tenantId);

      if (!translation) {
        // Try fallback language (English)
        if (language !== 'en') {
          const fallback = await Translation.findByKey(key, namespace, 'en', tenantId);
          if (fallback) {
            return res.json({
              success: true,
              data: {
                value: fallback.getValueForTenant(tenantId),
                fallback: true,
                originalLanguage: 'en'
              }
            });
          }
        }

        return res.status(404).json({
          error: 'TRANSLATION_NOT_FOUND',
          message: 'Translation not found',
          key: `${namespace}:${key}`,
          language
        });
      }

      let value = translation.getValueForTenant(tenantId);

      // Apply interpolation if requested
      if (interpolate) {
        try {
          const variables = JSON.parse(interpolate);
          value = translation.interpolate(variables);
        } catch (error) {
          logger.warn('Invalid interpolation variables', { interpolate, error: error.message });
        }
      }

      res.json({
        success: true,
        data: {
          key: translation.key,
          namespace: translation.namespace,
          language: translation.language,
          value,
          pluralForms: translation.pluralForms,
          context: translation.context,
          metadata: translation.metadata,
          version: translation.version,
          updatedAt: translation.updatedAt
        }
      });

    } catch (error) {
      logger.error('Error getting translation', error);
      res.status(500).json({
        error: 'TRANSLATION_FETCH_ERROR',
        message: 'Failed to fetch translation'
      });
    }
  }

  /**
   * Create or update a translation
   */
  async setTranslation(req, res) {
    try {
      const { language, namespace, key } = req.params;
      const {
        value,
        pluralForms,
        context,
        tags,
        tenantId,
        metadata = {}
      } = req.body;

      // Validate required fields
      if (!value) {
        return res.status(400).json({
          error: 'VALIDATION_ERROR',
          message: 'Translation value is required'
        });
      }

      // Validate language
      if (!validateLocale(language)) {
        return res.status(400).json({
          error: 'INVALID_LANGUAGE',
          message: 'Invalid language code'
        });
      }

      // Find existing translation or create new
      let translation = await Translation.findByKey(key, namespace, language, tenantId);

      if (translation) {
        // Update existing translation
        translation._original = { value: translation.value };
        translation.value = value;
        translation.pluralForms = pluralForms || translation.pluralForms;
        translation.context = { ...translation.context, ...context };
        translation.tags = tags || translation.tags;
        translation.metadata = { ...translation.metadata, ...metadata };
        translation.audit.updatedBy = req.user?.id;
      } else {
        // Create new translation
        translation = new Translation({
          key,
          namespace,
          language,
          value,
          pluralForms,
          context,
          tags,
          tenantId,
          metadata: {
            source: 'manual',
            status: 'draft',
            ...metadata
          },
          audit: {
            createdBy: req.user?.id,
            updatedBy: req.user?.id
          }
        });
      }

      await translation.save();

      // Clear cache
      await this.clearTranslationCache(language, namespace, tenantId);

      // Log translation activity
      logger.info('Translation updated', {
        key: `${namespace}:${key}`,
        language,
        tenantId,
        userId: req.user?.id,
        action: translation.isNew ? 'created' : 'updated'
      });

      res.status(translation.isNew ? 201 : 200).json({
        success: true,
        message: translation.isNew ? 'Translation created' : 'Translation updated',
        data: {
          id: translation._id,
          key: translation.key,
          namespace: translation.namespace,
          language: translation.language,
          value: translation.value,
          version: translation.version
        }
      });

    } catch (error) {
      logger.error('Error setting translation', error);
      
      if (error.code === 11000) {
        return res.status(409).json({
          error: 'TRANSLATION_EXISTS',
          message: 'Translation already exists for this key, namespace, and language'
        });
      }

      res.status(500).json({
        error: 'TRANSLATION_SAVE_ERROR',
        message: 'Failed to save translation'
      });
    }
  }

  /**
   * Delete a translation
   */
  async deleteTranslation(req, res) {
    try {
      const { language, namespace, key } = req.params;
      const { tenantId } = req.query;

      const translation = await Translation.findByKey(key, namespace, language, tenantId);

      if (!translation) {
        return res.status(404).json({
          error: 'TRANSLATION_NOT_FOUND',
          message: 'Translation not found'
        });
      }

      await Translation.deleteOne({ _id: translation._id });

      // Clear cache
      await this.clearTranslationCache(language, namespace, tenantId);

      logger.info('Translation deleted', {
        key: `${namespace}:${key}`,
        language,
        tenantId,
        userId: req.user?.id
      });

      res.json({
        success: true,
        message: 'Translation deleted successfully'
      });

    } catch (error) {
      logger.error('Error deleting translation', error);
      res.status(500).json({
        error: 'TRANSLATION_DELETE_ERROR',
        message: 'Failed to delete translation'
      });
    }
  }

  /**
   * Machine translate text
   */
  async machineTranslate(req, res) {
    try {
      const { text, targetLanguage, sourceLanguage, provider = 'google' } = req.body;

      if (!text || !targetLanguage) {
        return res.status(400).json({
          error: 'VALIDATION_ERROR',
          message: 'Text and target language are required'
        });
      }

      // Detect source language if not provided
      let detectedLanguage = sourceLanguage;
      if (!detectedLanguage) {
        detectedLanguage = await detectLanguage(text, provider);
      }

      // Perform translation
      const result = await translateText(text, detectedLanguage, targetLanguage, provider);

      res.json({
        success: true,
        data: {
          originalText: text,
          translatedText: result.text,
          sourceLanguage: detectedLanguage,
          targetLanguage,
          confidence: result.confidence,
          provider
        }
      });

    } catch (error) {
      logger.error('Error in machine translation', error);
      res.status(500).json({
        error: 'TRANSLATION_ERROR',
        message: 'Failed to translate text'
      });
    }
  }

  /**
   * Bulk translate missing translations
   */
  async bulkTranslate(req, res) {
    try {
      const { sourceLanguage, targetLanguages, namespace, provider = 'google' } = req.body;

      if (!sourceLanguage || !targetLanguages || !Array.isArray(targetLanguages)) {
        return res.status(400).json({
          error: 'VALIDATION_ERROR',
          message: 'Source language and target languages array are required'
        });
      }

      // Get source translations
      const sourceTranslations = await Translation.findByNamespace(
        namespace || 'common',
        sourceLanguage
      );

      const results = {
        processed: 0,
        created: 0,
        skipped: 0,
        errors: []
      };

      for (const translation of sourceTranslations) {
        for (const targetLang of targetLanguages) {
          try {
            results.processed++;

            // Check if translation already exists
            const existing = await Translation.findByKey(
              translation.key,
              translation.namespace,
              targetLang,
              translation.tenantId
            );

            if (existing) {
              results.skipped++;
              continue;
            }

            // Translate the text
            const translated = await translateText(
              translation.value,
              sourceLanguage,
              targetLang,
              provider
            );

            // Create new translation
            const newTranslation = new Translation({
              key: translation.key,
              namespace: translation.namespace,
              language: targetLang,
              value: translated.text,
              context: translation.context,
              tenantId: translation.tenantId,
              metadata: {
                source: 'machine',
                status: 'pending_review',
                quality: Math.min(translated.confidence * 100, 100),
                machineTranslation: {
                  provider,
                  confidence: translated.confidence,
                  translatedAt: new Date()
                }
              },
              audit: {
                createdBy: req.user?.id
              }
            });

            await newTranslation.save();
            results.created++;

            // Clear cache for target language
            await this.clearTranslationCache(targetLang, translation.namespace, translation.tenantId);

          } catch (error) {
            results.errors.push({
              key: translation.key,
              targetLanguage: targetLang,
              error: error.message
            });
          }
        }
      }

      logger.info('Bulk translation completed', {
        sourceLanguage,
        targetLanguages,
        namespace,
        results,
        userId: req.user?.id
      });

      res.json({
        success: true,
        message: 'Bulk translation completed',
        results
      });

    } catch (error) {
      logger.error('Error in bulk translation', error);
      res.status(500).json({
        error: 'BULK_TRANSLATION_ERROR',
        message: 'Failed to perform bulk translation'
      });
    }
  }

  /**
   * Import translations from file
   */
  async importTranslations(req, res) {
    try {
      const { language, namespace, format = 'json', overwrite = false } = req.body;
      const { translations } = req.body;

      if (!translations || !language) {
        return res.status(400).json({
          error: 'VALIDATION_ERROR',
          message: 'Translations data and language are required'
        });
      }

      const results = {
        processed: 0,
        created: 0,
        updated: 0,
        skipped: 0,
        errors: []
      };

      const processTranslations = async (obj, keyPrefix = '') => {
        for (const [key, value] of Object.entries(obj)) {
          const fullKey = keyPrefix ? `${keyPrefix}.${key}` : key;

          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            // Nested object, process recursively
            await processTranslations(value, fullKey);
          } else {
            try {
              results.processed++;

              // Check if translation exists
              const existing = await Translation.findByKey(
                fullKey,
                namespace || 'common',
                language,
                req.tenantId
              );

              if (existing && !overwrite) {
                results.skipped++;
                continue;
              }

              if (existing) {
                // Update existing
                existing.value = value;
                existing.audit.updatedBy = req.user?.id;
                existing.audit.importedFrom = {
                  source: 'file_import',
                  filename: req.file?.originalname,
                  importedAt: new Date(),
                  importedBy: req.user?.id
                };
                await existing.save();
                results.updated++;
              } else {
                // Create new
                const translation = new Translation({
                  key: fullKey,
                  namespace: namespace || 'common',
                  language,
                  value,
                  tenantId: req.tenantId,
                  metadata: {
                    source: 'imported',
                    status: 'pending_review'
                  },
                  audit: {
                    createdBy: req.user?.id,
                    importedFrom: {
                      source: 'file_import',
                      filename: req.file?.originalname,
                      importedAt: new Date(),
                      importedBy: req.user?.id
                    }
                  }
                });
                await translation.save();
                results.created++;
              }

            } catch (error) {
              results.errors.push({
                key: fullKey,
                error: error.message
              });
            }
          }
        }
      };

      await processTranslations(translations);

      // Clear cache
      await this.clearTranslationCache(language, namespace, req.tenantId);

      logger.info('Translation import completed', {
        language,
        namespace,
        results,
        userId: req.user?.id
      });

      res.json({
        success: true,
        message: 'Translations imported successfully',
        results
      });

    } catch (error) {
      logger.error('Error importing translations', error);
      res.status(500).json({
        error: 'IMPORT_ERROR',
        message: 'Failed to import translations'
      });
    }
  }

  /**
   * Export translations
   */
  async exportTranslations(req, res) {
    try {
      const { language, namespace, format = 'json' } = req.query;
      const { tenantId } = req.query;

      if (!language) {
        return res.status(400).json({
          error: 'VALIDATION_ERROR',
          message: 'Language is required'
        });
      }

      const namespaces = namespace ? [namespace] : undefined;
      const translations = await Translation.getTranslations(language, tenantId, namespaces);

      let exportData;
      let contentType;
      let filename;

      switch (format) {
        case 'json':
          exportData = this.buildNestedTranslations(translations, tenantId);
          contentType = 'application/json';
          filename = `translations_${language}_${namespace || 'all'}.json`;
          break;

        case 'csv':
          exportData = this.translationsToCsv(translations, tenantId);
          contentType = 'text/csv';
          filename = `translations_${language}_${namespace || 'all'}.csv`;
          break;

        case 'xlsx':
          // Would implement Excel export
          return res.status(501).json({
            error: 'FORMAT_NOT_SUPPORTED',
            message: 'Excel export not yet implemented'
          });

        default:
          return res.status(400).json({
            error: 'INVALID_FORMAT',
            message: 'Supported formats: json, csv'
          });
      }

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(exportData);

    } catch (error) {
      logger.error('Error exporting translations', error);
      res.status(500).json({
        error: 'EXPORT_ERROR',
        message: 'Failed to export translations'
      });
    }
  }

  /**
   * Get supported languages
   */
  async getSupportedLanguages(req, res) {
    try {
      res.json({
        success: true,
        data: supportedLanguages
      });
    } catch (error) {
      logger.error('Error getting supported languages', error);
      res.status(500).json({
        error: 'LANGUAGES_ERROR',
        message: 'Failed to get supported languages'
      });
    }
  }

  /**
   * Search translations
   */
  async searchTranslations(req, res) {
    try {
      const { q: searchTerm, language, namespace, status, limit = 50 } = req.query;

      if (!searchTerm || !language) {
        return res.status(400).json({
          error: 'VALIDATION_ERROR',
          message: 'Search term and language are required'
        });
      }

      const translations = await Translation.searchTranslations(searchTerm, language, {
        namespace,
        status,
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        data: translations,
        count: translations.length,
        searchTerm,
        language
      });

    } catch (error) {
      logger.error('Error searching translations', error);
      res.status(500).json({
        error: 'SEARCH_ERROR',
        message: 'Failed to search translations'
      });
    }
  }

  // Helper methods

  setNestedValue(obj, path, value) {
    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }

    current[keys[keys.length - 1]] = value;
  }

  buildNestedTranslations(translations, tenantId) {
    const result = {};

    translations.forEach(translation => {
      const value = translation.getValueForTenant(tenantId);
      this.setNestedValue(result, translation.key, value);
    });

    return JSON.stringify(result, null, 2);
  }

  translationsToCsv(translations, tenantId) {
    const headers = ['Key', 'Namespace', 'Value', 'Context', 'Status', 'Updated'];
    const rows = [headers];

    translations.forEach(translation => {
      const value = translation.getValueForTenant(tenantId);
      rows.push([
        translation.key,
        translation.namespace,
        typeof value === 'string' ? value : JSON.stringify(value),
        translation.context?.description || '',
        translation.metadata?.status || '',
        translation.updatedAt?.toISOString() || ''
      ]);
    });

    return rows.map(row => 
      row.map(cell => `"${cell?.toString().replace(/"/g, '""') || ''}"`).join(',')
    ).join('\n');
  }

  async clearTranslationCache(language, namespace, tenantId) {
    const patterns = [
      `${this.cachePrefix}${language}:${namespace || '*'}:${tenantId || '*'}`,
      `${this.cachePrefix}${language}:all:${tenantId || '*'}`
    ];

    for (const pattern of patterns) {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    }
  }
}

module.exports = new I18nController();