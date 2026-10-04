import { NextRequest, NextResponse } from 'next/server';
import { getDb, logActivity } from '@/lib/db';
import { Review } from '@/types';

// Helper to recalculate a place's rating and review count from approved reviews only
function updatePlaceReviewStats(db: ReturnType<typeof getDb>, placeId: number) {
  const stats = db.prepare(
    "SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM reviews WHERE place_id = ? AND (status = 'approved' OR status IS NULL)"
  ).get(placeId) as { avg_rating: number | null; count: number };

  const avg = stats.avg_rating ? Math.round(stats.avg_rating * 10) / 10 : 0;

  db.prepare(
    'UPDATE places SET rating = ?, review_count = ? WHERE id = ?'
  ).run(avg, stats.count, placeId);
}

// ━━━ 1. GET REVIEWS (WITH OPTIONAL ADMIN & PLACE FILTERS) ━━━
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const placeId = searchParams.get('place_id');
    const isAdmin = searchParams.get('admin') === 'true';
    const status = searchParams.get('status');

    const db = getDb();

    if (isAdmin) {
      // Admin query with joined place name
      let query = `
        SELECT r.*, p.name as place_name 
        FROM reviews r
        LEFT JOIN places p ON r.place_id = p.id
      `;
      const params: unknown[] = [];

      if (status && status !== 'all') {
        query += ' WHERE r.status = ?';
        params.push(status);
      }

      query += ' ORDER BY r.created_at DESC';

      const reviews = db.prepare(query).all(...params) as Review[];
      return NextResponse.json({ reviews });
    }

    // Public query for place detail
    if (placeId) {
      const reviews = db.prepare(`
        SELECT * FROM reviews 
        WHERE place_id = ? AND (status = 'approved' OR status IS NULL)
        ORDER BY created_at DESC
      `).all(placeId) as Review[];

      return NextResponse.json({ reviews });
    }

    // Author query for user profile
    const author = searchParams.get('author');
    if (author) {
      const reviews = db.prepare(`
        SELECT r.*, p.name as place_name 
        FROM reviews r
        LEFT JOIN places p ON r.place_id = p.id
        WHERE r.author = ?
        ORDER BY r.created_at DESC
      `).all(author) as Review[];

      return NextResponse.json({ reviews });
    }

    return NextResponse.json({ error: 'Missing place_id, author, or admin flag' }, { status: 400 });
  } catch (error) {
    console.error('GET /api/reviews error:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

// ━━━ 2. POST REVIEW (WITH HONEYPOT & ANTI-SPAM DETECTION) ━━━
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { place_id, author, rating, comment, website, challenge_answer, expected_challenge } = body;

    // 1. Honeypot check: If invisible 'website' field is populated, silently reject (Bot caught)
    if (website && String(website).trim().length > 0) {
      return NextResponse.json(
        { error: 'Bot detected. Submission ignored.' },
        { status: 400 }
      );
    }

    // 2. Math Challenge check (if challenge was requested)
    if (expected_challenge !== undefined && challenge_answer !== undefined) {
      if (String(challenge_answer).trim() !== String(expected_challenge).trim()) {
        return NextResponse.json(
          { error: 'Incorrect verification answer. Please try again.' },
          { status: 400 }
        );
      }
    }

    // 3. Validation
    if (!place_id || !author || !rating || !comment) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const cleanAuthor = String(author).trim();
    const cleanComment = String(comment).trim();

    if (cleanAuthor.length < 2 || cleanAuthor.length > 60) {
      return NextResponse.json({ error: 'Name must be between 2 and 60 characters.' }, { status: 400 });
    }

    if (cleanComment.length < 8 || cleanComment.length > 2500) {
      return NextResponse.json({ error: 'Review must be between 8 and 2500 characters.' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    // 4. Automated Spam & Link-farming filter
    const linkCount = (cleanComment.match(/https?:\/\//gi) || []).length;
    const spamKeywords = ['casino', 'viagra', 'crypto', 'telegram.me', 'whatsapp.me', 'forex', 'free followers', 'seo service'];
    const hasSpamKeyword = spamKeywords.some((kw) => cleanComment.toLowerCase().includes(kw));

    let reviewStatus: 'approved' | 'pending' | 'spam' = 'approved';

    if (linkCount >= 2 || hasSpamKeyword) {
      // Mark as pending/spam for admin review
      reviewStatus = 'pending';
    }

    const db = getDb();

    const result = db.prepare(`
      INSERT INTO reviews (place_id, author, rating, comment, status)
      VALUES (?, ?, ?, ?, ?)
    `).run(place_id, cleanAuthor, rating, cleanComment, reviewStatus);

    // Update place stats if approved
    if (reviewStatus === 'approved') {
      updatePlaceReviewStats(db, place_id);
    }

    return NextResponse.json({
      id: result.lastInsertRowid,
      status: reviewStatus,
      message:
        reviewStatus === 'pending'
          ? 'Thank you! Your review was received and is pending moderation.'
          : 'Thank you! Review posted successfully.',
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/reviews error:', error);
    return NextResponse.json({ error: 'Failed to add review' }, { status: 500 });
  }
}

// ━━━ 3. PATCH REVIEW (ADMIN MODERATION: APPROVE / SPAM / PENDING) ━━━
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !['approved', 'pending', 'spam'].includes(status)) {
      return NextResponse.json({ error: 'Invalid id or status' }, { status: 400 });
    }

    const db = getDb();

    // Find review to get place_id and author
    const review = db.prepare('SELECT place_id, author FROM reviews WHERE id = ?').get(id) as { place_id: number; author: string } | undefined;
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    db.prepare('UPDATE reviews SET status = ? WHERE id = ?').run(status, id);

    // Recalculate place statistics
    updatePlaceReviewStats(db, review.place_id);

    logActivity('MODERATE_REVIEW', 'reviews', id, `Review #${id} by "${review.author}" marked as "${status}"`);

    return NextResponse.json({ success: true, message: `Review status updated to ${status}` });
  } catch (error) {
    console.error('PATCH /api/reviews error:', error);
    return NextResponse.json({ error: 'Failed to update review status' }, { status: 500 });
  }
}

// ━━━ 4. DELETE REVIEW (ADMIN CLEANUP) ━━━
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing review id' }, { status: 400 });
    }

    const db = getDb();

    const review = db.prepare('SELECT place_id, author FROM reviews WHERE id = ?').get(id) as { place_id: number; author: string } | undefined;
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    db.prepare('DELETE FROM reviews WHERE id = ?').run(id);

    // Recalculate place statistics
    updatePlaceReviewStats(db, review.place_id);

    logActivity('DELETE_REVIEW', 'reviews', id, `Deleted review #${id} by "${review.author}"`);

    return NextResponse.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/reviews error:', error);
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
  }
}
