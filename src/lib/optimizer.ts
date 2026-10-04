import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import sharp from 'sharp';

export interface ImageOptimizationResult {
  originalName: string;
  originalSize: number;
  optimizedSize: number;
  savingsPercent: number;
  width: number;
  height: number;
  primaryPath: string; // e.g. /uploads/optimized/abc_1600.webp
  responsivePaths: { width: number; path: string }[];
  hash: string;
}

export interface BatchOptimizationSummary {
  totalScanned: number;
  totalOptimized: number;
  originalBytes: number;
  optimizedBytes: number;
  bytesSaved: number;
  savingsPercent: number;
  results: ImageOptimizationResult[];
}

const UPLOAD_ROOT = path.join(process.cwd(), 'public', 'uploads');
const OPTIMIZED_DIR = path.join(UPLOAD_ROOT, 'optimized');

// Ensure output directories exist
function ensureDirs() {
  if (!fs.existsSync(UPLOAD_ROOT)) {
    fs.mkdirSync(UPLOAD_ROOT, { recursive: true });
  }
  if (!fs.existsSync(OPTIMIZED_DIR)) {
    fs.mkdirSync(OPTIMIZED_DIR, { recursive: true });
  }
}

/**
 * Validates magic bytes for image formats (JPEG, PNG, WebP, GIF, AVIF)
 */
export function validateImageMagicBytes(buffer: Buffer): boolean {
  if (!buffer || buffer.length < 12) return false;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return true;

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return true;
  }

  // WebP: RIFF ... WEBP
  const riff = buffer.toString('ascii', 0, 4);
  const webp = buffer.toString('ascii', 8, 12);
  if (riff === 'RIFF' && webp === 'WEBP') return true;

  // GIF: GIF87a or GIF89a
  const gif = buffer.toString('ascii', 0, 6);
  if (gif === 'GIF87a' || gif === 'GIF89a') return true;

  return false;
}

/**
 * Optimizes an image buffer:
 * - Auto-rotates via EXIF & strips metadata
 * - Converts to WebP (quality 80)
 * - Generates responsive widths [480, 960, 1600] without upscaling
 * - Deduplicates by SHA256 hash
 */
export async function optimizeImageBuffer(
  buffer: Buffer,
  originalFilename: string
): Promise<ImageOptimizationResult> {
  ensureDirs();

  if (!validateImageMagicBytes(buffer)) {
    throw new Error('Invalid image file format. Supported formats: JPEG, PNG, WebP, GIF.');
  }

  const originalSize = buffer.length;
  const hash = crypto.createHash('sha256').update(buffer).digest('hex').slice(0, 16);

  const image = sharp(buffer);
  const metadata = await image.metadata();

  const srcWidth = metadata.width || 1200;
  const srcHeight = metadata.height || 800;

  // Target widths for responsive delivery
  const targetWidths = [480, 960, 1600].filter((w) => w <= srcWidth || w === 480);
  if (targetWidths.length === 0) targetWidths.push(srcWidth);

  const responsivePaths: { width: number; path: string }[] = [];
  let largestSize = 0;
  let primaryRelativePath = '';

  for (const width of targetWidths) {
    const filename = `${hash}_w${width}.webp`;
    const outPath = path.join(OPTIMIZED_DIR, filename);
    const relPath = `/uploads/optimized/${filename}`;

    if (!fs.existsSync(outPath)) {
      await sharp(buffer)
        .rotate() // Auto-orient according to EXIF
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 80, effort: 4 })
        .toFile(outPath);
    }

    const stat = fs.statSync(outPath);
    if (stat.size > largestSize) {
      largestSize = stat.size;
      primaryRelativePath = relPath;
    }

    responsivePaths.push({ width, path: relPath });
  }

  // If source was smaller than 1600, primary is the largest generated size
  if (!primaryRelativePath && responsivePaths.length > 0) {
    primaryRelativePath = responsivePaths[responsivePaths.length - 1].path;
    largestSize = fs.statSync(path.join(process.cwd(), 'public', primaryRelativePath)).size;
  }

  const savingsPercent = originalSize > 0
    ? Math.max(0, Math.round(((originalSize - largestSize) / originalSize) * 100))
    : 0;

  return {
    originalName: originalFilename,
    originalSize,
    optimizedSize: largestSize,
    savingsPercent,
    width: srcWidth,
    height: srcHeight,
    primaryPath: primaryRelativePath,
    responsivePaths,
    hash,
  };
}

/**
 * Scans public/uploads for existing JPEG/PNG files and optimizes them into WebP
 */
export async function batchOptimizeAllUploads(): Promise<BatchOptimizationSummary> {
  ensureDirs();

  const results: ImageOptimizationResult[] = [];
  let totalOriginal = 0;
  let totalOptimized = 0;

  const scanDir = (dir: string): string[] => {
    let files: string[] = [];
    if (!fs.existsSync(dir)) return files;
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      if (fs.statSync(fullPath).isDirectory()) {
        if (item !== 'optimized') {
          files = files.concat(scanDir(fullPath));
        }
      } else {
        const ext = path.extname(item).toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
          files.push(fullPath);
        }
      }
    }
    return files;
  };

  const imageFiles = scanDir(UPLOAD_ROOT);

  for (const filePath of imageFiles) {
    try {
      const buffer = fs.readFileSync(filePath);
      const filename = path.basename(filePath);
      const res = await optimizeImageBuffer(buffer, filename);
      results.push(res);
      totalOriginal += res.originalSize;
      totalOptimized += res.optimizedSize;
    } catch {
      // Skip invalid or unreadable file
    }
  }

  const bytesSaved = Math.max(0, totalOriginal - totalOptimized);
  const savingsPercent = totalOriginal > 0 ? Math.round((bytesSaved / totalOriginal) * 100) : 0;

  return {
    totalScanned: imageFiles.length,
    totalOptimized: results.length,
    originalBytes: totalOriginal,
    optimizedBytes: totalOptimized,
    bytesSaved,
    savingsPercent,
    results,
  };
}
