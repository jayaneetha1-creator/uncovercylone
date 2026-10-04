/**
 * src/lib/db/nodes.ts
 * Data access module for Folder Manager (Site Tree / site_nodes).
 */

import { query, queryOne, execute, isMySqlEnabled } from '../db';
import { SiteNode } from '@/types';

// Default static fallback nodes if database is empty or during initial boot
const DEFAULT_NODES: SiteNode[] = [
  {
    id: 1,
    parent_id: null,
    node_key: 'page_home',
    type: 'page',
    title_en: 'Home',
    title_si: 'මුල් පිටුව',
    enabled: 1,
    sort_order: 1,
    default_open: 1,
    priority: 10,
    device_visibility: 'all',
  },
  {
    id: 2,
    parent_id: null,
    node_key: 'page_destinations',
    type: 'page',
    title_en: 'Destinations',
    title_si: 'ගමනාන්ත',
    enabled: 1,
    sort_order: 2,
    default_open: 1,
    priority: 9,
    device_visibility: 'all',
  },
  {
    id: 3,
    parent_id: null,
    node_key: 'page_map',
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
    id: 4,
    parent_id: null,
    node_key: 'page_trips',
    type: 'page',
    title_en: 'My Trips',
    title_si: 'මගේ චාරිකා',
    enabled: 1,
    sort_order: 4,
    default_open: 1,
    priority: 7,
    device_visibility: 'all',
  },
  {
    id: 5,
    parent_id: null,
    node_key: 'page_news',
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
    id: 6,
    parent_id: null,
    node_key: 'page_about',
    type: 'page',
    title_en: 'About Us',
    title_si: 'අප ගැන',
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
    if (rows.length === 0) {
      return DEFAULT_NODES.filter((n) => includeDisabled || n.enabled === 1);
    }
    return rows;
  } catch {
    return DEFAULT_NODES.filter((n) => includeDisabled || n.enabled === 1);
  }
}

export async function getNodeByKey(key: string): Promise<SiteNode | null> {
  try {
    const node = await queryOne<SiteNode>('SELECT * FROM site_nodes WHERE node_key = ?', [key]);
    if (node) return node;
  } catch {
    // fallback
  }
  return DEFAULT_NODES.find((n) => n.node_key === key) || null;
}

export async function isNodeEnabled(key: string): Promise<boolean> {
  const node = await getNodeByKey(key);
  return node ? Boolean(node.enabled) : true;
}

export async function toggleNode(id: number, enabled: boolean): Promise<boolean> {
  if (!isMySqlEnabled()) return true;
  const result = await execute('UPDATE site_nodes SET enabled = ? WHERE id = ?', [enabled ? 1 : 0, id]);
  return result.affectedRows > 0;
}

export async function updateNode(
  id: number,
  data: Partial<Pick<SiteNode, 'title_en' | 'title_si' | 'default_open' | 'priority' | 'device_visibility' | 'config'>>
): Promise<boolean> {
  if (!isMySqlEnabled()) return true;
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
