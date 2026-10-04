import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, createEmailToken } from '@/lib/db/users';
import { generateSecureToken, checkRateLimit } from '@/lib/auth';
import { sendPasswordResetEmail } from '@/lib/mailer';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    if (!checkRateLimit(`forgot_${ip}`, 5, 300)) {
      return NextResponse.json({ error: 'Too many requests. Please wait a few minutes.' }, { status: 429 });
    }

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    const trimmed = String(email).trim().toLowerCase();
    const user = await getUserByEmail(trimmed);

    // Return friendly generic message even if email is not found (prevents user enumeration)
    if (!user) {
      return NextResponse.json({
        message: 'If an account exists with this email, a password reset link has been sent.',
      });
    }

    const token = generateSecureToken(32);
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
    await createEmailToken(user.id, token, 'reset_password', expiresAt);

    await sendPasswordResetEmail(user.email, user.name, token);

    return NextResponse.json({
      message: 'If an account exists with this email, a password reset link has been sent.',
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : String(error);
    console.error('Forgot password error:', err);
    return NextResponse.json({ error: 'Failed to process request.' }, { status: 500 });
  }
}
