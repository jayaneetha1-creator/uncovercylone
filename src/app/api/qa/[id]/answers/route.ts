import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDb, createNotification } from '@/lib/db';
import { logAudit } from '@/lib/db/governance';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Please sign in to answer questions' }, { status: 401 });
    }
    if (user.status === 'unverified') {
      return NextResponse.json({ error: 'Please verify your email address to post answers' }, { status: 403 });
    }

    const { id } = await params;
    const questionId = parseInt(id, 10);
    if (isNaN(questionId)) {
      return NextResponse.json({ error: 'Invalid question id' }, { status: 400 });
    }

    const body = await request.json();
    const { answer } = body;

    if (!answer || String(answer).trim().length < 3) {
      return NextResponse.json({ error: 'Answer cannot be empty' }, { status: 400 });
    }

    const cleanAnswer = String(answer).trim();
    const db = getDb();

    const question = db.prepare(
      `SELECT q.*, p.name as place_name, u.name as author_name
       FROM place_questions q
       LEFT JOIN places p ON q.place_id = p.id
       LEFT JOIN users u ON q.user_id = u.id
       WHERE q.id = ?`
    ).get(questionId) as {
      id: number;
      place_id: number;
      user_id: number;
      question: string;
      place_name: string;
    } | undefined;

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    const isTeam = ['owner', 'developer', 'uploader'].includes(user.role) ? 1 : 0;

    const res = db.prepare(
      'INSERT INTO place_answers (question_id, user_id, answer, is_team, status) VALUES (?, ?, ?, ?, ?)'
    ).run(questionId, user.id, cleanAnswer, isTeam, 'approved');

    const answerId = Number(res.lastInsertRowid);

    // Notify question asker
    if (question.user_id && question.user_id !== user.id) {
      await createNotification({
        userId: question.user_id,
        type: 'question_answered',
        title: isTeam ? 'Official Team Answer Received!' : 'New Community Answer',
        body: `${isTeam ? 'The UncoverCeylon Team' : user.name} answered your question on ${question.place_name}.`,
        link: `/places/${question.place_id}`,
      });
    }

    return NextResponse.json({
      success: true,
      answerId,
      isTeam: Boolean(isTeam),
      message: 'Answer posted successfully!',
    }, { status: 201 });
  } catch (err: unknown) {
    console.error('QA Answer POST error:', err);
    const msg = err instanceof Error ? err.message : 'Failed to post answer';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
