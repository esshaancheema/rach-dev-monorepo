import { NextRequest, NextResponse } from 'next/server';

interface LocationResponse {
  country?: string;
  city?: string;
  region?: string;
  timezone?: string;
  latitude?: number;
  longitude?: number;
  error?: string;
}

export async function GET(request: NextRequest) {
  try {
    // Get IP address from request
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const ip = forwarded?.split(',')[0] || realIP || request.ip || '127.0.0.1';

    // Skip geolocation for localhost/development
    if (ip === '127.0.0.1' || ip === '::1' || ip?.startsWith('192.168.') || ip?.startsWith('10.')) {
      return NextResponse.json({
        country: 'US',
        city: 'San Francisco',
        region: 'California',
        timezone: 'America/Los_Angeles',
        latitude: 37.7749,
        longitude: -122.4194
      } as LocationResponse);
    }

    // Try multiple IP geolocation services
    const services = [
      {
        name: 'ipapi',
        url: `http://ip-api.com/json/${ip}?fields=country,countryCode,region,regionName,city,timezone,lat,lon,status`,
        transform: (data: any): LocationResponse => ({
          country: data.countryCode,
          city: data.city,
          region: data.regionName,
          timezone: data.timezone,
          latitude: data.lat,
          longitude: data.lon
        })
      },
      {
        name: 'ipinfo',
        url: `https://ipinfo.io/${ip}/json`,
        transform: (data: any): LocationResponse => {
          const [lat, lon] = data.loc?.split(',').map(Number) || [undefined, undefined];
          return {
            country: data.country,
            city: data.city,
            region: data.region,
            timezone: data.timezone,
            latitude: lat,
            longitude: lon
          };
        }
      }
    ];

    // Try each service
    for (const service of services) {
      try {
        const response = await fetch(service.url, {
          headers: {
            'User-Agent': 'Zoptal-Website/1.0'
          },
          // Add timeout
          signal: AbortSignal.timeout(5000)
        });

        if (response.ok) {
          const data = await response.json();
          
          // Check if the service returned valid data
          if (service.name === 'ipapi' && data.status === 'fail') {
            continue;
          }

          const locationData = service.transform(data);
          
          // Validate essential fields
          if (locationData.country) {
            return NextResponse.json(locationData);
          }
        }
      } catch (error) {
        console.warn(`${service.name} geolocation service failed:`, error);
        continue;
      }
    }

    // Fallback to default US location
    return NextResponse.json({
      country: 'US',
      city: 'San Francisco',
      region: 'California',
      timezone: 'America/Los_Angeles',
      latitude: 37.7749,
      longitude: -122.4194
    } as LocationResponse);

  } catch (error) {
    console.error('Location detection error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to detect location',
        country: 'US',
        city: 'San Francisco',
        region: 'California',
        timezone: 'America/Los_Angeles'
      } as LocationResponse,
      { status: 500 }
    );
  }
}

// Also support POST for more complex location requests
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { latitude, longitude } = body;

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    // Reverse geocoding using public API
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
      {
        signal: AbortSignal.timeout(5000)
      }
    );

    if (!response.ok) {
      throw new Error('Reverse geocoding failed');
    }

    const data = await response.json();

    return NextResponse.json({
      country: data.countryCode,
      city: data.city || data.locality,
      region: data.principalSubdivision,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      latitude,
      longitude
    } as LocationResponse);

  } catch (error) {
    console.error('Reverse geocoding error:', error);
    
    return NextResponse.json(
      { error: 'Failed to reverse geocode location' },
      { status: 500 }
    );
  }
}