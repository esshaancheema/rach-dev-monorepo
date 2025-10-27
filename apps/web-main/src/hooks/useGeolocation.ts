'use client';

import { useState, useEffect } from 'react';

export interface GeolocationData {
  country: string;
  city: string;
  region: string;
  timezone: string;
  latitude?: number;
  longitude?: number;
  isLoading: boolean;
  error: string | null;
}

export interface LocationBasedContent {
  businessHours: {
    timezone: string;
    workingHours: string;
    isBusinessHours: boolean;
  };
  currency: string;
  phoneNumber: string;
  language: string;
  supportAvailable: boolean;
}

const defaultLocation: GeolocationData = {
  country: 'US',
  city: 'San Francisco',
  region: 'California',
  timezone: 'America/Los_Angeles',
  isLoading: false,
  error: null
};

const locationMappings = {
  'US': {
    currency: 'USD',
    phoneNumber: '+1 (555) 012-3456',
    language: 'en-US',
    businessHoursStart: 9,
    businessHoursEnd: 18,
    timezoneFallback: 'America/Los_Angeles'
  },
  'CA': {
    currency: 'CAD',
    phoneNumber: '+1 (555) 012-3457',
    language: 'en-CA',
    businessHoursStart: 9,
    businessHoursEnd: 18,
    timezoneFallback: 'America/Toronto'
  },
  'GB': {
    currency: 'GBP',
    phoneNumber: '+44 20 1234 5678',
    language: 'en-GB',
    businessHoursStart: 9,
    businessHoursEnd: 17,
    timezoneFallback: 'Europe/London'
  },
  'IN': {
    currency: 'INR',
    phoneNumber: '+91 98765 43210',
    language: 'en-IN',
    businessHoursStart: 9,
    businessHoursEnd: 18,
    timezoneFallback: 'Asia/Kolkata'
  },
  'AU': {
    currency: 'AUD',
    phoneNumber: '+61 2 1234 5678',
    language: 'en-AU',
    businessHoursStart: 9,
    businessHoursEnd: 17,
    timezoneFallback: 'Australia/Sydney'
  }
};

export function useGeolocation(): GeolocationData & { locationContent: LocationBasedContent } {
  const [location, setLocation] = useState<GeolocationData>({
    ...defaultLocation,
    isLoading: true
  });

  useEffect(() => {
    async function detectLocation() {
      try {
        // First try IP-based geolocation
        const ipResponse = await fetch('/api/location', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });

        if (ipResponse.ok) {
          const ipData = await ipResponse.json();
          setLocation({
            country: ipData.country || defaultLocation.country,
            city: ipData.city || defaultLocation.city,
            region: ipData.region || defaultLocation.region,
            timezone: ipData.timezone || defaultLocation.timezone,
            latitude: ipData.latitude,
            longitude: ipData.longitude,
            isLoading: false,
            error: null
          });
          return;
        }

        // Fallback to browser geolocation API
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              try {
                const { latitude, longitude } = position.coords;
                
                // Reverse geocoding using a public API
                const geocodeResponse = await fetch(
                  `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
                );
                
                if (geocodeResponse.ok) {
                  const geocodeData = await geocodeResponse.json();
                  setLocation({
                    country: geocodeData.countryCode || defaultLocation.country,
                    city: geocodeData.city || defaultLocation.city,
                    region: geocodeData.principalSubdivision || defaultLocation.region,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    latitude,
                    longitude,
                    isLoading: false,
                    error: null
                  });
                } else {
                  throw new Error('Geocoding failed');
                }
              } catch (error) {
                console.warn('Reverse geocoding failed:', error);
                setLocation({ ...defaultLocation, isLoading: false });
              }
            },
            (error) => {
              console.warn('Geolocation permission denied:', error);
              setLocation({ ...defaultLocation, isLoading: false });
            },
            {
              timeout: 10000,
              maximumAge: 600000, // Cache for 10 minutes
            }
          );
        } else {
          setLocation({ ...defaultLocation, isLoading: false });
        }
      } catch (error) {
        console.error('Location detection failed:', error);
        setLocation({
          ...defaultLocation,
          isLoading: false,
          error: 'Failed to detect location'
        });
      }
    }

    detectLocation();
  }, []);

  // Generate location-based content
  const locationContent: LocationBasedContent = {
    businessHours: (() => {
      const mapping = locationMappings[location.country as keyof typeof locationMappings] || locationMappings['US'];
      const now = new Date();
      const userTimezone = location.timezone || mapping.timezoneFallback;
      
      // Get current time in user's timezone
      const userTime = new Date(now.toLocaleString('en-US', { timeZone: userTimezone }));
      const currentHour = userTime.getHours();
      
      const isBusinessHours = currentHour >= mapping.businessHoursStart && currentHour < mapping.businessHoursEnd;
      
      return {
        timezone: userTimezone,
        workingHours: `${mapping.businessHoursStart}:00 - ${mapping.businessHoursEnd}:00`,
        isBusinessHours
      };
    })(),
    currency: (locationMappings[location.country as keyof typeof locationMappings] || locationMappings['US']).currency,
    phoneNumber: (locationMappings[location.country as keyof typeof locationMappings] || locationMappings['US']).phoneNumber,
    language: (locationMappings[location.country as keyof typeof locationMappings] || locationMappings['US']).language,
    supportAvailable: (() => {
      const mapping = locationMappings[location.country as keyof typeof locationMappings] || locationMappings['US'];
      const now = new Date();
      const userTime = new Date(now.toLocaleString('en-US', { timeZone: location.timezone || mapping.timezoneFallback }));
      const currentHour = userTime.getHours();
      return currentHour >= mapping.businessHoursStart && currentHour < mapping.businessHoursEnd;
    })()
  };

  return {
    ...location,
    locationContent
  };
}

// Utility function for formatting location display
export function formatLocationDisplay(location: GeolocationData): string {
  if (location.city && location.region) {
    return `${location.city}, ${location.region}`;
  } else if (location.city) {
    return location.city;
  } else if (location.region) {
    return location.region;
  } else {
    return location.country;
  }
}

// Utility function to check if user is in a specific region/timezone for content personalization
export function isUserInRegion(location: GeolocationData, targetRegions: string[]): boolean {
  return targetRegions.some(region => 
    location.country.toLowerCase().includes(region.toLowerCase()) ||
    location.region.toLowerCase().includes(region.toLowerCase())
  );
}