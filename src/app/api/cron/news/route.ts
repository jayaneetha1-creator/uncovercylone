/**
 * src/app/api/cron/news/route.ts
 * Secured automated cron endpoint to execute scheduled tourism news crawl.
 * Can be triggered 3x/day (e.g. 06:00, 13:00, 20:00 Asia/Colombo).
 * Authentication: Bearer token matching CRON_SECRET or ?secret= query param.
 */

import { NextRequest, NextResponse } from 'next/server';
import { runNewsCrawler } from '@/lib/news/crawler';

export async function GET(request: NextRequest) {
  return handleCron(request);
}

export async function POST(request: NextRequest) {
  return handleCron(request);
}

async function handleCron(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET || 'uncoverceylon_cron_secret_key';
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  const { searchParams } = new URL(request.url);
  const querySecret = searchParams.get('secret');

  // Verify authentication
  if (token !== cronSecret && querySecret !== cronSecret && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized: Invalid cron secret' }, { status: 401 });
  }

  try {
    const result = await runNewsCrawler('scheduled');
    return NextResponse.json({
      success: result.success,
      itemsFound: result.itemsFound,
      itemsAdded: result.itemsAdded,
      message: result.message,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[Cron News API] Execution error:', err);
    return NextResponse.json(
      { error: 'Scheduled crawler execution failed', details: String(err) },
      { status: 500 }
    );
  }
}
