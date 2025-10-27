'use client';

import React, { useState } from 'react';
import {
  ChartBarIcon,
  UsersIcon,
  CursorArrowRaysIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Mock data for charts
const userGrowthData = [
  { month: 'Jan', users: 1200, activeUsers: 980, newUsers: 150 },
  { month: 'Feb', users: 1350, activeUsers: 1100, newUsers: 180 },
  { month: 'Mar', users: 1520, activeUsers: 1250, newUsers: 220 },
  { month: 'Apr', users: 1680, activeUsers: 1380, newUsers: 160 },
  { month: 'May', users: 1890, activeUsers: 1520, newUsers: 210 },
  { month: 'Jun', users: 2100, activeUsers: 1720, newUsers: 280 },
];

const deviceData = [
  { name: 'Desktop', value: 45, count: 2340 },
  { name: 'Mobile', value: 35, count: 1820 },
  { name: 'Tablet', value: 20, count: 1040 },
];

const geographyData = [
  { country: 'United States', users: 3420, percentage: 35.2 },
  { country: 'United Kingdom', users: 2180, percentage: 22.4 },
  { country: 'Germany', users: 1560, percentage: 16.1 },
  { country: 'France', users: 1240, percentage: 12.8 },
  { country: 'Canada', users: 890, percentage: 9.2 },
  { country: 'Others', users: 410, percentage: 4.3 },
];

const apiUsageData = [
  { time: '00:00', requests: 1200, errors: 12 },
  { time: '04:00', requests: 800, errors: 5 },
  { time: '08:00', requests: 2400, errors: 18 },
  { time: '12:00', requests: 3200, errors: 25 },
  { time: '16:00', requests: 2800, errors: 22 },
  { time: '20:00', requests: 1800, errors: 8 },
];

const performanceData = [
  { metric: 'Response Time', value: '245ms', change: -12, trend: 'up' },
  { metric: 'Error Rate', value: '0.8%', change: -0.2, trend: 'up' },
  { metric: 'Uptime', value: '99.9%', change: 0.1, trend: 'up' },
  { metric: 'CPU Usage', value: '65%', change: 5, trend: 'down' },
];

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('users');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">
            Comprehensive insights into platform usage and performance
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <button className="btn-secondary">
            <CalendarIcon className="w-4 h-4 mr-2" />
            Custom Range
          </button>
          <button className="btn-primary">
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="admin-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">12,543</p>
              <div className="flex items-center mt-1">
                <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+15.3%</span>
                <span className="text-sm text-gray-500 ml-1">vs last month</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-blue-100">
              <UsersIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Sessions</p>
              <p className="text-2xl font-bold text-gray-900">3,247</p>
              <div className="flex items-center mt-1">
                <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+8.7%</span>
                <span className="text-sm text-gray-500 ml-1">vs yesterday</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-green-100">
              <CursorArrowRaysIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">API Requests</p>
              <p className="text-2xl font-bold text-gray-900">89.2k</p>
              <div className="flex items-center mt-1">
                <ArrowTrendingDownIcon className="w-4 h-4 text-red-500 mr-1" />
                <span className="text-sm text-red-600">-3.2%</span>
                <span className="text-sm text-gray-500 ml-1">vs yesterday</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-purple-100">
              <ChartBarIcon className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Session</p>
              <p className="text-2xl font-bold text-gray-900">12m 34s</p>
              <div className="flex items-center mt-1">
                <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+2.1%</span>
                <span className="text-sm text-gray-500 ml-1">vs last week</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-orange-100">
              <ClockIcon className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="admin-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">User Growth</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedMetric('users')}
                className={`px-3 py-1 text-sm rounded ${
                  selectedMetric === 'users' 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Total Users
              </button>
              <button
                onClick={() => setSelectedMetric('active')}
                className={`px-3 py-1 text-sm rounded ${
                  selectedMetric === 'active' 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Active Users
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={userGrowthData}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey={selectedMetric === 'users' ? 'users' : 'activeUsers'}
                stroke="#3B82F6"
                fillOpacity={1}
                fill="url(#colorUsers)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Device Distribution */}
        <div className="admin-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Distribution</h3>
          <div className="flex items-center">
            <ResponsiveContainer width="60%" height={200}>
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {deviceData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: COLORS[index] }}
                    />
                    <span className="text-sm text-gray-900">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{item.value}%</div>
                    <div className="text-xs text-gray-500">{item.count.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* API Usage */}
        <div className="admin-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">API Usage (24h)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={apiUsageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="requests"
                stroke="#3B82F6"
                strokeWidth={2}
                name="Requests"
              />
              <Line
                type="monotone"
                dataKey="errors"
                stroke="#EF4444"
                strokeWidth={2}
                name="Errors"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Geographic Distribution */}
        <div className="admin-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Geographic Distribution</h3>
          <div className="space-y-3">
            {geographyData.map((country, index) => (
              <div key={country.country} className="flex items-center justify-between">
                <div className="flex items-center">
                  <GlobeAltIcon className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-900">{country.country}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${country.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-12 text-right">
                    {country.percentage}%
                  </span>
                  <span className="text-sm text-gray-500 w-16 text-right">
                    {country.users.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="admin-card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {performanceData.map((metric) => (
            <div key={metric.metric} className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-600 mb-1">{metric.metric}</p>
              <p className="text-2xl font-bold text-gray-900 mb-2">{metric.value}</p>
              <div className="flex items-center justify-center">
                {metric.trend === 'up' ? (
                  <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <ArrowTrendingDownIcon className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm ${
                  metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.change > 0 ? '+' : ''}{metric.change}
                  {metric.metric === 'Response Time' ? 'ms' : 
                   metric.metric === 'Error Rate' ? '%' : 
                   metric.metric === 'Uptime' ? '%' : '%'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Real-time Activity */}
      <div className="admin-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Real-time Activity</h3>
          <div className="flex items-center text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
            Live
          </div>
        </div>
        <div className="space-y-3">
          {[
            { user: 'john@example.com', action: 'Created new project', time: '2 seconds ago' },
            { user: 'jane@company.com', action: 'Updated user profile', time: '15 seconds ago' },
            { user: 'bob@startup.io', action: 'API request completed', time: '32 seconds ago' },
            { user: 'alice@freelance.dev', action: 'Logged in from mobile', time: '1 minute ago' },
            { user: 'mike@agency.com', action: 'Generated AI content', time: '2 minutes ago' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-xs font-medium text-primary-600">
                    {activity.user.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                  <p className="text-xs text-gray-500">{activity.action}</p>
                </div>
              </div>
              <span className="text-xs text-gray-400">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}