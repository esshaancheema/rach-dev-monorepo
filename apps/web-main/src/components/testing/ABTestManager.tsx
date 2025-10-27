// A/B Test Management Interface
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TestTube,
  Play,
  Pause,
  Square,
  Plus,
  Edit3,
  Eye,
  Trash2,
  Users,
  Target,
  TrendingUp,
  Calendar,
  Clock,
  Award,
  Alert,
  CheckCircle,
  XCircle,
  BarChart3,
  Settings,
  Download,
  Copy
} from 'lucide-react';
import { 
  abTesting, 
  ABTest, 
  ABVariant,
  createCommonTests,
  formatMetricValue 
} from '@/lib/testing/ab-testing';
import { analytics } from '@/lib/analytics/tracker';

interface ABTestManagerProps {
  onTestSelect?: (test: ABTest) => void;
}

export function ABTestManager({ onTestSelect }: ABTestManagerProps) {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResults, setShowResults] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'running' | 'completed' | 'draft'>('all');

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    try {
      setIsLoading(true);
      const allTests = abTesting.getAllTests();
      setTests(allTests);
    } catch (error) {
      console.error('Failed to load tests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartTest = async (testId: string) => {
    try {
      await abTesting.startTest(testId);
      await loadTests();
      
      analytics.track({
        name: 'ab_test_started_from_manager',
        category: 'ab_testing',
        properties: { test_id: testId }
      });
    } catch (error) {
      console.error('Failed to start test:', error);
    }
  };

  const handleStopTest = async (testId: string) => {
    try {
      await abTesting.stopTest(testId);
      await loadTests();
      
      analytics.track({
        name: 'ab_test_stopped_from_manager',
        category: 'ab_testing',
        properties: { test_id: testId }
      });
    } catch (error) {
      console.error('Failed to stop test:', error);
    }
  };

  const handleCreateTest = async (testType: 'hero' | 'pricing' | 'custom') => {
    try {
      let newTest;
      
      switch (testType) {
        case 'hero':
          newTest = await abTesting.createTest(createCommonTests.heroSection([
            { 
              name: 'Original Hero', 
              config: { 
                headline: 'Transform Your Ideas Into Digital Reality',
                subheadline: 'Professional software development services',
                cta: 'Get Started'
              }
            },
            { 
              name: 'Benefit-Focused Hero', 
              config: { 
                headline: 'Increase Revenue By 300% With Custom Software',
                subheadline: 'Our AI-powered development increases business efficiency',
                cta: 'Book Free Consultation'
              }
            },
            { 
              name: 'Urgency Hero', 
              config: { 
                headline: 'Launch Your App in 30 Days or Less',
                subheadline: 'Fast-track development with our proven methodology',
                cta: 'Start Project Now'
              }
            }
          ]));
          break;
          
        case 'pricing':
          newTest = await abTesting.createTest(createCommonTests.pricingPage([
            { 
              name: 'Standard Pricing', 
              config: { 
                layout: 'three-tier',
                highlight: 'middle',
                showDiscount: false
              }
            },
            { 
              name: 'Value Pricing', 
              config: { 
                layout: 'three-tier',
                highlight: 'premium',
                showDiscount: true,
                discountPercent: 20
              }
            }
          ]));
          break;
          
        default:
          // Custom test creation would show a detailed form
          return;
      }
      
      await loadTests();
      setShowCreateModal(false);
      
      analytics.track({
        name: 'ab_test_created_from_manager',
        category: 'ab_testing',
        properties: { 
          test_id: newTest.id,
          test_type: testType
        }
      });
    } catch (error) {
      console.error('Failed to create test:', error);
    }
  };

  const getFilteredTests = () => {
    return tests.filter(test => {
      if (filter === 'all') return true;
      return test.status === filter;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-green-600 bg-green-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      case 'paused': return 'text-yellow-600 bg-yellow-100';
      case 'draft': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const renderTestCard = (test: ABTest) => (
    <motion.div
      key={test.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <TestTube className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {test.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {test.description}
            </p>
          </div>
        </div>
        
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(test.status)}`}>
          {test.status}
        </span>
      </div>

      {/* Test Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Users className="w-4 h-4 mr-1" />
            Participants
          </div>
          <div className="font-semibold text-gray-900 dark:text-gray-100">
            {test.results?.participantCount?.toLocaleString() || '0'}
          </div>
        </div>
        
        <div>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Target className="w-4 h-4 mr-1" />
            Variants
          </div>
          <div className="font-semibold text-gray-900 dark:text-gray-100">
            {test.variants.length}
          </div>
        </div>
        
        <div>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Clock className="w-4 h-4 mr-1" />
            Duration
          </div>
          <div className="font-semibold text-gray-900 dark:text-gray-100">
            {test.startDate ? Math.floor((Date.now() - new Date(test.startDate).getTime()) / (1000 * 60 * 60 * 24)) : 0}d
          </div>
        </div>
      </div>

      {/* Conversion Rate if running */}
      {test.status === 'running' && test.results && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            Primary Goal Conversion
          </div>
          <div className="space-y-2">
            {test.variants.map(variant => {
              const results = test.results!.conversionData[variant.id];
              const primaryGoal = test.conversionGoals.find(g => g.isPrimary);
              const conversionRate = primaryGoal && results?.conversions[primaryGoal.id]?.rate || 0;
              
              return (
                <div key={variant.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {variant.name} {variant.isControl && '(Control)'}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {(conversionRate * 100).toFixed(2)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Statistical significance if available */}
      {test.status === 'running' && test.results?.statisticalSignificance && (
        <div className="mb-4">
          {Object.entries(test.results.statisticalSignificance).map(([goalId, significance]) => {
            if (!significance.isSignificant) return null;
            
            const goal = test.conversionGoals.find(g => g.id === goalId);
            const winnerVariant = test.variants.find(v => v.id === significance.winner);
            
            return (
              <div key={goalId} className="flex items-center text-sm text-green-600 dark:text-green-400">
                <Award className="w-4 h-4 mr-2" />
                <span>
                  {winnerVariant?.name} is winning for {goal?.name} ({significance.confidence}% confidence)
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          {test.status === 'draft' && (
            <button
              onClick={() => handleStartTest(test.id)}
              className="flex items-center px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
            >
              <Play className="w-3 h-3 mr-1" />
              Start
            </button>
          )}
          
          {test.status === 'running' && (
            <button
              onClick={() => handleStopTest(test.id)}
              className="flex items-center px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
            >
              <Square className="w-3 h-3 mr-1" />
              Stop
            </button>
          )}
          
          <button
            onClick={() => setShowResults(test.id)}
            className="flex items-center px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <BarChart3 className="w-3 h-3 mr-1" />
            Results
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSelectedTest(test)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <Edit3 className="w-4 h-4" />
          </button>
          <button className="text-gray-400 hover:text-red-600">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );

  const renderCreateModal = () => (
    <AnimatePresence>
      {showCreateModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowCreateModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Create New A/B Test
            </h3>
            
            <div className="space-y-3">
              <button
                onClick={() => handleCreateTest('hero')}
                className="w-full text-left p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  Hero Section Test
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Test different hero section variations for better conversion
                </div>
              </button>
              
              <button
                onClick={() => handleCreateTest('pricing')}
                className="w-full text-left p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  Pricing Page Test
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Test different pricing presentations and CTAs
                </div>
              </button>
              
              <button
                onClick={() => handleCreateTest('custom')}
                className="w-full text-left p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  Custom Test
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Create a custom A/B test with your own variants
                </div>
              </button>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading A/B tests...</p>
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
                <TestTube className="w-6 h-6 mr-2" />
                A/B Test Manager
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Create, manage, and analyze conversion optimization tests
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>New Test</span>
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-6 mt-6">
            {[
              { key: 'all', label: 'All Tests' },
              { key: 'running', label: 'Running' },
              { key: 'completed', label: 'Completed' },
              { key: 'draft', label: 'Draft' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === key
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Test Grid */}
        {getFilteredTests().length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {getFilteredTests().map(renderTestCard)}
          </div>
        ) : (
          <div className="text-center py-12">
            <TestTube className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No tests found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {filter === 'all' 
                ? 'Get started by creating your first A/B test'
                : `No ${filter} tests available`
              }
            </p>
            {filter === 'all' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Your First Test
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {renderCreateModal()}
    </div>
  );
}