'use client';

export interface Pipeline {
  id: string;
  name: string;
  description: string;
  organizationId: string;
  projectId: string;
  status: 'active' | 'paused' | 'disabled' | 'draft';
  triggers: PipelineTrigger[];
  stages: PipelineStage[];
  variables: PipelineVariable[];
  notifications: NotificationConfig[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  lastRun?: Date;
  successRate: number;
  averageDuration: number; // minutes
}

export interface PipelineTrigger {
  id: string;
  type: 'push' | 'pull_request' | 'schedule' | 'manual' | 'webhook' | 'ai_generation';
  conditions: TriggerCondition[];
  enabled: boolean;
}

export interface TriggerCondition {
  field: 'branch' | 'file_pattern' | 'commit_message' | 'author' | 'time' | 'quality_gate';
  operator: 'equals' | 'contains' | 'matches' | 'greater_than' | 'less_than';
  value: string | number;
}

export interface PipelineStage {
  id: string;
  name: string;
  type: 'build' | 'test' | 'security' | 'quality' | 'deploy' | 'ai_review' | 'approval';
  dependsOn: string[];
  jobs: PipelineJob[];
  allowFailure: boolean;
  timeout: number; // minutes
  condition?: StageCondition;
}

export interface StageCondition {
  when: 'always' | 'on_success' | 'on_failure' | 'manual';
  variables?: Record<string, string>;
}

export interface PipelineJob {
  id: string;
  name: string;
  image?: string; // Docker image
  script: string[];
  artifacts?: ArtifactConfig;
  environment?: Record<string, string>;
  services?: ServiceConfig[];
  beforeScript?: string[];
  afterScript?: string[];
  retry?: { max: number; when: string[] };
  parallel?: number;
}

export interface ArtifactConfig {
  paths: string[];
  expire?: string; // e.g., "1 week", "30 days"
  when: 'always' | 'on_success' | 'on_failure';
  reports?: {
    junit?: string[];
    coverage?: string[];
    performance?: string[];
  };
}

export interface ServiceConfig {
  name: string;
  image: string;
  environment?: Record<string, string>;
}

export interface PipelineVariable {
  key: string;
  value: string;
  masked: boolean;
  protected: boolean;
  description?: string;
  scope: 'pipeline' | 'stage' | 'job';
}

export interface NotificationConfig {
  id: string;
  type: 'email' | 'slack' | 'webhook' | 'sms';
  recipients: string[];
  events: ('start' | 'success' | 'failure' | 'canceled')[];
  conditions?: {
    branches?: string[];
    stages?: string[];
  };
  template?: string;
}

export interface PipelineRun {
  id: string;
  pipelineId: string;
  pipelineName: string;
  runNumber: number;
  status: 'pending' | 'running' | 'success' | 'failed' | 'canceled' | 'skipped';
  trigger: {
    type: string;
    user?: string;
    commit?: string;
    branch?: string;
    message?: string;
  };
  stages: StageRun[];
  variables: Record<string, string>;
  startedAt: Date;
  finishedAt?: Date;
  duration?: number; // seconds
  artifacts: Artifact[];
  logs: PipelineLog[];
}

export interface StageRun {
  id: string;
  stageId: string;
  stageName: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'canceled' | 'skipped';
  jobs: JobRun[];
  startedAt?: Date;
  finishedAt?: Date;
  duration?: number; // seconds
  allowFailure: boolean;
}

export interface JobRun {
  id: string;
  jobId: string;
  jobName: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'canceled' | 'skipped';
  startedAt?: Date;
  finishedAt?: Date;
  duration?: number; // seconds
  exitCode?: number;
  artifacts: Artifact[];
  logs: string[];
}

export interface Artifact {
  id: string;
  name: string;
  path: string;
  size: number;
  type: 'file' | 'directory' | 'archive';
  downloadUrl?: string;
  expiresAt?: Date;
  metadata: Record<string, any>;
}

export interface PipelineLog {
  id: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: Date;
  stage?: string;
  job?: string;
  source: 'system' | 'job' | 'service';
}

export interface PipelineTemplate {
  id: string;
  name: string;
  description: string;
  category: 'web' | 'mobile' | 'api' | 'ai' | 'data' | 'infrastructure';
  language?: string;
  framework?: string;
  stages: PipelineStage[];
  variables: PipelineVariable[];
  popularity: number;
  isOfficial: boolean;
  createdBy: string;
  organizationId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeploymentEnvironment {
  id: string;
  name: string;
  type: 'development' | 'staging' | 'production' | 'testing';
  organizationId: string;
  url?: string;
  configuration: Record<string, string>;
  approvers?: string[];
  autoDeployBranches?: string[];
  protectionRules: EnvironmentProtection[];
  lastDeployment?: {
    id: string;
    status: string;
    deployedAt: Date;
    deployedBy: string;
    version: string;
  };
}

export interface EnvironmentProtection {
  type: 'required_reviewers' | 'wait_timer' | 'branch_policy' | 'quality_gate';
  configuration: Record<string, any>;
  enabled: boolean;
}

export interface PipelineMetrics {
  organizationId: string;
  period: { startDate: Date; endDate: Date };
  totalRuns: number;
  successRate: number;
  averageDuration: number;
  deploymentFrequency: number;
  leadTimeForChanges: number; // hours
  meanTimeToRecovery: number; // hours
  changeFailureRate: number;
  stageMetrics: {
    stageName: string;
    successRate: number;
    averageDuration: number;
    failureReasons: string[];
  }[];
  topFailingJobs: {
    jobName: string;
    failureCount: number;
    failureRate: number;
  }[];
  resourceUsage: {
    totalComputeHours: number;
    costEstimate: number;
    peakConcurrency: number;
  };
}

export class PipelineService {
  private pipelines: Map<string, Pipeline> = new Map();
  private pipelineRuns: Map<string, PipelineRun> = new Map();
  private templates: Map<string, PipelineTemplate> = new Map();
  private environments: Map<string, DeploymentEnvironment> = new Map();
  private runCounter: number = 1;

  constructor() {
    this.initializeMockData();
  }

  // Pipeline Management
  async createPipeline(pipeline: Omit<Pipeline, 'id' | 'createdAt' | 'updatedAt' | 'successRate' | 'averageDuration'>): Promise<Pipeline> {
    const newPipeline: Pipeline = {
      id: this.generateId(),
      ...pipeline,
      createdAt: new Date(),
      updatedAt: new Date(),
      successRate: 0,
      averageDuration: 0
    };

    this.pipelines.set(newPipeline.id, newPipeline);
    return newPipeline;
  }

  async getPipeline(pipelineId: string): Promise<Pipeline | null> {
    return this.pipelines.get(pipelineId) || null;
  }

  async getPipelinesByOrganization(organizationId: string): Promise<Pipeline[]> {
    return Array.from(this.pipelines.values())
      .filter(p => p.organizationId === organizationId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async getPipelinesByProject(projectId: string): Promise<Pipeline[]> {
    return Array.from(this.pipelines.values())
      .filter(p => p.projectId === projectId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async updatePipeline(pipelineId: string, updates: Partial<Pipeline>): Promise<Pipeline> {
    const existing = this.pipelines.get(pipelineId);
    if (!existing) throw new Error('Pipeline not found');

    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.pipelines.set(pipelineId, updated);
    return updated;
  }

  async deletePipeline(pipelineId: string): Promise<void> {
    this.pipelines.delete(pipelineId);
  }

  // Pipeline Execution
  async triggerPipeline(
    pipelineId: string, 
    trigger: { type: string; user?: string; variables?: Record<string, string> }
  ): Promise<PipelineRun> {
    const pipeline = this.pipelines.get(pipelineId);
    if (!pipeline) throw new Error('Pipeline not found');

    const run: PipelineRun = {
      id: this.generateId(),
      pipelineId: pipeline.id,
      pipelineName: pipeline.name,
      runNumber: this.runCounter++,
      status: 'pending',
      trigger: {
        type: trigger.type,
        user: trigger.user,
        commit: 'abc123def456',
        branch: 'main',
        message: 'Triggered pipeline run'
      },
      stages: pipeline.stages.map(stage => ({
        id: this.generateId(),
        stageId: stage.id,
        stageName: stage.name,
        status: 'pending',
        jobs: stage.jobs.map(job => ({
          id: this.generateId(),
          jobId: job.id,
          jobName: job.name,
          status: 'pending',
          artifacts: [],
          logs: []
        })),
        allowFailure: stage.allowFailure
      })),
      variables: { ...pipeline.variables.reduce((acc, v) => ({ ...acc, [v.key]: v.value }), {}), ...trigger.variables },
      startedAt: new Date(),
      artifacts: [],
      logs: []
    };

    this.pipelineRuns.set(run.id, run);

    // Simulate pipeline execution
    this.executePipeline(run.id);

    return run;
  }

  async getPipelineRun(runId: string): Promise<PipelineRun | null> {
    return this.pipelineRuns.get(runId) || null;
  }

  async getPipelineRuns(pipelineId: string, limit: number = 50): Promise<PipelineRun[]> {
    return Array.from(this.pipelineRuns.values())
      .filter(r => r.pipelineId === pipelineId)
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())
      .slice(0, limit);
  }

  async getRecentRuns(organizationId: string, limit: number = 20): Promise<PipelineRun[]> {
    const orgPipelines = await this.getPipelinesByOrganization(organizationId);
    const pipelineIds = new Set(orgPipelines.map(p => p.id));

    return Array.from(this.pipelineRuns.values())
      .filter(r => pipelineIds.has(r.pipelineId))
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())
      .slice(0, limit);
  }

  async cancelPipelineRun(runId: string): Promise<void> {
    const run = this.pipelineRuns.get(runId);
    if (run && (run.status === 'pending' || run.status === 'running')) {
      run.status = 'canceled';
      run.finishedAt = new Date();
      run.duration = Math.floor((run.finishedAt.getTime() - run.startedAt.getTime()) / 1000);
      this.pipelineRuns.set(runId, run);
    }
  }

  // Templates
  async getPipelineTemplates(category?: string): Promise<PipelineTemplate[]> {
    const templates = Array.from(this.templates.values());
    return category ? templates.filter(t => t.category === category) : templates;
  }

  async createPipelineFromTemplate(
    templateId: string, 
    pipelineData: { name: string; description: string; organizationId: string; projectId: string }
  ): Promise<Pipeline> {
    const template = this.templates.get(templateId);
    if (!template) throw new Error('Template not found');

    return this.createPipeline({
      name: pipelineData.name,
      description: pipelineData.description,
      organizationId: pipelineData.organizationId,
      projectId: pipelineData.projectId,
      status: 'draft',
      triggers: [
        {
          id: this.generateId(),
          type: 'push',
          conditions: [{ field: 'branch', operator: 'equals', value: 'main' }],
          enabled: true
        }
      ],
      stages: template.stages,
      variables: template.variables,
      notifications: [],
      createdBy: 'system'
    });
  }

  // Environments
  async getEnvironments(organizationId: string): Promise<DeploymentEnvironment[]> {
    return Array.from(this.environments.values())
      .filter(e => e.organizationId === organizationId)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async createEnvironment(env: Omit<DeploymentEnvironment, 'id'>): Promise<DeploymentEnvironment> {
    const environment: DeploymentEnvironment = {
      id: this.generateId(),
      ...env
    };

    this.environments.set(environment.id, environment);
    return environment;
  }

  // AI Integration
  async generatePipeline(
    projectInfo: { 
      language: string; 
      framework: string; 
      type: 'web' | 'api' | 'mobile' | 'ai'; 
      requirements: string[] 
    },
    organizationId: string,
    projectId: string
  ): Promise<Pipeline> {
    const aiGeneratedStages: PipelineStage[] = [];

    // Build stage
    aiGeneratedStages.push({
      id: this.generateId(),
      name: 'Build',
      type: 'build',
      dependsOn: [],
      allowFailure: false,
      timeout: 30,
      jobs: [{
        id: this.generateId(),
        name: 'Build Application',
        script: this.generateBuildScript(projectInfo),
        artifacts: {
          paths: ['dist/', 'build/'],
          when: 'on_success',
          expire: '1 week'
        }
      }]
    });

    // Test stage
    aiGeneratedStages.push({
      id: this.generateId(),
      name: 'Test',
      type: 'test',
      dependsOn: [aiGeneratedStages[0].id],
      allowFailure: false,
      timeout: 20,
      jobs: [
        {
          id: this.generateId(),
          name: 'Unit Tests',
          script: this.generateTestScript(projectInfo),
          artifacts: {
            paths: ['coverage/'],
            when: 'always',
            reports: {
              junit: ['coverage/junit.xml'],
              coverage: ['coverage/coverage.xml']
            }
          }
        },
        {
          id: this.generateId(),
          name: 'Integration Tests',
          script: this.generateIntegrationTestScript(projectInfo)
        }
      ]
    });

    // AI Code Review stage
    if (projectInfo.requirements.includes('ai-review')) {
      aiGeneratedStages.push({
        id: this.generateId(),
        name: 'AI Code Review',
        type: 'ai_review',
        dependsOn: [aiGeneratedStages[1].id],
        allowFailure: true,
        timeout: 10,
        jobs: [{
          id: this.generateId(),
          name: 'AI Quality Analysis',
          script: [
            'echo "Running AI-powered code review..."',
            'ai-review --project-path . --output coverage/ai-review.json',
            'echo "AI review completed"'
          ],
          artifacts: {
            paths: ['coverage/ai-review.json'],
            when: 'always'
          }
        }]
      });
    }

    // Security scan
    aiGeneratedStages.push({
      id: this.generateId(),
      name: 'Security',
      type: 'security',
      dependsOn: [aiGeneratedStages[aiGeneratedStages.length - 1].id],
      allowFailure: true,
      timeout: 15,
      jobs: [{
        id: this.generateId(),
        name: 'Security Scan',
        script: this.generateSecurityScript(projectInfo),
        artifacts: {
          paths: ['security-report.json'],
          when: 'always'
        }
      }]
    });

    // Deploy stage
    if (projectInfo.requirements.includes('auto-deploy')) {
      aiGeneratedStages.push({
        id: this.generateId(),
        name: 'Deploy',
        type: 'deploy',
        dependsOn: [aiGeneratedStages[aiGeneratedStages.length - 1].id],
        allowFailure: false,
        timeout: 15,
        condition: { when: 'on_success' },
        jobs: [{
          id: this.generateId(),
          name: 'Deploy to Staging',
          script: this.generateDeployScript(projectInfo, 'staging'),
          environment: {
            'DEPLOYMENT_ENV': 'staging',
            'APP_URL': 'https://staging.example.com'
          }
        }]
      });
    }

    return this.createPipeline({
      name: `AI Generated Pipeline - ${projectInfo.framework}`,
      description: `Auto-generated CI/CD pipeline for ${projectInfo.type} project using ${projectInfo.framework}`,
      organizationId,
      projectId,
      status: 'active',
      triggers: [
        {
          id: this.generateId(),
          type: 'ai_generation',
          conditions: [{ field: 'branch', operator: 'equals', value: 'main' }],
          enabled: true
        }
      ],
      stages: aiGeneratedStages,
      variables: [
        { key: 'NODE_VERSION', value: '18', masked: false, protected: false, scope: 'pipeline' },
        { key: 'BUILD_ENVIRONMENT', value: 'production', masked: false, protected: false, scope: 'pipeline' },
        { key: 'DEPLOY_KEY', value: 'encrypted_key', masked: true, protected: true, scope: 'pipeline' }
      ],
      notifications: [
        {
          id: this.generateId(),
          type: 'email',
          recipients: ['team@example.com'],
          events: ['failure'],
          conditions: { branches: ['main'] }
        }
      ],
      createdBy: 'ai-system'
    });
  }

  // Analytics
  async getPipelineMetrics(organizationId: string, period?: { startDate: Date; endDate: Date }): Promise<PipelineMetrics> {
    const pipelines = await this.getPipelinesByOrganization(organizationId);
    const allRuns = Array.from(this.pipelineRuns.values())
      .filter(run => pipelines.some(p => p.id === run.pipelineId));

    const filteredRuns = period 
      ? allRuns.filter(run => run.startedAt >= period.startDate && run.startedAt <= period.endDate)
      : allRuns;

    const completedRuns = filteredRuns.filter(run => run.finishedAt);
    const successfulRuns = completedRuns.filter(run => run.status === 'success');

    // Calculate metrics
    const totalRuns = filteredRuns.length;
    const successRate = totalRuns > 0 ? (successfulRuns.length / totalRuns) * 100 : 0;
    const averageDuration = completedRuns.length > 0 
      ? completedRuns.reduce((sum, run) => sum + (run.duration || 0), 0) / completedRuns.length / 60 // minutes
      : 0;

    // DORA metrics simulation
    const deploymentFrequency = successfulRuns.filter(run => 
      run.stages.some(stage => stage.stageName.toLowerCase().includes('deploy'))
    ).length / 30; // per day (assuming 30-day period)

    const leadTimeForChanges = 4.5; // hours (simulated)
    const meanTimeToRecovery = 2.1; // hours (simulated)
    const changeFailureRate = totalRuns > 0 ? ((totalRuns - successfulRuns.length) / totalRuns) * 100 : 0;

    return {
      organizationId,
      period: period || { startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), endDate: new Date() },
      totalRuns,
      successRate,
      averageDuration,
      deploymentFrequency,
      leadTimeForChanges,
      meanTimeToRecovery,
      changeFailureRate,
      stageMetrics: this.calculateStageMetrics(filteredRuns),
      topFailingJobs: this.getTopFailingJobs(filteredRuns),
      resourceUsage: {
        totalComputeHours: Math.floor(Math.random() * 1000) + 500,
        costEstimate: Math.floor(Math.random() * 5000) + 2000,
        peakConcurrency: Math.floor(Math.random() * 20) + 5
      }
    };
  }

  // Private helper methods
  private async executePipeline(runId: string): Promise<void> {
    const run = this.pipelineRuns.get(runId);
    if (!run) return;

    // Simulate pipeline execution
    run.status = 'running';
    this.pipelineRuns.set(runId, run);

    // Execute stages sequentially
    for (const stage of run.stages) {
      if (run.status === 'canceled') break;

      stage.status = 'running';
      stage.startedAt = new Date();

      // Execute jobs in parallel
      const jobPromises = stage.jobs.map(async (job) => {
        job.status = 'running';
        job.startedAt = new Date();

        // Simulate job execution time
        const executionTime = Math.random() * 30000 + 5000; // 5-35 seconds
        await new Promise(resolve => setTimeout(resolve, executionTime));

        // Simulate success/failure
        const successRate = 0.85; // 85% success rate
        job.status = Math.random() < successRate ? 'success' : 'failed';
        job.finishedAt = new Date();
        job.duration = Math.floor((job.finishedAt.getTime() - job.startedAt!.getTime()) / 1000);
        job.exitCode = job.status === 'success' ? 0 : 1;

        // Generate some logs
        job.logs = [
          `[${new Date().toISOString()}] Starting job: ${job.jobName}`,
          `[${new Date().toISOString()}] Executing commands...`,
          job.status === 'success' 
            ? `[${new Date().toISOString()}] Job completed successfully`
            : `[${new Date().toISOString()}] Job failed with exit code 1`
        ];
      });

      await Promise.all(jobPromises);

      // Determine stage status
      const failedJobs = stage.jobs.filter(job => job.status === 'failed');
      if (failedJobs.length > 0 && !stage.allowFailure) {
        stage.status = 'failed';
        run.status = 'failed';
      } else if (failedJobs.length > 0) {
        stage.status = 'success'; // Allow failure
      } else {
        stage.status = 'success';
      }

      stage.finishedAt = new Date();
      stage.duration = Math.floor((stage.finishedAt.getTime() - stage.startedAt.getTime()) / 1000);

      if (run.status === 'failed') break;
    }

    // Finalize run
    if (run.status !== 'canceled' && run.status !== 'failed') {
      run.status = 'success';
    }
    run.finishedAt = new Date();
    run.duration = Math.floor((run.finishedAt.getTime() - run.startedAt.getTime()) / 1000);

    this.pipelineRuns.set(runId, run);

    // Update pipeline metrics
    const pipeline = this.pipelines.get(run.pipelineId);
    if (pipeline) {
      const pipelineRuns = Array.from(this.pipelineRuns.values())
        .filter(r => r.pipelineId === pipeline.id && r.finishedAt);
      
      const successfulRuns = pipelineRuns.filter(r => r.status === 'success');
      pipeline.successRate = pipelineRuns.length > 0 ? (successfulRuns.length / pipelineRuns.length) * 100 : 0;
      pipeline.averageDuration = pipelineRuns.length > 0 
        ? pipelineRuns.reduce((sum, r) => sum + (r.duration || 0), 0) / pipelineRuns.length / 60
        : 0;
      pipeline.lastRun = run.finishedAt;
      
      this.pipelines.set(pipeline.id, pipeline);
    }
  }

  private generateBuildScript(projectInfo: { language: string; framework: string }): string[] {
    const scripts: Record<string, string[]> = {
      'javascript-react': [
        'npm ci',
        'npm run build',
        'ls -la dist/'
      ],
      'typescript-react': [
        'npm ci',
        'npm run type-check',
        'npm run build',
        'ls -la dist/'
      ],
      'python-flask': [
        'pip install -r requirements.txt',
        'python -m build',
        'ls -la dist/'
      ],
      'java-spring': [
        './mvnw clean compile',
        './mvnw package',
        'ls -la target/'
      ]
    };

    const key = `${projectInfo.language}-${projectInfo.framework}`;
    return scripts[key] || scripts['javascript-react'];
  }

  private generateTestScript(projectInfo: { language: string; framework: string }): string[] {
    const scripts: Record<string, string[]> = {
      'javascript-react': [
        'npm run test:coverage',
        'npm run lint'
      ],
      'typescript-react': [
        'npm run test:coverage',
        'npm run lint',
        'npm run type-check'
      ],
      'python-flask': [
        'python -m pytest --cov=src --cov-report=xml',
        'flake8 src/'
      ],
      'java-spring': [
        './mvnw test',
        './mvnw checkstyle:check'
      ]
    };

    const key = `${projectInfo.language}-${projectInfo.framework}`;
    return scripts[key] || scripts['javascript-react'];
  }

  private generateIntegrationTestScript(projectInfo: { language: string; framework: string }): string[] {
    return [
      'echo "Starting integration tests..."',
      'npm run test:integration',
      'echo "Integration tests completed"'
    ];
  }

  private generateSecurityScript(projectInfo: { language: string; framework: string }): string[] {
    const scripts: Record<string, string[]> = {
      'javascript-react': [
        'npm audit --audit-level=moderate',
        'npx snyk test',
        'echo "Security scan completed"'
      ],
      'python-flask': [
        'pip-audit',
        'bandit -r src/',
        'echo "Security scan completed"'
      ]
    };

    const key = `${projectInfo.language}-${projectInfo.framework}`;
    return scripts[key] || scripts['javascript-react'];
  }

  private generateDeployScript(projectInfo: { language: string; framework: string }, environment: string): string[] {
    return [
      `echo "Deploying to ${environment}..."`,
      'docker build -t myapp:latest .',
      `docker tag myapp:latest myapp:${environment}`,
      `kubectl apply -f k8s/${environment}/`,
      `echo "Deployment to ${environment} completed"`
    ];
  }

  private calculateStageMetrics(runs: PipelineRun[]) {
    const stageStats: Record<string, { successes: number; total: number; durations: number[] }> = {};

    runs.forEach(run => {
      run.stages.forEach(stage => {
        if (!stageStats[stage.stageName]) {
          stageStats[stage.stageName] = { successes: 0, total: 0, durations: [] };
        }
        stageStats[stage.stageName].total++;
        if (stage.status === 'success') {
          stageStats[stage.stageName].successes++;
        }
        if (stage.duration) {
          stageStats[stage.stageName].durations.push(stage.duration);
        }
      });
    });

    return Object.entries(stageStats).map(([stageName, stats]) => ({
      stageName,
      successRate: (stats.successes / stats.total) * 100,
      averageDuration: stats.durations.reduce((sum, d) => sum + d, 0) / stats.durations.length || 0,
      failureReasons: ['Timeout', 'Build failure', 'Test failure', 'Network error']
    }));
  }

  private getTopFailingJobs(runs: PipelineRun[]) {
    const jobStats: Record<string, { failures: number; total: number }> = {};

    runs.forEach(run => {
      run.stages.forEach(stage => {
        stage.jobs.forEach(job => {
          if (!jobStats[job.jobName]) {
            jobStats[job.jobName] = { failures: 0, total: 0 };
          }
          jobStats[job.jobName].total++;
          if (job.status === 'failed') {
            jobStats[job.jobName].failures++;
          }
        });
      });
    });

    return Object.entries(jobStats)
      .map(([jobName, stats]) => ({
        jobName,
        failureCount: stats.failures,
        failureRate: (stats.failures / stats.total) * 100
      }))
      .sort((a, b) => b.failureCount - a.failureCount)
      .slice(0, 10);
  }

  private generateId(): string {
    return 'pipeline_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private initializeMockData(): void {
    // Sample pipeline templates
    const reactTemplate: PipelineTemplate = {
      id: 'template_react_1',
      name: 'React Application',
      description: 'Complete CI/CD pipeline for React applications',
      category: 'web',
      language: 'javascript',
      framework: 'react',
      popularity: 95,
      isOfficial: true,
      createdBy: 'system',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date(),
      stages: [
        {
          id: 'stage_build',
          name: 'Build',
          type: 'build',
          dependsOn: [],
          allowFailure: false,
          timeout: 30,
          jobs: [{
            id: 'job_build',
            name: 'Build Application',
            script: ['npm ci', 'npm run build', 'ls -la dist/'],
            artifacts: { paths: ['dist/'], when: 'on_success', expire: '1 week' }
          }]
        },
        {
          id: 'stage_test',
          name: 'Test',
          type: 'test',
          dependsOn: ['stage_build'],
          allowFailure: false,
          timeout: 20,
          jobs: [{
            id: 'job_test',
            name: 'Unit Tests',
            script: ['npm run test:coverage', 'npm run lint'],
            artifacts: {
              paths: ['coverage/'],
              when: 'always',
              reports: { junit: ['coverage/junit.xml'], coverage: ['coverage/coverage.xml'] }
            }
          }]
        }
      ],
      variables: [
        { key: 'NODE_VERSION', value: '18', masked: false, protected: false, scope: 'pipeline' },
        { key: 'BUILD_ENVIRONMENT', value: 'production', masked: false, protected: false, scope: 'pipeline' }
      ]
    };

    this.templates.set(reactTemplate.id, reactTemplate);

    // Sample environments
    const environments: DeploymentEnvironment[] = [
      {
        id: 'env_dev_1',
        name: 'Development',
        type: 'development',
        organizationId: 'org_sample',
        url: 'https://dev.example.com',
        configuration: { 'API_URL': 'https://api-dev.example.com' },
        autoDeployBranches: ['develop'],
        protectionRules: []
      },
      {
        id: 'env_staging_1',
        name: 'Staging',
        type: 'staging',
        organizationId: 'org_sample',
        url: 'https://staging.example.com',
        configuration: { 'API_URL': 'https://api-staging.example.com' },
        autoDeployBranches: ['main'],
        protectionRules: [
          { type: 'wait_timer', configuration: { minutes: 5 }, enabled: true }
        ]
      },
      {
        id: 'env_prod_1',
        name: 'Production',
        type: 'production',
        organizationId: 'org_sample',
        url: 'https://app.example.com',
        configuration: { 'API_URL': 'https://api.example.com' },
        approvers: ['admin@example.com'],
        protectionRules: [
          { type: 'required_reviewers', configuration: { count: 2 }, enabled: true },
          { type: 'quality_gate', configuration: { minScore: 80 }, enabled: true }
        ],
        lastDeployment: {
          id: 'deploy_1',
          status: 'success',
          deployedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          deployedBy: 'admin@example.com',
          version: 'v1.2.3'
        }
      }
    ];

    environments.forEach(env => this.environments.set(env.id, env));

    // Sample pipeline
    const samplePipeline: Pipeline = {
      id: 'pipeline_sample_1',
      name: 'Main Application Pipeline',
      description: 'Primary CI/CD pipeline for the main application',
      organizationId: 'org_sample',
      projectId: 'project_main_app',
      status: 'active',
      triggers: [
        {
          id: 'trigger_1',
          type: 'push',
          conditions: [{ field: 'branch', operator: 'equals', value: 'main' }],
          enabled: true
        },
        {
          id: 'trigger_2',
          type: 'pull_request',
          conditions: [{ field: 'branch', operator: 'equals', value: 'main' }],
          enabled: true
        }
      ],
      stages: reactTemplate.stages,
      variables: reactTemplate.variables,
      notifications: [
        {
          id: 'notif_1',
          type: 'email',
          recipients: ['team@example.com'],
          events: ['failure'],
          conditions: { branches: ['main'] }
        }
      ],
      createdBy: 'admin@example.com',
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date(),
      lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      successRate: 87.5,
      averageDuration: 12.3
    };

    this.pipelines.set(samplePipeline.id, samplePipeline);

    // Sample pipeline runs
    for (let i = 1; i <= 10; i++) {
      const run: PipelineRun = {
        id: `run_${i}`,
        pipelineId: samplePipeline.id,
        pipelineName: samplePipeline.name,
        runNumber: i,
        status: Math.random() > 0.2 ? 'success' : 'failed',
        trigger: {
          type: 'push',
          user: 'developer@example.com',
          commit: `abc${i}def${i}`,
          branch: 'main',
          message: `Fix issue #${i}`
        },
        stages: samplePipeline.stages.map(stage => ({
          id: `stagerun_${stage.id}_${i}`,
          stageId: stage.id,
          stageName: stage.name,
          status: Math.random() > 0.15 ? 'success' : 'failed',
          jobs: stage.jobs.map(job => ({
            id: `jobrun_${job.id}_${i}`,
            jobId: job.id,
            jobName: job.name,
            status: Math.random() > 0.1 ? 'success' : 'failed',
            startedAt: new Date(Date.now() - (11 - i) * 2 * 60 * 60 * 1000),
            finishedAt: new Date(Date.now() - (11 - i) * 2 * 60 * 60 * 1000 + Math.random() * 20 * 60 * 1000),
            duration: Math.floor(Math.random() * 600) + 30,
            exitCode: Math.random() > 0.1 ? 0 : 1,
            artifacts: [],
            logs: [`Job ${job.name} completed`]
          })),
          allowFailure: stage.allowFailure,
          startedAt: new Date(Date.now() - (11 - i) * 2 * 60 * 60 * 1000),
          finishedAt: new Date(Date.now() - (11 - i) * 2 * 60 * 60 * 1000 + Math.random() * 25 * 60 * 1000),
          duration: Math.floor(Math.random() * 900) + 120
        })),
        variables: { NODE_VERSION: '18', BUILD_ENVIRONMENT: 'production' },
        startedAt: new Date(Date.now() - (11 - i) * 2 * 60 * 60 * 1000),
        finishedAt: new Date(Date.now() - (11 - i) * 2 * 60 * 60 * 1000 + Math.random() * 30 * 60 * 1000),
        duration: Math.floor(Math.random() * 1200) + 300,
        artifacts: [],
        logs: []
      };

      this.pipelineRuns.set(run.id, run);
    }
  }
}