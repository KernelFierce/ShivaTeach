
// src/app/api/auth/google/callback/route.ts

import { handleOAuth2Callback, storeUserTokens } from '@/lib/google';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const userId = request.nextUrl.searchParams.get('state'); // The userId we passed in the auth URL

  if (!code || !userId) {
    return new Response('Invalid request', { status: 400 });
  }

  try {
    const tokens = await handleOAuth2Callback(code);
    await storeUserTokens(userId, tokens);

    // Redirect the user back to the integrations page
    const redirectUrl = new URL('/dashboard/settings/integrations', request.url);
    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error('An error occurred during Google OAuth callback:', error);
    // You might want to redirect to an error page instead.
    const errorUrl = new URL('/dashboard/settings/integrations?error=true', request.url);
    return NextResponse.redirect(errorUrl);
  }
}
