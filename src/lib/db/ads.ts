/**
 * src/lib/db/ads.ts
 * Data access and management layer for non-disruptive ads and sponsor placements.
 * Supports 5 specific placements, impression/click counting, master kill switch,
 * and zero-gap unmounting.
 */

import { query, queryOne, execute, isMySqlEnabled } from '../db';
import { Ad } from '@/types';

export interface AdSettings {
  masterEnabled: boolean;
  gridCardEnabled: boolean;
  homeBannerEnabled: boolean;
  sidebarPartnerEnabled: boolean;
  carouselSlotEnabled: boolean;
  footerStripEnabled: boolean;
  adsenseEnabled: boolean;
  adsenseClientId: string;
}

const DEFAULT_SETTINGS: AdSettings = {
  masterEnabled: true,
  gridCardEnabled: true,
  homeBannerEnabled: true,
  sidebarPartnerEnabled: true,
  carouselSlotEnabled: true,
  footerStripEnabled: true,
  adsenseEnabled: false,
  adsenseClientId: '',
};

/**
 * Fetch ad settings from site_settings table.
 */
export async function getAdSettings(): Promise<AdSettings> {
  try {
    const rows = await query<{ key: string; value: string }>(
      "SELECT key, value FROM site_settings WHERE key LIKE 'ads_%' OR key LIKE 'adsense_%'"
    );

    const map: Record<string, string> = {};
    for (const r of rows) {
      map[r.key] = r.value;
    }

    return {
      masterEnabled: map['ads_master_enabled'] !== '0',
      gridCardEnabled: map['ads_placement_grid_card'] !== '0',
      homeBannerEnabled: map['ads_placement_home_banner'] !== '0',
      sidebarPartnerEnabled: map['ads_placement_sidebar_partner'] !== '0',
      carouselSlotEnabled: map['ads_placement_carousel_slot'] !== '0',
      footerStripEnabled: map['ads_placement_footer_strip'] !== '0',
      adsenseEnabled: map['adsense_enabled'] === '1',
      adsenseClientId: map['adsense_client_id'] || '',
    };
  } catch (error) {
    console.error('Error fetching ad settings:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Update ad settings in site_settings table.
 */
export async function updateAdSettings(settings: Partial<AdSettings>): Promise<boolean> {
  try {
    const isMysql = isMySqlEnabled();
    const pairs: Array<{ key: string; val: string }> = [];

    if (settings.masterEnabled !== undefined) {
      pairs.push({ key: 'ads_master_enabled', val: settings.masterEnabled ? '1' : '0' });
    }
    if (settings.gridCardEnabled !== undefined) {
      pairs.push({ key: 'ads_placement_grid_card', val: settings.gridCardEnabled ? '1' : '0' });
    }
    if (settings.homeBannerEnabled !== undefined) {
      pairs.push({ key: 'ads_placement_home_banner', val: settings.homeBannerEnabled ? '1' : '0' });
    }
    if (settings.sidebarPartnerEnabled !== undefined) {
      pairs.push({ key: 'ads_placement_sidebar_partner', val: settings.sidebarPartnerEnabled ? '1' : '0' });
    }
    if (settings.carouselSlotEnabled !== undefined) {
      pairs.push({ key: 'ads_placement_carousel_slot', val: settings.carouselSlotEnabled ? '1' : '0' });
    }
    if (settings.footerStripEnabled !== undefined) {
      pairs.push({ key: 'ads_placement_footer_strip', val: settings.footerStripEnabled ? '1' : '0' });
    }
    if (settings.adsenseEnabled !== undefined) {
      pairs.push({ key: 'adsense_enabled', val: settings.adsenseEnabled ? '1' : '0' });
    }
    if (settings.adsenseClientId !== undefined) {
      pairs.push({ key: 'adsense_client_id', val: settings.adsenseClientId });
    }

    for (const p of pairs) {
      if (isMysql) {
        await execute(
          'INSERT INTO site_settings (key_name, value_text) VALUES (?, ?) ON DUPLICATE KEY UPDATE value_text = VALUES(value_text)',
          [p.key, p.val]
        );
      } else {
        await execute(
          'INSERT INTO site_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
          [p.key, p.val]
        );
      }
    }

    return true;
  } catch (error) {
    console.error('Error updating ad settings:', error);
    return false;
  }
}

/**
 * Fetch ads with optional placement and device targeting filters.
 */
export async function getAds(options?: {
  placement?: string;
  activeOnly?: boolean;
  device?: string;
}): Promise<Ad[]> {
  try {
    let sql = 'SELECT * FROM ads WHERE 1=1';
    const params: (string | number)[] = [];

    if (options?.placement) {
      sql += ' AND placement = ?';
      params.push(options.placement);
    }

    if (options?.activeOnly) {
      sql += ' AND enabled = 1';
      // start_date is null or in the past
      // end_date is null or in the future
      sql += " AND (start_date IS NULL OR start_date <= datetime('now'))";
      sql += " AND (end_date IS NULL OR end_date >= datetime('now'))";
    }

    if (options?.device && options.device !== 'all') {
      sql += ' AND (device_target = ? OR device_target = "all")';
      params.push(options.device);
    }

    sql += ' ORDER BY created_at DESC';

    const rows = await query<Ad>(sql, params);
    if (rows && rows.length > 0) {
      return rows;
    }

    // Auto-seed initial partner ads if table is empty
    const countRow = await queryOne<{ c: number }>('SELECT count(*) as c FROM ads');
    if (!countRow || countRow.c === 0) {
      await seedSampleAds();
      return await query<Ad>(sql, params);
    }

    return [];
  } catch (error) {
    console.error('Error fetching ads:', error);
    return [];
  }
}

/**
 * Fetch ad by ID.
 */
export async function getAdById(id: number): Promise<Ad | null> {
  try {
    return await queryOne<Ad>('SELECT * FROM ads WHERE id = ?', [id]);
  } catch {
    return null;
  }
}

/**
 * Create a new advertisement.
 */
export async function createAd(data: Partial<Ad>): Promise<number | null> {
  try {
    const res = await execute(
      `INSERT INTO ads (placement, title_en, title_si, description, image_url, target_url, start_date, end_date, device_target, enabled)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.placement,
        data.title_en || 'Partner Announcement',
        data.title_si || '',
        data.description || '',
        data.image_url || '',
        data.target_url || '#',
        data.start_date || null,
        data.end_date || null,
        data.device_target || 'all',
        data.enabled !== undefined ? data.enabled : 1,
      ]
    );
    return res.insertId;
  } catch (error) {
    console.error('Error creating ad:', error);
    return null;
  }
}

/**
 * Update an existing advertisement.
 */
export async function updateAd(id: number, data: Partial<Ad>): Promise<boolean> {
  try {
    const fields: string[] = [];
    const params: (string | number | null)[] = [];

    if (data.placement !== undefined) {
      fields.push('placement = ?');
      params.push(data.placement);
    }
    if (data.title_en !== undefined) {
      fields.push('title_en = ?');
      params.push(data.title_en);
    }
    if (data.title_si !== undefined) {
      fields.push('title_si = ?');
      params.push(data.title_si);
    }
    if (data.description !== undefined) {
      fields.push('description = ?');
      params.push(data.description);
    }
    if (data.image_url !== undefined) {
      fields.push('image_url = ?');
      params.push(data.image_url);
    }
    if (data.target_url !== undefined) {
      fields.push('target_url = ?');
      params.push(data.target_url);
    }
    if (data.start_date !== undefined) {
      fields.push('start_date = ?');
      params.push(data.start_date);
    }
    if (data.end_date !== undefined) {
      fields.push('end_date = ?');
      params.push(data.end_date);
    }
    if (data.device_target !== undefined) {
      fields.push('device_target = ?');
      params.push(data.device_target);
    }
    if (data.enabled !== undefined) {
      fields.push('enabled = ?');
      params.push(data.enabled);
    }

    if (fields.length === 0) return false;

    params.push(id);
    const res = await execute(`UPDATE ads SET ${fields.join(', ')} WHERE id = ?`, params);
    return res.affectedRows > 0;
  } catch (error) {
    console.error('Error updating ad:', error);
    return false;
  }
}

/**
 * Delete an advertisement.
 */
export async function deleteAd(id: number): Promise<boolean> {
  try {
    const res = await execute('DELETE FROM ads WHERE id = ?', [id]);
    return res.affectedRows > 0;
  } catch (error) {
    console.error('Error deleting ad:', error);
    return false;
  }
}

/**
 * Increment ad impressions count.
 */
export async function recordAdImpression(id: number): Promise<void> {
  try {
    await execute('UPDATE ads SET impressions = impressions + 1 WHERE id = ?', [id]);
  } catch (error) {
    console.error('Error recording ad impression:', error);
  }
}

/**
 * Increment ad click count.
 */
export async function recordAdClick(id: number): Promise<void> {
  try {
    await execute('UPDATE ads SET clicks = clicks + 1 WHERE id = ?', [id]);
  } catch (error) {
    console.error('Error recording ad click:', error);
  }
}

/**
 * Initial curated sample partner ads.
 */
export async function seedSampleAds(): Promise<void> {
  try {
    const sampleAds: Array<Omit<Ad, 'id' | 'impressions' | 'clicks' | 'created_at'>> = [
      {
        placement: 'home_banner',
        title_en: 'Scenic Kandy to Ella Express Train Reservations',
        title_si: 'මහනුවර සිට ඇල්ල දක්වා දුම්රිය ආසන වෙන්කරවා ගැනීම',
        description: 'Reserve panoramic observation car window seats on the world-famous Highland rail route with trusted verified station dispatchers.',
        image_url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=80',
        target_url: 'https://www.railway.gov.lk',
        device_target: 'all',
        enabled: 1,
        start_date: null,
        end_date: null,
      },
      {
        placement: 'grid_card',
        title_en: 'Sigiriya Sunrise Hot Air Balloon Flights',
        title_si: 'සීගිරිය අහස් බැලූන් සංචාර',
        description: 'Float serenely over the 5th-century fortress, pristine jungle canopy, and waking wildlife lakes as the tropical sun rises.',
        image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
        target_url: 'https://www.srilanka.travel',
        device_target: 'all',
        enabled: 1,
        start_date: null,
        end_date: null,
      },
      {
        placement: 'sidebar_partner',
        title_en: 'Nuwara Eliya Heritage Tea Tasting & Estate Lodging',
        title_si: 'නුවරඑළිය තේ වතු නවාතැන්',
        description: 'Stay in restored colonial planter bungalows amidst emerald rolling hills. Guided plucking, processing, and cupping masterclasses.',
        image_url: 'https://images.unsplash.com/photo-1576706374778-95a95efff7b1?w=800&q=80',
        target_url: 'https://www.pureceylontea.com',
        device_target: 'all',
        enabled: 1,
        start_date: null,
        end_date: null,
      },
      {
        placement: 'carousel_slot',
        title_en: 'Ethical Blue Whale Watching Catamaran Safaris',
        title_si: 'මිරිස්ස තල්මසුන් නැරඹීම',
        description: 'Eco-certified marine safaris from Mirissa Harbour accompanied by resident marine biologists. Safe observation distances.',
        image_url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80',
        target_url: 'https://www.srilanka.travel',
        device_target: 'all',
        enabled: 1,
        start_date: null,
        end_date: null,
      },
      {
        placement: 'footer_strip',
        title_en: 'Official Tourism & Heritage Partners',
        title_si: 'නිල සංචාරක හවුල්කරුවන්',
        description: 'Sri Lanka Tourism Development Authority (SLTDA) • Ceylon Tea Board • Department of Wildlife Conservation',
        image_url: '',
        target_url: 'https://www.srilanka.travel',
        device_target: 'all',
        enabled: 1,
        start_date: null,
        end_date: null,
      },
    ];

    for (const ad of sampleAds) {
      await createAd(ad);
    }
  } catch (error) {
    console.error('Error seeding sample ads:', error);
  }
}
