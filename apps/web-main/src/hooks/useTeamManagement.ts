'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  TeamManagementService,
  Organization,
  Team,
  User,
  TeamMember,
  Project,
  Activity,
  TeamRole,
  Permission,
  Invitation
} from '@/lib/enterprise/team-management';

interface UseTeamManagementOptions {
  organizationId: string;
  currentUserId: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface TeamManagementState {
  organization: Organization | null;
  teams: Team[];
  members: Map<string, TeamMember[]>;
  projects: Project[];
  activities: Activity[];
  users: Map<string, User>;
  invitations: Invitation[];
  isLoading: boolean;
  error: string | null;
}

interface TeamManagementActions {
  // Organization
  updateOrganization: (updates: Partial<Organization>) => Promise<void>;
  
  // Teams
  createTeam: (teamData: Partial<Team>) => Promise<Team>;
  updateTeam: (teamId: string, updates: Partial<Team>) => Promise<void>;
  deleteTeam: (teamId: string) => Promise<void>;
  
  // Members
  inviteMember: (teamId: string, email: string, role: TeamRole) => Promise<void>;
  addMember: (teamId: string, userId: string, role: TeamRole) => Promise<void>;
  updateMemberRole: (teamId: string, userId: string, role: TeamRole) => Promise<void>;
  removeMember: (teamId: string, userId: string) => Promise<void>;
  
  // Projects
  createProject: (projectData: Partial<Project>) => Promise<Project>;
  updateProject: (projectId: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  
  // Utilities
  refresh: () => Promise<void>;
  getTeamMembers: (teamId: string) => TeamMember[];
  getUserTeams: (userId: string) => Team[];
  hasPermission: (userId: string, resource: string, action: string) => boolean;
  getTeamStats: (teamId: string) => {
    memberCount: number;
    projectCount: number;
    activeProjects: number;
    recentActivity: number;
  };
}

export function useTeamManagement({
  organizationId,
  currentUserId,
  autoRefresh = false,
  refreshInterval = 30000
}: UseTeamManagementOptions): TeamManagementState & TeamManagementActions {
  
  const [teamService] = useState(() => new TeamManagementService());
  
  const [state, setState] = useState<TeamManagementState>({
    organization: null,
    teams: [],
    members: new Map(),
    projects: [],
    activities: [],
    users: new Map(),
    invitations: [],
    isLoading: true,
    error: null
  });

  // Load all data
  const loadData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Load organization
      const organization = await teamService.getOrganization(organizationId);
      if (!organization) {
        throw new Error('Organization not found');
      }

      // Load teams
      const teams = await teamService.getTeamsByOrganization(organizationId);
      
      // Load members for each team
      const membersMap = new Map<string, TeamMember[]>();
      const allProjects: Project[] = [];
      
      for (const team of teams) {
        const teamMembers = await teamService.getTeamMembers(team.id);
        membersMap.set(team.id, teamMembers);
        
        // Load projects for each team
        const teamProjects = await teamService.getProjectsByTeam(team.id);
        allProjects.push(...teamProjects);
      }

      // Load activities
      const activities = await teamService.getActivities(organizationId);

      setState(prev => ({
        ...prev,
        organization,
        teams,
        members: membersMap,
        projects: allProjects,
        activities,
        isLoading: false
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'An error occurred',
        isLoading: false
      }));
    }
  }, [organizationId, teamService]);

  // Initial load and auto-refresh setup
  useEffect(() => {
    loadData();

    let intervalId: NodeJS.Timeout;
    if (autoRefresh) {
      intervalId = setInterval(loadData, refreshInterval);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [loadData, autoRefresh, refreshInterval]);

  // Actions
  const updateOrganization = async (updates: Partial<Organization>) => {
    try {
      const updated = await teamService.updateOrganization(organizationId, updates);
      if (updated) {
        setState(prev => ({ ...prev, organization: updated }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update organization'
      }));
    }
  };

  const createTeam = async (teamData: Partial<Team>): Promise<Team> => {
    try {
      const team = await teamService.createTeam(organizationId, teamData);
      setState(prev => ({
        ...prev,
        teams: [...prev.teams, team],
        members: new Map(prev.members).set(team.id, [])
      }));
      return team;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create team'
      }));
      throw error;
    }
  };

  const updateTeam = async (teamId: string, updates: Partial<Team>) => {
    try {
      const team = state.teams.find(t => t.id === teamId);
      if (!team) throw new Error('Team not found');

      const updatedTeam = { ...team, ...updates, updatedAt: new Date() };
      setState(prev => ({
        ...prev,
        teams: prev.teams.map(t => t.id === teamId ? updatedTeam : t)
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update team'
      }));
    }
  };

  const deleteTeam = async (teamId: string) => {
    try {
      setState(prev => ({
        ...prev,
        teams: prev.teams.filter(t => t.id !== teamId),
        members: new Map([...prev.members].filter(([id]) => id !== teamId)),
        projects: prev.projects.filter(p => p.teamId !== teamId)
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to delete team'
      }));
    }
  };

  const inviteMember = async (teamId: string, email: string, role: TeamRole) => {
    try {
      // In a real implementation, this would send an invitation email
      console.log(`Inviting ${email} to team ${teamId} as ${role}`);
      
      // For demo purposes, we'll simulate adding the member directly
      const newMember: TeamMember = {
        id: `member_${Date.now()}`,
        userId: `user_${email.split('@')[0]}`,
        teamId,
        role,
        permissions: [],
        joinedAt: new Date(),
        lastActiveAt: new Date(),
        status: 'pending'
      };

      const currentMembers = state.members.get(teamId) || [];
      setState(prev => ({
        ...prev,
        members: new Map(prev.members).set(teamId, [...currentMembers, newMember])
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to invite member'
      }));
    }
  };

  const addMember = async (teamId: string, userId: string, role: TeamRole) => {
    try {
      const member = await teamService.addTeamMember(teamId, userId, role, currentUserId);
      const currentMembers = state.members.get(teamId) || [];
      
      setState(prev => ({
        ...prev,
        members: new Map(prev.members).set(teamId, [...currentMembers, member])
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to add member'
      }));
    }
  };

  const updateMemberRole = async (teamId: string, userId: string, role: TeamRole) => {
    try {
      await teamService.updateMemberRole(teamId, userId, role);
      const currentMembers = state.members.get(teamId) || [];
      
      setState(prev => ({
        ...prev,
        members: new Map(prev.members).set(teamId, 
          currentMembers.map(m => m.userId === userId ? { ...m, role } : m)
        )
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update member role'
      }));
    }
  };

  const removeMember = async (teamId: string, userId: string) => {
    try {
      await teamService.removeMember(teamId, userId);
      const currentMembers = state.members.get(teamId) || [];
      
      setState(prev => ({
        ...prev,
        members: new Map(prev.members).set(teamId, 
          currentMembers.filter(m => m.userId !== userId)
        )
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to remove member'
      }));
    }
  };

  const createProject = async (projectData: Partial<Project>): Promise<Project> => {
    try {
      const project = await teamService.createProject({
        ...projectData,
        organizationId,
        createdBy: currentUserId
      });
      
      setState(prev => ({
        ...prev,
        projects: [...prev.projects, project]
      }));
      
      return project;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create project'
      }));
      throw error;
    }
  };

  const updateProject = async (projectId: string, updates: Partial<Project>) => {
    try {
      const project = state.projects.find(p => p.id === projectId);
      if (!project) throw new Error('Project not found');

      const updatedProject = { ...project, ...updates, updatedAt: new Date() };
      setState(prev => ({
        ...prev,
        projects: prev.projects.map(p => p.id === projectId ? updatedProject : p)
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update project'
      }));
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      setState(prev => ({
        ...prev,
        projects: prev.projects.filter(p => p.id !== projectId)
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to delete project'
      }));
    }
  };

  // Utility functions
  const getTeamMembers = (teamId: string): TeamMember[] => {
    return state.members.get(teamId) || [];
  };

  const getUserTeams = (userId: string): Team[] => {
    return state.teams.filter(team => {
      const members = state.members.get(team.id) || [];
      return members.some(member => member.userId === userId);
    });
  };

  const hasPermission = (userId: string, resource: string, action: string): boolean => {
    // Simple permission check - in a real implementation, this would be more sophisticated
    const userTeams = getUserTeams(userId);
    
    for (const team of userTeams) {
      const members = state.members.get(team.id) || [];
      const member = members.find(m => m.userId === userId);
      
      if (member) {
        // Owners and admins have all permissions
        if (member.role === 'owner' || member.role === 'admin') {
          return true;
        }
        
        // Check specific permissions
        const hasResourcePermission = member.permissions.some(permission => 
          permission.resource === resource && permission.actions.includes(action as any)
        );
        
        if (hasResourcePermission) {
          return true;
        }
      }
    }
    
    return false;
  };

  const getTeamStats = (teamId: string) => {
    const members = state.members.get(teamId) || [];
    const teamProjects = state.projects.filter(p => p.teamId === teamId);
    const activeProjects = teamProjects.filter(p => 
      p.lastDeployedAt && p.lastDeployedAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );
    const recentActivity = state.activities.filter(a => 
      a.teamId === teamId && a.createdAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );

    return {
      memberCount: members.length,
      projectCount: teamProjects.length,
      activeProjects: activeProjects.length,
      recentActivity: recentActivity.length
    };
  };

  const refresh = async () => {
    await loadData();
  };

  return {
    ...state,
    updateOrganization,
    createTeam,
    updateTeam,
    deleteTeam,
    inviteMember,
    addMember,
    updateMemberRole,
    removeMember,
    createProject,
    updateProject,
    deleteProject,
    refresh,
    getTeamMembers,
    getUserTeams,
    hasPermission,
    getTeamStats
  };
}

export type { TeamManagementState, TeamManagementActions };
export default useTeamManagement;