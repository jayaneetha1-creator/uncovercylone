/**
 * src/app/api/admin/ads/route.ts
 * Admin endpoint to list all ads and create new ads.
 * Protected by RBAC: requirePermission('manage_ads').
 */

import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/permissions';
import { getAds, createAd, getAdSettings } from '@/lib/db/ads';
import { logAudit } from '@/lib/db/admin';

export async function GET(request: NextRequest) {
  const perm = await requirePermission(request, 'manage_ads');
  if (!perm.authorized) return perm.response;

  try {
    const ads = await getAds();
    const settings = await getAdSettings();
    return NextResponse.json({ success: true, ads, settings });
  } catch (error) {
    console.error('API /api/admin/ads GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch ads' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const perm = await requirePermission(request, 'manage_ads');
  if (!perm.authorized) return perm.response;

  try {
    const body = await request.json();
    if (!body.placement || !body.title_en || !body.target_url) {
      return NextResponse.json(
        { error: 'Missing required fields: placement, title_en, target_url' },
        { status: 400 }
      );
    }

    const adId = await createAd({
      placement: body.placement,
      title_en: body.title_en,
      title_si: body.title_si || '',
      description: body.description || '',
      image_url: body.image_url || '',
      target_url: body.target_url,
      start_date: body.start_date || null,
      end_date: body.end_date || null,
      device_target: body.device_target || 'all',
      enabled: body.enabled !== undefined ? Number(body.enabled) : 1,
    });

    if (!adId) {
      return NextResponse.json({ error: 'Failed to insert ad' }, { status: 500 });
    }

    await logAudit({
      userId: perm.user.id,
      userEmail: perm.user.email,
      userRole: perm.user.role,
      action: 'CREATE_AD',
      entityType: 'ad',
      entityId: String(adId),
      details: `Created ad "${body.title_en}" for placement ${body.placement}`,
    });

    return NextResponse.json({ success: true, id: adId });
  } catch (error) {
    console.error('API /api/admin/ads POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
