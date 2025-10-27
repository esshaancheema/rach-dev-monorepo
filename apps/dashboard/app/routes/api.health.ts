import { json, type LoaderFunctionArgs } from '@remix-run/cloudflare';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Support both GET and HEAD requests for health checks
  if (request.method === 'HEAD') {
    return new Response(null, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  return json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
};
