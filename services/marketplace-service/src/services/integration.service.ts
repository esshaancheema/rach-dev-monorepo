import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import * as semver from 'semver';
import { 
  Integration, 
  IntegrationStatus, 
  IntegrationVisibility,
  ReviewStatus,
  IntegrationManifest,
  Installation,
  HealthStatus,
  Developer
} from '../models/integration.model';
import { logger, loggers } from '../utils/logger';
import { DatabaseService } from './database.service';
import { CacheService } from './cache.service';
import { PackageService } from './package.service';
import { WebhookService } from './webhook.service';
import { SecurityService } from './security.service';
import { config } from '../config/config';

export class IntegrationService {
  constructor(
    private databaseService: DatabaseService,
    private cacheService: CacheService,
    private packageService: PackageService,
    private webhookService: WebhookService,
    private securityService: SecurityService
  ) {}

  // Integration Management
  public async createIntegration(
    integrationData: Partial<Integration>,
    developerId: string,
    packageFile: Buffer
  ): Promise<Integration> {
    try {
      // Validate developer can create more integrations
      const developerIntegrations = await this.getDeveloperIntegrations(developerId);
      if (developerIntegrations.length >= config.integrations.maxIntegrationsPerDeveloper) {
        throw new Error(`Maximum number of integrations (${config.integrations.maxIntegrationsPerDeveloper}) reached`);
      }

      // Extract and validate manifest from package
      const manifest = await this.packageService.extractManifest(packageFile);
      await this.validateManifest(manifest);

      // Upload package and calculate hash
      const packageInfo = await this.packageService.uploadPackage(packageFile, manifest);

      // Create integration
      const integration: Integration = {
        id: uuidv4(),
        name: integrationData.name || manifest.name,
        description: integrationData.description || manifest.description,
        shortDescription: integrationData.shortDescription || this.generateShortDescription(manifest.description),
        developerId,
        version: manifest.version,
        category: integrationData.category!,
        tags: integrationData.tags || [],
        homepage: integrationData.homepage || '',
        supportUrl: integrationData.supportUrl || '',
        documentationUrl: integrationData.documentationUrl || '',
        pricing: integrationData.pricing!,
        manifest,
        packageUrl: packageInfo.url,
        packageHash: packageInfo.hash,
        packageSize: packageInfo.size,
        logo: integrationData.logo || '',
        screenshots: integrationData.screenshots || [],
        videoUrl: integrationData.videoUrl,
        status: IntegrationStatus.DRAFT,
        visibility: integrationData.visibility || IntegrationVisibility.PUBLIC,
        reviewStatus: ReviewStatus.PENDING,
        totalInstalls: 0,
        activeInstalls: 0,
        averageRating: 0,
        totalRatings: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        gdprCompliant: integrationData.gdprCompliant || false,
        dataProcessing: integrationData.dataProcessing!,
        permissions: manifest.permissions,
        compatibleVersions: integrationData.compatibleVersions || ['*'],
        minimumPlatformVersion: manifest.platformVersion,
        webhookEndpoints: integrationData.webhookEndpoints || [],
        subscribedEvents: manifest.events?.map(e => e.name) || [],
        oauthConfig: integrationData.oauthConfig,
      };

      // Store in database
      await this.databaseService.createIntegration(integration);

      // Cache integration
      await this.cacheIntegration(integration);

      // Log creation
      loggers.integration.created(integration.id, developerId, integration.name);

      return integration;

    } catch (error) {
      logger.error('Failed to create integration', {
        developerId,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  public async updateIntegration(
    integrationId: string,
    updates: Partial<Integration>,
    developerId: string,
    packageFile?: Buffer
  ): Promise<Integration> {
    try {
      const integration = await this.getIntegration(integrationId);
      
      if (!integration) {
        throw new Error('Integration not found');
      }

      if (integration.developerId !== developerId) {
        throw new Error('Unauthorized to update this integration');
      }

      // If updating package, validate and upload
      if (packageFile) {
        const manifest = await this.packageService.extractManifest(packageFile);
        await this.validateManifest(manifest);

        // Ensure version is newer
        if (!semver.gt(manifest.version, integration.version)) {
          throw new Error('New version must be greater than current version');
        }

        const packageInfo = await this.packageService.uploadPackage(packageFile, manifest);
        
        updates.manifest = manifest;
        updates.version = manifest.version;
        updates.packageUrl = packageInfo.url;
        updates.packageHash = packageInfo.hash;
        updates.packageSize = packageInfo.size;
        updates.permissions = manifest.permissions;
        updates.minimumPlatformVersion = manifest.platformVersion;
        updates.subscribedEvents = manifest.events?.map(e => e.name) || [];
      }

      // Update fields
      const updatedIntegration: Integration = {
        ...integration,
        ...updates,
        updatedAt: new Date(),
      };

      // If updating critical fields, reset review status
      const criticalFields = ['manifest', 'permissions', 'webhookEndpoints', 'oauthConfig'];
      const hasCriticalChanges = criticalFields.some(field => updates.hasOwnProperty(field));
      
      if (hasCriticalChanges && integration.status === IntegrationStatus.PUBLISHED) {
        updatedIntegration.reviewStatus = ReviewStatus.PENDING;
        updatedIntegration.status = IntegrationStatus.SUBMITTED;
      }

      // Store updates
      await this.databaseService.updateIntegration(integrationId, updatedIntegration);

      // Update cache
      await this.cacheIntegration(updatedIntegration);

      // Clear related caches
      await this.clearIntegrationCaches(integrationId);

      return updatedIntegration;

    } catch (error) {
      logger.error('Failed to update integration', {
        integrationId,
        developerId,
        error: error.message,
      });
      throw error;
    }
  }

  public async getIntegration(integrationId: string): Promise<Integration | null> {
    try {
      // Try cache first
      const cacheKey = `integration:${integrationId}`;
      const cached = await this.cacheService.get<Integration>(cacheKey);
      
      if (cached) {
        return cached;
      }

      // Fetch from database
      const integration = await this.databaseService.getIntegration(integrationId);
      
      if (integration) {
        await this.cacheIntegration(integration);
      }

      return integration;

    } catch (error) {
      logger.error('Failed to get integration', {
        integrationId,
        error: error.message,
      });
      return null;
    }
  }

  public async getIntegrations(
    filters: {
      category?: string;
      search?: string;
      developerId?: string;
      status?: IntegrationStatus;
      featured?: boolean;
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    } = {}
  ): Promise<{ integrations: Integration[]; total: number; page: number; limit: number }> {
    try {
      const { page = 1, limit = 20 } = filters;
      
      // Build cache key for common queries
      const cacheKey = `integrations:${JSON.stringify(filters)}`;
      const cached = await this.cacheService.get(cacheKey);
      
      if (cached) {
        return cached;
      }

      // Fetch from database
      const result = await this.databaseService.getIntegrations(filters);

      // Cache result for 5 minutes
      await this.cacheService.set(cacheKey, result, 300);

      return result;

    } catch (error) {
      logger.error('Failed to get integrations', {
        filters,
        error: error.message,
      });
      throw error;
    }
  }

  public async getDeveloperIntegrations(developerId: string): Promise<Integration[]> {
    try {
      const result = await this.getIntegrations({ 
        developerId, 
        limit: 1000 // Get all developer integrations
      });
      
      return result.integrations;

    } catch (error) {
      logger.error('Failed to get developer integrations', {
        developerId,
        error: error.message,
      });
      throw error;
    }
  }

  public async publishIntegration(integrationId: string, developerId: string): Promise<Integration> {
    try {
      const integration = await this.getIntegration(integrationId);
      
      if (!integration) {
        throw new Error('Integration not found');
      }

      if (integration.developerId !== developerId) {
        throw new Error('Unauthorized to publish this integration');
      }

      if (integration.reviewStatus !== ReviewStatus.APPROVED) {
        throw new Error('Integration must be approved before publishing');
      }

      // Update status
      const updatedIntegration: Integration = {
        ...integration,
        status: IntegrationStatus.PUBLISHED,
        publishedAt: new Date(),
        updatedAt: new Date(),
      };

      await this.databaseService.updateIntegration(integrationId, updatedIntegration);
      await this.cacheIntegration(updatedIntegration);

      return updatedIntegration;

    } catch (error) {
      logger.error('Failed to publish integration', {
        integrationId,
        developerId,
        error: error.message,
      });
      throw error;
    }
  }

  public async unpublishIntegration(integrationId: string, developerId: string, reason?: string): Promise<Integration> {
    try {
      const integration = await this.getIntegration(integrationId);
      
      if (!integration) {
        throw new Error('Integration not found');
      }

      if (integration.developerId !== developerId) {
        throw new Error('Unauthorized to unpublish this integration');
      }

      // Update status
      const updatedIntegration: Integration = {
        ...integration,
        status: IntegrationStatus.DRAFT,
        updatedAt: new Date(),
      };

      await this.databaseService.updateIntegration(integrationId, updatedIntegration);
      await this.cacheIntegration(updatedIntegration);

      // Notify installed users about unpublishing
      await this.notifyUnpublishToUsers(integrationId, reason);

      return updatedIntegration;

    } catch (error) {
      logger.error('Failed to unpublish integration', {
        integrationId,
        developerId,
        error: error.message,
      });
      throw error;
    }
  }

  // Installation Management
  public async installIntegration(
    integrationId: string,
    userId: string,
    organizationId?: string,
    config: Record<string, any> = {}
  ): Promise<Installation> {
    try {
      const integration = await this.getIntegration(integrationId);
      
      if (!integration) {
        throw new Error('Integration not found');
      }

      if (integration.status !== IntegrationStatus.PUBLISHED) {
        throw new Error('Integration is not published');
      }

      // Check for existing installation
      const existingInstallation = await this.getUserInstallation(integrationId, userId, organizationId);
      if (existingInstallation) {
        throw new Error('Integration is already installed');
      }

      // Validate configuration against schema
      if (integration.manifest.configSchema) {
        await this.validateConfiguration(config, integration.manifest.configSchema);
      }

      // Create installation
      const installation: Installation = {
        id: uuidv4(),
        integrationId,
        userId,
        organizationId,
        config,
        enabled: true,
        webhookSecret: crypto.randomBytes(32).toString('hex'),
        webhookEndpoints: integration.webhookEndpoints.map(ep => ep.url),
        lastUsedAt: new Date(),
        usageCount: 0,
        errorCount: 0,
        healthStatus: HealthStatus.UNKNOWN,
        installedAt: new Date(),
        updatedAt: new Date(),
      };

      // Store installation
      await this.databaseService.createInstallation(installation);

      // Update integration statistics
      await this.updateIntegrationStats(integrationId, { activeInstalls: 1, totalInstalls: 1 });

      // Set up webhooks if needed
      if (integration.webhookEndpoints.length > 0) {
        await this.setupWebhooks(installation);
      }

      // Initialize OAuth if configured
      if (integration.oauthConfig) {
        await this.initializeOAuth(installation, integration.oauthConfig);
      }

      // Cache installation
      await this.cacheInstallation(installation);

      // Log installation
      loggers.integration.installed(integrationId, userId, organizationId);

      return installation;

    } catch (error) {
      logger.error('Failed to install integration', {
        integrationId,
        userId,
        organizationId,
        error: error.message,
      });
      throw error;
    }
  }

  public async uninstallIntegration(
    integrationId: string,
    userId: string,
    organizationId?: string,
    reason?: string
  ): Promise<void> {
    try {
      const installation = await this.getUserInstallation(integrationId, userId, organizationId);
      
      if (!installation) {
        throw new Error('Integration is not installed');
      }

      // Clean up webhooks
      await this.cleanupWebhooks(installation);

      // Revoke OAuth tokens
      if (installation.accessToken) {
        await this.revokeOAuthTokens(installation);
      }

      // Mark as uninstalled
      await this.databaseService.updateInstallation(installation.id, {
        ...installation,
        enabled: false,
        uninstalledAt: new Date(),
        updatedAt: new Date(),
      });

      // Update integration statistics
      await this.updateIntegrationStats(integrationId, { activeInstalls: -1 });

      // Clear caches
      await this.clearInstallationCaches(installation.id);

      // Log uninstallation
      loggers.integration.uninstalled(integrationId, userId, reason);

    } catch (error) {
      logger.error('Failed to uninstall integration', {
        integrationId,
        userId,
        organizationId,
        error: error.message,
      });
      throw error;
    }
  }

  public async getUserInstallation(
    integrationId: string,
    userId: string,
    organizationId?: string
  ): Promise<Installation | null> {
    try {
      const cacheKey = `installation:${integrationId}:${userId}:${organizationId || 'personal'}`;
      const cached = await this.cacheService.get<Installation>(cacheKey);
      
      if (cached) {
        return cached;
      }

      const installation = await this.databaseService.getUserInstallation(
        integrationId,
        userId,
        organizationId
      );

      if (installation) {
        await this.cacheInstallation(installation);
      }

      return installation;

    } catch (error) {
      logger.error('Failed to get user installation', {
        integrationId,
        userId,
        organizationId,
        error: error.message,
      });
      return null;
    }
  }

  public async getUserInstallations(
    userId: string,
    organizationId?: string,
    filters: { enabled?: boolean; category?: string } = {}
  ): Promise<Installation[]> {
    try {
      const installations = await this.databaseService.getUserInstallations(
        userId,
        organizationId,
        filters
      );

      // Cache each installation
      for (const installation of installations) {
        await this.cacheInstallation(installation);
      }

      return installations;

    } catch (error) {
      logger.error('Failed to get user installations', {
        userId,
        organizationId,
        filters,
        error: error.message,
      });
      throw error;
    }
  }

  public async updateInstallationConfig(
    installationId: string,
    userId: string,
    config: Record<string, any>
  ): Promise<Installation> {
    try {
      const installation = await this.getInstallation(installationId);
      
      if (!installation) {
        throw new Error('Installation not found');
      }

      if (installation.userId !== userId) {
        throw new Error('Unauthorized to update this installation');
      }

      const integration = await this.getIntegration(installation.integrationId);
      
      if (!integration) {
        throw new Error('Integration not found');
      }

      // Validate configuration
      if (integration.manifest.configSchema) {
        await this.validateConfiguration(config, integration.manifest.configSchema);
      }

      // Update installation
      const updatedInstallation: Installation = {
        ...installation,
        config,
        updatedAt: new Date(),
      };

      await this.databaseService.updateInstallation(installationId, updatedInstallation);
      await this.cacheInstallation(updatedInstallation);

      return updatedInstallation;

    } catch (error) {
      logger.error('Failed to update installation config', {
        installationId,
        userId,
        error: error.message,
      });
      throw error;
    }
  }

  public async toggleInstallation(
    installationId: string,
    userId: string,
    enabled: boolean
  ): Promise<Installation> {
    try {
      const installation = await this.getInstallation(installationId);
      
      if (!installation) {
        throw new Error('Installation not found');
      }

      if (installation.userId !== userId) {
        throw new Error('Unauthorized to toggle this installation');
      }

      const updatedInstallation: Installation = {
        ...installation,
        enabled,
        updatedAt: new Date(),
      };

      await this.databaseService.updateInstallation(installationId, updatedInstallation);
      await this.cacheInstallation(updatedInstallation);

      // Update active installs count
      const delta = enabled ? 1 : -1;
      await this.updateIntegrationStats(installation.integrationId, { activeInstalls: delta });

      return updatedInstallation;

    } catch (error) {
      logger.error('Failed to toggle installation', {
        installationId,
        userId,
        enabled,
        error: error.message,
      });
      throw error;
    }
  }

  // Health and Monitoring
  public async checkInstallationHealth(installationId: string): Promise<HealthStatus> {
    try {
      const installation = await this.getInstallation(installationId);
      
      if (!installation) {
        return HealthStatus.ERROR;
      }

      const integration = await this.getIntegration(installation.integrationId);
      
      if (!integration) {
        return HealthStatus.ERROR;
      }

      // Perform health checks
      let healthStatus = HealthStatus.HEALTHY;

      // Check if integration is still active
      if (integration.status !== IntegrationStatus.PUBLISHED) {
        healthStatus = HealthStatus.ERROR;
      }

      // Check error rate
      const errorRate = installation.errorCount / Math.max(installation.usageCount, 1);
      if (errorRate > 0.1) { // 10% error rate
        healthStatus = HealthStatus.WARNING;
      }

      // Check OAuth token expiry
      if (installation.accessToken && installation.tokenExpiresAt) {
        if (installation.tokenExpiresAt < new Date()) {
          healthStatus = HealthStatus.WARNING;
        }
      }

      // Update health status
      const updatedInstallation: Installation = {
        ...installation,
        healthStatus,
        lastHealthCheck: new Date(),
        updatedAt: new Date(),
      };

      if (healthStatus === HealthStatus.ERROR) {
        updatedInstallation.healthCheckFailures = (installation.healthCheckFailures || 0) + 1;
      } else {
        updatedInstallation.healthCheckFailures = 0;
      }

      await this.databaseService.updateInstallation(installationId, updatedInstallation);
      await this.cacheInstallation(updatedInstallation);

      return healthStatus;

    } catch (error) {
      logger.error('Failed to check installation health', {
        installationId,
        error: error.message,
      });
      return HealthStatus.ERROR;
    }
  }

  public async getIntegrationAnalytics(
    integrationId: string,
    developerId: string,
    dateRange: { start: Date; end: Date }
  ): Promise<any> {
    try {
      const integration = await this.getIntegration(integrationId);
      
      if (!integration) {
        throw new Error('Integration not found');
      }

      if (integration.developerId !== developerId) {
        throw new Error('Unauthorized to view analytics');
      }

      return await this.databaseService.getIntegrationAnalytics(integrationId, dateRange);

    } catch (error) {
      logger.error('Failed to get integration analytics', {
        integrationId,
        developerId,
        error: error.message,
      });
      throw error;
    }
  }

  // Private helper methods
  private async validateManifest(manifest: IntegrationManifest): Promise<void> {
    // Validate required fields
    if (!manifest.name || !manifest.version || !manifest.description) {
      throw new Error('Manifest missing required fields: name, version, description');
    }

    // Validate version format
    if (!semver.valid(manifest.version)) {
      throw new Error('Invalid version format in manifest');
    }

    // Validate platform version compatibility
    if (!semver.satisfies(config.nodeEnv === 'production' ? '1.0.0' : '0.1.0', manifest.platformVersion)) {
      throw new Error('Incompatible platform version');
    }

    // Validate permissions
    if (manifest.permissions) {
      for (const permission of manifest.permissions) {
        if (!permission.name || !permission.description) {
          throw new Error('Invalid permission definition');
        }
      }
    }

    // Validate hooks
    if (manifest.hooks) {
      for (const hook of manifest.hooks) {
        if (!config.plugins.allowedHooks.includes(hook.trigger)) {
          throw new Error(`Invalid hook trigger: ${hook.trigger}`);
        }
      }
    }
  }

  private async validateConfiguration(config: any, schema: any): Promise<void> {
    // Implementation would use a schema validator like Joi or JSON Schema
    // For now, basic validation
    if (schema.required) {
      for (const field of schema.required) {
        if (!(field in config)) {
          throw new Error(`Required configuration field missing: ${field}`);
        }
      }
    }
  }

  private async cacheIntegration(integration: Integration): Promise<void> {
    const cacheKey = `integration:${integration.id}`;
    await this.cacheService.set(cacheKey, integration, 3600); // 1 hour
  }

  private async cacheInstallation(installation: Installation): Promise<void> {
    const cacheKey = `installation:${installation.integrationId}:${installation.userId}:${installation.organizationId || 'personal'}`;
    await this.cacheService.set(cacheKey, installation, 1800); // 30 minutes
  }

  private async clearIntegrationCaches(integrationId: string): Promise<void> {
    const patterns = [
      `integration:${integrationId}`,
      `integrations:*`,
      `installation:${integrationId}:*`,
    ];

    for (const pattern of patterns) {
      await this.cacheService.deletePattern(pattern);
    }
  }

  private async clearInstallationCaches(installationId: string): Promise<void> {
    const patterns = [
      `installation:*:${installationId}:*`,
      `installations:*`,
    ];

    for (const pattern of patterns) {
      await this.cacheService.deletePattern(pattern);
    }
  }

  private async updateIntegrationStats(
    integrationId: string,
    deltas: { activeInstalls?: number; totalInstalls?: number }
  ): Promise<void> {
    await this.databaseService.updateIntegrationStats(integrationId, deltas);
    await this.clearIntegrationCaches(integrationId);
  }

  private generateShortDescription(description: string): string {
    const maxLength = 100;
    if (description.length <= maxLength) {
      return description;
    }
    
    return description.substring(0, maxLength - 3).trim() + '...';
  }

  private async getInstallation(installationId: string): Promise<Installation | null> {
    return await this.databaseService.getInstallation(installationId);
  }

  private async setupWebhooks(installation: Installation): Promise<void> {
    // Implementation would set up webhook endpoints
    logger.info('Setting up webhooks for installation', {
      installationId: installation.id,
      endpoints: installation.webhookEndpoints,
    });
  }

  private async cleanupWebhooks(installation: Installation): Promise<void> {
    // Implementation would clean up webhook endpoints
    logger.info('Cleaning up webhooks for installation', {
      installationId: installation.id,
    });
  }

  private async initializeOAuth(installation: Installation, oauthConfig: any): Promise<void> {
    // Implementation would initialize OAuth flow
    logger.info('Initializing OAuth for installation', {
      installationId: installation.id,
    });
  }

  private async revokeOAuthTokens(installation: Installation): Promise<void> {
    // Implementation would revoke OAuth tokens
    logger.info('Revoking OAuth tokens for installation', {
      installationId: installation.id,
    });
  }

  private async notifyUnpublishToUsers(integrationId: string, reason?: string): Promise<void> {
    // Implementation would notify users about unpublishing
    logger.info('Notifying users about integration unpublish', {
      integrationId,
      reason,
    });
  }
}