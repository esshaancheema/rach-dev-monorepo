import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

// Preview mode API route for Contentful
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // Get the secret and content information from query parameters
  const secret = searchParams.get('secret');
  const slug = searchParams.get('slug');
  const contentType = searchParams.get('contentType');
  
  // Check the secret and content
  if (
    secret !== process.env.CONTENTFUL_PREVIEW_SECRET ||
    !slug ||
    !contentType
  ) {
    return new Response('Invalid token', { status: 401 });
  }

  // Enable Draft Mode by setting the cookie
  draftMode().enable();

  // Redirect to the appropriate preview page
  const redirectPath = getRedirectPath(contentType, slug);
  
  // Redirect to the path with a preview parameter
  redirect(`${redirectPath}?preview=true`);
}

function getRedirectPath(contentType: string, slug: string): string {
  switch (contentType) {
    case 'blogPost':
      return `/blog/${slug}`;
    case 'caseStudy':
      return `/case-studies/${slug}`;
    case 'service':
      return `/services/${slug}`;
    default:
      return '/';
  }
}

// Exit preview mode
export async function DELETE() {
  draftMode().disable();
  return new Response('Preview mode disabled', { status: 200 });
}