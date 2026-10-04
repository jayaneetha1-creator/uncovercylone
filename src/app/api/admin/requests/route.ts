import { NextRequest, NextResponse } from 'next/server';
import { requireStaff, requirePermission } from '@/lib/permissions';
import {
  createChangeRequest,
  getChangeRequests,
  dispatchNotification,
  recordAuditLog,
} from '@/lib/db/governance';

export async function GET(request: NextRequest) {
  const auth = await requireStaff(request);
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const requests = await getChangeRequests(status);

    return NextResponse.json({ requests });
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : String(error);
    console.error('GET /api/admin/requests error:', err);
    return NextResponse.json({ error: 'Failed to fetch change requests' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireStaff(request);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const { actionType, entityType, entityId, reason } = body;

    if (!actionType || !entityType || !entityId || !reason) {
      return NextResponse.json(
        { error: 'actionType, entityType, entityId, and reason are required.' },
        { status: 400 }
      );
    }

    const requestId = await createChangeRequest({
      userId: auth.user.id,
      actionType,
      entityType,
      entityId: Number(entityId),
      reason: String(reason).trim(),
    });

    // Notify owner about the pending change request
    await dispatchNotification({
      recipientRole: 'owner',
      type: 'change_request_created',
      title: `New ${actionType.toUpperCase()} Request from ${auth.user.name}`,
      body: `${auth.user.name} (${auth.user.role}) requested to ${actionType} ${entityType} #${entityId}: "${reason}"`,
      link: '/admin',
      payload: { requestId, actionType, entityType, entityId },
    });

    // Log the request creation in audit log
    await recordAuditLog({
      userId: auth.user.id,
      userEmail: auth.user.email,
      userRole: auth.user.role,
      action: 'request_created',
      entityType,
      entityId,
      details: `Created ${actionType} request for ${entityType} #${entityId}. Reason: ${reason}`,
      ipAddress: request.headers.get('x-forwarded-for') || '',
    });

    return NextResponse.json({
      success: true,
      message: 'Change request submitted for owner approval.',
      requestId,
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : String(error);
    console.error('POST /api/admin/requests error:', err);
    return NextResponse.json({ error: 'Failed to submit change request' }, { status: 500 });
  }
}
