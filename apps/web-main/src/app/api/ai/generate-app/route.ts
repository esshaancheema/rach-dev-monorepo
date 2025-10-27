import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ZoptalCodeGenerator } from '@/lib/ai/code-generator';
import { handleCORS, addCORSHeaders } from '@/lib/utils/cors';

const generateAppSchema = z.object({
  prompt: z.string().min(10).max(500),
  sessionId: z.string().optional(),
  userId: z.string().optional(),
  currentPromptCount: z.number().min(0).optional(), // Client-side prompt count
  context: z.object({
    previousApps: z.array(z.any()).optional(),
    userPreferences: z.object({
      framework: z.enum(['react', 'vue', 'vanilla', 'auto']).optional(),
      complexity: z.enum(['simple', 'moderate', 'advanced']).optional(),
      features: z.array(z.string()).optional()
    }).optional()
  }).optional()
});

// Handle CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  const corsResponse = handleCORS(request);
  return corsResponse || new NextResponse(null, { status: 200 });
}

export async function POST(request: NextRequest) {
  // Handle CORS preflight if needed
  const corsResponse = handleCORS(request);
  if (corsResponse) {
    return corsResponse;
  }
  try {
    const body = await request.json();
    const { prompt, sessionId, userId, currentPromptCount, context } = generateAppSchema.parse(body);

    // Rate limiting check - use client-provided count for guests, database for authenticated users
    const sessionPrompts = userId ? await getSessionPromptCount(sessionId, userId) : (currentPromptCount || 0);
    const maxPrompts = userId ? 6 : 3; // Authenticated users get more prompts
    
    if (sessionPrompts >= maxPrompts) {
      const errorResponse = NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          message: userId ? 
            'You have reached your monthly prompt limit. Please upgrade your plan for more prompts.' :
            'You have used all 3 trial prompts! Sign up for free to get 3 more prompts + a consultation.',
          promptsUsed: sessionPrompts,
          maxPrompts,
          authRequired: !userId
        },
        { status: 429 }
      );
      return addCORSHeaders(errorResponse, request);
    }

    // Initialize AI code generator with auto-detection of best provider
    const generator = new ZoptalCodeGenerator({
      // Let the constructor auto-detect the best available provider (Anthropic preferred)
    });
    
    // Determine optimal framework based on prompt analysis
    const framework = determineFramework(prompt, context?.userPreferences?.framework);
    
    // Generate the app using the new interface
    const result = await generator.generateFullApp(prompt, {
      framework: framework as any, // Type assertion since determineFramework returns compatible types
      complexity: analyzeComplexity(prompt),
      features: extractFeatures(prompt),
      context: context?.previousApps
    });

    // Track the prompt usage
    await incrementSessionPrompts(sessionId, userId);

    // Return the generated app with CORS headers
    const response = NextResponse.json({
      success: true,
      data: {
        code: result.code,
        framework: result.framework,
        description: result.description,
        features: result.features,
        dependencies: result.dependencies,
        usage: result.usage,
        confidence: result.confidence,
        files: result.files
      },
      session: {
        promptsUsed: sessionPrompts + 1,
        promptsRemaining: maxPrompts - (sessionPrompts + 1),
        sessionId: sessionId || generateSessionId()
      }
    });

    return addCORSHeaders(response, request);

  } catch (error) {
    console.error('App generation error:', error);
    
    if (error instanceof z.ZodError) {
      const validationErrorResponse = NextResponse.json(
        { 
          error: 'Invalid input',
          message: 'Please provide a valid app description (10-500 characters)',
          details: error.errors
        },
        { status: 400 }
      );
      return addCORSHeaders(validationErrorResponse, request);
    }

    const serverErrorResponse = NextResponse.json(
      { 
        error: 'Generation failed',
        message: 'Failed to generate your app. Please try again with a different description.'
      },
      { status: 500 }
    );
    return addCORSHeaders(serverErrorResponse, request);
  }
}

// Helper functions

async function getSessionPromptCount(sessionId?: string, userId?: string): Promise<number> {
  // For production, this would query your database
  // For now, we'll use a simple in-memory store (Redis in production)
  
  if (userId) {
    // Check authenticated user's usage from database
    // TODO: Replace with actual database query
    return 0; // Placeholder - authenticated users get 6 prompts initially
  } else if (sessionId) {
    // For guest sessions, we'll rely on client-side localStorage
    // The client should send the current count in the request
    return 0; // Will be overridden by client-side logic
  }
  return 0;
}

async function incrementSessionPrompts(sessionId?: string, userId?: string): Promise<void> {
  // In production, increment the counter in your database
  // For now, we'll just log it
  console.log('Incrementing prompt count for:', { sessionId, userId });
}

function generateSessionId(): string {
  return 'sess_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function determineFramework(prompt: string, preference?: string): 'react' | 'vue' | 'vanilla' {
  if (preference && preference !== 'auto') {
    return preference as 'react' | 'vue' | 'vanilla';
  }

  const lowerPrompt = prompt.toLowerCase();
  const frameworkScores = { react: 0, vue: 0, vanilla: 0 };
  
  // Framework-specific keyword detection
  const frameworkKeywords = {
    react: [
      'react', 'jsx', 'hooks', 'usestate', 'useeffect', 'component', 'props',
      'next.js', 'nextjs', 'tsx', 'typescript react', 'react native'
    ],
    vue: [
      'vue', 'vuejs', 'vue.js', 'composition api', 'options api', 'nuxt',
      'v-model', 'v-for', 'v-if', 'single file component', 'vue component'
    ],
    vanilla: [
      'vanilla', 'plain javascript', 'no framework', 'html css js', 'pure js',
      'dom manipulation', 'native javascript', 'browser api', 'web api'
    ]
  };

  // Score based on keywords
  Object.entries(frameworkKeywords).forEach(([framework, keywords]) => {
    keywords.forEach(keyword => {
      if (lowerPrompt.includes(keyword)) {
        frameworkScores[framework] += keyword.length > 10 ? 3 : 2; // Longer keywords get more weight
      }
    });
  });

  // App type analysis
  const appTypePatterns = {
    dashboard: /\b(dashboard|admin|analytics|charts|graphs|metrics|data visualization)\b/i,
    ecommerce: /\b(shop|store|cart|checkout|product|payment|ecommerce|e-commerce)\b/i,
    social: /\b(social|feed|post|comment|like|share|chat|message|profile)\b/i,
    blog: /\b(blog|article|post|cms|content|editor|markdown)\b/i,
    game: /\b(game|puzzle|quiz|score|level|player|arcade)\b/i,
    calculator: /\b(calculator|calc|math|compute|formula|equation)\b/i,
    todo: /\b(todo|task|list|checklist|reminder|note|productivity)\b/i,
    simple: /\b(simple|basic|quick|minimal|lightweight|small)\b/i
  };

  // Framework preferences based on app type
  const appTypePreferences = {
    dashboard: { react: 4, vue: 2, vanilla: 0 },
    ecommerce: { react: 5, vue: 3, vanilla: 0 },
    social: { react: 5, vue: 4, vanilla: 1 },
    blog: { react: 3, vue: 4, vanilla: 1 },
    game: { react: 2, vue: 2, vanilla: 4 },
    calculator: { react: 2, vue: 2, vanilla: 3 },
    todo: { react: 3, vue: 3, vanilla: 2 },
    simple: { react: 1, vue: 1, vanilla: 4 }
  };

  // Apply app type scoring
  Object.entries(appTypePatterns).forEach(([appType, pattern]) => {
    if (pattern.test(lowerPrompt)) {
      const preferences = appTypePreferences[appType];
      Object.entries(preferences).forEach(([framework, score]) => {
        frameworkScores[framework] += score;
      });
    }
  });

  // Complexity analysis
  const complexityIndicators = {
    high: /\b(authentication|auth|login|signup|user management|role|permission|api integration|real-time|websocket|state management|redux|vuex|routing|multi-page|spa|pwa|server-side rendering|ssr)\b/i,
    medium: /\b(form validation|api call|fetch|ajax|local storage|session|dynamic|interactive|component|modal|dropdown|tabs|accordion)\b/i,
    low: /\b(static|display|show|simple|basic|minimal|text|image|list|table)\b/i
  };

  // Adjust scores based on complexity
  if (complexityIndicators.high.test(lowerPrompt)) {
    frameworkScores.react += 4;
    frameworkScores.vue += 3;
    frameworkScores.vanilla -= 2;
  } else if (complexityIndicators.medium.test(lowerPrompt)) {
    frameworkScores.react += 2;
    frameworkScores.vue += 2;
    frameworkScores.vanilla += 1;
  } else if (complexityIndicators.low.test(lowerPrompt)) {
    frameworkScores.vanilla += 3;
    frameworkScores.react -= 1;
    frameworkScores.vue -= 1;
  }

  // Feature-based scoring
  const featureScoring = {
    forms: { pattern: /\b(form|input|submit|validation|field)\b/i, react: 2, vue: 2, vanilla: 1 },
    animation: { pattern: /\b(animation|animate|transition|motion|fade|slide)\b/i, react: 3, vue: 2, vanilla: 1 },
    charts: { pattern: /\b(chart|graph|plot|visualization|d3)\b/i, react: 4, vue: 3, vanilla: 2 },
    mobile: { pattern: /\b(mobile|responsive|touch|swipe|gesture)\b/i, react: 3, vue: 3, vanilla: 2 },
    performance: { pattern: /\b(fast|performance|optimize|speed|lightweight)\b/i, react: 1, vue: 2, vanilla: 4 }
  };

  Object.values(featureScoring).forEach(({ pattern, react, vue, vanilla }) => {
    if (pattern.test(lowerPrompt)) {
      frameworkScores.react += react;
      frameworkScores.vue += vue;
      frameworkScores.vanilla += vanilla;
    }
  });

  // Determine winner
  const winner = Object.entries(frameworkScores).reduce((a, b) => 
    frameworkScores[a[0]] > frameworkScores[b[0]] ? a : b
  )[0];

  // Fallback logic if scores are too close or all zero
  if (Math.max(...Object.values(frameworkScores)) === 0) {
    // Default based on prompt length and complexity
    const wordCount = lowerPrompt.split(' ').length;
    if (wordCount > 15) return 'react';
    if (wordCount > 8) return 'vue';
    return 'vanilla';
  }

  return winner as 'react' | 'vue' | 'vanilla';
}

function analyzeComplexity(prompt: string): 'simple' | 'moderate' | 'advanced' {
  const lowerPrompt = prompt.toLowerCase();
  let complexityScore = 0;

  // Advanced complexity indicators (high weight)
  const advancedPatterns = [
    { pattern: /\b(authentication|auth|login|signup|user management|oauth|jwt|session management)\b/i, weight: 5 },
    { pattern: /\b(database|sql|nosql|mongodb|postgresql|mysql|firebase|supabase)\b/i, weight: 5 },
    { pattern: /\b(real-time|websocket|socket\.io|live updates|streaming|sse)\b/i, weight: 5 },
    { pattern: /\b(state management|redux|vuex|zustand|context api|global state)\b/i, weight: 4 },
    { pattern: /\b(api integration|rest api|graphql|microservices|backend|server)\b/i, weight: 4 },
    { pattern: /\b(routing|navigation|multi-page|spa|single page app|pwa)\b/i, weight: 4 },
    { pattern: /\b(enterprise|scalable|production|deployment|ci\/cd|testing)\b/i, weight: 4 },
    { pattern: /\b(payment|stripe|paypal|checkout|transaction|commerce)\b/i, weight: 4 },
    { pattern: /\b(file upload|image processing|media|video|audio)\b/i, weight: 3 },
    { pattern: /\b(search|filtering|sorting|pagination|infinite scroll)\b/i, weight: 3 }
  ];

  // Moderate complexity indicators (medium weight)  
  const moderatePatterns = [
    { pattern: /\b(form|validation|submit|input|field|textarea|select)\b/i, weight: 2 },
    { pattern: /\b(interactive|dynamic|responsive|mobile|touch|gesture)\b/i, weight: 2 },
    { pattern: /\b(modal|dropdown|tabs|accordion|carousel|slider)\b/i, weight: 2 },
    { pattern: /\b(chart|graph|visualization|analytics|dashboard|metrics)\b/i, weight: 3 },
    { pattern: /\b(local storage|session storage|cache|persistence)\b/i, weight: 2 },
    { pattern: /\b(drag.{0,5}drop|sortable|reorder|dnd)\b/i, weight: 3 },
    { pattern: /\b(animation|transition|motion|fade|slide|parallax)\b/i, weight: 2 },
    { pattern: /\b(notification|alert|toast|popup|snackbar)\b/i, weight: 1 },
    { pattern: /\b(theme|dark mode|customization|settings|preferences)\b/i, weight: 2 }
  ];

  // Simple indicators (negative weight - reduces complexity)
  const simplePatterns = [
    { pattern: /\b(static|display|show|view|simple|basic|minimal)\b/i, weight: -1 },
    { pattern: /\b(text|label|heading|paragraph|list|table)\b/i, weight: -1 },
    { pattern: /\b(hello world|quick|fast|lightweight|small)\b/i, weight: -2 }
  ];

  // Apply pattern matching
  [...advancedPatterns, ...moderatePatterns, ...simplePatterns].forEach(({ pattern, weight }) => {
    if (pattern.test(lowerPrompt)) {
      complexityScore += weight;
    }
  });

  // Word count factor (longer descriptions tend to be more complex)
  const wordCount = lowerPrompt.split(/\s+/).length;
  if (wordCount > 30) complexityScore += 3;
  else if (wordCount > 15) complexityScore += 2;
  else if (wordCount > 8) complexityScore += 1;
  else if (wordCount < 5) complexityScore -= 1;

  // Feature count estimation
  const featureCount = (lowerPrompt.match(/\b(and|with|include|also|plus|feature)\b/gi) || []).length;
  complexityScore += featureCount;

  // Technical jargon detection
  const technicalTerms = /\b(component|module|service|utility|helper|hook|middleware|controller|model|view|template|directive|plugin|extension|library|framework|architecture|pattern|design|algorithm|optimization|performance|security|scalability)\b/gi;
  const technicalMatches = (lowerPrompt.match(technicalTerms) || []).length;
  complexityScore += Math.min(technicalMatches * 0.5, 3); // Cap at 3 points

  // Determine complexity level
  if (complexityScore >= 8) return 'advanced';
  if (complexityScore >= 4) return 'moderate';
  return 'simple';
}

function extractFeatures(prompt: string): string[] {
  const lowerPrompt = prompt.toLowerCase();
  const features: string[] = [];

  const featureMap = {
    // Core UI Features
    'responsive design': /\b(responsive|mobile|tablet|desktop|breakpoint|media query|fluid|adaptive)\b/i,
    'dark mode': /\b(dark mode|theme|light.{0,5}dark|theme switcher|appearance)\b/i,
    'animations': /\b(animation|animate|transition|motion|fade|slide|parallax|keyframe)\b/i,
    'interactive components': /\b(modal|dropdown|tabs|accordion|carousel|slider|tooltip|popover)\b/i,
    
    // Authentication & User Management
    'user authentication': /\b(auth|login|signup|register|user|oauth|jwt|session)\b/i,
    'user profiles': /\b(profile|avatar|bio|settings|account|preferences)\b/i,
    'role management': /\b(role|permission|admin|moderator|access control)\b/i,
    
    // Data & Storage
    'data persistence': /\b(save|store|persist|database|local storage|session storage|cache)\b/i,
    'api integration': /\b(api|rest|graphql|fetch|axios|http|backend|server)\b/i,
    'real-time updates': /\b(real.{0,5}time|live|websocket|socket|streaming|sse)\b/i,
    'offline support': /\b(offline|pwa|service worker|cache|sync)\b/i,
    
    // Form Features
    'form validation': /\b(validation|validate|form|input|field|error|required)\b/i,
    'file upload': /\b(upload|file|attachment|media|image|document|drag.{0,5}drop)\b/i,
    'multi-step forms': /\b(wizard|step|multi.{0,5}step|progress|stepper)\b/i,
    
    // Search & Navigation
    'search functionality': /\b(search|find|query|autocomplete|suggestion|typeahead)\b/i,
    'filtering and sorting': /\b(filter|sort|order|category|tag|faceted)\b/i,
    'pagination': /\b(pagination|paging|infinite scroll|load more|virtual scroll)\b/i,
    'navigation': /\b(navigation|nav|menu|sidebar|breadcrumb|routing)\b/i,
    
    // Data Visualization
    'charts and graphs': /\b(chart|graph|plot|visualization|analytics|dashboard|metric)\b/i,
    'tables and lists': /\b(table|list|grid|data grid|spreadsheet|row|column)\b/i,
    'calendar': /\b(calendar|date picker|schedule|event|booking|appointment)\b/i,
    
    // User Interaction
    'drag and drop': /\b(drag.{0,5}drop|dnd|sortable|reorder|draggable)\b/i,
    'keyboard shortcuts': /\b(keyboard|shortcut|hotkey|key binding|accessibility)\b/i,
    'notifications': /\b(notification|alert|toast|message|popup|snackbar)\b/i,
    'feedback': /\b(loading|spinner|skeleton|progress|status|feedback)\b/i,
    
    // E-commerce & Payment
    'shopping cart': /\b(cart|basket|shopping|checkout|product|item)\b/i,
    'payment integration': /\b(payment|stripe|paypal|checkout|transaction|billing)\b/i,
    'inventory management': /\b(inventory|stock|warehouse|product management)\b/i,
    
    // Communication
    'messaging': /\b(chat|message|conversation|thread|dm|instant message)\b/i,
    'email functionality': /\b(email|mail|newsletter|subscribe|smtp|send)\b/i,
    'social features': /\b(social|share|like|comment|follow|friend|post|feed)\b/i,
    
    // Media
    'image gallery': /\b(gallery|photo|image|media|slideshow|lightbox)\b/i,
    'video player': /\b(video|player|streaming|playback|media player)\b/i,
    'audio features': /\b(audio|music|podcast|sound|player|recording)\b/i,
    
    // Performance & Optimization
    'lazy loading': /\b(lazy|optimization|performance|speed|bundle|split)\b/i,
    'error handling': /\b(error|exception|try.{0,5}catch|fallback|boundary)\b/i,
    'testing': /\b(test|testing|unit|integration|e2e|cypress|jest)\b/i,
    
    // Advanced Features
    'internationalization': /\b(i18n|internationalization|translation|locale|language)\b/i,
    'accessibility': /\b(a11y|accessibility|screen reader|wcag|aria)\b/i,
    'seo optimization': /\b(seo|meta|og|twitter|schema|sitemap)\b/i,
    'analytics': /\b(analytics|tracking|metrics|ga|google analytics|telemetry)\b/i,
    
    // Game Features
    'game mechanics': /\b(game|score|level|player|puzzle|quiz|arcade|leaderboard)\b/i,
    'multiplayer': /\b(multiplayer|collaborative|real.{0,5}time|sync)\b/i
  };

  // Extract features based on pattern matching
  for (const [feature, regex] of Object.entries(featureMap)) {
    if (regex.test(lowerPrompt)) {
      features.push(feature);
    }
  }

  // Add basic functionality if no features detected
  if (features.length === 0) {
    features.push('basic functionality');
  }

  // Remove duplicates and sort
  return [...new Set(features)].sort();
}

