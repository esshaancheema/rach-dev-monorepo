'use client';

import React, { useState } from 'react';
import {
  ServerIcon,
  CpuChipIcon,
  CircleStackIcon,
  CloudIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  PlayIcon,
  StopIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  CommandLineIcon
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

// Mock data for system metrics
const cpuData = [
  { time: '00:00', usage: 45 },
  { time: '04:00', usage: 32 },
  { time: '08:00', usage: 68 },
  { time: '12:00', usage: 75 },
  { time: '16:00', usage: 82 },
  { time: '20:00', usage: 58 },
];

const memoryData = [
  { time: '00:00', used: 6.2, total: 16 },
  { time: '04:00', used: 5.8, total: 16 },
  { time: '08:00', used: 8.4, total: 16 },
  { time: '12:00', used: 9.1, total: 16 },
  { time: '16:00', used: 10.3, total: 16 },
  { time: '20:00', used: 7.9, total: 16 },
];

const services = [
  {
    name: 'API Gateway',
    status: 'running',
    health: 'healthy',
    uptime: '15d 4h 23m',
    version: 'v2.1.4',
    instances: 3,
    cpu: 45,
    memory: 2.1
  },
  {
    name: 'User Service',
    status: 'running',
    health: 'healthy',
    uptime: '15d 4h 23m',
    version: 'v1.8.2',
    instances: 2,
    cpu: 32,
    memory: 1.8
  },
  {
    name: 'Project Service',
    status: 'running',
    health: 'warning',
    uptime: '8d 12h 15m',
    version: 'v2.0.1',
    instances: 4,
    cpu: 78,
    memory: 3.2
  },
  {
    name: 'File Service',
    status: 'running',
    health: 'healthy',
    uptime: '15d 4h 23m',
    version: 'v1.5.3',
    instances: 2,
    cpu: 28,
    memory: 1.5
  },
  {
    name: 'AI Service',
    status: 'stopped',
    health: 'error',
    uptime: '0m',
    version: 'v3.2.1',
    instances: 0,
    cpu: 0,
    memory: 0
  },
  {
    name: 'Notification Service',
    status: 'running',
    health: 'healthy',
    uptime: '15d 4h 23m',
    version: 'v1.2.8',
    instances: 1,
    cpu: 15,
    memory: 0.8
  }
];

const databases = [
  {
    name: 'PostgreSQL Primary',
    type: 'PostgreSQL',
    status: 'running',
    health: 'healthy',
    connections: 45,
    maxConnections: 200,
    size: '24.8 GB',
    uptime: '15d 4h 23m'
  },
  {
    name: 'PostgreSQL Replica',
    type: 'PostgreSQL',
    status: 'running',
    health: 'healthy',
    connections: 23,
    maxConnections: 100,
    size: '24.8 GB',
    uptime: '15d 4h 23m'
  },
  {
    name: 'Redis Cache',
    type: 'Redis',
    status: 'running',
    health: 'warning',
    connections: 128,
    maxConnections: 1000,
    size: '2.1 GB',
    uptime: '15d 4h 23m'
  },
  {
    name: 'MongoDB Logs',
    type: 'MongoDB',
    status: 'running',
    health: 'healthy',
    connections: 12,
    maxConnections: 100,
    size: '8.7 GB',
    uptime: '15d 4h 23m'
  }
];

const systemLogs = [
  {
    timestamp: '2024-01-15 14:32:18',
    level: 'ERROR',
    service: 'AI Service',
    message: 'Service failed to start - connection timeout to ML model endpoint',
    details: 'Error connecting to external ML API after 3 retry attempts'
  },
  {
    timestamp: '2024-01-15 14:28:45',
    level: 'WARN',
    service: 'Project Service',
    message: 'High memory usage detected - 85% of allocated memory in use',
    details: 'Consider scaling up the service or optimizing memory usage'
  },
  {
    timestamp: '2024-01-15 14:25:12',
    level: 'INFO',
    service: 'API Gateway',
    message: 'Health check completed successfully',
    details: 'All endpoints responding within acceptable limits'
  },
  {
    timestamp: '2024-01-15 14:20:33',
    level: 'INFO',
    service: 'Database',
    message: 'Backup completed successfully',
    details: 'Daily backup saved to remote storage - size: 24.8GB'
  },
  {
    timestamp: '2024-01-15 14:15:07',
    level: 'WARN',
    service: 'Redis Cache',
    message: 'Memory usage approaching limit - 78% utilized',
    details: 'Consider increasing memory allocation or implementing cache eviction policies'
  }
];

export default function SystemPage() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const getStatusIcon = (status: string, health?: string) => {
    if (status === 'stopped' || health === 'error') {
      return <XCircleIcon className="w-5 h-5 text-red-500" />;
    } else if (health === 'warning') {
      return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
    } else {
      return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
    }
  };

  const getStatusBadge = (status: string, health?: string) => {
    if (status === 'stopped' || health === 'error') {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Error</span>;
    } else if (health === 'warning') {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Warning</span>;
    } else {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Healthy</span>;
    }
  };

  const getLogLevelBadge = (level: string) => {
    const styles = {
      ERROR: 'bg-red-100 text-red-800',
      WARN: 'bg-yellow-100 text-yellow-800',
      INFO: 'bg-blue-100 text-blue-800',
      DEBUG: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${styles[level as keyof typeof styles]}`}>
        {level}
      </span>
    );
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: ServerIcon },
    { id: 'services', label: 'Services', icon: Cog6ToothIcon },
    { id: 'databases', label: 'Databases', icon: CircleStackIcon },
    { id: 'logs', label: 'System Logs', icon: CommandLineIcon },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Monitoring</h1>
          <p className="text-gray-600">
            Monitor system health, services, and infrastructure
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn-secondary flex items-center space-x-2"
          >
            <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button className="btn-primary">
            System Health Check
          </button>
        </div>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="admin-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">System Status</p>
              <p className="text-2xl font-bold text-green-600">Operational</p>
              <p className="text-xs text-gray-500">99.9% uptime</p>
            </div>
            <div className="p-3 rounded-lg bg-green-100">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Services</p>
              <p className="text-2xl font-bold text-gray-900">
                {services.filter(s => s.status === 'running').length}/{services.length}
              </p>
              <p className="text-xs text-gray-500">Services running</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100">
              <ServerIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">CPU Usage</p>
              <p className="text-2xl font-bold text-gray-900">68%</p>
              <p className="text-xs text-gray-500">Average across nodes</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-100">
              <CpuChipIcon className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Memory Usage</p>
              <p className="text-2xl font-bold text-gray-900">8.4GB</p>
              <p className="text-xs text-gray-500">of 16GB total</p>
            </div>
            <div className="p-3 rounded-lg bg-orange-100">
              <CircleStackIcon className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {selectedTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CPU Usage Chart */}
          <div className="admin-card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">CPU Usage (24h)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={cpuData}>
                <defs>
                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}%`, 'CPU Usage']} />
                <Area
                  type="monotone"
                  dataKey="usage"
                  stroke="#8B5CF6"
                  fillOpacity={1}
                  fill="url(#colorCpu)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Memory Usage Chart */}
          <div className="admin-card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Memory Usage (24h)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={memoryData}>
                <defs>
                  <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} GB`, 'Memory Used']} />
                <Area
                  type="monotone"
                  dataKey="used"
                  stroke="#F59E0B"
                  fillOpacity={1}
                  fill="url(#colorMemory)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {selectedTab === 'services' && (
        <div className="admin-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Microservices Status</h3>
            <div className="flex space-x-2">
              <button className="btn-secondary text-sm">
                <PlayIcon className="w-4 h-4 mr-1" />
                Start All
              </button>
              <button className="btn-secondary text-sm">
                <StopIcon className="w-4 h-4 mr-1" />
                Stop All
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Status</th>
                  <th>Health</th>
                  <th>Version</th>
                  <th>Instances</th>
                  <th>CPU</th>
                  <th>Memory</th>
                  <th>Uptime</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {services.map((service) => (
                  <tr key={service.name} className="hover:bg-gray-50">
                    <td>
                      <div className="flex items-center">
                        {getStatusIcon(service.status, service.health)}
                        <span className="ml-2 font-medium text-gray-900">{service.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`capitalize text-sm ${
                        service.status === 'running' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {service.status}
                      </span>
                    </td>
                    <td>{getStatusBadge(service.status, service.health)}</td>
                    <td className="text-sm text-gray-500">{service.version}</td>
                    <td className="text-sm text-gray-900">{service.instances}</td>
                    <td className="text-sm text-gray-900">{service.cpu}%</td>
                    <td className="text-sm text-gray-900">{service.memory} GB</td>
                    <td className="text-sm text-gray-500">{service.uptime}</td>
                    <td>
                      <div className="flex space-x-2">
                        {service.status === 'running' ? (
                          <button className="p-1 text-red-600 hover:text-red-800">
                            <StopIcon className="w-4 h-4" />
                          </button>
                        ) : (
                          <button className="p-1 text-green-600 hover:text-green-800">
                            <PlayIcon className="w-4 h-4" />
                          </button>
                        )}
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <ArrowPathIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedTab === 'databases' && (
        <div className="admin-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Database Instances</h3>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Database</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Connections</th>
                  <th>Size</th>
                  <th>Uptime</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {databases.map((db) => (
                  <tr key={db.name} className="hover:bg-gray-50">
                    <td>
                      <div className="flex items-center">
                        {getStatusIcon(db.status, db.health)}
                        <span className="ml-2 font-medium text-gray-900">{db.name}</span>
                      </div>
                    </td>
                    <td className="text-sm text-gray-900">{db.type}</td>
                    <td>{getStatusBadge(db.status, db.health)}</td>
                    <td className="text-sm text-gray-900">
                      {db.connections}/{db.maxConnections}
                      <div className="w-16 bg-gray-200 rounded-full h-1 mt-1">
                        <div
                          className="bg-primary-600 h-1 rounded-full"
                          style={{ width: `${(db.connections / db.maxConnections) * 100}%` }}
                        />
                      </div>
                    </td>
                    <td className="text-sm text-gray-900">{db.size}</td>
                    <td className="text-sm text-gray-500">{db.uptime}</td>
                    <td>
                      <div className="flex space-x-2">
                        <button className="p-1 text-gray-400 hover:text-primary-600" title="Backup">
                          <CloudIcon className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-gray-600" title="Restart">
                          <ArrowPathIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedTab === 'logs' && (
        <div className="admin-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">System Logs</h3>
            <div className="flex space-x-2">
              <select className="px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option>All Levels</option>
                <option>ERROR</option>
                <option>WARN</option>
                <option>INFO</option>
                <option>DEBUG</option>
              </select>
              <button className="btn-secondary text-sm">
                Export Logs
              </button>
            </div>
          </div>
          <div className="space-y-3">
            {systemLogs.map((log, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    {getLogLevelBadge(log.level)}
                    <span className="text-sm font-medium text-gray-900">{log.service}</span>
                    <span className="text-xs text-gray-500">{log.timestamp}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-800 mb-2">{log.message}</p>
                <p className="text-xs text-gray-600">{log.details}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}