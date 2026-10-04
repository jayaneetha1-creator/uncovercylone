import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { requirePermission } from '@/lib/permissions';
import { getDb, createNotification } from '@/lib/db';
import { logAudit } from '@/lib/db/governance';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    const authCheck = await requirePermission(user, 'approve_submissions');
    if (!authCheck.authorized) {
      return NextResponse.json({ error: authCheck.error }, { status: 403 });
    }

    const { id } = await params;
    const placeId = parseInt(id, 10);
    if (isNaN(placeId)) {
      return NextResponse.json({ error: 'Invalid place id' }, { status: 400 });
    }

    const body = await request.json();
    const { action, reason } = body; // action: 'approve' | 'reject'

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json({ error: 'Action must be approve or reject' }, { status: 400 });
    }

    const db = getDb();
    const place = db.prepare('SELECT * FROM places WHERE id = ?').get(placeId) as {
      id: number;
      name: string;
      submitted_by?: number;
    } | undefined;

    if (!place) {
      return NextResponse.json({ error: 'Place not found' }, { status: 404 });
    }

    const newStatus = action === 'approve' ? 'published' : 'rejected';

    db.prepare('UPDATE places SET status = ? WHERE id = ?').run(newStatus, placeId);

    // Notify the submitter if a user submitted this
    if (place.submitted_by) {
      if (action === 'approve') {
        await createNotification({
          userId: place.submitted_by,
          type: 'place_approved',
          title: 'Destination Approved! 🎉',
          body: `Your submitted destination "${place.name}" has been approved and published to UncoverCeylon.`,
          link: `/places/${placeId}`,
        });
      } else {
        await createNotification({
          userId: place.submitted_by,
          type: 'place_rejected',
          title: 'Destination Update',
          body: `Your submitted destination "${place.name}" was not approved${reason ? `: ${reason}` : '.'}`,
          link: '/profile',
        });
      }
    }

    await logAudit({
      userId: user?.id,
      userEmail: user?.email,
      userRole: user?.role,
      action: `${action}_place_submission`,
      entityType: 'place',
      entityId: placeId,
      details: `${action.toUpperCase()} place "${place.name}" (Submitter #${place.submitted_by || 'none'})${reason ? ` - Reason: ${reason}` : ''}`,
      ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    return NextResponse.json({
      success: true,
      message: `Destination ${action === 'approve' ? 'approved and published' : 'rejected'}.`,
    });
  } catch (err: unknown) {
    console.error('Approvals PATCH error:', err);
    const msg = err instanceof Error ? err.message : 'Failed to update approval status';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
