/**
 * src/app/api/admin/ai/route.ts
 * Admin endpoint to manage AI chatbot configuration, model, prompt versions, and metrics.
 * Protected by RBAC: requirePermission('manage_site_settings').
 */

import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/permissions';
import {
  getAISettings,
  updateAISettings,
  getPromptVersions,
  getAIUsageStats,
} from '@/lib/db/ai';
import { logAudit } from '@/lib/db/admin';

export async function GET(request: NextRequest) {
  const perm = await requirePermission(request, 'edit_ai_prompt');
  if (!perm.authorized) return perm.response;

  try {
    const settings = await getAISettings();
    const versions = await getPromptVersions();
    const stats = await getAIUsageStats();

    return NextResponse.json({
      success: true,
      settings,
      versions,
      stats,
    });
  } catch (err) {
    console.error('API /api/admin/ai GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch AI configuration' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const perm = await requirePermission(request, 'edit_ai_prompt');
  if (!perm.authorized) return perm.response;

  try {
    const body = await request.json();
    const ok = await updateAISettings(body, perm.user.id);

    if (!ok) {
      return NextResponse.json({ error: 'Failed to update AI settings' }, { status: 500 });
    }

    await logAudit({
      userId: perm.user.id,
      userEmail: perm.user.email,
      userRole: perm.user.role,
      action: 'UPDATE_AI_SETTINGS',
      entityType: 'ai_settings',
      entityId: 'ai_config',
      details: `Updated AI settings: model=${body.model ?? 'unchanged'}, enabled=${body.masterEnabled ?? 'unchanged'}, promptLength=${body.systemPrompt?.length ?? 'unchanged'}`,
    });

    const updated = await getAISettings();
    const versions = await getPromptVersions();

    return NextResponse.json({ success: true, settings: updated, versions });
  } catch (err) {
    console.error('API /api/admin/ai POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
