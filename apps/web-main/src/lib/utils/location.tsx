'use client';

// Location detection and geolocation utilities
import { LOCATIONS } from '@/lib/constants/locations';

export interface LocationData {
  ip?: string;
  country?: string;
  countryCode?: string;
  region?: string;
  regionName?: string;
  city?: string;
  zip?: string;
  lat?: number;
  lon?: number;
  timezone?: string;
  currency?: string;
  isp?: string;
  mobile?: boolean;
  proxy?: boolean;
  hosting?: boolean;
}

export interface DetectedLocation {
  city: string;
  region: string;
  country: string;
  countryCode: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  timezone: string;
  currency: string;
  isSupported: boolean;
  confidence: 'high' | 'medium' | 'low';
  source: 'gps' | 'ip' | 'cache' | 'default';
}

export interface LocationPermission {
  granted: boolean;
  denied: boolean;
  prompt: boolean;
}

// Cache keys
const LOCATION_CACHE_KEY = 'zoptal_user_location';
const LOCATION_PERMISSION_KEY = 'zoptal_location_permission';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Default location (fallback)
const DEFAULT_LOCATION: DetectedLocation = {
  city: 'San Francisco',
  region: 'California',
  country: 'United States',
  countryCode: 'US',
  coordinates: { lat: 37.7749, lng: -122.4194 },
  timezone: 'America/Los_Angeles',
  currency: 'USD',
  isSupported: true,
  confidence: 'low',
  source: 'default',
};

// Location service URLs
const IP_GEOLOCATION_SERVICES = [
  {
    name: 'ipapi',
    url: 'https://ipapi.co/json/',
    parser: (data: any): LocationData => ({
      ip: data.ip,
      country: data.country_name,
      countryCode: data.country_code,
      region: data.region_code,
      regionName: data.region,
      city: data.city,
      zip: data.postal,
      lat: data.latitude,
      lon: data.longitude,
      timezone: data.timezone,
      currency: data.currency,
    }),
  },
  {
    name: 'ipinfo',
    url: 'https://ipinfo.io/json',
    parser: (data: any): LocationData => {
      const [lat, lon] = data.loc ? data.loc.split(',').map(Number) : [null, null];
      return {
        ip: data.ip,
        country: data.country,
        countryCode: data.country,
        region: data.region,
        city: data.city,
        zip: data.postal,
        lat: lat || undefined,
        lon: lon || undefined,
        timezone: data.timezone,
      };
    },
  },
  {
    name: 'json-ip',
    url: 'https://json-ip.com/',
    parser: (data: any): LocationData => ({
      ip: data.ip,
      country: data.country,
      countryCode: data.country_code,
      region: data.region,
      city: data.city,
      lat: data.latitude,
      lon: data.longitude,
      timezone: data.timezone,
    }),
  },
];

// Utility functions
export function isLocationCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_DURATION;
}

export function getCachedLocation(): DetectedLocation | null {
  if (typeof window === 'undefined') return null;

  try {
    const cached = localStorage.getItem(LOCATION_CACHE_KEY);
    if (!cached) return null;

    const { location, timestamp } = JSON.parse(cached);
    if (!isLocationCacheValid(timestamp)) {
      localStorage.removeItem(LOCATION_CACHE_KEY);
      return null;
    }

    return location;
  } catch (error) {
    console.warn('Failed to read cached location:', error);
    return null;
  }
}

export function setCachedLocation(location: DetectedLocation): void {
  if (typeof window === 'undefined') return;

  try {
    const cacheData = {
      location,
      timestamp: Date.now(),
    };
    localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.warn('Failed to cache location:', error);
  }
}

export function getLocationPermission(): LocationPermission {
  if (typeof window === 'undefined' || !navigator.permissions) {
    return { granted: false, denied: false, prompt: true };
  }

  try {
    const cached = localStorage.getItem(LOCATION_PERMISSION_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    console.warn('Failed to read cached permission:', error);
  }

  return { granted: false, denied: false, prompt: true };
}

export function setLocationPermission(permission: LocationPermission): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(LOCATION_PERMISSION_KEY, JSON.stringify(permission));
  } catch (error) {
    console.warn('Failed to cache permission:', error);
  }
}

// GPS location detection
export async function getGPSLocation(): Promise<DetectedLocation | null> {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    return null;
  }

  return new Promise((resolve) => {
    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000, // 5 minutes
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse geocoding to get address from coordinates
          const location = await reverseGeocode(latitude, longitude);
          setLocationPermission({ granted: true, denied: false, prompt: false });
          resolve(location);
        } catch (error) {
          console.warn('Reverse geocoding failed:', error);
          resolve(null);
        }
      },
      (error) => {
        console.warn('GPS location failed:', error);
        setLocationPermission({ 
          granted: false, 
          denied: error.code === error.PERMISSION_DENIED, 
          prompt: error.code !== error.PERMISSION_DENIED 
        });
        resolve(null);
      },
      options
    );
  });
}

// Reverse geocoding using OpenStreetMap Nominatim API
export async function reverseGeocode(lat: number, lng: number): Promise<DetectedLocation> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'Zoptal Website (https://zoptal.com)',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Reverse geocoding request failed');
    }

    const data = await response.json();
    const address = data.address || {};

    return {
      city: address.city || address.town || address.village || 'Unknown City',
      region: address.state || address.region || 'Unknown Region',
      country: address.country || 'Unknown Country',
      countryCode: address.country_code?.toUpperCase() || 'US',
      coordinates: { lat, lng },
      timezone: getTimezoneFromCoordinates(lat, lng),
      currency: getCurrencyFromCountryCode(address.country_code?.toUpperCase() || 'US'),
      isSupported: true,
      confidence: 'high',
      source: 'gps',
    };
  } catch (error) {
    console.warn('Reverse geocoding failed:', error);
    throw error;
  }
}

// IP-based location detection
export async function getIPLocation(): Promise<DetectedLocation | null> {
  for (const service of IP_GEOLOCATION_SERVICES) {
    try {
      const response = await fetch(service.url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        console.warn(`${service.name} request failed:`, response.status);
        continue;
      }

      const data = await response.json();
      const locationData = service.parser(data);

      if (!locationData.city || !locationData.country) {
        console.warn(`${service.name} returned incomplete data`);
        continue;
      }

      const detectedLocation: DetectedLocation = {
        city: locationData.city,
        region: locationData.regionName || locationData.region || 'Unknown Region',
        country: locationData.country,
        countryCode: locationData.countryCode || 'US',
        coordinates: {
          lat: locationData.lat || 0,
          lng: locationData.lon || 0,
        },
        timezone: locationData.timezone || getTimezoneFromCoordinates(locationData.lat || 0, locationData.lon || 0),
        currency: locationData.currency || getCurrencyFromCountryCode(locationData.countryCode || 'US'),
        isSupported: true,
        confidence: 'medium',
        source: 'ip',
      };

      return detectedLocation;
    } catch (error) {
      console.warn(`${service.name} failed:`, error);
      continue;
    }
  }

  return null;
}

// Main location detection function
export async function detectUserLocation(): Promise<DetectedLocation> {
  // Check cache first
  const cached = getCachedLocation();
  if (cached) {
    return cached;
  }

  // Try GPS location first (most accurate)
  const permission = getLocationPermission();
  if (!permission.denied) {
    try {
      const gpsLocation = await getGPSLocation();
      if (gpsLocation) {
        setCachedLocation(gpsLocation);
        return gpsLocation;
      }
    } catch (error) {
      console.warn('GPS location detection failed:', error);
    }
  }

  // Fallback to IP-based location
  try {
    const ipLocation = await getIPLocation();
    if (ipLocation) {
      setCachedLocation(ipLocation);
      return ipLocation;
    }
  } catch (error) {
    console.warn('IP location detection failed:', error);
  }

  // Return default location as last resort
  return DEFAULT_LOCATION;
}

// Timezone utilities
export function getTimezoneFromCoordinates(lat: number, lng: number): string {
  // Simple timezone detection based on coordinates
  // This is a simplified version - in production, you might want to use a proper timezone API
  const longitude = lng;
  
  if (longitude >= -180 && longitude < -157.5) return 'Pacific/Honolulu';
  if (longitude >= -157.5 && longitude < -135) return 'America/Anchorage';
  if (longitude >= -135 && longitude < -120) return 'America/Los_Angeles';
  if (longitude >= -120 && longitude < -105) return 'America/Denver';
  if (longitude >= -105 && longitude < -90) return 'America/Chicago';
  if (longitude >= -90 && longitude < -75) return 'America/New_York';
  if (longitude >= -75 && longitude < -60) return 'America/Halifax';
  if (longitude >= -60 && longitude < -30) return 'America/Sao_Paulo';
  if (longitude >= -30 && longitude < 0) return 'Atlantic/Azores';
  if (longitude >= 0 && longitude < 15) return 'Europe/London';
  if (longitude >= 15 && longitude < 30) return 'Europe/Berlin';
  if (longitude >= 30 && longitude < 45) return 'Europe/Moscow';
  if (longitude >= 45 && longitude < 60) return 'Asia/Dubai';
  if (longitude >= 60 && longitude < 75) return 'Asia/Karachi';
  if (longitude >= 75 && longitude < 90) return 'Asia/Kolkata';
  if (longitude >= 90 && longitude < 105) return 'Asia/Bangkok';
  if (longitude >= 105 && longitude < 120) return 'Asia/Shanghai';
  if (longitude >= 120 && longitude < 135) return 'Asia/Tokyo';
  if (longitude >= 135 && longitude < 150) return 'Australia/Sydney';
  if (longitude >= 150 && longitude <= 180) return 'Pacific/Auckland';
  
  return 'UTC';
}

// Currency utilities
export function getCurrencyFromCountryCode(countryCode: string): string {
  const currencyMap: Record<string, string> = {
    'US': 'USD', 'CA': 'CAD', 'GB': 'GBP', 'EU': 'EUR', 'DE': 'EUR', 'FR': 'EUR',
    'IT': 'EUR', 'ES': 'EUR', 'NL': 'EUR', 'BE': 'EUR', 'AT': 'EUR', 'PT': 'EUR',
    'IE': 'EUR', 'FI': 'EUR', 'GR': 'EUR', 'LU': 'EUR', 'MT': 'EUR', 'CY': 'EUR',
    'SK': 'EUR', 'SI': 'EUR', 'EE': 'EUR', 'LV': 'EUR', 'LT': 'EUR',
    'JP': 'JPY', 'CN': 'CNY', 'IN': 'INR', 'AU': 'AUD', 'NZ': 'NZD',
    'BR': 'BRL', 'MX': 'MXN', 'RU': 'RUB', 'KR': 'KRW', 'SG': 'SGD',
    'HK': 'HKD', 'TW': 'TWD', 'TH': 'THB', 'MY': 'MYR', 'ID': 'IDR',
    'PH': 'PHP', 'VN': 'VND', 'SA': 'SAR', 'AE': 'AED', 'ZA': 'ZAR',
    'NG': 'NGN', 'EG': 'EGP', 'MA': 'MAD', 'KE': 'KES', 'GH': 'GHS',
    'CH': 'CHF', 'NO': 'NOK', 'SE': 'SEK', 'DK': 'DKK', 'PL': 'PLN',
    'CZ': 'CZK', 'HU': 'HUF', 'RO': 'RON', 'BG': 'BGN', 'HR': 'HRK',
    'TR': 'TRY', 'IL': 'ILS', 'QA': 'QAR', 'KW': 'KWD', 'BH': 'BHD',
    'OM': 'OMR', 'JO': 'JOD', 'LB': 'LBP', 'AR': 'ARS', 'CL': 'CLP',
    'CO': 'COP', 'PE': 'PEN', 'UY': 'UYU', 'PY': 'PYG', 'BO': 'BOB',
    'EC': 'USD', 'VE': 'VES',
  };

  return currencyMap[countryCode] || 'USD';
}

// Distance calculation
export function calculateDistance(
  lat1: number, 
  lng1: number, 
  lat2: number, 
  lng2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Find nearest supported location
export function findNearestSupportedLocation(userLocation: DetectedLocation): any {
  if (!LOCATIONS || LOCATIONS.length === 0) {
    return null;
  }

  let nearest = LOCATIONS[0];
  let minDistance = calculateDistance(
    userLocation.coordinates.lat,
    userLocation.coordinates.lng,
    LOCATIONS[0].coordinates.lat,
    LOCATIONS[0].coordinates.lng
  );

  for (let i = 1; i < LOCATIONS.length; i++) {
    const distance = calculateDistance(
      userLocation.coordinates.lat,
      userLocation.coordinates.lng,
      LOCATIONS[i].coordinates.lat,
      LOCATIONS[i].coordinates.lng
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearest = LOCATIONS[i];
    }
  }

  return {
    ...nearest,
    distance: minDistance,
  };
}

// Location-based personalization
export function getLocationBasedGreeting(location: DetectedLocation): string {
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
  
  return `Good ${timeOfDay} from ${location.city}!`;
}

export function getLocationBasedCTA(location: DetectedLocation): string {
  const isBusinessHours = isInBusinessHours(location.timezone);
  
  if (isBusinessHours) {
    return `Talk to our ${location.city} team today`;
  } else {
    return `Schedule a call with our ${location.city} team`;
  }
}

export function isInBusinessHours(timezone: string): boolean {
  try {
    const now = new Date();
    const localTime = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
    const hour = localTime.getHours();
    const day = localTime.getDay();
    
    // Business hours: Monday-Friday, 9 AM - 6 PM
    return day >= 1 && day <= 5 && hour >= 9 && hour < 18;
  } catch (error) {
    console.warn('Failed to check business hours:', error);
    return true; // Default to business hours
  }
}

// Location analytics
export function trackLocationDetection(location: DetectedLocation): void {
  if (typeof window === 'undefined') return;

  try {
    // Track location detection event
    if (window.gtag) {
      window.gtag('event', 'location_detected', {
        city: location.city,
        country: location.country,
        source: location.source,
        confidence: location.confidence,
      });
    }

    // Track with custom analytics
    if ((window as any).analytics) {
      (window as any).analytics.track('Location Detected', {
        city: location.city,
        region: location.region,
        country: location.country,
        countryCode: location.countryCode,
        source: location.source,
        confidence: location.confidence,
        timezone: location.timezone,
        currency: location.currency,
      });
    }
  } catch (error) {
    console.warn('Failed to track location detection:', error);
  }
}

// React hook for location detection
export function useLocationDetection() {
  const [location, setLocation] = useState<DetectedLocation>(DEFAULT_LOCATION);
  const [loading, setLoading] = useState(typeof window === 'undefined' ? false : true);
  const [error, setError] = useState<string | null>(null);

  const detectLocation = async () => {
    try {
      setLoading(true);
      setError(null);
      const detectedLocation = await detectUserLocation();
      setLocation(detectedLocation);
      trackLocationDetection(detectedLocation);
      return detectedLocation;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to detect location';
      setError(errorMessage);
      console.error('Location detection error:', err);
      return DEFAULT_LOCATION;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      detectLocation();
    }
  }, []);

  // Handle server-side rendering
  if (typeof window === 'undefined') {
    return {
      location: DEFAULT_LOCATION,
      loading: false,
      error: null,
      refetch: () => Promise.resolve(DEFAULT_LOCATION),
    };
  }

  return {
    location,
    loading,
    error,
    refetch: detectLocation,
  };
}

// Export additional types and utilities
export type { LocationData, DetectedLocation, LocationPermission };
export { useState, useEffect } from 'react';