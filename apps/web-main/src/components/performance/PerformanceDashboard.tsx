// Comprehensive Performance Dashboard for Zoptal Platform
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap,
  TrendingUp,
  TrendingDown,
  Clock,
  Eye,
  Gauge,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Smartphone,
  Monitor,
  Tablet,
  Wifi,
  HardDrive,
  Cpu,
  BarChart3,
  LineChart,
  Settings,
  Download,
  RefreshCw,
  Filter,
  Search,
  Calendar
} from 'lucide-react';
import { 
  performanceMonitor,
  PerformanceMetrics,
  PerformanceAlert,
  PerformanceBudget,
  usePerformanceMonitor
} from '@/lib/performance/performance-monitor';
import { cacheManager } from '@/lib/performance/cache-manager';
import { imageOptimizer } from '@/lib/performance/image-optimizer';
import { analytics } from '@/lib/analytics/tracker';

interface PerformanceDashboardProps {
  defaultView?: 'overview' | 'metrics' | 'alerts' | 'optimization' | 'budget';
}

export function PerformanceDashboard({ defaultView = 'overview' }: PerformanceDashboardProps) {
  const [currentView, setCurrentView] = useState(defaultView);
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h');
  const [budget, setBudget] = useState<PerformanceBudget | null>(null);
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [imageStats, setImageStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { metrics, alerts, generateReport, mark, measure, trackPageLoad } = usePerformanceMonitor();

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      const [budgetData, cacheData, imageData] = await Promise.all([
        Promise.resolve(performanceMonitor.getBudget()),
        Promise.resolve(cacheManager.getGlobalStats()),
        Promise.resolve(imageOptimizer.getCacheStats())
      ]);

      setBudget(budgetData);
      setCacheStats(cacheData);
      setImageStats(imageData);

      analytics.track({
        name: 'performance_dashboard_loaded',
        category: 'performance',
        properties: {
          view: currentView,
          time_range: selectedTimeRange
        }
      });

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatMetric = (value: number | null, type: 'time' | 'size' | 'number' | 'percentage'): string => {
    if (value === null) return 'N/A';

    switch (type) {
      case 'time':
        if (value < 1000) return `${Math.round(value)}ms`;
        return `${(value / 1000).toFixed(2)}s`;
      case 'size':
        if (value < 1024) return `${Math.round(value)}B`;
        if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)}KB`;
        return `${(value / (1024 * 1024)).toFixed(1)}MB`;
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'number':
      default:
        return value.toLocaleString();
    }
  };

  const getMetricStatus = (metric: string, value: number | null): 'good' | 'needs-improvement' | 'poor' | 'unknown' => {
    if (value === null) return 'unknown';

    const thresholds = {
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 },
      fcp: { good: 1800, poor: 3000 },
      ttfb: { good: 600, poor: 1200 }
    };

    const threshold = thresholds[metric as keyof typeof thresholds];
    if (!threshold) return 'unknown';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-100';
      case 'needs-improvement': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'low': return 'text-blue-600 bg-blue-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const renderCoreWebVitals = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Largest Contentful Paint */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Largest Contentful Paint
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatMetric(metrics?.lcp || null, 'time')}
            </p>
          </div>
          <div className={`p-3 rounded-lg ${getStatusColor(getMetricStatus('lcp', metrics?.lcp || null))}`}>
            <Clock className="w-6 h-6" />
          </div>
        </div>
        <div className="flex items-center">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(getMetricStatus('lcp', metrics?.lcp || null))}`}>
            {getMetricStatus('lcp', metrics?.lcp || null)}
          </span>
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
            Target: &lt; 2.5s
          </span>
        </div>
      </motion.div>

      {/* First Input Delay */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              First Input Delay
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatMetric(metrics?.fid || null, 'time')}
            </p>
          </div>
          <div className={`p-3 rounded-lg ${getStatusColor(getMetricStatus('fid', metrics?.fid || null))}`}>
            <Zap className="w-6 h-6" />
          </div>
        </div>
        <div className="flex items-center">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(getMetricStatus('fid', metrics?.fid || null))}`}>
            {getMetricStatus('fid', metrics?.fid || null)}
          </span>
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
            Target: &lt; 100ms
          </span>
        </div>
      </motion.div>

      {/* Cumulative Layout Shift */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Cumulative Layout Shift
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {metrics?.cls?.toFixed(3) || 'N/A'}
            </p>
          </div>
          <div className={`p-3 rounded-lg ${getStatusColor(getMetricStatus('cls', metrics?.cls || null))}`}>
            <Gauge className="w-6 h-6" />
          </div>
        </div>
        <div className="flex items-center">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(getMetricStatus('cls', metrics?.cls || null))}`}>
            {getMetricStatus('cls', metrics?.cls || null)}
          </span>
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
            Target: &lt; 0.1
          </span>
        </div>
      </motion.div>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Core Web Vitals */}
      {renderCoreWebVitals()}

      {/* Performance Score */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Performance Score
          </h3>
          
          {metrics && (
            <div className="flex items-center space-x-6">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 24 24">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    className="text-gray-200 dark:text-gray-700"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray="62.83"
                    strokeDashoffset={62.83 * (1 - 0.85)} // Mock 85% score
                    className="text-green-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">85</span>
                </div>
              </div>
              
              <div className="flex-1">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Grade:</span>
                    <span className="font-medium text-green-600">A</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                    <span className="font-medium text-green-600">Good</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Last Updated:</span>
                    <span className="font-medium">{new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Cache Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Cache Performance
          </h3>
          
          {cacheStats && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Hit Rate:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {formatMetric(cacheStats.hitRate, 'percentage')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Keys:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {formatMetric(cacheStats.totalKeys, 'number')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Cache Size:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {formatMetric(cacheStats.totalSize, 'size')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Evictions:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {formatMetric(cacheStats.evictions, 'number')}
                </span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );

  const renderMetrics = () => (
    <div className="space-y-6">
      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* First Contentful Paint */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              First Contentful Paint
            </h3>
            <Eye className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {formatMetric(metrics?.fcp || null, 'time')}
          </p>
          <span className={`inline-block mt-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(getMetricStatus('fcp', metrics?.fcp || null))}`}>
            {getMetricStatus('fcp', metrics?.fcp || null)}
          </span>
        </motion.div>

        {/* Time to First Byte */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Time to First Byte
            </h3>
            <Wifi className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {formatMetric(metrics?.ttfb || null, 'time')}
          </p>
          <span className={`inline-block mt-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(getMetricStatus('ttfb', metrics?.ttfb || null))}`}>
            {getMetricStatus('ttfb', metrics?.ttfb || null)}
          </span>
        </motion.div>

        {/* DOM Nodes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              DOM Nodes
            </h3>
            <HardDrive className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {formatMetric(metrics?.domNodes || 0, 'number')}
          </p>
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-2 block">
            Complexity score
          </span>
        </motion.div>

        {/* Memory Usage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Memory Usage
            </h3>
            <Cpu className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {formatMetric(metrics?.memoryUsage || null, 'size')}
          </p>
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-2 block">
            JS Heap size
          </span>
        </motion.div>
      </div>

      {/* Resource Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
          Resource Breakdown
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {formatMetric(metrics?.jsSize || 0, 'size')}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">JavaScript</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatMetric(metrics?.cssSize || 0, 'size')}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">CSS</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {formatMetric(metrics?.imageSize || 0, 'size')}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Images</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {formatMetric(metrics?.fontSize || 0, 'size')}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Fonts</div>
          </div>
        </div>

        <div className="mt-6">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Total Size: {formatMetric(metrics?.totalSize || 0, 'size')}
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 via-green-500 via-yellow-500 to-purple-500 h-2 rounded-full"
              style={{ width: '75%' }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );

  const renderAlerts = () => (
    <div className="space-y-4">
      {alerts && alerts.length > 0 ? (
        alerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-start space-x-4">
              <div className={`p-2 rounded-lg ${getSeverityColor(alert.severity)}`}>
                {alert.severity === 'critical' && <XCircle className="w-5 h-5" />}
                {alert.severity === 'high' && <AlertTriangle className="w-5 h-5" />}
                {alert.severity === 'medium' && <AlertTriangle className="w-5 h-5" />}
                {alert.severity === 'low' && <CheckCircle className="w-5 h-5" />}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    {alert.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </h3>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(alert.severity)}`}>
                    {alert.severity}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {alert.message}
                </p>
                
                <div className="flex items-center justify-between mt-3 text-xs text-gray-500 dark:text-gray-400">
                  <span>Metric: {alert.metric}</span>
                  <span>
                    {formatMetric(alert.currentValue, alert.metric.includes('size') ? 'size' : 'time')} / 
                    {formatMetric(alert.threshold, alert.metric.includes('size') ? 'size' : 'time')}
                  </span>
                  <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))
      ) : (
        <div className="text-center py-12">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No Performance Alerts
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Your application is performing well within budget constraints.
          </p>
        </div>
      )}
    </div>
  );

  const renderBudget = () => (
    <div className="space-y-6">
      {budget && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Performance Budget
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(budget).map(([metric, threshold]) => {
              const currentValue = metrics?.[metric as keyof PerformanceMetrics] as number || 0;
              const isViolation = currentValue > threshold;
              const percentage = Math.min((currentValue / threshold) * 100, 100);
              
              return (
                <div key={metric} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {metric.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </span>
                    <span className={`text-sm ${isViolation ? 'text-red-600' : 'text-green-600'}`}>
                      {formatMetric(
                        currentValue, 
                        metric.includes('Size') ? 'size' : 
                        metric === 'domNodes' ? 'number' : 
                        metric === 'cls' ? 'number' : 'time'
                      )} / {formatMetric(
                        threshold, 
                        metric.includes('Size') ? 'size' : 
                        metric === 'domNodes' ? 'number' : 
                        metric === 'cls' ? 'number' : 'time'
                      )}
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        isViolation ? 'bg-red-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading performance dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                <Zap className="w-6 h-6 mr-2" />
                Performance Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Monitor Core Web Vitals and optimize performance
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Time Range Selector */}
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="1h">Last hour</option>
                <option value="24h">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
              </select>

              <button
                onClick={loadDashboardData}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>

              <button
                onClick={() => {
                  const report = generateReport();
                  console.info('Performance Report:', report);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-6 mt-6">
            {[
              { key: 'overview', label: 'Overview', icon: BarChart3 },
              { key: 'metrics', label: 'Metrics', icon: LineChart },
              { key: 'alerts', label: 'Alerts', icon: AlertTriangle },
              { key: 'budget', label: 'Budget', icon: Settings }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setCurrentView(key as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  currentView === key
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
                {key === 'alerts' && alerts && alerts.length > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
                    {alerts.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          {currentView === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {renderOverview()}
            </motion.div>
          )}

          {currentView === 'metrics' && (
            <motion.div
              key="metrics"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {renderMetrics()}
            </motion.div>
          )}

          {currentView === 'alerts' && (
            <motion.div
              key="alerts"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {renderAlerts()}
            </motion.div>
          )}

          {currentView === 'budget' && (
            <motion.div
              key="budget"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {renderBudget()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}