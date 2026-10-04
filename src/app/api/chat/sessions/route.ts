/**
 * src/app/api/chat/sessions/route.ts
 * Endpoint to list recent chat sessions for signed-in users (Recents).
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getUserSessions } from '@/lib/db/ai';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ sessions: [] });
    }

    const sessions = await getUserSessions(user.id);
    return NextResponse.json({ sessions });
  } catch (err) {
    console.error('API /api/chat/sessions GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}
