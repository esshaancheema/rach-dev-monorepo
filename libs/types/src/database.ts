import { ID, Timestamp } from './common';

/**
 * Base entity interface for database records
 */
export interface BaseEntity {
  id: ID;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Soft deletable entity
 */
export interface SoftDeletableEntity extends BaseEntity {
  deletedAt?: Timestamp;
}

/**
 * Database connection configuration
 */
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
  maxConnections?: number;
}

/**
 * Query filters for database operations
 */
export interface QueryFilters {
  where?: Record<string, any>;
  orderBy?: Record<string, 'asc' | 'desc'>;
  limit?: number;
  offset?: number;
  include?: string[];
}

/**
 * Database transaction options
 */
export interface TransactionOptions {
  isolation?: 'READ_UNCOMMITTED' | 'READ_COMMITTED' | 'REPEATABLE_READ' | 'SERIALIZABLE';
  timeout?: number;
}

/**
 * Migration interface
 */
export interface Migration {
  id: string;
  name: string;
  up: () => Promise<void>;
  down: () => Promise<void>;
  executedAt?: Timestamp;
}