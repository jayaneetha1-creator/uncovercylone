/**
 * src/app/api/admin/ai/test/route.ts
 * Admin endpoint for live testing prompts and models before saving.
 * Protected by RBAC: requirePermission('manage_site_settings').
 */

import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/permissions';
import { streamGeminiChat } from '@/lib/ai/gemini';

export async function POST(request: NextRequest) {
  const perm = await requirePermission(request, 'edit_ai_prompt');
  if (!perm.authorized) return perm.response;

  try {
    const body = await request.json();
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    const overridePrompt = typeof body.prompt === 'string' ? body.prompt : undefined;
    const overrideModel = typeof body.model === 'string' ? body.model : undefined;

    if (!message) {
      return NextResponse.json({ error: 'Message cannot be empty.' }, { status: 400 });
    }

    const stream = await streamGeminiChat({
      messages: [{ role: 'user', content: message }],
      overridePrompt,
      overrideModel,
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
      },
    });
  } catch (err) {
    console.error('API /api/admin/ai/test error:', err);
    return NextResponse.json({ error: 'Test execution failed.' }, { status: 500 });
  }
}
