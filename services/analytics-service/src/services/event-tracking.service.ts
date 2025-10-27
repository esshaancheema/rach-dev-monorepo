import { ClickHouseClient, createClient } from '@clickhouse/client';
import UAParser from 'ua-parser-js';
import { clickhouseConfig, privacyConfig, samplingConfig, customEventsConfig } from '../config';
import { logger } from '../utils/logger';
import { AnalyticsRedisService } from '../utils/redis';
import { nanoid } from 'nanoid';
import { createHash } from 'crypto';

export interface TrackEventRequest {
  userId?: string;
  sessionId?: string;
  anonymousId?: string;
  event: string;
  properties?: Record<string, any>;
  context?: {
    ip?: string;
    userAgent?: string;
    referer?: string;
    locale?: string;
    timezone?: string;
    screen?: {
      width: number;
      height: number;
      density?: number;
    };
    viewport?: {
      width: number;
      height: number;
    };
    campaign?: {
      source?: string;
      medium?: string;
      name?: string;
      term?: string;
      content?: string;
    };
  };
  timestamp?: Date;
}

export interface PageViewRequest {
  userId?: string;
  sessionId?: string;
  anonymousId?: string;
  url: string;
  title?: string;
  referrer?: string;
  context?: TrackEventRequest['context'];
  timestamp?: Date;
}

export interface IdentifyRequest {
  userId: string;
  anonymousId?: string;
  traits?: Record<string, any>;
  context?: TrackEventRequest['context'];
  timestamp?: Date;
}

export class EventTrackingService {
  private clickhouse: ClickHouseClient;
  private eventQueue: any[] = [];
  private batchTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.clickhouse = createClient({
      host: clickhouseConfig.host,
      database: clickhouseConfig.database,
      username: clickhouseConfig.username,
      password: clickhouseConfig.password,
      clickhouse_settings: clickhouseConfig.clickhouse_settings,
    });

    this.initializeDatabase();
    logger.info('Event tracking service initialized');
  }

  private async initializeDatabase(): Promise<void> {
    try {
      // Create database if not exists
      await this.clickhouse.exec({
        query: `CREATE DATABASE IF NOT EXISTS ${clickhouseConfig.database}`,
      });

      // Create events table
      await this.clickhouse.exec({
        query: `
          CREATE TABLE IF NOT EXISTS ${clickhouseConfig.database}.events (
            event_id String,
            user_id Nullable(String),
            session_id Nullable(String),
            anonymous_id String,
            event_name String,
            event_type Enum('track' = 1, 'page' = 2, 'identify' = 3, 'alias' = 4),
            properties String, -- JSON
            context String, -- JSON
            
            -- Parsed context fields for efficient querying
            ip_address Nullable(String),
            country Nullable(String),
            city Nullable(String),
            browser Nullable(String),
            browser_version Nullable(String),
            os Nullable(String),
            os_version Nullable(String),
            device_type Nullable(String),
            referer Nullable(String),
            utm_source Nullable(String),
            utm_medium Nullable(String),
            utm_campaign Nullable(String),
            
            -- Timestamps
            timestamp DateTime,
            received_at DateTime DEFAULT now(),
            
            -- Indexes
            INDEX idx_user_id user_id TYPE bloom_filter GRANULARITY 1,
            INDEX idx_session_id session_id TYPE bloom_filter GRANULARITY 1,
            INDEX idx_event_name event_name TYPE bloom_filter GRANULARITY 1
          )
          ENGINE = MergeTree()
          PARTITION BY toYYYYMM(timestamp)
          ORDER BY (timestamp, event_id)
          TTL timestamp + INTERVAL ${privacyConfig.dataRetentionDays} DAY
        `,
      });

      // Create page views materialized view
      await this.clickhouse.exec({
        query: `
          CREATE MATERIALIZED VIEW IF NOT EXISTS ${clickhouseConfig.database}.page_views
          ENGINE = SummingMergeTree()
          PARTITION BY toYYYYMM(timestamp)
          ORDER BY (timestamp, url, user_id)
          AS SELECT
            toStartOfHour(timestamp) as timestamp,
            user_id,
            session_id,
            JSONExtractString(properties, 'url') as url,
            JSONExtractString(properties, 'title') as title,
            browser,
            os,
            device_type,
            country,
            count() as views
          FROM ${clickhouseConfig.database}.events
          WHERE event_type = 'page'
          GROUP BY timestamp, user_id, session_id, url, title, browser, os, device_type, country
        `,
      });

      // Create user profiles table
      await this.clickhouse.exec({
        query: `
          CREATE TABLE IF NOT EXISTS ${clickhouseConfig.database}.user_profiles (
            user_id String,
            anonymous_ids Array(String),
            traits String, -- JSON
            first_seen DateTime,
            last_seen DateTime,
            total_events UInt32,
            total_sessions UInt32,
            
            INDEX idx_user_id user_id TYPE bloom_filter GRANULARITY 1
          )
          ENGINE = ReplacingMergeTree(last_seen)
          ORDER BY user_id
        `,
      });

      logger.info('Analytics database initialized');
    } catch (error) {
      logger.error({ error }, 'Failed to initialize analytics database');
    }
  }

  async trackEvent(request: TrackEventRequest): Promise<void> {
    try {
      // Check sampling
      if (!this.shouldSample(samplingConfig.events)) {
        return;
      }

      // Validate custom properties
      if (request.properties) {
        this.validateCustomProperties(request.properties);
      }

      // Process event
      const processedEvent = await this.processEvent(request, 'track');

      // Add to queue
      this.addToQueue(processedEvent);

      // Track metrics
      await AnalyticsRedisService.incrementEventCount(request.event);

      logger.debug({
        eventId: processedEvent.event_id,
        event: request.event,
        userId: request.userId,
      }, 'Event tracked');

    } catch (error) {
      logger.error({ error, event: request.event }, 'Failed to track event');
      throw error;
    }
  }

  async trackPageView(request: PageViewRequest): Promise<void> {
    try {
      // Check sampling
      if (!this.shouldSample(samplingConfig.events)) {
        return;
      }

      // Convert to event format
      const eventRequest: TrackEventRequest = {
        ...request,
        event: 'page_view',
        properties: {
          url: request.url,
          title: request.title,
          referrer: request.referrer,
          ...this.parseUrl(request.url),
        },
      };

      // Process event
      const processedEvent = await this.processEvent(eventRequest, 'page');

      // Add to queue
      this.addToQueue(processedEvent);

      // Update session activity
      if (request.sessionId) {
        await AnalyticsRedisService.updateSessionActivity(request.sessionId);
      }

      // Track metrics
      await AnalyticsRedisService.incrementPageView(request.url);

      logger.debug({
        eventId: processedEvent.event_id,
        url: request.url,
        userId: request.userId,
        sessionId: request.sessionId,
      }, 'Page view tracked');

    } catch (error) {
      logger.error({ error, url: request.url }, 'Failed to track page view');
      throw error;
    }
  }

  async identify(request: IdentifyRequest): Promise<void> {
    try {
      // Process identify event
      const processedEvent = await this.processEvent(
        {
          userId: request.userId,
          anonymousId: request.anonymousId,
          event: 'identify',
          properties: request.traits,
          context: request.context,
          timestamp: request.timestamp,
        },
        'identify'
      );

      // Add to queue
      this.addToQueue(processedEvent);

      // Update user profile
      await this.updateUserProfile(request.userId, request.traits, request.anonymousId);

      // Link anonymous ID if provided
      if (request.anonymousId) {
        await AnalyticsRedisService.linkAnonymousId(request.anonymousId, request.userId);
      }

      logger.debug({
        userId: request.userId,
        anonymousId: request.anonymousId,
      }, 'User identified');

    } catch (error) {
      logger.error({ error, userId: request.userId }, 'Failed to identify user');
      throw error;
    }
  }

  private async processEvent(
    request: TrackEventRequest,
    eventType: 'track' | 'page' | 'identify' | 'alias'
  ): Promise<any> {
    const eventId = nanoid();
    const timestamp = request.timestamp || new Date();
    const anonymousId = request.anonymousId || await this.getOrCreateAnonymousId(request);

    // Parse user agent
    const uaData = request.context?.userAgent 
      ? new UAParser(request.context.userAgent).getResult()
      : null;

    // Process IP for privacy
    const processedIp = request.context?.ip 
      ? this.processIpAddress(request.context.ip)
      : null;

    // Get geolocation from IP (would integrate with GeoIP service)
    const geoData = processedIp ? await this.getGeolocation(processedIp) : null;

    return {
      event_id: eventId,
      user_id: request.userId || null,
      session_id: request.sessionId || null,
      anonymous_id: anonymousId,
      event_name: request.event,
      event_type: eventType,
      properties: JSON.stringify(request.properties || {}),
      context: JSON.stringify(request.context || {}),
      
      // Parsed fields
      ip_address: processedIp,
      country: geoData?.country || null,
      city: geoData?.city || null,
      browser: uaData?.browser.name || null,
      browser_version: uaData?.browser.version || null,
      os: uaData?.os.name || null,
      os_version: uaData?.os.version || null,
      device_type: this.getDeviceType(uaData),
      referer: request.context?.referer || null,
      utm_source: request.context?.campaign?.source || null,
      utm_medium: request.context?.campaign?.medium || null,
      utm_campaign: request.context?.campaign?.name || null,
      
      timestamp: timestamp,
    };
  }

  private addToQueue(event: any): void {
    this.eventQueue.push(event);

    // Check if we should flush
    if (this.eventQueue.length >= processingConfig.batchSize) {
      this.flush();
    } else if (!this.batchTimer) {
      // Set timer for batch timeout
      this.batchTimer = setTimeout(() => this.flush(), processingConfig.batchTimeout);
    }
  }

  private async flush(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    // Clear timer
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    // Get events to process
    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      // Insert batch into ClickHouse
      await this.clickhouse.insert({
        table: `${clickhouseConfig.database}.events`,
        values: events,
        format: 'JSONEachRow',
      });

      logger.debug({ count: events.length }, 'Events batch inserted');

    } catch (error) {
      logger.error({ error, count: events.length }, 'Failed to insert events batch');
      
      // Add back to queue for retry
      this.eventQueue.unshift(...events);
    }
  }

  private validateCustomProperties(properties: Record<string, any>): void {
    const keys = Object.keys(properties);
    
    if (keys.length > customEventsConfig.maxProperties) {
      throw new Error(`Too many properties. Maximum allowed: ${customEventsConfig.maxProperties}`);
    }

    for (const [key, value] of Object.entries(properties)) {
      if (typeof value === 'string' && value.length > customEventsConfig.maxPropertyValueLength) {
        throw new Error(`Property '${key}' value too long. Maximum length: ${customEventsConfig.maxPropertyValueLength}`);
      }
    }
  }

  private shouldSample(rate: number): boolean {
    return Math.random() < rate;
  }

  private processIpAddress(ip: string): string | null {
    if (!privacyConfig.anonymizeIp) {
      return ip;
    }

    // Anonymize IP by removing last octet for IPv4 or last 80 bits for IPv6
    if (ip.includes(':')) {
      // IPv6 - zero out last 80 bits
      const parts = ip.split(':');
      return parts.slice(0, 3).join(':') + '::';
    } else {
      // IPv4 - remove last octet
      const parts = ip.split('.');
      return parts.slice(0, 3).join('.') + '.0';
    }
  }

  private async getGeolocation(ip: string): Promise<{ country: string; city: string } | null> {
    // This would integrate with a GeoIP service
    // For now, return mock data
    return {
      country: 'US',
      city: 'San Francisco',
    };
  }

  private getDeviceType(uaData: UAParser.IResult | null): string {
    if (!uaData) return 'unknown';
    
    const deviceType = uaData.device.type;
    if (deviceType) return deviceType;
    
    // Fallback detection
    if (uaData.device.model?.toLowerCase().includes('mobile')) return 'mobile';
    if (uaData.device.model?.toLowerCase().includes('tablet')) return 'tablet';
    
    return 'desktop';
  }

  private async getOrCreateAnonymousId(request: TrackEventRequest): Promise<string> {
    // Generate anonymous ID based on fingerprint
    const fingerprint = createHash('sha256')
      .update(request.context?.userAgent || '')
      .update(request.context?.ip || '')
      .update(request.context?.locale || '')
      .digest('hex');

    return `anon_${fingerprint.substring(0, 16)}`;
  }

  private parseUrl(url: string): Record<string, string> {
    try {
      const parsed = new URL(url);
      return {
        hostname: parsed.hostname,
        pathname: parsed.pathname,
        search: parsed.search,
        hash: parsed.hash,
      };
    } catch {
      return {};
    }
  }

  private async updateUserProfile(
    userId: string,
    traits?: Record<string, any>,
    anonymousId?: string
  ): Promise<void> {
    try {
      const existingProfile = await this.getUserProfile(userId);
      
      const profile = {
        user_id: userId,
        anonymous_ids: existingProfile?.anonymous_ids || [],
        traits: JSON.stringify({
          ...(existingProfile ? JSON.parse(existingProfile.traits) : {}),
          ...traits,
        }),
        first_seen: existingProfile?.first_seen || new Date(),
        last_seen: new Date(),
        total_events: (existingProfile?.total_events || 0) + 1,
        total_sessions: existingProfile?.total_sessions || 1,
      };

      if (anonymousId && !profile.anonymous_ids.includes(anonymousId)) {
        profile.anonymous_ids.push(anonymousId);
      }

      await this.clickhouse.insert({
        table: `${clickhouseConfig.database}.user_profiles`,
        values: [profile],
        format: 'JSONEachRow',
      });

    } catch (error) {
      logger.error({ error, userId }, 'Failed to update user profile');
    }
  }

  private async getUserProfile(userId: string): Promise<any | null> {
    try {
      const result = await this.clickhouse.query({
        query: `
          SELECT * FROM ${clickhouseConfig.database}.user_profiles
          WHERE user_id = {userId:String}
          ORDER BY last_seen DESC
          LIMIT 1
        `,
        query_params: { userId },
      });

      const rows = await result.json();
      return rows.data[0] || null;

    } catch (error) {
      logger.error({ error, userId }, 'Failed to get user profile');
      return null;
    }
  }

  async getRecentEvents(filters: {
    userId?: string;
    sessionId?: string;
    eventName?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<any[]> {
    try {
      let whereConditions: string[] = [];
      const queryParams: Record<string, any> = {};

      if (filters.userId) {
        whereConditions.push('user_id = {userId:String}');
        queryParams.userId = filters.userId;
      }

      if (filters.sessionId) {
        whereConditions.push('session_id = {sessionId:String}');
        queryParams.sessionId = filters.sessionId;
      }

      if (filters.eventName) {
        whereConditions.push('event_name = {eventName:String}');
        queryParams.eventName = filters.eventName;
      }

      if (filters.startDate) {
        whereConditions.push('timestamp >= {startDate:DateTime}');
        queryParams.startDate = filters.startDate;
      }

      if (filters.endDate) {
        whereConditions.push('timestamp <= {endDate:DateTime}');
        queryParams.endDate = filters.endDate;
      }

      const whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}` 
        : '';

      const result = await this.clickhouse.query({
        query: `
          SELECT * FROM ${clickhouseConfig.database}.events
          ${whereClause}
          ORDER BY timestamp DESC
          LIMIT {limit:UInt32}
        `,
        query_params: {
          ...queryParams,
          limit: filters.limit || 100,
        },
      });

      const rows = await result.json();
      return rows.data;

    } catch (error) {
      logger.error({ error, filters }, 'Failed to get recent events');
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    // Flush remaining events
    await this.flush();
    
    // Close ClickHouse connection
    await this.clickhouse.close();
    
    logger.info('Event tracking service shut down');
  }
}