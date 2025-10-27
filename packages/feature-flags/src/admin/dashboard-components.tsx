import React, { useState, useEffect, useMemo } from 'react';
import { FeatureFlag, FlagStatus, FlagType } from '../core/feature-flag-manager';
import { ABTest, TestStatus, ABTestResult } from '../ab-testing/ab-test-manager';
import { UserSegment } from '../targeting/targeting-engine';

// Types for dashboard components
interface DashboardProps {
  className?: string;
  onError?: (error: Error) => void;
}

interface FlagManagementPanelProps extends DashboardProps {
  flags: FeatureFlag[];
  onCreateFlag: (flag: Omit<FeatureFlag, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdateFlag: (flagKey: string, updates: Partial<FeatureFlag>) => Promise<void>;
  onDeleteFlag: (flagKey: string) => Promise<void>;
  onToggleFlag: (flagKey: string, enabled: boolean) => Promise<void>;
}

interface TestManagementPanelProps extends DashboardProps {
  tests: ABTest[];
  onCreateTest: (test: Omit<ABTest, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdateTest: (testKey: string, updates: Partial<ABTest>) => Promise<void>;
  onStartTest: (testKey: string) => Promise<void>;
  onStopTest: (testKey: string, reason?: string) => Promise<void>;
  onDeleteTest: (testKey: string) => Promise<void>;
}

interface AnalyticsDashboardProps extends DashboardProps {
  flagAnalytics: FlagAnalytics[];
  testResults: TestResultSummary[];
  dateRange: { start: Date; end: Date };
  onDateRangeChange: (range: { start: Date; end: Date }) => void;
}

interface FlagAnalytics {
  flagKey: string;
  evaluations: number;
  uniqueUsers: number;
  variants: Record<string, number>;
  conversionRate: number;
}

interface TestResultSummary {
  testKey: string;
  status: TestStatus;
  participants: number;
  conversionRate: number;
  confidence: number;
  winningVariant?: string;
}

// Main Dashboard Component
export const FeatureFlagDashboard: React.FC<DashboardProps> = ({ 
  className = '', 
  onError 
}) => {
  const [activeTab, setActiveTab] = useState<'flags' | 'tests' | 'segments' | 'analytics'>('flags');
  const [loading, setLoading] = useState(false);

  const tabClasses = 'px-4 py-2 font-medium text-sm rounded-lg transition-colors';
  const activeTabClasses = 'bg-blue-100 text-blue-700 border border-blue-200';
  const inactiveTabClasses = 'text-gray-600 hover:text-gray-900 hover:bg-gray-100';

  return (
    <div className={`feature-flag-dashboard ${className}`}>
      <div className="dashboard-header mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Feature Flags & A/B Testing Dashboard
        </h1>
        <p className="text-gray-600">
          Manage feature flags, run A/B tests, and analyze performance
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation mb-6">
        <nav className="flex space-x-2">
          {[
            { key: 'flags', label: 'Feature Flags' },
            { key: 'tests', label: 'A/B Tests' },
            { key: 'segments', label: 'User Segments' },
            { key: 'analytics', label: 'Analytics' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`${tabClasses} ${
                activeTab === tab.key ? activeTabClasses : inactiveTabClasses
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'flags' && (
          <FlagManagementSection onError={onError} />
        )}
        {activeTab === 'tests' && (
          <TestManagementSection onError={onError} />
        )}
        {activeTab === 'segments' && (
          <UserSegmentSection onError={onError} />
        )}
        {activeTab === 'analytics' && (
          <AnalyticsSection onError={onError} />
        )}
      </div>
    </div>
  );
};

// Flag Management Panel
export const FlagManagementPanel: React.FC<FlagManagementPanelProps> = ({
  flags,
  onCreateFlag,
  onUpdateFlag,
  onDeleteFlag,
  onToggleFlag,
  className = '',
  onError,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<FlagStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<FlagType | 'all'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredFlags = useMemo(() => {
    return flags.filter(flag => {
      const matchesSearch = flag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           flag.key.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || flag.status === statusFilter;
      const matchesType = typeFilter === 'all' || flag.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [flags, searchTerm, statusFilter, typeFilter]);

  return (
    <div className={`flag-management-panel ${className}`}>
      {/* Header */}
      <div className="panel-header flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Feature Flags</h2>
          <p className="text-sm text-gray-600">
            {filteredFlags.length} of {flags.length} flags
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Flag
        </button>
      </div>

      {/* Filters */}
      <div className="filters grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search flags..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as FlagStatus | 'all')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value={FlagStatus.ACTIVE}>Active</option>
            <option value={FlagStatus.INACTIVE}>Inactive</option>
            <option value={FlagStatus.DRAFT}>Draft</option>
            <option value={FlagStatus.ARCHIVED}>Archived</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as FlagType | 'all')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Types</option>
            <option value={FlagType.BOOLEAN}>Boolean</option>
            <option value={FlagType.STRING}>String</option>
            <option value={FlagType.NUMBER}>Number</option>
            <option value={FlagType.JSON}>JSON</option>
            <option value={FlagType.MULTIVARIATE}>Multivariate</option>
          </select>
        </div>
      </div>

      {/* Flags List */}
      <div className="flags-list space-y-4">
        {filteredFlags.map(flag => (
          <FlagCard
            key={flag.id}
            flag={flag}
            onUpdate={(updates) => onUpdateFlag(flag.key, updates)}
            onDelete={() => onDeleteFlag(flag.key)}
            onToggle={(enabled) => onToggleFlag(flag.key, enabled)}
          />
        ))}
        
        {filteredFlags.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">No flags found</div>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Create your first feature flag to get started'
              }
            </p>
          </div>
        )}
      </div>

      {/* Create Flag Modal */}
      {showCreateModal && (
        <CreateFlagModal
          onSubmit={async (flagData) => {
            await onCreateFlag(flagData);
            setShowCreateModal(false);
          }}
          onCancel={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
};

// Flag Card Component
const FlagCard: React.FC<{
  flag: FeatureFlag;
  onUpdate: (updates: Partial<FeatureFlag>) => void;
  onDelete: () => void;
  onToggle: (enabled: boolean) => void;
}> = ({ flag, onUpdate, onDelete, onToggle }) => {
  const [showDetails, setShowDetails] = useState(false);

  const statusColors = {
    [FlagStatus.ACTIVE]: 'bg-green-100 text-green-800',
    [FlagStatus.INACTIVE]: 'bg-gray-100 text-gray-800',
    [FlagStatus.DRAFT]: 'bg-yellow-100 text-yellow-800',
    [FlagStatus.ARCHIVED]: 'bg-red-100 text-red-800',
  };

  return (
    <div className="flag-card bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flag-header flex items-center justify-between mb-2">
        <div className="flex items-center space-x-3">
          <h3 className="font-semibold text-gray-900">{flag.name}</h3>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[flag.status]}`}>
            {flag.status}
          </span>
          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
            {flag.type}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
          
          <button
            onClick={() => onToggle(flag.status !== FlagStatus.ACTIVE)}
            className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
              flag.status === FlagStatus.ACTIVE
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {flag.status === FlagStatus.ACTIVE ? 'Disable' : 'Enable'}
          </button>
        </div>
      </div>

      <div className="flag-info">
        <p className="text-sm text-gray-600 mb-2">{flag.description}</p>
        <div className="flex items-center space-x-4 text-xs text-gray-500">
          <span>Key: {flag.key}</span>
          <span>Rollout: {flag.rolloutPercentage}%</span>
          <span>Variants: {flag.variants.length}</span>
        </div>
      </div>

      {showDetails && (
        <div className="flag-details mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Variants</h4>
              <div className="space-y-2">
                {flag.variants.map(variant => (
                  <div key={variant.id} className="bg-gray-50 p-2 rounded">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{variant.name}</span>
                      <span className="text-sm text-gray-600">{variant.weight}%</span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      Value: {JSON.stringify(variant.value)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Rules</h4>
              <div className="space-y-2">
                {flag.rules.map(rule => (
                  <div key={rule.id} className="bg-gray-50 p-2 rounded">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{rule.name}</span>
                      <span className={`px-2 py-1 text-xs rounded ${
                        rule.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {rule.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      Priority: {rule.priority} | Variant: {rule.variant}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => {/* Edit implementation */}}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              Edit
            </button>
            <button
              onClick={onDelete}
              className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// A/B Test Management Panel
export const TestManagementPanel: React.FC<TestManagementPanelProps> = ({
  tests,
  onCreateTest,
  onUpdateTest,
  onStartTest,
  onStopTest,
  onDeleteTest,
  className = '',
}) => {
  const [statusFilter, setStatusFilter] = useState<TestStatus | 'all'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredTests = tests.filter(test =>
    statusFilter === 'all' || test.status === statusFilter
  );

  return (
    <div className={`test-management-panel ${className}`}>
      <div className="panel-header flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">A/B Tests</h2>
          <p className="text-sm text-gray-600">
            {filteredTests.length} of {tests.length} tests
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Create Test
        </button>
      </div>

      {/* Status Filter */}
      <div className="mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as TestStatus | 'all')}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Tests</option>
          <option value={TestStatus.DRAFT}>Draft</option>
          <option value={TestStatus.SCHEDULED}>Scheduled</option>
          <option value={TestStatus.RUNNING}>Running</option>
          <option value={TestStatus.COMPLETED}>Completed</option>
          <option value={TestStatus.STOPPED}>Stopped</option>
        </select>
      </div>

      {/* Tests List */}
      <div className="tests-list space-y-4">
        {filteredTests.map(test => (
          <TestCard
            key={test.id}
            test={test}
            onStart={() => onStartTest(test.key)}
            onStop={(reason) => onStopTest(test.key, reason)}
            onDelete={() => onDeleteTest(test.key)}
          />
        ))}
      </div>
    </div>
  );
};

// Test Card Component
const TestCard: React.FC<{
  test: ABTest;
  onStart: () => void;
  onStop: (reason?: string) => void;
  onDelete: () => void;
}> = ({ test, onStart, onStop, onDelete }) => {
  const statusColors = {
    [TestStatus.DRAFT]: 'bg-gray-100 text-gray-800',
    [TestStatus.SCHEDULED]: 'bg-blue-100 text-blue-800',
    [TestStatus.RUNNING]: 'bg-green-100 text-green-800',
    [TestStatus.PAUSED]: 'bg-yellow-100 text-yellow-800',
    [TestStatus.COMPLETED]: 'bg-purple-100 text-purple-800',
    [TestStatus.STOPPED]: 'bg-red-100 text-red-800',
    [TestStatus.ARCHIVED]: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="test-card bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-gray-900 mb-1">{test.name}</h3>
          <p className="text-sm text-gray-600 mb-2">{test.description}</p>
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span className={`px-2 py-1 rounded-full font-medium ${statusColors[test.status]}`}>
              {test.status}
            </span>
            <span>Variants: {test.variants.length}</span>
            <span>Traffic: {test.allocation.trafficAllocation}%</span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          {test.status === TestStatus.SCHEDULED && (
            <button
              onClick={onStart}
              className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
            >
              Start
            </button>
          )}
          
          {test.status === TestStatus.RUNNING && (
            <button
              onClick={() => onStop('Manual stop')}
              className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              Stop
            </button>
          )}
          
          <button
            onClick={onDelete}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Test Results */}
      {test.results && (
        <div className="test-results bg-gray-50 p-3 rounded">
          <h4 className="font-medium text-gray-900 mb-2">Results</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-600">Confidence</div>
              <div className="font-semibold">{(test.results.confidence * 100).toFixed(1)}%</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Significance</div>
              <div className="font-semibold">{(test.results.significance * 100).toFixed(1)}%</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Winner</div>
              <div className="font-semibold">{test.results.winningVariant || 'None'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Status</div>
              <div className="font-semibold">{test.results.status}</div>
            </div>
          </div>
        </div>
      )}

      {/* Variants */}
      <div className="variants mt-4">
        <h4 className="font-medium text-gray-900 mb-2">Variants</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {test.variants.map(variant => (
            <div key={variant.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <div>
                <span className="font-medium">{variant.name}</span>
                {variant.isControl && (
                  <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                    Control
                  </span>
                )}
              </div>
              <span className="text-sm text-gray-600">{variant.weight}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Analytics Dashboard
export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  flagAnalytics,
  testResults,
  dateRange,
  onDateRangeChange,
  className = '',
}) => {
  return (
    <div className={`analytics-dashboard ${className}`}>
      <div className="dashboard-header flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Analytics</h2>
        
        {/* Date Range Picker */}
        <div className="flex space-x-2">
          <input
            type="date"
            value={dateRange.start.toISOString().split('T')[0]}
            onChange={(e) => onDateRangeChange({
              start: new Date(e.target.value),
              end: dateRange.end,
            })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <input
            type="date"
            value={dateRange.end.toISOString().split('T')[0]}
            onChange={(e) => onDateRangeChange({
              start: dateRange.start,
              end: new Date(e.target.value),
            })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Total Flags</div>
          <div className="text-2xl font-bold text-gray-900">{flagAnalytics.length}</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Running Tests</div>
          <div className="text-2xl font-bold text-gray-900">
            {testResults.filter(t => t.status === TestStatus.RUNNING).length}
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Total Evaluations</div>
          <div className="text-2xl font-bold text-gray-900">
            {flagAnalytics.reduce((sum, flag) => sum + flag.evaluations, 0).toLocaleString()}
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Unique Users</div>
          <div className="text-2xl font-bold text-gray-900">
            {flagAnalytics.reduce((sum, flag) => sum + flag.uniqueUsers, 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Flag Analytics */}
      <div className="flag-analytics mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Flag Performance</h3>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Flag</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Evaluations</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Users</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Conversion Rate</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Top Variant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {flagAnalytics.map(flag => (
                <tr key={flag.flagKey}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{flag.flagKey}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{flag.evaluations.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{flag.uniqueUsers.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{(flag.conversionRate * 100).toFixed(2)}%</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {Object.entries(flag.variants).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Test Results */}
      <div className="test-results">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Test Results</h3>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Test</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Participants</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Conversion</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Confidence</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Winner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {testResults.map(test => (
                <tr key={test.testKey}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{test.testKey}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      test.status === TestStatus.RUNNING ? 'bg-green-100 text-green-800' :
                      test.status === TestStatus.COMPLETED ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {test.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{test.participants.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{(test.conversionRate * 100).toFixed(2)}%</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{(test.confidence * 100).toFixed(1)}%</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{test.winningVariant || 'TBD'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// User Segment Builder
export const UserSegmentBuilder: React.FC<{
  segments: UserSegment[];
  onCreateSegment: (segment: Omit<UserSegment, 'id'>) => Promise<void>;
  onUpdateSegment: (id: string, updates: Partial<UserSegment>) => Promise<void>;
  onDeleteSegment: (id: string) => Promise<void>;
}> = ({ segments, onCreateSegment, onUpdateSegment, onDeleteSegment }) => {
  return (
    <div className="user-segment-builder">
      <div className="header mb-6">
        <h2 className="text-lg font-semibold text-gray-900">User Segments</h2>
        <p className="text-sm text-gray-600">Create and manage user segments for targeting</p>
      </div>

      <div className="segments-list space-y-4">
        {segments.map(segment => (
          <div key={segment.id} className="segment-card bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-gray-900">{segment.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{segment.description}</p>
                <div className="text-xs text-gray-500 mt-2">
                  {segment.rules.length} rules
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                  Edit
                </button>
                <button 
                  onClick={() => onDeleteSegment(segment.id)}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
        Create Segment
      </button>
    </div>
  );
};

// Helper components for section wrappers
const FlagManagementSection: React.FC<{ onError?: (error: Error) => void }> = ({ onError }) => {
  // This would be connected to actual flag management logic
  return <div>Flag Management Section - Connect to your flag manager</div>;
};

const TestManagementSection: React.FC<{ onError?: (error: Error) => void }> = ({ onError }) => {
  // This would be connected to actual test management logic
  return <div>Test Management Section - Connect to your test manager</div>;
};

const UserSegmentSection: React.FC<{ onError?: (error: Error) => void }> = ({ onError }) => {
  // This would be connected to actual segment management logic
  return <div>User Segment Section - Connect to your segment manager</div>;
};

const AnalyticsSection: React.FC<{ onError?: (error: Error) => void }> = ({ onError }) => {
  // This would be connected to actual analytics logic
  return <div>Analytics Section - Connect to your analytics system</div>;
};

// Create Flag Modal (simplified)
const CreateFlagModal: React.FC<{
  onSubmit: (flag: any) => Promise<void>;
  onCancel: () => void;
}> = ({ onSubmit, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Create Feature Flag</h3>
        <p className="text-sm text-gray-600 mb-4">
          This is a simplified modal. Implement full form fields for flag creation.
        </p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit({})}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};