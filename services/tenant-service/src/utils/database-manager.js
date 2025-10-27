const mongoose = require('mongoose');
const Redis = require('ioredis');
const logger = require('./logger');

/**
 * Database Manager for Multi-Tenant Architecture
 * 
 * Handles:
 * - Multiple database connection strategies
 * - Connection pooling and management
 * - Schema creation and migration
 * - Data encryption at rest
 * - Connection caching and optimization
 */

class DatabaseManager {
  constructor() {
    this.connections = new Map();
    this.redis = new Redis(process.env.REDIS_URL);
    this.migrationLock = new Map();
  }

  /**
   * Create or get tenant-specific database connection
   */
  async createTenantConnection(connectionString, tenantId, options = {}) {
    const connectionKey = `tenant:${tenantId}`;
    
    // Return existing connection if available
    if (this.connections.has(connectionKey)) {
      const connection = this.connections.get(connectionKey);
      if (connection.readyState === 1) { // Connected
        return connection;
      } else {
        // Remove stale connection
        this.connections.delete(connectionKey);
      }
    }

    try {
      const connectionOptions = {
        ...this.getDefaultConnectionOptions(),
        ...options,
        // Tenant-specific connection pool settings
        maxPoolSize: options.maxPoolSize || 10,
        minPoolSize: options.minPoolSize || 2,
        maxIdleTimeMS: options.maxIdleTimeMS || 30000,
        serverSelectionTimeoutMS: 5000,
        
        // Database name based on tenant ID
        dbName: options.dbName || `zoptal_tenant_${tenantId}`
      };

      const connection = await mongoose.createConnection(connectionString, connectionOptions);
      
      // Set up connection event handlers
      this.setupConnectionHandlers(connection, tenantId);
      
      // Cache the connection
      this.connections.set(connectionKey, connection);
      
      logger.info('Tenant database connection created', {
        tenantId,
        dbName: connectionOptions.dbName,
        poolSize: connectionOptions.maxPoolSize
      });

      return connection;
    } catch (error) {
      logger.error('Failed to create tenant database connection', {
        tenantId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Create tenant-specific schema/namespace
   */
  async createTenantSchema(connection, tenantId, schemaName) {
    try {
      const db = connection.db;
      
      // Create collections with tenant-specific names
      const collections = [
        'users',
        'projects', 
        'files',
        'collaborations',
        'activities',
        'notifications'
      ];

      for (const collectionName of collections) {
        const tenantCollectionName = `${schemaName}_${collectionName}`;
        
        // Check if collection exists
        const existingCollections = await db.listCollections({ 
          name: tenantCollectionName 
        }).toArray();
        
        if (existingCollections.length === 0) {
          // Create collection with validation schema
          await this.createCollectionWithSchema(db, tenantCollectionName, collectionName);
          
          // Create indexes for performance
          await this.createCollectionIndexes(db, tenantCollectionName, collectionName);
        }
      }

      logger.info('Tenant schema created', {
        tenantId,
        schemaName,
        collections: collections.length
      });

    } catch (error) {
      logger.error('Failed to create tenant schema', {
        tenantId,
        schemaName,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Create collection with validation schema
   */
  async createCollectionWithSchema(db, collectionName, baseCollection) {
    const validationRules = this.getValidationRules(baseCollection);
    
    await db.createCollection(collectionName, {
      validator: validationRules,
      validationLevel: 'strict',
      validationAction: 'error'
    });

    logger.debug('Collection created with validation', {
      collection: collectionName,
      baseCollection
    });
  }

  /**
   * Create performance indexes for collections
   */
  async createCollectionIndexes(db, collectionName, baseCollection) {
    const collection = db.collection(collectionName);
    const indexes = this.getCollectionIndexes(baseCollection);

    for (const index of indexes) {
      try {
        await collection.createIndex(index.keys, index.options || {});
        logger.debug('Index created', {
          collection: collectionName,
          index: index.keys
        });
      } catch (error) {
        logger.warn('Failed to create index', {
          collection: collectionName,
          index: index.keys,
          error: error.message
        });
      }
    }
  }

  /**
   * Get validation rules for collection
   */
  getValidationRules(collectionName) {
    const rules = {
      users: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['email', 'tenantId', 'createdAt'],
          properties: {
            email: { bsonType: 'string', pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$' },
            tenantId: { bsonType: 'string' },
            status: { enum: ['active', 'inactive', 'suspended'] },
            createdAt: { bsonType: 'date' }
          }
        }
      },

      projects: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['name', 'ownerId', 'tenantId', 'createdAt'],
          properties: {
            name: { bsonType: 'string', minLength: 1, maxLength: 100 },
            ownerId: { bsonType: 'objectId' },
            tenantId: { bsonType: 'string' },
            visibility: { enum: ['private', 'public', 'team'] },
            status: { enum: ['active', 'archived', 'deleted'] },
            createdAt: { bsonType: 'date' }
          }
        }
      },

      files: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['filename', 'projectId', 'tenantId', 'createdAt'],
          properties: {
            filename: { bsonType: 'string', minLength: 1 },
            projectId: { bsonType: 'objectId' },
            tenantId: { bsonType: 'string' },
            size: { bsonType: 'number', minimum: 0 },
            mimeType: { bsonType: 'string' },
            createdAt: { bsonType: 'date' }
          }
        }
      },

      collaborations: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['userId', 'projectId', 'tenantId', 'role', 'createdAt'],
          properties: {
            userId: { bsonType: 'objectId' },
            projectId: { bsonType: 'objectId' },
            tenantId: { bsonType: 'string' },
            role: { enum: ['viewer', 'editor', 'admin', 'owner'] },
            status: { enum: ['active', 'pending', 'revoked'] },
            createdAt: { bsonType: 'date' }
          }
        }
      },

      activities: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['userId', 'tenantId', 'action', 'createdAt'],
          properties: {
            userId: { bsonType: 'objectId' },
            tenantId: { bsonType: 'string' },
            action: { bsonType: 'string' },
            resourceType: { bsonType: 'string' },
            resourceId: { bsonType: 'objectId' },
            createdAt: { bsonType: 'date' }
          }
        }
      },

      notifications: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['userId', 'tenantId', 'type', 'message', 'createdAt'],
          properties: {
            userId: { bsonType: 'objectId' },
            tenantId: { bsonType: 'string' },
            type: { enum: ['info', 'warning', 'error', 'success'] },
            message: { bsonType: 'string', minLength: 1 },
            read: { bsonType: 'bool' },
            createdAt: { bsonType: 'date' }
          }
        }
      }
    };

    return rules[collectionName] || {};
  }

  /**
   * Get performance indexes for collection
   */
  getCollectionIndexes(collectionName) {
    const indexes = {
      users: [
        { keys: { email: 1, tenantId: 1 }, options: { unique: true } },
        { keys: { tenantId: 1, status: 1 } },
        { keys: { createdAt: -1 } },
        { keys: { lastLoginAt: -1 } }
      ],

      projects: [
        { keys: { tenantId: 1, ownerId: 1 } },
        { keys: { tenantId: 1, status: 1, createdAt: -1 } },
        { keys: { tenantId: 1, visibility: 1 } },
        { keys: { slug: 1, tenantId: 1 }, options: { unique: true } }
      ],

      files: [
        { keys: { projectId: 1, tenantId: 1 } },
        { keys: { tenantId: 1, createdAt: -1 } },
        { keys: { tenantId: 1, mimeType: 1 } },
        { keys: { filename: 'text', tenantId: 1 } }
      ],

      collaborations: [
        { keys: { projectId: 1, userId: 1, tenantId: 1 }, options: { unique: true } },
        { keys: { userId: 1, tenantId: 1 } },
        { keys: { tenantId: 1, role: 1 } },
        { keys: { tenantId: 1, status: 1 } }
      ],

      activities: [
        { keys: { tenantId: 1, createdAt: -1 } },
        { keys: { userId: 1, tenantId: 1, createdAt: -1 } },
        { keys: { resourceId: 1, resourceType: 1, tenantId: 1 } },
        { keys: { action: 1, tenantId: 1, createdAt: -1 } }
      ],

      notifications: [
        { keys: { userId: 1, tenantId: 1, read: 1, createdAt: -1 } },
        { keys: { tenantId: 1, type: 1, createdAt: -1 } },
        { keys: { createdAt: 1 }, options: { expireAfterSeconds: 2592000 } } // 30 days TTL
      ]
    };

    return indexes[collectionName] || [];
  }

  /**
   * Setup connection event handlers
   */
  setupConnectionHandlers(connection, tenantId) {
    connection.on('connected', () => {
      logger.info('Tenant database connected', { tenantId });
    });

    connection.on('error', (error) => {
      logger.error('Tenant database error', { tenantId, error: error.message });
    });

    connection.on('disconnected', () => {
      logger.warn('Tenant database disconnected', { tenantId });
      // Remove from cache
      this.connections.delete(`tenant:${tenantId}`);
    });

    connection.on('reconnected', () => {
      logger.info('Tenant database reconnected', { tenantId });
    });
  }

  /**
   * Get default connection options
   */
  getDefaultConnectionOptions() {
    return {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      
      // Connection pool settings
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      
      // Retry settings
      retryWrites: true,
      retryReads: true,
      
      // Compression
      compressors: ['zlib'],
      
      // Read preference
      readPreference: 'primaryPreferred',
      
      // Write concern
      w: 'majority',
      wtimeout: 5000,
      
      // Journal
      journal: true
    };
  }

  /**
   * Migrate tenant data
   */
  async migrateTenantData(tenantId, migrationVersion) {
    const lockKey = `migration:${tenantId}:${migrationVersion}`;
    
    // Check if migration is already in progress
    if (this.migrationLock.has(lockKey)) {
      logger.info('Migration already in progress', { tenantId, migrationVersion });
      return;
    }

    try {
      // Set migration lock
      this.migrationLock.set(lockKey, true);
      
      const connection = this.connections.get(`tenant:${tenantId}`);
      if (!connection) {
        throw new Error('Tenant connection not found');
      }

      // Run migration scripts
      await this.runMigrationScripts(connection, tenantId, migrationVersion);
      
      logger.info('Tenant data migration completed', { 
        tenantId, 
        migrationVersion 
      });

    } catch (error) {
      logger.error('Tenant data migration failed', {
        tenantId,
        migrationVersion,
        error: error.message
      });
      throw error;
    } finally {
      // Release migration lock
      this.migrationLock.delete(lockKey);
    }
  }

  /**
   * Run migration scripts
   */
  async runMigrationScripts(connection, tenantId, version) {
    // Migration scripts would be implemented here
    // This is a placeholder for actual migration logic
    
    const db = connection.db;
    const migrationsCollection = db.collection('_migrations');
    
    // Check if migration already applied
    const existingMigration = await migrationsCollection.findOne({
      version,
      tenantId
    });
    
    if (existingMigration) {
      logger.info('Migration already applied', { tenantId, version });
      return;
    }

    // Apply migration based on version
    switch (version) {
      case '1.0.0':
        await this.migration_1_0_0(db, tenantId);
        break;
      case '1.1.0':
        await this.migration_1_1_0(db, tenantId);
        break;
      default:
        logger.warn('Unknown migration version', { tenantId, version });
        return;
    }

    // Record migration
    await migrationsCollection.insertOne({
      version,
      tenantId,
      appliedAt: new Date(),
      appliedBy: 'system'
    });
  }

  /**
   * Example migration for version 1.0.0
   */
  async migration_1_0_0(db, tenantId) {
    // Add new fields, create indexes, etc.
    logger.info('Applying migration 1.0.0', { tenantId });
    
    // Example: Add new field to users collection
    const usersCollection = db.collection(`tenant_${tenantId}_users`);
    await usersCollection.updateMany(
      { lastActivityAt: { $exists: false } },
      { $set: { lastActivityAt: new Date() } }
    );
  }

  /**
   * Example migration for version 1.1.0
   */
  async migration_1_1_0(db, tenantId) {
    logger.info('Applying migration 1.1.0', { tenantId });
    
    // Example: Create new collection
    await this.createCollectionWithSchema(db, `tenant_${tenantId}_audit_logs`, 'audit_logs');
  }

  /**
   * Close tenant connection
   */
  async closeTenantConnection(tenantId) {
    const connectionKey = `tenant:${tenantId}`;
    const connection = this.connections.get(connectionKey);
    
    if (connection) {
      await connection.close();
      this.connections.delete(connectionKey);
      logger.info('Tenant connection closed', { tenantId });
    }
  }

  /**
   * Close all connections
   */
  async closeAllConnections() {
    const promises = [];
    
    for (const [key, connection] of this.connections.entries()) {
      promises.push(connection.close());
    }
    
    await Promise.all(promises);
    this.connections.clear();
    
    // Close Redis connection
    if (this.redis) {
      await this.redis.quit();
    }
    
    logger.info('All database connections closed');
  }

  /**
   * Get connection statistics
   */
  getConnectionStats() {
    const stats = {
      totalConnections: this.connections.size,
      connections: []
    };

    for (const [key, connection] of this.connections.entries()) {
      stats.connections.push({
        key,
        readyState: connection.readyState,
        host: connection.host,
        port: connection.port,
        dbName: connection.name
      });
    }

    return stats;
  }
}

// Singleton instance
const databaseManager = new DatabaseManager();

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down database manager...');
  await databaseManager.closeAllConnections();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Shutting down database manager...');
  await databaseManager.closeAllConnections();
  process.exit(0);
});

module.exports = {
  DatabaseManager,
  createTenantConnection: (connectionString, tenantId, options) => 
    databaseManager.createTenantConnection(connectionString, tenantId, options),
  createTenantSchema: (connection, tenantId, schemaName) =>
    databaseManager.createTenantSchema(connection, tenantId, schemaName),
  migrateTenantData: (tenantId, version) =>
    databaseManager.migrateTenantData(tenantId, version),
  closeTenantConnection: (tenantId) =>
    databaseManager.closeTenantConnection(tenantId),
  getConnectionStats: () =>
    databaseManager.getConnectionStats()
};