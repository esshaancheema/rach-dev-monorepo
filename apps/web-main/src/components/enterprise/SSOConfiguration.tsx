'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  KeyIcon,
  DocumentTextIcon,
  CogIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ClipboardDocumentIcon,
  ArrowPathIcon,
  PlayIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import {
  EnterpriseAuthService,
  SSOProvider,
  SSOConfig
} from '@/lib/enterprise/auth-service';

interface SSOConfigurationProps {
  organizationId: string;
  provider?: SSOProvider;
  onSave?: (provider: SSOProvider) => void;
  onCancel?: () => void;
  className?: string;
}

type SSOType = 'saml' | 'oidc' | 'oauth2';
type ConfigStep = 'type' | 'details' | 'mapping' | 'test' | 'complete';

interface ValidationError {
  field: string;
  message: string;
}

export default function SSOConfiguration({
  organizationId,
  provider,
  onSave,
  onCancel,
  className
}: SSOConfigurationProps) {
  const [authService] = useState(() => new EnterpriseAuthService());
  
  // Configuration state
  const [currentStep, setCurrentStep] = useState<ConfigStep>('type');
  const [ssoType, setSsoType] = useState<SSOType>(provider?.type || 'saml');
  const [providerName, setProviderName] = useState(provider?.name || '');
  const [config, setConfig] = useState<SSOConfig>(provider?.config || {});
  const [enabled, setEnabled] = useState(provider?.enabled || false);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const steps = [
    { id: 'type', title: 'Provider Type', description: 'Choose SSO protocol' },
    { id: 'details', title: 'Configuration', description: 'Provider details' },
    { id: 'mapping', title: 'Attribute Mapping', description: 'Map user attributes' },
    { id: 'test', title: 'Test Connection', description: 'Verify configuration' },
    { id: 'complete', title: 'Complete', description: 'Finalize setup' }
  ];

  const ssoTypes = [
    {
      id: 'saml' as SSOType,
      name: 'SAML 2.0',
      description: 'Security Assertion Markup Language',
      icon: '🔐',
      popular: true,
      features: ['Enterprise SSO', 'Strong Security', 'Wide Support']
    },
    {
      id: 'oidc' as SSOType,
      name: 'OpenID Connect',
      description: 'Modern OAuth 2.0 based authentication',
      icon: '🆔',
      popular: true,
      features: ['Modern Standard', 'JWT Tokens', 'Simple Setup']
    },
    {
      id: 'oauth2' as SSOType,
      name: 'OAuth 2.0',
      description: 'Authorization framework',
      icon: '🔑',
      popular: false,
      features: ['Authorization', 'API Access', 'Third-party Apps']
    }
  ];

  useEffect(() => {
    validateCurrentStep();
  }, [currentStep, ssoType, providerName, config]);

  const validateCurrentStep = () => {
    const errors: ValidationError[] = [];

    switch (currentStep) {
      case 'type':
        if (!ssoType) {
          errors.push({ field: 'type', message: 'Please select an SSO type' });
        }
        break;

      case 'details':
        if (!providerName.trim()) {
          errors.push({ field: 'name', message: 'Provider name is required' });
        }

        if (ssoType === 'saml') {
          if (!config.saml?.entryPoint) {
            errors.push({ field: 'entryPoint', message: 'SAML Entry Point is required' });
          }
          if (!config.saml?.issuer) {
            errors.push({ field: 'issuer', message: 'SAML Issuer is required' });
          }
          if (!config.saml?.cert) {
            errors.push({ field: 'cert', message: 'SAML Certificate is required' });
          }
        }

        if (ssoType === 'oidc') {
          if (!config.oidc?.issuer) {
            errors.push({ field: 'issuer', message: 'OIDC Issuer is required' });
          }
          if (!config.oidc?.clientId) {
            errors.push({ field: 'clientId', message: 'Client ID is required' });
          }
          if (!config.oidc?.clientSecret) {
            errors.push({ field: 'clientSecret', message: 'Client Secret is required' });
          }
        }

        if (ssoType === 'oauth2') {
          if (!config.oauth2?.authorizationURL) {
            errors.push({ field: 'authorizationURL', message: 'Authorization URL is required' });
          }
          if (!config.oauth2?.tokenURL) {
            errors.push({ field: 'tokenURL', message: 'Token URL is required' });
          }
          if (!config.oauth2?.clientId) {
            errors.push({ field: 'clientId', message: 'Client ID is required' });
          }
        }
        break;

      case 'mapping':
        const mapping = config[ssoType]?.attributeMapping;
        if (!mapping?.email) {
          errors.push({ field: 'emailMapping', message: 'Email attribute mapping is required' });
        }
        if (ssoType === 'saml' && (!mapping?.firstName || !mapping?.lastName)) {
          errors.push({ field: 'nameMapping', message: 'Name attribute mappings are required' });
        }
        if (ssoType === 'oidc' && !mapping?.name) {
          errors.push({ field: 'nameMapping', message: 'Name attribute mapping is required' });
        }
        break;
    }

    setValidationErrors(errors);
  };

  const updateSAMLConfig = (updates: Partial<NonNullable<SSOConfig['saml']>>) => {
    setConfig(prev => ({
      ...prev,
      saml: { ...prev.saml, ...updates } as NonNullable<SSOConfig['saml']>
    }));
  };

  const updateOIDCConfig = (updates: Partial<NonNullable<SSOConfig['oidc']>>) => {
    setConfig(prev => ({
      ...prev,
      oidc: { ...prev.oidc, ...updates } as NonNullable<SSOConfig['oidc']>
    }));
  };

  const updateOAuth2Config = (updates: Partial<NonNullable<SSOConfig['oauth2']>>) => {
    setConfig(prev => ({
      ...prev,
      oauth2: { ...prev.oauth2, ...updates } as NonNullable<SSOConfig['oauth2']>
    }));
  };

  const handleNext = () => {
    if (validationErrors.length === 0) {
      const currentIndex = steps.findIndex(step => step.id === currentStep);
      if (currentIndex < steps.length - 1) {
        setCurrentStep(steps[currentIndex + 1].id as ConfigStep);
      }
    }
  };

  const handlePrevious = () => {
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id as ConfigStep);
    }
  };

  const handleTestConnection = async () => {
    setIsLoading(true);
    try {
      // Mock test connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate success/failure
      const success = Math.random() > 0.3;
      setTestResult({
        success,
        message: success 
          ? 'Connection successful! SSO provider is correctly configured.'
          : 'Connection failed. Please check your configuration and try again.'
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Test failed due to network error.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const providerData = {
        name: providerName,
        type: ssoType,
        config,
        enabled,
        organizationId
      };

      let savedProvider: SSOProvider;
      if (provider) {
        savedProvider = await authService.updateSSOProvider(provider.id, providerData);
      } else {
        savedProvider = await authService.createSSOProvider(organizationId, providerData);
      }

      onSave?.(savedProvider);
      setCurrentStep('complete');
    } catch (error) {
      console.error('Failed to save SSO provider:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(label);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const toggleSecret = (field: string) => {
    setShowSecrets(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const getCallbackURL = () => {
    return `${window.location.origin}/auth/sso/callback/${organizationId}`;
  };

  const getEntityId = () => {
    return `${window.location.origin}/auth/sso/metadata/${organizationId}`;
  };

  return (
    <div className={cn("bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden", className)}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <KeyIcon className="h-8 w-8" />
            <div>
              <h2 className="text-xl font-bold">
                {provider ? 'Edit SSO Provider' : 'Add SSO Provider'}
              </h2>
              <p className="text-blue-100">Configure single sign-on authentication</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="px-6 py-4">
          <nav className="flex space-x-8">
            {steps.map((step, index) => {
              const isActive = step.id === currentStep;
              const isCompleted = steps.findIndex(s => s.id === currentStep) > index;
              
              return (
                <div key={step.id} className="flex items-center space-x-3">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                    isActive ? "bg-blue-600 text-white" :
                    isCompleted ? "bg-green-600 text-white" : "bg-gray-200 text-gray-600"
                  )}>
                    {isCompleted ? (
                      <CheckCircleIcon className="h-5 w-5" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="text-left">
                    <div className={cn(
                      "font-medium",
                      isActive ? "text-blue-600" : isCompleted ? "text-green-600" : "text-gray-500"
                    )}>
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-500">{step.description}</div>
                  </div>
                </div>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="p-6">
        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800">Please fix the following errors:</h4>
                <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error.message}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {/* Step 1: Provider Type */}
          {currentStep === 'type' && (
            <motion.div
              key="type"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Choose SSO Protocol</h3>
                <p className="text-gray-600">Select the authentication protocol your identity provider supports</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {ssoTypes.map(type => (
                  <div
                    key={type.id}
                    onClick={() => setSsoType(type.id)}
                    className={cn(
                      "border-2 rounded-lg p-6 cursor-pointer transition-all",
                      ssoType === type.id
                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-opacity-20"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-4">{type.icon}</div>
                      <h4 className="font-semibold text-gray-900 mb-2">{type.name}</h4>
                      <p className="text-sm text-gray-600 mb-4">{type.description}</p>
                      
                      {type.popular && (
                        <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mb-3">
                          Popular Choice
                        </div>
                      )}
                      
                      <div className="space-y-1">
                        {type.features.map(feature => (
                          <div key={feature} className="text-xs text-gray-500 flex items-center justify-center">
                            <CheckCircleIcon className="h-3 w-3 text-green-500 mr-1" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Configuration Details */}
          {currentStep === 'details' && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Provider Configuration</h3>
                <p className="text-gray-600">Configure your {ssoTypes.find(t => t.id === ssoType)?.name} provider details</p>
              </div>

              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Provider Name *
                  </label>
                  <input
                    type="text"
                    value={providerName}
                    onChange={(e) => setProviderName(e.target.value)}
                    placeholder="e.g., Okta, Azure AD, Google Workspace"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="enabled"
                    checked={enabled}
                    onChange={(e) => setEnabled(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="enabled" className="text-sm text-gray-700">
                    Enable this SSO provider
                  </label>
                </div>
              </div>

              {/* SAML Configuration */}
              {ssoType === 'saml' && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">SAML 2.0 Configuration</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        SSO URL / Entry Point *
                      </label>
                      <input
                        type="url"
                        value={config.saml?.entryPoint || ''}
                        onChange={(e) => updateSAMLConfig({ entryPoint: e.target.value })}
                        placeholder="https://your-idp.com/sso/saml"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Issuer / Entity ID *
                      </label>
                      <input
                        type="text"
                        value={config.saml?.issuer || ''}
                        onChange={(e) => updateSAMLConfig({ issuer: e.target.value })}
                        placeholder="https://your-idp.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      X.509 Certificate *
                    </label>
                    <textarea
                      value={config.saml?.cert || ''}
                      onChange={(e) => updateSAMLConfig({ cert: e.target.value })}
                      placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Signature Algorithm
                    </label>
                    <select
                      value={config.saml?.signatureAlgorithm || 'sha256'}
                      onChange={(e) => updateSAMLConfig({ signatureAlgorithm: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="sha1">SHA-1</option>
                      <option value="sha256">SHA-256</option>
                      <option value="sha512">SHA-512</option>
                    </select>
                  </div>

                  {/* Service Provider Info */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h5 className="font-medium text-blue-900 mb-3">Service Provider Information</h5>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-blue-800 mb-1">
                          ACS URL / Callback URL
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={getCallbackURL()}
                            readOnly
                            className="flex-1 px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm"
                          />
                          <button
                            onClick={() => copyToClipboard(getCallbackURL(), 'ACS URL')}
                            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <ClipboardDocumentIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-blue-800 mb-1">
                          Entity ID / Audience
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={getEntityId()}
                            readOnly
                            className="flex-1 px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm"
                          />
                          <button
                            onClick={() => copyToClipboard(getEntityId(), 'Entity ID')}
                            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <ClipboardDocumentIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* OIDC Configuration */}
              {ssoType === 'oidc' && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">OpenID Connect Configuration</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Issuer URL *
                    </label>
                    <input
                      type="url"
                      value={config.oidc?.issuer || ''}
                      onChange={(e) => updateOIDCConfig({ issuer: e.target.value })}
                      placeholder="https://your-provider.com/.well-known/openid-configuration"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Client ID *
                      </label>
                      <input
                        type="text"
                        value={config.oidc?.clientId || ''}
                        onChange={(e) => updateOIDCConfig({ clientId: e.target.value })}
                        placeholder="your-client-id"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Client Secret *
                      </label>
                      <div className="relative">
                        <input
                          type={showSecrets.clientSecret ? 'text' : 'password'}
                          value={config.oidc?.clientSecret || ''}
                          onChange={(e) => updateOIDCConfig({ clientSecret: e.target.value })}
                          placeholder="your-client-secret"
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => toggleSecret('clientSecret')}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showSecrets.clientSecret ? (
                            <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                          ) : (
                            <EyeIcon className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Scopes
                    </label>
                    <input
                      type="text"
                      value={config.oidc?.scope?.join(' ') || 'openid profile email'}
                      onChange={(e) => updateOIDCConfig({ scope: e.target.value.split(' ') })}
                      placeholder="openid profile email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">Space-separated list of scopes</p>
                  </div>

                  {/* Redirect URI Info */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h5 className="font-medium text-blue-900 mb-3">Redirect URI</h5>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={getCallbackURL()}
                        readOnly
                        className="flex-1 px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm"
                      />
                      <button
                        onClick={() => copyToClipboard(getCallbackURL(), 'Redirect URI')}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <ClipboardDocumentIcon className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-xs text-blue-700 mt-2">Configure this URL in your OIDC provider</p>
                  </div>
                </div>
              )}

              {/* OAuth2 Configuration */}
              {ssoType === 'oauth2' && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">OAuth 2.0 Configuration</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Authorization URL *
                      </label>
                      <input
                        type="url"
                        value={config.oauth2?.authorizationURL || ''}
                        onChange={(e) => updateOAuth2Config({ authorizationURL: e.target.value })}
                        placeholder="https://provider.com/oauth/authorize"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Token URL *
                      </label>
                      <input
                        type="url"
                        value={config.oauth2?.tokenURL || ''}
                        onChange={(e) => updateOAuth2Config({ tokenURL: e.target.value })}
                        placeholder="https://provider.com/oauth/token"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      User Info URL
                    </label>
                    <input
                      type="url"
                      value={config.oauth2?.userInfoURL || ''}
                      onChange={(e) => updateOAuth2Config({ userInfoURL: e.target.value })}
                      placeholder="https://provider.com/oauth/userinfo"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Client ID *
                      </label>
                      <input
                        type="text"
                        value={config.oauth2?.clientId || ''}
                        onChange={(e) => updateOAuth2Config({ clientId: e.target.value })}
                        placeholder="your-client-id"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Client Secret *
                      </label>
                      <div className="relative">
                        <input
                          type={showSecrets.clientSecret ? 'text' : 'password'}
                          value={config.oauth2?.clientSecret || ''}
                          onChange={(e) => updateOAuth2Config({ clientSecret: e.target.value })}
                          placeholder="your-client-secret"
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => toggleSecret('clientSecret')}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showSecrets.clientSecret ? (
                            <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                          ) : (
                            <EyeIcon className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {copySuccess && (
                <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg">
                  {copySuccess} copied to clipboard!
                </div>
              )}
            </motion.div>
          )}

          {/* Step 3: Attribute Mapping */}
          {currentStep === 'mapping' && (
            <motion.div
              key="mapping"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Attribute Mapping</h3>
                <p className="text-gray-600">Map attributes from your identity provider to user fields</p>
              </div>

              {ssoType === 'saml' && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">SAML Attribute Mapping</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Attribute *
                      </label>
                      <input
                        type="text"
                        value={config.saml?.attributeMapping?.email || ''}
                        onChange={(e) => updateSAMLConfig({
                          attributeMapping: {
                            ...config.saml?.attributeMapping,
                            email: e.target.value
                          } as any
                        })}
                        placeholder="http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name Attribute *
                      </label>
                      <input
                        type="text"
                        value={config.saml?.attributeMapping?.firstName || ''}
                        onChange={(e) => updateSAMLConfig({
                          attributeMapping: {
                            ...config.saml?.attributeMapping,
                            firstName: e.target.value
                          } as any
                        })}
                        placeholder="http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name Attribute *
                      </label>
                      <input
                        type="text"
                        value={config.saml?.attributeMapping?.lastName || ''}
                        onChange={(e) => updateSAMLConfig({
                          attributeMapping: {
                            ...config.saml?.attributeMapping,
                            lastName: e.target.value
                          } as any
                        })}
                        placeholder="http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Groups Attribute
                      </label>
                      <input
                        type="text"
                        value={config.saml?.attributeMapping?.groups || ''}
                        onChange={(e) => updateSAMLConfig({
                          attributeMapping: {
                            ...config.saml?.attributeMapping,
                            groups: e.target.value
                          } as any
                        })}
                        placeholder="http://schemas.xmlsoap.org/claims/Group"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {ssoType === 'oidc' && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">OIDC Claim Mapping</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Claim *
                      </label>
                      <input
                        type="text"
                        value={config.oidc?.attributeMapping?.email || 'email'}
                        onChange={(e) => updateOIDCConfig({
                          attributeMapping: {
                            ...config.oidc?.attributeMapping,
                            email: e.target.value
                          } as any
                        })}
                        placeholder="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name Claim *
                      </label>
                      <input
                        type="text"
                        value={config.oidc?.attributeMapping?.name || 'name'}
                        onChange={(e) => updateOIDCConfig({
                          attributeMapping: {
                            ...config.oidc?.attributeMapping,
                            name: e.target.value
                          } as any
                        })}
                        placeholder="name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Groups Claim
                      </label>
                      <input
                        type="text"
                        value={config.oidc?.attributeMapping?.groups || ''}
                        onChange={(e) => updateOIDCConfig({
                          attributeMapping: {
                            ...config.oidc?.attributeMapping,
                            groups: e.target.value
                          } as any
                        })}
                        placeholder="groups"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Picture Claim
                      </label>
                      <input
                        type="text"
                        value={config.oidc?.attributeMapping?.picture || ''}
                        onChange={(e) => updateOIDCConfig({
                          attributeMapping: {
                            ...config.oidc?.attributeMapping,
                            picture: e.target.value
                          } as any
                        })}
                        placeholder="picture"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 4: Test Connection */}
          {currentStep === 'test' && (
            <motion.div
              key="test"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Test Connection</h3>
                <p className="text-gray-600">Verify that your SSO configuration is working correctly</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <PlayIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  
                  <h4 className="font-medium text-gray-900 mb-2">Ready to Test</h4>
                  <p className="text-gray-600 mb-6">
                    Click the button below to test the SSO connection with your configured provider
                  </p>

                  <button
                    onClick={handleTestConnection}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
                  >
                    {isLoading ? (
                      <>
                        <ArrowPathIcon className="h-4 w-4 animate-spin" />
                        <span>Testing Connection...</span>
                      </>
                    ) : (
                      <>
                        <PlayIcon className="h-4 w-4" />
                        <span>Test SSO Connection</span>
                      </>
                    )}
                  </button>

                  {testResult && (
                    <div className={cn(
                      "mt-6 p-4 rounded-lg",
                      testResult.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                    )}>
                      <div className="flex items-center justify-center space-x-2">
                        {testResult.success ? (
                          <CheckCircleIcon className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircleIcon className="h-5 w-5 text-red-600" />
                        )}
                        <span className={cn(
                          "font-medium",
                          testResult.success ? "text-green-800" : "text-red-800"
                        )}>
                          {testResult.success ? 'Connection Successful' : 'Connection Failed'}
                        </span>
                      </div>
                      <p className={cn(
                        "text-sm mt-2",
                        testResult.success ? "text-green-700" : "text-red-700"
                      )}>
                        {testResult.message}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 5: Complete */}
          {currentStep === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircleIcon className="h-8 w-8 text-green-600" />
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">SSO Provider Configured</h3>
                <p className="text-gray-600 mb-6">
                  Your {ssoTypes.find(t => t.id === ssoType)?.name} provider "{providerName}" has been successfully configured.
                </p>

                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-blue-900 mb-2">Next Steps</h4>
                  <ul className="text-sm text-blue-800 space-y-1 text-left">
                    <li>• Users can now sign in using SSO</li>
                    <li>• Monitor authentication logs for any issues</li>
                    <li>• Configure additional security policies if needed</li>
                    <li>• Test user provisioning and attribute mapping</li>
                  </ul>
                </div>

                <div className="flex justify-center space-x-3">
                  <button
                    onClick={onCancel}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => window.open('/auth/sso/test', '_blank')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Test Login
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        {currentStep !== 'complete' && (
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-8">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 'type'}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex space-x-3">
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              )}
              
              {currentStep === 'test' ? (
                <button
                  onClick={handleSave}
                  disabled={!testResult?.success || isLoading}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Saving...' : 'Save Provider'}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={validationErrors.length > 0}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}