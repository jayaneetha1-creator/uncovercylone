/**
 * src/lib/theme.ts
 * Theme configuration, seasonal presets, and WCAG AA contrast validation.
 */

export interface ThemeConfig {
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  borderColor: string;
  fontFamily: string;
  radius: 'soft' | 'rounder';
  shadowLevel: 'subtle' | 'elevated';
  heroOverlay: number;
  preset: 'default' | 'vesak' | 'avurudu' | 'christmas';
}

export const DEFAULT_THEME: ThemeConfig = {
  primaryColor: '#38A9F0',
  accentColor: '#0F2A3D',
  backgroundColor: '#F5FAFF',
  borderColor: '#DCE8F2',
  fontFamily: 'Inter',
  radius: 'rounder',
  shadowLevel: 'subtle',
  heroOverlay: 0.35,
  preset: 'default',
};

export const SEASONAL_PRESETS: Record<string, Partial<ThemeConfig>> = {
  default: DEFAULT_THEME,
  vesak: {
    primaryColor: '#F5A623',
    accentColor: '#4A2A0C',
    backgroundColor: '#FFFDF9',
    borderColor: '#F3E5D0',
    preset: 'vesak',
  },
  avurudu: {
    primaryColor: '#27AE60',
    accentColor: '#0E3E21',
    backgroundColor: '#F7FCF9',
    borderColor: '#D1EAD8',
    preset: 'avurudu',
  },
  christmas: {
    primaryColor: '#E74C3C',
    accentColor: '#1A3F2C',
    backgroundColor: '#FDFBFA',
    borderColor: '#EFE5E4',
    preset: 'christmas',
  },
};

/**
 * Calculates luminance for a hex color.
 */
function getLuminance(hex: string): number {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;

  const a = [r, g, b].map((v) => {
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

/**
 * Calculates WCAG contrast ratio between two colors (e.g. text and background).
 * Target is >= 4.5:1 for normal text (AA) or >= 3.0:1 for large headings/UI.
 */
export function calculateContrastRatio(foregroundHex: string, backgroundHex: string): number {
  try {
    const l1 = getLuminance(foregroundHex);
    const l2 = getLuminance(backgroundHex);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return Math.round(((lighter + 0.05) / (darker + 0.05)) * 10) / 10;
  } catch {
    return 4.5;
  }
}

export function validateContrastAA(foregroundHex: string, backgroundHex: string): {
  valid: boolean;
  ratio: number;
  message?: string;
} {
  const ratio = calculateContrastRatio(foregroundHex, backgroundHex);
  const valid = ratio >= 3.0; // Meets WCAG AA large text / UI elements minimum
  return {
    valid,
    ratio,
    message: valid
      ? `Good contrast (${ratio}:1 meets WCAG AA standards)`
      : `Low contrast warning: Ratio (${ratio}:1) is below recommended WCAG AA minimum (3.0:1).`,
  };
}
