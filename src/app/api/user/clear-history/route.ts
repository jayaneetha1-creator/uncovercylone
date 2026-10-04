/**
 * src/app/api/user/clear-history/route.ts
 * Allows visitors/users to clear their stored journey and event history for privacy.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { clearUserHistory } from '@/lib/db/analytics';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const sessionId = body.session_id;

    if (!sessionId && typeof sessionId !== 'string') {
      return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
    }

    const user = await getCurrentUser(request);
    const ok = await clearUserHistory(sessionId, user ? user.id : null);

    return NextResponse.json({ success: ok, message: 'History cleared successfully.' });
  } catch (error) {
    console.error('API /api/user/clear-history error:', error);
    return NextResponse.json({ error: 'Failed to clear history' }, { status: 500 });
  }
}
