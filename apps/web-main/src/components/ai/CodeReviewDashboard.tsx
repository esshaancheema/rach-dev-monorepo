'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  CogIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  BugAntIcon,
  LightBulbIcon,
  ArrowPathIcon,
  PlayIcon,
  PauseIcon,
  EyeIcon,
  CodeBracketIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { 
  CodeReviewService, 
  CodeReviewRequest, 
  ReviewResult, 
  QualityGate, 
  ReviewFindings,
  ReviewTemplate,
  QualityGateResult
} from '@/lib/ai/code-review-service';

interface CodeReviewDashboardProps {
  organizationId: string;
  currentUserId: string;
  projectId?: string;
}

type ActiveView = 'overview' | 'reviews' | 'quality-gates' | 'templates' | 'analytics' | 'settings';

export default function CodeReviewDashboard({
  organizationId,
  currentUserId,
  projectId
}: CodeReviewDashboardProps) {
  const [activeView, setActiveView] = useState<ActiveView>('overview');
  const [reviewService] = useState(() => new CodeReviewService());
  const [reviews, setReviews] = useState<CodeReviewRequest[]>([]);
  const [reviewResults, setReviewResults] = useState<Map<string, ReviewResult>>(new Map());
  const [qualityGates, setQualityGates] = useState<QualityGate[]>([]);
  const [templates, setTemplates] = useState<ReviewTemplate[]>([]);
  const [selectedReview, setSelectedReview] = useState<CodeReviewRequest | null>(null);
  const [selectedResult, setSelectedResult] = useState<ReviewResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [organizationId, projectId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load reviews
      const reviewsData = projectId 
        ? await reviewService.getReviewsByProject(projectId)
        : await reviewService.getReviewsByOrganization(organizationId);
      setReviews(reviewsData);

      // Load review results
      const resultsMap = new Map();
      for (const review of reviewsData) {
        const result = await reviewService.getReviewResult(review.id);
        if (result) {
          resultsMap.set(review.id, result);
        }
      }
      setReviewResults(resultsMap);

      // Load quality gates and templates
      const [gatesData, templatesData, analyticsData] = await Promise.all([
        reviewService.getQualityGates(organizationId),
        reviewService.getReviewTemplates(organizationId),
        reviewService.getReviewAnalytics(organizationId)
      ]);

      setQualityGates(gatesData);
      setTemplates(templatesData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Failed to load code review data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateReview = async () => {
    try {
      const newReview = await reviewService.createReview({
        projectId: projectId || 'default-project',
        organizationId,
        title: 'New Code Review',
        files: [
          {
            path: 'src/example.ts',
            content: 'const result = eval(userInput); document.getElementById("output").innerHTML = result;',
            language: 'typescript',
            size: 1024,
            changes: [{ type: 'added', lineStart: 1, lineEnd: 1, newContent: 'Added example code' }]
          }
        ],
        author: currentUserId,
        reviewType: 'automatic',
        priority: 'medium'
      });

      setReviews(prev => [newReview, ...prev]);
      
      // Auto-start review and get result
      setTimeout(async () => {
        const result = await reviewService.getReviewResult(newReview.id);
        if (result) {
          setReviewResults(prev => new Map(prev).set(newReview.id, result));
        }
        loadData(); // Refresh data
      }, 2000);

    } catch (error) {
      console.error('Failed to create review:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'error': return 'text-red-500 bg-red-50';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'info': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: ChartBarIcon, count: reviews.length },
    { id: 'reviews', label: 'Code Reviews', icon: DocumentTextIcon, count: reviews.filter(r => r.status === 'pending').length },
    { id: 'quality-gates', label: 'Quality Gates', icon: ShieldCheckIcon, count: qualityGates.filter(qg => qg.isActive).length },
    { id: 'templates', label: 'Review Templates', icon: CogIcon, count: templates.length },
    { id: 'analytics', label: 'Analytics', icon: ChartBarIcon },
    { id: 'settings', label: 'Settings', icon: CogIcon }
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
          <h1 className="text-2xl font-bold text-gray-900">AI Code Review & Quality Gates</h1>
          <p className="text-gray-600">Automated code review with AI-powered analysis and quality enforcement</p>
        </div>
        <button
          onClick={handleCreateReview}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
        >
          <SparklesIcon className="h-5 w-5" />
          <span>Create Review</span>
        </button>
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
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Reviews</p>
                  <p className="text-2xl font-semibold text-gray-900">{analytics?.totalReviews || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Average Score</p>
                  <p className="text-2xl font-semibold text-gray-900">{Math.round(analytics?.averageScore || 0)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <ShieldCheckIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Quality Gate Pass</p>
                  <p className="text-2xl font-semibold text-gray-900">{Math.round(analytics?.qualityGatePassRate || 0)}%</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <ClockIcon className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Avg Review Time</p>
                  <p className="text-2xl font-semibold text-gray-900">{Math.round(analytics?.reviewTimeStats?.average || 0)}m</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Reviews */}
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Reviews</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {reviews.slice(0, 5).map(review => {
                  const result = reviewResults.get(review.id);
                  return (
                    <div key={review.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-lg ${getStatusColor(review.status)}`}>
                          {review.status === 'completed' ? (
                            <CheckCircleIcon className="h-5 w-5" />
                          ) : review.status === 'in_progress' ? (
                            <ArrowPathIcon className="h-5 w-5 animate-spin" />
                          ) : (
                            <ClockIcon className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{review.title}</p>
                          <p className="text-sm text-gray-600">
                            {review.files.length} files • {review.reviewType} • {review.priority} priority
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {result && (
                          <p className="text-lg font-semibold text-gray-900">{result.overallScore}/100</p>
                        )}
                        <p className="text-sm text-gray-600">{new Date(review.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Reviews List */}
      {activeView === 'reviews' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Code Reviews</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {reviews.map(review => {
                  const result = reviewResults.get(review.id);
                  return (
                    <div
                      key={review.id}
                      className="p-6 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedReview(review);
                        setSelectedResult(result || null);
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900">{review.title}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(review.status)}`}>
                              {review.status}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              review.priority === 'critical' ? 'text-red-600 bg-red-100' :
                              review.priority === 'high' ? 'text-orange-600 bg-orange-100' :
                              review.priority === 'medium' ? 'text-yellow-600 bg-yellow-100' :
                              'text-green-600 bg-green-100'
                            }`}>
                              {review.priority}
                            </span>
                          </div>

                          <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
                            <span className="flex items-center space-x-1">
                              <CodeBracketIcon className="h-4 w-4" />
                              <span>{review.files.length} files</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <UserGroupIcon className="h-4 w-4" />
                              <span>{review.reviewType}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <ClockIcon className="h-4 w-4" />
                              <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                            </span>
                          </div>

                          {result && (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Overall Score</span>
                                <div className="flex items-center space-x-2">
                                  <div className="w-24 bg-gray-200 rounded-full h-2">
                                    <div
                                      className={`h-2 rounded-full ${
                                        result.overallScore >= 80 ? 'bg-green-500' :
                                        result.overallScore >= 60 ? 'bg-yellow-500' :
                                        'bg-red-500'
                                      }`}
                                      style={{ width: `${result.overallScore}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm font-medium">{result.overallScore}/100</span>
                                </div>
                              </div>

                              <div className="flex items-center space-x-6 text-sm">
                                <span className="flex items-center space-x-1 text-red-600">
                                  <XCircleIcon className="h-4 w-4" />
                                  <span>{result.findings.filter(f => f.severity === 'critical' || f.severity === 'error').length} Issues</span>
                                </span>
                                <span className="flex items-center space-x-1 text-yellow-600">
                                  <ExclamationTriangleIcon className="h-4 w-4" />
                                  <span>{result.findings.filter(f => f.severity === 'warning').length} Warnings</span>
                                </span>
                                <span className="flex items-center space-x-1 text-blue-600">
                                  <LightBulbIcon className="h-4 w-4" />
                                  <span>{result.recommendations.length} Recommendations</span>
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          {result?.approved ? (
                            <CheckCircleIcon className="h-6 w-6 text-green-500" />
                          ) : (
                            <XCircleIcon className="h-6 w-6 text-red-500" />
                          )}
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

      {/* Quality Gates */}
      {activeView === 'quality-gates' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Quality Gates</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {qualityGates.map(gate => (
                  <div key={gate.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-900">{gate.name}</h4>
                      <div className="flex items-center space-x-2">
                        {gate.isActive ? (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-600 rounded-full">Active</span>
                        ) : (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">Inactive</span>
                        )}
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          gate.enforcement === 'blocking' ? 'bg-red-100 text-red-600' :
                          gate.enforcement === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {gate.enforcement}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{gate.description}</p>
                    
                    <div className="space-y-2">
                      <h5 className="font-medium text-gray-900">Conditions:</h5>
                      {gate.conditions.map((condition, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{condition.description}</span>
                          <code className="px-2 py-1 bg-gray-100 rounded text-xs">
                            {condition.metric} {condition.operator} {condition.threshold}
                          </code>
                        </div>
                      ))}
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
              <h3 className="text-lg font-semibold text-gray-900">Review Templates</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {templates.map(template => (
                  <div key={template.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-900">{template.name}</h4>
                      {template.autoAssign && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">Auto-assign</span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-4">{template.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-900">Checklist Items:</span>
                        <p className="text-gray-600">{template.checklist.length} items</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Quality Gates:</span>
                        <p className="text-gray-600">{template.qualityGates.length} gates</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">AI Prompts:</span>
                        <p className="text-gray-600">{template.aiPrompts.length} prompts</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Analytics */}
      {activeView === 'analytics' && analytics && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Findings by Category */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Findings by Category</h3>
              <div className="space-y-3">
                {Object.entries(analytics.findingsByCategory).map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-gray-600 capitalize">{category}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Issues */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Issues</h3>
              <div className="space-y-3">
                {analytics.topIssues.slice(0, 5).map((issue: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <span className="text-gray-900 text-sm">{issue.title}</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getSeverityColor(issue.severity)}`}>
                        {issue.severity}
                      </span>
                    </div>
                    <span className="font-medium">{issue.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Review Time Statistics */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Time Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{analytics.reviewTimeStats.min}m</div>
                <div className="text-gray-600">Minimum</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{Math.round(analytics.reviewTimeStats.average)}m</div>
                <div className="text-gray-600">Average</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{analytics.reviewTimeStats.max}m</div>
                <div className="text-gray-600">Maximum</div>
              </div>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Code Review Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Auto-start Reviews</h4>
                  <p className="text-sm text-gray-600">Automatically start AI analysis when code is submitted</p>
                </div>
                <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Enabled</button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Quality Gate Enforcement</h4>
                  <p className="text-sm text-gray-600">Block deployments when quality gates fail</p>
                </div>
                <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Enabled</button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">AI Auto-fix</h4>
                  <p className="text-sm text-gray-600">Automatically apply safe fixes for common issues</p>
                </div>
                <button className="bg-gray-300 text-gray-600 px-3 py-1 rounded text-sm">Disabled</button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Review Detail Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-96 overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">{selectedReview.title}</h3>
                <button
                  onClick={() => setSelectedReview(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {selectedResult && (
                <>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">AI Summary</h4>
                    <p className="text-gray-600">{selectedResult.aiSummary}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Findings ({selectedResult.findings.length})</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {selectedResult.findings.map(finding => (
                        <div key={finding.id} className="p-3 border border-gray-200 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(finding.severity)}`}>
                                  {finding.severity}
                                </span>
                                <span className="text-sm text-gray-600">{finding.category}</span>
                              </div>
                              <h5 className="font-medium text-gray-900">{finding.title}</h5>
                              <p className="text-sm text-gray-600">{finding.description}</p>
                              {finding.suggestion && (
                                <p className="text-sm text-blue-600 mt-1">💡 {finding.suggestion}</p>
                              )}
                            </div>
                            {finding.autoFixable && (
                              <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs">
                                Auto-fix
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Recommendations</h4>
                    <ul className="space-y-1">
                      {selectedResult.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <LightBulbIcon className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-600">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}