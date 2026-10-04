import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/permissions';
import {
  getChangeRequestById,
  reviewChangeRequest,
  moveToTrash,
  dispatchNotification,
  recordAuditLog,
} from '@/lib/db/governance';
import { queryOne, execute } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Only owner can approve/reject change requests
  const auth = await requirePermission(request, 'direct_delete');
  if (!auth.authorized) return auth.response;

  try {
    const { id } = await context.params;
    const reqId = parseInt(id, 10);
    const body = await request.json();
    const { status } = body;

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Status must be either approved or rejected' },
        { status: 400 }
      );
    }

    const changeReq = await getChangeRequestById(reqId);
    if (!changeReq) {
      return NextResponse.json({ error: 'Change request not found' }, { status: 404 });
    }

    if (changeReq.status !== 'pending') {
      return NextResponse.json(
        { error: `This request has already been ${changeReq.status}.` },
        { status: 400 }
      );
    }

    // Execute the requested action if approved
    if (status === 'approved' && changeReq.action_type === 'delete') {
      // 1. Fetch current entity snapshot before deletion
      let currentItem: Record<string, unknown> | null = null;
      if (changeReq.entity_type === 'place' || changeReq.entity_type === 'location') {
        currentItem = await queryOne('SELECT * FROM places WHERE id = ?', [changeReq.entity_id]);
        if (currentItem) {
          await moveToTrash('place', changeReq.entity_id, currentItem, auth.user.id);
          await execute('DELETE FROM places WHERE id = ?', [changeReq.entity_id]);
        }
      } else if (changeReq.entity_type === 'review') {
        currentItem = await queryOne('SELECT * FROM reviews WHERE id = ?', [changeReq.entity_id]);
        if (currentItem) {
          await moveToTrash('review', changeReq.entity_id, currentItem, auth.user.id);
          await execute('DELETE FROM reviews WHERE id = ?', [changeReq.entity_id]);
        }
      }
    }

    // Update status in change_requests table
    await reviewChangeRequest(reqId, auth.user.id, status);

    // Notify requester of decision
    await dispatchNotification({
      userId: changeReq.user_id,
      type: `change_request_${status}`,
      title: `Your ${changeReq.action_type.toUpperCase()} Request was ${status.toUpperCase()}`,
      body: `The owner has ${status} your request to ${changeReq.action_type} ${changeReq.entity_type} #${changeReq.entity_id}.`,
      link: '/admin',
    });

    // Record in audit log
    await recordAuditLog({
      userId: auth.user.id,
      userEmail: auth.user.email,
      userRole: auth.user.role,
      action: `request_${status}`,
      entityType: changeReq.entity_type,
      entityId: changeReq.entity_id,
      details: `${status.toUpperCase()} change request #${reqId} submitted by user #${changeReq.user_id}`,
      ipAddress: request.headers.get('x-forwarded-for') || '',
    });

    return NextResponse.json({
      success: true,
      message: `Request #${reqId} ${status} successfully.`,
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : String(error);
    console.error('PATCH /api/admin/requests/[id] error:', err);
    return NextResponse.json({ error: 'Failed to process change request' }, { status: 500 });
  }
}
