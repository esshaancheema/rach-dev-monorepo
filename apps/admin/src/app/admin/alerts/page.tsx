'use client';

import React, { useState } from 'react';
import {
  ExclamationTriangleIcon,
  XCircleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  BellIcon,
  BellSlashIcon,
  EyeIcon,
  TrashIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  UserIcon,
  ServerIcon,
  ShieldExclamationIcon
} from '@heroicons/react/24/outline';

interface Alert {
  id: string;
  title: string;
  message: string;
  level: 'critical' | 'warning' | 'info' | 'error';
  category: 'security' | 'performance' | 'system' | 'user' | 'api';
  timestamp: Date;
  source: string;
  status: 'new' | 'acknowledged' | 'resolved' | 'ignored';
  assignedTo?: string;
  metadata?: Record<string, any>;
}

const MOCK_ALERTS: Alert[] = [
  {
    id: '1',
    title: 'High Memory Usage Alert',
    message: 'Project Service memory usage has exceeded 85% threshold',
    level: 'critical',
    category: 'performance',
    timestamp: new Date('2024-01-15T14:32:18'),
    source: 'System Monitor',
    status: 'new',
    metadata: { service: 'project-service', usage: '87%', threshold: '85%' }
  },
  {
    id: '2',
    title: 'Failed Login Attempts',
    message: 'Multiple failed login attempts detected from IP 192.168.1.100',
    level: 'warning',
    category: 'security',
    timestamp: new Date('2024-01-15T14:28:45'),
    source: 'Auth Service',
    status: 'acknowledged',
    assignedTo: 'security-team',
    metadata: { ip: '192.168.1.100', attempts: 15, timeframe: '5 minutes' }
  },
  {
    id: '3',
    title: 'Database Connection Pool Full',
    message: 'PostgreSQL connection pool has reached maximum capacity',
    level: 'error',
    category: 'system',
    timestamp: new Date('2024-01-15T14:25:12'),
    source: 'Database Monitor',
    status: 'resolved',
    metadata: { database: 'postgresql-primary', connections: '200/200' }
  },
  {
    id: '4',
    title: 'API Rate Limit Exceeded',
    message: 'User john@example.com has exceeded API rate limits',
    level: 'warning',
    category: 'api',
    timestamp: new Date('2024-01-15T14:20:33'),
    source: 'API Gateway',
    status: 'new',
    metadata: { userId: 'user-123', requests: 1500, limit: 1000 }
  },
  {
    id: '5',
    title: 'SSL Certificate Expiring',
    message: 'SSL certificate for api.zoptal.com expires in 7 days',
    level: 'warning',
    category: 'security',
    timestamp: new Date('2024-01-15T14:15:07'),
    source: 'Certificate Monitor',
    status: 'new',
    metadata: { domain: 'api.zoptal.com', expiryDate: '2024-01-22' }
  },
  {
    id: '6',
    title: 'Backup Completed Successfully',
    message: 'Daily database backup completed without errors',
    level: 'info',
    category: 'system',
    timestamp: new Date('2024-01-15T14:10:00'),
    source: 'Backup Service',
    status: 'acknowledged',
    metadata: { size: '24.8GB', duration: '45 minutes' }
  }
];

const LEVEL_FILTERS = [
  { value: 'all', label: 'All Levels' },
  { value: 'critical', label: 'Critical' },
  { value: 'error', label: 'Error' },
  { value: 'warning', label: 'Warning' },
  { value: 'info', label: 'Info' },
];

const CATEGORY_FILTERS = [
  { value: 'all', label: 'All Categories' },
  { value: 'security', label: 'Security' },
  { value: 'performance', label: 'Performance' },
  { value: 'system', label: 'System' },
  { value: 'user', label: 'User' },
  { value: 'api', label: 'API' },
];

const STATUS_FILTERS = [
  { value: 'all', label: 'All Status' },
  { value: 'new', label: 'New' },
  { value: 'acknowledged', label: 'Acknowledged' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'ignored', label: 'Ignored' },
];

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAlerts, setSelectedAlerts] = useState<string[]>([]);

  // Filter alerts
  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = !searchQuery || 
      alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.source.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLevel = levelFilter === 'all' || alert.level === levelFilter;
    const matchesCategory = categoryFilter === 'all' || alert.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;
    
    return matchesSearch && matchesLevel && matchesCategory && matchesStatus;
  });

  const handleSelectAlert = (alertId: string) => {
    setSelectedAlerts(prev => 
      prev.includes(alertId) 
        ? prev.filter(id => id !== alertId)
        : [...prev, alertId]
    );
  };

  const handleSelectAll = () => {
    setSelectedAlerts(
      selectedAlerts.length === filteredAlerts.length 
        ? [] 
        : filteredAlerts.map(alert => alert.id)
    );
  };

  const handleBulkAction = (action: 'acknowledge' | 'resolve' | 'ignore' | 'delete') => {
    setAlerts(prev => prev.map(alert => {
      if (selectedAlerts.includes(alert.id)) {
        switch (action) {
          case 'acknowledge':
            return { ...alert, status: 'acknowledged' as const };
          case 'resolve':
            return { ...alert, status: 'resolved' as const };
          case 'ignore':
            return { ...alert, status: 'ignored' as const };
          case 'delete':
            return alert; // Would actually remove from array
          default:
            return alert;
        }
      }
      return alert;
    }));
    setSelectedAlerts([]);
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'critical':
        return <XCircleIcon className="w-5 h-5 text-red-600" />;
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <InformationCircleIcon className="w-5 h-5 text-blue-500" />;
      default:
        return <InformationCircleIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getLevelBadge = (level: string) => {
    const styles = {
      critical: 'bg-red-100 text-red-800 border-red-200',
      error: 'bg-red-100 text-red-800 border-red-200',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      info: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[level as keyof typeof styles]}`}>
        {level.charAt(0).toUpperCase() + level.slice(1)}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      new: 'bg-gray-100 text-gray-800',
      acknowledged: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      ignored: 'bg-gray-100 text-gray-600'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'security':
        return <ShieldExclamationIcon className="w-4 h-4" />;
      case 'performance':
      case 'system':
        return <ServerIcon className="w-4 h-4" />;
      case 'user':
        return <UserIcon className="w-4 h-4" />;
      case 'api':
        return <ServerIcon className="w-4 h-4" />;
      default:
        return <InformationCircleIcon className="w-4 h-4" />;
    }
  };

  const alertCounts = {
    total: alerts.length,
    new: alerts.filter(a => a.status === 'new').length,
    critical: alerts.filter(a => a.level === 'critical' && a.status !== 'resolved').length,
    unresolved: alerts.filter(a => a.status !== 'resolved').length
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Alerts</h1>
          <p className="text-gray-600">
            Monitor and manage system alerts and notifications
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="btn-secondary">
            <BellSlashIcon className="w-4 h-4 mr-2" />
            Mute All
          </button>
          <button className="btn-primary">
            Alert Rules
          </button>
        </div>
      </div>

      {/* Alert Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="admin-card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-gray-100">
              <BellIcon className="w-6 h-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Alerts</p>
              <p className="text-2xl font-bold text-gray-900">{alertCounts.total}</p>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <InformationCircleIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">New Alerts</p>
              <p className="text-2xl font-bold text-gray-900">{alertCounts.new}</p>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-red-100">
              <XCircleIcon className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Critical</p>
              <p className="text-2xl font-bold text-gray-900">{alertCounts.critical}</p>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-100">
              <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Unresolved</p>
              <p className="text-2xl font-bold text-gray-900">{alertCounts.unresolved}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="admin-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search alerts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-3 py-2 border rounded-md transition-colors ${
                showFilters 
                  ? 'border-primary-500 bg-primary-50 text-primary-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FunnelIcon className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>

          {/* Bulk Actions */}
          {selectedAlerts.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {selectedAlerts.length} selected
              </span>
              <button
                onClick={() => handleBulkAction('acknowledge')}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Acknowledge
              </button>
              <button
                onClick={() => handleBulkAction('resolve')}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
              >
                Resolve
              </button>
              <button
                onClick={() => handleBulkAction('ignore')}
                className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Ignore
              </button>
            </div>
          )}
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {LEVEL_FILTERS.map(filter => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {CATEGORY_FILTERS.map(filter => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {STATUS_FILTERS.map(filter => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Alerts List */}
        <div className="space-y-3">
          {filteredAlerts.length > 0 ? (
            filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`border rounded-lg p-4 transition-colors ${
                  alert.status === 'new' ? 'border-l-4 border-l-red-500 bg-red-50' :
                  alert.level === 'critical' ? 'border-l-4 border-l-red-400 bg-red-25' :
                  'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedAlerts.includes(alert.id)}
                      onChange={() => handleSelectAlert(alert.id)}
                      className="mt-1 rounded border-gray-300"
                    />
                    
                    <div className="flex-shrink-0 mt-1">
                      {getLevelIcon(alert.level)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-sm font-medium text-gray-900">{alert.title}</h3>
                        {getLevelBadge(alert.level)}
                        <div className="flex items-center text-xs text-gray-500">
                          {getCategoryIcon(alert.category)}
                          <span className="ml-1 capitalize">{alert.category}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-2">{alert.message}</p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center">
                          <ClockIcon className="w-3 h-3 mr-1" />
                          {alert.timestamp.toLocaleString()}
                        </div>
                        <div>Source: {alert.source}</div>
                        {alert.assignedTo && (
                          <div>Assigned to: {alert.assignedTo}</div>
                        )}
                      </div>
                      
                      {alert.metadata && (
                        <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                          <strong>Details:</strong>
                          <pre className="mt-1 text-gray-600">
                            {JSON.stringify(alert.metadata, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {getStatusBadge(alert.status)}
                    <div className="flex space-x-1">
                      <button
                        onClick={() => {
                          const newStatus = alert.status === 'acknowledged' ? 'new' : 'acknowledged';
                          setAlerts(prev => prev.map(a => 
                            a.id === alert.id ? { ...a, status: newStatus as any } : a
                          ));
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600"
                        title={alert.status === 'acknowledged' ? 'Unacknowledge' : 'Acknowledge'}
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setAlerts(prev => prev.map(a => 
                            a.id === alert.id ? { ...a, status: 'resolved' as any } : a
                          ));
                        }}
                        className="p-1 text-gray-400 hover:text-green-600"
                        title="Resolve"
                      >
                        <CheckCircleIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setAlerts(prev => prev.filter(a => a.id !== alert.id));
                        }}
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="Delete"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <BellIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No alerts found</h3>
              <p className="text-gray-500">
                {searchQuery || levelFilter !== 'all' || categoryFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your search terms or filters'
                  : 'All quiet! No active alerts at the moment.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}