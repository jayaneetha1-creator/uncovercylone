/**
 * src/lib/db/locations.ts
 * Data access module for destinations, categories, and homepage slides.
 */

import { query, queryOne, execute, isMySqlEnabled } from '../db';
import { Place, HeroSlide, RegionSlide } from '@/types';

export interface PlaceFilterOptions {
  category?: string | null;
  search?: string | null;
  province?: string | null;
  featured?: boolean | null;
  status?: string | null;
  limit?: number;
  offset?: number;
  sortBy?: 'featured' | 'rating' | 'popular' | 'newest';
}

export async function getPlaces(options: PlaceFilterOptions = {}): Promise<Place[]> {
  const table = isMySqlEnabled() ? 'locations' : 'places';
  let sql = `SELECT * FROM ${table} WHERE 1=1`;
  const params: (string | number | boolean)[] = [];

  if (options.category && options.category !== 'All') {
    sql += ' AND category = ?';
    params.push(options.category);
  }

  if (options.province) {
    sql += ' AND province = ?';
    params.push(options.province);
  }

  if (options.search) {
    sql += ' AND (name LIKE ? OR location LIKE ? OR description LIKE ? OR province LIKE ?)';
    const s = `%${options.search}%`;
    params.push(s, s, s, s);
  }

  if (options.featured) {
    sql += ' AND featured = 1';
  }

  if (options.status && isMySqlEnabled()) {
    sql += ' AND status = ?';
    params.push(options.status);
  }

  // Sort logic
  if (options.sortBy === 'newest') {
    sql += ' ORDER BY created_at DESC';
  } else if (options.sortBy === 'popular') {
    sql += ' ORDER BY review_count DESC, rating DESC';
  } else {
    sql += ' ORDER BY featured DESC, rating DESC';
  }

  if (options.limit) {
    sql += ' LIMIT ?';
    params.push(options.limit);
    if (options.offset) {
      sql += ' OFFSET ?';
      params.push(options.offset);
    }
  }

  return query<Place>(sql, params);
}

export async function getPlaceById(id: number): Promise<Place | null> {
  const table = isMySqlEnabled() ? 'locations' : 'places';
  return queryOne<Place>(`SELECT * FROM ${table} WHERE id = ?`, [id]);
}

export async function createPlace(data: Partial<Place>): Promise<number> {
  const table = isMySqlEnabled() ? 'locations' : 'places';
  const result = await execute(
    `INSERT INTO ${table} (
      name, description, short_description, location, province, category, lat, lng,
      image_url, gallery, tips, best_time, entry_fee, distance_km, featured
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.name || '',
      data.description || '',
      data.short_description || '',
      data.location || '',
      data.province || '',
      data.category || 'General',
      data.lat || 0,
      data.lng || 0,
      data.image_url || '',
      typeof data.gallery === 'string' ? data.gallery : JSON.stringify(data.gallery || []),
      data.tips || '',
      data.best_time || '',
      data.entry_fee || 'Free',
      data.distance_km || 0,
      data.featured ? 1 : 0,
    ]
  );
  return result.insertId;
}

export async function updatePlace(id: number, data: Partial<Place>): Promise<boolean> {
  const table = isMySqlEnabled() ? 'locations' : 'places';
  const result = await execute(
    `UPDATE ${table} SET
      name = ?, description = ?, short_description = ?, location = ?, province = ?,
      category = ?, lat = ?, lng = ?, image_url = ?, gallery = ?, tips = ?,
      best_time = ?, entry_fee = ?, distance_km = ?, featured = ?
     WHERE id = ?`,
    [
      data.name,
      data.description,
      data.short_description || '',
      data.location,
      data.province || '',
      data.category,
      data.lat,
      data.lng,
      data.image_url || '',
      typeof data.gallery === 'string' ? data.gallery : JSON.stringify(data.gallery || []),
      data.tips || '',
      data.best_time || '',
      data.entry_fee || 'Free',
      data.distance_km || 0,
      data.featured ? 1 : 0,
      id,
    ]
  );
  return result.affectedRows > 0;
}

export async function deletePlace(id: number): Promise<boolean> {
  const table = isMySqlEnabled() ? 'locations' : 'places';
  const result = await execute(`DELETE FROM ${table} WHERE id = ?`, [id]);
  return result.affectedRows > 0;
}

// -------------------------------------------------------------
// Slides & Media
// -------------------------------------------------------------

export async function getHeroSlides(): Promise<HeroSlide[]> {
  return query<HeroSlide>('SELECT * FROM hero_slides ORDER BY sort_order ASC, id ASC');
}

export async function createHeroSlide(data: Partial<HeroSlide>): Promise<number> {
  const result = await execute(
    'INSERT INTO hero_slides (image_url, location, province, sort_order) VALUES (?, ?, ?, ?)',
    [data.image_url || '', data.location || '', data.province || '', data.sort_order || 0]
  );
  return result.insertId;
}

export async function deleteHeroSlide(id: number): Promise<boolean> {
  const result = await execute('DELETE FROM hero_slides WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

export async function getRegionSlides(): Promise<RegionSlide[]> {
  return query<RegionSlide>('SELECT * FROM region_slides ORDER BY sort_order ASC, id ASC');
}

export async function createRegionSlide(data: Partial<RegionSlide>): Promise<number> {
  const result = await execute(
    'INSERT INTO region_slides (image_url, title, region, sort_order) VALUES (?, ?, ?, ?)',
    [data.image_url || '', data.title || '', data.region || '', data.sort_order || 0]
  );
  return result.insertId;
}

export async function deleteRegionSlide(id: number): Promise<boolean> {
  const result = await execute('DELETE FROM region_slides WHERE id = ?', [id]);
  return result.affectedRows > 0;
}
