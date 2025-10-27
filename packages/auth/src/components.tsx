'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from './context';
import type { ProtectedRouteOptions } from './types';

// Protected Route Component
export function ProtectedRoute({ 
  children, 
  roles, 
  permissions, 
  redirectTo = '/login',
  fallback: Fallback 
}: {
  children: React.ReactNode;
} & ProtectedRouteOptions) {
  const { user, isAuthenticated, isLoading, hasRole, hasPermission, hasAnyRole } = useAuth();

  // Show loading state
  if (isLoading) {
    return Fallback ? <Fallback /> : <div>Loading...</div>;
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    if (typeof window !== 'undefined') {
      window.location.href = redirectTo;
    }
    return null;
  }

  // Check role-based access
  if (roles && (!user || !hasAnyRole(roles))) {
    return Fallback ? <Fallback /> : <div>Access denied. Insufficient permissions.</div>;
  }

  // Check permission-based access
  if (permissions && permissions.some(permission => !hasPermission(permission))) {
    return Fallback ? <Fallback /> : <div>Access denied. Insufficient permissions.</div>;
  }

  return <>{children}</>;
}

// HOC for protected components
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: ProtectedRouteOptions = {}
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

// Loading component for auth state
export function AuthLoading({ children }: { children?: React.ReactNode }) {
  const { isLoading } = useAuth();

  if (isLoading) {
    return children ? <>{children}</> : <div>Loading...</div>;
  }

  return null;
}

// Conditional rendering based on auth state
export function AuthGuard({ 
  authenticated, 
  unauthenticated, 
  loading 
}: {
  authenticated?: React.ReactNode;
  unauthenticated?: React.ReactNode;
  loading?: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <>{loading}</>;
  }

  if (isAuthenticated) {
    return <>{authenticated}</>;
  }

  return <>{unauthenticated}</>;
}

// Role-based conditional rendering
export function RoleGuard({
  roles,
  children,
  fallback
}: {
  roles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { hasAnyRole } = useAuth();

  if (hasAnyRole(roles)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}

// Permission-based conditional rendering
export function PermissionGuard({
  permissions,
  children,
  fallback,
  requireAll = false
}: {
  permissions: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAll?: boolean;
}) {
  const { hasPermission } = useAuth();

  const hasAccess = requireAll
    ? permissions.every(permission => hasPermission(permission))
    : permissions.some(permission => hasPermission(permission));

  if (hasAccess) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}

// User info display component
export function UserProfile({ 
  showEmail = true,
  showRole = false,
  showAvatar = true,
  className = ''
}: {
  showEmail?: boolean;
  showRole?: boolean;
  showAvatar?: boolean;
  className?: string;
}) {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className={`user-profile ${className}`}>
      {showAvatar && user.avatar && (
        <img 
          src={user.avatar} 
          alt={`${user.firstName} ${user.lastName}`}
          className="user-avatar"
        />
      )}
      <div className="user-info">
        <div className="user-name">
          {user.firstName} {user.lastName}
        </div>
        {showEmail && (
          <div className="user-email">{user.email}</div>
        )}
        {showRole && (
          <div className="user-role">{user.role}</div>
        )}
      </div>
    </div>
  );
}

// Login status indicator
export function LoginStatus() {
  const { isAuthenticated, user, logout } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="login-status">
        <span>Not logged in</span>
      </div>
    );
  }

  return (
    <div className="login-status">
      <span>Logged in as {user?.firstName} {user?.lastName}</span>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
}