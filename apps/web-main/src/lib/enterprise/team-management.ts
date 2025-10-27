'use client';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  domain?: string;
  settings: OrganizationSettings;
  billing: BillingInfo;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationSettings {
  ssoEnabled: boolean;
  mfaRequired: boolean;
  ipWhitelist: string[];
  allowedDomains: string[];
  dataRetentionDays: number;
  maxTeams: number;
  maxMembers: number;
  maxProjects: number;
  customBranding: boolean;
  apiAccessEnabled: boolean;
}

export interface BillingInfo {
  plan: 'starter' | 'professional' | 'enterprise' | 'custom';
  status: 'active' | 'trial' | 'suspended' | 'cancelled';
  billingEmail: string;
  subscriptionId?: string;
  trialEndsAt?: Date;
  currentPeriodEnd: Date;
  usage: {
    projects: number;
    deployments: number;
    aiTokens: number;
    storage: number; // in MB
  };
  limits: {
    maxProjects: number;
    maxDeployments: number;
    maxAITokens: number;
    maxStorage: number; // in MB
  };
}

export interface Team {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  description?: string;
  avatar?: string;
  settings: TeamSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamSettings {
  visibility: 'private' | 'internal' | 'public';
  autoApproveJoin: boolean;
  allowGuestAccess: boolean;
  codeReviewRequired: boolean;
  deploymentApprovalRequired: boolean;
  maxProjects: number;
  customTemplatesEnabled: boolean;
}

export interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  role: TeamRole;
  permissions: Permission[];
  joinedAt: Date;
  lastActiveAt: Date;
  invitedBy?: string;
  status: 'active' | 'pending' | 'suspended';
}

export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  title?: string;
  timezone: string;
  preferences: UserPreferences;
  profile: UserProfile;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    desktop: boolean;
    mentions: boolean;
    deployments: boolean;
    codeReviews: boolean;
  };
  editor: {
    fontSize: number;
    tabSize: number;
    wordWrap: boolean;
    minimap: boolean;
    autoSave: boolean;
  };
}

export interface UserProfile {
  bio?: string;
  location?: string;
  website?: string;
  githubUsername?: string;
  linkedinUrl?: string;
  skills: string[];
  experience: 'junior' | 'mid' | 'senior' | 'lead' | 'architect';
  specializations: string[];
}

export type TeamRole = 'owner' | 'admin' | 'member' | 'viewer' | 'guest';

export interface Permission {
  resource: ResourceType;
  actions: ActionType[];
  scope?: 'organization' | 'team' | 'project';
}

export type ResourceType = 
  | 'projects' 
  | 'deployments' 
  | 'analytics' 
  | 'settings' 
  | 'members' 
  | 'billing' 
  | 'templates'
  | 'code_review'
  | 'ai_features';

export type ActionType = 'create' | 'read' | 'update' | 'delete' | 'approve' | 'deploy' | 'invite';

export interface Project {
  id: string;
  organizationId: string;
  teamId: string;
  name: string;
  slug: string;
  description?: string;
  repository?: string;
  framework: string;
  template?: string;
  visibility: 'private' | 'internal' | 'public';
  settings: ProjectSettings;
  collaborators: ProjectCollaborator[];
  tags: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  lastDeployedAt?: Date;
}

export interface ProjectSettings {
  autoDeployEnabled: boolean;
  codeReviewRequired: boolean;
  qualityGatesEnabled: boolean;
  aiAssistanceLevel: 'basic' | 'standard' | 'advanced';
  environmentVariables: Record<string, string>;
  customDomain?: string;
  backupEnabled: boolean;
  monitoringEnabled: boolean;
}

export interface ProjectCollaborator {
  userId: string;
  role: 'owner' | 'maintainer' | 'contributor' | 'viewer';
  permissions: ProjectPermission[];
  addedAt: Date;
  addedBy: string;
}

export type ProjectPermission = 
  | 'code_read' 
  | 'code_write' 
  | 'deploy' 
  | 'settings' 
  | 'invite_collaborators' 
  | 'delete_project';

export interface Activity {
  id: string;
  type: ActivityType;
  actor: {
    userId: string;
    name: string;
    avatar?: string;
  };
  target?: {
    type: 'project' | 'team' | 'organization' | 'deployment';
    id: string;
    name: string;
  };
  metadata: Record<string, any>;
  organizationId: string;
  teamId?: string;
  projectId?: string;
  createdAt: Date;
}

export type ActivityType = 
  | 'project_created'
  | 'project_deployed'
  | 'member_joined'
  | 'member_left'
  | 'code_review_requested'
  | 'code_review_approved'
  | 'template_shared'
  | 'settings_updated'
  | 'deployment_failed'
  | 'ai_suggestion_applied';

export interface Invitation {
  id: string;
  organizationId: string;
  teamId?: string;
  projectId?: string;
  inviterUserId: string;
  email: string;
  role: TeamRole;
  permissions: Permission[];
  message?: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  expiresAt: Date;
  createdAt: Date;
  acceptedAt?: Date;
}

export class TeamManagementService {
  private organizations: Map<string, Organization> = new Map();
  private teams: Map<string, Team> = new Map();
  private users: Map<string, User> = new Map();
  private teamMembers: Map<string, TeamMember[]> = new Map();
  private projects: Map<string, Project> = new Map();
  private activities: Map<string, Activity[]> = new Map();
  private invitations: Map<string, Invitation> = new Map();

  constructor() {
    this.initializeSampleData();
  }

  // Organization Management
  async createOrganization(data: Partial<Organization>): Promise<Organization> {
    const organization: Organization = {
      id: this.generateId(),
      name: data.name!,
      slug: data.slug || this.slugify(data.name!),
      description: data.description,
      logo: data.logo,
      domain: data.domain,
      settings: {
        ssoEnabled: false,
        mfaRequired: false,
        ipWhitelist: [],
        allowedDomains: [],
        dataRetentionDays: 90,
        maxTeams: 10,
        maxMembers: 100,
        maxProjects: 500,
        customBranding: false,
        apiAccessEnabled: false,
        ...data.settings
      },
      billing: {
        plan: 'starter',
        status: 'trial',
        billingEmail: '',
        trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usage: { projects: 0, deployments: 0, aiTokens: 0, storage: 0 },
        limits: { maxProjects: 50, maxDeployments: 500, maxAITokens: 10000, maxStorage: 5000 },
        ...data.billing
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.organizations.set(organization.id, organization);
    this.logActivity({
      type: 'settings_updated',
      actor: { userId: 'system', name: 'System' },
      organizationId: organization.id,
      metadata: { action: 'organization_created', organizationName: organization.name }
    });

    return organization;
  }

  async getOrganization(organizationId: string): Promise<Organization | null> {
    return this.organizations.get(organizationId) || null;
  }

  async updateOrganization(organizationId: string, updates: Partial<Organization>): Promise<Organization | null> {
    const organization = this.organizations.get(organizationId);
    if (!organization) return null;

    const updatedOrganization = {
      ...organization,
      ...updates,
      updatedAt: new Date()
    };

    this.organizations.set(organizationId, updatedOrganization);
    return updatedOrganization;
  }

  // Team Management
  async createTeam(organizationId: string, data: Partial<Team>): Promise<Team> {
    const team: Team = {
      id: this.generateId(),
      organizationId,
      name: data.name!,
      slug: data.slug || this.slugify(data.name!),
      description: data.description,
      avatar: data.avatar,
      settings: {
        visibility: 'private',
        autoApproveJoin: false,
        allowGuestAccess: false,
        codeReviewRequired: true,
        deploymentApprovalRequired: true,
        maxProjects: 50,
        customTemplatesEnabled: true,
        ...data.settings
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.teams.set(team.id, team);
    this.teamMembers.set(team.id, []);

    this.logActivity({
      type: 'settings_updated',
      actor: { userId: 'system', name: 'System' },
      organizationId,
      teamId: team.id,
      metadata: { action: 'team_created', teamName: team.name }
    });

    return team;
  }

  async getTeamsByOrganization(organizationId: string): Promise<Team[]> {
    return Array.from(this.teams.values()).filter(team => team.organizationId === organizationId);
  }

  async getTeam(teamId: string): Promise<Team | null> {
    return this.teams.get(teamId) || null;
  }

  // Member Management
  async addTeamMember(
    teamId: string, 
    userId: string, 
    role: TeamRole = 'member',
    invitedBy?: string
  ): Promise<TeamMember> {
    const member: TeamMember = {
      id: this.generateId(),
      userId,
      teamId,
      role,
      permissions: this.getDefaultPermissions(role),
      joinedAt: new Date(),
      lastActiveAt: new Date(),
      invitedBy,
      status: 'active'
    };

    const teamMembers = this.teamMembers.get(teamId) || [];
    teamMembers.push(member);
    this.teamMembers.set(teamId, teamMembers);

    const team = this.teams.get(teamId);
    const user = this.users.get(userId);

    this.logActivity({
      type: 'member_joined',
      actor: { 
        userId: userId,
        name: user ? `${user.firstName} ${user.lastName}` : 'Unknown User'
      },
      organizationId: team?.organizationId || '',
      teamId,
      metadata: { role, invitedBy }
    });

    return member;
  }

  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    return this.teamMembers.get(teamId) || [];
  }

  async updateMemberRole(teamId: string, userId: string, role: TeamRole): Promise<TeamMember | null> {
    const members = this.teamMembers.get(teamId) || [];
    const member = members.find(m => m.userId === userId);
    
    if (!member) return null;

    member.role = role;
    member.permissions = this.getDefaultPermissions(role);

    return member;
  }

  async removeMember(teamId: string, userId: string): Promise<boolean> {
    const members = this.teamMembers.get(teamId) || [];
    const memberIndex = members.findIndex(m => m.userId === userId);
    
    if (memberIndex === -1) return false;

    members.splice(memberIndex, 1);
    this.teamMembers.set(teamId, members);

    const team = this.teams.get(teamId);
    const user = this.users.get(userId);

    this.logActivity({
      type: 'member_left',
      actor: { 
        userId: userId,
        name: user ? `${user.firstName} ${user.lastName}` : 'Unknown User'
      },
      organizationId: team?.organizationId || '',
      teamId,
      metadata: { action: 'removed' }
    });

    return true;
  }

  // Project Management
  async createProject(data: Partial<Project>): Promise<Project> {
    const project: Project = {
      id: this.generateId(),
      organizationId: data.organizationId!,
      teamId: data.teamId!,
      name: data.name!,
      slug: data.slug || this.slugify(data.name!),
      description: data.description,
      repository: data.repository,
      framework: data.framework || 'react',
      template: data.template,
      visibility: data.visibility || 'private',
      settings: {
        autoDeployEnabled: false,
        codeReviewRequired: true,
        qualityGatesEnabled: true,
        aiAssistanceLevel: 'standard',
        environmentVariables: {},
        backupEnabled: true,
        monitoringEnabled: true,
        ...data.settings
      },
      collaborators: [],
      tags: data.tags || [],
      createdBy: data.createdBy!,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add creator as owner
    project.collaborators.push({
      userId: project.createdBy,
      role: 'owner',
      permissions: ['code_read', 'code_write', 'deploy', 'settings', 'invite_collaborators', 'delete_project'],
      addedAt: new Date(),
      addedBy: project.createdBy
    });

    this.projects.set(project.id, project);

    this.logActivity({
      type: 'project_created',
      actor: { userId: project.createdBy, name: 'User' },
      target: { type: 'project', id: project.id, name: project.name },
      organizationId: project.organizationId,
      teamId: project.teamId,
      projectId: project.id,
      metadata: { framework: project.framework, template: project.template }
    });

    return project;
  }

  async getProjectsByTeam(teamId: string): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(project => project.teamId === teamId);
  }

  async getProject(projectId: string): Promise<Project | null> {
    return this.projects.get(projectId) || null;
  }

  // Activity Tracking
  private logActivity(activity: Omit<Activity, 'id' | 'createdAt'>): void {
    const fullActivity: Activity = {
      id: this.generateId(),
      createdAt: new Date(),
      ...activity
    };

    // Store by organization
    const orgActivities = this.activities.get(activity.organizationId) || [];
    orgActivities.unshift(fullActivity);
    this.activities.set(activity.organizationId, orgActivities.slice(0, 1000)); // Keep last 1000
  }

  async getActivities(organizationId: string, limit = 50): Promise<Activity[]> {
    const activities = this.activities.get(organizationId) || [];
    return activities.slice(0, limit);
  }

  // Permissions
  private getDefaultPermissions(role: TeamRole): Permission[] {
    const permissionMap: Record<TeamRole, Permission[]> = {
      owner: [
        { resource: 'projects', actions: ['create', 'read', 'update', 'delete', 'deploy'] },
        { resource: 'members', actions: ['invite', 'read', 'update', 'delete'] },
        { resource: 'settings', actions: ['read', 'update'] },
        { resource: 'billing', actions: ['read', 'update'] },
        { resource: 'analytics', actions: ['read'] },
        { resource: 'templates', actions: ['create', 'read', 'update', 'delete'] },
        { resource: 'code_review', actions: ['create', 'read', 'approve'] },
        { resource: 'ai_features', actions: ['read', 'update'] }
      ],
      admin: [
        { resource: 'projects', actions: ['create', 'read', 'update', 'deploy'] },
        { resource: 'members', actions: ['invite', 'read', 'update'] },
        { resource: 'settings', actions: ['read', 'update'] },
        { resource: 'analytics', actions: ['read'] },
        { resource: 'templates', actions: ['create', 'read', 'update'] },
        { resource: 'code_review', actions: ['create', 'read', 'approve'] },
        { resource: 'ai_features', actions: ['read'] }
      ],
      member: [
        { resource: 'projects', actions: ['create', 'read', 'update', 'deploy'] },
        { resource: 'members', actions: ['read'] },
        { resource: 'templates', actions: ['read', 'update'] },
        { resource: 'code_review', actions: ['create', 'read'] },
        { resource: 'ai_features', actions: ['read'] }
      ],
      viewer: [
        { resource: 'projects', actions: ['read'] },
        { resource: 'members', actions: ['read'] },
        { resource: 'templates', actions: ['read'] },
        { resource: 'analytics', actions: ['read'] }
      ],
      guest: [
        { resource: 'projects', actions: ['read'] }
      ]
    };

    return permissionMap[role] || [];
  }

  // Utility Methods
  private generateId(): string {
    return 'tm_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private initializeSampleData(): void {
    // Create sample organization
    const org = {
      id: 'org_sample',
      name: 'Acme Corporation',
      slug: 'acme-corp',
      description: 'Building the future with AI',
      settings: {
        ssoEnabled: true,
        mfaRequired: true,
        ipWhitelist: [],
        allowedDomains: ['acme.com'],
        dataRetentionDays: 365,
        maxTeams: 25,
        maxMembers: 500,
        maxProjects: 1000,
        customBranding: true,
        apiAccessEnabled: true
      },
      billing: {
        plan: 'enterprise' as const,
        status: 'active' as const,
        billingEmail: 'billing@acme.com',
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        usage: { projects: 45, deployments: 342, aiTokens: 25000, storage: 12000 },
        limits: { maxProjects: 1000, maxDeployments: 10000, maxAITokens: 100000, maxStorage: 50000 }
      },
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date()
    };
    this.organizations.set(org.id, org);

    // Create sample teams
    const teams = [
      {
        id: 'team_frontend',
        organizationId: org.id,
        name: 'Frontend Team',
        slug: 'frontend',
        description: 'UI/UX and frontend development',
        settings: {
          visibility: 'internal' as const,
          autoApproveJoin: true,
          allowGuestAccess: false,
          codeReviewRequired: true,
          deploymentApprovalRequired: false,
          maxProjects: 100,
          customTemplatesEnabled: true
        },
        createdAt: new Date('2024-01-16'),
        updatedAt: new Date()
      },
      {
        id: 'team_backend',
        organizationId: org.id,
        name: 'Backend Team',
        slug: 'backend',
        description: 'API and infrastructure development',
        settings: {
          visibility: 'internal' as const,
          autoApproveJoin: false,
          allowGuestAccess: false,
          codeReviewRequired: true,
          deploymentApprovalRequired: true,
          maxProjects: 75,
          customTemplatesEnabled: true
        },
        createdAt: new Date('2024-01-16'),
        updatedAt: new Date()
      }
    ];

    teams.forEach(team => this.teams.set(team.id, team));

    // Create sample users
    const users = [
      {
        id: 'user_alice',
        email: 'alice@acme.com',
        username: 'alice.johnson',
        firstName: 'Alice',
        lastName: 'Johnson',
        avatar: '/images/avatars/alice.jpg',
        title: 'Senior Frontend Developer',
        timezone: 'America/New_York',
        preferences: {
          theme: 'dark' as const,
          language: 'en',
          notifications: {
            email: true,
            push: true,
            desktop: false,
            mentions: true,
            deployments: true,
            codeReviews: true
          },
          editor: {
            fontSize: 14,
            tabSize: 2,
            wordWrap: true,
            minimap: false,
            autoSave: true
          }
        },
        profile: {
          bio: 'Frontend architect with 8+ years experience building scalable web applications',
          location: 'New York, NY',
          website: 'https://alice.dev',
          githubUsername: 'alicejohnson',
          skills: ['React', 'TypeScript', 'Next.js', 'GraphQL', 'Design Systems'],
          experience: 'senior' as const,
          specializations: ['Frontend Architecture', 'Performance Optimization', 'UI/UX Design']
        },
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date(),
        lastLoginAt: new Date()
      }
    ];

    users.forEach(user => this.users.set(user.id, user));

    // Add sample team members
    this.teamMembers.set('team_frontend', [
      {
        id: 'member_1',
        userId: 'user_alice',
        teamId: 'team_frontend',
        role: 'admin',
        permissions: this.getDefaultPermissions('admin'),
        joinedAt: new Date('2024-01-20'),
        lastActiveAt: new Date(),
        status: 'active'
      }
    ]);
  }

  // User Management
  async createUser(data: Partial<User>): Promise<User> {
    const user: User = {
      id: this.generateId(),
      email: data.email!,
      username: data.username || data.email!.split('@')[0],
      firstName: data.firstName!,
      lastName: data.lastName!,
      avatar: data.avatar,
      title: data.title,
      timezone: data.timezone || 'UTC',
      preferences: {
        theme: 'system',
        language: 'en',
        notifications: {
          email: true,
          push: false,
          desktop: false,
          mentions: true,
          deployments: false,
          codeReviews: true
        },
        editor: {
          fontSize: 14,
          tabSize: 2,
          wordWrap: true,
          minimap: true,
          autoSave: true
        },
        ...data.preferences
      },
      profile: {
        skills: [],
        experience: 'junior',
        specializations: [],
        ...data.profile
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.users.set(user.id, user);
    return user;
  }

  async getUser(userId: string): Promise<User | null> {
    return this.users.get(userId) || null;
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    const user = this.users.get(userId);
    if (!user) return null;

    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: new Date()
    };

    this.users.set(userId, updatedUser);
    return updatedUser;
  }
}