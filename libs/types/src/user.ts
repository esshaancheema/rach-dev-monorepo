import { ID, Timestamp, Status } from './common';

/**
 * User role types
 */
export type UserRole = 'admin' | 'user' | 'moderator';

/**
 * User base interface
 */
export interface User {
  id: ID;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: Status;
  avatar?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt?: Timestamp;
}

/**
 * User profile for public display
 */
export interface UserProfile {
  id: ID;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: UserRole;
}

/**
 * User registration data
 */
export interface UserRegistration {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

/**
 * User login data
 */
export interface UserLogin {
  email: string;
  password: string;
}

/**
 * User update data
 */
export interface UserUpdate {
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

/**
 * Authentication token response
 */
export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

/**
 * Authenticated user data
 */
export interface AuthenticatedUser extends User {
  token: AuthToken;
}