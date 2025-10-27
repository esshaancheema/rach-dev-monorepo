'use client';

export interface ProjectMetrics {
  id: string;
  projectId: string;
  projectName: string;
  organizationId: string;
  teamId?: string;
  createdBy: string;
  
  // Development Metrics
  codeGeneration: {
    totalFiles: number;
    totalLines: number;
    aiGeneratedLines: number;
    humanEditedLines: number;
    generationRequests: number;
    averageGenerationTime: number; // seconds
    successRate: number; // percentage
  };
  
  // Quality Metrics
  codeQuality: {
    overallScore: number; // 0-100
    complexity: number;
    maintainabilityIndex: number;
    testCoverage: number;
    securityScore: number;
    performanceScore: number;
    duplicateCode: number; // percentage
  };
  
  // Collaboration Metrics
  collaboration: {
    totalContributors: number;
    activeContributors: number;
    edits: number;
    comments: number;
    reviews: number;
    merges: number;
    conflicts: number;
    averageReviewTime: number; // hours
  };
  
  // Deployment Metrics
  deployment: {
    totalDeployments: number;
    successfulDeployments: number;
    failedDeployments: number;
    averageDeploymentTime: number; // minutes
    uptimePercentage: number;
    rollbacks: number;
    platforms: string[];
    lastDeployedAt: Date;
  };
  
  // AI Usage Metrics
  aiUsage: {
    codeGenerationTokens: number;
    analysisRequests: number;
    learningQueries: number;
    reviewRequests: number;
    templateUsage: number;
    totalTokensUsed: number;
    costEstimate: number; // USD
  };
  
  // Time Tracking
  timeMetrics: {
    totalDevelopmentTime: number; // hours
    activeDevTime: number;
    codeGenTime: number;
    reviewTime: number;
    debuggingTime: number;
    deploymentTime: number;
    timeToFirstDeploy: number;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMetrics {
  id: string;
  teamId: string;
  teamName: string;
  organizationId: string;
  period: {
    startDate: Date;
    endDate: Date;
  };
  
  // Team Performance
  performance: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    averageProjectDuration: number; // days
    projectSuccessRate: number; // percentage
    velocityScore: number; // 0-100
  };
  
  // Member Analytics
  memberAnalytics: {
    totalMembers: number;
    activeMembers: number;
    averageExperience: string; // junior, mid, senior
    skillDistribution: { skill: string; count: number }[];
    productivityScore: number; // 0-100
    collaborationScore: number; // 0-100
  };
  
  // Resource Utilization
  resourceUsage: {
    aiTokensUsed: number;
    templatesUsed: number;
    deploymentsCreated: number;
    storageUsed: number; // MB
    computeHours: number;
    estimatedCost: number; // USD
  };
  
  // Quality Metrics
  qualityMetrics: {
    averageCodeQuality: number; // 0-100
    averageTestCoverage: number;
    bugDensity: number;
    technicalDebt: number; // hours
    securityIssues: number;
    performanceIssues: number;
  };
  
  // Learning & Growth
  learningMetrics: {
    totalLearningHours: number;
    skillsAcquired: number;
    certificationsEarned: number;
    knowledgeSharing: number;
    mentoringHours: number;
    innovationIndex: number; // 0-100
  };
  
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationMetrics {
  id: string;
  organizationId: string;
  organizationName: string;
  period: {
    startDate: Date;
    endDate: Date;
  };
  
  // Executive Dashboard
  executive: {
    totalProjects: number;
    activeProjects: number;
    totalTeams: number;
    totalDevelopers: number;
    developmentVelocity: number; // projects per month
    timeToMarket: number; // days
    customerSatisfaction: number; // 0-100
    roi: number; // percentage
  };
  
  // Financial Metrics
  financial: {
    totalCosts: number; // USD
    aiCosts: number;
    infrastructureCosts: number;
    developmentCosts: number;
    operationalCosts: number;
    costPerProject: number;
    costSavings: number; // compared to traditional development
    budgetUtilization: number; // percentage
  };
  
  // Innovation Metrics
  innovation: {
    experimentsRun: number;
    prototypesCreated: number;
    patentApplications: number;
    openSourceContributions: number;
    techDebtReduced: number; // hours
    processImprovements: number;
    innovationScore: number; // 0-100
  };
  
  // Risk & Compliance
  riskCompliance: {
    securityVulnerabilities: number;
    complianceViolations: number;
    dataBreaches: number;
    auditFindings: number;
    riskScore: number; // 0-100
    complianceScore: number; // 0-100
    uptime: number; // percentage
  };
  
  // Market & Competition
  market: {
    competitiveAdvantage: number; // 0-100
    marketShare: number; // percentage
    customerGrowth: number; // percentage
    productInnovation: number; // 0-100
    digitalTransformation: number; // 0-100
    agilyScore: number; // 0-100
  };
  
  createdAt: Date;
  updatedAt: Date;
}

export interface AnalyticsFilter {
  organizationId: string;
  teamIds?: string[];
  projectIds?: string[];
  userIds?: string[];
  dateRange: {
    start: Date;
    end: Date;
  };
  metrics?: string[];
  granularity?: 'hourly' | 'daily' | 'weekly' | 'monthly';
  groupBy?: 'project' | 'team' | 'user' | 'date';
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'executive' | 'team' | 'project' | 'developer' | 'financial' | 'security';
  filters: AnalyticsFilter;
  metrics: string[];
  visualizations: ReportVisualization[];
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    recipients: string[];
    format: 'pdf' | 'excel' | 'dashboard';
  };
  createdBy: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportVisualization {
  id: string;
  type: 'chart' | 'table' | 'metric' | 'heatmap' | 'gauge' | 'trend';
  chartType?: 'line' | 'bar' | 'pie' | 'scatter' | 'area' | 'funnel';
  title: string;
  description?: string;
  dataSource: string;
  config: {
    xAxis?: string;
    yAxis?: string;
    groupBy?: string;
    aggregation?: 'sum' | 'avg' | 'count' | 'max' | 'min';
    colors?: string[];
    showLegend?: boolean;
    showLabels?: boolean;
  };
  position: { x: number; y: number; width: number; height: number };
}

export interface Insight {
  id: string;
  type: 'trend' | 'anomaly' | 'recommendation' | 'alert' | 'opportunity';
  category: 'performance' | 'quality' | 'cost' | 'security' | 'innovation';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-100
  data: Record<string, any>;
  actions?: {
    title: string;
    description: string;
    type: 'fix' | 'optimize' | 'investigate';
    priority: 'low' | 'medium' | 'high';
  }[];
  organizationId: string;
  createdAt: Date;
  expiresAt?: Date;
}

export interface Benchmark {
  category: string;
  metric: string;
  value: number;
  benchmark: number;
  percentile: number;
  industry: string;
  organizationSize: 'startup' | 'small' | 'medium' | 'enterprise';
  lastUpdated: Date;
}

export class AnalyticsService {
  private projectMetrics: Map<string, ProjectMetrics> = new Map();
  private teamMetrics: Map<string, TeamMetrics> = new Map();
  private organizationMetrics: Map<string, OrganizationMetrics> = new Map();
  private reportTemplates: Map<string, ReportTemplate> = new Map();
  private insights: Map<string, Insight> = new Map();
  private benchmarks: Map<string, Benchmark> = new Map();

  constructor() {
    this.initializeMockData();
  }

  // Project Analytics
  async getProjectMetrics(projectId: string): Promise<ProjectMetrics | null> {
    return this.projectMetrics.get(projectId) || null;
  }

  async getProjectMetricsByOrganization(
    organizationId: string,
    filter?: Partial<AnalyticsFilter>
  ): Promise<ProjectMetrics[]> {
    const metrics = Array.from(this.projectMetrics.values())
      .filter(m => m.organizationId === organizationId);

    if (filter?.teamIds?.length) {
      return metrics.filter(m => m.teamId && filter.teamIds!.includes(m.teamId));
    }

    if (filter?.dateRange) {
      return metrics.filter(m => 
        m.createdAt >= filter.dateRange!.start && m.createdAt <= filter.dateRange!.end
      );
    }

    return metrics;
  }

  async updateProjectMetrics(projectId: string, updates: Partial<ProjectMetrics>): Promise<void> {
    const existing = this.projectMetrics.get(projectId);
    if (existing) {
      const updated = { ...existing, ...updates, updatedAt: new Date() };
      this.projectMetrics.set(projectId, updated);
    }
  }

  // Team Analytics
  async getTeamMetrics(teamId: string): Promise<TeamMetrics | null> {
    return this.teamMetrics.get(teamId) || null;
  }

  async getTeamMetricsByOrganization(organizationId: string): Promise<TeamMetrics[]> {
    return Array.from(this.teamMetrics.values())
      .filter(m => m.organizationId === organizationId);
  }

  async generateTeamReport(
    teamId: string,
    period: { startDate: Date; endDate: Date }
  ): Promise<TeamMetrics> {
    // In a real implementation, this would aggregate data from various sources
    const team = this.teamMetrics.get(teamId);
    if (!team) {
      throw new Error('Team metrics not found');
    }

    // Simulate report generation
    return { ...team, period, updatedAt: new Date() };
  }

  // Organization Analytics
  async getOrganizationMetrics(organizationId: string): Promise<OrganizationMetrics | null> {
    return this.organizationMetrics.get(organizationId) || null;
  }

  async generateExecutiveReport(
    organizationId: string,
    period: { startDate: Date; endDate: Date }
  ): Promise<OrganizationMetrics> {
    const org = this.organizationMetrics.get(organizationId);
    if (!org) {
      throw new Error('Organization metrics not found');
    }

    // Simulate executive report generation with real-time data
    return { ...org, period, updatedAt: new Date() };
  }

  // Insights & Recommendations
  async generateInsights(organizationId: string): Promise<Insight[]> {
    const insights: Insight[] = [];
    const orgMetrics = this.organizationMetrics.get(organizationId);
    
    if (!orgMetrics) return insights;

    // Performance Insights
    if (orgMetrics.executive.developmentVelocity < 5) {
      insights.push({
        id: this.generateId(),
        type: 'recommendation',
        category: 'performance',
        title: 'Low Development Velocity Detected',
        description: 'Your development velocity is below industry average. Consider implementing AI-assisted code generation and automated testing.',
        impact: 'high',
        confidence: 85,
        data: { velocity: orgMetrics.executive.developmentVelocity, benchmark: 8.5 },
        actions: [
          {
            title: 'Enable AI Code Generation',
            description: 'Increase usage of AI-powered code generation tools',
            type: 'optimize',
            priority: 'high'
          },
          {
            title: 'Implement Automated Testing',
            description: 'Set up automated testing pipelines to reduce manual testing time',
            type: 'optimize',
            priority: 'medium'
          }
        ],
        organizationId,
        createdAt: new Date()
      });
    }

    // Cost Optimization
    if (orgMetrics.financial.aiCosts > orgMetrics.financial.totalCosts * 0.4) {
      insights.push({
        id: this.generateId(),
        type: 'opportunity',
        category: 'cost',
        title: 'AI Cost Optimization Opportunity',
        description: 'AI costs are high relative to total spend. Consider optimizing AI token usage and implementing caching strategies.',
        impact: 'medium',
        confidence: 78,
        data: { 
          aiCostPercentage: (orgMetrics.financial.aiCosts / orgMetrics.financial.totalCosts) * 100,
          potentialSavings: orgMetrics.financial.aiCosts * 0.25
        },
        actions: [
          {
            title: 'Implement Token Caching',
            description: 'Cache frequently used AI responses to reduce token consumption',
            type: 'optimize',
            priority: 'high'
          },
          {
            title: 'Optimize AI Model Usage',
            description: 'Use smaller models for simple tasks and larger models only when necessary',
            type: 'optimize',
            priority: 'medium'
          }
        ],
        organizationId,
        createdAt: new Date()
      });
    }

    // Security Alert
    if (orgMetrics.riskCompliance.securityVulnerabilities > 10) {
      insights.push({
        id: this.generateId(),
        type: 'alert',
        category: 'security',
        title: 'Security Vulnerabilities Require Attention',
        description: 'Multiple security vulnerabilities detected across projects. Immediate action recommended.',
        impact: 'critical',
        confidence: 95,
        data: { vulnerabilities: orgMetrics.riskCompliance.securityVulnerabilities },
        actions: [
          {
            title: 'Run Security Audit',
            description: 'Perform comprehensive security audit across all projects',
            type: 'fix',
            priority: 'high'
          },
          {
            title: 'Enable Automated Security Scanning',
            description: 'Implement continuous security scanning in CI/CD pipelines',
            type: 'fix',
            priority: 'high'
          }
        ],
        organizationId,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      });
    }

    this.insights.set(organizationId, ...insights);
    return insights;
  }

  async getInsights(organizationId: string): Promise<Insight[]> {
    return Array.from(this.insights.values())
      .filter(i => i.organizationId === organizationId)
      .sort((a, b) => {
        // Sort by impact and confidence
        const impactOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        const aScore = impactOrder[a.impact] * (a.confidence / 100);
        const bScore = impactOrder[b.impact] * (b.confidence / 100);
        return bScore - aScore;
      });
  }

  // Benchmarking
  async getBenchmarks(category?: string): Promise<Benchmark[]> {
    const benchmarks = Array.from(this.benchmarks.values());
    return category ? benchmarks.filter(b => b.category === category) : benchmarks;
  }

  async compareToBenchmark(
    organizationId: string,
    metric: string,
    value: number
  ): Promise<{ benchmark: Benchmark; performance: 'above' | 'below' | 'at'; percentile: number } | null> {
    const benchmark = Array.from(this.benchmarks.values())
      .find(b => b.metric === metric);
    
    if (!benchmark) return null;

    const performance = value > benchmark.benchmark ? 'above' : 
                      value < benchmark.benchmark ? 'below' : 'at';
    
    // Calculate percentile based on value relative to benchmark
    const percentile = Math.min(100, Math.max(0, (value / benchmark.benchmark) * 50));

    return { benchmark, performance, percentile };
  }

  // Report Generation
  async createReportTemplate(template: Omit<ReportTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<ReportTemplate> {
    const reportTemplate: ReportTemplate = {
      id: this.generateId(),
      ...template,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.reportTemplates.set(reportTemplate.id, reportTemplate);
    return reportTemplate;
  }

  async getReportTemplates(organizationId: string): Promise<ReportTemplate[]> {
    return Array.from(this.reportTemplates.values())
      .filter(t => t.organizationId === organizationId);
  }

  async generateReport(templateId: string): Promise<{
    template: ReportTemplate;
    data: Record<string, any>;
    visualizations: any[];
  }> {
    const template = this.reportTemplates.get(templateId);
    if (!template) {
      throw new Error('Report template not found');
    }

    // Generate mock report data based on template
    const data = await this.generateReportData(template);
    const visualizations = await this.generateVisualizations(template, data);

    return { template, data, visualizations };
  }

  // Time Series Analytics
  async getTimeSeriesData(
    organizationId: string,
    metric: string,
    period: { startDate: Date; endDate: Date },
    granularity: 'hourly' | 'daily' | 'weekly' | 'monthly' = 'daily'
  ): Promise<{ timestamp: Date; value: number }[]> {
    const data: { timestamp: Date; value: number }[] = [];
    const start = new Date(period.startDate);
    const end = new Date(period.endDate);
    
    let interval: number;
    switch (granularity) {
      case 'hourly': interval = 60 * 60 * 1000; break;
      case 'daily': interval = 24 * 60 * 60 * 1000; break;
      case 'weekly': interval = 7 * 24 * 60 * 60 * 1000; break;
      case 'monthly': interval = 30 * 24 * 60 * 60 * 1000; break;
    }

    for (let current = start; current <= end; current = new Date(current.getTime() + interval)) {
      // Generate mock time series data
      const baseValue = this.getBaseMetricValue(metric);
      const randomVariation = (Math.random() - 0.5) * 0.3; // ±15% variation
      const trendFactor = (current.getTime() - start.getTime()) / (end.getTime() - start.getTime());
      const seasonalFactor = Math.sin((current.getTime() / interval) * Math.PI / 12) * 0.1;
      
      const value = baseValue * (1 + randomVariation + trendFactor * 0.2 + seasonalFactor);
      data.push({ timestamp: new Date(current), value: Math.max(0, value) });
    }

    return data;
  }

  // Real-time Analytics
  async getRealtimeMetrics(organizationId: string): Promise<{
    activeUsers: number;
    activeProjects: number;
    currentDeployments: number;
    aiRequestsPerMinute: number;
    systemHealth: number;
    alerts: number;
  }> {
    // Simulate real-time data
    return {
      activeUsers: Math.floor(Math.random() * 50) + 10,
      activeProjects: Math.floor(Math.random() * 20) + 5,
      currentDeployments: Math.floor(Math.random() * 8) + 1,
      aiRequestsPerMinute: Math.floor(Math.random() * 100) + 20,
      systemHealth: Math.floor(Math.random() * 20) + 80, // 80-100%
      alerts: Math.floor(Math.random() * 5)
    };
  }

  // Export & Integration
  async exportData(
    organizationId: string,
    filter: AnalyticsFilter,
    format: 'json' | 'csv' | 'excel'
  ): Promise<{ data: any; filename: string; mimeType: string }> {
    const data = await this.getAnalyticsData(filter);
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `analytics-export-${timestamp}.${format}`;
    
    let mimeType: string;
    let processedData: any;

    switch (format) {
      case 'json':
        mimeType = 'application/json';
        processedData = JSON.stringify(data, null, 2);
        break;
      case 'csv':
        mimeType = 'text/csv';
        processedData = this.convertToCSV(data);
        break;
      case 'excel':
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        processedData = data; // Would use a library like exceljs in real implementation
        break;
      default:
        throw new Error('Unsupported export format');
    }

    return { data: processedData, filename, mimeType };
  }

  // Private helper methods
  private async generateReportData(template: ReportTemplate): Promise<Record<string, any>> {
    // Mock report data generation based on template metrics
    const data: Record<string, any> = {};
    
    for (const metric of template.metrics) {
      data[metric] = this.generateMockMetricData(metric);
    }

    return data;
  }

  private async generateVisualizations(template: ReportTemplate, data: Record<string, any>): Promise<any[]> {
    return template.visualizations.map(viz => ({
      ...viz,
      data: data[viz.dataSource] || []
    }));
  }

  private generateMockMetricData(metric: string): any[] {
    const count = Math.floor(Math.random() * 20) + 10;
    return Array.from({ length: count }, (_, i) => ({
      x: i,
      y: Math.floor(Math.random() * 100) + 1,
      label: `Data Point ${i + 1}`
    }));
  }

  private getBaseMetricValue(metric: string): number {
    const baselines: Record<string, number> = {
      'developmentVelocity': 8,
      'codeQuality': 75,
      'deployment': 15,
      'aiUsage': 1000,
      'cost': 5000,
      'performance': 85
    };

    return baselines[metric] || 50;
  }

  private async getAnalyticsData(filter: AnalyticsFilter): Promise<any[]> {
    // Aggregate data based on filter
    const projects = await this.getProjectMetricsByOrganization(filter.organizationId, filter);
    return projects.map(p => ({
      projectId: p.projectId,
      projectName: p.projectName,
      codeQuality: p.codeQuality.overallScore,
      deployment: p.deployment.successfulDeployments,
      aiUsage: p.aiUsage.totalTokensUsed,
      cost: p.aiUsage.costEstimate
    }));
  }

  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(h => row[h]).join(','))
    ].join('\n');

    return csvContent;
  }

  private generateId(): string {
    return 'analytics_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  // Initialize mock data
  private initializeMockData(): void {
    // Sample project metrics
    const project1: ProjectMetrics = {
      id: 'metrics_proj_1',
      projectId: 'proj_react_dashboard',
      projectName: 'React Analytics Dashboard',
      organizationId: 'org_sample',
      teamId: 'team_frontend',
      createdBy: 'user_alice',
      codeGeneration: {
        totalFiles: 45,
        totalLines: 3420,
        aiGeneratedLines: 2150,
        humanEditedLines: 1270,
        generationRequests: 28,
        averageGenerationTime: 3.2,
        successRate: 94.5
      },
      codeQuality: {
        overallScore: 87,
        complexity: 6.2,
        maintainabilityIndex: 78,
        testCoverage: 85,
        securityScore: 92,
        performanceScore: 81,
        duplicateCode: 3.1
      },
      collaboration: {
        totalContributors: 4,
        activeContributors: 3,
        edits: 156,
        comments: 23,
        reviews: 12,
        merges: 18,
        conflicts: 2,
        averageReviewTime: 4.5
      },
      deployment: {
        totalDeployments: 15,
        successfulDeployments: 14,
        failedDeployments: 1,
        averageDeploymentTime: 6.8,
        uptimePercentage: 99.8,
        rollbacks: 1,
        platforms: ['vercel', 'netlify'],
        lastDeployedAt: new Date()
      },
      aiUsage: {
        codeGenerationTokens: 45000,
        analysisRequests: 23,
        learningQueries: 15,
        reviewRequests: 8,
        templateUsage: 3,
        totalTokensUsed: 52000,
        costEstimate: 156.5
      },
      timeMetrics: {
        totalDevelopmentTime: 120,
        activeDevTime: 95,
        codeGenTime: 8,
        reviewTime: 18,
        debuggingTime: 25,
        deploymentTime: 4,
        timeToFirstDeploy: 72
      },
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date()
    };

    this.projectMetrics.set(project1.projectId, project1);

    // Sample team metrics
    const team1: TeamMetrics = {
      id: 'metrics_team_1',
      teamId: 'team_frontend',
      teamName: 'Frontend Development',
      organizationId: 'org_sample',
      period: {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-03-31')
      },
      performance: {
        totalProjects: 8,
        activeProjects: 3,
        completedProjects: 5,
        averageProjectDuration: 45,
        projectSuccessRate: 87.5,
        velocityScore: 82
      },
      memberAnalytics: {
        totalMembers: 6,
        activeMembers: 5,
        averageExperience: 'mid',
        skillDistribution: [
          { skill: 'React', count: 6 },
          { skill: 'TypeScript', count: 5 },
          { skill: 'Node.js', count: 4 },
          { skill: 'Python', count: 2 }
        ],
        productivityScore: 85,
        collaborationScore: 78
      },
      resourceUsage: {
        aiTokensUsed: 125000,
        templatesUsed: 12,
        deploymentsCreated: 45,
        storageUsed: 2400,
        computeHours: 156,
        estimatedCost: 2850.75
      },
      qualityMetrics: {
        averageCodeQuality: 84,
        averageTestCoverage: 78,
        bugDensity: 2.1,
        technicalDebt: 85,
        securityIssues: 3,
        performanceIssues: 1
      },
      learningMetrics: {
        totalLearningHours: 45,
        skillsAcquired: 8,
        certificationsEarned: 2,
        knowledgeSharing: 12,
        mentoringHours: 18,
        innovationIndex: 72
      },
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date()
    };

    this.teamMetrics.set(team1.teamId, team1);

    // Sample organization metrics
    const org1: OrganizationMetrics = {
      id: 'metrics_org_1',
      organizationId: 'org_sample',
      organizationName: 'Acme Corporation',
      period: {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-03-31')
      },
      executive: {
        totalProjects: 24,
        activeProjects: 8,
        totalTeams: 4,
        totalDevelopers: 18,
        developmentVelocity: 6.5,
        timeToMarket: 42,
        customerSatisfaction: 88,
        roi: 145
      },
      financial: {
        totalCosts: 45000,
        aiCosts: 12500,
        infrastructureCosts: 15000,
        developmentCosts: 12500,
        operationalCosts: 5000,
        costPerProject: 1875,
        costSavings: 18000,
        budgetUtilization: 78
      },
      innovation: {
        experimentsRun: 15,
        prototypesCreated: 8,
        patentApplications: 2,
        openSourceContributions: 12,
        techDebtReduced: 240,
        processImprovements: 6,
        innovationScore: 76
      },
      riskCompliance: {
        securityVulnerabilities: 8,
        complianceViolations: 2,
        dataBreaches: 0,
        auditFindings: 3,
        riskScore: 25,
        complianceScore: 92,
        uptime: 99.7
      },
      market: {
        competitiveAdvantage: 78,
        marketShare: 12.5,
        customerGrowth: 15.2,
        productInnovation: 82,
        digitalTransformation: 85,
        agilyScore: 79
      },
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date()
    };

    this.organizationMetrics.set(org1.organizationId, org1);

    // Sample benchmarks
    const benchmarks: Benchmark[] = [
      {
        category: 'development',
        metric: 'developmentVelocity',
        value: 8.5,
        benchmark: 7.2,
        percentile: 75,
        industry: 'software',
        organizationSize: 'medium',
        lastUpdated: new Date()
      },
      {
        category: 'quality',
        metric: 'codeQuality',
        value: 82,
        benchmark: 78,
        percentile: 68,
        industry: 'software',
        organizationSize: 'medium',
        lastUpdated: new Date()
      },
      {
        category: 'deployment',
        metric: 'deploymentSuccess',
        value: 94,
        benchmark: 91,
        percentile: 72,
        industry: 'software',
        organizationSize: 'medium',
        lastUpdated: new Date()
      }
    ];

    benchmarks.forEach(benchmark => {
      this.benchmarks.set(`${benchmark.category}_${benchmark.metric}`, benchmark);
    });
  }
}