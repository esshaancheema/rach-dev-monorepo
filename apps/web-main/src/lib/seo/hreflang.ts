export interface HreflangLink {
  hreflang: string;
  href: string;
}

export interface LocaleConfig {
  code: string;
  name: string;
  region?: string;
  direction?: 'ltr' | 'rtl';
}

// Supported locales configuration
export const SUPPORTED_LOCALES: LocaleConfig[] = [
  { code: 'en', name: 'English', region: 'US' },
  { code: 'es', name: 'Español', region: 'ES' },
  { code: 'fr', name: 'Français', region: 'FR' },
  { code: 'de', name: 'Deutsch', region: 'DE' },
  { code: 'ar', name: 'العربية', region: 'SA', direction: 'rtl' },
  { code: 'hi', name: 'हिन्दी', region: 'IN' },
  { code: 'zh', name: '中文', region: 'CN' },
];

// Default locale
export const DEFAULT_LOCALE = 'en';

/**
 * Generate hreflang links for a given page path
 * @param currentPath - The current page path (without locale prefix)
 * @param currentLocale - The current locale
 * @param baseUrl - The base URL of the site
 * @returns Array of hreflang links
 */
export function generateHreflangLinks(
  currentPath: string,
  currentLocale: string = DEFAULT_LOCALE,
  baseUrl: string = 'https://zoptal.com'
): HreflangLink[] {
  const hreflangLinks: HreflangLink[] = [];
  
  // Clean the current path (remove leading slash if present)
  const cleanPath = currentPath.startsWith('/') ? currentPath.slice(1) : currentPath;
  
  // Generate links for all supported locales
  SUPPORTED_LOCALES.forEach(locale => {
    const localeWithRegion = locale.region ? `${locale.code}-${locale.region.toLowerCase()}` : locale.code;
    
    let href: string;
    if (locale.code === DEFAULT_LOCALE) {
      // Default locale doesn't need locale prefix
      href = cleanPath ? `${baseUrl}/${cleanPath}` : baseUrl;
    } else {
      // Non-default locales need locale prefix
      href = cleanPath ? `${baseUrl}/${locale.code}/${cleanPath}` : `${baseUrl}/${locale.code}`;
    }
    
    hreflangLinks.push({
      hreflang: localeWithRegion,
      href,
    });
  });
  
  // Add x-default link (points to default locale)
  const defaultHref = cleanPath ? `${baseUrl}/${cleanPath}` : baseUrl;
  hreflangLinks.push({
    hreflang: 'x-default',
    href: defaultHref,
  });
  
  return hreflangLinks;
}

/**
 * Get the locale-specific URL for a given path
 * @param path - The path
 * @param locale - The target locale
 * @param baseUrl - The base URL
 * @returns The localized URL
 */
export function getLocalizedUrl(
  path: string,
  locale: string,
  baseUrl: string = 'https://zoptal.com'
): string {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  if (locale === DEFAULT_LOCALE) {
    return cleanPath ? `${baseUrl}/${cleanPath}` : baseUrl;
  }
  
  return cleanPath ? `${baseUrl}/${locale}/${cleanPath}` : `${baseUrl}/${locale}`;
}

/**
 * Extract locale from URL path
 * @param path - The URL path
 * @returns The extracted locale or default locale
 */
export function extractLocaleFromPath(path: string): string {
  const segments = path.split('/').filter(Boolean);
  const firstSegment = segments[0];
  
  const supportedLocaleCodes = SUPPORTED_LOCALES.map(l => l.code);
  
  if (firstSegment && supportedLocaleCodes.includes(firstSegment)) {
    return firstSegment;
  }
  
  return DEFAULT_LOCALE;
}

/**
 * Get the path without locale prefix
 * @param path - The full path with potential locale prefix
 * @returns The path without locale prefix
 */
export function getPathWithoutLocale(path: string): string {
  const segments = path.split('/').filter(Boolean);
  const firstSegment = segments[0];
  
  const supportedLocaleCodes = SUPPORTED_LOCALES.map(l => l.code);
  
  if (firstSegment && supportedLocaleCodes.includes(firstSegment)) {
    // Remove the locale segment
    return '/' + segments.slice(1).join('/');
  }
  
  return path;
}

/**
 * Get locale configuration by code
 * @param code - The locale code
 * @returns The locale configuration or undefined
 */
export function getLocaleConfig(code: string): LocaleConfig | undefined {
  return SUPPORTED_LOCALES.find(locale => locale.code === code);
}

/**
 * Check if a locale is supported
 * @param locale - The locale code to check
 * @returns Whether the locale is supported
 */
export function isSupportedLocale(locale: string): boolean {
  return SUPPORTED_LOCALES.some(l => l.code === locale);
}

/**
 * Get language name from locale code
 * @param locale - The locale code
 * @returns The language name or the locale code if not found
 */
export function getLanguageName(locale: string): string {
  const config = getLocaleConfig(locale);
  return config?.name || locale;
}

/**
 * Generate hreflang links for location-specific pages
 * @param country - The country slug
 * @param city - The city slug (optional)
 * @param service - The service slug (optional)
 * @param currentLocale - The current locale
 * @param baseUrl - The base URL
 * @returns Array of hreflang links
 */
export function generateLocationHreflangLinks(
  country: string,
  city?: string,
  service?: string,
  currentLocale: string = DEFAULT_LOCALE,
  baseUrl: string = 'https://zoptal.com'
): HreflangLink[] {
  let path = `locations/${country}`;
  if (city) path += `/${city}`;
  if (service) path += `/${service}`;
  
  return generateHreflangLinks(path, currentLocale, baseUrl);
}

/**
 * Generate hreflang links for service pages
 * @param service - The service slug
 * @param currentLocale - The current locale
 * @param baseUrl - The base URL
 * @returns Array of hreflang links
 */
export function generateServiceHreflangLinks(
  service: string,
  currentLocale: string = DEFAULT_LOCALE,
  baseUrl: string = 'https://zoptal.com'
): HreflangLink[] {
  return generateHreflangLinks(`services/${service}`, currentLocale, baseUrl);
}