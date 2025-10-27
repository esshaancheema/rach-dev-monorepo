// Comprehensive Admin Dashboard
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  TrendingUp, 
  MessageSquare, 
  FileText, 
  Activity,
  DollarSign,
  Clock,
  Globe,
  Shield,
  Settings,
  Bell,
  Download,
  RefreshCw,
  Calendar,
  Eye,
  UserCheck,
  AlertTriangle
} from 'lucide-react';
import { analytics } from '@/lib/analytics/tracker';

interface DashboardStats {
  users: {
    total: number;
    active: number;
    new: number;
    growth: number;
  };
  projects: {
    total: number;
    active: number;
    completed: number;
    pending: number;
  };
  revenue: {
    total: number;
    monthly: number;
    growth: number;
    forecast: number;
  };
  analytics: {
    sessions: number;
    pageViews: number;
    bounceRate: number;
    avgDuration: number;
  };
  notifications: {
    unread: number;
    critical: number;
  };
}

interface RecentActivity {
  id: string;
  type: 'user' | 'project' | 'system' | 'security';
  message: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  user?: string;
  details?: any;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [selectedTimeRange]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // In production, these would be actual API calls
      const mockStats: DashboardStats = {
        users: {
          total: 2847,
          active: 1456,
          new: 234,
          growth: 12.5
        },
        projects: {
          total: 156,
          active: 45,
          completed: 98,
          pending: 13
        },
        revenue: {
          total: 1250000,
          monthly: 185000,
          growth: 18.7,
          forecast: 220000
        },
        analytics: {
          sessions: 45678,
          pageViews: 123456,
          bounceRate: 32.5,
          avgDuration: 245
        },
        notifications: {
          unread: 12,
          critical: 3
        }
      };

      const mockActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'user',
          message: 'New user registration: john.doe@example.com',
          timestamp: '2024-01-31T10:30:00Z',
          severity: 'success',
          user: 'System'
        },
        {
          id: '2',
          type: 'project',
          message: 'Project "E-commerce Platform" marked as completed',
          timestamp: '2024-01-31T09:15:00Z',
          severity: 'success',
          user: 'Sarah Chen'
        },
        {
          id: '3',
          type: 'security',
          message: 'Failed login attempts detected from IP 192.168.1.100',
          timestamp: '2024-01-31T08:45:00Z',
          severity: 'warning',
          user: 'Security System'
        },
        {
          id: '4',
          type: 'system',
          message: 'Database backup completed successfully',
          timestamp: '2024-01-31T06:00:00Z',
          severity: 'info',
          user: 'System'
        },
        {
          id: '5',
          type: 'user',
          message: 'User role updated: mike.wilson@company.com → Admin',
          timestamp: '2024-01-30T16:20:00Z',
          severity: 'info',
          user: 'Admin'
        }
      ];

      setStats(mockStats);
      setRecentActivity(mockActivity);

      analytics.track({
        name: 'admin_dashboard_loaded',
        category: 'admin_action',
        properties: {
          timeRange: selectedTimeRange
        }
      });

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num > 0 ? '+' : ''}${num.toFixed(1)}%`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user': return <Users className="w-4 h-4" />;
      case 'project': return <FileText className="w-4 h-4" />;
      case 'security': return <Shield className="w-4 h-4" />;
      case 'system': return <Settings className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Welcome back! Here's what's happening with Zoptal.
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Time Range Selector */}
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="24h">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>

              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>

              {/* Notifications */}
              <div className="relative">
                <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  <Bell className="w-6 h-6" />
                  {stats?.notifications.unread > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {stats.notifications.unread}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Users Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {formatNumber(stats.users.total)}
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    {formatPercentage(stats.users.growth)} from last period
                  </p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Active</span>
                  <span className="font-medium">{formatNumber(stats.users.active)}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600 dark:text-gray-400">New</span>
                  <span className="font-medium">{formatNumber(stats.users.new)}</span>
                </div>
              </div>
            </motion.div>

            {/* Projects Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Projects</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {formatNumber(stats.projects.total)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {stats.projects.active} active
                  </p>
                </div>
                <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                  <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Completed</span>
                  <span className="font-medium">{stats.projects.completed}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600 dark:text-gray-400">Pending</span>
                  <span className="font-medium">{stats.projects.pending}</span>
                </div>
              </div>
            </motion.div>

            {/* Revenue Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {formatCurrency(stats.revenue.monthly)}
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    {formatPercentage(stats.revenue.growth)} from last month
                  </p>
                </div>
                <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-lg">
                  <DollarSign className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Total</span>
                  <span className="font-medium">{formatCurrency(stats.revenue.total)}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600 dark:text-gray-400">Forecast</span>
                  <span className="font-medium">{formatCurrency(stats.revenue.forecast)}</span>
                </div>
              </div>
            </motion.div>

            {/* Analytics Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sessions</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {formatNumber(stats.analytics.sessions)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {stats.analytics.bounceRate}% bounce rate
                  </p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Page Views</span>
                  <span className="font-medium">{formatNumber(stats.analytics.pageViews)}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600 dark:text-gray-400">Avg Duration</span>
                  <span className="font-medium">{stats.analytics.avgDuration}s</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Recent Activity
                </h2>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View All
                </button>
              </div>

              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <div className={`p-2 rounded-lg ${getSeverityColor(activity.severity)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {activity.message}
                      </p>
                      <div className="flex items-center mt-1 space-x-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>{activity.user}</span>
                        <span>•</span>
                        <span>{new Date(activity.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
                Quick Actions
              </h2>

              <div className="space-y-3">
                <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-3">
                  <UserCheck className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-900 dark:text-gray-100">Manage Users</span>
                </button>

                <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-green-600" />
                  <span className="text-gray-900 dark:text-gray-100">Create Project</span>
                </button>

                <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-3">
                  <Eye className="w-5 h-5 text-purple-600" />
                  <span className="text-gray-900 dark:text-gray-100">View Analytics</span>
                </button>

                <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-3">
                  <Settings className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-900 dark:text-gray-100">System Settings</span>
                </button>

                <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-3">
                  <Download className="w-5 h-5 text-orange-600" />
                  <span className="text-gray-900 dark:text-gray-100">Export Data</span>
                </button>
              </div>

              {/* System Status */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                  System Status
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">API Status</span>
                    <span className="flex items-center text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      Operational
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Database</span>
                    <span className="flex items-center text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      Healthy
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">CDN</span>
                    <span className="flex items-center text-yellow-600">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                      Degraded
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}