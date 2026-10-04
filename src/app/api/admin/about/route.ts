import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/permissions';
import { getAboutContent, saveAboutBlock, saveAllAboutBlocks, AboutPageData } from '@/lib/db/about';
import { getSiteNodes } from '@/lib/db/nodes';
import { recordAuditLog } from '@/lib/db/governance';
import { revalidatePath } from 'next/cache';

export async function GET(request: NextRequest) {
  const auth = await requirePermission(request, 'manage_site_nodes');
  if (!auth.authorized) return auth.response;

  try {
    const [content, allNodes] = await Promise.all([
      getAboutContent(),
      getSiteNodes(true),
    ]);

    const aboutNodes = allNodes.filter(
      (n) => n.node_key === 'page_about' || (n.parent_id === allNodes.find((p) => p.node_key === 'page_about')?.id) || n.node_key.startsWith('about_')
    );

    return NextResponse.json({
      success: true,
      content,
      nodes: aboutNodes,
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : String(error);
    console.error('GET /api/admin/about error:', err);
    return NextResponse.json({ error: 'Failed to load about page configuration' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requirePermission(request, 'manage_site_nodes');
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const { blockKey, config, blocks } = body;

    if (blocks && typeof blocks === 'object') {
      const success = await saveAllAboutBlocks(blocks as Partial<AboutPageData>);
      if (!success) {
        return NextResponse.json({ error: 'Failed to save some about blocks' }, { status: 500 });
      }

      await recordAuditLog({
        userId: auth.user.id,
        userEmail: auth.user.email,
        userRole: auth.user.role,
        action: 'update_about_content',
        entityType: 'about_page',
        details: 'Updated all configurable About page blocks (Hero, Story, Photos, Values, Team, Contact)',
        ipAddress: request.headers.get('x-forwarded-for') || '',
      });

      revalidatePath('/about');
      return NextResponse.json({ success: true, message: 'All about blocks updated successfully.' });
    }

    if (blockKey && config) {
      const validKeys = ['about_hero', 'about_story', 'about_photos', 'about_values', 'about_team', 'about_contact'] as const;
      if (!validKeys.includes(blockKey)) {
        return NextResponse.json({ error: 'Invalid block key' }, { status: 400 });
      }

      const success = await saveAboutBlock(blockKey, config);
      if (!success) {
        return NextResponse.json({ error: `Failed to update block ${blockKey}` }, { status: 500 });
      }

      await recordAuditLog({
        userId: auth.user.id,
        userEmail: auth.user.email,
        userRole: auth.user.role,
        action: 'update_about_block',
        entityType: 'about_block',
        entityId: blockKey,
        details: `Updated about block: ${blockKey}`,
        ipAddress: request.headers.get('x-forwarded-for') || '',
      });

      revalidatePath('/about');
      return NextResponse.json({ success: true, message: `Block ${blockKey} updated successfully.` });
    }

    return NextResponse.json({ error: 'Missing blockKey or blocks payload' }, { status: 400 });
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : String(error);
    console.error('PUT /api/admin/about error:', err);
    return NextResponse.json({ error: 'Failed to update about page' }, { status: 500 });
  }
}
