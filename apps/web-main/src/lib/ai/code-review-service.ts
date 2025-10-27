'use client';

export interface CodeReviewRequest {
  id: string;
  projectId: string;
  organizationId: string;
  title: string;
  description?: string;
  files: CodeFile[];
  author: string;
  createdAt: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  reviewType: 'automatic' | 'manual' | 'hybrid';
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface CodeFile {
  path: string;
  content: string;
  language: string;
  size: number;
  changes: CodeChange[];
}

export interface CodeChange {
  type: 'added' | 'modified' | 'deleted';
  lineStart: number;
  lineEnd: number;
  oldContent?: string;
  newContent?: string;
}

export interface ReviewFindings {
  id: string;
  reviewId: string;
  category: 'security' | 'performance' | 'maintainability' | 'style' | 'logic' | 'best_practices';
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  description: string;
  file: string;
  line: number;
  column?: number;
  suggestion?: string;
  autoFixable: boolean;
  confidence: number; // 0-100
  ruleId: string;
  tags: string[];
}

export interface QualityGate {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  conditions: QualityCondition[];
  enforcement: 'blocking' | 'warning' | 'informational';
  applicableProjects: string[];
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface QualityCondition {
  metric: string;
  operator: 'greater_than' | 'less_than' | 'equals' | 'not_equals';
  threshold: number;
  description: string;
}

export interface ReviewResult {
  reviewId: string;
  overallScore: number; // 0-100
  findings: ReviewFindings[];
  qualityGateResults: QualityGateResult[];
  metrics: CodeMetrics;
  aiSummary: string;
  recommendations: string[];
  estimatedReviewTime: number; // minutes
  reviewer?: string;
  reviewedAt?: Date;
  approved: boolean;
}

export interface QualityGateResult {
  gateId: string;
  gateName: string;
  status: 'passed' | 'failed' | 'warning';
  conditions: {
    condition: QualityCondition;
    actualValue: number;
    passed: boolean;
    message: string;
  }[];
}

export interface CodeMetrics {
  complexity: number;
  maintainabilityIndex: number;
  testCoverage: number;
  codeSmells: number;
  duplicateLines: number;
  linesOfCode: number;
  securityHotspots: number;
  performanceIssues: number;
  technicalDebt: number; // hours
}

export interface ReviewTemplate {
  id: string;
  name: string;
  description: string;
  organizationId: string;
  checklist: ReviewChecklistItem[];
  qualityGates: string[];
  aiPrompts: AIReviewPrompt[];
  autoAssign: boolean;
  reviewers: string[];
  createdAt: Date;
}

export interface ReviewChecklistItem {
  id: string;
  category: string;
  title: string;
  description: string;
  required: boolean;
  automatable: boolean;
  weight: number; // 1-10
}

export interface AIReviewPrompt {
  category: string;
  prompt: string;
  focusAreas: string[];
  severity: 'info' | 'warning' | 'error';
}

export interface ReviewerAssignment {
  reviewId: string;
  reviewerId: string;
  assignedAt: Date;
  role: 'primary' | 'secondary' | 'security' | 'performance';
  expertise: string[];
  workload: number; // current active reviews
}

export class CodeReviewService {
  private reviews: Map<string, CodeReviewRequest> = new Map();
  private results: Map<string, ReviewResult> = new Map();
  private qualityGates: Map<string, QualityGate> = new Map();
  private templates: Map<string, ReviewTemplate> = new Map();

  constructor() {
    this.initializeMockData();
  }

  // Review Management
  async createReview(request: Omit<CodeReviewRequest, 'id' | 'createdAt' | 'status'>): Promise<CodeReviewRequest> {
    const review: CodeReviewRequest = {
      id: this.generateId(),
      ...request,
      createdAt: new Date(),
      status: 'pending'
    };

    this.reviews.set(review.id, review);
    
    // Auto-start review based on type
    if (review.reviewType === 'automatic') {
      this.performAutomaticReview(review.id);
    }

    return review;
  }

  async getReview(reviewId: string): Promise<CodeReviewRequest | null> {
    return this.reviews.get(reviewId) || null;
  }

  async getReviewsByProject(projectId: string): Promise<CodeReviewRequest[]> {
    return Array.from(this.reviews.values())
      .filter(r => r.projectId === projectId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getReviewsByOrganization(organizationId: string): Promise<CodeReviewRequest[]> {
    return Array.from(this.reviews.values())
      .filter(r => r.organizationId === organizationId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // AI-Powered Review Analysis
  async performAutomaticReview(reviewId: string): Promise<ReviewResult> {
    const review = this.reviews.get(reviewId);
    if (!review) throw new Error('Review not found');

    // Update status
    review.status = 'in_progress';
    this.reviews.set(reviewId, review);

    try {
      // Analyze code files
      const findings = await this.analyzeCodeFiles(review.files);
      
      // Calculate metrics
      const metrics = await this.calculateMetrics(review.files);
      
      // Check quality gates
      const qualityGateResults = await this.checkQualityGates(review.organizationId, metrics);
      
      // Generate AI summary and recommendations
      const aiAnalysis = await this.generateAIAnalysis(review, findings, metrics);
      
      // Calculate overall score
      const overallScore = this.calculateOverallScore(findings, metrics, qualityGateResults);
      
      const result: ReviewResult = {
        reviewId: review.id,
        overallScore,
        findings,
        qualityGateResults,
        metrics,
        aiSummary: aiAnalysis.summary,
        recommendations: aiAnalysis.recommendations,
        estimatedReviewTime: this.estimateReviewTime(findings, metrics),
        approved: overallScore >= 70 && qualityGateResults.every(qg => qg.status !== 'failed'),
        reviewedAt: new Date()
      };

      this.results.set(reviewId, result);
      
      // Update review status
      review.status = 'completed';
      this.reviews.set(reviewId, review);

      return result;
    } catch (error) {
      review.status = 'rejected';
      this.reviews.set(reviewId, review);
      throw error;
    }
  }

  async getReviewResult(reviewId: string): Promise<ReviewResult | null> {
    return this.results.get(reviewId) || null;
  }

  // Quality Gates Management
  async createQualityGate(gate: Omit<QualityGate, 'id' | 'createdAt' | 'updatedAt'>): Promise<QualityGate> {
    const qualityGate: QualityGate = {
      id: this.generateId(),
      ...gate,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.qualityGates.set(qualityGate.id, qualityGate);
    return qualityGate;
  }

  async getQualityGates(organizationId: string): Promise<QualityGate[]> {
    return Array.from(this.qualityGates.values())
      .filter(qg => qg.organizationId === organizationId);
  }

  async updateQualityGate(gateId: string, updates: Partial<QualityGate>): Promise<QualityGate> {
    const existing = this.qualityGates.get(gateId);
    if (!existing) throw new Error('Quality gate not found');

    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.qualityGates.set(gateId, updated);
    return updated;
  }

  // Review Templates
  async createReviewTemplate(template: Omit<ReviewTemplate, 'id' | 'createdAt'>): Promise<ReviewTemplate> {
    const reviewTemplate: ReviewTemplate = {
      id: this.generateId(),
      ...template,
      createdAt: new Date()
    };

    this.templates.set(reviewTemplate.id, reviewTemplate);
    return reviewTemplate;
  }

  async getReviewTemplates(organizationId: string): Promise<ReviewTemplate[]> {
    return Array.from(this.templates.values())
      .filter(t => t.organizationId === organizationId);
  }

  // Advanced Analytics
  async getReviewAnalytics(organizationId: string, period?: { start: Date; end: Date }): Promise<{
    totalReviews: number;
    averageScore: number;
    findingsByCategory: Record<string, number>;
    reviewTimeStats: { min: number; max: number; average: number };
    qualityGatePassRate: number;
    topIssues: { title: string; count: number; severity: string }[];
    reviewerPerformance: { reviewerId: string; reviewsCompleted: number; averageScore: number }[];
  }> {
    const reviews = this.getReviewsByOrganization(organizationId);
    const filteredReviews = period 
      ? reviews.filter(r => r.createdAt >= period.start && r.createdAt <= period.end)
      : reviews;

    const results = await Promise.all(
      filteredReviews.map(r => this.getReviewResult(r.id))
    );

    const completedResults = results.filter(r => r !== null) as ReviewResult[];

    // Calculate analytics
    const totalReviews = completedResults.length;
    const averageScore = totalReviews > 0 
      ? completedResults.reduce((sum, r) => sum + r.overallScore, 0) / totalReviews 
      : 0;

    const findingsByCategory: Record<string, number> = {};
    const topIssuesMap: Record<string, { count: number; severity: string }> = {};

    completedResults.forEach(result => {
      result.findings.forEach(finding => {
        findingsByCategory[finding.category] = (findingsByCategory[finding.category] || 0) + 1;
        
        const key = finding.title;
        if (!topIssuesMap[key]) {
          topIssuesMap[key] = { count: 0, severity: finding.severity };
        }
        topIssuesMap[key].count++;
      });
    });

    const topIssues = Object.entries(topIssuesMap)
      .map(([title, data]) => ({ title, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const reviewTimes = completedResults.map(r => r.estimatedReviewTime);
    const reviewTimeStats = reviewTimes.length > 0 
      ? {
          min: Math.min(...reviewTimes),
          max: Math.max(...reviewTimes),
          average: reviewTimes.reduce((sum, t) => sum + t, 0) / reviewTimes.length
        }
      : { min: 0, max: 0, average: 0 };

    const qualityGatePasses = completedResults.reduce((count, result) => 
      count + (result.qualityGateResults.every(qg => qg.status !== 'failed') ? 1 : 0), 0
    );
    const qualityGatePassRate = totalReviews > 0 ? (qualityGatePasses / totalReviews) * 100 : 0;

    return {
      totalReviews,
      averageScore,
      findingsByCategory,
      reviewTimeStats,
      qualityGatePassRate,
      topIssues,
      reviewerPerformance: [] // Would be calculated from actual reviewer data
    };
  }

  // Auto-fix Suggestions
  async generateAutoFixes(reviewId: string): Promise<{ finding: ReviewFindings; fix: string }[]> {
    const result = this.results.get(reviewId);
    if (!result) return [];

    const autoFixableFindings = result.findings.filter(f => f.autoFixable);
    
    return autoFixableFindings.map(finding => ({
      finding,
      fix: this.generateFixForFinding(finding)
    }));
  }

  async applyAutoFix(reviewId: string, findingId: string): Promise<{ success: boolean; updatedContent: string }> {
    // Mock implementation - in real system would apply actual fixes
    return {
      success: Math.random() > 0.1, // 90% success rate
      updatedContent: 'Fixed code content would be returned here'
    };
  }

  // Private helper methods
  private async analyzeCodeFiles(files: CodeFile[]): Promise<ReviewFindings[]> {
    const findings: ReviewFindings[] = [];

    for (const file of files) {
      // Security analysis
      if (file.content.includes('eval(') || file.content.includes('innerHTML')) {
        findings.push({
          id: this.generateId(),
          reviewId: '',
          category: 'security',
          severity: 'critical',
          title: 'Potential XSS vulnerability',
          description: 'Direct use of eval() or innerHTML can lead to XSS attacks',
          file: file.path,
          line: 1,
          suggestion: 'Use safer alternatives like textContent or proper sanitization',
          autoFixable: true,
          confidence: 90,
          ruleId: 'security.xss.direct-eval',
          tags: ['xss', 'security', 'eval']
        });
      }

      // Performance analysis
      if (file.content.includes('for (') && file.content.includes('querySelector(')) {
        findings.push({
          id: this.generateId(),
          reviewId: '',
          category: 'performance',
          severity: 'warning',
          title: 'DOM query in loop',
          description: 'DOM queries inside loops can cause performance issues',
          file: file.path,
          line: 1,
          suggestion: 'Cache DOM queries outside the loop',
          autoFixable: false,
          confidence: 75,
          ruleId: 'performance.dom-query-loop',
          tags: ['performance', 'dom', 'loop']
        });
      }

      // Maintainability analysis
      if (file.content.length > 10000) {
        findings.push({
          id: this.generateId(),
          reviewId: '',
          category: 'maintainability',
          severity: 'warning',
          title: 'Large file size',
          description: 'File is very large and may be difficult to maintain',
          file: file.path,
          line: 1,
          suggestion: 'Consider breaking this file into smaller, more focused modules',
          autoFixable: false,
          confidence: 80,
          ruleId: 'maintainability.file-size',
          tags: ['maintainability', 'refactoring']
        });
      }

      // Style analysis
      if (!file.content.includes('use strict') && file.language === 'javascript') {
        findings.push({
          id: this.generateId(),
          reviewId: '',
          category: 'style',
          severity: 'info',
          title: 'Missing strict mode',
          description: 'JavaScript files should use strict mode',
          file: file.path,
          line: 1,
          suggestion: 'Add "use strict"; at the top of the file',
          autoFixable: true,
          confidence: 95,
          ruleId: 'style.strict-mode',
          tags: ['style', 'javascript', 'strict']
        });
      }
    }

    return findings;
  }

  private async calculateMetrics(files: CodeFile[]): Promise<CodeMetrics> {
    const totalLines = files.reduce((sum, file) => sum + file.content.split('\n').length, 0);
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);

    // Mock metrics calculation
    return {
      complexity: Math.floor(Math.random() * 20) + 5, // 5-25
      maintainabilityIndex: Math.floor(Math.random() * 40) + 60, // 60-100
      testCoverage: Math.floor(Math.random() * 50) + 50, // 50-100
      codeSmells: Math.floor(Math.random() * 10) + 1, // 1-10
      duplicateLines: Math.floor(Math.random() * 100) + 10, // 10-110
      linesOfCode: totalLines,
      securityHotspots: Math.floor(Math.random() * 5) + 1, // 1-5
      performanceIssues: Math.floor(Math.random() * 8) + 2, // 2-10
      technicalDebt: Math.floor(Math.random() * 20) + 5 // 5-25 hours
    };
  }

  private async checkQualityGates(organizationId: string, metrics: CodeMetrics): Promise<QualityGateResult[]> {
    const gates = await this.getQualityGates(organizationId);
    const results: QualityGateResult[] = [];

    for (const gate of gates.filter(g => g.isActive)) {
      const conditions = gate.conditions.map(condition => {
        const actualValue = this.getMetricValue(metrics, condition.metric);
        let passed = false;

        switch (condition.operator) {
          case 'greater_than':
            passed = actualValue > condition.threshold;
            break;
          case 'less_than':
            passed = actualValue < condition.threshold;
            break;
          case 'equals':
            passed = actualValue === condition.threshold;
            break;
          case 'not_equals':
            passed = actualValue !== condition.threshold;
            break;
        }

        return {
          condition,
          actualValue,
          passed,
          message: passed 
            ? `✅ ${condition.metric} (${actualValue}) meets requirement`
            : `❌ ${condition.metric} (${actualValue}) fails requirement (${condition.operator} ${condition.threshold})`
        };
      });

      const allPassed = conditions.every(c => c.passed);
      const anyFailed = conditions.some(c => !c.passed);
      
      results.push({
        gateId: gate.id,
        gateName: gate.name,
        status: allPassed ? 'passed' : (gate.enforcement === 'warning' ? 'warning' : 'failed'),
        conditions
      });
    }

    return results;
  }

  private async generateAIAnalysis(
    review: CodeReviewRequest, 
    findings: ReviewFindings[], 
    metrics: CodeMetrics
  ): Promise<{ summary: string; recommendations: string[] }> {
    const criticalIssues = findings.filter(f => f.severity === 'critical').length;
    const majorIssues = findings.filter(f => f.severity === 'error').length;
    const totalIssues = findings.length;

    const summary = `Code review completed for "${review.title}". Found ${totalIssues} total issues: ${criticalIssues} critical, ${majorIssues} major. Overall code quality score: ${Math.round((100 - totalIssues * 2) * 100) / 100}%. The code shows ${metrics.maintainabilityIndex > 70 ? 'good' : 'poor'} maintainability with ${metrics.complexity > 15 ? 'high' : 'acceptable'} complexity.`;

    const recommendations = [
      'Address critical security vulnerabilities immediately',
      'Refactor complex functions to improve maintainability',
      'Add unit tests to increase coverage above 80%',
      'Consider breaking large files into smaller modules',
      'Implement proper error handling and logging'
    ].slice(0, Math.min(5, Math.floor(totalIssues / 2) + 2));

    return { summary, recommendations };
  }

  private calculateOverallScore(
    findings: ReviewFindings[], 
    metrics: CodeMetrics,
    qualityGateResults: QualityGateResult[]
  ): number {
    let score = 100;

    // Deduct points for findings
    findings.forEach(finding => {
      switch (finding.severity) {
        case 'critical': score -= 15; break;
        case 'error': score -= 10; break;
        case 'warning': score -= 5; break;
        case 'info': score -= 1; break;
      }
    });

    // Factor in metrics
    if (metrics.maintainabilityIndex < 60) score -= 10;
    if (metrics.complexity > 15) score -= 10;
    if (metrics.testCoverage < 70) score -= 15;
    if (metrics.securityHotspots > 5) score -= 10;

    // Factor in quality gates
    const failedGates = qualityGateResults.filter(qg => qg.status === 'failed');
    score -= failedGates.length * 10;

    return Math.max(0, Math.min(100, score));
  }

  private estimateReviewTime(findings: ReviewFindings[], metrics: CodeMetrics): number {
    const baseTime = 15; // 15 minutes base
    const findingTime = findings.length * 2; // 2 minutes per finding
    const complexityTime = Math.max(0, (metrics.complexity - 10) * 3); // Extra time for complexity
    const sizeTime = Math.max(0, (metrics.linesOfCode - 500) / 100 * 5); // Time based on size
    
    return Math.round(baseTime + findingTime + complexityTime + sizeTime);
  }

  private getMetricValue(metrics: CodeMetrics, metricName: string): number {
    const metricMap: Record<string, number> = {
      'complexity': metrics.complexity,
      'maintainability': metrics.maintainabilityIndex,
      'testCoverage': metrics.testCoverage,
      'codeSmells': metrics.codeSmells,
      'duplicateLines': metrics.duplicateLines,
      'linesOfCode': metrics.linesOfCode,
      'securityHotspots': metrics.securityHotspots,
      'performanceIssues': metrics.performanceIssues,
      'technicalDebt': metrics.technicalDebt
    };

    return metricMap[metricName] || 0;
  }

  private generateFixForFinding(finding: ReviewFindings): string {
    switch (finding.ruleId) {
      case 'security.xss.direct-eval':
        return 'Replace eval() with JSON.parse() or safer alternative';
      case 'style.strict-mode':
        return '"use strict";\n\n' + '// Original content here';
      default:
        return 'Automated fix would be applied here based on the specific issue';
    }
  }

  private generateId(): string {
    return 'review_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private initializeMockData(): void {
    // Sample quality gate
    const securityGate: QualityGate = {
      id: 'gate_security_1',
      organizationId: 'org_sample',
      name: 'Security Quality Gate',
      description: 'Ensures code meets minimum security standards',
      conditions: [
        {
          metric: 'securityHotspots',
          operator: 'less_than',
          threshold: 5,
          description: 'Must have fewer than 5 security hotspots'
        },
        {
          metric: 'testCoverage',
          operator: 'greater_than',
          threshold: 80,
          description: 'Must have more than 80% test coverage'
        }
      ],
      enforcement: 'blocking',
      applicableProjects: [],
      isActive: true,
      createdBy: 'admin',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date()
    };

    const performanceGate: QualityGate = {
      id: 'gate_performance_1',
      organizationId: 'org_sample',
      name: 'Performance Quality Gate',
      description: 'Ensures code meets performance standards',
      conditions: [
        {
          metric: 'complexity',
          operator: 'less_than',
          threshold: 15,
          description: 'Cyclomatic complexity must be less than 15'
        },
        {
          metric: 'performanceIssues',
          operator: 'less_than',
          threshold: 3,
          description: 'Must have fewer than 3 performance issues'
        }
      ],
      enforcement: 'warning',
      applicableProjects: [],
      isActive: true,
      createdBy: 'admin',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date()
    };

    this.qualityGates.set(securityGate.id, securityGate);
    this.qualityGates.set(performanceGate.id, performanceGate);

    // Sample review template
    const standardTemplate: ReviewTemplate = {
      id: 'template_standard_1',
      name: 'Standard Code Review',
      description: 'Default review template for all projects',
      organizationId: 'org_sample',
      checklist: [
        {
          id: 'check_1',
          category: 'Functionality',
          title: 'Code meets requirements',
          description: 'Verify that the code implements the specified requirements',
          required: true,
          automatable: false,
          weight: 10
        },
        {
          id: 'check_2',
          category: 'Security',
          title: 'Security best practices',
          description: 'Code follows security best practices and has no vulnerabilities',
          required: true,
          automatable: true,
          weight: 9
        },
        {
          id: 'check_3',
          category: 'Performance',
          title: 'Performance optimization',
          description: 'Code is optimized for performance',
          required: false,
          automatable: true,
          weight: 7
        }
      ],
      qualityGates: [securityGate.id, performanceGate.id],
      aiPrompts: [
        {
          category: 'security',
          prompt: 'Analyze this code for security vulnerabilities, focusing on input validation, authentication, and potential injection attacks.',
          focusAreas: ['input-validation', 'authentication', 'injection'],
          severity: 'error'
        },
        {
          category: 'performance',
          prompt: 'Review this code for performance bottlenecks, inefficient algorithms, and optimization opportunities.',
          focusAreas: ['algorithms', 'memory-usage', 'cpu-intensive'],
          severity: 'warning'
        }
      ],
      autoAssign: true,
      reviewers: ['reviewer_1', 'reviewer_2'],
      createdAt: new Date('2024-01-01')
    };

    this.templates.set(standardTemplate.id, standardTemplate);
  }
}