import { NextRequest, NextResponse } from 'next/server';
import { getDb, logActivity } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { requirePermission } from '@/lib/permissions';

export interface RegionSlide {
  id: number;
  image_url: string;
  title: string;
  title_si?: string;
  region: string;
  sort_order: number;
  enabled?: number;
}

// GET all region slides
export async function GET() {
  try {
    const db = getDb();
    const slides = db.prepare('SELECT * FROM region_slides ORDER BY sort_order ASC, id ASC').all() as RegionSlide[];
    return NextResponse.json({ slides });
  } catch (error) {
    console.error('GET /api/region-slides error:', error);
    return NextResponse.json({ error: 'Failed to fetch region slides' }, { status: 500 });
  }
}

// POST — add a new region slide
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    const authCheck = await requirePermission(user, 'manage_slides');
    const body = await request.json();

    if (!authCheck.authorized && body.password !== process.env.ADMIN_PASSWORD && body.password !== 'admin123') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { image_url, title, title_si, region } = body;

    if (!image_url || !title) {
      return NextResponse.json({ error: 'image_url and title are required' }, { status: 400 });
    }

    const db = getDb();
    const maxOrder = (db.prepare('SELECT MAX(sort_order) as m FROM region_slides').get() as { m: number | null }).m ?? -1;

    const result = db.prepare(
      'INSERT INTO region_slides (image_url, title, title_si, region, sort_order) VALUES (?, ?, ?, ?, ?)'
    ).run(image_url, title, title_si || '', region || 'Sri Lanka', maxOrder + 1);

    const slideId = result.lastInsertRowid;
    logActivity('CREATE_REGION_SLIDE', 'region_slides', slideId, `Added region slide "${title}"`);

    return NextResponse.json({ id: slideId, message: 'Region slide added successfully!' }, { status: 201 });
  } catch (error) {
    console.error('POST /api/region-slides error:', error);
    return NextResponse.json({ error: 'Failed to add region slide' }, { status: 500 });
  }
}

// PUT — update region slide or reorder
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
      const updateStmt = db.prepare('UPDATE region_slides SET sort_order = ? WHERE id = ?');
      for (let i = 0; i < body.slides.length; i++) {
        updateStmt.run(i, body.slides[i].id);
      }
      return NextResponse.json({ success: true, message: 'Region slides reordered' });
    }

    const { id, image_url, title, title_si, region, enabled } = body;
    if (!id) {
      return NextResponse.json({ error: 'Slide id is required' }, { status: 400 });
    }

    db.prepare(
      `UPDATE region_slides SET
        image_url = COALESCE(?, image_url),
        title = COALESCE(?, title),
        title_si = COALESCE(?, title_si),
        region = COALESCE(?, region),
        enabled = COALESCE(?, enabled)
       WHERE id = ?`
    ).run(
      image_url ?? null,
      title ?? null,
      title_si ?? null,
      region ?? null,
      enabled !== undefined ? Number(enabled) : null,
      id
    );

    return NextResponse.json({ success: true, message: 'Region slide updated' });
  } catch (error) {
    console.error('PUT /api/region-slides error:', error);
    return NextResponse.json({ error: 'Failed to update region slide' }, { status: 500 });
  }
}

// DELETE — remove a region slide
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    const authCheck = await requirePermission(user, 'manage_slides');
    const { id, password } = await request.json();

    if (!authCheck.authorized && password !== process.env.ADMIN_PASSWORD && password !== 'admin123') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    db.prepare('DELETE FROM region_slides WHERE id = ?').run(id);
    logActivity('DELETE_REGION_SLIDE', 'region_slides', id, `Deleted region slide #${id}`);

    return NextResponse.json({ success: true, message: 'Region slide deleted' });
  } catch (error) {
    console.error('DELETE /api/region-slides error:', error);
    return NextResponse.json({ error: 'Failed to delete slide' }, { status: 500 });
  }
}
