import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';

export interface LanguageInfo {
  code: string;
  name: string;
  nativeName: string;
  rtl: boolean;
  pluralRule: string;
}

export interface TranslationData {
  [namespace: string]: {
    [key: string]: any;
  };
}

export interface I18nState {
  language: string;
  translations: TranslationData;
  loadedNamespaces: Set<string>;
  isLoading: boolean;
  isReady: boolean;
  supportedLanguages: LanguageInfo[];
  fallbackLanguage: string;
}

export interface I18nContextType extends I18nState {
  changeLanguage: (language: string) => Promise<void>;
  loadNamespaces: (namespaces: string[]) => Promise<void>;
  isNamespaceLoaded: (namespace: string) => boolean;
  getLanguageInfo: (language?: string) => LanguageInfo | undefined;
  formatters: {
    formatNumber: (number: number, options?: Intl.NumberFormatOptions) => string;
    formatDate: (date: Date | string, options?: Intl.DateTimeFormatOptions) => string;
    formatCurrency: (amount: number, currency?: string, options?: Intl.NumberFormatOptions) => string;
    formatRelativeTime: (value: number, unit: Intl.RelativeTimeFormatUnit) => string;
    formatList: (items: string[], options?: Intl.ListFormatOptions) => string;
  };
}

type I18nAction =
  | { type: 'SET_LANGUAGE'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_READY'; payload: boolean }
  | { type: 'SET_TRANSLATIONS'; payload: { namespace: string; translations: any } }
  | { type: 'SET_SUPPORTED_LANGUAGES'; payload: LanguageInfo[] }
  | { type: 'ADD_LOADED_NAMESPACE'; payload: string };

const initialState: I18nState = {
  language: 'en',
  translations: {},
  loadedNamespaces: new Set(),
  isLoading: false,
  isReady: false,
  supportedLanguages: [],
  fallbackLanguage: 'en'
};

function i18nReducer(state: I18nState, action: I18nAction): I18nState {
  switch (action.type) {
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_READY':
      return { ...state, isReady: action.payload };
    
    case 'SET_TRANSLATIONS':
      return {
        ...state,
        translations: {
          ...state.translations,
          [action.payload.namespace]: action.payload.translations
        }
      };
    
    case 'SET_SUPPORTED_LANGUAGES':
      return { ...state, supportedLanguages: action.payload };
    
    case 'ADD_LOADED_NAMESPACE':
      return {
        ...state,
        loadedNamespaces: new Set([...state.loadedNamespaces, action.payload])
      };
    
    default:
      return state;
  }
}

export const I18nContext = createContext<I18nContextType | null>(null);

export interface I18nProviderProps {
  children: React.ReactNode;
  defaultLanguage?: string;
  fallbackLanguage?: string;
  apiBaseUrl?: string;
  debug?: boolean;
}

export function I18nProvider({
  children,
  defaultLanguage = 'en',
  fallbackLanguage = 'en',
  apiBaseUrl = '/api/i18n',
  debug = false
}: I18nProviderProps) {
  const [state, dispatch] = useReducer(i18nReducer, {
    ...initialState,
    language: defaultLanguage,
    fallbackLanguage
  });

  // Initialize i18n service
  useEffect(() => {
    const initializeI18n = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });

        // Load supported languages
        const languagesResponse = await fetch(`${apiBaseUrl}/languages`);
        if (languagesResponse.ok) {
          const { data: supportedLanguages } = await languagesResponse.json();
          dispatch({ type: 'SET_SUPPORTED_LANGUAGES', payload: supportedLanguages });
        }

        // Detect and set initial language
        const detectedLanguage = detectBrowserLanguage(state.supportedLanguages) || defaultLanguage;
        const savedLanguage = localStorage.getItem('preferred-language');
        const initialLanguage = savedLanguage || detectedLanguage;

        await loadLanguage(initialLanguage);
        dispatch({ type: 'SET_LANGUAGE', payload: initialLanguage });
        dispatch({ type: 'SET_READY', payload: true });

      } catch (error) {
        console.error('Failed to initialize i18n:', error);
        // Fallback to default language without API
        dispatch({ type: 'SET_LANGUAGE', payload: defaultLanguage });
        dispatch({ type: 'SET_READY', payload: true });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeI18n();
  }, [defaultLanguage, apiBaseUrl]);

  // Load translations for a specific language
  const loadLanguage = useCallback(async (language: string, namespaces: string[] = ['common']) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      for (const namespace of namespaces) {
        if (state.loadedNamespaces.has(`${language}:${namespace}`)) {
          continue; // Skip if already loaded
        }

        const response = await fetch(`${apiBaseUrl}/translations/${language}/${namespace}`);
        
        if (response.ok) {
          const { data: translations } = await response.json();
          dispatch({ 
            type: 'SET_TRANSLATIONS', 
            payload: { namespace, translations } 
          });
          dispatch({ 
            type: 'ADD_LOADED_NAMESPACE', 
            payload: `${language}:${namespace}` 
          });
        } else if (language !== fallbackLanguage) {
          // Try fallback language
          if (debug) {
            console.warn(`Failed to load ${namespace} for ${language}, trying fallback`);
          }
          await loadLanguage(fallbackLanguage, [namespace]);
        }
      }
    } catch (error) {
      console.error(`Failed to load language ${language}:`, error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [apiBaseUrl, fallbackLanguage, state.loadedNamespaces, debug]);

  // Change language
  const changeLanguage = useCallback(async (newLanguage: string) => {
    if (newLanguage === state.language) {
      return; // No change needed
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Load basic namespaces for new language
      await loadLanguage(newLanguage, ['common']);
      
      dispatch({ type: 'SET_LANGUAGE', payload: newLanguage });
      
      // Update document language and direction
      document.documentElement.lang = newLanguage;
      const languageInfo = getLanguageInfo(newLanguage);
      document.documentElement.dir = languageInfo?.rtl ? 'rtl' : 'ltr';
      
      // Save preference
      localStorage.setItem('preferred-language', newLanguage);
      
      if (debug) {
        console.log(`Language changed to: ${newLanguage}`);
      }
    } catch (error) {
      console.error(`Failed to change language to ${newLanguage}:`, error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.language, loadLanguage, debug]);

  // Load specific namespaces
  const loadNamespaces = useCallback(async (namespaces: string[]) => {
    const unloadedNamespaces = namespaces.filter(
      ns => !state.loadedNamespaces.has(`${state.language}:${ns}`)
    );

    if (unloadedNamespaces.length > 0) {
      await loadLanguage(state.language, unloadedNamespaces);
    }
  }, [state.language, state.loadedNamespaces, loadLanguage]);

  // Check if namespace is loaded
  const isNamespaceLoaded = useCallback((namespace: string): boolean => {
    return state.loadedNamespaces.has(`${state.language}:${namespace}`);
  }, [state.language, state.loadedNamespaces]);

  // Get language information
  const getLanguageInfo = useCallback((language?: string): LanguageInfo | undefined => {
    const lang = language || state.language;
    return state.supportedLanguages.find(l => l.code === lang);
  }, [state.language, state.supportedLanguages]);

  // Formatters using current language
  const formatters = {
    formatNumber: useCallback((number: number, options?: Intl.NumberFormatOptions): string => {
      try {
        return new Intl.NumberFormat(state.language, options).format(number);
      } catch (error) {
        return new Intl.NumberFormat(fallbackLanguage, options).format(number);
      }
    }, [state.language, fallbackLanguage]),

    formatDate: useCallback((date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
      try {
        return new Intl.DateTimeFormat(state.language, options).format(new Date(date));
      } catch (error) {
        return new Intl.DateTimeFormat(fallbackLanguage, options).format(new Date(date));
      }
    }, [state.language, fallbackLanguage]),

    formatCurrency: useCallback((amount: number, currency = 'USD', options?: Intl.NumberFormatOptions): string => {
      try {
        return new Intl.NumberFormat(state.language, {
          style: 'currency',
          currency,
          ...options
        }).format(amount);
      } catch (error) {
        return new Intl.NumberFormat(fallbackLanguage, {
          style: 'currency',
          currency,
          ...options
        }).format(amount);
      }
    }, [state.language, fallbackLanguage]),

    formatRelativeTime: useCallback((value: number, unit: Intl.RelativeTimeFormatUnit): string => {
      try {
        return new Intl.RelativeTimeFormat(state.language).format(value, unit);
      } catch (error) {
        return new Intl.RelativeTimeFormat(fallbackLanguage).format(value, unit);
      }
    }, [state.language, fallbackLanguage]),

    formatList: useCallback((items: string[], options?: Intl.ListFormatOptions): string => {
      try {
        return new Intl.ListFormat(state.language, options).format(items);
      } catch (error) {
        return new Intl.ListFormat(fallbackLanguage, options).format(items);
      }
    }, [state.language, fallbackLanguage])
  };

  const contextValue: I18nContextType = {
    ...state,
    changeLanguage,
    loadNamespaces,
    isNamespaceLoaded,
    getLanguageInfo,
    formatters
  };

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
}

// Utility functions
function detectBrowserLanguage(supportedLanguages: LanguageInfo[]): string | null {
  if (typeof navigator === 'undefined') {
    return null;
  }

  const browserLanguages = navigator.languages || [navigator.language];
  
  for (const browserLang of browserLanguages) {
    // Exact match
    const exactMatch = supportedLanguages.find(lang => lang.code === browserLang);
    if (exactMatch) {
      return exactMatch.code;
    }
    
    // Base language match (e.g., en-US -> en)
    const baseLang = browserLang.split('-')[0];
    const baseMatch = supportedLanguages.find(lang => lang.code === baseLang);
    if (baseMatch) {
      return baseMatch.code;
    }
  }

  return null;
}

// Hook to use i18n context
export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}