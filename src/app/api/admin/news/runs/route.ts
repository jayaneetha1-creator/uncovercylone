/**
 * src/app/api/admin/news/runs/route.ts
 * Admin endpoint to fetch recent crawler execution history runs.
 * Protected by RBAC: requirePermission('manage_news').
 */

import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/permissions';
import { getNewsRuns } from '@/lib/db/news';

export async function GET(request: NextRequest) {
  const perm = await requirePermission(request, 'manage_news');
  if (!perm.authorized) return perm.response;

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const runs = await getNewsRuns(limit);
    return NextResponse.json({ success: true, runs });
  } catch (error) {
    console.error('API /api/admin/news/runs GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch crawler runs' }, { status: 500 });
  }
}
