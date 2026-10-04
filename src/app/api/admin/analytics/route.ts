/**
 * src/app/api/admin/analytics/route.ts
 * Analytics reporting endpoint for Admin Analytics tab.
 * Protected by RBAC: requirePermission('view_analytics').
 */

import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/permissions';
import { getAnalyticsSummary } from '@/lib/db/analytics';

export async function GET(request: NextRequest) {
  const perm = await requirePermission(request, 'view_analytics');
  if (!perm.authorized) return perm.response;

  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30', 10);
    const summary = await getAnalyticsSummary(days);
    return NextResponse.json(summary);
  } catch (error) {
    console.error('API /api/admin/analytics error:', error);
    return NextResponse.json({ error: 'Failed to generate analytics summary' }, { status: 500 });
  }
}
