'use client';

import { ProjectFile } from './enhanced-code-generator';
import { AnalysisResult } from './code-analyzer';

export interface LearningTip {
  id: string;
  type: 'concept' | 'best-practice' | 'pattern' | 'security' | 'performance' | 'accessibility';
  category: 'beginner' | 'intermediate' | 'advanced';
  title: string;
  description: string;
  codeExample?: {
    before?: string;
    after: string;
    explanation: string;
  };
  relatedConcepts: string[];
  resources: {
    title: string;
    url: string;
    type: 'documentation' | 'tutorial' | 'article' | 'video';
  }[];
  framework: string;
}

export interface InteractiveTutorial {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  framework: string;
  steps: TutorialStep[];
  prerequisites: string[];
  learningObjectives: string[];
}

export interface TutorialStep {
  id: string;
  title: string;
  instruction: string;
  codeToWrite?: string;
  hints: string[];
  validation: {
    check: string;
    errorMessage: string;
    successMessage: string;
  };
  explanation: string;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  framework: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  tutorials: string[]; // Tutorial IDs
  skills: string[];
  completionRewards: string[];
}

export interface CodeExplanation {
  id: string;
  codeSnippet: string;
  file: string;
  line?: number;
  explanation: string;
  keyConCepts: string[];
  relatedPatterns: string[];
  bestPractices: string[];
  commonPitfalls: string[];
  improvementSuggestions: string[];
}

export interface PersonalizedRecommendation {
  id: string;
  type: 'tutorial' | 'concept' | 'practice' | 'review';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  reason: string;
  timeToComplete: string;
  skillsToGain: string[];
  action: {
    type: 'start-tutorial' | 'read-article' | 'practice-code' | 'review-concept';
    target: string; // ID or URL
  };
}

export interface UserProgress {
  userId: string;
  completedTutorials: string[];
  currentTutorial?: string;
  currentStep?: number;
  skillsAcquired: string[];
  weakAreas: string[];
  learningStreak: number;
  totalTimeSpent: number; // minutes
  badges: string[];
  level: number;
  experiencePoints: number;
}

export class LearningAssistant {
  private knowledgeBase: Map<string, LearningTip[]> = new Map();
  private tutorials: Map<string, InteractiveTutorial> = new Map();
  private learningPaths: Map<string, LearningPath> = new Map();
  private userProgress: Map<string, UserProgress> = new Map();

  constructor() {
    this.initializeKnowledgeBase();
    this.initializeTutorials();
    this.initializeLearningPaths();
  }

  async explainCode(file: ProjectFile, line?: number): Promise<CodeExplanation> {
    const codeSnippet = line !== undefined ? 
      file.content.split('\n')[line] : 
      file.content;

    const explanation = await this.generateCodeExplanation(codeSnippet, file.path, line);
    
    return {
      id: `explanation-${file.path}-${line || 'full'}`,
      codeSnippet,
      file: file.path,
      line,
      explanation: explanation.main,
      keyConCepts: explanation.concepts,
      relatedPatterns: explanation.patterns,
      bestPractices: explanation.bestPractices,
      commonPitfalls: explanation.pitfalls,
      improvementSuggestions: explanation.improvements
    };
  }

  async generateContextualTips(
    files: ProjectFile[], 
    framework: string, 
    analysisResult?: AnalysisResult
  ): Promise<LearningTip[]> {
    const tips: LearningTip[] = [];
    const frameworkTips = this.knowledgeBase.get(framework) || [];

    // Analyze code patterns and suggest relevant tips
    for (const file of files) {
      const fileTips = await this.analyzeFileForTips(file, framework, analysisResult);
      tips.push(...fileTips);
    }

    // Add framework-specific tips
    tips.push(...frameworkTips.slice(0, 5));

    // Sort by relevance
    return this.sortTipsByRelevance(tips, files, analysisResult);
  }

  async getPersonalizedRecommendations(
    userId: string, 
    files: ProjectFile[], 
    framework: string
  ): Promise<PersonalizedRecommendation[]> {
    const progress = this.getUserProgress(userId);
    const recommendations: PersonalizedRecommendation[] = [];

    // Analyze current skill gaps
    const skillGaps = await this.analyzeSkillGaps(progress, files, framework);

    // Recommend tutorials for weak areas
    for (const gap of skillGaps) {
      const tutorials = Array.from(this.tutorials.values())
        .filter(t => t.framework === framework && t.learningObjectives.includes(gap));
      
      if (tutorials.length > 0) {
        recommendations.push({
          id: `rec-tutorial-${gap}`,
          type: 'tutorial',
          priority: 'high',
          title: `Learn ${gap}`,
          description: `Improve your ${gap} skills with interactive tutorials`,
          reason: `Detected weakness in ${gap} from your recent code`,
          timeToComplete: tutorials[0].estimatedTime,
          skillsToGain: tutorials[0].learningObjectives,
          action: {
            type: 'start-tutorial',
            target: tutorials[0].id
          }
        });
      }
    }

    // Recommend next logical steps
    const nextSteps = this.getNextLearningSteps(progress, framework);
    recommendations.push(...nextSteps);

    return recommendations.slice(0, 10);
  }

  async startInteractiveTutorial(tutorialId: string, userId: string): Promise<InteractiveTutorial | null> {
    const tutorial = this.tutorials.get(tutorialId);
    if (!tutorial) return null;

    // Update user progress
    const progress = this.getUserProgress(userId);
    progress.currentTutorial = tutorialId;
    progress.currentStep = 0;

    return tutorial;
  }

  async validateTutorialStep(
    tutorialId: string, 
    stepId: string, 
    userCode: string
  ): Promise<{ isValid: boolean; feedback: string; hints?: string[] }> {
    const tutorial = this.tutorials.get(tutorialId);
    if (!tutorial) {
      return { isValid: false, feedback: 'Tutorial not found' };
    }

    const step = tutorial.steps.find(s => s.id === stepId);
    if (!step) {
      return { isValid: false, feedback: 'Step not found' };
    }

    // Simple validation logic (in a real implementation, this would be more sophisticated)
    const isValid = await this.validateCode(userCode, step.validation.check);

    return {
      isValid,
      feedback: isValid ? step.validation.successMessage : step.validation.errorMessage,
      hints: isValid ? undefined : step.hints
    };
  }

  async completeTutorialStep(tutorialId: string, stepId: string, userId: string): Promise<void> {
    const progress = this.getUserProgress(userId);
    
    if (progress.currentTutorial === tutorialId) {
      const tutorial = this.tutorials.get(tutorialId);
      if (tutorial) {
        const currentStepIndex = tutorial.steps.findIndex(s => s.id === stepId);
        if (currentStepIndex === tutorial.steps.length - 1) {
          // Tutorial completed
          progress.completedTutorials.push(tutorialId);
          progress.currentTutorial = undefined;
          progress.currentStep = undefined;
          progress.experiencePoints += 100;
          
          // Check for level up
          const newLevel = Math.floor(progress.experiencePoints / 500) + 1;
          if (newLevel > progress.level) {
            progress.level = newLevel;
          }
        } else {
          progress.currentStep = currentStepIndex + 1;
        }
      }
    }
  }

  private async generateCodeExplanation(
    codeSnippet: string, 
    filePath: string, 
    line?: number
  ): Promise<{
    main: string;
    concepts: string[];
    patterns: string[];
    bestPractices: string[];
    pitfalls: string[];
    improvements: string[];
  }> {
    // This would typically use an AI service for code analysis
    const analysis = this.analyzeCodeSnippet(codeSnippet);
    
    return {
      main: analysis.explanation,
      concepts: analysis.identifiedConcepts,
      patterns: analysis.patterns,
      bestPractices: analysis.bestPractices,
      pitfalls: analysis.commonPitfalls,
      improvements: analysis.suggestions
    };
  }

  private analyzeCodeSnippet(code: string) {
    // Simplified analysis for demonstration
    const concepts: string[] = [];
    const patterns: string[] = [];
    const bestPractices: string[] = [];
    const commonPitfalls: string[] = [];
    const suggestions: string[] = [];

    // Detect React patterns
    if (code.includes('useState')) {
      concepts.push('React Hooks', 'State Management');
      patterns.push('Functional Component with State');
      bestPractices.push('Use descriptive state variable names');
    }

    if (code.includes('useEffect')) {
      concepts.push('Side Effects', 'Component Lifecycle');
      patterns.push('Effect Hook');
      bestPractices.push('Include all dependencies in dependency array');
      commonPitfalls.push('Missing dependencies can cause infinite loops');
    }

    if (code.includes('map(')) {
      concepts.push('Array Methods', 'Rendering Lists');
      bestPractices.push('Always provide a unique key prop when rendering lists');
    }

    return {
      explanation: this.generateDetailedExplanation(code),
      identifiedConcepts: concepts,
      patterns,
      bestPractices,
      commonPitfalls,
      suggestions
    };
  }

  private generateDetailedExplanation(code: string): string {
    // This would use AI to generate detailed explanations
    if (code.includes('useState')) {
      return 'This code uses the useState hook to manage component state. useState returns an array with the current state value and a function to update it.';
    }
    
    if (code.includes('function')) {
      return 'This is a function declaration. Functions are reusable blocks of code that perform specific tasks.';
    }

    return 'This is a code snippet that demonstrates various programming concepts and patterns.';
  }

  private async analyzeFileForTips(
    file: ProjectFile, 
    framework: string, 
    analysisResult?: AnalysisResult
  ): Promise<LearningTip[]> {
    const tips: LearningTip[] = [];

    // Analyze common patterns and suggest improvements
    if (framework === 'react' && file.content.includes('class extends Component')) {
      tips.push({
        id: 'functional-components',
        type: 'pattern',
        category: 'intermediate',
        title: 'Consider Using Functional Components',
        description: 'Modern React applications prefer functional components with hooks over class components',
        codeExample: {
          before: 'class MyComponent extends Component {\n  render() {\n    return <div>Hello</div>;\n  }\n}',
          after: 'function MyComponent() {\n  return <div>Hello</div>;\n}',
          explanation: 'Functional components are simpler and work better with React hooks'
        },
        relatedConcepts: ['React Hooks', 'Functional Programming'],
        resources: [
          {
            title: 'React Functional Components Guide',
            url: 'https://react.dev/reference/react/Component',
            type: 'documentation'
          }
        ],
        framework: 'react'
      });
    }

    return tips;
  }

  private sortTipsByRelevance(
    tips: LearningTip[], 
    files: ProjectFile[], 
    analysisResult?: AnalysisResult
  ): LearningTip[] {
    // Sort by relevance to current code and issues
    return tips.sort((a, b) => {
      let scoreA = 0;
      const scoreB = 0;

      // Higher priority for tips that address current issues
      if (analysisResult) {
        const relatedIssues = analysisResult.issues.filter(issue =>
          a.relatedConcepts.some(concept => 
            issue.description.toLowerCase().includes(concept.toLowerCase())
          )
        );
        scoreA += relatedIssues.length * 10;
      }

      // Higher priority for framework-specific tips
      if (files.some(f => f.content.includes(a.title.toLowerCase()))) {
        scoreA += 5;
      }

      return scoreB - scoreA;
    });
  }

  private async analyzeSkillGaps(
    progress: UserProgress, 
    files: ProjectFile[], 
    framework: string
  ): Promise<string[]> {
    const gaps: string[] = [];

    // Common skill areas to check
    const skillAreas = [
      'State Management',
      'Component Composition',
      'Performance Optimization',
      'Testing',
      'Accessibility',
      'Security Best Practices'
    ];

    for (const skill of skillAreas) {
      if (!progress.skillsAcquired.includes(skill)) {
        // Check if code shows usage of this skill area
        const usesSkill = files.some(file => 
          this.codeUsesSkill(file.content, skill, framework)
        );

        if (!usesSkill || progress.weakAreas.includes(skill)) {
          gaps.push(skill);
        }
      }
    }

    return gaps;
  }

  private codeUsesSkill(code: string, skill: string, framework: string): boolean {
    // Simplified skill detection
    switch (skill) {
      case 'State Management':
        return code.includes('useState') || code.includes('useReducer') || code.includes('Redux');
      case 'Performance Optimization':
        return code.includes('React.memo') || code.includes('useCallback') || code.includes('useMemo');
      case 'Testing':
        return code.includes('test(') || code.includes('describe(') || code.includes('it(');
      case 'Accessibility':
        return code.includes('aria-') || code.includes('role=') || code.includes('alt=');
      default:
        return false;
    }
  }

  private getNextLearningSteps(progress: UserProgress, framework: string): PersonalizedRecommendation[] {
    const recommendations: PersonalizedRecommendation[] = [];

    // Suggest learning paths based on current level
    if (progress.level < 3) {
      recommendations.push({
        id: 'beginner-path',
        type: 'tutorial',
        priority: 'medium',
        title: 'Complete Beginner Path',
        description: 'Master the fundamentals with our beginner learning path',
        reason: 'Perfect for building a strong foundation',
        timeToComplete: '4-6 hours',
        skillsToGain: ['Basic Concepts', 'Best Practices', 'Common Patterns'],
        action: {
          type: 'start-tutorial',
          target: 'beginner-react-path'
        }
      });
    }

    return recommendations;
  }

  private getUserProgress(userId: string): UserProgress {
    if (!this.userProgress.has(userId)) {
      this.userProgress.set(userId, {
        userId,
        completedTutorials: [],
        skillsAcquired: [],
        weakAreas: [],
        learningStreak: 0,
        totalTimeSpent: 0,
        badges: [],
        level: 1,
        experiencePoints: 0
      });
    }
    return this.userProgress.get(userId)!;
  }

  private async validateCode(userCode: string, validationRule: string): Promise<boolean> {
    // Simplified validation logic
    switch (validationRule) {
      case 'contains-function':
        return userCode.includes('function') || userCode.includes('=>');
      case 'uses-state':
        return userCode.includes('useState');
      case 'exports-component':
        return userCode.includes('export') && (userCode.includes('function') || userCode.includes('const'));
      default:
        return true;
    }
  }

  private initializeKnowledgeBase(): void {
    // React knowledge base
    const reactTips: LearningTip[] = [
      {
        id: 'react-key-prop',
        type: 'best-practice',
        category: 'beginner',
        title: 'Always Use Key Props in Lists',
        description: 'When rendering lists of components, always provide a unique key prop for optimal performance',
        codeExample: {
          before: 'items.map(item => <div>{item.name}</div>)',
          after: 'items.map(item => <div key={item.id}>{item.name}</div>)',
          explanation: 'Keys help React identify which items have changed, been added, or removed'
        },
        relatedConcepts: ['Virtual DOM', 'Reconciliation', 'Performance'],
        resources: [
          {
            title: 'Lists and Keys - React Docs',
            url: 'https://react.dev/learn/rendering-lists',
            type: 'documentation'
          }
        ],
        framework: 'react'
      },
      {
        id: 'react-memo-usage',
        type: 'performance',
        category: 'intermediate',
        title: 'Use React.memo for Performance',
        description: 'Wrap components with React.memo to prevent unnecessary re-renders when props haven\'t changed',
        codeExample: {
          after: 'const MyComponent = React.memo(function MyComponent(props) {\n  return <div>{props.title}</div>;\n});',
          explanation: 'React.memo only re-renders if props change, improving performance'
        },
        relatedConcepts: ['Memoization', 'Re-renders', 'Optimization'],
        resources: [
          {
            title: 'React.memo API Reference',
            url: 'https://react.dev/reference/react/memo',
            type: 'documentation'
          }
        ],
        framework: 'react'
      }
    ];

    this.knowledgeBase.set('react', reactTips);
  }

  private initializeTutorials(): void {
    // React fundamentals tutorial
    const reactFundamentals: InteractiveTutorial = {
      id: 'react-fundamentals',
      title: 'React Fundamentals',
      description: 'Learn the core concepts of React including components, props, and state',
      difficulty: 'beginner',
      estimatedTime: '2 hours',
      framework: 'react',
      prerequisites: ['Basic JavaScript', 'HTML/CSS'],
      learningObjectives: ['Components', 'Props', 'State', 'Event Handling'],
      steps: [
        {
          id: 'create-component',
          title: 'Create Your First Component',
          instruction: 'Create a functional component called Welcome that accepts a name prop',
          codeToWrite: 'function Welcome({ name }) {\n  return <h1>Hello, {name}!</h1>;\n}\n\nexport default Welcome;',
          hints: [
            'Use the function keyword to declare a component',
            'Destructure the name prop from the parameter',
            'Use JSX to return the greeting'
          ],
          validation: {
            check: 'exports-component',
            errorMessage: 'Make sure to export your component',
            successMessage: 'Great! You created your first React component!'
          },
          explanation: 'Components are the building blocks of React applications. They are JavaScript functions that return JSX.'
        }
      ]
    };

    this.tutorials.set('react-fundamentals', reactFundamentals);
  }

  private initializeLearningPaths(): void {
    const beginnerReactPath: LearningPath = {
      id: 'beginner-react-path',
      title: 'React Beginner Path',
      description: 'Complete learning path for React beginners',
      framework: 'react',
      difficulty: 'beginner',
      estimatedTime: '8-12 hours',
      tutorials: ['react-fundamentals'],
      skills: ['Components', 'Props', 'State', 'Event Handling', 'Conditional Rendering'],
      completionRewards: ['React Beginner Badge', 'Foundation Certificate']
    };

    this.learningPaths.set('beginner-react-path', beginnerReactPath);
  }
}