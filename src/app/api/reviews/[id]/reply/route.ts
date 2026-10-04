import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { requirePermission } from '@/lib/permissions';
import { getDb, createNotification } from '@/lib/db';
import { logAudit } from '@/lib/db/governance';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    const authCheck = await requirePermission(user, 'moderate_reviews');
    if (!authCheck.authorized) {
      return NextResponse.json({ error: authCheck.error }, { status: 403 });
    }

    const { id } = await params;
    const reviewId = parseInt(id, 10);
    if (isNaN(reviewId)) {
      return NextResponse.json({ error: 'Invalid review id' }, { status: 400 });
    }

    const body = await request.json();
    const { reply_text } = body;

    if (!reply_text || String(reply_text).trim().length < 3) {
      return NextResponse.json({ error: 'Reply text cannot be empty' }, { status: 400 });
    }

    const cleanReply = String(reply_text).trim();
    const db = getDb();

    const review = db.prepare('SELECT id, user_id, author, place_id FROM reviews WHERE id = ?').get(reviewId) as {
      id: number;
      user_id?: number;
      author: string;
      place_id: number;
    } | undefined;

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Check if reply already exists (insert or update)
    const existingReply = db.prepare('SELECT id FROM review_replies WHERE review_id = ?').get(reviewId) as { id: number } | undefined;

    if (existingReply) {
      db.prepare(
        "UPDATE review_replies SET reply_text = ?, author_id = ?, updated_at = datetime('now') WHERE review_id = ?"
      ).run(cleanReply, user?.id, reviewId);
    } else {
      db.prepare(
        'INSERT INTO review_replies (review_id, author_id, reply_text) VALUES (?, ?, ?)'
      ).run(reviewId, user?.id, cleanReply);
    }

    // Notify original reviewer if they are a registered user
    if (review.user_id) {
      await createNotification({
        userId: review.user_id,
        type: 'staff_reply',
        title: 'Response from the UncoverCeylon Team',
        body: `Our team replied to your review on destination #${review.place_id}.`,
        link: `/places/${review.place_id}`,
      });
    }

    await logAudit({
      userId: user?.id,
      userEmail: user?.email,
      userRole: user?.role,
      action: existingReply ? 'edit_review_reply' : 'post_review_reply',
      entityType: 'review',
      entityId: reviewId,
      details: `Staff replied to review #${reviewId} by "${review.author}"`,
      ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    return NextResponse.json({
      success: true,
      message: 'Official response posted successfully.',
    });
  } catch (err: unknown) {
    console.error('Staff reply error:', err);
    const msg = err instanceof Error ? err.message : 'Failed to post reply';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
