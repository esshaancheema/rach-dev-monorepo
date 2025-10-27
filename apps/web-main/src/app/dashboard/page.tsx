'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  UserIcon,
  CogIcon,
  BellIcon,
  ChartBarIcon,
  FolderIcon,
  PlusIcon,
  EyeIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

// Types
interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold';
  progress: number;
  dueDate: string;
  technology: string[];
  budget: number;
  team: string[];
  createdAt: string;
}

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalBudget: number;
  upcomingDeadlines: number;
}

// Mock data (in production, fetch from API)
const mockProjects: Project[] = [
  {
    id: 'proj_1',
    name: 'E-commerce Platform',
    description: 'Modern e-commerce solution with AI recommendations',
    status: 'in_progress',
    progress: 65,
    dueDate: '2024-03-15',
    technology: ['React', 'Node.js', 'PostgreSQL', 'AI/ML'],
    budget: 75000,
    team: ['John Smith', 'Sarah Johnson', 'Mike Chen'],
    createdAt: '2024-01-15'
  },
  {
    id: 'proj_2',
    name: 'Mobile App Development',
    description: 'Cross-platform mobile app for iOS and Android',
    status: 'planning',
    progress: 25,
    dueDate: '2024-04-20',
    technology: ['React Native', 'Firebase', 'TypeScript'],
    budget: 45000,
    team: ['Emily Davis', 'Alex Rodriguez'],
    createdAt: '2024-02-01'
  },
  {
    id: 'proj_3',
    name: 'AI Chatbot Integration',
    description: 'Intelligent customer service chatbot with NLP',
    status: 'completed',
    progress: 100,
    dueDate: '2024-02-28',
    technology: ['Python', 'TensorFlow', 'FastAPI', 'NLP'],
    budget: 32000,
    team: ['Dr. Lisa Wang', 'Tom Wilson'],
    createdAt: '2024-01-01'
  }
];

const mockStats: DashboardStats = {
  totalProjects: 8,
  activeProjects: 3,
  completedProjects: 4,
  totalBudget: 285000,
  upcomingDeadlines: 2
};

function ProjectCard({ project }: { project: Project }) {
  const statusColors = {
    planning: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    on_hold: 'bg-red-100 text-red-800'
  };

  const progressColors = {
    planning: 'bg-blue-500',
    in_progress: 'bg-yellow-500',
    completed: 'bg-green-500',
    on_hold: 'bg-red-500'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{project.name}</h3>
          <p className="text-gray-600 text-sm mb-3">{project.description}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[project.status]}`}>
          {project.status.replace('_', ' ')}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Progress</span>
          <span>{project.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${progressColors[project.status]}`}
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      {/* Project Details */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Due Date:</span>
          <span className="font-medium">{new Date(project.dueDate).toLocaleDateString()}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Budget:</span>
          <span className="font-medium">${project.budget.toLocaleString()}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Team:</span>
          <span className="font-medium">{project.team.length} members</span>
        </div>

        {/* Technologies */}
        <div className="flex flex-wrap gap-1 mt-3">
          {project.technology.slice(0, 3).map((tech, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
            >
              {tech}
            </span>
          ))}
          {project.technology.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
              +{project.technology.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
        <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
          View Details
        </button>
        <div className="flex space-x-2">
          <button 
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50"
            title="View project details"
            aria-label="View project details"
          >
            <EyeIcon className="w-4 h-4" />
          </button>
          <button 
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50"
            title="Project settings"
            aria-label="Project settings"
          >
            <CogIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  change, 
  changeType 
}: { 
  title: string; 
  value: string | number; 
  icon: any; 
  change?: string; 
  changeType?: 'positive' | 'negative' | 'neutral';
}) {
  const changeColors = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-600'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${changeColors[changeType || 'neutral']}`}>
              {change}
            </p>
          )}
        </div>
        <div className="p-3 bg-primary-50 rounded-lg">
          <Icon className="w-6 h-6 text-primary-600" />
        </div>
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [stats, setStats] = useState<DashboardStats>(mockStats);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Navigation */}
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">Z</span>
                </div>
                <span className="text-xl font-bold text-gray-900">Zoptal</span>
              </Link>
              
              <nav className="hidden md:flex space-x-6">
                <Link
                  href="/dashboard"
                  className="text-primary-600 font-medium flex items-center space-x-1"
                >
                  <HomeIcon className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
              </nav>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <button 
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50"
                title="Notifications"
                aria-label="View notifications"
              >
                <BellIcon className="w-5 h-5" />
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-primary-600" />
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User'}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName || user?.name || 'there'}! 👋
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your projects today.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Projects"
            value={stats.totalProjects}
            icon={FolderIcon}
            change="+2 this month"
            changeType="positive"
          />
          <StatCard
            title="Active Projects"
            value={stats.activeProjects}
            icon={ClockIcon}
            change="3 in progress"
            changeType="neutral"
          />
          <StatCard
            title="Completed"
            value={stats.completedProjects}
            icon={CheckCircleIcon}
            change="+1 this week"
            changeType="positive"
          />
          <StatCard
            title="Total Budget"
            value={`$${stats.totalBudget.toLocaleString()}`}
            icon={ChartBarIcon}
            change="+12% growth"
            changeType="positive"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Projects Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Projects</h2>
              <button className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
                <PlusIcon className="w-4 h-4" />
                <span>New Project</span>
              </button>
            </div>

            <div className="space-y-6">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 flex items-center space-x-3">
                  <PlusIcon className="w-5 h-5 text-primary-600" />
                  <span>Start New Project</span>
                </button>
                <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 flex items-center space-x-3">
                  <CalendarIcon className="w-5 h-5 text-blue-600" />
                  <span>Schedule Meeting</span>
                </button>
                <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 flex items-center space-x-3">
                  <ChartBarIcon className="w-5 h-5 text-green-600" />
                  <span>View Analytics</span>
                </button>
              </div>
            </motion.div>

            {/* Upcoming Deadlines */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Deadlines</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                  <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="font-medium text-gray-900">E-commerce Platform</p>
                    <p className="text-sm text-gray-600">Due in 15 days</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <CalendarIcon className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Mobile App Development</p>
                    <p className="text-sm text-gray-600">Due in 45 days</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-900">AI Chatbot Integration completed</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-900">New team member added to E-commerce project</p>
                    <p className="text-xs text-gray-500">5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-900">Mobile app design review scheduled</p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}