/**
 * src/app/api/news/[id]/route.ts
 * Public endpoint to fetch a single news item by ID or slug.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getNewsById, getNewsBySlug } from '@/lib/db/news';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await context.params;
    const numId = parseInt(rawId, 10);

    let item = null;
    if (!isNaN(numId) && numId > 0) {
      item = await getNewsById(numId);
    } else {
      item = await getNewsBySlug(rawId);
    }

    if (!item) {
      return NextResponse.json({ error: 'News article not found' }, { status: 404 });
    }

    if (item.status !== 'published' && item.status !== 'pinned') {
      return NextResponse.json({ error: 'Article is not published' }, { status: 403 });
    }

    return NextResponse.json({ item });
  } catch (err) {
    console.error('Error fetching news item:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
