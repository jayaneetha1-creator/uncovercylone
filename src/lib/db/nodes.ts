/**
 * src/lib/db/nodes.ts
 * Data access module for Folder Manager (Site Tree / site_nodes).
 * Supports full parent-child hierarchy, drag-reordering, zero-gap disabling, and defaults restoration.
 */

import { query, queryOne, execute } from '../db';
import { SiteNode } from '@/types';

export const DEFAULT_SITE_NODES: Array<Omit<SiteNode, 'id' | 'created_at'> & { key: string; parent_key?: string }> = [
  // ━━━ TOP-LEVEL MAIN PAGES ━━━
  {
    node_key: 'page_home',
    key: 'page_home',
    parent_id: null,
    type: 'page',
    title_en: 'Home Page',
    title_si: 'මුල් පිටුව',
    enabled: 1,
    sort_order: 1,
    default_open: 1,
    priority: 10,
    device_visibility: 'all',
  },
  {
    node_key: 'page_destinations',
    key: 'page_destinations',
    parent_id: null,
    type: 'page',
    title_en: 'Destinations Directory',
    title_si: 'ගමනාන්ත',
    enabled: 1,
    sort_order: 2,
    default_open: 1,
    priority: 9,
    device_visibility: 'all',
  },
  {
    node_key: 'page_map',
    key: 'page_map',
    parent_id: null,
    type: 'page',
    title_en: 'Interactive Map',
    title_si: 'සිතියම',
    enabled: 1,
    sort_order: 3,
    default_open: 1,
    priority: 8,
    device_visibility: 'all',
  },
  {
    node_key: 'page_trips',
    key: 'page_trips',
    parent_id: null,
    type: 'page',
    title_en: 'Trip Planner',
    title_si: 'මගේ චාරිකා',
    enabled: 1,
    sort_order: 4,
    default_open: 1,
    priority: 7,
    device_visibility: 'all',
  },
  {
    node_key: 'page_news',
    key: 'page_news',
    parent_id: null,
    type: 'page',
    title_en: 'Tourism News',
    title_si: 'සංචාරක පුවත්',
    enabled: 1,
    sort_order: 5,
    default_open: 1,
    priority: 6,
    device_visibility: 'all',
  },
  {
    node_key: 'page_about',
    key: 'page_about',
    parent_id: null,
    type: 'page',
    title_en: 'About UncoverCeylon',
    title_si: 'අප ගැන',
    enabled: 1,
    sort_order: 6,
    default_open: 1,
    priority: 5,
    device_visibility: 'all',
  },

  // ━━━ HOME PAGE SUB-FOLDERS ━━━
  {
    node_key: 'home_hero',
    key: 'home_hero',
    parent_key: 'page_home',
    parent_id: null,
    type: 'section',
    title_en: 'Hero Slideshow & Quick Search',
    title_si: 'ප්‍රධාන සේයාරූ සහ සෙවුම',
    enabled: 1,
    sort_order: 1,
    default_open: 1,
    priority: 10,
    device_visibility: 'all',
  },
  {
    node_key: 'home_interests',
    key: 'home_interests',
    parent_key: 'page_home',
    parent_id: null,
    type: 'section',
    title_en: 'What kind of island trip do you imagine?',
    title_si: 'ඔබේ සිහින සංචාරය තෝරන්න',
    enabled: 1,
    sort_order: 2,
    default_open: 1,
    priority: 9,
    device_visibility: 'all',
  },
  {
    node_key: 'home_favorites',
    key: 'home_favorites',
    parent_key: 'page_home',
    parent_id: null,
    type: 'section',
    title_en: 'Travelers Favourites',
    title_si: 'සංචාරකයන්ගේ ප්‍රියතම ස්ථාන',
    enabled: 1,
    sort_order: 3,
    default_open: 1,
    priority: 8,
    device_visibility: 'all',
  },
  {
    node_key: 'home_gems',
    key: 'home_gems',
    parent_key: 'page_home',
    parent_id: null,
    type: 'section',
    title_en: 'Hidden Gems Row',
    title_si: 'සැඟවුණු සුන්දර තැන්',
    enabled: 1,
    sort_order: 4,
    default_open: 1,
    priority: 7,
    device_visibility: 'all',
  },
  {
    node_key: 'home_regions',
    key: 'home_regions',
    parent_key: 'page_home',
    parent_id: null,
    type: 'section',
    title_en: 'Explore by Region',
    title_si: 'කලාප අනුව ගවේෂණය',
    enabled: 1,
    sort_order: 5,
    default_open: 1,
    priority: 6,
    device_visibility: 'all',
  },
  {
    node_key: 'home_news',
    key: 'home_news',
    parent_key: 'page_home',
    parent_id: null,
    type: 'section',
    title_en: 'Latest Tourism News Teaser',
    title_si: 'නවතම පුවත්',
    enabled: 1,
    sort_order: 6,
    default_open: 1,
    priority: 5,
    device_visibility: 'all',
  },

  // ━━━ DESTINATIONS DIRECTORY FOLDERS ━━━
  {
    node_key: 'dest_filters',
    key: 'dest_filters',
    parent_key: 'page_destinations',
    parent_id: null,
    type: 'section',
    title_en: 'Filter Sidebar & Quick Chips',
    title_si: 'පෙරහන් තීරුව',
    enabled: 1,
    sort_order: 1,
    default_open: 1,
    priority: 10,
    device_visibility: 'all',
  },
  {
    node_key: 'dest_folder_beaches',
    key: 'dest_folder_beaches',
    parent_key: 'page_destinations',
    parent_id: null,
    type: 'block',
    title_en: 'Golden Beaches',
    title_si: 'වෙරළ තීරයන්',
    enabled: 1,
    sort_order: 2,
    default_open: 1,
    priority: 9,
    device_visibility: 'all',
  },
  {
    node_key: 'dest_folder_waterfalls',
    key: 'dest_folder_waterfalls',
    parent_key: 'page_destinations',
    parent_id: null,
    type: 'block',
    title_en: 'Scenic Waterfalls',
    title_si: 'දියඇලි',
    enabled: 1,
    sort_order: 3,
    default_open: 1,
    priority: 8,
    device_visibility: 'all',
  },
  {
    node_key: 'dest_folder_mountains',
    key: 'dest_folder_mountains',
    parent_key: 'page_destinations',
    parent_id: null,
    type: 'block',
    title_en: 'Mist-Covered Mountains',
    title_si: 'කඳුකරය',
    enabled: 1,
    sort_order: 4,
    default_open: 1,
    priority: 7,
    device_visibility: 'all',
  },
  {
    node_key: 'dest_folder_ancient',
    key: 'dest_folder_ancient',
    parent_key: 'page_destinations',
    parent_id: null,
    type: 'block',
    title_en: 'Ancient Sites & Kingdoms',
    title_si: 'පුරාවිද්‍යාත්මක ස්ථාන',
    enabled: 1,
    sort_order: 5,
    default_open: 1,
    priority: 6,
    device_visibility: 'all',
  },
  {
    node_key: 'dest_folder_wildlife',
    key: 'dest_folder_wildlife',
    parent_key: 'page_destinations',
    parent_id: null,
    type: 'block',
    title_en: 'Wildlife & Safari Parks',
    title_si: 'වනජීවී සහ ජාතික වනෝද්‍යාන',
    enabled: 1,
    sort_order: 6,
    default_open: 1,
    priority: 5,
    device_visibility: 'all',
  },
];

export async function getSiteNodes(includeDisabled = false): Promise<SiteNode[]> {
  try {
    let sql = 'SELECT * FROM site_nodes';
    if (!includeDisabled) {
      sql += ' WHERE enabled = 1';
    }
    sql += ' ORDER BY sort_order ASC, id ASC';

    const rows = await query<SiteNode>(sql);
    if (rows && rows.length > 0) {
      return rows;
    }

    // Auto-seed initial nodes if table is empty
    await seedDefaultNodes();
    const seeded = await query<SiteNode>(sql);
    return seeded && seeded.length > 0 ? seeded : (DEFAULT_SITE_NODES as unknown as SiteNode[]);
  } catch {
    return DEFAULT_SITE_NODES as unknown as SiteNode[];
  }
}

export async function getNodeByKey(key: string): Promise<SiteNode | null> {
  try {
    const node = await queryOne<SiteNode>('SELECT * FROM site_nodes WHERE node_key = ?', [key]);
    if (node) return node;
  } catch {
    // fallback
  }
  const fallback = DEFAULT_SITE_NODES.find((n) => n.node_key === key);
  return (fallback as unknown as SiteNode) || null;
}

export async function isNodeEnabled(key: string): Promise<boolean> {
  const node = await getNodeByKey(key);
  return node ? Boolean(node.enabled) : true;
}

export async function toggleNode(id: number, enabled: boolean): Promise<boolean> {
  const result = await execute('UPDATE site_nodes SET enabled = ? WHERE id = ?', [enabled ? 1 : 0, id]);
  return result.affectedRows > 0;
}

export async function updateNode(
  id: number,
  data: Partial<Pick<SiteNode, 'title_en' | 'title_si' | 'default_open' | 'priority' | 'device_visibility' | 'config'>>
): Promise<boolean> {
  const fields: string[] = [];
  const params: (string | number | null)[] = [];

  if (data.title_en !== undefined) {
    fields.push('title_en = ?');
    params.push(data.title_en);
  }
  if (data.title_si !== undefined) {
    fields.push('title_si = ?');
    params.push(data.title_si);
  }
  if (data.default_open !== undefined) {
    fields.push('default_open = ?');
    params.push(data.default_open);
  }
  if (data.priority !== undefined) {
    fields.push('priority = ?');
    params.push(data.priority);
  }
  if (data.device_visibility !== undefined) {
    fields.push('device_visibility = ?');
    params.push(data.device_visibility);
  }
  if (data.config !== undefined) {
    fields.push('config = ?');
    params.push(typeof data.config === 'string' ? data.config : JSON.stringify(data.config));
  }

  if (fields.length === 0) return false;

  params.push(id);
  const result = await execute(`UPDATE site_nodes SET ${fields.join(', ')} WHERE id = ?`, params);
  return result.affectedRows > 0;
}

export async function reorderNodes(orderedIds: number[]): Promise<boolean> {
  for (let index = 0; index < orderedIds.length; index++) {
    await execute('UPDATE site_nodes SET sort_order = ? WHERE id = ?', [index + 1, orderedIds[index]]);
  }
  return true;
}

export async function seedDefaultNodes(): Promise<void> {
  try {
    for (const item of DEFAULT_SITE_NODES) {
      await execute(
        `INSERT INTO site_nodes (parent_id, node_key, type, title_en, title_si, enabled, sort_order, default_open, priority, device_visibility, config)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE title_en = VALUES(title_en)`,
        [
          item.parent_id,
          item.node_key,
          item.type,
          item.title_en,
          item.title_si,
          item.enabled,
          item.sort_order,
          item.default_open,
          item.priority,
          item.device_visibility,
          null,
        ]
      );
    }
  } catch (err) {
    console.error('Seed default nodes error:', err);
  }
}

export async function resetNodesToDefault(): Promise<boolean> {
  await execute('DELETE FROM site_nodes');
  await seedDefaultNodes();
  return true;
}
