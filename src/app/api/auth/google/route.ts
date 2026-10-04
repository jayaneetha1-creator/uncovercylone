import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      {
        available: false,
        message: 'Google OAuth is not configured yet. Please configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env or Admin Settings.',
      },
      { status: 503 }
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const redirectUri = `${appUrl}/api/auth/google/callback`;
  const state = Math.random().toString(36).substring(2);

  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleAuthUrl.searchParams.set('client_id', clientId);
  googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
  googleAuthUrl.searchParams.set('response_type', 'code');
  googleAuthUrl.searchParams.set('scope', 'openid email profile');
  googleAuthUrl.searchParams.set('state', state);
  googleAuthUrl.searchParams.set('prompt', 'select_account');

  return NextResponse.redirect(googleAuthUrl.toString());
}
