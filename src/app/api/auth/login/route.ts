import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, createSession } from '@/lib/db/users';
import { comparePassword, generateSecureToken, checkRateLimit, SESSION_COOKIE_NAME, SESSION_EXPIRY_DAYS } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    if (!checkRateLimit(`login_${ip}`, 10, 300)) {
      return NextResponse.json({ error: 'Too many login attempts. Please wait a few minutes.' }, { status: 429 });
    }

    const body = await request.json();
    const { email, password, isStaffLogin } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const trimmedEmail = String(email).trim().toLowerCase();
    const user = await getUserByEmail(trimmedEmail);

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    if (!user.password_hash) {
      return NextResponse.json({ error: 'Please sign in using Google or reset your password.' }, { status: 401 });
    }

    const passwordValid = await comparePassword(String(password), user.password_hash);
    if (!passwordValid) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    if (user.status === 'suspended') {
      return NextResponse.json({ error: 'Your account has been suspended. Please contact support.' }, { status: 403 });
    }

    // Role check if logging in via staff login
    if (isStaffLogin && user.role === 'user') {
      return NextResponse.json({ error: 'Access denied: Staff credentials required.' }, { status: 403 });
    }

    // Create session token
    const sessionId = generateSecureToken(48);
    const expiresAt = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
    const userAgent = request.headers.get('user-agent') || '';

    await createSession(sessionId, user.id, expiresAt, ip, userAgent);

    // Determine redirect
    const isStaff = ['owner', 'developer', 'uploader'].includes(user.role);
    const redirectTo = isStaff ? '/admin' : '/';

    const response = NextResponse.json({
      message: 'Login successful!',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        country: user.country,
        avatar: user.avatar,
        status: user.status,
      },
      redirectTo,
    });

    // Set secure cookie
    response.cookies.set(SESSION_COOKIE_NAME, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_EXPIRY_DAYS * 24 * 60 * 60,
    });

    return response;
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : String(error);
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Login failed. Please try again.' }, { status: 500 });
  }
}
