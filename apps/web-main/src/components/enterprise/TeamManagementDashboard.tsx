'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UsersIcon,
  BuildingOfficeIcon,
  FolderIcon,
  ChartBarIcon,
  CogIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EllipsisVerticalIcon,
  UserPlusIcon,
  ShieldCheckIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  BellIcon,
  ArrowRightIcon,
  StarIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import {
  TeamManagementService,
  Organization,
  Team,
  User,
  TeamMember,
  Project,
  Activity,
  TeamRole
} from '@/lib/enterprise/team-management';

interface TeamManagementDashboardProps {
  organizationId: string;
  currentUserId: string;
  className?: string;
}

type ActiveView = 'overview' | 'teams' | 'members' | 'projects' | 'activity' | 'settings';

export default function TeamManagementDashboard({
  organizationId,
  currentUserId,
  className
}: TeamManagementDashboardProps) {
  const [activeView, setActiveView] = useState<ActiveView>('overview');
  const [teamService] = useState(() => new TeamManagementService());
  
  // State
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [allMembers, setAllMembers] = useState<Map<string, TeamMember[]>>(new Map());
  const [projects, setProjects] = useState<Project[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [users, setUsers] = useState<Map<string, User>>(new Map());
  
  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [organizationId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load organization
      const org = await teamService.getOrganization(organizationId);
      setOrganization(org);

      // Load teams
      const teamsList = await teamService.getTeamsByOrganization(organizationId);
      setTeams(teamsList);

      // Load team members for each team
      const membersMap = new Map();
      for (const team of teamsList) {
        const members = await teamService.getTeamMembers(team.id);
        membersMap.set(team.id, members);
        
        // Load projects for team
        const teamProjects = await teamService.getProjectsByTeam(team.id);
        setProjects(prev => [...prev, ...teamProjects]);
      }
      setAllMembers(membersMap);

      // Load activities
      const orgActivities = await teamService.getActivities(organizationId);
      setActivities(orgActivities);

    } catch (error) {
      console.error('Failed to load team data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTeam = async (teamData: { name: string; description?: string }) => {
    try {
      const team = await teamService.createTeam(organizationId, teamData);
      setTeams(prev => [...prev, team]);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create team:', error);
    }
  };

  const getRoleColor = (role: TeamRole) => {
    switch (role) {
      case 'owner': return 'text-purple-600 bg-purple-100';
      case 'admin': return 'text-red-600 bg-red-100';
      case 'member': return 'text-blue-600 bg-blue-100';
      case 'viewer': return 'text-gray-600 bg-gray-100';
      case 'guest': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'project_created': return <FolderIcon className="h-4 w-4 text-blue-500" />;
      case 'project_deployed': return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'member_joined': return <UserPlusIcon className="h-4 w-4 text-purple-500" />;
      case 'member_left': return <XCircleIcon className="h-4 w-4 text-red-500" />;
      case 'code_review_requested': return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      case 'code_review_approved': return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'settings_updated': return <CogIcon className="h-4 w-4 text-gray-500" />;
      case 'deployment_failed': return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
      default: return <BellIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTeamStats = (team: Team) => {
    const members = allMembers.get(team.id) || [];
    const teamProjects = projects.filter(p => p.teamId === team.id);
    const activeProjects = teamProjects.filter(p => 
      p.lastDeployedAt && p.lastDeployedAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );

    return {
      memberCount: members.length,
      projectCount: teamProjects.length,
      activeProjects: activeProjects.length,
      lastActivity: teamProjects.reduce((latest, project) => {
        return project.updatedAt > latest ? project.updatedAt : latest;
      }, new Date(0))
    };
  };

  const getTotalStats = () => {
    const totalMembers = Array.from(allMembers.values()).flat().length;
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => 
      p.lastDeployedAt && p.lastDeployedAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;
    const recentActivities = activities.filter(a => 
      a.createdAt > new Date(Date.now() - 24 * 60 * 60 * 1000)
    ).length;

    return { totalMembers, totalProjects, activeProjects, recentActivities };
  };

  const stats = getTotalStats();

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: ChartBarIcon, count: null },
    { id: 'teams', label: 'Teams', icon: UsersIcon, count: teams.length },
    { id: 'members', label: 'Members', icon: UserPlusIcon, count: stats.totalMembers },
    { id: 'projects', label: 'Projects', icon: FolderIcon, count: stats.totalProjects },
    { id: 'activity', label: 'Activity', icon: BellIcon, count: stats.recentActivities },
    { id: 'settings', label: 'Settings', icon: CogIcon, count: null }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading team data...</span>
      </div>
    );
  }

  return (
    <div className={cn("bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden", className)}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <BuildingOfficeIcon className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{organization?.name}</h1>
              <div className="flex items-center space-x-4 text-blue-100 text-sm">
                <span>{teams.length} teams</span>
                <span>•</span>
                <span>{stats.totalMembers} members</span>
                <span>•</span>
                <span>{stats.totalProjects} projects</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-lg font-semibold">{organization?.billing.plan}</div>
              <div className="text-sm text-blue-100">
                {organization?.billing.usage.projects}/{organization?.billing.limits.maxProjects} projects
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span>New Team</span>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">{stats.activeProjects}</div>
            <div className="text-sm text-blue-100">Active Projects</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">{stats.recentActivities}</div>
            <div className="text-sm text-blue-100">Today's Activity</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">{Math.round(organization?.billing.usage.aiTokens! / 1000)}k</div>
            <div className="text-sm text-blue-100">AI Tokens Used</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">{Math.round(organization?.billing.usage.storage! / 1000)}GB</div>
            <div className="text-sm text-blue-100">Storage Used</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {navigationItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as ActiveView)}
              className={cn(
                "flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors",
                activeView === item.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
              {item.count !== null && item.count > 0 && (
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Search and Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search teams, members, projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
              />
            </div>
            <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <FunnelIcon className="h-4 w-4" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Overview Tab */}
        {activeView === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Recent Activity */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-3">
                  {activities.slice(0, 5).map(activity => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">{activity.actor.name}</span>{' '}
                          {activity.type.replace('_', ' ')}
                          {activity.target && (
                            <span> <span className="font-medium">{activity.target.name}</span></span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500">
                          {activity.createdAt.toRelativeTimeString?.() || activity.createdAt.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Performing Teams */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Teams</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teams.slice(0, 6).map(team => {
                  const stats = getTeamStats(team);
                  return (
                    <div key={team.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">{team.name}</h4>
                        <div className="flex items-center space-x-1">
                          <StarIcon className="h-4 w-4 text-yellow-400" />
                          <span className="text-sm text-gray-600">4.8</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{team.description}</p>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <div className="text-lg font-semibold text-gray-900">{stats.memberCount}</div>
                          <div className="text-xs text-gray-500">Members</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-gray-900">{stats.projectCount}</div>
                          <div className="text-xs text-gray-500">Projects</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-gray-900">{stats.activeProjects}</div>
                          <div className="text-xs text-gray-500">Active</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Teams Tab */}
        {activeView === 'teams' && (
          <motion.div
            key="teams"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {teams
                .filter(team => 
                  team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  team.description?.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map(team => {
                  const stats = getTeamStats(team);
                  const members = allMembers.get(team.id) || [];
                  
                  return (
                    <motion.div
                      key={team.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedTeam(team)}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <UsersIcon className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{team.name}</h3>
                            <p className="text-sm text-gray-500 capitalize">{team.settings.visibility}</p>
                          </div>
                        </div>
                        
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                          <EllipsisVerticalIcon className="h-4 w-4" />
                        </button>
                      </div>

                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{team.description}</p>

                      {/* Team Stats */}
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900">{stats.memberCount}</div>
                          <div className="text-xs text-gray-500">Members</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900">{stats.projectCount}</div>
                          <div className="text-xs text-gray-500">Projects</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900">{stats.activeProjects}</div>
                          <div className="text-xs text-gray-500">Active</div>
                        </div>
                      </div>

                      {/* Team Members Preview */}
                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-2">
                          {members.slice(0, 4).map((member, index) => (
                            <div
                              key={member.id}
                              className="w-6 h-6 bg-gray-300 rounded-full border-2 border-white flex items-center justify-center"
                              title={`Member ${index + 1}`}
                            >
                              <span className="text-xs font-medium text-gray-600">
                                {String.fromCharCode(65 + index)}
                              </span>
                            </div>
                          ))}
                          {members.length > 4 && (
                            <div className="w-6 h-6 bg-gray-100 rounded-full border-2 border-white flex items-center justify-center">
                              <span className="text-xs text-gray-500">+{members.length - 4}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-500">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          <span>{stats.lastActivity.toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                          <span>Manage Team</span>
                          <ArrowRightIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          </motion.div>
        )}

        {/* Other tabs would be implemented similarly */}
        {activeView === 'members' && (
          <div className="text-center py-12">
            <UserPlusIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Members Management</h3>
            <p className="text-gray-600">View and manage all organization members across teams</p>
          </div>
        )}

        {activeView === 'projects' && (
          <div className="text-center py-12">
            <FolderIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Projects Overview</h3>
            <p className="text-gray-600">Monitor all projects across teams and track their progress</p>
          </div>
        )}

        {activeView === 'activity' && (
          <div className="text-center py-12">
            <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Activity Feed</h3>
            <p className="text-gray-600">Real-time feed of all organization activities</p>
          </div>
        )}

        {activeView === 'settings' && (
          <div className="text-center py-12">
            <CogIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Organization Settings</h3>
            <p className="text-gray-600">Configure billing, security, and organization preferences</p>
          </div>
        )}
      </div>

      {/* Create Team Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Team</h3>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleCreateTeam({
                    name: formData.get('name') as string,
                    description: formData.get('description') as string
                  });
                }}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Team Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter team name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        name="description"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Describe the team's purpose"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Create Team
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