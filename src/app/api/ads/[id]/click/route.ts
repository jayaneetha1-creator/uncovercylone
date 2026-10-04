/**
 * src/app/api/ads/[id]/click/route.ts
 * Endpoint to record ad click and return target URL for redirect.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdById, recordAdClick } from '@/lib/db/ads';

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

    const ad = await getAdById(adId);
    if (!ad) {
      return NextResponse.json({ error: 'Ad not found' }, { status: 404 });
    }

    await recordAdClick(adId);
    return NextResponse.json({ success: true, target_url: ad.target_url });
  } catch (error) {
    console.error('API /api/ads/[id]/click error:', error);
    return NextResponse.json({ error: 'Failed to record click' }, { status: 500 });
  }
}
