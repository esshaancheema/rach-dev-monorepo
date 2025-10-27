'use client';

import { ZoptalCodeGenerator } from './code-generator';

export interface ProjectFile {
  path: string;
  content: string;
  type: 'component' | 'page' | 'service' | 'utility' | 'config' | 'style' | 'test' | 'docs';
  description: string;
  dependencies?: string[];
  isEntryPoint?: boolean;
}

export interface EnhancedGenerationResult {
  id: string;
  title: string;
  description: string;
  framework: 'react' | 'vue' | 'vanilla';
  complexity: 'simple' | 'moderate' | 'advanced';
  files: ProjectFile[];
  projectStructure: ProjectStructure;
  dependencies: {
    production: Record<string, string>;
    development: Record<string, string>;
  };
  configuration: {
    packageJson: any;
    configFiles: Record<string, any>;
    buildSettings: any;
  };
  features: string[];
  bestPractices: string[];
  optimizations: string[];
  deploymentInstructions: DeploymentGuide[];
  learningResources: LearningResource[];
  estimatedComplexity: number; // 1-10 scale
  buildTime: number; // estimated minutes
  performance: {
    bundleSize: string;
    lighthouse: {
      performance: number;
      accessibility: number;
      bestPractices: number;
      seo: number;
    };
  };
}

export interface ProjectStructure {
  root: string;
  directories: {
    src: string[];
    public: string[];
    tests: string[];
    docs: string[];
    config: string[];
  };
  conventions: {
    naming: string;
    organization: string;
    imports: string;
  };
}

export interface DeploymentGuide {
  platform: 'vercel' | 'netlify' | 'github-pages' | 'heroku' | 'aws' | 'docker';
  difficulty: 'easy' | 'moderate' | 'advanced';
  steps: {
    title: string;
    description: string;
    commands?: string[];
    notes?: string;
  }[];
  environmentVariables?: Record<string, string>;
  buildCommand?: string;
  outputDirectory?: string;
}

export interface LearningResource {
  title: string;
  type: 'article' | 'video' | 'documentation' | 'course' | 'tutorial';
  url: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
}

export class EnhancedCodeGenerator extends ZoptalCodeGenerator {
  async generateAdvancedProject(
    prompt: string,
    options: {
      framework?: 'react' | 'vue' | 'vanilla' | 'auto';
      complexity?: 'simple' | 'moderate' | 'advanced';
      features?: string[];
      includeTests?: boolean;
      includeDocs?: boolean;
      optimizeForPerformance?: boolean;
      targetPlatform?: 'web' | 'mobile' | 'desktop';
      deploymentTarget?: string;
    } = {}
  ): Promise<EnhancedGenerationResult> {
    const startTime = Date.now();
    
    // Analyze prompt and determine project requirements
    const analysis = await this.analyzeProjectRequirements(prompt, options);
    
    // Generate project structure
    const projectStructure = this.createProjectStructure(analysis);
    
    // Generate individual files
    const files = await this.generateProjectFiles(analysis, projectStructure);
    
    // Create configuration files
    const configuration = this.generateConfiguration(analysis, files);
    
    // Generate deployment guides
    const deploymentInstructions = this.generateDeploymentGuides(analysis);
    
    // Generate learning resources
    const learningResources = this.generateLearningResources(analysis);
    
    // Analyze performance and best practices
    const performance = this.analyzePerformance(files, analysis);
    const bestPractices = this.identifyBestPractices(files, analysis);
    const optimizations = this.suggestOptimizations(files, analysis);
    
    const generationTime = Date.now() - startTime;
    
    return {
      id: this.generateId(),
      title: analysis.title,
      description: analysis.description,
      framework: analysis.framework,
      complexity: analysis.complexity,
      files,
      projectStructure,
      dependencies: configuration.dependencies,
      configuration,
      features: analysis.features,
      bestPractices,
      optimizations,
      deploymentInstructions,
      learningResources,
      estimatedComplexity: analysis.complexityScore,
      buildTime: this.estimateBuildTime(analysis, files),
      performance
    };
  }

  private async analyzeProjectRequirements(prompt: string, options: any) {
    // Enhanced prompt analysis with more sophisticated AI reasoning
    const analysis = {
      title: this.extractTitle(prompt),
      description: this.extractDescription(prompt),
      framework: options.framework || this.determineOptimalFramework(prompt),
      complexity: options.complexity || this.analyzeComplexity(prompt),
      features: options.features || this.extractFeatures(prompt),
      components: this.identifyComponents(prompt),
      services: this.identifyServices(prompt),
      utilities: this.identifyUtilities(prompt),
      styling: this.analyzeStylingRequirements(prompt),
      stateManagement: this.analyzeStateManagement(prompt),
      routing: this.analyzeRoutingNeeds(prompt),
      apiIntegration: this.analyzeApiNeeds(prompt),
      testing: options.includeTests || this.shouldIncludeTests(prompt),
      documentation: options.includeDocs || this.shouldIncludeDocs(prompt),
      complexityScore: this.calculateComplexityScore(prompt),
      targetAudience: this.identifyTargetAudience(prompt),
      businessLogic: this.extractBusinessLogic(prompt)
    };

    return analysis;
  }

  private createProjectStructure(analysis: any): ProjectStructure {
    const baseStructure = {
      react: {
        src: ['components', 'pages', 'hooks', 'services', 'utils', 'types', 'styles'],
        public: ['images', 'icons', 'fonts'],
        tests: ['__tests__', 'mocks'],
        docs: ['README.md', 'CONTRIBUTING.md'],
        config: ['next.config.js', 'tailwind.config.js', 'tsconfig.json']
      },
      vue: {
        src: ['components', 'views', 'composables', 'services', 'utils', 'types', 'assets'],
        public: ['images', 'icons', 'fonts'],
        tests: ['tests/unit', 'tests/e2e'],
        docs: ['README.md', 'GUIDE.md'],
        config: ['vite.config.js', 'tailwind.config.js', 'tsconfig.json']
      },
      vanilla: {
        src: ['js', 'css', 'assets'],
        public: ['images', 'icons', 'fonts'],
        tests: ['tests'],
        docs: ['README.md'],
        config: ['webpack.config.js', 'package.json']
      }
    };

    const structure = baseStructure[analysis.framework] || baseStructure.vanilla;

    return {
      root: analysis.title.toLowerCase().replace(/\s+/g, '-'),
      directories: structure,
      conventions: {
        naming: analysis.framework === 'react' ? 'PascalCase for components, camelCase for utilities' : 
                 analysis.framework === 'vue' ? 'PascalCase for components, kebab-case for files' : 
                 'camelCase for JS, kebab-case for CSS',
        organization: 'Feature-based with shared utilities',
        imports: 'Absolute imports with path mapping'
      }
    };
  }

  private async generateProjectFiles(analysis: any, structure: ProjectStructure): Promise<ProjectFile[]> {
    const files: ProjectFile[] = [];

    // Generate main entry point
    files.push(await this.generateEntryPoint(analysis));

    // Generate components
    for (const component of analysis.components) {
      files.push(await this.generateComponent(component, analysis));
    }

    // Generate pages/views
    if (analysis.routing) {
      files.push(...await this.generatePages(analysis));
    }

    // Generate services
    for (const service of analysis.services) {
      files.push(await this.generateService(service, analysis));
    }

    // Generate utilities
    for (const utility of analysis.utilities) {
      files.push(await this.generateUtility(utility, analysis));
    }

    // Generate styles
    files.push(...await this.generateStyles(analysis));

    // Generate configuration
    files.push(...this.generateConfigFiles(analysis));

    // Generate tests if requested
    if (analysis.testing) {
      files.push(...await this.generateTests(analysis, files));
    }

    // Generate documentation if requested
    if (analysis.documentation) {
      files.push(...this.generateDocumentation(analysis, files));
    }

    return files;
  }

  private async generateEntryPoint(analysis: any): Promise<ProjectFile> {
    let content = '';
    let path = '';

    switch (analysis.framework) {
      case 'react':
        path = 'src/App.tsx';
        content = this.generateReactApp(analysis);
        break;
      case 'vue':
        path = 'src/App.vue';
        content = this.generateVueApp(analysis);
        break;
      case 'vanilla':
        path = 'src/main.js';
        content = this.generateVanillaApp(analysis);
        break;
    }

    return {
      path,
      content,
      type: 'page',
      description: 'Main application entry point',
      isEntryPoint: true
    };
  }

  private async generateComponent(component: any, analysis: any): Promise<ProjectFile> {
    const componentName = this.toPascalCase(component.name);
    let content = '';
    let path = '';

    switch (analysis.framework) {
      case 'react':
        path = `src/components/${componentName}/${componentName}.tsx`;
        content = this.generateReactComponent(component, analysis);
        break;
      case 'vue':
        path = `src/components/${componentName}.vue`;
        content = this.generateVueComponent(component, analysis);
        break;
      case 'vanilla':
        path = `src/components/${component.name}.js`;
        content = this.generateVanillaComponent(component, analysis);
        break;
    }

    return {
      path,
      content,
      type: 'component',
      description: component.description || `${componentName} component`,
      dependencies: component.dependencies || []
    };
  }

  private generateReactApp(analysis: any): string {
    return `import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import { AppProvider } from './context/AppContext';
import { Toaster } from './components/ui/Toaster';
import './styles/globals.css';

// Pages
${analysis.routing ? analysis.components.filter(c => c.type === 'page').map(page => 
  `import ${this.toPascalCase(page.name)} from './pages/${this.toPascalCase(page.name)}';`
).join('\n') : ''}

// Components
${analysis.components.filter(c => c.type === 'component').map(comp => 
  `import ${this.toPascalCase(comp.name)} from './components/${this.toPascalCase(comp.name)}/${this.toPascalCase(comp.name)}';`
).join('\n')}

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <div className="min-h-screen bg-gray-50">
          ${analysis.routing ? `
          <Router>
            <Routes>
              ${analysis.components.filter(c => c.type === 'page').map(page => 
                `<Route path="${page.path || '/'}" element={<${this.toPascalCase(page.name)} />} />`
              ).join('\n              ')}
            </Routes>
          </Router>
          ` : `
          <main className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              ${analysis.title}
            </h1>
            ${analysis.components.filter(c => c.type === 'component').map(comp => 
              `<${this.toPascalCase(comp.name)} />`
            ).join('\n            ')}
          </main>
          `}
          <Toaster />
        </div>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;`;
  }

  private generateReactComponent(component: any, analysis: any): string {
    const componentName = this.toPascalCase(component.name);
    
    return `import React${component.hasState ? ', { useState, useEffect }' : ''} from 'react';
${component.hasProps ? `import { ${componentName}Props } from './types';` : ''}
import { cn } from '../../utils/cn';
${component.styling === 'styled-components' ? `import styled from 'styled-components';` : ''}

${component.hasProps ? `
interface ${componentName}Props {
  ${component.props.map(prop => `${prop.name}${prop.optional ? '?' : ''}: ${prop.type};`).join('\n  ')}
  className?: string;
}
` : ''}

${component.styling === 'styled-components' ? `
const ${componentName}Container = styled.div\`
  // Styled component styles
  ${component.styles || ''}
\`;
` : ''}

export default function ${componentName}(${component.hasProps ? `{
  ${component.props.map(prop => prop.name).join(',\n  ')},
  className
}: ${componentName}Props` : ''}) {
  ${component.hasState ? component.state.map(state => 
    `const [${state.name}, set${this.toPascalCase(state.name)}] = useState<${state.type}>(${state.initial});`
  ).join('\n  ') : ''}

  ${component.hasEffects ? component.effects.map(effect => `
  useEffect(() => {
    ${effect.code}
  }, [${effect.dependencies.join(', ')}]);`).join('\n') : ''}

  ${component.hasMethods ? component.methods.map(method => `
  const ${method.name} = ${method.async ? 'async ' : ''}(${method.params.join(', ')}) => {
    ${method.code}
  };`).join('\n') : ''}

  return (
    ${component.styling === 'styled-components' ? `<${componentName}Container` : '<div'} 
      className={cn(
        "${component.baseClasses || 'p-4 rounded-lg border border-gray-200'}",
        className
      )}
    >
      ${component.template || `
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        ${component.title || componentName}
      </h2>
      <p className="text-gray-600">
        ${component.description || `This is the ${componentName} component.`}
      </p>
      ${component.hasInteraction ? `
      <button 
        onClick={${component.clickHandler || 'handleClick'}}
        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
      >
        ${component.buttonText || 'Click Me'}
      </button>
      ` : ''}`}
    ${component.styling === 'styled-components' ? `</${componentName}Container>` : '</div>'}
  );
}`;
  }

  private generateVueApp(analysis: any): string {
    return `<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <ErrorBoundary>
      ${analysis.routing ? `
      <router-view />
      ` : `
      <main class="container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-8">
          ${analysis.title}
        </h1>
        ${analysis.components.filter(c => c.type === 'component').map(comp => 
          `<${this.toKebabCase(comp.name)} />`
        ).join('\n        ')}
      </main>
      `}
      <Toaster />
    </ErrorBoundary>
  </div>
</template>

<script setup lang="ts">
import { provide } from 'vue';
import ErrorBoundary from './components/ErrorBoundary.vue';
import Toaster from './components/ui/Toaster.vue';
${analysis.components.filter(c => c.type === 'component').map(comp => 
  `import ${this.toPascalCase(comp.name)} from './components/${this.toPascalCase(comp.name)}.vue';`
).join('\n')}

// Global app state
const appState = reactive({
  theme: 'light',
  user: null
});

provide('appState', appState);
</script>

<style>
@import './styles/globals.css';
</style>`;
  }

  private generateConfiguration(analysis: any, files: ProjectFile[]) {
    const packageJson = this.generatePackageJson(analysis, files);
    const configFiles = this.generateConfigFiles(analysis);
    const dependencies = this.analyzeDependencies(files, analysis);

    return {
      packageJson,
      configFiles,
      dependencies,
      buildSettings: this.generateBuildSettings(analysis)
    };
  }

  private generatePackageJson(analysis: any, files: ProjectFile[]) {
    const baseDeps = {
      react: {
        "react": "^18.2.0",
        "react-dom": "^18.2.0",
        "react-router-dom": "^6.8.0"
      },
      vue: {
        "vue": "^3.3.0",
        "vue-router": "^4.2.0",
        "@vueuse/core": "^10.0.0"
      },
      vanilla: {}
    };

    const baseDevDeps = {
      react: {
        "@types/react": "^18.2.0",
        "@types/react-dom": "^18.2.0",
        "@vitejs/plugin-react": "^4.0.0",
        "typescript": "^5.0.0",
        "vite": "^4.4.0"
      },
      vue: {
        "@vitejs/plugin-vue": "^4.0.0",
        "typescript": "^5.0.0",
        "vite": "^4.4.0",
        "vue-tsc": "^1.8.0"
      },
      vanilla: {
        "vite": "^4.4.0",
        "typescript": "^5.0.0"
      }
    };

    return {
      name: analysis.title.toLowerCase().replace(/\s+/g, '-'),
      version: "1.0.0",
      description: analysis.description,
      type: "module",
      scripts: {
        dev: "vite",
        build: "vite build",
        preview: "vite preview",
        "type-check": "tsc --noEmit",
        lint: "eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
        test: analysis.testing ? "vitest" : undefined
      },
      dependencies: {
        ...baseDeps[analysis.framework],
        ...(analysis.styling === 'tailwind' && { "tailwindcss": "^3.3.0" }),
        ...(analysis.stateManagement === 'zustand' && { "zustand": "^4.4.0" }),
        ...(analysis.apiIntegration && { "axios": "^1.4.0" })
      },
      devDependencies: {
        ...baseDevDeps[analysis.framework],
        ...(analysis.testing && { "vitest": "^0.34.0", "@testing-library/react": "^13.4.0" }),
        ...(analysis.styling === 'tailwind' && { "@tailwindcss/typography": "^0.5.9" })
      },
      keywords: analysis.features,
      author: "AI Generated",
      license: "MIT"
    };
  }

  private generateDeploymentGuides(analysis: any): DeploymentGuide[] {
    const guides: DeploymentGuide[] = [];

    // Vercel deployment
    guides.push({
      platform: 'vercel',
      difficulty: 'easy',
      steps: [
        {
          title: 'Install Vercel CLI',
          description: 'Install the Vercel CLI tool globally',
          commands: ['npm install -g vercel']
        },
        {
          title: 'Login to Vercel',
          description: 'Authenticate with your Vercel account',
          commands: ['vercel login']
        },
        {
          title: 'Deploy',
          description: 'Deploy your application to Vercel',
          commands: ['vercel --prod'],
          notes: 'Follow the prompts to configure your deployment'
        }
      ],
      buildCommand: 'npm run build',
      outputDirectory: 'dist'
    });

    // Netlify deployment
    guides.push({
      platform: 'netlify',
      difficulty: 'easy',
      steps: [
        {
          title: 'Build your project',
          description: 'Create a production build',
          commands: ['npm run build']
        },
        {
          title: 'Install Netlify CLI',
          description: 'Install the Netlify CLI tool',
          commands: ['npm install -g netlify-cli']
        },
        {
          title: 'Login to Netlify',
          description: 'Authenticate with your Netlify account',
          commands: ['netlify login']
        },
        {
          title: 'Deploy',
          description: 'Deploy your built application',
          commands: ['netlify deploy --prod --dir=dist']
        }
      ],
      buildCommand: 'npm run build',
      outputDirectory: 'dist'
    });

    return guides;
  }

  private generateLearningResources(analysis: any): LearningResource[] {
    const resources: LearningResource[] = [];

    // Framework-specific resources
    if (analysis.framework === 'react') {
      resources.push({
        title: 'React Official Documentation',
        type: 'documentation',
        url: 'https://react.dev',
        description: 'Official React documentation with latest features and best practices',
        difficulty: 'beginner',
        estimatedTime: '2-3 hours'
      });
    }

    // Feature-specific resources
    if (analysis.features.includes('authentication')) {
      resources.push({
        title: 'Authentication Best Practices',
        type: 'article',
        url: 'https://auth0.com/blog/authentication-best-practices',
        description: 'Security best practices for implementing authentication',
        difficulty: 'intermediate',
        estimatedTime: '45 minutes'
      });
    }

    return resources;
  }

  // Helper methods
  private toPascalCase(str: string): string {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toUpperCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
  }

  private toKebabCase(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }

  private generateId(): string {
    return 'proj_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  // Placeholder methods for more complex analysis
  private extractTitle(prompt: string): string {
    // AI logic to extract title
    return prompt.split(' ').slice(0, 4).join(' ');
  }

  private extractDescription(prompt: string): string {
    return prompt.length > 100 ? prompt.substring(0, 100) + '...' : prompt;
  }

  private identifyComponents(prompt: string): any[] {
    // AI logic to identify components
    return [
      {
        name: 'MainComponent',
        type: 'component',
        hasProps: false,
        hasState: true,
        description: 'Main component for the application'
      }
    ];
  }

  private identifyServices(prompt: string): any[] {
    return [];
  }

  private identifyUtilities(prompt: string): any[] {
    return [];
  }

  private analyzeStylingRequirements(prompt: string): string {
    return 'tailwind';
  }

  private analyzeStateManagement(prompt: string): string {
    return 'useState';
  }

  private analyzeRoutingNeeds(prompt: string): boolean {
    return false;
  }

  private analyzeApiNeeds(prompt: string): boolean {
    return false;
  }

  private shouldIncludeTests(prompt: string): boolean {
    return false;
  }

  private shouldIncludeDocs(prompt: string): boolean {
    return true;
  }

  private calculateComplexityScore(prompt: string): number {
    return 5;
  }

  private identifyTargetAudience(prompt: string): string {
    return 'general';
  }

  private extractBusinessLogic(prompt: string): any[] {
    return [];
  }

  private async generatePages(analysis: any): Promise<ProjectFile[]> {
    return [];
  }

  private async generateService(service: any, analysis: any): Promise<ProjectFile> {
    return {
      path: `src/services/${service.name}.ts`,
      content: `// ${service.name} service`,
      type: 'service',
      description: service.description
    };
  }

  private async generateUtility(utility: any, analysis: any): Promise<ProjectFile> {
    return {
      path: `src/utils/${utility.name}.ts`,
      content: `// ${utility.name} utility`,
      type: 'utility',
      description: utility.description
    };
  }

  private async generateStyles(analysis: any): Promise<ProjectFile[]> {
    return [
      {
        path: 'src/styles/globals.css',
        content: '@tailwind base;\n@tailwind components;\n@tailwind utilities;',
        type: 'style',
        description: 'Global styles'
      }
    ];
  }

  private generateConfigFiles(analysis: any): ProjectFile[] {
    return [];
  }

  private async generateTests(analysis: any, files: ProjectFile[]): Promise<ProjectFile[]> {
    return [];
  }

  private generateDocumentation(analysis: any, files: ProjectFile[]): ProjectFile[] {
    return [
      {
        path: 'README.md',
        content: `# ${analysis.title}\n\n${analysis.description}`,
        type: 'docs',
        description: 'Project documentation'
      }
    ];
  }

  private analyzeDependencies(files: ProjectFile[], analysis: any) {
    return {
      production: {},
      development: {}
    };
  }

  private generateBuildSettings(analysis: any) {
    return {};
  }

  private analyzePerformance(files: ProjectFile[], analysis: any) {
    return {
      bundleSize: '~150KB',
      lighthouse: {
        performance: 95,
        accessibility: 90,
        bestPractices: 100,
        seo: 85
      }
    };
  }

  private identifyBestPractices(files: ProjectFile[], analysis: any): string[] {
    return [
      'Component composition over inheritance',
      'Proper TypeScript usage',
      'Responsive design implementation',
      'Accessibility considerations'
    ];
  }

  private suggestOptimizations(files: ProjectFile[], analysis: any): string[] {
    return [
      'Implement code splitting for better performance',
      'Add lazy loading for images',
      'Use React.memo for expensive components',
      'Implement proper error boundaries'
    ];
  }

  private estimateBuildTime(analysis: any, files: ProjectFile[]): number {
    return Math.max(2, files.length * 0.5);
  }

  private generateVanillaApp(analysis: any): string {
    return `// Main application entry point
document.addEventListener('DOMContentLoaded', function() {
  console.log('${analysis.title} loaded');
});`;
  }

  private generateVueComponent(component: any, analysis: any): string {
    return `<template>
  <div class="component">
    <h2>{{ title }}</h2>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: '${component.name}'
});
</script>`;
  }

  private generateVanillaComponent(component: any, analysis: any): string {
    return `// ${component.name} component
export class ${this.toPascalCase(component.name)} {
  constructor(element) {
    this.element = element;
    this.init();
  }

  init() {
    // Component initialization
  }
}`;
  }
}