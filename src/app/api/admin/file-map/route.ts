import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/permissions';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  // Only owner and developer can view the project file map
  const auth = await requirePermission(request, 'view_file_map');
  if (!auth.authorized) return auth.response;

  try {
    const filePath = path.join(process.cwd(), 'docs', 'FILE_MAP.json');
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'FILE_MAP.json not found' }, { status: 404 });
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);

    return NextResponse.json({ fileMap: data });
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : String(error);
    console.error('GET /api/admin/file-map error:', err);
    return NextResponse.json({ error: 'Failed to read file map' }, { status: 500 });
  }
}
