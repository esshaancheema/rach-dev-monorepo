'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheckIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  GlobeAltIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CogIcon,
  DocumentTextIcon,
  KeyIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface SAMLProvider {
  id: string;
  name: string;
  entityId: string;
  ssoUrl: string;
  status: 'active' | 'inactive' | 'pending';
  certificate: string;
  organizationId: string;
  userCount: number;
  lastSync: string;
  createdAt: string;
  updatedAt: string;
}

const mockSAMLProviders: SAMLProvider[] = [
  {
    id: 'saml_okta_001',
    name: 'Okta Production',
    entityId: 'https://company.okta.com',
    ssoUrl: 'https://company.okta.com/app/company/sso/saml',
    status: 'active',
    certificate: '-----BEGIN CERTIFICATE-----\nMIIC...truncated...\n-----END CERTIFICATE-----',
    organizationId: 'org_enterprise_001',
    userCount: 1247,
    lastSync: '2025-08-22T09:30:00Z',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2025-08-22T09:30:00Z',
  },
  {
    id: 'saml_azure_001',
    name: 'Azure AD SAML',
    entityId: 'https://sts.windows.net/tenant-id/',
    ssoUrl: 'https://login.microsoftonline.com/tenant-id/saml2',
    status: 'active',
    certificate: '-----BEGIN CERTIFICATE-----\nMIIC...truncated...\n-----END CERTIFICATE-----',
    organizationId: 'org_enterprise_001',
    userCount: 892,
    lastSync: '2025-08-22T08:45:00Z',
    createdAt: '2024-03-10T14:20:00Z',
    updatedAt: '2025-08-22T08:45:00Z',
  },
  {
    id: 'saml_onelogin_001',
    name: 'OneLogin Staging',
    entityId: 'https://app.onelogin.com/saml/metadata/123456',
    ssoUrl: 'https://company.onelogin.com/trust/saml2/http-post/sso/123456',
    status: 'inactive',
    certificate: '-----BEGIN CERTIFICATE-----\nMIIC...truncated...\n-----END CERTIFICATE-----',
    organizationId: 'org_enterprise_001',
    userCount: 0,
    lastSync: '2025-08-20T16:00:00Z',
    createdAt: '2025-08-15T11:30:00Z',
    updatedAt: '2025-08-20T16:00:00Z',
  },
];

export default function SAMLAdminPage() {
  const [providers, setProviders] = useState<SAMLProvider[]>(mockSAMLProviders);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<SAMLProvider | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-700 bg-green-50 ring-green-600/20';
      case 'inactive': return 'text-gray-700 bg-gray-50 ring-gray-600/20';
      case 'pending': return 'text-yellow-700 bg-yellow-50 ring-yellow-600/20';
      default: return 'text-gray-700 bg-gray-50 ring-gray-600/20';
    }
  };

  const handleTestConnection = async (provider: SAMLProvider) => {
    setSelectedProvider(provider);
    setShowTestModal(true);
    // Mock test - would actually test SAML connection
    setTimeout(() => {
      setShowTestModal(false);
    }, 2000);
  };

  const handleToggleStatus = async (providerId: string) => {
    setProviders(prev => 
      prev.map(p => 
        p.id === providerId 
          ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' as any }
          : p
      )
    );
  };

  const handleDeleteProvider = async (providerId: string) => {
    setProviders(prev => prev.filter(p => p.id !== providerId));
    setShowDeleteModal(false);
    setSelectedProvider(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                  <ShieldCheckIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    SAML SSO Configuration
                  </h1>
                  <p className="text-gray-600">
                    Manage enterprise SAML Single Sign-On providers
                  </p>
                </div>
              </div>
              <Link
                href="/admin/saml/new"
                className="
                  inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm 
                  text-sm font-medium text-white bg-primary-600 hover:bg-primary-700
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
                  transition-colors duration-200
                "
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Add SAML Provider
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {providers.filter(p => p.status === 'active').length}
                </h3>
                <p className="text-gray-600 text-sm">Active Providers</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <UserGroupIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {providers.reduce((sum, p) => sum + p.userCount, 0).toLocaleString()}
                </h3>
                <p className="text-gray-600 text-sm">Total SAML Users</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BuildingOfficeIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {new Set(providers.map(p => p.organizationId)).size}
                </h3>
                <p className="text-gray-600 text-sm">Organizations</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <GlobeAltIcon className="w-6 h-6 text-amber-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">99.9%</h3>
                <p className="text-gray-600 text-sm">Uptime</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* SAML Providers Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg shadow overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              SAML Providers
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Provider
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Users
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Sync
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {providers.map((provider, index) => (
                  <motion.tr
                    key={provider.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <ShieldCheckIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {provider.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {provider.entityId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`
                        inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset
                        ${getStatusColor(provider.status)}
                      `}>
                        {provider.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {provider.userCount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(provider.lastSync)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleTestConnection(provider)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="Test Connection"
                        >
                          <ArrowPathIcon className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/admin/saml/${provider.id}`}
                          className="text-indigo-600 hover:text-indigo-900 transition-colors"
                          title="Edit"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleToggleStatus(provider.id)}
                          className={`transition-colors ${
                            provider.status === 'active' 
                              ? 'text-gray-600 hover:text-gray-900' 
                              : 'text-green-600 hover:text-green-900'
                          }`}
                          title={provider.status === 'active' ? 'Deactivate' : 'Activate'}
                        >
                          <CogIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProvider(provider);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Delete"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <Link
            href="/admin/saml/metadata"
            className="
              bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow
              border-2 border-transparent hover:border-primary-200
            "
          >
            <div className="flex items-center space-x-3">
              <DocumentTextIcon className="w-8 h-8 text-primary-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Service Provider Metadata</h3>
                <p className="text-sm text-gray-600">Download SP metadata XML</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/saml/certificates"
            className="
              bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow
              border-2 border-transparent hover:border-primary-200
            "
          >
            <div className="flex items-center space-x-3">
              <KeyIcon className="w-8 h-8 text-primary-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Certificate Management</h3>
                <p className="text-sm text-gray-600">Manage signing certificates</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/saml/logs"
            className="
              bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow
              border-2 border-transparent hover:border-primary-200
            "
          >
            <div className="flex items-center space-x-3">
              <DocumentTextIcon className="w-8 h-8 text-primary-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Audit Logs</h3>
                <p className="text-sm text-gray-600">View SAML authentication logs</p>
              </div>
            </div>
          </Link>
        </motion.div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showTestModal && selectedProvider && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full"
            >
              <div className="text-center">
                <ArrowPathIcon className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Testing Connection
                </h3>
                <p className="text-gray-600">
                  Testing SAML connection to {selectedProvider.name}...
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showDeleteModal && selectedProvider && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full"
            >
              <div className="flex items-center mb-4">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Delete SAML Provider
                </h3>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{selectedProvider.name}"? This action cannot be undone and will affect {selectedProvider.userCount} users.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteProvider(selectedProvider.id)}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}