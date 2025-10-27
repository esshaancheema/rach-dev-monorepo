// Intelligent Project Estimation System
import { 
  ProjectEstimation, 
  ProjectRequirement, 
  ProjectBreakdown, 
  ProjectRisk,
  ProjectEstimationResponse 
} from './types';

export interface EstimationInput {
  projectName: string;
  description: string;
  projectType: 'web-app' | 'mobile-app' | 'ai-ml' | 'desktop-app' | 'api' | 'full-stack' | 'other';
  complexity: 'simple' | 'medium' | 'complex' | 'enterprise';
  features: string[];
  technologies: string[];
  timeline?: string;
  budget?: string;
  teamSize?: number;
  hasExistingSystem: boolean;
  integrations: string[];
  platforms: string[];
  userBase: 'small' | 'medium' | 'large' | 'enterprise';
  complianceRequirements: string[];
  maintenanceExpected: boolean;
}

export class IntelligentProjectEstimator {
  private baseRates: Record<string, number> = {
    'junior': 50,
    'mid': 80,
    'senior': 120,
    'lead': 150,
    'architect': 180
  };

  private complexityMultipliers = {
    'simple': 1.0,
    'medium': 1.5,
    'complex': 2.2,
    'enterprise': 3.5
  };

  private projectTypeBaselines = {
    'web-app': { weeks: 8, hours: 320, baseComplexity: 1.0 },
    'mobile-app': { weeks: 12, hours: 480, baseComplexity: 1.3 },
    'ai-ml': { weeks: 16, hours: 640, baseComplexity: 2.0 },
    'desktop-app': { weeks: 14, hours: 560, baseComplexity: 1.8 },
    'api': { weeks: 6, hours: 240, baseComplexity: 0.8 },
    'full-stack': { weeks: 20, hours: 800, baseComplexity: 2.5 },
    'other': { weeks: 10, hours: 400, baseComplexity: 1.2 }
  };

  async estimateProject(input: EstimationInput): Promise<ProjectEstimation> {
    // Generate requirements from input
    const requirements = this.generateRequirements(input);
    
    // Calculate base estimation
    const baseEstimation = this.calculateBaseEstimation(input);
    
    // Apply complexity and feature adjustments
    const adjustedEstimation = this.applyAdjustments(baseEstimation, input, requirements);
    
    // Generate project breakdown
    const breakdown = this.generateProjectBreakdown(input, adjustedEstimation);
    
    // Identify risks
    const risks = this.identifyRisks(input, requirements);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(input, risks);
    
    // Generate assumptions
    const assumptions = this.generateAssumptions(input);

    return {
      id: this.generateEstimationId(),
      projectName: input.projectName,
      description: input.description,
      requirements,
      estimation: adjustedEstimation,
      breakdown,
      risks,
      recommendations,
      assumptions,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private generateRequirements(input: EstimationInput): ProjectRequirement[] {
    const requirements: ProjectRequirement[] = [];

    // Core functional requirements
    requirements.push({
      id: 'req-001',
      category: 'functional',
      priority: 'must-have',
      title: 'Core Application Logic',
      description: 'Implementation of main business logic and user workflows',
      complexity: input.complexity === 'simple' ? 'medium' : 
                  input.complexity === 'medium' ? 'complex' : 'very-complex',
      estimatedHours: this.calculateCoreLogicHours(input)
    });

    // User interface requirements
    if (['web-app', 'mobile-app', 'desktop-app', 'full-stack'].includes(input.projectType)) {
      requirements.push({
        id: 'req-002',
        category: 'functional',
        priority: 'must-have',
        title: 'User Interface Development',
        description: 'Design and implementation of user interface components',
        complexity: 'medium',
        estimatedHours: this.calculateUIHours(input),
        skills: ['frontend', 'ui-ux']
      });
    }

    // Database requirements
    if (['web-app', 'full-stack', 'api'].includes(input.projectType)) {
      requirements.push({
        id: 'req-003',
        category: 'functional',
        priority: 'must-have',
        title: 'Database Design and Implementation',
        description: 'Database schema design, optimization, and data layer implementation',
        complexity: input.userBase === 'enterprise' ? 'very-complex' : 'medium',
        estimatedHours: this.calculateDatabaseHours(input),
        skills: ['backend', 'database']
      });
    }

    // API requirements
    if (['api', 'full-stack', 'mobile-app'].includes(input.projectType)) {
      requirements.push({
        id: 'req-004',
        category: 'functional',
        priority: 'must-have',
        title: 'API Development',
        description: 'RESTful/GraphQL API design and implementation',
        complexity: 'medium',
        estimatedHours: this.calculateAPIHours(input),
        skills: ['backend', 'api-design']
      });
    }

    // Authentication and authorization
    if (input.features.some(f => f.toLowerCase().includes('auth') || f.toLowerCase().includes('login'))) {
      requirements.push({
        id: 'req-005',
        category: 'functional',
        priority: 'must-have',
        title: 'Authentication System',
        description: 'User authentication, authorization, and session management',
        complexity: input.complianceRequirements.length > 0 ? 'complex' : 'medium',
        estimatedHours: this.calculateAuthHours(input),
        skills: ['backend', 'security']
      });
    }

    // AI/ML specific requirements
    if (input.projectType === 'ai-ml' || input.features.some(f => f.toLowerCase().includes('ai'))) {
      requirements.push({
        id: 'req-006',
        category: 'functional',
        priority: 'must-have',
        title: 'AI/ML Model Development',
        description: 'Machine learning model development, training, and integration',
        complexity: 'very-complex',
        estimatedHours: this.calculateMLHours(input),
        skills: ['ai-ml', 'data-science', 'python']
      });
    }

    // Integration requirements
    if (input.integrations.length > 0) {
      requirements.push({
        id: 'req-007',
        category: 'functional',
        priority: 'should-have',
        title: 'Third-party Integrations',
        description: `Integration with external services: ${input.integrations.join(', ')}`,
        complexity: input.integrations.length > 3 ? 'complex' : 'medium',
        estimatedHours: input.integrations.length * 20,
        skills: ['backend', 'integration']
      });
    }

    // Testing requirements
    requirements.push({
      id: 'req-008',
      category: 'non-functional',
      priority: 'must-have',
      title: 'Testing and Quality Assurance',
      description: 'Unit testing, integration testing, and quality assurance',
      complexity: 'medium',
      estimatedHours: Math.floor(requirements.reduce((sum, req) => sum + req.estimatedHours, 0) * 0.3),
      skills: ['testing', 'qa']
    });

    // Performance requirements
    if (input.userBase === 'large' || input.userBase === 'enterprise') {
      requirements.push({
        id: 'req-009',
        category: 'non-functional',
        priority: 'must-have',
        title: 'Performance Optimization',
        description: 'Application performance optimization and scalability implementation',
        complexity: 'complex',
        estimatedHours: 80,
        skills: ['performance', 'optimization']
      });
    }

    // Security requirements
    if (input.complianceRequirements.length > 0 || input.userBase === 'enterprise') {
      requirements.push({
        id: 'req-010',
        category: 'non-functional',
        priority: 'must-have',
        title: 'Security Implementation',
        description: `Security measures and compliance: ${input.complianceRequirements.join(', ')}`,
        complexity: 'complex',
        estimatedHours: input.complianceRequirements.length * 30,
        skills: ['security', 'compliance']
      });
    }

    // Documentation requirements
    requirements.push({
      id: 'req-011',
      category: 'technical',
      priority: 'should-have',
      title: 'Documentation',
      description: 'Technical documentation, API docs, and user guides',
      complexity: 'simple',
      estimatedHours: 40,
      skills: ['documentation', 'technical-writing']
    });

    // Deployment requirements
    requirements.push({
      id: 'req-012',
      category: 'technical',
      priority: 'must-have',
      title: 'Deployment and DevOps',
      description: 'CI/CD pipeline setup, deployment automation, and infrastructure',
      complexity: input.platforms.length > 1 ? 'complex' : 'medium',
      estimatedHours: 60 + (input.platforms.length * 20),
      skills: ['devops', 'cloud', 'infrastructure']
    });

    return requirements;
  }

  private calculateBaseEstimation(input: EstimationInput) {
    const baseline = this.projectTypeBaselines[input.projectType];
    const multiplier = this.complexityMultipliers[input.complexity];
    
    const baseDuration = baseline.weeks * multiplier;
    const baseEffort = baseline.hours * multiplier;
    const baseCost = baseEffort * this.getAverageRate();

    return {
      duration: {
        min: Math.ceil(baseDuration * 0.8),
        max: Math.ceil(baseDuration * 1.5),
        most_likely: Math.ceil(baseDuration)
      },
      effort: {
        min: Math.ceil(baseEffort * 0.8),
        max: Math.ceil(baseEffort * 1.8),
        most_likely: Math.ceil(baseEffort)
      },
      cost: {
        min: Math.ceil(baseCost * 0.8),
        max: Math.ceil(baseCost * 2.0),
        most_likely: Math.ceil(baseCost)
      },
      confidence: this.calculateInitialConfidence(input)
    };
  }

  private applyAdjustments(baseEstimation: any, input: EstimationInput, requirements: ProjectRequirement[]) {
    let durationAdjustment = 1.0;
    let effortAdjustment = 1.0;
    let costAdjustment = 1.0;

    // Feature complexity adjustment
    const featureCount = input.features.length;
    if (featureCount > 10) {
      durationAdjustment *= 1.3;
      effortAdjustment *= 1.4;
    } else if (featureCount > 5) {
      durationAdjustment *= 1.15;
      effortAdjustment *= 1.2;
    }

    // Technology stack adjustment
    const modernTechCount = this.countModernTechnologies(input.technologies);
    const legacyTechCount = this.countLegacyTechnologies(input.technologies);
    
    if (legacyTechCount > 0) {
      durationAdjustment *= 1.2;
      effortAdjustment *= 1.3;
      costAdjustment *= 1.1;
    }

    if (modernTechCount > 3) {
      durationAdjustment *= 1.1;
      effortAdjustment *= 1.15;
    }

    // Integration complexity
    if (input.integrations.length > 3) {
      durationAdjustment *= 1.25;
      effortAdjustment *= 1.3;
    }

    // Existing system integration
    if (input.hasExistingSystem) {
      durationAdjustment *= 1.4;
      effortAdjustment *= 1.5;
      costAdjustment *= 1.2;
    }

    // User base scaling
    const userBaseMultipliers = {
      'small': 1.0,
      'medium': 1.1,
      'large': 1.3,
      'enterprise': 1.6
    };
    
    const userMultiplier = userBaseMultipliers[input.userBase];
    durationAdjustment *= userMultiplier;
    effortAdjustment *= userMultiplier;
    costAdjustment *= userMultiplier;

    // Apply adjustments
    return {
      duration: {
        min: Math.ceil(baseEstimation.duration.min * durationAdjustment),
        max: Math.ceil(baseEstimation.duration.max * durationAdjustment),
        most_likely: Math.ceil(baseEstimation.duration.most_likely * durationAdjustment)
      },
      effort: {
        min: Math.ceil(baseEstimation.effort.min * effortAdjustment),
        max: Math.ceil(baseEstimation.effort.max * effortAdjustment),
        most_likely: Math.ceil(baseEstimation.effort.most_likely * effortAdjustment)
      },
      cost: {
        min: Math.ceil(baseEstimation.cost.min * costAdjustment),
        max: Math.ceil(baseEstimation.cost.max * costAdjustment),
        most_likely: Math.ceil(baseEstimation.cost.most_likely * costAdjustment)
      },
      confidence: Math.max(0.6, baseEstimation.confidence - (effortAdjustment - 1.0) * 0.2)
    };
  }

  private generateProjectBreakdown(input: EstimationInput, estimation: any): ProjectBreakdown {
    const totalEffort = estimation.effort.most_likely;
    const totalDuration = estimation.duration.most_likely;
    
    // Define project phases
    const phases = [
      {
        name: 'Discovery & Planning',
        description: 'Requirements analysis, system design, and project planning',
        duration: Math.ceil(totalDuration * 0.15),
        effort: Math.ceil(totalEffort * 0.1),
        deliverables: [
          'Technical Requirements Document',
          'System Architecture Design',
          'Project Timeline',
          'Resource Allocation Plan'
        ],
        milestones: ['Requirements Approval', 'Architecture Review']
      },
      {
        name: 'Design & Prototyping',
        description: 'UI/UX design, database design, and system prototyping',
        duration: Math.ceil(totalDuration * 0.2),
        effort: Math.ceil(totalEffort * 0.15),
        deliverables: [
          'UI/UX Mockups',
          'Database Schema',
          'API Specifications',
          'Interactive Prototype'
        ],
        milestones: ['Design Approval', 'Prototype Demo']
      },
      {
        name: 'Core Development',
        description: 'Main application development and core feature implementation',
        duration: Math.ceil(totalDuration * 0.4),
        effort: Math.ceil(totalEffort * 0.5),
        deliverables: [
          'Core Application',
          'Database Implementation',
          'API Development',
          'Feature Modules'
        ],
        milestones: ['Alpha Release', 'Core Features Complete']
      },
      {
        name: 'Integration & Testing',
        description: 'System integration, testing, and quality assurance',
        duration: Math.ceil(totalDuration * 0.15),
        effort: Math.ceil(totalEffort * 0.2),
        deliverables: [
          'Integrated System',
          'Test Suite',
          'Bug Fixes',
          'Performance Optimization'
        ],
        milestones: ['Beta Release', 'Testing Complete']
      },
      {
        name: 'Deployment & Launch',
        description: 'Production deployment, launch preparation, and knowledge transfer',
        duration: Math.ceil(totalDuration * 0.1),
        effort: Math.ceil(totalEffort * 0.05),
        deliverables: [
          'Production Deployment',
          'User Documentation',
          'Training Materials',
          'Handover Package'
        ],
        milestones: ['Production Release', 'Project Handover']
      }
    ];

    // Calculate phase costs
    phases.forEach(phase => {
      phase.cost = phase.effort * this.getAverageRate();
    });

    // Define required resources
    const resources = this.generateResourceRequirements(input, totalDuration);

    // Define technologies
    const technologies = this.analyzeTechnologies(input);

    return {
      phases,
      resources,
      technologies
    };
  }

  private generateResourceRequirements(input: EstimationInput, duration: number) {
    const resources = [];

    // Project Manager
    resources.push({
      role: 'Project Manager',
      level: 'senior',
      allocation: 25,
      duration,
      hourlyRate: this.baseRates.senior
    });

    // Tech Lead/Architect
    if (input.complexity === 'complex' || input.complexity === 'enterprise') {
      resources.push({
        role: 'Tech Lead',
        level: 'lead',
        allocation: 50,
        duration,
        hourlyRate: this.baseRates.lead
      });
    }

    // Frontend Developers
    if (['web-app', 'mobile-app', 'full-stack'].includes(input.projectType)) {
      resources.push({
        role: 'Frontend Developer',
        level: 'senior',
        allocation: 80,
        duration: Math.ceil(duration * 0.7),
        hourlyRate: this.baseRates.senior
      });

      if (input.complexity === 'complex' || input.complexity === 'enterprise') {
        resources.push({
          role: 'Frontend Developer',
          level: 'mid',
          allocation: 80,
          duration: Math.ceil(duration * 0.6),
          hourlyRate: this.baseRates.mid
        });
      }
    }

    // Backend Developers
    if (['web-app', 'api', 'full-stack'].includes(input.projectType)) {
      resources.push({
        role: 'Backend Developer',
        level: 'senior',
        allocation: 80,
        duration: Math.ceil(duration * 0.8),
        hourlyRate: this.baseRates.senior
      });

      if (input.complexity === 'enterprise') {
        resources.push({
          role: 'Backend Developer',
          level: 'mid',
          allocation: 80,
          duration: Math.ceil(duration * 0.7),
          hourlyRate: this.baseRates.mid
        });
      }
    }

    // AI/ML Specialist
    if (input.projectType === 'ai-ml' || input.features.some(f => f.toLowerCase().includes('ai'))) {
      resources.push({
        role: 'AI/ML Engineer',
        level: 'senior',
        allocation: 70,
        duration: Math.ceil(duration * 0.6),
        hourlyRate: this.baseRates.lead
      });
    }

    // DevOps Engineer
    if (input.userBase === 'large' || input.userBase === 'enterprise') {
      resources.push({
        role: 'DevOps Engineer',
        level: 'senior',
        allocation: 40,
        duration: Math.ceil(duration * 0.5),
        hourlyRate: this.baseRates.senior
      });
    }

    // QA Engineer
    resources.push({
      role: 'QA Engineer',
      level: 'mid',
      allocation: 60,
      duration: Math.ceil(duration * 0.4),
      hourlyRate: this.baseRates.mid
    });

    // UI/UX Designer
    if (['web-app', 'mobile-app', 'full-stack'].includes(input.projectType)) {
      resources.push({
        role: 'UI/UX Designer',
        level: 'senior',
        allocation: 50,
        duration: Math.ceil(duration * 0.3),
        hourlyRate: this.baseRates.senior
      });
    }

    return resources;
  }

  private analyzeTechnologies(input: EstimationInput) {
    return input.technologies.map(tech => ({
      name: tech,
      category: this.categorizeTechnology(tech),
      complexity: this.getTechnologyComplexity(tech),
      learningCurve: this.getTechnologyLearningCurve(tech)
    }));
  }

  private identifyRisks(input: EstimationInput, requirements: ProjectRequirement[]): ProjectRisk[] {
    const risks: ProjectRisk[] = [];

    // Technical complexity risks
    if (input.complexity === 'enterprise' || input.complexity === 'complex') {
      risks.push({
        id: 'risk-001',
        category: 'technical',
        severity: 'high',
        probability: 'medium',
        description: 'High technical complexity may lead to unforeseen challenges',
        impact: 'Potential delays and scope changes',
        mitigation: 'Thorough technical planning and frequent architecture reviews',
        contingency: 'Additional senior developers and extended timeline'
      });
    }

    // Integration risks
    if (input.integrations.length > 3) {
      risks.push({
        id: 'risk-002',
        category: 'technical',
        severity: 'medium',
        probability: 'high',
        description: 'Multiple third-party integrations increase complexity',
        impact: 'Integration failures and dependency issues',
        mitigation: 'Early integration testing and fallback strategies',
        contingency: 'Alternative integration approaches'
      });
    }

    // Legacy system risks
    if (input.hasExistingSystem) {
      risks.push({
        id: 'risk-003',
        category: 'technical',
        severity: 'high',
        probability: 'medium',
        description: 'Legacy system integration challenges',
        impact: 'Data migration issues and system incompatibilities',
        mitigation: 'Comprehensive system analysis and migration planning',
        contingency: 'Phased migration approach'
      });
    }

    // Resource risks
    if (input.complexity === 'enterprise') {
      risks.push({
        id: 'risk-004',
        category: 'resource',
        severity: 'medium',
        probability: 'medium',
        description: 'Specialized skill requirements may be challenging to fulfill',
        impact: 'Team scaling difficulties and knowledge gaps',
        mitigation: 'Early resource planning and team training',
        contingency: 'External consultants and extended onboarding'
      });
    }

    // Timeline risks
    if (input.timeline && this.isAggressiveTimeline(input.timeline, input.complexity)) {
      risks.push({
        id: 'risk-005',
        category: 'timeline',
        severity: 'high',
        probability: 'high',
        description: 'Aggressive timeline may compromise quality',
        impact: 'Rushed development and potential technical debt',
        mitigation: 'Agile methodology and continuous quality checks',
        contingency: 'Scope reduction and phased delivery'
      });
    }

    // Budget risks
    if (input.budget && this.isBudgetConstrained(input.budget, input.complexity)) {
      risks.push({
        id: 'risk-006',
        category: 'budget',
        severity: 'medium',
        probability: 'medium',
        description: 'Budget constraints may limit scope or quality',
        impact: 'Feature reduction or quality compromises',
        mitigation: 'Clear scope definition and change management',
        contingency: 'Phased development approach'
      });
    }

    return risks;
  }

  private generateRecommendations(input: EstimationInput, risks: ProjectRisk[]): string[] {
    const recommendations = [];

    // General recommendations
    recommendations.push('Use Agile methodology with 2-week sprints for better adaptability');
    recommendations.push('Implement continuous integration and deployment from day one');
    recommendations.push('Conduct regular code reviews and maintain high code quality standards');

    // Complexity-based recommendations
    if (input.complexity === 'enterprise' || input.complexity === 'complex') {
      recommendations.push('Consider hiring a technical architect to guide system design');
      recommendations.push('Implement comprehensive logging and monitoring from the beginning');
      recommendations.push('Plan for horizontal scaling and load balancing');
    }

    // AI/ML specific recommendations
    if (input.projectType === 'ai-ml') {
      recommendations.push('Start with a minimum viable model and iterate');
      recommendations.push('Implement proper data versioning and model management');
      recommendations.push('Plan for model retraining and continuous improvement');
    }

    // Mobile app recommendations
    if (input.projectType === 'mobile-app') {
      recommendations.push('Consider cross-platform development to reduce costs');
      recommendations.push('Plan for app store approval processes in the timeline');
      recommendations.push('Implement proper offline functionality and data sync');
    }

    // Risk-based recommendations
    if (risks.some(r => r.category === 'technical' && r.severity === 'high')) {
      recommendations.push('Conduct proof-of-concept development for high-risk components');
      recommendations.push('Allocate 20% buffer time for technical challenges');
    }

    if (input.integrations.length > 0) {
      recommendations.push('Create integration test environments early in development');
      recommendations.push('Document all third-party dependencies and alternatives');
    }

    return recommendations;
  }

  private generateAssumptions(input: EstimationInput): string[] {
    return [
      'Requirements will remain stable throughout development',
      'All necessary third-party services will be available and functional',
      'Team members will be available as planned without major interruptions',
      'Development environment and tools will be set up within the first week',
      'Client will provide timely feedback and approvals at each milestone',
      'All necessary licenses and access permissions will be obtained promptly',
      'Testing data and environments will be available when needed',
      'No major changes in technology stack or architecture mid-project',
      'Regular communication and collaboration will be maintained',
      'Quality standards and acceptance criteria are clearly defined'
    ];
  }

  // Helper methods for calculations
  private calculateCoreLogicHours(input: EstimationInput): number {
    const baseHours = {
      'simple': 80,
      'medium': 160,
      'complex': 320,
      'enterprise': 480
    };
    
    return baseHours[input.complexity] + (input.features.length * 10);
  }

  private calculateUIHours(input: EstimationInput): number {
    const baseHours = input.projectType === 'mobile-app' ? 120 : 100;
    return baseHours + (input.features.length * 8);
  }

  private calculateDatabaseHours(input: EstimationInput): number {
    const baseHours = {
      'small': 40,
      'medium': 80,
      'large': 160,
      'enterprise': 240
    };
    
    return baseHours[input.userBase];
  }

  private calculateAPIHours(input: EstimationInput): number {
    return 80 + (input.integrations.length * 15);
  }

  private calculateAuthHours(input: EstimationInput): number {
    const baseHours = 60;
    const complianceHours = input.complianceRequirements.length * 20;
    return baseHours + complianceHours;
  }

  private calculateMLHours(input: EstimationInput): number {
    return 200 + (input.features.filter(f => f.toLowerCase().includes('ai')).length * 40);
  }

  private getAverageRate(): number {
    return (this.baseRates.junior + this.baseRates.mid + this.baseRates.senior + this.baseRates.lead) / 4;
  }

  private calculateInitialConfidence(input: EstimationInput): number {
    let confidence = 0.9;
    
    // Reduce confidence for complex projects
    if (input.complexity === 'enterprise') confidence -= 0.2;
    if (input.complexity === 'complex') confidence -= 0.1;
    
    // Reduce confidence for many integrations
    if (input.integrations.length > 3) confidence -= 0.1;
    
    // Reduce confidence for legacy systems
    if (input.hasExistingSystem) confidence -= 0.15;
    
    // Reduce confidence for new technologies
    const newTechCount = this.countNewTechnologies(input.technologies);
    confidence -= newTechCount * 0.05;
    
    return Math.max(0.5, confidence);
  }

  private countModernTechnologies(technologies: string[]): number {
    const modernTech = ['react', 'vue', 'angular', 'node.js', 'python', 'go', 'rust', 'kubernetes', 'docker'];
    return technologies.filter(tech => 
      modernTech.some(modern => tech.toLowerCase().includes(modern))
    ).length;
  }

  private countLegacyTechnologies(technologies: string[]): number {
    const legacyTech = ['jquery', 'php', 'asp.net', 'java', 'oracle', 'mainframe'];
    return technologies.filter(tech => 
      legacyTech.some(legacy => tech.toLowerCase().includes(legacy))
    ).length;
  }

  private countNewTechnologies(technologies: string[]): number {
    const newTech = ['svelte', 'deno', 'bun', 'tauri', 'wasm'];
    return technologies.filter(tech => 
      newTech.some(newT => tech.toLowerCase().includes(newT))
    ).length;
  }

  private categorizeTechnology(tech: string): string {
    const categories = {
      'frontend': ['react', 'vue', 'angular', 'svelte', 'html', 'css', 'javascript'],
      'backend': ['node.js', 'python', 'java', 'go', 'rust', 'php', 'ruby'],
      'database': ['postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch'],
      'infrastructure': ['aws', 'azure', 'gcp', 'docker', 'kubernetes'],
      'tool': ['webpack', 'vite', 'babel', 'typescript', 'eslint']
    };
    
    for (const [category, techs] of Object.entries(categories)) {
      if (techs.some(t => tech.toLowerCase().includes(t))) {
        return category;
      }
    }
    
    return 'other';
  }

  private getTechnologyComplexity(tech: string): number {
    const complexities = {
      'kubernetes': 5,
      'rust': 4,
      'go': 3,
      'react': 3,
      'python': 2,
      'javascript': 2,
      'html': 1
    };
    
    for (const [techName, complexity] of Object.entries(complexities)) {
      if (tech.toLowerCase().includes(techName)) {
        return complexity;
      }
    }
    
    return 3;
  }

  private getTechnologyLearningCurve(tech: string): 'low' | 'medium' | 'high' {
    const learningCurves = {
      'high': ['rust', 'kubernetes', 'machine learning', 'blockchain'],
      'medium': ['react', 'vue', 'angular', 'node.js', 'python'],
      'low': ['html', 'css', 'javascript', 'mysql']
    };
    
    for (const [curve, techs] of Object.entries(learningCurves)) {
      if (techs.some(t => tech.toLowerCase().includes(t))) {
        return curve as 'low' | 'medium' | 'high';
      }
    }
    
    return 'medium';
  }

  private isAggressiveTimeline(timeline: string, complexity: string): boolean {
    const timelineWeeks = this.parseTimelineToWeeks(timeline);
    const minWeeks = {
      'simple': 4,
      'medium': 8,
      'complex': 16,
      'enterprise': 24
    };
    
    return timelineWeeks < minWeeks[complexity];
  }

  private isBudgetConstrained(budget: string, complexity: string): boolean {
    const budgetAmount = this.parseBudgetToAmount(budget);
    const minBudgets = {
      'simple': 25000,
      'medium': 50000,
      'complex': 100000,
      'enterprise': 200000
    };
    
    return budgetAmount < minBudgets[complexity];
  }

  private parseTimelineToWeeks(timeline: string): number {
    const match = timeline.match(/(\d+)\s*(week|month)/i);
    if (!match) return 12; // default
    
    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    
    return unit === 'month' ? value * 4 : value;
  }

  private parseBudgetToAmount(budget: string): number {
    const match = budget.match(/\$?(\d+(?:,\d{3})*(?:\.\d{2})?)[km]?/i);
    if (!match) return 50000; // default
    
    let amount = parseFloat(match[1].replace(/,/g, ''));
    
    if (budget.toLowerCase().includes('k')) amount *= 1000;
    if (budget.toLowerCase().includes('m')) amount *= 1000000;
    
    return amount;
  }

  private generateEstimationId(): string {
    return `est_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}