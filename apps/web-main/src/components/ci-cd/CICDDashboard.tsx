'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  PlayIcon,
  PauseIcon,
  StopIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  RocketLaunchIcon,
  CogIcon,
  DocumentTextIcon,
  CloudIcon,
  ShieldCheckIcon,
  BeakerIcon,
  CodeBracketIcon,
  ServerIcon,
  GlobeAltIcon,
  UserGroupIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  PlusIcon,
  SparklesIcon,
  BuildingStorefrontIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import {
  PipelineService,
  Pipeline,
  PipelineRun,
  PipelineTemplate,
  DeploymentEnvironment,
  PipelineMetrics
} from '@/lib/ci-cd/pipeline-service';

interface CICDDashboardProps {
  organizationId: string;
  currentUserId: string;
  projectId?: string;
}

type ActiveView = 'overview' | 'pipelines' | 'runs' | 'environments' | 'templates' | 'metrics' | 'settings';

export default function CICDDashboard({
  organizationId,
  currentUserId,
  projectId
}: CICDDashboardProps) {
  const [activeView, setActiveView] = useState<ActiveView>('overview');
  const [pipelineService] = useState(() => new PipelineService());
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [recentRuns, setRecentRuns] = useState<PipelineRun[]>([]);
  const [environments, setEnvironments] = useState<DeploymentEnvironment[]>([]);
  const [templates, setTemplates] = useState<PipelineTemplate[]>([]);
  const [metrics, setMetrics] = useState<PipelineMetrics | null>(null);
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null);
  const [selectedRun, setSelectedRun] = useState<PipelineRun | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [organizationId, projectId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [pipelinesData, runsData, environmentsData, templatesData, metricsData] = await Promise.all([
        projectId 
          ? pipelineService.getPipelinesByProject(projectId)
          : pipelineService.getPipelinesByOrganization(organizationId),
        pipelineService.getRecentRuns(organizationId, 20),
        pipelineService.getEnvironments(organizationId),
        pipelineService.getPipelineTemplates(),
        pipelineService.getPipelineMetrics(organizationId)
      ]);

      setPipelines(pipelinesData);
      setRecentRuns(runsData);
      setEnvironments(environmentsData);
      setTemplates(templatesData);
      setMetrics(metricsData);
    } catch (error) {
      console.error('Failed to load CI/CD data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTriggerPipeline = async (pipelineId: string) => {
    try {
      await pipelineService.triggerPipeline(pipelineId, {
        type: 'manual',
        user: currentUserId
      });
      loadData(); // Refresh data
    } catch (error) {
      console.error('Failed to trigger pipeline:', error);
    }
  };

  const handleCreatePipelineFromTemplate = async (templateId: string) => {
    try {
      await pipelineService.createPipelineFromTemplate(templateId, {
        name: `New Pipeline from ${templates.find(t => t.id === templateId)?.name}`,
        description: 'Auto-generated pipeline from template',
        organizationId,
        projectId: projectId || 'default-project'
      });
      loadData(); // Refresh data
    } catch (error) {
      console.error('Failed to create pipeline from template:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'running': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'canceled': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return CheckCircleIcon;
      case 'running': return ArrowPathIcon;
      case 'pending': return ClockIcon;
      case 'failed': return XCircleIcon;
      case 'canceled': return StopIcon;
      default: return ClockIcon;
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getStageIcon = (stageType: string) => {
    switch (stageType) {
      case 'build': return CodeBracketIcon;
      case 'test': return BeakerIcon;
      case 'security': return ShieldCheckIcon;
      case 'quality': return ChartBarIcon;
      case 'deploy': return RocketLaunchIcon;
      case 'ai_review': return SparklesIcon;
      case 'approval': return UserGroupIcon;
      default: return CogIcon;
    }
  };

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: ChartBarIcon, count: pipelines.length },
    { id: 'pipelines', label: 'Pipelines', icon: BuildingStorefrontIcon, count: pipelines.filter(p => p.status === 'active').length },
    { id: 'runs', label: 'Recent Runs', icon: PlayIcon, count: recentRuns.filter(r => r.status === 'running').length },
    { id: 'environments', label: 'Environments', icon: ServerIcon, count: environments.length },
    { id: 'templates', label: 'Templates', icon: DocumentTextIcon, count: templates.length },
    { id: 'metrics', label: 'Metrics', icon: ChartBarIcon },
    { id: 'settings', label: 'Settings', icon: AdjustmentsHorizontalIcon }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CI/CD Pipeline Management</h1>
          <p className="text-gray-600">Advanced continuous integration and deployment platform</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleCreatePipelineFromTemplate(templates[0]?.id)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            disabled={!templates.length}
          >
            <PlusIcon className="h-5 w-5" />
            <span>New Pipeline</span>
          </button>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <ArrowPathIcon className="h-5 w-5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {navigationItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as ActiveView)}
              className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                activeView === item.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
              {item.count !== undefined && (
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview */}
      {activeView === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* DORA Metrics Cards */}
          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <RocketLaunchIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Deployment Frequency</p>
                    <p className="text-2xl font-semibold text-gray-900">{metrics.deploymentFrequency.toFixed(1)}/day</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <ClockIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Lead Time</p>
                    <p className="text-2xl font-semibold text-gray-900">{metrics.leadTimeForChanges}h</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <CheckCircleIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Success Rate</p>
                    <p className="text-2xl font-semibold text-gray-900">{Math.round(metrics.successRate)}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <ArrowPathIcon className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">MTTR</p>
                    <p className="text-2xl font-semibold text-gray-900">{metrics.meanTimeToRecovery.toFixed(1)}h</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Pipeline Runs */}
            <div className="bg-white rounded-lg shadow border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Recent Pipeline Runs</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentRuns.slice(0, 5).map(run => {
                    const StatusIcon = getStatusIcon(run.status);
                    return (
                      <div
                        key={run.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                        onClick={() => setSelectedRun(run)}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-lg ${getStatusColor(run.status)}`}>
                            <StatusIcon className={`h-5 w-5 ${run.status === 'running' ? 'animate-spin' : ''}`} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">#{run.runNumber} {run.pipelineName}</p>
                            <p className="text-sm text-gray-600">
                              {run.trigger.branch} • {run.trigger.user} • {new Date(run.startedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {run.duration && (
                            <p className="text-sm font-medium text-gray-900">{formatDuration(run.duration)}</p>
                          )}
                          <p className="text-xs text-gray-600">{run.stages.length} stages</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Active Pipelines */}
            <div className="bg-white rounded-lg shadow border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Active Pipelines</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {pipelines.filter(p => p.status === 'active').slice(0, 5).map(pipeline => (
                    <div key={pipeline.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <BuildingStorefrontIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{pipeline.name}</p>
                          <p className="text-sm text-gray-600">
                            {pipeline.successRate.toFixed(1)}% success • {pipeline.stages.length} stages
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleTriggerPipeline(pipeline.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
                      >
                        <PlayIcon className="h-4 w-4" />
                        <span>Run</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Pipelines */}
      {activeView === 'pipelines' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Pipelines</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pipelines.map(pipeline => (
                  <div key={pipeline.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-900">{pipeline.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        pipeline.status === 'active' ? 'bg-green-100 text-green-600' :
                        pipeline.status === 'paused' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {pipeline.status}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{pipeline.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-900">Success Rate:</span>
                        <p className="text-gray-600">{pipeline.successRate.toFixed(1)}%</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Avg Duration:</span>
                        <p className="text-gray-600">{pipeline.averageDuration.toFixed(1)}m</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Stages:</span>
                        <p className="text-gray-600">{pipeline.stages.length}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Last Run:</span>
                        <p className="text-gray-600">
                          {pipeline.lastRun ? new Date(pipeline.lastRun).toLocaleDateString() : 'Never'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleTriggerPipeline(pipeline.id)}
                        disabled={pipeline.status !== 'active'}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
                      >
                        <PlayIcon className="h-4 w-4" />
                        <span>Run</span>
                      </button>
                      <button
                        onClick={() => setSelectedPipeline(pipeline)}
                        className="border border-gray-300 hover:border-gray-400 text-gray-700 px-3 py-1 rounded text-sm flex items-center space-x-1"
                      >
                        <EyeIcon className="h-4 w-4" />
                        <span>View</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Pipeline Runs */}
      {activeView === 'runs' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Pipeline Runs</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentRuns.map(run => {
                  const StatusIcon = getStatusIcon(run.status);
                  return (
                    <div
                      key={run.id}
                      className="p-6 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer"
                      onClick={() => setSelectedRun(run)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className={`p-2 rounded-lg ${getStatusColor(run.status)}`}>
                              <StatusIcon className={`h-5 w-5 ${run.status === 'running' ? 'animate-spin' : ''}`} />
                            </div>
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900">
                                #{run.runNumber} {run.pipelineName}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {run.trigger.commit} • {run.trigger.branch} • {run.trigger.user}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
                            <span className="flex items-center space-x-1">
                              <CalendarIcon className="h-4 w-4" />
                              <span>{new Date(run.startedAt).toLocaleString()}</span>
                            </span>
                            {run.duration && (
                              <span className="flex items-center space-x-1">
                                <ClockIcon className="h-4 w-4" />
                                <span>{formatDuration(run.duration)}</span>
                              </span>
                            )}
                            <span className="flex items-center space-x-1">
                              <BuildingStorefrontIcon className="h-4 w-4" />
                              <span>{run.stages.length} stages</span>
                            </span>
                          </div>

                          {/* Stages Progress */}
                          <div className="flex items-center space-x-2">
                            {run.stages.map(stage => {
                              const StageIcon = getStageIcon(stage.stageName.toLowerCase());
                              const stageStatusColor = getStatusColor(stage.status);
                              return (
                                <div
                                  key={stage.id}
                                  className={`p-2 rounded-lg ${stageStatusColor}`}
                                  title={`${stage.stageName}: ${stage.status}`}
                                >
                                  <StageIcon className="h-4 w-4" />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Environments */}
      {activeView === 'environments' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Deployment Environments</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {environments.map(env => (
                  <div key={env.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-900">{env.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        env.type === 'production' ? 'bg-red-100 text-red-600' :
                        env.type === 'staging' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        {env.type}
                      </span>
                    </div>

                    {env.url && (
                      <div className="mb-4">
                        <a
                          href={env.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                        >
                          <GlobeAltIcon className="h-4 w-4" />
                          <span className="text-sm">{env.url}</span>
                        </a>
                      </div>
                    )}

                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-900">Protection Rules:</span>
                        <p className="text-gray-600">{env.protectionRules.length} rules</p>
                      </div>
                      {env.approvers && (
                        <div>
                          <span className="font-medium text-gray-900">Approvers:</span>
                          <p className="text-gray-600">{env.approvers.length} configured</p>
                        </div>
                      )}
                      {env.lastDeployment && (
                        <div>
                          <span className="font-medium text-gray-900">Last Deployment:</span>
                          <p className="text-gray-600">
                            {env.lastDeployment.version} • {new Date(env.lastDeployment.deployedAt).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Templates */}
      {activeView === 'templates' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Pipeline Templates</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map(template => (
                  <div key={template.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-900">{template.name}</h4>
                      {template.isOfficial && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs">Official</span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-4">{template.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-900">Category:</span>
                        <p className="text-gray-600 capitalize">{template.category}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Language:</span>
                        <p className="text-gray-600 capitalize">{template.language || 'Any'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Stages:</span>
                        <p className="text-gray-600">{template.stages.length}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Popularity:</span>
                        <p className="text-gray-600">{template.popularity}%</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCreatePipelineFromTemplate(template.id)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Use Template
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Metrics */}
      {activeView === 'metrics' && metrics && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Stage Performance */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Stage Performance</h3>
              <div className="space-y-4">
                {metrics.stageMetrics.slice(0, 5).map(stage => (
                  <div key={stage.stageName} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {React.createElement(getStageIcon(stage.stageName.toLowerCase()), { className: 'h-4 w-4 text-gray-600' })}
                      </div>
                      <span className="font-medium text-gray-900">{stage.stageName}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{stage.successRate.toFixed(1)}%</p>
                      <p className="text-xs text-gray-600">{formatDuration(stage.averageDuration)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resource Usage */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resource Usage</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Compute Hours</span>
                  <span className="font-medium text-gray-900">{metrics.resourceUsage.totalComputeHours.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Cost Estimate</span>
                  <span className="font-medium text-gray-900">${metrics.resourceUsage.costEstimate.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Peak Concurrency</span>
                  <span className="font-medium text-gray-900">{metrics.resourceUsage.peakConcurrency}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Failing Jobs */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Failing Jobs</h3>
            <div className="space-y-3">
              {metrics.topFailingJobs.slice(0, 5).map((job, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium text-gray-900">{job.jobName}</span>
                    <p className="text-sm text-gray-600">{job.failureCount} failures</p>
                  </div>
                  <div className="text-right">
                    <span className="text-red-600 font-medium">{job.failureRate.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Settings */}
      {activeView === 'settings' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">CI/CD Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Auto-deploy to Staging</h4>
                  <p className="text-sm text-gray-600">Automatically deploy successful builds to staging environment</p>
                </div>
                <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Enabled</button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Parallel Job Execution</h4>
                  <p className="text-sm text-gray-600">Run pipeline jobs in parallel when possible</p>
                </div>
                <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Enabled</button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">AI-powered Optimizations</h4>
                  <p className="text-sm text-gray-600">Use AI to optimize pipeline performance and suggest improvements</p>
                </div>
                <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Enabled</button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Pipeline Detail Modal */}
      {selectedPipeline && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-96 overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">{selectedPipeline.name}</h3>
                <button
                  onClick={() => setSelectedPipeline(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Pipeline Stages</h4>
                <div className="space-y-3">
                  {selectedPipeline.stages.map(stage => {
                    const StageIcon = getStageIcon(stage.type);
                    return (
                      <div key={stage.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <StageIcon className="h-6 w-6 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{stage.name}</h5>
                          <p className="text-sm text-gray-600">{stage.jobs.length} jobs • {stage.timeout}m timeout</p>
                        </div>
                        {stage.allowFailure && (
                          <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-1 rounded">Allow Failure</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Run Detail Modal */}
      {selectedRun && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-96 overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  #{selectedRun.runNumber} {selectedRun.pipelineName}
                </h3>
                <button
                  onClick={() => setSelectedRun(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Run Details</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(selectedRun.status)}`}>
                        {selectedRun.status}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Branch:</span>
                      <span className="ml-2 font-medium">{selectedRun.trigger.branch}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Commit:</span>
                      <span className="ml-2 font-mono text-xs">{selectedRun.trigger.commit}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Duration:</span>
                      <span className="ml-2 font-medium">
                        {selectedRun.duration ? formatDuration(selectedRun.duration) : 'Running...'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <h4 className="font-semibold text-gray-900 mb-2">Stages Progress</h4>
                  <div className="space-y-3">
                    {selectedRun.stages.map(stage => {
                      const StageIcon = getStageIcon(stage.stageName.toLowerCase());
                      const StatusIcon = getStatusIcon(stage.status);
                      return (
                        <div key={stage.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <StageIcon className="h-5 w-5 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h5 className="font-medium text-gray-900">{stage.stageName}</h5>
                              <div className={`p-1 rounded-full ${getStatusColor(stage.status)}`}>
                                <StatusIcon className={`h-4 w-4 ${stage.status === 'running' ? 'animate-spin' : ''}`} />
                              </div>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span>{stage.jobs.length} jobs</span>
                              {stage.duration && <span>{formatDuration(stage.duration)}</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}