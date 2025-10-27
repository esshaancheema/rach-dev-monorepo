'use client';

import React, { useState } from 'react';
import {
  CogIcon,
  BellIcon,
  ShieldCheckIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  CircleStackIcon,
  KeyIcon,
  CloudIcon,
  UserGroupIcon,
  CheckIcon,
  XMarkIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface SystemSettings {
  general: {
    siteName: string;
    siteUrl: string;
    adminEmail: string;
    timezone: string;
    language: string;
    maintenanceMode: boolean;
    debugMode: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    slackIntegration: boolean;
    slackWebhookUrl: string;
    alertThresholds: {
      cpuUsage: number;
      memoryUsage: number;
      diskUsage: number;
      errorRate: number;
    };
  };
  security: {
    twoFactorRequired: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireNumbers: boolean;
      requireSymbols: boolean;
    };
    ipWhitelist: string[];
  };
  database: {
    backupEnabled: boolean;
    backupRetention: number;
    backupSchedule: string;
    connectionPoolSize: number;
    queryTimeout: number;
  };
  api: {
    rateLimitEnabled: boolean;
    defaultRateLimit: number;
    corsEnabled: boolean;
    allowedOrigins: string[];
    apiKeyRequired: boolean;
  };
  storage: {
    provider: 'local' | 'aws' | 'gcp' | 'azure';
    maxFileSize: number;
    allowedFileTypes: string[];
    compressionEnabled: boolean;
  };
}

const DEFAULT_SETTINGS: SystemSettings = {
  general: {
    siteName: 'Zoptal Platform',
    siteUrl: 'https://zoptal.com',
    adminEmail: 'admin@zoptal.com',
    timezone: 'UTC',
    language: 'en',
    maintenanceMode: false,
    debugMode: false,
  },
  notifications: {
    emailNotifications: true,
    slackIntegration: false,
    slackWebhookUrl: '',
    alertThresholds: {
      cpuUsage: 80,
      memoryUsage: 85,
      diskUsage: 90,
      errorRate: 5,
    }
  },
  security: {
    twoFactorRequired: true,
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireNumbers: true,
      requireSymbols: true,
    },
    ipWhitelist: [],
  },
  database: {
    backupEnabled: true,
    backupRetention: 30,
    backupSchedule: '0 2 * * *',
    connectionPoolSize: 20,
    queryTimeout: 30,
  },
  api: {
    rateLimitEnabled: true,
    defaultRateLimit: 1000,
    corsEnabled: true,
    allowedOrigins: ['https://zoptal.com'],
    apiKeyRequired: true,
  },
  storage: {
    provider: 'local',
    maxFileSize: 100,
    allowedFileTypes: ['jpg', 'png', 'pdf', 'doc', 'docx'],
    compressionEnabled: true,
  }
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState('general');
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSettingChange = (section: keyof SystemSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const handleNestedSettingChange = (section: keyof SystemSettings, nested: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [nested]: {
          ...(prev[section] as any)[nested],
          [key]: value
        }
      }
    }));
    setHasChanges(true);
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setHasChanges(false);
    setSaving(false);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: CogIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
    { id: 'security', label: 'Security', icon: ShieldCheckIcon },
    { id: 'database', label: 'Database', icon: CircleStackIcon },
    { id: 'api', label: 'API', icon: GlobeAltIcon },
    { id: 'storage', label: 'Storage', icon: CloudIcon },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600">
            Configure system-wide settings and preferences
          </p>
        </div>
        <div className="flex space-x-3">
          {hasChanges && (
            <div className="flex items-center text-amber-600 text-sm">
              <InformationCircleIcon className="w-4 h-4 mr-1" />
              Unsaved changes
            </div>
          )}
          <button
            onClick={handleSaveSettings}
            disabled={!hasChanges || saving}
            className="btn-primary disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
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
      <div className="admin-card">
        {activeTab === 'general' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">General Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site Name
                </label>
                <input
                  type="text"
                  value={settings.general.siteName}
                  onChange={(e) => handleSettingChange('general', 'siteName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site URL
                </label>
                <input
                  type="url"
                  value={settings.general.siteUrl}
                  onChange={(e) => handleSettingChange('general', 'siteUrl', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Email
                </label>
                <input
                  type="email"
                  value={settings.general.adminEmail}
                  onChange={(e) => handleSettingChange('general', 'adminEmail', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timezone
                </label>
                <select
                  value={settings.general.timezone}
                  onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">London</option>
                  <option value="Asia/Tokyo">Tokyo</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Maintenance Mode</h4>
                  <p className="text-sm text-gray-500">Temporarily disable public access to the site</p>
                </div>
                <button
                  onClick={() => handleSettingChange('general', 'maintenanceMode', !settings.general.maintenanceMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.general.maintenanceMode ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.general.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Debug Mode</h4>
                  <p className="text-sm text-gray-500">Enable detailed error logging and debugging</p>
                </div>
                <button
                  onClick={() => handleSettingChange('general', 'debugMode', !settings.general.debugMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.general.debugMode ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.general.debugMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                  <p className="text-sm text-gray-500">Send system alerts via email</p>
                </div>
                <button
                  onClick={() => handleSettingChange('notifications', 'emailNotifications', !settings.notifications.emailNotifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.notifications.emailNotifications ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.notifications.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Slack Integration</h4>
                  <p className="text-sm text-gray-500">Send alerts to Slack channels</p>
                </div>
                <button
                  onClick={() => handleSettingChange('notifications', 'slackIntegration', !settings.notifications.slackIntegration)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.notifications.slackIntegration ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.notifications.slackIntegration ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {settings.notifications.slackIntegration && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slack Webhook URL
                </label>
                <input
                  type="url"
                  value={settings.notifications.slackWebhookUrl}
                  onChange={(e) => handleSettingChange('notifications', 'slackWebhookUrl', e.target.value)}
                  placeholder="https://hooks.slack.com/services/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            )}

            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-4">Alert Thresholds</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CPU Usage (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={settings.notifications.alertThresholds.cpuUsage}
                    onChange={(e) => handleNestedSettingChange('notifications', 'alertThresholds', 'cpuUsage', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Memory Usage (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={settings.notifications.alertThresholds.memoryUsage}
                    onChange={(e) => handleNestedSettingChange('notifications', 'alertThresholds', 'memoryUsage', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Disk Usage (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={settings.notifications.alertThresholds.diskUsage}
                    onChange={(e) => handleNestedSettingChange('notifications', 'alertThresholds', 'diskUsage', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Error Rate (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={settings.notifications.alertThresholds.errorRate}
                    onChange={(e) => handleNestedSettingChange('notifications', 'alertThresholds', 'errorRate', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Require Two-Factor Authentication</h4>
                  <p className="text-sm text-gray-500">Enforce 2FA for all admin users</p>
                </div>
                <button
                  onClick={() => handleSettingChange('security', 'twoFactorRequired', !settings.security.twoFactorRequired)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.security.twoFactorRequired ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.security.twoFactorRequired ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="1440"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Login Attempts
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={settings.security.maxLoginAttempts}
                  onChange={(e) => handleSettingChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-4">Password Policy</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Length
                  </label>
                  <input
                    type="number"
                    min="6"
                    max="128"
                    value={settings.security.passwordPolicy.minLength}
                    onChange={(e) => handleNestedSettingChange('security', 'passwordPolicy', 'minLength', parseInt(e.target.value))}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="space-y-2">
                  {[
                    { key: 'requireUppercase', label: 'Require uppercase letters' },
                    { key: 'requireNumbers', label: 'Require numbers' },
                    { key: 'requireSymbols', label: 'Require symbols' }
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        id={key}
                        checked={(settings.security.passwordPolicy as any)[key]}
                        onChange={(e) => handleNestedSettingChange('security', 'passwordPolicy', key, e.target.checked)}
                        className="h-4 w-4 text-primary-600 rounded border-gray-300"
                      />
                      <label htmlFor={key} className="ml-2 text-sm text-gray-700">
                        {label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'database' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Database Settings</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Automated Backups</h4>
                  <p className="text-sm text-gray-500">Enable scheduled database backups</p>
                </div>
                <button
                  onClick={() => handleSettingChange('database', 'backupEnabled', !settings.database.backupEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.database.backupEnabled ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.database.backupEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {settings.database.backupEnabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Backup Retention (days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={settings.database.backupRetention}
                    onChange={(e) => handleSettingChange('database', 'backupRetention', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Backup Schedule (Cron)
                  </label>
                  <input
                    type="text"
                    value={settings.database.backupSchedule}
                    onChange={(e) => handleSettingChange('database', 'backupSchedule', e.target.value)}
                    placeholder="0 2 * * *"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Daily at 2:00 AM</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Connection Pool Size
                </label>
                <input
                  type="number"
                  min="5"
                  max="100"
                  value={settings.database.connectionPoolSize}
                  onChange={(e) => handleSettingChange('database', 'connectionPoolSize', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Query Timeout (seconds)
                </label>
                <input
                  type="number"
                  min="5"
                  max="300"
                  value={settings.database.queryTimeout}
                  onChange={(e) => handleSettingChange('database', 'queryTimeout', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'api' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">API Settings</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Rate Limiting</h4>
                  <p className="text-sm text-gray-500">Enable API rate limiting</p>
                </div>
                <button
                  onClick={() => handleSettingChange('api', 'rateLimitEnabled', !settings.api.rateLimitEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.api.rateLimitEnabled ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.api.rateLimitEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">CORS Enabled</h4>
                  <p className="text-sm text-gray-500">Allow cross-origin requests</p>
                </div>
                <button
                  onClick={() => handleSettingChange('api', 'corsEnabled', !settings.api.corsEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.api.corsEnabled ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.api.corsEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">API Key Required</h4>
                  <p className="text-sm text-gray-500">Require API keys for all requests</p>
                </div>
                <button
                  onClick={() => handleSettingChange('api', 'apiKeyRequired', !settings.api.apiKeyRequired)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.api.apiKeyRequired ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.api.apiKeyRequired ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {settings.api.rateLimitEnabled && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Rate Limit (requests/hour)
                </label>
                <input
                  type="number"
                  min="100"
                  max="10000"
                  value={settings.api.defaultRateLimit}
                  onChange={(e) => handleSettingChange('api', 'defaultRateLimit', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Allowed Origins (one per line)
              </label>
              <textarea
                rows={4}
                value={settings.api.allowedOrigins.join('\n')}
                onChange={(e) => handleSettingChange('api', 'allowedOrigins', e.target.value.split('\n').filter(Boolean))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="https://example.com&#10;https://app.example.com"
              />
            </div>
          </div>
        )}

        {activeTab === 'storage' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Storage Settings</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Storage Provider
              </label>
              <select
                value={settings.storage.provider}
                onChange={(e) => handleSettingChange('storage', 'provider', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="local">Local Storage</option>
                <option value="aws">Amazon S3</option>
                <option value="gcp">Google Cloud Storage</option>
                <option value="azure">Azure Blob Storage</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum File Size (MB)
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                value={settings.storage.maxFileSize}
                onChange={(e) => handleSettingChange('storage', 'maxFileSize', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Allowed File Types
              </label>
              <input
                type="text"
                value={settings.storage.allowedFileTypes.join(', ')}
                onChange={(e) => handleSettingChange('storage', 'allowedFileTypes', e.target.value.split(',').map(s => s.trim()))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="jpg, png, pdf, doc, docx"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Compression Enabled</h4>
                <p className="text-sm text-gray-500">Automatically compress uploaded files</p>
              </div>
              <button
                onClick={() => handleSettingChange('storage', 'compressionEnabled', !settings.storage.compressionEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.storage.compressionEnabled ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.storage.compressionEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}