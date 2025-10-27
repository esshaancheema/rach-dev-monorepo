import { FastifyRequest, FastifyReply } from 'fastify';
import { AIService } from '../services/ai.service';
import { logger } from '../utils/logger';
import { nanoid } from 'nanoid';

interface CodeGenerationRequest {
  prompt: string;
  language?: string;
  framework?: string;
  style?: 'function' | 'class' | 'module';
  context?: string;
  includeTests?: boolean;
  includeComments?: boolean;
  followConventions?: boolean;
}

interface CodeAnalysisRequest {
  code: string;
  language?: string;
  analysisType: 'review' | 'security' | 'performance' | 'bugs' | 'style';
  severity?: 'low' | 'medium' | 'high' | 'all';
  includeFixSuggestions?: boolean;
}

interface CodeOptimizationRequest {
  code: string;
  language?: string;
  optimizationType: 'performance' | 'readability' | 'memory' | 'maintainability';
  preserveFunctionality?: boolean;
}

interface CodeRefactorRequest {
  code: string;
  language?: string;
  refactorType: 'extract-function' | 'rename-variable' | 'simplify' | 'modernize';
  targetPattern?: string;
  newName?: string;
}

interface CodeExplanationRequest {
  code: string;
  language?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  includeExamples?: boolean;
}

interface TestGenerationRequest {
  code: string;
  language?: string;
  testFramework?: string;
  coverageLevel?: 'basic' | 'comprehensive' | 'edge-cases';
  includeSetup?: boolean;
  includeMocks?: boolean;
}

interface CodeConversionRequest {
  code: string;
  fromLanguage: string;
  toLanguage: string;
  preserveComments?: boolean;
  includeExplanation?: boolean;
}

export class CodeController {
  private aiService: AIService;

  constructor() {
    this.aiService = new AIService();
  }

  async generateCode(
    request: FastifyRequest<{ Body: CodeGenerationRequest }>,
    reply: FastifyReply
  ) {
    try {
      const userId = request.user!.id;
      const { 
        prompt, 
        language, 
        framework, 
        style, 
        context, 
        includeTests, 
        includeComments, 
        followConventions 
      } = request.body;

      // Build enhanced prompt with requirements
      let enhancedPrompt = prompt;
      
      if (includeTests) {
        enhancedPrompt += '\n\nPlease also generate comprehensive unit tests for this code.';
      }
      
      if (!includeComments) {
        enhancedPrompt += '\n\nGenerate code without comments.';
      }
      
      if (followConventions) {
        enhancedPrompt += '\n\nEnsure the code follows industry best practices and conventions.';
      }

      const result = await this.aiService.generateCode({
        userId,
        prompt: enhancedPrompt,
        language,
        framework,
        style,
        context,
      });

      // Parse the generated code to extract components
      const codeContent = this.extractCodeFromResponse(result.content);
      const explanation = this.extractExplanationFromResponse(result.content);
      const tests = includeTests ? this.extractTestsFromResponse(result.content) : undefined;

      return reply.code(200).send({
        success: true,
        data: {
          id: `code_gen_${nanoid()}`,
          code: codeContent,
          language: language || 'auto-detected',
          explanation,
          tests,
          model: result.model,
          usage: result.usage,
          createdAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      logger.error({ error, userId: request.user?.id }, 'Failed to generate code');
      
      return reply.code(500).send({
        success: false,
        error: 'Failed to generate code',
      });
    }
  }

  async analyzeCode(
    request: FastifyRequest<{ Body: CodeAnalysisRequest }>,
    reply: FastifyReply
  ) {
    try {
      const userId = request.user!.id;
      const { code, language, analysisType, severity, includeFixSuggestions } = request.body;

      // Build analysis prompt
      let analysisPrompt = `Please analyze this ${language || ''} code for ${analysisType} issues`;
      
      if (severity && severity !== 'all') {
        analysisPrompt += ` with ${severity} severity or higher`;
      }
      
      if (includeFixSuggestions) {
        analysisPrompt += '. Include specific fix suggestions for each issue found';
      }
      
      analysisPrompt += `:\n\n\`\`\`${language || ''}\n${code}\n\`\`\``;

      const result = await this.aiService.analyzeCode({
        userId,
        code,
        language,
        analysisType,
      });

      // Parse analysis response
      const issues = this.parseIssuesFromAnalysis(result.content);
      const summary = this.generateIssueSummary(issues);

      return reply.code(200).send({
        success: true,
        data: {
          id: `code_analysis_${nanoid()}`,
          analysis: result.content,
          issues,
          summary,
          model: result.model,
          usage: { totalTokens: result.usage.totalTokens },
          createdAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      logger.error({ error, userId: request.user?.id }, 'Failed to analyze code');
      
      return reply.code(500).send({
        success: false,
        error: 'Failed to analyze code',
      });
    }
  }

  async optimizeCode(
    request: FastifyRequest<{ Body: CodeOptimizationRequest }>,
    reply: FastifyReply
  ) {
    try {
      const userId = request.user!.id;
      const { code, language, optimizationType, preserveFunctionality } = request.body;

      const optimizationPrompt = `Please optimize this ${language || ''} code for ${optimizationType}${
        preserveFunctionality ? ' while preserving all functionality' : ''
      }. Provide the optimized code and explain the changes made:\n\n\`\`\`${language || ''}\n${code}\n\`\`\``;

      const result = await this.aiService.createChatCompletion({
        userId,
        messages: [
          {
            role: 'system',
            content: `You are an expert code optimizer. Focus on ${optimizationType} optimization techniques.`,
          },
          {
            role: 'user',
            content: optimizationPrompt,
          },
        ],
        model: 'gpt-4',
        temperature: 0.1,
      });

      const optimizedCode = this.extractCodeFromResponse(result.content);
      const changes = this.extractChangesFromResponse(result.content);
      const explanation = this.extractExplanationFromResponse(result.content);

      return reply.code(200).send({
        success: true,
        data: {
          id: `code_opt_${nanoid()}`,
          originalCode: code,
          optimizedCode,
          changes,
          explanation,
          model: result.model,
          usage: { totalTokens: result.usage.totalTokens },
          createdAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      logger.error({ error, userId: request.user?.id }, 'Failed to optimize code');
      
      return reply.code(500).send({
        success: false,
        error: 'Failed to optimize code',
      });
    }
  }

  async refactorCode(
    request: FastifyRequest<{ Body: CodeRefactorRequest }>,
    reply: FastifyReply
  ) {
    try {
      const userId = request.user!.id;
      const { code, language, refactorType, targetPattern, newName } = request.body;

      let refactorPrompt = `Please refactor this ${language || ''} code using ${refactorType}`;
      
      if (targetPattern) {
        refactorPrompt += ` targeting pattern: ${targetPattern}`;
      }
      
      if (newName) {
        refactorPrompt += ` with new name: ${newName}`;
      }
      
      refactorPrompt += `:\n\n\`\`\`${language || ''}\n${code}\n\`\`\``;

      const result = await this.aiService.createChatCompletion({
        userId,
        messages: [
          {
            role: 'system',
            content: 'You are an expert code refactoring assistant. Provide clean, maintainable refactored code.',
          },
          {
            role: 'user',
            content: refactorPrompt,
          },
        ],
        model: 'gpt-4',
        temperature: 0.1,
      });

      const refactoredCode = this.extractCodeFromResponse(result.content);
      const changes = this.extractRefactorChanges(result.content);
      const explanation = this.extractExplanationFromResponse(result.content);

      return reply.code(200).send({
        success: true,
        data: {
          id: `code_refactor_${nanoid()}`,
          originalCode: code,
          refactoredCode,
          changes,
          explanation,
          model: result.model,
          usage: { totalTokens: result.usage.totalTokens },
          createdAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      logger.error({ error, userId: request.user?.id }, 'Failed to refactor code');
      
      return reply.code(500).send({
        success: false,
        error: 'Failed to refactor code',
      });
    }
  }

  async explainCode(
    request: FastifyRequest<{ Body: CodeExplanationRequest }>,
    reply: FastifyReply
  ) {
    try {
      const userId = request.user!.id;
      const { code, language, level, includeExamples } = request.body;

      let explanationPrompt = `Please explain this ${language || ''} code at a ${level || 'intermediate'} level`;
      
      if (includeExamples) {
        explanationPrompt += ' and include practical examples of usage';
      }
      
      explanationPrompt += `:\n\n\`\`\`${language || ''}\n${code}\n\`\`\``;

      const result = await this.aiService.createChatCompletion({
        userId,
        messages: [
          {
            role: 'system',
            content: `You are a code explanation expert. Explain code clearly for ${level || 'intermediate'} developers.`,
          },
          {
            role: 'user',
            content: explanationPrompt,
          },
        ],
        model: 'gpt-4',
        temperature: 0.2,
      });

      const explanation = result.content;
      const concepts = this.extractConceptsFromExplanation(explanation);
      const complexity = this.assessCodeComplexity(code);
      const examples = includeExamples ? this.extractExamplesFromExplanation(explanation) : undefined;

      return reply.code(200).send({
        success: true,
        data: {
          id: `code_explain_${nanoid()}`,
          explanation,
          concepts,
          complexity,
          examples,
          model: result.model,
          usage: { totalTokens: result.usage.totalTokens },
          createdAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      logger.error({ error, userId: request.user?.id }, 'Failed to explain code');
      
      return reply.code(500).send({
        success: false,
        error: 'Failed to explain code',
      });
    }
  }

  async generateTests(
    request: FastifyRequest<{ Body: TestGenerationRequest }>,
    reply: FastifyReply
  ) {
    try {
      const userId = request.user!.id;
      const { code, language, testFramework, coverageLevel, includeSetup, includeMocks } = request.body;

      let testPrompt = `Generate ${coverageLevel || 'comprehensive'} unit tests for this ${language || ''} code`;
      
      if (testFramework) {
        testPrompt += ` using ${testFramework}`;
      }
      
      if (includeSetup) {
        testPrompt += '. Include test setup and teardown';
      }
      
      if (includeMocks) {
        testPrompt += '. Include mocks for dependencies';
      }
      
      testPrompt += `:\n\n\`\`\`${language || ''}\n${code}\n\`\`\``;

      const result = await this.aiService.createChatCompletion({
        userId,
        messages: [
          {
            role: 'system',
            content: 'You are a test generation expert. Create comprehensive, well-structured unit tests.',
          },
          {
            role: 'user',
            content: testPrompt,
          },
        ],
        model: 'gpt-4',
        temperature: 0.1,
      });

      const tests = this.extractCodeFromResponse(result.content);
      const setup = includeSetup ? this.extractSetupFromResponse(result.content) : undefined;
      const coverage = this.estimateTestCoverage(tests);
      const testCases = this.extractTestCases(tests);

      return reply.code(200).send({
        success: true,
        data: {
          id: `test_gen_${nanoid()}`,
          tests,
          setup,
          coverage,
          testCases,
          model: result.model,
          usage: { totalTokens: result.usage.totalTokens },
          createdAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      logger.error({ error, userId: request.user?.id }, 'Failed to generate tests');
      
      return reply.code(500).send({
        success: false,
        error: 'Failed to generate tests',
      });
    }
  }

  async convertCode(
    request: FastifyRequest<{ Body: CodeConversionRequest }>,
    reply: FastifyReply
  ) {
    try {
      const userId = request.user!.id;
      const { code, fromLanguage, toLanguage, preserveComments, includeExplanation } = request.body;

      let conversionPrompt = `Convert this ${fromLanguage} code to ${toLanguage}`;
      
      if (preserveComments) {
        conversionPrompt += ', preserving all comments';
      }
      
      if (includeExplanation) {
        conversionPrompt += ', and explain the conversion process';
      }
      
      conversionPrompt += `:\n\n\`\`\`${fromLanguage}\n${code}\n\`\`\``;

      const result = await this.aiService.createChatCompletion({
        userId,
        messages: [
          {
            role: 'system',
            content: `You are a code conversion expert. Convert code accurately between programming languages while maintaining functionality.`,
          },
          {
            role: 'user',
            content: conversionPrompt,
          },
        ],
        model: 'gpt-4',
        temperature: 0.1,
      });

      const convertedCode = this.extractCodeFromResponse(result.content);
      const conversionNotes = this.extractConversionNotes(result.content);
      const explanation = includeExplanation ? this.extractExplanationFromResponse(result.content) : undefined;

      return reply.code(200).send({
        success: true,
        data: {
          id: `code_convert_${nanoid()}`,
          originalCode: code,
          convertedCode,
          conversionNotes,
          explanation,
          model: result.model,
          usage: { totalTokens: result.usage.totalTokens },
          createdAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      logger.error({ error, userId: request.user?.id }, 'Failed to convert code');
      
      return reply.code(500).send({
        success: false,
        error: 'Failed to convert code',
      });
    }
  }

  async getSupportedLanguages(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const languages = [
        {
          id: 'javascript',
          name: 'JavaScript',
          extensions: ['.js', '.mjs', '.cjs'],
          frameworks: ['React', 'Vue', 'Angular', 'Node.js', 'Express', 'Next.js'],
          testFrameworks: ['Jest', 'Mocha', 'Cypress', 'Vitest'],
        },
        {
          id: 'typescript',
          name: 'TypeScript',
          extensions: ['.ts', '.tsx'],
          frameworks: ['React', 'Vue', 'Angular', 'Node.js', 'Express', 'Next.js'],
          testFrameworks: ['Jest', 'Mocha', 'Cypress', 'Vitest'],
        },
        {
          id: 'python',
          name: 'Python',
          extensions: ['.py', '.pyw'],
          frameworks: ['Django', 'Flask', 'FastAPI', 'Pandas', 'NumPy'],
          testFrameworks: ['pytest', 'unittest', 'nose2'],
        },
        {
          id: 'java',
          name: 'Java',
          extensions: ['.java'],
          frameworks: ['Spring', 'Spring Boot', 'Hibernate', 'Maven', 'Gradle'],
          testFrameworks: ['JUnit', 'TestNG', 'Mockito'],
        },
        {
          id: 'csharp',
          name: 'C#',
          extensions: ['.cs'],
          frameworks: ['.NET', 'ASP.NET', 'Entity Framework', 'Blazor'],
          testFrameworks: ['NUnit', 'xUnit', 'MSTest'],
        },
        {
          id: 'go',
          name: 'Go',
          extensions: ['.go'],
          frameworks: ['Gin', 'Echo', 'Fiber', 'GORM'],
          testFrameworks: ['testing', 'Testify', 'Ginkgo'],
        },
        {
          id: 'rust',
          name: 'Rust',
          extensions: ['.rs'],
          frameworks: ['Actix', 'Tokio', 'Serde', 'Diesel'],
          testFrameworks: ['cargo test', 'proptest'],
        },
        {
          id: 'cpp',
          name: 'C++',
          extensions: ['.cpp', '.cc', '.cxx'],
          frameworks: ['Qt', 'Boost', 'POCO'],
          testFrameworks: ['Google Test', 'Catch2', 'Boost.Test'],
        },
      ];

      return reply.code(200).send({
        success: true,
        data: { languages },
      });
    } catch (error) {
      logger.error({ error }, 'Failed to get supported languages');
      
      return reply.code(500).send({
        success: false,
        error: 'Failed to get supported languages',
      });
    }
  }

  // Helper methods for parsing AI responses
  private extractCodeFromResponse(response: string): string {
    const codeBlockRegex = /```[\w]*\n([\s\S]*?)\n```/g;
    const matches = Array.from(response.matchAll(codeBlockRegex));
    
    if (matches.length > 0) {
      return matches[0][1];
    }
    
    // Fallback: look for inline code
    const inlineCodeRegex = /`([^`]+)`/g;
    const inlineMatches = Array.from(response.matchAll(inlineCodeRegex));
    
    if (inlineMatches.length > 0) {
      return inlineMatches.map(match => match[1]).join('\n');
    }
    
    return response;
  }

  private extractExplanationFromResponse(response: string): string {
    // Remove code blocks and return the remaining text
    return response.replace(/```[\s\S]*?```/g, '').trim();
  }

  private extractTestsFromResponse(response: string): string | undefined {
    const testBlockRegex = /(?:test|spec|Test)[\s\S]*?```[\w]*\n([\s\S]*?)\n```/gi;
    const matches = Array.from(response.matchAll(testBlockRegex));
    
    if (matches.length > 0) {
      return matches[0][1];
    }
    
    return undefined;
  }

  private parseIssuesFromAnalysis(analysis: string): Array<{
    type: string;
    severity: string;
    line?: number;
    message: string;
    suggestion?: string;
  }> {
    // Basic parsing - in production, this would be more sophisticated
    const issues: Array<any> = [];
    const lines = analysis.split('\n');
    
    for (const line of lines) {
      if (line.includes('WARNING') || line.includes('ERROR') || line.includes('ISSUE')) {
        issues.push({
          type: 'general',
          severity: line.includes('ERROR') ? 'high' : 'medium',
          message: line.trim(),
          suggestion: 'Please review this issue',
        });
      }
    }
    
    return issues;
  }

  private generateIssueSummary(issues: Array<any>): {
    totalIssues: number;
    bySeverity: Record<string, number>;
    byType: Record<string, number>;
  } {
    const summary = {
      totalIssues: issues.length,
      bySeverity: {} as Record<string, number>,
      byType: {} as Record<string, number>,
    };
    
    for (const issue of issues) {
      summary.bySeverity[issue.severity] = (summary.bySeverity[issue.severity] || 0) + 1;
      summary.byType[issue.type] = (summary.byType[issue.type] || 0) + 1;
    }
    
    return summary;
  }

  private extractChangesFromResponse(response: string): Array<{
    type: string;
    description: string;
    impact: string;
  }> {
    // Basic parsing for optimization changes
    return [
      {
        type: 'optimization',
        description: 'Code has been optimized',
        impact: 'Improved performance',
      },
    ];
  }

  private extractRefactorChanges(response: string): Array<{
    type: string;
    description: string;
    rationale: string;
  }> {
    return [
      {
        type: 'refactor',
        description: 'Code has been refactored',
        rationale: 'Improved code structure and maintainability',
      },
    ];
  }

  private extractConceptsFromExplanation(explanation: string): string[] {
    // Extract key programming concepts mentioned
    const concepts = [];
    const commonConcepts = [
      'functions', 'variables', 'loops', 'conditionals', 'classes', 'objects',
      'arrays', 'promises', 'async/await', 'closures', 'inheritance', 'polymorphism'
    ];
    
    for (const concept of commonConcepts) {
      if (explanation.toLowerCase().includes(concept)) {
        concepts.push(concept);
      }
    }
    
    return concepts;
  }

  private assessCodeComplexity(code: string): 'low' | 'medium' | 'high' {
    const lines = code.split('\n').length;
    const cyclomaticIndicators = (code.match(/if|for|while|switch|catch/g) || []).length;
    
    if (lines < 20 && cyclomaticIndicators < 3) return 'low';
    if (lines < 100 && cyclomaticIndicators < 10) return 'medium';
    return 'high';
  }

  private extractExamplesFromExplanation(explanation: string): Array<{
    title: string;
    code: string;
    explanation: string;
  }> | undefined {
    // Basic example extraction
    const examples = [];
    const exampleRegex = /Example[\s\S]*?```[\w]*\n([\s\S]*?)\n```/gi;
    const matches = Array.from(explanation.matchAll(exampleRegex));
    
    for (const match of matches) {
      examples.push({
        title: 'Code Example',
        code: match[1],
        explanation: 'Example usage',
      });
    }
    
    return examples.length > 0 ? examples : undefined;
  }

  private extractSetupFromResponse(response: string): string | undefined {
    const setupRegex = /setup[\s\S]*?```[\w]*\n([\s\S]*?)\n```/gi;
    const matches = Array.from(response.matchAll(setupRegex));
    
    return matches.length > 0 ? matches[0][1] : undefined;
  }

  private estimateTestCoverage(tests: string): {
    functions: number;
    branches: number;
    lines: number;
  } {
    // Basic coverage estimation
    const testMethods = (tests.match(/test|it\(/g) || []).length;
    
    return {
      functions: Math.min(testMethods * 20, 100),
      branches: Math.min(testMethods * 15, 100),
      lines: Math.min(testMethods * 25, 100),
    };
  }

  private extractTestCases(tests: string): Array<{
    name: string;
    type: string;
    description: string;
  }> {
    const testCases = [];
    const testRegex = /test|it\(['"`]([^'"`]+)['"`]/g;
    const matches = Array.from(tests.matchAll(testRegex));
    
    for (const match of matches) {
      testCases.push({
        name: match[1],
        type: 'unit',
        description: `Test case: ${match[1]}`,
      });
    }
    
    return testCases;
  }

  private extractConversionNotes(response: string): Array<{
    type: string;
    message: string;
    line?: number;
  }> {
    return [
      {
        type: 'conversion',
        message: 'Code has been converted successfully',
      },
    ];
  }
}