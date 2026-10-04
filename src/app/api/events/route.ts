/**
 * src/app/api/events/route.ts
 * Endpoint for tracking analytics events (views, clicks, saves, directions, searches).
 * Privacy-friendly: stores no PII.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { recordEvent } from '@/lib/db/analytics';
import { EventType } from '@/types';

export async function POST(request: NextRequest) {
  try {
    let body: {
      session_id?: string;
      event_type?: EventType;
      place_id?: number | null;
      source?: string;
      dwell_time?: number;
      metadata?: string | Record<string, unknown>;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    if (!body.session_id || !body.event_type) {
      return NextResponse.json({ error: 'Missing session_id or event_type' }, { status: 400 });
    }

    const user = await getCurrentUser(request);

    const metadataStr =
      typeof body.metadata === 'object' && body.metadata !== null
        ? JSON.stringify(body.metadata)
        : typeof body.metadata === 'string'
        ? body.metadata
        : null;

    const ok = await recordEvent({
      session_id: body.session_id,
      event_type: body.event_type,
      place_id: body.place_id ? Number(body.place_id) : null,
      user_id: user ? user.id : null,
      source: body.source || '',
      dwell_time: body.dwell_time ? Number(body.dwell_time) : 0,
      metadata: metadataStr,
    });

    return NextResponse.json({ success: ok });
  } catch (error) {
    console.error('API /api/events error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
