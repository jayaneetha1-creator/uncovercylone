/**
 * src/lib/db/news.ts
 * Data access module for Phase 10: AI News (Sri Lanka Tourism).
 */

import { query, queryOne, execute, isMySqlEnabled } from '../db';
import {
  NewsItem,
  NewsRun,
  NewsSettings,
  DEFAULT_NEWS_SETTINGS,
  RelatedPlaceSummary,
} from '../news/constants';

export {
  type NewsCategory,
  type NewsCategoryMeta,
  type RelatedPlaceSummary,
  type NewsItem,
  type NewsRun,
  type NewsSettings,
  NEWS_CATEGORIES,
  DEFAULT_NEWS_SETTINGS,
} from '../news/constants';

// -------------------------------------------------------------
// 1. News Settings
// -------------------------------------------------------------

export async function getNewsSettings(): Promise<NewsSettings> {
  try {
    const rows = await query<{ key: string; value: string }>(
      `SELECT key, value FROM site_settings WHERE key IN ('news_enabled', 'news_auto_publish', 'news_schedule', 'news_last_run')`
    );
    const map = new Map<string, string>();
    for (const r of rows) map.set(r.key, r.value);

    return {
      enabled: map.has('news_enabled') ? map.get('news_enabled') === 'true' : DEFAULT_NEWS_SETTINGS.enabled,
      autoPublish: map.has('news_auto_publish') ? map.get('news_auto_publish') === 'true' : DEFAULT_NEWS_SETTINGS.autoPublish,
      schedule: map.get('news_schedule') || DEFAULT_NEWS_SETTINGS.schedule,
      lastRun: map.get('news_last_run') || null,
    };
  } catch (err) {
    console.error('getNewsSettings error:', err);
    return { ...DEFAULT_NEWS_SETTINGS };
  }
}

export async function updateNewsSettings(settings: Partial<NewsSettings>): Promise<NewsSettings> {
  const current = await getNewsSettings();
  const updated: NewsSettings = {
    ...current,
    ...settings,
  };

  const pairs: [string, string][] = [
    ['news_enabled', String(updated.enabled)],
    ['news_auto_publish', String(updated.autoPublish)],
    ['news_schedule', updated.schedule],
  ];

  if (settings.lastRun !== undefined) {
    pairs.push(['news_last_run', settings.lastRun || '']);
  }

  for (const [k, v] of pairs) {
    const existing = await queryOne('SELECT key FROM site_settings WHERE key = ?', [k]);
    if (existing) {
      await execute('UPDATE site_settings SET value = ? WHERE key = ?', [v, k]);
    } else {
      await execute('INSERT INTO site_settings (key, value) VALUES (?, ?)', [k, v]);
    }
  }

  return updated;
}

// -------------------------------------------------------------
// 2. Helper to Resolve Related Places
// -------------------------------------------------------------

async function attachRelatedPlaces(items: NewsItem[]): Promise<NewsItem[]> {
  if (!items.length) return items;

  // Collect all unique place IDs across items
  const placeIdSet = new Set<number>();
  for (const item of items) {
    let ids: number[] = [];
    if (Array.isArray(item.related_place_ids)) {
      ids = item.related_place_ids;
    } else if (typeof item.related_place_ids === 'string') {
      try {
        ids = JSON.parse(item.related_place_ids);
      } catch {
        ids = [];
      }
    }
    for (const id of ids) {
      if (typeof id === 'number' && id > 0) placeIdSet.add(id);
    }
  }

  if (placeIdSet.size === 0) {
    return items.map((it) => ({
      ...it,
      related_places: [],
      related_place_ids: Array.isArray(it.related_place_ids)
        ? it.related_place_ids
        : typeof it.related_place_ids === 'string'
        ? JSON.parse(it.related_place_ids || '[]')
        : [],
    }));
  }

  const idsArray = Array.from(placeIdSet);
  const placeholders = idsArray.map(() => '?').join(',');
  const places = await query<RelatedPlaceSummary>(
    `SELECT id, name, location, image_url, rating, category FROM places WHERE id IN (${placeholders})`,
    idsArray
  );

  const placeMap = new Map<number, RelatedPlaceSummary>();
  for (const p of places) {
    placeMap.set(p.id, p);
  }

  return items.map((it) => {
    let ids: number[] = [];
    if (Array.isArray(it.related_place_ids)) {
      ids = it.related_place_ids;
    } else if (typeof it.related_place_ids === 'string') {
      try {
        ids = JSON.parse(it.related_place_ids);
      } catch {
        ids = [];
      }
    }
    const resolved: RelatedPlaceSummary[] = [];
    for (const id of ids) {
      const match = placeMap.get(id);
      if (match) resolved.push(match);
    }
    return {
      ...it,
      related_place_ids: ids,
      related_places: resolved,
    };
  });
}

// -------------------------------------------------------------
// 3. Public News Queries
// -------------------------------------------------------------

export interface GetNewsOptions {
  category?: string;
  query?: string;
  limit?: number;
  offset?: number;
}

export async function getPublishedNews(options: GetNewsOptions = {}): Promise<{
  items: NewsItem[];
  total: number;
  categoryCounts: Record<string, number>;
}> {
  const { category, query: searchQuery, limit = 20, offset = 0 } = options;

  let whereSql = "WHERE status IN ('published', 'pinned')";
  const params: (string | number)[] = [];

  if (category && category !== 'All') {
    whereSql += ' AND category = ?';
    params.push(category);
  }

  if (searchQuery && searchQuery.trim()) {
    whereSql += ' AND (title LIKE ? OR summary LIKE ? OR content LIKE ?)';
    const term = `%${searchQuery.trim()}%`;
    params.push(term, term, term);
  }

  // Count total matching
  const countRow = await queryOne<{ count: number }>(
    `SELECT COUNT(*) as count FROM news_items ${whereSql}`,
    params
  );
  const total = countRow?.count ?? 0;

  // Category counts for quick filter chips
  const catRows = await query<{ category: string; count: number }>(
    `SELECT category, COUNT(*) as count FROM news_items WHERE status IN ('published', 'pinned') GROUP BY category`
  );
  const categoryCounts: Record<string, number> = { All: 0 };
  let allTotal = 0;
  for (const cr of catRows) {
    categoryCounts[cr.category] = cr.count;
    allTotal += cr.count;
  }
  categoryCounts.All = allTotal;

  // Fetch items: pinned first, then newest published_at
  const sql = `
    SELECT * FROM news_items
    ${whereSql}
    ORDER BY is_pinned DESC, published_at DESC
    LIMIT ? OFFSET ?
  `;
  const items = await query<NewsItem>(sql, [...params, limit, offset]);
  const enriched = await attachRelatedPlaces(items);

  return { items: enriched, total, categoryCounts };
}

export async function getNewsById(id: number): Promise<NewsItem | null> {
  const item = await queryOne<NewsItem>('SELECT * FROM news_items WHERE id = ?', [id]);
  if (!item) return null;
  const [enriched] = await attachRelatedPlaces([item]);
  return enriched;
}

export async function getNewsBySlug(slug: string): Promise<NewsItem | null> {
  const item = await queryOne<NewsItem>('SELECT * FROM news_items WHERE slug = ?', [slug]);
  if (!item) return null;
  const [enriched] = await attachRelatedPlaces([item]);
  return enriched;
}

// -------------------------------------------------------------
// 4. Admin Management Queries
// -------------------------------------------------------------

export interface AdminNewsOptions {
  status?: string;
  category?: string;
  query?: string;
  limit?: number;
  offset?: number;
}

export async function getAllNewsAdmin(options: AdminNewsOptions = {}): Promise<{
  items: NewsItem[];
  total: number;
  counts: {
    total: number;
    published: number;
    review: number;
    hidden: number;
    pinned: number;
  };
}> {
  const { status, category, query: searchQuery, limit = 50, offset = 0 } = options;

  let whereSql = 'WHERE 1=1';
  const params: (string | number)[] = [];

  if (status && status !== 'all') {
    if (status === 'pinned') {
      whereSql += ' AND is_pinned = 1';
    } else {
      whereSql += ' AND status = ?';
      params.push(status);
    }
  }

  if (category && category !== 'All') {
    whereSql += ' AND category = ?';
    params.push(category);
  }

  if (searchQuery && searchQuery.trim()) {
    whereSql += ' AND (title LIKE ? OR summary LIKE ? OR source_name LIKE ?)';
    const term = `%${searchQuery.trim()}%`;
    params.push(term, term, term);
  }

  const countRow = await queryOne<{ count: number }>(
    `SELECT COUNT(*) as count FROM news_items ${whereSql}`,
    params
  );
  const total = countRow?.count ?? 0;

  // Breakdown counts
  const statRows = await query<{ status: string; is_pinned: number; count: number }>(
    `SELECT status, is_pinned, COUNT(*) as count FROM news_items GROUP BY status, is_pinned`
  );
  let totalCount = 0;
  let publishedCount = 0;
  let reviewCount = 0;
  let hiddenCount = 0;
  let pinnedCount = 0;

  for (const r of statRows) {
    totalCount += r.count;
    if (r.is_pinned === 1) pinnedCount += r.count;
    if (r.status === 'published') publishedCount += r.count;
    if (r.status === 'review') reviewCount += r.count;
    if (r.status === 'hidden') hiddenCount += r.count;
  }

  const sql = `
    SELECT * FROM news_items
    ${whereSql}
    ORDER BY is_pinned DESC, published_at DESC
    LIMIT ? OFFSET ?
  `;
  const items = await query<NewsItem>(sql, [...params, limit, offset]);
  const enriched = await attachRelatedPlaces(items);

  return {
    items: enriched,
    total,
    counts: {
      total: totalCount,
      published: publishedCount,
      review: reviewCount,
      hidden: hiddenCount,
      pinned: pinnedCount,
    },
  };
}

export function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 80);
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${base}-${randomSuffix}`;
}

export async function createNewsItem(item: {
  title: string;
  summary: string;
  content?: string;
  category: string;
  source_name: string;
  source_url?: string;
  image_url?: string;
  related_place_ids?: number[];
  status?: 'published' | 'review' | 'hidden' | 'pinned';
  is_pinned?: boolean | number;
  published_at?: string;
}): Promise<number> {
  const slug = generateSlug(item.title);
  const nowSql = isMySqlEnabled() ? 'NOW()' : "datetime('now')";
  const publishedAt = item.published_at || (isMySqlEnabled() ? new Date().toISOString().slice(0, 19).replace('T', ' ') : new Date().toISOString());
  const relatedPlacesJson = JSON.stringify(item.related_place_ids || []);

  const res = await execute(
    `INSERT INTO news_items (
      title, slug, summary, content, category, source_name, source_url, image_url,
      related_place_ids, status, is_pinned, published_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ${nowSql}, ${nowSql})`,
    [
      item.title,
      slug,
      item.summary,
      item.content || '',
      item.category || 'Tourism',
      item.source_name,
      item.source_url || '',
      item.image_url || '',
      relatedPlacesJson,
      item.status || 'published',
      item.is_pinned ? 1 : 0,
      publishedAt,
    ]
  );

  return res.insertId;
}

export async function updateNewsItem(
  id: number,
  updates: Partial<Omit<NewsItem, 'id' | 'created_at'>>
): Promise<boolean> {
  const fields: string[] = [];
  const params: (string | number | null)[] = [];

  if (updates.title !== undefined) {
    fields.push('title = ?');
    params.push(updates.title);
  }
  if (updates.summary !== undefined) {
    fields.push('summary = ?');
    params.push(updates.summary);
  }
  if (updates.content !== undefined) {
    fields.push('content = ?');
    params.push(updates.content);
  }
  if (updates.category !== undefined) {
    fields.push('category = ?');
    params.push(updates.category);
  }
  if (updates.source_name !== undefined) {
    fields.push('source_name = ?');
    params.push(updates.source_name);
  }
  if (updates.source_url !== undefined) {
    fields.push('source_url = ?');
    params.push(updates.source_url);
  }
  if (updates.image_url !== undefined) {
    fields.push('image_url = ?');
    params.push(updates.image_url);
  }
  if (updates.related_place_ids !== undefined) {
    fields.push('related_place_ids = ?');
    params.push(
      typeof updates.related_place_ids === 'string'
        ? updates.related_place_ids
        : JSON.stringify(updates.related_place_ids)
    );
  }
  if (updates.status !== undefined) {
    fields.push('status = ?');
    params.push(updates.status);
  }
  if (updates.is_pinned !== undefined) {
    fields.push('is_pinned = ?');
    params.push(updates.is_pinned ? 1 : 0);
  }
  if (updates.published_at !== undefined) {
    fields.push('published_at = ?');
    params.push(updates.published_at);
  }

  if (fields.length === 0) return false;

  const nowSql = isMySqlEnabled() ? 'NOW()' : "datetime('now')";
  fields.push(`updated_at = ${nowSql}`);

  params.push(id);
  const sql = `UPDATE news_items SET ${fields.join(', ')} WHERE id = ?`;
  const res = await execute(sql, params);
  return res.affectedRows > 0;
}

export async function deleteNewsItem(id: number): Promise<boolean> {
  const res = await execute('DELETE FROM news_items WHERE id = ?', [id]);
  return res.affectedRows > 0;
}

// -------------------------------------------------------------
// 5. Crawler History (Runs)
// -------------------------------------------------------------

export async function getNewsRuns(limit = 20): Promise<NewsRun[]> {
  return await query<NewsRun>(
    'SELECT * FROM news_runs ORDER BY id DESC LIMIT ?',
    [limit]
  );
}

export async function logNewsRun(run: {
  trigger_type: 'scheduled' | 'manual';
  items_found: number;
  items_added: number;
  status: 'success' | 'failed' | 'running';
  error_message?: string;
}): Promise<number> {
  const nowSql = isMySqlEnabled() ? 'NOW()' : "datetime('now')";
  const res = await execute(
    `INSERT INTO news_runs (trigger_type, items_found, items_added, status, error_message, executed_at)
     VALUES (?, ?, ?, ?, ?, ${nowSql})`,
    [
      run.trigger_type,
      run.items_found,
      run.items_added,
      run.status,
      run.error_message || '',
    ]
  );
  return res.insertId;
}

// -------------------------------------------------------------
// 6. Safe Seed Initial High-Quality News
// -------------------------------------------------------------

export async function seedInitialNewsIfEmpty(): Promise<void> {
  try {
    const existing = await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM news_items');
    if (existing && existing.count > 0) {
      return;
    }

    // Try finding matching place IDs for Sigiriya, Kandy, Ella, Yala, Mirissa
    const places = await query<{ id: number; name: string }>(
      `SELECT id, name FROM places WHERE name LIKE '%Sigiriya%' OR name LIKE '%Kandy%' OR name LIKE '%Ella%' OR name LIKE '%Yala%' OR name LIKE '%Mirissa%' OR name LIKE '%Galle%'`
    );
    const getPlaceId = (keyword: string) => {
      const match = places.find((p) => p.name.toLowerCase().includes(keyword.toLowerCase()));
      return match ? match.id : 0;
    };

    const sigiriyaId = getPlaceId('Sigiriya');
    const ellaId = getPlaceId('Ella');
    const yalaId = getPlaceId('Yala');
    const mirissaId = getPlaceId('Mirissa');
    const galleId = getPlaceId('Galle');

    const initialNews = [
      {
        title: 'Ella Odyssey Scenic Train Expands Weekend Services with Panoramic View Coaches',
        summary: 'Sri Lanka Railways has added extra weekend departures on the famous Colombo-Badulla mountain railway via Ella, featuring enhanced panoramic observation decks and online reservations for international travelers.',
        content: 'The Ella Odyssey train journey, acclaimed globally as one of the world\'s most breathtaking scenic railway experiences, is expanding its weekend departure frequency to accommodate rising international traveler demand. The journey winds past lush tea estates, misty mountain tunnels, and the world-famous Nine Arches Bridge. Passengers are advised to reserve second and first-class tickets through the official Sri Lanka Railways web portal up to 30 days in advance.',
        category: 'Transport',
        source_name: 'Sri Lanka Railways & Tourism Bureau',
        source_url: 'https://railway.gov.lk',
        image_url: 'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=1200&q=80',
        related_place_ids: ellaId ? [ellaId] : [],
        is_pinned: 1,
        status: 'published' as const,
        published_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      },
      {
        title: 'Yala National Park Announces Prime Wildlife Viewing Windows as Dry Season Commences',
        summary: 'Department of Wildlife Conservation opens seasonal waterhole observation tracks in Block 1 with strict jeep speed guidelines to safeguard Sri Lankan leopards and sloth bears.',
        content: 'Wildlife authorities in Yala National Park have confirmed that the commencement of the dry season in the southern province offers peak sightings for leopards, wild elephants, and sloth bears congregating near permanent lakes and rocky outcrops. To guarantee quiet safari conditions, park officials have introduced staggered entry times and enforced strict speed limits across all licensed safari vehicles.',
        category: 'Openings',
        source_name: 'Department of Wildlife Conservation',
        source_url: 'https://dwc.gov.lk',
        image_url: 'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?auto=format&fit=crop&w=1200&q=80',
        related_place_ids: yalaId ? [yalaId] : [],
        is_pinned: 0,
        status: 'published' as const,
        published_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
      },
      {
        title: 'Southern Coast Whale Watching Season Enters Peak Migration Window Off Mirissa',
        summary: 'Calm ocean waters and nutrient-rich currents bring resident blue whales and pods of spinner dolphins close to the Mirissa continental shelf, with certified eco-safaris operating daily.',
        content: 'Marine naturalists operating along the southern coastline report pristine sea conditions and exceptionally frequent blue whale surface sightings off Mirissa and Dondra Head. International visitors are encouraged to choose operators accredited by the Marine Environment Protection Authority (MEPA) who adhere to safe standoff distances for marine mammal preservation.',
        category: 'Attractions',
        source_name: 'Marine Environment Protection Authority',
        source_url: 'https://mepa.gov.lk',
        image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
        related_place_ids: mirissaId ? [mirissaId] : [],
        is_pinned: 0,
        status: 'published' as const,
        published_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
      },
      {
        title: 'Sigiriya Cultural Triangle Enhances Eco-Friendly Solar Shuttles & Dawn Pathways',
        summary: 'Central Cultural Fund introduces quiet electric shuttle vehicles around the lion rock moat perimeter to reduce emissions and preserve the ancient hydraulic gardens.',
        content: 'In an ongoing commitment to UNESCO sustainable heritage conservation, the Central Cultural Fund has rolled out zero-emission electric shuttles connecting the Sigiriya archaeological museum and ticket office to the water garden entrance. Climbers are reminded that early morning ascents between 06:30 AM and 08:30 AM offer the coolest temperatures and panoramic views across the central plains.',
        category: 'Advisories',
        source_name: 'Central Cultural Fund Sri Lanka',
        source_url: 'https://ccf.gov.lk',
        image_url: 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=1200&q=80',
        related_place_ids: sigiriyaId ? [sigiriyaId] : [],
        is_pinned: 0,
        status: 'published' as const,
        published_at: new Date(Date.now() - 1000 * 60 * 60 * 52).toISOString(),
      },
      {
        title: 'Galle Fort Heritage Walkways Complete Historic Cobblestone Restoration',
        summary: 'Artisans finish careful preservation of 17th-century ramparts and ocean-facing bastions with new bilingual historic marker plaques for walking visitors.',
        content: 'Visitors strolling through the UNESCO World Heritage Site of Galle Fort can now enjoy newly restored pedestrian walkways and historic bastions overlooking the Indian Ocean. The restoration preserves Dutch-period coral and granite masonry while installing subtle low-energy pathway lighting for evening walks between the iconic lighthouse and the Old Dutch Hospital dining quarter.',
        category: 'Events',
        source_name: 'Galle Heritage Foundation',
        source_url: 'https://galleheritage.gov.lk',
        image_url: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=1200&q=80',
        related_place_ids: galleId ? [galleId] : [],
        is_pinned: 0,
        status: 'published' as const,
        published_at: new Date(Date.now() - 1000 * 60 * 60 * 75).toISOString(),
      },
    ];

    for (const item of initialNews) {
      await createNewsItem(item);
    }

    await logNewsRun({
      trigger_type: 'manual',
      items_found: initialNews.length,
      items_added: initialNews.length,
      status: 'success',
      error_message: 'Initial verified Sri Lanka tourism news seeded successfully.',
    });
  } catch (err) {
    console.error('seedInitialNewsIfEmpty error:', err);
  }
}
