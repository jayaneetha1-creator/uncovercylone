import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { requirePermission } from '@/lib/permissions';
import { getDb, createNotification } from '@/lib/db';
import { logAudit } from '@/lib/db/governance';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    const authCheck = await requirePermission(user, 'reply_customer_chat');
    if (!authCheck.authorized) {
      return NextResponse.json({ error: authCheck.error }, { status: 403 });
    }

    const { id } = await params;
    const threadId = parseInt(id, 10);
    if (isNaN(threadId)) {
      return NextResponse.json({ error: 'Invalid thread id' }, { status: 400 });
    }

    const db = getDb();
    const thread = db.prepare(
      `SELECT t.*, u.name as user_name, u.email as user_email, u.avatar as user_avatar
       FROM chat_threads t
       JOIN users u ON t.user_id = u.id
       WHERE t.id = ?`
    ).get(threadId);

    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    const messages = db.prepare(
      `SELECT m.*, u.name as sender_name, u.avatar as sender_avatar
       FROM chat_messages m
       LEFT JOIN users u ON m.sender_id = u.id
       WHERE m.thread_id = ?
       ORDER BY m.created_at ASC`
    ).all(threadId);

    return NextResponse.json({ success: true, thread, messages });
  } catch (err: unknown) {
    console.error('Thread GET error:', err);
    const msg = err instanceof Error ? err.message : 'Failed to fetch thread';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    const authCheck = await requirePermission(user, 'reply_customer_chat');
    if (!authCheck.authorized) {
      return NextResponse.json({ error: authCheck.error }, { status: 403 });
    }

    const { id } = await params;
    const threadId = parseInt(id, 10);
    if (isNaN(threadId)) {
      return NextResponse.json({ error: 'Invalid thread id' }, { status: 400 });
    }

    const body = await request.json();
    const { message } = body;

    if (!message || String(message).trim().length === 0) {
      return NextResponse.json({ error: 'Reply text cannot be empty' }, { status: 400 });
    }

    const cleanMsg = String(message).trim();
    const db = getDb();

    const thread = db.prepare('SELECT user_id FROM chat_threads WHERE id = ?').get(threadId) as {
      user_id: number;
    } | undefined;

    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    // Insert staff message
    db.prepare(
      "INSERT INTO chat_messages (thread_id, sender_id, sender_role, message_text) VALUES (?, ?, 'staff', ?)"
    ).run(threadId, user?.id, cleanMsg);

    db.prepare("UPDATE chat_threads SET updated_at = datetime('now') WHERE id = ?").run(threadId);

    // Notify traveler
    await createNotification({
      userId: thread.user_id,
      type: 'customer_chat_reply',
      title: 'Reply from UncoverCeylon Support',
      body: `Team member ${user?.name}: "${cleanMsg.slice(0, 60)}"`,
      link: '/profile',
    });

    return NextResponse.json({ success: true, message: 'Reply sent to traveler' });
  } catch (err: unknown) {
    console.error('Thread POST error:', err);
    const msg = err instanceof Error ? err.message : 'Failed to send reply';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    const authCheck = await requirePermission(user, 'reply_customer_chat');
    if (!authCheck.authorized) {
      return NextResponse.json({ error: authCheck.error }, { status: 403 });
    }

    const { id } = await params;
    const threadId = parseInt(id, 10);
    if (isNaN(threadId)) {
      return NextResponse.json({ error: 'Invalid thread id' }, { status: 400 });
    }

    const body = await request.json();
    const { status } = body; // 'open' | 'resolved' | 'closed'

    if (!['open', 'resolved', 'closed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const db = getDb();
    db.prepare("UPDATE chat_threads SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, threadId);

    return NextResponse.json({ success: true, message: `Thread status updated to ${status}` });
  } catch (err: unknown) {
    console.error('Thread PATCH error:', err);
    const msg = err instanceof Error ? err.message : 'Failed to update thread status';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
