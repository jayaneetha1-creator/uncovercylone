import { NextRequest, NextResponse } from 'next/server';
import { requireStaff, requirePermission } from '@/lib/permissions';
import { getVersionHistory, getVersionById, recordAuditLog } from '@/lib/db/governance';
import { execute } from '@/lib/db';

export async function GET(request: NextRequest) {
  const auth = await requireStaff(request);
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entity_type');
    const entityId = searchParams.get('entity_id');

    if (!entityType || !entityId) {
      return NextResponse.json(
        { error: 'entity_type and entity_id are required' },
        { status: 400 }
      );
    }

    const versions = await getVersionHistory(entityType, parseInt(entityId, 10));
    return NextResponse.json({ versions });
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : String(error);
    console.error('GET /api/admin/versions error:', err);
    return NextResponse.json({ error: 'Failed to fetch version history' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Owner and Developer can revert versions
  const auth = await requirePermission(request, 'revert_version');
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const { versionId } = body;

    if (!versionId) {
      return NextResponse.json({ error: 'versionId is required' }, { status: 400 });
    }

    const ver = await getVersionById(parseInt(versionId, 10));
    if (!ver) {
      return NextResponse.json({ error: 'Version record not found' }, { status: 404 });
    }

    const snapshot = JSON.parse(ver.snapshot);

    if (ver.entity_type === 'place') {
      await execute(
        `UPDATE places 
         SET name = ?, description = ?, short_description = ?, location = ?, province = ?, category = ?, lat = ?, lng = ?, image_url = ?, gallery = ?, tips = ?, best_time = ?, entry_fee = ?
         WHERE id = ?`,
        [
          snapshot.name,
          snapshot.description,
          snapshot.short_description || '',
          snapshot.location,
          snapshot.province,
          snapshot.category,
          snapshot.lat,
          snapshot.lng,
          snapshot.image_url || '',
          snapshot.gallery || '[]',
          snapshot.tips || '',
          snapshot.best_time || '',
          snapshot.entry_fee || 'Free',
          ver.entity_id,
        ]
      );
    }

    await recordAuditLog({
      userId: auth.user.id,
      userEmail: auth.user.email,
      userRole: auth.user.role,
      action: 'revert_version',
      entityType: ver.entity_type,
      entityId: ver.entity_id,
      details: `Reverted ${ver.entity_type} #${ver.entity_id} to version #${ver.version_num}`,
      ipAddress: request.headers.get('x-forwarded-for') || '',
    });

    return NextResponse.json({
      success: true,
      message: `${ver.entity_type} #${ver.entity_id} successfully reverted to version #${ver.version_num}.`,
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : String(error);
    console.error('POST /api/admin/versions error:', err);
    return NextResponse.json({ error: 'Failed to revert version' }, { status: 500 });
  }
}
