import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/permissions';
import { DEFAULT_THEME, validateContrastAA, ThemeConfig, SEASONAL_PRESETS } from '@/lib/theme';
import { queryOne, execute } from '@/lib/db';
import { recordAuditLog } from '@/lib/db/governance';

export async function GET() {
  try {
    const row = await queryOne<{ value: string; value_text?: string }>(
      "SELECT * FROM site_settings WHERE key = 'site_theme' OR key_name = 'site_theme'"
    );

    if (row) {
      const stored = JSON.parse(row.value || row.value_text || '{}');
      return NextResponse.json({ theme: { ...DEFAULT_THEME, ...stored } });
    }

    return NextResponse.json({ theme: DEFAULT_THEME });
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : String(error);
    console.error('GET /api/admin/theme error:', err);
    return NextResponse.json({ theme: DEFAULT_THEME });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requirePermission(request, 'manage_theme');
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const { primaryColor, accentColor, backgroundColor, borderColor, radius, shadowLevel, heroOverlay, preset } = body;

    let targetTheme: ThemeConfig = { ...DEFAULT_THEME, ...body };

    // Apply seasonal preset if requested
    if (preset && SEASONAL_PRESETS[preset]) {
      targetTheme = { ...targetTheme, ...SEASONAL_PRESETS[preset] };
    }

    // Validate WCAG AA contrast
    const contrast = validateContrastAA(targetTheme.primaryColor, targetTheme.backgroundColor);

    // Save to site_settings table
    const themeJson = JSON.stringify(targetTheme);

    try {
      await execute(
        `INSERT INTO site_settings (key, value) VALUES ('site_theme', ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
        [themeJson]
      );
    } catch {
      // MySQL syntax fallback
      await execute(
        `INSERT INTO site_settings (key_name, value_text) VALUES ('site_theme', ?)
         ON DUPLICATE KEY UPDATE value_text = VALUES(value_text)`,
        [themeJson]
      );
    }

    await recordAuditLog({
      userId: auth.user.id,
      userEmail: auth.user.email,
      userRole: auth.user.role,
      action: 'update_theme',
      entityType: 'theme',
      details: `Updated design tokens (Primary: ${targetTheme.primaryColor}, Preset: ${targetTheme.preset})`,
      ipAddress: request.headers.get('x-forwarded-for') || '',
    });

    return NextResponse.json({
      success: true,
      message: 'Theme saved successfully!',
      theme: targetTheme,
      contrast,
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : String(error);
    console.error('POST /api/admin/theme error:', err);
    return NextResponse.json({ error: 'Failed to save theme settings' }, { status: 500 });
  }
}
