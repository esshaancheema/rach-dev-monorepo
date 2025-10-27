import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

interface RevalidateRequest {
  paths?: string[];
  tags?: string[];
  secret?: string;
  type?: 'path' | 'tag' | 'all';
}

// Predefined paths that can be revalidated
const REVALIDATABLE_PATHS = [
  '/',
  '/about',
  '/contact',
  '/pricing',
  '/enterprise',
  '/services',
  '/services/ai-development',
  '/services/web-development',
  '/services/mobile-app-development',
  '/services/custom-software-development',
  '/resources/blog',
  '/resources/case-studies',
  '/locations'
];

// Predefined tags for selective revalidation
const REVALIDATABLE_TAGS = [
  'homepage',
  'services',
  'locations',
  'blog',
  'case-studies',
  'pricing',
  'testimonials',
  'team',
  'stats'
];

// Validate revalidation secret (for security)
const validateSecret = (secret?: string): boolean => {
  const validSecret = process.env.REVALIDATE_SECRET;
  if (!validSecret) {
    console.warn('REVALIDATE_SECRET not configured');
    return false;
  }
  return secret === validSecret;
};

// Log revalidation activity
const logRevalidation = (type: string, targets: string[], success: boolean) => {
  console.info('Revalidation:', {
    type,
    targets,
    success,
    timestamp: new Date().toISOString()
  });
  
  // In production, send to monitoring service
  // - Datadog
  // - New Relic
  // - Custom analytics
};

// Revalidate specific paths
const revalidatePaths = async (paths: string[]): Promise<{ success: string[]; failed: Array<{ path: string; error: string }> }> => {
  const results = {
    success: [] as string[],
    failed: [] as Array<{ path: string; error: string }>
  };
  
  for (const path of paths) {
    try {
      // Validate path is allowed
      if (!REVALIDATABLE_PATHS.includes(path)) {
        results.failed.push({
          path,
          error: 'Path not allowed for revalidation'
        });
        continue;
      }
      
      await revalidatePath(path);
      results.success.push(path);
      
    } catch (error) {
      results.failed.push({
        path,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  return results;
};

// Revalidate by tags
const revalidateTags = async (tags: string[]): Promise<{ success: string[]; failed: Array<{ tag: string; error: string }> }> => {
  const results = {
    success: [] as string[],
    failed: [] as Array<{ tag: string; error: string }>
  };
  
  for (const tag of tags) {
    try {
      // Validate tag is allowed
      if (!REVALIDATABLE_TAGS.includes(tag)) {
        results.failed.push({
          tag,
          error: 'Tag not allowed for revalidation'
        });
        continue;
      }
      
      await revalidateTag(tag);
      results.success.push(tag);
      
    } catch (error) {
      results.failed.push({
        tag,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  return results;
};

// Full site revalidation (use with caution)
const revalidateAll = async (): Promise<{ revalidatedPaths: number; errors: number }> => {
  let revalidatedPaths = 0;
  let errors = 0;
  
  // Revalidate all predefined paths
  for (const path of REVALIDATABLE_PATHS) {
    try {
      await revalidatePath(path);
      revalidatedPaths++;
    } catch (error) {
      console.error(`Failed to revalidate ${path}:`, error);
      errors++;
    }
  }
  
  // Revalidate all tags
  for (const tag of REVALIDATABLE_TAGS) {
    try {
      await revalidateTag(tag);
    } catch (error) {
      console.error(`Failed to revalidate tag ${tag}:`, error);
      errors++;
    }
  }
  
  return { revalidatedPaths, errors };
};

// Webhook handler for CMS updates
const handleWebhook = async (request: NextRequest): Promise<NextResponse> => {
  const webhookType = request.headers.get('x-webhook-type');
  const body = await request.json();
  
  switch (webhookType) {
    case 'blog-updated':
      // Revalidate blog-related pages
      await revalidateTags(['blog']);
      await revalidatePaths(['/resources/blog']);
      return NextResponse.json({ message: 'Blog pages revalidated' });
      
    case 'case-study-updated':
      // Revalidate case study pages
      await revalidateTags(['case-studies']);
      await revalidatePaths(['/resources/case-studies']);
      return NextResponse.json({ message: 'Case study pages revalidated' });
      
    case 'team-updated':
      // Revalidate about page and team section
      await revalidateTags(['team']);
      await revalidatePaths(['/about']);
      return NextResponse.json({ message: 'Team pages revalidated' });
      
    case 'pricing-updated':
      // Revalidate pricing page
      await revalidateTags(['pricing']);
      await revalidatePaths(['/pricing']);
      return NextResponse.json({ message: 'Pricing page revalidated' });
      
    default:
      return NextResponse.json(
        { error: 'Unknown webhook type' },
        { status: 400 }
      );
  }
};

export async function POST(request: NextRequest) {
  try {
    const body: RevalidateRequest = await request.json();
    const { paths, tags, secret, type = 'path' } = body;
    
    // Check if this is a webhook request
    const isWebhook = request.headers.get('x-webhook-type');
    if (isWebhook) {
      return handleWebhook(request);
    }
    
    // Validate secret for manual revalidation
    if (!validateSecret(secret)) {
      return NextResponse.json(
        { error: 'Invalid or missing revalidation secret' },
        { status: 401 }
      );
    }
    
    let results: any = {};
    
    // Handle different revalidation types
    switch (type) {
      case 'path':
        if (!paths || paths.length === 0) {
          return NextResponse.json(
            { error: 'Paths array is required for path revalidation' },
            { status: 400 }
          );
        }
        results = await revalidatePaths(paths);
        logRevalidation('path', paths, results.failed.length === 0);
        break;
        
      case 'tag':
        if (!tags || tags.length === 0) {
          return NextResponse.json(
            { error: 'Tags array is required for tag revalidation' },
            { status: 400 }
          );
        }
        results = await revalidateTags(tags);
        logRevalidation('tag', tags, results.failed.length === 0);
        break;
        
      case 'all':
        results = await revalidateAll();
        logRevalidation('all', ['full-site'], results.errors === 0);
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid revalidation type. Use: path, tag, or all' },
          { status: 400 }
        );
    }
    
    return NextResponse.json({
      success: true,
      type,
      results,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Revalidation error:', error);
    
    return NextResponse.json(
      { 
        error: 'Revalidation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  
  if (action === 'paths') {
    return NextResponse.json({
      revalidatablePaths: REVALIDATABLE_PATHS,
      count: REVALIDATABLE_PATHS.length
    });
  }
  
  if (action === 'tags') {
    return NextResponse.json({
      revalidatableTags: REVALIDATABLE_TAGS,
      count: REVALIDATABLE_TAGS.length
    });
  }
  
  return NextResponse.json({
    message: 'ISR Revalidation API',
    version: '1.0.0',
    endpoints: {
      'POST /api/revalidate': 'Trigger revalidation',
      'GET /api/revalidate?action=paths': 'Get revalidatable paths',
      'GET /api/revalidate?action=tags': 'Get revalidatable tags'
    },
    types: {
      path: 'Revalidate specific paths',
      tag: 'Revalidate by cache tags',
      all: 'Full site revalidation (use with caution)'
    },
    webhooks: {
      'blog-updated': 'Revalidate blog pages',
      'case-study-updated': 'Revalidate case study pages',
      'team-updated': 'Revalidate team/about pages',
      'pricing-updated': 'Revalidate pricing page'
    },
    example: {
      path: {
        type: 'path',
        paths: ['/pricing', '/services'],
        secret: 'your-secret-key'
      },
      tag: {
        type: 'tag',
        tags: ['blog', 'pricing'],
        secret: 'your-secret-key'
      },
      all: {
        type: 'all',
        secret: 'your-secret-key'
      }
    }
  });
}