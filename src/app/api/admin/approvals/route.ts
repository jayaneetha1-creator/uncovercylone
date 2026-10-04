import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { requirePermission } from '@/lib/permissions';
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    const authCheck = await requirePermission(user, 'approve_submissions');
    if (!authCheck.authorized) {
      return NextResponse.json({ error: authCheck.error }, { status: 403 });
    }

    const db = getDb();

    // Fetch pending places
    const pendingPlaces = db.prepare(
      `SELECT p.*, u.name as submitter_name, u.email as submitter_email
       FROM places p
       LEFT JOIN users u ON p.submitted_by = u.id
       WHERE p.status = 'pending'
       ORDER BY p.created_at DESC`
    ).all();

    // Fetch unverified/pending users needing review
    const pendingUsers = db.prepare(
      `SELECT id, name, email, role, status, country, created_at
       FROM users
       WHERE status = 'unverified'
       ORDER BY created_at DESC
       LIMIT 50`
    ).all();

    return NextResponse.json({
      success: true,
      pendingPlaces,
      pendingUsers,
    });
  } catch (err: unknown) {
    console.error('Approvals GET error:', err);
    const msg = err instanceof Error ? err.message : 'Failed to fetch approvals';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
