'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChartBarIcon,
  ShieldExclamationIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  BugAntIcon,
  SparklesIcon,
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  CodeBracketIcon,
  CubeIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { 
  CodeAnalyzer, 
  AnalysisResult, 
  CodeIssue, 
  PerformanceMetric, 
  SecurityVulnerability, 
  OptimizationSuggestion 
} from '@/lib/ai/code-analyzer';
import { ProjectFile } from '@/lib/ai/enhanced-code-generator';

interface CodeAnalysisDashboardProps {
  files: ProjectFile[];
  framework: string;
  onIssueSelect?: (issue: CodeIssue) => void;
  onOptimizationApply?: (optimization: OptimizationSuggestion) => void;
  className?: string;
}

interface FilterState {
  issueTypes: Set<string>;
  severities: Set<string>;
  categories: Set<string>;
  showResolved: boolean;
}

export default function CodeAnalysisDashboard({
  files,
  framework,
  onIssueSelect,
  onOptimizationApply,
  className
}: CodeAnalysisDashboardProps) {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'issues' | 'performance' | 'security' | 'optimizations'>('overview');
  const [filters, setFilters] = useState<FilterState>({
    issueTypes: new Set(['error', 'warning', 'info', 'suggestion']),
    severities: new Set(['critical', 'high', 'medium', 'low']),
    categories: new Set(['syntax', 'performance', 'security', 'accessibility', 'maintainability', 'style']),
    showResolved: false
  });
  const [selectedIssues, setSelectedIssues] = useState<Set<string>>(new Set());

  const analyzer = new CodeAnalyzer();

  useEffect(() => {
    if (files.length > 0) {
      runAnalysis();
    }
  }, [files, framework]);

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const result = await analyzer.analyzeProject(files, framework);
      setAnalysis(result);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getIssueIcon = (issue: CodeIssue) => {
    switch (issue.type) {
      case 'error':
        return <BugAntIcon className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
      case 'suggestion':
        return <LightBulbIcon className="h-5 w-5 text-purple-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPerformanceStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getMetricTrendIcon = (metric: PerformanceMetric) => {
    if (metric.status === 'good') return <ArrowUpIcon className="h-4 w-4 text-green-500" />;
    if (metric.status === 'critical') return <ArrowDownIcon className="h-4 w-4 text-red-500" />;
    return <ClockIcon className="h-4 w-4 text-yellow-500" />;
  };

  const filteredIssues = analysis?.issues.filter(issue => {
    return filters.issueTypes.has(issue.type) &&
           filters.severities.has(issue.severity) &&
           filters.categories.has(issue.category);
  }) || [];

  const toggleIssueSelection = (issueId: string) => {
    setSelectedIssues(prev => {
      const newSet = new Set(prev);
      if (newSet.has(issueId)) {
        newSet.delete(issueId);
      } else {
        newSet.add(issueId);
      }
      return newSet;
    });
  };

  const getQualityScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isAnalyzing) {
    return (
      <div className={cn("bg-white rounded-xl shadow-lg border border-gray-200 p-8", className)}>
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900">Analyzing Code</h3>
            <p className="text-gray-600">Running comprehensive analysis on {files.length} files...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className={cn("bg-white rounded-xl shadow-lg border border-gray-200 p-8", className)}>
        <div className="text-center">
          <CodeBracketIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Analysis Available</h3>
          <p className="text-gray-600 mb-4">Upload files to start code analysis</p>
          <button
            onClick={runAnalysis}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Run Analysis
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden", className)}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <ChartBarIcon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Code Analysis</h2>
              <p className="text-blue-100 text-sm">
                {framework} • {files.length} files • Updated {analysis.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
          
          <button
            onClick={runAnalysis}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <ArrowPathIcon className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold">{analysis.quality.overallScore}</div>
            <div className="text-xs text-blue-100">Quality Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-200">{analysis.summary.totalIssues}</div>
            <div className="text-xs text-blue-100">Total Issues</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-200">{analysis.summary.securityVulnerabilities}</div>
            <div className="text-xs text-blue-100">Security Issues</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-200">{analysis.summary.performanceScore}</div>
            <div className="text-xs text-blue-100">Performance</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'overview', label: 'Overview', icon: ChartBarIcon },
            { id: 'issues', label: `Issues (${analysis.issues.length})`, icon: BugAntIcon },
            { id: 'performance', label: 'Performance', icon: ArrowUpIcon },
            { id: 'security', label: `Security (${analysis.security.length})`, icon: ShieldExclamationIcon },
            { id: 'optimizations', label: 'Optimizations', icon: SparklesIcon }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors",
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6 max-h-96 overflow-y-auto">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quality Metrics */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Code Quality</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className={cn("text-3xl font-bold mb-1", getQualityScoreColor(analysis.quality.overallScore))}>
                    {analysis.quality.overallScore}
                  </div>
                  <div className="text-sm text-gray-600">Overall Score</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-1">{analysis.quality.cyclomaticComplexity}</div>
                  <div className="text-sm text-gray-600">Avg Complexity</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">{analysis.quality.technicalDebt.rating}</div>
                  <div className="text-sm text-gray-600">Tech Debt Rating</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-gray-600 mb-1">{analysis.quality.linesOfCode}</div>
                  <div className="text-sm text-gray-600">Lines of Code</div>
                </div>
              </div>
            </div>

            {/* Summary Recommendations */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Recommendations</h3>
              <div className="space-y-3">
                {analysis.summary.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                    <LightBulbIcon className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-blue-800">{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* File Metrics */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Structure</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{analysis.quality.metrics.files}</div>
                  <div className="text-sm text-gray-600">Files</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{analysis.quality.metrics.functions}</div>
                  <div className="text-sm text-gray-600">Functions</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{analysis.quality.metrics.classes}</div>
                  <div className="text-sm text-gray-600">Classes</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{analysis.quality.metrics.imports}</div>
                  <div className="text-sm text-gray-600">Imports</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{analysis.quality.metrics.exports}</div>
                  <div className="text-sm text-gray-600">Exports</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'issues' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <select className="px-3 py-1 border border-gray-300 rounded text-sm">
                  <option>All Types</option>
                  <option>Errors</option>
                  <option>Warnings</option>
                  <option>Suggestions</option>
                </select>
                <select className="px-3 py-1 border border-gray-300 rounded text-sm">
                  <option>All Severities</option>
                  <option>Critical</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>
              <div className="text-sm text-gray-600">
                Showing {filteredIssues.length} of {analysis.issues.length} issues
              </div>
            </div>

            {/* Issues List */}
            <div className="space-y-2">
              {filteredIssues.map(issue => (
                <motion.div
                  key={issue.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "border rounded-lg p-4 cursor-pointer transition-colors",
                    selectedIssues.has(issue.id) ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                  )}
                  onClick={() => {
                    toggleIssueSelection(issue.id);
                    onIssueSelect?.(issue);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {getIssueIcon(issue)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-gray-900">{issue.title}</h4>
                          <span className={cn("px-2 py-0.5 text-xs font-medium rounded", getSeverityColor(issue.severity))}>
                            {issue.severity}
                          </span>
                          <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded capitalize">
                            {issue.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{issue.description}</p>
                        <div className="text-xs text-gray-500">
                          {issue.file} {issue.line !== undefined && `(line ${issue.line + 1})`}
                        </div>
                        {issue.suggestion && (
                          <div className="mt-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
                            💡 {issue.suggestion}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {issue.autoFixAvailable && (
                        <button className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200">
                          Auto Fix
                        </button>
                      )}
                      <EyeIcon className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-4">
            {analysis.performance.map(metric => (
              <div key={metric.name} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    {getMetricTrendIcon(metric)}
                    <h4 className="font-medium text-gray-900">{metric.name}</h4>
                  </div>
                  <span className={cn("text-lg font-bold", getPerformanceStatusColor(metric.status))}>
                    {metric.value} {metric.unit}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{metric.description}</p>
                
                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div 
                    className={cn(
                      "h-2 rounded-full transition-all duration-300",
                      metric.status === 'good' ? "bg-green-500" :
                      metric.status === 'warning' ? "bg-yellow-500" : "bg-red-500"
                    )}
                    style={{ width: `${Math.min((metric.value / metric.threshold) * 100, 100)}%` }}
                  />
                </div>
                
                {metric.suggestions.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-gray-700">Suggestions:</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {metric.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-blue-500 text-xs">•</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-4">
            {analysis.security.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Security Issues Found</h3>
                <p className="text-gray-600">Your code appears to be free of common security vulnerabilities.</p>
              </div>
            ) : (
              analysis.security.map(vuln => (
                <div key={vuln.id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <ShieldExclamationIcon className="h-5 w-5 text-red-500" />
                      <h4 className="font-medium text-red-900">{vuln.title}</h4>
                    </div>
                    <span className={cn(
                      "px-2 py-1 text-xs font-medium rounded",
                      vuln.severity === 'critical' ? 'bg-red-200 text-red-800' :
                      vuln.severity === 'high' ? 'bg-orange-200 text-orange-800' :
                      vuln.severity === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                      'bg-blue-200 text-blue-800'
                    )}>
                      {vuln.severity}
                    </span>
                  </div>
                  
                  <p className="text-sm text-red-700 mb-2">{vuln.description}</p>
                  <div className="text-xs text-red-600 mb-3">
                    {vuln.file} • {vuln.cwe} • {vuln.owasp}
                  </div>
                  
                  <div className="bg-white rounded p-3 mb-3">
                    <h5 className="text-sm font-medium text-gray-900 mb-1">Fix:</h5>
                    <p className="text-sm text-gray-700">{vuln.fix}</p>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <button className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200">
                      View Details
                    </button>
                    <button className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200">
                      Learn More
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'optimizations' && (
          <div className="space-y-4">
            {analysis.optimizations.map(opt => (
              <div key={opt.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">{opt.title}</h4>
                    <div className="flex items-center space-x-2">
                      <span className={cn(
                        "px-2 py-1 text-xs font-medium rounded",
                        opt.impact === 'high' ? 'bg-green-100 text-green-800' :
                        opt.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      )}>
                        {opt.impact} impact
                      </span>
                      <span className={cn(
                        "px-2 py-1 text-xs font-medium rounded",
                        opt.effort === 'easy' ? 'bg-green-100 text-green-800' :
                        opt.effort === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      )}>
                        {opt.effort} effort
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => onOptimizationApply?.(opt)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                  >
                    Apply
                  </button>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{opt.description}</p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Benefits:</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {opt.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CheckCircleIcon className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Implementation:</h5>
                    <div className="text-xs text-gray-500 mb-2">
                      Estimated time: {opt.implementation.estimatedTime}
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      {opt.implementation.steps.slice(0, 3).map((step, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <span className="text-blue-500 font-medium">{index + 1}.</span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {opt.implementation.codeExample && (
                  <div className="mt-3 bg-gray-100 rounded p-3">
                    <div className="text-xs text-gray-600 mb-1">Example:</div>
                    <code className="text-xs text-gray-800 font-mono">{opt.implementation.codeExample}</code>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}