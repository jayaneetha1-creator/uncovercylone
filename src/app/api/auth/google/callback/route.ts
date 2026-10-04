import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, createUser, updateUser, createSession } from '@/lib/db/users';
import { generateSecureToken, SESSION_COOKIE_NAME, SESSION_EXPIRY_DAYS } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const errorParam = url.searchParams.get('error');

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${url.protocol}//${url.host}`;

  if (errorParam || !code) {
    return NextResponse.redirect(`${appUrl}/login?error=google_auth_cancelled`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${appUrl}/login?error=google_not_configured`);
  }

  try {
    const redirectUri = `${appUrl}/api/auth/google/callback`;

    // 1. Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Google token exchange failed:', await tokenResponse.text());
      return NextResponse.redirect(`${appUrl}/login?error=google_token_exchange_failed`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // 2. Fetch Google profile
    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!profileResponse.ok) {
      return NextResponse.redirect(`${appUrl}/login?error=google_profile_fetch_failed`);
    }

    const profile = await profileResponse.json();
    const email = profile.email?.toLowerCase()?.trim();
    const name = profile.name || email?.split('@')[0] || 'Traveler';
    const avatar = profile.picture || '';

    if (!email) {
      return NextResponse.redirect(`${appUrl}/login?error=no_email_from_google`);
    }

    // 3. Link or create user
    let user = await getUserByEmail(email);

    if (user) {
      if (user.status === 'suspended') {
        return NextResponse.redirect(`${appUrl}/login?error=account_suspended`);
      }
      // Update avatar or mark verified if not already
      const updates: { avatar?: string; email_verified_at?: string } = {};
      if (!user.avatar && avatar) updates.avatar = avatar;
      if (!user.email_verified_at) updates.email_verified_at = new Date().toISOString();
      if (Object.keys(updates).length > 0) {
        await updateUser(user.id, updates);
      }
    } else {
      // First login creates user with role 'user'
      const placeholderHash = await generateSecureToken(16);
      const userId = await createUser({
        email,
        password_hash: placeholderHash,
        name,
        role: 'user',
        country: 'Sri Lanka',
        avatar,
        status: 'active',
      });
      user = await getUserByEmail(email);
    }

    if (!user) {
      return NextResponse.redirect(`${appUrl}/login?error=user_creation_failed`);
    }

    // 4. Create session
    const sessionId = generateSecureToken(32);
    const expiresAt = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'Browser';

    await createSession(sessionId, user.id, expiresAt, ip, userAgent);

    // 5. Determine redirection
    let target = '/';
    if (user.role === 'owner' || user.role === 'developer' || user.role === 'uploader') {
      target = '/admin';
    }

    const response = NextResponse.redirect(`${appUrl}${target}`);
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionId,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: expiresAt,
    });

    return response;
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : String(error);
    console.error('Google callback error:', err);
    return NextResponse.redirect(`${appUrl}/login?error=google_auth_exception`);
  }
}
