import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authProviderManager } from '../services/auth-provider-manager.service';
import { authProviderRegistry } from '../services/auth-provider-registry.service';
import { AuthProviderConfig } from '../interfaces/auth-provider.interface';
import { logger } from '../utils/logger';
import { createAuthError, createValidationError } from '../middleware/error-handler';
import { ERROR_CODES } from '../constants/error-codes';

interface AddProviderRequest {
  name: string;
  displayName: string;
  description?: string;
  type: string;
  priority: number;
  enabled: boolean;
  config: Record<string, any>;
  features: {
    login: boolean;
    register: boolean;
    passwordReset: boolean;
    profileUpdate: boolean;
    mfa: boolean;
    refresh: boolean;
    logout: boolean;
  };
  security: {
    requireEmailVerification: boolean;
    allowedDomains?: string[];
    blockedDomains?: string[];
    requireMfa?: boolean;
    sessionTtl?: number;
    refreshTtl?: number;
  };
  ui: {
    icon?: string;
    color?: string;
    hidden?: boolean;
    loginButtonText?: string;
    registerButtonText?: string;
  };
}

interface UpdateProviderRequest extends Partial<AddProviderRequest> {}

interface TestProviderRequest {
  providerId: string;
  credentials: {
    type: string;
    identifier: string;
    secret?: string;
    metadata?: Record<string, any>;
  };
}

export async function authProviderAdminRoutes(fastify: FastifyInstance) {
  // Get all available provider types
  fastify.get('/auth-providers/types', {
    schema: {
      description: 'Get all available authentication provider types',
      tags: ['Auth Provider Admin'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                providers: {
                  type: 'object',
                  additionalProperties: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      type: { type: 'string' },
                      description: { type: 'string' },
                      version: { type: 'string' },
                      author: { type: 'string' },
                      supportedFeatures: { type: 'array', items: { type: 'string' } }
                    }
                  }
                },
                statistics: {
                  type: 'object',
                  properties: {
                    totalFactories: { type: 'number' },
                    providerNames: { type: 'array', items: { type: 'string' } },
                    providerTypes: { type: 'object' }
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
      const providerInfo = authProviderRegistry.getAllProviderInfo();
      const statistics = authProviderRegistry.getStats();

      return reply.send({
        success: true,
        data: {
          providers: providerInfo,
          statistics
        }
      });
    } catch (error) {
      logger.error('Failed to get provider types', error);
      throw error;
    }
  });

  // Get configuration template for a provider type
  fastify.get('/auth-providers/types/:providerType/template', {
    schema: {
      description: 'Get configuration template for a specific provider type',
      tags: ['Auth Provider Admin'],
      params: {
        type: 'object',
        required: ['providerType'],
        properties: {
          providerType: { type: 'string' }
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
                template: { type: 'object' },
                info: { type: 'object' }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest<{ Params: { providerType: string } }>, reply: FastifyReply) => {
    try {
      const { providerType } = request.params;

      const template = authProviderRegistry.getConfigTemplate(providerType);
      const info = authProviderRegistry.getProviderInfo(providerType);

      if (!template || !info) {
        throw createAuthError(
          `Provider type '${providerType}' not found`,
          undefined,
          ERROR_CODES.RESOURCE_NOT_FOUND
        );
      }

      return reply.send({
        success: true,
        data: {
          template,
          info
        }
      });
    } catch (error) {
      logger.error('Failed to get provider template', error);
      throw error;
    }
  });

  // Get all configured providers
  fastify.get('/auth-providers', {
    schema: {
      description: 'Get all configured authentication providers',
      tags: ['Auth Provider Admin'],
      querystring: {
        type: 'object',
        properties: {
          enabled: { type: 'boolean', description: 'Filter by enabled status' },
          type: { type: 'string', description: 'Filter by provider type' }
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
                providers: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      displayName: { type: 'string' },
                      description: { type: 'string' },
                      type: { type: 'string' },
                      priority: { type: 'number' },
                      enabled: { type: 'boolean' },
                      features: { type: 'object' },
                      security: { type: 'object' },
                      ui: { type: 'object' }
                    }
                  }
                },
                statistics: { type: 'object' }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest<{ Querystring: { enabled?: boolean; type?: string } }>, reply: FastifyReply) => {
    try {
      let providers = authProviderManager.getProviders();
      const { enabled, type } = request.query;

      // Apply filters
      if (enabled !== undefined) {
        providers = providers.filter(p => p.enabled === enabled);
      }

      if (type) {
        providers = providers.filter(p => p.type === type);
      }

      // Remove sensitive configuration data
      const sanitizedProviders = providers.map(provider => ({
        ...provider,
        config: undefined // Don't expose sensitive config in list view
      }));

      const statistics = authProviderManager.getStatistics();

      return reply.send({
        success: true,
        data: {
          providers: sanitizedProviders,
          statistics
        }
      });
    } catch (error) {
      logger.error('Failed to get auth providers', error);
      throw error;
    }
  });

  // Get specific provider configuration
  fastify.get('/auth-providers/:providerId', {
    schema: {
      description: 'Get specific authentication provider configuration',
      tags: ['Auth Provider Admin'],
      params: {
        type: 'object',
        required: ['providerId'],
        properties: {
          providerId: { type: 'string' }
        }
      },
      querystring: {
        type: 'object',
        properties: {
          includeSensitive: { type: 'boolean', description: 'Include sensitive configuration data' }
        }
      }
    }
  }, async (request: FastifyRequest<{ 
    Params: { providerId: string }; 
    Querystring: { includeSensitive?: boolean } 
  }>, reply: FastifyReply) => {
    try {
      const { providerId } = request.params;
      const { includeSensitive = false } = request.query;

      const provider = authProviderManager.getProvider(providerId);
      if (!provider) {
        throw createAuthError(
          `Provider '${providerId}' not found`,
          undefined,
          ERROR_CODES.RESOURCE_NOT_FOUND
        );
      }

      // Sanitize config if not requesting sensitive data
      const responseProvider = includeSensitive ? provider : {
        ...provider,
        config: this.sanitizeProviderConfig(provider.config)
      };

      return reply.send({
        success: true,
        data: responseProvider
      });
    } catch (error) {
      logger.error('Failed to get auth provider', error);
      throw error;
    }
  });

  // Add new authentication provider
  fastify.post('/auth-providers', {
    schema: {
      description: 'Add a new authentication provider',
      tags: ['Auth Provider Admin'],
      body: {
        type: 'object',
        required: ['name', 'displayName', 'type', 'priority', 'config', 'features', 'security'],
        properties: {
          name: { type: 'string', minLength: 1 },
          displayName: { type: 'string', minLength: 1 },
          description: { type: 'string' },
          type: { type: 'string' },
          priority: { type: 'number', minimum: 1 },
          enabled: { type: 'boolean', default: true },
          config: { type: 'object' },
          features: {
            type: 'object',
            properties: {
              login: { type: 'boolean' },
              register: { type: 'boolean' },
              passwordReset: { type: 'boolean' },
              profileUpdate: { type: 'boolean' },
              mfa: { type: 'boolean' },
              refresh: { type: 'boolean' },
              logout: { type: 'boolean' }
            }
          },
          security: {
            type: 'object',
            properties: {
              requireEmailVerification: { type: 'boolean' },
              allowedDomains: { type: 'array', items: { type: 'string' } },
              blockedDomains: { type: 'array', items: { type: 'string' } },
              requireMfa: { type: 'boolean' },
              sessionTtl: { type: 'number' },
              refreshTtl: { type: 'number' }
            }
          },
          ui: {
            type: 'object',
            properties: {
              icon: { type: 'string' },
              color: { type: 'string' },
              hidden: { type: 'boolean' },
              loginButtonText: { type: 'string' },
              registerButtonText: { type: 'string' }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest<{ Body: AddProviderRequest }>, reply: FastifyReply) => {
    try {
      const providerData = request.body;

      // Validate provider configuration
      const validation = authProviderRegistry.validateProviderConfig(providerData.name, providerData.config);
      if (!validation.valid) {
        throw createValidationError(
          `Invalid provider configuration: ${validation.errors.join(', ')}`,
          ERROR_CODES.VALIDATION_INVALID_FORMAT
        );
      }

      // Create provider configuration
      const providerConfig: AuthProviderConfig = {
        name: providerData.name,
        displayName: providerData.displayName,
        description: providerData.description,
        version: '1.0.0',
        type: providerData.type as any,
        priority: providerData.priority,
        enabled: providerData.enabled !== false,
        config: providerData.config,
        features: providerData.features,
        security: providerData.security,
        ui: providerData.ui || {}
      };

      await authProviderManager.addProvider(providerConfig);

      return reply.status(201).send({
        success: true,
        data: {
          providerId: providerConfig.name,
          message: 'Authentication provider added successfully'
        }
      });
    } catch (error) {
      logger.error('Failed to add auth provider', error);
      throw error;
    }
  });

  // Update authentication provider
  fastify.put('/auth-providers/:providerId', {
    schema: {
      description: 'Update an existing authentication provider',
      tags: ['Auth Provider Admin'],
      params: {
        type: 'object',
        required: ['providerId'],
        properties: {
          providerId: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        properties: {
          displayName: { type: 'string' },
          description: { type: 'string' },
          priority: { type: 'number', minimum: 1 },
          enabled: { type: 'boolean' },
          config: { type: 'object' },
          features: { type: 'object' },
          security: { type: 'object' },
          ui: { type: 'object' }
        }
      }
    }
  }, async (request: FastifyRequest<{ 
    Params: { providerId: string }; 
    Body: UpdateProviderRequest 
  }>, reply: FastifyReply) => {
    try {
      const { providerId } = request.params;
      const updates = request.body;

      await authProviderManager.updateProvider(providerId, updates);

      return reply.send({
        success: true,
        data: {
          message: 'Authentication provider updated successfully'
        }
      });
    } catch (error) {
      logger.error('Failed to update auth provider', error);
      throw error;
    }
  });

  // Delete authentication provider
  fastify.delete('/auth-providers/:providerId', {
    schema: {
      description: 'Delete an authentication provider',
      tags: ['Auth Provider Admin'],
      params: {
        type: 'object',
        required: ['providerId'],
        properties: {
          providerId: { type: 'string' }
        }
      }
    }
  }, async (request: FastifyRequest<{ Params: { providerId: string } }>, reply: FastifyReply) => {
    try {
      const { providerId } = request.params;

      await authProviderManager.removeProvider(providerId);

      return reply.send({
        success: true,
        data: {
          message: 'Authentication provider deleted successfully'
        }
      });
    } catch (error) {
      logger.error('Failed to delete auth provider', error);
      throw error;
    }
  });

  // Test authentication provider
  fastify.post('/auth-providers/test', {
    schema: {
      description: 'Test authentication with a specific provider',
      tags: ['Auth Provider Admin'],
      body: {
        type: 'object',
        required: ['providerId', 'credentials'],
        properties: {
          providerId: { type: 'string' },
          credentials: {
            type: 'object',
            required: ['type', 'identifier'],
            properties: {
              type: { type: 'string' },
              identifier: { type: 'string' },
              secret: { type: 'string' },
              metadata: { type: 'object' }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest<{ Body: TestProviderRequest }>, reply: FastifyReply) => {
    try {
      const { providerId, credentials } = request.body;

      const provider = authProviderManager.getProviderInstance(providerId);
      if (!provider) {
        throw createAuthError(
          `Provider '${providerId}' not found or not initialized`,
          undefined,
          ERROR_CODES.RESOURCE_NOT_FOUND
        );
      }

      const context = {
        ip: request.ip,
        userAgent: request.headers['user-agent'] || '',
        sessionId: 'test-session',
        requestId: `test-${Date.now()}`,
        metadata: { isTest: true }
      };

      const result = await provider.authenticate(credentials, context);

      // Remove sensitive information from test response
      const sanitizedResult = {
        ...result,
        user: result.user ? {
          ...result.user,
          id: '***',
          email: result.user.email?.replace(/(.{2}).*(@.*)/, '$1***$2')
        } : undefined
      };

      return reply.send({
        success: true,
        data: sanitizedResult
      });
    } catch (error) {
      logger.error('Failed to test auth provider', error);
      throw error;
    }
  });

  // Get provider health status
  fastify.get('/auth-providers/health', {
    schema: {
      description: 'Get health status of all authentication providers',
      tags: ['Auth Provider Admin'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                overall: { type: 'string' },
                providers: { type: 'object' },
                summary: {
                  type: 'object',
                  properties: {
                    total: { type: 'number' },
                    healthy: { type: 'number' },
                    degraded: { type: 'number' },
                    unhealthy: { type: 'number' }
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
      const healthStatus = await authProviderManager.healthCheck();

      return reply.send({
        success: true,
        data: healthStatus
      });
    } catch (error) {
      logger.error('Failed to get provider health status', error);
      throw error;
    }
  });

  // Get provider statistics
  fastify.get('/auth-providers/statistics', {
    schema: {
      description: 'Get authentication provider statistics',
      tags: ['Auth Provider Admin'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                totalProviders: { type: 'number' },
                enabledProviders: { type: 'number' },
                providerTypes: { type: 'object' },
                providersByPriority: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      priority: { type: 'number' },
                      enabled: { type: 'boolean' }
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
      const statistics = authProviderManager.getStatistics();

      return reply.send({
        success: true,
        data: statistics
      });
    } catch (error) {
      logger.error('Failed to get provider statistics', error);
      throw error;
    }
  });

  // Validate provider configuration
  fastify.post('/auth-providers/validate', {
    schema: {
      description: 'Validate authentication provider configuration',
      tags: ['Auth Provider Admin'],
      body: {
        type: 'object',
        required: ['providerType', 'config'],
        properties: {
          providerType: { type: 'string' },
          config: { type: 'object' }
        }
      }
    }
  }, async (request: FastifyRequest<{ 
    Body: { providerType: string; config: Record<string, any> } 
  }>, reply: FastifyReply) => {
    try {
      const { providerType, config } = request.body;

      const validation = authProviderRegistry.validateProviderConfig(providerType, config);

      return reply.send({
        success: true,
        data: validation
      });
    } catch (error) {
      logger.error('Failed to validate provider configuration', error);
      throw error;
    }
  });

  /**
   * Helper method to sanitize provider configuration
   */
  function sanitizeProviderConfig(config: Record<string, any>): Record<string, any> {
    const sanitized = { ...config };
    
    // Remove sensitive fields
    const sensitiveFields = [
      'clientSecret',
      'secret',
      'password',
      'apiKey',
      'privateKey',
      'encryptionKey'
    ];

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '***';
      }
    }

    return sanitized;
  }
}