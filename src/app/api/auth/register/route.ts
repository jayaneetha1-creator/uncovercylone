import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, createUser, createEmailToken } from '@/lib/db/users';
import { hashPassword, generateSecureToken, checkRateLimit } from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/mailer';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    if (!checkRateLimit(`register_${ip}`, 5, 60)) {
      return NextResponse.json({ error: 'Too many registration attempts. Please try again later.' }, { status: 429 });
    }

    const body = await request.json();
    const { email, password, name, country } = body;

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Email, password, and name are required.' }, { status: 400 });
    }

    const trimmedEmail = String(email).trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    if (String(password).length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long.' }, { status: 400 });
    }

    const existingUser = await getUserByEmail(trimmedEmail);
    if (existingUser) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
    }

    const passwordHash = await hashPassword(String(password));
    const userId = await createUser({
      email: trimmedEmail,
      password_hash: passwordHash,
      name: String(name).trim(),
      country: String(country || 'Sri Lanka').trim(),
      role: 'user',
      status: 'unverified',
    });

    // Generate 24h verification token
    const token = generateSecureToken(32);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await createEmailToken(userId, token, 'verify_email', expiresAt);

    // Send verification email
    await sendVerificationEmail(trimmedEmail, String(name).trim(), token);

    return NextResponse.json(
      {
        message: 'Account created successfully! Please check your email inbox to verify your account.',
        userId,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : String(error);
    console.error('Registration error:', err);
    return NextResponse.json({ error: 'Failed to create account. Please try again.' }, { status: 500 });
  }
}
