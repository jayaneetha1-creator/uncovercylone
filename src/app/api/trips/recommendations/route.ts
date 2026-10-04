/**
 * src/app/api/trips/recommendations/route.ts
 * GET /api/trips/recommendations?placeIds=1,2,3
 * Returns co-occurrence suggestions from other travelers' trips and nearby route recommendations
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTripCoOccurrenceSuggestions } from '@/lib/db/trips';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const placeIdsParam = searchParams.get('placeIds') || '';
    const placeIds = placeIdsParam
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));

    const suggestions = await getTripCoOccurrenceSuggestions(placeIds);
    return NextResponse.json({ suggestions });
  } catch (err: any) {
    console.error('GET /api/trips/recommendations error:', err);
    return NextResponse.json({ error: 'Failed to fetch trip recommendations' }, { status: 500 });
  }
}
