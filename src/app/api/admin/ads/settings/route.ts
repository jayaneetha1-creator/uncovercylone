/**
 * src/app/api/admin/ads/settings/route.ts
 * Admin endpoint to update ad master switch, placement switches, and Google AdSense config.
 * Protected by RBAC: requirePermission('manage_ads').
 */

import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/permissions';
import { getAdSettings, updateAdSettings } from '@/lib/db/ads';
import { logAudit } from '@/lib/db/admin';

export async function GET(request: NextRequest) {
  const perm = await requirePermission(request, 'manage_ads');
  if (!perm.authorized) return perm.response;

  try {
    const settings = await getAdSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('API /api/admin/ads/settings GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch ad settings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const perm = await requirePermission(request, 'manage_ads');
  if (!perm.authorized) return perm.response;

  try {
    const body = await request.json();
    const ok = await updateAdSettings(body);

    if (!ok) {
      return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
    }

    await logAudit({
      userId: perm.user.id,
      userEmail: perm.user.email,
      userRole: perm.user.role,
      action: 'UPDATE_AD_SETTINGS',
      entityType: 'site_settings',
      entityId: 'ads_settings',
      details: `Updated ad configuration: master=${body.masterEnabled ?? 'unchanged'}, adsense=${body.adsenseEnabled ?? 'unchanged'}`,
    });

    const updated = await getAdSettings();
    return NextResponse.json({ success: true, settings: updated });
  } catch (error) {
    console.error('API /api/admin/ads/settings POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
