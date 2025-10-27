'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheckIcon,
  KeyIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  GlobeAltIcon,
  LockClosedIcon,
  UserGroupIcon,
  CogIcon,
  ChartBarIcon,
  BellIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import {
  EnterpriseAuthService,
  User,
  SSOProvider,
  MFAMethod,
  AuthSession,
  SecurityPolicy,
  AuditLog,
  LoginAttempt
} from '@/lib/enterprise/auth-service';

interface SecurityDashboardProps {
  organizationId: string;
  currentUserId: string;
  className?: string;
}

type SecurityView = 'overview' | 'sso' | 'mfa' | 'sessions' | 'policies' | 'audit' | 'monitoring';

export default function SecurityDashboard({
  organizationId,
  currentUserId,
  className
}: SecurityDashboardProps) {
  const [authService] = useState(() => new EnterpriseAuthService());
  const [activeView, setActiveView] = useState<SecurityView>('overview');
  
  // State
  const [ssoProviders, setSsoProviders] = useState<SSOProvider[]>([]);
  const [securityPolicy, setSecurityPolicy] = useState<SecurityPolicy | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([]);
  const [activeSessions, setActiveSessions] = useState<AuthSession[]>([]);
  const [securityMetrics, setSecurityMetrics] = useState({
    totalUsers: 0,
    mfaEnabled: 0,
    ssoUsers: 0,
    failedLogins: 0,
    activeSessions: 0,
    securityAlerts: 0
  });
  
  // UI State
  const [isLoading, setIsLoading] = useState(true);
  const [showSSOConfig, setShowSSOConfig] = useState(false);
  const [editingProvider, setEditingProvider] = useState<SSOProvider | null>(null);
  const [selectedSession, setSelectedSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    loadSecurityData();
  }, [organizationId]);

  const loadSecurityData = async () => {
    setIsLoading(true);
    try {
      const [providers, policy, logs, attempts] = await Promise.all([
        authService.getSSOProviders(organizationId),
        authService.getSecurityPolicy(organizationId),
        authService.getAuditLogs(organizationId, { limit: 50 }),
        authService.getLoginAttempts(organizationId, 100)
      ]);

      setSsoProviders(providers);
      setSecurityPolicy(policy);
      setAuditLogs(logs);
      setLoginAttempts(attempts);

      // Calculate metrics
      const failedLogins = attempts.filter(a => !a.success).length;
      const recentFailures = attempts.filter(a => 
        !a.success && a.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000)
      ).length;

      setSecurityMetrics({
        totalUsers: 50, // Mock data
        mfaEnabled: 35,
        ssoUsers: 42,
        failedLogins: recentFailures,
        activeSessions: 127,
        securityAlerts: recentFailures > 10 ? 1 : 0
      });

    } catch (error) {
      console.error('Failed to load security data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSecurityPolicy = async (updates: Partial<SecurityPolicy>) => {
    try {
      const updated = await authService.updateSecurityPolicy(organizationId, updates);
      setSecurityPolicy(updated);
    } catch (error) {
      console.error('Failed to update security policy:', error);
    }
  };

  const handleCreateSSOProvider = async (providerData: Partial<SSOProvider>) => {
    try {
      const provider = await authService.createSSOProvider(organizationId, providerData);
      setSsoProviders(prev => [...prev, provider]);
      setShowSSOConfig(false);
    } catch (error) {
      console.error('Failed to create SSO provider:', error);
    }
  };

  const getStatusColor = (status: boolean) => {
    return status ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
  };

  const getSeverityColor = (severity: 'low' | 'medium' | 'high' | 'critical') => {
    switch (severity) {
      case 'low': return 'text-blue-600 bg-blue-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('login')) return <LockClosedIcon className="h-4 w-4" />;
    if (action.includes('sso')) return <KeyIcon className="h-4 w-4" />;
    if (action.includes('mfa')) return <ShieldCheckIcon className="h-4 w-4" />;
    if (action.includes('session')) return <ComputerDesktopIcon className="h-4 w-4" />;
    if (action.includes('policy')) return <CogIcon className="h-4 w-4" />;
    return <InformationCircleIcon className="h-4 w-4" />;
  };

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: ChartBarIcon, alerts: securityMetrics.securityAlerts },
    { id: 'sso', label: 'SSO Providers', icon: KeyIcon, count: ssoProviders.length },
    { id: 'mfa', label: 'Multi-Factor Auth', icon: ShieldCheckIcon },
    { id: 'sessions', label: 'Active Sessions', icon: ComputerDesktopIcon, count: securityMetrics.activeSessions },
    { id: 'policies', label: 'Security Policies', icon: LockClosedIcon },
    { id: 'audit', label: 'Audit Logs', icon: DocumentTextIcon },
    { id: 'monitoring', label: 'Security Monitoring', icon: BellIcon, alerts: securityMetrics.failedLogins }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading security data...</span>
      </div>
    );
  }

  return (
    <div className={cn("bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden", className)}>
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <ShieldCheckIcon className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Security Center</h1>
              <p className="text-red-100">Enterprise authentication and security management</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {securityMetrics.securityAlerts > 0 && (
              <div className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                {securityMetrics.securityAlerts} Alert{securityMetrics.securityAlerts !== 1 ? 's' : ''}
              </div>
            )}
            <button
              onClick={loadSecurityData}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <ArrowPathIcon className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Quick Metrics */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mt-6">
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <div className="text-lg font-bold">{securityMetrics.totalUsers}</div>
            <div className="text-xs text-red-100">Total Users</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <div className="text-lg font-bold">{securityMetrics.mfaEnabled}</div>
            <div className="text-xs text-red-100">MFA Enabled</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <div className="text-lg font-bold">{securityMetrics.ssoUsers}</div>
            <div className="text-xs text-red-100">SSO Users</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <div className="text-lg font-bold">{securityMetrics.failedLogins}</div>
            <div className="text-xs text-red-100">Failed Logins (24h)</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <div className="text-lg font-bold">{securityMetrics.activeSessions}</div>
            <div className="text-xs text-red-100">Active Sessions</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <div className="text-lg font-bold">99.9%</div>
            <div className="text-xs text-red-100">Uptime</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6 overflow-x-auto">
          {navigationItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as SecurityView)}
              className={cn(
                "flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap",
                activeView === item.id
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
              {(item.count !== undefined && item.count > 0) && (
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                  {item.count}
                </span>
              )}
              {(item.alerts !== undefined && item.alerts > 0) && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {item.alerts}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Overview */}
        {activeView === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Security Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">SSO Configuration</h3>
                    <p className="text-green-100 text-sm">{ssoProviders.length} provider{ssoProviders.length !== 1 ? 's' : ''} configured</p>
                  </div>
                  <KeyIcon className="h-8 w-8 text-green-200" />
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-bold">{ssoProviders.filter(p => p.enabled).length}</div>
                  <div className="text-green-100 text-sm">Active Providers</div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">MFA Adoption</h3>
                    <p className="text-blue-100 text-sm">Multi-factor authentication</p>
                  </div>
                  <ShieldCheckIcon className="h-8 w-8 text-blue-200" />
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-bold">{Math.round((securityMetrics.mfaEnabled / securityMetrics.totalUsers) * 100)}%</div>
                  <div className="text-blue-100 text-sm">{securityMetrics.mfaEnabled} of {securityMetrics.totalUsers} users</div>
                </div>
              </div>

              <div className={cn(
                "rounded-lg p-6 text-white",
                securityMetrics.failedLogins > 10 
                  ? "bg-gradient-to-r from-red-500 to-red-600"
                  : "bg-gradient-to-r from-gray-500 to-gray-600"
              )}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Security Threats</h3>
                    <p className="text-gray-100 text-sm">Failed login attempts</p>
                  </div>
                  <ExclamationTriangleIcon className="h-8 w-8 text-gray-200" />
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-bold">{securityMetrics.failedLogins}</div>
                  <div className="text-gray-100 text-sm">Last 24 hours</div>
                </div>
              </div>
            </div>

            {/* Recent Security Events */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Security Events</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-3">
                  {auditLogs.slice(0, 5).map(log => (
                    <div key={log.id} className="flex items-start space-x-3">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        log.success ? "bg-green-100" : "bg-red-100"
                      )}>
                        {getActionIcon(log.action)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">{log.action.replace('_', ' ')}</span>
                          {log.userId && <span className="text-gray-600"> by {log.userId}</span>}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>{log.timestamp.toLocaleString()}</span>
                          <span>{log.ipAddress}</span>
                          <span className={cn(
                            "px-2 py-0.5 rounded-full",
                            log.success ? "text-green-600 bg-green-100" : "text-red-600 bg-red-100"
                          )}>
                            {log.success ? 'Success' : 'Failed'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* SSO Providers */}
        {activeView === 'sso' && (
          <motion.div
            key="sso"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">SSO Providers</h3>
                <p className="text-gray-600">Configure single sign-on authentication providers</p>
              </div>
              <button
                onClick={() => setShowSSOConfig(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Add Provider</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ssoProviders.map(provider => (
                <div key={provider.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        provider.enabled ? "bg-green-100" : "bg-gray-100"
                      )}>
                        <KeyIcon className={cn(
                          "h-5 w-5",
                          provider.enabled ? "text-green-600" : "text-gray-400"
                        )} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{provider.name}</h4>
                        <p className="text-sm text-gray-500 uppercase">{provider.type}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={cn(
                        "px-2 py-1 text-xs font-medium rounded-full",
                        getStatusColor(provider.enabled)
                      )}>
                        {provider.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                      <button
                        onClick={() => setEditingProvider(provider)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="text-sm">
                      <span className="text-gray-500">Created:</span>
                      <span className="ml-2 text-gray-900">{provider.createdAt.toLocaleDateString()}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Last Updated:</span>
                      <span className="ml-2 text-gray-900">{provider.updatedAt.toLocaleDateString()}</span>
                    </div>
                    
                    {provider.type === 'saml' && provider.config.saml && (
                      <div className="text-sm">
                        <span className="text-gray-500">Entry Point:</span>
                        <span className="ml-2 text-gray-900 break-all">{provider.config.saml.entryPoint}</span>
                      </div>
                    )}
                    
                    {provider.type === 'oidc' && provider.config.oidc && (
                      <div className="text-sm">
                        <span className="text-gray-500">Issuer:</span>
                        <span className="ml-2 text-gray-900 break-all">{provider.config.oidc.issuer}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors">
                      Test Connection
                    </button>
                  </div>
                </div>
              ))}

              {ssoProviders.length === 0 && (
                <div className="col-span-2 text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                  <KeyIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No SSO Providers</h3>
                  <p className="text-gray-600 mb-4">Configure your first SSO provider to enable single sign-on</p>
                  <button
                    onClick={() => setShowSSOConfig(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                  >
                    Add SSO Provider
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Security Policies */}
        {activeView === 'policies' && securityPolicy && (
          <motion.div
            key="policies"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Policies</h3>
              <p className="text-gray-600 mb-6">Configure organization-wide security requirements and restrictions</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Password Policy */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <LockClosedIcon className="h-5 w-5 mr-2" />
                  Password Policy
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Minimum Length</span>
                    <span className="font-medium">{securityPolicy.passwordPolicy.minLength} characters</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Require Uppercase</span>
                    <span className={cn(
                      "px-2 py-1 text-xs rounded-full",
                      getStatusColor(securityPolicy.passwordPolicy.requireUppercase)
                    )}>
                      {securityPolicy.passwordPolicy.requireUppercase ? 'Required' : 'Optional'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Require Numbers</span>
                    <span className={cn(
                      "px-2 py-1 text-xs rounded-full",
                      getStatusColor(securityPolicy.passwordPolicy.requireNumbers)
                    )}>
                      {securityPolicy.passwordPolicy.requireNumbers ? 'Required' : 'Optional'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Max Age</span>
                    <span className="font-medium">{securityPolicy.passwordPolicy.maxAge} days</span>
                  </div>
                </div>
              </div>

              {/* MFA Policy */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <ShieldCheckIcon className="h-5 w-5 mr-2" />
                  Multi-Factor Authentication
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">MFA Required</span>
                    <span className={cn(
                      "px-2 py-1 text-xs rounded-full",
                      getStatusColor(securityPolicy.mfaPolicy.required)
                    )}>
                      {securityPolicy.mfaPolicy.required ? 'Required' : 'Optional'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Allowed Methods</span>
                    <div className="text-right">
                      {securityPolicy.mfaPolicy.allowedMethods.map(method => (
                        <span key={method} className="block text-sm font-medium capitalize">{method}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Grace Period</span>
                    <span className="font-medium">{securityPolicy.mfaPolicy.gracePeriod} days</span>
                  </div>
                </div>
              </div>

              {/* Session Policy */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <ComputerDesktopIcon className="h-5 w-5 mr-2" />
                  Session Policy
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Max Duration</span>
                    <span className="font-medium">{securityPolicy.sessionPolicy.maxDuration} hours</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Idle Timeout</span>
                    <span className="font-medium">{securityPolicy.sessionPolicy.idleTimeout} minutes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Max Concurrent</span>
                    <span className="font-medium">{securityPolicy.sessionPolicy.maxConcurrentSessions} sessions</span>
                  </div>
                </div>
              </div>

              {/* SSO Policy */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <KeyIcon className="h-5 w-5 mr-2" />
                  SSO Policy
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Enforce SSO</span>
                    <span className={cn(
                      "px-2 py-1 text-xs rounded-full",
                      getStatusColor(securityPolicy.ssoPolicy.enforceSSO)
                    )}>
                      {securityPolicy.ssoPolicy.enforceSSO ? 'Enforced' : 'Optional'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Auto Provision</span>
                    <span className={cn(
                      "px-2 py-1 text-xs rounded-full",
                      getStatusColor(securityPolicy.ssoPolicy.autoProvision)
                    )}>
                      {securityPolicy.ssoPolicy.autoProvision ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Sync Attributes</span>
                    <span className={cn(
                      "px-2 py-1 text-xs rounded-full",
                      getStatusColor(securityPolicy.ssoPolicy.syncAttributes)
                    )}>
                      {securityPolicy.ssoPolicy.syncAttributes ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Audit Logs */}
        {activeView === 'audit' && (
          <motion.div
            key="audit"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Audit Logs</h3>
                <p className="text-gray-600">Security events and user activity logs</p>
              </div>
              <div className="flex space-x-3">
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Export Logs
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Filter Logs
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center mr-3",
                            log.success ? "bg-green-100" : "bg-red-100"
                          )}>
                            {getActionIcon(log.action)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {log.action.replace('_', ' ')}
                            </div>
                            <div className="text-sm text-gray-500">{log.resource}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.userId || 'System'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={cn(
                          "inline-flex px-2 py-1 text-xs font-semibold rounded-full",
                          log.success 
                            ? "text-green-800 bg-green-100"
                            : "text-red-800 bg-red-100"
                        )}>
                          {log.success ? 'Success' : 'Failed'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.ipAddress}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.timestamp.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Monitoring */}
        {activeView === 'monitoring' && (
          <motion.div
            key="monitoring"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Security Monitoring</h3>
              <p className="text-gray-600">Real-time security alerts and threat detection</p>
            </div>

            {/* Security Alerts */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
                  <h4 className="font-medium text-yellow-800">Failed Login Attempts</h4>
                </div>
                <p className="text-yellow-700 text-sm mt-1">
                  {securityMetrics.failedLogins} failed attempts in the last 24 hours
                </p>
                <div className="mt-2">
                  <span className={cn(
                    "inline-flex px-2 py-1 text-xs font-semibold rounded-full",
                    getSeverityColor(securityMetrics.failedLogins > 10 ? 'high' : 'medium')
                  )}>
                    {securityMetrics.failedLogins > 10 ? 'High' : 'Medium'} Risk
                  </span>
                </div>
              </div>

              <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                  <h4 className="font-medium text-green-800">MFA Coverage</h4>
                </div>
                <p className="text-green-700 text-sm mt-1">
                  {Math.round((securityMetrics.mfaEnabled / securityMetrics.totalUsers) * 100)}% of users have MFA enabled
                </p>
                <div className="mt-2">
                  <span className={cn(
                    "inline-flex px-2 py-1 text-xs font-semibold rounded-full",
                    getSeverityColor('low')
                  )}>
                    Good Coverage
                  </span>
                </div>
              </div>

              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <div className="flex items-center">
                  <ComputerDesktopIcon className="h-5 w-5 text-blue-600 mr-2" />
                  <h4 className="font-medium text-blue-800">Active Sessions</h4>
                </div>
                <p className="text-blue-700 text-sm mt-1">
                  {securityMetrics.activeSessions} active user sessions
                </p>
                <div className="mt-2">
                  <span className={cn(
                    "inline-flex px-2 py-1 text-xs font-semibold rounded-full",
                    getSeverityColor('low')
                  )}>
                    Normal Activity
                  </span>
                </div>
              </div>
            </div>

            {/* Failed Login Attempts */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Recent Failed Login Attempts</h4>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          IP Address
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reason
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Timestamp
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loginAttempts.filter(a => !a.success).slice(0, 10).map(attempt => (
                        <tr key={attempt.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {attempt.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {attempt.ipAddress}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full text-red-800 bg-red-100">
                              {attempt.failureReason}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {attempt.timestamp.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}