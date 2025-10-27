// Comprehensive Email Marketing Dashboard
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail,
  Send,
  Users,
  TrendingUp,
  Calendar,
  Settings,
  Plus,
  Eye,
  Edit3,
  Play,
  Pause,
  MoreVertical,
  Download,
  Filter,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  PieChart,
  Target,
  Zap,
  RefreshCw
} from 'lucide-react';
import { 
  emailService, 
  EmailTemplate, 
  EmailCampaign, 
  EmailAutomation,
  EmailAudience,
  CampaignStatus 
} from '@/lib/email/email-service';
import { analytics } from '@/lib/analytics/tracker';

interface EmailDashboardProps {
  defaultView?: 'overview' | 'campaigns' | 'templates' | 'automations' | 'audiences';
}

export function EmailDashboard({ defaultView = 'overview' }: EmailDashboardProps) {
  const [currentView, setCurrentView] = useState(defaultView);
  const [isLoading, setIsLoading] = useState(true);
  const [statistics, setStatistics] = useState<any>(null);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [automations, setAutomations] = useState<EmailAutomation[]>([]);
  const [audiences, setAudiences] = useState<EmailAudience[]>([]);
  const [selectedDateRange, setSelectedDateRange] = useState('30d');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadDashboardData();
  }, [selectedDateRange]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      const dateRange = getDateRange(selectedDateRange);
      
      const [stats, templatesData, campaignsData, automationsData, audiencesData] = await Promise.all([
        emailService.getEmailStatistics(dateRange),
        Promise.resolve(emailService.getAllTemplates()),
        Promise.resolve(emailService.getAllCampaigns()),
        Promise.resolve(emailService.getAllAutomations()),
        Promise.resolve(emailService.getAllAudiences())
      ]);

      setStatistics(stats);
      setTemplates(templatesData);
      setCampaigns(campaignsData);
      setAutomations(automationsData);
      setAudiences(audiencesData);

      analytics.track({
        name: 'email_dashboard_loaded',
        category: 'email',
        properties: {
          view: currentView,
          date_range: selectedDateRange
        }
      });

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
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
      default:
        start.setDate(end.getDate() - 30);
    }
    
    return {
      start: start.toISOString(),
      end: end.toISOString()
    };
  };

  const handleSendCampaign = async (campaignId: string) => {
    try {
      await emailService.sendCampaign(campaignId);
      await loadDashboardData();
      
      analytics.track({
        name: 'campaign_sent_from_dashboard',
        category: 'email',
        properties: { campaign_id: campaignId }
      });
    } catch (error) {
      console.error('Failed to send campaign:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'sending':
      case 'running':
        return 'text-blue-600 bg-blue-100';
      case 'scheduled':
        return 'text-yellow-600 bg-yellow-100';
      case 'draft':
        return 'text-gray-600 bg-gray-100';
      case 'paused':
        return 'text-orange-600 bg-orange-100';
      case 'cancelled':
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Sent</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {formatNumber(statistics.totalSent)}
                </p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                <Send className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Delivery Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {formatPercentage(statistics.deliveryRate)}
                </p>
              </div>
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Open Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {formatPercentage(statistics.openRate)}
                </p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
                <Eye className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Click Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {formatPercentage(statistics.clickRate)}
                </p>
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-lg">
                <Target className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Templates */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Top Performing Templates
          </h3>
          {statistics?.topTemplates && statistics.topTemplates.length > 0 ? (
            <div className="space-y-4">
              {statistics.topTemplates.map((template: any) => (
                <div key={template.templateId} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {template.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatNumber(template.sent)} sent
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {formatPercentage(template.openRate)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      open rate
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No template data available
            </p>
          )}
        </motion.div>

        {/* Recent Campaigns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Recent Campaigns
          </h3>
          <div className="space-y-4">
            {campaigns.slice(0, 5).map((campaign) => (
              <div key={campaign.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {campaign.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(campaign.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                  {campaign.status}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );

  const renderCampaigns = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="sending">Sending</option>
            <option value="sent">Sent</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>New Campaign</span>
        </button>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {campaigns
          .filter(campaign => 
            (statusFilter === 'all' || campaign.status === statusFilter) &&
            campaign.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((campaign) => (
          <motion.div
            key={campaign.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {campaign.name}
              </h3>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                {campaign.status}
              </span>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {campaign.description}
            </p>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Recipients:</span>
                <span className="font-medium">{campaign.audienceSegments.length} segments</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Sent:</span>
                <span className="font-medium">{formatNumber(campaign.statistics.totalSent)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Open Rate:</span>
                <span className="font-medium">{formatPercentage(campaign.statistics.openRate)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                {campaign.status === 'draft' && (
                  <button
                    onClick={() => handleSendCampaign(campaign.id)}
                    className="flex items-center px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    <Send className="w-3 h-3 mr-1" />
                    Send
                  </button>
                )}
                
                <button className="flex items-center px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                  <BarChart3 className="w-3 h-3 mr-1" />
                  Stats
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <Edit3 className="w-4 h-4" />
                </button>
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderTemplates = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Email Templates
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and create email templates
          </p>
        </div>
        
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>New Template</span>
        </button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {template.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {template.category}
                  </p>
                </div>
              </div>
              
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                template.isActive ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100'
              }`}>
                {template.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Subject: {template.subject}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Variables: {template.variables.length}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <button className="flex items-center px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Eye className="w-3 h-3 mr-1" />
                  Preview
                </button>
                <button className="flex items-center px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Edit3 className="w-3 h-3 mr-1" />
                  Edit
                </button>
              </div>
              
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(template.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderAutomations = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Email Automations
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Automated email workflows and triggers
          </p>
        </div>
        
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>New Automation</span>
        </button>
      </div>

      {/* Automations List */}
      <div className="space-y-4">
        {automations.map((automation) => (
          <motion.div
            key={automation.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {automation.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {automation.description}
                  </p>
                  <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                    <span>Trigger: {automation.trigger.type}</span>
                    <span>Actions: {automation.actions.length}</span>
                    <span>Triggered: {automation.statistics.triggered} times</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {formatNumber(automation.statistics.emailsSent)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    emails sent
                  </p>
                </div>
                
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {formatPercentage(automation.statistics.openRate)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    open rate
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button className={`p-2 rounded-lg ${
                    automation.isActive 
                      ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}>
                    {automation.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  
                  <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderAudiences = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Audience Segments
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage customer segments and targeting
          </p>
        </div>
        
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>New Segment</span>
        </button>
      </div>

      {/* Audiences Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {audiences.map((audience) => (
          <motion.div
            key={audience.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {audience.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatNumber(audience.size)} contacts
                  </p>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {audience.description}
            </p>

            <div className="space-y-2 mb-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Filters: {audience.filters.length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Created: {new Date(audience.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <button className="flex items-center px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                <Edit3 className="w-3 h-3 mr-1" />
                Edit
              </button>
              
              <button className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                <Send className="w-3 h-3 mr-1" />
                Campaign
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading email dashboard...</p>
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
                <Mail className="w-6 h-6 mr-2" />
                Email Marketing
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage campaigns, templates, and automation workflows
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
              </select>

              <button
                onClick={loadDashboardData}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-6 mt-6">
            {[
              { key: 'overview', label: 'Overview', icon: BarChart3 },
              { key: 'campaigns', label: 'Campaigns', icon: Send },
              { key: 'templates', label: 'Templates', icon: Mail },
              { key: 'automations', label: 'Automations', icon: Zap },
              { key: 'audiences', label: 'Audiences', icon: Users }
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

          {currentView === 'campaigns' && (
            <motion.div
              key="campaigns"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {renderCampaigns()}
            </motion.div>
          )}

          {currentView === 'templates' && (
            <motion.div
              key="templates"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {renderTemplates()}
            </motion.div>
          )}

          {currentView === 'automations' && (
            <motion.div
              key="automations"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {renderAutomations()}
            </motion.div>
          )}

          {currentView === 'audiences' && (
            <motion.div
              key="audiences"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {renderAudiences()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}