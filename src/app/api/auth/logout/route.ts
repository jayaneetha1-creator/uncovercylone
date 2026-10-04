import { NextRequest, NextResponse } from 'next/server';
import { deleteSession } from '@/lib/db/users';
import { SESSION_COOKIE_NAME } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (sessionCookie) {
      await deleteSession(sessionCookie);
    }

    const response = NextResponse.json({ message: 'Logged out successfully' });
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : String(error);
    console.error('Logout error:', err);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}
