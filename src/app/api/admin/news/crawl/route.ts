/**
 * src/app/api/admin/news/crawl/route.ts
 * Admin endpoint to trigger a manual news crawl using Gemini Grounding.
 * Protected by RBAC: requirePermission('manage_news').
 */

import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/permissions';
import { runNewsCrawler } from '@/lib/news/crawler';
import { logAudit } from '@/lib/db/admin';

export async function POST(request: NextRequest) {
  const perm = await requirePermission(request, 'manage_news');
  if (!perm.authorized) return perm.response;

  try {
    const result = await runNewsCrawler('manual');

    await logAudit({
      userId: perm.user.id,
      userEmail: perm.user.email,
      userRole: perm.user.role,
      action: 'TRIGGER_NEWS_CRAWLER',
      entityType: 'news_crawler',
      entityId: 'manual',
      details: `Manual news crawl triggered: found=${result.itemsFound}, added=${result.itemsAdded}, success=${result.success}`,
    });

    return NextResponse.json({
      success: result.success,
      itemsFound: result.itemsFound,
      itemsAdded: result.itemsAdded,
      message: result.message,
    });
  } catch (error) {
    console.error('API /api/admin/news/crawl POST error:', error);
    return NextResponse.json(
      { error: 'Crawler execution failed', details: String(error) },
      { status: 500 }
    );
  }
}
