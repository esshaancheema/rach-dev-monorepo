const axios = require('axios');
const logger = require('./logger');

/**
 * Machine Translation Utilities
 * 
 * Integrates with multiple translation providers:
 * - Google Translate API
 * - AWS Translate
 * - Azure Translator
 * - DeepL API
 */

class MachineTranslationProvider {
  constructor() {
    this.providers = {
      google: new GoogleTranslateProvider(),
      aws: new AWSTranslateProvider(),
      azure: new AzureTranslateProvider(),
      deepl: new DeepLProvider()
    };
  }

  async translateText(text, sourceLanguage, targetLanguage, provider = 'google') {
    try {
      const translationProvider = this.providers[provider];
      if (!translationProvider) {
        throw new Error(`Unsupported translation provider: ${provider}`);
      }

      const result = await translationProvider.translate(text, sourceLanguage, targetLanguage);
      
      logger.debug('Translation completed', {
        provider,
        sourceLanguage,
        targetLanguage,
        textLength: text.length,
        confidence: result.confidence
      });

      return result;
    } catch (error) {
      logger.error('Translation failed', {
        provider,
        sourceLanguage,
        targetLanguage,
        error: error.message
      });
      throw error;
    }
  }

  async detectLanguage(text, provider = 'google') {
    try {
      const translationProvider = this.providers[provider];
      if (!translationProvider) {
        throw new Error(`Unsupported translation provider: ${provider}`);
      }

      const result = await translationProvider.detectLanguage(text);
      
      logger.debug('Language detected', {
        provider,
        detectedLanguage: result.language,
        confidence: result.confidence
      });

      return result.language;
    } catch (error) {
      logger.error('Language detection failed', {
        provider,
        error: error.message
      });
      throw error;
    }
  }

  async getSupportedLanguages(provider = 'google') {
    try {
      const translationProvider = this.providers[provider];
      return await translationProvider.getSupportedLanguages();
    } catch (error) {
      logger.error('Failed to get supported languages', {
        provider,
        error: error.message
      });
      throw error;
    }
  }
}

class GoogleTranslateProvider {
  constructor() {
    this.apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
    this.baseURL = 'https://translation.googleapis.com/language/translate/v2';
  }

  async translate(text, sourceLanguage, targetLanguage) {
    if (!this.apiKey) {
      throw new Error('Google Translate API key not configured');
    }

    try {
      const response = await axios.post(`${this.baseURL}`, {
        q: text,
        source: sourceLanguage,
        target: targetLanguage,
        format: 'text'
      }, {
        params: {
          key: this.apiKey
        }
      });

      const translation = response.data.data.translations[0];
      
      return {
        text: translation.translatedText,
        confidence: this.calculateConfidence(text, translation.translatedText),
        detectedSourceLanguage: translation.detectedSourceLanguage || sourceLanguage
      };
    } catch (error) {
      throw new Error(`Google Translate API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async detectLanguage(text) {
    if (!this.apiKey) {
      throw new Error('Google Translate API key not configured');
    }

    try {
      const response = await axios.post(`${this.baseURL}/detect`, {
        q: text
      }, {
        params: {
          key: this.apiKey
        }
      });

      const detection = response.data.data.detections[0][0];
      
      return {
        language: detection.language,
        confidence: detection.confidence
      };
    } catch (error) {
      throw new Error(`Google Translate detect API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async getSupportedLanguages() {
    if (!this.apiKey) {
      throw new Error('Google Translate API key not configured');
    }

    try {
      const response = await axios.get(`${this.baseURL}/languages`, {
        params: {
          key: this.apiKey
        }
      });

      return response.data.data.languages.map(lang => ({
        code: lang.language,
        name: lang.name || lang.language
      }));
    } catch (error) {
      throw new Error(`Google Translate languages API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  calculateConfidence(originalText, translatedText) {
    // Simple heuristic based on length ratio and character similarity
    const lengthRatio = Math.min(originalText.length, translatedText.length) / 
                       Math.max(originalText.length, translatedText.length);
    
    // Base confidence on length ratio (closer to 1.0 is better)
    const confidence = 0.7 + (lengthRatio * 0.3);
    
    return Math.max(0.5, Math.min(1.0, confidence));
  }
}

class AWSTranslateProvider {
  constructor() {
    // AWS SDK would be required for full implementation
    this.region = process.env.AWS_REGION || 'us-east-1';
    this.accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    this.secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  }

  async translate(text, sourceLanguage, targetLanguage) {
    // Implementation would use AWS SDK
    throw new Error('AWS Translate provider not yet implemented');
  }

  async detectLanguage(text) {
    // Implementation would use AWS Comprehend
    throw new Error('AWS language detection not yet implemented');
  }

  async getSupportedLanguages() {
    // Return AWS Translate supported languages
    return [
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Spanish' },
      { code: 'fr', name: 'French' },
      { code: 'de', name: 'German' },
      { code: 'it', name: 'Italian' },
      { code: 'pt', name: 'Portuguese' },
      { code: 'ru', name: 'Russian' },
      { code: 'ja', name: 'Japanese' },
      { code: 'ko', name: 'Korean' },
      { code: 'zh', name: 'Chinese' }
    ];
  }
}

class AzureTranslateProvider {
  constructor() {
    this.apiKey = process.env.AZURE_TRANSLATOR_KEY;
    this.region = process.env.AZURE_TRANSLATOR_REGION;
    this.baseURL = 'https://api.cognitive.microsofttranslator.com';
  }

  async translate(text, sourceLanguage, targetLanguage) {
    if (!this.apiKey) {
      throw new Error('Azure Translator API key not configured');
    }

    try {
      const response = await axios.post(`${this.baseURL}/translate`, [{
        text: text
      }], {
        params: {
          'api-version': '3.0',
          from: sourceLanguage,
          to: targetLanguage
        },
        headers: {
          'Ocp-Apim-Subscription-Key': this.apiKey,
          'Ocp-Apim-Subscription-Region': this.region,
          'Content-Type': 'application/json'
        }
      });

      const translation = response.data[0].translations[0];
      
      return {
        text: translation.text,
        confidence: translation.confidence || 0.9,
        detectedSourceLanguage: response.data[0].detectedLanguage?.language || sourceLanguage
      };
    } catch (error) {
      throw new Error(`Azure Translator API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async detectLanguage(text) {
    if (!this.apiKey) {
      throw new Error('Azure Translator API key not configured');
    }

    try {
      const response = await axios.post(`${this.baseURL}/detect`, [{
        text: text
      }], {
        params: {
          'api-version': '3.0'
        },
        headers: {
          'Ocp-Apim-Subscription-Key': this.apiKey,
          'Ocp-Apim-Subscription-Region': this.region,
          'Content-Type': 'application/json'
        }
      });

      const detection = response.data[0];
      
      return {
        language: detection.language,
        confidence: detection.score
      };
    } catch (error) {
      throw new Error(`Azure Translator detect API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async getSupportedLanguages() {
    if (!this.apiKey) {
      throw new Error('Azure Translator API key not configured');
    }

    try {
      const response = await axios.get(`${this.baseURL}/languages`, {
        params: {
          'api-version': '3.0',
          scope: 'translation'
        }
      });

      return Object.entries(response.data.translation).map(([code, info]) => ({
        code,
        name: info.name
      }));
    } catch (error) {
      throw new Error(`Azure Translator languages API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }
}

class DeepLProvider {
  constructor() {
    this.apiKey = process.env.DEEPL_API_KEY;
    this.baseURL = process.env.DEEPL_API_URL || 'https://api-free.deepl.com/v2';
  }

  async translate(text, sourceLanguage, targetLanguage) {
    if (!this.apiKey) {
      throw new Error('DeepL API key not configured');
    }

    try {
      const response = await axios.post(`${this.baseURL}/translate`, {
        text: [text],
        source_lang: sourceLanguage.toUpperCase(),
        target_lang: targetLanguage.toUpperCase()
      }, {
        headers: {
          'Authorization': `DeepL-Auth-Key ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const translation = response.data.translations[0];
      
      return {
        text: translation.text,
        confidence: 0.95, // DeepL typically has high confidence
        detectedSourceLanguage: translation.detected_source_language?.toLowerCase() || sourceLanguage
      };
    } catch (error) {
      throw new Error(`DeepL API error: ${error.response?.data?.message || error.message}`);
    }
  }

  async detectLanguage(text) {
    // DeepL doesn't have a separate detect endpoint, but we can use translate with auto-detect
    if (!this.apiKey) {
      throw new Error('DeepL API key not configured');
    }

    try {
      const response = await axios.post(`${this.baseURL}/translate`, {
        text: [text.substring(0, 100)], // Use only first 100 characters for detection
        target_lang: 'EN'
      }, {
        headers: {
          'Authorization': `DeepL-Auth-Key ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const detectedLanguage = response.data.translations[0].detected_source_language;
      
      return {
        language: detectedLanguage.toLowerCase(),
        confidence: 0.9
      };
    } catch (error) {
      throw new Error(`DeepL language detection error: ${error.response?.data?.message || error.message}`);
    }
  }

  async getSupportedLanguages() {
    if (!this.apiKey) {
      throw new Error('DeepL API key not configured');
    }

    try {
      const response = await axios.get(`${this.baseURL}/languages`, {
        params: {
          type: 'target'
        },
        headers: {
          'Authorization': `DeepL-Auth-Key ${this.apiKey}`
        }
      });

      return response.data.map(lang => ({
        code: lang.language.toLowerCase(),
        name: lang.name
      }));
    } catch (error) {
      throw new Error(`DeepL languages API error: ${error.response?.data?.message || error.message}`);
    }
  }
}

// Create singleton instance
const machineTranslation = new MachineTranslationProvider();

// Export functions
module.exports = {
  translateText: (text, sourceLanguage, targetLanguage, provider) => 
    machineTranslation.translateText(text, sourceLanguage, targetLanguage, provider),
  
  detectLanguage: (text, provider) => 
    machineTranslation.detectLanguage(text, provider),
  
  getSupportedLanguages: (provider) => 
    machineTranslation.getSupportedLanguages(provider),

  // Export provider classes for testing
  GoogleTranslateProvider,
  AWSTranslateProvider,
  AzureTranslateProvider,
  DeepLProvider
};