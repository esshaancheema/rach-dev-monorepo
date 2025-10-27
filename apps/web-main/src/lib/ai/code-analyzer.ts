'use client';

import { ProjectFile } from './enhanced-code-generator';

export interface CodeIssue {
  id: string;
  type: 'error' | 'warning' | 'info' | 'suggestion';
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'syntax' | 'performance' | 'security' | 'accessibility' | 'maintainability' | 'style';
  title: string;
  description: string;
  file: string;
  line?: number;
  column?: number;
  endLine?: number;
  endColumn?: number;
  code?: string;
  suggestion?: string;
  autoFixAvailable: boolean;
  documentation?: string;
  examples?: {
    before: string;
    after: string;
    explanation: string;
  };
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  threshold: number;
  status: 'good' | 'warning' | 'critical';
  description: string;
  suggestions: string[];
}

export interface SecurityVulnerability {
  id: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  file: string;
  line?: number;
  cwe?: string; // Common Weakness Enumeration
  owasp?: string; // OWASP Top 10
  fix: string;
  references: string[];
}

export interface CodeQualityMetrics {
  overallScore: number; // 0-100
  maintainabilityIndex: number;
  cyclomaticComplexity: number;
  linesOfCode: number;
  technicalDebt: {
    minutes: number;
    rating: 'A' | 'B' | 'C' | 'D' | 'E';
  };
  testCoverage?: number;
  duplication: number; // percentage
  metrics: {
    files: number;
    functions: number;
    classes: number;
    imports: number;
    exports: number;
  };
}

export interface OptimizationSuggestion {
  id: string;
  type: 'performance' | 'bundle-size' | 'memory' | 'rendering' | 'accessibility';
  impact: 'high' | 'medium' | 'low';
  effort: 'easy' | 'moderate' | 'complex';
  title: string;
  description: string;
  benefits: string[];
  implementation: {
    steps: string[];
    codeExample?: string;
    estimatedTime: string;
  };
  metrics: {
    performanceGain?: string;
    bundleReduction?: string;
    memoryReduction?: string;
  };
}

export interface AnalysisResult {
  timestamp: Date;
  framework: string;
  issues: CodeIssue[];
  performance: PerformanceMetric[];
  security: SecurityVulnerability[];
  quality: CodeQualityMetrics;
  optimizations: OptimizationSuggestion[];
  summary: {
    totalIssues: number;
    criticalIssues: number;
    securityVulnerabilities: number;
    performanceScore: number;
    recommendations: string[];
  };
  trends?: {
    issueCount: { timestamp: Date; count: number }[];
    qualityScore: { timestamp: Date; score: number }[];
    performanceScore: { timestamp: Date; score: number }[];
  };
}

export class CodeAnalyzer {
  private rulesets: Record<string, any> = {
    react: {
      performance: ['react-hooks-exhaustive-deps', 'react-memo-usage', 'component-size'],
      security: ['jsx-no-script-tag', 'jsx-no-dangerously-set-inner-html'],
      accessibility: ['jsx-a11y-rules'],
      style: ['react-naming-conventions', 'component-structure']
    },
    vue: {
      performance: ['vue-component-optimization', 'template-optimization'],
      security: ['vue-security-rules'],
      accessibility: ['vue-a11y-rules'],
      style: ['vue-style-guide']
    },
    vanilla: {
      performance: ['dom-manipulation', 'event-handlers'],
      security: ['xss-prevention', 'input-validation'],
      accessibility: ['semantic-html', 'aria-labels'],
      style: ['javascript-best-practices']
    }
  };

  async analyzeProject(files: ProjectFile[], framework: string): Promise<AnalysisResult> {
    const startTime = Date.now();
    
    // Run parallel analysis
    const [
      issues,
      performance,
      security,
      quality,
      optimizations
    ] = await Promise.all([
      this.analyzeIssues(files, framework),
      this.analyzePerformance(files, framework),
      this.analyzeSecurity(files, framework),
      this.analyzeQuality(files, framework),
      this.analyzeOptimizations(files, framework)
    ]);

    const analysisTime = Date.now() - startTime;

    const summary = {
      totalIssues: issues.length,
      criticalIssues: issues.filter(i => i.severity === 'critical').length,
      securityVulnerabilities: security.length,
      performanceScore: this.calculatePerformanceScore(performance),
      recommendations: this.generateRecommendations(issues, performance, security, optimizations)
    };

    return {
      timestamp: new Date(),
      framework,
      issues,
      performance,
      security,
      quality,
      optimizations,
      summary
    };
  }

  private async analyzeIssues(files: ProjectFile[], framework: string): Promise<CodeIssue[]> {
    const issues: CodeIssue[] = [];

    for (const file of files) {
      // Syntax analysis
      issues.push(...await this.analyzeSyntax(file, framework));
      
      // Performance analysis
      issues.push(...await this.analyzePerformanceIssues(file, framework));
      
      // Maintainability analysis
      issues.push(...await this.analyzeMaintainability(file, framework));
      
      // Style analysis
      issues.push(...await this.analyzeStyle(file, framework));
    }

    return issues.sort((a, b) => this.getSeverityWeight(b.severity) - this.getSeverityWeight(a.severity));
  }

  private async analyzeSyntax(file: ProjectFile, framework: string): Promise<CodeIssue[]> {
    const issues: CodeIssue[] = [];
    const lines = file.content.split('\n');

    // Common syntax issues
    lines.forEach((line, index) => {
      // Unused variables
      const unusedVarMatch = line.match(/const\s+(\w+)\s*=.*(?!\1)/);
      if (unusedVarMatch && !lines.some(l => l !== line && l.includes(unusedVarMatch[1]))) {
        issues.push({
          id: `unused-var-${file.path}-${index}`,
          type: 'warning',
          severity: 'medium',
          category: 'maintainability',
          title: 'Unused Variable',
          description: `Variable '${unusedVarMatch[1]}' is declared but never used`,
          file: file.path,
          line: index,
          autoFixAvailable: true,
          suggestion: 'Remove the unused variable declaration',
          examples: {
            before: line,
            after: '',
            explanation: 'Removing unused variables reduces bundle size and improves code clarity'
          }
        });
      }

      // Missing semicolons (for JavaScript files)
      if (file.path.endsWith('.js') && line.trim() && 
          !line.trim().endsWith(';') && 
          !line.trim().endsWith('{') && 
          !line.trim().endsWith('}') &&
          !line.trim().startsWith('//')) {
        issues.push({
          id: `missing-semicolon-${file.path}-${index}`,
          type: 'info',
          severity: 'low',
          category: 'style',
          title: 'Missing Semicolon',
          description: 'Statement should end with a semicolon',
          file: file.path,
          line: index,
          autoFixAvailable: true,
          suggestion: 'Add semicolon at the end of the statement'
        });
      }

      // Console.log statements
      if (line.includes('console.log')) {
        issues.push({
          id: `console-log-${file.path}-${index}`,
          type: 'info',
          severity: 'low',
          category: 'maintainability',
          title: 'Console Statement',
          description: 'Console.log statement found in production code',
          file: file.path,
          line: index,
          autoFixAvailable: true,
          suggestion: 'Remove console.log or replace with proper logging'
        });
      }
    });

    return issues;
  }

  private async analyzePerformanceIssues(file: ProjectFile, framework: string): Promise<CodeIssue[]> {
    const issues: CodeIssue[] = [];
    const content = file.content;

    if (framework === 'react') {
      // Missing React.memo for components
      if (content.includes('function ') && content.includes('export default') && !content.includes('React.memo')) {
        issues.push({
          id: `missing-memo-${file.path}`,
          type: 'suggestion',
          severity: 'medium',
          category: 'performance',
          title: 'Consider Using React.memo',
          description: 'Component could benefit from React.memo to prevent unnecessary re-renders',
          file: file.path,
          autoFixAvailable: true,
          suggestion: 'Wrap component with React.memo',
          examples: {
            before: 'export default function MyComponent(props) {',
            after: 'const MyComponent = React.memo(function MyComponent(props) {',
            explanation: 'React.memo prevents re-renders when props haven\'t changed'
          }
        });
      }

      // Missing useCallback for functions
      if (content.includes('const ') && content.includes('() =>') && content.includes('useState')) {
        issues.push({
          id: `missing-usecallback-${file.path}`,
          type: 'suggestion',
          severity: 'medium',
          category: 'performance',
          title: 'Consider Using useCallback',
          description: 'Function definitions inside component could benefit from useCallback',
          file: file.path,
          autoFixAvailable: false,
          suggestion: 'Wrap function with useCallback and specify dependencies'
        });
      }

      // Large component files
      const lines = content.split('\n').length;
      if (lines > 200) {
        issues.push({
          id: `large-component-${file.path}`,
          type: 'warning',
          severity: 'medium',
          category: 'maintainability',
          title: 'Large Component',
          description: `Component has ${lines} lines. Consider breaking it down into smaller components`,
          file: file.path,
          autoFixAvailable: false,
          suggestion: 'Extract logical sections into separate components'
        });
      }
    }

    // Large bundle impact
    if (content.includes('import ') && content.match(/import .* from ['"][^'"]*lodash['"]/)) {
      issues.push({
        id: `large-import-${file.path}`,
        type: 'warning',
        severity: 'medium',
        category: 'performance',
        title: 'Large Library Import',
        description: 'Importing entire lodash library impacts bundle size',
        file: file.path,
        autoFixAvailable: true,
        suggestion: 'Import only specific functions needed',
        examples: {
          before: "import _ from 'lodash'",
          after: "import { debounce, throttle } from 'lodash'",
          explanation: 'Tree-shaking allows bundlers to exclude unused code'
        }
      });
    }

    return issues;
  }

  private async analyzeMaintainability(file: ProjectFile, framework: string): Promise<CodeIssue[]> {
    const issues: CodeIssue[] = [];
    const content = file.content;
    const lines = content.split('\n');

    // Cyclomatic complexity
    const complexity = this.calculateCyclomaticComplexity(content);
    if (complexity > 10) {
      issues.push({
        id: `high-complexity-${file.path}`,
        type: 'warning',
        severity: 'high',
        category: 'maintainability',
        title: 'High Cyclomatic Complexity',
        description: `Function has complexity of ${complexity} (threshold: 10)`,
        file: file.path,
        autoFixAvailable: false,
        suggestion: 'Break down complex functions into smaller, focused functions'
      });
    }

    // Magic numbers
    lines.forEach((line, index) => {
      const magicNumberMatch = line.match(/(?<![a-zA-Z_])\b(\d{2,})\b(?![a-zA-Z_])/g);
      if (magicNumberMatch && !line.includes('//')) {
        magicNumberMatch.forEach(num => {
          if (parseInt(num) > 1 && parseInt(num) !== 100) { // Exclude common numbers
            issues.push({
              id: `magic-number-${file.path}-${index}-${num}`,
              type: 'info',
              severity: 'low',
              category: 'maintainability',
              title: 'Magic Number',
              description: `Consider extracting magic number ${num} into a named constant`,
              file: file.path,
              line: index,
              autoFixAvailable: false,
              suggestion: `Create a named constant: const MAX_ITEMS = ${num};`
            });
          }
        });
      }
    });

    // Long parameter lists
    const functionMatches = content.match(/function\s+\w+\s*\([^)]+\)|const\s+\w+\s*=\s*\([^)]+\)\s*=>/g);
    if (functionMatches) {
      functionMatches.forEach(match => {
        const params = match.match(/\([^)]+\)/)?.[0];
        if (params) {
          const paramCount = params.split(',').length;
          if (paramCount > 5) {
            issues.push({
              id: `long-params-${file.path}-${match}`,
              type: 'warning',
              severity: 'medium',
              category: 'maintainability',
              title: 'Too Many Parameters',
              description: `Function has ${paramCount} parameters. Consider using an options object`,
              file: file.path,
              autoFixAvailable: false,
              suggestion: 'Replace multiple parameters with a single options object'
            });
          }
        }
      });
    }

    return issues;
  }

  private async analyzeStyle(file: ProjectFile, framework: string): Promise<CodeIssue[]> {
    const issues: CodeIssue[] = [];
    const lines = file.content.split('\n');

    lines.forEach((line, index) => {
      // Long lines
      if (line.length > 100) {
        issues.push({
          id: `long-line-${file.path}-${index}`,
          type: 'info',
          severity: 'low',
          category: 'style',
          title: 'Long Line',
          description: `Line exceeds 100 characters (${line.length} chars)`,
          file: file.path,
          line: index,
          autoFixAvailable: false,
          suggestion: 'Break long lines into multiple lines for better readability'
        });
      }

      // Inconsistent indentation
      const indentMatch = line.match(/^(\s*)/);
      if (indentMatch && indentMatch[1].includes('\t') && indentMatch[1].includes(' ')) {
        issues.push({
          id: `mixed-indent-${file.path}-${index}`,
          type: 'warning',
          severity: 'low',
          category: 'style',
          title: 'Mixed Indentation',
          description: 'Line uses both tabs and spaces for indentation',
          file: file.path,
          line: index,
          autoFixAvailable: true,
          suggestion: 'Use consistent indentation (either tabs or spaces)'
        });
      }
    });

    return issues;
  }

  private async analyzePerformance(files: ProjectFile[], framework: string): Promise<PerformanceMetric[]> {
    const metrics: PerformanceMetric[] = [];

    // Bundle size estimation
    const totalSize = files.reduce((size, file) => size + file.content.length, 0);
    metrics.push({
      name: 'Estimated Bundle Size',
      value: Math.round(totalSize / 1024), // KB
      unit: 'KB',
      threshold: 250,
      status: totalSize < 250000 ? 'good' : totalSize < 500000 ? 'warning' : 'critical',
      description: 'Estimated production bundle size after minification',
      suggestions: totalSize > 250000 ? [
        'Implement code splitting',
        'Use dynamic imports for large components',
        'Remove unused dependencies',
        'Optimize images and assets'
      ] : []
    });

    // Component count
    const componentCount = files.filter(f => f.type === 'component').length;
    metrics.push({
      name: 'Component Count',
      value: componentCount,
      unit: 'components',
      threshold: 50,
      status: componentCount < 30 ? 'good' : componentCount < 50 ? 'warning' : 'critical',
      description: 'Total number of components in the project',
      suggestions: componentCount > 30 ? [
        'Consider component composition',
        'Merge similar components',
        'Create reusable component patterns'
      ] : []
    });

    // Dependency depth
    const maxDepth = this.calculateDependencyDepth(files);
    metrics.push({
      name: 'Dependency Depth',
      value: maxDepth,
      unit: 'levels',
      threshold: 5,
      status: maxDepth < 4 ? 'good' : maxDepth < 6 ? 'warning' : 'critical',
      description: 'Maximum depth of component/module dependencies',
      suggestions: maxDepth > 4 ? [
        'Flatten dependency structure',
        'Use dependency injection',
        'Refactor deeply nested components'
      ] : []
    });

    // Code complexity
    const avgComplexity = this.calculateAverageComplexity(files);
    metrics.push({
      name: 'Average Complexity',
      value: Math.round(avgComplexity * 10) / 10,
      unit: 'score',
      threshold: 10,
      status: avgComplexity < 5 ? 'good' : avgComplexity < 10 ? 'warning' : 'critical',
      description: 'Average cyclomatic complexity across all functions',
      suggestions: avgComplexity > 5 ? [
        'Break down complex functions',
        'Extract business logic',
        'Use early returns to reduce nesting'
      ] : []
    });

    return metrics;
  }

  private async analyzeSecurity(files: ProjectFile[], framework: string): Promise<SecurityVulnerability[]> {
    const vulnerabilities: SecurityVulnerability[] = [];

    for (const file of files) {
      const content = file.content;

      // XSS vulnerabilities
      if (content.includes('innerHTML') || content.includes('dangerouslySetInnerHTML')) {
        vulnerabilities.push({
          id: `xss-${file.path}`,
          type: 'Cross-Site Scripting (XSS)',
          severity: 'high',
          title: 'Potential XSS Vulnerability',
          description: 'Direct HTML injection detected',
          file: file.path,
          cwe: 'CWE-79',
          owasp: 'A03:2021 - Injection',
          fix: 'Sanitize user input or use safe alternatives like textContent',
          references: [
            'https://owasp.org/www-community/attacks/xss/',
            'https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html'
          ]
        });
      }

      // Hardcoded secrets
      const secretPatterns = [
        /api[_-]?key['"]?\s*[:=]\s*['"][^'"]+['"]/i,
        /secret['"]?\s*[:=]\s*['"][^'"]+['"]/i,
        /password['"]?\s*[:=]\s*['"][^'"]+['"]/i,
        /token['"]?\s*[:=]\s*['"][^'"]+['"]/i
      ];

      secretPatterns.forEach((pattern, index) => {
        if (pattern.test(content)) {
          vulnerabilities.push({
            id: `hardcoded-secret-${file.path}-${index}`,
            type: 'Hardcoded Secret',
            severity: 'critical',
            title: 'Hardcoded Secret Detected',
            description: 'Potentially sensitive information hardcoded in source code',
            file: file.path,
            cwe: 'CWE-798',
            owasp: 'A07:2021 - Identification and Authentication Failures',
            fix: 'Move secrets to environment variables or secure configuration',
            references: [
              'https://owasp.org/www-top-ten/2021/',
              'https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html'
            ]
          });
        }
      });

      // Insecure HTTP requests
      if (content.includes('http://') && !content.includes('localhost')) {
        vulnerabilities.push({
          id: `insecure-http-${file.path}`,
          type: 'Insecure Communication',
          severity: 'medium',
          title: 'Insecure HTTP Request',
          description: 'HTTP request detected, should use HTTPS',
          file: file.path,
          cwe: 'CWE-319',
          owasp: 'A02:2021 - Cryptographic Failures',
          fix: 'Replace HTTP URLs with HTTPS equivalents',
          references: [
            'https://owasp.org/www-top-ten/2021/',
            'https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Protection_Cheat_Sheet.html'
          ]
        });
      }
    }

    return vulnerabilities;
  }

  private async analyzeQuality(files: ProjectFile[], framework: string): Promise<CodeQualityMetrics> {
    const totalLines = files.reduce((total, file) => total + file.content.split('\n').length, 0);
    const totalFunctions = files.reduce((total, file) => {
      return total + (file.content.match(/function\s+\w+|const\s+\w+\s*=.*=>/g) || []).length;
    }, 0);

    const complexities = files.map(file => this.calculateCyclomaticComplexity(file.content));
    const avgComplexity = complexities.reduce((a, b) => a + b, 0) / complexities.length;

    // Calculate maintainability index (simplified)
    const maintainabilityIndex = Math.max(0, Math.min(100, 
      171 - 5.2 * Math.log(totalLines) - 0.23 * avgComplexity - 16.2 * Math.log(totalLines / totalFunctions || 1)
    ));

    // Technical debt calculation (simplified)
    const issuesCount = files.length * 2; // Estimated
    const debtMinutes = issuesCount * 5; // 5 minutes per issue average

    let debtRating: 'A' | 'B' | 'C' | 'D' | 'E' = 'A';
    if (debtMinutes > 480) debtRating = 'E';
    else if (debtMinutes > 240) debtRating = 'D';
    else if (debtMinutes > 120) debtRating = 'C';
    else if (debtMinutes > 60) debtRating = 'B';

    const overallScore = Math.round(
      maintainabilityIndex * 0.4 +
      (100 - Math.min(avgComplexity * 5, 100)) * 0.3 +
      (totalLines < 1000 ? 100 : Math.max(0, 100 - (totalLines - 1000) / 50)) * 0.3
    );

    return {
      overallScore,
      maintainabilityIndex: Math.round(maintainabilityIndex),
      cyclomaticComplexity: Math.round(avgComplexity),
      linesOfCode: totalLines,
      technicalDebt: {
        minutes: debtMinutes,
        rating: debtRating
      },
      duplication: 5, // Estimated
      metrics: {
        files: files.length,
        functions: totalFunctions,
        classes: files.reduce((total, file) => total + (file.content.match(/class\s+\w+/g) || []).length, 0),
        imports: files.reduce((total, file) => total + (file.content.match(/import\s+.*from/g) || []).length, 0),
        exports: files.reduce((total, file) => total + (file.content.match(/export\s+/g) || []).length, 0)
      }
    };
  }

  private async analyzeOptimizations(files: ProjectFile[], framework: string): Promise<OptimizationSuggestion[]> {
    const optimizations: OptimizationSuggestion[] = [];

    // Bundle optimization
    const hasLargeLibraries = files.some(f => f.content.includes('lodash') || f.content.includes('moment'));
    if (hasLargeLibraries) {
      optimizations.push({
        id: 'bundle-optimization',
        type: 'bundle-size',
        impact: 'high',
        effort: 'easy',
        title: 'Optimize Bundle Size',
        description: 'Reduce bundle size by optimizing large library imports',
        benefits: [
          'Faster page load times',
          'Reduced bandwidth usage',
          'Better user experience on slow connections'
        ],
        implementation: {
          steps: [
            'Replace large libraries with smaller alternatives',
            'Use tree-shaking compatible imports',
            'Implement code splitting for large components'
          ],
          codeExample: "import { debounce } from 'lodash/debounce'; // Instead of import _ from 'lodash'",
          estimatedTime: '2-4 hours'
        },
        metrics: {
          bundleReduction: '30-50%'
        }
      });
    }

    // Performance optimizations for React
    if (framework === 'react') {
      const hasUnoptimizedComponents = files.some(f => 
        f.type === 'component' && 
        !f.content.includes('React.memo') && 
        f.content.split('\n').length > 50
      );

      if (hasUnoptimizedComponents) {
        optimizations.push({
          id: 'react-memo-optimization',
          type: 'rendering',
          impact: 'medium',
          effort: 'easy',
          title: 'Add React.memo to Components',
          description: 'Prevent unnecessary re-renders with React.memo',
          benefits: [
            'Reduced CPU usage',
            'Smoother user interactions',
            'Better performance on lower-end devices'
          ],
          implementation: {
            steps: [
              'Identify components that receive stable props',
              'Wrap components with React.memo',
              'Add custom comparison function if needed'
            ],
            codeExample: 'const MyComponent = React.memo(function MyComponent(props) { ... });',
            estimatedTime: '1-2 hours'
          },
          metrics: {
            performanceGain: '10-30%'
          }
        });
      }
    }

    // Image optimization
    optimizations.push({
      id: 'image-optimization',
      type: 'performance',
      impact: 'high',
      effort: 'moderate',
      title: 'Optimize Images',
      description: 'Implement lazy loading and modern image formats',
      benefits: [
        'Faster initial page load',
        'Reduced bandwidth usage',
        'Better Core Web Vitals scores'
      ],
      implementation: {
        steps: [
          'Implement lazy loading for images',
          'Use WebP format with fallbacks',
          'Add proper alt attributes for accessibility'
        ],
        codeExample: '<img loading="lazy" src="image.webp" alt="Description" />',
        estimatedTime: '3-5 hours'
      },
      metrics: {
        performanceGain: '20-40%'
      }
    });

    // Accessibility improvements
    optimizations.push({
      id: 'accessibility-improvements',
      type: 'accessibility',
      impact: 'high',
      effort: 'moderate',
      title: 'Improve Accessibility',
      description: 'Add ARIA labels, semantic HTML, and keyboard navigation',
      benefits: [
        'Better user experience for all users',
        'Legal compliance (ADA, WCAG)',
        'Improved SEO rankings',
        'Better testing capabilities'
      ],
      implementation: {
        steps: [
          'Add semantic HTML elements',
          'Implement proper ARIA labels',
          'Ensure keyboard navigation works',
          'Add focus indicators',
          'Test with screen readers'
        ],
        estimatedTime: '4-8 hours'
      },
      metrics: {
        performanceGain: 'Accessibility score: +15-25 points'
      }
    });

    return optimizations;
  }

  private calculateCyclomaticComplexity(code: string): number {
    // Simplified complexity calculation
    const complexityKeywords = ['if', 'else', 'while', 'for', 'case', 'catch', '&&', '||', '?'];
    let complexity = 1; // Base complexity

    complexityKeywords.forEach(keyword => {
      const matches = code.match(new RegExp(`\\b${keyword}\\b`, 'g'));
      if (matches) {
        complexity += matches.length;
      }
    });

    return complexity;
  }

  private calculateDependencyDepth(files: ProjectFile[]): number {
    // Simplified dependency depth calculation
    let maxDepth = 0;
    
    files.forEach(file => {
      const imports = (file.content.match(/import\s+.*from\s+['"]\.+/g) || []).length;
      maxDepth = Math.max(maxDepth, imports);
    });

    return maxDepth;
  }

  private calculateAverageComplexity(files: ProjectFile[]): number {
    const complexities = files.map(file => this.calculateCyclomaticComplexity(file.content));
    return complexities.reduce((a, b) => a + b, 0) / complexities.length;
  }

  private calculatePerformanceScore(metrics: PerformanceMetric[]): number {
    const scores = metrics.map(metric => {
      switch (metric.status) {
        case 'good': return 100;
        case 'warning': return 70;
        case 'critical': return 30;
        default: return 50;
      }
    });

    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }

  private getSeverityWeight(severity: string): number {
    switch (severity) {
      case 'critical': return 4;
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  }

  private generateRecommendations(
    issues: CodeIssue[],
    performance: PerformanceMetric[],
    security: SecurityVulnerability[],
    optimizations: OptimizationSuggestion[]
  ): string[] {
    const recommendations: string[] = [];

    // Critical issues first
    const criticalIssues = issues.filter(i => i.severity === 'critical');
    if (criticalIssues.length > 0) {
      recommendations.push(`Address ${criticalIssues.length} critical issue(s) immediately`);
    }

    // Security vulnerabilities
    if (security.length > 0) {
      recommendations.push(`Fix ${security.length} security vulnerability/vulnerabilities`);
    }

    // Performance improvements
    const criticalPerf = performance.filter(p => p.status === 'critical');
    if (criticalPerf.length > 0) {
      recommendations.push(`Improve performance metrics: ${criticalPerf.map(p => p.name).join(', ')}`);
    }

    // Top optimization suggestions
    const highImpactOptimizations = optimizations.filter(o => o.impact === 'high').slice(0, 2);
    highImpactOptimizations.forEach(opt => {
      recommendations.push(`Consider: ${opt.title}`);
    });

    // General maintenance
    if (issues.length > 20) {
      recommendations.push('Consider refactoring to reduce technical debt');
    }

    return recommendations.slice(0, 5); // Limit to top 5 recommendations
  }
}