'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { mockProject, getProjectActivities, getUpcomingMeetings } from '@/lib/portal/data';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  CalendarIcon,
  DocumentIcon,
  UsersIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  BellIcon,
  FolderIcon,
  VideoCameraIcon,
  ChatBubbleLeftIcon,
  PaperClipIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface ProjectStatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: any;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

function ProjectStatsCard({ title, value, subtitle, icon: Icon, color, trend }: ProjectStatsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">{title}</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
              {subtitle && (
                <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
              )}
            </div>
          </div>
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 text-sm ${
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            <ArrowTrendingUpIcon className={`w-4 h-4 ${!trend.isPositive ? 'rotate-180 transform' : ''}`} />
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function MilestoneCard({ milestone }: { milestone: any }) {
  const statusColors = {
    completed: 'bg-green-100 text-green-800',
    in_progress: 'bg-blue-100 text-blue-800',
    pending: 'bg-gray-100 text-gray-800',
    delayed: 'bg-red-100 text-red-800'
  };

  const statusIcons = {
    completed: CheckCircleIcon,
    in_progress: ClockIcon,
    pending: ClockIcon,
    delayed: ExclamationTriangleIcon
  };

  const StatusIcon = statusIcons[milestone.status as keyof typeof statusIcons];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{milestone.name}</h3>
          <p className="text-sm text-gray-600 mb-2">{milestone.description}</p>
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span>Due: {new Date(milestone.dueDate).toLocaleDateString()}</span>
            <span>{milestone.assignedTeam.length} team members</span>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[milestone.status as keyof typeof statusColors]}`}>
            <StatusIcon className="w-3 h-3 inline mr-1" />
            {milestone.status.replace('_', ' ')}
          </span>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">{milestone.progress}%</div>
            <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${milestone.progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ActivityItem({ activity }: { activity: any }) {
  const typeIcons = {
    milestone_completed: CheckCircleIcon,
    deliverable_approved: CheckCircleIcon,
    file_uploaded: DocumentIcon,
    meeting_scheduled: VideoCameraIcon,
    comment_added: ChatBubbleLeftIcon,
    deliverable_submitted: PaperClipIcon
  };

  const Icon = typeIcons[activity.type as keyof typeof typeIcons] || DocumentIcon;

  return (
    <div className="flex items-start space-x-3 py-3">
      <div className="flex-shrink-0">
        <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
          <Icon className="w-4 h-4 text-blue-600" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          {activity.authorAvatar && (
            <img
              src={activity.authorAvatar}
              alt={activity.authorName}
              className="w-5 h-5 rounded-full"
            />
          )}
          <span className="text-sm font-medium text-gray-900">{activity.authorName}</span>
          <span className="text-xs text-gray-500">
            {new Date(activity.createdAt).toLocaleDateString()}
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
      </div>
      {activity.isImportant && (
        <div className="flex-shrink-0">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        </div>
      )}
    </div>
  );
}

export default function ClientPortalPage() {
  const { user, isLoading } = useAuth();
  const [project] = useState(mockProject);
  const [activities, setActivities] = useState(getProjectActivities(mockProject.id, 8));
  const [upcomingMeetings, setUpcomingMeetings] = useState(getUpcomingMeetings(mockProject.id));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">Please log in to access the client portal.</p>
          <Link
            href="/login"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">Z</span>
                </div>
                <span className="text-xl font-bold text-gray-900">Zoptal</span>
              </Link>
              <span className="text-gray-300">|</span>
              <h1 className="text-lg font-semibold text-gray-900">Client Portal</h1>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50">
                <BellIcon className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <UsersIcon className="w-4 h-4 text-blue-600" />
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{project.client.companyName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Project Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.name}</h1>
              <p className="text-gray-600 max-w-2xl">{project.description}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600 mb-1">{project.overallProgress}%</div>
              <div className="text-sm text-gray-500">Overall Progress</div>
              <div className="w-32 bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${project.overallProgress}%` }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <ProjectStatsCard
            title="Project Health"
            value={project.health}
            icon={ChartBarIcon}
            color={project.health === 'healthy' ? 'green' : project.health === 'at_risk' ? 'yellow' : 'red'}
          />
          <ProjectStatsCard
            title="Budget Utilized"
            value={`$${(project.budget.spentAmount / 1000).toFixed(0)}K`}
            subtitle={`of $${(project.budget.totalBudget / 1000).toFixed(0)}K total`}
            icon={ChartBarIcon}
            color="blue"
            trend={{ value: 33, isPositive: true }}
          />
          <ProjectStatsCard
            title="Milestones"
            value={`${project.milestones.filter(m => m.status === 'completed').length}/${project.milestones.length}`}
            subtitle="completed"
            icon={CheckCircleIcon}
            color="green"
          />
          <ProjectStatsCard
            title="Team Members"
            value={project.teamMembers.filter(tm => tm.isPublic).length}
            subtitle="working on project"
            icon={UsersIcon}
            color="purple"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Milestones */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Project Milestones</h2>
                <Link
                  href="/portal/milestones"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View All
                </Link>
              </div>
              <div className="space-y-4">
                {project.milestones.map((milestone) => (
                  <MilestoneCard key={milestone.id} milestone={milestone} />
                ))}
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
                <Link
                  href="/portal/activity"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View All
                </Link>
              </div>
              <div className="divide-y divide-gray-100">
                {activities.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/portal/files"
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-left"
                >
                  <FolderIcon className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-900">View Project Files</span>
                </Link>
                <Link
                  href="/portal/timeline"
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-left"
                >
                  <CalendarIcon className="w-5 h-5 text-green-600" />
                  <span className="text-gray-900">View Timeline</span>
                </Link>
                <Link
                  href="/portal/team"
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-left"
                >
                  <UsersIcon className="w-5 h-5 text-purple-600" />
                  <span className="text-gray-900">Meet the Team</span>
                </Link>
              </div>
            </motion.div>

            {/* Upcoming Meetings */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Meetings</h3>
              {upcomingMeetings.length > 0 ? (
                <div className="space-y-3">
                  {upcomingMeetings.map((meeting) => (
                    <div key={meeting.id} className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <VideoCameraIcon className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-gray-900">{meeting.title}</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {new Date(meeting.scheduledAt).toLocaleDateString()} at{' '}
                        {new Date(meeting.scheduledAt).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{meeting.duration} minutes</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No upcoming meetings scheduled.</p>
              )}
            </motion.div>

            {/* Project Contact */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Manager</h3>
              <div className="flex items-center space-x-3">
                <img
                  src={project.projectManager.avatar}
                  alt={project.projectManager.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="font-medium text-gray-900">{project.projectManager.name}</p>
                  <p className="text-sm text-gray-600">{project.projectManager.role}</p>
                  <p className="text-sm text-blue-600">{project.projectManager.email}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}