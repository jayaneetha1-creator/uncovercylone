/**
 * src/app/api/admin/news/route.ts
 * Admin endpoint to list, filter, create news articles, and manage news settings.
 * Protected by RBAC: requirePermission('manage_news').
 */

import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/permissions';
import {
  getAllNewsAdmin,
  createNewsItem,
  getNewsSettings,
  updateNewsSettings,
} from '@/lib/db/news';
import { logAudit } from '@/lib/db/admin';

export async function GET(request: NextRequest) {
  const perm = await requirePermission(request, 'manage_news');
  if (!perm.authorized) return perm.response;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const category = searchParams.get('category') || undefined;
    const query = searchParams.get('q') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const [newsData, settings] = await Promise.all([
      getAllNewsAdmin({ status, category, query, limit, offset }),
      getNewsSettings(),
    ]);

    return NextResponse.json({
      success: true,
      ...newsData,
      settings,
    });
  } catch (error) {
    console.error('API /api/admin/news GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch admin news data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const perm = await requirePermission(request, 'manage_news');
  if (!perm.authorized) return perm.response;

  try {
    const body = await request.json();

    // If payload contains 'settingsUpdate', handle settings update
    if (body.action === 'update_settings') {
      const updated = await updateNewsSettings({
        enabled: body.enabled !== undefined ? Boolean(body.enabled) : undefined,
        autoPublish: body.autoPublish !== undefined ? Boolean(body.autoPublish) : undefined,
        schedule: typeof body.schedule === 'string' ? body.schedule : undefined,
      });

      await logAudit({
        userId: perm.user.id,
        userEmail: perm.user.email,
        userRole: perm.user.role,
        action: 'UPDATE_NEWS_SETTINGS',
        entityType: 'news_settings',
        entityId: 'global',
        details: `Updated news settings: enabled=${updated.enabled}, autoPublish=${updated.autoPublish}, schedule=${updated.schedule}`,
      });

      return NextResponse.json({ success: true, settings: updated });
    }

    // Otherwise, create news article
    if (!body.title || !body.summary || !body.source_name) {
      return NextResponse.json(
        { error: 'Missing required fields: title, summary, source_name' },
        { status: 400 }
      );
    }

    const newsId = await createNewsItem({
      title: body.title,
      summary: body.summary,
      content: body.content || '',
      category: body.category || 'Tourism',
      source_name: body.source_name,
      source_url: body.source_url || '',
      image_url: body.image_url || '',
      related_place_ids: Array.isArray(body.related_place_ids) ? body.related_place_ids : [],
      status: body.status || 'published',
      is_pinned: body.is_pinned ? 1 : 0,
      published_at: body.published_at,
    });

    await logAudit({
      userId: perm.user.id,
      userEmail: perm.user.email,
      userRole: perm.user.role,
      action: 'CREATE_NEWS_ARTICLE',
      entityType: 'news_items',
      entityId: String(newsId),
      details: `Created news article "${body.title}" in category "${body.category || 'Tourism'}"`,
    });

    return NextResponse.json({ success: true, id: newsId });
  } catch (error) {
    console.error('API /api/admin/news POST error:', error);
    return NextResponse.json({ error: 'Failed to create news article' }, { status: 500 });
  }
}
