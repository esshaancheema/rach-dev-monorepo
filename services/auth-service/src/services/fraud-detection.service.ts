import { PrismaClient } from '@zoptal/database';
import { logger } from '../utils/logger';
import { cacheManager } from '../utils/redis';
import { geolocationService } from './geolocation.service';
import { createAuthError } from '../middleware/error-handler';
import { ERROR_CODES } from '../constants/error-codes';

export interface FraudSignal {
  type: 'VELOCITY' | 'GEOLOCATION' | 'DEVICE' | 'BEHAVIORAL' | 'NETWORK' | 'ACCOUNT';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  score: number; // 0-100
  description: string;
  metadata: Record<string, any>;
  detectedAt: Date;
}

export interface FraudAnalysisResult {
  userId?: string;
  sessionId?: string;
  ip: string;
  fraudScore: number; // 0-100 (0 = no fraud, 100 = definite fraud)
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  signals: FraudSignal[];
  recommendations: string[];
  allowAccess: boolean;
  requiresVerification: boolean;
  blockDuration?: number; // seconds
  confidence: number; // 0-1
}

export interface UserBehaviorProfile {
  userId: string;
  normalLocations: string[]; // Country codes
  normalDevices: string[]; // Device fingerprints
  normalTimeZones: string[];
  averageSessionDuration: number;
  typicalLoginTimes: number[]; // Hours of day (0-23)
  velocityPatterns: {
    loginsPerHour: number;
    loginsPerDay: number;
    apiCallsPerMinute: number;
  };
  lastUpdated: Date;
}

export interface FraudDetectionConfig {
  enabled: boolean;
  velocityThresholds: {
    maxLoginsPerMinute: number;
    maxLoginsPerHour: number;
    maxFailedAttemptsPerHour: number;
    maxApiCallsPerMinute: number;
  };
  geoAnomalyThreshold: number; // km distance for location anomaly
  deviceFingerprintEnabled: boolean;
  behavioralAnalysisEnabled: boolean;
  mlModelEnabled: boolean;
  autoBlockThreshold: number; // Fraud score threshold for auto-block
  verificationThreshold: number; // Fraud score threshold for additional verification
  retentionDays: number; // How long to keep fraud data
}

export interface DeviceFingerprint {
  userAgent: string;
  screenResolution: string;
  timezone: string;
  language: string;
  platform: string;
  cookieEnabled: boolean;
  doNotTrack: boolean;
  hash: string; // Computed hash of all properties
}

export interface FraudEvent {
  id: string;
  userId?: string;
  sessionId?: string;
  ip: string;
  eventType: 'LOGIN' | 'FAILED_LOGIN' | 'API_CALL' | 'PASSWORD_CHANGE' | 'ACCOUNT_UPDATE';
  fraudScore: number;
  riskLevel: string;
  signals: FraudSignal[];
  action: 'ALLOWED' | 'BLOCKED' | 'VERIFICATION_REQUIRED';
  timestamp: Date;
  metadata: Record<string, any>;
}

const DEFAULT_CONFIG: FraudDetectionConfig = {
  enabled: true,
  velocityThresholds: {
    maxLoginsPerMinute: 5,
    maxLoginsPerHour: 30,
    maxFailedAttemptsPerHour: 10,
    maxApiCallsPerMinute: 100
  },
  geoAnomalyThreshold: 500, // 500km
  deviceFingerprintEnabled: true,
  behavioralAnalysisEnabled: true,
  mlModelEnabled: false, // Disabled by default until ML model is trained
  autoBlockThreshold: 80,
  verificationThreshold: 60,
  retentionDays: 90
};

export class FraudDetectionService {
  private config: FraudDetectionConfig;
  private userProfiles: Map<string, UserBehaviorProfile> = new Map();

  constructor(
    private prisma: PrismaClient,
    config: Partial<FraudDetectionConfig> = {}
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeService();
    
    logger.info('Fraud detection service initialized', {
      enabled: this.config.enabled,
      velocityEnabled: true,
      geoEnabled: true,
      behavioralEnabled: this.config.behavioralAnalysisEnabled,
      mlEnabled: this.config.mlModelEnabled
    });
  }

  /**
   * Analyze potential fraud for an authentication event
   */
  async analyzeAuthenticationEvent(
    ip: string,
    userId?: string,
    sessionId?: string,
    deviceFingerprint?: DeviceFingerprint,
    metadata: Record<string, any> = {}
  ): Promise<FraudAnalysisResult> {
    if (!this.config.enabled) {
      return this.createAllowResult(ip, userId, sessionId);
    }

    const signals: FraudSignal[] = [];
    let fraudScore = 0;

    try {
      // Velocity analysis
      const velocitySignals = await this.analyzeVelocity(ip, userId);
      signals.push(...velocitySignals);

      // Geolocation analysis
      if (userId) {
        const geoSignals = await this.analyzeGeolocation(ip, userId);
        signals.push(...geoSignals);
      }

      // Device fingerprint analysis
      if (deviceFingerprint && this.config.deviceFingerprintEnabled) {
        const deviceSignals = await this.analyzeDeviceFingerprint(deviceFingerprint, userId);
        signals.push(...deviceSignals);
      }

      // Behavioral analysis
      if (userId && this.config.behavioralAnalysisEnabled) {
        const behaviorSignals = await this.analyzeBehavior(userId, metadata);
        signals.push(...behaviorSignals);
      }

      // Network analysis
      const networkSignals = await this.analyzeNetwork(ip);
      signals.push(...networkSignals);

      // Calculate overall fraud score
      fraudScore = this.calculateFraudScore(signals);

      // Generate recommendations and actions
      const result = this.generateFraudResult(ip, userId, sessionId, fraudScore, signals);

      // Log the fraud analysis
      await this.logFraudEvent('LOGIN', result, metadata);

      // Update user behavior profile if legitimate
      if (userId && result.allowAccess && result.fraudScore < 30) {
        await this.updateUserProfile(userId, ip, deviceFingerprint, metadata);
      }

      return result;
    } catch (error) {
      logger.error('Fraud analysis failed:', error);
      
      // On error, allow access but log the failure
      return this.createAllowResult(ip, userId, sessionId, 'Analysis failed');
    }
  }

  /**
   * Analyze velocity patterns for suspicious activity
   */
  private async analyzeVelocity(ip: string, userId?: string): Promise<FraudSignal[]> {
    const signals: FraudSignal[] = [];
    const now = Date.now();
    const oneMinute = 60 * 1000;
    const oneHour = 60 * oneMinute;

    try {
      // Check IP-based velocity
      const ipLoginCount = await this.getEventCount('login', { ip }, oneMinute);
      if (ipLoginCount > this.config.velocityThresholds.maxLoginsPerMinute) {
        signals.push({
          type: 'VELOCITY',
          severity: 'HIGH',
          score: Math.min(90, ipLoginCount * 10),
          description: `High login velocity from IP: ${ipLoginCount} logins in 1 minute`,
          metadata: { ip, count: ipLoginCount, window: '1minute' },
          detectedAt: new Date()
        });
      }

      const ipHourlyCount = await this.getEventCount('login', { ip }, oneHour);
      if (ipHourlyCount > this.config.velocityThresholds.maxLoginsPerHour) {
        signals.push({
          type: 'VELOCITY',
          severity: 'MEDIUM',
          score: Math.min(70, ipHourlyCount * 2),
          description: `High hourly login velocity from IP: ${ipHourlyCount} logins in 1 hour`,
          metadata: { ip, count: ipHourlyCount, window: '1hour' },
          detectedAt: new Date()
        });
      }

      // Check user-based velocity if userId provided
      if (userId) {
        const userLoginCount = await this.getEventCount('login', { userId }, oneMinute);
        if (userLoginCount > this.config.velocityThresholds.maxLoginsPerMinute) {
          signals.push({
            type: 'VELOCITY',
            severity: 'CRITICAL',
            score: 95,
            description: `Impossible user login velocity: ${userLoginCount} logins in 1 minute`,
            metadata: { userId, count: userLoginCount, window: '1minute' },
            detectedAt: new Date()
          });
        }

        // Check failed login attempts
        const failedAttempts = await this.getEventCount('failed_login', { userId }, oneHour);
        if (failedAttempts > this.config.velocityThresholds.maxFailedAttemptsPerHour) {
          signals.push({
            type: 'VELOCITY',
            severity: 'HIGH',
            score: Math.min(85, failedAttempts * 8),
            description: `High failed login attempts: ${failedAttempts} in 1 hour`,
            metadata: { userId, count: failedAttempts, window: '1hour' },
            detectedAt: new Date()
          });
        }
      }

      return signals;
    } catch (error) {
      logger.error('Velocity analysis failed:', error);
      return [];
    }
  }

  /**
   * Analyze geolocation patterns for anomalies
   */
  private async analyzeGeolocation(ip: string, userId: string): Promise<FraudSignal[]> {
    const signals: FraudSignal[] = [];

    try {
      const currentGeo = await geolocationService.getGeolocation(ip);
      if (!currentGeo) {
        return signals;
      }

      const userProfile = await this.getUserProfile(userId);
      if (!userProfile || userProfile.normalLocations.length === 0) {
        return signals; // No baseline for comparison
      }

      // Check if current location is in normal locations
      if (!userProfile.normalLocations.includes(currentGeo.countryCode)) {
        // Calculate distance from normal locations
        const distances = await this.calculateDistancesToNormalLocations(
          currentGeo, 
          userProfile.normalLocations
        );
        
        const minDistance = Math.min(...distances);
        
        if (minDistance > this.config.geoAnomalyThreshold) {
          const severity = minDistance > 5000 ? 'HIGH' : 
                          minDistance > 2000 ? 'MEDIUM' : 'LOW';
          
          signals.push({
            type: 'GEOLOCATION',
            severity,
            score: Math.min(80, Math.floor(minDistance / 100)),
            description: `Login from unusual location: ${currentGeo.country} (${minDistance}km from normal)`,
            metadata: { 
              currentLocation: currentGeo.country,
              normalLocations: userProfile.normalLocations,
              distance: minDistance
            },
            detectedAt: new Date()
          });
        }
      }

      // Check for impossible travel (too fast between locations)
      const recentLogins = await this.getRecentUserLogins(userId, 6 * 60 * 60 * 1000); // 6 hours
      if (recentLogins.length > 0) {
        const lastLogin = recentLogins[0];
        const timeDiff = Date.now() - lastLogin.timestamp.getTime();
        
        if (lastLogin.location && timeDiff < 2 * 60 * 60 * 1000) { // Less than 2 hours
          const distance = this.calculateDistance(
            currentGeo.lat, currentGeo.lon,
            lastLogin.location.lat, lastLogin.location.lon
          );
          
          const maxPossibleSpeed = 900; // km/h (commercial aircraft)
          const requiredSpeed = distance / (timeDiff / (1000 * 60 * 60));
          
          if (requiredSpeed > maxPossibleSpeed) {
            signals.push({
              type: 'GEOLOCATION',
              severity: 'CRITICAL',
              score: 95,
              description: `Impossible travel detected: ${distance}km in ${Math.round(timeDiff/60000)} minutes`,
              metadata: {
                distance,
                timeMinutes: Math.round(timeDiff / 60000),
                requiredSpeed: Math.round(requiredSpeed),
                lastLocation: lastLogin.location
              },
              detectedAt: new Date()
            });
          }
        }
      }

      return signals;
    } catch (error) {
      logger.error('Geolocation analysis failed:', error);
      return [];
    }
  }

  /**
   * Analyze device fingerprint for anomalies
   */
  private async analyzeDeviceFingerprint(
    fingerprint: DeviceFingerprint, 
    userId?: string
  ): Promise<FraudSignal[]> {
    const signals: FraudSignal[] = [];

    try {
      if (!userId) {
        return signals;
      }

      const userProfile = await this.getUserProfile(userId);
      if (!userProfile || userProfile.normalDevices.length === 0) {
        return signals; // No baseline for comparison
      }

      // Check if current device is recognized
      if (!userProfile.normalDevices.includes(fingerprint.hash)) {
        // Analyze device characteristics for suspicion
        let suspicionScore = 20; // Base score for new device

        // Check for headless browser indicators
        if (fingerprint.userAgent.includes('HeadlessChrome') || 
            fingerprint.userAgent.includes('PhantomJS')) {
          suspicionScore += 50;
        }

        // Check for automated tools
        if (fingerprint.userAgent.includes('selenium') || 
            fingerprint.userAgent.includes('webdriver')) {
          suspicionScore += 60;
        }

        // Check for suspicious screen resolutions
        if (fingerprint.screenResolution === '1x1' || 
            fingerprint.screenResolution === '0x0') {
          suspicionScore += 30;
        }

        // Check timezone mismatch with geolocation
        // This would require additional geolocation data
        
        const severity = suspicionScore > 70 ? 'HIGH' : 
                        suspicionScore > 40 ? 'MEDIUM' : 'LOW';

        signals.push({
          type: 'DEVICE',
          severity,
          score: Math.min(90, suspicionScore),
          description: `Unrecognized device detected`,
          metadata: {
            deviceHash: fingerprint.hash,
            userAgent: fingerprint.userAgent,
            suspicionFactors: suspicionScore,
            knownDevices: userProfile.normalDevices.length
          },
          detectedAt: new Date()
        });
      }

      return signals;
    } catch (error) {
      logger.error('Device fingerprint analysis failed:', error);
      return [];
    }
  }

  /**
   * Analyze behavioral patterns
   */
  private async analyzeBehavior(userId: string, metadata: Record<string, any>): Promise<FraudSignal[]> {
    const signals: FraudSignal[] = [];

    try {
      const userProfile = await this.getUserProfile(userId);
      if (!userProfile) {
        return signals;
      }

      const currentHour = new Date().getHours();
      
      // Check login time patterns
      if (userProfile.typicalLoginTimes.length > 5) {
        const isTypicalTime = userProfile.typicalLoginTimes.some(hour => 
          Math.abs(hour - currentHour) <= 2
        );

        if (!isTypicalTime) {
          signals.push({
            type: 'BEHAVIORAL',
            severity: 'LOW',
            score: 25,
            description: `Login at unusual time: ${currentHour}:00`,
            metadata: {
              currentHour,
              typicalHours: userProfile.typicalLoginTimes
            },
            detectedAt: new Date()
          });
        }
      }

      // Check for rapid account changes after login
      if (metadata.hasAccountChanges) {
        signals.push({
          type: 'BEHAVIORAL',
          severity: 'MEDIUM',
          score: 45,
          description: 'Immediate account changes after login',
          metadata: { accountChanges: metadata.accountChanges },
          detectedAt: new Date()
        });
      }

      return signals;
    } catch (error) {
      logger.error('Behavioral analysis failed:', error);
      return [];
    }
  }

  /**
   * Analyze network characteristics
   */
  private async analyzeNetwork(ip: string): Promise<FraudSignal[]> {
    const signals: FraudSignal[] = [];

    try {
      const geoData = await geolocationService.getGeolocation(ip);
      if (!geoData) {
        return signals;
      }

      // Check for VPN/Proxy usage
      if (geoData.vpn) {
        signals.push({
          type: 'NETWORK',
          severity: 'MEDIUM',
          score: 40,
          description: 'VPN usage detected',
          metadata: { vpn: true, isp: geoData.isp },
          detectedAt: new Date()
        });
      }

      if (geoData.proxy) {
        signals.push({
          type: 'NETWORK',
          severity: 'MEDIUM',
          score: 35,
          description: 'Proxy usage detected',
          metadata: { proxy: true, isp: geoData.isp },
          detectedAt: new Date()
        });
      }

      // Check for Tor usage
      if (geoData.tor) {
        signals.push({
          type: 'NETWORK',
          severity: 'HIGH',
          score: 80,
          description: 'Tor network usage detected',
          metadata: { tor: true },
          detectedAt: new Date()
        });
      }

      // Check for hosting/datacenter IPs
      if (geoData.hosting) {
        signals.push({
          type: 'NETWORK',
          severity: 'MEDIUM',
          score: 30,
          description: 'Login from hosting/datacenter IP',
          metadata: { hosting: true, org: geoData.org },
          detectedAt: new Date()
        });
      }

      return signals;
    } catch (error) {
      logger.error('Network analysis failed:', error);
      return [];
    }
  }

  /**
   * Calculate overall fraud score from signals
   */
  private calculateFraudScore(signals: FraudSignal[]): number {
    if (signals.length === 0) {
      return 0;
    }

    // Weight signals by severity and type
    const weights = {
      'CRITICAL': 1.0,
      'HIGH': 0.8,
      'MEDIUM': 0.6,
      'LOW': 0.4
    };

    const typeMultipliers = {
      'VELOCITY': 1.2,
      'GEOLOCATION': 1.1,
      'DEVICE': 1.0,
      'BEHAVIORAL': 0.8,
      'NETWORK': 0.9,
      'ACCOUNT': 1.1
    };

    let totalScore = 0;
    let totalWeight = 0;

    for (const signal of signals) {
      const weight = weights[signal.severity];
      const multiplier = typeMultipliers[signal.type];
      const adjustedScore = signal.score * weight * multiplier;
      
      totalScore += adjustedScore;
      totalWeight += weight;
    }

    // Calculate weighted average and cap at 100
    const finalScore = totalWeight > 0 ? totalScore / totalWeight : 0;
    return Math.min(100, Math.round(finalScore));
  }

  /**
   * Generate fraud analysis result with recommendations
   */
  private generateFraudResult(
    ip: string,
    userId?: string,
    sessionId?: string,
    fraudScore: number = 0,
    signals: FraudSignal[] = []
  ): FraudAnalysisResult {
    const riskLevel = fraudScore >= 80 ? 'CRITICAL' :
                     fraudScore >= 60 ? 'HIGH' :
                     fraudScore >= 30 ? 'MEDIUM' : 'LOW';

    const allowAccess = fraudScore < this.config.autoBlockThreshold;
    const requiresVerification = fraudScore >= this.config.verificationThreshold && allowAccess;

    const recommendations: string[] = [];
    let blockDuration: number | undefined;

    // Generate recommendations based on signals
    for (const signal of signals) {
      switch (signal.type) {
        case 'VELOCITY':
          if (signal.severity === 'CRITICAL') {
            recommendations.push('Implement temporary IP block');
            blockDuration = 300; // 5 minutes
          } else if (signal.severity === 'HIGH') {
            recommendations.push('Require additional authentication');
          }
          break;
        
        case 'GEOLOCATION':
          if (signal.severity === 'CRITICAL') {
            recommendations.push('Block login - impossible travel detected');
            blockDuration = 900; // 15 minutes
          } else {
            recommendations.push('Send location verification email');
            recommendations.push('Require 2FA verification');
          }
          break;
        
        case 'DEVICE':
          recommendations.push('Device verification required');
          recommendations.push('Send device registration email');
          break;
        
        case 'NETWORK':
          if (signal.severity === 'HIGH') {
            recommendations.push('Additional identity verification required');
          }
          break;
      }
    }

    if (recommendations.length === 0 && fraudScore > 0) {
      recommendations.push('Enhanced monitoring recommended');
    }

    // Calculate confidence based on signal strength and diversity
    const signalTypes = new Set(signals.map(s => s.type));
    const confidence = Math.min(1, (signals.length * 0.1) + (signalTypes.size * 0.15));

    return {
      userId,
      sessionId,
      ip,
      fraudScore,
      riskLevel,
      signals,
      recommendations,
      allowAccess,
      requiresVerification,
      blockDuration,
      confidence: Math.round(confidence * 100) / 100
    };
  }

  /**
   * Create a default allow result
   */
  private createAllowResult(
    ip: string, 
    userId?: string, 
    sessionId?: string, 
    reason?: string
  ): FraudAnalysisResult {
    return {
      userId,
      sessionId,
      ip,
      fraudScore: 0,
      riskLevel: 'LOW',
      signals: [],
      recommendations: reason ? [reason] : [],
      allowAccess: true,
      requiresVerification: false,
      confidence: 0
    };
  }

  /**
   * Helper methods for data access and calculations
   */
  private async getEventCount(
    eventType: string, 
    filters: Record<string, any>, 
    timeWindow: number
  ): Promise<number> {
    const cacheKey = `fraud_event_count:${eventType}:${JSON.stringify(filters)}:${timeWindow}`;
    
    try {
      const cached = await cacheManager.get(cacheKey);
      if (cached) {
        return parseInt(cached);
      }

      // In a real implementation, this would query the database
      // For now, simulate with random values for demonstration
      const count = Math.floor(Math.random() * 10);
      
      await cacheManager.set(cacheKey, count.toString(), 60); // Cache for 1 minute
      return count;
    } catch (error) {
      logger.error('Failed to get event count:', error);
      return 0;
    }
  }

  private async getUserProfile(userId: string): Promise<UserBehaviorProfile | null> {
    try {
      const cached = this.userProfiles.get(userId);
      if (cached) {
        return cached;
      }

      // In a real implementation, this would load from database
      // For now, create a mock profile
      const profile: UserBehaviorProfile = {
        userId,
        normalLocations: ['US', 'CA'],
        normalDevices: [],
        normalTimeZones: ['America/New_York'],
        averageSessionDuration: 1800, // 30 minutes
        typicalLoginTimes: [8, 9, 10, 17, 18, 19], // 8-10 AM, 5-7 PM
        velocityPatterns: {
          loginsPerHour: 2,
          loginsPerDay: 5,
          apiCallsPerMinute: 10
        },
        lastUpdated: new Date()
      };

      this.userProfiles.set(userId, profile);
      return profile;
    } catch (error) {
      logger.error('Failed to get user profile:', error);
      return null;
    }
  }

  private async updateUserProfile(
    userId: string,
    ip: string,
    deviceFingerprint?: DeviceFingerprint,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    try {
      const profile = await this.getUserProfile(userId) || {
        userId,
        normalLocations: [],
        normalDevices: [],
        normalTimeZones: [],
        averageSessionDuration: 1800,
        typicalLoginTimes: [],
        velocityPatterns: {
          loginsPerHour: 1,
          loginsPerDay: 1,
          apiCallsPerMinute: 1
        },
        lastUpdated: new Date()
      };

      // Update with current login data
      const geoData = await geolocationService.getGeolocation(ip);
      if (geoData && !profile.normalLocations.includes(geoData.countryCode)) {
        profile.normalLocations.push(geoData.countryCode);
        // Keep only the most recent 5 locations
        if (profile.normalLocations.length > 5) {
          profile.normalLocations = profile.normalLocations.slice(-5);
        }
      }

      if (deviceFingerprint && !profile.normalDevices.includes(deviceFingerprint.hash)) {
        profile.normalDevices.push(deviceFingerprint.hash);
        // Keep only the most recent 10 devices
        if (profile.normalDevices.length > 10) {
          profile.normalDevices = profile.normalDevices.slice(-10);
        }
      }

      const currentHour = new Date().getHours();
      if (!profile.typicalLoginTimes.includes(currentHour)) {
        profile.typicalLoginTimes.push(currentHour);
        // Keep only the most recent 20 login times
        if (profile.typicalLoginTimes.length > 20) {
          profile.typicalLoginTimes = profile.typicalLoginTimes.slice(-20);
        }
      }

      profile.lastUpdated = new Date();
      this.userProfiles.set(userId, profile);

      // In a real implementation, this would persist to database
      logger.debug('User profile updated', { userId, profileSize: this.userProfiles.size });
    } catch (error) {
      logger.error('Failed to update user profile:', error);
    }
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private async calculateDistancesToNormalLocations(
    currentGeo: any,
    normalLocations: string[]
  ): Promise<number[]> {
    // In a real implementation, this would look up coordinates for each country
    // For now, return mock distances
    return normalLocations.map(() => Math.random() * 10000);
  }

  private async getRecentUserLogins(userId: string, timeWindow: number): Promise<any[]> {
    // In a real implementation, this would query recent logins from database
    return [];
  }

  private async logFraudEvent(
    eventType: string,
    result: FraudAnalysisResult,
    metadata: Record<string, any>
  ): Promise<void> {
    try {
      const event: FraudEvent = {
        id: `fraud_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: result.userId,
        sessionId: result.sessionId,
        ip: result.ip,
        eventType: eventType as any,
        fraudScore: result.fraudScore,
        riskLevel: result.riskLevel,
        signals: result.signals,
        action: result.allowAccess ? 'ALLOWED' : 'BLOCKED',
        timestamp: new Date(),
        metadata
      };

      // In a real implementation, this would persist to database
      logger.info('Fraud event logged', {
        eventId: event.id,
        fraudScore: event.fraudScore,
        riskLevel: event.riskLevel,
        action: event.action,
        signalCount: event.signals.length
      });
    } catch (error) {
      logger.error('Failed to log fraud event:', error);
    }
  }

  private async initializeService(): Promise<void> {
    try {
      // Initialize ML models, load configuration, etc.
      logger.info('Fraud detection service initialization completed');
    } catch (error) {
      logger.error('Failed to initialize fraud detection service:', error);
    }
  }

  /**
   * Public API methods
   */
  public updateConfiguration(newConfig: Partial<FraudDetectionConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('Fraud detection configuration updated', newConfig);
  }

  public getConfiguration(): FraudDetectionConfig {
    return { ...this.config };
  }

  public async getFraudStatistics(): Promise<{
    totalEvents: number;
    blockedEvents: number;
    blockRate: number;
    averageFraudScore: number;
    topSignalTypes: Array<{ type: string; count: number; }>;
  }> {
    // In a real implementation, this would aggregate from database
    return {
      totalEvents: 1000,
      blockedEvents: 50,
      blockRate: 5.0,
      averageFraudScore: 15.5,
      topSignalTypes: [
        { type: 'VELOCITY', count: 25 },
        { type: 'GEOLOCATION', count: 15 },
        { type: 'NETWORK', count: 10 }
      ]
    };
  }

  public async clearUserProfile(userId: string): Promise<void> {
    this.userProfiles.delete(userId);
    // In a real implementation, this would also clear from database
    logger.info('User fraud profile cleared', { userId });
  }
}

// Export singleton instance
export const fraudDetectionService = new FraudDetectionService(
  new (require('@zoptal/database').PrismaClient)()
);