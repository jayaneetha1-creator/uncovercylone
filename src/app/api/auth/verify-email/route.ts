import { NextRequest, NextResponse } from 'next/server';
import { getEmailToken, markEmailTokenUsed, updateUser } from '@/lib/db/users';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Valid verification token is required.' }, { status: 400 });
    }

    const tokenRecord = await getEmailToken(token, 'verify_email');
    if (!tokenRecord) {
      return NextResponse.json({ error: 'Verification token is invalid, expired, or already used.' }, { status: 400 });
    }

    // Activate user
    await updateUser(tokenRecord.user_id, {
      status: 'active',
      email_verified_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
    });

    await markEmailTokenUsed(token);

    return NextResponse.json({ message: 'Email verified successfully! You can now sign in.' });
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : String(error);
    console.error('Verify email error:', err);
    return NextResponse.json({ error: 'Failed to verify email. Please try again.' }, { status: 500 });
  }
}
