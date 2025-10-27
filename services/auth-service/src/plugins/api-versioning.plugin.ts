import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import { logger } from '../utils/logger';

export interface ApiVersioningOptions {
  defaultVersion: string;
  versions: string[];
  versionExtractor?: (request: FastifyRequest) => string | undefined;
  enableStrictMode?: boolean;
  deprecatedVersions?: string[];
  versionHeader?: string;
}

export interface VersionConstraints {
  version: string;
  deprecated?: boolean;
}

// Extend Fastify request with version info
declare module 'fastify' {
  interface FastifyRequest {
    apiVersion: string;
    isDeprecatedVersion: boolean;
  }
}

/**
 * API Versioning Plugin for Fastify
 * 
 * Supports multiple versioning strategies:
 * 1. URL path versioning: /api/v1/auth/login
 * 2. Header versioning: Accept-Version: v1
 * 3. Query parameter versioning: ?version=v1
 */
async function apiVersioningPlugin(
  fastify: FastifyInstance,
  options: ApiVersioningOptions
) {
  const {
    defaultVersion = 'v1',
    versions = ['v1'],
    versionExtractor,
    enableStrictMode = false,
    deprecatedVersions = [],
    versionHeader = 'accept-version'
  } = options;

  // Validate options
  if (!versions.includes(defaultVersion)) {
    throw new Error(`Default version ${defaultVersion} must be in versions array`);
  }

  // Create version regex for URL matching
  const versionRegex = new RegExp(`^/(${versions.join('|')})/`);

  /**
   * Extract version from request
   */
  function extractVersion(request: FastifyRequest): string {
    // Custom extractor takes precedence
    if (versionExtractor) {
      const customVersion = versionExtractor(request);
      if (customVersion && versions.includes(customVersion)) {
        return customVersion;
      }
    }

    // 1. Check URL path
    const urlMatch = request.url.match(versionRegex);
    if (urlMatch) {
      return urlMatch[1];
    }

    // 2. Check header
    const headerVersion = request.headers[versionHeader] as string;
    if (headerVersion && versions.includes(headerVersion)) {
      return headerVersion;
    }

    // 3. Check query parameter
    const queryVersion = (request.query as any)?.version;
    if (queryVersion && versions.includes(queryVersion)) {
      return queryVersion;
    }

    // 4. Return default version
    return defaultVersion;
  }

  /**
   * Normalize URL by removing version prefix
   */
  function normalizeUrl(url: string, version: string): string {
    return url.replace(new RegExp(`^/${version}/`), '/');
  }

  // Add version extraction hook
  fastify.addHook('onRequest', async (request, reply) => {
    const version = extractVersion(request);
    
    // Check if version is supported
    if (enableStrictMode && !versions.includes(version)) {
      return reply.status(400).send({
        error: 'UNSUPPORTED_API_VERSION',
        message: `API version ${version} is not supported`,
        supportedVersions: versions,
        defaultVersion
      });
    }

    // Set version on request
    request.apiVersion = version;
    request.isDeprecatedVersion = deprecatedVersions.includes(version);

    // Normalize URL if version is in path
    if (request.url.match(versionRegex)) {
      request.url = normalizeUrl(request.url, version);
      
      // Update raw URL for logging
      (request as any).originalUrl = request.raw.url;
      request.raw.url = request.url;
    }

    // Add version headers to response
    reply.header('X-API-Version', version);
    
    // Add deprecation warning if needed
    if (request.isDeprecatedVersion) {
      reply.header('X-API-Deprecation', 'true');
      reply.header('X-API-Deprecation-Date', getDeprecationDate(version));
      reply.header('X-API-Sunset-Date', getSunsetDate(version));
      
      logger.warn('Deprecated API version used', {
        version,
        url: request.url,
        method: request.method,
        ip: request.ip
      });
    }
  });

  // Add response hook for version info
  fastify.addHook('onSend', async (request, reply, payload) => {
    // Add supported versions info
    reply.header('X-API-Supported-Versions', versions.join(', '));
    
    // Add Link header for version discovery
    const versionLinks = versions.map(v => 
      `<${getVersionUrl(request, v)}>; rel="version-${v}"`
    ).join(', ');
    reply.header('Link', versionLinks);
    
    return payload;
  });

  /**
   * Version-specific route registration helper
   */
  fastify.decorate('routeVersion', function(
    this: FastifyInstance,
    versions: string | string[],
    routeOptions: any
  ) {
    const targetVersions = Array.isArray(versions) ? versions : [versions];
    
    // Create a preHandler that checks version
    const versionHandler = async (request: FastifyRequest, reply: FastifyReply) => {
      if (!targetVersions.includes(request.apiVersion)) {
        return reply.status(404).send({
          error: 'ROUTE_NOT_FOUND_FOR_VERSION',
          message: `This endpoint is not available in API version ${request.apiVersion}`,
          availableVersions: targetVersions
        });
      }
    };

    // Add version handler to existing preHandlers
    const existingPreHandlers = routeOptions.preHandler || [];
    const preHandlers = Array.isArray(existingPreHandlers) 
      ? [versionHandler, ...existingPreHandlers]
      : [versionHandler, existingPreHandlers];

    // Register route with version checking
    this.route({
      ...routeOptions,
      preHandler: preHandlers
    });
  });

  /**
   * Register routes for specific versions
   */
  fastify.decorate('registerVersionedRoutes', function(
    this: FastifyInstance,
    version: string,
    routes: (fastify: FastifyInstance) => void
  ) {
    if (!versions.includes(version)) {
      throw new Error(`Version ${version} is not supported`);
    }

    // Create a scoped context for version-specific routes
    this.register(async (scopedFastify) => {
      // Override route registration to add version checking
      const originalRoute = scopedFastify.route.bind(scopedFastify);
      
      scopedFastify.route = (routeOptions: any) => {
        const versionHandler = async (request: FastifyRequest, reply: FastifyReply) => {
          if (request.apiVersion !== version) {
            return reply.status(404).send({
              error: 'ROUTE_NOT_FOUND_FOR_VERSION',
              message: `This endpoint is not available in API version ${request.apiVersion}`,
              availableVersion: version
            });
          }
        };

        const existingPreHandlers = routeOptions.preHandler || [];
        const preHandlers = Array.isArray(existingPreHandlers)
          ? [versionHandler, ...existingPreHandlers]
          : [versionHandler, existingPreHandlers];

        return originalRoute({
          ...routeOptions,
          preHandler: preHandlers
        });
      };

      // Register the routes
      routes(scopedFastify);
    });
  });

  // Version migration helper
  fastify.decorate('addVersionMigration', function(
    fromVersion: string,
    toVersion: string,
    migrationFn: (request: FastifyRequest) => void
  ) {
    if (!versions.includes(fromVersion) || !versions.includes(toVersion)) {
      throw new Error('Both versions must be supported');
    }

    // Store migration function for use in routes
    const migrations = (fastify as any).versionMigrations || new Map();
    const key = `${fromVersion}->${toVersion}`;
    migrations.set(key, migrationFn);
    (fastify as any).versionMigrations = migrations;
  });

  // Add version info endpoint
  fastify.get('/api/versions', async (request, reply) => {
    return reply.send({
      current: request.apiVersion,
      default: defaultVersion,
      supported: versions,
      deprecated: deprecatedVersions,
      migrations: getMigrationPaths()
    });
  });

  logger.info('API versioning plugin initialized', {
    defaultVersion,
    supportedVersions: versions,
    deprecatedVersions,
    strictMode: enableStrictMode
  });
}

/**
 * Get deprecation date for a version
 */
function getDeprecationDate(version: string): string {
  // This should be configured based on your deprecation policy
  const deprecationDates: Record<string, string> = {
    'v1': '2024-06-01T00:00:00Z'
  };
  
  return deprecationDates[version] || new Date().toISOString();
}

/**
 * Get sunset date for a version
 */
function getSunsetDate(version: string): string {
  // This should be configured based on your sunset policy
  const sunsetDates: Record<string, string> = {
    'v1': '2024-12-01T00:00:00Z'
  };
  
  return sunsetDates[version] || new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString();
}

/**
 * Get version-specific URL
 */
function getVersionUrl(request: FastifyRequest, version: string): string {
  const protocol = request.protocol;
  const host = request.hostname;
  const port = (request.socket as any).localPort;
  const baseUrl = `${protocol}://${host}${port !== 80 && port !== 443 ? `:${port}` : ''}`;
  
  return `${baseUrl}/api/${version}${request.url}`;
}

/**
 * Get available migration paths
 */
function getMigrationPaths(): string[] {
  // This would be populated based on registered migrations
  return [
    'v1->v2',
    'v2->v3'
  ];
}

// Extend FastifyInstance interface
declare module 'fastify' {
  interface FastifyInstance {
    routeVersion: (
      versions: string | string[],
      routeOptions: any
    ) => void;
    registerVersionedRoutes: (
      version: string,
      routes: (fastify: FastifyInstance) => void
    ) => void;
    addVersionMigration: (
      fromVersion: string,
      toVersion: string,
      migrationFn: (request: FastifyRequest) => void
    ) => void;
  }
}

export default fp(apiVersioningPlugin, {
  fastify: '4.x',
  name: 'api-versioning'
});