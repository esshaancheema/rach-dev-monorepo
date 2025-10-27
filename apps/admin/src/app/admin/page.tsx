import { 
  UsersIcon, 
  ServerIcon, 
  ChartBarIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">System overview and management tools</p>
        </div>
        <div className="flex space-x-3">
          <button className="btn-secondary">
            Generate Report
          </button>
          <button className="btn-primary">
            System Health Check
          </button>
        </div>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="admin-card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <UsersIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">1,234</p>
              <p className="text-xs text-green-600">+12% from last month</p>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100">
              <ServerIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">System Status</p>
              <p className="text-2xl font-bold text-green-600">Online</p>
              <p className="text-xs text-gray-500">99.9% uptime</p>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100">
              <ChartBarIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">API Requests</p>
              <p className="text-2xl font-bold text-gray-900">45.2k</p>
              <p className="text-xs text-blue-600">Today</p>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-red-100">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Alerts</p>
              <p className="text-2xl font-bold text-red-600">3</p>
              <p className="text-xs text-gray-500">Requires attention</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="admin-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Users</h2>
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Status</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[
                  { name: 'John Doe', email: 'john@example.com', status: 'active', joined: '2 hours ago' },
                  { name: 'Jane Smith', email: 'jane@example.com', status: 'pending', joined: '1 day ago' },
                  { name: 'Bob Johnson', email: 'bob@example.com', status: 'active', joined: '3 days ago' },
                ].map((user, index) => (
                  <tr key={index}>
                    <td>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${
                        user.status === 'active' ? 'status-active' : 'status-pending'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="text-sm text-gray-500">{user.joined}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Alerts */}
        <div className="admin-card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">System Alerts</h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">High Memory Usage</p>
                <p className="text-xs text-red-700">Server memory usage at 85%</p>
                <p className="text-xs text-red-600 mt-1">5 minutes ago</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
              <ClockIcon className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Scheduled Maintenance</p>
                <p className="text-xs text-yellow-700">Database maintenance in 2 hours</p>
                <p className="text-xs text-yellow-600 mt-1">Scheduled</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
              <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800">Backup Completed</p>
                <p className="text-xs text-green-700">Daily backup finished successfully</p>
                <p className="text-xs text-green-600 mt-1">1 hour ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="admin-card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 text-center rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors">
            <UsersIcon className="w-8 h-8 text-primary-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Manage Users</p>
          </button>
          
          <button className="p-4 text-center rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors">
            <ServerIcon className="w-8 h-8 text-primary-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">System Settings</p>
          </button>
          
          <button className="p-4 text-center rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors">
            <ChartBarIcon className="w-8 h-8 text-primary-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Analytics</p>
          </button>
          
          <button className="p-4 text-center rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors">
            <ExclamationTriangleIcon className="w-8 h-8 text-primary-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">View Alerts</p>
          </button>
        </div>
      </div>
    </div>
  );
}