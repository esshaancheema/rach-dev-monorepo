import { draftMode } from 'next/headers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const redirect = searchParams.get('redirect') || '/';

  // Disable Draft Mode
  draftMode().disable();

  // Redirect to the specified path or home
  return Response.redirect(new URL(redirect, request.url));
}