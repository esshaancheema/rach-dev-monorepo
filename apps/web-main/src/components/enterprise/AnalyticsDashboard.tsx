'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChartBarIcon,
  PresentationChartLineIcon,
  CurrencyDollarIcon,
  LightBulbIcon,
  ShieldExclamationIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  CalendarIcon,
  DocumentArrowDownIcon,
  CogIcon,
  EyeIcon,
  ClockIcon,
  UserGroupIcon,
  CodeBracketIcon,
  RocketLaunchIcon,
  BeakerIcon,
  GlobeAltIcon,
  FireIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import {
  AnalyticsService,
  ProjectMetrics,
  TeamMetrics,
  OrganizationMetrics,
  Insight,
  Benchmark
} from '@/lib/enterprise/analytics-service';

interface AnalyticsDashboardProps {
  organizationId: string;
  currentUserId: string;
  className?: string;
}

type AnalyticsView = 'overview' | 'projects' | 'teams' | 'financial' | 'insights' | 'reports' | 'realtime';
type TimePeriod = '7d' | '30d' | '90d' | '1y';

interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: any;
  color: string;
  description?: string;
}

export default function AnalyticsDashboard({
  organizationId,
  currentUserId,
  className
}: AnalyticsDashboardProps) {
  const [analyticsService] = useState(() => new AnalyticsService());
  const [activeView, setActiveView] = useState<AnalyticsView>('overview');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('30d');
  
  // Data state
  const [organizationMetrics, setOrganizationMetrics] = useState<OrganizationMetrics | null>(null);
  const [projectMetrics, setProjectMetrics] = useState<ProjectMetrics[]>([]);
  const [teamMetrics, setTeamMetrics] = useState<TeamMetrics[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [benchmarks, setBenchmarks] = useState<Benchmark[]>([]);
  const [realtimeData, setRealtimeData] = useState<any>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<{ [key: string]: any[] }>({});
  
  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date()
  });

  useEffect(() => {
    loadAnalyticsData();
    
    // Set up real-time updates
    const interval = setInterval(loadRealtimeData, 30000);
    return () => clearInterval(interval);
  }, [organizationId, timePeriod]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const [orgMetrics, projMetrics, teamMet, orgInsights, orgBenchmarks] = await Promise.all([
        analyticsService.getOrganizationMetrics(organizationId),
        analyticsService.getProjectMetricsByOrganization(organizationId),
        analyticsService.getTeamMetricsByOrganization(organizationId),
        analyticsService.generateInsights(organizationId),
        analyticsService.getBenchmarks()
      ]);

      setOrganizationMetrics(orgMetrics);
      setProjectMetrics(projMetrics);
      setTeamMetrics(teamMet);
      setInsights(orgInsights);
      setBenchmarks(orgBenchmarks);

      // Load time series data for key metrics
      const timeSeriesMetrics = ['developmentVelocity', 'codeQuality', 'aiUsage', 'cost'];
      const timeSeriesPromises = timeSeriesMetrics.map(async (metric) => {
        const data = await analyticsService.getTimeSeriesData(organizationId, metric, dateRange);
        return { metric, data };
      });

      const timeSeriesResults = await Promise.all(timeSeriesPromises);
      const timeSeriesMap = timeSeriesResults.reduce((acc, { metric, data }) => {
        acc[metric] = data;
        return acc;
      }, {} as { [key: string]: any[] });

      setTimeSeriesData(timeSeriesMap);
      
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRealtimeData = async () => {
    try {
      const realtime = await analyticsService.getRealtimeMetrics(organizationId);
      setRealtimeData(realtime);
    } catch (error) {
      console.error('Failed to load realtime data:', error);
    }
  };

  const getTimePeriodDates = (period: TimePeriod) => {
    const end = new Date();
    const start = new Date();
    
    switch (period) {
      case '7d': start.setDate(end.getDate() - 7); break;
      case '30d': start.setDate(end.getDate() - 30); break;
      case '90d': start.setDate(end.getDate() - 90); break;
      case '1y': start.setFullYear(end.getFullYear() - 1); break;
    }
    
    return { start, end };
  };

  const formatMetricValue = (value: number, type: 'number' | 'percentage' | 'currency' | 'duration' = 'number'): string => {
    switch (type) {
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'currency':
        return `$${value.toLocaleString()}`;
      case 'duration':
        return `${value.toFixed(1)}h`;
      default:
        return value.toLocaleString();
    }
  };

  const getChangeIcon = (changeType: 'positive' | 'negative' | 'neutral') => {
    switch (changeType) {
      case 'positive': return <ArrowUpIcon className="h-4 w-4 text-green-500" />;
      case 'negative': return <ArrowDownIcon className="h-4 w-4 text-red-500" />;
      default: return <ArrowUpIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend': return <ArrowUpIcon className="h-5 w-5" />;
      case 'anomaly': return <ExclamationTriangleIcon className="h-5 w-5" />;
      case 'recommendation': return <LightBulbIcon className="h-5 w-5" />;
      case 'alert': return <ShieldExclamationIcon className="h-5 w-5" />;
      case 'opportunity': return <FireIcon className="h-5 w-5" />;
      default: return <InformationCircleIcon className="h-5 w-5" />;
    }
  };

  const getInsightColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'border-red-200 bg-red-50 text-red-800';
      case 'high': return 'border-orange-200 bg-orange-50 text-orange-800';
      case 'medium': return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      case 'low': return 'border-blue-200 bg-blue-50 text-blue-800';
      default: return 'border-gray-200 bg-gray-50 text-gray-800';
    }
  };

  const getMetricCards = (): MetricCard[] => {
    if (!organizationMetrics) return [];

    return [
      {
        title: 'Total Projects',
        value: organizationMetrics.executive.totalProjects,
        change: 12.5,
        changeType: 'positive',
        icon: CodeBracketIcon,
        color: 'text-blue-600 bg-blue-100',
        description: '8 active projects'
      },
      {
        title: 'Development Velocity',
        value: `${organizationMetrics.executive.developmentVelocity}/month`,
        change: -5.2,
        changeType: 'negative',
        icon: RocketLaunchIcon,
        color: 'text-purple-600 bg-purple-100',
        description: 'Projects delivered per month'
      },
      {
        title: 'AI Cost Savings',
        value: formatMetricValue(organizationMetrics.financial.costSavings, 'currency'),
        change: 28.3,
        changeType: 'positive',
        icon: CurrencyDollarIcon,
        color: 'text-green-600 bg-green-100',
        description: 'Compared to traditional development'
      },
      {
        title: 'Team Satisfaction',
        value: formatMetricValue(organizationMetrics.executive.customerSatisfaction, 'percentage'),
        change: 8.1,
        changeType: 'positive',
        icon: UserGroupIcon,
        color: 'text-indigo-600 bg-indigo-100',
        description: 'Customer satisfaction score'
      },
      {
        title: 'Security Score',
        value: formatMetricValue(organizationMetrics.riskCompliance.complianceScore, 'percentage'),
        change: 2.4,
        changeType: 'positive',
        icon: ShieldExclamationIcon,
        color: 'text-red-600 bg-red-100',
        description: 'Security and compliance rating'
      },
      {
        title: 'Innovation Index',
        value: formatMetricValue(organizationMetrics.innovation.innovationScore, 'percentage'),
        change: 15.7,
        changeType: 'positive',
        icon: BeakerIcon,
        color: 'text-yellow-600 bg-yellow-100',
        description: 'Innovation and experimentation score'
      }
    ];
  };

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: ChartBarIcon },
    { id: 'projects', label: 'Projects', icon: CodeBracketIcon, count: projectMetrics.length },
    { id: 'teams', label: 'Teams', icon: UserGroupIcon, count: teamMetrics.length },
    { id: 'financial', label: 'Financial', icon: CurrencyDollarIcon },
    { id: 'insights', label: 'Insights', icon: LightBulbIcon, alerts: insights.filter(i => i.impact === 'high' || i.impact === 'critical').length },
    { id: 'reports', label: 'Reports', icon: PresentationChartLineIcon },
    { id: 'realtime', label: 'Real-time', icon: GlobeAltIcon }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading analytics data...</span>
      </div>
    );
  }

  return (
    <div className={cn("bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden", className)}>
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <ChartBarIcon className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
              <p className="text-indigo-100">Comprehensive insights and performance metrics</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-white/10 rounded-lg p-2">
              <CalendarIcon className="h-4 w-4" />
              <select
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value as TimePeriod)}
                className="bg-transparent text-white text-sm focus:outline-none"
              >
                <option value="7d" className="text-gray-900">Last 7 days</option>
                <option value="30d" className="text-gray-900">Last 30 days</option>
                <option value="90d" className="text-gray-900">Last 90 days</option>
                <option value="1y" className="text-gray-900">Last year</option>
              </select>
            </div>
            <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
              <DocumentArrowDownIcon className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Real-time indicators */}
        {realtimeData && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-6">
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-lg font-bold">{realtimeData.activeUsers}</div>
              <div className="text-xs text-indigo-100">Active Users</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-lg font-bold">{realtimeData.activeProjects}</div>
              <div className="text-xs text-indigo-100">Active Projects</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-lg font-bold">{realtimeData.currentDeployments}</div>
              <div className="text-xs text-indigo-100">Deployments</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-lg font-bold">{realtimeData.aiRequestsPerMinute}</div>
              <div className="text-xs text-indigo-100">AI Req/min</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-lg font-bold">{realtimeData.systemHealth}%</div>
              <div className="text-xs text-indigo-100">System Health</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-lg font-bold">{realtimeData.alerts}</div>
              <div className="text-xs text-indigo-100">Active Alerts</div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6 overflow-x-auto">
          {navigationItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as AnalyticsView)}
              className={cn(
                "flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap",
                activeView === item.id
                  ? "border-indigo-500 text-indigo-600"
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
        {/* Overview Tab */}
        {activeView === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getMetricCards().map((metric, index) => (
                <motion.div
                  key={metric.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", metric.color)}>
                        <metric.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{metric.title}</h3>
                        <div className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        {getChangeIcon(metric.changeType)}
                        <span className={cn(
                          "text-sm font-medium",
                          metric.changeType === 'positive' ? "text-green-600" :
                          metric.changeType === 'negative' ? "text-red-600" : "text-gray-600"
                        )}>
                          {Math.abs(metric.change)}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Development Velocity Chart */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Development Velocity</h3>
                  <div className="text-sm text-gray-500">Projects per month</div>
                </div>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <ArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Chart visualization would go here</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {timeSeriesData.developmentVelocity?.length || 0} data points
                    </p>
                  </div>
                </div>
              </div>

              {/* AI Usage Chart */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">AI Token Usage</h3>
                  <div className="text-sm text-gray-500">Tokens per day</div>
                </div>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BeakerIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">AI usage trends would be visualized here</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {timeSeriesData.aiUsage?.length || 0} data points
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Insights and Recommendations */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">AI-Powered Insights</h3>
                <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                  View All →
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights.slice(0, 4).map(insight => (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn("border rounded-lg p-4", getInsightColor(insight.impact))}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getInsightIcon(insight.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold">{insight.title}</h4>
                        <p className="text-sm mt-1">{insight.description}</p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs font-medium px-2 py-1 bg-white/50 rounded">
                            {insight.confidence}% confidence
                          </span>
                          <span className="text-xs capitalize">{insight.impact} impact</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Projects Tab */}
        {activeView === 'projects' && (
          <motion.div
            key="projects"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Project Analytics</h3>
              <div className="flex space-x-3">
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Filter Projects
                </button>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  Compare Projects
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Code Quality
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      AI Usage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deployments
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cost
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {projectMetrics.map(project => (
                    <tr key={project.projectId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                            <CodeBracketIcon className="h-4 w-4 text-indigo-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{project.projectName}</div>
                            <div className="text-sm text-gray-500">{project.createdBy}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                            <div 
                              className="h-2 bg-green-500 rounded-full"
                              style={{ width: `${project.codeQuality.overallScore}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-900">{project.codeQuality.overallScore}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {project.aiUsage.totalTokensUsed.toLocaleString()} tokens
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {project.deployment.successfulDeployments}/{project.deployment.totalDeployments}
                        </span>
                        <span className="text-xs text-green-600 ml-1">
                          ({Math.round((project.deployment.successfulDeployments / project.deployment.totalDeployments) * 100)}%)
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${project.aiUsage.costEstimate.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Financial Tab */}
        {activeView === 'financial' && organizationMetrics && (
          <motion.div
            key="financial"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Financial Analytics</h3>
              <div className="text-sm text-gray-500">Budget utilization: {organizationMetrics.financial.budgetUtilization}%</div>
            </div>

            {/* Cost Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Total Costs</p>
                    <p className="text-2xl font-bold">${organizationMetrics.financial.totalCosts.toLocaleString()}</p>
                  </div>
                  <CurrencyDollarIcon className="h-8 w-8 text-blue-200" />
                </div>
                <div className="mt-4">
                  <div className="text-sm text-blue-100">This month</div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">AI Costs</p>
                    <p className="text-2xl font-bold">${organizationMetrics.financial.aiCosts.toLocaleString()}</p>
                  </div>
                  <BeakerIcon className="h-8 w-8 text-green-200" />
                </div>
                <div className="mt-4">
                  <div className="text-sm text-green-100">
                    {Math.round((organizationMetrics.financial.aiCosts / organizationMetrics.financial.totalCosts) * 100)}% of total
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Cost Savings</p>
                    <p className="text-2xl font-bold">${organizationMetrics.financial.costSavings.toLocaleString()}</p>
                  </div>
                  <ArrowUpIcon className="h-8 w-8 text-purple-200" />
                </div>
                <div className="mt-4">
                  <div className="text-sm text-purple-100">vs traditional development</div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-indigo-100 text-sm">ROI</p>
                    <p className="text-2xl font-bold">{organizationMetrics.executive.roi}%</p>
                  </div>
                  <FireIcon className="h-8 w-8 text-indigo-200" />
                </div>
                <div className="mt-4">
                  <div className="text-sm text-indigo-100">Return on investment</div>
                </div>
              </div>
            </div>

            {/* Cost Breakdown Chart */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Cost Breakdown</h4>
              <div className="space-y-4">
                {[
                  { label: 'AI Services', value: organizationMetrics.financial.aiCosts, color: 'bg-blue-500' },
                  { label: 'Infrastructure', value: organizationMetrics.financial.infrastructureCosts, color: 'bg-green-500' },
                  { label: 'Development', value: organizationMetrics.financial.developmentCosts, color: 'bg-purple-500' },
                  { label: 'Operations', value: organizationMetrics.financial.operationalCosts, color: 'bg-yellow-500' }
                ].map(item => {
                  const percentage = (item.value / organizationMetrics.financial.totalCosts) * 100;
                  return (
                    <div key={item.label} className="flex items-center space-x-4">
                      <div className="w-24 text-sm text-gray-700">{item.label}</div>
                      <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full rounded-full", item.color)}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="w-20 text-sm text-gray-900 text-right">
                        ${item.value.toLocaleString()}
                      </div>
                      <div className="w-12 text-sm text-gray-500 text-right">
                        {percentage.toFixed(1)}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Insights Tab */}
        {activeView === 'insights' && (
          <motion.div
            key="insights"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">AI-Powered Insights</h3>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Generate New Insights
              </button>
            </div>

            <div className="space-y-4">
              {insights.map(insight => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("border rounded-lg p-6", getInsightColor(insight.impact))}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {getInsightIcon(insight.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-lg font-semibold">{insight.title}</h4>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-medium px-2 py-1 bg-white/70 rounded">
                            {insight.confidence}% confidence
                          </span>
                          <span className="text-xs font-medium px-2 py-1 bg-white/70 rounded capitalize">
                            {insight.impact} impact
                          </span>
                        </div>
                      </div>
                      <p className="text-sm mb-4">{insight.description}</p>
                      
                      {insight.actions && insight.actions.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium">Recommended Actions:</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {insight.actions.map((action, index) => (
                              <div key={index} className="bg-white/50 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-1">
                                  <h6 className="text-sm font-medium">{action.title}</h6>
                                  <span className={cn(
                                    "text-xs px-2 py-0.5 rounded-full",
                                    action.priority === 'high' ? 'bg-red-100 text-red-800' :
                                    action.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-green-100 text-green-800'
                                  )}>
                                    {action.priority}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-700">{action.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Reports Tab */}
        {activeView === 'reports' && (
          <motion.div
            key="reports"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Custom Reports</h3>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Create Report
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { type: 'Executive Summary', description: 'High-level organizational metrics', icon: BuildingOfficeIcon },
                { type: 'Team Performance', description: 'Detailed team analytics and insights', icon: UserGroupIcon },
                { type: 'Project Deep Dive', description: 'Comprehensive project analysis', icon: CodeBracketIcon },
                { type: 'Financial Report', description: 'Cost analysis and budget tracking', icon: CurrencyDollarIcon },
                { type: 'Security Assessment', description: 'Security and compliance overview', icon: ShieldExclamationIcon },
                { type: 'Innovation Metrics', description: 'Innovation and experimentation tracking', icon: BeakerIcon }
              ].map(report => (
                <div key={report.type} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <report.icon className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{report.type}</h4>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{report.description}</p>
                  <div className="flex space-x-2">
                    <button className="flex-1 px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">
                      Generate
                    </button>
                    <button className="px-3 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50">
                      <EyeIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Real-time Tab */}
        {activeView === 'realtime' && realtimeData && (
          <motion.div
            key="realtime"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Real-time Monitoring</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>Live data • Updated every 30s</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900">System Health</h4>
                  <div className={cn(
                    "w-3 h-3 rounded-full",
                    realtimeData.systemHealth > 95 ? "bg-green-500" :
                    realtimeData.systemHealth > 85 ? "bg-yellow-500" : "bg-red-500"
                  )} />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {realtimeData.systemHealth}%
                </div>
                <div className="text-sm text-gray-600">All systems operational</div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900">Active Users</h4>
                  <UserGroupIcon className="h-5 w-5 text-gray-400" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {realtimeData.activeUsers}
                </div>
                <div className="text-sm text-gray-600">Currently online</div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900">AI Requests</h4>
                  <BeakerIcon className="h-5 w-5 text-gray-400" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {realtimeData.aiRequestsPerMinute}
                </div>
                <div className="text-sm text-gray-600">Requests per minute</div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Activity Feed</h4>
              <div className="space-y-3">
                {Array.from({ length: 5 }, (_, i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                    <div>
                      <p className="text-sm text-gray-900">
                        User {String.fromCharCode(65 + i)} deployed project to production
                      </p>
                      <p className="text-xs text-gray-500">{i + 1} minute{i !== 0 ? 's' : ''} ago</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}