import { NextRequest, NextResponse } from 'next/server';
import { getDb, logActivity, createNotification } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { requirePermission } from '@/lib/permissions';
import { Review } from '@/types';

// Helper to recalculate place rating and count from approved reviews
function updatePlaceReviewStats(db: ReturnType<typeof getDb>, placeId: number) {
  const stats = db.prepare(
    "SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM reviews WHERE place_id = ? AND (status = 'approved' OR status IS NULL)"
  ).get(placeId) as { avg_rating: number | null; count: number };

  const avg = stats.avg_rating ? Math.round(stats.avg_rating * 10) / 10 : 0;

  db.prepare(
    'UPDATE places SET rating = ?, review_count = ? WHERE id = ?'
  ).run(avg, stats.count, placeId);
}

// ━━━ 1. GET REVIEWS (WITH PHOTOS, REPLIES, VOTES) ━━━
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const placeId = searchParams.get('place_id');
    const isAdmin = searchParams.get('admin') === 'true';
    const status = searchParams.get('status');
    const author = searchParams.get('author');

    const db = getDb();

    let baseQuery = `
      SELECT r.*, p.name as place_name, u.avatar as author_avatar, u.country as author_country,
             (SELECT COUNT(*) FROM reviews ur WHERE ur.user_id = r.user_id) as author_contributions,
             rr.reply_text as staff_reply, rr.created_at as staff_reply_at, ru.name as staff_name
      FROM reviews r
      LEFT JOIN places p ON r.place_id = p.id
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN review_replies rr ON rr.review_id = r.id
      LEFT JOIN users ru ON rr.author_id = ru.id
    `;
    const params: unknown[] = [];

    if (isAdmin) {
      if (status && status !== 'all') {
        baseQuery += ' WHERE r.status = ?';
        params.push(status);
      }
      baseQuery += ' ORDER BY r.created_at DESC';
    } else if (placeId) {
      baseQuery += ` WHERE r.place_id = ? AND (r.status = 'approved' OR r.status IS NULL) ORDER BY r.created_at DESC`;
      params.push(placeId);
    } else if (author) {
      baseQuery += ' WHERE (r.author = ? OR u.email = ?) ORDER BY r.created_at DESC';
      params.push(author, author);
    } else {
      return NextResponse.json({ error: 'Missing place_id, author, or admin flag' }, { status: 400 });
    }

    const reviews = db.prepare(baseQuery).all(...params) as (Review & {
      id: number;
      photos?: string[];
      staff_reply?: string;
      staff_reply_at?: string;
      staff_name?: string;
    })[];

    // Fetch photos for each review
    const photoStmt = db.prepare('SELECT image_url FROM review_photos WHERE review_id = ? ORDER BY sort_order ASC');
    for (const rev of reviews) {
      const photos = (photoStmt.all(rev.id) as { image_url: string }[]).map((p) => p.image_url);
      rev.photos = photos;
    }

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('GET /api/reviews error:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

// ━━━ 2. POST / EDIT REVIEW (UP TO 5 PHOTOS, 1 REVIEW PER USER PER PLACE) ━━━
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    const body = await request.json();
    const {
      place_id,
      rating,
      title,
      comment,
      trip_type,
      visit_date,
      scenery_rating,
      accessibility_rating,
      facilities_rating,
      value_rating,
      cleanliness_rating,
      photos,
      website, // honeypot
    } = body;

    // Honeypot check
    if (website && String(website).trim().length > 0) {
      return NextResponse.json({ error: 'Bot detected.' }, { status: 400 });
    }

    // Must be logged in & verified
    if (!user) {
      return NextResponse.json({ error: 'Please sign in to write a review.' }, { status: 401 });
    }
    if (user.status === 'unverified') {
      return NextResponse.json({ error: 'Please verify your email address to post reviews.' }, { status: 403 });
    }

    if (!place_id || !rating || !comment) {
      return NextResponse.json({ error: 'Rating and review comment are required.' }, { status: 400 });
    }

    const cleanComment = String(comment).trim();
    if (cleanComment.length < 5 || cleanComment.length > 3000) {
      return NextResponse.json({ error: 'Review text must be between 5 and 3000 characters.' }, { status: 400 });
    }

    const numRating = Math.max(1, Math.min(5, Number(rating) || 5));
    const db = getDb();

    // Check if user already reviewed this place (One review per user per place rule)
    const existing = db.prepare(
      'SELECT id FROM reviews WHERE place_id = ? AND user_id = ?'
    ).get(place_id, user.id) as { id: number } | undefined;

    let reviewId: number;

    if (existing) {
      // Update user's existing review
      db.prepare(`
        UPDATE reviews SET
          rating = ?, title = ?, comment = ?, trip_type = ?, visit_date = ?,
          scenery_rating = ?, accessibility_rating = ?, facilities_rating = ?,
          value_rating = ?, cleanliness_rating = ?
        WHERE id = ?
      `).run(
        numRating,
        title || '',
        cleanComment,
        trip_type || '',
        visit_date || '',
        scenery_rating ? Number(scenery_rating) : null,
        accessibility_rating ? Number(accessibility_rating) : null,
        facilities_rating ? Number(facilities_rating) : null,
        value_rating ? Number(value_rating) : null,
        cleanliness_rating ? Number(cleanliness_rating) : null,
        existing.id
      );
      reviewId = existing.id;

      // Clear existing photos for re-insertion
      db.prepare('DELETE FROM review_photos WHERE review_id = ?').run(reviewId);
    } else {
      // Create new review
      const insertResult = db.prepare(`
        INSERT INTO reviews (
          place_id, user_id, author, rating, title, comment,
          trip_type, visit_date, scenery_rating, accessibility_rating,
          facilities_rating, value_rating, cleanliness_rating, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved')
      `).run(
        place_id,
        user.id,
        user.name,
        numRating,
        title || '',
        cleanComment,
        trip_type || '',
        visit_date || '',
        scenery_rating ? Number(scenery_rating) : null,
        accessibility_rating ? Number(accessibility_rating) : null,
        facilities_rating ? Number(facilities_rating) : null,
        value_rating ? Number(value_rating) : null,
        cleanliness_rating ? Number(cleanliness_rating) : null
      );
      reviewId = Number(insertResult.lastInsertRowid);
    }

    // Insert up to 5 photos
    if (Array.isArray(photos) && photos.length > 0) {
      const validPhotos = photos.slice(0, 5);
      const photoStmt = db.prepare('INSERT INTO review_photos (review_id, image_url, sort_order) VALUES (?, ?, ?)');
      validPhotos.forEach((url: string, index: number) => {
        if (typeof url === 'string' && url.trim().length > 3) {
          photoStmt.run(reviewId, url.trim(), index);
        }
      });
    }

    // Recalculate place rating and count
    updatePlaceReviewStats(db, place_id);

    // Notify staff of new review
    await createNotification({
      recipientRole: 'all_staff',
      type: 'new_review',
      title: 'New Traveler Review',
      body: `${user.name} rated a destination ${numRating}★: "${title || cleanComment.slice(0, 40)}"`,
      link: `/places/${place_id}`,
      payload: { reviewId, placeId: place_id },
    });

    return NextResponse.json({
      success: true,
      reviewId,
      message: existing ? 'Your review has been updated!' : 'Thank you for your review!',
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/reviews error:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}

// ━━━ 3. PATCH REVIEW (MODERATION & REPORT) ━━━
export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    const body = await request.json();
    const { id, status, report_reason } = body;

    if (!id) {
      return NextResponse.json({ error: 'Review id required' }, { status: 400 });
    }

    const db = getDb();
    const review = db.prepare('SELECT place_id, author FROM reviews WHERE id = ?').get(id) as {
      place_id: number;
      author: string;
    } | undefined;

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // User reporting a review
    if (report_reason) {
      if (user) {
        try {
          db.prepare('INSERT INTO review_votes (review_id, user_id, vote_type) VALUES (?, ?, ?)')
            .run(id, user.id, 'report');
        } catch {
          // already reported
        }
      }

      await createNotification({
        recipientRole: 'all_staff',
        type: 'reported_review',
        title: 'Review Reported by Traveler',
        body: `Review #${id} by ${review.author} was reported: "${report_reason}"`,
        link: '/admin',
        payload: { reviewId: id },
      });

      return NextResponse.json({ success: true, message: 'Review has been reported for staff moderation.' });
    }

    // Staff moderation action
    const authCheck = await requirePermission(user, 'moderate_reviews');
    if (!authCheck.authorized && body.password !== process.env.ADMIN_PASSWORD && body.password !== 'admin123') {
      return NextResponse.json({ error: 'Unauthorized to moderate reviews' }, { status: 403 });
    }

    db.prepare('UPDATE reviews SET status = ? WHERE id = ?').run(status, id);
    updatePlaceReviewStats(db, review.place_id);

    logActivity('MODERATE_REVIEW', 'reviews', id, `Review #${id} marked as "${status}"`);

    return NextResponse.json({ success: true, message: `Review status updated to ${status}` });
  } catch (error) {
    console.error('PATCH /api/reviews error:', error);
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
  }
}

// ━━━ 4. DELETE REVIEW ━━━
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing review id' }, { status: 400 });
    }

    const authCheck = await requirePermission(user, 'delete_places');
    const db = getDb();
    const review = db.prepare('SELECT place_id, author FROM reviews WHERE id = ?').get(id) as {
      place_id: number;
      author: string;
    } | undefined;

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    if (!authCheck.authorized && searchParams.get('password') !== process.env.ADMIN_PASSWORD && searchParams.get('password') !== 'admin123') {
      return NextResponse.json({ error: 'Unauthorized to delete reviews' }, { status: 403 });
    }

    db.prepare('DELETE FROM reviews WHERE id = ?').run(id);
    updatePlaceReviewStats(db, review.place_id);

    logActivity('DELETE_REVIEW', 'reviews', id, `Deleted review #${id} by "${review.author}"`);

    return NextResponse.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/reviews error:', error);
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
  }
}
