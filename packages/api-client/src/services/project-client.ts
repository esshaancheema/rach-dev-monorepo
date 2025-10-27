import { BaseApiClient } from '../base-client';
import { 
  ApiClientConfig, 
  Project, 
  PaginatedResponse,
  PaginationParams 
} from '../types';

export interface CreateProjectRequest {
  name: string;
  description?: string;
  type: 'web' | 'mobile' | 'api' | 'desktop' | 'ai';
  framework?: string;
  language?: string;
  repository?: {
    provider: 'github' | 'gitlab' | 'bitbucket';
    url: string;
    branch: string;
  };
  settings?: Record<string, any>;
}

export interface ProjectFile {
  id: string;
  path: string;
  content: string;
  language: string;
  size: number;
  createdAt: string;
  updatedAt: string;
}

export interface CodeGeneration {
  id: string;
  projectId: string;
  prompt: string;
  generatedCode: string;
  language: string;
  model: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface Deployment {
  id: string;
  projectId: string;
  environment: 'development' | 'staging' | 'production';
  status: 'pending' | 'building' | 'deploying' | 'success' | 'failed';
  url?: string;
  buildLogs: string[];
  deployedAt?: string;
  createdAt: string;
}

export class ProjectClient extends BaseApiClient {
  constructor(config: ApiClientConfig = {}) {
    super({
      baseURL: process.env.NEXT_PUBLIC_PROJECT_SERVICE_URL || 'http://localhost:4002',
      ...config,
    });
  }

  // Project management
  async getProjects(params: PaginationParams & { 
    search?: string; 
    type?: string; 
    status?: string 
  } = {}) {
    return this.get<PaginatedResponse<Project>>('/projects', params);
  }

  async getProject(projectId: string) {
    return this.get<Project>(`/projects/${projectId}`);
  }

  async createProject(data: CreateProjectRequest) {
    return this.post<Project>('/projects', data);
  }

  async updateProject(projectId: string, data: Partial<CreateProjectRequest>) {
    return this.put<Project>(`/projects/${projectId}`, data);
  }

  async deleteProject(projectId: string) {
    return this.delete(`/projects/${projectId}`);
  }

  async archiveProject(projectId: string) {
    return this.post(`/projects/${projectId}/archive`);
  }

  async unarchiveProject(projectId: string) {
    return this.post(`/projects/${projectId}/unarchive`);
  }

  async cloneProject(projectId: string, name: string) {
    return this.post<Project>(`/projects/${projectId}/clone`, { name });
  }

  // File management
  async getProjectFiles(projectId: string, path: string = '') {
    return this.get<ProjectFile[]>(`/projects/${projectId}/files`, { path });
  }

  async getFile(projectId: string, fileId: string) {
    return this.get<ProjectFile>(`/projects/${projectId}/files/${fileId}`);
  }

  async createFile(projectId: string, data: {
    path: string;
    content: string;
    language?: string;
  }) {
    return this.post<ProjectFile>(`/projects/${projectId}/files`, data);
  }

  async updateFile(projectId: string, fileId: string, data: {
    content: string;
  }) {
    return this.put<ProjectFile>(`/projects/${projectId}/files/${fileId}`, data);
  }

  async deleteFile(projectId: string, fileId: string) {
    return this.delete(`/projects/${projectId}/files/${fileId}`);
  }

  async moveFile(projectId: string, fileId: string, newPath: string) {
    return this.post<ProjectFile>(`/projects/${projectId}/files/${fileId}/move`, { 
      newPath 
    });
  }

  // Code generation
  async generateCode(projectId: string, data: {
    prompt: string;
    language?: string;
    model?: string;
    context?: string;
  }) {
    return this.post<CodeGeneration>(`/projects/${projectId}/generate`, data);
  }

  async getCodeGenerations(projectId: string, params: PaginationParams = {}) {
    return this.get<PaginatedResponse<CodeGeneration>>(`/projects/${projectId}/generations`, params);
  }

  async getCodeGeneration(projectId: string, generationId: string) {
    return this.get<CodeGeneration>(`/projects/${projectId}/generations/${generationId}`);
  }

  async applyGeneration(projectId: string, generationId: string, filePath: string) {
    return this.post<ProjectFile>(`/projects/${projectId}/generations/${generationId}/apply`, {
      filePath
    });
  }

  // Repository integration
  async connectRepository(projectId: string, data: {
    provider: 'github' | 'gitlab' | 'bitbucket';
    url: string;
    branch: string;
    accessToken?: string;
  }) {
    return this.post(`/projects/${projectId}/repository/connect`, data);
  }

  async syncRepository(projectId: string) {
    return this.post(`/projects/${projectId}/repository/sync`);
  }

  async disconnectRepository(projectId: string) {
    return this.delete(`/projects/${projectId}/repository`);
  }

  async getRepositoryStatus(projectId: string) {
    return this.get<{
      connected: boolean;
      provider?: string;
      url?: string;
      branch?: string;
      lastSync?: string;
    }>(`/projects/${projectId}/repository/status`);
  }

  // Deployments
  async getDeployments(projectId: string, params: PaginationParams = {}) {
    return this.get<PaginatedResponse<Deployment>>(`/projects/${projectId}/deployments`, params);
  }

  async getDeployment(projectId: string, deploymentId: string) {
    return this.get<Deployment>(`/projects/${projectId}/deployments/${deploymentId}`);
  }

  async createDeployment(projectId: string, data: {
    environment: 'development' | 'staging' | 'production';
    branch?: string;
    buildCommand?: string;
    envVars?: Record<string, string>;
  }) {
    return this.post<Deployment>(`/projects/${projectId}/deployments`, data);
  }

  async cancelDeployment(projectId: string, deploymentId: string) {
    return this.post(`/projects/${projectId}/deployments/${deploymentId}/cancel`);
  }

  async getDeploymentLogs(projectId: string, deploymentId: string) {
    return this.get<{ logs: string[] }>(`/projects/${projectId}/deployments/${deploymentId}/logs`);
  }

  // Project analytics
  async getProjectAnalytics(projectId: string, dateRange: {
    startDate: string;
    endDate: string;
  }) {
    return this.get<{
      codeGenerations: number;
      deployments: number;
      fileChanges: number;
      buildTime: number;
      successRate: number;
    }>(`/projects/${projectId}/analytics`, dateRange);
  }

  // Templates
  async getTemplates(params: PaginationParams & { 
    type?: string; 
    language?: string 
  } = {}) {
    return this.get<PaginatedResponse<{
      id: string;
      name: string;
      description: string;
      type: string;
      language: string;
      tags: string[];
      files: Array<{
        path: string;
        content: string;
      }>;
    }>>('/templates', params);
  }

  async createProjectFromTemplate(templateId: string, data: {
    name: string;
    description?: string;
  }) {
    return this.post<Project>(`/templates/${templateId}/create-project`, data);
  }
}