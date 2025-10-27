import { FastifyInstance } from 'fastify';
import { authenticateToken } from '../../../middleware/auth';
import { PrismaClient, UserRole } from '@zoptal/database';

interface SecurityFilters {
  timeRange?: '1h' | '24h' | '7d' | '30d';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  limit?: number;
}

export async function adminSecurityRoutes(fastify: FastifyInstance) {
  // Get security events
  fastify.get('/security/events', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const user = request.user;
      
      if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
        return reply.status(403).send({
          success: false,
          message: 'Admin access required'
        });
      }

      const query = request.query as SecurityFilters;
      const timeRange = query.timeRange || '24h';
      const limit = Math.min(100, query.limit || 50);

      // Calculate date range
      const now = new Date();
      let startDate: Date;

      switch (timeRange) {
        case '1h':
          startDate = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default: // 24h
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }

      // Mock security events (in production, this would come from a dedicated security events table)
      const mockEvents = [
        {
          id: '1',
          type: 'failed_login',
          severity: 'medium',
          message: 'Multiple failed login attempts detected',
          userId: null,
          userEmail: null,
          ipAddress: '192.168.1.100',
          location: { country: 'United States', city: 'New York', flag: '🇺🇸' },
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
          resolved: false,
          metadata: { attempts: 5, timeWindow: '5min' }
        },
        {
          id: '2',
          type: 'suspicious_ip',
          severity: 'high',
          message: 'Login from suspicious IP address',
          userId: 'user123',
          userEmail: 'john@example.com',
          ipAddress: '185.220.101.32',
          location: { country: 'Russia', city: 'Moscow', flag: '🇷🇺' },
          userAgent: 'curl/7.68.0',
          timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
          resolved: false,
          metadata: { riskScore: 85, reason: 'Known malicious IP range' }
        },
        {
          id: '3',
          type: 'multiple_devices',
          severity: 'medium',
          message: 'User logged in from multiple devices simultaneously',
          userId: 'user456',
          userEmail: 'alice@example.com',
          ipAddress: '10.0.0.50',
          location: { country: 'Canada', city: 'Toronto', flag: '🇨🇦' },
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
          timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
          resolved: true,
          metadata: { deviceCount: 3, locations: ['Toronto', 'Vancouver'] }
        },
        {
          id: '4',
          type: 'unusual_location',
          severity: 'high',
          message: 'Login from unusual geographic location',
          userId: 'user789',
          userEmail: 'bob@example.com',
          ipAddress: '201.23.45.67',
          location: { country: 'Brazil', city: 'São Paulo', flag: '🇧🇷' },
          userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
          timestamp: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString(),
          resolved: false,
          metadata: { previousLocation: 'New York', distance: '4800km' }
        },
        {
          id: '5',
          type: 'brute_force',
          severity: 'critical',
          message: 'Brute force attack detected',
          userId: null,
          userEmail: null,
          ipAddress: '45.33.32.156',
          location: { country: 'Unknown', city: 'Unknown', flag: '🏴‍☠️' },
          userAgent: 'python-requests/2.28.1',
          timestamp: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
          resolved: true,
          metadata: { attempts: 50, duration: '10min', blocked: true }
        },
        {
          id: '6',
          type: 'account_lockout',
          severity: 'low',
          message: 'Account temporarily locked due to failed attempts',
          userId: 'user321',
          userEmail: 'charlie@example.com',
          ipAddress: '172.16.0.10',
          location: { country: 'United Kingdom', city: 'London', flag: '🇬🇧' },
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          timestamp: new Date(now.getTime() - 18 * 60 * 60 * 1000).toISOString(),
          resolved: true,
          metadata: { lockoutDuration: '30min', reason: 'Failed login attempts' }
        }
      ];

      // Filter by severity if specified
      let filteredEvents = mockEvents;
      if (query.severity) {
        filteredEvents = mockEvents.filter(event => event.severity === query.severity);
      }

      // Filter by time range
      filteredEvents = filteredEvents.filter(event => 
        new Date(event.timestamp) >= startDate
      );

      // Sort by timestamp (newest first)
      filteredEvents.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      // Limit results
      const events = filteredEvents.slice(0, limit);

      reply.send({
        success: true,
        events,
        totalEvents: filteredEvents.length,
        timeRange,
        generatedAt: new Date().toISOString()
      });

    } catch (error) {
      fastify.log.error('Security events fetch error:', error);
      reply.status(500).send({
        success: false,
        message: 'Failed to fetch security events'
      });
    }
  });

  // Get security metrics
  fastify.get('/security/metrics', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const user = request.user;
      
      if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
        return reply.status(403).send({
          success: false,
          message: 'Admin access required'
        });
      }

      const query = request.query as SecurityFilters;
      const timeRange = query.timeRange || '24h';

      // Calculate date range
      const now = new Date();
      let dataPoints: number;
      let timeUnit: string;

      switch (timeRange) {
        case '1h':
          dataPoints = 12; // 5-minute intervals
          timeUnit = '5min';
          break;
        case '7d':
          dataPoints = 7; // Daily intervals
          timeUnit = 'day';
          break;
        case '30d':
          dataPoints = 30; // Daily intervals  
          timeUnit = 'day';
          break;
        default: // 24h
          dataPoints = 24; // Hourly intervals
          timeUnit = 'hour';
      }

      // Generate mock trend data
      const securityEvents = [];
      const riskScore = [];
      const failedLogins = [];

      for (let i = dataPoints - 1; i >= 0; i--) {
        let time: string;
        let eventsCount: number;
        let threatsCount: number;
        let score: number;
        let attempts: number;

        if (timeUnit === 'day') {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          time = date.toISOString().split('T')[0];
          eventsCount = Math.floor(Math.random() * 50) + 10;
          threatsCount = Math.floor(Math.random() * 10) + 1;
          score = Math.min(100, Math.max(20, 60 + Math.sin(i * 0.1) * 20 + Math.random() * 10));
        } else if (timeUnit === '5min') {
          const date = new Date(now.getTime() - i * 5 * 60 * 1000);
          time = date.toTimeString().slice(0, 5);
          eventsCount = Math.floor(Math.random() * 10) + 1;
          threatsCount = Math.floor(Math.random() * 3);
          score = Math.min(100, Math.max(20, 50 + Math.random() * 30));
        } else { // hour
          const date = new Date(now.getTime() - i * 60 * 60 * 1000);
          time = date.getHours().toString().padStart(2, '0') + ':00';
          eventsCount = Math.floor(Math.random() * 20) + 5;
          threatsCount = Math.floor(Math.random() * 5);
          score = Math.min(100, Math.max(20, 55 + Math.sin(i * 0.2) * 15 + Math.random() * 10));
          attempts = Math.floor(Math.random() * 15) + 2;
          
          failedLogins.push({
            hour: time,
            attempts
          });
        }

        securityEvents.push({
          time,
          events: eventsCount,
          threats: threatsCount
        });

        riskScore.push({
          time,
          score: Math.round(score)
        });
      }

      // Mock current metrics
      const currentRiskScore = riskScore[riskScore.length - 1]?.score || 45;
      let threatLevel: 'low' | 'medium' | 'high' | 'critical';
      
      if (currentRiskScore >= 80) threatLevel = 'critical';
      else if (currentRiskScore >= 65) threatLevel = 'high'; 
      else if (currentRiskScore >= 45) threatLevel = 'medium';
      else threatLevel = 'low';

      const metrics = {
        riskScore: currentRiskScore,
        threatLevel,
        activeThreats: Math.floor(Math.random() * 8) + 2,
        blockedIPs: Math.floor(Math.random() * 15) + 5,
        suspiciousActivities: Math.floor(Math.random() * 25) + 10,
        trends: {
          securityEvents,
          riskScore,
          failedLogins: timeRange === '24h' ? failedLogins : []
        },
        topThreats: [
          { type: 'Failed Login', count: 45, severity: 'medium', percentage: 35 },
          { type: 'Suspicious IP', count: 23, severity: 'high', percentage: 18 },
          { type: 'Multiple Devices', count: 31, severity: 'low', percentage: 24 },
          { type: 'Unusual Location', count: 18, severity: 'high', percentage: 14 },
          { type: 'Brute Force', count: 12, severity: 'critical', percentage: 9 }
        ],
        geoThreats: [
          { country: 'Russia', flag: '🇷🇺', threats: 15, riskLevel: 'high' },
          { country: 'China', flag: '🇨🇳', threats: 12, riskLevel: 'high' },
          { country: 'United States', flag: '🇺🇸', threats: 8, riskLevel: 'medium' },
          { country: 'Brazil', flag: '🇧🇷', threats: 6, riskLevel: 'medium' },
          { country: 'India', flag: '🇮🇳', threats: 4, riskLevel: 'low' },
          { country: 'Germany', flag: '🇩🇪', threats: 3, riskLevel: 'low' }
        ]
      };

      reply.send({
        success: true,
        metrics,
        timeRange,
        generatedAt: new Date().toISOString()
      });

    } catch (error) {
      fastify.log.error('Security metrics fetch error:', error);
      reply.status(500).send({
        success: false,
        message: 'Failed to fetch security metrics'
      });
    }
  });
}