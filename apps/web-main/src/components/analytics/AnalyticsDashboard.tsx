// Comprehensive Analytics Dashboard Component
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Eye,
  Clock,
  Globe,
  Smartphone,
  Download,
  RefreshCw,
  Calendar,
  Filter,
  PieChart,
  LineChart,
  Activity,
  Target,
  Zap,
  AlertCircle,
  CheckCircle,
  Info,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { 
  analyticsReporting, 
  AnalyticsReport, 
  AnalyticsMetric,
  ConversionFunnel,
  UserSegment,
  formatMetricValue,
  getMetricTrendIcon,
  getInsightTypeColor
} from '@/lib/analytics/reporting';
import { analytics } from '@/lib/analytics/tracker';

interface AnalyticsDashboardProps {
  defaultDateRange?: string;
  showRealTime?: boolean;
}

export function AnalyticsDashboard({
  defaultDateRange = '30d',
  showRealTime = true
}: AnalyticsDashboardProps) {
  const [selectedDateRange, setSelectedDateRange] = useState(defaultDateRange);
  const [selectedReport, setSelectedReport] = useState<'business' | 'users' | 'conversion' | 'segments'>('business');
  const [isLoading, setIsLoading] = useState(true);
  const [reports, setReports] = useState<{
    business?: AnalyticsReport;
    users?: AnalyticsReport;
  }>({});
  const [conversionFunnel, setConversionFunnel] = useState<ConversionFunnel[]>([]);
  const [userSegments, setUserSegments] = useState<UserSegment[]>([]);
  const [realTimeData, setRealTimeData] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAnalyticsData();
    
    if (showRealTime) {
      const interval = setInterval(loadRealTimeData, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [selectedDateRange]);

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);
      
      const dateRange = getDateRange(selectedDateRange);
      
      // Load reports in parallel
      const [businessReport, userReport, funnelData, segmentData] = await Promise.all([
        analyticsReporting.generateBusinessReport(dateRange),
        analyticsReporting.generateUserReport(dateRange),
        analyticsReporting.generateConversionFunnel(['visit', 'signup', 'contact', 'quote', 'project'], dateRange),
        analyticsReporting.generateUserSegments()
      ]);

      setReports({
        business: businessReport,
        users: userReport
      });
      setConversionFunnel(funnelData);
      setUserSegments(segmentData);

      if (showRealTime) {
        await loadRealTimeData();
      }

      analytics.track({
        name: 'analytics_dashboard_loaded',
        category: 'analytics',
        properties: {
          date_range: selectedDateRange,
          report_type: selectedReport
        }
      });

    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRealTimeData = async () => {
    try {
      const data = await analyticsReporting.getRealTimeMetrics();
      setRealTimeData(data);
    } catch (error) {
      console.error('Failed to load real-time data:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalyticsData();
    setRefreshing(false);
  };

  const handleExport = async (format: 'csv' | 'pdf' | 'xlsx') => {
    try {
      const dateRange = getDateRange(selectedDateRange);
      const blob = await analyticsReporting.exportData(selectedReport, format, dateRange);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedReport}-report-${selectedDateRange}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      analytics.track({
        name: 'analytics_report_exported',
        category: 'analytics',
        properties: {
          report_type: selectedReport,
          format,
          date_range: selectedDateRange
        }
      });
    } catch (error) {
      console.error('Failed to export report:', error);
    }
  };

  const getDateRange = (range: string) => {
    const end = new Date();
    const start = new Date();
    
    switch (range) {
      case '7d':
        start.setDate(end.getDate() - 7);
        break;
      case '30d':
        start.setDate(end.getDate() - 30);
        break;
      case '90d':
        start.setDate(end.getDate() - 90);
        break;
      case '1y':
        start.setFullYear(end.getFullYear() - 1);
        break;
      default:
        start.setDate(end.getDate() - 30);
    }
    
    return {
      start: start.toISOString(),
      end: end.toISOString()
    };
  };

  const renderMetricCard = (metric: AnalyticsMetric) => (
    <motion.div
      key={metric.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {metric.name}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
            {formatMetricValue(metric.value, metric.format)}
          </p>
          {metric.changePercent !== undefined && (
            <div className={`flex items-center mt-2 text-sm ${
              metric.trend === 'up' ? 'text-green-600' : 
              metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {metric.trend === 'up' && <ArrowUp className="w-4 h-4 mr-1" />}
              {metric.trend === 'down' && <ArrowDown className="w-4 h-4 mr-1" />}
              {metric.trend === 'stable' && <Minus className="w-4 h-4 mr-1" />}
              <span>
                {Math.abs(metric.changePercent).toFixed(1)}% vs previous period
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${
          metric.trend === 'up' ? 'bg-green-100 text-green-600' :
          metric.trend === 'down' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
        }`}>
          {metric.name.includes('Revenue') && <DollarSign className="w-6 h-6" />}
          {metric.name.includes('Users') && <Users className="w-6 h-6" />}
          {metric.name.includes('Rate') && <Target className="w-6 h-6" />}
          {metric.name.includes('Duration') && <Clock className="w-6 h-6" />}
          {metric.name.includes('Cost') && <TrendingDown className="w-6 h-6" />}
        </div>
      </div>
      {metric.description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
          {metric.description}
        </p>
      )}
    </motion.div>
  );

  const renderConversionFunnel = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
        Conversion Funnel
      </h3>
      <div className="space-y-4">
        {conversionFunnel.map((stage, index) => (
          <div key={stage.stage} className="relative">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  {stage.stage}
                </h4>
                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                  <span>{stage.conversions.toLocaleString()} users</span>
                  <span>{stage.conversionRate.toFixed(1)}% conversion</span>
                  {stage.dropOffRate > 0 && (
                    <span className="text-red-600">
                      {stage.dropOffRate.toFixed(1)}% drop-off
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {stage.conversions.toLocaleString()}
                </div>
                {index > 0 && (
                  <div className="text-xs text-gray-500">
                    -{stage.dropOff.toLocaleString()}
                  </div>
                )}
              </div>
            </div>
            
            {/* Funnel visualization */}
            <div className="mt-2 h-8 bg-gray-200 dark:bg-gray-600 rounded overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                style={{ width: `${(stage.conversions / conversionFunnel[0].conversions) * 100}%` }}
              />
            </div>
            
            {index < conversionFunnel.length - 1 && (
              <div className="flex justify-center mt-2">
                <ArrowDown className="w-4 h-4 text-gray-400" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderUserSegments = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
        User Segments
      </h3>
      <div className="space-y-4">
        {userSegments.map((segment) => (
          <div key={segment.id} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                {segment.name}
              </h4>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {segment.userCount} users
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {segment.description}
            </p>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Revenue:</span>
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {formatMetricValue(segment.revenue, 'currency')}
                </div>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Avg Order:</span>
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {formatMetricValue(segment.avgOrderValue, 'currency')}
                </div>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Conv Rate:</span>
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {formatMetricValue(segment.conversionRate, 'percentage')}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderRealTimeMetrics = () => {
    if (!realTimeData) return null;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-green-500" />
            Real-Time Metrics
          </h3>
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
            Live
          </div>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {realTimeData.activeUsers}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {realTimeData.pageViews}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Page Views</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {realTimeData.conversions}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Conversions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatMetricValue(realTimeData.revenue, 'currency')}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Revenue</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Top Pages</h4>
            <div className="space-y-2">
              {realTimeData.topPages.map((page: any, index: number) => (
                <div key={page.page} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{page.page}</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{page.views}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Top Sources</h4>
            <div className="space-y-2">
              {realTimeData.topSources.map((source: any, index: number) => (
                <div key={source.source} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{source.source}</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{source.users}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderInsights = (report: AnalyticsReport) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
        AI-Powered Insights
      </h3>
      <div className="space-y-4">
        {report.insights.map((insight) => (
          <div key={insight.id} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-lg ${getInsightTypeColor(insight.type)}`}>
                {insight.type === 'success' && <CheckCircle className="w-4 h-4" />}
                {insight.type === 'warning' && <AlertCircle className="w-4 h-4" />}
                {insight.type === 'improvement' && <TrendingUp className="w-4 h-4" />}
                {insight.type === 'info' && <Info className="w-4 h-4" />}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  {insight.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {insight.description}
                </p>
                {insight.recommendation && (
                  <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm text-blue-800 dark:text-blue-300">
                    <strong>Recommendation:</strong> {insight.recommendation}
                  </div>
                )}
                <div className="flex items-center justify-between mt-3 text-xs">
                  <span className={`px-2 py-1 rounded ${
                    insight.impact === 'high' ? 'bg-red-100 text-red-800' :
                    insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {insight.impact} impact
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {insight.confidence}% confidence
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const currentReport = reports[selectedReport === 'business' ? 'business' : 'users'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                <BarChart3 className="w-6 h-6 mr-2" />
                Analytics Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Comprehensive insights and performance metrics
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Date Range Selector */}
              <select
                value={selectedDateRange}
                onChange={(e) => setSelectedDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>

              {/* Export Button */}
              <div className="relative group">
                <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
                <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  <button 
                    onClick={() => handleExport('csv')}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    CSV
                  </button>
                  <button 
                    onClick={() => handleExport('xlsx')}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Excel
                  </button>
                  <button 
                    onClick={() => handleExport('pdf')}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    PDF
                  </button>
                </div>
              </div>

              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Report Tabs */}
          <div className="flex space-x-6 mt-6">
            {[
              { key: 'business', label: 'Business', icon: DollarSign },
              { key: 'users', label: 'Users', icon: Users },
              { key: 'conversion', label: 'Conversion', icon: Target },
              { key: 'segments', label: 'Segments', icon: PieChart }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setSelectedReport(key as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  selectedReport === key
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Real-Time Metrics */}
        {showRealTime && renderRealTimeMetrics()}

        {/* Main Content Based on Selected Report */}
        <AnimatePresence mode="wait">
          {selectedReport === 'business' && currentReport && (
            <motion.div
              key="business"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Business Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentReport.metrics.map(renderMetricCard)}
              </div>
              
              {/* Insights */}
              {renderInsights(currentReport)}
            </motion.div>
          )}

          {selectedReport === 'users' && currentReport && (
            <motion.div
              key="users"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* User Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {reports.users?.metrics.map(renderMetricCard)}
              </div>
              
              {/* Insights */}
              {renderInsights(reports.users!)}
            </motion.div>
          )}

          {selectedReport === 'conversion' && (
            <motion.div
              key="conversion"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {renderConversionFunnel()}
            </motion.div>
          )}

          {selectedReport === 'segments' && (
            <motion.div
              key="segments"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {renderUserSegments()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}