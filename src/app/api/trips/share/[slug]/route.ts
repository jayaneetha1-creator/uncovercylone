/**
 * src/app/api/trips/share/[slug]/route.ts
 * GET /api/trips/share/[slug] - Read-only public itinerary endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTripByShareSlug } from '@/lib/db/trips';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    if (!slug) {
      return NextResponse.json({ error: 'Share slug is required' }, { status: 400 });
    }

    const trip = await getTripByShareSlug(slug);
    if (!trip) {
      return NextResponse.json({ error: 'Trip not found or private' }, { status: 404 });
    }

    return NextResponse.json({ trip });
  } catch (err: any) {
    console.error('GET /api/trips/share/[slug] error:', err);
    return NextResponse.json({ error: 'Failed to fetch shared trip' }, { status: 500 });
  }
}
