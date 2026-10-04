import { NextRequest, NextResponse } from 'next/server';
import { getDb, logActivity } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { requirePermission } from '@/lib/permissions';

export interface HeroSlide {
  id: number;
  image_url: string;
  location: string;
  province: string;
  title_en?: string;
  title_si?: string;
  subtitle_en?: string;
  subtitle_si?: string;
  sort_order: number;
  enabled?: number;
  created_at: string;
}

// GET all hero slides
export async function GET() {
  try {
    const db = getDb();
    const slides = db.prepare('SELECT * FROM hero_slides ORDER BY sort_order ASC, id ASC').all() as HeroSlide[];
    return NextResponse.json({ slides });
  } catch (error) {
    console.error('GET /api/hero-slides error:', error);
    return NextResponse.json({ error: 'Failed to fetch slides' }, { status: 500 });
  }
}

// POST — add a new slide
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    const authCheck = await requirePermission(user, 'manage_slides');
    const body = await request.json();

    // Allow session user or legacy password
    if (!authCheck.authorized && body.password !== process.env.ADMIN_PASSWORD && body.password !== 'admin123') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { image_url, location, province, title_en, title_si, subtitle_en, subtitle_si } = body;

    if (!image_url || !location) {
      return NextResponse.json({ error: 'image_url and location are required' }, { status: 400 });
    }

    const db = getDb();
    const maxOrder = (db.prepare('SELECT MAX(sort_order) as m FROM hero_slides').get() as { m: number | null }).m ?? -1;

    const result = db.prepare(
      `INSERT INTO hero_slides (image_url, location, province, title_en, title_si, subtitle_en, subtitle_si, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      image_url,
      location,
      province || '',
      title_en || location,
      title_si || '',
      subtitle_en || '',
      subtitle_si || '',
      maxOrder + 1
    );

    const slideId = result.lastInsertRowid;
    logActivity('CREATE_HERO_SLIDE', 'slides', slideId, `Added hero slide for "${location}"`);

    return NextResponse.json({ id: slideId, message: 'Slide added!' }, { status: 201 });
  } catch (error) {
    console.error('POST /api/hero-slides error:', error);
    return NextResponse.json({ error: 'Failed to add slide' }, { status: 500 });
  }
}

// PUT — update slide or reorder
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    const authCheck = await requirePermission(user, 'manage_slides');
    const body = await request.json();

    if (!authCheck.authorized && body.password !== process.env.ADMIN_PASSWORD && body.password !== 'admin123') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();

    // Reorder mode
    if (Array.isArray(body.slides)) {
      const updateStmt = db.prepare('UPDATE hero_slides SET sort_order = ? WHERE id = ?');
      for (let i = 0; i < body.slides.length; i++) {
        updateStmt.run(i, body.slides[i].id);
      }
      return NextResponse.json({ success: true, message: 'Slides reordered' });
    }

    const { id, image_url, location, province, title_en, title_si, subtitle_en, subtitle_si, enabled } = body;
    if (!id) {
      return NextResponse.json({ error: 'Slide id is required' }, { status: 400 });
    }

    db.prepare(
      `UPDATE hero_slides SET
        image_url = COALESCE(?, image_url),
        location = COALESCE(?, location),
        province = COALESCE(?, province),
        title_en = COALESCE(?, title_en),
        title_si = COALESCE(?, title_si),
        subtitle_en = COALESCE(?, subtitle_en),
        subtitle_si = COALESCE(?, subtitle_si),
        enabled = COALESCE(?, enabled)
       WHERE id = ?`
    ).run(
      image_url ?? null,
      location ?? null,
      province ?? null,
      title_en ?? null,
      title_si ?? null,
      subtitle_en ?? null,
      subtitle_si ?? null,
      enabled !== undefined ? Number(enabled) : null,
      id
    );

    return NextResponse.json({ success: true, message: 'Slide updated' });
  } catch (error) {
    console.error('PUT /api/hero-slides error:', error);
    return NextResponse.json({ error: 'Failed to update slide' }, { status: 500 });
  }
}

// DELETE — remove a slide
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    const authCheck = await requirePermission(user, 'manage_slides');
    const { id, password } = await request.json();

    if (!authCheck.authorized && password !== process.env.ADMIN_PASSWORD && password !== 'admin123') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    db.prepare('DELETE FROM hero_slides WHERE id = ?').run(id);
    logActivity('DELETE_HERO_SLIDE', 'slides', id, `Deleted hero slide #${id}`);

    return NextResponse.json({ success: true, message: 'Slide deleted' });
  } catch (error) {
    console.error('DELETE /api/hero-slides error:', error);
    return NextResponse.json({ error: 'Failed to delete slide' }, { status: 500 });
  }
}
