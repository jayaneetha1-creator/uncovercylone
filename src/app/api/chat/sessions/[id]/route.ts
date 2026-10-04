/**
 * src/app/api/chat/sessions/[id]/route.ts
 * Endpoint to load messages for a specific session or delete a chat session from Recents.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getSessionMessages, deleteUserSession } from '@/lib/db/ai';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const messages = await getSessionMessages(id, 60);
    return NextResponse.json({ messages });
  } catch (err) {
    console.error('API /api/chat/sessions/[id] GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const ok = await deleteUserSession(id, user.id);
    return NextResponse.json({ success: ok });
  } catch (err) {
    console.error('API /api/chat/sessions/[id] DELETE error:', err);
    return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 });
  }
}
