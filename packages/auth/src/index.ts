// Client-side exports
export { AuthClient } from './client';
export { AuthProvider, useAuth } from './context';
export { 
  ProtectedRoute, 
  withAuth, 
  AuthLoading, 
  AuthGuard, 
  RoleGuard, 
  PermissionGuard, 
  UserProfile, 
  LoginStatus 
} from './components';

// Server-side exports
export {
  createAuthMiddleware,
  getServerAuthUser,
  requireAuth,
  requireRole,
  requirePermission,
  withAuth as withAuthAPI,
  withRole as withRoleAPI,
  withPermission as withPermissionAPI,
} from './middleware';

// Types
export type {
  AuthUser,
  AuthState,
  LoginCredentials,
  RegisterData,
  AuthTokens,
  AuthConfig,
  AuthResponse,
  OAuthProvider,
  TwoFactorSetup,
  TwoFactorStatus,
  SessionInfo,
  AuthEvent,
  AuthEventListener,
  ProtectedRouteOptions,
  AuthContextType,
} from './types';