/**
 * src/lib/db/about.ts
 * Data access module for Phase 12: About Page Rebuild.
 * Provides configurable block architecture, persistence in site_nodes,
 * thoughtful founder village story placeholder, and Serandib Co. credits.
 */

import { query, queryOne, execute, isMySqlEnabled } from '../db';
import { SiteNode } from '@/types';
import {
  AboutPageData,
  DEFAULT_ABOUT_DATA,
  DEFAULT_ABOUT_HERO,
  DEFAULT_ABOUT_STORY,
  DEFAULT_ABOUT_PHOTOS,
  DEFAULT_ABOUT_VALUES,
  DEFAULT_ABOUT_TEAM,
  DEFAULT_ABOUT_CONTACT,
} from '@/lib/about/constants';

export * from '@/lib/about/constants';

/**
 * Fetch all About Page blocks from site_nodes, merging with default configurations.
 */
export async function getAboutContent(): Promise<AboutPageData> {
  const blocks: AboutPageData = { ...DEFAULT_ABOUT_DATA };

  try {
    const rows = await query<{ node_key: string; config: string | null }>(
      `SELECT node_key, config FROM site_nodes WHERE node_key IN (
        'about_hero', 'about_story', 'about_photos', 'about_values', 'about_team', 'about_contact'
      )`
    );

    if (!rows || rows.length === 0) {
      return blocks;
    }

    for (const row of rows) {
      if (!row.config) continue;
      try {
        const parsed = JSON.parse(row.config);
        if (row.node_key === 'about_hero') {
          blocks.hero = { ...DEFAULT_ABOUT_HERO, ...parsed };
        } else if (row.node_key === 'about_story') {
          blocks.story = { ...DEFAULT_ABOUT_STORY, ...parsed };
        } else if (row.node_key === 'about_photos') {
          blocks.photos = { ...DEFAULT_ABOUT_PHOTOS, ...parsed };
        } else if (row.node_key === 'about_values') {
          blocks.values = { ...DEFAULT_ABOUT_VALUES, ...parsed };
        } else if (row.node_key === 'about_team') {
          blocks.team = { ...DEFAULT_ABOUT_TEAM, ...parsed };
        } else if (row.node_key === 'about_contact') {
          blocks.contact = { ...DEFAULT_ABOUT_CONTACT, ...parsed };
        }
      } catch (err) {
        console.error(`Failed to parse config for ${row.node_key}:`, err);
      }
    }
  } catch (error) {
    console.error('Error fetching about content:', error);
  }

  return blocks;
}

/**
 * Save configuration for a specific about block into site_nodes.
 */
export async function saveAboutBlock(
  blockKey: 'about_hero' | 'about_story' | 'about_photos' | 'about_values' | 'about_team' | 'about_contact',
  config: unknown
): Promise<boolean> {
  try {
    const configStr = typeof config === 'string' ? config : JSON.stringify(config);
    const existing = await queryOne<SiteNode>('SELECT id FROM site_nodes WHERE node_key = ?', [blockKey]);

    if (existing) {
      const result = await execute('UPDATE site_nodes SET config = ? WHERE node_key = ?', [configStr, blockKey]);
      return result.affectedRows > 0;
    } else {
      // Find parent page_about ID
      const parent = await queryOne<SiteNode>('SELECT id FROM site_nodes WHERE node_key = ?', ['page_about']);
      const parentId = parent ? parent.id : null;
      const titleEn = blockKey.replace('about_', 'About ').replace(/^./, (c) => c.toUpperCase());

      const isMysql = isMySqlEnabled();
      const insertSql = isMysql
        ? `INSERT INTO site_nodes (parent_id, node_key, type, title_en, title_si, enabled, sort_order, default_open, priority, device_visibility, config)
           VALUES (?, ?, 'block', ?, '', 1, 1, 1, 5, 'all', ?)
           ON DUPLICATE KEY UPDATE config = VALUES(config)`
        : `INSERT INTO site_nodes (parent_id, node_key, type, title_en, title_si, enabled, sort_order, default_open, priority, device_visibility, config)
           VALUES (?, ?, 'block', ?, '', 1, 1, 1, 5, 'all', ?)
           ON CONFLICT(node_key) DO UPDATE SET config = excluded.config`;

      const result = await execute(insertSql, [parentId, blockKey, titleEn, configStr]);
      return result.affectedRows > 0;
    }
  } catch (error) {
    console.error(`Error saving about block ${blockKey}:`, error);
    return false;
  }
}

/**
 * Save all about blocks at once.
 */
export async function saveAllAboutBlocks(blocks: Partial<AboutPageData>): Promise<boolean> {
  let allSuccess = true;
  if (blocks.hero) {
    const ok = await saveAboutBlock('about_hero', blocks.hero);
    if (!ok) allSuccess = false;
  }
  if (blocks.story) {
    const ok = await saveAboutBlock('about_story', blocks.story);
    if (!ok) allSuccess = false;
  }
  if (blocks.photos) {
    const ok = await saveAboutBlock('about_photos', blocks.photos);
    if (!ok) allSuccess = false;
  }
  if (blocks.values) {
    const ok = await saveAboutBlock('about_values', blocks.values);
    if (!ok) allSuccess = false;
  }
  if (blocks.team) {
    const ok = await saveAboutBlock('about_team', blocks.team);
    if (!ok) allSuccess = false;
  }
  if (blocks.contact) {
    const ok = await saveAboutBlock('about_contact', blocks.contact);
    if (!ok) allSuccess = false;
  }
  return allSuccess;
}
