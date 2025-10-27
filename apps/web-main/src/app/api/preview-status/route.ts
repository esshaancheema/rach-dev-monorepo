import { draftMode } from 'next/headers';

export async function GET() {
  const { isEnabled } = draftMode();
  
  return Response.json({ isEnabled });
}