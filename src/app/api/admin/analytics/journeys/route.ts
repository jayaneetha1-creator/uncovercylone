/**
 * src/app/api/admin/analytics/journeys/route.ts
 * Export visitor journeys as a downloadable JSON dataset.
 * Protected by RBAC: requirePermission('view_analytics').
 */

import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/permissions';
import { getAllJourneys } from '@/lib/db/analytics';

export async function GET(request: NextRequest) {
  const perm = await requirePermission(request, 'view_analytics');
  if (!perm.authorized) return perm.response;

  try {
    const journeys = await getAllJourneys();
    const payload = {
      exportTimestamp: new Date().toISOString(),
      totalJourneys: journeys.length,
      journeys,
    };

    const jsonStr = JSON.stringify(payload, null, 2);

    return new NextResponse(jsonStr, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="uncoverceylon-journeys-${Date.now()}.json"`,
      },
    });
  } catch (error) {
    console.error('API /api/admin/analytics/journeys error:', error);
    return NextResponse.json({ error: 'Failed to export journeys' }, { status: 500 });
  }
}
