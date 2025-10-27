'use client';

import { ProjectFile, EnhancedGenerationResult } from '@/lib/ai/enhanced-code-generator';

export interface DeploymentProvider {
  id: string;
  name: string;
  description: string;
  logo: string;
  supportedFrameworks: string[];
  features: string[];
  pricing: {
    free: boolean;
    paidPlans: string[];
  };
  difficulty: 'easy' | 'moderate' | 'advanced';
  buildTime: string;
  limits: {
    sites?: number;
    bandwidth?: string;
    buildMinutes?: string;
  };
}

export interface DeploymentConfig {
  providerId: string;
  projectName: string;
  framework: string;
  buildCommand: string;
  outputDirectory: string;
  environmentVariables: Record<string, string>;
  customDomain?: string;
  gitIntegration?: {
    repository: string;
    branch: string;
    autoRedeploy: boolean;
  };
  redirects?: Array<{
    from: string;
    to: string;
    status: number;
  }>;
  headers?: Record<string, string>;
}

export interface DeploymentStatus {
  id: string;
  status: 'pending' | 'building' | 'deployed' | 'failed';
  progress: number;
  url?: string;
  logs: DeploymentLog[];
  startTime: Date;
  endTime?: Date;
  error?: string;
  buildId?: string;
}

export interface DeploymentLog {
  timestamp: Date;
  level: 'info' | 'warn' | 'error';
  message: string;
  details?: any;
}

export interface DeploymentResult {
  success: boolean;
  deploymentId: string;
  url?: string;
  previewUrl?: string;
  error?: string;
  logs: DeploymentLog[];
  metrics?: {
    buildTime: number;
    deployTime: number;
    size: string;
  };
}

export const DEPLOYMENT_PROVIDERS: DeploymentProvider[] = [
  {
    id: 'vercel',
    name: 'Vercel',
    description: 'Deploy to Vercel with automatic HTTPS, global CDN, and serverless functions',
    logo: '/images/providers/vercel.svg',
    supportedFrameworks: ['react', 'vue', 'vanilla'],
    features: [
      'Automatic HTTPS',
      'Global CDN',
      'Serverless Functions',
      'Preview Deployments',
      'Custom Domains',
      'Analytics'
    ],
    pricing: {
      free: true,
      paidPlans: ['Pro: $20/month', 'Enterprise: Custom']
    },
    difficulty: 'easy',
    buildTime: '1-3 minutes',
    limits: {
      sites: 3,
      bandwidth: '100GB',
      buildMinutes: '6000/month'
    }
  },
  {
    id: 'netlify',
    name: 'Netlify',
    description: 'Deploy to Netlify with form handling, identity, and edge functions',
    logo: '/images/providers/netlify.svg',
    supportedFrameworks: ['react', 'vue', 'vanilla'],
    features: [
      'Form Handling',
      'Identity & Auth',
      'Edge Functions',
      'Split Testing',
      'Large Media',
      'Deploy Previews'
    ],
    pricing: {
      free: true,
      paidPlans: ['Pro: $19/month', 'Business: $99/month']
    },
    difficulty: 'easy',
    buildTime: '2-5 minutes',
    limits: {
      sites: 3,
      bandwidth: '100GB',
      buildMinutes: '300/month'
    }
  },
  {
    id: 'github-pages',
    name: 'GitHub Pages',
    description: 'Deploy static sites directly from your GitHub repository',
    logo: '/images/providers/github.svg',
    supportedFrameworks: ['vanilla', 'react', 'vue'],
    features: [
      'Free Hosting',
      'Custom Domains',
      'HTTPS',
      'Jekyll Support',
      'GitHub Integration',
      'Version Control'
    ],
    pricing: {
      free: true,
      paidPlans: []
    },
    difficulty: 'moderate',
    buildTime: '3-8 minutes',
    limits: {
      bandwidth: '100GB',
      sites: 1
    }
  },
  {
    id: 'heroku',
    name: 'Heroku',
    description: 'Deploy full-stack applications with database support',
    logo: '/images/providers/heroku.svg',
    supportedFrameworks: ['react', 'vue', 'vanilla'],
    features: [
      'Database Support',
      'Add-ons Ecosystem',
      'Auto Scaling',
      'CI/CD Pipeline',
      'Metrics & Monitoring',
      'Multi-language Support'
    ],
    pricing: {
      free: false,
      paidPlans: ['Basic: $7/month', 'Standard: $25/month', 'Performance: $250/month']
    },
    difficulty: 'moderate',
    buildTime: '5-10 minutes',
    limits: {
      sites: 100
    }
  },
  {
    id: 'aws-amplify',
    name: 'AWS Amplify',
    description: 'Deploy to AWS with backend services and global content delivery',
    logo: '/images/providers/aws.svg',
    supportedFrameworks: ['react', 'vue', 'vanilla'],
    features: [
      'Backend Services',
      'Authentication',
      'API Gateway',
      'Database',
      'Storage',
      'Global CDN'
    ],
    pricing: {
      free: true,
      paidPlans: ['Pay as you go']
    },
    difficulty: 'advanced',
    buildTime: '3-7 minutes',
    limits: {
      bandwidth: '15GB',
      buildMinutes: '1000/month'
    }
  },
  {
    id: 'firebase',
    name: 'Firebase Hosting',
    description: 'Deploy to Google Firebase with real-time database and authentication',
    logo: '/images/providers/firebase.svg',
    supportedFrameworks: ['react', 'vue', 'vanilla'],
    features: [
      'Real-time Database',
      'Authentication',
      'Cloud Functions',
      'Analytics',
      'Crashlytics',
      'Performance Monitoring'
    ],
    pricing: {
      free: true,
      paidPlans: ['Blaze: Pay as you go']
    },
    difficulty: 'moderate',
    buildTime: '2-5 minutes',
    limits: {
      bandwidth: '10GB',
      storage: '1GB'
    }
  }
];

export class DeploymentManager {
  private deploymentStatus: Map<string, DeploymentStatus> = new Map();
  
  async deployProject(
    project: EnhancedGenerationResult,
    config: DeploymentConfig,
    onProgress?: (status: DeploymentStatus) => void
  ): Promise<DeploymentResult> {
    const deploymentId = this.generateDeploymentId();
    
    // Initialize deployment status
    const status: DeploymentStatus = {
      id: deploymentId,
      status: 'pending',
      progress: 0,
      logs: [],
      startTime: new Date()
    };
    
    this.deploymentStatus.set(deploymentId, status);
    this.addLog(deploymentId, 'info', 'Starting deployment process...');
    
    try {
      // Phase 1: Prepare files
      status.status = 'building';
      status.progress = 10;
      onProgress?.(status);
      this.addLog(deploymentId, 'info', `Preparing ${project.files.length} files for deployment`);
      
      const preparedFiles = await this.prepareFiles(project, config);
      status.progress = 30;
      onProgress?.(status);
      
      // Phase 2: Build project
      this.addLog(deploymentId, 'info', `Building ${config.framework} project...`);
      const buildResult = await this.buildProject(preparedFiles, config);
      status.progress = 60;
      onProgress?.(status);
      
      if (!buildResult.success) {
        throw new Error(buildResult.error || 'Build failed');
      }
      
      // Phase 3: Deploy to provider
      this.addLog(deploymentId, 'info', `Deploying to ${config.providerId}...`);
      const deployResult = await this.deployToProvider(buildResult.files!, config);
      status.progress = 90;
      onProgress?.(status);
      
      // Phase 4: Finalize
      status.status = 'deployed';
      status.progress = 100;
      status.url = deployResult.url;
      status.endTime = new Date();
      onProgress?.(status);
      
      this.addLog(deploymentId, 'info', `Deployment completed successfully! URL: ${deployResult.url}`);
      
      return {
        success: true,
        deploymentId,
        url: deployResult.url,
        previewUrl: deployResult.previewUrl,
        logs: status.logs,
        metrics: {
          buildTime: buildResult.buildTime || 0,
          deployTime: Date.now() - status.startTime.getTime(),
          size: this.calculateTotalSize(preparedFiles)
        }
      };
      
    } catch (error) {
      status.status = 'failed';
      status.error = error instanceof Error ? error.message : 'Unknown error';
      status.endTime = new Date();
      onProgress?.(status);
      
      this.addLog(deploymentId, 'error', `Deployment failed: ${status.error}`);
      
      return {
        success: false,
        deploymentId,
        error: status.error,
        logs: status.logs
      };
    }
  }
  
  async getDeploymentStatus(deploymentId: string): Promise<DeploymentStatus | null> {
    return this.deploymentStatus.get(deploymentId) || null;
  }
  
  async cancelDeployment(deploymentId: string): Promise<boolean> {
    const status = this.deploymentStatus.get(deploymentId);
    if (!status || status.status === 'deployed' || status.status === 'failed') {
      return false;
    }
    
    status.status = 'failed';
    status.error = 'Deployment cancelled by user';
    status.endTime = new Date();
    this.addLog(deploymentId, 'warn', 'Deployment cancelled by user');
    
    return true;
  }
  
  private async prepareFiles(
    project: EnhancedGenerationResult, 
    config: DeploymentConfig
  ): Promise<ProjectFile[]> {
    const files = [...project.files];
    
    // Add deployment-specific configuration files
    switch (config.providerId) {
      case 'vercel':
        files.push(this.createVercelConfig(project, config));
        break;
      case 'netlify':
        files.push(this.createNetlifyConfig(project, config));
        break;
      case 'heroku':
        files.push(this.createProcfile(config));
        break;
    }
    
    // Add package.json if not exists
    if (!files.some(f => f.path === 'package.json')) {
      files.push(this.createPackageJson(project, config));
    }
    
    // Add build scripts
    files.push(this.createBuildScript(config));
    
    // Process environment variables
    if (Object.keys(config.environmentVariables).length > 0) {
      files.push(this.createEnvFile(config.environmentVariables));
    }
    
    return files;
  }
  
  private async buildProject(
    files: ProjectFile[],
    config: DeploymentConfig
  ): Promise<{ success: boolean; files?: ProjectFile[]; error?: string; buildTime?: number }> {
    const startTime = Date.now();
    
    try {
      // Simulate build process
      await this.simulateBuild(config);
      
      // Create build output
      const builtFiles = this.createBuildOutput(files, config);
      
      return {
        success: true,
        files: builtFiles,
        buildTime: Date.now() - startTime
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Build failed'
      };
    }
  }
  
  private async deployToProvider(
    files: ProjectFile[],
    config: DeploymentConfig
  ): Promise<{ url: string; previewUrl?: string }> {
    // Simulate deployment to various providers
    const baseUrl = this.generateDeploymentUrl(config);
    
    switch (config.providerId) {
      case 'vercel':
        return this.deployToVercel(files, config, baseUrl);
      case 'netlify':
        return this.deployToNetlify(files, config, baseUrl);
      case 'github-pages':
        return this.deployToGitHubPages(files, config, baseUrl);
      case 'heroku':
        return this.deployToHeroku(files, config, baseUrl);
      case 'aws-amplify':
        return this.deployToAWSAmplify(files, config, baseUrl);
      case 'firebase':
        return this.deployToFirebase(files, config, baseUrl);
      default:
        throw new Error(`Unsupported deployment provider: ${config.providerId}`);
    }
  }
  
  private async deployToVercel(files: ProjectFile[], config: DeploymentConfig, baseUrl: string) {
    // Simulate Vercel deployment
    await this.delay(2000);
    return {
      url: `https://${config.projectName}.vercel.app`,
      previewUrl: `https://${config.projectName}-git-main.vercel.app`
    };
  }
  
  private async deployToNetlify(files: ProjectFile[], config: DeploymentConfig, baseUrl: string) {
    // Simulate Netlify deployment
    await this.delay(3000);
    return {
      url: `https://${config.projectName}.netlify.app`,
      previewUrl: `https://deploy-preview-1--${config.projectName}.netlify.app`
    };
  }
  
  private async deployToGitHubPages(files: ProjectFile[], config: DeploymentConfig, baseUrl: string) {
    // Simulate GitHub Pages deployment
    await this.delay(5000);
    return {
      url: `https://username.github.io/${config.projectName}`
    };
  }
  
  private async deployToHeroku(files: ProjectFile[], config: DeploymentConfig, baseUrl: string) {
    // Simulate Heroku deployment
    await this.delay(8000);
    return {
      url: `https://${config.projectName}.herokuapp.com`
    };
  }
  
  private async deployToAWSAmplify(files: ProjectFile[], config: DeploymentConfig, baseUrl: string) {
    // Simulate AWS Amplify deployment
    await this.delay(4000);
    return {
      url: `https://main.${this.generateId()}.amplifyapp.com`
    };
  }
  
  private async deployToFirebase(files: ProjectFile[], config: DeploymentConfig, baseUrl: string) {
    // Simulate Firebase deployment
    await this.delay(3000);
    return {
      url: `https://${config.projectName}.web.app`
    };
  }
  
  private createVercelConfig(project: EnhancedGenerationResult, config: DeploymentConfig): ProjectFile {
    const vercelConfig = {
      version: 2,
      name: config.projectName,
      builds: [
        {
          src: "package.json",
          use: "@vercel/static-build",
          config: {
            distDir: config.outputDirectory
          }
        }
      ],
      routes: [
        {
          src: "/(.*)",
          dest: "/index.html"
        }
      ],
      env: config.environmentVariables,
      redirects: config.redirects || []
    };
    
    return {
      path: 'vercel.json',
      content: JSON.stringify(vercelConfig, null, 2),
      type: 'config',
      description: 'Vercel deployment configuration'
    };
  }
  
  private createNetlifyConfig(project: EnhancedGenerationResult, config: DeploymentConfig): ProjectFile {
    const netlifyConfig = {
      build: {
        command: config.buildCommand,
        publish: config.outputDirectory
      },
      redirects: [
        {
          from: "/*",
          to: "/index.html",
          status: 200
        },
        ...(config.redirects || [])
      ],
      headers: [
        {
          for: "/*",
          values: {
            "X-Frame-Options": "DENY",
            "X-XSS-Protection": "1; mode=block",
            "X-Content-Type-Options": "nosniff",
            ...config.headers
          }
        }
      ]
    };
    
    return {
      path: 'netlify.toml',
      content: this.toToml(netlifyConfig),
      type: 'config',
      description: 'Netlify deployment configuration'
    };
  }
  
  private createProcfile(config: DeploymentConfig): ProjectFile {
    return {
      path: 'Procfile',
      content: `web: ${config.buildCommand}`,
      type: 'config',
      description: 'Heroku process file'
    };
  }
  
  private createPackageJson(project: EnhancedGenerationResult, config: DeploymentConfig): ProjectFile {
    const packageJson = {
      name: config.projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      version: '1.0.0',
      private: true,
      scripts: {
        build: config.buildCommand,
        start: 'serve -s build',
        dev: 'vite'
      },
      dependencies: project.dependencies?.production || {},
      devDependencies: {
        ...project.dependencies?.development || {},
        serve: '^14.0.0'
      }
    };
    
    return {
      path: 'package.json',
      content: JSON.stringify(packageJson, null, 2),
      type: 'config',
      description: 'NPM package configuration'
    };
  }
  
  private createBuildScript(config: DeploymentConfig): ProjectFile {
    const script = `#!/bin/bash
echo "Starting build process..."
echo "Framework: ${config.framework}"
echo "Build command: ${config.buildCommand}"
echo "Output directory: ${config.outputDirectory}"

# Install dependencies
npm install

# Run build command
${config.buildCommand}

echo "Build completed successfully!"
`;
    
    return {
      path: 'build.sh',
      content: script,
      type: 'config',
      description: 'Build script'
    };
  }
  
  private createEnvFile(envVars: Record<string, string>): ProjectFile {
    const content = Object.entries(envVars)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    return {
      path: '.env',
      content,
      type: 'config',
      description: 'Environment variables'
    };
  }
  
  private createBuildOutput(files: ProjectFile[], config: DeploymentConfig): ProjectFile[] {
    // Simulate build output
    const builtFiles = files.map(file => ({
      ...file,
      path: file.path.startsWith('src/') ? 
        file.path.replace('src/', `${config.outputDirectory}/`) : 
        file.path
    }));
    
    // Add built HTML file
    builtFiles.push({
      path: `${config.outputDirectory}/index.html`,
      content: this.generateIndexHtml(files, config),
      type: 'page' as const,
      description: 'Built HTML entry point'
    });
    
    return builtFiles;
  }
  
  private generateIndexHtml(files: ProjectFile[], config: DeploymentConfig): string {
    const cssFiles = files.filter(f => f.path.endsWith('.css'));
    const jsFiles = files.filter(f => f.path.endsWith('.js') || f.path.endsWith('.jsx'));
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.projectName}</title>
  ${cssFiles.map(f => `<style>${f.content}</style>`).join('\n')}
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
  <div id="root"></div>
  <script type="module">
    ${jsFiles.map(f => f.content).join('\n')}
  </script>
</body>
</html>`;
  }
  
  private async simulateBuild(config: DeploymentConfig): Promise<void> {
    // Simulate build time based on framework
    const buildTime = config.framework === 'react' ? 3000 :
                     config.framework === 'vue' ? 2500 :
                     config.framework === 'vanilla' ? 1500 : 2000;
    
    await this.delay(buildTime);
  }
  
  private generateDeploymentUrl(config: DeploymentConfig): string {
    const subdomain = config.projectName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const provider = DEPLOYMENT_PROVIDERS.find(p => p.id === config.providerId);
    
    switch (config.providerId) {
      case 'vercel':
        return `https://${subdomain}.vercel.app`;
      case 'netlify':
        return `https://${subdomain}.netlify.app`;
      case 'github-pages':
        return `https://username.github.io/${subdomain}`;
      case 'heroku':
        return `https://${subdomain}.herokuapp.com`;
      default:
        return `https://${subdomain}.example.com`;
    }
  }
  
  private addLog(deploymentId: string, level: DeploymentLog['level'], message: string, details?: any) {
    const status = this.deploymentStatus.get(deploymentId);
    if (status) {
      status.logs.push({
        timestamp: new Date(),
        level,
        message,
        details
      });
    }
  }
  
  private calculateTotalSize(files: ProjectFile[]): string {
    const totalBytes = files.reduce((size, file) => size + file.content.length, 0);
    const totalKB = totalBytes / 1024;
    
    if (totalKB < 1024) {
      return `${Math.round(totalKB)}KB`;
    } else {
      return `${Math.round(totalKB / 1024 * 10) / 10}MB`;
    }
  }
  
  private generateDeploymentId(): string {
    return 'deploy_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
  
  private generateId(): string {
    return Math.random().toString(36).substring(2);
  }
  
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  private toToml(obj: any): string {
    // Simple TOML serialization for Netlify config
    let result = '';
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && !Array.isArray(value)) {
        result += `\n[${key}]\n`;
        for (const [subKey, subValue] of Object.entries(value)) {
          if (typeof subValue === 'string') {
            result += `${subKey} = "${subValue}"\n`;
          } else {
            result += `${subKey} = ${JSON.stringify(subValue)}\n`;
          }
        }
      } else if (Array.isArray(value)) {
        result += `\n[[${key}]]\n`;
        value.forEach(item => {
          if (typeof item === 'object') {
            for (const [itemKey, itemValue] of Object.entries(item)) {
              if (typeof itemValue === 'string') {
                result += `${itemKey} = "${itemValue}"\n`;
              } else {
                result += `${itemKey} = ${itemValue}\n`;
              }
            }
          }
        });
      }
    }
    
    return result;
  }
}