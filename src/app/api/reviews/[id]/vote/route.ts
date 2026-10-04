import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Please sign in to vote' }, { status: 401 });
    }

    const { id } = await params;
    const reviewId = parseInt(id, 10);
    if (isNaN(reviewId)) {
      return NextResponse.json({ error: 'Invalid review id' }, { status: 400 });
    }

    const db = getDb();

    // Check if user already voted helpful
    const existing = db.prepare(
      'SELECT id FROM review_votes WHERE review_id = ? AND user_id = ? AND vote_type = ?'
    ).get(reviewId, user.id, 'helpful');

    if (existing) {
      // Toggle off / remove vote
      db.prepare('DELETE FROM review_votes WHERE review_id = ? AND user_id = ? AND vote_type = ?')
        .run(reviewId, user.id, 'helpful');

      db.prepare('UPDATE reviews SET helpful_count = MAX(0, helpful_count - 1) WHERE id = ?').run(reviewId);

      return NextResponse.json({ success: true, voted: false, message: 'Helpful vote removed' });
    } else {
      // Add vote
      db.prepare('INSERT INTO review_votes (review_id, user_id, vote_type) VALUES (?, ?, ?)')
        .run(reviewId, user.id, 'helpful');

      db.prepare('UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = ?').run(reviewId);

      return NextResponse.json({ success: true, voted: true, message: 'Marked as helpful' });
    }
  } catch (err: unknown) {
    console.error('Review vote error:', err);
    const msg = err instanceof Error ? err.message : 'Failed to record vote';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
