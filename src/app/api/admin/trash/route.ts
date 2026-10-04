import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/permissions';
import { getTrashItems, emptyTrash, recordAuditLog } from '@/lib/db/governance';

export async function GET(request: NextRequest) {
  const auth = await requirePermission(request, 'restore_trash');
  if (!auth.authorized) return auth.response;

  try {
    const items = await getTrashItems();
    return NextResponse.json({ items });
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : String(error);
    console.error('GET /api/admin/trash error:', err);
    return NextResponse.json({ error: 'Failed to fetch trash items' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  // Only owner can empty the trash completely
  const auth = await requirePermission(request, 'empty_trash');
  if (!auth.authorized) return auth.response;

  try {
    const count = await emptyTrash();

    await recordAuditLog({
      userId: auth.user.id,
      userEmail: auth.user.email,
      userRole: auth.user.role,
      action: 'empty_trash',
      entityType: 'trash',
      details: `Emptied trash (${count} items permanently deleted)`,
      ipAddress: request.headers.get('x-forwarded-for') || '',
    });

    return NextResponse.json({
      success: true,
      message: `Trash emptied successfully. ${count} item(s) permanently purged.`,
      count,
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : String(error);
    console.error('DELETE /api/admin/trash error:', err);
    return NextResponse.json({ error: 'Failed to empty trash' }, { status: 500 });
  }
}
