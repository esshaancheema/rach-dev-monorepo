'use client';

import { 
  BellIcon, 
  Bars3Icon, 
  MagnifyingGlassIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function AdminHeader() {
  const [showAlerts, setShowAlerts] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Mobile menu button */}
        <button className="md:hidden p-2">
          <Bars3Icon className="w-6 h-6" />
        </button>

        {/* Search bar */}
        <div className="flex-1 max-w-lg mx-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users, logs, or system events..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          {/* System Status */}
          <div className="hidden sm:flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">System Online</span>
          </div>

          {/* Alerts */}
          <div className="relative">
            <button
              onClick={() => setShowAlerts(!showAlerts)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative"
            >
              <BellIcon className="w-6 h-6" />
              <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500"></span>
            </button>

            {/* Alerts dropdown */}
            {showAlerts && (
              <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900">System Alerts</h3>
                </div>
                <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
                  <div className="flex items-start space-x-3 p-2 bg-red-50 rounded">
                    <ExclamationTriangleIcon className="w-4 h-4 text-red-600 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-red-800">High Memory Usage</p>
                      <p className="text-xs text-red-700">Server memory at 85%</p>
                      <p className="text-xs text-gray-500">5 minutes ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-2 bg-yellow-50 rounded">
                    <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">API Rate Limit</p>
                      <p className="text-xs text-yellow-700">User exceeded rate limit</p>
                      <p className="text-xs text-gray-500">10 minutes ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-2 bg-orange-50 rounded">
                    <ExclamationTriangleIcon className="w-4 h-4 text-orange-600 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-orange-800">Disk Space Warning</p>
                      <p className="text-xs text-orange-700">Storage at 75% capacity</p>
                      <p className="text-xs text-gray-500">1 hour ago</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t border-gray-200">
                  <button className="text-sm text-primary-600 hover:text-primary-700">
                    View all alerts
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Admin Profile */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">A</span>
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-900">Admin</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}