// Role-Based Access Control (RBAC) System for Zoptal Platform
import { User } from './authentication';
import { analytics } from '@/lib/analytics/tracker';

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  conditions?: PermissionCondition[];
}

export interface PermissionCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystemRole: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AccessRequest {
  user: User;
  resource: string;
  action: string;
  context?: Record<string, any>;
}

export interface AccessResult {
  granted: boolean;
  reason?: string;
  requiredPermissions?: string[];
  suggestedActions?: string[];
}

export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId?: string;
  result: 'granted' | 'denied';
  reason?: string;
  ip: string;
  userAgent: string;
  timestamp: string;
  context?: Record<string, any>;
}

export class AuthorizationService {
  private static instance: AuthorizationService;
  private roles: Map<string, Role> = new Map();
  private permissions: Map<string, Permission> = new Map();
  private userRoles: Map<string, string[]> = new Map(); // userId -> roleIds
  private auditLogs: AuditLog[] = [];

  static getInstance(): AuthorizationService {
    if (!AuthorizationService.instance) {
      AuthorizationService.instance = new AuthorizationService();
    }
    return AuthorizationService.instance;
  }

  private constructor() {
    this.initializeDefaultRolesAndPermissions();
  }

  /**
   * Check if user has permission to perform an action on a resource
   */
  async hasPermission(request: AccessRequest): Promise<AccessResult> {
    try {
      const userRoles = this.getUserRoles(request.user.id);
      const userPermissions = this.getUserPermissions(userRoles);

      // Check if user has the required permission
      const hasRequiredPermission = userPermissions.some(permission => 
        this.matchesPermission(permission, request.resource, request.action, request.context)
      );

      const result: AccessResult = {
        granted: hasRequiredPermission,
        reason: hasRequiredPermission ? 'Permission granted' : 'Insufficient permissions',
        requiredPermissions: hasRequiredPermission ? [] : [`${request.resource}:${request.action}`]
      };

      // Log access attempt
      await this.logAccess({
        userId: request.user.id,
        userEmail: request.user.email,
        action: request.action,
        resource: request.resource,
        result: result.granted ? 'granted' : 'denied',
        reason: result.reason,
        ip: this.getClientIP(),
        userAgent: this.getUserAgent(),
        timestamp: new Date().toISOString(),
        context: request.context
      });

      // Track analytics
      analytics.track({
        name: 'permission_check',
        category: 'authorization',
        properties: {
          user_id: request.user.id,
          resource: request.resource,
          action: request.action,
          granted: result.granted,
          user_role: request.user.role
        }
      });

      return result;
    } catch (error) {
      console.error('Permission check failed:', error);
      
      const result: AccessResult = {
        granted: false,
        reason: 'Permission check failed',
        suggestedActions: ['Contact administrator']
      };

      analytics.track({
        name: 'permission_check_error',
        category: 'authorization',
        properties: {
          user_id: request.user.id,
          resource: request.resource,
          action: request.action,
          error: error.message
        }
      });

      return result;
    }
  }

  /**
   * Check multiple permissions at once
   */
  async hasPermissions(
    user: User, 
    checks: Array<{ resource: string; action: string; context?: Record<string, any> }>
  ): Promise<Record<string, AccessResult>> {
    const results: Record<string, AccessResult> = {};

    for (const check of checks) {
      const key = `${check.resource}:${check.action}`;
      results[key] = await this.hasPermission({
        user,
        resource: check.resource,
        action: check.action,
        context: check.context
      });
    }

    return results;
  }

  /**
   * Get user's effective permissions
   */
  getUserPermissions(roleIds: string[]): Permission[] {
    const permissions: Permission[] = [];
    const seenPermissions = new Set<string>();

    for (const roleId of roleIds) {
      const role = this.roles.get(roleId);
      if (role) {
        for (const permission of role.permissions) {
          if (!seenPermissions.has(permission.id)) {
            permissions.push(permission);
            seenPermissions.add(permission.id);
          }
        }
      }
    }

    return permissions;
  }

  /**
   * Get user's roles
   */
  getUserRoles(userId: string): string[] {
    return this.userRoles.get(userId) || [];
  }

  /**
   * Assign role to user
   */
  async assignRole(userId: string, roleId: string, assignedBy: string): Promise<void> {
    try {
      const role = this.roles.get(roleId);
      if (!role) {
        throw new Error(`Role ${roleId} not found`);
      }

      const currentRoles = this.getUserRoles(userId);
      if (!currentRoles.includes(roleId)) {
        const updatedRoles = [...currentRoles, roleId];
        this.userRoles.set(userId, updatedRoles);

        // In production, this would persist to database
        await this.persistUserRoles(userId, updatedRoles);

        // Log the assignment
        await this.logAccess({
          userId: assignedBy,
          userEmail: '', // Would get from user service
          action: 'assign_role',
          resource: 'user_roles',
          resourceId: userId,
          result: 'granted',
          reason: `Assigned role ${role.name}`,
          ip: this.getClientIP(),
          userAgent: this.getUserAgent(),
          timestamp: new Date().toISOString(),
          context: { roleId, roleName: role.name }
        });

        analytics.track({
          name: 'role_assigned',
          category: 'authorization',
          properties: {
            user_id: userId,
            role_id: roleId,
            role_name: role.name,
            assigned_by: assignedBy
          }
        });
      }
    } catch (error) {
      console.error('Failed to assign role:', error);
      throw error;
    }
  }

  /**
   * Remove role from user
   */
  async removeRole(userId: string, roleId: string, removedBy: string): Promise<void> {
    try {
      const role = this.roles.get(roleId);
      if (!role) {
        throw new Error(`Role ${roleId} not found`);
      }

      const currentRoles = this.getUserRoles(userId);
      const updatedRoles = currentRoles.filter(r => r !== roleId);
      
      if (updatedRoles.length !== currentRoles.length) {
        this.userRoles.set(userId, updatedRoles);

        // In production, this would persist to database
        await this.persistUserRoles(userId, updatedRoles);

        // Log the removal
        await this.logAccess({
          userId: removedBy,
          userEmail: '', // Would get from user service
          action: 'remove_role',
          resource: 'user_roles',
          resourceId: userId,
          result: 'granted',
          reason: `Removed role ${role.name}`,
          ip: this.getClientIP(),
          userAgent: this.getUserAgent(),
          timestamp: new Date().toISOString(),
          context: { roleId, roleName: role.name }
        });

        analytics.track({
          name: 'role_removed',
          category: 'authorization',
          properties: {
            user_id: userId,
            role_id: roleId,
            role_name: role.name,
            removed_by: removedBy
          }
        });
      }
    } catch (error) {
      console.error('Failed to remove role:', error);
      throw error;
    }
  }

  /**
   * Create custom role
   */
  async createRole(roleData: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>, createdBy: string): Promise<Role> {
    try {
      const role: Role = {
        ...roleData,
        id: `role_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.roles.set(role.id, role);

      // In production, this would persist to database
      await this.persistRole(role);

      analytics.track({
        name: 'role_created',
        category: 'authorization',
        properties: {
          role_id: role.id,
          role_name: role.name,
          permission_count: role.permissions.length,
          created_by: createdBy
        }
      });

      return role;
    } catch (error) {
      console.error('Failed to create role:', error);
      throw error;
    }
  }

  /**
   * Update role
   */
  async updateRole(roleId: string, updates: Partial<Role>, updatedBy: string): Promise<Role> {
    try {
      const existingRole = this.roles.get(roleId);
      if (!existingRole) {
        throw new Error(`Role ${roleId} not found`);
      }

      if (existingRole.isSystemRole) {
        throw new Error('System roles cannot be modified');
      }

      const updatedRole: Role = {
        ...existingRole,
        ...updates,
        id: roleId, // Ensure ID doesn't change
        updatedAt: new Date().toISOString()
      };

      this.roles.set(roleId, updatedRole);

      // In production, this would persist to database
      await this.persistRole(updatedRole);

      analytics.track({
        name: 'role_updated',
        category: 'authorization',
        properties: {
          role_id: roleId,
          role_name: updatedRole.name,
          updated_by: updatedBy
        }
      });

      return updatedRole;
    } catch (error) {
      console.error('Failed to update role:', error);
      throw error;
    }
  }

  /**
   * Delete role
   */
  async deleteRole(roleId: string, deletedBy: string): Promise<void> {
    try {
      const role = this.roles.get(roleId);
      if (!role) {
        throw new Error(`Role ${roleId} not found`);
      }

      if (role.isSystemRole) {
        throw new Error('System roles cannot be deleted');
      }

      // Remove role from all users
      for (const [userId, userRoles] of this.userRoles.entries()) {
        const updatedRoles = userRoles.filter(r => r !== roleId);
        if (updatedRoles.length !== userRoles.length) {
          this.userRoles.set(userId, updatedRoles);
          await this.persistUserRoles(userId, updatedRoles);
        }
      }

      // Delete the role
      this.roles.delete(roleId);

      // In production, this would persist to database
      await this.deletePersistedRole(roleId);

      analytics.track({
        name: 'role_deleted',
        category: 'authorization',
        properties: {
          role_id: roleId,
          role_name: role.name,
          deleted_by: deletedBy
        }
      });
    } catch (error) {
      console.error('Failed to delete role:', error);
      throw error;
    }
  }

  /**
   * Get all roles
   */
  getAllRoles(): Role[] {
    return Array.from(this.roles.values());
  }

  /**
   * Get role by ID
   */
  getRole(roleId: string): Role | undefined {
    return this.roles.get(roleId);
  }

  /**
   * Get audit logs
   */
  getAuditLogs(filters?: {
    userId?: string;
    resource?: string;
    action?: string;
    result?: 'granted' | 'denied';
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): AuditLog[] {
    let logs = [...this.auditLogs];

    if (filters) {
      if (filters.userId) {
        logs = logs.filter(log => log.userId === filters.userId);
      }
      if (filters.resource) {
        logs = logs.filter(log => log.resource === filters.resource);
      }
      if (filters.action) {
        logs = logs.filter(log => log.action === filters.action);
      }
      if (filters.result) {
        logs = logs.filter(log => log.result === filters.result);
      }
      if (filters.startDate) {
        logs = logs.filter(log => log.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        logs = logs.filter(log => log.timestamp <= filters.endDate!);
      }
    }

    // Sort by timestamp (newest first)
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Apply limit
    if (filters?.limit) {
      logs = logs.slice(0, filters.limit);
    }

    return logs;
  }

  /**
   * Check if user can access admin features
   */
  async canAccessAdmin(user: User): Promise<boolean> {
    const result = await this.hasPermission({
      user,
      resource: 'admin',
      action: 'access'
    });
    return result.granted;
  }

  /**
   * Check if user can manage other users
   */
  async canManageUsers(user: User): Promise<boolean> {
    const result = await this.hasPermission({
      user,
      resource: 'users',
      action: 'manage'
    });
    return result.granted;
  }

  /**
   * Check if user can view analytics
   */
  async canViewAnalytics(user: User): Promise<boolean> {
    const result = await this.hasPermission({
      user,
      resource: 'analytics',
      action: 'view'
    });
    return result.granted;
  }

  /**
   * Private helper methods
   */
  private matchesPermission(
    permission: Permission, 
    resource: string, 
    action: string, 
    context?: Record<string, any>
  ): boolean {
    // Check resource and action match
    const resourceMatch = permission.resource === '*' || permission.resource === resource;
    const actionMatch = permission.action === '*' || permission.action === action;

    if (!resourceMatch || !actionMatch) {
      return false;
    }

    // Check conditions if present
    if (permission.conditions && context) {
      return permission.conditions.every(condition => 
        this.evaluateCondition(condition, context)
      );
    }

    return true;
  }

  private evaluateCondition(condition: PermissionCondition, context: Record<string, any>): boolean {
    const fieldValue = context[condition.field];
    
    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;
      case 'not_equals':
        return fieldValue !== condition.value;
      case 'contains':
        return Array.isArray(fieldValue) ? fieldValue.includes(condition.value) : 
               String(fieldValue).includes(String(condition.value));
      case 'greater_than':
        return fieldValue > condition.value;
      case 'less_than':
        return fieldValue < condition.value;
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(fieldValue);
      case 'not_in':
        return Array.isArray(condition.value) && !condition.value.includes(fieldValue);
      default:
        return false;
    }
  }

  private async logAccess(log: Omit<AuditLog, 'id'>): Promise<void> {
    const auditLog: AuditLog = {
      ...log,
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    this.auditLogs.push(auditLog);

    // Keep only last 10000 logs in memory
    if (this.auditLogs.length > 10000) {
      this.auditLogs = this.auditLogs.slice(-10000);
    }

    // In production, this would persist to database/logging service
    await this.persistAuditLog(auditLog);
  }

  private initializeDefaultRolesAndPermissions(): void {
    // Define permissions
    const permissions: Permission[] = [
      // Admin permissions
      { id: 'admin:access', name: 'Access Admin Panel', description: 'Access to admin panel', resource: 'admin', action: 'access' },
      { id: 'admin:manage', name: 'Manage Admin Settings', description: 'Manage admin settings', resource: 'admin', action: 'manage' },
      
      // User management permissions
      { id: 'users:view', name: 'View Users', description: 'View user list and details', resource: 'users', action: 'view' },
      { id: 'users:create', name: 'Create Users', description: 'Create new users', resource: 'users', action: 'create' },
      { id: 'users:edit', name: 'Edit Users', description: 'Edit user details', resource: 'users', action: 'edit' },
      { id: 'users:delete', name: 'Delete Users', description: 'Delete users', resource: 'users', action: 'delete' },
      { id: 'users:manage', name: 'Manage Users', description: 'Full user management', resource: 'users', action: 'manage' },
      
      // Project permissions
      { id: 'projects:view', name: 'View Projects', description: 'View project list and details', resource: 'projects', action: 'view' },
      { id: 'projects:create', name: 'Create Projects', description: 'Create new projects', resource: 'projects', action: 'create' },
      { id: 'projects:edit', name: 'Edit Projects', description: 'Edit project details', resource: 'projects', action: 'edit' },
      { id: 'projects:delete', name: 'Delete Projects', description: 'Delete projects', resource: 'projects', action: 'delete' },
      { id: 'projects:manage', name: 'Manage Projects', description: 'Full project management', resource: 'projects', action: 'manage' },
      
      // Analytics permissions
      { id: 'analytics:view', name: 'View Analytics', description: 'View analytics dashboards', resource: 'analytics', action: 'view' },
      { id: 'analytics:export', name: 'Export Analytics', description: 'Export analytics data', resource: 'analytics', action: 'export' },
      
      // Content permissions
      { id: 'content:view', name: 'View Content', description: 'View content', resource: 'content', action: 'view' },
      { id: 'content:create', name: 'Create Content', description: 'Create content', resource: 'content', action: 'create' },
      { id: 'content:edit', name: 'Edit Content', description: 'Edit content', resource: 'content', action: 'edit' },
      { id: 'content:publish', name: 'Publish Content', description: 'Publish content', resource: 'content', action: 'publish' },
      
      // Settings permissions
      { id: 'settings:view', name: 'View Settings', description: 'View system settings', resource: 'settings', action: 'view' },
      { id: 'settings:edit', name: 'Edit Settings', description: 'Edit system settings', resource: 'settings', action: 'edit' }
    ];

    // Store permissions
    permissions.forEach(permission => {
      this.permissions.set(permission.id, permission);
    });

    // Define roles
    const roles: Role[] = [
      // Super Admin - Full access
      {
        id: 'super_admin',
        name: 'Super Administrator',
        description: 'Full system access with all permissions',
        permissions: permissions,
        isSystemRole: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      
      // Admin - Most permissions
      {
        id: 'admin',
        name: 'Administrator',
        description: 'Administrative access with user and content management',
        permissions: permissions.filter(p => 
          !p.id.includes('admin:manage') && !p.id.includes('settings:edit')
        ),
        isSystemRole: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      
      // Developer - Project and content focused
      {
        id: 'developer',
        name: 'Developer',
        description: 'Access to projects and development features',
        permissions: permissions.filter(p => 
          p.resource === 'projects' || 
          p.resource === 'content' || 
          (p.resource === 'analytics' && p.action === 'view')
        ),
        isSystemRole: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      
      // Client - Limited access
      {
        id: 'client',
        name: 'Client',
        description: 'Client access to their projects and content',
        permissions: permissions.filter(p => 
          (p.resource === 'projects' && ['view', 'create'].includes(p.action)) ||
          (p.resource === 'content' && p.action === 'view')
        ),
        isSystemRole: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      
      // User - Basic access
      {
        id: 'user',
        name: 'User',
        description: 'Basic user access',
        permissions: permissions.filter(p => 
          p.action === 'view' && ['content', 'projects'].includes(p.resource)
        ),
        isSystemRole: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // Store roles
    roles.forEach(role => {
      this.roles.set(role.id, role);
    });

    // Initialize some default user role assignments (in production, this would come from database)
    // This is just for demonstration
    this.userRoles.set('admin_user_1', ['super_admin']);
    this.userRoles.set('admin_user_2', ['admin']);
    this.userRoles.set('dev_user_1', ['developer']);
    this.userRoles.set('client_user_1', ['client']);
  }

  private getClientIP(): string {
    // In a real application, this would be extracted from request headers
    return '127.0.0.1';
  }

  private getUserAgent(): string {
    if (typeof window !== 'undefined') {
      return navigator.userAgent;
    }
    return 'Server';
  }

  private async persistUserRoles(userId: string, roleIds: string[]): Promise<void> {
    // In production, this would persist to database
    console.info(`Persisting user roles for ${userId}:`, roleIds);
  }

  private async persistRole(role: Role): Promise<void> {
    // In production, this would persist to database
    console.info('Persisting role:', role);
  }

  private async deletePersistedRole(roleId: string): Promise<void> {
    // In production, this would delete from database
    console.info('Deleting role:', roleId);
  }

  private async persistAuditLog(log: AuditLog): Promise<void> {
    // In production, this would persist to logging service/database
    console.info('Audit log:', log);
  }
}

// Export singleton instance
export const authorization = AuthorizationService.getInstance();

// React hook for authorization
export function useAuthorization(user: User | null) {
  const checkPermission = async (resource: string, action: string, context?: Record<string, any>) => {
    if (!user) return { granted: false, reason: 'User not authenticated' };
    
    return await authorization.hasPermission({
      user,
      resource,
      action,
      context
    });
  };

  const checkPermissions = async (checks: Array<{ resource: string; action: string; context?: Record<string, any> }>) => {
    if (!user) {
      const results: Record<string, AccessResult> = {};
      checks.forEach(check => {
        results[`${check.resource}:${check.action}`] = { granted: false, reason: 'User not authenticated' };
      });
      return results;
    }
    
    return await authorization.hasPermissions(user, checks);
  };

  const canAccessAdmin = async () => {
    if (!user) return false;
    return await authorization.canAccessAdmin(user);
  };

  const canManageUsers = async () => {
    if (!user) return false;
    return await authorization.canManageUsers(user);
  };

  const canViewAnalytics = async () => {
    if (!user) return false;
    return await authorization.canViewAnalytics(user);
  };

  const getUserRoles = () => {
    if (!user) return [];
    return authorization.getUserRoles(user.id);
  };

  const getUserPermissions = () => {
    if (!user) return [];
    const roleIds = authorization.getUserRoles(user.id);
    return authorization.getUserPermissions(roleIds);
  };

  return {
    checkPermission,
    checkPermissions,
    canAccessAdmin,
    canManageUsers,
    canViewAnalytics,
    getUserRoles,
    getUserPermissions
  };
}

// Higher-order component for protected routes
export function withAuthorization<T extends {}>(
  WrappedComponent: React.ComponentType<T>,
  requiredPermissions: Array<{ resource: string; action: string }>
) {
  return function AuthorizedComponent(props: T) {
    const [hasAccess, setHasAccess] = useState<boolean | null>(null);
    const user = null; // Would come from auth context

    useEffect(() => {
      if (!user) {
        setHasAccess(false);
        return;
      }

      const checkAccess = async () => {
        const results = await authorization.hasPermissions(user, requiredPermissions);
        const allGranted = Object.values(results).every(result => result.granted);
        setHasAccess(allGranted);
      };

      checkAccess();
    }, [user]);

    if (hasAccess === null) {
      return <div>Loading...</div>;
    }

    if (!hasAccess) {
      return <div>Access denied. You don't have permission to view this page.</div>;
    }

    return <WrappedComponent {...props} />;
  };
}