/**
 * src/app/api/chat/feedback/route.ts
 * Thumbs up / down feedback endpoint for AI messages.
 */

import { NextRequest, NextResponse } from 'next/server';
import { rateChatMessage } from '@/lib/db/ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const messageId = parseInt(body.messageId, 10);
    const feedback = Number(body.feedback); // 1 = helpful, -1 = unhelpful

    if (isNaN(messageId) || (feedback !== 1 && feedback !== -1 && feedback !== 0)) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const ok = await rateChatMessage(messageId, feedback);
    return NextResponse.json({ success: ok });
  } catch (err) {
    console.error('API /api/chat/feedback POST error:', err);
    return NextResponse.json({ error: 'Failed to record feedback' }, { status: 500 });
  }
}
