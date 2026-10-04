/**
 * src/app/api/ads/[id]/impression/route.ts
 * Endpoint to record ad impressions.
 */

import { NextRequest, NextResponse } from 'next/server';
import { recordAdImpression } from '@/lib/db/ads';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const adId = parseInt(id, 10);
    if (isNaN(adId)) {
      return NextResponse.json({ error: 'Invalid ad ID' }, { status: 400 });
    }

    await recordAdImpression(adId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API /api/ads/[id]/impression error:', error);
    return NextResponse.json({ error: 'Failed to record impression' }, { status: 500 });
  }
}
