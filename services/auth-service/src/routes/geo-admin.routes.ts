import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { geoRestrictionsService } from '../services/geo-restrictions.service';
import { geolocationService } from '../services/geolocation.service';
import { logger } from '../utils/logger';
import { createAuthError, createValidationError } from '../middleware/error-handler';
import { ERROR_CODES } from '../constants/error-codes';

interface GeolocationQuery {
  ip: string;
}

interface GeoRuleBody {
  name: string;
  type: 'ALLOW' | 'BLOCK';
  scope: 'GLOBAL' | 'USER' | 'ENDPOINT';
  countries: string[];
  regions?: string[];
  cities?: string[];
  endpoints?: string[];
  userIds?: string[];
  priority: number;
  enabled: boolean;
  reason?: string;
  expiresAt?: string;
}

interface GeoConfigUpdateBody {
  enabled?: boolean;
  defaultPolicy?: 'ALLOW' | 'BLOCK';
  enableUserBypass?: boolean;
  enableVpnDetection?: boolean;
  enableProxyDetection?: boolean;
  trustedProxies?: string[];
  highRiskCountries?: string[];
  cacheTtl?: number;
  logAllChecks?: boolean;
}

export async function geoAdminRoutes(fastify: FastifyInstance) {
  // Test geolocation lookup
  fastify.get('/geo/test-lookup', {
    schema: {
      description: 'Test geolocation lookup for an IP address',
      tags: ['Geographic Admin'],
      querystring: {
        type: 'object',
        required: ['ip'],
        properties: {
          ip: { type: 'string', description: 'IP address to lookup' }
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
                ip: { type: 'string' },
                country: { type: 'string' },
                countryCode: { type: 'string' },
                region: { type: 'string' },
                city: { type: 'string' },
                lat: { type: 'number' },
                lon: { type: 'number' },
                isp: { type: 'string' },
                vpn: { type: 'boolean' },
                proxy: { type: 'boolean' },
                tor: { type: 'boolean' },
                hosting: { type: 'boolean' },
                accuracy: { type: 'number' }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest<{ Querystring: GeolocationQuery }>, reply: FastifyReply) => {
    try {
      const { ip } = request.query;

      if (!ip) {
        throw createValidationError('IP address is required', ERROR_CODES.VALIDATION_REQUIRED_FIELD);
      }

      const geoData = await geolocationService.getGeolocation(ip);

      return reply.send({
        success: true,
        data: geoData
      });
    } catch (error) {
      logger.error('Geolocation test lookup failed:', error);
      throw error;
    }
  });

  // Test access check
  fastify.post('/geo/test-access', {
    schema: {
      description: 'Test geographic access check for an IP address',
      tags: ['Geographic Admin'],
      body: {
        type: 'object',
        required: ['ip'],
        properties: {
          ip: { type: 'string' },
          endpoint: { type: 'string' },
          userId: { type: 'string' },
          userAgent: { type: 'string' }
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
                ip: { type: 'string' },
                allowed: { type: 'boolean' },
                country: { type: 'string' },
                countryCode: { type: 'string' },
                appliedRules: { type: 'array', items: { type: 'string' } },
                reason: { type: 'string' },
                bypassAvailable: { type: 'boolean' },
                riskScore: { type: 'number' }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest<{ Body: any }>, reply: FastifyReply) => {
    try {
      const { ip, endpoint, userId, userAgent } = request.body;

      if (!ip) {
        throw createValidationError('IP address is required', ERROR_CODES.VALIDATION_REQUIRED_FIELD);
      }

      const accessCheck = await geoRestrictionsService.checkAccess(ip, endpoint, userId, userAgent);

      return reply.send({
        success: true,
        data: accessCheck
      });
    } catch (error) {
      logger.error('Geographic access test failed:', error);
      throw error;
    }
  });

  // Get restriction rules
  fastify.get('/geo/rules', {
    schema: {
      description: 'Get all geographic restriction rules',
      tags: ['Geographic Admin'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                rules: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                      type: { type: 'string', enum: ['ALLOW', 'BLOCK'] },
                      scope: { type: 'string', enum: ['GLOBAL', 'USER', 'ENDPOINT'] },
                      countries: { type: 'array', items: { type: 'string' } },
                      priority: { type: 'number' },
                      enabled: { type: 'boolean' },
                      createdAt: { type: 'string' },
                      updatedAt: { type: 'string' }
                    }
                  }
                },
                count: { type: 'number' }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const rules = geoRestrictionsService.getRules();

      return reply.send({
        success: true,
        data: {
          rules,
          count: rules.length
        }
      });
    } catch (error) {
      logger.error('Failed to get geo restriction rules:', error);
      throw error;
    }
  });

  // Add restriction rule
  fastify.post('/geo/rules', {
    schema: {
      description: 'Add a new geographic restriction rule',
      tags: ['Geographic Admin'],
      body: {
        type: 'object',
        required: ['name', 'type', 'scope', 'countries', 'priority'],
        properties: {
          name: { type: 'string' },
          type: { type: 'string', enum: ['ALLOW', 'BLOCK'] },
          scope: { type: 'string', enum: ['GLOBAL', 'USER', 'ENDPOINT'] },
          countries: { type: 'array', items: { type: 'string' } },
          regions: { type: 'array', items: { type: 'string' } },
          cities: { type: 'array', items: { type: 'string' } },
          endpoints: { type: 'array', items: { type: 'string' } },
          userIds: { type: 'array', items: { type: 'string' } },
          priority: { type: 'number' },
          enabled: { type: 'boolean', default: true },
          reason: { type: 'string' },
          expiresAt: { type: 'string', format: 'date-time' }
        }
      },
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                ruleId: { type: 'string' },
                message: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest<{ Body: GeoRuleBody }>, reply: FastifyReply) => {
    try {
      const ruleData = request.body;

      // Validate required fields
      if (!ruleData.name || !ruleData.type || !ruleData.scope || !ruleData.countries || ruleData.priority === undefined) {
        throw createValidationError('Missing required fields', ERROR_CODES.VALIDATION_REQUIRED_FIELD);
      }

      // Convert expiry date if provided
      const ruleToAdd = {
        ...ruleData,
        expiresAt: ruleData.expiresAt ? new Date(ruleData.expiresAt) : undefined,
        enabled: ruleData.enabled !== false, // Default to true
        createdBy: (request as any).user?.id || 'admin'
      };

      const ruleId = await geoRestrictionsService.addRule(ruleToAdd);

      return reply.status(201).send({
        success: true,
        data: {
          ruleId,
          message: 'Geographic restriction rule added successfully'
        }
      });
    } catch (error) {
      logger.error('Failed to add geo restriction rule:', error);
      throw error;
    }
  });

  // Remove restriction rule
  fastify.delete('/geo/rules/:ruleId', {
    schema: {
      description: 'Remove a geographic restriction rule',
      tags: ['Geographic Admin'],
      params: {
        type: 'object',
        required: ['ruleId'],
        properties: {
          ruleId: { type: 'string' }
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
  }, async (request: FastifyRequest<{ Params: { ruleId: string } }>, reply: FastifyReply) => {
    try {
      const { ruleId } = request.params;

      const removed = await geoRestrictionsService.removeRule(ruleId);

      if (!removed) {
        throw createAuthError('Rule not found', undefined, ERROR_CODES.RESOURCE_NOT_FOUND);
      }

      return reply.send({
        success: true,
        data: {
          message: 'Geographic restriction rule removed successfully'
        }
      });
    } catch (error) {
      logger.error('Failed to remove geo restriction rule:', error);
      throw error;
    }
  });

  // Get restriction statistics
  fastify.get('/geo/statistics', {
    schema: {
      description: 'Get geographic restriction statistics',
      tags: ['Geographic Admin'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                totalChecks: { type: 'number' },
                blockedRequests: { type: 'number' },
                blockRate: { type: 'number' },
                topBlockedCountries: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      country: { type: 'string' },
                      count: { type: 'number' }
                    }
                  }
                },
                topAllowedCountries: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      country: { type: 'string' },
                      count: { type: 'number' }
                    }
                  }
                },
                ruleEffectiveness: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      ruleId: { type: 'string' },
                      name: { type: 'string' },
                      triggered: { type: 'number' }
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
      const statistics = geoRestrictionsService.getStatistics();

      return reply.send({
        success: true,
        data: statistics
      });
    } catch (error) {
      logger.error('Failed to get geo restriction statistics:', error);
      throw error;
    }
  });

  // Clear statistics
  fastify.delete('/geo/statistics', {
    schema: {
      description: 'Clear geographic restriction statistics',
      tags: ['Geographic Admin'],
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
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      geoRestrictionsService.clearStatistics();

      return reply.send({
        success: true,
        data: {
          message: 'Geographic restriction statistics cleared successfully'
        }
      });
    } catch (error) {
      logger.error('Failed to clear geo restriction statistics:', error);
      throw error;
    }
  });

  // Update configuration
  fastify.put('/geo/config', {
    schema: {
      description: 'Update geographic restriction configuration',
      tags: ['Geographic Admin'],
      body: {
        type: 'object',
        properties: {
          enabled: { type: 'boolean' },
          defaultPolicy: { type: 'string', enum: ['ALLOW', 'BLOCK'] },
          enableUserBypass: { type: 'boolean' },
          enableVpnDetection: { type: 'boolean' },
          enableProxyDetection: { type: 'boolean' },
          trustedProxies: { type: 'array', items: { type: 'string' } },
          highRiskCountries: { type: 'array', items: { type: 'string' } },
          cacheTtl: { type: 'number' },
          logAllChecks: { type: 'boolean' }
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
  }, async (request: FastifyRequest<{ Body: GeoConfigUpdateBody }>, reply: FastifyReply) => {
    try {
      const configUpdate = request.body;

      geoRestrictionsService.updateConfig(configUpdate);

      return reply.send({
        success: true,
        data: {
          message: 'Geographic restriction configuration updated successfully'
        }
      });
    } catch (error) {
      logger.error('Failed to update geo restriction configuration:', error);
      throw error;
    }
  });

  // Clear geolocation cache
  fastify.delete('/geo/cache', {
    schema: {
      description: 'Clear geolocation cache',
      tags: ['Geographic Admin'],
      querystring: {
        type: 'object',
        properties: {
          ip: { type: 'string', description: 'Specific IP to clear from cache (optional)' }
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
  }, async (request: FastifyRequest<{ Querystring: { ip?: string } }>, reply: FastifyReply) => {
    try {
      const { ip } = request.query;

      await geolocationService.clearCache(ip);

      return reply.send({
        success: true,
        data: {
          message: ip 
            ? `Geolocation cache cleared for IP: ${ip}`
            : 'All geolocation cache cleared successfully'
        }
      });
    } catch (error) {
      logger.error('Failed to clear geolocation cache:', error);
      throw error;
    }
  });

  // Get geolocation service statistics
  fastify.get('/geo/service-stats', {
    schema: {
      description: 'Get geolocation service statistics',
      tags: ['Geographic Admin'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                cacheHitRate: { type: 'number' },
                totalRequests: { type: 'number' },
                providerUsage: { type: 'object' },
                avgResponseTime: { type: 'number' }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const statistics = await geolocationService.getStatistics();

      return reply.send({
        success: true,
        data: statistics
      });
    } catch (error) {
      logger.error('Failed to get geolocation service statistics:', error);
      throw error;
    }
  });
}