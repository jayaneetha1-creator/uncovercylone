import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getCurrentUser } from '@/lib/auth';
import { requirePermission } from '@/lib/permissions';
import { batchOptimizeAllUploads } from '@/lib/optimizer';
import { logAudit } from '@/lib/db/governance';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    const authCheck = await requirePermission(user, 'upload_images');
    if (!authCheck.authorized) {
      return NextResponse.json({ error: authCheck.error }, { status: 403 });
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    let totalFiles = 0;
    let totalBytes = 0;
    let webpCount = 0;
    let rawCount = 0;

    if (fs.existsSync(uploadDir)) {
      const scan = (dir: string) => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            scan(fullPath);
          } else {
            totalFiles++;
            const stat = fs.statSync(fullPath);
            totalBytes += stat.size;
            if (entry.name.endsWith('.webp')) {
              webpCount++;
            } else if (['.jpg', '.jpeg', '.png'].some((ext) => entry.name.toLowerCase().endsWith(ext))) {
              rawCount++;
            }
          }
        }
      };
      scan(uploadDir);
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalFiles,
        totalBytes,
        totalMb: (totalBytes / (1024 * 1024)).toFixed(2),
        webpCount,
        rawCount,
        needsOptimization: rawCount > 0,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to inspect media';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    const authCheck = await requirePermission(user, 'upload_images');
    if (!authCheck.authorized) {
      return NextResponse.json({ error: authCheck.error }, { status: 403 });
    }

    const summary = await batchOptimizeAllUploads();

    await logAudit({
      userId: user?.id,
      userEmail: user?.email,
      userRole: user?.role,
      action: 'optimize_images',
      entityType: 'media',
      details: `Batch optimized ${summary.totalOptimized} images; saved ${(summary.bytesSaved / 1024).toFixed(1)} KB (${summary.savingsPercent}%)`,
      ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    return NextResponse.json({
      success: true,
      summary,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Optimization failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
