/**
 * src/app/api/admin/news/[id]/route.ts
 * Admin endpoint to update, pin/unpin, hide, or delete a news article.
 * Enforces owner-only direct deletion; non-owners queue a Change Request.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/permissions';
import { getNewsById, updateNewsItem, deleteNewsItem } from '@/lib/db/news';
import { createChangeRequest } from '@/lib/db/governance';
import { logAudit } from '@/lib/db/admin';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const perm = await requirePermission(request, 'manage_news');
  if (!perm.authorized) return perm.response;

  try {
    const { id } = await context.params;
    const newsId = parseInt(id, 10);
    if (isNaN(newsId)) {
      return NextResponse.json({ error: 'Invalid news article ID' }, { status: 400 });
    }

    const existing = await getNewsById(newsId);
    if (!existing) {
      return NextResponse.json({ error: 'News article not found' }, { status: 404 });
    }

    const body = await request.json();
    const ok = await updateNewsItem(newsId, {
      title: body.title,
      summary: body.summary,
      content: body.content,
      category: body.category,
      source_name: body.source_name,
      source_url: body.source_url,
      image_url: body.image_url,
      related_place_ids: body.related_place_ids,
      status: body.status,
      is_pinned: body.is_pinned !== undefined ? (body.is_pinned ? 1 : 0) : undefined,
      published_at: body.published_at,
    });

    if (!ok) {
      return NextResponse.json({ error: 'Failed to update news article' }, { status: 500 });
    }

    await logAudit({
      userId: perm.user.id,
      userEmail: perm.user.email,
      userRole: perm.user.role,
      action: 'UPDATE_NEWS_ARTICLE',
      entityType: 'news_items',
      entityId: String(newsId),
      details: `Updated news #${newsId} ("${body.title || existing.title}") [status=${body.status ?? existing.status}, pinned=${body.is_pinned ?? existing.is_pinned}]`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API /api/admin/news/[id] PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const perm = await requirePermission(request, 'manage_news');
  if (!perm.authorized) return perm.response;

  try {
    const { id } = await context.params;
    const newsId = parseInt(id, 10);
    if (isNaN(newsId)) {
      return NextResponse.json({ error: 'Invalid news article ID' }, { status: 400 });
    }

    const existing = await getNewsById(newsId);
    if (!existing) {
      return NextResponse.json({ error: 'News article not found' }, { status: 404 });
    }

    // Strict RBAC: Only 'owner' can directly delete. Non-owners queue a deletion request.
    if (perm.user.role !== 'owner') {
      let bodyReason = '';
      try {
        const body = await request.json();
        bodyReason = body.reason || '';
      } catch {
        // No body provided
      }

      const requestId = await createChangeRequest({
        userId: perm.user.id,
        actionType: 'delete',
        entityType: 'news_items',
        entityId: newsId,
        reason: bodyReason || `Staff requested deletion of news article #${newsId} ("${existing.title}")`,
      });

      await logAudit({
        userId: perm.user.id,
        userEmail: perm.user.email,
        userRole: perm.user.role,
        action: 'REQUEST_DELETE_NEWS',
        entityType: 'news_items',
        entityId: String(newsId),
        details: `Submitted deletion request #${requestId} for news article "${existing.title}"`,
      });

      return NextResponse.json({
        success: true,
        pendingApproval: true,
        requestId,
        message: 'Deletion request submitted for owner approval.',
      });
    }

    // Owner direct deletion
    const ok = await deleteNewsItem(newsId);
    if (!ok) {
      return NextResponse.json({ error: 'Failed to delete news article' }, { status: 500 });
    }

    await logAudit({
      userId: perm.user.id,
      userEmail: perm.user.email,
      userRole: perm.user.role,
      action: 'DELETE_NEWS_ARTICLE',
      entityType: 'news_items',
      entityId: String(newsId),
      details: `Owner permanently deleted news article #${newsId} ("${existing.title}")`,
    });

    return NextResponse.json({ success: true, message: 'News article deleted.' });
  } catch (error) {
    console.error('API /api/admin/news/[id] DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
