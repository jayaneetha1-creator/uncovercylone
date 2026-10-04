import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDb, createNotification } from '@/lib/db';
import { logAudit } from '@/lib/db/governance';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const placeId = parseInt(id, 10);
    if (isNaN(placeId)) {
      return NextResponse.json({ error: 'Invalid place id' }, { status: 400 });
    }

    const db = getDb();

    // Fetch approved questions
    const questions = db.prepare(
      `SELECT q.*, u.name as author_name, u.avatar as author_avatar
       FROM place_questions q
       LEFT JOIN users u ON q.user_id = u.id
       WHERE q.place_id = ? AND q.status = 'approved'
       ORDER BY q.created_at DESC`
    ).all(placeId) as {
      id: number;
      question: string;
      created_at: string;
      author_name: string;
      author_avatar?: string;
      answers?: unknown[];
    }[];

    // Fetch answers for all questions
    const answerStmt = db.prepare(
      `SELECT a.*, u.name as responder_name, u.avatar as responder_avatar, u.role as responder_role
       FROM place_answers a
       LEFT JOIN users u ON a.user_id = u.id
       WHERE a.question_id = ? AND a.status = 'approved'
       ORDER BY a.is_team DESC, a.created_at ASC`
    );

    for (const q of questions) {
      q.answers = answerStmt.all(q.id);
    }

    return NextResponse.json({ success: true, questions });
  } catch (err: unknown) {
    console.error('QA GET error:', err);
    const msg = err instanceof Error ? err.message : 'Failed to fetch Q&A';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Please sign in to ask a question' }, { status: 401 });
    }
    if (user.status === 'unverified') {
      return NextResponse.json({ error: 'Please verify your email address to participate in Q&A' }, { status: 403 });
    }

    const { id } = await params;
    const placeId = parseInt(id, 10);
    if (isNaN(placeId)) {
      return NextResponse.json({ error: 'Invalid place id' }, { status: 400 });
    }

    const body = await request.json();
    const { question } = body;

    if (!question || String(question).trim().length < 5) {
      return NextResponse.json({ error: 'Question must be at least 5 characters long' }, { status: 400 });
    }

    const cleanQuestion = String(question).trim();
    const db = getDb();

    const place = db.prepare('SELECT id, name FROM places WHERE id = ?').get(placeId) as {
      id: number;
      name: string;
    } | undefined;

    if (!place) {
      return NextResponse.json({ error: 'Destination not found' }, { status: 404 });
    }

    const res = db.prepare(
      'INSERT INTO place_questions (place_id, user_id, question, status) VALUES (?, ?, ?, ?)'
    ).run(placeId, user.id, cleanQuestion, 'approved');

    const questionId = Number(res.lastInsertRowid);

    // Notify staff of new traveler question
    await createNotification({
      recipientRole: 'all_staff',
      type: 'new_question',
      title: `Question on ${place.name}`,
      body: `${user.name} asked: "${cleanQuestion.slice(0, 80)}"`,
      link: `/places/${placeId}`,
      payload: { questionId, placeId },
    });

    return NextResponse.json({
      success: true,
      questionId,
      message: 'Question posted! Community members or our team will answer shortly.',
    }, { status: 201 });
  } catch (err: unknown) {
    console.error('QA POST error:', err);
    const msg = err instanceof Error ? err.message : 'Failed to post question';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
