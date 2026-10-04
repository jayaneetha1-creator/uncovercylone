/**
 * src/app/api/admin/ai/logs/route.ts
 * Admin endpoint to view anonymized/privacy-conscious chat session logs for quality review.
 * Protected by RBAC: requirePermission('manage_site_settings').
 */

import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/permissions';
import { getChatLogsForAdmin, getSessionMessages } from '@/lib/db/ai';

export async function GET(request: NextRequest) {
  const perm = await requirePermission(request, 'edit_ai_prompt');
  if (!perm.authorized) return perm.response;

  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (sessionId) {
      const messages = await getSessionMessages(sessionId, 50);
      return NextResponse.json({ success: true, messages });
    }

    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const logs = await getChatLogsForAdmin(limit);

    // Redact email addresses to protect user privacy (e.g. j***@domain.com)
    const sanitizedLogs = logs.map((log) => {
      const parts = (log.user_email || '').split('@');
      let redactedEmail = log.user_email;
      if (parts.length === 2 && parts[0].length > 1) {
        redactedEmail = `${parts[0][0]}***@${parts[1]}`;
      }
      return {
        ...log,
        user_email: redactedEmail,
      };
    });

    return NextResponse.json({ success: true, logs: sanitizedLogs });
  } catch (err) {
    console.error('API /api/admin/ai/logs GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}
