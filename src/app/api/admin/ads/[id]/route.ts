/**
 * src/app/api/admin/ads/[id]/route.ts
 * Admin endpoint to update or delete a specific ad.
 * Protected by RBAC: requirePermission('manage_ads').
 */

import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/permissions';
import { getAdById, updateAd, deleteAd } from '@/lib/db/ads';
import { logAudit } from '@/lib/db/admin';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const perm = await requirePermission(request, 'manage_ads');
  if (!perm.authorized) return perm.response;

  try {
    const { id } = await params;
    const adId = parseInt(id, 10);
    if (isNaN(adId)) {
      return NextResponse.json({ error: 'Invalid ad ID' }, { status: 400 });
    }

    const existing = await getAdById(adId);
    if (!existing) {
      return NextResponse.json({ error: 'Ad not found' }, { status: 404 });
    }

    const body = await request.json();
    const ok = await updateAd(adId, body);

    if (!ok) {
      return NextResponse.json({ error: 'Failed to update ad' }, { status: 500 });
    }

    await logAudit({
      userId: perm.user.id,
      userEmail: perm.user.email,
      userRole: perm.user.role,
      action: 'UPDATE_AD',
      entityType: 'ad',
      entityId: String(adId),
      details: `Updated ad #${adId} (${body.title_en || existing.title_en})`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API /api/admin/ads/[id] PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const perm = await requirePermission(request, 'manage_ads');
  if (!perm.authorized) return perm.response;

  try {
    const { id } = await params;
    const adId = parseInt(id, 10);
    if (isNaN(adId)) {
      return NextResponse.json({ error: 'Invalid ad ID' }, { status: 400 });
    }

    const existing = await getAdById(adId);
    if (!existing) {
      return NextResponse.json({ error: 'Ad not found' }, { status: 404 });
    }

    const ok = await deleteAd(adId);
    if (!ok) {
      return NextResponse.json({ error: 'Failed to delete ad' }, { status: 500 });
    }

    await logAudit({
      userId: perm.user.id,
      userEmail: perm.user.email,
      userRole: perm.user.role,
      action: 'DELETE_AD',
      entityType: 'ad',
      entityId: String(adId),
      details: `Deleted ad #${adId} ("${existing.title_en}")`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API /api/admin/ads/[id] DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
