import { NextRequest } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';

// Webhook handler for Contentful content updates
export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret
    const webhookSecret = request.headers.get('x-contentful-webhook-secret');
    if (webhookSecret !== process.env.CONTENTFUL_WEBHOOK_SECRET) {
      return new Response('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { sys } = body;
    
    if (!sys) {
      return new Response('Invalid payload', { status: 400 });
    }

    const contentType = sys.contentType?.sys?.id;
    const entryId = sys.id;
    
    console.info(`Contentful webhook received for ${contentType}:${entryId}`);

    // Revalidate based on content type
    switch (contentType) {
      case 'blogPost':
        // Revalidate the specific blog post and blog listing pages
        if (body.fields?.slug) {
          revalidatePath(`/blog/${body.fields.slug}`);
        }
        revalidatePath('/blog');
        revalidateTag('blog-posts');
        break;
        
      case 'caseStudy':
        // Revalidate the specific case study and case studies listing pages
        if (body.fields?.slug) {
          revalidatePath(`/case-studies/${body.fields.slug}`);
        }
        revalidatePath('/case-studies');
        revalidateTag('case-studies');
        break;
        
      case 'service':
        // Revalidate the specific service and services listing pages
        if (body.fields?.slug) {
          revalidatePath(`/services/${body.fields.slug}`);
        }
        revalidatePath('/services');
        revalidateTag('services');
        break;
        
      case 'teamMember':
        // Revalidate team-related pages
        revalidatePath('/about');
        revalidatePath('/team');
        revalidateTag('team-members');
        break;
        
      case 'testimonial':
        // Revalidate pages that show testimonials
        revalidatePath('/');
        revalidateTag('testimonials');
        break;
        
      case 'category':
      case 'tag':
      case 'serviceCategory':
        // Revalidate taxonomy-related pages
        revalidatePath('/blog');
        revalidatePath('/case-studies');
        revalidatePath('/services');
        revalidateTag('categories');
        revalidateTag('tags');
        break;
        
      default:
        // For unknown content types, revalidate the homepage
        revalidatePath('/');
        break;
    }

    // Also revalidate the homepage for any content change
    revalidatePath('/');
    
    // Send success response
    return Response.json({ 
      message: 'Revalidation successful',
      contentType,
      entryId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Contentful webhook error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

// Handle different webhook events
function getWebhookAction(headers: Headers): string {
  const topic = headers.get('x-contentful-topic') || '';
  
  if (topic.includes('publish')) return 'publish';
  if (topic.includes('unpublish')) return 'unpublish';
  if (topic.includes('delete')) return 'delete';
  if (topic.includes('create')) return 'create';
  if (topic.includes('save')) return 'save';
  
  return 'unknown';
}