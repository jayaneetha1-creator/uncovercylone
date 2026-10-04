import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDb, createNotification } from '@/lib/db';
import { requirePermission } from '@/lib/permissions';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Please sign in to access chat' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const isStaffView = searchParams.get('staff') === 'true';

    const db = getDb();

    if (isStaffView) {
      const authCheck = await requirePermission(user, 'reply_customer_chat');
      if (!authCheck.authorized) {
        return NextResponse.json({ error: authCheck.error }, { status: 403 });
      }

      // Fetch all customer threads with latest message & user info
      const threads = db.prepare(
        `SELECT t.*, u.name as user_name, u.email as user_email, u.avatar as user_avatar,
                (SELECT message_text FROM chat_messages m WHERE m.thread_id = t.id ORDER BY m.created_at DESC LIMIT 1) as last_message,
                (SELECT created_at FROM chat_messages m WHERE m.thread_id = t.id ORDER BY m.created_at DESC LIMIT 1) as last_message_at
         FROM chat_threads t
         JOIN users u ON t.user_id = u.id
         ORDER BY t.updated_at DESC`
      ).all();

      return NextResponse.json({ success: true, threads });
    }

    // Normal traveler view: get or create their personal thread
    const thread = db.prepare('SELECT * FROM chat_threads WHERE user_id = ?').get(user.id) as {
      id: number;
      status: string;
    } | undefined;

    let messages: unknown[] = [];
    if (thread) {
      messages = db.prepare(
        `SELECT m.*, u.name as sender_name, u.avatar as sender_avatar
         FROM chat_messages m
         LEFT JOIN users u ON m.sender_id = u.id
         WHERE m.thread_id = ?
         ORDER BY m.created_at ASC`
      ).all(thread.id);
    }

    return NextResponse.json({
      success: true,
      threadId: thread?.id ?? null,
      status: thread?.status ?? 'new',
      messages,
    });
  } catch (err: unknown) {
    console.error('Customer chat GET error:', err);
    const msg = err instanceof Error ? err.message : 'Chat error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Please sign in to send messages' }, { status: 401 });
    }

    const body = await request.json();
    const { message } = body;

    if (!message || String(message).trim().length === 0) {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
    }

    const cleanMsg = String(message).trim();
    const db = getDb();

    // Get or create thread for this user
    const thread = db.prepare('SELECT id FROM chat_threads WHERE user_id = ?').get(user.id) as {
      id: number;
    } | undefined;

    let threadId: number;

    if (!thread) {
      const res = db.prepare(
        "INSERT INTO chat_threads (user_id, status) VALUES (?, 'open')"
      ).run(user.id);
      threadId = Number(res.lastInsertRowid);
    } else {
      threadId = thread.id;
      db.prepare("UPDATE chat_threads SET status = 'open', updated_at = datetime('now') WHERE id = ?").run(threadId);
    }

    // Insert message
    db.prepare(
      "INSERT INTO chat_messages (thread_id, sender_id, sender_role, message_text) VALUES (?, ?, 'user', ?)"
    ).run(threadId, user.id, cleanMsg);

    // Notify staff
    await createNotification({
      recipientRole: 'all_staff',
      type: 'customer_chat',
      title: 'Customer Message',
      body: `${user.name}: "${cleanMsg.slice(0, 60)}"`,
      link: '/admin',
      payload: { threadId, userId: user.id },
    });

    return NextResponse.json({
      success: true,
      threadId,
      message: 'Message sent to support team',
    }, { status: 201 });
  } catch (err: unknown) {
    console.error('Customer chat POST error:', err);
    const msg = err instanceof Error ? err.message : 'Failed to send message';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
