import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDb, createNotification } from '@/lib/db';
import { logAudit } from '@/lib/db/governance';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Please sign in to submit a destination.' }, { status: 401 });
    }

    if (user.status === 'unverified') {
      return NextResponse.json(
        { error: 'Please verify your email address before submitting destinations.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      name_si,
      category,
      province,
      location,
      lat,
      lng,
      image_url,
      gallery,
      short_description,
      description,
      entry_fee,
    } = body;

    if (!name || !location || !category || !province) {
      return NextResponse.json(
        { error: 'Name, category, province, and location are required.' },
        { status: 400 }
      );
    }

    const db = getDb();
    const result = db.prepare(
      `INSERT INTO places (
        name, short_description, description, category, location, province,
        lat, lng, image_url, gallery, entry_fee, status, submitted_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`
    ).run(
      name,
      short_description || name,
      description || '',
      category,
      location,
      province,
      Number(lat) || 6.9271,
      Number(lng) || 79.8612,
      image_url || '',
      gallery || '[]',
      entry_fee || 'Free',
      user.id
    );

    const placeId = Number(result.lastInsertRowid);

    // Notify all staff
    await createNotification({
      recipientRole: 'all_staff',
      type: 'place_submission',
      title: 'New Place Submission',
      body: `"${name}" submitted by ${user.name} (${user.email}) is waiting for approval.`,
      link: '/admin',
      payload: { placeId, submitterId: user.id },
    });

    await logAudit({
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      action: 'submit_place',
      entityType: 'place',
      entityId: placeId,
      details: `User submitted "${name}" for administrative approval`,
      ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    return NextResponse.json({
      success: true,
      placeId,
      message: 'Your destination submission has been received and is in the approvals queue!',
    });
  } catch (err: unknown) {
    console.error('Submit place error:', err);
    const msg = err instanceof Error ? err.message : 'Failed to submit place';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
