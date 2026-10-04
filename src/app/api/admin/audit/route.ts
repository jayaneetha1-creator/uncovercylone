import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/permissions';
import { getAuditLogs } from '@/lib/db/governance';

export async function GET(request: NextRequest) {
  const auth = await requirePermission(request, 'view_audit_log');
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const action = searchParams.get('action') || undefined;
    const entityType = searchParams.get('entity_type') || undefined;

    const logs = await getAuditLogs(limit, action, entityType);
    return NextResponse.json({ logs });
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : String(error);
    console.error('GET /api/admin/audit error:', err);
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}
