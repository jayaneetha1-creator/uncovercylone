import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/permissions';
import {
  getSiteNodes,
  updateNode,
  toggleNode,
  reorderNodes,
  resetNodesToDefault,
} from '@/lib/db/nodes';
import { recordAuditLog } from '@/lib/db/governance';

export async function GET(request: NextRequest) {
  const auth = await requirePermission(request, 'manage_site_nodes');
  if (!auth.authorized) return auth.response;

  try {
    const nodes = await getSiteNodes(true);
    return NextResponse.json({ nodes });
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : String(error);
    console.error('GET /api/admin/nodes error:', err);
    return NextResponse.json({ error: 'Failed to fetch site tree nodes' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requirePermission(request, 'manage_site_nodes');
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const { id, enabled, title_en, title_si, default_open, priority, device_visibility, config } = body;

    if (!id) {
      return NextResponse.json({ error: 'Node id is required' }, { status: 400 });
    }

    if (enabled !== undefined) {
      await toggleNode(Number(id), Boolean(enabled));
    }

    await updateNode(Number(id), {
      title_en,
      title_si,
      default_open,
      priority,
      device_visibility,
      config,
    });

    await recordAuditLog({
      userId: auth.user.id,
      userEmail: auth.user.email,
      userRole: auth.user.role,
      action: 'update_site_node',
      entityType: 'site_node',
      entityId: id,
      details: `Updated site node #${id} (${title_en || 'Node'})`,
      ipAddress: request.headers.get('x-forwarded-for') || '',
    });

    return NextResponse.json({ success: true, message: 'Node updated successfully.' });
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : String(error);
    console.error('PATCH /api/admin/nodes error:', err);
    return NextResponse.json({ error: 'Failed to update site node' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requirePermission(request, 'manage_site_nodes');
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const { action, orderedIds } = body;

    if (action === 'reorder' && Array.isArray(orderedIds)) {
      await reorderNodes(orderedIds);
      await recordAuditLog({
        userId: auth.user.id,
        userEmail: auth.user.email,
        userRole: auth.user.role,
        action: 'reorder_site_nodes',
        entityType: 'site_nodes',
        details: `Reordered ${orderedIds.length} site nodes`,
        ipAddress: request.headers.get('x-forwarded-for') || '',
      });
      return NextResponse.json({ success: true, message: 'Nodes reordered successfully.' });
    }

    if (action === 'reset') {
      await resetNodesToDefault();
      await recordAuditLog({
        userId: auth.user.id,
        userEmail: auth.user.email,
        userRole: auth.user.role,
        action: 'reset_site_nodes_default',
        entityType: 'site_nodes',
        details: 'Reset all site nodes to system default tree',
        ipAddress: request.headers.get('x-forwarded-for') || '',
      });
      return NextResponse.json({ success: true, message: 'Site nodes reset to system defaults.' });
    }

    return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : String(error);
    console.error('POST /api/admin/nodes error:', err);
    return NextResponse.json({ error: 'Failed to process site nodes action' }, { status: 500 });
  }
}
