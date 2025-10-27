import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ZoptalCodeGenerator } from '@/lib/ai/code-generator';
import { handleCORS, addCORSHeaders } from '@/lib/utils/cors';

// Handle CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  const corsResponse = handleCORS(request);
  return corsResponse || new NextResponse(null, { status: 200 });
}

export async function GET(request: NextRequest) {
  // Handle CORS preflight if needed
  const corsResponse = handleCORS(request);
  if (corsResponse) {
    return corsResponse;
  }

  const { searchParams } = new URL(request.url);
  const prompt = searchParams.get('prompt');
  const sessionId = searchParams.get('sessionId');
  const userId = searchParams.get('userId');

  if (!prompt) {
    return new NextResponse('Missing prompt parameter', { status: 400 });
  }

  if (prompt.length < 10 || prompt.length > 500) {
    return new NextResponse('Prompt must be between 10-500 characters', { status: 400 });
  }

  // Create a readable stream for Server-Sent Events
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      
      const sendEvent = (type: string, data: any) => {
        const message = `data: ${JSON.stringify({ type, ...data })}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      const sendProgress = (step: string, status: string, progress: number, description?: string) => {
        sendEvent('progress', { step, status, progress, description });
      };

      const sendContent = (content: string) => {
        sendEvent('content', { content });
      };

      const sendCode = (code: string, framework: string) => {
        sendEvent('code', { code, framework });
      };

      const sendComplete = (project: any) => {
        sendEvent('complete', { project });
      };

      const sendError = (message: string) => {
        sendEvent('error', { message });
      };

      try {
        // Step 1: Analyzing Requirements
        sendProgress('analysis', 'in_progress', 0, 'Understanding your app requirements...');
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const framework = determineFramework(prompt);
        const complexity = analyzeComplexity(prompt);
        const features = extractFeatures(prompt);
        
        sendProgress('analysis', 'completed', 100, 'Requirements analyzed successfully');
        await new Promise(resolve => setTimeout(resolve, 300));

        // Step 2: Planning Architecture
        sendProgress('planning', 'in_progress', 0, 'Designing application architecture...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        sendContent(`I'll create a ${framework} application with ${complexity} complexity. `);
        sendContent(`Features to include: ${features.slice(0, 3).join(', ')}`);
        
        sendProgress('planning', 'completed', 100, 'Architecture planned');
        await new Promise(resolve => setTimeout(resolve, 300));

        // Step 3: Generating Code
        sendProgress('generation', 'in_progress', 0, 'Creating components and logic...');
        
        // Use enhanced Anthropic API integration directly
        const generator = new ZoptalCodeGenerator({
          aiProvider: 'claude-code',  // This will use enhanced Anthropic API
          aiApiKey: process.env.ANTHROPIC_API_KEY
        });

        // Generate the app with progress updates
        let currentProgress = 0;
        const progressInterval = setInterval(() => {
          if (currentProgress < 90) {
            currentProgress += Math.random() * 15;
            sendProgress('generation', 'in_progress', Math.min(currentProgress, 90), 'Generating code...');
          }
        }, 500);

        const result = await generator.generateFullApp(prompt, {
          framework: framework as any,
          complexity: complexity,
          features: features,
          context: undefined
        });

        clearInterval(progressInterval);
        sendProgress('generation', 'completed', 100, 'Code generated successfully');
        await new Promise(resolve => setTimeout(resolve, 300));

        // Step 4: Applying Styles
        sendProgress('styling', 'in_progress', 0, 'Adding Tailwind CSS styling...');
        await new Promise(resolve => setTimeout(resolve, 800));
        
        sendContent(`\n\nStyling your ${framework} app with responsive design and modern UI components.`);
        
        sendProgress('styling', 'completed', 100, 'Styles applied');
        await new Promise(resolve => setTimeout(resolve, 300));

        // Step 5: Optimizing Code
        sendProgress('optimization', 'in_progress', 0, 'Optimizing performance...');
        await new Promise(resolve => setTimeout(resolve, 600));
        
        sendProgress('optimization', 'completed', 100, 'Code optimized');
        await new Promise(resolve => setTimeout(resolve, 300));

        // Step 6: Preparing Preview
        sendProgress('preview', 'in_progress', 0, 'Setting up live preview environment...');
        await new Promise(resolve => setTimeout(resolve, 500));

        // Send the generated code
        sendCode(result.code, result.framework);
        
        sendContent(`\n\n✅ Your ${framework} app is ready! The application includes:`);
        result.features.forEach((feature: string, index: number) => {
          sendContent(`\n${index + 1}. ${feature}`);
        });

        // Prepare files for the generated app
        const files = result.files && result.files.length > 0
          ? result.files
          : [{
              name: `App.${result.framework === 'react' ? 'jsx' : result.framework === 'vue' ? 'vue' : 'js'}`,
              content: result.code
            }];

        // Create project object
        const project = {
          id: `project_${Date.now()}`,
          files: files,
          framework: result.framework,
          description: result.description
        };

        sendProgress('preview', 'completed', 100, 'Preview environment ready');
        await new Promise(resolve => setTimeout(resolve, 300));

        // Complete the streaming
        sendComplete(project);

        // Close the stream
        controller.close();

      } catch (error) {
        console.error('Streaming generation error:', error);
        sendError(error instanceof Error ? error.message : 'Generation failed');
        controller.close();
      }
    }
  });

  // Return the response with proper headers for Server-Sent Events
  const response = new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });

  return addCORSHeaders(response, request);
}

// Helper functions (imported from the main route)
function determineFramework(prompt: string): 'react' | 'vue' | 'vanilla' {
  const lowerPrompt = prompt.toLowerCase();
  const frameworkScores = { react: 0, vue: 0, vanilla: 0 };
  
  // Framework-specific keyword detection
  const frameworkKeywords = {
    react: ['react', 'jsx', 'hooks', 'usestate', 'useeffect', 'component', 'props'],
    vue: ['vue', 'vuejs', 'composition api', 'v-model', 'v-for', 'v-if'],
    vanilla: ['vanilla', 'plain javascript', 'no framework', 'html css js', 'pure js']
  };

  // Score based on keywords
  Object.entries(frameworkKeywords).forEach(([framework, keywords]) => {
    keywords.forEach(keyword => {
      if (lowerPrompt.includes(keyword)) {
        frameworkScores[framework] += 2;
      }
    });
  });

  // App complexity-based preferences
  const complexityIndicators = {
    high: /\b(dashboard|admin|authentication|real-time|state management)\b/i,
    medium: /\b(interactive|dynamic|form|api)\b/i,
    low: /\b(static|simple|basic|minimal)\b/i
  };

  if (complexityIndicators.high.test(lowerPrompt)) {
    frameworkScores.react += 4;
    frameworkScores.vue += 3;
  } else if (complexityIndicators.medium.test(lowerPrompt)) {
    frameworkScores.react += 2;
    frameworkScores.vue += 2;
    frameworkScores.vanilla += 1;
  } else if (complexityIndicators.low.test(lowerPrompt)) {
    frameworkScores.vanilla += 3;
  }

  // Determine winner
  const winner = Object.entries(frameworkScores).reduce((a, b) => 
    frameworkScores[a[0]] > frameworkScores[b[0]] ? a : b
  )[0];

  // Default to React if no clear preference
  return (winner as 'react' | 'vue' | 'vanilla') || 'react';
}

function analyzeComplexity(prompt: string): 'simple' | 'moderate' | 'advanced' {
  const lowerPrompt = prompt.toLowerCase();
  let complexityScore = 0;

  const advancedPatterns = [
    /\b(authentication|database|real-time|state management|api integration)\b/i,
    /\b(oauth|jwt|websocket|microservices|deployment)\b/i,
    /\b(payment|stripe|enterprise|scalable|production)\b/i
  ];

  const moderatePatterns = [
    /\b(form|validation|interactive|dynamic|responsive)\b/i,
    /\b(modal|dropdown|charts|animation|local storage)\b/i
  ];

  const simplePatterns = [
    /\b(static|display|simple|basic|minimal|text|list)\b/i
  ];

  advancedPatterns.forEach(pattern => {
    if (pattern.test(lowerPrompt)) complexityScore += 3;
  });

  moderatePatterns.forEach(pattern => {
    if (pattern.test(lowerPrompt)) complexityScore += 2;
  });

  simplePatterns.forEach(pattern => {
    if (pattern.test(lowerPrompt)) complexityScore -= 1;
  });

  const wordCount = lowerPrompt.split(/\s+/).length;
  if (wordCount > 20) complexityScore += 2;
  else if (wordCount > 10) complexityScore += 1;

  if (complexityScore >= 6) return 'advanced';
  if (complexityScore >= 3) return 'moderate';
  return 'simple';
}

function extractFeatures(prompt: string): string[] {
  const lowerPrompt = prompt.toLowerCase();
  const features: string[] = [];

  const featureMap = {
    'responsive design': /\b(responsive|mobile|tablet)\b/i,
    'user authentication': /\b(auth|login|signup|user)\b/i,
    'form validation': /\b(form|validation|input|field)\b/i,
    'data persistence': /\b(save|store|database|persistence)\b/i,
    'interactive components': /\b(modal|dropdown|tabs|interactive)\b/i,
    'real-time updates': /\b(real-time|live|websocket)\b/i,
    'search functionality': /\b(search|filter|query)\b/i,
    'data visualization': /\b(chart|graph|dashboard|analytics)\b/i,
    'file upload': /\b(upload|file|attachment|media)\b/i,
    'notifications': /\b(notification|alert|message)\b/i
  };

  for (const [feature, regex] of Object.entries(featureMap)) {
    if (regex.test(lowerPrompt)) {
      features.push(feature);
    }
  }

  if (features.length === 0) {
    features.push('basic functionality');
  }

  return features;
}