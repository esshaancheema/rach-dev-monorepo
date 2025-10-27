import { EventEmitter } from 'events';
import { PrismaClient } from '@zoptal/database';
import {
  AuthProviderManager,
  AuthProviderConfig,
  AuthProviderPlugin,
  AuthProviderCredentials,
  AuthProviderContext,
  AuthProviderResult,
  AuthProviderEvent,
  AuthProviderEventHandler
} from '../interfaces/auth-provider.interface';
import { authProviderRegistry } from './auth-provider-registry.service';
import { logger } from '../utils/logger';
import { cacheManager } from '../utils/redis';
import { createAuthError } from '../middleware/error-handler';
import { ERROR_CODES } from '../constants/error-codes';

/**
 * Manager for handling multiple authentication providers
 */
export class AuthProviderManagerService implements AuthProviderManager {
  private providers = new Map<string, AuthProviderConfig>();
  private providerInstances = new Map<string, AuthProviderPlugin>();
  private eventEmitter = new EventEmitter();

  constructor(private prisma: PrismaClient) {
    this.loadProvidersFromDatabase();
    
    logger.info('Auth provider manager initialized');
  }

  /**
   * Add a new provider configuration
   */
  async addProvider(config: AuthProviderConfig): Promise<void> {
    try {
      // Validate configuration
      const validation = authProviderRegistry.validateProviderConfig(config.name, config.config);
      if (!validation.valid) {
        throw createAuthError(
          `Invalid provider configuration: ${validation.errors.join(', ')}`,
          undefined,
          ERROR_CODES.VALIDATION_INVALID_FORMAT
        );
      }

      // Check for duplicate provider IDs
      if (this.providers.has(config.name)) {
        throw createAuthError(
          `Provider with name '${config.name}' already exists`,
          undefined,
          ERROR_CODES.RESOURCE_ALREADY_EXISTS
        );
      }

      // Create provider instance
      const instance = authProviderRegistry.createProvider(config);
      if (!instance) {
        throw createAuthError(
          `Failed to create provider instance for: ${config.name}`,
          undefined,
          ERROR_CODES.SYSTEM_INTERNAL_ERROR
        );
      }

      // Initialize the provider
      await instance.initialize(config.config);

      // Store configuration and instance
      this.providers.set(config.name, config);
      this.providerInstances.set(config.name, instance);

      // Persist to database
      await this.saveProviderToDatabase(config);

      // Clear cache
      await this.clearProviderCache();

      // Emit event
      await this.emitEvent({
        type: 'config_change',
        providerId: config.name,
        timestamp: new Date(),
        data: { action: 'added', config },
        context: this.createSystemContext()
      });

      logger.info(`Auth provider added successfully: ${config.name}`);
    } catch (error) {
      logger.error(`Failed to add auth provider: ${config.name}`, error);
      throw error;
    }
  }

  /**
   * Remove a provider
   */
  async removeProvider(providerId: string): Promise<void> {
    try {
      const config = this.providers.get(providerId);
      if (!config) {
        throw createAuthError(
          `Provider not found: ${providerId}`,
          undefined,
          ERROR_CODES.RESOURCE_NOT_FOUND
        );
      }

      const instance = this.providerInstances.get(providerId);
      if (instance && instance.cleanup) {
        await instance.cleanup();
      }

      // Remove from memory
      this.providers.delete(providerId);
      this.providerInstances.delete(providerId);

      // Remove from database
      await this.removeProviderFromDatabase(providerId);

      // Clear cache
      await this.clearProviderCache();

      // Emit event
      await this.emitEvent({
        type: 'config_change',
        providerId,
        timestamp: new Date(),
        data: { action: 'removed', config },
        context: this.createSystemContext()
      });

      logger.info(`Auth provider removed successfully: ${providerId}`);
    } catch (error) {
      logger.error(`Failed to remove auth provider: ${providerId}`, error);
      throw error;
    }
  }

  /**
   * Update provider configuration
   */
  async updateProvider(providerId: string, updates: Partial<AuthProviderConfig>): Promise<void> {
    try {
      const existingConfig = this.providers.get(providerId);
      if (!existingConfig) {
        throw createAuthError(
          `Provider not found: ${providerId}`,
          undefined,
          ERROR_CODES.RESOURCE_NOT_FOUND
        );
      }

      const newConfig = { ...existingConfig, ...updates };

      // Validate updated configuration
      const validation = authProviderRegistry.validateProviderConfig(newConfig.name, newConfig.config);
      if (!validation.valid) {
        throw createAuthError(
          `Invalid provider configuration: ${validation.errors.join(', ')}`,
          undefined,
          ERROR_CODES.VALIDATION_INVALID_FORMAT
        );
      }

      // Cleanup old instance if it exists
      const oldInstance = this.providerInstances.get(providerId);
      if (oldInstance && oldInstance.cleanup) {
        await oldInstance.cleanup();
      }

      // Create new instance with updated config
      const newInstance = authProviderRegistry.createProvider(newConfig);
      if (!newInstance) {
        throw createAuthError(
          `Failed to create provider instance for: ${newConfig.name}`,
          undefined,
          ERROR_CODES.SYSTEM_INTERNAL_ERROR
        );
      }

      // Initialize the new provider
      await newInstance.initialize(newConfig.config);

      // Update in memory
      this.providers.set(providerId, newConfig);
      this.providerInstances.set(providerId, newInstance);

      // Update in database
      await this.updateProviderInDatabase(providerId, newConfig);

      // Clear cache
      await this.clearProviderCache();

      // Emit event
      await this.emitEvent({
        type: 'config_change',
        providerId,
        timestamp: new Date(),
        data: { action: 'updated', config: newConfig, updates },
        context: this.createSystemContext()
      });

      logger.info(`Auth provider updated successfully: ${providerId}`);
    } catch (error) {
      logger.error(`Failed to update auth provider: ${providerId}`, error);
      throw error;
    }
  }

  /**
   * Get all configured providers
   */
  getProviders(): AuthProviderConfig[] {
    return Array.from(this.providers.values());
  }

  /**
   * Get enabled providers ordered by priority
   */
  getEnabledProviders(): AuthProviderConfig[] {
    return Array.from(this.providers.values())
      .filter(provider => provider.enabled)
      .sort((a, b) => a.priority - b.priority);
  }

  /**
   * Get provider by ID
   */
  getProvider(providerId: string): AuthProviderConfig | undefined {
    return this.providers.get(providerId);
  }

  /**
   * Get provider instance by ID
   */
  getProviderInstance(providerId: string): AuthProviderPlugin | undefined {
    return this.providerInstances.get(providerId);
  }

  /**
   * Authenticate using best matching provider
   */
  async authenticate(
    credentials: AuthProviderCredentials,
    context: AuthProviderContext
  ): Promise<AuthProviderResult & { providerId?: string }> {
    const enabledProviders = this.getEnabledProviders();
    
    if (enabledProviders.length === 0) {
      throw createAuthError(
        'No authentication providers are configured',
        undefined,
        ERROR_CODES.SYSTEM_CONFIGURATION_ERROR
      );
    }

    const errors: Array<{ providerId: string; error: any }> = [];

    // Try each provider in priority order
    for (const providerConfig of enabledProviders) {
      const instance = this.providerInstances.get(providerConfig.name);
      if (!instance) {
        logger.warn(`Provider instance not found: ${providerConfig.name}`);
        continue;
      }

      try {
        const result = await instance.authenticate(credentials, context);
        
        if (result.success) {
          // Emit success event
          await this.emitEvent({
            type: 'login',
            providerId: providerConfig.name,
            userId: result.user?.id,
            timestamp: new Date(),
            data: { success: true, metadata: result.metadata },
            context
          });

          logger.info(`Authentication successful via provider: ${providerConfig.name}`, {
            userId: result.user?.id,
            providerId: providerConfig.name
          });

          return {
            ...result,
            providerId: providerConfig.name
          };
        } else {
          errors.push({
            providerId: providerConfig.name,
            error: result.error
          });
        }
      } catch (error) {
        logger.error(`Authentication failed for provider: ${providerConfig.name}`, error);
        errors.push({
          providerId: providerConfig.name,
          error: { code: 'PROVIDER_ERROR', message: error.message }
        });

        // Emit error event
        await this.emitEvent({
          type: 'error',
          providerId: providerConfig.name,
          timestamp: new Date(),
          data: { error: error.message, credentials: { type: credentials.type } },
          context
        });
      }
    }

    // All providers failed
    logger.warn('Authentication failed for all providers', {
      identifier: credentials.identifier,
      providerCount: enabledProviders.length,
      errors: errors.map(e => ({ providerId: e.providerId, error: e.error?.message }))
    });

    return {
      success: false,
      error: {
        code: 'AUTH_ALL_PROVIDERS_FAILED',
        message: 'Authentication failed for all configured providers',
        details: { errors }
      }
    };
  }

  /**
   * Register event handler
   */
  onEvent(handler: AuthProviderEventHandler): void {
    this.eventEmitter.on('provider-event', handler);
  }

  /**
   * Remove event handler
   */
  offEvent(handler: AuthProviderEventHandler): void {
    this.eventEmitter.off('provider-event', handler);
  }

  /**
   * Emit event to all handlers
   */
  async emitEvent(event: AuthProviderEvent): Promise<void> {
    try {
      this.eventEmitter.emit('provider-event', event);
      
      // Also log important events
      if (['login', 'register', 'error'].includes(event.type)) {
        logger.info('Auth provider event', {
          type: event.type,
          providerId: event.providerId,
          userId: event.userId,
          timestamp: event.timestamp
        });
      }
    } catch (error) {
      logger.error('Failed to emit auth provider event', error);
    }
  }

  /**
   * Health check all providers
   */
  async healthCheck(): Promise<Record<string, any>> {
    const healthStatus: Record<string, any> = {
      overall: 'healthy',
      providers: {},
      summary: {
        total: 0,
        healthy: 0,
        degraded: 0,
        unhealthy: 0
      }
    };

    for (const [providerId, instance] of this.providerInstances.entries()) {
      healthStatus.summary.total++;

      try {
        if (instance.healthCheck) {
          const result = await instance.healthCheck();
          healthStatus.providers[providerId] = result;
          
          switch (result.status) {
            case 'healthy':
              healthStatus.summary.healthy++;
              break;
            case 'degraded':
              healthStatus.summary.degraded++;
              break;
            case 'unhealthy':
              healthStatus.summary.unhealthy++;
              break;
          }
        } else {
          healthStatus.providers[providerId] = {
            status: 'healthy',
            details: { note: 'Health check not implemented' }
          };
          healthStatus.summary.healthy++;
        }
      } catch (error) {
        healthStatus.providers[providerId] = {
          status: 'unhealthy',
          details: { error: error.message }
        };
        healthStatus.summary.unhealthy++;
      }
    }

    // Determine overall health
    if (healthStatus.summary.unhealthy > 0) {
      healthStatus.overall = 'unhealthy';
    } else if (healthStatus.summary.degraded > 0) {
      healthStatus.overall = 'degraded';
    }

    return healthStatus;
  }

  /**
   * Get provider statistics
   */
  getStatistics(): {
    totalProviders: number;
    enabledProviders: number;
    providerTypes: Record<string, number>;
    providersByPriority: Array<{ name: string; priority: number; enabled: boolean }>;
  } {
    const providers = this.getProviders();
    const providerTypes: Record<string, number> = {};
    
    providers.forEach(provider => {
      providerTypes[provider.type] = (providerTypes[provider.type] || 0) + 1;
    });

    return {
      totalProviders: providers.length,
      enabledProviders: providers.filter(p => p.enabled).length,
      providerTypes,
      providersByPriority: providers
        .map(p => ({ name: p.name, priority: p.priority, enabled: p.enabled }))
        .sort((a, b) => a.priority - b.priority)
    };
  }

  /**
   * Private helper methods
   */
  private async loadProvidersFromDatabase(): Promise<void> {
    try {
      // In a real implementation, this would load from database
      // For now, we'll start with an empty set and providers can be added via API
      logger.info('Auth providers loaded from database');
    } catch (error) {
      logger.error('Failed to load auth providers from database', error);
    }
  }

  private async saveProviderToDatabase(config: AuthProviderConfig): Promise<void> {
    try {
      // In a real implementation, this would save to database
      logger.debug(`Saved provider to database: ${config.name}`);
    } catch (error) {
      logger.error(`Failed to save provider to database: ${config.name}`, error);
      throw error;
    }
  }

  private async updateProviderInDatabase(providerId: string, config: AuthProviderConfig): Promise<void> {
    try {
      // In a real implementation, this would update the database
      logger.debug(`Updated provider in database: ${providerId}`);
    } catch (error) {
      logger.error(`Failed to update provider in database: ${providerId}`, error);
      throw error;
    }
  }

  private async removeProviderFromDatabase(providerId: string): Promise<void> {
    try {
      // In a real implementation, this would remove from database
      logger.debug(`Removed provider from database: ${providerId}`);
    } catch (error) {
      logger.error(`Failed to remove provider from database: ${providerId}`, error);
      throw error;
    }
  }

  private async clearProviderCache(): Promise<void> {
    try {
      await cacheManager.del('auth:providers:*');
      logger.debug('Auth provider cache cleared');
    } catch (error) {
      logger.warn('Failed to clear auth provider cache', error);
    }
  }

  private createSystemContext(): AuthProviderContext {
    return {
      ip: '127.0.0.1',
      userAgent: 'AuthProviderManager/1.0',
      sessionId: 'system',
      requestId: `system_${Date.now()}`,
      metadata: { source: 'system' }
    };
  }
}

// Export singleton instance
export const authProviderManager = new AuthProviderManagerService(
  new (require('@zoptal/database').PrismaClient)()
);