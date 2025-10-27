import { 
  AuthProviderFactory, 
  AuthProviderRegistry, 
  AuthProviderPlugin, 
  AuthProviderConfig 
} from '../interfaces/auth-provider.interface';
import { logger } from '../utils/logger';

/**
 * Registry for managing authentication provider factories
 */
export class AuthProviderRegistryService implements AuthProviderRegistry {
  private factories = new Map<string, AuthProviderFactory>();

  /**
   * Register a new auth provider factory
   */
  register(name: string, factory: AuthProviderFactory): void {
    if (this.factories.has(name)) {
      logger.warn(`Auth provider factory '${name}' is already registered, overwriting`);
    }

    this.factories.set(name, factory);
    logger.info(`Auth provider factory '${name}' registered successfully`);
  }

  /**
   * Unregister an auth provider factory
   */
  unregister(name: string): void {
    if (this.factories.delete(name)) {
      logger.info(`Auth provider factory '${name}' unregistered successfully`);
    } else {
      logger.warn(`Auth provider factory '${name}' not found for unregistration`);
    }
  }

  /**
   * Get all registered provider names
   */
  getProviderNames(): string[] {
    return Array.from(this.factories.keys());
  }

  /**
   * Get provider factory by name
   */
  getProviderFactory(name: string): AuthProviderFactory | undefined {
    return this.factories.get(name);
  }

  /**
   * Create provider instance from configuration
   */
  createProvider(config: AuthProviderConfig): AuthProviderPlugin | undefined {
    const factory = this.factories.get(config.name);
    if (!factory) {
      logger.error(`No factory found for auth provider: ${config.name}`);
      return undefined;
    }

    try {
      const provider = factory.create(config);
      logger.info(`Auth provider instance created: ${config.name}`);
      return provider;
    } catch (error) {
      logger.error(`Failed to create auth provider instance: ${config.name}`, error);
      return undefined;
    }
  }

  /**
   * Validate provider configuration using its factory
   */
  validateProviderConfig(providerName: string, config: Record<string, any>): {
    valid: boolean;
    errors: string[];
  } {
    const factory = this.factories.get(providerName);
    if (!factory) {
      return {
        valid: false,
        errors: [`No factory found for provider: ${providerName}`]
      };
    }

    return factory.validateConfig(config);
  }

  /**
   * Get configuration template for a provider
   */
  getConfigTemplate(providerName: string): Record<string, any> | undefined {
    const factory = this.factories.get(providerName);
    if (!factory) {
      logger.error(`No factory found for provider: ${providerName}`);
      return undefined;
    }

    return factory.getConfigTemplate();
  }

  /**
   * Get provider information
   */
  getProviderInfo(providerName: string): any {
    const factory = this.factories.get(providerName);
    if (!factory) {
      return undefined;
    }

    return factory.getProviderInfo();
  }

  /**
   * Get all available provider types and their information
   */
  getAllProviderInfo(): Record<string, any> {
    const info: Record<string, any> = {};
    
    for (const [name, factory] of this.factories.entries()) {
      try {
        info[name] = factory.getProviderInfo();
      } catch (error) {
        logger.error(`Failed to get provider info for: ${name}`, error);
        info[name] = {
          name,
          error: 'Failed to get provider information'
        };
      }
    }

    return info;
  }

  /**
   * Clear all registered factories (for testing)
   */
  clear(): void {
    this.factories.clear();
    logger.info('All auth provider factories cleared');
  }

  /**
   * Get registry statistics
   */
  getStats(): {
    totalFactories: number;
    providerNames: string[];
    providerTypes: Record<string, number>;
  } {
    const providerTypes: Record<string, number> = {};
    
    for (const factory of this.factories.values()) {
      try {
        const info = factory.getProviderInfo();
        const type = info.type || 'unknown';
        providerTypes[type] = (providerTypes[type] || 0) + 1;
      } catch (error) {
        providerTypes['error'] = (providerTypes['error'] || 0) + 1;
      }
    }

    return {
      totalFactories: this.factories.size,
      providerNames: this.getProviderNames(),
      providerTypes
    };
  }
}

// Export singleton instance
export const authProviderRegistry = new AuthProviderRegistryService();