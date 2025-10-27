import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { fraudDetectionService, FraudDetectionConfig } from '../services/fraud-detection.service';
import { logger } from '../utils/logger';
import { createAuthError, createValidationError } from '../middleware/error-handler';
import { ERROR_CODES } from '../constants/error-codes';

interface FraudAnalysisRequest {
  ip: string;
  userId?: string;
  sessionId?: string;
  deviceFingerprint?: {
    userAgent: string;
    screenResolution: string;
    timezone: string;
    language: string;
    platform: string;
    cookieEnabled: boolean;
    doNotTrack: boolean;
    hash: string;
  };
  metadata?: Record<string, any>;
}

interface FraudConfigUpdate {
  enabled?: boolean;
  velocityThresholds?: {
    maxLoginsPerMinute?: number;
    maxLoginsPerHour?: number;
    maxFailedAttemptsPerHour?: number;
    maxApiCallsPerMinute?: number;
  };
  geoAnomalyThreshold?: number;
  deviceFingerprintEnabled?: boolean;
  behavioralAnalysisEnabled?: boolean;
  mlModelEnabled?: boolean;
  autoBlockThreshold?: number;
  verificationThreshold?: number;
  retentionDays?: number;
}

export async function fraudAdminRoutes(fastify: FastifyInstance) {
  // Test fraud analysis
  fastify.post('/fraud/test-analysis', {
    schema: {
      description: 'Test fraud analysis for a simulated authentication event',
      tags: ['Fraud Detection Admin'],
      body: {
        type: 'object',
        required: ['ip'],
        properties: {
          ip: { type: 'string', description: 'IP address to analyze' },
          userId: { type: 'string', description: 'User ID (optional)' },
          sessionId: { type: 'string', description: 'Session ID (optional)' },
          deviceFingerprint: {
            type: 'object',
            properties: {
              userAgent: { type: 'string' },
              screenResolution: { type: 'string' },
              timezone: { type: 'string' },
              language: { type: 'string' },
              platform: { type: 'string' },
              cookieEnabled: { type: 'boolean' },
              doNotTrack: { type: 'boolean' },
              hash: { type: 'string' }
            }
          },
          metadata: { type: 'object', description: 'Additional metadata' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                fraudScore: { type: 'number' },
                riskLevel: { type: 'string' },
                allowAccess: { type: 'boolean' },
                requiresVerification: { type: 'boolean' },
                signals: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      type: { type: 'string' },
                      severity: { type: 'string' },
                      score: { type: 'number' },
                      description: { type: 'string' },
                      metadata: { type: 'object' }
                    }
                  }
                },
                recommendations: { type: 'array', items: { type: 'string' } },
                confidence: { type: 'number' }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest<{ Body: FraudAnalysisRequest }>, reply: FastifyReply) => {
    try {
      const { ip, userId, sessionId, deviceFingerprint, metadata = {} } = request.body;

      if (!ip) {
        throw createValidationError('IP address is required', ERROR_CODES.VALIDATION_REQUIRED_FIELD);
      }

      const analysis = await fraudDetectionService.analyzeAuthenticationEvent(
        ip,
        userId,
        sessionId,
        deviceFingerprint,
        { ...metadata, isTestAnalysis: true }
      );

      return reply.send({
        success: true,
        data: {
          fraudScore: analysis.fraudScore,
          riskLevel: analysis.riskLevel,
          allowAccess: analysis.allowAccess,
          requiresVerification: analysis.requiresVerification,
          signals: analysis.signals.map(signal => ({
            type: signal.type,
            severity: signal.severity,
            score: signal.score,
            description: signal.description,
            metadata: signal.metadata
          })),
          recommendations: analysis.recommendations,
          confidence: analysis.confidence,
          blockDuration: analysis.blockDuration
        }
      });
    } catch (error) {
      logger.error('Fraud analysis test failed:', error);
      throw error;
    }
  });

  // Get fraud detection statistics
  fastify.get('/fraud/statistics', {
    schema: {
      description: 'Get fraud detection statistics and metrics',
      tags: ['Fraud Detection Admin'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                totalEvents: { type: 'number' },
                blockedEvents: { type: 'number' },
                blockRate: { type: 'number' },
                averageFraudScore: { type: 'number' },
                topSignalTypes: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      type: { type: 'string' },
                      count: { type: 'number' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const statistics = await fraudDetectionService.getFraudStatistics();

      return reply.send({
        success: true,
        data: statistics
      });
    } catch (error) {
      logger.error('Failed to get fraud statistics:', error);
      throw error;
    }
  });

  // Get fraud detection configuration
  fastify.get('/fraud/config', {
    schema: {
      description: 'Get current fraud detection configuration',
      tags: ['Fraud Detection Admin'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                enabled: { type: 'boolean' },
                velocityThresholds: {
                  type: 'object',
                  properties: {
                    maxLoginsPerMinute: { type: 'number' },
                    maxLoginsPerHour: { type: 'number' },
                    maxFailedAttemptsPerHour: { type: 'number' },
                    maxApiCallsPerMinute: { type: 'number' }
                  }
                },
                geoAnomalyThreshold: { type: 'number' },
                deviceFingerprintEnabled: { type: 'boolean' },
                behavioralAnalysisEnabled: { type: 'boolean' },
                mlModelEnabled: { type: 'boolean' },
                autoBlockThreshold: { type: 'number' },
                verificationThreshold: { type: 'number' },
                retentionDays: { type: 'number' }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const config = fraudDetectionService.getConfiguration();

      return reply.send({
        success: true,
        data: config
      });
    } catch (error) {
      logger.error('Failed to get fraud detection configuration:', error);
      throw error;
    }
  });

  // Update fraud detection configuration
  fastify.put('/fraud/config', {
    schema: {
      description: 'Update fraud detection configuration',
      tags: ['Fraud Detection Admin'],
      body: {
        type: 'object',
        properties: {
          enabled: { type: 'boolean' },
          velocityThresholds: {
            type: 'object',
            properties: {
              maxLoginsPerMinute: { type: 'number' },
              maxLoginsPerHour: { type: 'number' },
              maxFailedAttemptsPerHour: { type: 'number' },
              maxApiCallsPerMinute: { type: 'number' }
            }
          },
          geoAnomalyThreshold: { type: 'number' },
          deviceFingerprintEnabled: { type: 'boolean' },
          behavioralAnalysisEnabled: { type: 'boolean' },
          mlModelEnabled: { type: 'boolean' },
          autoBlockThreshold: { type: 'number', minimum: 0, maximum: 100 },
          verificationThreshold: { type: 'number', minimum: 0, maximum: 100 },
          retentionDays: { type: 'number', minimum: 1 }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                message: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest<{ Body: FraudConfigUpdate }>, reply: FastifyReply) => {
    try {
      const configUpdate = request.body;

      // Validate thresholds
      if (configUpdate.autoBlockThreshold !== undefined && 
          (configUpdate.autoBlockThreshold < 0 || configUpdate.autoBlockThreshold > 100)) {
        throw createValidationError('Auto block threshold must be between 0 and 100', ERROR_CODES.VALIDATION_INVALID_RANGE);
      }

      if (configUpdate.verificationThreshold !== undefined && 
          (configUpdate.verificationThreshold < 0 || configUpdate.verificationThreshold > 100)) {
        throw createValidationError('Verification threshold must be between 0 and 100', ERROR_CODES.VALIDATION_INVALID_RANGE);
      }

      fraudDetectionService.updateConfiguration(configUpdate);

      return reply.send({
        success: true,
        data: {
          message: 'Fraud detection configuration updated successfully'
        }
      });
    } catch (error) {
      logger.error('Failed to update fraud detection configuration:', error);
      throw error;
    }
  });

  // Clear user fraud profile
  fastify.delete('/fraud/user-profile/:userId', {
    schema: {
      description: 'Clear fraud detection profile for a specific user',
      tags: ['Fraud Detection Admin'],
      params: {
        type: 'object',
        required: ['userId'],
        properties: {
          userId: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                message: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest<{ Params: { userId: string } }>, reply: FastifyReply) => {
    try {
      const { userId } = request.params;

      await fraudDetectionService.clearUserProfile(userId);

      return reply.send({
        success: true,
        data: {
          message: `Fraud profile cleared for user: ${userId}`
        }
      });
    } catch (error) {
      logger.error('Failed to clear user fraud profile:', error);
      throw error;
    }
  });

  // Get fraud signals documentation
  fastify.get('/fraud/signals-reference', {
    schema: {
      description: 'Get documentation for all fraud detection signals',
      tags: ['Fraud Detection Admin'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                signalTypes: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      type: { type: 'string' },
                      description: { type: 'string' },
                      maxScore: { type: 'number' },
                      severityLevels: { type: 'array', items: { type: 'string' } }
                    }
                  }
                },
                scoringModel: {
                  type: 'object',
                  properties: {
                    riskLevels: { type: 'object' },
                    thresholds: { type: 'object' },
                    weights: { type: 'object' }
                  }
                }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const signalReference = {
        signalTypes: [
          {
            type: 'VELOCITY',
            description: 'Analyzes login and API call frequency patterns',
            maxScore: 95,
            severityLevels: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
            indicators: [
              'Multiple logins per minute from same IP',
              'High API call frequency',
              'Burst login patterns',
              'Failed login velocity'
            ]
          },
          {
            type: 'GEOLOCATION',
            description: 'Detects unusual location patterns and impossible travel',
            maxScore: 95,
            severityLevels: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
            indicators: [
              'Login from new country',
              'Impossible travel speed',
              'Location inconsistent with user profile',
              'High-risk geographic regions'
            ]
          },
          {
            type: 'DEVICE',
            description: 'Analyzes device fingerprints and hardware characteristics',
            maxScore: 90,
            severityLevels: ['LOW', 'MEDIUM', 'HIGH'],
            indicators: [
              'Unrecognized device fingerprint',
              'Headless browser detection',
              'Automation tool signatures',
              'Suspicious screen resolutions'
            ]
          },
          {
            type: 'BEHAVIORAL',
            description: 'Monitors user behavior patterns and deviations',
            maxScore: 45,
            severityLevels: ['LOW', 'MEDIUM'],
            indicators: [
              'Unusual login times',
              'Immediate account changes after login',
              'Atypical session duration',
              'Navigation pattern anomalies'
            ]
          },
          {
            type: 'NETWORK',
            description: 'Analyzes network characteristics and anonymization tools',
            maxScore: 80,
            severityLevels: ['LOW', 'MEDIUM', 'HIGH'],
            indicators: [
              'VPN usage',
              'Proxy detection',
              'Tor network access',
              'Hosting/datacenter IPs'
            ]
          },
          {
            type: 'ACCOUNT',
            description: 'Account-specific risk factors and security events',
            maxScore: 85,
            severityLevels: ['LOW', 'MEDIUM', 'HIGH'],
            indicators: [
              'Recent security incidents',
              'Account compromise indicators',
              'Privilege escalation attempts',
              'Suspicious account modifications'
            ]
          }
        ],
        scoringModel: {
          riskLevels: {
            LOW: '0-29: Normal behavior, minimal risk',
            MEDIUM: '30-59: Elevated risk, monitor closely',
            HIGH: '60-79: High risk, additional verification recommended',
            CRITICAL: '80-100: Very high risk, likely fraudulent'
          },
          thresholds: {
            verificationRequired: 60,
            autoBlock: 80,
            alertThreshold: 50
          },
          weights: {
            CRITICAL: 1.0,
            HIGH: 0.8,
            MEDIUM: 0.6,
            LOW: 0.4
          },
          typeMultipliers: {
            VELOCITY: 1.2,
            GEOLOCATION: 1.1,
            DEVICE: 1.0,
            BEHAVIORAL: 0.8,
            NETWORK: 0.9,
            ACCOUNT: 1.1
          }
        }
      };

      return reply.send({
        success: true,
        data: signalReference
      });
    } catch (error) {
      logger.error('Failed to get fraud signals reference:', error);
      throw error;
    }
  });

  // Bulk fraud analysis (for testing multiple scenarios)
  fastify.post('/fraud/bulk-analysis', {
    schema: {
      description: 'Perform fraud analysis on multiple test scenarios',
      tags: ['Fraud Detection Admin'],
      body: {
        type: 'object',
        required: ['scenarios'],
        properties: {
          scenarios: {
            type: 'array',
            items: {
              type: 'object',
              required: ['name', 'ip'],
              properties: {
                name: { type: 'string' },
                ip: { type: 'string' },
                userId: { type: 'string' },
                sessionId: { type: 'string' },
                deviceFingerprint: { type: 'object' },
                metadata: { type: 'object' }
              }
            }
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                results: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      fraudScore: { type: 'number' },
                      riskLevel: { type: 'string' },
                      allowAccess: { type: 'boolean' },
                      signalCount: { type: 'number' }
                    }
                  }
                },
                summary: {
                  type: 'object',
                  properties: {
                    totalScenarios: { type: 'number' },
                    averageScore: { type: 'number' },
                    blockedCount: { type: 'number' },
                    verificationCount: { type: 'number' }
                  }
                }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest<{ Body: { scenarios: FraudAnalysisRequest[] } }>, reply: FastifyReply) => {
    try {
      const { scenarios } = request.body;

      if (!scenarios || scenarios.length === 0) {
        throw createValidationError('At least one scenario is required', ERROR_CODES.VALIDATION_REQUIRED_FIELD);
      }

      if (scenarios.length > 100) {
        throw createValidationError('Maximum 100 scenarios allowed per request', ERROR_CODES.VALIDATION_INVALID_RANGE);
      }

      const results = [];
      let totalScore = 0;
      let blockedCount = 0;
      let verificationCount = 0;

      for (const scenario of scenarios) {
        try {
          const analysis = await fraudDetectionService.analyzeAuthenticationEvent(
            scenario.ip,
            scenario.userId,
            scenario.sessionId,
            scenario.deviceFingerprint,
            { ...scenario.metadata, isBulkTestAnalysis: true }
          );

          results.push({
            name: (scenario as any).name,
            fraudScore: analysis.fraudScore,
            riskLevel: analysis.riskLevel,
            allowAccess: analysis.allowAccess,
            requiresVerification: analysis.requiresVerification,
            signalCount: analysis.signals.length,
            confidence: analysis.confidence
          });

          totalScore += analysis.fraudScore;
          if (!analysis.allowAccess) blockedCount++;
          if (analysis.requiresVerification) verificationCount++;
        } catch (scenarioError) {
          logger.error(`Bulk analysis failed for scenario: ${(scenario as any).name}`, scenarioError);
          results.push({
            name: (scenario as any).name,
            fraudScore: 0,
            riskLevel: 'LOW',
            allowAccess: true,
            requiresVerification: false,
            signalCount: 0,
            confidence: 0,
            error: 'Analysis failed'
          });
        }
      }

      const summary = {
        totalScenarios: scenarios.length,
        averageScore: Math.round(totalScore / scenarios.length * 100) / 100,
        blockedCount,
        verificationCount,
        allowedCount: scenarios.length - blockedCount
      };

      return reply.send({
        success: true,
        data: {
          results,
          summary
        }
      });
    } catch (error) {
      logger.error('Bulk fraud analysis failed:', error);
      throw error;
    }
  });

  // Health check for fraud detection service
  fastify.get('/fraud/health', {
    schema: {
      description: 'Check fraud detection service health and status',
      tags: ['Fraud Detection Admin'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                status: { type: 'string' },
                enabled: { type: 'boolean' },
                uptime: { type: 'string' },
                configuration: {
                  type: 'object',
                  properties: {
                    velocityAnalysis: { type: 'boolean' },
                    geoAnalysis: { type: 'boolean' },
                    deviceFingerprinting: { type: 'boolean' },
                    behavioralAnalysis: { type: 'boolean' },
                    mlModel: { type: 'boolean' }
                  }
                }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const config = fraudDetectionService.getConfiguration();
      const uptime = process.uptime();
      const uptimeFormatted = `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`;

      return reply.send({
        success: true,
        data: {
          status: 'healthy',
          enabled: config.enabled,
          uptime: uptimeFormatted,
          configuration: {
            velocityAnalysis: true,
            geoAnalysis: true,
            deviceFingerprinting: config.deviceFingerprintEnabled,
            behavioralAnalysis: config.behavioralAnalysisEnabled,
            mlModel: config.mlModelEnabled
          }
        }
      });
    } catch (error) {
      logger.error('Fraud detection health check failed:', error);
      throw error;
    }
  });
}