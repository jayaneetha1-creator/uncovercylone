import { NextRequest, NextResponse } from 'next/server';
import { getEmailToken, markEmailTokenUsed, updateUserPassword, deleteUserSessions } from '@/lib/db/users';
import { hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and new password are required.' }, { status: 400 });
    }

    if (String(password).length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long.' }, { status: 400 });
    }

    const tokenRecord = await getEmailToken(token, 'reset_password');
    if (!tokenRecord) {
      return NextResponse.json({ error: 'Password reset link is invalid or expired. Please request a new one.' }, { status: 400 });
    }

    const passwordHash = await hashPassword(String(password));
    await updateUserPassword(tokenRecord.user_id, passwordHash);
    await markEmailTokenUsed(token);

    // Invalidate all existing sessions for security
    await deleteUserSessions(tokenRecord.user_id);

    return NextResponse.json({ message: 'Password reset successfully! You can now sign in with your new password.' });
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : String(error);
    console.error('Reset password error:', err);
    return NextResponse.json({ error: 'Failed to reset password.' }, { status: 500 });
  }
}
