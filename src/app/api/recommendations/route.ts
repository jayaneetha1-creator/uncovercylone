/**
 * src/app/api/recommendations/route.ts
 * Multi-factor recommendation endpoint for "Nearby & you might like", Home "Picked for you", etc.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRecommendations } from '@/lib/recommend';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const placeIdParam = searchParams.get('placeId');
    const limitParam = searchParams.get('limit');
    const latParam = searchParams.get('lat');
    const lngParam = searchParams.get('lng');
    const sessionId = searchParams.get('sessionId') || undefined;
    const excludeParam = searchParams.get('exclude');

    const currentPlaceId = placeIdParam ? parseInt(placeIdParam, 10) : undefined;
    const limit = limitParam ? parseInt(limitParam, 10) : 6;
    const userLat = latParam ? parseFloat(latParam) : undefined;
    const userLng = lngParam ? parseFloat(lngParam) : undefined;

    let excludeIds: number[] = [];
    if (excludeParam) {
      excludeIds = excludeParam
        .split(',')
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n));
    }

    const user = await getCurrentUser(request);

    const recommendations = await getRecommendations({
      currentPlaceId,
      userId: user ? user.id : null,
      sessionId,
      limit,
      excludeIds,
      userLat,
      userLng,
    });

    return NextResponse.json({
      success: true,
      count: recommendations.length,
      recommendations,
    });
  } catch (error) {
    console.error('API /api/recommendations error:', error);
    return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 });
  }
}
