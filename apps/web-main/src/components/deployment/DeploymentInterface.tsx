'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RocketLaunchIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  CogIcon,
  LinkIcon,
  EyeIcon,
  DocumentDuplicateIcon,
  ArrowTopRightOnSquareIcon,
  XMarkIcon,
  InformationCircleIcon,
  GlobeAltIcon,
  ServerIcon,
  CubeIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { 
  DeploymentManager, 
  DeploymentProvider, 
  DeploymentConfig, 
  DeploymentStatus,
  DeploymentResult,
  DEPLOYMENT_PROVIDERS 
} from '@/lib/deployment/deployment-manager';
import { EnhancedGenerationResult } from '@/lib/ai/enhanced-code-generator';

interface DeploymentInterfaceProps {
  project: EnhancedGenerationResult;
  onDeploymentComplete?: (result: DeploymentResult) => void;
  className?: string;
}

interface DeploymentStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  active: boolean;
  error?: string;
}

export default function DeploymentInterface({
  project,
  onDeploymentComplete,
  className
}: DeploymentInterfaceProps) {
  const [selectedProvider, setSelectedProvider] = useState<DeploymentProvider | null>(null);
  const [deploymentConfig, setDeploymentConfig] = useState<Partial<DeploymentConfig>>({
    projectName: project.title.toLowerCase().replace(/\s+/g, '-'),
    framework: project.framework,
    buildCommand: 'npm run build',
    outputDirectory: 'dist',
    environmentVariables: {}
  });
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState<DeploymentStatus | null>(null);
  const [deploymentResult, setDeploymentResult] = useState<DeploymentResult | null>(null);
  const [activeStep, setActiveStep] = useState<'provider' | 'config' | 'deploy' | 'complete'>('provider');
  const [showAdvancedConfig, setShowAdvancedConfig] = useState(false);
  const [envVarInput, setEnvVarInput] = useState({ key: '', value: '' });

  const deploymentManager = new DeploymentManager();

  const handleProviderSelect = (provider: DeploymentProvider) => {
    setSelectedProvider(provider);
    setDeploymentConfig(prev => ({
      ...prev,
      providerId: provider.id,
      buildCommand: getBuildCommand(provider.id, project.framework),
      outputDirectory: getOutputDirectory(provider.id, project.framework)
    }));
    setActiveStep('config');
  };

  const handleConfigUpdate = (updates: Partial<DeploymentConfig>) => {
    setDeploymentConfig(prev => ({ ...prev, ...updates }));
  };

  const addEnvironmentVariable = () => {
    if (envVarInput.key && envVarInput.value) {
      setDeploymentConfig(prev => ({
        ...prev,
        environmentVariables: {
          ...prev.environmentVariables,
          [envVarInput.key]: envVarInput.value
        }
      }));
      setEnvVarInput({ key: '', value: '' });
    }
  };

  const removeEnvironmentVariable = (key: string) => {
    setDeploymentConfig(prev => ({
      ...prev,
      environmentVariables: {
        ...prev.environmentVariables
      }
    }));
    const newEnvVars = { ...deploymentConfig.environmentVariables };
    delete newEnvVars[key];
    setDeploymentConfig(prev => ({ ...prev, environmentVariables: newEnvVars }));
  };

  const startDeployment = async () => {
    if (!selectedProvider || !deploymentConfig.providerId) return;

    setIsDeploying(true);
    setActiveStep('deploy');
    
    try {
      const config: DeploymentConfig = {
        providerId: deploymentConfig.providerId!,
        projectName: deploymentConfig.projectName!,
        framework: deploymentConfig.framework!,
        buildCommand: deploymentConfig.buildCommand!,
        outputDirectory: deploymentConfig.outputDirectory!,
        environmentVariables: deploymentConfig.environmentVariables!,
        customDomain: deploymentConfig.customDomain,
        redirects: deploymentConfig.redirects,
        headers: deploymentConfig.headers
      };

      const result = await deploymentManager.deployProject(
        project, 
        config,
        (status) => {
          setDeploymentStatus(status);
        }
      );

      setDeploymentResult(result);
      setActiveStep('complete');
      onDeploymentComplete?.(result);

    } catch (error) {
      console.error('Deployment failed:', error);
    } finally {
      setIsDeploying(false);
    }
  };

  const getBuildCommand = (providerId: string, framework: string): string => {
    switch (framework) {
      case 'react':
        return providerId === 'heroku' ? 'npm start' : 'npm run build';
      case 'vue':
        return 'npm run build';
      case 'vanilla':
        return 'npm run build';
      default:
        return 'npm run build';
    }
  };

  const getOutputDirectory = (providerId: string, framework: string): string => {
    switch (framework) {
      case 'react':
        return 'build';
      case 'vue':
        return 'dist';
      case 'vanilla':
        return 'dist';
      default:
        return 'dist';
    }
  };

  const getProviderIcon = (provider: DeploymentProvider) => {
    switch (provider.id) {
      case 'vercel':
      case 'netlify':
        return <RocketLaunchIcon className="h-8 w-8" />;
      case 'github-pages':
        return <CubeIcon className="h-8 w-8" />;
      case 'heroku':
        return <ServerIcon className="h-8 w-8" />;
      case 'aws-amplify':
        return <CloudArrowUpIcon className="h-8 w-8" />;
      case 'firebase':
        return <BoltIcon className="h-8 w-8" />;
      default:
        return <GlobeAltIcon className="h-8 w-8" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'moderate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600';
      case 'building': return 'text-blue-600';
      case 'deployed': return 'text-green-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'building':
        return <CogIcon className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'deployed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <ExclamationCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const deploymentSteps: DeploymentStep[] = [
    {
      id: 'provider',
      title: 'Choose Provider',
      description: 'Select deployment platform',
      completed: activeStep !== 'provider',
      active: activeStep === 'provider'
    },
    {
      id: 'config',
      title: 'Configure',
      description: 'Set deployment options',
      completed: ['deploy', 'complete'].includes(activeStep),
      active: activeStep === 'config'
    },
    {
      id: 'deploy',
      title: 'Deploy',
      description: 'Build and deploy project',
      completed: activeStep === 'complete',
      active: activeStep === 'deploy'
    },
    {
      id: 'complete',
      title: 'Complete',
      description: 'Deployment finished',
      completed: activeStep === 'complete' && deploymentResult?.success,
      active: activeStep === 'complete',
      error: activeStep === 'complete' && !deploymentResult?.success ? deploymentResult?.error : undefined
    }
  ];

  return (
    <div className={cn("bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden", className)}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <RocketLaunchIcon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Deploy Project</h2>
              <p className="text-blue-100 text-sm">{project.title} • {project.framework}</p>
            </div>
          </div>
          
          {selectedProvider && (
            <div className="flex items-center space-x-2 bg-white/20 rounded-lg px-3 py-2">
              {getProviderIcon(selectedProvider)}
              <span className="font-medium">{selectedProvider.name}</span>
            </div>
          )}
        </div>

        {/* Progress Steps */}
        <div className="mt-6 flex items-center justify-between">
          {deploymentSteps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                  step.completed ? "bg-green-500 text-white" :
                  step.active ? "bg-white text-blue-600" :
                  step.error ? "bg-red-500 text-white" :
                  "bg-white/20 text-blue-100"
                )}>
                  {step.completed ? (
                    <CheckCircleIcon className="h-5 w-5" />
                  ) : step.error ? (
                    <ExclamationCircleIcon className="h-5 w-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="text-sm">
                  <div className={cn("font-medium", step.active ? "text-white" : "text-blue-100")}>
                    {step.title}
                  </div>
                  <div className="text-xs text-blue-200">{step.description}</div>
                </div>
              </div>
              
              {index < deploymentSteps.length - 1 && (
                <div className={cn(
                  "w-12 h-0.5 mx-4 transition-colors",
                  step.completed ? "bg-green-400" : "bg-white/20"
                )} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {activeStep === 'provider' && (
            <motion.div
              key="provider"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Choose Deployment Platform</h3>
                <p className="text-gray-600">Select where you want to deploy your {project.framework} application</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DEPLOYMENT_PROVIDERS
                  .filter(provider => provider.supportedFrameworks.includes(project.framework))
                  .map(provider => (
                    <button
                      key={provider.id}
                      onClick={() => handleProviderSelect(provider)}
                      className={cn(
                        "p-6 border-2 rounded-xl text-left transition-all duration-200 hover:shadow-lg",
                        selectedProvider?.id === provider.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={cn(
                            "p-2 rounded-lg",
                            selectedProvider?.id === provider.id ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
                          )}>
                            {getProviderIcon(provider)}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{provider.name}</h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={cn("px-2 py-1 text-xs font-medium rounded", getDifficultyColor(provider.difficulty))}>
                                {provider.difficulty}
                              </span>
                              {provider.pricing.free && (
                                <span className="px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800">
                                  Free Plan
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-4">{provider.description}</p>

                      <div className="space-y-3">
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-1">Features:</h5>
                          <div className="flex flex-wrap gap-1">
                            {provider.features.slice(0, 3).map(feature => (
                              <span key={feature} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Build time: {provider.buildTime}</span>
                          <span className="text-gray-500">
                            {provider.limits.sites ? `${provider.limits.sites} sites` : 'Unlimited sites'}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
              </div>
            </motion.div>
          )}

          {activeStep === 'config' && selectedProvider && (
            <motion.div
              key="config"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Configure Deployment</h3>
                <p className="text-gray-600">Set up your deployment configuration for {selectedProvider.name}</p>
              </div>

              {/* Basic Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
                  <input
                    type="text"
                    value={deploymentConfig.projectName || ''}
                    onChange={(e) => handleConfigUpdate({ projectName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="my-awesome-project"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Framework</label>
                  <input
                    type="text"
                    value={deploymentConfig.framework || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Build Command</label>
                  <input
                    type="text"
                    value={deploymentConfig.buildCommand || ''}
                    onChange={(e) => handleConfigUpdate({ buildCommand: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="npm run build"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Output Directory</label>
                  <input
                    type="text"
                    value={deploymentConfig.outputDirectory || ''}
                    onChange={(e) => handleConfigUpdate({ outputDirectory: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="dist"
                  />
                </div>
              </div>

              {/* Environment Variables */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-md font-medium text-gray-900">Environment Variables</h4>
                  <button
                    onClick={() => setShowAdvancedConfig(!showAdvancedConfig)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    {showAdvancedConfig ? 'Hide Advanced' : 'Show Advanced'}
                  </button>
                </div>

                <div className="space-y-3">
                  {Object.entries(deploymentConfig.environmentVariables || {}).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-sm font-medium text-gray-700">{key}</span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">{value}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeEnvironmentVariable(key)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}

                  <div className="flex space-x-3">
                    <input
                      type="text"
                      placeholder="Variable name"
                      value={envVarInput.key}
                      onChange={(e) => setEnvVarInput(prev => ({ ...prev, key: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Variable value"
                      value={envVarInput.value}
                      onChange={(e) => setEnvVarInput(prev => ({ ...prev, value: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={addEnvironmentVariable}
                      disabled={!envVarInput.key || !envVarInput.value}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Advanced Configuration */}
              {showAdvancedConfig && (
                <div className="border-t border-gray-200 pt-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Custom Domain (Optional)</label>
                    <input
                      type="text"
                      value={deploymentConfig.customDomain || ''}
                      onChange={(e) => handleConfigUpdate({ customDomain: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="my-domain.com"
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between pt-6 border-t border-gray-200">
                <button
                  onClick={() => setActiveStep('provider')}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={startDeployment}
                  disabled={!deploymentConfig.projectName}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <RocketLaunchIcon className="h-4 w-4" />
                  <span>Start Deployment</span>
                </button>
              </div>
            </motion.div>
          )}

          {activeStep === 'deploy' && (
            <motion.div
              key="deploy"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="mb-6 text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Deploying Your Project</h3>
                <p className="text-gray-600">Please wait while we build and deploy your application...</p>
              </div>

              {/* Progress */}
              {deploymentStatus && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(deploymentStatus.status)}
                      <span className={cn("font-medium capitalize", getStatusColor(deploymentStatus.status))}>
                        {deploymentStatus.status}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">{deploymentStatus.progress}%</span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${deploymentStatus.progress}%` }}
                    />
                  </div>

                  {/* Logs */}
                  <div className="max-h-64 overflow-y-auto bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                    {deploymentStatus.logs.map((log, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <span className="text-gray-500 text-xs">
                          {log.timestamp.toLocaleTimeString()}
                        </span>
                        <span className={cn(
                          log.level === 'error' ? 'text-red-400' :
                          log.level === 'warn' ? 'text-yellow-400' :
                          'text-green-400'
                        )}>
                          {log.message}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeStep === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center space-y-6"
            >
              {deploymentResult?.success ? (
                <>
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircleIcon className="h-8 w-8 text-green-600" />
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Deployment Successful!</h3>
                    <p className="text-gray-600">Your project has been deployed successfully</p>
                  </div>

                  {deploymentResult.url && (
                    <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Production URL</h4>
                        <div className="flex items-center justify-center space-x-3">
                          <a
                            href={deploymentResult.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 font-mono text-lg"
                          >
                            {deploymentResult.url}
                          </a>
                          <button
                            onClick={() => navigator.clipboard.writeText(deploymentResult.url!)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                            title="Copy URL"
                          >
                            <DocumentDuplicateIcon className="h-4 w-4" />
                          </button>
                          <a
                            href={deploymentResult.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-gray-400 hover:text-gray-600"
                            title="Open in new tab"
                          >
                            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => deploymentResult.url && window.open(deploymentResult.url, '_blank')}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                    >
                      <EyeIcon className="h-4 w-4" />
                      <span>View Site</span>
                    </button>
                    <button
                      onClick={() => setActiveStep('provider')}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Deploy Another
                    </button>
                  </div>

                  {deploymentResult.metrics && (
                    <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {Math.round(deploymentResult.metrics.buildTime / 1000)}s
                        </div>
                        <div className="text-sm text-gray-500">Build Time</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {Math.round(deploymentResult.metrics.deployTime / 1000)}s
                        </div>
                        <div className="text-sm text-gray-500">Deploy Time</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {deploymentResult.metrics.size}
                        </div>
                        <div className="text-sm text-gray-500">Bundle Size</div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                    <ExclamationCircleIcon className="h-8 w-8 text-red-600" />
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Deployment Failed</h3>
                    <p className="text-red-600 mb-4">{deploymentResult?.error}</p>
                  </div>

                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => setActiveStep('config')}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={() => setActiveStep('provider')}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Choose Different Provider
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}