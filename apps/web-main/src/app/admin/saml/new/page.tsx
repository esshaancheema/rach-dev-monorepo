'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { 
  ArrowLeftIcon,
  DocumentTextIcon,
  KeyIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
  ClipboardDocumentIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

// Validation schema
const samlProviderSchema = z.object({
  name: z.string().min(1, 'Provider name is required').max(100, 'Name must be less than 100 characters'),
  entityId: z.string().url('Entity ID must be a valid URL'),
  ssoUrl: z.string().url('SSO URL must be a valid URL'),
  sloUrl: z.string().url('SLO URL must be a valid URL').optional().or(z.literal('')),
  certificate: z.string().min(1, 'X.509 Certificate is required'),
  organizationId: z.string().min(1, 'Organization is required'),
  
  // Attribute mapping
  emailAttribute: z.string().default('http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'),
  firstNameAttribute: z.string().default('http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'),
  lastNameAttribute: z.string().default('http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname'),
  roleAttribute: z.string().optional().or(z.literal('')),
  
  // Security settings
  wantAssertionsSigned: z.boolean().default(false),
  wantResponseSigned: z.boolean().default(true),
  signatureAlgorithm: z.enum(['SHA256', 'SHA1']).default('SHA256'),
  digestAlgorithm: z.enum(['SHA256', 'SHA1']).default('SHA256'),
  
  // Auto-provisioning
  autoProvisionUsers: z.boolean().default(true),
  defaultRole: z.string().default('user'),
  
  // Advanced
  nameIdFormat: z.string().default('urn:oasis:names:tc:SAML:2.0:nameid-format:emailAddress'),
  assertionConsumerService: z.string().optional().or(z.literal('')),
});

type SAMLProviderData = z.infer<typeof samlProviderSchema>;

const organizations = [
  { id: 'org_enterprise_001', name: 'Acme Corporation' },
  { id: 'org_enterprise_002', name: 'Tech Innovations Inc.' },
  { id: 'org_enterprise_003', name: 'Global Systems Ltd.' },
];

const defaultAttributes = {
  email: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
  firstName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
  lastName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname',
  role: 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
};

export default function NewSAMLProviderPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'basic' | 'attributes' | 'security' | 'advanced'>('basic');
  const [showCertificate, setShowCertificate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<SAMLProviderData>({
    resolver: zodResolver(samlProviderSchema),
    defaultValues: {
      emailAttribute: defaultAttributes.email,
      firstNameAttribute: defaultAttributes.firstName,
      lastNameAttribute: defaultAttributes.lastName,
      wantResponseSigned: true,
      signatureAlgorithm: 'SHA256',
      digestAlgorithm: 'SHA256',
      autoProvisionUsers: true,
      defaultRole: 'user',
      nameIdFormat: 'urn:oasis:names:tc:SAML:2.0:nameid-format:emailAddress',
    }
  });

  const watchedValues = watch();

  const onSubmit = async (data: SAMLProviderData) => {
    setIsSubmitting(true);
    try {
      // Mock API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('SAML Provider Data:', data);
      
      // Redirect to SAML admin page
      router.push('/admin/saml');
    } catch (error) {
      console.error('Failed to create SAML provider:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestConnection = async () => {
    setTestResult(null);
    
    try {
      // Mock test connection - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const isValid = watchedValues.ssoUrl && watchedValues.entityId && watchedValues.certificate;
      
      if (isValid) {
        setTestResult({
          success: true,
          message: 'SAML connection test successful! Metadata is valid and SSO endpoint is reachable.'
        });
      } else {
        setTestResult({
          success: false,
          message: 'Connection test failed. Please check your configuration and try again.'
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Connection test failed due to network error.'
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const tabs = [
    { id: 'basic', label: 'Basic Configuration', icon: GlobeAltIcon },
    { id: 'attributes', label: 'Attribute Mapping', icon: DocumentTextIcon },
    { id: 'security', label: 'Security Settings', icon: ShieldCheckIcon },
    { id: 'advanced', label: 'Advanced Options', icon: KeyIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link
                  href="/admin/saml"
                  className="
                    inline-flex items-center text-gray-600 hover:text-gray-900 
                    transition-colors duration-200
                  "
                >
                  <ArrowLeftIcon className="w-5 h-5 mr-2" />
                  Back to SAML Admin
                </Link>
                <div className="h-6 border-l border-gray-300" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Add SAML Provider
                  </h1>
                  <p className="text-gray-600">
                    Configure a new SAML Single Sign-On provider
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`
                      flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm
                      transition-colors duration-200
                      ${activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {/* Basic Configuration Tab */}
              {activeTab === 'basic' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Provider Name *
                      </label>
                      <input
                        {...register('name')}
                        type="text"
                        id="name"
                        className={`
                          block w-full px-3 py-2 border rounded-md shadow-sm 
                          focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500
                          ${errors.name ? 'border-red-300' : 'border-gray-300'}
                        `}
                        placeholder="e.g., Okta Production"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="organizationId" className="block text-sm font-medium text-gray-700 mb-2">
                        Organization *
                      </label>
                      <select
                        {...register('organizationId')}
                        id="organizationId"
                        className={`
                          block w-full px-3 py-2 border rounded-md shadow-sm 
                          focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500
                          ${errors.organizationId ? 'border-red-300' : 'border-gray-300'}
                        `}
                      >
                        <option value="">Select organization</option>
                        {organizations.map(org => (
                          <option key={org.id} value={org.id}>
                            {org.name}
                          </option>
                        ))}
                      </select>
                      {errors.organizationId && (
                        <p className="mt-1 text-sm text-red-600">{errors.organizationId.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="entityId" className="block text-sm font-medium text-gray-700 mb-2">
                      Entity ID (Issuer) *
                    </label>
                    <input
                      {...register('entityId')}
                      type="url"
                      id="entityId"
                      className={`
                        block w-full px-3 py-2 border rounded-md shadow-sm 
                        focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500
                        ${errors.entityId ? 'border-red-300' : 'border-gray-300'}
                      `}
                      placeholder="https://company.okta.com"
                    />
                    {errors.entityId && (
                      <p className="mt-1 text-sm text-red-600">{errors.entityId.message}</p>
                    )}
                    <p className="mt-1 text-sm text-gray-500">
                      The unique identifier for the Identity Provider
                    </p>
                  </div>

                  <div>
                    <label htmlFor="ssoUrl" className="block text-sm font-medium text-gray-700 mb-2">
                      SSO URL *
                    </label>
                    <input
                      {...register('ssoUrl')}
                      type="url"
                      id="ssoUrl"
                      className={`
                        block w-full px-3 py-2 border rounded-md shadow-sm 
                        focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500
                        ${errors.ssoUrl ? 'border-red-300' : 'border-gray-300'}
                      `}
                      placeholder="https://company.okta.com/app/company/sso/saml"
                    />
                    {errors.ssoUrl && (
                      <p className="mt-1 text-sm text-red-600">{errors.ssoUrl.message}</p>
                    )}
                    <p className="mt-1 text-sm text-gray-500">
                      The SAML Single Sign-On endpoint URL
                    </p>
                  </div>

                  <div>
                    <label htmlFor="sloUrl" className="block text-sm font-medium text-gray-700 mb-2">
                      SLO URL (Optional)
                    </label>
                    <input
                      {...register('sloUrl')}
                      type="url"
                      id="sloUrl"
                      className={`
                        block w-full px-3 py-2 border rounded-md shadow-sm 
                        focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500
                        ${errors.sloUrl ? 'border-red-300' : 'border-gray-300'}
                      `}
                      placeholder="https://company.okta.com/app/company/slo/saml"
                    />
                    {errors.sloUrl && (
                      <p className="mt-1 text-sm text-red-600">{errors.sloUrl.message}</p>
                    )}
                    <p className="mt-1 text-sm text-gray-500">
                      The SAML Single Logout endpoint URL
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label htmlFor="certificate" className="block text-sm font-medium text-gray-700">
                        X.509 Certificate *
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowCertificate(!showCertificate)}
                        className="inline-flex items-center text-sm text-primary-600 hover:text-primary-800"
                      >
                        {showCertificate ? (
                          <EyeSlashIcon className="w-4 h-4 mr-1" />
                        ) : (
                          <EyeIcon className="w-4 h-4 mr-1" />
                        )}
                        {showCertificate ? 'Hide' : 'Show'} Certificate
                      </button>
                    </div>
                    <textarea
                      {...register('certificate')}
                      id="certificate"
                      rows={showCertificate ? 8 : 3}
                      className={`
                        block w-full px-3 py-2 border rounded-md shadow-sm font-mono text-sm
                        focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500
                        ${errors.certificate ? 'border-red-300' : 'border-gray-300'}
                        ${!showCertificate ? 'text-security' : ''}
                      `}
                      placeholder="-----BEGIN CERTIFICATE-----&#10;MIICXjCCAcegAwIBAgIBADANBgkqhkiG9w0BAQ0FBDAuMQswCQYDVQQGEwJ1czEP&#10;...&#10;-----END CERTIFICATE-----"
                    />
                    {errors.certificate && (
                      <p className="mt-1 text-sm text-red-600">{errors.certificate.message}</p>
                    )}
                    <p className="mt-1 text-sm text-gray-500">
                      The Identity Provider's public certificate for signature verification
                    </p>
                  </div>

                  {/* Test Connection */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Test Configuration</h4>
                        <p className="text-sm text-gray-500">
                          Verify your SAML configuration before saving
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleTestConnection}
                        disabled={!watchedValues.ssoUrl || !watchedValues.entityId}
                        className="
                          inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm 
                          text-sm font-medium text-white bg-blue-600 hover:bg-blue-700
                          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                          disabled:opacity-50 disabled:cursor-not-allowed
                        "
                      >
                        Test Connection
                      </button>
                    </div>

                    {testResult && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`
                          mt-4 p-3 rounded-md flex items-start space-x-3
                          ${testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}
                        `}
                      >
                        {testResult.success ? (
                          <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        )}
                        <p className={`text-sm ${testResult.success ? 'text-green-700' : 'text-red-700'}`}>
                          {testResult.message}
                        </p>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Attribute Mapping Tab */}
              {activeTab === 'attributes' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <InformationCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-blue-700">
                          Map SAML attributes to user profile fields. These mappings determine how user information 
                          is extracted from SAML assertions.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="emailAttribute" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Attribute
                      </label>
                      <input
                        {...register('emailAttribute')}
                        type="text"
                        id="emailAttribute"
                        className="
                          block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                          focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500
                        "
                      />
                      <button
                        type="button"
                        onClick={() => copyToClipboard(defaultAttributes.email)}
                        className="mt-1 inline-flex items-center text-xs text-gray-500 hover:text-gray-700"
                      >
                        <ClipboardDocumentIcon className="w-3 h-3 mr-1" />
                        Copy default
                      </button>
                    </div>

                    <div>
                      <label htmlFor="firstNameAttribute" className="block text-sm font-medium text-gray-700 mb-2">
                        First Name Attribute
                      </label>
                      <input
                        {...register('firstNameAttribute')}
                        type="text"
                        id="firstNameAttribute"
                        className="
                          block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                          focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500
                        "
                      />
                      <button
                        type="button"
                        onClick={() => copyToClipboard(defaultAttributes.firstName)}
                        className="mt-1 inline-flex items-center text-xs text-gray-500 hover:text-gray-700"
                      >
                        <ClipboardDocumentIcon className="w-3 h-3 mr-1" />
                        Copy default
                      </button>
                    </div>

                    <div>
                      <label htmlFor="lastNameAttribute" className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name Attribute
                      </label>
                      <input
                        {...register('lastNameAttribute')}
                        type="text"
                        id="lastNameAttribute"
                        className="
                          block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                          focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500
                        "
                      />
                      <button
                        type="button"
                        onClick={() => copyToClipboard(defaultAttributes.lastName)}
                        className="mt-1 inline-flex items-center text-xs text-gray-500 hover:text-gray-700"
                      >
                        <ClipboardDocumentIcon className="w-3 h-3 mr-1" />
                        Copy default
                      </button>
                    </div>

                    <div>
                      <label htmlFor="roleAttribute" className="block text-sm font-medium text-gray-700 mb-2">
                        Role Attribute (Optional)
                      </label>
                      <input
                        {...register('roleAttribute')}
                        type="text"
                        id="roleAttribute"
                        className="
                          block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                          focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500
                        "
                      />
                      <button
                        type="button"
                        onClick={() => copyToClipboard(defaultAttributes.role)}
                        className="mt-1 inline-flex items-center text-xs text-gray-500 hover:text-gray-700"
                      >
                        <ClipboardDocumentIcon className="w-3 h-3 mr-1" />
                        Copy default
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        {...register('autoProvisionUsers')}
                        id="autoProvisionUsers"
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor="autoProvisionUsers" className="ml-2 block text-sm text-gray-900">
                        Auto-provision new users
                      </label>
                    </div>

                    <div>
                      <label htmlFor="defaultRole" className="block text-sm font-medium text-gray-700 mb-2">
                        Default Role for New Users
                      </label>
                      <select
                        {...register('defaultRole')}
                        id="defaultRole"
                        className="
                          block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                          focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500
                        "
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Security Settings Tab */}
              {activeTab === 'security' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-amber-50 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <ShieldCheckIcon className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-amber-700">
                          Configure security settings for SAML assertions. These settings affect how SAML responses 
                          are validated and processed.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        {...register('wantAssertionsSigned')}
                        id="wantAssertionsSigned"
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor="wantAssertionsSigned" className="ml-2 block text-sm text-gray-900">
                        Require signed assertions
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        {...register('wantResponseSigned')}
                        id="wantResponseSigned"
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor="wantResponseSigned" className="ml-2 block text-sm text-gray-900">
                        Require signed responses (Recommended)
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="signatureAlgorithm" className="block text-sm font-medium text-gray-700 mb-2">
                        Signature Algorithm
                      </label>
                      <select
                        {...register('signatureAlgorithm')}
                        id="signatureAlgorithm"
                        className="
                          block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                          focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500
                        "
                      >
                        <option value="SHA256">SHA-256 (Recommended)</option>
                        <option value="SHA1">SHA-1 (Legacy)</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="digestAlgorithm" className="block text-sm font-medium text-gray-700 mb-2">
                        Digest Algorithm
                      </label>
                      <select
                        {...register('digestAlgorithm')}
                        id="digestAlgorithm"
                        className="
                          block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                          focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500
                        "
                      >
                        <option value="SHA256">SHA-256 (Recommended)</option>
                        <option value="SHA1">SHA-1 (Legacy)</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Advanced Options Tab */}
              {activeTab === 'advanced' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <label htmlFor="nameIdFormat" className="block text-sm font-medium text-gray-700 mb-2">
                      NameID Format
                    </label>
                    <select
                      {...register('nameIdFormat')}
                      id="nameIdFormat"
                      className="
                        block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                        focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500
                      "
                    >
                      <option value="urn:oasis:names:tc:SAML:2.0:nameid-format:emailAddress">
                        Email Address
                      </option>
                      <option value="urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified">
                        Unspecified
                      </option>
                      <option value="urn:oasis:names:tc:SAML:2.0:nameid-format:persistent">
                        Persistent
                      </option>
                      <option value="urn:oasis:names:tc:SAML:2.0:nameid-format:transient">
                        Transient
                      </option>
                    </select>
                    <p className="mt-1 text-sm text-gray-500">
                      The format for the NameID in SAML assertions
                    </p>
                  </div>

                  <div>
                    <label htmlFor="assertionConsumerService" className="block text-sm font-medium text-gray-700 mb-2">
                      Assertion Consumer Service URL (Optional)
                    </label>
                    <input
                      {...register('assertionConsumerService')}
                      type="url"
                      id="assertionConsumerService"
                      className="
                        block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                        focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500
                      "
                      placeholder="https://your-domain.com/saml/acs"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Custom ACS URL. Leave empty to use the default endpoint.
                    </p>
                  </div>

                  {/* Service Provider Metadata */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      Service Provider Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-gray-500">
                          Entity ID (SP)
                        </label>
                        <div className="flex items-center space-x-2 mt-1">
                          <code className="flex-1 text-sm bg-white px-2 py-1 rounded border">
                            https://your-domain.com/saml/metadata
                          </code>
                          <button
                            type="button"
                            onClick={() => copyToClipboard('https://your-domain.com/saml/metadata')}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <ClipboardDocumentIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">
                          Assertion Consumer Service URL
                        </label>
                        <div className="flex items-center space-x-2 mt-1">
                          <code className="flex-1 text-sm bg-white px-2 py-1 rounded border">
                            https://your-domain.com/saml/acs
                          </code>
                          <button
                            type="button"
                            onClick={() => copyToClipboard('https://your-domain.com/saml/acs')}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <ClipboardDocumentIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between">
              <Link
                href="/admin/saml"
                className="
                  inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm 
                  text-sm font-medium text-gray-700 bg-white hover:bg-gray-50
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
                "
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="
                  inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm 
                  text-sm font-medium text-white bg-primary-600 hover:bg-primary-700
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Provider...
                  </>
                ) : (
                  'Create SAML Provider'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}