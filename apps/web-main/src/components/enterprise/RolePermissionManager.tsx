'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheckIcon,
  UserGroupIcon,
  KeyIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  LockClosedIcon,
  UnlockOpenIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import {
  Permission,
  ResourceType,
  ActionType,
  TeamRole,
  TeamMember,
  TeamManagementService
} from '@/lib/enterprise/team-management';

interface RolePermissionManagerProps {
  teamId: string;
  organizationId: string;
  currentUserId: string;
  onPermissionsUpdate?: (userId: string, permissions: Permission[]) => void;
  className?: string;
}

interface PermissionMatrix {
  [key: string]: {
    [resource in ResourceType]: ActionType[];
  };
}

interface CustomRole {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isCustom: boolean;
  memberCount: number;
}

export default function RolePermissionManager({
  teamId,
  organizationId,
  currentUserId,
  onPermissionsUpdate,
  className
}: RolePermissionManagerProps) {
  const [teamService] = useState(() => new TeamManagementService());
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [permissionMatrix, setPermissionMatrix] = useState<PermissionMatrix>({});
  const [customRoles, setCustomRoles] = useState<CustomRole[]>([]);
  const [showRoleEditor, setShowRoleEditor] = useState(false);
  const [editingRole, setEditingRole] = useState<CustomRole | null>(null);
  const [activeTab, setActiveTab] = useState<'members' | 'roles' | 'permissions'>('members');

  const resources: { id: ResourceType; label: string; description: string }[] = [
    { id: 'projects', label: 'Projects', description: 'Manage project creation, editing, and deletion' },
    { id: 'deployments', label: 'Deployments', description: 'Handle application deployments and releases' },
    { id: 'members', label: 'Team Members', description: 'Invite and manage team members' },
    { id: 'settings', label: 'Team Settings', description: 'Configure team settings and preferences' },
    { id: 'billing', label: 'Billing', description: 'Access billing information and subscription' },
    { id: 'analytics', label: 'Analytics', description: 'View team and project analytics' },
    { id: 'templates', label: 'Templates', description: 'Create and manage project templates' },
    { id: 'code_review', label: 'Code Review', description: 'Participate in code review processes' },
    { id: 'ai_features', label: 'AI Features', description: 'Access and configure AI capabilities' }
  ];

  const actions: { id: ActionType; label: string; color: string }[] = [
    { id: 'create', label: 'Create', color: 'text-green-600 bg-green-100' },
    { id: 'read', label: 'View', color: 'text-blue-600 bg-blue-100' },
    { id: 'update', label: 'Edit', color: 'text-yellow-600 bg-yellow-100' },
    { id: 'delete', label: 'Delete', color: 'text-red-600 bg-red-100' },
    { id: 'approve', label: 'Approve', color: 'text-purple-600 bg-purple-100' },
    { id: 'deploy', label: 'Deploy', color: 'text-indigo-600 bg-indigo-100' },
    { id: 'invite', label: 'Invite', color: 'text-pink-600 bg-pink-100' }
  ];

  const predefinedRoles: CustomRole[] = [
    {
      id: 'owner',
      name: 'Owner',
      description: 'Full access to all team resources and settings',
      permissions: resources.flatMap(resource => 
        actions.map(action => ({
          resource: resource.id,
          actions: [action.id],
          scope: 'team' as const
        }))
      ),
      isCustom: false,
      memberCount: 0
    },
    {
      id: 'admin',
      name: 'Admin',
      description: 'Administrative access with most permissions',
      permissions: resources.filter(r => r.id !== 'billing').flatMap(resource => 
        actions.filter(a => a.id !== 'delete').map(action => ({
          resource: resource.id,
          actions: [action.id],
          scope: 'team' as const
        }))
      ),
      isCustom: false,
      memberCount: 0
    },
    {
      id: 'developer',
      name: 'Developer',
      description: 'Development focused permissions for coding and deployment',
      permissions: [
        { resource: 'projects', actions: ['create', 'read', 'update', 'deploy'], scope: 'team' },
        { resource: 'deployments', actions: ['create', 'read', 'deploy'], scope: 'team' },
        { resource: 'code_review', actions: ['create', 'read'], scope: 'team' },
        { resource: 'templates', actions: ['read', 'update'], scope: 'team' },
        { resource: 'ai_features', actions: ['read'], scope: 'team' }
      ],
      isCustom: false,
      memberCount: 0
    },
    {
      id: 'viewer',
      name: 'Viewer',
      description: 'Read-only access to projects and team information',
      permissions: [
        { resource: 'projects', actions: ['read'], scope: 'team' },
        { resource: 'analytics', actions: ['read'], scope: 'team' },
        { resource: 'templates', actions: ['read'], scope: 'team' }
      ],
      isCustom: false,
      memberCount: 0
    }
  ];

  useEffect(() => {
    loadMembers();
    initializePermissionMatrix();
  }, [teamId]);

  const loadMembers = async () => {
    try {
      const teamMembers = await teamService.getTeamMembers(teamId);
      setMembers(teamMembers);

      // Update role member counts
      const roleCounts = teamMembers.reduce((acc, member) => {
        acc[member.role] = (acc[member.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      setCustomRoles(prev => prev.map(role => ({
        ...role,
        memberCount: roleCounts[role.id] || 0
      })));

    } catch (error) {
      console.error('Failed to load team members:', error);
    }
  };

  const initializePermissionMatrix = () => {
    const matrix: PermissionMatrix = {};
    
    predefinedRoles.forEach(role => {
      matrix[role.id] = {} as any;
      resources.forEach(resource => {
        const rolePermissions = role.permissions.filter(p => p.resource === resource.id);
        matrix[role.id][resource.id] = rolePermissions.flatMap(p => p.actions);
      });
    });

    setPermissionMatrix(matrix);
  };

  const hasPermission = (role: string, resource: ResourceType, action: ActionType): boolean => {
    return permissionMatrix[role]?.[resource]?.includes(action) || false;
  };

  const togglePermission = (role: string, resource: ResourceType, action: ActionType) => {
    setPermissionMatrix(prev => {
      const updated = { ...prev };
      if (!updated[role]) updated[role] = {} as any;
      if (!updated[role][resource]) updated[role][resource] = [];

      const currentActions = updated[role][resource];
      if (currentActions.includes(action)) {
        updated[role][resource] = currentActions.filter(a => a !== action);
      } else {
        updated[role][resource] = [...currentActions, action];
      }

      return updated;
    });
  };

  const updateMemberRole = async (memberId: string, newRole: TeamRole) => {
    try {
      const member = members.find(m => m.id === memberId);
      if (!member) return;

      await teamService.updateMemberRole(teamId, member.userId, newRole);
      
      setMembers(prev => prev.map(m => 
        m.id === memberId ? { ...m, role: newRole } : m
      ));

      // Update permission matrix based on new role
      const rolePermissions = predefinedRoles.find(r => r.id === newRole)?.permissions || [];
      onPermissionsUpdate?.(member.userId, rolePermissions);

    } catch (error) {
      console.error('Failed to update member role:', error);
    }
  };

  const createCustomRole = async (roleData: { name: string; description: string; permissions: Permission[] }) => {
    const customRole: CustomRole = {
      id: `custom_${Date.now()}`,
      name: roleData.name,
      description: roleData.description,
      permissions: roleData.permissions,
      isCustom: true,
      memberCount: 0
    };

    setCustomRoles(prev => [...prev, customRole]);
    setShowRoleEditor(false);
  };

  const getRoleColor = (role: TeamRole) => {
    switch (role) {
      case 'owner': return 'text-purple-600 bg-purple-100 border-purple-200';
      case 'admin': return 'text-red-600 bg-red-100 border-red-200';
      case 'member': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'viewer': return 'text-gray-600 bg-gray-100 border-gray-200';
      case 'guest': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getActionIcon = (action: ActionType) => {
    switch (action) {
      case 'create': return <PlusIcon className="h-3 w-3" />;
      case 'read': return <EyeIcon className="h-3 w-3" />;
      case 'update': return <PencilIcon className="h-3 w-3" />;
      case 'delete': return <TrashIcon className="h-3 w-3" />;
      case 'approve': return <CheckIcon className="h-3 w-3" />;
      case 'deploy': return <UnlockOpenIcon className="h-3 w-3" />;
      case 'invite': return <UserGroupIcon className="h-3 w-3" />;
      default: return <KeyIcon className="h-3 w-3" />;
    }
  };

  return (
    <div className={cn("bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden", className)}>
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <ShieldCheckIcon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Role & Permission Management</h2>
              <p className="text-indigo-100 text-sm">
                Manage team member roles and fine-tune permissions
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setShowRoleEditor(true)}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Custom Role</span>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'members', label: 'Members', count: members.length },
            { id: 'roles', label: 'Roles', count: predefinedRoles.length + customRoles.filter(r => r.isCustom).length },
            { id: 'permissions', label: 'Permission Matrix', count: null }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors",
                activeTab === tab.id
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Members Tab */}
        {activeTab === 'members' && (
          <motion.div
            key="members"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="space-y-4">
              {members.map(member => (
                <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="font-medium text-gray-600">
                        {member.userId.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">User {member.userId}</div>
                      <div className="text-sm text-gray-500">
                        Joined {member.joinedAt.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <select
                      value={member.role}
                      onChange={(e) => updateMemberRole(member.id, e.target.value as TeamRole)}
                      className={cn(
                        "px-3 py-1 text-sm font-medium rounded-full border",
                        getRoleColor(member.role)
                      )}
                    >
                      <option value="owner">Owner</option>
                      <option value="admin">Admin</option>
                      <option value="member">Member</option>
                      <option value="viewer">Viewer</option>
                      <option value="guest">Guest</option>
                    </select>
                    
                    <button
                      onClick={() => setSelectedMember(member)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Roles Tab */}
        {activeTab === 'roles' && (
          <motion.div
            key="roles"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...predefinedRoles, ...customRoles.filter(r => r.isCustom)].map(role => (
                <div key={role.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        role.isCustom ? "bg-purple-100" : "bg-blue-100"
                      )}>
                        {role.isCustom ? (
                          <KeyIcon className="h-4 w-4 text-purple-600" />
                        ) : (
                          <ShieldCheckIcon className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{role.name}</h3>
                        <p className="text-sm text-gray-500">{role.memberCount} members</p>
                      </div>
                    </div>
                    
                    {role.isCustom && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingRole(role)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-red-600">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">{role.description}</p>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Permissions:</h4>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 6).map((permission, index) => (
                        <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                          {permission.resource}
                        </span>
                      ))}
                      {role.permissions.length > 6 && (
                        <span className="px-2 py-1 text-xs text-gray-500">
                          +{role.permissions.length - 6} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Permission Matrix Tab */}
        {activeTab === 'permissions' && (
          <motion.div
            key="permissions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Resource</th>
                    {predefinedRoles.map(role => (
                      <th key={role.id} className="text-center py-3 px-2 font-semibold text-gray-900">
                        {role.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {resources.map(resource => (
                    <tr key={resource.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-gray-900">{resource.label}</div>
                          <div className="text-sm text-gray-500">{resource.description}</div>
                        </div>
                      </td>
                      {predefinedRoles.map(role => (
                        <td key={role.id} className="py-4 px-2">
                          <div className="flex flex-wrap justify-center gap-1">
                            {actions.map(action => {
                              const hasAccess = hasPermission(role.id, resource.id, action.id);
                              return (
                                <button
                                  key={action.id}
                                  onClick={() => togglePermission(role.id, resource.id, action.id)}
                                  className={cn(
                                    "p-1 rounded text-xs transition-colors flex items-center space-x-1",
                                    hasAccess ? action.color : "text-gray-300 bg-gray-50 hover:bg-gray-100"
                                  )}
                                  title={`${action.label} ${resource.label}`}
                                >
                                  {getActionIcon(action.id)}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>

      {/* Create/Edit Role Modal */}
      <AnimatePresence>
        {(showRoleEditor || editingRole) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => {
              setShowRoleEditor(false);
              setEditingRole(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {editingRole ? 'Edit Role' : 'Create Custom Role'}
                </h3>
                
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  createCustomRole({
                    name: formData.get('name') as string,
                    description: formData.get('description') as string,
                    permissions: [] // Would be built from UI selections
                  });
                }}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        defaultValue={editingRole?.name}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Enter role name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        name="description"
                        rows={3}
                        defaultValue={editingRole?.description}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Describe this role's responsibilities"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Permissions
                      </label>
                      <div className="space-y-4">
                        {resources.map(resource => (
                          <div key={resource.id} className="border border-gray-200 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 mb-2">{resource.label}</h4>
                            <p className="text-sm text-gray-600 mb-3">{resource.description}</p>
                            <div className="flex flex-wrap gap-2">
                              {actions.map(action => (
                                <label key={action.id} className="flex items-center space-x-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                  />
                                  <span className={cn("text-xs px-2 py-1 rounded flex items-center space-x-1", action.color)}>
                                    {getActionIcon(action.id)}
                                    <span>{action.label}</span>
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setShowRoleEditor(false);
                        setEditingRole(null);
                      }}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      {editingRole ? 'Update Role' : 'Create Role'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}