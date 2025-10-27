/**
 * Base ID type used across the platform
 */
export type ID = string;

/**
 * Timestamp type for consistent date handling
 */
export type Timestamp = string;

/**
 * Generic pagination parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Generic paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Environment types
 */
export type Environment = 'development' | 'staging' | 'production';

/**
 * Status types
 */
export type Status = 'active' | 'inactive' | 'pending' | 'suspended';

/**
 * Generic error response
 */
export interface ErrorResponse {
  message: string;
  code?: string;
  details?: any;
  timestamp: Timestamp;
}

/**
 * Generic success response
 */
export interface SuccessResponse<T = any> {
  data: T;
  message?: string;
  timestamp: Timestamp;
}