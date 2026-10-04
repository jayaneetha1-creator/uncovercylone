import { NextRequest, NextResponse } from 'next/server';
import { requireStaff } from '@/lib/permissions';
import {
  getNotificationsForUser,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '@/lib/db/governance';

export async function GET(request: NextRequest) {
  const auth = await requireStaff(request);
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '40', 10);

    const [notifications, unreadCount] = await Promise.all([
      getNotificationsForUser(auth.user.id, auth.user.role, limit),
      getUnreadNotificationCount(auth.user.id, auth.user.role),
    ]);

    return NextResponse.json({ notifications, unreadCount });
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : String(error);
    console.error('GET /api/admin/notifications error:', err);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireStaff(request);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const { id, all } = body;

    if (all) {
      await markAllNotificationsAsRead(auth.user.id, auth.user.role);
      return NextResponse.json({ success: true, message: 'All notifications marked as read.' });
    }

    if (id) {
      await markNotificationAsRead(parseInt(id, 10));
      return NextResponse.json({ success: true, message: 'Notification marked as read.' });
    }

    return NextResponse.json({ error: 'Specify either id or all: true' }, { status: 400 });
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : String(error);
    console.error('PATCH /api/admin/notifications error:', err);
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
  }
}
