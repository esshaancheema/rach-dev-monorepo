import { z } from 'zod';
import { spawn } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Schema definitions for type safety (preserved from original)
export const GenerationOptionsSchema = z.object({
  framework: z.enum(['react', 'vue', 'vanilla', 'svelte', 'angular']),
  complexity: z.enum(['simple', 'moderate', 'advanced']),
  features: z.array(z.string()).optional(),
  context: z.array(z.any()).optional(),
  stylePreference: z.enum(['tailwind', 'css-modules', 'styled-components', 'vanilla-css']).optional()
});

export type GenerationOptions = z.infer<typeof GenerationOptionsSchema>;

export interface GenerationResult {
  code: string;
  framework: string;
  description: string;
  features: string[];
  dependencies: Record<string, string>;
  usage: string;
  confidence: number;
  files?: Array<{
    name: string;
    content: string;
    type: 'component' | 'style' | 'config' | 'readme';
  }>;
}

export interface AIPromptContext {
  userPrompt: string;
  framework: string;
  complexity: string;
  features: string[];
  previousApps?: Array<{
    prompt: string;
    framework: string;
    features: string[];
  }>;
}

export class ZoptalCodeGenerator {
  private aiApiKey?: string;
  private aiProvider: 'openai' | 'anthropic' | 'claude-code' = 'claude-code';
  private workspaceBase: string;

  constructor(options?: {
    aiApiKey?: string;
    aiProvider?: 'openai' | 'anthropic' | 'claude-code';
  }) {
    this.aiApiKey = options?.aiApiKey || process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY;
    
    // Debug logging for provider detection
    console.log('🔧 ZoptalCodeGenerator (Claude Code SDK):', {
      hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
      anthropicKeyPreview: process.env.ANTHROPIC_API_KEY ? process.env.ANTHROPIC_API_KEY.substring(0, 10) + '...' : 'none',
      finalApiKey: this.aiApiKey ? this.aiApiKey.substring(0, 10) + '...' : 'none',
    });
    
    // Auto-detect best available provider
    if (!options?.aiProvider) {
      if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.startsWith('sk-ant-')) {
        this.aiProvider = 'claude-code';
        console.log('✅ Provider detected: CLAUDE-CODE (Anthropic)');
      } else if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-proj-')) {
        this.aiProvider = 'openai';
        console.log('✅ Provider detected: OPENAI (fallback to legacy)');
      } else {
        this.aiProvider = 'claude-code';
        console.log('⚠️ Provider detected: CLAUDE-CODE (no valid API keys - will fail)');
      }
    } else {
      this.aiProvider = options.aiProvider;
      console.log('✅ Provider set manually:', options.aiProvider);
    }
    
    console.log('🚀 Final AI Provider:', this.aiProvider, 'API Key Available:', !!this.aiApiKey);
    
    // Set up workspace directory
    this.workspaceBase = path.join('/tmp', 'zoptal-claude-code');
  }

  public async generateFullApp(
    prompt: string, 
    options: GenerationOptions
  ): Promise<GenerationResult> {
    try {
      // Validate input
      const validatedOptions = GenerationOptionsSchema.parse(options);
      
      // Prepare AI context
      const context = this.prepareAIContext(prompt, validatedOptions);
      
      console.log('🤖 Generation Strategy Decision:', {
        provider: this.aiProvider,
        hasApiKey: !!this.aiApiKey,
        willUseClaudeCode: this.aiProvider === 'claude-code' && !!this.aiApiKey,
        prompt: context.userPrompt.substring(0, 50) + '...'
      });
      
      // Use Claude Code SDK for reliable generation
      if (this.aiProvider === 'claude-code' && this.aiApiKey) {
        console.log('🚀 Using Claude Code SDK generation');
        return await this.generateWithClaudeCode(context);
      } else {
        console.log('⚠️ Falling back to legacy generation due to missing API key');
        return await this.generateFallback(context);
      }

    } catch (error) {
      console.error('Code generation error:', error);
      
      // Fallback to simple response if everything fails
      const context = this.prepareAIContext(prompt, options);
      return this.generateFallback(context);
    }
  }

  private prepareAIContext(prompt: string, options: GenerationOptions): AIPromptContext {
    return {
      userPrompt: prompt,
      framework: options.framework,
      complexity: options.complexity,
      features: options.features || [],
      previousApps: options.context || []
    };
  }

  private async generateWithClaudeCode(context: AIPromptContext): Promise<GenerationResult> {
    try {
      console.log('🚀 Using enhanced Anthropic API generation');
      
      // Build system and user prompts
      const systemPrompt = this.buildEnhancedSystemPrompt(context);
      const userPrompt = this.buildEnhancedUserPrompt(context);
      
      console.log('🎯 Sending enhanced prompt to Anthropic API:', {
        systemPromptLength: systemPrompt.length,
        userPromptLength: userPrompt.length,
        framework: context.framework,
        complexity: context.complexity,
        featuresCount: context.features.length
      });
      
      // Call Anthropic API directly (more reliable than SDK)
      const anthropicKey = process.env.ANTHROPIC_API_KEY || this.aiApiKey;
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': anthropicKey!,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 4000,
          system: systemPrompt,
          messages: [
            { role: 'user', content: userPrompt }
          ]
        })
      });

      if (!response.ok) {
        let errorData = null;
        let rawErrorText = '';

        try {
          rawErrorText = await response.text();
          errorData = JSON.parse(rawErrorText);
        } catch (parseError) {
          console.warn('⚠️ Could not parse error response as JSON:', parseError);
          errorData = { raw_error: rawErrorText };
        }

        console.error('❌ Anthropic API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          rawError: rawErrorText.substring(0, 500)
        });

        // Provide more specific error messages
        if (response.status === 400) {
          throw new Error(`Bad Request: ${errorData?.error?.message || 'Invalid request format'}`);
        } else if (response.status === 401) {
          throw new Error('Authentication failed: Invalid API key');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded: Please try again later');
        } else {
          throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
        }
      }

      let data;
      const responseText = await response.text();

      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('❌ Failed to parse Anthropic API response as JSON:', {
          error: jsonError,
          responsePreview: responseText.substring(0, 500)
        });
        throw new Error('Invalid JSON response from Anthropic API');
      }

      console.log('✅ Anthropic API Success:', {
        model: data.model,
        contentLength: data.content?.[0]?.text?.length || 0,
        usage: data.usage,
        hasValidContent: !!(data.content?.[0]?.text)
      });

      // Validate that we have content
      if (!data.content?.[0]?.text) {
        console.error('❌ Anthropic API returned no content:', data);
        throw new Error('No content received from Anthropic API');
      }
      
      // Parse the AI response into structured format
      const aiResponseText = this.preprocessAIResponse(data.content[0].text);
      return this.parseEnhancedAIResponse(aiResponseText, context);
      
    } catch (error) {
      console.error('❌ Enhanced Anthropic generation failed:', error);
      
      // Fallback to simple generation
      return this.generateFallback(context);
    }
  }

  private buildEnhancedSystemPrompt(context: AIPromptContext): string {
    const { framework, complexity, features } = context;
    
    return `You are an expert ${framework} developer who creates complete, functional web applications.

RESPONSE FORMAT REQUIREMENT:
You MUST respond with a JSON object in this exact format:

{
  "description": "Brief description of the application",
  "features": ["feature1", "feature2", "feature3"],
  "dependencies": {"package": "version"},
  "files": [
    {
      "name": "index.html",
      "content": "complete HTML code here",
      "type": "component"
    },
    {
      "name": "script.js",
      "content": "complete JavaScript code here", 
      "type": "component"
    },
    {
      "name": "style.css",
      "content": "complete CSS code here",
      "type": "style"
    }
  ]
}

DEVELOPMENT GUIDELINES:
- Framework: ${framework}
- Complexity: ${complexity}
- Required Features: ${features.join(', ') || 'basic functionality'}
- Use modern best practices and clean code
- Include proper error handling and user feedback
- Make it responsive and accessible
- Add helpful comments explaining key functionality
- Ensure all code is self-contained and runnable

CRITICAL QUALITY REQUIREMENTS:
- ALL JavaScript must be syntactically correct with proper quotes around strings
- ALL getElementById calls must use quotes: getElementById('element-id')
- ALL HTML onclick handlers must reference functions that exist in JavaScript
- HTML file references to CSS/JS must EXACTLY match generated filenames
- CSS imports in JavaScript must match the actual CSS filename exactly
- Test all event handlers work correctly
- Ensure all referenced functions are defined and callable

${this.getFrameworkSpecificInstructions(framework)}

IMPORTANT: Return ONLY the JSON object. No additional text before or after.`;
  }

  private buildEnhancedUserPrompt(context: AIPromptContext): string {
    return `Create a complete, functional ${context.framework} application: ${context.userPrompt}

Requirements:
- Create a polished, professional application
- Include all necessary HTML, CSS, and JavaScript
- Ensure the application actually works as requested
- Use modern, clean code with proper structure
- Include responsive design and good user experience

Generate the complete application files now.`;
  }

  private parseEnhancedAIResponse(response: string, context: AIPromptContext): GenerationResult {
    try {
      console.log('🔍 Parsing Enhanced AI Response:', {
        responseLength: response.length,
        preview: response.substring(0, 200) + '...'
      });

      // Clean up the response to extract JSON
      let jsonContent = response.trim();

      // Remove markdown code blocks if present
      if (jsonContent.startsWith('```json')) {
        jsonContent = jsonContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonContent.startsWith('```')) {
        jsonContent = jsonContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      // Sanitize Unicode and fix common JSON issues
      jsonContent = this.sanitizeJsonString(jsonContent);

      // Parse the JSON with error handling
      const parsed = JSON.parse(jsonContent);
      
      if (parsed && parsed.files && Array.isArray(parsed.files)) {
        console.log('✅ Successfully parsed enhanced AI response:', {
          filesCount: parsed.files.length,
          fileNames: parsed.files.map((f: any) => f.name),
          description: parsed.description
        });

        // Find main file for the code property
        const mainFile = parsed.files.find((f: any) => 
          f.name === 'index.html' || 
          f.name === 'App.jsx' || 
          f.name === 'App.vue'
        );

        // Validate and fix generated code
        const validatedFiles = this.validateAndFixCode(parsed.files);

        return {
          code: mainFile ? mainFile.content : validatedFiles[0]?.content || '',
          framework: context.framework,
          description: parsed.description || `A ${context.framework} application`,
          features: parsed.features || context.features,
          dependencies: parsed.dependencies || {},
          usage: this.generateUsageInstructions(context.framework),
          confidence: 0.95, // High confidence for enhanced AI results
          files: validatedFiles.map((f: any) => ({
            name: f.name,
            content: f.content,
            type: f.type as 'component' | 'style' | 'config' | 'readme'
          }))
        };
      }
      
      throw new Error('Invalid AI response format - missing files array');
      
    } catch (error) {
      console.error('❌ Error parsing enhanced AI response:', error, {
        responsePreview: response.substring(0, 500),
        errorMessage: error instanceof Error ? error.message : String(error)
      });

      // Try alternative parsing approaches before complete fallback
      const fallbackResult = this.tryAlternativeJsonParsing(response, context);
      if (fallbackResult) {
        return fallbackResult;
      }

      // Fallback to simple parsing if JSON parsing fails
      return this.generateFallback(context);
    }
  }

  private preprocessAIResponse(responseText: string): string {
    try {
      console.log('🔧 Preprocessing AI response for potential issues:', {
        length: responseText.length,
        containsSurrogates: /\\u[dD][89aAbBcCdDeEfF]/.test(responseText),
        containsControlChars: /[\x00-\x1F]/.test(responseText)
      });

      // Basic preprocessing to handle common issues before JSON parsing
      const processed = responseText
        // Replace common problematic sequences
        .replace(/\uFEFF/g, '') // Remove BOM
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '') // Remove control characters
        // Normalize line endings
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        // Fix some common encoding issues
        .replace(/â€™/g, "'") // Smart apostrophe
        .replace(/â€œ/g, '"') // Smart quote left
        .replace(/â€\x9D/g, '"') // Smart quote right
        .replace(/â€"/g, '—'); // Em dash

      return processed;
    } catch (error) {
      console.warn('⚠️ Error during AI response preprocessing:', error);
      return responseText;
    }
  }

  private sanitizeJsonString(jsonContent: string): string {
    try {
      // Fix common Unicode issues that cause "no low surrogate" errors

      // 1. Replace unescaped surrogate pairs and invalid Unicode
      let sanitized = jsonContent
        // Fix lone surrogates (high surrogates without low surrogates)
        .replace(/\\u[dD][89aAbBcCdDeEfF][\da-fA-F]{2}(?!\\u[dD][c-fC-F][\da-fA-F]{2})/g, '\\uFFFD')
        // Fix lone low surrogates
        .replace(/(?<!\\u[dD][89aAbBcCdDeEfF][\da-fA-F]{2})\\u[dD][c-fC-F][\da-fA-F]{2}/g, '\\uFFFD')
        // Replace invalid Unicode code points
        .replace(/\\u[fF]{4}/g, '\\uFFFD')
        // Fix common escape sequence issues
        .replace(/\\(?!["\\/bfnrt]|u[0-9a-fA-F]{4})/g, '\\\\');

      // 2. Remove or replace problematic characters that can break JSON
      sanitized = sanitized
        // Remove control characters except allowed ones (tab, newline, carriage return)
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
        // Fix unescaped quotes in strings
        .replace(/([^\\])"([^"]*[^\\])"(?=\s*[,}\]])/g, '$1\\"$2\\"')
        // Fix trailing commas in objects and arrays
        .replace(/,(\s*[}\]])/g, '$1')
        // Fix multiple consecutive commas
        .replace(/,+/g, ',');

      // 3. Attempt to fix common JSON structural issues
      sanitized = sanitized
        // Fix missing quotes around object keys
        .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":')
        // Fix single quotes to double quotes
        .replace(/'/g, '"')
        // Fix trailing commas before closing braces/brackets
        .replace(/,(\s*[}\]])/g, '$1');

      console.log('🧹 Sanitized JSON content:', {
        originalLength: jsonContent.length,
        sanitizedLength: sanitized.length,
        changesDetected: jsonContent !== sanitized
      });

      return sanitized;

    } catch (error) {
      console.warn('⚠️ Error during JSON sanitization, using original content:', error);
      return jsonContent;
    }
  }

  private tryAlternativeJsonParsing(response: string, context: AIPromptContext): GenerationResult | null {
    const attempts = [
      // Attempt 1: Try parsing just the first complete JSON object
      () => {
        const match = response.match(/\{[\s\S]*\}/);
        if (match) {
          const jsonStr = this.sanitizeJsonString(match[0]);
          return JSON.parse(jsonStr);
        }
        throw new Error('No JSON object found');
      },

      // Attempt 2: Try removing everything after the last complete object
      () => {
        let depth = 0;
        let lastCompleteEnd = -1;
        const sanitized = this.sanitizeJsonString(response.trim());

        for (let i = 0; i < sanitized.length; i++) {
          if (sanitized[i] === '{') depth++;
          else if (sanitized[i] === '}') {
            depth--;
            if (depth === 0) lastCompleteEnd = i + 1;
          }
        }

        if (lastCompleteEnd > 0) {
          return JSON.parse(sanitized.substring(0, lastCompleteEnd));
        }
        throw new Error('No complete JSON object found');
      },

      // Attempt 3: Try extracting JSON from code blocks more aggressively
      () => {
        const codeBlockMatch = response.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
        if (codeBlockMatch) {
          return JSON.parse(this.sanitizeJsonString(codeBlockMatch[1]));
        }
        throw new Error('No JSON in code blocks found');
      }
    ];

    for (let i = 0; i < attempts.length; i++) {
      try {
        console.log(`🔄 Trying alternative JSON parsing approach ${i + 1}`);
        const parsed = attempts[i]();

        if (parsed && (parsed.files || parsed.code || parsed.description)) {
          console.log(`✅ Alternative parsing approach ${i + 1} succeeded`);

          // Process the successfully parsed result
          return this.processAlternativeParseResult(parsed, context);
        }
      } catch (error) {
        console.log(`❌ Alternative parsing approach ${i + 1} failed:`, error instanceof Error ? error.message : String(error));
      }
    }

    console.log('❌ All alternative parsing approaches failed');
    return null;
  }

  private processAlternativeParseResult(parsed: any, context: AIPromptContext): GenerationResult {
    // Ensure we have the expected structure
    const files = parsed.files || [];
    const description = parsed.description || `A ${context.framework} application`;
    const features = parsed.features || context.features;
    const dependencies = parsed.dependencies || {};

    // Find main file
    const mainFile = files.find((f: any) =>
      f.name === 'index.html' ||
      f.name === 'App.jsx' ||
      f.name === 'App.vue'
    );

    // Validate and fix generated code
    const validatedFiles = files.length > 0 ? this.validateAndFixCode(files) : [];

    return {
      code: mainFile ? mainFile.content : validatedFiles[0]?.content || parsed.code || '',
      framework: context.framework,
      description: description,
      features: Array.isArray(features) ? features : [features || 'basic functionality'],
      dependencies: dependencies,
      usage: this.generateUsageInstructions(context.framework),
      confidence: 0.8, // Lower confidence for alternative parsing
      files: validatedFiles.map((f: any) => ({
        name: f.name,
        content: f.content,
        type: f.type as 'component' | 'style' | 'config' | 'readme'
      }))
    };
  }

  private buildClaudeCodePrompt(context: AIPromptContext): string {
    const { userPrompt, framework, complexity, features } = context;
    
    return `You are an expert ${framework} developer. Create a complete, functional ${framework} application based on this request:

REQUEST: ${userPrompt}

REQUIREMENTS:
- Framework: ${framework}
- Complexity: ${complexity}
- Features: ${features.join(', ') || 'basic functionality'}

INSTRUCTIONS:
1. Create a complete working application with proper file structure
2. Use modern best practices and clean code
3. Include proper error handling and user feedback
4. Make it responsive and accessible
5. Add helpful comments explaining key functionality
6. Ensure all imports and dependencies are correct

For ${framework} applications:
${this.getFrameworkSpecificInstructions(framework)}

Create all necessary files (HTML, CSS, JavaScript, package.json, README, etc.) to make this a complete, runnable application.
Focus on creating a polished, professional application that demonstrates real functionality.`;
  }

  private getFrameworkSpecificInstructions(framework: string): string {
    switch (framework) {
      case 'react':
        return `- Use React 18 with hooks (useState, useEffect, etc.)
- Include TypeScript if beneficial
- Use modern CSS or Tailwind for styling
- Structure components logically
- Include proper prop types or TypeScript interfaces`;
      
      case 'vue':
        return `- Use Vue 3 with Composition API
- Structure as single-file components where appropriate
- Use reactive refs and computed properties
- Include proper TypeScript if beneficial
- Use modern CSS or Vue styling solutions`;
      
      case 'vanilla':
        return `- Use modern JavaScript (ES6+) with proper syntax
- ALL getElementById calls MUST use quotes: getElementById('element-id')  
- ALL addEventListener calls MUST use quotes: addEventListener('click', handler)
- Define ALL functions referenced in HTML onclick handlers
- Use semantic HTML and modern CSS with proper styling
- Include proper error handling and user feedback
- Ensure all DOM elements exist before accessing them
- Use const/let instead of var
- Include comprehensive event handling
- Make the application fully interactive and functional`;
      
      default:
        return `- Follow ${framework} best practices
- Use modern development patterns
- Ensure proper code organization`;
    }
  }

  private async executeClaudeCode(prompt: string, workspaceDir: string): Promise<Array<{ name: string; content: string; type: string }>> {
    return new Promise((resolve, reject) => {
      console.log('🏃 Starting Claude Code SDK process...');
      
      // Spawn Claude Code process
      const claudeProcess = spawn('npx', ['@anthropic-ai/claude-code'], {
        cwd: workspaceDir,
        env: { 
          ...process.env, 
          ANTHROPIC_API_KEY: this.aiApiKey 
        },
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      claudeProcess.stdout.on('data', (data) => {
        stdout += data.toString();
        console.log('📝 Claude Code output:', data.toString().trim());
      });

      claudeProcess.stderr.on('data', (data) => {
        stderr += data.toString();
        console.warn('⚠️ Claude Code stderr:', data.toString().trim());
      });

      claudeProcess.on('close', async (code) => {
        console.log('🏁 Claude Code process finished with code:', code);
        
        if (code === 0) {
          try {
            // Scan the workspace for generated files
            const files = await this.scanWorkspaceFiles(workspaceDir);
            resolve(files);
          } catch (error) {
            console.error('Failed to scan workspace files:', error);
            reject(error);
          }
        } else {
          reject(new Error(`Claude Code process failed with code ${code}: ${stderr}`));
        }
      });

      claudeProcess.on('error', (error) => {
        console.error('Claude Code process error:', error);
        reject(error);
      });

      // Send the prompt to Claude Code
      claudeProcess.stdin.write(prompt);
      claudeProcess.stdin.end();
    });
  }

  private async scanWorkspaceFiles(workspaceDir: string): Promise<Array<{ name: string; content: string; type: string }>> {
    const files: Array<{ name: string; content: string; type: string }> = [];
    
    try {
      const entries = await fs.readdir(workspaceDir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isFile()) {
          const filePath = path.join(workspaceDir, entry.name);
          const content = await fs.readFile(filePath, 'utf8');
          const fileType = this.determineFileType(entry.name);
          
          files.push({
            name: entry.name,
            content: content,
            type: fileType
          });
          
          console.log('📄 Found file:', entry.name, `(${content.length} chars, type: ${fileType})`);
        }
      }
    } catch (error) {
      console.error('Error scanning workspace:', error);
      throw error;
    }
    
    return files;
  }

  private determineFileType(filename: string): string {
    const extension = path.extname(filename).toLowerCase();
    
    switch (extension) {
      case '.js':
      case '.jsx':
      case '.ts':
      case '.tsx':
      case '.vue':
        return 'component';
      case '.css':
      case '.scss':
      case '.sass':
      case '.less':
        return 'style';
      case '.json':
      case '.config.js':
      case '.env':
        return 'config';
      case '.md':
        return 'readme';
      default:
        return 'component';
    }
  }

  private async processClaudeCodeResults(
    files: Array<{ name: string; content: string; type: string }>,
    context: AIPromptContext
  ): Promise<GenerationResult> {
    
    // Find the main file
    const mainFile = files.find(f => 
      f.name === 'index.html' || 
      f.name === 'App.jsx' || 
      f.name === 'App.vue' || 
      f.name === 'main.js' ||
      f.name === 'index.js'
    );
    
    const mainCode = mainFile ? mainFile.content : files[0]?.content || '';
    
    // Extract dependencies from package.json if it exists
    const packageJsonFile = files.find(f => f.name === 'package.json');
    let dependencies = {};
    
    if (packageJsonFile) {
      try {
        const packageData = JSON.parse(packageJsonFile.content);
        dependencies = { ...packageData.dependencies, ...packageData.devDependencies };
      } catch (error) {
        console.warn('Failed to parse package.json:', error);
      }
    }
    
    // Generate description based on the main file content and prompt
    const description = this.generateDescription(context.userPrompt, context.framework, mainCode);
    
    // Extract features from the generated code
    const extractedFeatures = this.extractFeaturesFromCode(mainCode, context.features);
    
    return {
      code: mainCode,
      framework: context.framework,
      description: description,
      features: extractedFeatures,
      dependencies: dependencies,
      usage: this.generateUsageInstructions(context.framework),
      confidence: 0.95, // High confidence for Claude Code SDK results
      files: files.map(f => ({
        name: f.name,
        content: f.content,
        type: f.type as 'component' | 'style' | 'config' | 'readme'
      }))
    };
  }

  private generateFallback(context: AIPromptContext): Promise<GenerationResult> {
    console.log('📄 Using fallback generation (basic template)');
    
    // Create a simple fallback based on framework
    const fallbackCode = this.getFallbackTemplate(context.framework, context.userPrompt);
    
    return Promise.resolve({
      code: fallbackCode,
      framework: context.framework,
      description: `A basic ${context.framework} application: ${context.userPrompt}`,
      features: context.features.length > 0 ? context.features : ['basic functionality'],
      dependencies: this.getBasicDependencies(context.framework),
      usage: this.generateUsageInstructions(context.framework),
      confidence: 0.7, // Lower confidence for fallback
      files: [{
        name: context.framework === 'react' ? 'App.jsx' : 
              context.framework === 'vue' ? 'App.vue' : 'index.html',
        content: fallbackCode,
        type: 'component' as const
      }]
    });
  }

  private getFallbackTemplate(framework: string, prompt: string): string {
    const appName = this.extractAppName(prompt);
    
    switch (framework) {
      case 'react':
        return `import React, { useState } from 'react';

function App() {
  const [message, setMessage] = useState('Welcome to ${appName}!');
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage(\`Hello from \${input}!\`);
    setInput('');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>${appName}</h1>
      <p>{message}</p>
      
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter something..."
          style={{ padding: '8px', marginRight: '8px' }}
        />
        <button type="submit" style={{ padding: '8px 16px' }}>
          Submit
        </button>
      </form>
    </div>
  );
}

export default App;`;

      case 'vue':
        return `<template>
  <div style="padding: 20px; font-family: Arial, sans-serif;">
    <h1>${appName}</h1>
    <p>{{ message }}</p>
    
    <form @submit.prevent="handleSubmit">
      <input
        v-model="input"
        type="text"
        placeholder="Enter something..."
        style="padding: 8px; margin-right: 8px;"
      />
      <button type="submit" style="padding: 8px 16px;">
        Submit
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const message = ref('Welcome to ${appName}!');
const input = ref('');

const handleSubmit = () => {
  message.value = \`Hello from \${input.value}!\`;
  input.value = '';
};
</script>`;

      default: // vanilla
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${appName}</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        input { padding: 8px; margin-right: 8px; }
        button { padding: 8px 16px; }
    </style>
</head>
<body>
    <h1>${appName}</h1>
    <p id="message">Welcome to ${appName}!</p>
    
    <form id="mainForm">
        <input type="text" id="input" placeholder="Enter something..." />
        <button type="submit">Submit</button>
    </form>

    <script>
        const form = document.getElementById('mainForm');
        const input = document.getElementById('input');
        const message = document.getElementById('message');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            message.textContent = \`Hello from \${input.value}!\`;
            input.value = '';
        });
    </script>
</body>
</html>`;
    }
  }

  private extractAppName(prompt: string): string {
    const words = prompt.toLowerCase().split(' ');
    
    // Look for app-related keywords
    const appTypes = ['calculator', 'todo', 'weather', 'blog', 'chat', 'game', 'timer'];
    const foundType = words.find(word => appTypes.includes(word));
    
    if (foundType) {
      return foundType.charAt(0).toUpperCase() + foundType.slice(1) + ' App';
    }
    
    return 'Generated App';
  }

  private getBasicDependencies(framework: string): Record<string, string> {
    switch (framework) {
      case 'react':
        return {
          'react': '^18.0.0',
          'react-dom': '^18.0.0'
        };
      case 'vue':
        return {
          'vue': '^3.0.0'
        };
      default:
        return {};
    }
  }

  private generateDescription(prompt: string, framework: string, code?: string): string {
    const appName = this.extractAppName(prompt);
    return `${appName} built with ${framework}. ${prompt}`;
  }

  private extractFeaturesFromCode(code: string, originalFeatures: string[]): string[] {
    const features = [...originalFeatures];
    
    // Analyze code for additional features
    if (code.includes('useState') || code.includes('reactive')) {
      features.push('interactive functionality');
    }
    
    if (code.includes('form') || code.includes('input')) {
      features.push('form handling');
    }
    
    if (code.includes('fetch') || code.includes('axios')) {
      features.push('API integration');
    }
    
    return features.length > 0 ? [...new Set(features)] : ['basic functionality'];
  }

  private generateUsageInstructions(framework: string): string {
    switch (framework) {
      case 'react':
        return `1. Install dependencies: npm install\n2. Start development server: npm start\n3. Open http://localhost:3000 in your browser`;
      case 'vue':
        return `1. Install dependencies: npm install\n2. Start development server: npm run serve\n3. Open http://localhost:8080 in your browser`;
      default:
        return `1. Open index.html in your web browser\n2. Or serve with a local server for best results`;
    }
  }

  private validateAndFixCode(files: any[]): any[] {
    console.log('🔍 Validating and fixing generated code...');
    
    const validatedFiles = files.map(file => {
      let content = file.content;
      let wasFixed = false;

      // Fix JavaScript syntax errors
      if (file.name.endsWith('.js')) {
        // Fix getElementById calls without quotes
        const idCallsRegex = /getElementById\(([^'"][^)]+)\)/g;
        content = content.replace(idCallsRegex, (match, id) => {
          if (!id.startsWith('"') && !id.startsWith("'")) {
            wasFixed = true;
            return `getElementById('${id.trim()}')`;
          }
          return match;
        });

        // Fix addEventListener calls without quotes  
        const eventListenerRegex = /addEventListener\(([^'"][^,]+),/g;
        content = content.replace(eventListenerRegex, (match, event) => {
          if (!event.startsWith('"') && !event.startsWith("'")) {
            wasFixed = true;
            return `addEventListener('${event.trim()}',`;
          }
          return match;
        });

        // Fix string literals without quotes in array declarations
        const arrayStringRegex = /\[\s*([A-Za-z]+(?:\s*,\s*[A-Za-z]+)*)\s*\]/g;
        content = content.replace(arrayStringRegex, (match, items) => {
          const quotedItems = items.split(',').map(item => {
            const trimmed = item.trim();
            if (trimmed && !trimmed.startsWith('"') && !trimmed.startsWith("'") && /^[A-Za-z]/.test(trimmed)) {
              wasFixed = true;
              return `'${trimmed}'`;
            }
            return trimmed;
          });
          return `[${quotedItems.join(', ')}]`;
        });

        // Fix style.display assignments without quotes
        content = content.replace(/\.style\.display\s*=\s*([^'"][^;]+)/g, (match, value) => {
          const trimmed = value.trim();
          if (trimmed && !trimmed.startsWith('"') && !trimmed.startsWith("'")) {
            wasFixed = true;
            return `.style.display = '${trimmed}'`;
          }
          return match;
        });
      }

      // Fix HTML file references to match generated filenames
      if (file.name.endsWith('.html')) {
        // Fix CSS references to match standard filename
        content = content.replace(/href="styles\.css"/g, 'href="style.css"');
        content = content.replace(/href='styles\.css'/g, "href='style.css'");
        
        // Fix JS references to match standard filename  
        content = content.replace(/src="scripts\.js"/g, 'src="script.js"');
        content = content.replace(/src='scripts\.js'/g, "src='script.js'");
        
        if (content !== file.content) wasFixed = true;
      }

      // Fix CSS import statements in JavaScript
      if (file.name.endsWith('.js') && content.includes('import')) {
        content = content.replace(/import\s+['"]styles\.css['"]/, "import 'style.css'");
        content = content.replace(/import\s+['"]\.\/styles\.css['"]/, "import './style.css'");
        if (content !== file.content) wasFixed = true;
      }

      if (wasFixed) {
        console.log(`✅ Fixed syntax errors in ${file.name}`);
      }

      return {
        ...file,
        content
      };
    });

    // Validate HTML references match generated files
    const htmlFile = validatedFiles.find(f => f.name.endsWith('.html'));
    const fileNames = new Set(validatedFiles.map(f => f.name));
    
    if (htmlFile) {
      let htmlContent = htmlFile.content;
      let htmlWasFixed = false;

      // Check CSS references
      const cssMatches = htmlContent.match(/(?:href|src)=["']([^"']*\.css)["']/g);
      if (cssMatches) {
        cssMatches.forEach(match => {
          const filename = match.match(/["']([^"']*\.css)["']/)?.[1];
          if (filename && !fileNames.has(filename)) {
            // Try to find similar CSS file
            const cssFile = validatedFiles.find(f => f.name.endsWith('.css'));
            if (cssFile) {
              htmlContent = htmlContent.replace(filename, cssFile.name);
              htmlWasFixed = true;
              console.log(`✅ Fixed CSS reference from ${filename} to ${cssFile.name}`);
            }
          }
        });
      }

      // Check JS references  
      const jsMatches = htmlContent.match(/src=["']([^"']*\.js)["']/g);
      if (jsMatches) {
        jsMatches.forEach(match => {
          const filename = match.match(/["']([^"']*\.js)["']/)?.[1];
          if (filename && !fileNames.has(filename)) {
            // Try to find similar JS file
            const jsFile = validatedFiles.find(f => f.name.endsWith('.js'));
            if (jsFile) {
              htmlContent = htmlContent.replace(filename, jsFile.name);
              htmlWasFixed = true;
              console.log(`✅ Fixed JS reference from ${filename} to ${jsFile.name}`);
            }
          }
        });
      }

      if (htmlWasFixed) {
        const htmlIndex = validatedFiles.findIndex(f => f.name.endsWith('.html'));
        validatedFiles[htmlIndex] = { ...htmlFile, content: htmlContent };
      }
    }

    console.log('✅ Code validation and fixing complete');
    return validatedFiles;
  }
}

export default ZoptalCodeGenerator;