'use client';

import { useState, useEffect } from 'react';
import { LOCATIONS } from '@zoptal/config';

interface LocationData {
  city: string;
  country: string;
  region?: string;
  countryName?: string;
  displayName?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  timezone?: string;
  currency?: string;
}

interface UseLocationReturn {
  location: LocationData | null;
  loading: boolean;
  error: string | null;
  detectLocation: () => Promise<void>;
}

// Extended location data with display names and coordinates
const extendedLocations = [
  {
    country: 'usa',
    city: 'new-york',
    region: 'NY',
    countryName: 'United States',
    displayName: 'New York',
    coordinates: { lat: 40.7128, lng: -74.0060 },
    timezone: 'America/New_York',
    currency: 'USD'
  },
  {
    country: 'usa',
    city: 'san-francisco',
    region: 'CA',
    countryName: 'United States',
    displayName: 'San Francisco',
    coordinates: { lat: 37.7749, lng: -122.4194 },
    timezone: 'America/Los_Angeles',
    currency: 'USD'
  },
  {
    country: 'usa',
    city: 'los-angeles',
    region: 'CA',
    countryName: 'United States',
    displayName: 'Los Angeles',
    coordinates: { lat: 34.0522, lng: -118.2437 },
    timezone: 'America/Los_Angeles',
    currency: 'USD'
  },
  {
    country: 'uk',
    city: 'london',
    region: 'England',
    countryName: 'United Kingdom',
    displayName: 'London',
    coordinates: { lat: 51.5074, lng: -0.1278 },
    timezone: 'Europe/London',
    currency: 'GBP'
  },
  {
    country: 'uae',
    city: 'dubai',
    region: 'Dubai',
    countryName: 'United Arab Emirates',
    displayName: 'Dubai',
    coordinates: { lat: 25.2048, lng: 55.2708 },
    timezone: 'Asia/Dubai',
    currency: 'AED'
  },
  {
    country: 'singapore',
    city: 'singapore',
    region: 'Singapore',
    countryName: 'Singapore',
    displayName: 'Singapore', 
    coordinates: { lat: 1.3521, lng: 103.8198 },
    timezone: 'Asia/Singapore',
    currency: 'SGD'
  },
  {
    country: 'india',
    city: 'mumbai',
    region: 'Maharashtra',
    countryName: 'India',
    displayName: 'Mumbai',
    coordinates: { lat: 19.0760, lng: 72.8777 },
    timezone: 'Asia/Kolkata',
    currency: 'INR'
  },
  {
    country: 'india',
    city: 'bangalore',
    region: 'Karnataka',
    countryName: 'India',
    displayName: 'Bangalore',
    coordinates: { lat: 12.9716, lng: 77.5946 },
    timezone: 'Asia/Kolkata',
    currency: 'INR'
  }
];

// Fallback location for when detection fails
const defaultLocation: LocationData = {
  city: 'Global',
  country: 'worldwide',
  region: 'Global',
  countryName: 'Worldwide',
  displayName: 'Global',
  timezone: 'UTC',
  currency: 'USD'
};

export function useLocation(): UseLocationReturn {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get location from IP geolocation
  const detectLocationFromIP = async (): Promise<LocationData | null> => {
    try {
      // Try multiple IP geolocation services for better accuracy
      const services = [
        'https://ipapi.co/json/',
        'https://ip-api.com/json/',
        'https://ipinfo.io/json'
      ];

      for (const service of services) {
        try {
          const response = await fetch(service);
          const data = await response.json();
          
          if (data.city && data.country) {
            const detectedCity = data.city.toLowerCase().replace(/\s+/g, '-');
            const detectedCountry = data.country_code?.toLowerCase() || data.countryCode?.toLowerCase();
            
            // Find matching location in our extended data
            const matchedLocation = extendedLocations.find(loc => 
              loc.city.includes(detectedCity.slice(0, 5)) || 
              detectedCity.includes(loc.city.slice(0, 5))
            );

            if (matchedLocation) {
              return matchedLocation;
            }

            // Return detected location even if not in our list
            return {
              city: data.city,
              country: detectedCountry || 'unknown',
              region: data.region || data.regionName,
              countryName: data.country,
              displayName: data.city,
              coordinates: data.lat && data.lon ? {
                lat: parseFloat(data.lat),
                lng: parseFloat(data.lon)
              } : undefined,
              timezone: data.timezone,
              currency: data.currency
            };
          }
        } catch (serviceError) {
          console.warn(`Failed to get location from ${service}:`, serviceError);
          continue;
        }
      }
      
      return null;
    } catch (error) {
      console.error('IP geolocation failed:', error);
      return null;
    }
  };

  // Get location from browser geolocation API
  const detectLocationFromBrowser = (): Promise<LocationData | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            
            // Find closest location from our data
            let closestLocation = extendedLocations[0];
            let minDistance = Infinity;

            extendedLocations.forEach((loc) => {
              if (loc.coordinates) {
                const distance = Math.sqrt(
                  Math.pow(latitude - loc.coordinates.lat, 2) +
                  Math.pow(longitude - loc.coordinates.lng, 2)
                );
                if (distance < minDistance) {
                  minDistance = distance;
                  closestLocation = loc;
                }
              }
            });

            resolve(closestLocation);
          } catch (error) {
            console.error('Geocoding failed:', error);
            resolve(null);
          }
        },
        (error) => {
          console.warn('Browser geolocation failed:', error);
          resolve(null);
        },
        {
          timeout: 10000,
          enableHighAccuracy: false,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  };

  // Check localStorage for cached location
  const getCachedLocation = (): LocationData | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const cached = localStorage.getItem('zoptal_user_location');
      if (cached) {
        const parsed = JSON.parse(cached);
        const cacheTime = parsed.timestamp;
        const now = Date.now();
        
        // Use cached location if less than 24 hours old
        if (now - cacheTime < 24 * 60 * 60 * 1000) {
          return parsed.location;
        }
      }
    } catch (error) {
      console.warn('Failed to read cached location:', error);
    }
    
    return null;
  };

  // Cache location in localStorage
  const cacheLocation = (locationData: LocationData) => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('zoptal_user_location', JSON.stringify({
        location: locationData,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.warn('Failed to cache location:', error);
    }
  };

  // Main location detection function
  const detectLocation = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      // First, try cached location
      const cachedLocation = getCachedLocation();
      if (cachedLocation) {
        setLocation(cachedLocation);
        setLoading(false);
        return;
      }

      // Try IP geolocation first (more reliable)
      let detectedLocation = await detectLocationFromIP();
      
      // Fallback to browser geolocation if IP failed
      if (!detectedLocation) {
        detectedLocation = await detectLocationFromBrowser();
      }

      // Use detected location or fallback to default
      const finalLocation = detectedLocation || defaultLocation;
      
      setLocation(finalLocation);
      cacheLocation(finalLocation);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Location detection failed';
      setError(errorMessage);
      setLocation(defaultLocation); // Always provide a fallback
    } finally {
      setLoading(false);
    }
  };

  // Auto-detect location on mount
  useEffect(() => {
    detectLocation();
  }, []);

  return {
    location,
    loading,
    error,
    detectLocation
  };
}