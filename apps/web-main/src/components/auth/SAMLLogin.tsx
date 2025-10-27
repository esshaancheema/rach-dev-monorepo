'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BuildingOfficeIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const samlLoginSchema = z.object({
  domain: z.string().min(1, 'Domain is required')
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\..*$/, 'Please enter a valid domain'),
});

type SAMLLoginData = z.infer<typeof samlLoginSchema>;

interface SAMLProvider {
  id: string;
  name: string;
  domain: string;
  entityId: string;
  logoUrl?: string;
}

interface SAMLLoginProps {
  onSuccess?: () => void;
  className?: string;
}

export default function SAMLLogin({ onSuccess, className = '' }: SAMLLoginProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [discoveredProvider, setDiscoveredProvider] = useState<SAMLProvider | null>(null);
  const [showProviders, setShowProviders] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<SAMLLoginData>({
    resolver: zodResolver(samlLoginSchema)
  });

  const domainValue = watch('domain');

  // Mock SAML providers for demonstration
  const mockProviders: SAMLProvider[] = [
    {
      id: 'saml_okta_001',
      name: 'Acme Corporation (Okta)',
      domain: 'acme.com',
      entityId: 'https://acme.okta.com',
      logoUrl: '/images/okta-logo.svg'
    },
    {
      id: 'saml_azure_001',
      name: 'Tech Innovations (Azure AD)',
      domain: 'techinnovations.com',
      entityId: 'https://sts.windows.net/tenant-id/',
      logoUrl: '/images/azure-logo.svg'
    },
    {
      id: 'saml_onelogin_001',
      name: 'Global Systems (OneLogin)',
      domain: 'globalsystems.com',
      entityId: 'https://app.onelogin.com/saml/metadata/123456',
      logoUrl: '/images/onelogin-logo.svg'
    },
  ];

  // Auto-discover SAML provider based on domain
  useEffect(() => {
    if (domainValue && domainValue.length > 3) {
      const timer = setTimeout(() => {
        const provider = mockProviders.find(p => 
          domainValue.toLowerCase().includes(p.domain.toLowerCase()) ||
          p.domain.toLowerCase().includes(domainValue.toLowerCase())
        );
        setDiscoveredProvider(provider || null);
      }, 500);

      return () => clearTimeout(timer);
    } else {
      setDiscoveredProvider(null);
    }
  }, [domainValue]);

  const handleSAMLLogin = async (data: SAMLLoginData) => {
    try {
      setError(null);
      setIsLoading(true);

      // Find SAML provider for domain
      let provider = discoveredProvider;
      
      if (!provider) {
        // Attempt to discover provider via API
        const discoverResponse = await fetch('/api/saml/discover', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ domain: data.domain }),
        });

        if (discoverResponse.ok) {
          const discoverData = await discoverResponse.json();
          provider = discoverData.data;
        }
      }

      if (!provider) {
        throw new Error(`No SAML provider found for domain "${data.domain}". Please contact your administrator.`);
      }

      // Initiate SAML SSO flow
      const response = await fetch('/api/saml/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          providerId: provider.id,
          domain: data.domain,
          redirectTo: window.location.origin + '/dashboard'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to initiate SAML login');
      }

      const samlData = await response.json();

      // Track SAML login attempt
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'login', {
          method: 'saml',
          custom_parameter: provider.name
        });
      }

      // Redirect to Identity Provider
      if (samlData.data.redirectUrl) {
        window.location.href = samlData.data.redirectUrl;
      } else {
        throw new Error('No redirect URL received from SAML provider');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'SAML login failed');
      console.error('SAML login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProviderSelect = (provider: SAMLProvider) => {
    setDiscoveredProvider(provider);
    setShowProviders(false);
    // Auto-fill domain field
    const form = document.getElementById('domain') as HTMLInputElement;
    if (form) {
      form.value = provider.domain;
      form.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <ShieldCheckIcon className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Enterprise SSO</h3>
        </div>
        <p className="text-sm text-gray-600">
          Sign in using your organization's SAML identity provider
        </p>
      </div>

      <form onSubmit={handleSubmit(handleSAMLLogin)} className="space-y-4">
        {/* Domain Input */}
        <div>
          <label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-2">
            Company Domain
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <GlobeAltIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              {...register('domain')}
              type="text"
              id="domain"
              autoComplete="organization"
              className={`
                block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                ${errors.domain ? 'border-red-300 text-red-900' : 'border-gray-300'}
              `}
              placeholder="company.com"
            />
          </div>
          {errors.domain && (
            <p className="mt-2 text-sm text-red-600">{errors.domain.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Enter your company's domain name (e.g., acme.com)
          </p>
        </div>

        {/* Auto-discovered Provider */}
        <AnimatePresence>
          {discoveredProvider && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="bg-blue-50 border border-blue-200 rounded-lg p-4"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BuildingOfficeIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">
                    SAML Provider Detected
                  </p>
                  <p className="text-sm text-blue-700">
                    {discoveredProvider.name}
                  </p>
                </div>
                <CheckCircleIcon className="w-5 h-5 text-blue-600" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Browse Providers */}
        {!discoveredProvider && (
          <div className="text-center">
            <button
              type="button"
              onClick={() => setShowProviders(!showProviders)}
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              Browse available providers
            </button>
          </div>
        )}

        {/* Providers List */}
        <AnimatePresence>
          {showProviders && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <p className="text-sm font-medium text-gray-700">Available Providers:</p>
              {mockProviders.map((provider, index) => (
                <motion.button
                  key={provider.id}
                  type="button"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleProviderSelect(provider)}
                  className="
                    w-full flex items-center space-x-3 p-3 border border-gray-200 rounded-lg
                    hover:border-blue-300 hover:bg-blue-50 transition-colors text-left
                  "
                >
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <BuildingOfficeIcon className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{provider.name}</p>
                    <p className="text-xs text-gray-500">{provider.domain}</p>
                  </div>
                  <ArrowRightIcon className="w-4 h-4 text-gray-400" />
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || isLoading || !domainValue}
          className="
            w-full flex items-center justify-center space-x-2 
            bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium
            hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
          "
        >
          {isSubmitting || isLoading ? (
            <>
              <ArrowPathIcon className="w-4 h-4 animate-spin" />
              <span>Redirecting to SSO...</span>
            </>
          ) : (
            <>
              <ShieldCheckIcon className="w-4 h-4" />
              <span>Continue with SAML SSO</span>
              <ArrowRightIcon className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3"
        >
          <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700 text-sm">{error}</p>
        </motion.div>
      )}

      {/* Info Box */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <BuildingOfficeIcon className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-900">Enterprise Authentication</p>
            <p className="text-sm text-gray-600 mt-1">
              Your organization uses SAML Single Sign-On for secure authentication. 
              You'll be redirected to your identity provider to complete the sign-in process.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}