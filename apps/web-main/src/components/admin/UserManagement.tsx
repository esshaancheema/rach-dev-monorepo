// Comprehensive User Management Admin Component
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Search, 
  Filter,
  Edit3,
  Trash2,
  UserPlus,
  Shield,
  Mail,
  Phone,
  Calendar,
  Activity,
  Download,
  Upload,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Globe
} from 'lucide-react';
import { analytics } from '@/lib/analytics/tracker';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'user' | 'client' | 'developer';
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
  location?: string;
  timezone?: string;
  preferences: {
    notifications: boolean;
    marketing: boolean;
    newsletter: boolean;
  };
  stats: {
    projects: number;
    totalSpent: number;
    loginCount: number;
  };
  tags: string[];
}

interface UserFilters {
  role: string;
  status: string;
  search: string;
  dateRange: string;
  location: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [filters, setFilters] = useState<UserFilters>({
    role: 'all',
    status: 'all',
    search: '',
    dateRange: 'all',
    location: 'all'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(20);
  const [isLoading, setIsLoading] = useState(true);
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, filters]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      
      // In production, this would be an actual API call
      const mockUsers: User[] = [
        {
          id: '1',
          name: 'John Smith',
          email: 'john.smith@example.com',
          phone: '+1-555-0123',
          role: 'client',
          status: 'active',
          avatar: '/images/avatars/john.jpg',
          createdAt: '2024-01-15T10:30:00Z',
          lastLogin: '2024-01-31T08:45:00Z',
          location: 'New York, NY',
          timezone: 'America/New_York',
          preferences: {
            notifications: true,
            marketing: false,
            newsletter: true
          },
          stats: {
            projects: 3,
            totalSpent: 45000,
            loginCount: 127
          },
          tags: ['premium', 'enterprise']
        },
        {
          id: '2',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@company.com',
          phone: '+1-555-0456',
          role: 'admin',
          status: 'active',
          avatar: '/images/avatars/sarah.jpg',
          createdAt: '2023-12-01T09:15:00Z',
          lastLogin: '2024-01-31T11:20:00Z',
          location: 'San Francisco, CA',
          timezone: 'America/Los_Angeles',
          preferences: {
            notifications: true,
            marketing: true,
            newsletter: true
          },
          stats: {
            projects: 12,
            totalSpent: 0,
            loginCount: 456
          },
          tags: ['staff', 'senior']
        },
        {
          id: '3',
          name: 'Mike Wilson',
          email: 'mike.wilson@startup.io',
          role: 'user',
          status: 'pending',
          createdAt: '2024-01-30T16:20:00Z',
          location: 'Austin, TX',
          timezone: 'America/Chicago',
          preferences: {
            notifications: true,
            marketing: false,
            newsletter: false
          },
          stats: {
            projects: 0,
            totalSpent: 0,
            loginCount: 2
          },
          tags: ['new', 'startup']
        },
        {
          id: '4',
          name: 'Emily Chen',
          email: 'emily.chen@design.co',
          phone: '+1-555-0789',
          role: 'developer',
          status: 'active',
          avatar: '/images/avatars/emily.jpg',
          createdAt: '2023-11-20T14:45:00Z',
          lastLogin: '2024-01-30T17:30:00Z',  
          location: 'Seattle, WA',
          timezone: 'America/Los_Angeles',
          preferences: {
            notifications: true,
            marketing: false,
            newsletter: true
          },
          stats: {
            projects: 8,
            totalSpent: 0,
            loginCount: 234
          },
          tags: ['contractor', 'fullstack']
        },
        {
          id: '5',
          name: 'David Brown',
          email: 'david.brown@corp.com',
          role: 'client',
          status: 'suspended',
          createdAt: '2024-01-10T11:00:00Z',
          lastLogin: '2024-01-25T09:15:00Z',
          location: 'Chicago, IL',
          timezone: 'America/Chicago',
          preferences: {
            notifications: false,
            marketing: false,
            newsletter: false
          },
          stats: {
            projects: 1,
            totalSpent: 12000,
            loginCount: 45
          },
          tags: ['payment-issues']
        }
      ];

      setUsers(mockUsers);
      
      analytics.track({
        name: 'admin_users_loaded',
        category: 'admin_action',
        properties: {
          total_users: mockUsers.length
        }
      });

    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...users];

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        user.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Role filter
    if (filters.role !== 'all') {
      filtered = filtered.filter(user => user.role === filters.role);
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(user => user.status === filters.status);
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();
      
      switch (filters.dateRange) {
        case '7d':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          cutoffDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          cutoffDate.setDate(now.getDate() - 90);
          break;
      }
      
      filtered = filtered.filter(user => 
        new Date(user.createdAt) >= cutoffDate
      );
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    const currentPageUsers = getCurrentPageUsers();
    const allSelected = currentPageUsers.every(user => selectedUsers.includes(user.id));
    
    if (allSelected) {
      setSelectedUsers(prev => prev.filter(id => !currentPageUsers.map(u => u.id).includes(id)));
    } else {
      setSelectedUsers(prev => [...new Set([...prev, ...currentPageUsers.map(u => u.id)])]);
    }
  };

  const getCurrentPageUsers = () => {
    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    return filteredUsers.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    return Math.ceil(filteredUsers.length / usersPerPage);
  };

  const handleBulkAction = async (action: string) => {
    try {
      analytics.track({
        name: 'admin_bulk_user_action',
        category: 'admin_action',
        properties: {
          action,
          user_count: selectedUsers.length
        }
      });

      // In production, this would make API calls
      switch (action) {
        case 'activate':
          setUsers(prev => prev.map(user => 
            selectedUsers.includes(user.id) 
              ? { ...user, status: 'active' as const }
              : user
          ));
          break;
        case 'suspend':
          setUsers(prev => prev.map(user => 
            selectedUsers.includes(user.id) 
              ? { ...user, status: 'suspended' as const }
              : user
          ));
          break;
        case 'delete':
          if (confirm(`Are you sure you want to delete ${selectedUsers.length} users?`)) {
            setUsers(prev => prev.filter(user => !selectedUsers.includes(user.id)));
          }
          break;
      }
      
      setSelectedUsers([]);
      setShowBulkActions(false);
    } catch (error) {
      console.error('Bulk action failed:', error);
    }
  };

  const handleUserEdit = (user: User) => {
    setEditingUser(user);
  };

  const handleUserSave = async (updatedUser: User) => {
    try {
      setUsers(prev => prev.map(user => 
        user.id === updatedUser.id ? updatedUser : user
      ));
      setEditingUser(null);
      
      analytics.track({
        name: 'admin_user_updated',
        category: 'admin_action',
        properties: {
          user_id: updatedUser.id,
          role: updatedUser.role
        }
      });
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      case 'suspended': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-purple-600 bg-purple-100';
      case 'developer': return 'text-blue-600 bg-blue-100';
      case 'client': return 'text-green-600 bg-green-100';
      case 'user': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading users...</p>
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                <Users className="w-6 h-6 mr-2" />
                User Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage users, roles, and permissions
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                <UserPlus className="w-4 h-4" />
                <span>Add User</span>
              </button>
              
              <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search users..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Role Filter */}
            <select
              value={filters.role}
              onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="developer">Developer</option>
              <option value="client">Client</option>
              <option value="user">User</option>
            </select>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
            </select>

            {/* Date Range Filter */}
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Time</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>

            {/* Clear Filters */}
            <button
              onClick={() => setFilters({
                role: 'all',
                status: 'all',
                search: '',
                dateRange: 'all',
                location: 'all'
              })}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        <AnimatePresence>
          {selectedUsers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6"
            >
              <div className="flex items-center justify-between">
                <span className="text-blue-800 dark:text-blue-300">
                  {selectedUsers.length} user(s) selected
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleBulkAction('activate')}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    Activate
                  </button>
                  <button
                    onClick={() => handleBulkAction('suspend')}
                    className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                  >
                    Suspend
                  </button>
                  <button
                    onClick={() => handleBulkAction('delete')}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setSelectedUsers([])}
                    className="px-3 py-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Users Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={getCurrentPageUsers().length > 0 && getCurrentPageUsers().every(user => selectedUsers.includes(user.id))}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Projects
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total Spent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {getCurrentPageUsers().map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleUserSelect(user.id)}
                        className="rounded border-gray-300 dark:border-gray-600"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                          ) : (
                            user.name.split(' ').map(n => n[0]).join('')
                          )}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </div>
                          {user.location && (
                            <div className="text-xs text-gray-400 dark:text-gray-500 flex items-center mt-1">
                              <MapPin className="w-3 h-3 mr-1" />
                              {user.location}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      {user.stats.projects}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      {formatCurrency(user.stats.totalSpent)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setShowDetails(user.id)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleUserEdit(user)}
                          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {getTotalPages() > 1 && (
            <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing {(currentPage - 1) * usersPerPage + 1} to {Math.min(currentPage * usersPerPage, filteredUsers.length)} of {filteredUsers.length} users
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Page {currentPage} of {getTotalPages()}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, getTotalPages()))}
                  disabled={currentPage === getTotalPages()}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}