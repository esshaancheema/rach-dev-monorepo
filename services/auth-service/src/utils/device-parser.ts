import { DeviceInfo } from '../services/device-fingerprint.service';

/**
 * Parse user agent and extract device information
 */
export function parseDeviceInfo(
  userAgent: string,
  ipAddress: string,
  additionalInfo?: {
    screenResolution?: string;
    timezone?: string;
    language?: string;
    colorDepth?: string;
  }
): Omit<DeviceInfo, 'country' | 'city' | 'isp'> {
  const ua = userAgent.toLowerCase();
  
  // Parse platform/OS
  let platform: string | undefined;
  let osVersion: string | undefined;
  
  if (ua.includes('windows')) {
    platform = 'Windows';
    const winVersionMatch = ua.match(/windows nt ([\d.]+)/);
    if (winVersionMatch) {
      const version = winVersionMatch[1];
      const versionMap: { [key: string]: string } = {
        '10.0': '10/11',
        '6.3': '8.1',
        '6.2': '8',
        '6.1': '7',
        '6.0': 'Vista',
        '5.1': 'XP',
      };
      osVersion = versionMap[version] || version;
    }
  } else if (ua.includes('mac os x') || ua.includes('macos')) {
    platform = 'macOS';
    const macVersionMatch = ua.match(/mac os x ([\d_]+)/);
    if (macVersionMatch) {
      osVersion = macVersionMatch[1].replace(/_/g, '.');
    }
  } else if (ua.includes('linux')) {
    platform = 'Linux';
    if (ua.includes('ubuntu')) osVersion = 'Ubuntu';
    else if (ua.includes('debian')) osVersion = 'Debian';
    else if (ua.includes('fedora')) osVersion = 'Fedora';
    else if (ua.includes('centos')) osVersion = 'CentOS';
  } else if (ua.includes('android')) {
    platform = 'Android';
    const androidVersionMatch = ua.match(/android ([\d.]+)/);
    if (androidVersionMatch) {
      osVersion = androidVersionMatch[1];
    }
  } else if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
    platform = ua.includes('ipad') ? 'iPad' : 'iOS';
    const iosVersionMatch = ua.match(/os ([\d_]+)/);
    if (iosVersionMatch) {
      osVersion = iosVersionMatch[1].replace(/_/g, '.');
    }
  }

  // Parse browser
  let browser: string | undefined;
  let browserVersion: string | undefined;

  if (ua.includes('edg/')) {
    browser = 'Edge';
    const edgeVersionMatch = ua.match(/edg\/([\d.]+)/);
    if (edgeVersionMatch) browserVersion = edgeVersionMatch[1];
  } else if (ua.includes('chrome/')) {
    browser = 'Chrome';
    const chromeVersionMatch = ua.match(/chrome\/([\d.]+)/);
    if (chromeVersionMatch) browserVersion = chromeVersionMatch[1];
  } else if (ua.includes('firefox/')) {
    browser = 'Firefox';
    const firefoxVersionMatch = ua.match(/firefox\/([\d.]+)/);
    if (firefoxVersionMatch) browserVersion = firefoxVersionMatch[1];
  } else if (ua.includes('safari/') && !ua.includes('chrome')) {
    browser = 'Safari';
    const safariVersionMatch = ua.match(/version\/([\d.]+)/);
    if (safariVersionMatch) browserVersion = safariVersionMatch[1];
  } else if (ua.includes('opera/')) {
    browser = 'Opera';
    const operaVersionMatch = ua.match(/opera\/([\d.]+)/);
    if (operaVersionMatch) browserVersion = operaVersionMatch[1];
  }

  return {
    userAgent,
    ipAddress,
    platform,
    browser,
    browserVersion,
    osVersion,
    screenResolution: additionalInfo?.screenResolution,
    timezone: additionalInfo?.timezone,
    language: additionalInfo?.language,
    colorDepth: additionalInfo?.colorDepth,
  };
}

/**
 * Extract client information from Fastify request
 */
export function extractClientInfo(request: any): {
  userAgent: string;
  ipAddress: string;
  language?: string;
  timezone?: string;
} {
  const userAgent = request.headers['user-agent'] || 'Unknown';
  const ipAddress = request.ip || request.headers['x-forwarded-for'] || request.connection.remoteAddress || 'Unknown';
  const acceptLanguage = request.headers['accept-language'];
  const timezone = request.headers['x-timezone'];

  // Parse language from Accept-Language header
  let language: string | undefined;
  if (acceptLanguage) {
    const languageMatch = acceptLanguage.split(',')[0]?.split('-')[0];
    if (languageMatch) {
      language = languageMatch.toLowerCase();
    }
  }

  return {
    userAgent,
    ipAddress,
    language,
    timezone,
  };
}

/**
 * Create device fingerprint from request headers and body
 */
export function createDeviceFingerprint(
  request: any,
  fingerprintData?: {
    screenResolution?: string;
    colorDepth?: string;
    timezone?: string;
  }
): Omit<DeviceInfo, 'country' | 'city' | 'isp'> {
  const clientInfo = extractClientInfo(request);
  
  return parseDeviceInfo(
    clientInfo.userAgent,
    clientInfo.ipAddress,
    {
      screenResolution: fingerprintData?.screenResolution,
      timezone: fingerprintData?.timezone || clientInfo.timezone,
      language: clientInfo.language,
      colorDepth: fingerprintData?.colorDepth,
    }
  );
}

/**
 * Detect if request is from mobile device
 */
export function isMobileDevice(userAgent: string): boolean {
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
  return mobileRegex.test(userAgent);
}

/**
 * Detect if request is from bot/crawler
 */
export function isBotRequest(userAgent: string): boolean {
  const botRegex = /bot|crawler|spider|scraper|wget|curl|python|java|go-http|okhttp/i;
  return botRegex.test(userAgent);
}

/**
 * Get device type from user agent
 */
export function getDeviceType(userAgent: string): 'mobile' | 'tablet' | 'desktop' | 'bot' {
  const ua = userAgent.toLowerCase();
  
  if (isBotRequest(userAgent)) {
    return 'bot';
  }
  
  if (ua.includes('ipad') || (ua.includes('android') && !ua.includes('mobile'))) {
    return 'tablet';
  }
  
  if (isMobileDevice(userAgent)) {
    return 'mobile';
  }
  
  return 'desktop';
}

/**
 * Calculate device fingerprint confidence score
 */
export function calculateFingerprintConfidence(deviceInfo: Partial<DeviceInfo>): {
  score: number;
  factors: string[];
} {
  let score = 0;
  const factors: string[] = [];
  
  // User agent provides basic info
  if (deviceInfo.userAgent && deviceInfo.userAgent !== 'Unknown') {
    score += 20;
    factors.push('USER_AGENT');
  }
  
  // Platform detection
  if (deviceInfo.platform) {
    score += 15;
    factors.push('PLATFORM');
  }
  
  // Browser detection
  if (deviceInfo.browser) {
    score += 15;
    factors.push('BROWSER');
  }
  
  // Screen resolution is highly unique
  if (deviceInfo.screenResolution) {
    score += 25;
    factors.push('SCREEN_RESOLUTION');
  }
  
  // Timezone helps with identification
  if (deviceInfo.timezone) {
    score += 10;
    factors.push('TIMEZONE');
  }
  
  // Language preference
  if (deviceInfo.language) {
    score += 5;
    factors.push('LANGUAGE');
  }
  
  // Color depth
  if (deviceInfo.colorDepth) {
    score += 10;
    factors.push('COLOR_DEPTH');
  }
  
  return {
    score: Math.min(100, score),
    factors,
  };
}