/**
 * src/app/api/news/route.ts
 * Public endpoint to fetch published Sri Lanka Tourism News.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPublishedNews, getNewsSettings, seedInitialNewsIfEmpty } from '@/lib/db/news';
import { isNodeEnabled } from '@/lib/db/nodes';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Check if news page is enabled in Site Tree
    const isPageActive = await isNodeEnabled('page_news');
    const settings = await getNewsSettings();

    if (!isPageActive || !settings.enabled) {
      return NextResponse.json({
        items: [],
        total: 0,
        categoryCounts: {},
        disabled: true,
      });
    }

    // Ensure initial high quality news is seeded if DB is fresh
    await seedInitialNewsIfEmpty();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const query = searchParams.get('q') || undefined;
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const result = await getPublishedNews({
      category,
      query,
      limit: Math.min(Math.max(limit, 1), 100),
      offset: Math.max(offset, 0),
    });

    return NextResponse.json({
      ...result,
      settings: {
        lastRun: settings.lastRun,
      },
      disabled: false,
    });
  } catch (err) {
    console.error('Error fetching public news:', err);
    return NextResponse.json(
      { error: 'Failed to load news articles', items: [], total: 0 },
      { status: 500 }
    );
  }
}
